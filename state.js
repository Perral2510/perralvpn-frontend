/* =========================================================
   PerralVPN — Global state & navigation config
   ========================================================= */
const STATE = {
  lang: 'vi',
  theme: 'light',
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
  { type: 'group', titleKey: 'nav_group_finance', items: [
    { route: '#/order', icon: 'receipt', labelKey: 'nav_order' },
    { route: '#/invite', icon: 'users', labelKey: 'nav_invite' },
  ]},
  { type: 'group', titleKey: 'nav_group_user', items: [
    { route: '#/control', icon: 'control', labelKey: 'nav_control' },
    { route: '#/traffic', icon: 'barchart', labelKey: 'nav_traffic' },
  ]},
];

/* Flat lookup of route -> labelKey for breadcrumb + <title> */
const ROUTE_LABELS = {};
NAV_CONFIG.forEach(entry => {
  if (entry.type === 'item') ROUTE_LABELS[entry.route] = entry.labelKey;
  if (entry.type === 'group') entry.items.forEach(i => ROUTE_LABELS[i.route] = i.labelKey);
});
ROUTE_LABELS['#/account'] = 'account_info';
