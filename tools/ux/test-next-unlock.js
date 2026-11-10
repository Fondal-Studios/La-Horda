'use strict';
/* «LO PRÓXIMO QUE DESBLOQUEÁS» y coherencia de Tienda / pase — prueba con navegador real
 * (js/ui/next-unlock.js, css/next-unlock.css, js/ui/shop-ui.js, js/ui/battlepass-ui.js, js/data/quests.js, js/systems/scar-ranks.js).
 *  1. Las metas salen de datos reales (pase, racha, cuenta, Cicatriz, guardián), como mucho 3, ordenadas por cercanía, con «X / Y» y barra.
 *  2. Es de solo lectura: no cambia el guardado ni llama a persist().
 *  3. Sin metas no dibuja nada.
 *  4. Aparece en los resultados de la Horda (arriba de los botones) y en el fin de partida de la Campaña; se va al salir.
 *  5. Momento de orgullo en la Horda: «Equipar título» abre el Perfil y vuelve a los resultados; «Ver apariencias» abre el probador.
 *  6. Rango de Cicatriz V: marco propio `cicatriz_v`, distinto del marco `cicatriz` del ranking.
 *  7. Tienda: sin "undefined" ni notas de desarrollo; «Todo el poder se consigue jugando»; sin cuenta hay salidas útiles.
 *  8. Pase sin cuenta: sigue pidiendo iniciar sesión y ofrece el pase gratis y el probador.
 *  node tools/ux/test-next-unlock.js   (servidor propio en un puerto libre; NU_SHOTS=carpeta para capturas)
 */
const H = require('../lib/serve');
const path = require('path'), fs = require('fs');
let fails = 0;
const ok = (c, m, x) => { console.log((c ? 'PASS ' : 'FAIL ') + m + (c || x === undefined ? '' : '  ' + JSON.stringify(x).slice(0, 500))); if (!c) fails++; };
const SAVE = { tut: { training: 1 }, starterChosen: true, starterGiftV1: true, starterSkin: 'vale', playtestV1Bonus: true, campaignResetV1: true, campaignResetV2: true };
const SHOTS = process.env.NU_SHOTS || '';

