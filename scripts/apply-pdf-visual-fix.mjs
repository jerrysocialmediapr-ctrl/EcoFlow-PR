import fs from 'fs';
import path from 'path';

const leadPath = 'api/lead.js';
let source = fs.readFileSync(leadPath, 'utf8');

function replaceOnce(search, replacement, label) {
  if (!source.includes(search)) {
    throw new Error(`No se encontró el bloque para: ${label}`);
  }
  source = source.replace(search, replacement);
}

replaceOnce(
  "productAsset: 'Delta 2 max/delta2-frente.png',",
  "productAsset: 'delta-2-max-product.png',",
  'asset DELTA 2 Max'
);
replaceOnce(
  "productAsset: 'Delta Pro Ultra/deltaproultra+smhp2.png',",
  "productAsset: 'delta-pro-ultra-smhp2-product.png',",
  'asset Ultra + SHP2'
);
replaceOnce(
  "coverAsset: 'delta-pro-ultra-cover-jerry.png',\n    productAsset: 'Delta Pro Ultra/DeltaProUltra.png',",
  "coverAsset: 'delta-pro-ultra-cover-jerry.jpg',\n    productAsset: 'delta-pro-ultra-product.png',",
  'portada y asset DELTA Pro Ultra'
);

replaceOnce(
`async function loadProductImage(config) {
  if (config.productAsset) {
    const local = resolveLocalAsset(config.productAsset);
    if (local) return local;
    const rootCandidate = path.join(process.cwd(), config.productAsset);
    if (fs.existsSync(rootCandidate)) return rootCandidate;
  }
  return fetchImageBuffer(config.productImageUrl);
}`,
`async function loadProductImage(config) {
  if (config.productAsset) {
    const local = resolveLocalAsset(config.productAsset);
    if (local) return local;
    console.warn('[QUOTE_ASSET] No existe el PNG local requerido:', config.productAsset);
  }
  return fetchImageBuffer(config.productImageUrl);
}`,
  'cargador de imágenes empacadas para Vercel'
);

replaceOnce(
`function fitImage(doc, image, x, y, width, height, options = {}) {
  if (!image) return;
  try {
    doc.image(image, x, y, { fit: [width, height], align: options.align || 'center', valign: options.valign || 'center' });
  } catch (error) {
    console.warn('[QUOTE_ASSET] Imagen incompatible con PDFKit:', error.message);
  }
}`,
`function fitImage(doc, image, x, y, width, height, options = {}) {
  if (!image) return;
  try {
    doc.image(image, x, y, { fit: [width, height], align: options.align || 'center', valign: options.valign || 'center' });
  } catch (error) {
    console.warn('[QUOTE_ASSET] Imagen incompatible con PDFKit:', error.message);
  }
}

function drawFittedText(doc, text, x, y, width, maxHeight, options = {}) {
  const font = options.font || 'Helvetica-Bold';
  const color = options.color || COLORS.text;
  const minSize = options.minSize || 8;
  const lineGap = options.lineGap ?? 1;
  let size = options.maxSize || 18;

  doc.font(font).fillColor(color);
  while (size > minSize) {
    doc.fontSize(size);
    const height = doc.heightOfString(String(text), { width, lineGap });
    if (height <= maxHeight) break;
    size -= 0.5;
  }

  doc.fontSize(size);
  const measuredHeight = Math.min(doc.heightOfString(String(text), { width, lineGap }), maxHeight);
  doc.text(String(text), x, y, {
    width,
    height: maxHeight,
    lineGap,
    ellipsis: true,
    align: options.align || 'left'
  });
  return { size, height: measuredHeight };
}`,
  'helper de tipografía adaptable'
);

