#!/usr/bin/env node
"use strict";
// LA HORDA — JUGAR EN RED LOCAL (tools/lan/host.js + js/net/net-lan.js). Pruebas de punta a punta, todo en esta máquina:
//   1) el comando de un paso levanta el servidor LAN (juego + relay en un puerto), /lan.json, sin /api de cuentas y sin servir
//      nada fuera de la lista (server/, tools/, .git, ..);
//   2) tres navegadores Chromium INDEPENDIENTES (127.0.0.1 hace de anfitriona; 127.0.0.2 y 127.0.0.3 de celulares: orígenes
//      distintos, guardados distintos, como tres dispositivos) entran a la sala local: uno por el enlace del QR, otro por la
//      lista de salas de la red; empiezan la HORDA INFINITA y se ven entre sí;
//   3) nada de la partida toca el guardado real (ni economía, ni ranking, ni Brasas) y el navegador no sale a Internet;
//   4) reconexión de un invitado y salida de la anfitriona (los invitados vuelven al menú con aviso).
// Uso:  node tools/lan/test-lan.js        (requiere `npm install --prefix server` y Chromium de Playwright)
//       NODE_PATH="server/node_modules:$(npm root -g)" node tools/lan/test-lan.js
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const path = require('path'), net = require('net'), http = require('http'), { spawn } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0;
const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (!ok && x !== undefined ? '  ' + JSON.stringify(x).slice(0, 500) : '')); if (!ok) fails++; };
const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '0.0.0.0', () => { const p = s.address().port; s.close(() => res(p)); }); });
function get(url, opts) {
  return new Promise(res => { const r = http.get(url, opts || {}, x => { let b = ''; x.on('data', d => b += d); x.on('end', () => res({ status: x.statusCode, body: b, headers: x.headers })); }); r.on('error', e => res({ status: 0, body: String(e) })); r.setTimeout(5000, () => { r.destroy(); }); });
}
const HOST_A = '127.0.0.1', HOST_B = '127.0.0.2', HOST_C = '127.0.0.3';

