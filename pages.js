/* =========================================================
   PerralVPN — Page renderers
   Each render fn receives the <main id="pageContent"> container,
   shows a skeleton immediately, then fetches mock data and paints.
   ========================================================= */

  const PAGES = {};
  const APPLE_ID_TRIAL_URL = 'https://idshadow.hoantienviet.com/';
const PROMO_BANNER_IMAGES = ['assets/promo-anime-01.jpg', 'assets/promo-anime-02.jpg', 'assets/promo-anime-03.jpg'];
const ZALO_GROUP_URL = 'https://zalo.me/g/8kps1zwougt3wzqi57jq';
const TELEGRAM_GROUP_URL = 'https://t.me/+Nn5cWIk05sNiYTM1';

function setVpnResetButtonBusy(button, busy) {
  if (!button) return;
  if (busy) {
    if (!button.dataset.resetOriginalHtml) button.dataset.resetOriginalHtml = button.innerHTML;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.classList.add('is-loading');
    button.innerHTML = `${icon('refresh')} Đang reset...`;
  } else {
    button.disabled = false;
    button.removeAttribute('aria-busy');
    button.classList.remove('is-loading');
    if (button.dataset.resetOriginalHtml) button.innerHTML = button.dataset.resetOriginalHtml;
  }
}

function pageHeader(titleKey, descKey){
  return `<div class="page-header"><h1>${t(titleKey)}</h1><p>${t(descKey)}</p></div>`;
}

