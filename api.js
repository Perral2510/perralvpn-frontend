/* DucAnhVPN — real backend API client */
const API_BASE = window.DUCANH_API_BASE || '/api';
let sessionUser = null;

async function apiRequest(path, options = {}) {
  const headers = { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: 'include' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return { ok: false, status: response.status, error: payload.message || 'Yêu cầu API thất bại.' };
  return payload;
}

const RealAPI = {
  login: async (email, password) => {
    const result = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (result.ok) sessionUser = result.data;
    return result;
  },
  register: (fullName, email, password) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify({ fullName, email, password }) }),
  logout: async () => { const result = await apiRequest('/auth/logout', { method: 'POST' }); sessionUser = null; return result; },
  getUser: async () => { const result = await apiRequest('/account/me'); if (result.ok) sessionUser = result.data; return result.ok ? result.data : null; },
  updateProfile: async (name, phone) => { const result = await apiRequest('/account/profile', { method: 'PUT', body: JSON.stringify({ name, phone }) }); if (result.ok) sessionUser = result.data; return result; },
  changePassword: (currentPassword, newPassword) => apiRequest('/account/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }),
  getSessions: async () => { const result = await apiRequest('/account/sessions'); return result.ok ? result.data : []; },
  getPlans: async () => { const result = await apiRequest('/plans'); return result.ok ? result.data : []; },
  getBilling: async () => { const result = await apiRequest('/account/billing'); return result.ok ? result.data : null; },
  getOrders: async () => { const result = await apiRequest('/account/orders'); return result.ok ? result.data : []; },
  createOrder: (planId, cycleMonths, paymentMethod, promoCode = '') => apiRequest('/account/orders', { method: 'POST', body: JSON.stringify({ planId, cycleMonths, paymentMethod, promoCode }) }),
  submitPayment: (orderId, paymentRef = '') => apiRequest(`/account/orders/${encodeURIComponent(orderId)}/payment-submitted`, { method: 'POST', body: JSON.stringify({ paymentRef }) }),
  cancelOrder: (orderId) => apiRequest(`/account/orders/${encodeURIComponent(orderId)}`, { method: 'DELETE' }),
  revokeOtherSessions: () => apiRequest('/account/sessions/revoke-others', { method: 'POST' }),
};
