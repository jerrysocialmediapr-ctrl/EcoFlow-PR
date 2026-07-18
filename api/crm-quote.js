import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import PDFDocument from 'pdfkit';
import { getAuthorizedProduct } from './lead.js';

const BRAND = Object.freeze({
  consultant: 'Jerry Encarnación',
  phone: '787-628-1344',
  email: 'info@powersolarprr.com',
  website: 'jerry.ecoflow-pr.com',
  websiteUrl: 'https://jerry.ecoflow-pr.com',
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
  green: '#27A66A',
  red: '#D95555',
});

const A4 = Object.freeze({ width: 595.28, height: 841.89 });
const ASSET_ROOT = path.join(process.cwd(), 'public', 'quote-assets');

const DELTA_PRO_FALLBACK = Object.freeze({
  normalizedName: 'DELTA Pro',
  shortName: 'DELTA Pro',
  bundleName: 'DELTA Pro',
  components: 'DELTA Pro 3600Wh',
  price: 4998,
  eligible: true,
  batteryCapacity: '3600Wh (3.6 kWh)',
  batteryDimensions: 'Sistema portátil de alta capacidad',
  batteryDimensionsFeet: 'Consultar ficha técnica',
  batteryWeight: 'Consultar ficha técnica',
  batteryChargeCycles: 'Batería de larga duración',
  acOutput: '3600W',
  boostOutput: 'Hasta 4500W X-Boost',
  batteryChemistry: 'LFP',
  description: 'Respaldo energético de alta capacidad para equipos esenciales y cargas del hogar.',
  usageHours: { fan50w: 72, fridge150w: 24, tv80w: 45, combined: 9 },
  panelQuantity: 0,
  panelWattage: 'Opcionales',
  panelDimensions: 'Según panel seleccionado',
  panelDimensionsFeet: 'Según panel seleccionado',
  panelTotalFeet: 'Según cantidad seleccionada',
  panelWeight: 'Según panel seleccionado',
  panelChargeFull: 'Según potencia solar instalada',
  recommendations: [
    'Revisar las cargas que permanecerán conectadas durante un apagón.',
    'Considerar Smart Home Panel 1 para transferencia automática.',
    'Mantener la batería cargada antes de la temporada de huracanes.',
    'Colocar los paneles solares en un área con exposición directa.',
  ],
});

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function secureEqual(actual, expected) {
  const a = Buffer.from(String(actual || ''));
  const b = Buffer.from(String(expected || ''));
  return a.length === b.length && b.length > 0 && crypto.timingSafeEqual(a, b);
}

function authorized(req) {
  const expected = String(process.env.CRM_QUOTE_TOKEN || process.env.GAS_TOKEN || '').trim();
  const header = String(req.headers.authorization || '');
  const provided = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  return secureEqual(provided, expected);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPhone(value) {
  const valueDigits = String(value || '').replace(/\D/g, '');
  if (valueDigits.length === 10) return `${valueDigits.slice(0, 3)}-${valueDigits.slice(3, 6)}-${valueDigits.slice(6)}`;
  return String(value || 'No indicado');
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
}

export function sanitizeQuoteItems(items = []) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 12).map((item, index) => {
    const name = String(item?.name || '').trim().slice(0, 120);
    const quantity = clampNumber(item?.quantity || 1, 1, 100);
    const included = Boolean(item?.included);
    const unitPrice = included ? 0 : clampNumber(item?.unitPrice || 0, 0, 100000);
    return {
      id: index + 1,
      name,
      quantity,
      unitPrice,
      included,
      note: String(item?.note || '').trim().slice(0, 240),
      lineTotal: quantity * unitPrice,
    };
  }).filter((item) => item.name);
}

export function calculateQuoteTotals(items = [], requestedDiscount = 0) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
  const discount = Math.min(subtotal, clampNumber(requestedDiscount, 0, 100000));
  return { subtotal, discount, total: subtotal - discount };
}

export function resolveQuoteProduct(productValue) {
  const authorizedProduct = getAuthorizedProduct(productValue);
  if (authorizedProduct) return authorizedProduct;
  const normalized = normalizeText(productValue);
  if (normalized.includes('delta pro') && !normalized.includes('delta pro 3') && !normalized.includes('ultra')) {
    return { key: 'Delta Pro 3600', ...DELTA_PRO_FALLBACK };
  }
  return null;
}

function resolveAsset(filename) {
  if (!filename) return null;
  const candidate = path.join(ASSET_ROOT, filename);
  return fs.existsSync(candidate) ? candidate : null;
}

