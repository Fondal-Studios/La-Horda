'use strict';
// Evaluador (iteración 7): marcos pixel-art (UF-ART v1): solapes visibles, bordes, estados y ?uf=0. BASE LABEL OUTDIR
const { sleep, launch, VPS, newPage, PROFILE, center, fs, path } = require('./lib');
const BASE = process.env.BASE, LABEL = process.env.LABEL, OUTDIR = process.env.OUTDIR; fs.mkdirSync(OUTDIR, { recursive: true });
const IDS = ['btn-basic', 'btn-s1', 'btn-s2', 'btn-s3', 'btn-ult', 'btn-emerg', 'btn-pact'];
const GEO = () => {
  const vis = e => { for (let p = e; p && p !== document.body; p = p.parentElement) { const c = getComputedStyle(p); if (c.display === 'none' || c.visibility === 'hidden' || p.classList.contains('hidden')) return false; } return true; };
  const R = e => { const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; };
  const ov = (A, B) => ({ ox: Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x), oy: Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y) });
  const btns = {}, frames = {}; for (const id of ['btn-basic','btn-s1','btn-s2','btn-s3','btn-ult','btn-emerg','btn-pact']) { const e = document.getElementById(id); if (!e || !vis(e)) continue; btns[id] = R(e); const f = e.querySelector(':scope > .uf-frame'); if (f) frames[id] = R(f); }
  const others = {}; for (const [k, sel] of Object.entries({ joy: '#joy-base', pause: '#pause-btn', recall: '.ln-recall', chip: '.ln-chip', rival: '.ln-rival canvas', party: '#party', pill: '#hud .top-pill' })) { const e = document.querySelector(sel); if (e && vis(e)) { const r = R(e); if (r.w > 4) others[k] = r; } }
  const issues = [];
  const ids = Object.keys(frames);
  for (let i = 0; i < ids.length; i++) for (let j = 0; j < ids.length; j++) { if (i === j) continue; const o = ov(frames[ids[i]], btns[ids[j]]); if (o.ox > 1.5 && o.oy > 1.5) issues.push(`marco ${ids[i]} pisa cuerpo de ${ids[j]} ${Math.round(o.ox)}x${Math.round(o.oy)}`); if (j > i) { const o2 = ov(frames[ids[i]], frames[ids[j]]); if (o2.ox > 1.5 && o2.oy > 1.5) issues.push(`marco ${ids[i]} x marco ${ids[j]} ${Math.round(o2.ox)}x${Math.round(o2.oy)}`); } }
  for (const id of ids) for (const [k, r] of Object.entries(others)) { const o = ov(frames[id], r); if (o.ox > 1.5 && o.oy > 1.5) issues.push(`marco ${id} x ${k} ${Math.round(o.ox)}x${Math.round(o.oy)}`); }
  for (const id of ids) { const f = frames[id]; if (f.x < -0.5 || f.y < -0.5 || f.x + f.w > innerWidth + 0.5 || f.y + f.h > innerHeight + 0.5) issues.push(`marco ${id} fuera de pantalla`); }
  // cuerpos entre sí (control)
  const bi = Object.keys(btns); for (let i = 0; i < bi.length; i++) for (let j = i + 1; j < bi.length; j++) { const o = ov(btns[bi[i]], btns[bi[j]]); if (o.ox > 1.5 && o.oy > 1.5) issues.push(`CUERPO ${bi[i]} x ${bi[j]} ${Math.round(o.ox)}x${Math.round(o.oy)}`); }
  return { n: ids.length, issues, frameSizes: Object.fromEntries(ids.map(id => [id, [Math.round(frames[id].w), Math.round(frames[id].h)]])) };
};
(async () => {
  const browser = await launch(); const out = { label: LABEL, geo: {}, states: {}, ufoff: null };
  const modes = ['campana', 'zurdo', 'texto-grande', 'nigromante', 'cristales', 'coliseo'];
  for (const vn of ['667x375', '800x360', '844x390', '932x430', '1280x800']) for (const mode of modes) {
    const { ctx, page } = await newPage(browser, BASE, VPS[vn]); await page.evaluate(PROFILE);
    try {
      await page.evaluate(m => { if (m === 'zurdo') { PREFS.lefty = true; prefsApply(); } if (m === 'texto-grande') { PREFS.textLg = true; prefsApply(); } for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; }
        if (m === 'cristales') lanesStart({ champ: 'mago', size: 5 }); else if (m === 'coliseo') colStart({ champ: 'mago' }); else { selectedClass = m === 'nigromante' ? 'nigromante' : 'mago'; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'guerrero']; netMatch = null; startRun(3); enemies = []; spawnTimer = 1e9; levelDuration = 1e9; }
        setState('playing'); }, mode);
      await sleep(1800);
      // los marcos se crean al primer toque/observador: forzar una presión breve en cada botón
      await page.evaluate(() => { for (const id of ['btn-basic','btn-s1','btn-s2','btn-s3','btn-ult','btn-emerg','btn-pact']) { const e = document.getElementById(id); if (e) e.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 99, pointerType: 'touch' })), e && e.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 99, pointerType: 'touch' })); } }); await sleep(500);
      out.geo[`${vn} ${mode}`] = await page.evaluate(GEO);
      if ((vn === '667x375' && ['campana', 'cristales', 'zurdo', 'texto-grande'].includes(mode)) || (vn === '844x390' && ['campana', 'nigromante'].includes(mode))) await page.screenshot({ path: path.join(OUTDIR, `${LABEL}_${vn}_${mode}.png`) });
    } catch (e) { out.geo[`${vn} ${mode}`] = { error: String(e).slice(0, 200) }; }
    await ctx.close(); process.stdout.write('.');
  }
  // estados visuales (844x390, mago) en recortes
  { const { ctx, page } = await newPage(browser, BASE, VPS['844x390']); await page.evaluate(PROFILE); const cdp = await ctx.newCDPSession(page);
    await page.evaluate(() => { for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; } selectedClass = 'mago'; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte']; netMatch = null; startRun(3); setState('playing'); enemies = []; spawnTimer = 1e9; levelDuration = 1e9; runLevel = Math.max(runLevel, ULT_MIN_ARENA_LEVEL); player.hp = player.maxHp * .5; player.emergCharges = 2; updateHUD(); window.__set = st => { enemies = []; player.energy = st === 'noen' ? 0 : 1e4; player.cds = st === 'cd' ? [7400, 7400, 7400] : [0, 0, 0]; player.cdTotal = [12000, 12000, 12000]; player.ultCharge = st === 'cd' ? 0 : player.ultMax; player.ultCd = st === 'cd' ? 25000 : 0; if (st === 'locked') runLevel = 0; else runLevel = Math.max(runLevel, 3); updateAbilityButtons && updateAbilityButtons(); updateHUD(); updateSkillButtonStates && updateSkillButtonStates(); }; });
    await sleep(800); await page.evaluate(() => { document.getElementById('game').style.visibility = 'hidden'; });
    const clip = await page.evaluate(() => { const r = ['btn-basic','btn-s1','btn-s2','btn-s3','btn-ult','btn-emerg'].map(i => document.getElementById(i).getBoundingClientRect()); const x = Math.min(...r.map(b => b.left)) - 20, y = Math.min(...r.map(b => b.top)) - 20; return { x: Math.max(0, x), y: Math.max(0, y), width: Math.min(innerWidth - Math.max(0, x), Math.max(...r.map(b => b.right)) - x + 20), height: Math.min(innerHeight - Math.max(0, y), Math.max(...r.map(b => b.bottom)) - y + 20) }; });
    for (const st of ['ready', 'cd', 'noen', 'locked']) { await page.evaluate(s => window.__set(s), st); await sleep(900); await page.screenshot({ path: path.join(OUTDIR, `${LABEL}_estado_${st}.png`), clip }); }
    await page.evaluate(() => window.__set('ready')); await sleep(700); const c = await center(page, '#btn-s1'); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] }); await sleep(260); await page.screenshot({ path: path.join(OUTDIR, `${LABEL}_estado_presion.png`), clip }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await ctx.close(); }
  // ?uf=0
  { const { ctx, page } = await newPage(browser, BASE, VPS['844x390'], { query: '?uf=0' }); await page.evaluate(PROFILE); const cdp = await ctx.newCDPSession(page);
    await page.evaluate(() => { for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; } selectedClass = 'mago'; currentArena = 'bosque'; lobbyAllies = ['tanque']; netMatch = null; startRun(3); setState('playing'); enemies = []; spawnTimer = 1e9; updateHUD(); }); await sleep(1500);
    const c = await center(page, '#btn-s1'); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] }); await sleep(250);
    out.ufoff = await page.evaluate(() => ({ htmlUfOff: document.documentElement.classList.contains('uf-off'), UIFactory: typeof window.UIFactory, frames: document.querySelectorAll('.uf-frame').length, spr: document.querySelectorAll('.uf-spr').length, fx: document.querySelectorAll('.uf-fx').length, cls: document.getElementById('btn-s1').className, ariaRole: document.getElementById('btn-s1').getAttribute('role'), basicW: Math.round(document.getElementById('btn-basic').getBoundingClientRect().width), muteDisp: getComputedStyle(document.getElementById('mute-btn')).display, goalAnim: getComputedStyle(document.getElementById('goal-chip')).animationName }));
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await ctx.close(); }
  fs.writeFileSync(path.join(OUTDIR, `${LABEL}_frames.json`), JSON.stringify(out, null, 1)); await browser.close(); console.log('\nlisto');
})().catch(e => { console.error(e); process.exit(1); });
