from pathlib import Path
import json,html
R=Path(__file__).resolve().parents[1]; D=R/'dist'; posts=json.loads((R/'data/posts.json').read_text(encoding='utf8'))
for p in posts:
    out=D/'article'/f"{p['slug']}.html"
    # Regenerate article pages using the same editorial template.
    out.parent.mkdir(exist_ok=True)
    out.write_text(f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(p["title"])} — Evoford Journal</title><link rel="stylesheet" href="../styles.css"></head><body><div class="top"><span>EVOFORD JOURNAL</span><span>LONDON · REPÚBLICA DOMINICANA · LATINOAMÉRICA</span><span>EDICIÓN DIGITAL</span></div><header class="header"><a class="logo" href="../index.html">Evoford <span>Journal</span></a></header><main class="article"><a class="kicker" href="../index.html">← VOLVER A LA PORTADA</a><div style="margin-top:24px"><span class="kicker">{html.escape(p["section"])} · {html.escape(p["type"])}</span><h1>{html.escape(p["title"])}</h1><p class="dek">{html.escape(p["dek"])}</p><div class="meta">{html.escape(p["date"])} · {html.escape(p["author"])} · <a href="{html.escape(p["source_url"])}" target="_blank">{html.escape(p["source"])}</a></div><img src="{html.escape(p["image"])}" alt=""><div class="body"><p>{html.escape(p.get("body",p["dek"]))}</p></div></div></main><footer class="footer"><div><b>Evoford Journal</b><span>Independent reporting · intelligence · perspective</span></div><div>London · Dominican Republic · Latin America</div></footer></body></html>''',encoding='utf8')
print(f'Published {len(posts)} stories')
