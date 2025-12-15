function setLang(lang) {
  document.querySelectorAll("[data-lang]").forEach((el) => {
    el.classList.toggle("hidden", el.dataset.lang !== lang);
  });
  localStorage.setItem("lang", lang);

  // Update buttons active state (if present)
  const enBtn = document.getElementById("lang-en");
  const esBtn = document.getElementById("lang-es");
  if (enBtn && esBtn) {
    enBtn.classList.toggle("active", lang === "en");
    esBtn.classList.toggle("active", lang === "es");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const enBtn = document.getElementById("lang-en");
  const esBtn = document.getElementById("lang-es");

  if (enBtn) enBtn.addEventListener("click", () => setLang("en"));
  if (esBtn) esBtn.addEventListener("click", () => setLang("es"));

  setLang(localStorage.getItem("lang") || "en");
});
