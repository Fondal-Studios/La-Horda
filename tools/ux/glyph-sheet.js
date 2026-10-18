'use strict';
// Hoja de contacto de los glifos pixel de habilidad: una fila por campeón (3 habilidades + definitiva), a escala x6.
// Uso: node tools/ux/glyph-sheet.js  ->  docs/ux/iconos/roster-glifos.png   (no necesita servir el juego: carga solo el módulo)
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require('/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..'), OUT = path.join(ROOT, 'docs/ux/iconos');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/ui/skill-pixel-glyphs.js'), 'utf8') + ';this.X={SKILL_PIXEL_MAP,skillPixelGlyphUriFromKey};', ctx);
const {SKILL_PIXEL_MAP, skillPixelGlyphUriFromKey} = ctx.X;
const COL = ['#8fe0ff', '#cfc2ff', '#97f0cc', '#ffe9a8'];
const champs = [...new Set(Object.keys(SKILL_PIXEL_MAP).map(k => k.split(':')[0]))];
const cell = (ch, i) => { const key = SKILL_PIXEL_MAP[ch + ':' + (i === 3 ? 'u' : i)]; return key ? `<img title="${key}" src="${skillPixelGlyphUriFromKey(key, COL[i])}">` : '<span class="png">PNG</span>'; };
const html = `<body style="margin:0;background:#141a28;color:#c9d3e6;font:12px monospace"><style>.g{display:grid;grid-template-columns:repeat(3,1fr);gap:4px 18px;padding:12px}.r{display:flex;align-items:center;gap:6px}.r b{width:84px;font-weight:normal}img{width:64px;height:64px;image-rendering:pixelated;background:#0c111c;border:1px solid #2a3550;padding:3px}.png{display:inline-block;width:64px;text-align:center;color:#778}</style><div class="g">${champs.map(ch => `<div class="r"><b>${ch}</b>${[0, 1, 2, 3].map(i => cell(ch, i)).join('')}</div>`).join('')}</div>`;
(async () => {
  fs.mkdirSync(OUT, {recursive: true});
  const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  const p = await b.newPage({viewport: {width: 1250, height: 800}});
  await p.setContent(html);
  await p.screenshot({path: path.join(OUT, 'roster-glifos.png'), fullPage: true});
  await b.close();
  console.log('docs/ux/iconos/roster-glifos.png (' + champs.length + ' campeones con glifo en el mapa)');
})();
