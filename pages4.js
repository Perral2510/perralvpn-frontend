/* =========================================================
   PerralVPN — Page renderers (part 4)
   Checkout / payment page + Login / Register pages
   ========================================================= */

/* ---------------------------------------------------------
   11) CHECKOUT / PAYMENT
   --------------------------------------------------------- */
const CYCLE_OPTIONS = [
  { key: '1', months: 1, discount: 0 },
  { key: '3', months: 3, discount: 0.05 },
  { key: '6', months: 6, discount: 0.06 },
  { key: '12', months: 12, discount: 0.07 },
];

function cyclePrice(plan, cycleKey){
  const c = CYCLE_OPTIONS.find(x => x.key === cycleKey) || CYCLE_OPTIONS[0];
  const raw = plan.price * c.months;
  const discount = Math.round(raw * c.discount);
  return { raw, discount, total: raw - discount, months: c.months, discountRate: c.discount };
}

PAGES['#/checkout'] = async (root) => {
  const plan = CHECKOUT_STATE.plan;

  if (!plan){
    root.innerHTML = `
      <div class="page-container page-enter">
        ${pageHeader('checkout_title', 'checkout_desc')}
        ${emptyState({ title: t('checkout_no_plan_title'), desc: t('checkout_no_plan_desc'), iconName: 'receipt' })}
        <div style="text-align:center;"><button class="btn btn-primary" id="btnGoPlans">${t('back_to_plans')}</button></div>
      </div>
    `;
    qs('#btnGoPlans', root).addEventListener('click', () => { location.hash = '#/plan'; });
    return;
  }

  root.innerHTML = `
    <div class="page-container page-enter">
      ${pageHeader('checkout_title', 'checkout_desc')}
      <div class="checkout-grid">
        <div class="skeleton skel-card" style="height:320px;"></div>
        <div class="skeleton skel-card" style="height:320px;"></div>
      </div>
    </div>
  `;

  const user = await RealAPI.getUser();
  if (!user) { location.hash = '#/login'; return; }
  // Kỳ hạn thanh toán áp dụng cho toàn bộ gói bán theo giá tháng.
  // Không khóa về 1 tháng chỉ vì backend còn gắn cờ lifetime cho một gói cũ.
  let cycle = CHECKOUT_STATE.cycle || '1';
  const availableCycles = CYCLE_OPTIONS;
  let method = 'bank';
  let promoApplied = null;
  let promoError = '';

  const PAYMENT_METHODS = [
    { key: 'bank', icon: 'wallet', label: 'Cổng thanh toán SePay', desc: 'Thanh toán an toàn bằng QR Banking, NAPAS hoặc thẻ theo cấu hình merchant.' },
  ];

  const container = qs('.page-container', root);

  const paint = () => {
    const price = cyclePrice(plan, cycle);
    const promoDiscount = promoApplied ? Math.round(price.total * 0.1) : 0;
    const grandTotal = Math.max(0, price.total - promoDiscount);

    container.innerHTML = `
      ${pageHeader('checkout_title', 'checkout_desc')}
      <div class="checkout-grid">
        <div>
          <div class="card" style="margin-bottom:20px;">
            <div class="card-title">${t('order_summary')}</div>
            <div class="flex justify-between items-center" style="margin-bottom:18px;">
              <div>
                <div style="font-family:var(--font-display);font-weight:600;font-size:16px;">${escapeHTML(plan.name)}</div>
                <div class="text-sm text-secondary">${escapeHTML(plan.capacity)} · ${escapeHTML(plan.speed)} · ${plan.devices} ${t('device_limit').toLowerCase()}</div>
              </div>
              <div style="font-family:var(--font-display);font-weight:700;color:var(--brand-500);">${formatCurrency(plan.price)}<span class="text-secondary text-sm">${t('per_month')}</span></div>
            </div>

            <div class="field mb-0">
              <label>${t('billing_cycle')}</label>
              <div class="flex gap-2" style="flex-wrap:wrap;">
                ${availableCycles.map(c => `
                  <button type="button" class="btn btn-sm ${cycle === c.key ? 'btn-primary' : 'btn-secondary'}" data-cycle="${c.key}">${t('cycle_' + c.key)}</button>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-title">${t('payment_method')}</div>
            ${PAYMENT_METHODS.map(m => `
              <label class="pay-method ${method === m.key ? 'selected' : ''}" data-method="${m.key}">
                <input type="radio" name="payMethod" value="${m.key}" ${method === m.key ? 'checked' : ''}>
                <span class="pay-method__icon">${icon(m.icon)}</span>
                <span style="flex:1;">
                  <div style="font-weight:600;font-size:14px;">${m.label}</div>
                  <div class="text-sm text-secondary">${m.desc}</div>
                </span>
              </label>
            `).join('')}
          </div>
        </div>

        <div>
          <div class="card" style="position:sticky;top:calc(var(--header-h) + 16px);">
            <div class="card-title">${t('promo_code')}</div>
            <div class="field" id="promoField">
              <div class="input-group">
                <input class="input" id="promoInput" placeholder="${t('promo_code_placeholder')}" value="${promoApplied ? escapeHTML(promoApplied) : ''}">
                <button class="btn btn-secondary" id="btnApplyPromo">${t('apply')}</button>
              </div>
              ${promoError ? `<div class="error-msg" style="display:block;">${escapeHTML(promoError)}</div>` : ''}
            </div>

            <div class="summary-row"><span>${t('subtotal')}</span><span class="mono">${formatCurrency(price.raw)}</span></div>
            ${price.discount ? `<div class="summary-row"><span>${t('term_discount')} (${Math.round(price.discountRate * 100)}%)</span><span class="mono">-${formatCurrency(price.discount)}</span></div>` : ''}
            ${promoApplied ? `<div class="summary-row"><span>${t('discount')}</span><span class="mono">-${formatCurrency(promoDiscount)}</span></div>` : ''}
            <div class="summary-row total"><span>${t('total')}</span><span class="amount mono">${formatCurrency(grandTotal)}</span></div>

            <button class="btn btn-primary btn-block" id="btnPayNow" style="margin-top:14px;">${t('pay_now')}</button>
          </div>
        </div>
      </div>
    `;

    qsa('[data-cycle]', container).forEach(btn => btn.addEventListener('click', () => {
      cycle = btn.dataset.cycle;
      CHECKOUT_STATE.cycle = cycle;
      paint();
    }));

    qsa('[data-method]', container).forEach(label => label.addEventListener('click', () => {
      method = label.dataset.method;
      paint();
    }));

    qs('#btnApplyPromo', container).addEventListener('click', () => {
      const val = qs('#promoInput', container).value.trim();
      if (!val){ promoApplied = null; promoError = t('required_field'); paint(); return; }
      if (val.toUpperCase().startsWith('DAV')){ promoApplied = val; promoError = ''; }
      else { promoApplied = null; promoError = t('toast_giftcode_fail'); }
      paint();
    });

    qs('#btnPayNow', container).addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span> ${t('loading')}`;
      const res = await RealAPI.createOrder(plan.id, Number(cycle), method, promoApplied || '');
      if (!res.ok) {
        btn.disabled = false;
        btn.innerHTML = t('pay_now');
        showToast({ type: 'error', title: res.error || t('error_title') });
        return;
      }
      const checkout = await RealAPI.initCheckout(res.data.order.id);
      btn.disabled = false;
      btn.innerHTML = t('pay_now');
      if (!checkout.ok) {
        showToast({ type: 'error', title: checkout.error || 'Không thể mở cổng thanh toán SePay.' });
        return;
      }
      CHECKOUT_STATE.lastOrder = { ...res.data.order, plan };
      submitSepayCheckout(checkout.data);
    });
  };

  paint();
};

