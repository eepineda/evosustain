/* EVOFORD NEWS — documento de impresión aislado
   Genera una composición limpia desde el contenido ya cargado.
   No hereda hojas de estilo de la edición web. */
(function(){
 "use strict";
 var sizeSelect=document.getElementById("paperSize");
 function getSize(){return sizeSelect&&sizeSelect.value==="A3"?"A3":"A4";}
 function cloneMarkup(selector){
  var node=document.querySelector(selector);
  return node?node.innerHTML:"";
 }
 function cloneElement(selector){
  var node=document.querySelector(selector);
  return node?node.outerHTML:"";
 }
 function makeDocument(size){
  var lang=document.documentElement.lang==="en"?"en":"es";
  var pageMargin=size==="A3"?"13mm":"11mm";
  var title="Evoford News — "+(lang==="en"?"Print edition":"Edición impresa");
  var leadNode=document.querySelector("#lead");
  var secondaryNode=document.querySelector(".secondary-area");
  var printLead=leadNode?leadNode.cloneNode(true):null;
  var printSecondary=secondaryNode?secondaryNode.cloneNode(true):null;
  if(printLead){
   var content=printLead.querySelector(".lead-content");
   var photo=printLead.querySelector(".lead-photo");
   var sidebar=printLead.querySelector(".lead-sidebar");
   if(content){
    content.style.display="grid";
    content.style.gridTemplateColumns="minmax(0,2fr) minmax(0,1fr)";
    content.style.gap="9pt";
    content.style.alignItems="start";
   }
   if(photo){
    photo.style.display="block";
    photo.style.width="100%";
    photo.style.maxWidth="100%";
    photo.style.margin="0";
    photo.style.textAlign="center";
   }
   if(sidebar){
    sidebar.style.display="block";
    sidebar.style.paddingLeft="8pt";
    sidebar.style.borderLeft="1px solid #c4cbd2";
   }
  }
  var blocks={
   topline:cloneMarkup(".paper-topline"),
   masthead:cloneMarkup(".paper-masthead"),
   rule:cloneMarkup(".paper-rule"),
   sections:cloneMarkup(".paper-sections"),
   lead:printLead?printLead.outerHTML:"",
   article:cloneElement("#fullArticle"),
   secondary:printSecondary?printSecondary.outerHTML:"",
   footer:cloneElement(".paper-footer")
  };
  var css=`
@page{size:${size} portrait;margin:${pageMargin}}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#fff;color:#17212b}
body{font-family:Georgia,"Times New Roman",serif;font-size:10pt;line-height:1.35;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.sheet{width:100%;margin:0 auto}
.topline{display:flex;justify-content:space-between;gap:8pt;border-bottom:1px solid #17212b;padding-bottom:5pt;color:#4b5661;font:700 7pt/1.3 Arial,sans-serif;letter-spacing:.08em}
.masthead{text-align:center;padding:9pt 0 6pt}
.paper-kicker{font:italic 8pt/1.3 Georgia,serif;color:#596575}
.paper-brand{font:900 42pt/.98 Georgia,serif;letter-spacing:-2pt;color:#101820}
.paper-motto{font:italic 8pt/1.3 Georgia,serif;color:#596575;margin-top:3pt}
.paper-rule{height:4pt;border-top:3pt double #102b4e;margin:0}
.paper-sections{text-align:center;padding:6pt 0;border-bottom:1px solid #b7bec6;color:#102b4e;font:700 7pt/1.3 Arial,sans-serif;letter-spacing:.1em}
.lead{display:block;margin:0;padding:11pt 0 12pt;border-bottom:2pt solid #102b4e}
.lead-headline{padding-bottom:8pt}
.category{color:#9d2635;font:700 7pt/1.25 Arial,sans-serif;letter-spacing:.13em;text-transform:uppercase}
.lead-headline h1{font:700 27pt/1.03 Georgia,serif;letter-spacing:-.5pt;margin:5pt 0 7pt;color:#101820}
.lead-headline .summary{font:10pt/1.35 Georgia,serif;margin:0 0 6pt;color:#3e4852}
.byline{font:6.5pt/1.3 Arial,sans-serif;letter-spacing:.05em;color:#65717d;text-transform:uppercase}
.lead-content{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:9pt;align-items:start;margin-top:8pt;padding-top:8pt;border-top:1px solid #c4cbd2}.lead-photo{display:block;width:100%;max-width:100%;margin:0;text-align:center}.lead-photo img{display:block;width:100%;height:auto;max-height:92mm;margin:0 auto;object-fit:contain}

.lead-sidebar{display:block;min-width:0;padding-left:8pt;border-left:1px solid #c4cbd2}
.sidebar-heading{font:700 7pt/1.3 Arial,sans-serif;letter-spacing:.12em;color:#102b4e;border-bottom:2pt solid #102b4e;padding-bottom:4pt}
.side-story{display:grid;grid-template-columns:18pt minmax(0,1fr);gap:4pt;padding:6pt 0;border-bottom:1px solid #c4cbd2}
.side-number{font:700 12pt/1 Georgia,serif;color:#9d2635}
.side-story h2{font:700 9.5pt/1.12 Georgia,serif;margin:2pt 0;color:#17212b}
.side-story p{font:7pt/1.28 Georgia,serif;margin:3pt 0;color:#59636d}
#fullArticle{display:block;margin:12pt 0;padding:10pt 0 12pt;border-top:2pt solid #102b4e;border-bottom:1px solid #c4cbd2;break-before:auto;page-break-before:auto;break-inside:auto;page-break-inside:auto}
.full-article-heading{display:block;margin:0 0 8pt;padding:0 0 6pt;border-bottom:1px solid #c4cbd2;break-after:avoid-page;page-break-after:avoid}
.full-article-heading>span{font:700 7pt/1.3 Arial,sans-serif;letter-spacing:.16em;color:#9d2635}
.full-article-heading h2{font:700 17pt/1.08 Georgia,serif;margin:4pt 0;color:#111a23}
.full-article-body{display:block;width:auto;height:auto;overflow:visible;columns:2;column-count:2;column-gap:16pt;column-fill:balance;font:9pt/1.38 Georgia,serif;text-align:justify;hyphens:auto;orphans:3;widows:3}
.full-article-body p{margin:0 0 7pt;break-inside:auto;page-break-inside:auto}
.full-article-body h2,.full-article-body h3,.full-article-body h4{font:700 12pt/1.15 Georgia,serif;color:#172b40;margin:9pt 0 4pt;break-after:avoid-page;page-break-after:avoid}
.full-article-body ul,.full-article-body ol{padding-left:16pt;margin:4pt 0 7pt}
.secondary-area{display:block;margin:12pt 0 0;padding:9pt 0 0;border-top:3pt double #102b4e;break-before:auto;page-break-before:auto}
.section-label{display:flex;justify-content:space-between;margin:0 0 8pt;padding:5pt 0;border-bottom:1px solid #17212b;color:#102b4e;font:700 7pt/1.3 Arial,sans-serif;letter-spacing:.12em;break-after:avoid-page;page-break-after:avoid}
/* Single-flow news list: avoids CSS grid page-fragmentation differences. */
.story-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:9pt 10pt!important;align-items:start!important;width:100%!important;margin:0!important;padding:0!important;break-inside:auto!important;page-break-inside:auto!important}
.story{display:block!important;min-width:0;margin:0;padding:0 0 7pt;border-bottom:1px solid #c4cbd2;break-inside:avoid;page-break-inside:avoid}
.story-from-headline{padding-top:5pt}
.story-from-headline:before{content:"TITULAR DESTACADO";display:block;margin-bottom:4pt;color:#9d2635;font:700 6pt/1.2 Arial,sans-serif;letter-spacing:.1em}
.story img{display:block;width:100%;height:27mm;object-fit:cover;margin:0 0 5pt}
.story .category,.story h2,.story p,.story .byline{display:block}
.story h2{font:700 11pt/1.12 Georgia,serif;margin:1pt 0 3pt;color:#17212b}
.story p{font:8pt/1.32 Georgia,serif;margin:2pt 0;color:#4e5963}
.story .byline{font-size:6pt}
.story:not(:has(img)){display:block!important}
.ad-slot{margin:8pt 0;padding:8pt 5pt;border:1px dashed #9aa4ae;text-align:center;color:#66717c;font:700 6pt/1.3 Arial,sans-serif;letter-spacing:.16em}.paper-footer{display:flex!important;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:4pt 12pt;margin:10pt 0 0;padding:6pt 0 0;border-top:1.5pt solid #102b4e;font:6.5pt/1.3 Arial,sans-serif;color:#4e5963}.paper-footer>*{display:block;flex:0 1 auto}
.paper-footer strong{color:#102b4e;letter-spacing:.1em}
a{color:inherit;text-decoration:none}
img{max-width:100%}
@media print{
 .lead-content,.story{break-inside:avoid-page}
 .lead{break-inside:auto}
 .full-article-body{column-count:2;columns:2}
 .story-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}
 .lead{break-inside:auto}
 #fullArticle,.secondary-area{break-before:auto!important;page-break-before:auto!important}
}
@media print{html[data-paper-size="A3"] .lead-photo img{max-height:115mm}html[data-paper-size="A3"] .full-article-body{column-count:3;columns:3}html[data-paper-size="A3"] .story-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
@media screen{
 body{background:#e7e9ec;padding:24px}
 .sheet{max-width:${size==="A3"?"297mm":"210mm"};min-height:${size==="A3"?"420mm":"297mm"};padding:${pageMargin};background:white;box-shadow:0 4px 22px #0002}
}
`;
  return "<!doctype html><html lang=\""+lang+"\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>"+title+"</title><style>"+css+"</style></head><body><main class=\"sheet\"><div class=\"topline\">"+blocks.topline+"</div><header class=\"masthead\">"+blocks.masthead+"</header><div class=\"paper-rule\"></div><div class=\"paper-sections\">"+blocks.sections+"</div>"+blocks.lead+blocks.article+'<aside class="ad-slot">ESPACIO PUBLICITARIO · EVOFORD NEWS</aside>'+blocks.secondary+blocks.footer+"</main></body></html>";
 }
 function print(){
  var size=getSize();
  var popup=window.open("","_blank");
  if(!popup){window.alert("Permite las ventanas emergentes para imprimir la edición de Evoford News.");return;}
  popup.document.open();
  popup.document.write(makeDocument(size));
  popup.document.documentElement.setAttribute("data-paper-size",size);
  popup.document.close();
  var images=Array.prototype.slice.call(popup.document.images);
  images.forEach(function(img){img.loading="eager";});
  var imageWait=Promise.all(images.map(function(img){
   if(img.complete)return img.decode?img.decode().catch(function(){}):Promise.resolve();
   return new Promise(function(resolve){img.addEventListener("load",resolve,{once:true});img.addEventListener("error",resolve,{once:true});});
  }));
  var fonts=popup.document.fonts&&popup.document.fonts.ready?popup.document.fonts.ready:Promise.resolve();
  var timeout=new Promise(function(resolve){window.setTimeout(resolve,8000);});
  Promise.race([Promise.all([imageWait,fonts]),timeout]).then(function(){
   popup.focus();
   popup.print();
  });
 }
 function setSize(){return getSize();}
 window.EvoPrintController={setSize:setSize,print:print};
})();