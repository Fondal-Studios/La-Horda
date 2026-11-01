'use strict';
// Evaluador (iteración 4): Pacto, Revivir, cooldown tras lanzar la Definitiva, cuadros de los efectos por fotogramas. BASE LABEL OUTDIR
const { sleep, launch, VPS, newPage, PROFILE, center, fs, path } = require('./lib');
const BASE = process.env.BASE, LABEL = process.env.LABEL, OUTDIR = process.env.OUTDIR; fs.mkdirSync(OUTDIR, { recursive: true });
const INIT = () => { window.__ev = []; for (const n of ['uf:press', 'uf:confirm', 'uf:reject', 'uf:release']) window.addEventListener(n, e => window.__ev.push(n + ':' + (e.detail && e.detail.id))); };
const tch = (cdp, type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
(async () => {
  const browser = await launch(); const out = { label: LABEL }; const vp = VPS['844x390'];
  const { ctx, page, errors } = await newPage(browser, BASE, vp, { init: INIT }); await page.evaluate(PROFILE); const cdp = await ctx.newCDPSession(page);
  const prep = async champ => { await page.evaluate(champ => { for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; } selectedClass = champ; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte']; netMatch = null; startRun(3); setState('playing'); enemies = []; spawnTimer = 1e9; levelTimer = 0; levelDuration = 1e9; player.energy = 1e4; player.hp = player.maxHp * .5; player.emergCharges = 2; runLevel = Math.max(runLevel, ULT_MIN_ARENA_LEVEL); player.cds = [0, 0, 0]; player.ultCharge = player.ultMax; player.ultCd = 0; updateHUD(); window.__ev = []; }, champ); await sleep(700); };
  const cls = id => page.evaluate(id => document.getElementById(id).className, id);
  const ev = () => page.evaluate(() => window.__ev.slice());
  // 1) Pacto
  await prep('nigromante'); const cp = await center(page, '#btn-pact');
  out.pact = { visible: !!cp };
  if (cp) {
    for (const souls of [0, 5]) {
      await page.evaluate(s => { player.nigroSouls = s; player.nigroPact = false; updateHUD(); window.__ev = []; }, souls); await sleep(300);
      await tch(cdp, 'touchStart', [{ x: cp.x, y: cp.y, id: 1 }]); await sleep(120); const during = await cls('btn-pact'); await tch(cdp, 'touchEnd', []); await sleep(500);
      out.pact['souls' + souls] = { during, after: await cls('btn-pact'), events: await ev(), pactOn: await page.evaluate(() => !!player.nigroPact), aria: await page.evaluate(() => document.getElementById('btn-pact').getAttribute('aria-disabled')) };
    }
  }
  // 2) Revivir (forzado visible: es contextual)
  await prep('mago'); await page.evaluate(() => { document.getElementById('btn-revive').classList.remove('hidden'); window.__ev = []; }); await sleep(300);
  const cr = await center(page, '#btn-revive'); out.revive = { visible: !!cr };
  if (cr) { await tch(cdp, 'touchStart', [{ x: cr.x, y: cr.y, id: 1 }]); await sleep(200); const d = await cls('btn-revive'); await tch(cdp, 'touchEnd', []); await sleep(400); out.revive = { ...out.revive, size: [Math.round(cr.w), Math.round(cr.h)], during: d, after: await cls('btn-revive'), events: await ev() }; }
  // 3) Lanzar la Definitiva: aparece su cooldown
  for (const champ of ['mago', 'ilkan', 'nigromante']) {
    await prep(champ); const cu = await center(page, '#btn-ult');
    await tch(cdp, 'touchStart', [{ x: cu.x, y: cu.y, id: 1 }]); await sleep(60); await tch(cdp, 'touchEnd', []); await sleep(900);
    out['ultCast_' + champ] = await page.evaluate(() => { const e = document.getElementById('btn-ult'), n = e.querySelector('.uf-cd'); return { ultCd: Math.round(player.ultCd), expectSec: Math.ceil(player.ultCd / 1000), shown: n ? n.textContent : null, active: /uf-ultcd/.test(e.className), ultCharge: player.ultCharge, cls: e.className }; });
    if (champ === 'mago') { await page.screenshot({ path: path.join(OUTDIR, `${LABEL}_ult-tras-lanzar.png`), clip: { x: vp.w - 260, y: 100, width: 260, height: 290 } }); }
    await page.evaluate(() => { player.ultCd = 400; }); await sleep(1200);
    out['ultCast_' + champ].tras_fin = await page.evaluate(() => { const e = document.getElementById('btn-ult'); return { active: /uf-ultcd/.test(e.className), ultCd: player.ultCd }; });
  }
  // 4) cuadros de la animación: presión (mantener) y confirmación (toque) de Ataque, s1 y Definitiva
  await prep('mago');
  for (const id of ['btn-s1', 'btn-basic', 'btn-ult']) {
    await page.evaluate(() => { player.energy = 1e4; player.cds = [0, 0, 0]; player.ultCharge = player.ultMax; player.ultCd = 0; updateHUD(); }); await sleep(500);
    const c = await center(page, '#' + id); const clip = await page.evaluate(id => { const b = document.getElementById(id).getBoundingClientRect(); const m = Math.max(b.width, b.height) * .75; return { x: Math.max(0, b.left - m), y: Math.max(0, b.top - m), width: Math.min(innerWidth - Math.max(0, b.left - m), b.width + 2 * m), height: Math.min(innerHeight - Math.max(0, b.top - m), b.height + 2 * m) }; }, id);
    await page.evaluate(() => { document.getElementById('game').style.visibility = 'hidden'; });
    await page.screenshot({ path: path.join(OUTDIR, `${LABEL}_fx_${id}_0reposo.png`), clip });
    await tch(cdp, 'touchStart', [{ x: c.x, y: c.y, id: 1 }]);
    for (const t of [40, 100, 180]) { await sleep(t === 40 ? 40 : t === 100 ? 60 : 80); await page.screenshot({ path: path.join(OUTDIR, `${LABEL}_fx_${id}_press${t}.png`), clip }); }
    await tch(cdp, 'touchEnd', []);
    for (const t of [60, 150, 260]) { await sleep(t === 60 ? 60 : 90 + (t === 260 ? 20 : 0)); await page.screenshot({ path: path.join(OUTDIR, `${LABEL}_fx_${id}_tras${t}.png`), clip }); }
    out['sprite_' + id] = await page.evaluate(id => { const e = document.getElementById(id), s = e.querySelector('.uf-spr'); if (!s) return null; const r = s.getBoundingClientRect(), b = e.getBoundingClientRect(); return { sprite: [Math.round(r.width), Math.round(r.height)], button: [Math.round(b.width), Math.round(b.height)], pe: getComputedStyle(s).pointerEvents, z: getComputedStyle(s).zIndex }; }, id);
    await page.evaluate(() => { document.getElementById('game').style.visibility = ''; }); await sleep(600); await page.evaluate(() => { player.ultCd = 0; });
  }
  out.errors = errors.filter(e => !/fondalstudios|CORS|ERR_FAILED/.test(e)).slice(0, 3);
  fs.writeFileSync(path.join(OUTDIR, `${LABEL}_extra.json`), JSON.stringify(out, null, 1)); await browser.close(); console.log(JSON.stringify(out).slice(0, 1800));
})().catch(e => { console.error(e); process.exit(1); });
