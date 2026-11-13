-- Add Spanish translation fields for articles whose source language is English.
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS title_es TEXT,
  ADD COLUMN IF NOT EXISTS summary_es TEXT,
  ADD COLUMN IF NOT EXISTS content_es TEXT;
