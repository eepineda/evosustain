#!/usr/bin/env python3
"""
Build EvoSustain Newsroom:
- Reads Markdown files in news/posts/*.md with YAML frontmatter
- Generates:
  - news/posts.json (index for the newsroom)
  - news/*.html article pages (same styling)

Usage (local):
  python news/build.py

GitHub Action can run this on every push to main.
"""
from __future__ import annotations
import re, json, pathlib, datetime

ROOT = pathlib.Path(__file__).resolve().parent
POSTS_DIR = ROOT / "posts"
OUT_JSON = ROOT / "posts.json"

FRONT_RE = re.compile(r"^---\s*(.*?)\s*---\s*(.*)$", re.S)

def parse_frontmatter(md: str):
    m = FRONT_RE.match(md.strip())
    if not m:
        return {}, md
    raw, body = m.group(1), m.group(2)
    fm = {}
    for line in raw.splitlines():
        line = line.strip()
        if not line or line.startswith("#"): 
            continue
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        k = k.strip()
        v = v.strip().strip('"').strip("'")
        fm[k] = v
    # tags can be YAML list in one line: ["a","b"]
    if "tags" in fm and fm["tags"].startswith("["):
        fm["tags"] = [t.strip().strip('"').strip("'") for t in fm["tags"].strip("[]").split(",") if t.strip()]
    else:
        fm["tags"] = []
    fm["featured"] = str(fm.get("featured", "false")).lower() == "true"
    return fm, body.strip()

def iso_date(s: str) -> str:
    try:
        datetime.date.fromisoformat(s)
        return s
    except Exception:
        return ""

def md_to_html(md_body: str) -> str:
    # lightweight markdown -> html (headings, lists, bold, blockquote, paragraphs)
    lines = md_body.splitlines()
    html = []
    in_ul = False
    for line in lines:
        if line.startswith("## "):
            if in_ul: html.append("</ul>"); in_ul = False
            html.append(f"<h2>{escape(line[3:].strip())}</h2>")
        elif line.startswith("# "):
            # H1 handled in template (we still include for fallback)
            continue
        elif line.startswith("> "):
            if in_ul: html.append("</ul>"); in_ul = False
            html.append(f"<blockquote>{inline_md(line[2:].strip())}</blockquote>")
        elif line.startswith("- "):
            if not in_ul:
                html.append("<ul>"); in_ul = True
            html.append(f"<li>{inline_md(line[2:].strip())}</li>")
        elif not line.strip():
            if in_ul: html.append("</ul>"); in_ul = False
        else:
            if in_ul: html.append("</ul>"); in_ul = False
            html.append(f"<p>{inline_md(line.strip())}</p>")
    if in_ul: html.append("</ul>")
    return "\n".join(html)

def inline_md(s: str) -> str:
    s = escape(s)
    # **bold**
    s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
    # `code`
    s = re.sub(r"`(.+?)`", r"<span class='kbd'>\1</span>", s)
    return s

def escape(s: str) -> str:
    return (s or "").replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace('"',"&quot;").replace("'","&#039;")

ARTICLE_TEMPLATE = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title} | EvoSustain Journal</title>
  <meta name="description" content="{summary}" />
  <link rel="stylesheet" href="assets/css/newsroom.css" />
</head>
<body>
  <header>
    <div class="wrap">
      <div class="nav">
        <div class="brand">
          <div class="logo" aria-hidden="true"></div>
          <div class="brandText">
            <b>EvoSustain</b>
            <span>Journal · {category}</span>
          </div>
        </div>
        <nav class="links" aria-label="Primary">
          <a href="../index.html">Home</a>
          <a href="index.html">Journal</a>
        </nav>
        <a class="cta" href="../index.html#contact">Request a demo</a>
      </div>
    </div>
  </header>

  <main class="wrap">
    <div class="panel article">
      <p class="breadcrumb"><a href="../index.html">Home</a> / <a href="index.html">Journal</a> / {category}</p>
      <div class="prose">
        <h1>{title}</h1>
        <p class="meta">{date_human} · {category}</p>
        {body}
        <p class="meta"><a class="under" href="index.html">← Back to the Journal</a></p>
      </div>
    </div>

    <div class="footer">
      <div class="small">© <span id="year"></span> EvoSustain</div>
    </div>
  </main>

  <script>document.getElementById('year').textContent = new Date().getFullYear();</script>
</body>
</html>
"""

def main():
    posts = []
    for md_path in sorted(POSTS_DIR.glob("*.md")):
        raw = md_path.read_text(encoding="utf-8")
        fm, body = parse_frontmatter(raw)

        title = fm.get("title") or md_path.stem.replace("-", " ").title()
        date = iso_date(fm.get("date",""))
        category = fm.get("category","Update") or "Update"
        summary = fm.get("summary","") or ""
        tags = fm.get("tags", []) or []
        featured = fm.get("featured", False)

        slug = md_path.stem
        html_file = f"{slug}.html"
        date_human = "—"
        if date:
            dt = datetime.date.fromisoformat(date)
            date_human = dt.strftime("%b %d, %Y")

        body_html = md_to_html(body)
        article_html = ARTICLE_TEMPLATE.format(
            title=escape(title),
            summary=escape(summary),
            category=escape(category),
            date_human=escape(date_human),
            body=body_html,
        )
        (ROOT / html_file).write_text(article_html, encoding="utf-8")

        posts.append({
            "slug": slug,
            "title": title,
            "date": date,
            "category": category,
            "summary": summary,
            "tags": tags,
            "link": html_file,
            "featured": featured,
        })

    posts.sort(key=lambda p: p.get("date",""), reverse=True)
    OUT_JSON.write_text(json.dumps(posts, indent=2), encoding="utf-8")
    print(f"Wrote {OUT_JSON} and {len(posts)} article pages.")

if __name__ == "__main__":
    main()
