'use strict';
/* Arnés común de pruebas con navegador (sin dependencias salvo Playwright).
 *
 *   const H = require('../lib/serve');
 *   const site = await H.startSite({envUrl: ['SE_BASE_URL', 'BASE_URL']});   // site.url sin barra final; site.close()
 *   const browser = await H.launch();                                        // Chromium con la ruta correcta
 *   await H.goto(page, site.url + '/index.html');                            // timeout y reintentos configurables
 *   await browser.close(); await site.close();
 *
 * Qué resuelve (ver docs/quality/ARNES_PRUEBAS.md):
 *  - Servidor estático propio en un puerto LIBRE (puerto 0): no choca con otras pruebas ni depende de un servidor ajeno en 8771/8822/...
 *  - Comprueba que lo que sirve es ESTE árbol (index.html servido == index.html del disco), no el de otra copia del repo.
 *  - Si una variable de entorno de URL externa está definida (SE_BASE_URL, ABILITY_BASE_URL, BASE_URL...), se usa esa y NO se levanta nada
 *    (uso manual); se comprueba que responde.
 *  - Tiempos configurables por entorno: TEST_TIMEOUT_MS (valor absoluto que reemplaza a todas las esperas largas),
 *    TEST_TIMEOUT_SCALE (multiplicador, p. ej. 2 en runners lentos), TEST_GOTO_RETRIES (reintentos del goto, por omisión 2).
 *  - Localiza Playwright (NODE_PATH, PLAYWRIGHT_MODULE o /opt) y el Chromium (CHROMIUM_PATH, /opt/pw-browsers/chromium o el de Playwright).
 */
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const ROOT = path.resolve(__dirname, '../..');
const TYPES = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm', '.map': 'application/json', '.mp4': 'video/mp4', '.webm': 'video/webm'};
const sleep = ms => new Promise(r => setTimeout(r, ms));

function loadPlaywright() {
  try { return require('playwright'); } catch (e) { /* sigue */ }
  for (const p of [process.env.PLAYWRIGHT_MODULE, '/opt/node22/lib/node_modules/playwright', '/opt/node-tools/node_modules/playwright']) {
    if (!p) continue;
    try { return require(p); } catch (e) { /* sigue */ }
  }
  throw new Error('No se encuentra Playwright (npm i playwright, NODE_PATH o PLAYWRIGHT_MODULE).');
}
const chromiumPath = () => process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
// Las páginas creadas por el navegador de launch() escalan sus esperas largas (waitForFunction y el tiempo por omisión)
// con TEST_TIMEOUT_MS / TEST_TIMEOUT_SCALE, sin tocar cada prueba.
function tunePage(page) {
  if (page.__tuned) return page; page.__tuned = true;
  const wf = page.waitForFunction.bind(page);
  page.waitForFunction = (fn, arg, o) => wf(fn, arg, {...(o || {}), timeout: timeout((o && o.timeout) || 30000)});
  page.setDefaultTimeout(timeout(30000));
  return page;
}
function tuneContext(ctx) { ctx.on('page', tunePage); ctx.pages().forEach(tunePage); return ctx; }
async function launch(opts = {}) {
  const {chromium} = loadPlaywright();
  const browser = await chromium.launch({executablePath: chromiumPath(), args: ['--no-sandbox', '--disable-dev-shm-usage'], ...opts});
  const newContext = browser.newContext.bind(browser), newPage = browser.newPage.bind(browser);
  browser.newContext = async o => tuneContext(await newContext(o));
  browser.newPage = async o => { const p = await newPage(o); tuneContext(p.context()); return tunePage(p); };
  return browser;
}

