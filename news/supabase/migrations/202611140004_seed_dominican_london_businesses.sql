-- Additional Dominican-owned / Dominican-focused businesses in London.
-- Details compiled from current public business listings; confirm with each venue before visiting.
insert into public.directory_listings
(name,slug,category,listing_type,description,address,postcode,city,phone,email,website,opening_hours,services,sponsored,status,verified_at)
values
(
 'El Juidero',
 'el-juidero-dominican-restaurant-brixton',
 'Negocios dominicanos','business',
 'Restaurante dominicano en Coldharbour Lane, Brixton, con cocina criolla y platos tradicionales. Se recomienda confirmar horario y disponibilidad directamente antes de desplazarse.',
 '382 Coldharbour Lane','SW9 8LF','London','+44 7590 529765',null,null,
 'Consultar horario actualizado antes de acudir',
 array['Comida dominicana','Restaurante'],
 false,'published','2026-11-13T00:00:00Z'
),
(
 'El Patio D’ Lucy',
 'el-patio-d-lucy-elephant-castle',
 'Negocios dominicanos','business',
 'Restaurante dominicano de ambiente familiar en la zona de Elephant and Castle. Consulta directamente para confirmar horario, menú y disponibilidad.',
 '147 Maldonado Walk','SE1 6SP','London',null,null,null,
 'Consultar horario actualizado antes de acudir',
 array['Comida dominicana','Restaurante'],
 false,'published','2026-11-13T00:00:00Z'
),
(
 'Plaza 809 La Caribeña',
 'plaza-809-la-caribena-camberwell',
 'Negocios dominicanos','business',
 'Restaurante de cocina dominicana en Camberwell. Ofrece platos tradicionales caribeños; confirma horarios y servicio directamente con el establecimiento.',
 '57 Camberwell Church Street','SE5 8TR','London','+44 7497 451499',null,null,
 'Consultar horario actualizado antes de acudir',
 array['Comida dominicana','Restaurante'],
 false,'published','2026-11-13T00:00:00Z'
),
(
 'La Parada Dominican Food',
 'la-parada-dominican-food-walworth',
 'Negocios dominicanos','business',
 'Establecimiento de comida dominicana para llevar en Walworth Road, con platos criollos y bebidas. Confirma directamente los horarios y opciones disponibles.',
 '322 Walworth Road','SE17 2NA','London','+44 7554 245891',null,null,
 'Consultar horario actualizado antes de acudir',
 array['Comida dominicana','Comida para llevar'],
 false,'published','2026-11-13T00:00:00Z'
),
(
 'Peluquería Dominicana El Punty Barbershop',
 'el-punty-barbershop-old-kent-road',
 'Negocios dominicanos','business',
 'Barbería de estilo dominicano en Old Kent Road. Servicio de peluquería masculina y arreglos de barba. Se recomienda reservar o confirmar disponibilidad.',
 '212 Old Kent Road','SE1 5TY','London','+44 7526 774959',null,null,
 'Consultar horario actualizado antes de acudir',
 array['Barbería','Corte masculino','Arreglo de barba'],
 false,'published','2026-11-13T00:00:00Z'
),
(
 'Dominicanos en Acción Londres CIC',
 'dominicanos-en-accion-londres-cic',
 'Asociaciones','community',
 'Entidad constituida en el Reino Unido como Community Interest Company (CIC), registrada con el número 13426001. Companies House muestra la entidad como activa y registra su domicilio en Deptford. Esta ficha identifica su registro legal; no implica que se hayan verificado programas, horarios o atención al público.',
 '115 Gilbert House, Macmillan Street','SE8 3DL','London',null,null,
 'https://find-and-update.company-information.service.gov.uk/company/13426001',
 'Sin horario público confirmado',
 array['Entidad comunitaria registrada','Community Interest Company'],
 false,'published','2026-11-13T00:00:00Z'
)
on conflict (slug) do update set
 name=excluded.name,category=excluded.category,listing_type=excluded.listing_type,
 description=excluded.description,address=excluded.address,postcode=excluded.postcode,
 city=excluded.city,phone=excluded.phone,email=excluded.email,website=excluded.website,
 opening_hours=excluded.opening_hours,services=excluded.services,sponsored=excluded.sponsored,
 status='published',verified_at=excluded.verified_at,updated_at=now();
