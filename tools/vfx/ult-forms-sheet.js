'use strict';
/* Hoja de contacto de las formas de definitiva (js/champions/ult-forms): hornea cada forma y dibuja 8 cuadros de su vida (suelo + arriba)
   sobre un fondo de arena. También verifica el contrato de píxel (alfa 0/255 y como máximo 3 tonos de relleno por capa + contorno + acento).
   Uso: BASE_URL=http://127.0.0.1:9301/ [ONLY=a,b] [RPX=48] [SCALE=2] [OUT=ruta.png] node tools/vfx/ult-forms-sheet.js */
const fs = require('node:fs'), path = require('node:path');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..'), BASE = process.env.BASE_URL || 'http://127.0.0.1:9301/';
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  try {
    const page = await browser.newPage({viewport: {width: 844, height: 390}}), errs = [];
    page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
    await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 120000});
    await page.waitForFunction(() => typeof ufBake === 'function' && typeof startRun === 'function', null, {timeout: 120000});
    const out = await page.evaluate(({only, rpx, scale}) => {
      const keys = Object.keys(UF.champs).filter(k => !only || only.includes(k)), rows = [], report = [];
      for (const k of keys) {
        const t = ufBake(k, 't', rpx), g = ufBake(k, 'g', rpx); if (!t) continue;
        const N = t.frames.length, pick = [0, 3, 5, 7, 9, 12, 16, N - 3].map(i => Math.min(N - 1, Math.max(0, Math.round(i * N / 24))));
        // contrato de píxel: alfa 0/255 y número de colores distintos
        let alphaBad = 0; const cols = new Set();
        for (const fr of [...t.frames, ...(g ? g.frames : [])]) { const d = fr.getContext('2d').getImageData(0, 0, fr.width, fr.height).data; for (let i = 0; i < d.length; i += 4) { if (d[i + 3] !== 0 && d[i + 3] !== 255) alphaBad++; if (d[i + 3]) cols.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]); } }
        report.push({k, form: UF.champs[k].form, frames: N, w: t.W, h: t.H, alphaBad, colors: cols.size});
        rows.push({k, t, g, pick});
      }
      const cw = Math.max(...rows.map(r => r.t.W)), chh = Math.max(...rows.map(r => r.t.H)), cv = document.createElement('canvas');
      cv.width = cw * 8 * scale + 6; cv.height = rows.length * (chh * scale + 4) + 4; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
      c.fillStyle = '#6a5a3e'; c.fillRect(0, 0, cv.width, cv.height);
      rows.forEach((r, ri) => { r.pick.forEach((fi, ci) => { const x = ci * cw * scale + 2, y = ri * (chh * scale + 4) + 2 + (chh - r.t.H) * scale; c.fillStyle = ri & 1 ? '#665638' : '#6e5e42'; c.fillRect(x, ri * (chh * scale + 4) + 2, cw * scale, chh * scale);
        if (r.g) c.drawImage(r.g.frames[fi], x, y, r.t.W * scale, r.t.H * scale); c.drawImage(r.t.frames[fi], x, y, r.t.W * scale, r.t.H * scale); }); c.fillStyle = '#fff'; c.font = '10px monospace'; c.fillText(r.k, 4, ri * (chh * scale + 4) + 12); });
      return {png: cv.toDataURL('image/png'), report, stats: UF.stats};
    }, {only: process.env.ONLY ? process.env.ONLY.split(',') : null, rpx: +(process.env.RPX || 48), scale: +(process.env.SCALE || 2)});
    for (const r of out.report) console.log(r.k.padEnd(11), r.form.padEnd(9), r.frames + 'f', r.w + 'x' + r.h, 'alfa fuera de 0/255:', r.alphaBad, 'colores:', r.colors);
    console.log('horneado:', JSON.stringify(out.stats), 'errores de pagina:', errs.slice(0, 5));
    const file = process.env.OUT || '/tmp/ult-forms-sheet.png'; fs.writeFileSync(file, Buffer.from(out.png.split(',')[1], 'base64')); console.log('escrito', file);
    if (out.report.some(r => r.alphaBad)) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