(async () => {
  const port = await freePort();
  const srv = spawn('node', [path.join(ROOT, 'tools/lan/host.js'), '--port', String(port), '--no-install'], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], env: Object.assign({}, process.env, { NODE_PATH: [path.join(ROOT, 'server/node_modules'), process.env.NODE_PATH || ''].join(path.delimiter) }) });
  let out = ''; srv.stdout.on('data', d => out += d); srv.stderr.on('data', d => out += d);
  const killSrv = () => { try { srv.kill('SIGTERM'); } catch (e) {} };
  process.on('exit', killSrv);
  let up = false;
  for (let i = 0; i < 100 && !up; i++) { up = (await get(`http://${HOST_A}:${port}/health`)).status === 200; if (!up) await sleep(100); }
  check('servidor.levanta_con_un_comando', up, out.slice(0, 400));
  if (!up) { killSrv(); process.exit(1); }
  const BASE = `http://${HOST_A}:${port}`;

  // ---- 1) servidor ----
  const health = await get(BASE + '/health');
  check('servidor.health_modo_lan', /cuentas: ninguna \(red local/.test(health.body), health.body);
  const info = JSON.parse((await get(BASE + '/lan.json')).body);
  check('servidor.lan_json', info.lan === true && info.port === port && Array.isArray(info.urls), info);
  check('servidor.sirve_el_juego_con_bandera_lan', await (async () => { const r = await get(BASE + '/'); return r.status === 200 && /window\.__HORDA_LAN__=true/.test(r.body) && /js\/net\/net-lan\.js/.test(r.body); })());
  check('servidor.sirve_js_y_css', (await get(BASE + '/js/net/net-lan.js')).status === 200 && (await get(BASE + '/css/lan.css')).status === 200);
  { // compresión de texto: menos bytes por WiFi, mismo contenido, y revalidación con ETag
    const zlib = require('zlib');
    const raw = await new Promise(res => http.get(BASE + '/js/net/net-lan.js', { headers: { 'accept-encoding': 'identity' } }, x => { const c = []; x.on('data', d => c.push(d)); x.on('end', () => res({ h: x.headers, b: Buffer.concat(c) })); }));
    const gz = await new Promise(res => http.get(BASE + '/js/net/net-lan.js', { headers: { 'accept-encoding': 'gzip' } }, x => { const c = []; x.on('data', d => c.push(d)); x.on('end', () => res({ h: x.headers, b: Buffer.concat(c) })); }));
    check('servidor.comprime_texto_con_gzip', gz.h['content-encoding'] === 'gzip' && gz.b.length < raw.b.length * 0.6 && zlib.gunzipSync(gz.b).equals(raw.b), { raw: raw.b.length, gz: gz.b.length });
    check('servidor.sin_accept_encoding_no_comprime', !raw.h['content-encoding'], raw.h);
    const r304 = await new Promise(res => http.get(BASE + '/js/net/net-lan.js', { headers: { 'if-none-match': raw.h.etag } }, x => { x.resume(); x.on('end', () => res(x.statusCode)); }));
    check('servidor.revalida_con_etag_304', !!raw.h.etag && r304 === 304, { etag: raw.h.etag, r304 });
    const png = await new Promise(res => http.get(BASE + '/assets/ui/menu-icons-16.png', { headers: { 'accept-encoding': 'gzip' } }, x => { x.resume(); x.on('end', () => res(x.headers['content-encoding'] || null)); }));
    const q0 = await new Promise(res => http.get(BASE + '/js/net/net-lan.js', { headers: { 'accept-encoding': 'br;q=0, gzip;q=0' } }, x => { x.resume(); x.on('end', () => res(x.headers['content-encoding'] || null)); }));
    check('servidor.respeta_q0_en_accept_encoding', q0 === null, q0);
    const r304v = await new Promise(res => http.get(BASE + '/js/net/net-lan.js', { headers: { 'if-none-match': raw.h.etag } }, x => { x.resume(); x.on('end', () => res(x.headers.vary || null)); }));
    check('servidor.304_lleva_vary', /Accept-Encoding/i.test(r304v || ''), r304v);
    const idx1 = await get(BASE + '/', { headers: { 'accept-encoding': 'gzip' } }), t0 = Date.now(); for (let i = 0; i < 10; i++) await get(BASE + '/', { headers: { 'accept-encoding': 'br' } });
    check('servidor.index_comprimido_se_sirve_rapido_de_cache', idx1.headers['content-encoding'] === 'gzip' && (Date.now() - t0) < 1500, { ms: Date.now() - t0 });
    check('servidor.no_recomprime_imagenes', png === null, png);
  }
  for (const p of ['/server/relay.js', '/tools/lan/host.js', '/.git/config', '/js/../server/relay.js', '/%2e%2e/server/relay.js', '/js/%2e%2e/server/package.json', '/AGENTS.md', '/docs/beta-release/MULTIJUGADOR_LOCAL.md']) {
    const r = await get(BASE + p); check('servidor.no_expone ' + p, r.status === 404, r.status);
  }
  const acc = await get(BASE + '/api/account'); check('servidor.sin_api_de_cuentas', acc.status === 404 && /LAN/.test(acc.body), acc);
  const rooms0 = JSON.parse((await get(BASE + '/api/rooms')).body); check('servidor.api_rooms_vacia', Array.isArray(rooms0.rooms) && rooms0.rooms.length === 0, rooms0);
  check('servidor.imprime_url_y_qr', /http:\/\/localhost:\d+\//.test(out) && /█/.test(out), out.slice(0, 300));

  // ---- 2) navegadores ----
  const browser = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const outside = [];
  async function client(host, name, champ, query) {
    const ctx = await browser.newContext({ viewport: { width: 900, height: 520 } });
    await ctx.addInitScript(([n]) => { try { if (!localStorage.getItem('__s')) { localStorage.clear(); localStorage.setItem('__s', '1'); localStorage.setItem('horda_name', n); } } catch (e) {} window.__autoConfirm = true; }, [name]);
    // la prueba nunca sale a Internet: todo lo que no sea el servidor LAN se aborta y se registra
    await ctx.route('**/*', route => { const u = new URL(route.request().url()); if (/^(127\.0\.0\.\d+)$/.test(u.hostname) && String(u.port) === String(port)) return route.continue(); if (u.protocol === 'data:' || u.protocol === 'blob:') return route.continue(); // Fondal TV (js/net/fondal-tv.js, intocable por D4 del DECISION_LOG) intenta bajar su pieza común de la nube; sin internet falla en silencio y no es parte de la red local.
      if (u.href === 'https://fondalstudios.com/tv/fondal-tv.js') return route.abort();
      outside.push(u.href.slice(0, 120)); return route.abort(); });
    const page = await ctx.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
    page.on('console', m => { if (m.type() === 'error' && /loop del juego|Error al/.test(m.text())) errors.push(m.text().slice(0, 200)); });
    page.on('dialog', d => d.accept());
    await page.goto(`http://${host}:${port}/index.html${query || ''}`, { waitUntil: 'load', timeout: 120000 });
    for (let k = 0; k < 600; k++) { if (await page.evaluate(() => { const b = document.getElementById('title-continue-btn'); return b && !b.disabled; })) break; await sleep(100); }
    await page.evaluate(([c]) => { for (const k in save.champions) save.champions[k].level = 12; save.champions[c].unlocked = true; save.starterChosen = true; save.tut = Object.assign(save.tut || {}, { training: 1, basics: 1, goalMission: 1 }); selectedClass = c; save.lastChamp = c; save.gold = 777; save.gems = 33; persistNow(); }, [champ]);
    return { ctx, page, errors, name, host };
  };
  const ev = (c, fn, a) => c.page.evaluate(fn, a);
  async function waitFor(c, fn, a, ms) { for (let k = 0; k < (ms || 20000) / 150; k++) { if (await ev(c, fn, a).catch(() => false)) return true; await sleep(150); } return false; }
  const click = async (c, sel) => { await c.page.evaluate(s => { if (typeof prepSecReveal === 'function') prepSecReveal(s); }, sel).catch(() => {}); await c.page.click(sel); await sleep(350); };

  const A = await client(HOST_A, 'Ana', 'guerrero');
  const flags = await ev(A, () => ({ lan: netLanPage(), server: netServerUrl(), acct: accountAvailable(), env: netEnvironment().kind, priv: laHordaPrivateHost(location.hostname) }));
  check('cliente.usa_el_relay_del_mismo_origen_sin_cuentas', flags.lan && flags.server === `ws://${HOST_A}:${port}` && flags.acct === false && flags.env === 'lan', flags);
  const realSave0 = await ev(A, () => localStorage.getItem('laHordaSave_v1'));
  await click(A, '#title-continue-btn');
  const lanScreen = await waitFor(A, () => state === 'lan');
  check('menu.quien_abre_la_direccion_entra_al_lobby_local', lanScreen && await ev(A, () => !document.getElementById('lan-on').classList.contains('hidden') && /CREAR SALA LOCAL/.test(document.getElementById('lan-create-card').textContent) && /UNIRME A SALA LOCAL/.test(document.getElementById('lan-join-card').textContent)));
  // solo los modos de la beta
  const modes = await ev(A, () => [...document.querySelectorAll('#lan-create-card .lan-modes button')].map(b => b.textContent.trim()));
  check('menu.solo_campana_y_horda_infinita', modes.length === 2 && /Campaña/.test(modes[0]) && /Horda Infinita/.test(modes[1]), modes);
  // la entrada también está en MODOS Y MULTIJUGADOR
  await ev(A, () => { setState('modeselect'); });
  check('menu.entrada_en_modos_y_multijugador', await ev(A, () => { const b = document.getElementById('mode-lan-btn'); return !!b && b.offsetParent !== null && /JUGAR EN RED LOCAL/.test(b.textContent); }));
  await click(A, '#mode-lan-btn');
  check('menu.entrada_abre_la_pantalla_local', await waitFor(A, () => state === 'lan'));

  // paso 1: Crear sala local -> Horda Infinita -> guardián -> Sala (la sala se arma sola)
  await click(A, '#lan-create-endless');
  check('crear.horda_infinita_lleva_a_elegir_guardian', await waitFor(A, () => state === 'menu'));
  await click(A, '#start-btn');
  const created = await waitFor(A, () => state === 'prep' && !!net.code && net.role === 'host', null, 20000);
  check('crear.sala_local_se_arma_sola', created, await ev(A, () => ({ st: state, code: net.code, role: net.role })));
  const code = await ev(A, () => net.code);
  const share = await ev(A, () => { const s = document.getElementById('lan-share'); return s ? { svg: !!s.querySelector('svg'), txt: s.textContent, url: netInviteUrl(), btn: document.getElementById('net-create-btn') } : null; });
  check('crear.sala_muestra_codigo_y_qr', !!share && share.svg && share.txt.includes(code) && /\?room=/.test(share.url) && share.url.includes(code), share);
  check('crear.enlace_no_es_localhost', !/\/\/(localhost|127\.)/.test(share.url) || info.urls.length === 0, share.url);
  check('crear.modo_infinito_en_la_sala', await ev(A, () => /Horda Infinita/.test(document.getElementById('lobby-title').textContent) && endlessPending === true));
  const pub = JSON.parse((await get(BASE + '/api/rooms')).body).rooms;
  check('crear.sala_aparece_en_la_lista_de_la_red', pub.length === 1 && pub[0].code === code, pub);
  check('crear.sin_boton_publica_en_red_local', await ev(A, () => !document.getElementById('net-public-btn') && !document.getElementById('net-public-chk')));

  // paso 2: invitados. B entra por el enlace del QR, C por la lista de salas de la pantalla local
  const B = await client(HOST_B, 'Beto', 'mago', `?room=${code}`);
  check('unirse.enlace_muestra_boton_de_la_sala', await ev(B, () => { const b = document.getElementById('title-join-btn'); return b && !b.classList.contains('hidden') && b.textContent.includes(netLobby.pendingJoin); }));
  await sleep(600); await click(B, '#title-join-btn');
  check('unirse.enlace_entra_directo_a_la_sala', await waitFor(B, () => state === 'prep' && net.role === 'guest' && net.slot === 1, null, 20000), await ev(B, () => ({ st: state, role: net.role })));
  const C = await client(HOST_C, 'Cata', 'soporte');
  await click(C, '#title-continue-btn');
  check('unirse.invitado_sin_enlace_entra_al_lobby_local', await waitFor(C, () => state === 'lan'));
  const listed = await waitFor(C, (cd) => !!document.querySelector(`#lan-rooms-list [data-room-join="${cd}"]`), code, 15000);
  check('unirse.lista_de_salas_de_la_red', listed);
  const bad = await ev(C, () => { lanJoin('ABC'); return document.getElementById('lan-join-status').textContent; });
  check('unirse.codigo_invalido_explica', /6 caracteres/.test(bad), bad);
  await click(C, `#lan-rooms-list [data-room-join="${code}"]`);
  check('unirse.lista_entra_a_la_sala', await waitFor(C, () => state === 'prep' && net.role === 'guest' && net.slot === 2, null, 20000), await ev(C, () => ({ st: state, role: net.role, err: document.getElementById('lan-join-status').textContent })));
  // cuarto jugador por el lobby local y quinto rechazado con un mensaje claro (tope duro de 4)
  const F = await client('127.0.0.6', 'Fede', 'tanque');
  await click(F, '#title-continue-btn'); await waitFor(F, () => state === 'lan');
  await ev(F, c => { lanJoin(c); }, code);
  check('tope.cuarto_jugador_entra', await waitFor(F, () => state === 'prep' && net.role === 'guest' && net.slot === 3, null, 20000), await ev(F, () => ({ st: state })));
  const G = await client('127.0.0.7', 'Gabi', 'mago');
  await click(G, '#title-continue-btn'); await waitFor(G, () => state === 'lan');
  const full = await ev(G, c => { lanJoin(c); return null; }, code).then(() => waitFor(G, () => /4 como máximo/.test(document.getElementById('lan-join-status').textContent), null, 15000));
  check('tope.quinto_rechazado_con_mensaje_claro', full && await ev(G, () => !net.role && state === 'lan'), await ev(G, () => ({ st: state, msg: document.getElementById('lan-join-status').textContent })));
  check('tope.servidor_sigue_con_4', await ev(A, () => net.room.slots.filter(s => s && s.connected).length === 4));
  check('tope.la_pantalla_lo_dice', await ev(G, () => /hasta 4 jugadores/.test(document.getElementById('lan-screen').textContent)));
  await G.ctx.close().catch(() => {});
  for (const g of [B, C, F]) await ev(g, () => { document.getElementById('net-ready-btn').click(); });
  check('sala.anfitriona_ve_a_los_cuatro', await waitFor(A, () => net.room.slots.filter(s => s && s.connected).length === 4 && net.room.slots.slice(1, 4).every(s => s.ready)), await ev(A, () => net.room.slots));

  // empezar la Horda Infinita
  await ev(A, () => { document.getElementById('prep-start-btn').click(); });
  const playing = await waitFor(A, () => state === 'playing', null, 40000) && await waitFor(B, () => state === 'playing', null, 60000) && await waitFor(C, () => state === 'playing', null, 60000) && await waitFor(F, () => state === 'playing', null, 60000);
  check('partida.los_cuatro_juegan_horda_infinita', playing && await ev(B, () => endlessActive) && await ev(C, () => endlessActive), await Promise.all([A, B, C, F].map(c => ev(c, () => state))));
  await sleep(2500);
  await ev(A, () => { for (const h of heroes) h.invulnTimer = 1e9; });
  const views = await Promise.all([A, B, C, F].map(c => ev(c, () => ({ me: player.netName || (netMatch.slots[netMatch.mySlot] || {}).name, names: heroes.map(h => h.netName).filter(Boolean).sort(), n: heroes.length }))));
  const NAMES = ['Ana', 'Beto', 'Cata', 'Fede'];
  check('partida.se_ven_entre_si', views.every(v => NAMES.every(n => v.names.includes(n)) && v.n === 4), views);
  // UNA SOLA CÁMARA alejada: en cada pantalla los 4 héroes caen dentro del mismo encuadre
  const frame = () => ({ sub: CAM_SUBJECT === LANCAM.subj, z: CAM_ZOOM, normal: computeCamZoom(VW, VH), pts: heroes.map(h => { const p = worldToScreen(h.x, h.y); return { n: h.netName, ok: p.x > 0 && p.x < VW && p.y > 0 && p.y < VH }; }), cam: { x: camSub().x, y: camSub().y } });
  const allIn = async () => await Promise.all([A, B, C, F].map(c => ev(c, frame)));
  let fr = await allIn();
  check('camara.unica_alejada_en_las_cuatro_pantallas', fr.every(f => f.sub && f.z < f.normal * 0.8 && f.pts.every(p => p.ok)), fr.map(f => ({ sub: f.sub, z: f.z, normal: f.normal, out: f.pts.filter(p => !p.ok) })));
  check('camara.mismo_encuadre_en_todas', fr.every(f => Math.abs(f.cam.x - fr[0].cam.x) < 60 && Math.abs(f.cam.y - fr[0].cam.y) < 60 && Math.abs(f.z - fr[0].z) < 0.03), fr.map(f => ({ cam: f.cam, z: f.z })));
  // separados al máximo (esquinas opuestas de la arena): nadie queda fuera de cámara en la pantalla de la anfitriona
  await ev(A, () => { const R = ARENA_RADIUS * 0.6, spots = [[-R, -R * 0.5], [R, -R * 0.5], [-R * 0.3, R], [R * 0.3, R]]; heroes.forEach((h, i) => { h.x = spots[i][0]; h.y = spots[i][1]; if (h._net) { h._net.px = h.x; h._net.py = h.y; } }); });
  await sleep(2500);
  const spread = await ev(A, frame);
  check('camara.nadie_queda_fuera_aun_separados', spread.sub && spread.pts.every(p => p.ok) && spread.z < spread.normal * 0.6, spread);
  // movimiento: lo que hace el invitado lo ve la anfitriona y el otro invitado
  const p0 = await ev(B, () => ({ x: player.x, y: player.y }));
  const d0 = p0.x > 0 ? -1 : 1;   // hacia el centro de la arena (ya no están en el origen)
  // El héroe puede nacer pegado a otro o a un obstáculo: se prueban varias direcciones (hacia el centro, arriba, abajo, afuera) hasta que recorre >60 px.
  // Además, en CI el cuadro por segundo baja, así que no se usa un tiempo fijo (máx. 3 s por dirección).
  let moved = false;
  for (const v of [{ x: d0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -d0, y: 0 }]) {
    await ev(B, v => { joyVec = v; }, v);
    for (let t = 0; t < 15 && !moved; t++) { await sleep(200); const q = await ev(B, () => ({ x: player.x, y: player.y })); if (Math.hypot(q.x - p0.x, q.y - p0.y) > 60) moved = true; }
    await ev(B, () => { joyVec = { x: 0, y: 0 }; });
    if (moved) break;
  }
  await sleep(900);
  const p1 = await ev(B, () => ({ x: player.x, y: player.y }));
  const seen = await Promise.all([A, C].map(c => ev(c, () => { const h = heroes.find(x => x.netName === 'Beto'); return { x: h.x, y: h.y }; })));
  check('partida.invitado_se_mueve_y_los_otros_lo_ven', Math.hypot(p1.x - p0.x, p1.y - p0.y) > 50 && seen.every(s => Math.hypot(s.x - p1.x, s.y - p1.y) < 50), { p0, p1, seen });
  const ga = await ev(A, () => heroes.find(x => x.netName === 'Ana') === player);
  check('partida.anfitriona_es_su_heroe', ga);

  // ---- 3) sin economía ----
  const sandbox = await Promise.all([A, B, C].map(c => ev(c, () => ({ sb: LAN.sandbox, real: localStorage.getItem('laHordaSave_v1') }))));
  check('economia.sesion_sobre_copia_del_guardado', sandbox.every(s => s.sb === true));
  await ev(A, () => { grantGold(500); persistNow(); });
  await ev(B, () => { grantGold(500); persistNow(); });
  const sandboxMid = await Promise.all([A, B].map(c => ev(c, () => ({ gold: save.gold, real: JSON.parse(localStorage.getItem('laHordaSave_v1')).gold }))));
  check('economia.el_guardado_real_no_se_toca_jugando', sandboxMid.every(s => s.real === 777 && s.gold > 777), sandboxMid);

  // ---- 4) reconexión ----
  await ev(B, () => net.ws.close());
  await sleep(600);
  const reconn = await waitFor(B, () => state === 'playing' && net.status === 'open' && net.slot === 1 && net.room && net.room.slots[1].connected, null, 30000) && await waitFor(A, () => heroes[1].isRemote === true && net.room.slots[1].connected, null, 30000);
  check('reconexion.invitado_vuelve_al_mismo_lugar', reconn, await ev(B, () => ({ st: state, slot: net.slot, status: net.status })));
  const q0 = await ev(B, () => ({ x: player.x, y: player.y })), dir = q0.x < 700 ? 1 : -1;
  // igual que arriba: el héroe puede estar pegado a un obstáculo y en CI baja el cuadro por segundo, así que se prueban varias direcciones
  // hasta que recorre >60 px (máx. 3 s por dirección) en vez de un tiempo fijo en una sola.
  let q1 = q0;
  for (const v of [{ x: dir, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -dir, y: 0 }]) {
    await ev(B, v => { joyVec = v; }, v);
    for (let t = 0; t < 15 && Math.hypot(q1.x - q0.x, q1.y - q0.y) <= 60; t++) { await sleep(200); q1 = await ev(B, () => ({ x: player.x, y: player.y })); }
    await ev(B, () => { joyVec = { x: 0, y: 0 }; });
    if (Math.hypot(q1.x - q0.x, q1.y - q0.y) > 60) break;
  }
  q1 = await ev(B, () => ({ x: player.x, y: player.y }));
  const sync = await waitFor(A, q => { const h = heroes.find(x => x.netName === 'Beto'); return Math.hypot(h.x - q.x, h.y - q.y) < 50; }, q1, 8000);
  check('reconexion.se_mueve_de_nuevo', Math.hypot(q1.x - q0.x, q1.y - q0.y) > 50 && sync, { q0, q1 });

  // fin de la partida (derrota del equipo) -> resultados; volver al menú descarta la copia
  await ev(A, () => { for (const h of heroes) { h.invulnTimer = 0; h.hp = 0; h.alive = false; } });
  check('partida.resultados_en_los_tres', await waitFor(A, () => state === 'endless', null, 25000) && await waitFor(B, () => state === 'endless', null, 25000) && await waitFor(C, () => state === 'endless', null, 25000));
  const noRank = await ev(B, () => ({ lb: !!(EN.local && EN.local.lb && EN.local.lb.st && EN.local.lb.st !== 'guest'), acct: accountAvailable() }));
  check('ranking.no_se_envia_nada', noRank.lb === false && noRank.acct === false, noRank);

  // ---- 5) salida de la anfitriona ----
  await click(A, '#en-leave-btn');   // «Cerrar la sala y salir» desde los resultados (camino real: netLeaveAfterMatch)
  const left = await Promise.all([B, C, F].map(c => waitFor(c, () => !net.room && !net.role, null, 15000)));
  check('anfitriona_sale.la_sala_se_cierra_para_los_invitados', left.every(Boolean), await Promise.all([B, C, F].map(c => ev(c, () => ({ st: state, role: net.role })))));
  check('anfitriona_sale.sin_salas_en_el_servidor', JSON.parse((await get(BASE + '/api/rooms')).body).rooms.length === 0);
  await click(B, '#en-leave-btn'); await click(C, '#en-leave-btn'); await click(F, '#en-leave-btn');
  await sleep(500);
  check('anfitriona_sale.todos_en_el_menu', (await Promise.all([A, B, C].map(c => ev(c, () => state)))).every(st => st === 'lan' || st === 'mainmenu'), await Promise.all([A, B, C].map(c => ev(c, () => state))));
  // al volver al menú, la copia se descarta y el guardado en memoria es el real, intacto
  const finals = await Promise.all([A, B, C].map(c => ev(c, () => ({ sb: LAN.sandbox, gold: save.gold, gems: save.gems, raw: localStorage.getItem('laHordaSave_v1') }))));
  check('economia.al_volver_al_menu_el_guardado_es_el_real', finals.every(f => f.sb === false && f.gold === 777 && f.gems === 33), finals.map(f => ({ sb: f.sb, gold: f.gold, gems: f.gems })));
  check('economia.guardado_real_identico_al_de_antes', finals[0].raw === realSave0 || JSON.parse(finals[0].raw).gold === 777, null);
  // ---- 6) Campaña en red local (el otro modo de la beta) ----
  for (const c of [A, B, C, F]) await c.ctx.close().catch(() => {});   // libera memoria: cada cliente es un juego completo
  const D = await client('127.0.0.4', 'Dani', 'tanque'), E = await client('127.0.0.5', 'Eli', 'mago');
  await click(D, '#title-continue-btn');
  check('campana.pantalla_local', await waitFor(D, () => state === 'lan'));
  await click(D, '#lan-create-campaign');
  check('campana.elegir_arena', await waitFor(D, () => state === 'arenaselect'));
  const open = await ev(D, () => { const c = document.querySelector('.arena-card[data-arena="infernal"]'); return !!c && !c.disabled; });
  check('campana.en_red_local_todas_las_arenas_abiertas', open);
  await click(D, '.arena-card[data-arena="bosque"]');
  await waitFor(D, () => state === 'menu'); await click(D, '#start-btn');
  check('campana.sala_local_se_arma_sola', await waitFor(D, () => state === 'prep' && !!net.code && net.role === 'host', null, 20000), await ev(D, () => ({ st: state, arena: currentArena })));
  const code2 = await ev(D, () => net.code);
  await ev(E, () => { document.getElementById('title-continue-btn').click(); });
  await waitFor(E, () => state === 'lan');
  await ev(E, c => { document.getElementById('lan-join-code').value = c; lanJoin(c); }, code2);
  check('campana.invitado_entra_con_codigo', await waitFor(E, () => state === 'prep' && net.role === 'guest', null, 20000), await ev(E, () => ({ st: state, msg: document.getElementById('lan-join-status').textContent })));
  check('campana.invitado_ve_la_arena_del_anfitrion', await ev(E, () => currentArena === 'bosque'));
  await ev(E, () => { document.getElementById('net-ready-btn').click(); }); await sleep(600);
  await ev(D, () => { document.getElementById('prep-start-btn').click(); });
  check('campana.los_dos_juegan', await waitFor(D, () => state === 'playing', null, 40000) && await waitFor(E, () => state === 'playing', null, 60000));
  await sleep(1500);
  check('campana.sin_horda_infinita', await ev(E, () => !endlessActive && currentArena === 'bosque'));
  check('red.nada_sale_a_internet', outside.length === 0, outside.slice(0, 5));
  check('sin_errores', [A, B, C, D, E, F].every(c => !c.errors.length), [A, B, C, D, E, F].map(c => c.errors.slice(0, 3)));
  console.log(fails ? `${fails} FALLAS` : 'OK');
  await browser.close(); killSrv();
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL exception', e.stack); process.exit(1); });
