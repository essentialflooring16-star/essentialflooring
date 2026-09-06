import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useT } from '../../lib/admin-i18n';

type PageView = {
  created_at: string;
  path: string;
  referrer: string | null;
  device: string | null;
  session_id: string | null;
};

// Eticheta intervalului se compune la randare din cheia cu plural, ca sa iasa
// forma corecta in fiecare limba ("30 de zile"), deci aici raman doar cifrele.
const RANGES = [7, 30, 90];

export default function Dashboard() {
  const { t } = useT();
  const [days, setDays] = useState(30);
  const [rows, setRows] = useState<PageView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const since = new Date(Date.now() - days * 86400_000).toISOString();
    supabase!
      .from('page_views')
      .select('created_at,path,referrer,device,session_id')
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .limit(20000)
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          setError(t('dashboard.load_error'));
        }
        else setRows(data as PageView[]);
      });
  }, [days]);

  const stats = useMemo(() => {
    if (!rows) return null;
    const daily = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400_000);
      daily.set(d.toISOString().slice(0, 10), 0);
    }
    const pages = new Map<string, number>();
    const referrers = new Map<string, number>();
    const devices = new Map<string, number>();
    const sessions = new Set<string>();

    for (const r of rows) {
      const day = r.created_at.slice(0, 10);
      if (daily.has(day)) daily.set(day, (daily.get(day) ?? 0) + 1);
      pages.set(r.path, (pages.get(r.path) ?? 0) + 1);
      if (r.referrer) referrers.set(r.referrer, (referrers.get(r.referrer) ?? 0) + 1);
      if (r.device) devices.set(r.device, (devices.get(r.device) ?? 0) + 1);
      if (r.session_id) sessions.add(r.session_id);
    }
    const top = (m: Map<string, number>, n: number) =>
      [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);

    return {
      total: rows.length,
      visitors: sessions.size,
      daily: [...daily.entries()],
      topPages: top(pages, 8),
      topReferrers: top(referrers, 6),
      devices: top(devices, 3),
    };
  }, [rows, days]);

  if (error) {
    return (
      <p className="rounded-card bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-[14.5px]">
        {t('dashboard.error_banner', { message: error })}
      </p>
    );
  }
  if (!stats) return <p className="text-fg-muted">{t('dashboard.loading')}</p>;

  const max = Math.max(1, ...stats.daily.map(([, v]) => v));

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display font-semibold text-2xl text-fg">{t('dashboard.title')}</h1>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setDays(r)}
              className={`rounded-btn px-4 py-1.5 text-[13.5px] font-semibold transition-colors ${
                days === r ? 'bg-control-dark text-fg-on-dark' : 'bg-surface-raised border border-hairline text-fg-body'
              }`}
            >
              {t('dashboard.range_days', { n: r })}
            </button>
          ))}
        </div>
      </div>

      <div className="grid items-start gap-4 sm:grid-cols-3">
        <StatCard label={t('dashboard.stat_page_views')} value={stats.total} />
        <StatCard label={t('dashboard.stat_unique_visits')} value={stats.visitors} />
        <StatCard
          label={t('dashboard.stat_views_per_visit')}
          value={stats.visitors ? (stats.total / stats.visitors).toFixed(1) : '0'}
        />
      </div>

      <div className="rounded-card border border-hairline bg-surface-raised p-6 shadow-card">
        <h2 className="font-semibold text-[15px] text-fg-body mb-5">{t('dashboard.chart_title')}</h2>
        <TrafficCurve
          daily={stats.daily}
          max={max}
          label={t('dashboard.chart_aria_label')}
          tip={(day, n) => t('dashboard.chart_bar_tooltip', { day, n })}
        />
        <div className="flex justify-between text-[12px] text-fg-muted mt-2">
          <span>{stats.daily[0]?.[0]}</span>
          <span>{stats.daily[stats.daily.length - 1]?.[0]}</span>
        </div>
      </div>

      <div className="grid items-start gap-4 md:grid-cols-2">
        <ListCard
          title={t('dashboard.top_pages_title')}
          rows={stats.topPages}
          total={stats.total}
          empty={t('dashboard.top_pages_empty')}
        />
        <div className="grid gap-4">
          <ListCard
            title={t('dashboard.sources_title')}
            rows={stats.topReferrers}
            total={stats.total}
            empty={t('dashboard.sources_empty')}
          />
          <ListCard
            title={t('dashboard.devices_title')}
            rows={stats.devices}
            total={stats.total}
            empty={t('dashboard.devices_empty')}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-card border border-hairline bg-surface-raised p-6 shadow-card">
      <p className="text-[13px] uppercase tracking-[0.14em] text-fg-muted">{label}</p>
      <p className="mt-2 font-display font-semibold text-4xl text-fg">{value}</p>
    </div>
  );
}

