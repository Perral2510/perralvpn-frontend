/* =========================================================
   PerralVPN — Hash router
   ========================================================= */
async function renderRoute(){
  let route = location.hash || '#/dashboard';
  if (!PAGES[route]) route = '#/dashboard';
  STATE.currentRoute = route;

  // Auth pages use a standalone full-screen layout. The application shell
  // returns only after the user has completed login or registration.
  const isAuthRoute = route === '#/login' || route === '#/register' || route === '#/forgot-password';
  if (!isAuthRoute && typeof RealAPI !== 'undefined') {
    const signedInUser = await RealAPI.getUser().catch(() => null);
    if (!signedInUser) {
      location.hash = '#/login';
      return;
    }
  }
  const shell = qs('.app-shell');
  shell.classList.toggle('auth-mode', isAuthRoute);
  document.body.classList.toggle('auth-page', isAuthRoute);

  // Update sidebar active state
  qsa('.nav-item[data-route]').forEach(el => el.classList.toggle('active', el.dataset.route === route));

  // Update breadcrumb + document title
  const labelKey = ROUTE_LABELS[route];
  const label = labelKey ? t(labelKey) : t('nav_dashboard');
  const crumb = qs('#breadcrumbCurrent');
  if (crumb) crumb.textContent = label;
  document.title = `${label} · ${t('app_name')}`;

  // Close mobile nav / dropdowns on navigation
  qs('.app-shell').classList.remove('mobile-nav-open');
  qsa('.dropdown.open').forEach(d => d.classList.remove('open'));

  const main = qs('#pageContent');
  main.setAttribute('aria-busy', 'true');
  try{
    await PAGES[route](main);
  }catch(err){
    main.innerHTML = `<div class="page-container">${errorState({ onRetryAttr: '' })}</div>`;
    console.error(err);
  }
  main.setAttribute('aria-busy', 'false');
  main.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

window.addEventListener('hashchange', renderRoute);
