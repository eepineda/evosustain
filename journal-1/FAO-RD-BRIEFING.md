# FAO · República Dominicana — Automatic Briefing

The homepage includes a dedicated official-source briefing.

Sources:
1. FAO newsroom in Spanish.
2. FAO in República Dominicana (filtered through a free RSS search feed to the official domain).
3. Presidencia de la República Dominicana (filtered through a free RSS search feed to the official domain).

Workflow:
- GitHub Actions runs every 3 hours.
- `scripts/build_site.py` refreshes `data/briefing.json`.
- The homepage reads that file and renders the latest official updates.
- Each item links to the original source.
- The section is separate from the main editorial feed so official updates do not flood the front page.

Important editorial rule:
The free version does not invent or rewrite facts. Its “resumen” uses the source's own published summary/excerpt. A true AI-generated synthesis can be added later with an AI API, but that requires a service/key and should be clearly labeled as an Evoford editorial summary.
