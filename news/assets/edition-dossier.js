(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s);};
var esc=function(v){return String(v||"").replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});};
function textOf(v){var box=document.createElement("div");box.innerHTML=String(v||"");return (box.textContent||box.innerText||"").replace(/\s+/g," ").trim();}
function articleBody(a){return textOf(a.content_es||a.content||a.body||a.summary_es||a.summary||"");}
function articleExcerpt(a,limit){var full=articleBody(a);if(full.length<=limit)return esc(full);var cut=full.slice(0,limit);var sentence=Math.max(cut.lastIndexOf(". "),cut.lastIndexOf("! "),cut.lastIndexOf("? "));if(sentence>Math.floor(limit*.55))cut=cut.slice(0,sentence+1);else{var word=cut.lastIndexOf(" ");if(word>0)cut=cut.slice(0,word);}return esc(cut.trim())+"…";}
function articleTitle(a){return a.title_es||a.title||a.title_en||"Actualidad EVOFORD NEWS";}
function articleSummary(a){return a.summary_es||a.summary||a.summary_en||"";}
function footer(n){return '<div class="dossier-footer"><span>EVOFORD NEWS · EDICIÓN INSTITUCIONAL</span><span>'+String(n).padStart(2,"0")+' / 12</span></div>';}
function header(){var date=new Date().toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric"}).toUpperCase();return '<div class="dossier-top"><span>'+esc(date)+'</span><span>EVOFORD NEWS · DOSSIER INSTITUCIONAL</span></div><div class="dossier-brand">EVOFORD NEWS</div><div class="dossier-tagline">Noticias para entender el mundo</div><div class="dossier-rule"></div><div class="dossier-sections">INTERNACIONAL · ECONOMÍA · SOCIEDAD · TECNOLOGÍA · OPINIÓN</div>';}
function page(n,k,title,deck,body){return '<section class="dossier-page">'+header()+'<div class="dossier-content"><div class="dossier-kicker">'+k+'</div><h1>'+title+'</h1>'+(deck?'<p class="dossier-deck">'+deck+'</p>':'')+body+'</div>'+footer(n)+'</section>';}
function build(){
 var rawArticles=Array.isArray(window.EvofordEditionArticles)?window.EvofordEditionArticles:[];
 var seenArticles=new Set();
 var articles=rawArticles.filter(function(a){var key=String(a.title_es||a.title||a.title_en||a.slug||a.id||"").toLocaleLowerCase("es").replace(/\s+/g," ").trim();if(!key||seenArticles.has(key))return false;seenArticles.add(key);return true;});
 if(!articles.length)throw new Error("La edición todavía no ha cargado artículos. Actualiza la edición e inténtalo de nuevo.");
 var listings=Array.isArray(window.EvofordDirectoryListings)?window.EvofordDirectoryListings:[];
 var pages=[];
 pages.push('<section class="dossier-page dossier-cover"><div class="dossier-top"><span>EDICIÓN ESPECIAL · '+new Date().getFullYear()+'</span><span>REINO UNIDO · ESPAÑA · REPÚBLICA DOMINICANA</span></div><div class="dossier-brand">EVOFORD NEWS</div><div class="dossier-tagline" style="color:#e4eaf0">El periódico global · Información con contexto</div><div class="dossier-rule"></div><h1>INFORMAR.<br> CONECTAR.<br> DAR VISIBILIDAD.</h1><p class="dossier-deck">Presentación institucional del medio digital y de sus herramientas para la comunidad dominicana en Europa y República Dominicana.</p><div class="dossier-cover-meta"><strong>DOSSIER INSTITUCIONAL</strong>ACTUALIDAD · EDUCACIÓN · CULTURA · SOCIEDAD · SERVICIOS</div>'+footer(1)+'</section>');
 pages.push(page(2,"01 / PRESENTACIÓN","Un medio digital con vocación de servicio","Información con contexto para una comunidad que vive entre territorios.",'<p>EVOFORD NEWS es un medio digital con atención especial al Reino Unido y España, sin perder de vista la actualidad dominicana y los temas europeos que afectan a quienes viven entre ambos lados del Atlántico.</p><p>Su propuesta editorial combina actualidad, educación, cultura, sociedad, tecnología, opinión y contenidos prácticos. El objetivo es ofrecer información comprensible y relevante y dar visibilidad a iniciativas que interesan a la comunidad dominicana.</p><div class="dossier-card"><p><strong>MISIÓN</strong><br>Ofrecer información útil y contextualizada, conectar personas e instituciones y contribuir a que la comunidad dominicana tenga acceso a contenidos de interés.</p></div><h2>Una plataforma editorial en evolución</h2><p>El proyecto se acompaña de herramientas digitales para facilitar el acceso a noticias, recursos y referencias institucionales y comunitarias.</p>'));
 pages.push(page(3,"02 / COBERTURA","Una comunidad, varios territorios","La experiencia de la diáspora conecta ciudades, familias, instituciones y oportunidades.",'<div class="dossier-grid"><article><h3>Reino Unido</h3><p>Actualidad, vida comunitaria, educación, servicios y relaciones bilaterales para los dominicanos residentes en el Reino Unido.</p></article><article><h3>España</h3><p>Información de interés para la comunidad dominicana, sus asociaciones, instituciones y actividades locales.</p></article><article><h3>República Dominicana</h3><p>Actualidad nacional, cultura, economía y asuntos públicos para mantener el vínculo con el país de origen.</p></article><article><h3>Europa</h3><p>Información europea cuando las decisiones, tendencias y acontecimientos afectan a la vida de la diáspora.</p></article></div><h2>Áreas editoriales</h2><p>Internacional · Economía · Sociedad · Tecnología · Educación · Cultura · Opinión · Servicios comunitarios.</p>'));
 var lead=articles[0];
 function articlePage(n,a,label){var title=esc(articleTitle(a)),summary=esc(articleSummary(a)),body=articleBody(a),img=a.image_url&&/^https:\/\//i.test(a.image_url)?'<img class="dossier-article-image" src="'+esc(a.image_url)+'" alt="'+title+'">':"";var copy=articleExcerpt(a,620);return page(n,label,title,summary,img+'<p class="dossier-article-copy">'+(copy||summary)+'</p><div class="dossier-card"><p>Contenido seleccionado de la edición impresa de EVOFORD NEWS. Consulte la publicación original para ampliar la información y comprobar las actualizaciones.</p></div>');}
 pages.push(articlePage(4,lead,"03 / ACTUALIDAD DESTACADA"));
 for(var i=1;i<Math.min(5,articles.length);i++){pages.push(articlePage(4+i,articles[i],"0"+(3+i)+" / SELECCIÓN EDITORIAL"));}
 if(articles.length<5){var remaining=5-articles.length;for(var j=0;j<remaining;j++){var label="0"+(3+articles.length+j)+" / PANORAMA EDITORIAL";var available=articles.map(function(a){return "<li><strong>"+esc(articleTitle(a))+"</strong> · "+esc(a.category||"Actualidad")+"</li>";}).join("");pages.push(page(4+articles.length+j,label,"Temas presentes en la edición","Selección basada en las noticias publicadas y disponibles al preparar este dossier.",'<ul class="dossier-list">'+available+'</ul><p>Este espacio no sustituye una noticia adicional: presenta el conjunto de contenidos que la redacción tiene cargado en esta edición.</p>'));}}
 pages.push(page(9,"08 / ECOSISTEMA DIGITAL","Más allá de las noticias","Herramientas para acercar información y recursos a la comunidad.",'<h2>EVOFORD NEWS APP</h2><p><strong>EVOFORD NEWS cuenta con una aplicación operativa.</strong> La comunidad puede acceder desde su dispositivo móvil a las publicaciones y contenidos del medio a través de la app.</p><h2>TU REPÚBLICA</h2><p>Un espacio para mantener el vínculo con República Dominicana desde el exterior, con contenidos organizados en cuatro líneas:</p><ul class="dossier-list"><li><strong>Historia:</strong> memoria, patrimonio y acontecimientos que ayudan a comprender el país.</li><li><strong>Cultura:</strong> expresiones culturales, tradiciones, arte y vida comunitaria.</li><li><strong>Actualidad:</strong> información sobre los asuntos nacionales que interesan a la diáspora.</li><li><strong>Diáspora:</strong> historias, iniciativas y vínculos de los dominicanos que viven fuera del país.</li></ul><h2>DIRECTORIO EVOFORD</h2><p>Una herramienta de consulta de instituciones, embajadas, consulados, asociaciones, organizaciones y servicios profesionales de interés para la comunidad dominicana.</p>'));
 var directorySeen=new Set();
 var directoryItems=listings.filter(function(x){var key=String(x.name||"").toLocaleLowerCase("es").replace(/\s+/g," ").trim();if(!key||directorySeen.has(key))return false;directorySeen.add(key);return true;});
 var verifiedCount=directoryItems.filter(function(x){return !!x.verified_at;}).length;
 var directoryCards=directoryItems.slice(0,10).map(function(x){var detail=[x.category,x.city].filter(Boolean).map(esc).join(" · ");var link=x.website&&/^https:\/\//i.test(x.website)?'<a class="dossier-directory-link" href="'+esc(x.website)+'" target="_blank" rel="noopener noreferrer">Consultar información <span aria-hidden="true">↗</span></a>':"";return '<article class="dossier-directory-card"><div class="dossier-directory-card-top"><span>DIRECTORIO EVOFORD</span>'+(x.verified_at?'<em>Ficha revisada</em>':'<em>Ficha publicada</em>')+'</div><h3>'+esc(x.name)+'</h3>'+(detail?'<p class="dossier-directory-meta">'+detail+'</p>':"")+link+'</article>';}).join("");
 var officialInstitutions='<h2>Representación de la República Dominicana en Europa</h2><div class="dossier-grid"><article><h3>REINO UNIDO · LONDRES</h3><p><strong>Embajada de la República Dominicana ante el Reino Unido</strong><br>81 Cromwell Road, London, Reino Unido<br>Tel. +44 20 7262 6856<br><a href="mailto:embadomgranbretana@mirex.gob.do">embadomgranbretana@mirex.gob.do</a><br><a href="https://gbr.mirex.gob.do/">Portal oficial y sección consular</a></p><p>Servicios: pasaportes, visados, legalizaciones, certificaciones, poderes notariales, registros y otros trámites consulares.</p></article><article><h3>ESPAÑA · MADRID</h3><p><strong>Embajada de la República Dominicana en España</strong><br>Paseo de la Castellana 30, 1.º derecha, 28046 Madrid<br>Tel. +34 91 431 5395<br><a href="https://esp.mirex.gob.do/">Portal oficial de la Embajada</a></p><p><strong>Consulado General en Madrid</strong><br>Paseo de la Castellana 128, 1.º, 28046 Madrid<br>Tel. +34 91 431 5321<br><a href="mailto:conmadrid@mirex.gob.do">conmadrid@mirex.gob.do</a></p></article><article><h3>ESPAÑA · BARCELONA</h3><p><strong>Consulado General de la República Dominicana</strong><br>Carrer París 211, 7.º piso, 08008 Barcelona<br>Tel. +34 93 237 9213<br><a href="mailto:conbarcelona@mirex.gob.do">conbarcelona@mirex.gob.do</a><br><a href="https://esp.mirex.gob.do/consulados/">Directorio consular oficial</a></p></article><article><h3>OTROS SERVICIOS CONSULARES EN ESPAÑA</h3><p>El directorio oficial de la Embajada incluye oficinas consulares en Santa Cruz de Tenerife, Sevilla y Valencia, además de otras representaciones honorarias. Comprueba la demarcación que corresponde a tu lugar de residencia antes de iniciar un trámite.</p><a href="https://esp.mirex.gob.do/consulados/">Consultar oficinas y demarcaciones</a></article></div><div class="dossier-card"><p><strong>Antes de acudir</strong><br>Confirma horarios, requisitos, citas, tarifas y demarcación consular en los portales oficiales. Los datos de contacto pueden cambiar.</p></div>';
 var directoryBody=directoryItems.length?'<p>La aplicación consulta las fichas publicadas del Directorio EVOFORD. En esta preparación se han encontrado <strong>'+directoryItems.length+'</strong> entidades o servicios distintos, tras agrupar nombres repetidos; '+verifiedCount+' fichas tienen fecha de revisión registrada.</p><h2>Selección del directorio</h2><div class="dossier-directory-grid">'+directoryCards+'</div><p class="dossier-note">La fecha de revisión registrada en la base de datos no garantiza que todos los datos de contacto sigan vigentes. Confirma cada información directamente con la entidad.</p>':'<p>El directorio no ha podido cargarse en esta preparación. '+esc(window.EvofordDirectoryLoadError||"Consulta la versión actualizada en EVOFORD NEWS.")+'</p>';
 directoryBody+='<div class="dossier-card"><p><strong>Nota de uso</strong><br>La inclusión de una entidad no implica respaldo, certificación ni recomendación por parte de EVOFORD NEWS. El usuario debe confirmar directamente con cada institución la vigencia de sus datos y servicios.</p></div>';
 pages.push(page(10,"09 / REPRESENTACIÓN OFICIAL","Embajadas y consulados dominicanos","Información consular para la comunidad en Europa.",officialInstitutions));
 pages.push(page(11,"10 / DIRECTORIO","Instituciones y servicios de interés","Entidades, asociaciones y servicios publicados en el Directorio EVOFORD.",directoryBody));
 pages.push(page(12,"10 / CONTACTO","Construyamos una vía de comunicación","EVOFORD NEWS · Reino Unido · España · República Dominicana",'<h2>Colaboración institucional</h2><p>EVOFORD NEWS está abierto a establecer vías de comunicación con los departamentos responsables de comunicación y atención a la comunidad para recibir información institucional verificable.</p><ul class="dossier-list"><li>Comunicados y avisos oficiales.</li><li>Jornadas y actividades consulares.</li><li>Campañas informativas y programas de asistencia.</li><li>Actividades culturales, educativas y comunitarias.</li><li>Información sobre servicios, trámites y orientación ciudadana.</li></ul><div class="dossier-card"><p><strong>Principio editorial</strong><br>La recepción de información no garantiza su publicación. Los contenidos se valoran según su interés público, verificación y espacio editorial disponible. EVOFORD NEWS es un medio independiente y no representa oficialmente a las instituciones.</p></div><div class="dossier-quote">Informar con claridad.<br>Conectar a la comunidad.<br>Dar visibilidad a lo que importa.</div><h2>Contacto institucional</h2><p>Web: <strong>https://evoford.com/news/</strong></p><p>Para comunicaciones institucionales, propuestas de colaboración y envío de información, utilice los canales de contacto publicados en la web oficial.</p><div class="dossier-card"><p><strong>EVOFORD NEWS</strong><br>Medio digital · Información con contexto<br>© '+new Date().getFullYear()+' EVOFORD NEWS</p></div>'));
 return pages.join("");
}
async function loadDirectoryListings(){
 var controller=new AbortController();
 var timeoutId;
 try{
  var client=window.EvofordSupabaseClient;
  if(!client)throw new Error("Inicia sesión en la edición antes de cargar el directorio.");
  var request=client.from("directory_listings").select("name,category,city,website,verified_at").eq("status","published").order("verified_at",{ascending:false,nullsFirst:false}).order("name").abortSignal(controller.signal);
  var timeout=new Promise(function(_,reject){timeoutId=setTimeout(function(){controller.abort();reject(new Error("La consulta del directorio tardó demasiado. Comprueba la conexión e inténtalo de nuevo."));},12000);});
  var result=await Promise.race([request,timeout]);
  clearTimeout(timeoutId);
  if(result.error)throw result.error;
  window.EvofordDirectoryListings=result.data||[];
  window.EvofordDirectoryLoadError="";
  return true;
 }catch(error){
  clearTimeout(timeoutId);
  window.EvofordDirectoryListings=[];
  window.EvofordDirectoryLoadError=error.message||"No se pudo cargar el directorio.";
  console.warn("Evoford dossier directory:",window.EvofordDirectoryLoadError);
  return false;
 }
}
async function openDossier(){
 await loadDirectoryListings();
 var root=$("#dossierRoot");if(!root){root=document.createElement("div");root.id="dossierRoot";document.body.appendChild(root);}
 root.innerHTML='<div class="dossier-toolbar"><button type="button" class="dossier-back" id="dossierBack">← Volver a edición impresa</button><span class="dossier-status" id="dossierStatus">Dossier institucional · 12 páginas</span><button type="button" id="dossierRefresh">Actualizar contenido</button><button type="button" id="dossierExport">Exportar PDF</button></div>'+build();
 root.classList.add("is-active");document.body.classList.add("dossier-printing");$(".newspaper").hidden=true;var toolbar=$(".toolbar");if(toolbar)toolbar.hidden=true;var hub=$("#socialHub");if(hub)hub.hidden=true;var campaign=$("#editionCampaignPanel");if(campaign)campaign.hidden=true;
 $("#dossierBack").onclick=closeDossier;
 $("#dossierRefresh").onclick=async function(){
  var button=$("#dossierRefresh"),status=$("#dossierStatus");
  if(button.disabled)return;
  button.disabled=true;button.textContent="Actualizando…";
  if(status)status.textContent="Actualizando contenido…";
  try{
   await loadDirectoryListings();
   var updatedPages=build();
   root.querySelectorAll(".dossier-page").forEach(function(node){node.remove();});
   root.insertAdjacentHTML("beforeend",updatedPages);
   if(status)status.textContent=window.EvofordDirectoryLoadError?"Dossier actualizado · directorio no disponible":"Dossier actualizado · 12 páginas";
  }catch(error){
   if(status)status.textContent="No se pudo actualizar: "+(error.message||"Error inesperado");
   console.error("Evoford dossier refresh:",error);
  }finally{
   button.disabled=false;button.textContent="Actualizar contenido";
  }
 };
 $("#dossierExport").onclick=exportPDF;
 window.scrollTo(0,0);
}
function exportPDF(){document.body.classList.add("dossier-printing");window.print();}
function closeDossier(){var root=$("#dossierRoot");if(root)root.classList.remove("is-active");document.body.classList.remove("dossier-printing");$(".newspaper").hidden=false;var toolbar=$(".toolbar");if(toolbar)toolbar.hidden=false;var hub=$("#socialHub");if(hub)hub.hidden=false;var campaign=$("#editionCampaignPanel");if(campaign)campaign.hidden=false;}
function init(){var tools=$(".toolbar .tools");if(!tools)return;var button=document.createElement("button");button.type="button";button.id="dossierOpenBtn";button.className="secondary-tool";button.textContent="Dossier institucional";button.addEventListener("click",async function(){try{await openDossier();}catch(e){alert(e.message||"No se pudo preparar el dossier.");}});tools.appendChild(button);}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
window.addEventListener("afterprint",function(){if(document.body.classList.contains("dossier-printing"))document.body.classList.remove("dossier-printing");});
})();