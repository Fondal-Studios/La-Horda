#!/usr/bin/env node
'use strict';
/* Prueba de las optimizaciones de bajo riesgo de RENDIMIENTO (fase de corrección de la beta). No mide tiempos (la CPU es
 * compartida y no hay GPU): cuenta cosas deterministas y comprueba que el resultado visible no cambió.
 *
 *   export NODE_PATH="server/node_modules:$(npm root -g)"
 *   node tools/perf/test-hud-throttle.js
 *   PERF_BASELINE_DIR=/ruta/con/los/originales node tools/perf/test-hud-throttle.js   # mismos conteos con los archivos de ANTES (no falla)
 *
 * PERF_BASELINE_DIR: carpeta con copias de js/assets/preload.js, js/core/canvas.js, js/ui/hud.js, js/rendering/pixel-stroke.js y
 * js/champions/skill-fx-a/engine.js (las que existan se sirven en lugar de las del árbol). Sirve para el "antes / después".
 *
 * Qué vigila:
 *  1. TÍTULO  (js/assets/preload.js): con js/main.js retenido hasta que terminó la 1ª tanda de imágenes, el botón del título
 *     sigue deshabilitado y la cola de arte diferido NO arrancó; cuando main corre, el botón se habilita y assetsAllReady() llega.
 *  2. HUD     (js/ui/hud.js): cuadros sin cambios de estado = 0 escrituras de `title`; con cambios, una escritura por valor
 *     distinto y la barra de vida/energía refleja el valor EN EL MISMO cuadro (no se bajó la frecuencia).
 *  3. CANVAS  (js/core/canvas.js): ensureCanvasSize() no lee clientWidth/clientHeight en cada cuadro, pero sigue corrigiendo el
 *     tamaño cuando cambia la ventana o la caja del canvas.
 *  4. TRAZOS  (js/rendering/pixel-stroke.js): la caché de colores no se satura; mismo valor por color; mismo píxel en un anillo.
 *  5. EFECTOS (js/champions/skill-fx-a/engine.js): volver a una arena ya jugada no vuelve a hornear; la caché de la arena en
 *     curso solo tiene claves de esa arena; clear() fuerza horneado; el recorte por bytes respeta el tope.
 */
const fs = require('node:fs'), path = require('node:path'), H = require('../lib/serve');
const BASE = process.env.PERF_BASELINE_DIR || '';
const SUBST = ['js/assets/preload.js', 'js/core/canvas.js', 'js/ui/hud.js', 'js/rendering/pixel-stroke.js', 'js/champions/skill-fx-a/engine.js'];
const LOAD_MS = 180000;
const fails = [], out = {modo: BASE ? 'ANTES (baseline)' : 'DESPUÉS (árbol)'};
const check = (name, ok, info) => { if (!ok) fails.push(name); console.log((ok ? 'ok   ' : (BASE ? 'base ' : 'FALLA')) + ' ' + name + (info === undefined ? '' : '  ' + JSON.stringify(info))); };

async function substitute(ctx) {
  if (!BASE) return;
  for (const rel of SUBST) {
    const f = path.join(BASE, rel); if (!fs.existsSync(f)) continue;
    await ctx.route(u => u.pathname.endsWith('/' + rel), r => r.fulfill({status: 200, contentType: 'text/javascript; charset=utf-8', body: fs.readFileSync(f, 'utf8')}));
  }
}

