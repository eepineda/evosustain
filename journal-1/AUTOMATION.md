# Evoford Journal automation

- Markdown in `content/` is the editorial source of truth.
- `publicar.html` generates stories and supports any public direct image URL.
- GitHub Actions builds on every content push.
- A scheduled job refreshes enabled RSS sources every 3 hours.
- The build creates article pages, search JSON, RSS and sitemap.
- GitHub Pages deploys the finished site.

For an external image use `image: "https://example.com/photo.webp"`. For local images use `image: "assets/filename.webp"`.

RSS should be used only for sources you are permitted to republish; this project imports headlines/excerpts/links, not full third-party articles.
