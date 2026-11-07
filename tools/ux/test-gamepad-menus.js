'use strict';
/* MANDO, MENÚS Y ESQUEMAS DE CONTROL — prueba con navegador real y un mando SIMULADO (tools/lib/gamepad-sim.js).
 *   1. Con SOLO el mando se llega del título a una partida, se usa una habilidad, se abre/cierra la pausa (Start y B).
 *   2. Menús: Hub -> Modos -> volver (B), Tienda con LB/RB, Opciones (cambiar el esquema con el mando, B cierra), pantalla Controles,
 *      diálogo de confirmación (B = cancelar, A = aceptar), pantalla de derrota.
 *   3. Mandos NO estándar (mapping "" genérico y PlayStation crudo: otros índices, palanca de dirección en un eje, ejes de otro orden).
 *   4. Esquema MOBA: clic derecho mueve (marcador, respeta la arena), Q W E R lanzan, D cura, las teclas del esquema Clásico no.
 *   5. Reasignación de teclas, persistencia, y que lo táctil/mouse sigue igual (el foco del mando se esconde con el mouse).
 *   6. Sin errores de página. Capturas en docs/beta-release/menu-polish/C2-*.png (CAPTURE=0 para no escribirlas).
 *   node tools/ux/test-gamepad-menus.js     (servidor propio en un puerto libre; SE_BASE_URL / SITE para usar otro)
 */
const H = require('../lib/serve'), G = require('../lib/gamepad-sim'), path = require('node:path'), fs = require('node:fs');
const OUT = path.resolve(__dirname, '../../docs/beta-release/menu-polish');
const SHOTS = process.env.CAPTURE !== '0';
let fails = 0;
const ok = (c, m, x) => { console.log((c ? 'PASS ' : 'FAIL ') + m + (c || x === undefined ? '' : '  ' + JSON.stringify(x).slice(0, 300))); if (!c) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SAVE = { tut: { training: 1 }, starterChosen: true, starterGiftV1: true, starterSkin: 'vale', playtestV1Bonus: true, campaignResetV1: true, campaignResetV2: true };

async function open(browser, BASE, { save, vp = { width: 1280, height: 720 }, errs, quiet = true } = {}) {
  const ctx = await browser.newContext({ viewport: vp });
  await G.install(ctx);
  if (save) await ctx.addInitScript(s => { try { if (!sessionStorage.getItem('__gm')) { localStorage.setItem('laHordaSave_v1', JSON.stringify(s)); sessionStorage.setItem('__gm', '1'); } } catch (e) {} }, save);
  const page = await ctx.newPage();
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await page.goto(BASE + '/index.html?lazy=0', { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => { const b = document.getElementById('title-continue-btn'); return typeof setState === 'function' && typeof assetsAllReady === 'function' && assetsAllReady() && b && !b.disabled; }, null, { timeout: 120000 });
  return { ctx, page };
}
const S = page => page.evaluate(() => ({ state, shown: PADNAV.shown, el: PADNAV.el ? (PADNAV.el.id || PADNAV.el.className.toString().split(' ')[0]) : null, dev: DESK.device }));
const shot = async (page, name) => { if (SHOTS) { fs.mkdirSync(OUT, { recursive: true }); await page.screenshot({ path: path.join(OUT, 'C2-' + name + '.png') }); } };
async function waitState(page, st, ms = 8000) { try { await page.waitForFunction(s => state === s, st, { timeout: ms }); return true; } catch (e) { return false; } }
// lleva el foco a #id con la cruceta (navegación espacial real): devuelve true si llegó
async function padGoto(page, id, max = 18) {
  for (let i = 0; i < max; i++) {
    const r = await page.evaluate(t => { const e = PADNAV.el, T = document.getElementById(t); if (!e || !T) return { err: true }; if (e === T) return { done: true };
      const a = e.getBoundingClientRect(), b = T.getBoundingClientRect(); return { dx: (b.left + b.right - a.left - a.right) / 2, dy: (b.top + b.bottom - a.top - a.bottom) / 2 }; }, id);
    if (r.done) return true; if (r.err) return false;
    const horiz = Math.abs(r.dy) < 40 && Math.abs(r.dx) > 40;
    const dir = horiz ? (r.dx > 0 ? 'RIGHT' : 'LEFT') : (r.dy > 0 ? 'DOWN' : 'UP');
    const before = (await S(page)).el; await G.tap(page, dir);
    if ((await S(page)).el === before) { await G.tap(page, horiz ? (r.dy > 0 ? 'DOWN' : 'UP') : (r.dx > 0 ? 'RIGHT' : 'LEFT')); }
  }
  return (await S(page)).el === id;
}
const vis = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); return !!e && !e.classList.contains('hidden') && !e.closest('.hidden') && e.getClientRects().length > 0; }, sel);

