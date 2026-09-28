# FAO · República Dominicana — Live Briefing

The briefing is now non-empty by design.

## Two layers

1. **Verified seed** — official FAO/FAO Dominican Republic links already present in `data/briefing_seed.json`. This prevents a blank block on first deployment.
2. **Automatic refresh** — `scripts/build_site.py` queries the configured feeds every scheduled GitHub Actions run and merges new items ahead of the seed.

If a remote feed is temporarily unavailable, the verified items remain visible.

Current verified seed sources include:
- FAO in República Dominicana.
- FAO Red SPAA.
- FAO Resource Partners / Dominican Republic.

The homepage links readers to the original official source rather than presenting copied full articles.
