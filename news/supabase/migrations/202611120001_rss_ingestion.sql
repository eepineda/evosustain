-- Evoford News: extend the existing RSS tables without replacing existing data.
-- Run this migration in the Supabase SQL Editor before deploying the Edge Function.

alter table public.imported_items
  add column if not exists source_id text,
  add column if not exists feed_guid text,
  add column if not exists summary text,
  add column if not exists published_at timestamptz,
  add column if not exists imported_at timestamptz not null default now(),
  add column if not exists raw_payload jsonb;

create unique index if not exists imported_items_source_guid_uidx
  on public.imported_items (source_id, feed_guid)
  where source_id is not null and feed_guid is not null;

create index if not exists imported_items_status_created_idx
  on public.imported_items (status, created_at desc);

create index if not exists rss_sources_active_created_idx
  on public.rss_sources (active, created_at desc);

-- Keep imported material private to authenticated editorial users.
alter table public.imported_items enable row level security;

drop policy if exists "Editors can manage imported items" on public.imported_items;
create policy "Editors can manage imported items"
  on public.imported_items
  for all
  to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eepinedacarrasco@gmail.com')
  with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eepinedacarrasco@gmail.com');
