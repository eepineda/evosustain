(function(){
"use strict";
var button=document.getElementById("pngBtn");
if(!button)return;
var text={
 es:{busy:"Preparando imágenes…",missing:"No se cargó el exportador PNG. Actualiza la página e inténtalo de nuevo.",loading:"La edición todavía se está cargando.",done:"Se han preparado las páginas PNG.",error:"No se pudo generar el PNG. Comprueba las imágenes y vuelve a intentarlo."},
 en:{busy:"Preparing images…",missing:"The PNG exporter did not load. Refresh the page and try again.",loading:"The edition is still loading.",done:"PNG pages have been prepared.",error:"Could not generate the PNG. Check the images and try again."}
};
function language(){return document.documentElement.lang==="en"?"en":"es";}
function paper(){return (document.getElementById("paperSize")||{}).value==="A3"?"A3":"A4";}
function download(canvas,name){
 return new Promise(function(resolve){
  canvas.toBlob(function(blob){
   if(!blob){resolve(false);return;}
   var url=URL.createObjectURL(blob),link=document.createElement("a");
   link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();
   setTimeout(function(){URL.revokeObjectURL(url);resolve(true);},1200);
  },"image/png");
 });
}
async function exportPng(){
 var lang=language(),t=text[lang],newspaper=document.getElementById("newspaper");
 if(!window.html2canvas){alert(t.missing);return;}
 if(!newspaper||document.getElementById("lead").querySelector(".loading")){alert(t.loading);return;}
 button.disabled=true;var old=button.textContent;button.textContent=t.busy;
 try{
  var images=Array.from(newspaper.querySelectorAll("img"));
  images.forEach(function(img){img.loading="eager";});
  await Promise.all(images.map(function(img){
   if(img.complete&&img.naturalWidth)return Promise.resolve();
   if(typeof img.decode==="function")return img.decode().catch(function(){});
   return new Promise(function(resolve){img.addEventListener("load",resolve,{once:true});img.addEventListener("error",resolve,{once:true});});
  }));
  if(document.fonts&&document.fonts.ready)await document.fonts.ready;
  var width=newspaper.scrollWidth||newspaper.getBoundingClientRect().width;
  var height=newspaper.scrollHeight||newspaper.getBoundingClientRect().height;
  if(!width||!height)throw new Error("Empty edition");
  var scale=Math.min(2,Math.sqrt(24000000/(width*height)));
  scale=Math.max(1,scale);
  var canvas=await window.html2canvas(newspaper,{
   backgroundColor:"#ffffff",scale:scale,useCORS:true,allowTaint:false,
   logging:false,windowWidth:Math.max(document.documentElement.clientWidth,width),
   width:width,height:height,scrollX:0,scrollY:0
  });
  var ratio=297/210,pageHeight=Math.round(canvas.width*ratio);
  var total=Math.ceil(canvas.height/pageHeight),date=new Date().toISOString().slice(0,10);
  for(var i=0;i<total;i++){
   var y=i*pageHeight,h=Math.min(pageHeight,canvas.height-y);
   var page=document.createElement("canvas");page.width=canvas.width;page.height=h;
   page.getContext("2d").drawImage(canvas,0,y,canvas.width,h,0,0,canvas.width,h);
   var name="Evoford-News-"+paper()+"-"+(lang==="en"?"EN":"ES")+"-"+date+"-pagina-"+String(i+1).padStart(2,"0")+".png";
   var ok=await download(page,name);if(!ok)throw new Error("PNG encoding failed");
   page.width=page.height=1;
  }
  canvas.width=canvas.height=1;
 }catch(error){
  console.error("Evoford PNG export:",error);
  alert(t.error);
 }finally{
  button.disabled=false;button.textContent=old;
 }
}
button.addEventListener("click",exportPng);
})();