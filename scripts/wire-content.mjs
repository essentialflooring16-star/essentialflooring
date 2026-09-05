// Leaga textele unei pagini de registrul de continut.
//
// Automatizeaza doar cazul neambiguu: textul implicit apare EXACT O DATA in
// fisier, ca text intre etichete sau ca valoare de atribut. Orice altceva
// (aparitii multiple, texte taiate de marcaj, liste si perechi) e raportat si
// lasat pentru mana omului. Regula: mai bine zece campuri nelegate decat un
// singur text stricat pe un site care e live.
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';

const [, , GROUP, ...FILES] = process.argv;
if (!GROUP || !FILES.length) {
  console.error('foloseste: node scripts/wire-content.mjs <grup> <fisier...>');
  process.exit(2);
}

const out = await build({
  entryPoints: ['src/data/content/index.ts'], bundle: true, write: false,
  format: 'esm', platform: 'neutral', loader: { '.json': 'json' },
});
const { CONTENT_FIELDS } = await import(
  'data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64')
);

const fields = CONTENT_FIELDS.filter((f) => f.group === GROUP);
const simple = fields.filter((f) => ['text', 'textarea'].includes(f.type));

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const relToLib = (p) => '../'.repeat(p.split('/').length - 2) + 'lib/content';

let wired = 0;
const skipped = [];

for (const path of FILES) {
  let src = readFileSync(path, 'utf8');

  for (const f of simple) {
    const text = f.default;
    if (!text || text.length < 8) { skipped.push([f.key, path, 'prea scurt ca sa fie potrivit sigur']); continue; }
    if (src.includes(`c('${f.key}')`)) continue;

    // Textul cautat, cu spatiile din marcaj tolerate: JSX rupe propozitiile pe
    // randuri, deci intre cuvinte poate sta orice combinatie de spatii.
    const pattern = new RegExp(escapeRe(text).replace(/\s+/g, '\\s+'), 'g');
    const hits = [...src.matchAll(pattern)];
    if (hits.length === 0) { skipped.push([f.key, path, 'negasit in acest fisier']); continue; }
    if (hits.length > 1) { skipped.push([f.key, path, `apare de ${hits.length} ori, ambiguu`]); continue; }

    const at = hits[0].index;
    const before = src.slice(Math.max(0, at - 220), at);
    const after = src.slice(at + hits[0][0].length, at + hits[0][0].length + 120);

    // Text dintr-un sir din cod, de pilda cele doua ramuri ale unui ternar.
    // Inlocuit naiv, ar iesi '{c('cheie')}', cu ghilimele imbricate care nu
    // compileaza. Cazul cere mana omului, fiindca depinde de ce e in jur.
    const q = before.at(-1);
    if ((q === "'" || q === '`') && after.startsWith(q) && /[?:=(,]\s*$/.test(before.slice(0, -1))) {
      skipped.push([f.key, path, 'e un sir din cod, nu text de pagina']);
      continue;
    }

    // In ce context sta textul: intre etichete, sau in interiorul unui atribut?
    const lastOpen = before.lastIndexOf('<');
    const lastClose = before.lastIndexOf('>');
    const inTag = lastOpen > lastClose;

    let replacement;
    if (!inTag) {
      replacement = `{c('${f.key}')}`;
    } else {
      // Atribut: title="Text" devine title={c('cheie')}. Se accepta doar forma
      // simpla, in care textul umple exact ghilimelele, ca sa nu se strice o
      // valoare compusa.
      const quote = before.at(-1);
      if ((quote === '"' || quote === "'") && after.startsWith(quote)) {
        replacement = `{c('${f.key}')}`;
        src = src.slice(0, at - 1) + replacement + src.slice(at + hits[0][0].length + 1);
        wired++;
        continue;
      }
      skipped.push([f.key, path, 'in interiorul unui atribut compus']);
      continue;
    }

    src = src.slice(0, at) + replacement + src.slice(at + hits[0][0].length);
    wired++;
  }

  if (src.includes("c('") && !src.includes('getContent')) {
    const m = src.match(/^---\n(.*?)\n---\n/s);
    if (m) {
      const lines = m[1].split('\n');
      const lastImport = lines.reduce((acc, l, i) => (l.startsWith('import ') ? i : acc), -1);
      lines.splice(lastImport + 1, 0, `import { getContent } from '${relToLib(path)}';`, '', 'const c = await getContent();');
      src = '---\n' + lines.join('\n') + '\n---\n' + src.slice(m[0].length);
    }
  }
  writeFileSync(path, src);
}

console.log(`grup ${GROUP}: ${wired} texte legate din ${simple.length} campuri simple (${fields.length} in total)`);
if (skipped.length) {
  console.log('\nnelegate automat:');
  const seen = new Set();
  for (const [k, p, why] of skipped) {
    if (why === 'negasit in acest fisier') continue;
    if (seen.has(k)) continue;
    seen.add(k);
    console.log(`  ${k.padEnd(46)} ${why}`);
  }
  const notFound = [...new Set(skipped.filter(([, , w]) => w === 'negasit in acest fisier').map(([k]) => k))]
    .filter((k) => !seen.has(k));
  if (notFound.length) console.log(`\n  negasite in fisierele date (${notFound.length}): ${notFound.join(', ')}`);
}
