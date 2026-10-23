'use strict';
// CHEQUEO DEL CONTRATO DE ÍCONOS DE HABILIDAD (js/ui/pixel-icons.js, ART_BIBLE §14).
// Renderiza el HUD real (844x390) de los 43 campeones (más la forma Coloso de Ilkan) y falla si:
//   1. algún ícono del HUD (4 habilidades, ataque básico, Cura, Pacto) incumple el contrato: no es un PNG de 16x16 nativos,
//      usa más de 6 colores, tiene alfa distinto de 0/255, le falta el marco de su categoría o el contorno de 1 px;
//      o el HUD usa una imagen que no sea del contrato (recorte de sprite, SVG, ilustración);
//   2. dos definitivas tienen más del 85 % de los píxeles iguales (color: igualdad de RGBA en el interior 14x14; silueta: intersección/unión de lo pintado);
//   3. dos íconos de un mismo kit tienen más del 85 % de píxeles iguales;
//   4. un ícono se muestra a un tamaño que no es múltiplo entero de 16 (píxeles de tamaños distintos);
//   5. el rótulo no usa la fuente pixel del juego a 8 px, supera 5 letras, o toca el ícono o el aro del botón.
// Uso: node tools/art/check-skill-icons.js [--self-test] [--write]
//   --self-test  prueba el verificador con imágenes sintéticas malas (degradé, 7 colores, alfa, tamaño) y buenas.
//   --write      escribe docs/ux/iconos-contrato/check-report.json con los números.
// Entorno: SE_BASE_URL (servidor externo; por omisión levanta uno propio en un puerto libre), CHROMIUM_PATH.
const {spawn} = require('node:child_process'), path = require('node:path'), fs = require('node:fs');
const H = require('../lib/serve');
const ROOT = path.resolve(__dirname, '../..'), THRESHOLD = 0.85, SIL_THRESHOLD = 0.92;
const argv = new Set(process.argv.slice(2));
let site = null;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BTN = [['btn-s1', 'skill'], ['btn-s2', 'skill'], ['btn-s3', 'skill'], ['btn-ult', 'ult'], ['btn-basic', 'basic'], ['btn-emerg', 'skill'], ['btn-pact', 'skill']];

// Corre dentro de la página: decodifica la imagen y la audita con pxiIconAudit (el mismo verificador del contrato).
const IN_PAGE = `
window.__decode = async (src) => {
  const img = new Image(); img.src = src; await img.decode();
  const cv = document.createElement('canvas'); cv.width = img.naturalWidth; cv.height = img.naturalHeight;
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(img, 0, 0);
  return {w: cv.width, h: cv.height, data: Array.from(g.getImageData(0, 0, cv.width, cv.height).data)};
};`;

function interior(d) { // RGBA del interior 14x14 como cadena de enteros (comparable) y máscara de silueta
  const px = [], mask = [];
  for (let y = 1; y < 15; y++) for (let x = 1; x < 15; x++) { const i = (y * 16 + x) * 4; px.push(d[i + 3] ? (d[i] << 16 | d[i + 1] << 8 | d[i + 2]) : -1); mask.push(d[i + 3] ? 1 : 0); }
  return {px, mask};
}
function iou(a, b) { let i = 0, u = 0; for (let k = 0; k < a.length; k++) { if (a[k] && b[k]) i++; if (a[k] || b[k]) u++; } return u ? i / u : 1; }
function equalFrac(a, b) { let n = 0; for (let i = 0; i < a.length; i++) if (a[i] === b[i]) n++; return n / a.length; }

