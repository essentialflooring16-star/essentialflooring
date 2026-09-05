// Supabase simulat, doar pentru a privi cabinetul cu ochii clientului.
//
// Autentificarea si tabelele raspund cu date plauzibile, ca sa se poata deschide
// fiecare tab fara un proiect real. Nu inlocuieste nimic din verificarile
// automate: e o oglinda pentru inspectie vizuala.
import { createServer } from 'node:http';

const PORT = Number(process.env.PORT || 5599);
const now = new Date().toISOString();

const USER = { id: '00000000-0000-4000-8000-000000000001', email: 'client@example.com', role: 'authenticated' };
const SESSION = {
  access_token: 'fake.jwt.token', token_type: 'bearer', expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'fake-refresh', user: USER,
};

const TABLES = {
  site_content: [],
  app_settings: [{ key: 'deploy_hook_url', value: '' }],
  leads: [
    { id: 1, created_at: now, name: 'Maria Popescu', email: 'maria@example.com', phone: '(916) 555-0142',
      city: 'Roseville', service: 'Hardwood refinishing', message: 'Two bedrooms and a hallway, oak floors under the carpet.', status: 'new' },
  ],
  reviews: [
    { id: 1, created_at: now, author: 'John D.', rating: 5, text: 'Great work on our stairs.', city: 'Folsom',
      review_date: '2026-08-01', source: 'google', published: true, sort_order: 1 },
  ],
  posts: [], portfolio_items: [], page_views: [], web_vitals: [],
};

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-headers', '*');
  res.setHeader('access-control-allow-methods', '*');
  res.setHeader('access-control-expose-headers', 'content-range');
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
  res.setHeader('content-type', 'application/json');

  if (url.pathname.startsWith('/auth/v1/token')) return res.end(JSON.stringify(SESSION));
  if (url.pathname.startsWith('/auth/v1/user')) return res.end(JSON.stringify(USER));
  if (url.pathname.startsWith('/auth/v1/logout')) { res.statusCode = 204; return res.end(); }

  const table = url.pathname.replace('/rest/v1/', '').split('?')[0];
  if (url.pathname.startsWith('/rest/v1/')) {
    const rows = TABLES[table] ?? [];
    res.setHeader('content-range', `0-${Math.max(0, rows.length - 1)}/${rows.length}`);
    // .maybeSingle() cere un singur obiect, nu un tablou
    const single = (req.headers.accept || '').includes('vnd.pgrst.object');
    return res.end(JSON.stringify(single ? rows[0] ?? null : rows));
  }
  res.end('[]');
});

server.listen(PORT, () => console.log(`Supabase simulat pe http://127.0.0.1:${PORT}`));
