import fs from 'fs';

const file = 'api/lead.js';
let source = fs.readFileSync(file, 'utf8');

function replaceOnce(search, replacement, label) {
  if (!source.includes(search)) throw new Error(`No se encontró el bloque: ${label}`);
  source = source.replace(search, replacement);
}

replaceOnce(
`  const titleX = left + 31;
  const titleY = productY + 45;
  const titleW = 245;`,
`  const enlargeProductArt = [
    'DELTA 2 Max',
    'DELTA Pro Ultra',
    'DELTA Pro Ultra + Smart Home Panel 2'
  ].includes(config.normalizedName);
  const titleX = left + 31;
  const titleY = productY + 45;
  const titleW = enlargeProductArt ? 225 : 245;`,
  'configuración de tamaño en página 2'
);

replaceOnce(
`  drawFittedText(doc, config.description, titleX, descriptionY, 235, 38, {`,
`  drawFittedText(doc, config.description, titleX, descriptionY, enlargeProductArt ? 215 : 235, 38, {`,
  'ancho de descripción en página 2'
);

replaceOnce(
`  doc.font('Helvetica').fontSize(8.3).fillColor(COLORS.muted).text(solarCopy, titleX, productY + 143, { width: 245, ellipsis: true });

  const priceX = left + 272;`,
`  doc.font('Helvetica').fontSize(8.3).fillColor(COLORS.muted).text(solarCopy, titleX, productY + 143, { width: enlargeProductArt ? 225 : 245, ellipsis: true });

  const priceX = left + (enlargeProductArt ? 252 : 272);`,
  'espacio adicional para la imagen en página 2'
);

replaceOnce(
`  if (productImage) fitImage(doc, productImage, right - 103, productY + 36, 91, 103);
  else drawProductPlaceholder(doc, right - 96, productY + 50, 78, 70, config, false);`,
`  if (productImage) {
    const imageWidth = enlargeProductArt ? 102 : 91;
    const imageHeight = enlargeProductArt ? 116 : 103;
    fitImage(
      doc,
      productImage,
      right - imageWidth - 7,
      productY + (productH - imageHeight) / 2,
      imageWidth,
      imageHeight
    );
  } else {
    drawProductPlaceholder(doc, right - 96, productY + 50, 78, 70, config, false);
  }`,
  'imagen ampliada de página 2'
);

replaceOnce(
`  const productCenterX = right - 70;
  const productCenterY = stageY + stageH / 2;
  const productBox = 150;`,
`  const productCenterX = right - 70;
  const productCenterY = stageY + stageH / 2;
  const enlargeProductArt = [
    'DELTA 2 Max',
    'DELTA Pro Ultra',
    'DELTA Pro Ultra + Smart Home Panel 2'
  ].includes(config.normalizedName);
  const productBox = enlargeProductArt ? 176 : 150;`,
  'imagen ampliada de página 3'
);

fs.writeFileSync(file, source);
console.log('Escalado de productos actualizado en páginas 2 y 3.');
