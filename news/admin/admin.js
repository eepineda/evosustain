/*
  Evoford News admin panel.
  Configure the two public Supabase values below before deployment.
  Never put a service_role or GitHub token in this file.
*/
const SUPABASE_URL = "https://poywsdigujbarvnzbfnz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f";
const ADMIN_EMAIL = "eepinedacarrasco@gmail.com";

let client = null;
let currentUser = null;
const $ = (id) => document.getElementById(id);
const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,90);

function say(id, message){ $(id).textContent = message || ""; }
function safe(value=""){ return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

function translationStatus(article){
  const baseLanguage=String(article.language||"es").toLowerCase().startsWith("en")?"en":"es";
  const hasSpanish=baseLanguage==="es"
    ?Boolean(article.title&&article.content)
    :Boolean(article.title_es&&article.content_es);
  const hasEnglish=baseLanguage==="en"
    ?Boolean(article.title&&article.content)
    :Boolean(article.title_en&&article.content_en);
  if(hasSpanish&&hasEnglish)return {label:"ES + EN completos",kind:"complete"};
  if(!hasSpanish&&!hasEnglish)return {label:"Faltan ES y EN",kind:"missing"};
  return {label:hasSpanish?"Falta inglés":"Falta español",kind:"partial"};
}

function editorialGate(payload){
  const author=String(payload.author||"").trim();
  const body=String(payload.content||"").replace(/\\n/g," ").replace(/<[^>]*>/g," ").trim();
  if(!author) return "Falta identificar al autor. No atribuyas una noticia importada a una persona que no la haya redactado.";
  if(body.length<500) return "El artículo necesita al menos 500 caracteres de texto propio para poder aprobarse.";
  if(/borrador editorial|redacta aquí|no copies literalmente|fuente consultada:|fuente original:/i.test(body)) return "El texto todavía contiene instrucciones o una referencia de fuente. Sustitúyelas por una redacción propia.";
  if(payload.source_url&&!payload.source_title) return "Indica el nombre del medio original para mostrar correctamente su enlace.";
  const baseLanguage=String(payload.language||"es").toLowerCase().startsWith("en")?"en":"es";
  const hasEnglish=baseLanguage==="en"?Boolean(payload.title&&payload.content):Boolean(payload.title_en&&payload.content_en);
  const hasSpanish=baseLanguage==="es"?Boolean(payload.title&&payload.content):Boolean(payload.title_es&&payload.content_es);
  if(!hasSpanish||!hasEnglish) return "Para aprobar o publicar, completa las dos versiones: titular y texto íntegro en español y en inglés. Revisa también los resúmenes.";
  return "";
}


let maintenanceEnabled=false;
async function loadMaintenanceControl(){
  const button=$("maintenanceToggleBtn");
  const {data,error}=await client.from("site_settings").select("value").eq("key","maintenance").maybeSingle();
  if(error){$("maintenanceStatus").textContent="No se pudo leer el estado. Ejecuta la migración de mantenimiento en Supabase.";button.textContent="No disponible";button.disabled=true;return;}
  maintenanceEnabled=data?.value?.enabled===true;
  $("maintenanceStatus").textContent=maintenanceEnabled?"La web pública está en mantenimiento. El panel editorial sigue disponible.":"La web pública está visible.";
  button.textContent=maintenanceEnabled?"Desactivar mantenimiento":"Activar mantenimiento";
  button.classList.toggle("maintenance-active",maintenanceEnabled);
  button.disabled=false;
}
async function toggleMaintenance(){
  const next=!maintenanceEnabled;
  const prompt=next
    ?"La web completa dejará de estar visible para el público. ¿Quieres activar el mantenimiento?"
    :"La web volverá a estar visible para todos. ¿Quieres desactivar el mantenimiento?";
  if(!window.confirm(prompt))return;
  const button=$("maintenanceToggleBtn");button.disabled=true;
  const {error}=await client.from("site_settings").update({value:{enabled:next},updated_at:new Date().toISOString()}).eq("key","maintenance");
  if(error){say("globalMessage","No se pudo cambiar el mantenimiento: "+error.message);button.disabled=false;return;}
  await loadMaintenanceControl();
  say("globalMessage",next?"Mantenimiento activado. La web pública mostrará el aviso.":"Mantenimiento desactivado. La web vuelve a estar visible.");
}

async function init(){
  try{
    say("loginMessage","Conectando con el servicio de acceso…");
    if(!window.supabase){
      say("loginMessage","No se ha cargado la biblioteca de acceso de Supabase. Recarga la página.");
      return;
    }
    // Keep Supabase's default implicit magic-link flow, which was used before the auth change.
    client = window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
    // Register before reading the session; defer app queries outside the auth callback.
    client.auth.onAuthStateChange((event,session)=>{
      if(session) queueMicrotask(()=>showApp(session.user));
      else if(event==="SIGNED_OUT") showLogin();
    });
    const {data,error}=await client.auth.getSession();
    if(error) throw error;
    if(data?.session) await showApp(data.session.user);
    else say("loginMessage","");
  }catch(error){
    console.error("Evoford News init:",error);
    say("loginMessage","Error al iniciar el panel: "+(error?.message||"comprueba la conexión y recarga."));
  }
}
function showLogin(){ $("loginView").hidden=false; $("appView").hidden=true; }
async function showApp(user){
  if((user.email||"").toLowerCase() !== ADMIN_EMAIL){
    await client.auth.signOut();
    say("loginMessage","Este correo no está autorizado para administrar Evoford News.");
    return;
  }
  currentUser=user; $("loginView").hidden=true; $("appView").hidden=false;
  $("signedInAs").textContent=user.email;
  await Promise.all([loadArticles(),loadInbox(),loadSources(),loadSubmissions(),loadCourses(),loadMaintenanceControl(),loadAds()]);
}
async function login(e){
  e.preventDefault();
  const button=$("loginForm").querySelector("button[type=submit]");
  const email=$("email").value.trim().toLowerCase();
  say("loginMessage","");
  if(!client){say("loginMessage","El servicio de acceso todavía está iniciándose. Recarga la página e inténtalo de nuevo.");return;}
  if(email!==ADMIN_EMAIL){say("loginMessage","Correo no autorizado.");return;}
  if(button)button.disabled=true;
  say("loginMessage","Enviando enlace seguro…");
  try{
    const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:"https://evoford.com/news/admin/"}});
    if(error)throw error;
    say("loginMessage","Solicitud enviada. Revisa la bandeja de entrada y el correo no deseado.");
  }catch(error){
    console.error("Evoford News login:",error);
    say("loginMessage","No se pudo enviar el enlace: "+(error?.message||"error de conexión"));
  }finally{
    if(button)button.disabled=false;
  }
}
function filterArticles(){
  const query=($("articleSearch")?.value||"").trim().toLocaleLowerCase("es");
  const status=$("articleStatusFilter")?.value||"";
  const items=[...$("articleList").querySelectorAll("[data-article-item]")];
  let visible=0;
  items.forEach(item=>{
    const matchesText=!query||(item.dataset.search||"").includes(query);
    const matchesStatus=!status||item.dataset.status===status;
    const show=matchesText&&matchesStatus;
    item.hidden=!show;
    if(show)visible++;
  });
  const count=$("articleFilterCount");
  if(count)count.textContent=visible+" de "+items.length+" artículos";
}

