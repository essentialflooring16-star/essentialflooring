// First-party Core Web Vitals collection into Supabase, no library, no cookies.
// Same discipline as analytics.ts: no-op when env vars are missing, when DNT is on,
// or on /admin, and it must never throw into the page.
const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export type VitalName = 'LCP' | 'CLS' | 'INP' | 'FCP' | 'TTFB';
export type VitalRating = 'good' | 'needs-improvement' | 'poor';

/**
 * Official Core Web Vitals thresholds. Values at or below `good` are good, values
 * at or below `poor` need improvement, anything above is poor. Exported so the admin
 * panel judges rows against the exact same numbers instead of keeping its own copy.
 */
export const VITALS_THRESHOLDS: Record<VitalName, { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

/** Display order used by the collector and by the admin panel. */
export const VITAL_METRICS: readonly VitalName[] = ['LCP', 'CLS', 'INP', 'FCP', 'TTFB'];

export function rateVital(metric: VitalName, value: number): VitalRating {
  const t = VITALS_THRESHOLDS[metric];
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needs-improvement';
  return 'poor';
}

// Kept identical to deviceClass() in analytics.ts on purpose, so a page view and its
// vitals land in the same bucket. analytics.ts does not export it, hence the copy.
function deviceClass(): string {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1100) return 'tablet';
  return 'desktop';
}

// Entry shapes the TS DOM lib does not describe fully across versions.
interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}
interface EventTimingEntry extends PerformanceEntry {
  interactionId?: number;
}
type ObserverOptions = PerformanceObserverInit & { durationThreshold?: number };

export function trackVitals(): void {
  try {
    if (!url || !key) return;
    if (navigator.doNotTrack === '1') return;
    if (location.pathname.startsWith('/admin')) return;
    if (typeof PerformanceObserver === 'undefined') return;

    const metrics = new Map<VitalName, number>();
    // Each flusher drains its observer's pending entries, then disconnects it.
    const flushers: (() => void)[] = [];

    // Older Safari lists nothing here, so an empty list means "try and see".
    const supportedTypes: readonly string[] = PerformanceObserver.supportedEntryTypes ?? [];

    function observe(
      type: string,
      handle: (entries: PerformanceEntry[]) => void,
      options: ObserverOptions = {},
    ): boolean {
      if (supportedTypes.length > 0 && !supportedTypes.includes(type)) return false;
      try {
        const po = new PerformanceObserver((list) => {
          try {
            handle(list.getEntries());
          } catch {
            // a broken metric must not break the rest of the page
          }
        });
        po.observe({ type, buffered: true, ...options });
        flushers.push(() => {
          try {
            handle(po.takeRecords());
          } catch {
            /* ignore */
          }
          po.disconnect();
        });
        return true;
      } catch {
        // Browser knows the type but refuses these options, treat as unsupported.
        return false;
      }
    }

    // LCP: the last reported candidate before the page is hidden wins.
    observe('largest-contentful-paint', (entries) => {
      const last = entries[entries.length - 1];
      if (last) metrics.set('LCP', last.startTime);
    });

    // CLS: standard session window, shifts group together while they are less than
    // 1s apart and the window is under 5s. CLS is the worst window, not the total.
    let clsWindow = 0;
    let windowStart = 0;
    let windowLast = 0;
    const clsWatched = observe('layout-shift', (entries) => {
      for (const raw of entries) {
        const e = raw as LayoutShiftEntry;
        if (e.hadRecentInput) continue; // shifts the visitor caused do not count
        if (clsWindow > 0 && e.startTime - windowLast < 1000 && e.startTime - windowStart < 5000) {
          clsWindow += e.value;
        } else {
          clsWindow = e.value;
          windowStart = e.startTime;
        }
        windowLast = e.startTime;
        if (clsWindow > (metrics.get('CLS') ?? 0)) metrics.set('CLS', clsWindow);
      }
    });
    // A page with no shifts at all has a real CLS of 0, which is worth recording.
    if (clsWatched) metrics.set('CLS', 0);

    // INP: report the slowest interaction on the page. True INP is the 98th percentile
    // once a visit passes 50 interactions, which a flooring site page never does, so on
    // these pages the worst interaction IS the INP. On a hypothetical heavy page this
    // would read slightly pessimistic, which is the safe direction to be wrong in.
    if (typeof PerformanceEventTiming !== 'undefined') {
      observe(
        'event',
        (entries) => {
          for (const raw of entries) {
            const e = raw as EventTimingEntry;
            if (!e.interactionId) continue; // keep real interactions, drop stray events
            if (e.duration > (metrics.get('INP') ?? 0)) metrics.set('INP', e.duration);
          }
        },
        // Below 40ms nothing can ever be rated poor, and a lower threshold floods the
        // callback with scroll-adjacent events for no gain.
        { durationThreshold: 40 },
      );
    }

    observe('paint', (entries) => {
      const fcp = entries.find((e) => e.name === 'first-contentful-paint');
      if (fcp) metrics.set('FCP', fcp.startTime);
    });

    let sent = false;
    function report(): void {
      try {
        if (sent) return;
        sent = true;

        for (const flush of flushers) flush();

        const nav = performance.getEntriesByType('navigation')[0] as
          | PerformanceNavigationTiming
          | undefined;
        // 0 shows up for restored and prerendered navigations, where TTFB is meaningless.
        if (nav && nav.responseStart > 0) metrics.set('TTFB', nav.responseStart);

        if (metrics.size === 0) return;

        const path = location.pathname;
        const device = deviceClass();
        const rows = [...metrics].map(([metric, raw]) => {
          // CLS is a small ratio, the timings are milliseconds and sub-ms noise is useless.
          const value = metric === 'CLS' ? Number(raw.toFixed(4)) : Math.round(raw);
          // Rate the rounded number, not the raw one, so a value sitting exactly on a
          // threshold can never be stored with a rating that contradicts it.
          return { path, metric, value, rating: rateVital(metric, value), device };
        });

        // One request with every metric, PostgREST inserts an array as multiple rows.
        // sendBeacon cannot set headers, so use fetch with keepalive as analytics.ts does.
        fetch(`${url}/rest/v1/web_vitals`, {
          method: 'POST',
          keepalive: true,
          headers: {
            'Content-Type': 'application/json',
            apikey: key as string,
            Authorization: `Bearer ${key}`,
            Prefer: 'return=minimal',
          },
          body: JSON.stringify(rows),
        }).catch(() => {});
      } catch {
        // measurement must never break the site
      }
    }

    // Hidden is the only reliable end of a page visit on mobile, pagehide covers the
    // desktop close and browsers that skip visibilitychange on unload.
    addEventListener(
      'visibilitychange',
      () => {
        if (document.visibilityState === 'hidden') report();
      },
      true,
    );
    addEventListener('pagehide', report, true);
  } catch {
    // measurement must never break the site
  }
}
