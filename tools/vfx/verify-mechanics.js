'use strict';
/* Verifica que los efectos de js/champions/vfx-b/ NO cambian la mecánica: cada habilidad (básico, 3 habilidades y definitiva)
   se simula dos veces en el motor real, con KVB.off = true (sin efectos propios) y con KVB.off = false, con el mismo azar
   constante y los mismos enemigos, y se comparan huellas del estado simulado (vida, posición y estados de cada enemigo;
   vida, escudo, energía, posición y recargas de cada héroe; cantidad y tipo de objetos, proyectiles, trampas y zonas).
   También mide el costo de update()+render() por frame (mediana de varias repeticiones) y cuenta errores de página.
   Uso: ONLY=a,b ABILITY_BASE_URL=http://127.0.0.1:8961/ node tools/vfx/verify-mechanics.js   (por defecto: la 2.ª mitad del roster)
   Sale con código 1 si alguna huella difiere. */
const fs = require('node:fs'), path = require('node:path');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..'), BASE = process.env.ABILITY_BASE_URL || 'http://127.0.0.1:8961/';
const SECOND_HALF = ['myla', 'nahir', 'nano_gm', 'nigromante', 'oriel', 'orsa', 'profeta', 'renko', 'saelis', 'segador', 'sira', 'solciju', 'soporte', 'tanque', 'tibor', 'velmira', 'vesper', 'veyra', 'vhal', 'ynara', 'zahra'];
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  const page = await browser.newPage({viewport: {width: 844, height: 390}}), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 120000});
  await page.waitForFunction(() => typeof startRun === 'function' && typeof KVB !== 'undefined' && typeof CHAMPION_BALANCE_REFERENCE !== 'undefined', null, {timeout: 120000});
  await page.waitForTimeout(2500);
  const keys = process.env.ONLY ? process.env.ONLY.split(',') : SECOND_HALF, report = [];
  let bad = 0;
  for (const k of keys) {
    const r = await page.evaluate(([k, canary]) => {
      const out = {key: k, slots: [], kvbErr: null};
      // CANARIO (CANARY=1): un efecto que SÍ toca la mecánica (resta 1 de vida al primer enemigo) tiene que salir como diferencia; si no, la prueba es decorativa
      if(canary){ const o = window.kvbFx; window.kvbFx = function(){ if(!KVB.off && enemies[0]) enemies[0].hp -= 1; return o.apply(this, arguments); }; }
      const oRand = Math.random;
      function start() {
        netMatch = null; save.stash = []; save.relics = {hp: 0, dmg: 0, def: 0, vel: 0};
        for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; s.xp = 0; s.equipment = {}; s.inventory = []; s.talents = {nodes: {}, mastery: null, masteryNodes: {}}; s.skillMastery = [0, 1, 2].map(() => ({...mkMastery(), alloc: 0})); s.ultMastery = {...mkMastery(), alloc: 0}; }
        selectedClass = k; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'mago'].filter(x => x !== k).slice(0, 3); startRun(3);
        enemies = []; spawnTimer = 1e9; arenaHazardTimer = 1e9; player.fx = 1; player.fy = 0; state = 'playing';
        runLevel = Math.max(runLevel || 1, typeof ULT_MIN_ARENA_LEVEL !== 'undefined' ? ULT_MIN_ARENA_LEVEL : 1);
        const spots = [[100, 0], [118, -16], [118, 16], [134, 0], [92, -20], [92, 20], [140, -24], [140, 24], [60, 0], [200, 0], [-80, 30], [10, -90]];
        for (const [dx, dy] of spots) { const e = spawnEnemy('esqueleto'); Object.assign(e, {x: player.x + dx, y: player.y + dy, hp: 4000, maxHp: 4000, speed: 20, baseSpeed: 20, dmg: 3}); }
        for (let i = 0; i < allies.length; i++) { allies[i].x = player.x - 35 - i * 24; allies[i].y = player.y + 15; allies[i].hp = allies[i].maxHp * 0.5; }
        player.hp = player.maxHp * 0.6; player.energy = 1e4; player.ultCharge = player.ultMax; player.basicCd = 0;
        if (k === 'ilkan') player.ilkanFury = 1e4;
        vfxResetRun();
      }
      const r2 = n => Math.round(n * 100) / 100;
      function fp() {
        const f = {e: enemies.map(e => [r2(e.x), r2(e.y), r2(e.hp), r2(e.stunTimer || 0), r2(e.slowTimer || 0), r2(e.slowAmt || 0), r2(e.bleedTimer || 0), r2(e.poisonTimer || 0), r2(e.burnTimer || 0), e.alive ? 1 : 0]),
          h: heroes.map(h => [r2(h.x), r2(h.y), r2(h.hp), r2(h.shield || 0), r2(h.energy || 0), r2(h.maxHp), r2((h.cds || []).reduce((a, b) => a + b, 0)), r2(h.ultCd || 0), r2(h.buffTimer || 0), r2(h.spinTimer || 0), r2(h._kitDmgUntil || 0)]),
          n: [projectiles.length, (typeof traps !== 'undefined' ? traps.length : 0), (typeof fireWalls !== 'undefined' ? fireWalls.length : 0), allies.length, typeof portadorObjects !== 'undefined' ? portadorObjects.filter(o => o.life > 0).map(o => o.kind + ':' + Math.round(o.life / 50) + ':' + Math.round(o.r || 0) + ':' + Math.round(o.x) + ',' + Math.round(o.y)).join('|') : '']};
        return JSON.stringify(f);
      }
      function run(slot, off) {
        KVB.off = off; Math.random = () => 0.37; start();
        const sk = slot === 'basic' ? null : slot === 'ult' ? player.cls.ultimate : player.cls.skills[slot];
        player.aim = {x: player.x + 115, y: player.y, dx: 1, dy: 0};
        update(16); if (slot === 'basic') triggerBasic(player); else castAbility(player, sk, slot === 'ult', slot === 'ult' ? undefined : slot);
        const prints = [], t0 = performance.now(); let frames = 0, cost = 0;
        for (let f = 0; f < 240; f++) { const a = performance.now(); update(16); if (f % 2 === 0) render(); cost += performance.now() - a; frames++; if (f === 10 || f === 60 || f === 140 || f === 239) prints.push(fp()); }
        KVB.off = false; Math.random = oRand;
        return {prints, ms: cost / frames};
      }
      try {
        for (const slot of ['basic', 0, 1, 2, 'ult']) {
          const a = run(slot, true), b = run(slot, false), c = run(slot, true), d = run(slot, false);
          const same = a.prints.every((p, i) => p === b.prints[i]) && c.prints.every((p, i) => p === d.prints[i]);
          let diff = null; if (!same) { const i = a.prints.findIndex((p, j) => p !== b.prints[j]); diff = {at: i, off: a.prints[i] && a.prints[i].slice(0, 600), on: b.prints[i] && b.prints[i].slice(0, 600)}; }
          const med = x => { x = x.slice().sort((p, q) => p - q); return x[x.length >> 1]; };
          out.slots.push({slot, same, deterministic: a.prints.every((p, i) => p === c.prints[i]), msOff: +med([a.ms, c.ms]).toFixed(3), msOn: +med([b.ms, d.ms]).toFixed(3), diff});
        }
      } catch (e) { out.error = e.message; }
      out.kvbErr = KVB.err || null; Math.random = oRand; KVB.off = false; state = 'menu';
      return out;
    }, [k, !!process.env.CANARY]).catch(e => ({key: k, error: e.message, slots: []}));
    const ok = !r.error && r.slots.every(s => s.same);
    if (!ok) bad++;
    console.log((ok ? 'OK  ' : 'DIFF') + ' ' + k.padEnd(11) + (r.error ? ' ERROR ' + r.error : r.slots.map(s => `${s.slot}:${s.same ? '=' : '≠'}${s.deterministic ? '' : '(nodet)'} ${s.msOff}→${s.msOn}ms`).join('  ')) + (r.kvbErr ? '  KVB.err=' + r.kvbErr : ''));
    for (const s of r.slots) if (!s.same) console.log('   · ' + k + ' ' + s.slot + ' ' + JSON.stringify(s.diff));
    report.push(r);
  }
  console.log(`\n${keys.length} campeones · con diferencias de mecánica: ${bad} · page errors: ${errors.length}`, errors.slice(0, 3));
  if (process.env.OUT) fs.writeFileSync(path.resolve(ROOT, process.env.OUT), JSON.stringify({errors, report}, null, 1) + '\n');
  await browser.close();
  if (bad || errors.length) process.exitCode = 1;
})().catch(e => { console.error(e); process.exitCode = 1; });
