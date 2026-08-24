/* =========================================================
   PerralVPN — Page renderers
   Each render fn receives the <main id="pageContent"> container,
   shows a skeleton immediately, then fetches mock data and paints.
   ========================================================= */

const PAGES = {};
const APPLE_ID_TRIAL_URL = 'https://idshadow.hoantienviet.com/home?fbclid=IwY2xjawT1QA1wZG9mBWV4dG4DYWVtAjEwAGJyaWQRMTlwWjF0NG9DNU9JODFoWWRzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEe8AobL3EnBU7V0Sy-_jHIZtGyvYEfChEY75Jo-r3TI8geebrKPDYtY6hdWtQ_aem_KVGjXVqzzpbV5brV32EV_g#listing';
const PROMO_BANNER_IMAGES = ['assets/promo-anime-01.jpg', 'assets/promo-anime-02.jpg', 'assets/promo-anime-03.jpg'];
const ZALO_GROUP_URL = 'https://zalo.me/g/8kps1zwougt3wzqi57jq';
const TELEGRAM_GROUP_URL = 'https://t.me/+Nn5cWIk05sNiYTM1';

function pageHeader(titleKey, descKey){
  return `<div class="page-header"><h1>${t(titleKey)}</h1><p>${t(descKey)}</p></div>`;
}

function platformIcon(platform){
  const common = 'viewBox="0 0 48 48" aria-hidden="true" focusable="false"';
  const icons = {
    windows: `<svg class="platform-icon platform-icon--windows" ${common}><path d="M5 9.5 22 7v16H5V9.5Zm20-3L43 4.2V23H25V6.5ZM5 25h17v16L5 38.5V25Zm20 0h18v18.8L25 41V25Z"/></svg>`,
    apple: `<svg class="platform-icon platform-icon--apple" ${common}><path d="M31.8 8.7c1.6-2 1.5-4.1 1.4-4.7-1.9.1-4.1 1.2-5.4 2.7-1.2 1.4-2.3 3.5-1.9 5.4 2.1.2 4.3-1 5.9-3.4ZM38.1 25.6c0-5.2 4.2-7.7 4.4-7.8-2.4-3.6-6.1-4.1-7.4-4.2-3.1-.3-6.1 1.8-7.7 1.8-1.6 0-4.1-1.8-6.8-1.7-3.5.1-6.7 2-8.5 5.1-3.7 6.4-.9 15.8 2.6 21 1.7 2.5 3.8 5.3 6.6 5.2 2.7-.1 3.7-1.7 6.9-1.7 3.2 0 4.1 1.7 6.9 1.6 2.9-.1 4.7-2.5 6.4-5 2-2.9 2.8-5.7 2.9-5.8-.1 0-6.3-2.4-6.3-8.5Z"/></svg>`,
    android: `<svg class="platform-icon platform-icon--android" ${common}><path d="M14.5 18.5h19v16c0 3.3-2.7 6-6 6H20.5c-3.3 0-6-2.7-6-6v-16ZM11 20.5h2v12h-2c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2Zm26 0h2c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2h-2v-12ZM17 17c.4-3.6 2.6-6.2 5.3-7.3L20.1 6l1.2-.7 2.3 3.9c.8-.2 1.6-.3 2.4-.3s1.7.1 2.4.3l2.3-3.9 1.2.7-2.2 3.7c2.7 1.1 4.9 3.7 5.3 7.3H17Zm5-3.8a1.2 1.2 0 1 0 0 .1v-.1Zm10 0a1.2 1.2 0 1 0 0 .1v-.1Z"/></svg>`,
    linux: `<svg class="platform-icon platform-icon--linux" ${common}><path d="M24 4c-5.8 0-8.7 5.2-8.7 11.2 0 3.4-2.6 7.1-4.6 10.3-2 3.2-3.8 7.1-2.1 10.8 1.2 2.7 4.4 3.2 7.1 2.4 2.7-.8 4.8-2.3 8.3-2.3s5.6 1.5 8.3 2.3c2.7.8 5.9.3 7.1-2.4 1.7-3.7-.1-7.6-2.1-10.8-2-3.2-4.6-6.9-4.6-10.3C32.7 9.2 29.8 4 24 4Z"/><path fill="#fff" stroke="none" d="M18 25c1.8-1.7 3.7-2.5 6-2.5s4.2.8 6 2.5v8.8c-1.8 1.3-3.8 2-6 2s-4.2-.7-6-2V25Z"/><circle cx="20" cy="16" r="1.5" fill="#263746" stroke="none"/><circle cx="28" cy="16" r="1.5" fill="#263746" stroke="none"/><path d="m21.5 19.5 2.5 2 2.5-2-2.5-1.2-2.5 1.2Z" fill="#f0a323" stroke="none"/><path d="M14.2 35.5 10 39m19.8-3.5L34 39" fill="none" stroke="#f0a323" stroke-width="2.5" stroke-linecap="round"/></svg>`
  };
  return icons[platform] || '';
}

