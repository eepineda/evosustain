(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s);};
var esc=function(v){return String(v||"").replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});};
var originalDocumentTitle=document.title;
var letterType="institutional";
function dateISO(){var d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
function dateES(v){if(!v)return "";var p=v.split("-");return p.length===3?p[2]+"/"+p[1]+"/"+p[0]:v;}
function panel(){
 var root=$("#letterStudio");if(root)return root;
 root=document.createElement("section");root.id="letterStudio";root.className="letter-studio";root.hidden=true;
 root.innerHTML='<div class="letter-studio__head"><div><p class="letter-studio__eyebrow">EVOFORD NEWS · COMUNICACIÓN</p><h2>Carta de presentación</h2><p>Elige primero el modelo según a quién vas a dirigirte.</p></div><button type="button" id="letterClose" class="letter-secondary">Volver a edición impresa</button></div><div id="letterTypeChooser" class="letter-type-chooser"><button type="button" class="letter-type-card" id="letterInstitutional"><strong>1. Carta institucional</strong><span>Para ministerios, embajadas, ayuntamientos, asociaciones, organismos, empresas e instituciones.</span><em>Presentación formal y propuesta de colaboración institucional.</em></button><button type="button" class="letter-type-card" id="letterPersonal"><strong>2. Carta para particulares</strong><span>Para profesionales, emprendedores, colaboradores, representantes comunitarios y personas particulares.</span><em>Presentación cercana y propuesta de contacto o participación.</em></button></div><div class="letter-studio__form" id="letterForm" hidden><label for="letterRecipient">PARA</label><input id="letterRecipient" type="text" maxlength="140" autocomplete="organization" placeholder="Institución, asociación, empresa o persona destinataria"><label for="letterDate">Fecha</label><input id="letterDate" type="date" value="'+dateISO()+'"><div class="letter-studio__actions"><button type="button" id="letterPreview">Vista previa</button><button type="button" id="letterExport">Exportar carta a PDF</button></div><button type="button" id="letterChangeType" class="letter-secondary">← Cambiar modelo de carta</button><p class="letter-studio__hint">Formato A4 · Una página · Personaliza el destinatario y la fecha.</p></div><div id="letterPaper" class="letter-paper" aria-label="Vista previa de la carta"></div>';
 document.body.appendChild(root);
 $("#letterClose").onclick=close;
 $("#letterInstitutional").onclick=function(){selectType("institutional");};
 $("#letterPersonal").onclick=function(){selectType("personal");};
 $("#letterChangeType").onclick=showChooser;
 $("#letterPreview").onclick=render;
 $("#letterExport").onclick=function(){if(!render())return;var recipient=$("#letterRecipient").value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g,"_").replace(/^_+|_+$/g,"").slice(0,60)||"Destinatario";var date=$("#letterDate").value||dateISO();document.title="Carta_Presentacion_EVOFORD_NEWS_"+recipient+"_"+date;document.body.classList.add("letter-printing");window.print();};
 $("#letterRecipient").addEventListener("input",render);
 $("#letterDate").addEventListener("change",render);
 return root;
}
function render(){
 var name=$("#letterRecipient").value.trim(),date=$("#letterDate").value;
 if(!name){$("#letterRecipient").focus();return false;}
 if(!date){$("#letterDate").focus();return false;}
 var paper=$("#letterPaper");
 var institutional=letterType==="institutional";
 var title=institutional?"CARTA DE PRESENTACIÓN INSTITUCIONAL":"CARTA DE PRESENTACIÓN PERSONAL";
 var greeting=institutional?"Estimados/as señores/as:":"Estimado/a "+esc(name)+":";
 var body=institutional
 ? '<p>Por medio de la presente, tenemos el placer de presentarles <strong>EVOFORD NEWS</strong>, un medio de comunicación digital con sede en Londres, Reino Unido, orientado a informar, conectar y dar visibilidad a acontecimientos, iniciativas y asuntos de interés para el Reino Unido, España, Europa y la República Dominicana.</p><p>Nuestra propuesta editorial comprende actualidad, educación, cultura, sociedad y temas de interés para la comunidad dominicana dentro y fuera del país. Trabajamos para ofrecer información de interés público y crear espacios de participación y difusión que acerquen a las instituciones, organizaciones y ciudadanos.</p><p>Nos gustaría establecer un vínculo de comunicación y colaboración con su institución, facilitando la difusión de actividades, proyectos, programas, iniciativas culturales y acciones de interés para la comunidad dominicana residente en el exterior y para el público en general.</p><p>EVOFORD NEWS también cuenta con espacios de colaboración editorial, publicidad y patrocinio para instituciones y empresas interesadas en dar a conocer sus servicios, actividades y proyectos a través de nuestro medio digital.</p><p>Consideramos que esta presentación puede representar una oportunidad para mantener una relación de colaboración institucional, intercambio de información y difusión de iniciativas de interés común.</p><p>Adjuntamos nuestro dossier corporativo, donde podrán conocer con mayor detalle el proyecto, su enfoque editorial y las posibilidades de colaboración.</p><p>Puede conocer nuestro medio a través de los siguientes canales:</p>'
 : '<p>Nos ponemos en contacto para presentarle <strong>EVOFORD NEWS</strong>, un medio de comunicación digital con sede en Londres, Reino Unido, que informa sobre actualidad, educación, cultura, sociedad y temas de interés para el Reino Unido, España, Europa y la República Dominicana.</p><p>Queremos acercar información útil, conectar a personas y comunidades y dar visibilidad a iniciativas, proyectos, actividades profesionales, culturales y sociales que merecen ser conocidas.</p><p>Nos gustaría invitarle a conocer nuestro medio y mantener un canal de comunicación para compartir iniciativas, experiencias, propuestas o informaciones que puedan resultar de interés para nuestros lectores. También estamos abiertos a colaboraciones y participación en contenidos editoriales, siempre de acuerdo con el enfoque y los criterios de publicación del medio.</p><p>Si desarrolla un proyecto, actividad profesional, iniciativa comunitaria o propuesta cultural, puede ponerse en contacto con nosotros para valorar posibles formas de difusión y colaboración.</p><p>Puede conocer EVOFORD NEWS y seguir nuestras publicaciones a través de los siguientes canales:</p>';
 var closing=institutional?"Agradecemos su atención y esperamos tener la oportunidad de establecer una relación de comunicación y colaboración con su institución.":"Gracias por su tiempo y por considerar esta presentación. Será un placer conocer sus iniciativas y explorar posibles vías de comunicación o colaboración.";
 paper.innerHTML='<header class="letter-masthead"><div class="letter-topline"><span>LONDRES · REINO UNIDO</span><span>MEDIO DE COMUNICACIÓN DIGITAL</span></div><div class="letter-brand">EVOFORD <span>NEWS</span></div><div class="letter-tagline">INFORMACIÓN · OPINIÓN · ANÁLISIS</div><div class="letter-rule"></div><h1 class="letter-document-title">'+title+'</h1></header><div class="letter-date">'+esc(dateES(date))+'</div><div class="letter-recipient"><span>PARA:</span><strong>'+esc(name)+'</strong></div><main class="letter-body"><p><strong>'+greeting+'</strong></p>'+body+'<p class="letter-url">https://evoford.com/news/</p><p class="letter-social-intro">También puede encontrarnos en redes sociales:</p><p class="letter-social"><a href="https://www.facebook.com/evofordnews" target="_blank" rel="noopener noreferrer"><svg class="letter-social-icon letter-facebook" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.4 21v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.5 1.6-1.5h1.7V3.2c-.3 0-1.3-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.3v2.4H7.2v3.2H10V21z"/></svg><span>Facebook<br>@evofordnews</span></a><a href="https://www.instagram.com/evofordnews/" target="_blank" rel="noopener noreferrer"><svg class="letter-social-icon letter-instagram" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.6" cy="6.7" r="1.2" fill="currentColor"/></svg><span>Instagram<br>@evofordnews</span></a></p><p>'+closing+'</p><p>Reciba un cordial saludo.</p></main><footer class="letter-signature"><strong>EVOFORD NEWS</strong><span>Medio de comunicación digital · Londres · Reino Unido</span><span class="letter-contact"><a href="mailto:info@evoford.com">info@evoford.com</a><span>·</span><a href="tel:+447871710697">+44 7871 710697</a></span><span>Información que conecta. Comunidades que se acercan.</span></footer>';
 return true;
}
function selectType(type){letterType=type;$("#letterTypeChooser").hidden=true;$("#letterForm").hidden=false;$("#letterRecipient").placeholder=type==="institutional"?"Nombre de la institución, organismo o empresa":"Nombre y apellidos de la persona destinataria";$("#letterRecipient").setAttribute("autocomplete",type==="institutional"?"organization":"name");render();}
function showChooser(){$("#letterTypeChooser").hidden=false;$("#letterForm").hidden=true;$("#letterPaper").innerHTML="";}
function open(){
 var root=panel();root.hidden=false;showChooser();
 var newspaper=$("#newspaper");if(newspaper)newspaper.hidden=true;
 var social=$("#socialHub");if(social)social.hidden=true;
 var campaign=$("#editionCampaignPanel");if(campaign)campaign.hidden=true;
 var dossier=$("#dossierRoot");if(dossier)dossier.classList.remove("is-active");
 document.body.classList.remove("dossier-printing");document.body.classList.add("letter-mode");
 var toolbar=$(".toolbar");if(toolbar)toolbar.hidden=true;
 window.scrollTo(0,0);
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