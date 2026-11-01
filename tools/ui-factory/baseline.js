'use strict';
/* ============================================================================================
   tools/ui-factory/baseline.js — LÍNEA BASE de interfaz de La Horda (Módulo A, fábrica UI/UX)
   Mide, sobre una copia del juego servida por HTTP, métricas REPRODUCIBLES y guarda evidencia.

   Uso:
     PHASE=baseline BASE_DIR=/tmp/uf-baseline OUT_DIR=docs/ui-factory/evidence/baseline node tools/ui-factory/baseline.js
   Variables (todas opcionales):
     PHASE      etiqueta (baseline | despues | ...) -> va dentro de metrics.json y del OUT_DIR por defecto   [baseline]
     BASE_DIR   carpeta del juego a medir (la que tiene index.html)                                          [/tmp/uf-baseline]
     OUT_DIR    carpeta de salida: metrics.json + <viewport>/<pantalla>.png                                  [<repo>/docs/ui-factory/evidence/<PHASE>]
     PORT       puerto del servidor http.server propio                                                       [libre al azar]
     SECTIONS   lista separada por comas: load,nav,hud,a11y,shots                                             [todas]
     TRIALS     repeticiones por botón/entrada en la sección hud                                              [3]
     CHAMPS     campeones del HUD                                                                             [mago,ilkan,nigromante]
     VIEWPORTS  p.ej. 844x390,667x375,1280x800  (el primero con DPR2 móvil, el último escritorio)             [844x390,667x375,1280x800]
     CHROMIUM_PATH                                                                                           [/opt/pw-browsers/chromium]
   Salida: OUT_DIR/metrics.json  (+ capturas si SECTIONS incluye shots).
   Para comparar: ejecutar contra otra versión (BASE_DIR distinto, PHASE=despues) y diffear los metrics.json.
   Condiciones: Chromium headless SIN GPU (render por software): los FPS son una cota inferior, no representan un móvil.
   ============================================================================================ */
const { spawn } = require('node:child_process'), path = require('node:path'), fs = require('node:fs'), net = require('node:net'), os = require('node:os');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }

const REPO = path.resolve(__dirname, '../..');
const PHASE = process.env.PHASE || 'baseline';
const BASE_DIR = path.resolve(process.env.BASE_DIR || '/tmp/uf-baseline');
const OUT_DIR = path.resolve(process.env.OUT_DIR || path.join(REPO, 'docs/ui-factory/evidence', PHASE));
const SECTIONS = (process.env.SECTIONS || 'load,nav,hud,a11y,shots').split(',').map(s => s.trim());
const TRIALS = +(process.env.TRIALS || 3);
const CHAMPS = (process.env.CHAMPS || 'mago,ilkan,nigromante').split(',');
const VIEWPORTS = (process.env.VIEWPORTS || '844x390,667x375,1280x800').split(',').map(s => { const [w, h] = s.split('x').map(Number); return { w, h, name: s, mobile: w < 1000 }; });
const MOBILE_VP = VIEWPORTS[0];
const DESK_VP = VIEWPORTS.find(v => !v.mobile) || { w: 1280, h: 800, name: '1280x800', mobile: false };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log('[baseline]', ...a);
const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const median = a => { const s = a.filter(x => x != null).sort((x, y) => x - y); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.max(0, Math.floor(p * (s.length - 1))))] : null; };
const round = (x, d = 1) => x == null ? null : Math.round(x * 10 ** d) / 10 ** d;

/* ---------- script inyectado en la página: grabador de fotogramas (firma de estilo por rAF) ---------- */
const INIT = () => {
  window.__rec = null;
  window.__startRec = (id) => {
    const el = document.getElementById(id); if (!el) return false;
    const ico = el.querySelector('.ico');
    const desc = [...el.querySelectorAll('*')].slice(0, 8);
    const sig = () => {
      const cs = getComputedStyle(el), ci = ico ? getComputedStyle(ico) : null;
      const pb = getComputedStyle(el, '::before'), pa = getComputedStyle(el, '::after');
      return { cls: el.className, transform: cs.transform, filter: cs.filter, boxShadow: cs.boxShadow,
        border: cs.borderTopColor + '|' + cs.borderTopStyle + '|' + cs.borderTopWidth,
        background: cs.backgroundColor + '|' + cs.backgroundImage, opacity: cs.opacity,
        ico: ci ? ci.transform + '|' + ci.filter + '|' + ci.opacity : '',
        pseudo: pb.content + pb.opacity + pb.backgroundColor + pb.boxShadow + pb.transform + '#' + pa.content + pa.opacity + pa.backgroundColor + pa.boxShadow + pa.transform,
        children: desc.map(d => { const c = getComputedStyle(d); return c.transform + c.filter + c.opacity + c.color + c.backgroundColor + c.boxShadow; }).join('~') };
    };
    const rec = { id, frames: [], downs: [], ups: [], keys: [], stop: false };
    rec.onDown = e => { if (el === e.target || el.contains(e.target)) rec.downs.push({ t: e.timeStamp, type: e.pointerType }); };
    rec.onUp = e => { if (rec.downs.length) rec.ups.push({ t: e.timeStamp, type: e.pointerType }); };
    rec.onKey = e => { rec.keys.push({ t: e.timeStamp, type: e.type, key: e.key, code: e.code }); };
    window.addEventListener('pointerdown', rec.onDown, true); window.addEventListener('pointerup', rec.onUp, true);
    window.addEventListener('keydown', rec.onKey, true); window.addEventListener('keyup', rec.onKey, true);
    const loop = () => { if (rec.stop) return; rec.frames.push({ t: performance.now(), s: sig(), anim: el.getAnimations().map(a => a.animationName || a.transitionProperty || '?').join(',') }); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    window.__rec = rec; return true;
  };
  window.__stopRec = () => {
    const r = window.__rec; if (!r) return null; r.stop = true;
    window.removeEventListener('pointerdown', r.onDown, true); window.removeEventListener('pointerup', r.onUp, true);
    window.removeEventListener('keydown', r.onKey, true); window.removeEventListener('keyup', r.onKey, true);
    window.__rec = null; return { frames: r.frames, downs: r.downs, ups: r.ups, keys: r.keys };
  };
  // marcas de carga
  window.__tReady = null; window.__tContinue = null;
  const iv = setInterval(() => {
    if (window.__tReady == null && typeof startRun === 'function') window.__tReady = performance.now();
    const b = document.getElementById('title-continue-btn');
    if (window.__tContinue == null && b && !b.disabled) window.__tContinue = performance.now();
    if (window.__tReady != null && window.__tContinue != null) clearInterval(iv);
  }, 5);
};

async function newPage(browser, BASE, vp, { dpr, touch = true, mobile, init, noSW = true } = {}) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: mobile ?? vp.mobile, hasTouch: touch,
    deviceScaleFactor: dpr ?? (vp.mobile ? 2 : 1), serviceWorkers: noSW ? 'block' : 'allow' });
  await ctx.addInitScript(INIT);
  if (init) await ctx.addInitScript(init);
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console.error: ' + m.text().slice(0, 200)); });
  await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded', timeout: 180000 });
  await page.waitForFunction(() => typeof startRun === 'function' && (() => { const b = document.getElementById('title-continue-btn'); return b && !b.disabled; })(), null, { timeout: 180000, polling: 50 });
  return { ctx, page, errors };
}
// perfil con campeón y tutoriales hechos (no cuenta para ninguna medición; es preparación)
const PROFILE = (champs) => (champs) => {
  for (const k of ['mago', 'ilkan', 'nigromante']) { const s = save.champions[k]; if (!s) continue; s.unlocked = true; s.level = Math.max(s.level || 1, 5); } // solo 3: desbloquear todos dispara el logro 'Escuadrón completo' (toast que ensucia las capturas)
  save.starterChosen = true; save.starterSkin = save.starterSkin || null; save.tut = save.tut || {};
  Object.assign(save.tut, { training: 1, basics: 1, b_move: 1, b_attack: 1, b_skill: 1, goalMission: 1, firstStory: 1, soloIntro: 1 });
  persistNow();
};
async function setupProfile(page) { await page.evaluate(PROFILE()); }

