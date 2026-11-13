-- Corrige la separación de las sedes diplomáticas y evita mostrar correos no confirmados.
-- Ejecutar en Supabase SQL Editor después de la migración 019.

update public.directory_listings
set email=null, updated_at=now()
where slug in ('embajada-consulado-mexico','embajada-consulado-colombia');

update public.directory_listings
set
 name='Embajada del Ecuador en el Reino Unido',
 description='Representación diplomática del Ecuador en el Reino Unido. Para trámites y servicios consulares, consultar la ficha separada del Consulado General del Ecuador en Londres.',
 address='Flat 3B, 3 Hans Crescent, London SW1X 0LS',
 phone='+44 20 7584 1367',
 email='eecugbr@cancilleria.gob.ec',
 website='https://www.cancilleria.gob.ec/reinounido/',
 opening_hours='Consultar horario y cita previa en la web oficial.',
 updated_at=now(),verified_at=now()
where slug='embajada-consulado-ecuador';

insert into public.directory_listings
 (name,slug,category,listing_type,description,city,address,phone,email,website,opening_hours,status,sponsored,verified_at,updated_at)
values
 ('Consulado General del Ecuador en Londres','consulado-ecuador-londres','Embajadas y consulados','community','Servicios consulares para ecuatorianos en el Reino Unido: trámites consulares, citas, servicios de registro civil y poderes notariales. Confirmar requisitos y disponibilidad en la web oficial.','London','9 John Sessions Square, Buckle Street, London E1 8NQ','+44 20 3905 2150','ceculondres@cancilleria.gob.ec','https://www.cancilleria.gob.ec/londres/','Consultar horario y cita previa en la web oficial.','published',false,now(),now())
on conflict (slug) do update set
 name=excluded.name,description=excluded.description,address=excluded.address,
 phone=excluded.phone,email=excluded.email,website=excluded.website,
 opening_hours=excluded.opening_hours,status='published',verified_at=now(),updated_at=now();
