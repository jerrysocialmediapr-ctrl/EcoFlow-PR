const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../google-apps-script.js'), 'utf8');

// Mock any global objects that google-apps-script.js might use or refer to
const globalScope = {
  Logger: { log: console.log },
  Utilities: {
    formatDate: () => '',
  },
  MailApp: {},
  GmailApp: {},
  SpreadsheetApp: {},
  ContentService: {},
  UrlFetchApp: {},
};

// Evaluate the script in a simulated global scope
const contextFunction = new Function(...Object.keys(globalScope), code + `
  return {
    buildEcoFlowEmail: buildEcoFlowEmail
  };
`);

const exported = contextFunction(...Object.values(globalScope));

const publicBaseUrl = 'http://localhost:3000'; // local testing base URL

// 1. Render DELTA Pro Ultra email
const ultraEmailHtml = exported.buildEcoFlowEmail('Cliente Ultra', 'Delta Pro Ultra', publicBaseUrl);
fs.writeFileSync(path.join(__dirname, '../public/test-ultra-email.html'), ultraEmailHtml);

// 2. Render DELTA Pro Ultra + SMHP2 email
const ultraSmhp2EmailHtml = exported.buildEcoFlowEmail('Cliente Ultra SMHP2', 'Delta Pro Ultra + SMHP2', publicBaseUrl);
fs.writeFileSync(path.join(__dirname, '../public/test-ultra-smhp2-email.html'), ultraSmhp2EmailHtml);

console.log('Test emails successfully rendered to public/ directory!');