/* ---------------------------------------------------------
   1) DASHBOARD
   --------------------------------------------------------- */
PAGES['#/dashboard'] = async (root) => {
  root.innerHTML = `
    <div class="page-container page-enter">
      <div class="skeleton" style="height:150px;border-radius:18px;margin-bottom:24px;"></div>
      <div class="grid grid-2" style="margin-bottom:24px;">
        <div class="skeleton skel-card"></div>
        <div class="skeleton skel-card"></div>
      </div>
      ${skeletonCards(3)}
    </div>`;

  const [user, promosResult, menuResult, billing, vpnResponse] = await Promise.all([
    RealAPI.getUser().catch(() => null),
    MockAPI.getPromos().catch(() => []),
    MockAPI.getQuickMenu().catch(() => []),
    RealAPI.getBilling().catch(() => null),
    (typeof RealAPI.getVpnSubscription === 'function' ? RealAPI.getVpnSubscription() : Promise.resolve({ ok: false, data: null })).catch(() => ({ ok: false, data: null }))
  ]);
  const promos = Array.isArray(promosResult) ? promosResult : [];
  const menu = Array.isArray(menuResult) ? menuResult : [];
  if (!user) {
    showToast({ type: 'error', title: 'Phiên đăng nhập đã hết hạn' });
    location.hash = '#/login';
    return;
  }
  updateHeaderIdentity(user);

  let slideIdx = 0;

  const accountBalance = Number.isFinite(Number(user.balance)) ? Number(user.balance) : 0;
  const activeSubscription = billing?.activeSubscription || null;
  const recentOrders = billing?.orders || [];
  const vpn = vpnResponse?.ok ? vpnResponse.data : null;

  root.innerHTML = `
    <div class="page-container page-enter">
      <div class="page-header"><h1>${t('welcome_back')}</h1><p>${escapeHTML(user.name)}</p></div>

      <div class="carousel" id="promoCarousel">
        <div class="carousel__track" id="carouselTrack">
          ${promos.map((p, promoIndex) => `
            <div class="carousel__slide" style="background-image:linear-gradient(115deg,rgba(14,51,128,.72),rgba(20,184,166,.32)),url('${PROMO_BANNER_IMAGES[promoIndex % PROMO_BANNER_IMAGES.length]}');">
              <h2>${escapeHTML(STATE.lang === 'vi' ? p.title : p.titleEn)}</h2>
              <p>${escapeHTML(STATE.lang === 'vi' ? p.desc : p.descEn)}</p>
            </div>`).join('')}
        </div>
        <button class="carousel__nav prev" aria-label="Previous slide">‹</button>
        <button class="carousel__nav next" aria-label="Next slide">›</button>
        <div class="carousel__dots">
          ${promos.map((_, i) => `<button class="carousel__dot ${i === 0 ? 'active' : ''}" data-idx="${i}" aria-label="Slide ${i+1}"></button>`).join('')}
        </div>
      </div>

      <div class="grid grid-2" style="margin-bottom:24px;">
        <div class="card">
          <div class="card-title">${t('account_info')}</div>
          <div class="flex items-center gap-3 mb-0" style="margin-bottom:16px;">
            <img class="avatar" style="width:52px;height:52px;" src="${user.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(user.name)}" alt="${escapeHTML(user.name)}" loading="lazy">
            <div>
              <div class="flex items-center gap-2"><strong>${escapeHTML(user.name)}</strong> ${user.verified ? `<span class="badge badge-info">${icon('check')} ${t('verified')}</span>` : ''}</div>
              <div class="text-secondary text-sm">${escapeHTML(user.email)}</div>
            </div>
          </div>
          <div class="grid grid-2 text-sm" style="margin-bottom:18px;">
            <div><div class="text-secondary">${t('join_date')}</div><div class="mono">${formatDate(user.joinDate, STATE.lang)}</div></div>
            <div><div class="text-secondary">${t('user_id')}</div><div class="mono">${escapeHTML(user.userId)}</div></div>
          </div>
          <div class="flex gap-2" style="flex-wrap:wrap;">
            <button class="btn btn-primary" id="btnTopup">${icon('wallet')} ${t('topup')} · ${formatCurrency(accountBalance)}</button>
            <button class="btn btn-secondary" id="btnZalo">Zalo</button>
            <button class="btn btn-secondary" id="btnTelegram">Telegram</button>
          </div>
        </div>

        <div class="card plan-card plan-card--pro">
          <div class="plan-card__pro-head">
            <div class="plan-card__pro-mark">DA</div>
            <div class="plan-card__pro-title"><span>${activeSubscription ? 'GÓI ĐANG KÍCH HOẠT' : 'GÓI DỊCH VỤ'}</span><h3>${escapeHTML(activeSubscription?.planName || 'Chưa có gói đang hoạt động')}</h3></div>
            <span class="plan-card__pro-status"><i></i> ${activeSubscription ? 'Đang hoạt động' : 'Chưa kích hoạt'}</span>
          </div>
          ${activeSubscription ? `<div class="plan-card__pro-subhead"><span>Hạn sử dụng <b>${activeSubscription.lifetime ? 'Vĩnh viễn' : formatDate(activeSubscription.expiresAt, STATE.lang)}</b></span><span><b>${activeSubscription.devices} thiết bị</b> tối đa</span></div><div class="plan-card__pro-metrics"><div class="plan-metric"><span>Dung lượng</span><strong>${escapeHTML(activeSubscription.capacity)}</strong><small>theo gói đã mua</small></div><div class="plan-metric"><span>Tốc độ</span><strong>${escapeHTML(activeSubscription.speed)}</strong><small>băng thông dịch vụ</small></div><div class="plan-metric"><span>Thiết bị</span><strong>${activeSubscription.devices}</strong><small>thiết bị được phép</small></div></div>` : `<div class="plan-empty-state"><strong>Bạn chưa có gói VPN hoạt động</strong><span>Chọn gói phù hợp và thanh toán qua QR Bank để bắt đầu sử dụng.</span><button class="btn btn-sm btn-primary" data-nav="#/plan">Xem các gói cước</button></div>`}
          <div class="plan-card__actions"><button class="btn btn-sm btn-outline" data-nav="#/changepro">⚙ ${t('change_sni')}</button><button class="btn btn-sm btn-outline" data-nav="#/knowledge">▣ ${t('guide')}</button><button class="btn btn-sm btn-outline" id="btnAppleId"> ${t('get_apple_id')}</button><button class="btn btn-sm btn-outline" id="btnResetLink">⟳ ${t('reset_link')}</button></div>
          <div class="plan-card__sync"><div class="plan-card__sync-row"><button class="btn btn-sm btn-accent" id="btnSyncApp" ${activeSubscription ? '' : 'disabled'} aria-haspopup="menu" aria-expanded="false"><span class="sync-glyph" aria-hidden="true">⟳</span> Đồng bộ máy chủ về app</button><div class="sync-options" id="syncOptions" role="menu" hidden>
            <button class="sync-option" type="button" role="menuitem" data-sync-action="copy"><span class="sync-option__icon">${icon('copy')}</span><span>Sao chép liên kết</span></button>
            <button class="sync-option" type="button" role="menuitem" data-sync-action="qr"><span class="sync-option__icon">${icon('grid')}</span><span>Quét mã QR để đăng ký</span></button>
            <button class="sync-option" type="button" role="menuitem" data-sync-action="singbox"><span class="sync-option__app-icon sync-option__app-icon--box">◈</span><span>Nhập vào Sing-box</span></button>
            <button class="sync-option" type="button" role="menuitem" data-sync-action="clash"><span class="sync-option__app-icon sync-option__app-icon--clash">M</span><span>Nhập vào ClashMeta</span></button>
          </div></div><div class="plan-card__platforms" aria-label="Các hệ điều hành hỗ trợ"><span title="Windows">${platformIcon('windows')}</span><span title="Apple">${platformIcon('apple')}</span><span title="Android">${platformIcon('android')}</span><span title="Linux">${platformIcon('linux')}</span></div></div>
        </div>
      </div>

      <section class="card vpn-subscription-card" style="margin-bottom:24px;">
        <div class="dashboard-billing-card__head">
          <div><span class="dashboard-billing-card__eyebrow">VPN SUBSCRIPTION</span><h2>Thông tin kết nối</h2><p>URL subscription và mã QR được tạo từ client đã đồng bộ trên máy chủ 3x-ui.</p></div>
          <span class="dashboard-billing-card__icon">${icon('shield')}</span>
        </div>
        ${vpn ? `<div class="dashboard-billing-card__body" style="align-items:flex-start;">
          <div style="display:flex;gap:18px;align-items:center;min-width:180px;">
            <img src="${vpn.qrDataUrl}" alt="QR subscription VPN" width="160" height="160" style="border-radius:12px;background:#fff;padding:8px;">
            <div><strong>Quét để thêm vào ứng dụng VPN</strong><small style="display:block;color:var(--text-secondary);margin-top:6px;">Có thể dùng V2RayN, V2Box, Hiddify, NekoBox và các app tương thích.</small></div>
          </div>
          <div style="display:grid;gap:10px;flex:1;min-width:280px;">
            <label class="text-secondary text-sm">Subscription URL<input class="form-input mono" id="vpnSubUrl" readonly value="${escapeHTML(vpn.subscriptionUrl)}"></label>
            <label class="text-secondary text-sm">JSON URL<input class="form-input mono" id="vpnJsonUrl" readonly value="${escapeHTML(vpn.jsonUrl)}"></label>
            <label class="text-secondary text-sm">Clash URL<input class="form-input mono" id="vpnClashUrl" readonly value="${escapeHTML(vpn.clashUrl)}"></label>
            <div class="flex gap-2" style="flex-wrap:wrap;"><button class="btn btn-sm btn-primary" id="btnCopySub">Sao chép sub URL</button><button class="btn btn-sm btn-secondary" id="btnCopyJson">Sao chép JSON URL</button><button class="btn btn-sm btn-secondary" id="btnCopyClash">Sao chép Clash URL</button></div>
            ${vpn.warning ? `<small class="text-secondary">${escapeHTML(vpn.warning)}</small>` : ''}
          </div>
        </div>` : `<div class="plan-empty-state"><strong>Chưa có subscription VPN</strong><span>Sau khi đơn được admin xác nhận thanh toán, hãy bấm “Đồng bộ máy chủ về app” để tạo client trên 3x-ui.</span></div>`}
      </section>

      <section class="card dashboard-billing-card">
        <div class="dashboard-billing-card__head"><div><span class="dashboard-billing-card__eyebrow">PerralVPN BILLING</span><h2>Quản lý gói cước & thanh toán</h2><p>Theo dõi gói đang dùng, tạo đơn hàng và thanh toán qua QR Bank.</p></div><span class="dashboard-billing-card__icon">${icon('wallet')}</span></div>
        <div class="dashboard-billing-card__body">
          <div class="dashboard-billing-card__active"><span class="text-secondary">Gói hiện tại</span><strong>${escapeHTML(activeSubscription?.planName || 'Chưa có gói đang hoạt động')}</strong><small>${activeSubscription ? `${activeSubscription.capacity} · ${activeSubscription.speed}` : 'Chọn một gói phù hợp để bắt đầu sử dụng.'}</small></div>
          <div class="dashboard-billing-card__status"><span class="text-secondary">Trạng thái thanh toán</span><strong>${recentOrders[0] ? (recentOrders[0].status === 'paid' ? 'Đã thanh toán' : recentOrders[0].status === 'pending' ? 'Chờ đối soát' : 'Chưa có thanh toán hoàn tất') : 'Chưa có đơn hàng'}</strong><small>${recentOrders[0] ? `Đơn gần nhất: ${escapeHTML(recentOrders[0].id)}` : 'Các đơn hàng mới sẽ xuất hiện tại đây.'}</small></div>
          <div class="dashboard-billing-card__actions"><button class="btn btn-primary" data-nav="#/plan">${icon('shield')} Quản lý gói cước</button><button class="btn btn-secondary" data-nav="#/order">${icon('receipt')} Xem đơn hàng</button></div>
        </div>
      </section>

      <div class="card">
        <div class="card-title">${t('quick_menu')}</div>
        <ul class="grid grid-3">
          ${menu.map(m => `
            <li>
              <a href="${routeFor(m.labelKey)}" class="nav-item" style="color:var(--text-primary);border:1px solid var(--border-color);">
                ${icon(m.icon)}<span class="nav-label">${t(m.labelKey)}</span>
              </a>
            </li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  // Carousel wiring
  const track = qs('#carouselTrack', root);
  const dots = qsa('.carousel__dot', root);
  const setSlide = (i) => {
    slideIdx = (i + promos.length) % promos.length;
    track.style.transform = `translateX(-${slideIdx * 100}%)`;
    dots.forEach((d, idx) => d.classList.toggle('active', idx === slideIdx));
  };
  qs('.carousel__nav.prev', root).addEventListener('click', () => setSlide(slideIdx - 1));
  qs('.carousel__nav.next', root).addEventListener('click', () => setSlide(slideIdx + 1));
  dots.forEach(d => d.addEventListener('click', () => setSlide(Number(d.dataset.idx))));
  let autoTimer = setInterval(() => setSlide(slideIdx + 1), 5000);
  qs('#promoCarousel', root).addEventListener('mouseenter', () => clearInterval(autoTimer));
  qs('#promoCarousel', root).addEventListener('mouseleave', () => { autoTimer = setInterval(() => setSlide(slideIdx + 1), 5000); });

  qsa('[data-nav]', root).forEach(b => b.addEventListener('click', () => { location.hash = b.dataset.nav; }));
  qs('#btnTopup', root).addEventListener('click', () => openTopupModal(accountBalance));
  qs('#btnZalo', root).addEventListener('click', () => window.open(ZALO_GROUP_URL, '_blank', 'noopener,noreferrer'));
  qs('#btnTelegram', root).addEventListener('click', () => window.open(TELEGRAM_GROUP_URL, '_blank', 'noopener,noreferrer'));
  qs('#btnAppleId', root).addEventListener('click', () => window.open(APPLE_ID_TRIAL_URL, '_blank', 'noopener,noreferrer'));
  const copyVpnValue = async (id) => {
    const input = qs(id, root);
    if (!input) return;
    try { await navigator.clipboard.writeText(input.value); showToast({ type: 'success', title: 'Đã sao chép URL subscription.' }); }
    catch { input.select(); document.execCommand('copy'); showToast({ type: 'success', title: 'Đã sao chép URL subscription.' }); }
  };
  qs('#btnCopySub', root)?.addEventListener('click', () => copyVpnValue('#vpnSubUrl'));
  qs('#btnCopyJson', root)?.addEventListener('click', () => copyVpnValue('#vpnJsonUrl'));
  qs('#btnCopyClash', root)?.addEventListener('click', () => copyVpnValue('#vpnClashUrl'));
  const syncTrigger = qs('#btnSyncApp', root);
  const syncMenu = qs('#syncOptions', root);
  const getSyncData = async () => {
    if (vpn?.subscriptionUrl) return vpn;
    showToast({ type: 'info', title: 'Đang đồng bộ subscription...' });
    if (typeof RealAPI.syncVpnSubscription !== 'function') {
      showToast({ type: 'error', title: 'API đồng bộ chưa được cập nhật. Vui lòng tải lại trang.' });
      return null;
    }
    const result = await RealAPI.syncVpnSubscription();
    if (!result.ok) {
      showToast({ type: 'error', title: result.error || result.message || 'Không thể đồng bộ gói VPN.' });
      return null;
    }
    const refreshed = await RealAPI.getVpnSubscription();
    if (refreshed?.ok && refreshed.data?.subscriptionUrl) return refreshed.data;
    showToast({ type: 'error', title: 'Máy chủ chưa trả về liên kết subscription.' });
    return null;
  };
  const closeSyncMenu = () => {
    if (!syncMenu) return;
    syncMenu.hidden = true;
    syncTrigger?.setAttribute('aria-expanded', 'false');
  };
  syncTrigger?.addEventListener('click', (event) => {
    event.stopPropagation();
    const willOpen = Boolean(syncMenu?.hidden);
    if (syncMenu) syncMenu.hidden = !willOpen;
    syncTrigger.setAttribute('aria-expanded', String(willOpen));
  });
  syncMenu?.addEventListener('click', async (event) => {
    const option = event.target.closest('[data-sync-action]');
    if (!option) return;
    event.stopPropagation();
    const action = option.dataset.syncAction;
    closeSyncMenu();
    if (!activeSubscription) {
      showToast({ type: 'warning', title: 'Chưa có gói VPN', message: 'Mua và kích hoạt gói trước khi đồng bộ.' });
      return;
    }
    const syncData = await getSyncData();
    if (!syncData?.subscriptionUrl) return;
    const syncLink = syncData.subscriptionUrl;
    if (action === 'copy') {
      const ok = await copyToClipboard(syncLink);
      showToast({ type: ok ? 'success' : 'error', title: ok ? 'Đã sao chép liên kết' : 'Không thể sao chép liên kết' });
      return;
    }
    if (action === 'qr') {
      const qrUrl = buildDemoQrDataUrl(syncLink);
      openModal({
        title: 'Quét mã QR để đăng ký',
        bodyHTML: `<div class="sync-qr"><div class="topup-modal__qr-wrap"><img src="${qrUrl}" alt="Mã QR liên kết máy chủ" style="width:220px;height:220px;background:#fff;padding:10px;border-radius:12px;"></div><p class="text-secondary text-sm">Dùng camera hoặc ứng dụng VPN để quét liên kết máy chủ.</p></div>`,
        size: '420px',
      });
      return;
    }
    const importSource = action === 'singbox'
      ? (syncData.jsonUrl || syncLink)
      : (syncData.clashUrl || syncLink);
    const importUrl = action === 'singbox'
      ? `sing-box://import-remote-profile?url=${encodeURIComponent(importSource)}`
      : `clash://install-config?url=${encodeURIComponent(importSource)}`;
    window.location.assign(importUrl);
  });
  document.addEventListener('click', closeSyncMenu);
  qs('#btnResetLink', root).addEventListener('click', () => {
    openConfirm({
      title: t('reset_link'), message: t('cancel_confirm_desc'), confirmLabel: t('confirm'), danger: false,
      onConfirm: async () => {
        showToast({ type: 'info', title: t('loading') });
        await MockAPI.resetServerLink();
        showToast({ type: 'success', title: t('toast_link_reset') });
      }
    });
  });
};

