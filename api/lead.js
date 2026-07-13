import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

// ==========================================
// PRODUCTS TABLE WITH COMPLETE SPECS
// ==========================================
export const PRODUCTS_TABLE = {
  "Batería para apartamento (Delta 2 Max)": {
    normalizedName: "DELTA 2 Max",
    bundleName: "Delta 2 Max + Paneles Solares",
    components: "Delta 2 Max (2048Wh), 2x Panel Rígido 100W",
    price: 2998,
    eligible: true,
    // Battery specs
    batteryCapacity: "2048Wh (2 kWh)",
    batteryDimensions: "15.2\" × 8.1\" × 8.8\" (38.6cm × 20.6cm × 22.4cm)",
    batteryDimensionsFeet: "1.27 ft³",
    batteryWeight: "23 kg (50.7 lbs)",
    batteryChargeCycles: "6000+ ciclos",
    // Usage hours with basic appliances
    usageHours: {
      fan50w: 40,        // ~40 horas con abanico (50W)
      fridge150w: 13,    // ~13 horas con nevera (150W)
      tv80w: 25,         // ~25 horas con TV (80W)
      combined: 5        // ~5 horas con los tres (50+150+80=280W)
    },
    // Panel specs
    panelQuantity: 2,
    panelWattage: "100W each",
    panelDimensions: "47.2\" × 21.3\" × 1.4\" (119.9cm × 54.1cm × 3.5cm)",
    panelDimensionsFeet: "5.4 ft² per panel",
    panelTotalFeet: "10.8 ft² (both panels)",
    panelWeight: "4.6 kg each (10.1 lbs)",
    panelChargeFull: "18-24 hours (full sun)",
    // Recommendations
    recommendations: [
      "Usar abanico y TV de forma alternada para extender duración",
      "Mantener la nevera en modo ECO para reducir consumo",
      "Cargar completamente antes de usar por primera vez",
      "Usar paneles solares en ubicación con máxima luz solar (6+ horas)",
      "Evitar descargas completas frecuentes para alargar vida útil"
    ]
  },
  "Batería para casa (Delta Pro 3)": {
    normalizedName: "DELTA Pro 3",
    bundleName: "Delta Pro 3 + Paneles Solares",
    components: "Delta Pro 3 (4096Wh), 4x Panel Rígido 100W",
    price: 5998,
    eligible: true,
    // Battery specs
    batteryCapacity: "4096Wh (4 kWh)",
    batteryDimensions: "14.4\" × 10\" × 10.6\" (36.6cm × 25.4cm × 26.9cm)",
    batteryDimensionsFeet: "2.54 ft³",
    batteryWeight: "44 kg (97 lbs)",
    batteryChargeCycles: "6000+ ciclos",
    // Usage hours with basic appliances
    usageHours: {
      fan50w: 81,        // ~81 horas con abanico (50W)
      fridge150w: 27,    // ~27 horas con nevera (150W)
      tv80w: 51,         // ~51 horas con TV (80W)
      combined: 10       // ~10 horas con los tres (50+150+80=280W)
    },
    // Panel specs
    panelQuantity: 4,
    panelWattage: "100W each",
    panelDimensions: "47.2\" × 21.3\" × 1.4\" (119.9cm × 54.1cm × 3.5cm)",
    panelDimensionsFeet: "5.4 ft² per panel",
    panelTotalFeet: "21.6 ft² (all 4 panels)",
    panelWeight: "4.6 kg each (10.1 lbs)",
    panelChargeFull: "10-14 hours (full sun)",
    // Recommendations
    recommendations: [
      "Sistema recomendado para casas con 3-4 enseres activos",
      "Instalación de Transfer Switch para cambio automático a batería",
      "Usar paneles en techo o área abierta para máximo rendimiento",
      "Combinar refrigerador y aire acondicionado en horarios diferentes",
      "Mantenimiento anual de los paneles solares"
    ]
  },
  "Sistema completo para hogar (Delta Pro Ultra)": {
    normalizedName: "DELTA Pro Ultra",
    bundleName: "Delta Pro Ultra",
    components: "Delta Pro Ultra (6000Wh)",
    price: 10998,
    eligible: true,
    // Battery specs
    batteryCapacity: "6000Wh (6 kWh)",
    batteryDimensions: "14.8\" × 10.2\" × 10.8\" (37.5cm × 25.9cm × 27.4cm)",
    batteryDimensionsFeet: "2.98 ft³",
    batteryWeight: "62 kg (136.7 lbs)",
    batteryChargeCycles: "6000+ ciclos",
    // Usage hours with basic appliances
    usageHours: {
      fan50w: 120,       // ~120 horas con abanico (50W)
      fridge150w: 40,    // ~40 horas con nevera (150W)
      tv80w: 75,         // ~75 horas con TV (80W)
      combined: 15       // ~15 horas con los tres (50+150+80=280W)
    },
    // Panel specs (ultra comes without standard panels, but recommend extra panels)
    panelQuantity: 0,
    panelWattage: "N/A - Sistema de batería pura",
    panelDimensions: "N/A",
    panelDimensionsFeet: "N/A",
    panelWeight: "N/A",
    panelChargeFull: "Se recomienda adquirir paneles por separado",
    // Recommendations
    recommendations: [
      "Sistema premium para toda la casa con alta confiabilidad",
      "Compatible con Smart Home Panel 2 para control inteligente",
      "Capacidad suficiente para electrodomésticos de alto consumo",
      "Se recomienda instalación profesional en hogar",
      "Ideal para áreas con cortes de energía frecuentes",
      "Expandible con baterías adicionales para mayor capacidad"
    ]
  }
};

