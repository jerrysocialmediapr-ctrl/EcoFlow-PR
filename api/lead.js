import process from 'node:process';

const BRAND = Object.freeze({
  website: 'jerry.ecoflow-pr.com',
  websiteUrl: 'https://jerry.ecoflow-pr.com',
});

export const PRODUCTS_TABLE = Object.freeze({
  'Batería para apartamento (Delta 2 Max)': {
    normalizedName: 'DELTA 2 Max',
    shortName: 'DELTA 2 Max',
    aliases: [
      'Delta 2 Max',
      'DELTA 2 Max',
      'Delta 2 Max 2048',
      'Batería para apartamento',
      'Batería EcoFlow para apartamento',
      'Batería EcoFlow Delta 2 Max',
    ],
    bundleName: 'DELTA 2 Max + Paneles Solares',
    components: 'DELTA 2 Max (2048Wh) y 2 paneles rígidos de 100W',
    price: 2498,
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
    ],
  },
  'Delta Pro 3600': {
    normalizedName: 'DELTA Pro',
    shortName: 'DELTA Pro',
    aliases: [
      'Delta Pro',
      'DELTA Pro',
      'Delta Pro 3600',
      'DELTA Pro 3600',
    ],
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
    ],
  },
  'Batería para casa (Delta Pro 3)': {
    normalizedName: 'DELTA Pro 3',
    shortName: 'DELTA Pro 3',
    aliases: [
      'Delta Pro 3',
      'DELTA Pro 3',
      'Delta Pro 3 4096',
      'Batería para casa',
      'Batería EcoFlow para casa',
      'Batería EcoFlow Delta Pro 3',
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
    ],
  },
  'Delta Pro Ultra + Smart Home Panel 2': {
    normalizedName: 'DELTA Pro Ultra + Smart Home Panel 2',
    shortName: 'DELTA Pro Ultra + SHP2',
    aliases: [
      'Delta Pro Ultra + Smart Home Panel 2',
      'Delta Pro Ultra + SHP2',
      'DELTA Pro Ultra + Smart Home Panel 2',
      'DELTA Pro Ultra + SHP2',
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
      'Permite transferencia automática y control inteligente de cargas.',
      'Adecuado para electrodomésticos de alto consumo.',
      'Requiere instalación y evaluación técnica profesional por perito electricista.',
      'Puede ampliarse con baterías adicionales.',
    ],
  },
  'Sistema completo para hogar (Delta Pro Ultra)': {
    normalizedName: 'DELTA Pro Ultra',
    shortName: 'DELTA Pro Ultra',
    aliases: [
      'Delta Pro Ultra',
      'DELTA Pro Ultra',
      'Delta Pro Ultra 6kW',
      'Delta Pro Ultra portátil 6kW',
      'Sistema completo para hogar',
      'Batería EcoFlow Delta Pro Ultra',
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
    coverAsset: 'delta-pro-ultra-cover-jerry.png',
    productAsset: 'delta-pro-ultra-product.png',
    recommendations: [
      'Compatible con Smart Home Panel 2 para control inteligente.',
      'Adecuado para electrodomésticos de alto consumo.',
      'Requiere instalación y evaluación técnica profesional.',
      'Puede ampliarse con baterías adicionales.',
    ],
  },
});

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

  const catalog = Object.entries(PRODUCTS_TABLE).map(([key, config]) => ({
    key,
    config,
    candidates: [key, config.normalizedName, ...(config.aliases || [])]
      .map(normalizeText)
      .filter(Boolean),
  }));

  for (const entry of catalog) {
    if (entry.candidates.some((candidate) => input === candidate)) {
      return { key: entry.key, ...entry.config };
    }
  }

  const partialMatches = [];
  for (const entry of catalog) {
    for (const candidate of entry.candidates) {
      if (candidate.length >= 8 && input.includes(candidate)) {
        partialMatches.push({ ...entry, specificity: candidate.length });
      }
    }
  }

  partialMatches.sort((a, b) => b.specificity - a.specificity);
  const best = partialMatches[0];
  return best ? { key: best.key, ...best.config } : null;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

async function postToGas(gasUrl, payload) {
  const response = await fetch(gasUrl, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(25_000),
  });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { response, data };
}

function buildLeadPayload(body, values, gasToken, baseUrl) {
  return {
    token: gasToken,
    action: 'addLead',
    nombre: values.nombre,
    email: values.email,
    telefono: values.telefono,
    pueblo: values.pueblo,
    factura: body.factura || body.monthlyBill || '',
    origen: body.origen || body.leadSource || 'EcoFlow PR Website',
    producto: body.producto || body.productoOriginal || body.product || body.productName || body.modelo || body.model || '',
    anotaciones: body.anotaciones || body.notes || body.message || '',
    gclid: body.gclid || '',
    fbclid: body.fbclid || '',
    campaign: body.campaign || '',
    sendClientEmail: true,
    confirmationUrl: `${baseUrl}/cotizacion/confirmar`,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const body = req.body || {};
  const nombre = String(body.nombre || body.name || '').trim();
  const email = String(body.email || '').trim();
  const telefono = String(body.telefono || body.phone || '').replace(/\D/g, '');
  const pueblo = String(body.pueblo || body.city || '').trim();
  const productValue = body.producto || body.productoOriginal || body.product || body.productName || body.modelo || body.model || '';

  if (!nombre) return res.status(400).json({ error: 'Falta el nombre' });
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Falta un email válido' });
  if (telefono.length < 7) return res.status(400).json({ error: 'Teléfono inválido' });

  const gasUrl = String(process.env.GAS_URL || 'https://script.google.com/macros/s/AKfycbxi2ATuJrRfzBysZqxl8NzGhEIsVf8grL1Ti5EcWRSi6NeGZc-gRVz2BqlVpDIeQ-4C/exec').trim();
  const gasToken = String(process.env.GAS_TOKEN || '').trim();
  if (!gasToken) return res.status(503).json({ error: 'Falta GAS_TOKEN' });

  const baseUrl = String(process.env.PUBLIC_BASE_URL || BRAND.websiteUrl).trim().replace(/\/+$/, '');
  const eligible = Boolean(getAuthorizedProduct(productValue));
  const leadPayload = buildLeadPayload(body, { nombre, email, telefono, pueblo }, gasToken, baseUrl);

  try {
    const { response, data } = await postToGas(gasUrl, leadPayload);
    if (!response.ok || data?.error || data?.status === 'error') {
      return res.status(502).json({ error: data?.message || data?.error || 'No se pudo registrar la solicitud' });
    }

    const leadId = data.id;
    return res.status(200).json({
      ok: true,
      leadId,
      quoteStatus: eligible ? 'pendiente_asesoria' : 'no_aplica',
      message: eligible
        ? 'Solicitud confirmada. La cotización se preparará manualmente desde el CRM.'
        : 'Solicitud confirmada.',
    });
  } catch (error) {
    console.error('Lead handler error:', error);
    return res.status(500).json({ error: 'Error procesando la solicitud' });
  }
}
