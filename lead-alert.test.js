import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

const leadApi = fs.readFileSync('api/lead.js', 'utf8');

describe('EcoFlow new lead alerts', () => {
  it('uses server-only CRM alert variables', () => {
    expect(leadApi).toContain('process.env.CRM_PUSH_URL');
    expect(leadApi).toContain('process.env.LEAD_PUSH_WEBHOOK_TOKEN');
    expect(leadApi).toContain('Authorization: `Bearer ${token}`');
  });

  it('alerts the CRM only after the lead is accepted by GAS', () => {
    expect(leadApi.indexOf('await notifyCRM({')).toBeGreaterThan(leadApi.indexOf("if (!response.ok || data?.error || data?.status === 'error')"));
  });

  it('does not fail the customer form when the optional alert bridge is unavailable', () => {
    expect(leadApi).toContain("return { skipped: true, reason: 'not_configured' }");
    expect(leadApi).toContain("console.error('EcoFlow CRM alert error:'");
  });
});