function routeFor(labelKey){
  const found = Object.entries(ROUTE_LABELS).find(([, v]) => v === labelKey);
  return found ? found[0] : '#/dashboard';
}

function buildDemoQrDataUrl(payload){
  const size = 29;
  let hash = 2166136261;
  for (const char of payload) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  const cells = Array.from({length:size}, () => Array(size).fill(false));
  const reserved = Array.from({length:size}, () => Array(size).fill(false));
  const set = (x, y, value, mark = true) => { if (x >= 0 && y >= 0 && x < size && y < size) { cells[y][x] = value; reserved[y][x] = mark; } };
  const finder = (ox, oy) => { for (let y = -1; y < 8; y++) for (let x = -1; x < 8; x++) { const inside = x >= 0 && x < 7 && y >= 0 && y < 7; const black = inside && (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)); set(ox + x, oy + y, black); } };
  finder(0, 0); finder(size - 7, 0); finder(0, size - 7);
  for (let i = 8; i < size - 8; i++) { set(i, 6, i % 2 === 0); set(6, i, i % 2 === 0); }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!reserved[y][x]) { hash = Math.imul(hash ^ (x * 31 + y * 17 + payload.length), 16777619) >>> 0; cells[y][x] = ((hash >>> ((x + y) % 24)) & 1) === 1; }
  const rects = []; for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (cells[y][x]) rects.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="white"/> <g fill="#111827">${rects.join('')}</g></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function openTopupModal(balance){
  const demoBank = { bank: 'MB Bank', account: '0123456789', owner: 'NGUYEN DUC ANH', content: 'DAV-928471' };
  const initialAmount = 100000;
  const qrUrl = (amount) => buildDemoQrDataUrl(`Bank:${demoBank.bank}|STK:${demoBank.account}|ChuTK:${demoBank.owner}|SoTien:${amount}|NoiDung:${demoBank.content}`);
  openModal({
    title: 'Nạp tiền qua QR Bank',
    bodyHTML: `
      <div class="topup-modal">
        <div class="topup-modal__intro"><span class="topup-modal__eyebrow">PERRALVPN WALLET</span><h3>Nạp tiền nhanh chóng</h3><p>Quét mã QR bằng ứng dụng ngân hàng của bạn để cộng tiền vào tài khoản.</p></div>
        <div class="topup-modal__layout">
          <div class="topup-modal__qr-panel"><div class="topup-modal__qr-wrap"><img id="topupQr" src="${qrUrl(initialAmount)}" alt="Mã QR chuyển khoản demo"><span class="topup-modal__qr-badge">QR BANK</span></div><small>Thông tin QR demo — sẽ thay bằng QR từ API</small></div>
          <div class="topup-modal__details">
            <div class="field"><label>Số tiền muốn nạp</label><div class="topup-amount-input"><input class="input" type="number" min="10000" step="10000" value="${initialAmount}" id="topupAmount"><span>₫</span></div></div>
            <div class="topup-bank-card"><div><span>Ngân hàng</span><b>${demoBank.bank}</b></div><div><span>Số tài khoản</span><b class="mono">${demoBank.account}</b></div><div><span>Chủ tài khoản</span><b>${demoBank.owner}</b></div><div><span>Nội dung chuyển khoản</span><b class="mono topup-content-code">${demoBank.content}</b></div></div>
            <div class="topup-note"><span>i</span><p>Vui lòng chuyển <b id="topupAmountPreview">${formatCurrency(initialAmount)}</b> đúng nội dung để hệ thống đối soát.</p></div>
          </div>
        </div>
      </div>
    `,
    footerHTML: `<button class="btn btn-secondary" data-act="cancel">${t('cancel')}</button><button class="btn btn-primary" data-act="confirm">Tôi đã chuyển khoản</button>`,
    onMount: (backdrop) => {
      const amountInput = backdrop.querySelector('#topupAmount');
      const qr = backdrop.querySelector('#topupQr');
      const preview = backdrop.querySelector('#topupAmountPreview');
      const refresh = () => { const amount = Math.max(10000, Number(amountInput.value || initialAmount)); amountInput.value = amount; preview.textContent = formatCurrency(amount); qr.src = qrUrl(amount); };
      amountInput.addEventListener('input', refresh);
      backdrop.querySelector('[data-act="cancel"]').addEventListener('click', closeModal);
      backdrop.querySelector('[data-act="confirm"]').addEventListener('click', () => { closeModal(); showToast({ type: 'success', title: 'Đã ghi nhận yêu cầu', message: 'Giao diện demo đã sẵn sàng để kết nối API đối soát.' }); });
    }
  });
}

