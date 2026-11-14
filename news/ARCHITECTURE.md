# Evoford News — arquitectura compartida

## Objetivo

Evolucionar Evoford News hacia una plataforma editorial modular sin interrumpir las páginas públicas ni perder enlaces existentes.

## Capas

- **Presentación:** HTML semántico y componentes visuales compartidos.
- **Diseño:** `assets/news-core.css` define tokens de color, espaciado, superficies, anchuras de lectura y foco accesible.
- **Núcleo de cliente:** `assets/news-core.js` gestiona idioma compartido, persistencia local y eventos de cambio.
- **Datos y autenticación:** Supabase conserva artículos, traducciones, fuentes RSS, envíos, comentarios y directorio.
- **Funciones de servidor:** Edge Functions para ingestión RSS y asistencia editorial.

## Reglas de migración

1. Mantener las URL públicas y los parámetros de artículo existentes.
2. Migrar una sección cada vez y comprobar sus funciones antes de cambiar el tráfico.
3. No guardar HTML, CSS o JavaScript de presentación en tablas SQL.
4. No trasladar claves privilegiadas al navegador.
5. No modificar políticas de acceso ni autenticación como parte de una migración visual.
6. No retirar páginas antiguas hasta verificar la nueva ruta equivalente.

## Idiomas

El idioma elegido se guarda en `localStorage` bajo `evoford-news-language`. El núcleo expone `window.EvofordNews`, con `language`, `setLanguage`, `translate`, `apply` y `onLanguageChange`. Los textos editoriales traducidos deben revisarse antes de publicar.

## Pruebas del núcleo

Con Node.js 18 o posterior:

```bash
node --test news/assets/news-core.test.js
```

Las pruebas no requieren dependencias externas.


## Aplicación móvil web (PWA)

La portada de Evoford News incorpora una PWA bajo el alcance `/news/`.

- `manifest.webmanifest`: nombre, identidad, pantalla de inicio y accesos directos.
- `sw.js`: precarga la carcasa pública, prioriza la red para las páginas y ofrece una página offline si no hay conexión.
- `assets/pwa.js`: registra el service worker y gestiona la instalación en navegadores compatibles, además de las instrucciones para iOS.
- `offline.html`: mensaje de recuperación cuando no hay conexión.

### Límites de caché y seguridad

- No se cachean peticiones POST, Supabase, autenticación, panel editorial ni rutas administrativas.
- Los artículos y datos editoriales siguen dependiendo de la conexión; no se promete lectura offline de contenido dinámico.
- El service worker solo controla `/news/`, no el resto del ecosistema Evoford.
- Al publicar cambios importantes de la carcasa, incrementar la versión de caché en `sw.js` para forzar una instalación limpia de los recursos estáticos.
