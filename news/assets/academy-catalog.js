(() => {
 const URL="https://poywsdigujbarvnzbfnz.supabase.co",KEY="sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f";
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const en=()=>document.documentElement.lang==="en", title=c=>(en()?c.title_en:c.title)||c.title_en||c.title, summary=c=>(en()?c.summary_en:c.summary)||c.summary_en||c.summary||"", status=s=>en()?(s==="available"?"AVAILABLE":"COMING SOON"):(s==="available"?"DISPONIBLE":"PRÓXIMAMENTE");
 const href=s=>"enviar.html?curso=interes&course="+encodeURIComponent(s);
 let rows=[];
 function programme(c){const ms=Array.isArray(c.curriculum)?c.curriculum:[];return ms.length?'<details class="academy-program-details"><summary>'+(en()?"View course programme":"Ver programa del curso")+'</summary><ol>'+ms.map(m=>'<li><strong>'+esc(m.title)+'</strong>'+(m.lessons?.length?'<ul>'+m.lessons.map(l=>'<li>'+esc(typeof l==="string"?l:l.title)+'</li>').join("")+'</ul>':'')+'</li>').join("")+'</ol></details>':"";}
 function render(){
  const section=document.getElementById("courses");
  if(section&&rows.length){
   const old=section.querySelector(".academy-featured-course"),grid=section.querySelector(".academy-course-grid");
   if(old&&grid){
    const c=rows[0],mods=Array.isArray(c.curriculum)?c.curriculum:[],lessons=c.lesson_count||mods.reduce((n,m)=>n+(m.lessons?.length||0),0),moduleCount=c.module_count||mods.length;
    old.outerHTML='<article class="academy-featured-course"><div class="course-feature-top"><span class="course-live">'+status(c.status)+'</span><span class="course-number">01</span></div><div class="course-feature-body"><div class="course-symbol">EV</div><div><span class="academy-overline">'+esc(c.category||"EVOFORD ACADEMY")+'</span><h3>'+esc(title(c))+'</h3><p>'+esc(summary(c))+'</p><div class="course-tags"><span>'+mods.length+' '+(en()?"modules":"módulos")+'</span><span>'+lessons+' '+(en()?"lessons":"lecciones")+'</span><span>'+esc(c.language||"es").toUpperCase()+'</span></div>'+programme(c)+'<a class="academy-primary" href="'+href(c.slug)+'">'+(en()?"Request information":"Solicitar información")+' ↗</a></div></div></article>';
    const next=document.createElement("div");next.className="academy-course-grid";next.innerHTML=rows.slice(1).map((x,i)=>'<article class="academy-course-card"><div class="course-card-top"><span class="course-soon">'+status(x.status)+'</span><span>'+String(i+2).padStart(2,"0")+'</span></div><div class="course-symbol">EV</div><h3>'+esc(title(x))+'</h3><p>'+esc(summary(x))+'</p>'+programme(x)+'<a class="academy-course-request" href="'+href(x.slug)+'">'+(en()?"Request information":"Solicitar información")+' ↗</a></article>').join("");grid.replaceWith(next);
   }
   const note=document.getElementById("catalogNote");if(note)note.textContent=en()?"Courses marked coming soon accept expressions of interest.":"Los cursos marcados como próximamente permiten registrar interés.";
  }
  const select=document.getElementById("courseChoice");
  if(select&&rows.length){
   const chosen=new URLSearchParams(location.search).get("course")||select.value;
   select.innerHTML='<option value="">'+(en()?"Select a course":"Selecciona un curso")+'</option>'+rows.map(c=>'<option value="'+esc(c.slug)+'">'+esc(title(c))+' · '+status(c.status)+'</option>').join("");
   if(rows.some(c=>c.slug===chosen))select.value=chosen;
  }
 }
 async function init(){
  if(!window.supabase)return;
  const db=window.supabase.createClient(URL,KEY);
  const {data,error}=await db.from("academy_courses").select("slug,title,title_en,category,summary,summary_en,language,status,curriculum,module_count,lesson_count,display_order").in("status",["available","coming_soon"]).order("display_order").order("created_at");
  if(error||!data?.length)return;rows=data;render();
  document.querySelectorAll("[data-language]").forEach(b=>b.addEventListener("click",()=>setTimeout(render,0)));
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();