import { beforeEach, describe, expect, it, vi } from 'vitest';
import leadHandler, { getAuthorizedProduct, PRODUCTS_TABLE } from '../api/lead.js';

process.env.GAS_TOKEN = 'PS-CRM-2024-SECURE-TOKEN';
process.env.PUBLIC_BASE_URL = 'http://localhost:3000';

function makeMockReqRes(body = {}) {
  const req = { method: 'POST', body, headers: { host: 'localhost:3000' } };
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; return this; },
    end() { return this; },
  };
  return { req, res };
}

function successfulLeadResponse(id = 'L-TEST') {
  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ status: 'ok', id }),
  };
}

describe('EcoFlow website confirmation-only lead flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn(async () => successfulLeadResponse());
  });

  it('keeps the approved product catalog available to the CRM quote endpoint', () => {
    expect(PRODUCTS_TABLE['Batería para casa (Delta Pro 3)'].productAsset).toBe('delta-pro-3-product.png');
    expect(PRODUCTS_TABLE['Sistema completo para hogar (Delta Pro Ultra)'].coverAsset).toBe('delta-pro-ultra-cover-jerry.png');
  });

  it('recognizes DELTA 2 Max aliases', () => {
    expect(getAuthorizedProduct('Delta 2 Max 2048')?.normalizedName).toBe('DELTA 2 Max');
  });

  it('recognizes the legacy DELTA Pro 3600', () => {
    expect(getAuthorizedProduct('DELTA Pro 3600')?.normalizedName).toBe('DELTA Pro');
  });

  it('recognizes DELTA Pro 3 aliases', () => {
    expect(getAuthorizedProduct('Batería para casa (Delta Pro 3)')?.normalizedName).toBe('DELTA Pro 3');
  });

  it('recognizes DELTA Pro Ultra + Smart Home Panel 2', () => {
    expect(getAuthorizedProduct('Delta Pro Ultra + SHP2')?.normalizedName).toBe('DELTA Pro Ultra + Smart Home Panel 2');
  });

  it('saves an eligible lead and returns pendiente_asesoria without sending a quote', async () => {
    const { req, res } = makeMockReqRes({
      nombre: 'Cliente Prueba',
      email: 'cliente@example.com',
      telefono: '7875551234',
      pueblo: 'Bayamón',
      producto: 'Batería para casa (Delta Pro 3)',
    });

    await leadHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.data).toMatchObject({ ok: true, leadId: 'L-TEST', quoteStatus: 'pendiente_asesoria' });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(payload.action).toBe('addLead');
    expect(payload.sendClientEmail).toBe(true);
  });

  it('does not call sendQuoteEmail from the public website endpoint', async () => {
    const actions = [];
    global.fetch = vi.fn(async (_url, options) => {
      actions.push(JSON.parse(options.body).action);
      return successfulLeadResponse('L-NO-AUTO');
    });

    const { req, res } = makeMockReqRes({
      nombre: 'Cliente Prueba',
      email: 'cliente@example.com',
      telefono: '7875551234',
      pueblo: 'San Juan',
      producto: 'Sistema completo para hogar (Delta Pro Ultra)',
    });

    await leadHandler(req, res);
    expect(actions).toEqual(['addLead']);
    expect(res.data.quoteStatus).toBe('pendiente_asesoria');
  });

  it('returns no_aplica for a non-EcoFlow quote product while still saving the lead', async () => {
    const { req, res } = makeMockReqRes({
      nombre: 'Cliente Prueba',
      email: 'cliente@example.com',
      telefono: '7875551234',
      pueblo: 'Ponce',
      producto: 'No sé cuál necesito — oriéntenme',
    });

    await leadHandler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.data.quoteStatus).toBe('no_aplica');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('rejects a missing email because the confirmation is sent by email', async () => {
    const { req, res } = makeMockReqRes({
      nombre: 'Cliente sin email',
      telefono: '7875551234',
      producto: 'Delta Pro 3',
    });

    await leadHandler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.data.error).toContain('email');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rejects invalid phone numbers before calling GAS', async () => {
    const { req, res } = makeMockReqRes({
      nombre: 'Cliente',
      email: 'cliente@example.com',
      telefono: '123',
      producto: 'Delta Pro 3',
    });

    await leadHandler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.data.error).toContain('Teléfono');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
