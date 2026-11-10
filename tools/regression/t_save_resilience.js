'use strict';
/* GUARDADO Y FIN DE PARTIDA A PRUEBA DE FALLAS — navegador real (una sola instancia).
 *  A. Guardado ilegible: se avisa UNA vez, el original no se pisa antes de que el jugador lo lea, queda copia en _noCargo,
 *     después de aceptar el juego vuelve a guardar, al recargar no avisa de nuevo y un respaldo existente nunca se pisa.
 *  B. Almacenamiento lleno: persistNow() falla -> un aviso por sesión (no uno por intento).
 *  C. Daño recibido: nunca negativo (no cura); el refuerzo de armadura de la partida tiene tope; por debajo del tope no cambia nada;
 *     recibir un golpe no deja la vida por encima del máximo.
 *  D. Horda: un cofre con el inventario lleno va al buzón (Recompensas pendientes), no se pierde.
 *  E. Victoria con el almacenamiento lleno: un aviso y los botones siguen funcionando; la recompensa no se entrega dos veces;
 *     save.victoryReceipts queda acotado sin perder el recibo actual ni los que faltan revisar.
 *  F. Victoria en sesión de red local (sin guardado por diseño): ningún aviso, los tres botones funcionan.
 *  node tools/regression/t_save_resilience.js   (servidor propio en un puerto libre)
 */
