'use strict';
/* SILUETA DE LAS DEFINITIVAS: matriz de similitud de forma y prueba de que dos definitivas no se leen igual.
   Qué hace: lanza la definitiva de cada campeón en el motor real (844x390, Chromium, 4 muñecos fijos) con RELOJ VIRTUAL (16 ms por cuadro, update()+render()
   a mano: el resultado no depende de la carga de la máquina), cámara fija, sin sacudida ni números flotantes, y toma el canvas antes y durante el efecto
   (13 cuadros, de 60 ms a 2,3 s). Se queda con los píxeles que cambian por el efecto: descarta los que ya cambian solos entre dos cuadros previos (animaciones
   de fondo) y las capas de color a pantalla completa (ajuste lineal I' = a*I + b por canal, iterado). De ahí salen:
     - mascara U = unión de todo lo que el efecto pinta en su vida; E1 / E2 / E3 = anticipación+impacto (<350 ms), cuerpo (350-1000 ms) y rastro (>1000 ms);
     - color dominante (matiz medio ponderado por saturación) y duración del rastro (último cuadro con >= 8 % del área máxima).
   Cada máscara se normaliza: centro = centroide de U, escala = raíz de la media de r^2 de U, y se resamplea a una grilla de 64x64 que cubre [-2,6, 2,6] veces esa
   escala. Así se compara FORMA y no tamaño ni posición.
   SIMILITUD de dos definitivas: S = 0,4 * IoU(U) + 0,6 * media(IoU(E1), IoU(E2), IoU(E3)) (las etapas vacías en ambas se saltan). IoU = |A y B| / |A o B|.
   UMBRAL: SIM_MAX = 0,80. Dos definitivas distintas con S >= SIM_MAX fallan. La escala medida (anillos con polvo de main contra formas propias) y la tabla
   antes/después están en docs/vfx/ultis-distintas/README.md.
   EXCEPCIONES (documentadas, se imprimen en el reporte):
     1. DEUDA: un par donde NINGUNA de las dos definitivas tiene forma propia todavía (el anillo genérico anterior) se informa como deuda y no falla; así la prueba
        solo permite que un campeón rehecho (o nuevo) se parezca a otro dentro del umbral. STRICT_ALL=1 la desactiva (y falla con toda la deuda).
     2. PANTALLA COMPLETA: si la máscara cubre más de la mitad del recorte (p. ej. el tinte de océano de Facu o el Juicio de Nano GM, objetos de zona persistentes de la
        mecánica) no tiene silueta propia y se saca de la matriz; se lista aparte.
     3. SIM_EXCEPTIONS: pares {a, b, why} que a propósito comparten forma. Hoy vacía.
   Uso:
     PORT=9301 node tools/vfx/silhouette-diff.js                 captura en vivo (servidor propio) y evalúa
     BASE_URL=http://127.0.0.1:9301/ ...                         usa un servidor ya levantado (?uf=0 en la URL = definitivas de antes)
     OUT=docs/vfx/ultis-distintas/despues node ...               guarda JSON, matriz .md/.csv y cuadros .png (+ máscaras)
     FROM=docs/vfx/ultis-distintas/despues.json node ...         recalcula la matriz sin navegador
     ONLY=a,b                                                    solo esos campeones (la prueba exige >= 2)
     INFO=1                                                      informa pero no falla (sale con 0)
   Solo lectura del juego: no cambia daño, enfriamientos, alcances ni hitboxes. */
const fs = require('node:fs'), path = require('node:path'), {spawn} = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const SIM_MAX = +(process.env.SIM_MAX || 0.80), G = 64, SPAN = 2.6, COVER_MAX = 0.5;
// pares {a, b, why} (a < b alfabéticamente) que pueden superar SIM_MAX a propósito. Vacío = ninguna excepción.
const SIM_EXCEPTIONS = [];

