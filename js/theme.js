(function () {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const apply = (mode) => {
    document.body.classList.toggle("light", mode === "light");
    try { localStorage.setItem("theme", mode); } catch (e) {}
    btn.setAttribute("aria-label", mode === "light" ? "Switch to dark mode" : "Switch to light mode");
    btn.setAttribute("title", mode === "light" ? "Dark" : "Light");
  };

  // Load saved preference; otherwise keep default (dark)
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  if (saved === "light" || saved === "dark") apply(saved);
  else apply("dark");

  btn.addEventListener("click", () => {
    const isLight = document.body.classList.contains("light");
    apply(isLight ? "dark" : "light");
  });
})();