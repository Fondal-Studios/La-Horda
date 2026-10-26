// Efectos visuales de SET (modelo B, docs/economy/BRASAS_REDEFINICION.md):
//  - cada set tiene identidad visual (tema + aura válida; par tema/aura único)
//  - el aura/partículas escalan con las piezas puestas (2 / 3 / completo)
//  - las habilidades toman la paleta del set equipado (solo color: daño y radios intactos)
//  - la skin equipada no cambia al equipar piezas; completar el set NO otorga skin
//  - grandfathering: un guardado viejo con set completo y skin regalada la conserva
//  - "Reducir efectos" apaga partículas y tinte
//   (python3 -m http.server 8771 &) ; node tools/items/t_sets_visuales.js
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const BASE = process.env.SE_BASE_URL || 'http://127.0.0.1:8771';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 400) : '')); if (!ok) fails++; };
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await (await browser.newContext({ viewport: { width: 900, height: 506 } })).newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g|net::|404/.test(m.text())) errors.push('console: ' + m.text().slice(0, 300)); });
  await page.addInitScript(() => { window.__campaignMode = true; });
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load' });
  for (let k = 0; k < 300; k++) { if (await page.evaluate(() => !document.getElementById('title-continue-btn').disabled)) break; await sleep(100); }
  const E = (fn, a) => page.evaluate(fn, a);
  await E(() => { loop = function(){};
    window.__run = (champ, set, n) => {
      for (const k of Object.keys(save.champions)) save.champions[k].unlocked = true;
      save.stash = []; for (const k in save.champions) save.champions[k].equipment = mkEquipment();
      setPieceIds(set).slice(0, n).forEach(p => { const it = makeDesignedItem(p); stashItems().push(it); equipItem(champ, it.uid); });
      invalidatePassiveCache();
      selectedClass = champ; currentArena = 'bosque'; lobbyAllies = []; startRun(1); spawnTimer = 1e12; enemies.length = 0; levelDuration = 9e9;
      runElapsedMs = 100000; _passiveFrame++;
      return player;
    };
    window.__foe = (dx, dy) => { const e = spawnEnemy('zombie', false); e.x = player.x + (dx||40); e.y = player.y + (dy||0); e.hp = e.maxHp = 50000; return e; };
  });

  // ---------- identidad visual de todos los sets ----------
  const id = await E(() => {
    const ids = Object.keys(SET_DB), seen = new Map(), bad = [];
    for (const k of ids) {
      const S = SET_DB[k], rgb = String(S.aura || '').split(',').map(Number);
      const ok = S.theme && rgb.length === 3 && rgb.every(n => Number.isInteger(n) && n >= 0 && n <= 255) && typeof setVisualBlurb(k) === 'string' && setVisualBlurb(k).length > 10;
      const key = S.theme + '|' + S.aura; if (seen.has(key)) bad.push(k + '=' + seen.get(key)); seen.set(key, k);
      if (!ok) bad.push(k);
    }
    return { n: ids.length, bad };
  });
  check('IDENTIDAD.todos_los_sets_con_tema_y_aura_unicos', id.n >= 50 && id.bad.length === 0, id);

  // ---------- el aura escala con las piezas ----------
  const sc = await E(() => {
    const champ = 'tanque', set = 'baluarte', out = {};
    for (const n of [1, 2, 3, 4]) {
      __run(champ, set, n); const v = setVisualDominant(player);
      let c0 = particles.length, made = 0;
      for (let i = 0; i < 4000; i++) { const before = particles.length; updateSetVisuals(player, 16.7); made += particles.length - before; particles.length = Math.min(particles.length, 100000); }
      out[n] = { dom: v ? v.n : 0, made };
    }
    return out;
  });
  check('AURA.sin_piezas_suficientes_no_hay', sc[1].dom === 0 && sc[1].made === 0, sc[1]);
  check('AURA.escala_con_las_piezas', sc[2].made > 0 && sc[3].made > sc[2].made && sc[4].made > sc[3].made, sc);

  // ---------- tinte de habilidades por el set (solo color) ----------
  const tint = await E(() => {
    const cast = (n, reduce) => {
      __run('segador', 'marea', n); JUICE.reduceFx = !!reduce; for (let i = 0; i < 4; i++) __foe(50 + i*20, i*10 - 15);
      const rec = [], save0 = netMatch; netMatch = { role: 'host', recording: true };
      const oldRec = netRecord; netRecord = (nm, a) => rec.push([nm, nm === 'vfxShock' ? a[4] : a[3]]);
      const hp0 = enemies.reduce((s, e) => s + e.hp, 0);
      try { for (const i of [0, 1, 2]) castAbility(player, player.cls.skills[i], false, i); } finally { netRecord = oldRec; netMatch = save0; JUICE.reduceFx = false; }
      return { bursts: rec.filter(r => r[0] === 'vfxBurst').map(r => r[1]), shocks: rec.filter(r => r[0] === 'vfxShock').map(r => r[1]), dmg: hp0 - enemies.reduce((s, e) => s + e.hp, 0) };
    };
    const none = cast(1), full = cast(4), red = cast(4, true), two = cast(2);
    const hex = (() => { const c = String(SET_DB.marea.aura).split(',').map(Number); return 't_#' + c.map(n => n.toString(16).padStart(2, '0')).join(''); })();
    const keep = ['blood', 'flesh', 'bone', 'rot', 'rock', 'gore'];
    return { none: none.bursts.length, fullTinted: full.bursts.length > 0 && full.bursts.every(b => b === hex || keep.includes(b)),
      twoTinted: two.bursts.some(b => b === hex), noneUntinted: none.bursts.every(b => b !== hex) && !none.shocks.includes(hex),
      reducedUntinted: red.bursts.every(b => b !== hex),
      shockTinted: full.shocks.length > 0 && full.shocks.some((s, i) => s !== none.shocks[i]),
      sameDamage: Math.abs(full.dmg - none.dmg) < 1e-6 || (full.dmg > 0 && none.dmg > 0) };
  });
  check('TINTE.set_equipado_tine_las_habilidades', tint.fullTinted && tint.shockTinted && tint.twoTinted, tint);
  check('TINTE.sin_set_o_con_efectos_reducidos_no_tine', tint.noneUntinted && tint.reducedUntinted, tint);
  check('TINTE.no_cambia_el_dano', tint.sameDamage, tint);

  // ---------- skin vs. set ----------
  const sk = await E(() => {
    state = 'menu';
    save.cosmeticUnlocks = {}; save.champions.segador.cosmeticSkin = ''; save.champions.segador.croma = null;
    __run('segador', 'marea', 4); updateSets(player, 16);
    const gift = { active: !!activeSetSkin(player), owned: skinOwnedFull('marea'), cheapUnlock: cosmeticUnlockCompletedSet('marea') };
    state = 'menu'; save.cosmeticUnlocks = { marea: true }; const eq = skinCosmeticEquip('segador', 'marea');
    const seq = [];
    for (const n of [0, 2, 4, 1]) { __run('segador', 'marea', n); updateSets(player, 16); seq.push(activeSetSkin(player) === SET_SKINS.marea); state = 'menu'; }
    // con skin propia, el tinte lo pone la skin (no el set)
    save.champions.segador.cosmeticSkin = ''; save.cosmeticUnlocks = {};
    return { gift, eq, seq };
  });
  check('SKIN.completar_el_set_no_otorga_skin', !sk.gift.active && !sk.gift.owned && !sk.gift.cheapUnlock, sk.gift);
  check('SKIN.equipada_no_cambia_al_equipar_piezas', sk.eq === true && sk.seq.every(Boolean), sk);

  // ---------- grandfathering: guardado viejo con set completo y skin regalada ----------
  const gf = await E(() => {
    state = 'menu';
    const c = 'segador', id = 'marea';
    save.setSkinsPremiumV1 = false; save.cosmeticUnlocks = {}; save.champions[c].cosmeticSkin = ''; save.champions[c].croma = null;
    save.stash = []; save.champions[c].equipment = mkEquipment();
    setPieceIds(id).forEach(p => { const it = makeDesignedItem(p); stashItems().push(it); equipItem(c, it.uid); });
    invalidatePassiveCache();
    const before = skinOwnedFull(id);               // sin migrar: ya no cuenta como poseída
    setSkinsPremiumMigrate();
    const after = skinOwnedFull(id), equipped = save.champions[c].cosmeticSkin === id;
    // otro guardián con skin regalada por vale (cosmeticUnlocks) la conserva
    save.cosmeticUnlocks = Object.assign({}, save.cosmeticUnlocks, { nocturno: true }); setSkinsPremiumMigrate();
    const kept = skinOwnedFull('nocturno');
    save.cosmeticUnlocks = {}; save.champions[c].cosmeticSkin = ''; save.champions[c].equipment = mkEquipment(); save.stash = [];
    return { before, after, equipped, kept, flag: save.setSkinsPremiumV1 };
  });
  check('GRANDFATHERING.set_completo_viejo_conserva_la_skin', gf.before === false && gf.after === true && gf.equipped === true && gf.kept === true && gf.flag === true, gf);

  check('sin_errores_de_pagina', errors.length === 0, errors.slice(0, 5));
  await browser.close();
  console.log(fails ? `\n${fails} FALLAS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})();
