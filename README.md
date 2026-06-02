# Página Web de Ventas - Mi Negocio

Una página web moderna y responsiva para tu tienda online, lista para personalizar y subir a tu servidor.

## � Pasos rápidos para que funcione la sincronización

1. Sube este repositorio a GitHub.
2. En Vercel, crea un proyecto nuevo y conéctalo con tu repositorio.
3. Agrega estas variables de entorno en Vercel:
   - `SUPABASE_URL` = tu URL de Supabase
   - `SUPABASE_ANON_KEY` = tu anon key de Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` = tu service role key de Supabase (secreto)
4. Despliega el proyecto en Vercel.
5. Abre la página en dos dispositivos o pestañas y prueba:
   - modificar productos en uno
   - observar que el otro se actualiza

> Si te parece difícil, haz solo estos pasos: subir a GitHub, conectar a Vercel y configurar las tres variables.

## �📁 Estructura de Carpetas

```
paginaweb ventas/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos CSS
├── js/
│   └── script.js       # Funcionalidad JavaScript
├── images/             # Tus imágenes (agrega aquí tus fotos)
├── assets/             # Otros archivos (iconos, fuentes, etc.)
└── README.md           # Este archivo
```

## 🎨 Características

✅ Diseño responsive (mobile, tablet, desktop)
✅ Carrito de compras interactivo
✅ Sección de productos con galería
✅ Formulario de contacto
✅ Navbar sticky con menú hamburguesa
✅ Secciones: Hero, Productos, Características, Galería, Contacto
✅ Redes sociales integradas
✅ Animaciones suaves
✅ Optimizado para SEO básico

## 🚀 Cómo Usar

### 1. **Personalizar la Página**

**En `index.html`:**
- Cambia "Mi Negocio" por el nombre de tu negocio
- Modifica teléfono, email y dirección en la sección contacto
- Actualiza los enlaces de redes sociales

**En `css/styles.css`:**
- Cambia los colores en las variables CSS (línea 1-10)
- Ajusta los colores primarios para tu marca

**En `js/script.js`:**
- Toda la lógica ya está lista para funcionar

### 2. **Agregar Tus Productos**

Edita la sección de productos en `index.html`:
```html
<div class="producto-card">
    <div class="producto-imagen">
        <img src="images/tu-imagen.jpg" alt="Tu Producto">
    </div>
    <div class="producto-info">
        <h3>Nombre de tu producto</h3>
        <p>Descripción del producto</p>
        <div class="producto-footer">
            <span class="precio">$XX.XX</span>
            <button class="btn-agregar" onclick="agregarCarrito('Nombre', XX.XX)">
                <i class="fas fa-plus"></i> Agregar
            </button>
        </div>
    </div>
</div>
```

### 3. **Agregar Tus Imágenes**

- Crea carpetas dentro de `images/` para organizar tus fotos
- Reemplaza las URLs `https://via.placeholder.com/` con tus propias imágenes
- Usa rutas relativas: `images/mi-imagen.jpg`

### 4. **Subir a tu Servidor**

#### Opción A: Hosting Gratuito (Recomendado para empezar)

1. **GitHub Pages** (Gratis)
   - Sube toda la carpeta a GitHub
   - Activa GitHub Pages en las configuraciones
   - Tu página estará en: `https://tuusuario.github.io/paginaweb-ventas`

2. **Netlify** (Gratis)
   - Arrastra y suelta la carpeta en netlify.com
   - Obtén un dominio temporal gratuito

3. **Vercel** (Gratis)
   - Conecta tu repositorio de GitHub
   - Despliega automáticamente

#### Opción B: Hosting de Pago

1. Contrata un hosting (GoDaddy, Hostinger, Bluehost, etc.)
2. Accede al gestor de archivos (cPanel, File Manager)
3. Sube todos los archivos a la carpeta `public_html` o `www`
4. Accede a tu dominio

### 5. **Agregar Dominio Personalizado**

- Si usas GitHub Pages, Netlify o Vercel, puedes apuntar tu dominio
- Sigue las instrucciones del servicio para configurar DNS

## 🛠️ Personalización Avanzada

### Cambiar Colores

En `css/styles.css`, líneas 1-10, modifica:
```css
:root {
    --primary-color: #007bff;      /* Color principal (azul) */
    --secondary-color: #6c757d;    /* Color secundario (gris) */
    --success-color: #28a745;      /* Color de éxito (verde) */
    --danger-color: #dc3545;       /* Color de alerta (rojo) */
    /* ... más colores */
}
```

### Agregar Más Secciones

Agrega nuevas secciones en `index.html` siguiendo el patrón existente.

### Integración de Pagos

Para aceptar pagos reales, integra:
- **PayPal** - Fácil de configurar
- **Stripe** - Profesional
- **MercadoPago** - Para Latinoamérica

## 📱 Características del Código

- **Menú responsive**: Se adapta a dispositivos móviles
- **Carrito de compras**: Funciona sin backend
- **Formulario de contacto**: Envía alertas (necesita backend para email real)
- **Galería interactiva**: Imágenes con efecto hover
- **Animaciones**: Transiciones suaves en todo

## ⚙️ Configuración de Email (Opcional)

Para recibir emails desde el formulario de contacto, necesitas:

1. Un servicio como **Formspree**, **EmailJS** o **Netlify Forms**
2. O un backend PHP/Node.js

### Con Formspree (Gratis):
```html
<!-- Reemplaza en index.html -->
<form action="https://formspree.io/f/xyzabc" method="POST">
    <!-- Tu formulario -->
</form>
```

## 🔍 SEO Básico

Para mejorar en buscadores:

1. Edita el `<title>` en `index.html`
2. Agrega una meta description
3. Usa palabras clave relevantes en headings
4. Asegúrate de que todas las imágenes tengan atributo `alt`

## 📞 Soporte

Si necesitas ayuda:
- Revisa la estructura HTML
- Verifica la consola del navegador (F12) para errores
- Comprueba las rutas de las imágenes
- Asegúrate de que los archivos CSS y JS están en sus carpetas

## 📄 Licencia

Esta página es tuya para personalizar y usar como desees.

---

**¡Lista para vender online!** 🎉

Personaliza, sube y comienza a recibir pedidos.
