'use strict';
/* AUDITORIA DE EFECTOS DE HABILIDAD (docs/vfx/HABILIDADES_VFX_AUDITORIA.md).
   Lanza cada habilidad (basico, 3 habilidades, definitiva) en el motor real, en tiempo real (loop rAF), contra 10 munecos
   agrupados y mide QUE se dibuja: sprites de efecto (vfxSprite), imagenes dibujadas (drawImage), trazos/circulos genericos
   (arc/ellipse/stroke), ondas, particulas y telegraphs. Guarda capturas 844x390 recortadas al centro (donde esta el heroe).
   Uso:  ONLY=a,b  PHASE=antes|despues  node tools/vfx/audit-ability-vfx.js
         HALF=first|second|all (por defecto all; la primera mitad = claves ordenadas, indices 0..21)
         FRAMES=1 para guardar las capturas (si no, solo metricas). PORT=8941 / BASE_URL para servidor propio.
   Salida: docs/vfx/audit/<fase>/<clave>_<slot>_<n>.png y docs/vfx/audit/<fase>.json                                  */
const fs = require('node:fs'), path = require('node:path'), {spawn} = require('node:child_process');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..'), PHASE = process.env.PHASE || 'despues', PORT = +(process.env.PORT || 8941);
const OUT = path.join(ROOT, 'docs/vfx/audit', PHASE);
const server = process.env.BASE_URL ? null : spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {cwd: ROOT, stdio: 'ignore'});
const BASE = process.env.BASE_URL || `http://127.0.0.1:${PORT}/`;
process.on('exit', () => server && server.kill());
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await sleep(server ? 700 : 0); fs.mkdirSync(OUT, {recursive: true});
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  try {
    const page = await browser.newPage({viewport: {width: 844, height: 390}}), errors = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('console: ' + m.text().slice(0, 200)); });
    await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 120000});
    await page.waitForFunction(() => typeof startRun === 'function' && typeof aimProfileOf === 'function' && typeof assetsAllReady === 'function' && assetsAllReady(), null, {timeout: 120000});
    await page.waitForTimeout(1500);
    let roster = (await page.evaluate(() => Object.keys(CLASSES))).sort();
    const half = Math.ceil(roster.length / 2);
    if (process.env.HALF === 'first') roster = roster.slice(0, half); else if (process.env.HALF === 'second') roster = roster.slice(half);
    if (process.env.ONLY) roster = roster.filter(k => process.env.ONLY.split(',').includes(k));
    const all = {};
    for (const k of roster) {
      all[k] = [];
      for (const slot of ['basic', 0, 1, 2, 'ult']) {
        // escena
        const info = await page.evaluate(([k, slot]) => {
          netMatch = null; save.stash = []; save.relics = {hp: 0, dmg: 0, def: 0, vel: 0};
          for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; s.xp = 0; s.equipment = {}; s.inventory = []; s.talents = {nodes: {}, mastery: null, masteryNodes: {}}; }
          selectedClass = k; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'mago'].filter(x => x !== k); startRun(3);
          document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
          enemies = []; spawnTimer = 1e9; arenaHazardTimer = 1e9; player.fx = 1; player.fy = 0; state = 'playing';
          runLevel = Math.max(runLevel || 1, typeof ULT_MIN_ARENA_LEVEL !== 'undefined' ? ULT_MIN_ARENA_LEVEL : 1);
          const spots = [[100, 0], [118, -16], [118, 16], [134, 0], [92, -20], [92, 20], [140, -24], [140, 24], [60, 0], [200, 0]];
          for (const [dx, dy] of spots) { const e = spawnEnemy('esqueleto'); Object.assign(e, {x: player.x + dx, y: player.y + dy, hp: 1e7, maxHp: 1e7, speed: 0, baseSpeed: 0, dmg: 0}); }
          for (let i = 0; i < allies.length; i++) { allies[i].x = player.x - 35 - i * 24; allies[i].y = player.y + 15; allies[i].hp = allies[i].maxHp * 0.5; allies[i].stunTimer = 1e9; }
          player.hp = player.maxHp * 0.6; player.energy = 1e4; player.ultCharge = player.ultMax; player.cds = [0, 0, 0];
          if (k === 'ilkan') player.ilkanFury = 1e4;
          player.aim = {x: player.x + 115, y: player.y, dx: 1, dy: 0};
          // contadores
          const C = window.__abx = {spr: {}, drawImage: 0, arc: 0, ellipse: 0, stroke: 0, fill: 0, fillRect: 0, shock: 0, burst: 0, tele: 0, frames: 0, ms: 0, on: false};
          if (!window.__abxWrapped) {
            window.__abxWrapped = true;
            const P = CanvasRenderingContext2D.prototype;
            for (const n of ['drawImage', 'arc', 'ellipse', 'stroke', 'fill', 'fillRect']) { const o = P[n]; P[n] = function () { if (window.__abx.on) window.__abx[n]++; return o.apply(this, arguments); }; }
            const w = (name, fn) => { const o = window[name]; if (typeof o === 'function') window[name] = function () { if (window.__abx.on) fn.apply(null, arguments); return o.apply(this, arguments); }; };
            w('vfxSprite', key => { const s = window.__abx.spr; s[key] = (s[key] || 0) + 1; });
            w('vfxShock', () => window.__abx.shock++); w('vfxBurst', n => window.__abx.burst++); w('vfxTelegraph', () => window.__abx.tele++);
            const oRender = window.render; window.render = function () { const t = performance.now(); const r = oRender.apply(this, arguments); if (window.__abx.on) { window.__abx.frames++; window.__abx.ms += performance.now() - t; } return r; };
          }
          return {name: slot === 'basic' ? 'Basico' : (slot === 'ult' ? player.cls.ultimate : player.cls.skills[slot]).name, kind: slot === 'basic' ? '-' : (slot === 'ult' ? player.cls.ultimate : player.cls.skills[slot]).kind};
        }, [k, slot]);
        await page.waitForTimeout(500);
        const cast = async () => page.evaluate(([slot]) => {
          if (slot === 'basic') { player.attackTimer = 0; triggerBasic(player); }
          else castAbility(player, slot === 'ult' ? player.cls.ultimate : player.cls.skills[slot], slot === 'ult', slot === 'ult' ? undefined : slot);
        }, [slot]);
        // control (sin lanzar) para restar el fondo
        const measure = async doCast => {
          await page.evaluate(() => { const C = window.__abx; Object.assign(C, {spr: {}, drawImage: 0, arc: 0, ellipse: 0, stroke: 0, fill: 0, fillRect: 0, shock: 0, burst: 0, tele: 0, frames: 0, ms: 0, on: true}); });
          if (doCast) await cast();
          await page.waitForTimeout(1300);
          return page.evaluate(() => { const C = window.__abx; C.on = false; return JSON.parse(JSON.stringify(C)); });
        };
        const ctl = await measure(false);
        await page.evaluate(([k]) => { player.cds = [0, 0, 0]; player.energy = 1e4; player.ultCharge = player.ultMax; for (const e of enemies) { e.hp = e.maxHp; } }, [k]);
        await page.waitForTimeout(600);
        const m = await measure(true);
        // capturas en una segunda tirada (para no perturbar la medicion)
        const shots = [];
        if (process.env.FRAMES) {
          await page.waitForTimeout(1500);
          await page.evaluate(([k]) => { player.cds = [0, 0, 0]; player.energy = 1e4; player.ultCharge = player.ultMax; }, [k]);
          await cast();
          const t0 = Date.now();
          for (const [i, at] of [90, 330, 700, 1100].entries()) {
            await page.waitForTimeout(Math.max(0, at - (Date.now() - t0)));
            const f = `${k}_${slot}_${i}.png`;
            await page.screenshot({path: path.join(OUT, f), clip: {x: 142, y: 45, width: 560, height: 300}});
            shots.push(f);
          }
        }
        const d = (a, b) => Math.max(0, (a || 0) - (b || 0));
        const spr = {}; for (const s in m.spr) spr[s] = m.spr[s] - (ctl.spr[s] || 0);
        const row = {slot, name: info.name, kind: info.kind, sprites: Object.keys(spr).filter(s => spr[s] > 0), shocks: d(m.shock, ctl.shock), bursts: d(m.burst, ctl.burst), teles: d(m.tele, ctl.tele),
          drawImage: Math.round(d(m.drawImage, ctl.drawImage) / Math.max(1, m.frames)), arcs: Math.round(d(m.arc + m.ellipse, ctl.arc + ctl.ellipse) / Math.max(1, m.frames)),
          strokes: Math.round(d(m.stroke, ctl.stroke) / Math.max(1, m.frames)), fills: Math.round(d(m.fill + m.fillRect, ctl.fill + ctl.fillRect) / Math.max(1, m.frames)),
          renderMs: +(m.ms / Math.max(1, m.frames)).toFixed(3), ctlRenderMs: +(ctl.ms / Math.max(1, ctl.frames)).toFixed(3), shots};
        all[k].push(row);
        console.log(k.padEnd(11), String(slot).padEnd(5), info.name.padEnd(30), 'spr=' + row.sprites.join(',') || '-', `img+${row.drawImage} arc+${row.arcs} str+${row.strokes} shock${row.shocks} burst${row.bursts} tele${row.teles} ms${row.renderMs}/${row.ctlRenderMs}`);
        await page.evaluate(() => { state = 'menu'; });
      }
    }
    fs.writeFileSync(path.join(ROOT, 'docs/vfx/audit', PHASE + (process.env.ONLY ? '-' + process.env.ONLY.replace(/,/g, '_') : '') + '.json'), JSON.stringify({phase: PHASE, errors, champions: all}, null, 1) + '\n');
    console.log('page errors:', errors.length, errors.slice(0, 5));
  } finally { await browser.close(); if (server) server.kill(); }
})().catch(e => { console.error(e); process.exitCode = 1; if (server) server.kill(); });
