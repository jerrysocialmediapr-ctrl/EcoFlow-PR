import fs from 'fs';

const file = 'api/lead.js';
let source = fs.readFileSync(file, 'utf8');

function replaceOnce(search, replacement, label) {
  if (!source.includes(search)) throw new Error(`No se encontró el bloque: ${label}`);
  source = source.replace(search, replacement);
}

replaceOnce(
  "coverAsset: 'delta-pro-ultra-cover-jerry.jpg',",
  "coverAsset: 'delta-pro-ultra-cover-jerry.png',",
  'portada DELTA Pro Ultra'
);

replaceOnce(
  "} else if (config.coverAsset === 'delta-pro-ultra-cover-jerry.jpg' && lead) {\n      // La portada JPG aprobada ya contiene el título, los iconos y el bloque del consultor.\n      // Solo se insertan los datos del cliente dentro del área vacía \"PREPARADA PARA\".",
  "} else if (config.coverAsset === 'delta-pro-ultra-cover-jerry.png' && lead) {\n      // La portada premium aprobada ya contiene el título, los iconos y el bloque del consultor.\n      // Solo se insertan los datos del cliente dentro del área vacía \"PREPARADA PARA\".",
  'lógica de portada DELTA Pro Ultra'
);

replaceOnce(
`  roundedCard(doc, left, stageY, width, stageH, COLORS.dark2, COLORS.dark2, 15);
  doc.fillColor('#17262B').circle(right - 70, stageY + stageH / 2, 92).fill();
  doc.fillColor('#1B3035').circle(right - 70, stageY + stageH / 2, 62).fill();
  if (productImage) fitImage(doc, productImage, right - 183, stageY + 12, 158, 140);
  else drawProductPlaceholder(doc, right - 164, stageY + 35, 128, 100, config, true);`,
`  roundedCard(doc, left, stageY, width, stageH, COLORS.dark2, COLORS.dark2, 15);
  const productCenterX = right - 70;
  const productCenterY = stageY + stageH / 2;
  const productBox = 150;
  doc.fillColor('#17262B').circle(productCenterX, productCenterY, 92).fill();
  doc.fillColor('#1B3035').circle(productCenterX, productCenterY, 62).fill();
  if (productImage) {
    fitImage(
      doc,
      productImage,
      productCenterX - productBox / 2,
      productCenterY - productBox / 2,
      productBox,
      productBox
    );
  } else {
    drawProductPlaceholder(doc, productCenterX - 64, productCenterY - 50, 128, 100, config, true);
  }`,
  'centrado de producto en página 3'
);

fs.writeFileSync(file, source);
console.log('Portada y centrado de productos corregidos.');
