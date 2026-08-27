/* =========================================================
   PerralVPN — Page renderers (part 2)
   ========================================================= */

/* ---------------------------------------------------------
   4) PLANS
   --------------------------------------------------------- */
const FRONTEND_VINA_TIERS = [
  { key: 'basic', name: 'VINA KHÔNG NỀN BASIC', nameEn: 'VINA KHÔNG NỀN BASIC', price: 20000, capacity: '1000GB', speed: '100Mbps', devices: 2, base: '0 nền', simSupport: 'Vina', gameSupport: 'Có', category: 'vn', popular: false, frontendOnly: false },
  { key: 'mxh', name: 'VINA KHÔNG NỀN MXH', nameEn: 'VINA KHÔNG NỀN MXH', price: 15000, capacity: '1000GB', speed: '100Mbps', devices: 2, base: '0 nền', simSupport: 'Vina', gameSupport: 'Không', category: 'vn', popular: false, frontendOnly: true },
  { key: 'pro', name: 'VINA KHÔNG NỀN PRO', nameEn: 'VINA KHÔNG NỀN PRO', price: 35000, capacity: '3000GB', speed: '300Mbps', devices: 5, base: '0 nền', simSupport: 'Vina', gameSupport: 'Có', category: 'vn', popular: false, frontendOnly: true },
  { key: 'max', name: 'VINA KHÔNG NỀN MAX', nameEn: 'VINA KHÔNG NỀN MAX', price: 65000, capacity: '6000GB', speed: '700Mbps', devices: 8, base: '0 nền', simSupport: 'Vina', gameSupport: 'Có', category: 'vn', popular: true, frontendOnly: true },
  { key: 'vv', name: 'VINA KHÔNG NỀN VV', nameEn: 'VINA KHÔNG NỀN VV', price: 79000, capacity: '2000GB', speed: '1Gbps', devices: 2, base: '0 nền', simSupport: 'Vina', gameSupport: 'Có', category: 'vn', popular: false, lifetime: true, frontendOnly: true },
];

function buildFrontendPlanCatalog(apiPlans = []){
  const source = apiPlans.find(plan => /vina-khong-nen(?: basic)?/i.test(`${plan?.slug || ''} ${plan?.name || ''}`)) || apiPlans[0] || {};
  const backendVina = new Map(apiPlans.filter(plan => /vina-khong-nen/i.test(`${plan?.slug || ''} ${plan?.name || ''}`)).map(plan => [String(plan.slug || '').toLowerCase(), plan]));
  const basic = { ...FRONTEND_VINA_TIERS[0], ...source, price: FRONTEND_VINA_TIERS[0].price, id: source.id ?? 'vina-basic' };
  const newTiers = FRONTEND_VINA_TIERS.slice(1).map(tier => {
    const slug = `vina-khong-nen-${tier.key}`;
    return { ...tier, ...(backendVina.get(slug) || {}), id: backendVina.get(slug)?.id ?? `vina-${tier.key}` };
  });
  const vinaIds = new Set([source.id, ...newTiers.map(plan => plan.id)].map(String));
  const otherPlans = apiPlans.filter(plan => !vinaIds.has(String(plan.id)) && !/vina-khong-nen/i.test(`${plan?.slug || ''} ${plan?.name || ''}`));
  return [basic, ...newTiers, ...otherPlans];
}

function frontendPlanCapacity(plan){
  if (plan?.capacity === '100GB' && /vina/i.test(plan?.name || '')) return '1000GB';
  return plan?.capacity || 'Không giới hạn';
}