// ==========================================
// HTML ESCAPING
// ==========================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ==========================================
// PRODUCT NORMALIZER (IMPROVED)
// ==========================================
function getAuthorizedProduct(productStr) {
  if (!productStr) {
    console.log('[PRODUCT_CHECK] productStr is empty or null');
    return null;
  }

  const normalizedInput = productStr
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

  console.log('[PRODUCT_CHECK] Normalizado entrada:', normalizedInput);

  // Search through PRODUCTS_TABLE
  for (const [key, config] of Object.entries(PRODUCTS_TABLE)) {
    const normalizedKey = key
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

    console.log('[PRODUCT_CHECK] Comparando contra:', normalizedKey);

    if (normalizedInput === normalizedKey) {
      console.log('[PRODUCT_CHECK] ✅ COINCIDENCIA EXACTA:', key);
      return { key, ...config };
    }
  }

  // If no exact match, try partial matching (as fallback)
  console.log('[PRODUCT_CHECK] ⚠️ NO SE ENCONTRÓ COINCIDENCIA EXACTA');
  console.log('[PRODUCT_CHECK] Productos disponibles:', Object.keys(PRODUCTS_TABLE));

  return null;
}

// ==========================================
// PDF GENERATION (ENHANCED)
// ==========================================
function generateQuotePdf(lead, quote, config) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Load EcoFlow logo if exists
      const logoPath = path.join(process.cwd(), 'ecoflow-logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 35, { width: 120 });
      }

      // Header info (Right side)
      doc
        .fillColor('#1c2b22')
        .fontSize(22)
        .text('COTIZACIÓN ECOFLOW', 300, 40, { align: 'right' });

      doc
        .fontSize(10)
        .fillColor('#6b8a7a')
        .text(`Cotización #: ${quote.quoteId}`, 300, 65, { align: 'right' })
        .text(`Fecha: ${new Date().toLocaleDateString('es-PR')}`, 300, 78, { align: 'right' });

      doc.moveDown(3);

      // Green divider line
      doc
        .strokeColor('#40c472')
        .lineWidth(2)
        .moveTo(40, 110)
        .lineTo(555, 110)
        .stroke();

      doc.moveDown(1.5);

      // Client section
      doc
        .fillColor('#1c2b22')
        .fontSize(12)
        .text('DATOS DEL CLIENTE', 40, 125, { underline: true });

      doc
        .fontSize(10)
        .fillColor('#2d3748')
        .text(`Nombre: ${lead.nombre}`, 40, 145)
        .text(`Teléfono: ${lead.telefono}`, 40, 160)
        .text(`Email: ${lead.email}`, 40, 175)
        .text(`Pueblo: ${lead.pueblo || 'N/A'}`, 40, 190);

      // Vendor section
      doc
        .fillColor('#1c2b22')
        .fontSize(12)
        .text('DATOS DEL VENDEDOR', 300, 125, { underline: true });

      doc
        .fontSize(10)
        .fillColor('#2d3748')
        .text('Nombre: Jerry Encarnación', 300, 145)
        .text('Teléfono: 787-628-1344', 300, 160)
        .text('Email: info@powersolarprr.com', 300, 175);

      doc.moveDown(2);

      // Table Header
      doc
        .strokeColor('#e2e8f0')
        .lineWidth(1)
        .moveTo(40, 220)
        .lineTo(555, 220)
        .stroke();

      doc
        .fillColor('#1c2b22')
        .fontSize(10)
        .text('DESCRIPCIÓN DE SOLUCIÓN', 45, 228)
        .text('TOTAL', 480, 228, { align: 'right' });

      doc
        .strokeColor('#e2e8f0')
        .lineWidth(1)
        .moveTo(40, 245)
        .lineTo(555, 245)
        .stroke();

      // Table Content
      doc
        .fontSize(11)
        .fillColor('#1c2b22')
        .text(config.normalizedName, 45, 260, { bold: true });

      doc
        .fontSize(10)
        .fillColor('#4a5568')
        .text(`Bundle: ${config.bundleName}`, 45, 275)
        .text(`Componentes: ${config.components}`, 45, 290, { width: 350 });

      doc
        .fontSize(14)
        .fillColor('#1c2b22')
        .text(`$${config.price.toLocaleString()}`, 480, 260, { align: 'right', bold: true });

      doc
        .strokeColor('#e2e8f0')
        .lineWidth(1)
        .moveTo(40, 330)
        .lineTo(555, 330)
        .stroke();

      doc.moveDown(3);

      // NEW: Battery Specifications Section
      doc
        .fillColor('#1c2b22')
        .fontSize(12)
        .text('ESPECIFICACIONES DE LA BATERÍA', 40, 360, { underline: true });

      doc
        .fontSize(10)
        .fillColor('#2d3748')
        .text(`Capacidad: ${config.batteryCapacity}`, 40, 380)
        .text(`Dimensiones: ${config.batteryDimensions}`, 40, 395)
        .text(`Volumen: ${config.batteryDimensionsFeet}`, 40, 410)
        .text(`Peso: ${config.batteryWeight}`, 40, 425)
        .text(`Ciclos de Carga: ${config.batteryChargeCycles}`, 40, 440);

      // Usage hours section
      doc
        .fillColor('#1c2b22')
        .fontSize(11)
        .text('HORAS DE USO CON ENSERES BÁSICOS:', 40, 460, { bold: true });

      doc
        .fontSize(9)
        .fillColor('#4a5568')
        .text(`• Abanico (50W): ~${config.usageHours.fan50w} horas`, 50, 475)
        .text(`• Nevera (150W): ~${config.usageHours.fridge150w} horas`, 50, 488)
        .text(`• TV (80W): ~${config.usageHours.tv80w} horas`, 50, 501)
        .text(`• Los tres juntos (280W): ~${config.usageHours.combined} horas`, 50, 514);

      // Panel specifications (if applicable)
      if (config.panelQuantity > 0) {
        doc
          .fillColor('#1c2b22')
          .fontSize(12)
          .text('ESPECIFICACIONES DE PANELES SOLARES', 40, 535, { underline: true });

        doc
          .fontSize(10)
          .fillColor('#2d3748')
          .text(`Cantidad de Paneles: ${config.panelQuantity}x ${config.panelWattage}`, 40, 555)
          .text(`Dimensiones por Panel: ${config.panelDimensions}`, 40, 570)
          .text(`Área por Panel: ${config.panelDimensionsFeet}`, 40, 585)
          .text(`Área Total: ${config.panelTotalFeet}`, 40, 600)
          .text(`Peso por Panel: ${config.panelWeight}`, 40, 615)
          .text(`Carga Completa (sol pleno): ${config.panelChargeFull}`, 40, 630);
      }

      // NEW PAGE for recommendations and satisfaction question
      if (doc.y > 700) {
        doc.addPage();
      }

      doc.moveDown(2);

      // Recommendations section
      doc
        .fillColor('#1c2b22')
        .fontSize(12)
        .text('RECOMENDACIONES PARA MAYOR DURACIÓN DE CARGA', 40, 80, { underline: true });

      doc
        .fontSize(9)
        .fillColor('#2d3748');

      config.recommendations.forEach((rec, idx) => {
        const yPos = 100 + idx * 15;
        doc.text(`${idx + 1}. ${rec}`, 50, yPos, { width: 500 });
      });

      // Customer satisfaction question
      const questionY = 100 + config.recommendations.length * 15 + 30;

      doc
        .fillColor('#1c2b22')
        .fontSize(12)
        .text('¿SE AJUSTA ESTA SOLUCIÓN A SUS NECESIDADES?', 40, questionY, { underline: true });

      doc
        .fontSize(10)
        .fillColor('#4a5568')
        .text(
          'Esta cotización ha sido personalizada según tu perfil de consumo y ubicación en Puerto Rico.',
          40,
          questionY + 20,
          { width: 500 }
        )
        .text(
          'Si tienes dudas o deseas ajustes en la configuración, contacta directamente a tu consultor.',
          40,
          questionY + 50,
          { width: 500 }
        );

      // Notes / Terms
      doc
        .fillColor('#718096')
        .fontSize(9)
        .text('Nota Importante:', 40, questionY + 80, { bold: true })
        .text(
          'Esta cotización está sujeta a validación final de condiciones técnicas en el hogar del cliente, disponibilidad del equipo e instalación por parte de técnicos autorizados.',
          40,
          questionY + 95,
          { width: 500 }
        );

      // Footer message
      doc
        .fillColor('#a0aec0')
        .fontSize(8)
        .text('EcoFlow Puerto Rico - Distribuidor Autorizado Power Solar LLC', 40, 750, { align: 'center' });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