/* ---------- utilidades de DOM / toque ---------- */
async function center(page, sel) {
  return page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    if (!r.width || cs.display === 'none' || cs.visibility === 'hidden' || e.closest('.hidden')) return null; return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }, sel);
}
async function cdpTap(cdp, x, y) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
  await sleep(40);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
const gameState = page => page.evaluate(() => state);

/* ============================== A. CARGA + FPS ============================== */
async function secLoad(browser, BASE) {
  const out = { runs: [], fps: null };
  for (let i = 0; i < 3; i++) {
    const { ctx, page } = await newPage(browser, BASE, MOBILE_VP);
    const r = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] || {};
      const res = performance.getEntriesByType('resource');
      return { startRunReady_ms: window.__tReady, continueEnabled_ms: window.__tContinue, domContentLoaded_ms: nav.domContentLoadedEventEnd, loadEvent_ms: nav.loadEventEnd || null,
        resources: res.length, transferBytes: res.reduce((a, e) => a + (e.encodedBodySize || 0), 0), scripts: res.filter(e => e.initiatorType === 'script').length };
    });
    out.runs.push(r); await ctx.close();
  }
  out.startRunReady_ms_median = round(median(out.runs.map(r => r.startRunReady_ms)));
  out.continueEnabled_ms_median = round(median(out.runs.map(r => r.continueEnabled_ms)));
  out.note = 'navigationStart -> typeof startRun===\'function\' (marca por setInterval 5 ms). Servidor local por loopback (sin latencia de red) y contexto nuevo sin caché: es el piso de carga, no una carga real por 4G.';
  // FPS en partida 5 s a 844x390 con enemigos reales
  const { ctx, page, errors } = await newPage(browser, BASE, MOBILE_VP);
  await setupProfile(page);
  const fpsRes = await page.evaluate(async () => {
    selectedClass = 'mago'; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'guerrero']; netMatch = null; startRun(3); setState('playing');
    await new Promise(r => setTimeout(r, 1500)); // asentar
    const d = []; let last = performance.now(); const t0 = last;
    await new Promise(res => { const f = t => { const n = performance.now(); d.push(n - last); last = n; if (n - t0 < 5000) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
    return { d, enemies: (typeof enemies !== 'undefined') ? enemies.length : null };
  });
  const d = fpsRes.d.slice(1); const total = d.reduce((a, b) => a + b, 0);
  out.fps = { viewport: MOBILE_VP.name, dpr: 2, seconds: round(total / 1000, 2), frames: d.length, avg: round(d.length / (total / 1000)), p5: round(1000 / pct(d, 0.95)), min: round(1000 / Math.max(...d)),
    framesOver33ms: d.filter(x => x > 33.4).length, framesOver50ms: d.filter(x => x > 50).length, enemiesAtEnd: fpsRes.enemies,
    note: 'Chromium headless SIN GPU (SwiftShader/software). p5 = fps equivalente al percentil 95 de duración de cuadro. NO extrapolable a un móvil real.' };
  out.errors = errors.slice(0, 5); await ctx.close();
  { const r2 = await newPage(browser, BASE, MOBILE_VP, { dpr: 1 }); await setupProfile(r2.page);
    const f2 = await r2.page.evaluate(async () => { selectedClass = 'mago'; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'guerrero']; netMatch = null; startRun(3); setState('playing'); await new Promise(r => setTimeout(r, 1500));
      const d = []; let last = performance.now(); const t0 = last; await new Promise(res => { const f = () => { const n = performance.now(); d.push(n - last); last = n; if (n - t0 < 5000) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); }); return d; });
    const d2 = f2.slice(1), t2 = d2.reduce((a, b) => a + b, 0); out.fpsDpr1 = { viewport: MOBILE_VP.name, dpr: 1, avg: round(d2.length / (t2 / 1000)), p5: round(1000 / pct(d2, 0.95)), framesOver33ms: d2.filter(x => x > 33.4).length, note: 'mismo escenario con DPR 1: el costo de render por software escala con los píxeles' };
    await r2.ctx.close(); }
  return out;
}

