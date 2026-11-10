'use strict';
/* LOGROS DE STEAM (js/systems/quests.js: questsSteamUnlock, tools/steam/export-achievements.js, docs/steam/achievements.*).
 *  1. En la app de escritorio, cada logro NUEVO llama una vez a HORDA_DESKTOP.unlockAchievement con el id en minúsculas.
 *  2. Un logro ya desbloqueado no se manda dos veces; un id con mayúsculas (m_gradeA) sale en minúsculas.
 *  3. En el navegador (sin HORDA_DESKTOP) no pasa nada y no hay errores.
 *  4. Si la función de Steam falla, el juego sigue y el logro igual queda desbloqueado en el guardado.
 *  node tools/ux/test-steam-achievements.js
 */
const H = require('../lib/serve'), cp = require('child_process'), path = require('path');
let fails = 0;
const ok = (c, m, x) => { console.log((c ? 'PASS ' : 'FAIL ') + m + (c || x === undefined ? '' : '  ' + JSON.stringify(x).slice(0, 300))); if (!c) fails++; };
const SAVE = { tut: { training: 1 }, starterChosen: true, starterGiftV1: true, starterSkin: 'vale', playtestV1Bonus: true, campaignResetV1: true, campaignResetV2: true };
(async () => {
  const chk = cp.spawnSync('node', [path.join(__dirname, '../steam/export-achievements.js'), '--check'], { encoding: 'utf8' });
  ok(chk.status === 0, 'la lista de logros para Steamworks (docs/steam/achievements.*) está al día y es válida', chk.stdout + chk.stderr);
  const site = await H.startSite(), browser = await H.launch(), errs = [];
  try {
    for (const desktop of [true, false]) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
      await ctx.addInitScript(([s, d]) => {
        try { if (!sessionStorage.getItem('__a')) { localStorage.setItem('laHordaSave_v1', JSON.stringify(s)); sessionStorage.setItem('__a', '1'); } } catch (e) {}
        window.__steam = [];
        if (d) window.HORDA_DESKTOP = { desktop: true, quit() {}, unlockAchievement(id) { window.__steam.push(id); } };
      }, [SAVE, desktop]);
      const page = await ctx.newPage(); page.on('pageerror', e => errs.push(e.message));
      await page.goto(site.url + '/index.html?lazy=0', { waitUntil: 'load', timeout: 180000 });
      await page.waitForFunction(() => { const b = document.getElementById('title-continue-btn'); return typeof setState === 'function' && assetsAllReady() && b && !b.disabled; }, null, { timeout: 180000 });
      const tag = desktop ? '[app] ' : '[navegador] ';
      const r = await page.evaluate(() => {
        const q = questsState(); const out = {};
        window.__steam.length = 0;
        // fuerza dos logros: uno con id normal y el de mayúsculas
        const mk = id => ACHIEVEMENTS.find(a => a.id === id);
        const first = mk('c_first_win'), grade = mk('m_gradeA');
        out.hasGrade = !!grade;
        delete q.ach.c_first_win; delete q.ach.m_gradeA;
        const old = [first.prog, grade && grade.prog]; first.prog = () => 1; if (grade) grade.prog = () => 99;
        questsEvaluate(true);
        out.first = window.__steam.slice(); out.unlockedFirst = !!q.ach.c_first_win;
        questsEvaluate(true);   // segunda pasada: ya están desbloqueados, no se mandan otra vez
        out.second = window.__steam.slice();
        first.prog = old[0]; if (grade) grade.prog = old[1];
        return out;
      });
      if (desktop) {
        ok(r.first.includes('c_first_win') && (!r.hasGrade || r.first.includes('m_gradea')) && !r.first.some(x => /[A-Z]/.test(x)), tag + 'cada logro nuevo se manda a Steam, con el id en minúsculas', r);
        ok(r.second.length === r.first.length, tag + 'un logro ya desbloqueado no se vuelve a mandar', r);
        const f = await page.evaluate(() => {
          window.HORDA_DESKTOP.unlockAchievement = () => { throw new Error('steam caído'); };
          const q = questsState(); delete q.ach.c_first_win; const a = ACHIEVEMENTS.find(x => x.id === 'c_first_win'), o = a.prog; a.prog = () => 1;
          let threw = false; try { questsEvaluate(true); } catch (e) { threw = true; }
          a.prog = o; return { threw, saved: !!q.ach.c_first_win };
        });
        ok(!f.threw && f.saved, tag + 'si Steam falla el juego sigue y el logro queda en el guardado', f);
      } else {
        ok(r.unlockedFirst && r.first.length === 0 && r.second.length === 0, tag + 'sin la app de escritorio no se manda nada a Steam y el logro igual se desbloquea', r);
      }
      await ctx.close();
    }
    ok(errs.length === 0, 'sin errores de página', errs.slice(0, 3));
  } catch (e) { console.error(e); fails++; } finally { await browser.close(); await site.close(); }
  console.log(fails ? `\n${fails} FALLAS` : '\nTODO OK'); process.exit(fails ? 1 : 0);
})();
