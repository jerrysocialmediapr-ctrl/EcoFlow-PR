import { describe, expect, it } from 'vitest';
import {
  calculateQuoteTotals,
  resolveQuoteProduct,
  sanitizeQuoteItems,
} from './api/crm-quote.js';

// Regression tests for the CRM-only quote flow.
describe('CRM manual quote helpers', () => {
  it('forces included promotional items to zero', () => {
    const items = sanitizeQuoteItems([
      { name: 'DELTA Pro 3', quantity: 1, unitPrice: 5998 },
      { name: 'Cisterna 150 galones', quantity: 1, unitPrice: 900, included: true },
    ]);

    expect(items).toHaveLength(2);
    expect(items[0].lineTotal).toBe(5998);
    expect(items[1].unitPrice).toBe(0);
    expect(items[1].lineTotal).toBe(0);
  });

  it('calculates subtotal, discount and final total on the server', () => {
    const totals = calculateQuoteTotals([
      { lineTotal: 5998 },
      { lineTotal: 398 },
    ], 500);

    expect(totals).toEqual({ subtotal: 6396, discount: 500, total: 5896 });
  });

  it('recognizes the legacy DELTA Pro without requiring a new image', () => {
    const product = resolveQuoteProduct('Delta Pro 3600');
    expect(product?.normalizedName).toBe('DELTA Pro');
    expect(product?.productAsset).toBeUndefined();
  });

  it('continues using the approved DELTA Pro 3 configuration', () => {
    const product = resolveQuoteProduct('Delta Pro 3');
    expect(product?.normalizedName).toBe('DELTA Pro 3');
    expect(product?.productAsset).toBe('delta-pro-3-product.png');
  });
});
