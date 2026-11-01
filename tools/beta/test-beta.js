'use strict';
// BETA VISUAL IMPACT — pruebas funcionales y de no-regresión de la capa (Chromium real).
//   node tools/beta/test-beta.js
const { chromium, ROOT, serve, sleep, check, failCount, ready } = require('./lib');
async function boot(base, qs, opts) {
  opts = opts || {};
  const browser = opts.browser || await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 844, height: 390 } }, opts.ctx || {}));
  await ctx.addInitScript(() => { window.__campaignMode = true; if (!sessionStorage.getItem('__bt')) { try { localStorage.clear(); } catch (e) {} sessionStorage.setItem('__bt', '1'); } window.__vib = []; try { navigator.vibrate = p => { window.__vib.push(p); return true; }; } catch (e) {} });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(base + '/index.html' + (qs || ''), { waitUntil: 'load', timeout: 180000 });
  await ready(page);
  return { browser, ctx, page, errors };
}
(async () => {
  const srv = await serve(ROOT);
  try {
    // ---------- 1) ?beta=0 = main ----------
    { const t = await boot(srv.base, '?beta=0');
      const r = await t.page.evaluate(() => ({ cls: document.body.classList.contains('beta-visual'), bp: !!document.getElementById('bt-play'), on: BETA.on, wrapped: !!(window.impactFeedback && window.impactFeedback.__beta) }));
      check('beta=0: sin clase, sin botón rápido y sin enganches', !r.cls && !r.bp && !r.on && !r.wrapped, r);
      check('beta=0: sin errores', !t.errors.length, t.errors); await t.browser.close(); }

    // ---------- 2) perfil vacío: un toque y estás jugando ----------
    let st;
    { const t = await boot(srv.base, ''); st = t;
      const info = await t.page.evaluate(() => ({ cls: document.body.classList.contains('beta-visual'), btn: !!document.getElementById('bt-play'), enabled: !document.getElementById('bt-play').disabled, label: document.querySelector('.bt-play-main').textContent }));
      check('beta=1: botón JUGAR AHORA visible y habilitado', info.cls && info.btn && info.enabled && /JUGAR AHORA/.test(info.label), info);
      const t0 = Date.now(); await t.page.click('#bt-play');
      await t.page.waitForFunction(() => state === 'playing', null, { timeout: 15000 });
      const ms = Date.now() - t0;
      const g = await t.page.evaluate(() => ({ arena: currentArena, cls: selectedClass, demo: !!BETA.demo, lvl: runLevel, intro: BETA.stats.intro }));
      check('perfil vacío: 1 toque → partida en Ruinas con Sylva', g.arena === 'bosque' && g.cls === 'cazadora' && g.lvl === 1 && g.demo, g);
      check('arranque < 3 s tras el toque', ms < 3000, ms);
      check('la aparición (intro) se dispara', g.intro === 1, g);

      // ---------- 3) feedback táctil de habilidades ----------
      await sleep(600);
      await t.page.evaluate(() => { player.energy = player.maxEnergy; player.cds = [0, 0, 0]; PREFS.vibrate = true; });
      const b1 = await (await t.page.$('#btn-s1')).boundingBox();
      await t.page.mouse.move(b1.x + b1.width / 2, b1.y + b1.height / 2); await t.page.mouse.down();
      await sleep(40);
      const during = await t.page.evaluate(() => { const e = document.getElementById('btn-s1'); return { press: e.classList.contains('bt-press'), cast: e.classList.contains('bt-cast'), ripple: !!e.querySelector('.bt-ripple'), n: BETA.stats.press, vib: window.__vib.length }; });
      await t.page.mouse.up();
      check('pulsar una habilidad: squash + anillo + onda + vibración', during.press && during.cast && during.ripple && during.n >= 1 && during.vib >= 1, during);
      await sleep(500);
      const cleaned = await t.page.evaluate(() => { const e = document.getElementById('btn-s1'); return !e.classList.contains('bt-press') && !e.classList.contains('bt-cast') && !e.querySelector('.bt-ripple'); });
      check('las clases de feedback se limpian solas', cleaned);
      // sin energía / en recarga: "no" inequívoco
      await t.page.evaluate(() => { player.energy = 0; });
      await sleep(300);
      await t.page.mouse.move(b1.x + b1.width / 2, b1.y + b1.height / 2); await t.page.mouse.down(); await sleep(40);
      const deny = await t.page.evaluate(() => document.getElementById('btn-s1').classList.contains('bt-deny'));
      await t.page.mouse.up();
      check('sin energía: respuesta de rechazo (sacudida)', deny);
      // "Reducir movimiento": no vibra
      await t.page.evaluate(() => { JUICE.reduceMotion = true; window.__vib.length = 0; betaHaptic(30); });
      check('Reducir movimiento: sin vibración', await t.page.evaluate(() => window.__vib.length === 0));
      await t.page.evaluate(() => { JUICE.reduceMotion = false; });

      // ---------- 4) peligros, botín, definitiva, caída ----------
      const hz0 = await t.page.evaluate(() => BETA.stats.hazard);
      await t.page.evaluate(() => bossStrike(player.x + 70, player.y, 50, 1800, 0, 'root', { stun: 0 }));
      await sleep(400);
      check('peligro (raíz): se dibuja el aviso reforzado', await t.page.evaluate(h => BETA.stats.hazard > h, hz0));

      const loot = await t.page.evaluate(() => { const real = window.groundLootRollTier; const out = {}; let want = 'comun'; window.groundLootRollTier = () => want;
        for (const tt of ['comun', 'raro', 'muyraro', 'legendario', 'mitico', 'set', 'unico']) { want = tt; const g = groundLootDrop(player.x + 300, player.y + 120, 'S', 1, 'bosque', 'jefe', false, null, null); out[tt] = g ? g.tier : null; }
        window.groundLootRollTier = real; return { out, loot: BETA.stats.loot, banner: !!document.getElementById('bt-banner') }; });
      check('botín: las 7 rarezas caen y la capa reacciona a cada una', Object.values(loot.out).filter(Boolean).length === 7 && loot.loot >= 7, loot);
      check('botín: cartel para legendario o superior', loot.banner);
      await sleep(3300);
      check('botín: el cartel se retira solo', await t.page.evaluate(() => !document.getElementById('bt-banner')));
      await t.page.evaluate(() => { groundLoot.length = 0; });

      const u0 = await t.page.evaluate(() => BETA.stats.ult);
      await t.page.evaluate(() => { runLevel = Math.max(runLevel, ULT_MIN_ARENA_LEVEL); player.ultCharge = player.ultMax; player.ultCd = 0; player.energy = player.maxEnergy; });
      const bu = await (await t.page.$('#btn-ult')).boundingBox();
      await t.page.mouse.move(bu.x + bu.width / 2, bu.y + bu.height / 2); await t.page.mouse.down(); await sleep(60); await t.page.mouse.up();
      await sleep(200);
      check('definitiva: fase de pantalla activa', await t.page.evaluate(u => BETA.stats.ult > u && BETA.ult.t > 0, u0));
      await sleep(1200);
      check('definitiva: la fase termina', await t.page.evaluate(() => BETA.ult.t === 0));

      await t.page.evaluate(() => { damageHero(player, player.maxHp * 9, { x: player.x + 30, y: player.y }); });
      await sleep(300);
      check('caída del jugador: se dispara el momento', await t.page.evaluate(() => BETA.stats.playerDeath === 1 && BETA.dead.t > 0));
      check('sin errores durante todo el recorrido', !t.errors.length, t.errors);
      await t.browser.close(); }

    // ---------- 5) el camino clásico sigue vivo ----------
    { const t = await boot(srv.base, '');
      await t.page.click('#title-continue-btn'); await sleep(900);
      const s = await t.page.evaluate(() => state);
      check('"Tocá para continuar" sigue llevando al flujo normal (no arranca partida)', s !== 'playing' && s !== 'title', s);
      check('clásico: sin errores', !t.errors.length, t.errors); await t.browser.close(); }

    // ---------- 6) táctil (iPhone horizontal) ----------
    { const t = await boot(srv.base, '', { ctx: { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } });
      const bb = await (await t.page.$('#bt-play')).boundingBox();
      check('táctil: objetivo del botón ≥ 44 px', bb.height >= 44 && bb.width >= 44, bb);
      const inside = bb.x >= 0 && bb.y >= 0 && bb.x + bb.width <= 844 && bb.y + bb.height <= 390;
      check('táctil: botón dentro de la pantalla', inside, bb);
      await t.page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2);
      await t.page.waitForFunction(() => state === 'playing', null, { timeout: 15000 });
      check('táctil: un toque arranca la partida', true);
      check('táctil: sin errores', !t.errors.length, t.errors); await t.browser.close(); }
  } finally { srv.stop(); }
  console.log(failCount() ? 'RESULT FAIL (' + failCount() + ')' : 'RESULT OK'); process.exit(failCount() ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