const hex = bits => { let s = ''; for (let i = 0; i < bits.length; i += 4) s += ((bits[i] << 3) | (bits[i + 1] << 2) | (bits[i + 2] << 1) | bits[i + 3]).toString(16); return s; };
const unhex = s => { const b = new Uint8Array(s.length * 4); for (let i = 0; i < s.length; i++) { const v = parseInt(s[i], 16); b[i * 4] = v >> 3 & 1; b[i * 4 + 1] = v >> 2 & 1; b[i * 4 + 2] = v >> 1 & 1; b[i * 4 + 3] = v & 1; } return b; };
function iou(a, b) { let i = 0, u = 0; for (let k = 0; k < a.length; k++) { const x = a[k], y = b[k]; if (x & y) i++; if (x | y) u++; } return u ? i / u : null; }
function similarity(A, B) {
  const u = iou(unhex(A.U), unhex(B.U)), st = [];
  for (const k of ['E1', 'E2', 'E3']) { if (!A[k] && !B[k]) continue; const v = iou(A[k] ? unhex(A[k]) : new Uint8Array(G * G), B[k] ? unhex(B[k]) : new Uint8Array(G * G)); if (v !== null) st.push(v); }
  return 0.4 * (u || 0) + 0.6 * (st.length ? st.reduce((s, v) => s + v, 0) / st.length : 0);
}
function matrix(desc) {
  const ks = Object.keys(desc).sort(), M = {}, pairs = [];
  for (const a of ks) { M[a] = {}; for (const b of ks) M[a][b] = a === b ? 1 : similarity(desc[a], desc[b]); }
  for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) pairs.push({a: ks[i], b: ks[j], s: M[ks[i]][ks[j]]});
  pairs.sort((x, y) => y.s - x.s);
  return {ks, M, pairs};
}
const excepted = p => SIM_EXCEPTIONS.find(e => e.a === p.a && e.b === p.b);
function report(desc, title) {
  const full = Object.keys(desc).filter(k => desc[k].cover > COVER_MAX).sort(), use = {}; for (const k of Object.keys(desc)) if (!full.includes(k)) use[k] = desc[k];
  const {ks, M, pairs} = matrix(use), debtOf = p => !process.env.STRICT_ALL && !use[p.a].uf && !use[p.b].uf;
  const over = pairs.filter(p => p.s >= SIM_MAX && !excepted(p) && !debtOf(p)), debt = pairs.filter(p => p.s >= SIM_MAX && !excepted(p) && debtOf(p));
  const mean = pairs.reduce((s, p) => s + p.s, 0) / (pairs.length || 1), own = ks.filter(k => use[k].uf);
  const worst = ks.map(k => { let m = 0, w = ''; for (const o of ks) if (o !== k && M[k][o] > m) { m = M[k][o]; w = o; } return {k, m, w}; }).sort((x, y) => y.m - x.m);
  const lines = [`# ${title}`, '', `Campeones en la matriz: ${ks.length} (con forma propia: ${own.length}). Umbral SIM_MAX = ${SIM_MAX}. Similitud media entre pares: ${mean.toFixed(3)}.`,
    `Pares >= umbral: ${pairs.filter(p => p.s >= SIM_MAX).length} -> fallan: ${over.length}, deuda (ambas sin forma propia): ${debt.length}, con excepcion explicita: ${pairs.filter(p => p.s >= SIM_MAX && excepted(p)).length}.`, '',
    full.length ? `Fuera de la matriz por cubrir mas de la mitad de la pantalla (sin silueta propia): ${full.join(', ')}.` : 'Ninguna definitiva cubre la pantalla completa.', '',
    own.length ? `Con forma propia: ${own.join(', ')}.` : 'Ningun campeon con forma propia (main).', '', '## Pares mas parecidos', '', '| # | A | B | similitud | estado |', '|---|---|---|---|---|'];
  pairs.slice(0, 30).forEach((p, i) => lines.push(`| ${i + 1} | ${p.a}${use[p.a].uf ? ' *' : ''} | ${p.b}${use[p.b].uf ? ' *' : ''} | ${p.s.toFixed(3)} | ${p.s < SIM_MAX ? 'ok' : excepted(p) ? 'excepcion' : debtOf(p) ? 'deuda' : 'FALLA'} |`));
  lines.push('', '(* = definitiva con forma propia)', '', '## Mas parecida a otra, por campeon', '', '| campeon | parecida a | similitud | matiz dominante | rastro (ms) |', '|---|---|---|---|---|');
  for (const w of worst) lines.push(`| ${w.k}${use[w.k].uf ? ' *' : ''} | ${w.w} | ${w.m.toFixed(3)} | ${use[w.k].hue} | ${use[w.k].trail} |`);
  return {text: lines.join('\n') + '\n', over, debt, pairs, mean, worst, ks, M, full, desc: use};
}

