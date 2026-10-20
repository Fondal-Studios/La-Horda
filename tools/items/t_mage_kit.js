// KIT DE MAGOS (js/data/mage-kit.js + js/systems/mage-passives.js): legendarios, míticos y únicos que CAMBIAN LA PASIVA de los magos.
//  1) datos, recetas, ficha, iconos pixel (16x16, <= 6 colores), tienda y poder legendario al azar
//  2) restricción a magos (roleCategory) y UI
//  3) caída por arena (mínimos, afinidad de rol) y fabricación de Míticos
//  4) COBERTURA: itera TODOS los magos de CLASSES y mide el efecto de CADA poder con el código real
//  5) mago nuevo sin adaptador -> pasiva de respaldo (Resonancia), sin romper
//  6) topes, sin fuego amigo, limpieza (muerte, quitar el equipo, nueva partida), sin fugas
//  7) balance: DPS con y sin kit (escenario corto, ver docs/items/KIT_DE_MAGOS.md)
//   (python3 -m http.server 8842 &) ; SE_BASE_URL=http://127.0.0.1:8842 node tools/items/t_mage_kit.js
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const BASE = process.env.SE_BASE_URL || 'http://127.0.0.1:8842';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 600) : '')); if (!ok) fails++; };
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await (await browser.newContext({ viewport: { width: 844, height: 390 } })).newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g|net::|404/.test(m.text())) errors.push('console: ' + m.text().slice(0, 300)); });
  await page.addInitScript(() => { window.__campaignMode = true; });
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load' });
  for (let k = 0; k < 300; k++) { if (await page.evaluate(() => !document.getElementById('title-continue-btn').disabled)) break; await sleep(100); }
  const E = (fn, a) => page.evaluate(fn, a);
  await E(() => {
    loop = function(){};
    window.__start = (arena, champ) => { for (const k of Object.keys(save.champions)) { save.champions[k].unlocked = true; save.champions[k].level = 20; }
      save.stash = []; for (const k in save.champions) save.champions[k].equipment = { arma:null, escudo:null, casco:null, pechera:null, guantes:null, botas:null };
      invalidatePassiveCache();
      selectedClass = champ || 'mago'; currentArena = arena || 'laberinto'; lobbyAllies = []; startRun(1); spawnTimer = 1e12; enemies.length = 0; levelDuration = 9e9;
      for (const h of heroes) if (h !== player) h.alive = false; player.hp = player.maxHp; player.energy = player.maxEnergy = 9999; };
    window.__equipIds = (ids) => { for (const t of EQUIP_SLOT_TYPES) unequipItem(player.classKey, t); invalidatePassiveCache();
      for (const id of ids) { const it = makeDesignedItem(id); it.affixes = []; stashItems().push(it); if (!equipItem(player.classKey, it.uid)) return false; }
      invalidatePassiveCache(); return true; };
    window.__foe = (dx, dy, hp, type) => { const e = spawnEnemy(type || 'zombie', false); e.x = player.x + (dx||60); e.y = player.y + (dy||0); e.hp = e.maxHp = hp || 1e7; e.stunTimer = 1e9; e.atkCd = 1e9; return e; };
    window.__step = (ms) => { let t = 0; while (t < ms && state === 'playing') { player.hp = Math.max(player.hp, player.maxHp*0.9); update(16); t += 16; } };
    // un poder -> la pieza del kit que lo da
    window.__ITEM_OF = {}; for (const id of Object.keys(DESIGNED_ITEMS)) { const p = DESIGNED_ITEMS[id].magePower; if (p) window.__ITEM_OF[p] = id; }
  });

  // ---------- 1) datos, recetas, ficha, iconos, tienda ----------
  {
    const r = await E(() => {
      const L = MAGE_KIT_IDS.legendario, M = MAGE_KIT_IDS.mitico, U = MAGE_KIT_IDS.unico, all = [...L, ...M, ...U];
      const slots = new Set(all.map(id => DESIGNED_ITEMS[id].type));
      const powersUsed = new Set(all.map(id => DESIGNED_ITEMS[id].magePower));
      const recipeOk = M.every(id => { const rc = MYTHIC_RECIPES[id]; return rc && rc.length === 3 && rc.every(x => L.includes(x)) && new Set(rc).size === 3; });
      const everyLegendInRecipe = L.every(id => M.some(m => MYTHIC_RECIPES[m].includes(id)));
      const bad = all.filter(id => { const d = DESIGNED_ITEMS[id]; return !d || d.champion || d.roleOnly !== 'mago' || !MAGE_POWERS[d.magePower] || !d.lore || !d.name; });
      const lines = {}; const icons = {}; const shape = {};
      for (const id of all) { const it = makeDesignedItem(id); lines[id] = itemEffectLines(it).map(l => l.cls + '|' + l.txt);
        icons[id] = !!PXI_ART['item_' + id] && PXI_ART['item_' + id].length === 16 && PXI_ART['item_' + id].every(r => r.length === 16) && new Set(PXI_ART['item_' + id].join('').replace(/[.k]/g, '')).size <= 6;
        const u = itemIconURL(it); shape[id] = typeof u === 'string' && u.startsWith('data:image/png'); }
      const noProc = all.every(id => legendProcOf(makeDesignedItem(id)) === null);
      const noMythPassive = M.every(id => makeDesignedItem(id).mythicPassive === null);
      const shop = shopCatalog().filter(e => e.kind === 'designed' && DESIGNED_ITEMS[e.id].magePower).length;
      const shopDay = [];
      for (let d = 0; d < 40; d++) { const s = typeof shopDailyOffers === 'function' ? shopDailyOffers(d) : null; if (s) for (const o of s.offers) if (o.item && o.item.magePower) shopDay.push(o.item.designId); }
      return { nL: L.length, nM: M.length, nU: U.length, slots: [...slots].sort(), powers: powersUsed.size, total: all.length, recipeOk, everyLegendInRecipe, bad, noProc, noMythPassive, shop, shopDay,
        lineOk: all.every(id => lines[id].some(l => /^item-mage\|❂ CAMBIA TU PASIVA — /.test(l) && /solo magos/.test(l))), icons, shape,
        rarities: [...new Set(all.map(id => DESIGNED_ITEMS[id].rarity))].sort(), uniqueRarity: U.every(id => DESIGNED_ITEMS[id].rarity === 'unico'), mythRarity: M.every(id => DESIGNED_ITEMS[id].rarity === 'mitico'),
        inRegistries: all.every(id => DESIGNED_ITEMS[id]) && M.every(id => MYTHIC_RECIPES[id]), sample: lines.mkm_baculo_coro };
    });
    check('DATA.kit_de_10_a_12_piezas', r.total >= 10 && r.total <= 12 && r.nL >= 4 && r.nM >= 3 && r.nU >= 2, { L: r.nL, M: r.nM, U: r.nU });
    check('DATA.un_poder_distinto_por_pieza', r.powers === r.total, r.powers);
    check('DATA.cubre_las_6_ranuras', r.slots.length === 6, r.slots);
    check('DATA.piezas_validas_sin_guardian_unico_y_con_lore', r.bad.length === 0, r.bad);
    check('DATA.mitico_se_fabrica_con_3_legendarios_del_kit', r.recipeOk && r.everyLegendInRecipe && r.inRegistries, r);
    check('DATA.rarezas_legendario_mitico_unico', r.uniqueRarity && r.mythRarity && r.rarities.join() === 'legendario,mitico,unico', r.rarities);
    check('DATA.sin_poder_legendario_al_azar_ni_pasiva_mitica_extra', r.noProc && r.noMythPassive, r);
    check('FICHA.dice_CAMBIA_TU_PASIVA_y_solo_magos', r.lineOk, r.sample);
    check('ICONOS.16x16_hasta_6_colores_por_pieza', Object.values(r.icons).every(Boolean), r.icons);
    check('ICONOS.se_dibujan_en_el_inventario', Object.values(r.shape).every(Boolean), r.shape);
    check('TIENDA.ninguna_pieza_del_kit_se_vende', r.shop === 0 && r.shopDay.length === 0, { shop: r.shop, day: r.shopDay });
  }

  // ---------- 2) restricción a magos ----------
  {
    const r = await E(() => {
      __start('laberinto', 'mago');
      const mages = Object.keys(CLASSES).filter(isMageClass), non = Object.keys(CLASSES).filter(k => !isMageClass(k));
      const ids = Object.keys(DESIGNED_ITEMS).filter(id => DESIGNED_ITEMS[id].magePower);
      const it = makeDesignedItem('mkm_baculo_coro');
      const canMage = mages.every(k => ids.every(id => canEquipItem(k, makeDesignedItem(id))));
      const cantOthers = non.filter(k => ids.some(id => canEquipItem(k, makeDesignedItem(id))));
      // equipar a la fuerza (partida guardada vieja, objeto intercambiado): no recibe el poder
      stashItems().push(it); const k0 = non.find(k => save.champions[k]); save.champions[k0].equipment[it.type] = it.uid; invalidatePassiveCache();
      const forced = heroMagePowers(k0); save.champions[k0].equipment[it.type] = null; invalidatePassiveCache();
      // roleOnly falso en el objeto: igual manda el diseño
      const fake = makeDesignedItem('mku_toga_fase'); fake.roleOnly = null;
      const eqFake = non.some(k => canEquipItem(k, fake));
      return { mages, nNon: non.length, canMage, cantOthers, forced, eqFake, label: itemOnlyLabel(it), equipGuerrero: equipItem('guerrero', it.uid), equipMago: equipItem('mago', it.uid),
        detail: (() => { const h = document.createElement('div'); h.innerHTML = itemDetailHTML(it, 'mago'); return /Solo magos/.test(h.textContent); })(),
        detailOther: (() => { const h = document.createElement('div'); h.innerHTML = itemDetailHTML(it, 'guerrero'); return /No compatible|Solo magos/.test(h.textContent); })() };
    });
    check('ROL.se_enumeran_los_magos_desde_CLASSES', r.mages.length >= 10 && r.mages.includes('mago') && r.mages.includes('aelith') && r.mages.includes('nano_gm'), r.mages);
    check('ROL.todos_los_magos_pueden_equipar_todo_el_kit', r.canMage);
    check('ROL.ningun_otro_rol_puede_equiparlo', r.cantOthers.length === 0 && r.equipGuerrero === false && r.equipMago === true, r.cantOthers);
    check('ROL.por_la_fuerza_un_no_mago_no_recibe_el_poder', r.forced === null && r.eqFake === false, r);
    check('ROL.la_UI_dice_Solo_magos', r.label === 'magos' && r.detail, r);
  }

  // ---------- 3) caída por arena y fabricación ----------
  {
    const r = await E(() => {
      __start('laberinto', 'mago');
      const allowed = {}; for (const cat of ['legendario','mitico','unico']) allowed[cat] = CAMPAIGN_ORDER.map(a => mageKitAllowed(cat, a) ? 1 : 0).join('');
      const kitOf = (tier, cls, arena, n) => { let k = 0; for (let i = 0; i < n; i++) { const it = materializeLoot({ tier }, cls, arena); if (it && it.magePower) k++; } return k; };
      const N = 1500;
      const early = { leg: kitOf('legendario', 'mago', 'ciudad', N), myth: kitOf('mitico', 'mago', 'fortaleza', N), uni: kitOf('unico', 'mago', 'micelial', N) };
      const mage = { leg: kitOf('legendario', 'mago', 'laberinto', N), myth: kitOf('mitico', 'mago', 'laberinto', N), uni: kitOf('unico', 'mago', 'laberinto', N) };
      const other = { leg: kitOf('legendario', 'guerrero', 'laberinto', N), myth: kitOf('mitico', 'guerrero', 'laberinto', N), uni: kitOf('unico', 'guerrero', 'laberinto', N) };
      // afinidad de arena: la Corona del Archivo cae más en el Laberinto que en el Bosque (mismo mago, solo míticos del kit)
      const cnt = a => { const c = {}; for (let i = 0; i < 3000; i++) { const id = _rollMageKit('mitico', 'mago', a, new Set(), () => 0); c[id] = (c[id] || 0) + 1; } return c; };
      const lab = cnt('laberinto'), abi = cnt('abismo');
      // el botín NO cruza a los demás tipos: un tier legendario sigue dando legendarios, y los del kit son legendarios/míticos/únicos
      const types = new Set(); for (let i = 0; i < 400; i++) { const it = materializeLoot({ tier: 'legendario' }, 'mago', 'laberinto'); if (it.magePower) types.add(it.rarity); }
      const typesM = new Set(); for (let i = 0; i < 400; i++) { const it = materializeLoot({ tier: 'mitico' }, 'mago', 'laberinto'); if (it.magePower) typesM.add(it.rarity); }
      const typesU = new Set(); for (let i = 0; i < 400; i++) { const it = materializeLoot({ tier: 'unico' }, 'mago', 'laberinto'); if (it.magePower) typesU.add(it.rarity); }
      // piso: lo que suelta un jefe en el Laberinto puede traer el kit
      let gl = 0; for (let i = 0; i < 400; i++) { const g = groundLootDrop(player.x + 80, player.y, 'S', 1, 'laberinto', 'jefe', 0); if (g && g.item.magePower) gl++; }
      groundLoot.length = 0;
      return { allowed, early, mage, other, lab, abi, N, types: [...types], typesM: [...typesM], typesU: [...typesU], gl };
    });
    check('CAIDA.mitico_desde_la_arena_4_unico_desde_la_6_legendario_desde_la_2',
      r.allowed.legendario === '0111111111' && r.allowed.mitico === '0001111111' && r.allowed.unico === '0000011111', r.allowed);
    check('CAIDA.antes_de_la_arena_minima_no_cae_nada_del_kit', r.early.leg === 0 && r.early.myth === 0 && r.early.uni === 0, r.early);
    check('CAIDA.a_un_mago_le_cae_mas_que_a_otros_roles', r.mage.leg > r.other.leg * 2 && r.mage.myth > r.other.myth * 2 && r.mage.uni > r.other.uni * 2 && r.mage.leg > 0 && r.mage.uni > 0, { mage: r.mage, other: r.other });
    check('CAIDA.del_kit_cae_la_rareza_que_corresponde', r.types.every(t => t === 'legendario') && r.typesM.every(t => t === 'mitico') && r.typesU.every(t => t === 'unico') && r.types.length && r.typesM.length && r.typesU.length, { l: r.types, m: r.typesM, u: r.typesU });
    check('CAIDA.afinidad_de_arena_pesa', (r.lab.mkm_corona_archivo || 0) > (r.abi.mkm_corona_archivo || 0) * 1.2 && (r.abi.mkm_manto_ciclo || 0) > (r.lab.mkm_manto_ciclo || 0), { lab: r.lab, abi: r.abi });
    check('CAIDA.el_piso_tambien_puede_soltarlo', r.gl > 0, r.gl);
  }
  {
    const r = await E(() => {
      __start('laberinto', 'mago'); save.stash = [];
      const rec = MYTHIC_RECIPES.mkm_baculo_coro, rec2 = MYTHIC_RECIPES.mkm_corona_archivo;
      const shared = rec.filter(x => rec2.includes(x));
      const early = craftMythic('mkm_baculo_coro');
      for (const id of rec.slice(0, 2)) stashItems().push(makeDesignedItem(id));
      const two = craftMythic('mkm_baculo_coro');
      stashItems().push(makeDesignedItem(rec[2]));
      const progress = recipeProgress('mkm_baculo_coro');
      const okC = craftMythic('mkm_baculo_coro');
      const left = stashItems().filter(i => rec.includes(i.designId)).length;
      const prog2 = recipeProgress('mkm_corona_archivo');
      // el panel de recetas muestra el kit sin romper
      const panel = document.createElement('div'); renderRecipesPanel(panel);
      return { early: early.ok, two: two.ok, ready: progress.ready, ok: okC.ok, power: okC.item && okC.item.magePower, rarity: okC.item && okC.item.rarity, left, shared, prog2n: prog2.n, panel: /Báculo del Coro Sin Fin/.test(panel.textContent) && /solo magos/.test(panel.textContent) };
    });
    check('RECETA.sin_los_3_no_se_fabrica', r.early === false && r.two === false, r);
    check('RECETA.con_los_3_se_fabrica_y_los_consume', r.ready && r.ok && r.power === 'mp_coro' && r.rarity === 'mitico' && r.left === 0, r);
    check('RECETA.dos_recetas_comparten_una_pieza_a_proposito', r.shared.length === 1 && r.prog2n === 0, r);
    check('RECETA.el_panel_de_recetas_lo_muestra', r.panel);
  }

  // ---------- 4) COBERTURA: todos los magos x todos los poderes ----------
  await E(() => {
    // Mide el efecto de UN poder sobre el mago en juego con el código real. Devuelve {ok, d}.
    window.__measure = (power) => {
      const id = __ITEM_OF[power]; if (!__equipIds([id])) return { ok: false, d: 'no se pudo equipar ' + id };
      const h = player, A = mageAdapter(h), sk = h.cls.skills, ult = h.cls.ultimate;
      const raw = () => A ? A.get(h) : mpState(h).res, M = () => mageMeterGet(h);
      h.energy = h.maxEnergy = 9999; h.shield = 0; const mp = mpState(h);
      const upd = (ms) => { for (let t = 0; t < ms; t += 100) updateMagePassives(h, Math.min(100, ms - t)); };
      const d = { adapter: A ? h.classKey : null };
      switch (power) {
        case 'mp_cauce': { mageMeterSet(h, 0); const g0 = mp.stats.gained || 0; const r0 = raw();
          for (let i = 0; i < 6; i++) { itemProcsOnCast(h, sk[i % 3], false); upd(450); mageMeterSet(h, 0); }
          itemProcsOnCast(h, ult, true); const gUlt = (mp.stats.gained || 0);
          d.gained = +(gUlt - g0).toFixed(3); d.cauce = mp.stats.cauce; return { ok: mp.stats.cauce >= 6 && gUlt - g0 > 0.2, d }; }
        case 'mp_sobrante': { mageMeterSet(h, 0); let e0 = h.energy = h.maxEnergy; let taken = 0;
          for (let i = 0; i < 4; i++) { h.energy = h.maxEnergy; upd(1300); taken += h.maxEnergy - h.energy; }
          d.taken = Math.round(taken); d.meter = +M().toFixed(2); d.raw = raw(); return { ok: taken >= h.maxEnergy * 0.12 * 4 - 1 && (mp.stats.gained || 0) > 0.8 && raw() > 0, d }; }
        case 'mp_tercer': { const f = __foe(60, 0); mageMeterSet(h, 0.5); const hp0 = f.hp;
          for (let i = 0; i < 3; i++) itemProcsOnCast(h, sk[i], false);
          d.dmg = Math.round(hp0 - f.hp); d.slow = f.slowTimer > 0; d.third = mp.stats.tercer; return { ok: mp.stats.tercer === 1 && hp0 - f.hp > 0 && f.slowTimer > 0, d }; }
        case 'mp_memoria': { mageMeterSet(h, 1); upd(100);
          if (A) A.set(h, 0); else mp.res = 0;            // el guardián gastó TODA su pasiva (a mano, no por la API de la capa)
          upd(100); const queued = !!mp.memoriaQ; upd(800);
          d.queued = queued; d.back = +M().toFixed(2); d.memoria = mp.stats.memoria; return { ok: queued && mp.stats.memoria === 1 && M() >= 0.3, d }; }
        case 'mp_velo': { mageMeterSet(h, 0.1); upd(100); h.shield = 0; mageMeterSet(h, 0.7); upd(100);
          d.shield = Math.round(h.shield); d.armor = kitBuffActive(h); return { ok: mp.stats.velo === 1 && h.shield >= h.maxHp * 0.079 && kitBuffActive(h), d }; }
        case 'mp_marca': { const fs = [60, 90, 120, 150, 180].map(x => __foe(x, 0)); const ref = __foe(350, 0);
          itemProcsOnCast(h, sk[2], false);
          const marked = fs.filter(f => f._mpMark).length;
          const dmg = e => { const h0 = e.hp; damageEnemy(e, 100, { src: h, critChanceOverride: 0 }); return h0 - e.hp; };
          mageMeterSet(h, 0); mp.cd.markGain = -1e9;
          const a = dmg(fs[0]), b = dmg(ref);           // la referencia queda fuera del radio de la marca
          d.marked = marked; d.ratio = +(a / b).toFixed(3); d.gained = +(mp.stats.gained || 0).toFixed(3);
          return { ok: marked === 4 && Math.abs(a / b - 1.08) < 0.01 && (mp.stats.markHits || 0) >= 1, d }; }
        case 'mp_canal': { mageMeterSet(h, 0); const g0 = mp.stats.gained || 0; upd(3500);
          d.canal = mp.stats.canal; d.meter = +M().toFixed(2); d.gained = +((mp.stats.gained || 0) - g0).toFixed(3);
          const cap = M() <= 0.6 + 1e-6; return { ok: mp.stats.canal >= 3 && (mp.stats.gained || 0) > g0 && cap, d }; }
        case 'mp_coro': { const f = __foe(60, 0); const hp0 = f.hp; upd(9800);
          d.coro = mp.stats.coro; d.fired = mp.stats.fired; d.dmg = Math.round(hp0 - f.hp); return { ok: mp.stats.coro === 2 && mp.stats.fired === 2 && hp0 - f.hp > 0, d }; }
        case 'mp_ciclo': { const f = __foe(60, 0); mageMeterSet(h, 0); const m0 = mageDamageMult(h, f, {});
          itemProcsOnCast(h, ult, true); upd(700); const m1 = mageDamageMult(h, f, {});
          d.meter = +M().toFixed(2); d.raw = raw(); d.mult = +m1.toFixed(3); return { ok: mp.stats.ciclo === 1 && M() >= 0.99 && Math.abs(m1 / m0 - 1.12) < 0.001, d }; }
        case 'mp_archivo': { const f = __foe(60, 0); h.cds = [5000, 5000, 5000]; mageMeterSet(h, 0); const m0 = mageDamageMult(h, f, {});
          h.energy = 50; itemProcsOnCast(h, sk[0], false); itemProcsOnCast(h, sk[1], false); const before = h.energy; itemProcsOnCast(h, sk[2], false);
          d.refund = Math.round(h.energy - before); d.cds = h.cds.map(Math.round); d.mult = +(mageDamageMult(h, f, {}) / m0).toFixed(3);
          return { ok: mp.stats.archivo === 1 && h.energy - before >= (sk[2].cost || 0) - 0.01 && h.cds.every(c => c <= 4000) && Math.abs(mageDamageMult(h, f, {}) / m0 - 1.10) < 0.001 && (mp.stats.gained || 0) > 0, d }; }
        case 'mpu_voz': { const f = __foe(60, 0); mageMeterSet(h, 0); const hp0 = f.hp; itemProcsOnCast(h, sk[0], false);
          const fired = mp.stats.fired, dmg = hp0 - f.hp; itemProcsOnCast(h, sk[1], false); const second = mp.stats.voz; // dentro de 1,5 s: no vuelve a sonar
          mageMeterSet(h, 1); h.cds = [5000, 5000, 5000]; upd(1000);
          d.fired = fired; d.dmg = Math.round(dmg); d.cds0 = Math.round(h.cds[0]); d.runes = h._mpRunes;
          return { ok: fired === 1 && dmg > 0 && second === 1 && Math.abs(h.cds[0] - 4800) < 1 && h._mpRunes === 4 && h._mpUnique === true, d }; }
        case 'mpu_fase': { const f = __foe(60, 0); mageMeterSet(h, 1); upd(100); const on = h._mpFase;
          const spd = h.portSpeedTimer > 0; const hp0 = f.hp; itemProcsOnCast(h, sk[0], false); const dmg = hp0 - f.hp;
          upd(5200); d.on = on; d.speed = spd; d.dmg = Math.round(dmg); d.after = +M().toFixed(2); d.end = mp.stats.faseEnd;
          return { ok: mp.stats.fase === 1 && on && spd && dmg > 0 && mp.stats.faseEnd === 1 && M() <= 0.55 && !h._mpFase, d }; }
      }
      return { ok: false, d: 'poder desconocido' };
    };
  });
  const mages = await E(() => Object.keys(CLASSES).filter(isMageClass));
  const POWERS = await E(() => Object.keys(MAGE_POWERS));
  const cover = {}; const modes = {};
  let hurtCalls = 0;
  for (const k of mages) {
    const res = await E(([k, POWERS]) => {
      const out = {}; let hurt = 0; const dh = damageHero; damageHero = function (h, a, s) { hurt++; return dh.apply(this, arguments); };
      try {
        for (const p of POWERS) {
          __start('laberinto', k);
          try { out[p] = __measure(p); } catch (err) { out[p] = { ok: false, d: 'excepción: ' + err.message }; }
        }
        // sin kit: la capa está inerte
        __start('laberinto', k); const h = player, mp = mpState(h), A = mageAdapter(h); const f0 = mageMeterGet(h);
        itemProcsOnCast(h, h.cls.skills[0], false); updateMagePassives(h, 2000);
        out.__inert = { ok: !mp.active && mageMeterGet(h) === f0 && !h._mpRunes, d: { active: mp.active } };
        out.__mode = { ok: true, d: A ? 'adaptador' : 'respaldo' };
      } finally { damageHero = dh; }
      return { out, hurt };
    }, [k, POWERS]);
    cover[k] = res.out; hurtCalls += res.hurt; modes[k] = res.out.__mode.d;
  }
  const failedCover = [];
  for (const k of mages) for (const p of POWERS) if (!cover[k][p].ok) failedCover.push(k + '/' + p + ' ' + JSON.stringify(cover[k][p].d));
  check('COBERTURA.cada_mago_recibe_un_efecto_medible_de_cada_poder', failedCover.length === 0 && mages.length * POWERS.length >= 150, { magos: mages.length, poderes: POWERS.length, fallas: failedCover.slice(0, 6) });
  check('COBERTURA.sin_kit_la_capa_esta_inerte', mages.every(k => cover[k].__inert.ok), mages.filter(k => !cover[k].__inert.ok));
  check('COBERTURA.sin_fuego_amigo_ningun_poder_hiere_a_un_heroe', hurtCalls === 0, hurtCalls);
  const adapters = mages.filter(k => modes[k] === 'adaptador'), fallbacks = mages.filter(k => modes[k] === 'respaldo');
  console.log('INFO adaptadores: ' + adapters.join(',') + ' | respaldo: ' + fallbacks.join(','));
  check('COBERTURA.hay_adaptadores_y_hay_respaldo', adapters.length >= 5 && fallbacks.length >= 5, { adapters, fallbacks });
  // un adaptador actúa sobre el número REAL de la pasiva del guardián
  {
    const r = await E(() => {
      const out = {};
      __start('laberinto', 'aelith'); __equipIds([__ITEM_OF.mp_cauce]); player.aelithSeconds = 0; mpState(player); for (let i = 0; i < 4; i++) { itemProcsOnCast(player, player.cls.skills[0], false); updateMagePassives(player, 450); }
      out.aelith = player.aelithSeconds;
      __start('laberinto', 'brasa'); __equipIds([__ITEM_OF.mp_cauce]); player.portPressure = 0; for (let i = 0; i < 6; i++) { itemProcsOnCast(player, player.cls.skills[0], false); updateMagePassives(player, 450); }
      out.brasa = player.portPressure;
      __start('laberinto', 'zahra'); __equipIds([__ITEM_OF.mpu_voz]); exState(player).heat = 0; for (let i = 0; i < 6; i++) { itemProcsOnCast(player, player.cls.skills[0], false); updateMagePassives(player, 1600); }
      out.zahra = Math.round(exState(player).heat);
      __start('laberinto', 'tibor'); __equipIds([__ITEM_OF.mp_cauce]); exState(player).colony = 10; itemProcsOnCast(player, player.cls.ultimate, true); out.tibor = Math.round(exState(player).colony);
      __start('laberinto', 'nano_gm'); __equipIds([__ITEM_OF.mp_ciclo]); ascState(player).light = 0; ascState(player).dark = 0; itemProcsOnCast(player, player.cls.ultimate, true); updateMagePassives(player, 700); const s = ascState(player); out.nano = [s.light, s.dark];
      __start('laberinto', 'morwen'); __equipIds([__ITEM_OF.mp_ciclo]); player.portResidue = 0; itemProcsOnCast(player, player.cls.ultimate, true); updateMagePassives(player, 700); out.morwen = player.portResidue;
      // Aelith: su efecto propio (-0,5 s a las otras) cuando la pasiva suena
      __start('laberinto', 'aelith'); __equipIds([__ITEM_OF.mpu_voz]); player.cds = [6000, 6000, 6000]; itemProcsOnCast(player, player.cls.skills[0], false); out.aelithCds = player.cds.map(Math.round);
      return out;
    });
    check('ADAPTADOR.Aelith_los_segundos_hurtados_se_cargan', r.aelith >= 1, r.aelith);
    check('ADAPTADOR.Brasa_la_presion_sube', r.brasa >= 1, r.brasa);
    check('ADAPTADOR.Zahra_el_calor_sube_y_nunca_pasa_del_tope_seguro', r.zahra > 0 && r.zahra <= 85, r.zahra);
    check('ADAPTADOR.Tibor_la_colonia_se_recupera_con_la_definitiva', r.tibor > 10, r.tibor);
    check('ADAPTADOR.Nano_GM_Equilibrio_sin_forzar_la_Forma_del_Regente', r.nano[0] + r.nano[1] === 3 && !(r.nano[0] >= 2 && r.nano[1] >= 2), r.nano);
    check('ADAPTADOR.Morwen_los_residuos_llegan_al_maximo', r.morwen === 5, r.morwen);
    check('ADAPTADOR.Aelith_cuando_suena_acorta_las_otras_0_5s', r.aelithCds[1] === 5500 && r.aelithCds[2] === 5500, r.aelithCds);
  }

  // ---------- 5) un mago NUEVO sin adaptador cae en el respaldo ----------
  {
    const r = await E(([POWERS]) => {
      CLASSES.mago_nuevo_prueba = Object.assign({}, CLASSES.mago, { name: 'Mago Nuevo', roleCategory: 'mago', passive: { name: 'Pasiva nueva', desc: 'sin adaptador' } });
      save.champions.mago_nuevo_prueba = JSON.parse(JSON.stringify(save.champions.mago));
      const res = { listed: Object.keys(CLASSES).filter(isMageClass).includes('mago_nuevo_prueba') };
      const out = {};
      try {
        __start('laberinto', 'mago_nuevo_prueba'); res.started = player.classKey === 'mago_nuevo_prueba'; res.adapter = mageAdapter(player);
      } catch (err) { res.err = err.message; return res; }
      for (const p of POWERS) { __start('laberinto', 'mago_nuevo_prueba'); try { out[p] = __measure(p); } catch (err) { out[p] = { ok: false, d: err.message }; } }
      res.bad = POWERS.filter(p => !out[p].ok).map(p => p + ' ' + JSON.stringify(out[p].d));
      // la Resonancia de respaldo: 4 cargas -> el siguiente lanzamiento resuena (100% de tu daño)
      __start('laberinto', 'mago_nuevo_prueba'); __equipIds([__ITEM_OF.mp_velo]); const f = __foe(60, 0); const mp = mpState(player);
      for (let i = 0; i < 4; i++) itemProcsOnCast(player, player.cls.skills[0], false);
      res.res4 = mp.res; const hp0 = f.hp; itemProcsOnCast(player, player.cls.skills[1], false);
      res.resonate = mp.stats.resonate; res.dmg = Math.round(hp0 - f.hp); res.resAfter = mp.res;
      // se apaga sola
      mp.res = 3; updateMagePassives(player, 7100); res.decay = mp.res;
      // un adaptador que falta o roto NO rompe: el estado propio del guardián no existe
      const saved = MAGE_PASSIVE_ADAPTERS.zahra; MAGE_PASSIVE_ADAPTERS.zahra = { max: 85, get: h => { throw new Error('x'); }, set: () => {} };
      let threw = false; try { __start('laberinto', 'zahra'); __equipIds([__ITEM_OF.mp_cauce]); itemProcsOnCast(player, player.cls.skills[0], false); } catch (err) { threw = true; }
      MAGE_PASSIVE_ADAPTERS.zahra = saved;
      res.brokenAdapterThrows = threw;
      delete CLASSES.mago_nuevo_prueba; delete save.champions.mago_nuevo_prueba;
      return res;
    }, [POWERS]);
    check('RESPALDO.un_mago_nuevo_entra_en_la_lista_y_arranca', r.listed && r.started && r.adapter === null, r);
    check('RESPALDO.los_12_poderes_hacen_algo_medible_en_un_mago_sin_adaptador', Array.isArray(r.bad) && r.bad.length === 0, r.bad);
    check('RESPALDO.Resonancia_4_cargas_resuena_y_se_gasta', r.res4 === 4 && r.resonate === 1 && r.dmg > 0 && r.resAfter <= 1.01, r);
    check('RESPALDO.la_Resonancia_se_apaga_sola', r.decay === 2, r.decay);
  }

  // ---------- 6) topes, limpieza, sin fugas ----------
  {
    const r = await E(() => {
      const out = {};
      __start('laberinto', 'mago'); __equipIds([__ITEM_OF.mp_coro]);
      // tope de golpes por onda
      const fs = []; for (let i = 0; i < 40; i++) fs.push(__foe(30 + (i % 8) * 8, (i >> 3) * 10 - 20));
      const n = mageNova(player, player.x, player.y, 200, 0.5); out.novaCap = n; out.cap = MAGE_CFG.resNovaMax;
      for (const f of fs) f.alive = false; enemies.length = 0;
      // la cola del Coro nunca crece y cada ciclo da exactamente 2 disparos
      __foe(60, 0); const mp = mpState(player); let maxQ = 0;
      for (let i = 0; i < 400; i++) { updateMagePassives(player, 100); maxQ = Math.max(maxQ, mp.coroQ.length); }
      out.maxQ = maxQ; out.coro = mp.stats.coro; out.expectedCoro = Math.floor(40000 / (MAGE_CFG.coroEvery + MAGE_CFG.coroGap)) * 2;
      // morir: se limpia todo y no sigue actuando
      mp.coroQ.push(1e9); mp.memoriaQ = { at: 1, amount: 1 }; player.alive = false; updateMagePassives(player, 100);
      out.afterDeath = { q: mp.coroQ.length, mq: mp.memoriaQ, active: mp.active, runes: player._mpRunes, fase: player._mpFase };
      player.alive = true; player.hp = player.maxHp;
      // quitar el equipo: se apaga
      __equipIds([__ITEM_OF.mpu_fase]); mageMeterSet(player, 1); updateMagePassives(player, 100); out.runesOn = player._mpRunes; out.faseOn = player._mpFase;
      for (const t of EQUIP_SLOT_TYPES) unequipItem(player.classKey, t); invalidatePassiveCache(); updateMagePassives(player, 100);
      out.afterUnequip = { runes: player._mpRunes, fase: player._mpFase, active: mp.active, unique: player._mpUnique };
      // marcas y estado fuera de la partida
      __equipIds([__ITEM_OF.mp_marca]); const f = __foe(60, 0); itemProcsOnCast(player, player.cls.skills[2], false); out.marked = !!f._mpMark;
      const hero0 = player; startRun(1); out.newRunMp = player._mp === undefined || player !== hero0; out.marksLeft = enemies.filter(e => e._mpMark).length;
      // snapshot de red: _mp y _mpMark fuera; las runas viajan como números
      out.skip = NET_SKIP_KEYS.has('_mp') && NET_SKIP_KEYS.has('_mpMark');
      return out;
    });
    check('TOPE.una_onda_golpea_a_lo_sumo_resNovaMax_enemigos', r.novaCap === r.cap, { n: r.novaCap, cap: r.cap });
    check('TOPE.el_Coro_dispara_dos_veces_por_ciclo_y_la_cola_no_crece', r.maxQ <= 2 && r.coro === r.expectedCoro, r);
    check('LIMPIEZA.al_morir_se_vacian_colas_y_efectos', r.afterDeath.q === 0 && r.afterDeath.mq === null && !r.afterDeath.active && !r.afterDeath.runes && !r.afterDeath.fase, r.afterDeath);
    check('LIMPIEZA.al_quitar_el_equipo_se_apagan_runas_y_fase', r.runesOn === 4 && r.faseOn === true && !r.afterUnequip.runes && !r.afterUnequip.fase && !r.afterUnequip.active && r.afterUnequip.unique === false, r);
    check('LIMPIEZA.nueva_partida_sin_marcas_ni_estado', r.marked && r.marksLeft === 0 && r.newRunMp, r);
    check('RED.el_estado_interno_no_viaja_en_el_snapshot', r.skip);
  }
  {
    // partida larga con el kit completo y una horda real: sin excepciones, sin crecer
    const r = await E(() => {
      __start('laberinto', 'mago');
      const set = [__ITEM_OF.mp_coro, __ITEM_OF.mp_archivo, __ITEM_OF.mpu_fase, __ITEM_OF.mp_tercer, __ITEM_OF.mp_memoria, __ITEM_OF.mp_velo];
      const eq = __equipIds(set);
      for (let i = 0; i < 14; i++) __foe(70 + (i % 5) * 18, (i >> 2) * 26 - 40, 1e7);
      const start = { enemies: enemies.length, vfx: typeof vCount === 'number' ? vCount : 0, keys: Object.keys(player).length };
      let casts = 0; const sk = player.cls.skills; let maxMarks = 0;
      for (let t = 0; t < 60000; t += 16) {
        player.hp = player.maxHp;
        if (t % 400 === 0) { const i = (t / 400) % 3; if (player.cds[i] <= 0) { useSkill(i, null); casts++; } }
        if (t % 5000 === 0 && player.ultCharge >= 100) { try { useUltimate(); } catch (e) {} }
        update(16);
        maxMarks = Math.max(maxMarks, enemies.filter(e => e._mpMark).length);
      }
      const mp = mpState(player);
      const end = { enemies: enemies.length, keys: Object.keys(player).length, objKeys: Object.keys(mp).length, queue: mp.coroQ.length, vfxMax: typeof VFX_MAX === 'number' ? VFX_MAX : 0, vCount: typeof vCount === 'number' ? vCount : 0 };
      return { eq, start, end, casts, stats: mp.stats, maxMarks };
    });
    check('LARGA.60_s_con_horda_y_kit_sin_excepciones_ni_crecimiento', r.eq && r.casts > 20 && r.end.enemies <= r.start.enemies + 2 && r.end.queue <= 2 && r.end.keys - r.start.keys < 40 && r.maxMarks <= 4 * 6, r);
  }

  // ---------- 7) balance: DPS con y sin kit ----------
  // 40 s de combate contra maniquíes quietos (12 juntos = una horda; 1 = un jefe). Rotación fija: habilidades en cuanto salen y hay energía
  // (SIN rellenarla: la energía real limita), la definitiva cuando carga, básico cada 0,3 s. Mide el daño total (vida perdida de los maniquíes) con 2 semillas.
  const bal = await E(() => {
    const run1 = (champ, ids, nFoes, powersOn, seconds, seed0) => {
      let seed = seed0; const orig = Math.random; Math.random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
      try {
        __start('laberinto', champ); const saved = heroMagePowers;
        if (!powersOn) heroMagePowers = () => null;
        __equipIds(ids);
        player.energy = player.maxEnergy = player.cls.energyMax || 100;
        const fs = []; for (let i = 0; i < nFoes; i++) fs.push(__foe(70 + (i % 5) * 14, (i >> 2) * 22 - 40, 1e9));
        for (let t = 0; t < seconds * 1000; t += 16) {
          player.hp = player.maxHp;
          for (let i = 0; i < 3; i++) if (player.cds[i] <= 0) useSkill(i, null);
          if (player.ultCharge >= 100) { try { useUltimate(); } catch (e) {} }
          if (t % 300 === 0) triggerBasic(player);
          update(16);
        }
        heroMagePowers = saved;
        return fs.reduce((s, f) => s + (f.maxHp - f.hp), 0);
      } finally { Math.random = orig; }
    };
    const run = (champ, ids, nf, on) => (run1(champ, ids, nf, on, 40, 11) + run1(champ, ids, nf, on, 40, 977)) / 2;
    const O = __ITEM_OF;
    const kitA = [O.mp_coro, O.mp_archivo, O.mpu_fase, O.mp_tercer, O.mp_memoria, O.mp_velo];      // ofensivo: arma, casco, pechera, guantes, botas, escudo
    const kitB = [O.mp_coro, O.mp_ciclo, O.mpu_voz, O.mp_tercer, O.mp_memoria, O.mp_velo];
    // control: los mejores objetos que ya existían (míticos con receta), uno por ranura
    const ctrl = ['myth_martillo_tormenta', 'myth_corona_invierno', 'myth_corazon_averno', 'myth_grimorio_vacio', 'leg_umbral', 'myth_egida_bastion'];
    const out = {};
    for (const champ of ['mago', 'aelith', 'vhal']) for (const [nf, label] of [[12, 'horda'], [1, 'jefe']]) {
      const base = run(champ, [], nf, true);
      const itemsA = run(champ, kitA, nf, false), fullA = run(champ, kitA, nf, true);
      const r = { base: Math.round(base), powersA: +(fullA / itemsA - 1).toFixed(3), totalA: +(fullA / base - 1).toFixed(3) };
      if (nf === 12) { const itemsB = run(champ, kitB, nf, false), fullB = run(champ, kitB, nf, true), c = run(champ, ctrl, nf, true);
        r.powersB = +(fullB / itemsB - 1).toFixed(3); r.totalB = +(fullB / base - 1).toFixed(3); r.control = +(c / base - 1).toFixed(3); }
      out[champ + '/' + label] = r;
    }
    return out;
  });
  console.log('INFO balance (powers = kit completo con poderes vs las MISMAS piezas sin poderes; total = vs sin equipo; control = 6 míticos/legendarios ya existentes):\n' + JSON.stringify(bal, null, 1));
  const worstPowers = Math.max(...Object.values(bal).map(b => Math.max(b.powersA, b.powersB === undefined ? -9 : b.powersB)));
  const worstTotal = Math.max(...Object.values(bal).map(b => Math.max(b.totalA, b.totalB === undefined ? -9 : b.totalB)));
  const ctrlBest = Math.max(...Object.values(bal).map(b => b.control === undefined ? -9 : b.control));
  check('BALANCE.los_poderes_solos_suman_a_lo_sumo_35_por_ciento_de_DPS', worstPowers <= 0.35, { worstPowers });
  check('BALANCE.el_kit_completo_no_supera_en_mas_de_35_al_mejor_equipo_ya_existente', worstTotal <= (1 + ctrlBest) * 1.35 - 1, { worstTotal, ctrlBest });

  check('SIN_ERRORES', errors.length === 0, errors.slice(0, 4));
  await browser.close();
  console.log(fails ? `\n${fails} FALLAS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})();
