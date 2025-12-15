(function () {
  const btn = document.getElementById("menuBtn");
  const header = document.querySelector("header");
  if (!btn || !header) return;

  function closeMenu() {
    header.classList.remove("nav-open");
    btn.setAttribute("aria-expanded", "false");
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = header.classList.toggle("nav-open");
    btn.setAttribute("aria-expanded", String(isOpen));
  });

  header.addEventListener("click", (e) => {
    if (e.target.closest("nav a")) closeMenu();
  });

  document.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
})();
