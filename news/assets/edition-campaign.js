(() => {
  "use strict";
  const URL = "https://poywsdigujbarvnzbfnz.supabase.co";
  const KEY = "sb_publishable_1t7gv1Y9-6HHwMqW5E343A_51GH_L7f";
  const client = window.supabase.createClient(URL, KEY);
  const $ = (id) => document.getElementById(id);
  const panel = $("editionCampaignPanel");
  const open = $("campaignBtn");
  if (!panel || !open) return;
  let campaignId = null;
  let savedImage = null;
  let previewPages = null;
  let selectedPages = new Set();
  let currentCampaignStatus = null;
  let instagramAlreadyFailedAfterFacebook = false;

  let currentLanguage = document.documentElement.lang === "en" ? "en" : "es";
  const defaultTitle = { es: "Nueva edición de EVOFORD NEWS", en: "New EVOFORD NEWS edition" };
  const defaultCaption = {
    es: "📰 Ya está disponible la nueva edición de EVOFORD NEWS. Información, opinión y análisis para entender la actualidad. Lee, comenta y comparte.\n\n#EvofordNews #RepublicaDominicana #DominicanosEnElExterior #NoticiasRD #Actualidad #ComunidadDominicana #ReinoUnido #Espana",
    en: "📰 The new edition of EVOFORD NEWS is now available. News, opinion and analysis to understand current affairs. Read, comment and share.\n\n#EvofordNews #DominicanRepublic #DominicansAbroad #DominicanNews #CurrentAffairs #DominicanCommunity #UnitedKingdom #Spain"
  };
  const copy = {
    es: {
      heading:"Promoción de esta edición", intro:"Campaña independiente. No publica ni modifica los artículos individuales.",
      drafts:"Borradores anteriores", fresh:"Nueva campaña", load:"Cargar", title:"Título de la campaña",
      caption:"Texto para Facebook e Instagram", preview:"Vista previa: selecciona las páginas que quieres publicar",
      previewNote:"Haz clic en cada página para incluirla o excluirla de la campaña.", close:"Cerrar",
      save:"Preparar y guardar borrador", update:"Actualizar borrador", publish:"Aprobar y publicar",
      savingCover:"Generando la portada real de la edición…", saving:"Guardando la campaña como borrador…",
      saved:"Borrador guardado. Revisa la portada y el texto; todavía no se ha publicado en ninguna red.",
      ready:"Preparado para crear una nueva campaña.", loaded:"Campaña cargada",
      noDrafts:"No se pudieron cargar los borradores.", login:"Inicia sesión con la cuenta editorial autorizada.",
      confirm:"¿Apruebas esta portada y este texto para publicar la edición impresa en Facebook e Instagram?",
      sending:"Enviando la campaña aprobada a Facebook e Instagram…",
      closed:"Borrador cerrado", failed:"No se pudo guardar el borrador.", publishFailed:"No se pudo completar la publicación."
    },
    en: {
      heading:"Promote this edition", intro:"Separate campaign. It does not publish or modify individual articles.",
      drafts:"Previous drafts", fresh:"New campaign", load:"Load", title:"Campaign title",
      caption:"Facebook and Instagram caption", preview:"Preview: choose the pages to publish",
      previewNote:"Click each page to include it in or exclude it from the campaign.", close:"Close",
      save:"Prepare and save draft", update:"Update draft", publish:"Approve and publish",
      savingCover:"Generating the actual edition cover…", saving:"Saving campaign as a draft…",
      saved:"Draft saved. Review the cover and caption; nothing has been published to social media yet.",
      ready:"Ready to create a new campaign.", loaded:"Campaign loaded",
      noDrafts:"Could not load drafts.", login:"Sign in with the authorised editorial account.",
      confirm:"Do you approve this cover and caption for publishing the print edition on Facebook and Instagram?",
      sending:"Sending the approved campaign to Facebook and Instagram…",
      closed:"Draft locked", failed:"Could not save the draft.", publishFailed:"Could not complete publishing."
    }
  };
  const status = (message) => { $("campaignStatus").textContent = message; };
  function setLanguage(language) {
    const previousLanguage = currentLanguage;
    const nextLanguage = language === "en" ? "en" : "es";
    const caption = $("campaignCaption").value.trim();
    const title = $("campaignTitle").value.trim();
    const wasDefaultCaption = !caption || caption === defaultCaption[previousLanguage].trim();
    const wasDefaultTitle = !title || title === defaultTitle[previousLanguage];
    currentLanguage = nextLanguage;
    const t = copy[currentLanguage];
    if (wasDefaultCaption) $("campaignCaption").value = defaultCaption[currentLanguage];
    if (wasDefaultTitle) $("campaignTitle").value = defaultTitle[currentLanguage];
    const panel = $("editionCampaignPanel");
    panel.setAttribute("aria-label", t.heading);
    panel.querySelector("h2").textContent = t.heading;
    $("campaignIntro").textContent = t.intro;
    panel.querySelector('label[for="campaignDrafts"]').textContent = t.drafts;
    panel.querySelector('label[for="campaignTitle"]').textContent = t.title;
    panel.querySelector('label[for="campaignCaption"]').textContent = t.caption;
    panel.querySelector("#campaignPreview").setAttribute("aria-label", t.preview);
    $("campaignPreviewTitle").textContent = t.preview;
    $("campaignPreviewNote").textContent = t.previewNote;
    $("campaignCloseBtn").textContent = t.close;
    $("campaignLoadBtn").textContent = t.load;
    $("campaignSaveBtn").textContent = campaignId ? t.update : t.save;
    $("campaignPublishBtn").textContent = t.publish;
    const select = $("campaignDrafts");
    if (select.options.length) select.options[0].textContent = t.fresh;
  }
  document.addEventListener("edition:languagechange", event => setLanguage(event.detail?.language));
  setLanguage(currentLanguage);
  async function readableFunctionError(error) {
    const context = error?.context;
    if (context) {
      try {
        const body = typeof context.clone === "function" ? await context.clone().json() : null;
        if (body?.error) return body.error + (body.code ? " (" + body.code + ")" : "");
      } catch {}
      try {
        const body = typeof context.clone === "function" ? await context.clone().text() : "";
        if (body) return body.slice(0, 500);
      } catch {}
    }
    return error?.message || "Error de comunicación con el servidor.";
  }

  const busy = (value) => {
    $("campaignSaveBtn").disabled = value || (!!campaignId && currentCampaignStatus !== "draft" && !instagramAlreadyFailedAfterFacebook);
    $("campaignPublishBtn").disabled = value || !campaignId || currentCampaignStatus === "published";
  };

  async function makeEditionPages() {
    if (!window.EvoPrintController?.createDocument || !window.pdfjsLib) {
      throw new Error("No está disponible el motor PDF. Actualiza la página.");
    }
    if ($("lead").querySelector(".loading") || !$("lead").querySelector(".lead-headline h1")) {
      throw new Error("La edición todavía se está cargando.");
    }
    const doc = await window.EvoPrintController.createDocument();
    if (!doc) throw new Error("No se pudo preparar el documento de la edición.");
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
    const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(doc.output("arraybuffer")) }).promise;
    const pages = [];
    const instagramPages = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      status((currentLanguage === "en" ? "Rendering page " : "Generando página ") + pageNumber + " / " + pdf.numPages + "…");
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext("2d", { alpha: false });
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport, background: "#fff" }).promise;
      pages.push(canvas.toDataURL("image/jpeg", 0.86));
      const instagramCanvas = document.createElement("canvas");
      instagramCanvas.width = 1440;
      instagramCanvas.height = 1800;
      const instagramContext = instagramCanvas.getContext("2d", { alpha: false });
      instagramContext.fillStyle = "#fff";
      instagramContext.fillRect(0, 0, 1440, 1800);
      const scale = Math.min(1440 / canvas.width, 1800 / canvas.height);
      const fittedWidth = Math.round(canvas.width * scale);
      const fittedHeight = Math.round(canvas.height * scale);
      instagramContext.drawImage(canvas, Math.round((1440 - fittedWidth) / 2), Math.round((1800 - fittedHeight) / 2), fittedWidth, fittedHeight);
      instagramPages.push(instagramCanvas.toDataURL("image/jpeg", 0.86));
      canvas.width = canvas.height = 1;
      instagramCanvas.width = instagramCanvas.height = 1;
    }
    if (pdf.destroy) await pdf.destroy();
    return { pages, instagramPages };
  }

  function updateSelectionCount(total) {
    const chosen = selectedPages.size;
    $("campaignPageCount").textContent = currentLanguage === "en"
      ? chosen + " of " + total + " pages selected for this campaign"
      : chosen + " de " + total + " páginas seleccionadas para esta campaña";
    $("campaignSelectAllBtn").disabled = !total || chosen === total;
    $("campaignSelectNoneBtn").disabled = !chosen;
    $("campaignSaveBtn").disabled = !chosen || (!!campaignId && currentCampaignStatus !== "draft" && !instagramAlreadyFailedAfterFacebook);
  }

  function showPagePreviews(urls) {
    const holder = $("campaignPreview");
    holder.innerHTML = "";
    (urls || []).forEach((url, index) => {
      const figure = document.createElement("figure");
      figure.className = "campaign-page-choice" + (selectedPages.has(index) ? " is-selected" : "");
      figure.tabIndex = 0;
      figure.setAttribute("role", "checkbox");
      figure.setAttribute("aria-checked", selectedPages.has(index) ? "true" : "false");
      figure.setAttribute("aria-label", (currentLanguage === "en" ? "Include page " : "Incluir página ") + (index + 1));
      const img = document.createElement("img");
      img.src = url;
      img.alt = (currentLanguage === "en" ? "Edition page " : "Página de edición ") + (index + 1);
      const caption = document.createElement("figcaption");
      caption.innerHTML = '<span class="campaign-page-check" aria-hidden="true">✓</span><span>' +
        (currentLanguage === "en" ? "Page " : "Página ") + (index + 1) + '</span>';
      figure.append(img, caption);
      const toggle = () => {
        if (selectedPages.has(index)) selectedPages.delete(index); else selectedPages.add(index);
        figure.classList.toggle("is-selected", selectedPages.has(index));
        figure.setAttribute("aria-checked", selectedPages.has(index) ? "true" : "false");
        updateSelectionCount(urls.length);
      };
      figure.addEventListener("click", toggle);
      figure.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggle(); }
      });
      holder.appendChild(figure);
    });
    updateSelectionCount((urls || []).length);
  }

  $("campaignSelectAllBtn").addEventListener("click", () => {
    const urls = previewPages?.pages || [];
    selectedPages = new Set(urls.map((_, index) => index));
    showPagePreviews(urls);
  });
  $("campaignSelectNoneBtn").addEventListener("click", () => {
    selectedPages.clear();
    showPagePreviews(previewPages?.pages || []);
  });
  $("campaignPreviewBtn").addEventListener("click", async () => {
    try {
      $("campaignPreviewBtn").disabled = true;
      status(currentLanguage === "en" ? "Preparing page previews…" : "Preparando las páginas para seleccionar…");
      previewPages = await makeEditionPages();
      selectedPages = new Set(previewPages.pages.map((_, index) => index));
      showPagePreviews(previewPages.pages);
      status(currentLanguage === "en" ? "Choose the pages to include. Click a page to toggle it." : "Elige las páginas que quieres incluir. Pulsa una página para marcarla o quitarla.");
    } catch (error) {
      status(error.message || (currentLanguage === "en" ? "Could not prepare the preview." : "No se pudo preparar la vista previa."));
    } finally {
      $("campaignPreviewBtn").disabled = false;
    }
  });

  async function loadCampaignList() {
    const { data: { session } } = await client.auth.getSession();
    if (!session) {
      status(currentLanguage === "en"
        ? "Your editorial session has expired. Sign in again to load and repair previous campaigns."
        : "La sesión editorial ha caducado. Inicia sesión de nuevo para cargar y reparar las campañas anteriores.");
      return;
    }
    const { data, error } = await client.functions.invoke("print-edition-campaign", {
      body: { action: "list" }, headers: { Authorization: "Bearer " + session.access_token }
    });
    if (error || data?.error) { status(data?.error || "No se pudieron cargar los borradores."); return; }
    const select = $("campaignDrafts");
    select.innerHTML = '<option value="">' + copy[currentLanguage].fresh + '</option>';
    const campaigns = data.campaigns || [];
    campaigns.forEach(item => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = new Date(item.created_at).toLocaleDateString(currentLanguage === "en" ? "en-GB" : "es-ES") + " · " + item.title + " (" + item.status + ")";
      select.appendChild(option);
    });
    if (!campaigns.length) {
      status(currentLanguage === "en"
        ? "No previous campaigns were returned. Check the editorial login before creating a new one."
        : "No se han devuelto campañas anteriores. Comprueba la sesión editorial antes de crear otra.");
    } else {
      status((currentLanguage === "en" ? "Previous campaigns loaded: " : "Campañas anteriores cargadas: ") + campaigns.length);
    }
  }

  $("campaignLoadBtn").addEventListener("click", async () => {
    const id = $("campaignDrafts").value;
    if (!id) {
      campaignId = null; savedImage = null; previewPages = null; selectedPages = new Set(); currentCampaignStatus = null; instagramAlreadyFailedAfterFacebook = false;
      $("campaignTitle").value = "Nueva edición de EVOFORD NEWS";
      showPagePreviews([]);
      $("campaignPublishBtn").disabled = true;
      $("campaignSaveBtn").textContent = copy[currentLanguage].save;
      status(copy[currentLanguage].ready);
      return;
    }
    try {
      const { data: { session } } = await client.auth.getSession();
      const { data, error } = await client.functions.invoke("print-edition-campaign", {
        body: { action: "get", campaign_id: id }, headers: { Authorization: "Bearer " + session.access_token }
      });
      if (error || data?.error || !data?.campaign) throw new Error(data?.error || "No se pudo cargar la campaña.");
      const item = data.campaign;
      campaignId = item.id;
      $("campaignTitle").value = item.title;
      $("campaignCaption").value = item.caption;
      previewPages = null;
      const loadedUrls = Array.isArray(item.image_urls) && item.image_urls.length ? item.image_urls : [item.image_url];
      selectedPages = new Set(loadedUrls.map((_, index) => index));
      showPagePreviews(loadedUrls);
      currentCampaignStatus = item.status;
      instagramAlreadyFailedAfterFacebook = item.facebook_status === "published" && item.instagram_status === "failed";
      const editable = item.status === "draft" || instagramAlreadyFailedAfterFacebook;
      $("campaignSaveBtn").disabled = !editable;
      $("campaignSaveBtn").textContent = instagramAlreadyFailedAfterFacebook
        ? (currentLanguage === "en" ? "Prepare Instagram images" : "Preparar imágenes de Instagram")
        : editable ? copy[currentLanguage].update : (currentLanguage === "en" ? "Draft locked" : "Borrador cerrado");
      $("campaignPublishBtn").disabled = item.status === "published" || (item.facebook_status === "published" && item.instagram_status === "published");
      status(copy[currentLanguage].loaded + " · Facebook: " + item.facebook_status + " · Instagram: " + item.instagram_status +
        (instagramAlreadyFailedAfterFacebook && !(Array.isArray(item.instagram_image_urls) && item.instagram_image_urls.length === (item.image_urls || []).length)
          ? (currentLanguage === "en" ? " · First click “Prepare Instagram images”; then approve to retry Instagram only." : " · Primero pulsa «Preparar imágenes de Instagram»; después aprueba para reintentar solo Instagram.")
          : ""));
    } catch (error) { status(error.message || "No se pudo cargar la campaña."); }
  });

  document.addEventListener("socialhub:edition-selected", () => {
    status(copy[currentLanguage].ready);
    loadCampaignList();
  });

  $("campaignSaveBtn").addEventListener("click", async () => {
    if (!$("campaignTitle").value.trim() || !$("campaignCaption").value.trim()) {
      status(currentLanguage === "en" ? "Enter a campaign title and caption before saving." : "Escribe el título y el texto de la campaña antes de guardarla.");
      return;
    }
    busy(true);
    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session) throw new Error(copy[currentLanguage].login);
      if (!previewPages) {
        status(copy[currentLanguage].savingCover);
        previewPages = await makeEditionPages();
        selectedPages = new Set(previewPages.pages.map((_, index) => index));
        showPagePreviews(previewPages.pages);
      }
      if (!selectedPages.size) throw new Error(currentLanguage === "en" ? "Select at least one page for the campaign." : "Selecciona al menos una página para la campaña.");
      savedImage = {
        pages: previewPages.pages.filter((_, index) => selectedPages.has(index)),
        instagramPages: previewPages.instagramPages.filter((_, index) => selectedPages.has(index))
      };
      if (savedImage.pages.length > 10) throw new Error(currentLanguage === "en" ? "Instagram supports up to 10 carousel pages. Select 10 or fewer." : "Instagram admite hasta 10 páginas por carrusel. Selecciona 10 o menos.");
      selectedPages = new Set(savedImage.pages.map((_, index) => index));
      showPagePreviews(savedImage.pages);
      updateSelectionCount(savedImage.pages.length);
      status(copy[currentLanguage].saving);
      const { data, error } = await client.functions.invoke("print-edition-campaign", {
        body: {
          action: instagramAlreadyFailedAfterFacebook ? "repair_instagram_images" : (campaignId ? "update" : "save"),
          campaign_id: campaignId,
          title: $("campaignTitle").value.trim(),
          caption: $("campaignCaption").value.trim(),
          images_base64: savedImage.pages,
          instagram_images_base64: savedImage.instagramPages
        },
        headers: { Authorization: "Bearer " + session.access_token }
      });
      if (error) throw new Error(await readableFunctionError(error));
      if (instagramAlreadyFailedAfterFacebook) {
        if (!data?.ok) throw new Error(data?.error || copy[currentLanguage].failed);
        instagramAlreadyFailedAfterFacebook = false;
        currentCampaignStatus = "partial";
        $("campaignSaveBtn").disabled = true;
        $("campaignSaveBtn").textContent = currentLanguage === "en" ? "Instagram images prepared" : "Imágenes de Instagram preparadas";
        status(currentLanguage === "en"
          ? "Instagram images have been resized to 4:5 and saved. Facebook remains published; now retry the campaign to publish Instagram only."
          : "Las imágenes de Instagram se han adaptado a 4:5 y guardado. Facebook sigue publicado; ahora puedes reintentar la campaña para publicar solo en Instagram.");
        $("campaignPublishBtn").disabled = false;
        return;
      }
      if (!data?.ok || !data?.campaign?.id) throw new Error(data?.error || copy[currentLanguage].failed);
      campaignId = data.campaign.id;
      currentCampaignStatus = "draft";
      $("campaignPublishBtn").disabled = false;
      $("campaignSaveBtn").textContent = copy[currentLanguage].update;
      status(copy[currentLanguage].saved);
    } catch (error) {
      console.error("Print edition campaign save:", error);
      status(error.message || copy[currentLanguage].failed);
    } finally {
      busy(false);
    }
  });

  $("campaignPublishBtn").addEventListener("click", async () => {
    if (!campaignId) return;
    if (!window.confirm(copy[currentLanguage].confirm)) return;
    busy(true);
    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session) throw new Error("La sesión editorial ha caducado. Vuelve a iniciar sesión.");
      status(copy[currentLanguage].sending);
      const { data, error } = await client.functions.invoke("print-edition-campaign", {
        body: { action: "publish", campaign_id: campaignId },
        headers: { Authorization: "Bearer " + session.access_token }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const lines = (data.results || []).map(item =>
        item.platform + ": " + item.status + (item.error ? " — " + item.error : "")
      );
      status((data.message || "Proceso finalizado.") + (lines.length ? " " + lines.join(" | ") : ""));
      if (data.ok) $("campaignPublishBtn").disabled = true;
    } catch (error) {
      console.error("Print edition campaign publish:", error);
      status(error.message || copy[currentLanguage].publishFailed);
    } finally {
      busy(false);
    }
  });
})();