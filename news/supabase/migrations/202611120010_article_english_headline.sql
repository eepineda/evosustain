-- Add an English headline while keeping one canonical article record.
-- Run this migration in the Supabase SQL Editor before deploying the bilingual frontend.
alter table public.articles add column if not exists title_en text;
