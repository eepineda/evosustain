(() => {
  const SUPABASE_URL = "https://poywsdigujbarvnzbfnz.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f";

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
  }

  function safeHttps(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url.href : "";
    } catch (_) {
      return "";
    }
  }

  function renderCampaign(campaign, placement) {
    const creative = safeHttps(campaign.creative_url);
    if (!creative) return "";
    const target = safeHttps(campaign.target_url) || creative;
    const isPdf = /[.]pdf(?:$|[?#])/i.test(creative);
    const language = document.documentElement.lang || localStorage.getItem("evoford-news-language") || "es";
    const en = language === "en";
    const label = placement === "sponsored"
      ? (en ? "SPONSORED CONTENT" : "CONTENIDO PATROCINADO")
      : (en ? "ADVERTISING" : "PUBLICIDAD");
    let campaignTitle = campaign.campaign_title || (en ? "Advertising" : "Publicidad");
    if (en) {
      campaignTitle = campaignTitle
        .replace(/Banner web/gi, "Web banner")
        .replace(/Publicidad en artículos/gi, "In-article advertising")
        .replace(/Columna lateral/gi, "Sidebar")
        .replace(/Edición impresa/gi, "Print edition")
        .replace(/Portada/gi, "Homepage");
    }
    const title = escapeHtml(campaignTitle);
    const horizontal = ["banner", "homepage", "article", "sponsored"].includes(placement);
    const cardStyle = horizontal
      ? "display:flex;align-items:center;gap:18px;width:100%;max-width:814px;box-sizing:border-box;margin:0 auto;padding:12px;background:#fff;border:1px solid #d7dee7;color:#102b4e;text-decoration:none;overflow:hidden;"
      : "display:block;width:100%;box-sizing:border-box;margin:0 auto;padding:10px;background:#fff;border:1px solid #d7dee7;color:#102b4e;text-decoration:none;overflow:hidden;";
    const imageStyle = horizontal
      ? "display:block;flex:0 0 200px;width:200px;height:120px;max-width:38%;object-fit:contain;background:#f3f5f7;"
      : "display:block;width:100%;height:auto;max-height:180px;object-fit:contain;background:#f3f5f7;";
    const media = isPdf
      ? '<span style="display:flex;align-items:center;justify-content:center;min-height:90px;padding:14px;background:#f3f5f7;">Ver material publicitario (PDF) ↗</span>'
      : '<img src="' + escapeHtml(creative) + '" alt="' + title + '" loading="lazy" style="' + imageStyle + '">';
    const copy = '<span style="display:flex;flex:1;min-width:0;flex-direction:column;gap:7px;padding:4px 8px;">' +
      '<span style="display:block;color:#9a2630;font:800 10px/1.4 Arial,sans-serif;letter-spacing:.15em;">' + label + '</span>' +
      '<span style="display:block;color:#102b4e;font:700 17px/1.35 Georgia,serif;">' + title + '</span></span>';
    return '<a class="ad-slot-card" href="' + escapeHtml(target) + '" target="_blank" rel="sponsored noopener noreferrer" aria-label="' + label + ': ' + title + '" style="' + cardStyle + '">' +
      (horizontal ? media + copy : media + copy) + '</a>';
  }

  const CAMPAIGNS_CACHE_TTL_MS = 60_000;
  let campaignsCache = null;
  let campaignsCacheAt = 0;
  let campaignsLoadPromise = null;

  function renderCampaignSlots(campaigns) {
    const byPlacement = new Map([
      ["banner", []], ["homepage", []], ["sidebar", []], ["article", []], ["sponsored", []], ["popup", []]
    ]);
    for (const campaign of campaigns) {
      const matches = byPlacement.get(campaign.placement);
      if (matches && safeHttps(campaign.creative_url)) matches.push(campaign);
    }
    for (const [placement, matches] of byPlacement) {
      const slot = document.querySelector('[data-ad-slot="' + placement + '"]');
      if (!slot) continue;
      if (!matches.length) {
        slot.hidden = true;
        slot.innerHTML = "";
        continue;
      }
      const limit = placement === "sponsored" ? 2 : 1;
      let html = "";
      for (let i = 0; i < matches.length && i < limit; i++) {
        html += renderCampaign(matches[i], placement);
      }
      slot.innerHTML = html;
      slot.hidden = !html;
    }
    showPopupCampaign(byPlacement.get("popup") || []);
  }

  const POPUP_DISMISS_KEY = "evoford-popup-ad-dismissed-at";
  function showPopupCampaign(campaigns) {
    const path = location.pathname || "/";
    const isHome = path === "/" || path === "/news" || path === "/news/" || path === "/news/index.html" || (path.startsWith("/news/") && !path.startsWith("/news/admin/"));
    if (!isHome || !campaigns.length || document.getElementById("evoPopupAd")) return;
    let dismissedAt = 0;
    try { dismissedAt = Number(localStorage.getItem(POPUP_DISMISS_KEY) || 0); } catch (_) {}
    if (dismissedAt && Date.now() - dismissedAt < 24 * 60 * 60 * 1000) return;
    const campaign = campaigns.find(item => safeHttps(item.creative_url));
    if (!campaign) return;
    const creative = safeHttps(campaign.creative_url);
    const target = safeHttps(campaign.target_url) || creative;
    const isPdf = /\.pdf(?:$|[?#])/i.test(creative);
    const en = (document.documentElement.lang || "es") === "en";
    const title = escapeHtml(campaign.campaign_title || (en ? "Featured advertising" : "Publicidad destacada"));
    const closeLabel = en ? "Close advertising" : "Cerrar publicidad";
    const visitLabel = en ? "Visit advertiser" : "Visitar anunciante";
    const media = isPdf
      ? '<a class="evo-popup-pdf" href="' + escapeHtml(creative) + '" target="_blank" rel="noopener noreferrer">' + (en ? "View advertising material" : "Ver material publicitario") + ' ↗</a>'
      : '<a class="evo-popup-creative" href="' + escapeHtml(target) + '" target="_blank" rel="sponsored noopener noreferrer"><img src="' + escapeHtml(creative) + '" alt="' + title + '"></a>';
    const modal = document.createElement("div");
    modal.id = "evoPopupAd";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", en ? "Advertisement" : "Publicidad");
    modal.innerHTML = '<div class="evo-popup-backdrop" data-popup-close></div><section class="evo-popup-panel"><button type="button" class="evo-popup-close" aria-label="' + closeLabel + '" data-popup-close>×</button><span class="evo-popup-kicker">' + (en ? "ADVERTISEMENT" : "PUBLICIDAD") + '</span><h2>' + title + '</h2>' + media + '<a class="evo-popup-cta" href="' + escapeHtml(target) + '" target="_blank" rel="sponsored noopener noreferrer">' + visitLabel + ' ↗</a></section>';
    if (!document.getElementById("evoPopupAdStyles")) {
      const style = document.createElement("style");
      style.id = "evoPopupAdStyles";
      style.textContent = '#evoPopupAd{position:fixed;inset:0;z-index:100000;display:grid;place-items:center;padding:18px;box-sizing:border-box;font-family:Arial,sans-serif}#evoPopupAd[hidden]{display:none}.evo-popup-backdrop{position:absolute;inset:0;background:rgba(8,18,32,.76);backdrop-filter:blur(3px)}.evo-popup-panel{position:relative;z-index:1;width:min(560px,100%);max-height:calc(100vh - 36px);overflow:auto;box-sizing:border-box;padding:26px;background:#fff;border-radius:12px;box-shadow:0 24px 80px rgba(0,0,0,.3);color:#102b4e}.evo-popup-close{position:absolute;right:12px;top:10px;width:38px;height:38px;border:0;border-radius:50%;background:#edf1f5;color:#102b4e;font-size:28px;line-height:1;cursor:pointer}.evo-popup-kicker{display:block;margin:2px 44px 10px 0;color:#9a2630;font-size:10px;font-weight:800;letter-spacing:.16em}.evo-popup-panel h2{margin:0 40px 18px 0;font:700 23px/1.25 Georgia,serif}.evo-popup-creative{display:block}.evo-popup-creative img{display:block;width:100%;max-height:56vh;object-fit:contain;background:#f3f5f7}.evo-popup-pdf{display:block;padding:28px;text-align:center;background:#f3f5f7;color:#102b4e;font-weight:700}.evo-popup-cta{display:inline-flex;margin-top:17px;padding:12px 18px;border-radius:6px;background:#102b4e;color:#fff;text-decoration:none;font-weight:700}.evo-popup-close:focus-visible,.evo-popup-cta:focus-visible{outline:3px solid #d69b36;outline-offset:3px}@media(max-width:520px){.evo-popup-panel{padding:22px 16px 18px}.evo-popup-panel h2{font-size:20px}}';
      document.head.appendChild(style);
    }
    const openPopup = () => {
      if (!document.body || document.getElementById("evoPopupAd")) return;
      document.body.appendChild(modal);
      document.body.style.overflow = "hidden";
      const close = () => {
        try { localStorage.setItem(POPUP_DISMISS_KEY, String(Date.now())); } catch (_) {}
        modal.remove();
        document.body.style.overflow = "";
      };
      modal.querySelectorAll("[data-popup-close]").forEach(button => button.addEventListener("click", close));
      modal.addEventListener("keydown", event => {
        if (event.key === "Escape") close();
      });
      modal.querySelector(".evo-popup-close")?.focus();
    };
    window.setTimeout(openPopup, 3000);
  }

  async function loadCampaignSlots() {
    if (!window.supabase) return;
    const cacheIsFresh = campaignsCache !== null && Date.now() - campaignsCacheAt < CAMPAIGNS_CACHE_TTL_MS;
    if (cacheIsFresh) {
      renderCampaignSlots(campaignsCache);
      return;
    }
    if (campaignsLoadPromise) {
      await campaignsLoadPromise;
      if (campaignsCache !== null) renderCampaignSlots(campaignsCache);
      return;
    }

    campaignsLoadPromise = (async () => {
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
      const { data, error } = await client.from("published_ad_campaigns")
        .select("id,campaign_title,placement,creative_url,target_url,start_date,end_date,publication_mode");
      if (error) {
        console.warn("Evoford News ads:", error.message);
        return;
      }
      campaignsCache = data || [];
      campaignsCacheAt = Date.now();
      renderCampaignSlots(campaignsCache);
    })();

    try {
      await campaignsLoadPromise;
    } finally {
      campaignsLoadPromise = null;
    }
  }

  let scheduled = false;
  function refreshSlots() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      loadCampaignSlots();
    });
  }

  document.addEventListener("evo:article-ready", refreshSlots);
  window.addEventListener("evoford:languagechange", refreshSlots);
  const articleSlotExists = () => Boolean(document.querySelector('[data-ad-slot="article"]'));
  if (!articleSlotExists()) {
    const observer = new MutationObserver(() => {
      if (articleSlotExists()) {
        observer.disconnect();
        refreshSlots();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
  
  // Editorial discovery popup: highlights a real story already published on the homepage.
  const EDITORIAL_POPUP_KEY = "evoford-editorial-popup-seen-at";
  function showEditorialPopup() {
    const path = location.pathname || "/";
    const isHome = path === "/" || path === "/news" || path === "/news/" || path === "/news/index.html";
    if (!isHome || document.getElementById("evoEditorialPopup") || document.getElementById("evoPopupAd")) return;
    let seenAt = 0;
    try { seenAt = Number(localStorage.getItem(EDITORIAL_POPUP_KEY) || 0); } catch (_) {}
    if (seenAt && Date.now() - seenAt < 24 * 60 * 60 * 1000) return;
    const card = document.querySelector("#featuredStory .feature-card-lead") || document.querySelector("#featuredStory .feature-card");
    const headline = card && card.querySelector("h1 a, h2 a");
    if (!headline || !headline.textContent.trim() || !headline.href) return;
    const summary = card.querySelector(".dek");
    const image = card.querySelector(".feature-card-image img");
    const en = (document.documentElement.lang || "es") === "en";
    const modal = document.createElement("div");
    modal.id = "evoEditorialPopup";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "evoEditorialPopupTitle");
    const safeLink = headline.href;
    const imageHtml = image && /^https:\/\//i.test(image.src)
      ? '<img class="evo-editorial-image" src="' + escapeHtml(image.src) + '" alt="">'
      : "";
    modal.innerHTML =
      '<div class="evo-editorial-backdrop" data-editorial-close></div>' +
      '<section class="evo-editorial-panel">' +
      '<button type="button" class="evo-editorial-close" data-editorial-close aria-label="' + (en ? "Close" : "Cerrar") + '">×</button>' +
      '<span class="evo-editorial-kicker">' + (en ? "EDITOR’S PICK · EVOFORD NEWS" : "SELECCIÓN EDITORIAL · EVOFORD NEWS") + '</span>' +
      imageHtml +
      '<h2 id="evoEditorialPopupTitle">' + escapeHtml(headline.textContent.trim()) + '</h2>' +
      '<p>' + escapeHtml(summary ? summary.textContent.trim() : (en ? "The story and the context behind it." : "La noticia y las claves para entenderla.")) + '</p>' +
      '<a class="evo-editorial-cta" href="' + escapeHtml(safeLink) + '">' + (en ? "Read the story" : "Leer la noticia") + ' ↗</a>' +
      '<span class="evo-editorial-note">' + (en ? "Independent information · Context · Analysis" : "Información · Contexto · Análisis") + '</span>' +
      '</section>';
    if (!document.getElementById("evoEditorialPopupStyles")) {
      const style = document.createElement("style");
      style.id = "evoEditorialPopupStyles";
      style.textContent = '#evoEditorialPopup{position:fixed;inset:0;z-index:99990;display:grid;place-items:center;padding:18px;box-sizing:border-box;font-family:Arial,sans-serif}#evoEditorialPopup .evo-editorial-backdrop{position:absolute;inset:0;background:rgba(8,18,32,.72);backdrop-filter:blur(4px)}#evoEditorialPopup .evo-editorial-panel{position:relative;width:min(570px,100%);max-height:calc(100vh - 36px);overflow:auto;box-sizing:border-box;padding:27px;background:#fff;color:#102b4e;border-radius:10px;box-shadow:0 24px 80px rgba(0,0,0,.32)}#evoEditorialPopup .evo-editorial-close{position:absolute;right:12px;top:10px;width:36px;height:36px;border:0;border-radius:50%;background:#edf1f5;color:#102b4e;font-size:26px;cursor:pointer}#evoEditorialPopup .evo-editorial-kicker{display:block;margin:2px 45px 14px 0;color:#a22b35;font-size:10px;font-weight:800;letter-spacing:.15em}#evoEditorialPopup .evo-editorial-image{display:block;width:100%;max-height:245px;object-fit:cover;margin:0 0 18px;background:#edf1f5}#evoEditorialPopup h2{margin:0 0 12px;font:700 clamp(22px,4vw,29px)/1.2 Georgia,serif;letter-spacing:-.02em}#evoEditorialPopup p{margin:0;color:#536174;font:15px/1.6 Arial,sans-serif}#evoEditorialPopup .evo-editorial-cta{display:inline-flex;margin-top:20px;padding:12px 18px;background:#102b4e;color:#fff;text-decoration:none;border-radius:4px;font-weight:700}#evoEditorialPopup .evo-editorial-note{display:block;margin-top:18px;padding-top:12px;border-top:1px solid #e1e5e9;color:#7a8490;font-size:10px;letter-spacing:.08em;text-transform:uppercase}#evoEditorialPopup button:focus-visible,#evoEditorialPopup a:focus-visible{outline:3px solid #c58d32;outline-offset:3px}@media(max-width:520px){#evoEditorialPopup .evo-editorial-panel{padding:23px 17px 18px}#evoEditorialPopup .evo-editorial-image{max-height:190px}}';
      document.head.appendChild(style);
    }
    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";
    const close = () => {
      try { localStorage.setItem(EDITORIAL_POPUP_KEY, String(Date.now())); } catch (_) {}
      modal.remove();
      document.body.style.overflow = "";
    };
    modal.querySelectorAll("[data-editorial-close]").forEach(el => el.addEventListener("click", close));
    modal.addEventListener("keydown", event => { if (event.key === "Escape") close(); });
    modal.querySelector(".evo-editorial-close")?.focus();
  }
  function watchEditorialFeature() {
    const feature = document.getElementById("featuredStory");
    if (!feature) return;
    const tryShow = () => {
      if (feature.querySelector(".feature-card-lead, .feature-card")) {
        window.setTimeout(() => {
          if (!document.getElementById("evoPopupAd")) showEditorialPopup();
        }, 9000);
        return true;
      }
      return false;
    };
    if (tryShow()) return;
    const observer = new MutationObserver(() => {
      if (tryShow()) observer.disconnect();
    });
    observer.observe(feature, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watchEditorialFeature, { once: true });
  } else {
    watchEditorialFeature();
  }

  loadCampaignSlots();
})();
