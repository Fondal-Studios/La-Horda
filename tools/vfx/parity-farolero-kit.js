'use strict';
/* Main frente a candidato, ambos con SFA activo. Compara estado mecánico resumido y RNG durante 360 frames; no prueba aislamiento global. */
const path = require('node:path'), {spawn} = require('node:child_process');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..'), PORT = +(process.env.PORT || 8996);
let server = process.env.BASE_URL ? null : spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {cwd: ROOT, stdio: 'ignore'});
const BASE = process.env.BASE_URL || `http://127.0.0.1:${PORT}/`;
process.on('exit', () => server && server.kill());
(async () => {
  await new Promise(r => setTimeout(r, server ? 700 : 0));
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  let bad = 0;
  try {
    const errors = [], results=[];
    // cada corrida en una página nueva: el estado que deja una partida (cachés, contadores) no debe contaminar la siguiente
    const fresh = async (baseline=false) => { for (let tries = 0; ; tries++) { try { return await fresh1(baseline); } catch (e) { if (tries >= 3) throw e; await new Promise(r => setTimeout(r, 3000)); } } };
    const fresh1 = async baseline => { const pg = await browser.newPage({viewport: {width: 844, height: 390}}); pg.on('pageerror', e => errors.push(e.message));
      if(baseline)await pg.route('**/js/champions/skill-fx-a/**',async r=>{const rel=new URL(r.request().url()).pathname.slice(1);if(['js/champions/skill-fx-a/c/farolero.js','js/champions/skill-fx-a/engine.js','js/champions/skill-fx-a/bind.js'].includes(rel))await r.fulfill({contentType:'application/javascript',body:require('node:child_process').execFileSync('git',['show','f62d1814:'+rel])});else await r.continue();});
      for (let t = 0; ; t++) { try { await pg.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 120000}); break; } catch (e) { if (t > 2 || process.env.BASE_URL) throw e; server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {cwd: ROOT, stdio: 'ignore'}); await new Promise(r => setTimeout(r, 900)); } }
      await pg.waitForFunction(() => typeof startRun === 'function' && typeof sfaPush === 'function' && assetsAllReady(), null, {timeout: 120000}); await pg.waitForTimeout(800); return pg; };
    let page = await fresh();
    let keys = await page.evaluate(() => Object.keys(SFA_BIND).sort());
    await page.close();
    if (process.env.ONLY) keys = keys.filter(k => process.env.ONLY.split(',').includes(k));
    const frames = +(process.env.FRAMES || 360);
    for (const k of keys) {
      // cada corrida en una página nueva (el estado que deja una partida contamina la siguiente aunque el reloj sea virtual)
      const once = async off => { const pg = await fresh(off); try { return await pg.evaluate(([k, frames, off]) => {
          const run = off => {
            window.SFA_OFF = false;
            let seedv = 987654321, calls = 0, vt = 1000; const rnd = Math.random, pn = performance.now; performance.now = () => vt;   // reloj virtual: el azar no debe depender del tiempo real
            Math.random = () => { calls++; seedv ^= seedv << 13; seedv >>>= 0; seedv ^= seedv >> 17; seedv ^= seedv << 5; seedv >>>= 0; return seedv / 4294967296; };
            try {
              netMatch = null; save.stash = []; save.relics = {hp: 0, dmg: 0, def: 0, vel: 0};
              for (const c in save.champions) { const s = save.champions[c]; s.unlocked = true; s.level = 20; s.xp = 0; s.equipment = {}; s.inventory = []; s.talents = {nodes: {}, mastery: null, masteryNodes: {}}; }
              selectedClass = k; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'mago'].filter(x => x !== k); startRun(3);
              enemies = []; spawnTimer = 1e9; arenaHazardTimer = 1e9; player.fx = 1; player.fy = 0; state = 'playing';
              runLevel = Math.max(runLevel || 1, typeof ULT_MIN_ARENA_LEVEL !== 'undefined' ? ULT_MIN_ARENA_LEVEL : 1);
              for (let i = 0; i < 18; i++) { const e = spawnEnemy('esqueleto'); Object.assign(e, {x: player.x + 70 + (i % 6) * 22, y: player.y + (((i / 6) | 0) - 1) * 30, hp: 1e6, maxHp: 1e6, speed: 0, baseSpeed: 0, dmg: 0}); }
              for (const a of allies) a.stunTimer = 1e9;
              player.energy = 1e4; player.ultCharge = player.ultMax; player.aim = {x: player.x + 110, y: player.y, dx: 1, dy: 0};
              for (let f = 0; f < frames; f++) {
                if (f % 40 === 5) { player.cds = [0, 0, 0]; player.energy = 1e4; player.ultCharge = player.ultMax; player.ultCd = 0; const i = ((f / 40) | 0) % 4; if (i < 3) castAbility(player, player.cls.skills[i], false, i); else castAbility(player, player.cls.ultimate, true); }
                vt += 16; update(16); if (f % 3 === 0) render();
              }
              const snap = {t: Math.round(runElapsedMs), calls, p: [Math.round(player.x * 100), Math.round(player.y * 100), Math.round(player.hp), Math.round(player.shield || 0)],
                e: enemies.map(e => [Math.round(e.x * 100), Math.round(e.y * 100), Math.round(e.hp), e.slowTimer | 0, e.stunTimer | 0, e.bleedTimer | 0]), h: heroes.map(h => [Math.round(h.x * 100), Math.round(h.hp), Math.round(h.shield || 0)]), objs: (typeof portadorObjects !== 'undefined' ? portadorObjects : []).map(o => [o.kind, Math.round(o.life)])};
              state = 'menu'; return JSON.stringify(snap);
            } finally { Math.random = rnd; performance.now = pn; window.SFA_OFF = false; }
          };
          return run(off);
        }, [k, frames, off]); } finally { await pg.close(); } };
      const a = await once(true), b = await once(false), determ = true;
      results.push({champion:k,parent:JSON.parse(a),candidate:JSON.parse(b),same:a===b});
      const res = {same: a === b, determ, callsOff: JSON.parse(a).calls, callsOn: JSON.parse(b).calls, a: a.slice(0, 600), b: b.slice(0, 600)};
      if (!res.determ) { console.log('INCONCLUSO ' + k.padEnd(11) + ' (dos corridas sin sprites ya difieren: el escenario no es determinista)'); continue; }
      if (!res.same) bad++;
      console.log((res.same ? 'IGUAL ' : 'DIFIERE ') + k.padEnd(11) + ` Math.random main=${res.callsOff} candidato=${res.callsOn}`);
      if (!res.same) console.log('  ' + res.a + '\n  ' + res.b);
    }
    console.log(`${keys.length} campeones, ${bad} difieren, errores de página: ${errors.length}`, errors.slice(0, 3));
    require('node:fs').writeFileSync('art-source/entregas/farolero-kit-20261023/primera-pasada-01/parity.json',JSON.stringify({frames,results,errors},null,2));
  } finally { await browser.close(); if (server) server.kill(); }
  process.exitCode = bad ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; if (server) server.kill(); });
