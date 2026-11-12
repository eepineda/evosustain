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

function editorialGate(payload){
  const author=String(payload.author||"").trim();
  const body=String(payload.content||"").replace(/\\n/g," ").replace(/<[^>]*>/g," ").trim();
  if(!author) return "Falta identificar al autor. No atribuyas una noticia importada a una persona que no la haya redactado.";
  if(body.length<500) return "El artículo necesita al menos 500 caracteres de texto propio para poder aprobarse.";
  if(/borrador editorial|redacta aquí|no copies literalmente|fuente consultada:|fuente original:/i.test(body)) return "El texto todavía contiene instrucciones o una referencia de fuente. Sustitúyelas por una redacción propia.";
  if(payload.source_url&&!payload.source_title) return "Indica el nombre del medio original para mostrar correctamente su enlace.";
  return "";
}

async function init(){
  try{
    say("loginMessage","Conectando con el servicio de acceso…");
    if(!window.supabase){
      say("loginMessage","No se ha cargado la biblioteca de acceso de Supabase. Recarga la página.");
      return;
    }
    client = window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
    const {data,error}=await client.auth.getSession();
    if(error) throw error;
    if(data?.session) await showApp(data.session.user);
    client.auth.onAuthStateChange(async (_event,session)=> {
      if(session) await showApp(session.user);
      else showLogin();
    });
    if(!data?.session) say("loginMessage","");
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
  await Promise.all([loadArticles(),loadInbox(),loadSources()]);
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
async function loadArticles(){
  const {data,error}=await client.from("articles").select("*").order("created_at",{ascending:false});
  if(error){$("articleList").innerHTML=`<p class="muted">${safe(error.message)}</p>`;return;}
  $("articleList").innerHTML=data.length?data.map(a=>`<article class="item"><div><h3>${safe(a.title)}</h3><p>${safe(a.category)} · ${safe(a.author)} · <span class="pill">${safe(({draft:"Borrador",pending:"En revisión",approved:"Aprobado",published:"Publicado",rejected:"Descartado"})[a.status]||a.status)}</span></p></div><div class="item-actions"><button class="secondary" data-edit="${a.id}">Editar</button>${a.status!=="published"?`<button class="secondary" data-discard="${a.id}">Descartar</button>`:""}<button class="secondary" data-delete="${a.id}">Eliminar</button></div></article>`).join(""):'<p class="muted">Todavía no hay artículos.</p>';
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
  $("articleId").value=a?.id||"";$("publishArticleBtn").hidden=!(a?.status==="approved");$("saveChangesBtn").hidden=!a;$("title").value=a?.title||"";$("category").value=a?.category||"Internacional";
  $("author").value=a?.author||"";$("summary").value=a?.summary||"";
  $("content").value=a?.content||"";$("imageUrl").value=a?.image_url||"";$("imageFile").value="";$("imagePreview").src=a?.image_url||"";$("imagePreview").hidden=!a?.image_url;say("imageMessage","");$("country").value=a?.country||"";$("region").value=a?.region||"";$("language").value=a?.language||"es";$("summaryEn").value=a?.summary_en||"";$("contentEn").value=a?.content_en||"";$("sourceTitle").value=a?.source_title||"";$("sourceUrl").value=a?.source_url||"";
  $("articleForm").scrollIntoView({behavior:"smooth",block:"start"});
}
async function saveArticle(status,preserveStatus=false){
  const title=$("title").value.trim(),content=$("content").value.trim();
  if(!title||!content){say("editorMessage","El titular y el texto son obligatorios.");return;}
  const id=$("articleId").value;
  const sourceUrl=$("sourceUrl").value.trim();if(sourceUrl&&!/^https:\/\//i.test(sourceUrl)){say("editorMessage","El enlace de la fuente debe comenzar por https://.");return;}const payload={title,slug:slugify(title),category:$("category").value,author:$("author").value.trim()||null,summary:$("summary").value.trim(),content,image_url:$("imageUrl").value.trim()||null,country:$("country").value.trim()||null,region:$("region").value.trim()||null,language:$("language").value,summary_en:$("summaryEn").value.trim(),content_en:$("contentEn").value.trim(),source_title:$("sourceTitle").value.trim()||null,source_url:sourceUrl?sourceUrl.replace(/[?&]utm_[^&]+/g,"").replace(/[?&]$/,""):null,status,updated_at:new Date().toISOString()};if(preserveStatus){if(!id){say("editorMessage","No hay un artículo existente que actualizar.");return;}const {data:current,error:statusError}=await client.from("articles").select("status,slug").eq("id",id).single();if(statusError){say("editorMessage","No se pudo conservar el estado: "+statusError.message);return;}payload.status=current.status;payload.slug=current.slug;}
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
    const details=failed.map(x=>`• ${x.source}: ${x.error}`).join("\\n");
    const skipped=results.reduce((n,x)=>n+Number(x.skipped||0),0);
    const summary=`Proceso terminado: ${imported} noticias nuevas de ${checked} fuentes; ${skipped} elementos omitidos.`;
    say("rssRunMessage",failed.length?summary+"\\nErrores por fuente:\\n"+details:summary+"\\nSin errores de fuente.");
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
  const [{data,error},{data:sources}] = await Promise.all([
    client.from("imported_items").select("*").order("created_at",{ascending:false}),
    client.from("rss_sources").select("id,name,category")
  ]);
  if(error){$("inboxList").innerHTML=`<p class="muted">${safe(error.message)}</p>`;return;}
  const sourceMap=new Map((sources||[]).map(source=>[String(source.id),source]));
  $("inboxList").innerHTML=data.length?data.map(n=>{
    const source=sourceMap.get(String(n.source_id));
    const guess=editorialSuggestion(n);
    const suggested=n.suggested_category||guess.category;
    const country=n.country||guess.country;
    const region=n.region||guess.region;
    return `<article class="item"><div><h3>${safe(n.title)}</h3><p>${safe(source?.name||"Fuente RSS")} · Sección sugerida: ${safe(suggested)} · <a href="${safe(n.article_url)}" target="_blank" rel="noopener noreferrer">Consultar fuente original</a> · <span class="pill">${safe(n.status)}</span></p>${n.summary?`<p class="rss-extract"><strong>Extracto disponible del RSS (${n.summary.length} caracteres):</strong> ${safe(n.summary)}</p><p class="muted">Este texto es material de consulta de la fuente; no cuenta como redacción propia para aprobar.</p>`:"<p class=\"muted\">El RSS no proporciona un extracto de texto.</p>"}<p>Clasificación orientativa: ${safe(country||"País por verificar")} · ${safe(region||"Región por verificar")}</p></div><div class="item-actions"><button type="button" class="secondary" data-draft="${n.id}">Preparar borrador manual</button><button class="secondary" data-reject="${n.id}">Descartar</button></div></article>`;
  }).join(""):'<p class="muted">No hay noticias importadas. Añade fuentes RSS activas e inicia una importación.</p>';
}
async function loadSources(){
  const {data,error}=await client.from("rss_sources").select("*").order("created_at",{ascending:false});
  if(error){$("sourceList").innerHTML=`<p class="muted">${safe(error.message)}</p>`;return;}
  $("sourceList").innerHTML=data.length?data.map(s=>`<article class="item"><div><h3>${safe(s.name)}</h3><p>${safe(s.feed_url)} · ${safe(s.category||"General")} · ${s.active?"Activa":"Pausada"}</p></div><div class="item-actions"><button type="button" class="secondary" data-edit-source="${safe(s.id)}">Editar</button><button type="button" class="secondary" data-toggle-source="${safe(s.id)}">${s.active?"Pausar":"Activar"}</button><button type="button" class="secondary" data-delete-source="${safe(s.id)}">Eliminar fuente</button></div></article>`).join(""):'<p class="muted">Aún no hay fuentes RSS configuradas.</p>';
  $("sourceList").querySelectorAll("[data-toggle-source]").forEach(button=>button.addEventListener("click",async()=>{
    const source=data.find(s=>String(s.id)===button.dataset.toggleSource);
    if(!source)return;
    button.disabled=true;
    const {error}=await client.from("rss_sources").update({active:!source.active}).eq("id",source.id);
    if(error){say("sourceMessage","No se pudo cambiar el estado: "+error.message);button.disabled=false;return;}
    say("sourceMessage",source.active?"Fuente pausada. No se consultará en próximas importaciones.":"Fuente activada. Volverá a consultarse en próximas importaciones.");
    await loadSources();
  }));
  $("sourceList").querySelectorAll("[data-edit-source]").forEach(button=>button.addEventListener("click",async()=>{
    const source=data.find(s=>String(s.id)===button.dataset.editSource);
    if(!source)return;
    const name=window.prompt("Nombre del medio:",source.name);
    if(name===null)return;
    const feedUrl=window.prompt("URL del feed RSS:",source.feed_url);
    if(feedUrl===null)return;
    const category=window.prompt("Sección:",source.category||"General");
    if(category===null)return;
    const cleanName=name.trim(),cleanUrl=feedUrl.trim(),cleanCategory=category.trim()||"General";
    if(!cleanName){say("sourceMessage","El nombre del medio no puede estar vacío.");return;}
    let parsedUrl;
    try{parsedUrl=new URL(cleanUrl);}catch{say("sourceMessage","La URL del feed no es válida.");return;}
    if(!["https:","http:"].includes(parsedUrl.protocol)){say("sourceMessage","El feed debe usar http:// o https://.");return;}
    button.disabled=true;
    const {error}=await client.from("rss_sources").update({name:cleanName,feed_url:cleanUrl,category:cleanCategory}).eq("id",source.id);
    if(error){say("sourceMessage","No se pudo actualizar la fuente: "+error.message);button.disabled=false;return;}
    say("sourceMessage","Fuente actualizada. La nueva dirección se utilizará en próximas importaciones.");
    await loadSources();
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
function wire(){
  $("loginForm").addEventListener("submit",login);
  $("logoutBtn").addEventListener("click",()=>client.auth.signOut());
  $("newArticleBtn").addEventListener("click",()=>editArticle(null));
  $("cancelEdit").addEventListener("click",()=>$("articleForm").hidden=true);
  $("articleForm").addEventListener("submit",e=>{e.preventDefault();saveArticle("draft");});
  $("submitReviewBtn").addEventListener("click",()=>saveArticle("pending"));
  $("approveArticleBtn").addEventListener("click",()=>saveArticle("approved"));
  $("publishArticleBtn").addEventListener("click",()=>saveArticle("published"));$("saveChangesBtn").addEventListener("click",()=>saveArticle(null,true));
  $("sourceForm").addEventListener("submit",addSource);
  $("uploadImageBtn").addEventListener("click",uploadArticleImage);
  $("refreshInboxBtn").addEventListener("click",loadInbox);
  $("inboxList").addEventListener("click",async e=>{
    const draftButton=e.target.closest("[data-draft]");
    const rejectButton=e.target.closest("[data-reject]");
    if(draftButton){
      const {data:item,error}=await client.from("imported_items").select("*").eq("id",draftButton.dataset.draft).single();
      if(error){say("globalMessage","No se pudo abrir la noticia: "+error.message);return;}
      editArticle(null);
      $("title").value=item.title||"";
      $("summary").value=item.summary||"";
      const guess=editorialSuggestion(item);
      const allowedCategories=["Internacional","Política","Economía","Seguridad","Tecnología","Opinión","Clima","Sociedad"];
      const suggested=item.suggested_category||guess.category;
      $("category").value=allowedCategories.includes(suggested)?suggested:"Internacional";
      $("country").value=item.country||guess.country;
      $("region").value=item.region||guess.region;
      $("language").value="es";
      $("summaryEn").value="";
      $("contentEn").value="";
      const {data:source}=await client.from("rss_sources").select("name").eq("id",item.source_id).maybeSingle();
      $("sourceTitle").value=source?.name||"";
      $("sourceUrl").value=item.article_url||"";
      $("author").value="";
      $("content").value="[BORRADOR EDITORIAL: verifica la información y redacta una noticia original. No reproduzcas el artículo original.]\\n\\nFuente consultada: "+(item.article_url||"");
      say("editorMessage","Borrador manual iniciado. Verifica la noticia, clasifícala y redacta las versiones en español e inglés.");
      document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.tab==="articles"));
      ["articles","inbox","sources"].forEach(k=>$(k+"Tab").hidden=k!=="articles");
      $("articleForm").scrollIntoView({behavior:"smooth",block:"start"});
      return;
    }
    if(rejectButton){
      const {error}=await client.from("imported_items").update({status:"rejected"}).eq("id",rejectButton.dataset.reject);
      if(error)say("globalMessage",error.message);
      await loadInbox();
    }
  });
  $("runRssBtn").addEventListener("click",runRssImport);
  document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t===b));
    ["articles","inbox","sources"].forEach(k=>$(k+"Tab").hidden=k!==b.dataset.tab);
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
