# EvoSustain Insights — AlMomento-inspired layout
Inspired by the public news-portal information architecture of AlMomento.do: utility strip, masthead/search, category navigation, breaking ticker, indicators, featured story, latest feed, most-read module, sectioned content and newsletter. It keeps EvoFord/EvoSustain branding and does not copy AlMomento assets or text.

Automation remains backend-free: RSS → GitHub Actions → data/articles.json → GitHub Pages. Configure your feeds in scripts/update_feed.py from the previous free package.

## Responsive update

The navigation is now functional:
- Desktop: full horizontal navigation.
- Tablet/mobile: hamburger menu with slide-in panel.
- Overlay and Escape-to-close.
- Menu closes after selecting a section.
- Responsive search/header.
- Responsive cards, hero, indicators, newsletter and footer.