(async () => {
  const site = await H.startSite(), browser = await H.launch(), errs = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await ctx.addInitScript(s => { try { if (!sessionStorage.getItem('__nu')) { localStorage.setItem('laHordaSave_v1', JSON.stringify(s)); sessionStorage.setItem('__nu', '1'); } } catch (e) {} }, SAVE);
    const page = await ctx.newPage();
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    await page.route('**/api/rooms?*', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"rooms":[]}' }));
    await page.goto(site.url + '/index.html?lazy=0', { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => { const b = document.getElementById('title-continue-btn'); return typeof setState === 'function' && typeof assetsAllReady === 'function' && assetsAllReady() && b && !b.disabled; }, null, { timeout: 180000 });
    // Hasta que el integrador agregue las dos etiquetas a index.html, la prueba carga el módulo igual que lo haría la página.
    const tagged = await page.evaluate(() => typeof nextUnlockHTML === 'function');
    if (!tagged) { await page.addStyleTag({ url: site.url + '/css/next-unlock.css' }); await page.addScriptTag({ url: site.url + '/js/ui/next-unlock.js' }); }
    console.log(tagged ? 'index.html ya carga js/ui/next-unlock.js' : 'index.html todavía no carga js/ui/next-unlock.js: la prueba lo inyecta');
    const E = (fn, a) => page.evaluate(fn, a);
    const shot = async name => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, name) }); } };
    await E(() => {
      for (const k of Object.keys(save.champions)) { save.champions[k].level = 12; }
      save.champions.guerrero.unlocked = true;
      save.arenasCleared = Object.assign(save.arenasCleared || {}, { ciudad: true, fortaleza: true });
      selectedClass = 'guerrero'; lobbyAllies = null; gameDialogAutoConfirm = () => true; loop = function () {};
      save.endless = {}; save.gold = 1000;
      const q = questsState(); q.season.xp = 100; q.season.granted = 1; q.xp = 100;
      q.streak = { count: 2, best: 2, last: questsDayKey(), seen: questsDayKey(), freezes: 0, weekKey: questsWeekKey(), weekDone: 0, weekEarned: '', claimed: {} };
    });

    // 1. metas reales
    const r1 = await E(() => {
      const all = nextUnlockGoals(99), top = nextUnlockGoals();
      const d = document.createElement('div'); d.innerHTML = nextUnlockHTML();
      const S = questsSeason(), cheapest = Math.min(...CHAMPION_CATALOG.filter(c => !(save.champions[c.id] || {}).unlocked && shopChampionPurchasable(c.id)).map(c => shopChampionPrice(c.id)));
      return { all, top, S, cheapest, passTxt: questsRewardText(SEASON_REWARDS[S.level + 1]), title: (d.querySelector('.nu-title') || {}).textContent,
        rows: [...d.querySelectorAll('.nu-goal')].map(g => ({ id: g.dataset.nu, num: g.querySelector('.nu-num').textContent, w: g.querySelector('.nu-bar > i').style.width, name: g.querySelector('.nu-name').textContent })), text: d.textContent };
    });
    const by = id => r1.all.find(g => g.id === id) || {};
    ok(r1.all.length === 5 && ['pase', 'racha', 'cuenta', 'cicatriz', 'guardian'].every(id => by(id).id), '[1] con todo por delante hay 5 metas posibles', r1.all.map(g => g.id));
    ok(by('pase').cur === r1.S.into && by('pase').need === r1.S.need && by('pase').name === r1.passTxt && /nivel 2/.test(by('pase').tag), '[1] pase: XP del nivel y premio del nivel siguiente', by('pase'));
    ok(by('racha').cur === 2 && by('racha').need === 3 && /Cofre/i.test(by('racha').name), '[1] racha: 2 / 3 días y el premio del hito', by('racha'));
    ok(by('cuenta').need === 400 + 480 + 560 + 640 && by('cuenta').cur === 100 && /Veterano/.test(by('cuenta').name), '[1] cuenta: XP hasta el nivel 5 y su título', by('cuenta'));
    ok(by('cicatriz').need === 10 && by('cicatriz').cur === 0 && by('cicatriz').name === 'Cicatriz I', '[1] Cicatriz: rondas hasta abrir el rango I', by('cicatriz'));
    ok(by('guardian').need === r1.cheapest && by('guardian').cur === 1000, '[1] guardián: tu oro contra el más barato', [by('guardian'), r1.cheapest]);
    ok(r1.top.length === 3 && r1.top.every((g, i, a) => !i || g.pct <= a[i - 1].pct) && r1.top[0].id === 'racha', '[1] se muestran 3, primero lo más cercano', r1.top.map(g => [g.id, g.pct]));
    ok(r1.title === 'Lo próximo que desbloqueás' && r1.rows.length === 3 && r1.rows.every(x => /^[\d.]+ \/ [\d.]+ \S/.test(x.num) && /^\d+%$/.test(x.w) && x.name), '[1] cada meta tiene premio, «X / Y» y barra', r1.rows);
    ok(!/undefined|NaN|null/.test(r1.text), '[1] sin "undefined" ni "NaN" en el panel', r1.text);

    // 2. solo lectura
    const r2 = await E(() => {
      let persists = 0; const p0 = persist, pn0 = typeof persistNow === 'function' ? persistNow : null;
      persist = function () { persists++; return p0.apply(this, arguments); }; if (pn0) persistNow = function () { persists++; return pn0.apply(this, arguments); };
      const a = JSON.stringify(save), ls = localStorage.getItem('laHordaSave_v1');
      for (let i = 0; i < 5; i++) { nextUnlockHTML(); nextUnlockGoals(99); }
      const out = { same: JSON.stringify(save) === a, ls: localStorage.getItem('laHordaSave_v1') === ls, persists };
      persist = p0; if (pn0) persistNow = pn0; return out;
    });
    ok(r2.same && r2.ls && r2.persists === 0, '[2] no cambia el guardado ni llama a persist()', r2);

    // 3. sin metas no dibuja nada; con un sistema roto, las demás metas siguen
    const r3 = await E(() => {
      const keep = Object.assign({}, NEXT_UNLOCK_SOURCES), out = {};
      NEXT_UNLOCK_SOURCES.pase = () => { throw new Error('roto'); }; out.broken = nextUnlockGoals(99).map(g => g.id);
      for (const k of Object.keys(NEXT_UNLOCK_SOURCES)) NEXT_UNLOCK_SOURCES[k] = () => null;
      const host = document.createElement('div'); host.innerHTML = '<div data-next-unlock>viejo</div>';
      out.html = nextUnlockHTML(); out.mounted = nextUnlockMount(host); out.left = host.children.length;
      Object.assign(NEXT_UNLOCK_SOURCES, keep);
      // todo cumplido de verdad: pase completo, racha más allá del último hito, cuenta con los títulos, Cicatriz V cerrada, todos los guardianes
      const snap = JSON.stringify(save), q = questsState();
      q.season.xp = 999999; q.streak.count = 99; q.titles = Object.keys(QUEST_TITLES); save.endless = { scar: { max: 5, sel: 5, best: { 5: 35 }, cleared: { 5: 1 } } };
      for (const k of Object.keys(save.champions)) save.champions[k].unlocked = true;
      out.done = nextUnlockGoals(99).map(g => g.id); out.doneHtml = nextUnlockHTML();
      const back = JSON.parse(snap); for (const k of Object.keys(save)) delete save[k]; Object.assign(save, back);
      out.restored = nextUnlockGoals(99).length;
      return out;
    });
    ok(r3.html === '' && r3.mounted === null && r3.left === 0, '[3] sin metas: HTML vacío y el panel viejo se quita', r3);
    ok(r3.broken.length === 4 && !r3.broken.includes('pase'), '[3] si una fuente falla, las otras metas siguen', r3.broken);
    ok(r3.done.length === 0 && r3.doneHtml === '' && r3.restored === 5, '[3] con todo conseguido no queda ninguna meta', r3);

    // 4. resultados de la Horda
    const r4 = await E(() => {
      endlessActive = false; scarSave().sel = 0; endlessBeginRun(); EN.round = 6; EN.score = 1234; endlessEndRun('defeat');
      const box = document.querySelector('#endless-screen .en-res'), p = box.querySelector(':scope > [data-next-unlock]'), btns = box.querySelector('.en-res-btns');
      const pr = p && p.getBoundingClientRect();
      return { state, has: !!p, n: box.querySelectorAll('[data-next-unlock]').length, before: !!p && p.nextElementSibling === btns, text: p ? p.innerText : '', w: pr ? pr.width : 0, h: pr ? pr.height : 0,
        scar: (nextUnlockGoals(99).find(g => g.id === 'cicatriz') || {}), pride: !!box.querySelector('[data-nu-pride]'), again: !!document.getElementById('en-again-btn') };
    });
    ok(r4.state === 'endless' && r4.has && r4.n === 1 && r4.before && r4.again, '[4] Horda: un panel, arriba de los botones', r4);
    ok(/LO PRÓXIMO QUE DESBLOQUEÁS/i.test(r4.text) && !/undefined|NaN/.test(r4.text) && r4.w > 200 && r4.h > 30 && r4.h < 160, '[4] Horda: se ve y es compacto', r4);
    ok(r4.scar.cur === 6 && r4.scar.need === 10, '[4] la meta de Cicatriz usa el récord recién hecho (6 / 10 rondas)', r4.scar);
    await page.waitForTimeout(600); await shot('horda-resultados-1280.png');
    const r4b = await E(() => { endlessShowResults(); return document.querySelectorAll('#endless-screen [data-next-unlock]').length; });
    ok(r4b === 1, '[4] volver a dibujar los resultados no duplica el panel', r4b);

    // 5. momento de orgullo: rango completado → título
    const r5 = await E(async () => {
      endlessFinish(); endlessActive = false; scarSave().max = 1; scarSave().sel = 1; endlessBeginRun(); EN.round = 15; EN.score = 99999; endlessEndRun('defeat');   // el rango I se completa en la ronda 15 y da su título
      const box = document.querySelector('#endless-screen .en-res'), pr = box.querySelector('[data-nu-pride]');
      const out = { title: EN.local.scar.title, btns: pr ? [...pr.querySelectorAll('button')].map(b => b.textContent) : [], after: !!pr && pr.previousElementSibling === box.querySelector('.en-res-btns') };
      pr.querySelector('[data-nu-act="perfil"]').click();
      out.state1 = state; out.tab = questsTab; out.chips = document.querySelectorAll('#quests-body [data-qset^="title:"]').length;
      questsClose(); out.state2 = state; out.still = !!document.querySelector('#endless-screen [data-next-unlock]');
      return out;
    });
    ok(r5.title === 'marcado_1' && r5.btns.join('|') === 'Equipar título|Ver apariencias' && r5.after, '[5] con rango completado: «Equipar título» y «Ver apariencias», debajo de los botones', r5);
    ok(r5.state1 === 'quests' && r5.tab === 'perfil' && r5.chips >= 2 && r5.state2 === 'endless' && r5.still, '[5] «Equipar título» abre el Perfil y «Volver» regresa a los resultados', r5);
    await page.waitForTimeout(400); await shot('horda-orgullo-1280.png');
    const r5b = await E(() => { document.querySelector('[data-nu-act="skins"]').click(); return { state, tab: typeof codexChampTab !== 'undefined' ? codexChampTab : '', active: endlessActive, pending: endlessPending }; });
    ok(r5b.state === 'codex' && r5b.tab === 'skins' && !r5b.active && !r5b.pending, '[5] «Ver apariencias» cierra el modo y abre el probador', r5b);
    const r5c = await E(() => { setState('mainmenu'); renderMainMenu(); endlessActive = false; scarSave().sel = 0; endlessBeginRun(); EN.round = 2; EN.score = 1; endlessEndRun('defeat'); const o = !!document.querySelector('#endless-screen [data-nu-pride]'); endlessFinish(); return o; });
    ok(!r5c, '[5] sin récord ni rango completado no hay botones extra', r5c);

    // 4c. Campaña: derrota y victoria (el resumen de desafíos lo dibuja questsShowRunSummary)
    const r4c = await E(async () => {
      const out = {}, sum = { xp: 40, pass: questsSeason(), passUp: 0, chal: 0, ach: 0 };
      for (const st of ['gameover', 'victory']) {
        setState(st); questsShowRunSummary(sum);
        const scr = document.getElementById(st + '-screen'), p = scr.querySelector(':scope > [data-next-unlock]'), r = p && p.getBoundingClientRect();
        out[st] = { has: !!p, n: scr.querySelectorAll('[data-next-unlock]').length, sum: !!scr.querySelector('.qs-run-sum'), w: r ? r.width : 0, right: r ? r.right : 0, vw: innerWidth,
          afterBtn: st === 'gameover' ? !!p && !!(p.compareDocumentPosition(document.getElementById('menu-btn-1')) & Node.DOCUMENT_POSITION_PRECEDING) : !!p && !!(p.compareDocumentPosition(document.getElementById('victory-next-btn')) & Node.DOCUMENT_POSITION_PRECEDING) };
        if (st === 'gameover') { window.__shotReady = true; }
      }
      return out;
    });
    ok(r4c.gameover.has && r4c.gameover.n === 1 && r4c.gameover.sum && r4c.gameover.afterBtn && r4c.gameover.right <= r4c.gameover.vw, '[4] Campaña, derrota: panel debajo de los botones', r4c.gameover);
    ok(r4c.victory.has && r4c.victory.n === 1 && r4c.victory.afterBtn, '[4] Campaña, victoria: panel debajo de «Continuar»', r4c.victory);
    await E(() => { setState('gameover'); questsShowRunSummary({ xp: 40, pass: questsSeason(), passUp: 0, chal: 0, ach: 0 }); });
    await page.waitForTimeout(500); await shot('campana-derrota-1280.png');
    await E(() => { setState('mainmenu'); renderMainMenu(); }); await page.waitForTimeout(1100);
    ok(await E(() => document.querySelectorAll('#gameover-screen [data-next-unlock], #victory-screen [data-next-unlock]').length === 0), '[4] al salir del fin de partida el panel se va');

    // 6. marco propio del Rango V
    const r6 = await E(() => {
      const q = questsState(), f0 = q.frames.slice();
      scarSave().max = 5; scarSave().sel = 5; endlessActive = false; endlessBeginRun(); EN.round = 35; const L = {}; const res = scarOnRunEnd(35, L);
      const out = { frame: res.frame, title: res.title, newF: q.frames.filter(f => !f0.includes(f)), v: QUEST_FRAMES.cicatriz_v, top: QUEST_FRAMES.cicatriz, map: scarFrameId('cicatriz'), keep: scarFrameId('cicatriz_v'), other: scarFrameId('oro'),
        lb: typeof LB_REWARDS !== 'undefined' ? LB_REWARDS.map(r => r.frame) : null, titles: Object.keys(QUEST_TITLES).map(k => QUEST_TITLES[k].name) };
      endlessFinish(); q.frames = f0;
      // quien ya lo había completado antes lo recibe al normalizar
      save.endless.scar = { max: 5, sel: 5, best: { 5: 36 }, cleared: { 5: 1 } }; scarSave(); out.sync = q.frames.includes('cicatriz_v') && !q.frames.includes('cicatriz');
      q.frames = f0; save.endless = {};
      return out;
    });
    ok(r6.frame === 'cicatriz_v' && r6.newF.join() === 'cicatriz_v' && r6.title === 'marcado_5', '[6] completar el Rango V da el marco `cicatriz_v` (no el del ranking)', r6);
    ok(r6.v && r6.top && r6.v.name !== r6.top.name && JSON.stringify(r6.v.c) !== JSON.stringify(r6.top.c) && !r6.titles.includes(r6.v.name), '[6] son dos marcos distintos y el nombre no choca con un título', [r6.v, r6.top]);
    ok(r6.map === 'cicatriz_v' && r6.keep === 'cicatriz_v' && r6.other === 'oro' && r6.sync, '[6] funciona con el dato viejo y con el nuevo; quien ya lo tenía cerrado lo recibe', r6);

    // 7. Tienda
    const r7 = await E(async () => {
      setState('mainmenu'); renderMainMenu(); shopOpen('destacados');
      const p = document.getElementById('shop-panel'), out = {};
      out.show = p.innerText; out.fair = (p.querySelector('.shop-fair') || {}).innerText || '';
      out.cromas = [...p.querySelectorAll('[data-croma-card] .shop-item-sub')].map(n => n.innerText);
      shopOpen('skins'); out.skins = p.innerText;
      shopOpen('brasas'); out.brasas = p.innerText; out.exits = [...p.querySelectorAll('[data-shop-exit]')].map(b => b.textContent); out.locks = p.querySelectorAll('.mpc-locked').length;
      out.howto = COSMETIC_HOWTO.set;
      p.querySelector('[data-shop-exit="quests"]').click(); out.stQ = state; setState('mainmenu'); renderMainMenu();
      shopOpen('brasas'); document.querySelector('#shop-panel [data-shop-exit="skins"]').click(); out.stS = state; out.tab = codexChampTab;
      return out;
    });
    ok(!/undefined/.test(r7.show) && !/undefined/.test(r7.skins) && !/undefined/.test(r7.brasas) && r7.cromas.length > 0 && r7.cromas.every(t => !/undefined|expedition/.test(t) && !/·\s*$/.test(t.trim())), '[7] Tienda: sin "undefined" en Destacados, Skins ni Brasas', r7.cromas.slice(0, 6));
    ok(/Todo el poder se consigue jugando/.test(r7.fair) && !/Casi todo/.test(r7.show), '[7] «Todo el poder se consigue jugando»', r7.fair);
    ok(!/arte pendiente|docs\//.test(r7.skins), '[7] Skins: sin nota de desarrollo', r7.skins.slice(-300));
    ok(!/oro en la Tienda/.test(r7.howto) && /botín/.test(r7.howto), '[7] cómo conseguir un set: ya no dice que las piezas se compran con oro', r7.howto);
    ok(/Iniciá sesión para comprar Brasas\./.test(r7.brasas) && r7.exits.join('|') === 'Probar apariencias|Ver desafíos' && r7.locks === 0 && /Solo apariencia/.test(r7.brasas), '[7] Brasas sin cuenta: salidas útiles y sin candados mudos', [r7.exits, r7.locks]);
    ok(r7.stQ === 'quests' && r7.stS === 'codex' && r7.tab === 'skins', '[7] las salidas abren Desafíos y el probador', r7);
    await E(() => { setState('mainmenu'); renderMainMenu(); shopOpen('brasas'); }); await page.waitForTimeout(500); await shot('tienda-brasas-sin-cuenta-1280.png');

    // 8. pase sin cuenta
    const r8 = await E(async () => {
      setState('mainmenu'); renderMainMenu(); bpOpen(); await new Promise(r => setTimeout(r, 300));
      const P = document.querySelector('.bp-panel'), out = { text: P.innerText, acts: [...P.querySelectorAll('[data-bp-act]')].map(b => b.dataset.bpAct), locks: P.querySelectorAll('.mpc-locked').length, hold: BP_PREMIUM_HOLD };
      const r = P.getBoundingClientRect(); out.fit = r.left >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1;
      return out;
    });
    ok(/Iniciá sesión/.test(r8.text) && ['freepass', 'skins', 'login', 'close'].every(a => r8.acts.includes(a)) && r8.locks === 0 && r8.fit, '[8] pase sin cuenta: pide iniciar sesión y ofrece el pase gratis y el probador', r8);
    await page.waitForTimeout(300); await shot('pase-sin-cuenta-1280.png');
    const r8b = await E(() => { document.querySelector('.bp-panel [data-bp-act="freepass"]').click(); return { state, tab: questsTab, hidden: document.getElementById('bp-screen').classList.contains('hidden') }; });
    ok(r8b.state === 'quests' && r8b.tab === 'pase' && r8b.hidden, '[8] «Ver el pase gratis» abre el Pase de temporada', r8b);
    // el premium con cosméticos sin arte: aviso neutro a la vista; con la retención prendida no hay botón de compra
    const r8c = await E(() => {
      const track = []; for (let t = 1; t <= 30; t++) track.push({ tier: t, free: { gold: 100 }, premium: t === 10 ? { cosmetic: 'bp:skin_1' } : t === 5 ? { brasas: 30 } : null });
      BP.data = { season: { id: 1, daysLeft: 20 }, tier: 6, tiers: 30, xp: 6200, xpPerTier: 1000, premium: false, pricePremiumBrasas: 950, claimed: [], track, challenges: [] }; BP.err = ''; BP.loading = false;
      _bpEl().classList.remove('hidden'); _bpRender();
      const P = document.querySelector('.bp-panel'), out = { pending: _bpPremiumPending(BP.data), hold: !!P.querySelector('[data-bp-hold]'), holdOn: BP_PREMIUM_HOLD, buy: P.querySelectorAll('.bp-buy').length };
      BP.data.track.forEach(t => { if (t.premium && t.premium.cosmetic) t.premium = { brasas: 10 }; }); _bpRender();
      out.noPend = { pending: _bpPremiumPending(BP.data), hold: !!P.querySelector('[data-bp-hold]'), buy: P.querySelectorAll('.bp-buy').length };
      BP.data = null; bpClose(); return out;
    });
    ok(r8c.holdOn && r8c.pending && r8c.buy === 0 && r8c.hold && !r8c.noPend.pending && !r8c.noPend.hold && r8c.noPend.buy === 1, '[8] premium con cosméticos sin arte: no se vende y lo avisa; con arte final, el botón vuelve', r8c);

    // 9. pantalla chica (667x375): el panel no se sale
    await page.setViewportSize({ width: 667, height: 375 });
    const r9 = await E(async () => {
      setState('mainmenu'); renderMainMenu(); endlessActive = false; scarSave().sel = 0; endlessBeginRun(); EN.round = 6; EN.score = 500; endlessEndRun('defeat');
      await new Promise(r => setTimeout(r, 200));
      const p = document.querySelector('#endless-screen [data-next-unlock]'), r = p.getBoundingClientRect(), scr = document.getElementById('endless-screen');
      const again = document.getElementById('en-again-btn').getBoundingClientRect();
      return { left: r.left, right: r.right, vw: innerWidth, sw: scr.scrollWidth, cw: scr.clientWidth, h: r.height, rows: [...p.querySelectorAll('.nu-row')].map(x => x.scrollWidth <= x.clientWidth + 1), againTop: again.top, vh: innerHeight };
    });
    ok(r9.left >= 0 && r9.right <= r9.vw + 1 && r9.sw <= r9.cw + 1 && r9.rows.every(Boolean), '[9] 667x375: el panel entra a lo ancho, sin desborde', r9);
    await page.waitForTimeout(400); await shot('horda-resultados-667.png');
    await E(() => endlessFinish());
    ok(errs.length === 0, 'sin errores de página', errs.slice(0, 3));
  } catch (e) { console.error(e); fails++; }
  finally { await browser.close(); await site.close(); }
  console.log(fails ? `\n${fails} FALLAS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})();