function fitImage(doc, image, x, y, width, height) {
  if (!image) return;
  try {
    doc.image(image, x, y, { fit: [width, height], align: 'center', valign: 'center' });
  } catch (error) {
    console.warn('[CRM_QUOTE] Imagen no compatible:', error.message);
  }
}

function roundedCard(doc, x, y, width, height, fill = COLORS.white, stroke = COLORS.line, radius = 12) {
  doc.save().lineWidth(0.8).fillColor(fill).strokeColor(stroke).roundedRect(x, y, width, height, radius).fillAndStroke().restore();
}

function label(doc, text, x, y, color = COLORS.muted, size = 7.5, width = 240) {
  doc.font('Helvetica-Bold').fontSize(size).fillColor(color).text(String(text).toUpperCase(), x, y, { width, lineBreak: false });
}

function drawCoverUserIcon(doc, centerX, centerY, radius = 13) {
  doc.save();
  doc.lineWidth(1.25).strokeColor(COLORS.teal).circle(centerX, centerY, radius).stroke();
  doc.fillColor(COLORS.teal).circle(centerX, centerY - 4.2, 3.4).fill();
  doc.fillColor(COLORS.teal).roundedRect(centerX - 6.2, centerY + 1.2, 12.4, 7.2, 3.5).fill();
  doc.restore();
}

function drawCoverPhoneIcon(doc, x, y, scale = 0.55) {
  const p = (value) => value * scale;
  doc.save();
  doc.lineWidth(0.95).strokeColor(COLORS.teal).lineCap('round').lineJoin('round');
  doc.moveTo(x + p(2), y + p(1))
    .lineTo(x + p(5), y)
    .lineTo(x + p(8), y + p(4))
    .lineTo(x + p(6), y + p(6))
    .bezierCurveTo(x + p(8), y + p(10), x + p(10), y + p(12), x + p(14), y + p(14))
    .lineTo(x + p(16), y + p(12))
    .lineTo(x + p(20), y + p(15))
    .lineTo(x + p(19), y + p(18))
    .bezierCurveTo(x + p(18), y + p(20), x + p(15), y + p(20), x + p(12), y + p(19))
    .bezierCurveTo(x + p(5), y + p(17), x + p(1), y + p(12), x, y + p(5))
    .bezierCurveTo(x - p(0.3), y + p(3), x + p(0.3), y + p(2), x + p(2), y + p(1))
    .stroke();
  doc.restore();
}

function drawCoverEmailIcon(doc, x, y, width = 11, height = 7.5) {
  doc.save();
  doc.lineWidth(0.95).strokeColor(COLORS.teal).roundedRect(x, y, width, height, 1.2).stroke();
  doc.moveTo(x + 0.8, y + 0.8).lineTo(x + width / 2, y + height * 0.58).lineTo(x + width - 0.8, y + 0.8).stroke();
  doc.restore();
}

function drawSingleLineCoverText(doc, text, x, y, width, font, startSize, minSize, color, height = 18) {
  const value = String(text || 'No indicado');
  let size = startSize;
  doc.font(font).fontSize(size);
  while (size > minSize && doc.widthOfString(value) > width) {
    size -= 0.5;
    doc.fontSize(size);
  }
  doc.fillColor(color).text(value, x, y, {
    width,
    height,
    ellipsis: true,
    lineBreak: false,
  });
}

function drawCustomerCoverBlock(doc, customer, options = {}) {
  const x = Number(options.x ?? 48);
  const y = Number(options.y ?? 700);
  const width = Number(options.width ?? 230);
  const lineWidth = Number(options.lineWidth ?? width);
  const contentX = x + 38;
  const textWidth = Math.max(120, width - 38);

  doc.save();
  drawCoverUserIcon(doc, x + 13, y + 19, 13);
  label(doc, 'Cotización para:', contentX, y + 3, COLORS.teal, 8, textWidth);
  drawSingleLineCoverText(doc, customer.nombre, contentX, y + 23, textWidth, 'Helvetica-Bold', 13.5, 9.5, COLORS.white, 18);

  drawCoverPhoneIcon(doc, contentX, y + 49, 0.55);
  drawSingleLineCoverText(doc, formatPhone(customer.telefono), contentX + 17, y + 45, textWidth - 17, 'Helvetica', 9.2, 7.5, '#D6E4E5', 16);

  drawCoverEmailIcon(doc, contentX, y + 69, 11, 7.5);
  drawSingleLineCoverText(doc, customer.email, contentX + 17, y + 64, textWidth - 17, 'Helvetica', 8.5, 6.5, '#D6E4E5', 17);

  doc.strokeColor(COLORS.teal).opacity(0.75).lineWidth(0.7).moveTo(x, y + 87).lineTo(x + lineWidth, y + 87).stroke();
  doc.opacity(1).restore();
}

