'use strict';
// PRESUPUESTO DE RENDIMIENTO por cuadro: costo de update()+render() en una pelea cargada (60 enemigos en pantalla, habilidades lanzadas).
//   node tools/lib/with-site.js tools/quality/test-perf-budget.js        (o dentro de run-all: kind 'site')
// No es una promesa de FPS en dispositivos reales (el navegador de CI dibuja por software): es una GUARDA DE REGRESIÓN. Mide el costo
// de simular + dibujar 240 cuadros fijos de 16 ms y falla si el percentil 95 o la mediana superan el presupuesto, o si aparecen
// errores. Los números se imprimen en una línea PERF {...} que recoge tools/quality/qa-report.js para el informe de rendimiento.
// Presupuestos (ms por cuadro, navegador sin GPU de CI): p50 <= PERF_P50_MS (30), p95 <= PERF_P95_MS (90). Medido al crearla: p50 ~9 ms,
// p95 ~30 ms (3x de margen). Se pueden ajustar por variable de entorno SOLO para medir; el valor del repositorio es el que cuenta.
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const BASE = process.env.SE_BASE_URL || 'http://127.0.0.1:8771';
const P50 = +(process.env.PERF_P50_MS || 30), P95 = +(process.env.PERF_P95_MS || 90), FRAMES = 240, FOES = 60;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 300) : '')); if (!ok) fails++; };
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await (await browser.newContext({ viewport: { width: 844, height: 390 } })).newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g|net::|404/.test(m.text())) errors.push('console: ' + m.text().slice(0, 200)); });
  await page.addInitScript(() => { window.__campaignMode = true; });
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load' });
  for (let k = 0; k < 300; k++) { if (await page.evaluate(() => !document.getElementById('title-continue-btn').disabled)) break; await sleep(100); }
  const r = await page.evaluate(({ FRAMES, FOES }) => {
    loop = function () {};
    for (const k of Object.keys(save.champions)) save.champions[k].unlocked = true;
    selectedClass = 'mago'; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'guerrero']; startRun(5);
    spawnTimer = 1e12; enemies.length = 0; levelDuration = 9e9;
    for (let i = 0; i < FOES; i++) { const e = spawnEnemy('duende_bosque', false); e.x = player.x + Math.cos(i) * (80 + (i % 7) * 25); e.y = player.y + Math.sin(i) * (60 + (i % 5) * 25); e.hp = e.maxHp = 1e7; e.atkCd = 1e9; }
    const ts = [];
    for (let i = 0; i < FRAMES; i++) {
      for (const h of heroes) h.hp = h.maxHp;
      if (i % 10 === 0 && player.cds) { player.cds = [0, 0, 0]; player.energy = 999; try { useSkill(i / 10 % 3 | 0, null); } catch (e) {} }
      const t0 = performance.now(); update(16); render(); ts.push(performance.now() - t0);
    }
    ts.sort((a, b) => a - b);
    const q = p => ts[Math.min(ts.length - 1, Math.floor(ts.length * p))];
    return { frames: ts.length, foes: enemies.filter(e => e.alive).length, p50: +q(0.5).toFixed(2), p95: +q(0.95).toFixed(2), max: +ts[ts.length - 1].toFixed(2), mean: +(ts.reduce((a, b) => a + b, 0) / ts.length).toFixed(2), state };
  }, { FRAMES, FOES });
  console.log('PERF ' + JSON.stringify(r));
  check('PERF.la_pelea_siguio_en_curso', r.state === 'playing' && r.foes >= FOES * 0.8, r);
  check(`PERF.mediana_por_cuadro_<=_${P50}ms`, r.p50 <= P50, r);
  check(`PERF.p95_por_cuadro_<=_${P95}ms`, r.p95 <= P95, r);
  check('PERF.sin_errores_de_pagina', errors.length === 0, errors.slice(0, 3));
  await browser.close();
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
