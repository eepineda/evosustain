# Propuesta de evolución de Evoford News
## Estilo Modern · Alcance All

**Rama:** `feat/evoford-modern-all-proposal`  
**Base:** `main`  
**Estado:** propuesta funcional y visual para revisión. No sustituye ni modifica la portada publicada.

## 1. Objetivo

Evolucionar Evoford News hacia un medio digital moderno, rápido y claro, con una experiencia editorial coherente en escritorio y móvil. El alcance incluye toda la portada y sus recorridos, pero la ejecución debe ser incremental y conservar las funciones, integraciones, datos y URL existentes.

La identidad debe seguir siendo Evoford News: medio de comunicación nacido en Londres, con vocación europea y conexión con República Dominicana y su diáspora. No reducir su posicionamiento a un periódico exclusivamente periodístico.

## 2. Principios que no se negocian

- No modificar `main` durante el diseño, desarrollo ni validación.
- No eliminar ni renombrar rutas públicas, páginas, parámetros de artículos o enlaces existentes.
- No cambiar el esquema de Supabase, sus políticas RLS, autenticación, tablas ni funciones de servidor como parte del rediseño visual.
- No trasladar claves privilegiadas al navegador. La clave publishable existente no debe confundirse con una clave secreta.
- No sustituir la lógica de carga editorial por contenido de demostración ni datos inventados.
- No ocultar, retirar ni degradar publicidad, directorio, envíos, opinión, edición impresa, selector ES/EN o acceso editorial.
- No desplegar en producción desde esta rama. Cualquier publicación requiere revisión y aprobación expresa.

## 3. Inventario de funciones que deben conservarse

La portada actual contiene o integra los siguientes elementos, que deben seguir funcionando:

1. Navegación del ecosistema Evoford y navegación por secciones.
2. Portada dinámica conectada a Supabase: noticia destacada, últimas publicaciones, feeds por sección y opinión.
3. Cobertura por Reino Unido, República Dominicana y España.
4. Selector de idioma español/inglés y persistencia en `localStorage` mediante `evoford-news-language`.
5. Indicadores financieros de TradingView y su aviso de posible retraso.
6. Espacios de publicidad y carga desde `assets/ads.js`.
7. Enlaces a Política, Startups e innovación, Aula de Innovación, Directorio y envío de noticias.
8. Acceso al panel editorial y sus flujos de autenticación y gestión.
9. Páginas individuales de artículos y sus parámetros URL.
10. Edición impresa, selección de formato, actualización e impresión/guardado PDF.
11. Espacio de opinión con autoría identificada.
12. Páginas públicas y formularios ya existentes.

Este inventario se debe ampliar al revisar las páginas enlazadas, el panel, los scripts compartidos y los flujos de Supabase antes de implementar cambios.

## 4. Propuesta de experiencia Modern

### 4.1 Cabecera y navegación

- Cabecera compacta y adaptable, con marca Evoford News claramente reconocible.
- Navegación principal más corta visualmente, con jerarquía clara y desplazamiento horizontal accesible en pantallas pequeñas si fuera necesario.
- Mantener los enlaces existentes; no convertir enlaces funcionales en elementos decorativos.
- Acciones ES/EN y edición impresa agrupadas en una zona utilitaria visible.
- Mantener el enlace al ecosistema Evoford sin competir visualmente con la marca editorial.

### 4.2 Portada y noticia principal

- Composición editorial moderna con una noticia principal dominante, imagen de proporción consistente, categoría, titular, entradilla, autor y fecha.
- Dos o tres noticias secundarias con jerarquía visual menor.
- Área de últimas noticias legible y escaneable.
- Estados de carga, ausencia de artículos y error de conexión diseñados explícitamente; no mostrar contenido ficticio como si estuviera publicado.
- Respetar el orden y los datos que entregue la lógica editorial actual.

### 4.3 Cobertura internacional

- Presentar Reino Unido, República Dominicana y España como ejes de cobertura.
- Tarjetas compactas con titulares reales etiquetados por país.
- Mantener los anclajes `#country-uk`, `#country-do` y `#country-es` y la carga dinámica actual.
- No mostrar bloques vacíos como si fueran cobertura disponible; conservar el mensaje de ausencia de artículos.

### 4.4 Secciones y lectura

- Separar visualmente actualidad, economía, seguridad, startups e innovación, opinión y análisis.
- Usar tarjetas de lectura rápida con categoría, titular, resumen y metadatos.
- Diferenciar de forma visible noticia, análisis, opinión y contenido patrocinado cuando el dato exista.
- Mejorar la lectura en móvil, el ancho de línea, el contraste y el espacio entre bloques.

### 4.5 Publicidad

- Mantener los identificadores de slots y el mecanismo de `assets/ads.js`.
- Diferenciar publicidad de contenido editorial con etiquetas claras.
- Definir tamaños responsivos que no provoquen saltos grandes de contenido.
- No introducir anuncios nuevos ni alterar acuerdos comerciales sin autorización.

### 4.6 Opinión y colaboradores expertos

- Mantener el espacio de opinión existente y su autoría.
- Preparar una presentación escalable para perfiles de colaboradores y expertos en startups, innovación, tecnología, economía, educación y relaciones Europa–República Dominicana.
- La recepción, revisión y publicación de colaboraciones debe integrarse con el flujo editorial existente; no publicar automáticamente envíos externos.
- Distinguir claramente opinión y contenido patrocinado de la información.

### 4.7 Pie de página y navegación secundaria

- Pie más compacto, con enlaces claros a publicidad, acceso editorial y secciones esenciales.
- Mantener destinos y rutas existentes.
- Añadir enlaces nuevos solo cuando la página de destino esté implementada y verificada.

