-- Ajusta el título y la descripción pública de EvoSustain – Evoford.
-- Ejecutar en Supabase SQL Editor después de las migraciones anteriores.

update public.directory_listings
set
  name = 'EvoSustain - Evoford | Servicios IT y desarrollo de software',
  category = 'Servicios profesionales',
  description = 'EvoSustain - Evoford ofrece servicios integrales de tecnología, digitalización y apoyo a particulares, autónomos, emprendedores y pequeñas y medianas empresas. Creamos páginas web personales y corporativas, tiendas online y plataformas digitales; diseñamos identidad e imagen corporativa y apoyamos la creación y gestión de perfiles y contenidos para redes sociales. Ayudamos a las empresas a implantar, configurar y gestionar sistemas CRM y ERP, organizar sus operaciones, digitalizar tareas y automatizar procesos. Desarrollamos software, aplicaciones, APIs, integraciones, cuadros de mando y sistemas a medida, incluidos sistemas de scoring y evaluación de perfiles. También instalamos, configuramos y mantenemos ordenadores, redes, correo electrónico, aplicaciones y herramientas de trabajo, con soporte técnico y mantenimiento. Ofrecemos orientación y acompañamiento para organizar deudas, ordenar pagos, revisar alternativas de alivio y conocer recursos de ayuda disponibles; no prestamos asesoramiento financiero regulado ni negociamos en nombre del cliente. Ayudamos con la puesta en marcha y organización digital de negocios y con trámites y procedimientos online disponibles en Inglaterra, especialmente en Londres. El acompañamiento en trámites se limita a Inglaterra; los servicios tecnológicos y digitales están disponibles en Londres y otras zonas del Reino Unido.',
  updated_at = now()
where slug = 'evosustain-evoford-servicios-it-software';
