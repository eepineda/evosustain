import html, json, re, urllib.request, xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import quote_plus, urlparse

ROOT = Path(__file__).resolve().parent.parent
CONTENT, DATA, PUBLIC = ROOT/'content', ROOT/'data', ROOT/'articles'
CONFIG = json.loads((ROOT/'config.json').read_text(encoding='utf-8'))
SOURCES = json.loads((DATA/'sources.json').read_text(encoding='utf-8'))
DATA.mkdir(exist_ok=True); PUBLIC.mkdir(exist_ok=True)
DEFAULT_IMAGE = 'assets/green.svg'


def clean(v): return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', html.unescape(v or ''))).strip()
def slugify(v): return re.sub(r'[^a-z0-9]+', '-', clean(v).lower()).strip('-')[:90] or 'story'

def frontmatter(text):
    if not text.startswith('---'): return {}, text.strip()
    parts = text.split('---', 2)
    if len(parts) < 3: return {}, text.strip()
    meta = {}
    for line in parts[1].splitlines():
        m = re.match(r'^\s*([\w-]+)\s*:\s*(.*)\s*$', line)
        if m:
            v = m.group(2).strip()
            if len(v) >= 2 and v[0] == v[-1] == '"': v = v[1:-1].replace('\\"', '"')
            meta[m.group(1)] = v
    return meta, parts[2].strip()

def iso_date(v):
    if not v: return datetime.now(timezone.utc).strftime('%Y-%m-%d')
    try: return parsedate_to_datetime(v).astimezone(timezone.utc).strftime('%Y-%m-%d')
    except Exception:
        try: return datetime.fromisoformat(str(v).replace('Z','+00:00')).strftime('%Y-%m-%d')
        except Exception: return str(v)[:10]

def image_url(v, prefix=''):
    v = v or DEFAULT_IMAGE
    if v.startswith(('http://','https://','//')): return v
    return prefix + v.lstrip('./')

def rss_source(src):
    req = urllib.request.Request(src['url'], headers={'User-Agent':'EvofordJournalBot/2.0'})
    root = ET.fromstring(urllib.request.urlopen(req, timeout=25).read())
    atom = '{http://www.w3.org/2005/Atom}'
    nodes = root.findall('.//item') or root.findall('.//'+atom+'entry')
    out = []
    for n in nodes[:int(CONFIG['rss_per_source'])]:
        def get(*names):
            for name in names:
                x = n.find(name)
                if x is not None and x.text: return x.text.strip()
            return ''
        title = clean(get('title', atom+'title')); link = get('link')
        if not link:
            x = n.find(atom+'link')
            if x is not None: link = x.attrib.get('href','')
        desc = clean(get('description','{http://purl.org/rss/1.0/modules/content/}encoded',atom+'summary',atom+'content'))
        pub = get('pubDate','published','updated',atom+'published',atom+'updated')
        if title and link:
            out.append({'title':title,'category':src.get('category','News'),'excerpt':desc[:280], 'source':src.get('name','External source'),'date':iso_date(pub),'url':link,'original_url':link,'source_url':link,'image':src.get('image',DEFAULT_IMAGE),'type':'external','author':src.get('name','External source'),'read_time':'','slug':slugify(title)})
    return out

def author_rss_sources():
    cfg=CONFIG.get('author_archive') or {}
    if not cfg.get('enabled'): return []
    out=[]
    for q in cfg.get('queries',[]):
        url='https://news.google.com/rss/search?q='+quote_plus(q)+'&hl=es-419&gl=DO&ceid=DO:es-419'
        out.append({'name':'Google News — '+q,'url':url,'category':'Perspective','enabled':True,'image':DEFAULT_IMAGE,'author_query':True,'query':q})
    return out

