'use strict';
const { launch, VPS, newPage, PROFILE, sleep, fs } = require('./lib');
(async () => { const b = await launch(); const o = {};
 for (const [L, base] of [['base', 'http://127.0.0.1:8882'], ['cand', 'http://127.0.0.1:8881']]) {
  const { ctx, page } = await newPage(b, base, VPS['844x390']); await page.evaluate(PROFILE);
  await page.evaluate(() => { selectedClass = 'nigromante'; currentArena = 'bosque'; lobbyAllies = ['tanque']; netMatch = null; startRun(3); setState('playing'); updateHUD(); }); await sleep(1500);
  o[L] = await page.evaluate(() => Object.fromEntries(['btn-basic','btn-s1','btn-s2','btn-s3','btn-ult','btn-emerg','btn-pact','btn-revive'].map(id => { const e = document.getElementById(id); return [id, e ? { role: e.getAttribute('role'), label: e.getAttribute('aria-label'), disabled: e.getAttribute('aria-disabled'), tabindex: e.getAttribute('tabindex'), ks: e.getAttribute('aria-keyshortcuts') } : null]; })));
  // reduce-motion: body class real + escala del botón presionado
  if (L === 'cand') o.reduceMotion = await page.evaluate(async () => { document.body.classList.add('reduce-motion'); const e = document.getElementById('btn-s1'); e.classList.add('uf-press'); const cs = getComputedStyle(e); const r = { scale: cs.scale, translate: cs.translate }; e.classList.remove('uf-press'); document.body.classList.remove('reduce-motion'); return r; });
  await ctx.close(); }
 console.log(JSON.stringify(o, null, 1)); fs.writeFileSync(''+(process.env.OUT||'/tmp/aria.json')+'', JSON.stringify(o, null, 1)); await b.close(); })();