/* ============================== B. NAVEGACIÓN (partida repetida) ============================== */
const NAV_CANDS = ['#hub-play-btn', '#run-intro .ri-go', '#run-intro:not(.hidden)', '#prep-start-btn', '#arena-go-btn', '#retry-btn', '#again-btn', '#victory-next-btn'];
async function navFlow(page, cdp, name, firstSel, order, opts = {}) {
  const taps = []; const t0 = Date.now(); let lastTap = 0, lastSig = '';
  const maxTaps = opts.maxTaps || 12, maxMs = opts.maxMs || 20000;
  const sigOf = () => page.evaluate(c => state + '|' + c.filter(s => { const e = document.querySelector(s); return e && e.getBoundingClientRect().width > 0 && !e.closest('.hidden'); }).join(','), NAV_CANDS);
  const tapSel = async sel => { const c = await center(page, sel); if (!c) return false; lastSig = await sigOf(); await cdpTap(cdp, c.x, c.y); lastTap = Date.now(); taps.push({ sel, atMs: lastTap - t0 }); return true; };
  if (!(await tapSel(firstSel))) return { name, error: 'no se encontró ' + firstSel };
  while (true) {
    if ((await gameState(page)) === 'playing') break;
    if (Date.now() - t0 > maxMs || taps.length >= maxTaps) return { name, reachedPlaying: false, error: 'no llegó a partida (tope de ' + maxTaps + ' toques / ' + maxMs + ' ms)', taps: taps.length, buttons: taps.map(t => t.sel), tapTimesMs: taps.map(t => t.atMs) };
    // un toque nuevo solo cuando la pantalla cambió tras el anterior (evita contar dobles toques propios) o pasó 1 s sin cambio (toque tragado)
    const changed = (await sigOf()) !== lastSig;
    if (Date.now() - lastTap > 520 && (changed || Date.now() - lastTap > 1000)) { for (const s of order) { if (await tapSel(s)) break; } }
    await sleep(25);
  }
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const total = Date.now() - t0;
  return { name, reachedPlaying: true, taps: taps.length, buttons: taps.map(t => t.sel), tapTimesMs: taps.map(t => t.atMs), totalMs_firstTap_to_playing: total, finalState: await gameState(page) };
}
async function secNav(browser, BASE) {
  const out = { viewport: MOBILE_VP.name, flows: [], note: 'Toques reales por CDP (Input.dispatchTouchEvent) sobre el centro del botón, un toque nuevo solo cuando la pantalla cambió y pasaron >=520 ms (la ficha de la arena ignora toques en sus primeros 450 ms: RUN_INTRO.t0 en js/ui/run-intro.js). SIN tiempo de reacción humano: es el piso mecánico impuesto por animaciones/guardas del juego. Excluye carga.' };
  const { ctx, page, errors } = await newPage(browser, BASE, MOBILE_VP);
  await setupProfile(page);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof startRun === 'function' && !document.getElementById('title-continue-btn').disabled, null, { timeout: 120000, polling: 50 });
  const cdp = await ctx.newCDPSession(page);
  // título -> hub (entrada; informativo)
  { const c = await center(page, '#title-continue-btn'); const t = Date.now(); await cdpTap(cdp, c.x, c.y); await page.waitForFunction(() => state === 'mainmenu'); out.titleToHub = { taps: 1, ms: Date.now() - t, buttons: ['#title-continue-btn'] }; }
  await sleep(500);
  // Flujo 1: hub -> partida
  const f1 = await navFlow(page, cdp, 'hub -> partida (JUGAR)', '#hub-play-btn', NAV_CANDS.slice(1)); out.flows.push(f1);
  // Flujo 2: derrota -> reintentar
  await sleep(800);
  await page.evaluate(() => { enemies = []; spawnTimer = 1e9; showGameOverScreen(); });
  await sleep(400);
  const f2 = await navFlow(page, cdp, 'pantalla de derrota -> partida (Reintentar)', '#retry-btn', NAV_CANDS.slice(1)); out.flows.push(f2);
  // Flujo 3: victoria -> siguiente / repetir
  await sleep(800);
  const v = await page.evaluate(() => { try { enemies = []; spawnTimer = 1e9; showVictoryScreen(); return state; } catch (e) { return 'ERR ' + e.message; } });
  await sleep(600);
  out.victoryButtonsVisible = await page.evaluate(() => ['victory-next-btn', 'again-btn', 'menu-btn-2'].filter(id => { const e = document.getElementById(id); return e && !e.classList.contains('hidden') && e.getBoundingClientRect().width > 0; }));
  const firstV = out.victoryButtonsVisible.includes('again-btn') ? '#again-btn' : '#victory-next-btn';
  const f3 = await navFlow(page, cdp, 'pantalla de victoria SINTÉTICA -> partida (' + firstV + ')', firstV, NAV_CANDS.slice(1), { maxTaps: 10, maxMs: 12000 }); f3.syntheticWarning = 'victoria forzada con showVictoryScreen(): la ceremonia de botín y el guardado real no se reproducen; tómese solo como cota'; out.flows.push(f3);
  out.victoryStateAfterShow = v; out.victorySteps = await page.evaluate(() => typeof VICTORY_STEPS !== 'undefined' ? VICTORY_STEPS.length : null); out.errors = errors.slice(0, 5);
  await ctx.close(); return out;
}

/* ============================== C. HUD ============================== */
const HUD_IDS = ['btn-basic', 'btn-s1', 'btn-s2', 'btn-s3', 'btn-ult', 'btn-emerg', 'btn-pact', 'btn-revive', 'pause-btn', 'mute-btn', 'joy-base'];
const PRESS_IDS = (process.env.BUTTONS || 'btn-basic,btn-s1,btn-s2,btn-s3,btn-ult,btn-emerg').split(',');
const KEYS = { 'btn-s1': { key: '1', label: '1' }, 'btn-s2': { key: '2', label: '2' }, 'btn-s3': { key: '3', label: '3' }, 'btn-ult': { key: 'r', label: 'R' }, 'btn-emerg': { key: 'q', label: 'Q' }, 'btn-basic': { key: ' ', label: 'Espacio' } };

function analyzeRecord(rec, pressT) {
  // máscara: propiedades que varían en reposo (animaciones infinitas) antes del primer toque
  const pre = rec.frames.filter(f => f.t < pressT - 10);
  const keys = Object.keys(rec.frames[0].s); const masked = [];
  for (const k of keys) if (new Set(pre.map(f => f.s[k])).size > 1) masked.push(k);
  const base = pre.length ? pre[pre.length - 1].s : rec.frames[0].s;
  const post = rec.frames.filter(f => f.t >= pressT);
  let first = null; const changedKeys = new Set();
  for (const f of post) { const ch = keys.filter(k => !masked.includes(k) && f.s[k] !== base[k]); if (ch.length) { first = first || { f, ch }; ch.forEach(k => changedKeys.add(k)); } }
  const idleAnim = pre.length ? pre[pre.length - 1].anim : '';
  if (idleAnim && !masked.includes('boxShadow')) masked.push('boxShadow'); // hordaEmber (listo) anima box-shadow en bucle: ahí no se puede distinguir presión de animación
  return { latencyMs: first ? first.f.t - pressT : null, firstChanged: first ? first.ch : [], changedKeysEver: [...changedKeys], maskedAnimated: masked, idleAnimations: idleAnim, preFrames: pre.length, postFrames: post.length };
}

async function hudPrepare(page, champ) {
  await page.evaluate(champ => {
    for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; }
    selectedClass = champ; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'guerrero']; netMatch = null; startRun(3); setState('playing'); updateHUD();
    window.__hudSet = (st) => {
      enemies = []; spawnTimer = 1e9; levelTimer = 0; if (typeof levelDuration !== 'undefined') levelDuration = Math.max(levelDuration, 1e9); player.alive = true; player.hp = player.maxHp; if (player.emergCharges != null) player.emergCharges = Math.max(player.emergCharges, 1);
      runLevel = Math.max(runLevel, typeof ULT_MIN_ARENA_LEVEL !== 'undefined' ? ULT_MIN_ARENA_LEVEL : 1);
      if (st === 'ready') { player.energy = 1e4; player.cds = [0, 0, 0]; player.ultCharge = player.ultMax; player.ultCd = 0; }
      if (st === 'cd') { player.energy = 1e4; player.cds = [7400, 7400, 7400]; player.cdTotal = [12000, 12000, 12000]; player.ultCharge = 0; }
      if (st === 'noen') { player.energy = 0; player.cds = [0, 0, 0]; player.ultCharge = player.ultMax; }
      if (typeof updateAbilityButtons === 'function') updateAbilityButtons(); updateHUD(); if (typeof updateSkillButtonStates === 'function') updateSkillButtonStates();
    };
    window.__hudSet('ready');
  }, champ);
  await sleep(700);
}

