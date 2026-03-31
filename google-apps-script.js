
// ==========================================
// POWER SOLAR CRM — GAS v4.1
// ==========================================
var CONFIG = {
  tokens: ["PS-CRM-2024-SECURE-TOKEN", "powersolar2025crm"],
  sheetName: "Leads",
  adminEmail: "jerrypowersolar@gmail.com",
  metaVerifyToken: "POWER_SOLAR_META_TOKEN",
  metaAllowedForms: [
    "3374663866016567", "1641507717089835", "914623447946183",
    "1257716839649949", "1348313943159684", "26273373445623902"
  ]
};
var LEAD_COLS = ["ID", "Fecha Creación", "Nombre", "Email", "Teléfono", "Pueblo", "Factura Mensual", "Estado", "Origen del Lead", "GCLID", "FBCLID", "Campaign ID", "Campaign Name", "Ad Set ID", "Ad Set Name", "Ad ID", "Ad Name", "Form ID", "Clasificación", "Anotaciones", "Email Enviado"];
var TIMELINE_COLS = ["ID", "Fecha", "Lead ID", "Lead Nombre", "Tipo", "Descripción", "Usuario"];
var CONTACT_COLS = ["ID", "Fecha", "Nombre", "Email", "Teléfono", "Pueblo", "Producto", "Modelo Batería", "Financiamiento", "Extra Battery Qty", "Transfer Switch", "Paneles Qty", "Paneles Wataje", "Precio Total", "Notas"];
var MEETING_COLS = ["ID", "Fecha Creación", "Título", "Nombre", "Teléfono", "Lugar de Reunión", "Ubicación", "Todo el Día", "Fecha Inicio", "Hora Inicio", "Fecha Fin", "Hora Fin", "Tipo", "Estado", "Evento Confirmado", "Lead Row", "Notas"];
var FIELD_MAPPING = { 'nombre': 'Nombre', 'Nombre': 'Nombre', 'name': 'Nombre', 'email': 'Email', 'Email': 'Email', 'telefono': 'Teléfono', 'Teléfono': 'Teléfono', 'phone': 'Teléfono', 'pueblo': 'Pueblo', 'Pueblo': 'Pueblo', 'town': 'Pueblo', 'city': 'Pueblo', 'municipio': 'Pueblo', 'factura': 'Factura Mensual', 'facturaMensual': 'Factura Mensual', 'monthlyBill': 'Factura Mensual', 'Factura Mensual': 'Factura Mensual', 'servicio': 'Factura Mensual', 'estado': 'Estado', 'Estado Lead': 'Estado', 'Estado': 'Estado', 'origen': 'Origen del Lead', 'leadSource': 'Origen del Lead', 'lead_source': 'Origen del Lead', 'Origen del Lead': 'Origen del Lead', 'anotaciones': 'Anotaciones', 'notes': 'Anotaciones', 'message': 'Anotaciones', 'Anotaciones': 'Anotaciones', 'gclid': 'GCLID', 'GCLID': 'GCLID', 'fbclid': 'FBCLID', 'FBCLID': 'FBCLID', 'campaign_id': 'Campaign ID', 'campaign_name': 'Campaign Name', 'adset_id': 'Ad Set ID', 'adset_name': 'Ad Set Name', 'ad_id': 'Ad ID', 'ad_name': 'Ad Name', 'form_id': 'Form ID', 'clasificacion': 'Clasificación', 'clasificación': 'Clasificación' };

function doGet(e) {
  try {
    e = e || { parameter: {} };
    var params = e.parameter || {};
    var token = params.token || "";
    var action = params.action || "";
    if (params["hub.mode"] === "subscribe" && params["hub.verify_token"] === CONFIG.metaVerifyToken) return ContentService.createTextOutput(params["hub.challenge"] || "");
    if (!token && !action) return handleExternalFormGet_(params);
    if (!validateToken_(token)) return jsonResponse_({ error: "Unauthorized" });
    var extra = {};
    if (params.data) { try { extra = JSON.parse(params.data); } catch (err) { return jsonResponse_({ error: "Invalid JSON in data param" }); } }
    switch (action) { case "health": return jsonResponse_({ status: "ok", method: "GET" }); case "getLeads": return getLeads_(); case "getMeetings": return getMeetings_(); case "getTimeline": return getTimeline_(extra); case "addLead": return addLead_(extra); case "updateLead": return updateLead_(extra); case "deleteLead": return deleteLead_(extra); case "convertLead": return convertLead_(extra); case "addNote": return addNote_(extra); case "addMeeting": return addMeeting_(extra); case "updateMeeting": return updateMeeting_(extra); case "deleteMeeting": return deleteMeeting_(extra); case "sendBlast": return sendBlastFromCRM_(extra); default: return jsonResponse_({ error: "Unknown action: " + action }); }
  } catch (err) { return jsonResponse_({ error: "doGet failed", message: err.message }); }
}

function doPost(e) {
  try {
    var postData = parsePostBody_(e);
    var params = (e && e.parameter) ? e.parameter : {};
    if (postData.object === "page" || postData.object === "leadgen") return handleMetaWebhook_(e);
    var token = postData.token || params.token || "";
    var action = postData.action || params.action || "";
    if (!token && !action) return handleExternalFormPost_(mergeObjects_(params, postData));
    if (!action && (postData.nombre || postData.name || params.nombre || params.name)) action = "addLead";
    if (!validateToken_(token)) return jsonResponse_({ error: "Unauthorized" });
    var payload = mergeObjects_(params, postData);
    switch (action) { case "health": return jsonResponse_({ status: "ok", method: "POST" }); case "addLead": return addLead_(payload); case "updateLead": return updateLead_(payload); case "deleteLead": return deleteLead_(payload); case "convertLead": return convertLead_(payload); case "addNote": return addNote_(payload); case "addMeeting": return addMeeting_(payload); case "updateMeeting": return updateMeeting_(payload); case "deleteMeeting": return deleteMeeting_(payload); case "sendBlast": return sendBlastFromCRM_(payload); default: return jsonResponse_({ error: "Unknown action: " + action }); }
  } catch (err) { return jsonResponse_({ error: "doPost failed", message: err.message }); }
}

