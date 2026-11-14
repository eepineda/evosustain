# Plan de reversión y control de cambios · Evoford News

**Rama de trabajo:** `feat/evoford-modern-all-proposal`  
**Rama de referencia intacta:** `main`  
**Copia de seguridad creada:** `backup/evoford-modern-before-editorial-expansion-20261114`  
**Commit de la copia:** `87582577abcd412a506294b679b5777c3f045872`

## 1. Regla de seguridad

No se trabaja directamente sobre `main`. Toda mejora se desarrolla en la rama de propuesta. La rama de copia de seguridad conserva el estado anterior a la ampliación editorial y a los últimos ajustes de idioma.

No se debe borrar la copia de seguridad hasta que la versión nueva haya superado las pruebas funcionales y el responsable del sitio haya autorizado expresamente su publicación.

## 2. Qué se ha preservado

Los cambios de esta fase son de documentación y presentación/idioma:
- Documento rector de identidad editorial.
- Preferencia de idioma en páginas de artículo.
- Presentación de titulares y resúmenes en inglés en las páginas de Política y Startups cuando existen campos traducidos.
- Etiquetas de sección en inglés en la edición impresa.
- No se han ejecutado migraciones de base de datos.
- No se han cambiado políticas RLS, autenticación, roles, permisos ni claves.
- No se han eliminado páginas, rutas, formularios ni funciones existentes.

## 3. Cómo volver atrás

### Reversión completa de esta fase
Si los cambios introducidos después del commit de copia causan fallos, la rama de trabajo puede compararse con:

`backup/evoford-modern-before-editorial-expansion-20261114`

La reversión debe hacerse mediante commits de reversión de los cambios posteriores al punto de copia, no borrando el historial. Así se conserva la trazabilidad y se puede recuperar la mejora más adelante.

### Reversión selectiva
Si el problema está limitado a una página o script:
1. Identificar el archivo afectado.
2. Recuperar su versión desde la rama de copia de seguridad.
3. Restaurarlo en la rama de trabajo mediante un nuevo commit.
4. Volver a probar la página afectada y sus enlaces relacionados.

### Si una versión llega a producción en el futuro
No desplegar directamente desde una rama de pruebas. Antes de publicar, crear un punto de liberación identificado y conservar el commit anterior. Si la publicación falla, restaurar el commit estable anterior y comprobar portada, artículos, formularios, directorio, edición impresa y acceso editorial.

## 4. Puertas de control antes de publicar

- [ ] Portada carga noticias y secciones sin errores.
- [ ] Artículos abren en el idioma guardado y permiten cambiarlo manualmente.
- [ ] Los artículos sin traducción avisan de forma clara y muestran el original.
- [ ] Política y Startups muestran campos ingleses cuando existen y hacen fallback al original.
- [ ] Directorio, formularios y Aula conservan sus envíos y filtros.
- [ ] Publicidad conserva solicitudes, campañas y enlaces.
- [ ] La edición impresa carga, cambia de idioma e imprime.
- [ ] Panel editorial permite iniciar sesión y completar los flujos actuales.
- [ ] No hay errores de JavaScript en consola.
- [ ] Pruebas en móvil y escritorio.
- [ ] Comparación final con `main`: cero commits de diferencia hacia atrás y ningún cambio accidental en producción.
- [ ] Aprobación expresa antes de fusionar o desplegar.

## 5. Límites de esta reversión

La copia de seguridad protege el código de la rama, no sustituye una copia de seguridad de Supabase ni de los archivos subidos. Cualquier cambio futuro de base de datos o almacenamiento requiere un plan de migración y restauración independiente, además de aprobación previa.

## 6. Estado de validación

La existencia de la rama de copia está confirmada. Los cambios recientes aún requieren pruebas automatizadas y revisión en navegador. Hasta completar esas comprobaciones, esta rama debe considerarse una propuesta de trabajo, no una versión lista para producción.
