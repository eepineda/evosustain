-- Evoford News: actualizar únicamente la ficha de EvoSustain | Servicios IT
-- Sustituye el texto comercial anterior por el contenido solicitado.
-- Ejecutar en Supabase SQL Editor.

update public.directory_listings
set
  name = 'EvoSustain | Servicios IT',
  category = 'Servicios profesionales',
  description = 'Soluciones digitales a gran escala para particulares y empresas. Servicios: creación de páginas web y aplicaciones, tiendas online, imagen corporativa, redes sociales, gestión de CRM y ERP, desarrollo de software y formación.',
  services = array[
    'Creación de páginas web',
    'Desarrollo de aplicaciones',
    'Tiendas online',
    'Imagen corporativa',
    'Gestión de redes sociales',
    'Gestión e implantación de CRM y ERP',
    'Desarrollo de software',
    'Formación'
  ],
  updated_at = now()
where slug = 'evosustain-evoford-servicios-it-software';
