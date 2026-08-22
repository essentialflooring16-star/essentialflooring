-- Essential Flooring: schema pentru cabinetul de admin
-- Ruleaza tot fisierul in Supabase > SQL Editor > New query > Run.

-- 1) Trafic website (analytics first-party, fara cookies)
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  path text not null,
  referrer text,
  device text,
  session_id uuid
);

alter table public.page_views enable row level security;

drop policy if exists "anon insert page_views" on public.page_views;
create policy "anon insert page_views"
  on public.page_views for insert to anon
  with check (char_length(path) <= 200);

drop policy if exists "authenticated read page_views" on public.page_views;
create policy "authenticated read page_views"
  on public.page_views for select to authenticated
  using (true);

-- 2) Cereri de oferta din formular
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text,
  city text,
  service text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed'))
);

alter table public.leads enable row level security;

drop policy if exists "anon insert leads" on public.leads;
create policy "anon insert leads"
  on public.leads for insert to anon
  with check (
    char_length(name) between 1 and 120
    and char_length(phone) between 5 and 40
    and (message is null or char_length(message) <= 3000)
  );

drop policy if exists "authenticated read leads" on public.leads;
create policy "authenticated read leads"
  on public.leads for select to authenticated
  using (true);

drop policy if exists "authenticated update leads" on public.leads;
create policy "authenticated update leads"
  on public.leads for update to authenticated
  using (true) with check (true);

-- 3) Portofoliu administrat de client
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  image_url text not null,
  caption text not null default '',
  alt text not null default '',
  category text not null default 'other',
  published boolean not null default true
);

alter table public.portfolio_items enable row level security;

drop policy if exists "public read published portfolio" on public.portfolio_items;
create policy "public read published portfolio"
  on public.portfolio_items for select to anon
  using (published = true);

drop policy if exists "authenticated manage portfolio" on public.portfolio_items;
create policy "authenticated manage portfolio"
  on public.portfolio_items for all to authenticated
  using (true) with check (true);

-- 4) Bucket de storage pentru pozele din portofoliu (citire publica)
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

drop policy if exists "public read portfolio bucket" on storage.objects;
create policy "public read portfolio bucket"
  on storage.objects for select to public
  using (bucket_id = 'portfolio');

drop policy if exists "authenticated write portfolio bucket" on storage.objects;
create policy "authenticated write portfolio bucket"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio');

drop policy if exists "authenticated delete portfolio bucket" on storage.objects;
create policy "authenticated delete portfolio bucket"
  on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio');

-- 5) Indexuri utile pentru dashboard
create index if not exists page_views_created_at_idx on public.page_views (created_at);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists portfolio_created_at_idx on public.portfolio_items (created_at desc);

-- 6) Blog administrat din cabinet
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content text not null default '',
  cover_url text,
  published boolean not null default false
);

alter table public.posts enable row level security;

drop policy if exists "anon read published posts" on public.posts;
create policy "anon read published posts"
  on public.posts for select to anon
  using (published = true);

drop policy if exists "authenticated manage posts" on public.posts;
create policy "authenticated manage posts"
  on public.posts for all to authenticated
  using (true) with check (true);

create index if not exists posts_published_idx on public.posts (published, created_at desc);

-- 7) Setari private pentru admin (ex: deploy hook Vercel pentru republicarea blogului)
create table if not exists public.app_settings (
  key text primary key,
  value text not null default ''
);

alter table public.app_settings enable row level security;

drop policy if exists "authenticated read settings" on public.app_settings;
create policy "authenticated read settings"
  on public.app_settings for select to authenticated
  using (true);

drop policy if exists "authenticated write settings" on public.app_settings;
create policy "authenticated write settings"
  on public.app_settings for all to authenticated
  using (true) with check (true);

-- Dupa ce creezi Deploy Hook in Vercel (Settings > Git > Deploy Hooks), ruleaza:
-- insert into public.app_settings (key, value) values ('deploy_hook_url', 'https://api.vercel.com/v1/integrations/deploy/...')
--   on conflict (key) do update set value = excluded.value;
