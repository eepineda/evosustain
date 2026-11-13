-- Professional services useful to Spanish-speaking residents and small businesses in London.
-- These providers are not described as Dominican-owned; language and service scope are stated explicitly.
insert into public.directory_listings
(name,slug,category,listing_type,description,address,postcode,city,phone,email,website,opening_hours,services,sponsored,status,verified_at)
values
(
 'Business es Business Ltd',
 'business-es-business-accounting-streatham',
 'Servicios profesionales','business',
 'Empresa de contabilidad y apoyo administrativo con atención en español e inglés. Publica servicios de Self Assessment, registro para CIS y PAYE, cuentas y declaraciones fiscales, apoyo a autónomos y pequeñas empresas y determinados trámites administrativos. Confirma el alcance del servicio y las cualificaciones del profesional antes de contratar.',
 '342 Streatham High Road, First Floor','SW16 6HH','London',
 '+44 7475 552777','businesssolobusiness@gmail.com',
 'https://www.business-es-business.com/','Contactar para cita',
 array['Contabilidad y declaraciones fiscales','Self Assessment y CIS','Servicios para autónomos','Cuentas de pequeñas empresas','Atención en español e inglés'],
 false,'published','2026-11-13T00:00:00Z'
),
(
 'Scornik Gerstein LLP',
 'scornik-gerstein-solicitors-holborn',
 'Servicios profesionales','business',
 'Despacho de abogados regulado por la Solicitors Regulation Authority (SRA nº 565232), con atención en inglés y español. Su Spanish Desk atiende asuntos entre Reino Unido y España. Áreas publicadas: familia, herencias, inmigración y nacionalidad, empleo, fiscalidad, inmobiliario, litigios y asesoramiento mercantil. No se presenta como despacho especializado exclusivamente en derecho dominicano.',
 '2nd Floor, 9–10 Staple Inn Buildings, Holborn','WC1V 7QH','London',
 '+44 20 7831 7070','london@scornik.com',
 'https://www.scornik.com/es','Lunes a viernes, consultar cita',
 array['Asesoría jurídica en español','Derecho de familia y herencias','Inmigración y nacionalidad','Derecho laboral','Fiscalidad e inmobiliario','Asuntos UK–España'],
 false,'published','2026-11-13T00:00:00Z'
),
(
 'Aster & Trujillo',
 'aster-trujillo-accountancy-advisory-london',
 'Servicios profesionales','business',
 'Firma multidisciplinar anglo-española que ofrece contabilidad, fiscalidad y asesoramiento empresarial para personas y empresas con asuntos en Reino Unido y España. Publica servicios de contabilidad, nóminas, creación de empresas, impuestos personales y de sociedades y asesoramiento fiscal. Los servicios jurídicos se prestan mediante profesionales y firmas reguladas asociadas; solicita confirmación de quién llevará cada asunto.',
 '87 Chancery Lane','WC2A 1ET','London',
 '+44 20 7190 9812',null,
 'https://www.astertrujillo.co.uk/','Lunes a viernes, cita previa',
 array['Contabilidad y fiscalidad','Nóminas','Creación de empresas','Impuestos personales y empresariales','Asuntos fiscales UK–España'],
 false,'published','2026-11-13T00:00:00Z'
),
(
 'Certified Translation Services Ltd',
 'certified-translation-services-london',
 'Servicios profesionales','business',
 'Proveedor de traducciones certificadas y servicios de interpretación en Londres. Puede ser útil para documentos personales, académicos, administrativos y trámites oficiales. Antes de encargar una traducción, confirma el formato de certificación exigido por la entidad que recibirá el documento y el precio final.',
 'Golden Cross House, 8 Duncannon Street','WC2N 4JF','London',
 '+44 20 4577 2669',null,
 'https://document-translations.co.uk/','Lunes a viernes, 09:00–18:00',
 array['Traducciones certificadas','Traducción de documentos','Interpretación','Legalización y notarización cuando proceda'],
 false,'published','2026-11-13T00:00:00Z'
),
(
 'The Law Society – Find a Solicitor',
 'law-society-find-a-solicitor-directory',
 'Servicios profesionales','community',
 'Buscador oficial para localizar solicitors en Inglaterra y Gales por localidad, especialidad y servicios. Permite filtrar profesionales que hablan español y comprobar si ofrecen legal aid o acreditaciones especializadas. Es una herramienta de búsqueda, no un despacho de abogados.',
 null,null,'London',null,null,
 'https://www.lawsociety.org.uk/public/for-public-visitors/find-a-solicitor',
 'Buscador en línea',
 array['Buscar abogados por especialidad','Filtrar por idioma español','Localizar profesionales por código postal','Comprobar legal aid y acreditaciones'],
 false,'published','2026-11-13T00:00:00Z'
)
on conflict (slug) do update set
 name=excluded.name,category=excluded.category,listing_type=excluded.listing_type,
 description=excluded.description,address=excluded.address,postcode=excluded.postcode,
 city=excluded.city,phone=excluded.phone,email=excluded.email,website=excluded.website,
 opening_hours=excluded.opening_hours,services=excluded.services,sponsored=excluded.sponsored,
 status='published',verified_at=excluded.verified_at,updated_at=now();
