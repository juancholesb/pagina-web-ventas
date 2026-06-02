// ===== CYBERPUNK STOREFRONT CONTROLLER =====
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof ProductStore !== 'undefined' && typeof CategoryStore !== 'undefined') {
    await ProductStore.init();
    await CategoryStore.init();
  }
  initSmokeCanvas();
  initCustomCursor();
  initHero3DInteraction();
  initStorefront();
});
// ==========================================
// 1. EFECTO HUMO INTERACTIVO DE CANVAS
// ==========================================
function initSmokeCanvas() {
  const canvas = document.getElementById('smoke-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let particles = [];
  
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  
  resize();
  window.addEventListener('resize', resize);
  
  class SmokeParticle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 80;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.8 + 0.3);
      this.size = Math.random() * 50 + 40;
      this.alpha = Math.random() * 0.15 + 0.05;
      this.growth = Math.random() * 0.15 + 0.05;
      // Colores cyberpunk para las partículas (morados, magentas, cianes muy diluidos)
      const colors = ['180, 79, 255', '255, 79, 216', '79, 255, 180'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.size += this.growth;
      this.alpha -= 0.0006;
      if (this.alpha <= 0 || this.y < -100) {
        this.reset();
      }
    }
    draw() {
      ctx.save();
      ctx.beginPath();
      let gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
      gradient.addColorStop(0, `rgba(${this.color}, ${this.alpha})`);
      gradient.addColorStop(0.5, `rgba(${this.color}, ${this.alpha * 0.4})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  
  // Crear nube de partículas iniciales en pantalla
  const maxParticles = Math.min(60, Math.floor(window.innerWidth / 20));
  for (let i = 0; i < maxParticles; i++) {
    const p = new SmokeParticle();
    // Pre-simular partículas para que estén repartidas uniformemente desde el inicio
    p.y = Math.random() * height;
    p.alpha = Math.random() * 0.15 + 0.02;
    particles.push(p);
  }
  
  function loop() {
    ctx.clearRect(0, 0, width, height);
    
    // Dibujar y actualizar partículas
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    requestAnimationFrame(loop);
  }
  
  loop();
}
// ==========================================
// 2. CURSOR FLUIDO DE NEÓN
// ==========================================
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;
  
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  
  window.addEventListener('mousemove', e => {
    targetX = e.clientX;
    targetY = e.clientY;
  });
  
  // Animación del cursor por inercia
  function updateCursor() {
    const ease = 0.15;
    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;
    
    cursor.style.left = `${currentX}px`;
    cursor.style.top = `${currentY}px`;
    
    requestAnimationFrame(updateCursor);
  }
  updateCursor();
  
  // Efectos hover en interactivos
  const updateHoverElements = () => {
    document.querySelectorAll('a, button, input, textarea, select, .pcard, .brand-card').forEach(el => {
      if (el.dataset.hasCursorBound) return;
      el.dataset.hasCursorBound = "true";
      
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        if (el.classList.contains('cta-main') || el.classList.contains('checkout-btn')) {
          cursor.style.borderColor = 'transparent';
          cursor.style.background = 'rgba(0, 229, 255, 0.2)';
        } else if (el.classList.contains('cta-wa') || el.classList.contains('wa-big-btn')) {
          cursor.style.borderColor = '#25D366';
          cursor.style.background = 'rgba(37, 211, 102, 0.1)';
        }
      });
      
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
        cursor.style.borderColor = '';
        cursor.style.background = '';
      });
    });
  };
  
  updateHoverElements();
  // Volver a vincular para elementos dinámicos
  window.addEventListener('contentUpdated', updateHoverElements);
}
// ==========================================
// 3. INTERACCIÓN 3D EN EL HERO
// ==========================================
function initHero3DInteraction() {
  const scene = document.getElementById('vaper-scene');
  const wrapper = scene ? scene.querySelector('.vaper-3d-wrapper') : null;
  if (!scene || !wrapper) return;
  
  let width = scene.clientWidth;
  let height = scene.clientHeight;
  
  window.addEventListener('resize', () => {
    width = scene.clientWidth;
    height = scene.clientHeight;
  });
  
  scene.addEventListener('mousemove', e => {
    const rect = scene.getBoundingClientRect();
    const x = e.clientX - rect.left; // posición x del cursor dentro de la escena
    const y = e.clientY - rect.top;  // posición y del cursor dentro de la escena
    
    // Convertir a porcentajes de desviación del centro (-1 a 1)
    const ax = -(width / 2 - x) / (width / 2);
    const ay = (height / 2 - y) / (height / 2);
    
    // Rotar escena 3D en base al ratón (máximo 15 grados de rotación)
    wrapper.style.transform = `rotateY(${ax * 20}deg) rotateX(${ay * 20}deg) translateY(-10px)`;
  });
  
  scene.addEventListener('mouseleave', () => {
    wrapper.style.transform = 'rotateY(0deg) rotateX(0deg) translateY(0px)';
  });
}
// ==========================================
// 4. CONTROLADOR GENERAL DE LA TIENDA
// ==========================================
let cart = [];
function initStorefront() {
  // Cargar categorías y productos dinámicos
  renderCategories();
  renderProducts('all');
  
  // Inicializar Carrito desde LocalStorage
  loadCartFromStorage();
  
  // Elementos del DOM del Carrito
  const cartToggle = document.getElementById('cart-toggle');
  const cartClose = document.getElementById('cart-close');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartSidebar = document.getElementById('cart-sidebar');
  const checkoutBtn = document.getElementById('checkout-btn');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  
  // Toggle Menú Hamburguesa
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      hamburger.classList.toggle('active');
    });
    
    // Cerrar menú al hacer clic en enlaces
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
      });
    });
  }
  
  // Eventos de visualización del Carrito
  const openCart = () => {
    cartSidebar.classList.add('on');
    cartOverlay.classList.add('on');
  };
  
  const closeCart = () => {
    cartSidebar.classList.remove('on');
    cartOverlay.classList.remove('on');
  };
  
  if (cartToggle) cartToggle.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  
  // Evento Checkout (Enviar a WhatsApp)
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', processCheckout);
  }
  
  // Evento cerrar detalles modal
  const modalBg = document.getElementById('modal-bg');
  const modalClose = document.getElementById('modal-close');
  
  const closeModal = () => {
    modalBg.classList.remove('on');
  };
  
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBg) {
    modalBg.addEventListener('click', e => {
      if (e.target === modalBg) closeModal();
    });
  }
}
// RENDERIZAR CATEGORÍAS EN LA BARRA DE FILTROS
function renderCategories() {
  const container = document.getElementById('filter-inner');
  if (!container) return;
  
  const categories = CategoryStore.getAll();
  
  // Conservamos el botón "Todos" y añadimos las demás dinámicamente
  container.innerHTML = `<button class="fp active" data-filter="all" id="btn-filter-all">Todos</button>`;
  
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'fp';
    btn.dataset.filter = cat.id;
    btn.id = `btn-filter-${cat.id}`;
    btn.innerHTML = `${cat.emoji} ${cat.label}`;
    container.appendChild(btn);
  });
  
  // Vincular eventos de clic para filtrado
  container.querySelectorAll('.fp').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.fp').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.dataset.filter;
      renderProducts(filter);
    });
  });
  
  // Disparar evento para actualizar el cursor
  window.dispatchEvent(new Event('contentUpdated'));
}
// RENDERIZAR PRODUCTOS EN EL GRID CON EFECTO 3D TILT
function renderProducts(filterCategory = 'all') {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  
  let products = ProductStore.getAll();
  
  // Filtrado de productos
  if (filterCategory !== 'all') {
    products = products.filter(p => p.category === filterCategory);
  }
  
  if (products.length === 0) {
    grid.innerHTML = `<div class="products-empty">💨 No hay productos disponibles en esta categoría por el momento.</div>`;
    return;
  }
  
  grid.innerHTML = '';
  
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'pcard';
    card.dataset.id = p.id;
    
    // Insignia (badge)
    let badgeHTML = '';
    if (p.badge) {
      badgeHTML = `<span class="pbadge pb-${p.badge}">${p.badgeLabel || p.badge}</span>`;
    }
    
    // Imagen o Emoji del producto
    let visualHTML = `<div class="pcard-img-emoji">${p.emoji || '💨'}</div>`;
    if (p.img) {
      visualHTML = `<img class="pcard-img-file" src="${p.img}" alt="${p.name}"/>`;
    }
    
    // Precios
    let oldPriceHTML = '';
    if (p.oldPrice) {
      oldPriceHTML = `<span class="pcard-old">$${Number(p.oldPrice).toLocaleString('es-CO')}</span>`;
    }
    const currentPriceHTML = `<span class="pcard-price">$${Number(p.price).toLocaleString('es-CO')}</span>`;
    
    card.innerHTML = `
      ${badgeHTML}
      <div class="pcard-img">
        ${visualHTML}
      </div>
      <div class="pcard-body">
        <div class="pcard-cat">${p.category.toUpperCase()}</div>
        <h3 class="pcard-name">${p.name}</h3>
        <p class="pcard-desc">${p.description || p.desc || ''}</p>
        <div class="pcard-footer">
          <div class="pcard-prices">
            ${oldPriceHTML}
            ${currentPriceHTML}
          </div>
          <div class="pcard-btns">
            <button class="btn-see" onclick="openProductDetail(${p.id})">Detalles</button>
            <button class="btn-cart" onclick="addToCart(${p.id})">🛍️</button>
          </div>
        </div>
      </div>
    `;
    
    grid.appendChild(card);
    
    // Aplicar efecto 3D Tilt interactivo a cada tarjeta
    apply3DTiltEffect(card);
  });
  
  window.dispatchEvent(new Event('contentUpdated'));
}
// APLICAR TILT 3D A UNA TARJETA
function apply3DTiltEffect(card) {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const w = rect.width;
    const h = rect.height;
    
    // Rotaciones de -10 a 10 grados
    const rotateY = ((x - w / 2) / (w / 2)) * 10;
    const rotateX = -((y - h / 2) / (h / 2)) * 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    card.style.boxShadow = '0 15px 35px rgba(180, 79, 255, 0.45), 0 0 25px rgba(0, 229, 255, 0.2)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    card.style.boxShadow = '';
  });
}
// ==========================================
// 5. OPERACIONES DEL CARRITO
// ==========================================
function loadCartFromStorage() {
  try {
    const s = localStorage.getItem('cbflow_cart');
    if (s) {
      cart = JSON.parse(s);
      updateCartUI();
    }
  } catch(e) {}
}
function saveCartToStorage() {
  try {
    localStorage.setItem('cbflow_cart', JSON.stringify(cart));
  } catch(e) {}
}
window.addToCart = function(productId, quantity = 1) {
  const products = ProductStore.getAll();
  const p = products.find(prod => prod.id === productId);
  if (!p) return;
  
  // Validar stock disponible
  const existing = cart.find(item => item.id === productId);
  const currentQty = existing ? existing.qty : 0;
  
  if (currentQty + quantity > p.stock) {
    showToast(`⚠️ Stock insuficiente. Solo quedan ${p.stock} unidades de este producto.`);
    return;
  }
  
  if (existing) {
    existing.qty += quantity;
  } else {
    cart.push({
      id: p.id,
      name: p.name,
      price: p.price,
      emoji: p.emoji,
      img: p.img,
      qty: quantity,
      stock: p.stock
    });
  }
  
  saveCartToStorage();
  updateCartUI();
  showToast(`🛍️ ¡${p.name} agregado al carrito!`);
};
window.updateQty = function(productId, delta) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;
  
  const newQty = item.qty + delta;
  
  if (newQty <= 0) {
    // Eliminar del carrito
    cart = cart.filter(item => item.id !== productId);
  } else if (newQty > item.stock) {
    showToast(`⚠️ No hay más unidades en stock (${item.stock} máx).`);
    return;
  } else {
    item.qty = newQty;
  }
  
  saveCartToStorage();
  updateCartUI();
};
window.removeFromCart = function(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCartToStorage();
  updateCartUI();
  showToast('🗑️ Producto eliminado del carrito');
};
function updateCartUI() {
  // Actualizar contador del badge
  const countBadge = document.getElementById('cart-count');
  const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);
  if (countBadge) {
    countBadge.textContent = totalCount;
  }
  
  const body = document.getElementById('cart-body');
  const foot = document.getElementById('cart-foot');
  const totalLabel = document.getElementById('cart-total');
  
  if (!body) return;
  
  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <span>💨</span>
        <p>Tu carrito está vacío</p>
      </div>
    `;
    if (foot) foot.style.display = 'none';
    return;
  }
  
  body.innerHTML = '';
  
  cart.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    
    let visualHTML = `<div class="ci-emo">${item.emoji || '📦'}</div>`;
    if (item.img) {
      visualHTML = `<img class="ci-img" src="${item.img}" alt="${item.name}"/>`;
    }
    
    itemDiv.innerHTML = `
      ${visualHTML}
      <div class="ci-info">
        <div class="ci-name">${item.name}</div>
        <div class="ci-price">$${(item.price * item.qty).toLocaleString('es-CO')}</div>
        <div class="ci-controls">
          <button class="qbtn" onclick="updateQty(${item.id}, -1)">-</button>
          <span class="qnum">${item.qty}</span>
          <button class="qbtn" onclick="updateQty(${item.id}, 1)">+</button>
          <div style="flex:1"></div>
          <button class="rm-btn" onclick="removeFromCart(${item.id})" aria-label="Eliminar item">🗑️</button>
        </div>
      </div>
    `;
    body.appendChild(itemDiv);
  });
  
  // Calcular total
  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  if (totalLabel) {
    totalLabel.textContent = `$${total.toLocaleString('es-CO')}`;
  }
  
  if (foot) foot.style.display = 'block';
  
  window.dispatchEvent(new Event('contentUpdated'));
}

