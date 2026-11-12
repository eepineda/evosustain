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
  if (a.image_url && /^https:\/\//i.test(a.image_url)) return '<img class="'+cls+'" src="' + escapeHtml(a.image_url) + '" alt="" loading="lazy">';
  return '<div class="story-art '+(cls?cls+" ":"")+'art-blue"><span>'+escapeHtml((a.category||"EV").slice(0,2).toUpperCase())+'</span></div>';
}
async function loadPublishedArticles() {
  const container = document.getElementById("publishedArticles");
  if (!container || !window.supabase) return;
  const client = window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
  const {data,error} = await client.from("articles").select("title,slug,category,author,summary,image_url,created_at")
    .eq("status","published").order("updated_at",{ascending:false}).limit(12);
  if (error) {
    container.innerHTML='<p class="muted">No se pudieron cargar las publicaciones. Inténtalo más tarde.</p>';
    console.error("Evoford News:",error.message); return;
  }
  if (!data?.length) {
    container.innerHTML='<p class="muted">Todavía no hay artículos publicados.</p>'; return;
  }
  const featured=data[0], feature=document.getElementById("featuredStory");
  if(feature){
    feature.innerHTML='<a class="feature-image-link" href="'+articleUrl(featured.slug||"")+'">'+articleImage(featured,"feature-image")+'<span class="image-stamp">EVOFORD<br>NEWS</span></a>'+
      '<div class="feature-copy"><div class="kicker">'+escapeHtml(featured.category||"INTERNACIONAL")+'</div><h1><a href="'+articleUrl(featured.slug||"")+'">'+escapeHtml(featured.title)+'</a></h1>'+
      '<p class="dek">'+escapeHtml(featured.summary||"")+'</p><div class="feature-meta"><span>POR '+escapeHtml(featured.author||"EVOFORD NEWS")+'</span><span>EDICIÓN LONDRES</span></div><a class="feature-cta" href="'+articleUrl(featured.slug||"")+'">Leer reportaje <b>↗</b></a></div>';
  }
  const briefs=document.getElementById("latestBriefs");
  if(briefs) briefs.innerHTML=data.slice(1,4).map((a,i)=>'<a class="brief brief-link" href="'+articleUrl(a.slug||"")+'"><span class="number">'+String(i+1).padStart(2,"0")+'</span><div><span class="brief-category">'+escapeHtml(a.category||"INTERNACIONAL")+'</span><b>'+escapeHtml(a.title)+'</b><p>'+escapeHtml(a.summary||"")+'</p></div><span class="brief-arrow">↗</span></a>').join("")||'<p class="muted">Más noticias próximamente.</p>';
  container.innerHTML=data.slice(1,7).map((a,i)=>'<article class="story reveal" style="--delay:'+i*70+'ms"><a class="story-link" href="'+articleUrl(a.slug||"")+'">'+articleImage(a,"story-image")+
    '<div class="story-copy"><div class="kicker">'+escapeHtml(a.category||"INTERNACIONAL")+'</div><h3>'+escapeHtml(a.title)+'</h3><p>'+escapeHtml(a.summary||"")+'</p></div></a>'+
    '<div class="lead-meta">'+escapeHtml(a.author||"EVOFORD NEWS")+'</div><a href="'+articleUrl(a.slug||"")+'" class="read-link">Leer artículo <span>↗</span></a></article>').join("");
}
loadPublishedArticles();