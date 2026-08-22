-- Essential Flooring: schema pentru cabinetul de admin
-- Ruleaza tot fisierul in Supabase > SQL Editor > New query > Run.
-- Fisierul e idempotent: se poate rula de cate ori vrei.
--
-- IMPORTANT (schimbat 22.08.2026): accesul de admin NU mai inseamna "orice user
-- logat". Acum se verifica emailul in tabelul public.admin_emails. Motivul: site-ul
-- e static, deci /admin si bundle-ul lui sunt publice, iar RLS e singura bariera
-- reala. Fara lista de admini, un singur cont creat prin sign-up ar putea citi
-- toate datele clientilor.

-- 0) Lista de administratori ---------------------------------------------------
create table if not exists public.admin_emails (
  email text primary key,
  note text not null default ''
);

alter table public.admin_emails enable row level security;
-- Nimeni nu citeste tabelul din browser. Doar functia is_admin() il foloseste.
revoke all on public.admin_emails from anon, authenticated;

insert into public.admin_emails (email, note)
values ('essentialflooring16@gmail.com', 'client')
on conflict (email) do nothing;
-- Adauga si adresa ta daca vrei acces:
-- insert into public.admin_emails (email, note) values ('ark4su@gmail.com', 'artiom')
--   on conflict (email) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 1) Trafic website (analytics first-party, fara cookies) ----------------------
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  path text not null,
  referrer text,
  device text,
  session_id uuid
);

alter table public.page_views enable row level security;

-- Cheia anon e publica in bundle, deci oricine poate scrie aici. Limitam
-- fiecare camp ca sa nu se poata umfla baza de date cu text arbitrar.
drop policy if exists "anon insert page_views" on public.page_views;
create policy "anon insert page_views"
  on public.page_views for insert to anon
  with check (
    char_length(path) <= 200
    and (referrer is null or char_length(referrer) <= 200)
    and (device is null or device in ('mobile', 'tablet', 'desktop'))
  );

drop policy if exists "authenticated read page_views" on public.page_views;
drop policy if exists "admin read page_views" on public.page_views;
create policy "admin read page_views"
  on public.page_views for select to authenticated
  using (public.is_admin());

-- 2) Cereri de oferta din formular --------------------------------------------
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
    and (email is null or char_length(email) <= 160)
    and (city is null or char_length(city) <= 80)
    and (service is null or char_length(service) <= 80)
    and (message is null or char_length(message) <= 3000)
    and status = 'new'
  );

drop policy if exists "authenticated read leads" on public.leads;
drop policy if exists "admin read leads" on public.leads;
create policy "admin read leads"
  on public.leads for select to authenticated
  using (public.is_admin());

drop policy if exists "authenticated update leads" on public.leads;
drop policy if exists "admin update leads" on public.leads;
create policy "admin update leads"
  on public.leads for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Cabinetul schimba doar statusul unei cereri, niciodata datele clientului.
-- Privilegiile pe coloane fac imposibila rescrierea numelui sau a telefonului.
revoke update on public.leads from authenticated;
grant update (status) on public.leads to authenticated;

drop policy if exists "admin delete leads" on public.leads;
create policy "admin delete leads"
  on public.leads for delete to authenticated
  using (public.is_admin());

-- 3) Portofoliu administrat de client ------------------------------------------
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
drop policy if exists "admin manage portfolio" on public.portfolio_items;
create policy "admin manage portfolio"
  on public.portfolio_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 4) Bucket de storage pentru pozele din portofoliu (citire publica) -----------
-- Limitele de marime si tip sunt puse pe bucket, nu doar in interfata, fiindca
-- verificarea din browser se poate ocoli apeland direct API-ul de storage.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio', 'portfolio', true, 8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types,
      public = excluded.public;

drop policy if exists "public read portfolio bucket" on storage.objects;
create policy "public read portfolio bucket"
  on storage.objects for select to public
  using (bucket_id = 'portfolio');

drop policy if exists "authenticated write portfolio bucket" on storage.objects;
drop policy if exists "admin write portfolio bucket" on storage.objects;
create policy "admin write portfolio bucket"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio' and public.is_admin());

drop policy if exists "authenticated delete portfolio bucket" on storage.objects;
drop policy if exists "admin delete portfolio bucket" on storage.objects;
create policy "admin delete portfolio bucket"
  on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio' and public.is_admin());

-- 5) Indexuri utile pentru dashboard -------------------------------------------
create index if not exists page_views_created_at_idx on public.page_views (created_at);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists portfolio_created_at_idx on public.portfolio_items (created_at desc);

-- 6) Blog administrat din cabinet ----------------------------------------------
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
drop policy if exists "admin manage posts" on public.posts;
create policy "admin manage posts"
  on public.posts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create index if not exists posts_published_idx on public.posts (published, created_at desc);

-- 7) Setari private pentru admin (ex: deploy hook Vercel) ----------------------
create table if not exists public.app_settings (
  key text primary key,
  value text not null default ''
);

alter table public.app_settings enable row level security;

drop policy if exists "authenticated read settings" on public.app_settings;
drop policy if exists "admin read settings" on public.app_settings;
create policy "admin read settings"
  on public.app_settings for select to authenticated
  using (public.is_admin());

drop policy if exists "authenticated write settings" on public.app_settings;
drop policy if exists "admin write settings" on public.app_settings;
create policy "admin write settings"
  on public.app_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Deploy hook: e o credentiala, cine il are poate declansa build-uri la nesfarsit.
-- Constrangerea de mai jos face imposibila salvarea unui URL catre alt host.
alter table public.app_settings drop constraint if exists app_settings_deploy_hook_host;
alter table public.app_settings add constraint app_settings_deploy_hook_host
  check (
    key <> 'deploy_hook_url'
    or value = ''
    or value like 'https://api.vercel.com/v1/integrations/deploy/%'
  );

-- Dupa ce creezi Deploy Hook in Vercel (Settings > Git > Deploy Hooks), ruleaza:
-- insert into public.app_settings (key, value) values ('deploy_hook_url', 'https://api.vercel.com/v1/integrations/deploy/...')
--   on conflict (key) do update set value = excluded.value;

-- 8) Rate limiting pentru formularul de contact --------------------------------
-- Retine doar un hash al IP-ului (nu IP-ul in clar), ca sa putem opri un script
-- care trimite formularul in bucla. Randurile vechi se sterg singure.
create table if not exists public.contact_hits (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  ip_hash text not null
);

alter table public.contact_hits enable row level security;
-- Doar functia serverless (service role) scrie aici. Browserul nu are acces.
revoke all on public.contact_hits from anon, authenticated;

create index if not exists contact_hits_lookup_idx
  on public.contact_hits (ip_hash, created_at desc);

create or replace function public.prune_contact_hits()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.contact_hits where created_at < now() - interval '1 day';
$$;

-- 9) Verificare rapida dupa rulare ---------------------------------------------
-- Ar trebui sa returneze true doar pentru adresele din admin_emails:
--   select public.is_admin();
-- Lista politicilor active:
--   select tablename, policyname, roles, cmd from pg_policies where schemaname = 'public' order by tablename;
