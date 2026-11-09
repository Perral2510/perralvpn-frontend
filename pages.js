/* =========================================================
   PerralVPN — Page renderers
   Each render fn receives the <main id="pageContent"> container,
   shows a skeleton immediately, then fetches mock data and paints.
   ========================================================= */

  const PAGES = {};
  const APPLE_ID_TRIAL_URL = 'https://idshadow.hoantienviet.com/';
const ZALO_GROUP_URL = 'https://zalo.me/g/itfs9rhv3lkcdmenhafc';
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

function pageHeader(titleKey, descKey, meta = ''){
  return `<div class="page-header">
    <div class="page-header__main">
      <h1>${t(titleKey)}</h1>
      ${descKey ? `<p>${t(descKey)}</p>` : ''}
    </div>
    ${meta ? `<span class="page-header__meta mono">${escapeHTML(meta)}</span>` : ''}
  </div>`;
}

/* ---------------------------------------------------------
   Service severity — the bulletin's whole reading frame.
   Every number on the dashboard is measured against one of
   these five thresholds, and the tier decides what the board
   says and which action it offers.
   --------------------------------------------------------- */
const STATION_STATE_KEYS = {
  online: 'status_online',
  error: 'status_error',
  maint: 'status_maint',
};

function serviceSeverity({ hasPlan, expired, usedPercent, daysLeft }){
  if (!hasPlan) return 5;
  if (expired) return 5;
  if (usedPercent >= 92 || daysLeft <= 1) return 4;
  if (usedPercent >= 75 || daysLeft <= 3) return 3;
  if (usedPercent >= 50 || daysLeft <= 7) return 2;
  return 1;
}

function severityTierOfPercent(percent){
  if (percent >= 92) return 4;
  if (percent >= 75) return 3;
  if (percent >= 50) return 2;
  return 1;
}

/* A contour is drawn from the measured ratio alone: radius grows
   with consumption and the line roughens as it approaches the
   threshold. No sampled history, no invented series. */
const ISOBAR_VIEW = { w: 1140, h: 230, cx: 570, cy: 115, squash: .26, minRadius: 36, maxRadius: 470 };

function isobarRadius(ratio){
  return ISOBAR_VIEW.minRadius + Math.max(0, Math.min(1, ratio)) * (ISOBAR_VIEW.maxRadius - ISOBAR_VIEW.minRadius);
}

function isobarPath({ ratio, seed }){
  const { cx, cy, squash } = ISOBAR_VIEW;
  const clamped = Math.max(0, Math.min(1, ratio));
  const radius = isobarRadius(ratio);
  const roughness = 0.015 + clamped * 0.035;
  const steps = 56;
  const points = [];
  for (let i = 0; i < steps; i += 1){
    const angle = (i / steps) * Math.PI * 2;
    const wobble = Math.sin(angle * 3 + seed) * 0.62 + Math.sin(angle * 5 - seed * 1.7) * 0.38;
    const r = radius * (1 + roughness * wobble);
    points.push(`${(cx + Math.cos(angle) * r).toFixed(1)} ${(cy + Math.sin(angle) * r * squash).toFixed(1)}`);
  }
  return `M${points.join('L')}Z`;
}

