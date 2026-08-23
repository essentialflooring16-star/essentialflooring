import { useCallback, useRef, useState } from 'react';

type Props = {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
};

export default function BeforeAfter({ beforeSrc, afterSrc, beforeAlt, afterAlt }: Props) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(97, Math.max(3, pct)));
  }, []);

  return (
    <div
      ref={ref}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl select-none shadow-lift touch-pan-y has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2"
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
        src={afterSrc}
        alt={afterAlt}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img
          src={beforeSrc}
          alt={beforeAlt}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div
        className="absolute inset-y-0 w-[3px] bg-fg-on-media shadow-[0_0_12px_rgba(0,0,0,0.45)]"
        style={{ left: `calc(${pos}% - 1.5px)` }}
        aria-hidden="true"
      >
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center size-11 rounded-full bg-fg-on-media shadow-lg">
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

      <span className="absolute top-4 left-4 rounded-full bg-scrim-media/55 text-fg-on-media text-[12px] font-semibold uppercase tracking-wider px-3 py-1.5 pointer-events-none">
        Before
      </span>
      <span className="absolute top-4 right-4 rounded-full bg-accent text-fg-on-accent text-[12px] font-semibold uppercase tracking-wider px-3 py-1.5 pointer-events-none">
        After
      </span>
    </div>
  );
}
