(function(){
"use strict";
const URL="https://poywsdigujbarvnzbfnz.supabase.co";
const KEY="sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f";
const $=id=>document.getElementById(id);let language="es",articles=[];
const ui={
es:{back:"← Volver a Evoford News",format:"Formato",a4:"A4 · Estándar",a3:"A3 · Periódico",refresh:"Actualizar edición",print:"Imprimir / Guardar PDF",other:"English",date:"EDICIÓN DEL",sections:"INTERNACIONAL · ECONOMÍA · SOCIEDAD · TECNOLOGÍA · OPINIÓN",otherNews:"OTRAS NOTICIAS",paperFooter:"Edición digital preparada para impresión",empty:"Todavía no hay artículos publicados para esta edición.",noMore:"No hay más noticias en esta edición.",stories:"noticias",by:"POR"},
en:{back:"← Back to Evoford News",format:"Paper size",a4:"A4 · Standard",a3:"A3 · Newspaper",refresh:"Refresh edition",print:"Print / Save PDF",other:"Español",date:"EDITION OF",sections:"INTERNATIONAL · ECONOMY · SOCIETY · TECHNOLOGY · OPINION",otherNews:"MORE STORIES",paperFooter:"Digital edition prepared for print",empty:"There are no published articles in this edition yet.",noMore:"There are no more stories in this edition.",stories:"stories",by:"BY"}};
const esc=v=>String(v||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pick=(a,es,en)=>language==="en"?(a[en]||a[es]||""):(a[es]||a.title||"");
const url=a=>"articles/plantilla-articulo.html?slug="+encodeURIComponent(a.slug||"");
const category=a=>esc(a.category||"ACTUALIDAD");
function applyLanguage(){
 const t=ui[language];
 $("backLink").textContent=t.back;$("formatLabel").textContent=t.format;
 $("paperSize").options[0].textContent=t.a4;$("paperSize").options[1].textContent=t.a3;
 $("refreshBtn").textContent=t.refresh;$("printBtn").textContent=t.print;
 $("languageToggle").textContent=t.other;$("languageToggle").setAttribute("aria-label",t.other);
 document.querySelector(".paper-sections").textContent=t.sections;
 document.querySelector(".section-label span:first-child").textContent=t.otherNews;
 document.querySelector(".paper-footer span:nth-child(2)").textContent=t.paperFooter;
 $("editionDate").textContent=t.date+" "+new Date().toLocaleDateString(language==="en"?"en-GB":"es-ES",{day:"numeric",month:"long",year:"numeric"}).toUpperCase();
 document.documentElement.lang=language;
}
function render(){
 const lead=articles[0];
 if(!lead){$("lead").innerHTML='<p class="empty">'+ui[language].empty+'</p>';$("storyGrid").innerHTML="";$("storyCount").textContent="0 "+ui[language].stories;return;}
 const title=pick(lead,"title","title_en"),summary=pick(lead,"summary","summary_en");
 $("lead").innerHTML='<div class="lead-grid"><div><div class="category">'+category(lead)+'</div><h1>'+esc(title)+'</h1><p class="summary">'+esc(summary)+'</p><div class="byline">'+ui[language].by+' '+esc(lead.author||"Evoford News")+' · '+esc(lead.country||"Evoford News")+'</div></div><div>'+(lead.image_url&&/^https:\/\//i.test(lead.image_url)?'<img src="'+esc(lead.image_url)+'" alt="'+esc(title)+'">':'<div class="lead-placeholder">EVOFORD NEWS</div>')+'</div></div>';
 const rest=articles.slice(1,13);
 $("storyGrid").innerHTML=rest.map(a=>'<article class="story">'+(a.image_url&&/^https:\/\//i.test(a.image_url)?'<img loading="lazy" src="'+esc(a.image_url)+'" alt="'+esc(pick(a,"title","title_en"))+'">':'')+'<div class="category">'+category(a)+'</div><h2><a href="'+url(a)+'">'+esc(pick(a,"title","title_en"))+'</a></h2><p>'+esc(pick(a,"summary","summary_en"))+'</p><div class="byline">'+esc(a.author||"Evoford News")+'</div></article>').join("")||'<p class="empty">'+ui[language].noMore+'</p>';
 $("storyCount").textContent=articles.length+" "+ui[language].stories;
}
async function load(){
 try{
 const client=window.supabase.createClient(URL,KEY);
 const result=await client.from("articles").select("title,title_en,slug,category,author,summary,summary_en,image_url,created_at,updated_at,country,content,content_en").eq("status","published").order("updated_at",{ascending:false}).limit(40);
 if(result.error)throw result.error;articles=result.data||[];render();
 }catch(error){$("lead").innerHTML='<p class="empty">No se pudo cargar la edición. '+esc(error.message||"Comprueba la conexión.")+'</p>';console.error("Evoford print edition:",error);}
}
$("printBtn").addEventListener("click",()=>window.print());
$("languageToggle").addEventListener("click",()=>{language=language==="es"?"en":"es";applyLanguage();render();});
$("refreshBtn").addEventListener("click",()=>{$("lead").innerHTML='<p class="loading">'+(language==="en"?"Refreshing edition…":"Actualizando edición…")+'</p>';load();});
$("paperSize").addEventListener("change",e=>{const rule=document.getElementById("dynamicPageSize")||document.head.appendChild(document.createElement("style"));rule.id="dynamicPageSize";rule.textContent="@page{size:"+e.target.value+" portrait;margin:12mm}";});
applyLanguage();load();
})();