async function loadArticles(){
  const {data,error}=await client.from("articles").select("*").order("created_at",{ascending:false});
  if(error){$("articleList").innerHTML=`<p class="muted">${safe(error.message)}</p>`;return;}
  $("articleList").innerHTML=data.length?data.map(a=>`<article class="item" data-article-item data-status="${safe(a.status)}" data-search="${safe([a.title,a.category,a.author].filter(Boolean).join(" ").toLocaleLowerCase("es"))}"><div><h3>${safe(a.title)}</h3><p>${safe(a.category)} · ${safe(a.author)} · <span class="pill">${safe(({draft:"Borrador",pending:"En revisión",approved:"Aprobado",published:"Publicado",rejected:"Descartado"})[a.status]||a.status)}</span> · <span class="translation-pill ${translationStatus(a).kind}">${translationStatus(a).label}</span></p></div><div class="item-actions"><button class="secondary" data-edit="${a.id}">Editar</button>${a.status!=="published"?`<button class="secondary" data-discard="${a.id}">Descartar</button>`:""}<button class="secondary" data-delete="${a.id}">Eliminar</button></div></article>`).join(""):'<p class="muted">Todavía no hay artículos.</p>';
  $("articleList").querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>editArticle(data.find(a=>a.id===b.dataset.edit))));
  $("articleList").querySelectorAll("[data-discard]").forEach(b=>b.addEventListener("click",async()=>{
    const article=data.find(a=>a.id===b.dataset.discard);
    if(!article||!window.confirm(`¿Descartar «${article.title}»? Seguirá guardado, pero dejará de estar en el flujo editorial.`))return;
    const {error}=await client.from("articles").update({status:"rejected",updated_at:new Date().toISOString()}).eq("id",article.id);
    if(error){say("globalMessage","No se pudo descartar: "+error.message);return;}
    say("globalMessage","Artículo descartado. Puedes recuperarlo cambiando su estado desde edición.");
    await loadArticles();
  }));
  $("articleList").querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",async()=>{
    const article=data.find(a=>a.id===b.dataset.delete);
    if(!article||!window.confirm(`¿Eliminar definitivamente «${article.title}»? Esta acción no se puede deshacer.${article.status==="published"?" También desaparecerá de la web pública.":""}`))return;
    const {error}=await client.from("articles").delete().eq("id",article.id);
    if(error){say("globalMessage","No se pudo eliminar: "+error.message);return;}
    say("globalMessage","Artículo eliminado definitivamente.");
    await loadArticles();
  }));
  filterArticles();
}
async function uploadArticleImage(){
  const file=$("imageFile").files?.[0];
  if(!file)return;
  const allowed=["image/jpeg","image/png","image/webp"];
  if(!allowed.includes(file.type)){say("imageMessage","Formato no admitido. Usa JPG, PNG o WebP.");return;}
  if(file.size>8*1024*1024){say("imageMessage","La imagen supera el límite de 8 MB.");return;}
  const button=$("uploadImageBtn");button.disabled=true;say("imageMessage","Subiendo imagen…");
  try{
    const extension=({"image/jpeg":"jpg","image/png":"png","image/webp":"webp"})[file.type];
    const folder=$("articleId").value||"drafts";
    const path=folder+"/"+Date.now()+"-"+crypto.randomUUID()+"."+extension;
    const result=await client.storage.from("news-images").upload(path,file,{cacheControl:"3600",upsert:false,contentType:file.type});
    if(result.error)throw result.error;
    const publicData=client.storage.from("news-images").getPublicUrl(path).data;
    $("imageUrl").value=publicData.publicUrl;$("imagePreview").src=publicData.publicUrl;$("imagePreview").hidden=false;
    say("imageMessage","Imagen subida y asociada al artículo. Guarda los cambios para conservarla.");
  }catch(error){say("imageMessage","No se pudo subir: "+(error.message||"error desconocido")+". Comprueba la configuración de almacenamiento.");}
  finally{button.disabled=false;}
}
function editArticle(a){
  $("articleForm").hidden=false;$("formHeading").textContent=a?"Editar artículo":"Nuevo artículo";
  $("articleId").value=a?.id||"";$("publishArticleBtn").hidden=!(a?.status==="approved");$("saveChangesBtn").hidden=!a;$("title").value=a?.title||"";$("titleEn").value=a?.title_en||"";$("titleEs").value=a?.title_es||"";$("category").value=a?.category||"Internacional";
  $("author").value=a?.author||"Evoford News";$("summary").value=a?.summary||"";
  $("content").value=a?.content||"";$("imageUrl").value=a?.image_url||"";$("imageFile").value="";$("imagePreview").src=a?.image_url||"";$("imagePreview").hidden=!a?.image_url;say("imageMessage","");$("country").value=a?.country||"";$("region").value=a?.region||"";$("language").value=a?.language||"es";$("summaryEn").value=a?.summary_en||"";$("contentEn").value=a?.content_en||"";$("summaryEs").value=a?.summary_es||"";$("contentEs").value=a?.content_es||"";const translation=translationStatus(a||{language:"es"});say("translationStatus",translation.label+". Completa los campos de titular y texto en ambos idiomas antes de considerar la versión bilingüe terminada.");$("sourceTitle").value=a?.source_title||"";$("sourceUrl").value=a?.source_url||"";
  $("articleForm").scrollIntoView({behavior:"smooth",block:"start"});
}
async function saveArticle(status,preserveStatus=false){
  const title=$("title").value.trim(),content=$("content").value.trim();
  if(!title||!content){say("editorMessage","El titular y el texto son obligatorios.");return;}
  const id=$("articleId").value;
  const sourceUrl=$("sourceUrl").value.trim();if(sourceUrl&&!/^https:\/\//i.test(sourceUrl)){say("editorMessage","El enlace de la fuente debe comenzar por https://.");return;}const titleEn=$("titleEn").value.trim();const payload={title,title_en:titleEn||null,title_es:$("titleEs").value.trim()||null,slug:slugify(title),category:$("category").value,author:$("author").value.trim()||null,summary:$("summary").value.trim(),content,image_url:$("imageUrl").value.trim()||null,country:$("country").value.trim()||null,region:$("region").value.trim()||null,language:$("language").value,summary_en:$("summaryEn").value.trim(),content_en:$("contentEn").value.trim(),summary_es:$("summaryEs").value.trim(),content_es:$("contentEs").value.trim(),source_title:$("sourceTitle").value.trim()||null,source_url:sourceUrl?sourceUrl.replace(/[?&]utm_[^&]+/g,"").replace(/[?&]$/,""):null,status,updated_at:new Date().toISOString()};if(preserveStatus){if(!id){say("editorMessage","No hay un artículo existente que actualizar.");return;}const {data:current,error:statusError}=await client.from("articles").select("status,slug").eq("id",id).single();if(statusError){say("editorMessage","No se pudo conservar el estado: "+statusError.message);return;}payload.status=current.status;payload.slug=current.slug;if(["approved","published"].includes(current.status)){const gateMessage=editorialGate(payload);if(gateMessage){say("editorMessage",gateMessage);return;}}}
  if((status==="approved"||status==="published")&&!preserveStatus){const gateMessage=editorialGate(payload);if(gateMessage){say("editorMessage",gateMessage);return;}}
  if(status==="published"&&!preserveStatus){
    if(!id){say("editorMessage","Guarda y aprueba el artículo antes de publicarlo.");return;}
    const {data:current,error:statusError}=await client.from("articles").select("status").eq("id",id).single();
    if(statusError){say("editorMessage","No se pudo comprobar el estado del artículo: "+statusError.message);return;}
    if(current.status!=="approved"){say("editorMessage","Solo se pueden publicar artículos previamente aprobados.");return;}
    if(!window.confirm("Vas a publicar este artículo en la web pública. ¿Confirmas la publicación?"))return;
  }
  let query;
  if(id){
    query=client.from("articles").update(payload).eq("id",id);
  }else{
    const {data:existing,error:lookupError}=await client.from("articles").select("id").eq("slug",payload.slug).maybeSingle();
    if(lookupError){say("editorMessage",lookupError.message);return;}
    query=existing
      ?client.from("articles").update(payload).eq("id",existing.id)
      :client.from("articles").insert(payload);
  }
  const {error}=await query;
  say("editorMessage",error?error.message:(preserveStatus?"Cambios guardados sin modificar el estado de publicación.":({draft:"Borrador guardado.",pending:"Artículo enviado a revisión.",approved:"Artículo aprobado. Sigue sin publicarse.",published:"Artículo publicado y visible en la web."}[status]||"Artículo actualizado.")));
  if(!error){$("articleForm").hidden=true;await loadArticles();}
}

async function runRssImport(){
  const button=$("runRssBtn");
  button.disabled=true;
  say("rssRunMessage","Consultando fuentes RSS activas…");
  try{
    const {data,error}=await client.functions.invoke("rss-ingest",{body:{}});
    if(error) throw error;
    const imported=Number(data?.imported||0);
    const checked=Number(data?.checked_sources||0);
    const results=Array.isArray(data?.results)?data.results:[];
    const failed=results.filter(x=>x.error);
    const invalid=results.reduce((n,x)=>n+Number(x.invalid||0),0);
    const duplicates=results.reduce((n,x)=>n+Number(x.duplicates||0),0);
    const duration=Math.max(0,...results.map(x=>Number(x.duration_ms||0)));
    const details=results.map(x=>{
      const time=(Number(x.duration_ms||0)/1000).toFixed(1)+" s";
      return "• "+x.source+": "+(x.error?"ERROR · "+x.error:Number(x.imported||0)+" nuevas · "+Number(x.duplicates||0)+" repetidas · "+Number(x.invalid||0)+" inválidas")+" · "+time;
    }).join("\n");
    const summary="Proceso terminado: "+imported+" noticias nuevas de "+checked+" fuentes. Repetidas: "+duplicates+". Inválidas: "+invalid+".";
    say("rssRunMessage",summary+"\n"+(failed.length?"Fuentes con errores:":"Detalle por fuente:")+"\n"+details);
    await loadInbox();
  }catch(error){
    say("rssRunMessage","No se pudo importar: "+(error.message||"Error desconocido")+". Comprueba el despliegue de rss-ingest.");
  }finally{
    button.disabled=false;
  }
}
function editorialSuggestion(item){
  const text=(item.title+" "+(item.summary||"")).toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g,"");
  const rules=[
    ["Economía",["economia","mercado","bolsa","acciones","empresa","empresas","inflacion","banco","inversion","opv","empleo","comercio","pib","financiero"]],
    ["Política",["gobierno","presidente","senado","senador","parlamento","elecciones","partido","ministro","congreso","vox","pp ","psoe","democrata","republicano"]],
    ["Seguridad",["policia","policial","detenido","detenidos","ataque","explosion","bomba","terrorismo","heridos","muertos","emergencia","rescate","fugitivo"]],
    ["Tecnología",["tecnologia","inteligencia artificial","software","chip","nvidia","anthropic","internet","ciberseguridad","digital"]],
    ["Clima",["clima","climatico","temperatura","olas de calor","viento","inundacion","sequía","sequía","emisiones","energia renovable"]],
    ["Sociedad",["sociedad","colegios","escuelas","vivienda","sanidad","educacion","huelga","cultura","festival","restaurante","concurso","actor","actriz","fallece","muere"]],
    ["Opinión",["opinion","columna","editorial","debate |"]]
  ];
  let category="Internacional";
  for(const [name,words] of rules){if(words.some(word=>text.includes(word))){category=name;break;}}
  const countries=[
    ["España",["espana","madrid","barcelona","oviedo","el hierro","valladolid","andalucia","cataluna"]],
    ["Estados Unidos",["estados unidos","ee uu","misisipi","mississippi","brooklyn","nueva york","washington","nasdaq"]],
    ["Ucrania",["ucrania","kiev","kyiv"]],
    ["Rusia",["rusia","moscu","kremlin"]],
    ["Italia",["italia","italiano","italiana","roma"]],
    ["Reino Unido",["reino unido","britan","londres","irlanda del norte"]],
    ["Francia",["francia","paris"]],
    ["Alemania",["alemania","berlin"]],
    ["México",["mexico","mexicano","mexicana"]],
    ["Brasil",["brasil","brasileno","brasilena"]],
    ["Argentina",["argentina","argentino","argentina"]],
    ["Chile",["chile","chileno","chilena"]],
    ["Colombia",["colombia","colombiano","colombiana"]]
  ];
  const country=countries.find(([name,terms])=>terms.some(term=>text.includes(term)))?.[0]||"";
  let region="";
  if(["España","Italia","Reino Unido","Francia","Alemania","Ucrania","Rusia"].includes(country)) region="Europa";
  else if(country==="Estados Unidos"||country==="México") region="América del Norte";
  else if(["Brasil","Argentina","Chile","Colombia"].includes(country)) region="América Latina";
  else if(/africa|africano|africana|sahel/.test(text)) region="África";
  else if(/asia|china|japon|india|corea/.test(text)) region="Asia";
  return {category,country,region};
}

