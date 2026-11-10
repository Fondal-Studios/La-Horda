'use strict';
/* RANGOS DE CICATRIZ — prueba con navegador real (js/systems/scar-ranks.js, js/data/scar-ranks.js).
 *  1. El selector aparece en la preparación de la Horda: rangos bloqueados deshabilitados, el elegido marcado.
 *  2. Elegir un rango abierto lo guarda; uno cerrado no se puede elegir.
 *  3. Al empezar la partida los mutadores del rango se suman a los de la temporada (sin repetir) y el puntaje usa el bono.
 *  4. Al terminar: llegar a la ronda de cierre abre el siguiente rango y da el título; menos rondas no lo abre; rejugar no baja el máximo.
 *  5. El rango viaja por la red (enSr) y los mutadores en enMu; el invitado los recibe.
 *  6. Rango 0 = la Horda de siempre (sin cambios); sin errores de página.
 *  node tools/ux/test-scar-ranks.js   (servidor propio en un puerto libre)
 */
const H = require('../lib/serve');
let fails = 0;
const ok = (c, m, x) => { console.log((c ? 'PASS ' : 'FAIL ') + m + (c || x === undefined ? '' : '  ' + JSON.stringify(x).slice(0, 400))); if (!c) fails++; };
const SAVE = { tut: { training: 1 }, starterChosen: true, starterGiftV1: true, starterSkin: 'vale', playtestV1Bonus: true, campaignResetV1: true, campaignResetV2: true };

