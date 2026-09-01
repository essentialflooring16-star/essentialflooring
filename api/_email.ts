// Sablonul emailului de notificare trimis catre Essential Flooring cand cineva
// completeaza formularul de pe site. Fisierul incepe cu underscore, deci Vercel
// NU il expune ca ruta; e doar un modul importat de api/contact.ts.
//
// Reguli de email, nu de web: layout pe tabele, stiluri inline, fara flex,
// fara grid, fara font web (Gmail le ignora), latime maxima 600px. Georgia
// tine locul lui Fraunces, Helvetica tine locul lui Inter.

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
