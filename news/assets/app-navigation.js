/* EVOFORD NEWS — canonical navigation for desktop and PWA */
(function(){
 "use strict";
 const items=[
 ["Internacional","International","a.html?i=aW5kZXguaHRtbCNzZWN0aW9uLWludGVybmFjaW9uYWw"],["Política","Politics","a.html?i=aW5kZXguaHRtbCNzZWN0aW9uLXBvbGl0aWNh"],["Economía","Economy","a.html?i=aW5kZXguaHRtbCNzZWN0aW9uLWVjb25vbWlh"],["Seguridad","Security","a.html?i=aW5kZXguaHRtbCNzZWN0aW9uLXNlZ3VyaWRhZA"],["Startups e innovación","Startups & innovation","startups.html"],["Evoford Briefing","Evoford Briefing","briefing.html"],["Opinión","Opinion","a.html?i=aW5kZXguaHRtbCNzZWN0aW9uLW9waW5pb24tYW5hbGlzaXM"],["Tu República","Your Republic","a.html?i=dHUtcmVwdWJsaWNhLmh0bWw"],["Directorio","Directory","directory.html"],["Participa","Participate","participa.html"],["Edición impresa","Print edition","edicion.html"]];
 const mobile=[["Portada","Home","/news/index.html","M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"],["Academy","Academy","/news/aula-innovacion.html","M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"],["Startups","Startups","/news/startups.html","M12 2v20M2 12h20"],["Tu República","Your Republic","/news/tu-republica.html","M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18M3 12h18"],["Directorio","Directory","/news/directory.html","M4 6h16M4 12h16M4 18h16"]];
 function lang(){const q=new URLSearchParams(location.search).get("lang");if(q==="en"||q==="es")return q;try{return localStorage.getItem("evoford-news-language")==="en"?"en":"es"}catch(e){return "es"}}
 function apply(){const en=lang()==="en",file=location.pathname.split("/").pop()||"index.html";
 document.querySelectorAll(".masthead nav.nav").forEach(nav=>{nav.innerHTML=items.map(([es,eng,href])=>'<a href="'+href+'"'+(href===file?' aria-current="page"':'')+' data-es="'+es.replace(/&/g,"&amp;")+'" data-en="'+eng.replace(/&/g,"&amp;")+'">'+(en?eng:es)+'</a>').join("");nav.setAttribute("aria-label",en?"News sections":"Secciones de EVOFORD NEWS")});
 document.querySelectorAll(".app-bottom-nav").forEach(nav=>{let links=[...nav.querySelectorAll("a")],home=links.find(a=>a.getAttribute("data-primary-section")==="0"||/portada|home/i.test(a.textContent)||/index\.html/.test(a.getAttribute("href")||""));if(!home){home=document.createElement("a");home.innerHTML='<span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="'+mobile[0][3]+'"/></svg></span><span class="nav-label"></span>';nav.insertBefore(home,nav.firstChild)}home.href=mobile[0][2];home.setAttribute("data-primary-section","0");links=[...nav.querySelectorAll("a")];links.forEach(a=>{const h=a.getAttribute("href")||"",t=a.textContent.toLowerCase();let i=a===home?0:/aula-innovacion\.html/.test(h)||/academy/.test(t)?1:/startups\.html/.test(h)||/startups/.test(t)?2:/tu-republica\.html/.test(h)||h.includes("dHUtcmVwdWJsaWNh")?3:/directory\.html/.test(h)||h.includes("ZGlyZWN0b3J5")?4:-1;if(i<0)return;const m=mobile[i],label=a.querySelector(".nav-label")||a.querySelector("span:last-child");a.setAttribute("data-primary-section",String(i));a.setAttribute("aria-label",en?m[1]:m[0]);if(label)label.textContent=en?m[1]:m[0]});nav.setAttribute("aria-label",en?"EVOFORD NEWS main navigation":"Navegación principal de EVOFORD NEWS")})}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply);else apply();
 // Academy tab: detect the real Academy page even if an older short-route URL is open.
 document.addEventListener("click",function(e){
  const a=e.target.closest('.app-bottom-nav a[data-primary-section="1"]');
  if(!a)return;
  const params=new URLSearchParams(location.search);
  const isAcademy=/\/aula-innovacion\.html$/.test(location.pathname) ||
    (location.pathname.endsWith("/a.html") && params.get("i")==="YXVsYS1pbm5vdmFjaW9uLmh0bWw");
  if(isAcademy){
   e.preventDefault();
   if(location.hash)history.replaceState(null,"",location.pathname+location.search);
   window.scrollTo({top:0,behavior:"smooth"});
  }
 },true);
 // Sincronizar el menú cuando site.js cambia el idioma sin recargar la página.
 window.addEventListener("evoford:languagechange",apply);
 document.addEventListener("click",e=>{if(e.target.closest("[data-language]"))setTimeout(apply,0)});
 window.addEventListener("storage",e=>{if(e.key==="evoford-news-language")apply()})
})();