async function loadInbox(){
  const [{data,error},{data:sources},{data:articles,error:articlesError}] = await Promise.all([
    client.from("imported_items").select("*").order("created_at",{ascending:false}),
    client.from("rss_sources").select("id,name,category"),
    client.from("articles").select("id,title,source_url,status")
  ]);
  if(error){$("inboxList").innerHTML=`<p class="muted">${safe(error.message)}</p>`;return;}
  if(articlesError){$("inboxList").innerHTML=`<p class="muted">No se pudo comprobar la relación con los borradores: ${safe(articlesError.message)}</p>`;return;}
  const sourceMap=new Map((sources||[]).map(source=>[String(source.id),source]));
  const articleBySource=new Map((articles||[]).filter(a=>a.source_url).map(a=>[a.source_url,a]));
  $("inboxList").innerHTML=data.length?data.map(n=>{
    const source=sourceMap.get(String(n.source_id));
    const linkedArticle=articleBySource.get(n.article_url);
    const guess=editorialSuggestion(n);
    const suggested=n.suggested_category||guess.category;
    const country=n.country||guess.country;
    const region=n.region||guess.region;
    const workflowLabel=linkedArticle?"Borrador vinculado · "+({draft:"Borrador",pending:"En revisión",approved:"Aprobado",published:"Publicado",rejected:"Descartado"}[linkedArticle.status]||linkedArticle.status):"Pendiente de borrador";
    const action=linkedArticle
      ?`<button type="button" class="secondary" data-open-article="${linkedArticle.id}">Abrir borrador</button>`
      :`<button type="button" class="secondary" data-draft="${n.id}">Preparar artículo propio</button>`;
    return `<article class="item"><div><h3>${safe(n.title)}</h3><p>${safe(source?.name||"Fuente RSS")} · Sección sugerida: ${safe(suggested)} · <a href="${safe(n.article_url)}" target="_blank" rel="noopener noreferrer">Consultar fuente original</a> · <span class="pill">${safe(n.status)}</span> · <span class="rss-workflow-pill ${linkedArticle?"linked":"waiting"}">${safe(workflowLabel)}</span></p>${n.summary?`<p class="rss-extract"><strong>Extracto disponible del RSS (${n.summary.length} caracteres):</strong> ${safe(n.summary)}</p><p class="muted">Este texto es material de consulta de la fuente; no cuenta como redacción propia para aprobar.</p>`:"<p class='muted'>El RSS no proporciona un extracto de texto.</p>"}<p>Clasificación orientativa: ${safe(country||"País por verificar")} · ${safe(region||"Región por verificar")}</p></div><div class="item-actions">${action}<button class="secondary" data-reject="${n.id}">Descartar</button></div></article>`;
  }).join(""):'<p class="muted">No hay noticias importadas. Añade fuentes RSS activas e inicia una importación.</p>';
}

