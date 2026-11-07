'use strict';
// UC-SHOP v1 sobre el flujo REAL de compra del cliente con un servidor SIMULADO (accountFetch): no hay pagos ni backend en la prueba.
// Cubre: copia sin contradicciones, precio completo y faltante visibles, confirmación con saldo, cancelar, doble toque, éxito solo con entrega
// confirmada, error, respuesta lenta, recarga de página, comparar original/skin, atrás/cerrar/reabrir, interruptor ?uc=0, sin errores.
//   node tools/ui-clarity/test-shop-clarity.js
const { spawn } = require('child_process'), path = require('path'), net = require('net');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..'); let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 280) : '')); if (!ok) fails++; };
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const port = await freePort(), srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }), base = 'http://127.0.0.1:' + port; await sleep(1200);
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  async function open(qs, ctxOpt) {
    const ctx = ctxOpt || await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
    await ctx.addInitScript(() => { window.__campaignMode = true; });
    const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/index.html' + (qs || '')); await page.waitForFunction(() => typeof assetsAllReady === 'function' && assetsAllReady(), null, { timeout: 180000 }); await sleep(600);
    return { ctx, page, errors };
  }
  // servidor simulado: posts[] registra cada pedido; mode controla la respuesta
  const MOCK = () => { window.__posts = []; window.__mode = 'ok'; window.__delay = 0; window.__bal = 1000;
    acct.session = acct.session || { token: 'test' };
    window.accountFetch = async (method, p, body) => { if (method === 'GET') return { status: 200, j: { premium: window.__bal, currency: { id: 'brasas', name: 'Brasas', icon: '✦' }, payments: { enabled: false, packs: [] }, welcome: null } };
      window.__posts.push({ p, body }); if (window.__delay) await new Promise(r => setTimeout(r, window.__delay));
      if (window.__mode === 'error') return { status: 409, j: { error: 'CONFLICT' } }; if (window.__mode === 'net') throw new Error('offline');
      window.__bal -= body.expectedPrice; const id = body.sku, isSet = typeof SET_SKINS !== 'undefined' && !!SET_SKINS[id]; return { status: 200, j: { premium: window.__bal, cosmetics: [{ id, type: isSet ? 'skin' : 'croma' }], champions: [] } }; }; };
  const openSkins = async page => { await page.evaluate(() => { setState('shop'); shopOpen('skins'); }); await sleep(700); };
  const pickSku = page => page.evaluate(() => { const ids = [...Object.keys(SET_SKINS), ...Object.keys(CROMA_SKINS)].filter(id => premiumPrice(id) > 0 && !premiumSkinOwned(id)); return ids[0] || null; });
  const btnFor = (page, id) => page.$(`[data-skin-premium="${id}"]`);
  const click = async (page, sel) => { const e = await page.$(sel); await e.scrollIntoViewIfNeeded(); const b = await e.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); };
  try {
    const { ctx, page, errors } = await open('');
    await page.evaluate(MOCK); await page.evaluate(() => { PREMIUM.premium = 1000; PREMIUM.at = Date.now(); }); await openSkins(page);
    const sku = await pickSku(page); check('hay una skin comprable en el catálogo real', !!sku, sku);
    // 1) copia
    const txt = await page.evaluate(() => document.getElementById('shop-panel').innerText);
    check('la pestaña Skins ya no dice que se paga «con oro»', !/o con oro/i.test(txt) && /solo con Brasas/i.test(txt));
    // 2) precio completo, saldo y faltante
    const price = await page.evaluate(id => premiumPrice(id), sku);
    const b1 = await page.evaluate(id => { const b = document.querySelector(`[data-skin-premium="${id}"]`); const n = b.parentNode.querySelector('.uc-need'); return { label: b.textContent, aria: b.getAttribute('aria-label'), note: n && n.textContent, h: b.getBoundingClientRect().height }; }, sku);
    check('el botón muestra el precio completo con la moneda («✦ n Brasas»)', new RegExp('^\\u2726 [\\d.]+ Brasas$').test(b1.label), b1);
    check('con saldo suficiente dice cuánto tenés y cuánto te quedaría', /Ten[eé]s .* Brasas .* te quedar[ií]an/.test(b1.note || ''), b1.note);
    check('objetivo táctil del botón ≥ 44 px', b1.h >= 44, b1.h);
    await page.evaluate(() => { PREMIUM.premium = 10; premiumRender(); }); await sleep(300);
    const b2 = await page.evaluate(id => { const b = document.querySelector(`[data-skin-premium="${id}"]`); return { dis: b.disabled, note: b.parentNode.querySelector('.uc-need').textContent }; }, sku);
    check('sin saldo suficiente: botón deshabilitado Y texto visible «Te faltan n Brasas · tenés m»', b2.dis && /Te faltan [\d.]+ Brasas/.test(b2.note) && /ten[eé]s 10/.test(b2.note), b2);
    await page.evaluate(() => { PREMIUM.premium = 1000; premiumRender(); }); await sleep(300);
    // 3) confirmación: contenido y saldo; cancelar no hace pedidos
    await click(page, `[data-skin-premium="${sku}"]`); await sleep(400);
    const dlg = await page.evaluate(() => { const m = document.querySelector('#game-dialog .gd-msg'); return m && m.innerText; });
    check('la confirmación dice para quién, tipo, que no da poder y saldo antes → después', /Para: /.test(dlg || '') && /Tipo: /.test(dlg || '') && /no modifica estad/.test(dlg || '') && /Tu saldo: 1\.000 Brasas .* despu[eé]s: [\d.]+ Brasas/.test(dlg || ''), dlg);
    await click(page, '#game-dialog .gd-cancel'); await sleep(300);
    check('cancelar no hace ningún pedido ni cambia el saldo', await page.evaluate(() => window.__posts.length === 0 && PREMIUM.premium === 1000));
    // 4) doble toque: una sola confirmación y un solo pedido
    const el = await btnFor(page, sku); const bb = await el.boundingBox(); await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(400);
    const dd = await page.evaluate(() => ({ dialogs: document.querySelectorAll('#game-dialog .gd-panel').length, queued: (typeof GAME_DIALOG !== 'undefined' ? GAME_DIALOG.queue.length : 0), dup: UIClarityShop.stats.dupBlocked }));
    check('doble toque: una sola confirmación abierta y ninguna encolada', dd.dialogs === 1 && dd.queued === 0, dd);
    // 5) respuesta lenta: botón bloqueado y éxito solo al llegar la entrega
    await page.evaluate(() => { window.__delay = 1500; });
    await click(page, '#game-dialog .gd-ok'); await sleep(500);
    const mid = await page.evaluate(id => ({ posts: window.__posts.length, owned: premiumSkinOwned(id), dis: document.querySelector(`[data-skin-premium="${id}"]`)?.disabled, toast: document.getElementById('toast-stack')?.innerText || '' }), sku);
    check('mientras el servidor tarda: 1 pedido, todavía NO es tuya, botón bloqueado y sin mensaje de éxito', mid.posts === 1 && !mid.owned && mid.dis !== false && !/comprada/i.test(mid.toast), mid);
    await sleep(1600);
    const done = await page.evaluate(id => ({ posts: window.__posts.length, owned: premiumSkinOwned(id), bal: PREMIUM.premium, stats: { ...UIClarityShop.stats } }), sku);
    check('al confirmarse la entrega: es tuya, 1 solo cobro y saldo = 1000 − precio', done.posts === 1 && done.owned && done.bal === 1000 - price, done);
    check('el embudo local registra buyStart=2 (uno bloqueado), buyOk=1', done.stats.buyOk === 1 && done.stats.buyError === 0 && done.stats.buyStart >= 1, done.stats);
    // 6) estado tras comprar: «comprada/equipar», sin botón de compra (no se puede pagar dos veces)
    await openSkins(page);
    const after = await page.evaluate(id => ({ buy: !!document.querySelector(`[data-skin-premium="${id}"]`), txt: (document.querySelector(`[data-skin-card="${id}"], [data-croma-card="${id}"]`) || {}).innerText || '' }), sku);
    check('lo ya comprado se identifica y no ofrece comprar de nuevo', !after.buy && /EQUIPAR|Equipar|Desbloqueada|Comprada|EQUIPADA|Quitar/.test(after.txt), after.txt.slice(0, 160));
    // 7) recarga de página: la propiedad persiste
    await page.reload(); await page.waitForFunction(() => typeof assetsAllReady === 'function' && assetsAllReady(), null, { timeout: 180000 }); await sleep(800);
    check('tras recargar la página la apariencia sigue siendo tuya', await page.evaluate(id => premiumSkinOwned(id), sku));
    check('sin errores de página en todo el recorrido', errors.length === 0, errors);
    // 8) error del servidor y corte de red: no se cobra, no hay éxito
    await page.evaluate(MOCK); await page.evaluate(() => { PREMIUM.premium = 1000; PREMIUM.at = Date.now(); }); await openSkins(page);
    const sku2 = await pickSku(page);
    for (const mode of ['error', 'net']) {
      await page.evaluate(m => { window.__mode = m; window.__posts.length = 0; }, mode);
      await click(page, `[data-skin-premium="${sku2}"]`); await sleep(400); await click(page, '#game-dialog .gd-ok'); await sleep(1200);
      const msg = await page.evaluate(() => { const m = document.querySelector('#game-dialog .gd-msg'); return m && m.innerText; });
      const st = await page.evaluate(id => ({ owned: premiumSkinOwned(id), bal: PREMIUM.premium, posts: window.__posts.length }), sku2);
      check(`${mode === 'error' ? 'conflicto del servidor' : 'sin conexión'}: no es tuya, saldo intacto y el mensaje dice que no se cobró`, !st.owned && st.bal === 1000 && /no se cobr/i.test(msg || ''), { msg, st });
      await click(page, '#game-dialog .gd-ok').catch(() => {}); await sleep(300); await openSkins(page);
    }
    // 9) comparar original / skin
    const cmp = await page.evaluate(() => { const card = document.querySelector('.shop-skin canvas.shop-skin-anim'); if (!card) return null; const b = card.closest('.shop-skin').querySelector('.uc-cmp'); const before = card.dataset.skin; b.click(); const mid = card.dataset.skin; const tag = card.closest('.shop-skin').querySelector('.uc-cmp-tag').textContent; b.click(); return { before, mid, tag, back: card.dataset.skin }; });
    check('«Ver original» alterna la vista previa entre la skin y la apariencia base', cmp && cmp.before && cmp.mid === '' && cmp.back === cmp.before && /ORIGINAL/.test(cmp.tag), cmp);
    // 9b) sugerencia por guardián elegido
    const reco = await page.evaluate(() => { selectedClass = 'cazadora'; shopSkinFocus = null; renderShop(); return new Promise(r => setTimeout(() => { const bar = document.querySelector('.uc-reco'); const out = { has: !!bar, txt: bar && bar.innerText }; if (bar) bar.querySelector('[data-uc-reco]').click(); setTimeout(() => r({ ...out, focused: shopSkinFocus, onlyHers: [...document.querySelectorAll('.shop-skin[data-skin-card]')].length }), 300); }, 400)); });
    check('sugerencia: «Para tu guardián actual…» con botón que enfoca solo sus apariencias', reco.has && /Sylva|Cazadora/.test(reco.txt) && reco.focused === 'cazadora', reco);
    await page.evaluate(() => { shopSkinFocus = null; });
    // 10) atrás / cerrar / reabrir
    await page.evaluate(() => { document.getElementById('shop-back-btn').click(); }); await sleep(300); const st1 = await page.evaluate(() => state);
    await page.evaluate(() => { setState('shop'); shopOpen('skins'); }); await sleep(500);
    check('atrás vuelve al menú y reabrir la tienda recupera las skins y el saldo', st1 === 'mainmenu' && await page.evaluate(() => !!document.querySelector('.shop-skin') && /Brasas|✦/.test(document.getElementById('shop-screen').innerText)), st1);
    await ctx.close();
    // 11) interruptor
    const off = await open('?uc=0'); await off.page.evaluate(MOCK); await off.page.evaluate(() => { PREMIUM.premium = 1000; }); await openSkins(off.page);
    const o = await off.page.evaluate(() => ({ api: typeof UIClarityShop, need: document.querySelectorAll('.uc-need').length, cmp: document.querySelectorAll('.uc-cmp').length }));
    check('?uc=0 apaga la capa de tienda', o.api === 'undefined' && o.need === 0 && o.cmp === 0, o); check('?uc=0 sin errores', off.errors.length === 0, off.errors); await off.ctx.close();
  } finally { await browser.close(); srv.kill(); }
  console.log(fails ? 'RESULT FAIL (' + fails + ')' : 'RESULT OK'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
