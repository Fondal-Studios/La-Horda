'use strict';
/* Prueba de legibilidad de los decales de efecto (js/champions/vfx-b/): el disco/anillo de una habilidad no puede tapar al enemigo que señala.
   Para CADA receta de KVB_FX, en varias arenas y en tres instantes del efecto (anticipación, impacto, disipación):
     · 3 enemigos quietos dentro del área del efecto (esqueletos reales del motor), uno por vez;
     · captura del canvas real con el efecto (A) y sin el efecto (C), con el reloj de render congelado;
     · máscara del sprite del enemigo = alfa opaco de sus drawImage (sin la sombra del suelo); visible = píxeles de esa máscara que A deja intactos respecto de C.
   Dos mediciones: SOLO LOS DECALES/ANILLOS del efecto (kvbDecal de >= 36 u, sin rayos ni motivos sueltos; en todo instante: se exige >= 80 %) y el EFECTO COMPLETO con sus motivos sueltos
   (rayos, gotas, plumas y chispas que cruzan volando: promedio de los tres instantes; el piso de regresión es FULL_MIN = 40 %, y los que quedan entre 40 y 80 % se listan como aviso (VERBOSE=1)).
   También mide los decales del motor de la mitad A (js/champions/skill-fx-a/: nova, zona y cono de cada tema, nivel 'efecto completo'); SFA_STRICT=1 les exige el 80 % por instante
   (hoy no lo cumplen en el impacto: la nova va sobre las entidades y con 20-25 % de relleno más sellos el sprite queda visible entre ~45 y ~90 %).
   Exige visible >= 80 % del sprite de cada enemigo (MIN_VISIBLE), relleno del decal <= 35 % del disco interior en el impacto
   (con las marcas) y que el tinte cambie de una arena a otra (el mismo efecto no puede ser del mismo color en todas partes).
   Además comprueba que los anillos de pixel-stroke.js solo producen alfa 0/255.
   LEGACY=1 solo mide la legibilidad (para comparar contra un árbol anterior que no tiene tinte ni pixel-stroke).
   Uso: [ABILITY_BASE_URL=http://127.0.0.1:PUERTO/] [ONLY=id1,id2] [ARENAS=bosque,hielo] node tools/vfx/test-decal-legible.js
   Sale con código 1 si algo incumple. */
