import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const BRAND = Object.freeze({
  consultant: 'Jerry Encarnación',
  phone: '787-628-1344',
  email: 'info@powersolarprr.com',
  website: 'jerry.ecoflow-pr.com',
  websiteUrl: 'https://jerry.ecoflow-pr.com'
});

const COLORS = Object.freeze({
  dark: '#0B1013',
  dark2: '#121A1E',
  teal: '#13BFC0',
  tealDark: '#008F91',
  tealPale: '#E7F8F7',
  bg: '#F4F7F6',
  white: '#FFFFFF',
  text: '#1D2A2E',
  muted: '#607075',
  line: '#D9E3E2',
  green: '#27A66A'
});

const A4 = Object.freeze({ width: 595.28, height: 841.89 });
const ASSET_ROOT = path.join(process.cwd(), 'public', 'quote-assets');

export const PRODUCTS_TABLE = {
  'Batería para apartamento (Delta 2 Max)': {
    normalizedName: 'DELTA 2 Max',
    shortName: 'DELTA 2 Max',
    aliases: [
      'Delta 2 Max',
      'DELTA 2 Max',
      'Batería para apartamento',
      'Batería EcoFlow para apartamento',
      'Batería EcoFlow Delta 2 Max'
    ],
    bundleName: 'DELTA 2 Max + Paneles Solares',
    components: 'DELTA 2 Max (2048Wh) y 2 paneles rígidos de 100W',
    price: 2998,
    eligible: true,
    batteryCapacity: '2048Wh (2 kWh)',
    batteryDimensions: '15.2" x 8.1" x 8.8" (38.6cm x 20.6cm x 22.4cm)',
    batteryDimensionsFeet: '1.27 ft³',
    batteryWeight: '23 kg (50.7 lbs)',
    batteryChargeCycles: '6000+ ciclos',
    acOutput: '2400W',
    boostOutput: 'Hasta 3400W X-Boost',
    batteryChemistry: 'LiFePO4',
    description: 'Respaldo portátil, silencioso y compacto para apartamentos y equipos esenciales.',
    usageHours: { fan50w: 40, fridge150w: 13, tv80w: 25, combined: 5 },
    panelQuantity: 2,
    panelWattage: '100W cada uno',
    panelDimensions: '47.2" x 21.3" x 1.4" (119.9cm x 54.1cm x 3.5cm)',
    panelDimensionsFeet: '5.4 ft² por panel',
    panelTotalFeet: '10.8 ft² entre ambos paneles',
    panelWeight: '4.6 kg (10.1 lbs) por panel',
    panelChargeFull: '18 a 24 horas con sol pleno',
    productAsset: 'delta-2-max-product.png',
    recommendations: [
      'Alternar el uso del abanico y el televisor para extender la autonomía.',
      'Mantener la nevera en modo ECO cuando sea posible.',
      'Cargar completamente el equipo antes del primer uso.',
      'Colocar los paneles donde reciban al menos seis horas de sol directo.',
      'Evitar descargas completas frecuentes para prolongar la vida útil.'
    ]
  },
  'Batería para casa (Delta Pro 3)': {
    normalizedName: 'DELTA Pro 3',
    shortName: 'DELTA Pro 3',
    aliases: [
      'Delta Pro 3',
      'DELTA Pro 3',
      'Batería para casa',
      'Batería EcoFlow para casa',
      'Batería EcoFlow Delta Pro 3'
    ],
    bundleName: 'DELTA Pro 3 + Paneles Solares',
    components: 'DELTA Pro 3 (4096Wh) y 4 paneles rígidos de 100W',
    price: 5998,
    eligible: true,
    batteryCapacity: '4096Wh (4 kWh)',
    batteryDimensions: '14.4" x 10" x 10.6" (36.6cm x 25.4cm x 26.9cm)',
    batteryDimensionsFeet: '2.54 ft³',
    batteryWeight: '44 kg (97 lbs)',
    batteryChargeCycles: '6000+ ciclos',
    acOutput: '4000W',
    boostOutput: 'Hasta 8000W X-Boost',
    batteryChemistry: 'LiFePO4',
    description: 'Potencia, autonomía y flexibilidad para proteger lo esencial de tu hogar.',
    usageHours: { fan50w: 81, fridge150w: 27, tv80w: 51, combined: 10 },
    panelQuantity: 4,
    panelWattage: '100W cada uno',
    panelDimensions: '47.2" x 21.3" x 1.4" (119.9cm x 54.1cm x 3.5cm)',
    panelDimensionsFeet: '5.4 ft² por panel',
    panelTotalFeet: '21.6 ft² entre los cuatro paneles',
    panelWeight: '4.6 kg (10.1 lbs) por panel',
    panelChargeFull: '10 a 14 horas con sol pleno',
    coverAsset: 'delta-pro-3-cover-jerry.jpg',
    productAsset: 'delta-pro-3-product.png',
    recommendations: [
      'Sistema recomendado para hogares con tres o cuatro enseres activos.',
      'Considerar un Transfer Switch para facilitar el cambio a batería.',
      'Instalar los paneles en techo o área abierta con máxima exposición solar.',
      'Usar los equipos de mayor consumo en horarios distintos.',
      'Realizar limpieza y revisión periódica de los paneles.'
    ]
  },
  'Delta Pro Ultra + Smart Home Panel 2': {
    normalizedName: 'DELTA Pro Ultra + Smart Home Panel 2',
    shortName: 'DELTA Pro Ultra + SHP2',
    aliases: [
      'Delta Pro Ultra + Smart Home Panel 2',
      'Delta Pro Ultra + SHP2',
      'DELTA Pro Ultra + Smart Home Panel 2',
      'DELTA Pro Ultra + SHP2'
    ],
    bundleName: 'DELTA Pro Ultra + Smart Home Panel 2',
    components: 'DELTA Pro Ultra (6000Wh) y Smart Home Panel 2',
    price: 13498,
    eligible: true,
    batteryCapacity: '6000Wh (6 kWh)',
    batteryDimensions: '14.8" x 10.2" x 10.8" (37.5cm x 25.9cm x 27.4cm)',
    batteryDimensionsFeet: '2.98 ft³',
    batteryWeight: '62 kg (136.7 lbs)',
    batteryChargeCycles: '6000+ ciclos',
    acOutput: '7200W',
    boostOutput: 'Alta potencia para cargas del hogar',
    batteryChemistry: 'LiFePO4',
    description: 'Sistema premium de alta capacidad con Smart Home Panel 2 para respaldo inteligente integral del hogar.',
    usageHours: { fan50w: 120, fridge150w: 40, tv80w: 75, combined: 15 },
    panelQuantity: 0,
    panelWattage: 'No incluidos',
    panelDimensions: 'No aplica',
    panelDimensionsFeet: 'No aplica',
    panelTotalFeet: 'No aplica',
    panelWeight: 'No aplica',
    panelChargeFull: 'Se recomienda adquirir paneles compatibles por separado',
    coverAsset: 'delta-pro-ultra-smhp2-cover.png',
    productAsset: 'delta-pro-ultra-smhp2-product.png',
    recommendations: [
      'Sistema premium para respaldo energético de alta capacidad con Smart Home Panel 2.',
      'Permite la transferencia automática y control inteligente de cargas.',
      'Adecuado para electrodomésticos de alto consumo.',
      'Requiere instalación y evaluación técnica profesional por perito electricista.',
      'Puede ampliarse con baterías adicionales.'
    ]
  },
  'Sistema completo para hogar (Delta Pro Ultra)': {
    normalizedName: 'DELTA Pro Ultra',
    shortName: 'DELTA Pro Ultra',
    aliases: [
      'Delta Pro Ultra',
      'DELTA Pro Ultra',
      'Sistema completo para hogar',
      'Batería EcoFlow Delta Pro Ultra'
    ],
    bundleName: 'DELTA Pro Ultra',
    components: 'DELTA Pro Ultra (6000Wh)',
    price: 10998,
    eligible: true,
    batteryCapacity: '6000Wh (6 kWh)',
    batteryDimensions: '14.8" x 10.2" x 10.8" (37.5cm x 25.9cm x 27.4cm)',
    batteryDimensionsFeet: '2.98 ft³',
    batteryWeight: '62 kg (136.7 lbs)',
    batteryChargeCycles: '6000+ ciclos',
    acOutput: '7200W',
    boostOutput: 'Alta potencia para cargas del hogar',
    batteryChemistry: 'LiFePO4',
    description: 'Sistema premium de alta capacidad para respaldo energético integral del hogar.',
    usageHours: { fan50w: 120, fridge150w: 40, tv80w: 75, combined: 15 },
    panelQuantity: 0,
    panelWattage: 'No incluidos',
    panelDimensions: 'No aplica',
    panelDimensionsFeet: 'No aplica',
    panelTotalFeet: 'No aplica',
    panelWeight: 'No aplica',
    panelChargeFull: 'Se recomienda adquirir paneles compatibles por separado',
    coverAsset: 'delta-pro-ultra-cover-jerry.jpg',
    productAsset: 'delta-pro-ultra-product.png',
    recommendations: [
      'Sistema premium para respaldo energético de alta capacidad.',
      'Compatible con Smart Home Panel 2 para control inteligente.',
      'Adecuado para electrodomésticos de alto consumo.',
      'Requiere instalación y evaluación técnica profesional.',
      'Puede ampliarse con baterías adicionales.'
    ]
  }
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getAuthorizedProduct(productValue) {
  const input = normalizeText(productValue);
  if (!input) return null;

  for (const [key, config] of Object.entries(PRODUCTS_TABLE)) {
    const candidates = [key, config.normalizedName, ...(config.aliases || [])]
      .map(normalizeText)
      .filter(Boolean);

    const exact = candidates.some((candidate) => input === candidate);
    const descriptive = candidates.some((candidate) => {
      if (candidate.length < 8) return false;
      return input.includes(candidate) || candidate.includes(input);
    });

    if (exact || descriptive) return { key, ...config };
  }
  return null;
}

function resolveLocalAsset(filename) {
  if (!filename) return null;
  const candidate = path.join(ASSET_ROOT, filename);
  return fs.existsSync(candidate) ? candidate : null;
}

async function fetchImageBuffer(url) {
  if (!url) return null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(7000) });
    if (!response.ok) return null;
    const type = String(response.headers.get('content-type') || '').toLowerCase();
    if (!type.startsWith('image/')) return null;
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > 5_000_000) return null;
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.warn('[QUOTE_ASSET] No se pudo descargar imagen remota:', error.message);
    return null;
  }
}

