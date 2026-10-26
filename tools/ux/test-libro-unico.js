'use strict';
// EL LIBRO ES LA ÚNICA VOZ DEL HECHICERO (docs/lore/LIBRO_TINTA_CHINA.md).
//   Parte A (sin navegador): vocabulario, largo, canon por arena y vicios de redacción de TODOS los textos del Libro; la ficha de arena
//   es neutra (sin voz, retrato, alas ni frase de apertura del Hechicero).
//   Parte B (Playwright, 844x390, 667x375 y 1280x720): secuencia al entrar a CADA arena: página del Libro (saltable) → se cierra del todo →
//   ficha neutra SOLO para novatos (arena sin completar) → partida; nunca juntos. Veteranos: solo el Libro. Durante la partida el
//   Hechicero no aconseja ni comenta (solo indicaciones neutras de controles y voces de jefes). La info está a pedido en Códice › Arenas y
//   en la pausa › Ayuda. Primer despliegue: el Libro se lee sobre la pantalla de carga solo la primera vez que se abre el juego.
//   node tools/ux/test-libro-unico.js
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const H = require('../lib/serve');
const ROOT = path.resolve(__dirname, '../..');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (!ok && x !== undefined ? '  ' + JSON.stringify(x).slice(0, 400) : '')); if (!ok) fails++; };
const ARENAS = ['ciudad', 'fortaleza', 'bosque', 'micelial', 'hielo', 'acuatica', 'laberinto', 'abismo', 'minas', 'infernal'];

