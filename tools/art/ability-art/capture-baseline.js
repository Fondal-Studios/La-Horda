'use strict';
/* Captura el arte ACTUAL de los efectos (decales/rayos del motor real, js/champions/vfx-b/pixfx.js) como hojas PNG RGBA,
   para que el Evaluador mida la MEJORA del arte nuevo contra lo que hoy juega.
   Uso: BASE_URL=http://127.0.0.1:8750/ node capture-baseline.js <ficha.json> <carpeta-salida>
   Cada habilidad con "baseline": "<nombre de decal>" (o "baseline_beam") produce <id>.png (cuadros en fila, sin tinte de arena). */
const fs = require('fs'), path = require('path');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const [spec, out] = [JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), process.argv[3]];
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8750/';
const kvbS = R => Math.max(24, Math.min(128, Math.round(2 * R / 4.4 / 4) * 4));
(async () => {
  fs.mkdirSync(out, {recursive: true});
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  const page = await browser.newPage({viewport: {width: 844, height: 390}});
  await page.goto(BASE + (process.env.UA_OFF === '0' ? '' : '?ua=0'), {waitUntil: 'domcontentloaded', timeout: 120000});
  await page.waitForFunction(() => typeof KVB !== 'undefined' && typeof kvbDecalFrames === 'function', null, {timeout: 120000});
  await page.waitForTimeout(1500);
  const report = {};
  if (spec.engine === 'sfa') {   // motor skill-fx-a: sfaBake(tipo, tema, tamaño) → tira de cuadros
    await page.waitForFunction(() => typeof sfaBake === 'function', null, {timeout: 60000});
    for (const ab of spec.abilities) {
      const {art, theme, size} = ab.sfa;
      const data = await page.evaluate(([art, theme, size]) => { const b = sfaBake(art, theme, size); return b ? {w: b.w, h: b.h, n: b.n, png: b.cv.toDataURL('image/png')} : null; }, [art, theme, size]);
      if (!data) { report[ab.id] = 'sin arte base'; continue; }
      fs.writeFileSync(path.join(out, ab.id + '.png'), Buffer.from(data.png.split(',')[1], 'base64'));
      report[ab.id] = {name: ab.baseline, frames: data.n, w: data.w, h: data.h};
    }
    fs.writeFileSync(path.join(out, 'baseline.json'), JSON.stringify(report, null, 1));
    console.log(JSON.stringify(report)); await browser.close(); return;
  }
  for (const ab of spec.abilities) {
    const name = ab.baseline || ab.baseline_beam; if (!name) continue;
    const S = ab.size || kvbS(ab.radius || 100);
    const data = await page.evaluate(([name, S, beam]) => {
      const fr = beam ? kvbBeamFrames(name) : kvbDecalFrames(name, S); if(!fr) return null;
      const w = fr[0].width, h = fr[0].height, c = document.createElement('canvas'); c.width = w * fr.length; c.height = h;
      const g = c.getContext('2d'); fr.forEach((f, i) => g.drawImage(f, i * w, 0));
      return {w, h, n: fr.length, png: c.toDataURL('image/png')};
    }, [name, S, !!ab.baseline_beam]);
    if (!data) { report[ab.id] = 'sin arte base: ' + name; continue; }
    fs.writeFileSync(path.join(out, ab.id + '.png'), Buffer.from(data.png.split(',')[1], 'base64'));
    report[ab.id] = {name, frames: data.n, w: data.w, h: data.h};
  }
  fs.writeFileSync(path.join(out, 'baseline.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