(async () => {
  const site = await H.startSite({envUrl: []});
  const browser = await H.launch();
  const errors = [];
  try {
    /* ---------- 1. carrera del título ---------- */
    {
      const ctx = await browser.newContext({viewport: {width: 1280, height: 720}});
      await ctx.addInitScript(() => { window.__lazyAssets = true; window.__campaignMode = true; try { performance.setResourceTimingBufferSize(8000); } catch (e) {} });
      await substitute(ctx);
      const page = await ctx.newPage(); page.on('pageerror', e => errors.push('titulo: ' + e.message));
      // js/main.js (el último script, el que llama a loadSave) se retiene hasta que la 1ª tanda terminó + 1,5 s: es el hueco
      // que en disco local duraba 2-3 s. Al soltarlo deja una foto del estado ANTES de ejecutar su primera línea.
      await page.route(u => u.pathname.endsWith('/js/main.js'), async route => {
        const t0 = Date.now();
        while (Date.now() - t0 < LOAD_MS) {
          const done = await page.evaluate(() => typeof ASSET_LOAD !== 'undefined' && ASSET_LOAD.core.total > 0 && ASSET_LOAD.core.done >= ASSET_LOAD.core.total).catch(() => false);
          if (done) break; await H.sleep(200);
        }
        await H.sleep(1500);
        const src = fs.readFileSync(path.join(H.ROOT, 'js/main.js'), 'utf8');
        const snap = 'window.__snap={dis:!!(document.getElementById("title-continue-btn")||{}).disabled,rest:ASSET_LOAD.restStarted,' +
          'started:Object.values(ASSET_LOAD.groups).filter(g=>g.started).length,core:ASSET_LOAD.core.total,' +
          'imgs:performance.getEntriesByType("resource").filter(e=>/\\.(png|webp|jpe?g)(\\?|$)/.test(e.name)).length,ready:(function(){try{return assetsAllReady();}catch(e){return "err";}})()};';
        if (!src.includes('"use strict";')) throw new Error('js/main.js sin "use strict"');
        await route.fulfill({status: 200, contentType: 'text/javascript; charset=utf-8', body: src.replace('"use strict";', '"use strict";' + snap)});
      });
      await H.goto(page, site.url + '/index.html', {timeout: LOAD_MS, waitUntil: 'domcontentloaded'});
      await page.waitForFunction(() => { const b = document.getElementById('title-continue-btn'); return b && !b.disabled; }, null, {timeout: LOAD_MS});
      const snap = await page.evaluate(() => window.__snap);
      out.titulo = snap;
      check('título: al empezar main.js el botón sigue deshabilitado', snap && snap.dis === true, snap);
      check('título: la cola de arte diferido no arrancó antes del guardado', snap && snap.rest === false && snap.started === 0);
      check('título: assetsAllReady() es false antes del guardado', snap && snap.ready === false);
      await page.waitForFunction(() => assetsAllReady(), null, {timeout: LOAD_MS});
      const after = await page.evaluate(() => ({rest: ASSET_LOAD.restStarted, txt: document.getElementById('title-continue-btn').textContent, state,
        waiters: ASSET_LOAD.waiters.length}));
      out.tituloDespues = after;
      check('título: contrato intacto (botón habilitado, restStarted, assetsAllReady)', after.rest === true && after.state === 'title', after);
      await ctx.close();
    }

    /* ---------- 2-5. en partida ---------- */
    const ctx = await browser.newContext({viewport: {width: 1280, height: 720}, deviceScaleFactor: 1});
    await ctx.addInitScript(() => { window.__campaignMode = true; });
    await substitute(ctx);
    const page = await ctx.newPage(); page.on('pageerror', e => errors.push('partida: ' + e.message));
    await H.goto(page, site.url + '/index.html', {timeout: LOAD_MS});
    await page.waitForFunction(() => { const b = document.getElementById('title-continue-btn'); return b && !b.disabled; }, null, {timeout: LOAD_MS});
    await page.addScriptTag({path: path.join(__dirname, '../playtest/autopilot.js')});
    await page.evaluate(() => { save.starterChosen = true; for (const k in save.champions) { save.champions[k].unlocked = true; save.champions[k].level = 30; } __AP.start('mago', 'bosque', 8); });
    await page.waitForFunction(() => state === 'playing' && typeof player !== 'undefined' && player && player.alive && typeof runElapsedMs === 'number' && runElapsedMs > 1500, null, {timeout: LOAD_MS});

    // se congela el loop real: desde acá cada "cuadro" lo dispara la prueba, con las mismas entradas siempre
    await page.evaluate(() => { try { __AP.on = false; } catch (e) {} loop = function () {}; });
    await H.sleep(300);

    /* ---------- 2. HUD ---------- */
    out.hud = await page.evaluate(() => {
      const recs = []; const mo = new MutationObserver(l => { for (const m of l) recs.push(m); });
      mo.observe(document.body, {subtree: true, childList: true, attributes: true, characterData: true});
      const flush = () => { for (const m of mo.takeRecords()) recs.push(m); const r = recs.splice(0); return r; };
      const label = m => { const t = m.target.nodeType === 1 ? m.target : m.target.parentElement; return m.type + (m.attributeName ? ':' + m.attributeName : '') + ' ' + (t ? (t.id ? '#' + t.id : t.nodeName.toLowerCase() + (typeof t.className === 'string' && t.className ? '.' + t.className.trim().split(/\s+/)[0] : '')) : '?'); };
      const tally = rs => { const by = {}; for (const m of rs) { const k = label(m); by[k] = (by[k] || 0) + 1; } return by; };
      player.maxHp = Math.max(player.maxHp, 1000); player.hp = player.maxHp; player.shield = 0; player.alive = true;
      for (let i = 0; i < 5; i++) updateHUD(); flush();
      // (a) 120 cuadros SIN cambios de estado
      const IDLE = 120; for (let i = 0; i < IDLE; i++) updateHUD();
      const idle = flush();
      // (b) 600 cuadros con cambios deterministas: vida en diente de sierra, energía regenerando, reloj y enfriamientos corriendo
      const N = 600, hpFill = document.getElementById('hp-fill'), enFill = document.getElementById('en-fill'), row = hpFill.closest('.bar-row');
      let late = 0, titleBad = 0, hpChanges = 0, titleChanges = 0, lastHp = hpFill.style.width, lastTitle = row.getAttribute('title');
      const cd0 = player.cds.slice(), tot0 = (player.cdTotal || [1, 1, 1]).slice();
      player.cdTotal = [3000, 5000, 8000];
      for (let i = 0; i < N; i++) {
        runElapsedMs += 16.667; if (typeof levelTimer === 'number') levelTimer += 16.667;
        player.hp = player.maxHp * (0.35 + 0.65 * (1 - (Math.floor(i / 12) % 20) / 20)); // un golpe cada 12 cuadros
        player.energy = player.maxEnergy * ((i * 0.004) % 1);
        player.cds = [Math.max(0, 3000 - i * 16.667), Math.max(0, 5000 - i * 16.667), Math.max(0, 8000 - i * 16.667)];
        updateHUD();
        const v = heroVitals(player), wantHp = (Math.round(v.hpPct * 10) / 10) + '%', wantEn = (Math.round(player.energy / player.maxEnergy * 100 * 2) / 2) + '%';
        if (hpFill.style.width !== wantHp || enFill.style.width !== wantEn) late++;
        const wantTitle = `Vida ${Math.ceil(v.hp)}/${Math.ceil(v.maxHp)}`;
        if (row.getAttribute('title') !== wantTitle) titleBad++;
        if (wantHp !== lastHp) { hpChanges++; lastHp = wantHp; } if (wantTitle !== lastTitle) { titleChanges++; lastTitle = wantTitle; }
      }
      const act = flush(); mo.disconnect();
      player.cds = cd0; player.cdTotal = tot0;
      const count = (rs, f) => rs.filter(f).length, isTitle = m => m.attributeName === 'title';
      return {idleFrames: IDLE, idleWrites: idle.length, idleTitleWrites: count(idle, isTitle), idleBy: tally(idle),
        frames: N, writes: act.length, perFrame: +(act.length / N).toFixed(2), titleWrites: count(act, isTitle), titleChanges,
        hpWrites: count(act, m => m.target.id === 'hp-fill'), hpChanges, late, titleBad,
        top: Object.entries(tally(act)).sort((a, b) => b[1] - a[1]).slice(0, 10)};
    });
    check('HUD: 0 escrituras de title en cuadros sin cambios', out.hud.idleTitleWrites === 0, {idleWrites: out.hud.idleWrites, idleBy: out.hud.idleBy});
    check('HUD: title y barra de vida se escriben solo cuando el valor cambia (ni más ni menos)', out.hud.titleWrites === out.hud.titleChanges && out.hud.hpWrites === out.hud.hpChanges, {titleWrites: out.hud.titleWrites, cambiosTitle: out.hud.titleChanges, hpWrites: out.hud.hpWrites, cambiosHp: out.hud.hpChanges, cuadros: out.hud.frames});
    check('HUD: vida y energía reflejan el valor en el mismo cuadro', out.hud.late === 0 && out.hud.titleBad === 0, {late: out.hud.late, titleBad: out.hud.titleBad});
    console.log('     HUD escrituras/cuadro con actividad: ' + out.hud.perFrame + '  top: ' + JSON.stringify(out.hud.top));

    /* ---------- 3. canvas ---------- */
    out.canvas = await page.evaluate(() => {
      let reads = 0; const undo = [];
      for (const n of ['clientWidth', 'clientHeight']) {
        const d = Object.getOwnPropertyDescriptor(Element.prototype, n);
        Object.defineProperty(Element.prototype, n, {configurable: true, get() { if (this === canvas) reads++; return d.get.call(this); }});
        undo.push(() => Object.defineProperty(Element.prototype, n, d));
      }
      ensureCanvasSize(); reads = 0;
      const N = 300; for (let i = 0; i < N; i++) ensureCanvasSize();
      undo.forEach(f => f());
      return {frames: N, layoutReads: reads, perFrame: +(reads / N).toFixed(3), VW, VH, box: [canvas.clientWidth, canvas.clientHeight], buf: [canvas.width, canvas.height]};
    });
    const recheck = await page.evaluate(() => CANVAS_BOX_RECHECK);
    check('canvas: lecturas de layout acotadas (≤ 2 por cada medición de control, no 2 por cuadro)', recheck >= 2 && out.canvas.layoutReads <= 2 * Math.ceil(out.canvas.frames / recheck) + 2 && out.canvas.layoutReads <= out.canvas.frames, Object.assign({recheck}, out.canvas));
    check('canvas: tamaño coherente con la caja', out.canvas.VW === out.canvas.box[0] && out.canvas.VH === out.canvas.box[1]);
    // la ventana cambia de tamaño: se corrige (evento resize)
    await page.setViewportSize({width: 1000, height: 600});
    const afterWin = await page.evaluate(() => new Promise(res => requestAnimationFrame(() => requestAnimationFrame(() => { ensureCanvasSize(); res({VW, VH, box: [canvas.clientWidth, canvas.clientHeight], buf: [canvas.width, canvas.height]}); }))));
    check('canvas: sigue el cambio de ventana', afterWin.VW === afterWin.box[0] && afterWin.VH === afterWin.box[1] && afterWin.VW === 1000 && afterWin.buf[0] === Math.round(afterWin.VW * await page.evaluate(() => DPR)), afterWin);
    // la CAJA cambia sin evento de ventana (lo que a veces hace iOS): se corrige en el cuadro siguiente al aviso del ResizeObserver
    const afterBox = await page.evaluate(() => new Promise(res => {
      const host = canvas.parentElement, old = host.style.cssText; host.style.width = '820px'; host.style.height = '500px';
      let n = 0; const tick = () => { ensureCanvasSize(); n++; const ok = VW === canvas.clientWidth && VH === canvas.clientHeight;
        if (ok || n >= 40) { const r = {frames: n, VW, VH, box: [canvas.clientWidth, canvas.clientHeight]}; host.style.cssText = old; requestAnimationFrame(() => requestAnimationFrame(() => { ensureCanvasSize(); r.back = [VW, VH, canvas.clientWidth, canvas.clientHeight]; res(r); })); }
        else requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }));
    out.canvasCaja = afterBox;
    check('canvas: sigue el cambio de la caja sin evento de ventana (≤ 3 cuadros)', afterBox.VW === afterBox.box[0] && afterBox.VH === afterBox.box[1] && afterBox.frames <= 3, afterBox);
    check('canvas: vuelve al tamaño original', afterBox.back[0] === afterBox.back[2] && afterBox.back[1] === afterBox.back[3], afterBox.back);
    await page.setViewportSize({width: 1280, height: 720});
    await page.evaluate(() => new Promise(res => requestAnimationFrame(() => requestAnimationFrame(() => { ensureCanvasSize(); res(); }))));

    /* ---------- 4. trazos de píxel ---------- */
    out.pxs = await page.evaluate(() => {
      // referencia independiente: la misma interpretación de color que tenía pxsParse antes del cambio
      const LE = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;
      const ref = c => { let r = 255, g = 255, b = 255, a = 1, m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(c);
        if (m) { r = +m[1]; g = +m[2]; b = +m[3]; a = m[4] === undefined ? 1 : +m[4]; }
        else if ((m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(c))) { const n = parseInt(m[1], 16); r = n >> 16 & 255; g = n >> 8 & 255; b = n & 255; a = m[2] ? parseInt(m[2], 16) / 255 : 1; }
        else if ((m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(c))) { r = parseInt(m[1] + m[1], 16); g = parseInt(m[2] + m[2], 16); b = parseInt(m[3] + m[3], 16); }
        r &= 255; g &= 255; b &= 255; return {c: LE ? ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0 : ((r << 24) | (g << 16) | (b << 8) | 255) >>> 0, lvl: Math.max(0, Math.min(1, a))}; };
      // cuántas veces se INTERPRETA un color (regex): es el costo que la caché debe evitar
      let parses = 0, inside = false; const ex = RegExp.prototype.exec;
      RegExp.prototype.exec = function (s) { if (inside && this.source.startsWith('^rgba?')) parses++; return ex.call(this, s); };
      let wrong = 0; const same = c => { inside = true; const a = pxsParse(c); inside = false; const b = ref(c); if (a.c !== b.c || a.lvl !== b.lvl) wrong++; };
      // un minuto de juego: 1500 colores de un solo uso (desvanecidos), después 50 colores fijos de una arena nueva usados 20 veces
      for (let i = 0; i < 1500; i++) same('rgba(255,200,0,' + (i / 1500).toFixed(4) + ')');
      const p0 = parses; parses = 0;
      for (let k = 0; k < 20; k++) for (let i = 0; i < 50; i++) same('rgba(' + i + ',10,20,0.5)');
      const fixed = parses; parses = 0;
      for (const c of ['#fff', '#12ab9f', '#12ab9f80', 'rgb(1,2,3)', 'rgba(300,2,3,0.25)', 'rgba(1,2,3,1e-7)', 'no-es-un-color', 'rgba( 10 , 20 , 30 , .5 )']) { same(c); same(c); }
      RegExp.prototype.exec = ex;
      const size = PXS.cache instanceof Map ? PXS.cache.size + (PXS.old ? PXS.old.size : 0) : Object.keys(PXS.cache).length;
      // píxel resultante: un anillo y un disco con tramado sobre un lienzo propio, y cuántos putImageData costaron
      const real = ctx, cv = document.createElement('canvas'); cv.width = 320; cv.height = 240; const g = cv.getContext('2d');
      let puts = 0; const put = CanvasRenderingContext2D.prototype.putImageData; CanvasRenderingContext2D.prototype.putImageData = function () { puts++; return put.apply(this, arguments); };
      ctx = g;
      try {
        pxsRing(160.3, 120.7, 90, 52, [['rgba(10,12,20,0.55)', 9], ['rgba(255,180,60,0.8)', 5], ['#fff6c8', 2]], {});
        pxsRing(100, 100, 40, 40, [['rgba(120,220,255,0.37)', 3]], {a0: .4, a1: 4.1, dash: [3, 2, 1]});
        pxsDisc(220, 150, 30, 18, 'rgba(255,60,60,0.42)');
        pxsLine(20, 20, 300, 200, [['#101018', 6], ['rgba(250,250,120,0.9)', 2]], {});
      } finally { ctx = real; CanvasRenderingContext2D.prototype.putImageData = put; }
      const d = g.getImageData(0, 0, 320, 240).data; let h = 2166136261 >>> 0, inter = 0, painted = 0;
      for (let i = 0; i < d.length; i++) { h ^= d[i]; h = Math.imul(h, 16777619) >>> 0; if (i % 4 === 3) { if (d[i] > 0) painted++; if (d[i] > 0 && d[i] < 255) inter++; } }
      return {parsesUnicos: p0, parsesFijos1000: fixed, valoresDistintos: wrong, cacheSize: size, putImageData4Trazos: puts, hash: h.toString(16), pintados: painted, alfaIntermedio: inter};
    });
    check('trazos: mismo valor por color que la interpretación de referencia', out.pxs.valoresDistintos === 0, out.pxs);
    check('trazos: 50 colores fijos usados 20 veces se interpretan una sola vez aunque la caché ya esté llena', out.pxs.parsesFijos1000 === 50, {parses: out.pxs.parsesFijos1000});
    check('trazos: caché acotada (≤ 512)', out.pxs.cacheSize <= 512, {size: out.pxs.cacheSize});
    check('trazos: píxel duro (sin alfa intermedio) y se dibujó', out.pxs.alfaIntermedio === 0 && out.pxs.pintados > 500);
    console.log('     trazos: hash de píxeles ' + out.pxs.hash + ' (debe coincidir entre ANTES y DESPUÉS), putImageData en 4 trazos: ' + out.pxs.putImageData4Trazos);

    /* ---------- 5. efectos horneados ---------- */
    out.sfa = await page.evaluate(() => {
      const jobs = [['nova', 'time', 64], ['zone', 'time', 64], ['burst', 'time', 48], ['aura', 'time', 0], ['beam', 'time', 16], ['cone', 'time', 64, .85]];
      const sig = cv => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let h = 2166136261 >>> 0; for (let i = 0; i < d.length; i++) { h ^= d[i]; h = Math.imul(h, 16777619) >>> 0; } return h; };
      const keep = currentArena, r = {seq: [], bounded: true};
      currentArena = 'bosque'; sfaCache.clear();
      const visit = a => { currentArena = a; const b0 = sfaStats.baked; const bs = jobs.map(j => sfaBake.apply(null, j));
        r.bounded = r.bounded && [...sfaCache.keys()].every(k => k.endsWith('|' + a)); r.seq.push([a, sfaStats.baked - b0]); return bs; };
      const first = visit('bosque'), h1 = first.map(b => sig(b.cv));
      visit('hielo'); visit('infernal');
      const back = visit('bosque'), h2 = back.map(b => sig(b.cv));
      r.samePixels = h1.every((h, i) => h === h2[i]); r.sameObjects = first.every((b, i) => b === back[i]);
      r.hot = (() => { const b0 = sfaStats.baked; jobs.forEach(j => sfaBake.apply(null, j)); return sfaStats.baked - b0; })();
      sfaCache.clear(); { const b0 = sfaStats.baked; visit('hielo'); r.afterClear = r.seq.pop()[1]; void b0; }
      r.cacheKeys = sfaCache.size;
      if (typeof sfaTrim === 'function') {
        const m = new Map(); for (let i = 0; i < 10; i++) m.set('k' + i, {cv: {width: 100, height: 25}, u: i === 3 ? 99 : i}); // 10 kB cada una
        const dropped = sfaTrim(m, 35000, b => b.u === 0); r.trim = {dropped, left: [...m.keys()], bytes: sfaMapBytes(m)};
        r.caps = {cache: SFA_CACHE_MAX_BYTES, stash: SFA_STASH_MAX_BYTES, stashNow: sfaMapBytes(sfaStash), cacheNow: sfaMapBytes(sfaCache)};
      }
      sfaCache.clear(); currentArena = keep; return r;
    });
    const bakes = out.sfa.seq.map(s => s[1]);
    check('efectos: la caché de la arena en curso solo tiene claves de esa arena', out.sfa.bounded === true);
    check('efectos: volver a una arena ya jugada no vuelve a hornear', bakes[3] === 0 && bakes[0] === 6 && bakes[1] === 6, {horneadosPorVisita: out.sfa.seq});
    check('efectos: mismos píxeles al volver', out.sfa.samePixels === true, {mismosObjetos: out.sfa.sameObjects});
    check('efectos: en caliente no hornea y clear() fuerza horneado', out.sfa.hot === 0 && out.sfa.afterClear === 6, {hot: out.sfa.hot, afterClear: out.sfa.afterClear});
    check('efectos: el recorte por bytes suelta los menos usados y respeta el tope', !!out.sfa.trim && out.sfa.trim.bytes <= 35000 && out.sfa.trim.left.join() === 'k0,k3,k9' && out.sfa.trim.dropped === 7 && out.sfa.caps.stashNow <= out.sfa.caps.stash, out.sfa.trim);

    check('sin errores de página', errors.length === 0, errors.slice(0, 5));
    await ctx.close();
  } finally {
    await browser.close(); await site.close();
  }
  console.log('\nRESUMEN ' + JSON.stringify(out));
  if (BASE) { console.log('\n(modo baseline: no falla; ' + fails.length + ' comprobaciones no se cumplen con los archivos de antes)'); return; }
  if (fails.length) { console.error('\nFALLARON ' + fails.length + ': ' + fails.join(' | ')); process.exit(1); }
  console.log('\nOK: todas las comprobaciones pasan');
})().catch(e => { console.error(e); process.exit(1); });
