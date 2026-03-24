// ==========================================
// 1. CONFIGURACIÓN DE CAPTURA DE LEADS
// ==========================================
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = e.parameter || {};

  var row = [
    new Date(),
    data.name || data.Nombre || data.nombre || "",
    data.phone || data.Telefono || data.telefono || "",
    data.email || data.Email || "",
    data.town || data.Municipio || data.municipio || "",
    data.monthlyBill || data.Servicio || data.servicio || "",
    data.leadSource || "Página Principal"
  ];

  sheet.appendRow(row);

  MailApp.sendEmail({
    to: "jerrypowersolar@gmail.com",
    subject: "🔥 Nuevo Lead - Power Solar",
    body: "Nuevo lead recibido:\n\nNombre: " + row[1] + "\nTeléfono: " + row[2] + "\nEmail: " + row[3] + "\nPueblo: " + row[4] + "\nFactura Mensual: " + row[5] + "\nOrigen: " + row[6]
  });

  if (row[3] && row[3].indexOf("@") !== -1) {
    var leadSource = row[6];
    var htmlBody;
    var subject;

    if (leadSource === "EcoFlow PR Website") {
      htmlBody = buildEcoFlowEmail(row[1]);
      subject = "⚡ Tu solicitud fue recibida — EcoFlow PR";
    } else {
      htmlBody = buildClientEmail(row[1]);
      subject = "☀️ Recibimos tu solicitud — Power Solar";
    }

    GmailApp.sendEmail(row[3], subject, "", {
      from: "info@powersolarprr.com",
      name: leadSource === "EcoFlow PR Website" ? "EcoFlow PR" : "Power Solar",
      htmlBody: htmlBody
    });
  }

  return ContentService.createTextOutput(JSON.stringify({"result": "success"})).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = {};
  try { data = JSON.parse(e.postData.contents); } 
  catch(err) { try { data = e.parameter || {}; } catch(err2) { data = {}; } }

  var row = [
    new Date(),
    data.name || data.Nombre || data.nombre || "",
    data.phone || data.Telefono || data.telefono || "",
    data.email || data.Email || "",
    data.town || data.Municipio || data.municipio || "",
    data.monthlyBill || data.Servicio || data.servicio || "",
    data.leadSource || "Página Principal"
  ];

  sheet.appendRow(row);

  MailApp.sendEmail({
    to: "jerrypowersolar@gmail.com",
    subject: "🔥 Nuevo Lead - Power Solar",
    body: "Nuevo lead recibido:\n\nNombre: " + row[1] + "\nTeléfono: " + row[2] + "\nEmail: " + row[3] + "\nPueblo: " + row[4] + "\nFactura Mensual: " + row[5] + "\nOrigen: " + row[6]
  });

  if (row[3] && row[3].indexOf("@") !== -1) {
    var leadSource = row[6];
    var htmlBody;
    var subject;

    if (leadSource === "EcoFlow PR Website") {
      htmlBody = buildEcoFlowEmail(row[1]);
      subject = "⚡ Tu solicitud fue recibida — EcoFlow PR";
    } else {
      htmlBody = buildClientEmail(row[1]);
      subject = "☀️ Recibimos tu solicitud — Power Solar";
    }

    GmailApp.sendEmail(row[3], subject, "", {
      from: "info@powersolarprr.com",
      name: leadSource === "EcoFlow PR Website" ? "EcoFlow PR" : "Power Solar",
      htmlBody: htmlBody
    });
  }

  return ContentService.createTextOutput(JSON.stringify({"result": "success"})).setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 2. MENÚ PERSONALIZADO EN GOOGLE SHEETS
// ==========================================
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 Power Solar Admin')
      .addItem('1. Inicializar Hoja (Columnas)', 'setupSheet')
      .addSeparator()
      .addItem('2. Enviar Oferta: Leasing Solar', 'sendLeasingEmail')
      .addItem('3. Enviar Oferta: Expansión Solar', 'sendExpansionEmail')
      .addToUi();
}

function setupSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var headers = ["Fecha", "Nombre", "Teléfono", "Email", "Pueblo", "Factura Mensual", "Origen del Lead"];
  sheet.clear();
  sheet.appendRow(headers);
  var range = sheet.getRange(1, 1, 1, headers.length);
  range.setFontWeight("bold").setBackground("#f3f3f3");
  SpreadsheetApp.getUi().alert('¡Hoja configurada exitosamente!');
}

// ==========================================
// 3. FUNCIONES DE ENVÍO MASIVO
// ==========================================
function sendLeasingEmail() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt('Escribe el ASUNTO de la oferta Leasing ($176):', ui.ButtonSet.OK_CANCEL);
  if (result.getSelectedButton() == ui.Button.OK) {
    processMassEmail(result.getResponseText(), buildLeasingEmail);
  }
}

function sendExpansionEmail() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt('Escribe el ASUNTO de la oferta Expansión ($86):', ui.ButtonSet.OK_CANCEL);
  if (result.getSelectedButton() == ui.Button.OK) {
    processMassEmail(result.getResponseText(), buildExpansionEmail);
  }
}