async function loadProductImage(config) {
  if (config.productAsset) {
    const local = resolveLocalAsset(config.productAsset);
    if (local) return local;
    console.warn('[QUOTE_ASSET] No existe el PNG local requerido:', config.productAsset);
  }
  return fetchImageBuffer(config.productImageUrl);
}

function formatPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return String(value || 'No indicado');
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function roundedCard(doc, x, y, width, height, fill = COLORS.white, stroke = COLORS.line, radius = 12) {
  doc.save().lineWidth(0.8).fillColor(fill).strokeColor(stroke).roundedRect(x, y, width, height, radius).fillAndStroke().restore();
}

function label(doc, text, x, y, color = COLORS.muted, size = 7.5, width = 220) {
  doc.font('Helvetica-Bold').fontSize(size).fillColor(color).text(String(text).toUpperCase(), x, y, {
    width,
    lineBreak: false
  });
}

function fitImage(doc, image, x, y, width, height, options = {}) {
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
}

function drawProductPlaceholder(doc, x, y, width, height, config, dark = false) {
  const fill = dark ? '#17262B' : COLORS.tealPale;
  const stroke = dark ? COLORS.teal : '#B8DEDD';
  const textColor = dark ? COLORS.white : COLORS.text;
  doc.save().fillColor(fill).strokeColor(stroke).lineWidth(1.2).roundedRect(x, y, width, height, 12).fillAndStroke();
  doc.fillColor(dark ? COLORS.teal : COLORS.tealDark).font('Helvetica-Bold').fontSize(Math.max(7, width / 14)).text('ECOFLOW', x + 8, y + height * 0.30, { width: width - 16, align: 'center' });
  doc.fillColor(textColor).font('Helvetica-Bold').fontSize(Math.max(7, width / 16)).text(config.normalizedName, x + 8, y + height * 0.52, { width: width - 16, align: 'center', ellipsis: true });
  doc.restore();
}

