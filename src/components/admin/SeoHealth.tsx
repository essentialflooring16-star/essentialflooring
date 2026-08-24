import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * The site is static and this panel runs in the browser, so there is no filesystem to
 * read. Instead the panel crawls the live site over HTTP from the same origin, which is
 * also the most honest check: it sees exactly what Google would download.
 */

const SETTINGS_KEY = 'seo_last_scan';
const CONCURRENCY = 4;
const MAX_PAGES = 200;

const TITLE_MIN = 30;
const TITLE_MAX = 65;
const DESC_MIN = 70;
const DESC_MAX = 160;
const MIN_WORDS = 300;
const MIN_INTERNAL_LINKS = 3;

type Severity = 'error' | 'warning';

type Finding = {
  /** Short chip label, e.g. "Title". Keeps the long sentence readable. */
  check: string;
  severity: Severity;
  message: string;
};

type PageResult = {
  path: string;
  title: string | null;
  description: string | null;
  words: number;
  internalLinks: number;
  findings: Finding[];
  loaded: boolean;
};

type LastScan = {
  at: string;
  pages: number;
  errors: number;
  warnings: number;
};

/* ---------------------------------------------------------------- helpers */

/** Trailing slashes and index.html are the same page, so compare normalized paths. */
function normalizePath(path: string): string {
  let out = path.replace(/index\.html$/i, '');
  if (out.length > 1 && out.endsWith('/')) out = out.slice(0, -1);
  return out || '/';
}

function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

