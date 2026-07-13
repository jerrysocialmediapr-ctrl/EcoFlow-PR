import crypto from 'crypto';

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
    const gasUrl = 'https://script.google.com/macros/s/AKfycbxi2ATuJrRfzBysZqxl8NzGhEIsVf8grL1Ti5EcWRSi6NeGZc-gRVz2BqlVpDIeQ-4C/exec';
    const gasToken = process.env.GAS_TOKEN;

    if (!gasToken) return res.status(500).json({ error: 'Falta GAS_TOKEN en Vercel' });

    const body = req.body || {};
    const leadId = String(body.id || '').trim();
    const token = String(body.token || '').trim();
    const interest = String(body.interest || '').trim().toLowerCase();

    if (!leadId || !token || !['yes', 'no'].includes(interest)) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos' });
    }

    // 1. Calculate token hash
    const computedHash = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Query GAS to get the quote details
    // We send action: 'getQuote' with leadId and tokenHash
    const getQuotePayload = {
      token: gasToken,
      action: 'getQuote',
      leadId,
      tokenHash: computedHash
    };

    const quoteResponse = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(getQuotePayload)
    });

    const quoteText = await quoteResponse.text();
    let quoteData;
    try {
      quoteData = JSON.parse(quoteText);
    } catch {
      quoteData = { raw: quoteText };
    }

    if (!quoteResponse.ok || quoteData.error) {
      return res.status(400).json({ ok: false, error: 'La cotización o el token son inválidos' });
    }

    // Verify token hash timing safety (timingSafeEqual)
    const storedHash = quoteData["Token Hash"];
    if (!storedHash) {
      return res.status(400).json({ ok: false, error: 'Token inválido' });
    }

    const bufA = Buffer.from(computedHash, 'utf8');
    const bufB = Buffer.from(storedHash, 'utf8');
    if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
      return res.status(400).json({ ok: false, error: 'Token inválido' });
    }

    // 3. Verify expiration
    const expirationStr = quoteData["Token Expiration"];
    if (!expirationStr) {
      return res.status(400).json({ ok: false, error: 'Token expirado o inválido' });
    }

    const expirationDate = new Date(expirationStr);
    if (isNaN(expirationDate.getTime()) || Date.now() > expirationDate.getTime()) {
      return res.status(400).json({ ok: false, error: 'El enlace ha expirado' });
    }

    // 4. Check if already responded (Idempotency)
    const currentResponse = quoteData["Respuesta"];
    const expectedResponse = interest === 'yes' ? 'Interesado' : 'No interesado';
    if (currentResponse === expectedResponse) {
      return res.status(200).json({ ok: true, status: 'already_processed', message: 'Respuesta ya registrada anteriormente' });
    }

    // 5. Update quote and lead status in GAS (Step 2)
    const quoteId = quoteData["Quote ID"];
    const leadStatus = interest === 'yes' ? 'Interesado' : 'No interesado';

    const updatePayload = {
      token: gasToken,
      action: 'updateQuoteResponse',
      quoteId,
      response: expectedResponse,
      responseAt: new Date().toISOString(),
      leadStatus
    };

    const updateResponse = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });

    const updateText = await updateResponse.text();
    let updateData;
    try {
      updateData = JSON.parse(updateText);
    } catch {
      updateData = { raw: updateText };
    }

    if (!updateResponse.ok || updateData.error) {
      return res.status(500).json({ ok: false, error: 'No se pudo registrar la respuesta en el CRM' });
    }

    return res.status(200).json({ ok: true, status: 'success', message: 'Respuesta registrada correctamente' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Error en backend de confirmación', message: err.message });
  }
}
