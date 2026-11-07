'use strict';
// Bloque 3: pestaña Brasas (dinero real) sobre el flujo REAL del cliente con servidor SIMULADO. No hay pasarela conectada en esta rama:
// se prueba que, sin pasarela, la interfaz lo dice y no deja comprar; y con una pasarela simulada, que el resumen es inequívoco,
// que no hay pedidos duplicados y que cada fallo dice que no se cobró nada.
//   node tools/ui-clarity/test-brasas-flow.js
const { spawn } = require('child_process'), path = require('path'), net = require('net');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..'); let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 300) : '')); if (!ok) fails++; };
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const port = await freePort(), srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); await sleep(1200);
  const browser = await chromium.launch({ args: ['--no-sandbox'] }); const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript(() => { window.__campaignMode = true; }); const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:' + port + '/index.html'); await page.waitForFunction(() => typeof assetsAllReady === 'function' && assetsAllReady(), null, { timeout: 180000 }); await sleep(600);
  const setup = enabled => page.evaluate(en => { acct.session = acct.session || { token: 't' }; window.__co = []; window.__mode = 'ok'; window.__delay = 0;
    const packs = [{ id: 'p500', premium: 500, bonus: 50, price: { amount: 4.99, currency: 'USD' } }];
    window.accountFetch = async (m, p, b) => { if (m === 'GET') return { status: 200, j: { premium: 120, currency: { id: 'brasas' }, payments: { enabled: en, packs }, welcome: null } };
      window.__co.push({ p, b }); if (window.__delay) await new Promise(r => setTimeout(r, window.__delay)); if (window.__mode === '501') return { status: 501, j: { msg: 'Muy pronto: los pagos todavía no están conectados.' } }; if (window.__mode === 'err') return { status: 500, j: { error: 'X' } }; return { status: 200, j: { redirect: '#pasarela-simulada' } }; };
    PREMIUM.at = 0; return premiumRefresh(true).then(() => { setState('shop'); shopOpen('brasas'); }); }, enabled);
  const tap = async sel => { const e = await page.$(sel); await e.scrollIntoViewIfNeeded(); const b = await e.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); };
  try {
    await setup(false); await sleep(800);
    const off = await page.evaluate(() => ({ note: (document.querySelector('[data-brasas-soon-note]') || {}).innerText, btn: [...document.querySelectorAll('[data-brasas-soon]')].map(b => b.disabled), buy: document.querySelectorAll('[data-brasas-buy]').length }));
    check('sin pasarela: dice «Muy pronto… no se pueden comprar Brasas» y no ofrece comprar', /Muy pronto/.test(off.note || '') && off.buy === 0 && off.btn.every(Boolean), off);
    await setup(true); await sleep(800);
    const on = await page.evaluate(() => { const c = document.querySelector('[data-brasas-pack]'); return { txt: c && c.innerText, bal: document.querySelector('.brasas-bal').innerText, fine: (document.querySelector('.brasas-fine') || {}).innerText }; });
    check('con pasarela: el paquete muestra Brasas totales y el importe con moneda (US$ 4,99), y se ve el saldo', /550/.test(on.txt) && /US\$ 4,99/.test(on.txt) && /120/.test(on.bal), on);
    check('la nota aclara moneda e importe antes de pagar', /moneda y el importe/i.test(on.fine || ''), (on.fine || '').slice(0, 120));
    // puerta legal previa a la primera compra con dinero real (js/ui/legal.js): consentimiento + edad, no se puede saltear
    await tap('[data-brasas-buy]'); await sleep(500);
    const legal = await page.evaluate(() => { const m = document.querySelector('.legal-modal'); return m && m.innerText; });
    check('primera compra con dinero real: aparece «Antes de tu primera compra» con términos, reembolsos y edad', /Antes de tu primera compra/.test(legal || '') && /Reembolsos/.test(legal || '') && /a[ñn]os/.test(legal || ''), (legal || '').slice(0, 160));
    const rule = await page.evaluate(() => ({ legal: (document.querySelector('.legal-buy-p') || {}).textContent, rule: premiumRuleText(), pieces: PIECES_FOR_BRASAS }));
    check('el texto legal previo a la compra NO afirma «nunca poder» si las piezas de set se venden por Brasas (coincide con la regla vigente)', rule.legal.includes(rule.rule) && (!rule.pieces || !/nunca poder/i.test(rule.legal)), rule);
    await page.evaluate(() => [...document.querySelectorAll('.legal-modal .btn')].find(b => /Continuar/.test(b.textContent)).click()); await sleep(200);
    check('sin aceptar la casilla no se avanza y se explica por qué', await page.evaluate(() => /Marc[aá] la casilla/.test((document.querySelector('.legal-err') || {}).textContent || '') && !!document.querySelector('.legal-modal')));
    await page.evaluate(() => { document.getElementById('legal-buy-cb').click(); [...document.querySelectorAll('.legal-modal .btn')].find(b => /Continuar/.test(b.textContent)).click(); }); await sleep(700);
    const dlg = await page.evaluate(() => (document.querySelector('#game-dialog .gd-msg') || {}).innerText);
    check('resumen previo al pago: cantidad, importe con moneda y que se va a la página de pago', /550 Brasas/.test(dlg || '') && /US\$ 4,99/.test(dlg || '') && /p[aá]gina de pago/i.test(dlg || ''), dlg);
    await tap('#game-dialog .gd-cancel'); await sleep(300);
    check('cancelar no llama al servidor', await page.evaluate(() => window.__co.length === 0));
    // 501 / error: dicen que no se cobró; sin pedidos duplicados con respuesta lenta
    for (const mode of ['501', 'err']) { await page.evaluate(m => { window.__mode = m; window.__co.length = 0; }, mode); await tap('[data-brasas-buy]'); await sleep(300); await tap('#game-dialog .gd-ok'); await sleep(900);
      const msg = await page.evaluate(() => (document.querySelector('#game-dialog .gd-msg') || {}).innerText); check(`checkout ${mode}: el mensaje dice que no se cobró nada o que todavía no hay pagos`, /no se cobr|Muy pronto/i.test(msg || ''), msg); await tap('#game-dialog .gd-ok').catch(() => {}); await sleep(300); }
    await page.evaluate(() => { window.__mode = 'ok'; window.__delay = 1200; window.__co.length = 0; }); await tap('[data-brasas-buy]'); await sleep(300); await tap('#game-dialog .gd-ok'); await sleep(300);
    const dis = await page.evaluate(() => ({ disabled: document.querySelector('[data-brasas-buy]').disabled })); await page.evaluate(() => document.querySelector('[data-brasas-buy]') && document.querySelector('[data-brasas-buy]').click()); await sleep(1500);
    const reqs = await page.evaluate(() => window.__co.length);
    check('respuesta lenta: el botón queda bloqueado y hay un solo pedido de pago aunque se toque de nuevo', dis.disabled && reqs === 1, { dis, reqs });
    check('sin errores de página', errors.length === 0, errors);
  } finally { await browser.close(); srv.kill(); }
  console.log(fails ? 'RESULT FAIL (' + fails + ')' : 'RESULT OK'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
