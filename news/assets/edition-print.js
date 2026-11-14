/* EVOFORD NEWS — PDF editorial independiente. Genera páginas A3/A4 sin el motor de impresión del navegador. */
(function(){
"use strict";
var select=document.getElementById("paperSize");
var lang=function(){return document.documentElement.lang==="en"?"en":"es";};
var $=function(s,r){return (r||document).querySelector(s);};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
function paper(){return select&&select.value==="A3"?"a3":"a4";}
function plain(n){return (n&&n.innerText||"").replace(/\u00a0/g," ").replace(/[\t ]+/g," ").trim();}
function clean(s){return String(s||"").replace(/[\u2010-\u2015]/g,"-").replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/\u2026/g,"...");}
function getImage(url){
 if(!url||!/^https:\/\//i.test(url))return Promise.resolve(null);
 return fetch(url,{mode:"cors",credentials:"omit"}).then(function(r){if(!r.ok)throw Error("image");return r.blob();}).then(function(b){return new Promise(function(resolve){var objectUrl=URL.createObjectURL(b),img=new Image();img.onload=function(){try{var canvas=document.createElement("canvas");canvas.width=img.naturalWidth||img.width;canvas.height=img.naturalHeight||img.height;var ctx=canvas.getContext("2d");ctx.fillStyle="#ffffff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0);var data=canvas.toDataURL("image/jpeg",0.9);URL.revokeObjectURL(objectUrl);resolve({data:data,type:"image/jpeg"});}catch(e){URL.revokeObjectURL(objectUrl);resolve(null);}};img.onerror=function(){URL.revokeObjectURL(objectUrl);resolve(null);};img.src=objectUrl;});}).catch(function(){return null;});
}
var pdfLibraryPromise=null;
function loadPdfLibrary(){
 if(window.jspdf&&window.jspdf.jsPDF)return Promise.resolve();
 if(pdfLibraryPromise)return pdfLibraryPromise;
 var sources=[
  "https://unpkg.com/jspdf@2.5.2/dist/jspdf.umd.min.js",
  "https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js"
 ];
 pdfLibraryPromise=new Promise(function(resolve,reject){
  var index=0;
  function attempt(){
   if(window.jspdf&&window.jspdf.jsPDF){resolve();return;}
   if(index>=sources.length){reject(new Error("No se pudo descargar jsPDF desde los servidores disponibles."));return;}
   var script=document.createElement("script");script.src=sources[index++];script.async=true;script.crossOrigin="anonymous";
   script.onload=function(){if(window.jspdf&&window.jspdf.jsPDF)resolve();else attempt();};
   script.onerror=attempt;document.head.appendChild(script);
  }
  attempt();
 });
 return pdfLibraryPromise;
}
function generate(){
 var en=lang()==="en",a3=paper()==="a3";
 if(!window.jspdf||!window.jspdf.jsPDF){
  loadPdfLibrary().then(function(){pdfLibraryPromise=null;generate();}).catch(function(error){
   console.error("Evoford PDF library:",error);
   alert(en?"The PDF library could not be downloaded. Check your connection, disable any content blocker for this site, and retry.":"No se pudo descargar la biblioteca PDF. Comprueba la conexión, permite los recursos externos para este sitio e inténtalo de nuevo.");
  });
  return;
 }
 var lead=$("#lead"),article=$("#fullArticle"),secondary=$(".secondary-area");
 if(!lead||!$(".lead-headline h1",lead)){alert(en?"The edition is still loading.":"La edición todavía se está cargando.");return;}
 var JsPDF=window.jspdf.jsPDF,doc=new JsPDF({orientation:"portrait",unit:"mm",format:a3?"a3":"a4",compress:true});
 var W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight(),m=a3?14:11,U=W-2*m;
 var navy=[16,43,78],red=[157,38,53],ink=[23,33,43],grey=[91,101,112],rule=[190,198,205];
 var y=m,page=1;
 var title=clean(plain($(".lead-headline h1",lead))),summary=clean(plain($(".lead-headline .summary",lead))),category=clean(plain($(".lead-headline .category",lead))),by=clean(plain($(".lead-headline .byline",lead)));
 var leadImg=$(".lead-photo img",lead),side=$$(".side-story",lead).map(function(n){return {cat:clean(plain($(".category",n))),title:clean(plain($("h2",n))),summary:clean(plain($("p",n)))};});
 var body=$(".full-article-body",article),bodyNodes=body?Array.prototype.slice.call(body.children):[];
 var stories=$$(".story",secondary);
 function font(style,pt,color){doc.setFont("times",style);doc.setFontSize(pt);doc.setTextColor.apply(doc,color||ink);}
 function ruleLine(x1,y1,x2,y2,c,w){doc.setDrawColor.apply(doc,c||rule);doc.setLineWidth(w||.25);doc.line(x1,y1,x2,y2);}
 function header(){
  font("normal",7,grey);doc.text(new Date().toLocaleDateString(en?"en-GB":"es-ES",{day:"numeric",month:"long",year:"numeric"}).toUpperCase(),m,y);
  doc.text(en?"EVOFORD NEWS · PRINT EDITION":"EVOFORD NEWS · EDICIÓN IMPRESA",W-m,y,{align:"right"});y+=4;
  ruleLine(m,y,W-m,y,navy,.6);y+=5;font("italic",7,grey);
  doc.text(en?"THE GLOBAL NEWSPAPER · INFORMATION WITH CONTEXT":"EL PERIÓDICO GLOBAL · INFORMACIÓN CON CONTEXTO",W/2,y,{align:"center"});y+=9;
  font("bold",a3?35:29,ink);doc.text("EVOFORD NEWS",W/2,y,{align:"center"});y+=5;
  font("italic",7,grey);doc.text(en?"News to understand the world":"Noticias para entender el mundo",W/2,y,{align:"center"});y+=4;
  ruleLine(m,y,W-m,y,navy,.8);y+=4;font("bold",6.5,navy);
  doc.text(en?"INTERNATIONAL · ECONOMY · SOCIETY · TECHNOLOGY · OPINION":"INTERNACIONAL · ECONOMÍA · SOCIEDAD · TECNOLOGÍA · OPINIÓN",W/2,y,{align:"center"});y+=5;ruleLine(m,y,W-m,y,rule,.25);y+=7;
 }
 function footer(){
  ruleLine(m,H-m-7,W-m,H-m-7,navy,.5);font("normal",6,grey);
  doc.text(en?"EVOFORD NEWS · PRINT EDITION":"EVOFORD NEWS · EDICIÓN IMPRESA",m,H-m-3);
  doc.text(String(page),W-m,H-m-3,{align:"right"});
 }
 function nextPage(){footer();doc.addPage();page++;y=m;header();}
 function ensure(h){if(y+h>H-m-11)nextPage();}
 function paragraph(str,x,width,pt,style,color,gap){
  if(!str)return;var lines=doc.splitTextToSize(clean(str),width),step=pt*.39;
  lines.forEach(function(ln){ensure(step+1);font(style,pt,color);doc.text(ln,x,y);y+=step;});y+=gap===undefined?1.5:gap;
 }
 function imageReady(url){return getImage(url);}
 function leadBlock(image){
  var gap=7,sideW=U*.31,photoW=U-sideW-gap,top=y,photoH=0;
  if(image&&image.data){try{var p=doc.getImageProperties(image.data);photoH=Math.min(a3?100:72,photoW/(p.width/p.height));doc.addImage(image.data,image.type.indexOf("png")>=0?"PNG":"JPEG",m,top,photoW,photoH,undefined,"FAST");}catch(e){photoH=0;}}
  if(!photoH){photoH=a3?40:32;ruleLine(m,top,m+photoW,top,rule,.3);font("italic",9,grey);doc.text(en?"Main photograph":"Fotografía principal",m+photoW/2,top+photoH/2,{align:"center"});}
  var x=m+photoW+gap,sy=top+1;font("bold",6.5,navy);doc.text(en?"MORE HEADLINES":"OTROS TITULARES",x,sy);sy+=5;
  side.forEach(function(s){
   if(sy>top+photoH-8)return;
   font("bold",6,red);doc.text(s.cat||"NEWS",x,sy);sy+=3.2;font("bold",a3?9:8,ink);
   doc.splitTextToSize(s.title,sideW).slice(0,3).forEach(function(v){doc.text(v,x,sy);sy+=3.4;});
   if(s.summary&&sy<top+photoH-5){font("normal",a3?6.5:6,grey);doc.splitTextToSize(s.summary,sideW).slice(0,2).forEach(function(v){doc.text(v,x,sy);sy+=2.7;});}
   sy+=2;ruleLine(x,sy,x+sideW,sy,rule,.2);sy+=3;
  });
  y=top+Math.max(photoH,sy-top)+5;ruleLine(m,y,W-m,y,navy,.65);y+=6;
 }
 function articleColumns(nodes,cols,pt){
  var gap=a3?7:5.5,cw=(U-gap*(cols-1))/cols,col=0,x=m,top=y;
  function advance(){col++;if(col>=cols){nextPage();col=0;top=y;}x=m+col*(cw+gap);y=top;}
  nodes.forEach(function(node){
   var str=clean(plain(node));if(!str)return;
   var heading=/^H[1-6]$/.test(node.tagName),fs=heading?(a3?10:9):pt,style=heading?"bold":"normal",step=fs*.4;
   var lines=doc.splitTextToSize(str,cw);if(y+lines.length*step+3>H-m-12)advance();
   if(heading)y+=1;
   lines.forEach(function(ln){if(y+step>H-m-12)advance();font(style,fs,heading?navy:ink);doc.text(ln,x,y);y+=step;});
   y+=heading?1.5:1.2;
  });
 }
 function drawStories(images){
  var cols=a3?4:3,gap=5,cw=(U-gap*(cols-1))/cols,idx=0;
  while(idx<stories.length){
   var row=stories.slice(idx,idx+cols),top=y,max=top;
   row.forEach(function(node,j){
    var x=m+j*(cw+gap),cy=top,im=images[idx+j];
    if(im&&im.data){try{var p=doc.getImageProperties(im.data),ih=Math.min(a3?27:20,cw/(p.width/p.height));doc.addImage(im.data,im.type.indexOf("png")>=0?"PNG":"JPEG",x,cy,cw,ih,undefined,"FAST");cy+=ih+3;}catch(e){}}
    font("bold",5.8,red);doc.text(clean(plain($(".category",node))).slice(0,35),x,cy);cy+=3.3;
    font("bold",a3?9:8,ink);doc.splitTextToSize(clean(plain($("h2",node))),cw).slice(0,5).forEach(function(v){doc.text(v,x,cy);cy+=3.4;});
    cy+=1;font("normal",a3?7:6.3,grey);doc.splitTextToSize(clean(plain($("p",node))),cw).slice(0,a3?7:6).forEach(function(v){doc.text(v,x,cy);cy+=2.8;});
    ruleLine(x,cy+1,x+cw,cy+1,rule,.2);max=Math.max(max,cy+5);
   });
   y=max+6;idx+=cols;if(idx<stories.length&&y>H-m-28)nextPage();
  }
 }
 Promise.all([imageReady(leadImg&&leadImg.src),Promise.all(stories.map(function(n){var im=$("img",n);return imageReady(im&&im.src);}))]).then(function(images){
  header();font("bold",6.5,red);doc.text(category.toUpperCase(),m,y);y+=5;
  var titlePt=a3?25:21;font("bold",titlePt,ink);
  doc.splitTextToSize(title,U).forEach(function(v){ensure(titlePt*.42+1);doc.text(v,m,y);y+=titlePt*.42;});
  y+=2;paragraph(summary,m,U,a3?10:8.5,"normal",ink,1.5);font("italic",6,grey);doc.text(by.slice(0,150),m,y);y+=6;
  leadBlock(images[0]);var articleTitle=clean(plain($(".full-article-heading h2",article)))||title;
  font("bold",6.5,red);doc.text(en?"FULL STORY":"ARTÍCULO COMPLETO",m,y);y+=4;
  font("bold",a3?15:12,ink);doc.splitTextToSize(articleTitle,U).forEach(function(v){ensure(5);doc.text(v,m,y);y+=5;});
  y+=3;ruleLine(m,y,W-m,y,rule,.3);y+=5;articleColumns(bodyNodes,a3?3:2,a3?9:7.6);y+=5;
  ensure(15);doc.setDrawColor(190,198,205);doc.setLineDash([1,1],0);doc.rect(m,y,U,11);doc.setLineDash([]);font("bold",6,grey);doc.text(en?"ADVERTISING SPACE":"ESPACIO PUBLICITARIO",W/2,y+6.5,{align:"center"});y+=15;
  if(y>H-m-30)nextPage();
  ruleLine(m,y,W-m,y,navy,.7);y+=5;font("bold",7,navy);doc.text(en?"MORE STORIES":"OTRAS NOTICIAS",m,y);
  font("normal",6,grey);doc.text(stories.length+" "+(en?"stories":"noticias"),W-m,y,{align:"right"});y+=6;
  drawStories(images[1]);footer();
  doc.save("Evoford-News-"+(a3?"A3":"A4")+"-"+(en?"EN":"ES")+"-"+new Date().toISOString().slice(0,10)+".pdf");
 }).catch(function(err){console.error("Evoford PDF",err);alert(en?"Could not generate the PDF. Please retry.":"No se pudo generar el PDF. Inténtalo de nuevo.");});
}
window.EvoPrintController={setSize:function(){return paper();},print:generate};
})();