/* EVOFORD NEWS · navegación de artículos */
(() => {
  const $ = id => document.getElementById(id);
  let currentPage = 1;
  let pageSize = 25;

  function getItems() {
    return [...($("articleList")?.querySelectorAll("[data-article-item]") || [])];
  }

  function makePager(target, page, pages, total) {
    const root = $(target);
    if (!root) return;
    if (!total) {
      root.innerHTML = '<span class="muted">No hay resultados para estos filtros.</span>';
      return;
    }
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    root.innerHTML = `
      <span class="article-page-summary">Mostrando <strong>${start}–${end}</strong> de <strong>${total}</strong></span>
      <div class="article-page-actions">
        <button type="button" class="secondary" data-page="first" ${page===1?"disabled":""} aria-label="Primera página">«</button>
        <button type="button" class="secondary" data-page="prev" ${page===1?"disabled":""}>Anterior</button>
        <label class="article-page-jump">Página <input type="number" min="1" max="${pages}" value="${page}" data-page-input aria-label="Ir a página"> de ${pages}</label>
        <button type="button" class="secondary" data-page="next" ${page===pages?"disabled":""}>Siguiente</button>
        <button type="button" class="secondary" data-page="last" ${page===pages?"disabled":""} aria-label="Última página">»</button>
      </div>`;
  }

  window.filterArticles = function () {
    const list = $("articleList");
    if (!list) return;
    const query = ($("articleSearch")?.value || "").trim().toLocaleLowerCase("es");
    const status = $("articleStatusFilter")?.value || "";
    const category = $("articleCategoryFilter")?.value || "";
    const sort = $("articleSort")?.value || "newest";
    const items = getItems();

    const filtered = items.filter(item =>
      (!query || (item.dataset.search || "").includes(query)) &&
      (!status || item.dataset.status === status) &&
      (!category || item.dataset.category === category)
    );

    filtered.sort((a,b) => {
      if (sort === "title") return (a.dataset.title||"").localeCompare(b.dataset.title||"", "es");
      const delta = new Date(a.dataset.created||0) - new Date(b.dataset.created||0);
      return sort === "oldest" ? delta : -delta;
    });
    filtered.forEach(item => list.appendChild(item));

    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    currentPage = Math.min(Math.max(1,currentPage), pages);
    const first = (currentPage - 1) * pageSize;
    const visible = new Set(filtered.slice(first, first + pageSize));
    items.forEach(item => { item.hidden = !visible.has(item); });

    const count = $("articleFilterCount");
    if (count) count.textContent = filtered.length + " resultados · página " + currentPage + " de " + pages;
    makePager("articlePaginationTop", currentPage, pages, filtered.length);
    makePager("articlePaginationBottom", currentPage, pages, filtered.length);

    document.querySelectorAll("[data-article-quick]").forEach(button => {
      const value = button.dataset.articleQuick || "";
      button.classList.toggle("active", value === status && !category && !query);
      const total = value ? items.filter(item => item.dataset.status === value).length : items.length;
      button.querySelector("small")?.remove();
      const countNode = document.createElement("small");
      countNode.textContent = total;
      button.append(" ", countNode);
    });
  };

  function changePage(action, inputValue) {
    const items = getItems();
    const query = ($("articleSearch")?.value || "").trim().toLocaleLowerCase("es");
    const status = $("articleStatusFilter")?.value || "";
    const category = $("articleCategoryFilter")?.value || "";
    const filtered = items.filter(item =>
      (!query || (item.dataset.search || "").includes(query)) &&
      (!status || item.dataset.status === status) &&
      (!category || item.dataset.category === category)
    );
    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (action === "first") currentPage = 1;
    else if (action === "prev") currentPage = Math.max(1,currentPage-1);
    else if (action === "next") currentPage = Math.min(pages,currentPage+1);
    else if (action === "last") currentPage = pages;
    else if (action === "jump") currentPage = Math.min(pages,Math.max(1,Number(inputValue)||1));
    window.filterArticles();
  }

  function setup() {
    const filters = $("articleStatusFilter");
    if (!filters || !$("articleList")) return;

    // Añade filtros de sección sin modificar el flujo editorial existente.
    const filterRow = document.querySelector(".article-filters");
    if (filterRow && !$("articleCategoryFilter")) {
      const label = document.createElement("label");
      label.className = "filter-category";
      label.htmlFor = "articleCategoryFilter";
      label.textContent = "Sección";
      const select = document.createElement("select");
      select.id = "articleCategoryFilter";
      select.innerHTML = '<option value="">Todas las secciones</option>';
      label.appendChild(select);
      filterRow.insertBefore(label, $("articlePageSize"));
    }

    const refreshCategories = () => {
      const select = $("articleCategoryFilter");
      if (!select) return;
      const selected = select.value;
      const categories = [...new Set(getItems().map(item => item.dataset.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));
      select.innerHTML = '<option value="">Todas las secciones</option>' + categories.map(value => '<option value="' + value.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])) + '">' + value.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])) + '</option>').join("");
      select.value = selected;
    };

    const list = $("articleList");
    new MutationObserver(() => { refreshCategories(); window.filterArticles(); }).observe(list,{childList:true});
    $("articleSearch")?.addEventListener("input",()=>{currentPage=1;window.filterArticles();});
    filters.addEventListener("change",()=>{currentPage=1;window.filterArticles();});
    $("articlePageSize")?.addEventListener("change",event=>{pageSize=Number(event.target.value)||25;currentPage=1;window.filterArticles();});
    $("articleSort")?.addEventListener("change",()=>{currentPage=1;window.filterArticles();});
    $("articleCategoryFilter")?.addEventListener("change",()=>{currentPage=1;window.filterArticles();});
    document.querySelectorAll("[data-article-quick]").forEach(button=>button.addEventListener("click",()=>{
      filters.value=button.dataset.articleQuick||"";
      if($("articleCategoryFilter"))$("articleCategoryFilter").value="";
      $("articleSearch").value="";
      currentPage=1;
      window.filterArticles();
    }));

    ["articlePaginationTop","articlePaginationBottom"].forEach(id=>{
      $(id)?.addEventListener("click",event=>{
        const button=event.target.closest("[data-page]");
        if(button&&!button.disabled)changePage(button.dataset.page);
      });
      $(id)?.addEventListener("change",event=>{
        if(event.target.matches("[data-page-input]"))changePage("jump",event.target.value);
      });
      $(id)?.addEventListener("keydown",event=>{
        if(event.target.matches("[data-page-input]")&&event.key==="Enter"){event.preventDefault();changePage("jump",event.target.value);}
      });
    });
    refreshCategories();
    window.filterArticles();
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});
  else setup();
})();
