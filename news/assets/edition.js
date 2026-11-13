(function(){
"use strict";
const URL="https://poywsdigujbarvnzbfnz.supabase.co";
const KEY="sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f";
const $=id=>document.getElementById(id);let language="es",articles=[];
const esc=v=>String(v||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pick=(a,es,en)=>language==="en"?(a[en]||a[es]||""):(a[es]||a.title||"");
const url=a=>"articles/plantilla-articulo.html?slug="+encodeURIComponent(a.slug||"");
const category=a=>esc(a.category||"ACTUALIDAD");
function render(){
 const lead=articles[0];
 if(!lead){$("lead").innerHTML='<p class="empty">Todavía no hay artículos publicados para esta edición.</p>';$("storyGrid").innerHTML="";$("storyCount").textContent="0 noticias";return;}
 const title=pick(lead,"title","title_en"),summary=pick(lead,"summary","summary_en");
 $("lead").innerHTML='<div class="lead-grid"><div><div class="category">'+category(lead)+'</div><h1>'+esc(title)+'</h1><p class="summary">'+esc(summary)+'</p><div class="byline">'+(language==="en"?"BY ":"POR ")+esc(lead.author||"Evoford News")+' · '+esc(lead.country||"Evoford News")+'</div></div><div>'+(lead.image_url&&/^https:\/\//i.test(lead.image_url)?'<img src="'+esc(lead.image_url)+'" alt="'+esc(title)+'">':'<div class="lead-placeholder">EVOFORD NEWS</div>')+'</div></div>';
 const rest=articles.slice(1,13);
 $("storyGrid").innerHTML=rest.map(a=>'<article class="story">'+(a.image_url&&/^https:\/\//i.test(a.image_url)?'<img loading="lazy" src="'+esc(a.image_url)+'" alt="'+esc(pick(a,"title","title_en"))+'">':'')+'<div class="category">'+category(a)+'</div><h2><a href="'+url(a)+'">'+esc(pick(a,"title","title_en"))+'</a></h2><p>'+esc(pick(a,"summary","summary_en"))+'</p><div class="byline">'+esc(a.author||"Evoford News")+'</div></article>').join("")||'<p class="empty">No hay más noticias en esta edición.</p>';
 $("storyCount").textContent=articles.length+" "+(language==="en"?"stories":"noticias");
 document.documentElement.lang=language;
}
async function load(){
 try{
 const client=window.supabase.createClient(URL,KEY);
 let result=await client.from("articles").select("title,title_en,slug,category,author,summary,summary_en,image_url,created_at,updated_at,country,content,content_en").eq("status","published").order("updated_at",{ascending:false}).limit(40);
 if(result.error)throw result.error;
 articles=result.data||[];render();
 }catch(error){$("lead").innerHTML='<p class="empty">No se pudo cargar la edición. '+esc(error.message||"Comprueba la conexión.")+'</p>';console.error("Evoford print edition:",error);}
}
$("printBtn").addEventListener("click",()=>window.print());
$("languageToggle").addEventListener("click",()=>{language=language==="es"?"en":"es";$("languageToggle").textContent=language==="es"?"English":"Español";render();});
$("paperSize").addEventListener("change",e=>{const size=e.target.value;document.documentElement.style.setProperty("--print-size",size);let rule=document.getElementById("dynamicPageSize");if(!rule){rule=document.createElement("style");rule.id="dynamicPageSize";document.head.appendChild(rule);}rule.textContent="@page{size:"+size+" portrait;margin:12mm}";});
$("editionDate").textContent=new Date().toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric"}).toUpperCase();
load();
})();