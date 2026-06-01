// ===== PRODUCTOS POR DEFECTO =====
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Elf Bar BC5000",
    category: "desechable",
    price: 45000,
    oldPrice: 55000,
    emoji: "💨",
    img: null,
    desc: "5000 puffs, 13ml de líquido, batería recargable 650mAh. Disponible en más de 20 sabores.",
    badge: "hot", badgeLabel: "HOT",
    stock: 30, featured: true
  },
  {
    id: 2,
    name: "Lost Mary MO5000",
    category: "desechable",
    price: 48000,
    oldPrice: null,
    emoji: "🌬️",
    img: null,
    desc: "5000 puffs con malla de doble núcleo. Sabor intenso y duradero. Batería tipo C recargable.",
    badge: "new", badgeLabel: "NUEVO",
    stock: 25, featured: true
  },
  {
    id: 3,
    name: "Vaporesso XROS 4",
    category: "pod",
    price: 120000,
    oldPrice: 150000,
    emoji: "🔋",
    img: null,
    desc: "Pod system recargable 1000mAh, pantalla OLED, potencia ajustable 1–16W, pods de 2ml.",
    badge: "sale", badgeLabel: "OFERTA",
    stock: 12, featured: true
  },
  {
    id: 4,
    name: "Sales Nic Mango Ice 30ml",
    category: "liquido",
    price: 28000,
    oldPrice: null,
    emoji: "🧪",
    img: null,
    desc: "Sales de nicotina 50mg/ml. Sabor mango con toque de hielo. Fórmula suave para pods.",
    badge: null, badgeLabel: null,
    stock: 50, featured: false
  },
  {
    id: 5,
    name: "SMOK Nord 5",
    category: "pod",
    price: 135000,
    oldPrice: null,
    emoji: "⚡",
    img: null,
    desc: "80W de potencia, batería 2000mAh, pantalla TFT a color, compatible con coils RPM y Nord.",
    badge: null, badgeLabel: null,
    stock: 8, featured: false
  },
  {
    id: 6,
    name: "Coils RPM 0.4Ω x5",
    category: "accesorio",
    price: 22000,
    oldPrice: null,
    emoji: "🔧",
    img: null,
    desc: "Pack x5 resistencias RPM mesh 0.4Ω. Compatibles con SMOK Nord, RPM2 y derivados.",
    badge: null, badgeLabel: null,
    stock: 60, featured: false
  }
];

const DEFAULT_CATEGORIES = [
  { id: "desechable", label: "Desechables", emoji: "💨" },
  { id: "pod",        label: "Pod Systems",  emoji: "🔋" },
  { id: "liquido",    label: "E-Liquids",    emoji: "🧪" },
  { id: "mod",        label: "Mods",         emoji: "⚙️" },
  { id: "accesorio",  label: "Accesorios",   emoji: "🔧" }
];

// ===== STORE =====
const ProductStore = {
  getAll() {
    try { const s = localStorage.getItem('cbflow_products'); if (s) return JSON.parse(s); } catch(e) {}
    return DEFAULT_PRODUCTS;
  },
  save(p) { try { localStorage.setItem('cbflow_products', JSON.stringify(p)); } catch(e) {} },
  nextId() { const p = this.getAll(); return p.length ? Math.max(...p.map(x => x.id)) + 1 : 1; },
  add(p) { const all = this.getAll(); p.id = this.nextId(); all.push(p); this.save(all); return p; },
  update(id, data) { const all = this.getAll(); const i = all.findIndex(p => p.id === id); if (i !== -1) { all[i] = { ...all[i], ...data }; this.save(all); } },
  delete(id) { this.save(this.getAll().filter(p => p.id !== id)); }
};

const CategoryStore = {
  getAll() {
    try { const s = localStorage.getItem('cbflow_cats'); if (s) return JSON.parse(s); } catch(e) {}
    return DEFAULT_CATEGORIES;
  },
  save(c) { try { localStorage.setItem('cbflow_cats', JSON.stringify(c)); } catch(e) {} },
  add(c) { const all = this.getAll(); if (!all.find(x => x.id === c.id)) { all.push(c); this.save(all); } },
  delete(id) { this.save(this.getAll().filter(c => c.id !== id)); }
};
