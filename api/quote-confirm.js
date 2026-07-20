import crypto from 'node:crypto';
import process from 'node:process';

function requestOrigin(req) {
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  return host ? `${proto}://${host}` : '';
}

function sameOrigin(req) {
  const origin = String(req.headers.origin || '').trim().replace(/\/$/, '');
  if (!origin) return true;
  try {
    return new URL(origin).origin === requestOrigin(req);
  } catch {
    return false;
  }
}

function setSecurityHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20_000),
  });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { response, data };
}

export default async function handler(req, res) {
  setSecurityHeaders(res);

  if (!sameOrigin(req)) {
    return res.status(403).json({ ok: false, error: 'Origen no permitido' });
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const gasUrl = String(process.env.GAS_URL || 'https://script.google.com/macros/s/AKfycbxi2ATuJrRfzBysZqxl8NzGhEIsVf8grL1Ti5EcWRSi6NeGZc-gRVz2BqlVpDIeQ-4C/exec').trim();
    const gasToken = String(process.env.GAS_TOKEN || '').trim();

    if (!gasToken) return res.status(503).json({ error: 'Servicio de confirmación no configurado' });

    const body = req.body || {};
    const leadId = String(body.id || '').trim().slice(0, 200);
    const token = String(body.token || '').trim().slice(0, 1000);
    const interest = String(body.interest || '').trim().toLowerCase();

    if (!leadId || !token || !['yes', 'no'].includes(interest)) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos' });
    }

    const computedHash = crypto.createHash('sha256').update(token).digest('hex');
    const { response: quoteResponse, data: quoteData } = await postJson(gasUrl, {
      token: gasToken,
      action: 'getQuote',
      leadId,
      tokenHash: computedHash,
    });

    if (!quoteResponse.ok || quoteData?.error) {
      return res.status(400).json({ ok: false, error: 'La cotización o el token son inválidos' });
    }

    const storedHash = String(quoteData?.['Token Hash'] || '');
    if (!storedHash) return res.status(400).json({ ok: false, error: 'Token inválido' });

    const actual = Buffer.from(computedHash, 'utf8');
    const expected = Buffer.from(storedHash, 'utf8');
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
      return res.status(400).json({ ok: false, error: 'Token inválido' });
    }

    const expirationDate = new Date(String(quoteData?.['Token Expiration'] || ''));
    if (Number.isNaN(expirationDate.getTime()) || Date.now() > expirationDate.getTime()) {
      return res.status(400).json({ ok: false, error: 'El enlace ha expirado' });
    }

    const expectedResponse = interest === 'yes' ? 'Interesado' : 'No interesado';
    if (quoteData?.Respuesta === expectedResponse) {
      return res.status(200).json({
        ok: true,
        status: 'already_processed',
        message: 'Respuesta ya registrada anteriormente',
      });
    }

    const quoteId = String(quoteData?.['Quote ID'] || '').trim().slice(0, 200);
    if (!quoteId) return res.status(400).json({ ok: false, error: 'Cotización inválida' });

    const { response: updateResponse, data: updateData } = await postJson(gasUrl, {
      token: gasToken,
      action: 'updateQuoteResponse',
      quoteId,
      response: expectedResponse,
      responseAt: new Date().toISOString(),
      leadStatus: expectedResponse,
    });

    if (!updateResponse.ok || updateData?.error) {
      return res.status(502).json({ ok: false, error: 'No se pudo registrar la respuesta en el CRM' });
    }

    return res.status(200).json({ ok: true, status: 'success', message: 'Respuesta registrada correctamente' });
  } catch (error) {
    console.error('Quote confirmation error:', error);
    return res.status(500).json({ ok: false, error: 'Error procesando la confirmación' });
  }
}
