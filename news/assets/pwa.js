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
  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  let installPrompt = null;
  let dismissed = false;
  try { dismissed = localStorage.getItem("evoford-news-install-dismissed") === "1"; } catch (_) {}
  if (standalone || dismissed) return;

  // On Android/Chrome, show only the native install action when the browser
  // confirms that the PWA can be installed. No manual "How to install" path.
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
    banner.hidden = false;
  });
  window.addEventListener("appinstalled", () => {
    banner.hidden = true;
    installPrompt = null;
  });
  installButton.addEventListener("click", async () => {
    if (!installPrompt) return;
    installButton.disabled = true;
    try {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice && choice.outcome === "accepted") banner.hidden = true;
    } catch (_) {
      // The browser controls the native installation prompt and its errors.
    } finally {
      installPrompt = null;
      installButton.disabled = false;
    }
  });
  dismissButton.addEventListener("click", () => {
    banner.hidden = true;
    try { localStorage.setItem("evoford-news-install-dismissed", "1"); } catch (_) {}
  });
})();