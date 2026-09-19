let data=[];const $=s=>document.querySelector(s);
const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const tag=a=>`<div class="tag">${esc(a.category||"News")}</div>`;
const story=a=>`<a class="story" href="${esc(a.url||"#")}" target="_blank" rel="noopener"><div class="storyImage"></div>${tag(a)}<h3>${esc(a.title)}</h3><p>${esc(a.excerpt||"")}</p><div class="meta">${esc(a.source||"EvoSustain")} · ${esc(a.date||"")}</div></a>`;
function render(list){if(!list.length)return;
const a=list[0];$("#lead").innerHTML=`<a href="${esc(a.url||"#")}" target="_blank"><div class="leadImage"></div>${tag(a)}<h1>${esc(a.title)}</h1><p>${esc(a.excerpt||"")}</p><div class="meta">${esc(a.source||"EvoSustain")} · ${esc(a.date||"")}</div></a>`;
$("#rail").innerHTML=list.slice(1,5).map(a=>`<a class="railStory" href="${esc(a.url||"#")}" target="_blank">${tag(a)}<h3>${esc(a.title)}</h3><p>${esc(a.excerpt||"")}</p><div class="meta">${esc(a.date||"")}</div></a>`).join("");
const section=(name,n=3)=>{let x=list.filter(a=>(a.category||"").toLowerCase()===name.toLowerCase()).slice(0,n);return (x.length?x:list.slice(0,n)).map(story).join("")};
$("#sustainGrid").innerHTML=section("Sustainability");$("#techGrid").innerHTML=section("Technology");$("#cityGrid").innerHTML=section("Smart Cities");
let ops=list.filter(a=>/waste|operation/i.test(a.category||""));if(!ops.length)ops=list.slice(0,4);$("#ops").innerHTML=ops.slice(0,4).map(a=>`<a class="opStory" href="${esc(a.url||"#")}" target="_blank">${tag(a)}<h3>${esc(a.title)}</h3><div class="meta">${esc(a.date||"")}</div></a>`).join("");
$("#perspectiveGrid").innerHTML=list.slice(0,4).map(a=>`<a class="perspective" href="${esc(a.url||"#")}" target="_blank">${tag(a)}<h3>${esc(a.title)}</h3><p>${esc(a.excerpt||"")}</p></a>`).join("");
$("#ticker").textContent=list.slice(0,3).map(a=>a.title).join(" · ");
}
async function load(){try{data=await (await fetch("data/articles.json",{cache:"no-store"})).json();render(data)}catch(e){}}
$("#searchOpen").onclick=()=>{$("#searchbar").classList.toggle("open");if($("#searchbar").classList.contains("open"))$("#search").focus()};
$("#searchBtn").onclick=()=>{let q=$("#search").value.toLowerCase().trim();render(q?data.filter(a=>(a.title+" "+a.excerpt+" "+a.category).toLowerCase().includes(q)):data)};
$("#search").onkeydown=e=>{if(e.key==="Enter")$("#searchBtn").click()};
const toggle=()=>{$("#drawer").classList.toggle("open");$("#shade").classList.toggle("open");document.body.classList.toggle("menuOpen")};
$("#menuBtn").onclick=toggle;$("#closeMenu").onclick=toggle;$("#shade").onclick=toggle;document.querySelectorAll("#drawer a").forEach(a=>a.onclick=()=>{if($("#drawer").classList.contains("open"))toggle()});
document.onkeydown=e=>{if(e.key==="Escape"&&$("#drawer").classList.contains("open"))toggle()};
$("#newsletter").onsubmit=e=>{e.preventDefault();alert("Thank you. Your subscription request has been received.")};
$("#date").textContent=new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date());$("#year").textContent=new Date().getFullYear();load();
