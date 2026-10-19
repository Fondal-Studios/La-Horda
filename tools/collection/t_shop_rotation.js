'use strict';
// TIENDA: modos "demo" / "live" y rotación diaria (js/data/pricing.js SHOP_MODE, js/systems/shop.js shopRotation*,
// docs/economy/TIENDA_ROTACION.md). Verifica con el código real, en Chromium a 844x390:
//   demo : el catálogo, los precios y el "comprar las que faltan" son los de siempre (nada rota).
//   live : rotación determinista por día UTC (igual en dos cargas), distinta al día siguiente, cada pieza reaparece dentro de
//          la cota garantizada, precios dentro de la escala, el paquete de set no saltea la rotación, las ofertas con
//          descuento no cuelan legendarios, guardianes/Básicos siguen comprables, el temporizador, la UI y que
//          "una victoria Infernal >= 25% del precio de un set" NO se cumple (umbral del crítico).
// Uso: node tools/collection/t_shop_rotation.js   (levanta su propio servidor en un puerto libre; SE_BASE_URL para usar otro)
const fs = require('node:fs'), path = require('node:path'), H = require('../lib/serve');
const ROOT = H.ROOT;
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 400) : '')); if (!ok) fails++; };
const T18_48 = Date.UTC(2026, 9, 19, 18, 48, 0); // 5 h 12 min antes de la medianoche UTC

(async () => {
  const site = await H.startSite({envUrl: ['SE_BASE_URL']}), base = site.url;   // puerto libre propio; SE_BASE_URL para uno externo
  const browser = await H.launch();
  const errors = [];
  async function boot() {
    const ctx = await browser.newContext({viewport: {width: 844, height: 390}});
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await ctx.addInitScript(() => { window.__autoConfirm = true; try { localStorage.clear(); } catch (e) {} });
    await H.goto(page, base + '/index.html', {timeout: 180000});
    await page.waitForFunction(() => typeof shopRotationInfo === 'function' && typeof renderShop === 'function', null, {timeout: 180000});
    await page.waitForTimeout(800);
    return page;
  }
  try {
    const page = await boot();
    const E = (fn, a) => page.evaluate(fn, a);

    /* ---------------- DEMO (por defecto) ---------------- */
    const demo = await E(() => {
      const out = {};
      out.mode = SHOP_MODE; out.live = shopIsLive();
      const cat = shopCatalog(), by = c => cat.filter(e => e.cat === c);
      out.counts = {set: by('set').length, legendario: by('legendario').length, campeon: by('campeon').length, base: by('base').length};
      const piece = by('set')[0], leg = by('legendario')[0];
      out.piece = shopPriceOf(piece); out.leg = shopPriceOf(leg); out.catalogPriceGetter = piece.price;
      out.setPrice = shopSetPrice('baluarte');
      out.allowsAll = cat.every(e => shopRotationAllows(e));
      save.gold = 1e6; save.stash = []; save.collection = {}; save.cosmeticUnlocks = {}; state = 'shop';
      const b = shopBuySetBundle('baluarte', false); out.bundleOk = b.ok && b.n === 4 && save.gold === 1e6 - 4800;
      save.stash = []; save.gold = 1e6;
      const r1 = shopBuyCatalog(leg.key); out.legBuy = r1.ok && save.gold === 1e6 - 4000;
      out.keys = cat.map(e => e.key).sort();
      out.dayKeyLocal = shopDayKey(new Date(2026, 9, 19, 23, 59)) === '2026-10-19';
      return out;
    });
    const golden = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/production/shop-catalog.json'), 'utf8'));
    check('demo es el modo por defecto', demo.mode === 'demo' && demo.live === false);
    check('demo: precios de siempre (pieza 1.200, legendario 4.000, set 4.800)', demo.piece === 1200 && demo.leg === 4000 && demo.catalogPriceGetter === 1200 && demo.setPrice === 4800, demo);
    check('demo: el catálogo no cambia (mismas claves que docs/production/shop-catalog.json)', JSON.stringify(demo.keys) === JSON.stringify(golden.itemPrices));
    check('demo: todo se puede comprar siempre y el paquete de set funciona', demo.allowsAll && demo.bundleOk && demo.legBuy, demo);
    check('demo: el día de la tienda es la fecha local', demo.dayKeyLocal);

    /* ---------------- LIVE ---------------- */
    await E(() => { SHOP_MODE = 'live'; _shopShowcaseCache = null; });
    const info = await E(() => ({info: shopRotationInfo(), cfg: JSON.parse(JSON.stringify(SHOP_LIVE)), D: shopUtcDay(new Date(Date.UTC(2026, 9, 19, 12)))}));
    console.log('INFO', JSON.stringify(info));
    const I = info.info, W = info.cfg.rotation.windowDays, N = info.cfg.rotation.piecesPerDay, D0 = info.D;
    check('live: la cota de reaparición es ciclo + ventana - 1 y es corta (<= 45 días con el catálogo actual)', I.maxGapDays === I.cycleDays + Math.min(W, I.cycleDays) - 1 && I.maxGapDays <= 45, I);

    // determinismo: dos cargas separadas dan el mismo calendario; y varias llamadas en la misma
    const sched = await E(D0 => { const o = {}; for (let d = 0; d < 6; d++) o[d] = shopRotationKeys(D0 + d); return o; }, D0);
    const page2 = await boot(); await page2.evaluate(() => { SHOP_MODE = 'live'; });
    const sched2 = await page2.evaluate(D0 => { const o = {}; for (let d = 0; d < 6; d++) o[d] = shopRotationKeys(D0 + d); return o; }, D0);
    check('live: la rotación es determinista (dos cargas distintas, mismos días)', JSON.stringify(sched) === JSON.stringify(sched2));
    await page2.context().close();
    check('live: cambia al día siguiente y los días consecutivos no repiten piezas', JSON.stringify(sched[0]) !== JSON.stringify(sched[1]) && sched[0].every(k => !sched[1].includes(k)));

    // calendario largo: 12 ciclos
    const cal = await E(({D0, L}) => {
      const days = L * 12, seen = {}, perDay = [], legs = [], groups = [];
      const c = shopRotationContext();
      for (let d = 0; d < days; d++) {
        const ks = shopRotationKeys(D0 + d); perDay.push(ks.length);
        if (new Set(ks).size !== ks.length) return {dup: d};
        legs.push(ks.filter(k => c.entries[k].cat === 'legendario').length);
        groups.push(new Set(ks.map(k => c.entries[k].cat === 'legendario' ? 'L' + k : (DESIGNED_ITEMS[c.entries[k].id].set || k))).size);
        for (const k of ks) (seen[k] = seen[k] || []).push(d);
      }
      const gaps = []; let missing = 0;
      for (const k of Object.keys(c.entries)) { const a = seen[k] || []; if (!a.length) missing++; for (let i = 1; i < a.length; i++) gaps.push(a[i] - a[i - 1]); }
      // por set: mayor espera entre dos piezas cualesquiera del mismo set
      const bySet = {}; for (const k of Object.keys(c.entries)) { if (c.entries[k].cat !== 'set') continue; const g = DESIGNED_ITEMS[c.entries[k].id].set; (bySet[g] = bySet[g] || []).push(...(seen[k] || [])); }
      let setGap = 0; for (const g in bySet) { const a = bySet[g].sort((x, y) => x - y); for (let i = 1; i < a.length; i++) setGap = Math.max(setGap, a[i] - a[i - 1]); }
      return {pool: Object.keys(c.entries).length, missing, maxGap: Math.max(...gaps), minGap: Math.min(...gaps), perDayMin: Math.min(...perDay), perDayMax: Math.max(...perDay), maxLegPerDay: Math.max(...legs), minGroups: Math.min(...groups), avgGroups: groups.reduce((a, b) => a + b, 0) / groups.length, setGap};
    }, {D0, L: I.cycleDays});
    console.log('CAL', JSON.stringify(cal));
    check('live: cada día hay exactamente ' + N + ' piezas, sin repetidas ni legendarios de más', !cal.dup && cal.perDayMin === N && cal.perDayMax === N && cal.maxLegPerDay <= 1, cal);
    check('live: toda pieza del catálogo (set y legendarios) aparece (nadie queda sin salir nunca)', cal.missing === 0 && cal.pool === I.pieces, cal);
    check('live: cada pieza reaparece dentro de la cota (min..max) en 12 ciclos', cal.maxGap <= I.maxGapDays && cal.minGap >= I.minGapDays && cal.maxGap <= 45, {cal, I});
    check('live: variedad: casi todos los días traen piezas de sets distintos', cal.avgGroups >= N - 0.5 && cal.minGroups >= N - 2, {avg: cal.avgGroups, min: cal.minGroups});
    const nextOk = await E(({D0}) => { const c = shopRotationContext(), bad = []; for (const k of Object.keys(c.entries).slice(0, 40)) { let d = 0; while (!shopRotationKeys(D0 + d).includes(k)) d++; if (shopRotationDaysUntil(k, new Date(Date.UTC(2026, 9, 19, 12))) !== d) bad.push(k); } return bad; }, {D0});
    check('live: "vuelve en N días" coincide con el calendario', nextOk.length === 0, nextOk);

    // precios
    const pr = await E(() => {
      const cat = shopCatalog(), by = c => cat.filter(e => e.cat === c);
      const set = by('set'), leg = by('legendario');
      return {
        setScale: [...new Set(set.map(e => shopPriceOf(e)))], legScale: [...new Set(leg.map(e => shopPriceOf(e)))],
        campeon: [...new Set(by('campeon').map(e => shopPriceOf(e)))], baseRaro: shopPriceOf(by('base')[0], 'raro'), baseComun: shopPriceOf(by('base')[0], 'comun'), baseLeg: shopPriceOf(by('base')[0], 'legendario'),
        champ: shopChampionPrice('mago'), setBundle: shopSetPrice('baluarte'), getter: set[0].price, skin: premiumGoldPrice('baluarte'), cfg: SHOP_LIVE.priceScale
      };
    });
    check('live: pieza de set = 1.200 x escala', pr.setScale.length === 1 && pr.setScale[0] === 1200 * pr.cfg.set && pr.getter === pr.setScale[0], pr);
    check('live: legendario con nombre = 4.000 x escala', pr.legScale.length === 1 && pr.legScale[0] === 4000 * pr.cfg.legendario, pr);
    check('live: objetos de guardián, Básicos, guardianes y skins NO cambian', pr.campeon.length === 1 && pr.campeon[0] === 1800 && pr.baseRaro === 400 && pr.baseComun === 150 && pr.baseLeg === 3200 && pr.champ === 2500 && pr.skin === 9000, pr);

    // umbral del crítico: una victoria Infernal vs el precio de un set (4 piezas)
    const setPrice = pr.setBundle;
    for (const win of [5200, 7000]) check(`live: una victoria de ${win} NO llega al 25% de un set (${setPrice})`, win < 0.25 * setPrice, {pct: Math.round(win * 1000 / setPrice) / 10});
    check('demo (referencia): con 4.800 una victoria de 5.200 pagaba más que un set entero', 5200 >= 0.25 * 4800);

    // compras: lo que no está hoy no se compra; lo que está hoy, a precio exacto
    const buy = await E(() => {
      const o = {}, today = shopRotationToday(), todayKeys = today.map(e => e.key);
      const c = shopRotationContext(), notToday = Object.values(c.entries).filter(e => !todayKeys.includes(e.key));
      const nt = notToday.find(e => e.cat === 'set'), ntLeg = notToday.find(e => e.cat === 'legendario');
      state = 'shop'; save.gold = 1e7; save.stash = []; save.collection = {}; save.cosmeticUnlocks = {};
      let before = JSON.stringify({g: save.gold, s: save.stash});
      let r = shopBuyCatalog(nt.key); o.ntSet = !r.ok && JSON.stringify({g: save.gold, s: save.stash}) === before && /no está a la venta hoy/.test(r.reason); o.ntReason = r.reason;
      r = shopBuyCatalog(ntLeg.key); o.ntLeg = !r.ok && save.gold === 1e7;
      const t = today[0]; r = shopBuyCatalog(t.key, undefined, null, 1); o.stale = !r.ok && save.gold === 1e7;
      r = shopBuyCatalog(t.key); o.today = r.ok && save.gold === 1e7 - shopPriceOf(t);
      // el paquete de set (con oro de sobra, inventario vacío) no entrega nada
      save.stash = []; save.gold = 1e7; before = JSON.stringify({g: save.gold, s: save.stash});
      r = shopBuySetBundle('baluarte', false); o.bundle = !r.ok && JSON.stringify({g: save.gold, s: save.stash}) === before; o.bundleReason = r.reason;
      r = shopBuySetBundle('baluarte', false, 15); o.bundleDisc = !r.ok;
      // la skin sigue siendo solo apariencia: no entrega piezas
      const miss = shopSetMissing('baluarte').length; r = shopBuySetBundle('baluarte', true); o.skin = r.ok && shopSetMissing('baluarte').length === miss && save.stash.length === 0;
      // legado
      o.legacy = !shopBuy('of0').ok;
      // guardianes y Básicos: siempre
      save.gold = 1e7; save.champions.mago.unlocked = false; o.champ = shopBuyChampion('mago').ok;
      const basic = shopCatalog().find(e => e.kind === 'archetype'); save.stash = []; o.basic = shopBuyCatalog(basic.key, 'comun').ok && save.gold < 1e7;
      const gift = shopCatalog().find(e => e.cat === 'campeon'); o.campeonItem = shopBuyCatalog(gift.key).ok;
      return o;
    });
    check('live: una pieza de set que no está hoy no se compra (ni con oro de sobra) y dice cuándo vuelve', buy.ntSet && /vuelve/.test(buy.ntReason), buy.ntReason);
    check('live: un legendario que no está hoy no se compra', buy.ntLeg);
    check('live: una pieza de hoy se compra al precio exacto; un precio viejo se rechaza', buy.today && buy.stale);
    check('live: el paquete de set completo NO saltea la rotación (con y sin descuento), sin cobrar ni entregar', buy.bundle && buy.bundleDisc, buy.bundleReason);
    check('live: la skin sigue siendo solo apariencia (no entrega piezas)', buy.skin);
    check('live: la compra legada (shopBuy) también está cerrada', buy.legacy);
    check('live: guardianes, Básicos y objetos de guardián se compran siempre', buy.champ && buy.basic && buy.campeonItem, buy);

    // ofertas del día: ningún legendario con nombre con descuento (30 días UTC)
    const dealsNoLeg = await E(async () => {
      const bad = []; const D = shopUtcDay();
      for (let d = 0; d < 30; d++) {
        const real = Date; const fixed = (D + d) * 86400000 + 43200000;
        // fecha simulada sin tocar el reloj del navegador: se reconstruye la vitrina con una Date falsa
        window.Date = class extends real { constructor(...a) { if (a.length) super(...a); else super(fixed); } static now() { return fixed; } };
        _shopShowcaseCache = null;
        for (const dl of shopDailyShowcase().deals) { const e = shopCatalog().find(x => x.key === dl.key); if (e.cat === 'legendario') bad.push([d, dl.key]); }
        window.Date = real;
      }
      _shopShowcaseCache = null; return bad;
    });
    check('live: las ofertas con descuento no incluyen legendarios con nombre (30 días)', dealsNoLeg.length === 0, dealsNoLeg);

    // temporizador y día UTC
    const tm = await E(({T}) => ({m: shopMinutesToRenew(new Date(T)), key: shopDayKey(new Date(Date.UTC(2026, 9, 19, 23, 59))), key2: shopDayKey(new Date(Date.UTC(2026, 9, 20, 0, 1)))}), {T: T18_48});
    check('live: faltan 312 min (5 h 12 min) a las 18:48 UTC y el día cambia a las 00:00 UTC', tm.m === 312 && tm.key === '2026-10-19' && tm.key2 === '2026-10-20', tm);

    // guardados existentes: lo que ya tenés sigue siendo tuyo en cualquier modo
    const keep = await E(() => {
      save.stash = []; save.collection = {}; const id = setPieceIds('baluarte')[0];
      SHOP_MODE = 'demo'; addItemToInventory(null, makeDesignedItem(id));
      const a = ownedDesignIds().has(id), n1 = stashItems().length;
      SHOP_MODE = 'live'; const b = ownedDesignIds().has(id), n2 = stashItems().length;
      const g = save.gold, cnt = shopSetMissing('baluarte').length; shopRotationToday(); shopRotationInfo();
      return a && b && n1 === n2 && save.gold === g && cnt === 3;
    });
    check('live: las compras y el oro de un guardado existente no se tocan al cambiar de modo', keep);

    /* ---------------- UI en live ---------------- */
    await page.clock.setFixedTime(T18_48);
    await E(() => { SHOP_MODE = 'live'; _shopShowcaseCache = null; save.gold = 0; save.stash = []; save.collection = {}; save.cosmeticUnlocks = {}; save.shopSeen = {}; for (const k in save.champions) save.champions[k].unlocked = (k === 'tanque'); state = 'shop'; setState('shop'); shopTab = 'destacados'; renderShop(); });
    await page.waitForTimeout(300);
    const ui = await E(() => {
      const q = s => document.querySelectorAll(s).length;
      return {cards: q('.shop-rot-card'), renew: (document.querySelector('[data-shop-rot] [data-shop-renew]') || {}).textContent, goal: q('[data-shop-now="goal"]'), disabled: q('.shop-rot-card .shop-btn:disabled'),
        miss: !!document.querySelector('.shop-rot-miss'), note: (document.querySelector('.shop-rot-note') || {}).textContent, scrollW: document.documentElement.scrollWidth};
    });
    check('UI live: 6 piezas "A LA VENTA HOY", temporizador "Se renueva en 5 h 12 min" y fila "Tu próxima meta"', ui.cards === N && /Se renueva en 5 h 12 min/.test(ui.renew) && ui.goal === 1 && ui.disabled === N && ui.miss, ui);
    check('UI live: texto honesto (sin urgencia): dice que el precio no cambia y no hay cantidad limitada', /no cambia/.test(ui.note) && /cantidad limitada/.test(ui.note) && !/última|ya!|solo hoy|apurate/i.test(ui.note), ui.note);
    // con oro: se compra desde la vitrina tocando
    await E(() => { save.gold = 1e6; renderShop(); });
    const k0 = await E(() => document.querySelector('.shop-rot-card .shop-btn').getAttribute('data-rot-buy'));
    await E(() => document.querySelector('.shop-rot-card [data-rot-buy]').click()); await page.waitForTimeout(600);
    const bought = await E(k => ({gold: save.gold, owned: stashItems().some(it => 'd:' + it.designId === k)}), k0);
    check('UI live: comprar desde "A la venta hoy" cobra el precio exacto y entrega la pieza', bought.owned && bought.gold < 1e6 && (1e6 - bought.gold) % 400 === 0, bought);
    // Objetos > Sets: piezas que no están hoy bloqueadas, sin botón de paquete
    const objs = await E(() => { shopTab = 'objetos'; shopCat = 'set'; renderShop(); const q = s => document.querySelectorAll(s).length; return {expectOn: shopRotationToday().filter(e => e.cat === 'set').length, buyAll: q('.shop-set-buyall'), live: q('[data-set-live]'), sets: q('.shop-set'), on: q('.shop-rot-state.on'), off: q('.shop-rot-state:not(.on)'), enabled: q('.shop-set [data-buy-item]:not(:disabled)'), txt: (document.querySelector('.shop-rot-state:not(.on)') || {}).textContent}; });
    check('UI live: Sets sin botón "comprar las que faltan"; solo las 6 de hoy se pueden comprar; las demás dicen cuándo vuelven', objs.buyAll === 0 && objs.live === objs.sets && objs.on === objs.expectOn && objs.enabled <= objs.expectOn && /vuelve/.test(objs.txt), objs);
    const leg = await E(() => { shopCat = 'legendario'; renderShop(); return {total: document.querySelectorAll('.shop-item').length, off: document.querySelectorAll('.shop-rot-state:not(.on)').length}; });
    check('UI live: Legendarios también muestran su estado', leg.total === 24 && leg.off >= 23, leg);
    await E(() => { shopCat = 'base'; renderShop(); });
    const baseUi = await E(() => ({items: document.querySelectorAll('.shop-item').length, rot: document.querySelectorAll('.shop-rot-state').length, enabled: document.querySelectorAll('.shop-item [data-buy-item]:not(:disabled)').length}));
    check('UI live: Básicos siempre a la venta (sin etiqueta de rotación)', baseUi.items > 0 && baseUi.rot === 0 && baseUi.enabled > 0, baseUi);
    // mañana (UTC) cambia la vitrina
    const today = await E(() => shopRotationKeys().join());
    await page.clock.setFixedTime(T18_48 + 6 * 3600 * 1000);
    await E(() => { _shopShowcaseCache = null; shopTab = 'destacados'; renderShop(); });
    const tomorrow = await E(() => ({keys: shopRotationKeys().join(), cards: [...document.querySelectorAll('.shop-rot-card')].map(c => c.dataset.rot).join(), renew: document.querySelector('[data-shop-rot] [data-shop-renew]').textContent}));
    check('UI live: al pasar la medianoche UTC la vitrina cambia y el temporizador se reinicia', tomorrow.keys !== today && tomorrow.cards === tomorrow.keys && /Se renueva en 23 h 12 min/.test(tomorrow.renew), tomorrow);

    // volver a demo: la UI no muestra rotación y todo vuelve
    await E(() => { SHOP_MODE = 'demo'; _shopShowcaseCache = null; shopTab = 'destacados'; renderShop(); });
    const back = await E(() => ({rot: document.querySelectorAll('[data-shop-rot]').length, p: shopPriceOf(shopCatalog().find(e => e.cat === 'set'))}));
    check('UI demo: sin "A la venta hoy" y precios de siempre', back.rot === 0 && back.p === 1200, back);

    check('sin errores de página', errors.length === 0, errors);
  } finally {
    await browser.close(); await site.close();
  }
  console.log(fails ? `\n${fails} FALLAS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
