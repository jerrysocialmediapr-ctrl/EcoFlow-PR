import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

export const PRODUCTS_TABLE = {
  'Batería para apartamento (Delta 2 Max)': {
    normalizedName: 'DELTA 2 Max',
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
    usageHours: { fan50w: 40, fridge150w: 13, tv80w: 25, combined: 5 },
    panelQuantity: 2,
    panelWattage: '100W cada uno',
    panelDimensions: '47.2" x 21.3" x 1.4" (119.9cm x 54.1cm x 3.5cm)',
    panelDimensionsFeet: '5.4 ft² por panel',
    panelTotalFeet: '10.8 ft² entre ambos paneles',
    panelWeight: '4.6 kg (10.1 lbs) por panel',
    panelChargeFull: '18 a 24 horas con sol pleno',
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
    usageHours: { fan50w: 81, fridge150w: 27, tv80w: 51, combined: 10 },
    panelQuantity: 4,
    panelWattage: '100W cada uno',
    panelDimensions: '47.2" x 21.3" x 1.4" (119.9cm x 54.1cm x 3.5cm)',
    panelDimensionsFeet: '5.4 ft² por panel',
    panelTotalFeet: '21.6 ft² entre los cuatro paneles',
    panelWeight: '4.6 kg (10.1 lbs) por panel',
    panelChargeFull: '10 a 14 horas con sol pleno',
    recommendations: [
      'Sistema recomendado para hogares con tres o cuatro enseres activos.',
      'Considerar un Transfer Switch para facilitar el cambio a batería.',
      'Instalar los paneles en techo o área abierta con máxima exposición solar.',
      'Usar los equipos de mayor consumo en horarios distintos.',
      'Realizar limpieza y revisión periódica de los paneles.'
    ]
  },
  'Sistema completo para hogar (Delta Pro Ultra)': {
    normalizedName: 'DELTA Pro Ultra',
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
    usageHours: { fan50w: 120, fridge150w: 40, tv80w: 75, combined: 15 },
    panelQuantity: 0,
    panelWattage: 'No incluidos',
    panelDimensions: 'No aplica',
    panelDimensionsFeet: 'No aplica',
    panelTotalFeet: 'No aplica',
    panelWeight: 'No aplica',
    panelChargeFull: 'Se recomienda adquirir paneles compatibles por separado',
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
  if (!input) {
    console.log('[PRODUCT_CHECK] Producto vacío');
    return null;
  }

  console.log('[PRODUCT_CHECK] Entrada normalizada:', input);

  for (const [key, config] of Object.entries(PRODUCTS_TABLE)) {
    const candidates = [key, config.normalizedName, ...(config.aliases || [])]
      .map(normalizeText)
      .filter(Boolean);

    const exact = candidates.some((candidate) => input === candidate);
    const descriptiveMatch = candidates.some((candidate) => {
      if (candidate.length < 8) return false;
      return input.includes(candidate) || candidate.includes(input);
    });

    if (exact || descriptiveMatch) {
      console.log('[PRODUCT_CHECK] Coincidencia:', key);
      return { key, ...config };
    }
  }

  console.log('[PRODUCT_CHECK] No se encontró producto autorizado');
  return null;
}

function addPdfHeader(doc, quoteId, pageLabel) {
  const logoPath = path.join(process.cwd(), 'ecoflow-logo.png');

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 44, 38, { fit: [125, 45] });
  } else {
    doc.font('Helvetica-Bold').fontSize(18).fillColor('#1c2b22').text('ECOFLOW', 44, 45);
    doc.font('Helvetica').fontSize(8).fillColor('#168447').text('PUERTO RICO', 44, 68);
  }

  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .fillColor('#1c2b22')
    .text('COTIZACIÓN ECOFLOW', 270, 42, { width: 280, align: 'right' });

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#668275')
    .text(`Cotización: ${quoteId}`, 300, 68, { width: 250, align: 'right' })
    .text(`Fecha: ${new Date().toLocaleDateString('es-PR')}`, 300, 82, { width: 250, align: 'right' })
    .text(pageLabel, 300, 96, { width: 250, align: 'right' });

  doc.strokeColor('#39b96b').lineWidth(2).moveTo(44, 116).lineTo(551, 116).stroke();
  doc.y = 136;
}