// Tiempo (ms) de una espera que la prueba declara con `def`: TEST_TIMEOUT_MS manda; si no, def * TEST_TIMEOUT_SCALE.
function timeout(def) {
  const abs = +process.env.TEST_TIMEOUT_MS; if (abs > 0) return abs;
  const k = +process.env.TEST_TIMEOUT_SCALE; return Math.round(def * (k > 0 ? k : 1));
}
// page.goto con reintentos (conexión rechazada, timeout bajo carga).
async function goto(page, url, opts = {}) {
  const retries = process.env.TEST_GOTO_RETRIES === undefined ? 2 : Math.max(0, +process.env.TEST_GOTO_RETRIES || 0);
  const o = {waitUntil: 'domcontentloaded', ...opts, timeout: timeout(opts.timeout || 120000)};
  let last;
  for (let i = 0; i <= retries; i++) {
    try { return await page.goto(url, o); } catch (e) {
      last = e; if (i < retries) { console.log(`goto reintento ${i + 1}/${retries}: ${String(e.message).split('\n')[0]}`); await sleep(500 * (i + 1)); }
    }
  }
  throw last;
}
// page.waitForFunction con el mismo criterio de tiempos: waitFor(page, fn, arg, {timeout}).
const waitFor = (page, fn, arg, opts = {}) => page.waitForFunction(fn, arg, {...opts, timeout: timeout(opts.timeout || 120000)});

function staticServer(root) {
  return http.createServer((req, res) => {
    let p; try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (e) { res.writeHead(400); return res.end('bad'); }
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(root, p);
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); return res.end('forbidden'); }
    fs.stat(file, (err, st) => {
      if (err || !st.isFile()) { res.writeHead(404, {'content-type': 'text/plain'}); return res.end('not found'); }
      const h = {'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store', 'accept-ranges': 'bytes'};
      const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
      if (m && (m[1] || m[2])) {
        const a = m[1] ? +m[1] : Math.max(0, st.size - +m[2]), b = m[1] && m[2] ? Math.min(+m[2], st.size - 1) : st.size - 1;
        if (a > b || a >= st.size) { res.writeHead(416, {'content-range': `bytes */${st.size}`}); return res.end(); }
        res.writeHead(206, {...h, 'content-range': `bytes ${a}-${b}/${st.size}`, 'content-length': b - a + 1});
        return req.method === 'HEAD' ? res.end() : fs.createReadStream(file, {start: a, end: b}).pipe(res);
      }
      res.writeHead(200, {...h, 'content-length': st.size});
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(file).pipe(res);
    });
  });
}
// GET con tiempo límite y reintentos (un runner cargado puede tardar en atender el primer pedido).
async function fetchText(url, ms = 15000, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    const ac = new AbortController(), t = setTimeout(() => ac.abort(), ms);
    try { const r = await fetch(url, {signal: ac.signal}); return {ok: r.ok, status: r.status, body: await r.text()}; }
    catch (e) { last = e; await sleep(300 * (i + 1)); } finally { clearTimeout(t); }
  }
  throw last;
}

/* Devuelve {url, external, close()}. envUrl: variables que, si existen, indican un servidor externo (uso manual).
 * Con servidor propio verifica que el index.html servido sea idéntico al del disco (el árbol correcto). */
async function startSite({root = ROOT, envUrl = ['SE_BASE_URL', 'BASE_URL', 'ABILITY_BASE_URL'], quiet = false} = {}) {
  for (const name of envUrl) {
    const v = process.env[name];
    if (!v) continue;
    const url = v.replace(/\/+$/, '');
    let r; try { r = await fetchText(url + '/index.html'); } catch (e) { throw new Error(`${name}=${v} no responde (${e.message}). Quitá la variable para usar el servidor propio.`); }
    if (!r.ok) throw new Error(`${name}=${v} devolvió HTTP ${r.status} en /index.html`);
    if (!quiet) console.log(`[arnés] servidor externo (${name}): ${url}`);
    return {url, external: true, close: async () => {}};
  }
  const srv = staticServer(root);
  await new Promise((ok, ko) => { srv.once('error', ko); srv.listen(0, '127.0.0.1', ok); });
  const url = `http://127.0.0.1:${srv.address().port}`;
  const close = () => new Promise(r => { if (srv.closeAllConnections) srv.closeAllConnections(); srv.close(() => r()); });
  try {
    const r = await fetchText(url + '/index.html'), disk = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    if (!r.ok || r.body !== disk) throw new Error('el servidor propio no sirve este árbol (index.html distinto del disco)');
  } catch (e) { await close(); throw e; }
  if (!quiet) console.log(`[arnés] servidor propio: ${url} (raíz ${root})`);
  return {url, external: false, close};
}

module.exports = {ROOT, loadPlaywright, launch, chromiumPath, timeout, goto, waitFor, startSite, sleep};