function drawFullBleedImage(doc, image) {
  doc.image(image, 0, 0, { width: A4.width, height: A4.height });
}

function drawDynamicCover(doc, config, productImage) {
  doc.rect(0, 0, A4.width, A4.height).fill(COLORS.dark);
  doc.rect(0, 0, A4.width, 6).fill(COLORS.teal);

  doc.font('Helvetica').fontSize(27).fillColor(COLORS.teal).text('COTIZACIÓN', 36, 55, { characterSpacing: 1.2 });
  doc.font('Helvetica-Bold').fontSize(66).fillColor(COLORS.white).text('ECOFLOW', 34, 98, { width: 525, characterSpacing: 2 });
  doc.font('Helvetica').fontSize(15).fillColor('#D6E4E5').text('SOLUCIONES DE ENERGÍA ', 38, 180, { continued: true });
  doc.fillColor(COLORS.teal).text('CONFIABLE');

  doc.save().fillColor('#17262B').circle(420, 440, 170).fill().restore();
  doc.save().fillColor('#1B3035').circle(430, 440, 122).fill().restore();
  if (productImage) fitImage(doc, productImage, 270, 250, 280, 340);
  else drawProductPlaceholder(doc, 315, 325, 205, 205, config, true);

  doc.font('Helvetica-Bold').fontSize(31).fillColor(COLORS.white).text(config.normalizedName, 38, 625, { width: 520 });
  doc.font('Helvetica').fontSize(12).fillColor('#C5D3D5').text(config.description, 40, 671, { width: 500, lineGap: 3 });

  doc.rect(0, 725, A4.width, 117).fill('#000000');
  doc.rect(0, 724, A4.width, 2).fill(COLORS.teal);
  doc.font('Helvetica-Bold').fontSize(18).fillColor(COLORS.white).text('POWER SOLAR', 38, 755);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(COLORS.white).text('Más ', 355, 750, { continued: true });
  doc.fillColor(COLORS.teal).text('Información');
  doc.font('Helvetica').fontSize(11).fillColor(COLORS.white).text(`${BRAND.phone}  |  ${BRAND.website}`, 315, 785, { width: 240, align: 'right' });
}

