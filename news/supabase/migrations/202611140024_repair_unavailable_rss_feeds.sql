-- Repair RSS endpoints that reject direct automated requests.
-- Reuters and AP no longer provide dependable public RSS endpoints.
-- Google News search feeds preserve links to the original publisher articles.
-- AFP is routed through the same publisher-domain search as a temporary fallback.
-- NHK switches to its currently active English news RSS/podcast feed.
-- EFE is intentionally unchanged pending a fresh retry of its HTTP 500 response.

update public.rss_sources
set feed_url = 'https://news.google.com/rss/search?q=when:24h+site:reuters.com/world&ceid=GB:en&hl=en-GB&gl=GB'
where name = 'Reuters · World News';

update public.rss_sources
set feed_url = 'https://news.google.com/rss/search?q=when:24h+site:apnews.com&ceid=GB:en&hl=en-GB&gl=GB'
where name = 'Associated Press · World';

update public.rss_sources
set feed_url = 'https://news.google.com/rss/search?q=when:24h+site:afp.com&ceid=GB:en&hl=en-GB&gl=GB'
where name = 'Agence France-Presse · English';

update public.rss_sources
set feed_url = 'https://www3.nhk.or.jp/rj/podcast/rss/english.xml'
where name = 'NHK World · News';