def verify_author(url, author):
    if not CONFIG.get('author_archive',{}).get('verify_author_pages',True): return True
    if not url or not author: return False
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; EvofordJournalBot/2.1)'})
        raw=urllib.request.urlopen(req,timeout=12).read(800000)
        text=clean(raw.decode('utf-8','ignore')).lower()
        variants=[author.lower(),'por '+author.lower(),'ing. '+author.lower()]
        return any(v in text for v in variants)
    except Exception:
        # Search feeds are retained when the publisher blocks automated page verification.
        return True

def author_items():
    cfg=CONFIG.get('author_archive') or {}
    author=cfg.get('name','Edwin Pineda Carrasco').strip()
    out=[]
    seed_path=DATA/'author_seed.json'
    if seed_path.exists():
        for row in json.loads(seed_path.read_text(encoding='utf-8')):
            out.append({'title':row['title'],'category':'Perspective','excerpt':'Publicación de '+author+' enlazada a la fuente original.','source':row.get('source','Original publication'),'date':row.get('date',''),'url':row['url'],'original_url':row['url'],'source_url':row['url'],'image':DEFAULT_IMAGE,'type':'author_archive','author':author,'author_archive':True,'slug':slugify(row['title'])})
    seen={x.get('url') for x in out}
    for src in author_rss_sources():
        try:
            rows=rss_source(src)
            for a in rows:
                blob=(a.get('title','')+' '+a.get('excerpt','')+' '+a.get('source','')).lower()
                if author.lower() in blob or verify_author(a.get('url',''),author):
                    if a.get('url') in seen: continue
                    a['author']=author; a['author_archive']=True; a['original_url']=a['url']; a['source_url']=a['url']; a['type']='author_archive'; a['category']='Perspective'
                    out.append(a); seen.add(a.get('url'))
        except Exception as e: print('Author search failed:',src.get('name'),e)
    # Prefer newest and cap archive.
    out.sort(key=lambda x:x.get('date',''),reverse=True)
    return out[:int(cfg.get('max_items',300))]


def briefing_items():
    """Collect official-source updates for the FAO/RD briefing.
    This is deliberately separate from the main newsroom feed so official
    updates do not overwhelm the editorial homepage.
    """
    cfg = CONFIG.get('briefing') or {}
    if not cfg.get('enabled'):
        return []
    out = []
    seen = set()
    for src in cfg.get('sources', []):
        try:
            rows = rss_source({
                'url': src.get('url',''),
                'name': src.get('name','Official source'),
                'category': src.get('category','Briefing'),
                'image': DEFAULT_IMAGE
            })
            for a in rows:
                url = a.get('url','')
                title = a.get('title','').strip()
                if not url or not title or url in seen:
                    continue
                # Keep the briefing tightly relevant to FAO / Dominican Republic.
                blob = (title + ' ' + a.get('excerpt','')).lower()
                if src.get('category') == 'FAO' or any(x in blob for x in (
                    'república dominicana','dominican republic','santo domingo',
                    'fao','alimentación','agricultura','seguridad alimentaria',
                    'sistemas agroalimentarios'
                )):
                    a['briefing'] = True
                    a['briefing_source'] = src.get('name','Official source')
                    a['source_type'] = 'official'
                    a['category'] = src.get('category','Briefing')
                    out.append(a)
                    seen.add(url)
        except Exception as e:
            print('Briefing source failed:', src.get('name'), e)
    out.sort(key=lambda x: x.get('date',''), reverse=True)
    return out[:int(cfg.get('max_items',12))]

def manual():
    out=[]
    for p in CONTENT.glob('*.md'):
        if p.name.startswith('_'): continue
        meta, body = frontmatter(p.read_text(encoding='utf-8'))
        if not meta.get('title'): continue
        cat = meta.get('category','News')
        if cat not in CONFIG['categories']: cat='News'
        out.append({'title':meta['title'],'category':cat,'excerpt':meta.get('excerpt') or clean(body)[:280],'source':meta.get('source','Evoford Journal'),'date':meta.get('date') or iso_date(''),'url':meta.get('url',''),'image':meta.get('image',DEFAULT_IMAGE),'image_alt':meta.get('image_alt',''),'image_caption':meta.get('image_caption',''),'image_credit':meta.get('image_credit',''),'author':meta.get('author','Evoford Journal'),'read_time':meta.get('read_time','4 min read'),'body':body,'slug':meta.get('slug') or slugify(meta['title']),'type':'manual'})
    return out

