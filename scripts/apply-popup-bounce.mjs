import fs from 'node:fs';

const file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

const oldOverlay = `.july-offers-popup{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(1,10,14,.78);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.july-offers-popup.is-open{display:flex}`;

const newOverlay = `.july-offers-popup{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(1,10,14,.50);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .16s ease,visibility 0s linear .16s}
.july-offers-popup.is-open{opacity:1;visibility:visible;pointer-events:auto;transition:opacity .16s ease}`;

const oldDialog = `.july-offers-dialog{position:relative;width:min(94vw,520px);max-height:94vh;overflow:hidden;border:1px solid rgba(49,225,218,.35);border-radius:22px;background:#06171b;box-shadow:0 28px 90px rgba(0,0,0,.55);animation:julyPopupIn .25s ease-out}
@keyframes julyPopupIn{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}`;

const newDialog = `.july-offers-dialog{position:relative;width:min(94vw,520px);max-height:94vh;overflow:hidden;border:1px solid rgba(49,225,218,.35);border-radius:22px;background:#06171b;box-shadow:0 28px 90px rgba(0,0,0,.55),0 0 34px rgba(38,210,203,.16);transform-origin:center center}
.july-offers-popup.is-open .july-offers-dialog{animation:julyPopupBounce .72s cubic-bezier(.22,.9,.28,1.12) both}
@keyframes julyPopupBounce{0%{opacity:0;transform:translateY(14px) scale(.82)}58%{opacity:1;transform:translateY(-2px) scale(1.045)}78%{transform:translateY(1px) scale(.985)}100%{opacity:1;transform:translateY(0) scale(1)}}`;

if (!html.includes(oldOverlay)) {
  throw new Error('No se encontró el bloque original del fondo del popup.');
}
if (!html.includes(oldDialog)) {
  throw new Error('No se encontró la animación original del popup.');
}

html = html.replace(oldOverlay, newOverlay).replace(oldDialog, newDialog);

if (!html.includes('prefers-reduced-motion: reduce')) {
  html = html.replace(
    '</style>',
    `@media (prefers-reduced-motion: reduce){.july-offers-popup{transition:none}.july-offers-popup.is-open .july-offers-dialog{animation:none}}\n</style>`
  );
}

fs.writeFileSync(file, html);
console.log('Popup zoom-in con rebote aplicado.');
