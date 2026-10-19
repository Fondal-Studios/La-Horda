'use strict';
/* Pruebas de las formas de definitiva (js/champions/ult-forms/) en el motor real:
   1. Ninguna forma consume Math.random (se bloquea y se lanza cada una, también con argumentos hostiles: NaN, 0, negativos, enormes).
   2. Sprites: alfa 0/255 en todos los cuadros de cada forma y tamaño, y como máximo 8 colores distintos por tira (contorno + 3 tonos + brillo + acento + sombra).
   3. Pool acotado: miles de lanzamientos no pasan de KVB.MAX y se vacía al reiniciar la partida.
   4. Mecánica idéntica con y sin formas: cada definitiva con forma se simula 150 cuadros con window.UF_OFF = true y false (mismo azar, mismo reloj virtual) y se comparan las
      huellas del estado (vida y posición de cada enemigo y héroe, recargas, cantidad de objetos, proyectiles y zonas) y el número de llamadas a Math.random.
   5. Red: el lanzamiento queda grabado como kvbFx('uf.<clave>', ...) con argumentos numéricos.
   6. Cada campeón con forma existe en el roster, y cada habilidad con forma (clave.casilla) corresponde a una casilla real.
   Uso: BASE_URL=http://127.0.0.1:9301/ [ONLY=a,b] node tools/vfx/test-ult-forms.js        (sale con 1 si algo falla) */
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const BASE = process.env.BASE_URL || process.env.ABILITY_BASE_URL || 'http://127.0.0.1:9301/';
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  const page = await browser.newPage({viewport: {width: 844, height: 390}}), errors = []; let bad = 0;
  page.on('pageerror', e => errors.push(e.message));
  const ok = (name, cond, extra) => { if (!cond) bad++; console.log((cond ? 'OK     ' : 'FALLA  ') + name + (extra ? ' ' + extra : '')); };
  await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 120000});
  await page.waitForFunction(() => typeof startRun === 'function' && typeof UF !== 'undefined' && assetsAllReady(), null, {timeout: 120000});
  await page.waitForTimeout(1500);
  const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
  const keys = (await page.evaluate(() => Object.keys(UF.champs))).filter(k => !only || only.includes(k.split('.')[0]));
  // 1 + 3: sin azar, argumentos hostiles, pool acotado
  const r1 = await page.evaluate(keys => {
    const rnd = Math.random; let calls = 0;
    const out = {calls: 0, errs: [], pool: 0, max: KVB.MAX, after: -1};
    netMatch = null; selectedClass = 'tanque'; startRun(1); state = 'playing';   // startRun usa azar (baldosas del suelo): fuera del bloqueo
    Math.random = () => { calls++; return .5; };
    try {
      const hostile = [[NaN, 0, 100, 0], [0, 0, 0, 0], [0, 0, -50, 0], [0, 0, 1e9, 0], [Infinity, 0, 60, 0], [0, 0, 100, NaN], [player.x, player.y, 120, 0]];
      for (const k of keys) for (const a of hostile) { try { kvbFx('uf.' + k, a[0], a[1], a[2], a[3]); } catch (e) { out.errs.push(k + ': ' + e.message); } }
      for (let i = 0; i < 4000; i++) { const k = keys[i % keys.length]; try { ufPlay(k, player.x + (i % 7) * 10, player.y, 60 + (i % 9) * 30, i * .1); } catch (e) { out.errs.push(k + ': ' + e.message); } out.pool = Math.max(out.pool, KVB.pool.length); }
      vfxResetRun(); out.after = KVB.pool.length;
    } finally { out.calls = calls; Math.random = rnd; state = 'menu'; }
    return out;
  }, keys);
  ok('1. ninguna forma consume Math.random (' + keys.length + ' claves, 7 argumentos hostiles cada una)', r1.calls === 0 && r1.errs.length === 0, `llamadas=${r1.calls} errores=${r1.errs.slice(0, 3).join('; ')}`);
  ok('3. pool acotado y limpio al reiniciar', r1.pool <= r1.max && r1.after === 0, `máx=${r1.pool}/${r1.max} tras reinicio=${r1.after}`);
  // 2: sprites
  const r2 = await page.evaluate(keys => {
    const bad = []; let strips = 0;
    for (const k of keys) { const F = UF.forms[UF.champs[k].form]; for (const rp of [24, 48, 72]) for (const l of ['t', 'g']) { if (l === 'g' && !F.gpaint) continue; const job = ufBake(k, l, rp); if (!job) { bad.push(k + ' sin horneado ' + l + '@' + rp); continue; } strips++;
      const cols = new Set(); let aBad = 0; for (const fr of job.frames) { const d = fr.getContext('2d').getImageData(0, 0, fr.width, fr.height).data; for (let i = 0; i < d.length; i += 4) { if (d[i + 3] !== 0 && d[i + 3] !== 255) aBad++; if (d[i + 3]) cols.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]); } }
      if (aBad) bad.push(k + ' alfa intermedio x' + aBad + ' ' + l + '@' + rp); if (cols.size > 8) bad.push(k + ' ' + cols.size + ' colores ' + l + '@' + rp); if (job.frames.length !== F.N) bad.push(k + ' cuadros ' + job.frames.length); } }
    return {bad, strips};
  }, keys);
  ok('2. sprites: alfa 0/255 y <= 8 colores por tira (' + r2.strips + ' tiras)', r2.bad.length === 0, r2.bad.slice(0, 4).join('; '));
  // 5: red
  const r5 = await page.evaluate(keys => {
    selectedClass = 'tanque'; netMatch = null; startRun(1); state = 'playing'; const rec = []; const o = window.kvbFx;
    const hasNet = NET_EVENT_FNS.includes('kvbFx'); let argsOk = true;
    for (const k of keys.slice(0, 5)) { const a = [player.x, player.y, 90, 0]; if (!a.every(Number.isFinite)) argsOk = false; kvbFx('uf.' + k, ...a); }
    state = 'menu'; return {hasNet, argsOk, registered: keys.every(k => typeof KVB_FX['uf.' + k] === 'function')};
  }, keys);
  ok('5. red: kvbFx viaja como evento del anfitrión y cada clave tiene su receta', r5.hasNet && r5.argsOk && r5.registered, JSON.stringify(r5));
  // 6: roster y casillas
  const r6 = await page.evaluate(keys => keys.filter(k => { const [c, slot] = k.split('.'); if (!CLASSES[c]) return true; return slot !== undefined && !CLASSES[c].skills[+slot]; }), keys);
  ok('6. cada forma pertenece a un campeón y a una casilla reales', r6.length === 0, r6.join(','));
  // 4: mecánica idéntica con y sin formas (cada corrida en una página nueva: el estado que deja una partida -cachés, ambiente- contamina la siguiente)
  const ults = keys.filter(k => !k.includes('.'));
  let same = 0, diffs = [];
  const SIM = ([k, off]) => {
    window.UF_OFF = off; let seedv = 987654321, calls = 0, vt = 1000; const rnd = Math.random, pn = performance.now; performance.now = () => vt;
    Math.random = () => { calls++; seedv ^= seedv << 13; seedv >>>= 0; seedv ^= seedv >> 17; seedv ^= seedv << 5; seedv >>>= 0; return seedv / 4294967296; };
    try {
      netMatch = null; save.stash = []; save.relics = {hp: 0, dmg: 0, def: 0, vel: 0};
      for (const c in save.champions) { const s = save.champions[c]; s.unlocked = true; s.level = 20; s.xp = 0; s.equipment = {}; s.inventory = []; s.talents = {nodes: {}, mastery: null, masteryNodes: {}}; }
      selectedClass = k; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'mago'].filter(x => x !== k); startRun(3);
      enemies = []; spawnTimer = 1e9; arenaHazardTimer = 1e9; player.fx = 1; player.fy = 0; state = 'playing';
      runLevel = Math.max(runLevel || 1, typeof ULT_MIN_ARENA_LEVEL !== 'undefined' ? ULT_MIN_ARENA_LEVEL : 1);
      for (let i = 0; i < 12; i++) { const e = spawnEnemy('esqueleto'); Object.assign(e, {x: player.x + 70 + (i % 4) * 22, y: player.y + (((i / 4) | 0) - 1) * 30, hp: 1e6, maxHp: 1e6, speed: 0, baseSpeed: 0, dmg: 0}); }
      for (const a of allies) a.stunTimer = 1e9;
      player.energy = 1e4; player.ultCharge = player.ultMax; player.aim = {x: player.x + 110, y: player.y, dx: 1, dy: 0};
      for (let f = 0; f < 150; f++) { if (f === 5) { player.cds = [0, 0, 0]; player.energy = 1e4; player.ultCharge = player.ultMax; player.ultCd = 0; castAbility(player, player.cls.ultimate, true); } vt += 16; update(16); if (f % 3 === 0) render(); }
      return JSON.stringify({calls, t: Math.round(runElapsedMs), p: [Math.round(player.x * 100), Math.round(player.y * 100), Math.round(player.hp), Math.round(player.shield || 0), player.cds.map(c => Math.round(c))], e: enemies.map(e => [Math.round(e.x * 100), Math.round(e.y * 100), Math.round(e.hp), e.slowTimer | 0, e.stunTimer | 0, e.bleedTimer | 0]),
        h: heroes.map(h => [Math.round(h.x * 100), Math.round(h.hp), Math.round(h.shield || 0)]), objs: (typeof portadorObjects !== 'undefined' ? portadorObjects : []).map(o => o.kind + ':' + Math.round(o.x) + ':' + Math.round(o.y)), pr: projectiles.length, fw: typeof fireWalls !== 'undefined' ? fireWalls.length : 0});
    } finally { Math.random = rnd; performance.now = pn; window.UF_OFF = false; state = 'menu'; }
  };
  const fresh = async () => { const pg = await browser.newPage({viewport: {width: 844, height: 390}}); pg.on('pageerror', e => errors.push(e.message)); await pg.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 120000}); await pg.waitForFunction(() => typeof startRun === 'function' && typeof UF !== 'undefined' && assetsAllReady(), null, {timeout: 120000}); await pg.waitForTimeout(600); return pg; };
  for (const k of ults) {
    const once = async off => { const pg = await fresh(); try { return await pg.evaluate(`(${SIM.toString()})(${JSON.stringify([k, off])})`); } finally { await pg.close(); } };
    const a = await once(true), b = await once(false); if (a === b) same++; else diffs.push(k + '\n  ' + a.slice(0, 240) + '\n  ' + b.slice(0, 240));
  }
  ok('4. mecánica idéntica con y sin formas (' + ults.length + ' definitivas, 150 cuadros, mismo azar)', diffs.length === 0, `iguales=${same} ` + diffs.slice(0, 2).join('\n'));
  // 7: segunda tanda (13 definitivas, mitad B): cada una tiene forma propia registraday se reproduce con ufPlay
  const B2 = ['oriel', 'orsa', 'renko', 'saelis', 'segador', 'sira', 'solciju', 'tibor', 'vesper', 'veyra', 'vhal', 'ynara', 'zahra'].filter(k => !only || only.includes(k));
  const r7 = await page.evaluate(B2 => {
    const out = {missing: B2.filter(k => !UF.champs[k]), notPlayed: []};
    selectedClass = 'tanque'; netMatch = null; startRun(1); state = 'playing';
    for (const k of B2) { const p0 = UF.stats.played; ufPlay(k, player.x, player.y, 150, 0); if (UF.stats.played !== p0 + 1) out.notPlayed.push(k); }
    vfxResetRun(); state = 'menu'; return out;
  }, B2);
  ok('7. segunda tanda: ' + B2.length + ' definitivas con forma propia registrada y reproducible', r7.missing.length === 0 && r7.notPlayed.length === 0, JSON.stringify(r7));
  ok('0. sin errores de página', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close(); process.exitCode = bad ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });
