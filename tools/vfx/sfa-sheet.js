'use strict';
/* Hoja de contacto de los sprites de efecto de habilidad (mitad A): hornea cada arte de cada tema y los dibuja en una
   tabla PNG (docs/vfx/sfa-sheet.png). También valida que los motivos tengan filas del mismo largo.
   Uso: PORT=8952 node tools/vfx/sfa-sheet.js [ARTS=nova,zone,cone,beam,burst,aura] [THEMES=a,b] [SCALE=3] */
const fs = require('node:fs'), path = require('node:path'), {spawn} = require('node:child_process');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..'), PORT = +(process.env.PORT || 8953);
const server = process.env.BASE_URL ? null : spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {cwd: ROOT, stdio: 'ignore'});
const BASE = process.env.BASE_URL || `http://127.0.0.1:${PORT}/`;
process.on('exit', () => server && server.kill());
(async () => {
  await new Promise(r => setTimeout(r, server ? 700 : 0));
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  try {
    const page = await browser.newPage({viewport: {width: 844, height: 390}}), errs = [];
    page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 120000});
    await page.waitForFunction(() => typeof sfaBake === 'function' && typeof startRun === 'function', null, {timeout: 120000});
    const out = await page.evaluate(({arts, themes, scale}) => {
      const bad = []; for (const k in SFA_MOTIF_SRC) { const w = SFA_MOTIF_SRC[k][0].length; SFA_MOTIF_SRC[k].forEach((r, i) => { if (r.length !== w) bad.push(k + ' fila ' + i + ' mide ' + r.length + ' (esperaba ' + w + ')'); }); }
      themes = themes || Object.keys(sfaThemes);
      const rows = []; let maxW = 0, totalH = 0;
      for (const th of themes) {
        const parts = [];
        for (const art of arts) {
          let b;
          if (art === 'nova') b = sfaBake('nova', th, 64); else if (art === 'zone') b = sfaBake('zone', th, 64); else if (art === 'cone') b = sfaBake('cone', th, 64, .85);
          else if (art === 'beam') b = sfaBake('beam', th, 16); else if (art === 'burst') b = sfaBake('burst', th, 48); else if (art === 'aura') b = sfaBake('aura', th, 0);
          if (b) parts.push(b);
        }
        const h = Math.max(...parts.map(p => p.h)), w = parts.reduce((s, p) => s + p.cv.width + 6, 0);
        rows.push({th, parts, h, w}); maxW = Math.max(maxW, w); totalH += h + 14;
      }
      const cv = document.createElement('canvas'); cv.width = maxW * scale; cv.height = totalH * scale; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
      g.fillStyle = '#3a4a38'; g.fillRect(0, 0, cv.width, cv.height);
      let y = 0;
      for (const r of rows) { let x = 0; g.fillStyle = '#fff'; g.font = '10px monospace'; g.fillText(r.th, 2, y * 1 + 9);
        for (const p of r.parts) { g.drawImage(p.cv, x * scale, (y + 12) * scale, p.cv.width * scale, p.cv.height * scale); x += p.cv.width + 6; }
        y += r.h + 14; }
      return {bad, png: cv.toDataURL('image/png'), stats: sfaStats};
    }, {arts: (process.env.ARTS || 'nova,zone,cone,beam,burst,aura').split(','), themes: process.env.THEMES ? process.env.THEMES.split(',') : null, scale: +(process.env.SCALE || 1)});
    console.log('motivos con filas desparejas:', out.bad.length, out.bad.slice(0, 10), 'horneado:', JSON.stringify(out.stats), 'errores de pagina:', errs.slice(0, 5));
    const file = process.env.OUT || path.join(ROOT, 'docs/vfx/sfa-sheet.png');
    fs.writeFileSync(file, Buffer.from(out.png.split(',')[1], 'base64')); console.log('escrito', file);
  } finally { await browser.close(); if (server) server.kill(); }
})().catch(e => { console.error(e); process.exitCode = 1; if (server) server.kill(); });
