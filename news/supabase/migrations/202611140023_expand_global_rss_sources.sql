-- Evoford News: expand international monitoring sources.
-- Run after the RSS ingestion migration. Existing sources are preserved.
insert into public.rss_sources (name, feed_url, category, active)
select v.name, v.feed_url, v.category, true
from (values
  ('Reuters · World News', 'https://www.reuters.com/world/rss', 'Internacional'),
  ('Associated Press · World', 'https://apnews.com/hub/world-news?output=rss', 'Internacional'),
  ('Agence France-Presse · English', 'https://www.afp.com/en/rss', 'Internacional'),
  ('Deutsche Welle · Top Stories', 'https://rss.dw.com/rdf/rss-en-all', 'General'),
  ('France 24 · International', 'https://www.france24.com/en/rss', 'Internacional'),
  ('Euronews · World', 'https://www.euronews.com/rss?level=theme&name=news', 'Internacional'),
  ('Al Jazeera · All News', 'https://www.aljazeera.com/xml/rss/all.xml', 'Internacional'),
  ('NPR · News', 'https://feeds.npr.org/1001/rss.xml', 'General'),
  ('NHK World · News', 'https://www3.nhk.or.jp/nhkworld/en/news/feeds/', 'Internacional'),
  ('Channel NewsAsia · World', 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6511', 'Internacional'),
  ('EFE · Mundo', 'https://efe.com/feed/', 'Internacional'),
  ('The Guardian · UK', 'https://www.theguardian.com/uk-news/rss', 'Internacional'),
  ('The Guardian · Business', 'https://www.theguardian.com/business/rss', 'Economía'),
  ('BBC News · UK', 'https://feeds.bbci.co.uk/news/uk/rss.xml', 'Internacional'),
  ('BBC News · Business', 'https://feeds.bbci.co.uk/news/business/rss.xml', 'Economía'),
  ('BBC News · Science & Environment', 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', 'Clima'),
  ('EL PAÍS · Internacional', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/internacional/portada', 'Internacional'),
  ('EL PAÍS · Economía', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia/portada', 'Economía'),
  ('EL PAÍS · América', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/america/portada', 'Internacional'),
  ('DW · Español', 'https://rss.dw.com/xml/rss-es-all', 'General'),
  ('France 24 · Español', 'https://www.france24.com/es/rss', 'Internacional'),
  ('NPR · World', 'https://feeds.npr.org/1004/rss.xml', 'Internacional')
) as v(name, feed_url, category)
where not exists (select 1 from public.rss_sources s where s.feed_url = v.feed_url);
