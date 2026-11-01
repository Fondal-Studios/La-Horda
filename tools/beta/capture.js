'use strict';
// BETA VISUAL IMPACT — captura comparable de main y de la rama (mismo guion, mismas posiciones, mismo viewport).
//   node tools/beta/capture.js --target beta|main --base http://127.0.0.1:8801 --out docs/beta/captures/beta [--video]
//   El "main" se sirve desde un worktree de main (git worktree add <dir> main). La rama con ?beta=0 equivale a main
//   salvo por el código no ejecutado; para el informe se usa el worktree real.
// Guion (idéntico en ambos): título → arrancar Ruinas con Sylva → aparición → combate (piloto automático) → definitiva
//   → botín de cada rareza → peligro (raíz) → caída del jugador. Mide además la duración de cuadros durante el combate.
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const fs = require('fs'), path = require('path');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true); };
const TARGET = arg('target', 'beta'), BASE = arg('base', 'http://127.0.0.1:8801'), OUT = path.resolve(arg('out', 'docs/beta/captures/' + TARGET)), VIDEO = !!arg('video', false);
const VW = +arg('w', 844), VH = +arg('h', 390), SEED = +arg('seed', 117);
const AUTOPILOT = path.resolve(__dirname, '../playtest/autopilot.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1, ...(VIDEO ? { recordVideo: { dir: path.join(OUT, 'video'), size: { width: VW, height: VH } } } : {}) });
  await ctx.addInitScript((seed) => {
    window.__campaignMode = true;
    let n = seed | 0 || 1; Math.random = () => { n ^= n << 13; n ^= n >>> 17; n ^= n << 5; return (n >>> 0) / 4294967296; };
    window.__frames = []; let last = 0; const f = t => { if (last) window.__frames.push(t - last); last = t; requestAnimationFrame(f); }; requestAnimationFrame(f);
  }, SEED);
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const shot = async (name) => { await page.screenshot({ path: path.join(OUT, name + '.png') }); console.log('shot', name); };
  const E = (fn, a) => page.evaluate(fn, a);
  const result = { target: TARGET, base: BASE, viewport: [VW, VH], steps: {}, errors };

  const t0 = Date.now();
  await page.goto(BASE + '/index.html?cap=' + Date.now(), { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => typeof assetsAllReady === 'function' && assetsAllReady(), null, { timeout: 180000 });
  await page.waitForFunction(() => { const b = document.getElementById('title-continue-btn'); return b && !b.disabled; }, null, { timeout: 60000 });
  result.steps.titleReadyMs = Date.now() - t0;
  await sleep(2600); await shot('01_titulo');

  // arranque: la rama usa el acceso rápido (1 toque); main arranca igual por código (el recorrido por menús se mide en taps.js)
  const hasQuick = await E(() => !!document.getElementById('bt-play'));
  await page.addScriptTag({ path: AUTOPILOT });
  const tStart = Date.now();
  if (hasQuick) { await page.click('#bt-play'); await sleep(250); await shot('02_arranque'); await page.waitForFunction(() => state === 'playing', null, { timeout: 15000 }); }
  else { await E(() => { for (const c of Object.values(save.champions)) c.unlocked = true; selectedClass = 'cazadora'; currentArena = 'bosque'; startRun(1); }); }
  await E(() => { if (!save.champions.cazadora) save.champions.cazadora = mkChampion(true); });
  result.steps.startToPlayingMs = Date.now() - tStart;
  await sleep(500); await shot('03_aparicion_0s5');
  await sleep(1100); await shot('04_aparicion_1s6');
  await sleep(1800); await shot('05_arena_3s');

  // botín: una de cada rareza alrededor del jugador (mismo semillado, mismas posiciones)
  await E(() => { enemies.length = 0; groundLoot.length = 0; });
  await E(() => {
    const px = player.x, py = player.y - 125, tiers = ['comun', 'raro', 'muyraro', 'legendario', 'mitico'];
    // la tirada de rareza se fija por cuadro de la muestra: misma comparación en main y en la rama (solo en el guion de captura)
    const realRoll = window.groundLootRollTier; let want = 'comun'; window.groundLootRollTier = () => want;
    tiers.forEach((t, i) => { want = t; groundLootDrop(px - 190 + i * 95, py, 'S', 1, 'bosque', 'jefe', false, null, null); });
    window.groundLootRollTier = realRoll;
    // si la rareza que cayó no es la pedida se fuerza (comparación honesta de la presentación)
  });
  await sleep(450); await shot('12_botin_caida');
  await sleep(1800); await shot('13_botin_en_piso');
  result.steps.lootTiers = await E(() => groundLoot.map(g => g.tier));
  await E(() => { groundLoot.length = 0; });


  // combate: enemigos alrededor y piloto automático (juega como una persona: se mueve, ataca, usa habilidades)
  await E(() => {
    __AP.on = true; __AP.skill = 0.9; __AP.reaction = 250;
    const types = ['duende_bosque', 'duende_bosque', 'duende_bosque', 'duende_bosque', 'bestia_bosque', 'duende_bosque', 'duende_bosque', 'dama_bosque'];
    types.forEach((t, i) => { spawnEnemy(t, false, false); const e = enemies[enemies.length - 1], a = i * 0.785 + 0.3; e.x = player.x + Math.cos(a) * (150 + (i % 3) * 26); e.y = player.y + Math.sin(a) * (110 + (i % 2) * 22); });
  });
  result.steps.combatFrames0 = await E(() => window.__frames.length);
  const shots = ['06_combate_a', '07_combate_b', '08_combate_c'];
  for (const n of shots) { await sleep(1300); await shot(n); }
  await sleep(1500);

  // definitiva real (botón): se carga y se toca como lo haría un jugador
  await E(() => { __AP.on = false; runLevel = Math.max(runLevel, typeof ULT_MIN_ARENA_LEVEL !== 'undefined' ? ULT_MIN_ARENA_LEVEL : 1); player.ultCharge = player.ultMax; player.ultCd = 0; player.energy = player.maxEnergy || 999;
    for (let i = 0; i < 7; i++) { spawnEnemy('duende_bosque', false, false); const e = enemies[enemies.length - 1], a = i * 0.9; e.x = player.x + Math.cos(a) * 120; e.y = player.y + Math.sin(a) * 90; } });
  await sleep(500);
  const b = await (await page.$('#btn-ult')).boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await sleep(60); await page.mouse.up();
  await sleep(120); await shot('09_definitiva_120ms');
  await sleep(230); await shot('10_definitiva_350ms');
  await sleep(500); await shot('11_definitiva_850ms');

  // peligro: raíces con aviso a ambos lados del jugador
  await E(() => { groundLoot.length = 0; const px = player.x, py = player.y; bossStrike(px + 90, py + 10, 58, 2600, 0, 'root', { stun: 0 }); bossStrike(px - 80, py - 30, 58, 2200, 0, 'root', { stun: 0 }); });
  await sleep(900); await shot('14_peligro_aviso');
  await sleep(1400);

  // rendimiento medido en combate real: piloto + 16 enemigos
  await E(() => { window.__frames.length = 0; __AP.on = true; for (let i = 0; i < 16; i++) { spawnEnemy(i % 5 === 0 ? 'bestia_bosque' : 'duende_bosque', false, false); } });
  await sleep(9000);
  const fr = await E(() => { const a = window.__frames.slice(5).sort((x, y) => x - y); const q = p => a[Math.min(a.length - 1, Math.floor(a.length * p))]; return { n: a.length, avgMs: a.reduce((s, v) => s + v, 0) / a.length, p50: q(0.5), p95: q(0.95), p99: q(0.99), over33: a.filter(v => v > 33.4).length / a.length, over50: a.filter(v => v > 50).length / a.length }; });
  result.perf = fr;
  result.beta = await E(() => (typeof BETA !== 'undefined' ? { stats: BETA.stats } : null));
  await shot('15_combate_denso');

  // caída del jugador
  await E(() => { __AP.on = false; damageHero(player, player.maxHp * 5, { x: player.x + 40, y: player.y }); });
  await sleep(450); await shot('16_caida_450ms');
  await sleep(700); await shot('17_caida_1150ms');

  result.errors = errors;
  fs.writeFileSync(path.join(OUT, 'capture-result.json'), JSON.stringify(result, null, 2));
  await ctx.close(); await browser.close();
  console.log(JSON.stringify({ perf: result.perf, steps: result.steps, errors }, null, 1));
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
