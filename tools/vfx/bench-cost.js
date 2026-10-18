'use strict';
/* Costo por frame de los efectos propios (js/champions/vfx-b/): para cada campeón se lanza su kit completo en bucle (cada habilidad cuando está lista,
   la definitiva cuando carga) durante 6 s simulados contra 12 muñecos, alternando KVB.off = true/false (5 repeticiones intercaladas tras un calentamiento) y midiendo aparte el tiempo propio de las funciones de vfx-b,
   y se mide el tiempo medio de update()+render() por frame (mediana). Es CPU de Chromium sin GPU: sirve para COMPARAR con/sin efectos, no como valor absoluto.
   Uso: ONLY=a,b REPS=5 FRAMES=375 ABILITY_BASE_URL=http://127.0.0.1:8961/ node tools/vfx/bench-cost.js  (OUT=ruta.json guarda el resultado) */
const fs = require('node:fs'), path = require('node:path');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..'), BASE = process.env.ABILITY_BASE_URL || 'http://127.0.0.1:8961/';
const SECOND_HALF = ['myla', 'nahir', 'nano_gm', 'nigromante', 'oriel', 'orsa', 'profeta', 'renko', 'saelis', 'segador', 'sira', 'solciju', 'soporte', 'tanque', 'tibor', 'velmira', 'vesper', 'veyra', 'vhal', 'ynara', 'zahra'];
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  const page = await browser.newPage({viewport: {width: 844, height: 390}}), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 120000});
  await page.waitForFunction(() => typeof startRun === 'function' && typeof KVB !== 'undefined', null, {timeout: 120000});
  await page.waitForTimeout(2500);
  const keys = process.env.ONLY ? process.env.ONLY.split(',') : SECOND_HALF, rows = [];
  for (const k of keys) {
    const r = await page.evaluate(([k, REPS, FRAMES]) => {
      const med = a => { a = a.slice().sort((x, y) => x - y); return a[a.length >> 1]; };
      function run(off) {
        KVB.off = off; let seed = 99; const o = Math.random; Math.random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
        netMatch = null; save.stash = []; for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; s.xp = 0; s.equipment = {}; s.inventory = []; s.talents = {nodes: {}, mastery: null, masteryNodes: {}}; s.skillMastery = [0, 1, 2].map(() => ({...mkMastery(), alloc: 0})); s.ultMastery = {...mkMastery(), alloc: 0}; }
        selectedClass = k; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'mago']; startRun(3); enemies = []; spawnTimer = 1e9; arenaHazardTimer = 1e9; player.fx = 1; player.fy = 0; state = 'playing';
        runLevel = Math.max(runLevel || 1, typeof ULT_MIN_ARENA_LEVEL !== 'undefined' ? ULT_MIN_ARENA_LEVEL : 1);
        for (let i = 0; i < 12; i++) { const e = spawnEnemy('esqueleto'); Object.assign(e, {x: player.x + 70 + (i % 4) * 22, y: player.y + (Math.floor(i / 4) - 1) * 30, hp: 1e8, maxHp: 1e8, speed: 0, baseSpeed: 0, dmg: 0}); }
        for (const a of allies) { a.x = player.x - 40; a.y = player.y + 12; }
        player.energy = 1e4; player.ultCharge = player.ultMax; player.aim = {x: player.x + 115, y: player.y, dx: 1, dy: 0};
        const t = [], pool = []; let last = [0, 0, 0, 0];
        for (let f = 0; f < FRAMES; f++) {
          if (f % 12 === 0) { player.energy = 1e4; for (let i = 0; i < 3; i++) if (player.cds[i] <= 0) { try { useSkill(i, {x: player.x + 110, y: player.y, dx: 1, dy: 0}); } catch (e) {} break; } if (player.ultCd <= 0 && player.ultCharge >= player.ultMax && f % 36 === 0) try { useUltimate(); } catch (e) {} player.ultCharge = player.ultMax; try { triggerBasic(player); } catch (e) {} }
          const a = performance.now(); update(16); render(); t.push(performance.now() - a); pool.push(KVB.pool.length);
        }
        Math.random = o; KVB.off = false; state = 'menu';
        return {ms: t.reduce((x, y) => x + y, 0) / t.length, p95: t.slice().sort((x, y) => x - y)[Math.floor(t.length * .95)], pool: Math.max(...pool)};
      }
      // costo propio medido por dentro: lo que tardan solo las funciones de vfx-b (actualizar, dibujar capas, pieles, overlays, kvbFx) en cada frame
      const own = {t: 0}; for(const n of ['kvbUpdate', 'kvbDrawLayer', 'kvbObjUpdate', 'kvbObjDraw', 'kvbOverlays', 'kvbOverlayUpdate', 'kvbFx']){ const f = window[n]; if(typeof f !== 'function') continue; window[n] = function(){ const a = performance.now(); try{ return f.apply(this, arguments); } finally{ own.t += performance.now() - a; } }; }
      const off = [], on = [], p95off = [], p95on = [], ownMs = []; let poolMax = 0;
      run(true); run(false); // calentamiento (JIT, sprites cacheados): no cuenta
      for (let rep = 0; rep < REPS; rep++) { let a, b; own.t = 0; if(rep & 1){ b = run(false); ownMs.push(own.t / FRAMES); a = run(true); } else { a = run(true); own.t = 0; b = run(false); ownMs.push(own.t / FRAMES); } off.push(a.ms); on.push(b.ms); p95off.push(a.p95); p95on.push(b.p95); poolMax = Math.max(poolMax, b.pool); }
      return {key: k, ownPct: +(100 * med(ownMs) / med(on)).toFixed(2), msOff: +med(off).toFixed(3), msOn: +med(on).toFixed(3), p95Off: +med(p95off).toFixed(3), p95On: +med(p95on).toFixed(3), ownMs: +med(ownMs).toFixed(3), poolMax};
    }, [k, +process.env.REPS || 5, +process.env.FRAMES || 375]).catch(e => ({key: k, error: e.message}));
    rows.push(r); console.log(r.error ? k + ' ERROR ' + r.error : `${k.padEnd(11)} sin ${String(r.msOff).padStart(6)} ms · con ${String(r.msOn).padStart(6)} ms · Δ ${(r.msOn - r.msOff >= 0 ? '+' : '') + (r.msOn - r.msOff).toFixed(3)} ms · propio ${r.ownMs} ms (${r.ownPct} % del frame) · p95 ${r.p95Off}→${r.p95On} ms · pool máx ${r.poolMax}`);
  }
  const ok = rows.filter(r => !r.error), mean = f => ok.reduce((a, r) => a + r[f], 0) / Math.max(1, ok.length);
  console.log(`\nmedia: sin ${mean('msOff').toFixed(3)} ms · con ${mean('msOn').toFixed(3)} ms · Δ ${(mean('msOn') - mean('msOff')).toFixed(3)} ms por frame · costo propio medio ${mean('ownMs').toFixed(3)} ms por frame · page errors: ${errors.length}`);
  if (process.env.OUT) fs.writeFileSync(path.resolve(ROOT, process.env.OUT), JSON.stringify({rows, meanOff: mean('msOff'), meanOn: mean('msOn'), errors}, null, 1) + '\n');
  await browser.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
