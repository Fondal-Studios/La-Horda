'use strict';
/* PLATAFORMA PC — prueba con navegador real (teclado y mouse, sin pantalla táctil).
 *  1. Esc vuelve atrás en los menús (misma regla que B del mando), no hace nada en el título, cancela un diálogo sin saltearlo,
 *     y en partida sigue pausando / continuando.
 *  2. Las flechas mueven el foco en los menús y Enter confirma; en un campo de texto no interfieren; en partida mueven al guardián.
 *  3. Refuerzos de nivel: número en la carta, 1 / 2 / 3 eligen, flechas + Enter también; una tecla que venía apretada no elige.
 *  4. F11 y Alt+Enter alternan pantalla completa.
 *  5. Perder el foco de la ventana pausa la partida en solitario y no la online.
 *  6. "Jugar como invitado" queda en localStorage.
 *  7. Salas abiertas: sin servidor a mano dice "Sin conexión: podés jugar en solitario." en menos de ~5 s.
 *  8. Con teclado o mando el joystick táctil no se dibuja; con un toque vuelve.
 *  9. Mando de PlayStation: los botones muestran ✕ ○ □ △.
 *  node tools/ux/test-pc-input.js   (servidor propio en un puerto libre)
 */
const H = require('../lib/serve');
let fails = 0;
const ok = (c, m, x) => { console.log((c ? 'PASS ' : 'FAIL ') + m + (c || x === undefined ? '' : '  ' + JSON.stringify(x).slice(0, 400))); if (!c) fails++; };
const note = (m, x) => console.log('NOTA ' + m + (x === undefined ? '' : '  ' + JSON.stringify(x).slice(0, 400)));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SAVE = { tut: { training: 1 }, starterChosen: true, starterGiftV1: true, starterSkin: 'vale', playtestV1Bonus: true, campaignResetV1: true, campaignResetV2: true };

