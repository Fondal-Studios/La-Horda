// SERVIDORES NO OFICIALES (?server= / ?api= / horda_server) — js/net/net-core.js netGateServer.
//   node tools/regression/t_server_param.js
// Variables: SE_BASE_URL (servidor estático del repo ya levantado), CHROMIUM_PATH (default /opt/pw-browsers/chromium),
//            PLAYWRIGHT_MODULE. Sin SE_BASE_URL levanta su propio python3 http.server en un puerto libre y mata solo ese PID.
// Nunca sale a Internet: toda petición a un host que no sea el servidor de prueba se aborta (y se registra).
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const path = require('path'), net = require('net'), http = require('http'), { spawn } = require('child_process');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined && !ok ? '  ' + JSON.stringify(x) : '')); if (!ok) fails++; };
const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
function ping(url) { return new Promise(res => { const r = http.get(url, x => { x.resume(); res(x.statusCode < 500); }); r.on('error', () => res(false)); r.setTimeout(1500, () => { r.destroy(); res(false); }); }); }
const OFFICIAL = 'wss://fondalstudios.com/la-horda/red', OFFICIAL_API = 'https://fondalstudios.com/la-horda/red';

(async () => {
  let srv = null, BASE = process.env.SE_BASE_URL;
  if (!BASE) {
    const port = await freePort(); BASE = `http://127.0.0.1:${port}`;
    srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: path.resolve(__dirname, '..', '..'), stdio: 'ignore' });
    console.log('servidor propio pid', srv.pid, BASE);
    for (let i = 0; i < 50 && !(await ping(BASE + '/index.html')); i++) await sleep(100);
  }
  const ownHost = new URL(BASE).host;
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  try {
    // query: texto de la URL; ls: localStorage previo. Devuelve la página lista y lo que salió a la red.
    // (reintenta: en máquinas muy cargadas Chromium a veces cierra la página en la carga)
    async function open(query, ls) { for (let i = 0; ; i++) { try { return await open1(query, ls); } catch (e) { if (i >= 2) throw e; console.log('reintento por', String(e.message).split('\n')[0]); } } }
    async function open1(query, ls) {
      const ctx = await browser.newContext({ viewport: { width: 900, height: 500 } });
      const out = { hosts: [], ws: [] };
      await ctx.route('**/*', route => { const u = new URL(route.request().url()); if (u.host === ownHost || u.protocol === 'data:' || u.protocol === 'blob:') return route.continue(); out.hosts.push(u.host); return route.abort(); });
      await ctx.addInitScript(([l]) => {
        try { if (l && !sessionStorage.getItem('__seeded')) { sessionStorage.setItem('__seeded', '1'); for (const k in l) localStorage.setItem(k, l[k]); } } catch (e) {}
        window.__ws = []; const W = window.WebSocket;
        window.WebSocket = function (u, p) { window.__ws.push(String(u)); return new W(u, p); }; window.WebSocket.prototype = W.prototype;
        for (const k of ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']) window.WebSocket[k] = W[k];
      }, [ls || null]);
      const page = await ctx.newPage(); page.setDefaultTimeout(240000); const errs = [];
      page.on('pageerror', e => errs.push(e.message));
      await page.goto(BASE + '/index.html' + query, { waitUntil: 'load', timeout: 120000 });
      await page.waitForFunction(() => typeof netServerUrl === 'function' && typeof ACCOUNT_API_BASE !== 'undefined', null, { timeout: 120000 });
      await sleep(2600); // pasa el despertar del relay (1,5 s) para ver si algo sale hacia el host
      return { ctx, page, out, errs };
    }
    const state = page => page.evaluate(() => ({ url: netServerUrl(), api: ACCOUNT_API_BASE, dlg: !!document.getElementById('net-unofficial'), txt: (document.getElementById('net-unofficial') || {}).innerText || '', search: location.search, ls: localStorage.getItem('horda_server'), ws: window.__ws.slice() }));

    // ---------- uso normal: idéntico, sin aviso ----------
    for (const [label, q, expectUrl, expectApi] of [
      ['sin parámetros (servidor oficial)', '', OFFICIAL, OFFICIAL_API],
      ['?server= el oficial', '?server=' + encodeURIComponent(OFFICIAL), OFFICIAL, OFFICIAL_API],
      ['?server= el servidor anterior de Render', '?server=wss://la-horda-relay.onrender.com', 'wss://la-horda-relay.onrender.com', 'https://la-horda-relay.onrender.com'],
      ['?server= ws://127.0.0.1:9 (desarrollo)', '?server=ws://127.0.0.1:9', 'ws://127.0.0.1:9', 'http://127.0.0.1:9'],
      ['?server= ws://localhost:8787 (desarrollo)', '?server=ws://localhost:8787', 'ws://localhost:8787', 'http://localhost:8787'],
    ]) {
      const { ctx, page, errs } = await open(q); const s = await state(page);
      check(`${label}: se usa tal cual y SIN aviso`, s.url === expectUrl && s.api === expectApi && !s.dlg && errs.length === 0, s);
      await ctx.close();
    }

    // ---------- ?server= no oficial ----------
    for (const evil of ['wss://evil.example.com', 'wss://fondalstudios.com.evil.example.com', 'wss://fondalstudios.com:8443/x', 'wss://la-horda-relay.onrender.com.evil.example.com', 'wss://evil.example.com@fondalstudios.com']) {
      const { ctx, page, out } = await open('?server=' + encodeURIComponent(evil)); const s = await state(page);
      let host; try { host = new URL(evil).host; } catch (e) { host = ''; }
      if (/@/.test(evil)) { check(`${evil}: con credenciales embebidas se rechaza (sin servidor, sin salir a la red)`, s.url === '' && !out.hosts.length, s); await ctx.close(); continue; }
      check(`${evil}: aviso en pantalla y NO se usa (se queda el oficial)`, s.dlg && s.url === OFFICIAL && s.api === OFFICIAL_API, s);
      check(`${evil}: nada salió hacia ese host antes de aceptar`, !out.hosts.some(h => h.includes('evil.example.com') || h === host) && !s.ws.some(w => w.includes(host)), { hosts: out.hosts, ws: s.ws });
      await ctx.close();
    }
    {
      const { ctx, page, out } = await open('?server=wss://evil.example.com'); const s = await state(page);
      check('texto del aviso exacto', s.txt.includes('Este enlace quiere conectarte a un servidor no oficial: evil.example.com. Podrían ver tu usuario y contraseña. ¿Continuar?'), s.txt);
      check('hay botones Continuar y No (44 px de alto)', await page.evaluate(() => { const y = document.getElementById('net-unofficial-yes'), n = document.getElementById('net-unofficial-no'); return !!y && !!n && y.getBoundingClientRect().height >= 44 && n.getBoundingClientRect().height >= 44 && document.activeElement === n; }));
      await page.click('#net-unofficial-no'); await sleep(300);
      const s2 = await state(page);
      check('"No": se cierra, se quita ?server= de la URL y se sigue en el oficial', !s2.dlg && !/server=/.test(s2.search) && s2.url === OFFICIAL && s2.api === OFFICIAL_API, s2);
      check('"No": nunca se tocó el host ajeno', !out.hosts.some(h => h.includes('evil.example.com')) && !s2.ws.some(w => w.includes('evil')), { hosts: out.hosts, ws: s2.ws });
      await ctx.close();
    }
    {
      const { ctx, page } = await open('?server=wss://evil.example.com');
      await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('#net-unofficial-yes')]);
      await page.waitForFunction(() => typeof netServerUrl === 'function' && typeof ACCOUNT_API_BASE !== 'undefined');
      const s = await state(page);
      check('"Continuar": recarga, usa el servidor y no vuelve a preguntar', s.url === 'wss://evil.example.com' && s.api === 'https://evil.example.com' && !s.dlg, s);
      // otra pestaña/contexto nuevo: vuelve a preguntar (la aceptación es solo de esta pestaña)
      const o = await open('?server=wss://evil.example.com'); const s2 = await state(o.page);
      check('la aceptación no se hereda a otra sesión', s2.dlg && s2.url === OFFICIAL, s2);
      await o.ctx.close(); await ctx.close();
    }

    // ---------- horda_server en localStorage ----------
    {
      const { ctx, page, out } = await open('', { horda_server: 'wss://evil.example.com' }); const s = await state(page);
      check('horda_server no oficial: aviso, no se usa, nada sale al host', s.dlg && s.url === OFFICIAL && s.api === OFFICIAL_API && !out.hosts.some(h => h.includes('evil')), s);
      await page.click('#net-unofficial-no'); await sleep(200);
      const s2 = await state(page);
      check('horda_server: "No" borra la clave', !s2.dlg && s2.ls === null && s2.url === OFFICIAL, s2);
      await ctx.close();
    }
    {
      const { ctx, page } = await open('', { horda_server: 'ws://127.0.0.1:9' }); const s = await state(page);
      check('horda_server en localhost: se usa sin aviso', !s.dlg && s.url === 'ws://127.0.0.1:9', s); await ctx.close();
    }

    // ---------- ?api= (la API de cuentas, donde viaja la contraseña) ----------
    {
      const { ctx, page, out } = await open('?api=https://evil.example.com'); const s = await state(page);
      check('?api= no oficial: aviso y la API de cuentas sigue siendo la oficial', s.dlg && s.api === OFFICIAL_API && !out.hosts.some(h => h.includes('evil')), s);
      await ctx.close();
      const o = await open('?api=http://127.0.0.1:9'); const s2 = await state(o.page);
      check('?api= en localhost: sin aviso', !s2.dlg && s2.api === 'http://127.0.0.1:9', s2); await o.ctx.close();
    }
  } finally {
    await browser.close();
    if (srv) srv.kill();
  }
  console.log(fails ? `\n${fails} FALLO(S)` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
