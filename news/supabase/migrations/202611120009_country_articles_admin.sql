-- Evoford News: migrate the UK and Dominican country articles into the editable articles table.
-- Run this in Supabase SQL Editor. The records will then appear in the admin panel
-- and can be edited, unpublished, rejected, or permanently deleted there.
-- Spain's country stories are already loaded dynamically from the articles table.

insert into public.articles
  (title, slug, category, author, summary, content, country, region, language,
   summary_en, content_en, source_title, source_url, status, updated_at)
values
(
  'La economía británica crece un 0,7 % en el tercer trimestre, con impulso de la tecnología',
  'reino-unido-crecimiento-tercer-trimestre-2026',
  'Economía',
  'Evoford News',
  'El PIB avanzó entre julio y septiembre, impulsado en parte por la demanda de inteligencia artificial y servicios en la nube, mientras la inflación mantiene la presión sobre los hogares.',
  $uk$La economía del Reino Unido avanzó un 0,7 % durante el tercer trimestre de 2026, por encima del crecimiento revisado del 0,5 % registrado en el trimestre anterior. El dato, publicado por la Oficina Nacional de Estadística (ONS), apunta a una actividad más dinámica entre julio y septiembre, aunque no elimina las presiones que siguen afectando a hogares y empresas.

La actividad digital gana peso

La demanda vinculada a la inteligencia artificial y los servicios en la nube contribuyó al impulso de las actividades informáticas. También destacó el crecimiento de la producción manufacturera en el periodo de tres meses, con avances en productos informáticos, electrónicos y ópticos. La construcción, en cambio, registró una contracción.

El coste de vida sigue condicionando el panorama

El crecimiento convive con una inflación que se situó en el 3,5 % en septiembre y con mayores costes energéticos. El Banco de Inglaterra elevó recientemente su tipo de referencia al 4 %, en un intento de contener las presiones sobre los precios. Unos tipos más altos pueden encarecer hipotecas y financiación, por lo que la evolución de los salarios y de la energía seguirá siendo determinante para las familias.

Una recuperación que aún debe consolidarse

El dato trimestral ofrece una señal positiva para la economía británica, pero no garantiza una aceleración sostenida. La inversión tecnológica puede mejorar la productividad, mientras que la inflación, los costes laborales y la incertidumbre internacional representan riesgos para los próximos meses. La clave estará en comprobar si el crecimiento se extiende a más sectores y llega de forma tangible al empleo y al poder adquisitivo.

Qué observar: las próximas cifras de inflación, la evolución del mercado laboral y las decisiones del Banco de Inglaterra permitirán medir si el avance del tercer trimestre tiene continuidad.$uk$,
  'Reino Unido',
  'Europa',
  'es',
  '',
  '',
  'Euronews · datos de la ONS',
  'https://es.euronews.com/2026/11/12/la-economia-del-reino-unido-crece-un-07-en-el-tercer-trimestre-impulsada-por-la-demanda-de',
  'published',
  now()
),
(
  'Fitch eleva la calificación de República Dominicana a BB y mantiene perspectiva estable',
  'republica-dominicana-calificacion-fitch-bb-2026',
  'Economía',
  'Evoford News',
  'La mejora reconoce la fortaleza de los fundamentos macroeconómicos y acompaña una previsión de crecimiento del 4,5 % para 2026, según el Gobierno.',
  $do$La agencia Fitch Ratings elevó la calificación crediticia soberana de largo plazo de la República Dominicana de BB- a BB, con perspectiva estable, según informó el Gobierno dominicano el 3 de noviembre. La decisión supone una mejora en la evaluación del riesgo de crédito del país y reconoce la solidez de sus fundamentos macroeconómicos, de acuerdo con el comunicado oficial.

Mejora de la perspectiva económica

La información difundida por la Presidencia señala que Fitch revisó al alza su previsión de crecimiento para la economía dominicana en 2026, desde el 3,5 % hasta el 4,5 %. Esa proyección supera la mediana del 3,5 % que la agencia atribuye a economías con calificación BB.

Qué significa una calificación BB

Una mejora de la nota soberana puede favorecer la percepción de los inversores sobre la capacidad de un país para cumplir sus obligaciones financieras. También puede contribuir a mejorar las condiciones de acceso a los mercados, aunque no implica automáticamente una reducción inmediata del coste de la deuda ni garantiza nuevas inversiones.

El reto: convertir confianza en resultados

La perspectiva estable indica que Fitch no anticipa, en su escenario de referencia, un cambio inmediato de la calificación. Para sostener la confianza serán importantes la disciplina fiscal, la evolución de la deuda pública, la estabilidad monetaria y la capacidad de mantener el crecimiento en un entorno internacional complejo.

Para empresas y hogares, el indicador más relevante será comprobar si la mejora de la percepción financiera se traduce en inversión productiva, empleo y oportunidades económicas. La calificación es una señal positiva, pero sus beneficios dependerán de la continuidad de las políticas y de los resultados concretos.$do$,
  'República Dominicana',
  'América Latina',
  'es',
  '',
  '',
  'Presidencia de la República Dominicana',
  'https://presidencia.gob.do/noticias/fitch-ratings-eleva-la-calificacion-crediticia-de-la-republica-dominicana-bb-con',
  'published',
  now()
)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  author = excluded.author,
  summary = excluded.summary,
  content = excluded.content,
  country = excluded.country,
  region = excluded.region,
  language = excluded.language,
  source_title = excluded.source_title,
  source_url = excluded.source_url,
  status = 'published',
  updated_at = now();

-- Verify the migrated publications:
select title, country, status
from public.articles
where slug in (
  'reino-unido-crecimiento-tercer-trimestre-2026',
  'republica-dominicana-calificacion-fitch-bb-2026'
)
order by country;
