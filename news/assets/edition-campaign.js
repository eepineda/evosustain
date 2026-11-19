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

  const status = (message) => { $("campaignStatus").textContent = message; };
  const busy = (value) => {
    $("campaignSaveBtn").disabled = value;
    $("campaignPublishBtn").disabled = value || !campaignId;
  };

  async function makeCoverPng() {
    if (!window.EvoPrintController?.createDocument || !window.pdfjsLib) {
      throw new Error("No está disponible el motor de portada. Actualiza la página.");
    }
    if ($("lead").querySelector(".loading") || !$("lead").querySelector(".lead-headline h1")) {
      throw new Error("La edición todavía se está cargando.");
    }
    const doc = await window.EvoPrintController.createDocument();
    if (!doc) throw new Error("No se pudo preparar el documento de la edición.");
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
    const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(doc.output("arraybuffer")) }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d", { alpha: false });
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport, background: "#fff" }).promise;
    const dataUrl = canvas.toDataURL("image/png");
    canvas.width = canvas.height = 1;
    if (pdf.destroy) await pdf.destroy();
    return dataUrl;
  }

  open.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("campaignCloseBtn").addEventListener("click", () => { panel.hidden = true; });

  $("campaignSaveBtn").addEventListener("click", async () => {
    busy(true);
    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session) throw new Error("Inicia sesión con la cuenta editorial autorizada.");
      status("Generando la portada real de la edición…");
      savedImage = await makeCoverPng();
      $("campaignPreview").src = savedImage;
      status("Guardando la campaña como borrador…");
      const { data, error } = await client.functions.invoke("print-edition-campaign", {
        body: {
          action: "save",
          title: $("campaignTitle").value.trim(),
          caption: $("campaignCaption").value.trim(),
          image_base64: savedImage
        },
        headers: { Authorization: "Bearer " + session.access_token }
      });
      if (error) throw error;
      if (!data?.ok || !data?.campaign?.id) throw new Error(data?.error || "No se pudo guardar el borrador.");
      campaignId = data.campaign.id;
      $("campaignPublishBtn").disabled = false;
      $("campaignSaveBtn").textContent = "Actualizar borrador";
      status("Borrador guardado. Revisa la portada y el texto; todavía no se ha publicado en ninguna red.");
    } catch (error) {
      console.error("Print edition campaign save:", error);
      status(error.message || "No se pudo guardar la campaña.");
    } finally {
      busy(false);
    }
  });

  $("campaignPublishBtn").addEventListener("click", async () => {
    if (!campaignId) return;
    if (!window.confirm("¿Apruebas esta portada y este texto para publicar la edición impresa en Facebook e Instagram?")) return;
    busy(true);
    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session) throw new Error("La sesión editorial ha caducado. Vuelve a iniciar sesión.");
      status("Enviando la campaña aprobada a Facebook e Instagram…");
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
      status(error.message || "No se pudo completar la publicación.");
    } finally {
      busy(false);
    }
  });
})();