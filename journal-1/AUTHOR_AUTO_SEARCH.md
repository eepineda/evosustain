# Edwin Pineda Carrasco — búsqueda amplia automática

El archivo consulta Google News RSS con múltiples búsquedas y dominios, además de conservar publicaciones verificadas en `data/author_seed.json`.

Incluye consultas generales, por nombre completo, variantes de firma, dominios editoriales dominicanos y búsquedas históricas. Los resultados se deduplican por URL y se enlazan a la fuente original.

La verificación intenta abrir la página original y comprobar la firma. Si el medio bloquea el acceso automatizado, el resultado del feed se conserva para revisión, evitando perder publicaciones legítimas.

No se copian automáticamente artículos completos de terceros.
