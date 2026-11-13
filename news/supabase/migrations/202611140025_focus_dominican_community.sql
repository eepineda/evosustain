-- Editorial focus: London, Spain and the Dominican Republic.
-- Keep the ingestion and directory logic unchanged; only curate existing records.
-- Preserve Spanish-language feeds and a small selection of international coverage.

update public.rss_sources
set active = false
where name in (
  'The Guardian · Technology',
  'The Guardian · Business',
  'BBC News · Technology',
  'BBC News · Business',
  'BBC News · Science & Environment',
  'Agence France-Presse · English',
  'Euronews · World',
  'Al Jazeera · All News',
  'NPR · News',
  'NPR · World',
  'NHK World · News',
  'Channel NewsAsia · World',
  'DW · Top Stories',
  'France 24 · International'
);

-- Keep the core mix: UK/London, Spain/DR-facing Spanish editions,
-- and a limited world-news layer for major events.
update public.rss_sources
set active = true
where name in (
  'The Guardian · World',
  'The Guardian · UK',
  'BBC News · Top Stories',
  'BBC News · UK',
  'BBC News · World',
  'Reuters · World News',
  'Associated Press · World',
  'EL PAÍS · Portada',
  'EL PAÍS · Internacional',
  'EL PAÍS · Economía',
  'EL PAÍS · América',
  'DW · Español',
  'France 24 · Español',
  'EFE · Mundo'
);

-- The directory is focused on the Dominican community and its principal
-- London/Spain/DR connections. Keep the Dominican and Spanish consular records;
-- hide the broad country-by-country embassy catalogue from other countries.
update public.directory_listings
set status = 'draft', updated_at = now()
where slug in (
  'embajada-consulado-mexico',
  'embajada-consulado-guatemala',
  'embajada-consulado-honduras',
  'embajada-consulado-el-salvador',
  'embajada-consulado-nicaragua',
  'embajada-consulado-costa-rica',
  'embajada-consulado-panama',
  'embajada-consulado-colombia',
  'embajada-consulado-venezuela',
  'embajada-consulado-ecuador',
  'embajada-consulado-peru',
  'embajada-consulado-bolivia',
  'embajada-consulado-chile',
  'embajada-consulado-argentina',
  'embajada-consulado-uruguay',
  'embajada-consulado-paraguay',
  'embajada-consulado-cuba'
);
