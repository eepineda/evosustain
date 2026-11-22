/* EVOFORD NEWS — desktop scroll navigation and editorial drawer */
(function(){
 "use strict";
 if(window.matchMedia("(max-width: 760px)").matches || window.matchMedia("(display-mode: standalone)").matches) return;
 const masthead=document.querySelector(".masthead");
 const source=masthead&&masthead.querySelector("nav.nav");
 if(!masthead||!source) return;
 const en=(document.documentElement.lang||"es").toLowerCase().startsWith("en");
 const bar=document.createElement("div");bar.className="evo-scrollbar";bar.setAttribute("aria-label",en?"Quick navigation":"Navegación rápida");
 bar.innerHTML='<button class="evo-menu-trigger" type="button" aria-expanded="false" aria-controls="evo-drawer"><span></span><span></span><span></span><b>'+(en?"Menu":"Menú")+'</b></button><a class="evo-mini-brand" href="/news/index.html">EVOFORD <em>NEWS</em></a><nav class="evo-quick-links" aria-label="Quick sections"></nav>';
 const quick=bar.querySelector(".evo-quick-links");
 [...source.querySelectorAll("a")].slice(0,7).forEach(a=>quick.append(a.cloneNode(true)));
 const overlay=document.createElement("div");overlay.className="evo-drawer-overlay";overlay.hidden=true;
 const drawer=document.createElement("aside");drawer.className="evo-drawer";drawer.id="evo-drawer";drawer.setAttribute("aria-label",en?"Main navigation":"Menú principal");drawer.setAttribute("aria-hidden","true");
 drawer.innerHTML='<div class="evo-drawer-head"><a class="evo-drawer-brand" href="/news/index.html">EVOFORD <em>NEWS</em></a><button type="button" class="evo-drawer-close" aria-label="'+(en?"Close menu":"Cerrar menú")+'">×</button></div><label class="evo-drawer-search"><span>⌕</span><input type="search" placeholder="'+(en?"Search sections":"Buscar secciones")+'" aria-label="'+(en?"Search sections":"Buscar secciones")+'"></label><div class="evo-drawer-caption">'+(en?"EXPLORE EVOFORD NEWS":"EXPLORA EVOFORD NEWS")+'</div><nav class="evo-drawer-links"></nav><div class="evo-drawer-tools"><div class="evo-drawer-caption">'+(en?"READING EXPERIENCE":"PERSONALIZA TU LECTURA")+'</div><button type="button" data-evo-theme="light">☼ <span>'+(en?"Light mode":"Modo claro")+'</span></button><button type="button" data-evo-theme="dark">☾ <span>'+(en?"Dark mode":"Modo oscuro")+'</span></button><button type="button" data-evo-contrast>◐ <span>'+(en?"High contrast":"Alto contraste")+'</span><i></i></button><div class="evo-drawer-languages"><a href="?lang=es">ES</a><a href="?lang=en">EN</a></div></div><p class="evo-drawer-foot">Información que conecta. Comunidades que se acercan.</p>';
 const links=drawer.querySelector(".evo-drawer-links");
 [...source.querySelectorAll("a")].forEach(a=>{const clone=a.cloneNode(true);clone.removeAttribute("aria-current");links.append(clone)});
 const community=[["Academy","aula-innovacion.html"],["Tu República","a.html?i=dHUtcmVwdWJsaWNhLmh0bWw"],["Directorio","directory.html"],["Participa","participa.html"]];
 community.forEach(([label,href])=>{if(![...links.querySelectorAll("a")].some(a=>a.href.includes(href))) {const a=document.createElement("a");a.href=href;a.textContent=label;links.append(a)}});
 document.body.append(bar,overlay,drawer);
 const trigger=bar.querySelector("button"),close=drawer.querySelector(".evo-drawer-close"),search=drawer.querySelector("input");
 function open(){overlay.hidden=false;drawer.classList.add("is-open");drawer.setAttribute("aria-hidden","false");trigger.setAttribute("aria-expanded","true");document.body.classList.add("evo-drawer-open");close.focus()}
 function shut(){drawer.classList.remove("is-open");drawer.setAttribute("aria-hidden","true");trigger.setAttribute("aria-expanded","false");document.body.classList.remove("evo-drawer-open");overlay.hidden=true;trigger.focus()}
 trigger.addEventListener("click",open);close.addEventListener("click",shut);overlay.addEventListener("click",shut);
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&drawer.classList.contains("is-open"))shut()});
 drawer.addEventListener("click",e=>{if(e.target.closest("a"))shut()});
 search.addEventListener("input",()=>{const q=search.value.trim().toLocaleLowerCase();links.querySelectorAll("a").forEach(a=>a.hidden=!a.textContent.toLocaleLowerCase().includes(q))});
 let last=false;function scroll(){const show=window.scrollY>220;if(show!==last){bar.classList.toggle("is-visible",show);last=show}}window.addEventListener("scroll",scroll,{passive:true});scroll();
 function theme(mode){document.documentElement.dataset.evoTheme=mode;try{localStorage.setItem("evoford-news-desktop-theme",mode)}catch(e){}}
 try{const saved=localStorage.getItem("evoford-news-desktop-theme");if(saved)theme(saved)}catch(e){}
 drawer.querySelectorAll("[data-evo-theme]").forEach(b=>b.addEventListener("click",()=>theme(b.dataset.evoTheme)));
 const contrast=drawer.querySelector("[data-evo-contrast]");try{if(localStorage.getItem("evoford-news-high-contrast")==="1")document.documentElement.classList.add("evo-high-contrast")}catch(e){}
 contrast.addEventListener("click",()=>{const active=document.documentElement.classList.toggle("evo-high-contrast");try{localStorage.setItem("evoford-news-high-contrast",active?"1":"0")}catch(e){}contrast.setAttribute("aria-pressed",String(active))});
})();