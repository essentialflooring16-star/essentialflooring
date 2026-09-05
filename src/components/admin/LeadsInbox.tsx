import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useT } from '../../lib/admin-i18n';

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

// Valorile 'new' | 'contacted' | 'closed' sunt statusurile din Supabase si raman
// neatinse; se traduce doar eticheta pe care o vede omul, prin cheia de dictionar.
const STATUS_LABEL_KEYS: Record<Lead['status'], string> = {
  new: 'leads.status_new',
  contacted: 'leads.status_contacted',
  closed: 'leads.status_closed',
};

export default function LeadsInbox() {
  const { t } = useT();
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

  if (loading) return <p className="text-fg-muted">{t('leads.loading')}</p>;

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-fg mb-1">{t('leads.title')}</h1>
      <p className="text-[14.5px] text-fg-muted mb-6">{t('leads.subtitle')}</p>

      {leads.length === 0 ? (
        <div className="rounded-card border border-hairline bg-surface-raised p-8 shadow-card text-center text-fg-muted">
          {t('leads.empty_state')}
        </div>
      ) : (
        <ul className="grid gap-4">
          {leads.map((lead) => (
            <li
              key={lead.id}
              className={`rounded-card border bg-surface-raised p-6 shadow-card ${
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
                  {(Object.keys(STATUS_LABEL_KEYS) as Lead['status'][]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={lead.status === s}
                      onClick={() => setStatus(lead, s)}
                      className={`rounded-btn px-3 py-1 text-[12px] font-semibold transition-colors ${
                        lead.status === s
                          ? s === 'new'
                            ? 'bg-accent text-fg-on-accent'
                            : s === 'contacted'
                              ? 'bg-control-dark text-fg-on-dark'
                              : 'bg-surface-sunken text-fg-muted'
                          : 'bg-field border border-hairline text-fg-muted hover:border-accent'
                      }`}
                    >
                      {t(STATUS_LABEL_KEYS[s])}
                    </button>
                  ))}
                </div>
              </div>

              {lead.message && (
                <p className="mt-3 text-[14.5px] leading-relaxed text-fg-body bg-surface-sunken/50 rounded-card px-4 py-3">
                  {lead.message}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={`tel:${lead.phone.replace(/[^+\d]/g, '')}`}
                  className="inline-flex items-center gap-2 rounded-btn bg-control-dark text-fg-on-dark px-4 py-2 text-[13.5px] font-semibold hover:bg-control-dark-hover transition-colors"
                >
                  {t('leads.call_action', { phone: lead.phone })}
                </a>
                {lead.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    className="inline-flex items-center gap-2 rounded-btn border border-hairline px-4 py-2 text-[13.5px] font-semibold text-fg-body hover:border-accent transition-colors"
                  >
                    {t('leads.email_action', { email: lead.email })}
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
