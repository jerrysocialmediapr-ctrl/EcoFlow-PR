import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path) => fs.readFileSync(path, 'utf8');

const auth = read('api/crm-quote-auth.js');
const quote = read('api/crm-quote.js');
const vercel = read('vercel.json');
const envExample = read('.env.example');

describe('CRM to EcoFlow service authentication', () => {
  it('requires a dedicated HMAC service secret', () => {
    expect(auth).toContain('CRM_ECOFLOW_SERVICE_SECRET');
    expect(auth).toContain("crypto.createHmac('sha256'");
    expect(auth).toContain('x-crm-service-timestamp');
    expect(auth).toContain('x-crm-service-signature');
  });

  it('rejects stale signed requests', () => {
    expect(auth).toContain('MAX_CLOCK_SKEW_SECONDS');
    expect(auth).toContain('Math.abs(nowSeconds - timestamp)');
  });

  it('does not accept CRM browser sessions or the GAS token', () => {
    expect(auth).not.toContain('x-crm-session');
    expect(auth).not.toContain('CRM_SESSION_URL');
    expect(auth).not.toContain("process.env.GAS_TOKEN");
    expect(auth).not.toContain("'x-gas-token'");
    expect(quote).not.toContain('process.env.CRM_QUOTE_TOKEN || process.env.GAS_TOKEN');
  });

  it('uses a separate quote token only after service authentication', () => {
    expect(auth).toContain('process.env.CRM_QUOTE_TOKEN');
    expect(quote).toContain("process.env.CRM_QUOTE_TOKEN || ''");
  });

  it('routes public CRM quote traffic through the signed gateway', () => {
    expect(vercel).toContain('"source": "/api/crm-quote"');
    expect(vercel).toContain('"destination": "/api/crm-quote-auth"');
  });

  it('prevents branch deployments outside main', () => {
    expect(vercel).toContain('"**": false');
    expect(vercel).toContain('"main": true');
  });

  it('keeps the public environment example free of real values', () => {
    expect(envExample).not.toMatch(/GAS_TOKEN=\S+/);
    expect(envExample).not.toMatch(/CRM_QUOTE_TOKEN=\S+/);
    expect(envExample).not.toMatch(/CRM_ECOFLOW_SERVICE_SECRET=\S+/);
    expect(envExample).not.toMatch(/[A-Za-z0-9._%+-]+@gmail\.com/i);
  });
});