function drawCover(doc, config, productImage, lead) {
  const cover = resolveLocalAsset(config.coverAsset);
  if (cover) {
    drawFullBleedImage(doc, cover);
    if (config.coverAsset === 'delta-pro-ultra-smhp2-cover.png' && lead) {
      // Draw the dynamic customer information perfectly symmetric to the right block
      doc.save();
      // Label: “PREPARADA PARA:” in teal
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(COLORS.teal).text('PREPARADA PARA:', 38, 706);

      // Customer name: lead.nombre in bold white
      doc.font('Helvetica-Bold').fontSize(13.5).fillColor(COLORS.white).text(lead.nombre.toUpperCase(), 38, 724, { width: 250, ellipsis: true });

      // Customer phone: lead.telefono in white
      doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.white).text(formatPhone(lead.telefono), 38, 745);

      // Customer email: lead.email in white
      doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.white).text(lead.email, 38, 761, { width: 250, ellipsis: true });
      doc.restore();
    } else if (config.coverAsset === 'delta-pro-ultra-cover-jerry.jpg' && lead) {
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
    }
  } else {
    drawDynamicCover(doc, config, productImage);
  }
}

function drawHeader(doc, quoteId, pageNum) {
  doc.rect(0, 0, A4.width, 99).fill(COLORS.dark);
  doc.rect(0, 99, A4.width, 2.3).fill(COLORS.teal);

  doc.font('Helvetica').fontSize(28).fillColor(COLORS.white).text('ECOFLOW', 51, 29, { characterSpacing: 2 });
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLORS.teal).text('COTIZACIÓN PERSONALIZADA', 51, 67, { characterSpacing: 0.8 });

  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.white).text('POWER SOLAR', 370, 31, { width: 174, align: 'right' });
  doc.font('Helvetica').fontSize(7.5).fillColor('#AFC0C4').text(`${quoteId}  |  Página ${pageNum} de 3`, 330, 59, { width: 214, align: 'right' });
}

function drawFooter(doc) {
  doc.strokeColor(COLORS.line).lineWidth(0.5).moveTo(51, 800).lineTo(544, 800).stroke();
  doc.font('Helvetica').fontSize(6.8).fillColor(COLORS.muted).text(
    'Jerry Encarnación - Consultor energético de Power Solar y EcoFlow Puerto Rico',
    51,
    811,
    { width: 330 }
  );
  doc.font('Helvetica').fontSize(6.8).fillColor(COLORS.muted).text(
    `${BRAND.phone}  |  ${BRAND.website}`,
    350,
    811,
    { width: 194, align: 'right' }
  );
}

