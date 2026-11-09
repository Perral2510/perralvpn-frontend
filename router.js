/* =========================================================
   PerralVPN — Hash router
   Owns two weak-network duties: the module sheet must be in
   before a route paints, and each route's page chunk is
   fetched only when that route is actually requested.
   ========================================================= */
let appIntroPlayed = false;

const CHUNK_VERSION = 'bulletin-10';

/* Route renderers are split by the traffic they carry, not by the
   order they were written. Nothing here pulls a chunk a visitor
   on the dashboard would never open. */
const ROUTE_CHUNKS = {
  '#/plan': 'pages2.js',
  '#/changepro': 'pages2.js',
  '#/order': 'pages3.js',
  '#/control': 'pages3.js',
  '#/account': 'pages3.js',
  '#/checkout': 'pages4.js',
  '#/payment-result': 'pages4.js',
  '#/login': 'pages4.js',
  '#/register': 'pages4.js',
  '#/forgot-password': 'pages4.js',
};

const loadedChunks = new Map();

function loadRouteChunk(route){
  const file = ROUTE_CHUNKS[route];
  if (!file) return Promise.resolve();
  if (loadedChunks.has(file)) return loadedChunks.get(file);
  const request = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${file}?v=${CHUNK_VERSION}`;
    script.addEventListener('load', resolve, { once: true });
    script.addEventListener('error', () => reject(new Error(`chunk-missing:${file}`)), { once: true });
    document.head.appendChild(script);
  });
  request.catch(() => loadedChunks.delete(file));
  loadedChunks.set(file, request);
  return request;
}

function routeSkeleton(){
  return `<div class="page-container page-enter">
    <div class="skeleton" style="height:64px;border-radius:4px;"></div>
    <div class="skeleton" style="height:112px;border-radius:4px;"></div>
    ${skeletonCards(3)}
  </div>`;
}

async function renderRoute(){
  const rawRoute = location.hash || '#/dashboard';
  let route = rawRoute.split('?')[0] || '#/dashboard';
  if (!PAGES[route] && !ROUTE_CHUNKS[route]) route = '#/dashboard';
  STATE.currentRoute = route;

  // Auth pages use a standalone full-screen layout. The application shell
  // returns only after the user has completed login or registration.
  const isAuthRoute = route === '#/login' || route === '#/register' || route === '#/forgot-password';
  const shell = qs('.app-shell');
  if (!isAuthRoute && !appIntroPlayed){
    appIntroPlayed = true;
    shell.classList.add('app-intro');
    window.setTimeout(() => shell.classList.remove('app-intro'), 1100);
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
  view.innerHTML = routeSkeleton();
  main.replaceChildren(view);

  try{
    await Promise.all([window.PERRAL_SHEET_READY || Promise.resolve(), loadRouteChunk(route)]);
  }catch{
    main.replaceChildren();
    const fallback = document.createElement('div');
    fallback.className = 'route-view';
    fallback.innerHTML = `<div class="page-container">${errorState({ onRetryAttr: 'data-retry-chunk' })}</div>`;
    main.appendChild(fallback);
    fallback.querySelector('[data-retry-chunk]')?.addEventListener('click', () => {
      loadedChunks.delete(ROUTE_CHUNKS[route]);
      renderRoute();
    });
    main.setAttribute('aria-busy', 'false');
    return;
  }

  if (STATE.currentRoute !== route || !view.isConnected) return;
  view.replaceChildren();
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
