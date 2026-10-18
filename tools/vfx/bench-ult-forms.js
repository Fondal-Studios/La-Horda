'use strict';
/* Costo por cuadro de las formas de definitiva (js/champions/ult-forms): para cada campeón con forma, lanza su definitiva en bucle (cada 40 cuadros)
   contra 12 muñecos durante FRAMES cuadros de update()+render() reales, alternando window.UF_OFF = true (efectos de antes) y false (formas nuevas)
   REPS veces intercaladas tras un calentamiento, y compara la mediana de ms por cuadro. También mide el horneado (ms por tira) y el tamaño del pool.
   Es CPU de Chromium sin GPU: sirve para COMPARAR con/sin formas, no como valor absoluto; con la máquina cargada el ruido es alto (se informa p95).
   Con JUICE.reduceFx = true se repite la medición para comprobar el pool adaptativo.
   Uso: BASE_URL=http://127.0.0.1:9301/ [ONLY=a,b] [REPS=4] [FRAMES=300] [OUT=ruta.json] node tools/vfx/bench-ult-forms.js */
const fs = require('node:fs'), path = require('node:path');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..'), BASE = process.env.BASE_URL || 'http://127.0.0.1:9301/';
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  const page = await browser.newPage({viewport: {width: 844, height: 390}}), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 120000});
  await page.waitForFunction(() => typeof startRun === 'function' && typeof UF !== 'undefined' && assetsAllReady(), null, {timeout: 120000});
  await page.waitForTimeout(2000);
  let keys = await page.evaluate(() => Object.keys(UF.champs).sort());
  if (process.env.ONLY) keys = keys.filter(k => process.env.ONLY.split(',').includes(k));
  const rows = [];
  for (const k of keys) {
    const r = await page.evaluate(([k, REPS, FRAMES]) => {
      const med = a => { a = a.slice().sort((x, y) => x - y); return a[a.length >> 1]; };
      function run(off, reduce) {
        window.UF_OFF = off; if (typeof JUICE !== 'undefined') JUICE.reduceFx = !!reduce;
        let seed = 99; const o = Math.random; Math.random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
        netMatch = null; save.stash = []; for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; s.xp = 0; s.equipment = {}; s.inventory = []; s.talents = {nodes: {}, mastery: null, masteryNodes: {}}; }
        selectedClass = k; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'mago'].filter(x => x !== k); startRun(3); enemies = []; spawnTimer = 1e9; arenaHazardTimer = 1e9; player.fx = 1; player.fy = 0; state = 'playing';
        runLevel = Math.max(runLevel || 1, typeof ULT_MIN_ARENA_LEVEL !== 'undefined' ? ULT_MIN_ARENA_LEVEL : 1);
        for (let i = 0; i < 12; i++) { const e = spawnEnemy('esqueleto'); Object.assign(e, {x: player.x + 70 + (i % 4) * 22, y: player.y + (Math.floor(i / 4) - 1) * 30, hp: 1e8, maxHp: 1e8, speed: 0, baseSpeed: 0, dmg: 0}); }
        for (const a of allies) { a.x = player.x - 40; a.y = player.y + 12; }
        player.energy = 1e4; player.aim = {x: player.x + 115, y: player.y, dx: 1, dy: 0};
        const t = [], pool = []; let casts = 0;
        for (let f = 0; f < FRAMES; f++) {
          if (f % 40 === 0) { player.ultCharge = player.ultMax; player.ultCd = 0; player.energy = 1e4; try { if (typeof useUltimate === 'function') useUltimate(player); else castAbility(player, player.cls.ultimate, true); casts++; } catch (e) {} }
          const a = performance.now(); update(16); render(); t.push(performance.now() - a); pool.push(KVB.pool.length);
        }
        Math.random = o; window.UF_OFF = false; if (typeof JUICE !== 'undefined') JUICE.reduceFx = false; state = 'menu';
        return {ms: t.reduce((x, y) => x + y, 0) / t.length, p95: t.slice().sort((x, y) => x - y)[Math.floor(t.length * .95)], pool: Math.max(...pool), casts};
      }
      const F = UF.forms[UF.champs[k].form]; let bake = 0, nb = 0;
      for (const rp of [32, 48, 64]) for (const l of ['t', 'g']) { if (l === 'g' && !F.gpaint) continue; const t0 = performance.now(); UF.cache.delete(k + ':' + l + '@' + rp); ufBake(k, l, rp); bake += performance.now() - t0; nb++; }
      run(true); run(false);   // calentamiento
      const off = [], on = [], p95 = [], red = []; let poolMax = 0, casts = 0;
      for (let rep = 0; rep < REPS; rep++) { let a, b; if (rep & 1) { b = run(false); a = run(true); } else { a = run(true); b = run(false); } off.push(a.ms); on.push(b.ms); p95.push(b.p95); poolMax = Math.max(poolMax, b.pool); casts = b.casts; }
      const rd = run(false, true); red.push(rd.pool);
      return {key: k, form: UF.champs[k].form, msOff: +med(off).toFixed(3), msOn: +med(on).toFixed(3), p95On: +med(p95).toFixed(3), poolMax, poolReduced: red[0], casts, bakeMsPerStrip: +(bake / Math.max(1, nb)).toFixed(1)};
    }, [k, +(process.env.REPS || 4), +(process.env.FRAMES || 300)]).catch(e => ({key: k, error: e.message}));
    rows.push(r); console.log(r.error ? k + ' ERROR ' + r.error : `${k.padEnd(11)} ${r.form.padEnd(9)} antes ${String(r.msOff).padStart(6)} ms · formas ${String(r.msOn).padStart(6)} ms · Δ ${(r.msOn - r.msOff >= 0 ? '+' : '') + (r.msOn - r.msOff).toFixed(3)} ms · p95 ${r.p95On} · pool máx ${r.poolMax} (reducido ${r.poolReduced}) · horneado ${r.bakeMsPerStrip} ms/tira · lanzamientos ${r.casts}`);
  }
  const ok = rows.filter(r => !r.error), mean = f => ok.reduce((a, r) => a + r[f], 0) / Math.max(1, ok.length);
  console.log(`\nmedia: antes ${mean('msOff').toFixed(3)} ms · formas ${mean('msOn').toFixed(3)} ms · Δ ${(mean('msOn') - mean('msOff')).toFixed(3)} ms por cuadro · errores de pagina: ${errors.length}`, errors.slice(0, 3));
  if (process.env.OUT) fs.writeFileSync(path.resolve(ROOT, process.env.OUT), JSON.stringify({rows, meanOff: mean('msOff'), meanOn: mean('msOn'), errors}, null, 1) + '\n');
  await browser.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
