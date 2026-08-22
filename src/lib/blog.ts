// Build-time blog fetch. Posts are written in the admin cabinet (Supabase),
// and the site is rebuilt via a Vercel deploy hook when the client hits
// "Publish", so every article ships as fully static, SEO-ready HTML.
export type Post = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  published: boolean;
};

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export async function getPublishedPosts(): Promise<Post[]> {
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/posts?select=*&published=eq.true&order=created_at.desc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) return [];
    return (await res.json()) as Post[];
  } catch {
    return [];
  }
}

export function postDate(p: Post): string {
  return new Date(p.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
