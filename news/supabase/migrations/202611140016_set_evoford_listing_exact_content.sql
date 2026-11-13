-- Actualiza únicamente la ficha pública con el texto y los datos de contacto indicados.
-- No modifica la lista interna de servicios ni otras fichas del directorio.
-- Ejecutar en Supabase SQL Editor.

update public.directory_listings
set
  name = 'EvoSustain - Evoford | Servicios IT y desarrollo de software',
  category = 'Servicios profesionales',
  description = 'EvoSustain - Evoford ofrece servicios integrales de tecnología, digitalización y apoyo a particulares, autónomos, emprendedores y pequeñas y medianas empresas. Creamos páginas web personales y corporativas, tiendas online y plataformas digitales; diseñamos identidad e imagen corporativa y apoyamos la creación y gestión de perfiles y contenidos para redes sociales. Ayudamos a las empresas a implantar, configurar y gestionar sistemas CRM y ERP, organizar sus operaciones, digitalizar tareas y automatizar procesos. Desarrollamos software, aplicaciones, APIs, integraciones, cuadros de mando y sistemas a medida, incluidos sistemas de scoring y evaluación de perfiles. También instalamos, configuramos y mantenemos ordenadores, redes, correo electrónico, aplicaciones y herramientas de trabajo, con soporte técnico y mantenimiento. Ofrecemos orientación y acompañamiento para organizar deudas, ordenar pagos, revisar alternativas de alivio y conocer recursos de ayuda disponibles; no prestamos asesoramiento financiero regulado ni negociamos en nombre del cliente. Ayudamos con la puesta en marcha y organización digital de negocios y con trámites y procedimientos online disponibles en Inglaterra, especialmente en Londres. El acompañamiento en trámites se limita a Inglaterra; los servicios tecnológicos y digitales están disponibles en Londres y otras zonas del Reino Unido.',
  phone = '+44 7871 710697',
  email = 'info@evoford.com',
  website = 'https://evoford.com/index.html#it',
  opening_hours = 'Contactar para consultas y propuestas',
  updated_at = now()
where slug = 'evosustain-evoford-servicios-it-software';
