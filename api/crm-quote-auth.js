import crypto from 'node:crypto';
import process from 'node:process';
import crmQuoteHandler from './crm-quote.js';

const MAX_CLOCK_SKEW_SECONDS = 300;

function clean(value, max = 4000) {
  return String(value ?? '').trim().slice(0, max);
}

function secureEqual(actual, expected) {
  const a = Buffer.from(clean(actual, 1000));
  const b = Buffer.from(clean(expected, 1000));
  return a.length === b.length && b.length > 0 && crypto.timingSafeEqual(a, b);
}

function validServiceSignature(req) {
  const secret = clean(process.env.CRM_ECOFLOW_SERVICE_SECRET, 2000);
  if (secret.length < 32) return false;

  const timestamp = Number(req.headers?.['x-crm-service-timestamp']);
  const provided = clean(req.headers?.['x-crm-service-signature'], 1000);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > MAX_CLOCK_SKEW_SECONDS || !provided) return false;

  const bodyText = JSON.stringify(req.body || {});
  const expected = crypto.createHmac('sha256', secret)
    .update(`${timestamp}.${bodyText}`)
    .digest('base64url');
  return secureEqual(provided, expected);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!validServiceSignature(req)) return res.status(401).json({ error: 'No autorizado' });

  const quoteToken = clean(process.env.CRM_QUOTE_TOKEN, 2000);
  if (!quoteToken) return res.status(503).json({ error: 'Servicio de cotizaciones no configurado' });

  req.headers = {
    ...(req.headers || {}),
    authorization: `Bearer ${quoteToken}`,
  };
  return crmQuoteHandler(req, res);
}
