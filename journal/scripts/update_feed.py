#!/usr/bin/env python3
import json, urllib.request, xml.etree.ElementTree as ET
from pathlib import Path
FEEDS=[]
OUT=Path("data/articles.json")
items=[]
for url in FEEDS:
    try:
        root=ET.fromstring(urllib.request.urlopen(url,timeout=20).read())
        for item in root.findall(".//item")[:10]:
            def t(k):
                n=item.find(k); return n.text.strip() if n is not None and n.text else ""
            items.append({"title":t("title"),"category":"News","excerpt":t("description")[:240],"source":t("source") or "RSS","date":t("pubDate"),"url":t("link"),"image":"assets/waste.svg"})
    except Exception as e: print("feed error:",e)
if items: OUT.write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding="utf-8")
