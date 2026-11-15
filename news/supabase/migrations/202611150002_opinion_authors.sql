-- Public author profiles for the Opinion section; admin-only management.
create table if not exists public.opinion_authors (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  profession text,
  bio text check (bio is null or char_length(bio) <= 500),
  photo_url text,
  display_order integer not null default 100 check (display_order between 0 and 999),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists opinion_authors_public_order_idx
  on public.opinion_authors (display_order, name) where active = true;
alter table public.opinion_authors enable row level security;
grant select on public.opinion_authors to anon, authenticated;
grant insert, update, delete on public.opinion_authors to authenticated;
drop policy if exists "Public can read active opinion authors" on public.opinion_authors;
create policy "Public can read active opinion authors"
  on public.opinion_authors for select to anon, authenticated
  using (active = true);
drop policy if exists "Evoford admin can manage opinion authors" on public.opinion_authors;
create policy "Evoford admin can manage opinion authors"
  on public.opinion_authors for all to authenticated
  using ((select auth.jwt()->>'email') = 'eepinedacarrasco@gmail.com')
  with check ((select auth.jwt()->>'email') = 'eepinedacarrasco@gmail.com');
