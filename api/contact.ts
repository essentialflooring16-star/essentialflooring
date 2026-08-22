// Vercel serverless function: primeste formularul de contact si trimite email prin Resend.
// Env necesare pe Vercel: RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL.

type Lead = {
  name?: string;
  phone?: string;
  email?: string | null;
  city?: string | null;
  service?: string | null;
  message?: string | null;
  company?: string; // honeypot
};

function esc(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: Lead;
  try {
    body = (await req.json()) as Lead;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Honeypot: pretend success for bots.
  if (body.company) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const name = (body.name ?? '').trim().slice(0, 120);
  const phone = (body.phone ?? '').trim().slice(0, 40);
  const email = (body.email ?? '').toString().trim().slice(0, 160);
  const city = (body.city ?? '').toString().trim().slice(0, 80);
  const service = (body.service ?? '').toString().trim().slice(0, 80);
  const message = (body.message ?? '').toString().trim().slice(0, 3000);

  if (!name || !phone) {
    return new Response(JSON.stringify({ error: 'Name and phone are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || 'Essential Flooring <onboarding@resend.dev>';

  if (!apiKey || !to) {
    // Email channel not configured yet; the client-side Supabase insert still stores the lead.
    return new Response(JSON.stringify({ error: 'Email not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rows = [
    ['Name', name],
    ['Phone', phone],
    ['Email', email || 'not provided'],
    ['City', city || 'not provided'],
    ['Service', service || 'not chosen'],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 14px 6px 0;color:#57452f;white-space:nowrap"><strong>${k}</strong></td><td style="padding:6px 0">${esc(v)}</td></tr>`,
    )
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px">
      <h2 style="color:#221a14">New estimate request from the website</h2>
      <table style="font-size:15px;border-collapse:collapse">${rows}</table>
      ${message ? `<p style="font-size:15px;background:#f2e9db;padding:12px 16px;border-radius:8px;color:#221a14">${esc(message)}</p>` : ''}
      <p style="font-size:12px;color:#999">Sent automatically by essentialflooringinc.com</p>
    </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `New estimate request: ${name}${city ? ` (${city})` : ''}`,
      html,
      ...(email ? { reply_to: email } : {}),
    }),
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Email delivery failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