const H = require('../lib/serve');
const path = require('node:path');
let fails = 0;
const ok = (c, m, x) => { console.log((c ? 'PASS ' : 'FAIL ') + m + (c || x === undefined ? '' : '  ' + JSON.stringify(x).slice(0, 500))); if (!c) fails++; };
const KEY = 'laHordaSave_v1';
const SAVE = JSON.stringify({ tut: { training: 1 }, starterChosen: true, starterGiftV1: true, starterSkin: 'vale', playtestV1Bonus: true, campaignResetV1: true, campaignResetV2: true });
const BAD = '{"gold":5000,"champions":{"guerrero":{"lev', BAD2 = '[1,2';
const LOAD = 180000;
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const site = await H.startSite(), browser = await H.launch(), errs = [];
  const ready = page => page.waitForFunction(() => { const b = document.getElementById('title-continue-btn'); return typeof setState === 'function' && b && !b.disabled; }, null, { timeout: LOAD });
  async function open(raw, tag) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await ctx.addInitScript(s => { try { if (!sessionStorage.getItem('__sc')) { localStorage.setItem('laHordaSave_v1', s); sessionStorage.setItem('__sc', '1'); } } catch (e) {} }, raw);
    const page = await ctx.newPage();
    page.on('pageerror', e => errs.push(tag + ': ' + e.message.slice(0, 200)));
    await page.route('**/api/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"rooms":[]}' }));
    await page.goto(site.url + '/index.html?lazy=0', { waitUntil: 'load', timeout: LOAD });
    await ready(page);
    return { ctx, page };
  }
  const dialogText = page => page.evaluate(() => { const d = document.getElementById('game-dialog'); return d && !d.classList.contains('hidden') ? d.querySelector('.gd-msg').textContent : null; });
  const waitDialog = async (page, ms) => { for (let t = 0; t < ms; t += 200) { const x = await dialogText(page); if (x != null) return x; await sleep(200); } return null; };
  const accept = async page => { await sleep(350); await page.evaluate(() => document.querySelector('#game-dialog .gd-ok').click()); await sleep(150); };
  const prepRun = page => page.addScriptTag({ path: path.join(H.ROOT, 'tools/balance/autopilot.js') }).then(() => page.evaluate(() => {
    loop = function () {}; for (const k in save.champions) save.champions[k].unlocked = true;
    window.SIM = function (ms) { const n = Math.round(ms / 16.67); for (let i = 0; i < n; i++) { if (state === 'buff') __AP.pickBuff(); if (state !== 'playing') break; for (const h of heroes) { h.alive = true; h.hp = h.maxHp; } update(16.67); } };
    window.WIN = function () { finishBossVictory(); for (let i = 0; i < 600 && state === 'playing'; i++) update(16.67); return state; };
  }));

  try {
    // ---------- A. guardado ilegible ----------
    {
      const { ctx, page } = await open(BAD, 'A');
      const msg = await waitDialog(page, 8000);
      ok(msg != null, '[A] guardado ilegible: aparece un aviso al jugador', msg);
      ok(!!msg && /guardado/i.test(msg) && /respald/i.test(msg) && /perfil nuevo/i.test(msg), '[A] el aviso dice qué pasó, que hay respaldo y que sigue con un perfil nuevo', msg);
      const a1 = await page.evaluate(k => ({ failed: saveLoadFailed, kept: localStorage.getItem(k), backup: localStorage.getItem(k + '_noCargo'), gold: save.gold }), KEY);
      ok(a1.kept === BAD && a1.backup === BAD && a1.gold === 0, '[A] antes de aceptar: el original no se pisó y hay copia en _noCargo', a1);
      if (msg != null) await accept(page);
      const a2 = await page.evaluate(k => { save.gold = 77; const w = persistNow(); let p = null; try { p = JSON.parse(localStorage.getItem(k)); } catch (e) {} return { failed: saveLoadFailed, w, gold: p && p.gold, champs: !!(p && p.champions), backup: localStorage.getItem(k + '_noCargo') }; }, KEY);
      ok(a2.failed === false && a2.w === true && a2.gold === 77 && a2.champs, '[A] después de aceptar el juego vuelve a guardar el perfil nuevo', a2);
      ok(a2.backup === BAD, '[A] el respaldo sigue intacto después de guardar', a2.backup);
      await page.reload({ waitUntil: 'load', timeout: LOAD }); await ready(page);
      const again = await waitDialog(page, 2500);
      const a3 = await page.evaluate(k => ({ failed: saveLoadFailed, gold: save.gold, backup: localStorage.getItem(k + '_noCargo') }), KEY);
      ok(again == null && a3.failed === false && a3.gold >= 77 && a3.backup === BAD, '[A] al recargar: carga el perfil nuevo, sin aviso repetido', { again, a3 });
      // segunda rotura: el respaldo que ya existía no se pisa; la copia nueva va aparte
      await page.evaluate(([k, b]) => localStorage.setItem(k, b), [KEY, BAD2]);
      await page.reload({ waitUntil: 'load', timeout: LOAD }); await ready(page);
      const msg2 = await waitDialog(page, 8000);
      const a4 = await page.evaluate(k => { const extra = []; for (let i = 0; i < localStorage.length; i++) { const n = localStorage.key(i); if (n.indexOf(k + '_noCargo_') === 0) extra.push(localStorage.getItem(n)); } return { first: localStorage.getItem(k + '_noCargo'), extra, kept: localStorage.getItem(k) }; }, KEY);
      ok(msg2 != null && a4.first === BAD && a4.extra.includes(BAD2) && a4.kept === BAD2, '[A] segunda rotura: el primer respaldo no se pisa y el nuevo queda en otra clave', { msg2, a4 });
      await ctx.close();
    }

    // ---------- B-E. almacenamiento lleno, combate, cofre de la Horda, victoria ----------
    {
      const { ctx, page } = await open(SAVE, 'B');
      await prepRun(page);
      // C. combate (antes de romper el almacenamiento)
      const c = await page.evaluate(() => {
        lobbyAllies = null; __AP.start('guerrero', 'ciudad', 1); __AP.on = false;
        const foe = { type: 'x', rank: 'elite', alive: true, hp: 100, maxHp: 100, x: player.x + 10, y: player.y };
        // golpe chico (20, bajo el tope por golpe de un élite) con la vida llena: el guardián de nivel 1 no cae entre medidas
        const hit = db => { runStats.defBonus = db; player.alive = true; player.hp = player.maxHp; player.shield = 0; player.itemShield = 0; player.invulnTimer = 0; player.buffDefMult = 0; const h0 = player.hp; damageHero(player, 20, foe); return h0 - player.hp; };
        const out = { d: {} };
        for (const db of [0, 0.16, 0.48, 0.8, 0.96, 1.28]) out.d[db] = hit(db);
        runStats.defBonus = 0; player.alive = true; player.hp = player.maxHp * 1.5; damageHero(player, 1, foe); out.over = player.hp / player.maxHp; out.alive = player.alive;
        runStats.defBonus = 0; player.hp = player.maxHp; out.cap = typeof RUN_DEF_BONUS_CAP === 'number' ? RUN_DEF_BONUS_CAP : null;
        return out;
      });
      const d0 = c.d[0], near = (a, b) => Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(b));
      ok(d0 > 0 && near(c.d[0.16], d0 * 0.84) && near(c.d[0.48], d0 * 0.52) && near(c.d[0.8], d0 * 0.2), '[C] por debajo del tope el daño recibido no cambia (0 %, 16 %, 48 %, 80 %)', c.d);
      ok(c.d[0.96] > 0 && c.d[1.28] > 0, '[C] con armadura apilada el golpe sigue haciendo daño (nunca cura)', c.d);
      ok(near(c.d[0.96], d0 * 0.2) && near(c.d[1.28], d0 * 0.2), '[C] la reducción del refuerzo queda en el tope del 80 %', c);
      ok(c.over <= 1 + 1e-9, '[C] un golpe no deja la vida por encima del máximo', c.over);

      // D. cofre de la Horda con el inventario lleno
      const d = await page.evaluate(() => {
        const keep = save.stash.slice(), mail0 = rewardOverflowCount();
        for (let i = 0; i < 200 && !stashFull(); i++) stashItems().push(materializeLoot({ tier: 'comun' }, selectedClass, currentArena));
        const full = stashFull(); let it = null, exc = null;
        try { it = endlessRollItem('B', currentArena, false); } catch (e) { exc = String(e); }
        const r = { full, got: !!it, name: it && it.name, exc, mail: rewardOverflowCount() - mail0, inMail: !!it && (save.rewardOverflow || []).flat().some(x => x.uid === it.uid) };
        save.stash = keep; if (it) save.rewardOverflow = (save.rewardOverflow || []).map(ch => ch.filter(x => x.uid !== it.uid)).filter(ch => ch.length);
        return r;
      });
      ok(d.full && d.got && d.mail === 1 && d.inMail, '[D] Horda: el cofre con el inventario lleno va al buzón (no se pierde)', d);

      // B. almacenamiento lleno fuera de la victoria: un aviso por sesión
      await page.evaluate(() => { setState('mainmenu'); const orig = Storage.prototype.setItem; Storage.prototype.setItem = function (k) { if (k === 'laHordaSave_v1') throw new DOMException('quota', 'QuotaExceededError'); return orig.apply(this, arguments); }; window.__w = [persistNow(), persistNow()]; });
      const bmsg = await waitDialog(page, 8000);
      ok(bmsg != null && /guardar/i.test(bmsg), '[B] almacenamiento lleno: aparece un aviso', bmsg);
      if (bmsg != null) await accept(page);
      const b2 = await page.evaluate(() => { const w = [persistNow(), persistNow(), persistNow()]; return { first: window.__w, w }; });
      const bAgain = await waitDialog(page, 2500);
      ok(b2.first.every(x => x === false) && b2.w.every(x => x === false) && bAgain == null, '[B] el aviso no se repite en cada intento (una vez por sesión)', { b2, bAgain });

      // E. victoria con el almacenamiento lleno + recibos acotados
      const e1 = await page.evaluate(() => {
        save.victoryReceipts = { 'pend:ciudad:mago': { id: 'pend:ciudad:mago', data: { rewards: [] }, reviewed: false } };
        for (let i = 0; i < 120; i++) save.victoryReceipts['old' + i + ':ciudad:guerrero'] = { id: 'old' + i + ':ciudad:guerrero', reviewed: true };
        lobbyAllies = null; __AP.start('guerrero', 'ciudad', 1); SIM(3000);
        const st = WIN(), gold = save.gold, n = victoryData && victoryData.rewards.length;
        const again = buildVictoryData();   // misma partida: mismo recibo, nada se entrega dos veces
        const ids = Object.keys(save.victoryReceipts), cur = save.lastVictoryReward && save.lastVictoryReward.id;
        return { st, sameGold: save.gold === gold, sameN: again.rewards.length === n, count: ids.length, cur: ids.includes(cur), pend: ids.includes('pend:ciudad:mago'), newest: ids.includes('old119:ciudad:guerrero'), oldest: ids.includes('old0:ciudad:guerrero') };
      });
      ok(e1.st === 'victory' && e1.sameGold && e1.sameN, '[E] la victoria no entrega dos veces la recompensa de la misma partida', e1);
      ok(e1.count <= 60 && e1.cur && e1.pend && e1.newest && !e1.oldest, '[E] victoryReceipts acotado: quedan el actual, los sin revisar y los más nuevos', e1);
      await page.evaluate(() => document.getElementById('victory-next-btn').click());
      const emsg = await waitDialog(page, 3000);
      ok(emsg != null && emsg.indexOf('No se pudo guardar el progreso de esta partida.') === 0, '[E] victoria sin poder guardar: aviso claro', emsg);
      if (emsg != null) await accept(page);
      let extra = 0;
      for (let i = 0; i < 10; i++) {
        if (await page.evaluate(() => state) !== 'victory') break;
        await page.evaluate(() => document.getElementById('victory-next-btn').click()); await sleep(150);
        if (await dialogText(page) != null) { extra++; await accept(page); }
      }
      const e2 = await page.evaluate(() => ({ state, step: victoryStep }));
      ok(e2.state !== 'victory' && extra <= 4, '[E] los botones no quedan trabados para siempre: tras los primeros avisos (el botín reclamado aún no está en disco) "Continuar" sale de la victoria', { e2, extra });
      await ctx.close();
    }

    // ---------- F. red local (sandbox): sin guardado por diseño ----------
    {
      const { ctx, page } = await open(SAVE, 'F');
      await prepRun(page);
      const f1 = await page.evaluate(() => { LAN.sandbox = true; lobbyAllies = null; __AP.start('guerrero', 'ciudad', 1); SIM(3000); const st = WIN(); document.getElementById('again-btn').click(); return { st, after: state }; });
      const fd1 = await waitDialog(page, 1200);
      ok(f1.st === 'victory' && f1.after === 'playing' && fd1 == null, '[F] red local: "Volver a entrar" funciona sin esperar guardado ni avisar', { f1, fd1 });
      const f2 = await page.evaluate(() => { const st = WIN(); document.getElementById('menu-btn-2').click(); return { st }; });
      await sleep(600);
      const f2b = await page.evaluate(() => state), fd2 = await dialogText(page);
      ok(f2.st === 'victory' && f2b !== 'victory' && fd2 == null, '[F] red local: "Volver al menú" funciona', { f2, f2b, fd2 });
      const f3 = await page.evaluate(async () => {
        lobbyAllies = null; __AP.start('guerrero', 'ciudad', 1); SIM(3000); const st = WIN();
        for (let i = 0; i < 10 && state === 'victory'; i++) { document.getElementById('victory-next-btn').click(); await new Promise(r => setTimeout(r, 120)); }
        return { st, after: state, wrote: saveLastWriteOK };
      });
      ok(f3.st === 'victory' && f3.after !== 'victory' && await dialogText(page) == null, '[F] red local: "Continuar" recorre la victoria y sale', f3);
      await ctx.close();
    }
    // ---------- G. perfil recuperado + cuenta: un perfil de fábrica NUNCA pisa la nube ----------
    {
      const { ctx, page } = await open(BAD, 'G');
      const msg = await waitDialog(page, 8000); if (msg != null) await accept(page); await sleep(300);
      const g0 = await page.evaluate(() => ({ rec: saveRecoveredIs(), failed: saveLoadFailed }));
      ok(g0.rec === true && g0.failed === false, '[G] al aceptar el aviso, el perfil queda marcado como RECUPERADO (persistente) y el juego vuelve a guardar', g0);
      await page.evaluate(() => {
        window.__calls = []; window.__cloud = null;
        const mk = (gold, arenas) => { const c = defaultSave(); c.gold = gold; c.starterChosen = true; c.arenasCleared = arenas; return c; };
        window.__mk = mk; window.__cloud = mk(12345, { ciudad: true, fortaleza: true });
        accountFetch = async (method, path, body) => {
          window.__calls.push({ method, path, force: !!(body && body.force) });
          if (method === 'GET') return { status: 200, j: { version: 3, updatedAt: 1, data: window.__cloud } };
          if (method === 'PUT') return { status: 200, j: { version: 4, updatedAt: 2 } };
          return { status: 404, j: {} };
        };
        acct.session = { token: 't', user: 'tester' }; acct.sync = { user: _acctKey('tester'), version: 3, hash: 'otro', dirty: true };
        setState('mainmenu');
      });
      // 1) perfil de fábrica recuperado + sincronización pendiente: NO sube; baja la nube y gana la nube
      const g1 = await page.evaluate(async () => {
        const up = await accountUpload('prueba');
        for (let i = 0; i < 40 && (acct.pulling || window.__calls.length < 1); i++) await new Promise(r => setTimeout(r, 100));
        await new Promise(r => setTimeout(r, 300));
        return { up, puts: window.__calls.filter(c => c.method === 'PUT').length, gets: window.__calls.filter(c => c.method === 'GET').length, gold: save.gold, rec: saveRecoveredIs() };
      });
      ok(g1.up === false && g1.puts === 0 && g1.gets >= 1 && g1.gold >= 12345 && g1.gold < 20000 && g1.rec === false, '[G] perfil recuperado: no se sube; gana la nube (queda el progreso de la nube —el oro puede subir un poco por bonificaciones de carga— y se limpia la marca)', g1);
      // 2) recuperado pero con progreso NUEVO real: no se sube en silencio; se le pregunta al jugador
      const g2 = await page.evaluate(async () => {
        saveRecoveredSet(); window.__calls.length = 0; acct.conflict = null;
        const mine = window.__mk(777, { ciudad: true }); mine.gold = 777; localStorage.setItem(SAVE_KEY, JSON.stringify(mine)); loadSave();
        acct.sync = { user: _acctKey('tester'), version: 3, hash: 'otro', dirty: true };
        window.__cloud = window.__mk(99999, { ciudad: true, fortaleza: true, bosque: true });
        await _acctReconcile({ version: 3, updatedAt: 1, data: window.__cloud });
        return { puts: window.__calls.filter(c => c.method === 'PUT').length, conflict: !!acct.conflict, rec: saveRecoveredIs(), goldLocal: save.gold };
      });
      ok(g2.puts === 0 && g2.conflict && g2.rec === true && g2.goldLocal >= 777 && g2.goldLocal < 5000, '[G] recuperado con progreso nuevo: no sube en silencio; pregunta (conflicto) y no pierde lo local', g2);
      const g3 = await page.evaluate(async () => { await accountResolveConflict('cloud'); return { gold: save.gold, rec: saveRecoveredIs(), conflict: !!acct.conflict }; });
      ok(g3.gold >= 99999 && g3.gold < 120000 && g3.rec === false && !g3.conflict, '[G] al elegir la nube: se aplica y se limpia la marca', g3);
      // 3) control: SIN marca el comportamiento de siempre (cambios locales sobre la misma versión se suben)
      const g4 = await page.evaluate(async () => {
        window.__calls.length = 0; acct.conflict = null;
        const mine = window.__mk(555, { ciudad: true }); localStorage.setItem(SAVE_KEY, JSON.stringify(mine)); loadSave();
        acct.sync = { user: _acctKey('tester'), version: 3, hash: 'otro', dirty: true };
        await _acctReconcile({ version: 3, updatedAt: 1, data: window.__mk(1, { ciudad: true }) });
        return { puts: window.__calls.filter(c => c.method === 'PUT').length, rec: saveRecoveredIs() };
      });
      ok(g4.puts === 1 && g4.rec === false, '[G] control: sin perfil recuperado, los cambios locales siguen subiendo como siempre', g4);
      // 4) la marca sobrevive a recargar la página (persistente) mientras no se resuelva
      await page.evaluate(() => saveRecoveredSet());
      await page.reload({ waitUntil: 'load' }); await ready(page);
      const g5 = await page.evaluate(() => saveRecoveredIs());
      ok(g5 === true, '[G] la marca de perfil recuperado sobrevive a recargar la página', g5);
      await ctx.close();
    }
  } catch (e) { ok(false, 'la prueba terminó sin excepción', String(e && e.stack || e).slice(0, 600)); }
  finally { await browser.close(); await site.close(); }
  ok(errs.length === 0, 'sin errores de página', errs.slice(0, 5));
  console.log(fails ? `\n${fails} FALLA(S)` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
