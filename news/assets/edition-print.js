/* Evoford News — controlador de impresión independiente del navegador */
(function(){
 "use strict";
 var select=document.getElementById("paperSize");
 var style=document.getElementById("evoPrintPageRule");
 if(!style){style=document.createElement("style");style.id="evoPrintPageRule";document.head.appendChild(style);}
 function size(){
  var value=select&&select.value==="A3"?"A3":"A4";
  document.documentElement.setAttribute("data-print-size",value.toLowerCase());
  style.textContent="@page{size:"+value+" portrait;margin:"+(value==="A3"?"12mm":"11mm")+"}";
  return value;
 }
 function readyImages(){
  var images=Array.prototype.slice.call(document.querySelectorAll("#newspaper img"));
  return Promise.all(images.map(function(img){
   if(img.complete){
    if(img.decode)return img.decode().catch(function(){});
    return Promise.resolve();
   }
   return new Promise(function(resolve){
    img.addEventListener("load",resolve,{once:true});
    img.addEventListener("error",resolve,{once:true});
   });
  }));
 }
 function print(){
  size();
  var button=document.getElementById("printBtn");
  if(button){button.disabled=true;button.setAttribute("aria-busy","true");}
  var fonts=document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve();
  Promise.all([fonts,readyImages()]).then(function(){
   window.setTimeout(function(){
    window.print();
    if(button){button.disabled=false;button.removeAttribute("aria-busy");}
   },120);
  }).catch(function(){
   window.print();
   if(button){button.disabled=false;button.removeAttribute("aria-busy");}
  });
 }
 window.EvoPrintController={setSize:size,print:print};
 if(select){
  select.addEventListener("change",size);
  size();
 }
 window.addEventListener("beforeprint",size);
 window.addEventListener("afterprint",function(){
  if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
 });
})();