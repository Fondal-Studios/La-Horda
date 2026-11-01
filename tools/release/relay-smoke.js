#!/usr/bin/env node
'use strict';
/* HUMO DEL RELAY: comprueba que un relay responde y es compatible con ESTE árbol de código. No despliega ni escribe en ningún lado.
 *   node tools/release/relay-smoke.js --local                      levanta server/relay.js en un puerto libre (datos temporales) y lo prueba: valida este script
 *   node tools/release/relay-smoke.js --url wss://host/ruta         prueba un relay existente (solo lectura)
 *   node tools/release/relay-smoke.js --url ... --create-room       además crea una sala privada de prueba (se cierra al irse el anfitrión o por inactividad; deja rastro breve en el registro del relay)
 *   node tools/release/relay-smoke.js --url ... --origin https://fondalstudios.com   origen que presenta el WebSocket (por omisión el de fondalstudios.com)
 * Comprobaciones: (1) GET /health y su línea de estado (protocolo, salas, almacén de cuentas) · (2) el protocolo del relay coincide con
 * NET_PROTOCOL del cliente de este árbol · (3) GET /api/rooms con CORS para el origen indicado · (4) GET /api/health (cuentas: store/persistent)
 * · (5) el WebSocket abre y responde a {t:"rooms"} · (6) rechaza orígenes no permitidos · (7) opcional: crear una sala privada.
 * Códigos: 0 todo bien (puede haber WARN) · 1 algo falló · 2 uso/arranque.
 * Lo que NO puede verificar desde fuera: qué versión del código corre el relay (no la publica; ver docs/operacion/GUIA_SOCIO_RELAY.md). */
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), net = require('node:net'), cp = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const a = process.argv.slice(2), has = k => a.includes(k), val = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
let WS; try { WS = require(path.join(ROOT, 'server/node_modules/ws')); } catch (e) { try { WS = require('ws'); } catch (e2) { console.error('Falta el módulo ws: cd server && npm ci'); process.exit(2); } }
const clientSrc = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const CLIENT_PROTOCOL = +(/const NET_PROTOCOL\s*=\s*(\d+)/.exec(clientSrc('js/net/net-core.js')) || [])[1];
const CLIENT_URL = (/serverUrl:\s*"([^"]+)"/.exec(clientSrc('js/net/net-config.js')) || [])[1];
const CLIENT_BUILD = (/build:\s*"([^"]+)"/.exec(clientSrc('js/net/net-config.js')) || [])[1];
let bad = 0, warn = 0;
const ok = (n, x) => console.log('PASS ' + n + (x ? '  ' + x : '')), no = (n, x) => { bad++; console.log('FAIL ' + n + (x ? '  ' + x : '')); }, wr = (n, x) => { warn++; console.log('WARN ' + n + (x ? '  ' + x : '')); };
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function http(url, origin) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), 8000);
  try { const r = await fetch(url, { signal: c.signal, headers: origin ? { origin } : {} }); const txt = await r.text(); return { status: r.status, headers: r.headers, text: txt }; }
  catch (e) { return { error: String(e.message || e) }; } finally { clearTimeout(t); }
}
function wsOnce(url, origin, onOpen, wait) {
  return new Promise(res => {
    const out = { opened: false, msgs: [] }; let ws;
    try { ws = new WS(url, { headers: origin ? { origin } : {} }); } catch (e) { return res({ ...out, error: String(e.message) }); }
    const t = setTimeout(() => { try { ws.terminate(); } catch (e) {} res(out); }, wait || 6000);
    ws.on('open', () => { out.opened = true; onOpen(ws, out); });
    ws.on('message', b => { try { out.msgs.push(JSON.parse(b.toString())); } catch (e) {} });
    ws.on('close', (code, why) => { out.closed = code; out.why = String(why || ''); clearTimeout(t); res(out); });
    ws.on('error', e => { out.error = String(e.message); });
  });
}
(async () => {
  let child = null, tmp = null, base = val('--url', ''), origin = val('--origin', 'https://fondalstudios.com');
  if (has('--local')) {
    const port = await freePort(); tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'relay-smoke-'));
    child = cp.spawn(process.execPath, [path.join(ROOT, 'server/relay.js')], { cwd: path.join(ROOT, 'server'), env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', DATA_DIR: tmp, ALLOWED_ORIGINS: '' }, stdio: 'ignore' });
    base = 'ws://127.0.0.1:' + port;
    for (let i = 0; i < 50; i++) { const r = await http('http://127.0.0.1:' + port + '/health'); if (r.status === 200) break; await sleep(150); }
  }
  if (!base) { console.error('Indicá --url wss://... o --local'); process.exit(2); }
  const h = base.replace(/^ws/, 'http').replace(/\/+$/, '');
  console.log(`# relay: ${base}\n# cliente de este árbol: protocolo ${CLIENT_PROTOCOL}, build "${CLIENT_BUILD}", servidor oficial configurado ${CLIENT_URL}\n`);
  try {
    const hl = await http(h + '/health');
    if (hl.error) no('GET /health responde', hl.error); else if (hl.status !== 200) no('GET /health responde 200', 'recibió ' + hl.status); else {
      ok('GET /health responde 200'); const m = /protocolo (\d+) · salas (\d+)/.exec(hl.text);
      if (!m) no('la línea de estado del relay tiene el formato esperado', hl.text.split('\n')[0].slice(0, 100));
      else { ok('la línea de estado tiene el formato esperado', `protocolo ${m[1]}, ${m[2]} sala(s)`); +m[1] === CLIENT_PROTOCOL ? ok('el protocolo del relay coincide con el del cliente') : no('el protocolo del relay NO coincide con el del cliente', `relay ${m[1]} vs cliente ${CLIENT_PROTOCOL}: nadie podría crear ni unirse a salas`); }
      const acc = hl.text.split('\n')[1] || ''; /ERROR/.test(acc) ? no('almacén de cuentas', acc) : /sin DATABASE_URL|ARCHIVO EN DISCO \(/.test(acc) ? wr('almacén de cuentas NO persistente: las cuentas se pierden al reiniciar', acc.slice(0, 120)) : ok('almacén de cuentas', acc.slice(0, 120));
    }
    const rm = await http(h + '/api/rooms?build=' + encodeURIComponent(CLIENT_BUILD || ''), origin);
    if (rm.error) no('GET /api/rooms responde', rm.error); else if (rm.status === 200) {
      let j = null; try { j = JSON.parse(rm.text); } catch (e) {}
      j && Array.isArray(j.rooms) ? ok('GET /api/rooms devuelve la lista', `${j.rooms.length} sala(s) pública(s) de este build`) : no('GET /api/rooms devuelve {rooms:[]}', rm.text.slice(0, 80));
      const acao = rm.headers.get('access-control-allow-origin'); acao === origin || acao === '*' ? ok('CORS acepta el origen ' + origin, acao) : no('CORS NO acepta el origen ' + origin, String(acao));
    } else no('GET /api/rooms responde 200', 'recibió ' + rm.status + (rm.status === 403 ? ' (¿origen no permitido?)' : ''));
    const ah = await http(h + '/api/health', origin);
    if (ah.status === 200) { let j = {}; try { j = JSON.parse(ah.text); } catch (e) {} ok('GET /api/health (cuentas)', `store=${j.store} persistent=${j.persistent} status=${j.status}`); if (j.persistent === false) wr('las cuentas están en un almacén NO persistente', j.warning ? String(j.warning).slice(0, 100) : ''); }
    else wr('GET /api/health no responde 200', ah.error || String(ah.status));
    const w = await wsOnce(base, origin, ws => ws.send(JSON.stringify({ t: 'rooms', build: CLIENT_BUILD })), 5000);
    if (!w.opened) no('el WebSocket abre', w.error || 'no abrió'); else {
      ok('el WebSocket abre'); const r = w.msgs.find(m => m.t === 'rooms');
      r ? ok('el relay responde a {t:"rooms"}', `${(r.list || []).length} sala(s)`) : w.msgs.find(m => m.t === 'error' && m.code === 'ORIGIN') ? no('el relay rechaza el origen ' + origin, 'ALLOWED_ORIGINS') : no('el relay responde a {t:"rooms"}', 'sin respuesta en 5 s');
    }
    const bad2 = await wsOnce(base, 'https://origen-no-permitido.invalid', ws => ws.send(JSON.stringify({ t: 'rooms' })), 3000);
    bad2.msgs.some(m => m.t === 'error' && m.code === 'ORIGIN') || bad2.closed === 1008 ? ok('rechaza orígenes no permitidos (ALLOWED_ORIGINS activo)') : wr('acepta cualquier origen (ALLOWED_ORIGINS vacío)', 'en producción conviene restringirlo');
    if (has('--create-room')) {
      const w2 = await wsOnce(base, origin, ws => ws.send(JSON.stringify({ t: 'create', protocol: CLIENT_PROTOCOL, build: CLIENT_BUILD, arena: 'bosque', champ: 'tanque', level: 1, name: 'humo-relay', clientId: 'smoke' + Date.now(), public: false })), 4000);
      const room = w2.msgs.find(m => m.t === 'joined' && m.host && m.room && m.room.code);
      room ? ok('crear una sala privada funciona', 'código ' + room.room.code) : no('crear una sala privada funciona', JSON.stringify(w2.msgs.slice(0, 2)).slice(0, 160));
    } else console.log('INFO no se creó ninguna sala (usá --create-room para probarlo)');
  } finally { if (child) { child.kill(); } if (tmp) fs.rmSync(tmp, { recursive: true, force: true }); }
  console.log(`\n${bad ? 'FALLÓ' : 'OK'}: ${bad} fallo(s), ${warn} aviso(s)`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
