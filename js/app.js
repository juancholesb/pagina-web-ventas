// ===== CART STATE =====
let cart = [];
let currentFilter = 'all';

// ===== CURSOR =====
const cursor = document.getElementById('cursor');
const trail = document.getElementById('cursor-trail');
let mx = 0, my = 0, tx = 0, ty = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
});
(function animTrail() {
  tx += (mx - tx) * 0.12; ty += (my - ty) * 0.12;
  trail.style.left = tx + 'px'; trail.style.top = ty + 'px';
  requestAnimationFrame(animTrail);
})();

document.querySelectorAll('a,button,.cat-pill,.product-card').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.style.transform = 'translate(-50%,-50%) scale(2)'; cursor.style.background = 'transparent'; cursor.style.border = '2px solid var(--accent)'; });
  el.addEventListener('mouseleave', () => { cursor.style.transform = 'translate(-50%,-50%) scale(1)'; cursor.style.background = 'var(--accent)'; cursor.style.border = 'none'; });
});

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

// ===== 3D CANVAS PARTICLES =====
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], lines = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? '0,212,255' : '124,58,237';
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,212,255,${0.08 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(loop);
  }
  loop();
})();

// ===== RENDER PRODUCTS =====
function formatPrice(n) {
  return '$' + n.toLocaleString('es-CO');
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  const products = ProductStore.getAll();
  const filtered = currentFilter === 'all' ? products : products.filter(p => p.category === currentFilter);

  if (filtered.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text2);padding:60px">No hay productos en esta categoría.</div>';
    return;
  }

  grid.innerHTML = filtered.map((p, i) => `
    <div class="product-card" style="animation-delay:${i * 0.07}s" data-id="${p.id}">
      <div class="product-img-placeholder">
        ${p.emoji || '📦'}
        ${p.badge ? `<span class="product-badge badge-${p.badge}">${p.badgeLabel}</span>` : ''}
      </div>
      <div class="product-info">
        <div class="product-category">${p.categoryLabel || p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <div>
            ${p.oldPrice ? `<span class="product-price-old">${formatPrice(p.oldPrice)}</span>` : ''}
            <div class="product-price">${formatPrice(p.price)}</div>
          </div>
          <div class="product-actions">
            <button class="btn-detail" onclick="openModal(${p.id})">Ver</button>
            <button class="btn-add" onclick="addToCart(${p.id})">+ Carrito</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== CATEGORY FILTER =====
document.querySelectorAll('.cat-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    currentFilter = pill.dataset.filter;
    renderProducts();
  });
});

// ===== CART =====
function addToCart(id) {
  const products = ProductStore.getAll();
  const product = products.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });
  updateCartUI();
  showToast(`✅ ${product.name} agregado al carrito`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cart-count').textContent = count;

  const itemsEl = document.getElementById('cart-items');
  const footerEl = document.getElementById('cart-footer');
  const totalEl = document.getElementById('cart-total-price');

  if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty"><span>🛍️</span><p>Tu carrito está vacío</p></div>`;
    footerEl.style.display = 'none';
    return;
  }

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-emoji">${item.emoji || '📦'}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id},1)">+</button>
        <button class="remove-item" onclick="removeFromCart(${item.id})">🗑️</button>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  totalEl.textContent = formatPrice(total);
  footerEl.style.display = 'block';
}

// ===== CART TOGGLE =====
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');

document.getElementById('cart-toggle').addEventListener('click', () => {
  cartSidebar.classList.add('active');
  cartOverlay.classList.add('active');
});
document.getElementById('cart-close').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
function closeCart() {
  cartSidebar.classList.remove('active');
  cartOverlay.classList.remove('active');
}

// ===== WHATSAPP CHECKOUT =====
document.getElementById('btn-checkout').addEventListener('click', () => {
  const name = document.getElementById('client-name').value.trim();
  const phone = document.getElementById('client-phone').value.trim();
  const address = document.getElementById('client-address').value.trim();

  if (!name || !phone || !address) {
    showToast('⚠️ Por favor completa tus datos de contacto');
    return;
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const itemsList = cart.map(i => `• ${i.name} x${i.qty} = ${formatPrice(i.price * i.qty)}`).join('\n');

  const msg = `🛒 *NUEVO PEDIDO - CBflow Tech*\n\n` +
    `👤 *Cliente:* ${name}\n` +
    `📱 *Teléfono:* ${phone}\n` +
    `📍 *Dirección:* ${address}\n\n` +
    `🛍️ *Productos:*\n${itemsList}\n\n` +
    `💰 *TOTAL: ${formatPrice(total)}*\n\n` +
    `_Pedido realizado desde la tienda web CBflow Tech_`;

  const url = `https://wa.me/573052267408?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
  showToast('✅ Redirigiendo a WhatsApp...');
  cart = [];
  updateCartUI();
  closeCart();
});

// ===== PRODUCT MODAL =====
function openModal(id) {
  const products = ProductStore.getAll();
  const p = products.find(pr => pr.id === id);
  if (!p) return;

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-emoji">${p.emoji || '📦'}</div>
    <div class="modal-body">
      <div class="modal-category">${p.categoryLabel || p.category}</div>
      <div class="modal-name">${p.name}</div>
      <div class="modal-desc">${p.desc}</div>
      ${p.oldPrice ? `<div style="color:var(--text2);text-decoration:line-through;font-size:0.9rem;">${formatPrice(p.oldPrice)}</div>` : ''}
      <div class="modal-price">${formatPrice(p.price)}</div>
      <div class="modal-stock">Stock disponible: <span>${p.stock} unidades</span></div>
      <button class="btn-add modal-add" onclick="addToCart(${p.id}); closeModal()">+ Agregar al Carrito</button>
    </div>
  `;

  document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ===== SCROLL REVEAL =====
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; } });
}, { threshold: 0.1 });

document.querySelectorAll('.feat-card').forEach(el => {
  el.style.opacity = '0'; el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ===== INIT =====
renderProducts();