function openAppleIdModal(){
  openModal({
    title: t('get_apple_id'),
    bodyHTML: `
      <p>Tài khoản Apple ID dùng thử để tải ứng dụng khu vực khác:</p>
      <div class="field"><label>Email</label><div class="input mono">trial.apple.us@perralvpn.net</div></div>
      <div class="field mb-0"><label>Mật khẩu</label><div class="input mono">Trial@2026</div></div>
    `,
    footerHTML: `<button class="btn btn-primary" data-act="ok">${t('close')}</button>`,
    onMount: (backdrop) => backdrop.querySelector('[data-act="ok"]').addEventListener('click', closeModal)
  });
}

/* ---------------------------------------------------------
   2) KNOWLEDGE BASE
   --------------------------------------------------------- */
PAGES['#/knowledge'] = async (root) => {
  root.innerHTML = `
    <div class="page-container page-enter">
      ${pageHeader('knowledge_title', 'knowledge_desc')}
      <div class="field" style="max-width:420px;">
        <input class="input" type="search" id="kbSearch" placeholder="${t('search_placeholder')}" aria-label="${t('search_placeholder')}">
      </div>
      <div id="kbResults" class="grid grid-3">${skeletonCards(3)}</div>
    </div>
  `;

  const paint = async (query) => {
    const results = qs('#kbResults', root);
    results.innerHTML = skeletonCards(3);
    const list = await MockAPI.getKnowledge(query);
    if (!list.length){
      results.className = '';
      results.innerHTML = emptyState({ title: t('no_data_title'), desc: t('no_data_desc'), iconName: 'search' });
      return;
    }
    results.className = 'grid grid-3';
    results.innerHTML = list.map(a => `
      <button class="card" style="text-align:left;cursor:pointer;border:1px solid var(--border-color);" data-id="${a.id}">
        <div class="card-title" style="margin-bottom:8px;">${escapeHTML(STATE.lang === 'vi' ? a.title : a.titleEn)}</div>
        <div class="text-sm text-secondary">${t('updated_at')}: ${formatDate(a.date, STATE.lang)}</div>
      </button>
    `).join('');
    qsa('[data-id]', results).forEach(card => card.addEventListener('click', () => {
      const article = list.find(a => String(a.id) === card.dataset.id);
      if (article && String(article.id) === '4') {
        window.open(APPLE_ID_TRIAL_URL, '_blank', 'noopener,noreferrer');
        return;
      }
      openModal({
        title: STATE.lang === 'vi' ? article.title : article.titleEn,
        bodyHTML: `<p class="mb-0">${escapeHTML(article.content)}</p>`,
        footerHTML: `<button class="btn btn-primary" data-act="ok">${t('close')}</button>`,
        onMount: (backdrop) => backdrop.querySelector('[data-act="ok"]').addEventListener('click', closeModal)
      });
    }));
  };

  paint('');
  qs('#kbSearch', root).addEventListener('input', debounce((e) => paint(e.target.value), 350));
};