function drawQuotePage(doc, lead, quote, config, productImage) {
  drawHeader(doc, quote.quoteId, 2);
  doc.rect(0, 101.3, A4.width, A4.height - 101.3).fill(COLORS.bg);

  const left = 51;
  const right = 544;
  const width = right - left;

  label(doc, 'Propuesta de respaldo energético', left, 139, COLORS.tealDark, 7.5, 300);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(COLORS.text).text('Tu solución de respaldo energético', left, 157, { width: 400 });
  doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.muted).text(`Preparada especialmente para ${lead.nombre}`, left, 190, { width: 370, ellipsis: true });

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
    ? `Incluye ${config.panelQuantity} paneles solares rígidos de ${config.panelWattage.replace(' cada uno', '')}`
    : 'Paneles solares no incluidos en este paquete';
  doc.font('Helvetica').fontSize(8.3).fillColor(COLORS.muted).text(solarCopy, titleX, productY + 143, { width: 245, ellipsis: true });

  const priceX = left + 272;
  doc.strokeColor(COLORS.line).moveTo(priceX, productY + 24).lineTo(priceX, productY + 146).stroke();
  label(doc, 'Inversión total', priceX + 24, productY + 38, COLORS.muted, 7.5, 100);
  doc.font('Helvetica-Bold').fontSize(25).fillColor(COLORS.tealDark).text(`$${Number(config.price).toLocaleString('en-US')}`, priceX + 23, productY + 57, { width: 115 });
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

  drawFittedText(doc, `EcoFlow ${config.normalizedName}`, left + 20, tableY + 53, 325, 22, {
    font: 'Helvetica-Bold', color: COLORS.text, maxSize: 9.5, minSize: 8
  });
  doc.font('Helvetica').fontSize(7.8).fillColor(COLORS.muted).text(`Capacidad ${config.batteryCapacity} | Salida AC ${config.acOutput} | ${config.boostOutput}`, left + 20, tableY + 76, { width: 365, ellipsis: true });
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLORS.text).text(`$${formatMoney(config.price)}`, right - 130, tableY + 56, { width: 110, align: 'right' });
  doc.strokeColor(COLORS.line).moveTo(left + 20, tableY + 95).lineTo(right - 20, tableY + 95).stroke();

  const panelTitle = config.panelQuantity > 0
    ? `${config.panelQuantity} paneles solares rígidos de ${config.panelWattage.replace(' cada uno', '')}`
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
  doc.font('Helvetica-Bold').fontSize(13).fillColor(COLORS.tealDark).text(`$${formatMoney(config.price)} USD`, right - 190, tableY + 157, { width: 160, align: 'right' });

  drawFooter(doc);
}
function statCard(doc, x, y, width, height, title, value, detail) {
  roundedCard(doc, x, y, width, height, COLORS.white, COLORS.line, 12);
  label(doc, title, x + 15, y + 17, COLORS.tealDark, 7, width - 30);
  doc.font('Helvetica-Bold').fontSize(15).fillColor(COLORS.text).text(value, x + 15, y + 42, { width: width - 30, ellipsis: true });
  doc.font('Helvetica').fontSize(7.2).fillColor(COLORS.muted).text(detail, x + 15, y + height - 23, { width: width - 30, ellipsis: true });
}

function drawSpecsPage(doc, config, quote, productImage) {
  drawHeader(doc, quote.quoteId, 3);
  doc.rect(0, 101.3, A4.width, A4.height - 101.3).fill(COLORS.bg);
  const left = 51;
  const right = 544;
  const width = right - left;

  const titleText = `Conoce tu ${config.normalizedName}`;
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
  statCard(doc, left + 3 * (statWidth + gap), statsY, statWidth, 102, 'Solar incluido', config.panelQuantity > 0 ? `${config.panelQuantity} x 100W` : 'Opcional', config.panelQuantity > 0 ? 'Paneles rígidos' : 'Se cotiza aparte');

  const lowerY = 542;
  const lowerGap = 17;
  const lowerWidth = (width - lowerGap) / 2;
  roundedCard(doc, left, lowerY, lowerWidth, 170);
  roundedCard(doc, left + lowerWidth + lowerGap, lowerY, lowerWidth, 170);

  label(doc, 'Autonomía estimada', left + 20, lowerY + 23, COLORS.tealDark, 7.5, 200);
  const usages = [
    ['Abanico 50W', `~${config.usageHours.fan50w} h`, 0.88],
    ['Nevera 150W', `~${config.usageHours.fridge150w} h`, 0.58],
    ['TV 80W', `~${config.usageHours.tv80w} h`, 0.72],
    ['Uso combinado', `~${config.usageHours.combined} h`, 0.36]
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
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.dark).text(`LLAMA AL ${BRAND.phone}`, right - 230, 754, { width: 205, align: 'right' });

  doc.font('Helvetica').fontSize(5.8).fillColor(COLORS.muted).text(
    'Precios sujetos a disponibilidad y evaluación técnica. Instalación y accesorios no incluidos salvo indicación expresa. Autonomías aproximadas según consumo real.',
    left,
    790,
    { width, align: 'justify' }
  );
  drawFooter(doc);
}
export async function generatePremiumQuotePdf(lead, quote, config) {
  const productImage = await loadProductImage(config);
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: false, compress: true });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.info.Title = `Cotización EcoFlow ${config.normalizedName} - ${lead.nombre}`;
      doc.info.Author = `${BRAND.consultant} - Power Solar`;
      doc.info.Subject = 'Cotización personalizada EcoFlow';

      doc.addPage({ size: 'A4', margin: 0 });
      drawCover(doc, config, productImage, lead);

      doc.addPage({ size: 'A4', margin: 0 });
      drawQuotePage(doc, lead, quote, config, productImage);

      doc.addPage({ size: 'A4', margin: 0 });
      drawSpecsPage(doc, config, quote, productImage);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

