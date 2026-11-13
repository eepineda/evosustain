-- Actualiza la ficha de EvoSustain – Evoford con la oferta integral de servicios.
-- Ejecutar en Supabase SQL Editor después de las migraciones anteriores.

update public.directory_listings
set
  category = 'Servicios profesionales',
  description = 'EvoSustain – Evoford ofrece servicios integrales de tecnología, digitalización y apoyo a particulares, autónomos, emprendedores y pequeñas y medianas empresas. Creamos páginas web personales y corporativas, tiendas online y plataformas digitales; diseñamos identidad e imagen corporativa y apoyamos la creación y gestión de perfiles y contenidos para redes sociales. Ayudamos a las empresas a implantar, configurar y gestionar sistemas CRM y ERP, organizar sus operaciones, digitalizar tareas y automatizar procesos. Desarrollamos software, aplicaciones, APIs, integraciones, cuadros de mando y sistemas a medida, incluidos sistemas de scoring y evaluación de perfiles. También instalamos, configuramos y mantenemos ordenadores, redes, correo electrónico, aplicaciones y herramientas de trabajo, con soporte técnico y mantenimiento. Ofrecemos orientación y acompañamiento para organizar deudas, ordenar pagos, revisar alternativas de alivio y conocer recursos de ayuda disponibles; no prestamos asesoramiento financiero regulado ni negociamos en nombre del cliente. Ayudamos con la puesta en marcha y organización digital de negocios y con trámites y procedimientos online disponibles en Inglaterra, especialmente en Londres. El acompañamiento en trámites se limita a Inglaterra; los servicios tecnológicos y digitales están disponibles en Londres y otras zonas del Reino Unido.',
  services = array[
    'Creación de páginas web personales y para empresas',
    'Tiendas online y plataformas digitales',
    'Diseño de logotipos e identidad e imagen corporativa',
    'Creación y gestión de redes sociales y contenidos',
    'Implantación, configuración y gestión de CRM y ERP',
    'Organización y digitalización de pequeñas y medianas empresas',
    'Automatización de tareas y procesos empresariales',
    'Desarrollo de software, aplicaciones, APIs e integraciones',
    'Sistemas de scoring y evaluación de perfiles',
    'Instalación, configuración y mantenimiento de equipos informáticos',
    'Configuración de redes, correo electrónico y herramientas de trabajo',
    'Soporte técnico y mantenimiento IT',
    'Orientación para reorganizar deudas y pagos y explorar alternativas de alivio',
    'Acompañamiento en trámites y gestiones digitales disponibles en Inglaterra'
  ],
  updated_at = now()
where slug = 'evosustain-evoford-servicios-it-software';
