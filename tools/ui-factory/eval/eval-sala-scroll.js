'use strict';
// Evaluador (iteración 7): D3, Sala con área de scroll sobre la barra de Comenzar. BASE LABEL OUT
const { sleep, launch, VPS, newPage, PROFILE, fs } = require('./lib');
(async () => { const b = await launch(); const out = {};
 for (const vn of ['667x375', '800x360', '844x390', '932x430', '1280x800']) for (const open of [false, true]) {
  const { ctx, page } = await newPage(b, process.env.BASE, VPS[vn]); await page.evaluate(PROFILE);
  await page.evaluate(o => { setState('prep'); renderPrepSummary(); if (o) document.querySelectorAll('#prep-screen details').forEach(d => d.open = true); }, open); await sleep(1000);
  out[vn + (open ? ' desplegado' : '')] = await page.evaluate(async () => {
    const s = document.getElementById('prep-screen'), btn = document.getElementById('prep-start-btn'); const vh = innerHeight;
    const sc = (getComputedStyle(s).overflowY.match(/auto|scroll/) ? s : document.scrollingElement); const sb = s.getBoundingClientRect(); const bb = btn.getBoundingClientRect();
    const els = [...s.querySelectorAll('button,summary,select,input,a[href]')].filter(e => e.id !== 'prep-start-btn' && e.getBoundingClientRect().width && !e.closest('.hidden'));
    let unreachable = [], overBar = 0;
    for (const e of els) { e.scrollIntoView({ block: 'center' }); await new Promise(r => setTimeout(r, 30)); const r = e.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = Math.min(Math.max(r.top + r.height / 2, 0), vh - 1); const t = document.elementFromPoint(cx, cy); const ok = t && (t === e || e.contains(t) || t.contains(e)) && r.bottom <= bb.top + 2 || (t && (t === e || e.contains(t))); if (!ok) unreachable.push((e.textContent || e.id || e.tagName).trim().slice(0, 24)); if (r.bottom > bb.top + 2 && r.top < bb.bottom && r.right > bb.left && r.left < bb.right) overBar++; }
    sc.scrollTop = 1e6; await new Promise(r => setTimeout(r, 100));
    const kids = [...s.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(); return r.height > 0 && r.width > 0 && !e.closest('.hidden') && getComputedStyle(e).position !== 'fixed'; });
    const lastBottom = Math.max(...kids.map(e => e.getBoundingClientRect().bottom)); sc.scrollTop = 0;
    const first = els[0]; first && first.scrollIntoView({ block: 'start' }); sc.scrollTop = 0;
    const cover0 = els.filter(e => { const r = e.getBoundingClientRect(); return r.bottom > bb.top + 2 && r.top < bb.bottom && r.right > bb.left && r.left < bb.right; }).map(e => (e.textContent || '').trim().slice(0, 20));
    return { vh, areaBottom: Math.round(sb.bottom), barTop: Math.round(bb.top), scrollH: s.scrollHeight, clientH: s.clientHeight, controls: els.length, unreachable, overBarDuringScroll: overBar, lastContentBottomAtEnd: Math.round(lastBottom), coverAtScroll0: cover0 };
  });
  await ctx.close(); process.stdout.write('.'); }
 fs.writeFileSync(process.env.OUT, JSON.stringify(out, null, 1)); await b.close(); console.log('\nlisto'); })();
