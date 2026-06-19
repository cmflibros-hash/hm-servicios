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
          { id: '1', sku: 'SKU-001', name: 'Compresor Tornillo 10HP', category: 'Compresores', quantity: 2, minStock: 1, criticalStock: 0, description: 'Compresor de tornillo 10HP trifásico 380V con tanque 500L' },
          { id: '2', sku: 'SKU-002', name: 'Compresor Pistón 5HP', category: 'Compresores', quantity: 3, minStock: 2, criticalStock: 1, description: 'Compresor de pistón 5HP monofásico con tanque 200L' },
          { id: '3', sku: 'SKU-003', name: 'Filtro de Aire Línea', category: 'Filtración', quantity: 12, minStock: 20, criticalStock: 5, description: 'Filtro de línea de aire 1/2" NPT con elemento coalescente' },
          { id: '4', sku: 'SKU-004', name: 'Filtro de Aceite Spin-On', category: 'Filtración', quantity: 8, minStock: 15, criticalStock: 5, description: 'Filtro de aceite rosca 1"-12 para compresores Atlas Copco' },
          { id: '5', sku: 'SKU-005', name: 'Separador Aceite/Aire', category: 'Filtración', quantity: 4, minStock: 6, criticalStock: 2, description: 'Separador de aceite para compresor de tornillo 10-15HP' },
          { id: '6', sku: 'SKU-006', name: 'Aceite Sintético ISO 46', category: 'Lubricación', quantity: 25, minStock: 30, criticalStock: 10, description: 'Aceite sintético para compresores de tornillo ISO VG 46 (20L)' },
          { id: '7', sku: 'SKU-007', name: 'Aceite Mineral ISO 68', category: 'Lubricación', quantity: 10, minStock: 15, criticalStock: 5, description: 'Aceite mineral para compresores de pistón ISO VG 68 (5L)' },
          { id: '8', sku: 'SKU-008', name: 'Correas Trapezoidales B-85', category: 'Mecánico', quantity: 6, minStock: 10, criticalStock: 3, description: 'Correa trapezoidal perfil B, largo 85 pulgadas (juego 3)' },
          { id: '9', sku: 'SKU-009', name: 'Válvula de Seguridad 150PSI', category: 'Mecánico', quantity: 5, minStock: 8, criticalStock: 3, description: 'Válvula de seguridad calibrada 150 PSI 1/2" NPT' },
          { id: '10', sku: 'SKU-010', name: 'Válvula Solenoide 24V', category: 'Eléctrico', quantity: 3, minStock: 5, criticalStock: 2, description: 'Válvula solenoide 24V DC para drenaje automático' },
          { id: '11', sku: 'SKU-011', name: 'Manómetro Glicerina 0-300 PSI', category: 'Instrumentación', quantity: 7, minStock: 10, criticalStock: 3, description: 'Manómetro de glicerina 2.5" rango 0-300 PSI 1/4" NPT' },
          { id: '12', sku: 'SKU-012', name: 'Presostato Diferencial', category: 'Instrumentación', quantity: 2, minStock: 4, criticalStock: 1, description: 'Presostato diferencial para filtros de línea 0.5-10 PSI' },
          { id: '13', sku: 'SKU-013', name: 'Termostato de Seguridad', category: 'Instrumentación', quantity: 4, minStock: 6, criticalStock: 2, description: 'Termostato de seguridad 90°C normalmente cerrado' },
          { id: '14', sku: 'SKU-014', name: 'Kit de Mantención 500hrs', category: 'Mantención', quantity: 3, minStock: 5, criticalStock: 2, description: 'Kit completo mantención 500hrs: filtros + aceite + correas' },
          { id: '15', sku: 'SKU-015', name: 'Kit de Mantención 2000hrs', category: 'Mantención', quantity: 1, minStock: 3, criticalStock: 1, description: 'Kit completo mantención 2000hrs: separador + filtros + aceite' },
          { id: '16', sku: 'SKU-016', name: 'Manguera Alta Presión 1/2"', category: 'Tuberías', quantity: 20, minStock: 30, criticalStock: 10, description: 'Manguera de alta presión 1/2" x 1 metro con conexiones' },
          { id: '17', sku: 'SKU-017', name: 'Racores Rápidos 1/4"', category: 'Tuberías', quantity: 15, minStock: 25, criticalStock: 10, description: 'Racores rápidos tipo industrial 1/4" NPT macho' },
          { id: '18', sku: 'SKU-018', name: 'Drenaje Automático Electrónico', category: 'Eléctrico', quantity: 2, minStock: 4, criticalStock: 1, description: 'Drenaje automático temporizado 230V para purga de condensado' },
          { id: '19', sku: 'SKU-019', name: 'Sensor de Temperatura PT100', category: 'Instrumentación', quantity: 5, minStock: 8, criticalStock: 3, description: 'Sensor PT100 con transmisor 4-20mA para compresores' },
          { id: '20', sku: 'SKU-020', name: 'Rodamiento SKF 6205', category: 'Mecánico', quantity: 10, minStock: 15, criticalStock: 5, description: 'Rodamiento rígido de bolas SKF 6205 25x52x15mm' },
        ],
        recipients: [
          { id: '1', name: 'Carlos Muñoz', email: 'carlos@hmservicios.cl', active: true, createdAt: new Date().toISOString() },
          { id: '2', name: 'Ana Soto', email: 'ana@hmservicios.cl', active: true, createdAt: new Date().toISOString() },
          { id: '3', name: 'Pedro Ramírez', email: 'pedro@hmservicios.cl', active: true, createdAt: new Date().toISOString() },
        ],
        users: [
          { id: '1', name: 'Admin HM', email: 'admin@hmservicios.cl', role: 'admin', active: true, createdAt: new Date().toISOString() },
          { id: '2', name: 'Jefe Bodega', email: 'bodega@hmservicios.cl', role: 'operator', active: true, createdAt: new Date().toISOString() },
          { id: '3', name: 'Técnico Terreno', email: 'tecnico@hmservicios.cl', role: 'operator', active: true, createdAt: new Date().toISOString() },
        ],
        nextId: { products: 21, recipients: 4, users: 4 }
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