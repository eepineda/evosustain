(function(){
  const btn = document.getElementById('menuBtn');
  const nav = document.getElementById('siteNav');
  if(!btn || !nav) return;

  function close(){
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }

  function toggle(){
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  btn.addEventListener('click', toggle);

  document.addEventListener('click', (e)=>{
    if(!nav.contains(e.target) && !btn.contains(e.target)) close();
  });

  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') close();
  });
})();
