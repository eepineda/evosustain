const SUPABASE_URL = "https://poywsdigujbarvnzbfnz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f";
const now = new Date();
const date = document.getElementById("today");
let currentLanguage=localStorage.getItem("evoford-news-language")==="en"?"en":"es";
const translations={es:{edition:"EDICIÓN DIGITAL",print:"Imprimir edición",markets:"MERCADOS",marketData:"INDICADORES FINANCIEROS · DATOS DE TRADINGVIEW",marketNote:"Los datos pueden tener retraso según el mercado y el proveedor. No constituyen asesoramiento financiero.",international:"Enfoque internacional",coverage:"COBERTURA POR PAÍSES",uk:"Reino Unido",do:"República Dominicana",spain:"España",front:"EN PORTADA",live:"ACTUALIDAD",latest:"ÚLTIMAS",latestPublications:"Últimas publicaciones",published:"ARTÍCULOS PUBLICADOS",opinion:"ESPACIO DE OPINIÓN",ideas:"Ideas, argumentos y análisis.",opinionText:"Los artículos de opinión aparecen identificados y separados de las noticias.",origin:"Conoce el origen y el plan editorial de Evoford News ↗",sections:"Secciones",explore:"EXPLORA EVOFORD NEWS",politics:"Política",security:"Seguridad y defensa",economy:"Economía",technology:"Tecnología",world:"Internacional",analysis:"Opinión y análisis",read:"Leer noticia ↗",readArticle:"Leer artículo",readFeature:"Leer reportaje",empty:"Todavía no hay artículos publicados.",noCountry:"Aún no hay artículos publicados con esta etiqueta. La cobertura aparecerá aquí cuando la redacción publique noticias de este país.",footer:"Noticias · Opinión · Análisis",author:"POR",source:"EDICIÓN LONDRES"},en:{edition:"DIGITAL EDITION",print:"Print edition",markets:"MARKETS",marketData:"FINANCIAL INDICATORS · TRADINGVIEW DATA",marketNote:"Market data may be delayed depending on the exchange and provider. Not financial advice.",international:"International coverage",coverage:"COUNTRY COVERAGE",uk:"United Kingdom",do:"Dominican Republic",spain:"Spain",front:"TOP STORY",live:"LATEST",latest:"LATEST",latestPublications:"Latest stories",published:"PUBLISHED ARTICLES",opinion:"OPINION",ideas:"Ideas, arguments and analysis.",opinionText:"Opinion articles are clearly identified and separated from news reporting.",origin:"Read about the origins and editorial plan of Evoford News ↗",sections:"Sections",explore:"EXPLORE EVOFORD NEWS",politics:"Politics",security:"Security & defence",economy:"Economy",technology:"Technology",world:"International",analysis:"Opinion & analysis",read:"Read story ↗",readArticle:"Read article",readFeature:"Read full story",empty:"There are no published articles yet.",noCountry:"No articles have been published under this country yet. Coverage will appear here when the newsroom publishes a story.",footer:"News · Opinion · Analysis",author:"BY",source:"LONDON EDITION"}};
const tr=key=>translations[currentLanguage][key]||key;
function categoryLabel(value){const map={Internacional:"International",Política:"Politics",Economía:"Economy",Seguridad:"Security",Tecnología:"Technology",Opinión:"Opinion",Clima:"Climate",Sociedad:"Society"};return currentLanguage==="en"?(map[value]||value):value;}
function setLanguage(lang){currentLanguage=lang==="en"?"en":"es";localStorage.setItem("evoford-news-language",currentLanguage);document.documentElement.lang=currentLanguage;document.querySelectorAll("[data-language]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.language===currentLanguage)));renderStaticLanguage();loadPublishedArticles();}
function renderStaticLanguage(){const set=(selector,key)=>{const el=document.querySelector(selector);if(el)el.textContent=tr(key);};set("#editionLabel","edition");const print=document.getElementById("printEditionBtn");if(print)print.innerHTML=tr("print")+" <span aria-hidden='true'>↗</span>";set(".market-heading .kicker","markets");const mh=document.querySelector(".market-heading span:last-child");if(mh)mh.textContent=tr("marketData");const mn=document.querySelector(".market-note");if(mn)mn.textContent=tr("marketNote");set(".country-desk .section-head h2","international");set(".country-desk .section-head span","coverage");set(".frontpage-top .kicker","front");const live=document.querySelector(".live-mark");if(live)live.innerHTML="<i></i> "+tr("live");const latest=document.querySelector(".aside-heading");if(latest)latest.innerHTML="<span>"+(currentLanguage==="en"?"IN DEVELOPMENT":"EN DESARROLLO")+"</span><span>"+tr("latest")+"</span>";set("#latest-publications .section-head h2","latestPublications");set("#latest-publications .section-head span","published");set(".opinion .kicker","opinion");set(".opinion h2","ideas");set(".opinion p","opinionText");set(".opinion .read-link","origin");set("#secciones .section-head h2","sections");set("#secciones .section-head span","explore");const keys=["politics","security","economy","technology","world","analysis"];document.querySelectorAll(".topics a").forEach((a,i)=>{const arrow=a.querySelector("span");a.firstChild.textContent=tr(keys[i])+" ";if(arrow)arrow.textContent="→";});const foot=document.querySelector("footer>span");if(foot)foot.textContent=tr("footer");document.querySelectorAll(".country-links a").forEach((a,i)=>{a.lastChild.textContent=" "+tr(["uk","do","spain"][i]);});}

const year = document.getElementById("year");
if (date) date.textContent = now.toLocaleDateString(currentLanguage==="en"?"en-GB":"es-ES",{day:"numeric",month:"long",year:"numeric"});
if (year) year.textContent = now.getFullYear();

function escapeHtml(value="") {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function articleUrl(slug) {
  return "articles/plantilla-articulo.html?slug=" + encodeURIComponent(slug) + "&lang=" + currentLanguage;
}
function articleImage(a,cls="") {
  const slug=String(a.slug||"");
  const editorialPhoto=slug.includes("fresh-concerns-raised-over-gaza-doctor")
    ? "https://www.amnesty.ie/wp-content/uploads/2025/01/Photo-5-Dr-Hussam-Abu-Safiya.jpeg"
    : "";
  const src=(a.image_url && /^https:\/\//i.test(a.image_url)) ? a.image_url : editorialPhoto;
  if (src) return '<img class="'+cls+'" src="' + escapeHtml(src) + '" alt="' + escapeHtml(a.title||"") + '" loading="lazy">';
  return '<div class="story-art '+(cls?cls+" ":"")+'art-blue"><span>'+escapeHtml((a.category||"EV").slice(0,2).toUpperCase())+'</span></div>';
}
async function loadPublishedArticles() {
  const container = document.getElementById("publishedArticles");
  if (!container || !window.supabase) return;
  const client = window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
  const {data,error} = await client.from("articles").select("title,title_en,slug,category,author,summary,summary_en,image_url,created_at,country,region")
    .eq("status","published").order("updated_at",{ascending:false}).limit(30);
  if (error) {
    container.innerHTML='<p class="muted">'+(currentLanguage==="en"?"Stories could not be loaded. Please try again later.":"No se pudieron cargar las publicaciones. Inténtalo más tarde.")+'</p>';
    console.error("Evoford News:",error.message); return;
  }
  if (!data?.length) {
    container.innerHTML='<p class="muted">'+tr("empty")+'</p>'; return;
  }
  const normalize=value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  const featured=data.find(a=>!normalize(a.category).includes("opinion"))||data[0];
  const remaining=data.filter(a=>a.slug!==featured.slug);
  const briefItems=remaining.slice(0,3);
  const publicationItems=remaining.slice(3,9);
  const feature=document.getElementById("featuredStory");
  if(feature){
    feature.innerHTML='<a class="feature-image-link" href="'+articleUrl(featured.slug||"")+'">'+articleImage(featured,"feature-image")+'<span class="image-stamp">EVOFORD<br>NEWS</span></a>'+
      '<div class="feature-copy"><div class="kicker">'+escapeHtml(categoryLabel(featured.category||"INTERNACIONAL"))+'</div><h1><a href="'+articleUrl(featured.slug||"")+'">'+escapeHtml(currentLanguage==="en"?(featured.title_en||featured.title):featured.title)+'</a></h1>'+
      '<p class="dek">'+escapeHtml(currentLanguage==="en"?(featured.summary_en||featured.summary||""):(featured.summary||""))+'</p><div class="feature-meta"><span>POR '+escapeHtml(featured.author||"EVOFORD NEWS")+'</span><span>EDICIÓN LONDRES</span></div><a class="feature-cta" href="'+articleUrl(featured.slug||"")+'">'+tr("readFeature")+' <b>↗</b></a></div>';
  }
  const briefs=document.getElementById("latestBriefs");
  if(briefs) briefs.innerHTML=briefItems.map((a,i)=>'<a class="brief brief-link" href="'+articleUrl(a.slug||"")+'"><span class="number">'+String(i+1).padStart(2,"0")+'</span><div><span class="brief-category">'+escapeHtml(categoryLabel(a.category||"INTERNACIONAL"))+'</span><b>'+escapeHtml(currentLanguage==="en"?(a.title_en||a.title):a.title)+'</b><p>'+escapeHtml(currentLanguage==="en"?(a.summary_en||a.summary||""):(a.summary||""))+'</p></div><span class="brief-arrow">↗</span></a>').join("")||'<p class="muted">'+(currentLanguage==="en"?"More stories coming soon.":"Más noticias próximamente.")+'</p>';
  container.innerHTML=publicationItems.map((a,i)=>'<article class="story reveal" style="--delay:'+i*70+'ms"><a class="story-link" href="'+articleUrl(a.slug||"")+'">'+articleImage(a,"story-image")+
    '<div class="story-copy"><div class="kicker">'+escapeHtml(a.category||"INTERNACIONAL")+'</div><h3>'+escapeHtml(currentLanguage==="en"?(a.title_en||a.title):a.title)+'</h3><p>'+escapeHtml(currentLanguage==="en"?(a.summary_en||a.summary||""):(a.summary||""))+'</p></div></a>'+
    '<div class="lead-meta">'+escapeHtml(a.author||"EVOFORD NEWS")+'</div><a href="'+articleUrl(a.slug||"")+'" class="read-link">'+tr("readArticle")+' <span>↗</span></a></article>').join("");
  const countryRoot=document.getElementById("countryCoverage");
  if(countryRoot){
    const editions=[
      {id:"uk",name:"Reino Unido",flag:"🇬🇧",terms:["reino unido","united kingdom","uk","inglaterra","escocia","gales","irlanda del norte"]},
      {id:"do",name:"República Dominicana",flag:"🇩🇴",terms:["republica dominicana","dominican republic","rd"]},
      {id:"es",name:"España",flag:"🇪🇸",terms:["espana","spain"]}
    ];
    countryRoot.innerHTML=editions.map(country=>{
      const matches=data.filter(a=>country.terms.includes(normalize(a.country))).slice(0,3);
      const liveStories=matches.map(a=>'<a class="country-story" href="'+articleUrl(a.slug||"")+'"><span class="kicker">'+escapeHtml(a.category||"ACTUALIDAD")+'</span><b>'+escapeHtml(a.title)+'</b><span class="country-read">'+tr("read")+'</span></a>').join("");
      const stories=liveStories||'<p class="country-empty">'+tr("noCountry")+'</p>';
      return '<section class="country-card" id="country-'+country.id+'"><div class="country-title"><span class="country-flag" aria-hidden="true">'+country.flag+'</span><h3>'+country.name+'</h3></div>'+stories+'</section>';
    }).join("");
  }
  const sectionRoot=document.getElementById("sectionFeeds");
  if(sectionRoot){
    const sections=[
      {name:"Internacional",id:"internacional",terms:["internacional","mundo"]},
      {name:"Política",id:"politica",terms:["politica"]},
      {name:"Economía",id:"economia",terms:["economia"]},
      {name:"Seguridad y defensa",id:"seguridad",terms:["seguridad","defensa"]},
      {name:"Tecnología",id:"tecnologia",terms:["tecnologia"]},
      {name:"Opinión y análisis",id:"opinion-analisis",terms:["opinion","opinion y analisis","analisis"]}
    ];
    const normalize=value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
    sectionRoot.innerHTML=sections.map(section=>{
      const matches=data.filter(a=>section.terms.includes(normalize(a.category))).slice(0,3);
      if(!matches.length)return "";
      const cards=matches.map((a,i)=>{
        const dateText=a.created_at?new Date(a.created_at).toLocaleDateString("es-ES",{day:"numeric",month:"short",year:"numeric"}):"";
        return '<article class="story reveal" style="--delay:'+i*60+'ms"><a class="story-link" href="'+articleUrl(a.slug||"")+'">'+articleImage(a,"story-image")+'<div class="story-copy"><div class="kicker">'+escapeHtml(categoryLabel(section.name))+'</div><h3>'+escapeHtml(a.title)+'</h3><p>'+escapeHtml(a.summary||"")+'</p></div></a><div class="lead-meta">'+escapeHtml(a.author||"EVOFORD NEWS")+(dateText?" · "+escapeHtml(dateText):"")+'</div><a href="'+articleUrl(a.slug||"")+'" class="read-link">'+tr("readArticle")+' <span>↗</span></a></article>';
      }).join("");
      return '<section class="section category-section" id="section-'+section.id+'"><div class="section-head"><h2>'+section.name+'</h2><span>'+(currentLanguage==="en"?"LATEST STORIES":"ÚLTIMAS PUBLICACIONES")+'</span></div><div class="cards">'+cards+'</div></section>';
    }).join("");
  }
}
const printEditionButton=document.getElementById("printEditionBtn");
if(printEditionButton) printEditionButton.addEventListener("click",()=>window.print());

document.querySelectorAll("[data-language]").forEach(b=>b.addEventListener("click",()=>setLanguage(b.dataset.language)));
renderStaticLanguage();
loadPublishedArticles();