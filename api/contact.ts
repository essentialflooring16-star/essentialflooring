// Vercel serverless function: primeste formularul de contact, salveaza cererea
// in Supabase si trimite email prin Resend.
//
// Env pe Vercel:
//   RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL
//   PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (optionale, dar recomandate)
//
// Ordinea conteaza: intai salvam cererea, abia apoi trimitem emailul. Daca Resend
// pica, cererea tot exista in baza de date si raspundem 200, ca sa nu piarda
// clientul un lead din cauza unui provider de email.

type Lead = {
  name?: string;
  phone?: string;
  email?: string | null;
  city?: string | null;
  service?: string | null;
  message?: string | null;
  company?: string; // honeypot
  elapsedMs?: number; // cat a stat pe formular inainte sa trimita
};

const MAX = { name: 120, phone: 40, email: 160, city: 80, service: 80, message: 3000 } as const;

// Cate trimiteri acceptam de la acelasi IP intr-o fereastra de timp.
const RATE_LIMIT = 4;
const RATE_WINDOW_MIN = 10;
// Un om nu completeaza formularul in sub doua secunde.
const MIN_FILL_MS = 2000;

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

function esc(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for') ?? '';
  return fwd.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

// Hash-uim IP-ul ca sa nu stocam date personale in clar.
async function hashIp(ip: string): Promise<string> {
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 16) ?? 'essential-flooring';
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

type Supa = { url: string; key: string };
function supabase(): Supa | null {
  const url = process.env.PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ''), key } : null;
}

async function supaFetch(s: Supa, path: string, init: RequestInit): Promise<Response> {
  return fetch(`${s.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: s.key,
      Authorization: `Bearer ${s.key}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

// Returneaza true daca IP-ul a depasit limita. Daca Supabase nu e configurat sau
// pica, lasam cererea sa treaca: mai bine un lead in plus decat un lead pierdut.
async function isRateLimited(s: Supa | null, ipHash: string): Promise<boolean> {
  if (!s) return false;
  try {
    const since = new Date(Date.now() - RATE_WINDOW_MIN * 60_000).toISOString();
    const res = await supaFetch(
      s,
      `contact_hits?ip_hash=eq.${encodeURIComponent(ipHash)}&created_at=gte.${encodeURIComponent(since)}&select=id`,
      { method: 'GET', headers: { Prefer: 'count=exact', Range: '0-0' } },
    );
    const range = res.headers.get('content-range') ?? '';
    const total = Number(range.split('/')[1]);
    return Number.isFinite(total) && total >= RATE_LIMIT;
  } catch {
    return false;
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body: Lead;
  try {
    body = (await req.json()) as Lead;
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  // Honeypot si verificarea de timp: raspundem 200 ca sa nu invatam botul nimic.
  if (body.company) return json({ ok: true }, 200);
  if (typeof body.elapsedMs === 'number' && body.elapsedMs >= 0 && body.elapsedMs < MIN_FILL_MS) {
    return json({ ok: true }, 200);
  }

  const cut = (v: unknown, n: number) => (v ?? '').toString().trim().slice(0, n);
  const name = cut(body.name, MAX.name);
  const phone = cut(body.phone, MAX.phone);
  const email = cut(body.email, MAX.email);
  const city = cut(body.city, MAX.city);
  const service = cut(body.service, MAX.service);
  const message = cut(body.message, MAX.message);

  if (!name || !phone) return json({ error: 'Name and phone are required' }, 400);
  // Un email invalid ar rupe reply_to, deci il ignoram in loc sa respingem cererea.
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : '';

  const s = supabase();
  const ipHash = await hashIp(clientIp(req));

  if (await isRateLimited(s, ipHash)) {
    return json({ error: 'Too many requests. Please call us instead.' }, 429);
  }

  // 1) Salvam cererea. Asta e partea care nu are voie sa se piarda.
  let stored = false;
  if (s) {
    try {
      const res = await supaFetch(s, 'leads', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          name,
          phone,
          email: validEmail || null,
          city: city || null,
          service: service || null,
          message: message || null,
        }),
      });
      stored = res.ok;
      if (!res.ok) console.error('lead insert failed', res.status, await res.text());
    } catch (err) {
      console.error('lead insert threw', err);
    }
    supaFetch(s, 'contact_hits', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ ip_hash: ipHash }),
    }).catch(() => {});
  }

  // 2) Trimitem emailul.
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || 'Essential Flooring <onboarding@resend.dev>';

  if (!apiKey || !to) {
    return stored
      ? json({ ok: true, emailed: false }, 200)
      : json({ error: 'Email not configured' }, 503);
  }

  const rows = [
    ['Name', name],
    ['Phone', phone],
    ['Email', validEmail || 'not provided'],
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

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `New estimate request: ${name}${city ? ` (${city})` : ''}`,
        html,
        ...(validEmail ? { reply_to: validEmail } : {}),
      }),
    });

    if (!res.ok) {
      console.error('resend failed', res.status, await res.text());
      // Cererea e deja salvata, deci pentru vizitator trimiterea a reusit.
      return stored
        ? json({ ok: true, emailed: false }, 200)
        : json({ error: 'Email delivery failed' }, 502);
    }
  } catch (err) {
    console.error('resend threw', err);
    return stored ? json({ ok: true, emailed: false }, 200) : json({ error: 'Email delivery failed' }, 502);
  }

  return json({ ok: true, emailed: true }, 200);
}
