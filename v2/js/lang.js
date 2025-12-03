document.addEventListener("DOMContentLoaded", () => {
  const btnEN = document.getElementById("lang-en");
  const btnES = document.getElementById("lang-es");

  const blocks = document.querySelectorAll("[data-lang]");

  function setLang(lang) {
    blocks.forEach(el => {
      el.classList.toggle("hidden", el.dataset.lang !== lang);
    });
    if (btnEN && btnES) {
      btnEN.classList.toggle("active", lang === "en");
      btnES.classList.toggle("active", lang === "es");
    }
    localStorage.setItem("lang", lang);
  }

  setLang(localStorage.getItem("lang") || "en");

  if (btnEN) btnEN.onclick = () => setLang("en");
  if (btnES) btnES.onclick = () => setLang("es");
});
