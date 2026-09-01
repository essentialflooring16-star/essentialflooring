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

// Paleta E2 a site-ului, aceleasi valori ca LAYER 1 din global.css.
const C = {
  green: '#1c4632',
  greenHi: '#275c42',
  ground: '#faf8f1',
  tint: '#f0ecdd',
  white: '#ffffff',
  rule: '#e3ddc9',
  ink: '#1b2a22',
  body: '#35473c',
  muted: '#5f6f65',
  gold: '#d9a441',
  goldOnDark: '#e3b154',
  goldDeep: '#a8781f',
  cream: '#f4f1e6',
} as const;

const SERIF = "Georgia, 'Times New Roman', Times, serif";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export type LeadEmail = {
  name: string;
  phone: string;
  email: string;
  city: string;
  service: string;
  message: string;
  receivedAt?: string;
};

function esc(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Numarul asa cum il tasteaza oamenii, curatat pentru href="tel:".
function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  return digits.startsWith('+') ? digits : `+1${digits.replace(/^1/, '')}`;
}

export function leadEmailSubject(lead: LeadEmail): string {
  const what = lead.service || 'Estimate';
  const where = lead.city ? `, ${lead.city}` : '';
  return `${what} request from ${lead.name}${where}`;
}

// Un rand din tabelul de detalii. Valoarea poate fi deja HTML (un link).
function row(label: string, valueHtml: string, isLast = false): string {
  const border = isLast ? '' : `border-bottom:1px solid ${C.rule};`;
  return `
    <tr>
      <td class="lbl" style="${border}padding:13px 16px 13px 0;font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${C.muted};white-space:nowrap;vertical-align:top;">${esc(label)}</td>
      <td class="val" style="${border}padding:13px 0;font-family:${SANS};font-size:16px;line-height:1.45;color:${C.ink};vertical-align:top;">${valueHtml}</td>
    </tr>`;
}

