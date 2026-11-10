'use strict';
/* ONBOARDING Y MENÚS EN PC — prueba con navegador real (auditoría UX para Steam).
 *  1. Con teclado/mouse detectados (body.inp-kb) el tutorial y "¿Cómo se juega?" nombran teclas reales, sin textos táctiles.
 *     Con mando, botones del mando. En táctil los textos de siempre no cambian.
 *  2. ELEGÍ TU GUARDIÁN a 1280x720: grilla de muchas columnas y "Entrar a la Arena" siempre a la vista. A 844x390 (celular) sigue igual.
 *  3. Menú principal a 1920x1080: ocupa más de 1000 px y entra sin deslizar; a 1280x720 sigue en 1000 px.
 *  4. Sala: el retrato no se estira (104x104).
 *  5. Horda Infinita: la Sala abre en la pestaña del Rango de Cicatriz, con texto de 14 px o más; "Cambiar campeón" no la mueve.
 *  6. Sin guardián propio, "Volver al menú" tras una partida lleva al menú principal (no a la grilla bloqueada).
 *  7. Sin textos de desarrollo a la vista en el título (ALFA, ALPHA, borrador, correo sin configurar, Instalar).
 *  node tools/ux/test-pc-onboarding.js   (servidor propio en un puerto libre)
 */
const H = require('../lib/serve');
let fails = 0;
const ok = (c, m, x) => { console.log((c ? 'PASS ' : 'FAIL ') + m + (c || x === undefined ? '' : '  ' + JSON.stringify(x).slice(0, 500))); if (!c) fails++; };
const SAVE = { tut: { training: 1 }, starterChosen: true, starterGiftV1: true, starterSkin: 'vale', playtestV1Bonus: true, campaignResetV1: true, campaignResetV2: true };
const TOUCH = /joystick|Toc[áa]\b|tocalo|bot[óo]n Ataque|pulgar|T[áa]ctil/;

