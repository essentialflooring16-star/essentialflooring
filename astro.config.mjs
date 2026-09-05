import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://essentialflooringinc.com',
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/privacy-policy'),
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