PAGES['#/plan'] = async (root) => {
  root.innerHTML = `
    <div class="page-container page-enter">
      ${pageHeader('plan_title', 'plan_desc')}
      <div id="planGrid" class="grid grid-4">${skeletonCards(4)}</div>
    </div>
  `;

  const apiPlans = await RealAPI.getPlans();
  const plans = buildFrontendPlanCatalog(apiPlans);
  if (!plans.length) {
    qs('#planGrid', root).innerHTML = emptyState({ title: t('no_data_title'), desc: 'Chưa có gói cước đang mở bán.', iconName: 'shield' });
    return;
  }
  let cat = 'all';

  const paint = () => {
    const grid = qs('#planGrid', root);
    const list = cat === 'all' ? plans : plans.filter(p => p.category === cat);
    grid.innerHTML = list.map(p => `
      <div class="card" style="display:flex;flex-direction:column;${p.popular ? 'border-color:var(--brand-400);box-shadow:0 0 0 3px rgba(47,111,237,.12);' : ''}">
        ${p.popular ? `<span class="badge badge-info" style="align-self:flex-start;margin-bottom:10px;">${t('popular')}</span>` : ''}
        <div style="font-family:var(--font-display);font-weight:600;font-size:16px;margin-bottom:4px;">${escapeHTML(STATE.lang === 'en' ? (p.nameEn || p.name) : p.name)}</div>
        <div style="margin-bottom:14px;"><span style="font-size:24px;font-weight:700;color:var(--brand-500);font-family:var(--font-display);">${formatCurrency(p.price)}</span> <span class="text-secondary text-sm">${p.lifetime ? t('lifetime_term') : t('per_month')}</span></div>
        <ul class="plan-spec-list" aria-label="Thông tin gói dịch vụ">
          <li><span class="plan-spec-list__icon">${icon('globe')}</span><span>Nền: <strong>${escapeHTML(p.base || (/không nền/i.test(p.name || '') ? '0 nền' : '0 nền'))}</strong></span></li>
          <li><span class="plan-spec-list__icon">${icon('database')}</span><span>Dung lượng: <strong>${escapeHTML(frontendPlanCapacity(p))}</strong></span></li>
          <li><span class="plan-spec-list__icon">${icon('smartphone')}</span><span>Thiết bị: <strong>${escapeHTML(String(p.devices ?? 0))}</strong></span></li>
          <li><span class="plan-spec-list__icon">${icon('sim')}</span><span>Hỗ trợ SIM: <strong>${escapeHTML(p.simSupport || (/vina/i.test(`${p.name || ''} ${p.category || ''}`) ? 'Vina' : 'Tất cả'))}</strong></span></li>
          <li><span class="plan-spec-list__icon">${icon('gamepad')}</span><span>Hỗ trợ game: <strong>${escapeHTML(p.gameSupport || 'Có')}</strong></span></li>
        </ul>
        <button class="btn btn-primary btn-block" data-buy="${p.id}">${t('buy_now')}</button>
      </div>
    `).join('');
    if (!list.length) grid.innerHTML = emptyState({ title: t('no_data_title'), desc: t('no_data_desc') });

    qsa('[data-buy]', grid).forEach(btn => btn.addEventListener('click', () => {
      const plan = plans.find(p => String(p.id) === btn.dataset.buy);
      if (!plan) return;
      CHECKOUT_STATE.plan = plan;
      CHECKOUT_STATE.cycle = '1';
      location.hash = '#/checkout';
    }));
  };


  paint();
};

