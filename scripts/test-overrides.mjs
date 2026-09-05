// Dovada ca editarea din cabinet chiar ajunge pe site.
//
// Pana aici s-a verificat doar ca nimic nu s-a stricat: site-ul iese identic cat
// timp nu exista suprascrieri. Testul asta face invers: ridica un server care
// raspunde ca Supabase, cu cateva texte schimbate, construieste site-ul cu el si
// verifica pagina cu pagina ca textele noi au ajuns acolo unde trebuie.
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const OVERRIDES = [
  { key: 'business.contact.phone', value: '(555) 010-2030' },
  { key: 'home.hero.title_line_1', value: 'TEST titlu pagina de start' },
  { key: 'faq.hero.title', value: 'TEST intrebari' },
  { key: 'service_laminate_flooring.card.name', value: 'TEST nume card laminat' },
  { key: 'city.roseville.h1', value: 'TEST titlu Roseville' },
  { key: 'portfolio.hero.title', value: 'TEST titlu portofoliu' },
];

const server = createServer((req, res) => {
  res.setHeader('content-type', 'application/json');
  if (req.url.startsWith('/rest/v1/site_content')) return res.end(JSON.stringify(OVERRIDES));
  res.end('[]');           // posts, reviews: goale, ca sa cada pe fallback
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;
console.log(`server fals Supabase pe portul ${port}`);

const build = spawn('npx', ['astro', 'build'], {
  env: {
    ...process.env,
    PUBLIC_SUPABASE_URL: `http://127.0.0.1:${port}`,
    PUBLIC_SUPABASE_ANON_KEY: 'test-key',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let log = '';
build.stdout.on('data', (d) => (log += d));
build.stderr.on('data', (d) => (log += d));
const code = await new Promise((r) => build.on('close', r));
server.close();

if (code !== 0) {
  console.error('BUILD PICAT:\n' + log.split('\n').slice(-25).join('\n'));
  process.exit(1);
}
console.log(log.match(/\d+ page\(s\) built.*/)?.[0] ?? 'build terminat');

const CHECKS = [
  ['dist/index.html', 'TEST titlu pagina de start', 'titlul de pe prima pagina'],
  ['dist/index.html', '(555) 010-2030', 'telefonul, pe prima pagina'],
  ['dist/index.html', 'tel:+15550102030', 'linkul tel:, dedus din numar'],
  ['dist/index.html', 'wa.me/15550102030', 'linkul WhatsApp, dedus din numar'],
  ['dist/faq/index.html', 'TEST intrebari', 'titlul paginii de intrebari'],
  ['dist/services/index.html', 'TEST nume card laminat', 'numele de pe cardul de serviciu'],
  ['dist/service-areas/roseville/index.html', 'TEST titlu Roseville', 'titlul paginii de oras'],
  ['dist/portfolio/index.html', 'TEST titlu portofoliu', 'titlul portofoliului'],
  ['dist/contact/index.html', '(555) 010-2030', 'telefonul, pe pagina de contact'],
  ['dist/services/laminate-flooring/index.html', '+1-555-010-2030', 'telefonul in datele pentru Google'],
];

let bad = 0;
for (const [file, needle, what] of CHECKS) {
  const ok = existsSync(file) && readFileSync(file, 'utf8').includes(needle);
  if (!ok) bad++;
  console.log(`  ${ok ? 'ok    ' : 'LIPSA '} ${what}`);
}

// Si invers: numarul vechi nu mai are voie sa apara nicaieri.
let leftovers = 0;
for (const f of ['dist/index.html', 'dist/contact/index.html', 'dist/services/index.html']) {
  if (existsSync(f) && readFileSync(f, 'utf8').includes('916) 425-1361')) {
    console.log(`  RAMAS  numarul vechi inca apare in ${f}`);
    leftovers++;
  }
}
if (!leftovers) console.log('  ok     numarul vechi nu mai apare nicaieri');

console.log(bad || leftovers ? `\n${bad + leftovers} probleme` : '\nToate suprascrierile ajung pe site.');
process.exit(bad + leftovers ? 1 : 0);
