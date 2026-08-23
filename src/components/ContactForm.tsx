import { useEffect, useRef, useState } from 'react';

const supaUrl = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const supaKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

const SERVICES = [
  'Hardwood Floor Refinishing',
  'LVP / Vinyl Plank Flooring',
  'Laminate Flooring',
  'Carpet Installation',
  'Stairs',
  'Not sure yet',
];

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const doneRef = useRef<HTMLHeadingElement>(null);
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
      const res = await fetch('/api/contact', {
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
  }

  if (status === 'sent') {
    return (
      <div className="rounded-2xl border border-hairline bg-surface-raised p-8 text-center shadow-card" role="status">
        <span className="mx-auto grid place-items-center size-14 rounded-full bg-accent-wash text-accent-on-light mb-4">
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
          <a href="tel:+19164251361" className="font-semibold text-accent-on-light">
            (916) 425-1361
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
            className="rounded-xl border border-hairline bg-surface-raised px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition"
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
            className="rounded-xl border border-hairline bg-surface-raised px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition"
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
            className="rounded-xl border border-hairline bg-surface-raised px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[14px] font-semibold text-fg-body">City</span>
          <input
            name="city"
            autoComplete="address-level2"
            placeholder="Sacramento"
            className="rounded-xl border border-hairline bg-surface-raised px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition"
          />
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className="text-[14px] font-semibold text-fg-body">What do you need?</span>
        <select
          name="service"
          className="rounded-xl border border-hairline bg-surface-raised px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition"
          defaultValue=""
        >
          <option value="" disabled>
            Choose a service
          </option>
          {SERVICES.map((s) => (
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
          className="rounded-xl border border-hairline bg-surface-raised px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition resize-y"
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
        <p role="alert" className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-[14.5px] px-4 py-3">
          Something went wrong sending your request. Please call us directly at (916) 425-1361 or
          email essentialflooring16@gmail.com.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-1 inline-flex justify-center items-center gap-2 rounded-full bg-accent hover:bg-accent-hover disabled:opacity-60 text-fg-on-accent font-semibold px-7 py-3.5 transition-colors shadow-card"
      >
        {status === 'sending' ? 'Sending...' : 'Request Free Estimate'}
      </button>
      <p className="text-[13px] text-fg-muted/80">
        We only use your details to respond to your request. No spam, ever.
      </p>
    </form>
  );
}
