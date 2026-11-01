'use strict';
const { sleep, launch, VPS, newPage, PROFILE, fs } = require('./lib');
(async () => { const b = await launch(); const out = {};
 for (const [L, base] of [['base','http://127.0.0.1:8882'],['cand','http://127.0.0.1:8881']]) for (const vn of ['844x390','667x375','932x430']) {
  const { ctx, page } = await newPage(b, base, VPS[vn]); await page.evaluate(PROFILE);
  await page.evaluate(() => { setState('prep'); renderPrepSummary(); }); await sleep(1000);
  await page.screenshot({ path: `/home/user/La-Horda/docs/ui-factory/evidence/eval2/pause/${L}_${vn}_prep-scroll0.png` });
  out[L+' '+vn] = await page.evaluate(() => { const s = document.getElementById('prep-screen'); const btn = document.getElementById('prep-start-btn').getBoundingClientRect(); const r = [];
    for (const e of s.querySelectorAll('summary,button,select')) { if (e.id === 'prep-start-btn') continue; const q = e.getBoundingClientRect(); if (!q.width || e.closest('.hidden')) continue; const cx = q.left + q.width/2, cy = Math.min(q.bottom - 2, Math.max(q.top + 2, q.top + q.height/2)); if (cy > innerHeight) { r.push({ t: (e.textContent||'').trim().slice(0,22), offscreen: true, top: Math.round(q.top) }); continue; } const top = document.elementFromPoint(cx, cy); const ovBtn = Math.max(0, Math.min(q.bottom, btn.bottom) - Math.max(q.top, btn.top)) * (Math.min(q.right, btn.right) > Math.max(q.left, btn.left) ? 1 : 0); r.push({ t: (e.textContent||'').trim().slice(0,22), top: Math.round(q.top), h: Math.round(q.height), centerHit: top && (top === e || e.contains(top)) ? 'ok' : (top && top.id) || (top && top.tagName), overlapWithStartBtnPx: Math.round(ovBtn) }); }
    return r; });
  await ctx.close(); }
 console.log(JSON.stringify(out, null, 1)); fs.writeFileSync('/home/user/La-Horda/docs/ui-factory/evidence/eval2/sala-scroll0.json', JSON.stringify(out, null, 1)); await b.close(); })();