function ListCard({
  title,
  rows,
  total,
  empty,
}: {
  title: string;
  rows: [string, number][];
  total: number;
  empty: string;
}) {
  return (
    <div className="rounded-card border border-hairline bg-surface-raised p-6 shadow-card">
      <h2 className="font-semibold text-[15px] text-fg-body mb-4">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-[14px] text-fg-muted">{empty}</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map(([label, count]) => (
            <li key={label} className="text-[14px]">
              <div className="flex justify-between gap-3 mb-1">
                <span className="truncate text-fg-body">{label}</span>
                <span className="shrink-0 font-semibold text-fg">{count}</span>
              </div>
              <div className="h-1.5 rounded-btn bg-surface-sunken overflow-hidden">
                <div
                  className="h-full rounded-btn bg-accent"
                  style={{ width: `${Math.min(100, (count / Math.max(1, total)) * 100 * 2)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Traficul zilnic ca o curba, nu ca un gard de bare.
 *
 * Punctele se leaga cu un Catmull-Rom convertit in bezier, cu tensiunea taiata
 * la jumatate ca sa nu iasa bucle sub zero cand o zi cu multe vizite sta intre
 * doua zile goale. Sub linie sta un gradient care se stinge, iar linia se
 * deseneaza singura o data la intrare (dasharray animat in admin/index.astro).
 * Zilele raman puncte reale pe curba, cu <title> pe fiecare, deci cifra exacta
 * se vede la hover si o citeste si un cititor de ecran.
 */
function TrafficCurve({
  daily,
  max,
  label,
  tip,
}: {
  daily: [string, number][];
  max: number;
  label: string;
  tip: (day: string, n: number) => string;
}) {
  const W = 720;
  const H = 190;
  const PAD = 14;
  const step = daily.length > 1 ? (W - PAD * 2) / (daily.length - 1) : 0;
  const y = (v: number) => H - PAD - (v / max) * (H - PAD * 2);
  const pts = daily.map(([, v], i) => [PAD + i * step, y(v)] as const);

  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 12;
    const c1y = p1[1] + (p2[1] - p0[1]) / 12;
    const c2x = p2[0] - (p3[0] - p1[0]) / 12;
    const c2y = p2[1] - (p3[1] - p1[1]) / 12;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  const area = `${d} L${pts[pts.length - 1][0]},${H - PAD} L${pts[0][0]},${H - PAD} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-44 w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id="traffic-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ef-accent-fill)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--ef-accent-fill)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Trei repere, atat cat sa se poata citi inaltimea curbei. */}
      {[0, 0.5, 1].map((f) => (
        <line
          key={f}
          x1={PAD}
          x2={W - PAD}
          y1={y(max * f)}
          y2={y(max * f)}
          stroke="var(--ef-hairline)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}

      <path d={area} fill="url(#traffic-fade)" className="traffic-area" />
      <path
        d={d}
        fill="none"
        stroke="var(--ef-accent-fill)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        className="traffic-line"
      />

      {/* Desenul se intinde pe latime, deci un cerc ar iesi elipsa. Zilele sunt
          benzi transparente: pastreaza cifra la hover si o da cititorului de
          ecran, fara sa puna in pagina o forma care se deformeaza. */}
      {daily.map(([day, v], i) => (
        <rect
          key={day}
          x={pts[i][0] - step / 2}
          y={0}
          width={step || W}
          height={H}
          fill="transparent"
        >
          <title>{tip(day, v)}</title>
        </rect>
      ))}
    </svg>
  );
}
