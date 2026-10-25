/* =========================================================
   PerralVPN — App bootstrap
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

function getUserInitials(name, fallback = 'PR'){
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts.slice(-2).map(part => part[0]).join('').toUpperCase();
}

function initialsAvatarUrl(name, fallback = 'PR'){
  const initials = getUserInitials(name, fallback).replace(/[^\p{L}\p{N}]/gu, '').slice(0, 2) || fallback;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#C9F24D"/><text x="32" y="40" text-anchor="middle" font-family="'Be Vietnam Pro',Arial,sans-serif" font-size="23" font-weight="700" fill="#14150F">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const EMPTY_AVATAR_DATA_URL = initialsAvatarUrl('PR');

function updateHeaderIdentity(user){
  const name = user?.name || 'Chưa đăng nhập';
  const avatarUrl = user?.avatar || initialsAvatarUrl(user?.name, 'PR');
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
  updateHeaderIdentity(typeof sessionUser !== 'undefined' ? sessionUser : null);
  buildSidebarNav();
}

function setupLangDropdown(){
  qsa('[data-lang]').forEach(btn => btn.addEventListener('click', () => {
    STATE.lang = btn.dataset.lang === 'en' ? 'en' : 'vi';
    try { localStorage.setItem(LANG_STORAGE_KEY, STATE.lang); } catch {}
    document.documentElement.lang = STATE.lang;
    refreshStaticText();
    renderRoute();
    showToast({ type: 'info', title: t('toast_lang_changed') });
  }));
}

function setupSidebarToggle(){
  const shell = qs('.app-shell');
  const hamburger = qs('#hamburgerBtn');
  const setMobileNav = (open) => {
    shell.classList.toggle('mobile-nav-open', open);
    hamburger?.setAttribute('aria-expanded', String(open));
  };
  qs('#collapseBtn').addEventListener('click', () => {
    STATE.sidebarCollapsed = !STATE.sidebarCollapsed;
    shell.classList.toggle('sidebar-collapsed', STATE.sidebarCollapsed);
  });
  hamburger.addEventListener('click', () => setMobileNav(!shell.classList.contains('mobile-nav-open')));
  qs('#sidebarScrim').addEventListener('click', () => setMobileNav(false));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (shell.classList.contains('mobile-nav-open')) setMobileNav(false);
    qsa('.dropdown.open').forEach(d => d.classList.remove('open'));
  });
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
        updateHeaderIdentity(null);
        showToast({ type: 'info', title: t('logout') });
        location.hash = '#/login';
      }
    });
  });
}

function openSupportChoiceModal(){
  const backdrop = openModal({
    title: 'Chọn kênh hỗ trợ',
    bodyHTML: `
      <p class="support-choice__intro">Chọn một kênh để liên hệ với admin.</p>
      <div class="support-choice-grid">
        <a class="support-choice support-choice--zalo" href="${escapeHTML(ZALO_GROUP_URL)}" target="_blank" rel="noopener noreferrer">
          <span class="support-choice__logo">Z</span>
          <span><strong>Zalo</strong><small>Nhắn tin qua nhóm Zalo</small></span>
        </a>
        <a class="support-choice support-choice--telegram" href="${escapeHTML(TELEGRAM_GROUP_URL)}" target="_blank" rel="noopener noreferrer">
          <span class="support-choice__logo">T</span>
          <span><strong>Telegram</strong><small>Tham gia nhóm Telegram</small></span>
        </a>
      </div>
    `,
    size: '420px',
  });
  backdrop.querySelectorAll('.support-choice').forEach(link => link.addEventListener('click', () => closeModal()));
}

function setupSupportFab(){
  qs('#supportFab').addEventListener('click', openSupportChoiceModal);
}

function setupThemeDropdownButtons(){
  // Delegated so the toggle also works on the auth screens, which are
  // rendered after bootstrap.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    e.preventDefault();
    toggleTheme();
  });
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
