// FASE 1 (cierre): cerrar la pestaña a MITAD de una partida y volver a abrir el juego (caracterización del comportamiento actual).
//   Lo que fija: (1) lo ganado hasta ese momento (oro y XP) queda guardado (pagehide -> persistNow), sin pérdida ni castigo;
//   (2) la partida NO se retoma (por diseño no hay guardado de partida en curso): el juego vuelve al título sin colgarse y sin errores;
//   (3) el guardado se carga íntegro (nivel del guardián, arenas). El único «retomar» es el punto de control del nivel 5 (t_checkpoint.js).
//   node tools/regression/t_reload_midrun.js   (servidor propio en puerto libre; SE_BASE_URL para usar otro)
const HARNESS = require('../lib/serve');
const fs = require('fs'), path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x) : '')); if (!ok) fails++; };
(async () => {
  const site = await HARNESS.startSite({ envUrl: ['SE_BASE_URL'] }); const browser = await HARNESS.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 844, height: 390 } }); await ctx.addInitScript(() => { window.__campaignMode = true; });
    const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    const boot = async () => { await HARNESS.goto(page, `${site.url}/index.html`, { waitUntil: 'load', timeout: 180000 });
      await page.waitForFunction(() => { const b = document.getElementById('title-continue-btn'); return !!(b && !b.disabled) && typeof startRun === 'function' && typeof persistNow === 'function'; }, null, { timeout: 120000 }); };
    await boot();
    await page.addScriptTag({ path: path.resolve(__dirname, '../playtest/autopilot.js') });
    const A = await page.evaluate(() => { const g0 = save.gold, x0 = totalXpForChamp('guerrero'); __AP.start('guerrero', 'ciudad', 1); __AP.sim(150000);
      return { state, runLevel, gold0: g0, xp0: Math.round(x0), gold: save.gold, xp: Math.round(totalXpForChamp('guerrero')), lvl: save.champions.guerrero.level, cleared: Object.keys(save.arenasCleared || {}).length }; });
    check('PARTIDA.en_curso_con_progreso_antes_de_cerrar', A.state === 'playing' && A.runLevel >= 2 && A.gold > A.gold0 && A.xp > A.xp0, A);
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));   // lo que dispara el navegador al cerrar/descartar la pestaña
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => typeof save !== 'undefined' && !!document.getElementById('title-continue-btn'), null, { timeout: 120000 }); await sleep(2000);
    const B = await page.evaluate(() => ({ state, vis: [...document.querySelectorAll('.screen:not(.hidden)')].map(e => e.id), gold: save.gold, xp: Math.round(totalXpForChamp('guerrero')), lvl: save.champions.guerrero.level, cleared: Object.keys(save.arenasCleared || {}).length, running: typeof runLevel !== 'undefined' && state === 'playing' }));
    check('RECARGA.oro_y_XP_ganados_quedan_guardados_sin_castigo', B.gold === A.gold && B.xp === A.xp && B.lvl === A.lvl, { antes: A, despues: B });
    check('RECARGA.arenas_ganadas_intactas', B.cleared === A.cleared, { a: A.cleared, b: B.cleared });
    check('RECARGA.la_partida_no_se_retoma_(por_diseno):_vuelve_al_titulo_sin_colgarse', B.state === 'title' && !B.running && B.vis.includes('title-screen'), B);
    check('RECARGA.sin_errores_de_pagina', errors.length === 0, errors);
  } finally { await browser.close(); await site.close(); }
  console.log(fails ? `\n${fails} FAIL` : '\nTODO OK'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