/* ================= A. TEXTOS ================= */
const c = {}; vm.createContext(c);
vm.runInContext(rd('js/data/codex-book-text.js') + ';this.I=BOOK_INTRO_PAGES;this.S=BOOK_SHORT_LINES;this.F=BOOK_FRAGMENTS;', c);
const T = []; // {w, t, arena, kind}
c.I.forEach((p, i) => { T.push({ w: 'intro' + (i + 1), t: p.text, kind: 'intro', min: 120, max: 360 }); if (p.recap) T.push({ w: 'recap' + (i + 1), t: p.recap, kind: 'intro', min: 120, max: 360 }); });
ARENAS.forEach(a => {
  T.push({ w: 'short:' + a, t: c.S[a], arena: a, kind: 'short', min: 30, max: 165 });
  T.push({ w: 'lore:' + a, t: c.F[a].lore, arena: a, kind: 'lore', min: 120, max: 360 });
  T.push({ w: 'lesson:' + a, t: c.F[a].lesson, arena: a, kind: 'lesson', min: 120, max: 360 });
});
check('TEXTO.cantidad_de_paginas_intacta_(8_de_intro,_10_cargas,_10_fragmentos)', c.I.length === 8 && Object.keys(c.S).length === 10 && Object.keys(c.F).length === 10 && c.I.every(p => p.kicker && p.title && p.art));
const bad = (re, list) => (list || T).filter(x => re.test(x.t)).map(x => x.w + ': ' + (x.t.match(re) || [])[0]);
check('TEXTO.largo_que_entra_en_la_caja_del_visor', T.every(x => x.t.length >= x.min && x.t.length <= x.max), T.filter(x => x.t.length < x.min || x.t.length > x.max).map(x => x.w + ' ' + x.t.length));
check('TEXTO.cargas_cortas_de_2_a_4_frases', ARENAS.every(a => { const n = (c.S[a].match(/[.]\s|[.]$/g) || []).length; return n >= 2 && n <= 4; }), ARENAS.map(a => (c.S[a].match(/[.]\s|[.]$/g) || []).length));
check('TEXTO.fragmentos_de_3_a_6_frases', ARENAS.every(a => { const n = (c.F[a].lore.match(/[.]\s|[.]$/g) || []).length; return n >= 3 && n <= 6; }), ARENAS.map(a => (c.F[a].lore.match(/[.]\s|[.]$/g) || []).length));
// ningún texto del Libro explica mecánicas de juego
const MECH = /mantené|mantene|bot[oó]n|nivel 10|\bfase|cooldown|✚|✖|joystick|tocá|apretá|\bclic|\bHUD\b|\bbarra\b|\bXP\b|recarga|enfriamiento/i;
check('VOCABULARIO.sin_palabras_de_mecanica_de_juego', bad(MECH).length === 0, bad(MECH));
// vicios de redacción prohibidos
const IA = /susurr|sombra|\becos?\b|tapiz|en lo profundo|ancestral|\bcomo un[ao]?s?\b|[!¡¿?]|—|–/i;
check('VOCABULARIO.sin_los_vicios_de_IA_(susurros,_sombras,_ecos,_tapiz,_ancestral,_exclamaciones,_preguntas,_rayas)', bad(IA).length === 0, bad(IA));
const NOES = /\bno (es|era|son|fue) [^.;:]{1,50}[,;:]? (sino|es|era|son|fue)\b|\bno [a-záéíóú]+ [^.]{0,30}: [a-záéíóú]+/i;
check('VOCABULARIO.sin_no_es_X,_es_Y', bad(/\bno (es|era|son|fue) [^.;]{1,50}[,;:] (sino|es|era|son|fue)\b|\bno es [^.]{1,40}\. Es\b/i).length === 0, bad(/\bno (es|era|son|fue) [^.;]{1,50}[,;:] (sino|es|era|son|fue)\b/i));
check('VOCABULARIO.sin_moraleja_ni_cierre_sentencioso_(ultima_frase_sin_siempre/nunca/todo/nadie_como_sentencia)', T.filter(x => x.kind === 'lore').every(x => { const last = x.t.split(/(?<=[.])\s/).pop(); return !/\b(siempre|nunca|todo|todos|nadie|la vida|el destino)\b/i.test(last); }), T.filter(x => x.kind === 'lore').map(x => x.t.split(/(?<=[.])\s/).pop()));
check('VOZ.voseo_rioplatense_sin_tuteo_ni_vosotros', bad(/\b(tú|tienes|puedes|quieres|sabes|vosotros|haz|pulsa|elige|escucha|ven|mira|toma)\b/).length === 0 && /Escuchame|Pasá|Acordate|Leelas|Podés|ayudalo/.test(JSON.stringify([c.I, c.F])), bad(/\b(tú|tienes|puedes|quieres|sabes|vosotros)\b/));
check('VOZ.cada_pagina_trae_un_detalle_concreto_(un_numero,_un_objeto_o_un_nombre)', T.filter(x => x.kind === 'lore' || x.kind === 'short').every(x => /\d|veintiséis|cuarenta|dos de cada|bellotas|campanas|lonas|cadena|cartas|faro|farera|Maren|nombres|perro|lámpara|menhires|mulas|hornos|camas|puertas|cristal/i.test(x.t)));
// ritmo: ninguna carga ni fragmento empieza igual que otro (tres primeras palabras) y cada fragmento mezcla frases largas con una de 5 palabras o menos
const first3 = x => x.t.split(/\s+/).slice(0, 3).join(' ').toLowerCase();
const fl = T.filter(x => x.kind === 'lore' || x.kind === 'short').map(first3);
check('RITMO.sin_estructura_repetida_entre_paginas_(inicios_distintos)', new Set(fl).size === fl.length, fl);
check('RITMO.cada_fragmento_tiene_una_frase_corta_(<=5_palabras)_entre_las_largas', ARENAS.every(a => { const s = c.F[a].lore.split(/(?<=[.])\s+/); return s.some(x => x.replace(/[.]/g, '').split(/\s+/).length <= 5) && s.some(x => x.split(/\s+/).length >= 9); }), ARENAS.filter(a => { const s = c.F[a].lore.split(/(?<=[.])\s+/); return !(s.some(x => x.replace(/[.]/g, '').split(/\s+/).length <= 5) && s.some(x => x.split(/\s+/).length >= 9)); }));
// CANON por arena (docs/lore/LA_HORDA_LORE_BIBLE.md §5 y §9, cabecera de codex-book-text.js)
const SUSP = /te lo cuido|cuide yo|cuidarte|insisto|no lo anoto|no (lo|le) escuch|no le creas|Traeme|no las leas|no le des tu atención|mentí/i;
const intro = T.filter(x => x.kind === 'intro');
check('CANON.intro_y_arenas_1_a_3_sin_ninguna_sospecha', [...intro, ...T.filter(x => ['ciudad', 'fortaleza', 'bosque'].includes(x.arena) && x.kind !== 'lesson')].every(x => !SUSP.test(x.t)), bad(SUSP, [...intro, ...T.filter(x => ['ciudad', 'fortaleza', 'bosque'].includes(x.arena))]));
check('CANON.arena_4_primera_grieta_(insiste_en_cuidar_el_cristal)', /cuide yo/.test(c.S.micelial) && /Insisto en cuidarte el cristal/.test(c.F.micelial.lore));
const lastS = t => t.trim().split(/(?<=[.])\s+/).pop();
check('CANON.arenas_5_y_6_mas_interes_por_los_cristales_que_por_el_guardian_(la_ultima_frase_es_del_cristal)', /cristal/i.test(lastS(c.F.hielo.lore)) && /cristal/i.test(lastS(c.F.acuatica.lore)) && /cristal/i.test(c.S.hielo) && /cristal/i.test(c.S.acuatica));
check('CANON.arena_7_descarta_la_advertencia_del_Tercero', /No lo anoto/.test(c.F.laberinto.lore) && /no lo escuches/i.test(c.S.laberinto) && /Tercero/.test(c.S.laberinto));
const SPOIL = /Primero de los Cuatro|fui el Primero|fundir los cristales|ser la Horda|por decisi[oó]n propia|Te ment[ií]|eleg[ií] quedarme|quise\b/i;
const pre = T.filter(x => x.arena !== 'infernal');
check('CANON.antes_de_la_Infernal_ningun_texto_adelanta_la_traicion', bad(SPOIL, pre).length === 0, bad(SPOIL, pre));
check('CANON.solo_el_fragmento_de_la_Infernal_confiesa', /Fui el Primero de los Cuatro/.test(c.F.infernal.lore) && /Te mentí/.test(c.F.infernal.lore) && /ser la Horda/.test(c.F.infernal.lore) && /me quedé con la Horda porque quise/.test(c.F.infernal.lore) && !SPOIL.test(c.S.infernal), c.F.infernal.lore);
check('CANON.el_Hechicero_no_dice_haber_sido_Guardian_antes_de_la_Infernal', pre.every(x => !/\b(fui|era|soy) (uno de los |el )?(Guardi|Primero|cuarto)/i.test(x.t)));
check('CANON.la_Cronica_de_la_Noche_del_Regreso_de_Ismena_no_se_toca_(sin_Ismena_en_el_Libro)', T.every(x => !/Ismena/i.test(x.t)) && /Ismena/.test(rd('js/data/story-text.js')));

