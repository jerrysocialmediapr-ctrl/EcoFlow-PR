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
    var bodyText;

    if (leadSource === "EcoFlow PR Website") {
      var productKey = data.product || data.Producto || "Delta Pro 3";
      htmlBody = buildEcoFlowEmail(row[1], productKey);
      subject = "Confirmación de solicitud EcoFlow PR";
      bodyText = "Hola " + row[1] + ", hemos recibido tu solicitud para EcoFlow. Un especialista se comunicará contigo pronto.";
    } else {
      htmlBody = buildClientEmail(row[1]);
      subject = "Recibimos tu solicitud — Power Solar";
      bodyText = "Hola " + row[1] + ", recibimos tu solicitud de orientación. Un consultor se contactará contigo pronto.";
    }

    GmailApp.sendEmail(row[3], subject, bodyText, {
      from: "info@powersolarprr.com",
      name: leadSource === "EcoFlow PR Website" ? "EcoFlow PR" : "Power Solar",
      htmlBody: htmlBody,
      replyTo: "info@powersolarprr.com"
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
    var bodyText;

    if (leadSource === "EcoFlow PR Website") {
      var productKey = data.product || data.Producto || "Delta Pro 3";
      htmlBody = buildEcoFlowEmail(row[1], productKey);
      subject = "Confirmación de solicitud EcoFlow PR";
      bodyText = "Hola " + row[1] + ", hemos recibido tu solicitud para EcoFlow. Un especialista se comunicará contigo pronto.";
    } else {
      htmlBody = buildClientEmail(row[1]);
      subject = "Recibimos tu solicitud — Power Solar";
      bodyText = "Hola " + row[1] + ", recibimos tu solicitud de orientación. Un consultor se contactará contigo pronto.";
    }

    GmailApp.sendEmail(row[3], subject, bodyText, {
      from: "info@powersolarprr.com",
      name: leadSource === "EcoFlow PR Website" ? "EcoFlow PR" : "Power Solar",
      htmlBody: htmlBody,
      replyTo: "info@powersolarprr.com"
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
      GmailApp.sendEmail(email, subject, "Hola " + nombre + ", mira esta nueva opción para tu hogar.", {
        from: "info@powersolarprr.com",
        name: "Power Solar",
        htmlBody: htmlBody,
        replyTo: "info@powersolarprr.com"
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
function buildEcoFlowEmail(nombre, productKey) {
  var products = {
    "Delta Pro 3": {
      name: "Delta Pro 3",
      tag: "4kWh • Carga Ultra-rápida",
      img: "https://i.postimg.cc/7P9gP93q/Delta-Pro3-frente.webp",
      desc: "4kWh de capacidad. Carga rápida. App integrada.",
      panels: "4x Panel Rígido 100W",
      panelImg: "https://i.postimg.cc/nztvrwSh/rigidpanel.png",
      panelDesc: "4 paneles de alta eficiencia para carga solar directa.",
      badge: "RESPALDO COMPLETO"
    },
    "Delta 2 Max": {
      name: "Delta 2 Max",
      tag: "2kWh • Portable & Potente",
      img: "https://i.postimg.cc/7P9gP93q/Delta-Pro3-frente.webp", 
      desc: "2kWh de capacidad. Ideal para apartamentos y backup móvil.",
      panels: "2x Panel Rígido 100W",
      panelImg: "https://i.postimg.cc/nztvrwSh/rigidpanel.png",
      panelDesc: "2 paneles para mantenerte cargado de día.",
      badge: "MÁXIMA PORTABILIDAD"
    }
  };

  var p = products[productKey] || products["Delta Pro 3"];

  return '<!DOCTYPE html>' +
  '<html lang="es">' +
  '<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>' +
  '<title>EcoFlow PR</title>' +
  '<style>' +
  '* { margin:0; padding:0; box-sizing:border-box; }' +
  'body { background: #F6F9F7; font-family: Arial, sans-serif; color: #1a1a1a; padding: 20px 10px; }' +
  '.email-wrap { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }' +
  '.header { background: #ffffff; padding: 20px 30px; display: table; width: 100%; border-bottom: 1px solid #f0f0f0; }' +
  '.header-left { display: table-cell; vertical-align: middle; }' +
  '.header-right { display: table-cell; vertical-align: middle; text-align: right; }' +
  '.logo-text { font-size: 18px; font-weight: 900; letter-spacing: 2px; color: #1c2b22; display: inline-block; vertical-align: middle; }' +
  '.pr-tag { background: #1c2b22; color: #40c472; font-size: 9px; font-weight: 800; letter-spacing: 1px; padding: 3px 8px; border-radius: 4px; margin-left: 8px; display: inline-block; vertical-align: middle; }' +
  '.status-pill { display: inline-block; background: #f0faf4; border: 1px solid #a8d9bc; border-radius: 100px; padding: 5px 12px; font-size: 10px; font-weight: 700; color: #2d6a4f; text-transform: uppercase; letter-spacing: 1px; }' +
  '.hero { background: #1c2b22; padding: 40px 30px; color: #ffffff; text-align: left; }' +
  '.hero-eyebrow { font-size: 10px; font-weight: 700; color: #40c472; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }' +
  '.hero h1 { font-size: 32px; font-weight: 800; line-height: 1.1; margin-bottom: 12px; }' +
  '.hero p { font-size: 15px; color: #8fb09e; line-height: 1.6; max-width: 450px; }' +
  '.appliances { padding: 35px 30px; background: #ffffff; }' +
  '.section-eyebrow { font-size: 9px; font-weight: 700; color: #8aab96; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }' +
  '.section-title { font-size: 22px; font-weight: 800; color: #1c2b22; margin-bottom: 5px; }' +
  '.section-sub { font-size: 13px; color: #7a9986; margin-bottom: 20px; line-height: 1.5; }' +
  '.appliance-grid { width: 100%; border-spacing: 6px; border-collapse: separate; margin: 0 -6px; }' +
  '.appliance-card { background: #f5f9f6; border: 1px solid #e8f3ec; border-radius: 14px; padding: 18px 8px; text-align: center; width: 25%; }' +
  '.app-icon { width: 28px; height: 28px; display: block; margin: 0 auto 8px; }' +
  '.app-name { font-size: 13px; font-weight: 700; color: #1c2b22; margin-bottom: 4px; }' +
  '.app-watts { font-size: 10px; color: #8aab96; font-weight: 500; }' +
  '.products-section { padding: 35px 30px; background: #f9fbf9; border-top: 1px solid #f0f0f0; }' +
  '.product-grid { width: 100%; border-spacing: 10px; border-collapse: separate; margin: 0 -10px; }' +
  '.product-card { background: #ffffff; border: 1px solid #eef2ef; border-radius: 16px; overflow: hidden; width: 50%; vertical-align: top; }' +
  '.prod-img-wrap { background: #1c2b22; padding: 15px; text-align: center; height: 140px; }' +
  '.prod-img { max-height: 110px; max-width: 100%; object-fit: contain; }' +
  '.prod-info { padding: 15px; }' +
  '.prod-name { font-size: 16px; font-weight: 800; color: #1c2b22; margin-bottom: 5px; }' +
  '.prod-desc { font-size: 11px; color: #7a9986; line-height: 1.5; margin-bottom: 10px; }' +
  '.prod-badge { display: inline-block; background: #f0faf4; color: #2d6a4f; font-size: 9px; font-weight: 800; padding: 3px 7px; border-radius: 4px; text-transform: uppercase; }' +
  '.bundle-bar { margin-top: 20px; background: #1c2b22; border-radius: 14px; padding: 18px 20px; color: #ffffff; display: table; width: 100%; }' +
  '.bundle-text { display: table-cell; vertical-align: middle; }' +
  '.bundle-cta { display: table-cell; vertical-align: middle; text-align: right; }' +
  '.bundle-btn { background: #40c472; color: #0f1f14; font-size: 12px; font-weight: 800; padding: 8px 16px; border-radius: 6px; text-decoration: none; text-transform: uppercase; }' +
  '.footer { padding: 35px 30px; text-align: center; background: #ffffff; border-top: 1px solid #f0f0f0; }' +
  '.footer-logo { font-size: 13px; font-weight: 800; color: #8aab96; letter-spacing: 2px; margin-bottom: 12px; }' +
  '.footer-links a { font-size: 11px; color: #8aab96; text-decoration: none; margin: 0 10px; }' +
  '.footer-copy { font-size: 10px; color: #b0c4b8; margin-top: 15px; line-height: 1.6; }' +
  '.footer-copy a { color: #8aab96; text-decoration: none; }' +
  '</style></head>' +
  '<body>' +
  '<div class="email-wrap">' +
  '<!-- HEADER -->' +
  '<div class="header">' +
  '<div class="header-left"><span class="logo-text">ECOFLOW</span><span class="pr-tag">PUERTO RICO</span></div>' +
  '<div class="header-right"><div class="status-pill">Solicitud Entregada</div></div>' +
  '</div>' +
  '<!-- HERO -->' +
  '<div class="hero">' +
  '<div class="hero-eyebrow">Confirmación de recibo</div>' +
  '<h1>Hola, ' + nombre + '.<br/><span style="color:#40c472;">Tranquilo.</span></h1>' +
  '<p>Recibimos tu solicitud para el <strong>' + p.name + '</strong>. Un especialista local se contactará pronto para coordinar los detalles de tu equipo y paneles incluidos.</p>' +
  '</div>' +
  '<!-- APPLIANCES -->' +
  '<div class="appliances">' +
  '<div class="section-eyebrow">Uso sugerido</div>' +
  '<div class="section-title">Energía siempre disponible</div>' +
  '<div class="section-sub">Con EcoFlow mantienes lo esencial funcionando siempre.</div>' +
  '<table class="appliance-grid">' +
  '<tr>' +
  '<td class="appliance-card"><img src="https://img.icons8.com/ios/100/1c2b22/fan.png" class="app-icon" alt="Abanico"><div class="app-name">Abanico</div><div class="app-watts">~50W</div></td>' +
  '<td class="appliance-card"><img src="https://img.icons8.com/ios/100/1c2b22/fridge.png" class="app-icon" alt="Nevera"><div class="app-name">Nevera</div><div class="app-watts">~150W</div></td>' +
  '<td class="appliance-card"><img src="https://img.icons8.com/ios/100/1c2b22/monitor.png" class="app-icon" alt="TV"><div class="app-name">Televisor</div><div class="app-watts">~80W</div></td>' +
  '<td class="appliance-card"><img src="https://img.icons8.com/ios/100/1c2b22/idea.png" class="app-icon" alt="Luces"><div class="app-name">Luces</div><div class="app-watts">~30W</div></td>' +
  '</tr>' +
  '</table>' +
  '</div>' +
  '<!-- PRODUCTS -->' +
  '<div class="products-section">' +
  '<div class="section-eyebrow">Tu selección</div>' +
  '<div class="section-title">' + p.name + ' + Paneles Solar</div>' +
  '<div class="section-sub">La combinación para autonomía total en Puerto Rico.</div>' +
  '<table class="product-grid">' +
  '<tr>' +
  '<td class="product-card">' +
  '<div class="prod-img-wrap"><img src="' + p.img + '" class="prod-img" alt="' + p.name + '"></div>' +
  '<div class="prod-info"><div class="prod-name">' + p.name + '</div><div class="prod-desc">' + p.desc + '</div><div class="prod-badge">' + p.badge + '</div></div>' +
  '</td>' +
  '<td class="product-card">' +
  '<div class="prod-img-wrap"><img src="' + p.panelImg + '" class="prod-img" alt="Paneles Solares"></div>' +
  '<div class="prod-info"><div class="prod-name">' + p.panels + '</div><div class="prod-desc">' + p.panelDesc + '</div><div class="prod-badge">INCLUIDO EN ESTE BUNDLE</div></div>' +
  '</td>' +
  '</tr>' +
  '</table>' +
  '<div class="bundle-bar">' +
  '<div class="bundle-text"><div style="font-size:15px;font-weight:800;color:#40c472;margin-bottom:2px;">Garantía Local</div><div style="font-size:11px;color:#8fb09e;">Válido en Puerto Rico. Servicio y soporte directo.</div></div>' +
  '<div class="bundle-cta"><a href="tel:7876281344" class="bundle-btn">Contactar ahora</a></div>' +
  '</div>' +
  '</div>' +
  '<!-- FOOTER -->' +
  '<div class="footer">' +
  '<div class="footer-logo">ECOFLOW PUERTO RICO</div>' +
  '<div class="footer-links"><a href="https://ecoflowpr.vercel.app">Sitio Web</a><a href="tel:7876281344">Ventas: 787-628-1344</a></div>' +
  '<div class="footer-copy">Distribuido por Power Solar. Este correo fue enviado tras tu solicitud en ecoflowpr.com.<br/>© 2024 EcoFlow PR • <a href="https://www.powersolarprr.com">Power Solar LLC</a></div>' +
  '</div>' +
  '</div></body></html>';
}

function buildClientEmail(nombre) {
  return '<!DOCTYPE html>' +
  '<html lang="es">' +
  '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<style>' +
  '*{margin:0;padding:0;box-sizing:border-box;}' +
  'body{background:#f0f4ff;font-family:Arial,sans-serif;color:#040D2B;}' +
  '.wrap{max-width:600px;margin:0 auto;padding:32px 16px;}' +
  '.card{background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(4,51,196,0.12);}' +
  '.header{background:#0433C4;padding:48px 40px 40px;text-align:center;}' +
  '.header h1{color:#ffffff;font-family:Arial,sans-serif;font-weight:900;font-size:24px;line-height:1.3;}' +
  '.sun-divider{width:100%;height:4px;background:linear-gradient(90deg,#0433C4,#FF7A00,#F5A623);}' +
  '.body{padding:44px 40px;background:#ffffff;}' +
  '.greeting{font-size:18px;font-weight:600;color:#040D2B;margin-bottom:16px;}' +
  '.message{font-size:15px;color:#4A5568;line-height:1.8;margin-bottom:32px;}' +
  '.highlight-box{background:#f0f4ff;border-left:4px solid #FF7A00;border-radius:0 12px 12px 0;padding:20px 24px;margin-bottom:32px;}' +
  '.cta-box{background:#FF7A00;border-radius:16px;padding:32px;text-align:center;margin-bottom:32px;}' +
  '.cta-btn{display:inline-block;background:#ffffff;color:#FF7A00;font-weight:900;font-size:14px;letter-spacing:1px;text-transform:uppercase;padding:14px 32px;border-radius:8px;text-decoration:none;}' +
  '.footer{background:#040D2B;padding:32px 40px;text-align:center;}' +
  '.footer p{color:rgba(255,255,255,0.5);font-size:12px;}' +
  '</style></head>' +
  '<body><div class="wrap"><div class="card">' +
  '<div class="header"><h1>Confirmación de Solicitud</h1></div>' +
  '<div class="sun-divider"></div>' +
  '<div class="body">' +
  '<p class="greeting">Hola, ' + nombre + '</p>' +
  '<p class="message">Hemos recibido tu solicitud de orientación. Un consultor energético de Power Solar se contactará contigo pronto para darte todos los detalles.</p>' +
  '<div class="highlight-box"><p>Si prefieres una hora específica para la llamada, puedes responder a este correo indicándonos el mejor momento.</p></div>' +
  '<div class="cta-box"><p style="color:#ffffff;margin-bottom:16px;">¿Tienes preguntas inmediatas?</p><a href="tel:7876281344" class="cta-btn">Llamar: 787-628-1344</a></div>' +
  '</div><div class="footer"><p>Power Solar LLC · Puerto Rico<br>www.powersolarprr.com</p></div>' +
  '</div></div></body></html>';
}

function buildLeasingEmail(nombre) {
  return '<!DOCTYPE html>' +
  '<html lang="es">' +
  '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<style>body{font-family:Arial,sans-serif;padding:20px;background:#f8f9fc;color:#040D2B;}.offer-box{background:#ffffff;border:1px solid #0433C4;padding:30px;border-radius:12px;text-align:center;}.cta-btn{display:inline-block;background:#FF7A00;color:#ffffff;padding:15px 30px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:20px;}</style>' +
  '</head><body>' +
  '<div class="offer-box">' +
  '<h2>Hola ' + nombre + '</h2>' +
  '<p>Toma el control de tu energía con nuestro plan de leasing solar.</p>' +
  '<h1 style="color:#0433C4;">PAGO FIJO desde $176</h1>' +
  '<p>Incluye 25 años de garantía y servicio.</p>' +
  '<a href="tel:7876281344" class="cta-btn">Llamar ahora: 787-628-1344</a>' +
  '</div></body></html>';
}

function buildExpansionEmail(nombre) {
  return '<!DOCTYPE html>' +
  '<html lang="es">' +
  '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<style>body{font-family:Arial,sans-serif;padding:20px;background:#f8f9fc;color:#040D2B;}.offer-box{background:#ffffff;border:3px dashed #0433C4;padding:30px;border-radius:12px;text-align:center;}.cta-btn{display:inline-block;background:#FF7A00;color:#ffffff;padding:15px 30px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:20px;}</style>' +
  '</head><body>' +
  '<div class="offer-box">' +
  '<h2>Hola ' + nombre + '</h2>' +
  '<p>¿Tu sistema solar actual se queda corto? Expándelo hoy.</p>' +
  '<h1 style="color:#0433C4;">Planes desde $86 al mes</h1>' +
  '<p>Añade más potencia sin complicaciones.</p>' +
  '<a href="tel:7876281344" class="cta-btn">Llamar ahora: 787-628-1344</a>' +
  '</div></body></html>';
}
