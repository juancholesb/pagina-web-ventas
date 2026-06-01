// ===== CANVAS =====
(function(){
  const c=document.getElementById('bg-canvas'),ctx=c.getContext('2d');
  let W,H,pts=[];
  function resize(){W=c.width=innerWidth;H=c.height=innerHeight;}
  resize();window.addEventListener('resize',resize);
  class P{constructor(){this.reset();}reset(){this.x=Math.random()*W;this.y=Math.random()*H;this.vx=(Math.random()-.5)*.35;this.vy=(Math.random()-.5)*.35;this.r=Math.random()*1.6+.4;this.a=Math.random()*.3+.05;this.col=Math.random()>.5?'180,79,255':'255,79,216';}}
  for(let i=0;i<80;i++)pts.push(new P());
  (function loop(){ctx.clearRect(0,0,W,H);pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W||p.y<0||p.y>H)p.reset();ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(${p.col},${p.a})`;ctx.fill();});requestAnimationFrame(loop);})();
})();

// ===== AUTH =====
const PASS = 'cbflow2025';
document.getElementById('login-btn').addEventListener('click', tryLogin);
document.getElementById('ap').addEventListener('keydown', e => { if(e.key==='Enter') tryLogin(); });

function tryLogin() {
  if (document.getElementById('ap').value === PASS) {
    sessionStorage.setItem('cbadmin','1');
    document.getElementById('login-wrap').style.display = 'none';
    document.getElementById('panel').style.display = 'flex';
    initPanel();
  } else {
    document.getElementById('login-err').classList.add('on');
    setTimeout(()=>document.getElementById('login-err').classList.remove('on'), 2500);
  }
}

document.getElementById('logout-btn').addEventListener('click', () => {
  sessionStorage.removeItem('cbadmin');
  document.getElementById('panel').style.display = 'none';
  document.getElementById('login-wrap').style.display = 'flex';
  document.getElementById('ap').value = '';
});

if (sessionStorage.getItem('cbadmin')==='1') {
  document.getElementById('login-wrap').style.display = 'none';
  document.getElementById('panel').style.display = 'flex';
  initPanel();
}

// ===== TABS =====
function initPanel() {
  document.querySelectorAll('.si[data-tab]').forEach(s => {
    s.addEventListener('click', e => {
      e.preventDefault();
      const t = s.dataset.tab;
      document.querySelectorAll('.si').forEach(x=>x.classList.remove('active'));
      s.classList.add('active');
      document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));
      document.getElementById('tab-'+t).classList.add('on');
      document.getElementById('page-title').textContent =
        {dashboard:'Dashboard',products:'Productos',add:'Agregar Producto',categories:'Categorías'}[t]||t;
      if(t==='dashboard') renderDash();
      if(t==='products') renderTable();
      if(t==='categories') renderCats();
      if(t==='add') { populateCatSelect(); updatePreview(); }
    });
  });
  renderDash();
  populateCatSelect();
  setupForm();
  setupCatForm();
  setupConfirm();
}

function switchTab(t) {
  document.querySelectorAll('.si[data-tab]').forEach(s=>s.classList.remove('active'));
  const s = document.querySelector(`.si[data-tab="${t}"]`);
  if(s) s.classList.add('active');
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));
  document.getElementById('tab-'+t).classList.add('on');
  document.getElementById('page-title').textContent =
    {dashboard:'Dashboard',products:'Productos',add:'Agregar Producto',categories:'Categorías'}[t]||t;
}

// ===== FORMAT =====
function fmt(n){return '$'+Number(n).toLocaleString('es-CO');}

// ===== DASHBOARD =====
function renderDash() {
  const prods = ProductStore.getAll();
  const cats = CategoryStore.getAll();
  document.getElementById('st-total').textContent = prods.length;
  document.getElementById('st-cats').textContent = cats.length;
  document.getElementById('st-hot').textContent = prods.filter(p=>p.badge).length;
  document.getElementById('st-stock').textContent = prods.reduce((s,p)=>s+Number(p.stock),0);
  const recent = [...prods].reverse().slice(0,8);
  document.getElementById('recent-grid').innerHTML = recent.map(p=>`
    <div class="rc">
      ${p.img
        ? `<img class="rc-img" src="${p.img}" alt="${p.name}"/>`
        : `<span class="rc-emo">${p.emoji||'💨'}</span>`}
      <div>
        <div class="rc-name">${p.name}</div>
        <div class="rc-price">${fmt(p.price)}</div>
      </div>
    </div>`).join('');
}

// ===== PRODUCTS TABLE =====
let delId = null;

function renderTable(filter='all', search='') {
  let prods = ProductStore.getAll();
  if(filter!=='all') prods=prods.filter(p=>p.category===filter);
  if(search) prods=prods.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));
  const cats = CategoryStore.getAll();

  // populate filter select
  const sel = document.getElementById('filter-cat');
  const cur = sel.value;
  sel.innerHTML = '<option value="all">Todas las categorías</option>' +
    cats.map(c=>`<option value="${c.id}" ${cur===c.id?'selected':''}>${c.emoji} ${c.label}</option>`).join('');

  const tb = document.getElementById('ptbody');
  if(!prods.length){
    tb.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--text2);padding:40px">No hay productos</td></tr>';
    return;
  }
  tb.innerHTML = prods.map(p=>{
    const cat=cats.find(c=>c.id===p.category);
    const catLabel=cat?`${cat.emoji} ${cat.label}`:p.category;
    return `<tr>
      <td><div class="td-prod">
        ${p.img?`<img class="td-thumb" src="${p.img}"/>`:`<span class="td-emo">${p.emoji||'💨'}</span>`}
        <div><div class="td-pname">${p.name}</div><div class="td-pid">#${p.id}</div></div>
      </div></td>
      <td><span class="td-cat">${catLabel}</span></td>
      <td><span class="td-price">${fmt(p.price)}</span></td>
      <td><span class="td-stock ${p.stock<=5?'low':'ok'}">${p.stock}</span></td>
      <td>${p.badge?`<span class="bp bp-${p.badge}">${p.badgeLabel||p.badge}</span>`:'—'}</td>
      <td><div class="td-acts">
        <button class="btn-ed" onclick="editProd(${p.id})">✏️ Editar</button>
        <button class="btn-dl" onclick="askDelete(${p.id})">🗑️</button>
      </div></td>
    </tr>`;}).join('');
}

document.getElementById('search-p').addEventListener('input', e => renderTable(document.getElementById('filter-cat').value, e.target.value));
document.getElementById('filter-cat').addEventListener('change', e => renderTable(e.target.value, document.getElementById('search-p').value));

// ===== DELETE =====
function askDelete(id){ delId=id; document.getElementById('confirm-ov').classList.add('on'); }
function setupConfirm(){
  document.getElementById('conf-no').addEventListener('click',()=>{ document.getElementById('confirm-ov').classList.remove('on'); delId=null; });
  document.getElementById('conf-yes').addEventListener('click',()=>{
    if(delId!==null){ ProductStore.delete(delId); document.getElementById('confirm-ov').classList.remove('on'); delId=null; renderTable(); renderDash(); toast('🗑️ Producto eliminado'); }
  });
}

// ===== IMAGE UPLOAD =====
let currentImgData = null;

document.getElementById('img-preview').addEventListener('click', ()=> document.getElementById('f-img').click());
document.getElementById('btn-pick-img').addEventListener('click', ()=> document.getElementById('f-img').click());

document.getElementById('f-img').addEventListener('change', e => {
  const file = e.target.files[0];
  if(!file) return;
  if(file.size > 2*1024*1024){ toast('⚠️ Imagen muy grande (máx 2MB)'); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    currentImgData = ev.target.result;
    showImgPreview(currentImgData);
    updatePreview();
  };
  reader.readAsDataURL(file);
});

// Drag & drop
const uploadArea = document.getElementById('img-preview');
uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.style.borderColor='var(--acc)'; });
uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor=''; });
uploadArea.addEventListener('drop', e => {
  e.preventDefault(); uploadArea.style.borderColor='';
  const file = e.dataTransfer.files[0];
  if(!file||!file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = ev => { currentImgData = ev.target.result; showImgPreview(currentImgData); updatePreview(); };
  reader.readAsDataURL(file);
});

function showImgPreview(src){
  document.getElementById('img-placeholder').style.display='none';
  const img = document.getElementById('img-result');
  img.src=src; img.style.display='block';
  document.getElementById('btn-rm-img').style.display='block';
}
function clearImgPreview(){
  currentImgData=null;
  document.getElementById('img-placeholder').style.display='block';
  const img=document.getElementById('img-result'); img.src=''; img.style.display='none';
  document.getElementById('btn-rm-img').style.display='none';
  document.getElementById('f-img').value='';
}
document.getElementById('btn-rm-img').addEventListener('click', ()=>{ clearImgPreview(); updatePreview(); });

// ===== CAT SELECT =====
function populateCatSelect(){
  const cats=CategoryStore.getAll();
  const sel=document.getElementById('f-cat');
  const prev=sel.value;
  sel.innerHTML='<option value="">Selecciona...</option>'+cats.map(c=>`<option value="${c.id}">${c.emoji} ${c.label}</option>`).join('');
  if(prev) sel.value=prev;
}

// ===== PREVIEW =====
function updatePreview(){
  const name=document.getElementById('f-name').value||'Nombre del producto';
  const price=document.getElementById('f-price').value?fmt(Number(document.getElementById('f-price').value)):'$0';
  const emoji=document.getElementById('f-emoji').value||'💨';
  document.getElementById('prev-name').textContent=name;
  document.getElementById('prev-price').textContent=price;
  const prevImg=document.getElementById('prev-img');
  if(currentImgData){
    prevImg.innerHTML=`<img src="${currentImgData}" style="width:52px;height:52px;object-fit:cover;border-radius:10px"/>`;
  } else {
    prevImg.innerHTML=`<span id="prev-emo">${emoji}</span>`;
  }
}

// ===== FORM =====
let editingId=null;
const BADGE_LABELS={new:'NUEVO',sale:'OFERTA',hot:'HOT'};

function setupForm(){
  ['f-name','f-emoji','f-price'].forEach(id=>document.getElementById(id).addEventListener('input',updatePreview));
  document.getElementById('btn-save').addEventListener('click', saveProd);
  document.getElementById('btn-cancel-edit').addEventListener('click', resetForm);
}

function saveProd(){
  const name=document.getElementById('f-name').value.trim();
  const cat=document.getElementById('f-cat').value;
  const emoji=document.getElementById('f-emoji').value.trim()||'💨';
  const price=Number(document.getElementById('f-price').value);
  const oldPrice=Number(document.getElementById('f-oldprice').value)||null;
  const stock=Number(document.getElementById('f-stock').value);
  const badge=document.getElementById('f-badge').value||null;
  const desc=document.getElementById('f-desc').value.trim();
  const fb=document.getElementById('form-feedback');

  if(!name||!cat||!price||!stock||!desc){
    fb.textContent='⚠️ Completa todos los campos obligatorios'; fb.className='form-feedback err'; return;
  }

  const cats=CategoryStore.getAll();
  const catObj=cats.find(c=>c.id===cat);

  const prod={name,category:cat,categoryLabel:catObj?`${catObj.emoji} ${catObj.label}`:cat,emoji,price,oldPrice,stock,badge,badgeLabel:badge?BADGE_LABELS[badge]:null,desc,img:currentImgData||null,featured:false};

  if(editingId!==null){ ProductStore.update(editingId,prod); toast('✅ Producto actualizado'); }
  else { ProductStore.add(prod); toast('✅ Producto guardado'); }

  fb.textContent=editingId!==null?'✅ Actualizado exitosamente':'✅ Guardado exitosamente';
  fb.className='form-feedback ok';
  setTimeout(()=>{fb.textContent='';},3000);
  editingId=null;
  resetForm();
  renderDash();
}

function editProd(id){
  const p=ProductStore.getAll().find(x=>x.id===id);
  if(!p) return;
  editingId=id;
  document.getElementById('f-name').value=p.name;
  document.getElementById('f-emoji').value=p.emoji||'';
  document.getElementById('f-price').value=p.price;
  document.getElementById('f-oldprice').value=p.oldPrice||'';
  document.getElementById('f-stock').value=p.stock;
  document.getElementById('f-badge').value=p.badge||'';
  document.getElementById('f-desc').value=p.desc;
  populateCatSelect();
  document.getElementById('f-cat').value=p.category;
  if(p.img){ currentImgData=p.img; showImgPreview(p.img); } else { clearImgPreview(); }
  document.getElementById('form-ttl').textContent='✏️ Editar Producto';
  document.getElementById('btn-cancel-edit').style.display='block';
  updatePreview();
  switchTab('add');
}

function resetForm(){
  editingId=null;
  ['f-name','f-emoji','f-price','f-oldprice','f-stock','f-desc'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('f-cat').value='';
  document.getElementById('f-badge').value='';
  clearImgPreview();
  document.getElementById('form-ttl').textContent='➕ Agregar Producto';
  document.getElementById('btn-cancel-edit').style.display='none';
  document.getElementById('form-feedback').textContent='';
  updatePreview();
}

// ===== CATEGORIES =====
function setupCatForm(){
  document.getElementById('btn-add-cat').addEventListener('click', addCat);
}

function addCat(){
  const emoji=document.getElementById('cat-emoji').value.trim()||'📦';
  const id=document.getElementById('cat-id').value.trim().toLowerCase().replace(/\s+/g,'_');
  const label=document.getElementById('cat-label').value.trim();
  const fb=document.getElementById('cat-feedback');
  if(!id||!label){ fb.textContent='⚠️ Completa ID y nombre'; fb.className='cat-feedback err'; return; }
  const existing=CategoryStore.getAll();
  if(existing.find(c=>c.id===id)){ fb.textContent='⚠️ Ya existe una categoría con ese ID'; fb.className='cat-feedback err'; return; }
  CategoryStore.add({id,label,emoji});
  fb.textContent='✅ Categoría agregada'; fb.className='cat-feedback ok';
  document.getElementById('cat-emoji').value='';
  document.getElementById('cat-id').value='';
  document.getElementById('cat-label').value='';
  setTimeout(()=>{fb.textContent='';},2500);
  renderCats();
  populateCatSelect();
  toast('✅ Categoría agregada');
}

function renderCats(){
  const cats=CategoryStore.getAll();
  const list=document.getElementById('cats-list');
  if(!cats.length){ list.innerHTML='<p style="color:var(--text2);font-size:.88rem">No hay categorías. Agrega una arriba.</p>'; return; }
  list.innerHTML=cats.map(c=>`
    <div class="cat-row">
      <span class="cat-row-emo">${c.emoji}</span>
      <div class="cat-row-name">
        <div class="cat-row-label">${c.label}</div>
        <div class="cat-row-id">ID: ${c.id}</div>
      </div>
      <button class="btn-del-cat" onclick="deleteCat('${c.id}')">🗑️ Eliminar</button>
    </div>`).join('');
}

function deleteCat(id){
  CategoryStore.delete(id);
  renderCats();
  populateCatSelect();
  toast('🗑️ Categoría eliminada');
}

// ===== TOAST =====
function toast(msg){
  const t=document.getElementById('admin-toast');
  t.textContent=msg; t.classList.add('on');
  setTimeout(()=>t.classList.remove('on'),2800);
}
