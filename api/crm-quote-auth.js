import crypto from 'node:crypto';
import process from 'node:process';
import crmQuoteHandler from './crm-quote.js';

function secureEqual(actual, expected) {
  const a = Buffer.from(String(actual || ''));
  const b = Buffer.from(String(expected || ''));
  return a.length === b.length && b.length > 0 && crypto.timingSafeEqual(a, b);
}

function getProvidedTokens(req) {
  const authorization = String(req.headers?.authorization || '');
  const bearer = authorization.startsWith('Bearer ')
    ? authorization.slice(7).trim()
    : '';

  return [
    bearer,
    String(req.headers?.['x-crm-quote-token'] || '').trim(),
    String(req.headers?.['x-gas-token'] || '').trim(),
  ].filter(Boolean);
}

function getExpectedTokens() {
  return [
    String(process.env.CRM_QUOTE_TOKEN || '').trim(),
    String(process.env.GAS_TOKEN || '').trim(),
  ].filter(Boolean);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const providedTokens = getProvidedTokens(req);
  const expectedTokens = getExpectedTokens();
  const isAuthorized = providedTokens.some((provided) =>
    expectedTokens.some((expected) => secureEqual(provided, expected))
  );

  if (!isAuthorized) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const preferredToken = String(
    process.env.CRM_QUOTE_TOKEN || process.env.GAS_TOKEN || ''
  ).trim();

  req.headers = {
    ...(req.headers || {}),
    authorization: `Bearer ${preferredToken}`,
  };

  return crmQuoteHandler(req, res);
}
