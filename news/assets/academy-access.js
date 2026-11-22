(() => {
  const URL = "https://poywsdigujbarvnzbfnz.supabase.co";
  const KEY = "sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f";
  const COURSE = "ia-practica";
  const $ = id => document.getElementById(id);
  const gate = $("academyGate");
  if (!gate || !window.supabase) return;
  const client = window.supabase.createClient(URL, KEY);
  let currentUser = null;
  const language = () => window.evofordAcademyGetLanguage?.() || "es";
  const tr = (es,en) => language()==="en"?en:es;
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
      empty.textContent=tr("Todavía no tienes cursos con acceso activo. Puedes solicitar admisión desde la página de acceso.","You do not have any active courses yet. You can apply for admission from the sign-in page.");
      host.append(empty);return;
    }
    const counts={};
    (progressRows||[]).forEach(row=>{counts[row.course_slug]=(counts[row.course_slug]||0)+1;});
    enrollments.forEach(enrollment=>{
      const card=document.createElement("article");card.className="academy-course-card";
      const tag=document.createElement("span");tag.className="academy-course-tag";tag.textContent=tr("MATRÍCULA ACTIVA","ACTIVE ENROLMENT");
      const title=document.createElement("h2");title.textContent=enrollment.course_title||enrollment.course_slug;
      const description=document.createElement("p");
      const isIa=enrollment.course_slug==="ia-practica";
      description.textContent=isIa?tr("Formación práctica en inteligencia artificial aplicada. Quince módulos, treinta lecciones, práctica de recuperación y proyecto profesional final.","Practical training in applied artificial intelligence. Twenty modules, forty lessons, practical cases and a professional capstone.") : tr("Curso autorizado en tu cuenta. El contenido se habilitará en este espacio cuando esté publicado.","This course is authorised for your account. Its content will be available here when published.");
      card.append(tag,title,description);
      const count=counts[enrollment.course_slug]||0;
      const total=isIa?40:null;
      if(total!==null){
        const bar=document.createElement("div");bar.className="academy-course-progress";
        const fill=document.createElement("span");fill.style.width=Math.min(100,Math.round(count/total*100))+"%";bar.append(fill);
        const label=document.createElement("div");label.className="academy-course-progress-label";label.textContent=language()==="en"?count+" of "+total+" lessons completed":count+" de "+total+" lecciones completadas";
        card.append(bar,label);
      }
      const button=document.createElement("button");button.type="button";button.className="academy-course-open";
      button.textContent=isIa?tr("Entrar al curso","Open course"):tr("Contenido próximamente","Content coming soon");
      button.disabled=!isIa;
      if(isIa)button.dataset.courseSlug=enrollment.course_slug;
      card.append(button);host.append(card);
    });
  };
  const openCourse = async slug => {
    if(!currentUser){view("login");message("academyLoginMessage",tr("Tu sesión ha caducado. Vuelve a iniciar sesión.","Your session has expired. Please sign in again."),true);return;}
    if(slug!==COURSE){message("academyDashboardMessage",tr("Este curso todavía no tiene contenido publicado.","This course content has not been published yet."),true);return;}
    const buttons=Array.from($("academyCourseCards")?.querySelectorAll("[data-course-slug]")||[]);
    const button=buttons.find(el=>el.dataset.courseSlug===slug);
    if(button){button.disabled=true;button.textContent=tr("Abriendo el curso…","Opening course…");}
    message("academyDashboardMessage",tr("Cargando tus lecciones…","Loading your lessons…"));
    try{
      currentCourseSlug=slug;
      const {data:rows,error}=await client.from("academy_progress").select("lesson_index").eq("user_id",currentUser.id).eq("course_slug",slug);
      if(error)throw error;
      window.evofordAcademySetProgress((rows||[]).map(x=>Number(x.lesson_index)));
      showCourse();
      if(typeof window.evofordAcademyStart==="function")window.evofordAcademyStart();
      else throw new Error("No se pudo iniciar el contenido del curso.");
    }catch(err){
      console.error("[EVOFORD ACADEMY] Error al abrir el curso:",err);
      view("dashboard");
      const detail=err?.message?String(err.message).slice(0,180):"Error desconocido";
      message("academyDashboardMessage",tr("No se pudo abrir el curso: ","Could not open the course: ")+detail,true);
    }finally{
      if(button){button.disabled=false;button.textContent=tr("Entrar al curso","Open course");}
    }
  };
  $("academyCourseCards")?.addEventListener("click",event=>{
    const button=event.target.closest("[data-course-slug]");
    if(!button||button.disabled)return;
    event.preventDefault();
    openCourse(button.dataset.courseSlug);
  });
  const showDashboard = async () => {
    view("checking");
    const {data:enrollments,error}=await client.from("academy_enrollments").select("course_slug,course_title,status").eq("user_id",currentUser.id).eq("status","active").order("approved_at",{ascending:false});
    if(error){view("login");message("academyLoginMessage",tr("No se pudieron cargar tus cursos. Vuelve a iniciar sesión.","Could not load your courses. Please sign in again."),true);return;}
    const {data:progressRows,error:progressError}=await client.from("academy_progress").select("course_slug,lesson_index").eq("user_id",currentUser.id);
    if(progressError){view("login");message("academyLoginMessage",tr("No se pudo cargar tu progreso. Vuelve a iniciar sesión.","Could not load your progress. Please sign in again."),true);return;}
    renderCourseCards(enrollments||[],progressRows||[]);
    view("dashboard");
  };
  const checkAccess = async user => {
    currentUser=user;
    if(inviteFlow){view("password");return;}
    await showDashboard();
  };
  window.evofordAcademySubmitProject = async payload => {
    if(!currentUser)throw new Error(tr("Tu sesión ha caducado. Vuelve a iniciar sesión.","Your session has expired. Please sign in again."));
    const project={
      user_id:currentUser.id,
      student_name:String(currentUser.user_metadata?.full_name||currentUser.user_metadata?.name||currentUser.email||"Alumno").slice(0,180),
      student_email:String(currentUser.email||"").slice(0,254),
      course_slug:currentCourseSlug,
      project_name:String(payload.project_name||"").trim(),
      problem:String(payload.problem||"").trim(),
      solution:String(payload.solution||"").trim(),
      measurement:String(payload.measurement||"").trim(),
      evidence:String(payload.evidence||"").trim().slice(0,8000),
      quiz_score:Number.isInteger(payload.quiz_score)?payload.quiz_score:null
    };
    if(project.project_name.length<2||project.problem.length<10||project.solution.length<10||project.measurement.length<5)
      throw new Error(tr("Completa todos los campos del proyecto antes de enviarlo.","Complete all project fields before submitting."));
    const {data,error}=await client.from("academy_project_submissions").insert(project).select("id,status,created_at").single();
    if(error)throw error;
    return data;
  };
  window.evofordAcademyGetProjectReview = async () => {
    if(!currentUser)return null;
    const {data,error}=await client.from("academy_project_submissions").select("id,project_name,status,final_score,reviewer_notes,reviewed_at,created_at").eq("user_id",currentUser.id).eq("course_slug",currentCourseSlug).order("created_at",{ascending:false}).limit(1).maybeSingle();
    if(error)throw error;
    return data||null;
  };
  window.evofordAcademySaveLesson = async index => {
    if(!currentUser)return;
    const {error}=await client.from("academy_progress").upsert({
      user_id:currentUser.id,course_slug:currentCourseSlug,lesson_index:Number(index),completed_at:new Date().toISOString()
    },{onConflict:"user_id,course_slug,lesson_index"});
    if(error) message("academyRuntimeMessage",tr("No se pudo guardar el avance. Comprueba tu conexión.","Could not save your progress. Check your connection."),true);
    else message("academyRuntimeMessage",tr("Progreso guardado en tu cuenta.","Progress saved to your account."));
  };
  $("academyLoginForm").addEventListener("submit",async e=>{
    e.preventDefault();const button=$("academyLoginButton");button.disabled=true;
    message("academyLoginMessage",tr("Comprobando acceso…","Checking access…"));
    try{
      const {data,error}=await client.auth.signInWithPassword({email:$("academyLoginEmail").value.trim().toLowerCase(),password:$("academyLoginPassword").value});
      if(error)throw error;
      await checkAccess(data.user);
    }catch(err){message("academyLoginMessage",err.message||"No se pudo iniciar sesión.",true);}
    finally{button.disabled=false;}
  });
  $("academyRequestForm").addEventListener("submit",async e=>{
    e.preventDefault();if($("academyWebsite")?.value)return;const button=$("academyRequestButton");button.disabled=true;
    message("academyRequestMessage",tr("Enviando solicitud…","Submitting application…"));
    try{
      const payload={full_name:$("academyRequestName").value.trim(),email:$("academyRequestEmail").value.trim().toLowerCase(),
        course_interest:"Aprender a utilizar la inteligencia artificial · EVOFORD ACADEMY",status:"received",message:"País: "+$("academyRequestCountry").value.trim()+"\nCiudad: "+$("academyRequestCity").value.trim()+"\n\n"+$("academyRequestMessageText").value.trim()};
      const {error}=await client.from("course_enquiries").insert(payload);
      if(error)throw error;
      e.target.reset();message("academyRequestMessage",tr("Solicitud recibida. El equipo revisará tus datos y te contactará por correo.","Application received. Our team will review your details and contact you by email."));
    }catch(err){message("academyRequestMessage",tr("No se pudo enviar la solicitud. Revisa los datos e inténtalo de nuevo.","Could not submit your application. Check the details and try again."),true);}
    finally{button.disabled=false;}
  });
  $("academyForgotForm").addEventListener("submit",async e=>{
    e.preventDefault();const email=$("academyForgotEmail").value.trim().toLowerCase();
    const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:"https://evoford.com/news/aula-virtual.html"});
    message("academyForgotMessage",error?tr("No se pudo enviar el enlace de recuperación.","Could not send the password reset link."):tr("Si la cuenta existe, recibirás un enlace para restablecer la contraseña.","If the account exists, you will receive a password reset link."),!!error);
  });
  $("academyPasswordForm").addEventListener("submit",async e=>{
    e.preventDefault();const password=$("academyNewPassword").value;
    if(password.length<10){message("academyPasswordMessage",tr("Utiliza al menos 10 caracteres.","Use at least 10 characters."),true);return;}
    const {error}=await client.auth.updateUser({password});
    if(error){message("academyPasswordMessage",error.message,true);return;}
    inviteFlow=false;message("academyPasswordMessage",tr("Contraseña configurada. Abriendo tu aula…","Password set. Opening your classroom…"));
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
    if(error){view("login");message("academyLoginMessage",tr("No se pudo iniciar el servicio de acceso.","The sign-in service could not be started."),true);return;}
    if(data.session)await checkAccess(data.session.user);
    else if(inviteFlow)view("password");
    else view("login");
  })();
})();