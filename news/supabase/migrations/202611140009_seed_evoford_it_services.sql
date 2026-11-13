-- Add EvoSustain / Evoford's own professional IT services listing.
-- The public website identifies the business as UK-based and lists its IT/software services.
insert into public.directory_listings
(name,slug,category,listing_type,description,address,postcode,city,phone,email,website,opening_hours,services,sponsored,status,verified_at)
values
(
 'EvoSustain – Evoford | Servicios IT y desarrollo de software',
 'evosustain-evoford-servicios-it-software',
 'Servicios profesionales','business',
 'Empresa tecnológica con sede en el Reino Unido que desarrolla soluciones digitales y ofrece servicios profesionales de tecnología. Su área IT & Software incluye desarrollo de software a medida, aplicaciones, APIs e integraciones, paneles de control, automatización de procesos, soporte IT y consultoría tecnológica. También desarrolla una plataforma digital para la gestión de residuos y operaciones logísticas. Atiende consultas de proyectos y servicios en Londres y otras zonas del Reino Unido.',
 null,null,'London','+44 7871 710697','info@evoford.com',
 'https://evoford.com/index.html#it',
 'Contactar para consultas y propuestas',
 array['Desarrollo de software a medida','Aplicaciones, APIs e integraciones','Dashboards y automatización de procesos','Soporte IT de primer y segundo nivel','Gestión de incidencias y monitorización','Consultoría tecnológica y arquitectura IT','Soluciones digitales para residuos y logística'],
 false,'published','2026-11-13T00:00:00Z'
)
on conflict (slug) do update set
 name=excluded.name,category=excluded.category,listing_type=excluded.listing_type,
 description=excluded.description,address=excluded.address,postcode=excluded.postcode,
 city=excluded.city,phone=excluded.phone,email=excluded.email,website=excluded.website,
 opening_hours=excluded.opening_hours,services=excluded.services,sponsored=excluded.sponsored,
 status='published',verified_at=excluded.verified_at,updated_at=now();