(async () => {
  const site = await H.startSite(), browser = await H.launch(), errs = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await ctx.addInitScript(s => { try { if (!sessionStorage.getItem('__pc')) { localStorage.setItem('laHordaSave_v1', JSON.stringify(s)); sessionStorage.setItem('__pc', '1'); } } catch (e) {} }, SAVE);
    const page = await ctx.newPage();
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    await page.goto(site.url + '/index.html?lazy=0', { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => { const b = document.getElementById('title-continue-btn'); return typeof setState === 'function' && typeof assetsAllReady === 'function' && assetsAllReady() && b && !b.disabled; }, null, { timeout: 180000 });
    const E = (fn, a) => page.evaluate(fn, a);
    const st = () => E(() => state);
    const waitState = async (s, ms = 8000) => { try { await page.waitForFunction(x => state === x, s, { timeout: ms }); return true; } catch (e) { return false; } };
    const key = async (k, wait = 220) => { await page.keyboard.press(k); await sleep(wait); };
    await E(() => { for (const k of Object.keys(save.champions)) { save.champions[k].unlocked = true; save.champions[k].level = 12; }
      save.arenasCleared = Object.assign(save.arenasCleared || {}, { ciudad: true, fortaleza: true }); selectedClass = 'guerrero'; });

    ok(await E(() => document.body.classList.contains('inp-kb') && DESK.device === 'kb'), '[0] escritorio sin pantalla táctil: el juego arranca en modo teclado (body.inp-kb)');
    ok(await E(() => !!document.querySelector('link[href*="pc-desktop.css"]')), '[0] css/pc-desktop.css está enlazado en index.html');

    /* ---------- 1. Esc ---------- */
    await key('Escape');
    ok(await st() === 'title', '[1] título: Esc no hace nada (no cierra ni cambia de pantalla)', await st());
    const screensToTry = ['codex', 'shop', 'modeselect', 'arenaselect', 'prep', 'menu', 'inventory', 'divina', 'champdetail', 'lan', 'crystalwars', 'account', 'gameover', 'victory'];
    const escRes = {};
    for (const s of screensToTry) {
      const opened = await E(s => { try { if (typeof screens === 'undefined' || !screens[s]) return 'sin-pantalla'; setState('mainmenu'); setState(s); return state; } catch (e) { return 'error: ' + e.message; } }, s);
      if (opened !== s) { escRes[s] = opened; continue; }
      await sleep(250); await key('Escape', 350);
      const after = await st();
      // si quedó un diálogo de confirmación (salir de una sala, etc.), Esc lo respetó: se anota y se cancela
      const dlg = await E(() => typeof GAME_DIALOG !== 'undefined' && !!GAME_DIALOG.cur);
      if (dlg) { await key('Escape', 250); }
      escRes[s] = after + (dlg ? ' (+diálogo)' : '');
    }
    note('[1] Esc por pantalla (pantalla -> estado tras Esc)', escRes);
    for (const s of ['codex', 'shop', 'modeselect', 'arenaselect', 'prep', 'menu', 'inventory']) ok(escRes[s] && escRes[s] !== s && !/^error|sin-pantalla/.test(escRes[s]), '[1] Esc vuelve atrás desde "' + s + '"', escRes[s]);
    ok(escRes.gameover && escRes.gameover !== 'gameover', '[1] resultados (derrota): Esc usa "Volver al menú"', escRes.gameover);
    // misma regla que B del mando: en cada pantalla, lo que hace Esc es lo que hace padBack()
    const same = await E(() => { const out = {}; for (const s of ['codex', 'shop', 'modeselect', 'arenaselect', 'prep', 'menu', 'inventory']) { setState('mainmenu'); setState(s); padBack(); out[s] = state; } return out; });
    ok(['codex', 'shop', 'modeselect', 'arenaselect', 'prep', 'menu', 'inventory'].every(s => same[s] === escRes[s]), '[1] Esc lleva al mismo lugar que B del mando (padBack) en cada pantalla', { esc: escRes, b: same });
    // Opciones: sigue cerrando
    await E(() => { setState('mainmenu'); if (typeof openHubOptions === 'function') openHubOptions(); });
    await sleep(250);
    if (await E(() => _deskOptionsOpen())) { await key('Escape'); ok(await E(() => !_deskOptionsOpen() && state === 'mainmenu'), '[1] Opciones: Esc las cierra y no vuelve además al título'); }
    else note('[1] no se pudo abrir Opciones con openHubOptions(): caso no probado');
    // diálogo de confirmación: Esc cancela (no lo saltea) y no retrocede de pantalla
    const dlgR = await E(async () => { setState('shop'); let res = 'pendiente'; gameConfirm('¿Probar Esc?', { okText: 'Sí', cancelText: 'No' }).then(v => { res = v; }); await new Promise(r => setTimeout(r, 300));
      const open = !!GAME_DIALOG.cur; window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true })); await new Promise(r => setTimeout(r, 300));
      return { open, res, state, still: !!GAME_DIALOG.cur }; });
    ok(dlgR.open && dlgR.res === false && dlgR.state === 'shop' && !dlgR.still, '[1] con un diálogo abierto, Esc lo cancela (respuesta "no") y la pantalla de atrás no se mueve', dlgR);

    /* ---------- 2. flechas en menús ---------- */
    await E(() => setState('mainmenu')); await sleep(300);
    await page.mouse.move(5, 5);
    await key('ArrowDown');
    const f1 = await E(() => ({ shown: PADNAV.shown, el: PADNAV.el ? (PADNAV.el.id || PADNAV.el.className.toString()) : null, box: !!document.querySelector('#pad-focus.on'), dev: DESK.device }));
    ok(f1.shown && f1.el && f1.box && f1.dev === 'kb', '[2] menú principal: la primera flecha muestra el foco sobre un botón', f1);
    const seen = new Set([f1.el]);
    for (const k of ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowDown']) { await key(k, 120); seen.add(await E(() => PADNAV.el ? (PADNAV.el.id || PADNAV.el.className.toString()) : null)); }
    ok(seen.size >= 3, '[2] las flechas mueven el foco entre botones', [...seen]);
    // Enter confirma el botón marcado (un clic real)
    const ent = await E(async () => { setState('shop'); await new Promise(r => setTimeout(r, 250)); const b = document.getElementById('shop-back-btn'); const c = padCandidates().find(x => x.el === b); if (!c) return { err: 'sin candidato' };
      _deskKbNavPlace(c); return { el: PADNAV.el.id, kbNav: DESK.kbNav }; });
    await key('Enter', 350);
    ok(ent.el === 'shop-back-btn' && await st() === 'mainmenu', '[2] Enter activa el botón que tiene el foco de las flechas', { ent, state: await st() });
    // campo de texto: ← → son del campo (no mueven el foco del menú)
    const txt = await E(async () => { setState('modeselect'); await new Promise(r => setTimeout(r, 250)); const i = document.querySelector('#mode-join-name input, input#mode-join-name, #modeselect-screen input[type="text"], #modeselect-screen input:not([type])');
      if (!i || !i.getClientRects().length) return { err: 'sin campo visible' }; padNavHide(); DESK.kbNav = false; i.focus(); i.value = 'abc'; i.setSelectionRange(3, 3); return { id: i.id || i.placeholder }; });
    if (!txt.err) {
      await key('ArrowLeft', 150); await page.keyboard.type('X'); await sleep(150);
      const t2 = await E(() => ({ v: document.activeElement && document.activeElement.value, tag: document.activeElement && document.activeElement.tagName, shown: PADNAV.shown, state }));
      ok(t2.tag === 'INPUT' && t2.v === 'abXc' && !t2.shown && t2.state === 'modeselect', '[2] en un campo de texto las flechas mueven el cursor del texto, no el foco del menú', t2);
      await key('Escape', 250);
      const t3 = await E(() => ({ tag: document.activeElement && document.activeElement.tagName, state }));
      ok(t3.tag !== 'INPUT' && t3.state === 'modeselect', '[2] Esc dentro de un campo de texto lo suelta sin volver atrás', t3);
      await E(() => { const i = document.querySelector('#modeselect-screen input'); if (i) { i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); } });
    } else note('[2] campo de texto no probado', txt);

    /* ---------- 7. salas abiertas sin servidor ---------- */
    const rooms1 = await E(async () => { setState('modeselect'); netRooms.list = null; netRooms.err = ''; const t = performance.now(); await netRefreshRooms(); return { ms: Math.round(performance.now() - t), txt: document.getElementById('mode-rooms-status').textContent }; });
    ok(/Sin conexión: podés jugar en solitario\./.test(rooms1.txt) && rooms1.ms < 4500, '[7] salas abiertas sin servidor: aviso claro en vez de "Buscando salas…"', rooms1);
    // servidor inalcanzable de verdad (puerto cerrado) y servidor que no contesta: tope de ~4 s
    const rooms2 = await E(async () => {
      history.replaceState(null, '', location.pathname + '?lazy=0&server=ws://127.0.0.1:9');
      net.serverOverride = 'ws://127.0.0.1:9'; netRooms.list = null; netRooms.err = ''; netRooms.busy = false;
      const t = performance.now(); await netRefreshRooms(); const dead = { ms: Math.round(performance.now() - t), txt: document.getElementById('mode-rooms-status').textContent };
      // servidor colgado: fetch que nunca contesta (solo respeta el corte)
      const realFetch = window.fetch; window.fetch = (u, o) => new Promise((res, rej) => { if (o && o.signal) o.signal.addEventListener('abort', () => rej(new DOMException('aborted', 'AbortError'))); });
      netCaps.api = true; netCaps.url = netHttpBase(); netCaps.at = performance.now(); netRooms.list = null; netRooms.err = ''; netRooms.busy = false;
      const t2 = performance.now(); const p = netRefreshRooms(); await new Promise(r => setTimeout(r, 1500)); const early = document.getElementById('mode-rooms-status').textContent; await p;
      const hung = { ms: Math.round(performance.now() - t2), early, txt: document.getElementById('mode-rooms-status').textContent };
      window.fetch = realFetch; net.serverOverride = ''; netCaps.api = null; netCaps.url = ''; netRooms.list = null; netRooms.err = ''; history.replaceState(null, '', location.pathname + '?lazy=0');
      return { dead, hung };
    });
    ok(/Sin conexión: podés jugar en solitario\./.test(rooms2.dead.txt) && rooms2.dead.ms < 5500, '[7] servidor inalcanzable: "Sin conexión…" en menos de ~5 s', rooms2.dead);
    ok(/Buscando salas/.test(rooms2.hung.early) && /Sin conexión: podés jugar en solitario\./.test(rooms2.hung.txt) && rooms2.hung.ms >= 3500 && rooms2.hung.ms < 5500, '[7] servidor que no contesta: "Buscando salas…" y a los ~4 s "Sin conexión…" (antes: más de 14 s)', rooms2.hung);

    /* ---------- 6. invitado ---------- */
    const guest = await E(async () => {
      const out = {}; window.__accountTest = true; _acctGuestSet(false);
      out.hasSession = !!acct.session;
      setState('title'); out.gateShown = accountGate(() => {}); await new Promise(r => setTimeout(r, 200));
      const b = document.getElementById('acc-guest-btn'); out.btn = !!b; if (b) b.click(); await new Promise(r => setTimeout(r, 200));
      out.ls = localStorage.getItem('horda_guest_tab'); out.ss = sessionStorage.getItem('horda_guest_tab');
      sessionStorage.removeItem('horda_guest_tab');                    // "otro arranque": la sesión del navegador es nueva, queda solo localStorage
      out.gateAgain = accountGate(() => {});
      window.__accountTest = false; return out;
    });
    if (guest.hasSession) note('[6] hay sesión de cuenta en la prueba: caso de invitado no aplicable', guest);
    else ok(guest.gateShown === true && guest.btn && guest.ls === '1' && guest.gateAgain === false, '[6] "Jugar como invitado" se guarda en localStorage y la pantalla de cuenta no reaparece en el próximo arranque', guest);

    /* ---------- partida ---------- */
    await E(() => setState('title')); await sleep(300);
    await page.click('#bt-play');
    ok(await waitState('playing', 20000), '[·] JUGAR AHORA arranca una partida en solitario', await st());
    await sleep(800);
    await E(() => { window.__god = setInterval(() => { if (window.player || typeof player !== 'undefined') { try { player.stunTimer = 0; player.hp = player.maxHp; } catch (e) {} } }, 60); });

    /* ---------- 8. joystick táctil ---------- */
    const vis8 = () => E(() => { const g = id => getComputedStyle(document.getElementById(id)); const r = document.getElementById('joy-base').getBoundingClientRect();
      return { base: g('joy-base').visibility, knob: g('joy-knob').visibility, basic: g('btn-basic').visibility, basicDisp: g('btn-basic').display, zoneW: Math.round(document.getElementById('joyzone').getBoundingClientRect().width), baseW: Math.round(r.width), cls: document.body.className.match(/inp-\w+/g) }; });
    const j1 = await vis8();
    ok(j1.base === 'hidden' && j1.knob === 'hidden', '[8] teclado: el joystick táctil no se dibuja en partida', j1);
    ok(j1.basic === 'visible' && j1.basicDisp !== 'none' && j1.zoneW > 100 && j1.baseW > 50, '[8] la botonera (recargas + teclas) sigue a la vista y las zonas conservan su tamaño', j1);
    await E(() => deskSetDevice('touch')); const j2 = await vis8();
    ok(j2.base === 'visible' && j2.knob === 'visible', '[8] al pasar a táctil el joystick reaparece (cambio en caliente)', j2);
    await E(() => deskSetDevice('pad')); const j3 = await vis8();
    ok(j3.base === 'hidden' && j3.knob === 'hidden', '[8] mando: tampoco se dibuja', j3);
    await E(() => deskSetDevice('kb'));
    // arrastrar con el mouse sobre la zona: se ve mientras dura
    const jb = await E(() => { const r = document.getElementById('joy-base').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.mouse.move(jb.x, jb.y); await page.mouse.down(); await page.mouse.move(jb.x + 30, jb.y, { steps: 3 }); await sleep(120);
    const j4 = await vis8(); await page.mouse.up(); await sleep(120);
    ok(j4.base === 'visible' && (await vis8()).base === 'hidden', '[8] si se arrastra con el mouse sobre esa zona, el joystick se ve solo mientras dura el arrastre', j4);

    /* ---------- 2b. flechas en partida ---------- */
    const x0 = await E(() => player.x);
    await page.keyboard.down('ArrowRight'); await sleep(450); const mid = await E(() => ({ codes: [...DESK.codes], shown: PADNAV.shown })); await page.keyboard.up('ArrowRight'); await sleep(100);
    ok(mid.codes.includes('ArrowRight') && !mid.shown && await E(x => player.x > x + 5, x0), '[2] en partida las flechas mueven al guardián (no el foco de menús)', { mid, x0, x1: await E(() => player.x) });

    /* ---------- 1b. Esc en partida ---------- */
    await key('Escape', 300); ok(await st() === 'paused', '[1] en partida Esc pausa', await st());
    await key('Escape', 300); ok(await st() === 'playing', '[1] y Esc de nuevo continúa', await st());

    /* ---------- 5. pausa al perder el foco ---------- */
    const b5 = await E(async () => {
      const out = {}; const w = ms => new Promise(r => setTimeout(r, ms));
      window.dispatchEvent(new Event('blur')); await w(60); out.synthetic = state;                       // fabricado: no pausa
      out.trustedRet = autoPauseOnBlur({ type: 'blur', target: window, isTrusted: true }); out.trusted = state;   // blur real de la ventana
      document.getElementById('resume-btn').click(); await w(60); out.resumed = state;
      window.dispatchEvent(new CustomEvent('lahorda-blur')); await w(60); out.desktopEvt = state;         // app de escritorio
      document.getElementById('resume-btn').click(); await w(60);
      const keep = netMatch; netMatch = { fake: true };                                                   // online: no se pausa
      out.onlineRet = autoPauseOnBlur({ type: 'blur', target: window, isTrusted: true }); out.online = state; netMatch = keep;
      setState('mainmenu'); out.menuRet = autoPauseOnBlur({ type: 'blur', target: window, isTrusted: true }); out.menu = state; setState('playing');
      return out;
    });
    ok(b5.trustedRet === true && b5.trusted === 'paused' && b5.resumed === 'playing', '[5] la ventana pierde el foco en solitario: la partida queda en pausa (y se puede continuar)', b5);
    ok(b5.desktopEvt === 'paused', '[5] el aviso de la app de escritorio (lahorda-blur) también pausa', b5);
    ok(b5.onlineRet === false && b5.online === 'playing', '[5] en una partida online NO se pausa', b5);
    ok(b5.synthetic === 'playing' && b5.menu === 'mainmenu' && b5.menuRet === false, '[5] un blur fabricado no pausa, y fuera de la partida no pasa nada', b5);

    /* ---------- 3. refuerzos con teclado ---------- */
    await waitState('playing', 3000);
    const picked = () => E(() => ({ state, lvl: runLevel, n: document.querySelectorAll('#buff-cards .buff-card').length }));
    const openB = () => E(async () => { window.__lvl0 = runLevel; openBuffChoice(); await new Promise(r => setTimeout(r, 30));
      const cards = [...document.querySelectorAll('#buff-cards .buff-card')];
      // una tecla "1" que llega en el mismo instante (venía de la pelea): no elige
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1', code: 'Digit1', bubbles: true, cancelable: true }));
      return { state, endless: typeof endlessOn === 'function' && endlessOn(), n: cards.length, keys: cards.map(c => { const k = c.querySelector('.buff-key'); return k ? k.dataset.n + ':' + getComputedStyle(k, '::before').content : null; }),
        tab: cards.map(c => c.getAttribute('tabindex')), txtHasDigit: cards.some(c => /^\s*[123]\s*$/.test((c.querySelector('.buff-key') || {}).textContent || 'x')), hint: (document.getElementById('buff-key-note') || {}).textContent || '', hintVis: !!(document.getElementById('buff-key-note') && document.getElementById('buff-key-note').getClientRects().length) };
    });
    const o1 = await openB();
    ok(o1.state === 'buff' && o1.n === 3, '[3] se abre la elección de refuerzo con 3 cartas y una tecla inmediata no elige nada', o1);
    ok(o1.keys.join() === '1:"1",2:"2",3:"3"' && o1.tab.every(t => t === '0') && !o1.txtHasDigit, '[3] cada carta muestra su número (1 2 3) y admite foco, sin cambiar el texto de la carta', o1);
    ok(o1.hint === 'Elegí con 1 2 3 o con clic.' && o1.hintVis, '[3] con teclado, la nota dice cómo elegir', o1);
    await sleep(450);
    const names = await E(() => [...document.querySelectorAll('#buff-cards .buff-card .buff-name')].map(e => e.textContent));
    await key('2', 400);
    const p1 = await picked();
    ok(p1.state === 'playing' && p1.lvl === await E(() => window.__lvl0 + 1), '[3] la tecla 2 elige la segunda carta y la partida sigue', { p1, names });
    const o2 = await openB(); await sleep(450);
    await key('ArrowRight', 120); const fa = await E(() => [...document.querySelectorAll('#buff-cards .buff-card')].indexOf(document.activeElement));
    await key('ArrowRight', 120); const fb = await E(() => [...document.querySelectorAll('#buff-cards .buff-card')].indexOf(document.activeElement));
    await key('ArrowLeft', 120); const fc = await E(() => [...document.querySelectorAll('#buff-cards .buff-card')].indexOf(document.activeElement));
    ok(o2.state === 'buff' && fa === 0 && fb === 1 && fc === 0, '[3] las flechas mueven el foco entre las cartas', { fa, fb, fc });
    await key('Enter', 400);
    const p2 = await picked();
    ok(p2.state === 'playing' && p2.lvl === await E(() => window.__lvl0 + 1), '[3] Enter elige la carta con foco', p2);
    const o3 = await openB(); await sleep(450); await key('Numpad3', 400);
    ok(o3.state === 'buff' && (await picked()).state === 'playing', '[3] el 3 del teclado numérico también elige', await picked());

    /* ---------- 9. mando de PlayStation ---------- */
    const ps = await E(() => {
      const pad = (id, mapping) => ({ id, mapping, connected: true, buttons: [{ pressed: false, value: 0 }], axes: [0, 0, 0, 0] });
      const read = () => ({ set: padGlyphSet(), profile: DESK.gp.profile, basic: document.querySelector('#btn-basic .kh').dataset.pad, s1: document.querySelector('#btn-s1 .kh').dataset.pad, s2: document.querySelector('#btn-s2 .kh').dataset.pad,
        s3: document.querySelector('#btn-s3 .kh').dataset.pad, ult: document.querySelector('#btn-ult .kh').dataset.pad, pause: document.querySelector('#pause-btn .kh').dataset.pad, kb: document.querySelector('#btn-s1 .kh').dataset.kb,
        cls: document.body.classList.contains('pad-ps'), hint: ctlHint('attack'), skill: ctlHint('skill'), g: padGlyph('A') + padGlyph('B') + padGlyph('X') + padGlyph('Y') });
      const out = {};
      deskPadConnected(pad('DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)', 'standard')); out.dualsense = read(); deskPadGone();
      deskPadConnected(pad('054c-09cc-Wireless Controller', '')); out.ds4raw = read(); deskPadGone();
      deskPadConnected(pad('Xbox 360 Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)', 'standard')); out.xbox = read(); deskPadGone();
      out.gone = { set: padGlyphSet(), cls: document.body.classList.contains('pad-ps'), basic: document.querySelector('#btn-basic .kh').dataset.pad };
      deskSetDevice('kb'); return out;
    });
    ok(ps.dualsense.set === 'ps' && ps.dualsense.profile === 'standard' && ps.dualsense.basic === '✕' && ps.dualsense.s1 === '□' && ps.dualsense.s2 === '△' && ps.dualsense.s3 === '○' && ps.dualsense.ult === 'R1' && ps.dualsense.cls && ps.dualsense.g === '✕○□△',
      '[9] DualSense (mapeo estándar, 054c): los botones muestran ✕ □ △ ○ y R1', ps.dualsense);
    ok(/✕/.test(ps.dualsense.hint) && /□, △ o ○/.test(ps.dualsense.skill), '[9] y la guía de la primera partida usa esos símbolos', ps.dualsense);
    ok(ps.ds4raw.set === 'ps' && ps.ds4raw.profile === 'ps' && ps.ds4raw.basic === '✕', '[9] DualShock sin mapeo: igual', ps.ds4raw);
    ok(ps.xbox.set === 'xbox' && ps.xbox.basic === 'A' && ps.xbox.s1 === 'X' && ps.xbox.s2 === 'Y' && ps.xbox.s3 === 'B' && ps.xbox.ult === 'RB' && !ps.xbox.cls && ps.xbox.kb === '1', '[9] mando de Xbox: A X Y B RB como siempre (y la tecla de teclado no cambia)', ps.xbox);
    ok(ps.gone.set === 'xbox' && !ps.gone.cls && ps.gone.basic === 'A', '[9] al desconectar vuelve a las letras por defecto', ps.gone);

    /* ---------- 4. pantalla completa ---------- */
    const fsOn = () => E(() => !!(document.fullscreenElement || document.webkitFullscreenElement));
    const waitFs = async want => { for (let i = 0; i < 30; i++) { if (await fsOn() === want) return true; await sleep(100); } return false; };
    const fs0 = await E(() => ({ on: FULLSCREEN.active(), auto: FULLSCREEN.enabled, toggles: FULLSCREEN.toggles, st: state }));
    await page.keyboard.press('F11'); const fsA = await waitFs(true);
    const fs1 = await E(() => ({ toggles: FULLSCREEN.toggles, st: state }));
    ok(!fs0.on && !fs0.auto && fs1.toggles === fs0.toggles + 1, '[4] F11 pide pantalla completa (y en escritorio no se pide sola al tocar botones)', { fs0, fs1 });
    ok(fsA, '[4] F11: el documento entra en pantalla completa (Fullscreen API)', { fsA });
    await page.keyboard.press('F11'); const fsB = await waitFs(false);
    ok(fsB, '[4] F11 de nuevo: vuelve a ventana', { fsB });
    await page.keyboard.press('Alt+Enter'); const fsC = await waitFs(true);
    ok(fsC, '[4] Alt+Enter entra en pantalla completa', { fsC });
    await page.keyboard.press('Alt+Enter'); const fsD = await waitFs(false);
    ok(fsD && await st() === fs0.st, '[4] Alt+Enter sale, y ninguna de las dos teclas cambió el estado del juego', { fsD, st: await st(), antes: fs0.st });

    ok(errs.length === 0, 'sin errores de página', errs.slice(0, 3));
  } catch (e) { console.error(e); fails++; }
  finally { await browser.close(); await site.close(); }
  console.log(fails ? `\n${fails} FALLAS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})();
