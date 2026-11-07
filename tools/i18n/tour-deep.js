'use strict';
// RECORRIDO PROFUNDO de localización: arranca en ?lang=en|pt y visita muchas más pantallas y subpantallas que tour.js
// (Códice con fichas, Tienda con todas las pestañas, selección y detalle de campeón, talentos, misiones, ficha de arena, historia,
// tutorial, Opciones, legal, HUD...). Junta lo que SIGUE en español en pantalla (nodos de texto, title/aria-label/placeholder/alt y
// texto de canvas), con los números normalizados a {n}, y lo vuelca a docs/i18n/deep-pending-<lang>.json.
//   node tools/i18n/tour-deep.js [--lang en|pt] [--only <paso>] [--verbose]
// Un texto es PENDIENTE si, en el idioma elegido, no fue traducido (I18N no le guardó su original) y parece español:
//   · lleva tildes/ñ/¿/¡, o
//   · tiene alguna palabra que aparece en las claves españolas del diccionario pero no en ningún texto inglés/portugués ya traducido.
// "otros" = sin traducir pero sin rastro de español (nombres propios, siglas, números): se listan aparte para revisión manual.
const fs = require('node:fs'), path = require('node:path'), H = require('../lib/serve');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true); };
const LANG = arg('lang', 'en'), ONLY = arg('only', ''), VERBOSE = !!arg('verbose', false);
const OUT = path.join(H.ROOT, `docs/i18n/deep-pending-${LANG}${ONLY ? '.partial' : ''}.json`);

// vocabulario "solo español": palabras de claves españolas que no aparecen en ninguna traducción (en o pt)
function spanishVocab() {
  const dir = path.join(H.ROOT, 'tools/i18n/tr'), words = x => (x.toLowerCase().match(/[a-záéíóúüñ]{3,}/g) || []);
  const es = new Set(), other = new Set();
  const re = /\(\s*"((?:[^"\\]|\\.)*)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*\)/g;
  for (const f of fs.readdirSync(dir).filter(f => /^t.*\.py$/.test(f))) {
    const src = fs.readFileSync(path.join(dir, f), 'utf8'); let m;
    while ((m = re.exec(src))) { words(m[1]).forEach(w => es.add(w)); words(m[2]).forEach(w => other.add(w)); words(m[3]).forEach(w => other.add(w)); }
  }
  return [...es].filter(w => !other.has(w));
}

