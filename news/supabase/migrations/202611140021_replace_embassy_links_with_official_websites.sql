-- Sustituye enlaces genéricos por páginas oficiales de cada misión o cancillería.
-- Cuando no se ha podido confirmar una web propia de la misión en Londres,
-- se enlaza al directorio diplomático oficial del FCDO en lugar de inventar una URL.
-- Ejecutar en Supabase SQL Editor después de las migraciones 019 y 020.

update public.directory_listings set website='https://www.exteriores.gob.es/Embajadas/LONDRES/es/Paginas/index.aspx', updated_at=now()
where slug='embajada-consulado-espana';

update public.directory_listings set website='https://www.exteriores.gob.es/Consulados/londres/es/Paginas/index.aspx', updated_at=now()
where slug='consulado-general-espana-londres';

update public.directory_listings set website='https://gbr.mirex.gob.do/', updated_at=now()
where slug='embajada-consulado-republica-dominicana';

update public.directory_listings set website='https://consulmex.sre.gob.mx/reinounido/', updated_at=now()
where slug='embajada-consulado-mexico';

update public.directory_listings set website='https://www.minex.gob.gt/detalle_sede/57', updated_at=now()
where slug='embajada-consulado-guatemala';

update public.directory_listings set website='https://hondurasembassyuk.com/', updated_at=now()
where slug='embajada-consulado-honduras';

update public.directory_listings set website='https://www.embajadaelsalvador.org/pages/embajadas-y-consulados/reino-unido.php', updated_at=now()
where slug='embajada-consulado-el-salvador';

update public.directory_listings set website='https://www.gov.uk/government/publications/foreign-embassies-in-the-uk', updated_at=now()
where slug='embajada-consulado-nicaragua';

update public.directory_listings set website='https://www.costaricanembassy.co.uk/', updated_at=now()
where slug='embajada-consulado-costa-rica';

update public.directory_listings set website='https://mire.gob.pa/ministerio/embajada-y-consulado/londres/', updated_at=now()
where slug='embajada-consulado-panama';

update public.directory_listings set website='https://reinounido.embajada.gov.co/', updated_at=now()
where slug='embajada-consulado-colombia';

update public.directory_listings set website='https://londres.consulado.gov.co/', updated_at=now()
where slug='consulado-colombia-londres';

update public.directory_listings set website='http://reinounido.embajada.gob.ve/', updated_at=now()
where slug='embajada-consulado-venezuela';

update public.directory_listings set website='https://www.cancilleria.gob.ec/londres/', updated_at=now()
where slug='embajada-consulado-ecuador';

update public.directory_listings set website='https://www.cancilleria.gob.ec/londres/', updated_at=now()
where slug='consulado-ecuador-londres';

update public.directory_listings set website='https://www.gob.pe/institucion/embajada-del-peru-en-reino-unido', updated_at=now()
where slug='embajada-consulado-peru';

update public.directory_listings set website='https://www.consulado.pe/es/londres/paginas/inicio.aspx', updated_at=now()
where slug='consulado-peru-londres';

update public.directory_listings set website='https://embajadas.cancilleria.gob.bo/londres/contactos/', updated_at=now()
where slug='embajada-consulado-bolivia';

update public.directory_listings set website='https://www.minrel.gob.cl/europa/reino-unido', updated_at=now()
where slug='embajada-consulado-chile';

update public.directory_listings set website='https://eruni.cancilleria.gob.ar/', updated_at=now()
where slug='embajada-consulado-argentina';

update public.directory_listings set website='https://clond.cancilleria.gob.ar/', updated_at=now()
where slug='consulado-argentina-londres';

update public.directory_listings set website='https://www.gov.uk/government/publications/foreign-embassies-in-the-uk', updated_at=now()
where slug='embajada-consulado-uruguay';

update public.directory_listings set website='https://www.mre.gov.py/embapar-reino-unido/', updated_at=now()
where slug='embajada-consulado-paraguay';

update public.directory_listings set website='https://misiones.cubaminrex.cu/es/reino-unido', updated_at=now()
where slug='embajada-consulado-cuba';
