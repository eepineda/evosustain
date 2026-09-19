let articles=[];
const $=s=>document.querySelector(s);
const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const tag=a=>`<div class="tag">${esc(a.category||"News")}</div>`;
function story(a){return `<a class="story" href="${esc(a.url||"#")}" target="_blank" rel="noopener"><img class="storyImage" src="${esc(a.image||"assets/waste.svg")}" alt="" loading="lazy">${tag(a)}<h3>${esc(a.title)}</h3><p>${esc(a.excerpt||"")}</p><div class="meta">${esc(a.source||"EvoSustain")} · ${esc(a.date||"")}</div></a>`}
function render(list){
 if(!list.length)return;
 const hero=list[0];
 $("#lead").innerHTML=`<a href="${esc(hero.url||"#")}" target="_blank" rel="noopener"><img class="leadImage" src="${esc(hero.image||"assets/waste.svg")}" alt=""><div class="tag">${esc(hero.category||"News")}</div><h1>${esc(hero.title)}</h1><p>${esc(hero.excerpt||"")}</p><div class="meta">${esc(hero.source||"EvoSustain")} · ${esc(hero.date||"")}</div></a>`;
 $("#rail").innerHTML=list.slice(1,5).map(a=>`<a class="railStory" href="${esc(a.url||"#")}" target="_blank" rel="noopener">${tag(a)}<h3>${esc(a.title)}</h3><p>${esc(a.excerpt||"")}</p><div class="meta">${esc(a.date||"")}</div></a>`).join("");
 const section=(cat,n=3)=>{const x=list.filter(a=>(a.category||"").toLowerCase()===cat.toLowerCase()).slice(0,n);return (x.length?x:list.slice(0,n)).map(story).join("")};
 $("#sustainGrid").innerHTML=section("Sustainability");
 $("#techGrid").innerHTML=section("Technology");
 $("#cityGrid").innerHTML=section("Smart Cities");
 let ops=list.filter(a=>/waste|operation/i.test(a.category||""));if(!ops.length)ops=list.slice(0,4);
 $("#ops").innerHTML=ops.slice(0,4).map(a=>`<a class="opStory" href="${esc(a.url||"#")}" target="_blank" rel="noopener"><img class="opThumb" src="${esc(a.image||"assets/operations.svg")}" alt="" loading="lazy"><div>${tag(a)}<h3>${esc(a.title)}</h3><div class="meta">${esc(a.date||"")}</div></div></a>`).join("");
 $("#perspectiveGrid").innerHTML=list.slice(0,4).map(a=>`<a class="perspectiveItem" href="${esc(a.url||"#")}" target="_blank" rel="noopener">${tag(a)}<h3>${esc(a.title)}</h3><p>${esc(a.excerpt||"")}</p></a>`).join("");
 $("#ticker").textContent=list.slice(0,3).map(a=>a.title).join(" · ");
}
async function load(){try{articles=await (await fetch("data/articles.json",{cache:"no-store"})).json();render(articles)}catch(e){console.error(e)}}
$("#searchOpen").onclick=()=>{$("#searchbar").classList.toggle("open");if($("#searchbar").classList.contains("open"))$("#searchInput").focus()};
$("#searchBtn").onclick=()=>{const q=$("#searchInput").value.toLowerCase().trim();render(q?articles.filter(a=>(a.title+" "+a.excerpt+" "+a.category).toLowerCase().includes(q)):articles)};
$("#searchInput").onkeydown=e=>{if(e.key==="Enter")$("#searchBtn").click()};
function menu(){const open=!$("#mobileMenu").classList.contains("open");$("#mobileMenu").classList.toggle("open",open);$("#overlay").classList.toggle("open",open);document.body.classList.toggle("menuOpen",open);$("#mobileMenu").setAttribute("aria-hidden",String(!open))}
$("#menuBtn").onclick=menu;$("#closeMenu").onclick=menu;$("#overlay").onclick=menu;document.querySelectorAll("#mobileMenu a").forEach(a=>a.onclick=()=>{if($("#mobileMenu").classList.contains("open"))menu()});document.onkeydown=e=>{if(e.key==="Escape"&&$("#mobileMenu").classList.contains("open"))menu()};
$("#newsletter").onsubmit=e=>{e.preventDefault();alert("Thank you. Your subscription request has been received.")};
$("#date").textContent=new Intl.DateTimeFormat("en-GB",{day:"2-digit",month:"short",year:"numeric"}).format(new Date());$("#year").textContent=new Date().getFullYear();load();
