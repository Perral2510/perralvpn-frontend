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
  { key: '12', months: 12, discount: 0.15 },
];

function cyclePrice(plan, cycleKey){
  const c = CYCLE_OPTIONS.find(x => x.key === cycleKey) || CYCLE_OPTIONS[0];
  const raw = plan.price * c.months;
  const discount = Math.round(raw * c.discount);
  return { raw, discount, total: raw - discount, months: c.months };
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
  let cycle = plan.lifetime ? '1' : (CHECKOUT_STATE.cycle || '1');
  const availableCycles = plan.lifetime ? [CYCLE_OPTIONS[0]] : CYCLE_OPTIONS;
  let method = 'bank';
  let promoApplied = null;
  let promoError = '';

  const PAYMENT_METHODS = [
    { key: 'bank', icon: 'barchart', label: t('pm_bank'), desc: `${t('pm_bank_desc')} · Đang hỗ trợ` },
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

            <div class="summary-row"><span>${t('subtotal')}</span><span class="mono">${formatCurrency(price.total)}</span></div>
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
      btn.disabled = false;
      btn.innerHTML = t('pay_now');
      if (!res.ok) {
        showToast({ type: 'error', title: res.error || t('error_title') });
        return;
      }
      CHECKOUT_STATE.lastOrder = { ...res.data.order, plan, payment: res.data.payment };
      renderCheckoutPayment(root, CHECKOUT_STATE.lastOrder);
    });
  };

  paint();
};

function renderCheckoutPayment(root, order, submitted = false){
  const payment = order.payment || {};
  const qrPayload = `Bank:${payment.bank}|STK:${payment.account}|ChuTK:${payment.owner}|SoTien:${payment.amount || order.total}|NoiDung:${payment.content || order.id}`;
  const qrUrl = buildDemoQrDataUrl(qrPayload);
  root.innerHTML = `
    <div class="page-container page-enter">
      <div class="checkout-success" style="max-width:760px;margin:0 auto;">
        <div class="checkout-success__icon">${icon(submitted ? 'checkCircle' : 'wallet')}</div>
        <h2>${submitted ? 'Đã ghi nhận thanh toán' : 'Thanh toán qua QR Bank'}</h2>
        <p>${submitted ? 'Đơn hàng đang chờ hệ thống đối soát. Gói sẽ được kích hoạt sau khi giao dịch được xác nhận.' : 'Quét mã QR bằng ứng dụng ngân hàng, sau đó bấm xác nhận để gửi yêu cầu đối soát.'}</p>
        <div class="checkout-grid" style="margin-top:20px;text-align:left;">
          <div class="card" style="text-align:center;">
            <div class="card-title">Mã QR chuyển khoản</div>
            <div class="topup-modal__qr-wrap" style="display:inline-flex;"><img src="${qrUrl}" alt="Mã QR thanh toán đơn hàng ${escapeHTML(order.id)}" style="width:190px;height:190px;background:#fff;padding:10px;border-radius:12px;"></div>
            <p class="text-secondary text-sm" style="margin:12px 0 0;">${payment.demo ? 'QR demo — hãy cấu hình thông tin ngân hàng trong .env trước khi dùng chính thức.' : 'Kiểm tra đúng số tiền và nội dung chuyển khoản trước khi xác nhận.'}</p>
          </div>
          <div class="card text-sm">
            <div class="card-title">Thông tin đơn hàng</div>
            <div class="summary-row"><span>${t('order_code')}</span><span class="mono">${escapeHTML(order.id)}</span></div>
            <div class="summary-row"><span>Gói cước</span><span>${escapeHTML(order.plan?.name || order.planName || '—')}</span></div>
            <div class="summary-row"><span>Ngân hàng</span><span>${escapeHTML(payment.bank || '—')}</span></div>
            <div class="summary-row"><span>Số tài khoản</span><span class="mono">${escapeHTML(payment.account || '—')}</span></div>
            <div class="summary-row"><span>Chủ tài khoản</span><span>${escapeHTML(payment.owner || '—')}</span></div>
            <div class="summary-row"><span>Nội dung</span><span class="mono">${escapeHTML(payment.content || order.id)}</span></div>
            <div class="summary-row total"><span>${t('total')}</span><span class="amount mono">${formatCurrency(order.total)}</span></div>
          </div>
        </div>
        <div class="flex gap-2" style="justify-content:center;flex-wrap:wrap;margin-top:20px;">
          ${submitted ? '<span class="badge badge-warning" style="padding:10px 14px;">Đang chờ đối soát</span>' : '<button class="btn btn-primary" id="btnSubmitPayment">Tôi đã chuyển khoản</button>'}
          <button class="btn btn-secondary" id="btnViewOrders">${t('view_orders')}</button>
          <button class="btn btn-secondary" id="btnBackHome">${t('back_to_dashboard')}</button>
        </div>
      </div>
    </div>
  `;
  qs('#btnViewOrders', root).addEventListener('click', () => { location.hash = '#/order'; });
  qs('#btnBackHome', root).addEventListener('click', () => { location.hash = '#/dashboard'; });
  const submitBtn = qs('#btnSubmitPayment', root);
  if (submitBtn) submitBtn.addEventListener('click', async (e) => {
    e.currentTarget.disabled = true;
    e.currentTarget.innerHTML = `<span class="spinner"></span> Đang ghi nhận...`;
    const res = await RealAPI.submitPayment(order.id);
    if (!res.ok) {
      e.currentTarget.disabled = false;
      e.currentTarget.textContent = 'Tôi đã chuyển khoản';
      showToast({ type: 'error', title: res.error || t('error_title') });
      return;
    }
    CHECKOUT_STATE.lastOrder = { ...order, ...res.data };
    renderCheckoutPayment(root, CHECKOUT_STATE.lastOrder, true);
    showToast({ type: 'success', title: 'Đã ghi nhận yêu cầu đối soát' });
  });
  if (submitted) CHECKOUT_STATE.plan = null;
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
            <div class="auth-card__brand-mark">DA</div>
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
  qs('#forgotLink', root).addEventListener('click', (e) => { e.preventDefault(); showToast({ type: 'info', title: t('forgot_password') }); });

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
            <div class="auth-card__brand-mark">DA</div>
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
