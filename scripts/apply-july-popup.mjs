import fs from 'node:fs';

const file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

if (html.includes('id="july-offers-popup"')) {
  console.log('July offers popup already exists.');
  process.exit(0);
}

const css = String.raw`
/* JULY 2026 OFFERS POPUP */
.july-offers-popup{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(1,10,14,.78);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.july-offers-popup.is-open{display:flex}
.july-offers-dialog{position:relative;width:min(94vw,520px);max-height:94vh;overflow:hidden;border:1px solid rgba(49,225,218,.35);border-radius:22px;background:#06171b;box-shadow:0 28px 90px rgba(0,0,0,.55);animation:julyPopupIn .25s ease-out}
@keyframes julyPopupIn{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}
.july-offers-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 16px;color:#fff;background:#071316}
.july-offers-heading{min-width:0}.july-offers-heading strong{display:block;font-size:15px;line-height:1.2}.july-offers-heading span{display:block;margin-top:2px;color:#34d8d1;font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase}
.july-offers-close{display:grid;place-items:center;flex:0 0 38px;width:38px;height:38px;border:1px solid rgba(255,255,255,.2);border-radius:50%;background:rgba(255,255,255,.08);color:#fff;font-size:26px;line-height:1;cursor:pointer}
.july-offers-viewport{position:relative;overflow:hidden;background:#06171b;touch-action:pan-y}.july-offers-track{display:flex;transition:transform .38s cubic-bezier(.2,.7,.2,1)}
.july-offer-slide{flex:0 0 100%;display:flex;align-items:center;justify-content:center;min-width:0;background:#06171b}.july-offer-slide img{display:block;width:100%;height:auto;max-height:69vh;object-fit:contain;background:#06171b}
.july-offers-arrow{position:absolute;top:50%;z-index:2;display:grid;place-items:center;width:40px;height:40px;margin-top:-20px;border:1px solid rgba(255,255,255,.45);border-radius:50%;background:rgba(0,0,0,.48);color:#fff;font-size:27px;line-height:1;cursor:pointer}.july-offers-prev{left:10px}.july-offers-next{right:10px}
.july-offers-bottom{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 14px 13px;background:#071316}.july-offers-dots{display:flex;gap:7px}.july-offers-dot{width:8px;height:8px;padding:0;border:0;border-radius:50%;background:#617176;cursor:pointer}.july-offers-dot.is-active{width:22px;border-radius:999px;background:#26d2cb}
.july-offers-cta{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 16px;border:0;border-radius:999px;background:#20c8c2;color:#052126;font-size:13px;font-weight:900;text-decoration:none;white-space:nowrap}
.july-offers-reopen{position:fixed;right:16px;bottom:18px;z-index:99990;display:none;align-items:center;gap:7px;padding:11px 16px;border:0;border-radius:999px;background:#10bbb6;color:#041c20;font-weight:900;box-shadow:0 12px 35px rgba(0,0,0,.28);cursor:pointer}.july-offers-reopen.is-visible{display:flex}
body.july-popup-lock{overflow:hidden}
@media(max-width:560px){.july-offers-popup{padding:8px}.july-offers-dialog{width:min(96vw,440px);border-radius:18px}.july-offers-top{padding:10px 12px}.july-offers-heading strong{font-size:14px}.july-offer-slide img{max-height:72vh}.july-offers-arrow{width:36px;height:36px;font-size:24px}.july-offers-bottom{padding:9px 10px 11px}.july-offers-cta{padding:0 13px;font-size:12px}}
`;

