'use strict';
// Evaluador: simplicidad del HUD (elementos visibles permanentes) y aviso de OBJETIVO (7 s, re-armado D2). BASE LABEL OUTDIR
const { sleep, launch, VPS, newPage, PROFILE, center, fs, path } = require('./lib');
const BASE = process.env.BASE, LABEL = process.env.LABEL, OUTDIR = process.env.OUTDIR; fs.mkdirSync(OUTDIR, { recursive: true });
const SCAN = () => {
  const roots = ['#hud', '.lanes-hud', '#col-hud', '#controls', '#pause-btn', '#mute-btn', '#goal-chip', '#ult-meter', '#center-banner', '#lanes-result'];
  const seen = new Set(), items = [];
  const vis = e => { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false; for (let p = e; p && p !== document.body; p = p.parentElement) { const c = getComputedStyle(p); if (c.display === 'none' || c.visibility === 'hidden' || parseFloat(c.opacity) === 0 || p.classList.contains('hidden')) return false; } return true; };
  for (const r of roots) document.querySelectorAll(r + ',' + r + ' *').forEach(e => {
    if (seen.has(e) || e.classList.contains('uf-fx') || e.classList.contains('uf-spr') || e.classList.contains('kh')) return; seen.add(e);
    if (!vis(e)) return; const b = e.getBoundingClientRect(); if (b.width < 4 || b.height < 4 || b.bottom < 0 || b.top > innerHeight || b.right < 0 || b.left > innerWidth) return;
    const own = [...e.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ');
    const key = e.matches('button,canvas,img,.ability-btn,#joy-base,input') || own;
    if (!key) return;
    items.push({ id: e.id || '', cls: String(e.className && e.className.baseVal === undefined ? e.className : '').split(' ').filter(x => !/^(hidden|ready|cd)$/.test(x)).slice(0, 2).join('.'), tag: e.tagName.toLowerCase(), text: own.slice(0, 40), x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), el: e });
  });
  const ov = [];
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) { const A = items[i], B = items[j]; if (A.el.contains(B.el) || B.el.contains(A.el)) continue; const ox = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x), oy = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y); if (ox > 3 && oy > 3) ov.push(`${A.id || A.cls || A.tag}"${A.text}" x ${B.id || B.cls || B.tag}"${B.text}" ${ox}x${oy}`); }
  const q = id => { const e = document.getElementById(id); return e ? { visible: vis(e), text: (e.textContent || '').trim().slice(0, 60) } : null; };
  return { n: items.length, overlaps: ov, items: items.map(({ el, ...r }) => r), goal: q('goal-chip'), ultMeter: q('ult-meter'), mute: q('mute-btn'), pause: q('pause-btn'), ultBtn: (() => { const e = document.getElementById('btn-ult'); return { cls: e.className, ring: (document.getElementById('ult-ring') || {}).style && document.getElementById('ult-ring').style.background.slice(0, 60) }; })(), body: document.body.className, mode: document.body.dataset.mode || '' };
};

const GOAL = () => { const e = document.getElementById('goal-chip'); if (!e) return null; const cs = getComputedStyle(e); return { hiddenClass: e.classList.contains('hidden'), vis: cs.visibility, op: +(+cs.opacity).toFixed(2), disp: cs.display, text: (e.textContent || '').slice(0, 50) }; };
(async () => {
  const browser = await launch(); const out = { label: LABEL, runs: {} };
  for (const vn of ['844x390', '1280x800']) for (const mode of ['campana', 'cristales', 'coliseo']) {
    const { ctx, page, errors } = await newPage(browser, BASE, VPS[vn]); await page.evaluate(PROFILE); const key = vn + ' ' + mode;
    try {
      await page.evaluate(m => { for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; } if (m === 'cristales') lanesStart({ champ: 'mago', size: 5 }); else if (m === 'coliseo') colStart({ champ: 'mago' }); else { selectedClass = 'mago'; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte']; netMatch = null; startRun(3); } setState('playing'); if (m === 'campana') { enemies = []; spawnTimer = 1e9; levelDuration = 1e9; } }, mode);
      const r = {}; await sleep(1200); r.t1 = await page.evaluate(SCAN); r.goal1 = await page.evaluate(GOAL);
      await sleep(5500); r.goal6 = await page.evaluate(GOAL); await sleep(4000); r.t10 = await page.evaluate(SCAN); r.goal10 = await page.evaluate(GOAL);
      await page.screenshot({ path: path.join(OUTDIR, `${LABEL}_${vn}_${mode}_t10.png`) });
      if (mode === 'campana') { await page.evaluate(() => { runLevel = GOAL_LEVELS; updateHUD(); }); await sleep(900); r.goalBoss = await page.evaluate(GOAL); await sleep(8000); r.goalBossLater = await page.evaluate(GOAL); }
      r.mute = await page.evaluate(() => { const e = document.getElementById('mute-btn'); return e ? getComputedStyle(e).display : null; });
      r.errors = errors.filter(e => !/fondalstudios|CORS|ERR_FAILED/.test(e)).slice(0, 3); out.runs[key] = r;
    } catch (e) { out.runs[key] = { error: String(e).slice(0, 250) }; }
    await ctx.close(); process.stdout.write('.');
  }
  fs.writeFileSync(path.join(OUTDIR, `${LABEL}_simple.json`), JSON.stringify(out, null, 1)); await browser.close(); console.log('\nlisto');
})().catch(e => { console.error(e); process.exit(1); });
