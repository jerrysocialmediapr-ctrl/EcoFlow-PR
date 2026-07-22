import crypto from 'node:crypto';
import process from 'node:process';
import { getAuthorizedProduct } from './lead.js';

const OFFICIAL_CRM_PUSH_URL = 'https://crm.powersolarprr.com/api/push';
const LEGACY_CRM_PUSH_HOSTS = new Set([
  'power-solar-crm.vercel.app',
  'power-solar-crm-jerry-encarnacions-projects.vercel.app',
  'power-solar-crm-git-main-jerry-encarnacions-projects.vercel.app',
]);
const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbxi2ATuJrRfzBysZqxl8NzGhEIsVf8grL1Ti5EcWRSi6NeGZc-gRVz2BqlVpDIeQ-4C/exec';
const DEFAULT_PUBLIC_URL = 'https://jerry.ecoflow-pr.com';

function clean(value, max = 1000) {
  return String(value ?? '').trim().slice(0, max);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value, 320));
}

function sameOrigin(req) {
  const origin = clean(req.headers?.origin, 500).replace(/\/$/, '');
  if (!origin) return true;
  const proto = clean(req.headers?.['x-forwarded-proto'] || 'https', 20).split(',')[0].trim();
  const host = clean(req.headers?.['x-forwarded-host'] || req.headers?.host, 300).split(',')[0].trim();
  try { return new URL(origin).origin === `${proto}://${host}`; } catch { return false; }
}

function setHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

function crmPushUrl() {
  const configured = clean(process.env.CRM_PUSH_URL, 1000);
  if (!configured) return OFFICIAL_CRM_PUSH_URL;
  try {
    const parsed = new URL(configured);
    if (parsed.protocol !== 'https:' || LEGACY_CRM_PUSH_HOSTS.has(parsed.hostname)) {
      return OFFICIAL_CRM_PUSH_URL;
    }
    return parsed.toString().replace(/\/+$/, '');
  } catch {
    return OFFICIAL_CRM_PUSH_URL;
  }
}

function sourceOidcToken(req) {
  return clean(req.headers?.['x-vercel-oidc-token'], 12000);
}

async function postToGas(gasUrl, payload) {
  const response = await fetch(gasUrl, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(25_000),
  });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { response, data };
}

async function callCRM(req, payload) {
  const url = crmPushUrl();
  const token = clean(process.env.LEAD_PUSH_WEBHOOK_TOKEN, 1000);
  const oidcToken = sourceOidcToken(req);
  if (!token && !oidcToken) {
    return { ok: false, skipped: true, reason: 'not_configured', endpoint: url };
  }

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (oidcToken) headers['x-source-vercel-oidc-token'] = oidcToken;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12_000),
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    if (!response.ok || data?.error) {
      console.error('EcoFlow CRM alert failed:', response.status, data?.error || data?.raw || 'Unknown error');
      return {
        ok: false,
        status: response.status,
        reason: clean(data?.error || data?.raw || 'callback_failed', 500),
        endpoint: url,
      };
    }
    return { ok: true, status: response.status, endpoint: url, ...data };
  } catch (error) {
    console.error('EcoFlow CRM alert error:', error);
    return { ok: false, reason: 'request_failed', endpoint: url };
  }
}

function buildLeadPayload(body, values, gasToken, baseUrl) {
  return {
    token: gasToken,
    action: 'addLead',
    nombre: values.nombre,
    email: values.email,
    telefono: values.telefono,
    pueblo: values.pueblo,
    factura: body.factura || body.monthlyBill || '',
    origen: body.origen || body.leadSource || 'EcoFlow PR Website',
    producto: body.producto || body.productoOriginal || body.product || body.productName || body.modelo || body.model || '',
    anotaciones: body.anotaciones || body.notes || body.message || '',
    gclid: body.gclid || '',
    fbclid: body.fbclid || '',
    campaign: body.campaign || '',
    sendClientEmail: true,
    baseUrl,
    confirmationUrl: `${baseUrl}/cotizacion/confirmar`,
  };
}

async function notifyCRM(req, lead) {
  return callCRM(req, { action: 'lead-created', ...lead });
}

async function checkCRMConnection(req) {
  return callCRM(req, { action: 'source-health', source: 'EcoFlow PR Website' });
}

export default async function handler(req, res) {
  setHeaders(res);

  if (req.method === 'GET' && clean(req.query?.action, 80) === 'crm-health') {
    const result = await checkCRMConnection(req);
    return res.status(result.ok ? 200 : 503).json({
      ok: Boolean(result.ok),
      endpoint: result.endpoint,
      auth: result.auth || '',
      adminCount: Number(result.adminCount || 0),
      subscribedAdminCount: Number(result.subscribedAdminCount || 0),
      subscriptionCount: Number(result.subscriptionCount || 0),
      reason: result.reason || '',
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Origen no permitido' });

  const body = req.body || {};
  const nombre = clean(body.nombre || body.name, 160);
  const email = clean(body.email, 320).toLowerCase();
  const telefono = clean(body.telefono || body.phone, 80).replace(/\D/g, '');
  const pueblo = clean(body.pueblo || body.city, 160);
  const productValue = body.producto || body.productoOriginal || body.product || body.productName || body.modelo || body.model || '';

  if (!nombre) return res.status(400).json({ error: 'Falta el nombre' });
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Falta un email válido' });
  if (telefono.length < 7) return res.status(400).json({ error: 'Teléfono inválido' });

  const gasUrl = clean(process.env.GAS_URL || DEFAULT_GAS_URL, 1500);
  const gasToken = clean(process.env.GAS_TOKEN, 1000);
  if (!gasToken) return res.status(503).json({ error: 'Falta GAS_TOKEN' });

  const baseUrl = clean(process.env.PUBLIC_BASE_URL || DEFAULT_PUBLIC_URL, 1500).replace(/\/+$/, '');
  const eligible = Boolean(getAuthorizedProduct(productValue));
  const leadPayload = buildLeadPayload(body, { nombre, email, telefono, pueblo }, gasToken, baseUrl);

  try {
    const { response, data } = await postToGas(gasUrl, leadPayload);
    if (!response.ok || data?.error || data?.status === 'error') {
      return res.status(502).json({ error: data?.message || data?.error || 'No se pudo registrar la solicitud' });
    }

    const leadId = clean(data.id || data.leadId || data?.data?.id, 300);
    const notification = await notifyCRM(req, {
      eventId: crypto.randomUUID ? crypto.randomUUID() : `ecoflow-${Date.now()}`,
      leadId,
      createdAt: new Date().toISOString(),
      name: nombre,
      phone: telefono,
      email,
      town: pueblo,
      source: body.origen || body.leadSource || 'EcoFlow PR Website',
      product: productValue,
    });

    return res.status(200).json({
      ok: true,
      leadId,
      quoteStatus: eligible ? 'pendiente_asesoria' : 'no_aplica',
      message: eligible
        ? 'Solicitud confirmada. La cotización se preparará manualmente desde el CRM.'
        : 'Solicitud confirmada.',
      notification: {
        ok: Boolean(notification?.ok),
        status: Number(notification?.status || 0),
        reason: notification?.reason || '',
      },
    });
  } catch (error) {
    console.error('Lead handler error:', error);
    return res.status(500).json({ error: 'Error procesando la solicitud' });
  }
}
