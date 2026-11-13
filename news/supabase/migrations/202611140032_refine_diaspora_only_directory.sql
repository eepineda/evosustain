-- Evoford News: depurar el directorio para mostrar solo servicios dominicanos reales
-- dirigidos a la diáspora o prestados desde el exterior.
-- Mantiene JCE, MIREX consular, INDEX, INFOTEP diaspora y bancos/remesas.
-- Pasa a borrador servicios nacionales que no acreditan atención específica a residentes fuera del país.

update public.directory_listings
set status='draft', updated_at=now()
where slug in (
  'mirex-apostillas-legalizaciones-en-linea',
  'pgr-certificado-no-antecedentes-penales-exterior',
  'dgii-oficina-virtual-dominicanos-exterior',
  'infotep-virtual-cursos-online',
  'minerd-prepara-bachillerato-adultos'
);

update public.directory_listings
set
  name='INFOTEP · Programa de capacitación para dominicanos en el exterior',
  description='Programa específico del Instituto Nacional de Formación Técnico Profesional dirigido a dominicanos residentes fuera del país. Los cursos se imparten mediante INFOTEP Virtual, en modalidad sincrónica y asincrónica, para que los participantes puedan formarse a distancia. La oferta formativa publicada incluye áreas técnicas, digitales, administrativas y de emprendimiento. Consulta la convocatoria, cupos, calendario, requisitos y certificación directamente con INFOTEP.',
  city='Formación virtual · Dominicanos residentes en el exterior',
  website='https://infotep.gob.do/dominicanos-en-el-exterior/oferta-formativa/',
  services=array['Cursos virtuales para dominicanos residentes en el exterior','Modalidad sincrónica y asincrónica','Formación técnica y profesional','Consulta de oferta, requisitos y convocatorias'],
  status='published',
  updated_at=now()
where slug='infotep-formacion-dominicanos-exterior';

update public.directory_listings
set
  name='INDEX · Programas y servicios para dominicanos en el exterior',
  description='El Instituto de Dominicanos y Dominicanas en el Exterior (INDEX), adscrito al MIREX, desarrolla programas dirigidos a la diáspora. Su iniciativa Edúcate con INDEX reúne oportunidades de educación continua, cursos y diplomados mediante instituciones colaboradoras; también impulsa proyectos culturales, sociales y de vinculación comunitaria. La disponibilidad depende de cada convocatoria y convenio: verifica directamente modalidad, coste, becas, acreditación y requisitos.',
  city='Programas internacionales · Oficinas y comunidades dominicanas en el exterior',
  website='https://index.gob.do/educate-con-index/',
  services=array['Edúcate con INDEX: cursos y diplomados','Programas de formación continua','Acuerdos con instituciones educativas','Iniciativas culturales y sociales para la diáspora','Directorio de asociaciones dominicanas en el exterior'],
  status='published',
  updated_at=now()
where slug='index-dominicanos-exterior';

update public.directory_listings
set
  description='El INDEX mantiene un directorio de asociaciones de dominicanos en el exterior para facilitar que la diáspora localice organizaciones comunitarias en sus países de residencia. Incluye entidades registradas en España, Italia, Reino Unido y otros países. El directorio acredita su registro, pero no garantiza que todas estén activas ni que presten servicios profesionales: contacta con cada asociación para confirmar actividades, dirección y disponibilidad.',
  website='https://index.gob.do/asociaciones/',
  updated_at=now()
where slug='index-asociaciones-dominicanos-exterior';

update public.directory_listings
set
  description='Programa anunciado por INDEX y la Organización Mundial de Alfabetización para facilitar a dominicanos residentes en el exterior acceso a programas de formación académica de grado y posgrado y capacitación continua. El acuerdo establece un marco de colaboración; no significa que todas las titulaciones estén abiertas o sean gratuitas. Confirma con INDEX y WLO convocatorias, instituciones participantes, reconocimiento académico, modalidad, costes y requisitos.',
  city='Programas internacionales · Diáspora dominicana',
  website='https://index.gob.do/index-y-wlo-suscriben-acuerdo-para-ampliar-oportunidades-de-formacion-de-dominicanos-en-el-exterior/',
  updated_at=now()
where slug='index-wlo-formacion-diaspora';

update public.directory_listings
set
  description='Acuerdo de INDEX con CMI Business School para facilitar oportunidades de formación a dominicanos residentes en el exterior. La institución ha anunciado programas de maestría y diplomados y oportunidades de becas. Las condiciones concretas dependen de cada convocatoria; confirma plazas, porcentaje de beca, coste final, modalidad, titulación y requisitos directamente con INDEX y CMI Business School.',
  updated_at=now()
where slug='index-cmi-becas-dominicanos-exterior';

