'use strict';
// Evaluador (iteración 4): geometría del HUD (Ataque grande vs vecinos, zurdo, Revivir/Pacto) y cooldown de Definitiva. BASE LABEL OUTDIR
const { sleep, launch, VPS, newPage, PROFILE, center, fs, path } = require('./lib');
const BASE = process.env.BASE, LABEL = process.env.LABEL, OUTDIR = process.env.OUTDIR; fs.mkdirSync(OUTDIR, { recursive: true });
const IDS = ['btn-basic', 'btn-s1', 'btn-s2', 'btn-s3', 'btn-ult', 'btn-emerg', 'btn-pact', 'btn-revive', 'pause-btn', 'mute-btn', 'joy-base'];
const GEO = () => {
  const vis = e => { for (let p = e; p && p !== document.body; p = p.parentElement) { const c = getComputedStyle(p); if (c.display === 'none' || c.visibility === 'hidden' || p.classList.contains('hidden')) return false; } return true; };
  const ids = ['btn-basic','btn-s1','btn-s2','btn-s3','btn-ult','btn-emerg','btn-pact','btn-revive','pause-btn','mute-btn'];
  const boxes = []; for (const id of ids) { const e = document.getElementById(id); if (!e || !vis(e)) continue; const b = e.getBoundingClientRect(); if (!b.width) continue; boxes.push({ id, x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }); }
  const hudBlocks = []; document.querySelectorAll('#hud > *, #hud #party, #hud .ally-row, .lanes-hud > *').forEach(e => { if (!vis(e)) return; const b = e.getBoundingClientRect(); if (b.width < 8 || b.height < 8) return; hudBlocks.push({ id: e.id || String(e.className).split(' ')[0], x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }); });
  const issues = [];
  const ov = (A, B) => ({ ox: Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x), oy: Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y) });
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) { const o = ov(boxes[i], boxes[j]); if (o.ox > 2 && o.oy > 2) issues.push(`${boxes[i].id} x ${boxes[j].id} ${o.ox}x${o.oy}`); }
  for (const b of boxes) { if (b.x < 0 || b.y < 0 || b.x + b.w > innerWidth + .5 || b.y + b.h > innerHeight + .5) issues.push(b.id + ' fuera de pantalla'); if (b.w < 44 || b.h < 44) issues.push(`${b.id} ${b.w}x${b.h} <44`); }
  for (const h of hudBlocks) for (const b of boxes) { const o = ov(h, b); if (o.ox > 4 && o.oy > 4 && !/^(controls|skillzone)$/.test(h.id)) issues.push(`HUD ${h.id} x ${b.id} ${o.ox}x${o.oy}`); }
  const gap = (a, b) => { const A = boxes.find(x => x.id === a), B = boxes.find(x => x.id === b); if (!A || !B) return null; const o = ov(A, B); return Math.max(-Math.min(o.ox, o.oy), 0) ? null : Math.round(Math.max(-o.ox, -o.oy)); };
  return { boxes, issues, gapBasicS1: gap('btn-basic', 'btn-s1'), vw: innerWidth, vh: innerHeight };
};
(async () => {
  const browser = await launch(); const out = { label: LABEL, geo: {}, ult: null };
  for (const vn of ['844x390', '667x375', '800x360', '932x430', '1280x800']) for (const champ of ['mago', 'nigromante']) for (const lefty of [false, true]) {
    const { ctx, page } = await newPage(browser, BASE, VPS[vn]); await page.evaluate(PROFILE);
    await page.evaluate(([c, l]) => { PREFS.lefty = l; prefsApply(); for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; } selectedClass = c; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'guerrero']; netMatch = null; startRun(3); setState('playing'); enemies = []; spawnTimer = 1e9; levelDuration = 1e9; updateHUD(); const rv = document.getElementById('btn-revive'); if (rv) rv.classList.remove('hidden'); }, [champ, lefty]);
    await sleep(1200); out.geo[`${vn} ${champ}${lefty ? ' zurdo' : ''}`] = await page.evaluate(GEO);
    if (vn === '844x390' && champ === 'mago' && !lefty) await page.screenshot({ path: path.join(OUTDIR, `${LABEL}_844x390_hud-completo.png`) });
    if (vn === '667x375' && champ === 'nigromante' && !lefty) await page.screenshot({ path: path.join(OUTDIR, `${LABEL}_667x375_hud-nigro.png`) });
    if (vn === '844x390' && champ === 'mago' && lefty) await page.screenshot({ path: path.join(OUTDIR, `${LABEL}_844x390_hud-zurdo.png`) });
    if (vn === '844x390' && champ === 'mago' && !lefty) { // cooldown de la Definitiva
      const samples = []; await page.evaluate(() => { runLevel = Math.max(runLevel, ULT_MIN_ARENA_LEVEL); player.ultCharge = 0; player.ultCd = 25000; updateHUD(); });
      for (let i = 0; i < 8; i++) { await sleep(500); samples.push(await page.evaluate(() => { const e = document.getElementById('btn-ult'), n = e.querySelector('.uf-cd'); return { ultCd: Math.round(player.ultCd), expectSec: Math.ceil(player.ultCd / 1000), shown: n ? n.textContent : null, disp: n ? getComputedStyle(n).display : null, cls: /uf-ultcd/.test(e.className), cdp: e.style.getPropertyValue('--ufcd'), baseCls: e.className }; })); }
      if (i => 0) await page.screenshot({ path: path.join(OUTDIR, `${LABEL}_844x390_ult-cooldown.png`), clip: { x: 0, y: 0, width: VPS[vn].w, height: VPS[vn].h } });
      await page.evaluate(() => { player.ultCd = 0; player.ultCharge = player.ultMax; updateHUD(); }); await sleep(500);
      const after = await page.evaluate(() => { const e = document.getElementById('btn-ult'), n = e.querySelector('.uf-cd'); return { cls: /uf-ultcd/.test(e.className), disp: n ? getComputedStyle(n).display : 'sin nodo', all: e.className }; });
      // cooldown natural: ¿el juego lo descuenta y el rótulo lo sigue hasta 0?
      await page.evaluate(() => { player.ultCharge = 0; player.ultCd = 3000; updateHUD(); }); const nat = []; for (let i = 0; i < 9; i++) { await sleep(500); nat.push(await page.evaluate(() => { const e = document.getElementById('btn-ult'), n = e.querySelector('.uf-cd'); return [Math.round(player.ultCd), n ? n.textContent : null, /uf-ultcd/.test(e.className)]; })); }
      out.ult = { samples, after, natural3s: nat };
    }
    await ctx.close(); process.stdout.write('.');
  }
  fs.writeFileSync(path.join(OUTDIR, `${LABEL}_layout.json`), JSON.stringify(out, null, 1)); await browser.close(); console.log('\nlisto');
})().catch(e => { console.error(e); process.exit(1); });