function handleMetaWebhook_(e) {
  try {
    var body = parsePostBody_(e);
    var entries = body.entry || [];
    for (var i = 0; i < entries.length; i++) {
      var changes = entries[i].changes || [];
      for (var j = 0; j < changes.length; j++) {
        var change = changes[j] || {};
        var changeField = change.field || "";
        var value = change.value || {};
        if (changeField && changeField !== "leadgen" && changeField !== "leadgen_update") continue;
        var formId = String(value.form_id || "");
        var leadgenId = String(value.leadgen_id || "");
        if (CONFIG.metaAllowedForms.indexOf(formId) === -1) { Logger.log("Lead ignorado. Formulario no permitido: " + formId); continue; }
        var campaignId = String(value.campaign_id || "");
        var campaignName = String(value.campaign_name || "");
        var adsetId = String(value.adgroup_id || value.adset_id || "");
        var adsetName = String(value.adgroup_name || value.adset_name || "");
        var adId = String(value.ad_id || "");
        var adName = String(value.ad_name || "Meta Ads");
        var leadData = value.field_data || [];
        if (!leadData || !leadData.length) { Logger.log("Lead sin field_data. Form ID: " + formId); continue; }
        var lead = {};
        for (var k = 0; k < leadData.length; k++) lead[leadData[k].name] = leadData[k].values ? leadData[k].values[0] : "";
        var esEcoFlow = campaignName.toLowerCase().indexOf("ecoflow") !== -1 || adName.toLowerCase().indexOf("ecoflow") !== -1 || formId.toLowerCase().indexOf("ecoflow") !== -1;
        var factura = lead["monthly_bill"] || lead["factura"] || lead["servicio"] || "";
        var pueblo = lead["city"] || lead["pueblo"] || lead["municipio"] || "";
        var clasificacion = clasificarLeadMeta_(formId, adName, campaignName, factura, pueblo);
        var payload = { nombre: lead["full_name"] || lead["nombre"] || lead["name"] || "", email: lead["email"] || "", telefono: lead["phone_number"] || lead["telefono"] || lead["phone"] || "", pueblo: pueblo, factura: factura, estado: "Nuevo", origen: esEcoFlow ? "EcoFlow PR Website" : "Meta Ads — " + adName, fbclid: leadgenId || "", campaign_id: campaignId, campaign_name: campaignName, adset_id: adsetId, adset_name: adsetName, ad_id: adId, ad_name: adName, form_id: formId, clasificacion: clasificacion, anotaciones: "Meta Lead Ads | Form ID: " + formId + " | Leadgen ID: " + leadgenId + " | Campaign: " + campaignName + " | Ad: " + adName + " | Clasificación: " + clasificacion };
        addLead_(payload);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "ok" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) { Logger.log("Meta webhook error: " + err.message); return ContentService.createTextOutput(JSON.stringify({ error: err.message })).setMimeType(ContentService.MimeType.JSON); }
}

function clasificarLeadMeta_(formId, adName, campaignName, factura, pueblo) {
  var all = [adName, campaignName, factura, pueblo, formId].join(" | ").toLowerCase();
  if (all.indexOf("ecoflow") !== -1) return "EcoFlow";
  if (all.indexOf("bateria") !== -1 || all.indexOf("tesla") !== -1 || all.indexOf("powerwall") !== -1) return "Batería";
  if (all.indexOf("doble factura") !== -1 || all.indexOf("expansion") !== -1 || all.indexOf("expansión") !== -1) return "Expansión Solar";
  if (all.indexOf("flexi pay") !== -1 || all.indexOf("financ") !== -1) return "Financiamiento";
  if (all.indexOf("reclut") !== -1) return "Reclutamiento";
  var bill = String(factura || "").toLowerCase();
  if (bill.indexOf("600") !== -1) return "Lead Alto Consumo";
  if (bill.indexOf("400") !== -1) return "Lead Consumo Medio-Alto";
  if (bill.indexOf("250") !== -1 || bill.indexOf("150") !== -1) return "Lead Consumo Medio";
  return "Solar General";
}

function handleExternalFormGet_(data) { return processExternalLead_(data || {}); }
function handleExternalFormPost_(data) { return processExternalLead_(data || {}); }

function processExternalLead_(data) {
  try {
    var ss = getSpreadsheet_();
    var sheet = getOrCreateSheet_(ss, "Leads", LEAD_COLS);
    var nombre = pickFirst_(data, ["name", "nombre", "Nombre", "full_name"]);
    var telefono = pickFirst_(data, ["phone", "telefono", "Telefono", "telephone", "mobile"]);
    var email = pickFirst_(data, ["email", "Email"]);
    var pueblo = pickFirst_(data, ["town", "municipio", "Municipio", "pueblo", "city"]);
    var factura = pickFirst_(data, ["monthlyBill", "servicio", "Servicio", "factura", "facturaMensual", "bill"]);
    var origen = pickFirst_(data, ["leadSource", "origen", "Origen del Lead", "source"]) || "Página Principal";
    var gclid = pickFirst_(data, ["gclid", "GCLID"]);
    var fbclid = pickFirst_(data, ["fbclid", "FBCLID"]);
    var notas = pickFirst_(data, ["message", "notes", "anotaciones"]);
    var clasif = pickFirst_(data, ["clasificacion", "Clasificación"]) || "Web Form";
    var producto = pickFirst_(data, ["product", "producto", "Producto"]);
    if (!producto) producto = pickFirst_(data, ["anotaciones", "notes", "message"]);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var isNewFormat = headers.indexOf("ID") !== -1;
    var newId = generateID_();
    if (isNewFormat) {
      var rowData = new Array(headers.length).fill("");
      var fieldData = { "ID": newId, "Fecha Creación": new Date(), "Nombre": nombre, "Email": email, "Teléfono": telefono, "Pueblo": pueblo, "Factura Mensual": factura, "Estado": "Nuevo", "Origen del Lead": origen, "GCLID": gclid, "FBCLID": fbclid, "Campaign ID": "", "Campaign Name": "", "Ad Set ID": "", "Ad Set Name": "", "Ad ID": "", "Ad Name": "", "Form ID": "", "Clasificación": clasif, "Anotaciones": notas, "Email Enviado": "NO" };
      for (var h in fieldData) { var idx = headers.indexOf(h); if (idx !== -1) rowData[idx] = fieldData[h]; }
      sheet.appendRow(rowData);
      var newRow = sheet.getLastRow();
      var emailIdx = headers.indexOf("Email Enviado");
      sendEmails_(nombre, email, telefono, pueblo, factura, origen, producto);
      if (emailIdx !== -1) sheet.getRange(newRow, emailIdx + 1).setValue("SÍ");
      addTimelineEvent_(newId, nombre, "Lead Creado", "Lead recibido desde " + origen, "Sistema");
    } else {
      sheet.appendRow([new Date(), nombre, telefono, email, pueblo, factura, origen]);
      sendEmails_(nombre, email, telefono, pueblo, factura, origen, producto);
    }
    return jsonResponse_({ result: "success" });
  } catch (err) { return jsonResponse_({ error: "processExternalLead failed", message: err.message }); }
}

function addNote_(data) {
  try {
    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName("Leads");
    if (!sheet) return jsonResponse_({ error: "Sheet Leads not found" });
    var row = parseInt(data.row || data._row, 10);
    var nota = data.nota || data.anotaciones || data.notes || data.descripcion || "";
    var usuario = data.usuario || data.user || "CRM";
    var leadId = data.lead_id || data.leadId || "";
    var leadNombre = data.nombre || data.leadNombre || "";
    if (!nota) return jsonResponse_({ error: "Nota vacía" });
    if (row >= 2) {
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var notaIdx = headers.indexOf("Anotaciones");
      if (notaIdx !== -1) {
        var existing = sheet.getRange(row, notaIdx + 1).getValue() || "";
        var timestamp = Utilities.formatDate(new Date(), "America/Puerto_Rico", "MM/dd/yyyy HH:mm");
        var newNota = existing ? existing + "\n---\n[" + timestamp + "] " + usuario + ": " + nota : "[" + timestamp + "] " + usuario + ": " + nota;
        sheet.getRange(row, notaIdx + 1).setValue(newNota);
      }
      if (!leadId) { var idIdx = headers.indexOf("ID"); if (idIdx !== -1) leadId = sheet.getRange(row, idIdx + 1).getValue() || ""; }
      if (!leadNombre) { var nombreIdx = headers.indexOf("Nombre"); if (nombreIdx !== -1) leadNombre = sheet.getRange(row, nombreIdx + 1).getValue() || ""; }
    }
    addTimelineEvent_(leadId, leadNombre, "Nota Agregada", nota, usuario);
    return ok_();
  } catch (err) { return jsonResponse_({ error: "addNote failed", message: err.message }); }
}

function getTimeline_(data) {
  try {
    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName("Timeline");
    if (!sheet) return jsonResponse_([]);
    var rows = sheet.getDataRange().getValues();
    if (rows.length < 2) return jsonResponse_([]);
    var headers = rows.shift();
    var leadId = data.lead_id || data.leadId || "";
    var result = rows.map(function (row, i) { var obj = { _row: i + 2 }; headers.forEach(function (h, j) { if (h) obj[h] = row[j]; }); return obj; });
    if (leadId) result = result.filter(function (r) { return String(r["Lead ID"] || "").toLowerCase() === String(leadId).toLowerCase(); });
    result.sort(function (a, b) { return new Date(b["Fecha"]) - new Date(a["Fecha"]); });
    return jsonResponse_(result);
  } catch (err) { return jsonResponse_({ error: "getTimeline failed", message: err.message }); }
}

function addTimelineEvent_(leadId, leadNombre, tipo, descripcion, usuario) {
  try {
    var ss = getSpreadsheet_();
    var sheet = getOrCreateSheet_(ss, "Timeline", TIMELINE_COLS);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var rowData = new Array(headers.length).fill("");
    var fields = { "ID": generateID_(), "Fecha": new Date(), "Lead ID": leadId || "", "Lead Nombre": leadNombre || "", "Tipo": tipo || "Evento", "Descripción": descripcion || "", "Usuario": usuario || "Sistema" };
    for (var h in fields) { var idx = headers.indexOf(h); if (idx !== -1) rowData[idx] = fields[h]; }
    sheet.appendRow(rowData);
  } catch (err) { Logger.log("addTimelineEvent error: " + err.message); }
}

function sendBlastFromCRM_(data) {
  try {
    var tipo = data.tipo || "leasing";
    var asunto = data.asunto || data.subject || "";
    var leads = data.leads || [];
    if (!asunto) return jsonResponse_({ error: "Falta el asunto" });
    if (!leads || leads.length === 0) return jsonResponse_({ error: "No hay leads para enviar" });
    var templateFn = tipo === "expansion" ? buildExpansionEmail : buildLeasingEmail;
    var count = 0;
    var errors = [];
    for (var i = 0; i < leads.length; i++) {
      var nombre = leads[i].nombre || leads[i].name || "";
      var email = leads[i].email || leads[i].Email || "";
      if (email && String(email).indexOf("@") !== -1) {
        try {
          GmailApp.sendEmail(email, asunto, "Hola " + nombre + ", mira esta opción para tu hogar.", { name: "Power Solar", htmlBody: templateFn(nombre), replyTo: "info@powersolarprr.com" });
          count++;
        } catch (err) { errors.push(email + ": " + err.message); Logger.log("Error blast: " + err.message); }
      }
    }
    return jsonResponse_({ status: "ok", enviados: count, errores: errors });
  } catch (err) { return jsonResponse_({ error: "sendBlast failed", message: err.message }); }
}

function sendEmails_(nombre, email, telefono, pueblo, factura, origen, producto) {
  try { MailApp.sendEmail({ to: CONFIG.adminEmail, subject: "Nuevo Lead - Power Solar", body: "Nuevo lead recibido:\n\nNombre: " + (nombre || "") + "\nTeléfono: " + (telefono || "") + "\nEmail: " + (email || "") + "\nPueblo: " + (pueblo || "") + "\nFactura Mensual: " + (factura || "") + "\nOrigen: " + (origen || "") + "\nProducto: " + (producto || "") }); } catch (err) { Logger.log("Error email interno: " + err.message); }
  if (email && String(email).indexOf("@") !== -1) {
    var htmlBody, subject, bodyText, fromName, fromEmail;
    if (origen === "EcoFlow PR Website") {
      var productKey = getNormalizedProductKey(producto || factura);
      htmlBody = buildEcoFlowEmail(nombre, productKey);
      subject = "Confirmación de solicitud EcoFlow PR";
      bodyText = "Hola " + nombre + ", hemos recibido tu solicitud para EcoFlow.";
      fromName = "EcoFlow PR";
      fromEmail = "info@powersolarprr.com";
    } else {
      htmlBody = buildClientEmail(nombre);
      subject = "Recibimos tu solicitud — Power Solar";
      bodyText = "Hola " + nombre + ", recibimos tu solicitud de orientación.";
      fromName = "Power Solar";
      fromEmail = "info@powersolarprr.com";
    }
    try { GmailApp.sendEmail(email, subject, bodyText, { name: fromName, htmlBody: htmlBody, replyTo: fromEmail }); } catch (err) { Logger.log("Error email cliente: " + err.message); }
  }
}

function getLeads_() {
  try {
    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName("Leads");
    if (!sheet) return jsonResponse_([]);
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return jsonResponse_([]);
    var headers = data.shift();
    return jsonResponse_(data.map(function (row, i) {
      var obj = { _row: i + 2 };
      headers.forEach(function (h, j) { if (h) { var key = h === "Fecha Creación" ? "Fecha" : h; obj[key] = row[j] !== undefined ? row[j] : ""; if (key !== h) obj[h] = row[j]; } });
      return obj;
    }));
  } catch (err) { return jsonResponse_({ error: "getLeads failed", message: err.message }); }
}

function addLead_(data) {
  try {
    var ss = getSpreadsheet_();
    var sheet = getOrCreateSheet_(ss, "Leads", LEAD_COLS);
    var lastCol = sheet.getLastColumn();
    if (lastCol < 1) return jsonResponse_({ error: "No headers found" });
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var rowData = new Array(headers.length).fill("");
    var nombre = pickFirst_(data, ["nombre", "Nombre", "name"]);
    var email = pickFirst_(data, ["email", "Email"]);
    var telefono = pickFirst_(data, ["telefono", "Teléfono", "phone"]);
    var pueblo = pickFirst_(data, ["pueblo", "Pueblo", "city", "town", "municipio"]);
    var factura = pickFirst_(data, ["factura", "facturaMensual", "Factura Mensual", "monthlyBill", "servicio"]);
    var estado = pickFirst_(data, ["estado", "Estado"]) || "Nuevo";
    var origen = pickFirst_(data, ["origen", "Origen del Lead", "lead_source", "leadSource", "source"]) || "Web Form";
    var gclid = pickFirst_(data, ["gclid", "GCLID"]);
    var fbclid = pickFirst_(data, ["fbclid", "FBCLID"]);
    var campaignId = pickFirst_(data, ["campaign_id", "Campaign ID"]);
    var campaignName = pickFirst_(data, ["campaign_name", "Campaign Name"]);
    var adsetId = pickFirst_(data, ["adset_id", "Ad Set ID"]);
    var adsetName = pickFirst_(data, ["adset_name", "Ad Set Name"]);
    var adId = pickFirst_(data, ["ad_id", "Ad ID"]);
    var adName = pickFirst_(data, ["ad_name", "Ad Name"]);
    var formId = pickFirst_(data, ["form_id", "Form ID"]);
    var clasif = pickFirst_(data, ["clasificacion", "Clasificación"]) || "Sin clasificar";
    var notas = pickFirst_(data, ["anotaciones", "Anotaciones", "notes", "message"]);
    var newId = generateID_();
    var producto = pickFirst_(data, ["producto", "product", "Producto"]);
    if (!producto) producto = pickFirst_(data, ["anotaciones", "Anotaciones", "notes", "message"]);
    var fieldData = { "ID": newId, "Fecha Creación": new Date(), "Nombre": nombre, "Email": email, "Teléfono": telefono, "Pueblo": pueblo, "Factura Mensual": factura, "Estado": estado, "Origen del Lead": origen, "GCLID": gclid, "FBCLID": fbclid, "Campaign ID": campaignId, "Campaign Name": campaignName, "Ad Set ID": adsetId, "Ad Set Name": adsetName, "Ad ID": adId, "Ad Name": adName, "Form ID": formId, "Clasificación": clasif, "Anotaciones": notas, "Email Enviado": "NO" };
    for (var hName in fieldData) { var idx = headers.indexOf(hName); if (idx !== -1) rowData[idx] = fieldData[hName]; }
    sheet.appendRow(rowData);
    sendEmails_(nombre, email, telefono, pueblo, factura, origen, producto);
    var newRow = sheet.getLastRow();
    var emailIdx = headers.indexOf("Email Enviado");
    if (emailIdx !== -1) sheet.getRange(newRow, emailIdx + 1).setValue("SÍ");
    addTimelineEvent_(newId, nombre, "Lead Creado", "Lead creado desde " + origen + (clasif ? " | Clasificación: " + clasif : ""), "Sistema");
    return ok_();
  } catch (err) { return jsonResponse_({ error: "addLead failed", message: err.message }); }
}

function updateLead_(data) {
  try {
    var ss = getSpreadsheet_();
    var sheet = ss.getSheetByName("Leads");
    if (!sheet) return jsonResponse_({ error: "Sheet Leads not found" });
    var row = parseInt(data.row || data._row, 10);
    if (!row || row < 2) return ok_();
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (data.anotaciones || data.Anotaciones || data.notes) {
      var notaIdx = headers.indexOf("Anotaciones");
      var nuevaNota = data.anotaciones || data.Anotaciones || data.notes || "";
      if (notaIdx !== -1 && nuevaNota) {
        var existing = sheet.getRange(row, notaIdx + 1).getValue() || "";
        var timestamp = Utilities.formatDate(new Date(), "America/Puerto_Rico", "MM/dd/yyyy HH:mm");
        var combined = existing ? existing + "\n---\n[" + timestamp + "] " + nuevaNota : "[" + timestamp + "] " + nuevaNota;
        sheet.getRange(row, notaIdx + 1).setValue(combined);
        delete data.anotaciones; delete data.Anotaciones; delete data.notes;
      }
    }
    if (data.estado || data.Estado) {
      var idIdx = headers.indexOf("ID");
      var nombreIdx2 = headers.indexOf("Nombre");
      var leadId2 = idIdx !== -1 ? sheet.getRange(row, idIdx + 1).getValue() : "";
      var leadNom = nombreIdx2 !== -1 ? sheet.getRange(row, nombreIdx2 + 1).getValue() : "";
      addTimelineEvent_(leadId2, leadNom, "Estado Cambiado", "Estado actualizado a: " + (data.estado || data.Estado), data.usuario || "CRM");
    }
    for (var key in data) { if (key !== "row" && key !== "_row" && key !== "usuario") { var h = FIELD_MAPPING[key] || key; updateCell_(sheet, row, headers, h, data[key]); } }
    return ok_();
  } catch (err) { return jsonResponse_({ error: "updateLead failed", message: err.message }); }
}

function deleteLead_(data) {
  try { var ss = getSpreadsheet_(); var sheet = ss.getSheetByName("Leads"); if (!sheet) return jsonResponse_({ error: "Sheet Leads not found" }); var row = parseInt(data.row || data._row, 10); if (row >= 2) sheet.deleteRow(row); return ok_(); }
  catch (err) { return jsonResponse_({ error: "deleteLead failed", message: err.message }); }
}
function convertLead_(data) { return ok_(); }

function getMeetings_() {
  try {
    var ss = getSpreadsheet_(); var sheet = ss.getSheetByName("Meetings"); if (!sheet) return jsonResponse_([]);
    var data = sheet.getDataRange().getValues(); if (data.length < 2) return jsonResponse_([]);
    var headers = data.shift();
    return jsonResponse_(data.map(function (row, i) { var obj = { _row: i + 2 }; headers.forEach(function (h, j) { if (h) obj[h] = row[j]; }); return obj; }));
  } catch (err) { return jsonResponse_({ error: "getMeetings failed", message: err.message }); }
}

function addMeeting_(data) {
  try {
    var ss = getSpreadsheet_(); var sheet = getOrCreateSheet_(ss, "Meetings", MEETING_COLS);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var rowData = new Array(headers.length).fill("");
    var fields = { "ID": generateID_(), "Fecha Creación": new Date(), "Título": data.titulo || data["Título"] || "", "Nombre": data.nombre || data.name || "", "Teléfono": data.telefono || data.phone || "", "Lugar de Reunión": data.lugarReunion || data["Lugar de Reunión"] || "", "Ubicación": data.ubicacion || data["Ubicación"] || "", "Todo el Día": data.todoElDia || data["Todo el Día"] || false, "Fecha Inicio": data.fechaInicio || data["Fecha Inicio"] || "", "Hora Inicio": data.horaInicio || data["Hora Inicio"] || "", "Fecha Fin": data.fechaFin || data["Fecha Fin"] || "", "Hora Fin": data.horaFin || data["Hora Fin"] || "", "Tipo": data.tipo || "", "Estado": data.estado || "Pendiente", "Evento Confirmado": data.eventoConfirmado || data["Evento Confirmado"] || false, "Lead Row": data.leadRow || data["Lead Row"] || "", "Notas": data.notas || data["Notas"] || "" };
    for (var h in fields) { var idx = headers.indexOf(h); if (idx !== -1) rowData[idx] = fields[h]; }
    sheet.appendRow(rowData);
    addTimelineEvent_(data.leadId || "", data.nombre || "", "Reunión Agendada", "Reunión: " + (fields["Título"]) + " | " + (fields["Fecha Inicio"]) + " " + (fields["Hora Inicio"]), data.usuario || "CRM");
    return ok_();
  } catch (err) { return jsonResponse_({ error: "addMeeting failed", message: err.message }); }
}

function updateMeeting_(data) {
  try {
    var ss = getSpreadsheet_(); var sheet = ss.getSheetByName("Meetings"); if (!sheet) return jsonResponse_({ error: "Sheet Meetings not found" });
    var row = parseInt(data.row || data._row, 10); if (!row || row < 2) return ok_();
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var map = { "titulo": "Título", "lugarReunion": "Lugar de Reunión", "ubicacion": "Ubicación" };
    for (var key in data) { if (key !== "row" && key !== "_row") updateCell_(sheet, row, headers, map[key] || key, data[key]); }
    return ok_();
  } catch (err) { return jsonResponse_({ error: "updateMeeting failed", message: err.message }); }
}

function deleteMeeting_(data) {
  try { var ss = getSpreadsheet_(); var sheet = ss.getSheetByName("Meetings"); if (!sheet) return jsonResponse_({ error: "Sheet Meetings not found" }); var row = parseInt(data.row || data._row, 10); if (row >= 2) sheet.deleteRow(row); return ok_(); }
  catch (err) { return jsonResponse_({ error: "deleteMeeting failed", message: err.message }); }
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu("Power Solar Admin")
    .addItem("Setup completo (CRM)", "setupAll")
    .addSeparator()
    .addItem("Enviar Oferta: Leasing Solar", "sendLeasingEmail")
    .addItem("Enviar Oferta: Expansión Solar", "sendExpansionEmail")
    .addToUi();
}

function setupAll() {
  try { updateHeaders("Leads", LEAD_COLS); updateHeaders("Contactos", CONTACT_COLS); updateHeaders("Meetings", MEETING_COLS); updateHeaders("Timeline", TIMELINE_COLS); SpreadsheetApp.getUi().alert("CRM v4.1 Configurado correctamente."); }
  catch (e) { SpreadsheetApp.getUi().alert("Error: " + e.message); }
}

function updateHeaders(sheetName, expectedHeaders) {
  var ss = getSpreadsheet_(); var sheet = ss.getSheetByName(sheetName); if (!sheet) sheet = ss.insertSheet(sheetName);
  if (sheet.getMaxColumns() < expectedHeaders.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), expectedHeaders.length - sheet.getMaxColumns());
  sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
  sheet.getRange(1, 1, 1, expectedHeaders.length).setFontWeight("bold").setBackground("#0433C4").setFontColor("white").setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  try { sheet.autoResizeColumns(1, expectedHeaders.length); } catch (e) { }
}

function sendLeasingEmail() {
  var ui = SpreadsheetApp.getUi(); var result = ui.prompt("Escribe el ASUNTO de la oferta Leasing ($176):", ui.ButtonSet.OK_CANCEL);
  if (result.getSelectedButton() == ui.Button.OK) processMassEmail(result.getResponseText(), buildLeasingEmail);
}
function sendExpansionEmail() {
  var ui = SpreadsheetApp.getUi(); var result = ui.prompt("Escribe el ASUNTO de la oferta Expansión ($86):", ui.ButtonSet.OK_CANCEL);
  if (result.getSelectedButton() == ui.Button.OK) processMassEmail(result.getResponseText(), buildExpansionEmail);
}
function processMassEmail(subject, templateFunction) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Leads");
  var data = sheet.getDataRange().getValues(); var headers = data.shift();
  var nombreIdx = headers.indexOf("Nombre"); var emailIdx = headers.indexOf("Email");
  var count = 0;
  for (var i = 0; i < data.length; i++) {
    var nombre = nombreIdx !== -1 ? data[i][nombreIdx] : ""; var email = emailIdx !== -1 ? data[i][emailIdx] : "";
    if (email && String(email).indexOf("@") !== -1) {
      try { GmailApp.sendEmail(email, subject, "Hola " + nombre + ", mira esta opción para tu hogar.", { name: "Power Solar", htmlBody: templateFunction(nombre), replyTo: "info@powersolarprr.com" }); count++; }
      catch (err) { Logger.log("Error masivo: " + err.message); }
    }
  }
  SpreadsheetApp.getUi().alert("Se enviaron " + count + " correos.");
}

