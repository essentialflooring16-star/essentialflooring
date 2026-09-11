// Prepares the photos for one blog article.
//
// Body images go to public/blog/ as webp, served straight from the static site,
// because a post written in the cabinet is plain Markdown and cannot reach the
// hashed asset URLs Astro generates for src/assets.
//
// The cover is a separate JPG: the cabinet uploads it to Supabase Storage, and
// the article page renders it as aspect-[16/9] object-cover, so it is cropped
// to 16:9 here rather than letting the browser cut it wherever it likes.
//
//   node scripts/make-blog-images.mjs
//
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = 'src/assets/before-after';
const OUT = 'public/blog';
const COVER_OUT = 'scratch_out/blog-covers';

// The article container is max-w-3xl (768px), so 1200px covers a 1.5x screen
// without shipping a 1800px phone photo to every reader.
const BODY_WIDTH = 1200;

const body = [
  ['pair-10-after', 'refinishing-after-carmichael'],
  ['pair-07-before', 'oak-under-carpet-sacramento'],
  ['pair-07-after', 'oak-refinished-sacramento'],
  ['pair-12-after', 'refinished-hallway-fair-oaks'],
];

// 16:9 band cut out of a portrait photo. `top` is picked by eye so the drum
// sander and the line between old finish and bare oak both stay in frame.
const cover = {
  src: 'pair-10-before',
  name: 'cover-refinish-or-replace',
  top: 1044,
  width: 1600,
};

await mkdir(OUT, { recursive: true });
await mkdir(COVER_OUT, { recursive: true });

for (const [src, name] of body) {
  const input = `${SRC}/${src}.jpg`;
  const meta = await sharp(input).metadata();
  // Never upscale: pair-07-before is only 768px wide to begin with.
  const width = Math.min(BODY_WIDTH, meta.width);
  const info = await sharp(input)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(`${OUT}/${name}.webp`);
  console.log(`body   ${name}.webp  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
}

{
  const input = `${SRC}/${cover.src}.jpg`;
  const meta = await sharp(input).metadata();
  const height = Math.round((meta.width * 9) / 16);
  const info = await sharp(input)
    .extract({ left: 0, top: cover.top, width: meta.width, height })
    .resize({ width: cover.width })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(`${COVER_OUT}/${cover.name}.jpg`);
  console.log(`cover  ${cover.name}.jpg  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
}