function processMassEmail(subject, templateFunction) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var range = sheet.getActiveRange();
  var data = range.getValues();
  var count = 0;
  
  if (data.length === 0 || data[0].length < 4) {
    SpreadsheetApp.getUi().alert('⚠️ IMPORTANTE: Selecciona/sombrea las filas completas de los clientes en la hoja antes de presionar enviar.');
    return;
  }
  
  for (var i = 0; i < data.length; i++) {
    var nombre = data[i][1];
    var email = data[i][3];
    if (email && email.includes("@")) {
      var htmlBody = templateFunction(nombre);
      GmailApp.sendEmail(email, subject, "Mira nuestra nueva oferta. Abre este correo en un cliente que soporte HTML.", {
        from: "info@powersolarprr.com",
        name: "Power Solar",
        htmlBody: htmlBody
      });
      count++;
    }
  }
  SpreadsheetApp.getUi().alert('¡Éxito! 🚀 Se enviaron ' + count + ' correos.');
}

// ==========================================
// 4. PLANTILLAS HTML
// ==========================================

// PLANTILLA ECOFLOW PR – CONFIRMACIÓN
function buildEcoFlowEmail(nombre) {
  return '<!DOCTYPE html>' +
  '<html lang="es">' +
  '<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>' +
  '<title>EcoFlow PR – Tu solicitud fue recibida</title>' +
  '<style>' +
  '* { margin:0; padding:0; box-sizing:border-box; }' +
  'body { background: #eef0ec; font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; padding: 32px 16px; }' +
  '.email-wrap { max-width: 600px; margin: 0 auto; }' +
  '.header { background: #ffffff; border-radius: 20px 20px 0 0; padding: 28px 40px; display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e4ebe6; }' +
  '.logo-row { display:flex; align-items:center; gap:10px; }' +
  '.logo-text { font-size: 18px; font-weight: 800; letter-spacing: 3px; color: #1c2b22; }' +
  '.pr-tag { background: #1c2b22; color: #40c472; font-size: 11px; font-weight: 700; letter-spacing: 2px; padding: 4px 10px; border-radius: 4px; }' +
  '.status-pill { display: flex; align-items: center; gap: 7px; background: #f0faf4; border: 1.5px solid #a8d9bc; border-radius: 20px; padding: 6px 14px; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; color: #2d6a4f; text-transform: uppercase; }' +
  '.pulse-dot { width:8px; height:8px; border-radius:50%; background:#40c472; display:inline-block; }' +
  '.hero { background: #1c2b22; padding: 52px 40px 48px; position: relative; overflow: hidden; }' +
  '.hero-eyebrow { font-size:12px; font-weight:700; letter-spacing:3px; color:#40c472; text-transform:uppercase; margin-bottom:16px; }' +
  '.hero h1 { font-size:42px; font-weight:800; line-height:1.05; color:#fff; margin-bottom:20px; }' +
  '.hero h1 em { color:#40c472; font-style:normal; }' +
  '.hero p { font-size:16px; font-weight:300; color:#8fb09e; line-height:1.75; max-width:430px; }' +
  '.hero p strong { color:#c8e6d0; font-weight:600; }' +
  '.call-strip { background: #40c472; padding: 22px 40px; display: flex; align-items: center; gap: 16px; }' +
  '.call-icon-wrap { background: rgba(0,0,0,0.1); border-radius: 50%; width:46px; height:46px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:22px; }' +
  '.call-text { font-size:20px; font-weight:800; color:#0f1f14; }' +
  '.call-text span { font-size:13px; font-weight:400; display:block; color:#1b4d2e; margin-top:2px; }' +
  '.appliances { background: #fff; padding: 40px; border-bottom: 2px solid #e4ebe6; }' +
  '.section-eyebrow { font-size:11px; font-weight:700; letter-spacing:3px; color:#8aab96; text-transform:uppercase; margin-bottom:8px; }' +
  '.section-title { font-size:26px; font-weight:800; color:#1c2b22; margin-bottom:6px; }' +
  '.section-sub { font-size:14px; color:#7a9986; margin-bottom:26px; line-height:1.6; }' +
  '.appliance-row { display:flex; gap:12px; }' +
  '.appliance-chip { display:flex; flex-direction:column; align-items:center; gap:10px; background:#f5f9f6; border:1.5px solid #d4eddb; border-radius:14px; padding:20px 12px 14px; flex:1; text-align:center; }' +
  '.appliance-icon { font-size:32px; }' +
  '.appliance-name { font-size:14px; font-weight:700; color:#1c2b22; }' +
  '.appliance-watts { font-size:11px; color:#8aab96; font-weight:500; }' +
  '.products { background: #f5f8f5; padding: 40px; border-bottom: 2px solid #e4ebe6; }' +
  '.product-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; }' +
  '.product-card { background:#fff; border:1.5px solid #e2ebe6; border-radius:16px; overflow:hidden; }' +
  '.product-img-wrap { background: #1c2b22; display: flex; align-items: center; justify-content: center; height: 170px; padding: 16px; }' +
  '.product-img { width: 100%; height: 100%; object-fit: contain; display: block; }' +
  '.product-info { padding: 18px; }' +
  '.product-name { font-size:18px; font-weight:800; color:#1c2b22; margin-bottom:5px; }' +
  '.product-detail { font-size:12px; color:#7a9986; line-height:1.65; }' +
  '.product-badge { display:inline-block; background:#f0faf4; border:1px solid #b7dfca; color:#2d6a4f; font-size:11px; font-weight:700; letter-spacing:1px; padding:3px 8px; border-radius:4px; margin-top:10px; }' +
  '.bundle-wrap { grid-column: 1 / -1; }' +
  '.bundle { background:#1c2b22; border-radius:14px; padding:22px 24px; display:flex; align-items:center; justify-content:space-between; gap:16px; }' +
  '.bundle-headline { font-size:18px; font-weight:800; color:#40c472; letter-spacing:1px; margin-bottom:4px; }' +
  '.bundle-sub { font-size:13px; color:#5e8f6e; line-height:1.5; }' +
  '.bundle-cta { background:#40c472; color:#0f1f14; font-size:14px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; padding:12px 22px; border-radius:8px; white-space:nowrap; text-decoration:none; display:inline-block; }' +
  '.cta-block { background:#fff; padding:40px; text-align:center; border-bottom:2px solid #e4ebe6; }' +
  '.cta-block p { font-size:15px; color:#7a9986; margin-bottom:22px; line-height:1.6; }' +
  '.main-cta { display:inline-block; background:#1c2b22; color:#fff; font-size:16px; font-weight:700; letter-spacing:2px; text-transform:uppercase; padding:16px 44px; border-radius:10px; text-decoration:none; }' +
  '.footer { background:#e8ebe5; border-radius:0 0 20px 20px; padding:28px 40px; text-align:center; }' +
  '.footer-logo { font-size:15px; font-weight:700; letter-spacing:4px; color:#8aab96; margin-bottom:12px; }' +
  '.footer-links { display:flex; justify-content:center; gap:20px; margin-bottom:12px; }' +
  '.footer-links a { font-size:12px; color:#8aab96; text-decoration:none; }' +
  '.footer-small { font-size:11px; color:#a0b8a8; line-height:1.8; }' +
  '.footer-small a { color:#8aab96; text-decoration:none; }' +
  '@media(max-width:600px){.hero{padding:32px 24px;}.hero h1{font-size:32px;}.appliance-row{flex-wrap:wrap;}.product-grid{grid-template-columns:1fr;}.bundle{flex-direction:column;text-align:center;}.header{flex-direction:column;gap:12px;}.call-strip{flex-direction:column;text-align:center;}}' +
  '</style></head>' +
  '<body>' +
  '<div class="email-wrap">' +

  // HEADER
  '<div class="header" style="background:#ffffff;border-radius:20px 20px 0 0;padding:28px 40px;border-bottom:2px solid #e4ebe6;">' +
  '<div class="logo-row" style="display:flex;align-items:center;gap:10px;">' +
  '<span class="logo-text" style="font-size:18px;font-weight:800;letter-spacing:3px;color:#1c2b22;">ECOFLOW</span>' +
  '<span class="pr-tag" style="background:#1c2b22;color:#40c472;font-size:11px;font-weight:700;letter-spacing:2px;padding:4px 10px;border-radius:4px;">PUERTO RICO</span>' +
  '</div>' +
  '<div class="status-pill" style="display:flex;align-items:center;gap:7px;background:#f0faf4;border:1.5px solid #a8d9bc;border-radius:20px;padding:6px 14px;font-size:12px;font-weight:700;letter-spacing:1.5px;color:#2d6a4f;text-transform:uppercase;">' +
  '<span class="pulse-dot" style="width:8px;height:8px;border-radius:50%;background:#40c472;display:inline-block;"></span> Recibido' +
  '</div></div>' +

  // HERO
  '<div class="hero" style="background:#1c2b22;padding:52px 40px 48px;">' +
  '<div class="hero-eyebrow" style="font-size:12px;font-weight:700;letter-spacing:3px;color:#40c472;text-transform:uppercase;margin-bottom:16px;">&#x26A1; Solicitud recibida</div>' +
  '<h1 style="font-size:42px;font-weight:800;line-height:1.05;color:#fff;margin-bottom:20px;">Hola, ' + nombre + '.<br/><em style="color:#40c472;font-style:normal;">Tranquilo.</em></h1>' +
  '<p style="font-size:16px;font-weight:300;color:#8fb09e;line-height:1.75;max-width:430px;">Recibimos tu informaci&#xF3;n y <strong style="color:#c8e6d0;font-weight:600;">te estaremos llamando en breve</strong>. Con EcoFlow, el pr&#xF3;ximo apag&#xF3;n no te agarra desprevenido.</p>' +
  '</div>' +

  // CALL STRIP
  '<div class="call-strip" style="background:#40c472;padding:22px 40px;display:flex;align-items:center;gap:16px;">' +
  '<div class="call-icon-wrap" style="background:rgba(0,0,0,0.1);border-radius:50%;width:46px;height:46px;display:flex;align-items:center;justify-content:center;font-size:22px;">&#x1F4F2;</div>' +
  '<div class="call-text" style="font-size:20px;font-weight:800;color:#0f1f14;">Un especialista te llama en breve' +
  '<span style="font-size:13px;font-weight:400;display:block;color:#1b4d2e;margin-top:2px;">Tendremos lista la mejor opci&#xF3;n para tu hogar</span></div></div>' +

  // APPLIANCES
  '<div class="appliances" style="background:#fff;padding:40px;border-bottom:2px solid #e4ebe6;">' +
  '<div class="section-eyebrow" style="font-size:11px;font-weight:700;letter-spacing:3px;color:#8aab96;text-transform:uppercase;margin-bottom:8px;">Lo que vas a poder usar</div>' +
  '<div class="section-title" style="font-size:26px;font-weight:800;color:#1c2b22;margin-bottom:6px;">Sin apag&#xF3;n que te detenga</div>' +
  '<div class="section-sub" style="font-size:14px;color:#7a9986;margin-bottom:26px;line-height:1.6;">La Delta Pro 3 con 4 paneles solares te mantiene con lo que m&#xE1;s necesitas cuando se va la luz.</div>' +
  '<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
  '<td width="25%" align="center" style="background:#f5f9f6;border:1.5px solid #d4eddb;border-radius:14px;padding:20px 8px 14px;"><div style="font-size:32px;margin-bottom:8px;">&#x1F32C;</div><div style="font-size:14px;font-weight:700;color:#1c2b22;">Abanico</div><div style="font-size:11px;color:#8aab96;">~50W</div></td>' +
  '<td width="4"></td>' +
  '<td width="25%" align="center" style="background:#f5f9f6;border:1.5px solid #d4eddb;border-radius:14px;padding:20px 8px 14px;"><div style="font-size:32px;margin-bottom:8px;">&#x2744;</div><div style="font-size:14px;font-weight:700;color:#1c2b22;">Nevera</div><div style="font-size:11px;color:#8aab96;">~150W</div></td>' +
  '<td width="4"></td>' +
  '<td width="25%" align="center" style="background:#f5f9f6;border:1.5px solid #d4eddb;border-radius:14px;padding:20px 8px 14px;"><div style="font-size:32px;margin-bottom:8px;">&#x1F4FA;</div><div style="font-size:14px;font-weight:700;color:#1c2b22;">Televisor</div><div style="font-size:11px;color:#8aab96;">~80W</div></td>' +
  '<td width="4"></td>' +
  '<td width="25%" align="center" style="background:#f5f9f6;border:1.5px solid #d4eddb;border-radius:14px;padding:20px 8px 14px;"><div style="font-size:32px;margin-bottom:8px;">&#x1F4A1;</div><div style="font-size:14px;font-weight:700;color:#1c2b22;">Luces</div><div style="font-size:11px;color:#8aab96;">~30W</div></td>' +
  '</tr></table></div>' +

  // PRODUCTS
  '<div class="products" style="background:#f5f8f5;padding:40px;border-bottom:2px solid #e4ebe6;">' +
  '<div class="section-eyebrow" style="font-size:11px;font-weight:700;letter-spacing:3px;color:#8aab96;text-transform:uppercase;margin-bottom:8px;">Tu oferta</div>' +
  '<div class="section-title" style="font-size:26px;font-weight:800;color:#1c2b22;margin-bottom:6px;">Delta Pro 3 + 4 Paneles 100W</div>' +
  '<div class="section-sub" style="font-size:14px;color:#7a9986;margin-bottom:22px;line-height:1.6;">Sistema completo de backup solar. Se carga de d&#xED;a con el sol y te da energ&#xED;a cuando hay apag&#xF3;n.</div>' +
  '<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
  '<td width="48%" valign="top" style="background:#fff;border:1.5px solid #e2ebe6;border-radius:16px;overflow:hidden;">' +
  '<div style="background:#1c2b22;text-align:center;padding:16px;height:170px;"><img src="https://i.postimg.cc/7P9gP93q/Delta-Pro3-frente.webp" alt="Delta Pro 3" style="height:140px;object-fit:contain;"/></div>' +
  '<div style="padding:18px;"><div style="font-size:18px;font-weight:800;color:#1c2b22;margin-bottom:5px;">Delta Pro 3</div><div style="font-size:12px;color:#7a9986;line-height:1.65;">4kWh de capacidad. Carga r&#xE1;pida. App integrada.</div>' +
  '<div style="display:inline-block;background:#f0faf4;border:1px solid #b7dfca;color:#2d6a4f;font-size:11px;font-weight:700;letter-spacing:1px;padding:3px 8px;border-radius:4px;margin-top:10px;">BACKUP COMPLETO</div></div></td>' +
  '<td width="4%"></td>' +
  '<td width="48%" valign="top" style="background:#fff;border:1.5px solid #e2ebe6;border-radius:16px;overflow:hidden;">' +
  '<div style="background:#1c2b22;text-align:center;padding:16px;height:170px;"><img src="https://i.postimg.cc/nztvrwSh/rigidpanel.png" alt="Panel Solar" style="height:140px;object-fit:contain;"/></div>' +
  '<div style="padding:18px;"><div style="font-size:18px;font-weight:800;color:#1c2b22;margin-bottom:5px;">4x Panel R&#xED;gido 100W</div><div style="font-size:12px;color:#7a9986;line-height:1.65;">Paneles de alta eficiencia para carga solar directa.</div>' +
  '<div style="display:inline-block;background:#f0faf4;border:1px solid #b7dfca;color:#2d6a4f;font-size:11px;font-weight:700;letter-spacing:1px;padding:3px 8px;border-radius:4px;margin-top:10px;">GRATIS CON COMPRA</div></div></td>' +
  '</tr></table>' +

  // BUNDLE
  '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;"><tr><td>' +
  '<div style="background:#1c2b22;border-radius:14px;padding:22px 24px;">' +
  '<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
  '<td><div style="font-size:18px;font-weight:800;color:#40c472;letter-spacing:1px;margin-bottom:4px;">&#x1F50B; OFERTA ESPECIAL</div>' +
  '<div style="font-size:13px;color:#5e8f6e;line-height:1.5;">Placas solares GRATIS al comprar Delta Pro 3. Garant&#xED;a y servicio local.</div></td>' +
  '<td align="right"><a href="tel:7876281344" style="background:#40c472;color:#0f1f14;font-size:14px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:12px 22px;border-radius:8px;text-decoration:none;display:inline-block;">LLAMAR AHORA</a></td>' +
  '</tr></table></div></td></tr></table></div>' +

  // CTA
  '<div class="cta-block" style="background:#fff;padding:40px;text-align:center;border-bottom:2px solid #e4ebe6;">' +
  '<p style="font-size:15px;color:#7a9986;margin-bottom:22px;line-height:1.6;">' + nombre + ', estamos listos para ayudarte a proteger tu hogar con energ&#xED;a limpia y confiable.</p>' +
  '<a href="tel:7876281344" class="main-cta" style="display:inline-block;background:#1c2b22;color:#ffffff;font-size:16px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:16px 44px;border-radius:10px;text-decoration:none;">&#x1F4DE; 787-628-1344</a>' +
  '</div>' +

  // FOOTER
  '<div class="footer" style="background:#e8ebe5;border-radius:0 0 20px 20px;padding:28px 40px;text-align:center;">' +
  '<div class="footer-logo" style="font-size:15px;font-weight:700;letter-spacing:4px;color:#8aab96;margin-bottom:12px;">ECOFLOW PR</div>' +
  '<div style="margin-bottom:12px;">' +
  '<a href="https://ecoflowpr.vercel.app" style="font-size:12px;color:#8aab96;text-decoration:none;margin:0 10px;">Productos</a>' +
  '<a href="tel:7876281344" style="font-size:12px;color:#8aab96;text-decoration:none;margin:0 10px;">Contacto</a>' +
  '</div>' +
  '<div class="footer-small" style="font-size:11px;color:#a0b8a8;line-height:1.8;">Distribuidor Autorizado EcoFlow en Puerto Rico<br/>' +
  '<a href="https://ecoflowpr.vercel.app" style="color:#8aab96;text-decoration:none;">ecoflowpr.vercel.app</a> &#x2022; <a href="https://www.powersolarprr.com" style="color:#8aab96;text-decoration:none;">powersolarprr.com</a><br/><br/>' +
  'Este mensaje fue enviado porque solicitaste informaci&#xF3;n en nuestro sitio web.</div>' +
  '</div>' +

  '</div></body></html>';
}

