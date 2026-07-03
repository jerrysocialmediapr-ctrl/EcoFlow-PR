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
    const producto = body.producto || body.anotaciones || '';

    const payload = {
      token: gasToken,
      action: 'addLead',
      nombre: body.nombre || '',
      email: body.email || '',
      telefono: body.telefono || '',
      pueblo: body.pueblo || '',
      factura: body.factura || '',
      origen: body.origen || 'EcoFlow PR Website',
      gclid: body.gclid || '',
      gbraid: body.gbraid || '',
      wbraid: body.wbraid || '',
      fbclid: body.fbclid || '',
      utm_source: body.utm_source || '',
      utm_medium: body.utm_medium || '',
      utm_campaign: body.utm_campaign || '',
      utm_content: body.utm_content || '',
      utm_term: body.utm_term || '',
      landing_page: body.landing_page || '',
      referrer: body.referrer || '',
      anotaciones: body.anotaciones || producto,
      producto: producto,
      notifyAdmin: true,
      sendClientEmail: true,
      sourceMode: 'external',
      dedupeMode: 'merge'
    };

    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok || data.error) {
      return res.status(500).json({
        ok: false,
        error: data.error || 'GAS respondió con error',
        message: data.message || '',
        gasResponse: data
      });
    }

    return res.status(200).json({ ok: true, gasResponse: data });
  } catch (error) {
    return res.status(500).json({ error: 'Error enviando lead', message: error.message });
  }
}
