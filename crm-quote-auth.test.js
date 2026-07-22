import crypto from 'node:crypto';
import { afterEach, describe, expect, it } from 'vitest';
import { validServiceSignature } from './api/crm-quote-auth.js';

const ORIGINAL_SECRET = process.env.CRM_ECOFLOW_SERVICE_SECRET;
const SECRET = 'test-only-service-secret-that-is-at-least-32-bytes';
const NOW = 1_800_000_000;

function signedRequest(body, timestamp = NOW) {
  const bodyText = JSON.stringify(body);
  const signature = crypto.createHmac('sha256', SECRET)
    .update(`${timestamp}.${bodyText}`)
    .digest('base64url');
  return {
    body,
    headers: {
      'x-crm-service-timestamp': String(timestamp),
      'x-crm-service-signature': signature,
    },
  };
}
afterEach(() => {
  if (ORIGINAL_SECRET === undefined) delete process.env.CRM_ECOFLOW_SERVICE_SECRET;
  else process.env.CRM_ECOFLOW_SERVICE_SECRET = ORIGINAL_SECRET;
});

describe('CRM quote signed service authorization', () => {
  it('accepts a valid signature for the exact payload', () => {
    process.env.CRM_ECOFLOW_SERVICE_SECRET = SECRET;
    expect(validServiceSignature(signedRequest({ leadId: 'LEAD-TEST-001' }), NOW)).toBe(true);
  });

  it('rejects a modified body after signing', () => {
    process.env.CRM_ECOFLOW_SERVICE_SECRET = SECRET;
    const request = signedRequest({ leadId: 'LEAD-TEST-001' });
    request.body = { leadId: 'LEAD-OTHER-999' };
    expect(validServiceSignature(request, NOW)).toBe(false);
  });

  it('rejects stale timestamps', () => {
    process.env.CRM_ECOFLOW_SERVICE_SECRET = SECRET;
    expect(validServiceSignature(signedRequest({ leadId: 'LEAD-TEST-001' }, NOW - 301), NOW)).toBe(false);
  });

  it('rejects missing secret and missing signature', () => {
    delete process.env.CRM_ECOFLOW_SERVICE_SECRET;
    expect(validServiceSignature({ body: {}, headers: {} }, NOW)).toBe(false);
  });

  it('does not authorize a CRM browser session or GAS token', () => {
    process.env.CRM_ECOFLOW_SERVICE_SECRET = SECRET;
    expect(validServiceSignature({
      body: { leadId: 'LEAD-TEST-001' },
      headers: {
        'x-crm-session': 'browser-session',
        'x-gas-token': 'general-gas-token',
      },
    }, NOW)).toBe(false);
  });
});
