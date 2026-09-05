import { build } from 'esbuild';
const out = await build({
  entryPoints: ['src/lib/admin-strings.ts'],
  bundle: true, write: false, format: 'esm', platform: 'neutral',
});
const mod = await import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));
const { en, ro } = mod.STRINGS;
const ek = Object.keys(en), rk = Object.keys(ro);
console.log('chei EN:', ek.length, '| chei RO:', rk.length);
const missing = ek.filter(k => !(k in ro));
const extra = rk.filter(k => !(k in en));
console.log('lipsa in RO:', missing.length ? missing.join(', ') : 'niciuna');
console.log('in plus in RO:', extra.length ? extra.join(', ') : 'niciuna');
// plural forms: RO should have 3 where EN has 2
const pl = ek.filter(k => en[k].includes(' | '));
console.log('\nchei cu plural:', pl.length);
const badPl = pl.filter(k => (ro[k]||'').split(' | ').length < 2);
console.log('plural lipsa in RO:', badPl.length ? badPl.join(', ') : 'niciuna');
// cedilla check (wrong Romanian diacritics)
const ced = rk.filter(k => /[şţŞŢ]/.test(ro[k]));
console.log('diacritice cu sedila (gresite):', ced.length ? ced.join(', ') : 'niciuna');
// em dash check
const dash = rk.filter(k => ro[k].includes('—')).concat(ek.filter(k => en[k].includes('—')));
console.log('linie de dialog lunga:', dash.length ? dash.join(', ') : 'niciuna');
// untranslated (identical strings that are not brand/acronym)
const same = ek.filter(k => en[k] === ro[k] && en[k].length > 3);
console.log('\nidentice EN=RO (' + same.length + '):');
same.slice(0,40).forEach(k => console.log('   ', k, '=', JSON.stringify(en[k]).slice(0,70)));
