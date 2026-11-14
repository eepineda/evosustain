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
function generate(){
 var en=lang()==="en",a3=paper()==="a3";
 if(!window.jspdf||!window.jspdf.jsPDF){alert(en?"The local PDF engine did not load. Refresh the page and try again.":"No se cargó el motor PDF local. Actualiza la página e inténtalo de nuevo.");return;}
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
  var gap=a3?7:5.5,cw=(U-gap*(cols-1))/cols,col=0,x=m,top=y,colBottom=top;
  function advance(){
   colBottom=Math.max(colBottom,y);col++;
   if(col>=cols){nextPage();col=0;top=y;colBottom=top;}
   x=m+col*(cw+gap);y=top;
  }
  nodes.forEach(function(node){
   var str=clean(plain(node));if(!str)return;
   var heading=/^H[1-6]$/.test(node.tagName),fs=heading?(a3?10:9):pt,style=heading?"bold":"normal",step=fs*.4;
   var lines=doc.splitTextToSize(str,cw);if(y+lines.length*step+3>H-m-12)advance();
   if(heading)y+=1;
   lines.forEach(function(ln){if(y+step>H-m-12)advance();font(style,fs,heading?navy:ink);doc.text(ln,x,y);y+=step;});
   y+=heading?1.5:1.2;
  });
  y=Math.max(colBottom,y);
 }
 function drawStories(images){
  var cols=3,gap=a3?6:5,cw=(U-gap*(cols-1))/cols,idx=0;
  while(idx<stories.length){
   var row=stories.slice(idx,idx+cols),cards=[],rowHeight=0;
   row.forEach(function(node,j){
    var x=m+j*(cw+gap),cy=0,im=images[idx+j],titleText=clean(plain($("h2",node))),summaryText=clean(plain($("p",node)));
    if(im&&im.data){
     try{
      var p=doc.getImageProperties(im.data),maxImage=a3?17:11,ih=Math.min(maxImage,cw/(p.width/p.height));
      doc.addImage(im.data,im.type.indexOf("png")>=0?"PNG":"JPEG",x,y,cw,ih,undefined,"FAST");
      cy=ih+2.5;
     }catch(e){}
    }
    font("bold",5.4,red);doc.text(clean(plain($(".category",node))).slice(0,35),x,y+cy);cy+=3;
    var titleSize=a3?8.2:7.2,titleStep=a3?3.25:2.9;
    font("bold",titleSize,ink);
    var titleLines=doc.splitTextToSize(titleText,cw).slice(0,3);
    titleLines.forEach(function(line){doc.text(line,x,y+cy);cy+=titleStep;});
    cy+=.8;
    font("normal",a3?6.2:5.6,grey);
    var summaryLines=doc.splitTextToSize(summaryText,cw).slice(0,a3?3:2);
    summaryLines.forEach(function(line){doc.text(line,x,y+cy);cy+=a3?2.55:2.3;});
    cards.push({x:x,bottom:y+cy+2});
    rowHeight=Math.max(rowHeight,cy+2);
   });
   if(y+rowHeight>H-m-12){
    nextPage();
    continue;
   }
   cards.forEach(function(card){ruleLine(card.x,y+rowHeight,card.x+cw,y+rowHeight,rule,.2);});
   y+=rowHeight+ (a3?5:4);
   idx+=cols;
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
  nextPage();
  doc.setDrawColor(190,198,205);doc.setLineDash([1,1],0);doc.rect(m,y,U,11);doc.setLineDash([]);font("bold",6,grey);doc.text(en?"ADVERTISING SPACE":"ESPACIO PUBLICITARIO",W/2,y+6.5,{align:"center"});y+=17;
  ruleLine(m,y,W-m,y,navy,.7);y+=5;font("bold",7,navy);doc.text(en?"MORE STORIES":"OTRAS NOTICIAS",m,y);
  font("normal",6,grey);doc.text(stories.length+" "+(en?"stories":"noticias"),W-m,y,{align:"right"});y+=6;
  drawStories(images[1]);footer();
  doc.save("Evoford-News-"+(a3?"A3":"A4")+"-"+(en?"EN":"ES")+"-"+new Date().toISOString().slice(0,10)+".pdf");
 }).catch(function(err){console.error("Evoford PDF",err);alert(en?"Could not generate the PDF. Please retry.":"No se pudo generar el PDF. Inténtalo de nuevo.");});
}
window.EvoPrintController={setSize:function(){return paper();},print:generate};
})();