-- Evoford News: Dominican community directory, London
create table if not exists public.directory_listings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null,
  listing_type text not null default 'community' check (listing_type in ('community','business')),
  description text not null default '',
  address text,
  postcode text,
  city text not null default 'London',
  phone text,
  email text,
  website text,
  opening_hours text,
  services text[] not null default '{}',
  image_url text,
  sponsored boolean not null default false,
  status text not null default 'draft' check (status in ('draft','pending','published','rejected')),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists directory_listings_public_idx on public.directory_listings(status, category, name);
alter table public.directory_listings enable row level security;
drop policy if exists "Public can read published directory listings" on public.directory_listings;
create policy "Public can read published directory listings" on public.directory_listings for select to anon, authenticated using (status='published');
drop policy if exists "Admin manages directory listings" on public.directory_listings;
create policy "Admin manages directory listings" on public.directory_listings for all to authenticated
using (lower(coalesce(auth.jwt()->>'email',''))='eepinedacarrasco@gmail.com')
with check (lower(coalesce(auth.jwt()->>'email',''))='eepinedacarrasco@gmail.com');
grant select on public.directory_listings to anon, authenticated;
grant insert, update, delete on public.directory_listings to authenticated;

create table if not exists public.directory_submissions (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null,
  contact_email text not null,
  listing_name text not null,
  category text not null,
  listing_type text not null default 'community' check (listing_type in ('community','business')),
  description text not null,
  address text,
  postcode text,
  phone text,
  website text,
  status text not null default 'received' check (status in ('received','converted','rejected')),
  listing_id uuid references public.directory_listings(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.directory_submissions enable row level security;
drop policy if exists "Anyone can submit directory listing" on public.directory_submissions;
create policy "Anyone can submit directory listing" on public.directory_submissions for insert to anon, authenticated with check (true);
drop policy if exists "Admin manages directory submissions" on public.directory_submissions;
create policy "Admin manages directory submissions" on public.directory_submissions for all to authenticated
using (lower(coalesce(auth.jwt()->>'email',''))='eepinedacarrasco@gmail.com')
with check (lower(coalesce(auth.jwt()->>'email',''))='eepinedacarrasco@gmail.com');
grant insert on public.directory_submissions to anon, authenticated;
grant select, update, delete on public.directory_submissions to authenticated;
