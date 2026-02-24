---
layout: home
title: EvoSustain Blog
---

# EvoSustain Blog

Latest updates and insights on smart waste logistics and sustainability.

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
      <small> — {{ post.date | date: "%d %b %Y" }}</small>
    </li>
  {% endfor %}
</ul>