def md_inline(s):
    s = html.escape(s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)
    s = re.sub(r'\*(.+?)\*', r'<em>\1</em>', s)
    return s

def render_body(body, excerpt):
    blocks=[]
    for b in re.split(r'\n\s*\n', body):
        b=b.strip()
        if not b: continue
        if b.startswith('### '): blocks.append('<h3>'+md_inline(b[4:])+'</h3>')
        elif b.startswith('## '): blocks.append('<h2>'+md_inline(b[3:])+'</h2>')
        elif b.startswith('# '): blocks.append('<h2>'+md_inline(b[2:])+'</h2>')
        elif b.startswith('> '): blocks.append('<blockquote>'+md_inline(b[2:])+'</blockquote>')
        elif all(x.lstrip().startswith('- ') for x in b.splitlines()): blocks.append('<ul>'+''.join('<li>'+md_inline(x.lstrip()[2:])+'</li>' for x in b.splitlines())+'</ul>')
        else: blocks.append('<p>'+md_inline(b).replace('\n','<br>')+'</p>')
    return '\n'.join(blocks) or '<p>'+html.escape(excerpt)+'</p>'

def page(a, related):
    site=CONFIG['site_url'].rstrip('/'); title=html.escape(a['title']); desc=html.escape(a.get('excerpt','')); img=html.escape(image_url(a.get('image',DEFAULT_IMAGE),'../'))
    rel=''.join('<li><a href="../articles/'+html.escape(x['slug'])+'.html">'+html.escape(x['title'])+'</a></li>' for x in related[:5])
    caption=html.escape(a.get('image_caption','') or ''); credit=html.escape(a.get('image_credit','') or '')
    fig='<figcaption class="caption">'+caption+(' · '+credit if credit else '')+'</figcaption>' if (caption or credit) else ''
    body=render_body(a.get('body',''),a.get('excerpt',''))
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} — Evoford Journal</title><meta name="description" content="{desc}"><link rel="canonical" href="{site}/articles/{html.escape(a['slug'])}.html"><link rel="stylesheet" href="../styles.css"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:type" content="article"><meta property="og:image" content="{img}"></head><body><header class="masthead-wrap"><div class="masthead container"><a class="brand" href="../">Evoford Journal</a></div><nav class="navline"><div class="container navInner"><a href="../#latest">Latest</a><a href="../#sustainability">Sustainability</a><a href="../#technology">Technology</a><a href="../#cities">Smart Cities</a><a href="../#waste">Waste &amp; Operations</a><a href="../#perspective">Perspective</a><a class="navPremium" href="../#membership">Journal+</a></div></nav></header><main class="container articlePage"><a class="back" href="../">← Back to Journal</a><div class="eyebrow" style="margin-top:24px">{html.escape(a['category'])}</div><h1>{title}</h1><p class="articleDeck">{desc}</p><div class="meta">By {html.escape(a.get('author','Evoford Journal'))} · {html.escape(a['date'])} · {html.escape(a.get('read_time',''))}</div><figure><img class="articleHero" src="{img}" alt="{html.escape(a.get('image_alt',''))}">{fig}</figure><article class="articleBody">{body}</article><section class="related"><h2>More from the Journal</h2><ul>{rel}</ul></section></main><footer class="footer"><div class="container"><div class="footerMast">Evoford Journal</div><div class="footerRule"></div><div class="footerMeta"><span>News · Ideas · Systems</span><span>© Evoford Journal</span></div></div></footer></body></html>'''

