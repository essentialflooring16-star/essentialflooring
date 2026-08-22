import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type Item = {
  id: string;
  image_url: string;
  caption: string;
  alt: string;
  category: string;
  published: boolean;
  created_at: string;
};

const CATEGORIES = [
  ['hardwood-refinishing', 'Hardwood Refinishing'],
  ['lvp-vinyl', 'LVP & Vinyl Plank'],
  ['laminate', 'Laminate'],
  ['carpet', 'Carpet'],
  ['stairs', 'Stairs'],
  ['other', 'Other'],
] as const;

export default function PortfolioManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase!
      .from('portfolio_items')
      .select('*')
      .order('created_at', { ascending: false });
    setItems((data as Item[]) ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get('photo') as File | null;
    if (!file || file.size === 0) {
      setMsg('Choose a photo first.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setMsg('Photo is too large. Keep it under 8 MB.');
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase!.storage.from('portfolio').upload(path, file, {
        cacheControl: '31536000',
        contentType: file.type || 'image/jpeg',
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase!.storage.from('portfolio').getPublicUrl(path);

      const caption = String(fd.get('caption') || '').trim();
      const { error: insErr } = await supabase!.from('portfolio_items').insert({
        image_url: pub.publicUrl,
        caption,
        alt: caption || 'Flooring project by Essential Flooring',
        category: String(fd.get('category') || 'other'),
        published: true,
      });
      if (insErr) throw insErr;
      form.reset();
      setMsg('Photo published. It is already visible on the website portfolio.');
      await load();
    } catch (err) {
      setMsg(`Upload failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(item: Item) {
    await supabase!
      .from('portfolio_items')
      .update({ published: !item.published })
      .eq('id', item.id);
    await load();
  }

  async function remove(item: Item) {
    if (!confirm('Delete this photo from the website portfolio?')) return;
    // Remove the storage object too (path is the last URL segment).
    const path = item.image_url.split('/portfolio/').pop();
    if (path) await supabase!.storage.from('portfolio').remove([path]);
    await supabase!.from('portfolio_items').delete().eq('id', item.id);
    await load();
  }

  return (
    <div className="grid gap-8">
      <form
        onSubmit={onUpload}
        className="rounded-2xl border border-line bg-paper p-6 sm:p-8 shadow-card grid gap-4"
      >
        <h1 className="font-display font-semibold text-2xl text-ink">Add a project photo</h1>
        <p className="text-[14.5px] text-coffee -mt-2">
          Photos you publish here appear instantly in the website portfolio, no developer needed.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="grid gap-1.5">
            <span className="text-[14px] font-semibold text-bark">Photo (JPG/PNG, max 8 MB)</span>
            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/webp"
              required
              className="rounded-xl border border-line bg-cream px-4 py-2.5 text-[14px] file:mr-3 file:rounded-full file:border-0 file:bg-ink file:text-cream file:px-4 file:py-1.5 file:text-[13px] file:font-semibold"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[14px] font-semibold text-bark">Category</span>
            <select
              name="category"
              className="rounded-xl border border-line bg-cream px-4 py-3 text-[15px] outline-none focus:border-oak"
              defaultValue="lvp-vinyl"
            >
              {CATEGORIES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-1.5">
          <span className="text-[14px] font-semibold text-bark">
            Caption (shown in the gallery, e.g. "LVP installation in Roseville")
          </span>
          <input
            name="caption"
            required
            maxLength={120}
            className="rounded-xl border border-line bg-cream px-4 py-3 text-[15px] outline-none focus:border-oak focus:ring-2 focus:ring-oak/25 transition"
          />
        </label>

        {msg && (
          <p className="rounded-xl bg-sand border border-line text-bark text-[14px] px-4 py-3">{msg}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="justify-self-start rounded-full bg-oak hover:bg-oak-deep disabled:opacity-60 text-white font-semibold px-6 py-3 transition-colors"
        >
          {busy ? 'Uploading...' : 'Publish photo'}
        </button>
      </form>

      <div>
        <h2 className="font-display font-semibold text-xl text-ink mb-4">
          Uploaded photos ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className="text-coffee text-[15px]">
            Nothing uploaded yet. The website still shows the built-in project gallery.
          </p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <li key={item.id} className="rounded-xl border border-line bg-paper shadow-card overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.alt}
                  loading="lazy"
                  className={`aspect-[4/3] w-full object-cover ${item.published ? '' : 'opacity-40'}`}
                />
                <div className="p-3">
                  <p className="text-[13px] text-bark line-clamp-2 min-h-[2.4em]">{item.caption}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => togglePublished(item)}
                      className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${
                        item.published
                          ? 'bg-oak/15 text-oak-deep'
                          : 'bg-sand text-coffee'
                      }`}
                    >
                      {item.published ? 'Published' : 'Hidden'}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item)}
                      className="text-[12px] font-semibold text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
