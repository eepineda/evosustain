const SUPABASE_URL = "https://poywsdigujbarvnzbfnz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f";
const now = new Date();
const date = document.getElementById("today");
const year = document.getElementById("year");
if (date) date.textContent = now.toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric"});
if (year) year.textContent = now.getFullYear();

function escapeHtml(value="") {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function articleUrl(slug) {
  return "articles/plantilla-articulo.html?slug=" + encodeURIComponent(slug);
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
  const {data,error} = await client.from("articles").select("title,slug,category,author,summary,image_url,created_at,country,region")
    .eq("status","published").order("updated_at",{ascending:false}).limit(30);
  if (error) {
    container.innerHTML='<p class="muted">No se pudieron cargar las publicaciones. Inténtalo más tarde.</p>';
    console.error("Evoford News:",error.message); return;
  }
  if (!data?.length) {
    container.innerHTML='<p class="muted">Todavía no hay artículos publicados.</p>'; return;
  }
  const normalize=value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  const featured=data.find(a=>!normalize(a.category).includes("opinion"))||data[0];
  const remaining=data.filter(a=>a.slug!==featured.slug);
  const briefItems=remaining.slice(0,3);
  const publicationItems=remaining.slice(3,9);
  const feature=document.getElementById("featuredStory");
  if(feature){
    feature.innerHTML='<a class="feature-image-link" href="'+articleUrl(featured.slug||"")+'">'+articleImage(featured,"feature-image")+'<span class="image-stamp">EVOFORD<br>NEWS</span></a>'+
      '<div class="feature-copy"><div class="kicker">'+escapeHtml(featured.category||"INTERNACIONAL")+'</div><h1><a href="'+articleUrl(featured.slug||"")+'">'+escapeHtml(featured.title)+'</a></h1>'+
      '<p class="dek">'+escapeHtml(featured.summary||"")+'</p><div class="feature-meta"><span>POR '+escapeHtml(featured.author||"EVOFORD NEWS")+'</span><span>EDICIÓN LONDRES</span></div><a class="feature-cta" href="'+articleUrl(featured.slug||"")+'">Leer reportaje <b>↗</b></a></div>';
  }
  const briefs=document.getElementById("latestBriefs");
  if(briefs) briefs.innerHTML=briefItems.map((a,i)=>'<a class="brief brief-link" href="'+articleUrl(a.slug||"")+'"><span class="number">'+String(i+1).padStart(2,"0")+'</span><div><span class="brief-category">'+escapeHtml(a.category||"INTERNACIONAL")+'</span><b>'+escapeHtml(a.title)+'</b><p>'+escapeHtml(a.summary||"")+'</p></div><span class="brief-arrow">↗</span></a>').join("")||'<p class="muted">Más noticias próximamente.</p>';
  container.innerHTML=publicationItems.map((a,i)=>'<article class="story reveal" style="--delay:'+i*70+'ms"><a class="story-link" href="'+articleUrl(a.slug||"")+'">'+articleImage(a,"story-image")+
    '<div class="story-copy"><div class="kicker">'+escapeHtml(a.category||"INTERNACIONAL")+'</div><h3>'+escapeHtml(a.title)+'</h3><p>'+escapeHtml(a.summary||"")+'</p></div></a>'+
    '<div class="lead-meta">'+escapeHtml(a.author||"EVOFORD NEWS")+'</div><a href="'+articleUrl(a.slug||"")+'" class="read-link">Leer artículo <span>↗</span></a></article>').join("");
  const countryRoot=document.getElementById("countryCoverage");
  if(countryRoot){
    const editions=[
      {id:"uk",name:"Reino Unido",flag:"🇬🇧",terms:["reino unido","united kingdom","uk","inglaterra","escocia","gales","irlanda del norte"]},
      {id:"do",name:"República Dominicana",flag:"🇩🇴",terms:["republica dominicana","dominican republic","rd"]},
      {id:"es",name:"España",flag:"🇪🇸",terms:["espana","spain"]}
    ];
    countryRoot.innerHTML=editions.map(country=>{
      const matches=data.filter(a=>country.terms.includes(normalize(a.country))).slice(0,3);
      const liveStories=matches.map(a=>'<a class="country-story" href="'+articleUrl(a.slug||"")+'"><span class="kicker">'+escapeHtml(a.category||"ACTUALIDAD")+'</span><b>'+escapeHtml(a.title)+'</b><span class="country-read">Leer noticia ↗</span></a>').join("");
      const fallbackStory=fallback?'<a class="country-story" href="'+fallback.url+'"><span class="kicker">'+fallback.category+'</span><b>'+fallback.title+'</b><span class="country-read">Leer noticia ↗</span></a>':"";
      const stories=liveStories||'<p class="country-empty">Aún no hay artículos publicados con esta etiqueta. La cobertura aparecerá aquí cuando la redacción publique noticias de este país.</p>';
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
        return '<article class="story reveal" style="--delay:'+i*60+'ms"><a class="story-link" href="'+articleUrl(a.slug||"")+'">'+articleImage(a,"story-image")+'<div class="story-copy"><div class="kicker">'+escapeHtml(section.name)+'</div><h3>'+escapeHtml(a.title)+'</h3><p>'+escapeHtml(a.summary||"")+'</p></div></a><div class="lead-meta">'+escapeHtml(a.author||"EVOFORD NEWS")+(dateText?" · "+escapeHtml(dateText):"")+'</div><a href="'+articleUrl(a.slug||"")+'" class="read-link">Leer artículo <span>↗</span></a></article>';
      }).join("");
      return '<section class="section category-section" id="section-'+section.id+'"><div class="section-head"><h2>'+section.name+'</h2><span>ÚLTIMAS PUBLICACIONES</span></div><div class="cards">'+cards+'</div></section>';
    }).join("");
  }
}
const printEditionButton=document.getElementById("printEditionBtn");
if(printEditionButton) printEditionButton.addEventListener("click",()=>window.print());

loadPublishedArticles();