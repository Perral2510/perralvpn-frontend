/* =========================================================
   PerralVPN — Hash router
   ========================================================= */
let appIntroPlayed = false;

async function renderRoute(){
  const rawRoute = location.hash || '#/dashboard';
  let route = rawRoute.split('?')[0] || '#/dashboard';
  if (!PAGES[route]) route = '#/dashboard';
  STATE.currentRoute = route;

  // Auth pages use a standalone full-screen layout. The application shell
  // returns only after the user has completed login or registration.
  const isAuthRoute = route === '#/login' || route === '#/register' || route === '#/forgot-password';
  const shell = qs('.app-shell');
  if (!isAuthRoute && !appIntroPlayed){
    appIntroPlayed = true;
    shell.classList.add('app-intro');
    window.setTimeout(() => shell.classList.remove('app-intro'), 1000);
  }
  if (!isAuthRoute && typeof RealAPI !== 'undefined') {
    const signedInUser = await RealAPI.getUser().catch(() => null);
    if (!signedInUser) {
      appIntroPlayed = false;
      shell.classList.remove('app-intro');
      location.hash = '#/login';
      return;
    }
  }
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
  qs('#hamburgerBtn')?.setAttribute('aria-expanded', 'false');
  qsa('.dropdown.open').forEach(d => d.classList.remove('open'));

  const main = qs('#pageContent');
  main.setAttribute('aria-busy', 'true');
  // Render into a fresh view node so a slow page that resolves after the
  // user has navigated away writes into a detached tree instead of the
  // page they are now looking at.
  const view = document.createElement('div');
  view.className = 'route-view';
  main.replaceChildren(view);
  try{
    await PAGES[route](view);
  }catch(err){
    view.innerHTML = `<div class="page-container">${errorState({ onRetryAttr: '' })}</div>`;
    console.error(err);
  }
  main.setAttribute('aria-busy', 'false');
  if (typeof syncThemeButtons === 'function') syncThemeButtons();
  main.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

window.addEventListener('hashchange', renderRoute);
