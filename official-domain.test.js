import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(file, 'utf8');
const official = 'https://jerry.ecoflow-pr.com';

describe('official EcoFlow domain', () => {
  it('uses the official URL in website metadata and discovery files', () => {
    const index = read('public/index.html');
    const sitemap = read('public/sitemap.xml');
    const robots = read('public/robots.txt');
    expect(index).toContain(`<link rel="canonical" href="${official}/">`);
    expect(index).toContain(`<meta property="og:url" content="${official}/">`);
    expect(index).toContain(`<meta name="twitter:url" content="${official}/">`);
    expect(index).toContain(`"url": "${official}"`);
    expect(sitemap).toContain(`<loc>${official}/</loc>`);
    expect(robots).toContain(`Sitemap: ${official}/sitemap.xml`);
    expect(index).not.toContain('https://ecoflowpr.vercel.app');
  });

  it('uses the official URL for emails and confirmation buttons', () => {
    const gas = read('google-apps-script.js');
    const lead = read('api/lead.js');
    expect(gas).toContain(`<a href="${official}"`);
    expect(gas).toContain('solicitud en jerry.ecoflow-pr.com');
    expect(gas).not.toContain('https://ecoflowpr.vercel.app');
    expect(lead).toContain("websiteUrl: 'https://jerry.ecoflow-pr.com'");
    expect(lead).toMatch(/sendClientEmail:s*true,s*
s*baseUrl,s*
s*confirmationUrl:/);
    expect(lead).toContain("confirmationUrl: `${baseUrl}/cotizacion/confirmar`");
  });

  it('redirects only the public Vercel alias to the official domain', () => {
    const config = JSON.parse(read('vercel.json'));
    expect(config.git.deploymentEnabled).toEqual({ '**': false, main: true });
    const redirect = config.redirects.find((item) => item.destination === `${official}/$1`);
    expect(redirect).toBeTruthy();
    expect(redirect.permanent).toBe(true);
    expect(redirect.has).toEqual([{ type: 'header', key: 'host', value: 'ecoflowpr\\.vercel\\.app' }]);
  });
});
