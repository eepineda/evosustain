-- Completa fichas diplomáticas con datos publicados en webs oficiales.
-- Mantiene las fichas de países pendientes de verificación sin inventar contactos.
-- Ejecutar en Supabase SQL Editor.

update public.directory_listings set
 name='Embajada de España en Londres',
 description='Representación diplomática de España en el Reino Unido. Información sobre relaciones bilaterales, atención institucional y servicios de la Embajada. Para trámites de ciudadanos españoles, contactar con el Consulado General.',
 address='39 Chesham Place, London SW1X 8SB',
 phone='+44 20 7235 5555',
 email='emb.londres@maec.es',
 website='https://www.exteriores.gob.es/Embajadas/londres/es/Paginas/index.aspx',
 opening_hours='Lunes a viernes, 09:00–16:30. Confirmar atención antes de acudir.',
 updated_at=now(), verified_at=now()
where slug='embajada-consulado-espana';

insert into public.directory_listings
 (name,slug,category,listing_type,description,city,address,phone,email,website,opening_hours,status,sponsored,verified_at,updated_at)
values
 ('Consulado General de España en Londres','consulado-general-espana-londres','Embajadas y consulados','community','Trámites consulares para ciudadanos españoles y otros servicios: pasaportes, registro civil, nacionalidad, legalizaciones, notaría, asistencia consular y visados. La mayoría de gestiones presenciales requieren cita previa.','London','20 Draycott Place, London SW3 2RZ','+44 20 7589 8989','cog.londres@maec.es','https://www.exteriores.gob.es/Consulados/londres/es/Paginas/index.aspx','Lunes a viernes, 08:15–14:30. Atención presencial con cita previa.', 'published',false,now(),now()),
 ('Consulado de Colombia en Londres','consulado-colombia-londres','Embajadas y consulados','community','Servicios consulares de Colombia en Londres. Consultar en la web oficial los trámites, requisitos y citas disponibles.','London','35 Portland Place, London W1B 1AE','+44 20 7637 9893','clondres@cancilleria.gov.co','https://londres.consulado.gov.co/','Consultar horarios y cita previa en la web oficial.','published',false,now(),now()),
 ('Consulado General del Perú en Londres','consulado-peru-londres','Embajadas y consulados','community','Atención consular peruana en Londres: DNI, pasaportes, poderes, registros y otros trámites. La atención es con cita previa; confirmar sede y disponibilidad antes de acudir.','London','150 Brompton Road, London SW3 1HX','+44 7783 656552','consulperu-londres@rree.gob.pe','https://www.gob.pe/consulado-del-peru-en-londres','Lunes a viernes, 09:30–17:30. Confirmar cita previa.','published',false,now(),now()),
 ('Consulado General de Argentina en Londres','consulado-argentina-londres','Embajadas y consulados','community','Servicios consulares argentinos en Londres. Consultar la web oficial para trámites, circunscripción, requisitos y citas.','London','27 Three Kings Yard, London W1K 4DF','+44 20 7318 1340','clond@mrecic.gov.ar','https://clond.cancilleria.gob.ar/','Consultar horarios y cita previa en la web oficial.','published',false,now(),now())
on conflict (slug) do update set
 name=excluded.name,description=excluded.description,address=excluded.address,
 phone=excluded.phone,email=excluded.email,website=excluded.website,
 opening_hours=excluded.opening_hours,status='published',verified_at=now(),updated_at=now();

update public.directory_listings set
 description='Embajada de la República Dominicana en el Reino Unido. Ofrece servicios consulares, información sobre visados, pasaportes, certificaciones y asistencia a ciudadanos dominicanos. Consultar citas y requisitos en su web oficial.',
 address='81 Cromwell Road, 2nd Floor, South Kensington, London SW7 5BW',
 phone='+44 20 7262 6856',
 email='consulate@dominicanembassy.org.uk',
 website='https://dominicanembassy.org.uk/',
 opening_hours='Lunes a viernes, 09:00–17:00. Confirmar citas y atención.',
 updated_at=now(),verified_at=now()
where slug='embajada-consulado-republica-dominicana';

update public.directory_listings set
 description='Embajada de México en el Reino Unido y Sección Consular en Londres. Información sobre documentación, servicios consulares y citas. La atención al público de la Sección Consular se realiza de lunes a viernes por la mañana; se recomienda contactar por correo antes de acudir.',
 address='16A St. George Street, London W1S 1FD',
 phone='+44 20 7499 8586',
 email='consulMexGbr@sre.gob.mx',
 website='https://consulmex.sre.gob.mx/reinounido/',
 opening_hours='Sección Consular: lunes a viernes, 09:00–13:00. Confirmar cita.',
 updated_at=now(),verified_at=now()
where slug='embajada-consulado-mexico';

update public.directory_listings set
 description='Embajada de Colombia en el Reino Unido. La Embajada y el Consulado de Colombia en Londres tienen sedes y contactos diferentes. Esta ficha corresponde a la Embajada; para trámites consulares, consultar la ficha separada del Consulado.',
 address='3 Hans Crescent, London SW1X 0LN',
 phone='+44 20 7589 9177',
 email='ereinounido@cancilleria.gov.co',
 website='https://reinounido.embajada.gov.co/',
 opening_hours='Lunes a viernes, 09:00–18:00. Confirmar atención.',
 updated_at=now(),verified_at=now()
