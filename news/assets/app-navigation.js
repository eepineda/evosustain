/* EVOFORD NEWS shared bilingual primary navigation */
(function(){
 "use strict";
 const labels={es:["","Academy","Startups","Tu República","Directorio"],en:["","Academy","Startups","Your Republic","Directory"]};
 function language(){const q=new URLSearchParams(location.search).get("lang");if(q==="en"||q==="es")return q;try{return localStorage.getItem("evoford-news-language")==="en"?"en":"es"}catch(_){return "es"}}
 function apply(){const lang=language(),names=labels[lang];document.querySelectorAll(".app-bottom-nav").forEach(nav=>{nav.querySelectorAll("a[data-primary-section]").forEach(a=>{const key=Number(a.getAttribute("data-primary-section"));if(key===0){a.remove();return;}if(names[key]){const label=a.querySelector(".nav-label")||a.querySelector("span:last-child");if(label)label.textContent=names[key];a.setAttribute("aria-label",names[key]);}});nav.setAttribute("aria-label",lang==="en"?"EVOFORD NEWS main navigation":"Navegación principal de EVOFORD NEWS");});}
 apply();document.addEventListener("click",e=>{if(e.target.closest("[data-language]"))setTimeout(apply,0)});window.addEventListener("storage",e=>{if(e.key==="evoford-news-language")apply()});
})();
