// EL LIBRO DE LA HORDA — prueba en navegador real (Playwright, celular en horizontal 844×390).
//   node tools/items/t_codex_book.js [carpeta_capturas]
// Cubre: intro tras elegir el primer campeón (con clics reales), omitir, esquivar salas, migración de un guardado
// viejo recargando la página, carga corta (≈3 s, tope por arena, toque para saltear), seguridad cooperativa
// (nada se queda sobre una sala), fragmento en la victoria real, sección del Códice, revisitar siempre, movimiento
// reducido, vertical, texto sin recortes en las 8 + 25 páginas y que el visor deja de dibujar al cerrar.
const H = require('../lib/serve');
let BASE;
const OUT = process.argv[2];
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (!ok && x !== undefined ? '  ' + JSON.stringify(x).slice(0, 400) : '')); if (!ok) fails++; };

async function boot(browser, opts) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 844, height: 390 } }, opts || {}));
  // These are local UI/persistence tests; never poll real account/room services or remote fonts.
  await ctx.route('**/*', route => {
    const u=new URL(route.request().url());
    return u.origin===new URL(BASE).origin||['data:','blob:'].includes(u.protocol)?route.continue():route.abort('blockedbyclient');
  });
  const page = await ctx.newPage(), errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g|net::|404|ERR_TUNNEL/.test(m.text())) errors.push('console: ' + m.text().slice(0, 300)); });
  await page.addInitScript(() => { window.__campaignMode = true; window.__codexBook = true; });
  await H.goto(page, `${BASE}/index.html`, { waitUntil: 'load', timeout: 180000 });
  for (let k = 0; k < 300; k++) { if (await page.evaluate(() => { const b = document.getElementById('title-continue-btn'); return !!b && !b.disabled; })) break; await sleep(100); }
  await sleep(500);
  return { ctx, page, errors };
}