// PLANTILLA 1: BIENVENIDA AUTOMÁTICA (POWER SOLAR)
function buildClientEmail(nombre) {
  return '<!DOCTYPE html>' +
  '<html lang="es" style="color-scheme:light only;">' +
  '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">' +
  '<style>' +
  '*{margin:0;padding:0;box-sizing:border-box;}' +
  'body{background:#f0f4ff !important;font-family:Arial,sans-serif;color:#040D2B !important;}' +
  '.wrap{max-width:600px;margin:0 auto;padding:32px 16px;}' +
  '.card{background:#ffffff !important;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(4,51,196,0.12);}' +
  '.header{background:#0433C4 !important;padding:48px 40px 40px;text-align:center;}' +
  '.header-badge{display:inline-block;background:rgba(245,166,35,0.2);border:1px solid rgba(245,166,35,0.5);color:#F5A623 !important;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:6px 16px;border-radius:4px;margin-bottom:16px;}' +
  '.header h1{color:#ffffff !important;font-family:Arial,sans-serif;font-weight:900;font-size:24px;line-height:1.3;}' +
  '.header h1 span{color:#F5A623 !important;}' +
  '.sun-divider{width:100%;height:4px;background:linear-gradient(90deg,#0433C4,#FF7A00,#F5A623);}' +
  '.body{padding:44px 40px;background:#ffffff !important;}' +
  '.greeting{font-size:18px;font-weight:600;color:#040D2B !important;margin-bottom:16px;}' +
  '.greeting span{color:#0433C4 !important;}' +
  '.message{font-size:15px;color:#4A5568 !important;line-height:1.8;margin-bottom:32px;}' +
  '.highlight-box{background:#f0f4ff !important;border-left:4px solid #FF7A00;border-radius:0 12px 12px 0;padding:20px 24px;margin-bottom:32px;}' +
  '.highlight-box p{font-size:14px;color:#040D2B !important;line-height:1.7;}' +
  '.highlight-box strong{color:#FF7A00 !important;}' +
  '.steps{margin-bottom:36px;}' +
  '.step{margin-bottom:20px;overflow:hidden;}' +
  '.step-num{width:36px;height:36px;background:#0433C4 !important;color:#ffffff !important;border-radius:50%;display:inline-block;line-height:36px;text-align:center;font-family:Arial,sans-serif;font-weight:900;font-size:14px;float:left;margin-right:14px;}' +
  '.step-text{overflow:hidden;font-size:14px;color:#4A5568 !important;line-height:1.6;padding-top:4px;}' +
  '.step-text strong{color:#040D2B !important;display:block;margin-bottom:2px;}' +
  '.cta-box{background:#FF7A00 !important;border-radius:16px;padding:32px;text-align:center;margin-bottom:32px;}' +
  '.cta-box p{color:#ffffff !important;font-size:14px;margin-bottom:16px;line-height:1.6;}' +
  '.cta-btn{display:inline-block;background:#ffffff !important;color:#FF7A00 !important;font-family:Arial,sans-serif;font-weight:900;font-size:14px;letter-spacing:1px;text-transform:uppercase;padding:14px 32px;border-radius:8px;text-decoration:none;}' +
  '.footer{background:#040D2B !important;padding:32px 40px;text-align:center;}' +
  '.footer p{color:rgba(255,255,255,0.5) !important;font-size:12px;line-height:1.7;}' +
  '.footer a{color:#FF7A00 !important;text-decoration:none;}' +
  '@media(max-width:600px){.body,.header{padding:32px 24px;}.footer{padding:24px;}}' +
  '</style></head>' +
  '<body style="background:#f0f4ff;color:#040D2B;font-family:Arial,sans-serif;">' +
  '<div class="wrap"><div class="card">' +
  '<div class="header" style="background:#0433C4;padding:48px 40px 40px;text-align:center;">' +
  '<img src="https://i.imgur.com/EwYIhQU.gif" width="180" style="display:block;margin:0 auto 24px;width:180px;height:auto;" alt="Power Solar">' +
  '<div class="header-badge" style="display:inline-block;background:rgba(245,166,35,0.2);border:1px solid rgba(245,166,35,0.5);color:#F5A623;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:6px 16px;border-radius:4px;margin-bottom:16px;">&#x2600;&#xFE0F; CONFIRMACIÓN DE SOLICITUD</div>' +
  '<h1 style="color:#ffffff;font-family:Arial,sans-serif;font-weight:900;font-size:24px;line-height:1.3;">¡Tu consulta fue<br><span style="color:#F5A623;">recibida exitosamente!</span></h1>' +
  '</div><div class="sun-divider" style="width:100%;height:4px;background:linear-gradient(90deg,#0433C4,#FF7A00,#F5A623);"></div>' +
  '<div class="body" style="padding:44px 40px;background:#ffffff;">' +
  '<p class="greeting" style="font-size:18px;font-weight:600;color:#040D2B;margin-bottom:16px;">Hola, <span style="color:#0433C4;">' + nombre + '</span> &#x1F44B;</p>' +
  '<p class="message" style="font-size:15px;color:#4A5568;line-height:1.8;margin-bottom:32px;">Hemos recibido tu solicitud de orientación y cotización gratis. Un consultor energético de Power Solar se estará comunicando contigo en breve.</p>' +
  '<div class="highlight-box" style="background:#f0f4ff;border-left:4px solid #FF7A00;border-radius:0 12px 12px 0;padding:20px 24px;margin-bottom:32px;">' +
  '<p style="font-size:14px;color:#040D2B;line-height:1.7;">Si prefieres que te contactemos en una <strong style="color:#FF7A00;">hora específica</strong>, responde a este email indicándonos el mejor momento y lo coordinaremos para ti.</p>' +
  '</div>' +
  '<div class="steps" style="margin-bottom:36px;">' +
  '<div style="margin-bottom:20px;overflow:hidden;"><div style="width:36px;height:36px;background:#0433C4;color:#ffffff;border-radius:50%;display:inline-block;line-height:36px;text-align:center;font-weight:900;font-size:14px;float:left;margin-right:14px;">1</div><div style="overflow:hidden;font-size:14px;color:#4A5568;line-height:1.6;padding-top:4px;"><strong style="color:#040D2B;display:block;margin-bottom:2px;">Orientación Gratis</strong>Evaluamos tu consumo y necesidades sin costo alguno.</div></div>' +
  '<div style="margin-bottom:20px;overflow:hidden;"><div style="width:36px;height:36px;background:#0433C4;color:#ffffff;border-radius:50%;display:inline-block;line-height:36px;text-align:center;font-weight:900;font-size:14px;float:left;margin-right:14px;">2</div><div style="overflow:hidden;font-size:14px;color:#4A5568;line-height:1.6;padding-top:4px;"><strong style="color:#040D2B;display:block;margin-bottom:2px;">Cotización Personalizada</strong>Te presentamos la mejor opción para tu hogar.</div></div>' +
  '<div style="margin-bottom:20px;overflow:hidden;"><div style="width:36px;height:36px;background:#0433C4;color:#ffffff;border-radius:50%;display:inline-block;line-height:36px;text-align:center;font-weight:900;font-size:14px;float:left;margin-right:14px;">3</div><div style="overflow:hidden;font-size:14px;color:#4A5568;line-height:1.6;padding-top:4px;"><strong style="color:#040D2B;display:block;margin-bottom:2px;">Instalación Rápida</strong>Instalamos en menos de 21 días con garantía total.</div></div>' +
  '</div>' +
  '<div class="cta-box" style="background:#FF7A00;border-radius:16px;padding:32px;text-align:center;margin-bottom:32px;">' +
  '<p style="color:#ffffff;font-size:14px;margin-bottom:16px;line-height:1.6;">¿Tienes preguntas? Llámanos directamente y con gusto te atendemos.</p>' +
  '<a href="tel:7876281344" style="display:inline-block;background:#ffffff;color:#FF7A00;font-family:Arial,sans-serif;font-weight:900;font-size:14px;letter-spacing:1px;text-transform:uppercase;padding:14px 32px;border-radius:8px;text-decoration:none;">&#x1F4DE; 787-628-1344</a>' +
  '</div></div>' +
  '<div class="footer" style="background:#040D2B;padding:32px 40px;text-align:center;">' +
  '<img src="https://i.imgur.com/PnXz7nZ.gif" width="120" style="display:block;margin:0 auto 16px;width:120px;height:auto;opacity:0.9;" alt="Power Solar">' +
  '<p style="color:rgba(255,255,255,0.5);font-size:12px;line-height:1.7;">Power Solar LLC · Puerto Rico<br>' +
  '<a href="https://www.powersolarprr.com" style="color:#FF7A00;text-decoration:none;">www.powersolarprr.com</a><br><br>Este mensaje fue enviado porque solicitaste información en nuestro sitio web.</p>' +
  '</div></div></div></body></html>';
}

