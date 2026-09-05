// Editorul de continut al site-ului.
//
// Ce rezolva: pana acum clientul putea adauga poze, articole si recenzii, dar nu
// putea schimba un cuvant din textele paginilor. Le cerea dezvoltatorului.
//
// Trei lucruri sunt esentiale in ecranul asta, si toate trei tin de intelegere,
// nu de cod:
//   1. Textele sunt grupate pe PAGINI, cum le vede el pe site, nu pe chei.
//   2. Se vede mereu cand un text a fost schimbat fata de cel initial, si se
//      poate reveni la initial cu un buton.
//   3. Salvat NU inseamna publicat. Site-ul e static, deci pana la reconstructie
//      textul nou sta doar in baza de date. Bara de jos spune asta permanent.
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useT } from '../../lib/admin-i18n';
import { publishSite, publishMessageKey, lastPublishedAt } from '../../lib/admin-publish';
import { CONTENT_FIELDS, CITY_FIELDS, CITY_LIST } from '../../data/content';
import { GROUPS, type ContentField, type GroupId } from '../../data/content/types';

type CityRecord = Record<string, unknown> & { slug: string; city: string };

export default function ContentManager() {
  const { t, lang } = useT();
  const [group, setGroup] = useState<GroupId>('firma');
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const [citySlug, setCitySlug] = useState<string>(CITY_LIST[0]?.slug ?? '');
  const [cities, setCities] = useState<CityRecord[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState<Date | null>(null);
  const [changedAt, setChangedAt] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase!.from('site_content').select('key,value,updated_at');
      if (!alive) return;
      const rows = (data ?? []) as { key: string; value: string; updated_at: string }[];
      setSaved(Object.fromEntries(rows.map((r) => [r.key, r.value])));
      const newest = rows
        .map((r) => new Date(r.updated_at))
        .filter((d) => !Number.isNaN(d.getTime()))
        .sort((a, b) => b.getTime() - a.getTime())[0];
      setChangedAt(newest ?? null);
      setPublishedAt(await lastPublishedAt());
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Cele 25 de orase au fiecare cinci paragrafe unice: peste 200 KB de text pe
  // care nu are rost sa-i incarce cine deschide cabinetul ca sa schimbe un
  // telefon. Se aduc doar cand se deschide chiar sectiunea de zone.
  useEffect(() => {
    if (group !== 'zone' || cities) return;
    import('../../data/cities.json').then((m) => setCities(m.default as CityRecord[]));
  }, [group, cities]);

  const cityDefaults = useMemo(() => {
    const record = cities?.find((c) => c.slug === citySlug);
    if (!record) return {};
    const out: Record<string, string> = {};
    for (const f of CITY_FIELDS) {
      const raw = record[f.source];
      out[`city.${citySlug}.${f.suffix}`] =
        typeof raw === 'string' ? raw : raw === undefined ? '' : JSON.stringify(raw, null, 0);
    }
    return out;
  }, [cities, citySlug]);

  /** Implicitul unui camp: din registru, sau din cities.json pentru orase. */
  function defaultOf(key: string, field?: ContentField): string {
    if (field) return field.default;
    return cityDefaults[key] ?? '';
  }

  function valueOf(key: string, field?: ContentField): string {
    if (key in drafts) return drafts[key];
    if (key in saved) return saved[key];
    return defaultOf(key, field);
  }

  function isChanged(key: string, field?: ContentField): boolean {
    return valueOf(key, field).trim() !== defaultOf(key, field).trim();
  }

  const dirty = Object.keys(drafts).length > 0;
  // "Salvat dar inca nu pe site": exista modificari mai noi decat ultima
  // publicare. Daca nu s-a publicat niciodata dar exista randuri, tot asa e.
  const unpublished =
    !!changedAt && (!publishedAt || changedAt.getTime() > publishedAt.getTime());

  const visibleFields = useMemo(() => {
    const q = query.trim().toLowerCase();
    const inGroup = CONTENT_FIELDS.filter((f) => f.group === group);
    if (!q) return inGroup;
    return CONTENT_FIELDS.filter((f) => {
      const hay = [f.label.ro, f.label.en, f.help?.ro ?? '', f.help?.en ?? '', f.default, f.key]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [group, query]);

  const sections = useMemo(() => {
    const map = new Map<string, { title: string; fields: ContentField[] }>();
    for (const f of visibleFields) {
      const title = f.section ? f.section[lang] : '';
      const bucket = map.get(title) ?? { title, fields: [] };
      bucket.fields.push(f);
      map.set(title, bucket);
    }
    return [...map.values()];
  }, [visibleFields, lang]);

  function edit(key: string, value: string) {
    setDrafts((d) => ({ ...d, [key]: value }));
    setMsg(null);
  }

  /** Revenirea la textul initial sterge randul, nu salveaza implicitul: asa,
   *  daca textul din cod se schimba la o actualizare, pagina il ia pe cel nou. */
  async function resetField(key: string) {
    setBusy(true);
    try {
      await supabase!.from('site_content').delete().eq('key', key);
      setSaved((s) => {
        const next = { ...s };
        delete next[key];
        return next;
      });
      setDrafts((d) => {
        const next = { ...d };
        delete next[key];
        return next;
      });
      setMsg(t('content.reset_done'));
    } catch {
      setMsg(t('content.save_failed'));
    } finally {
      setBusy(false);
    }
  }

  async function saveAll() {
    const entries = Object.entries(drafts);
    if (!entries.length) return;
    setBusy(true);
    setMsg(null);
    try {
      // Un camp golit inseamna "revino la textul initial", nu "lasa gol": un
      // titlu gol ar rupe pagina, si nimeni nu goleste un camp intentionat ca
      // sa nu apara nimic acolo.
      const toDelete = entries.filter(([, v]) => v.trim() === '').map(([k]) => k);
      const toUpsert = entries
        .filter(([, v]) => v.trim() !== '')
        .map(([key, value]) => ({ key, value }));

      if (toDelete.length) {
        const { error } = await supabase!.from('site_content').delete().in('key', toDelete);
        if (error) throw error;
      }
      if (toUpsert.length) {
        const { error } = await supabase!
          .from('site_content')
          .upsert(toUpsert, { onConflict: 'key' });
        if (error) throw error;
      }

      setSaved((s) => {
        const next = { ...s };
        for (const k of toDelete) delete next[k];
        for (const row of toUpsert) next[row.key] = row.value;
        return next;
      });
      setDrafts({});
      setChangedAt(new Date());
      setMsg(t('content.saved'));
    } catch {
      setMsg(t('content.save_failed'));
    } finally {
      setBusy(false);
    }
  }

  async function onPublish() {
    setBusy(true);
    setMsg(null);
    const result = await publishSite();
    if (result.ok) setPublishedAt(new Date());
    setMsg(t(publishMessageKey(result)));
    setBusy(false);
  }

  if (loading) return <p className="text-fg-muted py-16 text-center">{t('app.loading')}</p>;

  return (
    <section className="pb-32">
      <header className="mb-6">
        <h2 className="font-display font-semibold text-2xl text-fg">{t('content.title')}</h2>
        <p className="mt-1.5 text-[15px] text-fg-muted leading-relaxed max-w-2xl">
          {t('content.intro')}
        </p>
      </header>

      <div className="flex flex-wrap gap-2 mb-5">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => {
              setGroup(g.id);
              setQuery('');
            }}
            aria-current={group === g.id && !query ? 'true' : undefined}
            className={`rounded-btn px-4 py-2 text-[14px] font-semibold transition-colors ${
              group === g.id && !query
                ? 'bg-control-dark text-fg-on-dark'
                : 'bg-surface-raised border border-hairline text-fg-body hover:border-accent'
            }`}
          >
            {g.label[lang]}
          </button>
        ))}
      </div>

      <label className="block mb-6">
        <span className="sr-only">{t('content.search')}</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('content.search')}
          className="w-full rounded-card border border-hairline bg-field px-4 py-2.5 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition"
        />
      </label>

      {!query && (
        <p className="mb-6 text-[14.5px] text-fg-muted leading-relaxed">
          {GROUPS.find((g) => g.id === group)?.help[lang]}
        </p>
      )}

      {group === 'zone' && !query && (
        <CityPicker
          cities={cities}
          value={citySlug}
          onChange={setCitySlug}
          label={t('content.pick_city')}
          loading={t('app.loading')}
        />
      )}

      {group === 'zone' && !query && cities && (
        <div className="grid gap-5 mt-6">
          {CITY_FIELDS.map((f) => {
            const key = `city.${citySlug}.${f.suffix}`;
            return (
              <Field
                key={key}
                id={key}
                label={f.label[lang]}
                help={f.help?.[lang]}
                type={f.type}
                value={valueOf(key)}
                changed={isChanged(key)}
                softMax={f.softMax}
                page={`/service-areas/${citySlug}/`}
                onChange={(v) => edit(key, v)}
                onReset={() => resetField(key)}
                t={t}
              />
            );
          })}
        </div>
      )}

      {(group !== 'zone' || query) &&
        sections.map((sec) => (
          <div key={sec.title || 'default'} className="mb-10">
            {sec.title && (
              <h3 className="font-display font-semibold text-[17px] text-fg mb-4 pb-2 border-b border-hairline">
                {sec.title}
              </h3>
            )}
            <div className="grid gap-5">
              {sec.fields.map((f) => (
                <Field
                  key={f.key}
                  id={f.key}
                  label={f.label[lang]}
                  help={f.help?.[lang]}
                  type={f.type}
                  value={valueOf(f.key, f)}
                  changed={isChanged(f.key, f)}
                  softMax={f.softMax}
                  page={f.page}
                  onChange={(v) => edit(f.key, v)}
                  onReset={() => resetField(f.key)}
                  t={t}
                />
              ))}
            </div>
          </div>
        ))}

      {query && !visibleFields.length && (
        <p className="py-12 text-center text-fg-muted">{t('content.no_results')}</p>
      )}

      <ActionBar
        dirty={dirty}
        dirtyCount={Object.keys(drafts).length}
        unpublished={unpublished}
        busy={busy}
        msg={msg}
        onSave={saveAll}
        onPublish={onPublish}
        t={t}
      />
    </section>
  );
}