/* ---------------------------------------------------------
   3) APPLICATIONS
   --------------------------------------------------------- */
PAGES['#/application'] = async (root) => {
  root.innerHTML = `
    <div class="page-container page-enter">
      ${pageHeader('application_title', 'application_desc')}
      <div class="tabs" id="osTabs" role="tablist"></div>
      <div id="appList" class="grid grid-3">${skeletonCards(3)}</div>
    </div>
  `;

  const apps = await MockAPI.getApps();
  const platforms = Object.keys(apps);
  let active = platforms[0];

  const tabsEl = qs('#osTabs', root);
  tabsEl.innerHTML = platforms.map(p => `<button class="tab-btn ${p === active ? 'active' : ''}" role="tab" data-p="${p}">${p}</button>`).join('');

  const paintList = () => {
    const listEl = qs('#appList', root);
    const items = apps[active];
    listEl.innerHTML = items.map((app, i) => `
      <div class="app-card card">
        <div class="app-card__top"><div class="app-card__icon">${escapeHTML(app.icon || '◈')}</div><span class="badge ${app.free ? 'badge-success' : 'badge-warning'}">${app.free ? t('free') : t('paid')}</span></div>
        <div class="app-card__name">${escapeHTML(app.name)}</div>
        <div class="text-sm text-secondary" style="margin-bottom:16px;">${t('version')}: <span class="mono">${escapeHTML(app.version)}</span></div>
        <a class="btn btn-primary btn-block app-download" href="${escapeHTML(app.url || '#')}" target="_blank" rel="noopener noreferrer" data-dl="${active}-${i}">${icon('download')} ${t('download')}</a>
      </div>
    `).join('');
    qsa('[data-dl]', listEl).forEach(link => link.addEventListener('click', () => {
      showToast({ type: 'info', title: t('download'), message: active });
    }));
  };

  tabsEl.addEventListener('click', (e) => {
    const b = e.target.closest('.tab-btn');
    if (!b) return;
    active = b.dataset.p;
    qsa('.tab-btn', tabsEl).forEach(x => x.classList.toggle('active', x === b));
    paintList();
  });

  paintList();
};
