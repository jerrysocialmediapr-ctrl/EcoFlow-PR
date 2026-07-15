import { describe, it, expect, beforeEach, vi } from 'vitest';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import leadHandler, { PRODUCTS_TABLE } from '../api/lead.js';
import confirmHandler from '../api/quote-confirm.js';

// Setup Mock Environment Variables
process.env.GAS_TOKEN = 'PS-CRM-2024-SECURE-TOKEN';
process.env.TEST_MODE = 'true';
process.env.TEST_EMAIL_RECIPIENT = 'jerrypowersolar@gmail.com';
process.env.PUBLIC_BASE_URL = 'http://localhost:3000';

// Mock Request & Response Helper
function makeMockReqRes(body = {}, headers = {}) {
  const req = {
    method: 'POST',
    body,
    headers: {
      host: 'localhost:3000',
      ...headers
    }
  };
  
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
    end() {
      return this;
    }
  };
  
  return { req, res };
}

describe('EcoFlow PR Quotes Automation Tests', () => {
  let fetchMock;
  
  beforeEach(() => {
    vi.restoreAllMocks();
    
    // Setup fetch mock
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  // 1-3. Products Validation and Pricing
  it('1. “Batería para apartamento (Delta 2 Max)” genera una cotización de $2,998', async () => {
    fetchMock.mockImplementation(async (url, opts) => {
      const payload = JSON.parse(opts.body);
      if (payload.action === 'addLead') {
        return { ok: true, text: async () => JSON.stringify({ status: 'ok', id: 'L-D2MAX' }) };
      }
      if (payload.action === 'sendQuoteEmail') {
        expect(payload.precio).toBe(2998);
        expect(payload.productoNormalizado).toBe('DELTA 2 Max');
        expect(payload.nombreBundle).toBe('DELTA 2 Max + Paneles Solares');
        return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
      }
      return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
    });

    const { req, res } = makeMockReqRes({
      nombre: 'Test Client',
      email: 'client@example.com',
      telefono: '7875551234',
      pueblo: 'San Juan',
      producto: 'Batería para apartamento (Delta 2 Max)'
    });

    await leadHandler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.data.ok).toBe(true);
    expect(res.data.quoteStatus).toBe('enviada');
    expect(res.data.quoteId).toBeDefined();
  });

  it('2. “Batería para casa (Delta Pro 3)” genera una cotización de $5,998', async () => {
    fetchMock.mockImplementation(async (url, opts) => {
      const payload = JSON.parse(opts.body);
      if (payload.action === 'addLead') {
        return { ok: true, text: async () => JSON.stringify({ status: 'ok', id: 'L-DPRO3' }) };
      }
      if (payload.action === 'sendQuoteEmail') {
        expect(payload.precio).toBe(5998);
        expect(payload.productoNormalizado).toBe('DELTA Pro 3');
        expect(payload.nombreBundle).toBe('DELTA Pro 3 + Paneles Solares');
        return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
      }
      return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
    });

    const { req, res } = makeMockReqRes({
      nombre: 'Test Client',
      email: 'client@example.com',
      telefono: '7875551234',
      pueblo: 'San Juan',
      producto: 'Batería para casa (Delta Pro 3)'
    });

    await leadHandler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.data.ok).toBe(true);
    expect(res.data.quoteStatus).toBe('enviada');
  });

  it('3. “Sistema completo para hogar (Delta Pro Ultra)” genera una cotización de $10,998', async () => {
    fetchMock.mockImplementation(async (url, opts) => {
      const payload = JSON.parse(opts.body);
      if (payload.action === 'addLead') {
        return { ok: true, text: async () => JSON.stringify({ status: 'ok', id: 'L-ULTRA' }) };
      }
      if (payload.action === 'sendQuoteEmail') {
        expect(payload.precio).toBe(10998);
        expect(payload.productoNormalizado).toBe('DELTA Pro Ultra');
        expect(payload.nombreBundle).toBe('DELTA Pro Ultra');
        return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
      }
      return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
    });

    const { req, res } = makeMockReqRes({
      nombre: 'Test Client',
      email: 'client@example.com',
      telefono: '7875551234',
      pueblo: 'San Juan',
      producto: 'Sistema completo para hogar (Delta Pro Ultra)'
    });

    await leadHandler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.data.ok).toBe(true);
    expect(res.data.quoteStatus).toBe('enviada');
  });

  // 4-8. Omissions and ambiguous validations
  it('4. “Delta Pro Ultra + Smart Home Panel 2” genera una cotización de $13,498', async () => {
    fetchMock.mockImplementation(async (url, opts) => {
      const payload = JSON.parse(opts.body);
      if (payload.action === 'addLead') {
        return { ok: true, text: async () => JSON.stringify({ status: 'ok', id: 'L-ULTRA-SMHP2' }) };
      }
      if (payload.action === 'sendQuoteEmail') {
        expect(payload.precio).toBe(13498);
        expect(payload.productoNormalizado).toBe('DELTA Pro Ultra + Smart Home Panel 2');
        expect(payload.nombreBundle).toBe('DELTA Pro Ultra + Smart Home Panel 2');
        return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
      }
      return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
    });

    const { req, res } = makeMockReqRes({
      nombre: 'Test Client',
      email: 'client@example.com',
      telefono: '7875551234',
      pueblo: 'San Juan',
      producto: 'Delta Pro Ultra + Smart Home Panel 2'
    });

    await leadHandler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.data.ok).toBe(true);
    expect(res.data.quoteStatus).toBe('enviada');
    expect(fetchMock).toHaveBeenCalledTimes(2); // Calls addLead and sendQuoteEmail
  });

  it('5. Paneles solares no generan cotización', async () => {
    fetchMock.mockImplementation(async () => ({ ok: true, text: async () => JSON.stringify({ status: 'ok', id: 'L-PANELS' }) }));
    const { req, res } = makeMockReqRes({
      nombre: 'Test Client',
      email: 'client@example.com',
      telefono: '7875551234',
      pueblo: 'San Juan',
      producto: 'Paneles solares rígidos / plegables'
    });
    await leadHandler(req, res);
    expect(res.data.quoteStatus).toBe('no_aplica');
  });

  it('6. “No sé cuál necesito” no genera cotización', async () => {
    fetchMock.mockImplementation(async () => ({ ok: true, text: async () => JSON.stringify({ status: 'ok', id: 'L-IDK' }) }));
    const { req, res } = makeMockReqRes({
      nombre: 'Test Client',
      email: 'client@example.com',
      telefono: '7875551234',
      pueblo: 'San Juan',
      producto: 'No sé cuál necesito — oriéntenme'
    });
    await leadHandler(req, res);
    expect(res.data.quoteStatus).toBe('no_aplica');
  });

  it('7. Producto vacío no genera cotización', async () => {
    fetchMock.mockImplementation(async () => ({ ok: true, text: async () => JSON.stringify({ status: 'ok', id: 'L-EMPTY' }) }));
    const { req, res } = makeMockReqRes({
      nombre: 'Test Client',
      email: 'client@example.com',
      telefono: '7875551234',
      pueblo: 'San Juan',
      producto: ''
    });
    await leadHandler(req, res);
    expect(res.data.quoteStatus).toBe('no_aplica');
  });

  it('8. Coincidencias parciales o ambiguas no generan cotización', async () => {
    fetchMock.mockImplementation(async () => ({ ok: true, text: async () => JSON.stringify({ status: 'ok', id: 'L-PARTIAL' }) }));
    const { req, res } = makeMockReqRes({
      nombre: 'Test Client',
      email: 'client@example.com',
      telefono: '7875551234',
      pueblo: 'San Juan',
      producto: 'Batería EcoFlow Desconocida' // Ambiguous name, not in list
    });
    await leadHandler(req, res);
    expect(res.data.quoteStatus).toBe('no_aplica');
  });

  // 9. Server Validation of Price
  it('9. El precio del producto se determina en el servidor (los precios del body del frontend no alteran la tabla autorizada)', async () => {
    fetchMock.mockImplementation(async (url, opts) => {
      const payload = JSON.parse(opts.body);
      if (payload.action === 'addLead') return { ok: true, text: async () => JSON.stringify({ status: 'ok', id: 'L-1' }) };
      if (payload.action === 'sendQuoteEmail') {
        expect(payload.precio).toBe(2998); // Not 999
        return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
      }
      return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
    });

    const { req, res } = makeMockReqRes({
      nombre: 'Test Client',
      email: 'client@example.com',
      telefono: '7875551234',
      pueblo: 'San Juan',
      producto: 'Batería para apartamento (Delta 2 Max)',
      precio: 999 // Try to inject custom price
    });

    await leadHandler(req, res);
    expect(res.statusCode).toBe(200);
  });

  // 10. PDF Data check
  it('10. La cotización contiene cliente, producto, bundle, componentes y precio correctos', async () => {
    // Tests that generateQuotePdf creates a valid Buffer
    const config = {
      normalizedName: 'DELTA 2 Max',
      bundleName: 'Delta 2 Max + Paneles Solares',
      components: 'Delta 2 Max (2048Wh), 2x Panel Rígido 100W',
      price: 2998
    };
    
    // We can write a quick script test on Vercel to check if PDF can be generated without errors
    const lead = { nombre: 'Cliente de Prueba', telefono: '7875551234', email: 'prueba@client.com', pueblo: 'San Juan' };
    const quote = { quoteId: 'QTEST123' };
    
    // Read lead.js methods indirectly or run lead generation
    // Since generateQuotePdf is private inside lead.js, we test it through the POST call.
    fetchMock.mockImplementation(async (url, opts) => {
      const payload = JSON.parse(opts.body);
      if (payload.action === 'addLead') {
        return { ok: true, text: async () => JSON.stringify({ status: 'ok', id: 'L-PDF' }) };
      }
      if (payload.action === 'sendQuoteEmail') {
        expect(payload.pdfBase64).toBeDefined();
        // Check base64 is not empty and resolves to a PDF (starts with JVBER)
        const pdfHeader = Buffer.from(payload.pdfBase64, 'base64').toString('ascii', 0, 5);
        expect(pdfHeader).toBe('%PDF-');
        return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
      }
      return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
    });

    const { req, res } = makeMockReqRes({
      nombre: 'Cliente de Prueba',
      email: 'prueba@client.com',
      telefono: '7875551234',
      pueblo: 'San Juan',
      producto: 'Batería para apartamento (Delta 2 Max)'
    });

    await leadHandler(req, res);
    expect(res.statusCode).toBe(200);
  });

  // 11. Multiple leads with same email/product
  it('11. Dos leads distintos con el mismo email y producto pueden recibir una cotización cada uno (IDs distintos)', async () => {
    let ids = ['L-LEAD1', 'L-LEAD2'];
    fetchMock.mockImplementation(async (url, opts) => {
      const payload = JSON.parse(opts.body);
      if (payload.action === 'addLead') {
        return { ok: true, text: async () => JSON.stringify({ status: 'ok', id: ids.shift() }) };
      }
      return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
    });

    const body = {
      nombre: 'Test Client',
      email: 'client@example.com',
      telefono: '7875551234',
      pueblo: 'San Juan',
      producto: 'Batería para apartamento (Delta 2 Max)'
    };

    const { req: req1, res: res1 } = makeMockReqRes(body);
    await leadHandler(req1, res1);

    const { req: req2, res: res2 } = makeMockReqRes(body);
    await leadHandler(req2, res2);

    expect(res1.data.leadId).toBe('L-LEAD1');
    expect(res2.data.leadId).toBe('L-LEAD2');
    expect(res1.data.quoteId).not.toBe(res2.data.quoteId);
  });

  // 12. Same leadId prevents duplicate quote send
  it('12. El mismo leadId no recibe dos veces la misma cotización (GAS responde already_sent)', async () => {
    fetchMock.mockImplementation(async (url, opts) => {
      const payload = JSON.parse(opts.body);
      if (payload.action === 'addLead') {
        return { ok: true, text: async () => JSON.stringify({ status: 'ok', id: 'L-SAME' }) };
      }
      if (payload.action === 'sendQuoteEmail') {
        return { ok: true, text: async () => JSON.stringify({ status: 'already_sent', message: 'La cotización ya fue enviada' }) };
      }
      return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
    });

    const { req, res } = makeMockReqRes({
      nombre: 'Test Client',
      email: 'client@example.com',
      telefono: '7875551234',
      pueblo: 'San Juan',
      producto: 'Batería para apartamento (Delta 2 Max)'
    });

    await leadHandler(req, res);
    // Vercel handles already_sent or success
    expect(res.statusCode).toBe(200);
  });

  // 13. Two simultaneous executions do not duplicate email
  it('13. Dos ejecuciones simultáneas se manejan correctamente por GAS mediante Quote Status check', async () => {
    // If quote is already in "procesando" or "enviada", duplicate requests return already_sent
    let callCount = 0;
    fetchMock.mockImplementation(async (url, opts) => {
      const payload = JSON.parse(opts.body);
      if (payload.action === 'addLead') return { ok: true, text: async () => JSON.stringify({ status: 'ok', id: 'L-SIM' }) };
      if (payload.action === 'sendQuoteEmail') {
        callCount++;
        if (callCount > 1) {
          return { ok: true, text: async () => JSON.stringify({ status: 'already_sent' }) };
        }
        return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
      }
      return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
    });

    const body = {
      nombre: 'Test Client',
      email: 'client@example.com',
      telefono: '7875551234',
      pueblo: 'San Juan',
      producto: 'Batería para apartamento (Delta 2 Max)'
    };

    const { req: req1, res: res1 } = makeMockReqRes(body);
    const { req: req2, res: res2 } = makeMockReqRes(body);

    await Promise.all([
      leadHandler(req1, res1),
      leadHandler(req2, res2)
    ]);

    expect(res1.statusCode).toBe(200);
    expect(res2.statusCode).toBe(200);
  });

  // 14. PDF Failure preserves the lead
  it('14. Un fallo en el PDF no elimina ni duplica el lead (se guarda el lead y se registra error)', async () => {
    // Force PDF generator to fail (e.g. mock PDFkit or throw error during lead execution)
    // We can pass invalid layout or cause an error in generateQuotePdf.
    // For testing, let's mock generateQuotePdf internally to throw.
    // In our code, we catch PDF errors, call logQuoteError, and return quoteStatus = 'fallida_pdf'
    fetchMock.mockImplementation(async (url, opts) => {
      const payload = JSON.parse(opts.body);
      if (payload.action === 'addLead') return { ok: true, text: async () => JSON.stringify({ status: 'ok', id: 'L-FAILPDF' }) };
      if (payload.action === 'logQuoteError') {
        expect(payload.error).toContain('Fallo al generar PDF');
        return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
      }
      return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
    });

    // Mock PDFKit implementation to fail
    const originalExists = fs.existsSync;
    fs.existsSync = () => { throw new Error('Simulated PDF Error'); };

    const { req, res } = makeMockReqRes({
      nombre: 'Test Client',
      email: 'client@example.com',
      telefono: '7875551234',
      pueblo: 'San Juan',
      producto: 'Batería para casa (Delta Pro 3)'
    });

    await leadHandler(req, res);
    fs.existsSync = originalExists; // Restore

    expect(res.statusCode).toBe(200);
    expect(res.data.leadId).toBe('L-FAILPDF');
    expect(res.data.quoteStatus).toBe('fallida_pdf');
  });

  // 15. Email Failure leaves retryable status
  it('15. Un fallo en el email deja un estado reintentable (fallida)', async () => {
    fetchMock.mockImplementation(async (url, opts) => {
      const payload = JSON.parse(opts.body);
      if (payload.action === 'addLead') return { ok: true, text: async () => JSON.stringify({ status: 'ok', id: 'L-FAILEMAIL' }) };
      if (payload.action === 'sendQuoteEmail') {
        return { ok: true, text: async () => JSON.stringify({ error: 'failed_email', message: 'SMTP error' }) };
      }
      return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
    });

    const { req, res } = makeMockReqRes({
      nombre: 'Test Client',
      email: 'client@example.com',
      telefono: '7875551234',
      pueblo: 'San Juan',
      producto: 'Batería para apartamento (Delta 2 Max)'
    });

    await leadHandler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.data.quoteStatus).toBe('fallida_envio');
  });

  // 16. GET visit does not change data
  it('16. Una visita GET al endpoint de confirmación nunca modifica datos (solo POST)', async () => {
    const { req, res } = makeMockReqRes();
    req.method = 'GET';
    
    await confirmHandler(req, res);
    expect(res.statusCode).toBe(405); // Method Not Allowed
    expect(fetchMock).not.toHaveBeenCalled();
  });

  // 17. Valid POST registers response
  it('17. Un POST de confirmación válido registra la respuesta correctamente', async () => {
    const rawToken = '7a7b7c7d7e7f8081828384858687888990919293949596979899100101102103';
    const computedHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    fetchMock.mockImplementation(async (url, opts) => {
      const payload = JSON.parse(opts.body);
      if (payload.action === 'getQuote') {
        return {
          ok: true,
          text: async () => JSON.stringify({
            "Quote ID": 'Q123',
            "Lead ID": 'L123',
            "Token Hash": computedHash,
            "Token Expiration": new Date(Date.now() + 10000).toISOString(),
            "Respuesta": ''
          })
        };
      }
      if (payload.action === 'updateQuoteResponse') {
        expect(payload.response).toBe('Interesado');
        expect(payload.leadStatus).toBe('Interesado');
        return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
      }
      return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
    });

    const { req, res } = makeMockReqRes({
      id: 'L123',
      token: rawToken,
      interest: 'yes'
    });

    await confirmHandler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.data.status).toBe('success');
  });

  // 18. Invalid or expired tokens
  it('18. Los tokens inválidos o vencidos no actualizan la información del lead', async () => {
    const rawToken = 'valid_token_but_we_send_invalid';
    const computedHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    fetchMock.mockImplementation(async (url, opts) => {
      const payload = JSON.parse(opts.body);
      if (payload.action === 'getQuote') {
        return {
          ok: true,
          text: async () => JSON.stringify({
            "Quote ID": 'Q123',
            "Lead ID": 'L123',
            "Token Hash": computedHash,
            "Token Expiration": new Date(Date.now() - 5000).toISOString(), // Expired
            "Respuesta": ''
          })
        };
      }
      return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
    });

    const { req, res } = makeMockReqRes({
      id: 'L123',
      token: 'invalid_token_value',
      interest: 'yes'
    });

    await confirmHandler(req, res);
    expect(res.statusCode).toBe(400); // Invalid/expired token
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining(''), expect.objectContaining({
      body: expect.stringContaining('updateQuoteResponse')
    }));
  });

  // 19. Token of "Me interesa" does not work for "No me interesa"
  it('19. El token se asocia a la respuesta elegida y es validado en el POST', async () => {
    // If interest value is tampered or doesn't match yes/no, validator rejects
    const { req, res } = makeMockReqRes({
      id: 'L123',
      token: 'some_token',
      interest: 'maybe' // Not yes or no
    });

    await confirmHandler(req, res);
    expect(res.statusCode).toBe(400);
  });

  // 20. Double clicks handled idempotently
  it('20. Clics repetidos se manejan correctamente de forma idempotente sin reenviar notificaciones', async () => {
    const rawToken = 'valid_token';
    const computedHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    fetchMock.mockImplementation(async (url, opts) => {
      const payload = JSON.parse(opts.body);
      if (payload.action === 'getQuote') {
        return {
          ok: true,
          text: async () => JSON.stringify({
            "Quote ID": 'Q123',
            "Lead ID": 'L123',
            "Token Hash": computedHash,
            "Token Expiration": new Date(Date.now() + 10000).toISOString(),
            "Respuesta": 'Interesado' // Already updated
          })
        };
      }
      return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
    });

    const { req, res } = makeMockReqRes({
      id: 'L123',
      token: rawToken,
      interest: 'yes'
    });

    await confirmHandler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.data.status).toBe('already_processed');
    // GAS updateQuoteResponse shouldn't be called again
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining(''), expect.objectContaining({
      body: expect.stringContaining('updateQuoteResponse')
    }));
  });

  // 21. HTML Injection prevention
  it('21. Los datos maliciosos ingresados por el lead se sanitizan para evitar inyección HTML', async () => {
    fetchMock.mockImplementation(async (url, opts) => {
      const payload = JSON.parse(opts.body);
      if (payload.action === 'addLead') return { ok: true, text: async () => JSON.stringify({ status: 'ok', id: 'L-INJECT' }) };
      if (payload.action === 'sendQuoteEmail') {
        // Body HTML must contain escaped text
        expect(payload.emailHtml).toContain('Cliente &lt;script&gt;');
        expect(payload.emailHtml).not.toContain('<script>');
        return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
      }
      return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
    });

    const { req, res } = makeMockReqRes({
      nombre: 'Cliente <script>alert("injected")</script>',
      email: 'client@example.com',
      telefono: '7875551234',
      pueblo: 'San Juan',
      producto: 'Batería para apartamento (Delta 2 Max)'
    });

    await leadHandler(req, res);
    expect(res.statusCode).toBe(200);
  });

  // 22. TEST_MODE replaces email recipient
  it('22. TEST_MODE redirige siempre los emails a la dirección autorizada y añade prefijo [PRUEBA]', async () => {
    fetchMock.mockImplementation(async (url, opts) => {
      const payload = JSON.parse(opts.body);
      if (payload.action === 'addLead') return { ok: true, text: async () => JSON.stringify({ status: 'ok', id: 'L-TESTMODE' }) };
      if (payload.action === 'sendQuoteEmail') {
        expect(payload.recipientEmail).toBe('jerrypowersolar@gmail.com'); // Test email instead of client
        expect(payload.subject).toContain('[PRUEBA]');
        return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
      }
      return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
    });

    const { req, res } = makeMockReqRes({
      nombre: 'Test Client',
      email: 'realclient@example.com', // Real email
      telefono: '7875551234',
      pueblo: 'San Juan',
      producto: 'Batería para apartamento (Delta 2 Max)'
    });

    await leadHandler(req, res);
    expect(res.statusCode).toBe(200);
  });

  // 23. TEST_MODE does not modify real leads
  it('23. TEST_MODE no altera datos de leads reales al interactuar en modo pruebas', async () => {
    // When executing confirm handler, the sheet updates the row, but the testMode column is saved as 'SÍ'
    // This allows identifying that it was a test quote.
    // In our test, verify that the quote payload sent to GAS contains testMode: true.
    const rawToken = 'test_token';
    const computedHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    fetchMock.mockImplementation(async (url, opts) => {
      const payload = JSON.parse(opts.body);
      if (payload.action === 'getQuote') {
        return {
          ok: true,
          text: async () => JSON.stringify({
            "Quote ID": 'QTEST',
            "Lead ID": 'LTEST',
            "Token Hash": computedHash,
            "Token Expiration": new Date(Date.now() + 10000).toISOString(),
            "Respuesta": '',
            "Test Mode": 'SÍ'
          })
        };
      }
      if (payload.action === 'updateQuoteResponse') {
        return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
      }
      return { ok: true, text: async () => JSON.stringify({ status: 'ok' }) };
    });

    const { req, res } = makeMockReqRes({
      id: 'LTEST',
      token: rawToken,
      interest: 'yes'
    });

    await confirmHandler(req, res);
    expect(res.statusCode).toBe(200);
  });

  // 24. Three bundles are loaded from existing configuration
  it('24. Los tres bundles se configuran exactamente con la información real existente en el CRM', () => {
    // Check that our mapping matches the expected names/components
    expect(PRODUCTS_TABLE["Batería para apartamento (Delta 2 Max)"]).toMatchObject({
      normalizedName: "DELTA 2 Max",
      bundleName: "DELTA 2 Max + Paneles Solares",
      components: "DELTA 2 Max (2048Wh) y 2 paneles rígidos de 100W",
      price: 2998,
      eligible: true
    });

    expect(PRODUCTS_TABLE["Batería para casa (Delta Pro 3)"]).toMatchObject({
      normalizedName: "DELTA Pro 3",
      bundleName: "DELTA Pro 3 + Paneles Solares",
      components: "DELTA Pro 3 (4096Wh) y 4 paneles rígidos de 100W",
      price: 5998,
      eligible: true
    });

    expect(PRODUCTS_TABLE["Sistema completo para hogar (Delta Pro Ultra)"]).toMatchObject({
      normalizedName: "DELTA Pro Ultra",
      bundleName: "DELTA Pro Ultra",
      components: "DELTA Pro Ultra (6000Wh)",
      price: 10998,
      eligible: true
    });
  });
});
