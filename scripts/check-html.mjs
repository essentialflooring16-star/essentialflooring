// Compara paginile construite acum cu paginile de referinta salvate inainte de
// modificari. Fara suprascrieri in baza de date, site-ul trebuie sa iasa
// IDENTIC: stratul de continut editabil e un strat peste site, nu o rescriere
// a lui. Orice diferenta aici e o regresie pe un site care e deja live.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const BASE = process.argv[2];
const DIST = process.argv[3] ?? 'dist';
if (!BASE || !existsSync(BASE)) {
  console.error('foloseste: node scripts/check-html.mjs <folder-referinta> [dist]');
  process.exit(2);
}

function pages(dir, root = dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) pages(p, root, acc);
    else if (name.endsWith('.html')) acc.push(relative(root, p));
  }
  return acc;
}

const before = new Set(pages(BASE));
const after = new Set(pages(DIST));

const missing = [...before].filter((p) => !after.has(p));
const added = [...after].filter((p) => !before.has(p));
const changed = [];

// Spatiul dintre etichete se colapseaza in HTML, deci un text scris pe randuri
// separate si acelasi text venit dintr-o expresie randeaza identic in browser.
// Diferenta aceea nu e o regresie. Se numara separat de diferentele reale.
const collapse = (html) => html.replace(/>\s+</g, '> <').replace(/\s+/g, ' ');
// Numele fisierelor de asset poarta un hash de continut. Tailwind genereaza CSS
// din clasele gasite in sursa, deci mutarea unui text intr-o expresie ii poate
// schimba ordinea si, cu ea, hash-ul, fara ca vreo regula sa se schimbe. Nu e
// text de pe site, deci se normalizeaza si se raporteaza separat.
const unhash = (html) => html.replace(/\.[A-Za-z0-9_-]{8}\.(css|js|webp|jpg|jpeg|png|svg|avif)/g, '.HASH.$1');
// Un text venit dintr-o expresie e escapat de Astro: apostroful devine &#39; si
// ghilimeaua &quot;. In browser se citeste exact acelasi caracter, deci nu e o
// schimbare de continut. Se compara textul asa cum ajunge la cititor.
const decode = (html) =>
  html
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '\u00b7')
    .replace(/&amp;/g, '&');
let whitespaceOnly = 0;
let hashOnly = 0;
let escapedOnly = 0;

for (const rel of [...before].filter((p) => after.has(p))) {
  const a = readFileSync(join(BASE, rel), 'utf8');
  const b = readFileSync(join(DIST, rel), 'utf8');
  if (a === b) continue;
  const na = decode(collapse(unhash(a))), nb = decode(collapse(unhash(b)));
  if (na === nb) {
    if (unhash(a) === unhash(b)) hashOnly++;
    else if (collapse(unhash(a)) === collapse(unhash(b))) escapedOnly++;
    else whitespaceOnly++;
    continue;
  }

  // Prima linie care difera, ca sa se vada imediat ce s-a schimbat.
  const la = unhash(a).split('\n'), lb = unhash(b).split('\n');
  let i = 0;
  while (i < la.length && i < lb.length && la[i] === lb[i]) i++;
  changed.push({
    page: rel,
    line: i + 1,
    before: (la[i] ?? '(lipseste)').trim().slice(0, 200),
    after: (lb[i] ?? '(lipseste)').trim().slice(0, 200),
  });
}

console.log(`pagini de referinta: ${before.size}   construite acum: ${after.size}`);
if (missing.length) console.log(`\nPAGINI DISPARUTE (${missing.length}): ${missing.join(', ')}`);
if (added.length) console.log(`\nPAGINI NOI (${added.length}): ${added.join(', ')}`);
if (hashOnly) console.log(`\npagini care difera doar prin hash-ul unui asset: ${hashOnly}`);
if (escapedOnly) console.log(`pagini care difera doar prin escapare (&#39; in loc de '): ${escapedOnly}`);
if (whitespaceOnly) console.log(`pagini identice dupa colapsarea spatiilor: ${whitespaceOnly} (fara efect in browser)`);
console.log(`\npagini cu continut modificat: ${changed.length}`);
for (const c of changed.slice(0, 25)) {
  console.log(`\n  ${c.page}  (prima diferenta la linia ${c.line})`);
  console.log(`    inainte: ${c.before}`);
  console.log(`    acum   : ${c.after}`);
}
if (changed.length > 25) console.log(`\n  ... si inca ${changed.length - 25} pagini`);

const bad = changed.length + missing.length + added.length;
console.log(
  bad
    ? `\nREZULTAT: ${bad} diferente de continut`
    : `\nREZULTAT: niciun text schimbat pe site${whitespaceOnly ? ` (${whitespaceOnly} pagini difera doar prin spatiere)` : ''}.`,
);
process.exit(bad ? 1 : 0);
