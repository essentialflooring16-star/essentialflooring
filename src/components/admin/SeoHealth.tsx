import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useT, useFormat, type Vars } from '../../lib/admin-i18n';

/**
 * The site is static and this panel runs in the browser, so there is no filesystem to
 * read. Instead the panel crawls the live site over HTTP from the same origin. What it
 * parses is the HTML as it is served, before any JavaScript runs, which is what a crawler
 * downloads on its first pass. Anything a React island injects later is not counted, and
 * that is deliberate: the checks here are about what ships in the HTML.
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

/** Separator intern pentru listele purtate prin vars. */
const SEP = String.fromCharCode(31);

type Finding = {
  /** Cheia etichetei scurte, de pilda seo.check_title. */
  check: string;
  severity: Severity;
  /** Cheia propozitiei si valorile ei. Se traduce la afisare, nu aici:
   *  verificarea ruleaza intr-o functie pura, fara acces la hook. */
  key: string;
  vars?: Vars;
  /** A doua propozitie, cand constatarea are una (saritura de titluri). */
  suffixKey?: string;
  suffixVars?: Vars;
  /** Saritura de nivel, compusa la afisare fiindca are text propriu inauntru. */
  jump?: { from: number; to: number; text: string };
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
): Promise<{ paths: string[]; siteOrigin: string | null; truncated: boolean }> {
  const seen = new Set<string>();
  const paths: string[] = [];
  let siteOrigin: string | null = null;
  // Set when the sitemap holds more URLs than MAX_PAGES, so the summary can say the
  // counts cover part of the site instead of quietly claiming the whole of it.
  let truncated = false;

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
      if (seen.has(path)) continue;
      if (paths.length >= MAX_PAGES) {
        truncated = true;
        continue;
      }
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
  return { paths, siteOrigin, truncated };
}

/* -------------------------------------------------------- the page checks */

