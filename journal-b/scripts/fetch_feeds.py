from pathlib import Path
import json, urllib.request, xml.etree.ElementTree as ET, hashlib, re
from datetime import datetime, timezone
ROOT=Path(__file__).resolve().parents[1]
feeds=json.loads((ROOT/"data/feeds.json").read_text(encoding="utf-8"))["feeds"]
posts=json.loads((ROOT/"data/posts.json").read_text(encoding="utf-8"))
known={p.get("source_url") for p in posts if p.get("source_url")}
headers={"User-Agent":"EvofordJournalBot/1.0 (+https://evoford.com/journal/)"}
def text(el): return "" if el is None else " ".join("".join(el.itertext()).split())
def slug(s): return re.sub(r"-+","-",re.sub(r"[^a-z0-9]+","-",s.lower())).strip("-")
added=0
for f in feeds:
    if not f.get("enabled") or not f["url"].lower().endswith((".xml",".rss","/rss")): continue
    try:
        req=urllib.request.Request(f["url"],headers=headers)
        raw=urllib.request.urlopen(req,timeout=20).read()
        root=ET.fromstring(raw)
        items=root.findall(".//item") or root.findall(".//{http://www.w3.org/2005/Atom}entry")
        for it in items[:10]:
            title=text(it.find("title")) or text(it.find("{http://www.w3.org/2005/Atom}title"))
            linkel=it.find("link"); link=(linkel.get("href") if linkel is not None else "") or text(linkel)
            if not link:
                guid=text(it.find("guid")); link=guid if guid.startswith("http") else ""
            desc=text(it.find("description")) or text(it.find("{http://www.w3.org/2005/Atom}summary"))
            if not title or not link or link in known: continue
            p={"slug":slug(title)+"-"+hashlib.md5(link.encode()).hexdigest()[:6],"title":title,"dek":desc[:260],"section":f.get("section","Latest"),"date":datetime.now(timezone.utc).date().isoformat(),"author":f["name"],"image":"","source":f["name"],"source_url":link,"type":f.get("type","press"),"featured":False,"body":desc}
            posts.insert(0,p); known.add(link); added+=1
    except Exception as ex:
        print("Feed failed:",f["name"],str(ex))
(ROOT/"data/posts.json").write_text(json.dumps(posts[:100],ensure_ascii=False,indent=2),encoding="utf-8")
print("Ingested",added,"new items")