/** "title, description and image" reads like a person wrote it, a bare join does not. */
function listJoin(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function shorten(text: string, max = 46): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}...` : clean;
}

function fileNameOf(src: string): string {
  const stripped = src.split('?')[0].split('#')[0];
  return stripped.split('/').pop() || stripped;
}

function metaContent(doc: Document, selector: string): string | null {
  const el = doc.querySelector(selector);
  const value = el?.getAttribute('content')?.trim();
  return value ? value : null;
}

/**
 * Site chrome (main nav, footer, breadcrumbs) repeats on every page, so counting it
 * would make every page look content rich and well linked. Strip it first.
 */
function contentScope(doc: Document): HTMLElement {
  const scope = (doc.querySelector('main') ?? doc.body) as HTMLElement;
  const clone = scope.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('script, style, noscript, template, svg, nav, header, footer').forEach((node) => {
    node.remove();
  });
  return clone;
}

function countWords(el: HTMLElement): number {
  const text = el.textContent ?? '';
  return text
    .split(/\s+/)
    .filter((word) => /[a-z0-9]/i.test(word)).length;
}

/* ------------------------------------------------------------ the sitemap */

/**
 * Follows /sitemap-index.xml to the sitemap files it lists. Falls back to the plain
 * sitemap names in case the build ever stops emitting an index.
 */
async function collectPaths(
  signal: AbortSignal,
): Promise<{ paths: string[]; siteOrigin: string | null }> {
  const seen = new Set<string>();
  const paths: string[] = [];
  let siteOrigin: string | null = null;

  async function readSitemap(url: string, depth: number): Promise<boolean> {
    if (depth > 2) return true;
    const res = await fetch(url, { signal, cache: 'no-store' });
    if (!res.ok) return false;
    const doc = new DOMParser().parseFromString(await res.text(), 'application/xml');
    if (doc.querySelector('parsererror')) return false;

    // getElementsByTagNameNS ignores the sitemap namespace prefix, whatever it is.
    const locs = Array.from(doc.getElementsByTagNameNS('*', 'loc'))
      .map((node) => node.textContent?.trim() ?? '')
      .filter(Boolean);
    if (locs.length === 0) return false;

    const isIndex = doc.documentElement.localName === 'sitemapindex';
    for (const loc of locs) {
      let parsed: URL;
      try {
        parsed = new URL(loc);
      } catch {
        continue;
      }
      if (isIndex) {
        // Fetch the child sitemap from our own origin so there is never a CORS problem.
        await readSitemap(parsed.pathname + parsed.search, depth + 1);
        continue;
      }
      if (!siteOrigin) siteOrigin = parsed.origin;
      const path = normalizePath(parsed.pathname);
      if (seen.has(path) || paths.length >= MAX_PAGES) continue;
      seen.add(path);
      paths.push(path);
    }
    return true;
  }

  for (const candidate of ['/sitemap-index.xml', '/sitemap-0.xml', '/sitemap.xml']) {
    const ok = await readSitemap(candidate, 0);
    if (ok && paths.length > 0) break;
  }

  paths.sort();
  return { paths, siteOrigin };
}

/* -------------------------------------------------------- the page checks */

function auditDocument(doc: Document, path: string, siteOrigin: string | null): PageResult {
  const findings: Finding[] = [];
  const add = (check: string, severity: Severity, message: string) =>
    findings.push({ check, severity, message });

  /* Title */
  const title = doc.querySelector('title')?.textContent?.trim() || null;
  if (!title) {
    add(
      'Title',
      'error',
      'This page has no title tag, so Google invents one from the page text. Add a title of 30 to 65 characters naming the service and the city.',
    );
  } else if (title.length > TITLE_MAX) {
    add(
      'Title',
      'warning',
      `Title is ${title.length} characters, so Google will cut it off in the results. Shorten it to under ${TITLE_MAX}.`,
    );
  } else if (title.length < TITLE_MIN) {
    add(
      'Title',
      'warning',
      `Title is only ${title.length} characters and wastes the space Google gives you. Expand it to at least ${TITLE_MIN} by adding the service and the city.`,
    );
  }

  /* Meta description */
  const description = metaContent(doc, 'meta[name="description"]');
  if (!description) {
    add(
      'Meta description',
      'error',
      'There is no meta description, so Google picks a random sentence from the page to show. Write one of 70 to 160 characters saying what you do and where.',
    );
  } else if (description.length > DESC_MAX) {
    add(
      'Meta description',
      'warning',
      `Meta description is ${description.length} characters, so the ending gets cut off in the results. Trim it to ${DESC_MAX} or fewer.`,
    );
  } else if (description.length < DESC_MIN) {
    add(
      'Meta description',
      'warning',
      `Meta description is only ${description.length} characters. Use the room you get, aim for ${DESC_MIN} to ${DESC_MAX}.`,
    );
  }

  /* Headings */
  const headings = Array.from(doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const h1s = headings.filter((h) => h.tagName === 'H1');
  if (h1s.length === 0) {
    add(
      'Heading',
      'error',
      'This page has no H1 heading, so search engines cannot tell what it is about. Give it one H1 naming the service and the area.',
    );
  } else if (h1s.length > 1) {
    add(
      'Heading',
      'error',
      `This page has ${h1s.length} H1 headings competing with each other. Keep one H1 and turn the others into H2s.`,
    );
  }

  let previousLevel = 0;
  const jumps: string[] = [];
  for (const heading of headings) {
    const level = Number(heading.tagName.slice(1));
    if (previousLevel > 0 && level > previousLevel + 1) {
      jumps.push(`H${previousLevel} straight to H${level} at "${shorten(heading.textContent ?? '')}"`);
    }
    previousLevel = level;
  }
  if (jumps.length > 0) {
    add(
      'Heading',
      'warning',
      `Heading levels skip a step: ${jumps[0]}. Step down one level at a time so the page structure reads correctly.${
        jumps.length > 1 ? ` There ${plural(jumps.length - 1, 'is 1 more skip', `are ${jumps.length - 1} more skips`)} like this further down.` : ''
      }`,
    );
  }

  /* Image alt text */
  const images = Array.from(doc.querySelectorAll('img'));
  const missingAlt = images.filter((img) => {
    const alt = img.getAttribute('alt');
    if (alt === null) return true;
    if (alt.trim() !== '') return false;
    // An empty alt is correct when the image is explicitly marked decorative.
    const decorative =
      img.getAttribute('aria-hidden') === 'true' ||
      img.getAttribute('role') === 'presentation' ||
      img.closest('[aria-hidden="true"]') !== null;
    return !decorative;
  });
  if (missingAlt.length > 0) {
    const examples = missingAlt
      .slice(0, 3)
      .map((img) => fileNameOf(img.getAttribute('src') || 'unnamed image'))
      .join(', ');
    add(
      'Images',
      'error',
      `${missingAlt.length} ${plural(missingAlt.length, 'image has', 'images have')} no alt text (${examples}${
        missingAlt.length > 3 ? ', and more' : ''
      }). Describe each one in a few words, or if it is pure decoration set alt="" together with aria-hidden="true".`,
    );
  }

  /* Canonical */
  const canonicalHref = doc.querySelector('link[rel="canonical"]')?.getAttribute('href')?.trim();
  if (!canonicalHref) {
    add(
      'Canonical',
      'error',
      'There is no canonical tag, so slightly different addresses for this page can split its ranking. Add one pointing at this page itself.',
    );
  } else {
    let canonicalPath: string | null = null;
    try {
      canonicalPath = normalizePath(new URL(canonicalHref, window.location.origin).pathname);
    } catch {
      canonicalPath = null;
    }
    // Only the path is compared: the built pages carry the production domain even when
    // the admin is opened on a preview or local address, and that is not a real problem.
    if (!canonicalPath) {
      add(
        'Canonical',
        'error',
        `The canonical tag is not a valid address (${shorten(canonicalHref)}). Point it at this page's own full address.`,
      );
    } else if (canonicalPath !== path) {
      add(
        'Canonical',
        'error',
        `The canonical tag points at ${canonicalPath}, not at this page. Search engines will index that other page instead. Point it at ${path}.`,
      );
    }
  }

  /* Structured data */
  const ldBlocks = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
  if (ldBlocks.length === 0) {
    add(
      'Structured data',
      'warning',
      'No structured data on this page. Add a JSON-LD block (LocalBusiness, Service or FAQPage) so Google can show stars, hours and answers next to the listing.',
    );
  } else {
    const broken = ldBlocks.filter((block) => {
      try {
        JSON.parse(block.textContent ?? '');
        return false;
      } catch {
        return true;
      }
    });
    if (broken.length > 0) {
      const which =
        ldBlocks.length === 1
          ? 'The structured data block on this page is'
          : `${broken.length} of the ${ldBlocks.length} structured data blocks ${plural(broken.length, 'is', 'are')}`;
      add(
        'Structured data',
        'error',
        `${which} not valid JSON, so Google throws ${plural(broken.length, 'it', 'them')} away and shows no rich result. Fix the JSON-LD markup on this page.`,
      );
    }
  }

  /* Open Graph */
  const missingOg: string[] = [];
  if (!metaContent(doc, 'meta[property="og:title"]')) missingOg.push('title');
  if (!metaContent(doc, 'meta[property="og:description"]')) missingOg.push('description');
  if (!metaContent(doc, 'meta[property="og:image"]')) missingOg.push('image');
  if (missingOg.length > 0) {
    add(
      'Social preview',
      'warning',
      `The Open Graph ${listJoin(missingOg)} ${plural(missingOg.length, 'tag is', 'tags are')} missing, so this page looks bare when someone shares it on Facebook or by text message. Add og:title, og:description and og:image so the link shows a headline and a photo.`,
    );
  }

  /* Word count */
  const scope = contentScope(doc);
  const words = countWords(scope);
  if (words < MIN_WORDS) {
    add(
      'Thin content',
      'warning',
      `Only ${words} words of real content. Thin pages rarely rank for anything. Aim for at least ${MIN_WORDS} words that answer the questions customers actually ask.`,
    );
  }

  /* Internal links */
  const internal = new Set<string>();
  for (const anchor of Array.from(scope.querySelectorAll('a[href]'))) {
    const href = anchor.getAttribute('href') ?? '';
    if (!href || href.startsWith('#') || /^(mailto|tel|sms|javascript):/i.test(href)) continue;
    let target: URL;
    try {
      target = new URL(href, window.location.origin + path);
    } catch {
      continue;
    }
    const sameSite = target.origin === window.location.origin || target.origin === siteOrigin;
    if (!sameSite) continue;
    const targetPath = normalizePath(target.pathname);
    if (targetPath === path) continue;
    internal.add(targetPath);
  }
  if (internal.size < MIN_INTERNAL_LINKS) {
    add(
      'Internal links',
      'warning',
      `${internal.size === 0 ? 'No links' : `Only ${internal.size} ${plural(internal.size, 'link', 'links')}`} from the content here to other pages of the site. Add at least ${MIN_INTERNAL_LINKS} links to related services or nearby city pages so this page is not stranded.`,
    );
  }

  return {
    path,
    title,
    description,
    words,
    internalLinks: internal.size,
    findings,
    loaded: true,
  };
}