function openPurchaseModal(plan){
  const backdrop = openModal({
    title: t('buy_now'),
    bodyHTML: `
      <p>${escapeHTML(plan.name)} — <strong>${formatCurrency(plan.price)}</strong></p>
      <div class="field">
        <label>Phương thức thanh toán</label>
        <select class="input" id="payMethod">
          <option>Ví PerralVPN</option>
          <option>Chuyển khoản ngân hàng</option>
          <option>Thẻ cào điện thoại</option>
        </select>
      </div>
    `,
    footerHTML: `<button class="btn btn-secondary" data-act="cancel">${t('cancel')}</button><button class="btn btn-primary" data-act="pay">${t('confirm')}</button>`,
  });
  backdrop.querySelector('[data-act="cancel"]').addEventListener('click', closeModal);
  backdrop.querySelector('[data-act="pay"]').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> ${t('loading')}`;
    const res = await MockAPI.purchasePlan(plan.id);
    closeModal();
    if (res.ok) showToast({ type: 'success', title: t('toast_saved'), message: res.orderId });
  });
}

/* ---------------------------------------------------------
   5) NODE STATUS
   --------------------------------------------------------- */
PAGES['#/node'] = async (root) => {
  root.innerHTML = `
    <div class="page-container page-enter">
      ${pageHeader('node_title', 'node_desc')}
      <div class="table-wrap"><div style="padding:16px;">${skeletonLines(5)}</div></div>
    </div>
  `;

  let nodes;
  try{
    nodes = await MockAPI.getNodes();
  }catch{
    qs('.page-container', root).insertAdjacentHTML('beforeend', errorState({ onRetryAttr: 'data-retry-node' }));
    qs('[data-retry-node]', root).addEventListener('click', () => PAGES['#/node'](root));
    return;
  }

  let sortKey = null, sortDir = 1;
  const statusMeta = {
    online: { cls: 'online', badge: 'badge-success', label: t('status_online') },
    error: { cls: 'error', badge: 'badge-danger', label: t('status_error') },
    maint: { cls: 'maint', badge: 'badge-warning', label: t('status_maint') },
  };

  const cols = [
    { key: 'name', label: t('col_node') },
    { key: 'location', label: t('col_location') },
    { key: 'status', label: t('col_status'), tooltip: t('tooltip_status') },
    { key: 'load', label: t('col_load') },
    { key: 'multiplier', label: t('col_multiplier'), tooltip: t('tooltip_multiplier') },
    { key: 'latency', label: t('col_latency') },
  ];

  const paint = () => {
    let list = [...nodes];
    if (sortKey){
      list.sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        if (typeof av === 'number') return (av - bv) * sortDir;
        return String(av).localeCompare(String(bv)) * sortDir;
      });
    }
    qs('.page-container', root).innerHTML = `
      ${pageHeader('node_title', 'node_desc')}
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>
            ${cols.map(c => `<th data-key="${c.key}" ${c.tooltip ? `title="${escapeHTML(c.tooltip)}"` : ''} class="${sortKey === c.key ? 'sorted' : ''}">${c.label}${sortKey === c.key ? `<span class="sort-arrow">${sortDir === 1 ? '▲' : '▼'}</span>` : ''}</th>`).join('')}
          </tr></thead>
          <tbody>
            ${list.map(n => `
              <tr>
                <td>${escapeHTML(n.name)}</td>
                <td>${escapeHTML(n.location)}</td>
                <td><span class="badge ${statusMeta[n.status].badge}"><span class="status-dot ${statusMeta[n.status].cls}"></span>${statusMeta[n.status].label}</span></td>
                <td class="mono">${n.load}%</td>
                <td class="mono">${escapeHTML(n.multiplier)}</td>
                <td class="mono">${n.latency}ms</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    qsa('th[data-key]', root).forEach(th => th.addEventListener('click', () => {
      const key = th.dataset.key;
      sortDir = (sortKey === key) ? -sortDir : 1;
      sortKey = key;
      paint();
    }));
  };
  paint();
};

/* ---------------------------------------------------------
   6) UTILITIES
   --------------------------------------------------------- */
PAGES['#/changepro'] = async (root) => {
  root.innerHTML = `
    <div class="page-container page-enter">
      ${pageHeader('util_title', 'util_desc')}
      <div class="grid grid-2">
        <div class="card">
          <div class="card-title">${t('util_giftcode_title')}</div>
          <p class="text-sm">${t('util_giftcode_desc')}</p>
          <div class="field" id="giftField">
            <label for="giftInput">${t('util_giftcode_title')}</label>
            <input class="input" id="giftInput" placeholder="${t('util_giftcode_placeholder')}">
            <div class="error-msg">${t('required_field')}</div>
          </div>
          <button class="btn btn-primary" id="btnRedeem">${t('util_redeem')}</button>
        </div>

        <div class="card">
          <div class="card-title">${t('util_avatar_title')}</div>
          <p class="text-sm">${t('util_avatar_desc')}</p>
          <div class="flex items-center gap-3" style="margin-bottom:14px;">
            <img id="avatarPreview" class="avatar" style="width:56px;height:56px;" src="https://api.dicebear.com/7.x/initials/svg?seed=DA" alt="Avatar preview">
            <div class="field mb-0" style="flex:1;" id="avatarField">
              <input class="input" id="avatarInput" placeholder="${t('util_avatar_placeholder')}">
              <div class="error-msg">URL không hợp lệ</div>
            </div>
          </div>
          <button class="btn btn-primary" id="btnSaveAvatar">${t('save')}</button>
        </div>

      </div>
    </div>
  `;

  // Giftcode redeem with validation
  qs('#btnRedeem', root).addEventListener('click', async (e) => {
    const field = qs('#giftField', root);
    const input = qs('#giftInput', root);
    if (!input.value.trim()){ field.classList.add('has-error'); return; }
    field.classList.remove('has-error');
    const btn = e.currentTarget;
    btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> ${t('loading')}`;
    const res = await MockAPI.redeemGiftcode(input.value);
    btn.disabled = false; btn.innerHTML = t('util_redeem');
    if (res.ok){
      showToast({ type: 'success', title: t('toast_giftcode_ok') });
      input.value = '';
    } else {
      field.classList.add('has-error');
      field.querySelector('.error-msg').textContent = t('toast_giftcode_fail');
      showToast({ type: 'error', title: t('toast_giftcode_fail') });
    }
  });

  // Avatar preview + save
  const avatarInput = qs('#avatarInput', root);
  avatarInput.addEventListener('input', debounce(() => {
    const field = qs('#avatarField', root);
    if (avatarInput.value && !isValidHttpUrl(avatarInput.value)){
      field.classList.add('has-error');
      return;
    }
    field.classList.remove('has-error');
    if (avatarInput.value) qs('#avatarPreview', root).src = avatarInput.value;
  }, 400));

  qs('#btnSaveAvatar', root).addEventListener('click', async (e) => {
    const field = qs('#avatarField', root);
    if (!avatarInput.value.trim() || !isValidHttpUrl(avatarInput.value)){
      field.classList.add('has-error');
      return;
    }
    field.classList.remove('has-error');
    const btn = e.currentTarget;
    btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> ${t('loading')}`;
    await MockAPI.saveAvatar(avatarInput.value);
    btn.disabled = false; btn.innerHTML = t('save');
    showToast({ type: 'success', title: t('toast_avatar_ok') });
  });

  // Copy NS records
  qsa('[data-copy]', root).forEach(btn => btn.addEventListener('click', async () => {
    const ok = await copyToClipboard(btn.dataset.copy);
    if (ok){
      const original = btn.innerHTML;
      btn.innerHTML = `${icon('check')} ${t('copied')}`;
      showToast({ type: 'success', title: t('toast_copied') });
      setTimeout(() => { btn.innerHTML = original; }, 1600);
    }
  }));
};
