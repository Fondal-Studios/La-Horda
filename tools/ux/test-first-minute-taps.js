'use strict';
// PRIMER MINUTO LIMPIO — de "JUGAR" al primer movimiento del joystick, contado con toques reales (844x390 táctil, perfil vacío).
//   Meta: jugador nuevo con el entrenamiento hecho o saltado -> <= 3 toques y UNA sola pantalla previa a la arena (la ficha),
//   sin la Sala, sin prólogo/misión/acto, sin el segundo tutorial del Hechicero ni la misión repetida en el HUD.
//   Esta prueba FALLA si el recorrido pasa de 3 toques (o muestra más de una pantalla) para ese jugador.
//   Sin entrenamiento (nunca lo hizo ni lo saltó) el recorrido largo y el tutorial dentro de la arena siguen como antes.
//   node tools/ux/test-first-minute-taps.js        (levanta su propio servidor en un puerto libre; PM_BASE_URL para usar otro)
const assert = require('node:assert/strict'), { spawn } = require('node:child_process'), path = require('node:path'), net = require('node:net');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const MAX_TAPS = 3;
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 400) : '')); if (!ok) fails++; };
const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });

async function boot(browser, BASE) {
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await ctx.addInitScript(() => { window.__firstRun = true; window.__campaignMode = true; try { if (!sessionStorage.getItem('__pm')) { localStorage.clear(); sessionStorage.setItem('__pm', '1'); } } catch (e) {} });
  await page.goto(BASE + '/index.html', { waitUntil: 'load', timeout: 180000 });
  for (let k = 0; k < 300; k++) { if (await page.evaluate(() => { const b = document.getElementById('title-continue-btn'); return !!b && !b.disabled; }).catch(() => false)) break; await sleep(100); }
  const B = { ctx, page, errors, taps: 0, log: [] };
  B.E = (fn, a) => page.evaluate(fn, a);
  B.vis = sel => page.evaluate(s => { const e = document.querySelector(s); return !!(e && !e.classList.contains('hidden') && getComputedStyle(e).display !== 'none' && !e.closest('.hidden') && e.getBoundingClientRect().width > 0); }, sel);
  // toque real; `count` = cuenta para la meta (los toques de armado del perfil no cuentan)
  B.tap = async (sel, count) => {
    const el = await page.waitForSelector(sel, { state: 'visible', timeout: 15000 });
    await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(120);
    const b = await el.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(450);
    if (count) { B.taps++; B.log.push('toque ' + B.taps + ': ' + sel); }
  };
  return B;
}
// título -> guardián -> skin (después) -> historia: `skip` = "Saltar la práctica" (real) | 'done' = práctica completada (marcas que deja alphaTrainingRestore)
async function newProfile(B, mode) {
  await B.tap('#title-continue-btn');
  await B.page.waitForSelector('#starter-step-champ', { state: 'visible' });
  const card = '.starter-card[data-champ="musashi"]';
  if (!(await B.vis(card))) await B.tap('#starter-all-btn');
  await B.tap(card); await B.tap('#starter-yes-btn');
  await sleep(400); if (await B.vis('#starter-skin-later-btn')) await B.tap('#starter-skin-later-btn');
  await sleep(700);
  if (mode === 'none') { // nunca hizo ni saltó la práctica: se evita la historia/práctica marcando solo que la vio, sin tocar training*
    if (await B.vis('#first-story')) await B.E(() => { document.getElementById('first-story').remove(); save.tut = save.tut || {}; save.tut.firstStory = 1; persistNow(); });
    return;
  }
  await B.page.waitForSelector('#first-story-skip', { state: 'visible', timeout: 15000 });
  await B.tap('#first-story-skip'); // "Saltar la práctica": deja save.tut.trainingSkipped = 1
  if (mode === 'done') await B.E(() => { const t = save.tut; t.trainingSkipped = 0; t.training = 1; t.basics = t.b_move = t.b_attack = t.b_skill = 1; t.goalMission = 1; persistNow(); });
  await sleep(400);
}
// recorre la partida desde JUGAR: cuenta toques y pantallas de historia/ficha/Sala hasta mover el joystick
async function playFromJugar(B) {
  const seen = []; const r = { pagesShown: [], prepSeen: false, skipMissing: [], tutTips: [] };
  const snap = () => B.E(() => ({ state, intro: (() => { const e = document.getElementById('run-intro'); return !!e && !e.classList.contains('hidden'); })(), pro: RUN_INTRO.prologue,
    who: (document.querySelector('#run-intro .ri-who') || {}).textContent, title: (document.querySelector('#run-intro .ri-arena') || {}).textContent,
    skip: (() => { const e = document.querySelector('#run-intro .ri-skip'); return !!e && !e.classList.contains('hidden') && getComputedStyle(e).display !== 'none'; })(),
    prep: (() => { const e = document.getElementById('prep-screen'); return !!e && !e.classList.contains('hidden'); })() }));
  await B.tap('#hub-play-btn', true);
  const t0 = Date.now(); let last = '';
  while (Date.now() - t0 < 45000) {
    const s = await snap();
    if (s.prep) r.prepSeen = true;
    if (s.state === 'playing') break;
    if (s.prep && !s.intro) { if (await B.vis('#prep-start-btn')) await B.tap('#prep-start-btn', true); continue; }
    if (s.intro) {
      const key = (s.who || '') + '|' + (s.title || '') + '|' + (s.pro ? 'p' : 'f');
      if (key !== last) { last = key; r.pagesShown.push({ who: s.who, title: s.title, ficha: !s.pro }); if (!s.skip) r.skipMissing.push(key); }
      await sleep(550);
      await B.tap(s.pro ? '#run-intro' : '#run-intro .ri-go', true);
      continue;
    }
    await sleep(150);
  }
  await sleep(1200);
  // primer movimiento: dedo real sobre el joystick (izquierda de la pantalla), 400 ms
  const cdp = await B.ctx.newCDPSession(B.page);
  const p0 = await B.E(() => ({ x: player.x, y: player.y }));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 90, y: 300, id: 1 }] }); await sleep(80);
  for (let k = 1; k <= 8; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 90 + k * 8, y: 300, id: 1 }] }); await sleep(60); }
  await sleep(300);
  const p1 = await B.E(() => ({ x: player.x, y: player.y, tip: (document.querySelector('#tut-panel:not(.hidden) .tut-text') || {}).textContent || '', chip: (document.getElementById('goal-chip') || {}).textContent || '' }));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  r.moved = Math.hypot(p1.x - p0.x, p1.y - p0.y); r.tip = p1.tip; r.chip = p1.chip; r.taps = B.taps;
  return r;
}

