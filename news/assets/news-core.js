/*!
 * Evoford News Core
 * Shared language, navigation and UI primitives.
 * Static-hosting compatible; no build step required.
 */
(function (window, document) {
  "use strict";

  const STORAGE_KEY = "evoford-news-language";
  const SUPPORTED = Object.freeze(["es", "en"]);
  const COPY = Object.freeze({
    es: {
      home: "Portada", international: "Internacional", politics: "Política",
      economy: "Economía", security: "Seguridad", startups: "Startups e innovación",
      opinion: "Opinión y análisis", directory: "Directorio",
      submit: "Envía tu noticia", menu: "Menú", language: "Idioma"
    },
    en: {
      home: "Home", international: "International", politics: "Politics",
      economy: "Economy", security: "Security", startups: "Startups & innovation",
      opinion: "Opinion & analysis", directory: "Directory",
      submit: "Submit a story", menu: "Menu", language: "Language"
    }
  });

  function readLanguage() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.includes(saved)) return saved;
    } catch (_) {}
    const documentLanguage = (document.documentElement.lang || "").slice(0, 2).toLowerCase();
    return SUPPORTED.includes(documentLanguage) ? documentLanguage : "es";
  }

  let language = readLanguage();

  function translate(key, fallback) {
    return COPY[language][key] || fallback || key;
  }

  function apply(root) {
    const scope = root || document;
    scope.querySelectorAll("[data-news-i18n]").forEach((node) => {
      const key = node.getAttribute("data-news-i18n");
      if (key) node.textContent = translate(key, node.textContent);
    });
    scope.querySelectorAll("[data-news-language], [data-language]").forEach((control) => {
      const selected = control.getAttribute("data-news-language") || control.getAttribute("data-language");
      control.setAttribute("aria-pressed", String(selected === language));
    });
    document.documentElement.lang = language;
    document.documentElement.dataset.newsLanguage = language;
  }

  function setLanguage(next) {
    if (!SUPPORTED.includes(next) || next === language) return;
    language = next;
    try { window.localStorage.setItem(STORAGE_KEY, language); } catch (_) {}
    apply();
    window.dispatchEvent(new CustomEvent("evoford:languagechange", { detail: { language } }));
  }

  document.addEventListener("click", (event) => {
    const control = event.target.closest("[data-news-language], [data-language]");
    if (!control) return;
    const next = control.getAttribute("data-news-language") || control.getAttribute("data-language");
    if (SUPPORTED.includes(next)) setLanguage(next);
  });

  const api = Object.freeze({
    version: "1.0.0",
    supportedLanguages: SUPPORTED,
    get language() { return language; },
    translate,
    setLanguage,
    apply,
    onLanguageChange(callback) {
      if (typeof callback !== "function") return function () {};
      const handler = (event) => callback(event.detail.language);
      window.addEventListener("evoford:languagechange", handler);
      return () => window.removeEventListener("evoford:languagechange", handler);
    }
  });

  window.EvofordNews = window.EvofordNews || {};\n  Object.defineProperties(window.EvofordNews, {\n    version: { value: api.version, configurable: true },\n    supportedLanguages: { value: api.supportedLanguages, configurable: true },\n    language: { get: () => language, configurable: true },\n    translate: { value: api.translate, configurable: true },\n    setLanguage: { value: api.setLanguage, configurable: true },\n    apply: { value: api.apply, configurable: true },\n    onLanguageChange: { value: api.onLanguageChange, configurable: true }\n  });
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => apply(), { once: true });
  } else {
    apply();
  }
})(window, document);
