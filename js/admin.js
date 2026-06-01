// ===== CANVAS =====
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);
  class P {
    constructor() { this.reset(); }
    reset() { this.x = Math.random()*W; this.y = Math.random()*H; this.vx=(Math.random()-.5)*.3; this.vy=(Math.random()-.5)*.3; this.r=Math.random()*1.5+.5; this.a=Math.random()*.4+.1; this.c=Math.random()>.5?'0,212,255':'124,58,237'; }
    update() { this.x+=this.vx; this.y+=this.vy; if(this.x<0||this.x>W||this.y<0||this.y>H) this.reset(); }
    draw() { ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle=`rgba(${this.c},${this.a})`; ctx.fill(); }
  }
  for(let i=0;i<80;i++) particles.push(new P());
  (function loop() { ctx.clearRect(0,0,W,H); particles.forEach(p=>{p.update();p.draw();}); requestAnimationFrame(loop); })();
})();

// ===== AUTH =====
const ADMIN_PASS = 'cbflow2025';
const loginScreen = document.getElementById('login-screen');
const adminWrap = document.getElementById('admin-wrap');

function checkAuth() {
  if (sessionStorage.getItem('cbflow_admin') === 'true') {
    loginScreen.style.display = 'none';
    adminWrap.style.display = 'flex';
    initAdmin();
  }
}

document.getElementById('login-btn').addEventListener('click', doLogin);
document.getElementById('admin-pass').addEventListener('keydown', e => { if(e.key === 'Enter') doLogin(); });

function doLogin() {
  const val = document.getElementById('admin-pass').value;
  if (val === ADMIN_PASS) {
    sessionStorage.setItem('cbflow_admin', 'true');
    loginScreen.style.display = 'none';
    adminWrap.style.display = 'flex';
    initAdmin();
  } else {
    document.getElementById('login-error').classList.add('show');
    document.getElementById('admin-pass').style.borderColor = 'var(--danger)';
    setTimeout(() => {
      document.getElementById('login-error').classList.remove('show');
      document.getElementById('admin-pass').style.borderColor = '';
    }, 2500);
  }
}

document.getElementById('logout-btn').addEventListener('click', () => {
  sessionStorage.removeItem('cbflow_admin');
  adminWrap.style.display = 'none';
  loginScreen.style.display = 'flex';
  document.getElementById('admin-pass').value = '';
});

checkAuth();

// ===== TABS =====
function initAdmin() {
  setupTabs();
  renderDashboard();
  renderProductsTable();
  setupForm();
}

function setupTabs() {
  document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const tab = item.dataset.tab;
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      document.getElementById('tab-' + tab).classList.add('active');
      document.getElementById('page-title').textContent =
        tab === 'dashboard' ? 'Dashboard' : tab === 'products' ? 'Productos' : 'Agregar Producto';

      if (tab === 'dashboard') renderDashboard();
      if (tab === 'products') renderProductsTable();
    });
  });
}

function switchTab(tab) {
  document.querySelectorAll('.nav-item[data-tab]').forEach(i => i.classList.remove('active'));
  const target = document.querySelector(`.nav-item[data-tab="${tab}"]`);
  if (target) target.classList.add('active');
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('page-title').textContent = tab === 'dashboard' ? 'Dashboard' : tab === 'products' ? 'Productos' : 'Agregar Producto';
}

// ===== DASHBOARD =====
function renderDashboard() {
  const products = ProductStore.getAll();
  document.getElementById('stat-total').textContent = products.length;
  const cats = new Set(products.map(p => p.category));
  document.getElementById('stat-cats').textContent = cats.size;
  document.getElementById('stat-featured').textContent = products.filter(p => p.featured).length;
  document.getElementById('stat-offers').textContent = products.filter(p => p.badge === 'sale').length;

  const recent = [...products].reverse().slice(0, 8);
  document.getElementById('recent-products').innerHTML = recent.map(p => `
    <div class="recent-card">
      <div class="recent-card-emoji">${p.emoji || '📦'}</div>
      <div>
        <div class="recent-card-name">${p.name}</div>
        <div class="recent-card-price">${formatAdminPrice(p.price)}</div>
      </div>
    </div>
  `).join('');
}

function formatAdminPrice(n) {
  return '$' + Number(n).toLocaleString('es-CO');
}

// ===== PRODUCTS TABLE =====
let deleteTargetId = null;

function renderProductsTable(filter = 'all', search = '') {
  let products = ProductStore.getAll();
  if (filter !== 'all') products = products.filter(p => p.category === filter);
  if (search) products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const tbody = document.getElementById('products-tbody');
  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text2);padding:40px">No se encontraron productos</td></tr>';
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr>
      <td>
        <div class="td-product">
          <div class="td-emoji">${p.emoji || '📦'}</div>
          <div>
            <div class="td-name">${p.name}</div>
            <div class="td-id">#${p.id}</div>
          </div>
        </div>
      </td>
      <td><span class="td-cat">${p.categoryLabel || p.category}</span></td>
      <td><span class="td-price">${formatAdminPrice(p.price)}</span></td>
      <td><span class="td-stock ${p.stock <= 5 ? 'low' : 'ok'}">${p.stock}</span></td>
      <td>
        ${p.badge
          ? `<span class="badge-pill badge-${p.badge}">${p.badgeLabel || p.badge}</span>`
          : `<span class="badge-none">—</span>`}
      </td>
      <td>
        <div class="td-actions">
          <button class="btn-edit" onclick="editProduct(${p.id})">✏️ Editar</button>
          <button class="btn-del" onclick="confirmDelete(${p.id})">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Search & filter