function CityPicker({
  cities,
  value,
  onChange,
  label,
  loading,
}: {
  cities: CityRecord[] | null;
  value: string;
  onChange: (slug: string) => void;
  label: string;
  loading: string;
}) {
  if (!cities) return <p className="text-fg-muted text-[15px]">{loading}</p>;
  return (
    <label className="grid gap-1.5 max-w-sm">
      <span className="text-[14px] font-semibold text-fg-body">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-card border border-hairline bg-field px-4 py-2.5 text-[15px] outline-none focus:border-accent transition"
      >
        {cities.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.city}
          </option>
        ))}
      </select>
    </label>
  );
}

type FieldProps = {
  id: string;
  label: string;
  help?: string;
  type: ContentField['type'];
  value: string;
  changed: boolean;
  softMax?: number;
  page?: string;
  onChange: (value: string) => void;
  onReset: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

function Field({ id, label, help, type, value, changed, softMax, page, onChange, onReset, t }: FieldProps) {
  const tooLong = softMax !== undefined && value.length > softMax;

  return (
    <div className="rounded-card border border-hairline bg-surface-raised p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-2">
        <label htmlFor={id} className="text-[15px] font-semibold text-fg">
          {label}
        </label>
        <div className="flex items-center gap-3 text-[13px]">
          {page && (
            <a
              href={page}
              target="_blank"
              rel="noreferrer"
              className="text-fg-muted underline underline-offset-2 hover:text-accent"
            >
              {t('content.see_on_site')}
            </a>
          )}
          {changed && (
            <button
              type="button"
              onClick={onReset}
              className="text-accent font-semibold hover:underline underline-offset-2"
            >
              {t('content.reset')}
            </button>
          )}
        </div>
      </div>

      {help && <p className="text-[13.5px] text-fg-muted leading-relaxed mb-3">{help}</p>}

      <FieldInput id={id} type={type} value={value} onChange={onChange} t={t} />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[12.5px]">
        {changed && <span className="text-accent font-semibold">{t('content.edited')}</span>}
        {tooLong && (
          <span className="text-fg-muted">{t('content.too_long', { n: value.length, max: softMax! })}</span>
        )}
      </div>
    </div>
  );
}

const INPUT_CLASS =
  'w-full rounded-card border border-hairline bg-field px-3.5 py-2.5 text-[15px] leading-relaxed outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition';

function FieldInput({
  id,
  type,
  value,
  onChange,
  t,
}: {
  id: string;
  type: ContentField['type'];
  value: string;
  onChange: (v: string) => void;
  t: FieldProps['t'];
}) {
  if (type === 'pairs' || type === 'faq') {
    return <PairsInput id={id} kind={type} value={value} onChange={onChange} t={t} />;
  }

  if (type === 'textarea' || type === 'list') {
    const rows = type === 'list' ? 5 : Math.min(12, Math.max(4, Math.ceil(value.length / 90)));
    return (
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_CLASS}
      />
    );
  }

  const htmlType =
    type === 'number' ? 'number' : type === 'tel' ? 'tel' : type === 'email' ? 'email' : type === 'url' ? 'url' : 'text';

  return (
    <input
      id={id}
      type={htmlType}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={INPUT_CLASS}
    />
  );
}

