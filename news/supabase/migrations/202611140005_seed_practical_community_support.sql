-- Practical support organisations of interest to Dominican residents in London.
-- These organisations serve wider Latin American / migrant communities, not only Dominicans.
insert into public.directory_listings
(name,slug,category,listing_type,description,address,postcode,city,phone,email,website,opening_hours,services,sponsored,status,verified_at)
values
(
 'Latin American Women’s Rights Service (LAWRS)',
 'lawrs-apoyo-mujeres-migrantes-latinoamericanas',
 'Salud y bienestar','community',
 'Organización especializada en los derechos de las mujeres migrantes latinoamericanas. Ofrece apoyo confidencial en situaciones de violencia, explotación laboral, vivienda, prestaciones, derechos laborales y orientación legal. Servicio dirigido a mujeres latinoamericanas; no es un servicio general para todos los usuarios.',
 '52–54 Featherstone Street','EC1Y 8RT','London','020 7336 0888','info@lawrs.org.uk',
 'https://lawrs.org.uk/','Consultar los horarios y vías de acceso en la web',
 array['Apoyo a mujeres migrantes','Violencia de género','Derechos laborales','Vivienda y prestaciones','Orientación legal','Apoyo emocional'],
 false,'published','2026-11-13T00:00:00Z'
),
(
 'Latin American Disabled People’s Project (LADPP)',
 'ladpp-apoyo-discapacidad-comunidad-latinoamericana',
 'Salud y bienestar','community',
 'Organización comunitaria que apoya a personas latinoamericanas y de habla española o portuguesa con discapacidad, así como a sus familias y cuidadores. Ofrece orientación, defensa de derechos, apoyo sobre prestaciones y vivienda, inclusión digital y actividades comunitarias.',
 '102 Harper Road','SE1 6AQ','London','020 7793 8399','ladpp@ladpp.org.uk',
 'https://www.ladpp.org.uk/','Consultar horarios y cita antes de acudir',
 array['Apoyo a personas con discapacidad','Prestaciones y vivienda','Defensa de derechos','Inclusión digital','Apoyo a cuidadores','Actividades comunitarias'],
 false,'published','2026-11-13T00:00:00Z'
),
(
 'Praxis – Migrants and Refugees',
 'praxis-apoyo-migrantes-refugiados-londres',
 'Asesoría legal y migratoria','community',
 'Entidad de apoyo a personas migrantes y refugiadas en Londres. Ofrece asesoría gratuita de inmigración en determinados casos, especialmente asuntos relacionados con derechos humanos y personas con ingresos muy bajos o en situación de vulnerabilidad. La asistencia está sujeta a criterios de elegibilidad y capacidad; consulta previamente qué casos puede aceptar.',
 'Pott Street','E2 0EF','London','020 7729 7985','admin@praxis.org.uk',
 'https://www.praxis.org.uk/get-help','Asesoría telefónica publicada: miércoles, 14:00–17:00; confirmar cambios y criterios de acceso',
 array['Asesoría de inmigración','Apoyo a personas refugiadas','Orientación y grupos comunitarios','Apoyo a personas en situación de vulnerabilidad'],
 false,'published','2026-11-13T00:00:00Z'
),
(
 'Coalition of Latin Americans in the UK (CLAUK)',
 'clauk-coalicion-latinoamericanos-reino-unido',
 'Asociaciones','community',
 'Red de organizaciones e iniciativas lideradas por latinoamericanos en el Reino Unido. Trabaja en la defensa de derechos, participación comunitaria y visibilidad de las comunidades latinoamericanas. Puede servir como punto de conexión para localizar organizaciones y proyectos de apoyo.',
 'C/O IRMO, Unit 9, Warwick House, Overton Road','SW9 7JP','London',null,null,
 'https://clauk.org.uk/','Consultar actividades y contacto en la web',
 array['Red de organizaciones latinoamericanas','Participación comunitaria','Defensa de derechos','Información sobre recursos y proyectos'],
 false,'published','2026-11-13T00:00:00Z'
)
on conflict (slug) do update set
 name=excluded.name,category=excluded.category,listing_type=excluded.listing_type,
 description=excluded.description,address=excluded.address,postcode=excluded.postcode,
 city=excluded.city,phone=excluded.phone,email=excluded.email,website=excluded.website,
 opening_hours=excluded.opening_hours,services=excluded.services,sponsored=excluded.sponsored,
 status='published',verified_at=excluded.verified_at,updated_at=now();

-- Refresh Latin American House with current official access information.
update public.directory_listings set
 description='Centro comunitario y organización benéfica que apoya a personas latinoamericanas y otras comunidades migrantes. Su programa de orientación ofrece información y apoyo sobre prestaciones y acceso a servicios. Para asesoría migratoria especializada, puede orientar hacia entidades autorizadas; actualmente indica que no cuenta con asesores de inmigración autorizados propios.',
 address='10 Kingsgate Place',postcode='NW6 4TA',city='London',
 phone='020 7372 8653',email='info@casalatina.org.uk',
 website='https://www.latinamericanhouse.org.uk/advice',
 opening_hours='Atención presencial sin cita: lunes a jueves, 09:30–12:30; confirmar posibles cambios',
 services=array['Orientación sobre prestaciones','Apoyo comunitario','Acceso a servicios','Actividades culturales','Derivación a asesoría especializada'],
 verified_at='2026-11-13T00:00:00Z',updated_at=now()
where slug='latin-american-house-kilburn';
