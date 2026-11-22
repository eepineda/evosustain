const SUPABASE_URL = "https://poywsdigujbarvnzbfnz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f";
const now = new Date();
const date = document.getElementById("today");
let currentLanguage=localStorage.getItem("evoford-news-language")==="en"?"en":"es";
const translations={es:{edition:"EDICIÓN DIGITAL",print:"Imprimir edición",markets:"MERCADOS",marketData:"INDICADORES FINANCIEROS · DATOS DE TRADINGVIEW",marketNote:"Los datos pueden tener retraso según el mercado y el proveedor. No constituyen asesoramiento financiero.",international:"Enfoque internacional",coverage:"COBERTURA POR PAÍSES",uk:"Reino Unido",do:"República Dominicana",spain:"España",front:"EN PORTADA",live:"ACTUALIDAD",latest:"ÚLTIMAS",latestPublications:"Últimas publicaciones",published:"ARTÍCULOS PUBLICADOS",opinion:"ESPACIO DE OPINIÓN",ideas:"Ideas, argumentos y análisis.",opinionText:"Los artículos de opinión aparecen identificados y separados de las noticias.",origin:"Conoce el origen y el plan editorial de Evoford News ↗",authors:"AUTORES Y COLABORADORES",latestOpinion:"ÚLTIMO ARTÍCULO DE OPINIÓN",sections:"Secciones",explore:"EXPLORA EVOFORD NEWS",politics:"Política",security:"Seguridad y defensa",economy:"Economía",technology:"Startups e innovación",world:"Internacional",analysis:"Opinión y análisis",aula:"Aula de Innovación",read:"Leer noticia ↗",readArticle:"Leer artículo",readFeature:"Leer reportaje",empty:"Todavía no hay artículos publicados.",noCountry:"Aún no hay artículos publicados con esta etiqueta. La cobertura aparecerá aquí cuando la redacción publique noticias de este país.",footer:"Noticias · Opinión · Análisis",author:"POR",source:"EDICIÓN LONDRES"},en:{edition:"DIGITAL EDITION",print:"Print edition",markets:"MARKETS",marketData:"FINANCIAL INDICATORS · TRADINGVIEW DATA",marketNote:"Market data may be delayed depending on the exchange and provider. Not financial advice.",international:"International coverage",coverage:"COUNTRY COVERAGE",uk:"United Kingdom",do:"Dominican Republic",spain:"Spain",front:"TOP STORY",live:"LATEST",latest:"LATEST",latestPublications:"Latest stories",published:"PUBLISHED ARTICLES",opinion:"OPINION",ideas:"Ideas, arguments and analysis.",opinionText:"Opinion articles are clearly identified and separated from news reporting.",origin:"Read about the origins and editorial plan of Evoford News ↗",authors:"AUTHORS & CONTRIBUTORS",latestOpinion:"LATEST OPINION ARTICLE",sections:"Sections",explore:"EXPLORE EVOFORD NEWS",politics:"Politics",security:"Security & defence",economy:"Economy",technology:"Startups & innovation",world:"International",analysis:"Opinion & analysis",aula:"Innovation Academy",read:"Read story ↗",readArticle:"Read article",readFeature:"Read full story",empty:"There are no published articles yet.",noCountry:"No articles have been published under this country yet. Coverage will appear here when the newsroom publishes a story.",footer:"News · Opinion · Analysis",author:"BY",source:"LONDON EDITION"}};
const tr=key=>translations[currentLanguage][key]||key;
function categoryLabel(value){const map={Internacional:"International",Política:"Politics",Economía:"Economy",Seguridad:"Security",Tecnología:"Technology",Opinión:"Opinion",Clima:"Climate",Sociedad:"Society"};return currentLanguage==="en"?(map[value]||value):value;}
function setLanguage(lang){currentLanguage=lang==="en"?"en":"es";localStorage.setItem("evoford-news-language",currentLanguage);try{const url=new URL(window.location.href);url.searchParams.set("lang",currentLanguage);window.history.replaceState({}, "", url.pathname+url.search+url.hash);}catch(e){}renderStaticLanguage();if(date)date.textContent=new Date().toLocaleDateString(currentLanguage==="en"?"en-GB":"es-ES",{day:"numeric",month:"long",year:"numeric"});if(publishedArticlesCache)renderPublishedArticles(publishedArticlesCache);else loadPublishedArticles();loadOpinionAuthors();window.dispatchEvent(new CustomEvent("evoford:languagechange",{detail:{language:currentLanguage}}));}
function renderStaticLanguage(){
 const set=(selector,text)=>{const el=document.querySelector(selector);if(el)el.textContent=text;};
 const en=currentLanguage==="en";
 document.documentElement.lang=currentLanguage;
 document.querySelectorAll("[data-language]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.language===currentLanguage)));
 // Los nombres del Evoford Ecosystem son marcas corporativas y no se traducen.
 set(".topline span:first-child",en?"LONDON · UNITED KINGDOM":"LONDRES · REINO UNIDO");
 set(".topline span:last-child",en?"NEWS · OPINION · ANALYSIS":"INFORMACIÓN · OPINIÓN · ANÁLISIS");
 document.querySelectorAll("[data-pwa-tu-label]").forEach(el=>el.textContent=en?"Your Republic":"Tu República");
 // El menú principal lo traduce app-navigation.js mediante data-es/data-en.
 // No traducir por posición: el número de enlaces puede variar entre vistas y
 // desplazaría la etiqueta de Edición impresa a otro destino.
 const topicLabels=en
  ? ["Politics","Security & defence","Economy","Startups & innovation","Innovation Academy","International","Opinion & analysis"]
  : ["Política","Seguridad y defensa","Economía","Startups e innovación","Aula de Innovación","Internacional","Opinión y análisis"];
 const topics=document.querySelector(".topics");
 if(topics){
  topics.querySelectorAll("a").forEach((el,i)=>{
   const current=(el.textContent||"").trim().toLowerCase();
   if(current.startsWith("aula de innovación")||current.startsWith("innovation academy"))el.setAttribute("href","aula-innovacion.html");
   if(current.startsWith("startups"))el.setAttribute("href","startups.html");
   const arrow=el.querySelector("span");
   if(topicLabels[i]){el.firstChild.textContent=topicLabels[i]+" ";if(arrow)arrow.textContent="→";}
  });
 }
 set("#editionLabel",tr("edition"));
 const print=document.getElementById("printEditionBtn");if(print)print.innerHTML=tr("print")+" <span aria-hidden='true'>↗</span>";
 set(".market-heading .kicker",tr("markets"));set(".market-heading span:last-child",tr("marketData"));set(".market-note",tr("marketNote"));
 set(".country-desk .section-head h2",tr("international"));set(".country-desk .section-head span",tr("coverage"));
 const countryLinks=document.querySelectorAll(".country-links a");
 [tr("uk"),tr("do"),tr("spain")].forEach((v,i)=>{if(countryLinks[i])countryLinks[i].lastChild.textContent=" "+v;});
 set(".frontpage-top .kicker",tr("front"));const live=document.querySelector(".live-mark");if(live)live.innerHTML="<i></i> "+tr("live");
 const latest=document.querySelector(".aside-heading");if(latest)latest.innerHTML="<span>"+(en?"IN DEVELOPMENT":"EN DESARROLLO")+"</span><span>"+tr("latest")+"</span>";
 const fallback=document.querySelector("#latestBriefs");
 if(fallback && !fallback.querySelector(".brief-link"))fallback.innerHTML=(en?[
  ["Reporting","Verified facts and identified sources."],["Context","The key points behind every event."],["Opinion","Signed analysis, clearly separated from reporting."]
 ]:[["Información","Hechos contrastados y fuentes identificadas."],["Contexto","Claves para entender cada acontecimiento."],["Opinión","Análisis firmado y diferenciado de la información."]]).map((x,i)=>'<div class="brief"><span class="number">'+String(i+1).padStart(2,"0")+'</span><div><b>'+x[0]+'</b><p>'+x[1]+'</p></div></div>').join("");
 set("#latest-publications .section-head h2",tr("latestPublications"));set("#latest-publications .section-head span",tr("published"));
 set(".opinion-intro > .kicker",tr("opinion"));set(".opinion h2",tr("ideas"));set(".opinion-intro > p",tr("opinionText"));set(".opinion .read-link",tr("origin"));set(".opinion-authors-heading",tr("authors"));set("#latestOpinion > .kicker",tr("latestOpinion"));
 set("#secciones .section-head h2",tr("sections"));set("#secciones .section-head span",tr("explore"));
 const keys=["politics","security","economy","technology","aula","world","analysis"];
 document.querySelectorAll(".topics a").forEach((el,i)=>{const arrow=el.querySelector("span");el.firstChild.textContent=tr(keys[i])+" ";if(arrow)arrow.textContent="→";});
 const author=document.querySelector(".author");if(author){const spans=author.querySelectorAll("span");const labels= en?["Columnist · Entrepreneur · Information Technology Professional","University education in Spain · BSc (Hons) Cyber Security in progress · London, England"]:["Articulista · Emprendedor · Profesional de Tecnologías de la Información","Formación universitaria en España · BSc (Hons) Cyber Security en curso · Londres, Inglaterra"];spans.forEach((el,i)=>{if(i<labels.length)el.textContent=labels[i];});}
 const footer=document.querySelector("body > footer");
 if(footer){
  let adLink=null,accessLink=null,aboutLink=null;
  footer.querySelectorAll("a").forEach(link=>{
   const label=link.textContent;
   if(!adLink&&/publicidad|advertise|anúnciate/i.test(label))adLink=link;
   if(!accessLink&&/editorial access|acceso editorial/i.test(label))accessLink=link;
   if(!aboutLink&&/about evoford|sobre/i.test(label))aboutLink=link;
  });
  const footerText=footer.querySelector(":scope > span");
  if(footerText)footerText.textContent=tr("footer");
  if(adLink)adLink.textContent=en?"Advertise":"Anúnciate";
  if(adLink&&accessLink)accessLink.textContent=en?"Editorial access":"Acceso editorial";
  if(adLink&&aboutLink)aboutLink.textContent=en?"About Evoford News":"Sobre / About Evoford News";
  const yearLabel=footer.querySelector("span:last-child");
  if(yearLabel && yearLabel.querySelector("#year"))yearLabel.innerHTML="© <span id='year'>"+new Date().getFullYear()+"</span> Evoford";
 }
}

const year = document.getElementById("year");
if (date) date.textContent = now.toLocaleDateString(currentLanguage==="en"?"en-GB":"es-ES",{day:"numeric",month:"long",year:"numeric"});
if (year) year.textContent = now.getFullYear();

function escapeHtml(value="") {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function shortArticleToken(id){
  const hex=String(id||"").replace(/-/g,"").toLowerCase();
  if(!/^[0-9a-f]{32}$/.test(hex))return "";
  let binary="";
  for(let i=0;i<32;i+=2)binary+=String.fromCharCode(parseInt(hex.slice(i,i+2),16));
  return btoa(binary).replace(/[+]/g,"-").replace(/[/]/g,"_").replace(/=+$/,"");
}
function articleUrl(article){
  const token=shortArticleToken(article&&article.id);
  return token?"a.html?i="+token:"articles/plantilla-articulo.html?slug="+encodeURIComponent(article&&article.slug||"");
}
function categoryInitials(value){
  const normalized=String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/&/g," y ");
  const aliases={
    "internacional":"IN","international":"IN","mundo":"IN","world":"IN",
    "economia":"EC","economy":"EC",
    "politica":"PO","politics":"PO",
    "seguridad":"SE","seguridad y defensa":"SD","security":"SE","security and defence":"SD","security & defence":"SD",
    "tecnologia":"TE","technology":"TE","startups":"ST","startups e innovacion":"SI","startups and innovation":"SI",
    "opinion":"OP","opinion y analisis":"OA","opinion and analysis":"OA",
    "sociedad":"SO","society":"SO","clima":"CL","climate":"CL",
    "evoford briefing":"EB","aula de innovacion":"AI","innovation academy":"IA"
  };
  if(aliases[normalized])return aliases[normalized];
  const words=normalized.split(/[^a-z0-9]+/).filter(word=>word&&!["y","and","de","the","e"].includes(word));
  return words.slice(0,2).map(word=>word[0].toUpperCase()).join("")||"EV";
}
function articleImage(a,cls="") {
  const slug=String(a.slug||"");
  const editorialPhoto=slug.includes("fresh-concerns-raised-over-gaza-doctor")
    ? "https://www.amnesty.ie/wp-content/uploads/2025/01/Photo-5-Dr-Hussam-Abu-Safiya.jpeg"
    : "";
  const src=(a.image_url && /^https:\/\//i.test(a.image_url)) ? a.image_url : editorialPhoto;
  if (src) return '<img class="'+cls+'" src="' + escapeHtml(src) + '" alt="' + escapeHtml(a.title||"") + '" loading="lazy">';
  return '<div class="story-art '+(cls?cls+" ":"")+'art-blue"><span>'+escapeHtml(categoryInitials(a.category))+'</span></div>';
}
let publishedArticlesCache = null;
let publishedArticlesLoadPromise = null;

function showCoverageFallback(message) {
  const root=document.getElementById("countryCoverage");
  if(root) root.innerHTML='<div class="country-card"><p class="country-empty">'+message+'</p></div>';
}

async function loadPublishedArticles() {
  const container = document.getElementById("publishedArticles");
  if (!container) return;
  if (!window.supabase) {
    container.innerHTML='<p class="muted">No se pudo conectar con el servicio de noticias. Recarga la página.</p>';
    showCoverageFallback("No se pudo cargar la cobertura. Recarga la página.");
    return;
  }
  if (publishedArticlesCache) {
    renderPublishedArticles(publishedArticlesCache);
    return;
  }
  if (publishedArticlesLoadPromise) return publishedArticlesLoadPromise;

  publishedArticlesLoadPromise = (async () => {
    const client = window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
    let {data,error} = await client.from("articles").select("id,title,title_en,slug,category,author,summary,summary_en,image_url,created_at,country,region,is_featured")
      .eq("status","published").order("created_at",{ascending:false}).limit(30);
    if(error && String(error.message||"").includes("title_en")){
      ({data,error}=await client.from("articles").select("id,title,slug,category,author,summary,image_url,created_at,country,region,is_featured")
        .eq("status","published").order("created_at",{ascending:false}).limit(30));
    }
    if (error) {
      container.innerHTML='<p class="muted">'+(currentLanguage==="en"?"Stories could not be loaded. Please try again later.":"No se pudieron cargar las publicaciones. Inténtalo más tarde.")+'</p>';
      showCoverageFallback(currentLanguage==="en"?"Coverage could not be loaded. Please reload the page.":"No se pudo cargar la cobertura. Recarga la página.");
      console.error("Evoford News:",error.message);
      return;
    }
    publishedArticlesCache = data || [];
    renderPublishedArticles(publishedArticlesCache);
    window.dispatchEvent(new CustomEvent("evoford:articles-loaded"));
  })().catch(error => {
    container.innerHTML='<p class="muted">'+(currentLanguage==="en"?"A connection error prevented stories from loading.":"Un error de conexión impidió cargar las noticias.")+'</p>';
    showCoverageFallback(currentLanguage==="en"?"A connection error prevented coverage from loading.":"Un error de conexión impidió cargar la cobertura.");
    console.error("Evoford News load:",error);
  });

  try {
    await publishedArticlesLoadPromise;
  } finally {
    publishedArticlesLoadPromise = null;
  }
}

function renderPublishedArticles(articles) {
  const container = document.getElementById("publishedArticles");
  if (!container) return;
  if (!articles?.length) {
    container.innerHTML='<p class="muted">'+tr("empty")+'</p>';
    const root=document.getElementById("countryCoverage");
    if(root) root.innerHTML=[
      {id:"uk",name:tr("uk"),flag:"🇬🇧"},
      {id:"do",name:tr("do"),flag:"🇩🇴"},
      {id:"es",name:tr("spain"),flag:"🇪🇸"}
    ].map(country=>'<section class="country-card" id="country-'+country.id+'"><div class="country-title"><span class="country-flag" aria-hidden="true">'+country.flag+'</span><h3>'+country.name+'</h3></div><p class="country-empty">'+tr("noCountry")+'</p></section>').join("");
    return;
  }
  const normalize=value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  const articleOrder=new Map();
  const articlesByCategory=new Map(),articlesByCountry=new Map();
  const frontStories=[],remaining=[],frontStorySlugs=new Set();
  let opinionArticle=null;
  for(let articleIndex=0;articleIndex<articles.length;articleIndex++){
    const article=articles[articleIndex];
    articleOrder.set(article,articleIndex);
    const category=normalize(article.category),country=normalize(article.country);
    if(category){
      if(!articlesByCategory.has(category))articlesByCategory.set(category,[]);
      articlesByCategory.get(category).push(article);
      if(!opinionArticle&&category.includes("opinion"))opinionArticle=article;
    }
    if(country){
      if(!articlesByCountry.has(country))articlesByCountry.set(country,[]);
      articlesByCountry.get(country).push(article);
    }
    if(article.is_featured===true&&frontStories.length<2&&!category.includes("opinion")){
      frontStories.push(article);
      frontStorySlugs.add(article.slug);
    }else if(!frontStorySlugs.has(article.slug)){
      remaining.push(article);
    }
  }
  const latestFromIndex=(index,terms,limit=3)=>{
    const lists=[],positions=[];
    for(const term of terms){lists.push(index.get(term)||[]);positions.push(0);}
    const matches=[],seen=new Set();
    while(matches.length<limit){
      let selected=-1,selectedOrder=Infinity;
      for(let i=0;i<lists.length;i++){
        const candidate=lists[i][positions[i]];
        if(candidate){
          const order=articleOrder.get(candidate);
          if(order<selectedOrder){selected=i;selectedOrder=order;}
        }
      }
      if(selected<0)break;
      const candidate=lists[selected][positions[selected]++];
      if(!seen.has(candidate)){seen.add(candidate);matches.push(candidate);}
    }
    return matches;
  };
  const opinionRoot=document.getElementById("latestOpinion");
  if(opinionRoot){
    const label=currentLanguage==="en"?"LATEST OPINION ARTICLE":"ÚLTIMO ARTÍCULO DE OPINIÓN";
    const readLabel=currentLanguage==="en"?"READ ARTICLE":"LEER ARTÍCULO";
    if(opinionArticle){
      opinionRoot.innerHTML='<span class="kicker">'+label+'</span><a class="opinion-article-link" href="'+articleUrl(opinionArticle)+'"><h3>'+escapeHtml(currentLanguage==="en"?(opinionArticle.title_en||opinionArticle.title):opinionArticle.title)+'</h3><p>'+escapeHtml(currentLanguage==="en"?(opinionArticle.summary_en||opinionArticle.summary||""):(opinionArticle.summary||""))+'</p><span class="read-link">'+readLabel+' ↗</span></a>';
    }else{
      opinionRoot.innerHTML='<span class="kicker">'+label+'</span><p class="muted">'+(currentLanguage==="en"?"No opinion articles have been published yet.":"Todavía no hay artículos de opinión publicados.")+'</p>';
    }
  }

  const briefItems=remaining.slice(0,3);
  const publicationItems=remaining.slice(3,9);
  const feature=document.getElementById("featuredStory");
  if(feature){
    feature.classList.add("feature-pair-shell");
    feature.innerHTML='<div class="feature-pair">'+frontStories.map((a,i)=>{
      const title=currentLanguage==="en"?(a.title_en||a.title):a.title;
      const summary=currentLanguage==="en"?(a.summary_en||a.summary||""):(a.summary||"");
      const isBriefing=String(a.category||"").toLowerCase()==="evoford briefing" || String(a.slug||"").includes("evoford-briefing");
      return '<article class="feature-card'+(i===0?' feature-card-lead':'')+(isBriefing?' feature-card-briefing':'')+'"><a class="feature-card-image" href="'+articleUrl(a)+'">'+articleImage(a,"feature-image")+(!isBriefing&&i===0?'<span class="image-stamp">EVOFORD<br>NEWS</span>':'')+'</a><div class="feature-copy"><div class="kicker">'+escapeHtml(categoryLabel(a.category||"INTERNACIONAL"))+'</div>'+(i===0?'<h1>':'<h2>')+'<a href="'+articleUrl(a)+'">'+escapeHtml(title)+'</a>'+(i===0?'</h1>':'</h2>')+'<p class="dek">'+escapeHtml(summary)+'</p><div class="feature-meta"><span>'+tr("author")+' '+escapeHtml(a.author||"EVOFORD NEWS")+'</span><span>'+tr("source")+'</span></div><a class="feature-cta" href="'+articleUrl(a)+'">'+tr("readFeature")+' <b>↗</b></a></div></article>';
    }).join("")+'</div>';
  }
  const briefs=document.getElementById("latestBriefs");
  if(briefs) briefs.innerHTML=briefItems.map((a,i)=>'<a class="brief brief-link" href="'+articleUrl(a)+'"><span class="number">'+String(i+1).padStart(2,"0")+'</span><div><span class="brief-category">'+escapeHtml(categoryLabel(a.category||"INTERNACIONAL"))+'</span><b>'+escapeHtml(currentLanguage==="en"?(a.title_en||a.title):a.title)+'</b><p>'+escapeHtml(currentLanguage==="en"?(a.summary_en||a.summary||""):(a.summary||""))+'</p></div><span class="brief-arrow">↗</span></a>').join("")||'<p class="muted">'+(currentLanguage==="en"?"More stories coming soon.":"Más noticias próximamente.")+'</p>';
  container.innerHTML=publicationItems.map((a,i)=>'<article class="story reveal" style="--delay:'+i*70+'ms"><a class="story-link" href="'+articleUrl(a)+'">'+articleImage(a,"story-image")+
    '<div class="story-copy"><div class="kicker">'+escapeHtml(categoryLabel(a.category||"INTERNACIONAL"))+'</div><h3>'+escapeHtml(currentLanguage==="en"?(a.title_en||a.title):a.title)+'</h3><p>'+escapeHtml(currentLanguage==="en"?(a.summary_en||a.summary||""):(a.summary||""))+'</p></div></a>'+
    '<div class="lead-meta">'+escapeHtml(a.author||"EVOFORD NEWS")+'</div><a href="'+articleUrl(a)+'" class="read-link">'+tr("readArticle")+' <span>↗</span></a></article>').join("");
  const countryRoot=document.getElementById("countryCoverage");
  if(countryRoot){
    const editions=[
      {id:"uk",name:tr("uk"),flag:"🇬🇧",terms:["reino unido","united kingdom","uk","inglaterra","escocia","gales","irlanda del norte"]},
      {id:"do",name:tr("do"),flag:"🇩🇴",terms:["republica dominicana","dominican republic","rd"]},
      {id:"es",name:tr("spain"),flag:"🇪🇸",terms:["espana","spain"]}
    ];
    countryRoot.innerHTML=editions.map(country=>{
      const matches=latestFromIndex(articlesByCountry,country.terms);
      const liveStories=matches.map(a=>'<a class="country-story" href="'+articleUrl(a)+'"><span class="kicker">'+escapeHtml(categoryLabel(a.category||"ACTUALIDAD"))+'</span><b>'+escapeHtml(currentLanguage==="en"?(a.title_en||a.title):a.title)+'</b><span class="country-read">'+tr("read")+'</span></a>').join("");
      const stories=liveStories||'<p class="country-empty">'+tr("noCountry")+'</p>';
      return '<section class="country-card" id="country-'+country.id+'"><div class="country-title"><span class="country-flag" aria-hidden="true">'+country.flag+'</span><h3>'+country.name+'</h3></div>'+stories+'</section>';
    }).join("");
  }
  const sectionRoot=document.getElementById("sectionFeeds");
  if(sectionRoot){
    const sections=[
      {name:tr("world"),id:"internacional",terms:["internacional","mundo"]},
      {name:tr("politics"),id:"politica",terms:["politica"]},
      {name:tr("economy"),id:"economia",terms:["economia"]},
      {name:tr("security"),id:"seguridad",terms:["seguridad","defensa"]},
      {name:currentLanguage==="en"?"Technology":"Tecnología",id:"tecnologia",terms:["tecnologia"]},
      {name:tr("analysis"),id:"opinion-analisis",terms:["opinion","opinion y analisis","analisis"]}
    ];
    const normalize=value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
    sectionRoot.innerHTML=sections.map(section=>{
      const matches=latestFromIndex(articlesByCategory,section.terms);

      const cards=matches.map((a,i)=>{
        const dateText=a.created_at?new Date(a.created_at).toLocaleDateString(currentLanguage==="en"?"en-GB":"es-ES",{day:"numeric",month:"short",year:"numeric"}):"";
        return '<article class="story reveal" style="--delay:'+i*60+'ms"><a class="story-link" href="'+articleUrl(a)+'">'+articleImage(a,"story-image")+'<div class="story-copy"><div class="kicker">'+escapeHtml(categoryLabel(section.name))+'</div><h3>'+escapeHtml(currentLanguage==="en"?(a.title_en||a.title):a.title)+'</h3><p>'+escapeHtml(currentLanguage==="en"?(a.summary_en||a.summary||""):(a.summary||""))+'</p></div></a><div class="lead-meta">'+escapeHtml(a.author||"EVOFORD NEWS")+(dateText?" · "+escapeHtml(dateText):"")+'</div><a href="'+articleUrl(a)+'" class="read-link">'+tr("readArticle")+' <span>↗</span></a></article>';
      }).join("");
      const sectionContent=cards||'<p class="muted">'+(currentLanguage==="en"?"No stories in this section yet.":"Todavía no hay noticias en esta sección.")+'</p>';
      const academyPromo=section.id==="tecnologia"?(currentLanguage==="en"?'<aside class="technology-academy-promo"><div class="technology-academy-mark">EVOFORD ACADEMY</div><div class="technology-academy-copy"><h3>Learn beyond the headlines</h3><p>Explore practical courses and learning pathways connected to technology, artificial intelligence, cybersecurity and digital innovation.</p></div><a href="aula-innovacion.html">Explore Academy <span aria-hidden="true">↗</span></a></aside>':'<aside class="technology-academy-promo"><div class="technology-academy-mark">EVOFORD ACADEMY</div><div class="technology-academy-copy"><h3>Aprende más allá de las noticias</h3><p>Explora cursos prácticos e itinerarios formativos vinculados con tecnología, inteligencia artificial, ciberseguridad e innovación digital.</p></div><a href="aula-innovacion.html">Explorar Academy <span aria-hidden="true">↗</span></a></aside>'):"";
      return '<section class="section category-section" id="section-'+section.id+'"><div class="section-head"><h2>'+section.name+'</h2><span>'+(currentLanguage==="en"?"LATEST STORIES":"ÚLTIMAS PUBLICACIONES")+'</span></div><div class="cards">'+sectionContent+'</div>'+academyPromo+'</section>';
    }).join("");
    if(location.hash){
      const anchorId=decodeURIComponent(location.hash.slice(1));
      const scrollToSection=()=>{
        const target=document.getElementById(anchorId);
        if(!target)return false;
        const top=target.getBoundingClientRect().top+window.scrollY-88;
        window.scrollTo({top:Math.max(0,top),behavior:"smooth"});
        return true;
      };
      // Do not wait for images above the target: lazy-loaded images may never
      // load until the page scrolls, which would deadlock section navigation.
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if(!scrollToSection())window.setTimeout(scrollToSection,180);
      }));
    }
  }

}
function opinionAuthorText(author,field){
 const isEdwin=String(author.name||"").trim().toLowerCase()==="edwin pineda carrasco";
 if(currentLanguage!=="en"||!isEdwin)return author[field]||"";
 if(field==="profession")return "Columnist · Entrepreneur · Technology & Cybersecurity";
 if(field==="bio")return "Edwin Pineda Carrasco is a columnist, entrepreneur and information technology professional. He holds university qualifications from Spain and is currently pursuing a BSc (Hons) in Cyber Security in London, United Kingdom. His interests include innovation, entrepreneurship, technology, digital transformation, cybersecurity and current affairs. Through Evoford News, he shares perspectives on the technological, economic and social challenges shaping our time.";
 return author[field]||"";
}
let opinionAuthorsCache=null;
let opinionAuthorsLoadPromise=null;
function renderOpinionAuthors(root,data){
 if(!data?.length){root.innerHTML='<p class="muted">'+(currentLanguage==="en"?"Author profiles will appear here soon.":"Los perfiles de los autores aparecerán aquí próximamente.")+'</p>';return;}
 root.innerHTML='<div class="opinion-authors-heading">'+(currentLanguage==="en"?"AUTHORS & CONTRIBUTORS":"AUTORES Y COLABORADORES")+'</div>'+data.map(author=>'<article class="opinion-author">'+(author.photo_url&&/^https:\/\//i.test(author.photo_url)?'<img class="opinion-author-photo" src="'+escapeHtml(author.photo_url)+'" alt="Retrato de '+escapeHtml(author.name)+'" loading="lazy">':'<span class="opinion-author-placeholder" aria-hidden="true">'+escapeHtml(author.name.trim().slice(0,1).toUpperCase())+'</span>')+'<div class="opinion-author-copy"><h3>'+escapeHtml(author.name)+'</h3>'+(opinionAuthorText(author,"profession")?'<p class="opinion-author-profession">'+escapeHtml(opinionAuthorText(author,"profession"))+'</p>':'')+(opinionAuthorText(author,"bio")?'<p>'+escapeHtml(opinionAuthorText(author,"bio"))+'</p>':'')+'</div></article>').join("");
}
async function loadOpinionAuthors(){
 const root=document.getElementById("opinionAuthors");if(!root||!window.supabase)return;
 if(opinionAuthorsCache){renderOpinionAuthors(root,opinionAuthorsCache);return;}
 if(opinionAuthorsLoadPromise){await opinionAuthorsLoadPromise;return;}
 opinionAuthorsLoadPromise=(async()=>{
  const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
  const {data,error}=await client.from("opinion_authors").select("name,profession,bio,photo_url").eq("active",true).order("display_order",{ascending:true}).order("name",{ascending:true});
  if(error){root.innerHTML='<p class="muted">'+(currentLanguage==="en"?"Authors could not be loaded.":"No se pudieron cargar los autores.")+'</p>';console.error("Evoford News authors:",error.message);return;}
  opinionAuthorsCache=data||[];
  renderOpinionAuthors(root,opinionAuthorsCache);
 })();
 try{await opinionAuthorsLoadPromise;}finally{opinionAuthorsLoadPromise=null;}
}

const EVO_FAV_KEY="evoford-news-favorites-v1";
function getSavedIds(){try{return JSON.parse(localStorage.getItem(EVO_FAV_KEY)||"[]").filter(x=>typeof x==="string");}catch(_){return [];}}
function setSavedIds(ids){try{localStorage.setItem(EVO_FAV_KEY,JSON.stringify([...new Set(ids)]));}catch(_){}}
function savedArticles(){const ids=new Set(getSavedIds());return (publishedArticlesCache||[]).filter(a=>ids.has(a.id));}
function favoriteButton(article){const saved=getSavedIds().includes(article.id);return '<button type="button" class="story-favorite" data-favorite-id="'+escapeHtml(article.id)+'" aria-pressed="'+saved+'" aria-label="'+(saved?'Quitar de favoritos':'Guardar en favoritos')+'">'+(saved?'♥':'♡')+'</button>';}
function updateFavoriteButtons(){document.querySelectorAll("[data-favorite-id]").forEach(button=>{const saved=getSavedIds().includes(button.dataset.favoriteId);const pressed=String(saved);const symbol=saved?"♥":"♡";const label=saved?"Quitar de favoritos":"Guardar en favoritos";if(button.getAttribute("aria-pressed")!==pressed)button.setAttribute("aria-pressed",pressed);if(button.textContent!==symbol)button.textContent=symbol;if(button.getAttribute("aria-label")!==label)button.setAttribute("aria-label",label);});const count=document.getElementById("savedStoriesCount");if(count){const value=String(getSavedIds().length);if(count.textContent!==value)count.textContent=value;}}
function readerText(es,en){return currentLanguage==="en"?en:es;}
function translateReaderTools(){
 const en=currentLanguage==="en";
 const heading=document.querySelector("#readerTools h2");
 if(heading)heading.textContent=readerText("Encuentra y guarda noticias","Find and save stories");
 const fav=document.getElementById("showSavedStories");
 if(fav){const count=document.getElementById("savedStoriesCount")?.textContent||"0";fav.innerHTML=(en?"♡ My favourites ":"♡ Mis favoritos ")+ '<span id="savedStoriesCount">'+count+'</span>';}
 const input=document.getElementById("newsSearchInput");
 if(input)input.placeholder=readerText("Buscar noticias, temas, autores o países…","Search stories, topics, authors or countries…");
 const categories=document.getElementById("newsCategoryFilter");
 if(categories&&categories.options.length){categories.options[0].text=readerText("Todas las secciones","All sections");Array.from(categories.options).slice(1).forEach(o=>o.text=categoryLabel(o.value));}
 const countries=document.getElementById("newsCountryFilter");
 if(countries&&countries.options.length){countries.options[0].text=readerText("Todos los países","All countries");Array.from(countries.options).slice(1).forEach(o=>{const map={"Reino Unido":"United Kingdom","República Dominicana":"Dominican Republic","España":"Spain"};o.text=en?(map[o.value]||o.value):o.value;});}
 const panel=document.querySelector("#savedStoriesPanel .reader-panel-heading strong");
 if(panel)panel.textContent=readerText("Mis noticias guardadas","My saved stories");
 const close=document.getElementById("closeSavedStories");
 if(close)close.setAttribute("aria-label",readerText("Cerrar favoritos","Close favourites"));
 renderNewsSearch();
 if(!document.getElementById("savedStoriesPanel")?.hidden)renderSavedStories();
}
function renderSavedStories(){const root=document.getElementById("savedStoriesList");if(!root)return;const list=savedArticles();root.innerHTML=list.length?list.map(a=>'<article class="reader-result"><div><span class="kicker">'+escapeHtml(categoryLabel(a.category||"EVOFORD NEWS"))+'</span><a href="'+articleUrl(a)+'">'+escapeHtml(currentLanguage==="en"?(a.title_en||a.title):a.title)+'</a></div>'+favoriteButton(a)+'</article>').join(""):'<p class="muted">Todavía no has guardado noticias en este dispositivo.</p>';updateFavoriteButtons();}
function renderNewsSearch(){const root=document.getElementById("newsSearchResults");if(!root)return;const q=(document.getElementById("newsSearchInput")?.value||"").trim().toLocaleLowerCase();const category=document.getElementById("newsCategoryFilter")?.value||"";const country=document.getElementById("newsCountryFilter")?.value||"";if(!q&&!category&&!country){root.hidden=true;root.innerHTML="";return;}const matches=(publishedArticlesCache||[]).filter(a=>{const text=[a.title,a.title_en,a.title_es,a.summary,a.summary_en,a.summary_es,a.category,a.author,a.country,a.region].join(" ").toLocaleLowerCase();return (!q||text.includes(q))&&(!category||a.category===category)&&(!country||a.country===country);}).slice(0,30);root.hidden=false;root.innerHTML=matches.length?'<div class="reader-panel-heading"><strong>'+matches.length+' '+readerText('resultado(s)','result(s)')+'</strong></div>'+matches.map(a=>'<article class="reader-result"><div><span class="kicker">'+escapeHtml(categoryLabel(a.category||"EVOFORD NEWS"))+' · '+escapeHtml(a.country||"")+'</span><a href="'+articleUrl(a)+'">'+escapeHtml(currentLanguage==="en"?(a.title_en||a.title):a.title)+'</a><p>'+escapeHtml(currentLanguage==="en"?(a.summary_en||a.summary||""):(a.summary||""))+'</p></div>'+favoriteButton(a)+'</article>').join("") :'<p class="muted">'+readerText('No se encontraron noticias con esos criterios.','No stories match your search.')+'</p>';updateFavoriteButtons();}
function initialiseReaderTools(){const input=document.getElementById("newsSearchInput");if(!input)return;const categories=document.getElementById("newsCategoryFilter"),countries=document.getElementById("newsCountryFilter");const fill=(select,values,placeholder)=>{select.innerHTML='<option value="">'+placeholder+'</option>'+values.map(v=>'<option value="'+escapeHtml(v)+'">'+escapeHtml(v)+'</option>').join("");};const refreshFilters=()=>{const articles=publishedArticlesCache||[];fill(categories,[...new Set(articles.map(a=>a.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b)),"Todas las secciones");fill(countries,[...new Set(articles.map(a=>a.country).filter(Boolean))].sort((a,b)=>a.localeCompare(b)),"Todos los países");};input.addEventListener("input",renderNewsSearch);categories.addEventListener("change",renderNewsSearch);countries.addEventListener("change",renderNewsSearch);document.getElementById("showSavedStories")?.addEventListener("click",()=>{const panel=document.getElementById("savedStoriesPanel");panel.hidden=!panel.hidden;document.getElementById("showSavedStories").setAttribute("aria-expanded",String(!panel.hidden));if(!panel.hidden)renderSavedStories();});document.getElementById("closeSavedStories")?.addEventListener("click",()=>{document.getElementById("savedStoriesPanel").hidden=true;document.getElementById("showSavedStories").setAttribute("aria-expanded","false");});document.addEventListener("click",event=>{const button=event.target.closest("[data-favorite-id]");if(!button)return;event.preventDefault();event.stopPropagation();const id=button.dataset.favoriteId;const ids=getSavedIds();setSavedIds(ids.includes(id)?ids.filter(x=>x!==id):[...ids,id]);updateFavoriteButtons();renderNewsSearch();if(!document.getElementById("savedStoriesPanel").hidden)renderSavedStories();});refreshFilters();updateFavoriteButtons();window.addEventListener("evoford:articles-loaded",refreshFilters);window.addEventListener("evoford:languagechange",translateReaderTools);translateReaderTools();}
initialiseReaderTools();
const favoriteObserver=new MutationObserver(()=>{if(publishedArticlesCache){document.querySelectorAll("#featuredStory .feature-card, #latestBriefs .brief-link, #publishedArticles .story").forEach(card=>{const href=card.querySelector("a[href]")?.getAttribute("href");const article=(publishedArticlesCache||[]).find(a=>articleUrl(a)===href);if(article&&!card.querySelector("[data-favorite-id]")){const button=document.createElement("button");button.type="button";button.className="story-favorite";button.dataset.favoriteId=article.id;button.textContent=getSavedIds().includes(article.id)?"♥":"♡";button.setAttribute("aria-pressed",String(getSavedIds().includes(article.id)));button.setAttribute("aria-label","Guardar en favoritos");card.appendChild(button);}});updateFavoriteButtons();}});
["featuredStory","publishedArticles"].forEach(id=>{const el=document.getElementById(id);if(el)favoriteObserver.observe(el,{childList:true,subtree:true});});
const printEditionButton=document.getElementById("printEditionBtn");
if(printEditionButton) printEditionButton.addEventListener("click",()=>window.print());


document.querySelectorAll("[data-language]").forEach(b=>b.addEventListener("click",()=>setLanguage(b.dataset.language)));
renderStaticLanguage();
loadPublishedArticles();
loadOpinionAuthors();