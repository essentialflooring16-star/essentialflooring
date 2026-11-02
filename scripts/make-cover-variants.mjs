// AVIF copies of the JPG and PNG photos in public/blog, made before every build.
//
// An article cover is the largest thing on screen when the page opens, and the
// JPG from make-blog-images.mjs is 1600px and about 200 KB. A phone needs the
// 800px copy, which as AVIF is a fraction of that. src/pages/blog/[slug].astro
// offers whichever copies exist, so nothing has to be remembered when a new
// cover is added: the next build makes its copies.
//
// The copies are build output, not source (see .gitignore), and a failure here
// only logs: the article falls back to the JPG, the deploy goes on.
//
//   node scripts/make-cover-variants.mjs
//
import sharp from 'sharp';
import { access, readdir } from 'node:fs/promises';

const DIR = 'public/blog';
const WIDTHS = [800, 1600];

const exists = (p) => access(p).then(() => true, () => false);

try {
  const files = (await readdir(DIR)).filter((f) => /\.(jpe?g|png)$/i.test(f));
  for (const file of files) {
    const name = file.replace(/\.[^.]+$/, '');
    const { width } = await sharp(`${DIR}/${file}`).metadata();
    // Never upscale: a copy is only made at a width the photo really has, so
    // the "800w" in the srcset is always true.
    for (const w of WIDTHS.filter((w) => w <= width)) {
      const out = `${DIR}/${name}-${w}w.avif`;
      if (await exists(out)) continue;
      const info = await sharp(`${DIR}/${file}`).resize({ width: w }).avif({ quality: 50 }).toFile(out);
      console.log(`[cover-variants] ${name}-${w}w.avif  ${Math.round(info.size / 1024)} KB`);
    }
  }
} catch (err) {
  console.warn(`[cover-variants] skipped: ${err.message}`);
}
