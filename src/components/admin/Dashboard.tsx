import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

type PageView = {
  created_at: string;
  path: string;
  referrer: string | null;
  device: string | null;
  session_id: string | null;
};

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

export default function Dashboard() {
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
        if (error) setError(error.message);
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
      <p className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-[14.5px]">
        Could not load analytics: {error}
      </p>
    );
  }
  if (!stats) return <p className="text-coffee">Loading traffic data...</p>;

  const max = Math.max(1, ...stats.daily.map(([, v]) => v));

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display font-semibold text-2xl text-ink">Website traffic</h1>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => setDays(r.days)}
              className={`rounded-full px-4 py-1.5 text-[13.5px] font-semibold transition-colors ${
                days === r.days ? 'bg-ink text-cream' : 'bg-paper border border-line text-bark'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Page views" value={stats.total} />
        <StatCard label="Unique visits" value={stats.visitors} />
        <StatCard
          label="Views per visit"
          value={stats.visitors ? (stats.total / stats.visitors).toFixed(1) : '0'}
        />
      </div>

      {/* Daily bar chart */}
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-card">
        <h2 className="font-semibold text-[15px] text-bark mb-4">Daily page views</h2>
        <svg viewBox={`0 0 ${stats.daily.length * 12} 120`} className="w-full h-36" role="img" aria-label="Daily page views chart">
          {stats.daily.map(([day, v], i) => {
            const h = Math.max(2, (v / max) * 100);
            return (
              <g key={day}>
                <rect
                  x={i * 12 + 2}
                  y={110 - h}
                  width={8}
                  height={h}
                  rx={2}
                  fill={v > 0 ? '#b5773a' : '#e2d5c2'}
                >
                  <title>{`${day}: ${v} views`}</title>
                </rect>
              </g>
            );
          })}
        </svg>
        <div className="flex justify-between text-[12px] text-coffee mt-1">
          <span>{stats.daily[0]?.[0]}</span>
          <span>{stats.daily[stats.daily.length - 1]?.[0]}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <ListCard
          title="Most visited pages"
          rows={stats.topPages}
          total={stats.total}
          empty="No visits yet."
        />
        <div className="grid gap-4">
          <ListCard
            title="Traffic sources"
            rows={stats.topReferrers}
            total={stats.total}
            empty="Direct visits only so far."
          />
          <ListCard
            title="Devices"
            rows={stats.devices}
            total={stats.total}
            empty="No data yet."
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper p-6 shadow-card">
      <p className="text-[13px] uppercase tracking-[0.14em] text-coffee">{label}</p>
      <p className="mt-2 font-display font-semibold text-4xl text-ink">{value}</p>
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
    <div className="rounded-2xl border border-line bg-paper p-6 shadow-card">
      <h2 className="font-semibold text-[15px] text-bark mb-4">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-[14px] text-coffee">{empty}</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map(([label, count]) => (
            <li key={label} className="text-[14px]">
              <div className="flex justify-between gap-3 mb-1">
                <span className="truncate text-bark">{label}</span>
                <span className="shrink-0 font-semibold text-ink">{count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-sand overflow-hidden">
                <div
                  className="h-full rounded-full bg-oak"
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