async function loadSubmissions(){const {data,error}=await client.from("article_submissions").select("*").order("created_at",{ascending:false});if(error){$("submissionsList").innerHTML='<p class="muted">No se pudieron cargar: '+safe(error.message)+'</p>';return;}$("submissionsList").innerHTML=data.length?data.map(s=>'<article class="item"><div><h3>'+safe(s.title)+'</h3><p>'+safe(s.sender_name)+' · '+safe(s.sender_email)+' · '+safe(s.submission_type)+' · '+new Date(s.created_at).toLocaleString("es-ES")+' · <span class="pill">'+safe(s.status)+'</span></p><p>'+safe(s.body.slice(0,240))+(s.body.length>240?"…":"")+'</p><p class="muted">'+(s.attachment_paths||[]).length+' adjunto(s)</p></div><div class="item-actions">'+(s.status==="received"?'<button class="secondary" data-convert-sub="'+s.id+'">Convertir en borrador</button><button class="secondary" data-reject-sub="'+s.id+'">Descartar</button>':'')+((s.attachment_paths||[]).length?'<button class="secondary" data-files-sub="'+s.id+'">Ver adjuntos</button>':'')+'<button class="secondary danger" data-delete-sub="'+s.id+'">Eliminar</button></div></article>').join(""):'<p class="muted">No hay envíos recibidos.</p>';}
async function handleSubmissionAction(e){const c=e.target.closest("[data-convert-sub]"),r=e.target.closest("[data-reject-sub]"),f=e.target.closest("[data-files-sub]"),d=e.target.closest("[data-delete-sub]");if(d){if(!window.confirm("¿Eliminar definitivamente este envío y sus archivos adjuntos? Esta acción no se puede deshacer."))return;d.disabled=true;const {data:record,error:readError}=await client.from("article_submissions").select("attachment_paths").eq("id",d.dataset.deleteSub).single();if(readError){say("globalMessage","No se pudo leer el envío: "+readError.message);d.disabled=false;return;}const paths=record.attachment_paths||[];if(paths.length){const {error:storageError}=await client.storage.from("news-submissions").remove(paths);if(storageError){say("globalMessage","No se pudieron eliminar los adjuntos: "+storageError.message);d.disabled=false;return;}}const {error:deleteError}=await client.from("article_submissions").delete().eq("id",d.dataset.deleteSub);if(deleteError){say("globalMessage","No se pudo eliminar el envío: "+deleteError.message);d.disabled=false;return;}say("globalMessage","Envío y adjuntos eliminados definitivamente.");await loadSubmissions();return;}if(c){const {data:s,error}=await client.from("article_submissions").select("*").eq("id",c.dataset.convertSub).single();if(error){say("globalMessage",error.message);return;}const {data:a,error:ie}=await client.from("articles").insert({title:s.title,slug:slugify(s.title)+"-"+s.id.slice(0,8),category:s.submission_type==="opinion"?"Opinión":"Internacional",author:s.sender_name,summary:"Envío recibido de "+s.sender_name+" ("+s.sender_email+"). Pendiente de edición y verificación.",content:s.body,language:"es",source_title:"Envío externo",status:"draft",updated_at:new Date().toISOString()}).select("id").single();if(ie){say("globalMessage","No se pudo crear el borrador: "+ie.message);return;}const {error:ue}=await client.from("article_submissions").update({status:"converted",article_id:a.id}).eq("id",s.id);if(ue){say("globalMessage","Borrador creado, pero no se pudo vincular: "+ue.message);return;}await Promise.all([loadSubmissions(),loadArticles()]);document.querySelector('[data-tab="articles"]').click();const {data:created}=await client.from("articles").select("*").eq("id",a.id).single();if(created)editArticle(created);say("globalMessage","Envío convertido en borrador. Revísalo antes de aprobarlo.");return;}if(r){if(!confirm("¿Descartar este envío?"))return;const {error}=await client.from("article_submissions").update({status:"rejected"}).eq("id",r.dataset.rejectSub);if(error)say("globalMessage",error.message);await loadSubmissions();return;}if(f){const {data:s}=await client.from("article_submissions").select("attachment_paths").eq("id",f.dataset.filesSub).single();let count=0;for(const path of s.attachment_paths||[]){const {data,error}=await client.storage.from("news-submissions").createSignedUrl(path,300);if(!error){window.open(data.signedUrl,"_blank","noopener");count++;}}if(!count)say("globalMessage","No se pudieron abrir los adjuntos.");}}

function closeRssEdit(){ $("rssEditModal").hidden=true; $("rssEditForm").reset(); $("rssEditMessage").textContent=""; }
$("closeRssEdit")?.addEventListener("click",closeRssEdit);
$("cancelRssEdit")?.addEventListener("click",closeRssEdit);
$("rssEditModal")?.addEventListener("click",event=>{if(event.target===$("rssEditModal"))closeRssEdit();});
$("rssEditForm")?.addEventListener("submit",async event=>{
  event.preventDefault();
  const id=$("rssEditId").value;
  const name=$("rssEditName").value.trim();
  const feedUrl=$("rssEditUrl").value.trim();
  const category=$("rssEditCategory").value.trim()||"General";
  if(!id||!name||!feedUrl){$("rssEditMessage").textContent="Completa todos los campos.";return;}
  let parsedUrl;
  try{parsedUrl=new URL(feedUrl);}catch{$("rssEditMessage").textContent="La URL del feed no es válida.";return;}
  if(!["https:","http:"].includes(parsedUrl.protocol)){$("rssEditMessage").textContent="El feed debe usar http:// o https://.";return;}
  const save=$("saveRssEdit");save.disabled=true;$("rssEditMessage").textContent="Guardando cambios…";
  const {error}=await client.from("rss_sources").update({name,feed_url:feedUrl,category}).eq("id",id);
  save.disabled=false;
  if(error){$("rssEditMessage").textContent="No se pudo actualizar la fuente: "+error.message;return;}
  $("sourceMessage").textContent="Fuente actualizada. La nueva dirección se utilizará en próximas importaciones.";
  closeRssEdit();await loadSources();
});
function formatRssDate(value){
  if(!value)return "Nunca";
  const date=new Date(value);
  return Number.isNaN(date.getTime())?"Fecha no disponible":date.toLocaleString("es-GB",{dateStyle:"medium",timeStyle:"short",timeZone:"Europe/London"});
}
async function loadSources(){
  const [sourcesResult,itemsResult]=await Promise.all([
    client.from("rss_sources").select("*").order("created_at",{ascending:false}),
    client.from("imported_items").select("source_id,imported_at,status").order("imported_at",{ascending:false})
  ]);
  const {data,error}=sourcesResult;
  if(error){$("sourceList").innerHTML=`<p class="muted">${safe(error.message)}</p>`;return;}
  if(itemsResult.error){
    $("sourceList").innerHTML='<p class="muted">No se pudieron consultar las métricas de noticias: '+safe(itemsResult.error.message)+'</p>';
    return;
  }
  const now=Date.now(),stats=new Map();
  (itemsResult.data||[]).forEach(item=>{
    if(!item.source_id)return;
    const entry=stats.get(item.source_id)||{total:0,last24h:0,pending:0,lastImported:null};
    entry.total++;
    const importedAt=item.imported_at?new Date(item.imported_at):null;
    if(importedAt&&!Number.isNaN(importedAt.getTime())){
      if(!entry.lastImported||importedAt>new Date(entry.lastImported))entry.lastImported=item.imported_at;
      if(now-importedAt.getTime()<=24*60*60*1000)entry.last24h++;
    }
    if(item.status==="pending")entry.pending++;
    stats.set(item.source_id,entry);
  });
  const activeCount=data.filter(s=>s.active).length;
  const totalItems=(itemsResult.data||[]).length;
  const sourcesWithItems=data.filter(s=>(stats.get(s.id)?.total||0)>0).length;
  $("rssSourceSummary").innerHTML=[
    ["Fuentes configuradas",data.length],
    ["Activas",activeCount],
    ["Con noticias guardadas",sourcesWithItems],
    ["Noticias almacenadas",totalItems]
  ].map(([label,value])=>'<div class="rss-source-stat"><strong>'+value+'</strong><span>'+label+'</span></div>').join("");
  $("sourceList").innerHTML=data.length?data.map(s=>{
    const m=stats.get(s.id)||{total:0,last24h:0,pending:0,lastImported:null};
    const health=m.total===0?'<span class="rss-health no-data">Sin registros</span>':m.last24h>0?'<span class="rss-health recent">Actividad en 24 h</span>':'<span class="rss-health quiet">Sin novedades en 24 h</span>';
    return '<article class="item rss-source-item"><div class="rss-source-main"><h3>'+safe(s.name)+'</h3><p class="rss-source-url">'+safe(s.feed_url)+'</p><p class="rss-source-meta">'+safe(s.category||"General")+' · '+(s.active?'<span class="pill">Activa</span>':'<span class="pill">Pausada</span>')+' · '+health+'</p><div class="rss-source-metrics"><span><strong>'+m.total+'</strong> total</span><span><strong>'+m.last24h+'</strong> últimas 24 h</span><span><strong>'+m.pending+'</strong> pendientes</span><span><strong>'+safe(formatRssDate(m.lastImported))+'</strong> última noticia</span></div></div><div class="item-actions"><button type="button" class="secondary" data-edit-source="'+safe(s.id)+'">Editar</button><button type="button" class="secondary" data-toggle-source="'+safe(s.id)+'">'+(s.active?"Pausar":"Activar")+'</button><button type="button" class="secondary" data-delete-source="'+safe(s.id)+'">Eliminar fuente</button></div></article>';
  }).join(""):'<p class="muted">Aún no hay fuentes RSS configuradas.</p>';
  $("sourceList").querySelectorAll("[data-toggle-source]").forEach(button=>button.addEventListener("click",async()=>{
    const source=data.find(s=>String(s.id)===button.dataset.toggleSource);
    if(!source)return;
    button.disabled=true;
    const {error}=await client.from("rss_sources").update({active:!source.active}).eq("id",source.id);
    if(error){say("sourceMessage","No se pudo cambiar el estado: "+error.message);button.disabled=false;return;}
    say("sourceMessage",source.active?"Fuente pausada. No se consultará en próximas importaciones.":"Fuente activada. Volverá a consultarse en próximas importaciones.");
    await loadSources();
  }));
  $("sourceList").querySelectorAll("[data-edit-source]").forEach(button=>button.addEventListener("click",()=>{
    const source=data.find(s=>String(s.id)===button.dataset.editSource);
    if(!source)return;
    $("rssEditId").value=source.id;
    $("rssEditName").value=source.name||"";
    $("rssEditUrl").value=source.feed_url||"";
    $("rssEditCategory").value=source.category||"General";
    $("rssEditMessage").textContent="";
    $("rssEditModal").hidden=false;
    $("rssEditModal").scrollIntoView({behavior:"smooth",block:"center"});
    $("rssEditName").focus();
  }));
  $("sourceList").querySelectorAll("[data-delete-source]").forEach(button=>button.addEventListener("click",async()=>{
    const source=data.find(s=>String(s.id)===button.dataset.deleteSource);
    if(!source||!window.confirm(`¿Eliminar la fuente RSS «${source.name}»? Dejará de importarse en futuras consultas. Las noticias que ya se importaron se conservarán en la bandeja.`))return;
    button.disabled=true;
    const {error}=await client.from("rss_sources").delete().eq("id",source.id);
    if(error){say("sourceMessage","No se pudo eliminar la fuente: "+error.message);button.disabled=false;return;}
    say("sourceMessage","Fuente eliminada. Las noticias importadas anteriormente se han conservado.");
    await Promise.all([loadSources(),loadInbox()]);
  }));
}
async function addSource(e){
  e.preventDefault();const payload={name:$("sourceName").value.trim(),feed_url:$("feedUrl").value.trim(),category:$("sourceCategory").value};
  const {error}=await client.from("rss_sources").insert(payload);
  say("sourceMessage",error?error.message:"Fuente añadida. La importación automática se conectará en la siguiente fase.");
  if(!error){$("sourceForm").reset();await loadSources();}
}