/**
 * Editor pentru listele de perechi (avantaje, pasi, intrebari). Valoarea din
 * baza de date e JSON, dar clientul nu vede niciodata JSON: vede randuri cu
 * doua campuri, pe care le poate adauga, sterge si muta.
 *
 * Daca valoarea salvata e JSON stricat, editorul nu incearca sa o repare si nu
 * o arunca: arata textul brut intr-un camp, ca sa nu se piarda continut.
 */
function PairsInput({
  id,
  kind,
  value,
  onChange,
  t,
}: {
  id: string;
  kind: 'pairs' | 'faq';
  value: string;
  onChange: (v: string) => void;
  t: FieldProps['t'];
}) {
  const firstKey = kind === 'faq' ? 'q' : 'title';
  const secondKey = kind === 'faq' ? 'a' : 'text';

  let items: Record<string, string>[] | null = null;
  try {
    const parsed = JSON.parse(value || '[]');
    if (Array.isArray(parsed)) {
      items = parsed.map((p) => ({
        [firstKey]: String(p?.[firstKey] ?? ''),
        [secondKey]: String(p?.[secondKey] ?? ''),
      }));
    }
  } catch {
    items = null;
  }

  if (!items) {
    return (
      <div>
        <p className="text-[13px] text-accent font-semibold mb-2">{t('content.broken_json')}</p>
        <textarea
          id={id}
          rows={8}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={INPUT_CLASS}
        />
      </div>
    );
  }

  const write = (next: Record<string, string>[]) => onChange(JSON.stringify(next));

  return (
    <div className="grid gap-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-card border border-hairline bg-surface p-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[12.5px] font-semibold uppercase tracking-[0.1em] text-fg-muted">
              {t('content.item_n', { n: i + 1 })}
            </span>
            <div className="flex items-center gap-2 text-[12.5px]">
              <button
                type="button"
                disabled={i === 0}
                onClick={() => {
                  const next = [...items!];
                  [next[i - 1], next[i]] = [next[i], next[i - 1]];
                  write(next);
                }}
                className="px-1.5 py-0.5 text-fg-muted hover:text-accent disabled:opacity-30"
                aria-label={t('content.move_up')}
              >
                {'↑'}
              </button>
              <button
                type="button"
                disabled={i === items.length - 1}
                onClick={() => {
                  const next = [...items!];
                  [next[i], next[i + 1]] = [next[i + 1], next[i]];
                  write(next);
                }}
                className="px-1.5 py-0.5 text-fg-muted hover:text-accent disabled:opacity-30"
                aria-label={t('content.move_down')}
              >
                {'↓'}
              </button>
              <button
                type="button"
                onClick={() => write(items!.filter((_, j) => j !== i))}
                className="text-fg-muted hover:text-accent font-semibold"
              >
                {t('content.remove')}
              </button>
            </div>
          </div>
          <input
            type="text"
            value={item[firstKey]}
            placeholder={t(kind === 'faq' ? 'content.question' : 'content.item_title')}
            onChange={(e) => {
              const next = [...items!];
              next[i] = { ...next[i], [firstKey]: e.target.value };
              write(next);
            }}
            className={`${INPUT_CLASS} mb-2 font-semibold`}
          />
          <textarea
            rows={3}
            value={item[secondKey]}
            placeholder={t(kind === 'faq' ? 'content.answer' : 'content.item_text')}
            onChange={(e) => {
              const next = [...items!];
              next[i] = { ...next[i], [secondKey]: e.target.value };
              write(next);
            }}
            className={INPUT_CLASS}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => write([...items!, { [firstKey]: '', [secondKey]: '' }])}
        className="justify-self-start rounded-btn border border-hairline px-4 py-2 text-[14px] font-semibold text-fg-body hover:border-accent transition-colors"
      >
        {t('content.add_item')}
      </button>
    </div>
  );
}