(async () => {
  const site = await H.startSite({ envUrl: ['SE_BASE_URL'] }); BASE = site.url;   // servidor propio en puerto libre; SE_BASE_URL para uno externo
  const browser = await H.launch();
  const { ctx, page, errors } = await boot(browser);
  const E = (fn, a) => page.evaluate(fn, a);
  const shot = async n => { if (OUT) await page.screenshot({ path: `${OUT}/${n}.png` }); };
  const bookState = () => E(() => ({ open: BOOK.open, kind: BOOK.kind, i: BOOK.i, n: BOOK.pages.length, hidden: !document.getElementById('codex-book') || document.getElementById('codex-book').classList.contains('hidden'), flipping: BOOK.flipping }));
  const waitBook = async (open, ms) => { for (let k = 0; k < (ms || 10000) / 50; k++) { if ((await E(() => BOOK.open)) === open) return true; await sleep(50); } return false; };
  const waitFor = async (fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await fn().catch(() => false)) return true; await sleep(100); } return false; };
  const idle = async () => { for (let k = 0; k < 200; k++) { if (!(await E(() => BOOK.flipping))) return; await sleep(50); } };
  const turn = async () => { await page.click('#codex-book .bk-next'); await sleep(60); await idle(); await sleep(150); };
  await E(() => { loop = function () {}; window.__draws = 0; const o = bookArtDraw; bookArtDraw = function () { window.__draws++; return o.apply(this, arguments); }; });

  /* ================= 1. EL LIBRO SE OFRECE TRAS LA PRIMERA ARENA (ya no se abre antes de jugar) ================= */
  const pre = await E(() => ({ need: needsStarterChampion(), seen: save.codexBook.introSeen, ran: save.codexBook.ran, offered: save.codexBook.offered }));
  check('INTRO.perfil_nuevo_arranca_sin_campeon_sin_intro_vista_y_sin_oferta', pre.need === true && pre.seen === false && pre.ran === false && pre.offered === false, pre);
  await E(() => { window.__done = 0; openStarterSelect(() => { window.__done++; setState('mainmenu'); }); });
  await sleep(600); // las cartas ignoran toques fantasma justo al abrir
  await shot('00_elegir_campeon');
  await page.click('.starter-card[data-champ="mago"]'); await page.click('#starter-yes-btn'); await sleep(500);
  const skinStep = await E(() => !document.getElementById('starter-step-skin').classList.contains('hidden'));
  if (skinStep) { await page.click('#starter-skin-later-btn'); }
  await sleep(500);
  let b = await bookState();
  check('INTRO.ya_NO_se_abre_al_elegir_guardian_y_el_flujo_sigue_directo', !b.open && (await E(() => window.__done)) === 1 && (await E(() => save.codexBook.introSeen)) === false, b);
  // se juega la primera arena (victoria o derrota) y se vuelve al menú: ahí se OFRECE (cartel con "Leer el Libro" / "Después")
  await E(() => { window.__done = 0; setState('gameover'); });
  check('OFERTA.terminar_una_partida_queda_registrado', await E(() => save.codexBook.ran === true && JSON.parse(localStorage.getItem(SAVE_KEY)).codexBook.ran === true));
  await E(() => { setState('mainmenu'); renderMainMenu(); });
  const offerUp = await waitFor(() => E(() => gameDialogIsOpen()), 6000);
  const offerTxt = await E(() => (document.querySelector('#game-dialog') || {}).textContent || '');
  check('OFERTA.al_volver_al_menu_aparece_el_cartel_sin_abrir_el_libro', offerUp && /El Libro de la Horda/.test(offerTxt) && /Leer el Libro/.test(offerTxt) && /Después/.test(offerTxt) && !(await E(() => BOOK.open)), offerTxt);
  await shot('00b_oferta_del_libro');
  await page.click('#game-dialog .gd-cancel'); await sleep(300);
  check('OFERTA.Despues_no_abre_nada_y_no_se_repite', !(await E(() => BOOK.open)) && (await E(() => save.codexBook.offered)) === true && (await E(() => save.codexBook.introSeen)) === false);
  await E(() => { setState('mainmenu'); renderMainMenu(); }); await sleep(1500);
  check('OFERTA.no_vuelve_a_aparecer_sola', !(await E(() => gameDialogIsOpen())), await E(() => ({offered:save.codexBook.offered,introSeen:save.codexBook.introSeen,ran:save.codexBook.ran,dialog:(document.getElementById('game-dialog')?.textContent||'').trim().slice(0,260)})));
  // "Leer el Libro" → abre la intro de 8 páginas (misma ruta: codexBookOffer → codexBookMaybeIntro)
  await E(() => { save.codexBook.offered = false; setState('mainmenu'); renderMainMenu(); });
  await waitFor(() => E(() => gameDialogIsOpen()), 6000);
  await page.click('#game-dialog .gd-ok'); await sleep(500);
  b = await bookState();
  check('INTRO.se_abre_al_aceptar_la_oferta_(8_paginas)', b.open && b.kind === 'intro' && !b.hidden && b.n === 8, b);
  check('INTRO.queda_registrada_como_vista_ya_al_abrir_(omitir_o_cerrar_el_juego_no_la_repite)', await E(() => save.codexBook.introSeen === true && JSON.parse(localStorage.getItem(SAVE_KEY)).codexBook.introSeen === true));
  const lay = await E(() => { const r = document.querySelector('#codex-book .bk-book').getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: innerWidth, h: innerHeight }; });
  check('INTRO.el_libro_entra_en_844x390', lay.l >= 0 && lay.t >= 0 && lay.r <= lay.w && lay.b <= lay.h - 40, lay);
  await sleep(900); await shot('01_intro_tapa');
  // hojear con el botón: 7 giros hasta la última página; captura a mitad del primer giro
  // se congela la transición a los 420 ms (Web Animations) para medirla y fotografiarla sin depender de la velocidad de la máquina
  await page.click('#codex-book .bk-next');
  const mid = await E(async () => { const leaf = document.querySelector('#codex-book .bk-leaf'); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const a = leaf.getAnimations()[0]; if (a) { a.pause(); a.currentTime = 420; } await new Promise(r => requestAnimationFrame(r));
    return { flipping: BOOK.flipping, anim: !!a, leaf: getComputedStyle(leaf).transform, vis: getComputedStyle(leaf).visibility }; });
  await shot('02_intro_pasando_la_pagina');
  check('INTRO.la_hoja_se_da_vuelta_en_3D_(transform_rotateY_en_curso)', mid.flipping && mid.anim && mid.vis === 'visible' && /matrix3d/.test(mid.leaf), mid);
  await E(() => { const a = document.querySelector('#codex-book .bk-leaf').getAnimations()[0]; if (a) a.finish(); });
  await sleep(300);
  await sleep(900);
  for (let k = 2; k < 8; k++) { await sleep(300); await shot('03_intro_pagina_' + k); await turn(); }
  b = await bookState();
  check('INTRO.llega_a_la_pagina_8_de_8', b.open && b.i === 7, b);
  await shot('04_intro_ultima');
  await turn(); // "✔" cierra
  b = await bookState();
  check('INTRO.al_cerrar_se_vuelve_al_menu', !b.open && b.hidden && (await E(() => state)) === 'mainmenu', b);

  // omitir con el botón "Saltar" desde la primera página
  await E(() => { save.codexBook.introSeen = false; window.__done = 0; codexBookMaybeIntro(() => { window.__done++; }, {}); });
  check('OMITIR.abre_otra_vez_si_no_estaba_vista', await waitBook(true) && (await bookState()).kind === 'intro');
  const t0 = Date.now(); await page.click('#codex-book .bk-skip'); await waitBook(false);
  check('OMITIR.Saltar_cierra_en_el_acto_y_sigue_el_flujo', (await E(() => window.__done)) === 1 && Date.now() - t0 < 6000);
  // ya vista: no vuelve
  await E(() => { window.__done = 0; codexBookMaybeIntro(() => { window.__done++; }, {}); });
  check('OMITIR.una_vez_vista_no_vuelve_a_aparecer_y_no_demora', !(await E(() => BOOK.open)) && (await E(() => window.__done)) === 0 && (await E(() => codexBookOfferDue())) === false);
  // Esc y teclado
  await E(() => { window.__done = 0; codexBookMaybeIntro(() => { window.__done++; }, {}); }); // introSeen ya true => no abre
  check('OMITIR.codexBookMaybeIntro_devuelve_false_si_ya_se_vio', !(await E(() => BOOK.open)) && (await E(() => window.__done)) === 0);
  await E(() => { save.codexBook.introSeen = false; window.__done = 0; codexBookMaybeIntro(() => { window.__done++; }, {}); });
  await waitBook(true); await sleep(700); await page.keyboard.press('ArrowRight'); await sleep(60); await idle();
  check('OMITIR.flecha_derecha_pasa_la_pagina', (await bookState()).i === 1);
  await page.keyboard.press('ArrowLeft'); await sleep(60); await idle();
  check('OMITIR.flecha_izquierda_vuelve_(giro_hacia_atras)', (await bookState()).i === 0);
  await page.keyboard.press('Escape'); await waitBook(false);
  check('OMITIR.Esc_cierra_y_sigue', (await E(() => window.__done)) === 1);
  // tocar el libro pasa de página, pero un toque apurado no saltea una página sin leer
  await E(() => { save.codexBook.introSeen = false; codexBookMaybeIntro(null, {}); }); await waitBook(true);
  const early = await E(() => { document.querySelector('#codex-book .bk-right').click(); return { i: BOOK.i, flipping: BOOK.flipping }; }); // en el mismo cuadro en que abrió: dentro de los 600 ms
  check('OMITIR.un_toque_apurado_no_saltea_la_pagina', early.i === 0 && !early.flipping, early);
  await sleep(800); await page.mouse.click(600, 150); await sleep(60); await idle();
  check('OMITIR.un_toque_tranquilo_pasa_de_pagina', (await bookState()).i === 1);
  await page.click('#codex-book .bk-skip'); await waitBook(false);
  // el camino siguiente es unirse a una sala: no se demora a nadie
  await E(() => { save.codexBook.introSeen = false; window.__done = 0; window.__r = codexBookMaybeIntro(() => { window.__done++; }, { joinsRoom: true }); });
  check('SALA.al_unirse_a_una_sala_no_aparece_ni_demora', !(await E(() => BOOK.open)) && (await E(() => window.__r)) === false && (await E(() => window.__done)) === 0 && (await E(() => save.codexBook.introSeen)) === false);
  await E(() => { save.codexBook.introSeen = true; });

  /* ================= 2. MIGRACIÓN DE UN GUARDADO VIEJO (recargando la página) ================= */
  const legacy = await E(() => { const raw = JSON.parse(localStorage.getItem(SAVE_KEY)); delete raw.codexBook; raw.gems = 99; raw.relics = { hp: 7, dmg: 0, def: 0, vel: 0 }; raw.defeatCount = 5; raw.arenasCleared = Object.assign(raw.arenasCleared || {}, { ciudad: true, fortaleza: true });
    raw.champions.mago.unlocked = true; raw.champions.mago.level = 17; raw.stash = raw.stash || []; localStorage.setItem(SAVE_KEY, JSON.stringify(raw)); return { gems: raw.gems, lvl: raw.champions.mago.level, keys: Object.keys(raw).length }; });
  await page.reload({ waitUntil: 'load', timeout: 180000 }); for (let k = 0; k < 300; k++) { if (await E(() => !document.getElementById('title-continue-btn').disabled)) break; await sleep(100); } await sleep(500);
  const mig = await E(() => ({ cb: save.codexBook, gems: save.gems, relics: save.relics.hp, defeats: save.defeatCount, lvl: save.champions.mago.level, cleared: save.arenasCleared, disk: JSON.parse(localStorage.getItem(SAVE_KEY)).codexBook, keys: Object.keys(JSON.parse(localStorage.getItem(SAVE_KEY))).length }));
  // (el oro no se compara: los logros retroactivos de quests.js pagan oro al cargar, con o sin Libro)
  check('MIGRACION.guardado_viejo_sin_campo_se_completa_sin_perder_nada', mig.gems === 99 && mig.relics === 7 && mig.defeats === 5 && mig.lvl === 17 && mig.cleared.ciudad && mig.cleared.fortaleza && mig.keys >= legacy.keys, mig);
  check('MIGRACION.quien_ya_jugo_no_ve_la_intro_a_la_fuerza_y_sus_arenas_figuran_leidas', mig.cb.introSeen === true && mig.cb.frag.ciudad === 1 && mig.cb.frag.fortaleza === 1 && !('bosque' in mig.cb.frag), mig.cb);
  check('MIGRACION.se_escribio_en_disco', mig.disk && mig.disk.introSeen === true && mig.disk.v === 1, mig.disk);
  check('MIGRACION.sin_nuevos_avisos_de_fragmento', (await E(() => codexBookUnread().length)) === 0);
  // un guardado a medio camino (sin campeón) sí ve la intro
  await E(() => { const raw = JSON.parse(localStorage.getItem(SAVE_KEY)); delete raw.codexBook; for (const k of Object.keys(raw.champions)) raw.champions[k].unlocked = false; raw.arenasCleared = {}; raw.starterChosen = false; localStorage.setItem(SAVE_KEY, JSON.stringify(raw)); });
  await page.reload({ waitUntil: 'load', timeout: 180000 }); for (let k = 0; k < 300; k++) { if (await E(() => !document.getElementById('title-continue-btn').disabled)) break; await sleep(100); } await sleep(500);
  check('MIGRACION.guardado_sin_campeon_ve_la_intro_al_elegir_el_primero', (await E(() => save.codexBook.introSeen)) === false && (await E(() => needsStarterChampion())) === true);
  await E(() => { loop = function () {}; window.__draws = 0; const o = bookArtDraw; bookArtDraw = function () { window.__draws++; return o.apply(this, arguments); };
    for (const k of Object.keys(save.champions)) save.champions[k].unlocked = true; save.codexBook.introSeen = true; save.tut = save.tut || {};
    ['basics','b_move','b_attack','b_skill','b_end','cooldown','hurt','energy','elite','boss','levelup','skillup','revive'].forEach(k => save.tut[k] = 1);
    window.__start = (a, lv, cls) => { selectedClass = cls || 'guerrero'; currentArena = a; lobbyAllies = ['tanque','soporte','mago']; startRun(lv || 1); spawnTimer = 1e12; enemies.length = 0; };
    window.__step = (ms) => { let t = 0; while (t < ms && state === 'playing') { for (const h of heroes){ h.hp = h.maxHp; } update(16); updateHUD(); t += 16; } };
    window.__win = async (a, cls) => { __start(a, 10, cls); state = 'playing'; boss = null; finishBossVictory(); __step(4200); await new Promise(r => setTimeout(r, 250));
      if (typeof STORY_CINE !== 'undefined' && STORY_CINE.open) storyCineClose(); victoryStep = VICTORY_STEPS.length - 1; renderVictoryStep(); }; });

  /* ================= 3. CARGA CORTA ================= */
  await E(() => { state = 'menu'; save.storyPrologueSeen = true; save.tut.goalMission = 1; save.storyActsSeen = { I: 1, II: 1, III: 1 }; save.codexBook.shortCount = {}; save.codexBook.shortOff = false; window.__go = 0; });
  const has = await E(() => runIntroHasStoryPages('bosque'));
  check('CARGA.con_la_historia_ya_vista_no_hay_pantallas_previas', has === false);
  await E(() => { runIntroShow('bosque', () => { window.__go++; }); });
  await sleep(150); b = await bookState(); await shot('10_carga_corta_tapa');
  check('CARGA.abre_el_libro_en_modo_corto_antes_de_la_ficha', b.open && b.kind === 'short' && b.n === 2 && !(await E(() => RUN_INTRO.open)), b);
  const shortLook = await E(() => ({ bar: getComputedStyle(document.querySelector('#codex-book .bk-bar')).display, timer: getComputedStyle(document.querySelector('#codex-book .bk-timer')).display, h: document.querySelector('#codex-book .bk-book').getBoundingClientRect().height }));
  check('CARGA.es_distinta_de_la_intro_(sin_botones_ni_puntos,_libro_mas_chico,_barra_de_tiempo)', shortLook.bar === 'none' && shortLook.timer === 'block' && shortLook.h < lay.b - lay.t, shortLook);
  await sleep(750); await shot('11_carga_corta_pasando'); await sleep(900); await shot('12_carga_corta_pagina');
  const mid2 = await E(() => ({ i: BOOK.i, txt: document.querySelector('#codex-book .bk-title').textContent, kick: document.querySelector('#codex-book .bk-kicker').textContent }));
  check('CARGA.da_vuelta_a_la_pagina_de_la_arena', mid2.i === 1 && mid2.txt.length > 3 && /ARENA 03/.test(mid2.kick), mid2);
  await waitBook(false, 12000);
  check('CARGA.se_cierra_sola_en_unos_3_segundos_y_aparece_la_ficha', (await E(() => RUN_INTRO.open)) === true && !(await E(() => BOOK.open)), await bookState());
  await E(() => { RUN_INTRO.t0 = 0; runIntroGo(); RUN_INTRO.t0 = 0; runIntroGo(); });
  check('CARGA.cuenta_una_vez_por_arena', (await E(() => save.codexBook.shortCount.bosque)) === 1);
  // un toque la saltea al instante
  await E(() => { runIntroShow('bosque', () => { window.__go++; }); }); await waitBook(true);
  const ts = Date.now(); await page.mouse.click(420, 200); await sleep(250);
  check('CARGA.un_toque_la_saltea_y_sigue_a_la_ficha', !(await E(() => BOOK.open)) && (await E(() => RUN_INTRO.open)) === true && Date.now() - ts < 8000);
  await E(() => { RUN_INTRO.t0 = 0; runIntroGo(); RUN_INTRO.t0 = 0; runIntroGo(); });
  // tope de 3 veces
  await E(() => { runIntroShow('bosque', () => {}); }); await waitBook(true); await page.click('#codex-book .bk-skip'); await sleep(200); await E(() => { RUN_INTRO.t0 = 0; runIntroGo(); RUN_INTRO.t0 = 0; runIntroGo(); });
  const c3 = await E(() => save.codexBook.shortCount.bosque);
  await E(() => { runIntroShow('bosque', () => {}); }); await sleep(250);
  check('CARGA.tope_de_3_veces_por_arena_(la_cuarta_va_directo_a_la_ficha)', c3 === 3 && !(await E(() => BOOK.open)) && (await E(() => RUN_INTRO.open)) === true, c3);
  await E(() => { RUN_INTRO.t0 = 0; runIntroGo(); RUN_INTRO.t0 = 0; runIntroGo(); });
  // apagada desde el Códice
  await E(() => { codexBookSetShortOff(true); runIntroShow('hielo', () => {}); }); await sleep(250);
  check('CARGA.apagada_va_directo_a_la_ficha', !(await E(() => BOOK.open)) && (await E(() => RUN_INTRO.open)) === true);
  await E(() => { RUN_INTRO.t0 = 0; runIntroGo(); RUN_INTRO.t0 = 0; runIntroGo(); codexBookSetShortOff(false); });
  // sin las pantallas de historia previas: con historia pendiente no se apila
  await E(() => { save.storyPrologueSeen = false; runIntroShow('ciudad', () => {}); }); await sleep(250);
  check('CARGA.no_se_apila_sobre_el_prologo_ni_la_mision', !(await E(() => BOOK.open)) && (await E(() => RUN_INTRO.open)) === true);
  await E(() => { while (RUN_INTRO.open) { RUN_INTRO.t0 = 0; runIntroGo(); } save.storyPrologueSeen = true; });

  /* ================= 3b. UN SOLO NARRADOR A LA VEZ (el Libro es la voz escrita del Hechicero) ================= */
  const fichaDone = () => E(() => { let g = 0; while (RUN_INTRO.open && g++ < 12) { RUN_INTRO.t0 = 0; runIntroGo(); } });
  const sayLook = () => E(() => { const s = document.querySelector('#run-intro .ri-say'); return { disp: getComputedStyle(s).display, txt: s.textContent, told: RUN_INTRO.bookTold, kill: document.querySelector('#run-intro .ri-kill').textContent.length, goal: document.querySelector('#run-intro .ri-goal').textContent.length, who: document.querySelector('#run-intro .ri-who').textContent }; });
  await E(() => { state = 'menu'; save.storyPrologueSeen = true; save.tut.goalMission = 1; save.storyActsSeen = { I: 1, II: 1, III: 1 }; save.codexBook.shortCount = {}; save.codexBook.shortOff = false; });
  // la página de carga se leyó: la ficha NO repite la frase de apertura (queda lo que el Libro no dice)
  await E(() => { runIntroShow('micelial', () => {}); }); await waitBook(true); await sleep(300);
  const sg = await E(() => document.querySelector('#codex-book .bk-sign').textContent);
  check('NARRADOR.el_libro_va_firmado_por_el_Hechicero_en_cada_pagina', sg === '— El Hechicero Supremo' && /Hechicero/.test(await E(() => document.getElementById('codex-book').getAttribute('aria-label'))), sg);
  await shot('13_carga_firmada_por_el_Hechicero');
  await waitBook(false, 12000); await sleep(300);
  let sl = await sayLook(); await shot('14_ficha_sin_repetir_la_frase');
  check('SECUENCIA.carga_leida_la_ficha_no_repite_la_frase_de_apertura_del_Hechicero', sl.told === true && sl.disp === 'none' && sl.txt === '' && sl.kill > 10 && sl.goal > 10 && sl.who === 'EL HECHICERO SUPREMO', sl);
  await fichaDone();
  // la carga se saltea al instante (no se leyó): la ficha SÍ dice su frase
  await E(() => { runIntroShow('micelial', () => {}); }); await waitBook(true); await page.mouse.click(420, 200); await sleep(300);
  sl = await sayLook();
  check('SECUENCIA.carga_salteada_al_toque_la_ficha_si_dice_su_frase', sl.told === false && sl.disp !== 'none' && /^«/.test(sl.txt), sl);
  await fichaDone();
  // sin carga (apagada o tope): la ficha dice su frase como siempre
  await E(() => { codexBookSetShortOff(true); runIntroShow('hielo', () => {}); }); await sleep(250);
  sl = await sayLook(); await shot('15_ficha_con_su_frase_sin_libro');
  check('SECUENCIA.sin_carga_la_ficha_dice_su_frase', sl.told === false && sl.disp !== 'none' && /^«/.test(sl.txt), sl);
  await fichaDone(); await E(() => codexBookSetShortOff(false));
  // la frase vuelve en la ficha siguiente aunque la anterior la haya ocultado (no queda el estilo pegado)
  await E(() => { save.codexBook.shortCount = {}; runIntroShow('acuatica', () => {}); }); await waitBook(true); await waitBook(false, 12000); await sleep(200); await fichaDone();
  await E(() => { codexBookSetShortOff(true); runIntroShow('minas', () => {}); }); await sleep(250);
  sl = await sayLook(); await fichaDone(); await E(() => { codexBookSetShortOff(false); save.codexBook.shortCount = {}; });
  check('SECUENCIA.la_frase_oculta_no_queda_pegada_para_la_ficha_siguiente', sl.disp !== 'none' && /^«/.test(sl.txt), sl);
  // con el Libro abierto a mano, el Hechicero no habla en el panel ni en la cola, y la ficha espera
  await E(() => { state = 'menu'; codexBookOpenIntro(); }); await waitBook(true); await sleep(200);
  const mute = await E(() => { const r = tutSay('zz_test', 'Texto de prueba del Hechicero', null, 3000); storyEnsureRun(); storySay('hech', 'Voz de prueba de la historia', { wait: 20000 }); return { r, key: TUT.key, q: STORY.q.length, panelHidden: document.getElementById('tut-panel').classList.contains('hidden') }; });
  check('UN_NARRADOR.con_el_libro_abierto_el_panel_del_Hechicero_no_abre', mute.r === false && mute.key === null && mute.panelHidden === true, mute);
  await E(() => { window.__go = 0; runIntroShow('laberinto', () => { window.__go++; }); }); await sleep(900);
  check('UN_NARRADOR.con_el_libro_abierto_la_ficha_del_Hechicero_espera', (await E(() => BOOK.open)) === true && (await E(() => RUN_INTRO.open)) === false);
  await page.keyboard.press('Escape'); await waitBook(false);
  const fichaUp = await waitFor(() => E(() => RUN_INTRO.open), 4000);
  check('UN_NARRADOR.al_cerrar_el_libro_la_ficha_aparece_sola_(no_se_pierde_el_flujo)', fichaUp === true && (await E(() => BOOK.open)) === false);
  await fichaDone(); await E(() => { STORY.q.length = 0; });

  // DESPUÉS DEL LIBRO el flujo no repite: intro LEÍDA → sin prólogo, misión ni Acto I; intro OMITIDA → sigue todo
  await E(() => { save.storyPrologueSeen = false; save.storyActsSeen = {}; save.tut.goalMission = 0; save.codexBook.introSeen = false; save.codexBook.introRead = false; save.codexBook.shortOff = true; });
  await E(() => { codexBookOpenIntro(); }); await waitBook(true); await sleep(250);
  await page.keyboard.press('Escape'); await waitBook(false);
  check('DESPUES_DEL_LIBRO.omitir_la_intro_no_cuenta_como_leida_y_la_historia_sigue_completa', (await E(() => ({ r: save.codexBook.introRead, p: runIntroHasStoryPages('ciudad'), m: goalNeedsMission() }))).r === false && (await E(() => runIntroHasStoryPages('ciudad'))) === true);
  await E(() => { codexBookOpenIntro(); }); await waitBook(true);
  for (let k = 0; k < 7 && (await E(() => BOOK.open && BOOK.i < BOOK.pages.length - 1)); k++) await turn();
  await shot('16_ultima_pagina_firmada');
  for (let k = 0; k < 4 && (await E(() => BOOK.open)); k++) { await page.click('#codex-book .bk-next'); await sleep(120); await idle(); } await waitBook(false);
  const rd = await E(() => ({ r: save.codexBook.introRead, m: goalNeedsMission(), p: runIntroHasStoryPages('ciudad'), persisted: JSON.parse(localStorage.getItem(SAVE_KEY)).codexBook.introRead }));
  check('DESPUES_DEL_LIBRO.leer_la_intro_hasta_el_final_la_marca_leida_y_se_guarda', rd.r === true && rd.persisted === true, rd);
  check('DESPUES_DEL_LIBRO.intro_leida_la_ficha_no_repite_mision_ni_prologue_ni_Acto_I', rd.m === false && rd.p === false, rd);
  await E(() => { runIntroShow('ciudad', () => {}); }); await sleep(250);
  const noRepeat = await E(() => ({ prologue: RUN_INTRO.prologue, pages: RUN_INTRO.pages.length, seen: save.storyPrologueSeen, actI: !!(save.storyActsSeen && save.storyActsSeen.I) }));
  check('DESPUES_DEL_LIBRO.la_ficha_de_la_Ciudad_va_directo_a_la_ficha_de_arena', noRepeat.prologue === false && noRepeat.pages === 0 && noRepeat.seen === true && noRepeat.actI === true, noRepeat);
  await shot('17_ficha_directa_tras_leer_el_libro');
  await fichaDone();
  // el Acto II no se saltea: el Libro no lo cuenta
  check('DESPUES_DEL_LIBRO.el_cartel_del_Acto_II_sigue_apareciendo', (await E(() => runIntroHasStoryPages('micelial'))) === true);
  // la práctica completada cuenta la misión
  await E(() => { save.tut.goalMission = 0; save.codexBook.introRead = false; });
  check('DESPUES_DEL_LIBRO.sin_leer_el_libro_la_mision_sigue_para_quien_no_hizo_la_practica', (await E(() => goalNeedsMission())) === true);
  await E(() => { save.codexBook.shortOff = false; save.tut.goalMission = 1; save.codexBook.introRead = true; save.codexBook.introSeen = true; save.storyPrologueSeen = true; save.storyActsSeen = { I: 1, II: 1, III: 1 }; });

  // la oferta del Libro no se pone encima de otra capa de historia: espera y aparece cuando queda libre
  await E(() => { state = 'mainmenu'; renderMainMenu(); save.codexBook.introSeen = false; save.codexBook.introRead = false; save.codexBook.offered = false; save.codexBook.ran = true; RUN_INTRO.open = true; codexBookOfferSoon(); });
  await sleep(3200);
  const held = await E(() => ({ dlg: gameDialogIsOpen(), offered: save.codexBook.offered }));
  check('SECUENCIA.la_oferta_del_Libro_espera_si_la_ficha_del_Hechicero_esta_abierta', held.dlg === false && held.offered === false, held);
  await E(() => { RUN_INTRO.open = false; });
  const offUp = await waitFor(() => E(() => gameDialogIsOpen()), 6000);
  const offerTxt2 = await E(() => (document.querySelector('#game-dialog') || {}).textContent || '');
  check('SECUENCIA.al_quedar_libre_la_oferta_aparece_y_habla_el_Hechicero', offUp && /El Libro de la Horda/.test(offerTxt2) && /— El Hechicero/.test(offerTxt2) && /Leer el Libro/.test(offerTxt2), offerTxt2);
  await shot('18_oferta_del_Hechicero');
  await page.click('#game-dialog .gd-cancel'); await sleep(300);
  await E(() => { save.codexBook.introSeen = true; save.codexBook.introRead = true; state = 'menu'; });

  /* ================= 4. COOPERATIVO / MULTIJUGADOR: nunca frena a otros ================= */
  await E(() => { window.__realNet = netInRoom; netInRoom = () => true; window.__go = 0; runIntroShow('hielo', () => { window.__go++; }); });
  await sleep(250);
  check('COOP.en_una_sala_la_carga_corta_no_aparece', !(await E(() => BOOK.open)) && (await E(() => RUN_INTRO.open)) === true);
  await E(() => { while (RUN_INTRO.open) { RUN_INTRO.t0 = 0; runIntroGo(); } });
  check('COOP.en_una_sala_la_intro_no_aparece', (await E(() => { save.codexBook.introSeen = false; return codexBookMaybeIntro(() => {}, {}); })) === false && !(await E(() => BOOK.open)));
  await E(() => { save.codexBook.introSeen = true; netInRoom = window.__realNet; });
  // si el jugador entra a una sala con el libro automático abierto, se cierra solo y sigue el flujo
  await E(() => { window.__done = 0; save.codexBook.introSeen = false; codexBookMaybeIntro(() => { window.__done++; }, {}); }); await waitBook(true);
  await E(() => { netInRoom = () => true; }); await sleep(250);
  check('COOP.si_entra_a_una_sala_con_el_libro_abierto_se_cierra_solo_y_sigue_el_flujo', !(await E(() => BOOK.open)) && (await E(() => window.__done)) === 1);
  // releer SIEMPRE se puede (incluso en una sala), y no se cierra solo
  await E(() => { codexBookOpenIntro(); }); await sleep(600);
  check('COOP.releer_desde_el_Codice_siempre_se_puede_(y_no_se_cierra_solo)', (await bookState()).open && (await bookState()).kind === 'revisit');
  await page.keyboard.press('Escape'); await waitBook(false);
  await E(() => { netInRoom = window.__realNet; });
  check('COOP.el_libro_es_100%_local_(sin_eventos_de_red_ni_pausa)', await E(() => !(typeof NET_EVENT_FNS !== 'undefined' && NET_EVENT_FNS.some(n => /book|codex/i.test(n))) && state !== 'paused'));
  // nunca jugando
  await E(() => { __start('bosque', 1); });
  check('COOP.jugando_ningun_disparo_automatico', (await E(() => ({ a: codexBookCanAuto(), b: codexBookShortDue('bosque'), c: (save.codexBook.introSeen = false, codexBookIntroDue()) }))).a === false);
  await E(() => { save.codexBook.introSeen = true; state = 'menu'; });

  /* ================= 5. VICTORIA: fragmento de la arena ================= */
  const vic = await E(async () => { await __win('bosque', 'cazadora'); victoryStep = 0; renderVictoryStep();
    const steps = []; let guard = 0;
    while (guard++ < 8) { steps.push({ i: victoryStep, title: document.getElementById('victory-step-title').textContent, book: !!document.querySelector('#victory-step-body .vic-book') });
      if (victoryStep >= VICTORY_STEPS.length - 1) break; const nb = document.getElementById('victory-next-btn'); nb.disabled = false; nb.click(); await new Promise(r => setTimeout(r, 300)); }
    return { steps }; });
  check('VICTORIA.hay_un_paso_propio_Fragmento_del_Libro_entre_las_recompensas_y_el_cierre', vic.steps.some(s => s.book && /Fragmento del Libro/.test(s.title)) && vic.steps[vic.steps.length - 1].i === 4, vic);
  await E(() => { document.getElementById('victory-next-btn').disabled = false; victoryStep = 3; renderVictoryStep(); });
  await sleep(1500);
  const vb = await E(() => { const b3 = document.getElementById('victory-step-body'), f = b3.querySelector('.vic-book'), r = f ? f.getBoundingClientRect() : null, nb = document.getElementById('victory-next-btn').getBoundingClientRect();
    return { st: state, txt: f ? f.textContent : '', btn: !!b3.querySelector('[data-book-frag="bosque"]'), un: codexBookFragmentUnlocked('bosque'), seen: codexBookFragmentSeen('bosque'), next: !document.getElementById('victory-next-btn').classList.contains('hidden'),
      sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, cardBottom: r && r.bottom, nextTop: nb.top, ch: innerHeight,
      art: (() => { const cv = b3.querySelector('.vb-art'); if (!cv || !cv.width) return 0; const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let k = 0; k < d.length; k += 400) if (d[k + 3] > 0) n++; return n; })() }; });
  check('VICTORIA.la_tarjeta_trae_historia_y_lo_que_se_aprende_(equipo,_Gemas)', vb.st === 'victory' && /EL GUARDI[ÁA]N DE LA NIEBLA/.test(vb.txt) && /LO QUE LLEV[ÁA]S PUESTO/.test(vb.txt) && /Gemas/.test(vb.txt) && /celda/.test(vb.txt) && /— El Hechicero Supremo/.test(vb.txt) && vb.btn, vb);
  check('VICTORIA.la_ilustracion_se_dibuja_(canvas_con_pixeles)', vb.art > 50, vb.art);
  check('VICTORIA.completar_la_arena_abre_el_fragmento_y_verlo_lo_marca_leido', vb.un && vb.seen, vb);
  check('VICTORIA.no_bloquea_(Continuar_visible)_y_sin_desborde_horizontal', vb.next && vb.sw <= vb.cw, vb);
  await shot('20_victoria_fragmento');
  await page.click('.vic-book [data-book-frag]'); await sleep(600); b = await bookState(); await shot('21_victoria_fragmento_abierto');
  check('VICTORIA.Leer_en_el_libro_abre_el_visor_animado_con_historia_y_leccion', b.open && b.kind === 'fragment' && b.n === 2, b);
  await turn(); await shot('22_victoria_fragmento_leccion'); await turn();
  check('VICTORIA.al_cerrar_la_victoria_sigue_intacta', !(await E(() => BOOK.open)) && (await E(() => state)) === 'victory' && !(await E(() => document.getElementById('victory-next-btn').disabled)));
  // arenas sin fragmento (Divina) se saltean el paso solas
  const skipStep = await E(async () => { const save0 = victoryData; victoryData = Object.assign({}, victoryData, { arena: 'divina' }); victoryStep = 2; const r = [VICTORY_STEPS[3].skip()]; victoryData = Object.assign({}, save0, { arena: 'bosque' }); r.push(VICTORY_STEPS[3].skip()); victoryData = save0; return r; });
  check('VICTORIA.el_paso_se_omite_solo_donde_no_hay_fragmento', skipStep[0] === true && skipStep[1] === false, skipStep);
  await E(() => { victoryStep = VICTORY_STEPS.length - 1; renderVictoryStep(); });
  // el flujo normal: Continuar sigue funcionando con o sin leer el fragmento
  const nxt = await E(async () => { document.getElementById('victory-next-btn').click(); await new Promise(r => setTimeout(r, 300)); return { state, camp: !!(typeof CAMP !== 'undefined' && CAMP.open) }; });
  check('VICTORIA.Continuar_sigue_al_flujo_de_siempre_(campamento_o_sala)', nxt.state !== 'victory' || nxt.camp, nxt);
  await E(() => { if (typeof campClose === 'function' && CAMP.open) campClose(true); setState('mainmenu'); renderMainMenu(); });

  /* ================= 6. CÓDICE › EL LIBRO ================= */
  await E(() => { save.codexBook.introSeen = false; save.arenasCleared.ciudad = true; save.arenasCleared.bosque = true; delete save.codexBook.frag.ciudad; openCodex(); });
  await sleep(500); await shot('30_codice_home');
  const home = await E(() => { const e = document.querySelector('.cx-home-book'); return e ? { txt: e.textContent, nw: !!e.querySelector('.cxb-new') } : null; });
  check('CODICE.la_home_tiene_la_franja_El_Libro_con_aviso_NUEVO', home && /EL LIBRO/.test(home.txt) && home.nw, home);
  await page.click('.cx-home-book'); await sleep(500); await shot('31_codice_el_libro');
  const list = await E(() => ({ won: Object.keys(BOOK_FRAGMENTS).filter(codexBookFragmentUnlocked).length, cards: document.querySelectorAll('.cxb-card').length, locked: document.querySelectorAll('.cxb-card.locked').length, open: document.querySelectorAll('[data-book-frag]').length, intro: !!document.querySelector('[data-book-intro]'),
    ov: document.getElementById('codex-body').scrollWidth > document.getElementById('codex-body').clientWidth + 1 }));
  check('CODICE.lista_con_intro_y_un_fragmento_por_arena_(los_no_ganados_figuran_bloqueados)', list.cards === 11 && list.intro && list.won >= 2 && list.open === list.won && list.locked === 10 - list.won && !list.ov, list);
  await page.click('[data-book-intro]'); await sleep(600); b = await bookState();
  check('CODICE.la_intro_se_puede_releer_siempre_(modo_revisit)', b.open && b.kind === 'revisit' && b.n === 8, b);
  await shot('32_codice_releyendo_intro');
  await page.keyboard.press('Escape'); await waitBook(false);
  check('CODICE.al_cerrar_vuelve_al_Codice', (await E(() => state)) === 'codex' && (await E(() => !!document.querySelector('.cxb-grid'))));
  await page.click('[data-book-frag="ciudad"]'); await sleep(600);
  check('CODICE.abrir_un_fragmento_ganado_lo_marca_leido', (await bookState()).kind === 'fragment' && (await E(() => codexBookFragmentSeen('ciudad'))) === true);
  await page.keyboard.press('Escape'); await waitBook(false);
  const forced = await E(() => codexBookOpenFragment('infernal', null));
  check('CODICE.un_fragmento_sin_ganar_no_se_abre_(sin_spoilers)', forced === false && !(await E(() => BOOK.open)));
  await page.click('[data-book-short]'); await sleep(200);
  check('CODICE.se_apagan_las_paginas_de_carga', (await E(() => save.codexBook.shortOff)) === true && /Activar/.test(await E(() => document.querySelector('[data-book-short]').textContent)));
  await page.click('[data-book-short]'); await sleep(200);
  check('CODICE.y_se_vuelven_a_prender', (await E(() => save.codexBook.shortOff)) === false);
  await page.click('[data-book-reset]'); await sleep(200);
  check('CODICE.volver_a_ver_la_intro_la_deja_pendiente', (await E(() => save.codexBook.introSeen)) === false);
  await E(() => { save.codexBook.introSeen = true; setState('mainmenu'); });

  /* ================= 7. TEXTO SIN RECORTES EN TODAS LAS PÁGINAS (844×390) ================= */
  const measureFit = () => E(async () => { const bad = [], all = [['intro', codexBookIntroPages()]]; { const was = save.storyPrologueSeen; save.storyPrologueSeen = true; all.push(['intro-recap', codexBookIntroPages()]); save.storyPrologueSeen = was; }
    for (const a of Object.keys(BOOK_FRAGMENTS)) all.push(['frag:' + a, codexBookFragmentPages(a)]);
    for (const a of Object.keys(BOOK_SHORT_LINES)) all.push(['short:' + a, codexBookShortPages(a)]);
    let n = 0;
    for (const [id, pages] of all) {
      codexBookPlay(id.startsWith('short') ? 'short' : 'revisit', pages, {});
      for (let i = 0; i < pages.length; i++) { BOOK.i = i; bookRender(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); n++;
        const t = document.querySelector('#codex-book .bk-right .bk-text'), r = document.querySelector('#codex-book .bk-book').getBoundingClientRect();
        if (t.scrollHeight > t.clientHeight + 1 || r.bottom > innerHeight || r.right > innerWidth) bad.push(id + '#' + i + ' ' + t.scrollHeight + '>' + t.clientHeight); }
      bookClose('x'); }
    return { n, bad }; });
  const fit = await measureFit();
  check('TEXTO.todas_las_paginas_(' + fit.n + ')_entran_sin_recortes_en_844x390', fit.n >= 8 + 8 + 21 && fit.bad.length === 0, fit);
  await page.setViewportSize({width:667,height:375});
  const smallFit = await measureFit();
  check('TEXTO.todas_las_paginas_(' + smallFit.n + ')_entran_sin_recortes_en_667x375', smallFit.n === fit.n && smallFit.bad.length === 0, smallFit);
  await page.setViewportSize({width:844,height:390});
  const draws0 = await E(() => window.__draws); await sleep(400);
  check('RENDIMIENTO.cerrado_el_libro_no_se_sigue_dibujando', (await E(() => window.__draws)) === draws0);
  // el visor dibuja una vez por cuadro de pantalla (se compara con los cuadros reales, así no depende de lo cargada que esté la máquina)
  const anim = await E(async () => { codexBookPlay('revisit', codexBookIntroPages(), {}); let raf = 0, on = true; const tick = () => { raf++; if (on) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
    const d0 = window.__draws; await new Promise(r => setTimeout(r, 1500)); on = false; const draws = window.__draws - d0; bookClose('x'); return { raf, draws }; });
  check('RENDIMIENTO.dibuja_a_ritmo_de_pantalla_mientras_esta_abierto', anim.raf >= 2 && anim.draws >= anim.raf * 0.8 && anim.draws <= anim.raf * 1.3 + 2, anim);

  /* ================= 8. MOVIMIENTO REDUCIDO y VERTICAL ================= */
  const red = await boot(browser, { reducedMotion: 'reduce' });
  await red.page.evaluate(() => { loop = function () {}; codexBookOpenIntro(); });
  await sleep(300); await red.page.click('#codex-book .bk-next'); await sleep(100);
  const rm = await red.page.evaluate(() => ({ i: BOOK.i, flipping: BOOK.flipping, leafOn: document.querySelector('#codex-book .bk-leaf').classList.contains('on') }));
  check('ACCESIBILIDAD.movimiento_reducido_cambia_de_pagina_sin_giro', rm.i === 1 && !rm.flipping && !rm.leafOn, rm);
  await red.ctx.close();
  const por = await boot(browser, { viewport: { width: 390, height: 844 } });
  await por.page.evaluate(() => { loop = function () {}; codexBookOpenIntro(); });
  await sleep(500); await por.page.click('#codex-book .bk-next'); await sleep(200);
  const pv = await por.page.evaluate(() => { const r = document.querySelector('#codex-book .bk-book').getBoundingClientRect(), t = document.querySelector('#codex-book .bk-right .bk-text');
    return { cls: document.getElementById('codex-book').classList.contains('bk-portrait'), l: r.left, rr: r.right, w: innerWidth, b: r.bottom, h: innerHeight, over: t.scrollHeight > t.clientHeight + 1, i: BOOK.i }; });
  if (OUT) await por.page.screenshot({ path: `${OUT}/40_vertical.png` });
  check('ACCESIBILIDAD.en_vertical_se_apila_y_entra_en_pantalla', pv.cls && pv.l >= 0 && pv.rr <= pv.w && pv.b <= pv.h && !pv.over && pv.i === 1, pv);
  await por.ctx.close();

  check('SIN_ERRORES.consola_y_excepciones', errors.length === 0, errors);
  await browser.close(); await site.close();
  console.log(fails ? '\n' + fails + ' FALLAS' : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('FALLO DE LA PRUEBA', e); process.exit(2); });
