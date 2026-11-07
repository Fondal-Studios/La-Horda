'use strict';
/* Antes/después en el motor real del borde unificado de skill-fx-a: un nova por tema, congelado a mitad del impacto.
   Uso: BASE_URL=http://127.0.0.1:8750/ node capture-ingame-sfa.js <carpeta> [arena] */
const fs = require('fs'), path = require('path');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const [out, arena = 'bosque'] = [process.argv[2], process.argv[3]];
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8750/';
const THEMES = [['fire', 60], ['frost', 60], ['storm', 60], ['blood', 60], ['thread', 60], ['ink', 60]];   // r 60 → 120 u → tamaño 80
(async () => {
  fs.mkdirSync(out, {recursive: true});
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  for (const [tag, flag] of [['before', '?ua=0'], ['after', '']]) {
    const page = await browser.newPage({viewport: {width: 844, height: 390}, deviceScaleFactor: 2});
    await page.goto(BASE + flag, {waitUntil: 'domcontentloaded', timeout: 120000});
    await page.waitForFunction(() => typeof startRun === 'function' && typeof sfaBake === 'function', null, {timeout: 120000});
    await page.waitForTimeout(2500);
    await page.evaluate(([arena]) => { netMatch = null; selectedClass = 'tanque'; currentArena = arena; lobbyAllies = []; startRun(3); state = 'playing'; enemies = []; for (const a of allies) a.stunTimer = 1e9; }, [arena]);
    await page.waitForTimeout(600);
    for (const [theme, r] of THEMES) {
      await page.evaluate(([theme, r]) => { sfaReset(); const p = player; vfxSfaPlay('nova', theme, p.x, p.y, r, 0, 1e9); for (const s of sfaPool) s.t = 1e9 * 0.36; }, [theme, r]);
      await page.waitForTimeout(150);
      await page.screenshot({path: path.join(out, `sfa-${theme}-${tag}.png`), clip: {x: 422 - 150, y: 195 - 125, width: 300, height: 250}});
    }
    await page.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
