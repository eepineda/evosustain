const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const state={articles:[]};
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const href=a=>a?.url||a?.link||"#", image=a=>a?.image||"assets/green.svg";
function story(a){return `<article class="story"><a href="${esc(href(a))}"><img loading="lazy" src="${esc(image(a))}" alt="${esc(a.image_alt||a.title||"")}" onerror="this.onerror=null;this.src='assets/green.svg'"></a><div class="kicker">${esc(a.category||"News")}</div><h3><a href="${esc(href(a))}">${esc(a.title)}</a></h3><p>${esc(a.excerpt||"")}</p><div class="meta">${esc(a.source||"Evoford Journal")} · ${esc(a.date||"")}</div></article>`}
function render(list){
 state.articles=list||[];
 const lead=state.articles[0], rail=state.articles.slice(1,4), rest=state.articles.slice(4,10);
 if(lead) $("#lead").innerHTML=`<a class="leadmedia" href="${esc(href(lead))}"><img src="${esc(image(lead))}" alt="${esc(lead.title)}" onerror="this.onerror=null;this.src='assets/green.svg'"></a><div class="leadcopy"><div class="leadlabel"><span class="kicker">${esc(lead.category||"News")}</span><span class="readmark">Lead story</span></div><h1><a href="${esc(href(lead))}">${esc(lead.title)}</a></h1><div class="deck">${esc(lead.excerpt||"")}</div><div class="meta">${esc(lead.source||"Evoford Journal")} · ${esc(lead.date||"")}</div></div>`;
 $("#rail").innerHTML=rail.map(a=>`<article class="railitem"><div class="kicker">${esc(a.category||"News")}</div><h3><a href="${esc(href(a))}">${esc(a.title)}</a></h3><p>${esc(a.excerpt||"")}</p></article>`).join("");
 $("#latestGrid").innerHTML=rest.map(story).join("");
 ["Sustainability","Technology","Smart Cities","Waste & Operations"].forEach(cat=>{const el=document.querySelector(`[data-category="${CSS.escape(cat)}"]`);if(el)el.innerHTML=state.articles.filter(a=>a.category===cat).slice(0,3).map(story).join("")||`<p style="color:#68706c">No stories yet.</p>`});
 const author=state.articles.filter(a=>(a.author||a.source||"").toLowerCase().includes("edwin pineda carrasco") || /edwin pineda carrasco/i.test(a.title||""));
 $("#authorArchive").innerHTML=author.slice(0,10).map(a=>`<a href="${esc(href(a))}"><span>${esc(a.date||"")}</span>${esc(a.title)}</a>`).join("")||`<p style="color:#68706c">The author index will populate automatically as publications are discovered.</p>`;
}

async function loadBriefing(){
  const grid = document.getElementById("briefingGrid");
  const updated = document.getElementById("briefingUpdated");
  if(!grid) return;
  try{
    const r=await fetch("data/briefing.json",{cache:"no-store"});
    if(!r.ok) throw Error("briefing unavailable");
    const items=await r.json();
    grid.innerHTML = items.slice(0,12).map((x,i)=>`
      <article class="briefingCard ${i===0?'briefingLead':''}">
        <div class="briefingMeta"><span>${esc(x.category||"Official update")}</span><span>${esc(x.date||"")}</span></div>
        <h3><a href="${esc(x.url||"#")}" target="_blank" rel="noopener">${esc(x.title)}</a></h3>
        <p>${esc(x.excerpt||"Actualización publicada por la fuente oficial.")}</p>
        <div class="briefingSource">Fuente: ${esc(x.briefing_source||x.source||"Fuente oficial")}</div>
      </article>`).join("") || `<p class="briefingEmpty">No hay actualizaciones nuevas en este momento.</p>`;
    const now=new Date();
    if(updated) updated.textContent="Actualizado "+new Intl.DateTimeFormat(undefined,{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(now);
  }catch(e){
    grid.innerHTML=`<p class="briefingEmpty">El resumen se actualizará automáticamente en la próxima compilación.</p>`;
    console.error(e);
  }
}

async function load(){try{const r=await fetch("data/articles.json",{cache:"no-store"});if(!r.ok)throw Error();render(await r.json())}catch(e){console.error(e)}}
function setup(){
 $("#today").textContent=new Intl.DateTimeFormat(undefined,{year:"numeric",month:"long",day:"numeric"}).format(new Date());
 const mm=$("#mobileMenu");$("#menuOpen").onclick=()=>mm.classList.add("open");$("#menuClose").onclick=()=>mm.classList.remove("open");$$(".mobilemenu a").forEach(a=>a.onclick=()=>mm.classList.remove("open"));
 const panel=$("#searchPanel"), input=$("#searchInput"), results=$("#searchResults");$("#searchOpen").onclick=()=>{panel.classList.add("open");input.focus()};$("#searchClose").onclick=()=>panel.classList.remove("open");
 document.addEventListener("keydown",e=>{if(e.key==="Escape")panel.classList.remove("open")}); input.oninput=()=>{const q=input.value.toLowerCase().trim();results.innerHTML=q?state.articles.filter(a=>(a.title+" "+a.excerpt+" "+a.category+" "+a.source).toLowerCase().includes(q)).slice(0,15).map(a=>`<a href="${esc(href(a))}">${esc(a.title)}<small>${esc(a.category||"")} · ${esc(a.date||"")}</small></a>`).join(""):""};
}
const issue=document.getElementById("issueDate"); if(issue){issue.textContent=new Intl.DateTimeFormat(undefined,{year:"numeric"}).format(new Date())}
setup();load();loadBriefing();