// PLANTILLA 2: LEASING ORIGINAL
function buildLeasingEmail(nombre) {
  return '<!DOCTYPE html>' +
  '<html lang="es" style="color-scheme:light only;">' +
  '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">' +
  '<style>' +
  '*{margin:0;padding:0;box-sizing:border-box;}' +
  'body{background:#f0f4ff !important;font-family:Arial,sans-serif;color:#040D2B !important;}' +
  '.wrap{max-width:600px;margin:0 auto;padding:32px 16px;}' +
  '.card{background:#ffffff !important;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(4,51,196,0.12);}' +
  '.header{background:#0433C4 !important;padding:48px 40px 40px;text-align:center;}' +
  '.hero-img{width:100%;height:auto;display:block;border-bottom:4px solid #FF7A00;}' +
  '.body{padding:44px 40px;background:#ffffff !important;}' +
  '.greeting{font-size:22px;font-weight:900;color:#0433C4 !important;margin-bottom:20px;}' +
  '.message{font-size:16px;color:#4A5568 !important;line-height:1.7;margin-bottom:24px;}' +
  '.offer-box{background:#f8f9fc !important;border:2px solid #0433C4;border-radius:16px;padding:30px 24px;text-align:center;margin-bottom:32px;}' +
  '.offer-title{color:#FF7A00 !important;font-size:18px;font-weight:900;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;}' +
  '.offer-price{color:#0433C4 !important;font-size:42px;font-weight:900;margin-bottom:12px;line-height:1;}' +
  '.offer-price small{font-size:18px;color:#4A5568;font-weight:600;}' +
  '.offer-features{color:#040D2B !important;font-size:16px;font-weight:700;margin-top:16px;}' +
  '.cta-box{text-align:center;margin-bottom:16px;}' +
  '.cta-btn{display:inline-block;background:#FF7A00 !important;color:#ffffff !important;font-weight:900;font-size:16px;letter-spacing:1px;text-transform:uppercase;padding:16px 36px;border-radius:12px;text-decoration:none;box-shadow:0 10px 20px rgba(255,122,0,0.3);}' +
  '.footer{background:#040D2B !important;padding:32px 40px;text-align:center;}' +
  '.footer p{color:rgba(255,255,255,0.5) !important;font-size:12px;line-height:1.7;}' +
  '.footer a{color:#FF7A00 !important;text-decoration:none;}' +
  '</style></head>' +
  '<body style="background:#f0f4ff;color:#040D2B;font-family:Arial,sans-serif;">' +
  '<div class="wrap"><div class="card">' +
  '<div class="header" style="background:#0433C4;padding:48px 40px 40px;text-align:center;">' +
  '<img src="https://i.imgur.com/EwYIhQU.gif" width="180" style="display:block;margin:0 auto;width:180px;height:auto;" alt="Power Solar"></div>' +
  '<img src="https://i.imgur.com/dUTjacg.jpeg" class="hero-img" alt="Oferta"><div class="body">' +
  '<p class="greeting">¡Hola, ' + nombre + '! &#x1F44B;</p>' +
  '<p class="message">Sabemos que has estado buscando la mejor opción para blindar tu hogar contra los apagones y reducir tu factura de luz. En Power Solar queremos ayudarte a <strong>TOMAR CONTROL DE TU ENERGÍA</strong>.</p>' +
  '<p class="message">Te invitamos a aprovechar nuestro excepcional programa de <strong>leasing (alquiler de paneles solares)</strong> con Power Financial. Disfruta de energía limpia sin la necesidad de comprar el equipo.</p>' +
  '<div class="offer-box"><div class="offer-title">Llévate tu sistema con un</div><div class="offer-price"><small>PAGO FIJO desde</small><br>$176<br><small>mensuales</small></div><div class="offer-features">&#x2728; Incluye 25 AÑOS DE GARANTÍA &#x2728;</div></div>' +
  '<p class="message" style="text-align:center;">¡No esperes más! Esta es la forma más inteligente y accesible de proteger a tu familia.</p>' +
  '<div class="cta-box"><a href="tel:7876281344" class="cta-btn">&#x1F4DE; Llámanos Hoy: 787-628-1344</a></div></div>' +
  '<div class="footer" style="background:#040D2B;padding:32px 40px;text-align:center;">' +
  '<img src="https://i.imgur.com/PnXz7nZ.gif" width="120" style="display:block;margin:0 auto 16px;width:120px;height:auto;opacity:0.9;" alt="Power Solar">' +
  '<p style="color:rgba(255,255,255,0.5);font-size:12px;line-height:1.7;">Power Solar LLC & Power Financial · Puerto Rico<br>' +
  '<a href="https://www.powersolarprr.com" style="color:#FF7A00;text-decoration:none;">www.powersolarprr.com</a><br><br>Recibes este anuncio como suscriptor de las ofertas de Power Solar.</p>' +
  '</div></div></div></body></html>';
}

