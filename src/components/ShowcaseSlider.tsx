import { useCallback, useRef, useState } from 'react';

export type ShowcasePair = {
  id: string;
  beforeSrc: string;
  afterSrc: string;
  thumbSrc: string;
  label: string;
  city: string;
  caption: string;
};

type Props = {
  pairs: ShowcasePair[];
};

export default function ShowcaseSlider({ pairs }: Props) {
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState(56);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(97, Math.max(3, pct)));
  }, []);

  const pair = pairs[active];
  if (!pair) return null;

  return (
    <div>
      <div
        ref={ref}
        className="relative aspect-[16/10] w-full overflow-hidden rounded-media select-none shadow-lift touch-pan-y has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          update(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && update(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        <img
          key={`a-${pair.id}`}
          src={pair.afterSrc}
          alt={`After: ${pair.caption}`}
          className="absolute inset-0 h-full w-full object-cover"
          decoding="async"
        />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <img
            key={`b-${pair.id}`}
            src={pair.beforeSrc}
            alt={`Before: ${pair.caption}`}
            className="absolute inset-0 h-full w-full object-cover"
            decoding="async"
          />
        </div>

        <div
          className="absolute inset-y-0 w-[3px] bg-fg-on-media shadow-[0_0_12px_rgba(0,0,0,0.45)]"
          style={{ left: `calc(${pos}% - 1.5px)` }}
          aria-hidden="true"
        >
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center size-11 rounded-btn bg-fg-on-media shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ef-fg)" strokeWidth="2.2">
              <path d="m9 6-5 6 5 6M15 6l5 6-5 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Compare before and after"
          aria-valuetext={`${Math.round(pos)}% of the before photo shown`}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0 focus:outline-none"
        />

        <span className="absolute top-4 left-4 rounded-btn bg-scrim-media/55 text-fg-on-media text-[12px] font-semibold uppercase tracking-wider px-3 py-1.5 pointer-events-none">
          Before
        </span>
        <span className="absolute top-4 right-4 rounded-btn bg-accent text-fg-on-accent text-[12px] font-semibold uppercase tracking-wider px-3 py-1.5 pointer-events-none">
          After
        </span>

        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-scrim-media/70 to-transparent px-5 pt-10 pb-4 pointer-events-none">
          <p className="text-fg-on-media text-[15px] font-medium">{pair.caption}</p>
          <p className="text-fg-on-media/75 text-[13px] mt-0.5">
            {pair.label} &middot; {pair.city}, CA
          </p>
        </div>
      </div>

      <div
        className="mt-4 flex gap-2.5 overflow-x-auto pb-2 snap-x"
        role="group"
        aria-label="Choose a transformation project"
      >
        {pairs.map((p, i) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={i === active}
            onClick={() => setActive(i)}
            className={`relative shrink-0 snap-start overflow-hidden rounded-media w-24 aspect-[4/3] transition-all cursor-pointer ${
              i === active
                ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface-dark'
                : 'opacity-65 hover:opacity-100'
            }`}
          >
            <img
              src={p.thumbSrc}
              alt={`${p.label} in ${p.city}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
