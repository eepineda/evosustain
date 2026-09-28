# Evoford Journal — Entregable profesional

## Abrir localmente
Desde la carpeta del proyecto:

`python -m http.server 8080 --directory dist`

Abrir `http://localhost:8080/`.

## CMS
`python -m http.server 8081`

Abrir `http://localhost:8081/admin/`.

## Publicar
Editar `data/posts.json`, ejecutar `python scripts/build_site.py` y publicar `dist/`.

## Características
- Diseño editorial responsive
- Laptop y mobile
- Portada
- Artículos
- Briefing de fuentes oficiales
- Fuentes
- PWA
- CMS local
- Arquitectura sin backend
