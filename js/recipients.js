/* ==========================================
   HM Servicios - Módulo Destinatarios
   ========================================== */

const RecipientsModule = {
  currentId: null,
  editing: false,

  render() {
    const recipients = DB.getRecipients();
    const container = document.getElementById('module-content');

    if (recipients.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📧</div>
          <h3>No hay destinatarios registrados</h3>
          <p>Los destinatarios recibirán alertas por correo cuando el stock esté bajo o crítico.</p>
          <button class="btn btn-primary" onclick="RecipientsModule.showAddModal()">
            <span>+</span> Agregar Destinatario
          </button>
        </div>
      `;
      return;
    }

    let rows = recipients.map(r => {
      const statusBadge = r.active
        ? '<span class="badge badge-ok">Activo</span>'
        : '<span class="badge badge-danger">Inactivo</span>';

      return `
        <tr>
          <td><strong>${r.name}</strong></td>
          <td>${r.email}</td>
          <td>${statusBadge}</td>
          <td>${new Date(r.createdAt).toLocaleDateString('es-CL')}</td>
          <td class="actions-cell">
            <button class="btn btn-primary btn-sm" onclick="RecipientsModule.showEditModal('${r.id}')" title="Editar">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="RecipientsModule.confirmDelete('${r.id}')" title="Eliminar">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
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

  showAddModal() {
    this.editing = false;
    this.currentId = null;

    document.getElementById('modal-title').textContent = 'Agregar Destinatario';
    document.getElementById('modal-body').innerHTML = `
      <form id="recipient-form">
        <div class="form-group">
          <label for="rec-name">Nombre Completo *</label>
          <input type="text" id="rec-name" placeholder="Ej: Juan Pérez" required>
        </div>
        <div class="form-group">
          <label for="rec-email">Correo Electrónico *</label>
          <input type="email" id="rec-email" placeholder="Ej: juan@correo.cl" required>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="rec-active" checked>
            <span>Activo (recibirá alertas de stock)</span>
          </label>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" style="background:var(--gray-300);color:var(--gray-800);" onclick="Modal.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar Destinatario</button>
        </div>
      </form>
    `;

    document.getElementById('recipient-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleSave();
    });

    Modal.open();
  },

  showEditModal(id) {
    const recipient = DB.getRecipient(id);
    if (!recipient) {
      App.showToast('Destinatario no encontrado', 'error');
      return;
    }

    this.editing = true;
    this.currentId = id;

    document.getElementById('modal-title').textContent = 'Editar Destinatario';
    document.getElementById('modal-body').innerHTML = `
      <form id="recipient-form">
        <div class="form-group">
          <label for="rec-name">Nombre Completo *</label>
          <input type="text" id="rec-name" value="${recipient.name}" required>
        </div>
        <div class="form-group">
          <label for="rec-email">Correo Electrónico *</label>
          <input type="email" id="rec-email" value="${recipient.email}" required>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="rec-active" ${recipient.active ? 'checked' : ''}>
            <span>Activo (recibirá alertas de stock)</span>
          </label>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" style="background:var(--gray-300);color:var(--gray-800);" onclick="Modal.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Actualizar Destinatario</button>
        </div>
      </form>
    `;

    document.getElementById('recipient-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleSave();
    });

    Modal.open();
  },

  _handleSave() {
    const name = document.getElementById('rec-name').value.trim();
    const email = document.getElementById('rec-email').value.trim();
    const active = document.getElementById('rec-active').checked;

    if (!name || !email) {
      App.showToast('Nombre y email son obligatorios', 'error');
      return;
    }

    if (!email.includes('@')) {
      App.showToast('Ingresa un email válido', 'error');
      return;
    }

    const data = { name, email, active };

    if (this.editing) {
      DB.updateRecipient(this.currentId, data);
      App.showToast('Destinatario actualizado correctamente', 'success');
    } else {
      DB.addRecipient(data);
      App.showToast('Destinatario agregado correctamente', 'success');
    }

    Modal.close();
    this.render();
  },

  confirmDelete(id) {
    const recipient = DB.getRecipient(id);
    if (!recipient) return;

    if (confirm(`¿Estás seguro de eliminar a "${recipient.name}" (${recipient.email})?`)) {
      DB.deleteRecipient(id);
      App.showToast('Destinatario eliminado', 'info');
      this.render();
    }
  }
};