function buildIsobarField(rings){
  const { w, h, cx, cy, squash } = ISOBAR_VIEW;
  const paths = rings.map((ring, index) => `
    <path class="isobar${ring.tier >= 4 ? ' isobar--high' : ''}" pathLength="1" data-draw style="--draw-i:${index};--ring-color:${ring.color}" d="${isobarPath({ ...ring, seed: index + 1 })}"></path>`).join('');
  const marks = rings.map((ring, index) => {
    const spread = (index - (rings.length - 1) / 2) * 0.78;
    const angle = -Math.PI / 2 + spread;
    const radius = isobarRadius(ring.ratio) + 10;
    return `<text class="isobar-field__mark" x="${(cx + Math.cos(angle) * radius).toFixed(0)}" y="${(cy + Math.sin(angle) * radius * squash).toFixed(0)}">${escapeHTML(ring.shortLabel)}</text>`;
  }).join('');
  const reading = rings.map(ring => `${ring.shortLabel}`).join(' · ');
  const limit = `<ellipse class="isobar-limit" cx="${cx}" cy="${cy}" rx="${ISOBAR_VIEW.maxRadius}" ry="${(ISOBAR_VIEW.maxRadius * squash).toFixed(1)}"></ellipse>`;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${escapeHTML(`${t('isobar_title')}: ${reading}`)}">
    ${limit}
    <g class="isobar-field__center"><line x1="${cx - 10}" y1="${cy}" x2="${cx + 10}" y2="${cy}"/><line x1="${cx}" y1="${cy - 10}" x2="${cx}" y2="${cy + 10}"/></g>
    ${paths}
    ${marks}
  </svg>`;
}

/* ---------------------------------------------------------
   1) DASHBOARD
   --------------------------------------------------------- */
PAGES['#/dashboard'] = async (root) => {
  root.innerHTML = `
    <div class="page-container page-enter">
      <div class="skeleton" style="height:64px;border-radius:4px;margin-bottom:14px;"></div>
      <div class="skeleton" style="height:104px;border-radius:4px;margin-bottom:18px;"></div>
      <div class="grid grid-2">
        <div class="skeleton skel-card"></div>
        <div class="skeleton skel-card"></div>
      </div>
    </div>`;

  const [user, promosResult, menuResult, billing, vpnManagementResult, nodesResult] = await Promise.all([
    RealAPI.getUser().catch(() => null),
    MockAPI.getPromos().catch(() => []),
    MockAPI.getQuickMenu().catch(() => []),
    RealAPI.getBilling().catch(() => null),
    RealAPI.getVpnManagement().catch(() => ({ ok: false })),
    MockAPI.getNodes().catch(() => []),
  ]);
  const promos = Array.isArray(promosResult) ? promosResult : [];
  const menu = Array.isArray(menuResult) ? menuResult : [];
  const nodes = Array.isArray(nodesResult) ? nodesResult : [];
  if (!user) {
    showToast({ type: 'error', title: 'Phiên đăng nhập đã hết hạn' });
    location.hash = '#/login';
    return;
  }
  updateHeaderIdentity(user);

  let slideIdx = 0;

  const accountBalance = Number.isFinite(Number(user.balance)) ? Number(user.balance) : 0;
  const vpnManagement = vpnManagementResult?.ok ? vpnManagementResult.data : null;
  const activeSubscription = billing?.activeSubscription || (vpnManagement?.plan ? {
    planName: vpnManagement.plan.name,
    capacity: vpnManagement.plan.capacity,
    devices: vpnManagement.plan.deviceLimit,
    lifetime: vpnManagement.plan.lifetime,
    speed: vpnManagement.plan.speed || '—',
    expiresAt: vpnManagement.expiresAt,
    features: vpnManagement.plan.features || [],
  } : null);
  const dataUsedBytes = Number(vpnManagement?.dataUsedBytes || 0);
  const dataMaxBytes = Number(vpnManagement?.dataMaxBytes || 0);
  const machinesMax = Number(vpnManagement?.machinesMax ?? activeSubscription?.devices ?? 0);
  // Backend không phải lúc nào cũng báo số thiết bị đang trực tuyến; thà bỏ
  // vòng đo còn hơn vẽ một con số 0 giả.
  const machinesOnline = Number.isFinite(Number(vpnManagement?.machinesOnline)) ? Number(vpnManagement.machinesOnline) : null;
  const compactNumber = (value) => String(Number(value.toFixed(2)));
  const formatData = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
    if (bytes < 1024 ** 2) return `${compactNumber(bytes / 1024)} KB`;
    if (bytes < 1024 ** 3) return `${compactNumber(bytes / (1024 ** 2))} MB`;
    return `${compactNumber(bytes / (1024 ** 3))} GB`;
  };
  const dataLabel = dataMaxBytes > 0 ? `${formatData(dataUsedBytes)} / ${formatData(dataMaxBytes)}` : `${formatData(dataUsedBytes)} / ${t('unlimited')}`;
  const dataPercent = dataMaxBytes > 0 ? Math.min(100, Math.max(0, Math.round((dataUsedBytes / dataMaxBytes) * 100))) : 0;
  const deviceLimitLabel = machinesMax > 0 ? String(machinesMax) : t('unlimited');
  const planFeatures = Array.isArray(activeSubscription?.features) ? activeSubscription.features : [];

  // Thời hạn còn lại đo bằng giờ để bản tin không làm tròn mất ngày cuối.
  const lifetime = Boolean(activeSubscription?.lifetime);
  const expiresAt = activeSubscription?.expiresAt ? new Date(activeSubscription.expiresAt) : null;
  const msLeft = expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt.getTime() - Date.now() : 0;
  const expired = Boolean(expiresAt) && msLeft <= 0 && !lifetime;
  const daysLeft = lifetime ? Number.POSITIVE_INFINITY : Math.max(0, Math.floor(msLeft / 86400000));
  const hoursLeft = lifetime ? Number.POSITIVE_INFINITY : Math.max(0, Math.floor(msLeft / 3600000));
  const termRatio = lifetime ? 0 : Math.min(1, Math.max(0, (30 - daysLeft) / 30));
  const deviceRatio = machinesMax > 0 && machinesOnline !== null ? Math.min(1, machinesOnline / machinesMax) : null;
  const severity = serviceSeverity({ hasPlan: Boolean(activeSubscription), expired, usedPercent: dataPercent, daysLeft });

  const dataLeftBytes = Math.max(0, dataMaxBytes - dataUsedBytes);
  const bulletinFacts = [];
  if (!activeSubscription) bulletinFacts.push(t('bulletin_fact_no_plan'));
  else if (expired) bulletinFacts.push(`${activeSubscription.planName || t('nav_plan')} · ${t('bulletin_fact_expired')} ${formatDate(activeSubscription.expiresAt, STATE.lang)}.`);
  else {
    if (dataMaxBytes > 0 && dataPercent >= 75) bulletinFacts.push(`${t('bulletin_fact_quota')} ${dataPercent}% · ${t('bulletin_fact_remaining')} ${formatData(dataLeftBytes)}.`);
    if (!lifetime && daysLeft <= 7) bulletinFacts.push(`${t('bulletin_fact_term')} ${daysLeft} ${t('bulletin_days_unit')}.`);
    if (!bulletinFacts.length) bulletinFacts.push(`${dataMaxBytes > 0 ? `${t('bulletin_fact_remaining')} ${formatData(dataLeftBytes)}` : t('bulletin_fact_unlimited')}${lifetime ? ` · ${t('bulletin_fact_lifetime')}` : ` · ${t('bulletin_fact_term')} ${daysLeft} ${t('bulletin_days_unit')}`}.`);
  }

  const observedAt = new Date().toLocaleTimeString(STATE.lang === 'vi' ? 'vi-VN' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
  const promoSlides = promos.length ? promos : [{
    title: 'Một đường truyền riêng, tốc độ thật.',
    titleEn: 'A private line. Real speed.',
    desc: 'Quản lý gói VPN, thiết bị và dung lượng của bạn trong một bảng điều khiển gọn gàng.',
    descEn: 'Manage your VPN plan, devices and traffic from one quiet dashboard.',
  }];
  const promoText = (p) => STATE.lang === 'vi' ? p.title : (p.titleEn || p.title);
  const promoDesc = (p) => STATE.lang === 'vi' ? p.desc : (p.descEn || p.desc);
  const isobarRings = [
    { id: 'quota', color: 'var(--signal)', labelKey: 'isobar_legend_quota', legendValue: `${dataPercent}%`, ratio: dataPercent / 100, tier: severityTierOfPercent(dataPercent), shortLabel: `${dataPercent}%` },
    ...(deviceRatio === null ? [] : [{ id: 'devices', color: 'var(--steel)', labelKey: 'isobar_legend_devices', legendValue: `${machinesOnline}/${machinesMax}`, ratio: deviceRatio, tier: deviceRatio >= 0.8 ? 3 : 1, shortLabel: `${machinesOnline}/${machinesMax}` }]),
    ...(lifetime ? [] : [{ id: 'term', color: 'var(--t3)', labelKey: 'isobar_legend_term', legendValue: `${daysLeft} ${t('bulletin_days_unit')}`, ratio: termRatio, tier: severityTierOfPercent(termRatio * 100), shortLabel: `${daysLeft}${t('bulletin_days_short')}` }]),
  ];

  root.innerHTML = `
    <div class="page-container page-enter">
      <div class="page-header">
        <div class="page-header__main">
          <h1>${t('welcome_back')}</h1>
          <p>${escapeHTML(user.name)}</p>
        </div>
        <span class="page-header__meta mono">${t('topup')} · ${formatCurrency(accountBalance)}</span>
      </div>

      <section class="tier-band" data-tier="${severity}" data-wipe aria-label="${t('bulletin_eyebrow')}">
        <div class="tier-band__body">
          <div class="tier-band__line">
            <span class="tier-band__flag"><i></i>${escapeHTML(t(`tier_${severity}`))}</span>
            <span class="tier-band__level">${escapeHTML(activeSubscription?.planName || t('tier_5'))}</span>
          </div>
          <p class="tier-band__text">${escapeHTML(bulletinFacts.join(' '))}</p>
          <div class="tier-band__scale" aria-hidden="true">
            ${[1, 2, 3, 4, 5].map(step => `<span class="tier-band__tick ${step <= severity ? 'is-reached' : ''}"></span>`).join('')}
          </div>
        </div>
        <div class="tier-band__action">
          <button class="btn btn-primary" data-nav="#/plan">${activeSubscription ? t('nav_plan') : t('buy_now')} ${icon('arrowUpRight')}</button>
        </div>
      </section>

      <section class="bulletin-strip" aria-label="${t('bulletin_eyebrow')}">
        <div class="bulletin-strip__cell" data-rise>
          <span class="bulletin-strip__label">${t('bulletin_quota_used')}</span>
          <span class="bulletin-strip__value">${escapeHTML(formatData(dataUsedBytes))}<em>${escapeHTML(dataMaxBytes > 0 ? `/ ${formatData(dataMaxBytes)}` : t('unlimited'))}</em></span>
          <div class="threshold-meter" data-tier="${severityTierOfPercent(dataPercent)}" style="--meter:${dataPercent}%"><span class="threshold-meter__fill"></span><span class="threshold-meter__mark"></span></div>
          <span class="bulletin-strip__sub">${dataPercent}% ${t('bulletin_of_plan')}</span>
        </div>
        <div class="bulletin-strip__cell" data-rise>
          <span class="bulletin-strip__label">${t('bulletin_quota_left')}</span>
          <span class="bulletin-strip__value">${escapeHTML(dataMaxBytes > 0 ? formatData(dataLeftBytes) : t('unlimited'))}<em>${escapeHTML(activeSubscription?.capacity ? `/ ${activeSubscription.capacity}` : '')}</em></span>
          <div class="threshold-meter" data-tier="1" style="--meter:${dataMaxBytes > 0 ? Math.max(0, 100 - dataPercent) : 100}%"><span class="threshold-meter__fill"></span><span class="threshold-meter__mark"></span></div>
          <span class="bulletin-strip__sub">${escapeHTML(deviceLimitLabel)} ${t('device_limit').toLowerCase()}${machinesOnline === null ? '' : ` · ${machinesOnline} ${t('devices_online').toLowerCase()}`}</span>
        </div>
        <div class="bulletin-strip__cell" data-rise>
          <span class="bulletin-strip__label">${t('bulletin_term_left')}</span>
          <span class="bulletin-strip__value">${lifetime ? '∞' : (hoursLeft < 24 ? `<span data-count="${hoursLeft}" data-count-format="value">0</span><em>${t('bulletin_hours_unit')}</em>` : `<span data-count="${daysLeft}" data-count-format="value">0</span><em>${t('bulletin_days_unit')}</em>`)}</span>
          <div class="threshold-meter" data-tier="${lifetime ? 1 : severityTierOfPercent(termRatio * 100)}" style="--meter:${lifetime ? 100 : Math.max(0, Math.min(100, (daysLeft / 30) * 100))}%"><span class="threshold-meter__fill"></span><span class="threshold-meter__mark"></span></div>
          <span class="bulletin-strip__sub">${lifetime ? t('lifetime_term') : escapeHTML(activeSubscription?.expiresAt ? formatDate(activeSubscription.expiresAt, STATE.lang) : '—')}</span>
        </div>
      </section>

      <div class="grid grid-2">
        <div class="card plan-card plan-card--pro ${activeSubscription ? '' : 'plan-card--empty'}">
          <div class="plan-card__pro-head">
            <div class="plan-card__pro-mark">PR</div>
            <div class="plan-card__pro-title"><span>${activeSubscription ? t('current_plan') : t('nav_plan')}</span><h3>${escapeHTML(activeSubscription?.planName || t('no_data_title'))}</h3></div>
            <span class="plan-card__pro-status"><i></i> ${activeSubscription && !expired ? t('tier_1') : t('expired')}</span>
          </div>
          ${activeSubscription ? `<div class="plan-card__pro-subhead"><span>${t('expires_in')} <b>${activeSubscription.lifetime ? t('lifetime_term') : formatDate(activeSubscription.expiresAt, STATE.lang)}</b></span><span><b>${escapeHTML(deviceLimitLabel)}</b> ${t('device_limit').toLowerCase()}</span></div><div class="plan-card__pro-metrics"><div class="plan-metric"><span>${t('data_used')}</span><strong>${escapeHTML(dataLabel)}</strong><small>${dataPercent}%</small></div><div class="plan-metric"><span>${t('capacity')}</span><strong>${escapeHTML(activeSubscription.capacity)}</strong><small>${t('current_plan')}</small></div><div class="plan-metric"><span>${t('speed')}</span><strong>${escapeHTML(activeSubscription.speed)}</strong><small>${t('bandwidth_note')}</small></div></div><div class="plan-card__usage-grid plan-card__usage-grid--single"><div class="plan-usage"><div class="plan-usage__head"><span>${t('data_used')}</span><b>${dataPercent}%</b></div><div class="progress"><div class="progress__bar" style="width:${dataPercent}%"></div></div><small>${escapeHTML(dataLabel)}</small></div></div>${planFeatures.length ? `<div class="plan-card__features"><strong>${t('plan_features')}</strong><ul>${planFeatures.map(feature => `<li>${escapeHTML(feature)}</li>`).join('')}</ul></div>` : ''}` : `<div class="plan-empty-state"><strong>${t('tier_5')}</strong><span>${t('plan_desc')}</span><button class="btn btn-sm btn-accent" data-nav="#/plan">${t('nav_plan')}</button></div>`}
          <div class="plan-card__actions"><button class="btn btn-sm btn-outline" data-nav="#/knowledge">${icon('book')} ${t('guide')}</button><button class="btn btn-sm btn-outline" id="btnAppleId">${icon('key')} ${t('get_apple_id')}</button><button class="btn btn-sm btn-outline" id="btnResetLink">${icon('refresh')} ${t('reset_link')}</button></div>
          <div class="plan-card__sync"><button class="btn btn-sm btn-accent" id="btnSyncApp" ${activeSubscription ? '' : 'disabled'} aria-haspopup="dialog">${icon('refresh')} ${t('sync_app_label')}</button></div>
        </div>

        <div class="bulletin-side">
          <div class="card id-card">
            <div class="id-card__top">
              <img class="avatar id-card__avatar" src="${user.avatar || initialsAvatarUrl(user.name)}" alt="${escapeHTML(user.name)}">
              <div class="id-card__who">
                <strong>${escapeHTML(user.name)} ${user.verified ? `<span class="badge badge-signal">${icon('check')} ${t('verified')}</span>` : ''}</strong>
                <span>${escapeHTML(user.email)}</span>
              </div>
            </div>
            <div class="id-card__meta">
              <div><span>${t('join_date')}</span><strong>${formatDate(user.joinDate, STATE.lang)}</strong></div>
              <div><span>${t('user_id')}</span><strong>${escapeHTML(user.userId)}</strong></div>
              <div><span>${machinesOnline === null ? t('device_limit') : t('devices_online')}</span><strong>${escapeHTML(machinesOnline === null || machinesMax <= 0 ? deviceLimitLabel : `${machinesOnline}/${machinesMax}`)}</strong></div>
            </div>
            <div class="id-card__actions">
              <button class="btn btn-primary" id="btnTopup">${icon('wallet')} ${t('topup')} · ${formatCurrency(accountBalance)}</button>
              <button class="btn btn-secondary" id="btnZalo">Zalo</button>
              <button class="btn btn-secondary" id="btnTelegram">Telegram</button>
            </div>
          </div>

          <section class="card notation-key" data-rise aria-label="${t('notation_key_title')}">
            <div class="notation-key__head">
              <span class="station-board__eyebrow">${t('notation_key_title')}</span>
              <span class="notation-key__lead">${t('notation_key_lead')}</span>
            </div>
            <ul class="notation-key__ramp">
              ${[1, 2, 3, 4, 5].map(step => `<li class="notation-key__step" data-tier="${step}"><i></i><span>${escapeHTML(t(`tier_${step}`))}</span><b class="mono">${escapeHTML(t(`tier_threshold_${step}`))}</b></li>`).join('')}
            </ul>
            <p class="notation-key__note">${t('notation_key_note')}</p>
          </section>
        </div>
      </div>

      ${nodes.length ? `
      <section class="station-board" aria-label="${t('station_board_title')}">
        <div class="station-board__head">
          <div><span class="station-board__eyebrow">${t('station_board_title')}</span><div class="text-sm text-secondary">${t('station_board_desc')}</div></div>
          <span class="station-board__eyebrow mono">${t('isobar_observed_at')} ${escapeHTML(observedAt)}</span>
        </div>
        ${nodes.slice(0, 6).map((node, index) => `
          <div class="station-row" data-state="${escapeHTML(node.status)}" data-rise>
            <span class="station-row__code">${String(index + 1).padStart(2, '0')}</span>
            <span class="station-row__name">${escapeHTML(node.name)}<small>${escapeHTML(node.location)}</small></span>
            <span class="station-row__load"><span class="load-meter"><span class="load-meter__track"><span class="load-meter__fill ${node.load >= 85 ? 'is-critical' : node.load >= 65 ? 'is-busy' : ''}" style="width:${Math.min(100, Math.max(0, Number(node.load) || 0))}%"></span></span></span><b>${Number(node.load) || 0}%</b></span>
            <span class="station-row__latency">${escapeHTML(String(node.latency))}ms</span>
            <span class="station-row__state"><i></i>${escapeHTML(t(STATION_STATE_KEYS[node.status] || 'status_online'))}</span>
          </div>`).join('')}
      </section>` : ''}

      <section class="isobar-field" aria-label="${t('isobar_title')}">
        <div class="isobar-field__head">
          <div><span class="station-board__eyebrow">${t('isobar_title')}</span><div class="text-sm text-secondary">${t('isobar_desc')}</div></div>
        </div>
        <div class="isobar-field__canvas" data-parallax>
          <div data-parallax-layer>${buildIsobarField(isobarRings)}</div>
        </div>
        <div class="isobar-field__legend">
          ${isobarRings.map(ring => `<span style="color:${ring.color}"><i></i>${t(ring.labelKey)} <b class="isobar-field__value">${escapeHTML(ring.legendValue)}</b></span>`).join('')}
        </div>
      </section>

      <section class="hero ${promoSlides.length === 1 ? 'hero--single' : ''}" id="promoCarousel" role="region" aria-roledescription="carousel" aria-label="${t('app_name')}">
        <div class="hero__track" id="carouselTrack">
          ${promoSlides.map((p, promoIndex) => `
            <article class="hero__slide" role="group" aria-roledescription="slide" aria-label="${promoIndex + 1} / ${promoSlides.length}">
              <span class="hero__index mono">0${promoIndex + 1} — 0${promoSlides.length}</span>
              <div class="hero__copy">
                <h2 class="hero__title">${escapeHTML(promoText(p))}</h2>
                <p class="hero__desc">${escapeHTML(promoDesc(p))}</p>
                <div class="hero__actions">
                  <a class="btn btn-primary" href="#/plan">${t('buy_now')} ${icon('arrowUpRight')}</a>
                  <a class="hero__link" href="#/knowledge">${t('nav_knowledge')} ${icon('chevronRight')}</a>
                </div>
              </div>
              <div class="hero__graphic" aria-hidden="true">
                <span class="hero__hatch"></span>
              </div>
            </article>`).join('')}
        </div>
        <div class="hero__controls">
          <div class="carousel__dots" role="tablist" aria-label="${t('nav_dashboard')}">
            ${promoSlides.map((_, i) => `<button type="button" class="carousel__dot ${i === 0 ? 'active' : ''}" data-idx="${i}" role="tab" aria-selected="${i === 0}" aria-label="Slide ${i + 1}"></button>`).join('')}
          </div>
          <div class="hero__nav">
            <button type="button" class="carousel__nav prev" aria-label="Previous slide">${icon('chevronLeft')}</button>
            <button type="button" class="carousel__nav next" aria-label="Next slide">${icon('chevronRight')}</button>
          </div>
        </div>
      </section>

      <div class="card quick-card">
        <div class="card-title">${t('quick_menu')}</div>
        <div class="quick-grid">
          ${menu.map(m => `
            <a href="${routeFor(m.labelKey)}" class="quick-tile">
              <span class="quick-tile__icon">${icon(m.icon)}</span>
              <span class="quick-tile__label">${t(m.labelKey)}</span>
              <span class="quick-tile__arrow">${icon('arrowUpRight')}</span>
            </a>`).join('')}
        </div>
      </div>
    </div>
  `;

  const carousel = qs('#promoCarousel', root);
  const track = qs('#carouselTrack', root);
  const dots = qsa('.carousel__dot', root);
  let autoTimer = null;
  const stopAuto = () => { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } };
  const setSlide = (i) => {
    if (!carousel.isConnected) { stopAuto(); return; }
    slideIdx = (i + promoSlides.length) % promoSlides.length;
    track.style.transform = `translateX(-${slideIdx * 100}%)`;
    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === slideIdx);
      d.setAttribute('aria-selected', String(idx === slideIdx));
    });
  };
  qs('.carousel__nav.prev', root)?.addEventListener('click', () => setSlide(slideIdx - 1));
  qs('.carousel__nav.next', root)?.addEventListener('click', () => setSlide(slideIdx + 1));
  dots.forEach(d => d.addEventListener('click', () => setSlide(Number(d.dataset.idx))));
  if (promoSlides.length > 1) {
    const startAuto = () => { stopAuto(); autoTimer = setInterval(() => setSlide(slideIdx + 1), 6000); };
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);
    carousel.addEventListener('focusin', stopAuto);
    carousel.addEventListener('focusout', startAuto);
    startAuto();
  }

  qsa('[data-nav]', root).forEach(b => b.addEventListener('click', () => { location.hash = b.dataset.nav; }));
  qs('#btnTopup', root).addEventListener('click', () => openTopupModal(accountBalance));
  qs('#btnZalo', root).addEventListener('click', () => window.open(ZALO_GROUP_URL, '_blank', 'noopener,noreferrer'));
  qs('#btnTelegram', root).addEventListener('click', () => window.open(TELEGRAM_GROUP_URL, '_blank', 'noopener,noreferrer'));
  qs('#btnAppleId', root).addEventListener('click', () => window.open(APPLE_ID_TRIAL_URL, '_blank', 'noopener,noreferrer'));
  const syncTrigger = qs('#btnSyncApp', root);
  // POST /account/vpn/sync re-provisions the client on 3x-ui, so it is tried
  // first. It also fails whenever 3x-ui is unreachable, and gating the copy on
  // it left users with a working stored link unable to copy anything: the
  // read-only GET is now the fallback, flagged as not freshly synced.
  let syncPromise = null;
  const resolveSync = () => {
    if (syncPromise) return syncPromise;
    syncPromise = (async () => {
      if (typeof RealAPI.syncVpnSubscription !== 'function' || typeof RealAPI.getVpnSubscription !== 'function') {
        return { error: t('sync_outdated') };
      }
      const dismissProgress = showToast({ type: 'info', title: t('sync_progress'), duration: 0 });
      try {
        const synced = await RealAPI.syncVpnSubscription();
        if (synced?.ok && synced.data?.subscriptionUrl) return { data: synced.data };
        const stored = await RealAPI.getVpnSubscription();
        if (stored?.ok && stored.data?.subscriptionUrl) return { data: stored.data, stale: true };
        return {};
      } finally {
        dismissProgress();
      }
    })().finally(() => { syncPromise = null; });
    return syncPromise;
  };
  const openSyncPicker = () => {
    openModal({
      title: t('sync_app_label'),
      bodyHTML: `<div class="sync-picker" role="menu" aria-label="${escapeHTML(t('sync_app_label'))}">
        <button class="sync-picker__option" type="button" role="menuitem" data-sync-action="copy"><span class="sync-picker__icon">${icon('copy')}</span><span>${escapeHTML(t('sync_picker_copy'))}</span></button>
        <button class="sync-picker__option" type="button" role="menuitem" data-sync-action="qr"><span class="sync-picker__icon">${icon('grid')}</span><span>${escapeHTML(t('sync_picker_qr'))}</span></button>
      </div>`,
      size: '340px',
      onMount: (modalBackdrop) => {
        qsa('[data-sync-action]', modalBackdrop).forEach((option) => option.addEventListener('click', async () => {
          const action = option.dataset.syncAction;
          closeModal();
          if (!activeSubscription) {
            showToast({ type: 'warning', title: t('sync_no_plan_title'), message: t('sync_no_plan_desc') });
            return;
          }
          const sync = await resolveSync();
          if (!sync.data) {
            showToast({ type: 'error', title: t('sync_fail_title'), message: sync.error || t('sync_fail_desc') });
            return;
          }
          if (action === 'copy') {
            const ok = await copyToClipboard(sync.data.subscriptionUrl);
            if (!ok) {
              showToast({ type: 'error', title: t('copy_fail_title'), message: t('copy_fail_desc') });
              return;
            }
            showToast(sync.stale
              ? { type: 'warning', title: t('sync_stale_title'), message: t('sync_stale_desc') }
              : { type: 'success', title: t('copy_ok_title') });
            return;
          }
          if (!sync.data.qrDataUrl) {
            showToast({ type: 'error', title: t('sync_qr_missing_title'), message: t('sync_qr_missing_desc') });
            return;
          }
          openModal({
            title: t('sync_qr_title'),
            bodyHTML: `<div class="sync-qr"><div class="topup-modal__qr-wrap"><img src="${sync.data.qrDataUrl}" alt="${escapeHTML(t('sync_qr_alt'))}" style="width:220px;height:220px;background:#fff;padding:10px;border-radius:12px;"></div><p class="text-secondary text-sm">${escapeHTML(t('sync_qr_hint'))}</p>${sync.stale ? `<p class="text-secondary text-sm">${escapeHTML(t('sync_stale_desc'))}</p>` : ''}</div>`,
            size: '420px',
          });
        }));
      },
    });
  };
  syncTrigger?.addEventListener('click', openSyncPicker);
  qs('#btnResetLink', root).addEventListener('click', () => {
    if (window.__vpnResetInFlight) return;
    openConfirm({
      title: t('reset_link'),
      message: 'Liên kết và mã QR sẽ được reset. Vui lòng chờ, không bấm lại nút.',
      confirmLabel: 'Reset URL & QR',
      danger: false,
      onConfirm: async () => {
        if (window.__vpnResetInFlight) return;
        window.__vpnResetInFlight = true;
        const resetButton = qs('#btnResetLink', root);
        setVpnResetButtonBusy(resetButton, true);
        showToast({ type: 'info', title: 'Đang reset URL & QR...', message: 'Vui lòng chờ, không bấm lại nút.' });
        try {
          const result = await RealAPI.resetVpnLink();
          if (!result.ok) {
            showToast({ type: 'error', title: result.error || 'Không thể reset URL & QR lúc này.' });
            return;
          }
          showToast({ type: 'success', title: result.message || 'Đã reset.' });
          await PAGES['#/dashboard'](root);
        } catch (error) {
          showToast({ type: 'error', title: 'Không thể reset URL & QR lúc này.', message: error?.message || 'Vui lòng thử lại.' });
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
      ${pageHeader('knowledge_title', 'knowledge_desc', 'FIELD MANUAL')}
      <div class="kb-search">
        ${icon('search')}
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
      <button class="kb-card" data-id="${a.id}">
        <div class="kb-card__title">${escapeHTML(STATE.lang === 'vi' ? a.title : a.titleEn)}</div>
        <span class="kb-card__meta">${icon('calendar')} ${t('updated_at')} · ${formatDate(a.date, STATE.lang)}</span>
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
      ${pageHeader('application_title', 'application_desc', 'CLIENT BUILDS')}
      <div class="tabs" id="osTabs" role="tablist"></div>
      <div id="appList" class="grid grid-3">${skeletonCards(3)}</div>
    </div>
  `;

  const apps = await MockAPI.getApps();
  const platforms = Object.keys(apps);
  let active = platforms[0];

  const tabsEl = qs('#osTabs', root);
  tabsEl.innerHTML = platforms.map(p => `<button class="tab-btn ${p === active ? 'active' : ''}" role="tab" aria-selected="${p === active}" data-p="${p}">${p}</button>`).join('');

  const paintList = () => {
    const listEl = qs('#appList', root);
    const items = apps[active];
    listEl.innerHTML = items.map((app, i) => `
      <article class="app-card card">
        <div class="app-card__top"><div class="app-card__icon">${escapeHTML(app.icon || 'P')}</div><span class="badge ${app.free ? 'badge-success' : 'badge-warning'}">${app.free ? t('free') : t('paid')}</span></div>
        <div class="app-card__name">${escapeHTML(app.name)}</div>
        <div class="text-sm text-secondary">${t('version')} <span class="mono">${escapeHTML(app.version)}</span></div>
        <a class="btn btn-primary btn-block app-download" href="${escapeHTML(safeExternalUrl(app.url))}" target="_blank" rel="noopener noreferrer" data-dl="${active}-${i}">${icon('download')} ${t('download')}</a>
      </article>
    `).join('');
    qsa('[data-dl]', listEl).forEach(link => link.addEventListener('click', () => {
      showToast({ type: 'info', title: t('download'), message: active });
    }));
  };

  tabsEl.addEventListener('click', (e) => {
    const b = e.target.closest('.tab-btn');
    if (!b) return;
    active = b.dataset.p;
    qsa('.tab-btn', tabsEl).forEach(x => {
      const on = x === b;
      x.classList.toggle('active', on);
      x.setAttribute('aria-selected', String(on));
    });
    paintList();
  });

  paintList();
};
