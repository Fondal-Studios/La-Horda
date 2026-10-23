// PIEZAS DE SET CON BRASAS ✦: el equipo del set se compra con Brasas (servidor autoritativo) y NO con oro.
//   1) rutas de oro inoperantes aunque se llamen desde la consola con 1e9 de oro (demo y live): ni piezas ni paquete ni skin,
//   2) UI: Tienda (Objetos y "A la venta hoy"), ficha de la pieza y Colección del Códice muestran "✦ 200"; ningún botón de oro para piezas de set,
//   3) sin cuenta: el aviso de siempre y nada se otorga,
//   4) compra de punta a punta contra el SERVIDOR REAL (en este proceso): cobro, entrega en la nube, colección, regalo del set completo,
//      y un cliente nuevo que carga el guardado de la nube recibe las piezas completas,
//   5) tienda "live": solo se venden las piezas que salen hoy (cliente y servidor), al mismo precio en Brasas,
//   6) interruptor PIECES_FOR_BRASAS apagado: sin botones ni compra (cliente y servidor), y el oro sigue sin comprar piezas,
//   7) guardados viejos (sin campos nuevos, con piezas y skins ganadas jugando) siguen cargando y equipando.
//   (python3 -m http.server 8771 &) ; SE_BASE_URL=http://127.0.0.1:8771 node tools/items/t_piezas_brasas.js
process.env.PORT = process.env.PIEZAS_SERVER_PORT || '8824'; process.env.DATABASE_URL = ''; process.env.ADMIN_USERS = 'Director'; process.env.ALLOWED_ORIGINS = '*';
delete process.env.PAYMENTS_PROVIDER; delete process.env.PAYMENTS_WEBHOOK_SECRET;
const fs = require('fs'), os = require('os'), path = require('path'), crypto = require('crypto');
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'horda-piezas-'));
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const { server, accounts } = require('../../server/relay');
const wallet = require('../../server/wallet');
const BASE = process.env.SE_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:8771';
const API = 'http://127.0.0.1:' + process.env.PORT;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 500) : '')); if (!ok) fails++; };
async function api(method, p, body, token) {
  const r = await fetch(API + p, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  let j = null; try { j = await r.json(); } catch (e) {}
  return { status: r.status, j };
}
(async () => {
  await accounts.ready;
  const AT = (await api('POST', '/api/register', { user: 'Director', pass: 'espada123' })).j.token;
  const UT = (await api('POST', '/api/register', { user: 'Jugador', pass: 'espada123' })).j.token;
  const uid = (await api('GET', '/api/gm/users', undefined, AT)).j.users.find(u => u.user === 'Jugador').id;
  const credit = amount => api('POST', '/api/gm/user/premium', { id: uid, amount, reason: 'prueba piezas', ref: crypto.randomUUID() }, AT);
  const premium = async () => (await api('GET', '/api/wallet', undefined, UT)).j.premium;

  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, args: ['--no-sandbox'] });
  const page = await (await browser.newContext({ viewport: { width: 1000, height: 600 } })).newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g|net::|404/.test(m.text())) errors.push('console: ' + m.text().slice(0, 300)); });
  await page.exposeFunction('nodeApi', (method, p, body) => api(method, p, body === null ? undefined : body, UT));
  await page.addInitScript(() => { window.__campaignMode = true; });
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 180000 });
  for (let k = 0; k < 300; k++) { if (await page.evaluate(() => !document.getElementById('title-continue-btn').disabled)) break; await sleep(100); }
  const E = (fn, a) => page.evaluate(fn, a);
  await E(() => { loop = function(){}; cromaLoadAll(); window.__alerts = []; gameAlert = function(m){ window.__alerts.push(String(m)); return Promise.resolve(); };
    gameConfirm = function(){ return Promise.resolve(true); }; });

  // ---------- 0) catálogo y precio ----------
  const cat = await E(() => {
    const sets = shopCatalog().filter(e => e.cat === 'set');
    const withSkin = Object.keys(SET_SKINS).filter(id => SET_DB[id] && setPieceIds(id).every(p => DESIGNED_ITEMS[p] && shopCatalog().some(e => e.id === p)));
    return { n: sets.length, prices: [...new Set(sets.map(e => premiumPiecePrice(e.id)))], setWithSkin: withSkin.find(id => setPieceIds(id).length >= 4), flag: PIECES_FOR_BRASAS, mode: SHOP_MODE };
  });
  check('CATALOGO.todas_las_piezas_de_set_cuestan_200_Brasas', cat.n > 0 && cat.prices.length === 1 && cat.prices[0] === 200 && cat.flag === true && cat.mode === 'demo', cat);
  const SET = cat.setWithSkin;

  // ---------- 1) oro: ninguna ruta compra piezas ni regala skins ----------
  const goldTest = async (mode) => E((mode) => {
    SHOP_MODE = mode; _shopRotCtx = null; _shopRotNext = null; state = 'menu';
    save.gold = 1e9; save.stash = []; save.collection = {}; save.cosmeticUnlocks = {}; save.shop = null; save.shopDeals = null;
    for (const k in save.champions) save.champions[k].unlocked = true;
    const gold0 = save.gold, bad = [];
    const sets = Object.keys(SET_DB), pieces = shopCatalog().filter(e => e.cat === 'set');
    for (const e of pieces) {
      const calls = { catalog: () => shopBuyCatalog(e.key), catalogPrecio: () => shopBuyCatalog(e.key, undefined, null, shopPriceOf(e)), catalogBarato: () => shopBuyCatalog(e.key, undefined, 1), catalogCero: () => shopBuyCatalog(e.key, undefined, 0) };
      for (const [n, fn] of Object.entries(calls)) { let r; try { r = fn(); } catch (err) { r = { ok: false }; } if (r && r.ok) bad.push(n + ':' + e.id); }
    }
    for (const sid of sets) {
      const calls = { paquete: () => shopBuySetBundle(sid, false), paquetePrecio: () => shopBuySetBundle(sid, false, null, shopSetPrice(sid)), paqueteDesc: () => shopBuySetBundle(sid, false, SHOP_DEAL_OFF[0]), skin: () => shopBuySetBundle(sid, true), skinGold: () => shopBuySkinGold(sid) };
      for (const [n, fn] of Object.entries(calls)) { let r; try { r = fn(); } catch (err) { r = { ok: false }; } if (r && r.ok) bad.push(n + ':' + sid); }
    }
    let deals = 0; for (const d of shopDailyShowcase().deals) { const e = shopCatalog().find(x => x.key === d.key); const r = shopBuyDeal(d.id); if (r.ok && e.cat === 'set') bad.push('deal:' + e.id); if (r.ok) deals++; }
    const f = shopDailyShowcase().featured; let fr = f ? shopBuyFeatured(f) : null;
    const setsOwned = shopCatalog().filter(e => e.cat === 'set' && stashItems().some(it => it.designId === e.id)).length;
    return { mode, bad: bad.slice(0, 6), setsOwned, skins: Object.keys(save.cosmeticUnlocks).length, featOk: !!(fr && fr.ok && f.kind === 'skin'), reason: shopBuyCatalog(pieces[0].key).reason };
  }, mode);
  for (const mode of ['demo', 'live']) {
    const g = await goldTest(mode);
    check(`ORO.${mode}.ninguna_ruta_de_oro_compra_piezas_de_set`, g.bad.length === 0 && g.setsOwned === 0, g);
    check(`ORO.${mode}.no_hay_skins_gratis_por_oro`, g.skins === 0 && !g.featOk, g);
    check(`ORO.${mode}.el_mensaje_manda_a_Brasas`, /Brasas/.test(g.reason), g.reason);
  }
  const goldRest = await E(() => {
    SHOP_MODE = 'demo'; _shopRotCtx = null; _shopRotNext = null; save.gold = 1e9; save.stash = []; save.collection = {};
    const legend = shopCatalog().find(e => e.cat === 'legendario'), basic = shopCatalog().find(e => e.kind === 'archetype');
    const a = shopBuyCatalog(legend.key), b = shopBuyCatalog(basic.key, 'raro');
    return { legendarioOk: a.ok, basicoOk: b.ok };
  });
  check('ORO.lo_demas_sigue_comprandose_con_oro (legendarios y equipo basico)', goldRest.legendarioOk && goldRest.basicoOk, goldRest);

  // ---------- 2) UI ----------
  const ui = await E((SET) => {
    SHOP_MODE = 'demo'; _shopRotCtx = null; save.gold = 1e9; save.stash = []; save.collection = {}; save.cosmeticUnlocks = {}; state = 'menu';
    acct.session = null; PREMIUM.premium = null;
    setState('shop'); shopTab = 'objetos'; shopCat = 'set'; renderShop();
    const p = document.getElementById('shop-panel');
    const piecesIn = [...p.querySelectorAll('.shop-set-pieces .shop-item')];
    const out = { cards: piecesIn.length, goldBuy: p.querySelectorAll('[data-buy-item],[data-buy-set],.shop-set-buyall').length,
      prem: p.querySelectorAll('[data-piece-premium]').length, ember: [...p.querySelectorAll('[data-piece-premium]')].every(b => /^✦\s*200$/.test(b.textContent.trim())),
      goldPriceInPieces: piecesIn.filter(c => /🪙/.test(c.querySelector('.shop-item-buy').textContent)).length };
    // categoría legendarios mantiene oro
    shopCat = 'legendario'; renderShop(); out.legendGold = document.querySelectorAll('#shop-panel [data-buy-item]').length;
    // ficha de la pieza
    const e = shopCatalog().find(x => x.id === setPieceIds(SET)[0]);
    openShopItemPreview(e, undefined);
    const ip = document.getElementById('item-preview');
    out.fichaPrem = ip.querySelectorAll('[data-piece-premium]').length; out.fichaGold = ip.querySelectorAll('[data-ip-buy]').length + (/🪙/.test(ip.querySelector('.ip-actions').textContent) ? 1 : 0);
    out.fichaTxt = ip.querySelector('[data-piece-premium]') && ip.querySelector('[data-piece-premium]').textContent.trim();
    ip.classList.add('hidden'); ip.innerHTML = '';
    // Colección (Códice)
    const h = document.createElement('div'); h.innerHTML = codexSetHtml(SET);
    out.codex = h.querySelectorAll('[data-piece-premium]').length; out.codexGold = h.querySelectorAll('[data-buy-item],[data-buy-set]').length;
    return out;
  }, SET);
  check('UI.tienda_objetos_sin_botones_de_oro_para_piezas_de_set', ui.cards > 0 && ui.goldBuy === 0 && ui.goldPriceInPieces === 0, ui);
  check('UI.tienda_muestra_el_boton_de_Brasas_con_el_precio', ui.prem > 0 && ui.ember, ui);
  check('UI.los_legendarios_siguen_con_boton_de_oro', ui.legendGold > 0, ui.legendGold);
  check('UI.ficha_de_pieza_con_boton_de_Brasas_y_sin_oro', ui.fichaPrem === 1 && ui.fichaGold === 0 && /^✦\s*200$/.test(ui.fichaTxt || ''), ui);
  check('UI.coleccion_del_codice_con_boton_de_Brasas', ui.codex > 0 && ui.codexGold === 0, ui);

  // ---------- 3) sin cuenta ----------
  const noAcct = await E(async (SET) => {
    state = 'menu'; window.__alerts.length = 0; acct.session = null; const g0 = save.gold, id = setPieceIds(SET)[0];
    const r = await premiumBuyPiece(id);
    setState('shop'); shopTab = 'objetos'; shopCat = 'set'; renderShop();
    const b = document.querySelector('#shop-panel [data-piece-premium]'); b.click(); await new Promise(r => setTimeout(r, 100));
    return { r, alerts: window.__alerts.slice(), stash: stashItems().length, goldIgual: save.gold === g0 };
  }, SET);
  check('SIN_CUENTA.pide_entrar_y_no_otorga', !noAcct.r.ok && /cuenta/.test(noAcct.r.reason) && noAcct.alerts.some(a => /cuenta/.test(a)) && noAcct.stash === 0 && noAcct.goldIgual, noAcct);

  // ---------- 4) compra de punta a punta contra el servidor real ----------
  await credit(1500);
  const brasas0 = await premium();
  const e2e = await E(async (SET) => {
    SHOP_MODE = 'demo'; _shopRotCtx = null; state = 'menu';
    window.accountFetch = accountFetch = (m, p, b) => window.nodeApi(m, p, b === undefined ? null : b);
    acct.session = { token: 't', apiBase: 'x' };
    save.gold = 123456; save.stash = []; save.collection = {}; save.cosmeticUnlocks = {}; save.cromas = {};
    persistNow();
    const up = await window.nodeApi('PUT', '/api/save', { data: JSON.parse(localStorage.getItem(SAVE_KEY)), baseVersion: 0 });
    PREMIUM.at = 0; await premiumRefresh(true);
    const ids = setPieceIds(SET), log = [], g0 = save.gold;
    for (let i = 0; i < ids.length; i++) {
      const owned = skinOwnedFull(SET);
      const r = await premiumBuyPiece(ids[i]);
      log.push({ id: ids[i], ok: r.ok, reason: r.reason, completed: !!r.setCompleted, premium: r.premium, skinBefore: owned, skinAfter: skinOwnedFull(SET), has: stashItems().some(it => it.designId === ids[i]) });
    }
    const again = await premiumBuyPiece(ids[0]);
    const it = stashItems().find(x => x.designId === ids[0]);
    return { putOk: up.status === 200, log, again: again.reason, goldIgual: save.gold === g0, n: ids.length, stash: stashItems().length, itemFull: !!(it && it.name && it.desc && it.value > 0 && it.set === SET && it.bought === true),
      unlocked: !!save.cosmeticUnlocks[SET], collected: cosmeticSetCollected(SET) };
  }, SET);
  const lastE = e2e.log[e2e.log.length - 1];
  check('E2E.cada_pieza_se_compra_y_llega_al_inventario', e2e.putOk && e2e.log.every(l => l.ok && l.has) && e2e.stash === e2e.n, e2e);
  check('E2E.la_skin_aparece_solo_con_la_ultima_pieza', e2e.log.slice(0, -1).every(l => !l.skinAfter) && lastE.completed && lastE.skinAfter && e2e.unlocked && e2e.collected, e2e.log.map(l => [l.skinAfter, l.completed]));
  check('E2E.el_oro_del_cliente_no_se_toca_y_la_pieza_es_un_objeto_completo', e2e.goldIgual && e2e.itemFull, e2e);
  check('E2E.no_se_vende_dos_veces_la_misma_pieza', /tenés/i.test(e2e.again) || /Ya la/.test(e2e.again), e2e.again);
  const spent = brasas0 - (await premium());
  check('E2E.el_servidor_cobro_exactamente_200_por_pieza', spent === 200 * e2e.n, { spent, n: e2e.n });
  const cloud = (await api('GET', '/api/save', undefined, UT)).j.data;
  check('E2E.la_nube_tiene_las_piezas_la_coleccion_y_la_skin', cloud.stash.filter(x => x.srvGrant).length === e2e.n && cloud.cosmeticUnlocks[SET] === true && Object.keys(cloud.collection).length >= e2e.n, { n: cloud.stash.length });
  // un cliente nuevo carga el guardado de la nube: las piezas se completan solas
  const fresh = await E(({ cloudData, SET }) => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(cloudData)); acct.session = null; loadSave();
    const its = stashItems().filter(it => it.set === SET), k = Object.keys(save.champions).find(c => save.champions[c].unlocked);
    return { n: its.length, hydrated: its.every(it => !it.srvGrant && it.value > 0 && it.name && it.desc && it.icon), uids: its.every(it => /^it_srv_/.test(it.uid)), skin: skinOwnedFull(SET),
      equip: its.every(it => canEquipItem(it.champion || k, it)) };
  }, { cloudData: cloud, SET });
  check('E2E.un_cliente_nuevo_hidrata_las_piezas_del_servidor', fresh.n === e2e.n && fresh.hydrated && fresh.uids && fresh.skin && fresh.equip, fresh);

  // ---------- 5) tienda live ----------
  await credit(2000);
  wallet.setTestFlags({ SHOP_MODE: 'live' });   // el servidor también en modo live
  const live = await E(async (SET) => {
    SHOP_MODE = 'live'; _shopRotCtx = null; _shopRotNext = null; state = 'menu';
    acct.session = { token: 't', apiBase: 'x' }; save.stash = []; save.collection = {}; save.cosmeticUnlocks = {}; persistNow();
    const up = await window.nodeApi('PUT', '/api/save', { data: JSON.parse(localStorage.getItem(SAVE_KEY)), baseVersion: (await window.nodeApi('GET', '/api/save', null)).j.version });
    PREMIUM.at = 0; await premiumRefresh(true);
    const today = shopRotationToday().filter(e => e.cat === 'set'), off = shopCatalog().find(e => e.cat === 'set' && !shopRotationHas(e.key));
    setState('shop'); shopTab = 'objetos'; shopCat = 'set'; renderShop();
    const btnOn = today.length ? document.querySelector(`#shop-panel [data-piece-premium="${today[0].id}"]`) : null, btnOff = document.querySelector(`#shop-panel [data-piece-premium="${off.id}"]`);
    shopTab = 'destacados'; renderShop();
    const rotCards = [...document.querySelectorAll('[data-rot]')].filter(c => c.querySelector('[data-piece-premium]')).length;
    const rotGoldSet = [...document.querySelectorAll('[data-rot]')].filter(c => c.querySelector('[data-rot-buy]') && shopCatalog().find(e => e.key === c.getAttribute('data-rot')).cat === 'set').length;
    const rOff = await premiumBuyPiece(off.id);
    // el servidor también lo rechaza si el cliente lo saltea
    const direct = await window.nodeApi('POST', '/api/wallet/buy-piece', { piece: off.id, ref: 'directo-' + Date.now() + '-xx', expectedPrice: 200 });
    const rOn = today.length ? await premiumBuyPiece(today[0].id) : { ok: false, reason: 'no hay piezas de set hoy' };
    return { today: today.length, btnOnDisabled: btnOn ? btnOn.disabled : null, btnOffDisabled: btnOff ? btnOff.disabled : null, rotCards, rotGoldSet, rOff: rOff.reason, direct: direct.status + ':' + (direct.j && direct.j.error), rOn: rOn.ok, has: today.length ? stashItems().some(it => it.designId === today[0].id) : null };
  }, SET);
  check('LIVE.piezas_de_hoy_con_boton_activo_y_las_otras_deshabilitadas', live.today > 0 && live.btnOffDisabled === true && live.btnOnDisabled !== true && live.rotGoldSet === 0, live);
  check('LIVE.el_cliente_rechaza_una_pieza_que_no_sale_hoy_y_vende_la_de_hoy', /no está a la venta hoy/i.test(live.rOff) && live.rOn && live.has, live);
  check('LIVE.el_pedido_directo_al_servidor_de_una_pieza_fuera_de_rotacion_se_rechaza', live.direct === '409:NOT_ON_SALE', live.direct);
  const direct2 = await E(async () => {
    const off = shopCatalog().find(e => e.cat === 'set' && !shopRotationHas(e.key));
    const r = await window.nodeApi('POST', '/api/wallet/buy-piece', { piece: off.id, ref: 'directo-' + Date.now() + '-yy', expectedPrice: 200 });
    return r.status + ':' + (r.j && r.j.error);
  });
  check('LIVE.el_servidor_tambien_rechaza_una_pieza_que_no_sale_hoy (saltando al cliente)', direct2 === '409:NOT_ON_SALE', direct2);
  wallet.setTestFlags(null);

  // ---------- 6) interruptor apagado ----------
  wallet.setTestFlags({ PIECES_FOR_BRASAS: false });
  const off = await E(async (SET) => {
    SHOP_MODE = 'demo'; _shopRotCtx = null; PIECES_FOR_BRASAS = false; state = 'menu';
    const g0 = save.gold, stash0 = stashItems().length, id = setPieceIds(SET).find(p => !stashItems().some(it => it.designId === p)) || setPieceIds(SET)[0];
    setState('shop'); shopTab = 'objetos'; shopCat = 'set'; renderShop();
    const p = document.getElementById('shop-panel');
    const r = await premiumBuyPiece(id);
    const direct = await window.nodeApi('POST', '/api/wallet/buy-piece', { piece: id, ref: 'apagado-' + Date.now() + '-zz', expectedPrice: 200 });
    const gold = shopBuyCatalog(shopCatalog().find(e => e.id === id).key);
    PIECES_FOR_BRASAS = true;
    return { btns: p.querySelectorAll('[data-piece-premium]').length, goldBtns: p.querySelectorAll('[data-buy-item],[data-buy-set]').length, note: /Se consigue jugando/.test(p.textContent), r: r.reason, direct: direct.status + ':' + (direct.j && direct.j.error),
      goldOk: gold.ok, stashIgual: stashItems().length === stash0, goldIgual: save.gold === g0 };
  }, SET);
  wallet.setTestFlags(null);
  check('APAGADO.sin_botones_y_el_cliente_no_compra', off.btns === 0 && off.goldBtns === 0 && off.note && !!off.r && off.stashIgual, off);
  check('APAGADO.el_servidor_responde_PIECES_OFF', off.direct === '403:PIECES_OFF', off.direct);
  check('APAGADO.el_oro_tampoco_compra_piezas (apagar no reabre la puerta)', !off.goldOk && off.goldIgual, off);

  // ---------- 7) guardados viejos ----------
  const legacy = await E((SET) => {
    SHOP_MODE = 'demo'; _shopRotCtx = null; acct.session = null;
    const ids = setPieceIds(SET), k = Object.keys(save.champions).find(c => save.champions[c].unlocked);
    // guardado de antes: piezas ganadas jugando, sin ningún campo nuevo, y una skin ganada
    const items = ids.slice(0, 2).map(id => makeDesignedItem(id));
    const old = JSON.parse(localStorage.getItem(SAVE_KEY)); old.stash = items; old.collection = {}; old.cosmeticUnlocks = {}; delete old.shop; delete old.shopDeals;
    localStorage.setItem(SAVE_KEY, JSON.stringify(old)); loadSave();
    const a = ids.slice(0, 2).every(id => premiumPieceOwned(id)) && premiumPieceButton(ids[0]) === '' && /data-piece-premium/.test(premiumPieceButton(ids[2]));
    const eqOk = items.every(it => { try { return !!canEquipItem(it.champion || k, stashItems().find(x => x.uid === it.uid)); } catch (e) { return false; } });
    // completar lo que falta por drop (camino de siempre): regala la skin
    for (const id of ids.slice(2)) { const it = makeDesignedItem(id); addItemToInventory(null, it); }
    return { a, eqOk, skin: skinOwnedFull(SET), unlocked: !!save.cosmeticUnlocks[SET], hadSrvGrant: stashItems().some(it => it.srvGrant) };
  }, SET);
  check('GUARDADOS.viejos_cargan_y_las_piezas_de_drop_siguen_funcionando', legacy.a && legacy.eqOk && !legacy.hadSrvGrant, legacy);
  check('GUARDADOS.el_set_completo_por_drop_sigue_regalando_la_skin', legacy.skin, legacy);

  check('sin_errores_de_pagina', errors.length === 0, errors.slice(0, 5));
  await browser.close(); server.close();
  console.log(fails ? `\n${fails} FALLAS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
