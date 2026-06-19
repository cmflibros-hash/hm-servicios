/* ==========================================
   HM Servicios - Módulo Inventario
   ========================================== */

const InventoryModule = {
  currentProductId: null,
  editing: false,

  // Generate a unique SKU
  _generateSKU() {
    const products = DB.getProducts();
    const nums = products.map(p => {
      const match = p.sku.match(/SKU-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `SKU-${String(max + 1).padStart(3, '0')}`;
  },

  // Render the inventory table
  render() {
    const products = DB.getProducts();
    const container = document.getElementById('module-content');

    if (products.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No hay productos en el inventario</h3>
          <p>Agrega tu primer producto para comenzar a gestionar tu bodega.</p>
          <button class="btn btn-primary" onclick="InventoryModule.showAddModal()">
            <span>+</span> Agregar Producto
          </button>
        </div>
      `;
      return;
    }

    let rows = products.map(p => {
      let badgeClass = 'badge-ok';
      let badgeText = 'Normal';
      if (p.quantity <= p.criticalStock) {
        badgeClass = 'badge-danger';
        badgeText = '⚠ Crítico';
      } else if (p.quantity <= p.minStock) {
        badgeClass = 'badge-warning';
        badgeText = '⚠ Bajo';
      }

      return `
        <tr>
          <td><strong>${p.sku}</strong></td>
          <td>${p.name}</td>
          <td>${p.category}</td>
          <td><strong>${p.quantity}</strong></td>
          <td>${p.minStock}</td>
          <td>${p.criticalStock}</td>
          <td><span class="badge ${badgeClass}">${badgeText}</span></td>
          <td class="actions-cell">
            <button class="btn btn-accent btn-sm" onclick="InventoryModule.showDetail('${p.id}')" title="Ver detalle">🔍</button>
            <button class="btn btn-primary btn-sm" onclick="InventoryModule.showEditModal('${p.id}')" title="Editar">✏️</button>
            <button class="btn btn-sm" style="background:#fff8e1;color:#e65100;border:1px solid #ffe0b2;" onclick="InventoryModule.showMovementModal('${p.id}')" title="Entrada/Salida">📦</button>
            <button class="btn btn-danger btn-sm" onclick="InventoryModule.confirmDelete('${p.id}')" title="Eliminar">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Stock Mín.</th>
              <th>Stock Crít.</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  },

  // Show add product modal
  showAddModal() {
    this.editing = false;
    this.currentProductId = null;
    const sku = this._generateSKU();

    document.getElementById('modal-title').textContent = 'Agregar Producto';
    document.getElementById('modal-body').innerHTML = `
      <form id="product-form">
        <div class="form-row">
          <div class="form-group">
            <label for="prod-sku">Código SKU</label>
            <input type="text" id="prod-sku" value="${sku}" readonly style="background:#f5f5f5;color:#666;">
          </div>
          <div class="form-group">
            <label for="prod-category">Categoría</label>
            <select id="prod-category" required>
              <option value="">Seleccionar...</option>
              <option value="Compresores">Compresores</option>
              <option value="Filtración">Filtración</option>
              <option value="Lubricación">Lubricación</option>
              <option value="Mecánico">Mecánico</option>
              <option value="Eléctrico">Eléctrico</option>
              <option value="Instrumentación">Instrumentación</option>
              <option value="Mantención">Mantención</option>
              <option value="Tuberías">Tuberías</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="prod-name">Nombre del Producto *</label>
          <input type="text" id="prod-name" placeholder="Ej: Filtro de Aceite Spin-On" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="prod-quantity">Stock Actual *</label>
            <input type="number" id="prod-quantity" min="0" value="0" required>
          </div>
          <div class="form-group">
            <label for="prod-minstock">Stock Mínimo *</label>
            <input type="number" id="prod-minstock" min="0" value="10" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="prod-criticalstock">Stock Crítico *</label>
            <input type="number" id="prod-criticalstock" min="0" value="5" required>
          </div>
        </div>
        <div class="form-group">
          <label for="prod-description">Descripción</label>
          <textarea id="prod-description" placeholder="Descripción del producto..."></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" style="background:var(--gray-300);color:var(--gray-800);" onclick="Modal.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar Producto</button>
        </div>
      </form>
    `;

    document.getElementById('product-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleSave();
    });

    Modal.open();
  },

  // Show edit product modal
  showEditModal(id) {
    const product = DB.getProduct(id);
    if (!product) {
      App.showToast('Producto no encontrado', 'error');
      return;
    }

    this.editing = true;
    this.currentProductId = id;

    document.getElementById('modal-title').textContent = 'Editar Producto';
    document.getElementById('modal-body').innerHTML = `
      <form id="product-form">
        <div class="form-row">
          <div class="form-group">
            <label for="prod-sku">Código SKU</label>
            <input type="text" id="prod-sku" value="${product.sku}" readonly style="background:#f5f5f5;color:#666;">
          </div>
          <div class="form-group">
            <label for="prod-category">Categoría</label>
            <select id="prod-category" required>
              <option value="">Seleccionar...</option>
              ${['Compresores','Filtración','Lubricación','Mecánico','Eléctrico','Instrumentación','Mantención','Tuberías','Otros'].map(c =>
                `<option value="${c}" ${product.category === c ? 'selected' : ''}>${c}</option>`
              ).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="prod-name">Nombre del Producto *</label>
          <input type="text" id="prod-name" value="${product.name}" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="prod-quantity">Stock Actual *</label>
            <input type="number" id="prod-quantity" min="0" value="${product.quantity}" required>
          </div>
          <div class="form-group">
            <label for="prod-minstock">Stock Mínimo *</label>
            <input type="number" id="prod-minstock" min="0" value="${product.minStock}" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="prod-criticalstock">Stock Crítico *</label>
            <input type="number" id="prod-criticalstock" min="0" value="${product.criticalStock}" required>
          </div>
        </div>
        <div class="form-group">
          <label for="prod-description">Descripción</label>
          <textarea id="prod-description">${product.description || ''}</textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" style="background:var(--gray-300);color:var(--gray-800);" onclick="Modal.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Actualizar Producto</button>
        </div>
      </form>
    `;

    document.getElementById('product-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleSave();
    });

    Modal.open();
  },

  // Save handler (add or update)
  _handleSave() {
    const data = {
      sku: document.getElementById('prod-sku').value,
      name: document.getElementById('prod-name').value.trim(),
      category: document.getElementById('prod-category').value,
      quantity: parseInt(document.getElementById('prod-quantity').value) || 0,
      minStock: parseInt(document.getElementById('prod-minstock').value) || 0,
      criticalStock: parseInt(document.getElementById('prod-criticalstock').value) || 0,
      description: document.getElementById('prod-description').value.trim()
    };

    if (!data.name) {
      App.showToast('El nombre del producto es obligatorio', 'error');
      return;
    }
    if (!data.category) {
      App.showToast('Selecciona una categoría', 'error');
      return;
    }

    if (this.editing) {
      DB.updateProduct(this.currentProductId, data);
      App.showToast('Producto actualizado correctamente', 'success');
    } else {
      DB.addProduct(data);
      App.showToast('Producto agregado correctamente', 'success');
    }

    Modal.close();
    this.render();
  },

  // Show movement modal (Entrada / Salida)
  showMovementModal(productId) {
    const product = DB.getProduct(productId);
    if (!product) {
      App.showToast('Producto no encontrado', 'error');
      return;
    }

    document.getElementById('modal-title').textContent = `📦 Movimiento: ${product.sku}`;
    document.getElementById('modal-body').innerHTML = `
      <div style="margin-bottom:14px;padding:10px 14px;background:#f0f4ff;border-radius:var(--radius);border:1px solid #d0d9ff;">
        <strong style="color:var(--primary);">${product.name}</strong><br>
        <span style="font-size:0.8rem;color:var(--gray-600);">SKU: ${product.sku} | Stock actual: <strong>${product.quantity}</strong> unidades</span>
      </div>
      <form id="movement-form">
        <div class="form-row">
          <div class="form-group">
            <label>Tipo de Movimiento *</label>
            <div style="display:flex;gap:10px;">
              <label class="checkbox-label" style="flex:1;justify-content:center;padding:10px;border:2px solid var(--success);border-radius:var(--radius);background:#e8f5e9;cursor:pointer;">
                <input type="radio" name="mov-type" value="entrada" checked style="accent-color:var(--success);">
                <span style="font-weight:700;color:var(--success);font-size:0.95rem;">⬆ Entrada</span>
              </label>
              <label class="checkbox-label" style="flex:1;justify-content:center;padding:10px;border:2px solid var(--danger);border-radius:var(--radius);background:#ffebee;cursor:pointer;">
                <input type="radio" name="mov-type" value="salida" style="accent-color:var(--danger);">
                <span style="font-weight:700;color:var(--danger);font-size:0.95rem;">⬇ Salida</span>
              </label>
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="mov-quantity">Cantidad *</label>
            <input type="number" id="mov-quantity" min="1" value="1" required>
          </div>
          <div class="form-group">
            <label for="mov-date">Fecha</label>
            <input type="date" id="mov-date" value="${new Date().toISOString().split('T')[0]}">
          </div>
        </div>
        <div class="form-group">
          <label for="mov-observation">Observación / Detalle *</label>
          <textarea id="mov-observation" placeholder="Ej: Recepción proveedor ABC / Retiro para instalación en faena..." required style="min-height:70px;"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" style="background:var(--gray-300);color:var(--gray-800);" onclick="Modal.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary" id="btn-save-movement">Registrar Movimiento</button>
        </div>
      </form>
    `;

    document.getElementById('movement-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleMovement(product);
    });

    Modal.open();
  },

  // Handle movement save
  _handleMovement(product) {
    const type = document.querySelector('input[name="mov-type"]:checked').value;
    const quantity = parseInt(document.getElementById('mov-quantity').value) || 0;
    const date = document.getElementById('mov-date').value;
    const observation = document.getElementById('mov-observation').value.trim();

    if (quantity <= 0) {
      App.showToast('La cantidad debe ser mayor a 0', 'error');
      return;
    }
    if (!observation) {
      App.showToast('Debes ingresar una observación del movimiento', 'error');
      return;
    }

    const newStock = type === 'entrada'
      ? product.quantity + quantity
      : product.quantity - quantity;

    if (newStock < 0) {
      App.showToast('Stock insuficiente para realizar la salida', 'error');
      return;
    }

    // Update product stock
    DB.updateProduct(product.id, { quantity: newStock });

    // Record movement
    DB.addMovement({
      productId: product.id,
      productSku: product.sku,
      productName: product.name,
      type: type, // 'entrada' or 'salida'
      quantity: quantity,
      date: date,
      observation: observation,
      stockBefore: product.quantity,
      stockAfter: newStock
    });

    const label = type === 'entrada' ? 'Entrada registrada' : 'Salida registrada';
    App.showToast(`${label}: ${quantity} unidades - Stock actual: ${newStock}`, 'success');

    Modal.close();
    this.render();
  },

  // Show product detail in a compact modal with real QR
  showDetail(id) {
    const product = DB.getProduct(id);
    if (!product) {
      App.showToast('Producto no encontrado', 'error');
      return;
    }

    let statusText = 'Normal';
    let statusClass = 'badge-ok';
    let stockColor = 'var(--success)';
    let barColor = 'var(--success)';
    let barPct = 100;

    if (product.quantity <= product.criticalStock) {
      statusText = '⚠ Crítico';
      statusClass = 'badge-danger';
      stockColor = 'var(--danger)';
      barColor = 'var(--danger)';
      barPct = Math.min(100, Math.round((product.quantity / Math.max(product.criticalStock, 1)) * 50));
    } else if (product.quantity <= product.minStock) {
      statusText = '⚠ Bajo Stock';
      statusClass = 'badge-warning';
      stockColor = 'var(--warning)';
      barColor = 'var(--warning)';
      barPct = Math.min(100, Math.round((product.quantity / Math.max(product.minStock, 1)) * 70));
    } else {
      barPct = Math.min(100, Math.round((product.quantity / Math.max(product.minStock * 2, 1)) * 100));
    }

    document.getElementById('detail-title').textContent = `📄 ${product.sku} — ${product.name}`;
    document.getElementById('detail-body').innerHTML = `
      <div class="detail-grid">
        <div class="detail-field">
          <div class="label">SKU</div>
          <div class="value">${product.sku}</div>
        </div>
        <div class="detail-field">
          <div class="label">Categoría</div>
          <div class="value">${product.category}</div>
        </div>
        <div class="detail-field" style="grid-column:span 2;">
          <div class="label">Stock Actual</div>
          <div class="value" style="font-size:1.1rem;font-weight:700;color:${stockColor}">
            ${product.quantity} unidades
            <span class="badge ${statusClass}" style="margin-left:8px;vertical-align:middle;">${statusText}</span>
          </div>
          <div class="stock-bar-container">
            <div class="stock-bar" style="width:${barPct}%;background:${barColor};"></div>
          </div>
        </div>
        <div class="detail-field">
          <div class="label">Stock Mínimo</div>
          <div class="value">${product.minStock} uds.</div>
        </div>
        <div class="detail-field">
          <div class="label">Stock Crítico</div>
          <div class="value">${product.criticalStock} uds.</div>
        </div>
      </div>

      <div class="detail-desc">
        <div class="label">Descripción</div>
        ${product.description || '<em style="color:var(--gray-400);">Sin descripción registrada</em>'}
      </div>

      <div class="detail-qr-section">
        <div class="qr-canvas" id="qr-container-${product.id}"></div>
        <div class="detail-qr-info">
          <strong>📱 Código QR del Producto</strong>
          <span>ID: HM-Servicios/${product.sku} | ${product.name}</span>
          <button class="btn-download-qr" id="btn-dl-qr-${product.id}">
            ⬇ Descargar QR
          </button>
        </div>
      </div>

      <div class="form-actions" style="margin-top:12px;">
        <button class="btn" style="background:var(--gray-300);color:var(--gray-800);" onclick="App.closeDetailModal()">Cerrar</button>
        <button class="btn btn-primary" onclick="InventoryModule.showEditModal('${product.id}'); App.closeDetailModal();">Editar Producto</button>
        <button class="btn btn-sm" style="background:#fff8e1;color:#e65100;border:1px solid #ffe0b2;" onclick="InventoryModule.showMovementModal('${product.id}'); App.closeDetailModal();">📦 E/S</button>
      </div>
    `;

    // Generate QR code
    const qrContainer = document.getElementById('qr-container-' + product.id);
    const qrData = `HM-Servicios/${product.sku}|${product.name}`;
    
    if (typeof QRCode !== 'undefined') {
      const qr = new QRCode(qrContainer, {
        text: qrData,
        width: 90,
        height: 90,
        colorDark: '#1a237e',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });

      document.getElementById('btn-dl-qr-' + product.id).addEventListener('click', function() {
        const canvas = qrContainer.querySelector('canvas');
        if (canvas) {
          const link = document.createElement('a');
          link.download = `QR-${product.sku}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      });
    }

    document.getElementById('detail-modal').classList.remove('hidden');
    document.getElementById('modal-backdrop').classList.remove('hidden');
  },

  // Show quick movement modal (select product first)
  showQuickMovement() {
    const products = DB.getProducts();
    if (products.length === 0) {
      App.showToast('No hay productos en el inventario', 'error');
      return;
    }

    const options = products.map(p =>
      `<option value="${p.id}">${p.sku} — ${p.name} (Stock: ${p.quantity})</option>`
    ).join('');

    document.getElementById('modal-title').textContent = '📦 Entrada / Salida Rápida';
    document.getElementById('modal-body').innerHTML = `
      <form id="quick-movement-form">
        <div class="form-group">
          <label for="qmov-product">Producto *</label>
          <select id="qmov-product" required>
            <option value="">Seleccionar producto...</option>
            ${options}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Tipo *</label>
            <div style="display:flex;gap:10px;">
              <label class="checkbox-label" style="flex:1;justify-content:center;padding:10px;border:2px solid var(--success);border-radius:var(--radius);background:#e8f5e9;cursor:pointer;">
                <input type="radio" name="qmov-type" value="entrada" checked style="accent-color:var(--success);">
                <span style="font-weight:700;color:var(--success);font-size:0.95rem;">⬆ Entrada</span>
              </label>
              <label class="checkbox-label" style="flex:1;justify-content:center;padding:10px;border:2px solid var(--danger);border-radius:var(--radius);background:#ffebee;cursor:pointer;">
                <input type="radio" name="qmov-type" value="salida" style="accent-color:var(--danger);">
                <span style="font-weight:700;color:var(--danger);font-size:0.95rem;">⬇ Salida</span>
              </label>
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="qmov-quantity">Cantidad *</label>
            <input type="number" id="qmov-quantity" min="1" value="1" required>
          </div>
          <div class="form-group">
            <label for="qmov-date">Fecha</label>
            <input type="date" id="qmov-date" value="${new Date().toISOString().split('T')[0]}">
          </div>
        </div>
        <div class="form-group">
          <label for="qmov-observation">Observación / Detalle *</label>
          <textarea id="qmov-observation" placeholder="Ej: Recepción proveedor / Retiro para instalación..." required style="min-height:70px;"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" style="background:var(--gray-300);color:var(--gray-800);" onclick="Modal.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Registrar Movimiento</button>
        </div>
      </form>
    `;

    document.getElementById('quick-movement-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const prodId = document.getElementById('qmov-product').value;
      if (!prodId) {
        App.showToast('Selecciona un producto', 'error');
        return;
      }
      const product = DB.getProduct(prodId);
      if (product) {
        this._handleMovementFromForm(product);
      }
    });

    Modal.open();
  },

  // Handle movement from quick form (reuses logic)
  _handleMovementFromForm(product) {
    const type = document.querySelector('input[name="qmov-type"]:checked').value;
    const quantity = parseInt(document.getElementById('qmov-quantity').value) || 0;
    const date = document.getElementById('qmov-date').value;
    const observation = document.getElementById('qmov-observation').value.trim();

    if (quantity <= 0) {
      App.showToast('La cantidad debe ser mayor a 0', 'error');
      return;
    }
    if (!observation) {
      App.showToast('Debes ingresar una observación del movimiento', 'error');
      return;
    }

    const newStock = type === 'entrada'
      ? product.quantity + quantity
      : product.quantity - quantity;

    if (newStock < 0) {
      App.showToast('Stock insuficiente para realizar la salida', 'error');
      return;
    }

    DB.updateProduct(product.id, { quantity: newStock });
    DB.addMovement({
      productId: product.id,
      productSku: product.sku,
      productName: product.name,
      type: type,
      quantity: quantity,
      date: date,
      observation: observation,
      stockBefore: product.quantity,
      stockAfter: newStock
    });

    const label = type === 'entrada' ? 'Entrada registrada' : 'Salida registrada';
    App.showToast(`${label}: ${quantity} unidades - Stock actual: ${newStock}`, 'success');

    Modal.close();
    this.render();
  },

  // Confirm before delete
  confirmDelete(id) {
    const product = DB.getProduct(id);
    if (!product) return;

    if (confirm(`¿Estás seguro de eliminar "${product.name}" (${product.sku})?`)) {
      DB.deleteProduct(id);
      App.showToast('Producto eliminado correctamente', 'info');
      this.render();
    }
  }
};