// Cat de tradus e fiecare panou.
//
// O cheie conteaza ca folosita daca apare oriunde in fisier, nu doar in t('...'):
// mai multe panouri tin cheile in tabele (etichetele de status, randurile de
// verificare), iar traducerea se face la randare. Cautarea dupa t() singura ar
// raporta zeci de chei ca nefolosite cand ele chiar se afiseaza.
import { build } from 'esbuild';
import { readFileSync } from 'node:fs';

const out = await build({
  entryPoints: ['src/lib/admin-strings.ts'], bundle: true, write: false,
  format: 'esm', platform: 'neutral',
});
const { STRINGS } = await import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));
const known = new Set(Object.keys(STRINGS.en));

const PANELS = {
  AdminApp: 'app', Dashboard: 'dashboard', LeadsInbox: 'leads',
  PortfolioManager: 'portfolio', BlogManager: 'blog',
  ReviewsManager: 'reviews',
};

let problems = 0;
console.log('panou                acoperire   chei lipsa   nefolosite');
for (const [file, ns] of Object.entries(PANELS)) {
  const src = readFileSync(`src/components/admin/${file}.tsx`, 'utf8');
  const declared = [...known].filter((k) => k.startsWith(ns + '.'));
  const present = declared.filter((k) => src.includes(`'${k}'`) || src.includes(`"${k}"`) || src.includes(`\`${k}\``));
  const called = [...src.matchAll(/\bt\(\s*['"`]([\w.]+)['"`]/g)].map((m) => m[1]);
  const missing = [...new Set(called)].filter((k) => !known.has(k));
  const unused = declared.filter((k) => !present.includes(k));
  if (missing.length) problems++;
  const pct = declared.length ? Math.round((present.length / declared.length) * 100) : 100;
  console.log(
    `${file.padEnd(20)} ${String(pct).padStart(3)}%       ${String(missing.length).padStart(3)}          ${unused.length}` +
    (missing.length ? `\n    CHEI INEXISTENTE: ${missing.join(', ')}` : '') +
    (unused.length ? `\n    nefolosite: ${unused.slice(0, 8).join(', ')}${unused.length > 8 ? ', ...' : ''}` : ''),
  );
}
process.exit(problems ? 1 : 0);
