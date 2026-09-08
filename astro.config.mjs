import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://essentialflooringinc.com',
  integrations: [
    react(),
    sitemap({
      // Only the admin cabinet stays out. The four legal pages used to be
      // excluded along with it, which meant the one part of the site a
      // suspicious homeowner goes looking for was the hardest to find. They are
      // ordinary public pages now, indexable and in the sitemap.
      filter: (page) => !page.includes('/admin'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    // One stylesheet, about 14 KB compressed, inlined into each page. On a
    // phone that removes a whole round trip from the critical path, which is
    // worth more than caching it across pages on a site people read one or
    // two pages of.
    inlineStylesheets: 'always',
  },
});
