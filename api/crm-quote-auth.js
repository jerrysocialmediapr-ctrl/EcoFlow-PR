import crypto from 'node:crypto';
import process from 'node:process';
import crmQuoteHandler from './crm-quote.js';

const CRM_SESSION_URL = 'https://power-solar-crm.vercel.app/api/auth';

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

async function hasValidCrmSession(req) {
  const sessionCookie = String(req.headers?.['x-crm-session'] || '').trim();
  if (!sessionCookie || sessionCookie.length > 5000) return false;

  try {
    const response = await fetch(CRM_SESSION_URL, {
      method: 'GET',
      redirect: 'error',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        Cookie: `ps_session=${sessionCookie}`,
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) return false;
    const data = await response.json().catch(() => null);
    return Boolean(data?.authenticated && data?.user?.session_email);
  } catch (error) {
    console.error('[CRM_QUOTE_AUTH] No se pudo validar la sesión del CRM:', error?.message || error);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const providedTokens = getProvidedTokens(req);
  const expectedTokens = getExpectedTokens();
  const hasSharedToken = providedTokens.some((provided) =>
    expectedTokens.some((expected) => secureEqual(provided, expected))
  );
  const hasSession = hasSharedToken ? false : await hasValidCrmSession(req);

  if (!hasSharedToken && !hasSession) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const preferredToken = String(
    process.env.CRM_QUOTE_TOKEN || process.env.GAS_TOKEN || ''
  ).trim();

  if (!preferredToken) {
    return res.status(503).json({ error: 'Servicio de cotizaciones no configurado' });
  }

  req.headers = {
    ...(req.headers || {}),
    authorization: `Bearer ${preferredToken}`,
  };

  return crmQuoteHandler(req, res);
}
