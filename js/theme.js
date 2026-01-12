(function () {
  const STORAGE_KEY = "theme";
  const btn = document.getElementById("themeToggle");

  function applyTheme(mode) {
    document.body.classList.toggle("light", mode === "light");
  }

  // Load saved preference (default: dark)
  const saved = localStorage.getItem(STORAGE_KEY);
  applyTheme(saved === "light" ? "light" : "dark");

  if (!btn) return;

  btn.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light");
    localStorage.setItem(STORAGE_KEY, isLight ? "light" : "dark");
  });
})();
