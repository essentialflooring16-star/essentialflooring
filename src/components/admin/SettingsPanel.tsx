import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { SITE } from '../../data/site';

const HOOK_PREFIX = 'https://api.vercel.com/v1/integrations/deploy/';

type HealthLevel = 'good' | 'warn' | 'bad';

type HealthRow = {
  id: string;
  level: HealthLevel;
  text: string;
};

type Notice = {
  tone: 'ok' | 'error';
  text: string;
};

/**
 * 'failed' is separate from 'ready' on purpose. If the settings row cannot be read,
 * the panel knows nothing about the publishing link, and saying "not set yet" in that
 * situation would be a plain lie to the client.
 */
type LoadState = 'loading' | 'ready' | 'failed';

const MARK_CLASS: Record<HealthLevel, string> = {
  good: 'bg-emerald-500',
  warn: 'bg-amber-500',
  bad: 'bg-red-500',
};

const MARK_LABEL: Record<HealthLevel, string> = {
  good: 'Working',
  warn: 'Needs attention',
  bad: 'Not working',
};

/**
 * Every other check on this page reads the same database, so when the connection is
 * gone one sentence is more useful than five rows all repeating the same cause.
 */
const DB_DOWN: HealthRow = {
  id: 'database',
  level: 'bad',
  text: 'The admin cabinet cannot reach its database right now, so nothing on this page can be checked. Sign out, sign back in, and if it keeps failing contact your developer.',
};

/**
 * The hook is a credential: anyone holding it can trigger builds forever. The mask is a
 * fixed width on purpose so the display does not reveal how long the real value is, and
 * a value too short to be a real hook is hidden completely rather than half shown.
 */
function maskHook(value: string): string {
  const tail = value.length > 12 ? value.slice(-6) : '';
  return `${'•'.repeat(14)}${tail}`;
}

function describeLastView(iso: string | null): HealthRow {
  if (!iso) {
    return {
      id: 'analytics',
      level: 'warn',
      text: 'No page views have been recorded yet, so there is nothing to report in the Traffic tab.',
    };
  }
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  const stamp = new Date(iso).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  if (hours < 48) {
    return {
      id: 'analytics',
      level: 'good',
      text: `Visitor tracking is running. The last page view was recorded on ${stamp}.`,
    };
  }
  const days = Math.floor(hours / 24);
  return {
    id: 'analytics',
    level: 'warn',
    text: `No page views for ${days} days. The last one was recorded on ${stamp}, so either the website is quiet or tracking stopped.`,
  };
}

// Read from the same file the public pages render from, so this panel cannot end up
// showing a phone number the website no longer uses.
const BUSINESS_DETAILS: [string, string][] = [
  ['Phone', SITE.phone],
  ['Email', SITE.email],
  ['License', SITE.license],
  ['Hours', SITE.hours],
];

