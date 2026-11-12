-- Evoford News: editorial classification and bilingual article fields.
alter table public.imported_items
  add column if not exists country text,
  add column if not exists region text,
  add column if not exists suggested_category text,
  add column if not exists source_language text,
  add column if not exists classification_confidence numeric(4,3),
  add column if not exists editorial_status text not null default 'unprocessed';

alter table public.articles
  add column if not exists country text,
  add column if not exists region text,
  add column if not exists language text not null default 'es',
  add column if not exists summary_en text,
  add column if not exists content_en text,
  add column if not exists source_url text,
  add column if not exists source_title text;

create index if not exists imported_items_editorial_status_idx
  on public.imported_items (editorial_status, created_at desc);