function platformIcon(platform){
  const logos = {
    windows: ['assets/platform/windows.png', 'Windows'],
    apple: ['assets/platform/apple.png', 'Apple'],
    android: ['assets/platform/android.png', 'Android'],
    linux: ['assets/platform/linux.png', 'Linux'],
  };
  const [src, label] = logos[platform] || [];
  return src ? `<img class="platform-icon platform-icon--${platform}" src="${src}" alt="${label}" loading="lazy" decoding="async">` : '';
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

  const [user, promosResult, menuResult, billing] = await Promise.all([
    RealAPI.getUser().catch(() => null),
    MockAPI.getPromos().catch(() => []),
    MockAPI.getQuickMenu().catch(() => []),
    RealAPI.getBilling().catch(() => null)
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
            <img class="avatar" style="width:52px;height:52px;" src="${user.avatar || EMPTY_AVATAR_DATA_URL}" alt="${escapeHTML(user.name)}" loading="lazy">
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
          <div class="plan-card__actions"><button class="btn btn-sm btn-outline" data-nav="#/knowledge">▣ ${t('guide')}</button><button class="btn btn-sm btn-outline" id="btnAppleId"> ${t('get_apple_id')}</button><button class="btn btn-sm btn-outline" id="btnResetLink">⟳ ${t('reset_link')}</button></div>
          <div class="plan-card__sync"><div class="plan-card__sync-row"><button class="btn btn-sm btn-accent" id="btnSyncApp" ${activeSubscription ? '' : 'disabled'} aria-haspopup="dialog"><span class="sync-glyph" aria-hidden="true">⟳</span> Đồng bộ máy chủ về app</button></div><div class="plan-card__platforms" aria-label="Các hệ điều hành hỗ trợ"><span title="Windows">${platformIcon('windows')}</span><span title="Apple">${platformIcon('apple')}</span><span title="Android">${platformIcon('android')}</span><span title="Linux">${platformIcon('linux')}</span></div></div>
        </div>
      </div>

      <section class="card dashboard-billing-card">
        <div class="dashboard-billing-card__head"><div><span class="dashboard-billing-card__eyebrow">PerralVPN BILLING</span><h2>Quản lý gói cước & thanh toán</h2><p>Theo dõi gói đang dùng, tạo đơn hàng và thanh toán qua QR Bank.</p></div><span class="dashboard-billing-card__icon">${icon('wallet')}</span></div>
        <div class="dashboard-billing-card__body">
          <div class="dashboard-billing-card__active"><span class="text-secondary">Gói hiện tại</span><strong>${escapeHTML(activeSubscription?.planName || 'Chưa có gói đang hoạt động')}</strong><small>${activeSubscription ? `${activeSubscription.capacity} · ${activeSubscription.speed}` : 'Chọn một gói phù hợp để bắt đầu sử dụng.'}</small></div>
          <div class="dashboard-billing-card__status"><span class="text-secondary">Trạng thái thanh toán</span><strong>${recentOrders[0] ? (recentOrders[0].status === 'paid' ? 'Đã thanh toán' : recentOrders[0].status === 'pending' ? 'Chờ đối soát' : 'Chưa có thanh toán hoàn tất') : 'Chưa có đơn hàng'}</strong><small>${recentOrders[0] ? `Đơn gần nhất: ${escapeHTML(recentOrders[0].id)}` : 'Các đơn hàng mới sẽ xuất hiện tại đây.'}</small></div>
          <div class="dashboard-billing-card__actions"><button class="btn btn-primary" data-nav="#/manage-plan">${icon('shield')} Quản lý gói cước</button><button class="btn btn-secondary" data-nav="#/order">${icon('receipt')} Xem đơn hàng</button></div>
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
  const syncTrigger = qs('#btnSyncApp', root);
  const getSyncData = async () => {
    showToast({ type: 'info', title: 'Đang đồng bộ subscription...' });
    if (typeof RealAPI.syncVpnSubscription !== 'function' || typeof RealAPI.getVpnSubscription !== 'function') {
      showToast({ type: 'error', title: 'API đồng bộ chưa được cập nhật. Vui lòng tải lại trang.' });
      return null;
    }
    const result = await RealAPI.syncVpnSubscription();
    if (!result.ok) {
      showToast({ type: 'error', title: result.error || 'Không thể đồng bộ subscription.' });
      return null;
    }
    if (result.data?.subscriptionUrl) return result.data;
    const refreshed = await RealAPI.getVpnSubscription();
    if (refreshed?.ok && refreshed.data?.subscriptionUrl) return refreshed.data;
    showToast({ type: 'error', title: refreshed?.error || 'Máy chủ chưa trả về liên kết subscription.' });
    return null;
  };
  const openSyncPicker = () => {
    const backdrop = openModal({
      title: 'Đồng bộ máy chủ về app',
      bodyHTML: `<div class="sync-picker" role="menu" aria-label="Tùy chọn đồng bộ ứng dụng">
        <button class="sync-picker__option" type="button" role="menuitem" data-sync-action="copy"><span class="sync-picker__icon">${icon('copy')}</span><span>Sao chép subscription URL</span></button>
        <button class="sync-picker__option" type="button" role="menuitem" data-sync-action="qr"><span class="sync-picker__icon">${icon('grid')}</span><span>Quét mã QR subscription</span></button>
      </div>`,
      size: '340px',
      onMount: (modalBackdrop) => {
        modalBackdrop.classList.add('sync-picker-backdrop');
        modalBackdrop.querySelector('.modal')?.classList.add('sync-picker-modal');
        qsa('[data-sync-action]', modalBackdrop).forEach((option) => option.addEventListener('click', async () => {
          const action = option.dataset.syncAction;
          closeModal();
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
            const qrUrl = syncData.qrDataUrl || buildDemoQrDataUrl(syncLink);
            openModal({
              title: 'Quét mã QR để đăng ký',
              bodyHTML: `<div class="sync-qr"><div class="topup-modal__qr-wrap"><img src="${qrUrl}" alt="Mã QR liên kết máy chủ" style="width:220px;height:220px;background:#fff;padding:10px;border-radius:12px;"></div><p class="text-secondary text-sm">Dùng camera hoặc ứng dụng VPN để quét liên kết máy chủ.</p></div>`,
              size: '420px',
            });
            return;
          }
          if (action === 'copy') return;

        }));
      },
    });
    return backdrop;
  };
  syncTrigger?.addEventListener('click', openSyncPicker);
  qs('#btnResetLink', root).addEventListener('click', () => {
    if (window.__vpnResetInFlight) return;
    openConfirm({
      title: t('reset_link'),
      message: 'UUID VLESS cũ sẽ bị vô hiệu hóa và thay bằng UUID mới. URL/QR subscription vẫn được giữ nguyên.',
      confirmLabel: 'Reset VLESS',
      danger: false,
      onConfirm: async () => {
        if (window.__vpnResetInFlight) return;
        window.__vpnResetInFlight = true;
        const resetButton = qs('#btnResetLink', root);
        setVpnResetButtonBusy(resetButton, true);
        showToast({ type: 'info', title: 'Đang reset VLESS...', message: 'Vui lòng chờ, không bấm lại nút.' });
        try {
          const result = await RealAPI.resetVpnLink();
          if (!result.ok) {
            showToast({ type: 'error', title: result.error || 'Không thể reset VLESS lúc này.' });
            return;
          }
          showToast({ type: 'success', title: result.message || 'Đã reset.' });
          await PAGES['#/dashboard'](root);
        } catch (error) {
          showToast({ type: 'error', title: 'Không thể reset VLESS lúc này.', message: error?.message || 'Vui lòng thử lại.' });
        } finally {
          window.__vpnResetInFlight = false;
          setVpnResetButtonBusy(resetButton, false);
        }
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

function openTopupModal(){
  openModal({
    title: 'Thanh toán qua SePay',
    bodyHTML: '<p class="mb-0">Vui lòng tạo đơn và thanh toán qua cổng SePay. Website không hiển thị số tài khoản hoặc QR chuyển khoản tĩnh để tránh chuyển nhầm tiền.</p>',
    footerHTML: `<button class="btn btn-primary" data-act="ok">${t('close')}</button>`,
    onMount: (backdrop) => backdrop.querySelector('[data-act="ok"]').addEventListener('click', closeModal),
  });
}

function openAppleIdModal(){
  openModal({
    title: t('get_apple_id'),
    bodyHTML: '<p class="mb-0">Tài khoản Apple ID dùng thử không được công khai trên website. Vui lòng liên hệ kênh hỗ trợ chính thức nếu cần trợ giúp cài đặt ứng dụng.</p>',
    footerHTML: `<button class="btn btn-primary" data-act="ok">${t('close')}</button>`,
    onMount: (backdrop) => backdrop.querySelector('[data-act="ok"]').addEventListener('click', closeModal),
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
        <a class="btn btn-primary btn-block app-download" href="${escapeHTML(safeExternalUrl(app.url))}" target="_blank" rel="noopener noreferrer" data-dl="${active}-${i}">${icon('download')} ${t('download')}</a>
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