function getActiveProductFilter() {
  const activeBtn = document.querySelector('.fp.active');
  return activeBtn ? activeBtn.dataset.filter : 'all';
}

async function decrementStockAfterCheckout() {
  const currentFilter = getActiveProductFilter();
  if (!cart || cart.length === 0) return;

  try {
    const payload = { items: cart.map(i => ({ id: i.id, qty: i.qty })) };
    const resp = await fetch('/api/update-stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      console.warn('Server update-stock failed', await resp.text());
      // Fallback: actualizar localmente
      cart.forEach(item => {
        const product = ProductStore.getAll().find(p => p.id === item.id);
        if (!product) return;
        const newStock = Math.max(0, product.stock - item.qty);
        ProductStore.update(product.id, { stock: newStock });
      });
      renderProducts(currentFilter);
      return;
    }

    const data = await resp.json();
    // data.updated => [{id, stock}]
    if (Array.isArray(data.updated)) {
      data.updated.forEach(u => {
        ProductStore.update(u.id, { stock: u.stock });
      });
    }
    renderProducts(currentFilter);
  } catch (e) {
    console.warn('Error updating stock on server', e);
  }
}

// PROCESAR COMPRA Y ENVIAR WHATSAPP
async function processCheckout() {
  const name = document.getElementById('cn-name').value.trim();
  const phone = document.getElementById('cn-phone').value.trim();
  const address = document.getElementById('cn-address').value.trim();
  
  if (!name || !phone || !address) {
    showToast('⚠️ Por favor completa los campos de contacto y entrega');
    return;
  }
  
  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  
  // Construir mensaje de WhatsApp
  let msg = `🔥 *NUEVO PEDIDO - CBflow Tech* 🔥\n`;
  msg += `----------------------------------\n`;
  msg += `👤 *Cliente:* ${name}\n`;
  msg += `📞 *Teléfono:* ${phone}\n`;
  msg += `📍 *Dirección de Entrega:* ${address}\n\n`;
  msg += `📦 *Productos Solicitados:* \n`;
  
  cart.forEach(item => {
    msg += `• ${item.qty}x ${item.name} ($${(item.price * item.qty).toLocaleString('es-CO')})\n`;
  });
  
  msg += `\n💰 *Total Compra:* *$${total.toLocaleString('es-CO')} COP*\n`;
  msg += `----------------------------------\n`;
  msg += `✨ ¡Gracias por elegir a CBflow Tech! 💨`;
  
  // URL de WhatsApp
  const waNumber = "573052267408";
  const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
  
  // Reducir stock antes de limpiar el carrito (esperar respuesta)
  await decrementStockAfterCheckout();

  // Abrir ventana e indicar éxito
  window.open(url, '_blank');
  
  // Limpiar carrito y campos
  cart = [];
  saveCartToStorage();
  updateCartUI();
  
  document.getElementById('cn-name').value = '';
  document.getElementById('cn-phone').value = '';
  document.getElementById('cn-address').value = '';
  
  // Cerrar sidebar
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  cartSidebar.classList.remove('on');
  cartOverlay.classList.remove('on');
  
  showToast('🎉 ¡Pedido enviado con éxito por WhatsApp!');
}
// ==========================================
// 6. MODAL DE DETALLES DE PRODUCTO
// ==========================================
window.openProductDetail = function(productId) {
  const products = ProductStore.getAll();
  const p = products.find(prod => prod.id === productId);
  if (!p) return;
  
  const inner = document.getElementById('modal-inner');
  const modalBg = document.getElementById('modal-bg');
  if (!inner || !modalBg) return;
  
  let visualHTML = `<div class="modal-emo">${p.emoji || '📦'}</div>`;
  if (p.img) {
    visualHTML = `<div class="modal-img-container"><img class="modal-img-file" src="${p.img}" alt="${p.name}"/></div>`;
  }
  
  let oldPriceHTML = '';
  if (p.oldPrice) {
    oldPriceHTML = `<span class="pcard-old" style="font-size:1.1rem;margin-right:12px">$${Number(p.oldPrice).toLocaleString('es-CO')}</span>`;
  }
  
  inner.innerHTML = `
    ${visualHTML}
    <div class="modal-body">
      <span class="modal-cat">${p.category.toUpperCase()}</span>
      <h2 class="modal-name">${p.name}</h2>
      <p class="modal-desc">${p.description || p.desc || ''}</p>
      
      <div class="modal-price">
        ${oldPriceHTML}
        <span class="pcard-price" style="font-size:2rem">$${Number(p.price).toLocaleString('es-CO')} COP</span>
      </div>
      
      <div class="modal-stock">
        Disponibilidad: <span>${p.stock > 0 ? `En Stock (${p.stock} unidades)` : 'Agotado'}</span>
      </div>
      
      <button class="cta-main modal-add" style="width:100%; border:none; text-align:center; font-family:'Urbanist',sans-serif; cursor:none" onclick="addToCartAndClose(${p.id})">
        🛍️ Agregar al Carrito
      </button>
    </div>
  `;
  
  modalBg.classList.add('on');
  window.dispatchEvent(new Event('contentUpdated'));
};
window.addToCartAndClose = function(productId) {
  addToCart(productId, 1);
  const modalBg = document.getElementById('modal-bg');
  if (modalBg) modalBg.classList.remove('on');
};
// ==========================================
// 7. SISTEMA DE TOAST (NOTIFICACIÓN FLOTANTE)
// ==========================================
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
