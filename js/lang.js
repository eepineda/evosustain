/* LANGUAGE SWITCHING / CAMBIO DE IDIOMA */
const enBtn = document.getElementById("lang-en");
const esBtn = document.getElementById("lang-es");

/**
 * Switch site language
 * Cambia el idioma del sitio
 */
function setLanguage(lang) {
  const blocks = document.querySelectorAll("[data-lang]");
  blocks.forEach((el) => {
    const elLang = el.getAttribute("data-lang");
    el.classList.toggle("hidden", elLang !== lang);
  });

  enBtn.classList.toggle("active", lang === "en");
  esBtn.classList.toggle("active", lang === "es");

  document.documentElement.lang = lang;
}

enBtn.addEventListener("click", () => setLanguage("en"));
esBtn.addEventListener("click", () => setLanguage("es"));
