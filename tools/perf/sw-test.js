// PRUEBA del service worker sobre una carpeta estampada (GAME_PERF=1 node tools/build-static.mjs  ->  dist/) servida
// por tools/perf/serve.js. Verifica: (1) se instala y toma control, (2) una recarga se sirve desde el SW, (3) sin
// conexión la página arranca, (4) una versión nueva (archivo cambiado + re-estampado) reemplaza SOLO lo que cambió,
// (5) localStorage (partidas) no se toca.
//   node tools/perf/serve.js 9319 dist &  ;  node tools/perf/sw-test.js dist [http://127.0.0.1:9319]
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const fs = require('fs'), path = require('path'), cp = require('child_process');
const DIST = path.resolve(process.argv[2] || 'dist'), BASE = process.argv[3] || 'http://127.0.0.1:9319';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x) : '')); if (!ok) fails++; };
const titleReady = page => page.evaluate(() => { const b = document.getElementById('title-continue-btn'); return !!(b && !b.disabled && /Toc[aá]/.test(b.textContent)); }).catch(() => false);
async function waitTitle(page, ms = 60000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await titleReady(page)) return Date.now() - t0; await sleep(100); } return null; }
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 } });
  await ctx.addInitScript(() => { window.__campaignMode = true; });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const url = BASE + '/index.html?lazy=1&sw=1';
  await page.goto(url, { waitUntil: 'commit' }); check('titulo_primera_visita', (await waitTitle(page, 120000)) !== null);
  await page.evaluate(() => localStorage.setItem('swTestMarca', 'no-tocar'));
  const info = await page.evaluate(async () => { const r = await navigator.serviceWorker.ready; return { active: !!r.active, scope: r.scope }; });
  check('sw_activo', info.active, info);
  await sleep(6000);
  const ctl = await page.evaluate(() => !!navigator.serviceWorker.controller); check('sw_controla_la_pagina', ctl);
  const n1 = await page.evaluate(async () => (await (await caches.open('lahorda-files')).keys()).length); check('archivos_en_cache', n1 > 20, n1);
  // 2) recarga: lo que sale del SW
  let fromSW = 0, total = 0; const onResp = r => { total++; if (r.fromServiceWorker()) fromSW++; };
  page.on('response', onResp); await page.reload({ waitUntil: 'commit' }); const t2 = await waitTitle(page, 120000); await sleep(1500); page.off('response', onResp);
  check('recarga_con_sw', t2 !== null, { ms: t2, fromSW, total });
  check('recarga_sirve_desde_sw', fromSW > 0 && fromSW / total > 0.9, { fromSW, total });
  // 3) sin conexión
  await ctx.setOffline(true); await page.reload({ waitUntil: 'commit' }).catch(() => {}); const t3 = await waitTitle(page, 60000);
  check('arranca_sin_conexion', t3 !== null, t3); await ctx.setOffline(false);
  check('localstorage_intacto', (await page.evaluate(() => localStorage.getItem('swTestMarca'))) === 'no-tocar');
  // 4) versión nueva: cambia un CSS y re-estampa
  const css = path.join(DIST, 'css/base.css'), orig = fs.readFileSync(css, 'utf8'), sw0 = fs.readFileSync(path.join(DIST, 'sw.js'), 'utf8');
  try {
    fs.writeFileSync(css, orig + '\n/* sw-test-marca */\n');
    cp.execFileSync('node', [path.join(__dirname, 'stamp-sw.js'), DIST], { stdio: 'pipe' });
    await page.goto(url, { waitUntil: 'commit' }); await waitTitle(page, 90000);   // sw-register.js pide la actualización en cada carga (Chrome solo la busca solo cada 24 h)
    // Chrome activa la versión nueva recién cuando la anterior no tiene pedidos en curso: se espera a que termine de bajar
    let dbg = null;
    for (let k = 0; k < 90; k++) {
      dbg = await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); const m = await (await fetch('sw-manifest.json', { cache: 'no-store' })).json(); const c = await (await caches.open('lahorda-meta')).match('sw-manifest.json'); const cj = c ? await c.json() : null; return { waiting: !!r.waiting, installing: !!r.installing, serverBuild: m.build, cachedBuild: cj && cj.build }; });
      if (!dbg.waiting && !dbg.installing && dbg.cachedBuild === dbg.serverBuild) break; await sleep(1000);
    }
    await page.reload({ waitUntil: 'commit' }); await waitTitle(page, 90000); await sleep(1000);
    const has = await page.evaluate(async () => (await (await fetch('css/base.css')).text()).includes('sw-test-marca'));
    check('version_nueva_se_sirve', has, dbg);
    const n2 = await page.evaluate(async () => (await (await caches.open('lahorda-files')).keys()).length);
    check('cache_conserva_lo_que_no_cambio', n2 >= n1 - 1, { antes: n1, despues: n2 });
  } finally { fs.writeFileSync(css, orig); fs.writeFileSync(path.join(DIST, 'sw.js'), sw0); cp.execFileSync('node', [path.join(__dirname, 'stamp-sw.js'), DIST], { stdio: 'pipe' }); }
  check('sin_errores_de_pagina', errors.length === 0, errors.slice(0, 3));
  await browser.close(); console.log(`SUMMARY ${fails ? 'FAIL' : 'OK'} fails=${fails}`); process.exit(fails ? 1 : 0);
})();
