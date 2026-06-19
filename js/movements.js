/* ==========================================
   HM Servicios - Módulo Historial E/S
   ========================================== */

const MovementsModule = {
  render() {
    const movements = DB.getMovements();
    const container = document.getElementById('module-content');

    if (movements.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No hay movimientos registrados</h3>
          <p>Los movimientos de entrada y salida aparecerán aquí cuando registres cambios en el inventario.</p>
          <button class="btn btn-primary" onclick="App.loadModule('inventory')">
            <span>←</span> Ir al Inventario
          </button>
        </div>
      `;
      return;
    }

    let rows = movements.map(m => {
      const isEntry = m.type === 'entrada';
      const rowClass = isEntry ? 'mov-row-entrada' : 'mov-row-salida';
      const typeLabel = isEntry
        ? '<span style="color:var(--success);font-weight:700;">⬆ Entrada</span>'
        : '<span style="color:var(--danger);font-weight:700;">⬇ Salida</span>';
      const qtyStyle = isEntry
        ? 'color:var(--success);font-weight:700;'
        : 'color:var(--danger);font-weight:700;';
      const qtyPrefix = isEntry ? '+' : '-';

      const dateStr = m.date || m.createdAt.split('T')[0];
      const timeStr = m.createdAt ? new Date(m.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '';

      return `
        <tr class="${rowClass}">
          <td style="white-space:nowrap;font-size:0.75rem;color:var(--gray-500);">${dateStr}<br><small>${timeStr}</small></td>
          <td>${typeLabel}</td>
          <td><strong>${m.productSku}</strong></td>
          <td>${m.productName}</td>
          <td style="${qtyStyle}">${qtyPrefix}${m.quantity}</td>
          <td style="font-size:0.78rem;color:var(--gray-600);">${m.stockBefore} → <strong>${m.stockAfter}</strong></td>
          <td style="max-width:200px;font-size:0.78rem;color:var(--gray-700);">${m.observation}</td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div>
          <span style="font-size:0.85rem;color:var(--gray-500);">Total: <strong>${movements.length}</strong> movimientos</span>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-sm" style="background:#e8f5e9;color:var(--success);border:1px solid #c8e6c9;" onclick="MovementsModule.exportCSV()">
            ⬇ Exportar CSV
          </button>
        </div>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>SKU</th>
              <th>Producto</th>
              <th>Cant.</th>
              <th>Stock</th>
              <th>Observación</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  },

  exportCSV() {
    const movements = DB.getMovements();
    if (movements.length === 0) {
      App.showToast('No hay movimientos para exportar', 'info');
      return;
    }

    const headers = ['Fecha', 'Hora', 'Tipo', 'SKU', 'Producto', 'Cantidad', 'Stock Antes', 'Stock Después', 'Observación'];
    const rows = movements.map(m => {
      const date = m.date || m.createdAt.split('T')[0];
      const time = m.createdAt ? new Date(m.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '';
      return [date, time, m.type, m.productSku, m.productName, m.quantity, m.stockBefore, m.stockAfter, `"${(m.observation || '').replace(/"/g, '""')}"`];
    });

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historial-movimientos-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    App.showToast('CSV exportado correctamente', 'success');
  }
};