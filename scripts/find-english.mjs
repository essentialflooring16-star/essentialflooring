// Cauta in componenta stringurile englezesti ramase netraduse. Un sir care arata
// a propozitie si nu e nume de tabel, clasa CSS sau cheie de date.
import { readFileSync } from 'node:fs';
const file = process.argv[2];
const src = readFileSync(`src/components/admin/${file}.tsx`, 'utf8');

const NOISE = /^(https?:|\/|#|[a-z-]+$|[\w-]+\/[\w-]+|\d)/;
const CSSISH = /(^|\s)(flex|grid|mt-|mb-|px-|py-|text-|bg-|border|rounded|gap-|w-|h-|font-|hover:|sm:|md:|lg:|absolute|relative|inline)/;

const found = [];
// siruri intre ghilimele
for (const m of src.matchAll(/(['"`])((?:[^'"`\\\n]|\\.){8,120})\1/g)) {
  const v = m[2];
  if (NOISE.test(v) || CSSISH.test(v)) continue;
  if (!/[A-Z]/.test(v[0]) && !/ [a-z]+ /.test(v)) continue;
  if (!/[a-z]{3}/.test(v)) continue;
  const line = src.slice(0, m.index).split('\n').length;
  found.push([line, v]);
}
// text intre etichete JSX
for (const m of src.matchAll(/>\s*([A-Z][A-Za-z0-9,'’\- ]{6,110}?)\s*</g)) {
  const line = src.slice(0, m.index).split('\n').length;
  found.push([line, m[1]]);
}

const seen = new Set();
const list = found.filter(([, v]) => !seen.has(v) && seen.add(v));
console.log(`${file}: ${list.length} siruri englezesti ramase`);
for (const [line, v] of list) console.log(`  L${String(line).padEnd(5)} ${JSON.stringify(v)}`);
