-- Evoford News: ampliar el directorio con instituciones públicas dominicanas
-- Servicios y cobertura contrastados con portales oficiales. Confirmar requisitos y citas antes de acudir.

insert into public.directory_listings
  (name, slug, category, listing_type, description, city, website, services, status)
values
  (
    'Junta Central Electoral (JCE) · Servicios en el exterior',
    'junta-central-electoral-servicios-exterior',
    'Instituciones dominicanas',
    'community',
    'La JCE dispone de Oficinas de Servicios en el Exterior para trámites de identidad y registro civil, además de servicios vinculados al voto dominicano en el exterior. Su portal oficial publica centros y contactos en España (Madrid, Barcelona, Valencia y otras sedes), Países Bajos, Italia y Suiza. La página general también recoge consulados donde puede haber servicios; no presupongas que cada consulado presta todos los trámites. Para residentes en Reino Unido, consulta directamente con la JCE y el Consulado dominicano en Londres antes de desplazarte: Londres aparece en el listado de representaciones, pero no en el listado consultado de centros OSE con dirección y contacto propios.',
    'España · Países Bajos · Italia · Suiza · otros países; consultar cobertura para Reino Unido',
    'https://jce.gob.do/Servicos-Exterior',
    array['Cédula de identidad y electoral','Registro y expedición de actas','Transcripciones del registro civil','Empadronamiento y voto en el exterior','Consulta de centros, requisitos y tasas'],
    'published'
  ),
  (
    'MIREX · Portal Único de Servicios Consulares',
    'mirex-portal-servicios-consulares',
    'Instituciones dominicanas',
    'community',
    'Portal oficial del Ministerio de Relaciones Exteriores para consultar y solicitar servicios relacionados con pasaportes, nacimiento, matrimonio, defunción, poderes notariales, certificaciones, autorizaciones, declaraciones juradas, protección a nacionales en el exterior y otros trámites consulares. La disponibilidad y los requisitos pueden variar según la oficina consular; verifica el procedimiento correspondiente a tu país.',
    'República Dominicana · Red consular en el exterior',
    'https://servicios360.mirex.gob.do/',
    array['Pasaportes y servicios consulares','Actas y registros de nacimiento, matrimonio y defunción','Poderes notariales y declaraciones juradas','Certificaciones y autorizaciones','Protección a nacionales en el exterior'],
    'published'
  ),
  (
    'MIREX · Apostillas y legalizaciones en línea',
    'mirex-apostillas-legalizaciones-en-linea',
    'Instituciones dominicanas',
    'community',
    'El MIREX permite solicitar en línea apostillas y legalizaciones de documentos públicos dominicanos para su uso en el extranjero. El portal explica requisitos, pagos y validación. No todos los documentos siguen el mismo procedimiento: los documentos privados pueden requerir formalidades previas y algunos trámites consulares se realizan presencialmente. Comprueba las instrucciones específicas antes de iniciar la solicitud.',
    'Servicio en línea · República Dominicana',
    'https://servicios360.mirex.gob.do/apostillas-legalizaciones/',
    array['Apostilla de documentos públicos','Legalización de documentos','Solicitud y seguimiento en línea','Validación de apostillas y legalizaciones'],
    'published'
  ),
  (
    'Procuraduría General de la República · Certificado de No Antecedentes Penales',
    'pgr-certificado-no-antecedentes-penales-exterior',
    'Instituciones dominicanas',
    'community',
    'La Procuraduría General de la República dispone de un portal para solicitar en línea el Certificado de No Antecedentes Penales, con acceso desde el extranjero. El trámite requiere identificación y pago de la tasa correspondiente. La propia institución advierte que, si el certificado se necesita para apostillarlo en Cancillería, debe solicitarse presencialmente en un Centro de Atención al Ciudadano. Revisa también las limitaciones del sistema y los requisitos actualizados.',
    'Servicio en línea · República Dominicana',
    'https://portal.servicios.pgr.gob.do/CertificadoNoAntecedentesPenales/VisualizarCNAP',
    array['Solicitud en línea del certificado','Pago electrónico','Descarga e impresión del documento','Consulta de autenticidad'],
    'published'
  ),
  (
    'DGII · Oficina Virtual de Impuestos Internos',
    'dgii-oficina-virtual-dominicanos-exterior',
    'Instituciones dominicanas',
    'community',
    'La Dirección General de Impuestos Internos ofrece una Oficina Virtual para que contribuyentes realicen consultas, declaraciones y transacciones tributarias por internet, las 24 horas. La DGII indica que puede utilizarse desde cualquier lugar. Para crear o recuperar el acceso, actualizar datos o realizar gestiones que requieran validación, pueden aplicarse requisitos adicionales; consulta los canales oficiales.',
    'Servicio en línea · República Dominicana',
    'https://dgii.gov.do/cicloContribuyente/accesoOFV/Paginas/default.aspx',
    array['Consultas tributarias','Declaraciones de impuestos','Transacciones y pagos','Gestión de acceso a la Oficina Virtual'],
    'published'
  )
on conflict (slug) do update set
  name=excluded.name,
  category=excluded.category,
  listing_type=excluded.listing_type,
  description=excluded.description,
  city=excluded.city,
  website=excluded.website,
  services=excluded.services,
  updated_at=now();
