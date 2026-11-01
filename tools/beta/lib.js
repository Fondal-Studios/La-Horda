'use strict';
// Utilidades compartidas de tools/beta: servidor estático propio (puerto libre) y Playwright.
const { spawn } = require('child_process'), net = require('net'), path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..');
const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
// Sirve `dir` (por defecto la raíz del repo) con python http.server; devuelve {base, stop}.
async function serve(dir) {
  const port = await freePort();
  const proc = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: dir || ROOT, stdio: 'ignore' });
  const base = 'http://127.0.0.1:' + port;
  const http = require('http');
  for (let i = 0; i < 60; i++) { const ok = await new Promise(r => { http.get(base + '/index.html', res => { res.resume(); r(res.statusCode === 200); }).on('error', () => r(false)); }); if (ok) break; await sleep(100); }
  return { base, stop: () => { try { proc.kill(); } catch (e) {} } };
}
let fails = 0;
const check = (name, ok, extra) => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra !== undefined ? '  ' + JSON.stringify(extra).slice(0, 300) : '')); if (!ok) fails++; return ok; };
const failCount = () => fails;
async function ready(page) {
  await page.waitForFunction(() => typeof assetsAllReady === 'function' && assetsAllReady(), null, { timeout: 180000 });
  await page.waitForFunction(() => { const b = document.getElementById('title-continue-btn'); return b && !b.disabled; }, null, { timeout: 60000 });
}
module.exports = { chromium, ROOT, serve, sleep, check, failCount, ready, freePort };