function drawHeader(doc, quoteId, pageNumber) {
  doc.rect(0, 0, A4.width, 99).fill(COLORS.dark);
  doc.rect(0, 99, A4.width, 2.3).fill(COLORS.teal);
  doc.font('Helvetica').fontSize(28).fillColor(COLORS.white).text('ECOFLOW', 51, 29, { characterSpacing: 2 });
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLORS.teal).text('COTIZACIÓN PERSONALIZADA', 51, 67, { characterSpacing: 0.8 });
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.white).text('POWER SOLAR', 370, 31, { width: 174, align: 'right' });
  doc.font('Helvetica').fontSize(7.5).fillColor('#AFC0C4').text(`${quoteId}  |  Página ${pageNumber} de 3`, 330, 59, { width: 214, align: 'right' });
}

function drawFooter(doc) {
  doc.strokeColor(COLORS.line).lineWidth(0.5).moveTo(51, 800).lineTo(544, 800).stroke();
  doc.font('Helvetica').fontSize(6.8).fillColor(COLORS.muted).text(
    'Jerry Encarnación - Consultor energético de Power Solar y EcoFlow Puerto Rico',
    51, 811, { width: 330 }
  );
  doc.font('Helvetica').fontSize(6.8).fillColor(COLORS.muted).text(
    `${BRAND.phone}  |  ${BRAND.website}`,
    350, 811, { width: 194, align: 'right' }
  );
}

function drawProductPlaceholder(doc, config, x, y, width, height, dark = false) {
  roundedCard(doc, x, y, width, height, dark ? '#17262B' : COLORS.tealPale, dark ? COLORS.teal : '#B8DEDD', 14);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(dark ? COLORS.teal : COLORS.tealDark).text('ECOFLOW', x + 10, y + height * 0.32, { width: width - 20, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(10).fillColor(dark ? COLORS.white : COLORS.text).text(config.normalizedName, x + 10, y + height * 0.52, { width: width - 20, align: 'center' });
}

function drawDynamicCover(doc, customer, config, displayName, productImage) {
  doc.rect(0, 0, A4.width, A4.height).fill(COLORS.dark);
  doc.rect(0, 0, A4.width, 7).fill(COLORS.teal);
  doc.font('Helvetica').fontSize(26).fillColor(COLORS.teal).text('COTIZACIÓN', 38, 56, { characterSpacing: 1.2 });
  doc.font('Helvetica-Bold').fontSize(61).fillColor(COLORS.white).text('ECOFLOW', 36, 102, { characterSpacing: 2 });
  doc.font('Helvetica').fontSize(14).fillColor('#D6E4E5').text('ENERGÍA CONFIABLE PARA PUERTO RICO', 40, 183);

  doc.fillColor('#17262B').circle(420, 420, 165).fill();
  doc.fillColor('#1B3035').circle(430, 420, 115).fill();
  if (productImage) fitImage(doc, productImage, 275, 255, 275, 320);
  else drawProductPlaceholder(doc, config, 320, 335, 190, 165, true);

  doc.font('Helvetica-Bold').fontSize(27).fillColor(COLORS.white).text(displayName, 38, 610, { width: 510 });
  doc.font('Helvetica').fontSize(11).fillColor('#C5D3D5').text(config.description, 40, 661, { width: 500, lineGap: 3 });

  doc.rect(0, 725, A4.width, 117).fill('#000000');
  doc.rect(0, 724, A4.width, 2).fill(COLORS.teal);
  drawCustomerCoverBlock(doc, customer, { x: 38, y: 735, width: 325, lineWidth: 300 });
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.teal).text(BRAND.phone, 415, 775, { width: 130, align: 'right' });
}

function drawCover(doc, customer, config, displayName, productImage) {
  const cover = resolveAsset(config.coverAsset);
  if (!cover) return drawDynamicCover(doc, customer, config, displayName, productImage);

  doc.image(cover, 0, 0, { width: A4.width, height: A4.height });
  // Todas las portadas aprobadas reciben el mismo bloque visual del cliente.
  // Los iconos, el rótulo y la línea son fijos; nombre, teléfono y email son dinámicos.
  drawCustomerCoverBlock(doc, customer, { x: 48, y: 700, width: 232, lineWidth: 226 });
}

function drawItemsTable(doc, items, x, y, width, height) {
  roundedCard(doc, x, y, width, height, COLORS.white, COLORS.line, 14);
  doc.fillColor(COLORS.dark2).roundedRect(x, y, width, 38, 14).fill();
  doc.fillColor(COLORS.dark2).rect(x, y + 18, width, 20).fill();

  const qtyX = x + width - 190;
  const priceX = x + width - 115;
  label(doc, 'Descripción', x + 18, y + 14, COLORS.white, 7.2, 260);
  label(doc, 'Cant.', qtyX, y + 14, COLORS.white, 7.2, 52);
  label(doc, 'Total', priceX, y + 14, COLORS.white, 7.2, 95);

  const contentTop = y + 45;
  const contentHeight = height - 54;
  const rowHeight = Math.max(25, Math.min(38, contentHeight / Math.max(items.length, 1)));

  items.forEach((item, index) => {
    const rowY = contentTop + index * rowHeight;
    if (index > 0) doc.strokeColor(COLORS.line).lineWidth(0.5).moveTo(x + 16, rowY - 4).lineTo(x + width - 16, rowY - 4).stroke();
    doc.font('Helvetica-Bold').fontSize(items.length > 9 ? 7.3 : 8.4).fillColor(COLORS.text).text(item.name, x + 18, rowY + 2, { width: width - 225, height: rowHeight - 5, ellipsis: true });
    if (item.note && rowHeight >= 34) {
      doc.font('Helvetica').fontSize(6.3).fillColor(COLORS.muted).text(item.note, x + 18, rowY + 17, { width: width - 225, ellipsis: true });
    }
    doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.muted).text(String(item.quantity), qtyX, rowY + 5, { width: 48, align: 'center' });
    doc.font('Helvetica-Bold').fontSize(8.3).fillColor(item.included ? COLORS.green : COLORS.text).text(
      item.included ? 'GRATIS' : `$${formatMoney(item.lineTotal)}`,
      priceX,
      rowY + 5,
      { width: 95, align: 'right' }
    );
  });
}

