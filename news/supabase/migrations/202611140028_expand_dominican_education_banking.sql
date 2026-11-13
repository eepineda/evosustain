-- Evoford News: ampliar educación y banca dominicana para la diáspora
-- Los textos distinguen servicios remotos, acuerdos y trámites que requieren confirmación.
insert into public.directory_listings
  (name, slug, category, listing_type, description, city, website, services, status)
values
  (
    'Banco Popular Dominicano · Remesas y servicios digitales',
    'banco-popular-remesas-diaspora',
    'Banca y finanzas',
    'community',
    'Banco Popular permite recibir remesas directamente en cuentas del banco y consultar o retirar fondos mediante sus canales digitales y su red de sucursales y subagentes en República Dominicana. Su página informa sobre compañías y países desde los que se pueden enviar remesas. Esta ficha describe el servicio de recepción en República Dominicana; confirma con el proveedor de envío las condiciones para enviar desde tu país europeo, las comisiones, el cambio de moneda y los plazos.',
    'República Dominicana · Envíos desde el exterior',
    'https://popularenlinea.com/remesas',
    array['Recepción de remesas','Abono directo a cuentas Popular','Consulta mediante canales digitales','Retiro en sucursales y subagentes','Información de compañías y países de envío'],
    'published'
  ),
  (
    'INFOTEP Virtual · Cursos en línea',
    'infotep-virtual-cursos-online',
    'Educación y formación',
    'community',
    'Plataforma de formación virtual del Instituto Nacional de Formación Técnico Profesional. Publica cursos en distintas áreas técnicas y profesionales que pueden realizarse a distancia, según la oferta y las condiciones de cada convocatoria. La disponibilidad de inscripción desde Europa, los horarios, requisitos y certificación deben confirmarse en la ficha de cada curso. No todos los cursos dirigidos a residentes en República Dominicana tienen necesariamente las mismas condiciones que el programa específico para la diáspora.',
    'República Dominicana · Formación en línea',
    'https://infotepvirtual.com/',
    array['Cursos virtuales','Formación técnica y profesional','Competencias digitales','Administración y gestión','Consulta de convocatorias e inscripción'],
    'published'
  ),
  (
    'MINERD · PREPARA, bachillerato para jóvenes y adultos',
    'minerd-prepara-bachillerato-adultos',
    'Educación y formación',
    'community',
    'Programa oficial de educación secundaria para personas jóvenes y adultas que no han completado el bachillerato. Está dirigido generalmente a mayores de 17 años y permite optar al certificado de bachiller al cumplir los requisitos académicos. La información oficial indica que se debe contactar con la Dirección de Educación de Personas Jóvenes y Adultas, la regional, el distrito o un centro PREPARA. No se anuncia como bachillerato íntegramente online ni se confirma aquí que pueda cursarse desde Europa: consulta al MINERD sobre inscripción desde el exterior, equivalencias, asistencia y evaluaciones.',
    'República Dominicana · Consultar acceso desde el exterior',
    'https://minerd.gob.do/servicios/padres-y-alumnos/prepara-educacion-secundaria-de-personas-jovenes-y-adultas',
    array['Completar educación secundaria','Bachillerato para jóvenes y adultos','Orientación sobre requisitos y documentos','Consulta de acceso desde el extranjero'],
    'published'
  ),
  (
    'INDEX y Organización Mundial de Alfabetización · Formación internacional',
    'index-wlo-formacion-diaspora',
    'Educación y formación',
    'community',
    'Acuerdo anunciado por INDEX y la Organización Mundial de Alfabetización para facilitar a dominicanos residentes en el exterior el acceso a programas de formación académica, de grado y posgrado, y capacitación continua. La noticia institucional describe el marco de cooperación, pero no sustituye una convocatoria: consulta a INDEX y a la organización sobre programas abiertos, instituciones participantes, acreditación, becas, costes y requisitos.',
    'España · Programas internacionales para la diáspora',
    'https://index.gob.do/index-y-wlo-suscriben-acuerdo-para-ampliar-oportunidades-de-formacion-de-dominicanos-en-el-exterior/',
    array['Formación académica','Programas de grado y posgrado','Capacitación continua','Orientación para dominicanos en el exterior'],
    'published'
  ),
  (
    'INDEX y CMI Business School · Becas y formación para dominicanos en el exterior',
    'index-cmi-becas-dominicanos-exterior',
    'Educación y formación',
    'community',
    'INDEX y CMI Business School anunciaron la ampliación de un acuerdo para facilitar el acceso de dominicanos residentes en el exterior a programas de formación, incluidas maestrías y diplomados. La disponibilidad de becas, porcentajes de cobertura, titulaciones, modalidad, fechas y requisitos depende de las convocatorias y condiciones vigentes; solicita confirmación directamente a las instituciones.',
    'Madrid · España · Formación para la diáspora',
    'https://presidencia.gob.do/noticias/index-y-cmi-business-school-amplian-acuerdo-de-becas-para-dominicanos-en-el-exterior',
    array['Becas y oportunidades formativas','Maestrías','Diplomados','Programas para dominicanos residentes en el exterior'],
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