async function capture(only) {
  let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
  const PORT = +(process.env.PORT || 9301);
  const server = process.env.BASE_URL ? null : spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {cwd: ROOT, stdio: 'ignore'});
  const BASE = process.env.BASE_URL || `http://127.0.0.1:${PORT}/`;
  await new Promise(r => setTimeout(r, server ? 800 : 0));
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  const desc = {}, sheets = {}, masks = {}, errors = [];
  try {
    const page = await browser.newPage({viewport: {width: 844, height: 390}});
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 120000});
    await page.waitForFunction(() => typeof startRun === 'function' && typeof assetsAllReady === 'function' && assetsAllReady(), null, {timeout: 120000});
    await page.waitForTimeout(1500);
    let roster = (await page.evaluate(() => Object.keys(CLASSES))).sort();
    if (only) roster = roster.filter(k => only.includes(k));
    for (const k of roster) {
      await page.evaluate(k => {
        netMatch = null; save.stash = []; save.relics = {hp: 0, dmg: 0, def: 0, vel: 0};
        for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; s.xp = 0; s.equipment = {}; s.inventory = []; s.talents = {nodes: {}, mastery: null, masteryNodes: {}}; }
        selectedClass = k; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'mago'].filter(x => x !== k); startRun(3);
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        enemies = []; spawnTimer = 1e9; arenaHazardTimer = 1e9; player.fx = 1; player.fy = 0; state = 'playing';
        runLevel = Math.max(runLevel || 1, typeof ULT_MIN_ARENA_LEVEL !== 'undefined' ? ULT_MIN_ARENA_LEVEL : 1);
        for (const [dx, dy] of [[100, 0], [118, -16], [118, 16], [140, 0]]) { const e = spawnEnemy('esqueleto'); Object.assign(e, {x: player.x + dx, y: player.y + dy, hp: 1e7, maxHp: 1e7, speed: 0, baseSpeed: 0, dmg: 0}); }
        for (let i = 0; i < allies.length; i++) { allies[i].x = player.x - 35 - i * 24; allies[i].y = player.y + 15; allies[i].hp = allies[i].maxHp * .5; allies[i].stunTimer = 1e9; }
        player.hp = player.maxHp * .6; player.energy = 1e4; player.ultCharge = player.ultMax; player.cds = [0, 0, 0];
        if (k === 'ilkan') player.ilkanFury = 1e4;
        player.aim = {x: player.x + 115, y: player.y, dx: 1, dy: 0};
      }, k);
      await page.waitForTimeout(900);
      const res = await page.evaluate(async ({G, SPAN}) => {
        const cv = document.getElementById('game'), X = 142, Y = 45, W = 560, H = 300, sc = cv.width / 844;
        const grab = () => ctx.getImageData(Math.round(X * sc), Math.round(Y * sc), Math.round(W * sc), Math.round(H * sc));
        // reloj virtual: 16 ms por cuadro, update()+render() a mano; así la captura no depende de la carga de la máquina ni de vsync
        // sin sacudida de cámara ni números flotantes (mueven todo el cuadro y no son parte de la silueta del efecto)
        const sk0 = window.vfxShake, ft0 = window.floatText; window.vfxShake = function(){}; window.floatText = function(){};
        let vt = 1000; const pn = performance.now, rnd = Math.random; performance.now = () => vt; let sd = 20241018;
        Math.random = () => { sd ^= sd << 13; sd >>>= 0; sd ^= sd >> 17; sd ^= sd << 5; sd >>>= 0; return sd / 4294967296; };
        // cámara fija en el punto de lanzamiento (algunas definitivas mueven al héroe: el fondo no debe contar como efecto)
        const camSubj0 = CAM_SUBJECT; CAM_SUBJECT = {x: player.x, y: player.y};
        const step = () => { vt += 16; try { CAM_LEAD_X = 0; CAM_LEAD_Y = 0; } catch (e) {} update(16); render(); };
        for (let i = 0; i < 20; i++) step();
        const a1 = grab(); for (let i = 0; i < 8; i++) step(); const a0 = grab();
        const noise = new Uint8Array(a0.width * a0.height); for (let i = 0; i < noise.length; i++) { const j = i * 4; if (Math.abs(a0.data[j] - a1.data[j]) + Math.abs(a0.data[j + 1] - a1.data[j + 1]) + Math.abs(a0.data[j + 2] - a1.data[j + 2]) > 30) noise[i] = 1; }
        player.cds = [0, 0, 0]; player.energy = 1e4; player.ultCharge = player.ultMax;
        const t0 = vt; castAbility(player, player.cls.ultimate, true, undefined);
        const times = [60, 160, 260, 380, 520, 680, 860, 1060, 1300, 1550, 1800, 2050, 2300], fr = [];
        for (const t of times) { while (vt - t0 < t) step(); fr.push({t: vt - t0, im: grab()}); }
        performance.now = pn; Math.random = rnd; window.vfxShake = sk0; window.floatText = ft0; CAM_SUBJECT = camSubj0;
        // una capa de color a pantalla completa (destello, oscurecer, tinte) cambia TODOS los píxeles de forma lineal: se ajusta I' = a*I + b por canal
        // (mínimos cuadrados iterado, descartando los píxeles que se alejan: el efecto) y solo cuenta lo que el ajuste no explica
        const w = a0.width, h = a0.height, masks = fr.map(({im}) => {
          const co = [];
          for (let ch = 0; ch < 3; ch++) { let a = 1, b = 0; for (let it = 0; it < 4; it++) { let sx = 0, sy = 0, sxx = 0, sxy = 0, n = 0;
            for (let i = 0; i < w * h; i += 5) { if (noise[i]) continue; const x = a0.data[i * 4 + ch], y = im.data[i * 4 + ch]; if (it > 0 && Math.abs(y - (a * x + b)) > 28) continue; sx += x; sy += y; sxx += x * x; sxy += x * y; n++; }
            const den = n * sxx - sx * sx; if (n > 50 && den > 1) { a = (n * sxy - sx * sy) / den; b = (sy - a * sx) / n; } }
            co.push([a, b]); }
          const m = new Uint8Array(w * h);
          for (let i = 0; i < m.length; i++) { if (noise[i]) continue; const j = i * 4; let d = 0; for (let ch = 0; ch < 3; ch++) d += Math.abs(im.data[j + ch] - (co[ch][0] * a0.data[j + ch] + co[ch][1])); if (d > 70) m[i] = 1; }
          return m; });
        const U = new Uint8Array(w * h); masks.forEach(m => { for (let i = 0; i < m.length; i++) if (m[i]) U[i] = 1; });
        let n = 0, sx = 0, sy = 0; for (let i = 0; i < U.length; i++) if (U[i]) { n++; sx += i % w; sy += (i / w) | 0; }
        if (n < 30) return {empty: true, n};
        const cx = sx / n, cy = sy / n; let r2 = 0; for (let i = 0; i < U.length; i++) if (U[i]) { const dx = (i % w) - cx, dy = ((i / w) | 0) - cy; r2 += dx * dx + dy * dy; } const s = Math.max(8, Math.sqrt(r2 / n));
        const grid = ms => { const o = new Uint8Array(G * G), cnt = new Float32Array(G * G); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const gx = Math.floor(((x - cx) / s + SPAN) / (2 * SPAN) * G), gy = Math.floor(((y - cy) / s + SPAN) / (2 * SPAN) * G); if (gx < 0 || gy < 0 || gx >= G || gy >= G) continue; let any = false; for (const m of ms) if (m[y * w + x]) { any = true; break; } if (any) cnt[gy * G + gx]++; }
          const cell = 2 * SPAN * s / G, area = cell * cell; for (let i = 0; i < cnt.length; i++) o[i] = cnt[i] > Math.min(3, area * .06) ? 1 : 0; return o; };
        const sel = (a, b) => masks.filter((_, i) => fr[i].t >= a && fr[i].t < b);
        const area = fr.map((_, i) => masks[i].reduce((q, v) => q + v, 0)), peak = Math.max(...area);
        const ar = area.map(a => +(a / Math.max(1, peak)).toFixed(2)), rr = masks.map(m => { let c = 0, q = 0; for (let i = 0; i < m.length; i++) if (m[i]) { const dx = (i % w) - cx, dy = ((i / w) | 0) - cy; c++; q += dx * dx + dy * dy; } return c ? +(Math.sqrt(q / c) / s).toFixed(2) : 0; });
        let trail = 0; area.forEach((a, i) => { if (a >= peak * .08) trail = Math.round(fr[i].t); });
        const pk = area.indexOf(peak), im = fr[pk].im, mk = masks[pk]; let hx = 0, hy = 0, wsum = 0, cnt2 = 0;
        for (let i = 0; i < mk.length; i++) if (mk[i]) { const j = i * 4, r = im.data[j] / 255, gg = im.data[j + 1] / 255, b = im.data[j + 2] / 255, mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), d = mx - mn; cnt2++; if (d < .12) continue; let hh = mx === r ? ((gg - b) / d + 6) % 6 : mx === gg ? (b - r) / d + 2 : (r - gg) / d + 4; hh *= Math.PI / 3; const wt = d * mx; hx += Math.cos(hh) * wt; hy += Math.sin(hh) * wt; wsum += wt; }
        const hue = wsum > 0 ? Math.round(((Math.atan2(hy, hx) * 180 / Math.PI) + 360) % 360) : -1, sat = wsum / Math.max(1, cnt2);
        const U2 = grid([U]), E1 = grid(sel(0, 350)), E2 = grid(sel(350, 1000)), E3 = grid(sel(1000, 9e9));
        const sheet = document.createElement('canvas'); sheet.width = 4 * 150; sheet.height = 130; const sg = sheet.getContext('2d'); sg.imageSmoothingEnabled = false;
        [1, 3, 5, 8].forEach((fi, q) => { const c2 = document.createElement('canvas'); c2.width = w; c2.height = h; c2.getContext('2d').putImageData(fr[fi].im, 0, 0); sg.drawImage(c2, Math.max(0, Math.min(w - 300, cx - 150)), Math.max(0, Math.min(h - 260, cy - 130)), 300, 260, q * 150, 0, 150, 130); });
        const mc = document.createElement('canvas'); mc.width = w; mc.height = h; const mg = mc.getContext('2d'), mi = mg.createImageData(w, h); for (let i = 0; i < U.length; i++) { const j = i * 4; const v = U[i] ? 255 : 0; mi.data[j] = v; mi.data[j + 1] = v; mi.data[j + 2] = v; mi.data[j + 3] = 255; } mg.putImageData(mi, 0, 0);
        return {cover: n / (w * h), uf: typeof ufHas === 'function' && ufHas(player.classKey), ar, rr, mask: mc.toDataURL('image/png'), n, s: Math.round(s), peak, trail, hue, sat: +sat.toFixed(3), name: player.cls.ultimate.name, U: [...U2], E1: [...E1], E2: [...E2], E3: [...E3], sheet: sheet.toDataURL('image/png')};
      }, {G, SPAN});
      if (res.empty) { desc[k] = {empty: true}; console.log(k.padEnd(11), 'sin efecto medible'); }
      else {
        const pack = a => a.some(v => v) ? hex(a) : '';
        desc[k] = {name: res.name, U: hex(res.U), E1: pack(res.E1), E2: pack(res.E2), E3: pack(res.E3), hue: res.hue, sat: res.sat, trail: res.trail, scale: res.s, peak: res.peak, cover: +res.cover.toFixed(3), uf: res.uf, ar: res.ar, rr: res.rr};
        sheets[k] = res.sheet; masks[k] = res.mask; console.log(k.padEnd(11), res.name.padEnd(28), 'escala', String(res.s).padStart(3), 'matiz', String(res.hue).padStart(3), 'rastro', res.trail, 'ms');
      }
      await page.evaluate(() => { state = 'menu'; });
    }
  } finally { await browser.close(); if (server) server.kill(); }
  return {desc, sheets, masks, errors};
}

