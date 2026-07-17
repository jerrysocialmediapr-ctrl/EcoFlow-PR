import { afterEach, describe, expect, it, vi } from 'vitest';
import { hasValidCrmSession } from './api/crm-quote-auth.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CRM quote session authorization', () => {
  it('accepts an authenticated CRM session', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        authenticated: true,
        user: { session_email: 'authorized@example.com' },
      }),
    });

    const result = await hasValidCrmSession({
      headers: { 'x-crm-session': 'signed-session-token' },
    });

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://power-solar-crm.vercel.app/api/auth');
    expect(fetchMock.mock.calls[0][1].headers.Cookie).toBe('ps_session=signed-session-token');
  });

  it('rejects an unauthenticated or missing session', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ authenticated: false, user: null }),
    });

    await expect(hasValidCrmSession({
      headers: { 'x-crm-session': 'expired-session-token' },
    })).resolves.toBe(false);

    await expect(hasValidCrmSession({ headers: {} })).resolves.toBe(false);
  });

  it('fails closed when CRM validation is unavailable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network unavailable'));

    await expect(hasValidCrmSession({
      headers: { 'x-crm-session': 'signed-session-token' },
    })).resolves.toBe(false);
  });
});