/**
 * Bara de jos. Sta fixata pentru ca cele doua stari pe care le arata sunt exact
 * cele pe care un client le pierde din vedere: ca are modificari nesalvate, si
 * ca ce a salvat nu e inca pe site.
 */
function ActionBar({
  dirty,
  dirtyCount,
  unpublished,
  busy,
  msg,
  onSave,
  onPublish,
  t,
}: {
  dirty: boolean;
  dirtyCount: number;
  unpublished: boolean;
  busy: boolean;
  msg: string | null;
  onSave: () => void;
  onPublish: () => void;
  t: FieldProps['t'];
}) {
  if (!dirty && !unpublished && !msg) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-surface-raised/95 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3.5 flex flex-wrap items-center gap-x-5 gap-y-2.5">
        <p className="flex-1 min-w-[16rem] text-[14px] text-fg-body leading-snug">
          {msg
            ? msg
            : dirty
              ? t('content.unsaved', { n: dirtyCount })
              : t('content.unpublished')}
        </p>
        {dirty && (
          <button
            type="button"
            onClick={onSave}
            disabled={busy}
            className="rounded-btn bg-accent hover:bg-accent-hover disabled:opacity-60 text-fg-on-accent font-semibold px-6 py-2.5 text-[14.5px] transition-colors"
          >
            {busy ? t('content.saving') : t('content.save')}
          </button>
        )}
        {!dirty && unpublished && (
          <button
            type="button"
            onClick={onPublish}
            disabled={busy}
            className="rounded-btn bg-accent hover:bg-accent-hover disabled:opacity-60 text-fg-on-accent font-semibold px-6 py-2.5 text-[14.5px] transition-colors"
          >
            {busy ? t('content.publishing') : t('content.publish')}
          </button>
        )}
      </div>
    </div>
  );
}
