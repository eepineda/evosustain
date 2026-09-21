import json,re,html,urllib.request,xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime,timezone
from email.utils import parsedate_to_datetime
ROOT=Path(__file__).resolve().parent.parent; CONTENT=ROOT/'content'; DATA=ROOT/'data'; PUBLIC=ROOT/'articles'
CONFIG=json.loads((ROOT/'config.json').read_text(encoding='utf-8')); SOURCES=json.loads((DATA/'sources.json').read_text(encoding='utf-8'))
DATA.mkdir(exist_ok=True); PUBLIC.mkdir(exist_ok=True); DEFAULT_IMAGE='assets/green.svg'
def clean(v): return re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',html.unescape(v or ''))).strip()
def slugify(v): return re.sub(r'[^a-z0-9]+','-',clean(v).lower()).strip('-')[:90] or 'story'
def frontmatter(text):
    if not text.startswith('---'): return {},text.strip()
    p=text.split('---',2)
    if len(p)<3:return {},text.strip()
    meta={}
    for line in p[1].splitlines():
        m=re.match(r'^\s*([\w-]+)\s*:\s*(.*)\s*$',line)
        if m:
            v=m.group(2).strip()
            if len(v)>=2 and v[0]==v[-1]=='"':v=v[1:-1].replace('\\"','"')
            meta[m.group(1)]=v
    return meta,p[2].strip()
def date(v):
    if not v:return datetime.now(timezone.utc).strftime('%Y-%m-%d')
    try:return parsedate_to_datetime(v).astimezone(timezone.utc).strftime('%Y-%m-%d')
    except:return str(v)[:10]
def rss_source(src):
    req=urllib.request.Request(src['url'],headers={'User-Agent':'EvofordJournalBot/1.0'}); root=ET.fromstring(urllib.request.urlopen(req,timeout=25).read()); atom='{http://www.w3.org/2005/Atom}'; nodes=root.findall('.//item') or root.findall('.//'+atom+'entry'); out=[]
    for n in nodes[:int(CONFIG['rss_per_source'])]:
        def get(*names):
            for name in names:
                x=n.find(name)
                if x is not None and x.text:return x.text.strip()
            return ''
        title=clean(get('title',atom+'title')); link=get('link')
        if not link:
            x=n.find(atom+'link')
            if x is not None:link=x.attrib.get('href','')
        desc=clean(get('description','{http://purl.org/rss/1.0/modules/content/}encoded',atom+'summary',atom+'content')); pub=get('pubDate','published','updated',atom+'published',atom+'updated')
        if title and link: out.append({'title':title,'category':src.get('category','News'),'excerpt':desc[:280],'source':src.get('name','External source'),'date':date(pub),'url':link,'image':src.get('image',DEFAULT_IMAGE),'type':'external'})
    return out
def manual():
    out=[]
    for p in CONTENT.glob('*.md'):
        if p.name.startswith('_'):continue
        meta,body=frontmatter(p.read_text(encoding='utf-8'))
        if not meta.get('title'):continue
        cat=meta.get('category','News'); cat=cat if cat in CONFIG['categories'] else 'News'
        out.append({'title':meta['title'],'category':cat,'excerpt':meta.get('excerpt') or clean(body)[:280],'source':meta.get('source','Evoford Journal'),'date':meta.get('date') or date(''),'url':meta.get('url',''),'image':meta.get('image',DEFAULT_IMAGE),'image_alt':meta.get('image_alt',''),'image_caption':meta.get('image_caption',''),'image_credit':meta.get('image_credit',''),'author':meta.get('author','Evoford Journal'),'read_time':meta.get('read_time','4 min read'),'body':body,'slug':meta.get('slug') or slugify(meta['title']),'type':'manual'})
    return out
def key(a): return (a.get('url') or a.get('slug') or a['title']).strip().lower()
def render_body(body,excerpt):
    blocks=[]
    for b in re.split(r'\n\s*\n',body):
        b=b.strip()
        if not b:continue
        if b.startswith('### '):blocks.append('<h3>'+html.escape(b[4:])+'</h3>')
        elif b.startswith('## '):blocks.append('<h2>'+html.escape(b[3:])+'</h2>')
        elif b.startswith('# '):blocks.append('<h2>'+html.escape(b[2:])+'</h2>')
        elif b.startswith('> '):blocks.append('<blockquote>'+html.escape(b[2:])+'</blockquote>')
        elif all(x.lstrip().startswith('- ') for x in b.splitlines()):blocks.append('<ul>'+''.join('<li>'+html.escape(x.lstrip()[2:])+'</li>' for x in b.splitlines())+'</ul>')
        else:
            txt=html.escape(b).replace('\n','<br>'); txt=re.sub(r'\*\*(.+?)\*\*',r'<strong>\1</strong>',txt); txt=re.sub(r'\*(.+?)\*',r'<em>\1</em>',txt); blocks.append('<p>'+txt+'</p>')
    return '\n'.join(blocks) or '<p>'+html.escape(excerpt)+'</p>'
