# Evoford Journal — Premium Editorial Newsroom Template

A complete static editorial publication template for Evoford Journal. The visual language is an original interpretation of premium newspaper conventions: strong serif typography, dense front-page hierarchy, rules and columns, restrained color, photo captions, bylines and mobile-first editorial flow.

## Includes
- Desktop/laptop + mobile responsive states.
- Original newspaper-inspired front page: masthead, edition line, lead story, side rail, secondary briefs and section fronts.
- Article template with author, reading time, image caption/credit, pull quotes, headings, lists and related stories.
- External public image URLs supported in Markdown frontmatter.
- Local Markdown publishing desk at `publicar.html`.
- Static build: Python + Markdown/JSON.
- RSS/Atom ingestion, deduplication, search index, RSS feed and sitemap.
- GitHub Actions automation retained.

## Build
From the project root:

```bash
python scripts/build_site.py
```

Then serve the folder locally, for example:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/`.

## Article frontmatter

```yaml
---
title: "Headline"
category: "Sustainability"
date: "2026-09-21"
author: "Evoford Journal"
read_time: "4 min read"
source: "Evoford Journal"
excerpt: "Short editorial deck."
image: "https://example.com/photo.webp"
image_alt: "Description of the image"
image_caption: "Caption for the photograph"
image_credit: "Photo: Example / Photographer"
slug: "headline"
---

Body paragraph.

## Section heading

> Pull quote.

**Bold text** and *italic text*.
```
