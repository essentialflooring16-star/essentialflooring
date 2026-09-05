import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useT } from '../../lib/admin-i18n';

type Item = {
  id: string;
  image_url: string;
  caption: string;
  alt: string;
  category: string;
  published: boolean;
  created_at: string;
};

// Prima valoare e codul salvat in coloana category din Supabase si nu se
// traduce niciodata; a doua e cheia de dictionar pentru eticheta care apare in
// lista derulanta din cabinet.
const CATEGORIES = [
  ['hardwood-refinishing', 'portfolio.category_hardwood'],
  ['lvp-vinyl', 'portfolio.category_lvp'],
  ['laminate', 'portfolio.category_laminate'],
  ['carpet', 'portfolio.category_carpet'],
  ['stairs', 'portfolio.category_stairs'],
  ['other', 'portfolio.category_other'],
] as const;

export default function PortfolioManager() {
  const { t } = useT();
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
      setMsg(t('portfolio.error_no_file'));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setMsg(t('portfolio.error_too_large'));
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
        // Textul alternativ se salveaza in baza de date si se randeaza pe
        // paginile publice, care raman integral in engleza. Nu trece prin t():
        // limba cabinetului nu are ce cauta pe site.
        alt: caption || 'Flooring project by Essential Flooring',
        category: String(fd.get('category') || 'other'),
        published: true,
      });
      if (insErr) throw insErr;
      form.reset();
      setMsg(t('portfolio.upload_success'));
      await load();
    } catch (err) {
      console.error(err);
      setMsg(t('portfolio.upload_error'));
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
    if (!confirm(t('portfolio.delete_confirm'))) return;
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
        className="rounded-card border border-hairline bg-surface-raised p-6 sm:p-8 shadow-card grid gap-4"
      >
        <h1 className="font-display font-semibold text-2xl text-fg">{t('portfolio.heading')}</h1>
        <p className="text-[14.5px] text-fg-muted -mt-2">{t('portfolio.intro')}</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="grid gap-1.5">
            <span className="text-[14px] font-semibold text-fg-body">{t('portfolio.photo_label')}</span>
            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/webp"
              required
              className="rounded-card border border-hairline bg-field px-4 py-2.5 text-[14px] file:mr-3 file:rounded-btn file:border-0 file:bg-control-dark file:text-fg-on-dark file:px-4 file:py-1.5 file:text-[13px] file:font-semibold"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[14px] font-semibold text-fg-body">{t('portfolio.category_label')}</span>
            <select
              name="category"
              className="rounded-card border border-hairline bg-field px-4 py-3 text-[15px] outline-none focus:border-accent"
              defaultValue="lvp-vinyl"
            >
              {CATEGORIES.map(([value, labelKey]) => (
                <option key={value} value={value}>
                  {t(labelKey)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-1.5">
          <span className="text-[14px] font-semibold text-fg-body">
            {t('portfolio.caption_label')}
          </span>
          <input
            name="caption"
            required
            maxLength={120}
            className="rounded-card border border-hairline bg-field px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition"
          />
        </label>

        {msg && (
          <p className="rounded-card bg-surface-sunken border border-hairline text-fg-body text-[14px] px-4 py-3">{msg}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="justify-self-start rounded-btn bg-accent hover:bg-accent-hover disabled:opacity-60 text-fg-on-accent font-semibold px-6 py-3 transition-colors"
        >
          {busy ? t('portfolio.submit_busy') : t('portfolio.submit')}
        </button>
      </form>

      <div>
        <h2 className="font-display font-semibold text-xl text-fg mb-4">
          {t('portfolio.list_heading', { n: items.length })}
        </h2>
        {items.length === 0 ? (
          <p className="text-fg-muted text-[15px]">{t('portfolio.empty_state')}</p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <li key={item.id} className="rounded-media border border-hairline bg-surface-raised shadow-card overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.alt}
                  loading="lazy"
                  className={`aspect-[4/3] w-full object-cover ${item.published ? '' : 'opacity-40'}`}
                />
                <div className="p-3">
                  <p className="text-[13px] text-fg-body line-clamp-2 min-h-[2.4em]">{item.caption}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => togglePublished(item)}
                      className={`rounded-btn px-3 py-1 text-[12px] font-semibold transition-colors ${
                        item.published
                          ? 'bg-accent-wash text-accent-on-light'
                          : 'bg-surface-sunken text-fg-muted'
                      }`}
                    >
                      {item.published ? t('portfolio.status_published') : t('portfolio.status_hidden')}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item)}
                      className="text-[12px] font-semibold text-red-600 hover:text-red-700"
                    >
                      {t('portfolio.action_delete')}
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
