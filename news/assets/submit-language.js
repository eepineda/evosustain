(()=>{const dict={
es:{pageTitle:"Envía tu noticia | Evoford News",news:"Evoford News",admin:"Acceso editorial",kicker:"PARTICIPA EN EVOFORD NEWS",title:"Envía tu noticia",intro:"Comparte una noticia, nota de prensa o artículo de opinión. Todo envío será revisado por la redacción. Enviar una propuesta no garantiza su publicación.",name:"Nombre y apellidos",email:"Correo electrónico",kind:"Tipo de contenido",headline:"Título",body:"Texto",bodyHelp:"Entre 50 y 30.000 caracteres.",files:"Adjuntos (opcional)",filesHelp:"Máximo 3 archivos de hasta 8 MB cada uno.",honeypot:"No rellenar",submit:"Enviar a la redacción",newsType:"Noticia",pressType:"Nota de prensa",opinionType:"Artículo de opinión",otherType:"Otro",expertType:"Colaboración experta / otra propuesta",expertIntro:"Cuéntanos tu experiencia, especialidad, el tema que propones y el formato que te interesa. La redacción revisará tu propuesta y contactará contigo si encaja en la línea editorial.",expertPlaceholder:"Cuéntanos tu experiencia, especialidad, el tema que propones y el formato que te interesa (entrevista, análisis, columna o conversación).",footer:"EVOFORD NEWS · Redacción"},
en:{pageTitle:"Submit a story | Evoford News",news:"Evoford News",admin:"Editorial login",kicker:"CONTRIBUTE TO EVOFORD NEWS",title:"Submit a story",intro:"Share a news story, press release or opinion article. Every submission is reviewed by the newsroom. Submission does not guarantee publication.",name:"Full name",email:"Email address",kind:"Content type",headline:"Title",body:"Text",bodyHelp:"Between 50 and 30,000 characters.",files:"Attachments (optional)",filesHelp:"Up to 3 files, maximum 8 MB each.",honeypot:"Do not fill in",submit:"Send to the newsroom",newsType:"News story",pressType:"Press release",opinionType:"Opinion article",otherType:"Other",expertType:"Expert collaboration / other proposal",expertIntro:"Tell us about your experience, area of expertise, proposed subject and preferred format. The newsroom will review your proposal and contact you if it fits our editorial approach.",expertPlaceholder:"Describe your experience, area of expertise, proposed subject and preferred format (interview, analysis, opinion column or conversation).",footer:"EVOFORD NEWS · Newsroom"}
};

const expertMode=new URLSearchParams(location.search).get("colaboracion")==="experta";
if(expertMode){
 dict.es.pageTitle="Propón una colaboración experta | Evoford News";
 dict.es.kicker="PARTICIPA CON TU EXPERIENCIA";
 dict.es.title="Comparte tu conocimiento";
 dict.es.intro="Este espacio es para profesionales, investigadores, fundadores de startups, emprendedores y especialistas que quieran aportar ideas y experiencia. No es un formulario para enviar noticias. Cuéntanos quién eres, qué sabes y qué conversación te gustaría abrir.";
 dict.es.headline="Tema o título que propones";
 dict.es.body="Tu experiencia y propuesta";
 dict.es.bodyHelp="Describe tu experiencia, el enfoque y el formato. Entre 50 y 30.000 caracteres.";
 dict.es.files="Material de apoyo (opcional)";
 dict.es.submit="Enviar propuesta de colaboración";
 dict.es.expertIntro="Puedes proponer una entrevista, análisis, columna, conversación o colaboración puntual. La redacción revisará tu propuesta y contactará contigo si encaja en el espacio editorial.";
 dict.es.expertPlaceholder="Tu trayectoria y especialidad; el tema que propones; qué conocimiento puedes compartir; y el formato que te interesa (entrevista, análisis, columna o conversación).";
 dict.es.footer="EVOFORD NEWS · COLABORACIONES EXPERTAS";
 dict.en.pageTitle="Propose an expert collaboration | Evoford News";
 dict.en.kicker="CONTRIBUTE YOUR EXPERTISE";
 dict.en.title="Share your knowledge";
 dict.en.intro="This space is for professionals, researchers, startup founders, entrepreneurs and specialists who want to contribute ideas and experience. It is not a news submission form. Tell us who you are, what you know and what conversation you would like to open.";
 dict.en.headline="Proposed topic or title";
 dict.en.body="Your experience and proposal";
 dict.en.bodyHelp="Describe your experience, angle and preferred format. Between 50 and 30,000 characters.";
 dict.en.files="Supporting material (optional)";
 dict.en.submit="Send collaboration proposal";
 dict.en.expertIntro="You can propose an interview, analysis, opinion column, conversation or one-off collaboration. The newsroom will review your proposal and contact you if it fits.";
 dict.en.expertPlaceholder="Your background and expertise; the topic you propose; the knowledge you can share; and your preferred format (interview, analysis, column or conversation).";
 dict.en.footer="EVOFORD NEWS · EXPERT COLLABORATIONS";
}
const buttons=[...document.querySelectorAll("[data-language]")];
function setLanguage(lang){const chosen=lang==="en"?"en":"es";document.documentElement.lang=chosen;document.title=dict[chosen].pageTitle;try{localStorage.setItem("evoford-news-language",chosen)}catch(e){}document.querySelectorAll("[data-i18n]").forEach(el=>{const key=el.dataset.i18n;if(dict[chosen][key])el.textContent=dict[chosen][key]});document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{const key=el.dataset.i18nPlaceholder;if(dict[chosen][key])el.placeholder=dict[chosen][key]});if(expertMode){const kind=document.getElementById("kindField");if(kind)kind.hidden=true;const kindSelect=document.getElementById("kind");if(kindSelect)kindSelect.value="otro";}buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.language===chosen)));}
buttons.forEach(b=>b.addEventListener("click",()=>setLanguage(b.dataset.language)));
let initial="es";try{initial=localStorage.getItem("evoford-news-language")==="en"?"en":"es"}catch(e){}setLanguage(initial);
})();