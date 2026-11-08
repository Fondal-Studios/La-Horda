'use strict';
/* RACHA DIARIA y CAMBIO DE FECHA (js/systems/quests.js, js/data/quests.js):
 *   - cada día con ≥1 desafío diario completado suma +1; hitos 3/7/14 dan cofre, título o marco (NUNCA Brasas ni oro);
 *   - el congelador semanal se GANA jugando (3 desafíos diarios en la semana) y salva un día perdido;
 *   - el reloj del cliente no infla la racha: saltos hacia atrás rechazados (se usa el último día registrado), también tras recargar;
 *   - saltarse días sin congelador reinicia; no existe ninguna plantilla por tiempo jugado;
 *   - el hub muestra la racha.
 *   node tools/items/t_quests_streak.js   (levanta su servidor; SE_BASE_URL para usar otro) */
const H = require('../lib/serve');
let fails = 0; const ok = (c, m, x) => { console.log((c ? 'PASS ' : 'FAIL ') + m + (c || x === undefined ? '' : '  ' + JSON.stringify(x).slice(0, 300))); if (!c) fails++; };
(async () => {
  const site = await H.startSite({ envUrl: ['SE_BASE_URL'] }), browser = await H.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 844, height: 390 } }), errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.route('**/api/rooms?*', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"rooms":[]}' }));
    await H.goto(page, site.url + '/index.html');
    await page.waitForFunction(() => typeof questsEvaluate === 'function' && typeof save !== 'undefined' && save.quests, null, { timeout: 240000 });
    await page.waitForTimeout(1500);
    const E = (fn, a) => page.evaluate(fn, a);
    // Ayudantes dentro del navegador: día simulado (mediodía local) y "completar un desafío diario" sin oro de por medio.
    await E(() => {
      window.__day = (y, m, d) => { window.__questsNow = new Date(y, m - 1, d, 12).getTime(); questsEnsureRotation(); };
      window.__complete = () => { const q = save.quests, c = { tpl: 'kills', stat: 'kills', n: 5, gold: 0, done: false, base: questsView().kills }; q.daily.list[0] = c; q.stats.kills += 5; questsEvaluate(true); return c.done; };
      window.__snap = () => ({ gold: save.gold, gems: save.gems || 0, chests: save.quests.chests.length, titles: save.quests.titles.length, frames: save.quests.frames.length, s: JSON.parse(JSON.stringify(save.quests.streak)) });
      // Registro de TODO lo que entrega la racha (las pantallas de logros y el pase también dan oro por otros motivos: se aíslan por pila de llamadas).
      window.__streakGrants = []; const orig = questsGrant;
      questsGrant = (r, silent) => { if (new Error().stack.includes('_qStreakCredit')) window.__streakGrants.push(JSON.parse(JSON.stringify(r))); return orig(r, silent); };
      save.quests.streak = { count: 0, best: 0, last: '', seen: '', freezes: 0, weekKey: '', weekDone: 0, weekEarned: '', claimed: {} };
    });

    // --- datos: sin tiempo jugado, hitos sin Brasas ni oro ---
    const d = await E(() => ({ minutes: CHALLENGE_TEMPLATES.some(t => t.id === 'minutes' || t.stat === 'minutes'), tiempo: CHALLENGE_TEMPLATES.some(t => /minutos|horas/i.test(t.name + t.desc(5, 'x'))),
      ms: STREAK_MILESTONES.map(m => ({ days: m.days, keys: Object.keys(m.reward) })), horasOro: ACHIEVEMENTS.filter(a => /timeMs/.test(String(a.prog)) && (a.reward.gold || a.reward.gems || a.reward.brasas)).length }));
    ok(!d.minutes && !d.tiempo && d.horasOro === 0, 'no hay plantillas ni oro por tiempo jugado', d);
    ok(JSON.stringify(d.ms.map(m => m.days)) === '[3,7,14]' && d.ms.every(m => m.keys.every(k => ['chest', 'title', 'frame'].includes(k))), 'hitos 3/7/14: solo cofre, título o marco (sin Brasas ni oro)', d.ms);

    // --- racha día a día (martes 10/3/2026 + semana ISO) ---
    const r1 = await E(() => { __day(2026, 3, 10); const a = __complete(), s1 = __snap(); const again = __complete(); const s1b = __snap(); return { a, s1, sameDay: s1b.s.count === 1 && s1b.s.last === '2026-03-10', again, hub: questsStreakHubText() }; });
    ok(r1.a && r1.s1.s.count === 1 && r1.s1.s.last === '2026-03-10', 'primer desafío del día: racha = 1', r1.s1.s);
    ok(r1.sameDay, 'otro desafío el mismo día no suma dos veces');
    ok(/^Racha 1 ✔$/.test(r1.hub), 'el hub muestra la racha de hoy', r1.hub);
    const base = await E(() => __snap());
    const r2 = await E(() => { __day(2026, 3, 11); const before = questsStreakInfo(); __complete(); __day(2026, 3, 12); __complete(); return { before, s: __snap() }; });
    ok(r2.before.count === 1 && r2.before.atRisk, 'al día siguiente la racha sigue viva y se ve "falta hoy"', r2.before);
    ok(r2.s.s.count === 3 && r2.s.s.claimed['2026-03:3'], 'tres días seguidos: racha 3 y hito cobrado', r2.s.s);
    const g3 = await E(() => window.__streakGrants);
    ok(g3.length === 1 && JSON.stringify(g3[0]) === '{"chest":2}' && r2.s.chests === base.chests + 1, 'el hito de 3 días da un cofre y nada de oro, gemas ni Brasas', g3);
    ok(r2.s.s.freezes === 1 && r2.s.s.weekEarned, 'el congelador se ganó jugando (3 desafíos diarios en la semana)', r2.s.s);

    // --- cambio de fecha: hacia atrás se rechaza ---
    const r3 = await E(() => { const pre = __snap(), key = save.quests.daily.key, list = JSON.stringify(save.quests.daily.list); __day(2026, 3, 9); const post = __snap();
      return { key, keyNow: questsDayKey(), sameList: JSON.stringify(save.quests.daily.list) === list, clockBack: QST.clockBack, again: __complete(), count: save.quests.streak.count, same: JSON.stringify(pre.s) === JSON.stringify(post.s), seen: save.quests.streak.seen }; });
    ok(r3.keyNow === '2026-03-12' && r3.sameList && r3.clockBack && r3.seen === '2026-03-12', 'reloj atrasado: se sigue usando el último día registrado y no se re-rotan los desafíos', r3);
    ok(r3.count === 3 && r3.same, 'reloj atrasado: la racha no se infla ni cambia', r3);

    // --- saltearse un día con congelador: se salva; sin congelador: se reinicia ---
    const r4 = await E(() => { __day(2026, 3, 14); const info = questsStreakInfo(); __complete(); const s = __snap().s; __day(2026, 3, 17); const info2 = questsStreakInfo(); __complete(); return { info, s, info2, s2: __snap().s }; });
    ok(r4.info.count === 3 && r4.s.count === 4 && r4.s.freezes === 0, 'falta un día y hay congelador: la racha se salva (y el congelador se gasta)', r4);
    ok(r4.info2.count === 0 && r4.s2.count === 1 && r4.s2.best === 4, 'faltan días sin congelador: la racha se reinicia en 1 (la mejor queda en 4)', r4);

    // --- hitos 7 y 14: título y marco/cofre, nunca oro ---
    const r5 = await E(() => { save.quests.streak = { count: 0, best: 0, last: '', seen: '', freezes: 0, weekKey: '', weekDone: 0, weekEarned: '', claimed: {} }; const b = __snap(), got = [];
      for (let i = 0; i < 14; i++) { __day(2026, 6, 1 + i); __complete(); const s = __snap(); got.push([s.s.count, s.chests - b.chests, s.titles - b.titles, s.frames - b.frames]); }
      const a = __snap(); return { b, a, got, hasTitle: save.quests.titles.includes('constante'), hasFrame: save.quests.frames.includes('racha') }; });
    ok(r5.a.s.count === 14 && r5.hasTitle && r5.hasFrame, 'a los 7 días llega el título "Constante" y a los 14 el marco "Racha de Brasa"', r5.got.slice(5));
    const g14 = await E(() => window.__streakGrants.slice(1));   // el primero (3 días) es del tramo anterior
    ok(JSON.stringify(g14) === '[{"chest":2},{"title":"constante"},{"chest":3,"frame":"racha"}]' && g14.every(r => Object.keys(r).every(k => ['chest', 'title', 'frame'].includes(k))), 'en toda la racha solo se entrega cofre, título y marco (ni oro, ni gemas, ni Brasas)', g14);
    const again = await E(() => { __day(2026, 6, 14); const b = __snap(); __complete(); return JSON.stringify(b.s.claimed) === JSON.stringify(__snap().s.claimed) && __snap().chests === b.chests; });
    ok(again, 'los hitos no se cobran dos veces');

    // --- los hitos se cobran A LO SUMO una vez por mes aunque se pierda y se rearme la racha (un reloj adelantado a mano no farmea cofres) ---
    const farm = await E(() => { const n0 = window.__streakGrants.length;
      for (let r = 0; r < 4; r++) { __day(2026, 8, 1 + r * 9); __complete(); __day(2026, 8, 2 + r * 9); __complete(); __day(2026, 8, 3 + r * 9); __complete(); }   // 4 veces: 3 días seguidos, perder la racha, otra vez
      return { n: window.__streakGrants.length - n0, keys: Object.keys(save.quests.streak.claimed) }; });
    ok(farm.n <= 1 && farm.keys.every(k => k.startsWith('2026-08')), 'perder y rearmar la racha el mismo mes NO vuelve a dar el hito de 3 días (máx. un cofre por mes)', farm);
    // --- un reloj puesto muy hacia adelante y luego corregido no deja al jugador atascado (se reinicia la racha, no se queda en el futuro) ---
    const stuck = await E(() => { __day(2099, 1, 1); __complete(); __day(2026, 9, 20); const before = save.quests.streak.count; questsEnsureRotation(); return { before, day: questsDayKey(), count: save.quests.streak.count, seen: save.quests.streak.seen }; });
    ok(stuck.day === '2026-09-20' && stuck.seen === '2026-09-20' && stuck.count === 0, 'reloj adelantado >7 días y luego corregido: se acepta la vuelta y la racha se reinicia (no queda atascado)', stuck);
    // un retroceso chico (<=7 días) sigue rechazado
    const small = await E(() => { __day(2026, 9, 25); __complete(); __day(2026, 9, 22); questsEnsureRotation(); return { day: questsDayKey(), back: QST.clockBack }; });
    ok(small.day === '2026-09-25' && small.back, 'un retroceso chico (<=7 días) sigue rechazado', small);

    // --- reloj real atrasado tras recargar (sin __questsNow) ---
    await E(() => { window.__questsNow = null; save.quests.streak.seen = '2099-01-01'; persist(); });
    await page.reload(); await H.goto(page, site.url + '/index.html').catch(() => {});
    await page.waitForFunction(() => typeof questsEvaluate === 'function' && save.quests, null, { timeout: 240000 });
    await page.waitForTimeout(1500);
    const rl = await E(() => { questsEnsureRotation(); return { day: questsDayKey(), back: QST.clockBack, seen: save.quests.streak.seen }; });
    ok(rl.day !== '2099-01-01' && !rl.back && rl.seen === rl.day, 'tras recargar, un guardado con un día en el futuro lejano (>7 días) no deja atascado: se acepta el reloj real', rl);
    ok(errs.length === 0, 'sin errores de página', errs);
  } finally { await browser.close(); await site.close(); }
  console.log(fails ? `\n${fails} FALLA(S)` : '\nTodo en verde'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