function getSpreadsheet_() { var ss = SpreadsheetApp.getActiveSpreadsheet(); if (!ss) throw new Error("No active spreadsheet found"); return ss; }
function getOrCreateSheet_(ss, sheetName, headers) { var sheet = ss.getSheetByName(sheetName); if (!sheet) sheet = ss.insertSheet(sheetName); if (sheet.getLastRow() === 0 && headers && headers.length) { updateHeaders(sheetName, headers); sheet = ss.getSheetByName(sheetName); } return sheet; }
function parsePostBody_(e) {
  var output = {}; if (!e) return output; if (e.parameter) output = mergeObjects_(output, e.parameter);
  if (e.postData && e.postData.contents) {
    var raw = e.postData.contents;
    try { var parsedJson = JSON.parse(raw); if (parsedJson && typeof parsedJson === "object") return mergeObjects_(output, parsedJson); } catch (err) { }
    try {
      var parts = raw.split("&");
      for (var i = 0; i < parts.length; i++) {
        var pair = parts[i].split("=");
        if (pair.length >= 2) { var key = decodeURIComponent(pair[0] || ""); var value = decodeURIComponent((pair.slice(1).join("=") || "").replace(/\+/g, " ")); output[key] = value; }
      }
    } catch (err2) { }
  }
  return output;
}
function mergeObjects_(a, b) { var result = {}; a = a || {}; b = b || {}; for (var k1 in a) result[k1] = a[k1]; for (var k2 in b) result[k2] = b[k2]; return result; }
function pickFirst_(obj, keys) { obj = obj || {}; for (var i = 0; i < keys.length; i++) { var key = keys[i]; if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") return obj[key]; } return ""; }
function updateCell_(sheet, row, headers, headerName, value) { var col = headers.indexOf(headerName) + 1; if (col > 0) sheet.getRange(row, col).setValue(value); }
function validateToken_(token) { return CONFIG.tokens.indexOf(token) !== -1; }
function generateID_() { return Math.random().toString(36).substr(2, 9).toUpperCase(); }
function jsonResponse_(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
function ok_() { return jsonResponse_({ status: "ok" }); }

function getNormalizedProductKey(input) {
  if (!input) return "Delta Pro 3";
  var s = String(input).toLowerCase();
  // Ultra + Smart Home Panel 2 bundle
  if (s.indexOf("ultra") !== -1 && (s.indexOf("smart home") !== -1 || s.indexOf("smhp") !== -1 || s.indexOf("panel 2") !== -1 || s.indexOf("home panel") !== -1)) return "Delta Pro Ultra + SMHP2";
  // Ultra solo
  if (s.indexOf("ultra") !== -1) return "Delta Pro Ultra";
  // Delta 2 Max
  if (s.indexOf("delta 2 max") !== -1 || s.indexOf("delta2 max") !== -1 || s.indexOf("apartamento") !== -1 || s.indexOf("apto") !== -1 || s.indexOf("delta 2") !== -1) return "Delta 2 Max";
  // Delta Pro 3
  if (s.indexOf("delta pro 3") !== -1 || s.indexOf("deltapro3") !== -1 || s.indexOf("casa") !== -1 || s.indexOf("hogar") !== -1 || s.indexOf("pro 3") !== -1) return "Delta Pro 3";
  return "Delta Pro 3";
}

// FORMATO DE EMAIL DE ECOFLOW COMPLETO
function buildEcoFlowEmail(nombre, productKey) {
  var products = {
    "Delta Pro 3": { name: "Delta Pro 3", showBundle: true, img: "https://raw.githubusercontent.com/jerrysocialmediapr-ctrl/EcoFlow-PR/main/Delta%20Pro%203/DeltaPro3-frente.png", desc: "4kWh de capacidad. Carga ultra-rápida. App integrada.", bundleTitle: "Delta Pro 3 + Paneles Solares", panels: "4x Panel Rigido 100W", panelImg: "https://raw.githubusercontent.com/jerrysocialmediapr-ctrl/EcoFlow-PR/main/Assets/solar-panel.png", panelDesc: "4 paneles de alta eficiencia para carga solar directa.", badge: "RESPALDO COMPLETO" },
    "Delta 2 Max": { name: "Delta 2 Max", showBundle: true, img: "https://raw.githubusercontent.com/jerrysocialmediapr-ctrl/EcoFlow-PR/main/Delta%202%20max/delta2-frente.png", desc: "2kWh de capacidad. Ideal para apartamentos y backup movil.", bundleTitle: "Delta 2 Max + Paneles Solares", panels: "2x Panel Rigido 100W", panelImg: "https://raw.githubusercontent.com/jerrysocialmediapr-ctrl/EcoFlow-PR/main/Assets/solar-panel.png", panelDesc: "2 paneles para mantenerte cargado de dia.", badge: "MAXIMA PORTABILIDAD" },
    "Delta Pro Ultra": { name: "Delta Pro Ultra", showBundle: false, img: "https://raw.githubusercontent.com/jerrysocialmediapr-ctrl/EcoFlow-PR/main/Delta%20Pro%20Ultra/DeltaProUltra.png", desc: "El sistema mas potente de EcoFlow. Respaldo para toda la casa.", bundleTitle: "Delta Pro Ultra", panels: "", panelImg: "", panelDesc: "", badge: "POTENCIA INDUSTRIAL" },
    "Delta Pro Ultra + SMHP2": { name: "Delta Pro Ultra", showBundle: true, img: "https://raw.githubusercontent.com/jerrysocialmediapr-ctrl/EcoFlow-PR/main/Delta%20Pro%20Ultra/DeltaProUltra.png", desc: "El sistema mas potente de EcoFlow. Respaldo para toda la casa.", bundleTitle: "Delta Pro Ultra + Smart Home Panel 2", panels: "Smart Home Panel 2", panelImg: "https://raw.githubusercontent.com/jerrysocialmediapr-ctrl/EcoFlow-PR/main/Assets/shp2.png", panelDesc: "Integracion total con el switch de transferencia inteligente.", badge: "POTENCIA INDUSTRIAL" }
  };

  var p = products[productKey] || products["Delta Pro 3"];
  var batteryWidth = p.showBundle ? "48%" : "60%";
  var bundleSection = p.showBundle ?
    ('<td width="4%"></td>' +
     '<td width="48%" valign="top" bgcolor="#f4f9f6" style="border-radius:12px;padding:20px;text-align:center;">' +
     '<img src="' + p.panelImg + '" width="160" style="display:block;margin:0 auto 14px auto;max-width:160px;height:auto;border:0;" alt="' + p.panels + '"/>' +
     '<h3 style="font-size:15px;font-weight:800;color:#1c2b22;margin:0 0 6px 0;font-family:Arial,sans-serif;">' + p.panels + '</h3>' +
     '<p style="font-size:12px;color:#6b8a7a;line-height:1.5;margin:0 0 10px 0;font-family:Arial,sans-serif;">' + p.panelDesc + '</p>' +
     '<span style="display:inline-block;font-size:9px;font-weight:800;letter-spacing:1px;color:#1c6b3a;background-color:#e8f5ee;border:1px solid #a8d9bc;padding:4px 10px;border-radius:4px;font-family:Arial,sans-serif;">INCLUIDO EN ESTE BUNDLE</span>' +
     '</td>')
    : '';



  return '<!DOCTYPE html>' +
    '<html lang="es"><head><meta charset="UTF-8"/>' +
    '<meta name="viewport" content="width=device-width,initial-scale=1.0"/>' +
    '<title>EcoFlow PR</title></head>' +
    '<body style="margin:0;padding:0;background-color:#f4f9f6;font-family:Arial,Helvetica,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f9f6">' +
    '<tr><td align="center" style="padding:20px 10px;">' +
    '<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">' +
    // HEADER
    '<tr><td bgcolor="#ffffff" style="padding:20px 30px;border-radius:16px 16px 0 0;border-bottom:2px solid #e8f5ee;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
    '<td><span style="font-size:20px;font-weight:900;letter-spacing:2px;color:#1c2b22;font-family:Arial,sans-serif;">ECOFLOW</span>' +
    '&nbsp;<span style="background-color:#1c2b22;color:#40c472;font-size:9px;font-weight:800;letter-spacing:1px;padding:3px 8px;border-radius:4px;">PUERTO RICO</span></td>' +
    '<td align="right"><span style="background-color:#e8f5ee;border:1px solid #a8d9bc;border-radius:20px;padding:5px 14px;font-size:10px;font-weight:700;color:#1c6b3a;text-transform:uppercase;letter-spacing:1px;">Solicitud Entregada</span></td>' +
    '</tr></table></td></tr>' +
    // HERO
    '<tr><td bgcolor="#1c2b22" style="padding:40px 30px;">' +
    '<p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#40c472;margin:0 0 12px 0;font-family:Arial,sans-serif;">CONFIRMACION DE RECIBO</p>' +
    '<h1 style="font-size:32px;font-weight:900;line-height:1.1;color:#ffffff;margin:0 0 10px 0;font-family:Arial,sans-serif;">Hola, ' + nombre + '.<br/><span style="color:#40c472;">Tranquilo.</span></h1>' +
    '<p style="font-size:14px;color:#8fb09e;line-height:1.6;margin:0;font-family:Arial,sans-serif;">Recibimos tu solicitud para el <strong style="color:#ffffff;">' + p.name + '</strong>. Un especialista local se contactara pronto para coordinar los detalles de tu equipo y paneles incluidos.</p>' +
    '</td></tr>' +
    // USO SUGERIDO
    '<tr><td bgcolor="#ffffff" style="padding:32px 30px;">' +
    '<p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#40c472;margin:0 0 8px 0;font-family:Arial,sans-serif;">USO SUGERIDO</p>' +
    '<h2 style="font-size:20px;font-weight:800;color:#1c2b22;margin:0 0 6px 0;font-family:Arial,sans-serif;">Energia siempre disponible</h2>' +
    '<p style="font-size:13px;color:#6b8a7a;line-height:1.6;margin:0 0 20px 0;font-family:Arial,sans-serif;">Con EcoFlow mantienes lo esencial funcionando siempre.</p>' +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
    '<td width="23%" align="center" bgcolor="#f4f9f6" style="border-radius:10px;padding:14px 6px;">' +
    '<p style="margin:0 0 6px 0;"><img src="https://img.icons8.com/ios/100/000000/fan.png" width="32" style="display:block;margin:0 auto;border:none;" alt="Abanico"/></p>' +
    '<p style="font-size:12px;font-weight:700;color:#1c2b22;margin:0 0 2px 0;font-family:Arial,sans-serif;">Abanico</p>' +
    '<p style="font-size:11px;color:#6b8a7a;margin:0;font-family:Arial,sans-serif;">~50W</p></td>' +
    '<td width="2%"></td>' +
    '<td width="23%" align="center" bgcolor="#f4f9f6" style="border-radius:10px;padding:14px 6px;">' +
    '<p style="margin:0 0 6px 0;"><img src="https://img.icons8.com/ios/100/000000/fridge.png" width="32" style="display:block;margin:0 auto;border:none;" alt="Nevera"/></p>' +
    '<p style="font-size:12px;font-weight:700;color:#1c2b22;margin:0 0 2px 0;font-family:Arial,sans-serif;">Nevera</p>' +
    '<p style="font-size:11px;color:#6b8a7a;margin:0;font-family:Arial,sans-serif;">~150W</p></td>' +
    '<td width="2%"></td>' +
    '<td width="23%" align="center" bgcolor="#f4f9f6" style="border-radius:10px;padding:14px 6px;">' +
    '<p style="margin:0 0 6px 0;"><img src="https://img.icons8.com/ios/100/000000/monitor.png" width="32" style="display:block;margin:0 auto;border:none;" alt="TV"/></p>' +
    '<p style="font-size:12px;font-weight:700;color:#1c2b22;margin:0 0 2px 0;font-family:Arial,sans-serif;">Televisor</p>' +
    '<p style="font-size:11px;color:#6b8a7a;margin:0;font-family:Arial,sans-serif;">~80W</p></td>' +
    '<td width="2%"></td>' +
    '<td width="23%" align="center" bgcolor="#f4f9f6" style="border-radius:10px;padding:14px 6px;">' +
    '<p style="margin:0 0 6px 0;"><img src="https://img.icons8.com/ios/100/000000/idea.png" width="32" style="display:block;margin:0 auto;border:none;" alt="Luces"/></p>' +
    '<p style="font-size:12px;font-weight:700;color:#1c2b22;margin:0 0 2px 0;font-family:Arial,sans-serif;">Luces</p>' +
    '<p style="font-size:11px;color:#6b8a7a;margin:0;font-family:Arial,sans-serif;">~30W</p></td>' +
    '</tr></table>' +
    '</td></tr>' +
    // SEPARADOR
    '<tr><td bgcolor="#e8f5ee" style="height:2px;font-size:0;line-height:0;">&nbsp;</td></tr>' +
    // TU SELECCION — BUNDLE
    '<tr><td bgcolor="#ffffff" style="padding:32px 30px;">' +
    '<p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#40c472;margin:0 0 8px 0;font-family:Arial,sans-serif;">TU SELECCION</p>' +
    '<h2 style="font-size:20px;font-weight:800;color:#1c2b22;margin:0 0 4px 0;font-family:Arial,sans-serif;">' + p.bundleTitle + '</h2>' +
    '<p style="font-size:13px;color:#6b8a7a;margin:0 0 24px 0;font-family:Arial,sans-serif;">La combinacion para autonomia total en Puerto Rico.</p>' +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
    // Bateria
    '<td width="' + batteryWidth + '" valign="top" bgcolor="#f4f9f6" style="border-radius:12px;padding:20px;text-align:center;">' +
    '<img src="' + p.img + '" width="160" style="display:block;margin:0 auto 14px auto;max-width:160px;height:auto;border:0;" alt="' + p.name + '"/>' +
    '<h3 style="font-size:15px;font-weight:800;color:#1c2b22;margin:0 0 6px 0;font-family:Arial,sans-serif;">' + p.name + '</h3>' +
    '<p style="font-size:12px;color:#6b8a7a;line-height:1.5;margin:0 0 10px 0;font-family:Arial,sans-serif;">' + p.desc + '</p>' +
    '<span style="display:inline-block;font-size:9px;font-weight:800;letter-spacing:1px;color:#40c472;background-color:#1c2b22;padding:4px 10px;border-radius:4px;font-family:Arial,sans-serif;">' + p.badge + '</span>' +
    '</td>' +
    bundleSection +
    '</tr></table>' +
    '</td></tr>' +
    // GARANTIA + CTA
    '<tr><td bgcolor="#ffffff" style="padding:0 30px 32px 30px;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f9f6" style="border-radius:14px;">' +
    '<tr>' +
    '<td style="padding:20px 20px;" valign="middle">' +
    '<p style="font-size:14px;font-weight:800;color:#1c6b3a;margin:0 0 4px 0;font-family:Arial,sans-serif;">Garantia Local</p>' +
    '<p style="font-size:12px;color:#6b8a7a;margin:0;font-family:Arial,sans-serif;">Valido en Puerto Rico. Servicio y soporte directo.</p>' +
    '</td>' +
    '<td align="right" style="padding:20px 20px;" valign="middle">' +
    '<a href="tel:7876281344" style="display:inline-block;background-color:#1c2b22;color:#40c472;font-weight:900;font-size:13px;letter-spacing:1px;text-transform:uppercase;padding:14px 24px;border-radius:10px;text-decoration:none;font-family:Arial,sans-serif;">CONTACTAR AHORA</a>' +
    '</td>' +
    '</tr></table>' +
    '</td></tr>' +
    // FOOTER
    '<tr><td bgcolor="#1c2b22" style="padding:24px 30px;border-radius:0 0 16px 16px;text-align:center;">' +
    '<p style="font-size:13px;font-weight:800;color:#40c472;letter-spacing:2px;margin:0 0 10px 0;font-family:Arial,sans-serif;">ECOFLOW PUERTO RICO</p>' +
    '<p style="font-size:12px;color:#8fb09e;margin:0 0 6px 0;font-family:Arial,sans-serif;">' +
    '<a href="https://www.ecoflow-pr.com" style="color:#40c472;text-decoration:none;">Sitio Web</a>' +
    '&nbsp;&nbsp;|&nbsp;&nbsp;' +
    '<a href="tel:7876281344" style="color:#8fb09e;text-decoration:none;">Ventas: 787-628-1344</a>' +
    '</p>' +
    '<p style="font-size:11px;color:#4a6b5a;margin:0;font-family:Arial,sans-serif;">Distribuido por Power Solar. Este correo fue enviado tras tu solicitud en ecoflow-pr.com.<br/>© 2026 EcoFlow PR</p>' +
    '</td></tr>' +
    '</table>' +
    '</td></tr></table>' +
    '</body></html>';
}

function buildClientEmail(nombre) {
  return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#f0f4ff;font-family:Arial,sans-serif;color:#040D2B;}.wrap{max-width:600px;margin:0 auto;padding:32px 16px;}.card{background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(4,51,196,0.12);}.header{background:#0433C4;padding:48px 40px 40px;text-align:center;}.header h1{color:#ffffff;font-weight:900;font-size:24px;}.sun-divider{width:100%;height:4px;background:linear-gradient(90deg,#0433C4,#FF7A00,#F5A623);}.body{padding:44px 40px;background:#ffffff;}.cta-box{background:#FF7A00;border-radius:16px;padding:32px;text-align:center;margin-bottom:32px;}.cta-btn{display:inline-block;background:#ffffff;color:#FF7A00;font-weight:900;font-size:14px;letter-spacing:1px;text-transform:uppercase;padding:14px 32px;border-radius:8px;text-decoration:none;}.footer{background:#040D2B;padding:32px 40px;text-align:center;}.footer p{color:rgba(255,255,255,0.5);font-size:12px;}</style></head><body><div class="wrap"><div class="card"><div class="header"><h1>Confirmacion de Solicitud</h1></div><div class="sun-divider"></div><div class="body"><p style="font-size:18px;font-weight:600;margin-bottom:16px;">Hola, ' + nombre + '</p><p style="font-size:15px;color:#4A5568;line-height:1.8;margin-bottom:32px;">Hemos recibido tu solicitud de orientacion. Un consultor energetico de Power Solar se contactara contigo pronto.</p><div class="cta-box"><p style="color:#ffffff;margin-bottom:16px;">Tienes preguntas inmediatas?</p><a href="tel:7876281344" class="cta-btn">Llamar: 787-628-1344</a></div></div><div class="footer"><p>Power Solar LLC · Puerto Rico<br>www.powersolarprr.com</p></div></div></div></body></html>';
}

function buildLeasingEmail(nombre) {
  return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Arial,sans-serif;padding:20px;background:#f8f9fc;color:#040D2B;}.offer-box{background:#ffffff;border:1px solid #0433C4;padding:30px;border-radius:12px;text-align:center;}.cta-btn{display:inline-block;background:#FF7A00;color:#ffffff;padding:15px 30px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:20px;}</style></head><body><div class="offer-box"><h2>Hola ' + nombre + '</h2><p>Toma el control de tu energia con nuestro plan de leasing solar.</p><h1 style="color:#0433C4;">PAGO FIJO desde $176</h1><p>Incluye 25 anos de garantia y servicio.</p><a href="tel:7876281344" class="cta-btn">Llamar ahora: 787-628-1344</a></div></body></html>';
}

function buildExpansionEmail(nombre) {
  return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Arial,sans-serif;padding:20px;background:#f8f9fc;color:#040D2B;}.offer-box{background:#ffffff;border:3px dashed #0433C4;padding:30px;border-radius:12px;text-align:center;}.cta-btn{display:inline-block;background:#FF7A00;color:#ffffff;padding:15px 30px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:20px;}</style></head><body><div class="offer-box"><h2>Hola ' + nombre + '</h2><p>Tu sistema solar actual se queda corto? Expandelo hoy.</p><h1 style="color:#0433C4;">Planes desde $86 al mes</h1><p>Anade mas potencia sin complicaciones.</p><a href="tel:7876281344" class="cta-btn">Llamar ahora: 787-628-1344</a></div></body></html>';
}
