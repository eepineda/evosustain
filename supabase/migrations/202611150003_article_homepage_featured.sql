alter table public.articles
  add column if not exists is_featured boolean not null default false;

-- Preserve the current homepage selection for articles already published.
update public.articles
set is_featured = true
where status = 'published' and is_featured = false;
