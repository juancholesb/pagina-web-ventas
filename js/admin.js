// ===== CYBER CONTROL CENTER - ADMIN CONTROLLER =====
document.addEventListener('DOMContentLoaded', () => {
  initAdminCanvas();
  initAdminAuth();
});
// ==========================================
// 1. EFECTO PARTÍCULAS FONDO NEÓN CANVAS
// ==========================================
function initAdminCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let W, H;
  let particles = [];
  
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  
  class SparkParticle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.radius = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.4 + 0.1;
      this.color = Math.random() > 0.5 ? '0, 212, 255' : '191, 70, 255'; // Cian o Púrpura
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
      ctx.fill();
    }
  }
  
  for (let i = 0; i < 60; i++) {
    particles.push(new SparkParticle());
  }
  
  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(loop);
  }
  loop();
}
// ==========================================
// 2. SEGURIDAD Y ACCESO (LOGIN / RECUPERACIÓN)
// ==========================================
function initAdminAuth() {
  const loginWrap = document.getElementById('login-wrap');
  const panel = document.getElementById('panel');
  const loginBtn = document.getElementById('login-btn');
  const passInput = document.getElementById('ap');
  const loginErr = document.getElementById('login-err');
  
  // Elementos de Recuperación de Contraseña
  const btnForgot = document.getElementById('forgot-link');
  const loginFormArea = document.getElementById('login-form-area');
  const recoverFormArea = document.getElementById('recover-form-area');
  const btnBackToLogin = document.getElementById('back-to-login-btn');
  const btnRecover = document.getElementById('recover-btn');
  const recoverEmailInput = document.getElementById('recover-email');
  const recoverFeedback = document.getElementById('recover-feedback');
  
  // Elementos de Restablecimiento Directo
  const resetFormArea = document.getElementById('reset-form-area');
  const newPassInput = document.getElementById('new-password-field');
  const btnResetPass = document.getElementById('reset-password-btn');
  
  // Verificar sesión activa
  if (sessionStorage.getItem('cbflow_admin_session') === 'true') {
    if (loginWrap) loginWrap.style.display = 'none';
    if (panel) panel.style.display = 'grid';
    startAdminDashboard();
  }
  
  // Evento Login
  if (loginBtn) {
    loginBtn.addEventListener('click', attemptLogin);
  }
  if (passInput) {
    passInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') attemptLogin();
    });
  }
  
  function attemptLogin() {
    const entered = passInput.value.trim();
    const creds = AdminStore.getCredentials();
    
    if (entered === creds.pass) {
      sessionStorage.setItem('cbflow_admin_session', 'true');
      if (loginWrap) loginWrap.style.display = 'none';
      if (panel) panel.style.display = 'grid';
      startAdminDashboard();
      showToast('🔑 Acceso concedido. Panel Command Center inicializado.');
    } else {
      if (loginErr) {
        loginErr.classList.add('show');
        passInput.style.borderColor = 'var(--danger)';
        setTimeout(() => {
          loginErr.classList.remove('show');
          passInput.style.borderColor = '';
        }, 3000);
      }
    }
  }
  
  // Cerrar Sesión
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('cbflow_admin_session');
      if (panel) panel.style.display = 'none';
      if (loginWrap) loginWrap.style.display = 'flex';
      if (passInput) passInput.value = '';
      showToast('🚪 Sesión finalizada de manera segura.');
    });
  }
  
  // Lógica para alternar a Recuperación
  if (btnForgot) {
    btnForgot.addEventListener('click', (e) => {
      e.preventDefault();
      loginFormArea.style.display = 'none';
      recoverFormArea.style.display = 'block';
      recoverEmailInput.value = '';
      recoverFeedback.textContent = '';
      recoverFeedback.className = 'login-err';
    });
  }
  
  if (btnBackToLogin) {
    btnBackToLogin.addEventListener('click', () => {
      recoverFormArea.style.display = 'none';
      resetFormArea.style.display = 'none';
      loginFormArea.style.display = 'block';
      passInput.value = '';
    });
  }
  
  // Procesar Recuperación por Email
  if (btnRecover) {
    btnRecover.addEventListener('click', () => {
      const email = recoverEmailInput.value.trim().toLowerCase();
      const creds = AdminStore.getCredentials();
      
      if (!email) {
        showRecoverFeedback('⚠️ Ingresa un correo electrónico.', 'error');
        return;
      }
      
      if (email === creds.email.toLowerCase()) {
        showRecoverFeedback('✅ Correo validado. Puedes restablecer tu contraseña ahora.', 'success');
        setTimeout(() => {
          recoverFormArea.style.display = 'none';
          resetFormArea.style.display = 'block';
          newPassInput.value = '';
        }, 1500);
      } else {
        showRecoverFeedback('❌ El correo electrónico no coincide con el registrado.', 'error');
      }
    });
  }
  
  // Guardar nueva contraseña restablecida
  if (btnResetPass) {
    btnResetPass.addEventListener('click', () => {
      const newPass = newPassInput.value.trim();
      if (newPass.length < 4) {
        showToast('⚠️ La contraseña debe tener al menos 4 caracteres.');
        return;
      }
      
      const creds = AdminStore.getCredentials();
      creds.pass = newPass;
      AdminStore.saveCredentials(creds);
      
      showToast('🎉 Contraseña restablecida con éxito. Redirigiendo...');
      setTimeout(() => {
        resetFormArea.style.display = 'none';
        loginFormArea.style.display = 'block';
        passInput.value = newPass;
      }, 1500);
    });
  }
  
  function showRecoverFeedback(msg, type) {
    recoverFeedback.textContent = msg;
    recoverFeedback.className = 'login-err show ' + (type === 'success' ? 'success' : 'error');
  }
}
// ==========================================
// 3. LOGICA DEL PANEL ADMINISTRATIVO
// ==========================================
function startAdminDashboard() {
  setupTabs();
  renderDashboardStats();
  renderProductsTable();
  setupProductForm();
  renderCategoriesList();
  setupSettingsTab();
}
// GESTIÓN DE PESTAÑAS (TABS)
function setupTabs() {
  document.querySelectorAll('.si[data-tab]').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const tab = item.dataset.tab;
      
      document.querySelectorAll('.si').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
      const targetTab = document.getElementById('tab-' + tab);
      if (targetTab) targetTab.classList.add('on');
      
      // Actualizar Título Principal
      const pageTitle = document.getElementById('page-title');
      if (pageTitle) {
        pageTitle.textContent = item.textContent.replace(/[^\w\sÀ-ÿ]/g, '').trim();
      }
      
      // Acciones adicionales por pestaña
      if (tab === 'dashboard') renderDashboardStats();
      if (tab === 'products') renderProductsTable();
      if (tab === 'categories') renderCategoriesList();
    });
  });
}
function switchTab(tab) {
  document.querySelectorAll('.si[data-tab]').forEach(i => i.classList.remove('active'));
  const btn = document.querySelector(`.si[data-tab="${tab}"]`);
  if (btn) btn.classList.add('active');
  
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
  const targetTab = document.getElementById('tab-' + tab);
  if (targetTab) targetTab.classList.add('on');
  
  const pageTitle = document.getElementById('page-title');
  if (pageTitle && btn) {
    pageTitle.textContent = btn.textContent.replace(/[^\w\sÀ-ÿ]/g, '').trim();
  }
  
  if (tab === 'dashboard') renderDashboardStats();
  if (tab === 'products') renderProductsTable();
  if (tab === 'categories') renderCategoriesList();
}
// ==========================================
// 4. RENDERIZACIÓN DE ESTADÍSTICAS DEL DASHBOARD
// ==========================================
function renderDashboardStats() {
  const products = ProductStore.getAll();
  const categories = CategoryStore.getAll();
  
  const totalP = document.getElementById('st-total');
  const totalC = document.getElementById('st-cats');
  const totalF = document.getElementById('st-hot');
  const totalS = document.getElementById('st-stock');
  
  if (totalP) totalP.textContent = products.length;
  if (totalC) totalC.textContent = categories.length;
  if (totalF) totalF.textContent = products.filter(p => p.featured).length;
  if (totalS) totalS.textContent = products.reduce((acc, p) => acc + Number(p.stock), 0);
  
  // Renderizar últimos agregados
  const recentGrid = document.getElementById('recent-grid');
  if (recentGrid) {
    const recent = [...products].reverse().slice(0, 5);
    if (recent.length === 0) {
      recentGrid.innerHTML = `<div style="grid-column: 1/-1; color: var(--text2); font-size:0.9rem">No hay productos agregados.</div>`;
      return;
    }
    
    recentGrid.innerHTML = recent.map(p => {
      let visualHTML = `<div class="recent-card-emoji">${p.emoji || '📦'}</div>`;
      if (p.img) {
        visualHTML = `<img class="recent-card-img" src="${p.img}" alt="${p.name}"/>`;
      }
      return `
        <div class="recent-card">
          ${visualHTML}
          <div style="flex:1; overflow:hidden">
            <div class="recent-card-name" style="text-overflow:ellipsis; overflow:hidden; white-space:nowrap">${p.name}</div>
            <div class="recent-card-price">$${Number(p.price).toLocaleString('es-CO')} COP</div>
          </div>
        </div>
      `;
    }).join('');
  }
}
// ==========================================
// 5. TABLA DE PRODUCTOS (BUSCAR, FILTRAR, CRUD)
// ==========================================
let deleteTargetId = null;
function renderProductsTable() {
  const tbody = document.getElementById('ptbody');
  const filterCat = document.getElementById('filter-cat');
  const searchInput = document.getElementById('search-p');
  
  if (!tbody) return;
  
  const products = ProductStore.getAll();
  const categories = CategoryStore.getAll();
  
  // Llenar selector de filtros si está vacío
  if (filterCat && filterCat.options.length <= 1) {
    filterCat.innerHTML = `<option value="all">Todas las categorías</option>`;
    categories.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.emoji} ${c.label}`;
      filterCat.appendChild(opt);
    });
  }
  
  const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const filterVal = filterCat ? filterCat.value : 'all';
  
  let filtered = products;
  
  if (filterVal !== 'all') {
    filtered = filtered.filter(p => p.category === filterVal);
  }
  if (searchVal) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(searchVal));
  }
  
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text2);padding:30px">No se encontraron productos</td></tr>`;
    return;
  }
  
  tbody.innerHTML = filtered.map(p => {
    let visualHTML = `<div class="td-emoji">${p.emoji || '📦'}</div>`;
    if (p.img) {
      visualHTML = `<img class="td-img" src="${p.img}" alt="${p.name}"/>`;
    }
    
    const catObj = categories.find(c => c.id === p.category);
    const catLabel = catObj ? `${catObj.emoji} ${catObj.label}` : p.category.toUpperCase();
    
    const stockClass = p.stock <= 5 ? 'low' : 'ok';
    const badgeHTML = p.badge 
      ? `<span class="badge-pill badge-${p.badge}">${p.badgeLabel || p.badge}</span>`
      : `<span class="badge-none">—</span>`;
      
    return `
      <tr>
        <td>
          <div class="td-product">
            ${visualHTML}
            <div>
              <div class="td-name">${p.name}</div>
              <div class="td-id">#${p.id}</div>
            </div>
          </div>
        </td>
        <td><span class="td-cat">${catLabel}</span></td>
        <td><span class="td-price">$${Number(p.price).toLocaleString('es-CO')}</span></td>
        <td><span class="td-stock ${stockClass}">${p.stock} uds</span></td>
        <td>${badgeHTML}</td>
        <td>
          <div class="td-actions">
            <button class="btn-edit" onclick="editProduct(${p.id})">✏️ Editar</button>
            <button class="btn-del" onclick="triggerDelete(${p.id})">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}
// Búsqueda y filtrado en vivo en la tabla
const searchP = document.getElementById('search-p');
if (searchP) searchP.addEventListener('input', renderProductsTable);
const filterC = document.getElementById('filter-cat');
if (filterC) filterC.addEventListener('change', renderProductsTable);
// ELIMINACIÓN DE PRODUCTO
window.triggerDelete = function(id) {
  deleteTargetId = id;
  const overlay = document.getElementById('confirm-ov');
  if (overlay) overlay.classList.add('active');
};
const confNo = document.getElementById('conf-no');
const confYes = document.getElementById('conf-yes');
const confirmOv = document.getElementById('confirm-ov');
if (confNo) {
  confNo.addEventListener('click', () => {
    if (confirmOv) confirmOv.classList.remove('active');
    deleteTargetId = null;
  });
}
if (confYes) {
  confYes.addEventListener('click', () => {
    if (deleteTargetId !== null) {
      ProductStore.delete(deleteTargetId);
      if (confirmOv) confirmOv.classList.remove('active');
      deleteTargetId = null;
      renderProductsTable();
      renderDashboardStats();
      showToast('🗑️ Producto eliminado del inventario.');
    }
  });
}
// ==========================================
// 6. FORMULARIO CRUD (CREAR / EDITAR PRODUCTOS)
// ==========================================
let editingProductId = null;
let currentUploadedImageBase64 = null;
function setupProductForm() {
  const fCat = document.getElementById('f-cat');
  
  // Live preview bindings
  const updateLivePreview = () => {
    const name = document.getElementById('f-name').value.trim() || 'Nombre del producto';
    const price = document.getElementById('f-price').value ? `$${Number(document.getElementById('f-price').value).toLocaleString('es-CO')} COP` : '$0';
    const emoji = document.getElementById('f-emoji').value.trim() || '💨';
    
    const prevName = document.getElementById('prev-name');
    const prevPrice = document.getElementById('prev-price');
    const prevImg = document.getElementById('prev-img');
    
    if (prevName) prevName.textContent = name;
    if (prevPrice) prevPrice.textContent = price;
    
    if (prevImg) {
      if (currentUploadedImageBase64) {
        prevImg.innerHTML = `<img src="${currentUploadedImageBase64}" style="width:100%;height:100%;object-fit:cover;border-radius:8px"/>`;
      } else {
        prevImg.innerHTML = `<span id="prev-emo" style="font-size:2rem">${emoji}</span>`;
      }
    }
  };
  
  ['f-name', 'f-price', 'f-emoji'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateLivePreview);
  });
  
  // Manejo de carga de imagen local (FileReader -> Base64)
  const fileInput = document.getElementById('f-img');
  const btnPickImg = document.getElementById('btn-pick-img');
  const btnRmImg = document.getElementById('btn-rm-img');
  const imgPlaceholder = document.getElementById('img-placeholder');
  const imgResult = document.getElementById('img-result');
  const imgUploadArea = document.getElementById('img-upload-area');
  
  if (btnPickImg && fileInput) {
    btnPickImg.addEventListener('click', () => fileInput.click());
    
    // Drag & Drop
    if (imgUploadArea) {
      imgUploadArea.addEventListener('dragover', e => {
        e.preventDefault();
        imgUploadArea.style.borderColor = 'var(--accent)';
      });
      imgUploadArea.addEventListener('dragleave', () => {
        imgUploadArea.style.borderColor = '';
      });
      imgUploadArea.addEventListener('drop', e => {
        e.preventDefault();
        imgUploadArea.style.borderColor = '';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          processFile(e.dataTransfer.files[0]);
        }
      });
    }
    
    fileInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) {
        processFile(e.target.files[0]);
      }
    });
  }
  
  function processFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      currentUploadedImageBase64 = e.target.result;
      if (imgPlaceholder) imgPlaceholder.style.display = 'none';
      if (imgResult) {
        imgResult.src = currentUploadedImageBase64;
        imgResult.style.display = 'block';
      }
      if (btnRmImg) btnRmImg.style.display = 'inline-block';
      updateLivePreview();
    };
    reader.readAsDataURL(file);
  }
  
  // Quitar imagen
  if (btnRmImg) {
    btnRmImg.addEventListener('click', () => {
      currentUploadedImageBase64 = null;
      if (fileInput) fileInput.value = '';
      if (imgResult) {
        imgResult.src = '';
        imgResult.style.display = 'none';
      }
      if (imgPlaceholder) imgPlaceholder.style.display = 'block';
      btnRmImg.style.display = 'none';
      updateLivePreview();
    });
  }
  
  // Evento cancelar edición
  const btnCancelEdit = document.getElementById('btn-cancel-edit');
  if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', () => {
      resetProductForm();
      switchTab('products');
    });
  }
  
  // Guardar Producto (Create / Update)
  const btnSave = document.getElementById('btn-save');
  const feedback = document.getElementById('form-feedback');
  
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const name = document.getElementById('f-name').value.trim();
      const category = document.getElementById('f-cat').value;
      const emoji = document.getElementById('f-emoji').value.trim() || '📦';
      const price = Number(document.getElementById('f-price').value);
      const oldPrice = Number(document.getElementById('f-oldprice').value) || null;
      const stock = Number(document.getElementById('f-stock').value);
      const badge = document.getElementById('f-badge').value || null;
      const desc = document.getElementById('f-desc').value.trim();
      const featured = document.getElementById('f-featured') ? document.getElementById('f-featured').checked : false;
      
      if (!name || !category || !price || isNaN(price) || isNaN(stock) || !desc) {
        showFormFeedback('⚠️ Por favor completa todos los campos obligatorios.', 'error');
        return;
      }
      
      const badgeLabels = { new: "NUEVO ✨", sale: "OFERTA ⚡", hot: "HOT 🔥" };
      const productData = {
        name,
        category,
        emoji,
        price,
        oldPrice,
        stock,
        badge,
        badgeLabel: badge ? badgeLabels[badge] : null,
        desc,
        featured,
        img: currentUploadedImageBase64
      };
      
      if (editingProductId !== null) {
        ProductStore.update(editingProductId, productData);
        showToast('✅ Producto actualizado correctamente.');
      } else {
        ProductStore.add(productData);
        showToast('✅ Producto creado e inyectado con éxito.');
      }
      
      resetProductForm();
      renderDashboardStats();
      renderProductsTable();
      switchTab('products');
    });
  }
  
  function showFormFeedback(msg, type) {
    if (feedback) {
      feedback.textContent = msg;
      feedback.className = 'form-feedback ' + type;
      setTimeout(() => { feedback.textContent = ''; feedback.className = 'form-feedback'; }, 3000);
    }
  }
}
// Resetear campos del formulario
function resetProductForm() {
  editingProductId = null;
  currentUploadedImageBase64 = null;
  
  ['f-name', 'f-emoji', 'f-price', 'f-oldprice', 'f-stock', 'f-desc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  
  const fCat = document.getElementById('f-cat');
  if (fCat) fCat.value = '';
  const fBadge = document.getElementById('f-badge');
  if (fBadge) fBadge.value = '';
  const fFeat = document.getElementById('f-featured');
  if (fFeat) fFeat.checked = false;
  
  // Limpiar imagen cargada
  const fileInput = document.getElementById('f-img');
  if (fileInput) fileInput.value = '';
  const imgResult = document.getElementById('img-result');
  if (imgResult) {
    imgResult.src = '';
    imgResult.style.display = 'none';
  }
  const imgPlaceholder = document.getElementById('img-placeholder');
  if (imgPlaceholder) imgPlaceholder.style.display = 'block';
  const btnRmImg = document.getElementById('btn-rm-img');
  if (btnRmImg) btnRmImg.style.display = 'none';
  
  // Cambiar títulos y botones
  const formTtl = document.getElementById('form-ttl');
  if (formTtl) formTtl.textContent = '➕ Agregar Nuevo Producto';
  const btnCancel = document.getElementById('btn-cancel-edit');
  if (btnCancel) btnCancel.style.display = 'none';
  
  // Actualizar previsualización
  const prevName = document.getElementById('prev-name');
  if (prevName) prevName.textContent = 'Nombre del producto';
  const prevPrice = document.getElementById('prev-price');
  if (prevPrice) prevPrice.textContent = '$0';
  const prevImg = document.getElementById('prev-img');
  if (prevImg) prevImg.innerHTML = '<span id="prev-emo">💨</span>';
}
// Función global editar producto
window.editProduct = function(id) {
  const products = ProductStore.getAll();
  const p = products.find(prod => prod.id === id);
  if (!p) return;
  
  editingProductId = id;
  
  // Rellenar formulario
  document.getElementById('f-name').value = p.name;
  document.getElementById('f-emoji').value = p.emoji || '';
  document.getElementById('f-price').value = p.price;
  document.getElementById('f-oldprice').value = p.oldPrice || '';
  document.getElementById('f-stock').value = p.stock;
  document.getElementById('f-desc').value = p.desc;
  
  // Llenar selects dinámicos
  // Cargar categorías en formulario si es necesario
  const fCat = document.getElementById('f-cat');
  const categories = CategoryStore.getAll();
  fCat.innerHTML = `<option value="">Selecciona...</option>`;
  categories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.emoji} ${c.label}`;
    fCat.appendChild(opt);
  });
  
  fCat.value = p.category;
  
  const fBadge = document.getElementById('f-badge');
  if (fBadge) fBadge.value = p.badge || '';
  
  const fFeat = document.getElementById('f-featured');
  if (fFeat) fFeat.checked = p.featured || false;
  
  // Cargar imagen de edición
  const imgResult = document.getElementById('img-result');
  const imgPlaceholder = document.getElementById('img-placeholder');
  const btnRmImg = document.getElementById('btn-rm-img');
  
  if (p.img) {
    currentUploadedImageBase64 = p.img;
    if (imgPlaceholder) imgPlaceholder.style.display = 'none';
    if (imgResult) {
      imgResult.src = p.img;
      imgResult.style.display = 'block';
    }
    if (btnRmImg) btnRmImg.style.display = 'inline-block';
  } else {
    currentUploadedImageBase64 = null;
    if (imgResult) {
      imgResult.src = '';
      imgResult.style.display = 'none';
    }
    if (imgPlaceholder) imgPlaceholder.style.display = 'block';
    if (btnRmImg) btnRmImg.style.display = 'none';
  }
  
  // Cambiar textos del Form
  document.getElementById('form-ttl').textContent = '✏️ Editar Producto';
  document.getElementById('btn-cancel-edit').style.display = 'inline-block';
  
  // Actualizar Vista Previa
  const prevName = document.getElementById('prev-name');
  if (prevName) prevName.textContent = p.name;
  const prevPrice = document.getElementById('prev-price');
  if (prevPrice) prevPrice.textContent = `$${Number(p.price).toLocaleString('es-CO')} COP`;
  const prevImg = document.getElementById('prev-img');
  if (prevImg) {
    if (p.img) {
      prevImg.innerHTML = `<img src="${p.img}" style="width:100%;height:100%;object-fit:cover;border-radius:8px"/>`;
    } else {
      prevImg.innerHTML = `<span id="prev-emo" style="font-size:2rem">${p.emoji || '📦'}</span>`;
    }
  }
  
  switchTab('add');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