export default function SettingsPanel() {
  const [hook, setHook] = useState('');
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [status, setStatus] = useState<LoadState>('loading');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [health, setHealth] = useState<HealthRow[]>([]);

  async function load() {
    if (!supabase) return;
    setStatus('loading');

    try {
      // The settings read doubles as the database health check: if this call fails,
      // every other panel in the cabinet is failing too.
      const { data: setting, error: settingError } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'deploy_hook_url')
        .maybeSingle();

      if (settingError) {
        console.error(settingError);
        setHealth([DB_DOWN]);
        setStatus('failed');
        return;
      }

      const rows: HealthRow[] = [
        {
          id: 'database',
          level: 'good',
          text: 'The admin cabinet is connected to its database.',
        },
      ];

      const storedHook = setting?.value ?? '';
      setHook(storedHook);
      rows.push(
        storedHook
          ? {
              id: 'hook',
              level: 'good',
              text: 'Publishing is wired up, so changes you make here can be pushed live from this page.',
            }
          : {
              id: 'hook',
              level: 'warn',
              text: 'No publishing link is set, so blog and portfolio changes wait for the next developer deploy.',
            },
      );

      const [reviews, posts, views] = await Promise.all([
        supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('published', true),
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('published', true),
        supabase
          .from('page_views')
          .select('created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (reviews.error) {
        console.error(reviews.error);
        rows.push({
          id: 'reviews',
          level: 'warn',
          text: 'The customer reviews could not be checked. Contact your developer if this stays here.',
        });
      } else {
        const count = reviews.count ?? 0;
        rows.push({
          id: 'reviews',
          level: count > 0 ? 'good' : 'warn',
          text:
            count > 0
              ? `${count} customer ${count === 1 ? 'review is' : 'reviews are'} published on the website.`
              : 'No customer reviews are published yet.',
        });
      }

      if (posts.error) {
        console.error(posts.error);
        rows.push({
          id: 'posts',
          level: 'warn',
          text: 'The blog posts could not be checked. Contact your developer if this stays here.',
        });
      } else {
        const count = posts.count ?? 0;
        rows.push({
          id: 'posts',
          level: count > 0 ? 'good' : 'warn',
          text:
            count > 0
              ? `${count} blog ${count === 1 ? 'post is' : 'posts are'} published on the website.`
              : 'No blog post is published yet, so the blog page shows nothing.',
        });
      }

      if (views.error) {
        console.error(views.error);
        rows.push({
          id: 'analytics',
          level: 'warn',
          text: 'Visitor tracking could not be checked. Contact your developer if this stays here.',
        });
      } else {
        rows.push(describeLastView(views.data?.created_at ?? null));
      }

      setHealth(rows);
      setStatus('ready');
    } catch (err) {
      // A rejected request must not leave the panel stuck on "Loading settings..."
      // with no way out, so every exit path sets a final state.
      console.error(err);
      setHealth([DB_DOWN]);
      setStatus('failed');
    }
  }

  useEffect(() => {
    if (!supabase) {
      setStatus('failed');
      return;
    }
    load();
  }, []);

  async function onSaveHook(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = draft.trim();
    setNotice(null);

    // Refused before it ever reaches the database: this value is later POSTed to from
    // the browser, so a link to any other host must never get stored. The prefix pins
    // the host, because everything up to the first slash after the scheme is fixed.
    if (!value.startsWith(HOOK_PREFIX) || value.length <= HOOK_PREFIX.length) {
      setNotice({
        tone: 'error',
        text: `That does not look like a Vercel deploy hook. The full address has to start with ${HOOK_PREFIX} and carry the hook id after it.`,
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase!
        .from('app_settings')
        .upsert({ key: 'deploy_hook_url', value }, { onConflict: 'key' });
      if (error) throw error;
      setDraft('');
      setEditing(false);
      setRevealed(false);
      setNotice({
        tone: 'ok',
        text: 'Publishing link saved. You can now publish the website from this page.',
      });
      await load();
    } catch (err) {
      console.error(err);
      setNotice({
        tone: 'error',
        text: 'The publishing link could not be saved. Try again, and if it keeps failing contact your developer.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function onPublish() {
    setNotice(null);
    // Defence in depth. The value came out of a database row, and a row can be wrong,
    // so the host is checked again at the moment it is actually used.
    if (!hook.startsWith(HOOK_PREFIX)) {
      setNotice({
        tone: 'error',
        text: 'The stored publishing link is not a Vercel deploy hook, so it was not called. Contact your developer.',
      });
      return;
    }
    setPublishing(true);
    try {
      // no-cors because a deploy hook answers without CORS headers. The response is
      // opaque, so this page can confirm the request left the browser and nothing more.
      await fetch(hook, { method: 'POST', mode: 'no-cors' });
      setNotice({
        tone: 'ok',
        text: 'The rebuild request was sent. Vercel does not report back to this page, so give it a minute or two, then refresh the website to check your changes are there.',
      });
    } catch (err) {
      console.error(err);
      setNotice({
        tone: 'error',
        text: 'The rebuild request did not go through. Check your internet connection and try again.',
      });
    } finally {
      setPublishing(false);
    }
  }

  if (!supabase) {
    return (
      <div className="rounded-card border border-hairline bg-surface-raised p-8 shadow-card">
        <h1 className="font-display font-semibold text-2xl text-fg">Settings</h1>
        <p className="mt-3 text-[15px] text-fg-muted leading-relaxed">
          The admin cabinet is not connected to its database, so there is nothing to show here yet.
          Your developer needs to finish the setup.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-display font-semibold text-2xl text-fg mb-1">Settings</h1>
        <p className="text-[14.5px] text-fg-muted">
          Publishing, the health of the website, and the business details it shows.
        </p>
      </div>

      {/* 1. Publishing */}
      <section className="rounded-card border border-hairline bg-surface-raised p-6 sm:p-8 shadow-card">
        <div className="grid gap-4">
          <div>
            <h2 className="font-display font-semibold text-xl text-fg">Publishing</h2>
            <p className="text-[14.5px] text-fg-muted mt-1">
              The website is rebuilt from a private link so new blog posts and photos appear for
              visitors. Your developer creates that link once in Vercel.
            </p>
          </div>

          {status === 'loading' && <p className="text-fg-muted text-[15px]">Loading settings...</p>}

          {status === 'failed' && (
            <p className="rounded-card bg-surface-sunken border border-hairline px-4 py-3 text-[14.5px] text-fg-body">
              The publishing link could not be read, so it cannot be used or changed right now.
              Refresh the page to try again.
            </p>
          )}

          {status === 'ready' && (
            <>
              <div className="rounded-card bg-surface-sunken border border-hairline px-4 py-3">
                <p className="text-[13px] uppercase tracking-[0.14em] text-fg-muted">
                  Publishing link
                </p>
                {hook ? (
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <code className="text-[13.5px] text-fg-body break-all">
                      {revealed ? hook : maskHook(hook)}
                    </code>
                    <button
                      type="button"
                      onClick={() => setRevealed((v) => !v)}
                      aria-pressed={revealed}
                      className="rounded-btn border border-hairline bg-field px-3 py-1 text-[12px] font-semibold text-fg-body hover:border-accent transition-colors"
                    >
                      {revealed ? 'Hide' : 'Show'}
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 text-[14.5px] text-fg-body">
                    Not set yet. Until it is, everything you save stays in the cabinet and goes live
                    only at the next developer deploy.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onPublish}
                  disabled={!hook || publishing}
                  className="rounded-btn bg-accent hover:bg-accent-hover disabled:opacity-60 text-fg-on-accent font-semibold px-6 py-3 text-[14.5px] transition-colors"
                >
                  {publishing ? 'Sending...' : 'Publish the website now'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing((v) => !v);
                    setNotice(null);
                    setDraft('');
                  }}
                  aria-expanded={editing}
                  className="rounded-btn border border-hairline px-6 py-3 text-[14.5px] font-semibold text-fg-body hover:border-accent transition-colors"
                >
                  {editing ? 'Cancel' : hook ? 'Replace the link' : 'Add the link'}
                </button>
              </div>

              {editing && (
                <form onSubmit={onSaveHook} className="grid gap-3">
                  <label className="grid gap-1.5" htmlFor="deploy-hook-url">
                    <span className="text-[14px] font-semibold text-fg-body">
                      Paste the deploy hook from Vercel
                    </span>
                    <input
                      id="deploy-hook-url"
                      name="deploy-hook-url"
                      type="url"
                      required
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder={`${HOOK_PREFIX}...`}
                      aria-describedby="deploy-hook-help"
                      className="rounded-card border border-hairline bg-field px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition"
                    />
                  </label>
                  <p id="deploy-hook-help" className="text-[13px] text-fg-subtle -mt-1">
                    It has to start with{' '}
                    <code className="break-all">{HOOK_PREFIX}</code>. Treat it like a password and
                    do not share it.
                  </p>
                  <button
                    type="submit"
                    disabled={saving}
                    className="justify-self-start rounded-btn bg-control-dark hover:bg-control-dark-hover disabled:opacity-60 text-fg-on-dark font-semibold px-6 py-2.5 text-[14px] transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save link'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Mounted from the first render so assistive tech is already watching it when
            the first save or publish result lands in it. */}
        <div role="status" className="mt-4 empty:mt-0">
          {notice && (
            <p
              className={`rounded-card border px-4 py-3 text-[14px] ${
                notice.tone === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-surface-sunken border-hairline text-fg-body'
              }`}
            >
              {notice.text}
            </p>
          )}
        </div>
      </section>

      {/* 2. Connection status */}
      <section className="rounded-card border border-hairline bg-surface-raised p-6 sm:p-8 shadow-card">
        <h2 className="font-display font-semibold text-xl text-fg">Website health</h2>
        <p className="text-[14.5px] text-fg-muted mt-1 mb-5">
          A quick check of the parts that run behind the website.
        </p>

        {/* aria-busy rather than aria-live: this list loads on arrival, and reading five
            full sentences aloud unprompted would bury the rest of the page. */}
        <div aria-busy={status === 'loading'}>
          {status === 'loading' ? (
            <p className="text-fg-muted text-[15px]">Checking...</p>
          ) : (
            <ul className="grid gap-3">
              {health.map((row) => (
                <li key={row.id} className="flex items-start gap-3 text-[14.5px] text-fg-body">
                  <span
                    aria-hidden="true"
                    className={`mt-[7px] h-2.5 w-2.5 shrink-0 rounded-btn ${MARK_CLASS[row.level]}`}
                  />
                  <span className="sr-only">{MARK_LABEL[row.level]}: </span>
                  <span className="leading-relaxed">{row.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 3. Business details, read only on purpose */}
      <section className="rounded-card border border-hairline bg-surface-raised p-6 sm:p-8 shadow-card">
        <h2 className="font-display font-semibold text-xl text-fg">Business details</h2>
        <p className="text-[14.5px] text-fg-muted mt-1 mb-5">
          These are built into every page of the website, so changing them is a developer job. Send
          your developer the new details and they go out with the next update.
        </p>
        <dl className="grid sm:grid-cols-2 gap-4">
          {BUSINESS_DETAILS.map(([label, value]) => (
            <div
              key={label}
              className="rounded-card bg-surface-sunken border border-hairline px-4 py-3"
            >
              <dt className="text-[13px] uppercase tracking-[0.14em] text-fg-muted">{label}</dt>
              <dd className="mt-1 text-[15px] text-fg break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
