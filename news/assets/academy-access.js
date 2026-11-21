(() => {
  const URL = "https://poywsdigujbarvnzbfnz.supabase.co";
  const KEY = "sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f";
  const COURSE = "ia-practica";
  const $ = id => document.getElementById(id);
  const gate = $("academyGate");
  if (!gate || !window.supabase) return;
  const client = window.supabase.createClient(URL, KEY);
  let currentUser = null;
  let inviteFlow = /type=(invite|recovery)/.test(location.hash);
  const message = (id, value, bad=false) => {
    const node=$(id); if(!node)return;
    node.textContent=value||"";
    node.classList.toggle("is-error",!!bad);
  };
  let currentCourseSlug = COURSE;
  const view = name => {
    gate.querySelectorAll("[data-academy-view]").forEach(el => el.hidden=el.dataset.academyView!==name);
    gate.hidden=false;
    gate.querySelector(".academy-gate-card").classList.toggle("academy-gate-card-wide",name==="dashboard");
    document.querySelector(".virtual-shell").style.display="none";
  };
  const showCourse = () => {
    gate.hidden=true;
    document.querySelector(".virtual-shell").style.display="block";
  };
  const renderCourseCards = (enrollments, progressRows) => {
    const host=$("academyCourseCards");
    host.replaceChildren();
    if(!enrollments.length){
      const empty=document.createElement("div");
      empty.className="academy-dashboard-empty";
      empty.textContent="Todavía no tienes cursos con acceso activo. Puedes solicitar admisión desde la página de acceso.";
      host.append(empty);return;
    }
    const counts={};
    (progressRows||[]).forEach(row=>{counts[row.course_slug]=(counts[row.course_slug]||0)+1;});
    enrollments.forEach(enrollment=>{
      const card=document.createElement("article");card.className="academy-course-card";
      const tag=document.createElement("span");tag.className="academy-course-tag";tag.textContent="MATRÍCULA ACTIVA";
      const title=document.createElement("h2");title.textContent=enrollment.course_title||enrollment.course_slug;
      const description=document.createElement("p");
      const isIa=enrollment.course_slug==="ia-practica";
      description.textContent=isIa?"Formación práctica en inteligencia artificial aplicada. Diez módulos, ejercicios y proyecto final.":"Curso autorizado en tu cuenta. El contenido se habilitará en este espacio cuando esté publicado.";
      card.append(tag,title,description);
      const count=counts[enrollment.course_slug]||0;
      const total=isIa?20:null;
      if(total!==null){
        const bar=document.createElement("div");bar.className="academy-course-progress";
        const fill=document.createElement("span");fill.style.width=Math.min(100,Math.round(count/total*100))+"%";bar.append(fill);
        const label=document.createElement("div");label.className="academy-course-progress-label";label.textContent=count+" de "+total+" lecciones completadas";
        card.append(bar,label);
      }
      const button=document.createElement("button");button.type="button";button.className="academy-course-open";
      button.textContent=isIa?"Entrar al curso":"Contenido próximamente";
      button.disabled=!isIa;
      if(isIa)button.addEventListener("click",()=>openCourse(enrollment.course_slug));
      card.append(button);host.append(card);
    });
  };
  const openCourse = async slug => {
    if(slug!==COURSE){message("academyDashboardMessage","Este curso todavía no tiene contenido publicado.",true);return;}
    currentCourseSlug=slug;
    const {data:rows,error}=await client.from("academy_progress").select("lesson_index").eq("user_id",currentUser.id).eq("course_slug",slug);
    if(error){view("dashboard");message("academyDashboardMessage","No se pudo cargar el progreso de este curso.",true);return;}
    window.evofordAcademySetProgress((rows||[]).map(x=>Number(x.lesson_index)));
    showCourse();window.evofordAcademyStart?.();
  };
  const showDashboard = async () => {
    view("checking");
    const {data:enrollments,error}=await client.from("academy_enrollments").select("course_slug,course_title,status").eq("user_id",currentUser.id).eq("status","active").order("approved_at",{ascending:false});
    if(error){view("login");message("academyLoginMessage","No se pudieron cargar tus cursos. Vuelve a iniciar sesión.",true);return;}
    const {data:progressRows,error:progressError}=await client.from("academy_progress").select("course_slug,lesson_index").eq("user_id",currentUser.id);
    if(progressError){view("login");message("academyLoginMessage","No se pudo cargar tu progreso. Vuelve a iniciar sesión.",true);return;}
    renderCourseCards(enrollments||[],progressRows||[]);
    view("dashboard");
  };
  const checkAccess = async user => {
    currentUser=user;
    if(inviteFlow){view("password");return;}
    await showDashboard();
  };
  window.evofordAcademySaveLesson = async index => {
    if(!currentUser)return;
    const {error}=await client.from("academy_progress").upsert({
      user_id:currentUser.id,course_slug:currentCourseSlug,lesson_index:Number(index),completed_at:new Date().toISOString()
    },{onConflict:"user_id,course_slug,lesson_index"});
    if(error) message("academyRuntimeMessage","No se pudo guardar el avance. Comprueba tu conexión.",true);
    else message("academyRuntimeMessage","Progreso guardado en tu cuenta.");
  };
  $("academyLoginForm").addEventListener("submit",async e=>{
    e.preventDefault();const button=$("academyLoginButton");button.disabled=true;
    message("academyLoginMessage","Comprobando acceso…");
    try{
      const {data,error}=await client.auth.signInWithPassword({email:$("academyLoginEmail").value.trim().toLowerCase(),password:$("academyLoginPassword").value});
      if(error)throw error;
      await checkAccess(data.user);
    }catch(err){message("academyLoginMessage",err.message||"No se pudo iniciar sesión.",true);}
    finally{button.disabled=false;}
  });
  $("academyRequestForm").addEventListener("submit",async e=>{
    e.preventDefault();if($("academyWebsite")?.value)return;const button=$("academyRequestButton");button.disabled=true;
    message("academyRequestMessage","Enviando solicitud…");
    try{
      const payload={full_name:$("academyRequestName").value.trim(),email:$("academyRequestEmail").value.trim().toLowerCase(),
        course_interest:"Aprender a utilizar la inteligencia artificial · EVOFORD ACADEMY",message:$("academyRequestMessageText").value.trim()};
      const {error}=await client.from("course_enquiries").insert(payload);
      if(error)throw error;
      e.target.reset();message("academyRequestMessage","Solicitud recibida. El equipo revisará tus datos y te contactará por correo.");
    }catch(err){message("academyRequestMessage","No se pudo enviar la solicitud. Revisa los datos e inténtalo de nuevo.",true);}
    finally{button.disabled=false;}
  });
  $("academyForgotForm").addEventListener("submit",async e=>{
    e.preventDefault();const email=$("academyForgotEmail").value.trim().toLowerCase();
    const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:"https://evoford.com/news/aula-virtual.html"});
    message("academyForgotMessage",error?"No se pudo enviar el enlace de recuperación.":"Si la cuenta existe, recibirás un enlace para restablecer la contraseña.",!!error);
  });
  $("academyPasswordForm").addEventListener("submit",async e=>{
    e.preventDefault();const password=$("academyNewPassword").value;
    if(password.length<10){message("academyPasswordMessage","Utiliza al menos 10 caracteres.",true);return;}
    const {error}=await client.auth.updateUser({password});
    if(error){message("academyPasswordMessage",error.message,true);return;}
    inviteFlow=false;message("academyPasswordMessage","Contraseña configurada. Abriendo tu aula…");
    const {data}=await client.auth.getUser();if(data.user)await checkAccess(data.user);
  });
  $("academyLogoutButton")?.addEventListener("click",async()=>{await client.auth.signOut();currentUser=null;view("login");});
  $("academyMyCourses")?.addEventListener("click",showDashboard);
  $("academyDashboardLogout")?.addEventListener("click",async()=>{await client.auth.signOut();currentUser=null;view("login");});
  $("academyRequestToggle").addEventListener("click",()=>view("request"));
  $("academyBackLogin").addEventListener("click",()=>view("login"));
  $("academyForgotToggle").addEventListener("click",()=>view("forgot"));
  $("academyShowLogin").addEventListener("click",()=>view("login"));
  $("academyPendingLogout").addEventListener("click",async()=>{await client.auth.signOut();currentUser=null;view("login");});
  (async()=>{
    view("checking");
    const {data,error}=await client.auth.getSession();
    if(error){view("login");message("academyLoginMessage","No se pudo iniciar el servicio de acceso.",true);return;}
    if(data.session)await checkAccess(data.session.user);
    else if(inviteFlow)view("password");
    else view("login");
  })();
})();