async function hudGeometry(page) {
  return page.evaluate(ids => {
    const boxes = [];
    for (const id of ids) {
      const el = document.getElementById(id); if (!el) { boxes.push({ id, present: false }); continue; }
      const cs = getComputedStyle(el), r = el.getBoundingClientRect();
      const visible = !(cs.display === 'none' || cs.visibility === 'hidden' || el.classList.contains('hidden') || !r.width);
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2; const top = visible ? document.elementFromPoint(cx, cy) : null;
      boxes.push({ id, present: true, visible, x: r.left, y: r.top, w: r.width, h: r.height, occluded: visible ? !(top && (top === el || el.contains(top))) : null, occluder: visible && top && !(top === el || el.contains(top)) ? (top.id || top.className || top.tagName) : null,
        offscreen: visible ? (r.left < -0.5 || r.top < -0.5 || r.right > innerWidth + 0.5 || r.bottom > innerHeight + 0.5) : null });
    }
    const vis = boxes.filter(b => b.visible), overlaps = [];
    for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) { const a = vis[i], b = vis[j];
      const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (ox > 1 && oy > 1) overlaps.push({ a: a.id, b: b.id, w: Math.round(ox), h: Math.round(oy) }); }
    // separación mínima entre botones de combate (px CSS)
    const combat = vis.filter(b => /^btn-/.test(b.id)); let minGap = null;
    for (let i = 0; i < combat.length; i++) for (let j = i + 1; j < combat.length; j++) { const a = combat[i], b = combat[j];
      const gx = Math.max(a.x - (b.x + b.w), b.x - (a.x + a.w)), gy = Math.max(a.y - (b.y + b.h), b.y - (a.y + a.h)); const g = Math.max(gx, gy); if (minGap == null || g < minGap) minGap = g; }
    return { vw: innerWidth, vh: innerHeight, boxes: boxes.map(b => ({ ...b, x: b.x && Math.round(b.x), y: b.y && Math.round(b.y), w: b.w && Math.round(b.w * 10) / 10, h: b.h && Math.round(b.h * 10) / 10 })), overlaps, minGapBetweenCombatButtons: minGap == null ? null : Math.round(minGap * 10) / 10,
      under44: vis.filter(b => b.w < 44 || b.h < 44).map(b => b.id + ' ' + Math.round(b.w) + 'x' + Math.round(b.h)) };
  }, HUD_IDS);
}

async function stateProbe(page, id) {
  return page.evaluate(id => { const el = document.getElementById(id); if (!el) return null; const cs = getComputedStyle(el), ov = el.querySelector('.cd-overlay'), ocs = ov ? getComputedStyle(ov) : null;
    return { cls: el.className, dataState: el.dataset.state || null, border: cs.borderTopColor + ' ' + cs.borderTopStyle, boxShadow: cs.boxShadow, opacity: cs.opacity, icoFilter: (el.querySelector('.ico') ? getComputedStyle(el.querySelector('.ico')).filter : ''),
      cdOverlayText: ov ? ov.textContent : null, cdOverlayShown: ocs ? ocs.display !== 'none' : false, ariaLabel: el.getAttribute('aria-label'), role: el.getAttribute('role'), tabindex: el.getAttribute('tabindex'), title: el.title ? el.title.slice(0, 60) : '' }; }, id);
}

async function pressTrial(page, cdp, id, kind, holdMs, settleMs = 650) {
  const c = await center(page, '#' + id); if (!c) return { error: 'no visible' };
  await page.evaluate(id => window.__startRec(id), id); await sleep(800);
  let pressT = null;
  if (kind === 'touch') {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] }); await sleep(holdMs);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } else {
    await page.mouse.move(c.x, c.y); await sleep(60); // hover previo (no cuenta)
    await page.mouse.down(); await sleep(holdMs); await page.mouse.up();
  }
  await sleep(settleMs);
  const rec = await page.evaluate(() => window.__stopRec());
  if (!rec || !rec.downs.length) return { error: 'sin pointerdown en el botón (¿tapado?)' };
  pressT = rec.downs[0].t; const an = analyzeRecord(rec, pressT);
  const upT = rec.ups.length ? rec.ups[0].t : pressT + holdMs;
  // estado sostenido: último fotograma antes de soltar vs reposo
  const keys = Object.keys(rec.frames[0].s); const preF = rec.frames.filter(f => f.t < pressT - 10); const base = preF.length ? preF[preF.length - 1].s : rec.frames[0].s;
  const heldF = rec.frames.filter(f => f.t > pressT + 80 && f.t < upT).pop();
  const held = heldF ? keys.filter(k => !an.maskedAnimated.includes(k) && heldF.s[k] !== base[k]) : [];
  // tras soltar: clases nuevas / animaciones distintas
  const postF = rec.frames.filter(f => f.t >= upT);
  const clsSeq = []; postF.forEach(f => { if (clsSeq[clsSeq.length - 1] !== f.s.cls) clsSeq.push(f.s.cls); });
  const animsAfter = [...new Set(postF.map(f => f.anim).filter(Boolean).flatMap(s => s.split(',')))];
  const animsBefore = [...new Set(preF.map(f => f.anim).filter(Boolean).flatMap(s => s.split(',')))];
  return { latencyMs: an.latencyMs != null ? round(an.latencyMs, 1) : null, firstChanged: an.firstChanged, changedKeysEver: an.changedKeysEver, maskedAnimated: an.maskedAnimated, idleAnimations: an.idleAnimations,
    heldChangedKeys: held, classSequenceAfterRelease: clsSeq.slice(0, 6), animationsDuringTrialNew: animsAfter.filter(a => !animsBefore.includes(a)) };
}


// diferencia de píxeles real (captura del botón en reposo x2 = ruido de animaciones; y con el dedo apoyado)
async function pixelDelta(page, cdp, id, kind) {
  const c = await center(page, '#' + id); if (!c) return null;
  const r = await page.evaluate(id => { const b = document.getElementById(id).getBoundingClientRect(); return { x: Math.max(0, b.left - 6), y: Math.max(0, b.top - 6), width: b.width + 12, height: b.height + 12 }; }, id);
  await page.evaluate(() => { document.getElementById('game').style.visibility = 'hidden'; }); // sin el canvas detrás: solo cambios del DOM del botón
  const A = await page.screenshot({ clip: r }); await sleep(180); const B = await page.screenshot({ clip: r });
  if (kind === 'touch') await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] }); else { await page.mouse.move(c.x, c.y); await page.mouse.down(); }
  await sleep(220); const P = await page.screenshot({ clip: r });
  if (kind === 'touch') await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); else await page.mouse.up();
  await page.evaluate(() => { document.getElementById('game').style.visibility = ''; });
  const res = await page.evaluate(async ({ A, B, P }) => {
    const load = async b64 => { const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode(); const cv = document.createElement('canvas'); cv.width = i.width; cv.height = i.height; const g = cv.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, i.width, i.height).data; };
    const [a, b, p] = [await load(A), await load(B), await load(P)];
    const diff = (x, y) => { let n = 0, sum = 0; for (let i = 0; i < x.length; i += 4) { const d = Math.abs(x[i] - y[i]) + Math.abs(x[i + 1] - y[i + 1]) + Math.abs(x[i + 2] - y[i + 2]); if (d > 36) n++; sum += d; } return { pct: Math.round(n * 1000 / (x.length / 4)) / 10, meanAbs: Math.round(sum / (x.length / 4) / 3 * 10) / 10 }; };
    return { idleNoise: diff(a, b), pressedVsIdle: diff(a, p) };
  }, { A: A.toString('base64'), B: B.toString('base64'), P: P.toString('base64') });
  res.verdict = res.pressedVsIdle.pct > res.idleNoise.pct + 2 ? 'cambio visible (supera el ruido de reposo)' : 'sin cambio visible distinguible del reposo';
  return res;
}