(async () => {
  const site = await H.startSite(), browser = await H.launch(), errs = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 1000, height: 560 } });
    await ctx.addInitScript(s => { try { if (!sessionStorage.getItem('__sc')) { localStorage.setItem('laHordaSave_v1', JSON.stringify(s)); sessionStorage.setItem('__sc', '1'); } } catch (e) {} }, SAVE);
    const page = await ctx.newPage();
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    await page.route('**/api/rooms?*', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"rooms":[]}' }));
    await page.goto(site.url + '/index.html?lazy=0', { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => { const b = document.getElementById('title-continue-btn'); return typeof setState === 'function' && typeof assetsAllReady === 'function' && assetsAllReady() && b && !b.disabled; }, null, { timeout: 180000 });
    const E = (fn, a) => page.evaluate(fn, a);
    await E(() => {
      for (const k of Object.keys(save.champions)) { save.champions[k].unlocked = true; save.champions[k].level = 12; }
      save.arenasCleared = Object.assign(save.arenasCleared || {}, { ciudad: true, fortaleza: true });
      selectedClass = 'guerrero'; lobbyAllies = null; gameDialogAutoConfirm = () => true; loop = function () {};
      save.endless = {}; // sin progreso previo
    });

    // 1-2. selector y elección
    const r1 = await E(() => {
      endlessOpen(); document.getElementById('start-btn').click();
      const chips = [...document.querySelectorAll('#en-scar .en-scar-chip')];
      const before = { n: chips.length, dis: chips.map(b => b.disabled), on: chips.map(b => b.classList.contains('on')) };
      const locked = chips[3]; locked.click();                       // cerrado: no hace nada
      const stillZero = scarSave().sel === 0;
      scarSave().max = 2; endlessDecoratePrep();                      // se abren I y II
      const c2 = [...document.querySelectorAll('#en-scar .en-scar-chip')];
      c2[2].click();
      return { before, stillZero, sel: scarSave().sel, onNow: [...document.querySelectorAll('#en-scar .en-scar-chip')].map(b => b.classList.contains('on')), info: document.querySelector('#en-scar .en-scar-info').innerText };
    });
    ok(r1.before.n === 6 && r1.before.dis.join() === 'true,true,true,true,true,true' || r1.before.dis.slice(1).every(Boolean) && !r1.before.dis[0], '[1] 6 chips; solo el rango 0 se puede elegir al principio', r1.before);
    ok(r1.before.on[0] === true, '[1] el rango 0 viene marcado');
    ok(r1.stillZero, '[2] un rango cerrado no se puede elegir', r1);
    ok(r1.sel === 2 && r1.onNow[2] === true, '[2] elegir un rango abierto lo guarda y lo marca', r1);
    ok(/Cicatriz II/.test(r1.info) && /ronda\s*20/.test(r1.info) && /1\.30/.test(r1.info), '[2] el texto informa nombre, meta y bono de puntaje', r1.info);

    // 2b. la pestaña dice Horda Infinita + el rango, y no quedan "undefined" en los textos de la Horda
    const r2b = await E(() => { prepSecSync(); return { tab: document.getElementById('prep-sec-arena').textContent, txt: document.getElementById('lobby-arena').innerText, season: endlessSeasonLabel('2026-11'), none: endlessSeasonLabel('x') }; });
    ok(/^Horda Infinita · Cicatriz II$/.test(r2b.tab), '[2b] la pestaña muestra Horda Infinita y el rango elegido (no una arena fija)', r2b.tab);
    ok(!/undefined/.test(r2b.txt) && /Temporada \d{2}\/\d{4}/.test(r2b.txt), '[2b] la preparación muestra la temporada sin "undefined"', r2b.txt.slice(0, 200));
    ok(r2b.season === '11/2026' && r2b.none === '', '[2b] etiqueta de temporada: mes/año; vacía si la clave no sirve', r2b);

    // 3. mutadores en la partida
    const r3 = await E(() => {
      document.getElementById('prep-start-btn').click();
      const wk = endlessWeeklyMutators().ids;
      return { on: endlessActive, scar: EN.scar, mut: EN.mutators.slice(), wk, dup: new Set(EN.mutators).size !== EN.mutators.length,
        hasRank: ['elites_x2', 'fast_horde'].every(m => EN.mutators.includes(m)), hasWeek: wk.every(m => EN.mutators.includes(m)),
        mult: endlessScoreMult(), expect: EN.mutators.reduce((k, m) => k * (ENDLESS_MUTATORS[m].scoreMult || 1), 1) * 1.30 };
    });
    ok(r3.on && r3.scar === 2, '[3] la partida arranca en el rango elegido', r3);
    ok(r3.hasRank && r3.hasWeek && !r3.dup, '[3] mutadores del rango + los de la temporada, sin repetir', r3);
    ok(Math.abs(r3.mult - r3.expect) < 1e-9, '[3] el puntaje multiplica el bono del rango', r3);

    // 5. red: el rango y los mutadores viajan y el invitado los recibe
    const r5 = await E(() => {
      const g = endlessNetGet(); const had = { enSr: g.enSr, enMu: g.enMu };
      EN.scar = 0; EN.mutators = []; endlessNetSet(Object.assign({}, g, { enId: EN.id }));
      return { had, scar: EN.scar, mut: EN.mutators.slice() };
    });
    ok(r5.had.enSr === 2 && /elites_x2/.test(r5.had.enMu) && r5.scar === 2 && r5.mut.includes('fast_horde'), '[5] enSr y enMu viajan por la red', r5);

    // 4. fin de partida
    const r4 = await E(() => {
      const out = {}; const q = questsState();
      EN.round = 12; endlessEndRun('defeat');                         // rango II, meta 20: no completa
      out.short = { shown: document.getElementById('endless-screen').innerText, cleared: EN.local.scar.cleared, unlocked: EN.local.scar.unlocked, max: scarSave().max, best: scarSave().best[2] };
      endlessFinish();
      endlessActive = false; endlessBeginRun(); EN.scar = 2;
      EN.round = 22; endlessEndRun('defeat');                         // meta cumplida
      out.long = { cleared: EN.local.scar.cleared, unlocked: EN.local.scar.unlocked, max: scarSave().max, title: EN.local.scar.title, has: q.titles.includes('marcado_2'), best: scarSave().best[2], shown: document.getElementById('endless-screen').innerText };
      endlessFinish();
      endlessActive = false; endlessBeginRun(); EN.scar = 0;
      EN.round = 30; endlessEndRun('defeat');
      out.replay = { max: scarSave().max, unlocked: EN.local.scar.unlocked };
      endlessFinish();
      return out;
    });
    ok(!r4.short.cleared && r4.short.unlocked === null && r4.short.max === 2 && r4.short.best === 12, '[4] sin llegar a la meta no abre nada y guarda el mejor', r4.short);
    ok(r4.long.cleared && r4.long.unlocked === 3 && r4.long.max === 3 && r4.long.title === 'marcado_2' && r4.long.has && r4.long.best === 22, '[4] llegar a la meta abre el siguiente rango y da el título', r4.long);
    ok(/Te faltaron 8 rondas para Cicatriz III/.test(r4.short.shown), '[4] sin llegar a la meta, los resultados dicen cuántas rondas faltaron', r4.short.shown && r4.short.shown.slice(0, 300));
    ok(!/undefined/.test(r4.long.shown) && /TEMPORADA \d{2}\/\d{4}/.test(r4.long.shown), '[4] el encabezado de resultados muestra la temporada', r4.long.shown.slice(0, 120));
    ok(/Cicatriz III/.test(r4.long.shown) && /Rompe|Cicatriz Viva/.test(r4.long.shown), '[4] la pantalla de resultados lo muestra', r4.long.shown.slice(0, 300));
    ok(r4.replay.max === 3 && r4.replay.unlocked === null || r4.replay.max >= 3, '[4] rejugar rangos bajos no baja el máximo', r4.replay);

    // 4b. invitado en una sala de rango superior al que tiene abierto: juega ese rango pero no se salta la progresión; y lo que llega por red se acota
    const r4b = await E(() => {
      scarSave().max = 1; scarSave().sel = 1; endlessActive = false; endlessBeginRun(); EN.scar = 4; EN.round = 30; endlessEndRun('defeat');
      const S = EN.local.scar, out = { eligible: S.eligible, cleared: S.cleared, unlocked: S.unlocked, title: S.title, frame: S.frame, max: scarSave().max, best4: scarSave().best[4] || 0, shown: document.getElementById('endless-screen').innerText };
      endlessFinish();
      const g = endlessNetGet(); endlessNetSet(Object.assign({}, g, { enSr: 99 })); out.netHigh = EN.scar; endlessNetSet(Object.assign({}, g, { enSr: 'x' })); out.netBad = EN.scar; endlessNetSet(Object.assign({}, g, { enSr: -4 })); out.netNeg = EN.scar;
      save.endless.scar.max = 99; save.endless.scar.best = { 0: 'x', 1: -3, 2: 7.9, 9: 5 }; save.endless.scar.cleared = { 1: 1, 7: 1 }; const C = scarSave(); out.clean = { max: C.max, best: C.best, cleared: C.cleared };
      return out;
    });
    ok(!r4b.eligible && !r4b.cleared && r4b.unlocked === null && !r4b.title && !r4b.frame && r4b.max === 1 && r4b.best4 === 0, '[4b] un rango por encima del tuyo no desbloquea, no premia y no guarda récord', r4b);
    ok(!/Te faltaron/.test(r4b.shown), '[4b] y los resultados no prometen una meta que no es tuya', r4b.shown.slice(0, 160));
    ok(r4b.netHigh === 5 && r4b.netBad === 0 && r4b.netNeg === 0, '[4b] el rango que llega por la red se acota a 0..5', r4b);
    ok(r4b.clean.max === 5 && JSON.stringify(r4b.clean.best) === JSON.stringify({ 2: 7 }) && JSON.stringify(r4b.clean.cleared) === JSON.stringify({ 1: 1 }), '[4b] un guardado editado se sanea (máximo, récords y cerrados)', r4b.clean);

    // 6. rango 0 intacto
    const r6 = await E(() => { endlessActive = false; scarSave().sel = 0; endlessBeginRun(); return { scar: EN.scar, mut: EN.mutators.slice(), wk: endlessWeeklyMutators().ids, mult: endlessScoreMult() }; });
    ok(r6.scar === 0 && r6.mut.join() === r6.wk.join(), '[6] rango 0: solo los mutadores de la temporada', r6);
    // 7. traducciones EN/PT de los textos de rangos (render real y lectura del texto traducido)
    const r7 = await E(async () => {
      const out = {}; scarSave().sel = 2;
      for (const lang of ['en', 'pt']) {
        I18N.setLang(lang);
        const d = document.createElement('div'); d.id = 'tr-probe';
        d.innerHTML = scarPrepHTML(false) + '<span>Te faltaron 8 rondas para Cicatriz III</span><span>¡Cicatriz II completada!</span><span>Título «Rompe-Jefes»</span><span>HORDA INFINITA · TEMPORADA 11/2026</span>';
        document.body.appendChild(d); await new Promise(r => setTimeout(r, 400));
        out[lang] = d.innerText.replace(/\s+/g, ' '); d.remove();
      }
      I18N.setLang('es'); return out;
    });
    ok(/Scar Rank:/.test(r7.en) && /Double elites and faster enemies\./.test(r7.en) && /Score ×1\.30/.test(r7.en) && /Reach round 20 to unlock Scar III\./.test(r7.en) && /You were 8 rounds short of Scar III/.test(r7.en) && /Scar II complete!/.test(r7.en) && /Boss-Breaker/.test(r7.en) && /SEASON 11\/2026/.test(r7.en) && !/Rango de Cicatriz|Llegá a la ronda|Te faltaron/.test(r7.en), '[7] EN: los textos de rangos se traducen', r7.en);
    ok(/Nível de Cicatriz:/.test(r7.pt) && /Elites duplas e inimigos mais rápidos\./.test(r7.pt) && /Pontuação ×1\.30/.test(r7.pt) && /Chegue à rodada 20 para abrir Cicatriz III\./.test(r7.pt) && /Faltaram 8 rodadas para Cicatriz III/.test(r7.pt) && /Quebra-Chefes/.test(r7.pt) && !/Rango de Cicatriz|Llegá a la ronda|Te faltaron/.test(r7.pt), '[7] PT: los textos de rangos se traducen', r7.pt);
    ok(errs.length === 0, 'sin errores de página', errs.slice(0, 3));
  } catch (e) { console.error(e); fails++; }
  finally { await browser.close(); await site.close(); }
  console.log(fails ? `\n${fails} FALLAS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})();