update public.directory_listings
set
  description='La JCE dispone de Oficinas de Servicios en el Exterior y oficinas satélites para trámites de identidad y servicios del registro civil dominicano. Su listado oficial identifica centros en Madrid, Barcelona, Valencia, Sevilla, Milán, Génova, Países Bajos y Suiza, entre otros. También incluye Londres dentro de la relación de consulados donde se ofrecen servicios de la JCE, aunque no publica allí una ficha OSE independiente con dirección y contacto propios. Antes de acudir a Londres, confirma con el Consulado dominicano qué trámites de JCE están disponibles, cómo obtener cita y qué documentos llevar.',
  city='España · Italia · Países Bajos · Suiza · Reino Unido y otros países',
  website='https://jce.gob.do/Servicos-Exterior',
  services=array['Servicios de cédula en el exterior','Servicios de registro civil','Oficinas OSE y oficinas satélites','Consulta de sedes y contactos','Confirmación de trámites y citas con cada oficina'],
  updated_at=now()
where slug='junta-central-electoral-servicios-exterior';

update public.directory_listings
set
  description='Portal del MIREX para los servicios que prestan las misiones diplomáticas y oficinas consulares dominicanas. Permite consultar los trámites disponibles y sus requisitos, que pueden variar según el consulado y el país: pasaportes, actos notariales, certificaciones, registros y otros servicios consulares. Selecciona la oficina consular correspondiente y confirma si el trámite requiere cita o comparecencia presencial.',
  city='Red de embajadas y consulados dominicanos en el exterior',
  website='https://servicios360.mirex.gob.do/',
  services=array['Trámites consulares en embajadas y consulados','Pasaportes y documentación','Actos notariales y certificaciones','Información de requisitos y citas por oficina'],
  updated_at=now()
where slug='mirex-portal-servicios-consulares';

update public.directory_listings
set
  description='Banco BHD permite recibir remesas en República Dominicana mediante abono directo a una Cuenta BHD y publica operadores con cobertura en España, Suiza y otros países europeos. La ficha oficial identifica compañías y agentes para esos mercados. El dinero se recibe en una cuenta o por los canales de pago en República Dominicana; comprueba con el agente de envío de tu ciudad las tarifas, moneda, límites y documentación.',
  city='República Dominicana · Red de remesadores en España y Europa',
  website='https://bhd.com.do/homepage-personal/remesas',
  updated_at=now()
where slug='bhd-red-remesas-europa';

update public.directory_listings
set
  description='Banco Popular publica operadores de remesas que permiten enviar dinero desde la Unión Europea y Reino Unido hacia República Dominicana. Según el proveedor, los fondos pueden abonarse directamente a una cuenta o cobrarse en sucursales y subagentes del banco en República Dominicana. Esta ficha describe recepción de remesas en el país, no una sucursal del Popular en Europa. Comprueba operador, países, comisiones, moneda y forma de pago antes de enviar.',
  city='República Dominicana · Envíos desde Unión Europea y Reino Unido',
  website='https://popularenlinea.com/remesas',
  updated_at=now()
where slug='banco-popular-remesas-diaspora';

update public.directory_listings
set
  description='Banco Vimenca ofrece productos dirigidos expresamente a dominicanos que residen fuera del país: cuentas de ahorro en dólares y pesos, certificados financieros, préstamos hipotecarios para proyectos disponibles en República Dominicana, tarjeta de débito y banca en línea. La solicitud se inicia mediante su canal de atención a la diáspora. Confirma requisitos, elegibilidad, financiación, costes y condiciones del proyecto directamente con el banco.',
  city='República Dominicana · Solicitudes desde el exterior',
  website='https://diaspora.bancovimenca.com/',
  updated_at=now()
where slug='banco-vimenca-diaspora';

update public.directory_listings
set
  description='Banreservas dispone de una Oficina de Representación en Madrid para orientar y canalizar solicitudes de cuentas de ahorro en pesos o dólares, préstamos hipotecarios para inmuebles en República Dominicana y asistencia con banca digital. No es una sucursal transaccional: no tiene caja ni cajeros y no realiza depósitos, retiros ni pagos. La apertura de cuentas y la aprobación y desembolso de hipotecas se realizan en República Dominicana. Se requiere cita previa y confirmación de requisitos.',
  city='Paseo de la Castellana 93, Edificio Cadagua, planta 7, 28046 Madrid, España',
  website='https://www.banreservas.com/internacional/madrid/',
  updated_at=now()
where slug='banreservas-servicios-diaspora';

update public.directory_listings
set
  description='Acuerdo entre Banreservas y CaixaBank para facilitar el envío de remesas de dominicanos residentes en España hacia República Dominicana. Banreservas comunicó condiciones específicas para clientes de CaixaBank, sujetas a los términos vigentes del convenio. No es un servicio de CaixaBank para abrir cuentas dominicanas ni una sucursal de Banreservas en España. Confirma con ambos bancos comisión, tipo de cambio, canal y límites actuales.',
  updated_at=now()
where slug='caixabank-remesas-dominicanos-espana';
