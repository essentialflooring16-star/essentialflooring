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
  cover_alt?: string;
  published: boolean;
};

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;
let pending: Promise<Post[]> | undefined;

export function getPublishedPosts(): Promise<Post[]> {
  if (!url || !key) return Promise.resolve([]);
  // One snapshot per build keeps the index and article routes in sync. A failed
  // request must stop publication rather than silently remove existing posts.
  return pending ??= fetchPosts();
}

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch(
    `${url}/rest/v1/posts?select=*&published=eq.true&order=created_at.desc`,
    {
      headers: { apikey: key!, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!res.ok) throw new Error(`Cannot load published blog posts (HTTP ${res.status}).`);
  const posts = await res.json();
  if (!Array.isArray(posts)) throw new Error('Published blog posts returned an invalid response.');
  return (posts as Post[]).map((post) => {
    // A leading Markdown image can also supply a cover, including an existing
    // site asset. Keep its description for accessible article imagery.
    if (post.cover_url) return post;
    const image = post.content.match(/^\s*!\[([^\]]*)\]\((\/[^\s)]+|https?:\/\/[^\s)]+)\)\s*(?:\r?\n|$)/);
    return image ? {
      ...post,
      cover_url: image[2],
      cover_alt: image[1],
      content: post.content.slice(image[0].length),
    } : post;
  });
}

export function postDate(p: Post): string {
  return new Date(p.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
