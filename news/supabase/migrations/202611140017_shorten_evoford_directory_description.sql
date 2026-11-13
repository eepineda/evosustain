-- Actualiza únicamente la ficha pública de EvoSustain – Evoford con la descripción breve y los datos de contacto.
-- No modifica la lista interna de servicios ni otras fichas.
-- Ejecutar en Supabase SQL Editor.

update public.directory_listings
set
  name = 'EvoSustain - Evoford | Servicios IT',
  category = 'Servicios profesionales',
  description = 'Soluciones digitales para particulares y empresas: creación de webs y tiendas online, imagen corporativa, redes sociales, gestión de CRM y ERP, desarrollo de software, scoring, automatización y soporte informático. También ofrecemos ayuda para organizar deudas y pagos, y acompañamiento en trámites digitales en Inglaterra.',
  phone = '+44 7871 710697',
  email = 'info@evoford.com',
  website = 'https://evoford.com/index.html#it',
  opening_hours = 'Contactar para consultas y propuestas',
  updated_at = now()
where slug = 'evosustain-evoford-servicios-it-software';
