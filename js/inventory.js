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
        badgeText = 'Crítico';
      } else if (p.quantity <= p.minStock) {
        badgeClass = 'badge-warning';
        badgeText = 'Bajo Stock';
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

  // Show product detail in a modal
  showDetail(id) {
    const product = DB.getProduct(id);
    if (!product) {
      App.showToast('Producto no encontrado', 'error');
      return;
    }

    let statusText = 'Normal';
    let statusClass = 'badge-ok';
    if (product.quantity <= product.criticalStock) {
      statusText = '⚠️ Crítico';
      statusClass = 'badge-danger';
    } else if (product.quantity <= product.minStock) {
      statusText = '⚠️ Bajo Stock';
      statusClass = 'badge-warning';
    }

    document.getElementById('detail-title').textContent = `Detalle: ${product.name}`;
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
        <div class="detail-field">
          <div class="label">Stock Actual</div>
          <div class="value" style="font-size:1.3rem;font-weight:700;color:${product.quantity <= product.criticalStock ? 'var(--danger)' : product.quantity <= product.minStock ? 'var(--warning)' : 'var(--success)'}">${product.quantity} unidades</div>
        </div>
        <div class="detail-field">
          <div class="label">Estado</div>
          <div class="value"><span class="badge ${statusClass}">${statusText}</span></div>
        </div>
        <div class="detail-field">
          <div class="label">Stock Mínimo</div>
          <div class="value">${product.minStock} unidades</div>
        </div>
        <div class="detail-field">
          <div class="label">Stock Crítico</div>
          <div class="value">${product.criticalStock} unidades</div>
        </div>
        <div class="detail-field full-width">
          <div class="label">Descripción</div>
          <div class="value">${product.description || 'Sin descripción'}</div>
        </div>
      </div>

      <div class="detail-qr">
        <div class="qr-placeholder">
          QR del Producto<br>
          <small>${product.sku}</small>
        </div>
        <span class="qr-label">📱 Código QR para ${product.sku}</span>
        <small style="color:var(--gray-400);font-size:0.75rem;">(Próximamente: generación de QR dinámico)</small>
      </div>

      <div class="form-actions" style="margin-top:16px;">
        <button class="btn" style="background:var(--gray-300);color:var(--gray-800);" onclick="App.closeDetailModal()">Cerrar</button>
        <button class="btn btn-primary" onclick="InventoryModule.showEditModal('${product.id}'); App.closeDetailModal();">Editar Producto</button>
      </div>
    `;

    document.getElementById('detail-modal').classList.remove('hidden');
    document.getElementById('modal-backdrop').classList.remove('hidden');
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