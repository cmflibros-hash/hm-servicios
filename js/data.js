/* ==========================================
   HM Servicios - Data Layer (localStorage)
   ========================================== */

const DB = {
  _key: 'hm_servicios_db',

  _get() {
    const raw = localStorage.getItem(this._key);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },

  _save(data) {
    localStorage.setItem(this._key, JSON.stringify(data));
  },

  _ensure() {
    let db = this._get();
    if (!db) {
      db = {
        products: [
          { id: '1', sku: 'SKU-001', name: 'Cables HDMI 2.1', category: 'Electrónica', quantity: 5, minStock: 10, criticalStock: 3, description: 'Cables HDMI 2.1 de 2 metros', createdAt: new Date().toISOString() },
          { id: '2', sku: 'SKU-002', name: 'Tornillos M8 x 30mm', category: 'Ferretería', quantity: 200, minStock: 50, criticalStock: 20, description: 'Tornillos acero inoxidable M8', createdAt: new Date().toISOString() },
          { id: '3', sku: 'SKU-003', name: 'Cajas de cartón 40x30', category: 'Embalaje', quantity: 15, minStock: 25, criticalStock: 10, description: 'Cajas de cartón corrugado', createdAt: new Date().toISOString() },
          { id: '4', sku: 'SKU-004', name: 'Baterías AA (pack 12)', category: 'Electrónica', quantity: 3, minStock: 20, criticalStock: 5, description: 'Baterías alcalinas AA pack 12 unidades', createdAt: new Date().toISOString() },
          { id: '5', sku: 'SKU-005', name: 'Guantes de seguridad', category: 'Seguridad', quantity: 30, minStock: 15, criticalStock: 5, description: 'Guantes de nitrilo talla L', createdAt: new Date().toISOString() },
        ],
        recipients: [
          { id: '1', name: 'Juan Pérez', email: 'juan@hmservicios.cl', active: true, createdAt: new Date().toISOString() },
          { id: '2', name: 'María González', email: 'maria@hmservicios.cl', active: true, createdAt: new Date().toISOString() },
        ],
        users: [
          { id: '1', name: 'Admin HM', email: 'admin@hmservicios.cl', role: 'admin', active: true, createdAt: new Date().toISOString() },
          { id: '2', name: 'Bodeguero 1', email: 'bodega@hmservicios.cl', role: 'operator', active: true, createdAt: new Date().toISOString() },
        ],
        nextId: { products: 6, recipients: 3, users: 3 }
      };
      this._save(db);
    }
    return db;
  },

  // ---- PRODUCTS ----
  getProducts() {
    const db = this._ensure();
    return db.products.filter(p => !p._deleted);
  },

  getProduct(id) {
    const db = this._ensure();
    return db.products.find(p => p.id === id && !p._deleted) || null;
  },

  addProduct(product) {
    const db = this._ensure();
    product.id = String(db.nextId.products++);
    product.createdAt = new Date().toISOString();
    product._deleted = false;
    db.products.push(product);
    this._save(db);
    return product;
  },

  updateProduct(id, updates) {
    const db = this._ensure();
    const idx = db.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    db.products[idx] = { ...db.products[idx], ...updates };
    this._save(db);
    return db.products[idx];
  },

  deleteProduct(id) {
    const db = this._ensure();
    const idx = db.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    db.products[idx]._deleted = true;
    this._save(db);
    return true;
  },

  // ---- RECIPIENTS ----
  getRecipients() {
    const db = this._ensure();
    return db.recipients.filter(r => !r._deleted);
  },

  getRecipient(id) {
    const db = this._ensure();
    return db.recipients.find(r => r.id === id && !r._deleted) || null;
  },

  addRecipient(recipient) {
    const db = this._ensure();
    recipient.id = String(db.nextId.recipients++);
    recipient.createdAt = new Date().toISOString();
    recipient._deleted = false;
    db.recipients.push(recipient);
    this._save(db);
    return recipient;
  },

  updateRecipient(id, updates) {
    const db = this._ensure();
    const idx = db.recipients.findIndex(r => r.id === id);
    if (idx === -1) return null;
    db.recipients[idx] = { ...db.recipients[idx], ...updates };
    this._save(db);
    return db.recipients[idx];
  },

  deleteRecipient(id) {
    const db = this._ensure();
    const idx = db.recipients.findIndex(r => r.id === id);
    if (idx === -1) return false;
    db.recipients[idx]._deleted = true;
    this._save(db);
    return true;
  },

  // ---- USERS ----
  getUsers() {
    const db = this._ensure();
    return db.users.filter(u => !u._deleted);
  },

  getUser(id) {
    const db = this._ensure();
    return db.users.find(u => u.id === id && !u._deleted) || null;
  },

  addUser(user) {
    const db = this._ensure();
    user.id = String(db.nextId.users++);
    user.createdAt = new Date().toISOString();
    user._deleted = false;
    db.users.push(user);
    this._save(db);
    return user;
  },

  updateUser(id, updates) {
    const db = this._ensure();
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    db.users[idx] = { ...db.users[idx], ...updates };
    this._save(db);
    return db.users[idx];
  },

  deleteUser(id) {
    const db = this._ensure();
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    db.users[idx]._deleted = true;
    this._save(db);
    return true;
  }
};