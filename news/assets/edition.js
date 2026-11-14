(function(){
"use strict";
const URL="https://poywsdigujbarvnzbfnz.supabase.co";
const KEY="sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f";
const $=id=>document.getElementById(id);let language=localStorage.getItem("evoford-news-language")==="en"?"en":"es",articles=[];
const ui={
es:{back:"← Volver a Evoford News",format:"Formato",a4:"A4 · Estándar",a3:"A3 · Periódico",refresh:"Actualizar edición",print:"Imprimir / Guardar PDF",other:"English",date:"EDICIÓN DEL",descriptor:"INFORMACIÓN · OPINIÓN · ANÁLISIS",kicker:"EL PERIÓDICO GLOBAL · INFORMACIÓN CON CONTEXTO",motto:"Noticias para entender el mundo",sections:"INTERNACIONAL · ECONOMÍA · SOCIEDAD · TECNOLOGÍA · OPINIÓN",otherNews:"OTRAS NOTICIAS",paperFooter:"Edición digital preparada para impresión",empty:"Todavía no hay artículos publicados para esta edición.",noMore:"No hay más noticias en esta edición.",stories:"noticias",by:"POR"},
en:{back:"← Back to Evoford News",format:"Paper size",a4:"A4 · Standard",a3:"A3 · Newspaper",refresh:"Refresh edition",print:"Print / Save PDF",other:"Español",date:"EDITION OF",descriptor:"INFORMATION · OPINION · ANALYSIS",kicker:"THE GLOBAL NEWSPAPER · INFORMATION WITH CONTEXT",motto:"News to understand the world",sections:"INTERNATIONAL · ECONOMY · SOCIETY · TECHNOLOGY · OPINION",otherNews:"MORE STORIES",paperFooter:"Digital edition prepared for print",empty:"There are no published articles in this edition yet.",noMore:"There are no more stories in this edition.",stories:"stories",by:"BY"}};
const esc=v=>String(v||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pick=(a,es,en)=>language==="en"?(a[en]||a[es]||""):(a[es]||a.title||"");
const url=a=>"articles/plantilla-articulo.html?slug="+encodeURIComponent(a.slug||"");
const category=a=>{const value=a.category||"ACTUALIDAD";const labels={Internacional:"International",Política:"Politics",Economía:"Economy",Seguridad:"Security",Tecnología:"Technology",Startups:"Startups",Innovación:"Innovation",Opinión:"Opinion",Sociedad:"Society"};return esc(language==="en"?(labels[value]||value):value);};
function applyLanguage(){
 const t=ui[language];
 $("backLink").textContent=t.back;$("formatLabel").textContent=t.format;
 $("paperSize").options[0].textContent=t.a4;$("paperSize").options[1].textContent=t.a3;
 $("refreshBtn").textContent=t.refresh;$("printBtn").textContent=t.print;
 $("languageToggle").textContent=t.other;$("languageToggle").setAttribute("aria-label",t.other);
 document.querySelector(".paper-topline span:nth-child(2)").textContent=t.descriptor;
 document.querySelector(".paper-kicker").textContent=t.kicker;
 document.querySelector(".paper-motto").textContent=t.motto;
 document.querySelector(".paper-sections").textContent=t.sections;
 document.querySelector(".section-label span:first-child").textContent=t.otherNews;
 document.querySelector(".paper-footer span:nth-child(2)").textContent=t.paperFooter;
 $("editionDate").textContent=t.date+" "+new Date().toLocaleDateString(language==="en"?"en-GB":"es-ES",{day:"numeric",month:"long",year:"numeric"}).toUpperCase();
 document.documentElement.lang=language;
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
async function load(){
 try{
 $("lead").innerHTML='<p class="loading">Conectando con la base de datos…</p>';
 const client=window.supabase.createClient(URL,KEY);
 const request=client.from("articles").select("title,title_en,title_es,slug,category,author,summary,summary_en,summary_es,image_url,created_at,updated_at,country,content,content_es,content_en").eq("status","published").order("updated_at",{ascending:false}).limit(40);
 const result=await Promise.race([request,new Promise((_,reject)=>setTimeout(()=>reject(new Error("La conexión con Supabase no respondió en 12 segundos.")),12000))]);
 if(result.error)throw result.error;articles=result.data||[];render();
 }catch(error){$("lead").innerHTML='<p class="empty">No se pudo cargar la edición. '+esc(error.message||"Comprueba la conexión.")+'</p>';console.error("Evoford print edition:",error);}
}
$("printBtn").addEventListener("click",()=>{if(window.EvoPrintController)window.EvoPrintController.print();else window.print();});
$("languageToggle").addEventListener("click",()=>{language=language==="es"?"en":"es";try{localStorage.setItem("evoford-news-language",language)}catch(e){}applyLanguage();render();});
$("refreshBtn").addEventListener("click",()=>{$("lead").innerHTML='<p class="loading">'+(language==="en"?"Refreshing edition…":"Actualizando edición…")+'</p>';load();});
if(window.EvoPrintController)window.EvoPrintController.setSize();
applyLanguage();load();
})();