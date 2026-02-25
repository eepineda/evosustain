---
title: ""
layout: splash
header:
  overlay_color: "#1672f3"
  overlay_filter: "1.0"
  caption: 'Powered by [**Aviva Solutions**](http://avivasolutions.nl)'
excerpt: |
  Microsoft MVP | .NET Tech Lead | .NET Architect | C# | Full Stack Dev | Fluent Assertions | Speaker | Trainer | TypeScript | JavaScript | React | Event Sourcing | DDD | TDD | Clean Code

  [Bluesky](https://bsky.app/profile/dennisdoomen.com){: .btn .btn--bluesky}
  [Twitter](https://twitter.com/ddoomen){: .btn .btn--twitter}
  [Mastodon](https://mastodon.social/@ddoomen){: .btn .btn--mastodon}
  [LinkedIN](https://www.linkedin.com/in/dennisdoomen/){: .btn .btn--linkedin}
  [Sessionize](https://sessionize.com/dennis-doomen/){: .btn .btn--sessionize}
  [Aviva Solutions](https://avivasolutions.nl/){: .btn .btn--aviva}
  [Fluent Assertions](https://www.fluentassertions.com/){: .btn .btn--fluentassertions}
  [Github Sponsors](https://github.com/sponsors/dennisdoomen){: .btn .btn--github}
  [Tip Me](https://paypal.me/fluentassertions){: .btn .btn--paypal}
  [Buy me a Coffee](https://ko-fi.com/dennisdoomen){: .btn .btn--kofi}
  [Sponsor Me](https://www.patreon.com/bePatron?u=9250052&redirect_uri=http%3A%2F%2Ffluentassertions.com%2F&utm_medium=widget){: .btn .btn--patreon}
---
{{ site.data.ui-text[site.locale].recent_posts | default: "Recent Posts" }}

{% for post in site.posts limit:10 %}
  {% include archive-single.html type=grid %}
{% endfor %}