async function keyTrial(page, id, kcfg, champ) {
  await page.evaluate(() => window.__hudSet('ready')); await sleep(650);
  const before = await page.evaluate(() => ({ cds: [...player.cds], ult: player.ultCharge, energy: player.energy, hp: player.hp, charges: player.emergCharges, held: typeof basicHeld !== 'undefined' ? basicHeld : null }));
  if (id === 'btn-emerg') await page.evaluate(() => { player.hp = player.maxHp * 0.4; });
  await page.evaluate(id => window.__startRec(id), id); await sleep(300);
  await page.keyboard.down(kcfg.key); await sleep(id === 'btn-basic' ? 200 : 60);
  const mid = await page.evaluate(() => ({ cds: [...player.cds], ult: player.ultCharge, charges: player.emergCharges, hp: player.hp, held: typeof basicHeld !== 'undefined' ? basicHeld : null }));
  await sleep(id === 'btn-basic' ? 200 : 100); await page.keyboard.up(kcfg.key); await sleep(600);
  const after = await page.evaluate(() => ({ cds: [...player.cds], ult: player.ultCharge, charges: player.emergCharges, held: typeof basicHeld !== 'undefined' ? basicHeld : null, st: state }));
  const rec = await page.evaluate(() => window.__stopRec());
  const kd = rec && rec.keys.find(k => k.type === 'keydown');
  let latency = null, changed = [];
  if (kd) { const an = analyzeRecord(rec, kd.t); latency = an.latencyMs != null ? round(an.latencyMs, 1) : null; changed = an.changedKeysEver; }
  const idx = { 'btn-s1': 0, 'btn-s2': 1, 'btn-s3': 2 }[id];
  let effect = false;
  if (idx != null) effect = after.cds[idx] > 0 || mid.cds[idx] > 0;
  else if (id === 'btn-ult') effect = mid.ult < before.ult || after.ult < before.ult;
  else if (id === 'btn-emerg') effect = (mid.charges != null && before.charges != null && mid.charges < before.charges) || mid.hp > before.hp * 0.4 + 1 || (after.charges != null && after.charges < before.charges);
  else if (id === 'btn-basic') effect = mid.held === true;
  return { key: kcfg.label, gameReacted: !!effect, visualLatencyMs: latency, visualChangedKeys: changed, stateAfter: after.st };
}

async function secHud(browser, BASE) {
  const out = { trialsPerCell: TRIALS, note: 'Latencia = event.timeStamp(pointerdown | keydown) -> primer rAF con cambio de firma de estilo computado (clase, transform, filter, box-shadow, border, background, opacity, .ico) sobre el botón. Propiedades que ya varían en reposo (animaciones infinitas de "listo") se enmascaran. rAF headless a ~60 Hz: el piso es ~0-16 ms por vsync. Chromium headless sin GPU; el timeStamp de eventos CDP lo fija el navegador al procesar, no un dedo real.', cells: [] };
  for (const vp of VIEWPORTS) {
    const { ctx, page, errors } = await newPage(browser, BASE, vp, { touch: true });
    const cdp = await ctx.newCDPSession(page);
    for (const champ of CHAMPS) {
      log('hud', vp.name, champ);
      await hudPrepare(page, champ);
      const cell = { viewport: vp.name, champ, geometry: await hudGeometry(page), buttons: {} };
      cell.classKey = await page.evaluate(() => player.classKey);
      for (const id of PRESS_IDS) {
        const b = { states: {}, touch: [], mouse: [] };
        // estados visibles
        const sigs = {};
        for (const st of ['ready', 'cd', 'noen']) { await page.evaluate(st => window.__hudSet(st), st); await sleep(550); b.states[st] = await stateProbe(page, id); sigs[st] = b.states[st] && [b.states[st].cls.replace(/\bready-pop\b|\bsec\b/g, '').trim(), b.states[st].border, b.states[st].boxShadow, b.states[st].icoFilter, b.states[st].opacity].join('|'); }
        b.stateDistinct = { readyVsCd: sigs.ready !== sigs.cd, readyVsNoEn: sigs.ready !== sigs.noen, cdVsNoEn: sigs.cd !== sigs.noen };
        b.cooldownVisible = !!(b.states.cd && b.states.cd.cdOverlayShown && b.states.cd.cdOverlayText);
        b.noEnergyState = !!(b.states.noen && /noen/.test(b.states.noen.cls));
        b.a11y = { ariaLabel: b.states.ready && b.states.ready.ariaLabel, role: b.states.ready && b.states.ready.role, tabindex: b.states.ready && b.states.ready.tabindex };
        // presión (siempre en estado listo)
        for (let i = 0; i < TRIALS; i++) { await page.evaluate(() => window.__hudSet('ready')); await sleep(650); b.touch.push(await pressTrial(page, cdp, id, 'touch', 90)); }
        if (!vp.mobile) for (let i = 0; i < TRIALS; i++) { await page.evaluate(() => window.__hudSet('ready')); await sleep(650); b.mouse.push(await pressTrial(page, page.mouse, id, 'mouse', 90)); }
        await page.evaluate(() => window.__hudSet('ready')); await sleep(650);
        b.touchHold = await pressTrial(page, cdp, id, 'touch', 700, 500);
        await page.evaluate(() => window.__hudSet('ready')); await sleep(650); b.pixelTouch = await pixelDelta(page, cdp, id, 'touch'); await sleep(500);
        // presión SIN recursos (cooldown): ¿hay retroalimentación de rechazo?
        await page.evaluate(() => window.__hudSet('cd')); await sleep(650);
        b.touchWhileCooldown = id === 'btn-basic' ? null : await pressTrial(page, cdp, id, 'touch', 90);
        await page.evaluate(() => window.__hudSet('noen')); await sleep(650);
        b.touchWhileNoEnergy = id === 'btn-basic' ? null : await pressTrial(page, cdp, id, 'touch', 90);
        const lat = a => a.map(t => t.latencyMs).filter(x => x != null);
        b.summary = { touchLatencyMs_median: median(lat(b.touch)), touchLatencyMs_max: lat(b.touch).length ? Math.max(...lat(b.touch)) : null, touchDetected: lat(b.touch).length + '/' + b.touch.length,
          mouseLatencyMs_median: median(lat(b.mouse)), mouseLatencyMs_max: lat(b.mouse).length ? Math.max(...lat(b.mouse)) : null, mouseDetected: b.mouse.length ? lat(b.mouse).length + '/' + b.mouse.length : 'no medido (solo escritorio)',
          pixelPressVerdict: b.pixelTouch && b.pixelTouch.verdict, pixelPressedPct: b.pixelTouch && b.pixelTouch.pressedVsIdle.pct, pixelIdleNoisePct: b.pixelTouch && b.pixelTouch.idleNoise.pct,
          heldStateVisible: !!(b.touchHold && b.touchHold.heldChangedKeys && b.touchHold.heldChangedKeys.length), heldKeys: b.touchHold && b.touchHold.heldChangedKeys,
          rejectFeedbackCooldown: !!(b.touchWhileCooldown && b.touchWhileCooldown.latencyMs != null), rejectFeedbackNoEnergy: !!(b.touchWhileNoEnergy && b.touchWhileNoEnergy.latencyMs != null),
          pressFirstChangedProps: [...new Set(b.touch.flatMap(t => t.firstChanged || []))],
          executionConfirmClasses: [...new Set(b.touch.flatMap(t => t.classSequenceAfterRelease || []))].slice(0, 6), newAnimationsAfterRelease: [...new Set(b.touch.flatMap(t => t.animationsDuringTrialNew || []))] };
        // teclado
        const k = KEYS[id]; b.keyboard = k ? await keyTrial(page, id, k, champ) : null;
        cell.buttons[id] = b;
      }
      // pacto del nigromante (si existe)
      cell.pactVisible = await page.evaluate(() => { const e = document.getElementById('btn-pact'); return !!e && !e.classList.contains('hidden') && e.getBoundingClientRect().width > 0; });
      out.cells.push(cell);
    }
    out.errors = (out.errors || []).concat(errors.slice(0, 3)); await ctx.close();
  }
  return out;
}

