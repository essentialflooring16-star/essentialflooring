# Essential Flooring, essentialflooringinc.com

Website multi-pagina pentru Essential Flooring (contractor de pardoseli, Sacramento CA)
cu cabinet de admin pentru client.

- **Stack:** Astro 5 (static) + React islands + Tailwind CSS v4
- **Admin:** `/admin`, Supabase (auth, trafic, portofoliu, cereri)
- **Formular:** `api/contact.ts` (Vercel function + Resend) + backup in Supabase
- **Setup complet:** vezi [docs/SETUP-RO.md](docs/SETUP-RO.md)
- **Schimbarea direcției de design:** vezi [docs/DESIGN.md](docs/DESIGN.md)

```bash
npm install
npm run dev
npm run build
```
