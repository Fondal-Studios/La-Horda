#!/usr/bin/env node
// LA HORDA VISUAL GATE — DENSIDAD DE PÍXEL ÚNICA (docs/ART_BIBLE.md §14, §1 "mezcla de densidades de píxel").
// Mide, por entidad (enemigos, jefes, retratos del Códice) y por fondo de arena, la densidad de píxel EFECTIVA y
// reporta lo que se desvía del canon. Es un gate INFORMATIVO: no decide estilo y no rompe el repo de entrada;
// sale con código 0 salvo con --strict, y --strict solo falla por hallazgos que NO estén en la lista de excepciones
// (docs/art-gate/pixel-density-exceptions.json; cada excepción lleva motivo y plan).
//
// Qué mide (todo sobre el archivo de arte, decodificado por Chromium: PNG, WebP y JPG):
//   bloque   tamaño de bloque nativo b (1 = píxel propio; 2+ = arte chico ampliado por vecino más cercano). Se detecta
//            por periodicidad: dentro del bloque los píxeles vecinos son idénticos, a través del borde no.
//   u/px     unidades de mundo por píxel nativo = (unidades de mundo por píxel de imagen) × bloque. La escala de
//            mundo sale de docs/bible/generated/art/density.json (arena_lineup.js), de BATTLEFIELD_HEIGHTS/META
//            (jefes de campo de batalla) o de la tabla FLOOR_SCALE (texturas de suelo). Canon: 1,0 u/px.
//   tonos    colores significativos (4 bits por canal) que cubren el 99 % de los píxeles opacos (informativo en sprites; en
//            suelos, un mapa pintado trae cientos o miles y un tile de pixel art ≤ 170).
//   suave    % de pares de píxeles vecinos que difieren apenas (1–6 niveles): degradé de ilustración o de JPG.
//   ruido    píxeles sueltos (distintos de sus 4 vecinos y de la mediana) por cada 1000 píxeles opacos: el pixel art real tiene
//            muchos; la ilustración reducida (suave alto + ruido bajo) casi ninguno.
//
// Uso:  node tools/art/pixel-density.js [--group enemigos,jefes,retratos,fondos] [--only texto] [--all]
//                                       [--json out.json] [--write] [--strict] [--self-test]
//   --write   regenera docs/art-gate/pixel-density-report.json y docs/art-gate/PIXEL_DENSITY.md
//   --all     lista también lo que está dentro del canon (por defecto solo los desvíos y las excepciones)
//   --self-test  comprueba el detector con imágenes sintéticas (bloque 1/2/3/4, ruido, degradé)
// Variables: PLAYWRIGHT_MODULE, CHROMIUM_PATH (como el resto de tools/art/*).
'use strict';
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const fs = require('fs'), path = require('path'), http = require('http');
const ROOT = path.resolve(__dirname, '../..');
const argv = process.argv.slice(2);
const flag = n => argv.includes(n), opt = n => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };

// ---------------------------------------------------------------- canon y umbrales (ART_BIBLE §14)
const CANON = {
  upx: 1.0,                 // unidades de mundo por píxel nativo del arte
  upxMax: 2.4,              // ≥ ×2,5 de la mediana del roster (0,95): píxel demasiado grueso (arte chico ampliado)
  upxMin: 0.45,             // por debajo: más fino que el roster → se lee como ilustración reducida
  suaveMax: 0.18,           // pares vecinos que difieren 1–6 niveles: más = degradé de ilustración
  ruidoMin: 80,             // píxeles sueltos por 1000 opacos: el pixel art real los tiene; la ilustración reducida no
  floorTonosMax: 250,       // suelos: paleta de tile ≤ 170 tonos (Ciudad/Minas/Abismo); un mapa pintado trae cientos o miles
};
const FLOOR_SCALE = {       // unidades de mundo por píxel de imagen con que el juego dibuja cada textura de suelo
  'assets/vfx/ciudad/': 2, 'assets/vfx/minas/': 2, 'assets/vfx/abismo/': 1,
  'assets/sprites/arenas/micelial/map/': 2.2,
};
const GROUPS = ['enemigos', 'jefes', 'retratos', 'fondos'];