(async () => {
  const site = await H.startSite({ envUrl: ['SE_BASE_URL', 'SITE'] }), BASE = site.url, browser = await H.launch(), errs = [];
  try {
    /* ===== 1. título -> partida -> habilidad -> pausa, solo con mando "standard" ===== */
    {
      const { ctx, page } = await open(browser, BASE, { errs });
      ok(await page.evaluate(() => typeof navigator.getGamepads === 'function' && navigator.getGamepads().every(g => !g)), 'sin mando conectado no hay mando ni errores');
      await G.connect(page, 'standard');
      await G.tap(page, 'LB'); // el primer botón "despierta" al mando (la API real no lo publica antes)
      let s = await S(page);
      ok(s.dev === 'pad' && s.shown && s.el === 'bt-play', 'título: el primer botón muestra el foco sobre JUGAR AHORA', s);
      ok((await page.evaluate(() => (document.getElementById('net-toast') || {}).textContent || '')).includes('Mando conectado'), 'aviso "Mando conectado" al detectarse');
      ok(await vis(page, '#pad-focus.on'), 'el marco de foco se ve');
      await shot(page, 'titulo-foco');
      await G.tap(page, 'DOWN'); s = await S(page);
      ok(s.el === 'title-continue-btn', 'título: cruceta abajo mueve el foco a "continuar"', s);
      await G.tap(page, 'UP'); s = await S(page);
      ok(s.el === 'bt-play', 'título: cruceta arriba vuelve a JUGAR AHORA', s);
      await G.tap(page, 'A');
      ok(await waitState(page, 'playing', 10000), 'título: A en JUGAR AHORA arranca la partida (solo con el mando)');
      await sleep(600); await page.evaluate(() => { window.__god = setInterval(() => { if (window.player) { player.stunTimer = 0; player.slowAmt = 0; player.hp = player.maxHp; } }, 40); });
      // moverse con el stick: zona muerta y recorrido
      const x0 = await page.evaluate(() => player.x);
      await G.stick(page, 'L', 0.12, 0); await sleep(350);
      ok(Math.abs(await page.evaluate(() => player.x) - x0) < 1, 'stick: dentro de la zona muerta no camina solo');
      await G.stick(page, 'L', 1, 0); await sleep(500); await G.stick(page, 'L', 0, 0);
      ok(await page.evaluate(x => player.x) > x0 + 20, 'stick izquierdo mueve al guardián', await page.evaluate(() => player.x));
      // habilidades: X / Y / B (Sylva: X carga la flecha mientras se mantiene)
      await page.evaluate(() => { player.energy = player.maxEnergy; player.cds = [0, 0, 0]; });
      await G.hold(page, 'Y', 150); await sleep(150);
      const cd = await page.evaluate(() => player.cds.slice());
      ok(cd[1] > 0, 'mando: Y lanza la habilidad 2 (enfriamiento activo)', cd);
      await G.hold(page, 'B', 150); await sleep(150);
      ok((await page.evaluate(() => player.cds.slice()))[2] > 0, 'mando: B lanza la habilidad 3');
      await G.hold(page, 'X', 450); await sleep(200);
      ok((await page.evaluate(() => player.cds.slice()))[0] > 0, 'mando: X (mantener y soltar) lanza la habilidad 1');
      const kh = await page.evaluate(() => [...document.querySelectorAll('#controls .kh')].map(e => e.dataset.pad + '/' + e.dataset.kb).join(' '));
      ok(/X\/1/.test(kh) && /Y\/2/.test(kh) && /B\/3/.test(kh), 'botones del HUD rotulados con X Y B (mando) y 1 2 3 (teclado)', kh);
      // pausa: Start abre, Start cierra; B también continúa
      await G.tap(page, 'START');
      ok(await waitState(page, 'paused', 3000), 'Start pausa la partida');
      await sleep(500); s = await S(page);
      ok(s.shown, 'pausa: el foco del mando aparece sobre un botón', s);
      await shot(page, 'pausa-foco');
      await G.tap(page, 'START');
      ok(await waitState(page, 'playing', 3000), 'Start continúa');
      await G.tap(page, 'START'); await waitState(page, 'paused', 3000); await sleep(400);
      await G.tap(page, 'B');
      ok(await waitState(page, 'playing', 3000), 'pausa: B = continuar');
      // el mouse devuelve el control: el foco se esconde
      await G.tap(page, 'START'); await waitState(page, 'paused', 3000); await sleep(400);
      ok((await S(page)).shown, 'pausa: foco visible de nuevo');
      await page.mouse.move(300, 300); await page.mouse.move(420, 360); await sleep(150);
      ok(!(await S(page)).shown, 'mover el mouse esconde el foco del mando (no estorba al mouse)');
      await G.tap(page, 'DOWN'); await sleep(150);
      ok((await S(page)).shown, 'volver a apretar el mando lo muestra');
      await G.tap(page, 'START'); await waitState(page, 'playing', 3000);
      await ctx.close();
    }

    /* ===== 2. menús con un perfil que ya pasó el regalo inicial ===== */
    {
      const { ctx, page } = await open(browser, BASE, { save: SAVE, errs });
      await G.connect(page, 'standard');
      await page.evaluate(() => { setState('mainmenu'); renderMainMenu(); }); await sleep(700);
      await G.tap(page, 'LB'); await sleep(200);
      let s = await S(page);
      ok(s.state === 'mainmenu' && s.shown && s.el === 'hub-play-btn', 'hub: foco inicial en JUGAR', s);
      await shot(page, 'hub-foco');
      ok(await padGoto(page, 'mainmenu-jugar-btn'), 'hub: la cruceta llega a MULTIJUGADOR / Modos');
      await shot(page, 'hub-foco-modos');
      await G.tap(page, 'A');
      ok(await waitState(page, 'modeselect', 4000), 'hub: A abre Modos');
      await sleep(500); s = await S(page);
      ok(s.shown, 'Modos: hay foco del mando', s);
      await shot(page, 'modos-foco');
      await G.tap(page, 'B');
      ok(await waitState(page, 'mainmenu', 4000), 'Modos: B vuelve al hub');
      // Tienda con LB / RB
      await sleep(500);
      ok(await padGoto(page, 'mainmenu-tienda-btn'), 'hub: llega a TIENDA');
      await G.tap(page, 'A'); ok(await waitState(page, 'shop', 4000), 'hub: A abre la Tienda'); await sleep(600);
      const tab = () => page.evaluate(() => (document.querySelector('#shop-tabs .shop-tab.on') || {}).dataset.shopTab);
      const t0 = await tab(); await G.tap(page, 'RB'); await sleep(500); const t1 = await tab(); await G.tap(page, 'LB'); await sleep(500); const t2 = await tab();
      ok(t0 && t1 && t0 !== t1 && t2 === t0, 'Tienda: RB pasa a la pestaña siguiente y LB vuelve', [t0, t1, t2]);
      await shot(page, 'tienda-foco');
      await G.tap(page, 'B'); ok(await waitState(page, 'mainmenu', 4000), 'Tienda: B vuelve al hub');
      // Códice (Guardianes)
      await sleep(500); ok(await padGoto(page, 'mainmenu-guardianes-btn'), 'hub: llega a GUARDIANES');
      await G.tap(page, 'A'); await sleep(900);
      ok(await page.evaluate(() => state !== 'mainmenu'), 'hub: A abre Guardianes', (await S(page)));
      ok((await S(page)).shown, 'Guardianes: hay foco');
      await shot(page, 'guardianes-foco');
      for (let i = 0; i < 4 && (await page.evaluate(() => state)) !== 'mainmenu'; i++) { await G.tap(page, 'B'); await sleep(600); }
      ok(await waitState(page, 'mainmenu', 4000), 'Guardianes: B (las veces que haga falta) vuelve al hub');
      // Opciones: cambiar de esquema con el mando y cerrar con B
      await sleep(500); ok(await padGoto(page, 'hub-options-btn'), 'hub: llega a Opciones');
      await G.tap(page, 'A'); await sleep(500);
      ok(await vis(page, '#hub-options'), 'hub: A abre Opciones');
      s = await S(page); ok(s.shown, 'Opciones: foco dentro del panel', s);
      await page.evaluate(() => document.querySelector('#opt-scheme-row').scrollIntoView({ block: 'center' })); await sleep(200);
      const reached = await (async () => { for (let i = 0; i < 30; i++) { const e = (await S(page)).el; const inRow = await page.evaluate(() => !!(PADNAV.el && PADNAV.el.closest('#opt-scheme-row'))); if (inRow) return true; await G.tap(page, 'DOWN'); } return false; })();
      ok(reached, 'Opciones: la cruceta baja hasta el esquema de control');
      await G.tap(page, 'RIGHT'); await G.tap(page, 'A'); await sleep(250);
      ok(await page.evaluate(() => PREFS.ctlScheme) === 'moba', 'Opciones: elegir MOBA con el mando');
      ok(await page.evaluate(() => document.querySelector('#opt-scheme-row [data-v="moba"]').getAttribute('aria-pressed')) === 'true', 'Opciones: el selector refleja MOBA');
      await shot(page, 'opciones-foco');
      // pantalla Controles
      await G.tap(page, 'DOWN'); await G.tap(page, 'A'); await sleep(400);
      ok(await vis(page, '#ctl-map'), 'Opciones: "Ver controles" abre la pantalla de Controles');
      const rows = await page.evaluate(() => [...document.querySelectorAll('#ctl-map-body .ctl-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim()));
      ok(rows.some(r => /Q/.test(r) && /Habilidad 1/.test(r)) && rows.some(r => /Clic derecho/.test(r)) && rows.some(r => /Definitiva.*R/.test(r)), 'Controles: lista las teclas MOBA y los botones del mando', rows);
      await shot(page, 'controles-pantalla');
      await G.tap(page, 'B'); await sleep(300);
      ok(!(await vis(page, '#ctl-map')) && (await vis(page, '#hub-options')), 'Controles: B cierra solo esa pantalla y Opciones sigue abierta');
      await G.tap(page, 'B'); await sleep(300);
      ok(!(await vis(page, '#hub-options')), 'Opciones: B las cierra');
      await page.evaluate(() => prefSet('ctlScheme', 'classic'));
      // diálogo de confirmación
      await page.evaluate(() => { window.__dlg = null; gameConfirm('¿Abandonar?', { danger: true, okText: 'Abandonar', cancelText: 'Seguir' }).then(v => { window.__dlg = v; }); }); await sleep(400);
      s = await S(page);
      ok(s.shown && await page.evaluate(() => PADNAV.el.classList.contains('gd-cancel')), 'diálogo peligroso: el foco empieza en Cancelar', s);
      await shot(page, 'dialogo-foco');
      await G.tap(page, 'RIGHT'); await G.tap(page, 'A'); await sleep(350);
      ok(await page.evaluate(() => window.__dlg) === true, 'diálogo: cruceta a Aceptar + A confirma');
      await page.evaluate(() => { window.__dlg = null; gameConfirm('¿Seguro?', { danger: true }).then(v => { window.__dlg = v; }); }); await sleep(500);
      await G.tap(page, 'B'); await sleep(350);
      ok(await page.evaluate(() => window.__dlg) === false, 'diálogo: B cancela');
      // pantalla de derrota
      await page.evaluate(() => { try { setState('gameover'); } catch (e) {} }); await sleep(600); s = await S(page);
      ok(s.state === 'gameover' && s.shown, 'derrota: el foco aparece en un botón', s);
      await shot(page, 'derrota-foco');
      await ctx.close();
    }

    /* ===== 3. mandos NO estándar ===== */
    for (const prof of ['generic', 'ps']) {
      const { ctx, page } = await open(browser, BASE, { errs });
      await G.connect(page, prof);
      await G.tap(page, 'LB'); await sleep(200);
      let s = await S(page);
      ok(s.shown && s.el === 'bt-play', prof + ': se detecta y muestra el foco', s);
      ok(await page.evaluate(() => DESK.gp.profile) === prof, prof + ': perfil de mando elegido', await page.evaluate(() => DESK.gp.profile));
      await G.tap(page, 'DOWN'); s = await S(page);
      ok(s.el === 'title-continue-btn', prof + ': la palanca de dirección (eje) mueve el foco', s);
      await G.tap(page, 'UP');
      await G.tap(page, 'A');
      ok(await waitState(page, 'playing', 10000), prof + ': el botón A de su propia numeración arranca la partida');
      await sleep(600); await page.evaluate(() => { window.__god = setInterval(() => { if (window.player) { player.stunTimer = 0; player.slowAmt = 0; player.hp = player.maxHp; } }, 40); });
      const x0 = await page.evaluate(() => player.x);
      await G.stick(page, 'L', 1, 0); await sleep(500); await G.stick(page, 'L', 0, 0);
      ok(await page.evaluate(() => player.x) > x0 + 20, prof + ': stick izquierdo mueve al guardián');
      await page.evaluate(() => { player.energy = player.maxEnergy; player.cds = [0, 0, 0]; });
      await G.hold(page, 'Y', 150); await sleep(150);
      ok((await page.evaluate(() => player.cds.slice()))[1] > 0, prof + ': Y lanza la habilidad 2');
      // stick derecho = apuntar (en el perfil sin mapeo viene en otros ejes)
      await G.stick(page, 'R', 0, -1); await sleep(150);
      const aim = await page.evaluate(() => DESK.gp.aim);
      ok(aim && aim.y < -0.9, prof + ': stick derecho apunta (ejes propios del perfil)', aim);
      await G.stick(page, 'R', 0, 0);
      await G.tap(page, 'START'); ok(await waitState(page, 'paused', 3000), prof + ': Start pausa');
      await G.tap(page, 'START');
      await ctx.close();
    }

    /* ===== 4. esquema MOBA y teclado ===== */
    {
      const { ctx, page } = await open(browser, BASE, { errs });
      await page.evaluate(() => { prefSet('ctlScheme', 'moba'); });
      await page.click('#bt-play'); ok(await waitState(page, 'playing', 10000), 'MOBA: arranca la partida con el mouse'); await sleep(700);
      await page.evaluate(() => {
        window.__god = setInterval(() => { if (window.player) { player.stunTimer = 0; player.slowAmt = 0; player.hp = player.maxHp; } }, 40);
        window.__spy = { skill: [], ult: 0, emerg: 0 };
        const us = window.useSkill; window.useSkill = function (i, a) { window.__spy.skill.push(i); return us.apply(this, arguments); };
        const uu = window.useUltimate; window.useUltimate = function () { window.__spy.ult++; return uu.apply(this, arguments); };
        window.emergPress = function () { window.__spy.emerg++; };
        player.energy = player.maxEnergy;
      });
      const kb = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('#controls .kh')].map(e => [e.parentElement.id, e.dataset.kb])));
      ok(kb['btn-s1'] === 'Q' && kb['btn-s2'] === 'W' && kb['btn-s3'] === 'E' && kb['btn-ult'] === 'R' && kb['btn-emerg'] === 'D', 'MOBA: los botones del HUD muestran Q W E R D', kb);
      const press = async (code, ms = 70) => { await page.keyboard.down(code); await sleep(ms); await page.keyboard.up(code); await sleep(80); };
      // (la habilidad 1 de Sylva es una flecha cargada: no pasa por useSkill, se ve en su enfriamiento)
      const fired = {};
      for (const [k, i] of [['KeyQ', 0], ['KeyW', 1], ['KeyE', 2]]) { await page.evaluate(() => { player.cds = [0, 0, 0]; player.energy = player.maxEnergy; }); await press(k, i === 0 ? 420 : 70); await sleep(120); fired[k] = await page.evaluate(i => player.cds[i] > 0, i); }
      ok(fired.KeyQ && fired.KeyW && fired.KeyE, 'MOBA: Q W E lanzan las habilidades 1 2 3', fired);
      await press('KeyR'); await press('KeyD');
      const sp2 = await page.evaluate(() => window.__spy);
      ok(sp2.ult === 1, 'MOBA: R lanza la Definitiva', sp2); ok(sp2.emerg === 1, 'MOBA: D es la curación de emergencia', sp2);
      const before = (await page.evaluate(() => window.__spy.skill.length));
      await press('Digit1'); await press('Digit2'); await press('Digit3');
      ok((await page.evaluate(() => window.__spy.skill.length)) === before, 'MOBA: 1 2 3 ya no lanzan habilidades (sin conflicto de teclas)');
      // WASD no mueve; flechas sí
      const p0 = await page.evaluate(() => ({ x: player.x, y: player.y }));
      await page.keyboard.down('KeyW'); await sleep(300); await page.keyboard.up('KeyW'); await page.keyboard.down('KeyA'); await sleep(200); await page.keyboard.up('KeyA');
      const p1 = await page.evaluate(() => ({ x: player.x, y: player.y }));
      ok(Math.hypot(p1.x - p0.x, p1.y - p0.y) < 2, 'MOBA: W y A no mueven (W es habilidad, A ataque)', [p0, p1]);
      await page.keyboard.down('ArrowRight'); await sleep(350); await page.keyboard.up('ArrowRight');
      ok((await page.evaluate(() => player.x)) > p1.x + 15, 'MOBA: las flechas mueven');
      // clic derecho = ir hacia ahí (también sobre la zona izquierda, que es del joystick táctil)
      await page.evaluate(() => { player.cds = [0, 0, 0]; });
      const c = await page.evaluate(() => { const r = canvas.getBoundingClientRect(); const s = _deskWorldToClient(player.x, player.y); return { r: { l: r.left, t: r.top, w: r.width, h: r.height }, s }; });
      for (const [name, dx, dy] of [['derecha', 220, 0], ['izquierda (zona del joystick)', -220, 60]]) {
        const pa = await page.evaluate(() => ({ x: player.x, y: player.y }));
        const cx = c.s.x + dx, cy = c.s.y + dy;
        const tgt = await page.evaluate(([x, y]) => document.elementFromPoint(x, y).id || document.elementFromPoint(x, y).tagName, [cx, cy]);
        await page.mouse.move(cx, cy); await page.mouse.down({ button: 'right' }); await sleep(60); await page.mouse.up({ button: 'right' });
        const st = await page.evaluate(() => ({ on: DESK.ctm.on, joy: joyActive, marker: !document.getElementById('ctm-marker').classList.contains('hidden') }));
        ok(st.on && st.marker && !st.joy, 'MOBA: clic derecho ' + name + ' fija el destino y muestra el marcador (sin activar el joystick táctil; capa: ' + tgt + ')', st);
        if (name === 'derecha') await shot(page, 'moba-marcador');
        await sleep(800);
        const pb = await page.evaluate(() => ({ x: player.x, y: player.y }));
        const dirOk = (pb.x - pa.x) * Math.sign(dx) > 30;
        ok(dirOk, 'MOBA: el guardián camina hacia el punto (' + name + ')', [pa, pb]);
        await page.evaluate(() => deskMoveCancel());
      }
      // destino pegado a la arena y paredes
      const clamp = await page.evaluate(() => {
        const raw = { x: 1e6, y: 1e6 }; deskMoveTo(raw.x, raw.y, true);
        const t = { x: DESK.ctm.x, y: DESK.ctm.y, radius: player.radius || 18 }, again = { x: t.x, y: t.y, radius: t.radius }; clampToArena(again); resolveWallCollision(again);
        const r = Math.hypot(t.x - raw.x, t.y - raw.y); deskMoveCancel();
        return { stays: Math.hypot(again.x - t.x, again.y - t.y) < 1.5, moved: r > 1000, t };
      });
      ok(clamp.stays && clamp.moved, 'MOBA: un clic fuera de la arena se recorta a la arena (respeta límites y paredes)', clamp);
      // llegar y parar
      await page.evaluate(() => { deskMoveTo(player.x + 60, player.y); }); await sleep(1200);
      ok(await page.evaluate(() => !DESK.ctm.on && !document.getElementById('ctm-marker') || document.getElementById('ctm-marker').classList.contains('hidden')), 'MOBA: al llegar, el marcador se va y el guardián se detiene');
      // teclas en Clásico siguen como siempre
      await page.evaluate(() => { prefSet('ctlScheme', 'classic'); window.__spy = { skill: [], ult: 0, emerg: 0 }; });
      const fired2 = {};
      for (const [k, i] of [['Digit1', 0], ['Digit2', 1], ['Digit3', 2]]) { await page.evaluate(() => { player.cds = [0, 0, 0]; player.energy = player.maxEnergy; }); await press(k, i === 0 ? 420 : 70); await sleep(120); fired2[k] = await page.evaluate(i => player.cds[i] > 0, i); }
      await press('KeyR'); await press('KeyQ');
      const sp3 = await page.evaluate(() => window.__spy);
      ok(fired2.Digit1 && fired2.Digit2 && fired2.Digit3 && sp3.ult === 1 && sp3.emerg === 1, 'Clásico: 1 2 3, R y Q siguen igual', [fired2, sp3]);
      const q0 = await page.evaluate(() => { player.stunTimer = 0; player.rootTimer = 0; player.casting = null; return { x: player.x, y: player.y }; });   // las habilidades de arriba pueden dejar al guardián aturdido/en cast unos ms
      await page.keyboard.down('KeyD'); await sleep(350); await page.keyboard.up('KeyD');
      ok((await page.evaluate(() => player.x)) > q0.x + 15, 'Clásico: WASD siguen moviendo', [q0, await page.evaluate(() => ({ x: player.x, y: player.y, st: player.stunTimer, joy: joyVec, codes: [...DESK.codes], sc: deskScheme() }))]);
      await page.evaluate(() => { const r = canvas.getBoundingClientRect(); window.__c = { x: r.left + r.width * 0.7, y: r.top + r.height * 0.4 }; });
      const c2 = await page.evaluate(() => window.__c); await page.mouse.move(c2.x, c2.y); await page.mouse.down({ button: 'right' }); await sleep(60); await page.mouse.up({ button: 'right' });
      ok(!(await page.evaluate(() => DESK.ctm.on)), 'Clásico: el clic derecho no mueve (es solo del esquema MOBA)');
      await ctx.close();
    }

    /* ===== 5. reasignación y persistencia ===== */
    {
      const { ctx, page } = await open(browser, BASE, { save: SAVE, errs });
      await page.evaluate(() => { setState('mainmenu'); renderMainMenu(); }); await sleep(500);
      await page.click('#hub-options-btn'); await sleep(300);
      await page.evaluate(() => document.querySelector('#opt-scheme-row [data-v="moba"]').click());
      await page.click('#opt-keys-btn'); await sleep(300);
      ok(await vis(page, '#ctl-map'), 'Controles se abre con el mouse');
      await page.click('#ctl-map-body .ctl-key[data-act="s1"]'); await sleep(100);
      ok(/waiting/.test(await page.getAttribute('#ctl-map-body .ctl-key[data-act="s1"]', 'class')), 'reasignar: la fila espera una tecla');
      await page.keyboard.press('Escape'); await sleep(100);
      ok(!(await page.evaluate(() => !!DESK.rebinding)) && (await vis(page, '#ctl-map')), 'reasignar: Esc cancela la espera sin cerrar la pantalla');
      await page.click('#ctl-map-body .ctl-key[data-act="s1"]'); await page.keyboard.press('KeyZ'); await sleep(150);
      ok(await page.evaluate(() => PREFS.keyBinds.moba.s1) === 'KeyZ', 'reasignar: habilidad 1 pasa a Z');
      await page.click('#ctl-map-body .ctl-key[data-act="s2"]'); await page.keyboard.press('KeyZ'); await sleep(150);
      const kbs = await page.evaluate(() => ({ s1: deskActionCodes('s1')[0], s2: deskActionCodes('s2')[0] }));
      ok(kbs.s2 === 'KeyZ' && kbs.s1 === 'KeyW', 'reasignar: una tecla repetida se intercambia con la otra acción (sin dejar dos acciones en la misma tecla)', kbs);
      await page.click('#ctl-map-body .ctl-key[data-act="ult"]'); await page.keyboard.press('ArrowUp'); await sleep(100);
      ok(await page.evaluate(() => deskActionCodes('ult')[0]) === 'KeyR', 'reasignar: no deja usar una tecla de movimiento');
      await page.click('#ctl-map-body .ctl-key[data-act="ult"]'); await page.keyboard.press('Escape'); await sleep(100);
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('horda_prefs')));
      ok(saved.ctlScheme === 'moba' && saved.keyBinds.moba.s2 === 'KeyZ', 'se guarda en localStorage (horda_prefs)', saved);
      await page.reload({ waitUntil: 'load' }); await page.waitForFunction(() => typeof PREFS !== 'undefined' && typeof deskActionCodes === 'function');
      ok(await page.evaluate(() => PREFS.ctlScheme === 'moba' && deskActionCodes('s2')[0] === 'KeyZ'), 'persiste al recargar');
      await page.evaluate(() => { prefSet('ctlScheme', 'classic'); });
      ok(await page.evaluate(() => deskActionCodes('s1')[0]) === 'Digit1', 'el esquema Clásico conserva sus teclas aunque MOBA esté reasignado');
      await ctx.close();
    }

    ok(errs.length === 0, 'sin errores de página', errs.slice(0, 3));
  } finally { await browser.close(); await site.close(); }
  console.log(fails ? '\n' + fails + ' FALLA(S)' : '\nPASS test-gamepad-menus');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
