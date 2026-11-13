const sb=window.supabase.createClient("https://poywsdigujbarvnzbfnz.supabase.co","sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f",{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
const form=document.getElementById("submissionForm"),msg=document.getElementById("msg");
const submissionParams=new URLSearchParams(location.search);
if(submissionParams.get("colaboracion")==="experta"){
 const expertIntro=document.getElementById("expert-intro");
 if(expertIntro){expertIntro.hidden=false;expertIntro.style.display="block";}
 document.getElementById("kind").value="otro";
 const kindField=document.getElementById("kindField");if(kindField)kindField.hidden=true;
 document.getElementById("title").value="Propuesta de colaboración experta";
}
const courseRequest=submissionParams.get("curso")==="interes";
if(courseRequest){
 const courseIntro=document.getElementById("course-intro");
 if(courseIntro){courseIntro.hidden=false;courseIntro.style.display="block";}
 document.getElementById("kind").value="otro";
 document.getElementById("title").value="Solicitud de información e inscripción en cursos";
 document.getElementById("body").value="Me interesa recibir información sobre los cursos del Aula de Innovación Evoford.\n\nCurso o cursos que me interesan:\n\nMi consulta o disponibilidad:\n";
}

const types=["image/jpeg","image/png","image/webp","application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
form.addEventListener("submit",async e=>{e.preventDefault();if(document.getElementById("website").value)return;const b=form.querySelector("button"),files=[...document.getElementById("files").files];if(files.length>3||files.some(f=>!types.includes(f.type)||f.size>8*1024*1024)){msg.textContent=document.documentElement.lang==="en"?"Check the attachments: up to 3 allowed files, each no larger than 8 MB.":"Revisa los adjuntos: máximo 3 archivos permitidos de hasta 8 MB.";return;}b.disabled=true;msg.textContent=document.documentElement.lang==="en"?"Sending…":"Enviando…";try{const paths=[];for(const f of files){const ext=f.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g,"");const path=crypto.randomUUID()+"."+ext;const {error}=await sb.storage.from("news-submissions").upload(path,f,{contentType:f.type});if(error)throw error;paths.push(path);}const payload={sender_name:document.getElementById("name").value.trim(),sender_email:document.getElementById("email").value.trim(),submission_type:document.getElementById("kind").value,title:document.getElementById("title").value.trim(),body:document.getElementById("body").value.trim(),attachment_paths:paths};const {error}=await sb.from("article_submissions").insert(payload);if(error)throw error;form.reset();msg.textContent=courseRequest?(document.documentElement.lang==="en"?"Your course enquiry has been sent to the Evoford team. We will contact you by email.":"Tu solicitud sobre los cursos ha llegado al equipo de Evoford. Nos pondremos en contacto contigo por correo electrónico."): (document.documentElement.lang==="en"?"Your submission has reached the newsroom. Thank you for contributing.":"Tu propuesta ha llegado a la redacción. Gracias por colaborar.");}catch(err){console.error("Error en envío editorial:",err);const detail=err?.message||err?.error_description||"Error desconocido";msg.textContent=(document.documentElement.lang==="en"?"Submission failed: ":"No se pudo completar el envío: ")+detail;}finally{b.disabled=false;}});