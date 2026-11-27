(function(){
"use strict";
const URL="https://poywsdigujbarvnzbfnz.supabase.co";
const KEY="sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f";
const $=id=>document.getElementById(id);let language=localStorage.getItem("evoford-news-language")==="en"?"en":"es",articles=[],printAdCampaign=null,editionLoadPromise=Promise.resolve();
const ui={
es:{back:"← Volver a Evoford News",format:"Formato",a4:"A4 · Estándar",a3:"A3 · Periódico",refresh:"Actualizar edición",print:"Imprimir / Guardar PDF",png:"Exportar PNG",campaign:"Promocionar edición",other:"English",date:"EDICIÓN DEL",descriptor:"INFORMACIÓN · OPINIÓN · ANÁLISIS",kicker:"EL PERIÓDICO GLOBAL · INFORMACIÓN CON CONTEXTO",motto:"Noticias para entender el mundo",sections:"INTERNACIONAL · ECONOMÍA · SOCIEDAD · TECNOLOGÍA · OPINIÓN",otherNews:"OTRAS NOTICIAS",paperFooter:"Edición digital preparada para impresión",empty:"Todavía no hay artículos publicados para esta edición.",noMore:"No hay más noticias en esta edición.",stories:"noticias",by:"POR"},
en:{back:"← Back to Evoford News",format:"Paper size",a4:"A4 · Standard",a3:"A3 · Newspaper",refresh:"Refresh edition",print:"Print / Save PDF",png:"Export PNG",campaign:"Promote edition",other:"Español",date:"EDITION OF",descriptor:"INFORMATION · OPINION · ANALYSIS",kicker:"THE GLOBAL NEWSPAPER · INFORMATION WITH CONTEXT",motto:"News to understand the world",sections:"INTERNATIONAL · ECONOMY · SOCIETY · TECHNOLOGY · OPINION",otherNews:"MORE STORIES",paperFooter:"Digital edition prepared for print",empty:"There are no published articles in this edition yet.",noMore:"There are no more stories in this edition.",stories:"stories",by:"BY"}};
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
 $("campaignBtn").textContent=t.campaign;document.documentElement.lang=language;renderPrintAd();document.dispatchEvent(new CustomEvent("edition:languagechange",{detail:{language}}));
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
window.EvofordSupabaseClient=authClient;
let accessPanel=null;
function showAccessPanel(message){
 if(!accessPanel){
  accessPanel=document.createElement("section");
  accessPanel.id="editionAccess";\n  accessPanel.className="edition-access";
  accessPanel.style.cssText="";
  accessPanel.innerHTML='<div class="edition-access__masthead"><span>EL PERIÓDICO GLOBAL · INFORMACIÓN CON CONTEXTO</span><strong>EVOFORD NEWS</strong><em>Noticias para entender el mundo</em></div><p class="edition-access__eyebrow">EDICIÓN IMPRESA</p><h1>Acceso editorial</h1><p>Acceso reservado a los correos autorizados por Evoford News.</p><form id="editionLoginForm"><label for="editionEmail">Correo electrónico</label><input id="editionEmail" type="email" required autocomplete="email" style="display:block;width:100%;padding:12px;margin:8px 0 14px;border:1px solid #cbd5e1;border-radius:4px;box-sizing:border-box"><button type="submit" style="padding:11px 16px;background:#102b4e;color:#fff;border:0;border-radius:4px;font-weight:700">Enviar enlace de acceso</button></form><p id="editionAccessMessage" role="status"></p>';
  document.body.insertBefore(accessPanel,document.body.firstChild);
  const loginForm=accessPanel.querySelector("#editionLoginForm");
  const emailInput=accessPanel.querySelector("#editionEmail");
  const status=accessPanel.querySelector("#editionAccessMessage");
  emailInput.addEventListener("invalid",()=>{status.textContent="Introduce el correo completo, por ejemplo nombre@dominio.com.";});
  emailInput.addEventListener("input",()=>{status.textContent="";});
  loginForm.addEventListener("submit",async event=>{
   event.preventDefault();
   const button=loginForm.querySelector("button");
   const email=emailInput.value.trim().toLowerCase();
   if(!emailInput.validity.valid){status.textContent="Introduce un correo electrónico completo y válido.";emailInput.focus();return;}
   button.disabled=true;button.textContent="Enviando…";status.textContent="Solicitando enlace de acceso…";
   try{
    await authClient.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+"/news/edicion.html",shouldCreateUser:false}});
    status.textContent="Si el correo está autorizado, recibirás un enlace de acceso. Comprueba tu bandeja de entrada y la carpeta de correo no deseado.";
   }catch(error){
    status.textContent="Si el correo está autorizado, recibirás un enlace de acceso. Comprueba tu bandeja de entrada y la carpeta de correo no deseado. Si no llega, contacta con el administrador.";
    console.warn("Evoford editorial sign-in request could not be completed.");
   }finally{
    button.disabled=false;button.textContent="Enviar enlace de acceso";
   }
  });
 }
 accessPanel.hidden=false;
 accessPanel.querySelector("#editionAccessMessage").textContent=message||"";
 $("backLink").hidden=true;$("newspaper").hidden=true;document.querySelector(".toolbar").hidden=true;
 const socialHub=$("socialHub");if(socialHub){socialHub.hidden=true;socialHub.style.display="none";}
 const campaignPanel=$("editionCampaignPanel");if(campaignPanel)campaignPanel.hidden=true;
}
function hideAccessPanel(){
 if(accessPanel)accessPanel.hidden=true;
 $("backLink").hidden=false;$("newspaper").hidden=false;document.querySelector(".toolbar").hidden=false;
 const socialHub=$("socialHub");if(socialHub){socialHub.hidden=false;socialHub.style.display="";}
}
async function load(){
 try{
  showAccessPanel("Comprobando autorización…");
  const {data:{session}}=await authClient.auth.getSession();
  if(!session){showAccessPanel("Inicia sesión con tu correo autorizado.");return;}
  const {data,error}=await authClient.functions.invoke("print-edition",{body:{action:"load"},headers:{Authorization:"Bearer "+session.access_token}});
  if(error)throw error;
  if(data&&data.error)throw new Error(data.error);
  articles=data.articles||[];printAdCampaign=data.printAd||null;window.EvofordEditionArticles=articles;document.dispatchEvent(new CustomEvent("edition:articlesloaded",{detail:{articles}}));
  hideAccessPanel();render();renderPrintAd();
 }catch(error){
  showAccessPanel("No se pudo verificar el acceso. Inicia sesión con el correo autorizado o contacta con el administrador.");
  console.warn("Evoford print edition access check failed.");
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
async function loadEditionScript(src){
 const response=await fetch(src,{cache:"no-store",credentials:"same-origin"});
 if(!response.ok)throw new Error("El servidor respondió "+response.status+" al solicitar "+src);
 const contentType=response.headers.get("content-type")||"";
 const source=await response.text();
 if(!/javascript|ecmascript|text\/plain/i.test(contentType)||!source.includes("window.EvoPrintController")){
  throw new Error("La dirección del generador no está entregando JavaScript. Respuesta: "+contentType+" · "+response.url);
 }
 const script=document.createElement("script");
 script.textContent=source;
 document.head.appendChild(script);
 if(!window.EvoPrintController||!window.EvoPrintController.createDocument)throw new Error("El archivo se recibió, pero el controlador no se pudo inicializar. Revisa la consola del navegador.");
}
async function ensurePrintController(){
 if(window.EvoPrintController&&window.EvoPrintController.createDocument)return;
 await loadEditionScript("/news/assets/edition-print-v13.js?v=16");
 if(!window.EvoPrintController||!window.EvoPrintController.createDocument)throw new Error("El generador se descargó, pero no inicializó EvoPrintController. Revisa la publicación de edition-print-v13.js.");
}
async function printEdition(){
 const button=$("printBtn");button.disabled=true;
 const preview=window.open("about:blank","_blank");
 if(!preview){button.disabled=false;alert("El navegador ha bloqueado la vista previa. Permite las ventanas emergentes para esta página y vuelve a intentarlo.");return;}
 try{
  preview.document.write("<!doctype html><title>EVOFORD NEWS · PDF</title><body style='font:16px Arial;padding:32px;color:#142c43'>Preparando el PDF…</body>");
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
  await ensurePrintController();
  if(!window.jspdf||!window.jspdf.jsPDF){
   try{await loadEditionScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");}
   catch(firstError){await loadEditionScript("https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js");}
  }
  if(!window.jspdf||!window.jspdf.jsPDF)throw new Error("No se pudo cargar jsPDF desde los servidores de respaldo.");
  const pdfDoc=await window.EvoPrintController.createDocument();
  if(!pdfDoc)throw new Error("El generador no ha devuelto ningún documento PDF.");
  const pdfUrl=URL.createObjectURL(pdfDoc.output("blob"));
  preview.location.replace(pdfUrl);
 }catch(error){
  if(!preview.closed){preview.document.body.innerHTML="<h2>No se pudo generar el PDF</h2><p>"+String(error.message||error).replace(/[&<>]/g," ")+"</p>";}
  alert(error.message||"No se pudo preparar la edición PDF.");
 }finally{button.disabled=false;}
}
$("printBtn").addEventListener("click",printEdition);
$("languageToggle").addEventListener("click",()=>{language=language==="es"?"en":"es";try{localStorage.setItem("evoford-news-language",language)}catch(e){}applyLanguage();render();});
$("refreshBtn").addEventListener("click",()=>{$("lead").innerHTML='<p class="loading">'+(language==="en"?"Refreshing edition…":"Actualizando edición…")+'</p>';editionLoadPromise=load();});
syncPrintPaper();
applyLanguage();editionLoadPromise=load();
})();