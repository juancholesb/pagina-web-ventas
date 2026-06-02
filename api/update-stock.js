const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

module.exports = async function (req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Missing Supabase server credentials' });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const body = req.body;
  if (!body || !Array.isArray(body.items)) return res.status(400).json({ error: 'Invalid payload' });

  const updated = [];

  try {
    for (const it of body.items) {
      const id = it.id;
      const qty = Number(it.qty) || 0;
      if (!id) continue;

      // Obtener stock actual
      const { data: prod, error: fetchErr } = await supabase.from('products').select('stock').eq('id', id).single();
      if (fetchErr) {
        console.warn('fetch product error', fetchErr);
        continue;
      }

      const currentStock = Number(prod.stock) || 0;
      const newStock = Math.max(0, currentStock - qty);

      const { data: up, error: upErr } = await supabase.from('products').update({ stock: newStock }).eq('id', id).select('id,stock');
      if (upErr) {
        console.warn('update product error', upErr);
        continue;
      }

      if (Array.isArray(up) && up.length) {
        updated.push({ id: up[0].id, stock: up[0].stock });
      }
    }

    return res.status(200).json({ ok: true, updated });
  } catch (e) {
    console.error('update-stock error', e);
    return res.status(500).json({ error: 'Internal error' });
  }
};
