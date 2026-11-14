(function () {
  // Keep the private editorial panel accessible while the public site is in maintenance mode.
  if (location.pathname.startsWith("/news/admin/")) {
    document.documentElement.classList.remove("evo-maintenance-checking");
    return;
  }

  const SUPABASE_URL = "https://poywsdigujbarvnzbfnz.supabase.co";
  const SUPABASE_KEY = "sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f";

  const revealSite = () => {
    document.documentElement.classList.remove("evo-maintenance-checking");
  };

  const showMaintenancePage = () => {
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
  };

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
      .maintenance-intro { padding: 54px 0 27px; }
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
  document.head.appendChild(style);

  fetch(
    SUPABASE_URL + "/rest/v1/site_settings?key=eq.maintenance&select=value",
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY
      },
      cache: "no-store"
    }
  )
    .then(response => {
      if (!response.ok) throw new Error("Maintenance settings unavailable");
      return response.json();
    })
    .then(rows => {
      if (rows[0]?.value?.enabled === true) {
        if (document.body) {
          showMaintenancePage();
        } else {
          document.addEventListener("DOMContentLoaded", showMaintenancePage, { once: true });
        }
      } else {
        revealSite();
      }
    })
    .catch(revealSite);
})();
