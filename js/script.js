// Carrito de compras
let carrito = [];

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const navbarMenu = document.querySelector('.navbar-menu');

hamburger.addEventListener('click', () => {
    navbarMenu.classList.toggle('active');
});

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.navbar-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navbarMenu.classList.remove('active');
    });
});

// Función para agregar productos al carrito
function agregarCarrito(nombre, precio) {
    carrito.push({
        id: Date.now(),
        nombre: nombre,
        precio: precio
    });
    
    actualizarCarrito();
    mostrarNotificacion(`${nombre} agregado al carrito!`);
}

// Función para eliminar productos del carrito
function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    actualizarCarrito();
}

// Actualizar carrito
function actualizarCarrito() {
    // Actualizar contador
    document.getElementById('carrito-count').textContent = carrito.length;
    
    // Actualizar items en el modal
    const carritoItems = document.getElementById('carrito-items');
    carritoItems.innerHTML = '';
    
    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p style="text-align: center; color: #999;">Tu carrito está vacío</p>';
    } else {
        carrito.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'carrito-item';
            itemDiv.innerHTML = `
                <div class="carrito-item-info">
                    <h4>${item.nombre}</h4>
                    <span class="carrito-item-precio">$${item.precio.toFixed(2)}</span>
                </div>
                <button class="carrito-item-eliminar" onclick="eliminarDelCarrito(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            carritoItems.appendChild(itemDiv);
        });
    }
    
    // Actualizar total
    const total = carrito.reduce((sum, item) => sum + item.precio, 0);
    document.getElementById('total-precio').textContent = total.toFixed(2);
}

// Abrir carrito
document.querySelector('.carrito-icon').addEventListener('click', (e) => {
    e.preventDefault();
    abrirCarrito();
});

function abrirCarrito() {
    document.getElementById('carrito-modal').classList.add('show');
}

// Cerrar carrito
function cerrarCarrito() {
    document.getElementById('carrito-modal').classList.remove('show');
}

// Cerrar modal al hacer clic fuera
window.addEventListener('click', (e) => {
    const modal = document.getElementById('carrito-modal');
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

// Realizar compra
function realizarCompra() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    const total = carrito.reduce((sum, item) => sum + item.precio, 0);
    alert(`¡Gracias por tu compra!\n\nTotal: $${total.toFixed(2)}\n\nTe contactaremos pronto para confirmar tu pedido.`);
    
    // Limpiar carrito
    carrito = [];
    actualizarCarrito();
    cerrarCarrito();
}

// Formulario de contacto
document.getElementById('contacto-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    alert('¡Gracias por tu mensaje!\n\nNos pondremos en contacto pronto.');
    this.reset();
});

// Notificación temporal
function mostrarNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        animation: slideInUp 0.3s ease;
    `;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideInDown 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

// Lazy loading de imágenes (opcional)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '1';
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img').forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        imageObserver.observe(img);
    });
}

// Smooth scroll para navegación (ya está en CSS pero aquí como fallback)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#carrito') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Inicializar carrito al cargar
actualizarCarrito();