// PLANTILLA 3: NUEVA OFERTA EXPANSIÓN ($86)
function buildExpansionEmail(nombre) {
  return '<!DOCTYPE html>' +
  '<html lang="es" style="color-scheme:light only;">' +
  '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">' +
  '<style>' +
  '*{margin:0;padding:0;box-sizing:border-box;}' +
  'body{background:#f0f4ff !important;font-family:Arial,sans-serif;color:#040D2B !important;}' +
  '.wrap{max-width:600px;margin:0 auto;padding:32px 16px;}' +
  '.card{background:#ffffff !important;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(4,51,196,0.12);}' +
  '.header{background:#0433C4 !important;padding:48px 40px 40px;text-align:center;border-bottom:4px solid #FF7A00;}' +
  '.body{padding:44px 40px;background:#ffffff !important;}' +
  '.greeting{font-size:22px;font-weight:900;color:#0433C4 !important;margin-bottom:20px;}' +
  '.message{font-size:16px;color:#4A5568 !important;line-height:1.7;margin-bottom:20px;}' +
  '.bold-blue{color:#0433C4 !important;font-weight:900;}' +
  '.list-box{background:#f8f9fc !important;border-radius:12px;padding:24px;margin-bottom:32px;}' +
  '.list-box ul{list-style:none;}' +
  '.list-box li{font-size:15px;color:#040D2B !important;margin-bottom:12px;padding-left:24px;position:relative;font-weight:600;}' +
  '.list-box li:before{content:"\\2714";color:#FF7A00 !important;position:absolute;left:0;font-size:18px;}' +
  '.alert-box{text-align:center;padding:16px;background:rgba(255,122,0,0.1) !important;border-radius:12px;margin-bottom:32px;color:#FF7A00 !important;font-weight:900;font-size:16px;letter-spacing:1px;}' +
  '.offer-box{background:#ffffff !important;border:3px dashed #0433C4;border-radius:16px;padding:30px 24px;text-align:center;margin-bottom:32px;}' +
  '.offer-title{color:#FF7A00 !important;font-size:18px;font-weight:900;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;}' +
  '.offer-price{color:#0433C4 !important;font-size:48px;font-weight:900;margin-bottom:12px;line-height:1;}' +
  '.offer-price small{font-size:18px;color:#4A5568 !important;font-weight:600;}' +
  '.features-grid{text-align:left;margin-top:20px;}' +
  '.feature-item{margin-bottom:10px;font-size:14px;color:#4A5568 !important;}' +
  '.cta-box{text-align:center;margin-bottom:16px;}' +
  '.cta-btn{display:inline-block;background:#FF7A00 !important;color:#ffffff !important;font-weight:900;font-size:16px;letter-spacing:1px;text-transform:uppercase;padding:18px 40px;border-radius:12px;text-decoration:none;box-shadow:0 10px 20px rgba(255,122,0,0.3);}' +
  '.footer{background:#040D2B !important;padding:32px 40px;text-align:center;}' +
  '.footer p{color:rgba(255,255,255,0.5) !important;font-size:12px;line-height:1.7;}' +
  '.footer a{color:#FF7A00 !important;text-decoration:none;}' +
  '</style></head>' +
  '<body style="background:#f0f4ff;color:#040D2B;font-family:Arial,sans-serif;">' +
  '<div class="wrap"><div class="card">' +
  '<div class="header" style="background:#0433C4;padding:48px 40px 40px;text-align:center;">' +
  '<img src="https://i.imgur.com/EwYIhQU.gif" width="180" style="display:block;margin:0 auto;width:180px;height:auto;" alt="Power Solar"></div>' +
  '<div class="body"><p class="greeting">¡Hola, ' + nombre + '! &#x1F44B;</p>' +
  '<p class="message">Sabemos que ya diste el paso inteligente de instalar paneles solares… pero también sabemos que muchas veces <strong class="bold-blue">el sistema se queda corto</strong>.</p>' +
  '<p class="message">Tal vez tu consumo aumentó, estás pensando en añadir equipos como aires o hasta un carro eléctrico, o simplemente tu sistema actual no está cubriendo el 100% de tu factura.</p>' +
  '<p class="message" style="text-align:center;font-size:18px;"><strong class="bold-blue">&#x26A1; OPTIMIZAR Y EXPANDIR TU SISTEMA SOLAR &#x26A1;</strong></p>' +
  '<p class="message">Hoy puedes añadir más paneles sin complicaciones, sin tener que reemplazar todo tu sistema ni hacer una inversión gigante.</p>' +
  '<div class="list-box"><p style="color:#0433C4;font-weight:900;margin-bottom:16px;">&#x1F4A1; Con nuestro programa exclusivo puedes:</p>' +
  '<ul><li>Expandir tu sistema actual</li><li>Reducir aún más tu factura</li><li>Prepararte para mayor consumo futuro</li><li>Tener estabilidad energética real</li></ul></div>' +
  '<div class="alert-box">&#x1F680; DILE ADIÓS A LOS 25 AÑOS &#x274C;</div>' +
  '<div class="offer-box"><div class="offer-title">Expansión con un plan inteligente:</div>' +
  '<div class="offer-price"><small>PAGO FIJO desde</small><br>$86<br><small>mensuales</small></div>' +
  '<div class="features-grid"><div class="feature-item">&#x2728; <strong>Incluye 15 AÑOS</strong> de garantía + seguro</div><div class="feature-item">&#x2728; Sin necesidad de comprar el sistema completo</div><div class="feature-item">&#x2728; Instalación profesional adaptada a tu sistema actual</div></div></div>' +
  '<p class="message" style="text-align:center;font-weight:700;">Esto no es empezar de cero…<br>Es mejorar lo que ya tienes y sacarle el máximo provecho.</p>' +
  '<p class="message" style="text-align:center;color:#FF7A00;font-weight:900;">¡No sigas pagando de más por energía que podrías estar produciendo!</p>' +
  '<div class="cta-box"><a href="tel:7876281344" class="cta-btn">&#x1F4DE; LLÁMANOS HOY: 787-628-1344</a></div></div>' +
  '<div class="footer" style="background:#040D2B;padding:32px 40px;text-align:center;">' +
  '<img src="https://i.imgur.com/PnXz7nZ.gif" width="120" style="display:block;margin:0 auto 16px;width:120px;height:auto;opacity:0.9;" alt="Power Solar">' +
  '<p style="color:rgba(255,255,255,0.5);font-size:12px;line-height:1.7;">Power Solar LLC · Puerto Rico<br>' +
  '<a href="https://www.powersolarprr.com" style="color:#FF7A00;text-decoration:none;">www.powersolarprr.com</a><br><br>Recibes este anuncio como suscriptor de las ofertas de Power Solar.</p>' +
  '</div></div></div></body></html>';
}
