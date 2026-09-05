import { useEffect, useRef, useState } from 'react';
import { SERVICES as SITE_SERVICES, SITE } from '../data/site';

const supaUrl = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const supaKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

// Derived from the same source the nav and the service pages use, so a lead
// never arrives naming a service that does not exist on the site.
const SERVICE_OPTIONS = [...SITE_SERVICES.map((s) => s.name), 'Not sure yet'];

// Derived from the one place the number is written, the same way the rest of
// the site derives its phone links.
const WHATSAPP = `https://wa.me/${SITE.phoneHref.replace(/\D/g, '')}`;

type Lead = {
  name?: string;
  phone?: string;
  email?: string | null;
  city?: string | null;
  service?: string | null;
  message?: string | null;
};

// If the form cannot reach the server, the visitor still has to be able to
// reach Alex. WhatsApp is the channel he actually runs the business on, so the
// same details go there prefilled instead of being retyped.
function whatsappHref(lead: Lead | null): string {
  if (!lead) return WHATSAPP;
  const lines = [
    'Hi Essential Flooring, I would like a free estimate.',
    '',
    `Name: ${lead.name || ''}`,
    `Phone: ${lead.phone || ''}`,
  ];
  if (lead.email) lines.push(`Email: ${lead.email}`);
  if (lead.city) lines.push(`City: ${lead.city}`);
  if (lead.service) lines.push(`Service: ${lead.service}`);
  if (lead.message) lines.push('', lead.message);
  return `${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const doneRef = useRef<HTMLHeadingElement>(null);
  const [lastLead, setLastLead] = useState<Lead | null>(null);
  // How long the visitor spent on the form. Bots submit almost instantly.
  const openedAt = useRef<number>(Date.now());

  useEffect(() => {
    if (status === 'sent') doneRef.current?.focus();
  }, [status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    // Honeypot: real users never fill this hidden field.
    if (data.company) {
      setStatus('sent');
      return;
    }
    setStatus('sending');

    const lead = {
      name: data.name?.trim(),
      phone: data.phone?.trim(),
      email: data.email?.trim() || null,
      city: data.city?.trim() || null,
      service: data.service || null,
      message: data.message?.trim() || null,
    };

    let delivered = false;
    let rateLimited = false;

    // Primary channel: the serverless function stores the lead AND emails it.
    try {
      const res = await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, elapsedMs: Date.now() - openedAt.current }),
      });
      if (res.ok) delivered = true;
      if (res.status === 429) rateLimited = true;
    } catch {
      /* fall through to the Supabase fallback below */
    }

    // Fallback only. If the function already accepted the lead it is stored,
    // so writing again from the browser would duplicate the request.
    if (!delivered && !rateLimited && supaUrl && supaKey) {
      try {
        const res = await fetch(`${supaUrl}/rest/v1/leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supaKey,
            Authorization: `Bearer ${supaKey}`,
            Prefer: 'return=minimal',
          },
          body: JSON.stringify(lead),
        });
        if (res.ok) delivered = true;
      } catch {
        /* handled below */
      }
    }

    setStatus(delivered ? 'sent' : 'error');
    if (delivered) form.reset();
    else setLastLead(lead);
  }

  if (status === 'sent') {
    return (
      <div className="rounded-card border border-hairline bg-surface-raised p-8 text-center shadow-card" role="status">
        <span className="mx-auto grid place-items-center size-14 rounded-btn bg-accent-wash text-accent-on-light mb-4">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h3 ref={doneRef} tabIndex={-1} className="font-display font-semibold text-2xl text-fg outline-none">
          Request received
        </h3>
        <p className="mt-2 text-fg-muted leading-relaxed">
          Thank you. We will get back to you shortly to schedule your free estimate.
          For anything urgent, call us at{' '}
          <a href={SITE.phoneHref} className="font-semibold text-accent-on-light">
            {SITE.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate={false}>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="grid gap-1.5">
          <span className="text-[14px] font-semibold text-fg-body">Full name *</span>
          <input
            required
            name="name"
            autoComplete="name"
            placeholder="John Smith"
            className="w-full min-w-0 rounded-card border border-hairline bg-surface-raised px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[14px] font-semibold text-fg-body">Phone *</span>
          <input
            required
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(916) 555-0123"
            className="w-full min-w-0 rounded-card border border-hairline bg-surface-raised px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition"
          />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="grid gap-1.5">
          <span className="text-[14px] font-semibold text-fg-body">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            className="w-full min-w-0 rounded-card border border-hairline bg-surface-raised px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[14px] font-semibold text-fg-body">City</span>
          <input
            name="city"
            autoComplete="address-level2"
            placeholder="Sacramento"
            className="w-full min-w-0 rounded-card border border-hairline bg-surface-raised px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition"
          />
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className="text-[14px] font-semibold text-fg-body">What do you need?</span>
        <select
          name="service"
          className="w-full min-w-0 rounded-card border border-hairline bg-surface-raised px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition"
          defaultValue=""
        >
          <option value="" disabled>
            Choose a service
          </option>
          {SERVICE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5">
        <span className="text-[14px] font-semibold text-fg-body">Tell us about the project</span>
        <textarea
          name="message"
          rows={4}
          placeholder="Rooms, approximate square footage, current floor, timeline..."
          className="w-full min-w-0 rounded-card border border-hairline bg-surface-raised px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition resize-y"
        />
      </label>

      {/* Honeypot field, hidden from real users */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {status === 'error' && (
        <div
          role="alert"
          className="rounded-card border border-hairline bg-surface-sunken px-5 py-4"
        >
          <p className="text-[15px] font-semibold text-fg">We could not send that just now.</p>
          <p className="mt-1 text-[14.5px] leading-relaxed text-fg-muted">
            Your details are still here. Send them straight through on WhatsApp, already filled in,
            or call and we will pick up.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={whatsappHref(lastLead)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-btn bg-accent hover:bg-accent-hover text-fg-on-accent font-semibold px-5 py-3 text-[15px] transition-colors shadow-card"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.94.53 3.76 1.46 5.32L2 22l4.98-1.6a9.8 9.8 0 0 0 5.06 1.4h.01c5.43 0 9.84-4.4 9.84-9.84C21.89 6.4 17.47 2 12.04 2Zm5.76 13.9c-.24.68-1.4 1.3-1.94 1.34-.5.05-.98.23-3.3-.7-2.78-1.1-4.54-3.95-4.68-4.14-.13-.19-1.11-1.48-1.11-2.83 0-1.34.7-2 .95-2.28.25-.27.54-.34.72-.34h.52c.17 0 .4-.06.62.48.24.57.8 1.98.87 2.12.07.14.11.3.02.49-.09.19-.13.3-.26.47l-.4.46c-.13.13-.26.28-.11.54.14.27.64 1.06 1.38 1.72.94.84 1.74 1.1 2 1.23.25.14.4.11.55-.07.14-.19.63-.74.8-.99.16-.25.33-.2.55-.12.23.08 1.44.68 1.69.8.25.13.41.19.47.29.06.1.06.58-.18 1.25Z" />
              </svg>
              Send on WhatsApp
            </a>
            <a
              href={SITE.phoneHref}
              className="inline-flex items-center rounded-btn border border-hairline bg-surface-raised hover:border-accent text-fg font-semibold px-5 py-3 text-[15px] transition-colors"
            >
              Call {SITE.phone}
            </a>
          </div>
          <p className="mt-3 text-[13.5px] text-fg-muted">
            Or email{' '}
            <a href={`mailto:${SITE.email}`} className="underline underline-offset-2">
              {SITE.email}
            </a>
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-1 inline-flex justify-center items-center gap-2 rounded-btn bg-accent hover:bg-accent-hover disabled:opacity-60 text-fg-on-accent font-semibold px-7 py-3.5 transition-colors shadow-card"
      >
        {status === 'sending' ? 'Sending...' : 'Request Free Estimate'}
      </button>
      <p className="text-[13px] leading-relaxed text-fg-muted">
        By sending this request you agree to our{' '}
        <a
          href="/privacy-policy/"
          className="underline underline-offset-2 decoration-1 text-accent-on-light hover:text-fg transition-colors"
        >
          Privacy Policy
        </a>
        . We use your details only to respond to your estimate request.
      </p>
    </form>
  );
}
