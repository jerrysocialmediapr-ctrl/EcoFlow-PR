import fs from 'node:fs';

const file = 'api/lead.js';
let source = fs.readFileSync(file, 'utf8');

const before = `    const leadId = leadData.id;\n    if (!eligible) return res.status(200).json({ ok: true, leadId, quoteStatus: 'no_aplica' });`;
const after = `    const leadId = leadData.id;\n    const autoSendQuotes = String(process.env.AUTO_SEND_QUOTES || '').trim().toLowerCase() === 'true';\n    if (!eligible || !autoSendQuotes) {\n      return res.status(200).json({\n        ok: true,\n        leadId,\n        quoteStatus: eligible ? 'pendiente_asesoria' : 'no_aplica',\n        message: eligible\n          ? 'Solicitud confirmada. La cotización se preparará manualmente desde el CRM.'\n          : 'Solicitud confirmada.',\n      });\n    }`;

if (!source.includes(before)) {
  if (source.includes("quoteStatus: eligible ? 'pendiente_asesoria' : 'no_aplica'")) {
    console.log('Manual quote flow already applied.');
    process.exit(0);
  }
  throw new Error('No se encontró el bloque esperado en api/lead.js');
}

source = source.replace(before, after);
fs.writeFileSync(file, source);
console.log('Website lead flow changed to confirmation-only by default.');
