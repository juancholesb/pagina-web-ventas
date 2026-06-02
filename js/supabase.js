// Configuración de Supabase (usa variables globales si están definidas por el host)
// En Vercel puedes inyectar `SUPABASE_URL` y `SUPABASE_ANON_KEY` en el build y exponerlas
const SUPABASE_URL = (typeof window !== 'undefined' && (window.SUPABASE_URL || (window.__SUPABASE && window.__SUPABASE.URL))) || 'https://kwjvztmmnhphxfzlzmxe.supabase.co';
const SUPABASE_ANON_KEY = (typeof window !== 'undefined' && (window.SUPABASE_ANON_KEY || (window.__SUPABASE && window.__SUPABASE.ANON_KEY))) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3anZ6dG1tbmhwaHhmemx6bXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNTU3NDgsImV4cCI6MjA5NTkzMTc0OH0.2RZf386cG2x2qWoSFhcYmEFu5JHEQ8CD_q4sY62n_z4';

const supabaseClient = (typeof supabase !== 'undefined' && SUPABASE_URL && !SUPABASE_URL.includes('YOUR_PROJECT_ID'))
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const SupabaseStore = {
  isConfigured() {
    return supabaseClient !== null;
  },

  async fetchCategories() {
    if (!this.isConfigured()) return null;
    const { data, error } = await supabaseClient
      .from('categories')
      .select('*')
      .order('label', { ascending: true });
    if (error) {
      console.warn('Supabase categories fetch failed:', error.message);
      return null;
    }
    return data;
  },

  async fetchProducts() {
    if (!this.isConfigured()) return null;
    const { data, error } = await supabaseClient
      .from('products')
      .select('*, variants(*)')
      .order('id', { ascending: true });
    if (error) {
      console.warn('Supabase products fetch failed:', error.message);
      return null;
    }
    return data.map(this.normalizeProductRow);
  },

  normalizeProductRow(row) {
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      price: Number(row.price) || 0,
      oldPrice: row.old_price !== null ? Number(row.old_price) : null,
      emoji: row.emoji || '📦',
      img: row.img || null,
      description: row.description || row.desc || '',
      badge: row.badge || null,
      badgeLabel: row.badge_label || null,
      stock: Number(row.stock) || 0,
      featured: row.featured || false,
      variants: Array.isArray(row.variants)
        ? row.variants.map(v => ({
            id: v.id,
            name: v.name,
            price: Number(v.price) || 0,
            stock: Number(v.stock) || 0,
            img: v.img || null,
            note: v.note || ''
          }))
        : []
    };
  },

  async syncToLocal() {
    if (!this.isConfigured()) return;
    const categories = await this.fetchCategories();
    if (categories) {
      CategoryStore.save(categories);
    }

    const products = await this.fetchProducts();
    if (products) {
      ProductStore.save(products);
    }
  },

  // Iniciar suscripciones en tiempo real para mantener clientes sincronizados
  startRealtime() {
    if (!this.isConfigured() || this._realtimeStarted) return;
    // Detener cualquier polling previo antes de iniciar realtime
    if (this._pollHandle) this.stopPolling();

    const onChange = (payload) => {
      try {
        console.debug('Supabase realtime change:', payload);
        // Re-sincronizar local y notificar a la UI
        this.syncToLocal();
        window.dispatchEvent(new Event('supabase:change'));
      } catch (e) {
        console.warn('Error handling realtime payload', e);
      }
    };

    // Subscribir a cambios en products, variants y categories
    try {
      supabaseClient
        .channel('realtime-products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, onChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'variants' }, onChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, onChange)
        .subscribe();
      // Marcar realtime como iniciado si llegamos hasta aquí
      this._realtimeStarted = true;
    } catch (err) {
      console.warn('Supabase realtime subscribe failed:', err && err.message ? err.message : err);
      // Si falla, iniciar polling como fallback
      try { this.startPolling(15000); } catch (e) {}
    }
  },

  startPolling(intervalMs = 15000) {
    if (!this.isConfigured()) return;
    if (this._pollHandle) return; // ya en polling
    this._pollHandle = setInterval(async () => {
      try {
        await this.syncToLocal();
        window.dispatchEvent(new Event('supabase:sync'));
        console.debug('Supabase polling: sync completed');
      } catch (e) {
        console.warn('Supabase polling error', e);
      }
    }, intervalMs);
    console.info('Supabase polling started', intervalMs);
  },

  stopPolling() {
    if (this._pollHandle) {
      clearInterval(this._pollHandle);
      this._pollHandle = null;
      console.info('Supabase polling stopped');
    }
  },

  async saveProduct(product) {
    if (!this.isConfigured()) return;
    try {
      const { data: prodData, error: prodError } = await supabaseClient
        .from('products')
        .upsert([{
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          old_price: product.oldPrice,
          emoji: product.emoji,
          img: product.img,
          description: product.description,
          badge: product.badge,
          badge_label: product.badgeLabel,
          stock: product.stock,
          featured: product.featured
        }], { onConflict: 'id' });

      if (prodError) {
        console.warn('Supabase product upsert failed:', prodError.message);
        return;
      }

      const productId = prodData?.[0]?.id || product.id;

      if (Array.isArray(product.variants)) {
        await supabaseClient.from('variants').delete().eq('product_id', productId);
        const variantsPayload = product.variants
          .filter(v => v.name && v.price)
          .map(v => ({
            id: v.id,
            product_id: productId,
            name: v.name,
            price: v.price,
            stock: v.stock,
            img: v.img,
            note: v.note || ''
          }));

        if (variantsPayload.length > 0) {
          const { error: variantsError } = await supabaseClient
            .from('variants')
            .insert(variantsPayload);
          if (variantsError) {
            console.warn('Supabase variants save failed:', variantsError.message);
          }
        }
      }
    } catch (error) {
      console.warn('Supabase saveProduct error:', error);
    }
  },

  async deleteProduct(id) {
    if (!this.isConfigured()) return;
    const { error } = await supabaseClient.from('products').delete().eq('id', id);
    if (error) {
      console.warn('Supabase delete product failed:', error.message);
    }
  }
};
