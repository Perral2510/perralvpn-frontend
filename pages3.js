/* =========================================================
   PerralVPN — Page renderers (part 3)
   ========================================================= */

/* ---------------------------------------------------------
   7) ORDERS
   --------------------------------------------------------- */
PAGES['#/order'] = async (root) => {
  root.innerHTML = `
    <div class="page-container page-enter">
      ${pageHeader('order_title', 'order_desc')}
      <div class="table-wrap"><div style="padding:16px;">${skeletonLines(4)}</div></div>
    </div>
  `;

  const orders = await RealAPI.getOrders();
  const statusMeta = {
    paid: { badge: 'badge-success', label: t('order_paid') },
    pending: { badge: 'badge-warning', label: t('order_pending') },
    cancelled: { badge: 'badge-danger', label: t('order_cancelled') },
    expired: { badge: 'badge-danger', label: 'Hết hạn' },
  };
  const getStatusMeta = (order) => order.status === 'pending' && order.paymentRef ? { badge: 'badge-info', label: 'Chờ đối soát' } : (statusMeta[order.status] || statusMeta.pending);
  const PAGE_SIZE = 3;
  let page = 1;

  const paint = () => {
    const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
    const pageItems = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const container = qs('.page-container', root);
    container.innerHTML = `
      ${pageHeader('order_title', 'order_desc')}
      ${orders.length ? `
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>
            <th class="no-sort">${t('col_order_id')}</th>
            <th class="no-sort">${t('col_cycle')}</th>
            <th class="no-sort">${t('col_amount')}</th>
            <th class="no-sort">${t('col_status')}</th>
            <th class="no-sort">${t('col_created')}</th>
            <th class="no-sort">${t('col_action')}</th>
          </tr></thead>
          <tbody>
            ${pageItems.map(o => `
              <tr>
                <td class="mono">${escapeHTML(o.id)}</td>
                <td>${escapeHTML(o.cycle)}</td>
                <td class="mono">${formatCurrency(o.amount)}</td>
                <td><span class="badge ${getStatusMeta(o).badge}">${getStatusMeta(o).label}</span></td>
                <td class="mono">${escapeHTML(o.createdAt)}</td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-sm btn-secondary" data-view="${o.id}">${t('view_detail')}</button>
                    ${o.status === 'pending' && !o.paymentRef ? `<button class="btn btn-sm btn-danger-outline" data-cancel="${o.id}">${t('cancel_order')}</button>` : ''}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="flex justify-between items-center mt-4">
        <span class="text-sm text-secondary">${t('col_order_id')} ${(page-1)*PAGE_SIZE+1}-${Math.min(page*PAGE_SIZE, orders.length)} / ${orders.length}</span>
        <div class="flex gap-2">
          <button class="btn btn-sm btn-secondary" id="prevPage" ${page === 1 ? 'disabled' : ''}>‹</button>
          <button class="btn btn-sm btn-secondary" id="nextPage" ${page === totalPages ? 'disabled' : ''}>›</button>
        </div>
      </div>
      ` : emptyState({ title: t('no_data_title'), desc: t('no_data_desc'), iconName: 'receipt' })}
    `;

    qsa('[data-view]', container).forEach(btn => btn.addEventListener('click', () => {
      const o = orders.find(x => x.id === btn.dataset.view);
      openModal({
        title: t('order_detail'),
        bodyHTML: `
          <div class="text-sm" style="display:grid;gap:10px;">
            <div class="flex justify-between"><span class="text-secondary">${t('col_order_id')}</span><span class="mono">${escapeHTML(o.id)}</span></div>
            <div class="flex justify-between"><span class="text-secondary">${t('col_cycle')}</span><span>${escapeHTML(o.cycle)}</span></div>
            <div class="flex justify-between"><span class="text-secondary">${t('col_amount')}</span><span class="mono">${formatCurrency(o.amount)}</span></div>
            <div class="flex justify-between"><span class="text-secondary">${t('col_status')}</span><span class="badge ${getStatusMeta(o).badge}">${getStatusMeta(o).label}</span></div>
            <div class="flex justify-between"><span class="text-secondary">${t('col_created')}</span><span class="mono">${escapeHTML(o.createdAt)}</span></div>
          </div>
        `,
        footerHTML: `<button class="btn btn-primary" data-act="ok">${t('close')}</button>`,
        onMount: (backdrop) => backdrop.querySelector('[data-act="ok"]').addEventListener('click', closeModal)
      });
    }));

    qsa('[data-cancel]', container).forEach(btn => btn.addEventListener('click', () => {
      const id = btn.dataset.cancel;
      openConfirm({
        title: t('cancel_confirm_title'),
        message: t('cancel_confirm_desc'),
        confirmLabel: t('cancel_order'),
        onConfirm: async () => {
          const result = await RealAPI.cancelOrder(id);
          if (!result.ok) {
            showToast({ type: 'error', title: result.error || t('error_title') });
            return;
          }
          const o = orders.find(x => x.id === id);
          if (o) o.status = 'cancelled';
          showToast({ type: 'success', title: t('toast_order_cancelled') });
          paint();
        }
      });
    }));

    const prevBtn = qs('#prevPage', container), nextBtn = qs('#nextPage', container);
    if (prevBtn) prevBtn.addEventListener('click', () => { page--; paint(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { page++; paint(); });
  };

  paint();
};

/* ---------------------------------------------------------
   8) INVITE / AFFILIATE
   --------------------------------------------------------- */
PAGES['#/invite'] = async (root) => {
  root.innerHTML = `
    <div class="page-container page-enter">
      ${pageHeader('invite_title', 'invite_desc')}
      ${skeletonCards(4)}
    </div>
  `;

  const data = await MockAPI.getInvite();

  const paint = () => {
    const container = qs('.page-container', root);
    container.innerHTML = `
      ${pageHeader('invite_title', 'invite_desc')}

      <div class="card" style="margin-bottom:24px;background:linear-gradient(120deg,var(--brand-600),var(--accent-600));color:#fff;border:none;">
        <div class="flex justify-between items-center" style="flex-wrap:wrap;gap:16px;">
          <div>
            <div style="opacity:.85;font-size:13px;">${t('commission_balance')}</div>
            <div style="font-family:var(--font-display);font-size:28px;font-weight:700;">${formatCurrency(data.commissionBalance)}</div>
          </div>
          <div class="flex gap-2">
            <button class="btn" style="background:rgba(255,255,255,.18);color:#fff;" id="btnTransfer">${t('transfer')}</button>
            <button class="btn" style="background:#fff;color:var(--brand-600);" id="btnWithdraw">${t('withdraw')}</button>
          </div>
        </div>
      </div>

      <div class="grid grid-4" style="margin-bottom:24px;">
        <div class="card"><div class="text-secondary text-sm">${t('stat_registers')}</div><div style="font-size:22px;font-weight:700;font-family:var(--font-display);">${data.registers}</div></div>
        <div class="card"><div class="text-secondary text-sm">${t('stat_rate')}</div><div style="font-size:22px;font-weight:700;font-family:var(--font-display);">${data.rate}</div></div>
        <div class="card"><div class="text-secondary text-sm">${t('stat_pending')}</div><div style="font-size:22px;font-weight:700;font-family:var(--font-display);">${formatCurrency(data.pendingCommission)}</div></div>
        <div class="card"><div class="text-secondary text-sm">${t('stat_total')}</div><div style="font-size:22px;font-weight:700;font-family:var(--font-display);">${formatCurrency(data.totalCommission)}</div></div>
      </div>

      <div class="card" style="margin-bottom:24px;">
        <div class="card-title">${t('util_subweb_title')}</div>
        <p class="text-sm">${t('util_subweb_desc')}</p>
        ${data.subdomainNS.map(ns => `
          <div class="input-group" style="margin-bottom:10px;">
            <div class="input mono" style="flex:1;">${escapeHTML(ns)}</div>
            <button class="btn btn-secondary" data-copy2="${escapeHTML(ns)}">${icon('copy')} ${t('copy')}</button>
          </div>
        `).join('')}
      </div>

      <div class="card">
        <div class="card-title">${t('referral_codes')}<button class="btn btn-sm btn-primary" id="btnCreateCode">${t('create_code')}</button></div>
        ${data.codes.length ? `
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th class="no-sort">${t('col_code')}</th><th class="no-sort">${t('col_uses')}</th><th class="no-sort">${t('col_created_at')}</th></tr></thead>
              <tbody>${data.codes.map(c => `<tr><td class="mono">${escapeHTML(c.code)}</td><td>${c.uses}</td><td class="mono">${escapeHTML(c.createdAt)}</td></tr>`).join('')}</tbody>
            </table>
          </div>
        ` : emptyState({ title: t('no_data_title'), desc: t('no_codes_desc'), iconName: 'users' })}
      </div>
    `;

    qsa('[data-copy2]', container).forEach(btn => btn.addEventListener('click', async () => {
      const ok = await copyToClipboard(btn.dataset.copy2);
      if (ok){
        const original = btn.innerHTML;
        btn.innerHTML = `${icon('check')} ${t('copied')}`;
        showToast({ type: 'success', title: t('toast_copied') });
        setTimeout(() => { btn.innerHTML = original; }, 1600);
      }
    }));

    qs('#btnCreateCode', container).addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true; btn.innerHTML = `<span class="spinner"></span>`;
      const res = await MockAPI.createReferralCode();
      data.codes.push(res.entry);
      showToast({ type: 'success', title: t('toast_code_created'), message: res.entry.code });
      paint();
    });

    qs('#btnWithdraw', container).addEventListener('click', () => openWithdrawModal('withdraw'));
    qs('#btnTransfer', container).addEventListener('click', () => openWithdrawModal('transfer'));
  };

  paint();
};

function openWithdrawModal(kind){
  const titleKey = kind === 'withdraw' ? 'withdraw' : 'transfer';
  const backdrop = openModal({
    title: t(titleKey),
    bodyHTML: `
      <div class="field"><label>Số tiền</label><input class="input" type="number" min="10000" step="10000" value="100000"></div>
      <div class="field mb-0"><label>Số tài khoản / Ví nhận</label><input class="input" placeholder="Nhập thông tin nhận tiền"></div>
    `,
    footerHTML: `<button class="btn btn-secondary" data-act="cancel">${t('cancel')}</button><button class="btn btn-primary" data-act="ok">${t('confirm')}</button>`,
  });
  backdrop.querySelector('[data-act="cancel"]').addEventListener('click', closeModal);
  backdrop.querySelector('[data-act="ok"]').addEventListener('click', () => {
    closeModal();
    showToast({ type: 'success', title: t('toast_saved') });
  });
}

/* ---------------------------------------------------------
   9) TRAFFIC DETAILS (with lightweight SVG bar chart)
   --------------------------------------------------------- */
PAGES['#/traffic'] = async (root) => {
  root.innerHTML = `
    <div class="page-container page-enter">
      ${pageHeader('traffic_title', 'traffic_desc')}
      <div class="card" style="margin-bottom:24px;"><div class="skeleton" style="height:220px;"></div></div>
      <div class="table-wrap"><div style="padding:16px;">${skeletonLines(5)}</div></div>
    </div>
  `;

  const traffic = await MockAPI.getTraffic();
  const maxVal = Math.max(...traffic.map(d => d.upload + d.download));
  const chartW = 640, chartH = 220, padding = 32, barGap = 14;
  const barW = (chartW - padding * 2) / traffic.length - barGap;

  const bars = traffic.map((d, i) => {
    const total = d.upload + d.download;
    const x = padding + i * (barW + barGap);
    const upH = (d.upload / maxVal) * (chartH - padding * 2);
    const downH = (d.download / maxVal) * (chartH - padding * 2);
    const yUp = chartH - padding - upH - downH;
    const yDown = chartH - padding - downH;
    return `
      <g>
        <rect x="${x}" y="${yUp}" width="${barW}" height="${upH}" fill="var(--brand-500)" rx="3"/>
        <rect x="${x}" y="${yDown}" width="${barW}" height="${downH}" fill="var(--accent-500)" rx="3"/>
        <text x="${x + barW/2}" y="${chartH - padding + 16}" text-anchor="middle" font-size="10" fill="var(--text-secondary)">${formatDate(d.date, STATE.lang).slice(0,5)}</text>
      </g>
    `;
  }).join('');

  const container = qs('.page-container', root);
  container.innerHTML = `
    ${pageHeader('traffic_title', 'traffic_desc')}
    <div class="card" style="margin-bottom:24px;">
      <div class="card-title">${t('chart_title')}
        <span class="flex items-center gap-3 text-sm text-secondary">
          <span class="flex items-center gap-2"><span style="width:10px;height:10px;border-radius:3px;background:var(--brand-500);display:inline-block;"></span>${t('col_upload')}</span>
          <span class="flex items-center gap-2"><span style="width:10px;height:10px;border-radius:3px;background:var(--accent-500);display:inline-block;"></span>${t('col_download')}</span>
        </span>
      </div>
      <svg viewBox="0 0 ${chartW} ${chartH}" style="width:100%;height:auto;" role="img" aria-label="${t('chart_title')}">${bars}</svg>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th class="no-sort">${t('col_date')}</th><th class="no-sort">${t('col_upload')}</th><th class="no-sort">${t('col_download')}</th><th class="no-sort">${t('col_total')}</th></tr></thead>
        <tbody>
          ${traffic.map(d => `<tr><td class="mono">${formatDate(d.date, STATE.lang)}</td><td class="mono">${formatGB(d.upload)}</td><td class="mono">${formatGB(d.download)}</td><td class="mono">${formatGB(+(d.upload + d.download).toFixed(1))}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
};

/* ---------------------------------------------------------
   10) CONTROL CENTER
   --------------------------------------------------------- */
PAGES['#/control'] = async (root) => {
  root.innerHTML = `
    <div class="page-container page-enter">
      ${pageHeader('nav_control', 'util_desc')}
      ${skeletonCards(3)}
    </div>
  `;
  const [user, plan] = await Promise.all([MockAPI.getUser(), MockAPI.getCurrentPlan()]);

  const container = qs('.page-container', root);
  container.innerHTML = `
    ${pageHeader('nav_control', 'util_desc')}
    <div class="grid grid-2">
      <div class="card">
        <div class="card-title">${t('account_info')}</div>
        <div class="grid grid-2 text-sm">
          <div><div class="text-secondary">${t('user_id')}</div><div class="mono">${escapeHTML(user.userId)}</div></div>
          <div><div class="text-secondary">Email</div><div>${escapeHTML(user.email)}</div></div>
          <div><div class="text-secondary">${t('join_date')}</div><div class="mono">${formatDate(user.joinDate, STATE.lang)}</div></div>
          <div><div class="text-secondary">${t('devices_online')}</div><div class="mono">${plan.devicesOnline}/${plan.deviceLimit}</div></div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">${t('change_password')}</div>
        <div class="field"><label>Mật khẩu hiện tại</label><input class="input" type="password"></div>
        <div class="field"><label>Mật khẩu mới</label><input class="input" type="password"></div>
        <button class="btn btn-primary" id="btnChangePw">${t('save')}</button>
      </div>
    </div>
  `;
  qs('#btnChangePw', container).addEventListener('click', () => {
    showToast({ type: 'success', title: t('toast_saved') });
  });
};


/* ---------------------------------------------------------
   11) ACCOUNT MANAGEMENT
   --------------------------------------------------------- */
PAGES['#/account'] = async (root) => {
  root.innerHTML = `
    <div class="page-container page-enter account-page">
      <div class="account-hero">
        <div class="account-hero__identity">
          <img class="account-hero__avatar" src="https://api.dicebear.com/7.x/initials/svg?seed=DA" alt="">
          <div><span class="account-kicker">PERRALVPN ACCOUNT</span><h1>Quản lý tài khoản</h1><p>Cập nhật hồ sơ, bảo mật và các thiết bị đang sử dụng.</p></div>
        </div>
        <span class="account-verified" id="accountVerified">${icon('check')} Đang kiểm tra</span>
      </div>
      <div class="account-layout">
        <div class="account-main-column">
          <section class="card account-section">
            <div class="account-section__head"><div><span class="account-section__eyebrow">HỒ SƠ CÁ NHÂN</span><h2>Thông tin tài khoản</h2></div><span class="account-section__icon">${icon('user')}</span></div>
            <div class="account-profile-summary"><div class="account-mini-avatar" id="accountMiniAvatar">DA</div><div><strong id="accountSummaryName">Đang tải...</strong><span id="accountSummaryEmail">Đang tải...</span></div><span class="account-id-pill mono" id="accountUserId">—</span></div>
            <form id="profileForm" class="account-form">
              <div class="grid grid-2"><div class="field"><label>Họ và tên</label><input class="input" id="profileName" value="" autocomplete="name"></div><div class="field"><label>Email</label><input class="input" id="profileEmail" value="" type="email" disabled></div></div>
              <div class="grid grid-2"><div class="field"><label>Số điện thoại</label><input class="input" id="profilePhone" value="" autocomplete="tel" placeholder="Chưa cập nhật"></div><div class="field"><label>Ngày tham gia</label><input class="input" id="profileJoinDate" value="" disabled></div></div>
              <div class="account-form__footer"><span class="text-secondary">Email đăng nhập không thể thay đổi trong bản demo.</span><button class="btn btn-primary" type="submit">${icon('check')} Lưu thay đổi</button></div>
            </form>
          </section>
          <section class="card account-section" id="security">
            <div class="account-section__head"><div><span class="account-section__eyebrow">BẢO MẬT</span><h2>Đổi mật khẩu</h2></div><span class="account-section__icon">${icon('lock')}</span></div>
            <form id="passwordForm" class="account-form"><div class="field"><label>Mật khẩu hiện tại</label><input class="input" id="currentPassword" type="password" autocomplete="current-password" placeholder="Nhập mật khẩu hiện tại"></div><div class="grid grid-2"><div class="field"><label>Mật khẩu mới</label><input class="input" id="newPassword" type="password" autocomplete="new-password" placeholder="Tối thiểu 8 ký tự"></div><div class="field"><label>Nhập lại mật khẩu mới</label><input class="input" id="confirmPassword" type="password" autocomplete="new-password" placeholder="Nhập lại mật khẩu mới"></div></div><div class="account-form__footer"><span class="text-secondary">Nên dùng mật khẩu riêng, khó đoán và không trùng dịch vụ khác.</span><button class="btn btn-primary" type="submit">${icon('lock')} Cập nhật mật khẩu</button></div></form>
          </section>
        </div>
        <aside class="account-side-column">
          <section class="card account-section account-session-card"><div class="account-section__head"><div><span class="account-section__eyebrow">HOẠT ĐỘNG GẦN ĐÂY</span><h2>Thiết bị đăng nhập</h2></div><span class="account-section__icon">${icon('monitor')}</span></div><div id="sessionList"><div class="account-session"><span class="account-session__device">${icon('monitor')}</span><div><strong>Đang tải phiên...</strong><span>Đang lấy dữ liệu từ máy chủ</span></div></div></div><button class="btn btn-outline btn-block" id="btnLogoutAll">Đăng xuất khỏi thiết bị khác</button></section>
          <section class="card account-section account-preference-card"><div class="account-section__head"><div><span class="account-section__eyebrow">TÙY CHỌN</span><h2>Thông báo</h2></div><span class="account-section__icon">${icon('bell')}</span></div><label class="account-toggle"><span><strong>Email dịch vụ</strong><small>Nhận thông báo về gói và tài khoản</small></span><input type="checkbox" checked><i></i></label><label class="account-toggle"><span><strong>Cảnh báo dung lượng</strong><small>Nhắc khi sắp hết lưu lượng</small></span><input type="checkbox" checked><i></i></label></section>
          <section class="account-help-card"><span>${icon('shield')}</span><div><strong>Cần hỗ trợ?</strong><p>Liên hệ đội ngũ PerralVPN nếu bạn phát hiện hoạt động bất thường.</p></div></section>
        </aside>
      </div>
    </div>
  `;
  const user = await RealAPI.getUser();
  if (!user) {
    showToast({ type: 'error', title: 'Phiên đăng nhập đã hết hạn' });
    location.hash = '#/login';
    return;
  }
  const sessions = await RealAPI.getSessions();
  const initials = String(user.name || 'DA').split(/\s+/).filter(Boolean).map(part => part[0]).slice(-2).join('').toUpperCase() || 'DA';
  const avatar = qs('.account-hero__avatar', root); if (avatar) { avatar.src = user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`; avatar.alt = user.name; }
  const topAvatar = document.querySelector('.avatar-btn .avatar'); if (topAvatar) { topAvatar.src = user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`; topAvatar.alt = user.name; }
  const topAvatarName = qs('#avatarName'); if (topAvatarName) topAvatarName.textContent = user.name;
  qs('#accountMiniAvatar', root).textContent = initials;
  qs('#profileName', root).value = user.name || '';
  qs('#profileEmail', root).value = user.email || '';
  qs('#profilePhone', root).value = user.phone || '';
  qs('#profileJoinDate', root).value = user.joinDate ? formatDate(user.joinDate, STATE.lang) : 'Chưa cập nhật';
  qs('#accountSummaryName', root).textContent = user.name || '—';
  qs('#accountSummaryEmail', root).textContent = user.email || '—';
  qs('#accountUserId', root).textContent = user.userId || '—';
  qs('#accountVerified', root).innerHTML = `${icon(user.verified ? 'check' : 'info')} ${user.verified ? 'Tài khoản đã xác thực' : 'Chưa xác minh email'}`;
  const sessionList = qs('#sessionList', root);
  if (sessionList) {
    sessionList.innerHTML = sessions.length ? sessions.map(session => {
      const mobile = /android|iphone|ipad|mobile/i.test(String(session.user_agent || ''));
      const current = Number(session.current) === 1 || session.current === true;
      const deviceName = mobile ? 'Thiết bị di động' : 'Máy tính · Trình duyệt';
      const locationText = session.ip_address ? `IP ${escapeHTML(session.ip_address)}` : 'IP không xác định';
      const timeText = session.created_at ? formatDate(session.created_at, STATE.lang) : 'Thời gian không xác định';
      return `<div class="account-session"><span class="account-session__device">${icon(mobile ? 'smartphone' : 'monitor')}</span><div><strong>${deviceName}${current ? ' · Phiên hiện tại' : ''}</strong><span>${locationText} · ${timeText}</span></div>${current ? '<i class="account-session__online"></i>' : ''}</div>`;
    }).join('') : '<div class="account-session"><div><strong>Chưa có phiên hoạt động</strong><span>Hãy đăng nhập lại để tạo phiên mới.</span></div></div>';
  }
  qs('#profileForm', root).addEventListener('submit', async (e) => { e.preventDefault(); const name = qs('#profileName', root).value.trim(); const phone = qs('#profilePhone', root).value.trim(); if (!name) { showToast({ type: 'error', title: 'Vui lòng nhập họ và tên' }); return; } const btn = e.currentTarget.querySelector('button[type="submit"]'); btn.disabled = true; const result = await RealAPI.updateProfile(name, phone); btn.disabled = false; if (!result.ok) { showToast({ type: 'error', title: result.error || 'Cập nhật thất bại' }); return; } qs('#accountSummaryName', root).textContent = name; qs('#avatarName').textContent = name; showToast({ type: 'success', title: 'Đã lưu thông tin tài khoản' }); });
  qs('#passwordForm', root).addEventListener('submit', async (e) => { e.preventDefault(); const current = qs('#currentPassword', root).value; const next = qs('#newPassword', root).value; const confirm = qs('#confirmPassword', root).value; if (!current || next.length < 8 || next !== confirm) { showToast({ type: 'error', title: 'Mật khẩu mới phải có ít nhất 8 ký tự và trùng khớp' }); return; } const btn = e.currentTarget.querySelector('button[type="submit"]'); btn.disabled = true; const result = await RealAPI.changePassword(current, next); btn.disabled = false; if (!result.ok) { showToast({ type: 'error', title: result.error || 'Cập nhật mật khẩu thất bại' }); return; } e.currentTarget.reset(); showToast({ type: 'success', title: 'Đã cập nhật mật khẩu' }); });
  qs('#btnLogoutAll', root).addEventListener('click', () => openConfirm({ title: 'Đăng xuất thiết bị khác', message: 'Bạn có chắc muốn kết thúc tất cả phiên đăng nhập khác?', confirmLabel: 'Đăng xuất', onConfirm: async () => { const result = await RealAPI.revokeOtherSessions(); showToast({ type: result.ok ? 'success' : 'error', title: result.ok ? 'Đã đăng xuất thiết bị khác' : (result.error || 'Không thể đăng xuất') }); } }));
};