(async () => {
  const site = await H.startSite(), browser = await H.launch(), errs = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await ctx.addInitScript(s => { try { if (!sessionStorage.getItem('__sc')) { localStorage.setItem('laHordaSave_v1', JSON.stringify(s)); sessionStorage.setItem('__sc', '1'); } } catch (e) {} }, SAVE);
    const page = await ctx.newPage();
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    await page.route('**/api/rooms?*', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"rooms":[]}' }));
    await page.goto(site.url + '/index.html?lazy=0', { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => { const b = document.getElementById('title-continue-btn'); return typeof setState === 'function' && typeof assetsAllReady === 'function' && assetsAllReady() && b && !b.disabled; }, null, { timeout: 180000 });
    const E = (fn, a) => page.evaluate(fn, a);
    const vis = () => E(() => { const v = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; }; const t = document.getElementById('title-screen');
      return { text: t.innerText, draft: v(t.querySelector('.legal-draft')), nomail: v(t.querySelector('.legal-nomail')), install: v(t.querySelector('a[href="instalar.html"]')), links: t.querySelectorAll('#legal-title a').length, html: document.body.innerHTML.match(/ALFA COOPERATIVA|ui-tag">ALPHA|· ALPHA</g) }; });

    // 7. textos de desarrollo (en el título, antes de tocar nada)
    const t7 = await vis();
    ok(!/ALFA|ALPHA|borrador|sin configurar|Instalar en mi/i.test(t7.text) && !t7.draft && !t7.nomail && !t7.install, '[7] título sin ALFA / ALPHA / borrador / correo sin configurar / Instalar a la vista', t7);
    ok(t7.links === 3 && !t7.html, '[7] los 3 enlaces legales siguen; index.html ya no trae etiquetas ALFA/ALPHA', { links: t7.links, html: t7.html });

    await E(() => {
      for (const k of Object.keys(save.champions)) { save.champions[k].unlocked = true; save.champions[k].level = 12; }
      save.arenasCleared = Object.assign(save.arenasCleared || {}, { ciudad: true, fortaleza: true });
      selectedClass = 'guerrero'; lobbyAllies = null; gameDialogAutoConfirm = () => true; save.endless = {};
    });

    // 1. textos por dispositivo
    const texts = () => E(() => {
      const tut = ALPHA_TRAINING_STEPS.map(s => alphaTrainingText(s) + ' | ' + alphaTrainingTarget(s));
      const how = ['campana', 'controles', 'botin', 'progreso', 'pausa'].map(k => howtoSteps(k === 'campana' ? 'objetivo' : k, 'campana').map(s => s.x).join(' '));
      return { dev: DESK.device, kb: document.body.classList.contains('inp-kb'), tut, how, guide: alphaGuideText(ALPHA_GUIDE[0]) };
    });
    const kb = await texts();
    ok(kb.dev === 'kb' && kb.kb, '[1] escritorio con mouse: el juego detecta teclado (body.inp-kb)', kb.dev);
    const badT = kb.tut.filter(x => TOUCH.test(x)), badH = kb.how.filter(x => TOUCH.test(x));
    ok(!badT.length, '[1] teclado: ningún paso del tutorial habla en táctil', badT);
    ok(!badH.length && !TOUCH.test(kb.guide), '[1] teclado: la ayuda y la Guía no hablan en táctil', badH.concat(kb.guide));
    ok(/WASD/.test(kb.tut[1]) && /Espacio/.test(kb.tut[2]) && /1, 2 o 3/.test(kb.tut[3]) && /Esc/.test(kb.tut[13]) && /\bR\b/.test(kb.tut[8]), '[1] teclado: WASD, Espacio, 1-2-3, R y Esc en sus pasos', [kb.tut[1], kb.tut[2], kb.tut[3], kb.tut[8], kb.tut[13]]);
    ok(/WASD/.test(kb.how[1]) && /Espacio/.test(kb.how[1]) && /1, 2 o 3/.test(kb.how[1]) && /Esc/.test(kb.how[4]), '[1] teclado: la pestaña Controles y Pausa nombran las teclas', [kb.how[1], kb.how[4]]);
    await E(() => deskSetDevice('pad')); const pad = await texts();
    ok(/stick izquierdo/.test(pad.tut[1]) && /Mantené A /.test(pad.tut[2]) && /X, Y o B/.test(pad.tut[3]) && /Start/.test(pad.tut[13]) && /RB/.test(pad.how[1]), '[1] mando: stick, A, X/Y/B, RB y Start', [pad.tut[1], pad.tut[2], pad.tut[3], pad.tut[13]]);
    await E(() => deskSetDevice('touch')); const tch = await texts();
    const same = await E(() => ALPHA_TRAINING_STEPS.every(s => s.id === 'move' || s.id === 'attack' || alphaTrainingText(s) === s.text) && ['controles', 'botin', 'progreso', 'pausa'].every(k => howtoSteps(k, 'campana') === HOWTO_STEPS[k]) && alphaGuideText(ALPHA_GUIDE[0]) === ALPHA_GUIDE[0].text);
    ok(same && /joystick de abajo a la izquierda/.test(tch.tut[1]) && /botón Ataque de la derecha/.test(tch.tut[2]) && /Tocá ❚❚/.test(tch.tut[13]), '[1] táctil: los textos de siempre, sin cambios', [tch.tut[1], tch.tut[2], tch.tut[13]]);
    await E(() => deskSetDevice('kb'));
    // en pantalla de verdad: el panel del tutorial y la ayuda abierta
    const live = await E(() => { setState('mainmenu'); renderMainMenu(); alphaTrainingStart(); ALPHA_TRAINING.step = 1; alphaTrainingEnterStep(); const p = document.querySelector('#alpha-training-panel p').textContent; alphaTrainingSkip(); howtoOpen('controles'); const h = document.querySelector('#howto .howto-list').innerText; howtoClose(); return { p, h }; });
    ok(/WASD/.test(live.p) && !TOUCH.test(live.p) && /WASD/.test(live.h) && !TOUCH.test(live.h), '[1] en pantalla: el panel del tutorial y "¿Cómo se juega?" muestran las teclas', live);

    // 3. menú principal a 1280 (sin cambios) y a 1920
    const hub = () => E(() => { setState('mainmenu'); renderMainMenu(); const m = document.querySelector('#mainmenu-screen .hub-main').getBoundingClientRect(), s = document.getElementById('mainmenu-screen'), ex = [...document.querySelectorAll('#mainmenu-screen .hub-row-explore .hub-tile')].filter(e => e.getBoundingClientRect().width > 0).map(e => Math.round(e.getBoundingClientRect().top)); return { w: Math.round(m.width), bottom: Math.round(m.bottom), sh: s.scrollHeight, ch: s.clientHeight, rows: new Set(ex).size }; });
    const h1280 = await hub();
    ok(h1280.w === 1000, '[3] 1280x720: el menú principal sigue en 1000 px', h1280);

    // 2. elegir guardián a 1280x720
    const sel = await E(() => { endlessOpen(); const s = document.getElementById('menu-screen'), g = document.getElementById('champ-grid'), b = document.getElementById('start-btn'); const at = () => { const r = b.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.width > 0; };
      const top = at(); s.scrollTop = Math.round(s.scrollHeight / 2); const mid = at(); s.scrollTop = s.scrollHeight; const end = at(); s.scrollTop = 0;
      return { state, cards: g.children.length, cols: getComputedStyle(g).gridTemplateColumns.split(' ').length, sh: s.scrollHeight, top, mid, end, sx: s.scrollWidth <= s.clientWidth + 1 }; });
    ok(sel.state === 'menu' && sel.cols >= 5, '[2] 1280x720: grilla de 5 columnas o más (' + sel.cols + ' columnas, ' + sel.cards + ' guardianes)', sel);
    ok(sel.top && sel.mid && sel.end, '[2] "Entrar a la Arena" visible arriba, a mitad y al final del scroll', sel);
    ok(sel.sh < 3000 && sel.sx, '[2] la página mide menos de 3.000 px (antes ~7.100) y no hay scroll horizontal', sel);
    const pick = await E(() => { const c = [...document.querySelectorAll('#champ-grid .champ-card')].find(x => !x.classList.contains('selected') && !x.classList.contains('locked')); c.click(); return { sel: document.querySelectorAll('#champ-grid .champ-card.selected').length, key: selectedClass }; });
    ok(pick.sel === 1 && pick.key !== 'guerrero', '[2] las tarjetas compactas se siguen pudiendo elegir', pick);

    // 5 y 4. Sala de la Horda
    const prep = await E(() => { document.getElementById('start-btn').click(); const scr = document.getElementById('prep-screen'), i = document.querySelector('#en-scar .en-scar-info'), c = document.querySelector('#en-scar .en-scar-chip');
      const o = { state, sec: scr.dataset.sec, infoPx: parseFloat(getComputedStyle(i).fontSize), chipPx: parseFloat(getComputedStyle(c).fontSize), labelPx: parseFloat(getComputedStyle(document.getElementById('en-scar')).fontSize), infoVis: i.getBoundingClientRect().height > 0 };
      prepSecSet('equipo'); const cv = document.querySelector('.duo-card canvas').getBoundingClientRect(); o.cv = [Math.round(cv.width), Math.round(cv.height)];
      setState('menu'); renderChampGrid(); document.getElementById('start-btn').click(); o.back = document.getElementById('prep-screen').dataset.sec; return o; });
    ok(prep.state === 'prep' && prep.sec === 'arena' && prep.infoVis, '[5] Horda: la Sala abre en la pestaña del Rango de Cicatriz', prep);
    ok(prep.infoPx >= 14 && prep.chipPx >= 14 && prep.labelPx >= 14, '[5] Rangos de Cicatriz: fichas y texto a 14 px o más', prep);
    ok(prep.back === 'equipo', '[5] al volver de "Cambiar campeón" la Sala queda en la pestaña donde estabas', prep.back);
    ok(prep.cv[0] === 104 && prep.cv[1] === 104, '[4] retrato de la Sala sin estirar: 104x104 (antes 392x528)', prep.cv);
    const camp = await E(() => { endlessPending = false; if (typeof endlessActive !== 'undefined') endlessActive = false; setState('mainmenu'); renderMainMenu(); hubPlay(); return { state, sec: document.getElementById('prep-screen').dataset.sec }; });
    ok(camp.state === 'prep' && camp.sec === 'equipo', '[5] campaña: la Sala sigue abriendo en Equipo', camp);

    // 6. sin guardián propio, "Volver al menú" va al menú principal
    const back = await E(() => { const keep = {}; for (const k of Object.keys(save.champions)) { keep[k] = save.champions[k].unlocked; save.champions[k].unlocked = false; }
      currentArena = 'bosque'; setState('gameover'); document.getElementById('menu-btn-1').click(); const a = state;
      setState('victory'); if (typeof victorySaveReady === 'function' && !victorySaveReady()) { for (const k in keep) save.champions[k].unlocked = keep[k]; return { a, b: 'omitido' }; }
      document.getElementById('menu-btn-2').click(); const b = state;
      for (const k in keep) save.champions[k].unlocked = keep[k];
      setState('gameover'); document.getElementById('menu-btn-1').click(); return { a, b, owned: state }; });
    ok(back.a === 'mainmenu', '[6] sin guardián propio: "Volver al menú" de la derrota lleva al menú principal', back);
    ok(back.b === 'mainmenu' || back.b === 'omitido', '[6] ídem desde la victoria' + (back.b === 'omitido' ? ' (omitido: guardado no listo)' : ''), back);
    ok(back.owned === 'menu' || back.owned === undefined, '[6] con guardianes propios el camino de siempre no cambia', back);

    // celular apaisado: nada de lo de escritorio aplica
    await page.setViewportSize({ width: 844, height: 390 });
    const mob = await E(() => { setState('menu'); renderChampGrid(); const g = document.getElementById('champ-grid'); const o = { cols: getComputedStyle(g).gridTemplateColumns.split(' ').length }; setState('mainmenu'); renderMainMenu(); o.zoom = getComputedStyle(document.querySelector('#mainmenu-screen .hub-main')).zoom; return o; });
    ok(mob.cols === 6 && String(mob.zoom) === '1', '[2][3] celular apaisado (844x390): grilla de 6 y hub sin escala, como antes', mob);
    await page.setViewportSize({ width: 390, height: 844 });
    const mobV = await E(() => { setState('menu'); renderChampGrid(); return getComputedStyle(document.getElementById('champ-grid')).gridTemplateColumns.split(' ').length; });
    ok(mobV === 2, '[2] celular vertical (390x844): 2 columnas, como antes', mobV);

    // 3. 1920x1080
    await page.setViewportSize({ width: 1920, height: 1080 });
    const h1920 = await hub();
    ok(h1920.w >= 1400, '[3] 1920x1080: el menú principal ocupa ' + h1920.w + ' px (antes 1000)', h1920);
    ok(h1920.sh <= h1920.ch + 1 && h1920.rows === 1, '[3] 1920x1080: entra sin deslizar y EXPLORAR es una sola fila', h1920);
    await page.setViewportSize({ width: 1600, height: 900 });
    const h1600 = await hub();
    ok(h1600.w > 1000 && h1600.sh <= h1600.ch + 1, '[3] 1600x900: más ancho que 1000 px y sin deslizar', h1600);

    ok(!errs.length, 'sin errores de página', errs);
  } catch (e) { ok(false, 'la prueba terminó con una excepción', String(e && e.stack || e)); }
  finally { await browser.close(); await site.close(); }
  console.log(fails ? `\n${fails} FALLA(S)` : '\nTODO PASS');
  process.exit(fails ? 1 : 0);
})();
