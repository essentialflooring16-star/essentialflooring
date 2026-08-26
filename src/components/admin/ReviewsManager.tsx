import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';

type Review = {
  id: string;
  created_at: string;
  author: string;
  rating: number;
  text: string;
  city: string | null;
  review_date: string | null;
  source: string | null;
  published: boolean;
  sort_order: number;
};

type Draft = {
  author: string;
  rating: number;
  text: string;
  city: string;
  review_date: string;
  source: string;
};

const MAX_TEXT = 1200;
const LIST_LIMIT = 300;
const RATING_OPTIONS = [5, 4, 3, 2, 1];

const SOURCES = [
  ['google', 'Google'],
  ['yelp', 'Yelp'],
  ['facebook', 'Facebook'],
  ['direct', 'Sent to us directly'],
] as const;

const EMPTY_DRAFT: Draft = {
  author: '',
  rating: 5,
  text: '',
  city: '',
  review_date: '',
  source: 'google',
};

// The website is a static build. src/lib/reviews.ts reads this table while the site
// is being built, so a row saved here changes nothing online until a new build runs.
// Same deploy hook and same host check the blog and settings panels use.
const HOOK_PREFIX = 'https://api.vercel.com/v1/integrations/deploy/';

const SAVED_NOTE = 'Saved here. Press "Publish the website now" above to put it online.';

