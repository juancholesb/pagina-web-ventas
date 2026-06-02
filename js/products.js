// ===== PRODUCTOS POR DEFECTO =====
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Elf Bar BC5000 Cyber",
    category: "desechable",
    price: 45000,
    oldPrice: 55000,
    emoji: "💨",
    img: null,
    description: "5000 puffs con diseño ultra estilizado, 13ml de líquido, batería recargable de 650mAh. Sabor intenso de fresa kiwi con un golpe helado.",
    badge: "hot",
    badgeLabel: "HOT 🔥",
    stock: 30,
    featured: true
  },
  {
    id: 2,
    name: "Lost Mary MO5000 Tech",
    category: "desechable",
    price: 48000,
    oldPrice: null,
    emoji: "🌬️",
    img: null,
    description: "5000 puffs de sabor premium con resistencia de malla dual. Diseño ergonómico transparente con luz LED indicadora al inhalar.",
    badge: "new",
    badgeLabel: "NUEVO ✨",
    stock: 25,
    featured: true
  },
  {
    id: 3,
    name: "Vaporesso XROS 4 Pro",
    category: "pod",
    price: 120000,
    oldPrice: 150000,
    emoji: "🔋",
    img: null,
    description: "El Pod System definitivo de 1000mAh. Cuenta con pantalla OLED futurista, potencia ajustable de 1-30W y control deslizante de flujo de aire premium.",
    badge: "sale",
    badgeLabel: "OFERTA ⚡",
    stock: 12,
    featured: true
  },
  {
    id: 4,
    name: "Sales Nic Mango Ice 30ml",
    category: "liquido",
    price: 28000,
    oldPrice: null,
    emoji: "🧪",
    img: null,
    description: "Sales de nicotina de 50mg/ml con sabor intenso a mango tropical y un toque de mentol refrescante. Perfectas para tus dispositivos pod.",
    badge: null,
    badgeLabel: null,
    stock: 50,
    featured: false
  },
  {
    id: 5,
    name: "SMOK Nord 5 Cyber",
    category: "pod",
    price: 135000,
    oldPrice: null,
    emoji: "⚡",
    img: null,
    description: "Hasta 80W de potencia pura, batería de 2000mAh integrada y pantalla digital a color. Excelente producción de vapor y compatibilidad con resistencias RPM3.",
    badge: null,
    badgeLabel: null,
    stock: 8,
    featured: false
  },
  {
    id: 6,
    name: "Coils RPM3 0.15Ω x5",
    category: "accesorio",
    price: 22000,
    oldPrice: null,
    emoji: "🔧",
    img: null,
    description: "Pack de 5 resistencias de malla RPM3 de 0.15 ohmios. Diseñadas para una óptima transferencia de sabor y una densa nube de vapor.",
    badge: null,
    badgeLabel: null,
    stock: 60,
    featured: false
  }
];
const DEFAULT_CATEGORIES = [
  { id: "desechable", label: "Desechables", emoji: "💨" },
  { id: "pod",        label: "Pod Systems",  emoji: "🔋" },
  { id: "liquido",    label: "E-Liquids",    emoji: "🧪" },
  { id: "mod",        label: "Mods",         emoji: "⚙️" },
  { id: "accesorio",  label: "Accesorios",   emoji: "🔧" }
];
// ===== STORE (ALMACÉN DE DATOS EN LOCALSTORAGE Y SINCRONIZACIÓN SUPABASE) =====
const ProductStore = {
  cache: null,

  async init() {
    if (this.cache) return this.cache;
    if (SupabaseStore.isConfigured()) {
      await SupabaseStore.syncToLocal();
      // Iniciar suscripciones en tiempo real para actualizar clientes automáticamente
      if (typeof SupabaseStore.startRealtime === 'function') {
        SupabaseStore.startRealtime();
      }
      // Si realtime no quedó activo, arrancar polling como fallback
      if (!SupabaseStore._realtimeStarted && typeof SupabaseStore.startPolling === 'function') {
        SupabaseStore.startPolling(15000); // cada 15s
      }
    }
    this.cache = this.getAllLocal();
    return this.cache;
  },

  getAllLocal() {
    try {
      const s = localStorage.getItem('cbflow_products');
      if (s) {
        const products = JSON.parse(s);
        return products.map(p => {
          if (!p.description && p.desc) {
            return { ...p, description: p.desc };
          }
          return p;
        });
      }
    } catch(e) {}
    this.save(DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
  },

  getAll() {
    return this.cache || this.getAllLocal();
  },

  save(p) {
    this.cache = p;
    try {
      localStorage.setItem('cbflow_products', JSON.stringify(p));
    } catch(e) {}
  },

  nextId() {
    const p = this.getAll();
    return p.length ? Math.max(...p.map(x => x.id)) + 1 : 1;
  },

  add(p) {
    const all = this.getAll();
    p.id = this.nextId();
    all.push(p);
    this.save(all);
    if (SupabaseStore.isConfigured()) {
      SupabaseStore.saveProduct(p);
    }
    return p;
  },

  update(id, data) {
    const all = this.getAll();
    const i = all.findIndex(p => p.id === id);
    if (i !== -1) {
      all[i] = { ...all[i], ...data };
      this.save(all);
      if (SupabaseStore.isConfigured()) {
        SupabaseStore.saveProduct(all[i]);
      }
    }
  },

  delete(id) {
    const remaining = this.getAll().filter(p => p.id !== id);
    this.save(remaining);
    if (SupabaseStore.isConfigured()) {
      SupabaseStore.deleteProduct(id);
    }
  }
};
const CategoryStore = {
  cache: null,

  async init() {
    if (this.cache) return this.cache;
    if (SupabaseStore.isConfigured()) {
      await SupabaseStore.syncToLocal();
    }
    this.cache = this.getAllLocal();
    return this.cache;
  },

  getAllLocal() {
    try {
      const s = localStorage.getItem('cbflow_cats');
      if (s) return JSON.parse(s);
    } catch(e) {}
    this.save(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  },

  getAll() {
    return this.cache || this.getAllLocal();
  },

  save(c) {
    this.cache = c;
    try {
      localStorage.setItem('cbflow_cats', JSON.stringify(c));
    } catch(e) {}
  },

  add(c) {
    const all = this.getAll();
    if (!all.find(x => x.id === c.id)) {
      all.push(c);
      this.save(all);
    }
  },

  delete(id) {
    this.save(this.getAll().filter(c => c.id !== id));
  }
};
const AdminStore = {
  getCredentials() {
    try {
      const s = localStorage.getItem('cbflow_admin_creds');
      if (s) return JSON.parse(s);
    } catch(e) {}
    const defaults = { email: "admin@cbflow.tech", pass: "cbflow2025" };
    this.saveCredentials(defaults);
    return defaults;
  },
  saveCredentials(creds) {
    try {
      localStorage.setItem('cbflow_admin_creds', JSON.stringify(creds));
    } catch(e) {}
  }
};
