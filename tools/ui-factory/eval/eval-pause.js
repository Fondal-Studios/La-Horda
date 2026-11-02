'use strict';
// Evaluador (Módulo D, iteración 2): Pausa (solo / online / sin panel táctico / zurdo / texto grande) y Sala en varios viewports.
// BASE=... LABEL=... OUTDIR=... node eval-pause.js
const { sleep, launch, VPS, newPage, PROFILE, center, fs, path } = require('./lib');
const BASE = process.env.BASE, LABEL = process.env.LABEL, OUTDIR = process.env.OUTDIR;
const VPLIST = (process.env.VPS || '844x390,667x375,932x430,1280x800').split(',');
const START = () => { selectedClass = 'mago'; currentArena = 'bosque'; lobbyAllies = ['tanque']; netMatch = null; startRun(3); setState('playing'); enemies = []; spawnTimer = 1e9; };
const CHECK = () => {
  const vis = e => { if (!e) return null; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); if (!r.width || cs.display === 'none' || cs.visibility === 'hidden' || e.closest('.hidden')) return null; return r; };
  const out = {}; const scr = document.getElementById('pause-screen');
  for (const [k, sel] of Object.entries({ continuar: '#resume-btn', abandonar: '#quit-btn', opciones: '.pause-opts-btn', comoSeJuega: '#pause-howto-btn' })) {
    const e = document.querySelector('#pause-screen ' + sel) || document.querySelector(sel); const r = vis(e);
    if (!r) { out[k] = null; continue; }
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2; const top = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, cx)), Math.min(innerHeight - 1, Math.max(0, cy)));
    out[k] = { w: Math.round(r.width), h: Math.round(r.height), inViewport: r.top >= 0 && r.bottom <= innerHeight + 1 && r.left >= 0 && r.right <= innerWidth + 1, reachableAtCenter: !!top && (e === top || e.contains(top) || top.contains(e)), bottom: Math.round(r.bottom) };
  }
  out.screenScroll = scr ? { sh: scr.scrollHeight, ch: scr.clientHeight } : null; out.docScrollX = document.documentElement.scrollWidth - innerWidth;
  out.title = (scr.querySelector('.arena-title') || {}).textContent; out.noteVisible = !!vis(scr.querySelector('.pause-note')); out.noteText = ((scr.querySelector('.pause-note') || {}).textContent || '').slice(0, 90);
  out.tacticalPanel = !!vis(document.getElementById('tactical-panel'));
  const tp = document.getElementById('tactical-panel'); if (tp && vis(tp)) out.tpScroll = { sh: tp.scrollHeight, ch: tp.clientHeight, cw: tp.clientWidth };
  const checks = [...scr.querySelectorAll('input[type=checkbox]')].map(c => { const r = c.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); }); out.checkboxes = checks;
  const rg = [...scr.querySelectorAll('input[type=range]')].map(c => { const r = c.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); }); out.ranges = rg;
  // solapes entre controles visibles de la pausa
  const items = [...scr.querySelectorAll('button,input,select,summary,a[href]')].map(e => ({ e, r: vis(e) })).filter(x => x.r); const ov = [];
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) { const A = items[i].r, B = items[j].r; if (items[i].e.contains(items[j].e) || items[j].e.contains(items[i].e)) continue; const ox = Math.min(A.right, B.right) - Math.max(A.left, B.left), oy = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top); if (ox > 3 && oy > 3) ov.push((items[i].e.id || items[i].e.className || items[i].e.tagName) + ' x ' + (items[j].e.id || items[j].e.className || items[j].e.tagName)); }
  out.overlaps = ov.slice(0, 5); return out;
};
(async () => {
  const browser = await launch(); const res = { label: LABEL, runs: {} }; fs.mkdirSync(OUTDIR, { recursive: true });
  for (const vn of VPLIST) {
    const vp = VPS[vn];
    for (const scen of ['solo', 'solo-sin-panel', 'online', 'zurdo', 'texto-grande', 'prep', 'prep-desplegado']) {
      const { ctx, page, errors } = await newPage(browser, BASE, vp); await page.evaluate(PROFILE); const key = vn + ' ' + scen;
      try {
        if (scen.startsWith('prep')) {
          await page.evaluate(() => { setState('prep'); renderPrepSummary(); }); await sleep(900);
          if (scen === 'prep-desplegado') await page.evaluate(() => document.querySelectorAll('#prep-screen details').forEach(d => d.open = true)), await sleep(400);
          const r = await page.evaluate(() => { const s = document.getElementById('prep-screen'); const b = document.getElementById('prep-start-btn'); const br = b.getBoundingClientRect();
            const summ = [...s.querySelectorAll('summary')].map(x => ({ t: x.textContent.trim().slice(0, 28), h: Math.round(x.getBoundingClientRect().height), marker: getComputedStyle(x, '::before').content })); s.scrollTop = 1e6; window.scrollTo(0, 1e6);
            const last = [...s.querySelectorAll('*')].filter(e => e.getBoundingClientRect().height && !e.closest('.hidden')).map(e => e.getBoundingClientRect().bottom).sort((a, b) => b - a)[0];
            return { startBtn: { x: Math.round(br.left), y: Math.round(br.top), w: Math.round(br.width), h: Math.round(br.height) }, vh: innerHeight, scroll: { sh: s.scrollHeight, ch: s.clientHeight }, lastContentBottomAfterScrollEnd: Math.round(last), summaries: summ }; });
          res.runs[key] = r; await page.screenshot({ path: path.join(OUTDIR, `${LABEL}_${vn}_${scen}.png`) });
          await page.evaluate(() => { const s = document.getElementById('prep-screen'); s.scrollTop = 1e6; }); await sleep(200); await page.screenshot({ path: path.join(OUTDIR, `${LABEL}_${vn}_${scen}_fin-scroll.png`) });
        } else {
          if (scen === 'zurdo') await page.evaluate(() => { PREFS.lefty = true; prefsApply(); });
          if (scen === 'texto-grande') await page.evaluate(() => { PREFS.textLg = true; prefsApply(); });
          await page.evaluate(START); await sleep(900);
          if (scen === 'online') await page.evaluate(() => { netMatch = { fake: true, mode: 'coop' }; });
          const c = await center(page, '#pause-btn'); if (c) await page.mouse.click(c.x, c.y); else await page.evaluate(() => { setState('paused'); renderStatsPanel(); tacticalPanelOpen(); });
          await sleep(900);
          if (scen === 'solo-sin-panel') { await page.evaluate(() => { const st = document.createElement('style'); st.textContent = '#tactical-panel{display:none !important}'; document.head.appendChild(st); }); await sleep(300); }
          const st = await page.evaluate(() => state); const r = await page.evaluate(CHECK); r.state = st; res.runs[key] = r;
          await page.screenshot({ path: path.join(OUTDIR, `${LABEL}_${vn}_${scen}.png`) });
          // volver: continuar funciona
          const rc = await center(page, '#resume-btn'); if (rc) { await page.mouse.click(rc.x, rc.y); await sleep(500); r.afterResumeState = await page.evaluate(() => state); }
        }
      } catch (e) { res.runs[key] = { error: String(e).slice(0, 200) }; }
      (res.errors = res.errors || []).push(...errors.slice(0, 2).filter(x => !/fondalstudios|CORS|ERR_FAILED/.test(x)));
      await ctx.close(); process.stdout.write('.');
    }
  }
  fs.writeFileSync(path.join(OUTDIR, `${LABEL}_pause.json`), JSON.stringify(res, null, 1)); await browser.close(); console.log('\nlisto');
})().catch(e => { console.error(e); process.exit(1); });
