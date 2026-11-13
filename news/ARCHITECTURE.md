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
