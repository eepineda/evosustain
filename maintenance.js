(function () {
  // Keep operational demos, the public portfolio and the private editorial panel accessible during public-site maintenance.
  // These routes are independent showcase/working areas and must not be replaced by the global maintenance screen.
  const pathname = location.pathname;
  if (
    pathname.startsWith("/news/admin/") ||
    pathname.startsWith("/app/") ||
    pathname.startsWith("/edwin-portfolio/")
  ) {
    document.documentElement.classList.remove("evo-maintenance-checking");
    return;
  }

  const SUPABASE_URL = "https://poywsdigujbarvnzbfnz.supabase.co";
  const SUPABASE_KEY = "sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f";

  const revealSite = () => {
    document.documentElement.classList.remove("evo-maintenance-checking");
  };

  const showMaintenancePage = (config = {}) => {
    document.body.innerHTML = `
      <main class="maintenance-shell">
        <div class="maintenance-orbit maintenance-orbit-one" aria-hidden="true"></div>
        <div class="maintenance-orbit maintenance-orbit-two" aria-hidden="true"></div>

        <div class="maintenance-content">
          <header class="maintenance-header">
            <a class="maintenance-wordmark" href="/" aria-label="Evoford home">
              <span class="maintenance-mark" aria-hidden="true">E</span>
              <span>EVOFORD</span>
            </a>
            <span class="maintenance-status"><i aria-hidden="true"></i> WEBSITE UPDATE</span>
          </header>

          <section class="maintenance-intro" aria-labelledby="maintenance-title">
            <p class="maintenance-eyebrow">A BETTER EXPERIENCE IS ON ITS WAY</p>
            <h1 id="maintenance-title">Estamos realizando mejoras<span>.</span></h1>
            <p class="maintenance-lead">Estamos trabajando en nuestra web para ofrecerte una mejor experiencia. Volveremos a estar disponibles próximamente.</p>
            <p class="maintenance-thanks">Gracias por tu paciencia.</p>
            ${config?.scheduleEnabled === true && Number.isFinite(Date.parse(config.endAt || "")) ? `
              <section class="maintenance-countdown" aria-label="Cuenta atrás para la reapertura" aria-live="polite">
                <p class="maintenance-countdown-label">TIEMPO PARA VOLVER · TIME UNTIL WE RETURN</p>
                <div class="maintenance-countdown-units" id="maintenanceCountdown">
                  <div class="maintenance-countdown-unit"><strong data-countdown-days>--</strong><span>DÍAS · DAYS</span></div>
                  <div class="maintenance-countdown-unit"><strong data-countdown-hours>--</strong><span>HORAS · HOURS</span></div>
                  <div class="maintenance-countdown-unit"><strong data-countdown-minutes>--</strong><span>MIN · MIN</span></div>
                  <div class="maintenance-countdown-unit"><strong data-countdown-seconds>--</strong><span>SEG · SEC</span></div>
                </div>
                <p class="maintenance-countdown-finished" id="maintenanceCountdownFinished" hidden>Estamos restableciendo el servicio · We are restoring the service</p>
              </section>` : ""}
          </section>

          <div class="maintenance-language-grid">
            <section class="maintenance-language maintenance-spanish" lang="es" aria-label="Información en español">
              <div class="maintenance-language-top">
                <span class="maintenance-language-code">ES</span>
                <span class="maintenance-language-label">ESPAÑOL</span>
              </div>
              <p class="maintenance-kicker">VOLVEMOS EN BREVE</p>
              <h2>Estamos preparando algo mejor.</h2>
              <p>Estamos realizando mejoras en nuestro sitio para que tu próxima visita sea más sencilla y agradable.</p>
              <span class="maintenance-language-foot">Gracias por acompañarnos.</span>
            </section>

            <section class="maintenance-language maintenance-english" lang="en" aria-label="Information in English">
              <div class="maintenance-language-top">
                <span class="maintenance-language-code">EN</span>
                <span class="maintenance-language-label">ENGLISH</span>
              </div>
              <p class="maintenance-kicker">BACK SOON</p>
              <h2>We are making improvements.</h2>
              <p>We are working on our website to make your next visit easier and better. We will be back online shortly.</p>
              <span class="maintenance-language-foot">Thank you for your patience.</span>
            </section>
          </div>

          <footer class="maintenance-footer">
            <span class="maintenance-footer-note">EVOFORD · LONDON</span>
            <a class="maintenance-contact" href="mailto:info@evoford.com">
              <span class="maintenance-contact-icon" aria-hidden="true">↗</span>
              info@evoford.com
            </a>
          </footer>
        </div>
      </main>
    `;

    document.documentElement.classList.remove("evo-maintenance-checking");
    startMaintenanceCountdown(config);
  };

  let maintenanceCountdownTimer = null;
  function startMaintenanceCountdown(config) {
    if (maintenanceCountdownTimer) window.clearInterval(maintenanceCountdownTimer);
    const endAt = Date.parse(config?.endAt || "");
    const countdown = document.getElementById("maintenanceCountdown");
    if (!countdown || !Number.isFinite(endAt)) return;
    const fields = {
      days: countdown.querySelector("[data-countdown-days]"),
      hours: countdown.querySelector("[data-countdown-hours]"),
      minutes: countdown.querySelector("[data-countdown-minutes]"),
      seconds: countdown.querySelector("[data-countdown-seconds]")
    };
    const finished = document.getElementById("maintenanceCountdownFinished");
    const pad = value => String(value).padStart(2, "0");
    const update = () => {
      const remaining = Math.max(0, endAt - Date.now());
      const totalSeconds = Math.floor(remaining / 1000);
      fields.days.textContent = String(Math.floor(totalSeconds / 86400));
      fields.hours.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
      fields.minutes.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
      fields.seconds.textContent = pad(totalSeconds % 60);
      if (remaining <= 0) {
        finished.hidden = false;
        countdown.hidden = true;
        window.clearInterval(maintenanceCountdownTimer);
      }
    };
    update();
    maintenanceCountdownTimer = window.setInterval(update, 1000);
  }

  const style = document.createElement("style");
  style.textContent = `
    .maintenance-shell,
    .maintenance-shell * { box-sizing: border-box; }

    .maintenance-shell {
      --maintenance-navy: #102b4e;
      --maintenance-ink: #14263b;
      --maintenance-muted: #68788a;
      --maintenance-red: #c51f3a;
      position: relative;
      isolation: isolate;
      min-height: 100vh;
      display: grid;
      place-items: center;
      overflow: hidden;
      padding: clamp(22px, 5vw, 64px);
      background:
        radial-gradient(ellipse at 12% 8%, rgba(54, 91, 132, .34), transparent 34%),
        radial-gradient(ellipse at 90% 90%, rgba(197, 31, 58, .12), transparent 30%),
        linear-gradient(135deg, #081b30 0%, #102b4e 54%, #142f50 100%);
      color: #fff;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .maintenance-orbit {
      position: absolute;
      z-index: -1;
      width: min(58vw, 680px);
      aspect-ratio: 1;
      border: 1px solid rgba(255,255,255,.055);
      border-radius: 50%;
      pointer-events: none;
    }
    .maintenance-orbit-one { top: -34%; right: -16%; }
    .maintenance-orbit-two { bottom: -48%; left: -18%; width: min(72vw, 820px); }

    .maintenance-content { width: min(100%, 1040px); margin: auto; }

    .maintenance-header,
    .maintenance-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
    }

    .maintenance-wordmark {
      display: inline-flex;
      align-items: center;
      gap: 11px;
      color: #fff;
      text-decoration: none;
      font-size: 17px;
      font-weight: 850;
      letter-spacing: .19em;
    }
    .maintenance-mark {
      display: grid;
      width: 36px;
      height: 36px;
      place-items: center;
      border: 1px solid rgba(255,255,255,.48);
      border-radius: 10px 10px 10px 2px;
      background: rgba(255,255,255,.08);
      font-family: Georgia, serif;
      font-size: 23px;
      font-weight: 700;
      letter-spacing: -.06em;
    }

    .maintenance-status {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      padding: 9px 12px;
      border: 1px solid rgba(255,255,255,.17);
      border-radius: 999px;
      color: #c7d5e4;
      font-size: 9px;
      font-weight: 750;
      letter-spacing: .16em;
    }
    .maintenance-status i {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #e6b75b;
      box-shadow: 0 0 0 4px rgba(230,183,91,.12);
    }

    .maintenance-intro {
      max-width: 760px;
      padding: clamp(54px, 8vw, 88px) 0 34px;
    }
    .maintenance-eyebrow,
    .maintenance-kicker {
      margin: 0;
      color: #e3aeb7;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .2em;
      line-height: 1.5;
    }
    .maintenance-intro h1 {
      margin: 16px 0 18px;
      color: #fff;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(39px, 6.6vw, 70px);
      font-weight: 500;
      letter-spacing: -.045em;
      line-height: 1.02;
    }
    .maintenance-intro h1 span { color: #e35a6e; }
    .maintenance-lead {
      max-width: 650px;
      margin: 0;
      color: #d3deea;
      font-size: clamp(15px, 1.7vw, 18px);
      line-height: 1.75;
    }
    .maintenance-thanks {
      margin: 16px 0 0;
      color: #fff;
      font-size: 13px;
      font-weight: 650;
    }

    .maintenance-language-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }
    .maintenance-language {
      min-height: 238px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: clamp(22px, 3.5vw, 34px);
      border: 1px solid rgba(255,255,255,.15);
      border-radius: 17px;
      background: rgba(255,255,255,.075);
      box-shadow: 0 18px 50px rgba(0,0,0,.10);
      backdrop-filter: blur(12px);
    }
    .maintenance-spanish { border-top: 2px solid #e35a6e; }
    .maintenance-english { border-top: 2px solid rgba(255,255,255,.62); }
    .maintenance-language-top {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 25px;
    }
    .maintenance-language-code {
      display: grid;
      width: 29px;
      height: 25px;
      place-items: center;
      border-radius: 6px;
      background: rgba(255,255,255,.13);
      color: #fff;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: .08em;
    }
    .maintenance-language-label {
      color: #b8c8d9;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: .16em;
    }
    .maintenance-language h2 {
      margin: 9px 0 10px;
      color: #fff;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(22px, 2.8vw, 29px);
      font-weight: 500;
      letter-spacing: -.025em;
      line-height: 1.15;
    }
    .maintenance-language > p:not(.maintenance-kicker) {
      max-width: 420px;
      margin: 0;
      color: #c8d5e2;
      font-size: 13px;
      line-height: 1.7;
    }
    .maintenance-language-foot {
      margin-top: auto;
      padding-top: 22px;
      color: #fff;
      font-size: 11px;
      font-weight: 650;
    }

    .maintenance-footer {
      margin-top: 27px;
      padding-top: 19px;
      border-top: 1px solid rgba(255,255,255,.16);
    }
    .maintenance-footer-note {
      color: #9fb2c7;
      font-size: 9px;
      font-weight: 750;
      letter-spacing: .17em;
    }
    .maintenance-contact {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
    }
    .maintenance-contact:hover { color: #ffd6dc; }
    .maintenance-contact-icon {
      display: grid;
      width: 27px;
      height: 27px;
      place-items: center;
      border: 1px solid rgba(255,255,255,.28);
      border-radius: 50%;
      font-size: 14px;
    }

    @media (max-width: 680px) {
      .maintenance-shell { padding: 22px 18px 26px; }
      .maintenance-header { align-items: flex-start; }
      .maintenance-status { padding: 8px 9px; font-size: 8px; }
      .maintenance-intro { padding: 54px 0 27px; }\n      .maintenance-countdown { margin-top: 23px; }\n      .maintenance-countdown-units { gap: 6px; }\n      .maintenance-countdown-unit { padding: 11px 4px 9px; }\n      .maintenance-countdown-unit span { font-size: 7px; letter-spacing: .04em; }
      .maintenance-language-grid { grid-template-columns: 1fr; }
      .maintenance-language { min-height: 0; padding: 23px; }
      .maintenance-language-top { margin-bottom: 18px; }
      .maintenance-language-foot { padding-top: 18px; }
    }
    @media (max-width: 390px) {
      .maintenance-wordmark { font-size: 14px; letter-spacing: .14em; }
      .maintenance-mark { width: 32px; height: 32px; }
      .maintenance-status { letter-spacing: .1em; }
      .maintenance-footer { align-items: flex-start; flex-direction: column; }
    }
    @media (prefers-reduced-motion: reduce) {
      .maintenance-shell * { scroll-behavior: auto !important; }
    }
  `;

  style.textContent += `
    .maintenance-shell {
      --maintenance-navy: #102b4e;
      --maintenance-ink: #162b43;
      --maintenance-muted: #68788a;
      --maintenance-red: #c51f3a;
      min-height: 100svh;
      padding: clamp(24px, 5vw, 58px);
      background:
        radial-gradient(circle at 85% 8%, rgba(197,31,58,.07), transparent 25rem),
        linear-gradient(145deg, #f7f8fa 0%, #edf1f5 100%);
      color: var(--maintenance-ink);
    }
    .maintenance-orbit { border-color: rgba(16,43,78,.055); }
    .maintenance-wordmark { color: var(--maintenance-navy); }
    .maintenance-mark {
      border: 0;
      border-radius: 11px 11px 11px 3px;
      background: var(--maintenance-red);
      color: #fff;
      box-shadow: 0 8px 20px rgba(197,31,58,.18);
    }
    .maintenance-status {
      border-color: #dce2e9;
      background: rgba(255,255,255,.72);
      color: #52657a;
    }
    .maintenance-status i { background: #c51f3a; box-shadow: 0 0 0 4px rgba(197,31,58,.10); }
    .maintenance-intro {
      max-width: 820px;
      padding: clamp(54px, 8vw, 82px) 0 34px;
    }
    .maintenance-eyebrow, .maintenance-kicker { color: var(--maintenance-red); }
    .maintenance-intro h1 { color: var(--maintenance-navy); }
    .maintenance-lead { color: #53657a; }
    .maintenance-thanks { color: var(--maintenance-ink); }
    .maintenance-countdown {
      margin-top: 30px;
      padding: 20px;
      border: 1px solid #e0e5eb;
      border-radius: 16px;
      background: rgba(255,255,255,.78);
      box-shadow: 0 12px 35px rgba(16,43,78,.055);
    }
    .maintenance-countdown-label {
      margin: 0 0 14px;
      color: #68788a;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .14em;
    }
    .maintenance-countdown-units {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
    }
    .maintenance-countdown-unit {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      padding: 14px 8px 12px;
      border: 1px solid #e7ebf0;
      border-radius: 11px;
      background: #f5f7fa;
    }
    .maintenance-countdown-unit strong {
      color: var(--maintenance-navy);
      font-size: clamp(25px, 4vw, 36px);
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }
    .maintenance-countdown-unit span {
      color: #77869a;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: .08em;
    }
    .maintenance-countdown-finished {
      margin: 12px 0 0;
      color: var(--maintenance-red);
      font-weight: 700;
    }
    .maintenance-language-grid { gap: 16px; }
    .maintenance-language {
      min-height: 230px;
      border: 1px solid #e0e5eb;
      border-radius: 15px;
      background: #fff;
      box-shadow: 0 14px 38px rgba(16,43,78,.06);
      backdrop-filter: none;
    }
    .maintenance-spanish { border-top: 3px solid var(--maintenance-red); }
    .maintenance-english { border-top: 3px solid #9ba9b8; }
    .maintenance-language-code {
      background: #edf1f5;
      color: var(--maintenance-navy);
    }
    .maintenance-language-label { color: #758397; }
    .maintenance-language h2 { color: var(--maintenance-navy); }
    .maintenance-language > p:not(.maintenance-kicker) { color: #5c6d80; }
    .maintenance-language-foot { color: var(--maintenance-ink); }
    .maintenance-footer { border-top-color: #dce2e9; }
    .maintenance-footer-note { color: #758397; }
    .maintenance-contact { color: var(--maintenance-navy); }
    .maintenance-contact:hover { color: var(--maintenance-red); }
    .maintenance-contact-icon { border-color: #d6dde6; }
    @media (max-width: 680px) {
      .maintenance-shell { padding: 22px 17px 26px; }
      .maintenance-countdown { padding: 15px; }
      .maintenance-countdown-units { gap: 6px; }
      .maintenance-countdown-unit { padding: 12px 3px 10px; }
      .maintenance-countdown-unit span { font-size: 7px; letter-spacing: .03em; }
    }
  `;
  // Isolate the maintenance screen from site-wide header/body rules.
  // The same script runs on EvoSustain and Evoford News, which load different CSS.
  style.textContent += `
    html.evo-maintenance-active,
    html.evo-maintenance-active body {
      min-height: 100%;
      margin: 0 !important;
      padding: 0 !important;
      background: #f7f8fa !important;
      color: #162b43 !important;
    }
    .maintenance-shell {
      width: 100%;
      min-height: 100vh;
      min-height: 100svh;
      isolation: isolate;
    }
    .maintenance-shell .maintenance-header {
      position: static !important;
      inset: auto !important;
      z-index: auto !important;
      display: flex !important;
      width: 100% !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      border-radius: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
    .maintenance-shell .maintenance-header::before,
    .maintenance-shell .maintenance-header::after { content: none !important; }
    .maintenance-shell .maintenance-header a,
    .maintenance-shell .maintenance-header span { text-decoration: none; }
  `;

  document.head.appendChild(style);
  document.documentElement.classList.add("evo-maintenance-active");
  document.body.className = "maintenance-page";

  const MAINTENANCE_CACHE_KEY = "evoford-maintenance-state";
  const MAINTENANCE_CACHE_TTL_MS = 10_000;

  function isMaintenanceActive(config) {
    // Scheduled maintenance takes precedence over the manual toggle.
    // Once the configured interval ends, the public site reopens automatically.
    if (config?.scheduleEnabled === true) {
      const start = Date.parse(config.startAt || "");
      const end = Date.parse(config.endAt || "");
      const now = Date.now();
      return Number.isFinite(start) && Number.isFinite(end) && end > start && now >= start && now < end;
    }
    // Manual maintenance applies only when no schedule is enabled.
    return config?.enabled === true;
  }

  function applyMaintenanceState(config) {
    if (isMaintenanceActive(config)) {
      if (document.body) showMaintenancePage(config);
      else document.addEventListener("DOMContentLoaded", () => showMaintenancePage(config), { once: true });
    } else {
      revealSite();
    }
    scheduleMaintenanceBoundary(config);
  }

  function scheduleMaintenanceBoundary(config) {
    if (config?.scheduleEnabled !== true) return;
    const start = Date.parse(config.startAt || "");
    const end = Date.parse(config.endAt || "");
    const now = Date.now();
    const nextBoundary = [start, end].filter(value => Number.isFinite(value) && value > now).sort((a,b)=>a-b)[0];
    if (nextBoundary) {
      const delay = Math.min(nextBoundary - now + 300, 2147483000);
      window.setTimeout(() => window.location.reload(), delay);
    }
  }

  function readRecentMaintenanceConfig() {
    try {
      const cached = JSON.parse(sessionStorage.getItem(MAINTENANCE_CACHE_KEY) || "null");
      if (
        cached && cached.config && typeof cached.config === "object" &&
        Number.isFinite(cached.savedAt) &&
        Date.now() - cached.savedAt < MAINTENANCE_CACHE_TTL_MS
      ) return cached.config;
    } catch (_) {
      // Storage may be unavailable; fall back to the live setting.
    }
    return null;
  }

  const recentConfig = readRecentMaintenanceConfig();
  if (recentConfig !== null) {
    applyMaintenanceState(recentConfig);
    return;
  }

  // Never hold the public page blank while the maintenance setting is slow.
  // If Supabase does not answer promptly, fail open and let the site render.
  const maintenanceController = new AbortController();
  const maintenanceTimeout = window.setTimeout(() => {
    maintenanceController.abort();
    revealSite();
  }, 2000);

  fetch(
    SUPABASE_URL + "/rest/v1/site_settings?key=eq.maintenance&select=value",
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY
      },
      cache: "no-store",
      signal: maintenanceController.signal
    }
  )
    .then(response => {
      window.clearTimeout(maintenanceTimeout);
      if (!response.ok) throw new Error("Maintenance settings unavailable");
      return response.json();
    })
    .then(rows => {
      const config = rows[0]?.value || {};
      try {
        sessionStorage.setItem(MAINTENANCE_CACHE_KEY, JSON.stringify({
          config,
          savedAt: Date.now()
        }));
      } catch (_) {
        // The live setting still applies when storage is unavailable.
      }
      applyMaintenanceState(config);
    })
    .catch(() => { window.clearTimeout(maintenanceTimeout); revealSite(); });
})();