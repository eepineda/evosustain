# Evoford Journal — Premium Editorial Edition

Esta entrega parte de la arquitectura del proyecto `personalized-newspaper` que has proporcionado y la adapta a **Evoford Journal**. Mantiene Next.js + PostgreSQL + Drizzle + RSS + deduplicación + curación + scheduler, pero cambia la identidad y añade un flujo editorial propio.

## Qué puedes hacer

- `Front Page / Portada`: periódico responsive.
- `Settings / Configuración`: agregar, probar, activar y eliminar feeds RSS.
- `Sources / Fuentes`: directorio de fuentes institucionales y periodísticas.
- `Editorial Desk / Redacción`: crear y publicar una nota propia sin tocar código.
- RSS: las noticias externas entran automáticamente en las ejecuciones completas.
- Dedupe: evita repetir la misma URL.
- Curation: puntúa y clasifica artículos.
- Scheduler: mantiene el proceso automático si `ENABLE_SCHEDULER=true`.

## Instalación local

Requisitos: Node 20.9+, Docker Desktop y PostgreSQL.

```powershell
cd app
copy .env.example .env.local
docker compose up -d
npm ci
npm run db:push
npm run db:seed
npm run dev
```

Abrir `http://localhost:3000`.

## Añadir noticias automáticas

1. Abrir `/settings`.
2. Ir a **Feeds**.
3. Escribir nombre, URL RSS y sección.
4. Pulsar **Add**.
5. El servidor comprueba primero que el feed sea accesible.
6. Después `Refresh` ejecuta la ingestión.

Diario Libre documenta públicamente sus feeds RSS y ofrece feeds separados para portada, política, economía, mundo, planeta y deportes. La entrega incluye varios de esos feeds como punto de partida.

## Publicar una noticia propia

Abrir `/editor`. Introducir titular, resumen, sección y autor. La publicación se guarda como artículo editorial de Evoford y queda disponible en `/editorial/...`.

## Variables

`DATABASE_URL` es obligatoria. `ANTHROPIC_API_KEY` se usa para la curación automática del proyecto original. `FINNHUB_API_KEY` se mantiene para las funciones financieras heredadas. `ENABLE_SCHEDULER=true` mantiene el polling en segundo plano. `ADMIN_KEY` puede proteger operaciones mutables.

## GitHub / producción

Esta aplicación necesita un runtime Node y PostgreSQL; no es una web estática de GitHub Pages. Para producción utiliza un servicio compatible con Next.js y PostgreSQL (por ejemplo, Railway/Vercel + Postgres) y configura las variables de entorno.