function drawQuotePage(doc, customer, quote, config, displayName, items, totals, pricingMode) {
  drawHeader(doc, quote.quoteId, 2);
  doc.rect(0, 101.3, A4.width, A4.height - 101.3).fill(COLORS.bg);
  const left = 51;
  const right = 544;
  const width = right - left;

  label(doc, 'Propuesta de respaldo energético', left, 132, COLORS.tealDark, 7.5, 300);
  doc.font('Helvetica-Bold').fontSize(21).fillColor(COLORS.text).text(displayName, left, 151, { width: 370, height: 52, ellipsis: true });
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.muted).text(`Preparada especialmente para ${customer.nombre}`, left, 201, { width: 330, ellipsis: true });

  doc.fillColor(COLORS.tealPale).strokeColor(COLORS.teal).roundedRect(410, 139, 134, 28, 14).fillAndStroke();
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLORS.tealDark).text(pricingMode === 'regular' ? 'PRECIO REGULAR' : 'PRECIO CASH / OFERTA', 410, 149, { width: 134, align: 'center' });

  roundedCard(doc, left, 226, width, 100, COLORS.white, '#CFE1E0', 15);
  doc.fillColor(COLORS.teal).roundedRect(left, 226, 14, 100, 7).fill();
  label(doc, 'Inversión total', left + 32, 248, COLORS.tealDark, 7.5, 150);
  doc.font('Helvetica-Bold').fontSize(31).fillColor(COLORS.tealDark).text(`$${formatMoney(totals.total)}`, left + 31, 268, { width: 210 });
  doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted).text('USD · Sujeto a disponibilidad y evaluación técnica', left + 32, 304, { width: 270 });

  const summaryX = 350;
  doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted).text('Subtotal', summaryX, 248, { width: 90 });
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.text).text(`$${formatMoney(totals.subtotal)}`, right - 115, 248, { width: 95, align: 'right' });
  doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted).text('Descuento', summaryX, 272, { width: 90 });
  doc.font('Helvetica-Bold').fontSize(9).fillColor(totals.discount > 0 ? COLORS.green : COLORS.muted).text(`-$${formatMoney(totals.discount)}`, right - 115, 272, { width: 95, align: 'right' });
  doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted).text('Cotización', summaryX, 296, { width: 90 });
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.text).text(quote.quoteId, right - 115, 296, { width: 95, align: 'right' });

  drawItemsTable(doc, items, left, 349, width, 360);

  roundedCard(doc, left, 725, width, 58, COLORS.tealPale, '#B8DEDD', 12);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.tealDark).text('CLIENTE', left + 18, 739);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.text).text(customer.nombre, left + 18, 756, { width: 205, ellipsis: true });
  doc.font('Helvetica').fontSize(7.5).fillColor(COLORS.muted).text(`${formatPhone(customer.telefono)} · ${customer.email}`, left + 18, 770, { width: 300, ellipsis: true });
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.tealDark).text(`LLAMA AL ${BRAND.phone}`, right - 190, 753, { width: 170, align: 'right' });
  drawFooter(doc);
}

