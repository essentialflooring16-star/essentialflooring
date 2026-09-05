import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useT, type Vars } from '../../lib/admin-i18n';
import {
  VITAL_METRICS,
  VITALS_THRESHOLDS,
  rateVital,
  type VitalName,
  type VitalRating,
} from '../../lib/vitals';

type VitalRow = {
  path: string;
  metric: VitalName;
  value: number;
  device: string | null;
};

// Hook-ul nu poate fi apelat dintr-o functie de modul, deci ajutoarele care produc
// text primesc t ca parametru si traduc in momentul randarii.
type TFn = (key: string, vars?: Vars) => string;

// Eticheta perioadei se compune la randare din cheia cu plural, ca sa iasa forma
// corecta in fiecare limba ("30 de zile"), deci aici raman doar cifrele.
const RANGES = [7, 30];

// Ceiling on how many rows one query pulls. Five metrics per page load, so this is
// roughly 4000 page loads. The query takes the newest rows first, so hitting the cap
// drops the oldest part of the window rather than the part the client cares about.
const ROW_CAP = 20000;

// LCP, CLS, INP, FCP si TTFB sunt numele metricii asa cum ajung din baza de date si
// raman neatinse; se traduce doar textul pe care il citeste omul, prin cheia lui.
const METRIC_INFO_KEYS: Record<VitalName, { title: string; blurb: string }> = {
  LCP: {
    title: 'vitals.metric_lcp_title',
    blurb: 'vitals.metric_lcp_blurb',
  },
  CLS: {
    title: 'vitals.metric_cls_title',
    blurb: 'vitals.metric_cls_blurb',
  },
  INP: {
    title: 'vitals.metric_inp_title',
    blurb: 'vitals.metric_inp_blurb',
  },
  FCP: {
    title: 'vitals.metric_fcp_title',
    blurb: 'vitals.metric_fcp_blurb',
  },
  TTFB: {
    title: 'vitals.metric_ttfb_title',
    blurb: 'vitals.metric_ttfb_blurb',
  },
};

const RATING_LABEL_KEYS: Record<VitalRating, string> = {
  good: 'vitals.rating_good',
  'needs-improvement': 'vitals.rating_needs_improvement',
  poor: 'vitals.rating_poor',
};

const RATING_BAR: Record<VitalRating, string> = {
  good: 'bg-emerald-500',
  'needs-improvement': 'bg-amber-400',
  poor: 'bg-red-500',
};

const RATING_BADGE: Record<VitalRating, string> = {
  good: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'needs-improvement': 'bg-amber-50 text-amber-700 border-amber-200',
  poor: 'bg-red-50 text-red-700 border-red-200',
};

const RATING_ORDER: readonly VitalRating[] = ['good', 'needs-improvement', 'poor'];

/**
 * 75th percentile by nearest rank. Core Web Vitals is scored on the p75, so a single
 * very slow phone cannot drag the number down the way a mean would, and a pile of fast
 * desktop visits cannot hide it either.
 */
function p75(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.75) - 1));
  return sorted[index];
}

function formatValue(t: TFn, metric: VitalName, value: number): string {
  if (metric === 'CLS') return value.toFixed(3);
  // Round before choosing the unit, otherwise 999.6 ms prints as "1000 ms".
  const ms = Math.round(value);
  if (ms >= 1000) return t('vitals.unit_seconds', { n: (ms / 1000).toFixed(1) });
  return t('vitals.unit_milliseconds', { n: ms });
}

type DeviceStatValue = { p75: number | null; samples: number };

type MetricSummary = {
  metric: VitalName;
  samples: number;
  p75: number | null;
  rating: VitalRating | null;
  split: Record<VitalRating, number>;
  mobile: DeviceStatValue;
  desktop: DeviceStatValue;
};

