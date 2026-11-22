/* EVOFORD Academy · compact workspace navigation
   UI-only controller. Existing data and workflow handlers remain in article-management.js. */
(() => {
  const root = document.getElementById('coursesTab');
  if (!root) return;
  const navItems = Array.from(root.querySelectorAll('[data-academy-view]'));
  const panels = Array.from(root.querySelectorAll('[data-academy-view-panel]'));
  const setView = (view) => {
    const valid = panels.some(panel => panel.dataset.academyViewPanel === view);
    if (!valid) return;
    panels.forEach(panel => { panel.hidden = panel.dataset.academyViewPanel !== view; });
    navItems.forEach(button => {
      const active = button.dataset.academyView === view;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    root.dataset.activeAcademyView = view;
  };
  navItems.forEach(button => button.addEventListener('click', () => setView(button.dataset.academyView)));
  const refreshAll = document.getElementById('refreshAcademyWorkspaceBtn');
  if (refreshAll) refreshAll.addEventListener('click', () => {
    ['refreshCoursesBtn','refreshAcademyStudentsBtn','refreshAcademyProjectsBtn'].forEach(id => {
      const button = document.getElementById(id);
      if (button) button.click();
    });
  });
  setView('overview');
})();
