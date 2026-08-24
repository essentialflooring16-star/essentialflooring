import { useEffect, useMemo, useRef, useState } from 'react';

export type GalleryItem = {
  src: string;
  thumb: string;
  alt: string;
  caption: string;
  category: string;
  width?: number;
  height?: number;
};

type Props = {
  items: GalleryItem[];
  categories: Record<string, string>;
};

const supaUrl = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const supaKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export default function Gallery({ items, categories }: Props) {
  const [filter, setFilter] = useState<string>('all');
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [dynamicItems, setDynamicItems] = useState<GalleryItem[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Photos the client uploads from the admin cabinet appear here automatically.
  useEffect(() => {
    if (!supaUrl || !supaKey) return;
    fetch(
      `${supaUrl}/rest/v1/portfolio_items?select=image_url,caption,alt,category&published=eq.true&order=created_at.desc`,
      { headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}` } },
    )
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: { image_url: string; caption: string; alt: string; category: string }[]) => {
        setDynamicItems(
          rows.map((r) => ({
            src: r.image_url,
            thumb: r.image_url,
            alt: r.alt || r.caption || 'Flooring project by Essential Flooring',
            caption: r.caption || '',
            category: r.category || 'other',
          })),
        );
      })
      .catch(() => {});
  }, []);

  const all = useMemo(() => [...dynamicItems, ...items], [dynamicItems, items]);
  const visible = useMemo(
    () => (filter === 'all' ? all : all.filter((i) => i.category === filter)),
    [all, filter],
  );

  const cats = useMemo(() => {
    const present = new Set(all.map((i) => i.category));
    return Object.entries(categories).filter(([k]) => present.has(k));
  }, [all, categories]);

  useEffect(() => {
    if (openIdx === null) return;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIdx(null);
      if (e.key === 'ArrowRight') setOpenIdx((i) => (i === null ? null : (i + 1) % visible.length));
      if (e.key === 'ArrowLeft')
        setOpenIdx((i) => (i === null ? null : (i - 1 + visible.length) % visible.length));
      if (e.key === 'Tab') {
        // Keep focus inside the dialog while it is open.
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>('button');
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && (active === first || !dialogRef.current?.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !dialogRef.current?.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      triggerRef.current?.focus();
    };
  }, [openIdx, visible.length]);

  return (
    <div>
      <div className="flex flex-wrap gap-2.5 mb-8" role="group" aria-label="Filter projects">
        <button
          type="button"
          aria-pressed={filter === 'all'}
          onClick={() => setFilter('all')}
          className={`rounded-full px-4.5 py-2 text-[14px] font-semibold transition-colors px-5 ${
            filter === 'all'
              ? 'bg-control-dark text-fg-on-dark'
              : 'bg-surface-raised border border-hairline text-fg-body hover:border-accent'
          }`}
        >
          All projects
        </button>
        {cats.map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-5 py-2 text-[14px] font-semibold transition-colors ${
              filter === key
                ? 'bg-control-dark text-fg-on-dark'
                : 'bg-surface-raised border border-hairline text-fg-body hover:border-accent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {visible.map((item, i) => (
          <li key={item.src}>
            <button
              type="button"
              onClick={(e) => {
                triggerRef.current = e.currentTarget;
                setOpenIdx(i);
              }}
              className="group relative block w-full overflow-hidden rounded-xl aspect-[4/3] shadow-card focus-visible:outline-2 focus-visible:outline-accent"
              aria-label={`Open photo: ${item.caption || item.alt}`}
            >
              <img
                src={item.thumb}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-scrim-media/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="absolute bottom-0 left-0 right-0 p-3.5 text-left text-fg-on-media text-[13.5px] font-medium leading-snug opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                {item.caption}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {openIdx !== null && visible[openIdx] && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-[90] bg-scrim-media/90 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={() => setOpenIdx(null)}
        >
          <figure
            className="max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={visible[openIdx].src}
              alt={visible[openIdx].alt}
              className="w-full max-h-[78vh] object-contain rounded-lg"
            />
            <figcaption className="mt-3 text-center text-fg-on-media/85 text-[15px]">
              {visible[openIdx].caption}
            </figcaption>
          </figure>

          {/* Arrow navigation swaps the image in place, which a screen reader
              would otherwise not notice. This announces the new position. */}
          <p aria-live="polite" className="sr-only">
            {`Photo ${openIdx + 1} of ${visible.length}. ${visible[openIdx].alt}`}
          </p>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => setOpenIdx(null)}
            className="absolute top-4 right-4 grid place-items-center size-11 rounded-full bg-fg-on-media/10 hover:bg-fg-on-media/25 text-fg-on-media transition-colors"
            aria-label="Close viewer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIdx((openIdx - 1 + visible.length) % visible.length);
            }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 grid place-items-center size-11 rounded-full bg-fg-on-media/10 hover:bg-fg-on-media/25 text-fg-on-media transition-colors"
            aria-label="Previous photo"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="m14 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIdx((openIdx + 1) % visible.length);
            }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 grid place-items-center size-11 rounded-full bg-fg-on-media/10 hover:bg-fg-on-media/25 text-fg-on-media transition-colors"
            aria-label="Next photo"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="m10 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
