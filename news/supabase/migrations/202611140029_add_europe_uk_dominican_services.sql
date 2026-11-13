-- Evoford News: entidades con operación, acuerdos o redes verificadas en España y Reino Unido
-- Distingue bancos con presencia física, bancos pagadores en RD y socios/remesadores en Europa.
insert into public.directory_listings
  (name, slug, category, listing_type, description, city, website, services, status)
values
  (
    'CaixaBank · Canal bancario en España para remesas a República Dominicana',
    'caixabank-remesas-dominicanos-espana',
    'Banca y finanzas',
    'business',
    'CaixaBank es una entidad bancaria que opera en España y mantiene un acuerdo de colaboración con Banreservas para el envío de remesas de dominicanos residentes en España hacia República Dominicana. Banreservas comunicó condiciones específicas para clientes de CaixaBank, incluidas comisiones y cambio de divisas preferenciales según el convenio vigente. Consulta en CaixaBank y Banreservas las condiciones actuales, canales disponibles, límites y documentación. CaixaBank no es un banco dominicano ni esta ficha implica que ofrezca hipotecas dominicanas.',
    'España · Red bancaria y acuerdo de remesas',
    'https://www.banreservas.com/noticiasyprensa/banreservas-y-caixabank-de-espana-renuevan-acuerdo-para-el-envio-de-remesas/',
    array['Envío de remesas desde España','Acuerdo con Banreservas','Transferencias hacia República Dominicana','Consulta de comisiones y cambio'],
    'published'
  ),
  (
    'Banco BHD · Red de remesas desde España y Europa',
    'bhd-red-remesas-europa',
    'Banca y finanzas',
    'community',
    'Banco BHD permite recibir remesas en República Dominicana mediante abono directo a una Cuenta BHD y publica una red de agentes y compañías remesadoras en España, Suiza y otros países europeos. Entre los operadores que aparecen en su página figuran entidades de envío y pago en España. La cuenta y el cobro se realizan en República Dominicana; confirma con el operador local de tu país los puntos activos, comisiones, moneda y disponibilidad.',
    'República Dominicana · Remesadores en España y Europa',
    'https://bhd.com.do/homepage-personal/remesas',
    array['Remesas desde España y Europa','Abono directo a Cuenta BHD','Red de agentes remesadores','Consulta de condiciones y puntos de envío'],
    'published'
  ),
  (
    'Asociación La Nacional · Remesas desde España y Reino Unido',
    'asociacion-la-nacional-remesas-europa-uk',
    'Banca y finanzas',
    'community',
    'La Asociación La Nacional de Ahorros y Préstamos permite recibir remesas en República Dominicana en sucursales o directamente en una cuenta, mediante su socio Banco Unión y una red de agentes internacionales. Su página identifica agentes en España y un agente en Inglaterra (Connect Plus Business Limited). También indica que los clientes con hipoteca en La Nacional y residentes en el extranjero pueden pagar cuotas mediante remesa. Confirma con la remesadora si el punto está activo en tu ciudad, las tarifas y el procedimiento.',
    'República Dominicana · Agentes publicados en España e Inglaterra',
    'https://asociacionlanacional.com.do/producto/remesas',
    array['Recepción de remesas','Depósito directo en cuenta','Agentes en España','Agente listado en Inglaterra','Pago de cuotas hipotecarias desde el exterior'],
    'published'
  ),
  (
    'Banco Popular Dominicano · Remesas desde la Unión Europea y Reino Unido',
    'popular-remesas-union-europea-reino-unido',
    'Banca y finanzas',
    'community',
    'Banco Popular publica una red de compañías de remesas que permite enviar fondos desde la Unión Europea y Reino Unido a República Dominicana, mediante abono directo a cuentas o retiro en sucursales y subagentes según el operador. Esta ficha se refiere a recepción de remesas en República Dominicana, no a una sucursal de Banco Popular en Europa ni a la apertura de cuentas europeas. Consulta la tabla de países, operadores, moneda y forma de pago antes de enviar.',
    'República Dominicana · Envíos desde Europa y Reino Unido',
    'https://popularenlinea.com/remesas',
    array['Remesas desde España y Unión Europea','Remesas desde Reino Unido','Abono directo a cuenta','Retiro en sucursales y subagentes'],
    'published'
  ),
  (
    'Dominicanos Unidos UK · Asociación comunitaria',
    'dominicanos-unidos-uk-index',
    'Asociaciones',
    'community',
    'Asociación incluida en el directorio de Asociaciones de Dominicanos en el Exterior del INDEX. Puede servir como punto de contacto para conocer iniciativas y redes comunitarias dominicanas en Reino Unido. La ficha del INDEX acredita su inclusión en el registro institucional, pero no detalla aquí servicios, dirección ni horarios; consulta el registro y solicita a la asociación sus datos y actividades actuales.',
    'Reino Unido',
    'https://index.gob.do/asociaciones/',
    array['Red comunitaria dominicana en Reino Unido','Contacto asociativo','Actividades e iniciativas comunitarias'],
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