function openDirectoryEdit(item){
  $("directoryEditId").value=item.id;
  $("directoryEditName").value=item.name||"";
  $("directoryEditSlug").value=item.slug||"";
  $("directoryEditCategory").value=item.category||"Instituciones dominicanas";
  $("directoryEditType").value=item.listing_type||"community";
  $("directoryEditCity").value=item.city||"";
  $("directoryEditPostcode").value=item.postcode||"";
  $("directoryEditAddress").value=item.address||"";
  $("directoryEditPhone").value=item.phone||"";
  $("directoryEditEmail").value=item.email||"";
  $("directoryEditWebsite").value=item.website||"";
  $("directoryEditDescription").value=item.description||"";
  $("directoryEditServices").value=Array.isArray(item.services)?item.services.join("\n"):"";
  $("directoryEditHours").value=item.opening_hours||"";
  $("directoryEditImage").value=item.image_url||"";
  $("directoryEditStatus").value=item.status||"draft";
  $("directoryEditSponsored").checked=Boolean(item.sponsored);
  $("directoryEditMessage").textContent="";
  $("directoryEditPanel").hidden=false;
  $("directoryEditPanel").scrollIntoView({behavior:"smooth",block:"start"});
  $("directoryEditName").focus();
}
function closeDirectoryEdit(){ $("directoryEditPanel").hidden=true; $("directoryEditForm").reset(); $("directoryEditMessage").textContent=""; }
$("closeDirectoryEdit")?.addEventListener("click",closeDirectoryEdit);
$("cancelDirectoryEdit")?.addEventListener("click",closeDirectoryEdit);
$("directoryEditForm")?.addEventListener("submit",async event=>{
  event.preventDefault();
  const id=$("directoryEditId").value;
  const name=$("directoryEditName").value.trim();
  const slug=$("directoryEditSlug").value.trim();
  if(!id||!name||!slug){$("directoryEditMessage").textContent="El nombre y el identificador URL son obligatorios.";return;}
  const website=$("directoryEditWebsite").value.trim();
  const imageUrl=$("directoryEditImage").value.trim();
  for(const [label,value] of [["Sitio web",website],["Imagen",imageUrl]]){
    if(value){try{const u=new URL(value);if(!["http:","https:"].includes(u.protocol))throw new Error();}catch{$("directoryEditMessage").textContent=label+" debe ser una URL válida.";return;}}
  }
  const status=$("directoryEditStatus").value;
  const payload={
    name,slug,category:$("directoryEditCategory").value,listing_type:$("directoryEditType").value,
    city:$("directoryEditCity").value.trim()||"London",postcode:$("directoryEditPostcode").value.trim()||null,
    address:$("directoryEditAddress").value.trim()||null,phone:$("directoryEditPhone").value.trim()||null,
    email:$("directoryEditEmail").value.trim()||null,website:website||null,
    description:$("directoryEditDescription").value.trim(),services:$("directoryEditServices").value.split("\n").map(x=>x.trim()).filter(Boolean),
    opening_hours:$("directoryEditHours").value.trim()||null,image_url:imageUrl||null,
    status,sponsored:$("directoryEditSponsored").checked,
    verified_at:status==="published"?new Date().toISOString():null,updated_at:new Date().toISOString()
  };
  const save=$("saveDirectoryEdit");save.disabled=true;$("directoryEditMessage").textContent="Guardando cambios…";
  const {error}=await client.from("directory_listings").update(payload).eq("id",id);
  save.disabled=false;
  if(error){$("directoryEditMessage").textContent="No se pudo guardar la ficha: "+error.message;return;}
  say("globalMessage","Ficha actualizada correctamente.");closeDirectoryEdit();await loadDirectoryAdmin();
});

let courseEnquiries=[];
function courseStatusLabel(status){return ({received:"Recibida",contacted:"Contactada",enrolled:"Matriculada",closed:"Cerrada",discarded:"Descartada"})[status]||status;}
function filterCourses(){
 const q=($("courseSearch")?.value||"").trim().toLocaleLowerCase("es");
 const status=$("courseStatusFilter")?.value||"";
 const filtered=courseEnquiries.filter(x=>(!status||x.status===status)&&[x.full_name,x.email,x.course_interest,x.message,x.internal_notes].some(v=>String(v||"").toLocaleLowerCase("es").includes(q)));
 $("courseCount").textContent=filtered.length+" de "+courseEnquiries.length+" solicitudes";
 const counts={received:0,contacted:0,enrolled:0,closed:0,discarded:0};courseEnquiries.forEach(x=>{if(counts[x.status]!==undefined)counts[x.status]++;});
 $("courseStats").innerHTML=[["Recibidas",counts.received],["Contactadas",counts.contacted],["Matriculadas",counts.enrolled],["Cerradas",counts.closed],["Descartadas",counts.discarded]].map(([label,n])=>'<div class="course-stat"><strong>'+n+'</strong><span>'+label+'</span></div>').join("");
 $("courseEnquiryList").innerHTML=filtered.length?filtered.map(x=>{
  const date=x.created_at?new Date(x.created_at).toLocaleString("es-GB",{dateStyle:"medium",timeStyle:"short"}):"Fecha no disponible";
  return '<article class="item course-enquiry-card"><div class="course-enquiry-main"><p class="eyebrow">'+safe(date)+' · '+safe(courseStatusLabel(x.status))+'</p><h3>'+safe(x.full_name)+'</h3><p><a href="mailto:'+safe(x.email)+'">'+safe(x.email)+'</a></p><p><strong>Curso:</strong> '+safe(x.course_interest)+'</p><p>'+safe(x.message).replace(/\n/g,"<br>")+'</p></div><div class="course-enquiry-manage"><label>Estado<select class="course-card-status" data-course-id="'+safe(x.id)+'"><option value="received" '+(x.status==="received"?"selected":"")+'>Recibida</option><option value="contacted" '+(x.status==="contacted"?"selected":"")+'>Contactada</option><option value="enrolled" '+(x.status==="enrolled"?"selected":"")+'>Matriculada</option><option value="closed" '+(x.status==="closed"?"selected":"")+'>Cerrada</option><option value="discarded" '+(x.status==="discarded"?"selected":"")+'>Descartada</option></select></label><label>Notas internas<textarea class="course-card-notes" data-course-notes="'+safe(x.id)+'" rows="3" maxlength="3000" placeholder="Ej.: enviar precio, llamar el viernes, pendiente de financiación…">'+safe(x.internal_notes||"")+'</textarea></label><button type="button" class="secondary" data-save-course-notes="'+safe(x.id)+'">Guardar notas</button><div class="course-danger-actions"><button type="button" class="secondary" data-discard-course="'+safe(x.id)+'">Descartar solicitud</button><button type="button" class="danger" data-delete-course="'+safe(x.id)+'">Eliminar definitivamente</button></div></div></article>';
 }).join(""):'<p class="muted">No hay solicitudes que coincidan con estos filtros.</p>';
}

