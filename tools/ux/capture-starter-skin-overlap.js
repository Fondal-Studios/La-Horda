'use strict';
// CAPTURA ANTES/DESPUÉS del solape de la barra de confirmar sobre las cartas de skin (regalo inicial, 844x390 táctil), del motor real.
// ANTES = el css/onboarding.css de la revisión indicada (por omisión HEAD, servido con page.route); DESPUÉS = el del árbol de trabajo.
// Una sola imagen: ANTES arriba con barra roja, DESPUÉS abajo con barra verde.
//   node tools/ux/capture-starter-skin-overlap.js [salida.png] [revisión-antes=HEAD]
// (con el arreglo ya commiteado pasá una revisión anterior, p. ej. la del commit padre)
const { spawn, execFileSync } = require('node:child_process'), path = require('node:path'), fs = require('node:fs'), net = require('node:net');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'art-source/captures/primera-sesion/solape_antes_despues.png'));
const REV = process.argv[3] || 'HEAD';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
async function shoot(browser, BASE, cssOverride) {
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => { window.__firstRun = true; window.__autoConfirm = true; });
  if (cssOverride) await ctx.route('**/css/onboarding.css*', r => r.fulfill({ status: 200, contentType: 'text/css', body: cssOverride }));
  const p = await ctx.newPage();
  await p.goto(BASE + '/index.html?account=1&lazy=1', { waitUntil: 'domcontentloaded', timeout: 180000 });
  await p.waitForFunction(() => { const b = document.getElementById('title-continue-btn'); return !!b && !b.disabled; }, null, { timeout: 180000 });
  await p.evaluate(() => document.getElementById('title-continue-btn').click());
  await p.waitForFunction(() => state === 'account' || state === 'starter', null, { timeout: 30000 });
  if (await p.evaluate(() => state === 'account')) await p.evaluate(() => document.getElementById('acc-guest-btn').click());
  await p.waitForFunction(() => state === 'starter' && document.querySelector('#starter-grid .starter-card'), null, { timeout: 30000 });
  await sleep(500); await p.evaluate(() => document.querySelector('#starter-grid .starter-card').click());
  await p.waitForFunction(() => { const b = document.getElementById('starter-yes-btn'); return b && b.getBoundingClientRect().width > 0; }, null, { timeout: 15000 });
  await p.evaluate(() => document.getElementById('starter-yes-btn').click());
  await p.waitForSelector('.starter-skin-card', { state: 'visible', timeout: 30000 }); await sleep(900);
  await p.evaluate(() => { document.getElementById('starter-screen').scrollTop = 0; }); await sleep(200);
  const m = await p.evaluate(() => { const c = document.getElementById('starter-skin-confirm').getBoundingClientRect(); const k = Math.max(...[...document.querySelectorAll('.starter-skin-card')].map(e => e.getBoundingClientRect().bottom)); return { barTop: Math.round(c.top), cardsBottom: Math.round(k), solape: Math.round(k - c.top) }; });
  const png = await p.screenshot(); await ctx.close(); return { png, m };
}
(async () => {
  const port = await freePort(), server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  const BASE = 'http://127.0.0.1:' + port; await sleep(700);
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const oldCss = execFileSync('git', ['show', REV + ':css/onboarding.css'], { cwd: ROOT, maxBuffer: 1 << 24 }).toString();
    const A = await shoot(browser, BASE, oldCss), D = await shoot(browser, BASE, null);
    const b64 = b => 'data:image/png;base64,' + b.toString('base64');
    const bar = (col, txt) => `<div style="background:${col};color:#fff;font:700 22px monospace;padding:6px 14px;letter-spacing:1px">${txt}</div>`;
    const html = `<body style="margin:0;background:#111;width:844px">${bar('#c62828', `ANTES (${REV}) · 844x390 táctil · la barra sube a y=${A.m.barTop} y las cartas llegan a y=${A.m.cardsBottom}: SOLAPE ${A.m.solape} px`)}<img style="display:block;width:844px" src="${b64(A.png)}">${bar('#2e7d32', `DESPUÉS · la barra queda en y=${D.m.barTop} y las cartas terminan en y=${D.m.cardsBottom}: SOLAPE ${D.m.solape} px (negativo = hay aire)`)}<img style="display:block;width:844px" src="${b64(D.png)}"></body>`;
    const ctx = await browser.newContext({ viewport: { width: 844, height: 800 }, deviceScaleFactor: 1 }); const pg = await ctx.newPage();
    await pg.setContent(html); await sleep(300);
    fs.mkdirSync(path.dirname(OUT), { recursive: true }); await pg.screenshot({ path: OUT, fullPage: true });
    console.log(JSON.stringify({ antes: A.m, despues: D.m, salida: OUT }));
  } finally { await browser.close(); server.kill(); }
})().catch(e => { console.error(e); process.exit(1); });
