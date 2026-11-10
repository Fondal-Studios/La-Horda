#!/usr/bin/env node
// Prueba del staging del paquete de escritorio y de las piezas del contenedor que no dependen de Electron.
//
//   export NODE_PATH="server/node_modules:$(npm root -g)"
//   node desktop/test-stage.mjs            (STAGE_OUT=<carpeta fuera del repo> para elegir dónde; se BORRA al terminar)
//
// 1. url-policy.js: los parámetros de desarrollo no pasan; la navegación externa se clasifica; no hay path traversal.
// 2. save-mirror.js: escritura atómica, nunca se adopta un archivo dañado ni se pisa un guardado local más nuevo.
// 3. stage.mjs a un directorio temporal FUERA del repo: no viaja nada de las carpetas excluidas, todo lo que index.html
//    referencia existe, y se informa el tamaño.
// 4. El index.html del staging, servido por un servidor estático local, llega al menú del título en Chromium (Playwright) sin
//    errores de página y sin 404, también después de pedir TODO el arte del manifiesto.
// NO prueba Electron: el binario no se construye acá.
import {createRequire} from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {stage, localRefs, NEVER} from './stage.mjs';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, '..');
const P = require('./url-policy.js'), M = require('./save-mirror.js'), H = require('../tools/lib/serve.js');
const OUT = path.resolve(process.env.STAGE_OUT || path.join(os.tmpdir(), 'lahorda-stage-out-' + process.pid));
const LOAD_MS = 180000, fails = [];
const check = (name, ok, info) => { if (!ok) fails.push(name); console.log((ok ? 'ok   ' : 'FALLA') + ' ' + name + (info === undefined ? '' : '  ' + JSON.stringify(info))); };

/* ---------- 1. política de URLs ---------- */
{
  const c = u => P.classifyNavigation(u);
  const bad = ['dev=1', 'devxp=20', 'server=wss://evil.example', 'debug=1', 'api=https://x', 'res=0.4', 'lazy=0', 'webp=0', 'sw=1', 'beta=1', 'motherScale=2', 'teleSdk=x'];
  check('url: cada parámetro de desarrollo se quita', bad.every(q => { const r = c('app://lahorda/index.html?' + q); return r.action === 'rewrite' && r.url === 'app://lahorda/index.html'; }));
  const mix = c('app://lahorda/index.html?return=hub&dev=1&devxp=5&cw=1&room=ABC123&server=ws://x&debug=1#h');
  check('url: se conservan solo los parámetros del juego', mix.action === 'rewrite' && mix.url === 'app://lahorda/index.html?return=hub&cw=1&room=ABC123#h', mix);
  check('url: una URL limpia pasa sin tocar', c('app://lahorda/index.html').action === 'allow' && c('app://lahorda/index.html?return=hub').action === 'allow' && c('app://lahorda/legal/terminos.html').action === 'allow');
  check('url: https y mailto van al navegador del sistema', c('https://store.steampowered.com/').action === 'external' && c('mailto:a@b.c').action === 'external');
  check('url: file:, http:, javascript:, data: y otros hosts se niegan', ['file:///etc/passwd', 'http://127.0.0.1:8000/', 'javascript:alert(1)', 'data:text/html,x', 'app://otro/index.html', 'no es url', 'chrome://gpu'].every(u => c(u).action === 'deny'));
  const root = path.join(os.tmpdir(), 'raiz-juego');
  const rf = u => P.resolveGameFile(root, u);
  check('archivos: rutas normales dentro de la carpeta', rf('app://lahorda/js/main.js') === path.join(root, 'js', 'main.js') && rf('app://lahorda/') === path.join(root, 'index.html') && rf('app://lahorda/assets/a%20b.png') === path.join(root, 'assets', 'a b.png'));
  check('archivos: sin path traversal', ['app://lahorda/../secreto', 'app://lahorda/%2e%2e/%2e%2e/etc/passwd', 'app://lahorda/js/..%2f..%2f..%2fetc/passwd', 'app://lahorda/a%00b', 'app://lahorda/..%5c..%5cwin.ini', 'app://otro/index.html', 'file:///etc/passwd']
    .every(u => { const f = rf(u); return f === null || f.startsWith(root + path.sep); }) && rf('app://lahorda/%2e%2e/%2e%2e/etc/passwd') !== '/etc/passwd');
  const k = (key, o = {}) => P.keyAction({type: 'keyDown', key, ...o}, true);
  check('teclas: F11 y Alt+Enter = pantalla completa; DevTools y recarga se tragan en producción', k('F11') === 'fullscreen' && k('Enter', {alt: true}) === 'fullscreen' && k('Enter') === null
    && k('F12') === 'swallow' && k('I', {control: true, shift: true}) === 'swallow' && k('r', {control: true}) === 'swallow' && k('w') === null && P.keyAction({type: 'keyDown', key: 'F12'}, false) === null);
}

