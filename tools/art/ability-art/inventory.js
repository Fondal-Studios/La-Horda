'use strict';
/* Inventario del motor real: qué decales y rayos de vfx-b existen, con qué radio los usa cada receta (se ejecutan todas con radios de
   prueba y se espían kvbDecal / kvbSectorFx), y los temas de skill-fx-a con su paleta. Salida: docs/art-gate/ability-art/inventory.json
   Uso: BASE_URL=http://127.0.0.1:8750/ node inventory.js */
const fs = require('fs'), path = require('path');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8750/';
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  const page = await browser.newPage({viewport: {width: 844, height: 390}});
  await page.goto(BASE + '?ua=0', {waitUntil: 'domcontentloaded', timeout: 120000});
  await page.waitForFunction(() => typeof startRun === 'function' && typeof KVB !== 'undefined' && typeof sfaThemes !== 'undefined', null, {timeout: 120000});
  await page.waitForTimeout(2500);
  const inv = await page.evaluate(() => {
    netMatch = null; selectedClass = 'tanque'; currentArena = 'bosque'; lobbyAllies = []; startRun(3); state = 'playing'; enemies = [];
    const dec = {}, sect = new Set(), oD = kvbDecal, oS = kvbSectorFx;
    kvbDecal = function(name, x, y, R){ (dec[name] = dec[name] || []).push(Math.round(R)); return oD.apply(this, arguments); };
    kvbSectorFx = function(name){ sect.add(name); return oS.apply(this, arguments); };
    const px = player.x, py = player.y;
    for(const id of Object.keys(KVB_FX)) for(const [r, a, b] of [[140, 0.85, 40], [60, 0.5, 20], [220, 1.2, 80]]){ try{ kvbFx(id, px, py, r, 0.3, a, b); }catch(e){} for(let i = 0; i < 4; i++) kvbUpdate(16); }
    kvbDecal = oD; kvbSectorFx = oS;
    const themes = {}; for(const k of Object.keys(sfaThemes)) if(k.indexOf('~') < 0){ const T = sfaThemes[k]; themes[k] = {pal: T.pal, custom: typeof T.bake === 'function'}; }
    return {
      decals: Object.fromEntries(Object.entries(KVB_DEC).map(([k, v]) => [k, {N: v.N, R: dec[k] || [], sector: sect.has(k)}])),
      beams: Object.fromEntries(Object.entries(KVB_BEAM).map(([k, v]) => [k, {N: v.N, tileW: v.tileW, H: v.H}])),
      themes};
  });
  const out = path.join(__dirname, '..', '..', '..', 'docs', 'art-gate', 'ability-art', 'inventory.json');
  fs.mkdirSync(path.dirname(out), {recursive: true}); fs.writeFileSync(out, JSON.stringify(inv, null, 1));
  console.log('decales', Object.keys(inv.decals).length, 'rayos', Object.keys(inv.beams).length, 'temas', Object.keys(inv.themes).length);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
