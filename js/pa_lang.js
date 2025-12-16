(function(){
  const btnEn = document.getElementById('lang-en');
  const btnEs = document.getElementById('lang-es');

  function setLang(lang){
    document.documentElement.lang = lang;

    const all = document.querySelectorAll('[data-lang]');
    all.forEach(el => {
      const isMatch = el.getAttribute('data-lang') === lang;
      el.classList.toggle('hidden', !isMatch);
    });

    btnEn?.classList.toggle('active', lang === 'en');
    btnEs?.classList.toggle('active', lang === 'es');

    try { localStorage.setItem('evo_lang', lang); } catch(e) {}
  }

  const saved = (()=>{ try { return localStorage.getItem('evo_lang'); } catch(e) { return null; } })();
  setLang(saved === 'es' ? 'es' : 'en');

  btnEn?.addEventListener('click', ()=>setLang('en'));
  btnEs?.addEventListener('click', ()=>setLang('es'));
})();