function submitSepayCheckout(checkout){
  if (!checkout?.checkoutUrl || !checkout?.fields) {
    showToast({ type: 'error', title: 'Dữ liệu cổng thanh toán không hợp lệ.' });
    return;
  }
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = checkout.checkoutUrl;
  form.style.display = 'none';
  Object.entries(checkout.fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value == null ? '' : String(value);
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

PAGES['#/payment-result'] = async (root) => {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const status = params.get('status') || 'error';
  const orderId = params.get('order') || '';
  const title = status === 'success' ? 'Đã nhận kết quả thanh toán' : status === 'cancel' ? 'Bạn đã hủy thanh toán' : 'Thanh toán chưa hoàn tất';
  const description = status === 'success'
    ? 'Hệ thống đang xác nhận giao dịch với SePay và kích hoạt gói VPN. Trạng thái sẽ tự cập nhật trong vài giây.'
    : status === 'cancel'
      ? 'Đơn hàng vẫn được giữ ở trạng thái chờ thanh toán. Bạn có thể mở lại đơn để thanh toán.'
      : 'SePay chưa xác nhận giao dịch thành công. Bạn có thể kiểm tra lại đơn hàng hoặc thử thanh toán lại.';
  root.innerHTML = `<div class="page-container page-enter"><div class="checkout-success" style="max-width:700px;margin:0 auto;text-align:center;"><div class="checkout-success__icon">${icon(status === 'success' ? 'wallet' : 'receipt')}</div><h2>${title}</h2><p>${description}</p><div id="paymentStatus" class="card" style="margin-top:20px;text-align:left;"><div class="text-sm text-secondary">Mã đơn hàng</div><div class="mono" style="margin-top:6px;">${escapeHTML(orderId || '—')}</div><div class="text-sm text-secondary" style="margin-top:14px;">Trạng thái</div><div id="paymentStatusText" style="margin-top:6px;">Đang tải...</div></div><div class="flex gap-2" style="justify-content:center;flex-wrap:wrap;margin-top:20px;"><button class="btn btn-secondary" id="btnResultOrders">Xem đơn hàng</button><button class="btn btn-primary" id="btnResultHome">Về trang chủ</button></div></div></div>`;
  qs('#btnResultOrders', root).addEventListener('click', () => { location.hash = '#/order'; });
  qs('#btnResultHome', root).addEventListener('click', () => { location.hash = '#/dashboard'; });
  const statusText = qs('#paymentStatusText', root);
  if (!orderId) { statusText.textContent = 'Không có mã đơn hàng để kiểm tra.'; return; }
  let attempts = 0;
  const refresh = async () => {
    const orders = await RealAPI.getOrders();
    const order = orders.find(item => item.id === orderId);
    if (!order) { statusText.textContent = 'Không tìm thấy đơn hàng.'; return true; }
    if (order.status === 'paid') {
      statusText.innerHTML = '<span class="badge badge-success">Đã thanh toán và đã duyệt</span>';
      return true;
    }
    if (order.status === 'cancelled' || order.status === 'expired') {
      statusText.textContent = order.status === 'cancelled' ? 'Đơn hàng đã hủy.' : 'Đơn hàng đã hết hạn.';
      return true;
    }
    statusText.innerHTML = '<span class="badge badge-warning">Đang chờ SePay xác nhận...</span>';
    return false;
  };
  if (await refresh()) return;
  const timer = setInterval(async () => {
    attempts += 1;
    if (await refresh() || attempts >= 15) clearInterval(timer);
  }, 2000);
}

/* ---------------------------------------------------------
   12) LOGIN
   --------------------------------------------------------- */
PAGES['#/login'] = async (root) => {
  root.innerHTML = `
    <div class="page-container page-enter">
      <div class="auth-wrap auth-wrap--scene">
        <div class="auth-scene__glow auth-scene__glow--one"></div>
        <div class="auth-scene__glow auth-scene__glow--two"></div>
        <div class="auth-promo">
          <div class="auth-promo__eyebrow">PERRALVPN · KẾT NỐI TỰ DO</div>
          <h2>Internet mượt mà,<br><span>ở mọi nơi bạn đến.</span></h2>
          <p>Bảo vệ kết nối, tăng tốc trải nghiệm và quản lý dịch vụ VPN trong một không gian trực quan.</p>
          <div class="auth-promo__stats"><span><strong>24/7</strong> Hỗ trợ</span><span><strong>99.9%</strong> Ổn định</span></div>
        </div>
        <div class="auth-card auth-card--glass">
          <div class="auth-card__brand">
            <div class="auth-card__brand-mark">PR</div>
            <strong>${t('app_name')}</strong>
            <span class="auth-live-dot">Trực tuyến</span>
          </div>
          <h1>${t('login_title')}</h1>
          <p class="auth-desc">${t('login_desc')}</p>

          <div class="field" id="loginEmailField">
            <label for="loginEmail">Email</label>
            <input class="input" id="loginEmail" type="email" placeholder="${t('email_placeholder')}">
            <div class="error-msg">${t('required_field')}</div>
          </div>
          <div class="field" id="loginPwField">
            <label for="loginPw">${t('password')}</label>
            <input class="input" id="loginPw" type="password" placeholder="${t('password_placeholder')}">
            <div class="error-msg">${t('required_field')}</div>
          </div>
          <div class="auth-row-between">
            <label class="checkbox-line"><input type="checkbox" checked> ${t('remember_me')}</label>
            <a href="#/login" class="link-btn" id="forgotLink">${t('forgot_password')}</a>
          </div>
          <button class="btn btn-primary btn-block" id="btnLogin">${t('login_btn')}</button>

          <div class="auth-footer">
            ${t('no_account')} <a href="#/register" class="link-btn" id="goRegister">${t('signup_link')}</a>
          </div>
        </div>
      </div>
    </div>
  `;

  qs('#goRegister', root).addEventListener('click', (e) => { e.preventDefault(); location.hash = '#/register'; });
  qs('#forgotLink', root).addEventListener('click', (e) => { e.preventDefault(); location.hash = '#/forgot-password'; });

  qs('#btnLogin', root).addEventListener('click', async (e) => {
    const emailField = qs('#loginEmailField', root), pwField = qs('#loginPwField', root);
    const email = qs('#loginEmail', root).value, pw = qs('#loginPw', root).value;
    let ok = true;
    if (!email.trim()){ emailField.classList.add('has-error'); ok = false; } else emailField.classList.remove('has-error');
    if (!pw){ pwField.classList.add('has-error'); ok = false; } else pwField.classList.remove('has-error');
    if (!ok) return;

    const btn = e.currentTarget;
    btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> ${t('loading')}`;
    const res = await RealAPI.login(email, pw);
    btn.disabled = false; btn.innerHTML = t('login_btn');

    if (res.ok){
      showToast({ type: 'success', title: t('toast_login_ok') });
      location.hash = '#/dashboard';
    } else {
      pwField.classList.add('has-error');
      const message = res.error || t('toast_login_fail');
      pwField.querySelector('.error-msg').textContent = message;
      showToast({ type: 'error', title: message });
    }
  });
};

/* ---------------------------------------------------------
   12B) FORGOT PASSWORD
   --------------------------------------------------------- */
PAGES['#/forgot-password'] = async (root) => {
  root.innerHTML = `
    <div class="page-container page-enter">
      <div class="auth-wrap auth-wrap--scene">
        <div class="auth-scene__glow auth-scene__glow--one"></div>
        <div class="auth-scene__glow auth-scene__glow--two"></div>
        <div class="auth-promo">
          <div class="auth-promo__eyebrow">PERRALVPN · KHÔI PHỤC TÀI KHOẢN</div>
          <h2>Lấy lại quyền truy cập,<br><span>an toàn và nhanh chóng.</span></h2>
          <p>Nhận mã xác nhận qua email để tạo mật khẩu mới cho tài khoản PerralVPN của bạn.</p>
        </div>
        <div class="auth-card auth-card--glass">
          <div class="auth-card__brand">
            <div class="auth-card__brand-mark">PR</div>
            <strong>${t('app_name')}</strong>
            <span class="auth-live-dot">Trực tuyến</span>
          </div>
          <h1>${t('forgot_title')}</h1>
          <p class="auth-desc">${t('forgot_desc')}</p>

          <div class="field" id="resetEmailField">
            <label for="resetEmail">Email</label>
            <input class="input" id="resetEmail" type="email" placeholder="${t('email_placeholder')}" autocomplete="email">
            <div class="error-msg">${t('required_field')}</div>
          </div>
          <button class="btn btn-primary btn-block" id="btnSendResetCode">${t('send_code_btn')}</button>

          <div id="resetFields" hidden>
            <div class="field" id="resetCodeField">
              <label for="resetCode">${t('reset_code')}</label>
              <input class="input" id="resetCode" inputmode="numeric" maxlength="6" placeholder="${t('reset_code_placeholder')}" autocomplete="one-time-code">
              <div class="error-msg">${t('required_field')}</div>
            </div>
            <div class="field" id="newPasswordField">
              <label for="newPassword">${t('new_password')}</label>
              <input class="input" id="newPassword" type="password" placeholder="${t('password_placeholder')}" autocomplete="new-password">
              <div class="error-msg">${t('required_field')}</div>
            </div>
            <div class="field" id="confirmNewPasswordField">
              <label for="confirmNewPassword">${t('confirm_new_password')}</label>
              <input class="input" id="confirmNewPassword" type="password" placeholder="${t('password_placeholder')}" autocomplete="new-password">
              <div class="error-msg">${t('required_field')}</div>
            </div>
            <button class="btn btn-primary btn-block" id="btnResetPassword">${t('reset_password_btn')}</button>
          </div>

          <div class="auth-footer">
            <a href="#/login" class="link-btn" id="backToLogin">${t('back_to_login')}</a>
          </div>
        </div>
      </div>
    </div>
  `;

  qs('#backToLogin', root).addEventListener('click', (e) => { e.preventDefault(); location.hash = '#/login'; });
  const emailInput = qs('#resetEmail', root);
  const resetFields = qs('#resetFields', root);
  const sendButton = qs('#btnSendResetCode', root);
  const emailField = qs('#resetEmailField', root);

  sendButton.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailField.classList.add('has-error');
      emailField.querySelector('.error-msg').textContent = t('reset_error');
      return;
    }
    emailField.classList.remove('has-error');
    sendButton.disabled = true;
    sendButton.innerHTML = `<span class="spinner"></span> ${t('loading')}`;
    try {
      const result = await RealAPI.requestPasswordReset(email);
      if (!result.ok) {
        showToast({ type: 'error', title: result.error || t('reset_error') });
        return;
      }
      resetFields.hidden = false;
      emailInput.readOnly = true;
      sendButton.hidden = true;
      showToast({ type: 'success', title: t('reset_code_sent') });
      qs('#resetCode', root).focus();
    } catch (error) {
      console.error('Password reset request failed:', error);
      showToast({ type: 'error', title: t('reset_error') });
    } finally {
      sendButton.disabled = false;
      sendButton.innerHTML = t('send_code_btn');
    }
  });

  qs('#btnResetPassword', root).addEventListener('click', async (e) => {
    const code = qs('#resetCode', root).value.trim();
    const newPassword = qs('#newPassword', root).value;
    const confirmPassword = qs('#confirmNewPassword', root).value;
    if (!/^\d{6}$/.test(code)) {
      qs('#resetCodeField', root).classList.add('has-error');
      return;
    }
    qs('#resetCodeField', root).classList.remove('has-error');
    if (newPassword.length < 8 || newPassword !== confirmPassword) {
      qs('#confirmNewPasswordField', root).classList.add('has-error');
      qs('#confirmNewPasswordField .error-msg', root).textContent = newPassword !== confirmPassword ? t('err_password_mismatch') : t('password_minimum');
      return;
    }
    qs('#confirmNewPasswordField', root).classList.remove('has-error');
    const button = e.currentTarget;
    button.disabled = true;
    button.innerHTML = `<span class="spinner"></span> ${t('loading')}`;
    try {
      const result = await RealAPI.resetPassword(emailInput.value.trim(), code, newPassword);
      if (!result.ok) {
        showToast({ type: 'error', title: result.error || t('reset_error') });
        return;
      }
      showToast({ type: 'success', title: t('reset_success') });
      setTimeout(() => { location.hash = '#/login'; }, 600);
    } catch (error) {
      console.error('Password reset failed:', error);
      showToast({ type: 'error', title: t('reset_error') });
    } finally {
      button.disabled = false;
      button.innerHTML = t('reset_password_btn');
    }
  });
};

/* ---------------------------------------------------------
   13) REGISTER
   --------------------------------------------------------- */
PAGES['#/register'] = async (root) => {
  root.innerHTML = `
    <div class="page-container page-enter">
      <div class="auth-wrap auth-wrap--scene">
        <div class="auth-scene__glow auth-scene__glow--one"></div>
        <div class="auth-scene__glow auth-scene__glow--two"></div>
        <div class="auth-promo">
          <div class="auth-promo__eyebrow">PERRALVPN · KHỞI ĐẦU AN TOÀN</div>
          <h2>Một tài khoản,<br><span>mọi kết nối.</span></h2>
          <p>Đăng ký để theo dõi dung lượng, node, ứng dụng và gói dịch vụ của bạn ngay trên một bảng điều khiển.</p>
          <div class="auth-promo__stats"><span><strong>5+</strong> Nền tảng</span><span><strong>24/7</strong> Hỗ trợ</span></div>
        </div>
        <div class="auth-card auth-card--glass">
          <div class="auth-card__brand">
            <div class="auth-card__brand-mark">PR</div>
            <strong>${t('app_name')}</strong>
            <span class="auth-live-dot">Bắt đầu ngay</span>
          </div>
          <h1>${t('register_title')}</h1>
          <p class="auth-desc">${t('register_desc')}</p>

          <div class="field" id="regNameField">
            <label for="regName">${t('full_name')}</label>
            <input class="input" id="regName" placeholder="${t('full_name_placeholder')}">
            <div class="error-msg">${t('required_field')}</div>
          </div>
          <div class="field" id="regEmailField">
            <label for="regEmail">Email</label>
            <input class="input" id="regEmail" type="email" placeholder="${t('email_placeholder')}">
            <div class="error-msg">${t('required_field')}</div>
          </div>
          <div class="field" id="regPwField">
            <label for="regPw">${t('password')}</label>
            <input class="input" id="regPw" type="password" placeholder="${t('password_placeholder')}">
            <div class="error-msg">${t('required_field')}</div>
          </div>
          <div class="field" id="regPw2Field">
            <label for="regPw2">${t('confirm_password')}</label>
            <input class="input" id="regPw2" type="password" placeholder="${t('password_placeholder')}">
            <div class="error-msg">${t('err_password_mismatch')}</div>
          </div>

          <button class="btn btn-primary btn-block" id="btnRegister">${t('register_btn')}</button>

          <div class="auth-footer">
            ${t('have_account')} <a href="#/login" class="link-btn" id="goLogin">${t('signin_link')}</a>
          </div>
        </div>
      </div>
    </div>
  `;

  qs('#goLogin', root).addEventListener('click', (e) => { e.preventDefault(); location.hash = '#/login'; });

  qs('#btnRegister', root).addEventListener('click', async (e) => {
    const nameField = qs('#regNameField', root), emailField = qs('#regEmailField', root),
          pwField = qs('#regPwField', root), pw2Field = qs('#regPw2Field', root);
    const name = qs('#regName', root).value, email = qs('#regEmail', root).value,
          pw = qs('#regPw', root).value, pw2 = qs('#regPw2', root).value;

    let ok = true;
    [nameField, emailField, pwField, pw2Field].forEach(f => f.classList.remove('has-error'));
    if (!name.trim()){ nameField.classList.add('has-error'); ok = false; }
    if (!isValidEmail(email)){ emailField.classList.add('has-error'); ok = false; }
    if (pw.length < 8){ pwField.classList.add('has-error'); pwField.querySelector('.error-msg').textContent = t('password_minimum'); ok = false; }
    if (pw !== pw2){ pw2Field.classList.add('has-error'); ok = false; }
    if (!ok) return;

    const btn = e.currentTarget;
    btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> ${t('loading')}`;
    const res = await RealAPI.register(name, email, pw);
    btn.disabled = false; btn.innerHTML = t('register_btn');

    if (res.ok){
      showToast({ type: 'success', title: t('toast_register_ok') });
      location.hash = '#/login';
    } else {
      const message = res.error || t('error_title');
      pwField.classList.add('has-error');
      pwField.querySelector('.error-msg').textContent = message;
      showToast({ type: 'error', title: message });
    }
  });
};

function isValidEmail(v){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
