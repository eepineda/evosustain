let articles=[];
const $=s=>document.querySelector(s);
const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function label(a){return `<div class="storyLabel">${esc(a.category||'Insight')}</div>`}
function card(a){return `<a class="card" href="${esc(a.url||'#')}" target="_blank" rel="noopener"><div class="thumb"></div>${label(a)}<h3>${esc(a.title)}</h3><p>${esc(a.excerpt||'')}</p><div class="meta">${esc(a.source||'EvoSustain')} • ${esc(a.date||'')}</div></a>`}
function render(list){
 if(!list.length){$('#heroStory').innerHTML='<div class="storyContent"><div class="storyLabel">NO RESULTS</div><h2>Nothing matched your search.</h2><p>Try another term or browse the Journal sections.</p></div>';$('#sideStories').innerHTML='';return}
 let h=list[0]; $('#heroStory').innerHTML=`<div class="storyContent">${label(h)}<h2>${esc(h.title)}</h2><p>${esc(h.excerpt||'')}</p><div class="meta">${esc(h.source||'EvoSustain')} • ${esc(h.date||'')}</div></div>`;
 $('#sideStories').innerHTML=list.slice(1,5).map(a=>`<a class="sideStory" href="${esc(a.url||'#')}" target="_blank" rel="noopener">${label(a)}<h3>${esc(a.title)}</h3><p>${esc(a.excerpt||'')}</p></a>`).join('');
 const by=(name,n=3)=>list.filter(a=>(a.category||'').toLowerCase()===name.toLowerCase()).slice(0,n).map(card).join('')||list.slice(0,n).map(card).join('');
 $('#sustainGrid').innerHTML=by('Sustainability'); $('#techGrid').innerHTML=by('Technology'); $('#cityGrid').innerHTML=by('Smart Cities');
 $('#opsList').innerHTML=list.filter(a=>/waste|operation/i.test(a.category||'')).slice(0,4).map(a=>`<a class="featureItem" href="${esc(a.url||'#')}" target="_blank">${label(a)}<h3>${esc(a.title)}</h3><div class="meta">${esc(a.date||'')}</div></a>`).join('')||list.slice(0,4).map(a=>`<a class="featureItem" href="${esc(a.url||'#')}" target="_blank">${label(a)}<h3>${esc(a.title)}</h3></a>`).join('');
 $('#perspectiveGrid').innerHTML=list.slice(0,4).map(a=>`<a class="perspective" href="${esc(a.url||'#')}" target="_blank">${label(a)}<h3>${esc(a.title)}</h3><p>${esc(a.excerpt||'')}</p></a>`).join('');
 $('#ticker').textContent=list.slice(0,3).map(a=>a.title).join('  •  ');
}
async function load(){try{let r=await fetch('data/articles.json',{cache:'no-store'});articles=await r.json();render(articles)}catch(e){$('#heroStory').innerHTML='<div class="storyContent"><h2>Journal ready.</h2><p>Add stories to data/articles.json or run the RSS updater.</p></div>'}}
$('#searchOpen').onclick=()=>{$('#searchPanel').classList.toggle('open');if($('#searchPanel').classList.contains('open'))$('#search').focus()};
$('#searchBtn').onclick=()=>{let q=$('#search').value.toLowerCase().trim();render(q?articles.filter(a=>(a.title+' '+a.excerpt+' '+a.category+' '+a.source).toLowerCase().includes(q)):articles)};
$('#search').onkeydown=e=>{if(e.key==='Enter')$('#searchBtn').click()};
const menu=()=>{$('#mobilePanel').classList.toggle('open');$('#overlay').classList.toggle('open');document.body.classList.toggle('menuOpen')};
$('#menuBtn').onclick=menu;$('#menuClose').onclick=menu;$('#overlay').onclick=menu;document.querySelectorAll('#mobilePanel a').forEach(a=>a.onclick=()=>{if($('#mobilePanel').classList.contains('open'))menu()});document.onkeydown=e=>{if(e.key==='Escape'&&$('#mobilePanel').classList.contains('open'))menu()};
$('#newsletterForm').onsubmit=e=>{e.preventDefault();alert('Thanks — your subscription request has been received.')};
$('#today').textContent=new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'long',year:'numeric'}).format(new Date());$('#year').textContent=new Date().getFullYear();load();
