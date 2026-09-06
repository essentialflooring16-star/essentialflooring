// Vercel nu impacheteaza functiile din api/, le transpileaza doar: api/contact.ts
// devine api/contact.js si atat. Un import relativ care iese din api/ ramane in
// fisierul compilat ca o cale catre un fisier care nu ajunge niciodata pe server,
// asa ca functia moare la prima cerere cu ERR_MODULE_NOT_FOUND, si numai in
// productie: local, esbuild rezolva importul si totul pare in regula.
//
// S-a intamplat pe 6 septembrie 2026 cu `import { SITE } from '../src/data/site'`,
// si a picat formularul de contact pe site-ul live. Verificatorul asta ruleaza
// inainte de push si spune de ce, nu doar ca.

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const API_DIR = 'api';
const IMPORT_RE = /(?:^|\n)\s*(?:import|export)[^;\n]*?from\s+['"]([^'"]+)['"]/g;
const REQUIRE_RE = /require\(\s*['"]([^'"]+)['"]\s*\)/g;

const problems = [];

const files = (await readdir(API_DIR, { recursive: true }))
  .filter((f) => /\.(ts|js|mjs)$/.test(f) && !f.startsWith('_'));

for (const file of files) {
  const path = join(API_DIR, file);
  const source = await readFile(path, 'utf8');

  for (const re of [IMPORT_RE, REQUIRE_RE]) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(source)) !== null) {
      const spec = match[1];
      if (!spec.startsWith('.')) continue; // pachet din node_modules, e in regula
      if (spec.startsWith('./') && !spec.includes('..')) continue; // vecin in api/
      problems.push({ path, spec });
    }
  }
}

if (problems.length > 0) {
  console.error('Import care iese din api/, functia va cadea in productie:\n');
  for (const { path, spec } of problems) {
    console.error(`  ${path}  ->  ${spec}`);
  }
  console.error(
    '\nVercel transpileaza fisierele din api/ fara sa le impacheteze, deci calea\n' +
      'asta nu exista pe server. Scrie valoarea in fisierul functiei, sau pune\n' +
      'fisierul comun in api/ cu numele incepand cu _ ca sa nu devina o ruta.',
  );
  process.exit(1);
}

console.log(`check-api-imports: ${files.length} fisier(e) in api/, niciun import in afara.`);
