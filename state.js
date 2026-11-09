/* =========================================================
   PerralVPN — Global state & navigation config
   ========================================================= */
const THEME_STORAGE_KEY = 'perralvpn-theme';
const LANG_STORAGE_KEY = 'perralvpn-language';
const SAVED_LANG = (() => {
  try {
    const value = localStorage.getItem(LANG_STORAGE_KEY);
    return value === 'vi' || value === 'en' ? value : 'vi';
  } catch {
    return 'vi';
  }
})();
/* Light and dark are equals. Only an explicit choice is stored; with
   nothing saved the operating system decides, which is what
   shell-boot.js already painted — this must agree or the first
   theme button flips the page. */
const SAVED_THEME = (() => {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (value === 'dark' || value === 'light') return value;
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
})();

const STATE = {
  lang: SAVED_LANG,
  theme: SAVED_THEME,
  sidebarCollapsed: false,
  mobileNavOpen: false,
  currentRoute: '#/dashboard',
};

/* Holds the plan picked on the Plans page while the user is on the
   checkout/payment page, and the last completed order (for the success screen). */
const CHECKOUT_STATE = {
  plan: null,
  cycle: '1',
  lastOrder: null,
};

/* Nav structure drives both the sidebar markup and the header breadcrumb title */
const NAV_CONFIG = [
  { type: 'item', route: '#/dashboard', icon: 'home', labelKey: 'nav_dashboard' },
  { type: 'item', route: '#/knowledge', icon: 'book', labelKey: 'nav_knowledge' },
  { type: 'item', route: '#/application', icon: 'grid', labelKey: 'nav_application' },
  { type: 'group', titleKey: 'nav_group_plan', items: [
    { route: '#/plan', icon: 'shield', labelKey: 'nav_plan' },
    { route: '#/changepro', icon: 'sliders', labelKey: 'nav_changepro' },
  ]},
  { type: 'item', route: '#/order', icon: 'receipt', labelKey: 'nav_order' },
  { type: 'item', route: '#/control', icon: 'control', labelKey: 'nav_control' },
];

/* Flat lookup of route -> labelKey for breadcrumb + <title> */
const ROUTE_LABELS = {};
NAV_CONFIG.forEach(entry => {
  if (entry.type === 'item') ROUTE_LABELS[entry.route] = entry.labelKey;
  if (entry.type === 'group') entry.items.forEach(i => ROUTE_LABELS[i.route] = i.labelKey);
});
ROUTE_LABELS['#/account'] = 'account_info';
