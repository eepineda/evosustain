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
  const view = name => {
    gate.querySelectorAll("[data-academy-view]").forEach(el => el.hidden=el.dataset.academyView!==name);
    gate.hidden=false;
    document.querySelector(".virtual-shell").style.display="none";
  };
  const showCourse = () => {
    gate.hidden=true;
    document.querySelector(".virtual-shell").style.display="block";
  };
  const checkAccess = async user => {
    currentUser=user;
    if(inviteFlow){view("password");return;}
    view("checking");
    const {data,error}=await client.from("academy_enrollments").select("id,status,course_slug")
      .eq("user_id",user.id).eq("course_slug",COURSE).maybeSingle();
    if(error){view("login");message("academyLoginMessage","No se pudo comprobar tu autorización. Inténtalo de nuevo.",true);return;}
    if(!data || data.status!=="active"){view("pending");$("academyPendingEmail").textContent=user.email||"";return;}
    const {data:rows,error:progressError}=await client.from("academy_progress").select("lesson_index")
      .eq("user_id",user.id).eq("course_slug",COURSE);
    if(progressError){view("login");message("academyLoginMessage","No se pudo cargar tu progreso. Vuelve a iniciar sesión.",true);return;}
    window.evofordAcademySetProgress((rows||[]).map(x=>Number(x.lesson_index)));
    showCourse();
    window.evofordAcademyStart?.();
  };
  window.evofordAcademySaveLesson = async index => {
    if(!currentUser)return;
    const {error}=await client.from("academy_progress").upsert({
      user_id:currentUser.id,course_slug:COURSE,lesson_index:Number(index),completed_at:new Date().toISOString()
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