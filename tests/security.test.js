import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

const quoteConfirm = fs.readFileSync('api/quote-confirm.js', 'utf8');
const vercel = fs.readFileSync('vercel.json', 'utf8');

describe('EcoFlow API security contracts', () => {
  it('does not expose quote confirmation to wildcard CORS', () => {
    expect(quoteConfirm).not.toContain("Access-Control-Allow-Origin', '*'");
    expect(quoteConfirm).toContain('sameOrigin(req)');
  });

  it('does not return internal exception messages to clients', () => {
    expect(quoteConfirm).not.toContain('message: err.message');
    expect(quoteConfirm).toContain("error: 'Error procesando la confirmación'");
  });

  it('prevents caching of API responses', () => {
    expect(quoteConfirm).toContain("Cache-Control', 'no-store, max-age=0'");
    expect(vercel).toContain('no-store, max-age=0');
  });

  it('sets browser hardening headers', () => {
    expect(vercel).toContain('Content-Security-Policy');
    expect(vercel).toContain('X-Frame-Options');
    expect(vercel).toContain('X-Content-Type-Options');
  });
});