(async () => {
  let server = null, BASE = process.env.PM_BASE_URL;
  if (!BASE) { const port = await freePort(); server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); BASE = 'http://127.0.0.1:' + port; await sleep(700); }
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
  try {
    // ---------- A y B: entrenamiento hecho / saltado ----------
    for (const mode of ['done', 'skip']) {
      const B = await boot(browser, BASE);
      await newProfile(B, mode);
      const r = await playFromJugar(B);
      console.log(`# ${mode}: ${r.taps} toques desde JUGAR hasta mover el joystick → ${B.log.join(' | ')}`);
      check(`TOQUES.${mode}.de_JUGAR_al_primer_movimiento_<=_${MAX_TAPS}`, r.taps <= MAX_TAPS, { taps: r.taps });
      check(`PANTALLAS.${mode}.una_sola_pagina_previa_(la_ficha_de_la_arena)`, r.pagesShown.length === 1 && r.pagesShown[0].ficha, r.pagesShown);
      check(`PANTALLAS.${mode}.sin_la_Sala_con_pestañas`, r.prepSeen === false);
      check(`SALTAR.${mode}.visible_en_la_pagina_desde_el_primer_cuadro`, r.skipMissing.length === 0, r.skipMissing);
      check(`MOVIMIENTO.${mode}.el_joystick_mueve_al_guardian`, r.moved > 5, { moved: r.moved });
      check(`TUTORIAL.${mode}.sin_segundo_tutorial_de_basicos_en_la_arena`, !/movete|Mantené apretado Ataque|habilidades pegan/i.test(r.tip) && !/Recordá: tu misión/.test(r.tip), r.tip);
      check(`MISION.${mode}.el_HUD_no_repite_sobrevivir`, !/sobrevivir/i.test(r.chip) || r.chip === '', r.chip);
      const st = await B.E(() => ({ tut: save.tut, gm: save.tut.goalMission, pro: save.storyPrologueSeen }));
      check(`GUARDADO.${mode}.marcas_compatibles_(goalMission,_basics,_soloIntro)`, st.tut.goalMission === 1 && st.tut.basics === 1 && st.tut.soloIntro === 1, st.tut);
      // la segunda vez JUGAR vuelve a la Sala (equipo): la primera partida directa pasa una sola vez
      await B.E(() => { state = 'mainmenu'; setState('mainmenu'); renderMainMenu(); });
      await sleep(400); await B.tap('#hub-play-btn');
      check(`SALA.${mode}.desde_la_segunda_partida_JUGAR_abre_la_Sala_(equipo)`, await B.vis('#prep-screen'));
      // el Libro conserva el prólogo entero (no el resumen) y dice cómo se gana y se pierde
      const lib = await B.E(() => { const pg = codexBookIntroPages(); return { pro: pg[3].text.length > (BOOK_INTRO_PAGES[3].recap || '').length, lose: /caen todos/.test((pg.find(p => p.kicker === 'TU MISIÓN') || {}).text || '') }; });
      check(`LIBRO.${mode}.prologo_completo_y_como_se_pierde_siguen_en_Codice_El_Libro`, lib.pro && lib.lose, lib);
      check(`ERRORES.${mode}.sin_errores_de_pagina`, B.errors.length === 0, B.errors);
      await B.ctx.close();
    }
    // ---------- C: sin entrenamiento: el recorrido largo y el tutorial dentro de la arena siguen igual ----------
    {
      const B = await boot(browser, BASE);
      await newProfile(B, 'none');
      const r = await playFromJugar(B);
      console.log(`# sin práctica: ${r.taps} toques; páginas: ${r.pagesShown.map(p => p.who + ' · ' + p.title).join(' / ')}`);
      check('SIN_PRACTICA.recorrido_largo_intacto_(Sala + misión + prólogo + acto + ficha)', r.prepSeen && r.pagesShown.length >= 6 && r.taps > MAX_TAPS, { taps: r.taps, pages: r.pagesShown.length });
      check('SIN_PRACTICA.el_tutorial_de_la_arena_sigue_enseñando_a_moverse', /movete/i.test(r.tip), r.tip);
      check('SALTAR.visible_en_TODAS_las_paginas_(historia_y_ficha)_desde_el_primer_cuadro', r.skipMissing.length === 0 && r.pagesShown.some(p => p.ficha), r.skipMissing);
      const acc = r.pagesShown.map(p => (p.who || '') + ' ' + (p.title || '')).join(' ');
      check('TILDES.carteles_en_mayuscula_con_tilde_(TU MISIÓN, PRÓLOGO, EL GUÍA)', /TU MISIÓN/.test(acc) && /PRÓLOGO/.test(acc) && /EL GUÍA/.test(acc) && !/MISION|PROLOGO/.test(acc), acc);
      await B.ctx.close();
    }
    // ---------- D: derrota sin montos en cero, HUD con y sin misión enseñada ----------
    {
      const B = await boot(browser, BASE);
      const o = await B.E(() => {
        const z = defeatPenaltyLineHTML({ forgiven: null, lostPct: 50, xpLost: 0, goldLost: 0, beforeLevel: 3, afterLevel: 3, banked: false });
        const x = defeatPenaltyLineHTML({ forgiven: null, lostPct: 50, xpLost: 120, goldLost: 0, beforeLevel: 3, afterLevel: 3, banked: false });
        const g = defeatPenaltyLineHTML({ forgiven: null, lostPct: 50, xpLost: 120, goldLost: 40, beforeLevel: 3, afterLevel: 2, banked: true });
        return { z, x, g };
      });
      check('DERROTA.sin_montos_no_dice_"perdiste_50 %_(0 de XP y 0 de oro)"', !/\b0 de (XP|oro)/.test(o.z) && !/perdiste el 50%/.test(o.z), o.z);
      check('DERROTA.solo_XP_nombra_solo_XP', /120 de XP/.test(o.x) && !/oro/.test(o.x), o.x);
      check('DERROTA.XP_nivel_y_oro_se_listan_completos', /120 de XP, volviste a Nv\. 2 y 40 de oro/.test(o.g), o.g);
      await B.ctx.close();
    }
  } finally { await browser.close(); if (server) server.kill(); }
  console.log(fails ? `FAIL: ${fails} chequeo(s)` : 'PASS primer minuto limpio: <= 3 toques de JUGAR al primer movimiento, una sola pagina previa, sin segundo tutorial');
  process.exitCode = fails ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });
