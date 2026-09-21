# Publicar una nota — método sencillo

No hay panel de administración ni base de datos.

## Para publicar
1. En GitHub entra a la carpeta `content/`.
2. Pulsa **Add file → Upload files**.
3. Sube un archivo `.md` siguiendo el ejemplo `01-ejemplo.md`.
4. Si tienes una imagen, súbela a `assets/` y escribe su ruta en `image:`.
5. Pulsa **Commit changes**.
6. GitHub Actions actualiza automáticamente `data/articles.json`.
7. GitHub Pages publica la nota.

## Formato mínimo

```yaml
---
title: "Título"
category: "Sustainability"
date: "2026-09-19"
excerpt: "Resumen breve."
source: "Evoford Journal"
image: "assets/green.svg"
url: ""
---
```

Después del segundo `---` va el texto de la nota.

Categorías recomendadas:
- Sustainability
- Technology
- Smart Cities
- Waste & Operations
- Perspective
- News

## Para no complicarse
Puedes duplicar `content/01-ejemplo.md`, cambiar 5 campos y subirlo.

No hace falta tocar HTML, CSS, JavaScript ni una base de datos.
