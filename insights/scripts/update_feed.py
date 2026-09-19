import json, re, html, urllib.request, xml.etree.ElementTree as ET
from pathlib import Path
FEEDS=[('News','https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs.atom'),('Technology','https://www.theverge.com/rss/index.xml')]
def clean(s): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',s or ''))).strip()
out=[]
for cat,url in FEEDS:
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'EvoSustainInsights/1.0'}); root=ET.fromstring(urllib.request.urlopen(req,timeout=20).read())
  for e in root.findall('.//item')+root.findall('{http://www.w3.org/2005/Atom}entry'):
   title=e.findtext('title') or e.findtext('{http://www.w3.org/2005/Atom}title') or ''; link=e.findtext('link') or ''
   if not link:
    le=e.find('{http://www.w3.org/2005/Atom}link'); link=le.attrib.get('href','') if le is not None else ''
   desc=e.findtext('description') or e.findtext('{http://www.w3.org/2005/Atom}summary') or ''; date=e.findtext('pubDate') or e.findtext('{http://www.w3.org/2005/Atom}updated') or ''
   if title and link: out.append({'title':clean(title),'category':cat,'excerpt':clean(desc)[:280],'source':url.split('/')[2],'date':clean(date)[:32],'url':link})
 except Exception as ex: print(ex)
seen=set();cleaned=[]
for x in out:
 k=(x['title'].lower(),x['url'])
 if k not in seen: seen.add(k);cleaned.append(x)
p=Path('data/articles.json');p.write_text(json.dumps(cleaned[:60],ensure_ascii=False,indent=2),encoding='utf-8')