// ---------------------------------------------------------------- análisis (corre dentro de Chromium)
function analyzeInPage(d, w, h, maxB) {
  const N = w * h;
  const A = (i) => d[i * 4 + 3];
  let opaque = 0; for (let i = 0; i < N; i++) if (A(i) >= 128) opaque++;
  const eq = (i, j) => d[i * 4] === d[j * 4] && d[i * 4 + 1] === d[j * 4 + 1] && d[i * 4 + 2] === d[j * 4 + 2] && d[i * 4 + 3] === d[j * 4 + 3];
  // --- bloque nativo
  // Periodicidad del gradiente: en arte ampliado por vecino más cercano (aunque venga con ruido de JPG) el cambio entre
  // píxeles vecinos se concentra en UNA clase de posición módulo b (el borde del bloque). Para cada b se acumula la
  // diferencia media por clase; hay bloque b si una clase domina de lejos a la segunda (así b=4 no se confunde con b=2).
  function axisPeaks(maxB2, horizontal) {
    const sums = {}, cnts = {};
    for (let b = 2; b <= maxB2; b++) { sums[b] = new Float64Array(b); cnts[b] = new Float64Array(b); }
    const W2 = horizontal ? w - 1 : w, H2 = horizontal ? h : h - 1;
    for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
      const i = y * w + x, j = horizontal ? i + 1 : i + w;
      if (A(i) < 128 && A(j) < 128) continue;
      const m = Math.abs(d[i * 4] - d[j * 4]) + Math.abs(d[i * 4 + 1] - d[j * 4 + 1]) + Math.abs(d[i * 4 + 2] - d[j * 4 + 2]) + Math.abs(d[i * 4 + 3] - d[j * 4 + 3]);
      const pos = horizontal ? x : y;
      for (let b = 2; b <= maxB2; b++) { const r = pos % b; sums[b][r] += m; cnts[b][r]++; }
    }
    const out = {};
    for (let b = 2; b <= maxB2; b++) {
      const mean = [...sums[b]].map((v, r) => cnts[b][r] ? v / cnts[b][r] : 0).sort((p, q) => q - p);
      const tot = mean.reduce((p, q) => p + q, 0) / b;
      out[b] = { peak: mean[0] / Math.max(mean[1], tot * 0.08, 0.5), lvl: mean[0] };
    }
    return out;
  }
  let block = 1, blockScore = 0, pk = {};
  if (opaque > 200 && w >= 16 && h >= 16) {
    const Hp = axisPeaks(maxB, true), Vp = axisPeaks(maxB, false);
    for (let b = 2; b <= maxB; b++) pk[b] = +Math.min(Hp[b].peak, Vp[b].peak).toFixed(2);
    for (let b = maxB; b >= 2; b--) {
      const sc = Math.min(Hp[b].peak, Vp[b].peak);
      if (sc >= 2.2) { block = b; blockScore = sc; break; }
    }
  }
  // --- tonos significativos (4 bits por canal)
  const hist = new Map();
  for (let i = 0; i < N; i++) { if (A(i) < 128) continue; const k = ((d[i * 4] >> 4) << 8) | ((d[i * 4 + 1] >> 4) << 4) | (d[i * 4 + 2] >> 4); hist.set(k, (hist.get(k) || 0) + 1); }
  const sorted = [...hist.values()].sort((a, b) => b - a); let acc = 0, tonos = 0;
  for (const c of sorted) { acc += c; tonos++; if (acc >= opaque * 0.99) break; }
  // --- suavidad (pares casi iguales) y bordes semitransparentes
  let near = 0, pairs = 0, soft = 0, edge = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x + 1 < w; x++) {
    const i = y * w + x, j = i + 1; if (A(i) < 128 || A(j) < 128) continue;
    const m = Math.max(Math.abs(d[i * 4] - d[j * 4]), Math.abs(d[i * 4 + 1] - d[j * 4 + 1]), Math.abs(d[i * 4 + 2] - d[j * 4 + 2]));
    pairs++; if (m >= 1 && m <= 6) near++;
  }
  for (let i = 0; i < N; i++) { const a = A(i); if (a > 0) { edge++; if (a < 255) soft++; } }
  // --- ruido: píxel suelto (≥3 de 4 vecinos distintos por más de 28 niveles de luminancia)
  const L = new Float32Array(N); for (let i = 0; i < N; i++) L[i] = d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11;
  let spk = 0;
  for (let y = 1; y + 1 < h; y++) for (let x = 1; x + 1 < w; x++) {
    const i = y * w + x; if (A(i) < 128) continue;
    let far = 0; for (const j of [i - 1, i + 1, i - w, i + w]) if (Math.abs(L[i] - L[j]) > 28) far++;
    if (far >= 3) { const s = [L[i - 1], L[i + 1], L[i - w], L[i + w]].sort((a, b) => a - b); if (Math.abs(L[i] - (s[1] + s[2]) / 2) > 28) spk++; }
  }
  return { w, h, opaque, block, blockScore: +blockScore.toFixed(2), pk, tonos, suave: pairs ? +(near / pairs).toFixed(3) : 0, aa: edge ? +(soft / edge).toFixed(3) : 0, ruido: opaque ? +(spk / opaque * 1000).toFixed(1) : 0 };
}