where slug='embajada-consulado-colombia';

update public.directory_listings set
 description='Embajada del Ecuador en el Reino Unido. Para trámites consulares, consultar también la ficha del Consulado General del Ecuador en Londres.',
 address='Flat 3B, 3 Hans Crescent, London SW1X 0LS',
 phone='+44 20 7584 1367',
 email='eecugbr@cancilleria.gob.ec',
 website='https://www.cancilleria.gob.ec/reinounido/',
 opening_hours='Consultar horario y cita previa en la web oficial.',
 updated_at=now(),verified_at=now()
where slug='embajada-consulado-ecuador';

update public.directory_listings set
 description='Embajada del Perú en el Reino Unido. La sede de la Embajada está en proceso de traslado y ha comunicado atención a distancia hasta nuevo aviso. Los trámites consulares se atienden temporalmente en la sede indicada por el Consulado General. Consultar siempre la información oficial antes de desplazarse.',
 address='Sede de Embajada en proceso de mudanza; consultar web oficial. Atención consular temporal: 21 Knightsbridge, London SW1X 7LY, oficina 15, quinto piso.',
 phone='+44 20 7235 3802',
 email='postmaster@peruembassy-uk.com',
 website='https://www.gob.pe/embajada-del-peru-en-reino-unido',
 opening_hours='Atención consular temporal exclusivamente con cita previa. Confirmar sede.',
 updated_at=now(),verified_at=now()
where slug='embajada-consulado-peru';

update public.directory_listings set
 description='Embajada de Argentina en el Reino Unido. Para trámites y documentación de ciudadanos argentinos, consultar también la ficha del Consulado General de Argentina en Londres.',
 address='65 Brook Street, London W1K 4AH',
 phone='+44 20 7318 1300',
 email='eruni@mrecic.gov.ar',
 website='https://eruni.cancilleria.gob.ar/',
 opening_hours='Lunes a viernes, 09:00–17:00. Confirmar atención.',
 updated_at=now(),verified_at=now()
where slug='embajada-consulado-argentina';

update public.directory_listings set
 description='Embajada de Guatemala en el Reino Unido. La sección consular atiende asuntos de ciudadanos guatemaltecos en el Reino Unido e Irlanda. Consultar la web oficial para datos de contacto, trámites y citas.',
 address='105A Westbourne Grove, London W2 4UW',
 phone='+44 20 7221 7448',
 email='embagbru@minex.gob.gt',
 website='https://www.minex.gob.gt/',
 opening_hours='Consultar horario y cita previa en la web oficial.',
 updated_at=now(),verified_at=now()
where slug='embajada-consulado-guatemala';

update public.directory_listings set
 description='Embajada de Costa Rica y Oficina Consular en el Reino Unido. Atención consular en Londres para trámites y servicios a ciudadanos costarricenses. Consultar la web oficial para requisitos y citas.',
 address='23 Woodstock Street, Mayfair, London W1C 2AS',
 phone='+44 20 7629 3111',
 website='https://www.rree.go.cr/',
 opening_hours='Oficina: lunes a viernes, 09:30–17:30. Atención al público: 10:30–17:00.',
 updated_at=now(),verified_at=now()
where slug='embajada-consulado-costa-rica';

update public.directory_listings set
 description='Embajada de Paraguay en el Reino Unido. Consultar la web oficial para información de servicios consulares, documentación, requisitos y citas.',
 address='81–83 Cromwell Road, London SW7 5BW',
 phone='+44 20 7610 4180',
 email='embaparuk@paraguayembassy.co.uk',
 website='https://www.mre.gov.py/embapar-reino-unido/',
 opening_hours='Lunes a viernes, 09:00–17:00. Confirmar atención.',
 updated_at=now(),verified_at=now()
where slug='embajada-consulado-paraguay';

update public.directory_listings set
 description='Consulado General de Chile en Londres. Servicios consulares para ciudadanos chilenos en el Reino Unido y territorios de su circunscripción. Consultar trámites y requisitos en la web oficial.',
 address='37–41 Old Queen Street, London SW1H 9JA',
 phone='+44 20 7222 2361',
 email='londres@consulado.gob.cl',
 website='https://www.chile.gob.cl/londres/',
 opening_hours='Consultar horario y cita previa en la web oficial.',
 updated_at=now(),verified_at=now()
where slug='embajada-consulado-chile';

update public.directory_listings set
 description='Consulado General del Ecuador en Londres. Ofrece trámites consulares, citas, servicios de registro civil, poderes notariales y otros servicios para ecuatorianos en el Reino Unido.',
 address='9 John Sessions Square, Buckle Street, London E1 8NQ',
 phone='+44 20 3905 2150',
 email='ceculondres@cancilleria.gob.ec',
 website='https://www.cancilleria.gob.ec/londres/',
 opening_hours='Consultar horario y cita previa en la web oficial.',
 updated_at=now(),verified_at=now()
where slug='embajada-consulado-ecuador';
