-- Initial verified public listing: Dominican Embassy / Consular Section in London.
insert into public.directory_listings
(name,slug,category,listing_type,description,address,postcode,city,phone,email,website,opening_hours,services,sponsored,status,verified_at)
values
('Embajada de la República Dominicana en el Reino Unido – Sección Consular',
 'embajada-republica-dominicana-reino-unido-londres',
 'Embajadas y consulados','community',
 'Representación oficial de la República Dominicana en el Reino Unido. La Sección Consular ofrece servicios de pasaportes, visados, legalizaciones, certificaciones, registro civil, poderes notariales y otros trámites consulares. Comprueba los requisitos y solicita cita a través de los canales oficiales.',
 '81 Cromwell Road, London','SW7 5BW','London',
 '+44 20 7262 6856','embadomgranbretana@mirex.gob.do',
 'https://gbr.mirex.gob.do/','Lunes a viernes: 09:30–16:30',
 array['Pasaportes','Visados','Legalizaciones','Certificaciones','Registro civil','Poderes notariales'],
 false,'published','2026-11-13T00:00:00Z')
on conflict (slug) do update set
 name=excluded.name,category=excluded.category,description=excluded.description,
 address=excluded.address,postcode=excluded.postcode,city=excluded.city,
 phone=excluded.phone,email=excluded.email,website=excluded.website,
 opening_hours=excluded.opening_hours,services=excluded.services,
 status='published',verified_at=excluded.verified_at,updated_at=now();