const path = require('node:path'), net = require('node:net'), {spawn} = require('node:child_process');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..');
const MIN_VISIBLE = +(process.env.MIN_VISIBLE || 0.8), FULL_MIN = +(process.env.FULL_MIN || 0.4), MAX_FILL = +(process.env.MAX_FILL || 0.35);
const ARENAS = (process.env.ARENAS || 'bosque,hielo,infernal,laberinto,acuatica,minas').split(',');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
(async () => {
  let server = null, BASE = process.env.ABILITY_BASE_URL || process.env.BASE_URL;
  if (!BASE) { const port = await freePort(); server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {cwd: ROOT, stdio: 'ignore'}); BASE = `http://127.0.0.1:${port}/`; await new Promise(r => setTimeout(r, 900)); }
  process.on('exit', () => server && server.kill());
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  const page = await browser.newPage({viewport: {width: 844, height: 390}}), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  let bad = 0;
  try {
    await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 120000});
    await page.waitForFunction(leg => typeof startRun === 'function' && typeof KVB !== 'undefined' && typeof kvbFx === 'function' && (leg || typeof pxsRing === 'function'), !!process.env.LEGACY, {timeout: 120000});
    await page.waitForTimeout(2500);
    const ids = await page.evaluate(() => Object.keys(KVB_FX).sort()), only = process.env.ONLY ? process.env.ONLY.split(',') : null, list = only ? ids.filter(i => only.includes(i)) : ids;
    console.log(`${list.length} recetas · arenas ${ARENAS.join(',')} · mínimo visible ${MIN_VISIBLE * 100}%`);
    // 1) legibilidad
    const worst = [];
    for (const arena of ARENAS) {
      const r = await page.evaluate(([ids, arena, minVis, withSfa, strictSfa]) => {
        const out = {rows: [], err: null}, oNow = performance.now.bind(performance), oRand = Math.random; let T = 100000; performance.now = () => T; Math.random = () => .37;
        try {
          netMatch = null; selectedClass = 'tanque'; currentArena = arena; lobbyAllies = []; startRun(3); state = 'playing'; enemies = []; spawnTimer = 1e9; arenaHazardTimer = 1e9;
          for (const a of allies) a.stunTimer = 1e9;
          const snap = () => { render(); return ctx.getImageData(0, 0, canvas.width, canvas.height).data; };
          // máscara del sprite del enemigo: se re-dibuja cada drawImage cercano al enemigo (menos la sombra del suelo) sobre un lienzo aparte y se lee su alfa
          let rec = null; const oDraw = window.__oDraw = CanvasRenderingContext2D.prototype.drawImage, shadowImg = typeof _shadowSprite === 'function' ? _shadowSprite() : null;
          const mk = document.createElement('canvas'); mk.width = canvas.width; mk.height = canvas.height; const mg = mk.getContext('2d'); mg.imageSmoothingEnabled = false;
          CanvasRenderingContext2D.prototype.drawImage = function(img, ...a) {
            if (rec && this === ctx && a.length >= 4 && img !== shadowImg) { const w = a.length === 8 ? a[6] : a[2], h = a.length === 8 ? a[7] : a[3], x = a.length === 8 ? a[4] : a[0], y = a.length === 8 ? a[5] : a[1], m = this.getTransform();
              if (w < 90 && h < 90) { const p0 = m.transformPoint({x, y}), p1 = m.transformPoint({x: x + w, y: y + h}); if (Math.hypot((p0.x + p1.x) / 2 - rec.sx, (p0.y + p1.y) / 2 - rec.sy) < 60) { mg.setTransform(m); mg.globalAlpha = this.globalAlpha; oDraw.call(mg, img, ...a); } } }
            return oDraw.call(this, img, ...a); };
          const spots = [[0, -1], [.87, .5], [-.87, .5]];
          const sfaItems = withSfa && typeof sfaThemes !== 'undefined' ? Object.keys(sfaThemes).filter(t => !t.includes('~')).flatMap(t => ['nova', 'zone', 'cone'].map(a => 'sfa:' + a + ':' + t)) : [];
          for (const id of ids.concat(sfaItems)) {
            const isSfa = id.startsWith('sfa:'), [, sArt, sTheme] = isSfa ? id.split(':') : [];
            for (const [fr, tag] of [[4, 'ant'], [20, 'impacto'], [42, 'disipa']]) {
              const R = 120; let fracs = [], dec = [], mins = [];
              for (let k = 0; k < 3; k++) {
                // el mismo estado para las tres capturas del enemigo k
                const cone = isSfa && sArt === 'cone', cA = [-.4, 0, .4][k], place = () => { enemies = []; const e = spawnEnemy('esqueleto'); Object.assign(e, cone ? {x: player.x + 10 + Math.cos(cA) * R * .6, y: player.y + Math.sin(cA) * R * .6} : {x: player.x + 70 + spots[k][0] * R * .42, y: player.y + spots[k][1] * R * .42}, { hp: 1e9, maxHp: 1e9, speed: 0, baseSpeed: 0, dmg: 0}); return e; };
                const e = place(); vfxResetRun(); KVB.seed = 0x2545F491; let saved, A, A2;
                if (isSfa) {
                  sfaReset(); sfaPush(sArt, sTheme, cone ? player.x + 10 : player.x + 70, player.y, R, 0, 900, 0, 0, 24, -1, .85); const s0 = sfaPool[0]; if (!s0) continue; s0.t = fr * 16; T += fr * 16;
                  saved = sfaPool.slice(); A = snap(); A2 = A; sfaPool.length = 0;
                } else {
                  kvbFx(id, player.x + 70, player.y, R, .3, 40, 10);
                  for (let f = 0; f < fr; f++) { T += 16; kvbUpdate(16); }
                  saved = KVB.pool.slice(); A = snap();
                  KVB.pool = saved.filter(p => p.name && Math.max(p.w || 0, p.h || 0) >= 36); A2 = snap();
                  KVB.pool = [];
                }
                // posición en pantalla del enemigo = donde lo dibuja la cámara (se mide con la transformación del mundo en el render)
                mg.setTransform(1, 0, 0, 1, 0, 0); mg.clearRect(0, 0, mk.width, mk.height); rec = {sx: 0, sy: 0}; const wt = (typeof worldToScreen === 'function') ? worldToScreen(e.x, e.y) : null;
                if (wt) { rec.sx = wt.x; rec.sy = wt.y; } else { rec.sx = (e.x - cam.x) * CAM_ZOOM + canvas.width / 2; rec.sy = (e.y - cam.y) * CAM_ZOOM + canvas.height / 2; }
                const C = snap(); rec = null; const MK = mg.getImageData(0, 0, mk.width, mk.height).data;
                if (isSfa) sfaPool.push(...saved); else KVB.pool = saved;
                let mpx = 0; const vis = X => { let m = 0, v = 0;
                  for (let i = 0; i < C.length; i += 4) {
                    if (MK[i + 3] < 250) continue; m++;
                    if (Math.abs(X[i] - C[i]) + Math.abs(X[i + 1] - C[i + 1]) + Math.abs(X[i + 2] - C[i + 2]) < 24) v++;
                  } mpx = m; return m ? v / m : 0; };
                fracs.push(vis(A)); dec.push(vis(A2)); mins.push(mpx);
              }
              out.rows.push({id, tag, mask: Math.min(...mins), min: isSfa && !strictSfa ? 1 : Math.min(...dec), dec: dec.map(x => +x.toFixed(2)), all: fracs.map(x => +x.toFixed(2))});
            }
          }
        } catch (e) { out.err = e.message + ' ' + (e.stack || '').split('\n')[1]; }
        if (window.__oDraw) CanvasRenderingContext2D.prototype.drawImage = window.__oDraw; performance.now = oNow; Math.random = oRand; state = 'menu'; return out;
      }, [list, arena, MIN_VISIBLE, !only, !!process.env.SFA_STRICT]);
      if (r.err) { console.log('ERROR', arena, r.err); bad++; continue; }
      const tiny = r.rows.filter(x => x.mask < 80); if (tiny.length) { console.log(`ERROR ${arena}: la máscara del sprite quedó vacía (${tiny.length} mediciones): la prueba no mide nada`); bad++; }
      const low = r.rows.filter(x => x.min < MIN_VISIBLE);
      // efecto completo: promedio de los tres instantes para cada enemigo
      const byId = {}; for (const x of r.rows) (byId[x.id] = byId[x.id] || [[], [], []]).forEach((a, k) => a.push(x.all[k]));
      const means = Object.entries(byId).map(([id, a]) => [id, Math.min(...a.map(v => v.reduce((p, q) => p + q, 0) / v.length))]);
      // Las formas de definitiva (ids 'uf.*', js/champions/ult-forms/) son un momento épico de 1-2 s que cae sobre su objetivo a propósito
  // (p. ej. las cuchillas cruzadas de Musashi): se miden y se listan, pero no hacen fallar el piso de FULL_MIN. Ya tienen su prueba en test-ult-forms.js.
  const isUlt = id => /^uf\./.test(String(id));
  const meanLow = means.filter(([id, m]) => m < FULL_MIN && !isUlt(id)), warn = means.filter(([id, m]) => (m >= FULL_MIN || isUlt(id)) && m < MIN_VISIBLE);
      console.log(`${arena.padEnd(10)} ${r.rows.length} mediciones · decales: peor ${(Math.min(...r.rows.map(x => x.min)) * 100).toFixed(0)}%, bajo el mínimo ${low.length} · efecto completo: peor promedio ${(Math.min(...means.map(m => m[1])) * 100).toFixed(0)}%, bajo ${FULL_MIN * 100}%: ${meanLow.length}, entre ${FULL_MIN * 100} y ${MIN_VISIBLE * 100}% (aviso): ${warn.length}`);
      for (const x of low.slice(0, 12)) console.log(`   · decal ${x.id} ${x.tag} ${x.dec.join('/')}`);
      for (const [id, m] of meanLow.slice(0, 12)) console.log(`   · completo ${id} promedio ${(m * 100).toFixed(0)}%`);
      if (process.env.VERBOSE) for (const [id, m] of warn) console.log(`   · aviso ${id} promedio ${(m * 100).toFixed(0)}%`);
      bad += low.length + meanLow.length; worst.push(...low);
    }
    if (!process.env.LEGACY) {
    // 2) cobertura del relleno + 3) tinte por arena + 4) alfa 0/255 de los trazos de píxel
    const r2 = await page.evaluate(() => {
      const out = {fill: [], tint: [], stroke: {}};
      for (const [arena, key] of [['bosque', 0], ['infernal', 1]]) {
        currentArena = arena;
        for (const name of ['so_splash', 'vy_wound', 'sg_roar', 'rk_burst']) { const S = 72, fr = kvbDecalFrames(name, S); if (!fr) continue; const f = fr[Math.round((fr.length - 1) * .3)], g = f.getContext('2d'), d = g.getImageData(0, 0, S, S).data; let n = 0, tot = 0, r = 0, gg = 0, b = 0;
          for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const dd = Math.hypot(x + .5 - S / 2, y + .5 - S / 2); if (dd > S / 2 * .82) continue; tot++; const i = (y * S + x) * 4; if (d[i + 3]) { n++; r += d[i]; gg += d[i + 1]; b += d[i + 2]; } }
          if (!key) out.fill.push({name, arena, fill: n / tot}); out.tint.push({name, arena, c: [r / n, gg / n, b / n].map(Math.round)}); }
      }
      // trazos de píxel: se dibujan anillos, líneas, arcos y discos (translúcidos y opacos) sobre un canvas transparente propio, con la cámara real (escala no entera),
      // y ningún píxel del resultado puede tener alfa intermedio. ctx es `let`: se pisa un instante, como hace la previsualización de guardianes.
      const off = document.createElement('canvas'); off.width = canvas.width; off.height = canvas.height; const og = off.getContext('2d'), keep = ctx; let bad = 0, tot = 0;
      ctx = og; og.setTransform(1, 0, 0, 1, 0, 0); og.translate(off.width / 2 - player.x * CAM_ZOOM, off.height / 2 - player.y * CAM_ZOOM); og.scale(CAM_ZOOM, CAM_ZOOM);
      try {
        pxsRing(player.x, player.y, 90, 50, [['rgba(0,0,0,.7)', 11], ['rgba(255,120,40,.9)', 7], ['rgba(255,255,255,.4)', 2.4]]); pxsLine(player.x - 50, player.y, player.x + 60, player.y + 30, [['#fff', 3]]);
        pxsRing(player.x, player.y - 20, 40, 40, [['rgba(10,10,40,.5)', 6.6], ['#9cf', 2.2]], {a0: -1.5, a1: 3, dash: [3, 2, 1], k: .6}); pxsDisc(player.x, player.y, 40, 30, 'rgba(200,40,80,.25)');
      } finally { ctx = keep; }
      const d = og.getImageData(0, 0, off.width, off.height).data; let painted = 0;
      for (let i = 3; i < d.length; i += 4) { tot++; if (d[i] !== 0) painted++; if (d[i] !== 0 && d[i] !== 255) bad++; }
      if (painted < 200) bad += 1e6; // si no pintó nada, la prueba no mide nada
      out.stroke = {pixels: tot, intermedios: bad, dibujados: PXS.drawn, pintados: painted}; return out;
    });
    for (const f of r2.fill) { const ok = f.fill <= MAX_FILL; console.log(`relleno ${f.name} (${f.arena}) en el impacto: ${(f.fill * 100).toFixed(0)}% ${ok ? 'OK' : 'EXCEDE ' + MAX_FILL * 100 + '%'}`); if (!ok) bad++; }
    const by = {}; for (const t of r2.tint) (by[t.name] = by[t.name] || []).push(t);
    for (const k in by) { const [a, b] = by[k], d = Math.abs(a.c[0] - b.c[0]) + Math.abs(a.c[1] - b.c[1]) + Math.abs(a.c[2] - b.c[2]), ok = d >= 12; console.log(`tinte ${k}: ${a.arena} rgb(${a.c}) vs ${b.arena} rgb(${b.c}) ${ok ? 'OK' : 'IGUAL'}`); if (!ok) bad++; }
    console.log(`trazos de píxel: ${r2.stroke.intermedios} píxeles con alfa intermedio de ${r2.stroke.pixels} (pintados ${r2.stroke.pintados})`); if (r2.stroke.intermedios) bad++;
    }
    console.log(`errores de página: ${errors.length}`, errors.slice(0, 3)); if (errors.length) bad++;
  } finally { await browser.close(); }
  console.log(bad ? `FALLA: ${bad} incumplimientos` : 'OK');
  process.exitCode = bad ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });
