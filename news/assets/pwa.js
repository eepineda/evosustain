(function () {
  "use strict";

  // Register/update the service worker on every News route.
  if ("serviceWorker" in navigator && window.isSecureContext) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/news/sw.js", { scope: "/news/", updateViaCache: "none" })
        .then(registration => registration.update())
        .catch(error => console.warn("Evoford News service worker update failed.", error));
    }, { once: true });
  }

  const banner = document.getElementById("appInstall");
  if (!banner) return;
  const installButton = document.getElementById("installAppBtn");
  const dismissButton = document.getElementById("dismissInstallBtn");
  if (!installButton || !dismissButton) return;

  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const mobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
  let installPrompt = null;
  let dismissed = false;
  try { dismissed = localStorage.getItem("evoford-news-install-dismissed-v2") === "1"; } catch (_) {}
  if (standalone || dismissed || !mobile) return;

  // Show the install action on mobile even before Chrome exposes its native
  // prompt event. The button then explains the browser's manual install path.
  banner.hidden = false;
  installButton.hidden = false;

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    banner.hidden = false;
    installButton.hidden = false;
  });

  window.addEventListener("appinstalled", () => {
    banner.hidden = true;
    installPrompt = null;
  });

  installButton.addEventListener("click", async () => {
    if (installPrompt) {
      installButton.disabled = true;
      try {
        installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice && choice.outcome === "accepted") banner.hidden = true;
      } catch (_) {
        // The browser controls the native installation prompt.
      } finally {
        installPrompt = null;
        installButton.disabled = false;
      }
      return;
    }

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    window.alert(isIOS
      ? "Para instalar Evoford News en iPhone: pulsa Compartir en Safari y selecciona «Añadir a pantalla de inicio»."
      : "Para instalar Evoford News en Android: abre esta página en Google Chrome, pulsa el menú ⋮ y selecciona «Instalar aplicación» o «Añadir a pantalla de inicio».");
  });

  dismissButton.addEventListener("click", () => {
    banner.hidden = true;
    try { localStorage.setItem("evoford-news-install-dismissed-v2", "1"); } catch (_) {}
  });
})();