function drawSpecsPage(doc, quote, config, displayName, productImage, notes, offer) {
  drawHeader(doc, quote.quoteId, 3);
  doc.rect(0, 101.3, A4.width, A4.height - 101.3).fill(COLORS.bg);
  const left = 51;
  const right = 544;
  const width = right - left;

  label(doc, 'Producto principal', left, 128, COLORS.tealDark, 7.5, 240);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(COLORS.text);
  const displayTitleHeight = Math.min(58, doc.heightOfString(displayName, { width: 470, lineGap: 1 }));
  doc.text(displayName, left, 149, { width: 470, height: displayTitleHeight, ellipsis: true, lineGap: 1 });

  const heroY = Math.max(215, Math.min(222, 149 + displayTitleHeight + 15));
  const heroHeight = 190;
  const heroPadding = 28;
  const heroTextWidth = 265;
  roundedCard(doc, left, heroY, width, heroHeight, COLORS.dark2, COLORS.dark2, 15);
  label(doc, 'Energía inteligente para tu hogar', left + heroPadding, heroY + 24, COLORS.teal, 8, heroTextWidth);

  const heroTitle = String(config.normalizedName || displayName || 'EcoFlow');
  const heroTitleY = heroY + 52;
  let heroTitleSize = 19;
  let heroTitleHeight = 0;
  do {
    doc.font('Helvetica-Bold').fontSize(heroTitleSize);
    heroTitleHeight = doc.heightOfString(heroTitle, { width: heroTextWidth, lineGap: 1 });
    if (heroTitleHeight <= 54 || heroTitleSize <= 16) break;
    heroTitleSize -= 1;
  } while (heroTitleSize >= 16);

  doc.fillColor(COLORS.white).text(heroTitle, left + heroPadding, heroTitleY, {
    width: heroTextWidth,
    height: Math.min(58, heroTitleHeight + 2),
    ellipsis: true,
    lineGap: 1,
  });

  const descriptionY = heroTitleY + Math.min(58, heroTitleHeight) + 10;
  const descriptionBottom = heroY + heroHeight - 20;
  const descriptionHeight = Math.max(28, descriptionBottom - descriptionY);
  doc.font('Helvetica').fontSize(9).fillColor('#C6D4D6').text(String(config.description || ''), left + heroPadding, descriptionY, {
    width: heroTextWidth,
    height: descriptionHeight,
    ellipsis: true,
    lineGap: 2,
  });

  const productCenterY = heroY + heroHeight / 2;
  doc.fillColor('#17262B').circle(right - 82, productCenterY, 72).fill();
  if (productImage) fitImage(doc, productImage, right - 158, heroY + 13, 152, heroHeight - 26);
  else drawProductPlaceholder(doc, config, right - 160, heroY + 40, 138, 98, true);

  const statY = heroY + heroHeight + 18;
  const statHeight = 95;
  const gap = 11;
  const statWidth = (width - gap * 3) / 4;
  const rawSolarValue = String(config.panelChargeFull || 'Según sistema');
  const solarValue = Number(config.panelQuantity || 0) <= 0 || normalizeText(rawSolarValue).includes('recomienda adquirir panel')
    ? 'Paneles no incluidos'
    : rawSolarValue;
  const stats = [
    ['Capacidad', config.batteryCapacity || 'Consultar'],
    ['Salida AC', config.acOutput || 'Consultar'],
    ['Batería', config.batteryChemistry || 'Consultar'],
    ['Carga solar', solarValue],
  ];

  stats.forEach(([title, value], index) => {
    const x = left + index * (statWidth + gap);
    roundedCard(doc, x, statY, statWidth, statHeight);
    label(doc, title, x + 13, statY + 16, COLORS.tealDark, 6.8, statWidth - 26);

    const textValue = String(value);
    let valueSize = index === 3 ? 10 : 11;
    doc.font('Helvetica-Bold').fontSize(valueSize);
    while (doc.heightOfString(textValue, { width: statWidth - 26, lineGap: 1 }) > 38 && valueSize > 8.5) {
      valueSize -= 0.5;
      doc.fontSize(valueSize);
    }
    doc.fillColor(COLORS.text).text(textValue, x + 13, statY + 43, {
      width: statWidth - 26,
      height: 40,
      ellipsis: false,
      lineGap: 1,
    });
  });

  const conditionCandidates = [
    ...(offer?.label ? [offer.label] : []),
    ...String(notes || '').split('\n').map((item) => item.trim()).filter(Boolean),
  ];
  const seenConditions = new Set();
  const conditions = conditionCandidates.filter((condition) => {
    const key = normalizeText(condition);
    if (!key || seenConditions.has(key)) return false;
    seenConditions.add(key);
    return true;
  }).slice(0, 5);

  const conditionsY = statY + statHeight + 23;
  const conditionsBottom = 735;
  const conditionsHeight = conditionsBottom - conditionsY;
  roundedCard(doc, left, conditionsY, width, conditionsHeight);
  label(doc, 'Condiciones y próximos pasos', left + 20, conditionsY + 21, COLORS.tealDark, 7.5, 260);
  const defaultConditions = conditions.length ? conditions : [
    'Precios sujetos a disponibilidad y evaluación técnica.',
    'Los accesorios e instalación se incluyen únicamente cuando aparecen en el detalle.',
    'Coordinaremos entrega, orientación e instalación después de la aceptación.',
  ];

  let y = conditionsY + 52;
  const maxConditionY = conditionsBottom - 14;
  defaultConditions.forEach((condition, index) => {
    doc.font('Helvetica').fontSize(8.2);
    const textHeight = Math.min(31, doc.heightOfString(condition, { width: width - 70, lineGap: 1 }));
    const rowHeight = Math.max(32, textHeight + 12);
    if (y + rowHeight > maxConditionY) return;

    doc.fillColor(COLORS.teal).circle(left + 30, y + 3, 9).fill();
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLORS.white).text(String(index + 1), left + 24, y - 1, { width: 12, align: 'center' });
    doc.font('Helvetica').fontSize(8.2).fillColor(COLORS.text).text(condition, left + 50, y - 2, {
      width: width - 70,
      height: Math.max(30, textHeight + 3),
      ellipsis: true,
      lineGap: 1,
    });
    y += rowHeight;
  });

  doc.fillColor(COLORS.teal).roundedRect(left, 750, width, 38, 12).fill();
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.dark).text('¿Listo para asegurar tu energía?', left + 20, 764, { width: 260 });
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.dark).text(BRAND.phone, right - 170, 764, { width: 150, align: 'right' });
  drawFooter(doc);
}

