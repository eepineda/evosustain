const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const state = { articles: [] };
const hrefFor = a => a?.url || "#";

function escapeHTML(v=""){
  return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
function card(a){
  return `<article class="story">
    ${a.image ? `<a href="${escapeHTML(hrefFor(a))}"><img loading="lazy" src="${escapeHTML(a.image)}" alt=""></a>` : ""}
    <div class="kicker">${escapeHTML(a.category || "News")}</div>
    <h3><a href="${escapeHTML(hrefFor(a))}">${escapeHTML(a.title || "Untitled")}</a></h3>
    <p>${escapeHTML(a.excerpt || "")}</p>
    <div class="meta">${escapeHTML(a.source || "Evoford Journal")} · ${escapeHTML(a.date || "")}</div>
  </article>`;
}
function render(list){
  state.articles=list || [];
  const lead=state.articles[0], rail=state.articles.slice(1,3), rest=state.articles.slice(3);
  if(lead){
    $("#hero").innerHTML=`<a class="heroLead" href="${escapeHTML(hrefFor(lead))}">
      ${lead.image?`<img src="${escapeHTML(lead.image)}" alt="">`:""}
      <div class="heroOverlay"><div class="heroCopy">
        <div class="kicker">${escapeHTML(lead.category||"News")}</div>
        <h1 class="heroTitle">${escapeHTML(lead.title)}</h1>
        <div class="dek">${escapeHTML(lead.excerpt||"")}</div>
        <div class="meta">${escapeHTML(lead.source||"Evoford Journal")} · ${escapeHTML(lead.date||"")}</div>
      </div></div></a>`;
  }
  $("#rail").innerHTML=rail.map(a=>`<article class="sideStory"><div class="kicker">${escapeHTML(a.category||"News")}</div><h3><a href="${escapeHTML(hrefFor(a))}">${escapeHTML(a.title)}</a></h3><p>${escapeHTML(a.excerpt||"")}</p></article>`).join("");
  $("#latestGrid").innerHTML=rest.map(card).join("");
  ["Sustainability","Technology","Smart Cities","Waste & Operations","Perspective"].forEach(cat=>{
    const el=document.querySelector(`[data-category="${cat}"]`);
    if(el) el.innerHTML=state.articles.filter(a=>a.category===cat).slice(0,3).map(card).join("") || `<p class="meta">No stories yet.</p>`;
  });
}
async function load(){
  try{
    const r=await fetch("data/articles.json",{cache:"no-store"});
    if(!r.ok) throw new Error("HTTP "+r.status);
    render(await r.json());
  }catch(e){
    console.error(e);
    $("#latestGrid").innerHTML=`<p class="meta">Content is temporarily unavailable. Please refresh the page.</p>`;
  }
}
function setup(){
  const menu=$("#menuBtn"), mobile=$("#mobileMenu");
  menu?.addEventListener("click",()=>mobile?.classList.toggle("open"));
  $$(".mobileMenu a").forEach(a=>a.addEventListener("click",()=>mobile?.classList.remove("open")));
  const panel=$("#searchPanel"), open=$("#searchOpen"), close=$("#searchClose"), input=$("#searchInput"), results=$("#searchResults");
  open?.addEventListener("click",()=>{panel.classList.add("open");input.focus()});
  close?.addEventListener("click",()=>panel.classList.remove("open"));
  input?.addEventListener("input",()=>{
    const q=input.value.toLowerCase().trim();
    results.innerHTML=!q?"":state.articles.filter(a=>(a.title+" "+a.excerpt+" "+a.category).toLowerCase().includes(q)).slice(0,10)
      .map(a=>`<a href="${escapeHTML(hrefFor(a))}">${escapeHTML(a.title)}</a>`).join("");
  });
}
setup(); load();
