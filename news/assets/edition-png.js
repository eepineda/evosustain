(function(){
"use strict";
var button=document.getElementById("pngBtn");
if(!button)return;
var messages={
 es:{busy:"Generando páginas PNG…",missing:"No se ha cargado el motor de exportación. Actualiza la página.",loading:"La edición todavía se está cargando.",error:"No se pudo generar el PNG. Inténtalo de nuevo."},
 en:{busy:"Generating PNG pages…",missing:"The export engine did not load. Refresh the page.",loading:"The edition is still loading.",error:"Could not generate PNG. Please try again."}
};
function language(){return document.documentElement.lang==="en"?"en":"es";}
function download(blob,name){
 var url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(function(){URL.revokeObjectURL(url);},1500);
}
async function exportPng(){
 var lang=language(),t=messages[lang],old=button.textContent;
 if(!window.EvoPrintController||!window.EvoPrintController.createDocument||!window.pdfjsLib){alert(t.missing);return;}
 if(document.getElementById("lead").querySelector(".loading")){alert(t.loading);return;}
 button.disabled=true;button.textContent=t.busy;
 try{
  var doc=await window.EvoPrintController.createDocument();
  if(!doc)throw new Error("The shared PDF document was not created");
  window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  var bytes=new Uint8Array(doc.output("arraybuffer"));
  var pdf=await window.pdfjsLib.getDocument({data:bytes}).promise;
  var date=new Date().toISOString().slice(0,10);
  var format=(document.getElementById("paperSize").value==="A3"?"A3":"A4");
  for(var i=1;i<=pdf.numPages;i++){
   var page=await pdf.getPage(i);
   var viewport=page.getViewport({scale:2.5});
   var canvas=document.createElement("canvas");
   canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
   var ctx=canvas.getContext("2d",{alpha:false});
   ctx.fillStyle="#ffffff";ctx.fillRect(0,0,canvas.width,canvas.height);
   await page.render({canvasContext:ctx,viewport:viewport,background:"#ffffff"}).promise;
   var blob=await new Promise(function(resolve){canvas.toBlob(resolve,"image/png");});
   if(!blob)throw new Error("PNG encoding failed");
   var name="Evoford-News-"+format+"-"+(lang==="en"?"EN":"ES")+"-"+date+"-pagina-"+String(i).padStart(2,"0")+".png";
   download(blob,name);
   canvas.width=canvas.height=1;
  }
  if(pdf.destroy)await pdf.destroy();
 }catch(error){
  console.error("Evoford PNG export:",error);alert(t.error);
 }finally{
  button.disabled=false;button.textContent=old;
 }
}
button.addEventListener("click",exportPng);
})();