/* ============================== D. ACCESIBILIDAD ============================== */
const MENU_SCREENS = {
  hub: () => { setState('mainmenu'); renderMainMenu(); },
  starter: () => { openStarterSelect(() => { }); },
  guardianes: () => { openGuardians(); },
  inventario: () => { openMyInventory(); },
  arenas: () => { setState('arenaselect'); renderArenaGrid(); },
  tienda: () => { setState('shop'); renderShop(); },
  modos: () => { setState('modeselect'); },
  sala: () => { setState('prep'); renderPrepSummary(); },
  codice: () => { openCodex(); }
};
async function showScreen(page, name) {
  await page.evaluate(() => { try { document.querySelectorAll('#run-intro').forEach(e => e.classList.add('hidden')); } catch (e) { } });
  await page.evaluate(fn => { const f = new Function('return ' + fn)(); f(); }, MENU_SCREENS[name].toString());
  await sleep(700);
}
async function targetAudit(page) {
  return page.evaluate(() => {
    const sel = 'button,a[href],input,select,textarea,summary,[role=button],[role=tab],[role=switch],[tabindex]:not([tabindex="-1"]),[onclick],.hub-tile,.starter-card,.arena-card,.hub-tab';
    const scr = [...document.querySelectorAll('.screen')].find(s => !s.classList.contains('hidden') && getComputedStyle(s).display !== 'none');
    const root = scr || document.body; const seen = new Set(); const items = [];
    root.querySelectorAll(sel).forEach(e => {
      if (seen.has(e)) return; seen.add(e); const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
      if (!r.width || !r.height || cs.display === 'none' || cs.visibility === 'hidden' || e.closest('.hidden') || cs.pointerEvents === 'none') return;
      if (r.bottom < 0 || r.right < 0 || r.left > innerWidth) return; // fuera de pantalla horizontal; el scroll vertical SÍ cuenta
      const label = (e.getAttribute('aria-label') || e.textContent || e.title || e.getAttribute('data-champ') || '').trim().replace(/\s+/g, ' ').slice(0, 30);
      items.push({ id: e.id || '', cls: (e.className && e.className.baseVal === undefined ? String(e.className) : '').split(' ').slice(0, 2).join('.'), tag: e.tagName.toLowerCase(), label, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 });
    });
    const small = items.filter(i => i.w < 44 || i.h < 44);
    return { screen: scr ? scr.id : null, total: items.length, under44: small.length, pctUnder44: items.length ? Math.round(small.length * 1000 / items.length) / 10 : null, minW: items.length ? Math.min(...items.map(i => i.w)) : null, minH: items.length ? Math.min(...items.map(i => i.h)) : null,
      offenders: small.sort((a, b) => Math.min(a.w, a.h) - Math.min(b.w, b.h)).slice(0, 14) };
  });
}
async function focusAudit(page, nMax = 14) {
  await page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur(); window.scrollTo(0, 0); window.__fseen = new WeakSet(); });
  const res = [];
  for (let i = 0; i < nMax; i++) {
    await page.keyboard.press('Tab'); await sleep(40);
    const r = await page.evaluate(() => {
      const e = document.activeElement; if (!e || e === document.body) return null;
      const sig = el => { const cs = getComputedStyle(el); return { outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, shadow: cs.boxShadow, border: cs.borderTopColor, bg: cs.backgroundColor, transform: cs.transform, filter: cs.filter }; };
      const on = sig(e), fv = e.matches(':focus-visible'); e.blur(); const off = sig(e); e.focus({ preventScroll: true });
      const hasOutline = on.outline.split(' ')[0] !== 'none' && parseFloat(on.outline.split(' ')[1]) > 0;
      const changed = Object.keys(on).filter(k => on[k] !== off[k]);
      const r = e.getBoundingClientRect(); const dup = window.__fseen.has(e); window.__fseen.add(e);
      return { dup, id: e.id || e.className || e.tagName, focusVisible: fv, hasOutline, changedProps: changed, visibleIndicator: changed.length > 0, inView: r.width > 0 && r.bottom > 0 && r.top < innerHeight };
    });
    if (!r) continue; if (r.dup) break; res.push(r);
  }
  return { tabbed: res.length, withVisibleIndicator: res.filter(r => r.visibleIndicator).length, withoutIndicator: res.filter(r => !r.visibleIndicator).map(r => r.id).slice(0, 10), sample: res.slice(0, 6) };
}
async function ariaAudit(page) {
  return page.evaluate(() => {
    const scr = [...document.querySelectorAll('.screen')].find(s => !s.classList.contains('hidden') && getComputedStyle(s).display !== 'none') || document.body;
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && getComputedStyle(e).visibility !== 'hidden' && !e.closest('.hidden'); };
    const name = e => (e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') && 'labelledby' || e.title || (e.textContent || '').trim() || (e.querySelector('img[alt]') || {}).alt || '').trim();
    const btns = [...scr.querySelectorAll('button,[role=button]')].filter(vis);
    const unnamed = btns.filter(b => !name(b));
    const iconOnly = btns.filter(b => name(b) && !b.getAttribute('aria-label') && /^[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]{1,3}$/.test((b.textContent || '').trim()));
    const imgs = [...scr.querySelectorAll('img')].filter(vis); const noAlt = imgs.filter(i => !i.hasAttribute('alt'));
    const clickDivs = [...scr.querySelectorAll('div,span,li')].filter(e => vis(e) && e.onclick && !e.getAttribute('role') && !e.closest('button'));
    return { screen: scr.id, role: scr.getAttribute('role'), ariaModal: scr.getAttribute('aria-modal'), labelled: !!(scr.getAttribute('aria-label') || scr.getAttribute('aria-labelledby')), buttons: btns.length, unnamedButtons: unnamed.length, unnamedSample: unnamed.slice(0, 5).map(b => b.id || b.className), iconOnlyWithoutAriaLabel: iconOnly.length,
      iconOnlySample: iconOnly.slice(0, 5).map(b => (b.id || b.className) + ':' + (b.textContent || '').trim()), images: imgs.length, imagesWithoutAlt: noAlt.length, clickableNonSemantic: clickDivs.length, ariaLiveRegionsInDoc: document.querySelectorAll('[aria-live],[role=status],[role=alert]').length,
      tabindexPositive: document.querySelectorAll('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])').length };
  });
}
async function contrastHub(page) {
  // texto principal del hub: fondo muestreado de una captura con el texto oculto (aprox.: fondos con degradado/sprite)
  const items = await page.evaluate(() => {
    const sels = ['.hub-play', '.hub-play *', '#hub-profile-btn', '.hub-tile-title', '.hub-tile-sub', '.hub-endless-txt b', '.hub-endless-sub', '.ui-icon-btn', '.hub-premium-btn', '#mainmenu-screen .hub-title', '#mainmenu-screen h1'];
    const out = []; const seen = new Set();
    sels.forEach(s => document.querySelectorAll('#mainmenu-screen ' + s.replace('#mainmenu-screen ', '')).forEach(e => {
      if (seen.has(e)) return; const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (!own) return; seen.add(e);
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e); if (!r.width || e.closest('.hidden') || cs.visibility === 'hidden') return; if (r.bottom < 0 || r.top > innerHeight) return;
      if (/rgba\(\d+, \d+, \d+, 0\)/.test(cs.color)) return; // glifos emoji/sprite: sin color de texto real
      out.push({ text: (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 28), cls: (e.id || String(e.className)).split(' ')[0], color: cs.color, size: parseFloat(cs.fontSize), weight: parseInt(cs.fontWeight) || 400, op: parseFloat(cs.opacity), x: r.left, y: r.top, w: r.width, h: r.height });
    })); return out.slice(0, 40);
  });
  // ocultar el texto y capturar
  await page.addStyleTag({ content: '#mainmenu-screen *{color:transparent!important;text-shadow:none!important;-webkit-text-stroke:0!important}' });
  await sleep(150); const buf = await page.screenshot(); await page.evaluate(() => { document.querySelectorAll('style').forEach(s => { if (s.textContent.startsWith('#mainmenu-screen *{color:transparent')) s.remove(); }); });
  const b64 = buf.toString('base64');
  const res = await page.evaluate(async ({ b64, items }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const k = img.width / innerWidth; const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const g = cv.getContext('2d'); g.drawImage(img, 0, 0);
    const lum = ([r, gg, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(gg) + 0.0722 * f(b); };
    const cr = (a, b) => { const x = Math.max(a, b), y = Math.min(a, b); return (x + 0.05) / (y + 0.05); };
    return items.map(it => {
      const m = it.color.match(/[\d.]+/g).map(Number); const fg = lum(m.slice(0, 3)); const a = m[3] == null ? 1 : m[3];
      const x = Math.max(0, Math.floor(it.x * k)), y = Math.max(0, Math.floor(it.y * k)), w = Math.max(1, Math.min(img.width - x, Math.floor(it.w * k))), h = Math.max(1, Math.min(img.height - y, Math.floor(it.h * k)));
      const d = g.getImageData(x, y, w, h).data; const ls = []; let sr = 0, sg = 0, sb = 0, n = 0;
      for (let i = 0; i < d.length; i += 4 * 3) { ls.push(lum([d[i], d[i + 1], d[i + 2]])); sr += d[i]; sg += d[i + 1]; sb += d[i + 2]; n++; }
      const meanL = lum([sr / n, sg / n, sb / n]); const ratios = ls.map(l => cr(fg, l)).sort((p, q) => p - q);
      const large = it.size >= 24 || (it.size >= 18.66 && it.weight >= 700);
      return { text: it.text, el: it.cls, fontPx: it.size, large, ratioMeanBg: Math.round(cr(fg, meanL) * 100) / 100, ratioWorst5pct: Math.round(ratios[Math.floor(ratios.length * 0.05)] * 100) / 100, need: large ? 3 : 4.5, fgAlpha: a, opacityEl: it.op };
    });
  }, { b64, items });
  return res.map(r => ({ ...r, passAA_mean: r.ratioMeanBg >= r.need, passAA_worst: r.ratioWorst5pct >= r.need }));
}
async function secA11y(browser, BASE) {
  const out = { note: 'Aproximado: foco por Tab en Chromium (la firma de estilo con y sin foco); contraste con fondo muestreado de la captura (texto oculto) y cociente WCAG; blancos <44 CSS px medidos por getBoundingClientRect en las pantallas indicadas. No sustituye una auditoría con lector de pantalla (no automatizable aquí).', viewports: {} };
  for (const vp of [MOBILE_VP, DESK_VP]) {
    const { ctx, page, errors } = await newPage(browser, BASE, vp); await setupProfile(page);
    const v = { targets: {}, aria: {}, focus: {}, contrast: null };
    for (const name of Object.keys(MENU_SCREENS)) {
      try { log('a11y', vp.name, name); await showScreen(page, name); v.targets[name] = await targetAudit(page); v.aria[name] = await ariaAudit(page); v.focus[name] = await focusAudit(page, 12); }
      catch (e) { v.targets[name] = { error: e.message.slice(0, 160) }; }
    }
    try { await showScreen(page, 'hub'); v.contrast = await contrastHub(page); v.contrastSummary = { n: v.contrast.length, failAA_mean: v.contrast.filter(c => !c.passAA_mean).length, failAA_worst: v.contrast.filter(c => !c.passAA_worst).length, lowest: v.contrast.slice().sort((a, b) => a.ratioWorst5pct - b.ratioWorst5pct).slice(0, 6) }; } catch (e) { v.contrast = { error: e.message }; }
    // HUD en partida: roles/etiquetas de los controles
    try { await hudPrepare(page, 'mago'); v.hudControls = await page.evaluate(ids => ids.map(id => { const e = document.getElementById(id); return e && { id, tag: e.tagName.toLowerCase(), role: e.getAttribute('role'), ariaLabel: e.getAttribute('aria-label'), tabindex: e.getAttribute('tabindex'), ariaPressed: e.getAttribute('aria-pressed') }; }).filter(Boolean), HUD_IDS);
      v.canvas = await page.evaluate(() => { const c = document.getElementById('game'); return { role: c.getAttribute('role'), ariaLabel: c.getAttribute('aria-label') }; });
      v.prefs = await page.evaluate(() => ({ prefsKeys: typeof PREFS !== 'undefined' ? Object.keys(PREFS) : null })); } catch (e) { v.hudControls = { error: e.message }; }
    out.viewports[vp.name] = v; out.errors = (out.errors || []).concat(errors.slice(0, 3)); await ctx.close();
  }
  return out;
}

