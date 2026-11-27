/* EVOFORD NEWS — PDF editorial independiente. Genera páginas A3/A4 sin el motor de impresión del navegador. */
(function(){
"use strict";
var select=document.getElementById("paperSize");
var lang=function(){return document.documentElement.lang==="en"?"en":"es";};
var $=function(s,r){return (r||document).querySelector(s);};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
function paper(){return select&&select.value==="A3"?"a3":"a4";}
function plain(n){if(!n)return "";var value=typeof n.innerText==="string"?n.innerText:"";if(!value.trim())value=n.textContent||"";return value.replace(/\u00a0/g," ").replace(/[\t ]+/g," ").replace(/\s*\n\s*/g," ").trim();}
function clean(s){return String(s||"").replace(/[\u2010-\u2015]/g,"-").replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/\u2026/g,"...");}
function getImage(url){
 if(!url||!/^https:\/\//i.test(url))return Promise.resolve(null);
 return fetch(url,{mode:"cors",credentials:"omit"}).then(function(r){if(!r.ok)throw Error("image");return r.blob();}).then(function(b){return new Promise(function(resolve){var objectUrl=URL.createObjectURL(b),img=new Image();img.onload=function(){try{var canvas=document.createElement("canvas");canvas.width=img.naturalWidth||img.width;canvas.height=img.naturalHeight||img.height;var ctx=canvas.getContext("2d");ctx.fillStyle="#ffffff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0);var data=canvas.toDataURL("image/jpeg",0.9);URL.revokeObjectURL(objectUrl);resolve({data:data,type:"image/jpeg"});}catch(e){URL.revokeObjectURL(objectUrl);resolve(null);}};img.onerror=function(){URL.revokeObjectURL(objectUrl);resolve(null);};img.src=objectUrl;});}).catch(function(){return null;});
}
function generate(returnDocument){
 var en=lang()==="en",a3=paper()==="a3";
 if(!window.jspdf||!window.jspdf.jsPDF){var engineError=new Error(en?"The local PDF engine did not load. Refresh the page and try again.":"No se cargó el motor PDF local. Actualiza la página e inténtalo de nuevo.");if(returnDocument)return Promise.reject(engineError);alert(engineError.message);return Promise.resolve(null);}
 var lead=$("#lead"),article=$("#fullArticle"),secondary=$(".secondary-area");
 if(!lead||!$(".lead-headline h1",lead)){var loadingError=new Error(en?"The edition is still loading.":"La edición todavía se está cargando.");if(returnDocument)return Promise.reject(loadingError);alert(loadingError.message);return Promise.resolve(null);}
 var JsPDF=window.jspdf.jsPDF,doc=new JsPDF({orientation:"portrait",unit:"mm",format:a3?"a3":"a4",compress:true});
 var W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight(),m=a3?14:11,U=W-2*m;
 var navy=[16,43,78],red=[157,38,53],ink=[23,33,43],grey=[91,101,112],rule=[190,198,205];
 var y=m,page=1,articleFlow=false;
 var title=clean(plain($(".lead-headline h1",lead))),summary=clean(plain($(".lead-headline .summary",lead))),category=clean(plain($(".lead-headline .category",lead))),by=clean(plain($(".lead-headline .byline",lead)));
 var leadImg=$(".lead-photo img",lead),side=$$(".side-story",lead).map(function(n){return {cat:clean(plain($(".category",n))),title:clean(plain($("h2",n))),summary:clean(plain($("p",n)))};});
 var body=$(".full-article-body",article),bodyNodes=body?Array.prototype.slice.call(body.children):[];\n if(body&&!bodyNodes.length&&plain(body))bodyNodes=[body];
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
 function nextPage(){footer();doc.addPage();page++;y=m;header();if(articleFlow){font("bold",6.5,red);doc.text(en?"FULL STORY · CONTINUED":"ARTÍCULO COMPLETO · CONTINUACIÓN",m,y);y+=4;ruleLine(m,y,W-m,y,rule,.25);y+=5;}}
 function ensure(h){if(y+h>H-m-11)nextPage();}
 function paragraph(str,x,width,pt,style,color,gap){
  if(!str)return;var lines=doc.splitTextToSize(clean(str),width),step=pt*.39;
  lines.forEach(function(ln){ensure(step+1);font(style,pt,color);doc.text(ln,x,y);y+=step;});y+=gap===undefined?1.5:gap;
 }
 function imageUrl(node){
 if(!node)return "";
 return node.currentSrc||node.src||node.getAttribute("data-src")||node.getAttribute("data-lazy-src")||node.getAttribute("data-original")||"";
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
  articleFlow=true;
  var x=m,cw=U,bottom=H-m-12;
  function addBlock(str,heading){
   str=clean(str);if(!str)return;
   var fs=heading?(a3?10:9):pt,step=fs*.4,lines=doc.splitTextToSize(str,cw);
   var blockHeight=lines.length*step+2;
   if(y+Math.min(blockHeight,step*2)>bottom)nextPage();
   if(heading)y+=1;
   lines.forEach(function(line){
    if(y+step>bottom)nextPage();
    font(heading?"bold":"normal",fs,heading?navy:ink);
    doc.text(line,x,y);y+=step;
   });
   y+=heading?1.5:1.2;
  }
  nodes.forEach(function(node){
   if(/^(UL|OL)$/.test(node.tagName)){
    Array.prototype.forEach.call(node.children,function(item,index){
     addBlock((node.tagName==="OL"?(index+1)+". ":"• ")+plain(item),false);
    });
   }else{
    addBlock(plain(node),/^H[1-6]$/.test(node.tagName));
   }
  });
  articleFlow=false;
 }
 function prepareStories(images){
  var cols=3,gap=a3?6:4,cw=(U-gap*(cols-1))/cols,rows=[];
  for(var idx=0;idx<stories.length;idx+=cols){
   var row=stories.slice(idx,idx+cols),cards=[],rowHeight=0;
   row.forEach(function(node,j){
    var im=images[idx+j],ih=0;
    if(im&&im.data){
     try{var p=doc.getImageProperties(im.data);ih=Math.min(a3?36:25,cw/(p.width/p.height));}catch(e){}
    }
    var titleSize=a3?10:8.2,titleStep=a3?3.8:3.2,summarySize=a3?7.8:6.6,summaryStep=a3?3.0:2.6;
    doc.setFont("times","bold");doc.setFontSize(titleSize);
    var titleLines=doc.splitTextToSize(clean(plain($("h2",node))),cw).slice(0,4);
    doc.setFont("times","normal");doc.setFontSize(summarySize);
    var summaryLines=doc.splitTextToSize(clean(plain($("p",node))),cw).slice(0,2);
    var height=(ih?ih+1:0)+3+titleLines.length*titleStep+.8+summaryLines.length*summaryStep+2;
    cards.push({node:node,image:im,x:m+j*(cw+gap),width:cw,imageHeight:ih,titleLines:titleLines,summaryLines:summaryLines,titleSize:titleSize,titleStep:titleStep,summarySize:summarySize,summaryStep:summaryStep});
    rowHeight=Math.max(rowHeight,height);
   });
   rows.push({cards:cards,height:rowHeight});
  }
  return {rows:rows,total:rows.reduce(function(sum,row){return sum+row.height;},0)+Math.max(0,rows.length-1)*(a3?4:2.5)};
 }
 function drawStories(layout){
  layout.rows.forEach(function(row){
   row.cards.forEach(function(card){
    var cy=0,cardWidth=card.width;
    if(card.image&&card.image.data&&card.imageHeight){
     try{doc.addImage(card.image.data,"JPEG",card.x,y,cardWidth,card.imageHeight,undefined,"FAST");cy=card.imageHeight+1;}catch(e){}
    }
    font("bold",a3?6.2:5.8,red);doc.text(clean(plain($(".category",card.node))).slice(0,35),card.x,y+cy);cy+=2.5;
    font("bold",card.titleSize,ink);
    card.titleLines.forEach(function(line){doc.text(line,card.x,y+cy);cy+=card.titleStep;});
    cy+=.4;font("normal",card.summarySize,grey);
    card.summaryLines.forEach(function(line){doc.text(line,card.x,y+cy);cy+=card.summaryStep;});
    ruleLine(card.x,y+row.height,card.x+cardWidth,y+row.height,rule,.2);
   });
   y+=row.height+(a3?4:2.5);
  });
 }
 return Promise.all([imageReady(imageUrl(leadImg)),Promise.all(stories.map(function(n){return imageReady(imageUrl($("img",n)));}))]).then(function(images){
  header();font("bold",6.5,red);doc.text(category.toUpperCase(),m,y);y+=5;
  var titlePt=a3?25:21;font("bold",titlePt,ink);
  doc.splitTextToSize(title,U).forEach(function(v){ensure(titlePt*.42+1);doc.text(v,m,y);y+=titlePt*.42;});
  y+=2;paragraph(summary,m,U,a3?10:8.5,"normal",ink,1.5);font("italic",6,grey);doc.text(by.slice(0,150),m,y);y+=6;
  leadBlock(images[0]);var articleTitle=clean(plain($(".full-article-heading h2",article)))||title;
  font("bold",6.5,red);doc.text(en?"FULL STORY":"ARTÍCULO COMPLETO",m,y);y+=4;
  font("bold",a3?15:12,ink);doc.splitTextToSize(articleTitle,U).forEach(function(v){ensure(5);doc.text(v,m,y);y+=5;});
  y+=3;ruleLine(m,y,W-m,y,rule,.3);y+=5;\n  if(bodyNodes.length){articleColumns(bodyNodes,1,a3?10:8.2);y+=4;}\n  else{paragraph(en?"The full article text is not available.":"El texto completo no está disponible para esta noticia.",m,U,8,"italic",grey,2);}
  var storyLayout=prepareStories(images[1]);
  var newsGap=5;
  if(y+12>H-m-12)nextPage();
  ruleLine(m,y,W-m,y,navy,.7);y+=4;font("bold",7,navy);doc.text(en?"MORE STORIES":"OTRAS NOTICIAS",m,y);
  font("normal",6,grey);doc.text(stories.length+" "+(en?"stories":"noticias"),W-m,y,{align:"right"});y+=newsGap;
  storyLayout.rows.forEach(function(row,index){
   if(y+row.height>H-m-12){
    nextPage();font("bold",6.5,red);doc.text(en?"MORE STORIES · CONTINUED":"OTRAS NOTICIAS · CONTINUACIÓN",m,y);y+=4;ruleLine(m,y,W-m,y,rule,.25);y+=5;
   }
   drawStories({rows:[row]});
  });
  footer();
  if(returnDocument)return doc;
  doc.save("Evoford-News-"+(a3?"A3":"A4")+"-"+(en?"EN":"ES")+"-"+new Date().toISOString().slice(0,10)+".pdf");
  return doc;
 }).catch(function(err){console.error("Evoford PDF",err);if(returnDocument)throw err;alert(en?"Could not generate the PDF. Please retry.":"No se pudo generar el PDF. Inténtalo de nuevo.");return null;});
}
window.EvoPrintController={setSize:function(){return paper();},print:function(){return generate(false);},createDocument:function(){return generate(true);}};
})();