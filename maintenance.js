(function(){
  if(location.pathname.startsWith("/news/admin/")){document.documentElement.classList.remove("evo-maintenance-checking");return;}
  const SUPABASE_URL="https://poywsdigujbarvnzbfnz.supabase.co";
  const SUPABASE_KEY="sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f";
  const reveal=()=>document.documentElement.classList.remove("evo-maintenance-checking");
  const showPage=()=>{
    document.body.innerHTML=`<main class="evo-maintenance"><div class="evo-maintenance-card"><div class="evo-maintenance-brand">EVOFORD</div><div class="evo-maintenance-rule"></div><section lang="es"><p class="evo-maintenance-kicker">VOLVEMOS EN BREVE</p><h1>Estamos realizando mejoras.</h1><p>Estamos trabajando en nuestra web para ofrecerte una mejor experiencia. Volveremos a estar disponibles próximamente.</p><small>Gracias por tu paciencia.</small></section><div class="evo-maintenance-divider"></div><section lang="en"><p class="evo-maintenance-kicker">BACK SOON</p><h2>We are making improvements.</h2><p>We are working on our website to give you a better experience. We will be back online shortly.</p><small>Thank you for your patience.</small></section><a href="mailto:info@evoford.com">info@evoford.com</a></div></main>`;
    document.documentElement.classList.remove("evo-maintenance-checking");
  };
  const style=document.createElement("style");
  style.textContent=".evo-maintenance{min-height:100vh;display:grid;place-items:center;padding:28px;background:linear-gradient(135deg,#071b2e,#102f50);font-family:Arial,sans-serif;color:#fff}.evo-maintenance-card{width:min(680px,100%);padding:clamp(28px,7vw,64px);border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.22)}.evo-maintenance-brand{font-size:28px;font-weight:800;letter-spacing:.16em}.evo-maintenance-rule{height:3px;width:58px;background:#c71932;margin:22px auto 34px}.evo-maintenance-kicker{font-size:11px;letter-spacing:.2em;font-weight:700;color:#c7d5e5}.evo-maintenance h1,.evo-maintenance h2{font-size:clamp(29px,5vw,42px);line-height:1.08;margin:14px 0 18px}.evo-maintenance h2{color:#fff}.evo-maintenance-divider{height:1px;background:rgba(255,255,255,.2);max-width:420px;margin:30px auto}.evo-maintenance p:not(.evo-maintenance-kicker){font-size:17px;line-height:1.7;color:#d8e2ed;max-width:490px;margin:0 auto 26px}.evo-maintenance a{color:#fff;text-decoration:underline}.evo-maintenance small{display:block;margin-top:34px;color:#c7d5e5}";
  document.head.appendChild(style);
  fetch(SUPABASE_URL+"/rest/v1/site_settings?key=eq.maintenance&select=value",{headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+SUPABASE_KEY},cache:"no-store"})
    .then(r=>{if(!r.ok)throw new Error("settings unavailable");return r.json();})
    .then(rows=>{if(rows[0]?.value?.enabled===true){if(document.body)showPage();else document.addEventListener("DOMContentLoaded",showPage,{once:true});}else reveal();})
    .catch(reveal);
})();