async function generatePdf({ customer, quote, config, displayName, items, totals, pricingMode, notes, offer }) {
  const productImage = resolveAsset(config.productAsset);
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: false, compress: true });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.info.Title = `Cotización EcoFlow ${displayName} - ${customer.nombre}`;
      doc.info.Author = `${BRAND.consultant} - Power Solar`;
      doc.info.Subject = 'Cotización personalizada EcoFlow creada desde Power Solar CRM';

      doc.addPage({ size: 'A4', margin: 0 });
      drawCover(doc, customer, config, displayName, productImage);
      doc.addPage({ size: 'A4', margin: 0 });
      drawQuotePage(doc, customer, quote, config, displayName, items, totals, pricingMode);
      doc.addPage({ size: 'A4', margin: 0 });
      drawSpecsPage(doc, quote, config, displayName, productImage, notes, offer);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function buildConfirmationUrls(customer, publicBaseUrl, rawToken) {
  const id = encodeURIComponent(customer.leadId || customer.leadRow || '');
  const token = encodeURIComponent(rawToken);
  return {
    yes: `${publicBaseUrl}/cotizacion/confirmar?id=${id}&token=${token}&interest=yes`,
    no: `${publicBaseUrl}/cotizacion/confirmar?id=${id}&token=${token}&interest=no`,
  };
}

