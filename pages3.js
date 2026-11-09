/* =========================================================
   PerralVPN — Page renderers (part 3)
   ========================================================= */

/* ---------------------------------------------------------
   6) ORDERS
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
      ${pageHeader('order_title', 'order_desc', `${orders.length} ORDERS`)}
      ${orders.length ? `
      <div class="table-wrap" tabindex="0" role="region" aria-label="${t('order_title')} — bảng đơn hàng">
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
                <td><span class="order-id">${escapeHTML(o.id)}</span></td>
                <td>${escapeHTML(o.cycle)}</td>
                <td><span class="order-amount">${formatCurrency(o.amount)}</span></td>
                <td><span class="badge ${getStatusMeta(o).badge}">${getStatusMeta(o).label}</span></td>
                <td><span class="order-date">${escapeHTML(o.createdAt)}</span></td>
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
      <div class="table-foot">
        <span class="table-foot__range">${(page-1)*PAGE_SIZE+1} — ${Math.min(page*PAGE_SIZE, orders.length)} / ${orders.length}</span>
        <div class="pager">
          <button class="btn btn-sm btn-secondary" id="prevPage" aria-label="Trang trước" ${page === 1 ? 'disabled' : ''}>${icon('chevronLeft')}</button>
          <button class="btn btn-sm btn-secondary" id="nextPage" aria-label="Trang sau" ${page === totalPages ? 'disabled' : ''}>${icon('chevronRight')}</button>
        </div>
      </div>
      ` : emptyState({ title: t('no_data_title'), desc: t('no_data_desc'), iconName: 'receipt' })}
    `;

    qsa('[data-view]', container).forEach(btn => btn.addEventListener('click', () => {
      const o = orders.find(x => x.id === btn.dataset.view);
      openModal({
        title: t('order_detail'),
        bodyHTML: `
          <dl class="meta-list">
            <div><dt>${t('col_order_id')}</dt><dd class="mono">${escapeHTML(o.id)}</dd></div>
            <div><dt>${t('col_cycle')}</dt><dd>${escapeHTML(o.cycle)}</dd></div>
            <div><dt>${t('col_amount')}</dt><dd class="mono">${formatCurrency(o.amount)}</dd></div>
            <div><dt>${t('col_status')}</dt><dd><span class="badge ${getStatusMeta(o).badge}">${getStatusMeta(o).label}</span></dd></div>
            <div><dt>${t('col_created')}</dt><dd class="mono">${escapeHTML(o.createdAt)}</dd></div>
          </dl>
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

async function handlePasswordChangeSubmit(event, root) {
  event.preventDefault();
  const form = event.currentTarget;
  const current = qs('#currentPassword', root)?.value || qs('#controlCurrentPassword', root)?.value || '';
  const next = qs('#newPassword', root)?.value || qs('#controlNewPassword', root)?.value || '';
  const confirm = qs('#confirmPassword', root)?.value || qs('#controlConfirmPassword', root)?.value || '';
  if (!current || next.length < 8 || next !== confirm) {
    showToast({ type: 'error', title: 'Mật khẩu mới phải có ít nhất 8 ký tự và trùng khớp' });
    return;
  }
  const button = form.querySelector('button[type="submit"]');
  if (button?.disabled) return;
  if (button) { button.disabled = true; button.dataset.originalText = button.textContent; button.textContent = 'Đang lưu...'; }
  let result;
  try {
    result = await RealAPI.changePassword(current, next);
  } finally {
    if (button) { button.disabled = false; button.textContent = button.dataset.originalText || 'Lưu'; }
  }
  if (!result?.ok) {
    showToast({ type: 'error', title: result?.error || 'Cập nhật mật khẩu thất bại' });
    return;
  }
  form.reset();
  await RealAPI.logout().catch(() => null);
  showToast({ type: 'success', title: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' });
  window.setTimeout(() => { location.hash = '#/login'; }, 650);
}

/* ---------------------------------------------------------
   7) CONTROL CENTER
   --------------------------------------------------------- */
PAGES['#/control'] = async (root) => {
  root.innerHTML = `
    <div class="page-container page-enter">
      ${pageHeader('nav_control', 'util_desc')}
      ${skeletonCards(3)}
    </div>
  `;
  const user = await RealAPI.getUser().catch(() => null);
  if (!user) { location.hash = '#/login'; return; }

  const container = qs('.page-container', root);
  container.innerHTML = `
    ${pageHeader('nav_control', 'util_desc', 'CONTROL CENTRE')}
    <div class="control-grid">
      <section class="card account-section">
        <div class="account-section__head">
          <div><span class="account-section__eyebrow">DANH TÍNH</span><h2>${t('account_info')}</h2></div>
          <span class="account-section__icon">${icon('user')}</span>
        </div>
        <div class="info-grid">
          <div><span>${t('user_id')}</span><strong class="mono">${escapeHTML(user.userId)}</strong></div>
          <div><span>Email</span><strong>${escapeHTML(user.email)}</strong></div>
          <div><span>${t('join_date')}</span><strong class="mono">${formatDate(user.joinDate, STATE.lang)}</strong></div>
        </div>
      </section>
      <section class="card account-section">
        <div class="account-section__head">
          <div><span class="account-section__eyebrow">BẢO MẬT</span><h2>${t('change_password')}</h2></div>
          <span class="account-section__icon">${icon('lock')}</span>
        </div>
        <form id="controlPasswordForm" class="account-form">
          <div class="field"><label for="controlCurrentPassword">Mật khẩu hiện tại</label><input class="input" id="controlCurrentPassword" type="password" autocomplete="current-password" placeholder="Nhập mật khẩu hiện tại" required></div>
          <div class="field"><label for="controlNewPassword">Mật khẩu mới</label><input class="input" id="controlNewPassword" type="password" autocomplete="new-password" placeholder="Tối thiểu 8 ký tự" minlength="8" required></div>
          <div class="field"><label for="controlConfirmPassword">Nhập lại mật khẩu mới</label><input class="input" id="controlConfirmPassword" type="password" autocomplete="new-password" placeholder="Nhập lại mật khẩu mới" minlength="8" required></div>
          <div class="account-form__footer">
            <span class="text-secondary">Sau khi đổi mật khẩu, mọi phiên đăng nhập sẽ kết thúc.</span>
            <button class="btn btn-primary" type="submit">${icon('check')} ${t('save')}</button>
          </div>
        </form>
      </section>
    </div>
  `;
  qs('#controlPasswordForm', container).addEventListener('submit', (event) => handlePasswordChangeSubmit(event, container));
};


