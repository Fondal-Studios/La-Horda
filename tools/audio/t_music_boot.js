// Arranque con el reproductor de música por archivos: sin errores de consola, sin pedir NADA de
// assets/audio/music/ al cargar (carga perezosa), y con la biblioteca vacía el juego sigue en música
// procedural tras el primer toque (AU.fileActive falso). Informa los bytes transferidos al inicio.
//   node tools/audio/t_music_boot.js   (levanta un servidor estático en 127.0.0.1:8797)
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const path = require('path'), http = require('http'), fs = require('fs');
const ROOT = path.join(__dirname, '../..'), PORT = 8797;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.ogg': 'audio/ogg' };
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/, '/index.html')); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 300) : '')); if (!ok) fails++; };
(async () => {
  await new Promise(r => srv.listen(PORT, '127.0.0.1', r));
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const pg = await b.newPage(); const errs = [], reqs = []; let bytes = 0;
  pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  pg.on('request', q => reqs.push(q.url())); pg.on('response', async r => { try { bytes += (await r.body()).length; } catch (e) {} });
  await pg.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'load' }); await pg.waitForTimeout(1500);
  const loadBytes = bytes;
  check('no se pide nada de assets/audio/music al cargar', !reqs.some(u => /assets\/audio\/music/.test(u)));
  check('MusicFiles y MUSIC_MAP definidos', await pg.evaluate(() => typeof MusicFiles === 'object' && MusicFiles && typeof MUSIC_MAP === 'object'));
  await pg.evaluate(() => { startMusic(); setMusicMode('menu'); setMusicMode('wave', 1); });
  await pg.waitForTimeout(2500);
  const st = await pg.evaluate(() => ({ fileActive: !!AU.fileActive, mf: MusicFiles.state(), proc: M.mode }));
  check('biblioteca vacía: sigue la procedural, sin archivo activo', !st.fileActive && (!st.mf || !st.mf.active), st);
  check('sin errores de consola/página', errs.length === 0, errs);
  console.log('INFO bytes transferidos al cargar: ' + loadBytes + ' (' + reqs.length + ' pedidos)');
  await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
