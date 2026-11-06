'use strict';
/* Captura en el motor real las 4 habilidades de un guardián, con el arte anterior (?ua=0) y el unificado, sobre una arena.
   Uso: BASE_URL=http://127.0.0.1:8750/ node capture-ingame.js <guardian> <carpeta> [arena] */
const fs = require('fs'), path = require('path');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const [guardian, out, arena = 'bosque'] = [process.argv[2], process.argv[3], process.argv[4]];
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8750/';
// [id de receta, radio, a, b]  (a = semiángulo o largo, según la receta)
const FX = {
  vesper: [['vesper.needles', 235, .85], ['vesper.unpick', 150, 0], ['vesper.seam', 24, 0], ['vesper.last_stitch', 155, 0]],
  zahra: [['zahra.furnace', 190, .85], ['zahra.quench', 140, 0], ['zahra.ash_step', 28, 120], ['zahra.vent', 155, 0]],
  orsa: [['orsa.pierce', 22, 300], ['orsa.discharge', 175, 0], ['orsa.brace', 42, 0], ['orsa.storm', 210, 0]],
  sira: [['sira.ink_line', 24, 260], ['sira.erase', 80, 0], ['sira.atlas', 48, 0]],
  tibor: [['tibor.swarm', 110, 0], ['tibor.pollen', 90, 0], ['tibor.recall', 30, 0]],
};
(async () => {
  fs.mkdirSync(out, {recursive: true});
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  for (const [tag, flag] of [['before', '?ua=0'], ['after', '']]) {
    const page = await browser.newPage({viewport: {width: 844, height: 390}, deviceScaleFactor: 2});
    await page.goto(BASE + flag, {waitUntil: 'domcontentloaded', timeout: 120000});
    await page.waitForFunction(() => typeof startRun === 'function' && typeof KVB !== 'undefined', null, {timeout: 120000});
    await page.waitForTimeout(2500);
    await page.evaluate(([arena]) => { netMatch = null; selectedClass = 'tanque'; currentArena = arena; lobbyAllies = []; startRun(3); state = 'playing'; enemies = []; for (const a of allies) a.stunTimer = 1e9; }, [arena]);
    await page.waitForTimeout(600);
    // un efecto por captura, a mitad del impacto
    for (const [id, r, half] of FX[guardian]) {
      await page.evaluate(([id, r, half]) => { kvbReset(); const p = player; window.__ku = window.__ku || kvbUpdate; window.kvbUpdate = function(){}; kvbFx(id, p.x, p.y, r, 0, half || 40, 120); for (const e of KVB.pool) e.t = e.dur * 0.36; }, [id, r, half]);
      await page.waitForTimeout(120);
      await page.screenshot({path: path.join(out, `${guardian}-${id.split('.')[1]}-${tag}.png`)});
    }
    await page.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
