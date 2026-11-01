'use strict';
// Evaluador independiente (Módulo D) — pantallas de menú: blancos < 44, solapes entre controles, texto cortado, scroll. + capturas.
// BASE=... LABEL=... OUTDIR=... VPS=844x390,1280x800 node eval-menus.js
const { sleep, launch, VPS, newPage, PROFILE, center, fs, path } = require('./lib');
const BASE = process.env.BASE, LABEL = process.env.LABEL, OUTDIR = process.env.OUTDIR;
const VPLIST = (process.env.VPS || '844x390,1280x800').split(',');
const startRunFn = () => { selectedClass = 'mago'; currentArena = 'bosque'; lobbyAllies = ['tanque']; netMatch = null; startRun(3); setState('playing'); enemies = []; spawnTimer = 1e9; };
const SCREENS = {
  title: () => setState('title'),
  hub: () => { setState('mainmenu'); renderMainMenu(); },
  starter: () => openStarterSelect(() => { }),
  codex: () => openCodex(),
  guardianes: () => openGuardians(),
  inventario: () => openMyInventory(),
  champdetail: () => { renderChampDetail('mago'); setState('champdetail'); },
  tienda: () => { setState('shop'); renderShop(); },
  modos: () => setState('modeselect'),
  cristales: () => { try { cwGo(); } catch (e) { setState('crystalwars'); } },
  divina: () => setState('divina'),
  arenas: () => { setState('arenaselect'); renderArenaGrid(); },
  sala: () => { setState('prep'); renderPrepSummary(); },
  seleccion: () => { setState('menu'); renderChampGrid(); renderSaveLine(); },
  mejora: () => { startRunFn(); openBuffChoice(); },
  pausa: () => { startRunFn(); setState('paused'); },
  derrota: () => { startRunFn(); showGameOverScreen(); },
  victoria: () => { startRunFn(); showVictoryScreen(); }
};
const AUDIT = () => {
  const sel = 'button,a[href],input,select,textarea,summary,[role=button],[role=tab],[role=switch],[onclick],.hub-tile,.starter-card,.arena-card,.hub-tab,label';
  const scr = [...document.querySelectorAll('.screen')].find(s => !s.classList.contains('hidden') && getComputedStyle(s).display !== 'none');
  const root = scr || document.body; const seen = new Set(); const items = [];
  root.querySelectorAll(sel).forEach(e => {
    if (seen.has(e)) return; seen.add(e); const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    if (e.tagName === 'LABEL' && !e.querySelector('input')) return;
    if (!r.width || !r.height || cs.display === 'none' || cs.visibility === 'hidden' || e.closest('.hidden') || cs.pointerEvents === 'none') return;
    const label = (e.getAttribute('aria-label') || e.textContent || e.title || '').trim().replace(/\s+/g, ' ').slice(0, 28);
    items.push({ id: e.id || '', tag: e.tagName.toLowerCase() + (e.type ? '[' + e.type + ']' : ''), label, x: r.left, y: r.top, w: r.width, h: r.height, el: e, clipX: e.scrollWidth > e.clientWidth + 2 && ['hidden', 'clip'].includes(cs.overflowX), clipY: e.scrollHeight > e.clientHeight + 2 && ['hidden', 'clip'].includes(cs.overflowY), ell: cs.textOverflow === 'ellipsis' && e.scrollWidth > e.clientWidth + 2 });
  });
  const small = items.filter(i => i.w < 43.5 || i.h < 43.5);
  const overlaps = [];
  for (let a = 0; a < items.length; a++) for (let b = a + 1; b < items.length; b++) {
    const A = items[a], B = items[b]; if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
    const ox = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x), oy = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y);
    if (ox > 3 && oy > 3) overlaps.push(`${A.tag}"${A.label}" x ${B.tag}"${B.label}" (${Math.round(ox)}x${Math.round(oy)})`);
  }
  const offX = items.filter(i => i.x < -1 || i.x + i.w > innerWidth + 1).map(i => `${i.tag}"${i.label}"`);
  return { screen: scr ? scr.id : null, total: items.length, under44: small.length, small: small.sort((a, b) => Math.min(a.w, a.h) - Math.min(b.w, b.h)).slice(0, 8).map(i => `${i.tag}"${i.label}" ${Math.round(i.w)}x${Math.round(i.h)}`),
    overlaps: overlaps.slice(0, 8), nOverlaps: overlaps.length, clipped: items.filter(i => i.clipX || i.clipY || i.ell).slice(0, 8).map(i => `${i.tag}"${i.label}"`), nClipped: items.filter(i => i.clipX || i.clipY || i.ell).length, offscreenX: offX.slice(0, 5),
    scrollExtra: scr ? { sh: scr.scrollHeight, ch: scr.clientHeight } : null, docScrollX: document.documentElement.scrollWidth - innerWidth,
    checkboxes: [...root.querySelectorAll('input[type=checkbox]')].filter(c => c.getBoundingClientRect().width).map(c => { const r = c.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); }) };
};
(async () => {
  const browser = await launch(); const res = { label: LABEL, vps: {} }; fs.mkdirSync(OUTDIR, { recursive: true });
  for (const vn of VPLIST) {
    const vp = VPS[vn]; const { ctx, page, errors } = await newPage(browser, BASE, vp); await page.evaluate(PROFILE); res.vps[vn] = {};
    for (const [name, fn] of Object.entries(SCREENS)) {
      await page.evaluate(() => document.querySelectorAll('#run-intro').forEach(e => e.classList.add('hidden')));
      // el evaluate anterior es frágil con arrow functions: usa Function
      try { await page.evaluate(([f, sr]) => { window.startRunFn = new Function('return ' + sr)(); const g = new Function('startRunFn', 'return (' + f + ')')(window.startRunFn); g(); }, [fn.toString(), startRunFn.toString()]); } catch (e) { res.vps[vn][name] = { error: String(e).slice(0, 150) }; continue; }
      await sleep(900);
      try { const a = await page.evaluate(AUDIT); res.vps[vn][name] = a; await page.screenshot({ path: path.join(OUTDIR, `${LABEL}_${vn}_${name}.png`) }); } catch (e) { res.vps[vn][name] = { error: String(e).slice(0, 150) }; }
      await page.evaluate(() => { try { setState('mainmenu'); } catch (e) { } }); await sleep(120);
    }
    res.vps[vn]._errors = errors.slice(0, 5); await ctx.close();
  }
  fs.writeFileSync(path.join(OUTDIR, `${LABEL}_menus.json`), JSON.stringify(res, null, 1)); await browser.close(); console.log('listo');
})().catch(e => { console.error(e); process.exit(1); });
