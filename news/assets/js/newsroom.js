async function loadPosts(){
  // Offline-friendly: if posts are embedded, use them.
  if (Array.isArray(window.__POSTS__) && window.__POSTS__.length) return window.__POSTS__;

  // If hosted, try to fetch posts.json.
  try{
    const res = await fetch("posts.json", { cache: "no-store" });
    if (res.ok) return await res.json();
  }catch(e){}

  return [];
}

const $ = (id) => document.getElementById(id);

function normalize(s){
  return (s || "").toString().normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase();
}

function uniqueCategories(items){
  return Array.from(new Set(items.map(p=>p.category).filter(Boolean))).sort((a,b)=>a.localeCompare(b));
}

function formatDate(iso){
  if (!iso) return "—";
  const dt = new Date(iso + "T00:00:00");
  return dt.toLocaleDateString(undefined, { year:"numeric", month:"short", day:"2-digit" });
}

function buildCategories(items){
  const sel = $("category");
  for (const c of uniqueCategories(items)){
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  }
}

function applyFilters(all){
  const query = normalize($("q").value.trim());
  const cat = $("category").value;
  const sort = $("sort").value;

  let items = all.slice();

  if (cat) items = items.filter(p => p.category === cat);

  if (query){
    items = items.filter(p => {
      const hay = normalize([p.title, p.summary, (p.tags||[]).join(" "), p.category].join(" "));
      return hay.includes(query);
    });
  }

  items.sort((a,b)=>{
    if (sort==="date_desc") return (b.date||"").localeCompare(a.date||"");
    if (sort==="date_asc") return (a.date||"").localeCompare(b.date||"");
    if (sort==="title_asc") return (a.title||"").localeCompare(b.title||"");
    if (sort==="title_desc") return (b.title||"").localeCompare(a.title||"");
    return 0;
  });

  render(items);
  updateSidebar(all, items);
}

function updateSidebar(all, items){
  $("total").textContent = String(all.length);
  $("showing").textContent = String(items.length);
  const newest = all.slice().sort((a,b)=>(b.date||"").localeCompare(a.date||""))[0];
  $("lastUpdated").textContent = newest?.date ? formatDate(newest.date) : "—";
}

function render(items){
  $("count").textContent = String(items.length);
  const grid = $("grid");
  grid.innerHTML = "";

  if (!items.length){
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = "<strong>No results.</strong><div class='meta' style='margin-top:6px'>Try a different search or clear filters.</div>";
    grid.appendChild(div);
    return;
  }

  const featured = items.find(p => p.featured);
  if (featured){
    grid.appendChild(renderFeatured(featured));
  }

  for (const p of items){
    if (p.featured) continue;
    grid.appendChild(renderCard(p));
  }
}

function renderFeatured(p){
  const card = document.createElement("article");
  card.className = "card featured";
  const left = document.createElement("div");
  const right = document.createElement("div");
  right.className = "featureBox";

  left.innerHTML = `
    <div class="kicker" style="margin-bottom:10px"><span class="dot" aria-hidden="true"></span> Featured</div>
    <h3><a href="${p.link}">${escapeHtml(p.title)}</a></h3>
    <p class="meta">${formatDate(p.date)} · ${escapeHtml(p.category || "Update")}</p>
    <p class="desc">${escapeHtml(p.summary || "")}</p>
    <div class="tags">${(p.tags||[]).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
    <div style="margin-top:12px">
      <a class="under" href="${p.link}">Read the full update →</a>
    </div>
  `;

  right.innerHTML = `
    <b>At a glance</b>
    <span>Editorial-style posts designed for quick scanning.</span>
    <hr class="sep"/>
    <b>Topics</b>
    <span>Product · Impact · Partnerships · Community · Press</span>
    <hr class="sep"/>
    <b>Publishing</b>
    <span>Add a Markdown file in <span class="kbd">posts/</span> and run the build.</span>
  `;

  card.appendChild(left);
  card.appendChild(right);
  return card;
}

function renderCard(p){
  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML = `
    <h3><a href="${p.link}">${escapeHtml(p.title)}</a></h3>
    <p class="meta">${formatDate(p.date)} · ${escapeHtml(p.category || "Update")}</p>
    <p class="desc">${escapeHtml(p.summary || "")}</p>
    <div class="tags">${(p.tags||[]).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
  `;
  return card;
}

function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
  }[m] || m));
}

async function init(){
  $("now").textContent = new Date().toLocaleString(undefined, { dateStyle:"medium", timeStyle:"short" });
  $("year").textContent = new Date().getFullYear();

  const all = await loadPosts();
  buildCategories(all);

  const apply = () => applyFilters(all);

  $("q").addEventListener("input", apply);
  $("category").addEventListener("change", apply);
  $("sort").addEventListener("change", apply);
  $("reset").addEventListener("click", ()=>{
    $("q").value = "";
    $("category").value = "";
    $("sort").value = "date_desc";
    apply();
  });

  apply();
}

document.addEventListener("DOMContentLoaded", () => { init().catch(console.error); });