def main():
    briefing = briefing_items()
    (DATA/'briefing.json').write_text(json.dumps(briefing, ensure_ascii=False, indent=2), encoding='utf-8')
    items=manual()
    author=author_items()
    if author:
        items += author
    if CONFIG.get('auto_publish_rss'):
        for src in SOURCES:
            if not src.get('enabled') or not src.get('url'): continue
            try: items += rss_source(src)
            except Exception as e: print('RSS failed:',src.get('name'),e)
    dedup={}
    for a in items:
        k=(a.get('url') or a.get('slug') or a['title']).strip().lower()
        if k not in dedup or a.get('type')=='manual': dedup[k]=a
    items=sorted(dedup.values(), key=lambda x:x.get('date',''), reverse=True)[:int(CONFIG['max_articles'])]
    for p in PUBLIC.glob('*.html'): p.unlink()
    for i,a in enumerate(items):
        a['slug']=a.get('slug') or slugify(a['title'])
        if a.get('author_archive'):
            a['url']=a.get('original_url') or a.get('url')
            continue
        a['url']='articles/'+a['slug']+'.html'
        related=[x for j,x in enumerate(items) if i!=j and x.get('category')==a.get('category')]
        (PUBLIC/(a['slug']+'.html')).write_text(page(a,related),encoding='utf-8')
    (DATA/'articles.json').write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding='utf-8')
    (DATA/'search.json').write_text(json.dumps([{'title':a['title'],'category':a['category'],'date':a['date'],'url':a['url'],'excerpt':a['excerpt'],'author':a.get('author','')} for a in items],ensure_ascii=False,indent=2),encoding='utf-8')
    acfg=CONFIG.get('author_archive') or {}
    if acfg.get('enabled'):
        authored=[a for a in items if a.get('author_archive')]
        links=''.join('<article class="authorStory"><div class="eyebrow">'+html.escape(a['date'])+'</div><h2><a href="'+html.escape(a['url'])+'">'+html.escape(a['title'])+'</a></h2><p>'+html.escape(a.get('excerpt',''))+'</p><div class="meta">Source: <a href="'+html.escape(a.get('source_url') or a.get('original_url') or a.get('link') or '#')+'" target="_blank" rel="noopener">'+html.escape(a.get('source','Original publication'))+'</a></div></article>' for a in authored)
        archive='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'''+html.escape(acfg.get('name','Author'))+''' — Evoford Journal</title><link rel="stylesheet" href="styles.css"></head><body><header class="masthead-wrap"><div class="masthead container"><a class="brand" href="./">Evoford Journal</a></div></header><main class="container"><div class="eyebrow">AUTHOR ARCHIVE</div><h1>'''+html.escape(acfg.get('name','Author'))+'''</h1><p class="articleDeck">Publicaciones localizadas automáticamente en fuentes públicas, buscadores de noticias y sitios editoriales. Cada resultado conserva el enlace a la publicación original. El archivo se actualiza automáticamente.</p><div class="authorArchive">'''+links+'''</div></main></body></html>'''; (ROOT/'edwin-pineda-carrasco.html').write_text(archive,encoding='utf-8')
    site=CONFIG['site_url'].rstrip('/'); rss=["<?xml version='1.0' encoding='UTF-8'?><rss version='2.0'><channel><title>"+html.escape(CONFIG['site_name'])+"</title><link>"+html.escape(site)+"/</link>"]
    for a in items[:30]: rss.append('<item><title>'+html.escape(a['title'])+'</title><link>'+html.escape(site+'/'+a['url'].lstrip('/'))+'</link><description>'+html.escape(a['excerpt'])+'</description><pubDate>'+a['date']+'</pubDate></item>')
    rss.append('</channel></rss>'); (ROOT/'feed.xml').write_text(''.join(rss),encoding='utf-8')
    urls=[site+'/']+[site+'/'+a['url'].lstrip('/') for a in items]
    (ROOT/'sitemap.xml').write_text("<?xml version='1.0' encoding='UTF-8'?><urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'>"+''.join('<url><loc>'+html.escape(u)+'</loc></url>' for u in urls)+'</urlset>',encoding='utf-8')
    print('Published',len(items),'stories')
if __name__=='__main__': main()