/* ---------- 2. espejo del guardado ---------- */
{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lahorda-saves-')), K = 'laHordaSave_v1', f = path.join(dir, K + '.json');
  try {
    const v1 = JSON.stringify({gold: 1}), v2 = JSON.stringify({gold: 2}), v3 = JSON.stringify({gold: 3});
    const w1 = M.writeEnvelope(dir, K, v1, 0, 'pc');
    check('guardado: escribe y relee', w1.rev === 1 && M.readEnvelope(dir, K).value === v1 && !fs.readdirSync(dir).some(n => n.endsWith('.tmp')));
    const w2 = M.writeEnvelope(dir, K, v2, w1.rev, 'pc');
    check('guardado: la revisión solo crece y queda .bak de la anterior', w2.rev === 2 && JSON.parse(fs.readFileSync(f + '.bak', 'utf8')).value === v1);
    let threw = 0; for (const bad of ['{corto', '[1,2]', '"x"', 'x'.repeat(9 * 1024 * 1024)]) { try { M.writeEnvelope(dir, K, bad, 2, 'pc'); } catch (e) { threw++; } }
    try { M.writeEnvelope(dir, 'otraClave', 'x', 0, 'pc'); } catch (e) { threw++; }
    check('guardado: un valor inválido o una clave ajena no se escribe y no toca el archivo', threw === 5 && M.readEnvelope(dir, K).rev === 2 && M.readEnvelope(dir, K).value === v2);
    const mark = {[K]: w2};
    check('guardado: local al día -> no se lee del archivo', Object.keys(M.startupPlan(dir, {[K]: v2}, mark).set).length === 0);
    check('guardado: local MÁS NUEVO que el archivo -> se conserva lo local', Object.keys(M.startupPlan(dir, {[K]: v3}, mark).set).length === 0 && M.startupPlan(dir, {[K]: v3}, mark).conflicts.length === 0);
    check('guardado: instalación nueva (localStorage vacío) -> se adopta el archivo', M.startupPlan(dir, {}, {}).set[K] === v2);
    // otra máquina subió una revisión nueva por Steam Cloud
    M.writeEnvelope(dir, K, v3, 2, 'deck');
    const adopt = M.startupPlan(dir, {[K]: v2}, mark);
    check('guardado: archivo más nuevo y local sin cambios desde el último espejo -> se adopta', adopt.set[K] === v3 && adopt.marks[K].rev === 3);
    const local4 = JSON.stringify({gold: 99}), conf = M.startupPlan(dir, {[K]: local4}, mark);
    check('guardado: archivo más nuevo PERO local con cambios sin espejar -> conflicto, se conserva lo local y se aparta el ajeno',
      conf.set[K] === undefined && conf.conflicts.includes(K) && fs.existsSync(path.join(dir, K + '.conflict-3.json')) && conf.marks[K].rev === 3);
    const w5 = M.writeEnvelope(dir, K, local4, conf.marks[K].rev, 'pc');
    check('guardado: la escritura posterior queda por encima del archivo ajeno', w5.rev === 4 && M.readEnvelope(dir, K).value === local4);
    // archivo dañado (corte a mitad de una copia de la nube, disco lleno...)
    for (const junk of ['', '{"v":1,"key":"laHordaSave_v1","rev":9,"value":"{no json"}', '{"v":1,"key":"otra","rev":9,"value":"{}"}', '{"v":1,"key":"laHordaSave_v1","rev":9', 'null']) {
      fs.writeFileSync(f, junk);
      if (M.readEnvelope(dir, K) !== null || Object.keys(M.startupPlan(dir, {[K]: v2}, mark).set).length || Object.keys(M.startupPlan(dir, {}, {}).set).length) fails.push('archivo dañado adoptado: ' + junk.slice(0, 30));
    }
    check('guardado: un archivo dañado o de otra clave nunca se adopta', !fails.some(x => x.startsWith('archivo dañado')));
    const w6 = M.writeEnvelope(dir, K, v2, 4, 'pc');
    check('guardado: escribir sobre un archivo dañado lo repara sin copiarlo a .bak', w6.rev === 5 && M.readEnvelope(dir, K).value === v2 && JSON.parse(fs.readFileSync(f + '.bak', 'utf8')).v === 1);
    M.writeEnvelope(dir, K, null, 5, 'deck');
    check('guardado: un borrado hecho en otra máquina no borra lo local', Object.keys(M.startupPlan(dir, {[K]: v2}, {[K]: w6}).set).length === 0 && !(K in M.startupPlan(dir, {}, {}).set));
    check('guardado: borrado local sin espejar manda sobre el archivo', (() => { M.writeEnvelope(dir, K, v3, 6, 'deck'); return !(K in M.startupPlan(dir, {}, {[K]: w6}).set); })());
  } finally { fs.rmSync(dir, {recursive: true, force: true}); }
}

