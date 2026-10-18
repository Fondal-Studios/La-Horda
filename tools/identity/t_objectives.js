// Pruebas de los OBJETIVOS VARIADOS por arena (js/arenas/common/arena-objectives.js).
//   (python3 -m http.server 8771 &) ; node tools/identity/t_objectives.js [carpeta_capturas]
//   variables: SE_BASE_URL (default http://127.0.0.1:8771), CHROMIUM_PATH (opcional)
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const path = require('path');
const BASE = process.env.SE_BASE_URL || 'http://127.0.0.1:8771';
const OUT = process.argv[2] || null;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 300) : '')); if (!ok) fails++; };
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'], executablePath: process.env.CHROMIUM_PATH || undefined });
  const page = await (await browser.newContext({ viewport: { width: 900, height: 506 } })).newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g|net::/.test(m.text())) errors.push('console: ' + m.text().slice(0, 300)); });
  await page.addInitScript(() => { window.__campaignMode = true; });
  await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  for (let k = 0; k < 300; k++) { if (await page.evaluate(() => !document.getElementById('title-continue-btn').disabled)) break; await sleep(100); }
  await page.evaluate(() => { loop = function(){}; });
  const E = (fn, a) => page.evaluate(fn, a);
  await E(() => {
    window.__start = (arena, lv, champ) => {
      for (const k of Object.keys(save.champions)) save.champions[k].unlocked = true;
      selectedClass = champ || 'guerrero'; currentArena = arena; lobbyAllies = ['tanque','mago','soporte'];
      startRun(lv || 1);
    };
    window.__step = (ms, god) => { let t = 0; while (t < ms) { if (state === 'buff') { const c = document.querySelector('#buff-cards > *'); if (c) c.click(); continue; } if (state !== 'playing') break; if (god !== false) for (const h of heroes) h.hp = Math.max(h.hp, h.maxHp*0.8); update(16); t += 16; } };
    window.questsToast = function(){};
    window.__calm = () => { spawnTimer = 1e12; enemies.length = 0; };
  });
  const shot = async (n) => { if (!OUT) return; await E(() => { if (typeof tutHide === 'function') tutHide(); const b = document.getElementById('center-banner'); if (b) b.style.display = 'none'; render(); updateHUD(); }); await page.screenshot({ path: path.join(OUT, n + '.png') }); };

  const EXPECT = { bosque:'collect', acuatica:'escort', hielo:'hold', laberinto:'hunt', infernal:'defend', fortaleza:'hold', abismo:'collect', micelial:'hunt' };
  for (const [arena, kind] of Object.entries(EXPECT)) {
    // ---- arranca con su verbo propio y marcas en lugares caminables ----
    const st = await E(([a]) => { __start(a, 2); __calm(); __step(100); updateHUD(); return { on: OBJ.on, kind: OBJ.kind, chip: document.getElementById('goal-chip').textContent, n: OBJ.need,
      pts: (OBJ.items.length ? OBJ.items : [OBJ.npc, OBJ.goal]).filter(Boolean).map(p => objWalkable(p.x, p.y, 16)), lvl: runLevel }; }, [arena]);
    check(`${arena}.objetivo_${kind}`, st.on && st.kind === kind && !/sobrevivir/.test(st.chip) && st.chip.startsWith('OBJETIVO:'), st);
    if (kind !== 'hunt') check(`${arena}.marcas_en_suelo_caminable`, st.pts.length > 0 && st.pts.every(Boolean), st.pts);
    if (kind === 'hunt') {
      const m = await E(() => { for (let i = 0; i < 6; i++) { const e = spawnEnemy('esqueleto', false); e.x = player.x + 150 + i*25; e.y = player.y - 60 + i*30; enemies.push(e); } OBJ.markAt = 0; __step(1200); if (OBJ.target) { OBJ.target.hp = OBJ.target.maxHp = 1e5; } const t = OBJ.target; return { marked: !!t, hp: t && t.hp, max: t && t.maxHp, ok: t && t._objMark }; });
      check(`${arena}.presa_se_marca_sola`, m.marked && m.ok, m);
    }
    if (kind === 'escort') {
      const m = await E(() => { const g = OBJ.goal, n = OBJ.npc, d0 = Math.hypot(g.x-n.x, g.y-n.y); let k = 0; const ang = Math.atan2(g.y-player.y, g.x-player.x);
        for (let i = 0; i < 70; i++) { player.x += Math.cos(ang)*5; player.y += Math.sin(ang)*5; __step(48, true); if (levelClearing || OBJ.ok) break; }
        return { d0: Math.round(d0), d1: Math.round(Math.hypot(g.x-n.x, g.y-n.y)), hp: Math.round(OBJ.hp), ok: OBJ.ok, follows: Math.hypot(player.x-n.x, player.y-n.y) < 200 }; });
      check(`${arena}.la_criatura_sigue_al_guardian_y_avanza`, m.d1 < m.d0 && m.follows, m);
    }
    await shot(`${arena}_inicio`);

    // ---- cumplirlo cura al equipo y no cambia el avance ----
    const res = await E(([a, kind]) => {
      if (kind === 'hunt' || kind === 'escort') { __calm(); objBeginLevel(); }
      for (const h of heroes) h.hp = h.maxHp * 0.5;
      const hp0 = player.hp;
      if (kind === 'collect') { for (const it of OBJ.items) { player.x = it.x; player.y = it.y; objUpdate(16); } }
      else if (kind === 'hold') { for (const z of OBJ.items) { player.x = z.x; player.y = z.y; for (let i = 0; i < 400 && !z.done; i++) objUpdate(16); } }
      else if (kind === 'defend') { __step(OBJ.def ? 200 : 0, false); levelTimer = levelDuration; objUpdate(16); beginLevelClear(); objUpdate(16); }
      else if (kind === 'escort') { player.x = OBJ.goal.x; player.y = OBJ.goal.y; OBJ.npc.x = OBJ.goal.x; OBJ.npc.y = OBJ.goal.y; objUpdate(16); }
      else if (kind === 'hunt') { OBJ.markAt = 0; OBJ.t = 1; const e = spawnEnemy('esqueleto', false); e.x = player.x + 40; e.y = player.y; enemies.push(e); objUpdate(16); const t = OBJ.target; const ok0 = !!t; if (t) killEnemy(t); objUpdate(16); }
      return { ok: OBJ.ok, healed: player.hp > hp0, chip: (updateHUD(), document.getElementById('goal-chip').textContent), level: runLevel };
    }, [arena, kind]);
    check(`${arena}.cumplirlo_cura_y_cambia_chip`, res.ok && res.healed && /cumplido/.test(res.chip), res);
    await shot(`${arena}_cumplido`);
  }

  // ---- progreso en vivo (chip con contador) y marcas con la partida real ----
  const live = await E(() => { __start('bosque', 3); __calm(); const it = OBJ.items[0]; player.x = it.x; player.y = it.y; __step(60, true); updateHUD(); return document.getElementById('goal-chip').textContent; });
  check('bosque.chip_muestra_progreso_1_de_N', /1\/\d/.test(live), live);
  await shot('bosque_progreso');

  // ---- fallo del altar / tortuga: sin castigo, chip vuelve a sobrevivir ----
  const fail = await E(() => { __start('infernal', 3); __calm(); const o = OBJ.items[0]; for (let i = 0; i < 4; i++) { const e = spawnEnemy('esqueleto', false); e.x = o.x; e.y = o.y; e.hp = e.maxHp = 1e9; e.speed = 0; enemies.push(e); }
    for (const h of heroes) { h.x = o.x + 900; h.y = o.y; } objUpdate(16); for (let i = 0; i < 400 && !OBJ.fail; i++) objUpdate(100); updateHUD(); return { fail: OBJ.fail, chip: document.getElementById('goal-chip').textContent, lvl: runLevel, state }; });
  check('infernal.altar_cae_sin_castigo', fail.fail && /sobrevivir/.test(fail.chip) && fail.state === 'playing', fail);

  // ---- nivel 10 / jefe: sin objetivo; la campaña sigue igual ----
  const boss = await E(() => { __start('bosque', 10); __calm(); __step(100); updateHUD(); return { on: OBJ.on, chip: document.getElementById('goal-chip').textContent, boss: bossActive }; });
  check('nivel10.sin_objetivo_propio', !boss.on && !/semillas/.test(boss.chip), boss);

  // ---- sala (netMatch != null): vuelve a sobrevivir, sin tocar js/net ----
  const room = await E(() => { __start('bosque', 3); netMatch = { role: 'host', ended: false, slots: [] }; objBeginLevel(); objUpdate(16); const r = { on: OBJ.on, chip: (updateHUD(), document.getElementById('goal-chip').textContent) }; netMatch = null; return r; });
  check('sala.fallback_a_sobrevivir', !room.on && /sobrevivir/.test(room.chip), room);
  const guest = await E(() => { netMatch = { role: 'guest', ended: false }; const en = objEnabled(); netMatch = null; return en; });
  check('sala.invitado_sin_objetivo', guest === false);

  // ---- Ciudad y Minas conservan lo suyo ----
  const old = await E(() => { const r = {}; for (const a of ['ciudad', 'minas']) { __start(a, 2); __calm(); __step(100); r[a] = { on: OBJ.on, def: !!OBJ_DEFS[a] }; } return r; });
  check('ciudad_minas.no_se_tocan', !old.ciudad.on && !old.minas.on && !old.ciudad.def && !old.minas.def, old);

  // ---- partida completa de 10 niveles sigue cerrando niveles por tiempo con objetivo activo ----
  const prog = await E(() => { __start('micelial', 1); let lv = 1; let guard = 0; const seen = new Set(); while (runLevel < 4 && guard++ < 4000) { if (OBJ.on) seen.add(OBJ.kind); __step(500); } return { runLevel, state, kinds: [...seen] }; });
  check('campana.avanza_niveles_con_objetivo', prog.runLevel >= 4 && prog.state === 'playing', prog);

  check('SIN_ERRORES', errors.length === 0, errors.slice(0, 5));
  console.log(fails ? `FALLAS: ${fails}` : 'OK todas');
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
