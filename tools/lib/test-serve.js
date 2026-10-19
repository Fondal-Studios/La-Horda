'use strict';
/* Prueba del arnés (tools/lib/serve.js) sin navegador: puerto libre, árbol correcto, 404/403, Range, URL externa por entorno,
 * escala de tiempos y reintento del goto. Uso: node tools/lib/test-serve.js */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os'), H = require('./serve');
let n = 0; const ok = (c, m) => { assert(c, m); n++; console.log('PASS ' + m); };
(async () => {
  const a = await H.startSite({envUrl: [], quiet: true}), b = await H.startSite({envUrl: [], quiet: true});
  ok(a.url !== b.url && /^http:\/\/127\.0\.0\.1:\d+$/.test(a.url), 'dos servidores propios obtienen puertos libres distintos (' + a.url + ', ' + b.url + ')');
  const get = (u, h) => fetch(u, {headers: h});
  const idx = await (await get(a.url + '/index.html')).text();
  ok(idx === fs.readFileSync(path.join(H.ROOT, 'index.html'), 'utf8'), 'sirve el index.html de ESTE árbol');
  ok((await get(a.url + '/?lazy=0')).status === 200 && (await get(a.url + '/js/')).status === 404, 'raíz con query -> index; carpeta sin index -> 404');
  ok((await get(a.url + '/no-existe.js')).status === 404, '404 para lo que no existe');
  const trav = await new Promise(r => require('node:http').get({host: '127.0.0.1', port: new URL(a.url).port, path: '/../../../etc/passwd'}, x => { x.resume(); r(x.statusCode); }));
  ok(trav === 403 || trav === 404, 'no sale de la raíz (HTTP ' + trav + ')');
  const r = await get(a.url + '/index.html', {range: 'bytes=0-9'});
  ok(r.status === 206 && (await r.text()).length === 10, 'Range 206 de 10 bytes');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'horda-serve-')); fs.writeFileSync(path.join(tmp, 'index.html'), 'otro arbol');
  let bad = false; try { const s = await H.startSite({root: tmp, envUrl: [], quiet: true}); ok((await (await get(s.url + '/index.html')).text()) === 'otro arbol', 'root alternativo'); await s.close(); } catch (e) { bad = true; }
  ok(!bad, 'root alternativo con su propio index se sirve y se verifica contra su disco');
  process.env.TEST_FAKE_URL = b.url + '/';
  const ext = await H.startSite({envUrl: ['TEST_FAKE_URL'], quiet: true});
  ok(ext.external && ext.url === b.url, 'URL externa por entorno se respeta (sin barra final) y no levanta servidor');
  process.env.TEST_FAKE_URL = 'http://127.0.0.1:1';
  await assert.rejects(H.startSite({envUrl: ['TEST_FAKE_URL'], quiet: true}), /no responde/);
  ok(true, 'URL externa muerta falla con mensaje claro');
  delete process.env.TEST_TIMEOUT_MS; delete process.env.TEST_TIMEOUT_SCALE;
  ok(H.timeout(1000) === 1000, 'timeout sin entorno = valor pedido');
  process.env.TEST_TIMEOUT_SCALE = '3'; ok(H.timeout(1000) === 3000, 'TEST_TIMEOUT_SCALE multiplica');
  process.env.TEST_TIMEOUT_MS = '777'; ok(H.timeout(1000) === 777, 'TEST_TIMEOUT_MS manda');
  delete process.env.TEST_TIMEOUT_MS; delete process.env.TEST_TIMEOUT_SCALE;
  let calls = 0; const page = {goto: async (u, o) => { calls++; if (calls < 3) throw new Error('net::ERR_CONNECTION_REFUSED'); return {ok: true, o}; }};
  process.env.TEST_GOTO_RETRIES = '2'; const res = await H.goto(page, 'http://x/', {timeout: 5}); delete process.env.TEST_GOTO_RETRIES;
  ok(calls === 3 && res.ok, 'goto reintenta hasta 2 veces y tiene éxito en el tercero');
  let always = 0; process.env.TEST_GOTO_RETRIES = '1';
  await assert.rejects(H.goto({goto: async () => { always++; throw new Error('timeout'); }}, 'http://x/'), /timeout/); delete process.env.TEST_GOTO_RETRIES;
  ok(always === 2, 'goto con 1 reintento falla tras 2 intentos');
  await Promise.all([a.close(), b.close()]);
  fs.rmSync(tmp, {recursive: true, force: true});
  console.log(`OK ${n} comprobaciones`);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
