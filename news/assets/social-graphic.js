(() => {
"use strict";
const $ = id => document.getElementById(id);
const canvas = $("sgCanvas");
if (!canvas) return;
const ctx = canvas.getContext("2d");
let photo = null;
const ids = ["Type","Date","Title","Subtitle","Author","Section","Body"];
$("sgDate").value = new Date().toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric"});
function lines(text, max, font) {
  ctx.font = font;
  const words = String(text || "").split(/\s+/), out = [];
  let line = "";
  words.forEach(word => {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > max && line) { out.push(line); line = word; }
    else line = test;
  });
  if (line) out.push(line);
  return out;
}
function draw() {
  const v = id => $( "sg" + id ).value.trim();
  const type = v("Type");
  ctx.clearRect(0,0,1080,1350);
  ctx.fillStyle="#f8fafc"; ctx.fillRect(0,0,1080,1350);
  ctx.fillStyle="#102b4e"; ctx.fillRect(0,0,1080,18);
  ctx.fillStyle="#102b4e"; ctx.font="700 38px Arial"; ctx.fillText("EVOFORD",72,91);
  ctx.fillStyle="#d34b3e"; ctx.fillText("NEWS",260,91);
  ctx.fillStyle="#64748b"; ctx.font="500 19px Arial"; ctx.textAlign="right"; ctx.fillText(v("Date"),1008,88); ctx.textAlign="left";
  ctx.fillStyle="#d34b3e"; ctx.fillRect(72,120,936,5);
  ctx.fillStyle="#d34b3e"; ctx.font="700 22px Arial"; ctx.fillText((v("Section")||"ACTUALIDAD").toUpperCase(),72,174);
  const top=210, height=type==="editorial"?390:470;
  if(photo) {
    const scale=Math.max(936/photo.width,height/photo.height), w=photo.width*scale,h=photo.height*scale;
    ctx.save();ctx.beginPath();ctx.rect(72,top,936,height);ctx.clip();ctx.drawImage(photo,72+(936-w)/2,top+(height-h)/2,w,h);ctx.restore();
  } else {
    const grad=ctx.createLinearGradient(72,top,1008,top+height);grad.addColorStop(0,"#e8eef4");grad.addColorStop(1,"#d7e1eb");
    ctx.fillStyle=grad;ctx.fillRect(72,top,936,height);ctx.fillStyle="#9aaabd";ctx.font="700 25px Arial";ctx.fillText("EVOFORD NEWS",105,top+height-35);
  }
  const title=v("Title")||"Tu titular aquí", size=type==="editorial"?59:64, font="700 "+size+"px Arial";
  ctx.fillStyle="#102b4e";ctx.font=font;
  const titleLines=lines(title,920,font).slice(0,3); let y=top+height+78;
  titleLines.forEach(line=>{ctx.fillText(line,72,y);y+=size+8;});
  y+=8;
  if(v("Subtitle")) {ctx.fillStyle="#536273";ctx.font="400 31px Arial";lines(v("Subtitle"),920,"400 31px Arial").slice(0,2).forEach(line=>{ctx.fillText(line,72,y);y+=42;});}
  if(v("Body")) {y+=18;ctx.fillStyle="#34465a";ctx.font="400 25px Arial";lines(v("Body"),920,"400 25px Arial").slice(0,4).forEach(line=>{ctx.fillText(line,72,y);y+=36;});}
  ctx.fillStyle="#d34b3e";ctx.fillRect(72,1260,936,3);
  ctx.fillStyle="#102b4e";ctx.font="700 20px Arial";ctx.fillText(v("Author")||"EVOFORD NEWS",72,1302);
  ctx.fillStyle="#64748b";ctx.font="400 18px Arial";ctx.textAlign="right";ctx.fillText("evoford.com/news",1008,1302);ctx.textAlign="left";
}
ids.forEach(k=>$("sg"+k).addEventListener("input",draw));
$("sgImage").addEventListener("change",e=>{
 const file=e.target.files&&e.target.files[0];if(!file)return;
 if(file.size>12000000){$("sgStatus").textContent="La imagen supera los 12 MB.";e.target.value="";return;}
 const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{photo=img;draw();};img.src=reader.result;};reader.readAsDataURL(file);
});
function refresh(){
 const select=$("sgDrafts");select.innerHTML='<option value="">Borradores guardados</option>';
 try {JSON.parse(localStorage.getItem("evo_social_graphic_drafts")||"[]").forEach(d=>{const o=document.createElement("option");o.value=d.id;o.textContent=d.title||"Sin titular";select.appendChild(o);});}catch(e){}
}
$("sgSave").addEventListener("click",()=>{
 try {
  const d={id:Date.now().toString(),title:$("sgTitle").value.trim()||"Sin titular"};
  ids.forEach(k=>d[k]=$("sg"+k).value);
  const all=JSON.parse(localStorage.getItem("evo_social_graphic_drafts")||"[]");all.unshift(d);
  localStorage.setItem("evo_social_graphic_drafts",JSON.stringify(all.slice(0,30)));
  refresh();$("sgDrafts").value=d.id;
  $("sgStatus").textContent="Borrador guardado en este navegador. La fotografía debe volver a seleccionarse al cargarlo.";
 } catch(e) {$("sgStatus").textContent="No se pudo guardar el borrador en este navegador.";}
});
$("sgLoad").addEventListener("click",()=>{
 const id=$("sgDrafts").value;if(!id)return;
 try {const d=JSON.parse(localStorage.getItem("evo_social_graphic_drafts")||"[]").find(x=>x.id===id);if(!d)return;
 ids.forEach(k=>{if(d[k]!==undefined)$("sg"+k).value=d[k];});
 photo=null;$("sgImage").value="";draw();$("sgStatus").textContent="Borrador cargado. Selecciona de nuevo la fotografía si corresponde.";
 }catch(e){}
});
$("sgDownload").addEventListener("click",()=>{
 draw();const a=document.createElement("a");a.download="evoford-news-redes-1080x1350.png";a.href=canvas.toDataURL("image/png");a.click();
 $("sgStatus").textContent="PNG generado en 1080 × 1350 píxeles.";
});
refresh();draw();
})();