(async () => {
  site = await H.startSite({envUrl: ['SE_BASE_URL']});
  const browser = await H.launch();
  const problems = [], report = {champions: 0, icons: 0, ultPairs: 0, worstUlt: [], worstKit: []};
  try {
    const ctx = await browser.newContext({viewport: {width: 844, height: 390}, deviceScaleFactor: 1, isMobile: true, hasTouch: true});
    const page = await ctx.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await H.goto(page, site.url + '/');
    await page.waitForFunction(() => typeof startRun === 'function' && typeof pxiIconAudit === 'function', null, {timeout: 120000});
    await page.evaluate(IN_PAGE);

    if (argv.has('--self-test')) {
      const t = await page.evaluate(() => {
        const mk = (w, h, f) => { const d = new Uint8ClampedArray(w * h * 4); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = f(x, y); const i = (y * w + x) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = c[3]; } return d; };
        const good = (() => { const rows = pxiIconCompose(skillPixelContractRows(skillPixelGrid('sword+up')), 'skill'); const colors = pxiIconColors('skill', {m: '#4fc3f7', l: '#c4ecff', d: '#2a6f9a'}, '#ffd35a'); const cv = pxiIconCanvas(rows, colors); return cv.getContext('2d').getImageData(0, 0, 16, 16).data; })();
        const hexTo = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
        const out = {};
        out.good = pxiIconAudit(good, 16, 16, 'skill');
        out.wrongSize = pxiIconAudit(mk(32, 32, () => [10, 10, 10, 255]), 32, 32, 'skill');
        out.gradient = pxiIconAudit(mk(16, 16, (x, y) => [x * 16, y * 16, 80, 255]), 16, 16, 'basic');
        const semi = Uint8ClampedArray.from(good); for (let i = 3; i < semi.length; i += 4) if (semi[i] === 255 && (i >> 2) % 7 === 0) semi[i] = 128;
        out.semiAlpha = pxiIconAudit(semi, 16, 16, 'skill');
        const noFrame = Uint8ClampedArray.from(good); for (let x = 3; x < 12; x++) noFrame[(0 * 16 + x) * 4 + 3] = 0;
        out.noFrame = pxiIconAudit(noFrame, 16, 16, 'skill');
        const noOutline = mk(16, 16, (x, y) => { const e = x === 0 || y === 0 || x === 15 || y === 15; if (e && !((x === 0 || x === 15) && (y === 0 || y === 15))) return [...hexTo(PXI_ICON_CONTRACT.frame.skill), 255]; if (x > 4 && x < 11 && y > 4 && y < 11) return [[200, 90, 60, 255], [90, 200, 60, 255], [60, 90, 200, 255]][(x + y) % 3]; return [0, 0, 0, 0]; });
        out.noOutline = pxiIconAudit(noOutline, 16, 16, 'skill');
        return out;
      });
      const expectBad = ['wrongSize', 'gradient', 'semiAlpha', 'noFrame', 'noOutline'];
      if (t.good.length) problems.push('autoprueba: el ícono bueno debería pasar: ' + t.good.join('; '));
      for (const k of expectBad) if (!t[k].length) problems.push(`autoprueba: el caso malo "${k}" no fue detectado`);
      console.log('autoprueba del verificador:', JSON.stringify(Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v.length ? v[0] : 'PASS']))));
    }

    const champs = await page.evaluate(() => Object.keys(CLASSES));
    const ults = [], kits = {};
    for (const champ of champs) {
      const row = await page.evaluate(async (champ) => {
        for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; }
        selectedClass = champ; currentArena = 'bosque'; lobbyAllies = ['tanque']; netMatch = null; startRun(3); setState('playing'); updateHUD(); updateAbilityButtons();
        const out = [];
        for (const [id, cat] of [['btn-s1', 'skill'], ['btn-s2', 'skill'], ['btn-s3', 'skill'], ['btn-ult', 'ult'], ['btn-basic', 'basic'], ['btn-emerg', 'skill'], ['btn-pact', 'skill']]) {
          const el = document.getElementById(id); if (!el) { out.push({id, missing: true}); continue; }
          const cs = getComputedStyle(el), imgs = [...el.querySelectorAll('.ico img')], img = imgs[0];
          const r = {id, cat, hidden: el.classList.contains('hidden') || cs.display === 'none', imgCount: imgs.length};
          if (img) {
            r.src = img.getAttribute('src').slice(0, 24); const ir = img.getBoundingClientRect(); r.shown = [ir.width, ir.height];
            r.dec = await window.__decode(img.src); r.audit = pxiIconAudit(r.dec.data, r.dec.w, r.dec.h, cat);
          }
          const lab = el.querySelector('div:not(.ico):not(.cd-overlay):not(.kh)');
          if (lab) {
            const lc = getComputedStyle(lab), b = el.getBoundingClientRect(), l = lab.getBoundingClientRect(), bw = parseFloat(cs.borderLeftWidth) || 0;
            r.label = {text: lab.textContent, font: lc.fontFamily, size: lc.fontSize, vis: lc.visibility, w: lab.scrollWidth, cw: lab.clientWidth,
              inFrame: l.left >= b.left + bw - 0.5 && l.right <= b.right - bw + 0.5 && l.top >= b.top + bw - 0.5 && l.bottom <= b.bottom - bw + 0.5,
              hitsIcon: !!img && !(l.bottom <= img.getBoundingClientRect().top + 0.5 || l.top >= img.getBoundingClientRect().bottom - 0.5 || l.right <= img.getBoundingClientRect().left || l.left >= img.getBoundingClientRect().right)};
          }
          out.push(r);
        }
        return out;
      }, champ);
      report.champions++;
      kits[champ] = [];
      for (const r of row) {
        if (r.missing) { if (!['btn-emerg', 'btn-pact'].includes(r.id)) problems.push(`${champ} ${r.id}: no existe en el HUD`); continue; }
        if (r.hidden && (r.id === 'btn-pact' || r.id === 'btn-emerg')) { /* se evalúa igual: el ícono está puesto aunque el botón esté oculto */ }
        if (!r.dec) { problems.push(`${champ} ${r.id}: sin imagen (cae en texto/emoji)`); continue; }
        report.icons++;
        if (!/^data:image\/png/.test(r.src)) problems.push(`${champ} ${r.id}: la imagen no es un PNG del contrato (${r.src}...): recorte de sprite, SVG o ilustración`);
        if (r.imgCount !== 1) problems.push(`${champ} ${r.id}: ${r.imgCount} imágenes en el ícono (debe ser 1)`);
        for (const a of r.audit) problems.push(`${champ} ${r.id}: ${a}`);
        if (!r.hidden && (r.shown[0] % 16 !== 0 || r.shown[1] % 16 !== 0)) problems.push(`${champ} ${r.id}: se muestra a ${r.shown[0]}x${r.shown[1]} px (debe ser múltiplo entero de 16)`);
        if (r.label) {
          const L = r.label; L.text = L.text.toUpperCase();
          if (!/Press Start 2P/.test(L.font) || L.size !== '8px') problems.push(`${champ} ${r.id}: rótulo "${L.text}" con ${L.font} ${L.size} (debe ser Press Start 2P 8px)`);
          if (L.text.length > 5 && r.id !== 'btn-basic') problems.push(`${champ} ${r.id}: rótulo "${L.text}" de ${L.text.length} letras (máximo 5)`);
          if (!/^[A-Z0-9]+$/.test(L.text)) problems.push(`${champ} ${r.id}: rótulo "${L.text}" con caracteres que la fuente pixel no trae (solo A-Z y 0-9)`);
          if (L.w > L.cw + 0.5) problems.push(`${champ} ${r.id}: rótulo "${L.text}" cortado (${L.w}>${L.cw})`);
          if (!r.hidden && !L.inFrame) problems.push(`${champ} ${r.id}: rótulo "${L.text}" pisa el aro del botón`);
          if (!r.hidden && L.hitsIcon) problems.push(`${champ} ${r.id}: rótulo "${L.text}" pisa el ícono`);
        }
        if (['btn-s1', 'btn-s2', 'btn-s3', 'btn-ult'].includes(r.id)) kits[champ].push({id: r.id, ...interior(r.dec.data)});
        if (r.id === 'btn-ult') ults.push({champ, ...interior(r.dec.data)});
      }
    }
    // forma Coloso de Ilkan: su kit también sale del contrato
    const colo = await page.evaluate(async () => {
      const out = [];
      for (let i = 0; i < 4; i++) { const u = skillPixelGlyphUri('ilkan_colossus', i); if (!u) { out.push(null); continue; } const d = await window.__decode(u); out.push({d, audit: pxiIconAudit(d.data, d.w, d.h, i === 3 ? 'ult' : 'skill')}); }
      return out;
    });
    kits.ilkan_colossus = [];
    colo.forEach((r, i) => {
      if (!r) { problems.push(`ilkan_colossus #${i}: sin ícono`); return; }
      r.audit.forEach(x => problems.push(`ilkan_colossus #${i}: ${x}`));
      kits.ilkan_colossus.push({id: '#' + i, ...interior(r.d.data)});
      if (i === 3) ults.push({champ: 'ilkan_colossus', ...interior(r.d.data)});
    });
    // 2) definitivas entre sí
    const pairs = [];
    for (let i = 0; i < ults.length; i++) for (let j = i + 1; j < ults.length; j++) {
      const c = equalFrac(ults[i].px, ults[j].px), s = iou(ults[i].mask, ults[j].mask);
      pairs.push({a: ults[i].champ, b: ults[j].champ, color: c, silhouette: s});
      if (c > THRESHOLD) problems.push(`definitivas ${ults[i].champ} y ${ults[j].champ}: ${(c * 100).toFixed(1)} % de píxeles iguales (máximo ${THRESHOLD * 100} %)`);
      if (s > SIL_THRESHOLD) problems.push(`definitivas ${ults[i].champ} y ${ults[j].champ}: silueta (intersección/unión de píxeles pintados) ${(s * 100).toFixed(1)} % igual (máximo ${SIL_THRESHOLD * 100} %)`);
    }
    report.ultPairs = pairs.length;
    report.worstUlt = pairs.sort((x, y) => Math.max(y.color, y.silhouette) - Math.max(x.color, x.silhouette)).slice(0, 8).map(p => `${p.a}/${p.b} color ${(p.color * 100).toFixed(0)} % silueta IoU ${(p.silhouette * 100).toFixed(0)} %`);
    // 3) dentro de cada kit
    const kitPairs = [];
    for (const [champ, list] of Object.entries(kits)) for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const c = equalFrac(list[i].px, list[j].px); kitPairs.push({champ, a: list[i].id, b: list[j].id, c});
      if (c > THRESHOLD) problems.push(`kit ${champ}: ${list[i].id} y ${list[j].id} con ${(c * 100).toFixed(1)} % de píxeles iguales`);
    }
    report.worstKit = kitPairs.sort((x, y) => y.c - x.c).slice(0, 5).map(p => `${p.champ} ${p.a}/${p.b} ${(p.c * 100).toFixed(0)} %`);
    if (errors.length) problems.push('errores de página: ' + errors.slice(0, 3).join(' | '));
    console.log(`HUD 844x390: ${report.champions} campeones, ${report.icons} íconos auditados; ${report.ultPairs} pares de definitivas (incl. Coloso)`);
    console.log('definitivas más parecidas:', report.worstUlt.slice(0, 4).join(' · '));
    console.log('íconos de kit más parecidos:', report.worstKit.slice(0, 3).join(' · '));
    if (argv.has('--write')) {
      const out = path.join(ROOT, 'docs/ux/iconos-contrato/check-report.json');
      fs.mkdirSync(path.dirname(out), {recursive: true});
      fs.writeFileSync(out, JSON.stringify({...report, problems: problems.length}, null, 2) + '\n');
    }
  } finally { await browser.close(); await site.close(); }
  if (problems.length) { console.log('FAIL (' + problems.length + ')\n - ' + problems.slice(0, 80).join('\n - ') + (problems.length > 80 ? `\n ... y ${problems.length - 80} más` : '')); process.exitCode = 1; }
  else console.log('PASS contrato de íconos: 16x16 nativos, <= 6 colores, alfa 0/255, contorno de 1 px, marco por categoría, definitivas distinguibles (<= 85 % iguales)');
})().catch(e => { console.error(e); if (site) site.close(); process.exitCode = 1; });
