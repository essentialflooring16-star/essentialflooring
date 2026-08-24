import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type Lead = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  service: string | null;
  message: string | null;
  status: 'new' | 'contacted' | 'closed';
};

const STATUS_LABELS: Record<Lead['status'], string> = {
  new: 'New',
  contacted: 'Contacted',
  closed: 'Closed',
};

export default function LeadsInbox() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase!
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    setLeads((data as Lead[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function setStatus(lead: Lead, status: Lead['status']) {
    await supabase!.from('leads').update({ status }).eq('id', lead.id);
    setLeads((ls) => ls.map((l) => (l.id === lead.id ? { ...l, status } : l)));
  }

  if (loading) return <p className="text-fg-muted">Loading leads...</p>;

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-fg mb-1">Estimate requests</h1>
      <p className="text-[14.5px] text-fg-muted mb-6">
        Everything sent through the website contact form lands here (and in your email).
      </p>

      {leads.length === 0 ? (
        <div className="rounded-2xl border border-hairline bg-surface-raised p-8 shadow-card text-center text-fg-muted">
          No requests yet. When a visitor fills the form, it appears here instantly.
        </div>
      ) : (
        <ul className="grid gap-4">
          {leads.map((lead) => (
            <li
              key={lead.id}
              className={`rounded-2xl border bg-surface-raised p-6 shadow-card ${
                lead.status === 'new' ? 'border-accent' : 'border-hairline'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[17px] text-fg">
                    {lead.name}
                    {lead.city && <span className="font-normal text-fg-muted"> &middot; {lead.city}</span>}
                  </p>
                  <p className="text-[13px] text-fg-muted mt-0.5">
                    {new Date(lead.created_at).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                    {lead.service && ` · ${lead.service}`}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {(Object.keys(STATUS_LABELS) as Lead['status'][]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={lead.status === s}
                      onClick={() => setStatus(lead, s)}
                      className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${
                        lead.status === s
                          ? s === 'new'
                            ? 'bg-accent text-fg-on-accent'
                            : s === 'contacted'
                              ? 'bg-control-dark text-fg-on-dark'
                              : 'bg-surface-sunken text-fg-muted'
                          : 'bg-field border border-hairline text-fg-muted hover:border-accent'
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              {lead.message && (
                <p className="mt-3 text-[14.5px] leading-relaxed text-fg-body bg-surface-sunken/50 rounded-xl px-4 py-3">
                  {lead.message}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={`tel:${lead.phone.replace(/[^+\d]/g, '')}`}
                  className="inline-flex items-center gap-2 rounded-full bg-control-dark text-fg-on-dark px-4 py-2 text-[13.5px] font-semibold hover:bg-control-dark-hover transition-colors"
                >
                  Call {lead.phone}
                </a>
                {lead.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    className="inline-flex items-center gap-2 rounded-full border border-hairline px-4 py-2 text-[13.5px] font-semibold text-fg-body hover:border-accent transition-colors"
                  >
                    Email {lead.email}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