function button(href: string, label: string, fill: string, text: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;margin:0 10px 10px 0;">
      <tr>
        <td style="background-color:${fill};border-radius:4px;">
          <a href="${esc(href)}" style="display:inline-block;padding:15px 28px;font-family:${SANS};font-size:15px;font-weight:700;letter-spacing:0.01em;color:${text};text-decoration:none;">${esc(label)}</a>
        </td>
      </tr>
    </table>`;
}

export function leadEmailHtml(lead: LeadEmail): string {
  const { name, phone, email, city, service, message, receivedAt } = lead;

  const rows = [
    row('Phone', `<a href="tel:${esc(telHref(phone))}" style="color:${C.ink};text-decoration:none;font-weight:700;">${esc(phone)}</a>`),
    email
      ? row('Email', `<a href="mailto:${esc(email)}" style="color:${C.green};text-decoration:underline;">${esc(email)}</a>`)
      : '',
    city ? row('City', esc(city)) : '',
    service ? row('Service', esc(service)) : '',
    receivedAt ? row('Received', `<span style="color:${C.muted};">${esc(receivedAt)}</span>`, true) : '',
  ]
    .filter(Boolean)
    .join('');

  const messageBlock = message
    ? `
      <tr>
        <td style="padding:26px 0 0 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.white};border-left:3px solid ${C.green};border-radius:0 6px 6px 0;">
            <tr>
              <td style="padding:18px 22px;">
                <p style="margin:0 0 8px 0;font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${C.muted};">What they wrote</p>
                <p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.7;color:${C.body};">${esc(message).replaceAll('\n', '<br>')}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : '';

  const subline = [service, city].filter(Boolean).join(' in ');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<style>
  @media only screen and (max-width:600px) {
    .pad { padding-left:20px !important; padding-right:20px !important; }
    .lbl { display:block !important; padding-bottom:2px !important; padding-right:0 !important; }
    .val { display:block !important; padding-top:0 !important; }
    .h1  { font-size:26px !important; }
  }
</style>
<title>${esc(leadEmailSubject(lead))}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.ground};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(name)} asked for an estimate. ${esc(phone)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.ground};">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="shell" style="width:100%;max-width:600px;border-collapse:collapse;">

          <!-- banda verde cu sigla, aceeasi ca subsolul site-ului -->
          <tr>
            <td class="pad" style="background-color:${C.green};border-radius:8px 8px 0 0;padding:30px 34px 28px 34px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" style="vertical-align:bottom;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr><td style="padding:0 0 2px 0;"><div style="width:36px;height:3px;background-color:${C.cream};font-size:0;line-height:0;">&nbsp;</div></td></tr>
                      <tr><td style="padding:0 0 8px 14px;"><div style="width:36px;height:3px;background-color:${C.goldOnDark};font-size:0;line-height:0;">&nbsp;</div></td></tr>
                      <tr>
                        <td style="font-family:${SANS};font-size:23px;font-weight:800;letter-spacing:-0.01em;text-transform:uppercase;color:${C.cream};line-height:1;">Essential</td>
                      </tr>
                      <tr>
                        <td style="padding:7px 0 0 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="vertical-align:middle;padding:0;"><div style="width:18px;height:1px;background-color:${C.goldOnDark};font-size:0;line-height:0;">&nbsp;</div></td>
                              <td style="padding:0 9px;font-family:${SANS};font-size:9px;font-weight:700;letter-spacing:0.34em;text-transform:uppercase;color:${C.goldOnDark};white-space:nowrap;">Flooring</td>
                              <td style="vertical-align:middle;padding:0;"><div style="width:18px;height:1px;background-color:${C.goldOnDark};font-size:0;line-height:0;">&nbsp;</div></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align:bottom;font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${C.cream};opacity:0.55;white-space:nowrap;">Sacramento, CA</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- corpul cererii -->
          <tr>
            <td class="pad" style="background-color:${C.tint};padding:36px 34px 34px 34px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${C.goldDeep};">New estimate request</td>
                </tr>
                <tr>
                  <td class="h1" style="padding:10px 0 0 0;font-family:${SERIF};font-size:30px;line-height:1.15;color:${C.ink};">${esc(name)}</td>
                </tr>
                ${subline ? `<tr><td style="padding:8px 0 0 0;font-family:${SANS};font-size:15px;line-height:1.5;color:${C.muted};">${esc(subline)}</td></tr>` : ''}
                <tr>
                  <td style="padding:22px 0 0 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="width:46px;height:2px;background-color:${C.gold};font-size:0;line-height:0;">&nbsp;</td></tr></table></td>
                </tr>

                <tr>
                  <td style="padding:12px 0 0 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${rows}</table>
                  </td>
                </tr>

                ${messageBlock}

                <tr>
                  <td style="padding:30px 0 0 0;">
                    ${button(`tel:${telHref(phone)}`, `Call ${phone}`, C.gold, C.ink)}
                    ${email ? button(`mailto:${email}?subject=${encodeURIComponent('Your flooring estimate, Essential Flooring')}`, 'Reply by email', C.green, C.cream) : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- subsol -->
          <tr>
            <td class="pad" style="background-color:${C.green};border-radius:0 0 8px 8px;padding:22px 34px;">
              <p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.7;color:${C.cream};opacity:0.92;">
                Essential Flooring Inc &nbsp;&middot;&nbsp; Sacramento, CA &nbsp;&middot;&nbsp; CSLB #1117565
              </p>
              <p style="margin:6px 0 0 0;font-family:${SANS};font-size:11px;line-height:1.7;color:${C.cream};opacity:0.6;">
                Sent automatically by essentialflooringinc.com.${email ? ' Hit reply and it goes straight to them.' : ''}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Varianta text simplu, pentru clientii de mail care nu randeaza HTML.
export function leadEmailText(lead: LeadEmail): string {
  return [
    'NEW ESTIMATE REQUEST',
    '',
    `Name:    ${lead.name}`,
    `Phone:   ${lead.phone}`,
    lead.email ? `Email:   ${lead.email}` : '',
    lead.city ? `City:    ${lead.city}` : '',
    lead.service ? `Service: ${lead.service}` : '',
    lead.receivedAt ? `Received: ${lead.receivedAt}` : '',
    lead.message ? `\nWhat they wrote:\n${lead.message}` : '',
    '',
    'Sent automatically by essentialflooringinc.com',
  ]
    .filter((l) => l !== '')
    .join('\n');
}

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

// Forma minima a obiectelor pe care le da @vercel/node. Nu importam tipurile
// pachetului ca sa nu adaugam o dependenta doar pentru doua semnaturi.
type Req = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};
type Res = {
  status(code: number): Res;
  setHeader(name: string, value: string): Res;
  json(body: unknown): void;
};

