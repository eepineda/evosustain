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

async function init(){
  if(!window.supabase || SUPABASE_PUBLISHABLE_KEY.startsWith("PASTE_")){
    say("loginMessage","Falta configurar la clave publishable de Supabase en admin.js.");
    return;
  }
  client = window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
  const {data:{session}} = await client.auth.getSession();
  if(session) await showApp(session.user);
  client.auth.onAuthStateChange(async (_event,session)=> {
    if(session) await showApp(session.user);
    else showLogin();
  });
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
  e.preventDefault(); say("loginMessage","Enviando enlace seguro…");
  const email=$("email").value.trim().toLowerCase();
  if(email!==ADMIN_EMAIL){say("loginMessage","Correo no autorizado.");return;}
  const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:"https://evoford.com/news/admin/"}});
  say("loginMessage",error?error.message:"Revisa tu correo y abre el enlace de acceso en este mismo navegador.");
}
async function loadArticles(){
  const {data,error}=await client.from("articles").select("*").order("created_at",{ascending:false});
  if(error){$("articleList").innerHTML=`<p class="muted">${safe(error.message)}</p>`;return;}
  $("articleList").innerHTML=data.length?data.map(a=>`<article class="item"><div><h3>${safe(a.title)}</h3><p>${safe(a.category)} · ${safe(a.author)} · <span class="pill">${safe(a.status)}</span></p></div><div class="item-actions"><button class="secondary" data-edit="${a.id}">Editar</button></div></article>`).join(""):'<p class="muted">Todavía no hay artículos.</p>';
  $("articleList").querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>editArticle(data.find(a=>a.id===b.dataset.edit))));
}
function editArticle(a){
  $("articleForm").hidden=false;$("formHeading").textContent=a?"Editar artículo":"Nuevo artículo";
  $("articleId").value=a?.id||"";$("title").value=a?.title||"";$("category").value=a?.category||"Internacional";
  $("author").value=a?.author||"EDWIN PINEDA CARRASCO";$("summary").value=a?.summary||"";
  $("content").value=a?.content||"";$("imageUrl").value=a?.image_url||"";$("country").value=a?.country||"";$("region").value=a?.region||"";$("language").value=a?.language||"es";$("summaryEn").value=a?.summary_en||"";$("contentEn").value=a?.content_en||"";
  $("articleForm").scrollIntoView({behavior:"smooth",block:"start"});
}
async function saveArticle(status){
  const title=$("title").value.trim(),content=$("content").value.trim();
  if(!title||!content){say("editorMessage","El titular y el texto son obligatorios.");return;}
  const id=$("articleId").value;
  const payload={title,slug:slugify(title),category:$("category").value,author:$("author").value.trim()||"EDWIN PINEDA CARRASCO",summary:$("summary").value.trim(),content,image_url:$("imageUrl").value.trim()||null,country:$("country").value.trim()||null,region:$("region").value.trim()||null,language:$("language").value,summary_en:$("summaryEn").value.trim(),content_en:$("contentEn").value.trim(),status,updated_at:new Date().toISOString()};
  if(status==="published"){say("editorMessage","La publicación directa está deshabilitada hasta conectar el servicio seguro de despliegue. Guarda como borrador o envía a revisión.");return;}
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
  say("editorMessage",error?error.message:(status==="pending"?"Artículo enviado a revisión.":"Borrador guardado."));
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
async function loadInbox(){
  const [{data,error},{data:sources}] = await Promise.all([
    client.from("imported_items").select("*").order("created_at",{ascending:false}),
    client.from("rss_sources").select("id,name,category")
  ]);
  if(error){$("inboxList").innerHTML=`<p class="muted">${safe(error.message)}</p>`;return;}
  const sourceMap=new Map((sources||[]).map(source=>[String(source.id),source]));
  $("inboxList").innerHTML=data.length?data.map(n=>{
    const source=sourceMap.get(String(n.source_id));
    const suggested=n.suggested_category||source?.category||"Internacional";
    return `<article class="item"><div><h3>${safe(n.title)}</h3><p>${safe(source?.name||"Fuente RSS")} · Sección sugerida: ${safe(suggested)} · <a href="${safe(n.article_url)}" target="_blank" rel="noopener noreferrer">Consultar fuente original</a> · <span class="pill">${safe(n.status)}</span></p>${n.summary?`<p>${safe(n.summary)}</p>`:""}${n.country||n.region?`<p>Clasificación: ${safe(n.country||"País por verificar")} · ${safe(n.region||"Región por verificar")}</p>`:""}</div><div class="item-actions"><button type="button" class="secondary" data-draft="${n.id}">Preparar borrador manual</button><button class="secondary" data-reject="${n.id}">Descartar</button></div></article>`;
  }).join(""):'<p class="muted">No hay noticias importadas. Añade fuentes RSS activas e inicia una importación.</p>';
}
async function loadSources(){
  const {data,error}=await client.from("rss_sources").select("*").order("created_at",{ascending:false});
  if(error){$("sourceList").innerHTML=`<p class="muted">${safe(error.message)}</p>`;return;}
  $("sourceList").innerHTML=data.length?data.map(s=>`<article class="item"><div><h3>${safe(s.name)}</h3><p>${safe(s.feed_url)} · ${safe(s.category||"General")} · ${s.active?"Activa":"Pausada"}</p></div></article>`).join(""):'<p class="muted">Aún no hay fuentes RSS configuradas.</p>';
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
  $("sourceForm").addEventListener("submit",addSource);
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
      const {data:source}=await client.from("rss_sources").select("category").eq("id",item.source_id).maybeSingle();
      const suggested=item.suggested_category||source?.category||"Internacional";
      const allowedCategories=["Internacional","Política","Economía","Seguridad","Tecnología","Opinión","Clima","Sociedad"];
      $("category").value=allowedCategories.includes(suggested)?suggested:"Internacional";
      $("country").value=item.country||"";
      $("region").value=item.region||"";
      $("language").value="es";
      $("summaryEn").value="";
      $("contentEn").value="";
      $("content").value="\n\nFuente original: "+(item.article_url||"")+"\n\nRedacta aquí una versión propia y verificada. No copies literalmente el artículo de origen.";
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
document.addEventListener("DOMContentLoaded",()=>{wire();init();});