def page(a,related):
    site=CONFIG['site_url'].rstrip('/'); title=html.escape(a['title']); desc=html.escape(a.get('excerpt','')); img=html.escape(a.get('image',DEFAULT_IMAGE)); img_src=img if img.startswith(('http://','https://','//')) else '../'+img.lstrip('./')
    rel=''.join('<li><a href="../articles/'+html.escape(x['slug'])+'.html">'+html.escape(x['title'])+'</a></li>' for x in related[:4]); caption=html.escape(a.get('image_caption','') or ''); credit=html.escape(a.get('image_credit','') or ''); fig='<figcaption class="caption">'+caption+(' · '+credit if credit else '')+'</figcaption>' if (caption or credit) else ''
    return '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>%s — %s</title><meta name="description" content="%s"><link rel="canonical" href="%s/articles/%s.html"><link rel="stylesheet" href="../styles.css"><meta property="og:title" content="%s"><meta property="og:description" content="%s"><meta property="og:type" content="article"><meta property="og:image" content="%s"></head><body><header class="masthead-wrap"><div class="masthead container"><a class="brand" href="../">Evoford Journal</a></div><nav class="navline"><div class="container navInner"><a href="../#latest">Latest</a><a href="../#sustainability">Sustainability</a><a href="../#technology">Technology</a><a href="../#cities">Smart Cities</a><a href="../#waste">Waste &amp; Operations</a><a href="../#perspective">Perspective</a></div></nav></header><main class="container articlePage"><a class="back" href="../">← Back to Journal</a><div class="eyebrow" style="margin-top:24px">%s</div><h1>%s</h1><p class="articleDeck">%s</p><div class="meta">By %s · %s · %s</div><img class="articleHero" src="%s" alt="%s">%s<article class="articleBody">%s</article><section class="related"><h2>More from the Journal</h2><ul>%s</ul></section></main><footer class="footer"><div class="container"><div class="footerMast">Evoford Journal</div><div class="footerRule"></div><div class="footerMeta"><span>News · Ideas · Systems</span><span>© Evoford Journal</span></div></div></footer></body></html>''' % (title,html.escape(CONFIG['site_name']),desc,site,html.escape(a['slug']),title,desc,img,html.escape(a['category']),title,desc,html.escape(a.get('author','Evoford Journal')),html.escape(a['date']),html.escape(a.get('read_time','4 min read')),img,html.escape(a.get('image_alt','')),fig,render_body(a.get('body',''),a.get('excerpt','')),rel)
def main():
    items=manual()
    if CONFIG.get('auto_publish_rss'):
        for src in SOURCES:
            if not src.get('enabled') or not src.get('url'):continue
            try:items+=rss_source(src)
            except Exception as e:print('RSS failed:',src.get('name'),e)
    dedup={}
    for a in items:
        k=key(a)
        if k not in dedup or a.get('type')=='manual':dedup[k]=a
    items=sorted(dedup.values(),key=lambda x:x.get('date',''),reverse=True)[:int(CONFIG['max_articles'])]
    for p in PUBLIC.glob('*.html'):p.unlink()
    for i,a in enumerate(items):
        a['slug']=a.get('slug') or slugify(a['title']); a['url']=a.get('url') or 'articles/'+a['slug']+'.html'; related=[x for j,x in enumerate(items) if i!=j and x.get('category')==a.get('category')]; (PUBLIC/(a['slug']+'.html')).write_text(page(a,related),encoding='utf-8')
    (DATA/'articles.json').write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding='utf-8'); (DATA/'search.json').write_text(json.dumps([{'title':a['title'],'category':a['category'],'date':a['date'],'url':a['url'],'excerpt':a['excerpt']} for a in items],ensure_ascii=False,indent=2),encoding='utf-8')
    site=CONFIG['site_url'].rstrip('/'); rss=["<?xml version='1.0' encoding='UTF-8'?><rss version='2.0'><channel><title>"+html.escape(CONFIG['site_name'])+"</title><link>"+html.escape(site)+"/</link>"]
    for a in items[:30]:rss.append('<item><title>'+html.escape(a['title'])+'</title><link>'+html.escape(site+'/'+a['url'].lstrip('/'))+'</link><description>'+html.escape(a['excerpt'])+'</description><pubDate>'+a['date']+'</pubDate></item>')
    rss.append('</channel></rss>');(ROOT/'feed.xml').write_text(''.join(rss),encoding='utf-8'); urls=[site+'/']+[site+'/'+a['url'].lstrip('/') for a in items]; (ROOT/'sitemap.xml').write_text("<?xml version='1.0' encoding='UTF-8'?><urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'>"+''.join('<url><loc>'+html.escape(u)+'</loc></url>' for u in urls)+'</urlset>',encoding='utf-8'); print('Published',len(items),'stories')
if __name__=='__main__':main()