function addPdfFooter(doc) {
  doc
    .strokeColor('#e3ebe6')
    .lineWidth(1)
    .moveTo(44, 785)
    .lineTo(551, 785)
    .stroke();

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#8aa296')
    .text('EcoFlow Puerto Rico - Distribuidor autorizado Power Solar LLC', 44, 794, {
      width: 507,
      align: 'center'
    });
}

function sectionTitle(doc, title) {
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('#1c2b22')
    .text(title, { paragraphGap: 5 });
  doc.strokeColor('#39b96b').lineWidth(1).moveTo(44, doc.y).lineTo(551, doc.y).stroke();
  doc.moveDown(0.7);
}

function labelValue(doc, label, value, options = {}) {
  const width = options.width || 507;
  const x = options.x ?? 44;
  const y = options.y;

  if (typeof y === 'number') doc.y = y;
  doc
    .font('Helvetica-Bold')
    .fontSize(9.5)
    .fillColor('#567267')
    .text(label, x, doc.y, { width });
  doc
    .font('Helvetica')
    .fontSize(10.5)
    .fillColor('#24342c')
    .text(String(value || 'No indicado'), x, doc.y + 2, { width });
  doc.moveDown(0.55);
}

function generateQuotePdf(lead, quote, config) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margins: { top: 40, right: 44, bottom: 48, left: 44 } });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // PAGE 1
      addPdfHeader(doc, quote.quoteId, 'Página 1 de 2');

      sectionTitle(doc, 'DATOS DE LA COTIZACIÓN');

      const leftX = 44;
      const rightX = 304;
      const colWidth = 235;
      const startY = doc.y;

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#1c2b22').text('CLIENTE', leftX, startY, { width: colWidth });
      doc.font('Helvetica').fontSize(9.5).fillColor('#34483e')
        .text(`Nombre: ${lead.nombre}`, leftX, startY + 18, { width: colWidth })
        .text(`Teléfono: ${lead.telefono}`, leftX, startY + 33, { width: colWidth })
        .text(`Email: ${lead.email || 'No indicado'}`, leftX, startY + 48, { width: colWidth })
        .text(`Pueblo: ${lead.pueblo || 'No indicado'}`, leftX, startY + 63, { width: colWidth });

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#1c2b22').text('CONSULTOR', rightX, startY, { width: colWidth });
      doc.font('Helvetica').fontSize(9.5).fillColor('#34483e')
        .text('Jerry Encarnación', rightX, startY + 18, { width: colWidth })
        .text('Teléfono: 787-628-1344', rightX, startY + 33, { width: colWidth })
        .text('Email: info@powersolarprr.com', rightX, startY + 48, { width: colWidth })
        .text('Power Solar LLC', rightX, startY + 63, { width: colWidth });

      doc.y = startY + 95;

      doc.roundedRect(44, doc.y, 507, 124, 10).fillAndStroke('#f1f7f3', '#dce9e1');
      const boxY = doc.y;
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#168447').text('SOLUCIÓN RECOMENDADA', 62, boxY + 18, { width: 320 });
      doc.font('Helvetica-Bold').fontSize(18).fillColor('#1c2b22').text(config.normalizedName, 62, boxY + 37, { width: 320 });
      doc.font('Helvetica').fontSize(10).fillColor('#40564b').text(config.bundleName, 62, boxY + 64, { width: 320 });
      doc.font('Helvetica').fontSize(9).fillColor('#5d7468').text(config.components, 62, boxY + 84, { width: 320 });

      doc.font('Helvetica').fontSize(9).fillColor('#5d7468').text('INVERSIÓN TOTAL', 395, boxY + 27, { width: 135, align: 'right' });
      doc.font('Helvetica-Bold').fontSize(23).fillColor('#168447').text(`$${config.price.toLocaleString('en-US')}`, 390, boxY + 48, { width: 140, align: 'right' });
      doc.font('Helvetica').fontSize(8).fillColor('#71877c').text('USD', 390, boxY + 80, { width: 140, align: 'right' });
      doc.y = boxY + 146;

      sectionTitle(doc, 'ESPECIFICACIONES DE LA BATERÍA');
      labelValue(doc, 'Capacidad', config.batteryCapacity);
      labelValue(doc, 'Dimensiones', config.batteryDimensions);
      labelValue(doc, 'Volumen aproximado', config.batteryDimensionsFeet);
      labelValue(doc, 'Peso', config.batteryWeight);
      labelValue(doc, 'Vida útil estimada', config.batteryChargeCycles);

      doc.moveDown(0.4);
      sectionTitle(doc, 'AUTONOMÍA ESTIMADA');

      const usageY = doc.y;
      const cardWidth = 118;
      const usageCards = [
        ['ABANICO 50W', `~${config.usageHours.fan50w} h`],
        ['NEVERA 150W', `~${config.usageHours.fridge150w} h`],
        ['TV 80W', `~${config.usageHours.tv80w} h`],
        ['LOS TRES', `~${config.usageHours.combined} h`]
      ];

      usageCards.forEach(([title, value], index) => {
        const x = 44 + index * 130;
        doc.roundedRect(x, usageY, cardWidth, 58, 7).fillAndStroke('#f7faf8', '#dfe9e3');
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#61796d').text(title, x + 8, usageY + 12, { width: cardWidth - 16, align: 'center' });
        doc.font('Helvetica-Bold').fontSize(15).fillColor('#1c2b22').text(value, x + 8, usageY + 30, { width: cardWidth - 16, align: 'center' });
      });

      doc.y = usageY + 78;
      doc.font('Helvetica').fontSize(8.5).fillColor('#72877d').text(
        'Las horas son estimados basados en cargas típicas. El rendimiento real puede variar según el consumo, la temperatura, el estado de carga y el uso simultáneo de equipos.',
        44,
        doc.y,
        { width: 507, align: 'justify' }
      );

      addPdfFooter(doc);

      // PAGE 2
      doc.addPage();
      addPdfHeader(doc, quote.quoteId, 'Página 2 de 2');

      if (config.panelQuantity > 0) {
        sectionTitle(doc, 'PANELES SOLARES INCLUIDOS');
        labelValue(doc, 'Cantidad y potencia', `${config.panelQuantity} paneles de ${config.panelWattage}`);
        labelValue(doc, 'Dimensiones por panel', config.panelDimensions);
        labelValue(doc, 'Área por panel', config.panelDimensionsFeet);
        labelValue(doc, 'Área total requerida', config.panelTotalFeet);
        labelValue(doc, 'Peso por panel', config.panelWeight);
        labelValue(doc, 'Tiempo estimado de carga solar', config.panelChargeFull);
        doc.moveDown(0.5);
      } else {
        sectionTitle(doc, 'CONFIGURACIÓN SOLAR');
        labelValue(doc, 'Paneles', config.panelWattage);
        labelValue(doc, 'Recomendación', config.panelChargeFull);
        doc.moveDown(0.5);
      }

      sectionTitle(doc, 'RECOMENDACIONES DE USO');
      doc.font('Helvetica').fontSize(10).fillColor('#33483e');
      config.recommendations.forEach((recommendation, index) => {
        doc.font('Helvetica-Bold').fillColor('#168447').text(`${index + 1}.`, 48, doc.y, { width: 18, continued: true });
        doc.font('Helvetica').fillColor('#33483e').text(` ${recommendation}`, { width: 480, paragraphGap: 7 });
      });

      doc.moveDown(0.5);
      sectionTitle(doc, 'PRÓXIMOS PASOS');
      doc.font('Helvetica').fontSize(10).fillColor('#33483e')
        .text('Esta propuesta puede ajustarse según tus necesidades, espacio disponible y equipos prioritarios.', { paragraphGap: 7 })
        .text('Para confirmar interés o solicitar cambios, utiliza los botones incluidos en el correo o llama directamente al 787-628-1344.', { paragraphGap: 7 });

      doc.moveDown(0.5);
      sectionTitle(doc, 'NOTAS IMPORTANTES');
      doc.font('Helvetica').fontSize(9).fillColor('#5e7469')
        .text('Esta cotización está sujeta a disponibilidad de inventario, evaluación técnica, condiciones del lugar de instalación y aprobación final de Power Solar LLC.', { align: 'justify', paragraphGap: 6 })
        .text('Los tiempos de uso y carga son aproximados. La instalación y accesorios adicionales pueden variar de acuerdo con las necesidades del cliente.', { align: 'justify' });

      addPdfFooter(doc);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function generateEmailHtml(lead, quote, config, publicBaseUrl, rawToken) {
  const confirmYesUrl = `${publicBaseUrl}/cotizacion/confirmar?id=${encodeURIComponent(lead.id)}&token=${encodeURIComponent(rawToken)}&interest=yes`;
  const confirmNoUrl = `${publicBaseUrl}/cotizacion/confirmar?id=${encodeURIComponent(lead.id)}&token=${encodeURIComponent(rawToken)}&interest=no`;

  const name = escapeHtml(lead.nombre);
  const product = escapeHtml(config.normalizedName);
  const capacity = escapeHtml(config.batteryCapacity);
  const bundle = escapeHtml(config.bundleName);
  const components = escapeHtml(config.components);

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cotización EcoFlow</title>
  <style>
    @media only screen and (max-width:620px) {
      .email-shell { width:100% !important; }
      .mobile-pad { padding-left:18px !important; padding-right:18px !important; }
      .brand { font-size:17px !important; letter-spacing:1px !important; }
      .official { font-size:10px !important; }
      .hero-title { font-size:27px !important; }
      .action-cell { display:block !important; width:100% !important; padding:0 0 10px 0 !important; }
      .action-link { display:block !important; width:auto !important; text-align:center !important; }
      .consultant-cell { display:block !important; width:100% !important; text-align:left !important; padding-bottom:14px !important; }
      .phone-cell { display:block !important; width:100% !important; text-align:left !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#eef4f0;font-family:Arial,Helvetica,sans-serif;color:#1c2b22;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef4f0;">
    <tr>
      <td align="center" style="padding:20px 10px;">
        <table role="presentation" class="email-shell" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border-collapse:separate;border-spacing:0;">
          <!-- HEADER -->
          <tr>
            <td class="mobile-pad" style="padding:24px 30px;background:#1c2b22;border-bottom:3px solid #39b96b;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="white-space:nowrap;">
                    <span class="brand" style="font-size:20px;font-weight:900;letter-spacing:2px;color:#ffffff;white-space:nowrap;">ECOFLOW PUERTO RICO</span>
                  </td>
                  <td align="right" style="white-space:nowrap;">
                    <span class="official" style="font-size:11px;font-weight:bold;color:#9ec8b0;white-space:nowrap;">COTIZACIÓN OFICIAL</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="mobile-pad" style="padding:36px 30px;background:#dfeee5;">
              <p style="margin:0 0 10px;font-size:11px;letter-spacing:3px;color:#168447;font-weight:bold;">TU SOLICITUD DE ENERGÍA</p>
              <h1 class="hero-title" style="margin:0 0 14px;font-size:34px;line-height:1.15;color:#1c2b22;">¡Hola, ${name}!</h1>
              <p style="margin:0;font-size:16px;line-height:1.6;color:#557065;">Hemos preparado una cotización personalizada. El PDF formal está adjunto a este correo con las especificaciones y recomendaciones completas.</p>
            </td>
          </tr>

          <tr>
            <td class="mobile-pad" style="padding:32px 30px 10px;">
              <h2 style="margin:0 0 18px;font-size:22px;color:#1c2b22;">Detalle de la solución cotizada</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f2f7f4;border:1px solid #dfe9e3;border-radius:12px;">
                <tr><td style="padding:22px 22px 10px;"><div style="font-size:12px;color:#658174;">PRODUCTO</div><div style="font-size:21px;font-weight:bold;color:#1c2b22;">${product}</div></td></tr>
                <tr><td style="padding:8px 22px;"><div style="font-size:12px;color:#658174;">CAPACIDAD</div><div style="font-size:16px;font-weight:bold;">${capacity}</div></td></tr>
                <tr><td style="padding:8px 22px;"><div style="font-size:12px;color:#658174;">PAQUETE</div><div style="font-size:16px;font-weight:bold;">${bundle}</div></td></tr>
                <tr><td style="padding:8px 22px;"><div style="font-size:12px;color:#658174;">COMPONENTES</div><div style="font-size:14px;line-height:1.5;color:#34483e;">${components}</div></td></tr>
                <tr><td style="padding:8px 22px;"><div style="font-size:12px;color:#658174;">AUTONOMÍA ESTIMADA</div><div style="font-size:14px;line-height:1.6;color:#34483e;">Abanico: ~${config.usageHours.fan50w} h &nbsp;|&nbsp; Nevera: ~${config.usageHours.fridge150w} h &nbsp;|&nbsp; TV: ~${config.usageHours.tv80w} h &nbsp;|&nbsp; Los tres: ~${config.usageHours.combined} h</div></td></tr>
                <tr><td style="padding:18px 22px 22px;border-top:1px solid #dfe9e3;"><div style="font-size:12px;color:#658174;">INVERSIÓN TOTAL</div><div style="font-size:28px;font-weight:900;color:#168447;">$${config.price.toLocaleString('en-US')} USD</div></td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="mobile-pad" style="padding:28px 30px 18px;">
              <p style="margin:0 0 16px;text-align:center;font-size:17px;font-weight:bold;">¿Cómo deseas proceder?</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="action-cell" width="50%" style="padding-right:6px;">
                    <a class="action-link" href="${confirmYesUrl}" target="_blank" style="display:block;background:#35a866;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;padding:16px 14px;border-radius:9px;text-align:center;">SÍ, ME INTERESA</a>
                  </td>
                  <td class="action-cell" width="50%" style="padding-left:6px;">
                    <a class="action-link" href="${confirmNoUrl}" target="_blank" style="display:block;background:#d95555;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;padding:16px 14px;border-radius:9px;text-align:center;">NO ME INTERESA</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td class="mobile-pad" style="padding:10px 30px;"><div style="height:1px;background:#dfe7e2;"></div></td></tr>

          <tr>
            <td class="mobile-pad" style="padding:22px 30px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="consultant-cell" width="62%">
                    <div style="font-size:14px;font-weight:bold;color:#658174;">TU CONSULTOR ENERGÉTICO</div>
                    <div style="font-size:20px;font-weight:bold;color:#1c2b22;margin-top:4px;">Jerry Encarnación</div>
                    <div style="font-size:14px;color:#658174;margin-top:4px;">Power Solar - Distribuidor autorizado</div>
                  </td>
                  <td class="phone-cell" width="38%" align="right">
                    <a href="tel:7876281344" style="display:inline-block;background:#dfeee5;color:#126b39;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 14px;border-radius:8px;white-space:nowrap;">LLAMAR: 787-628-1344</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="mobile-pad" style="padding:22px 30px;background:#1c2b22;text-align:center;color:#9ec8b0;font-size:12px;line-height:1.5;">
              <div style="font-size:14px;font-weight:bold;letter-spacing:2px;color:#49c779;margin-bottom:8px;">ECOFLOW PUERTO RICO</div>
              Distribuido oficialmente por Power Solar LLC.<br>
              Esta cotización y sus enlaces son de uso personal.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generateEmailText(lead, quote, config, publicBaseUrl, rawToken) {
  const yesUrl = `${publicBaseUrl}/cotizacion/confirmar?id=${encodeURIComponent(lead.id)}&token=${encodeURIComponent(rawToken)}&interest=yes`;
  const noUrl = `${publicBaseUrl}/cotizacion/confirmar?id=${encodeURIComponent(lead.id)}&token=${encodeURIComponent(rawToken)}&interest=no`;

  return `Hola ${lead.nombre},

Hemos preparado tu cotización EcoFlow.

PRODUCTO
${config.normalizedName}
Capacidad: ${config.batteryCapacity}
Paquete: ${config.bundleName}
Componentes: ${config.components}

AUTONOMÍA ESTIMADA
Abanico: ~${config.usageHours.fan50w} horas
Nevera: ~${config.usageHours.fridge150w} horas
TV: ~${config.usageHours.tv80w} horas
Los tres: ~${config.usageHours.combined} horas

INVERSIÓN TOTAL
$${config.price.toLocaleString('en-US')} USD

El PDF formal está adjunto.

SÍ, ME INTERESA:
${yesUrl}

NO ME INTERESA:
${noUrl}

Jerry Encarnación
787-628-1344
Power Solar - Distribuidor autorizado EcoFlow`;
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

function buildLeadPayload(body, values, gasToken, sendClientEmail) {
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
    dedupeMode: 'merge'
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    console.log('\n========== INICIO PROCESAMIENTO DE LEAD ==========');
    console.log('[TIMESTAMP]', new Date().toISOString());

    const gasUrl = String(process.env.GAS_URL || 'https://script.google.com/macros/s/AKfycbxi2ATuJrRfzBysZqxl8NzGhEIsVf8grL1Ti5EcWRSi6NeGZc-gRVz2BqlVpDIeQ-4C/exec').trim();
    const gasToken = String(process.env.GAS_TOKEN || '').trim();
    if (!gasToken) return res.status(500).json({ ok: false, error: 'Falta GAS_TOKEN en Vercel' });

    const body = req.body || {};
    console.log('[BODY_KEYS]', Object.keys(body));

    const nombre = String(body.nombre || body.name || '').trim();
    const email = String(body.email || '').trim();
    const telefono = String(body.telefono || body.phone || '').replace(/\D/g, '');
    const pueblo = String(body.pueblo || body.city || '').trim();

    const productFields = ['producto', 'productoOriginal', 'product', 'productName', 'modelo', 'model'];
    let productoOriginal = '';
    for (const field of productFields) {
      if (String(body[field] || '').trim()) {
        productoOriginal = String(body[field]).trim();
        console.log(`[PRODUCT_SOURCE] ${field}: ${productoOriginal}`);
        break;
      }
    }

    if (!productoOriginal && getAuthorizedProduct(body.anotaciones)) {
      productoOriginal = String(body.anotaciones).trim();
      console.log('[PRODUCT_SOURCE] anotaciones:', productoOriginal);
    }

    if (!nombre) return res.status(400).json({ ok: false, error: 'Falta campo obligatorio: nombre' });
    if (!telefono || telefono.length < 7) return res.status(400).json({ ok: false, error: 'Teléfono inválido' });
    if (email && !isValidEmail(email)) return res.status(400).json({ ok: false, error: 'Email inválido' });

    const testModeValue = String(process.env.TEST_MODE || 'true').toLowerCase().trim();
    const isTestMode = testModeValue !== 'false';
    const testEmailRecipient = String(process.env.TEST_EMAIL_RECIPIENT || '').trim();

    let publicBaseUrl = String(process.env.PUBLIC_BASE_URL || '').trim().replace(/\/+$/, '');
    const validBaseUrl = /^https:\/\//i.test(publicBaseUrl) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(publicBaseUrl);

    console.log('[CONFIG] TEST_MODE:', isTestMode);
    console.log('[CONFIG] TEST_EMAIL:', testEmailRecipient);
    console.log('[CONFIG] PUBLIC_BASE_URL:', publicBaseUrl);
    console.log('[CONFIG] URL válida:', validBaseUrl);

    const productConfig = getAuthorizedProduct(productoOriginal);
    const eligible = Boolean(productConfig?.eligible);
    console.log('[PRODUCT_LOOKUP] Elegible:', eligible);

    const values = { nombre, email, telefono, pueblo, productoOriginal };

    if (eligible && !validBaseUrl) {
      const { response, data } = await postToGas(gasUrl, buildLeadPayload(body, values, gasToken, true));
      if (!response.ok || data.error || !data.id) {
        return res.status(500).json({ ok: false, error: 'GAS respondió con error al guardar lead', gasResponse: data });
      }
      return res.status(200).json({
        ok: true,
        leadId: data.id,
        quoteStatus: 'fallida_configuracion',
        message: 'Lead guardado, pero PUBLIC_BASE_URL no es válida'
      });
    }

    const { response: leadResponse, data: leadData } = await postToGas(
      gasUrl,
      buildLeadPayload(body, values, gasToken, !eligible)
    );

    if (!leadResponse.ok || leadData.error || !leadData.id) {
      console.error('[LEAD_SAVE] Error:', leadData);
      return res.status(500).json({ ok: false, error: 'GAS respondió con error al guardar lead', gasResponse: leadData });
    }

    const leadId = leadData.id;
    console.log('[LEAD_SAVE] Lead guardado:', leadId);

    if (!eligible) {
      return res.status(200).json({ ok: true, leadId, quoteStatus: 'no_aplica' });
    }

    const finalRecipient = isTestMode ? testEmailRecipient : email;
    if (!isValidEmail(finalRecipient)) {
      console.error('[EMAIL] Destinatario inválido:', finalRecipient);
      return res.status(200).json({
        ok: true,
        leadId,
        quoteStatus: 'fallida_configuracion_email',
        message: 'Lead guardado, pero el destinatario configurado no es válido'
      });
    }

    const quoteId = `Q${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenExpiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    let pdfBuffer;
    try {
      console.log('[PDF] Generando PDF...');
      pdfBuffer = await generateQuotePdf({ nombre, telefono, email, pueblo }, { quoteId }, productConfig);
      console.log('[PDF] PDF generado:', pdfBuffer.length, 'bytes');
    } catch (pdfError) {
      console.error('[PDF] Error:', pdfError);
      await postToGas(gasUrl, {
        token: gasToken,
        action: 'logQuoteError',
        quoteId,
        leadId,
        error: `Fallo al generar PDF: ${pdfError.message}`,
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

    const subject = `${isTestMode ? '[PRUEBA] ' : ''}Cotización EcoFlow — ${productConfig.normalizedName}`;
    let emailHtml = generateEmailHtml({ id: leadId, nombre, email, telefono, pueblo }, { quoteId }, productConfig, publicBaseUrl, rawToken);
    let emailText = generateEmailText({ id: leadId, nombre, email, telefono, pueblo }, { quoteId }, productConfig, publicBaseUrl, rawToken);

    if (isTestMode) {
      const [local = '', domain = ''] = email.split('@');
      const obfuscated = email ? `${local.slice(0, 2)}***@${domain}` : 'sin correo del cliente';
      const testBanner = `<tr><td class="mobile-pad" style="padding:14px 30px;background:#fff4c7;color:#725800;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;"><strong>[MODO DE PRUEBA ACTIVO]</strong><br>Este correo habría sido enviado a: <strong>${escapeHtml(obfuscated)}</strong><br>Los botones operarán sobre esta cotización de prueba.</td></tr>`;
      emailHtml = emailHtml.replace('<!-- HEADER -->', `<!-- HEADER -->${testBanner}`);
      emailText = `[MODO DE PRUEBA ACTIVO]\nEste correo habría sido enviado a: ${email || 'sin correo'}\n\n${emailText}`;
    }

    const quotePayload = {
      token: gasToken,
      action: 'sendQuoteEmail',
      quoteId,
      leadId,
      leadNombre: nombre,
      recipientEmail: finalRecipient,
      pdfBase64: pdfBuffer.toString('base64'),
      emailHtml,
      emailText,
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

    console.log('[EMAIL] Enviando a GAS:', finalRecipient);
    const { response: quoteResponse, data: quoteData } = await postToGas(gasUrl, quotePayload);

    if (!quoteResponse.ok || quoteData.error) {
      console.error('[EMAIL] GAS sendQuoteEmail falló:', quoteData);
      return res.status(200).json({
        ok: true,
        leadId,
        quoteStatus: 'fallida_envio',
        message: 'Lead guardado, pero falló el envío de la cotización',
        gasResponse: quoteData
      });
    }

    console.log('[EMAIL] Cotización enviada correctamente');
    console.log('========== FIN PROCESAMIENTO DE LEAD ==========\n');
    return res.status(200).json({ ok: true, leadId, quoteStatus: 'enviada', quoteId });
  } catch (error) {
    console.error('[FATAL_ERROR]', error);
    return res.status(500).json({ ok: false, error: 'Error en backend de lead', message: error.message });
  }
}
