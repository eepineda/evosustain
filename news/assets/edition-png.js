(function(){
"use strict";
var button=document.getElementById("pngBtn");
if(!button)return;
var messages={
 es:{busy:"Generando páginas PNG…",missing:"No se ha cargado el motor de exportación. Actualiza la página.",loading:"La edición todavía se está cargando.",error:"No se pudo generar el PNG. Inténtalo de nuevo."},
 en:{busy:"Generating PNG pages…",missing:"The export engine did not load. Refresh the page.",loading:"The edition is still loading.",error:"Could not generate PNG. Please try again."}
};
function language(){return document.documentElement.lang==="en"?"en":"es";}
function blobToDataUrl(blob){
 return new Promise(function(resolve,reject){var reader=new FileReader();reader.onload=function(){resolve(String(reader.result||""));};reader.onerror=function(){reject(new Error("No se pudo preparar el archivo PNG."));};reader.readAsDataURL(blob);});
}
async function download(blob,name){
 var dataUrl=await blobToDataUrl(blob),a=document.createElement("a");
 a.href=dataUrl;a.download=name;document.body.appendChild(a);a.click();a.remove();
}
async function exportPng(){
 var lang=language(),t=messages[lang],old=button.textContent;
 var preview=window.open("about:blank","_blank");
 if(!preview){alert(lang==="en"?"Allow pop-ups for this page and try again.":"Permite las ventanas emergentes para esta página y vuelve a intentarlo.");return;}
 preview.document.write("<!doctype html><title>EVOFORD NEWS · PNG</title><body style='font:16px Arial;padding:28px;color:#142c43'><h1>EVOFORD NEWS</h1><p>Generando imágenes PNG…</p></body>");
 async function loadScript(src,marker){
 var response=await fetch(src,{cache:"no-store",credentials:"same-origin"});
 if(!response.ok)throw new Error("El servidor respondió "+response.status+" al solicitar "+src);
 var type=response.headers.get("content-type")||"",source=await response.text();
 if(!/javascript|ecmascript|text\/plain/i.test(type)||!source.includes(marker))throw new Error("La dirección no está entregando el motor JavaScript esperado: "+response.url+" ("+type+")");
 var script=document.createElement("script");script.textContent=source;document.head.appendChild(script);
}
 try{
  if(!window.EvoPrintController||!window.EvoPrintController.createDocument)await loadScript("/news/assets/edition-print-v13.js?v=18","window.EvoPrintController");
  if(!window.pdfjsLib)await loadScript("https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js","pdfjsLib");
 }catch(loadError){preview.document.body.innerHTML="<h2>"+t.missing+"</h2><p>"+String(loadError.message||loadError)+"</p>";alert(t.missing+" "+loadError.message);return;}
 if(!window.EvoPrintController||!window.EvoPrintController.createDocument||!window.pdfjsLib){preview.document.body.innerHTML="<h2>"+t.missing+"</h2>";alert(t.missing);return;}
 if(document.getElementById("lead").querySelector(".loading")){alert(t.loading);return;}
 button.disabled=true;button.textContent=t.busy;
 try{
  var doc=await window.EvoPrintController.createDocument();
  if(!doc)throw new Error("The shared PDF document was not created");
  window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
  var bytes=new Uint8Array(doc.output("arraybuffer"));
  var pdf=await window.pdfjsLib.getDocument({data:bytes,disableWorker:true}).promise;
  if(!pdf.numPages)throw new Error("El documento PDF no contiene páginas.");
  var date=new Date().toISOString().slice(0,10);
  var format=(document.getElementById("paperSize").value==="A3"?"A3":"A4");
  var gallery=preview.document.body;
  gallery.innerHTML="<h1 style='font:700 24px Georgia;color:#142c43'>EVOFORD NEWS · "+format+" · PNG</h1><p id='pngProgress'>Preparando "+pdf.numPages+" página(s)…</p>";
  for(var i=1;i<=pdf.numPages;i++){
   var progress=preview.document.getElementById("pngProgress");if(progress)progress.textContent="Generando página "+i+" de "+pdf.numPages+"…";
   var page=await pdf.getPage(i);
   var viewport=page.getViewport({scale:2.5});
   var canvas=document.createElement("canvas");
   canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
   var ctx=canvas.getContext("2d",{alpha:false});
   ctx.fillStyle="#ffffff";ctx.fillRect(0,0,canvas.width,canvas.height);
   await page.render({canvasContext:ctx,viewport:viewport,background:"#ffffff"}).promise;
   var imageUrl;try{imageUrl=canvas.toDataURL("image/png");}catch(encodeError){throw new Error("No se pudo convertir la página "+i+" a PNG: "+encodeError.message);}
   if(!imageUrl||imageUrl==="data:,")throw new Error("La página "+i+" no pudo codificarse como PNG.");
   var name="Evoford-News-"+format+"-"+(lang==="en"?"EN":"ES")+"-"+date+"-pagina-"+String(i).padStart(2,"0")+".png";
   var card=preview.document.createElement("section");
   card.style.cssText="margin:24px 0;padding:16px;border:1px solid #d5dbe1;max-width:900px";
   var link=preview.document.createElement("a");link.href=imageUrl;link.download=name;link.textContent="Descargar "+name;link.style.cssText="display:inline-block;margin-bottom:12px;color:#142c43;font-weight:bold";
   var image=preview.document.createElement("img");image.src=imageUrl;image.alt=name;image.style.cssText="display:block;width:100%;height:auto;border:1px solid #ddd";
   card.appendChild(link);card.appendChild(image);gallery.appendChild(card);
   canvas.width=canvas.height=1;
  }
  var progress=preview.document.getElementById("pngProgress");if(progress)progress.textContent=pdf.numPages+" página(s) PNG generadas. Haz clic en cada imagen para guardarla.";
  if(pdf.destroy)await pdf.destroy();
 }catch(error){
  console.error("Evoford PNG export:",error);
  if(!preview.closed)preview.document.body.innerHTML="<h2>"+t.error+"</h2><p>"+String(error.message||error).replace(/[&<>]/g," ")+"</p>";
  alert((t.error)+" "+(error.message||""));
 }finally{
  button.disabled=false;button.textContent=old;
 }
}
button.addEventListener("click",exportPng);
})();