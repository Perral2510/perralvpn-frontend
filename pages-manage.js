/* =========================================================
   PerralVPN — Active plan management
   ========================================================= */

PAGES['#/manage-plan'] = async (root) => {
  root.innerHTML = `
    <div class="page-container page-enter">
      ${pageHeader('manage_plan_title', 'manage_plan_desc')}
      <div class="table-wrap"><div style="padding:18px;">${skeletonLines(4)}</div></div>
    </div>
  `;

  const result = await RealAPI.getVpnManagement().catch(() => ({ ok: false }));
  if (!result.ok) {
    root.innerHTML = `<div class="page-container page-enter"><div class="page-header"><h1>${t('manage_plan_title')}</h1><p>${t('manage_plan_desc')}</p></div>${errorState({ onRetryAttr: 'data-retry-manage-plan' })}</div>`;
    qs('[data-retry-manage-plan]', root)?.addEventListener('click', () => PAGES['#/manage-plan'](root));
    return;
  }

  const data = result.data;
  if (!data) {
    root.innerHTML = `<div class="page-container page-enter"><div class="page-header"><h1>${t('manage_plan_title')}</h1><p>${t('manage_plan_desc')}</p></div>${emptyState({ title: 'Chưa có gói VPN đang hoạt động', desc: 'Mua và kích hoạt một gói để xem thông tin quản lý.', iconName: 'shield' })}</div>`;
    return;
  }

  const plan = data.plan || {};
  const usedBytes = Number(data.dataUsedBytes || 0);
  const maxBytes = Number(data.dataMaxBytes || 0);
  const machinesUsed = Number(data.machinesUsed || 0);
  const machinesMax = Number(data.machinesMax || 0);
  const formatData = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 GB';
    const gb = bytes / (1024 ** 3);
    return `${gb >= 100 ? gb.toFixed(0) : gb.toFixed(2).replace(/\\.00$/, '')} GB`;
  };
  const dataLabel = maxBytes > 0 ? `${formatData(usedBytes)} / ${formatData(maxBytes)}` : `${formatData(usedBytes)} / Không giới hạn`;
  const dataPercent = maxBytes > 0 ? Math.min(100, Math.max(0, Math.round((usedBytes / maxBytes) * 100))) : 0;
  const machineLabel = machinesMax > 0 ? `${machinesUsed} / ${machinesMax}` : `${machinesUsed} / Không giới hạn`;
  const clients = Array.isArray(data.clients) ? data.clients : [];

  root.innerHTML = `
    <div class="page-container page-enter">
      <div class="page-header"><h1>${t('manage_plan_title')}</h1><p>${t('manage_plan_desc')}</p></div>
      <div class="card" style="margin-bottom:18px;">
        <div class="card-title">Gói VPN đang sử dụng</div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Tên gói</th><th>Máy đang dùng</th><th>Data đã dùng / Data max</th><th>Thao tác</th></tr></thead>
            <tbody><tr>
              <td><strong>${escapeHTML(plan.name || '—')}</strong><small style="display:block;color:var(--text-secondary);margin-top:4px;">${plan.lifetime ? 'Vĩnh viễn' : 'Đang hoạt động'}</small></td>
              <td class="mono">${escapeHTML(machineLabel)}</td>
              <td>
                <div class="mono">${escapeHTML(dataLabel)}</div>
                <div style="height:6px;background:var(--border-color);border-radius:99px;margin-top:8px;overflow:hidden;max-width:230px;"><span style="display:block;width:${dataPercent}%;height:100%;background:var(--brand-500);border-radius:99px;"></span></div>
              </td>
              <td><div class="flex gap-2" style="flex-wrap:wrap;"><button class="btn btn-sm btn-secondary" id="btnManagedCopy">Sao chép URL</button><button class="btn btn-sm btn-secondary" id="btnManagedQr">Xem QR</button><button class="btn btn-sm btn-outline" id="btnManagedReset">Reset link/QR</button></div></td>
            </tr></tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="card-title">Client trong subscription</div>
        ${clients.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Email client</th><th>Trạng thái</th><th>Data đã dùng</th><th>Máy đang dùng</th></tr></thead><tbody>${clients.map(client => `<tr><td class="mono">${escapeHTML(client.email || '—')}</td><td>${client.enabled ? '<span class="badge badge-success">Hoạt động</span>' : '<span class="badge badge-danger">Tắt</span>'}</td><td class="mono">${escapeHTML(formatData(Number(client.trafficUsedBytes || 0)))}</td><td class="mono">${Number(client.machinesUsed || 0)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="text-secondary">Chưa có client trong subscription.</p>'}
      </div>
      <p class="text-secondary text-sm" style="margin-top:12px;">Cập nhật lần cuối: ${escapeHTML(formatDate(data.updatedAt, STATE.lang))}</p>
    </div>
  `;

  qs('#btnManagedCopy', root)?.addEventListener('click', async () => {
    const ok = await copyToClipboard(data.subscriptionUrl);
    showToast({ type: ok ? 'success' : 'error', title: ok ? 'Đã sao chép subscription URL' : 'Không thể sao chép URL' });
  });
  qs('#btnManagedQr', root)?.addEventListener('click', () => {
    openModal({
      title: 'QR subscription',
      bodyHTML: `<div style="text-align:center;"><img src="${escapeHTML(data.qrDataUrl)}" alt="QR subscription" style="width:260px;height:260px;background:#fff;padding:10px;border-radius:12px;"><p class="text-secondary text-sm">Quét mã này để thêm toàn bộ client của gói.</p></div>`,
      size: '420px',
    });
  });
  qs('#btnManagedReset', root)?.addEventListener('click', () => {
    openConfirm({
      title: 'Reset link và QR?',
      message: 'Link subscription cũ sẽ bị vô hiệu hóa và hệ thống sẽ tạo link/QR mới.',
      confirmLabel: 'Reset link',
      danger: true,
      onConfirm: async () => {
        const result = await RealAPI.resetVpnLink();
        if (!result.ok) {
          showToast({ type: 'error', title: 'Lỗi server' });
          return;
        }
        showToast({ type: 'success', title: result.message || 'Đã reset link subscription' });
        await PAGES['#/manage-plan'](root);
      },
    });
  });
};
