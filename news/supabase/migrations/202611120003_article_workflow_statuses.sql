-- Evoford News: extend article workflow statuses.
-- Run this in the Supabase SQL Editor.

alter table public.articles
  drop constraint if exists articles_status_check;

alter table public.articles
  add constraint articles_status_check
  check (status in ('draft', 'pending', 'approved', 'published', 'rejected'));
