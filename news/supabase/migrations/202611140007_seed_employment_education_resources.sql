-- Practical employment and education resources for Dominican residents in London.
-- Most are open to the wider migrant / London community, not Dominican-only.
insert into public.directory_listings
(name,slug,category,listing_type,description,address,postcode,city,phone,email,website,opening_hours,services,sponsored,status,verified_at)
values
(
 'IRMO – Empleo, formación y educación',
 'irmo-empleo-formacion-educacion-londres',
 'Empleo y formación','community',
 'Programa de apoyo laboral de IRMO para personas migrantes latinoamericanas. Ofrece orientación individual para preparar o adaptar el CV, buscar empleo, completar solicitudes y preparar entrevistas. Las sesiones pueden ser en español, portugués o inglés, en línea o presenciales. También organiza talleres sobre derechos laborales, contratos, nóminas y formación. El programa Build Your Future está dirigido a jóvenes de 16 a 24 años que cumplan criterios de residencia y elegibilidad.',
 'Unit 9, Warwick House, Overton Road','SW9 7JP','London','020 7733 9977','employment.support@irmo.org.uk',
 'https://irmo.org.uk/what-we-do/education-training-employment/employment-support/',
 'Consultar cita y disponibilidad con IRMO',
 array['Revisión y preparación de CV','Búsqueda de empleo','Solicitudes de trabajo','Preparación de entrevistas','Orientación en español, portugués e inglés','Talleres de derechos laborales y formación'],
 false,'published','2026-11-13T00:00:00Z'
),
(
 'Mayor of London – Cursos gratuitos y formación para adultos',
 'mayor-london-adult-learning-cursos',
 'Empleo y formación','community',
 'Buscador oficial de cursos para adultos en Londres. Permite localizar formación en inglés (ESOL), matemáticas, competencias digitales, alfabetización y habilidades profesionales en distintos distritos. Muchos cursos pueden ser gratuitos según ingresos, situación laboral, edad, residencia y otros criterios; confirma siempre la elegibilidad con el proveedor.',
 null,null,'London',null,null,
 'https://www.london.gov.uk/programmes-strategies/jobs-and-skills/adult-learning-london',
 'Buscador en línea; fechas y plazas dependen de cada centro',
 array['Cursos de inglés ESOL','Competencias digitales','Matemáticas y alfabetización','Formación profesional','Orientación para encontrar proveedores locales'],
 false,'published','2026-11-13T00:00:00Z'
),
(
 'City Lit – Universal Skills',
 'city-lit-universal-skills-londres',
 'Empleo y formación','community',
 'City Lit ofrece cursos de inglés ESOL, comunicación, matemáticas y competencias digitales que pueden ser gratuitos para personas que cumplan los requisitos de edad, residencia, nivel y situación económica. El programa Universal Skills ayuda a identificar un curso adecuado. Es necesario realizar una evaluación y confirmar las condiciones antes de matricularse.',
 'Keeley Street','WC2B 4BA','London','020 4582 0423','universal.skills@citylit.ac.uk',
 'https://help.citylit.ac.uk/hc/en-gb/articles/13701267686301-Free-ESOL-English-Communication-Maths-Digital-Skills-Course',
 'Contactar para evaluación y matrícula',
 array['Inglés ESOL','Comunicación','Matemáticas','Competencias digitales','Cursos para mejorar oportunidades laborales'],
 false,'published','2026-11-13T00:00:00Z'
),
(
 'Lambeth Council – Cursos de inglés ESOL',
 'lambeth-council-esol-cursos-ingles',
 'Empleo y formación','community',
 'Información del Ayuntamiento de Lambeth sobre cursos de inglés para hablantes de otros idiomas. Reúne proveedores locales, desde nivel principiante hasta nivel 2, muchos con opciones gratuitas. La oferta y los requisitos cambian; consulta directamente con cada centro para conocer plazas, fechas y elegibilidad.',
 null,null,'London',null,null,
 'https://www.lambeth.gov.uk/jobs-skills/english-speakers-other-languages-support-esol',
 'Consultar con cada proveedor',
 array['Inglés para adultos','Cursos ESOL desde nivel inicial','Mejora de lectura y escritura','Preparación para formación y empleo','Proveedores locales en Lambeth'],
 false,'published','2026-11-13T00:00:00Z'
)
on conflict (slug) do update set
 name=excluded.name,category=excluded.category,listing_type=excluded.listing_type,
 description=excluded.description,address=excluded.address,postcode=excluded.postcode,
 city=excluded.city,phone=excluded.phone,email=excluded.email,website=excluded.website,
 opening_hours=excluded.opening_hours,services=excluded.services,sponsored=excluded.sponsored,
 status='published',verified_at=excluded.verified_at,updated_at=now();
