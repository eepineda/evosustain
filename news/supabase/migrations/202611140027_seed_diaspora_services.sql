-- Evoford News: servicios prácticos para la diáspora dominicana
-- Fichas públicas con enlaces institucionales/oficiales. No implica elegibilidad automática.
insert into public.directory_listings
  (name, slug, category, listing_type, description, city, website, services, status)
values
  (
    'INDEX · Instituto de Dominicanos y Dominicanas en el Exterior',
    'index-dominicanos-exterior',
    'Instituciones dominicanas',
    'community',
    'Institución adscrita al MIREX que desarrolla programas para la comunidad dominicana en el exterior. Su portal reúne oficinas del INDEX en distintos países, asociaciones dominicanas, iniciativas de codesarrollo, formación y orientación. Consulta directamente qué programas están activos en tu país.',
    'República Dominicana · Servicio para dominicanos en el exterior',
    'https://index.gob.do/',
    array['Oficinas del INDEX en el exterior','Directorio de asociaciones dominicanas','Programas para la diáspora','Formación y orientación','Codesarrollo'],
    'published'
  ),
  (
    'INDEX · Directorio de asociaciones dominicanas en el exterior',
    'index-asociaciones-dominicanos-exterior',
    'Asociaciones',
    'community',
    'Directorio institucional de asociaciones de dominicanos en distintos países, incluidos España e Italia y otras comunidades europeas. Permite localizar organizaciones comunitarias y consultar sus datos publicados. Verifica con cada asociación sus servicios, actividad y datos de contacto.',
    'Europa y otros países · Directorio internacional',
    'https://index.gob.do/asociaciones/',
    array['Asociaciones dominicanas','Redes comunitarias','Organizaciones culturales y sociales','Contacto con entidades locales'],
    'published'
  ),
  (
    'INFOTEP · Formación para dominicanos en el exterior',
    'infotep-formacion-dominicanos-exterior',
    'Educación y formación',
    'community',
    'Programa de capacitación dirigido específicamente a dominicanos residentes en el exterior. Ofrece cursos virtuales sincrónicos y asincrónicos para desarrollar competencias técnicas y profesionales. Consulta la oferta vigente, los requisitos y las convocatorias antes de inscribirte.',
    'República Dominicana · Formación virtual internacional',
    'https://infotep.gob.do/dominicanos-en-el-exterior/',
    array['Cursos virtuales','Capacitación técnica y profesional','Desarrollo de competencias','Formación para el empleo'],
    'published'
  ),
  (
    'MINERD y MIREX · Pruebas Nacionales para estudiantes en el exterior',
    'minerd-pruebas-nacionales-exterior',
    'Educación y formación',
    'community',
    'El MINERD y el MIREX anunciaron un acuerdo para facilitar la realización de Pruebas Nacionales en consulados dominicanos a estudiantes que residen fuera del país y necesitan completar el bachillerato dominicano. La aplicación, calendario, consulados habilitados y condiciones deben confirmarse con el MINERD o el consulado correspondiente.',
    'República Dominicana · Consulados en el exterior',
    'https://www.ministeriodeeducacion.gob.do/comunicaciones/noticias/ministerios-de-educacion-y-de-relaciones-exteriores-firman-acuerdo-para-facilitar-pruebas-nacionales-a-jovenes-que-terminaron-su-bachillerato-y-residen-en-el-extranjero',
    array['Bachillerato dominicano','Pruebas Nacionales','Continuidad educativa desde el extranjero','Orientación a estudiantes y familias'],
    'published'
  ),
  (
    'Banreservas · Servicios bancarios e hipotecas para residentes en el extranjero',
    'banreservas-servicios-diaspora',
    'Banca y finanzas',
    'community',
    'Banreservas dispone de oficinas de representación y canales internacionales para orientar a dominicanos residentes en el exterior sobre cuentas de ahorro, solicitudes de préstamos hipotecarios en República Dominicana y banca digital. La oficina de representación canaliza solicitudes: la apertura de cuentas y la aprobación y desembolso de hipotecas se realizan en República Dominicana. Consulta disponibilidad, requisitos, tasas y condiciones vigentes.',
    'Madrid · Nueva York · Miami · Atención a residentes en el exterior',
    'https://www.banreservas.com/internacional/',
    array['Cuentas de ahorro en pesos y dólares','Solicitud de préstamos hipotecarios en República Dominicana','Orientación financiera','Banca digital','Remesas'],
    'published'
  ),
  (
    'Banco Vimenca · Productos financieros para la diáspora',
    'banco-vimenca-diaspora',
    'Banca y finanzas',
    'business',
    'Banco Vimenca presenta una oferta dirigida a personas que viven fuera de República Dominicana, que incluye cuentas de ahorro, certificados financieros, tarjetas, banca en línea y préstamos hipotecarios vinculados a proyectos disponibles en el país. Solicita directamente las condiciones, requisitos, costes y disponibilidad para tu lugar de residencia.',
    'República Dominicana · Solicitudes desde el exterior',
    'https://diaspora.bancovimenca.com/',
    array['Cuentas en pesos y dólares','Certificados financieros','Préstamos hipotecarios','Tarjeta de débito','Banca en línea'],
    'published'
  ),
  (
    'Ministerio de Educación de España · Homologación del bachillerato extranjero',
    'espana-homologacion-bachiller-extranjero',
    'Educación y formación',
    'community',
    'Trámite oficial para solicitar la homologación de títulos extranjeros al título español de Bachiller o la convalidación de estudios no universitarios para continuar estudiando en España. Los requisitos dependen del sistema educativo y del expediente. Puede requerirse documentación oficial, legalización o apostilla y traducción oficial.',
    'España · Trámite estatal',
    'https://www.educacionfpydeportes.gob.es/servicios-al-ciudadano/catalogo/general/05/051270/ficha/051270.html',
    array['Homologación de bachillerato','Convalidación de estudios','Acceso a estudios en España','Tramitación electrónica e información oficial'],
    'published'
  ),
  (
    'Hackney Council · Welcome Hackney, orientación para familias migrantes',
    'hackney-welcome-hackney-migrant-support',
    'Vivienda y apoyo público',
    'community',
    'Servicio local de Hackney para personas refugiadas, migrantes y solicitantes de asilo. Ofrece orientación sobre vivienda, prestaciones, clases de inglés, inscripción escolar, empleo y otros servicios locales. Es un servicio municipal de ámbito local; comprueba horarios, dirección y criterios de atención antes de acudir.',
    'Hackney · Londres · Reino Unido',
    'https://www.hackney.gov.uk/community-safety-and-environment/welcome-hackney-refugee-migrant-and-asylum-seeker-service',
    array['Orientación sobre vivienda','Universal Credit y prestaciones','Clases ESOL','Inscripción escolar','Empleo y apoyo familiar'],
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
