'use strict';
/* OPCIONES EN PC (index.html #hub-options, js/core/fullscreen.js, css/pc-desktop.css).
 *  1. Existe la sección "Pantalla" con el botón de pantalla completa; el botón alterna (FULLSCREEN.toggle) .
 *  2. "Salir del juego" solo aparece en la app de escritorio (window.HORDA_DESKTOP.quit) y pide confirmación antes de salir.
 *  3. Con teclado o mando se esconden las filas táctiles (zurdo, tamaño y opacidad de los controles); con toques reaparecen.
 *  4. Mando de PlayStation: el tutorial dice L2 / Options (no LT / Start); con Xbox dice LT / Start.
 *  node tools/ux/test-pc-options.js
 */
const H = require('../lib/serve');
let fails = 0;
const ok = (c, m, x) => { console.log((c ? 'PASS ' : 'FAIL ') + m + (c || x === undefined ? '' : '  ' + JSON.stringify(x).slice(0, 300))); if (!c) fails++; };
const SAVE = { tut: { training: 1 }, starterChosen: true, starterGiftV1: true, starterSkin: 'vale', playtestV1Bonus: true, campaignResetV1: true, campaignResetV2: true };
(async () => {
  const site = await H.startSite(), browser = await H.launch(), errs = [];
  try {
    for (const desktop of [false, true]) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
      await ctx.addInitScript(([s, d]) => {
        try { if (!sessionStorage.getItem('__o')) { localStorage.setItem('laHordaSave_v1', JSON.stringify(s)); sessionStorage.setItem('__o', '1'); } } catch (e) {}
        if (d) { window.__quits = 0; window.HORDA_DESKTOP = { desktop: true, quit() { window.__quits++; }, setFullscreen() {} }; }
      }, [SAVE, desktop]);
      const page = await ctx.newPage(); page.on('pageerror', e => errs.push(e.message));
      await page.goto(site.url + '/index.html?lazy=0', { waitUntil: 'load', timeout: 180000 });
      await page.waitForFunction(() => { const b = document.getElementById('title-continue-btn'); return typeof setState === 'function' && assetsAllReady() && b && !b.disabled; }, null, { timeout: 180000 });
      const tag = desktop ? '[app de escritorio] ' : '[navegador] ';
      const r = await page.evaluate(() => {
        const vis = id => { const e = document.getElementById(id); return !!e && !e.hidden && getComputedStyle(e).display !== 'none'; };
        const t0 = FULLSCREEN.toggles; document.getElementById('opt-fs-btn').click();
        const out = { sec: !!document.getElementById('opt-sec-screen'), fsBtn: !!document.getElementById('opt-fs-btn'), toggled: FULLSCREEN.toggles - t0, quitVisible: vis('opt-quit-row') };
        // teclado: filas táctiles ocultas
        document.body.classList.remove('inp-pad'); document.body.classList.add('inp-kb');
        const touch = [...document.querySelectorAll('.opt-touch-only')];
        out.touchRows = touch.length; out.hiddenWithKb = touch.every(e => getComputedStyle(e).display === 'none');
        document.body.classList.remove('inp-kb'); document.body.classList.add('inp-pad'); out.hiddenWithPad = touch.every(e => getComputedStyle(e).display === 'none');
        document.body.classList.remove('inp-pad'); out.shownWithTouch = touch.every(e => getComputedStyle(e).display !== 'none' || e.closest('[hidden]'));
        return out;
      });
      ok(r.sec && r.fsBtn && r.toggled === 1, tag + 'Opciones tiene Pantalla completa y el botón alterna', r);
      ok(r.touchRows >= 4 && r.hiddenWithKb && r.hiddenWithPad, tag + 'con teclado o mando se esconden las filas táctiles', r);
      const modes = await page.evaluate(() => { const v = id => { const e = document.getElementById(id); return !!e && getComputedStyle(e).display !== 'none'; }; setState('mainmenu'); renderMainMenu(); return { crystal: v('hub-crystal-btn'), coliseum: v('hub-coliseum-btn'), endless: v('hub-endless-btn'), play: v('hub-play-btn'), title: v('hub-postgame-title') }; });
      ok(modes.play && modes.endless, tag + 'Campaña y Horda Infinita siempre visibles', modes);
      ok(desktop ? (!modes.crystal && !modes.coliseum && !modes.title) : (modes.crystal && modes.coliseum), tag + (desktop ? 'la app de Steam no ofrece Cristales ni Coliseo (ni el título "Otros modos")' : 'el navegador sigue ofreciendo Cristales y Coliseo'), modes);
      ok(r.quitVisible === desktop, tag + (desktop ? '"Salir del juego" se ve en la app de escritorio' : '"Salir del juego" NO se ve en el navegador'), r);
      if (desktop) {
        const q = await page.evaluate(async () => {
          gameConfirm = async () => false; document.getElementById('opt-quit-btn').click(); await new Promise(r => setTimeout(r, 100)); const a = window.__quits;
          gameConfirm = async () => true; document.getElementById('opt-quit-btn').click(); await new Promise(r => setTimeout(r, 100)); return { cancel: a, accept: window.__quits };
        });
        ok(q.cancel === 0 && q.accept === 1, tag + 'salir pide confirmación: cancelar no sale, aceptar sí', q);
      }
      if (!desktop) {
        const g = await page.evaluate(() => {
          const mk = id => ({ id, connected: true, buttons: [], axes: [0, 0, 0, 0], mapping: 'standard' });
          const res = {};
          for (const [k, id] of [['ps', 'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)'], ['xbox', 'Xbox 360 Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)']]) {
            DESK.gp.id = id; res[k] = { revive: padGlyph('LT'), pause: padGlyph('START') };
          }
          return res;
        });
        ok(g.ps.revive === 'L2' && g.ps.pause === 'Options' && g.xbox.revive === 'LT' && g.xbox.pause === 'Start', tag + 'padGlyph: PlayStation L2/Options, Xbox LT/Start', g);
        const t = await page.evaluate(() => {
          const out = {}; for (const [k, id] of [['ps', 'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)'], ['xbox', 'Xbox 360 Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)']]) {
            DESK.gp.id = id; DESK.device = 'pad';
            try { out[k] = [typeof alphaTrainingDeskText === 'function' ? alphaTrainingDeskText('revive', 'pad') : null, typeof alphaTrainingDeskText === 'function' ? alphaTrainingDeskText('tactical', 'pad') : null]; } catch (e) { out[k] = String(e); }
          } return out;
        });
        ok(Array.isArray(t.ps) && /L2/.test(t.ps[0] || '') && /Options/.test(t.ps[1] || '') && !/LT|Start/.test((t.ps[0] || '') + (t.ps[1] || '')), tag + 'tutorial con mando de PlayStation dice L2 y Options', t);
        ok(Array.isArray(t.xbox) && /LT/.test(t.xbox[0] || '') && /Start/.test(t.xbox[1] || ''), tag + 'tutorial con mando Xbox dice LT y Start', t);
      }
      await ctx.close();
    }
    ok(errs.length === 0, 'sin errores de página', errs.slice(0, 3));
  } catch (e) { console.error(e); fails++; } finally { await browser.close(); await site.close(); }
  console.log(fails ? `\n${fails} FALLAS` : '\nTODO OK'); process.exit(fails ? 1 : 0);
})();
