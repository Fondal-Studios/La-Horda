// LA HISTORIA JUGANDO (js/systems/story.js + js/data/story-text.js): actos, prólogo por pantallas, voces
// de los jefes en el cuadro de voz (con la regla de "no más de 2 textos a la vez"), voces de los guardianes,
// Crónicas (piso / subjefe / victoria) y su lectura en el Códice, escenas de salida en la pantalla de
// victoria, voz al caer en la de derrota y el epílogo con post-créditos al completar la Infernal.
//   (python3 -m http.server 8821 &) ; SE_BASE_URL=http://127.0.0.1:8821 node tools/items/t_story.js [carpeta_capturas]
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const BASE = process.env.SE_BASE_URL || 'http://127.0.0.1:8821';
const OUT = process.argv[2];
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 400) : '')); if (!ok) fails++; };
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await (await browser.newContext({ viewport: { width: 900, height: 506 } })).newPage();
  // Story gameplay is local; public room discovery is covered by its own suites.
  await page.route('**/api/rooms?*', route => route.fulfill({status:200, contentType:'application/json',
    headers:{'access-control-allow-origin':'*'}, body:JSON.stringify({rooms:[]})}));
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g|net::|404/.test(m.text())) errors.push('console: ' + m.text().slice(0, 300)); });
  await page.addInitScript(() => { window.__campaignMode = true; });
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 180000 });
  for (let k = 0; k < 300; k++) { if (await page.evaluate(() => !document.getElementById('title-continue-btn').disabled)) break; await sleep(100); }
  await sleep(600);
  const E = (fn, a) => page.evaluate(fn, a);
  await E(() => { loop = function(){};
    window.__start = (a, lv, cls) => { for (const k of Object.keys(save.champions)) save.champions[k].unlocked = true;
      selectedClass = cls || 'guerrero'; currentArena = a; lobbyAllies = ['tanque','soporte','mago']; startRun(lv || 1); spawnTimer = 1e12; enemies.length = 0; };
    // un cuadro = simulación + HUD (el HUD corre tutTick → storyTick: la cola de voces y las páginas)
    window.__step = (ms) => { let t = 0; while (t < ms && state === 'playing') { for (const h of heroes){ h.hp = h.maxHp; } update(16); updateHUD(); t += 16; } };
    window.__kill = (e) => { e.hp = 1; damageEnemy(e, 999999, {src:player}); };
    window.__tut = () => ({ who: document.querySelector('#tut-panel .tut-who').textContent, text: document.querySelector('#tut-panel .tut-text').textContent,
      face: document.getElementById('tut-panel').dataset.face, key: TUT.key });
    window.__read = () => { TUT.until = 0; }; // "ya se leyó": libera el cuadro para la próxima línea
    save.tut = save.tut || {}; ['basics','b_move','b_attack','b_skill','b_end','cooldown','hurt','energy','elite','boss','levelup','skillup','revive'].forEach(k => save.tut[k] = 1);
    window.__quiet = () => { _arenaTitleUntil = 0; const b = document.getElementById('center-banner'); b.classList.remove('show'); const bi = document.getElementById('boss-intro'); bi.classList.add('hidden'); };
  });

  // ---------------- DATOS ----------------
  const d = await E(() => {
    const acts = STORY_ACTS.flatMap(a => a.arenas);
    const pages = CHRONICLE_PAGES, ids = new Set(pages.map(p => p.id));
    const badPages = pages.filter(p => !chronicleBook(p.book) || !ARENA_ORDER.includes(p.arena) || !['world','sub','boss'].includes(p.src) || !p.text || p.text.length < 200).map(p => p.id);
    const perArena = Object.fromEntries(ARENA_ORDER.map(a => [a, pages.filter(p => p.arena === a).length]));
    const emptyBooks = CHRONICLE_BOOKS.filter(b => !pages.some(p => p.book === b.id)).map(b => b.id);
    const champs = CHAMPION_CATALOG.map(c => c.id), noVoice = champs.filter(k => !(HERO_VOICES[k] && HERO_VOICES[k].pick && HERO_VOICES[k].win && HERO_VOICES[k].fall));
    const ghostVoice = Object.keys(HERO_VOICES).filter(k => !CLASSES[k]);
    const badBoss = Object.keys(BOSS_VOICES).filter(id => id !== 'rey_horda' && id !== 'cm_funcion' && id !== 'dobladores' && !ENEMY_BASE[id]);
    const bossesNoVoice = CODEX_BOSSES.filter(b => b.arena !== 'divina').filter(b => !b.forms.some(f => { const t = f.split('#')[0]; return BOSS_VOICES[STORY_VOICE_ALIAS[t] || t] || (t === 'demonio_mayor'); })).map(b => b.id);
    // la Horda nunca habla: ninguna voz la tiene como hablante
    const hordeSpeaks = Object.values(BOSS_VOICES).some(V => /^LA HORDA$/i.test((typeof V.who === 'string' ? '' : V.who.name) || ''));
    return { acts, dup: ids.size !== pages.length, n: pages.length, badPages, perArena, emptyBooks, noVoice, ghostVoice, badBoss, bossesNoVoice, hordeSpeaks };
  });
  check('DATOS.tres_actos_cubren_las_diez_arenas_en_orden', JSON.stringify(d.acts) === JSON.stringify(await E(() => ARENA_ORDER.slice())), d.acts);
  check('DATOS.cronicas_validas', !d.dup && d.n >= 20 && d.badPages.length === 0 && d.emptyBooks.length === 0, d);
  check('DATOS.cada_arena_con_al_menos_dos_paginas', Object.values(d.perArena).every(n => n >= 2), d.perArena);
  check('DATOS.cada_guardian_jugable_con_sus_3_lineas', d.noVoice.length === 0 && d.ghostVoice.length === 0, d);
  check('DATOS.cada_jefe_de_campaña_tiene_voz', d.badBoss.length === 0 && d.bossesNoVoice.length === 0 && !d.hordeSpeaks, d);

  // ---------------- PRÓLOGO + ACTO I + FICHA ----------------
  const pro = await E(() => { save.storyPrologueSeen = false; save.storyActsSeen = {}; save.tut = save.tut || {}; save.tut.goalMission = 1; /* la misión (goal-guide.js) va antes y tiene su propia prueba; acá se mide prólogo + Acto I */ selectedClass = 'tanque'; state = 'menu';
    const el = document.getElementById('run-intro'), seen = []; let went = 0;
    runIntroShow('ciudad', () => { went++; });
    for (let i = 0; i < 6 && RUN_INTRO.open; i++){
      seen.push({ who: el.querySelector('.ri-who').textContent, t: el.querySelector('.ri-arena').textContent, pro: el.classList.contains('ri-prologue') });
      if (!el.classList.contains('ri-prologue')) break;
      RUN_INTRO.t0 = 0; runIntroGo();
    }
    const ficha = { act: (el.querySelector('.ri-act')||{}).textContent, hero: (el.querySelector('.ri-hero')||{}).textContent, say: el.querySelector('.ri-say').textContent };
    RUN_INTRO.t0 = 0; runIntroGo();
    return { seen, ficha, went, again: (() => { runIntroShow('ciudad', () => {}); const p = el.classList.contains('ri-prologue'); RUN_INTRO.t0 = 0; runIntroGo(); return p; })() }; });
  check('PROLOGO.tres_pantallas_y_despues_el_acto_I', pro.seen.length === 5 && pro.seen.slice(0, 3).every(s => s.who === 'PRÓLOGO' && s.pro) && pro.seen[3].who === 'ACTO I' && /GUÍA/.test(pro.seen[3].t) && !pro.seen[4].pro, pro.seen);
  check('FICHA.dice_el_acto_y_habla_tu_guardian', /ACTO I/.test(pro.ficha.act) && /puerta norte/.test(pro.ficha.hero) && /Esta es tu ciudad/.test(pro.ficha.say), pro.ficha);
  check('PROLOGO.una_sola_vez_por_perfil', pro.again === false, pro.again);
  const act2 = await E(() => { state = 'menu'; runIntroShow('micelial', () => {}); const el = document.getElementById('run-intro');
    const r = { who: el.querySelector('.ri-who').textContent, t: el.querySelector('.ri-arena').textContent, txt: el.querySelector('.ri-say').textContent };
    while (RUN_INTRO.open){ RUN_INTRO.t0 = 0; runIntroGo(); if (!el.classList.contains('ri-prologue')) { RUN_INTRO.t0 = 0; runIntroGo(); } } return r; });
  check('ACTO_II.cartel_al_entrar_al_Reino_Fungico', act2.who === 'ACTO II' && /ECOS/.test(act2.t) && /esporas/.test(act2.txt), act2);

  // ---------------- VOCES DE LOS JEFES ----------------

  const rows=await E(()=>{const rows=[];for(let i=1;i<=40;i++){
    let seed=i;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    __start('hielo',10);runLevel=LEVEL_COUNT;levelTimer=levelDuration+1;__step(64);__quiet();__step(64);
    const state=()=>({stun:boss.stunTimer,phase:boss.bd?.phase,hp:boss.hp/boss.maxHp,queued:STORY.q.map(x=>x.text),shown:__tut().text,freeze:axiomFreezeTimer});
    const before=state();__read();__quiet();STORY.gateOk=false;STORY.gateT=performance.now()+200;
    boss.hp=boss.maxHp*.55;__step(80);__quiet();__step(64);const after=state();
    const pass=after.queued.some(t=>/todavía me obedece/.test(t))||/todavía me obedece/.test(after.shown);
    let steps=0; const trace=[after];
    while(boss.bd?.phase===0 && steps<180){__quiet();STORY.gateOk=false;STORY.gateT=performance.now()+200;__step(16);steps++;if(steps<3||boss.bd?.phase>0)trace.push(state());}
    const final=state(), eventual=final.queued.some(t=>/todavía me obedece/.test(t))||/todavía me obedece/.test(final.shown);
    rows.push({seed:i,pass,before,after,steps,final,eventual,trace});
  }return rows;});
  console.log(JSON.stringify(rows,null,2));
  await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