const markup = String.raw`
<div class="july-offers-popup" id="july-offers-popup" role="dialog" aria-modal="true" aria-labelledby="july-offers-title" aria-hidden="true">
  <div class="july-offers-dialog">
    <div class="july-offers-top">
      <div class="july-offers-heading"><strong id="july-offers-title">Ofertas EcoFlow de julio</strong><span>Válidas hasta el 31 de julio de 2026</span></div>
      <button class="july-offers-close" type="button" aria-label="Cerrar ofertas">×</button>
    </div>
    <div class="july-offers-viewport">
      <div class="july-offers-track">
        <div class="july-offer-slide"><img src="/offers/july-2026/huracan-kit-pro-3.webp" alt="Oferta Huracán Kit Pro 3 con cisterna" width="300" height="375"></div>
        <div class="july-offer-slide"><img src="/offers/july-2026/huracan-kit-pro.webp" alt="Oferta Huracán Kit Pro con cisterna" width="300" height="375"></div>
        <div class="july-offer-slide"><img src="/offers/july-2026/huracan-kit-pro-ultra.webp" alt="Oferta Huracán Kit Pro Ultra con cisterna" width="220" height="275"></div>
        <div class="july-offer-slide"><img src="/offers/july-2026/cisterna-gratis.webp" alt="Cisterna gratis con baterías EcoFlow seleccionadas" width="220" height="220"></div>
      </div>
      <button class="july-offers-arrow july-offers-prev" type="button" aria-label="Oferta anterior">‹</button>
      <button class="july-offers-arrow july-offers-next" type="button" aria-label="Oferta siguiente">›</button>
    </div>
    <div class="july-offers-bottom">
      <div class="july-offers-dots" aria-label="Seleccionar oferta"></div>
      <a class="july-offers-cta" href="#contact">Solicitar oferta</a>
    </div>
  </div>
</div>
<button class="july-offers-reopen" id="july-offers-reopen" type="button" aria-label="Ver ofertas de julio">⚡ Ver ofertas</button>
`;

const js = String.raw`
<script>
(function(){
  var expires = new Date('2026-08-01T00:00:00-04:00').getTime();
  if (Date.now() >= expires) return;
  var modal=document.getElementById('july-offers-popup');
  var reopen=document.getElementById('july-offers-reopen');
  var track=modal.querySelector('.july-offers-track');
  var slides=Array.prototype.slice.call(modal.querySelectorAll('.july-offer-slide'));
  var dotsWrap=modal.querySelector('.july-offers-dots');
  var closeBtn=modal.querySelector('.july-offers-close');
  var prevBtn=modal.querySelector('.july-offers-prev');
  var nextBtn=modal.querySelector('.july-offers-next');
  var cta=modal.querySelector('.july-offers-cta');
  var index=0,timer=null,touchStart=0;
  slides.forEach(function(_,i){var b=document.createElement('button');b.type='button';b.className='july-offers-dot'+(i===0?' is-active':'');b.setAttribute('aria-label','Ver oferta '+(i+1));b.addEventListener('click',function(){go(i);restart();});dotsWrap.appendChild(b);});
  var dots=Array.prototype.slice.call(dotsWrap.children);
  function go(i){index=(i+slides.length)%slides.length;track.style.transform='translateX(-'+(index*100)+'%)';dots.forEach(function(d,n){d.classList.toggle('is-active',n===index);});}
  function start(){stop();timer=setInterval(function(){go(index+1);},5200);}
  function stop(){if(timer){clearInterval(timer);timer=null;}}
  function restart(){start();}
  function open(){modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('july-popup-lock');reopen.classList.remove('is-visible');start();setTimeout(function(){closeBtn.focus();},50);}
  function close(){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('july-popup-lock');reopen.classList.add('is-visible');stop();try{sessionStorage.setItem('ecoflowJuly2026OffersDismissed','1');}catch(e){}}
  closeBtn.addEventListener('click',close);reopen.addEventListener('click',open);prevBtn.addEventListener('click',function(){go(index-1);restart();});nextBtn.addEventListener('click',function(){go(index+1);restart();});
  modal.addEventListener('click',function(e){if(e.target===modal)close();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal.classList.contains('is-open'))close();if(e.key==='ArrowLeft'&&modal.classList.contains('is-open'))go(index-1);if(e.key==='ArrowRight'&&modal.classList.contains('is-open'))go(index+1);});
  track.addEventListener('touchstart',function(e){touchStart=e.changedTouches[0].clientX;stop();},{passive:true});
  track.addEventListener('touchend',function(e){var delta=e.changedTouches[0].clientX-touchStart;if(Math.abs(delta)>45)go(index+(delta<0?1:-1));start();},{passive:true});
  cta.addEventListener('click',function(){close();setTimeout(function(){var target=document.getElementById('contact');if(target)target.scrollIntoView({behavior:'smooth',block:'start'});},80);});
  window.addEventListener('load',function(){var dismissed=false;try{dismissed=sessionStorage.getItem('ecoflowJuly2026OffersDismissed')==='1';}catch(e){}if(dismissed){reopen.classList.add('is-visible');}else{setTimeout(open,2600);}});
})();
</script>
`;

if (!html.includes('</style>')) throw new Error('No closing style tag found');
if (!html.includes('</body>')) throw new Error('No closing body tag found');
html = html.replace('</style>', css + '\n</style>');
html = html.replace('</body>', markup + '\n' + js + '\n</body>');
fs.writeFileSync(file, html);
console.log('July offers popup injected.');