export default function ReviewsManager() {
  const [rows, setRows] = useState<Review[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  // Set by every change saved here, cleared once a rebuild has been requested. It only
  // covers this visit, so the wording never claims the live site is up to date.
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Which row is waiting for a second click to confirm deletion. Kept in state so the
  // confirm step is part of the render, instead of a blocking window.confirm dialog.
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function load() {
    if (!supabase) return;
    // Same order the website builds with (src/lib/reviews.ts sorts by sort_order then
    // newest first), so this list is a mirror of the live page rather than a second
    // opinion about it.
    const { data, error: loadError } = await supabase
      .from('reviews')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(LIST_LIMIT);

    if (loadError) {
      console.error(loadError);
      setLoadFailed(true);
      setRows(null);
      setError('Could not load the reviews. Refresh the page, and if it keeps failing contact your developer.');
      return;
    }
    setLoadFailed(false);
    setError(null);
    setRows((data as Review[]) ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const summary = useMemo(() => {
    const all = rows ?? [];
    const published = all.filter((r) => r.published);
    const average = published.length
      ? published.reduce((sum, r) => sum + r.rating, 0) / published.length
      : 0;
    return {
      published: published.length,
      hidden: all.length - published.length,
      average,
    };
  }, [rows]);

  async function publishToSite() {
    if (!supabase) return;
    setPublishing(true);
    setError(null);
    setNotice(null);
    try {
      const { data, error: hookError } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'deploy_hook_url')
        .maybeSingle();
      if (hookError) throw hookError;

      const hook = data?.value as string | undefined;
      if (!hook) {
        setError('The publishing link is not set yet, so the website cannot rebuild. Add it on the Settings page, or ask your developer.');
        return;
      }
      // The stored value is a credential this browser sends a request to. The database
      // constrains it too, but the host is checked again at the moment it is used: a
      // tampered row must never turn the admin into a client for somebody else's server.
      if (!hook.startsWith(HOOK_PREFIX)) {
        setError('The stored publishing link is not a Vercel deploy hook, so it was not used. Contact your developer.');
        return;
      }
      // no-cors because a deploy hook answers without CORS headers. The response is
      // opaque, so a request that resolves is the only confirmation available.
      await fetch(hook, { method: 'POST', mode: 'no-cors' });
      setPending(false);
      setNotice('The website is rebuilding now. The reviews are online in a minute or two, then refresh the site to see them.');
    } catch (err) {
      console.error(err);
      setError('The publish request did not go through. Check your internet connection and try again.');
    } finally {
      setPublishing(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;

    const author = draft.author.trim();
    const text = draft.text.trim();
    if (!author || !text) {
      setNotice(null);
      setError('Add the customer name and the review text before saving.');
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);
    const { error: insertError } = await supabase.from('reviews').insert({
      author,
      rating: draft.rating,
      text,
      city: draft.city.trim() || null,
      review_date: draft.review_date || null,
      source: draft.source,
      published: true,
    });
    setSaving(false);

    if (insertError) {
      console.error(insertError);
      setError('Could not save this review. Check your internet connection and try again.');
      return;
    }
    setDraft(EMPTY_DRAFT);
    setPending(true);
    setNotice(SAVED_NOTE);
    await load();
  }

  async function togglePublished(review: Review) {
    if (!supabase) return;
    const next = !review.published;
    setError(null);
    setNotice(null);
    const { error: updateError } = await supabase
      .from('reviews')
      .update({ published: next })
      .eq('id', review.id);

    if (updateError) {
      console.error(updateError);
      setError('Could not change that review. Try again in a moment.');
      return;
    }
    setPending(true);
    setNotice(
      next
        ? `Review from ${review.author} will go back on the website. ${SAVED_NOTE}`
        : `Review from ${review.author} will come off the website. ${SAVED_NOTE}`
    );
    setRows((current) =>
      (current ?? []).map((r) => (r.id === review.id ? { ...r, published: next } : r))
    );
  }

  async function remove(review: Review) {
    if (!supabase) return;
    setError(null);
    setNotice(null);
    const { error: deleteError } = await supabase.from('reviews').delete().eq('id', review.id);

    if (deleteError) {
      console.error(deleteError);
      setError('Could not delete that review. Try again in a moment.');
      return;
    }
    setConfirmId(null);
    setPending(true);
    setNotice(`Review from ${review.author} was deleted. ${SAVED_NOTE}`);
    setRows((current) => (current ?? []).filter((r) => r.id !== review.id));
  }

  if (!supabase) {
    return (
      <div className="rounded-card border border-hairline bg-surface-raised p-8 shadow-card text-center text-fg-muted">
        Reviews cannot load because the admin is not connected to the database yet.
      </div>
    );
  }

  const remaining = MAX_TEXT - draft.text.length;

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-display font-semibold text-2xl text-fg mb-1">Customer reviews</h1>
        <p className="text-[14.5px] text-fg-muted">
          Copy each review from your Google profile exactly as the customer wrote it. Published
          reviews appear on the home page and on the reviews page, together with the star rating.
        </p>
      </div>

      {/* The site is rebuilt from this table, so saving and publishing are two steps.
          Saying otherwise would promise the client something that does not happen. */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-hairline bg-surface-raised px-5 py-4 shadow-card">
        <p className="text-[14px] text-fg-body max-w-md leading-relaxed">
          {pending
            ? 'You have review changes that are not on the website yet.'
            : 'Reviews are saved here first. Publishing rebuilds the website with them.'}
        </p>
        <button
          type="button"
          onClick={publishToSite}
          disabled={publishing}
          className="rounded-btn bg-accent hover:bg-accent-hover disabled:opacity-60 text-fg-on-accent font-semibold px-6 py-3 text-[14.5px] transition-colors"
        >
          {publishing ? 'Sending...' : 'Publish the website now'}
        </button>
      </div>

      {/* Both regions stay mounted so a screen reader announces the text that appears in
          them. A live region added to the page at the same time as its message is not
          reliably read out. */}
      <div role="alert" className="empty:hidden">
        {error && (
          <p className="rounded-card bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-[14.5px]">
            {error}
          </p>
        )}
      </div>
      <div role="status" className="empty:hidden">
        {notice && (
          <p className="rounded-card bg-accent-wash border border-accent text-accent-on-light px-4 py-3 text-[14.5px]">
            {notice}
          </p>
        )}
      </div>

      {/* Counts are only shown once the table has actually been read. Printing zeros
          after a failed load would read as "you have no reviews", which is a lie. */}
      {rows && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-card border border-hairline bg-surface-raised p-6 shadow-card">
            <p className="text-[13px] uppercase tracking-[0.14em] text-fg-muted">Published</p>
            <p className="mt-2 font-display font-semibold text-4xl text-fg">{summary.published}</p>
            <p className="mt-1 text-[13px] text-fg-muted">Live after the next publish</p>
          </div>
          <div className="rounded-card border border-hairline bg-surface-raised p-6 shadow-card">
            <p className="text-[13px] uppercase tracking-[0.14em] text-fg-muted">Average rating</p>
            <p className="mt-2 font-display font-semibold text-4xl text-fg">
              {summary.published ? summary.average.toFixed(1) : 'None'}
            </p>
            <p className="mt-1 text-[13px] text-fg-muted">Shown on the home page and reviews page</p>
          </div>
          <div className="rounded-card border border-hairline bg-surface-raised p-6 shadow-card">
            <p className="text-[13px] uppercase tracking-[0.14em] text-fg-muted">Hidden</p>
            <p className="mt-2 font-display font-semibold text-4xl text-fg">{summary.hidden}</p>
            <p className="mt-1 text-[13px] text-fg-muted">Saved here, not on the website</p>
          </div>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="rounded-card border border-hairline bg-surface-raised p-6 sm:p-8 shadow-card grid gap-5"
      >
        <h2 className="font-display font-semibold text-xl text-fg">Add a review</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="grid gap-1.5">
            <span className="text-[14px] font-semibold text-fg-body">Customer name</span>
            <input
              value={draft.author}
              onChange={(e) => setDraft({ ...draft, author: e.target.value })}
              required
              maxLength={80}
              autoComplete="off"
              className="rounded-card border border-hairline bg-field px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[14px] font-semibold text-fg-body">City (optional)</span>
            <input
              value={draft.city}
              onChange={(e) => setDraft({ ...draft, city: e.target.value })}
              maxLength={60}
              placeholder="Roseville"
              autoComplete="off"
              className="rounded-card border border-hairline bg-field px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition"
            />
          </label>
        </div>

        <fieldset>
          <legend className="text-[14px] font-semibold text-fg-body mb-2">Star rating</legend>
          <div className="flex flex-wrap gap-2">
            {RATING_OPTIONS.map((value) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-2 rounded-btn border px-3.5 py-2 text-[13.5px] font-semibold transition-colors focus-within:ring-2 focus-within:ring-accent ${
                  draft.rating === value
                    ? 'border-accent bg-accent-wash text-accent-on-light'
                    : 'border-hairline bg-field text-fg-body hover:border-accent'
                }`}
              >
                {/* The radio stays a real input so arrow keys move through the group; the
                    label carries the focus ring since the input itself is visually hidden.
                    The stars are decorative here because the number next to them already
                    names the choice. */}
                <input
                  type="radio"
                  name="rating"
                  value={value}
                  checked={draft.rating === value}
                  onChange={() => setDraft({ ...draft, rating: value })}
                  className="sr-only"
                />
                <Stars rating={value} decorative />
                <span>
                  {value}
                  <span className="sr-only"> {value === 1 ? 'star' : 'stars'}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="grid gap-1.5">
          <span className="text-[14px] font-semibold text-fg-body">Review text</span>
          <textarea
            value={draft.text}
            onChange={(e) => setDraft({ ...draft, text: e.target.value })}
            required
            rows={5}
            maxLength={MAX_TEXT}
            aria-describedby="review-text-counter"
            className="rounded-card border border-hairline bg-field px-4 py-3 text-[15px] leading-relaxed outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition"
          />
          <span
            id="review-text-counter"
            className={`justify-self-end text-[13px] ${
              remaining <= 100 ? 'text-amber-600 font-semibold' : 'text-fg-muted'
            }`}
          >
            {draft.text.length} of {MAX_TEXT} characters
          </span>
        </label>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="grid gap-1.5">
            <span className="text-[14px] font-semibold text-fg-body">Review date (optional)</span>
            <input
              type="date"
              value={draft.review_date}
              onChange={(e) => setDraft({ ...draft, review_date: e.target.value })}
              max={todayISO()}
              className="rounded-card border border-hairline bg-field px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[14px] font-semibold text-fg-body">Where it was left</span>
            <select
              value={draft.source}
              onChange={(e) => setDraft({ ...draft, source: e.target.value })}
              className="rounded-card border border-hairline bg-field px-4 py-3 text-[15px] outline-none focus:border-accent"
            >
              {SOURCES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="justify-self-start rounded-btn bg-accent hover:bg-accent-hover disabled:opacity-60 text-fg-on-accent font-semibold px-6 py-3 transition-colors"
        >
          {saving ? 'Saving...' : 'Save review'}
        </button>
      </form>

      <div>
        <h2 className="font-display font-semibold text-xl text-fg mb-4">
          {rows && rows.length === LIST_LIMIT
            ? `Reviews (newest ${LIST_LIMIT})`
            : `All reviews${rows ? ` (${rows.length})` : ''}`}
        </h2>

        {loadFailed ? (
          <div className="rounded-card border border-hairline bg-surface-raised p-8 shadow-card text-center text-fg-muted">
            The reviews could not be read just now, so this list is incomplete. Refresh the page to
            try again.
          </div>
        ) : rows === null ? (
          <p role="status" className="text-fg-muted">
            Loading reviews...
          </p>
        ) : rows.length === 0 ? (
          <div className="rounded-card border border-hairline bg-surface-raised p-8 shadow-card text-center text-fg-muted">
            No reviews yet. Until you add some, the reviews page invites visitors to read your
            Google profile instead.
          </div>
        ) : (
          <ul className="grid gap-4">
            {rows.map((review) => (
              <li
                key={review.id}
                className={`rounded-card border border-hairline p-6 shadow-card ${
                  review.published ? 'bg-surface-raised' : 'bg-surface-sunken'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[17px] text-fg">
                      {review.author}
                      {review.city && (
                        <span className="font-normal text-fg-muted"> &middot; {review.city}</span>
                      )}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-fg-muted">
                      <Stars rating={review.rating} />
                      {review.review_date && <span>{formatReviewDate(review.review_date)}</span>}
                      {review.source && <span>&middot; {sourceLabel(review.source)}</span>}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-pressed={review.published}
                      onClick={() => togglePublished(review)}
                      className={`rounded-btn px-3 py-1 text-[12px] font-semibold transition-colors ${
                        review.published
                          ? 'bg-accent-wash text-accent-on-light'
                          : 'bg-surface-raised text-fg-muted border border-hairline'
                      }`}
                    >
                      {review.published ? 'Published' : 'Hidden'}
                      {/* Thirty rows of buttons named only "Published" tell a screen reader
                          user nothing. The visible word stays first so voice control still
                          matches what is on screen. */}
                      <span className="sr-only"> review from {review.author}</span>
                    </button>

                    {/* One button that changes what it does, not two that swap places: the
                        element stays mounted, so keyboard focus survives the confirm step. */}
                    <button
                      type="button"
                      onClick={() =>
                        confirmId === review.id ? remove(review) : setConfirmId(review.id)
                      }
                      className={
                        confirmId === review.id
                          ? 'rounded-btn border border-red-200 bg-red-50 px-3 py-1 text-[12px] font-semibold text-red-700 hover:bg-red-100 transition-colors'
                          : 'rounded-btn px-3 py-1 text-[12px] font-semibold text-red-600 hover:text-red-700 transition-colors'
                      }
                    >
                      {confirmId === review.id ? 'Delete for good' : 'Delete'}
                      <span className="sr-only"> review from {review.author}</span>
                    </button>

                    {confirmId === review.id && (
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="rounded-btn border border-hairline px-3 py-1 text-[12px] font-semibold text-fg-body hover:border-accent transition-colors"
                      >
                        Keep
                      </button>
                    )}
                  </div>
                </div>

                <p className="mt-3 rounded-card bg-surface-sunken/50 px-4 py-3 text-[14.5px] leading-relaxed text-fg-body whitespace-pre-line">
                  {review.text}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stars({ rating, decorative = false }: { rating: number; decorative?: boolean }) {
  // Clamp so a stray value coming back from the database cannot break String.repeat.
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : `${filled} out of 5 stars`}
      className="text-[14px] tracking-[0.06em]"
    >
      <span className="text-accent-on-light">{'★'.repeat(filled)}</span>
      <span className="text-fg-subtle">{'★'.repeat(5 - filled)}</span>
    </span>
  );
}

function sourceLabel(value: string): string {
  return SOURCES.find(([key]) => key === value)?.[1] ?? value;
}

function todayISO(): string {
  const now = new Date();
  // Shift by the timezone offset first. Sacramento is behind UTC, so late in the
  // evening toISOString already reports tomorrow, and the date picker would then
  // allow a review dated in the future.
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function formatReviewDate(value: string): string {
  // A date column arrives as "YYYY-MM-DD"; parsing it with new Date() would read it as
  // UTC midnight and display the previous day in Sacramento, so build it as a local date.
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { dateStyle: 'medium' });
}
