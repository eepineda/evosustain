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
    const isPdf = /.pdf(?:$|[?#])/i.test(creative);
    const label = placement === "sponsored" ? "CONTENIDO PATROCINADO" : "PUBLICIDAD";
    const title = escapeHtml(campaign.campaign_title || "Publicidad");
    const media = isPdf
      ? '<span class="ad-slot-pdf">Ver material publicitario (PDF) ↗</span>'
      : '<img src="' + escapeHtml(creative) + '" alt="' + title + '" loading="lazy">';
    return '<a class="ad-slot-card" href="' + escapeHtml(target) + '" target="_blank" rel="sponsored noopener noreferrer" aria-label="' + label + ': ' + title + '">' +
      media + '<span class="ad-slot-label">' + label + '</span><span class="ad-slot-title">' + title + '</span></a>';
  }

  async function loadCampaignSlots() {
    if (!window.supabase) return;
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    const { data, error } = await client.from("published_ad_campaigns")
      .select("id,campaign_title,placement,creative_url,target_url,start_date,end_date,publication_mode");
    if (error) {
      console.warn("Evoford News ads:", error.message);
      return;
    }
    const campaigns = data || [];
    ["banner", "homepage", "sidebar", "article", "sponsored"].forEach(placement => {
      const slot = document.querySelector('[data-ad-slot="' + placement + '"]');
      if (!slot) return;
      const matches = campaigns.filter(item => item.placement === placement && safeHttps(item.creative_url));
      if (!matches.length) {
        slot.hidden = true;
        slot.innerHTML = "";
        return;
      }
      const visible = placement === "sponsored" ? matches.slice(0, 2) : matches.slice(0, 1);
      slot.innerHTML = visible.map(item => renderCampaign(item, placement)).join("");
      slot.hidden = !slot.innerHTML;
    });
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
