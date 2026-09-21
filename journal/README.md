# Evoford Journal - Full Automation

## Publish
Write -> upload -> automatically published.

Use `publicar.html` to create a Markdown note, then upload the file to `content/`.

GitHub Actions automatically:
- builds the article page
- updates the homepage data
- creates search data
- creates RSS
- creates sitemap
- deploys GitHub Pages

## Automatic news
Add RSS/Atom sources in `data/sources.json` and set `enabled` to true.

Every 3 hours the workflow checks enabled feeds, imports headline/excerpt/date/source/link, removes duplicates and rebuilds the site.

## Generated SEO/distribution
- permanent article pages
- canonical URLs
- Open Graph metadata
- RSS feed
- XML sitemap
- search index

No database, backend or paid API is required.

Production URL is configured in `config.json`:
https://evoford.com/journal/

For third-party sources, use headline/excerpt + link rather than copying full articles.

## Robust Windows build

From the `journal` folder:

```powershell
python .\scripts\build_site.py
```

The build script now resolves the project root from its own file location, so it is not dependent on the current working directory.

Windows users can also double-click `BUILD_JOURNAL.bat`.

For local preview:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`.


## Ultimate newsroom workflow

The publisher supports external image URLs, automatic RSS refresh, static search, RSS, sitemap and GitHub Pages deployment. The visual system is an original premium editorial design inspired by conventions of major international newsrooms rather than copying their branding.
