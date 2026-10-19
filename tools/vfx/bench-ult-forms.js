'use strict';
/* Costo por cuadro de las formas de definitiva (js/champions/ult-forms): para cada campeón con forma lanza su definitiva en bucle (cada 40 cuadros) contra 12 muñecos durante
   FRAMES cuadros de update()+render() reales con RELOJ VIRTUAL (16 ms por cuadro: las animaciones avanzan igual con cualquier carga), alternando window.UF_OFF = true (efectos de antes)
   y false (formas nuevas) REPS veces intercaladas tras un calentamiento. Mide tres cosas:
     - ms por cuadro de update()+render() (mediana): Chromium sin GPU y con la máquina compartida es MUY ruidoso (±5 ms entre corridas iguales); se informa el p95 también;
     - costo PROPIO, medido por dentro: ms por cuadro que tardan solo las funciones de los motores de efecto (kvbUpdate, kvbDrawLayer, sfaFrame, ufZoneEdge...) y cantidad
       de drawImage por cuadro: es lo que más se parece a "lo que sube" por las formas y casi no depende del ruido de fondo;
     - horneado por tira (ms) y tamaño del pool con y sin "Reducir efectos" (JUICE.reduceFx).
   Uso: BASE_URL=http://127.0.0.1:9301/ [ONLY=a,b] [REPS=3] [FRAMES=200] [OUT=ruta.json] node tools/vfx/bench-ult-forms.js */
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
  let keys = (await page.evaluate(() => Object.keys(UF.champs).sort())).filter(k => !k.includes('.'));
  if (process.env.ONLY) keys = keys.filter(k => process.env.ONLY.split(',').includes(k));
  const rows = [];
  for (const k of keys) {
    const r = await page.evaluate(([k, REPS, FRAMES]) => {
      const med = a => { a = a.slice().sort((x, y) => x - y); return a[a.length >> 1]; };
      const realNow = performance.now.bind(performance), P = CanvasRenderingContext2D.prototype, di = P.drawImage; let imgs = 0;
      P.drawImage = function () { imgs++; return di.apply(this, arguments); };
      const own = {t: 0}; const wrapped = [];
      for (const n of ['kvbUpdate', 'kvbDrawLayer', 'kvbObjUpdate', 'kvbObjDraw', 'sfaFrame', 'sfaObjectsFrame', 'ufZoneEdge', 'vfxUltForm']) { const f = window[n]; if (typeof f !== 'function') continue; wrapped.push([n, f]); window[n] = function () { const a = realNow(); try { return f.apply(this, arguments); } finally { own.t += realNow() - a; } }; }
      function run(off, reduce) {
        window.UF_OFF = off; if (typeof JUICE !== 'undefined') JUICE.reduceFx = !!reduce;
        let seed = 99, vt = 1000; const o = Math.random, pn = performance.now; performance.now = () => vt; Math.random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
        netMatch = null; save.stash = []; for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; s.xp = 0; s.equipment = {}; s.inventory = []; s.talents = {nodes: {}, mastery: null, masteryNodes: {}}; }
        selectedClass = k; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'mago'].filter(x => x !== k); startRun(3); enemies = []; spawnTimer = 1e9; arenaHazardTimer = 1e9; player.fx = 1; player.fy = 0; state = 'playing';
        runLevel = Math.max(runLevel || 1, typeof ULT_MIN_ARENA_LEVEL !== 'undefined' ? ULT_MIN_ARENA_LEVEL : 1);
        for (let i = 0; i < 12; i++) { const e = spawnEnemy('esqueleto'); Object.assign(e, {x: player.x + 70 + (i % 4) * 22, y: player.y + (Math.floor(i / 4) - 1) * 30, hp: 1e8, maxHp: 1e8, speed: 0, baseSpeed: 0, dmg: 0}); }
        for (const a of allies) { a.x = player.x - 40; a.y = player.y + 12; }
        player.energy = 1e4; player.aim = {x: player.x + 115, y: player.y, dx: 1, dy: 0};
        const t = [], pool = []; own.t = 0; imgs = 0;
        for (let f = 0; f < FRAMES; f++) {
          if (f % 40 === 0) { player.ultCharge = player.ultMax; player.ultCd = 0; player.energy = 1e4; try { castAbility(player, player.cls.ultimate, true); } catch (e) {} }
          vt += 16; const a = realNow(); update(16); render(); t.push(realNow() - a); pool.push(KVB.pool.length);
        }
        const res = {ms: t.reduce((x, y) => x + y, 0) / t.length, p95: t.slice().sort((x, y) => x - y)[Math.floor(t.length * .95)], pool: Math.max(...pool), own: own.t / FRAMES, imgs: imgs / FRAMES};
        Math.random = o; performance.now = pn; window.UF_OFF = false; if (typeof JUICE !== 'undefined') JUICE.reduceFx = false; state = 'menu'; return res;
      }
      const F = UF.forms[UF.champs[k].form]; let bake = 0, nb = 0;
      for (const rp of [32, 48, 64]) for (const l of ['t', 'g']) { if (l === 'g' && !F.gpaint) continue; UF.cache.delete(k + ':' + l + '@' + rp); const t0 = realNow(); ufBake(k, l, rp); bake += realNow() - t0; nb++; }
      run(true); run(false);   // calentamiento
      const R = {off: [], on: [], p95: [], ownOff: [], ownOn: [], imgOff: [], imgOn: []}; let poolMax = 0, poolOff = 0;
      for (let rep = 0; rep < REPS; rep++) { const order = rep & 1 ? [false, true] : [true, false], res = {}; for (const off of order) res[off] = run(off);
        R.off.push(res[true].ms); R.on.push(res[false].ms); R.p95.push(res[false].p95); R.ownOff.push(res[true].own); R.ownOn.push(res[false].own); R.imgOff.push(res[true].imgs); R.imgOn.push(res[false].imgs); poolMax = Math.max(poolMax, res[false].pool); poolOff = Math.max(poolOff, res[true].pool); }
      const rd = run(false, true);
      P.drawImage = di; for (const [n, f] of wrapped) window[n] = f;
      return {key: k, form: UF.champs[k].form, msOff: +med(R.off).toFixed(2), msOn: +med(R.on).toFixed(2), p95On: +med(R.p95).toFixed(1), ownOff: +med(R.ownOff).toFixed(3), ownOn: +med(R.ownOn).toFixed(3), imgOff: +med(R.imgOff).toFixed(1), imgOn: +med(R.imgOn).toFixed(1),
        poolOff, poolOn: poolMax, poolReduced: rd.pool, bakeMsPerStrip: +(bake / Math.max(1, nb)).toFixed(1)};
    }, [k, +(process.env.REPS || 3), +(process.env.FRAMES || 200)]).catch(e => ({key: k, error: e.message}));
    rows.push(r); console.log(r.error ? k + ' ERROR ' + r.error : `${k.padEnd(11)} ${r.form.padEnd(9)} cuadro ${String(r.msOff).padStart(6)} → ${String(r.msOn).padStart(6)} ms (p95 ${r.p95On}) · propio ${r.ownOff} → ${r.ownOn} ms · drawImage ${r.imgOff} → ${r.imgOn} · pool ${r.poolOff} → ${r.poolOn} (reducido ${r.poolReduced}) · horneado ${r.bakeMsPerStrip} ms/tira`);
  }
  const ok = rows.filter(r => !r.error), mean = f => ok.reduce((a, r) => a + r[f], 0) / Math.max(1, ok.length);
  console.log(`\nmedia de ${ok.length}: cuadro ${mean('msOff').toFixed(2)} → ${mean('msOn').toFixed(2)} ms · propio ${mean('ownOff').toFixed(3)} → ${mean('ownOn').toFixed(3)} ms · drawImage ${mean('imgOff').toFixed(1)} → ${mean('imgOn').toFixed(1)} · horneado ${mean('bakeMsPerStrip').toFixed(1)} ms/tira · errores de pagina: ${errors.length}`, errors.slice(0, 3));
  if (process.env.OUT) fs.writeFileSync(path.resolve(ROOT, process.env.OUT), JSON.stringify({load: require('node:os').loadavg(), rows, errors}, null, 1) + '\n');
  await browser.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