function exportCoursesCsv(){
 const rows=[["Fecha","Nombre","Correo","Curso","Consulta","Estado","Notas internas"],...courseEnquiries.map(x=>[x.created_at?new Date(x.created_at).toISOString():"",x.full_name,x.email,x.course_interest,x.message,courseStatusLabel(x.status),x.internal_notes||""])];
 const csv="\uFEFF"+rows.map(row=>row.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\r\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="evoford-solicitudes-formacion.csv";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}

async function loadCourses(){
 const root=$("courseEnquiryList");if(!root)return;
 root.innerHTML='<p class="muted">Cargando solicitudes…</p>';
 const {data,error}=await client.from("course_enquiries").select("*").order("created_at",{ascending:false});
 if(error){root.innerHTML='<p class="muted">No se pudieron cargar las solicitudes: '+safe(error.message)+'</p>';return;}
 courseEnquiries=data||[];filterCourses();
}
async function updateCourseStatus(id,status){
 const {error}=await client.from("course_enquiries").update({status}).eq("id",id);
 if(error){say("globalMessage","No se pudo actualizar el estado: "+error.message);return;}
 const item=courseEnquiries.find(x=>x.id===id);if(item)item.status=status;
 filterCourses();
}
async function discardCourse(id){
 const item=courseEnquiries.find(x=>x.id===id);if(!item)return;
 if(!confirm("¿Descartar la solicitud de "+item.full_name+"? Se conservará en el sistema con estado «Descartada» y podrás consultarla filtrando por ese estado."))return;
 const {error}=await client.from("course_enquiries").update({status:"discarded"}).eq("id",id);
 if(error){say("globalMessage","No se pudo descartar la solicitud: "+error.message);return;}
 item.status="discarded";filterCourses();say("globalMessage","Solicitud descartada. Se ha conservado en el registro.");
}
async function deleteCourse(id){
 const item=courseEnquiries.find(x=>x.id===id);if(!item)return;
 if(!confirm("¿Eliminar definitivamente la solicitud de "+item.full_name+"? Esta acción no se puede deshacer."))return;
 const {error}=await client.from("course_enquiries").delete().eq("id",id);
 if(error){say("globalMessage","No se pudo eliminar la solicitud: "+error.message);return;}
 courseEnquiries=courseEnquiries.filter(x=>x.id!==id);filterCourses();say("globalMessage","Solicitud eliminada definitivamente.");
}
\nasync function saveCourseNotes(id){
 const field=document.querySelector('[data-course-notes="'+id+'"]');if(!field)return;
 const {error}=await client.from("course_enquiries").update({internal_notes:field.value}).eq("id",id);
 if(error){say("globalMessage","No se pudieron guardar las notas: "+error.message);return;}
 const item=courseEnquiries.find(x=>x.id===id);if(item)item.internal_notes=field.value;
 say("globalMessage","Notas internas guardadas.");
}

async function loadDirectoryAdmin(){
  const [sub,items]=await Promise.all([
    client.from("directory_submissions").select("*").order("created_at",{ascending:false}),
    client.from("directory_listings").select("*").order("created_at",{ascending:false})
  ]);
  const subRoot=$("directorySubmissionList"),listRoot=$("directoryAdminList");
  if(sub.error)subRoot.innerHTML='<p class="muted">'+safe(sub.error.message)+'</p>';
  else subRoot.innerHTML=sub.data.length?sub.data.map(x=>'<article class="item"><div><h3>'+safe(x.listing_name)+'</h3><p>'+safe(x.category)+' · '+safe(x.listing_type)+' · '+safe(x.contact_name)+' · '+safe(x.contact_email)+' · '+safe(x.status)+'</p><p>'+safe(x.description)+'</p></div><div class="item-actions">'+(x.status==='received'?'<button class="secondary" data-directory-convert="'+x.id+'">Crear ficha</button><button class="secondary" data-directory-reject="'+x.id+'">Descartar</button>':'')+'</div></article>').join(""):'<p class="muted">No hay solicitudes pendientes.</p>';
  if(items.error)listRoot.innerHTML='<p class="muted">'+safe(items.error.message)+'</p>';
  else listRoot.innerHTML=items.data.length?items.data.map(x=>'<article class="item"><div><h3>'+safe(x.name)+'</h3><p>'+safe(x.category)+' · '+safe(x.city)+' · '+safe(x.status)+(x.sponsored?' · Patrocinado':'')+'</p></div><div class="item-actions"><button type="button" class="secondary" data-directory-edit="'+x.id+'">Editar</button><button class="secondary" data-directory-toggle="'+x.id+'" data-status="'+x.status+'">'+(x.status==='published'?'Retirar':'Publicar')+'</button><button class="secondary" data-directory-delete="'+x.id+'">Eliminar</button></div></article>').join(""):'<p class="muted">Todavía no hay fichas creadas.</p>';
}
async function handleDirectoryAction(e){
 const b=e.target.closest("button");if(!b)return;
 if(b.dataset.directoryEdit){
  const {data:item,error}=await client.from("directory_listings").select("*").eq("id",b.dataset.directoryEdit).single();
  if(error){say("globalMessage","No se pudo abrir la ficha: "+error.message);return;}
  openDirectoryEdit(item);return;
 }
 if(b.dataset.directoryConvert){
  const {data:s,error}=await client.from("directory_submissions").select("*").eq("id",b.dataset.directoryConvert).single();
  if(error){say("globalMessage",error.message);return;}
  const slug=slugify(s.listing_name)+"-"+Math.random().toString(36).slice(2,7);
  const payload={name:s.listing_name,slug,category:s.category,listing_type:s.listing_type,description:s.description,address:s.address,postcode:s.postcode,phone:s.phone,email:s.contact_email,website:s.website,status:"draft",city:"London"};
  const {data:item,error:insertError}=await client.from("directory_listings").insert(payload).select("id").single();
  if(insertError){say("globalMessage","No se pudo crear la ficha: "+insertError.message);return;}
  const {error:updateError}=await client.from("directory_submissions").update({status:"converted",listing_id:item.id}).eq("id",s.id);
  say("globalMessage",updateError?"Ficha creada, pero no se pudo actualizar la solicitud: "+updateError.message:"Ficha creada como borrador. Verifica sus datos y publícala cuando esté lista.");
  await loadDirectoryAdmin();return;
 }
 if(b.dataset.directoryReject){
  const {error}=await client.from("directory_submissions").update({status:"rejected"}).eq("id",b.dataset.directoryReject);
  say("globalMessage",error?error.message:"Solicitud descartada.");await loadDirectoryAdmin();return;
 }
 if(b.dataset.directoryToggle){
  const next=b.dataset.status==="published"?"draft":"published";
  const {error}=await client.from("directory_listings").update({status:next,verified_at:next==="published"?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq("id",b.dataset.directoryToggle);
  say("globalMessage",error?error.message:(next==="published"?"Ficha publicada.":"Ficha retirada de la web."));await loadDirectoryAdmin();return;
 }
 if(b.dataset.directoryDelete&&window.confirm("¿Eliminar definitivamente esta ficha?")){
  const {error}=await client.from("directory_listings").delete().eq("id",b.dataset.directoryDelete);
  say("globalMessage",error?error.message:"Ficha eliminada.");await loadDirectoryAdmin();
 }
}


let adCampaigns=[];
const adPreviewExamples={
 banner:{title:"Banner web / Web banner",className:"preview-banner",brand:"EcoEnergy",headline:"Energía limpia para un futuro sostenible",english:"Clean energy for a sustainable future",cta:"Conoce más / Learn more",note:"Franja horizontal situada en la parte superior del sitio."},
 homepage:{title:"Portada / Homepage featured",className:"preview-homepage",brand:"GreenBuild",headline:"Ciudades más verdes e inteligentes",english:"Greener and smarter cities",cta:"Descubre más / Discover more",note:"Anuncio destacado integrado en la portada junto al contenido editorial."},
 sidebar:{title:"Columna lateral / Sidebar",className:"preview-sidebar",brand:"CloudNet",headline:"Tecnología en la nube para impulsar tu negocio",english:"Cloud technology to grow your business",cta:"Solicita una demo / Request a demo",note:"Pieza vertical para la barra lateral de artículos y secciones."},
 article:{title:"Artículo / In-article",className:"preview-article",brand:"AI Solutions",headline:"Inteligencia artificial para empresas",english:"Artificial intelligence for business",cta:"Conoce más / Learn more",note:"Creatividad insertada entre párrafos dentro de una noticia."},
 print:{title:"Edición impresa / Print edition",className:"preview-print",brand:"EcoMobility",headline:"Movilidad limpia para ciudades más humanas",english:"Clean mobility for more liveable cities",cta:"Más información / More information",note:"Anuncio de página completa para edición impresa o PDF."},
 sponsored:{title:"Artículo patrocinado / Sponsored article",className:"preview-sponsored",brand:"EcoIndustry",headline:"Cómo la innovación sostenible transforma la industria",english:"How sustainable innovation is transforming industry",cta:"Leer más / Read more",note:"Contenido comercial con identificación visible de patrocinio."}
};
function renderAdPlacementPreview(){
 const placement=$("adPlacement")?.value||"banner";
 const sample=adPreviewExamples[placement]||adPreviewExamples.banner;
 const root=$("adPlacementPreview");
 if(!root)return;
 $("adPreviewTitle").textContent=sample.title;
 root.className="ad-preview-card "+sample.className;
 root.innerHTML='<div class="ad-preview-art" aria-hidden="true"><span class="ad-preview-orbit"></span><span class="ad-preview-leaf">✦</span><span class="ad-preview-city">E</span></div><div class="ad-preview-copy"><span class="ad-preview-brand">'+safe(sample.brand)+'</span><strong>'+safe(sample.headline)+'</strong><span class="ad-preview-en">'+safe(sample.english)+'</span><span class="ad-preview-cta">'+safe(sample.cta)+' →</span><small>'+safe(sample.note)+'</small></div>';
}
function adStatusText(s){return ({draft:"Borrador",pending:"Pendiente",active:"Activa",paused:"Pausada",completed:"Finalizada",cancelled:"Cancelada",unpaid:"Sin pagar",paid:"Pagado",overdue:"Vencido",waived:"Exento"})[s]||s;}
function editAd(a){
 $("adForm").hidden=false;$("adId").value=a?.id||"";$("adAdvertiser").value=a?.advertiser_name||"";$("adContact").value=a?.contact_name||"";$("adEmail").value=a?.contact_email||"";$("adPhone").value=a?.contact_phone||"";$("adTitle").value=a?.campaign_title||"";$("adPlacement").value=a?.placement||"banner";renderAdPlacementPreview();$("adStatus").value=a?.status||"draft";$("adCreative").value=a?.creative_url||"";$("adTarget").value=a?.target_url||"";$("adStart").value=a?.start_date||"";$("adEnd").value=a?.end_date||"";$("adAmount").value=a?.amount??0;$("adCurrency").value=a?.currency||"GBP";$("adPayment").value=a?.payment_status||"unpaid";$("adInvoice").value=a?.invoice_reference||"";$("adNotes").value=a?.internal_notes||"";$("adForm").scrollIntoView({behavior:"smooth",block:"start"});
}
async function loadAds(){
 const campaignRoot=$("adCampaignList"),enquiryRoot=$("adEnquiryList"),statsRoot=$("adStats");
 if(!campaignRoot||!enquiryRoot||!statsRoot)return;
 campaignRoot.innerHTML='<p class="muted">Cargando campañas…</p>';
 enquiryRoot.innerHTML='<p class="muted">Cargando solicitudes comerciales…</p>';
 const [c,e]=await Promise.all([
  client.from("ad_campaigns").select("*").order("created_at",{ascending:false}),
  client.from("ad_enquiries").select("*").order("created_at",{ascending:false})
 ]);
 adCampaigns=c.data||[];
 if(c.error){
  campaignRoot.innerHTML='<p class="muted">No se pudieron cargar las campañas: '+safe(c.error.message)+'</p>';
  statsRoot.innerHTML="";
 }else{
  const stats=[["Campañas",adCampaigns.length],["Activas",adCampaigns.filter(x=>x.status==="active").length],["Pagadas",adCampaigns.filter(x=>x.payment_status==="paid").length],["Por cobrar",adCampaigns.filter(x=>["unpaid","pending","overdue"].includes(x.payment_status)).length]];
  statsRoot.innerHTML=stats.map(([t,n])=>'<div class="course-stat"><strong>'+n+'</strong><span>'+t+'</span></div>').join("");
  campaignRoot.innerHTML=adCampaigns.length?adCampaigns.map(a=>'<article class="item ad-item"><div><h3>'+safe(a.campaign_title)+'</h3><p>'+safe(a.advertiser_name)+' · '+safe(a.placement)+' · '+safe(adStatusText(a.status))+'</p><p>'+safe(a.amount)+' '+safe(a.currency)+' · Pago: '+safe(adStatusText(a.payment_status))+(a.invoice_reference?' · Factura: '+safe(a.invoice_reference):'')+'</p><p>'+safe(a.start_date||"Sin inicio")+' → '+safe(a.end_date||"Sin fin")+'</p></div><div class="item-actions"><button class="secondary" data-ad-edit="'+a.id+'">Editar</button><button class="secondary" data-ad-delete="'+a.id+'">Eliminar</button></div></article>').join(""):'<p class="muted">Todavía no hay campañas.</p>';
  campaignRoot.querySelectorAll("[data-ad-edit]").forEach(b=>b.addEventListener("click",()=>editAd(adCampaigns.find(a=>a.id===b.dataset.adEdit))));
  campaignRoot.querySelectorAll("[data-ad-delete]").forEach(b=>b.addEventListener("click",async()=>{const a=adCampaigns.find(x=>x.id===b.dataset.adDelete);if(!a||!confirm("¿Eliminar esta campaña?"))return;const r=await client.from("ad_campaigns").delete().eq("id",a.id);if(r.error){say("globalMessage",r.error.message);return;}await loadAds();}));
 }
 if(e.error){
  enquiryRoot.innerHTML='<p class="muted">No se pudieron cargar las solicitudes: '+safe(e.error.message)+'</p>';
 }else{
  const enquiries=e.data||[];
  enquiryRoot.innerHTML=enquiries.length?enquiries.map(x=>'<article class="item"><div><h3>'+safe(x.company_name)+'</h3><p>'+safe(x.contact_name)+' · '+safe(x.email)+' · '+safe(x.placement_interest||"Formato no indicado")+'</p><p>'+safe(x.message)+'</p><p>Estado: '+safe(x.status)+' · '+new Date(x.created_at).toLocaleString("es-GB")+'</p></div></article>').join(""):'<p class="muted">No hay solicitudes comerciales.</p>';
 }
}
async function saveAd(event){
 event.preventDefault();const id=$("adId").value,amount=Number($("adAmount").value);
 const p={advertiser_name:$("adAdvertiser").value.trim(),contact_name:$("adContact").value.trim()||null,contact_email:$("adEmail").value.trim(),contact_phone:$("adPhone").value.trim()||null,campaign_title:$("adTitle").value.trim(),placement:$("adPlacement").value,status:$("adStatus").value,creative_url:$("adCreative").value.trim()||null,target_url:$("adTarget").value.trim()||null,start_date:$("adStart").value||null,end_date:$("adEnd").value||null,amount,currency:$("adCurrency").value,payment_status:$("adPayment").value,invoice_reference:$("adInvoice").value.trim()||null,internal_notes:$("adNotes").value.trim()||null,updated_at:new Date().toISOString()};
 if(!p.advertiser_name||!p.contact_email||!p.campaign_title||!Number.isFinite(amount)||amount<0){say("adMessage","Revisa los campos obligatorios y el importe.");return;}if(p.start_date&&p.end_date&&p.end_date<p.start_date){say("adMessage","La fecha final no puede ser anterior al inicio.");return;}
 const r=id?await client.from("ad_campaigns").update(p).eq("id",id):await client.from("ad_campaigns").insert(p);if(r.error){say("adMessage",r.error.message);return;}say("adMessage","Campaña guardada.");$("adForm").hidden=true;$("adForm").reset();$("adId").value="";await loadAds();
}

function wire(){
  $("maintenanceToggleBtn").addEventListener("click",toggleMaintenance);
  $("loginForm").addEventListener("submit",login);
  $("logoutBtn").addEventListener("click",()=>client.auth.signOut());
  $("newArticleBtn").addEventListener("click",()=>editArticle(null));
  $("articleSearch").addEventListener("input",filterArticles);
  $("articleStatusFilter").addEventListener("change",filterArticles);
  $("cancelEdit").addEventListener("click",()=>$("articleForm").hidden=true);
  $("articleForm").addEventListener("submit",e=>{e.preventDefault();saveArticle("draft");});
  $("submitReviewBtn").addEventListener("click",()=>saveArticle("pending"));
  $("approveArticleBtn").addEventListener("click",()=>saveArticle("approved"));
  $("publishArticleBtn").addEventListener("click",()=>saveArticle("published"));$("saveChangesBtn").addEventListener("click",()=>saveArticle(null,true));
  $("sourceForm").addEventListener("submit",addSource);
  $("refreshSourcesBtn")?.addEventListener("click",loadSources);
  $("refreshSubmissionsBtn").addEventListener("click",loadSubmissions);
  $("refreshDirectoryBtn").addEventListener("click",loadDirectoryAdmin);
  $("refreshCoursesBtn").addEventListener("click",loadCourses);
  $("exportCoursesBtn").addEventListener("click",exportCoursesCsv);
  $("courseSearch").addEventListener("input",filterCourses);
  $("courseStatusFilter").addEventListener("change",filterCourses);
  $("courseEnquiryList").addEventListener("change",e=>{const select=e.target.closest(".course-card-status");if(select)updateCourseStatus(select.dataset.courseId,select.value);});
  $("courseEnquiryList").addEventListener("click",e=>{
   const b=e.target.closest("button");if(!b)return;
   if(b.dataset.saveCourseNotes){saveCourseNotes(b.dataset.saveCourseNotes);return;}
   if(b.dataset.discardCourse){discardCourse(b.dataset.discardCourse);return;}
   if(b.dataset.deleteCourse){deleteCourse(b.dataset.deleteCourse);return;}
  });
  $("directorySubmissionList").addEventListener("click",handleDirectoryAction);
  $("directoryAdminList").addEventListener("click",handleDirectoryAction);
  $("submissionsList").addEventListener("click",handleSubmissionAction);
  $("uploadImageBtn").addEventListener("click",uploadArticleImage);
  $("refreshInboxBtn").addEventListener("click",loadInbox);
  $("inboxList").addEventListener("click",async e=>{
    const draftButton=e.target.closest("[data-draft]");
    const openArticleButton=e.target.closest("[data-open-article]");
    const rejectButton=e.target.closest("[data-reject]");
    if(openArticleButton){
      const {data:article,error}=await client.from("articles").select("*").eq("id",openArticleButton.dataset.openArticle).single();
      if(error){say("globalMessage","No se pudo abrir el borrador: "+error.message);return;}
      editArticle(article);
      document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.tab==="articles"));
      ["articles","inbox","sources","submissions","directory"].forEach(k=>$(k+"Tab").hidden=k!=="articles");
      return;
    }
    if(draftButton){
      const {data:item,error}=await client.from("imported_items").select("*").eq("id",draftButton.dataset.draft).single();
      if(error){say("globalMessage","No se pudo abrir la noticia: "+error.message);return;}
      editArticle(null);
      $("title").value=item.title||"";
      // The RSS text is retained only as research material inside the private draft.
      // Never place a third-party excerpt in the public summary field.
      const rssNote=(item.summary||"").trim();
      const guess=editorialSuggestion(item);
      const allowedCategories=["Internacional","Política","Economía","Seguridad","Tecnología","Opinión","Clima","Sociedad"];
      const suggested=item.suggested_category||guess.category;
      $("summary").value="";
      $("category").value=allowedCategories.includes(suggested)?suggested:"Internacional";
      $("country").value=item.country||guess.country;
      $("region").value=item.region||guess.region;
      $("language").value="es";
      $("summaryEn").value="";
      $("contentEn").value="";
      const {data:source}=await client.from("rss_sources").select("name").eq("id",item.source_id).maybeSingle();
      $("sourceTitle").value=source?.name||"";
      $("sourceUrl").value=item.article_url||"";
      $("author").value="Evoford News";
      const sourceNote=rssNote||"El feed no ofrece un extracto. Lee la fuente original y toma tus propias notas.";
      $("content").value=[
        "HOJA DE TRABAJO EDITORIAL · NO PUBLICAR SIN REVISIÓN",
        "",
        "FUENTE DE DETECCIÓN",
        "Medio: "+(source?.name||"Fuente RSS"),
        "Enlace: "+(item.article_url||""),
        "Fecha de la noticia: "+(item.published_at||"Por verificar"),
        "",
        "NOTA DEL RSS (MATERIAL DE CONSULTA; NO ES TEXTO DE EVOFORD)",
        sourceNote,
        "",
        "1. HECHOS QUE DEBES CONFIRMAR",
        "• ¿Qué ha ocurrido exactamente?",
        "• ¿Quién lo confirma y qué documento o declaración primaria existe?",
        "• ¿Cuándo y dónde ocurrió?",
        "• ¿Qué cifras, nombres o afirmaciones necesitan una segunda comprobación?",
        "",
        "2. CONTRASTE Y CONTEXTO",
        "• Segunda fuente independiente:",
        "• Documento o fuente primaria:",
        "• Antecedentes necesarios para entender el asunto:",
        "• Qué información falta o no se ha podido verificar:",
        "",
        "3. ENFOQUE PROPIO DE EVOFORD",
        "• ¿Por qué importa a nuestros lectores?",
        "• ¿Qué aporta este artículo que no ofrece la fuente original?",
        "• ¿A quién afecta y cuáles son las consecuencias?",
        "",
        "4. REDACCIÓN ORIGINAL",
        "Escribe aquí una pieza propia. Atribuye las declaraciones y enlaza las fuentes. No copies ni traduzcas el texto de terceros.",
        "",
        "5. REVISIÓN ANTES DE ENVIAR",
        "• Titular fiel a los hechos.",
        "• Datos y citas comprobados.",
        "• Contexto suficiente y lenguaje neutral.",
        "• Fuentes enlazadas y atribuidas.",
        "• Resumen público redactado por Evoford en su campo correspondiente.",
        "",
        "ESTADO: borrador interno. La importación RSS no autoriza la publicación."
      ].join("\n");
      say("editorMessage","Hoja editorial preparada. El extracto RSS queda identificado como material de consulta y no se ha copiado al resumen público. Completa la verificación y redacta el artículo original antes de enviarlo a revisión.");
      document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.tab==="articles"));
      ["articles","inbox","sources","submissions","directory","courses"].forEach(k=>$(k+"Tab").hidden=k!=="articles");
      $("articleForm").scrollIntoView({behavior:"smooth",block:"start"});
      return;
    }
    if(rejectButton){
      const {error}=await client.from("imported_items").update({status:"rejected"}).eq("id",rejectButton.dataset.reject);
      if(error)say("globalMessage",error.message);
      await loadInbox();
    }
  });
  $("runRssBtn").addEventListener("click",runRssImport);$("newAdBtn").addEventListener("click",()=>editAd(null));$("cancelAdBtn").addEventListener("click",()=>{$("adForm").hidden=true;});$("cancelAdBtn2").addEventListener("click",()=>{$("adForm").hidden=true;});$("adForm").addEventListener("submit",saveAd);$("adPlacement").addEventListener("change",renderAdPlacementPreview);
  document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t===b));
    ["articles","inbox","sources","submissions","directory","courses","ads"].forEach(k=>$(k+"Tab").hidden=k!==b.dataset.tab);
    if(b.dataset.tab==="directory")loadDirectoryAdmin();
    if(b.dataset.tab==="courses")loadCourses();if(b.dataset.tab==="ads")loadAds();
  }));
}
window.addEventListener("error",event=>{
  const target=$("loginMessage");
  if(target) target.textContent="Error al cargar el panel: "+(event.message||"error de JavaScript");
});
document.addEventListener("DOMContentLoaded",()=>{
  try{
    wire();
    init();
  }catch(error){
    console.error("Evoford News startup:",error);
    say("loginMessage","No se pudo iniciar el panel: "+(error?.message||"error inesperado"));
  }
});