## 5. Dirección visual

- Sistema visual digital, limpio y sobrio; evitar reproducir literalmente la estética de un periódico impreso.
- Paleta basada en el azul institucional actual, fondos claros, texto de alto contraste y un color de acento reservado para categorías o estados.
- Tipografía sans serif para interfaz y lectura; reservar una serif editorial para titulares destacados si mejora la jerarquía.
- Tarjetas con bordes discretos, radios moderados y espaciado consistente.
- Movimiento mínimo y funcional; respetar `prefers-reduced-motion`.
- Estados de foco visibles, navegación por teclado y etiquetas semánticas.
- Diseño responsive validado, como mínimo, en 360 px, 768 px, 1024 px y escritorio amplio.

## 6. Arquitectura y estrategia de implementación

La arquitectura documentada en `news/ARCHITECTURE.md` se mantiene como referencia:

- Presentación: HTML semántico y componentes compartidos.
- Diseño: tokens de `assets/news-core.css`.
- Núcleo cliente: idioma, persistencia y eventos de `assets/news-core.js`.
- Datos y autenticación: Supabase.
- Funciones de servidor: Edge Functions existentes.

Orden recomendado:

**Fase 0 — Auditoría funcional**
- Revisar todas las páginas enlazadas desde la portada, artículos, panel editorial, directorio, envío de noticias, publicidad y edición impresa.
- Registrar selectores, IDs, clases, atributos `data-*`, parámetros URL y eventos que consumen los scripts.
- Crear una matriz de pruebas antes de cambiar HTML o CSS.

**Fase 1 — Sistema visual y portada**
- Definir tokens y componentes sin duplicar estilos ya disponibles.
- Reorganizar la portada y sus bloques manteniendo los IDs y contratos usados por `site.js` y `ads.js`.
- No reescribir consultas ni lógica de Supabase para conseguir cambios visuales.

**Fase 2 — Experiencia de lectura**
- Revisar páginas individuales de artículos, metadatos, compartir, impresión y artículos relacionados.
- Corregir los problemas de impresión identificados en páginas individuales sin alterar la edición impresa general.

**Fase 3 — Directorio, envío y colaboradores**
- Mejorar presentación y claridad de formularios sin cambiar sus destinos, validaciones ni almacenamiento.
- Diseñar la propuesta de colaboradores expertos conectada a revisión editorial.

**Fase 4 — Panel editorial y publicidad**
- Mejorar la interfaz del panel solo después de auditar sus permisos, autenticación y operaciones.
- Mantener campañas, slots y solicitudes comerciales existentes.

**Fase 5 — Validación**
- Ejecutar pruebas automatizadas y pruebas manuales de extremo a extremo.
- Comparar rutas, formularios, datos, idiomas, impresión, anuncios y acceso editorial con la versión base.

## 7. Matriz mínima de aceptación

| Área | Criterio para aprobar |
|---|---|
| Git | Todos los cambios permanecen en esta rama; `main` no recibe commits |
| URLs | Las rutas y parámetros de artículos siguen abriendo el mismo contenido |
| Supabase | La portada carga artículos publicados y conserva estados vacíos y errores |
| Idiomas | ES/EN funciona y conserva la preferencia tras recargar |
| Países | Los tres bloques conservan sus anclajes y muestran los datos reales |
| Publicidad | Los slots actuales siguen resolviéndose y se identifican como publicidad |
| Directorio | Página, fichas y formulario siguen accesibles y operativos |
| Envíos | El formulario mantiene validación, envío y confirmación |
| Panel | Inicio de sesión, permisos y acciones editoriales no se degradan |
| Artículos | Los enlaces, imágenes, metadatos y navegación siguen funcionando |
| Impresión | La portada y las páginas individuales imprimen correctamente; PDF conserva el formato |
| Accesibilidad | Teclado, foco, contraste, etiquetas y móvil se pueden utilizar |
| Responsive | Sin desbordamientos ni controles inaccesibles en anchos de prueba |

## 8. Comprobaciones técnicas

- Ejecutar `node --test news/assets/news-core.test.js` con Node.js 18 o posterior.
- Revisar consola y red del navegador: errores JavaScript, peticiones fallidas y recursos bloqueados.
- Comprobar que no se introducen secretos ni claves privilegiadas en archivos públicos.
- Verificar que los IDs consumidos por los scripts no desaparecen ni se duplican.
- Probar cada formulario con envío válido e inválido, sin generar datos de prueba en producción.
- Probar impresión en páginas individuales y en `news/edicion.html`.
- Revisar cambios de accesibilidad y rendimiento en móvil.

## 9. Fuera de alcance hasta aprobación

- Fusionar la rama en `main`.
- Desplegar la nueva portada en producción.
- Cambiar DNS, configuración de hosting o workflows.
- Modificar esquema, políticas, autenticación o datos de Supabase.
- Eliminar páginas antiguas, rutas, scripts o estilos compartidos.
- Activar nuevas campañas publicitarias o publicar colaboraciones automáticamente.

## 10. Resultado esperado

Una experiencia Evoford News moderna y coherente en todo el recorrido, con una portada más clara y una lectura más cómoda, sin sacrificar el carácter de medio de comunicación, la cobertura Londres–Europa–República Dominicana ni las herramientas que ya utiliza el sitio.

**Condición de entrega:** la propuesta solo podrá considerarse lista para producción cuando la matriz de aceptación esté verificada y los cambios hayan sido revisados. Esta rama es un espacio aislado de propuesta; no autoriza su publicación ni su fusión.