async function auditPath(
  path: string,
  siteOrigin: string | null,
  signal: AbortSignal,
): Promise<PageResult> {
  // no-store so a re-run after a redeploy checks the new HTML, not a cached copy.
  const res = await fetch(path, { signal, cache: 'no-store', headers: { Accept: 'text/html' } });
  if (!res.ok) {
    return {
      path,
      title: null,
      description: null,
      words: 0,
      internalLinks: 0,
      loaded: false,
      findings: [
        {
          check: 'Page',
          severity: 'error',
          message: `This page did not load during the scan (server answered ${res.status}), so nothing on it could be checked. Open it yourself to see whether it is broken.`,
        },
      ],
    };
  }
  const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
  return auditDocument(doc, path, siteOrigin);
}

/** Duplicate titles and descriptions only exist across pages, so this runs at the end. */
function addDuplicateFindings(results: PageResult[]): PageResult[] {
  const byTitle = new Map<string, string[]>();
  const byDescription = new Map<string, string[]>();

  for (const result of results) {
    if (result.title) {
      const key = result.title.trim().toLowerCase();
      byTitle.set(key, [...(byTitle.get(key) ?? []), result.path]);
    }
    if (result.description) {
      const key = result.description.trim().toLowerCase();
      byDescription.set(key, [...(byDescription.get(key) ?? []), result.path]);
    }
  }

  const others = (paths: string[], self: string) => {
    const rest = paths.filter((p) => p !== self);
    const shown = rest.slice(0, 2).join(' and ');
    return rest.length > 2 ? `${shown} and ${rest.length - 2} more` : shown;
  };

  return results.map((result) => {
    const extra: Finding[] = [];
    const titleGroup = result.title ? byTitle.get(result.title.trim().toLowerCase()) ?? [] : [];
    if (titleGroup.length > 1) {
      extra.push({
        check: 'Duplicate title',
        severity: 'error',
        message: `This page has exactly the same title as ${others(titleGroup, result.path)}. Duplicate titles make your own pages compete with each other. Give each page a title of its own, usually by naming its city or service.`,
      });
    }
    const descGroup = result.description
      ? byDescription.get(result.description.trim().toLowerCase()) ?? []
      : [];
    if (descGroup.length > 1) {
      extra.push({
        check: 'Duplicate description',
        severity: 'error',
        message: `The meta description is identical to the one on ${others(descGroup, result.path)}. Rewrite each one so it describes that page in particular.`,
      });
    }
    return extra.length > 0 ? { ...result, findings: [...result.findings, ...extra] } : result;
  });
}

