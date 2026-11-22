/* EVOFORD NEWS — desktop scroll navigation, bilingual drawer and reading controls */
(function(){
 "use strict";
 if(window.matchMedia("(max-width:760px)").matches || window.matchMedia("(display-mode:standalone)").matches) return;
 function init(){
  if(document.querySelector(".evo-scrollbar")) return;
  const masthead=document.querySelector(".masthead"),source=masthead&&masthead.querySelector("nav.nav");
  if(!source)return;
  const language=()=>document.documentElement.lang==="en"||localStorage.getItem("evoford-news-language")==="en"?"en":"es";
  const labels={es:{menu:"Menú",close:"Cerrar menú",search:"Buscar secciones",explore:"EXPLORA EVOFORD NEWS",reading:"PERSONALIZA TU LECTURA",light:"Modo claro",dark:"Modo oscuro",contrast:"Alto contraste",foot:"Información que conecta. Comunidades que se acercan.",academy:"Academy",yourRepublic:"Tu República",directory:"Directorio",participate:"Participa",print:"Edición impresa"},en:{menu:"Menu",close:"Close menu",search:"Search sections",explore:"EXPLORE EVOFORD NEWS",reading:"CUSTOMISE YOUR READING",light:"Light mode",dark:"Dark mode",contrast:"High contrast",foot:"Information that connects. Communities that come closer.",academy:"Academy",yourRepublic:"Your Republic",directory:"Directory",participate:"Participate",print:"Print edition"}};
  const bar=document.createElement("div");bar.className="evo-scrollbar";bar.innerHTML='<button class="evo-menu-trigger" type="button" aria-expanded="false" aria-controls="evo-drawer"><span></span><span></span><span></span><b></b></button><a class="evo-mini-brand" href="/news/a.html?i=aW5kZXguaHRtbA">EVOFORD <em>NEWS</em></a><nav class="evo-quick-links" aria-label="Quick sections"></nav>';
  const drawer=document.createElement("aside");drawer.className="evo-drawer";drawer.id="evo-drawer";drawer.setAttribute("aria-hidden","true");
  drawer.innerHTML='<div class="evo-drawer-head"><a class="evo-drawer-brand" href="/news/a.html?i=aW5kZXguaHRtbA">EVOFORD <em>NEWS</em></a><button type="button" class="evo-drawer-close" aria-label="Close menu">×</button></div><label class="evo-drawer-search"><span aria-hidden="true">⌕</span><input type="search"></label><div class="evo-drawer-caption" data-label="explore"></div><nav class="evo-drawer-links" aria-label="All sections"></nav><div class="evo-drawer-tools"><div class="evo-drawer-caption" data-label="reading"></div><button type="button" data-evo-theme="light">☼ <span data-label="light"></span></button><button type="button" data-evo-theme="dark">☾ <span data-label="dark"></span></button><button type="button" data-evo-contrast aria-pressed="false">◐ <span data-label="contrast"></span><i aria-hidden="true"></i></button><div class="evo-drawer-languages"><button type="button" data-evo-language="es">ES</button><button type="button" data-evo-language="en">EN</button></div></div><p class="evo-drawer-foot"></p>';
  const quick=bar.querySelector(".evo-quick-links"),links=drawer.querySelector(".evo-drawer-links");
  [...source.querySelectorAll("a")].forEach((a,i)=>{const q=a.cloneNode(true),d=a.cloneNode(true);q.dataset.sourceIndex=i;d.dataset.sourceIndex=i;if(i<7)quick.append(q);d.removeAttribute("aria-current");links.append(d)});
  const extras=[["academy","aula-innovacion.html"],["yourRepublic","a.html?i=dHUtcmVwdWJsaWNhLmh0bWw"],["directory","a.html?i=ZGlyZWN0b3J5Lmh0bWw"],["participate","participa.html"],["print","edicion.html"]];
  extras.forEach(([key,href])=>{if(![...links.querySelectorAll("a")].some(a=>a.getAttribute("href")===href)){const a=document.createElement("a");a.href=href;a.dataset.extraLabel=key;links.append(a)}});
  const overlay=document.createElement("div");overlay.className="evo-drawer-overlay";overlay.hidden=true;document.body.append(bar,overlay,drawer);
  const trigger=bar.querySelector(".evo-menu-trigger"),close=drawer.querySelector(".evo-drawer-close"),search=drawer.querySelector("input");
  function applyLanguage(){
   const t=labels[language()];trigger.querySelector("b").textContent=t.menu;trigger.setAttribute("aria-label",t.menu);close.setAttribute("aria-label",t.close);search.placeholder=t.search;search.setAttribute("aria-label",t.search);
   drawer.querySelectorAll("[data-label]").forEach(el=>el.textContent=t[el.dataset.label]);drawer.querySelector(".evo-drawer-foot").textContent=t.foot;
   drawer.querySelectorAll("[data-extra-label]").forEach(a=>a.textContent=t[a.dataset.extraLabel]);
   // Re-copy translated labels from the canonical desktop navigation after site.js updates it.
   links.querySelectorAll("[data-source-index]").forEach(a=>{const original=source.querySelectorAll("a")[Number(a.dataset.sourceIndex)];if(original)a.textContent=original.textContent});
   quick.querySelectorAll("[data-source-index]").forEach(a=>{const original=source.querySelectorAll("a")[Number(a.dataset.sourceIndex)];if(original)a.textContent=original.textContent});
   drawer.querySelectorAll("[data-evo-language]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.evoLanguage===language())));
  }
  function open(){overlay.hidden=false;requestAnimationFrame(()=>drawer.classList.add("is-open"));drawer.setAttribute("aria-hidden","false");trigger.setAttribute("aria-expanded","true");document.body.classList.add("evo-drawer-open");close.focus()}
  function shut(){drawer.classList.remove("is-open");drawer.setAttribute("aria-hidden","true");trigger.setAttribute("aria-expanded","false");document.body.classList.remove("evo-drawer-open");overlay.hidden=true;trigger.focus()}
  trigger.addEventListener("click",open);close.addEventListener("click",shut);overlay.addEventListener("click",shut);document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!overlay.hidden)shut()});
  links.addEventListener("click",e=>{if(e.target.closest("a"))shut()});quick.addEventListener("click",e=>{if(e.target.closest("a"))shut()});
  search.addEventListener("input",()=>{const q=search.value.trim().toLocaleLowerCase();links.querySelectorAll("a").forEach(a=>a.hidden=!a.textContent.toLocaleLowerCase().includes(q))});
  let wasVisible=false;const onScroll=()=>{const visible=window.scrollY>220;if(visible!==wasVisible){bar.classList.toggle("is-visible",visible);wasVisible=visible}};window.addEventListener("scroll",onScroll,{passive:true});onScroll();
  const contrast=drawer.querySelector("[data-evo-contrast]");
  let saved="light",contrastOn=false;
  try{saved=localStorage.getItem("evoford-news-desktop-theme")==="dark"?"dark":"light";contrastOn=localStorage.getItem("evoford-news-high-contrast")==="1"}catch(e){}
  function syncThemeControls(){
   document.documentElement.dataset.evoTheme=saved;
   document.documentElement.classList.toggle("evo-high-contrast",contrastOn);
   drawer.querySelectorAll("[data-evo-theme]").forEach(b=>{const active=!contrastOn&&b.dataset.evoTheme===saved;b.classList.toggle("is-active",active);b.setAttribute("aria-pressed",String(active))});
   contrast.setAttribute("aria-pressed",String(contrastOn));contrast.classList.toggle("is-active",contrastOn);
  }
  drawer.querySelectorAll("[data-evo-theme]").forEach(b=>b.addEventListener("click",()=>{saved=b.dataset.evoTheme;contrastOn=false;try{localStorage.setItem("evoford-news-desktop-theme",saved);localStorage.setItem("evoford-news-high-contrast","0")}catch(e){}syncThemeControls()}));
  contrast.addEventListener("click",()=>{contrastOn=!contrastOn;try{localStorage.setItem("evoford-news-high-contrast",contrastOn?"1":"0")}catch(e){}syncThemeControls()});
  syncThemeControls();
  drawer.querySelectorAll("[data-evo-language]").forEach(b=>b.addEventListener("click",()=>{try{localStorage.setItem("evoford-news-language",b.dataset.evoLanguage)}catch(e){}const u=new URL(location.href);u.searchParams.set("lang",b.dataset.evoLanguage);location.href=u.href}));
  window.addEventListener("evoford:languagechange",applyLanguage);window.addEventListener("storage",e=>{if(e.key==="evoford-news-language")applyLanguage()});applyLanguage();
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();