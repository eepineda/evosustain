-- Refine EvoSustain / Evoford's public directory profile with concrete service areas.
update public.directory_listings
set description='EvoSustain – Evoford es una consultora tecnológica con sede en el Reino Unido que ayuda a autónomos, emprendedores y empresas a crear, organizar y mejorar su actividad mediante tecnología y acompañamiento práctico. Diseña y desarrolla páginas web y soluciones digitales a medida; instala, configura y mantiene equipos, redes, sistemas y aplicaciones; y ofrece soporte IT continuado, desde la atención a incidencias hasta el mantenimiento de entornos con varios usuarios y sedes. También ayuda a realizar trámites digitales y gestiones online, completar formularios y presentar solicitudes. Acompaña a negocios en la organización de sus procesos, estructura operativa, herramientas digitales y presencia online. Sus servicios incluyen gestión y apoyo en redes sociales, diseño gráfico y digital, identidad visual y materiales de comunicación. Además, desarrolla soluciones de software, automatización, APIs, integraciones y plataformas para la gestión de residuos y operaciones logísticas. Atiende a clientes en Londres y otras zonas del Reino Unido.',
    services=array[
      'Diseño, creación y mantenimiento de páginas web',
      'Desarrollo de software y soluciones digitales a medida',
      'Instalación, configuración y mantenimiento de equipos y sistemas IT',
      'Instalación y soporte de redes, aplicaciones y herramientas de trabajo',
      'Soporte técnico continuo y gestión de incidencias para autónomos y empresas',
      'Soporte IT para equipos, múltiples usuarios y operaciones en crecimiento',
      'Trámites digitales, formularios y solicitudes online',
      'Organización de empresas, procesos y estructura operativa',
      'Acompañamiento digital a emprendedores y pequeños negocios',
      'Gestión y apoyo en redes sociales',
      'Diseño gráfico, diseño digital e identidad visual',
      'Automatización de procesos, APIs e integraciones',
      'Soluciones digitales para residuos y operaciones logísticas'
    ],
    updated_at=now()
where slug='evosustain-evoford-servicios-it-software';
