# Evoford Journal — Robust Premium Edition

Esta versión mantiene el sitio estático y lo refuerza como newsroom/app:

- portada editorial densa y responsive para laptop + móvil;
- artículos con autor, tiempo de lectura, caption y crédito;
- búsqueda local sobre `data/articles.json`;
- ticker/briefing;
- sección Journal+ preparada para una futura pasarela de suscripción;
- PWA con manifest y service worker;
- RSS/Atom de terceros con deduplicación;
- feed RSS y sitemap propios;
- imágenes remotas públicas o locales;
- build reproducible desde `python scripts/build_site.py`.

La zona Journal+ es solamente interfaz/estructura editorial. Para cobros reales hay que conectar un proveedor de pagos y un sistema de identidad/suscripción.