replaceOnce(
`    } else if (config.coverAsset === 'delta-pro-ultra-cover-jerry.png' && lead) {
      // Standalone Delta Pro Ultra cover page logic
      doc.save();

      // Draw a highly elegant card panel with rounded corners to perfectly mask the baked-in placeholder text
      // The baked-in text spans x:34-297 and y:541-670 in A4 points.
      // We overlay a beautiful card container filled with primary dark color and a thin teal border
      doc.save()
         .fillColor(COLORS.dark)
         .strokeColor(COLORS.teal)
         .lineWidth(1.2)
         .roundedRect(26, 520, 275, 160, 12)
         .fillAndStroke()
         .restore();

      // Draw the dynamic customer information inside the card
      const y_start = 538;
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(COLORS.teal).text('PREPARADA PARA:', 42, y_start);
      doc.font('Helvetica-Bold').fontSize(13.5).fillColor(COLORS.white).text(lead.nombre.toUpperCase(), 42, y_start + 18, { width: 245, ellipsis: true });
      doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.white).text(formatPhone(lead.telefono), 42, y_start + 39);
      doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.white).text(lead.email, 42, y_start + 55, { width: 245, ellipsis: true });

      doc.restore();
    }`,
`    } else if (config.coverAsset === 'delta-pro-ultra-cover-jerry.jpg' && lead) {
      // La portada JPG aprobada ya contiene el título, los iconos y el bloque del consultor.
      // Solo se insertan los datos del cliente dentro del área vacía "PREPARADA PARA".
      doc.save();
      doc.font('Helvetica-Bold').fontSize(13.5).fillColor(COLORS.white).text(
        lead.nombre.toUpperCase(),
        100,
        706,
        { width: 220, height: 19, ellipsis: true }
      );
      doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.white).text(
        formatPhone(lead.telefono),
        100,
        736,
        { width: 220, ellipsis: true }
      );
      doc.font('Helvetica').fontSize(9.2).fillColor(COLORS.white).text(
        lead.email,
        100,
        758,
        { width: 220, height: 14, ellipsis: true }
      );
      doc.restore();
    }`,
  'portada aprobada del DELTA Pro Ultra sin tarjeta superpuesta'
);

