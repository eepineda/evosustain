# EvoSustain Journal / Insights

A clean, responsive, no-backend editorial portal for EvoFord / EvoSustain.

## Features
- Editorial-style homepage
- Functional mobile navigation
- Search
- Responsive layouts for desktop, tablet and mobile
- Journal sections: Latest, Sustainability, Technology, Smart Cities, Waste Operations, Perspective
- Newsletter UI
- Static JSON content
- Optional RSS automation via GitHub Actions
- No database, server or API key required

## Deploy
Upload the folder to GitHub and enable GitHub Pages.

## RSS automation
Edit `scripts/update_feed.py` and add RSS URLs to `FEEDS`. GitHub Actions can then refresh `data/articles.json` every 6 hours.
