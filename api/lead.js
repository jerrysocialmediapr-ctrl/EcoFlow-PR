export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const gasUrl = process.env.GAS_URL;
    const gasToken = process.env.GAS_TOKEN;
    if (!gasUrl) return res.status(500).json({ error: 'Falta GAS_URL en Vercel' });
    if (!gasToken) return res.status(500).json({ error: 'Falta GAS_TOKEN en Vercel' });
 
    const body = req.body || {};
 
    const payload = {
      token:       gasToken,
      action:      'addLead',
      nombre:      body.nombre      || '',
      email:       body.email       || '',
      telefono:    body.telefono    || '',
      pueblo:      body.pueblo      || '',
      factura:     body.factura     || '',
      origen:      body.origen      || 'EcoFlow PR Website',
      gclid:       body.gclid       || '',
      fbclid:      body.fbclid      || '',
      anotaciones: body.anotaciones || '',
      // ✅ FIX: pasar el producto explícitamente para que el email sea correcto
      producto:    body.anotaciones || ''
    };
 
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
 
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
 
    return res.status(200).json({ ok: true, gasResponse: data });
  } catch (error) {
    return res.status(500).json({ error: 'Error enviando lead', message: error.message });
  }
}
