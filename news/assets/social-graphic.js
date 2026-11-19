(() => {
"use strict";
const $=id=>document.getElementById(id);
const canvas=$("sgCanvas");if(!canvas)return;
const ctx=canvas.getContext("2d"),W=1080,H=1350;
let articles=[],selected=null,photo=null,ready=false;
let language=localStorage.getItem("evoford-news-language")==="en"?"en":"es";
const copy={
 es:{eyebrow:"ESTUDIO EDITORIAL · EVOFORD NEWS",heading:"Crear portada para redes",intro:"Diseño de revista en formato vertical. Añade una fotografía y un titular; el diseño se compone automáticamente.",article:"Artículo o noticia",choose:"Selecciona una noticia publicada",none:"No hay noticias publicadas con fotografía",title:"Titular",titlePlaceholder:"Escribe el titular de la portada",subtitle:"Frase complementaria",optional:"(opcional)",subtitlePlaceholder:"Una frase breve para completar la historia",caption:"Texto para Facebook e Instagram",captionPlaceholder:"Texto que acompañará la imagen al publicarla",create:"Crear imagen",preview:"VISTA PREVIA · 4:5",download:"Descargar PNG",publish:"Publicar en Facebook e Instagram",resolution:"Alta resolución · 1080 × 1350 px",magazine:"CURRENT AFFAIRS MAGAZINE",strap:"NEWS · CULTURE · COMMUNITY · IDEAS",image:"IMAGEN DEL ARTÍCULO",footer:"Una mirada informada a la actualidad",countries:"REINO UNIDO  ·  ESPAÑA  ·  REPÚBLICA DOMINICANA",captionLead:"Lee la noticia completa en EVOFORD NEWS",statusCreated:"Portada creada. Puedes descargarla o publicarla en Facebook e Instagram.",confirm:"¿Confirmas publicar esta portada y su texto en Facebook e Instagram?",publishing:"Subiendo la portada y enviando a las redes sociales…",published:"Resultado: ",selectFirst:"Selecciona primero una noticia.",noPhoto:"La noticia seleccionada no tiene una fotografía exportable.",noTitle:"La noticia no tiene titular.",modified:"Has modificado el texto. Vuelve a crear la imagen.",downloaded:"PNG descargado en 1080 × 1350 píxeles.",writing:"Publicando…",chooseOne:"Selecciona una noticia publicada"},
 en:{eyebrow:"EDITORIAL STUDIO · EVOFORD NEWS",heading:"Create a social media cover",intro:"A magazine-style vertical design. Choose a photo and headline; the layout is created automatically.",article:"Article or news story",choose:"Select a published story",none:"No published stories with photos available",title:"Headline",titlePlaceholder:"Enter the cover headline",subtitle:"Supporting line",optional:"(optional)",subtitlePlaceholder:"A short line to add context",caption:"Facebook and Instagram caption",captionPlaceholder:"Text that will accompany the image when published",create:"Create image",preview:"PREVIEW · 4:5",download:"Download PNG",publish:"Publish to Facebook and Instagram",resolution:"High resolution · 1080 × 1350 px",magazine:"CURRENT AFFAIRS MAGAZINE",strap:"NEWS · CULTURE · COMMUNITY · IDEAS",image:"ARTICLE IMAGE",footer:"An informed view of current affairs",countries:"UNITED KINGDOM  ·  SPAIN  ·  DOMINICAN REPUBLIC",captionLead:"Read the full story on EVOFORD NEWS",statusCreated:"Cover created. You can download it or publish it to Facebook and Instagram.",confirm:"Do you want to publish this cover and caption to Facebook and Instagram?",publishing:"Uploading the cover and sending it to social media…",published:"Result: ",selectFirst:"Please select a published story first.",noPhoto:"The selected story does not have an exportable image.",noTitle:"The story has no headline.",modified:"You changed the text. Create the image again.",downloaded:"PNG downloaded at 1080 × 1350 pixels.",writing:"Publishing…",chooseOne:"Select a published story"}
};
const t=()=>copy[language];
const dateText=()=>new Intl.DateTimeFormat(language==="en"?"en-GB":"es-ES",{day:"2-digit",month:"long",year:"numeric"}).format(new Date()).toUpperCase();
function wrap(text,max,font){ctx.font=font;const words=String(text||"").trim().split(/\s+/).filter(Boolean),out=[];let line="";for(const word of words){const test=line?line+" "+word:word;if(ctx.measureText(test).width>max&&line){out.push(line);line=word;}else line=test;}if(line)out.push(line);return out;}
function makeCaption(){const title=$("sgTitle").value.trim(),subtitle=$("sgSubtitle").value.trim();return language==="en"?"📰 "+title+"\\n\\n"+subtitle+"\\n\\n"+t().captionLead+": https://evoford.com/news\\n\\n#EvofordNews #News #CurrentAffairs":"📰 "+title+"\\n\\n"+subtitle+"\\n\\n"+t().captionLead+": https://evoford.com/news\\n\\n#EvofordNews #Actualidad #Noticias";}
function applyLanguage(){const d=t();const set=(id,value)=>{const el=$(id);if(el)el.textContent=value;};set("sgEyebrow",d.eyebrow);set("sgHeading",d.heading);set("sgIntro",d.intro);set("sgArticleLabel",d.article);set("sgTitleLabel",d.title);set("sgSubtitleLabel",d.subtitle);set("sgOptional",d.optional);set("sgCaptionLabel",d.caption);set("sgPreviewLabel",d.preview);set("sgCreate",d.create);set("sgDownload",d.download);set("sgPublish",d.publish);set("sgResolution",d.resolution);$("sgTitle").placeholder=d.titlePlaceholder;$("sgSubtitle").placeholder=d.subtitlePlaceholder;$("sgCaption").placeholder=d.captionPlaceholder;populate(articles);if(selected){$("sgTitle").value=language==="en"?(selected.title_en||selected.title_es||selected.title||""):(selected.title_es||selected.title||selected.title_en||"");$("sgSubtitle").value=language==="en"?(selected.summary_en||selected.summary_es||selected.summary||""):(selected.summary_es||selected.summary||selected.summary_en||"");$("sgCaption").value=makeCaption();}draw();}
function populate(list){
 const incoming=Array.isArray(list)?list:[];
 articles=incoming.filter(a=>a&&typeof a==="object"&&/^https:\/\//i.test(String(a.image_url||""))&&(a.title_es||a.title||a.title_en));
 const select=$("sgArticle");if(!select)return;const previousArticle=selected,previousValue=select.value,previousSlug=previousArticle?.slug||"",previousId=previousArticle?.id||"";
 select.innerHTML="";
 const first=document.createElement("option");first.value="";first.textContent=articles.length?t().choose:t().none;select.appendChild(first);
 articles.forEach((a,i)=>{const o=document.createElement("option");o.value=String(i);o.textContent=(language==="en"?(a.title_en||a.title_es||a.title):(a.title_es||a.title||a.title_en||"Sin titular")).slice(0,110);select.appendChild(o);});
 let nextIndex=articles.findIndex(a=>(previousId&&a.id===previousId)||(previousSlug&&a.slug===previousSlug));
 if(nextIndex<0&&previousValue!==""&&articles[Number(previousValue)])nextIndex=Number(previousValue);
 if(nextIndex>=0)select.value=String(nextIndex);
 if(!articles.length){selected=null;photo=null;ready=false;lockDownload();$("sgStatus").textContent=incoming.length?t().none:(language==="en"?"Loading published stories…":"Cargando noticias publicadas…");}
 else $("sgStatus").textContent=articles.length+(language==="en"?" stories with photos available.":" noticias con fotografía disponibles.");
}
async function loadArticlesFallback(){
 if(articles.length||!window.supabase?.createClient)return;
 try{
  const client=window.supabase.createClient("https://poywsdigujbarvnzbfnz.supabase.co","sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f");
  const {data:{session},error:sessionError}=await client.auth.getSession();
  if(sessionError)throw sessionError;
  if(!session){$("sgStatus").textContent=language==="en"?"Sign in with the authorised editorial account to load published stories.":"Inicia sesión con la cuenta editorial autorizada para cargar las noticias publicadas.";return;}
  const {data,error}=await client.functions.invoke("print-edition",{body:{action:"load"},headers:{Authorization:"Bearer "+session.access_token}});
  if(error)throw error;
  if(data?.error)throw new Error(data.error);
  const published=Array.isArray(data?.articles)?data.articles:[];
  populate(published);
  if(articles.length){
   $("sgStatus").textContent=articles.length+(language==="en"?" published stories with photos loaded.":" noticias publicadas con fotografía cargadas.");
   if(!selected){$("sgArticle").value="0";loadArticle();}
   return;
  }
  $("sgStatus").textContent=published.length?(language==="en"?"Published stories were found, but none has an exportable HTTPS photo.":"Se encontraron noticias publicadas, pero ninguna tiene una fotografía HTTPS exportable."):(language==="en"?"No published stories were returned.":"No se recibieron noticias publicadas.");
 }catch(error){
  console.error("Evoford social cover article fallback:",error);
  $("sgStatus").textContent="No se pudieron recuperar las noticias: "+(error.message||"error de conexión");
 }
}
function loadArticle(){
 const index=$("sgArticle").value;
 if(index===""){selected=null;photo=null;ready=false;lockDownload();$("sgTitle").value="";$("sgSubtitle").value="";draw();return;}
 selected=articles[Number(index)];
 if(!selected)return;
 $("sgTitle").value=selected.title_es||selected.title||"";
 $("sgSubtitle").value=selected.summary_es||selected.summary||selected.summary_en||"";
 $("sgCaption").value="📰 "+$("sgTitle").value+"\n\n"+$("sgSubtitle").value+"\n\nLee la noticia completa en EVOFORD NEWS: https://evoford.com/news\n\n#EvofordNews #Actualidad #Noticias";
 photo=null;ready=false;lockDownload();
 const src=selected.image_url;
 if(src&&/^https:\/\//i.test(src)){
   const img=new Image();img.crossOrigin="anonymous";
   img.onload=()=>{photo=img;$("sgStatus").textContent="Noticia e imagen cargadas desde el artículo. Pulsa «Crear imagen».";};
   img.onerror=()=>{$("sgStatus").textContent="El artículo está seleccionado, pero su fotografía no se pudo cargar para exportarla. Comprueba que la imagen permita uso desde el sitio.";};
   img.src=src;
 }else{$("sgStatus").textContent="El artículo no tiene una fotografía asociada. Añade una imagen al artículo y actualiza la edición.";}
 draw();
}
function lockDownload(){["sgDownload","sgPublish"].forEach(id=>{const b=$(id);b.disabled=true;b.style.opacity=".5";b.style.cursor="not-allowed";});}
function draw(){
 ctx.clearRect(0,0,W,H);ctx.fillStyle="#f4f1e9";ctx.fillRect(0,0,W,H);
 ctx.fillStyle="#142c43";ctx.fillRect(0,0,W,12);
 ctx.fillStyle="#142c43";ctx.font="700 56px Georgia,serif";ctx.fillText("EVOFORD",64,91);
 const bw=ctx.measureText("EVOFORD").width;ctx.fillStyle="#a44e3d";ctx.font="700 54px Georgia,serif";ctx.fillText(" NEWS",64+bw,91);
 ctx.fillStyle="#596674";ctx.font="600 15px Arial,sans-serif";ctx.textAlign="right";ctx.fillText(language==="en"?"CURRENT AFFAIRS MAGAZINE":"REVISTA DE ACTUALIDAD",1016,62);ctx.font="500 17px Arial,sans-serif";ctx.fillText(dateText(),1016,91);ctx.textAlign="left";
 ctx.fillStyle="#a44e3d";ctx.fillRect(64,119,952,3);ctx.fillStyle="#596674";ctx.font="600 15px Arial,sans-serif";ctx.fillText(language==="en"?"NEWS · CULTURE · COMMUNITY · IDEAS":"INFORMACIÓN · CULTURA · COMUNIDAD · IDEAS",64,157);
 const x=48,y=184,w=984,h=870;
 if(photo){const scale=Math.max(w/photo.width,h/photo.height),dw=photo.width*scale,dh=photo.height*scale;ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(photo,x+(w-dw)/2,y+(h-dh)/2,dw,dh);const shade=ctx.createLinearGradient(0,y+350,0,y+h);shade.addColorStop(0,"rgba(7,20,32,0)");shade.addColorStop(.48,"rgba(7,20,32,.14)");shade.addColorStop(1,"rgba(7,20,32,.88)");ctx.fillStyle=shade;ctx.fillRect(x,y,w,h);ctx.restore();}
 else{ctx.fillStyle="#d9dedf";ctx.fillRect(x,y,w,h);ctx.fillStyle="#71808b";ctx.font="600 24px Arial,sans-serif";ctx.textAlign="center";ctx.fillText(t().image,W/2,y+h/2);ctx.textAlign="left";}
 const title=($("sgTitle").value||"Titular de la noticia").trim();let size=78,lines;
 do{lines=wrap(title,880,"700 "+size+"px Georgia,serif");if(lines.length>3)size-=4;}while(lines.length>3&&size>48);
 const sub=($("sgSubtitle").value||"").trim(),subs=wrap(sub,880,"400 27px Arial,sans-serif").slice(0,2);
 let ty=y+h-(lines.length*(size+5)+(subs.length?24+subs.length*37:0))-58;
 ctx.fillStyle="#fff";ctx.font="700 "+size+"px Georgia,serif";lines.forEach(line=>{ctx.fillText(line,x+54,ty);ty+=size+5;});
 if(subs.length){ty+=17;ctx.fillStyle="#f1eee8";ctx.font="400 27px Arial,sans-serif";subs.forEach(line=>{ctx.fillText(line,x+54,ty);ty+=37;});}
 ctx.fillStyle="#a44e3d";ctx.fillRect(64,1090,54,5);ctx.fillStyle="#142c43";ctx.font="700 17px Arial,sans-serif";ctx.fillText("EVOFORD NEWS",64,1140);
 ctx.fillStyle="#596674";ctx.font="400 16px Arial,sans-serif";ctx.fillText(t().footer,64,1172);
 ctx.fillStyle="#142c43";ctx.fillRect(64,1210,952,1);ctx.fillStyle="#596674";ctx.font="600 14px Arial,sans-serif";ctx.fillText(t().countries,64,1250);ctx.textAlign="right";ctx.fillText("EVOFORD.COM/NEWS",1016,1250);ctx.textAlign="left";ctx.fillStyle="#a44e3d";ctx.fillRect(64,1282,952,3);
}
$("sgArticle").addEventListener("change",loadArticle);
$("sgCreate").addEventListener("click",()=>{
 if(!selected){$("sgStatus").textContent=t().selectFirst;return;}
 if(!photo){$("sgStatus").textContent=t().noPhoto;return;}
 if(!$("sgTitle").value.trim()){$("sgStatus").textContent=t().noTitle;return;}
 draw();ready=true;["sgDownload","sgPublish"].forEach(id=>{const b=$(id);b.disabled=false;b.style.opacity="1";b.style.cursor="pointer";});$("sgStatus").textContent=t().statusCreated;
});
["sgTitle","sgSubtitle"].forEach(id=>$(id).addEventListener("input",()=>{if(ready){ready=false;lockDownload();$("sgStatus").textContent=t().modified;}}));
$("sgDownload").addEventListener("click",()=>{if(!ready)return;const a=document.createElement("a");a.download="evoford-news-portada-revista-1080x1350.png";a.href=canvas.toDataURL("image/png");a.click();$("sgStatus").textContent=t().downloaded;});
$("sgPublish").addEventListener("click",async()=>{
 if(!ready||!selected)return;
 const caption=$("sgCaption").value.trim();
 if(!caption){$("sgStatus").textContent="Escribe el texto que acompañará la publicación.";return;}
 if(!window.confirm(t().confirm))return;
 const button=$("sgPublish");button.disabled=true;button.textContent=t().writing;$("sgStatus").textContent=t().publishing;
 try{
  const client=window.supabase.createClient("https://poywsdigujbarvnzbfnz.supabase.co","sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f");
  const {data:{session}}=await client.auth.getSession();
  if(!session)throw new Error("Inicia sesión con la cuenta editorial autorizada.");
  let articleId=selected.id;
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(articleId||""))){
    if(!selected.slug)throw new Error("La noticia seleccionada no contiene un identificador ni un enlace interno válido. Actualiza la edición y vuelve a seleccionarla.");
    const {data:articleRecord,error:lookupError}=await client.from("articles").select("id").eq("slug",selected.slug).eq("status","published").maybeSingle();
    if(lookupError)throw new Error("No se pudo identificar la noticia: "+lookupError.message);
    articleId=articleRecord?.id;
  }
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(articleId||"")))throw new Error("No se encontró el identificador de la noticia publicada. Actualiza la edición e inténtalo de nuevo.");
  const {data,error}=await client.functions.invoke("publish-social-graphic",{body:{article_id:articleId,title:$("sgTitle").value.trim(),caption,image_base64:canvas.toDataURL("image/png")},headers:{Authorization:"Bearer "+session.access_token}});
  if(error){let detail=error.message||"Error de comunicación con el servicio de publicación.";try{const context=error.context;if(context&&typeof context.json==="function"){const body=await context.json();detail=body.error||body.message||detail;}}catch(_){}throw new Error(detail);}
  if(!data?.ok)throw new Error(data?.error||"No se confirmó ninguna publicación.");
  $("sgStatus").textContent=t().published+(data.results||[]).map(x=>x.platform+": "+x.status+(x.error?" — "+x.error:"")).join(" | ");
 }catch(error){console.error("Evoford social graphic publish:",error);$("sgStatus").textContent=error.message||"No se pudo completar la publicación.";}
 finally{button.textContent=t().publish;button.disabled=!ready;button.style.opacity=ready?"1":".5";button.style.cursor=ready?"pointer":"not-allowed";}
});
document.addEventListener("edition:articlesloaded",e=>{
 const incoming=e.detail?.articles||[];
 populate(incoming);
 if(articles.length&&!selected){
  $("sgArticle").value="0";
  loadArticle();
 }
});
document.addEventListener("edition:languagechange",e=>{language=e.detail?.language==="en"?"en":"es";applyLanguage();});
populate(window.EvofordEditionArticles||[]);
applyLanguage();
draw();
})();