(async () => {
  const site = await H.startSite(), browser = await H.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1100, height: 640 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(site.url + '/index.html?lang=' + LANG + '&lazy=0');
    await page.waitForFunction(() => typeof setState === 'function' && typeof assetsAllReady === 'function' && assetsAllReady(), null, { timeout: 120000 });
    await page.waitForFunction(l => I18N.size(l) > 100, LANG, { timeout: 30000 });
    const vocab = spanishVocab();
    await page.evaluate(vocab => {
      const V = new Set(vocab), T = window.__T = { shown: new Map(), pend: new Map(), cur: 'boot', cv: new Map() };
      const accent = /[áéíóúüñÁÉÍÓÚÜÑ¿¡]/;
      T.isEs = s => accent.test(s) || (s.toLowerCase().match(/[a-záéíóúüñ]{3,}/g) || []).some(w => V.has(w));
      const norm = s => s.replace(/\d+(?:[.,]\d+)*/g, '{n}').replace(/\s+/g, ' ').trim();
      T.norm = norm;
      const add = (kind, s, scr) => {
        s = norm(s); if (!s || !/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,}/.test(s) || s.length > 600) return;
        T.shown.set(s, (T.shown.get(s) || 0) + 1);
        if (T.isEs(s) || kind.pend) return;
      };
      T.vis = el => { try { return el.checkVisibility ? el.checkVisibility({ checkOpacity: false, checkVisibilityCSS: true }) : !!el.getClientRects().length; } catch (e) { return true; } };
      T.collect = () => {
        const SK = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1 }, out = [];
        const w = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ALL); let n;
        while ((n = w.nextNode())) {
          if (n.nodeType === 3) {
            const p = n.parentNode; if (!p || SK[p.tagName] || p.closest('[data-i18n-skip]') || !T.vis(p)) continue;
            const v = n.nodeValue.trim(); if (!v) continue;
            out.push([v, !!I18N._rec(n), 't']);
          } else if (n.nodeType === 1 && T.vis(n)) {
            for (const a of ['title', 'aria-label', 'placeholder', 'alt']) { const v = n.getAttribute(a); if (v && v.trim()) out.push([v.trim(), false, 'a']); }
          }
        }
        return out;
      };
      // texto del canvas: se registra el ORIGINAL (envoltura más externa, sobre la de I18N)
      const P = CanvasRenderingContext2D.prototype;
      for (const f of ['fillText', 'strokeText']) { const o = P[f]; P[f] = function (t) { try { T.cv.set(String(t), T.cur); } catch (e) {} return o.apply(this, arguments); }; }
    }, vocab);
    const results = {};   // pantalla -> {shown:Set, pending:Set, other:Set}
    const snap = async scr => {
      const r = await page.evaluate(scr => {
        const T = window.__T, out = { shown: [], pend: [], other: [] }, seen = new Set();
        const rec = (s, translated) => {
          const k = T.norm(s); if (!k || !/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{3,}/.test(k) || k.length > 600) return;
          if (seen.has(k)) return; seen.add(k); out.shown.push(k);
          if (translated) return;
          if (T.isEs(k)) out.pend.push(k); else out.other.push(k);
        };
        for (const [s, tr] of T.collect()) {
          // el atributo no guarda original: se compara con la traducción actual de sí mismo (si I18N lo tradujo, el texto actual es inglés/portugués)
          rec(s, tr);
        }
        for (const [s] of T.cv) { const k = T.norm(s); const t = I18N.t(s); rec(s, t !== s); }
        T.cv.clear();
        return out;
      }, scr);
      const R = results[scr] || (results[scr] = { shown: new Set(), pend: new Set(), other: new Set() });
      r.shown.forEach(s => R.shown.add(s)); r.pend.forEach(s => R.pend.add(s)); r.other.forEach(s => R.other.add(s));
    };
    const E = (fn, a) => page.evaluate(fn, a).catch(e => { if (VERBOSE) console.log('  ! ' + String(e.message).split('\n')[0].slice(0, 160)); return null; });
    const wait = ms => page.waitForTimeout(ms);
    const step = async (name, fn, arg) => {
      if (ONLY && !ONLY.split(',').some(o => name.startsWith(o))) return;
      await E(n => { window.__T.cur = n; }, name);
      await E(fn, arg); await wait(350); await snap(name);
    };
    // helper para varias sub-vistas de una pantalla
    const sub = async (name, fns) => { for (const f of fns) { await E(f); await wait(250); await snap(name); } };
    await snap('boot');

    // ---------- estado de partida: perfil con todo descubierto y algo de oro ----------
    await E(() => {
      save.gold = 12345; save.starterChosen = true; save.tutorialDone = true; save.firstRun = null;
      try { for (const c of Object.keys(CLASSES)) { if (!save.champions[c]) save.champions[c] = mkChampion(true); save.champions[c].unlocked = true; save.champions[c].talentPoints = 5; } } catch (e) {}
      window.needsStarterChampion = () => false; window.needsStarterSkin = () => false;
      if (typeof HordaOnboarding !== 'undefined') HordaOnboarding.ready = () => true;
      if (typeof accountGate === 'function') window.accountGate = () => false;
      save.codexBook = Object.assign({}, save.codexBook, { introSeen: true, introRead: true });
      try { save.chronicles = {}; for (const p of CHRONICLE_PAGES) save.chronicles[p.id] = 1; } catch (e) {}
      try { if (typeof bookClose === 'function') bookClose('skip'); } catch (e) {}
    });

    // ---------- título y hub ----------
    await step('titulo', () => { setState('title'); });
    await step('hub', () => { renderMainMenu(); setState('mainmenu'); });
    await step('hub-opciones', () => { openHubOptions(); });
    await sub('hub-opciones', [
      () => { for (const el of document.querySelectorAll('#hub-options details, #hub-options .opt-sec')) el.open = true; },
      () => { const l = [...document.querySelectorAll('#hub-options button')]; l.slice(0, 40).forEach(b => b.scrollIntoView && 0); }
    ]);
    await step('hub-opciones-cerrar', () => { closeHubOptions(); });
    await step('legal', () => { for (const id of ['legal-modal']) document.getElementById(id)?.classList.remove('hidden'); try { if (typeof legalOpen === 'function') legalOpen(); } catch (e) {} });
    await sub('legal', [
      () => { for (const b of [...document.querySelectorAll('#legal-modal [data-doc], #legal-modal .legal-tab, #legal-modal button')].slice(0, 8)) { try { b.click(); } catch (e) {} } }
    ]);
    await step('legal-cerrar', () => { document.getElementById('legal-modal')?.classList.add('hidden'); });
    await step('hub-entrenamiento', () => { renderMainMenu(); setState('mainmenu'); if (typeof alphaOnboardingMenu === 'function') alphaOnboardingMenu(); });
    await step('hub-tutorial-repetir', () => { save.tut = save.tut || {}; save.tut.training = true; renderMainMenu(); setState('mainmenu'); if (typeof alphaOnboardingMenu === 'function') alphaOnboardingMenu(); });

    // ---------- Códice ----------
    await step('codice-vacio', () => { codexSave(); save.codex = { seen: {}, kills: {} }; openCodex(); });
    await sub('codice-vacio', [
      () => codexGo('list', 'bestiario', 'BESTIARIO'), () => { codexBack(); codexGo('list', 'jefes', 'JEFES'); },
      () => { codexBack(); codexGo('list', 'arenas', 'ARENAS'); }, () => { codexBack(); codexGo('list', 'campeones', 'GUARDIANES'); }
    ]);
    await E(() => {   // descubrir todo
      try { save.codexBook = save.codexBook || {}; save.codexBook.fragments = save.codexBook.fragments || {}; for (const k of Object.keys(BOOK_FRAGMENTS)) save.codexBook.fragments[k] = 1; } catch (e) {}
      const C = codexSave(); for (const a of Object.keys(CODEX_ARENA_ROSTER)) for (const t of CODEX_ARENA_ROSTER[a]) { C.seen[t] = 1; C.kills[t] = 5; }
      for (const b of CODEX_BOSSES) for (const t of codexBossTypes(b)) { C.seen[t] = 1; C.kills[t] = 5; }
      save.arenasCleared = save.arenasCleared || {}; for (const a of CAMPAIGN_ORDER) save.arenasCleared[a] = true;
    });
    await step('codice-inicio', () => { openCodex(); });
    const secs = ['bestiario', 'jefes', 'arenas', 'campeones', 'cronicas'];
    for (const s of secs) {
      await step('codice-' + s, s => { openCodex(); const d = codexSectionDef(s); if (s === 'cronicas') codexGo('list', 'cronicas', 'CRÓNICAS'); else codexGo('list', s, d.label); }, s);
      // filtros de la lista
      await sub('codice-' + s, [() => { const b = [...document.querySelectorAll('#codex-body .cx-filter, #codex-body [data-filter]')]; b.slice(0, 12).forEach(x => x.click()); }]);
    }
    // fichas: criaturas, jefes, arenas, guardianes, crónicas
    await step('codice-ficha-criatura', () => { openCodex(); }, null);
    {
      const ids = await E(() => ({
        cre: codexCreatureOrder(), boss: CODEX_BOSSES.map(b => b.id), arena: CAMPAIGN_ORDER.concat(['divina']).filter(a => ARENA_MODS[a]),
        champ: Object.keys(CLASSES), chron: (typeof CHRONICLE_PAGES !== 'undefined' ? CHRONICLE_PAGES.map(p => p.id) : [])
      })) || { cre: [], boss: [], arena: [], champ: [], chron: [] };
      const every = (a, n) => a.filter((_, i) => i % n === 0);
      const nCre = +arg('cre', 1);
      for (const t of every(ids.cre, nCre)) { await step('codice-ficha-criatura', t => { openCodex(); codexGo('creature', t, t); }, t); }
      for (const b of ids.boss) { await step('codice-ficha-jefe', b => { openCodex(); codexGo('boss', b, b); }, b); }
      for (const a of ids.arena) { await step('codice-ficha-arena', a => { openCodex(); codexGo('arena', a, a); }, a); }
      for (const c of ids.chron) { await step('codice-cronica', c => { openCodex(); codexGo('chron', c, c); }, c); }
      for (const c of ids.champ) {
        for (const tab of ['ficha', 'habilidades', 'skins', 'talentos', 'equipo', 'historia']) {
          await step('codice-ficha-guardian', ([c, tab]) => { openCodex(); codexChampTab = tab; codexGo('champ', c, c); const b = [...document.querySelectorAll('#codex-body [data-tab], #codex-body .cx-tab')].find(x => (x.dataset.tab || '') === tab); if (b) b.click(); }, [c, tab]);
        }
        // todas las pestañas de la ficha por clic
        await step('codice-ficha-guardian', c => { openCodex(); codexGo('champ', c, c); for (const b of document.querySelectorAll('#codex-body [data-tab], #codex-body .cx-tab')) { try { b.click(); } catch (e) {} } }, c);
      }
      await step('codice-libro', () => { openCodex(); try { codexGo('list', 'libro', 'LIBRO'); } catch (e) {} });
      await step('codice-guia', () => { openCodex(); const b = document.querySelector('#codex-body .cx-guide, #codex-body [data-sec=guia]'); if (b) b.click(); });
    }

    // ---------- Tienda ----------
    for (const t of ['destacados', 'skins', 'campeones', 'objetos', 'brasas']) {
      await step('tienda-' + t, t => { shopOpen(t); }, t);
    }
    for (const cat of ['set', 'legendario', 'campeon', 'base']) {
      await step('tienda-objetos', cat => { shopCat = cat; shopOpen('objetos'); }, cat);
      await sub('tienda-objetos', [() => { const c = [...document.querySelectorAll('#shop-screen .shop-item')]; if (c[0]) c[0].click(); if (c[5]) c[5].click(); }]);
      await E(() => { try { document.querySelectorAll('.modal:not(.hidden), .ui-modal, #item-preview').forEach(m => m.classList.add('hidden')); } catch (e) {} });
    }
        // sets y piezas: abrir la ficha de varias piezas
    await step('tienda-piezas', () => {
      shopCat = 'set'; shopOpen('objetos'); const cards = [...document.querySelectorAll('#shop-screen .shop-item')];
      for (const c of cards.slice(0, 6)) { try { c.click(); } catch (e) {} }
    });

    // ---------- selección de campeón y detalle ----------
    await step('seleccion-campeon', () => { try { openStarterSelect(() => {}, {}); } catch (e) { setState('starter'); } });
    await step('seleccion-campeon', () => { try { setState('mainmenu'); selectedClass = Object.keys(CLASSES)[0]; renderChampGrid(); setState('menu'); } catch (e) {} });
    await step('seleccion-skin-inicial', () => { try { openStarterSkinStep(); } catch (e) {} });
    await step('guardianes-hub', () => { renderMainMenu(); setState('mainmenu'); openGuardians(); });
    {
      const champs = (await E(() => Object.keys(CLASSES))) || [];
      for (const c of champs) {
        await step('detalle-campeon', c => { selectedClass = c; setState('champdetail'); renderChampDetail(c); }, c);
        await sub('detalle-campeon', [() => { for (const b of document.querySelectorAll('#champdetail-screen [data-tab], #champdetail-screen .cd-tab, #champdetail-screen .tab')) { try { b.click(); } catch (e) {} } }]);
      }
    }

    // ---------- misiones / desafíos / pase / modos / sala ----------
    await step('misiones', () => { if (typeof questsOpen === 'function') questsOpen(); });
    await sub('misiones', [() => { for (const b of document.querySelectorAll('#quests-modal button, .quests-tab, [data-qtab]')) { try { b.click(); } catch (e) {} } }]);
    await step('pase', () => { if (typeof bpOpen === 'function') bpOpen(); });
    await step('modos', () => { setState('modeselect'); });
    await step('arenas', () => { setState('arenaselect'); });
    await step('sala', () => { setState('prep'); });
    await sub('sala', [() => { for (const b of document.querySelectorAll('#prep-screen [data-sec], #prep-screen .prep-tab')) { try { b.click(); } catch (e) {} } }]);
    await step('menu', () => { setState('menu'); });
    await step('inventario', () => { setState('inventory'); });
    await step('cristales', () => { setState('crystalwars'); });
    await step('divina', () => { setState('divina'); });
    await step('cuenta', () => { if (typeof accountOpen === 'function') accountOpen(); });

    // ---------- tutorial, historia, ficha de arena ----------
    for (const m of ['campana', 'cristales', 'coliseo']) await step('tutorial', m => { howtoOpen(m); }, m);
    await E(() => howtoClose());
    for (const a of ['ciudad', 'fortaleza', 'bosque', 'micelial', 'hielo', 'acuatica', 'laberinto', 'abismo', 'minas', 'infernal', 'divina']) {
      await step('arena-briefing', a => { save.arenasCleared = {}; setState('mainmenu'); selectedClass = 'tanque'; currentArena = a; try { runIntroShow(a, () => {}, { first: true }); } catch (e) {} }, a);
      await step('historia', a => { try { const act = storyActOf(a); if (act) { storySay('hech', act.intro, { front: true }); } for (const p of CHRONICLE_PAGES.filter(p => p.arena === a)) storyCollect && 0; } catch (e) {} }, a);
    }
    // ---------- partida: HUD, ficha de arena (run-intro), pausa, fin ----------
    for (const [cls, arena] of [['tanque', 'bosque'], ['cazadora', 'ruinas'], ['mago', 'volcan']]) {
      await step('partida-intro', ([c, a]) => { if (!CLASSES[c]) c = Object.keys(CLASSES)[0]; if (!ARENA_MODS[a]) a = Object.keys(ARENA_MODS)[0]; selectedClass = c; currentArena = a; lobbyAllies = []; startRun(1); setState('playing'); }, [cls, arena]);
      await wait(900); await snap('partida-intro');
      await step('partida-hud', () => { try { for (let i = 0; i < 6; i++) spawnEnemy(Object.keys(ENEMY_BASE)[i], false, false); } catch (e) {} });
      await wait(1200); await snap('partida-hud');
      await step('partida-pausa', () => { setState('paused'); });
      await step('partida-gameover', () => { setState('playing'); player.alive = false; setState('gameover'); });
      await step('partida-victoria', () => { setState('victory'); });
    }
    await step('partida-nivel', () => { try { setState('playing'); if (typeof buffChoiceOpen === 'function') buffChoiceOpen(); } catch (e) {} });

    // ---------- resultados ----------
    const names = Object.keys(results).sort();
    const allShown = new Set(), allPend = new Set(), allOther = new Set(), perScreen = {};
    for (const n of names) {
      const R = results[n]; R.shown.forEach(s => allShown.add(s)); R.pend.forEach(s => allPend.add(s)); R.other.forEach(s => allOther.add(s));
      perScreen[n] = { shown: R.shown.size, pending: R.pend.size, coverage: +(1 - R.pend.size / Math.max(1, R.shown.size)).toFixed(3) };
    }
    const total = allShown.size, pend = allPend.size;
    const byScreen = {}; for (const n of names) byScreen[n] = [...results[n].pend].sort();
    const doc = { schema: 1, lang: LANG, note: 'Generado por tools/i18n/tour-deep.js. Números normalizados a {n}.', visibleUnique: total, pendingUnique: pend, pendingPct: +(100 * pend / Math.max(1, total)).toFixed(2),
      perScreen, pending: [...allPend].sort(), pendingByScreen: byScreen, otherUntranslated: [...allOther].filter(s => !allPend.has(s)).sort() };
    fs.writeFileSync(OUT, JSON.stringify(doc, null, 1) + '\n');
    console.log(JSON.stringify({ lang: LANG, visibleUnique: total, pendingUnique: pend, pendingPct: doc.pendingPct, other: doc.otherUntranslated.length }));
    if (VERBOSE) for (const n of names) console.log(n.padEnd(26), JSON.stringify(perScreen[n]));
    if (errors.length) console.log('errores de página', [...new Set(errors)].slice(0, 5));
  } finally { await browser.close(); await site.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
