'use strict';
// Hoja de contacto de los íconos de habilidad bajo el contrato (js/ui/pixel-icons.js): una fila por campeón
// (3 habilidades + definitiva), a escala x4 y a 2x real (el tamaño que se ve en el HUD). No necesita servir el juego:
// carga solo los tres módulos de íconos en una página en blanco.
// Uso: node tools/ux/glyph-sheet.js [salida.png]   (por omisión docs/ux/iconos-contrato/roster-despues.png)
const fs = require('node:fs'), path = require('node:path');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require('/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..');
const args = process.argv.slice(2), MODE = (args.find(a => a.startsWith('--slot=')) || '').slice(7), MOTIFS = args.includes('--motifs'); // --slot=ult|0|1|2: una sola ranura, ampliada x8 y con la clave
const OUT = path.resolve(args.find(a => !a.startsWith('--')) || path.join(ROOT, 'docs/ux/iconos-contrato/roster-despues.png'));
const SRC = ['js/ui/pixel-icons.js', 'js/ui/skill-glyphs.js', 'js/ui/skill-pixel-glyphs.js', 'js/ui/skill-icon-motifs.js'].map(f => fs.readFileSync(path.join(ROOT, f), 'utf8'));
(async () => {
  fs.mkdirSync(path.dirname(OUT), {recursive: true});
  const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  const p = await b.newPage({viewport: {width: 1500, height: 800}});
  await p.setContent('<body></body>');
  for (const s of SRC) await p.addScriptTag({content: s});
  const n = await p.evaluate(([MODE, MOTIFS]) => {
    const champs = [...new Set(Object.keys(SKILL_PIXEL_MAP).map(k => k.split(':')[0]))];
    const cell = (ch, i) => { const key = SKILL_PIXEL_MAP[ch + ':' + (i === 3 ? 'u' : i)]; return key ? `<span><img class="b" title="${key}" src="${skillPixelGlyphUriFromKey(key, i)}"><img class="s" src="${skillPixelGlyphUriFromKey(key, i)}"></span>` : '<span class="x">?</span>'; };
    document.body.style.cssText = 'margin:0;background:#141a28;color:#c9d3e6;font:12px monospace';
    document.body.innerHTML = '<style>.g{display:grid;grid-template-columns:repeat(3,1fr);gap:6px 14px;padding:10px}.r{display:flex;align-items:center;gap:5px;background:#0e1420;padding:3px}.r b{width:62px;font-weight:normal;font-size:11px}span{display:flex;align-items:center;gap:2px}img{image-rendering:pixelated}img.b{width:64px;height:64px}img.s{width:32px;height:32px;background:#1b1209}.x{width:96px;color:#778}</style><div class="g">' +
      champs.map(ch => `<div class="r"><b>${ch}</b>${[0, 1, 2, 3].map(i => cell(ch, i)).join('')}</div>`).join('') + '</div>';
    if (MODE) {
      const i = MODE === 'ult' ? 3 : +MODE;
      document.body.innerHTML = '<style>.g{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;padding:10px}.c{background:#0e1420;padding:4px;text-align:center;font-size:10px}img{width:128px;height:128px;image-rendering:pixelated;display:block;margin:auto}</style><div class="g">' + champs.map(ch => { const key = SKILL_PIXEL_MAP[ch + ':' + (i === 3 ? 'u' : i)]; return `<div class="c"><img src="${skillPixelGlyphUriFromKey(key, i)}">${ch}<br>${key}</div>`; }).join('') + '</div>';
    }
    if (MOTIFS) { // --motifs: todos los motivos nuevos (PIX_MOTIFS_V2) con su nombre, como habilidad (azul) y como definitiva (oro)
      const names = Object.keys(PIX_MOTIFS_V2);
      document.body.innerHTML = '<style>.g{display:grid;grid-template-columns:repeat(8,1fr);gap:6px;padding:8px}.c{background:#0e1420;padding:3px;text-align:center;font-size:10px}img{width:96px;height:96px;image-rendering:pixelated}</style><div class="g">' + names.map(nm => `<div class="c"><img src="${skillPixelGlyphUriFromKey(nm, 0)}"><img src="${skillPixelGlyphUriFromKey(nm, 3)}"><br>${nm}</div>`).join('') + '</div>';
      return names.length;
    }
    return champs.length;
  }, [MODE, MOTIFS]);
  await p.waitForTimeout(300);
  await p.screenshot({path: OUT, fullPage: true});
  await b.close();
  console.log(path.relative(ROOT, OUT) + ' (' + n + ' campeones con ícono en el mapa)');
})();
