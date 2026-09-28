from pathlib import Path
import json, html, shutil

ROOT=Path(__file__).resolve().parents[1]
POSTS=json.loads((ROOT/"data/posts.json").read_text(encoding="utf-8"))
OUT=ROOT/"dist"

def e(x):
    return html.escape(str(x or ""), quote=True)

def card(p, large=False):
    badge="OFICIAL" if p.get("type")=="official" else ("EDITORIAL" if p.get("type")=="editorial" else "PRENSA")
    cls="story story--large" if large else "story"
    return (
        '<article class="'+cls+'">'
        '<a class="story__image" href="/journal/article/'+e(p["slug"])+'.html">'
        '<img loading="lazy" src="'+e(p["image"])+'" alt=""></a>'
        '<div class="story__body">'
        '<div class="eyebrow">'+e(p["section"])+' <span class="dot">·</span> '+badge+'</div>'
        '<h2><a href="/journal/article/'+e(p["slug"])+'.html">'+e(p["title"])+'</a></h2>'
        '<p>'+e(p["dek"])+'</p>'
        '<div class="story__meta">'+e(p["date"])+' · '+e(p["author"])+'</div>'
        '</div></article>'
    )

def article(p):
    title=e(p["title"]); dek=e(p["dek"]); slug=e(p["slug"])
    section=e(p["section"]); date=e(p["date"]); author=e(p["author"])
    source=e(p["source"]); source_url=e(p["source_url"]); image=e(p["image"])
    return (
        '<!doctype html><html lang="es"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>'+title+' — Evoford Journal</title>'
        '<meta name="description" content="'+dek+'">'
        '<link rel="stylesheet" href="/journal/styles.css"></head><body class="article-page">'
        '<header class="masthead masthead--article"><a class="brand" href="/journal/">Evoford <em>Journal</em></a>'
        '<a class="article-back" href="/journal/">← Portada</a></header>'
        '<main class="article"><div class="article__kicker">'+section+' · '+date+'</div>'
        '<h1>'+title+'</h1><p class="article__dek">'+dek+'</p>'
        '<div class="article__byline">Por <strong>'+author+'</strong> · Fuente: '
        '<a href="'+source_url+'" target="_blank" rel="noopener">'+source+'</a></div>'
        '<img class="article__hero" src="'+image+'" alt="">'
        '<div class="article__text">'
        '<p>'+e(p.get('body') or 'Este artículo forma parte de la arquitectura editorial de Evoford Journal. El contenido puede editarse desde el CMS local y publicarse con el proceso automático.')+'</p>'
        '<p>Cuando el contenido procede de un organismo, institución o medio externo, Evoford Journal conserva el enlace a la fuente original y la identifica claramente.</p>'
        '<p>La plantilla está preparada para reportajes, entrevistas, análisis, fotografías, datos y briefings sin saturar la experiencia móvil.</p>'
        '</div></main><footer class="site-footer"><strong>Evoford Journal</strong>'
        '<span>Independent reporting · intelligence · perspective</span></footer></body></html>'
    )

def main():
    OUT.mkdir(exist_ok=True)
    (OUT/"article").mkdir(exist_ok=True)
    for name in ["styles.css","app.js","manifest.webmanifest","sw.js","icon.svg"]:
        shutil.copy2(ROOT/name,OUT/name)
    featured=next((p for p in POSTS if p.get("featured")),POSTS[0])
    rest=[p for p in POSTS if p["slug"]!=featured["slug"]]
    h=(ROOT/"index.html").read_text(encoding="utf-8")
    h=h.replace("{{FEATURED}}",card(featured,True))
    h=h.replace("{{STORIES}}","".join(card(p) for p in rest))
    h=h.replace("{{COUNT}}",str(len(POSTS)))
    (OUT/"index.html").write_text(h,encoding="utf-8")
    for p in POSTS:
        (OUT/"article"/(p["slug"]+".html")).write_text(article(p),encoding="utf-8")
    print("Published",len(POSTS),"stories")

if __name__=="__main__":
    main()
