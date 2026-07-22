import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

const handler = fs.readFileSync('api/lead-connected.js', 'utf8');
const vercel = fs.readFileSync('vercel.json', 'utf8');
const env = fs.readFileSync('.env.example', 'utf8');

describe('EcoFlow CRM lead alerts', () => {
  it('routes the public lead endpoint through the connected handler', () => {
    expect(vercel).toContain('"source": "/api/lead"');
    expect(vercel).toContain('"destination": "/api/lead-connected"');
  });

  it('uses the official CRM domain and migrates old aliases', () => {
    expect(handler).toContain('https://crm.powersolarprr.com/api/push');
    expect(handler).toContain('LEGACY_CRM_PUSH_HOSTS');
    expect(env).toContain('CRM_PUSH_URL="https://crm.powersolarprr.com/api/push"');
  });

  it('supports server token and Vercel OIDC without GAS token fallback', () => {
    expect(handler).toContain('LEAD_PUSH_WEBHOOK_TOKEN');
    expect(handler).toContain("x-vercel-oidc-token");
    expect(handler).toContain("x-source-vercel-oidc-token");
    expect(handler).not.toContain('headers.Authorization = `Bearer ${gasToken}`');
  });

  it('provides a safe health check and reports notification delivery', () => {
    expect(handler).toContain("clean(req.query?.action, 80) === 'crm-health'");
    expect(handler).toContain("action: 'source-health'");
    expect(handler).toContain('subscribedAdminCount');
    expect(handler).toContain('notification: {');
  });

  it('keeps saved leads even when the alert callback fails', () => {
    expect(handler).toContain('const notification = await notifyCRM');
    expect(handler).toContain('return res.status(200).json');
    expect(handler).toContain("reason: notification?.reason || ''");
  });
});
