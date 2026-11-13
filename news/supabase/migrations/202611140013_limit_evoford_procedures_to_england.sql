-- Clarify geographic scope of Evoford's online administrative support:
-- digital procedures are offered for England, with local focus on London.
update public.directory_listings
set description='EvoSustain – Evoford ofrece un servicio integral de tecnología, digitalización y acompañamiento para particulares, autónomos, emprendedores y empresas. Ayudamos desde el inicio de una actividad: orientación práctica para poner en marcha un negocio, organizar sus primeros pasos y realizar trámites y gestiones digitales en Inglaterra, con especial atención a Londres. Apoyamos al cliente en el uso de servicios públicos y privados online, la cumplimentación de formularios, solicitudes, citas y procedimientos electrónicos disponibles en Inglaterra. Preparamos su presencia profesional en internet mediante diseño y creación de páginas web, dominios, correo corporativo, tiendas online, perfiles y contenidos para redes sociales, diseño gráfico e identidad visual. Instalamos, configuramos y mantenemos ordenadores, redes, sistemas, aplicaciones y herramientas de trabajo; ofrecemos soporte técnico, mantenimiento preventivo y resolución de incidencias para usuarios individuales y equipos de empresa. También ayudamos a estructurar y organizar negocios, digitalizar tareas, implantar herramientas de gestión, mejorar procesos y automatizar operaciones. Desarrollamos software a medida, aplicaciones, APIs, integraciones, paneles de control y soluciones digitales, incluidas plataformas para residuos y logística. Acompañamos al cliente desde la planificación y puesta en marcha hasta el mantenimiento y evolución de sus herramientas digitales. En trámites legales, fiscales o regulados, ofrecemos apoyo digital y administrativo, sin sustituir al profesional autorizado cuando sea necesario. Servicios tecnológicos y de acompañamiento empresarial en Londres y otras zonas del Reino Unido; asistencia en trámites digitales limitada a Inglaterra.',
 services=array[
 'Orientación práctica para poner en marcha un negocio y organizar sus primeros pasos',
 'Acompañamiento en trámites y gestiones digitales disponibles en Inglaterra, con especial atención a Londres',
 'Ayuda para utilizar servicios públicos y privados online en Inglaterra',
 'Asistencia para cumplimentar formularios, solicitudes, citas y procedimientos electrónicos',
 'Diseño, creación, alojamiento y mantenimiento de páginas web',
 'Dominios, correo corporativo y configuración de presencia digital',
 'Tiendas online y soluciones de comercio electrónico',
 'Creación y optimización de perfiles profesionales en redes sociales',
 'Gestión de redes sociales, contenidos y comunicación digital',
 'Diseño gráfico, identidad visual y materiales corporativos',
 'Instalación, configuración y mantenimiento de ordenadores y equipos',
 'Instalación y mantenimiento de redes, sistemas y aplicaciones',
 'Soporte IT a particulares, autónomos, equipos y empresas',
 'Mantenimiento preventivo, resolución de incidencias y asistencia técnica',
 'Organización de procesos empresariales y digitalización del trabajo',
 'Implantación y configuración de herramientas de gestión y colaboración',
 'Automatización de tareas y procesos empresariales',
 'Desarrollo de software a medida, aplicaciones, APIs e integraciones',
 'Paneles de control y soluciones de gestión de datos',
 'Soluciones digitales para residuos y operaciones logísticas'
 ],
 updated_at=now()
where slug='evosustain-evoford-servicios-it-software';