async function postToGas(gasUrl, payload) {
  const response = await fetch(gasUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { response, data };
}

function buildLeadPayload(body, values, gasToken, sendClientEmail, baseUrl) {
  return {
    token: gasToken,
    action: 'addLead',
    nombre: values.nombre,
    email: values.email,
    telefono: values.telefono,
    pueblo: values.pueblo,
    factura: body.factura || body.monthlyBill || '',
    origen: body.origen || body.leadSource || 'EcoFlow PR Website',
    gclid: body.gclid || '',
    gbraid: body.gbraid || '',
    wbraid: body.wbraid || '',
    fbclid: body.fbclid || '',
    utm_source: body.utm_source || '',
    utm_medium: body.utm_medium || '',
    utm_campaign: body.utm_campaign || '',
    utm_content: body.utm_content || '',
    utm_term: body.utm_term || '',
    landing_page: body.landing_page || body.url || '',
    referrer: body.referrer || '',
    anotaciones: body.anotaciones || body.notes || body.message || '',
    producto: values.productoOriginal,
    notifyAdmin: true,
    sendClientEmail,
    sourceMode: 'external',
    dedupeMode: 'merge',
    baseUrl
  };
}

function generateEmailHtml(lead, config, publicBaseUrl, rawToken) {
  const confirmYesUrl = `${publicBaseUrl}/cotizacion/confirmar?id=${encodeURIComponent(lead.id)}&token=${encodeURIComponent(rawToken)}&interest=yes`;
  const confirmNoUrl = `${publicBaseUrl}/cotizacion/confirmar?id=${encodeURIComponent(lead.id)}&token=${encodeURIComponent(rawToken)}&interest=no`;

  const name = escapeHtml(lead.nombre);
  const product = escapeHtml(config.normalizedName);
  const bundle = escapeHtml(config.bundleName);
  const components = escapeHtml(config.components);

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cotización de Jerry Encarnación</title>
  <style>
    @media only screen and (max-width:620px) {
      .email-shell{width:100%!important}.mobile-pad{padding-left:18px!important;padding-right:18px!important}
      .action-cell{display:block!important;width:100%!important;padding:0 0 10px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#eef4f0;font-family:Arial,Helvetica,sans-serif;color:#1d2a2e;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef4f0;">
<tr><td align="center" style="padding:20px 10px;">
<table role="presentation" class="email-shell" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#fff;border-collapse:separate;">
<tr><td class="mobile-pad" style="padding:24px 30px;background:#0b1013;border-bottom:3px solid #13bfc0;color:#fff;">
<table width="100%"><tr><td style="font-size:20px;font-weight:900;letter-spacing:2px;">JERRY ENCARNACIÓN</td><td align="right" style="font-size:11px;font-weight:bold;color:#8adada;">CONSULTOR ENERGÉTICO</td></tr></table>
</td></tr>
<tr><td class="mobile-pad" style="padding:36px 30px;background:#e7f8f7;">
<p style="margin:0 0 10px;font-size:11px;letter-spacing:3px;color:#008f91;font-weight:bold;">TU COTIZACIÓN ECOFLOW</p>
<h1 style="margin:0 0 14px;font-size:32px;color:#1d2a2e;">¡Hola, ${name}!</h1>
<p style="margin:0;font-size:16px;line-height:1.6;color:#607075;">Preparamos una propuesta personalizada. El PDF premium con portada, inversión, especificaciones y próximos pasos está adjunto.</p>
</td></tr>
<tr><td class="mobile-pad" style="padding:30px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;border:1px solid #d9e3e2;border-radius:12px;">
<tr><td style="padding:20px 22px 8px;font-size:12px;color:#607075;">PRODUCTO</td></tr>
<tr><td style="padding:0 22px 12px;font-size:22px;font-weight:bold;">${product}</td></tr>
<tr><td style="padding:8px 22px;"><b>Paquete:</b> ${bundle}</td></tr>
<tr><td style="padding:8px 22px;"><b>Componentes:</b> ${components}</td></tr>
<tr><td style="padding:18px 22px 22px;border-top:1px solid #d9e3e2;"><span style="font-size:12px;color:#607075;">INVERSIÓN TOTAL</span><div style="font-size:28px;font-weight:900;color:#008f91;">$${formatMoney(config.price)} USD</div></td></tr>
</table>
</td></tr>
<tr><td class="mobile-pad" style="padding:0 30px 28px;">
<p style="text-align:center;font-size:17px;font-weight:bold;">¿Cómo deseas proceder?</p>
<table width="100%"><tr><td class="action-cell" width="50%" style="padding-right:6px;"><a href="${confirmYesUrl}" style="display:block;background:#13bfc0;color:#0b1013;text-decoration:none;font-weight:bold;padding:16px;border-radius:9px;text-align:center;">SÍ, ME INTERESA</a></td><td class="action-cell" width="50%" style="padding-left:6px;"><a href="${confirmNoUrl}" style="display:block;background:#d95555;color:#fff;text-decoration:none;font-weight:bold;padding:16px;border-radius:9px;text-align:center;">NO ME INTERESA</a></td></tr></table>
</td></tr>
<tr><td class="mobile-pad" style="padding:24px 30px;background:#0b1013;color:#fff;text-align:center;line-height:1.7;">
<b>${BRAND.consultant}</b><br>${BRAND.phone}<br><a href="${BRAND.websiteUrl}" style="color:#13bfc0;text-decoration:none;">${BRAND.website}</a>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function generateEmailText(lead, config, publicBaseUrl, rawToken) {
  const yesUrl = `${publicBaseUrl}/cotizacion/confirmar?id=${encodeURIComponent(lead.id)}&token=${encodeURIComponent(rawToken)}&interest=yes`;
  const noUrl = `${publicBaseUrl}/cotizacion/confirmar?id=${encodeURIComponent(lead.id)}&token=${encodeURIComponent(rawToken)}&interest=no`;
  return `Hola ${lead.nombre},

Hemos preparado tu cotización EcoFlow premium.

PRODUCTO
${config.normalizedName}
Paquete: ${config.bundleName}
Componentes: ${config.components}
Inversión total: $${formatMoney(config.price)} USD

El PDF formal está adjunto.

SÍ, ME INTERESA:
${yesUrl}

NO ME INTERESA:
${noUrl}

${BRAND.consultant}
${BRAND.phone}
${BRAND.website}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const gasUrl = String(process.env.GAS_URL || 'https://script.google.com/macros/s/AKfycbxi2ATuJrRfzBysZqxl8NzGhEIsVf8grL1Ti5EcWRSi6NeGZc-gRVz2BqlVpDIeQ-4C/exec').trim();
    const gasToken = String(process.env.GAS_TOKEN || '').trim();
    if (!gasToken) return res.status(500).json({ ok: false, error: 'Falta GAS_TOKEN en Vercel' });

    const body = req.body || {};
    const nombre = String(body.nombre || body.name || '').trim();
    const email = String(body.email || '').trim();
    const telefono = String(body.telefono || body.phone || '').replace(/\D/g, '');
    const pueblo = String(body.pueblo || body.city || '').trim();

    const productFields = ['producto', 'productoOriginal', 'product', 'productName', 'modelo', 'model'];
    let productoOriginal = '';
    for (const field of productFields) {
      if (String(body[field] || '').trim()) {
        productoOriginal = String(body[field]).trim();
        break;
      }
    }
    if (!productoOriginal && getAuthorizedProduct(body.anotaciones)) productoOriginal = String(body.anotaciones).trim();

    if (!nombre) return res.status(400).json({ ok: false, error: 'Falta campo obligatorio: nombre' });
    if (!telefono || telefono.length < 7) return res.status(400).json({ ok: false, error: 'Teléfono inválido' });
    if (!email) return res.status(400).json({ ok: false, error: 'El email es obligatorio para enviar la confirmación y la cotización' });
    if (!isValidEmail(email)) return res.status(400).json({ ok: false, error: 'Email inválido' });

    const productConfig = getAuthorizedProduct(productoOriginal);
    const eligible = Boolean(productConfig?.eligible);
    const values = { nombre, email, telefono, pueblo, productoOriginal };

    let publicBaseUrl = String(process.env.PUBLIC_BASE_URL || BRAND.websiteUrl).trim().replace(/\/+$/, '');
    if (!/^https:\/\//i.test(publicBaseUrl) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(publicBaseUrl)) {
      publicBaseUrl = BRAND.websiteUrl;
    }

    const { response: leadResponse, data: leadData } = await postToGas(
      gasUrl,
      buildLeadPayload(body, values, gasToken, true, publicBaseUrl)
    );
    if (!leadResponse.ok || leadData.error || !leadData.id) {
      return res.status(500).json({ ok: false, error: 'GAS respondió con error al guardar lead', gasResponse: leadData });
    }

    const leadId = leadData.id;
    if (!eligible) return res.status(200).json({ ok: true, leadId, quoteStatus: 'no_aplica' });

    const quoteId = `Q${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenExpiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const isTestMode = String(process.env.TEST_MODE) === 'true';
    const testEmailRecipient = String(process.env.TEST_EMAIL_RECIPIENT || 'jerrypowersolar@gmail.com').trim();
    const finalRecipient = isTestMode ? testEmailRecipient : email;
    const subjectPrefix = isTestMode ? '[PRUEBA] ' : '';

    let pdfBuffer;
    try {
      pdfBuffer = await generatePremiumQuotePdf({ nombre, telefono, email, pueblo }, { quoteId }, productConfig);
    } catch (pdfError) {
      await postToGas(gasUrl, {
        token: gasToken,
        action: 'logQuoteError',
        quoteId,
        leadId,
        error: `Fallo al generar PDF premium: ${pdfError.message}`,
        productoOriginal,
        productoNormalizado: productConfig.normalizedName,
        nombreBundle: productConfig.bundleName,
        componentesBundle: productConfig.components,
        precio: productConfig.price,
        recipientEmail: finalRecipient,
        testMode: isTestMode
      }).catch(() => null);
      return res.status(200).json({ ok: true, leadId, quoteStatus: 'fallida_pdf' });
    }

    const lead = { id: leadId, nombre, email, telefono, pueblo };
    const subject = `${subjectPrefix}Cotización de Jerry Encarnación — ${productConfig.normalizedName}`;
    const quotePayload = {
      token: gasToken,
      action: 'sendQuoteEmail',
      quoteId,
      leadId,
      leadNombre: nombre,
      recipientEmail: finalRecipient,
      pdfBase64: pdfBuffer.toString('base64'),
      pdfFilename: `Cotizacion-${productConfig.normalizedName.replace(/\s+/g, '-')}-${quoteId}.pdf`,
      emailHtml: generateEmailHtml(lead, productConfig, publicBaseUrl, rawToken),
      emailText: generateEmailText(lead, productConfig, publicBaseUrl, rawToken),
      subject,
      testMode: isTestMode,
      tokenHash,
      tokenExpiration,
      productoOriginal,
      productoNormalizado: productConfig.normalizedName,
      nombreBundle: productConfig.bundleName,
      componentesBundle: productConfig.components,
      precio: productConfig.price
    };

    const { response: quoteResponse, data: quoteData } = await postToGas(gasUrl, quotePayload);
    if (!quoteResponse.ok || quoteData.error) {
      return res.status(200).json({
        ok: true,
        leadId,
        quoteStatus: 'fallida_envio',
        message: 'Lead guardado, pero falló el envío de la cotización',
        gasResponse: quoteData
      });
    }

    return res.status(200).json({ ok: true, leadId, quoteStatus: 'enviada', quoteId });
  } catch (error) {
    console.error('[FATAL_ERROR]', error);
    return res.status(500).json({ ok: false, error: 'Error en backend de lead', message: error.message });
  }
}