export default function VitalsPanel() {
  const { t } = useT();
  const [days, setDays] = useState(30);
  const [rows, setRows] = useState<VitalRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    // Switching range fires a second query while the first is still open. Without this
    // flag a slow earlier response can land last and overwrite the range on screen.
    let cancelled = false;
    setRows(null);
    setError(null);
    const since = new Date(Date.now() - days * 86400_000).toISOString();
    supabase
      .from('web_vitals')
      .select('path,metric,value,device')
      .gte('created_at', since)
      // Newest first so the row cap trims the oldest measurements, not the recent ones.
      .order('created_at', { ascending: false })
      .limit(ROW_CAP)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error(error);
          setError(t('vitals.load_error'));
        } else {
          setRows((data as VitalRow[]) ?? []);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const summaries = useMemo<MetricSummary[]>(() => {
    if (!rows) return [];
    return VITAL_METRICS.map((metric) => {
      const all: number[] = [];
      const mobile: number[] = [];
      const desktop: number[] = [];
      const split: Record<VitalRating, number> = {
        good: 0,
        'needs-improvement': 0,
        poor: 0,
      };

      for (const r of rows) {
        if (r.metric !== metric || !Number.isFinite(r.value)) continue;
        all.push(r.value);
        // Rated here rather than read from the stored column, so the split always
        // matches the thresholds this build ships with.
        split[rateVital(metric, r.value)] += 1;
        if (r.device === 'mobile') mobile.push(r.value);
        // A row with no device recorded is counted in the totals but not claimed for
        // either device bucket, since we do not actually know which one it was.
        else if (r.device) desktop.push(r.value);
      }

      const value = p75(all);
      return {
        metric,
        samples: all.length,
        p75: value,
        rating: value === null ? null : rateVital(metric, value),
        split,
        mobile: { p75: p75(mobile), samples: mobile.length },
        desktop: { p75: p75(desktop), samples: desktop.length },
      };
    });
  }, [rows]);

  const worstPages = useMemo(() => {
    if (!rows) return [];
    const byPath = new Map<string, number[]>();
    for (const r of rows) {
      if (r.metric !== 'LCP' || !Number.isFinite(r.value)) continue;
      const list = byPath.get(r.path);
      if (list) list.push(r.value);
      else byPath.set(r.path, [r.value]);
    }
    const ranked: { path: string; samples: number; p75: number }[] = [];
    for (const [path, values] of byPath) {
      const value = p75(values);
      if (value !== null) ranked.push({ path, samples: values.length, p75: value });
    }
    return ranked.sort((a, b) => b.p75 - a.p75).slice(0, 10);
  }, [rows]);

  const totalSamples = rows?.length ?? 0;
  const capped = totalSamples >= ROW_CAP;

  const status: 'unconfigured' | 'error' | 'loading' | 'empty' | 'ready' = !supabase
    ? 'unconfigured'
    : error
      ? 'error'
      : rows === null
        ? 'loading'
        : totalSamples === 0
          ? 'empty'
          : 'ready';

  return (
    <div className="grid gap-6">
      {/* The header stays mounted through loading and error states, so the range button
          the client just pressed keeps keyboard focus instead of being unmounted. */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-semibold text-2xl text-fg">{t('vitals.title')}</h1>
          <p className="text-[14.5px] text-fg-muted mt-1 max-w-2xl">{t('vitals.intro')}</p>
        </div>
        <div className="flex gap-2" role="group" aria-label={t('vitals.range_group_label')}>
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={days === r}
              onClick={() => setDays(r)}
              className={`rounded-btn px-4 py-1.5 text-[13.5px] font-semibold transition-colors ${
                days === r
                  ? 'bg-control-dark text-fg-on-dark'
                  : 'bg-surface-raised border border-hairline text-fg-body'
              }`}
            >
              {t('vitals.range_option', { n: r })}
            </button>
          ))}
        </div>
      </div>

      {status === 'unconfigured' && (
        <div className="rounded-card border border-hairline bg-surface-raised p-8 shadow-card">
          <h2 className="font-semibold text-[16px] text-fg">{t('vitals.unconfigured_title')}</h2>
          <p className="mt-2 text-[14.5px] text-fg-body leading-relaxed max-w-2xl">
            {t('vitals.unconfigured_body')}
          </p>
        </div>
      )}

      {status === 'error' && (
        <p
          role="status"
          className="rounded-card bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-[14.5px]"
        >
          {error}
        </p>
      )}

      {status === 'loading' && (
        <p className="text-fg-muted" role="status">
          {t('vitals.loading')}
        </p>
      )}

      {status === 'empty' && (
        <div className="rounded-card border border-hairline bg-surface-raised p-8 shadow-card">
          <h2 className="font-semibold text-[16px] text-fg">{t('vitals.empty_title')}</h2>
          <p className="mt-2 text-[14.5px] text-fg-body leading-relaxed max-w-2xl">
            {t('vitals.empty_body')}
          </p>
        </div>
      )}

      {status === 'ready' && (
        <>
          <p className="text-[13px] text-fg-muted" role="status">
            {capped
              ? t('vitals.sample_capped', { n: ROW_CAP.toLocaleString('en-US') })
              : t('vitals.sample_count', {
                  n: totalSamples,
                  range: t('vitals.range_option', { n: days }),
                })}{' '}
            {t('vitals.sample_caveat')}
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {summaries.map((s) => (
              <MetricCard key={s.metric} summary={s} />
            ))}
          </div>

          <p className="text-[13px] text-fg-muted max-w-2xl">{t('vitals.metrics_note')}</p>

          <div className="rounded-card border border-hairline bg-surface-raised p-6 shadow-card">
            <h2 className="font-semibold text-[15px] text-fg-body">{t('vitals.slowest_title')}</h2>
            <p className="text-[13.5px] text-fg-muted mt-1 mb-4">{t('vitals.slowest_note')}</p>
            {worstPages.length === 0 ? (
              <p className="text-[14px] text-fg-muted">{t('vitals.slowest_empty')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[14px] border-collapse">
                  <thead>
                    <tr className="text-left text-fg-muted border-b border-hairline">
                      <th scope="col" className="py-2 pr-4 font-semibold">
                        {t('vitals.col_page')}
                      </th>
                      <th scope="col" className="py-2 pr-4 font-semibold text-right">{t('vitals.col_page_loads')}</th>
                      <th scope="col" className="py-2 font-semibold text-right">{t('vitals.col_main_content')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {worstPages.map((p) => {
                      const rating = rateVital('LCP', p.p75);
                      return (
                        <tr key={p.path}>
                          <td className="py-2.5 pr-4 text-fg-body">{p.path}</td>
                          <td className="py-2.5 pr-4 text-right text-fg-muted tabular-nums">
                            {p.samples.toLocaleString('en-US')}
                          </td>
                          <td className="py-2.5 text-right tabular-nums">
                            <span className="font-semibold text-fg">
                              {formatValue(t, 'LCP', p.p75)}
                            </span>
                            <span className="ml-2 text-[12px] text-fg-muted">
                              {t(RATING_LABEL_KEYS[rating])}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ summary }: { summary: MetricSummary }) {
  const { t } = useT();
  const { metric, p75: value, rating, samples, split } = summary;
  const info = METRIC_INFO_KEYS[metric];
  const threshold = VITALS_THRESHOLDS[metric];

  return (
    <div className="rounded-card border border-hairline bg-surface-raised p-6 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-[15px] text-fg-body">
            {info.title}{' '}
            <span className="text-[12px] uppercase tracking-[0.14em] text-fg-subtle">
              {metric}
            </span>
          </h2>
          <p className="text-[13.5px] text-fg-muted mt-1 max-w-xs">{info.blurb}</p>
        </div>
        {rating && (
          <span
            className={`shrink-0 rounded-btn border px-3 py-1 text-[12px] font-semibold ${RATING_BADGE[rating]}`}
          >
            {rating === 'good' ? t('vitals.rating_passing') : RATING_LABEL_KEYS[rating]}
          </span>
        )}
      </div>

      {value === null ? (
        <p className="mt-4 text-[14px] text-fg-muted">{t('vitals.no_value')}</p>
      ) : (
        <>
          <p className="mt-4 font-display font-semibold text-4xl text-fg tabular-nums">
            {formatValue(t, metric, value)}
          </p>
          <p className="text-[12.5px] text-fg-muted mt-1">
            {t('vitals.p75_note', {
              n: samples.toLocaleString('en-US'),
              threshold: formatValue(t, metric, threshold.good),
            })}
          </p>

          <RatingBar split={split} samples={samples} />

          <dl className="mt-4 grid grid-cols-2 gap-3 text-[13.5px] border-t border-hairline pt-3">
            <DeviceStat label={t('vitals.device_mobile')} metric={metric} stat={summary.mobile} />
            <DeviceStat label={t('vitals.device_desktop')} metric={metric} stat={summary.desktop} />
          </dl>
        </>
      )}
    </div>
  );
}

function RatingBar({
  split,
  samples,
}: {
  split: Record<VitalRating, number>;
  samples: number;
}) {
  const { t } = useT();
  const percent = (n: number) => (samples > 0 ? (n / samples) * 100 : 0);

  return (
    <div className="mt-4">
      {/* Hidden from assistive tech on purpose: the list underneath already states the
          same split in words, and announcing both reads the numbers out twice. */}
      <div
        className="flex h-2 w-full overflow-hidden rounded-btn bg-surface-sunken"
        aria-hidden="true"
      >
        {RATING_ORDER.map((r) =>
          split[r] > 0 ? (
            <div key={r} className={RATING_BAR[r]} style={{ width: `${percent(split[r])}%` }} />
          ) : null,
        )}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-fg-muted">
        {RATING_ORDER.map((r) => (
          <li key={r} className="flex items-center gap-1.5">
            <span
              className={`inline-block h-2 w-2 rounded-btn ${RATING_BAR[r]}`}
              aria-hidden="true"
            />
            {t('vitals.rating_share', { label: t(RATING_LABEL_KEYS[r]), n: Math.round(percent(split[r])) })}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DeviceStat({
  label,
  metric,
  stat,
}: {
  label: string;
  metric: VitalName;
  stat: DeviceStatValue;
}) {
  const { t } = useT();
  return (
    <div>
      <dt className="text-fg-muted">{label}</dt>
      <dd className="font-semibold text-fg tabular-nums">
        {stat.p75 === null ? (
          <span className="font-normal text-fg-subtle">{t('vitals.device_empty')}</span>
        ) : (
          <>
            {formatValue(t, metric, stat.p75)}
            <span className="ml-1.5 text-[12px] font-normal text-fg-muted">
              {t('vitals.device_samples', { n: stat.samples.toLocaleString('en-US') })}
            </span>
          </>
        )}
      </dd>
    </div>
  );
}
