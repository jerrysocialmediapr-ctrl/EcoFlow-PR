import fs from 'fs';

const file = 'api/lead.js';
let source = fs.readFileSync(file, 'utf8');

const delta2Anchor = "    panelChargeFull: '18 a 24 horas con sol pleno',\n    recommendations: [";
const delta2Replacement = "    panelChargeFull: '18 a 24 horas con sol pleno',\n    productAsset: 'Delta 2 max/delta2-frente.png',\n    recommendations: [";

if (!source.includes("productAsset: 'Delta 2 max/delta2-frente.png'")) {
  if (!source.includes(delta2Anchor)) {
    throw new Error('No se encontró el bloque de DELTA 2 Max esperado.');
  }
  source = source.replace(delta2Anchor, delta2Replacement);
}

const page2Exception = "      const page2Image = config.coverAsset === 'delta-pro-ultra-smhp2-cover.png' ? null : productImage;\n      drawQuotePage(doc, lead, quote, config, page2Image);";
const page2Fixed = "      drawQuotePage(doc, lead, quote, config, productImage);";

if (source.includes(page2Exception)) {
  source = source.replace(page2Exception, page2Fixed);
} else if (!source.includes(page2Fixed)) {
  throw new Error('No se encontró la lógica de imagen de la página 2 esperada.');
}

fs.writeFileSync(file, source);
console.log('Cotizaciones corregidas: imagen real en portada, página 2 y página 3.');
