(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s);};
var esc=function(v){return String(v||"").replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});};
var originalDocumentTitle=document.title;
function dateISO(){var d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
function dateES(v){if(!v)return "";var p=v.split("-");return p.length===3?p[2]+"/"+p[1]+"/"+p[0]:v;}
function panel(){
 var root=$("#letterStudio");if(root)return root;
 root=document.createElement("section");root.id="letterStudio";root.className="letter-studio";root.hidden=true;
 root.innerHTML='<div class="letter-studio__head"><div><p class="letter-studio__eyebrow">EVOFORD NEWS · COMUNICACIÓN</p><h2>Carta de presentación</h2><p>Prepara una carta con membrete para presentar el medio a una institución o a una persona.</p></div><button type="button" id="letterClose" class="letter-secondary">Volver a edición impresa</button></div><div class="letter-studio__form"><label for="letterRecipient">Nombre del destinatario</label><input id="letterRecipient" type="text" maxlength="140" autocomplete="name" placeholder="Nombre de la persona o institución"><label for="letterDate">Fecha de la carta</label><input id="letterDate" type="date" value="'+dateISO()+'"><div class="letter-studio__actions"><button type="button" id="letterPreview">Vista previa</button><button type="button" id="letterExport">Exportar carta a PDF</button></div><p class="letter-studio__hint">El PDF se prepara en formato A4. Solo aparecerán el nombre del destinatario y la fecha como datos variables.</p></div><div id="letterPaper" class="letter-paper" aria-label="Vista previa de la carta"></div>';
 var newspaper=$("#newspaper");if(newspaper&&newspaper.parentNode)newspaper.parentNode.insertBefore(root,newspaper);else document.body.appendChild(root);
 $("#letterClose").onclick=close;
 $("#letterPreview").onclick=render;
 $("#letterExport").onclick=function(){if(!render())return;var recipient=$("#letterRecipient").value.trim().replace(/[\\\\/:*?"<>|]+/g," ").replace(/\\s+/g," ").slice(0,70);document.title="Carta - "+recipient+" - EVOFORD NEWS";document.body.classList.add("letter-printing");window.print();};
 $("#letterRecipient").addEventListener("input",render);
 $("#letterDate").addEventListener("change",render);
 return root;
}
function render(){
 var name=$("#letterRecipient").value.trim(),date=$("#letterDate").value;
 if(!name){$("#letterRecipient").focus();$("#letterStatus")&&($("#letterStatus").textContent="Escribe el nombre de la persona o institución.");return false;}
 if(!date){$("#letterDate").focus();return false;}
 var paper=$("#letterPaper");
 paper.innerHTML='<header class="letter-masthead"><div class="letter-location">LONDRES · REINO UNIDO</div><div class="letter-brand">EVOFORD <span>NEWS</span></div><div class="letter-tagline">EL PERIÓDICO GLOBAL · INFORMACIÓN CON CONTEXTO</div><div class="letter-rule"></div></header><div class="letter-date">'+esc(dateES(date))+'</div><div class="letter-recipient"><span>A LA ATENCIÓN DE</span><strong>'+esc(name)+'</strong></div><main class="letter-body"><p>Estimado/a señor/a:</p><p>Nos complace presentarle <strong>EVOFORD NEWS</strong>, un medio digital dedicado a informar sobre la actualidad y los asuntos de interés para la comunidad dominicana, con especial atención al Reino Unido, España, Europa y la República Dominicana.</p><p>Nuestra publicación ofrece contenidos de actualidad, educación, cultura, sociedad, economía, tecnología y temas comunitarios. Nuestro propósito es acercar información útil, explicar los acontecimientos que afectan a nuestros lectores y dar visibilidad a las iniciativas y realidades de la comunidad dominicana dentro y fuera de su país.</p><p>Por medio de esta carta, queremos invitarle a conocer EVOFORD NEWS y a consultar nuestras publicaciones y recursos digitales. Será un placer que pueda conocer el proyecto y tenerlo como referencia informativa.</p><p>Puede acceder al medio a través de nuestra página web:</p><p class="letter-url">https://evoford.com/news/</p><p>Gracias por su atención. Reciba un cordial saludo.</p></main><footer class="letter-signature"><strong>EVOFORD NEWS</strong><span>Medio digital · Reino Unido · España · República Dominicana</span><span>evoford.com/news</span></footer>';
 return true;
}
function open(){
 var root=panel();root.hidden=false;
 var newspaper=$("#newspaper");if(newspaper)newspaper.hidden=true;
 var social=$("#socialHub");if(social)social.hidden=true;
 var campaign=$("#editionCampaignPanel");if(campaign)campaign.hidden=true;
 var dossier=$("#dossierRoot");if(dossier)dossier.classList.remove("is-active");
 document.body.classList.remove("dossier-printing");document.body.classList.add("letter-mode");
 var toolbar=$(".toolbar");if(toolbar)toolbar.hidden=true;
 render();window.scrollTo(0,0);
}
function close(){
 var root=$("#letterStudio");if(root)root.hidden=true;
 document.body.classList.remove("letter-mode","letter-printing");
 var newspaper=$("#newspaper");if(newspaper)newspaper.hidden=false;
 var toolbar=$(".toolbar");if(toolbar)toolbar.hidden=false;
}
function init(){
 var tools=$(".toolbar .tools");if(!tools||$("#letterOpenBtn"))return;
 var b=document.createElement("button");b.type="button";b.id="letterOpenBtn";b.className="secondary-tool";b.textContent="Carta de presentación";b.addEventListener("click",open);tools.appendChild(b);
}
window.addEventListener("afterprint",function(){document.body.classList.remove("letter-printing");document.title=originalDocumentTitle;});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();