/* ============================== E. CAPTURAS ============================== */
const SHOT_SCREENS = {
  'title-screen': async page => { await page.evaluate(() => setState('title')); },
  'mainmenu-screen': async page => { await page.evaluate(() => { setState('mainmenu'); renderMainMenu(); }); },
  'starter-screen': async page => { await page.evaluate(() => { openStarterSelect(() => { }); }); },
  'codex-screen': async page => { await page.evaluate(() => { openCodex(); }); },
  'inventory-screen': async page => { await page.evaluate(() => { openMyInventory(); }); },
  'shop-screen': async page => { await page.evaluate(() => { setState('shop'); renderShop(); }); },
  'modeselect-screen': async page => { await page.evaluate(() => { setState('modeselect'); }); },
  'arenaselect-screen': async page => { await page.evaluate(() => { setState('arenaselect'); renderArenaGrid(); }); },
  'prep-screen': async page => { await page.evaluate(() => { setState('prep'); renderPrepSummary(); }); },
  'pause-screen': async page => { await page.evaluate(() => { selectedClass = 'mago'; currentArena = 'bosque'; lobbyAllies = ['tanque']; netMatch = null; startRun(3); setState('playing'); enemies = []; spawnTimer = 1e9; }); await sleep(500); const c = await center(page, '#pause-btn'); if (c) { await page.mouse.click(c.x, c.y); } else await page.evaluate(() => setState('paused')); },
  'gameover-screen': async page => { await page.evaluate(() => { selectedClass = 'mago'; currentArena = 'bosque'; lobbyAllies = ['tanque']; netMatch = null; startRun(3); setState('playing'); enemies = []; spawnTimer = 1e9; showGameOverScreen(); }); },
  'victory-screen': async page => { await page.evaluate(() => { selectedClass = 'mago'; currentArena = 'bosque'; lobbyAllies = ['tanque']; netMatch = null; startRun(3); setState('playing'); enemies = []; spawnTimer = 1e9; showVictoryScreen(); }); },
  'hud-playing': async page => { await page.evaluate(() => { selectedClass = 'mago'; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte']; netMatch = null; startRun(3); setState('playing'); updateHUD(); }); await sleep(1500); }
};
async function secShots(browser, BASE) {
  const out = { files: [], errors: [] };
  for (const vp of [MOBILE_VP, DESK_VP]) {
    const dir = path.join(OUT_DIR, vp.name); fs.mkdirSync(dir, { recursive: true });
    const { ctx, page, errors } = await newPage(browser, BASE, vp, { dpr: vp.mobile ? 2 : 1 });
    await setupProfile(page);
    for (const [name, fn] of Object.entries(SHOT_SCREENS)) {
      try {
        await page.evaluate(() => { document.querySelectorAll('#run-intro').forEach(e => e.classList.add('hidden')); });
        if (name === 'title-screen') { await fn(page); await sleep(900); } else { await fn(page); await sleep(900); }
        const f = path.join(dir, name + '.png'); await page.screenshot({ path: f }); out.files.push(path.relative(REPO, f));
        out.files.length;
        // y siempre vuelve al hub entre pantallas
        await page.evaluate(() => { try { setState('mainmenu'); } catch (e) { } }); await sleep(150);
      } catch (e) { out.errors.push(vp.name + ' ' + name + ': ' + e.message.slice(0, 150)); }
    }
    // secuencia del botón de habilidad (mago, s1) solo en el viewport móvil
    if (vp === MOBILE_VP) {
      const seqDir = path.join(dir, 'ability-sequence'); fs.mkdirSync(seqDir, { recursive: true });
      const cdp = await ctx.newCDPSession(page);
      await hudPrepare(page, 'mago');
      const clipOf = async () => page.evaluate(() => { const r = [...document.querySelectorAll('#btn-s1,#btn-s2,#btn-s3,#btn-ult,#btn-basic')].map(e => e.getBoundingClientRect());
        const x = Math.max(0, Math.min(...r.map(b => b.left)) - 8), y = Math.max(0, Math.min(...r.map(b => b.top)) - 8), x2 = Math.min(innerWidth, Math.max(...r.map(b => b.right)) + 8), y2 = Math.min(innerHeight, Math.max(...r.map(b => b.bottom)) + 8); return { x, y, width: x2 - x, height: y2 - y }; });
      const shot = async n => { const f = path.join(seqDir, n + '.png'); await page.screenshot({ path: f, clip: await clipOf() }); out.files.push(path.relative(REPO, f)); };
      // reposo: listo, sin tocar, animación de "listo" ya asentada
      await page.evaluate(() => window.__hudSet('ready')); await sleep(1200); await shot('1-reposo');
      // presionado: touchStart sostenido sobre s1
      const c = await center(page, '#btn-s1');
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] }); await sleep(250); await shot('2-presionado-touchstart-sostenido');
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(100);
      { const cb = await center(page, '#btn-basic'); const bclip = await page.evaluate(() => { const b = document.getElementById('btn-basic').getBoundingClientRect(); return { x: b.left - 8, y: b.top - 8, width: b.width + 16, height: b.height + 16 }; });
        const fr = path.join(seqDir, '2b-ataque-reposo.png'); await page.screenshot({ path: fr, clip: bclip }); out.files.push(path.relative(REPO, fr));
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cb.x, y: cb.y, id: 1 }] }); await sleep(250);
        const fp = path.join(seqDir, '2c-ataque-presionado.png'); await page.screenshot({ path: fp, clip: bclip }); out.files.push(path.relative(REPO, fp));
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(100); }
      // cooldown
      await page.evaluate(() => window.__hudSet('cd')); await sleep(700); await shot('4-cooldown');
      // listo (recién recuperado: cd -> ready dispara ready-pop)
      await page.evaluate(() => window.__hudSet('ready')); await sleep(120); await shot('3-listo-recien-recuperado-ready-pop');
      // sin energía
      await page.evaluate(() => window.__hudSet('noen')); await sleep(700); await shot('5-sin-energia');
      // pantalla completa de referencia
      await page.evaluate(() => window.__hudSet('ready')); await sleep(900); const ff = path.join(seqDir, '0-hud-completo.png'); await page.screenshot({ path: ff }); out.files.push(path.relative(REPO, ff));
    }
    out.errors = out.errors.concat(errors.slice(0, 3).map(e => vp.name + ' ' + e)); await ctx.close();
  }
  return out;
}

