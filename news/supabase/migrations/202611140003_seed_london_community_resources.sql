-- Verified community resources for Dominican residents in London.
-- IRMO and Latin American House serve the wider Latin American community;
-- they are explicitly described as such, not as Dominican-only organisations.
insert into public.directory_listings
(name,slug,category,listing_type,description,address,postcode,city,phone,email,website,opening_hours,services,sponsored,status,verified_at)
values
(
 'Dominican Parade UK CIC',
 'dominican-parade-uk-cic-wandsworth',
 'Comunidad y eventos','community',
 'Organización cultural y comunitaria dominicana con sede en Wandsworth. Trabaja para promover el patrimonio dominicano, la educación, la participación juvenil y la conexión comunitaria en el Reino Unido. Su desfile propuesto para el verano de 2027 continúa en fase de desarrollo y está sujeto a permisos, financiación y alianzas.',
 'Wandsworth','', 'London','', 'admin@dominicanparadeuk.com',
 'https://dominicanparadeuk.com/','Contacto por correo electrónico',
 array['Cultura dominicana','Participación comunitaria','Educación cultural','Voluntariado','Alianzas y eventos'],
 false,'published','2026-11-13T00:00:00Z'
),
(
 'IRMO – Indoamerican Refugee and Migrant Organisation',
 'irmo-apoyo-comunidad-latinoamericana-lambeth',
 'Asesoría legal y migratoria','community',
 'Organización comunitaria que apoya a personas migrantes latinoamericanas y otras personas hispanohablantes y lusoparlantes. Ofrece asesoramiento regulado en inmigración, apoyo en vivienda y prestaciones, acceso a salud, formación y empleo. Servicio para la comunidad latinoamericana en general; no es una entidad exclusiva de dominicanos.',
 'Unit 9, Warwick House, Overton Road','SW9 7JP','London',
 '020 7733 9977','info@irmo.org.uk','https://irmo.org.uk/es/','Lunes a viernes, 10:00–13:00 y 14:00–17:00. Línea telefónica: miércoles y viernes, 14:00–17:00',
 array['Asesoría de inmigración regulada por IAA','Vivienda y prestaciones','Acceso a salud','Clases de inglés','Formación y empleo','Atención en español y portugués'],
 false,'published','2026-11-13T00:00:00Z'
),
(
 'Latin American House',
 'latin-american-house-kilburn',
 'Asociaciones','community',
 'Centro comunitario y organización benéfica que trabaja con la comunidad latinoamericana de Londres desde 1983. Ofrece apoyo para la integración, inclusión social, bienestar y conexión comunitaria. Recurso abierto a personas latinoamericanas en general, incluidos residentes dominicanos.',
 '10 Kingsgate Place','NW6 4TA','London',
 '','info@casalatina.org.uk','https://www.casalatina.org.uk/','Consultar horarios actualizados en su web',
 array['Apoyo comunitario','Integración social','Bienestar','Actividades culturales','Orientación y derivación a servicios'],
 false,'published','2026-11-13T00:00:00Z'
)
on conflict (slug) do update set
 name=excluded.name,category=excluded.category,listing_type=excluded.listing_type,
 description=excluded.description,address=excluded.address,postcode=excluded.postcode,
 city=excluded.city,phone=excluded.phone,email=excluded.email,website=excluded.website,
 opening_hours=excluded.opening_hours,services=excluded.services,sponsored=excluded.sponsored,
 status='published',verified_at=excluded.verified_at,updated_at=now();
