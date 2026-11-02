// Build-time copy of the photos the client uploads from the cabinet, same
// contract as lib/reviews.ts. portfolio.astro turns each one into small webp
// thumbnails, so the grid no longer loads the full upload for a 350px tile, and
// the photos are in the HTML instead of being pushed in front of the grid after
// the page has drawn. Gallery.astro still reads the table in the browser, so a
// photo uploaded after the last deploy appears anyway.
export type PortfolioUpload = {
  image_url: string;
  caption: string | null;
  alt: string | null;
  category: string | null;
};

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export async function getPortfolioUploads(): Promise<PortfolioUpload[]> {
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/portfolio_items?select=image_url,caption,alt,category&published=eq.true&order=created_at.desc`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!res.ok) return [];
    const rows = await res.json();
    return Array.isArray(rows) ? (rows as PortfolioUpload[]) : [];
  } catch {
    // The browser fetch in Gallery.astro is the fallback, so a failed read
    // here costs speed, never photos.
    return [];
  }
}
