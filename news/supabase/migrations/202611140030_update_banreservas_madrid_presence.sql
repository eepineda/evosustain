-- Evoford News: corregir y destacar la presencia física de Banreservas en Madrid
update public.directory_listings
set
  name = 'Banreservas · Oficina de Representación en Madrid',
  category = 'Banca y finanzas',
  listing_type = 'community',
  description = 'Banreservas tiene una Oficina de Representación física en Madrid para atender a dominicanos residentes en España y a personas con intereses económicos en República Dominicana. Desde esta oficina se ofrece asesoría y se canalizan solicitudes de cuentas de ahorro en pesos o dólares, préstamos hipotecarios para adquirir vivienda en República Dominicana, banca en línea y otros servicios. La oficina acompaña la solicitud, pero la apertura de cuentas y la aprobación y desembolso de hipotecas se realizan en República Dominicana. Es necesario solicitar cita y confirmar los requisitos y condiciones vigentes.',
  city = 'Paseo de la Castellana 93, Edificio Cadagua, planta 7, 28046 Madrid, España',
  phone = '+34 960 99 00 22',
  website = 'https://www.banreservas.com/internacional/madrid/',
  services = array[
    'Oficina física de representación en Madrid',
    'Asesoría presencial con cita previa',
    'Solicitud de cuentas de ahorro en pesos y dólares',
    'Tramitación de préstamos hipotecarios para vivienda en República Dominicana',
    'Asistencia con TuBanco y App Banreservas',
    'Orientación sobre remesas e inversiones en República Dominicana'
  ],
  updated_at = now()
where slug = 'banreservas-servicios-diaspora';
