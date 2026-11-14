'use strict';
// REGALO INICIAL · PASO "TU SKIN DE REGALO": la barra de confirmar (sticky) NO puede quedar encima de las cartas de skin
// en la posición de reposo (scroll 0). Q1 midió 8 px de solape en 844x390 (barra en y=306, cartas hasta y=314): si cartas + barra
// no entran en la altura, la barra flota sobre la reseña de las cartas. Se mide con rectángulos reales, con y sin carta elegida
// (cambia el texto y los botones de la barra), en celulares apaisados y en compu. Falla (código 1) con cualquier solape > 1 px.
//   node tools/ux/test-starter-skin-layout.js     (PM_BASE_URL / GAME_URL para usar un servidor propio; si no, levanta uno)
const { spawn } = require('node:child_process'), path = require('node:path'), net = require('node:net');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const VIEWPORTS = [[844, 390, 1], [667, 375, 1], [932, 430, 1], [740, 360, 1], [1280, 720, 0]];
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined && !ok ? '  ' + JSON.stringify(x).slice(0, 300) : '')); if (!ok) fails++; };
const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
(async () => {
  let server = null, BASE = process.env.PM_BASE_URL || process.env.GAME_URL;
  if (BASE) BASE = BASE.replace(/\/index\.html.*$/, '').replace(/\/$/, '');
  if (!BASE) { const port = await freePort(); server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); BASE = 'http://127.0.0.1:' + port; await sleep(700); }
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    for (const [w, h, touch] of VIEWPORTS) {
      const ctx = await browser.newContext(touch ? { viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } : { viewport: { width: w, height: h } });
      await ctx.addInitScript(() => { window.__firstRun = true; window.__autoConfirm = true; });
      const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.goto(BASE + '/index.html?account=1&lazy=1', { waitUntil: 'domcontentloaded', timeout: 180000 });
      await p.waitForFunction(() => { const b = document.getElementById('title-continue-btn'); return !!b && !b.disabled; }, null, { timeout: 180000 });
      await p.evaluate(() => document.getElementById('title-continue-btn').click());
      await p.waitForFunction(() => state === 'account' || state === 'starter', null, { timeout: 30000 });
      if (await p.evaluate(() => state === 'account')) await p.evaluate(() => document.getElementById('acc-guest-btn').click());
      await p.waitForFunction(() => state === 'starter' && document.querySelector('#starter-grid .starter-card'), null, { timeout: 30000 });
      await sleep(500); await p.evaluate(() => { document.querySelector('#starter-grid .starter-card').click(); });
      await p.waitForFunction(() => { const b = document.getElementById('starter-yes-btn'); return b && b.getBoundingClientRect().width > 0; }, null, { timeout: 15000 });
      await p.evaluate(() => document.getElementById('starter-yes-btn').click());
      await p.waitForSelector('.starter-skin-card', { state: 'visible', timeout: 30000 });
      await sleep(600);
      for (const pick of [false, true]) {
        if (pick) { await p.evaluate(() => document.querySelector('[data-skin-gift]').click()); await sleep(300); }
        await p.evaluate(() => { const s = document.getElementById('starter-screen'); s.scrollTop = 0; }); await sleep(150);
        const r = await p.evaluate(() => {
          const c = document.getElementById('starter-skin-confirm').getBoundingClientRect();
          const cards = [...document.querySelectorAll('.starter-skin-card')].map(e => e.getBoundingClientRect());
          return { barTop: Math.round(c.top), barBottom: Math.round(c.bottom), cardsBottom: Math.round(Math.max(...cards.map(k => k.bottom))), vh: innerHeight, n: cards.length };
        });
        const solape = r.cardsBottom - r.barTop;
        check(`SKIN ${w}x${h} ${pick ? 'con carta elegida' : 'sin elegir'} · la barra no pisa las cartas (solape ${solape} px)`, r.n >= 1 && solape <= 1, r);
      }
      check(`SKIN ${w}x${h} · sin errores de página`, errs.length === 0, errs);
      await ctx.close();
    }
  } finally { await browser.close(); if (server) server.kill(); }
  console.log(fails ? `\n${fails} FALLAS` : '\nTODO OK'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
