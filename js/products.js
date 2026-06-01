// ===== DEFAULT PRODUCTS (se cargan si no hay datos en localStorage) =====
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "AirPods Pro Max",
    category: "audio",
    categoryLabel: "Audio",
    price: 350000,
    oldPrice: 420000,
    emoji: "🎧",
    desc: "Auriculares inalámbricos premium con cancelación activa de ruido, sonido Hi-Fi y hasta 30 horas de batería. Conectividad Bluetooth 5.3.",
    badge: "sale",
    badgeLabel: "OFERTA",
    stock: 15,
    featured: true
  },
  {
    id: 2,
    name: "SmartWatch Ultra",
    category: "movil",
    categoryLabel: "Móvil",
    price: 280000,
    oldPrice: null,
    emoji: "⌚",
    desc: "Reloj inteligente con GPS integrado, monitor cardíaco, SpO2, pantalla AMOLED y resistencia al agua IP68.",
    badge: "new",
    badgeLabel: "NUEVO",
    stock: 22,
    featured: true
  },
  {
    id: 3,
    name: "Teclado Mecánico RGB",
    category: "computacion",
    categoryLabel: "Computación",
    price: 180000,
    oldPrice: null,
    emoji: "⌨️",
    desc: "Teclado mecánico gamer con switches red, iluminación RGB por tecla, anti-ghosting y construcción en aluminio.",
    badge: null,
    badgeLabel: null,
    stock: 30,
    featured: false
  },
  {
    id: 4,
    name: "Cámara de Seguridad 4K",
    category: "smart",
    categoryLabel: "Smart Home",
    price: 150000,
    oldPrice: 195000,
    emoji: "📷",
    desc: "Cámara IP Wi-Fi 4K con visión nocturna, detección de movimiento, almacenamiento en nube y app móvil.",
    badge: "sale",
    badgeLabel: "OFERTA",
    stock: 18,
    featured: true
  },
  {
    id: 5,
    name: "Mouse Gamer Pro",
    category: "gaming",
    categoryLabel: "Gaming",
    price: 95000,
    oldPrice: null,
    emoji: "🖱️",
    desc: "Mouse ergonómico con sensor óptico de 25600 DPI, 8 botones programables, RGB y cable trenzado.",
    badge: null,
    badgeLabel: null,
    stock: 45,
    featured: false
  },
  {
    id: 6,
    name: "Cable USB-C 240W",
    category: "accesorios",
    categoryLabel: "Accesorios",
    price: 35000,
    oldPrice: null,
    emoji: "🔌",
    desc: "Cable USB-C a USB-C con soporte hasta 240W de carga rápida, transferencia de datos 40Gbps y longitud de 2 metros.",
    badge: "new",
    badgeLabel: "NUEVO",
    stock: 100,
    featured: false
  },
  {
    id: 7,
    name: "Parlante Bluetooth 360°",
    category: "audio",
    categoryLabel: "Audio",
    price: 220000,
    oldPrice: 265000,
    emoji: "🔊",
    desc: "Altavoz portátil con sonido 360° envolvente, resistencia al agua IPX7, 20 horas de batería y carga USB-C.",
    badge: "sale",
    badgeLabel: "OFERTA",
    stock: 12,
    featured: true
  },
  {
    id: 8,
    name: "Hub USB-C 10 en 1",
    category: "computacion",
    categoryLabel: "Computación",
    price: 120000,
    oldPrice: null,
    emoji: "🔗",
    desc: "Hub multipuerto con HDMI 4K, 3x USB-A 3.0, USB-C PD 100W, lector SD/MicroSD, Ethernet y audio 3.5mm.",
    badge: "new",
    badgeLabel: "NUEVO",
    stock: 25,
    featured: false
  }
];

// ===== PRODUCT STORE =====
const ProductStore = {
  getAll() {
    try {
      const saved = localStorage.getItem('cbflow_products');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return DEFAULT_PRODUCTS;
  },
  save(products) {
    try { localStorage.setItem('cbflow_products', JSON.stringify(products)); } catch(e) {}
  },
  getNextId() {
    const products = this.getAll();
    return products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  },
  add(product) {
    const products = this.getAll();
    product.id = this.getNextId();
    products.push(product);
    this.save(products);
    return product;
  },
  update(id, data) {
    const products = this.getAll();
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) { products[idx] = { ...products[idx], ...data }; this.save(products); }
  },
  delete(id) {
    const products = this.getAll().filter(p => p.id !== id);
    this.save(products);
  }
};
