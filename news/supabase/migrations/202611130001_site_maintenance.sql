-- Evoford global maintenance mode.
-- Run once in Supabase SQL Editor. The public can read the switch;
-- only the authorised editorial account can change it.
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
insert into public.site_settings (key,value)
values ('maintenance','{"enabled":false}'::jsonb)
on conflict (key) do nothing;
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);
drop policy if exists "Authorised editor can update site settings" on public.site_settings;
create policy "Authorised editor can update site settings"
  on public.site_settings for update
  to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email','')) = 'eepinedacarrasco@gmail.com')
  with check (lower(coalesce(auth.jwt() ->> 'email','')) = 'eepinedacarrasco@gmail.com');
