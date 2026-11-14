/* Evoford News — motor de impresión A4/A3 para Chrome y Edge */
(function(){
 "use strict";
 var select=document.getElementById("paperSize");
 var pageStyle=document.getElementById("evoPrintPageRule");
 if(!pageStyle){pageStyle=document.createElement("style");pageStyle.id="evoPrintPageRule";document.head.appendChild(pageStyle);}
 function setSize(){
  var value=select&&select.value==="A3"?"A3":"A4";
  document.documentElement.setAttribute("data-print-size",value.toLowerCase());
  pageStyle.textContent="@page{size:"+value+" portrait;margin:"+(value==="A3"?"12mm":"11mm")+"}";
  return value;
 }
 function waitForImages(){
  var images=Array.prototype.slice.call(document.querySelectorAll("#newspaper img"));
  images.forEach(function(img){img.loading="eager";});
  return Promise.all(images.map(function(img){
   if(img.complete){
    return img.decode?img.decode().catch(function(){}):Promise.resolve();
   }
   return new Promise(function(resolve){
    var done=function(){resolve();};
    img.addEventListener("load",done,{once:true});
    img.addEventListener("error",done,{once:true});
   });
  }));
 }
 function printEdition(){
  setSize();
  var button=document.getElementById("printBtn");
  if(button){button.disabled=true;button.setAttribute("aria-busy","true");}
  var fonts=document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve();
  var assets=Promise.all([fonts,waitForImages()]);
  var limit=new Promise(function(resolve){window.setTimeout(resolve,10000);});
  Promise.race([assets,limit]).then(function(){
   setSize();
   window.requestAnimationFrame(function(){
    window.requestAnimationFrame(function(){
     window.print();
     if(button){button.disabled=false;button.removeAttribute("aria-busy");}
    });
   });
  }).catch(function(){
   window.print();
   if(button){button.disabled=false;button.removeAttribute("aria-busy");}
  });
 }
 if(select){select.addEventListener("change",setSize);setSize();}
 window.addEventListener("beforeprint",setSize);
 window.addEventListener("afterprint",function(){
  if(select)select.disabled=false;
  var button=document.getElementById("printBtn");
  if(button){button.disabled=false;button.removeAttribute("aria-busy");}
 });
 window.EvoPrintController={setSize:setSize,print:printEdition};
})();