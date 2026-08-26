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
  const compactNumber = (value) => String(Number(value.toFixed(2)));
  const formatData = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
    if (bytes < 1024 ** 2) return `${compactNumber(bytes / 1024)} KB`;
    if (bytes < 1024 ** 3) return `${compactNumber(bytes / (1024 ** 2))} MB`;
    const gb = bytes / (1024 ** 3);
    return `${compactNumber(gb)} GB`;
  };
  const dataLabel = maxBytes > 0 ? `${formatData(usedBytes)} / ${formatData(maxBytes)}` : `${formatData(usedBytes)} / Không giới hạn`;
  const dataPercent = maxBytes > 0 ? Math.min(100, Math.max(0, Math.round((usedBytes / maxBytes) * 100))) : 0;
  const machineLabel = machinesMax > 0 ? `${machinesUsed} / ${machinesMax}` : `${machinesUsed} / Không giới hạn`;
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
    if (window.__vpnResetInFlight) return;
    openConfirm({
      title: 'Reset URL và QR?',
      message: 'Link subscription và QR hiện tại sẽ bị thay thế bằng link/QR mới. Bạn cần nhập lại link mới vào ứng dụng VPN.',
      confirmLabel: 'Reset URL và QR',
      danger: true,
      onConfirm: async () => {
        if (window.__vpnResetInFlight) return;
        window.__vpnResetInFlight = true;
        const resetButton = qs('#btnManagedReset', root);
        setVpnResetButtonBusy(resetButton, true);
        showToast({ type: 'info', title: 'Đang reset URL và QR...', message: 'Vui lòng chờ, không bấm lại nút.' });
        try {
          const result = await RealAPI.resetVpnLink();
          if (!result.ok) {
            showToast({ type: 'error', title: result.error || 'Không thể reset URL và QR lúc này.' });
            return;
          }
          showToast({ type: 'success', title: result.message || 'Đã tạo URL và QR mới.' });
          await PAGES['#/manage-plan'](root);
        } catch (error) {
          showToast({ type: 'error', title: 'Không thể reset URL và QR lúc này.', message: error?.message || 'Vui lòng thử lại.' });
        } finally {
          window.__vpnResetInFlight = false;
          setVpnResetButtonBusy(resetButton, false);
        }
      },
    });
  });
};
