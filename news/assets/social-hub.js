(() => {
  "use strict";
  const hub = document.getElementById("socialHub");
  const cover = document.getElementById("socialGraphicPanel");
  const edition = document.getElementById("editionCampaignPanel");
  const coverTab = document.getElementById("socialTabCover");
  const editionTab = document.getElementById("socialTabEdition");
  const toolbarButton = document.getElementById("campaignBtn");
  if (!hub || !cover || !edition || !coverTab || !editionTab) return;

  function show(which, scroll = false) {
    const isEdition = which === "edition";
    cover.hidden = isEdition;
    edition.hidden = !isEdition;
    coverTab.classList.toggle("is-active", !isEdition);
    editionTab.classList.toggle("is-active", isEdition);
    coverTab.setAttribute("aria-selected", String(!isEdition));
    editionTab.setAttribute("aria-selected", String(isEdition));
    if (scroll) hub.scrollIntoView({ behavior: "smooth", block: "start" });
    if (isEdition) {
      document.dispatchEvent(new CustomEvent("socialhub:edition-selected"));
    }
  }
  coverTab.addEventListener("click", event => { event.preventDefault(); show("cover"); });
  editionTab.addEventListener("click", event => { event.preventDefault(); show("edition"); });
  if (toolbarButton) toolbarButton.addEventListener("click", event => {
    event.preventDefault();
    show("cover", true);
  });
  const close = document.getElementById("campaignCloseBtn");
  if (close) close.addEventListener("click", event => {
    event.preventDefault();
    show("cover");
  });
  show("cover");
})();