// ==========================================
// EMAIL HTML GENERATION (ENHANCED)
// ==========================================
function generateEmailHtml(lead, quote, config, publicBaseUrl, rawToken) {
  const confirmYesUrl = `${publicBaseUrl}/cotizacion/confirmar?id=${lead.id}&token=${rawToken}&interest=yes`;
  const confirmNoUrl = `${publicBaseUrl}/cotizacion/confirmar?id=${lead.id}&token=${rawToken}&interest=no`;

  const escapedName = escapeHtml(lead.nombre);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Cotización EcoFlow</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f9f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f9f6">
    <tr>
      <td align="center" style="padding:20px 10px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          <!-- HEADER -->
          <tr>
            <td bgcolor="#ffffff" style="padding:24px 30px;border-bottom:2px solid #e8f5ee;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size:20px;font-weight:900;letter-spacing:2px;color:#1c2b22;">ECOFLOW</span>
                    &nbsp;<span style="background-color:#1c2b22;color:#40c472;font-size:9px;font-weight:800;letter-spacing:1px;padding:3px 8px;border-radius:4px;">PUERTO RICO</span>
                  </td>
                  <td align="right">
                    <span style="font-size:12px;color:#6b8a7a;font-weight:bold;">COTIZACIÓN OFICIAL</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HERO / INTRO -->
          <tr>
            <td bgcolor="#1c2b22" style="padding:35px 30px;color:#ffffff;">
              <p style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#40c472;margin:0 0 10px 0;">TU SOLICITUD DE ENERGÍA</p>
              <h1 style="font-size:28px;font-weight:900;line-height:1.2;margin:0 0 10px 0;">¡Hola, ${escapedName}!</h1>
              <p style="font-size:14px;color:#8fb09e;line-height:1.6;margin:0;">
                Gracias por tu interés en los sistemas EcoFlow. Hemos preparado una cotización personalizada para el equipo seleccionado que mejor se adapta a tus necesidades. Adjunto encontrarás el PDF formal con especificaciones completas.
              </p>
            </td>
          </tr>

          <!-- DETAIL BOX -->
          <tr>
            <td style="padding:30px 30px 10px 30px;">
              <h2 style="font-size:18px;font-weight:800;color:#1c2b22;margin:0 0 16px 0;">Detalle de la Solución Cotizada</h2>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f9f6;border-radius:12px;padding:20px;">
                <tr>
                  <td style="padding-bottom:10px;">
                    <span style="font-size:12px;color:#6b8a7a;display:block;">PRODUCTO:</span>
                    <strong style="font-size:16px;color:#1c2b22;">${config.normalizedName}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:10px;">
                    <span style="font-size:12px;color:#6b8a7a;display:block;">CAPACIDAD:</span>
                    <strong style="font-size:14px;color:#1c2b22;">${config.batteryCapacity}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:10px;">
                    <span style="font-size:12px;color:#6b8a7a;display:block;">BUNDLE ASOCIADO:</span>
                    <strong style="font-size:14px;color:#1c2b22;">${config.bundleName}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:10px;">
                    <span style="font-size:12px;color:#6b8a7a;display:block;">COMPONENTES INCLUIDOS:</span>
                    <span style="font-size:13px;color:#2d3748;">${config.components}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:10px;">
                    <span style="font-size:12px;color:#6b8a7a;display:block;">HORAS DE USO ESTIMADO:</span>
                    <span style="font-size:13px;color:#2d3748;">
                      Abanico: ~${config.usageHours.fan50w}h | Nevera: ~${config.usageHours.fridge150w}h | TV: ~${config.usageHours.tv80w}h | Los tres: ~${config.usageHours.combined}h
                    </span>
                  </td>
                </tr>
                <tr style="border-top:1px solid #e2e8f0;">
                  <td style="padding-top:10px;">
                    <span style="font-size:12px;color:#6b8a7a;display:block;">PRECIO TOTAL NETO:</span>
                    <strong style="font-size:20px;color:#1c6b3a;">$${config.price.toLocaleString()} USD</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- DECISION BUTTONS -->
          <tr>
            <td align="center" style="padding:20px 30px;">
              <p style="font-size:14px;font-weight:bold;color:#1c2b22;margin:0 0 16px 0;">
                ¿Cómo deseas proceder con esta cotización?
              </p>
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <a href="${confirmYesUrl}" target="_blank" style="display:inline-block;background-color:#1c6b3a;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;padding:14px 24px;border-radius:8px;margin-right:10px;">
                      👍 Me interesa
                    </a>
                  </td>
                  <td>
                    <a href="${confirmNoUrl}" target="_blank" style="display:inline-block;background-color:#e53e3e;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;padding:14px 24px;border-radius:8px;">
                      👎 No me interesa
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SEPARATOR -->
          <tr>
            <td style="padding:0 30px;"><div style="height:1px;background-color:#e2e8f0;"></div></td>
          </tr>

          <!-- CONTACT JERRY -->
          <tr>
            <td style="padding:24px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <strong style="font-size:14px;color:#1c2b22;display:block;">Tu Consultor Energético</strong>
                    <span style="font-size:15px;font-weight:bold;color:#1c2b22;">Jerry Encarnación</span>
                    <span style="font-size:13px;color:#6b8a7a;display:block;">Power Solar - Distribuidor Autorizado</span>
                  </td>
                  <td align="right">
                    <a href="tel:7876281344" style="display:inline-block;background-color:#1c2b22;color:#40c472;font-size:12px;font-weight:bold;text-decoration:none;padding:8px 16px;border-radius:6px;">
                      📞 787-628-1344
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td bgcolor="#1c2b22" style="padding:20px 30px;text-align:center;color:#8fb09e;font-size:11px;">
              <p style="margin:0 0 8px 0;font-weight:bold;color:#40c472;letter-spacing:1px;">ECOFLOW PUERTO RICO</p>
              <p style="margin:0;">
                Distribuido oficialmente por Power Solar LLC. Esta cotización y enlaces son seguros y de uso personal.
                <br/>© 2026 EcoFlow PR
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ==========================================
// EMAIL TEXT GENERATION (ENHANCED)
// ==========================================
function generateEmailText(lead, quote, config, publicBaseUrl, rawToken) {
  const confirmYesUrl = `${publicBaseUrl}/cotizacion/confirmar?id=${lead.id}&token=${rawToken}&interest=yes`;
  const confirmNoUrl = `${publicBaseUrl}/cotizacion/confirmar?id=${lead.id}&token=${rawToken}&interest=no`;

  return `Hola ${lead.nombre},

Gracias por tu interés en los sistemas EcoFlow.

Hemos preparado una cotización personalizada para ti:

═══ PRODUCTO ═══
- Nombre: ${config.normalizedName}
- Capacidad: ${config.batteryCapacity}
- Dimensiones: ${config.batteryDimensions}
- Volumen: ${config.batteryDimensionsFeet}
- Peso: ${config.batteryWeight}

═══ BUNDLE ASOCIADO ═══
- ${config.bundleName}
- Componentes: ${config.components}

═══ HORAS DE USO ESTIMADO CON ENSERES BÁSICOS ═══
- Abanico (50W): ~${config.usageHours.fan50w} horas
- Nevera (150W): ~${config.usageHours.fridge150w} horas
- TV (80W): ~${config.usageHours.tv80w} horas
- Los tres juntos (280W): ~${config.usageHours.combined} horas

═══ PRECIO TOTAL NETO ═══
$${config.price.toLocaleString()} USD

Adjunto a este correo encontrarás el PDF formal con todas las especificaciones técnicas, recomendaciones de duración de carga y más detalles.

¿CÓMO DESEAS PROCEDER?
- Me interesa: ${confirmYesUrl}
- No me interesa: ${confirmNoUrl}

Si tienes preguntas inmediatas, puedes comunicarte directamente con tu consultor energético:
Jerry Encarnación
Teléfono: 787-628-1344
Power Solar - Distribuidor Autorizado

Atentamente,
EcoFlow Puerto Rico / Power Solar`;
}

// ==========================================
// MAIN HANDLER
// ==========================================
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const gasUrl = 'https://script.google.com/macros/s/AKfycbxi2ATuJrRfzBysZqxl8NzGhEIsVf8grL1Ti5EcWRSi6NeGZc-gRVz2BqlVpDIeQ-4C/exec';
    const gasToken = process.env.GAS_TOKEN;

    if (!gasToken) return res.status(500).json({ error: 'Falta GAS_TOKEN en Vercel' });

    const body = req.body || {};

    console.log('\n========== INICIO PROCESAMIENTO DE LEAD ==========');
    console.log('[TIMESTAMP]', new Date().toISOString());
    console.log('[BODY_KEYS]', Object.keys(body));

    // 1. Validation of fields
    const nombre = String(body.nombre || '').trim();
    const email = String(body.email || '').trim();
    const telefono = String(body.telefono || '').replace(/\D/g, '');
    const pueblo = String(body.pueblo || '').trim();

    // IMPROVED: Check multiple product field names
    let productoOriginal = '';
    const productFieldNames = ['producto', 'anotaciones', 'product', 'modelo', 'model', 'productName'];
    for (const fieldName of productFieldNames) {
      if (body[fieldName]) {
        productoOriginal = String(body[fieldName]).trim();
        console.log(`[PRODUCT_SOURCE] Encontrado en campo: "${fieldName}" = "${productoOriginal}"`);
        break;
      }
    }

    console.log('[VALIDATION] Nombre:', nombre);
    console.log('[VALIDATION] Email:', email);
    console.log('[VALIDATION] Teléfono:', telefono);
    console.log('[VALIDATION] Pueblo:', pueblo);
    console.log('[VALIDATION] Producto Original:', productoOriginal);

    if (!nombre) {
      console.log('[ERROR] Falta campo obligatorio: nombre');
      return res.status(400).json({ ok: false, error: 'Falta campo obligatorio: nombre' });
    }
    if (!telefono || telefono.length < 7) {
      console.log('[ERROR] Teléfono inválido');
      return res.status(400).json({ ok: false, error: 'Teléfono inválido' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('[ERROR] Email inválido');
      return res.status(400).json({ ok: false, error: 'Email inválido' });
    }

    // Determine TEST_MODE securely
    const testModeEnv = String(process.env.TEST_MODE || 'true').toLowerCase().trim();
    const isTestMode = testModeEnv !== 'false';
    const testEmailRecipient = process.env.TEST_EMAIL_RECIPIENT || 'jerrypowersolar@gmail.com';

    console.log('[CONFIG] TEST_MODE:', isTestMode);
    console.log('[CONFIG] TEST_EMAIL:', testEmailRecipient);

    // Parse and validate PUBLIC_BASE_URL
    let publicBaseUrl = (process.env.PUBLIC_BASE_URL || '').trim();
    if (publicBaseUrl.endsWith('/')) {
      publicBaseUrl = publicBaseUrl.slice(0, -1);
    }

    const isTestingUrl = publicBaseUrl.startsWith('http://localhost') || publicBaseUrl.startsWith('http://127.0.0.1');
    const isHttpsUrl = publicBaseUrl.startsWith('https://');
    const isValidUrl = publicBaseUrl !== '' && (isHttpsUrl || isTestingUrl);

    console.log('[CONFIG] PUBLIC_BASE_URL:', publicBaseUrl);
    console.log('[CONFIG] URL válida:', isValidUrl);

    // 2. Check if product is authorized for quote
    console.log('\n[PRODUCT_LOOKUP] Buscando producto autorizado...');
    const productConfig = getAuthorizedProduct(productoOriginal);
    const eligible = productConfig !== null;

    console.log('[PRODUCT_LOOKUP] Elegible para cotización:', eligible);

    if (productConfig) {
      console.log('[PRODUCT_LOOKUP] Config encontrada:', productConfig.normalizedName);
    }

    // If eligible and PUBLIC_BASE_URL is invalid, we save the lead but fail the quote.
    if (eligible && !isValidUrl) {
      console.log('[LEAD_SAVE] Guardando lead (URL inválida para cotización)');
      const leadPayload = {
        token: gasToken,
        action: 'addLead',
        nombre,
        email,
        telefono,
        pueblo,
        factura: body.factura || '',
        origen: body.origen || 'EcoFlow PR Website',
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
        anotaciones: body.anotaciones || '',
        producto: productoOriginal,
        notifyAdmin: true,
        sendClientEmail: true,
        sourceMode: 'external',
        dedupeMode: 'merge'
      };

      const leadResponse = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload)
      });

      const leadText = await leadResponse.text();
      let leadData;
      try {
        leadData = JSON.parse(leadText);
      } catch {
        leadData = { raw: leadText };
      }

      if (!leadResponse.ok || !leadData.id) {
        console.log('[ERROR] GAS respondió con error al guardar lead');
        return res.status(500).json({
          ok: false,
          error: 'GAS respondió con error al guardar lead',
          gasResponse: leadData
        });
      }

      console.log('[LEAD_SAVE] ✅ Lead guardado con ID:', leadData.id);
      return res.status(200).json({
        ok: true,
        leadId: leadData.id,
        quoteStatus: 'fallida_envio',
        message: 'Lead guardado pero no se pudo generar la cotización por error de configuración del servidor'
      });
    }

    // 3. Save Lead in Google Sheets (Step 1)
    console.log('\n[LEAD_SAVE] Guardando lead en GAS...');
    const leadPayload = {
      token: gasToken,
      action: 'addLead',
      nombre,
      email,
      telefono,
      pueblo,
      factura: body.factura || '',
      origen: body.origen || 'EcoFlow PR Website',
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
      anotaciones: body.anotaciones || '',
      producto: productoOriginal,
      notifyAdmin: true,
      sendClientEmail: !eligible, // Skip generic email if eligible for custom quote
      sourceMode: 'external',
      dedupeMode: 'merge'
    };

    const leadResponse = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadPayload)
    });

    const leadText = await leadResponse.text();
    let leadData;
    try {
      leadData = JSON.parse(leadText);
    } catch {
      leadData = { raw: leadText };
    }

    if (!leadResponse.ok || !leadData.id) {
      console.log('[ERROR] GAS respondió con error al guardar lead');
      return res.status(500).json({
        ok: false,
        error: 'GAS respondió con error al guardar lead',
        gasResponse: leadData
      });
    }

    const leadId = leadData.id;
    console.log('[LEAD_SAVE] ✅ Lead guardado con ID:', leadId);

    // 4. Quote Automation (If eligible)
    if (eligible) {
      console.log('\n[QUOTE_PROCESS] Iniciando proceso de generación de cotización...');

      const quoteId = 'Q' + crypto.randomBytes(4).toString('hex').toUpperCase();
      console.log('[QUOTE_ID] Generado:', quoteId);

      // Tokens
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const tokenExpiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

      console.log('[TOKEN] Raw token generado');
      console.log('[TOKEN] Hash calculado');

      let pdfBuffer;
      try {
        console.log('[PDF] Iniciando generación de PDF...');
        const leadObj = { nombre, telefono, email, pueblo };
        const quoteObj = { quoteId };
        pdfBuffer = await generateQuotePdf(leadObj, quoteObj, productConfig);
        console.log('[PDF] ✅ PDF generado exitosamente. Tamaño:', pdfBuffer.length, 'bytes');
      } catch (pdfErr) {
        console.error('[PDF] ❌ Error en generación de PDF:', pdfErr.message);

        // Save lead status as failed in quote tracking sheet
        await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: gasToken,
            action: 'logQuoteError',
            quoteId,
            leadId,
            error: 'Fallo al generar PDF: ' + pdfErr.message,
            productoOriginal,
            productoNormalizado: productConfig.normalizedName,
            nombreBundle: productConfig.bundleName,
            componentesBundle: productConfig.components,
            precio: productConfig.price,
            recipientEmail: email,
            testMode: isTestMode
          })
        });

        // Still return success of lead creation, but flag quote error
        return res.status(200).json({
          ok: true,
          leadId,
          quoteStatus: 'fallida_pdf',
          message: 'Lead guardado pero falló la generación de cotización'
        });
      }

      // Determine recipient based on TEST_MODE
      const finalRecipient = isTestMode ? testEmailRecipient : email;
      const subjectPrefix = isTestMode ? '[PRUEBA] ' : '';
      const subject = `${subjectPrefix}Cotización EcoFlow — ${productConfig.normalizedName}`;

      console.log('[EMAIL] Destinatario final:', finalRecipient);
      console.log('[EMAIL] Asunto:', subject);

      // Email Bodies
      let finalHtml = generateEmailHtml({ id: leadId, nombre, email, telefono, pueblo }, { quoteId }, productConfig, publicBaseUrl, rawToken);
      let finalText = generateEmailText({ id: leadId, nombre, email, telefono, pueblo }, { quoteId }, productConfig, publicBaseUrl, rawToken);

      if (isTestMode) {
        // Obfuscate real email
        const obfuscatedEmail = email.replace(/(..)(.*)(@.*)/, '$1***$3');
        const testHeader = `<div style="background-color:#fff3cd;border:1px solid #ffeeba;padding:12px;margin-bottom:20px;border-radius:8px;color:#856404;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;">
          <strong>[MODO DE PRUEBA ACTIVO]</strong><br/>
          Este correo habría sido enviado a: <strong>${obfuscatedEmail}</strong> (${email})<br/>
          Los botones de abajo operarán sobre esta cotización de prueba.
        </div>`;
        finalHtml = finalHtml.replace('<!-- HEADER -->', `<!-- HEADER -->\n<tr><td style="padding:10px 30px 0 30px;">${testHeader}</td></tr>`);
        finalText = `[MODO DE PRUEBA ACTIVO]\nEste correo habría sido enviado a: ${email}\n\n` + finalText;
      }

      // Send Quote to GAS to trigger email send and save quote log
      console.log('[EMAIL] Preparando payload para GAS...');
      const quotePayload = {
        token: gasToken,
        action: 'sendQuoteEmail',
        quoteId,
        leadId,
        leadNombre: nombre,
        recipientEmail: finalRecipient,
        pdfBase64: pdfBuffer.toString('base64'),
        emailHtml: finalHtml,
        emailText: finalText,
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

      console.log('[EMAIL] Enviando a GAS...');
      const quoteResponse = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotePayload)
      });

      const quoteText = await quoteResponse.text();
      let quoteData;
      try {
        quoteData = JSON.parse(quoteText);
      } catch {
        quoteData = { raw: quoteText };
      }

      if (!quoteResponse.ok || quoteData.error) {
        console.error('[EMAIL] ❌ GAS sendQuoteEmail falló:', quoteData);
        return res.status(200).json({
          ok: true,
          leadId,
          quoteStatus: 'fallida_envio',
          message: 'Lead guardado pero falló el envío del correo'
        });
      }

      console.log('[EMAIL] ✅ Cotización enviada exitosamente');
      console.log('\n========== FIN PROCESAMIENTO DE LEAD ==========\n');

      return res.status(200).json({ ok: true, leadId, quoteStatus: 'enviada', quoteId });
    }

    console.log('[QUOTE_PROCESS] Producto no elegible para cotización automática');
    console.log('\n========== FIN PROCESAMIENTO DE LEAD ==========\n');

    // If not eligible, just return success
    return res.status(200).json({ ok: true, leadId, quoteStatus: 'no_aplica' });
  } catch (error) {
    console.error('[FATAL_ERROR]', error);
    return res.status(500).json({
      ok: false,
      error: 'Error en backend de lead',
      message: error.message
    });
  }
}
