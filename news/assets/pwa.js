(function () {
  "use strict";
  // Register/update the service worker on every News route, including installed
  // standalone pages that do not contain the installation banner.
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
  const helpButton = document.getElementById("installHelpBtn");
  const dismissButton = document.getElementById("dismissInstallBtn");
  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  let installPrompt = null;
  let dismissed = false;
  try { dismissed = localStorage.getItem("evoford-news-install-dismissed") === "1"; } catch (_) {}
  if (standalone || dismissed) return;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  const show = () => { banner.hidden = false; };
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
    helpButton.hidden = true;
    show();
  });
  window.addEventListener("appinstalled", () => { banner.hidden = true; installPrompt = null; });
  installButton.addEventListener("click", async () => {
    if (!installPrompt) return;
    installButton.disabled = true;
    try { installPrompt.prompt(); await installPrompt.userChoice; }
    catch (_) {}
    finally { installPrompt = null; installButton.disabled = false; installButton.hidden = true; helpButton.hidden = false; }
  });
  helpButton.addEventListener("click", () => {
    const message = isIOS
      ? "En Safari: pulsa Compartir y selecciona «Añadir a pantalla de inicio»."
      : "En Chrome o Edge: abre el menú del navegador y elige «Instalar aplicación» o «Añadir a pantalla de inicio».";
    window.alert(message);
  });
  dismissButton.addEventListener("click", () => {
    banner.hidden = true;
    try { localStorage.setItem("evoford-news-install-dismissed", "1"); } catch (_) {}
  });
  if (isIOS) { installButton.hidden = true; helpButton.hidden = false; show(); }
  else {
    window.setTimeout(() => {
      if (!banner.hidden || installPrompt || window.matchMedia("(display-mode: standalone)").matches) return;
      show(); installButton.hidden = true; helpButton.hidden = false;
    }, 1800);
  }
})();