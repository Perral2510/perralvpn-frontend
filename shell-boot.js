/* =========================================================
   PerralVPN — Shell boot
   Runs from <head> before first paint. Same-origin only: the
   CSP is `script-src 'self'`, so nothing here may be inlined
   into the document.
   Jobs: pick the theme, hide route content until the deferred
   bulletin sheet lands, then attach that sheet.
   ========================================================= */

const SHEET_VERSION = 'bulletin-9';

(function bootShell(){
  const root = document.documentElement;

  // Light and dark are equals: an explicit choice wins, otherwise
  // the operating system decides. No hard-coded light default.
  let theme = null;
  try {
    const saved = localStorage.getItem('perralvpn-theme');
    theme = saved === 'dark' || saved === 'light' ? saved : null;
  } catch {}
  if (!theme) theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.dataset.theme = theme;

  try {
    const savedLang = localStorage.getItem('perralvpn-language');
    if (savedLang === 'vi' || savedLang === 'en') root.lang = savedLang;
  } catch {}

  // A deferred stylesheet must never paint unstyled DOM. The shell sheet
  // keeps the frame laid out; the route view stays held until the module
  // sheet is in.
  root.classList.add('sheet-pending');

  // Metered or battery-saver connections drop ambient motion. The media
  // query handles vestibular preferences; this handles the data budget.
  const connection = navigator.connection;
  if (connection && (connection.saveData || /(^|\b)(slow-2g|2g|3g)/.test(connection.effectiveType || ''))) {
    root.dataset.motion = 'low';
  }

  const linkSheet = (href) => new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.addEventListener('load', resolve, { once: true });
    // A failed sheet must not hold the page hostage.
    link.addEventListener('error', resolve, { once: true });
    document.head.appendChild(link);
  });

  const FONT_URL = 'https://fonts.googleapis.com/css2'
    + '?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap'
    + '&family=JetBrains+Mono:wght@400;500&display=swap'
    + '&family=Oswald:wght@400;500;600&display=swap';

  window.PERRAL_SHEET_READY = Promise.all([
    linkSheet(`ui-bulletin.css?v=${SHEET_VERSION}`),
    linkSheet(FONT_URL),
  ]).then(() => {
    root.classList.remove('sheet-pending');
    root.classList.add('sheet-ready');
  });
})();
