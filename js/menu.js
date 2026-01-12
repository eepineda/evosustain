(function () {
  const btn = document.getElementById("menuBtn");
  const header = document.querySelector("header");
  const nav = document.getElementById("siteNav");
  if (!header || !nav) return;

  const subButtons = Array.from(nav.querySelectorAll(".has-sub > .nav-btn"));

  function closeAllSubmenus() {
    nav.querySelectorAll(".has-sub.sub-open").forEach((item) => {
      item.classList.remove("sub-open");
      const b = item.querySelector(".nav-btn");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  }

  function closeMenu() {
    header.classList.remove("nav-open");
    if (btn) btn.setAttribute("aria-expanded", "false");
    closeAllSubmenus();
  }

  // Mobile menu toggle
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = header.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", String(isOpen));
      if (!isOpen) closeAllSubmenus();
    });
  }

  // Submenu toggles (click-to-open for touch / accessibility)
  subButtons.forEach((b) => {
    b.addEventListener("click", (e) => {
      e.stopPropagation();

      const item = b.closest(".has-sub");
      if (!item) return;

      const willOpen = !item.classList.contains("sub-open");

      // close others
      nav.querySelectorAll(".has-sub.sub-open").forEach((other) => {
        if (other !== item) {
          other.classList.remove("sub-open");
          const ob = other.querySelector(".nav-btn");
          if (ob) ob.setAttribute("aria-expanded", "false");
        }
      });

      item.classList.toggle("sub-open", willOpen);
      b.setAttribute("aria-expanded", String(willOpen));
    });
  });

  // Close mobile menu when clicking a link
  header.addEventListener("click", (e) => {
    const link = e.target.closest("nav a");
    if (link) closeMenu();
  });

  // Click outside closes menus (but allow clicks inside nav)
  document.addEventListener("click", (e) => {
    if (nav.contains(e.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
})();
