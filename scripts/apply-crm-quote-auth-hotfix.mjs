import fs from 'node:fs';

const file = 'api/crm-quote.js';
let source = fs.readFileSync(file, 'utf8');

const before = `function authorized(req) {
  const expected = String(process.env.CRM_QUOTE_TOKEN || process.env.GAS_TOKEN || '').trim();
  const header = String(req.headers.authorization || '');
  const provided = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  return secureEqual(provided, expected);
}`;

const after = `function authorized(req) {
  const header = String(req.headers.authorization || '');
  const bearerToken = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const providedTokens = [
    bearerToken,
    String(req.headers['x-crm-quote-token'] || '').trim(),
    String(req.headers['x-gas-token'] || '').trim(),
  ].filter(Boolean);
  const expectedTokens = [
    String(process.env.CRM_QUOTE_TOKEN || '').trim(),
    String(process.env.GAS_TOKEN || '').trim(),
  ].filter(Boolean);

  return providedTokens.some((provided) =>
    expectedTokens.some((expected) => secureEqual(provided, expected))
  );
}`;

if (!source.includes(before)) {
  if (source.includes("req.headers['x-gas-token']")) {
    console.log('CRM quote auth hotfix already applied.');
    process.exit(0);
  }
  throw new Error('No se encontró el bloque authorized esperado.');
}

source = source.replace(before, after);
fs.writeFileSync(file, source);
console.log('CRM quote auth hotfix applied.');