function auditDocument(doc: Document, path: string, siteOrigin: string | null): PageResult {
  const findings: Finding[] = [];
  const add = (check: string, severity: Severity, key: string, vars?: Vars) =>
    findings.push({ check, severity, key, vars });

  /* Title */
  const title = doc.querySelector('title')?.textContent?.trim() || null;
  if (!title) {
    add('seo.check_title', 'error', 'seo.finding_title_missing');
  } else if (title.length > TITLE_MAX) {
    add('seo.check_title', 'warning', 'seo.finding_title_long', { n: title.length, max: TITLE_MAX });
  } else if (title.length < TITLE_MIN) {
    add('seo.check_title', 'warning', 'seo.finding_title_short', { n: title.length, min: TITLE_MIN });
  }

  /* Meta description */
  const description = metaContent(doc, 'meta[name="description"]');
  if (!description) {
    add(
      'seo.check_meta_description', 'error', 'seo.finding_description_missing');
  } else if (description.length > DESC_MAX) {
    add(
      'seo.check_meta_description', 'warning', 'seo.finding_description_long', { n: description.length, max: DESC_MAX });
  } else if (description.length < DESC_MIN) {
    add(
      'seo.check_meta_description', 'warning', 'seo.finding_description_short', { n: description.length, min: DESC_MIN, max: DESC_MAX });
  }

  /* Headings */
  const headings = Array.from(doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const h1s = headings.filter((h) => h.tagName === 'H1');
  if (h1s.length === 0) {
    add(
      'seo.check_heading', 'error', 'seo.finding_h1_missing');
  } else if (h1s.length > 1) {
    add('seo.check_heading', 'error', 'seo.finding_h1_multiple', { n: h1s.length });
  }

  let previousLevel = 0;
  const jumps: { from: number; to: number; text: string }[] = [];
  for (const heading of headings) {
    const level = Number(heading.tagName.slice(1));
    if (previousLevel > 0 && level > previousLevel + 1) {
        jumps.push({ from: previousLevel, to: level, text: shorten(heading.textContent ?? '') });
    }
    previousLevel = level;
  }
  if (jumps.length > 0) {
    findings.push({
      check: 'seo.check_heading',
      severity: 'warning',
      key: 'seo.finding_heading_skip',
      vars: { jump: '' },
      // Prima saritura se scrie in propozitia principala, iar cate mai sunt se
      // spune intr-una separata: doua chei, ca ambele sa se acorde in romana.
      jump: jumps[0],
      suffixKey: jumps.length > 1 ? 'seo.finding_heading_skip_more' : undefined,
      suffixVars: jumps.length > 1 ? { n: jumps.length - 1 } : undefined,
    });
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
    const examples = missingAlt.slice(0, 3).map((img) => img.getAttribute('src') ?? '');
    add('seo.check_images', 'error', 'seo.finding_images_alt', {
      n: missingAlt.length,
      examples: '',
      // Numele fisierelor se compun la afisare: unul dintre ele poate lipsi, iar
      // textul de inlocuire e el insusi tradus.
      files: examples.join(SEP),
      more: missingAlt.length > 3 ? 1 : 0,
    });
  }

  /* Canonical */
  const canonicalHref = doc.querySelector('link[rel="canonical"]')?.getAttribute('href')?.trim();
  if (!canonicalHref) {
    add('seo.check_canonical', 'error', 'seo.finding_canonical_missing');
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
      add('seo.check_canonical', 'error', 'seo.finding_canonical_invalid', { href: shorten(canonicalHref) });
    } else if (canonicalPath !== path) {
      add('seo.check_canonical', 'error', 'seo.finding_canonical_mismatch', { canonical: canonicalPath, path });
    }
  }

  /* Structured data */
  const ldBlocks = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
  if (ldBlocks.length === 0) {
    add('seo.check_structured_data', 'warning', 'seo.finding_structured_data_missing');
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
      if (ldBlocks.length === 1) {
        add('seo.check_structured_data', 'error', 'seo.finding_structured_data_broken_single');
      } else {
        add('seo.check_structured_data', 'error', 'seo.finding_structured_data_broken_many', {
          n: broken.length,
          total: ldBlocks.length,
        });
      }
    }
  }

  /* Open Graph */
  const missingOg: string[] = [];
  if (!metaContent(doc, 'meta[property="og:title"]')) missingOg.push('seo.og_title');
  if (!metaContent(doc, 'meta[property="og:description"]')) missingOg.push('seo.og_description');
  if (!metaContent(doc, 'meta[property="og:image"]')) missingOg.push('seo.og_image');
  if (missingOg.length > 0) {
    add('seo.check_social_preview', 'warning', 'seo.finding_og_missing', {
      n: missingOg.length,
      list: '',
      // Numele etichetelor lipsa sunt ele insele traduse si legate cu "si", deci
      // lista se compune la afisare.
      tags: missingOg.join(SEP),
    });
  }

  /* Word count */
  const scope = contentScope(doc);
  const words = countWords(scope);
  if (words < MIN_WORDS) {
    add('seo.check_thin_content', 'warning', 'seo.finding_thin_content', { n: words, min: MIN_WORDS });
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
      'seo.check_internal_links',
      'warning',
      internal.size === 0 ? 'seo.finding_internal_links_none' : 'seo.finding_internal_links_few',
      { n: internal.size, min: MIN_INTERNAL_LINKS },
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
          check: 'seo.check_page',
          severity: 'error',
          key: 'seo.finding_page_status',
          vars: { status: res.status },
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

  const others = (paths: string[], self: string) => paths.filter((p) => p !== self);

  return results.map((result) => {
    const extra: Finding[] = [];
    const titleGroup = result.title ? byTitle.get(result.title.trim().toLowerCase()) ?? [] : [];
    if (titleGroup.length > 1) {
      extra.push({
        check: 'seo.check_duplicate_title',
        severity: 'error',
        key: 'seo.finding_duplicate_title',
        vars: { pages: '', others: others(titleGroup, result.path).join(SEP) },
      });
    }
    const descGroup = result.description
      ? byDescription.get(result.description.trim().toLowerCase()) ?? []
      : [];
    if (descGroup.length > 1) {
      extra.push({
        check: 'seo.check_duplicate_description',
        severity: 'error',
        key: 'seo.finding_duplicate_description',
        vars: { pages: '', others: others(descGroup, result.path).join(SEP) },
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
  const { t } = useT();
  const fmt = useFormat();
  const [results, setResults] = useState<PageResult[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<LastScan | null>(null);
  // A crawl updates progress dozens of times. Feeding that straight into a live region
  // would talk over a screen reader user for the whole scan, so only the start, the end
  // and a failure are announced, from one region that is always in the DOM.
  const [announcement, setAnnouncement] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const runButtonRef = useRef<HTMLButtonElement>(null);
  const wasScanning = useRef(false);

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

  useEffect(() => {
    // Cancel unmounts when the scan ends, which drops keyboard focus onto the body.
    // Hand it back to the button that is still there rather than losing the user's place.
    if (wasScanning.current && !scanning && document.activeElement === document.body) {
      runButtonRef.current?.focus();
    }
    wasScanning.current = scanning;
  }, [scanning]);

  const runScan = useCallback(async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    setScanning(true);
    setError(null);
    setNote(null);
    setResults(null);
    setProgress({ done: 0, total: 0 });
    setAnnouncement(t('seo.announce_started'));

    try {
      const { paths, siteOrigin, truncated } = await collectPaths(controller.signal);
      if (paths.length === 0) {
        setError(
          t('seo.error_sitemap'),
        );
        setAnnouncement(t('seo.announce_sitemap_failed'));
        return;
      }
      if (truncated) {
        setNote(t('seo.note_truncated', { max: MAX_PAGES }));
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
                  check: 'seo.check_page',
                  severity: 'error',
                  key: 'seo.finding_page_unreachable',
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
          finished.length === 0
            ? t('seo.note_stopped_empty')
            : t('seo.note_stopped_early', { n: finished.length, total: paths.length }),
        );
        setAnnouncement(t('seo.announce_stopped', { n: finished.length, total: paths.length }));
        return;
      }

      const summary: LastScan = {
        at: new Date().toISOString(),
        pages: finished.length,
        errors: countBySeverity(finished, 'error'),
        warnings: countBySeverity(finished, 'warning'),
      };
      setLastScan(summary);
      setAnnouncement(
        t('seo.announce_finished', {
          pages: t('seo.count_pages_checked', { n: summary.pages }),
          errors: t('seo.count_errors', { n: summary.errors }),
          warnings: t('seo.count_warnings', { n: summary.warnings }),
        }),
      );

      if (supabase) {
        const { error: saveErr } = await supabase
          .from('app_settings')
          .upsert({ key: SETTINGS_KEY, value: JSON.stringify(summary) });
        if (saveErr) {
          console.error(saveErr);
          // Append: a truncation notice may already be sitting here and still matters.
          setNote((prev) =>
            [prev, t('seo.note_save_failed')]
              .filter(Boolean)
              .join(' '),
          );
        }
      }
    } catch (err) {
      // Cancelling makes the in-flight fetch throw, which is not something to report.
      if (controller.signal.aborted) {
        setNote(t('seo.note_cancelled'));
        setAnnouncement(t('seo.announce_cancelled'));
        return;
      }
      console.error(err);
      setError(
        t('seo.error_failed'),
      );
      setAnnouncement(t('seo.announce_failed'));
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
      verdict =
        results.length === 1
          ? t('seo.verdict_all_clean_single')
          : t('seo.verdict_all_clean', { n: results.length });
    } else if (errorCount === 0) {
      verdict = t('seo.verdict_warnings_only', { n: warningPages.length });
    } else {
      const fixing = t('seo.verdict_needs_fixing', { n: errorPages.length });
      // "si inca 0 pagini ar putea fi mai bune" nu e o propozitie pe care sa o
      // citeasca cineva, deci a doua jumatate apare doar cand chiar exista.
      verdict =
        warningOnlyPages.length === 0
          ? `${fixing}.`
          : t('seo.verdict_needs_fixing_and_more', { fixing, n: warningOnlyPages.length });
    }
  }

  return (
    <div className="grid gap-6">
      {/* Always mounted: a live region inserted together with its text is unreliable. */}
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-fg">{t('seo.title')}</h1>
          <p className="text-[14.5px] text-fg-muted mt-1 max-w-2xl">{t('seo.intro')}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            ref={runButtonRef}
            onClick={runScan}
            disabled={scanning}
            className="rounded-btn bg-accent hover:bg-accent-hover disabled:opacity-60 text-fg-on-accent font-semibold px-5 py-2.5 text-[14.5px] transition-colors"
          >
            {scanning ? t('seo.running') : results ? t('seo.run_again') : t('seo.run')}
          </button>
          {scanning && (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              className="rounded-btn border border-hairline bg-surface-raised px-5 py-2.5 text-[14.5px] font-semibold text-fg-body hover:border-accent transition-colors"
            >{t('seo.cancel')}</button>
          )}
        </div>
      </div>

      {lastScan && !scanning && (
        <p className="text-[13.5px] text-fg-muted">
          {t('seo.last_scan', {
            date: fmt.dateTime(lastScan.at),
            pages: t('seo.count_pages', { n: lastScan.pages }),
            errors: t('seo.count_errors', { n: lastScan.errors }),
            warnings: t('seo.count_warnings', { n: lastScan.warnings }),
          })}
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
          {/* Deliberately not a live region: the sr-only one above carries the milestones. */}
          <p className="text-[14.5px] text-fg-body">
            {progress.total === 0
              ? t('seo.progress_sitemap')
              : t('seo.progress_page', {
                  n: Math.min(progress.done + 1, progress.total),
                  total: progress.total,
                })}
          </p>
          <div
            className="mt-3 h-1.5 rounded-btn bg-surface-sunken overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={progress.total || 1}
            aria-valuenow={progress.done}
            aria-label={t('seo.progress_label')}
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
          <p className="text-[15px] text-fg-body">{t('seo.empty_state')}</p>
          <p className="text-[14px] text-fg-muted mt-1">{t('seo.empty_state_hint')}</p>
        </div>
      )}

      {/* A scan cancelled before the first page finishes leaves an empty array. Showing the
          summary then would print "All 0 pages pass every check", which is not true. */}
      {results && results.length > 0 && (
        <>
          <div className="grid sm:grid-cols-4 gap-4">
            <SummaryTile label={t('seo.tile_pages')} value={results.length} />
            <SummaryTile label={t('seo.tile_errors')} value={errorCount} tone={errorCount > 0 ? 'error' : 'ok'} />
            <SummaryTile
              label={t('seo.tile_warnings')}
              value={warningCount}
              tone={warningCount > 0 ? 'warning' : 'ok'}
            />
            <SummaryTile
              label={t('seo.tile_clean')}
              value={cleanPages.length}
              tone={cleanPages.length > 0 ? 'ok' : 'neutral'}
            />
          </div>

          <p className="rounded-card border border-hairline bg-surface-raised px-5 py-4 text-[15px] leading-relaxed text-fg-body shadow-card">
            {verdict}
          </p>

          {errorPages.length > 0 && (
            <Section
              title={t('seo.section_errors_title')}
              blurb={t('seo.section_errors_blurb')}
              pages={errorPages}
              severity="error"
            />
          )}

          {warningPages.length > 0 && (
            <Section
              title={t('seo.section_warnings_title')}
              blurb={t('seo.section_warnings_blurb')}
              pages={warningPages}
              severity="warning"
            />
          )}

          <div className="rounded-card border border-hairline bg-surface-raised p-6 shadow-card">
            <h2 className="font-semibold text-[15px] text-fg-body">
              {t('seo.clean_list_title', { n: cleanPages.length })}
            </h2>
            {cleanPages.length === 0 ? (
              <p className="text-[14px] text-fg-muted mt-2">{t('seo.clean_list_empty')}</p>
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
  const { t } = useT();
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
                // Every card carries this link, so the bare text is useless out of context
                // in a screen reader's link list. The label names the page and the new tab.
                aria-label={t('seo.page_open_label', { path: page.path })}
                className="text-[13px] font-semibold text-accent-on-light hover:underline"
              >{t('seo.page_open')}</a>
            </div>
            {page.loaded && (
              <p className="text-[12.5px] text-fg-muted mt-0.5">
                {t('seo.page_stats', {
                  words: t('seo.page_words', { n: page.words }),
                  links: t('seo.page_internal_links', { n: page.internalLinks }),
                })}
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
                      {t(finding.check)}
                    </span>
                    <span className="flex-1 min-w-[16rem]">{describe(finding, t)}</span>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Compune propozitia unei constatari.
 *
 * Trei dintre ele poarta liste: numele fisierelor de imagine, etichetele Open
 * Graph lipsa si paginile cu acelasi titlu. Listele nu se pot lipi in momentul
 * verificarii, fiindca legatura dintre elemente ("si", "si inca 3") e ea insasi
 * text tradus, iar verificarea ruleaza intr-o functie pura, fara acces la limba.
 * Se compun aici, la afisare.
 */
function describe(finding: Finding, t: (key: string, vars?: Vars) => string): string {
  const vars: Vars = { ...(finding.vars ?? {}) };
  const parts = (raw: unknown) => String(raw ?? '').split(SEP).filter(Boolean);

  if (finding.key === 'seo.finding_images_alt') {
    const files = parts(vars.files).map((src) => fileNameOf(src || t('seo.unnamed_image')));
    vars.examples = files.join(', ') + (vars.more ? t('seo.images_alt_more') : '');
  }

  if (finding.key === 'seo.finding_og_missing') {
    vars.list = joinList(parts(vars.tags).map((key) => t(key)), t);
  }

  if (
    finding.key === 'seo.finding_duplicate_title' ||
    finding.key === 'seo.finding_duplicate_description'
  ) {
    const rest = parts(vars.others);
    const shown = joinList(rest.slice(0, 2), t);
    vars.pages = rest.length > 2 ? t('seo.others_more', { shown, n: rest.length - 2 }) : shown;
  }

  if (finding.jump) vars.jump = t('seo.heading_skip_item', finding.jump);

  const main = t(finding.key, vars);
  return finding.suffixKey ? `${main} ${t(finding.suffixKey, finding.suffixVars)}` : main;
}

/** "a, b si c", cu legatura in limba aleasa. */
function joinList(items: string[], t: (key: string, vars?: Vars) => string): string {
  if (items.length <= 1) return items[0] ?? '';
  return t('seo.list_join', {
    items: items.slice(0, -1).join(', '),
    last: items[items.length - 1],
  });
}