const quoteStart = source.indexOf('function drawQuotePage(doc, lead, quote, config, productImage) {');
const quoteEnd = source.indexOf('\nfunction statCard(', quoteStart);
if (quoteStart === -1 || quoteEnd === -1) throw new Error('No se encontró drawQuotePage');
const newQuotePage = `function drawQuotePage(doc, lead, quote, config, productImage) {
  drawHeader(doc, quote.quoteId, 2);
  doc.rect(0, 101.3, A4.width, A4.height - 101.3).fill(COLORS.bg);

  const left = 51;
  const right = 544;
  const width = right - left;

  label(doc, 'Propuesta de respaldo energético', left, 139, COLORS.tealDark, 7.5, 300);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(COLORS.text).text('Tu solución de respaldo energético', left, 157, { width: 400 });
  doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.muted).text(\`Preparada especialmente para \${lead.nombre}\`, left, 190, { width: 370, ellipsis: true });

  doc.fillColor(COLORS.tealPale).strokeColor(COLORS.teal).roundedRect(428, 139, 116, 26, 13).fillAndStroke();
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.tealDark).text('PROPUESTA ACTIVA', 428, 148, { width: 116, align: 'center' });

  const productY = 215;
  const productH = 170;
  roundedCard(doc, left, productY, width, productH, COLORS.white, '#CFE1E0', 15);
  doc.fillColor(COLORS.teal).roundedRect(left, productY, 15, productH, 7.5).fill();

  const titleX = left + 31;
  const titleY = productY + 45;
  const titleW = 245;
  label(doc, 'Solución seleccionada', titleX, productY + 25, COLORS.tealDark, 7.5, titleW);
  const titleMetrics = drawFittedText(doc, config.normalizedName, titleX, titleY, titleW, 43, {
    font: 'Helvetica-Bold',
    color: COLORS.text,
    maxSize: 22,
    minSize: 15,
    lineGap: 0.5
  });
  const descriptionY = titleY + titleMetrics.height + 5;
  drawFittedText(doc, config.description, titleX, descriptionY, 235, 38, {
    font: 'Helvetica',
    color: COLORS.muted,
    maxSize: 9.5,
    minSize: 8,
    lineGap: 1.5
  });

  const solarCopy = config.panelQuantity > 0
    ? \`Incluye \${config.panelQuantity} paneles solares rígidos de \${config.panelWattage.replace(' cada uno', '')}\`
    : 'Paneles solares no incluidos en este paquete';
  doc.font('Helvetica').fontSize(8.3).fillColor(COLORS.muted).text(solarCopy, titleX, productY + 143, { width: 245, ellipsis: true });

  const priceX = left + 272;
  doc.strokeColor(COLORS.line).moveTo(priceX, productY + 24).lineTo(priceX, productY + 146).stroke();
  label(doc, 'Inversión total', priceX + 24, productY + 38, COLORS.muted, 7.5, 100);
  doc.font('Helvetica-Bold').fontSize(25).fillColor(COLORS.tealDark).text(\`$\${Number(config.price).toLocaleString('en-US')}\`, priceX + 23, productY + 57, { width: 115 });
  doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted).text('USD', priceX + 23, productY + 91);
  doc.font('Helvetica').fontSize(7.2).fillColor(COLORS.muted).text('Sujeto a evaluación y disponibilidad', priceX + 23, productY + 112, { width: 122 });
  if (productImage) fitImage(doc, productImage, right - 103, productY + 36, 91, 103);
  else drawProductPlaceholder(doc, right - 96, productY + 50, 78, 70, config, false);

  const infoY = 410;
  const gap = 17;
  const boxWidth = (width - gap) / 2;
  roundedCard(doc, left, infoY, boxWidth, 119);
  roundedCard(doc, left + boxWidth + gap, infoY, boxWidth, 119);

  label(doc, 'Información del cliente', left + 20, infoY + 22, COLORS.tealDark, 7.5, 190);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.text).text(lead.nombre, left + 20, infoY + 48, { width: boxWidth - 40, ellipsis: true });
  doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.muted).text(formatPhone(lead.telefono), left + 20, infoY + 76, { width: boxWidth - 40 });
  doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.muted).text(lead.email || 'No indicado', left + 20, infoY + 95, { width: boxWidth - 40, ellipsis: true });

  const consultX = left + boxWidth + gap;
  label(doc, 'Tu consultor', consultX + 20, infoY + 22, COLORS.tealDark, 7.5, 180);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.text).text(BRAND.consultant, consultX + 20, infoY + 48, { width: boxWidth - 40 });
  doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.muted).text(BRAND.phone, consultX + 20, infoY + 76);
  doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.muted).text(BRAND.email, consultX + 20, infoY + 95, { width: boxWidth - 40, ellipsis: true });

  const tableY = 550;
  const tableH = 187;
  roundedCard(doc, left, tableY, width, tableH);
  doc.fillColor(COLORS.dark2).roundedRect(left, tableY, width, 39, 15).fill();
  doc.fillColor(COLORS.dark2).rect(left, tableY + 18, width, 21).fill();
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.white).text('DETALLE DE LA COTIZACIÓN', left + 20, tableY + 14);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.white).text('TOTAL', right - 100, tableY + 14, { width: 80, align: 'right' });

  drawFittedText(doc, \`EcoFlow \${config.normalizedName}\`, left + 20, tableY + 53, 325, 22, {
    font: 'Helvetica-Bold', color: COLORS.text, maxSize: 9.5, minSize: 8
  });
  doc.font('Helvetica').fontSize(7.8).fillColor(COLORS.muted).text(\`Capacidad \${config.batteryCapacity} | Salida AC \${config.acOutput} | \${config.boostOutput}\`, left + 20, tableY + 76, { width: 365, ellipsis: true });
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLORS.text).text(\`$\${formatMoney(config.price)}\`, right - 130, tableY + 56, { width: 110, align: 'right' });
  doc.strokeColor(COLORS.line).moveTo(left + 20, tableY + 95).lineTo(right - 20, tableY + 95).stroke();

  const panelTitle = config.panelQuantity > 0
    ? \`\${config.panelQuantity} paneles solares rígidos de \${config.panelWattage.replace(' cada uno', '')}\`
    : 'Paneles solares';
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLORS.text).text(panelTitle, left + 20, tableY + 111, { width: 350 });
  doc.font('Helvetica').fontSize(7.8).fillColor(COLORS.muted).text(
    config.panelQuantity > 0 ? 'Incluidos dentro del paquete cotizado' : 'No incluidos dentro del paquete cotizado',
    left + 20,
    tableY + 131,
    { width: 330 }
  );
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(config.panelQuantity > 0 ? COLORS.green : COLORS.muted).text(
    config.panelQuantity > 0 ? 'INCLUIDOS' : 'NO INCLUIDOS',
    right - 135,
    tableY + 113,
    { width: 115, align: 'right' }
  );

  doc.fillColor(COLORS.tealPale).roundedRect(left + 15, tableY + 151, width - 30, 28, 12).fill();
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.text).text('TOTAL DE LA PROPUESTA', left + 30, tableY + 160);
  doc.font('Helvetica-Bold').fontSize(13).fillColor(COLORS.tealDark).text(\`$\${formatMoney(config.price)} USD\`, right - 190, tableY + 157, { width: 160, align: 'right' });

  drawFooter(doc);
}`;
source = source.slice(0, quoteStart) + newQuotePage + source.slice(quoteEnd);

