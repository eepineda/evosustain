(() => {
"use strict";
const $=id=>document.getElementById(id);
const canvas=$("sgCanvas");if(!canvas)return;
const ctx=canvas.getContext("2d"),W=1080,H=1350;
let articles=[],selected=null,photo=null,ready=false;
const dateText=new Intl.DateTimeFormat("es-ES",{day:"2-digit",month:"long",year:"numeric"}).format(new Date()).toUpperCase();
function wrap(text,max,font){ctx.font=font;const words=String(text||"").trim().split(/\s+/).filter(Boolean),out=[];let line="";for(const word of words){const test=line?line+" "+word:word;if(ctx.measureText(test).width>max&&line){out.push(line);line=word;}else line=test;}if(line)out.push(line);return out;}
function populate(list){
 const incoming=Array.isArray(list)?list:[];
 articles=incoming.filter(a=>a&&typeof a==="object"&&/^https:\/\//i.test(String(a.image_url||""))&&(a.title_es||a.title||a.title_en));
 const select=$("sgArticle"),previous=select.value;
 select.innerHTML="";
 const first=document.createElement("option");first.value="";first.textContent=articles.length?"Selecciona una noticia publicada":"No hay noticias publicadas con fotografía";select.appendChild(first);
 articles.forEach((a,i)=>{const o=document.createElement("option");o.value=String(i);o.textContent=(a.title_es||a.title||a.title_en||"Sin titular").slice(0,110);select.appendChild(o);});
 if(previous&&articles[Number(previous)])select.value=previous;
 if(!articles.length){selected=null;photo=null;ready=false;lockDownload();$("sgStatus").textContent=incoming.length?"Hay noticias publicadas, pero ninguna tiene una fotografía válida asociada.":"Cargando noticias publicadas…";}
 else $("sgStatus").textContent=articles.length+" noticias con fotografía disponibles.";
}
async function loadArticlesFallback(){
 if(articles.length||!window.supabase?.createClient)return;
 try{
  const client=window.supabase.createClient("https://poywsdigujbarvnzbfnz.supabase.co","sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f");
  const {data,error}=await client.from("articles").select("title,title_en,title_es,slug,category,author,summary,summary_en,summary_es,image_url,published_at,created_at,country").eq("status","published").order("published_at",{ascending:false,nullsFirst:false}).order("created_at",{ascending:false}).limit(40);
  if(error)throw error;
  if(Array.isArray(data)&&data.length){populate(data);$("sgStatus").textContent=articles.length+" noticias publicadas con fotografía cargadas directamente.";return;}
  $("sgStatus").textContent="No se encontraron noticias publicadas. Comprueba el estado de los artículos.";
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
 ctx.fillStyle="#596674";ctx.font="600 15px Arial,sans-serif";ctx.textAlign="right";ctx.fillText("REVISTA DE ACTUALIDAD",1016,62);ctx.font="500 17px Arial,sans-serif";ctx.fillText(dateText,1016,91);ctx.textAlign="left";
 ctx.fillStyle="#a44e3d";ctx.fillRect(64,119,952,3);ctx.fillStyle="#596674";ctx.font="600 15px Arial,sans-serif";ctx.fillText("INFORMACIÓN · CULTURA · COMUNIDAD · IDEAS",64,157);
 const x=48,y=184,w=984,h=870;
 if(photo){const scale=Math.max(w/photo.width,h/photo.height),dw=photo.width*scale,dh=photo.height*scale;ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(photo,x+(w-dw)/2,y+(h-dh)/2,dw,dh);const shade=ctx.createLinearGradient(0,y+350,0,y+h);shade.addColorStop(0,"rgba(7,20,32,0)");shade.addColorStop(.48,"rgba(7,20,32,.14)");shade.addColorStop(1,"rgba(7,20,32,.88)");ctx.fillStyle=shade;ctx.fillRect(x,y,w,h);ctx.restore();}
 else{ctx.fillStyle="#d9dedf";ctx.fillRect(x,y,w,h);ctx.fillStyle="#71808b";ctx.font="600 24px Arial,sans-serif";ctx.textAlign="center";ctx.fillText("IMAGEN DEL ARTÍCULO",W/2,y+h/2);ctx.textAlign="left";}
 const title=($("sgTitle").value||"Titular de la noticia").trim();let size=78,lines;
 do{lines=wrap(title,880,"700 "+size+"px Georgia,serif");if(lines.length>3)size-=4;}while(lines.length>3&&size>48);
 const sub=($("sgSubtitle").value||"").trim(),subs=wrap(sub,880,"400 27px Arial,sans-serif").slice(0,2);
 let ty=y+h-(lines.length*(size+5)+(subs.length?24+subs.length*37:0))-58;
 ctx.fillStyle="#fff";ctx.font="700 "+size+"px Georgia,serif";lines.forEach(line=>{ctx.fillText(line,x+54,ty);ty+=size+5;});
 if(subs.length){ty+=17;ctx.fillStyle="#f1eee8";ctx.font="400 27px Arial,sans-serif";subs.forEach(line=>{ctx.fillText(line,x+54,ty);ty+=37;});}
 ctx.fillStyle="#a44e3d";ctx.fillRect(64,1090,54,5);ctx.fillStyle="#142c43";ctx.font="700 17px Arial,sans-serif";ctx.fillText("EVOFORD NEWS",64,1140);
 ctx.fillStyle="#596674";ctx.font="400 16px Arial,sans-serif";ctx.fillText("Una mirada informada a la actualidad",64,1172);
 ctx.fillStyle="#142c43";ctx.fillRect(64,1210,952,1);ctx.fillStyle="#596674";ctx.font="600 14px Arial,sans-serif";ctx.fillText("REINO UNIDO  ·  ESPAÑA  ·  REPÚBLICA DOMINICANA",64,1250);ctx.textAlign="right";ctx.fillText("EVOFORD.COM/NEWS",1016,1250);ctx.textAlign="left";ctx.fillStyle="#a44e3d";ctx.fillRect(64,1282,952,3);
}
$("sgArticle").addEventListener("change",loadArticle);
$("sgCreate").addEventListener("click",()=>{
 if(!selected){$("sgStatus").textContent="Selecciona primero una noticia.";return;}
 if(!photo){$("sgStatus").textContent="La noticia seleccionada no tiene una fotografía exportable.";return;}
 if(!$("sgTitle").value.trim()){$("sgStatus").textContent="La noticia no tiene titular.";return;}
 draw();ready=true;["sgDownload","sgPublish"].forEach(id=>{const b=$(id);b.disabled=false;b.style.opacity="1";b.style.cursor="pointer";});$("sgStatus").textContent="Portada creada. Puedes descargarla o publicarla en Facebook e Instagram.";
});
["sgTitle","sgSubtitle"].forEach(id=>$(id).addEventListener("input",()=>{if(ready){ready=false;lockDownload();$("sgStatus").textContent="Has modificado el texto. Vuelve a crear la imagen.";}}));
$("sgDownload").addEventListener("click",()=>{if(!ready)return;const a=document.createElement("a");a.download="evoford-news-portada-revista-1080x1350.png";a.href=canvas.toDataURL("image/png");a.click();$("sgStatus").textContent="PNG descargado en 1080 × 1350 píxeles.";});
$("sgPublish").addEventListener("click",async()=>{
 if(!ready||!selected)return;
 const caption=$("sgCaption").value.trim();
 if(!caption){$("sgStatus").textContent="Escribe el texto que acompañará la publicación.";return;}
 if(!window.confirm("¿Confirmas publicar esta portada y su texto en Facebook e Instagram?"))return;
 const button=$("sgPublish");button.disabled=true;button.textContent="Publicando…";$("sgStatus").textContent="Subiendo la portada y enviando a las redes sociales…";
 try{
  const client=window.supabase.createClient("https://poywsdigujbarvnzbfnz.supabase.co","sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f");
  const {data:{session}}=await client.auth.getSession();
  if(!session)throw new Error("Inicia sesión con la cuenta editorial autorizada.");
  const {data,error}=await client.functions.invoke("publish-social-graphic",{body:{article_id:selected.id,title:$("sgTitle").value.trim(),caption,image_base64:canvas.toDataURL("image/png")},headers:{Authorization:"Bearer "+session.access_token}});
  if(error)throw new Error(error.message||"Error de comunicación con el servicio de publicación.");
  if(!data?.ok)throw new Error(data?.error||"No se confirmó ninguna publicación.");
  $("sgStatus").textContent="Resultado: "+(data.results||[]).map(x=>x.platform+": "+x.status+(x.error?" — "+x.error:"")).join(" | ");
 }catch(error){console.error("Evoford social graphic publish:",error);$("sgStatus").textContent=error.message||"No se pudo completar la publicación.";}
 finally{button.textContent="Publicar en Facebook e Instagram";button.disabled=!ready;button.style.opacity=ready?"1":".5";button.style.cursor=ready?"pointer":"not-allowed";}
});
document.addEventListener("edition:articlesloaded",e=>populate(e.detail?.articles||[]));
populate(window.EvofordEditionArticles||[]);
draw();
if(!articles.length)loadArticlesFallback();
})();