/* ---------- 3 y 4. staging + carga ---------- */
const walk = (dir, base = dir, acc = []) => { for (const e of fs.readdirSync(dir, {withFileTypes: true})) { const f = path.join(dir, e.name); if (e.isDirectory()) walk(f, base, acc); else acc.push(path.relative(base, f).split(path.sep).join('/')); } return acc; };
let browser = null, server = null;
try {
  check('staging: el destino está FUERA del repo', path.relative(REPO, OUT).startsWith('..'), {OUT});
  if (!path.relative(REPO, OUT).startsWith('..')) throw new Error('STAGE_OUT debe estar fuera del repo');
  const info = await stage({repo: REPO, out: OUT, quiet: true});
  const files = walk(OUT), top = fs.readdirSync(OUT).sort();
  console.log('     staging: ' + info.files + ' archivos, ' + info.mb + ' MB  (PNG ' + info.png + ' = ' + info.pngMb + ' MB; PNG con gemelo .webp que se conservan: ' + info.pngConGemeloWebp + ' = ' + info.pngConGemeloWebpMb + ' MB)  index: ' + info.indexNotes.join(' ') + '  extra: ' + JSON.stringify(info.extra));
  check('staging: en la raíz solo hay lo de la lista blanca', top.every(n => ['index.html', 'css', 'js', 'assets', 'legal', ...info.extra.map(e => e.split('/')[0])].includes(n)), top);
  check('staging: no viaja nada de las carpetas excluidas', !files.some(f => NEVER.includes(f.split('/')[0])) && !files.some(f => /(^|\/)(node_modules|\.git|\.github)(\/|$)/.test(f)) && !files.some(f => f.startsWith('assets/og/') || f.endsWith('.map')));
  check('staging: no viajan sw.js, manifest, instalar.html, crystal-wars.html, package.json ni los .md de la raíz', !['sw.js', 'manifest.webmanifest', 'instalar.html', 'crystal-wars.html', 'package.json', 'render.yaml', 'lan.sh', 'lan.bat'].some(n => fs.existsSync(path.join(OUT, n))) && !top.some(n => n.endsWith('.md')));
  const html = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8'), refs = localRefs(html), miss = refs.filter(r => !fs.existsSync(path.join(OUT, r)));
  check('staging: todo archivo referenciado por index.html existe (' + refs.length + ' referencias)', refs.length > 400 && miss.length === 0, miss.slice(0, 10));
  const srcRefs = localRefs(fs.readFileSync(path.join(REPO, 'index.html'), 'utf8')).filter(r => /\.(js|css)$/.test(r));
  check('staging: index.html conserva todos los <script> y hojas de estilo del original, en el mismo orden', JSON.stringify(refs.filter(r => /\.(js|css)$/.test(r))) === JSON.stringify(srcRefs), {original: srcRefs.length});
  check('staging: sin manifest, sin enlace de instalación, sin metadatos de la web', !/rel="manifest"|instalar\.html"|property="og:|name="twitter:|rel="canonical"/.test(html) && html.includes('__HORDA_DESKTOP_BUILD__'));
  // url() de las hojas de estilo que apuntan a archivos del juego
  let cssRefs = 0; const cssMiss = [];
  for (const f of files.filter(f => f.endsWith('.css'))) for (const m of fs.readFileSync(path.join(OUT, f), 'utf8').matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    const u = m[1].trim(); if (/^(data:|https?:|#|about:)/.test(u)) continue; cssRefs++;
    const rel = path.posix.normalize(path.posix.join(path.posix.dirname(f), u.replace(/[?#].*$/, ''))); if (!fs.existsSync(path.join(OUT, rel))) cssMiss.push(f + ' -> ' + u);
  }
  check('staging: los url() de las hojas de estilo existen (' + cssRefs + ')', cssMiss.length === 0, cssMiss.slice(0, 10));
  check('staging: cada PNG de ASSET_WEBP viaja con su .webp y su .png', (() => { const list = [...fs.readFileSync(path.join(OUT, 'js/assets/asset-webp.js'), 'utf8').matchAll(/"(assets\/[^"]+\.png)"/g)].map(m => m[1]); return list.length > 1000 && list.every(p => fs.existsSync(path.join(OUT, p)) && fs.existsSync(path.join(OUT, p.slice(0, -4) + '.webp'))); })());

  // servidor estático local SOLO del staging; anota cada 404
  const TYPES = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.md': 'text/plain; charset=utf-8'};
  const notFound = [];
  server = http.createServer((req, res) => {
    let p; try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (e) { res.writeHead(400).end(); return; }
    if (p.endsWith('/')) p += 'index.html';
    const file = path.resolve(OUT, '.' + path.posix.normalize(p));
    if (!file.startsWith(OUT + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { notFound.push(p); res.writeHead(404).end('no'); return; }
    res.writeHead(200, {'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store'}); fs.createReadStream(file).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const url = 'http://127.0.0.1:' + server.address().port;
  browser = await H.launch();
  const ctx = await browser.newContext({viewport: {width: 1280, height: 720}});
  await ctx.addInitScript(() => { window.__lazyAssets = true; });   // dos tandas, como lo ve un jugador (las pruebas automáticas cargan todo junto)
  const page = await ctx.newPage(); const errors = [], failed = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('requestfailed', r => { if (r.url().startsWith(url)) failed.push(r.url().slice(url.length) + ' ' + (r.failure() || {}).errorText); });
  page.on('response', r => { if (r.url().startsWith(url) && r.status() >= 400) failed.push(r.status() + ' ' + r.url().slice(url.length)); });
  await H.goto(page, url + '/index.html', {timeout: LOAD_MS});
  await page.waitForFunction(() => { const b = document.getElementById('title-continue-btn'); return b && !b.disabled && typeof state !== 'undefined' && state === 'title'; }, null, {timeout: LOAD_MS});
  const st = await page.evaluate(() => ({state, desktop: window.__HORDA_DESKTOP_BUILD__ === true, scripts: document.scripts.length, core: ASSET_LOAD.core.total, dev: typeof laHordaDevMode === 'function' ? laHordaDevMode() : null}));
  check('carga: el staging llega al menú del título con el botón habilitado', st.state === 'title' && st.desktop, st);
  await page.waitForFunction(() => assetsAllReady(), null, {timeout: LOAD_MS});
  // todo el arte del manifiesto (todos los grupos), para que un archivo faltante aparezca como 404
  await page.evaluate(() => { for (const g in ASSET_LOAD.groups) assetsStartGroup(g); });
  { // son ~1.400 imágenes: se espera mientras haya avance (corte si pasan 120 s sin que termine ninguna, tope 15 min)
    let last = -1, lastT = Date.now(), t0 = Date.now(), pr = null;
    for (;;) {
      pr = await page.evaluate(() => ({done: Object.values(ASSET_LOAD.groups).reduce((n, o) => n + Math.min(o.done, o.total), 0), total: Object.values(ASSET_LOAD.groups).reduce((n, o) => n + o.total, 0), pend: Object.entries(ASSET_LOAD.groups).filter(([g, o]) => o.done < o.total).map(([g, o]) => g + ' ' + o.done + '/' + o.total).slice(0, 8)}));
      if (pr.done >= pr.total) break;
      if (pr.done !== last) { last = pr.done; lastT = Date.now(); }
      if (Date.now() - lastT > 120000 || Date.now() - t0 > 900000) break;
      await H.sleep(2000);
    }
    check('carga: terminó de pedir todo el arte del manifiesto', pr.done >= pr.total, pr);
  }
  const art = await page.evaluate(() => ({rest: ASSET_LOAD.rest.total, core: ASSET_LOAD.core.total, imgs: performance.getEntriesByType('resource').length}));
  await page.click('#title-continue-btn'); await H.sleep(1500);
  const after = await page.evaluate(() => state);
  console.log('     carga: ' + st.scripts + ' scripts, arte pedido ' + (art.core + art.rest) + ' imágenes del manifiesto; tras tocar el botón del título: state="' + after + '"');
  check('carga: tocar el botón del título avanza de pantalla', after !== 'title', {after});
  check('carga: sin errores de página', errors.length === 0, errors.slice(0, 5));
  check('carga: sin 404 ni pedidos fallidos', notFound.length === 0 && failed.length === 0, {notFound: notFound.slice(0, 10), failed: failed.slice(0, 10)});
  console.log('\nTAMAÑO DEL STAGING: ' + info.mb + ' MB en ' + info.files + ' archivos');
} catch (e) { fails.push('excepción: ' + e.message); console.error(e); }
finally {
  if (browser) await browser.close().catch(() => {});
  if (server) await new Promise(r => server.close(r));
  fs.rmSync(OUT, {recursive: true, force: true});
  console.log('staging temporal borrado: ' + !fs.existsSync(OUT));
}
if (fails.length) { console.error('\nFALLARON ' + fails.length + ': ' + fails.join(' | ')); process.exit(1); }
console.log('\nOK: todas las comprobaciones pasan');
