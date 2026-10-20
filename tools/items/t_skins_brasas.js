// SKINS SOLO CON BRASAS ✦: ninguna apariencia (skin de set, de autor o croma) se compra con oro.
// El oro vive en el guardado del cliente (editable): una ruta oro -> skin regalaría skins. Verifica:
//   1) todas las skins vendibles tienen precio en Brasas y NINGUNA ruta de oro las otorga (llamada directa desde la consola
//      incluida: shopBuySkinGold, cromaBuy, shopBuySetBundle(apariencia), shopBuySkin, shopBuyFeatured),
//   2) la UI (Tienda: destacados/skins, Códice, Sala) no deja botones de oro para skins y muestra el precio en ✦,
//   3) sin cuenta, el botón ✦ da el aviso de siempre ("entrar con tu cuenta") y no otorga nada,
//   4) la compra con Brasas sigue funcionando (servidor simulado: mismo contrato que /api/wallet/buy) y no toca el oro,
//   5) los guardados con skins ya compradas siguen equipándose.
//   (python3 -m http.server 8771 &) ; SE_BASE_URL=http://127.0.0.1:8771 node tools/items/t_skins_brasas.js
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const BASE = process.env.SE_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:8771';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 500) : '')); if (!ok) fails++; };
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, args: ['--no-sandbox'] });
  const page = await (await browser.newContext({ viewport: { width: 1000, height: 600 } })).newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g|net::|404/.test(m.text())) errors.push('console: ' + m.text().slice(0, 300)); });
  await page.addInitScript(() => { window.__campaignMode = true; });
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 180000 });
  for (let k = 0; k < 300; k++) { if (await page.evaluate(() => !document.getElementById('title-continue-btn').disabled)) break; await sleep(100); }
  const E = (fn, a) => page.evaluate(fn, a);
  await E(() => { loop = function(){}; cromaLoadAll(); window.__alerts = []; gameAlert = function(m){ window.__alerts.push(String(m)); return Promise.resolve(); }; });

  // ---------- 1) catálogo: todo tiene precio en Brasas; ninguna ruta de oro otorga ----------
  const cat = await E(() => {
    const sets = Object.keys(SET_SKINS).filter(id => SET_DB[id]), cromas = Object.keys(CROMA_SKINS);
    const sinPrecio = sets.concat(cromas).filter(id => !(premiumPrice(id) > 0));
    return { sets: sets.length, cromas: cromas.length, sinPrecio, tiers: Object.fromEntries(sets.concat(cromas).map(id => [id, premiumPrice(id)])) };
  });
  check('CATALOGO.hay_skins_y_cromas', cat.sets > 0 && cat.cromas > 0, { sets: cat.sets, cromas: cat.cromas });
  check('CATALOGO.todas_tienen_precio_en_Brasas', cat.sinPrecio.length === 0, cat.sinPrecio);
  check('CATALOGO.escalera_300_800_1200', Object.values(cat.tiers).every(p => [300, 800, 1200].includes(p)), [...new Set(Object.values(cat.tiers))]);

  const gold = await E(() => {
    state = 'menu';
    save.gold = 1e9; save.cosmeticUnlocks = {}; save.cromas = {}; save.skinVoucher = 0;
    for (const k in save.champions) save.champions[k].unlocked = true;
    const goldBefore = save.gold, bad = [];
    const owned = id => (SET_SKINS[id] ? skinOwnedFull(id) : cromaOwned(id));
    const ids = Object.keys(SET_SKINS).filter(id => SET_DB[id]).concat(Object.keys(CROMA_SKINS));
    // lo que ya viene "dado" por reglas de juego (p.ej. cromas legacy de un set) no es una compra: se parte de ese estado
    const prev = Object.fromEntries(ids.map(id => [id, owned(id)]));
    for (const id of ids) {
      if (prev[id]) continue;
      const calls = {
        shopBuySkinGold: () => shopBuySkinGold(id), shopBuySkinGoldPrecio: () => shopBuySkinGold(id, shopSkinPrice(id)),
        cromaBuy: () => cromaBuy(id), cromaBuyPrecio: () => cromaBuy(id, cromaPrice(id)),
        bundle: () => SET_SKINS[id] ? shopBuySetBundle(id, true) : { ok: false },
        bundlePrecio: () => SET_SKINS[id] ? shopBuySetBundle(id, true, null, shopSkinPrice(id)) : { ok: false },
        bundleDesc: () => SET_SKINS[id] ? shopBuySetBundle(id, true, SHOP_DEAL_OFF[0]) : { ok: false },
        shopBuySkin: () => SET_SKINS[id] ? (shopBuySkin(id, shopSkinPrice(id)) ? { ok: true } : { ok: false }) : { ok: false }
      };
      for (const [n, fn] of Object.entries(calls)) { let r; try { r = fn(); } catch (e) { r = { ok: false, err: String(e) }; } if (r && r.ok) bad.push(n + ':' + id); }
      if (owned(id) || save.gold !== goldBefore) bad.push('otorgada_o_cobrada:' + id);
    }
    // destacado del día (skin con descuento)
    let feat = null; try { feat = shopBuyFeatured({ kind: 'skin', id: Object.keys(SET_SKINS)[0], price: 0 }); } catch (e) {}
    const f = shopDailyShowcase().featured; let fr = null;
    if (f && f.kind === 'skin') fr = shopBuyFeatured(f);
    const unlocks = Object.keys(save.cosmeticUnlocks).length, cromas = Object.keys(save.cromas).length;
    return { bad: bad.slice(0, 8), n: ids.length, goldIntacto: save.gold === goldBefore, featOk: !!(feat && feat.ok), featDiaOk: !!(fr && fr.ok), unlocks, cromas,
      reason: shopBuySkinGold(ids[0]).reason };
  });
  check('ORO.ninguna_ruta_de_oro_otorga_una_skin', gold.bad.length === 0 && gold.n > 0, gold);
  check('ORO.el_oro_no_se_descuenta', gold.goldIntacto);
  check('ORO.destacado_del_dia_tampoco', !gold.featOk && !gold.featDiaOk);
  check('ORO.el_guardado_no_gana_skins', gold.unlocks === 0 && gold.cromas === 0, gold);
  check('ORO.mensaje_menciona_Brasas', /Brasas/.test(gold.reason || ''), gold.reason);

  // ---------- 2) UI: sin botones de oro para skins; precio en ✦ ----------
  const ui = await E(() => {
    save.gold = 1e9; save.cosmeticUnlocks = {}; save.cromas = {};
    const out = {};
    const scan = (sel) => {
      const root = document.querySelector(sel) || document.body;
      const goldBtns = root.querySelectorAll('[data-skin-buy],[data-croma-buy],[data-prep-skin-buy],#shop-feat-buy[data-kind="skin"]').length;
      const prem = [...root.querySelectorAll('[data-skin-premium]')];
      return { goldBtns, prem: prem.length, ember: prem.every(b => /✦\s*[\d.]+/.test(b.textContent)), anyGoldPrice: prem.some(b => /🪙/.test(b.textContent)) };
    };
    for (const tab of ['destacados', 'skins']) {
      setState('shop'); shopTab = tab; renderShop();
      out[tab] = scan('#shop-panel');
      out[tab + '_cardsGold'] = [...document.querySelectorAll('#shop-panel [data-bundle] button, #shop-panel [data-croma-card] button, #shop-panel .shop-skin button, #shop-panel .shop-hero button')]
        .filter(b => /🪙/.test(b.textContent) && !b.hasAttribute('data-champ-buy') && !b.hasAttribute('data-deal-buy') && !b.hasAttribute('data-rot-buy')).length;
    }
    // "lo que podés comprar ya" no ofrece skins/cromas por oro
    setState('shop'); shopTab = 'destacados'; renderShop();
    out.now = document.querySelectorAll('.shop-now-card [data-skin-buy],.shop-now-card [data-croma-buy]').length;
    return out;
  });
  check('UI.tienda_destacados_sin_botones_de_oro_para_skins', ui.destacados.goldBtns === 0 && ui.destacados_cardsGold === 0 && ui.now === 0, ui);
  check('UI.tienda_skins_sin_botones_de_oro_y_con_precio_en_Brasas', ui.skins.goldBtns === 0 && ui.skins_cardsGold === 0 && ui.skins.prem > 0 && ui.skins.ember && !ui.skins.anyGoldPrice, ui.skins);

  const cx = await E(() => {
    const out = { goldBtns: 0, prem: 0, champs: 0, detalle: 0 };
    const keys = [...new Set(Object.keys(CROMA_SKINS).map(id => CROMA_SKINS[id].champ))];
    for (const key of keys) {
      const holder = document.createElement('div'); holder.innerHTML = codexSkinsTabHtml(key);
      out.goldBtns += holder.querySelectorAll('[data-skin-buy],[data-croma-buy]').length + (/🪙/.test(holder.textContent) ? 1 : 0);
      out.prem += holder.querySelectorAll('[data-skin-premium]').length; out.champs++;
      const id = cromaIdsFor(key).find(i => !cromaOwned(i));
      if (id) { const el = document.createElement('div'); _cxCromaDetail(el, key, id); out.detalle += el.querySelectorAll('[data-skin-premium]').length; out.goldBtns += el.querySelectorAll('#cx-croma-buy,[data-croma-buy]').length; }
    }
    return out;
  });
  check('UI.codice_sin_botones_de_oro_y_con_botones_de_Brasas', cx.goldBtns === 0 && cx.prem > 0 && cx.detalle > 0, cx);

  const prep = await E(() => {
    state = 'menu'; selectedClass = 'tanque'; setState('prep');
    const holder = document.createElement('div'); holder.innerHTML = prepSkinsHTML();
    return { goldBtns: holder.querySelectorAll('[data-prep-skin-buy]').length, prem: holder.querySelectorAll('[data-skin-premium]').length, goldTxt: /🪙/.test(holder.textContent) };
  });
  check('UI.sala_sin_boton_de_oro_y_con_precio_en_Brasas', prep.goldBtns === 0 && !prep.goldTxt && prep.prem > 0, prep);

  // ---------- 3) sin cuenta: aviso coherente, nada se otorga ----------
  const noAcct = await E(async () => {
    state = 'menu'; window.__alerts.length = 0;
    acct.session = null; const goldB = save.gold;
    const id = Object.keys(SET_SKINS).find(i => SET_DB[i]);
    const r = await premiumBuySkin(id);
    const crId = Object.keys(CROMA_SKINS)[0], r2 = await premiumBuySkin(crId);
    return { r, r2, owned: skinOwnedFull(id) || cromaOwned(crId), goldIgual: save.gold === goldB };
  });
  check('SIN_CUENTA.premiumBuySkin_pide_entrar_y_no_otorga', !noAcct.r.ok && !noAcct.r2.ok && /cuenta/.test(noAcct.r.reason) && !noAcct.owned && noAcct.goldIgual, noAcct);
  const click = await E(async () => {
    setState('shop'); shopTab = 'skins'; renderShop(); window.__alerts.length = 0;
    const b = document.querySelector('#shop-panel [data-skin-premium]'); if (!b) return { sinBoton: true };
    b.click(); await new Promise(r => setTimeout(r, 100));
    return { alerts: window.__alerts.slice(), owned: Object.keys(save.cosmeticUnlocks).length + Object.keys(save.cromas).length };
  });
  check('SIN_CUENTA.click_en_el_boton_avisa_que_hay_que_entrar', click.alerts && click.alerts.some(a => /cuenta/.test(a)) && click.owned === 0, click);

  // ---------- 4) compra con Brasas (servidor simulado: contrato de /api/wallet/buy) ----------
  const buy = await E(async () => {
    const setId = Object.keys(SET_SKINS).find(i => SET_DB[i] && !skinOwnedFull(i));
    const crId = Object.keys(CROMA_SKINS).find(i => !cromaOwned(i));
    const calls = []; let wallet = 5000;
    acct.session = { token: 't' };
    window.accountFetch = accountFetch = async (method, path, body) => {
      calls.push({ method, path, body });
      if (path === '/api/wallet') return { status: 200, j: { premium: wallet, currency: { id: 'brasas', name: 'Brasas', icon: '✦' }, payments: { enabled: false, packs: [] } } };
      if (path === '/api/wallet/buy') {
        const price = premiumPrice(body.sku);
        if (body.expectedPrice !== price) return { status: 409, j: { error: 'PRICE_CHANGED' } };
        if (wallet < price) return { status: 402, j: { error: 'INSUFFICIENT' } };
        wallet -= price;
        const isCroma = !!CROMA_SKINS[body.sku];
        return { status: 200, j: { ok: true, premium: wallet, cosmetics: [{ id: body.sku, type: isCroma ? 'croma' : 'skin' }] } };
      }
      return { status: 404, j: {} };
    };
    PREMIUM.at = 0; await premiumRefresh(true);
    const goldB = save.gold;
    const r1 = await premiumBuySkin(setId), r2 = await premiumBuySkin(crId);
    return { setId, crId, r1: r1.ok, r2: r2.ok, setOwned: skinOwnedFull(setId), crOwned: cromaOwned(crId), wallet,
      gastoEsperado: premiumPrice(setId) + premiumPrice(crId), gold: save.gold === goldB, paths: calls.filter(c => c.path === '/api/wallet/buy').map(c => c.body.sku) };
  });
  check('BRASAS.la_compra_con_Brasas_otorga_skin_y_croma', buy.r1 && buy.r2 && buy.setOwned && buy.crOwned && buy.wallet === 5000 - buy.gastoEsperado, buy);
  check('BRASAS.no_toca_el_oro_y_valida_en_el_servidor', buy.gold && buy.paths.length === 2, buy.paths);
  const btn = await E(() => { setState('shop'); shopTab = 'skins'; renderShop(); const b = document.querySelector('#shop-panel [data-skin-premium]'); return { hay: !!b, txt: b ? b.textContent.trim() : '' }; });
  check('BRASAS.el_boton_muestra_el_precio_en_Brasas', btn.hay && /^✦\s*[\d.]+$/.test(btn.txt), btn);

  // ---------- 5) guardados con skins ya compradas siguen equipándose ----------
  const legacy = await E(() => {
    acct.session = null;
    const setId = Object.keys(SET_SKINS).find(i => SET_DB[i] && skinSetChamp(i)), champ = skinSetChamp(setId);
    const crId = Object.keys(CROMA_SKINS).find(i => CROMA_SKINS[i].champ !== champ), crChamp = CROMA_SKINS[crId].champ;
    save.cosmeticUnlocks = { [setId]: true }; save.cromas = { [crId]: true };
    for (const k of [champ, crChamp]) save.champions[k].unlocked = true;
    persistNow(); loadSave();
    const a = skinOwnedFull(setId) && skinEquipOn(setId, champ) && skinIsActiveOn(setId, champ);
    const b = cromaOwned(crId) && cromaEquip(crChamp, crId) && cromaEquippedId(crChamp) === crId;
    cromaEquip(crChamp, null);
    return { setId, crId, a, b };
  });
  check('GUARDADOS.skin_de_set_comprada_se_equipa', legacy.a, legacy);
  check('GUARDADOS.croma_comprada_se_equipa', legacy.b, legacy);

  check('sin_errores_de_pagina', errors.length === 0, errors.slice(0, 5));
  await browser.close();
  console.log(fails ? `\n${fails} FALLAS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})();
