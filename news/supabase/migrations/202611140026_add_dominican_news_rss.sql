-- Add one focused Dominican Republic news source.
-- Diario Libre publishes official RSS feeds by section; use its Spanish front page only.
insert into public.rss_sources (name, feed_url, category, active)
select
  'Diario Libre · República Dominicana',
  'https://www.diariolibre.com/rss/portada.xml',
  'Internacional',
  true
where not exists (
  select 1 from public.rss_sources
  where feed_url = 'https://www.diariolibre.com/rss/portada.xml'
);