/* ---------------------------------------------------------
   8) ACCOUNT MANAGEMENT
   --------------------------------------------------------- */
PAGES['#/account'] = async (root) => {
  root.innerHTML = `
    <div class="page-container page-enter account-page">
      <div class="account-hero">
        <div class="account-hero__identity">
          <img class="account-hero__avatar" src="${EMPTY_AVATAR_DATA_URL}" alt="Chưa đăng nhập">
          <div><span class="account-kicker">PERRALVPN ACCOUNT</span><h1>Quản lý tài khoản</h1><p>Cập nhật hồ sơ, bảo mật và các thiết bị đang sử dụng.</p></div>
        </div>
        <span class="account-verified" id="accountVerified">${icon('check')} Đang kiểm tra</span>
      </div>
      <div class="account-layout">
        <div class="account-main-column">
          <section class="card account-section">
            <div class="account-section__head"><div><span class="account-section__eyebrow">HỒ SƠ CÁ NHÂN</span><h2>Thông tin tài khoản</h2></div><span class="account-section__icon">${icon('user')}</span></div>
            <div class="account-profile-summary"><div class="account-mini-avatar" id="accountMiniAvatar">PR</div><div><strong id="accountSummaryName">Đang tải...</strong><span id="accountSummaryEmail">Đang tải...</span></div><span class="account-id-pill mono" id="accountUserId">—</span></div>
            <form id="profileForm" class="account-form">
              <div class="grid grid-2"><div class="field"><label for="profileName">Họ và tên</label><input class="input" id="profileName" value="" autocomplete="name"></div><div class="field"><label for="profileEmail">Email</label><input class="input" id="profileEmail" value="" type="email" disabled></div></div>
              <div class="grid grid-2"><div class="field"><label for="profilePhone">Số điện thoại</label><input class="input" id="profilePhone" value="" autocomplete="tel" placeholder="Chưa cập nhật"></div><div class="field"><label for="profileJoinDate">Ngày tham gia</label><input class="input" id="profileJoinDate" value="" disabled></div></div>
              <div class="account-form__footer"><span class="text-secondary">Email đăng nhập không thể thay đổi trong bản demo.</span><button class="btn btn-primary" type="submit">${icon('check')} Lưu thay đổi</button></div>
            </form>
          </section>
          <section class="card account-section" id="security">
            <div class="account-section__head"><div><span class="account-section__eyebrow">BẢO MẬT</span><h2>Đổi mật khẩu</h2></div><span class="account-section__icon">${icon('lock')}</span></div>
            <form id="passwordForm" class="account-form"><div class="field"><label for="currentPassword">Mật khẩu hiện tại</label><input class="input" id="currentPassword" type="password" autocomplete="current-password" placeholder="Nhập mật khẩu hiện tại"></div><div class="grid grid-2"><div class="field"><label for="newPassword">Mật khẩu mới</label><input class="input" id="newPassword" type="password" autocomplete="new-password" placeholder="Tối thiểu 8 ký tự"></div><div class="field"><label for="confirmPassword">Nhập lại mật khẩu mới</label><input class="input" id="confirmPassword" type="password" autocomplete="new-password" placeholder="Nhập lại mật khẩu mới"></div></div><div class="account-form__footer"><span class="text-secondary">Nên dùng mật khẩu riêng, khó đoán và không trùng dịch vụ khác.</span><button class="btn btn-primary" type="submit">${icon('lock')} Cập nhật mật khẩu</button></div></form>
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
  const avatar = qs('.account-hero__avatar', root); if (avatar) { avatar.src = user.avatar || EMPTY_AVATAR_DATA_URL; avatar.alt = user.name; }
  const topAvatar = document.querySelector('.avatar-btn .avatar'); if (topAvatar) { topAvatar.src = user.avatar || EMPTY_AVATAR_DATA_URL; topAvatar.alt = user.name; }
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
  qs('#passwordForm', root).addEventListener('submit', (event) => handlePasswordChangeSubmit(event, root));
  qs('#btnLogoutAll', root).addEventListener('click', () => openConfirm({ title: 'Đăng xuất thiết bị khác', message: 'Bạn có chắc muốn kết thúc tất cả phiên đăng nhập khác?', confirmLabel: 'Đăng xuất', onConfirm: async () => { const result = await RealAPI.revokeOtherSessions(); showToast({ type: result.ok ? 'success' : 'error', title: result.ok ? 'Đã đăng xuất thiết bị khác' : (result.error || 'Không thể đăng xuất') }); } }));
};
