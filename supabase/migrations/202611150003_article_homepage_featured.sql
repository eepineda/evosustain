alter table public.articles
  add column if not exists is_featured boolean not null default false;

-- Preserve exactly the two current lead stories before switching to manual selection.
with current_frontpage as (
  select id
  from public.articles
  where status = 'published'
    and coalesce(category, '') not ilike '%opinion%'
  order by updated_at desc nulls last, created_at desc
  limit 2
)
update public.articles
set is_featured = (id in (select id from current_frontpage))
where status = 'published';
