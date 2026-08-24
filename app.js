/* =========================================================
   DucAnhVPN — App bootstrap
   ========================================================= */

function buildSidebarNav(){
  const nav = qs('#sidebarNav');
  nav.innerHTML = NAV_CONFIG.map(entry => {
    if (entry.type === 'item'){
      return `<div class="nav-group"><a class="nav-item" href="${entry.route}" data-route="${entry.route}">${icon(entry.icon)}<span class="nav-label">${t(entry.labelKey)}</span></a></div>`;
    }
    return `
      <div class="nav-group">
        <div class="nav-group__title">${t(entry.titleKey)}</div>
        ${entry.items.map(i => `<a class="nav-item" href="${i.route}" data-route="${i.route}">${icon(i.icon)}<span class="nav-label">${t(i.labelKey)}</span></a>`).join('')}
      </div>
    `;
  }).join('');
}

function updateHeaderIdentity(user){
  if (!user) return;
  const name = user.name || 'DucAnhVPN';
  const avatarUrl = user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
  const avatarName = qs('#avatarName');
  const avatar = document.querySelector('.avatar-btn .avatar');
  if (avatarName) avatarName.textContent = name;
  if (avatar) { avatar.src = avatarUrl; avatar.alt = name; }
}

function refreshStaticText(){
  qs('#sidebarBrandText').textContent = t('app_name');
  qs('#collapseBtnLabel').textContent = t('collapse');
  qs('#globalSearchInput')?.setAttribute('placeholder', t('search_placeholder'));
  qs('#menuAccountInfo').innerHTML = `${icon('control')} ${t('account_info')}`;
  qs('#menuChangePassword').innerHTML = `${icon('settings')} ${t('change_password')}`;
  qs('#menuLogout').innerHTML = `${icon('x')} ${t('logout')}`;
  qs('#supportLabel').textContent = t('support_chat');
  updateHeaderIdentity(MockDB.user);
  buildSidebarNav();
}

function setupLangDropdown(){
  qsa('[data-lang]').forEach(btn => btn.addEventListener('click', () => {
    STATE.lang = btn.dataset.lang;
    document.documentElement.lang = STATE.lang;
    refreshStaticText();
    renderRoute();
    showToast({ type: 'info', title: t('toast_lang_changed') });
  }));
}

function setupSidebarToggle(){
  const shell = qs('.app-shell');
  qs('#collapseBtn').addEventListener('click', () => {
    STATE.sidebarCollapsed = !STATE.sidebarCollapsed;
    shell.classList.toggle('sidebar-collapsed', STATE.sidebarCollapsed);
  });
  qs('#hamburgerBtn').addEventListener('click', () => shell.classList.toggle('mobile-nav-open'));
  qs('#sidebarScrim').addEventListener('click', () => shell.classList.remove('mobile-nav-open'));
}

function setupAccountMenu(){
  qs('#menuAccountInfo').addEventListener('click', () => { location.hash = '#/account'; });
  qs('#menuChangePassword').addEventListener('click', () => { location.hash = '#/account'; });
  qs('#menuLogout').addEventListener('click', () => {
    openConfirm({
      title: t('logout'),
      message: t('cancel_confirm_desc'),
      confirmLabel: t('logout'),
      onConfirm: async () => {
        await RealAPI.logout();
        showToast({ type: 'info', title: t('logout') });
        location.hash = '#/login';
      }
    });
  });
}

function setupSupportFab(){
  qs('#supportFab').addEventListener('click', () => {
    showToast({ type: 'info', title: t('support_chat'), message: t('support_online') });
  });
}

function setupThemeDropdownButtons(){
  qs('#themeToggle').addEventListener('click', toggleTheme);
}

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(STATE.theme);
  refreshStaticText();
  setupDropdowns();
  setupLangDropdown();
  setupSidebarToggle();
  setupAccountMenu();
  setupSupportFab();
  setupThemeDropdownButtons();
  if (!location.hash) location.hash = '#/dashboard';
  renderRoute();
});
