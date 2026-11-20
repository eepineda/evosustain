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
 root.innerHTML='<div class="letter-studio__head"><div><p class="letter-studio__eyebrow">EVOFORD NEWS · COMUNICACIÓN</p><h2>Carta de presentación</h2><p>Presentación institucional de EVOFORD NEWS. Personaliza el destinatario y la fecha antes de imprimir o guardar en PDF.</p></div><button type="button" id="letterClose" class="letter-secondary">Volver a edición impresa</button></div><div class="letter-studio__form"><label for="letterRecipient">PARA</label><input id="letterRecipient" type="text" maxlength="140" autocomplete="organization" placeholder="Nombre de la institución o persona destinataria"><label for="letterDate">Fecha</label><input id="letterDate" type="date" value="'+dateISO()+'"><div class="letter-studio__actions"><button type="button" id="letterPreview">Vista previa</button><button type="button" id="letterExport">Exportar carta a PDF</button></div><p class="letter-studio__hint">Formato A4 · Una página · Solo el destinatario y la fecha son editables.</p></div><div id="letterPaper" class="letter-paper" aria-label="Vista previa de la carta"></div>';
 document.body.appendChild(root);
 $("#letterClose").onclick=close;
 $("#letterPreview").onclick=render;
 $("#letterExport").onclick=function(){if(!render())return;var recipient=$("#letterRecipient").value.trim().replace(/[\\/:*?"<>|]+/g," ").replace(/\\s+/g," ").slice(0,70);document.title="Carta - "+recipient+" - EVOFORD NEWS";document.body.classList.add("letter-printing");window.print();};
 $("#letterRecipient").addEventListener("input",render);
 $("#letterDate").addEventListener("change",render);
 return root;
}
function render(){
 var name=$("#letterRecipient").value.trim(),date=$("#letterDate").value;
 if(!name){$("#letterRecipient").focus();return false;}
 if(!date){$("#letterDate").focus();return false;}
 var paper=$("#letterPaper");
 paper.innerHTML='<header class="letter-masthead"><div class="letter-topline"><span>LONDRES · REINO UNIDO</span><span>MEDIO DE COMUNICACIÓN DIGITAL</span></div><div class="letter-brand">EVOFORD <span>NEWS</span></div><div class="letter-tagline">INFORMACIÓN · OPINIÓN · ANÁLISIS</div><div class="letter-rule"></div><h1 class="letter-document-title">CARTA DE PRESENTACIÓN INSTITUCIONAL</h1></header><div class="letter-date">'+esc(dateES(date))+'</div><div class="letter-recipient"><span>PARA:</span><strong>'+esc(name)+'</strong></div><main class="letter-body"><p>Tenemos el placer de presentarles <strong>EVOFORD NEWS</strong>, un nuevo medio de comunicación digital nacido en Londres, Reino Unido, con vocación internacional y el propósito de conectar informativamente a Reino Unido, España, Europa y República Dominicana.</p><p>EVOFORD NEWS nace como un espacio de información, encuentro y participación, dirigido a lectores, instituciones, asociaciones, profesionales, empresas y comunidades. Queremos acercar realidades, dar visibilidad a iniciativas y ofrecer contenidos de interés para quienes viven en estos territorios y mantienen vínculos entre ellos.</p><p>Nuestro medio reúne distintas áreas y oportunidades de participación:</p><ul><li><strong>Actualidad e información:</strong> noticias, reportajes y análisis sobre política, sociedad, economía, educación, cultura y tecnología.</li><li><strong>Tu República:</strong> un espacio para descubrir, conocer y compartir la historia, la cultura y el patrimonio de la República Dominicana. Está dirigido a todos los dominicanos, dentro y fuera del país, para recordar nuestras raíces, valorar lo que nos identifica como nación y transmitir a las nuevas generaciones nuestro legado histórico y cultural.</li><li><strong>Directorio de Servicios para Dominicanos en el Exterior:</strong> información de embajadas, consulados, instituciones, asociaciones y servicios de interés.</li><li><strong>Colaboradores y opinión:</strong> participación de periodistas, profesionales, especialistas y personas que deseen compartir conocimientos y experiencias.</li><li><strong>Empresas, publicidad y patrocinio:</strong> espacios de visibilidad y colaboración para empresas, marcas, profesionales y organizaciones.</li><li><strong>Participación y comunidad:</strong> difusión de actividades, iniciativas culturales, proyectos sociales y propuestas de interés comunitario.</li><li><strong>EVOFORD NEWS App:</strong> acceso a publicaciones y contenidos del medio desde dispositivos móviles.</li></ul><p>Nos gustaría invitarles a conocer EVOFORD NEWS, explorar sus contenidos y valorar posibles vías de colaboración o participación. Consideramos que el intercambio de información y la cooperación entre instituciones, organizaciones y medios contribuyen a fortalecer los vínculos entre nuestras comunidades.</p><p>Pueden visitar nuestro medio a través de la siguiente dirección:</p><p class="letter-url">https://evoford.com/news/</p><p class="letter-social-intro">También puedes encontrarnos en redes sociales. Síguenos en:</p><p class="letter-social"><a href="https://www.facebook.com/evofordnews" target="_blank" rel="noopener noreferrer"><svg class="letter-social-icon letter-facebook" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.4 21v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.5 1.6-1.5h1.7V3.2c-.3 0-1.3-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.3v2.4H7.2v3.2H10V21z"/></svg><span>Facebook<br>@evofordnews</span></a><a href="https://www.instagram.com/evofordnews/" target="_blank" rel="noopener noreferrer"><svg class="letter-social-icon letter-instagram" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.6" cy="6.7" r="1.2" fill="currentColor"/></svg><span>Instagram<br>@evofordnews</span></a></p><p>Gracias por su atención. Reciban un cordial saludo.</p></main><footer class="letter-signature"><strong>EVOFORD NEWS</strong><span>Medio de comunicación digital · Londres · Reino Unido</span><span>Información que conecta. Comunidades que se acercan.</span></footer>';
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