# EVOFORD JOURNAL — Professional Editorial System

## 1. Publicación manual sencilla
1. Abre `admin.html` en el navegador.
2. Crea la noticia.
3. Pulsa **Exportar posts.json**.
4. Reemplaza `data/posts.json`.
5. Ejecuta `BUILD_JOURNAL.bat`.
6. Sube los cambios a GitHub.

## 2. Automatización
`scripts/fetch_feeds.py` lee los RSS configurados en `data/feeds.json`. Actualmente se incluye Diario Libre porque publica canales RSS oficiales. Las páginas institucionales que no ofrecen un RSS configurado quedan como fuentes de referencia y no se fuerzan mediante scraping.

GitHub Actions ejecuta el proceso automáticamente cada 3 horas y también cuando haces push.

## 3. GitHub Pages
En GitHub: Settings → Pages → Source: GitHub Actions. El workflow `journal.yml` construye y publica `dist`.

## 4. Fuentes
- `data/sources.json`: directorio de fuentes.
- `data/feeds.json`: fuentes que pueden ingerirse automáticamente.
- Las piezas externas se etiquetan como OFICIAL o PRENSA y conservan el enlace al original.

## 5. Imágenes
Puedes usar una URL pública en `image`. Para máxima estabilidad, coloca tus propias imágenes en `content/images/` y adapta la ruta en el post. No copies fotografías de terceros sin comprobar derechos de uso.

## 6. App
La web incluye manifest y service worker. En Android/Chrome se puede instalar como aplicación desde el menú del navegador. Para iPhone/iPad se puede añadir a la pantalla de inicio desde Safari.

## 7. Sin backend
El sistema está diseñado para arrancar sin servidor ni base de datos. GitHub es el repositorio, JSON es el contenido y GitHub Actions es el automatizador.