const send = (res: Res, body: unknown, status: number) => {
  res.status(status).setHeader('Cache-Control', 'no-store').json(body);
};

function header(req: Req, name: string): string {
  const v = req.headers[name];
  return (Array.isArray(v) ? v[0] : v) ?? '';
}

function clientIp(req: Req): string {
  const fwd = header(req, 'x-forwarded-for');
  return fwd.split(',')[0]?.trim() || header(req, 'x-real-ip') || 'unknown';
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

// Semnatura clasica (req, res). Varianta web, care returna un Response, nu
// era trimisa niciodata de runtime: functia ramanea "running" pana la timeout,
// iar site-ul vedea 500. Verificat local cu `vercel dev`.
export default async function handler(req: Req, res: Res): Promise<void> {
  if (req.method !== 'POST') return send(res, { error: 'Method not allowed' }, 405);

  // Vercel parseaza singur JSON-ul cand Content-Type e application/json, dar
  // acceptam si un string, in caz ca antetul lipseste.
  let body: Lead;
  try {
    const raw = req.body;
    body = (typeof raw === 'string' ? JSON.parse(raw) : raw ?? {}) as Lead;
    if (!body || typeof body !== 'object') throw new Error('not an object');
  } catch {
    return send(res, { error: 'Invalid JSON' }, 400);
  }

  // Honeypot si verificarea de timp: raspundem 200 ca sa nu invatam botul nimic.
  if (body.company) return send(res, { ok: true }, 200);
  if (typeof body.elapsedMs === 'number' && body.elapsedMs >= 0 && body.elapsedMs < MIN_FILL_MS) {
    return send(res, { ok: true }, 200);
  }

  const cut = (v: unknown, n: number) => (v ?? '').toString().trim().slice(0, n);
  const name = cut(body.name, MAX.name);
  const phone = cut(body.phone, MAX.phone);
  const email = cut(body.email, MAX.email);
  const city = cut(body.city, MAX.city);
  const service = cut(body.service, MAX.service);
  const message = cut(body.message, MAX.message);

  if (!name || !phone) return send(res, { error: 'Name and phone are required' }, 400);
  // Un email invalid ar rupe reply_to, deci il ignoram in loc sa respingem cererea.
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : '';

  const s = supabase();
  const ipHash = await hashIp(clientIp(req));

  if (await isRateLimited(s, ipHash)) {
    return send(res, { error: 'Too many requests. Please call us instead.' }, 429);
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
    try {
      await supaFetch(s, 'contact_hits', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ ip_hash: ipHash }),
      });
    } catch {
      /* contorul e doar pentru rate limiting, nu blocheaza cererea */
    }
  }

  // 2) Trimitem emailul.
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || 'Essential Flooring <onboarding@resend.dev>';

  if (!apiKey || !to) {
    return stored
      ? send(res, { ok: true, emailed: false }, 200)
      : send(res, { error: 'Email not configured' }, 503);
  }

  // Ora locala a clientului, nu UTC. El citeste emailul in Sacramento.
  let receivedAt = '';
  try {
    receivedAt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date());
  } catch {
    // Un runtime fara datele complete de fus orar nu are voie sa rupa un lead.
    receivedAt = new Date().toISOString();
  }

  const lead = { name, phone, email: validEmail, city, service, message, receivedAt };
  const html = leadEmailHtml(lead);
  const text = leadEmailText(lead);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        subject: leadEmailSubject(lead),
        html,
        text,
        ...(validEmail ? { reply_to: validEmail } : {}),
      }),
    });

    if (!res.ok) {
      console.error('resend failed', res.status, await res.text());
      // Cererea e deja salvata, deci pentru vizitator trimiterea a reusit.
      return stored
        ? send(res, { ok: true, emailed: false }, 200)
        : send(res, { error: 'Email delivery failed' }, 502);
    }
  } catch (err) {
    console.error('resend threw', err);
    return stored ? send(res, { ok: true, emailed: false }, 200) : send(res, { error: 'Email delivery failed' }, 502);
  }

  return send(res, { ok: true, emailed: true }, 200);
}
