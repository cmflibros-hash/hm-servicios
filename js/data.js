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
      db = this._createSeed();
      this._save(db);
    } else {
      // Ensure migrations for existing DBs
      let changed = false;
      if (!db.movements) { db.movements = []; changed = true; }
      if (!db.nextId.movements) { db.nextId.movements = 1; changed = true; }
      if (changed) this._save(db);
    }
    return db;
  },

  // Seed data focused on compressor technical service
  _createSeed() {
    const now = new Date();
    const daysAgo = (d) => {
      const dt = new Date(now);
      dt.setDate(dt.getDate() - d);
      return dt;
    };

    const products = [
      // ---- Compresores ----
      { id: '1', sku: 'SKU-001', name: 'Compresor Tornillo GA-15 15HP', category: 'Compresores', quantity: 2, minStock: 1, criticalStock: 0, description: 'Compresor de tornillo Atlas Copco GA-15 15HP 380V trifásico con secador integrado' },
      { id: '2', sku: 'SKU-002', name: 'Compresor Tornillo GA-22 30HP', category: 'Compresores', quantity: 1, minStock: 1, criticalStock: 0, description: 'Compresor de tornillo Atlas Copco GA-22 30HP 380V con variador de velocidad' },
      { id: '3', sku: 'SKU-003', name: 'Compresor Pistón LE-5 5.5HP', category: 'Compresores', quantity: 3, minStock: 2, criticalStock: 1, description: 'Compresor de pistón Atlas Copco LE-5 5.5HP monofásico 220V tanque 270L' },
      { id: '4', sku: 'SKU-004', name: 'Compresor Pistón LE-3 3HP', category: 'Compresores', quantity: 4, minStock: 2, criticalStock: 1, description: 'Compresor de pistón Atlas Copco LE-3 3HP monofásico tanque 200L' },

      // ---- Filtración ----
      { id: '5', sku: 'SKU-005', name: 'Filtro de Aceite Tornillo 1622-0112-00', category: 'Filtración', quantity: 18, minStock: 25, criticalStock: 10, description: 'Filtro de aceite original Atlas Copco 1622-0112-00 para compresores GA' },
      { id: '6', sku: 'SKU-006', name: 'Filtro de Aire Interior 1622-0139-00', category: 'Filtración', quantity: 14, minStock: 20, criticalStock: 8, description: 'Filtro de aire interior Atlas Copco 1622-0139-00 para GA-15/22' },
      { id: '7', sku: 'SKU-007', name: 'Filtro de Aire Exterior 1622-0140-00', category: 'Filtración', quantity: 12, minStock: 20, criticalStock: 8, description: 'Filtro de aire exterior Atlas Copco 1622-0140-00 para GA-15/22' },
      { id: '8', sku: 'SKU-008', name: 'Separador Aceite/Aire GA-15 1622-0109-00', category: 'Filtración', quantity: 5, minStock: 8, criticalStock: 3, description: 'Separador de aceite/aire para GA-15, código Atlas Copco 1622-0109-00' },
      { id: '9', sku: 'SKU-009', name: 'Separador Aceite/Aire GA-22 1622-0110-00', category: 'Filtración', quantity: 3, minStock: 6, criticalStock: 2, description: 'Separador de aceite/aire para GA-22, código Atlas Copco 1622-0110-00' },
      { id: '10', sku: 'SKU-010', name: 'Filtro de Línea 1/2" NPT', category: 'Filtración', quantity: 22, minStock: 30, criticalStock: 10, description: 'Filtro coalescente de línea 1/2" NPT con purga manual' },

      // ---- Lubricación ----
      { id: '11', sku: 'SKU-011', name: 'Aceite Sintético Roto 15 (20L)', category: 'Lubricación', quantity: 12, minStock: 20, criticalStock: 5, description: 'Aceite sintético Atlas Copco Roto 15 ISO VG 46 para compresores tornillo (20L)' },
      { id: '12', sku: 'SKU-012', name: 'Aceite Mineral LE (5L)', category: 'Lubricación', quantity: 18, minStock: 25, criticalStock: 10, description: 'Aceite mineral Atlas Copco LE ISO VG 68 para compresores pistón LE (5L)' },
      { id: '13', sku: 'SKU-013', name: 'Grasa Alta Temperatura Rodamientos', category: 'Lubricación', quantity: 8, minStock: 12, criticalStock: 4, description: 'Grasa especial alta temperatura SKF para rodamientos de motor compresor' },

      // ---- Mecánico ----
      { id: '14', sku: 'SKU-014', name: 'Kit Válvulas Descarga LE-5', category: 'Mecánico', quantity: 4, minStock: 6, criticalStock: 2, description: 'Kit de válvulas de descarga para compresor pistón LE-5 (succión y descarga)' },
      { id: '15', sku: 'SKU-015', name: 'Kit Válvulas Descarga LE-3', category: 'Mecánico', quantity: 5, minStock: 8, criticalStock: 3, description: 'Kit de válvulas de descarga para compresor pistón LE-3' },
      { id: '16', sku: 'SKU-016', name: 'Correas Poly-V GA-15', category: 'Mecánico', quantity: 6, minStock: 10, criticalStock: 3, description: 'Correa Poly-V para transmisión de compresor tornillo GA-15 (juego 4)' },
      { id: '17', sku: 'SKU-017', name: 'Rodamiento Motor GA-15 6306', category: 'Mecánico', quantity: 6, minStock: 10, criticalStock: 4, description: 'Rodamiento SKF 6306 30x72x19mm para motor eléctrico GA-15' },
      { id: '18', sku: 'SKU-018', name: 'Sello Mecánico Eje Tornillo', category: 'Mecánico', quantity: 3, minStock: 5, criticalStock: 2, description: 'Sello mecánico de eje para elemento tornillo GA-15/22' },

      // ---- Eléctrico ----
      { id: '19', sku: 'SKU-019', name: 'Contacto Principal 230V 32A', category: 'Eléctrico', quantity: 5, minStock: 8, criticalStock: 3, description: 'Contactor principal Schütz 32A 230V bobina para tablero compresor' },
      { id: '20', sku: 'SKU-020', name: 'Relé Térmico 12-18A', category: 'Eléctrico', quantity: 4, minStock: 6, criticalStock: 2, description: 'Relé térmico de sobrecarga rango 12-18A para motor compresor 10-15HP' },
      { id: '21', sku: 'SKU-021', name: 'Sensor de Temperatura PT100 4-20mA', category: 'Instrumentación', quantity: 7, minStock: 10, criticalStock: 3, description: 'Sensor PT100 con transmisor 4-20mA para temperatura de descarga compresor' },
      { id: '22', sku: 'SKU-022', name: 'Presostato Diferencial 0.5-10 PSI', category: 'Instrumentación', quantity: 3, minStock: 5, criticalStock: 2, description: 'Presostato diferencial para filtros de línea, rango 0.5-10 PSI' },
      { id: '23', sku: 'SKU-023', name: 'Válvula Solenoide 24V DC Drenaje', category: 'Eléctrico', quantity: 4, minStock: 6, criticalStock: 2, description: 'Válvula solenoide 24V DC para drenaje automático de condensado' },
      { id: '24', sku: 'SKU-024', name: 'Drenaje Automático Temporizado 230V', category: 'Eléctrico', quantity: 2, minStock: 4, criticalStock: 1, description: 'Drenaje automático electrónico temporizado 230V para purga de condensado' },

      // ---- Mantención ----
      { id: '25', sku: 'SKU-025', name: 'Kit Mantención 2000hrs GA-15', category: 'Mantención', quantity: 4, minStock: 6, criticalStock: 2, description: 'Kit completo mant. 2000hrs GA-15: filtros + separador + aceite + correas' },
      { id: '26', sku: 'SKU-026', name: 'Kit Mantención 2000hrs GA-22', category: 'Mantención', quantity: 2, minStock: 4, criticalStock: 1, description: 'Kit completo mant. 2000hrs GA-22: filtros + separador + aceite + correas' },
      { id: '27', sku: 'SKU-027', name: 'Kit Mantención 500hrs LE-5', category: 'Mantención', quantity: 5, minStock: 8, criticalStock: 3, description: 'Kit completo mant. 500hrs LE-5: filtros + aceite + válvulas' },

      // ---- Tuberías ----
      { id: '28', sku: 'SKU-028', name: 'Manguera Alta Presión 1/2" x 1m', category: 'Tuberías', quantity: 15, minStock: 20, criticalStock: 8, description: 'Manguera de alta presión 1/2" NPT x 1 metro con conexiones' },
      { id: '29', sku: 'SKU-029', name: 'Racor Rápido Industrial 1/4"', category: 'Tuberías', quantity: 25, minStock: 30, criticalStock: 12, description: 'Racor rápido tipo industrial 1/4" NPT macho con cierre automático' },
      { id: '30', sku: 'SKU-030', name: 'Válvula de Seguridad 150 PSI 1/2"', category: 'Tuberías', quantity: 6, minStock: 10, criticalStock: 4, description: 'Válvula de seguridad calibrada 150 PSI 1/2" NPT para tanque compresor' },
    ];

    const movements = [];

    // Helper to add a movement and update product stock
    const addMov = (pid, type, qty, daysBefore, obs, dateOverride) => {
      const prod = products.find(p => p.id === pid);
      if (!prod) return;
      const dt = dateOverride ? new Date(dateOverride) : daysAgo(daysBefore);
      const stockBefore = prod.quantity;
      const stockAfter = type === 'entrada' ? stockBefore + qty : stockBefore - qty;
      prod.quantity = stockAfter;

      movements.push({
        id: String(movements.length + 1),
        productId: pid,
        productSku: prod.sku,
        productName: prod.name,
        type: type,
        quantity: qty,
        date: dt.toISOString().split('T')[0],
        observation: obs,
        stockBefore: stockBefore,
        stockAfter: Math.max(0, stockAfter),
        createdAt: dt.toISOString(),
        _deleted: false
      });
    };

    // Reset stocks to initial values for realistic simulation
    const initialStock = {
      '1': 2, '2': 1, '3': 3, '4': 4, '5': 18, '6': 14, '7': 12, '8': 5, '9': 3, '10': 22,
      '11': 12, '12': 18, '13': 8, '14': 4, '15': 5, '16': 6, '17': 6, '18': 3,
      '19': 5, '20': 4, '21': 7, '22': 3, '23': 4, '24': 2, '25': 4, '26': 2, '27': 5,
      '28': 15, '29': 25, '30': 6
    };
    Object.keys(initialStock).forEach(k => { products.find(p => p.id === k).quantity = initialStock[k]; });

    // ---- SIMULATED MOVEMENTS ----
    // Recent: last 30 days

    // SKU-005 Filtro Aceite Tornillo - entradas periódicas
    addMov('5', 'entrada', 20, 2, 'Recepción pedido mensual filtros Atlas Copco, guía 4502');
    addMov('5', 'salida', 4, 5, 'Mant. 2000hrs GA-15 faena Minera Los Bronces, OT 1234');
    addMov('5', 'salida', 4, 8, 'Mant. 2000hrs GA-22 planta Quilicura, OT 1238');
    addMov('5', 'entrada', 15, 12, 'Recepción proveedor Filtros Chile S.A., factura 8821');
    addMov('5', 'salida', 3, 18, 'Mant. preventivo GA-15 cliente Viña Concha y Toro, OT 1245');

    // SKU-011 Aceite Roto 15
    addMov('11', 'entrada', 10, 1, 'Recepción tambores 20L aceite Roto 15, guía 4510');
    addMov('11', 'salida', 3, 6, 'Cambio aceite GA-15 faena Codelco Andina, OT 1236');
    addMov('11', 'salida', 2, 14, 'Mant. correctivo GA-22 Clínica Las Condes, OT 1241');
    addMov('11', 'entrada', 8, 20, 'Recepción aceite sintético pedido 4522');

    // SKU-008 Separador GA-15
    addMov('8', 'entrada', 4, 3, 'Recepción separadores GA-15, guía 4495');
    addMov('8', 'salida', 2, 9, 'Cambio separador GA-15 faena Escondida, OT 1239');
    addMov('8', 'salida', 1, 22, 'Mant. programado GA-15 Municipalidad Vitacura, OT 1247');

    // SKU-009 Separador GA-22
    addMov('9', 'entrada', 3, 4, 'Recepción separadores GA-22, guía 4498');
    addMov('9', 'salida', 1, 11, 'Mant. 2000hrs GA-22 planta CCU Santiago, OT 1240');
    addMov('9', 'salida', 1, 25, 'Cambio separador GA-22 Hospital Sótero del Río, OT 1250');

    // SKU-025 Kit Mant GA-15
    addMov('25', 'entrada', 3, 6, 'Recepción kits mant. 2000hrs GA-15, guía 4505');
    addMov('25', 'salida', 1, 10, 'Kit completo mant. 2000hrs GA-15 Minera Los Pelambres, OT 1242');
    addMov('25', 'salida', 1, 19, 'Kit mant. GA-15 cliente AES Gener, OT 1246');

    // SKU-012 Aceite Mineral LE (salidas frecuentes de servicio en terreno)
    addMov('12', 'salida', 4, 7, 'Cambio aceite LE-5 faena Collahuasi, OT 1237');
    addMov('12', 'salida', 3, 15, 'Mant. 500hrs LE-5 Cementos Bicentenario, OT 1243');
    addMov('12', 'salida', 2, 24, 'Mant. correctivo LE-3 Colegio San Ignacio, OT 1249');
    addMov('12', 'entrada', 15, 16, 'Recepción aceite mineral pedido 4518');

    // SKU-016 Correas GA-15
    addMov('16', 'entrada', 6, 5, 'Recepción correas Poly-V GA-15, guía 4500');
    addMov('16', 'salida', 2, 13, 'Cambio correas GA-15 Viña Errázuriz, OT 1244');

    // SKU-019 Contactor 230V
    addMov('19', 'entrada', 5, 8, 'Recepción materiales eléctricos, guía 4512');
    addMov('19', 'salida', 2, 21, 'Reparación tablero GA-22 Sony Chile, OT 1248');

    // SKU-023 Válvula Solenoide
    addMov('23', 'entrada', 4, 10, 'Recepción válvulas solenoide 24V DC, guía 4515');
    addMov('23', 'salida', 1, 23, 'Reemplazo válvula drenaje GA-15 Mall Costanera, OT 1251');

    // SKU-028 Manguera Alta Presión
    addMov('28', 'salida', 5, 11, 'Recambio mangueras instalación faena Los Bronces, OT 1240');
    addMov('28', 'entrada', 10, 14, 'Recepción mangueras alta presión, guía 4520');

    // SKU-003 Compresor Pistón LE-5 (venta / entrada)
    addMov('3', 'salida', 1, 17, 'Venta compresor LE-5 a cliente Particular - Factura 8825');
    addMov('3', 'entrada', 1, 28, 'Ingreso bodega compresor LE-5 reparado desde taller servicio');

    // SKU-030 Válvula Seguridad
    addMov('30', 'entrada', 6, 9, 'Recepción válvulas seguridad calibradas, guía 4513');
    addMov('30', 'salida', 2, 27, 'Cambio válvulas seguridad tanque 500L cliente Carozzi, OT 1252');

    // Final recompute product quantities based on seed data
    products.forEach(p => { p.quantity = initialStock[p.id]; });
    movements.forEach(m => {
      const prod = products.find(p => p.id === m.productId);
      if (!prod) return;
      prod.quantity = m.type === 'entrada'
        ? prod.quantity + m.quantity
        : prod.quantity - m.quantity;
    });

    return {
      products,
      recipients: [
        { id: '1', name: 'Carlos Muñoz', email: 'carlos@hmservicios.cl', active: true, createdAt: now.toISOString() },
        { id: '2', name: 'Ana Soto', email: 'ana@hmservicios.cl', active: true, createdAt: now.toISOString() },
        { id: '3', name: 'Pedro Ramírez', email: 'pedro@hmservicios.cl', active: true, createdAt: now.toISOString() },
      ],
      users: [
        { id: '1', name: 'Admin HM', email: 'admin@hmservicios.cl', role: 'admin', active: true, createdAt: now.toISOString() },
        { id: '2', name: 'Jefe Bodega', email: 'bodega@hmservicios.cl', role: 'operator', active: true, createdAt: now.toISOString() },
        { id: '3', name: 'Técnico Terreno', email: 'tecnico@hmservicios.cl', role: 'operator', active: true, createdAt: now.toISOString() },
      ],
      movements,
      nextId: { products: 31, recipients: 4, users: 4, movements: movements.length + 1 }
    };
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

  // ---- MOVEMENTS (Entrada/Salida) ----
  addMovement(movement) {
    const db = this._ensure();
    movement.id = String(db.nextId.movements++);
    movement.createdAt = new Date().toISOString();
    movement._deleted = false;
    db.movements.push(movement);
    this._save(db);
    return movement;
  },

  getMovements() {
    const db = this._ensure();
    return db.movements.filter(m => !m._deleted).reverse();
  },

  getProductMovements(productId) {
    const db = this._ensure();
    return db.movements.filter(m => m.productId === productId && !m._deleted).reverse();
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