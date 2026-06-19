/* ==========================================
   HM Servicios - App Principal
   ========================================== */

const App = {
  currentModule: 'inventory',

  init() {
    this.setupNavigation();
    this.setupModal();
    this.setupAddButton();
    this.loadModule('inventory');
  },

  setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const module = btn.dataset.module;
        this.loadModule(module);
      });
    });
  },

  setupModal() {
    // Close modal on backdrop click
    document.getElementById('modal-backdrop').addEventListener('click', () => {
      Modal.close();
      this.closeDetailModal();
    });

    // Close modal on X button
    document.getElementById('modal-close').addEventListener('click', () => {
      Modal.close();
    });

    // Close detail modal on X button
    document.getElementById('detail-close').addEventListener('click', () => {
      this.closeDetailModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        Modal.close();
        this.closeDetailModal();
      }
    });
  },

  setupAddButton() {
    document.getElementById('btn-add').addEventListener('click', () => {
      switch (this.currentModule) {
        case 'inventory':
          InventoryModule.showAddModal();
          break;
        case 'recipients':
          RecipientsModule.showAddModal();
          break;
        case 'users':
          UsersModule.showAddModal();
          break;
      }
    });
  },

  loadModule(module) {
    this.currentModule = module;

    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.module === module);
    });

    // Update title
    const titles = {
      inventory: 'Inventario',
      recipients: 'Destinatarios',
      users: 'Usuarios'
    };
    document.getElementById('module-title').textContent = titles[module] || 'Inventario';

    // Show/hide add button based on module
    const addBtn = document.getElementById('btn-add');
    addBtn.style.display = 'flex';

    // Render module
    switch (module) {
      case 'inventory':
        InventoryModule.render();
        addBtn.innerHTML = '<span>+</span> Agregar Producto';
        break;
      case 'recipients':
        RecipientsModule.render();
        addBtn.innerHTML = '<span>+</span> Agregar Destinatario';
        break;
      case 'users':
        UsersModule.render();
        addBtn.innerHTML = '<span>+</span> Agregar Usuario';
        break;
    }
  },

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');

    // Auto-hide after 3 seconds
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  },

  closeDetailModal() {
    document.getElementById('detail-modal').classList.add('hidden');
    document.getElementById('modal-backdrop').classList.add('hidden');
  }
};

// Modal helper
const Modal = {
  open() {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modal-backdrop').classList.remove('hidden');
  },

  close() {
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('modal-backdrop').classList.add('hidden');
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});