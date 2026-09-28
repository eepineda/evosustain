# Briefing feed fix

The previous version treated ordinary web pages as RSS/XML feeds.
This version uses RSS search endpoints and a tolerant parser. Each source
is isolated, so malformed XML or HTTP 403 from one publisher does not stop
the complete build. Mobile shows at most five stories.
