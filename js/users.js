/* ==========================================
   HM Servicios - Módulo Usuarios
   ========================================== */

const UsersModule = {
  currentId: null,
  editing: false,

  render() {
    const users = DB.getUsers();
    const container = document.getElementById('module-content');

    if (users.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>No hay usuarios registrados</h3>
          <p>Gestiona los usuarios que tendrán acceso al sistema de bodega.</p>
          <button class="btn btn-primary" onclick="UsersModule.showAddModal()">
            <span>+</span> Agregar Usuario
          </button>
        </div>
      `;
      return;
    }

    let rows = users.map(u => {
      const statusBadge = u.active
        ? '<span class="badge badge-ok">Activo</span>'
        : '<span class="badge badge-danger">Inactivo</span>';

      const roleBadge = u.role === 'admin'
        ? '<span class="badge" style="background:#e3f2fd;color:#1565c0;">Administrador</span>'
        : '<span class="badge" style="background:#e8f5e9;color:#2e7d32;">Operador</span>';

      return `
        <tr>
          <td><strong>${u.name}</strong></td>
          <td>${u.email}</td>
          <td>${roleBadge}</td>
          <td>${statusBadge}</td>
          <td>${new Date(u.createdAt).toLocaleDateString('es-CL')}</td>
          <td class="actions-cell">
            <button class="btn btn-primary btn-sm" onclick="UsersModule.showEditModal('${u.id}')" title="Editar">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="UsersModule.confirmDelete('${u.id}')" title="Eliminar">🗑️</button>
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
              <th>Rol</th>
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

    document.getElementById('modal-title').textContent = 'Agregar Usuario';
    document.getElementById('modal-body').innerHTML = `
      <form id="user-form">
        <div class="form-group">
          <label for="user-name">Nombre Completo *</label>
          <input type="text" id="user-name" placeholder="Ej: Admin HM" required>
        </div>
        <div class="form-group">
          <label for="user-email">Correo Electrónico *</label>
          <input type="email" id="user-email" placeholder="Ej: admin@hmservicios.cl" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="user-password">Contraseña *</label>
            <input type="password" id="user-password" placeholder="••••••••" required>
          </div>
          <div class="form-group">
            <label for="user-role">Rol</label>
            <select id="user-role">
              <option value="operator">Operador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="user-active" checked>
            <span>Activo (puede acceder al sistema)</span>
          </label>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" style="background:var(--gray-300);color:var(--gray-800);" onclick="Modal.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar Usuario</button>
        </div>
      </form>
    `;

    document.getElementById('user-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleSave();
    });

    Modal.open();
  },

  showEditModal(id) {
    const user = DB.getUser(id);
    if (!user) {
      App.showToast('Usuario no encontrado', 'error');
      return;
    }

    this.editing = true;
    this.currentId = id;

    document.getElementById('modal-title').textContent = 'Editar Usuario';
    document.getElementById('modal-body').innerHTML = `
      <form id="user-form">
        <div class="form-group">
          <label for="user-name">Nombre Completo *</label>
          <input type="text" id="user-name" value="${user.name}" required>
        </div>
        <div class="form-group">
          <label for="user-email">Correo Electrónico *</label>
          <input type="email" id="user-email" value="${user.email}" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="user-password">Contraseña <small style="color:#999;">(dejar vacío para mantener)</small></label>
            <input type="password" id="user-password" placeholder="••••••••">
          </div>
          <div class="form-group">
            <label for="user-role">Rol</label>
            <select id="user-role">
              <option value="operator" ${user.role === 'operator' ? 'selected' : ''}>Operador</option>
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrador</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="user-active" ${user.active ? 'checked' : ''}>
            <span>Activo (puede acceder al sistema)</span>
          </label>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" style="background:var(--gray-300);color:var(--gray-800);" onclick="Modal.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Actualizar Usuario</button>
        </div>
      </form>
    `;

    document.getElementById('user-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleSave();
    });

    Modal.open();
  },

  _handleSave() {
    const name = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;
    const active = document.getElementById('user-active').checked;

    if (!name || !email) {
      App.showToast('Nombre y email son obligatorios', 'error');
      return;
    }

    if (!email.includes('@')) {
      App.showToast('Ingresa un email válido', 'error');
      return;
    }

    if (!this.editing && !password) {
      App.showToast('La contraseña es obligatoria', 'error');
      return;
    }

    const data = { name, email, role, active };
    if (password) data.password = password;

    if (this.editing) {
      DB.updateUser(this.currentId, data);
      App.showToast('Usuario actualizado correctamente', 'success');
    } else {
      DB.addUser(data);
      App.showToast('Usuario agregado correctamente', 'success');
    }

    Modal.close();
    this.render();
  },

  confirmDelete(id) {
    const user = DB.getUser(id);
    if (!user) return;

    if (confirm(`¿Estás seguro de eliminar al usuario "${user.name}" (${user.email})?`)) {
      DB.deleteUser(id);
      App.showToast('Usuario eliminado', 'info');
      this.render();
    }
  }
};