/* ================= A2. LA FICHA ES NEUTRA ================= */
const html = rd('index.html'), ri = rd('js/ui/run-intro.js');
check('FICHA.index.html_ficha_neutra_(sin_canvas_de_retrato,_sin_nombre_del_Hechicero)', /id="run-intro"[^>]*aria-label="Ficha de arena"/.test(html) && /FICHA DE ARENA/.test(html) && !/class="ri-art"/.test(html) && !/EL HECHICERO/.test(html.slice(html.indexOf('id="run-intro"'), html.indexOf('id="run-intro"') + 900)) && /js\/data\/arena-brief\.js/.test(html));
check('FICHA.run_intro.js_sin_alas,_retrato,_frase_de_apertura_ni_voz_del_Hechicero_y_con_el_Libro_antes', !/HECH_PORTRAIT|_riWing|runIntroDraw|EL HECHICERO|B\.say|bookTold/.test(ri) && /codexBookShort\(/.test(ri) && /runIntroNovice/.test(ri));
const brief = {}; vm.createContext(brief); vm.runInContext(rd('js/data/arena-brief.js') + ';this.B=ARENA_BRIEF;', brief);
check('FICHA.datos_neutros_por_arena_(objetivo,_amenaza,_ayuda)_sin_voz_del_Hechicero', ARENAS.every(a => brief.B[a] && brief.B[a].goal && brief.B[a].kill && brief.B[a].help && !brief.B[a].say) && !/Hechicero|«|Yo te|Traeme/.test(JSON.stringify(brief.B)) && ARENAS.every(a => ['goal', 'kill', 'help'].every(k => brief.B[a][k].length <= 190)), Object.keys(brief.B));
check('FICHA.textos_directos_sin_vicios_de_IA', !/[!¡¿?]|—|susurr|sombra|\becos?\b|tapiz|ancestral/i.test(JSON.stringify(brief.B)));
const tut = rd('js/systems/tutorial.js'), story = rd('js/systems/story.js');
check('VOZ.tutSay_descarta_todo_lo_que_no_sea_indicacion_neutra_o_voz_de_otro_personaje', /TUT_NEUTRAL/.test(tut) && /if\(!who && !TUT_NEUTRAL\[key\] && !TUT_VILLAIN\[key\]\) return false/.test(tut) && /w\.name===STORY_WHO\.hech\.name\) return false/.test(story));
check('VOZ.sin_el_segundo_tutorial_de_combate_ni_arena-tutorials_encendidos', !/tutSay\("(hurt|energy|elite|boss|ult|levelup|cooldown)"/.test(tut) && /const ARENA_TUT_ON = false/.test(rd('js/systems/arena-tutorials.js')));

/* ================= B. NAVEGADOR ================= */
async function boot(browser, viewport, base) {
  const ctx = await browser.newContext({ viewport });
  await ctx.route('**/*', route => { const u = new URL(route.request().url()); return u.origin === new URL(base).origin || ['data:', 'blob:'].includes(u.protocol) ? route.continue() : route.abort('blockedbyclient'); });
  const page = await ctx.newPage(), errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.addInitScript(() => { window.__campaignMode = true; window.__codexBook = true; });
  await H.goto(page, base + '/index.html', { waitUntil: 'load', timeout: 180000 });
  for (let k = 0; k < 300; k++) { if (await page.evaluate(() => { const b = document.getElementById('title-continue-btn'); return !!b && !b.disabled; })) break; await sleep(100); }
  await sleep(400);
  await page.evaluate(() => { if (BOOK.open) bookClose('skip'); for (const k of Object.keys(save.champions)) save.champions[k].unlocked = true; save.codexBook.introSeen = true; save.codexBook.shortCount = {}; save.starterChosen = true;
    save.tut = save.tut || {}; ['training', 'basics', 'b_move', 'b_attack', 'b_skill', 'b_end', 'skillup', 'revive', 'goalMission', 'goalEntry', 'soloIntro'].forEach(k => save.tut[k] = 1);
    save.storyPrologueSeen = true; save.storyActsSeen = { I: 1, II: 1, III: 1 }; });
  return { ctx, page, errors };
}
(async () => {
  const site = await H.startSite({ envUrl: ['SE_BASE_URL'] }); const base = site.url, browser = await H.launch();
  try {
    for (const vp of [{ width: 844, height: 390 }, { width: 667, height: 375 }]) {
      const tag = vp.width + 'x' + vp.height, { ctx, page, errors } = await boot(browser, vp, base), E = (fn, a) => page.evaluate(fn, a);
      await E(() => { loop = function () {}; });
      // ---- cada arena de la campaña: Libro → (cierra del todo) → ficha neutra solo para novatos → partida ----
      for (const a of ARENAS) {
        const r = await E(async a => {
          const wait = ms => new Promise(r => setTimeout(r, ms)), out = {};
          for (const mode of ['novato', 'veterano']) {
            state = 'prep'; currentArena = a; selectedClass = 'guerrero'; save.codexBook.shortCount = {}; window.__go = 0; save.arenasCleared = mode === 'veterano' ? { [a]: true } : {}; save.storyPrologueSeen = true; save.tut.goalMission = 1; save.storyActsSeen = { I: 1, II: 1, III: 1 };
            runIntroShow(a, () => { window.__go++; }); await wait(120);
            const o = { book: BOOK.open, kind: BOOK.kind, fichaDuring: RUN_INTRO.open, fichaVis: !document.getElementById('run-intro').classList.contains('hidden'), skipBtn: !!document.querySelector('#codex-book .bk-skip'), go0: window.__go };
            bookClose('skip'); await wait(80);
            const el = document.getElementById('run-intro');
            o.bookAfter = BOOK.open; o.ficha = RUN_INTRO.open && !el.classList.contains('hidden'); o.go1 = window.__go;
            if (o.ficha) { const say = el.querySelector('.ri-say'), txt = el.innerText;
              Object.assign(o, { who: el.querySelector('.ri-who').textContent, goal: el.querySelector('.ri-goal').textContent === ARENA_BRIEF[a].goal || /SOBREVIV/.test(el.querySelector('.ri-goal').textContent), kill: el.querySelector('.ri-kill').textContent === ARENA_BRIEF[a].kill, help: el.querySelector('.ri-help').textContent === ARENA_BRIEF[a].help,
                sayVisible: getComputedStyle(say).display !== 'none' && say.textContent.trim() !== '', hechTxt: (() => { const cl = el.cloneNode(true); cl.querySelectorAll('.abr-cell.boss').forEach(x => x.remove()); return /hechicero/i.test(cl.textContent); })(), canvas: !!el.querySelector('canvas'), cells: el.querySelectorAll('.abr-cell').length, bookWith: BOOK.open });
              RUN_INTRO.t0 = 0; runIntroGo(true); o.go2 = window.__go; o.fichaClosed = !RUN_INTRO.open; }
            out[mode] = o;
          }
          return out; }, a);
        const n = r.novato, v = r.veterano;
        check(`${tag}.ENTRADA.${a}.novato_primero_el_Libro_(solo,_saltable)_y_nunca_junto_a_la_ficha`, n.book && n.kind === 'short' && n.skipBtn && !n.fichaDuring && !n.fichaVis && n.go0 === 0 && n.bookAfter === false, n);
        check(`${tag}.ENTRADA.${a}.novato_despues_del_Libro_ficha_neutra_con_objetivo/amenaza/ayuda_y_celdas,_sin_Hechicero,_sin_frase,_sin_retrato`, n.ficha && n.who === 'FICHA DE ARENA' && n.goal && n.kill && n.help && !n.sayVisible && !n.hechTxt && !n.canvas && n.cells >= 3 && !n.bookWith && n.go1 === 0, n);
        check(`${tag}.ENTRADA.${a}.novato_la_ficha_se_cierra_y_empieza_la_partida`, n.go2 === 1 && n.fichaClosed === true, n);
        check(`${tag}.ENTRADA.${a}.veterano_solo_el_Libro_(sin_ficha)_y_entra_directo`, v.book && v.kind === 'short' && !v.fichaDuring && v.ficha === false && v.go1 === 1, v);
      }
      // ---- tope BOOK_SHORT_MAX por arena y apagado ----
      const cap = await E(async () => { save.codexBook.shortCount = {}; save.codexBook.shortOff = false; window.__go = 0; save.arenasCleared = Object.fromEntries(ARENA_ORDER.map(x => [x, true])); const res = [];
        for (let i = 0; i < BOOK_SHORT_MAX + 1; i++) { runIntroShow('bosque', () => { window.__go++; }); await new Promise(r => setTimeout(r, 60)); res.push(BOOK.open); if (BOOK.open) bookClose('skip'); await new Promise(r => setTimeout(r, 40)); }
        codexBookSetShortOff(true); runIntroShow('hielo', () => { window.__go++; }); await new Promise(r => setTimeout(r, 60)); const off = BOOK.open; codexBookSetShortOff(false);
        return { res, off, go: window.__go, max: BOOK_SHORT_MAX }; });
      check(`${tag}.ENTRADA.el_Libro_sale_una_vez_por_entrada_con_tope_BOOK_SHORT_MAX_y_entra_directo_despues_o_apagado`, cap.max === 3 && cap.res.join() === 'true,true,true,false' && cap.off === false && cap.go === 5, cap);
      // Esc y toque también saltean
      const esc = await E(async () => { save.arenasCleared = Object.fromEntries(ARENA_ORDER.map(x => [x, true])); save.codexBook.shortCount = {}; window.__go = 0; runIntroShow('abismo', () => { window.__go++; }); await new Promise(r => setTimeout(r, 120)); return BOOK.open; });
      await page.keyboard.press('Escape'); await sleep(150);
      check(`${tag}.ENTRADA.Esc_saltea_y_sigue`, esc === true && !(await E(() => BOOK.open)) && (await E(() => window.__go)) === 1);
      await E(() => { runIntroShow('abismo', () => { window.__go++; }); }); await sleep(250); await page.mouse.click(vp.width / 2, vp.height / 2); await sleep(200);
      check(`${tag}.ENTRADA.un_toque_saltea_y_sigue`, !(await E(() => BOOK.open)) && (await E(() => window.__go)) === 2);
      // ---- durante la partida: el Hechicero no aconseja ni comenta ----
      const play = await E(async () => {
        save.tut.training = 0; save.tut.trainingSkipped = 0; ['basics', 'b_move', 'b_attack', 'b_skill', 'b_end'].forEach(k => delete save.tut[k]); save.arenasCleared = Object.fromEntries(ARENA_ORDER.map(x => [x, true]));
        window.__start = (a, cls) => { selectedClass = cls || 'guerrero'; currentArena = a; lobbyAllies = ['tanque', 'soporte', 'mago']; startRun(1); };
        const seen = []; const panel = () => document.getElementById('tut-panel'), look = () => { const p = panel(); return p && !p.classList.contains('hidden') ? { who: p.querySelector('.tut-who').textContent, face: p.dataset.face, text: p.querySelector('.tut-text').textContent } : null; };
        const out = { arenas: {} };
        for (const a of ['ciudad', 'fortaleza', 'bosque', 'micelial', 'hielo', 'infernal']) {
          __start(a); state = 'playing'; seen.length = 0;
          for (let t = 0; t < 12000; t += 16) { for (const h of heroes) h.hp = h.maxHp; update(16); updateHUD(); const l = look(); if (l) seen.push(l.face + '|' + l.who + '|' + l.text.slice(0, 40)); }
          out.arenas[a] = [...new Set(seen)];
        }
        // las llamadas viejas de las arenas y los comentarios del Hechicero se descartan; los controles salen neutros
        const calls = { fort: tutSay('fort_intro', 'LA FÁBRICA es una máquina'), hurt: tutSay('hurt', 'Cuidado'), hech: (storyEnsureRun(), storySay('hech', 'comentario')), boss: (storyEnsureRun(), storySay('rey_horda', 'voz de jefe de prueba')) };
        out.calls = calls; STORY.q.length = 0; state = 'menu'; return out; });
      const allSeen = Object.values(play.arenas).flat();
      check(`${tag}.PARTIDA.sin_Hechicero_(ni_nombre,_ni_retrato,_ni_consejos)_en_6_arenas_durante_12_s_simulados`, allSeen.every(s => !/hech/i.test(s)), play.arenas);
      check(`${tag}.PARTIDA.lo_unico_que_sale_son_indicaciones_neutras_de_controles_(face=none,_sin_nombre)`, allSeen.every(s => /^none\|\|/.test(s) || /^(boss|guardian|forge|echo|chron)\|/.test(s)) && allSeen.some(s => /^none\|\|Primero, movete/.test(s)), allSeen);
      check(`${tag}.PARTIDA.tutSay_y_storySay_descartan_consejos_y_comentarios_del_Hechicero`, play.calls.fort === false && play.calls.hurt === false && play.calls.hech === false && play.calls.boss === true, play.calls);
      // ---- la info que traía la ficha sigue a pedido ----
      const ask = await E(async () => { const out = {}; state = 'codex'; codexGo('arena', 'bosque', 'Ruinas'); await new Promise(r => setTimeout(r, 200)); const cx = document.getElementById('codex-body').innerText;
        out.codex = { goal: /Objetivo/.test(cx), kill: cx.includes(ARENA_BRIEF.bosque.kill.slice(0, 30)), help: cx.includes(ARENA_BRIEF.bosque.help.slice(0, 30)), hech: /Guía del Hechicero|el Hechicero te/.test(cx) };
        selectedClass = 'guerrero'; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'mago']; startRun(1); state = 'playing'; update(16); document.getElementById('pause-btn').click(); await new Promise(r => setTimeout(r, 300));
        const tp = document.getElementById('tactical-panel') ? document.getElementById('tactical-panel').innerText : '';
        out.pause = { goal: tp.includes(ARENA_BRIEF.bosque.goal.slice(0, 25)), kill: tp.includes(ARENA_BRIEF.bosque.kill.slice(0, 25)), guide: /Guía de juego/.test(tp), hech: /Hechicero/.test(tp), replay: /Repetir la lección/.test(tp) };
        document.getElementById('pause-screen').classList.add('hidden'); state = 'menu'; return out; });
      check(`${tag}.A_PEDIDO.Codice_Arenas_trae_objetivo_peligros_y_ayuda_de_la_arena_sin_voz_del_Hechicero`, ask.codex.goal && ask.codex.kill && ask.codex.help && !ask.codex.hech, ask.codex);
      check(`${tag}.A_PEDIDO.la_pausa_trae_Ayuda_con_objetivo_y_peligros_(sin_Hechicero)`, ask.pause.goal && ask.pause.kill && ask.pause.guide && !ask.pause.hech && !ask.pause.replay, ask.pause);
      // ---- la ficha conserva la fila de cristales y la elección de resonancia ----
      const res = await E(() => { save.crystals = { ancestral: 1, escarcha: 1 }; save.arenasCleared = {}; state = 'prep'; currentArena = 'bosque'; selectedClass = 'guerrero'; save.codexBook.shortOff = true;
        runIntroShow('bosque', () => {}); const el = document.getElementById('run-intro'); const o = { open: RUN_INTRO.open, picks: [...el.querySelectorAll('.res-pick')].map(b => b.dataset.res), gems: el.querySelectorAll('.cr-gem.on').length };
        RUN_INTRO.open = false; el.classList.add('hidden'); save.codexBook.shortOff = false; return o; });
      check(`${tag}.FICHA.conserva_cristales_y_resonancia`, res.open && res.picks.length >= 2 && res.gems >= 2, res);
      // ---- cooperativo: la entrada no usa el Libro y nada se rompe ----
      const coop = await E(async () => { const real = netInRoom; netInRoom = () => true; save.codexBook.shortCount = {}; window.__go = 0; runIntroShow('hielo', () => { window.__go++; }); await new Promise(r => setTimeout(r, 150));
        const o = { book: BOOK.open, go: window.__go, ficha: RUN_INTRO.open }; RUN_INTRO.open = false; document.getElementById('run-intro').classList.add('hidden'); netInRoom = real; return o; });
      check(`${tag}.COOP.en_sala_online_la_ficha_no_se_usa_(el_flujo_de_sala_no_llama_a_runIntroShow)_y_el_Libro_no_abre`, coop.book === false, coop);
      check(`${tag}.ERRORES.sin_errores_de_pagina`, errors.length === 0, errors);
      await ctx.close();
    }
    // ---- PRIMER DESPLIEGUE: el Libro sobre la pantalla de carga, solo la primera vez que se abre el juego ----
    const t = {};
    for (const cfg of [{ name: '844x390', vp: { width: 844, height: 390 }, qs: '' }, { name: '1280x720', vp: { width: 1280, height: 720 }, qs: '' }, { name: '844x390_lazy0', vp: { width: 844, height: 390 }, qs: '?lazy=0' }]) {
      const run = async withBook => {
        const ctx = await browser.newContext({ viewport: cfg.vp });
        await ctx.route('**/*', route => { const u = new URL(route.request().url()); return u.origin === new URL(base).origin || ['data:', 'blob:'].includes(u.protocol) ? route.continue() : route.abort('blockedbyclient'); });
        const page = await ctx.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
        await page.addInitScript(b => { window.__codexBook = b; }, withBook);
        const t0 = Date.now(); await page.goto(base + '/index.html' + cfg.qs, { waitUntil: 'load', timeout: 180000 });
        for (let k = 0; k < 600; k++) { if (await page.evaluate(() => { const b = document.getElementById('title-continue-btn'); return !!b && !b.disabled; })) break; await sleep(50); }
        const ms = Date.now() - t0;
        await page.waitForFunction(() => !BOOK.open || /ya carg/.test((document.querySelector('#codex-book .bk-load') || {}).textContent || ''), null, { timeout: 5000 }).catch(() => {});
        const st = await page.evaluate(() => ({ open: BOOK.open, kind: BOOK.kind, boot: BOOK.boot, i: BOOK.i, n: BOOK.pages.length, seen: save.codexBook.introSeen, read: save.codexBook.introRead, state, load: (document.querySelector('#codex-book .bk-load') || {}).textContent }));
        return { ctx, page, ms, st, errors };
      };
      const base0 = await run(false); const nob = base0.st.open; await base0.ctx.close();
      const wb = await run(true);
      check(`BOOT.${cfg.name}.primera_vez_el_Libro_abre_desde_la_tapa_sobre_la_pantalla_de_carga_(8_paginas,_en_el_titulo)`, wb.st.open && wb.st.kind === 'intro' && wb.st.boot && wb.st.i === 0 && wb.st.n === 8 && wb.st.state === 'title' && nob === false, wb.st);
      check(`BOOT.${cfg.name}.el_boton_del_titulo_se_habilita_con_el_Libro_abierto_y_avisa_que_cargo`, /ya carg/.test(wb.st.load || ''), wb.st);
      console.log(`# BOOT ${cfg.name}: pantalla interactiva en ${base0.ms} ms sin Libro, ${wb.ms} ms con Libro`);
      check(`BOOT.${cfg.name}.no_retrasa_el_arranque_(<=_+25%_+_1_s)`, wb.ms <= base0.ms * 1.25 + 1000, [base0.ms, wb.ms]);
      await wb.page.keyboard.press('Escape'); await sleep(200);
      const after = await wb.page.evaluate(() => ({ open: BOOK.open, seen: save.codexBook.introSeen, read: save.codexBook.introRead, btn: !document.getElementById('title-continue-btn').disabled }));
      check(`BOOT.${cfg.name}.Esc_saltea_(vista,_no_leida)_y_el_titulo_queda_usable`, !after.open && after.seen === true && after.read === false && after.btn, after);
      await wb.page.reload({ waitUntil: 'load', timeout: 180000 });
      for (let k = 0; k < 600; k++) { if (await wb.page.evaluate(() => { const b = document.getElementById('title-continue-btn'); return !!b && !b.disabled; })) break; await sleep(50); }
      await sleep(400);
      check(`BOOT.${cfg.name}.la_segunda_vez_no_se_repite`, (await wb.page.evaluate(() => BOOK.open)) === false);
      check(`BOOT.${cfg.name}.sin_errores`, wb.errors.length === 0, wb.errors);
      await wb.ctx.close();
    }
  } finally { await browser.close(); await site.close(); }
  console.log(fails ? `FAIL: ${fails} chequeo(s)` : 'PASS el Libro es la unica voz del Hechicero (texto, canon, entrada a cada arena, partida, a pedido)');
  process.exitCode = fails ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });
