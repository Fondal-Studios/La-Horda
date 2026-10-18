'use strict';
/* Auditoría visual de habilidades (básico, 3 habilidades, definitiva) en el motor real, a 844x390.
   Para cada campeón lanza cada habilidad contra un grupo de muñecos y captura 4 instantes (60, 200, 450 y 900 ms después
   del lanzamiento) recortados alrededor del campeón, en una hoja PNG por campeón. También registra qué usa cada una
   (sprites de efecto por clave, partículas, ondas, telegrafías, firma) y mide el costo medio de update()+render() por frame.
   Uso:  ONLY=myla,nahir TAG=antes node tools/vfx/audit-abilities.js
         (TAG = antes|despues, salida: docs/vfx/shots/<TAG>/<campeón>.png y docs/vfx/shots/<TAG>/stats.json)
   Servidor: python3 -m http.server <PUERTO> en la raíz (ABILITY_BASE_URL por defecto http://127.0.0.1:8961/). */
const fs = require('node:fs'), path = require('node:path');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..'), BASE = process.env.ABILITY_BASE_URL || 'http://127.0.0.1:8961/';
const TAG = process.env.TAG || 'antes', OUT = path.join(ROOT, 'docs/vfx/shots', TAG);
const SECOND_HALF = ['myla', 'nahir', 'nano_gm', 'nigromante', 'oriel', 'orsa', 'profeta', 'renko', 'saelis', 'segador', 'sira', 'solciju', 'soporte', 'tanque', 'tibor', 'velmira', 'vesper', 'veyra', 'vhal', 'ynara', 'zahra'];
(async () => {
  fs.mkdirSync(OUT, {recursive: true});
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  const page = await browser.newPage({viewport: {width: 844, height: 390}}), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 120000});
  await page.waitForFunction(() => typeof startRun === 'function' && typeof aimProfileOf === 'function' && typeof CHAMPION_BALANCE_REFERENCE !== 'undefined', null, {timeout: 120000});
  await page.waitForTimeout(2500);
  const keys = (process.env.ONLY ? process.env.ONLY.split(',') : SECOND_HALF);
  const all = {};
  for (const k of keys) {
    const r = await page.evaluate(async k => {
      const CELL_W = 300, CELL_H = 210, TIMES = [60, 200, 450, 900];
      const out = {key: k, slots: []};
      const sheet = document.createElement('canvas'); sheet.width = CELL_W * TIMES.length + 120; sheet.height = CELL_H * 5;
      const sx = sheet.getContext('2d'); sx.fillStyle = '#111'; sx.fillRect(0, 0, sheet.width, sheet.height); sx.imageSmoothingEnabled = false;
      const counters = {}, orig = {};
      const names = ['vfxSprite', 'vfxBurst', 'vfxSpray', 'vfxShock', 'vfxTelegraph', 'vfxChampionSignature', 'vfxConverge', 'kitFx', 'kitFxLine', 'vfxSkillCone', 'vfxFrostCrown'];
      for (const n of names) if (typeof window[n] === 'function') { orig[n] = window[n]; window[n] = function (...a) { const c = counters; c[n] = (c[n] || 0) + 1; if (n === 'vfxSprite') { c.sprites = c.sprites || {}; c.sprites[a[0]] = (c.sprites[a[0]] || 0) + 1; } return orig[n].apply(this, a); }; }
      function start() {
        netMatch = null; save.stash = []; save.relics = {hp: 0, dmg: 0, def: 0, vel: 0};
        for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; s.xp = 0; s.equipment = {}; s.inventory = []; s.talents = {nodes: {}, mastery: null, masteryNodes: {}}; s.skillMastery = [0, 1, 2].map(() => ({...mkMastery(), alloc: 0})); s.ultMastery = {...mkMastery(), alloc: 0}; }
        selectedClass = k; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'mago'].filter(x => x !== k).slice(0, 3); startRun(3);
        enemies = []; spawnTimer = 1e9; arenaHazardTimer = 1e9; player.fx = 1; player.fy = 0; state = 'playing';
        runLevel = Math.max(runLevel || 1, typeof ULT_MIN_ARENA_LEVEL !== 'undefined' ? ULT_MIN_ARENA_LEVEL : 1);
        const spots = [[100, 0], [118, -16], [118, 16], [134, 0], [92, -20], [92, 20], [140, -24], [140, 24], [60, 0], [200, 0]];
        for (const [dx, dy] of spots) { const e = spawnEnemy('esqueleto'); Object.assign(e, {x: player.x + dx, y: player.y + dy, hp: 1e7, maxHp: 1e7, speed: 0, baseSpeed: 0, dmg: 0}); }
        for (let i = 0; i < allies.length; i++) { allies[i].x = player.x - 35 - i * 24; allies[i].y = player.y + 15; allies[i].hp = allies[i].maxHp * 0.5; allies[i].stunTimer = 1e9; }
        player.hp = player.maxHp * 0.6; player.energy = 1e4; player.ultCharge = player.ultMax; player.basicCd = 0;
        if (k === 'ilkan') player.ilkanFury = 1e4;
        vfxResetRun && vfxResetRun();
      }
      const crop = (col, row) => {
        const p = worldToScreen(player.x + 60, player.y), sc = canvas.width / VW;
        sx.drawImage(canvas, (p.x - CELL_W / 2) * sc, (p.y - CELL_H / 2) * sc, CELL_W * sc, CELL_H * sc, 120 + col * CELL_W, row * CELL_H, CELL_W, CELL_H);
      };
      const seed = n => { let x = n >>> 0; Math.random = () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; };
      const oRand = Math.random;
      for (let row = 0; row < 5; row++) {
        const slot = row === 0 ? 'basic' : row === 4 ? 'ult' : row - 1;
        seed(77); start(); for (const n in counters) delete counters[n];
        const sk = slot === 'basic' ? null : slot === 'ult' ? player.cls.ultimate : player.cls.skills[slot];
        player.aim = {x: player.x + 115, y: player.y, dx: 1, dy: 0};
        update(16); render();
        let err = null;
        try { if (slot === 'basic') triggerBasic(player); else castAbility(player, sk, slot === 'ult', slot === 'ult' ? undefined : slot); } catch (e) { err = e.message; }
        let t = 0, ti = 0, cost = 0, frames = 0;
        while (t < 960) {
          const t0 = performance.now(); try { update(16); render(); } catch (e) { err = err || e.message; } cost += performance.now() - t0; frames++; t += 16;
          if (ti < TIMES.length && t >= TIMES[ti]) { crop(ti, row); ti++; }
        }
        sx.fillStyle = '#fff'; sx.font = '14px monospace'; sx.fillText(slot === 'basic' ? 'Basico' : slot === 'ult' ? 'Ulti' : 'Hab ' + (slot + 1), 6, row * CELL_H + 20);
        sx.font = '11px monospace'; const nm = slot === 'basic' ? 'ataque' : sk.name; sx.fillText(nm.slice(0, 16), 6, row * CELL_H + 36);
        out.slots.push({slot, name: slot === 'basic' ? 'Ataque básico' : sk.name, kind: sk && (sk.kind + (sk.action ? ':' + sk.action : '')), err, msPerFrame: +(cost / frames).toFixed(3), counters: JSON.parse(JSON.stringify(counters))});
      }
      Math.random = oRand; for (const n in orig) window[n] = orig[n]; state = 'menu';
      out.sheet = sheet.toDataURL('image/png');
      return out;
    }, k).catch(e => ({key: k, error: e.message}));
    if (r.sheet) { fs.writeFileSync(path.join(OUT, k + '.png'), Buffer.from(r.sheet.split(',')[1], 'base64')); delete r.sheet; }
    all[k] = r; console.log(k, r.error || r.slots.map(s => `${s.name}[${Object.keys(s.counters.sprites || {}).join('+') || '-'};b${s.counters.vfxBurst || 0}/s${s.counters.vfxShock || 0}/t${s.counters.vfxTelegraph || 0};${s.msPerFrame}ms${s.err ? ' ERR ' + s.err : ''}]`).join(' '));
  }
  fs.writeFileSync(path.join(OUT, 'stats.json'), JSON.stringify({errors, champions: all}, null, 1));
  console.log('page errors:', errors.length, errors.slice(0, 3));
  await browser.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
