import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type Post = {
  id: string;
  created_at: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  published: boolean;
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export default function BlogManager() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase!
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts((data as Post[]) ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function triggerRebuild() {
    const { data } = await supabase!
      .from('app_settings')
      .select('value')
      .eq('key', 'deploy_hook_url')
      .maybeSingle();
    const hook = data?.value;
    if (!hook) {
      setMsg('Saved. Ask your developer to set the deploy hook so changes go live automatically.');
      return;
    }
    // The stored value is a credential and this browser POSTs to it. The database
    // constrains it too, but never fetch a URL from a table without checking the
    // host first: a bad row here would turn the admin's browser into a client for
    // whatever host it named.
    if (!hook.startsWith('https://api.vercel.com/v1/integrations/deploy/')) {
      setMsg('Saved, but the stored deploy hook does not look like a Vercel hook, so it was not called.');
      return;
    }
    try {
      await fetch(hook, { method: 'POST', mode: 'no-cors' });
      setMsg('Saved. The website is rebuilding now, changes go live in 1-2 minutes.');
    } catch {
      setMsg('Saved, but the rebuild request failed. Try again or contact your developer.');
    }
  }

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get('title') || '').trim();
    const record = {
      title,
      slug: editing?.slug || slugify(title),
      excerpt: String(fd.get('excerpt') || '').trim(),
      content: String(fd.get('content') || '').trim(),
      published: fd.get('published') === 'on',
      updated_at: new Date().toISOString(),
    };

    try {
      let coverUrl = editing?.cover_url ?? null;
      const cover = fd.get('cover') as File | null;
      if (cover && cover.size > 0) {
        if (cover.size > 8 * 1024 * 1024) throw new Error('Cover photo is over 8 MB.');
        const path = `blog/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${cover.name.split('.').pop() || 'jpg'}`;
        const { error: upErr } = await supabase!.storage.from('portfolio').upload(path, cover, {
          cacheControl: '31536000',
          contentType: cover.type || 'image/jpeg',
        });
        if (upErr) throw upErr;
        coverUrl = supabase!.storage.from('portfolio').getPublicUrl(path).data.publicUrl;
      }

      if (editing) {
        const { error } = await supabase!
          .from('posts')
          .update({ ...record, cover_url: coverUrl })
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase!.from('posts').insert({ ...record, cover_url: coverUrl });
        if (error) throw error;
      }
      setEditing(null);
      setCreating(false);
      await load();
      await triggerRebuild();
    } catch (err) {
      console.error(err);
      setMsg("Could not save the post. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(post: Post) {
    await supabase!.from('posts').update({ published: !post.published }).eq('id', post.id);
    await load();
    await triggerRebuild();
  }

  async function remove(post: Post) {
    if (!confirm(`Delete the article "${post.title}"?`)) return;
    await supabase!.from('posts').delete().eq('id', post.id);
    await load();
    await triggerRebuild();
  }

  if (creating || editing) {
    return (
      <form onSubmit={onSave} className="rounded-2xl border border-hairline bg-surface-raised p-6 sm:p-8 shadow-card grid gap-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display font-semibold text-2xl text-fg">
            {editing ? 'Edit article' : 'New article'}
          </h1>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setCreating(false);
              setMsg(null);
            }}
            className="text-[14px] font-semibold text-fg-muted hover:text-fg"
          >
            Back to list
          </button>
        </div>

        <label className="grid gap-1.5">
          <span className="text-[14px] font-semibold text-fg-body">Title *</span>
          <input
            name="title"
            required
            defaultValue={editing?.title}
            maxLength={140}
            className="rounded-xl border border-hairline bg-field px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-[14px] font-semibold text-fg-body">
            Short summary (shown on the blog page and Google)
          </span>
          <textarea
            name="excerpt"
            rows={2}
            maxLength={200}
            defaultValue={editing?.excerpt}
            className="rounded-xl border border-hairline bg-field px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition resize-y"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-[14px] font-semibold text-fg-body">Cover photo</span>
          {editing?.cover_url && (
            <img src={editing.cover_url} alt="" className="w-48 aspect-[16/10] object-cover rounded-lg mb-1" />
          )}
          <input
            type="file"
            name="cover"
            accept="image/jpeg,image/png,image/webp"
            className="rounded-xl border border-hairline bg-field px-4 py-2.5 text-[14px] file:mr-3 file:rounded-full file:border-0 file:bg-control-dark file:text-fg-on-dark file:px-4 file:py-1.5 file:text-[13px] file:font-semibold"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-[14px] font-semibold text-fg-body">Article text *</span>
          <span className="text-[12.5px] text-fg-muted -mt-1">
            Plain text works fine. For a subheading start a line with ## and for a list start lines with -
          </span>
          <textarea
            name="content"
            rows={14}
            required
            defaultValue={editing?.content}
            className="rounded-xl border border-hairline bg-field px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition resize-y font-mono"
          />
        </label>

        <label className="flex items-center gap-2.5">
          <input type="checkbox" name="published" defaultChecked={editing?.published ?? true} className="size-4 accent-[var(--ef-accent-fill)]" />
          <span className="text-[14.5px] font-semibold text-fg-body">Published (visible on the website)</span>
        </label>

        {msg && <p className="rounded-xl bg-surface-sunken border border-hairline text-fg-body text-[14px] px-4 py-3">{msg}</p>}

        <button
          type="submit"
          disabled={busy}
          className="justify-self-start rounded-full bg-accent hover:bg-accent-hover disabled:opacity-60 text-fg-on-accent font-semibold px-6 py-3 transition-colors"
        >
          {busy ? 'Saving...' : editing ? 'Save changes' : 'Publish article'}
        </button>
      </form>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <h1 className="font-display font-semibold text-2xl text-fg">Blog articles</h1>
        <button
          type="button"
          onClick={() => {
            setCreating(true);
            setMsg(null);
          }}
          className="rounded-full bg-accent hover:bg-accent-hover text-fg-on-accent font-semibold px-5 py-2.5 transition-colors"
        >
          New article
        </button>
      </div>
      <p className="text-[14.5px] text-fg-muted mb-6">
        Articles help the website rank on Google. Photos plus a few honest paragraphs about a
        recent project work great.
      </p>

      {msg && <p className="mb-4 rounded-xl bg-surface-sunken border border-hairline text-fg-body text-[14px] px-4 py-3">{msg}</p>}

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-hairline bg-surface-raised p-8 shadow-card text-center text-fg-muted">
          No articles yet. Write the first one, a before and after story is a great start.
        </div>
      ) : (
        <ul className="grid gap-3">
          {posts.map((post) => (
            <li key={post.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-hairline bg-surface-raised p-4 shadow-card">
              {post.cover_url ? (
                <img src={post.cover_url} alt="" className="w-20 aspect-[4/3] object-cover rounded-lg" />
              ) : (
                <span className="w-20 aspect-[4/3] rounded-lg bg-surface-sunken" aria-hidden="true"></span>
              )}
              <div className="flex-1 min-w-[200px]">
                <p className="font-semibold text-[16px] text-fg">{post.title}</p>
                <p className="text-[13px] text-fg-muted mt-0.5">
                  {new Date(post.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  {' · '}/blog/{post.slug}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => togglePublished(post)}
                  className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                    post.published ? 'bg-accent-wash text-accent-on-light' : 'bg-surface-sunken text-fg-muted'
                  }`}
                >
                  {post.published ? 'Published' : 'Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(post)}
                  className="rounded-full border border-hairline px-3 py-1.5 text-[12.5px] font-semibold text-fg-body hover:border-accent"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(post)}
                  className="text-[12.5px] font-semibold text-red-600 hover:text-red-700 px-2"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
