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
      ["banner", []], ["homepage", []], ["sidebar", []], ["article", []], ["sponsored", []]
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
      const visible = matches.slice(0, placement === "sponsored" ? 2 : 1);
      slot.innerHTML = visible.map(item => renderCampaign(item, placement)).join("");
      slot.hidden = !slot.innerHTML;
    }
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
  loadCampaignSlots();
})();
