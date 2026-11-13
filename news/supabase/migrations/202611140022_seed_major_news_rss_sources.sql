-- Seed trusted RSS feeds for Guardian, BBC News and EL PAÍS.
-- Run in Supabase SQL Editor. Existing sources and imported items are preserved.

insert into public.rss_sources (name, feed_url, category, active)
select v.name, v.feed_url, v.category, true
from (values
  ('The Guardian · World', 'https://www.theguardian.com/world/rss', 'Internacional'),
  ('The Guardian · Technology', 'https://www.theguardian.com/technology/rss', 'Tecnología'),
  ('BBC News · Top Stories', 'https://feeds.bbci.co.uk/news/rss.xml', 'General'),
  ('BBC News · World', 'https://feeds.bbci.co.uk/news/world/rss.xml', 'Internacional'),
  ('BBC News · Technology', 'https://feeds.bbci.co.uk/news/technology/rss.xml', 'Tecnología'),
  ('EL PAÍS · Portada', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada', 'General')
) as v(name, feed_url, category)
where not exists (
  select 1 from public.rss_sources s where s.feed_url = v.feed_url
);
