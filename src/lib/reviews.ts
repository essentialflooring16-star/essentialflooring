// Build-time review fetch, same contract as lib/blog.ts: the client pastes his
// real Google reviews into the admin cabinet, the deploy hook rebuilds, and the
// reviews ship as static HTML with valid structured data.
//
// src/data/reviews.json stays as a fallback so the site still builds (and can be
// seeded by hand) when Supabase is not configured yet.
import seed from '../data/reviews.json';

export type Review = {
  author: string;
  rating: number;
  text: string;
  city?: string | null;
  /** ISO date, e.g. 2026-08-01 */
  date?: string | null;
  source?: string;
};

type Row = {
  author: string;
  rating: number;
  text: string;
  city: string | null;
  review_date: string | null;
  source: string;
  sort_order: number;
  created_at: string;
};

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export async function getReviews(): Promise<Review[]> {
  const fallback = seed as Review[];
  if (!url || !key) return fallback;
  try {
    const res = await fetch(
      `${url}/rest/v1/reviews?select=*&published=eq.true&order=sort_order.asc,created_at.desc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) return fallback;
    const rows = (await res.json()) as Row[];
    if (!rows.length) return fallback;
    return rows.map((r) => ({
      author: r.author,
      rating: r.rating,
      text: r.text,
      city: r.city,
      date: r.review_date,
      source: r.source,
    }));
  } catch {
    return fallback;
  }
}

/**
 * Average to one decimal. Returned separately from the count because
 * schema.org AggregateRating needs both, and it must never be emitted from
 * zero reviews: a rating with no reviews behind it is a fabricated claim.
 */
export function ratingSummary(reviews: Review[]): { count: number; average: number } | null {
  if (!reviews.length) return null;
  const sum = reviews.reduce((t, r) => t + r.rating, 0);
  return { count: reviews.length, average: Math.round((sum / reviews.length) * 10) / 10 };
}

export function reviewDate(r: Review): string | null {
  if (!r.date) return null;
  const d = new Date(r.date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}