const specsStart = source.indexOf('function drawSpecsPage(doc, config, quote, productImage) {');
const specsEnd = source.indexOf('\nexport async function generatePremiumQuotePdf', specsStart);
if (specsStart === -1 || specsEnd === -1) throw new Error('No se encontró drawSpecsPage');
const newSpecsPage = `function drawSpecsPage(doc, config, quote, productImage) {
  drawHeader(doc, quote.quoteId, 3);
  doc.rect(0, 101.3, A4.width, A4.height - 101.3).fill(COLORS.bg);
  const left = 51;
  const right = 544;
  const width = right - left;

  const titleText = \`Conoce tu \${config.normalizedName}\`;
  const titleMetrics = drawFittedText(doc, titleText, left, 127, 470, 48, {
    font: 'Helvetica-Bold', color: COLORS.text, maxSize: 22, minSize: 17, lineGap: 0.5
  });
  const descY = 127 + titleMetrics.height + 7;
  const descMetrics = drawFittedText(doc, config.description, left, descY, 470, 26, {
    font: 'Helvetica', color: COLORS.muted, maxSize: 9.5, minSize: 8, lineGap: 1
  });

  const stageY = Math.max(204, descY + descMetrics.height + 14);
  const stageH = 164;
  roundedCard(doc, left, stageY, width, stageH, COLORS.dark2, COLORS.dark2, 15);
  doc.fillColor('#17262B').circle(right - 70, stageY + stageH / 2, 92).fill();
  doc.fillColor('#1B3035').circle(right - 70, stageY + stageH / 2, 62).fill();
  if (productImage) fitImage(doc, productImage, right - 183, stageY + 12, 158, 140);
  else drawProductPlaceholder(doc, right - 164, stageY + 35, 128, 100, config, true);

  label(doc, 'Energía inteligente para tu hogar', left + 30, stageY + 28, COLORS.teal, 8, 270);
  const stageTitle = drawFittedText(doc, config.normalizedName, left + 30, stageY + 56, 245, 47, {
    font: 'Helvetica-Bold', color: COLORS.white, maxSize: 19, minSize: 14, lineGap: 0.5
  });
  drawFittedText(doc, config.description, left + 30, stageY + 61 + stageTitle.height, 250, 45, {
    font: 'Helvetica', color: '#C6D4D6', maxSize: 9, minSize: 7.6, lineGap: 2
  });

  const statsY = Math.max(403, stageY + stageH + 34);
  const gap = 11;
  const statWidth = (width - 3 * gap) / 4;
  statCard(doc, left, statsY, statWidth, 102, 'Capacidad', config.batteryCapacity.split(' ')[0], 'Energía almacenada');
  statCard(doc, left + statWidth + gap, statsY, statWidth, 102, 'Salida AC', config.acOutput, config.boostOutput);
  statCard(doc, left + 2 * (statWidth + gap), statsY, statWidth, 102, 'Batería', config.batteryChemistry, config.batteryChargeCycles);
  statCard(doc, left + 3 * (statWidth + gap), statsY, statWidth, 102, 'Solar incluido', config.panelQuantity > 0 ? \`\${config.panelQuantity} x 100W\` : 'Opcional', config.panelQuantity > 0 ? 'Paneles rígidos' : 'Se cotiza aparte');

  const lowerY = 542;
  const lowerGap = 17;
  const lowerWidth = (width - lowerGap) / 2;
  roundedCard(doc, left, lowerY, lowerWidth, 170);
  roundedCard(doc, left + lowerWidth + lowerGap, lowerY, lowerWidth, 170);

  label(doc, 'Autonomía estimada', left + 20, lowerY + 23, COLORS.tealDark, 7.5, 200);
  const usages = [
    ['Abanico 50W', \`~\${config.usageHours.fan50w} h\`, 0.88],
    ['Nevera 150W', \`~\${config.usageHours.fridge150w} h\`, 0.58],
    ['TV 80W', \`~\${config.usageHours.tv80w} h\`, 0.72],
    ['Uso combinado', \`~\${config.usageHours.combined} h\`, 0.36]
  ];
  let y = lowerY + 59;
  for (const [name, value, fraction] of usages) {
    doc.font('Helvetica-Bold').fontSize(7.6).fillColor(COLORS.text).text(name, left + 20, y, { width: 120 });
    doc.font('Helvetica-Bold').fontSize(7.6).fillColor(COLORS.muted).text(value, left + lowerWidth - 75, y, { width: 55, align: 'right' });
    doc.fillColor('#E7EEEE').roundedRect(left + 20, y + 18, lowerWidth - 40, 6, 3).fill();
    doc.fillColor(COLORS.teal).roundedRect(left + 20, y + 18, (lowerWidth - 40) * fraction, 6, 3).fill();
    y += 32;
  }

  const stepsX = left + lowerWidth + lowerGap;
  label(doc, 'Próximos pasos', stepsX + 20, lowerY + 23, COLORS.tealDark, 7.5, 200);
  const steps = ['Confirma tu interés', 'Revisamos ubicación y cargas', 'Coordinamos entrega y orientación'];
  y = lowerY + 61;
  steps.forEach((text, index) => {
    doc.fillColor(COLORS.teal).circle(stepsX + 32, y + 3, 12).fill();
    doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.white).text(String(index + 1), stepsX + 25, y - 1, { width: 14, align: 'center' });
    doc.font('Helvetica-Bold').fontSize(8.3).fillColor(COLORS.text).text(text, stepsX + 53, y - 2, { width: lowerWidth - 72, ellipsis: true });
    y += 45;
  });

  doc.fillColor(COLORS.teal).roundedRect(left, 735, width, 52, 15).fill();
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.dark).text('¿Listo para asegurar tu energía?', left + 24, 754, { width: 260 });
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.dark).text(\`LLAMA AL \${BRAND.phone}\`, right - 230, 754, { width: 205, align: 'right' });

  doc.font('Helvetica').fontSize(5.8).fillColor(COLORS.muted).text(
    'Precios sujetos a disponibilidad y evaluación técnica. Instalación y accesorios no incluidos salvo indicación expresa. Autonomías aproximadas según consumo real.',
    left,
    790,
    { width, align: 'justify' }
  );
  drawFooter(doc);
}`;
source = source.slice(0, specsStart) + newSpecsPage + source.slice(specsEnd);

fs.writeFileSync(leadPath, source);

const assets = [
  ['Delta 2 max/delta2-frente.png', 'public/quote-assets/delta-2-max-product.png'],
  ['Delta Pro Ultra/DeltaProUltra.png', 'public/quote-assets/delta-pro-ultra-product.png'],
  ['Delta Pro Ultra/deltaproultra+smhp2.png', 'public/quote-assets/delta-pro-ultra-smhp2-product.png']
];
for (const [from, to] of assets) {
  if (!fs.existsSync(from)) throw new Error(`Falta asset fuente: ${from}`);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

fs.rmSync('public/quote-assets/delta-pro-ultra-cover-jerry.png', { force: true });
console.log('PDF visual fix aplicado correctamente.');
