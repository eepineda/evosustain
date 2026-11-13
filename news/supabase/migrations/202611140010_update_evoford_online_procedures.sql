-- Update EvoSustain / Evoford directory description to include online administrative support.
update public.directory_listings
set description='Consultora tecnológica con sede en el Reino Unido que desarrolla soluciones digitales y ofrece servicios profesionales de tecnología. Su área IT & Software incluye desarrollo de software a medida, aplicaciones, APIs e integraciones, paneles de control, automatización de procesos, soporte IT y consultoría tecnológica. También desarrolla una plataforma digital para la gestión de residuos y operaciones logísticas. Además, ayuda a particulares y empresas con trámites y gestiones online, ofreciendo acompañamiento digital para completar formularios, realizar solicitudes y utilizar servicios electrónicos. Atiende consultas de proyectos y servicios en Londres y otras zonas del Reino Unido.',
    services=array[
      'Desarrollo de software a medida',
      'Aplicaciones, APIs e integraciones',
      'Dashboards y automatización de procesos',
      'Soporte IT de primer y segundo nivel',
      'Gestión de incidencias y monitorización',
      'Consultoría tecnológica y arquitectura IT',
      'Soluciones digitales para residuos y logística',
      'Ayuda y acompañamiento en trámites online',
      'Asistencia con formularios, solicitudes y gestiones electrónicas'
    ],
    updated_at=now()
where slug='evosustain-evoford-servicios-it-software';