/* ============================== MAIN ============================== */
(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const port = +(process.env.PORT || await freePort());
  const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: BASE_DIR, stdio: 'ignore' });
  await sleep(700);
  const BASE = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const prev = (() => { try { return SECTIONS.length < 5 ? JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'metrics.json'), 'utf8')) : {}; } catch (e) { return {}; } })(); // ejecuciones parciales conservan las otras secciones
  const metrics = { ...prev, phase: PHASE, baseDir: BASE_DIR, date: new Date().toISOString(), env: { chromium: browser.version(), headless: true, gpu: 'none (software)', cpus: os.cpus().length, cpuModel: (os.cpus()[0] || {}).model, memGB: Math.round(os.totalmem() / 1e9), node: process.version, platform: os.platform() + ' ' + os.release() },
    viewports: VIEWPORTS.map(v => v.name), champs: CHAMPS, trials: TRIALS, sections: SECTIONS };
  try { metrics.gitHead = require('node:child_process').execSync('git -C ' + BASE_DIR + ' rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch (e) { }
  const run = async (key, fn) => { if (!SECTIONS.includes(key)) return; const t = Date.now(); log('>> sección', key); try { metrics[key] = await fn(browser, BASE); } catch (e) { metrics[key] = { error: e.stack || String(e) }; console.error(e); } log('<< sección', key, Math.round((Date.now() - t) / 1000) + 's'); fs.writeFileSync(path.join(OUT_DIR, 'metrics.json'), JSON.stringify(metrics, null, 1)); };
  try {
    await run('load', secLoad); await run('nav', secNav); await run('hud', secHud); await run('a11y', secA11y); await run('shots', secShots);
  } finally { await browser.close(); server.kill(); }
  fs.writeFileSync(path.join(OUT_DIR, 'metrics.json'), JSON.stringify(metrics, null, 1));
  log('listo ->', path.join(OUT_DIR, 'metrics.json'));
})().catch(e => { console.error(e); process.exitCode = 1; });
