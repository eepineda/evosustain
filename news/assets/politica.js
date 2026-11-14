const SUPABASE_URL="https://poywsdigujbarvnzbfnz.supabase.co";
const SUPABASE_KEY="sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f";
const now=new Date();document.getElementById("today").textContent=now.toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric"});document.getElementById("year").textContent=now.getFullYear();
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function url(slug){return "articles/plantilla-articulo.html?slug="+encodeURIComponent(slug||"");}
function image(a){return a.image_url&&/^https:\/\//i.test(a.image_url)?'<img class="story-image" src="'+esc(a.image_url)+'" alt="'+esc(a.title||"")+'" loading="lazy">':'<div class="story-art art-blue"><span>POLÍTICA</span></div>';}
async function load(){
 const root=document.getElementById("politicsArticles"),lang=localStorage.getItem("evoford-news-language")==="en"?"en":"es";
 if(!window.supabase){root.innerHTML='<p class="empty-politics">'+(lang==="en"?"The news service is unavailable.":"No se pudo conectar con el servicio de noticias.")+'</p>';return;}
 const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
 const {data,error}=await client.from("articles").select("title,title_en,slug,category,author,summary,summary_en,image_url,created_at").eq("status","published").eq("category","Política").order("updated_at",{ascending:false}).limit(9);
 if(error){root.innerHTML='<p class="empty-politics">'+(lang==="en"?"Political stories could not be loaded at this time.":"No se pudieron cargar las noticias políticas en este momento.")+'</p>';console.error(error);return;}
 if(!data||!data.length){root.innerHTML='<p class="empty-politics">'+(lang==="en"?"There are no political stories published yet.":"Todavía no hay noticias políticas publicadas.")+'</p>';return;}
 const dateLocale=lang==="en"?"en-GB":"es-ES";
 root.innerHTML=data.map(a=>{
  const title=lang==="en"?(a.title_en||a.title):(a.title||"");
  const summary=lang==="en"?(a.summary_en||a.summary):(a.summary||"");
  const date=a.created_at?new Date(a.created_at).toLocaleDateString(dateLocale,{day:"numeric",month:"short",year:"numeric"}):"";
  return '<article class="story"><a class="story-link" href="'+url(a.slug)+'">'+image({...a,title})+'<div class="story-copy"><div class="kicker">'+(lang==="en"?"POLITICS":"POLÍTICA")+'</div><h3>'+esc(title)+'</h3><p>'+esc(summary)+'</p></div></a><div class="lead-meta">'+esc(a.author||"EVOFORD NEWS")+(date?" · "+date:"")+'</div><a class="read-link" href="'+url(a.slug)+'">'+(lang==="en"?"Read story ↗":"Leer noticia ↗")+'</a></article>';
 }).join("");
}


const historyEN={
 kicker:"NATIONAL TIMELINE · 182 YEARS",title:"From Independence to the modern Republic",intro:"A visual overview of the governments, presidents and events that have shaped Dominican political life.",
 legend:["Constitutional government","Transition / provisional","Annexation / occupation / institutional rupture"],
 periods:[
 ["First Republic","Independence, the Central Governing Junta and the first constitutional governments.","Central Governing Junta · 1844","Pedro Santana · 1844–1848; 1849; 1853–1856; 1858–1861","Manuel Jimenes · 1848–1849","Buenaventura Báez · 1849–1853; 1856–1858","Manuel de Regla Mota · 1856","José Desiderio Valverde · Rival government in Santiago, 1857–1858","1861 · Annexation to Spain"],
 ["Restoration and Second Republic","The Restoration War, changing governments and the consolidation of the State.","Restoration Government: José Antonio Salcedo, Gaspar Polanco and Pedro Antonio Pimentel · 1863–1865","José María Cabral · 1865–1866; 1867–1868","Buenaventura Báez · 1865–1866; 1868–1874; 1876–1878","Ignacio María González · 1873–1876; 1878","Ulises Francisco Espaillat · 1876","Cesáreo Guillermo · 1879","Gregorio Luperón · 1879–1880","Fernando Arturo de Meriño · 1880–1882","Ulises Heureaux (Lilís) · 1882–1884; 1887–1899","Francisco Gregorio Billini · 1884–1885","Alejandro Woss y Gil · 1885–1887; 1903","Wenceslao Figuereo · 1899","Horacio Vásquez · 1899–1902; 1924–1930","Juan Isidro Jimenes · 1902–1903; 1914–1916","Carlos Morales Languasco · 1903–1906","Ramón Cáceres · 1906–1911","Eladio Victoria · 1911–1912","Adolfo A. Nouel · 1912","José Bordas Valdez · 1912–1914","Francisco Henríquez y Carvajal · 1916","1916 · Beginning of the US military occupation"],
 ["Occupation and the Trujillo Era","Foreign military administration, the return to national government and dictatorship.","US military occupation · 1916–1924","Juan Bautista Vicini Burgos · Provisional government, 1922–1924","Horacio Vásquez · 1924–1930","Rafael Estrella Ureña · 1930","Rafael Leónidas Trujillo · 1930–1938; 1942–1952","Jacinto B. Peynado · 1938–1940","Manuel de Jesús Troncoso · 1940–1942","Héctor Bienvenido Trujillo · 1952–1960","Joaquín Balaguer · 1960–1962","1961 · End of the Trujillo dictatorship"],
 ["Transition and political crisis","Council of State, elections, coup, April War and provisional governments.","Council of State · 1962–1963","Juan Bosch · 1963","Triumvirate · 1963–1965","Francisco Alberto Caamaño · Constitutional government, 1965","Antonio Imbert Barreras · National Reconstruction Government, 1965","Héctor García Godoy · Provisional government, 1965–1966","Joaquín Balaguer · 1966–1978","1965 · April War and second US intervention"],
 ["Contemporary democracy","Electoral alternation and the succession of constitutional governments.","Antonio Guzmán Fernández · 1978–1982","Jacobo Majluta · 1982","Salvador Jorge Blanco · 1982–1986","Joaquín Balaguer · 1986–1996","Leonel Fernández · 1996–2000; 2004–2012","Hipólito Mejía · 2000–2004","Danilo Medina · 2012–2020","Luis Abinader · 2020–2028","2024–2028 · Current constitutional term"]
 ] ,
 note:"Historical note: this timeline distinguishes constitutional presidencies, provisional governments, juntas, de facto authorities and occupation administrations. Rival governments or interim authorities sometimes overlapped; dates may therefore overlap. This is a synthesis of mandates, not an exhaustive list of every temporary succession.",
 sources:"Research sources:"
};
function setHistoryLanguage(lang){
 const root=document.getElementById("historia-rd");if(!root)return;
 if(lang!=="en"){location.reload();return;}
 const t=historyEN;
 root.querySelector(".history-kicker").textContent=t.kicker;
 root.querySelector(".history-hero-copy h2").textContent=t.title;
 root.querySelector(".history-hero-copy p").textContent=t.intro;
 const ribbonEN=[["1844","Independence"],["1861–1865","Annexation and Restoration"],["1880–1899","State consolidation and caudillismo"],["1916–1924","US occupation"],["1930","Beginning of the Trujillo Era"],["1961","End of the dictatorship"],["1965","April War"],["1978","Democratic alternation"],["1996","New electoral period"],["2020–2026","Contemporary Republic"]];
 root.querySelectorAll(".ribbon-events>div").forEach((el,i)=>{if(ribbonEN[i]){el.querySelector("b").textContent=ribbonEN[i][0];el.querySelector("span").textContent=ribbonEN[i][1];}});
 root.querySelectorAll(".ribbon-track i").forEach((el,i)=>{const years=["1844","1861","1863","1916","1930","1961","1965","1978","1996","2020"];if(years[i])el.textContent=years[i];});
 root.querySelector(".history-map").setAttribute("aria-label","Map of Hispaniola highlighting the Dominican Republic");
 root.querySelector(".history-section-head h2").textContent="Dominican Republic · 1844–2026";
 root.querySelector(".history-section-head span").textContent="PRESIDENTIAL HISTORY AND CHANGES OF GOVERNMENT";
 root.querySelectorAll(".history-legend span").forEach((e,i)=>{const dot=e.querySelector("i");e.textContent=t.legend[i];if(dot)e.prepend(dot);});
 root.querySelectorAll(".history-period").forEach((card,i)=>{
  const p=t.periods[i];if(!p)return;
  card.querySelector("h3").textContent=p[0];card.querySelector(".period-note").textContent=p[1];
  const paragraphs=Array.from(card.querySelectorAll("p:not(.period-note)"));
  paragraphs.forEach((el,j)=>{const value=p[j+2];if(value)el.innerHTML=value.replace(/^([^·]+) ·/,"<b>$1</b> ·");});
  const event=card.querySelector(".period-event");if(event)event.textContent=p[p.length-1];
 });
 const note=root.querySelector(".history-footnote");if(note)note.innerHTML="<b>Historical note:</b> "+t.note.replace("Historical note: ","");
 const sources=root.querySelector(".history-sources");if(sources)sources.innerHTML="<b>Research sources:</b> "+sources.innerHTML.split("</b>")[1];
}

const en={
edition:"SPECIAL SECTION · DOMINICAN REPUBLIC",top:["London · United Kingdom","NEWS · OPINION · ANALYSIS"],
nav:["Home","International","Politics","Economy","Security","Startups & innovation","Opinion","Directory","Submit a story"],
kicker:"POLITICS · DOMINICAN REPUBLIC",title:"Power, ideas and public decisions.",
intro:"Coverage of Dominican political parties, government, Congress, elections and institutions, with attention to issues affecting citizens at home and abroad.",
subnav:["History 1844–2026","Political parties","Government","Congress","Elections","Diaspora"],
heads:["Political parties","Political news","Government and public administration","National Congress","Elections and electoral system","Politics and the diaspora"],
metas:["CURRENT PARTY LEADERS · AS OF 13 NOVEMBER 2026","NEWS PUBLISHED BY EVOFORD","EXECUTIVE BRANCH","LEGISLATIVE BRANCH","JCE · CITIZEN PARTICIPATION","UNITED KINGDOM · SPAIN · EUROPE"],
partyTeasers:["The party describes itself as democratic, liberal and progressive, highlighting human dignity, freedom and human development.","Leonel Fernández leads this organisation, which publishes its structure and institutional documents.","Founded by Juan Bosch, the PLD highlights social justice, democracy, freedom and inclusion.","One of the Dominican Republic’s historic political organisations, linked to participatory democracy.","The PRSC highlights social Christianity, social justice, democracy and national sovereignty.","Its statutes set out commitments to democracy, transparency, solidarity and environmental protection.","A political organisation recognised by the JCE, with a national leadership.","The JCE recognises other political organisations beyond those profiled here."],
partyDetails:[
"The party describes itself as democratic, liberal and progressive. Its institutional statement highlights human dignity, freedom and human development. President: Luis Abinader (2026–2030 term). Key leaders: Deligne Ascención, first vice-president; Juan Garrigó Mejía, secretary-general; Gloria Reyes, organisation secretary. José Ignacio Paliza was the outgoing president.",
"President: Leonel Fernández, founder of the organisation. Key leaders: Radhamés Jiménez, general coordinator; Antonio Florián (Peñita), secretary-general. The party publishes its Political Directorate and Central Directorate on its official website.",
"Founded by Juan Bosch. Its institutional documents highlight social justice, democracy, freedom and inclusion. President: Danilo Medina. Secretary-general: Johnny Pujols. Political Committee figures include Temístocles Montás, Cristina Lizardo, Iván Lorenzo, Abel Martínez and Francisco Javier García.",
"One of the Dominican Republic’s historic political organisations. Its principles refer to participatory democracy, active citizenship, equity and a social market economy. President: Miguel Vargas Maldonado. Key leaders: Peggy Cabral, secretary-general; Héctor Guzmán, executive president; Carlos Dicló, organisation secretary.",
"Its institutional website highlights social Christianity, social justice, democracy, national sovereignty and sustainable development. President: Federico Antún Batlle (Quique), re-elected for 2026–2030. Acting president: Rafael “Papito” Cruz. Secretary-general: José Balaguer. Organisation secretary: Eddy Antonio Germán.",
"Its statutes set out commitments to democracy, social justice, transparency, solidarity, equal rights, environmental protection and citizen sovereignty. President: Guillermo Moreno, confirmed in the 2025 internal renewal. Key leaders: Pedro Martínez, executive secretary; Fidelio Despradel, executive secretary for life.",
"An organisation included in the Junta Central Electoral’s register of recognised political parties. President: Mateo Espaillat (2025–2029 term). Key leaders: Gilberto Valdez, national first vice-president; Luis Coronado, secretary-general; Liqui Pascual, national organisation secretary. Eduardo Estrella is its founder and historic leader.",
"The JCE recognises other political organisations in addition to those profiled here. Evoford will add individual profiles using the same documentary approach and without favouring any party."
],
topicTitles:["Presidency","Government services","Foreign affairs","Senate","Chamber of Deputies","Laws and reforms","Electoral calendar","Voting from abroad","Political organisations","Overseas representation","Rights and services","Relations with Europe"],
topicTexts:[
"Coverage of decrees, appointments, executive decisions and public statements.",
"Need to renew a passport, request permission for a minor to travel, obtain a certificate or find a public service? The Dominican Government Services Portal lets you search services provided by different institutions, check requirements and access procedures available online or at Puntos GOB service centres.",
"Foreign policy, bilateral agreements, consulates and services for Dominican citizens living abroad.",
"Senate composition, parliamentary groups, committees, bills and legislative activity. The official website publishes party representation.",
"Chamber composition, parliamentary groups, committees, legislative initiatives and government oversight.",
"Explanations of bills, debates, approval, promulgation and when laws take effect.",
"Electoral calendars, resolutions, candidates, results and documents from the electoral authority.",
"Information on voting from abroad, constituencies, offices and procedures published by the electoral authority.",
"Register of recognised organisations, delegates, financial reports and rules governing parties and electoral processes.",
"Representation of the diaspora in Congress and participation by Dominicans living abroad.",
"Coverage of laws and programmes affecting documentation, pensions, housing, education, investment and return.",
"Bilateral relations, agreements, cooperation and measures that may affect Dominican communities in Europe."
],
topicTeasers:["Coverage of decrees, appointments, executive decisions and public statements.","Need to renew a passport, request permission for a minor to travel, obtain a certificate or find a public service?","Foreign policy, bilateral agreements, consulates and services for Dominicans living abroad.","Senate composition, parliamentary groups, committees, bills and legislative activity.","Chamber composition, parliamentary groups, committees, legislative initiatives and government oversight.","Explanations of bills, debates, approval, promulgation and when laws take effect.","Electoral calendars, resolutions, candidates, results and documents from the electoral authority.","Information on voting from abroad, constituencies, offices and procedures published by the electoral authority.","Register of recognised organisations, delegates, financial reports and rules governing parties and elections.","Representation of the diaspora in Congress and participation by Dominicans living abroad.","Laws and programmes affecting documents, pensions, housing, education, investment and return.","Bilateral relations, agreements, cooperation and measures affecting Dominican communities in Europe."],
links:["PRM history and principles ↗","Official website of Fuerza del Pueblo ↗","PLD history and documents ↗","PRD statutes and principles ↗","PRSC history, principles and news ↗","Read Alianza País statutes ↗","View the JCE register ↗","View the full official list ↗","Office of the President ↗","Dominican Government Services Portal ↗","Ministry of Foreign Affairs ↗","Party representation in the Senate ↗","Chamber of Deputies ↗","Legal Consultancy of the Executive Branch ↗","Central Electoral Board ↗","Official electoral information ↗","Political Parties Directorate ↗","Senate composition ↗","Consular and foreign services ↗","Foreign affairs ↗"],
note:"How to read these profiles: we summarise each organisation’s history and stated principles; this is not an endorsement by Evoford News. Links point to party documents or public institutions. Leadership details reflect public information located as of 13 November 2026. Party leadership can change; consult institutional sources and the JCE register for updates.",
editorial:"Editorial policy: Evoford News will cover organisations neutrally, identify sources, distinguish reporting from opinion and update representation and recognition details using official documents."
};
window.setPoliticsLanguage=function(lang){
 const t=lang==="en"?en:null;localStorage.setItem("evoford-news-language",lang);document.documentElement.lang=lang;
 document.querySelectorAll("[data-language]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.language===lang)));
 const set=(s,v)=>{const e=document.querySelector(s);if(e)e.textContent=v;};
 if(!t){location.reload();return;}
 set("#editionLabel",t.edition);document.querySelectorAll(".topline span").forEach((e,i)=>e.textContent=t.top[i]||e.textContent);
 document.querySelectorAll(".masthead .nav a").forEach((e,i)=>e.textContent=t.nav[i]||e.textContent);
 set(".politics-intro .kicker",t.kicker);set(".politics-intro h1",t.title);set(".politics-intro p",t.intro);setHistoryLanguage("en");
 document.querySelectorAll(".politics-nav a").forEach((e,i)=>e.textContent=t.subnav[i]||e.textContent);
 document.querySelectorAll(".section-head").forEach((e,i)=>{if(t.heads[i])e.querySelector("h2").textContent=t.heads[i];if(t.metas[i])e.querySelector("span").textContent=t.metas[i];});
 const note=document.querySelector("#partidos .editorial-note");if(note)note.innerHTML="<b>How to read these profiles: </b>"+t.note.replace("How to read these profiles: ","");
 document.querySelectorAll(".party-card").forEach((e,i)=>{const teaser=e.querySelector(".card-teaser"),p=e.querySelector(".party-details p"),a=e.querySelector(".party-details a");if(teaser)teaser.textContent=t.partyTeasers[i]||"";if(p)p.textContent=t.partyDetails[i]||"";if(a)a.textContent=t.links[i]||a.textContent;});
 document.querySelectorAll(".politics-topic").forEach((e,i)=>{const title=e.querySelector(".politics-topic-heading"),teaser=e.querySelector(".card-teaser"),p=e.querySelector(".politics-topic-details p"),a=e.querySelector(".politics-topic-details a");if(title)title.textContent=t.topicTitles[i]||"";if(teaser)teaser.textContent=t.topicTeasers[i]||"";if(p)p.textContent=t.topicTexts[i]||"";if(a)a.textContent=t.links[i+8]||a.textContent;});
 const editorial=document.querySelector("main>.editorial-note");if(editorial)editorial.innerHTML="<b>Editorial policy: </b>"+t.editorial.replace("Editorial policy: ","");
 const footer=document.querySelector("footer>span:nth-of-type(1)");if(footer)footer.textContent="News · Opinion · Analysis";
 const today=document.getElementById("today");if(today)today.textContent=now.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
}
document.querySelectorAll("[data-language]").forEach(b=>b.addEventListener("click",()=>{setPoliticsLanguage(b.dataset.language);load();}));
if(localStorage.getItem("evoford-news-language")==="en")setPoliticsLanguage("en");

load();