// Cargar categorías en el select del form al abrir tab de agregar
const addTabBtn = document.querySelector('.si[data-tab="add"]');
if (addTabBtn) {
  addTabBtn.addEventListener('click', () => {
    resetProductForm();
    const fCat = document.getElementById('f-cat');
    const categories = CategoryStore.getAll();
    fCat.innerHTML = `<option value="">Selecciona...</option>`;
    categories.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.emoji} ${c.label}`;
      fCat.appendChild(opt);
    });
  });
}
// ==========================================
// 7. GESTIONAR CATEGORÍAS (DINÁMICO)
// ==========================================
function renderCategoriesList() {
  const container = document.getElementById('cats-list');
  if (!container) return;
  
  const categories = CategoryStore.getAll();
  
  if (categories.length === 0) {
    container.innerHTML = `<p style="color:var(--text2)">No hay categorías registradas.</p>`;
    return;
  }
  
  container.innerHTML = categories.map(c => `
    <div class="cat-item">
      <span class="cat-item-emoji">${c.emoji || '🏷️'}</span>
      <div style="flex:1">
        <strong>${c.label}</strong>
        <code style="display:block;font-size:0.75rem;color:var(--accent)">id: ${c.id}</code>
      </div>
      <button class="cat-del-btn" onclick="deleteCategory('${c.id}')" aria-label="Eliminar categoría">✕</button>
    </div>
  `).join('');
}
// Agregar Categoría
const btnAddCat = document.getElementById('btn-add-cat');
if (btnAddCat) {
  btnAddCat.addEventListener('click', () => {
    const emoji = document.getElementById('cat-emoji').value.trim() || '🏷️';
    const id = document.getElementById('cat-id').value.trim().toLowerCase();
    const label = document.getElementById('cat-label').value.trim();
    const feedback = document.getElementById('cat-feedback');
    
    if (!id || !label) {
      showCatFeedback('⚠️ Por favor completa el ID y el Nombre de la categoría.', 'error');
      return;
    }
    
    const categories = CategoryStore.getAll();
    if (categories.find(c => c.id === id)) {
      showCatFeedback('❌ Ya existe una categoría con este ID.', 'error');
      return;
    }
    
    CategoryStore.add({ id, label, emoji });
    
    document.getElementById('cat-emoji').value = '';
    document.getElementById('cat-id').value = '';
    document.getElementById('cat-label').value = '';
    
    renderCategoriesList();
    showToast('🏷️ Categoría creada exitosamente.');
    
    // Forzar renderizado de selectores
    const filterCat = document.getElementById('filter-cat');
    if (filterCat) filterCat.innerHTML = `<option value="all">Todas las categorías</option>`;
  });
  
  function showCatFeedback(msg, type) {
    const feedback = document.getElementById('cat-feedback');
    if (feedback) {
      feedback.textContent = msg;
      feedback.className = 'cat-feedback ' + type;
      setTimeout(() => { feedback.textContent = ''; feedback.className = 'cat-feedback'; }, 3000);
    }
  }
}
// Eliminar Categoría
window.deleteCategory = function(id) {
  CategoryStore.delete(id);
  renderCategoriesList();
  showToast('🗑️ Categoría eliminada.');
  
  // Forzar recarga de selectores
  const filterCat = document.getElementById('filter-cat');
  if (filterCat) filterCat.innerHTML = `<option value="all">Todas las categorías</option>`;
};
// ==========================================
// 8. AJUSTES (CAMBIAR CREDENCIALES)
// ==========================================
function setupSettingsTab() {
  const emailField = document.getElementById('settings-email');
  const oldPassField = document.getElementById('settings-oldpass');
  const newPassField = document.getElementById('settings-newpass');
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const feedback = document.getElementById('settings-feedback');
  
  // Rellenar correo actual
  const creds = AdminStore.getCredentials();
  if (emailField) emailField.value = creds.email;
  
  if (btnSaveSettings) {
    btnSaveSettings.addEventListener('click', () => {
      const email = emailField.value.trim();
      const oldPass = oldPassField.value.trim();
      const newPass = newPassField.value.trim();
      
      if (!email || !oldPass) {
        showSettingsFeedback('⚠️ Por favor completa el Correo y tu Contraseña Actual.', 'error');
        return;
      }
      
      const currentCreds = AdminStore.getCredentials();
      
      // Validar contraseña actual
      if (oldPass !== currentCreds.pass) {
        showSettingsFeedback('❌ La contraseña actual ingresada es incorrecta.', 'error');
        return;
      }
      
      // Si cambia contraseña
      if (newPass) {
        if (newPass.length < 4) {
          showSettingsFeedback('⚠️ La nueva contraseña debe tener al menos 4 caracteres.', 'error');
          return;
        }
        currentCreds.pass = newPass;
      }
      
      currentCreds.email = email;
      AdminStore.saveCredentials(currentCreds);
      
      oldPassField.value = '';
      newPassField.value = '';
      
      showToast('⚙️ Ajustes guardados con éxito.');
      showSettingsFeedback('✅ Credenciales actualizadas correctamente.', 'success');
    });
  }
  
  function showSettingsFeedback(msg, type) {
    if (feedback) {
      feedback.textContent = msg;
      feedback.className = 'settings-feedback ' + type;
      setTimeout(() => { feedback.textContent = ''; feedback.className = 'settings-feedback'; }, 3500);
    }
  }
}
// TOAST LOCAL
function showToast(msg) {
  const toast = document.getElementById('admin-toast');
  if (toast) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}
