(() => {
"use strict";
const $ = id => document.getElementById(id);
const canvas = $("sgCanvas");
if (!canvas) return;
const ctx = canvas.getContext("2d");
let photo = null;
let ready = false;
const W = 1080, H = 1350;
const dateText = new Intl.DateTimeFormat("es-ES",{day:"2-digit",month:"long",year:"numeric"}).format(new Date()).toUpperCase();
function wrap(text,maxWidth,font){
  ctx.font=font;
  const words=String(text||"").trim().split(/\s+/).filter(Boolean), result=[];
  let line="";
  for(const word of words){
    const candidate=line?line+" "+word:word;
    if(ctx.measureText(candidate).width>maxWidth&&line){result.push(line);line=word;}else line=candidate;
  }
  if(line)result.push(line);
  return result;
}
function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#f4f1e9";ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#142c43";ctx.fillRect(0,0,W,12);
  ctx.fillStyle="#142c43";ctx.font="700 56px Georgia,serif";ctx.fillText("EVOFORD",64,91);
  const brandWidth=ctx.measureText("EVOFORD").width;
  ctx.fillStyle="#a44e3d";ctx.font="700 54px Georgia,serif";ctx.fillText(" NEWS",64+brandWidth,91);
  ctx.fillStyle="#596674";ctx.font="600 15px Arial,sans-serif";ctx.textAlign="right";ctx.fillText("REVISTA DE ACTUALIDAD",1016,62);
  ctx.font="500 17px Arial,sans-serif";ctx.fillText(dateText,1016,91);ctx.textAlign="left";
  ctx.fillStyle="#a44e3d";ctx.fillRect(64,119,952,3);
  ctx.fillStyle="#596674";ctx.font="600 15px Arial,sans-serif";ctx.fillText("INFORMACIÓN · CULTURA · COMUNIDAD · IDEAS",64,157);
  const x=48,y=184,w=984,h=870;
  if(photo){
    const scale=Math.max(w/photo.width,h/photo.height),dw=photo.width*scale,dh=photo.height*scale;
    ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
    ctx.drawImage(photo,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
    const shade=ctx.createLinearGradient(0,y+350,0,y+h);
    shade.addColorStop(0,"rgba(7,20,32,0)");shade.addColorStop(.48,"rgba(7,20,32,.14)");shade.addColorStop(1,"rgba(7,20,32,.88)");
    ctx.fillStyle=shade;ctx.fillRect(x,y,w,h);ctx.restore();
  }else{
    ctx.fillStyle="#d9dedf";ctx.fillRect(x,y,w,h);
    ctx.fillStyle="#71808b";ctx.font="600 24px Arial,sans-serif";ctx.textAlign="center";ctx.fillText("LA FOTOGRAFÍA DE PORTADA",W/2,y+h/2);ctx.textAlign="left";
  }
  const title=($("sgTitle").value||"El titular de tu próxima portada").trim();
  let size=78,titleLines;
  do{titleLines=wrap(title,880,"700 "+size+"px Georgia,serif");if(titleLines.length>3)size-=4;}while(titleLines.length>3&&size>48);
  const sub=($("sgSubtitle").value||"").trim();
  const subLines=wrap(sub,880,"400 27px Arial,sans-serif").slice(0,2);
  let total=titleLines.length*(size+5)+(subLines.length?24+subLines.length*37:0);
  let ty=y+h-total-58;
  ctx.fillStyle="#fff";ctx.font="700 "+size+"px Georgia,serif";
  titleLines.forEach(line=>{ctx.fillText(line,x+54,ty);ty+=size+5;});
  if(subLines.length){ty+=17;ctx.fillStyle="#f1eee8";ctx.font="400 27px Arial,sans-serif";subLines.forEach(line=>{ctx.fillText(line,x+54,ty);ty+=37;});}
  ctx.fillStyle="#a44e3d";ctx.fillRect(64,1090,54,5);
  ctx.fillStyle="#142c43";ctx.font="700 17px Arial,sans-serif";ctx.fillText("EVOFORD NEWS",64,1140);
  ctx.fillStyle="#596674";ctx.font="400 16px Arial,sans-serif";ctx.fillText("Una mirada informada a la actualidad",64,1172);
  ctx.fillStyle="#142c43";ctx.fillRect(64,1210,952,1);
  ctx.fillStyle="#596674";ctx.font="600 14px Arial,sans-serif";ctx.fillText("REINO UNIDO  ·  ESPAÑA  ·  REPÚBLICA DOMINICANA",64,1250);
  ctx.textAlign="right";ctx.fillText("EVOFORD.COM/NEWS",1016,1250);ctx.textAlign="left";
  ctx.fillStyle="#a44e3d";ctx.fillRect(64,1282,952,3);
}
$("sgImage").addEventListener("change",e=>{
  const file=e.target.files&&e.target.files[0];if(!file)return;
  if(file.size>15000000){$("sgStatus").textContent="La fotografía supera los 15 MB.";e.target.value="";return;}
  if(!/^image\/(jpeg|png|webp)$/.test(file.type)){$("sgStatus").textContent="Selecciona una imagen JPG, PNG o WebP.";e.target.value="";return;}
  const reader=new FileReader();
  reader.onload=()=>{const img=new Image();img.onload=()=>{photo=img;ready=false;$("sgDownload").disabled=true;$("sgDownload").style.opacity=".5";$("sgDownload").style.cursor="not-allowed";$("sgStatus").textContent="Fotografía cargada. Pulsa «Crear imagen» para generar la portada.";};img.onerror=()=>$("sgStatus").textContent="No se pudo abrir la fotografía.";img.src=reader.result;};
  reader.readAsDataURL(file);
});
$("sgCreate").addEventListener("click",()=>{
  if(!photo){$("sgStatus").textContent="Selecciona primero una fotografía.";return;}
  if(!$("sgTitle").value.trim()){$("sgStatus").textContent="Escribe el titular de la portada.";return;}
  draw();ready=true;$("sgDownload").disabled=false;$("sgDownload").style.opacity="1";$("sgDownload").style.cursor="pointer";$("sgStatus").textContent="Portada creada. Ya puedes descargar el PNG.";
});
$("sgTitle").addEventListener("input",()=>{if(ready){ready=false;$("sgDownload").disabled=true;$("sgDownload").style.opacity=".5";$("sgStatus").textContent="Has cambiado el titular. Vuelve a crear la imagen.";}});
$("sgSubtitle").addEventListener("input",()=>{if(ready){ready=false;$("sgDownload").disabled=true;$("sgDownload").style.opacity=".5";$("sgStatus").textContent="Has cambiado el texto. Vuelve a crear la imagen.";}});
$("sgDownload").addEventListener("click",()=>{
  if(!ready)return;
  const a=document.createElement("a");a.download="evoford-news-portada-revista-1080x1350.png";a.href=canvas.toDataURL("image/png");a.click();
  $("sgStatus").textContent="PNG descargado en 1080 × 1350 píxeles.";
});
draw();
})();