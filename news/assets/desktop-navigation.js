/* EVOFORD NEWS — desktop scroll navigation, bilingual drawer and reading controls */
(function(){
 "use strict";
 if(window.matchMedia("(max-width:760px)").matches || window.matchMedia("(display-mode:standalone)").matches) return;
 function init(){
  if(document.querySelector(".evo-scrollbar")) return;
  const masthead=document.querySelector(".masthead"),source=masthead&&masthead.querySelector("nav.nav");
  if(!source) return;
  const lang=()=>new URLSearchParams(location.search).get("lang")==="en"?"en":(localStorage.getItem("evoford-news-language")==="en"?"en":"es");
  const en=lang()==="en";
  const labels={es:{menu:"Menú",close:"Cerrar menú",search:"Buscar secciones",explore:"EXPLORA EVOFORD NEWS",reading:"PERSONALIZA TU LECTURA",light:"Modo claro",dark:"Modo oscuro",contrast:"Alto contraste",foot:"Información que conecta. Comunidades que se acercan."},en:{menu:"Menu",close:"Close menu",search:"Search sections",explore:"EXPLORE EVOFORD NEWS",reading:"CUSTOMISE YOUR READING",light:"Light mode",dark:"Dark mode",contrast:"High contrast",foot:"Information that connects. Communities that come closer."}};
  const t=labels[lang()];
  const bar=document.createElement("div");bar.className="evo-scrollbar";bar.innerHTML='<button class="evo-menu-trigger" type="button" aria-expanded="false" aria-controls="evo-drawer"><span></span><span></span><span></span><b>'+t.menu+'</b></button><a class="evo-mini-brand" href="/news/index.html">EVOFORD <em>NEWS</em></a><nav class="evo-quick-links" aria-label="'+(en?"Quick sections":"Secciones rápidas")+'"></nav>';
  const drawer=document.createElement("aside");drawer.className="evo-drawer";drawer.id="evo-drawer";drawer.setAttribute("aria-hidden","true");drawer.innerHTML='<div class="evo-drawer-head"><a class="evo-drawer-brand" href="/news/index.html">EVOFORD <em>NEWS</em></a><button type="button" class="evo-drawer-close" aria-label="'+t.close+'">×</button></div><label class="evo-drawer-search"><span>⌕</span><input type="search" placeholder="'+t.search+'" aria-label="'+t.search+'"></label><div class="evo-drawer-caption">'+t.explore+'</div><nav class="evo-drawer-links"></nav><div class="evo-drawer-tools"><div class="evo-drawer-caption">'+t.reading+'</div><button type="button" data-evo-theme="light">☼ <span>'+t.light+'</span></button><button type="button" data-evo-theme="dark">☾ <span>'+t.dark+'</span></button><button type="button" data-evo-contrast aria-pressed="false">◐ <span>'+t.contrast+'</span><i></i></button><div class="evo-drawer-languages"><button type="button" data-evo-language="es">ES</button><button type="button" data-evo-language="en">EN</button></div></div><p class="evo-drawer-foot">'+t.foot+'</p>';
  const quick=bar.querySelector(".evo-quick-links"),links=drawer.querySelector(".evo-drawer-links");
  [...source.querySelectorAll("a")].forEach((a,i)=>{const q=a.cloneNode(true),d=a.cloneNode(true);if(i<7)quick.append(q);d.removeAttribute("aria-current");links.append(d)});
  const extras=[["Academy","Academy","aula-innovacion.html"],["Tu República","Your Republic","a.html?i=dHUtcmVwdWJsaWNhLmh0bWw"],["Directorio","Directory","directory.html"],["Participa","Participate","participa.html"],["Edición impresa","Print edition","edicion.html"]];
  extras.forEach(([es,eng,href])=>{if(![...links.querySelectorAll("a")].some(a=>a.getAttribute("href")===href)){const a=document.createElement("a");a.href=href;a.dataset.es=es;a.dataset.en=eng;a.textContent=en?eng:es;links.append(a)}});
  const overlay=document.createElement("div");overlay.className="evo-drawer-overlay";overlay.hidden=true;document.body.append(bar,overlay,drawer);
  const trigger=bar.querySelector(".evo-menu-trigger"),close=drawer.querySelector(".evo-drawer-close"),search=drawer.querySelector("input");
  function open(){overlay.hidden=false;drawer.classList.add("is-open");drawer.setAttribute("aria-hidden","false");trigger.setAttribute("aria-expanded","true");document.body.classList.add("evo-drawer-open")}
  function shut(){drawer.classList.remove("is-open");drawer.setAttribute("aria-hidden","true");trigger.setAttribute("aria-expanded","false");document.body.classList.remove("evo-drawer-open");overlay.hidden=true}
  trigger.addEventListener("click",open);close.addEventListener("click",shut);overlay.addEventListener("click",shut);document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!overlay.hidden)shut()});
  links.addEventListener("click",e=>{if(e.target.closest("a"))shut()});quick.addEventListener("click",e=>{if(e.target.closest("a"))shut()});
  search.addEventListener("input",()=>{const q=search.value.trim().toLocaleLowerCase();links.querySelectorAll("a").forEach(a=>a.hidden=!a.textContent.toLocaleLowerCase().includes(q))});
  let wasVisible=false;const onScroll=()=>{const visible=window.scrollY>220;if(visible!==wasVisible){bar.classList.toggle("is-visible",visible);wasVisible=visible}};window.addEventListener("scroll",onScroll,{passive:true});onScroll();
  function theme(mode){document.documentElement.dataset.evoTheme=mode;try{localStorage.setItem("evoford-news-desktop-theme",mode)}catch(e){}}
  try{theme(localStorage.getItem("evoford-news-desktop-theme")||"light")}catch(e){theme("light")}
  drawer.querySelectorAll("[data-evo-theme]").forEach(b=>b.addEventListener("click",()=>theme(b.dataset.evoTheme)));
  const contrast=drawer.querySelector("[data-evo-contrast]");function syncContrast(){const active=document.documentElement.classList.contains("evo-high-contrast");contrast.setAttribute("aria-pressed",String(active));contrast.classList.toggle("is-active",active)}
  try{if(localStorage.getItem("evoford-news-high-contrast")==="1")document.documentElement.classList.add("evo-high-contrast")}catch(e){}syncContrast();
  contrast.addEventListener("click",()=>{document.documentElement.classList.toggle("evo-high-contrast");try{localStorage.setItem("evoford-news-high-contrast",document.documentElement.classList.contains("evo-high-contrast")?"1":"0")}catch(e){}syncContrast()});
  drawer.querySelectorAll("[data-evo-language]").forEach(b=>b.addEventListener("click",()=>{const next=b.dataset.evoLanguage;try{localStorage.setItem("evoford-news-language",next)}catch(e){}const u=new URL(location.href);u.searchParams.set("lang",next);location.href=u.href}));
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
