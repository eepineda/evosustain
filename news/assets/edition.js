(function(){
"use strict";
const URL="https://poywsdigujbarvnzbfnz.supabase.co";
const KEY="sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f";
const $=id=>document.getElementById(id);let language=localStorage.getItem("evoford-news-language")==="en"?"en":"es",articles=[],printAdCampaign=null,editionLoadPromise=Promise.resolve();
const ui={
es:{back:"← Volver a Evoford News",format:"Formato",a4:"A4 · Estándar",a3:"A3 · Periódico",refresh:"Actualizar edición",print:"Imprimir / Guardar PDF",png:"Exportar PNG",other:"English",date:"EDICIÓN DEL",descriptor:"INFORMACIÓN · OPINIÓN · ANÁLISIS",kicker:"EL PERIÓDICO GLOBAL · INFORMACIÓN CON CONTEXTO",motto:"Noticias para entender el mundo",sections:"INTERNACIONAL · ECONOMÍA · SOCIEDAD · TECNOLOGÍA · OPINIÓN",otherNews:"OTRAS NOTICIAS",paperFooter:"Edición digital preparada para impresión",empty:"Todavía no hay artículos publicados para esta edición.",noMore:"No hay más noticias en esta edición.",stories:"noticias",by:"POR"},
en:{back:"← Back to Evoford News",format:"Paper size",a4:"A4 · Standard",a3:"A3 · Newspaper",refresh:"Refresh edition",print:"Print / Save PDF",png:"Export PNG",other:"Español",date:"EDITION OF",descriptor:"INFORMATION · OPINION · ANALYSIS",kicker:"THE GLOBAL NEWSPAPER · INFORMATION WITH CONTEXT",motto:"News to understand the world",sections:"INTERNATIONAL · ECONOMY · SOCIETY · TECHNOLOGY · OPINION",otherNews:"MORE STORIES",paperFooter:"Digital edition prepared for print",empty:"There are no published articles in this edition yet.",noMore:"There are no more stories in this edition.",stories:"stories",by:"BY"}};
const esc=v=>String(v||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pick=(a,es,en)=>language==="en"?(a[en]||a[es]||""):(a[es]||a.title||"");
const url=a=>"articles/plantilla-articulo.html?slug="+encodeURIComponent(a.slug||"");
const category=a=>{const value=a.category||"ACTUALIDAD";const labels={Internacional:"International",Política:"Politics",Economía:"Economy",Seguridad:"Security",Tecnología:"Technology",Startups:"Startups",Innovación:"Innovation",Opinión:"Opinion",Sociedad:"Society"};return esc(language==="en"?(labels[value]||value):value);};
function renderPrintAd(){
 const slot=$("printAdSlot");if(!slot)return;
 if(!printAdCampaign||!/^https:\/\//i.test(printAdCampaign.creative_url||"")){slot.hidden=true;slot.innerHTML="";return;}
 const image=esc(printAdCampaign.creative_url),target=/^https:\/\//i.test(printAdCampaign.target_url||"")?esc(printAdCampaign.target_url):image;
 const title=esc(printAdCampaign.campaign_title||"Evoford News");
 const isPdf=/\.pdf(?:$|[?#])/i.test(image);
 slot.innerHTML='<div class="print-ad-label">'+(language==="en"?"ADVERTISEMENT":"PUBLICIDAD")+'</div><a class="print-ad-link" href="'+target+'" target="_blank" rel="sponsored noopener noreferrer">'+(isPdf?'<span class="print-ad-pdf">'+(language==="en"?"View advertising material":"Ver material publicitario")+'</span>':'<img src="'+image+'" alt="'+title+'" loading="eager">')+'<span class="print-ad-title">'+title+'</span></a>';
 slot.hidden=false;
}
async function loadPrintAd(){
 try{
  const client=window.supabase.createClient(URL,KEY);
  const result=await client.from("published_ad_campaigns").select("id,campaign_title,placement,creative_url,target_url").eq("placement","print");
  if(result.error)throw result.error;
  printAdCampaign=(result.data||[]).find(item=>/^https:\/\//i.test(item.creative_url||""))||null;
  renderPrintAd();
 }catch(error){console.warn("Evoford print advertising:",error.message||error);}
}
function applyLanguage(){
 const t=ui[language];
 $("backLink").textContent=t.back;$("formatLabel").textContent=t.format;
 $("paperSize").options[0].textContent=t.a4;$("paperSize").options[1].textContent=t.a3;
 $("refreshBtn").textContent=t.refresh;$("printBtn").textContent=t.print;$("pngBtn").textContent=t.png;
 $("languageToggle").textContent=t.other;$("languageToggle").setAttribute("aria-label",language==="es"?"Cambiar idioma a English":"Switch language to Spanish");$("languageToggle").title=language==="es"?"Cambiar a English":"Switch to Spanish";
 document.querySelector(".paper-topline span:nth-child(2)").textContent=t.descriptor;
 document.querySelector(".paper-kicker").textContent=t.kicker;
 document.querySelector(".paper-motto").textContent=t.motto;
 document.querySelector(".paper-sections").textContent=t.sections;
 document.querySelector(".section-label span:first-child").textContent=t.otherNews;
 document.querySelector(".paper-footer span:nth-child(2)").textContent=t.paperFooter;
 $("editionDate").textContent=t.date+" "+new Date().toLocaleDateString(language==="en"?"en-GB":"es-ES",{day:"numeric",month:"long",year:"numeric"}).toUpperCase();
 document.documentElement.lang=language;renderPrintAd();
}
function render(){
 const lead=articles[0];
 if(!lead){$("lead").innerHTML='<p class="empty">'+ui[language].empty+'</p>';$("storyGrid").innerHTML="";$("storyCount").textContent="0 "+ui[language].stories;return;}
 const title=language==="en"?(lead.title_en||lead.title):(lead.title_es||lead.title),summary=language==="en"?(lead.summary_en||lead.summary):(lead.summary_es||lead.summary);
 const side=articles.slice(1,4);
 $("lead").innerHTML='<div class="lead-headline"><div class="category">'+category(lead)+'</div><h1>'+esc(title)+'</h1><p class="summary">'+esc(summary)+'</p><div class="byline">'+ui[language].by+' '+esc(lead.author||"Evoford News")+' · '+esc(lead.country||"Evoford News")+'</div></div><div class="lead-content"><div class="lead-photo">'+(lead.image_url&&/^https:\/\//i.test(lead.image_url)?'<img src="'+esc(lead.image_url)+'" alt="'+esc(title)+'">':'<div class="lead-placeholder">EVOFORD NEWS</div>')+'</div><aside class="lead-sidebar"><div class="sidebar-heading">'+(language==="en"?"MORE HEADLINES":"OTROS TITULARES")+'</div>'+side.map((a,i)=>'<article class="side-story"><span class="side-number">0'+(i+1)+'</span><div><div class="category">'+category(a)+'</div><h2><a href="'+url(a)+'">'+esc(pick(a,"title","title_en"))+'</a></h2><p>'+esc(pick(a,"summary","summary_en"))+'</p></div></article>').join("")+'</aside></div>';
 const fullText=language==="en"?(lead.content_en||lead.content||""):(lead.content_es||lead.content||"");
 let normalized=String(fullText).replace(/\\n/g,"\n").replace(/\r/g,"");
 if(/&lt;|&#0*60;|&#x0*3c;/i.test(normalized)){
  const decoder=document.createElement("textarea");
  decoder.innerHTML=normalized;
  normalized=decoder.value;
 }
 const hasMarkup=/<\/?[a-z][^>]*>/i.test(normalized);
 let bodyHtml="";
 if(hasMarkup){
  const parsed=new DOMParser().parseFromString(normalized,"text/html");
  const allowed=new Set(["P","H2","H3","H4","UL","OL","LI","STRONG","B","EM","I","BLOCKQUOTE","BR","A"]);
  const cleanNode=node=>{
   if(node.nodeType===Node.TEXT_NODE)return document.createTextNode(node.nodeValue||"");
   if(node.nodeType!==Node.ELEMENT_NODE)return document.createDocumentFragment();
   const tag=node.tagName;
   if(!allowed.has(tag)){
    const fragment=document.createDocumentFragment();
    Array.from(node.childNodes).forEach(child=>fragment.appendChild(cleanNode(child)));
    return fragment;
   }
   const clean=document.createElement(tag.toLowerCase());
   if(tag==="A"){
    const href=node.getAttribute("href")||"";
    if(/^https:\/\//i.test(href)){
     clean.setAttribute("href",href);
     clean.setAttribute("target","_blank");
     clean.setAttribute("rel","noopener noreferrer");
    }
   }
   Array.from(node.childNodes).forEach(child=>clean.appendChild(cleanNode(child)));
   return clean;
  };
  Array.from(parsed.body.childNodes).forEach(node=>{
   const clean=cleanNode(node);
   if(clean.nodeType===Node.DOCUMENT_FRAGMENT_NODE){
    bodyHtml+=Array.from(clean.childNodes).map(n=>n.outerHTML||esc(n.textContent)).join("");
   }else{
    bodyHtml+=clean.outerHTML||esc(clean.textContent);
   }
  });
 }else{
  const blocks=normalized.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean).filter((x,i)=>!(i===0&&x===String(title).trim()));
  bodyHtml=blocks.map(x=>"<p>"+esc(x).replace(/\n/g,"<br>")+"</p>").join("");
 }
 if(!bodyHtml)bodyHtml='<p class="empty">'+(language==="en"?"The full article text is not available in this language.":"El texto completo de este artículo no está disponible.")+'</p>';
 $("fullArticle").classList.add("embedded-lead-story");
 $("fullArticle").innerHTML='<div class="full-article-heading"><span>'+(language==="en"?"FULL STORY":"ARTÍCULO COMPLETO")+'</span><h2>'+esc(title)+'</h2><div class="byline">'+ui[language].by+" "+esc(lead.author||"Evoford News")+'</div></div><div class="full-article-body">'+bodyHtml+'</div>';
 const rest=articles.slice(4,13);
 $("storyGrid").innerHTML=rest.map(a=>'<article class="story">'+(a.image_url&&/^https:\/\//i.test(a.image_url)?'<img loading="lazy" src="'+esc(a.image_url)+'" alt="'+esc(pick(a,"title","title_en"))+'">':'')+'<div class="category">'+category(a)+'</div><h2><a href="'+url(a)+'">'+esc(pick(a,"title","title_en"))+'</a></h2><p>'+esc(pick(a,"summary","summary_en"))+'</p><div class="byline">'+esc(a.author||"Evoford News")+'</div></article>').join("")||'<p class="empty">'+ui[language].noMore+'</p>';
 $("storyCount").textContent=rest.length+" "+ui[language].stories;
}
const authClient=window.supabase.createClient(URL,KEY);
let accessPanel=null;
function showAccessPanel(message){
 if(!accessPanel){
  accessPanel=document.createElement("section");
  accessPanel.id="editionAccess";
  accessPanel.style.cssText="max-width:560px;margin:48px auto;padding:28px;background:#fff;border:1px solid #dbe2ea;border-radius:8px;color:#17283c;font:15px Arial,sans-serif;line-height:1.5";
  accessPanel.innerHTML='<h1 style="color:#102b4e">Edición impresa privada</h1><p>Acceso reservado a los correos autorizados por Evoford News.</p><form id="editionLoginForm"><label for="editionEmail">Correo electrónico</label><input id="editionEmail" type="email" required autocomplete="email" style="display:block;width:100%;padding:12px;margin:8px 0 14px;border:1px solid #cbd5e1;border-radius:4px;box-sizing:border-box"><button type="submit" style="padding:11px 16px;background:#102b4e;color:#fff;border:0;border-radius:4px;font-weight:700">Enviar enlace de acceso</button></form><p id="editionAccessMessage" role="status"></p>';
  document.body.insertBefore(accessPanel,document.body.firstChild);
  accessPanel.querySelector("#editionLoginForm").addEventListener("submit",async event=>{
   event.preventDefault();const button=event.currentTarget.querySelector("button");button.disabled=true;
   const {error}=await authClient.auth.signInWithOtp({email:accessPanel.querySelector("#editionEmail").value.trim().toLowerCase(),options:{emailRedirectTo:new URL("/news/edicion.html",location.origin).href}});
   accessPanel.querySelector("#editionAccessMessage").textContent=error?error.message:"Revisa tu correo para completar el acceso.";button.disabled=false;
  });
 }
 accessPanel.hidden=false;
 accessPanel.querySelector("#editionAccessMessage").textContent=message||"";
 $("backLink").hidden=true;$("newspaper").hidden=true;document.querySelector(".toolbar").hidden=true;
}
function hideAccessPanel(){
 if(accessPanel)accessPanel.hidden=true;
 $("backLink").hidden=false;$("newspaper").hidden=false;document.querySelector(".toolbar").hidden=false;
}
async function load(){
 try{
  showAccessPanel("Comprobando autorización…");
  const {data:{session}}=await authClient.auth.getSession();
  if(!session){showAccessPanel("Inicia sesión con tu correo autorizado.");return;}
  const {data,error}=await authClient.functions.invoke("print-edition",{body:{action:"load"},headers:{Authorization:"Bearer "+session.access_token}});
  if(error)throw error;
  if(data&&data.error)throw new Error(data.error);
  articles=data.articles||[];printAdCampaign=data.printAd||null;
  hideAccessPanel();render();renderPrintAd();
 }catch(error){
  const message=error.message||"No se pudo comprobar el acceso.";
  showAccessPanel(message+" Si necesitas autorización, contacta con el equipo editorial.");
  console.error("Evoford print edition access:",error);
 }
}
authClient.auth.onAuthStateChange((event,session)=>{
 if(event==="SIGNED_IN"||event==="TOKEN_REFRESHED"||event==="SIGNED_OUT"){
  setTimeout(()=>{editionLoadPromise=load();},0);
 }
});
function syncPrintPaper(){
 const raw=$("paperSize").value==="A3"?"A3":"A4";
 const a3=document.getElementById("paperA3");
 const a4=document.getElementById("paperA4");
 if(!a3||!a4)throw new Error("No se cargaron las hojas de tamaño A3/A4.");
 a3.media=raw==="A3"?"print":"not all";
 a4.media=raw==="A4"?"print":"not all";
 document.documentElement.dataset.printSize=raw.toLowerCase();
 return raw;
}
$("paperSize").addEventListener("change",syncPrintPaper);
window.addEventListener("beforeprint",syncPrintPaper);
async function printEdition(){
 const button=$("printBtn");button.disabled=true;
 try{
  await editionLoadPromise;
  if($("lead").querySelector(".loading"))throw new Error("La edición todavía se está cargando. Inténtalo de nuevo en unos segundos.");
  syncPrintPaper();
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 const images=Array.from(document.querySelectorAll(".newspaper img"));
 images.forEach(img=>{img.loading="eager";});
 await Promise.all(images.map(img=>{
  if(img.complete&&img.naturalWidth)return Promise.resolve();
  if(typeof img.decode==="function")return img.decode().catch(()=>{});
  return new Promise(resolve=>{img.addEventListener("load",resolve,{once:true});img.addEventListener("error",resolve,{once:true});});
 }));
 if(document.fonts&&document.fonts.ready)await document.fonts.ready;
  if(!window.EvoPrintController||!window.EvoPrintController.print)throw new Error("No se ha cargado el generador PDF.");
  await window.EvoPrintController.print();
 }catch(error){alert(error.message||"No se pudo preparar la edición para imprimir.");}
 finally{button.disabled=false;}
}
$("printBtn").addEventListener("click",printEdition);
$("languageToggle").addEventListener("click",()=>{language=language==="es"?"en":"es";try{localStorage.setItem("evoford-news-language",language)}catch(e){}applyLanguage();render();});
$("refreshBtn").addEventListener("click",()=>{$("lead").innerHTML='<p class="loading">'+(language==="en"?"Refreshing edition…":"Actualizando edición…")+'</p>';editionLoadPromise=load();});
syncPrintPaper();
applyLanguage();editionLoadPromise=load();
})();