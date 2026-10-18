// MEDICIÓN de carga inicial (no es parte del juego). Cuenta pedidos, bytes y tiempo hasta "Tocá para continuar",
// en frío (contexto nuevo) y en tibio (misma sesión, recarga). Red simulada: latencia + ancho de banda; CPU ×4.
//   node tools/perf/load-bench.js [corridas=3]     env: PERF_URL (default http://127.0.0.1:9317/index.html)
//   QUERY='?lazy=1&sw=1' mide el service worker (sirve dist/ estampado, ver tools/perf/stamp-sw.js)
//   MBPS=20 LAT=40 CPU=4 QUERY='?lazy=1'  (Playwright marca navigator.webdriver y el juego carga todo junto salvo ?lazy=1)
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const URL_ = process.env.PERF_URL || 'http://127.0.0.1:9317/index.html', RUNS = +(process.argv[2] || 3);
const MBPS = +(process.env.MBPS || 20), LAT = +(process.env.LAT || 40), CPU = +(process.env.CPU || 4), Q = process.env.QUERY || '?lazy=1';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const med = a => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
async function once(browser) {
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, serviceWorkers: process.env.SW === '0' ? 'block' : 'allow' });
  await ctx.addInitScript(() => { window.__campaignMode = true; });
  const page = await ctx.newPage(), cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: LAT, downloadThroughput: MBPS * 1e6 / 8, uploadThroughput: 5e6 / 8 });
  if (CPU !== 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  const out = {};
  for (const phase of ['frio', 'tibio', 'tibio2', 'tibio3']) {
    if (phase !== 'frio' && /sw=1/.test(Q)) { await page.evaluate(() => navigator.serviceWorker.ready).catch(() => {}); await sleep(+(process.env.SW_SETTLE || 8000)); }
    let reqs = 0, bytes = 0, js = 0; const errors = [];
    const onReq = r => { reqs++; if (/\.js(\?|$)/.test(r.url())) js++; };
    const onFin = async r => { try { const s = await r.sizes(); bytes += s.responseBodySize; } catch (e) {} };
    page.on('request', onReq); page.on('requestfinished', onFin); page.on('pageerror', e => errors.push(e.message));
    const t0 = Date.now();
    if (phase === 'frio') await page.goto(URL_ + Q, { waitUntil: 'commit' }); else await page.reload({ waitUntil: 'commit' });
    let tTitle = null;
    for (let k = 0; k < 1500; k++) {
      await sleep(50);
      const ok = await page.evaluate(() => { const b = document.getElementById('title-continue-btn'); return !!(b && !b.disabled && /Toc[aá]/.test(b.textContent)); }).catch(() => false);
      if (ok) { tTitle = Date.now() - t0; break; }
    }
    await sleep(500);
    const nav = await page.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return n ? { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd) } : {}; }).catch(() => ({}));
    out[phase] = { tTitle, reqs, js, MB: +(bytes / 1048576).toFixed(2), ...nav, errors: errors.slice(0, 2) };
    page.off('request', onReq); page.off('requestfinished', onFin);
  }
  await ctx.close(); return out;
}
(async () => {
  const res = []; for (let i = 0; i < RUNS; i++) { const browser = await chromium.launch({ args: ['--no-sandbox'] }); const r = await once(browser); await browser.close(); res.push(r); console.log(JSON.stringify(r)); }
  const sum = {}; for (const ph of ['frio', 'tibio', 'tibio2', 'tibio3']) { sum[ph] = {}; for (const k of ['tTitle', 'reqs', 'js', 'MB', 'dcl', 'load']) sum[ph][k] = med(res.map(r => r[ph][k] || 0)); }
  console.log('MEDIANA ' + JSON.stringify(sum));
})();
