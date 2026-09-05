// Verifica registrul de continut fata de codul sursa.
//
// Regula: valoarea implicita a fiecarui camp trebuie sa se regaseasca in sursa,
// caracter cu caracter dupa colapsarea spatiilor. Daca nu se regaseste, textul
// de pe site s-ar schimba in momentul in care pagina incepe sa citeasca din
// registru, adica exact ce nu trebuie sa se intample.
import { build } from 'esbuild';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const out = await build({
  entryPoints: ['src/data/content/index.ts'],
  bundle: true, write: false, format: 'esm', platform: 'neutral',
  loader: { '.json': 'json' },
});
const mod = await import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));
const { CONTENT_FIELDS, GROUPS, CITY_FIELDS } = mod;

// Toata sursa relevanta, intr-un singur text normalizat.
function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (name !== 'admin') walk(p, acc); }
    else if (/\.(astro|ts|tsx|json)$/.test(name) && !p.includes('/data/content/')) acc.push(p);
  }
  return acc;
}
const files = walk('src');
const norm = (s) => s.replace(/\s+/g, ' ').trim();

// Fisierele JSON se parseaza, nu se citesc brut: intr-un JSON brut un rand nou
// din interiorul unei valori apare ca cele doua caractere \\ si n, deci un text
// corect declarat nu s-ar potrivi niciodata.
function textOf(path) {
  const raw = readFileSync(path, 'utf8');
  if (!path.endsWith('.json')) return raw;
  const acc = [];
  const visit = (v) => {
    if (typeof v === 'string') acc.push(v);
    else if (Array.isArray(v)) v.forEach(visit);
    else if (v && typeof v === 'object') Object.values(v).forEach(visit);
  };
  try { visit(JSON.parse(raw)); } catch { return raw; }
  return acc.join('\n');
}
const HAYSTACK = norm(files.map(textOf).join('\n'));
// A doua stiva, cu entitatile HTML dezvoltate, pentru textele scrise cu &amp;
const HAY_DECODED = HAYSTACK.replace(/&amp;/g, '&').replace(/&middot;/g, '·').replace(/&nbsp;/g, ' ');

const problems = [];
let wired = 0;
const groupIds = new Set(GROUPS.map((g) => g.id));
const seen = new Set();

for (const f of CONTENT_FIELDS) {
  if (seen.has(f.key)) problems.push([f.key, 'CHEIE DUPLICATA']);
  seen.add(f.key);
  if (!groupIds.has(f.group)) problems.push([f.key, `grup necunoscut: ${f.group}`]);
  if (!f.label?.ro || !f.label?.en) problems.push([f.key, 'eticheta incompleta']);

  // Fragmentele fixe: partile dintre substituenti. Un fragment sub 12 caractere
  // e prea scurt ca sa dovedeasca ceva, deci nu se verifica.
  const raw = String(f.default ?? '');
  let fragments;
  if (f.type === 'pairs' || f.type === 'faq') {
    try {
      fragments = JSON.parse(raw).flatMap((o) => Object.values(o).map(String));
    } catch { problems.push([f.key, 'JSON invalid in default']); continue; }
  } else if (f.type === 'list') {
    fragments = raw.split('\n');
  } else if (['number', 'tel', 'email', 'url'].includes(f.type)) {
    fragments = [raw];
  } else {
    fragments = [raw];
  }

  // Un camp deja legat nu mai are textul in sursa: acolo sta acum apelul c().
  // Prezenta apelului e dovada ca textul vine din registru, deci se sare.
  if (HAYSTACK.includes(`c('${f.key}')`) || HAYSTACK.includes(`c("${f.key}")`)) { wired++; continue; }

  for (const frag of fragments) {
    for (const piece of String(frag).split(/\{\w+\}/)) {
      const needle = norm(piece);
      if (needle.length < 12) continue;
      if (!HAYSTACK.includes(needle) && !HAY_DECODED.includes(needle)) {
        problems.push([f.key, `nu se regaseste in sursa: ${JSON.stringify(needle.slice(0, 90))}`]);
      }
    }
  }
}

console.log(`campuri in registru: ${CONTENT_FIELDS.length}  (+ ${CITY_FIELDS.length} per oras)`);
console.log(`deja legate in pagini: ${wired}`);
const perGroup = {};
for (const f of CONTENT_FIELDS) perGroup[f.group] = (perGroup[f.group] || 0) + 1;
console.log('pe grupuri:', perGroup);
console.log(`\nprobleme: ${problems.length}`);
for (const [k, m] of problems) console.log(`  ${k}\n     ${m}`);
process.exit(problems.length ? 1 : 0);