function countBySeverity(results: PageResult[], severity: Severity): number {
  return results.reduce(
    (sum, r) => sum + r.findings.filter((f) => f.severity === severity).length,
    0,
  );
}

/* --------------------------------------------------------------- the view */

export default function SeoHealth() {
  const [results, setResults] = useState<PageResult[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<LastScan | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (err) {
          console.error(err);
          return;
        }
        const raw = (data as { value: string } | null)?.value;
        if (!raw) return;
        try {
          setLastScan(JSON.parse(raw) as LastScan);
        } catch (parseErr) {
          console.error(parseErr);
        }
      });
  }, []);

  // Stop an in-flight crawl if the admin switches tabs or signs out.
  useEffect(() => () => abortRef.current?.abort(), []);

  const runScan = useCallback(async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    setScanning(true);
    setError(null);
    setNote(null);
    setResults(null);
    setProgress({ done: 0, total: 0 });

    try {
      const { paths, siteOrigin } = await collectPaths(controller.signal);
      if (paths.length === 0) {
        setError(
          'The sitemap could not be read, so there was nothing to scan. Check that /sitemap-index.xml opens in a browser tab, then try again.',
        );
        return;
      }
      setProgress({ done: 0, total: paths.length });

      const collected: PageResult[] = [];
      let cursor = 0;
      let done = 0;

      // Four at a time keeps the crawl polite on the host and still finishes fast.
      const worker = async () => {
        while (!controller.signal.aborted) {
          const index = cursor++;
          if (index >= paths.length) return;
          try {
            collected.push(await auditPath(paths[index], siteOrigin, controller.signal));
          } catch (err) {
            if (controller.signal.aborted) return;
            console.error(err);
            collected.push({
              path: paths[index],
              title: null,
              description: null,
              words: 0,
              internalLinks: 0,
              loaded: false,
              findings: [
                {
                  check: 'Page',
                  severity: 'error',
                  message:
                    'This page could not be reached during the scan, so nothing on it could be checked. Open it yourself to see whether it is broken.',
                },
              ],
            });
          }
          done += 1;
          setProgress({ done, total: paths.length });
        }
      };

      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, paths.length) }, () => worker()),
      );

      const finished = addDuplicateFindings(
        collected.sort((a, b) => a.path.localeCompare(b.path)),
      );
      setResults(finished);

      if (controller.signal.aborted) {
        setNote(
          `Scan stopped early. These are the ${finished.length} of ${paths.length} pages that were checked before you cancelled.`,
        );
        return;
      }

      const summary: LastScan = {
        at: new Date().toISOString(),
        pages: finished.length,
        errors: countBySeverity(finished, 'error'),
        warnings: countBySeverity(finished, 'warning'),
      };
      setLastScan(summary);

      if (supabase) {
        const { error: saveErr } = await supabase
          .from('app_settings')
          .upsert({ key: SETTINGS_KEY, value: JSON.stringify(summary) });
        if (saveErr) {
          console.error(saveErr);
          setNote('The results are on screen, but the scan date could not be saved for next time.');
        }
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error(err);
      setError(
        'The scan could not finish. Check that the website is online, then run it again.',
      );
    } finally {
      setScanning(false);
      abortRef.current = null;
    }
  }, []);

  const errorCount = results ? countBySeverity(results, 'error') : 0;
  const warningCount = results ? countBySeverity(results, 'warning') : 0;
  const cleanPages = results ? results.filter((r) => r.findings.length === 0) : [];
  const errorPages = results ? results.filter((r) => r.findings.some((f) => f.severity === 'error')) : [];
  // A page can appear in both groups: its errors show above, its warnings further down.
  const warningPages = results
    ? results.filter((r) => r.findings.some((f) => f.severity === 'warning'))
    : [];
  const warningOnlyPages = warningPages.filter(
    (r) => !r.findings.some((f) => f.severity === 'error'),
  );

  let verdict = '';
  if (results) {
    if (errorCount === 0 && warningCount === 0) {
      verdict = `All ${results.length} pages pass every check. Nothing to fix on the page level right now.`;
    } else if (errorCount === 0) {
      verdict = `Nothing is broken. ${warningPages.length} ${plural(warningPages.length, 'page has', 'pages have')} smaller issues that are worth tidying up when there is time.`;
    } else {
      verdict = `${errorPages.length} ${plural(errorPages.length, 'page needs', 'pages need')} a fix before ${plural(errorPages.length, 'it', 'they')} can rank properly, and ${warningOnlyPages.length} more ${plural(warningOnlyPages.length, 'page could be', 'pages could be')} stronger.`;
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-fg">SEO health</h1>
          <p className="text-[14.5px] text-fg-muted mt-1 max-w-2xl">
            This reads every page listed in the sitemap, exactly as Google does, and reports what is
            missing or weak. It checks the pages themselves, not your position in search results.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={runScan}
            disabled={scanning}
            className="rounded-btn bg-accent hover:bg-accent-hover disabled:opacity-60 text-fg-on-accent font-semibold px-5 py-2.5 text-[14.5px] transition-colors"
          >
            {scanning ? 'Scanning...' : results ? 'Run the scan again' : 'Run the scan'}
          </button>
          {scanning && (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              className="rounded-btn border border-hairline bg-surface-raised px-5 py-2.5 text-[14.5px] font-semibold text-fg-body hover:border-accent transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {lastScan && !scanning && (
        <p className="text-[13.5px] text-fg-muted">
          Last scan{' '}
          {new Date(lastScan.at).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
          : {lastScan.pages} {plural(lastScan.pages, 'page', 'pages')}, {lastScan.errors}{' '}
          {plural(lastScan.errors, 'error', 'errors')}, {lastScan.warnings}{' '}
          {plural(lastScan.warnings, 'warning', 'warnings')}.
        </p>
      )}

      {error && (
        <p className="rounded-card bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-[14.5px]">
          {error}
        </p>
      )}

      {note && (
        <p className="rounded-card border border-hairline bg-surface-sunken text-fg-body px-4 py-3 text-[14.5px]">
          {note}
        </p>
      )}

      {scanning && (
        <div className="rounded-card border border-hairline bg-surface-raised p-6 shadow-card">
          <p role="status" aria-live="polite" className="text-[14.5px] text-fg-body">
            {progress.total === 0
              ? 'Reading the sitemap...'
              : `Checking page ${Math.min(progress.done + 1, progress.total)} of ${progress.total}...`}
          </p>
          <div
            className="mt-3 h-1.5 rounded-btn bg-surface-sunken overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={progress.total || 1}
            aria-valuenow={progress.done}
            aria-label="Scan progress"
          >
            <div
              className="h-full rounded-btn bg-accent transition-[width] duration-300"
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 4}%` }}
            />
          </div>
        </div>
      )}

      {!results && !scanning && !error && (
        <div className="rounded-card border border-hairline bg-surface-raised p-8 shadow-card text-center">
          <p className="text-[15px] text-fg-body">
            No scan has run in this session yet.
          </p>
          <p className="text-[14px] text-fg-muted mt-1">
            Press Run the scan. It takes under a minute for the whole site.
          </p>
        </div>
      )}

      {results && (
        <>
          <div className="grid sm:grid-cols-4 gap-4">
            <SummaryTile label="Pages scanned" value={results.length} />
            <SummaryTile label="Errors" value={errorCount} tone={errorCount > 0 ? 'error' : 'ok'} />
            <SummaryTile
              label="Warnings"
              value={warningCount}
              tone={warningCount > 0 ? 'warning' : 'ok'}
            />
            <SummaryTile label="Clean pages" value={cleanPages.length} tone="ok" />
          </div>

          <p className="rounded-card border border-hairline bg-surface-raised px-5 py-4 text-[15px] leading-relaxed text-fg-body shadow-card">
            {verdict}
          </p>

          {errorPages.length > 0 && (
            <Section
              title="Fix these first"
              blurb="Each of these actively holds a page back in search. Start at the top."
              pages={errorPages}
              severity="error"
            />
          )}

          {warningPages.length > 0 && (
            <Section
              title="Worth improving"
              blurb="None of these break anything, but each one leaves easy ranking on the table."
              pages={warningPages}
              severity="warning"
            />
          )}

          <div className="rounded-card border border-hairline bg-surface-raised p-6 shadow-card">
            <h2 className="font-semibold text-[15px] text-fg-body">
              Pages with no problems ({cleanPages.length})
            </h2>
            {cleanPages.length === 0 ? (
              <p className="text-[14px] text-fg-muted mt-2">
                Every page has at least one thing to fix.
              </p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {cleanPages.map((page) => (
                  <li
                    key={page.path}
                    className="rounded-btn bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 text-[12.5px] font-medium"
                  >
                    {page.path}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: number;
  tone?: 'neutral' | 'ok' | 'warning' | 'error';
}) {
  const valueTone =
    tone === 'error' ? 'text-red-700' : tone === 'warning' ? 'text-amber-700' : tone === 'ok' ? 'text-emerald-700' : 'text-fg';
  return (
    <div className="rounded-card border border-hairline bg-surface-raised p-5 shadow-card">
      <p className="text-[12.5px] uppercase tracking-[0.14em] text-fg-muted">{label}</p>
      <p className={`mt-1.5 font-display font-semibold text-3xl ${valueTone}`}>{value}</p>
    </div>
  );
}

function Section({
  title,
  blurb,
  pages,
  severity,
}: {
  title: string;
  blurb: string;
  pages: PageResult[];
  severity: Severity;
}) {
  const visible = pages.filter((page) => page.findings.some((f) => f.severity === severity));
  if (visible.length === 0) return null;

  return (
    <section>
      <h2 className="font-display font-semibold text-xl text-fg">{title}</h2>
      <p className="text-[14px] text-fg-muted mt-1 mb-4">{blurb}</p>
      <ul className="grid gap-4">
        {visible.map((page) => (
          <li
            key={page.path}
            className={`rounded-card border bg-surface-raised p-5 shadow-card ${
              severity === 'error' ? 'border-red-200' : 'border-hairline'
            }`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-semibold text-[15.5px] text-fg break-all">{page.path}</h3>
              <a
                href={page.path}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] font-semibold text-accent-on-light hover:underline"
              >
                Open this page
              </a>
            </div>
            {page.loaded && (
              <p className="text-[12.5px] text-fg-muted mt-0.5">
                {page.words} {plural(page.words, 'word', 'words')} of content,{' '}
                {page.internalLinks} internal {plural(page.internalLinks, 'link', 'links')}
              </p>
            )}
            <ul className="mt-3 grid gap-2.5">
              {page.findings
                .filter((f) => f.severity === severity)
                .map((finding, index) => (
                  <li
                    key={`${finding.check}-${index}`}
                    className="flex flex-wrap items-start gap-x-3 gap-y-1.5 text-[14.5px] leading-relaxed text-fg-body"
                  >
                    <span
                      className={`shrink-0 rounded-btn border px-2 py-0.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] ${
                        finding.severity === 'error'
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}
                    >
                      {finding.check}
                    </span>
                    <span className="flex-1 min-w-[16rem]">{finding.message}</span>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