(async () => {
  let desc, sheets = {}, masks = {}, errors = [];
  const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
  if (process.env.FROM) { const j = JSON.parse(fs.readFileSync(path.resolve(ROOT, process.env.FROM), 'utf8')); desc = j.desc || j; }
  else { const r = await capture(only); desc = r.desc; sheets = r.sheets; masks = r.masks; errors = r.errors; }
  for (const k of Object.keys(desc)) if (desc[k].empty) { console.log('AVISO', k, 'sin efecto medible: se excluye de la matriz'); delete desc[k]; }
  const R = report(desc, 'Matriz de similitud de silueta de definitivas' + (process.env.TITLE ? ' - ' + process.env.TITLE : ''));
  if (process.env.OUT) {
    const base = path.resolve(ROOT, process.env.OUT); fs.mkdirSync(path.dirname(base), {recursive: true});
    if (!process.env.FROM) fs.writeFileSync(base + '.json', JSON.stringify({simMax: SIM_MAX, grid: G, span: SPAN, desc}) + '\n');
    fs.writeFileSync(base + '.md', R.text);
    fs.writeFileSync(base + '-matriz.csv', ['campeon,' + R.ks.join(',')].concat(R.ks.map(a => a + ',' + R.ks.map(b => R.M[a][b].toFixed(2)).join(','))).join('\n') + '\n');
    for (const k in sheets) { fs.mkdirSync(base, {recursive: true}); fs.writeFileSync(`${base}/${k}.png`, Buffer.from(sheets[k].split(',')[1], 'base64')); fs.writeFileSync(`${base}/${k}-mascara.png`, Buffer.from(masks[k].split(',')[1], 'base64')); }
  }
  console.log(R.text.split('\n').slice(0, 24).join('\n'));
  if (errors.length) console.log('errores de pagina:', errors.slice(0, 3));
  if (R.ks.length < 2) { console.error('se necesitan al menos 2 definitivas medibles'); process.exitCode = 1; return; }
  if (R.over.length) {
    console.error(`FALLA: ${R.over.length} par(es) de definitivas con similitud >= ${SIM_MAX}:`); R.over.slice(0, 30).forEach(p => console.error(`  ${p.a} ~ ${p.b}: ${p.s.toFixed(3)}`));
    if (!process.env.INFO) process.exitCode = 1;
  } else console.log(`OK: ningun par con forma propia supera ${SIM_MAX} (${R.ks.length} definitivas en la matriz, deuda sin forma propia: ${R.debt.length} pares, pantalla completa: ${R.full.length}, excepciones explicitas: ${SIM_EXCEPTIONS.length}).`);
})().catch(e => { console.error(e); process.exitCode = 1; });