function generateEmailHtml({ customer, displayName, items, totals, urls, notes }) {
  const rows = items.map((item) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #d9e3e2;color:#1d2a2e;">${escapeHtml(item.name)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #d9e3e2;text-align:center;color:#607075;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #d9e3e2;text-align:right;font-weight:bold;color:${item.included ? '#27A66A' : '#1d2a2e'};">${item.included ? 'GRATIS' : `$${formatMoney(item.lineTotal)}`}</td>
    </tr>`).join('');

  const notesHtml = String(notes || '').trim()
    ? `<div style="margin-top:18px;padding:16px;background:#f4f7f6;border-radius:10px;color:#607075;line-height:1.6;white-space:pre-line;">${escapeHtml(notes)}</div>`
    : '';

  return `<!doctype html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Cotización EcoFlow</title></head>
<body style="margin:0;background:#eef4f0;font-family:Arial,Helvetica,sans-serif;color:#1d2a2e;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:22px 10px;">
<table width="620" style="width:620px;max-width:100%;background:#fff;border-collapse:separate;">
<tr><td style="padding:24px 30px;background:#0b1013;border-bottom:3px solid #13bfc0;color:#fff;"><b style="font-size:20px;letter-spacing:2px;">JERRY ENCARNACIÓN</b><span style="float:right;color:#8adada;font-size:11px;font-weight:bold;">CONSULTOR ENERGÉTICO</span></td></tr>
<tr><td style="padding:34px 30px;background:#e7f8f7;"><p style="margin:0 0 9px;color:#008f91;font-size:11px;letter-spacing:3px;font-weight:bold;">TU COTIZACIÓN PERSONALIZADA</p><h1 style="margin:0 0 12px;font-size:30px;">¡Hola, ${escapeHtml(customer.nombre)}!</h1><p style="margin:0;color:#607075;font-size:16px;line-height:1.6;">Según la conversación con Jerry, preparamos la propuesta de <b>${escapeHtml(displayName)}</b>. El PDF premium está adjunto.</p></td></tr>
<tr><td style="padding:28px 30px;">
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d9e3e2;border-radius:12px;overflow:hidden;"><tr style="background:#121a1e;color:#fff;"><th align="left" style="padding:12px;">Producto</th><th style="padding:12px;">Cant.</th><th align="right" style="padding:12px;">Total</th></tr>${rows}</table>
<div style="margin-top:18px;padding:18px 20px;background:#e7f8f7;border-radius:12px;"><span style="color:#607075;font-size:12px;">INVERSIÓN TOTAL</span><div style="font-size:30px;font-weight:900;color:#008f91;">$${formatMoney(totals.total)} USD</div>${totals.discount > 0 ? `<div style="color:#27A66A;font-weight:bold;">Descuento aplicado: $${formatMoney(totals.discount)}</div>` : ''}</div>
${notesHtml}
<p style="margin:26px 0 14px;text-align:center;font-size:17px;font-weight:bold;">¿Cómo deseas proceder?</p>
<table width="100%"><tr><td width="50%" style="padding-right:6px;"><a href="${urls.yes}" style="display:block;background:#13bfc0;color:#0b1013;text-decoration:none;font-weight:bold;padding:16px;border-radius:9px;text-align:center;">SÍ, ME INTERESA</a></td><td width="50%" style="padding-left:6px;"><a href="${urls.no}" style="display:block;background:#d95555;color:#fff;text-decoration:none;font-weight:bold;padding:16px;border-radius:9px;text-align:center;">NO ME INTERESA</a></td></tr></table>
</td></tr>
<tr><td style="padding:24px 30px;background:#0b1013;color:#fff;text-align:center;line-height:1.7;"><b>${BRAND.consultant}</b><br>${BRAND.phone}<br><a href="${BRAND.websiteUrl}" style="color:#13bfc0;text-decoration:none;">${BRAND.website}</a></td></tr>
</table></td></tr></table></body></html>`;
}

function generateEmailText({ customer, displayName, items, totals, urls, notes }) {
  const detail = items.map((item) => `- ${item.quantity} x ${item.name}: ${item.included ? 'GRATIS' : `$${formatMoney(item.lineTotal)}`}`).join('\n');
  return `Hola ${customer.nombre},\n\nSegún la conversación con Jerry, preparamos tu cotización de ${displayName}.\n\n${detail}\n\nSubtotal: $${formatMoney(totals.subtotal)}\nDescuento: $${formatMoney(totals.discount)}\nTOTAL: $${formatMoney(totals.total)} USD\n\n${notes || ''}\n\nSÍ, ME INTERESA:\n${urls.yes}\n\nNO ME INTERESA:\n${urls.no}\n\n${BRAND.consultant}\n${BRAND.phone}\n${BRAND.website}`;
}

async function postToGas(gasUrl, payload) {
  const response = await fetch(gasUrl, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30_000),
  });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { response, data };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido' });
  if (!authorized(req)) return json(res, 401, { error: 'No autorizado' });

  try {
    const body = req.body || {};
    const customerInput = body.customer || {};
    const customer = {
      leadId: String(customerInput.leadId || '').trim(),
      leadRow: String(customerInput.leadRow || '').trim(),
      nombre: String(customerInput.nombre || '').trim().slice(0, 120),
      email: String(customerInput.email || '').trim().slice(0, 180),
      telefono: String(customerInput.telefono || '').replace(/\D/g, '').slice(0, 15),
      pueblo: String(customerInput.pueblo || '').trim().slice(0, 100),
    };

    if (!customer.nombre) return json(res, 400, { error: 'Falta el nombre del cliente' });
    if (!isValidEmail(customer.email)) return json(res, 400, { error: 'Email del cliente inválido' });
    if (customer.telefono.length < 7) return json(res, 400, { error: 'Teléfono del cliente inválido' });
    if (!customer.leadId && !customer.leadRow) return json(res, 400, { error: 'La cotización debe estar vinculada a un lead del CRM' });

    const items = sanitizeQuoteItems(body.items);
    if (!items.length) return json(res, 400, { error: 'La cotización no contiene productos' });
    if (!items.some((item) => item.lineTotal > 0)) return json(res, 400, { error: 'La cotización necesita al menos un producto con precio' });

    const totals = calculateQuoteTotals(items, body.discount);
    if (totals.total <= 0) return json(res, 400, { error: 'El total de la cotización debe ser mayor que cero' });

    const productConfig = resolveQuoteProduct(body.mainProduct || body.bundleName);
    if (!productConfig) return json(res, 400, { error: 'Producto principal EcoFlow no reconocido' });

    const displayName = String(body.bundleName || productConfig.normalizedName).trim().slice(0, 130);
    const pricingMode = body.pricingMode === 'regular' ? 'regular' : 'cash';
    const notes = String(body.notes || '').trim().slice(0, 2200);
    const offer = body.offer && typeof body.offer === 'object' ? {
      startsOn: String(body.offer.startsOn || '').slice(0, 20),
      endsOn: String(body.offer.endsOn || '').slice(0, 20),
      label: String(body.offer.label || '').slice(0, 180),
    } : null;

    const quoteId = `Q${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenExpiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const publicBaseUrl = String(process.env.PUBLIC_BASE_URL || BRAND.websiteUrl).trim().replace(/\/+$/, '');
    const urls = buildConfirmationUrls(customer, publicBaseUrl, rawToken);

    const pdfBuffer = await generatePdf({
      customer,
      quote: { quoteId },
      config: { ...productConfig, price: totals.total },
      displayName,
      items,
      totals,
      pricingMode,
      notes,
      offer,
    });

    const isTestMode = String(process.env.TEST_MODE) === 'true';
    const testRecipient = String(process.env.TEST_EMAIL_RECIPIENT || 'jerrypowersolar@gmail.com').trim();
    const recipientEmail = isTestMode ? testRecipient : customer.email;
    const subject = `${isTestMode ? '[PRUEBA] ' : ''}Cotización de Jerry Encarnación — ${displayName}`;
    const gasUrl = String(process.env.GAS_URL || 'https://script.google.com/macros/s/AKfycbxi2ATuJrRfzBysZqxl8NzGhEIsVf8grL1Ti5EcWRSi6NeGZc-gRVz2BqlVpDIeQ-4C/exec').trim();
    const gasToken = String(process.env.GAS_TOKEN || '').trim();
    if (!gasToken) return json(res, 503, { error: 'Falta GAS_TOKEN en EcoFlow-PR' });

    const emailArgs = { customer, displayName, items, totals, urls, notes };
    const quotePayload = {
      token: gasToken,
      action: 'sendQuoteEmail',
      quoteId,
      leadId: customer.leadId || customer.leadRow,
      leadNombre: customer.nombre,
      recipientEmail,
      pdfBase64: pdfBuffer.toString('base64'),
      pdfFilename: `Cotizacion-${displayName.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}-${quoteId}.pdf`,
      emailHtml: generateEmailHtml(emailArgs),
      emailText: generateEmailText(emailArgs),
      subject,
      testMode: isTestMode,
      tokenHash,
      tokenExpiration,
      productoOriginal: body.mainProduct || displayName,
      productoNormalizado: productConfig.normalizedName,
      nombreBundle: displayName,
      componentesBundle: items.map((item) => `${item.quantity} x ${item.name}`).join(' | '),
      precio: totals.total,
      subtotal: totals.subtotal,
      descuento: totals.discount,
      pricingMode,
      quoteItems: items,
      requestedBy: String(body.requestedBy || 'CRM').slice(0, 180),
      sourceMode: 'crm-manual-quote',
    };

    const { response, data } = await postToGas(gasUrl, quotePayload);
    if (!response.ok || data?.error) {
      console.error('[CRM_QUOTE] GAS error:', data);
      return json(res, 502, {
        error: 'El PDF se generó, pero falló el envío por email',
        message: data?.message || data?.error || 'Error de Google Apps Script',
      });
    }

    return json(res, 200, {
      ok: true,
      quoteId,
      leadId: customer.leadId || customer.leadRow,
      recipientEmail,
      total: totals.total,
      testMode: isTestMode,
    });
  } catch (error) {
    console.error('[CRM_QUOTE_FATAL]', error);
    return json(res, 500, {
      error: 'No se pudo generar la cotización',
      message: String(error?.message || error),
    });
  }
}