// ---------------------------------------------------------------- inventario de arte
function walk(dir, fn) { if (!fs.existsSync(dir)) return; for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); e.isDirectory() ? walk(p, fn) : fn(p); } }
const rel = p => path.relative(ROOT, p).split(path.sep).join('/');
function readJSON(p) { try { return JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8')); } catch (e) { return null; } }

function inventory() {
  // un archivo por arte: preferir PNG, si solo hay WebP/JPG se usa ese
  const files = {};
  const add = (p, group, entity, id) => { const r = rel(p), k = r.replace(/\.(png|webp|jpg)$/, ''); const pri = r.endsWith('.png') ? 0 : r.endsWith('.webp') ? 1 : 2; if (!files[k] || files[k].pri > pri) files[k] = { file: r, pri, group, entity, id }; };
  const skip = /(^|\/)(fx|vfx|map)(\/|$)/;
  const IMG = /\.(png|webp|jpg)$/;
  for (const [root, group] of [['assets/sprites/enemies', 'enemigos'], ['assets/sprites/arenas', 'enemigos'], ['assets/sprites/bosses', 'jefes']]) {
    walk(path.join(ROOT, root), p => {
      const r = rel(p); if (!IMG.test(r) || skip.test(r.slice(root.length)) || /\/divina\//.test(r) || /_(icon|portrait)\./.test(r)) return;
      add(p, group, path.dirname(r), path.dirname(r));
    });
  }
  // jefes de campo de batalla (arte de "retrato" grande, 4 cuadros de 448×384)
  const bf = fs.readFileSync(path.join(ROOT, 'js/rendering/battlefield-art.js'), 'utf8').match(/BATTLEFIELD_HEIGHTS=\{([^}]*)\}/);
  const heights = {}; if (bf) bf[1].split(',').forEach(kv => { const m = kv.trim().match(/^'?([\w-]+)'?:(\d+)$/); if (m) heights[m[1]] = +m[2]; });
  const metaTxt = fs.readFileSync(path.join(ROOT, 'js/assets/battlefield-meta.js'), 'utf8').match(/=\s*(\{.*\});?\s*$/s);
  const bmeta = metaTxt ? JSON.parse(metaTxt[1]) : {};
  for (const k of Object.keys(heights)) add(path.join(ROOT, 'assets/sprites/battlefield', k + '.png'), 'jefes', 'battlefield/' + k, 'assets/sprites/battlefield/' + k);
  // retratos del Códice (JPG)
  walk(path.join(ROOT, 'assets/ui/codex'), p => { if (/\.jpg$/.test(p)) add(p, 'retratos', rel(p), rel(p)); });
  // fondos de arena
  walk(path.join(ROOT, 'assets/vfx'), p => { if (/\/tex_[^/]+\.png$/.test(rel(p))) add(p, 'fondos', rel(p), rel(p)); });
  walk(path.join(ROOT, 'assets/sprites/arenas/micelial/map'), p => { if (IMG.test(p)) add(p, 'fondos', rel(p), rel(p)); });
  return { files: Object.values(files), heights, bmeta };
}

function worldScale(entry, ctx) {
  const { file, group, entity } = entry;
  if (group === 'fondos') { for (const k of Object.keys(FLOOR_SCALE)) if (file.startsWith(k)) return FLOOR_SCALE[k]; return null; }
  if (entity.startsWith('battlefield/')) { const k = entity.slice(12), m = ctx.bmeta[k]; return m && ctx.heights[k] ? ctx.heights[k] / m.ref : null; }
  if (group === 'retratos') return null; // el retrato se ajusta a la ficha: la densidad real es la del sprite que muestra
  const v = ctx.byDir[entity]; return v == null ? null : v;
}

function loadDensity() {
  const d = readJSON('docs/bible/generated/art/density.json'); const byDir = {};
  if (!d) return byDir;
  for (const rows of Object.values(d.density)) for (const r of rows) {
    if (!r.src || !/^assets\//.test(r.src) || r.upx == null) continue;
    const dir = path.posix.dirname(r.src); if (/(\/fx\/|\/vfx\/)/.test(dir) || dir.startsWith('assets/sprites/champions')) continue;
    if (byDir[dir] == null) byDir[dir] = r.upx;
  }
  return byDir;
}

// ---------------------------------------------------------------- servidor estático y navegador
function serve() {
  return new Promise(res => {
    const types = { '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
    const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!p.startsWith(ROOT) || !fs.existsSync(p)) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', types[path.extname(p)] || 'application/octet-stream'); fs.createReadStream(p).pipe(r); });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}

async function analyzeFiles(list) {
  const srv = await serve(), port = srv.address().port;
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
  const page = await (await browser.newContext()).newPage();
  await page.goto(`http://127.0.0.1:${port}/robots.txt`).catch(() => {});
  await page.addScriptTag({ content: `window.__an = ${analyzeInPage.toString()};` });
  const out = {};
  for (let i = 0; i < list.length; i += 40) {
    const chunk = list.slice(i, i + 40);
    const res = await page.evaluate(async ({ chunk, port }) => {
      const r = {};
      for (const f of chunk) {
        try {
          const bmp = await createImageBitmap(await (await fetch(`http://127.0.0.1:${port}/${f.file}`)).blob());
          const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height;
          const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(bmp, 0, 0);
          r[f.file] = window.__an(g.getImageData(0, 0, c.width, c.height).data, c.width, c.height, 8);
        } catch (e) { r[f.file] = { error: String(e) }; }
      }
      return r;
    }, { chunk, port });
    Object.assign(out, res);
  }
  await browser.close(); srv.close();
  return out;
}

async function selfTest() {
  // imágenes sintéticas dentro de Chromium: pixel art base de 40×40 con paleta de 6 colores, ampliada ×1/×2/×3/×4
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
  const page = await (await browser.newContext()).newPage();
  await page.setContent('<canvas id=c></canvas>');
  await page.addScriptTag({ content: `window.__an = ${analyzeInPage.toString()};` });
  const res = await page.evaluate(() => {
    let seed = 7; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    const pal = [[20, 14, 24], [90, 40, 40], [160, 70, 50], [220, 150, 90], [60, 70, 110], [200, 200, 210]];
    const N = 48, base = []; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) base.push(rnd() < 0.55 ? ((x >> 2) + (y >> 2)) % 3 : (rnd() * pal.length) | 0);
    const mk = (k) => { const w = N * k, d = new Uint8ClampedArray(w * w * 4); for (let y = 0; y < w; y++) for (let x = 0; x < w; x++) { const c = pal[base[((y / k) | 0) * N + ((x / k) | 0)]], i = (y * w + x) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; } return { d, w }; };
    const out = {};
    for (const k of [1, 2, 3, 4]) { const { d, w } = mk(k); out['x' + k] = window.__an(d, w, w, 8).block; }
    const w = 96, d = new Uint8ClampedArray(w * w * 4);
    for (let y = 0; y < w; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, v = 100 + (x + y) * 0.6 + (rnd() * 3 | 0); d[i] = v; d[i + 1] = v * 0.7; d[i + 2] = v * 0.5; d[i + 3] = 255; }
    const g = window.__an(d, w, w, 8); out.degrade = { block: g.block, suave: g.suave, tonos: g.tonos };
    const n = new Uint8ClampedArray(w * w * 4); for (let i = 0; i < w * w; i++) { const v = rnd() < 0.2 ? 230 : 40; n[i * 4] = v; n[i * 4 + 1] = v; n[i * 4 + 2] = v; n[i * 4 + 3] = 255; }
    out.ruido = window.__an(n, w, w, 8).ruido;
    return out;
  });
  await browser.close();
  const ok = res.x1 === 1 && res.x2 === 2 && res.x3 === 3 && res.x4 === 4 && res.degrade.block === 1 && res.degrade.suave > 0.6 && res.ruido > 100;
  console.log('self-test', JSON.stringify(res), ok ? 'OK' : 'FALLA');
  process.exit(ok ? 0 : 1);
}

// ---------------------------------------------------------------- clasificación
function classify(group, r, scale, file) {
  const issues = [];
  const eff = scale != null ? +(scale * r.block).toFixed(2) : null;
  if (r.error) return { eff, issues: ['SIN_DECODIFICAR'] };
  if (eff != null && eff > CANON.upxMax) issues.push('PIXEL_GRUESO');
  if (eff != null && eff < CANON.upxMin && group !== 'retratos') issues.push('PIXEL_FINO');
  if (group === 'fondos') {
    if (r.tonos > CANON.floorTonosMax) issues.push('PALETA_EXCESIVA');   // suelo pintado: miles de tonos y ruido de JPG
    if (/\.jpe?g$/.test(file)) issues.push('FORMATO_JPG');              // artefactos de compresión de alta frecuencia
  } else {
    // ilustración: degradé suave sin detalle de píxel nítido (los sprites de píxel real tienen muchos píxeles sueltos)
    if (r.suave > CANON.suaveMax && r.ruido < CANON.ruidoMin) issues.push('ILUSTRACION');
    if (group === 'retratos' && /\.jpe?g$/.test(file)) issues.push('FORMATO_JPG');
  }
  return { eff, issues };
}

(async () => {
  if (flag('--self-test')) return selfTest();
  const groups = (opt('--group') || GROUPS.join(',')).split(',').filter(g => GROUPS.includes(g));
  const only = opt('--only');
  const inv = inventory(), byDir = loadDensity();
  const ctx = { heights: inv.heights, bmeta: inv.bmeta, byDir };
  const exc = (readJSON('docs/art-gate/pixel-density-exceptions.json') || { exceptions: [] }).exceptions;
  let list = inv.files.filter(f => groups.includes(f.group) && (!only || f.file.includes(only)));
  const raw = await analyzeFiles(list);
  // agrupar por entidad (un sprite por carpeta de poses = mediana de bloque, máximo de tonos/ruido)
  const ents = {};
  for (const f of list) { const e = (ents[f.id] = ents[f.id] || { id: f.id, group: f.group, entity: f.entity, files: [], r: [] }); e.files.push(f.file); if (raw[f.file]) e.r.push(raw[f.file]); }
  const rows = [];
  for (const e of Object.values(ents)) {
    const ok = e.r.filter(r => !r.error); const rr = ok.length ? ok : e.r;
    const med = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
    const agg = ok.length ? { block: med(ok.map(r => r.block)), tonos: Math.max(...ok.map(r => r.tonos)), suave: +med(ok.map(r => r.suave)).toFixed(3), aa: +med(ok.map(r => r.aa)).toFixed(3), ruido: +med(ok.map(r => r.ruido)).toFixed(1), w: ok[0].w, h: ok[0].h, pk: ok[0].pk } : { error: (rr[0] || {}).error || 'sin datos' };
    const scale = worldScale({ file: e.files[0], group: e.group, entity: e.entity }, ctx);
    const c = classify(e.group, agg, scale, e.files[0]);
    const ex = exc.filter(x => e.id === x.id || (x.prefix && e.id.startsWith(x.prefix)));
    const open = c.issues.filter(i => !ex.some(x => !x.issues || x.issues.includes(i)));
    rows.push({ id: e.id, group: e.group, archivos: e.files.length, ...agg, upxMundo: scale == null ? null : +scale.toFixed(2), upxEfectivo: c.eff, hallazgos: c.issues, excepcion: ex.length ? ex[0].motivo : null, abiertos: open });
  }
  rows.sort((a, b) => a.group.localeCompare(b.group) || (b.hallazgos.length - a.hallazgos.length) || a.id.localeCompare(b.id));
  const bad = rows.filter(r => r.hallazgos.length);
  const show = flag('--all') ? rows : bad;
  console.log(`pixel-density: ${rows.length} entidades analizadas (${groups.join(', ')}); ${bad.length} con desvíos; ${rows.filter(r => r.abiertos.length).length} sin excepción documentada`);
  console.log(`canon ${CANON.upx} u/px · PASS ${CANON.upxMin}–${CANON.upxMax} u/px · ilustración = suave > ${CANON.suaveMax} y ruido < ${CANON.ruidoMin}/1000 px · suelos: tonos ≤ ${CANON.floorTonosMax}, sin JPG`);
  for (const r of show) console.log(`${r.group.padEnd(9)} ${r.id.padEnd(58)} b${r.block ?? '?'} u/px ${String(r.upxEfectivo ?? '-').padEnd(5)} tonos ${String(r.tonos ?? '-').padEnd(5)} suave ${String(r.suave ?? '-').padEnd(5)} ruido ${String(r.ruido ?? '-').padEnd(6)} ${r.hallazgos.join(',') || 'ok'}${r.excepcion ? '  [excepción: ' + r.excepcion.slice(0, 50) + ']' : ''}`);
  const report = { generatedBy: 'tools/art/pixel-density.js', canon: CANON, resumen: { entidades: rows.length, desvios: bad.length, sinExcepcion: rows.filter(r => r.abiertos.length).length }, entidades: rows };
  if (opt('--json')) fs.writeFileSync(opt('--json'), JSON.stringify(report, null, 1) + '\n');
  if (flag('--write')) {
    fs.writeFileSync(path.join(ROOT, 'docs/art-gate/pixel-density-report.json'), JSON.stringify(report, null, 1) + '\n');
    const L = ['# Densidad de píxel — informe del gate (AUTO-GENERADO)', '', '> `node tools/art/pixel-density.js --write`. Canon y umbrales: `docs/ART_BIBLE.md` §14. Excepciones: `docs/art-gate/pixel-density-exceptions.json`. Informativo: mide, no decide estilo; la revisión de arte sigue siendo humana.', '',
      `Entidades: ${rows.length} · con desvíos: ${bad.length} · sin excepción documentada: ${report.resumen.sinExcepcion}`, '', '| Grupo | Entidad | bloque | u/px efectivo | tonos | suave | ruido | Hallazgos | Excepción |', '|---|---|---|---|---|---|---|---|---|'];
    for (const r of bad) L.push(`| ${r.group} | \`${r.id}\` | ${r.block ?? '?'} | ${r.upxEfectivo ?? '-'} | ${r.tonos ?? '-'} | ${r.suave ?? '-'} | ${r.ruido ?? '-'} | ${r.hallazgos.join(', ')} | ${r.excepcion || ''} |`);
    fs.writeFileSync(path.join(ROOT, 'docs/art-gate/PIXEL_DENSITY.md'), L.join('\n') + '\n');
  }
  if (flag('--strict') && rows.some(r => r.abiertos.length)) { console.log('STRICT: hay desvíos sin excepción documentada'); process.exit(1); }
})().catch(e => { console.error(e); process.exit(2); });
