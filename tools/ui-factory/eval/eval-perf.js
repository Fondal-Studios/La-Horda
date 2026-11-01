'use strict';
// Evaluador independiente (Módulo D) — carga + FPS intercalados (base / cand / cand?uf=0) y prueba de fugas ≥ 60 s.
// MODE=ab|leak  REPS=3  OUT=...  node eval-perf.js
const { sleep, launch, VPS, newPage, PROFILE, center, fs, path } = require('./lib');
const MODE = process.env.MODE || 'ab', REPS = +(process.env.REPS || 3), OUT = process.env.OUT;
const TARGETS = [['base', 'http://127.0.0.1:8882', ''], ['cand', 'http://127.0.0.1:8881', ''], ['cand-uf0', 'http://127.0.0.1:8881', '?uf=0']];
const INIT = () => {
  window.__tReady = null; window.__tCont = null;
  const iv = setInterval(() => { if (window.__tReady == null && typeof startRun === 'function') window.__tReady = performance.now(); const b = document.getElementById('title-continue-btn'); if (window.__tCont == null && b && !b.disabled) window.__tCont = performance.now(); if (window.__tReady != null && window.__tCont != null) clearInterval(iv); }, 5);
  // contadores de recursos vivos
  const T = { intervals: new Set(), timeouts: new Set(), listeners: 0, mo: 0, raf: 0 };
  window.__T = T;
  const si = window.setInterval, ci = window.clearInterval, st = window.setTimeout, ct = window.clearTimeout;
  window.setInterval = function (f, d, ...a) { const id = si.call(window, f, d, ...a); T.intervals.add(id); return id; };
  window.clearInterval = function (id) { T.intervals.delete(id); return ci.call(window, id); };
  window.setTimeout = function (f, d, ...a) { let id; id = st.call(window, function () { T.timeouts.delete(id); return typeof f === 'function' ? f.apply(this, arguments) : undefined; }, d, ...a); T.timeouts.add(id); return id; };
  window.clearTimeout = function (id) { T.timeouts.delete(id); return ct.call(window, id); };
  const aeL = EventTarget.prototype.addEventListener, reL = EventTarget.prototype.removeEventListener; const reg = new Map();
  EventTarget.prototype.addEventListener = function (t, f, o) { const k = t + '|' + (typeof o === 'object' ? !!o.capture : !!o); let m = reg.get(this); if (!m) { m = new Set(); reg.set(this, m); } const key = k + '|' + (f && (f.__id || (f.__id = Math.random()))); if (!m.has(key)) { m.add(key); T.listeners++; } return aeL.call(this, t, f, o); };
  EventTarget.prototype.removeEventListener = function (t, f, o) { const k = t + '|' + (typeof o === 'object' ? !!o.capture : !!o); const m = reg.get(this); const key = k + '|' + (f && f.__id); if (m && m.delete(key)) T.listeners--; return reL.call(this, t, f, o); };
  const MO = window.MutationObserver; window.MutationObserver = class extends MO { constructor(cb) { super(cb); T.mo++; } };
  const raf = window.requestAnimationFrame; let rafN = 0; window.requestAnimationFrame = function (f) { rafN++; T.raf = rafN; return raf.call(window, f); };
};
async function startMatch(page) {
  await page.evaluate(() => { PROFILE_DONE = 1; }).catch(() => { });
  await page.evaluate(() => { selectedClass = 'mago'; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'guerrero']; netMatch = null; startRun(3); setState('playing'); updateHUD(); });
}
async function fps(page, ms) {
  return page.evaluate(ms => new Promise(res => { const d = []; let last = performance.now(); const t0 = last; const f = t => { d.push(t - last); last = t; if (t - t0 < ms) requestAnimationFrame(f); else { const s = d.slice(1).sort((a, b) => a - b); const sum = s.reduce((a, b) => a + b, 0); res({ n: s.length, fpsAvg: +(1000 * s.length / sum).toFixed(1), p95ms: +s[Math.floor(s.length * .95)].toFixed(1), maxMs: +s[s.length - 1].toFixed(1), over33: s.filter(x => x > 33.4).length, over50: s.filter(x => x > 50).length }); } }; requestAnimationFrame(f); }), ms);
}
const pm = async cdp => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
(async () => {
  const browser = await launch(); const out = { mode: MODE, chromium: browser.version(), date: new Date().toISOString(), runs: [] };
  if (MODE === 'ab') {
    for (let rep = 0; rep < REPS; rep++) for (const [label, base, q] of TARGETS) for (const vn of ['844x390', '1280x800']) {
      const vp = VPS[vn]; const t0 = Date.now(); const { ctx, page, errors } = await newPage(browser, base, vp, { init: INIT, query: q });
      const load = await page.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return { startRunMs: Math.round(window.__tReady), continueMs: Math.round(window.__tCont), dcl: Math.round(n.domContentLoadedEventEnd), resources: performance.getEntriesByType('resource').length }; });
      await page.evaluate(PROFILE); const cdp = await ctx.newCDPSession(page); await cdp.send('Performance.enable');
      await startMatch(page); await sleep(1500);
      const m0 = await pm(cdp); const f = await fps(page, 8000); const m1 = await pm(cdp);
      const cpu = { scriptMs: Math.round((m1.ScriptDuration - m0.ScriptDuration) * 1000), taskMs: Math.round((m1.TaskDuration - m0.TaskDuration) * 1000), layoutMs: Math.round((m1.LayoutDuration - m0.LayoutDuration) * 1000), styleMs: Math.round((m1.RecalcStyleDuration - m0.RecalcStyleDuration) * 1000) };
      out.runs.push({ rep, label, vp: vn, load, fps: f, cpu, errors: errors.slice(0, 2) }); console.log(rep, label, vn, JSON.stringify(load), JSON.stringify(f), JSON.stringify(cpu));
      await ctx.close();
    }
  } else {
    for (const [label, base, q] of TARGETS) {
      const vp = VPS['844x390']; const { ctx, page, errors } = await newPage(browser, base, vp, { init: INIT, query: q }); await page.evaluate(PROFILE); const cdp = await ctx.newCDPSession(page); await cdp.send('Performance.enable');
      await startMatch(page); await sleep(1500);
      await page.evaluate(() => { enemies = []; spawnTimer = 1e9; levelTimer = 0; levelDuration = 1e9; player.energy = 1e4; player.hp = 1e9; player.maxHp = 1e9; });
      const samples = []; const c1 = await center(page, '#btn-s1'), cb = await center(page, '#btn-basic');
      const sample = async t => { const s = await page.evaluate(() => ({ intervals: __T.intervals.size, timeouts: __T.timeouts.size, listeners: __T.listeners, mo: __T.mo, raf: __T.raf, nodes: document.getElementsByTagName('*').length, uffx: document.querySelectorAll('.uf-fx').length, heapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null })); const m = await pm(cdp); samples.push({ t, ...s, scriptSec: +m.ScriptDuration.toFixed(2), taskSec: +m.TaskDuration.toFixed(2), jsListeners: m.JSEventListeners }); };
      await sample(0);
      for (let t = 1; t <= 66; t++) {
        // un toque a s1 y al ataque cada 2 s para ejercitar el adaptador
        if (t % 2 === 0) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cb.x, y: cb.y, id: 1 }] }); await sleep(120); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(880); } else await sleep(1000);
        if (t % 11 === 0) await sample(t);
      }
      out.runs.push({ label, samples, errors: errors.slice(0, 3) }); console.log(label, JSON.stringify(samples[samples.length - 1])); await ctx.close();
    }
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(out, null, 1)); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