document.getElementById('search-products').addEventListener('input', e => {
  renderProductsTable(document.getElementById('filter-category').value, e.target.value);
});
document.getElementById('filter-category').addEventListener('change', e => {
  renderProductsTable(e.target.value, document.getElementById('search-products').value);
});

// ===== DELETE =====
function confirmDelete(id) {
  deleteTargetId = id;
  document.getElementById('confirm-overlay').classList.add('active');
}
document.getElementById('confirm-cancel').addEventListener('click', () => {
  document.getElementById('confirm-overlay').classList.remove('active');
  deleteTargetId = null;
});
document.getElementById('confirm-ok').addEventListener('click', () => {
  if (deleteTargetId !== null) {
    ProductStore.delete(deleteTargetId);
    document.getElementById('confirm-overlay').classList.remove('active');
    deleteTargetId = null;
    renderProductsTable();
    renderDashboard();
    showAdminToast('🗑️ Producto eliminado');
  }
});

// ===== FORM (ADD / EDIT) =====
let editingId = null;

const CATEGORY_LABELS = {
  audio: 'Audio', movil: 'Móvil', computacion: 'Computación',
  smart: 'Smart Home', accesorios: 'Accesorios', gaming: 'Gaming'
};
const BADGE_LABELS = { new: 'NUEVO', sale: 'OFERTA' };

function setupForm() {
  // Live preview
  ['f-name','f-emoji','f-price'].forEach(id => {
    document.getElementById(id).addEventListener('input', updatePreview);
  });

  document.getElementById('btn-save-product').addEventListener('click', saveProduct);
  document.getElementById('btn-cancel-form').addEventListener('click', resetForm);
}

function updatePreview() {
  const name = document.getElementById('f-name').value || 'Nombre del producto';
  const emoji = document.getElementById('f-emoji').value || '📦';
  const price = document.getElementById('f-price').value ? formatAdminPrice(Number(document.getElementById('f-price').value)) : '$0';
  document.getElementById('prev-emoji').textContent = emoji;
  document.getElementById('prev-name').textContent = name;
  document.getElementById('prev-price').textContent = price;
}

function saveProduct() {
  const name = document.getElementById('f-name').value.trim();
  const category = document.getElementById('f-category').value;
  const emoji = document.getElementById('f-emoji').value.trim() || '📦';
  const price = Number(document.getElementById('f-price').value);
  const oldPrice = Number(document.getElementById('f-old-price').value) || null;
  const stock = Number(document.getElementById('f-stock').value);
  const badge = document.getElementById('f-badge').value || null;
  const desc = document.getElementById('f-desc').value.trim();
  const featured = document.getElementById('f-featured').checked;
  const msg = document.getElementById('form-msg');

  if (!name || !category || !price || !stock || !desc) {
    msg.textContent = '⚠️ Por favor completa todos los campos obligatorios';
    msg.className = 'form-msg error';
    return;
  }

  const product = {
    name, category, categoryLabel: CATEGORY_LABELS[category] || category,
    emoji, price, oldPrice, stock, badge, badgeLabel: badge ? BADGE_LABELS[badge] : null,
    desc, featured
  };

  if (editingId !== null) {
    ProductStore.update(editingId, product);
    showAdminToast('✅ Producto actualizado');
  } else {
    ProductStore.add(product);
    showAdminToast('✅ Producto agregado');
  }

  resetForm();
  renderDashboard();
  msg.textContent = editingId !== null ? '✅ Producto actualizado exitosamente' : '✅ Producto guardado exitosamente';
  msg.className = 'form-msg success';
  setTimeout(() => { msg.textContent = ''; }, 3000);
  editingId = null;
}

function editProduct(id) {
  const products = ProductStore.getAll();
  const p = products.find(pr => pr.id === id);
  if (!p) return;

  editingId = id;
  document.getElementById('f-name').value = p.name;
  document.getElementById('f-category').value = p.category;
  document.getElementById('f-emoji').value = p.emoji || '';
  document.getElementById('f-price').value = p.price;
  document.getElementById('f-old-price').value = p.oldPrice || '';
  document.getElementById('f-stock').value = p.stock;
  document.getElementById('f-badge').value = p.badge || '';
  document.getElementById('f-desc').value = p.desc;
  document.getElementById('f-featured').checked = p.featured || false;
  document.getElementById('form-title').textContent = '✏️ Editar Producto';
  document.getElementById('btn-cancel-form').style.display = 'block';
  updatePreview();

  switchTab('add');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
  editingId = null;
  ['f-name','f-emoji','f-price','f-old-price','f-stock','f-desc'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('f-category').value = '';
  document.getElementById('f-badge').value = '';
  document.getElementById('f-featured').checked = false;
  document.getElementById('form-title').textContent = '➕ Agregar Nuevo Producto';
  document.getElementById('btn-cancel-form').style.display = 'none';
  document.getElementById('form-msg').textContent = '';
  updatePreview();
}

// ===== TOAST =====
function showAdminToast(msg) {
  const t = document.getElementById('admin-toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
