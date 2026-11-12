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
async function loadPublishedArticles() {
  const container = document.getElementById("publishedArticles");
  if (!container) return;
  if (!window.supabase) {
    container.innerHTML = '<p class="muted">No se pudo iniciar el servicio de publicaciones.</p>';
    return;
  }
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  const {data,error} = await client.from("articles")
    .select("title,slug,category,author,summary,image_url,created_at")
    .eq("status","published")
    .order("updated_at",{ascending:false})
    .limit(12);
  if (error) {
    container.innerHTML = '<p class="muted">No se pudieron cargar las publicaciones. Inténtalo más tarde.</p>';
    console.error("Evoford News:", error.message);
    return;
  }
  if (!data?.length) {
    container.innerHTML = '<p class="muted">Todavía no hay artículos publicados.</p>';
    return;
  }
  container.innerHTML = data.map((a,i) => {
    const image = a.image_url && /^https:\/\//i.test(a.image_url)
      ? '<img src="' + escapeHtml(a.image_url) + '" alt="" loading="lazy" style="width:100%;height:155px;object-fit:cover;margin-bottom:17px">'
      : '<div class="story-art ' + (i%3===0?'art-blue':i%3===1?'art-red':'art-grey') + '"><span>' + escapeHtml((a.category||"EV").slice(0,2).toUpperCase()) + '</span></div>';
    return '<article class="story"><a href="' + articleUrl(encodeURIComponent(a.slug||"")) + '" style="color:inherit;text-decoration:none">' + image +
      '<div class="story-copy"><div class="kicker">' + escapeHtml(a.category||"INTERNACIONAL") + '</div><h3>' + escapeHtml(a.title) + '</h3><p>' + escapeHtml(a.summary||"") + '</p></div></a>' +
      '<div class="lead-meta">' + escapeHtml(a.author||"EVOFORD NEWS") + '</div><a href="' + articleUrl(a.slug||"") + '" class="read-link">Leer artículo →</a></article>';
  }).join("");
}
loadPublishedArticles();