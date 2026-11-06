'use strict';
/* LA HORDA — RASTREADOR DE INTERFAZ (tools/ui-rework/crawl.js)
   Recorre la UI real con un perfil de jugador recurrente (título → hub → …) y mide:
     · clics mínimos desde el título hasta las metas: JUGAR (state "playing"), CÓDICE ("codex"), TIENDA ("shop"), SALA ("prep"),
     · por cada pantalla visitada: elementos accionables visibles, tamaño de los blancos táctiles, desbordes de texto, fuentes y colores usados.
   Búsqueda en anchura por reproducción de caminos (no hay "atrás" fiable); evita botones destructivos o externos.
   Uso: BASE_URL=http://127.0.0.1:8750/ UI=old|new DEPTH=3 node tools/ui-rework/crawl.js [salida.json] */
const fs = require('fs'), path = require('path');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8750/';
const UI = process.env.UI || '';
const DEPTH = +(process.env.DEPTH || 3), W = +(process.env.W || 844), H = +(process.env.H || 390);
const SHOTS = process.env.SHOTS || '';
const GOALS = {playing: 'JUGAR', codex: 'CODICE', shop: 'TIENDA', prep: 'SALA'};
const SKIP = /borrar|eliminar|reset|reinici|comprar|cerrar sesi|salir|reembols|privacidad|t[eé]rminos|instalar|cuenta|entrar|crear|invitado|premium|pagar|✦|salir del juego|abandon/i;

const probe = () => {
  const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 3 && r.height > 3 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
  const onTop = e => { const r = e.getBoundingClientRect(), t = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2))); return !!t && (t === e || e.contains(t) || t.contains(e)); };
  const sel = 'button, a[href], [role=button], [onclick], input[type=button], input[type=submit], .hub-tile, .starter-card, [data-ui-act]';
  const seen = new Set(), els = [];
  for (const e of document.querySelectorAll(sel)) { if (seen.has(e) || !vis(e) || !onTop(e)) continue; seen.add(e);
    const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    els.push({id: e.id || '', cls: (typeof e.className === 'string' ? e.className : '').slice(0, 60), label: (e.innerText || e.getAttribute('aria-label') || e.title || '').trim().replace(/\s+/g, ' ').slice(0, 40),
      x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), font: cs.fontFamily.split(',')[0].replace(/["']/g, ''), fs: parseFloat(cs.fontSize), bg: cs.backgroundColor, br: parseFloat(cs.borderTopLeftRadius) || 0,
      overflow: e.scrollWidth > e.clientWidth + 2 || e.scrollHeight > e.clientHeight + 3}); }
  const emoji = (document.body.innerText.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []).length;
  const scr = ['title', 'mainmenu', 'starter', 'codex', 'inventory', 'champdetail', 'shop', 'modeselect', 'divina', 'crystalwars', 'arenaselect', 'menu', 'prep'].map(k => document.getElementById(k === 'menu' ? 'menu-screen' : k + '-screen')).filter(Boolean).find(el => !el.classList.contains('hidden'));
  const sh = [...document.querySelectorAll('.ur-sheet')].find(e => !e.classList.contains('hidden'));
  return {state: typeof state !== 'undefined' ? state : null, sheet: sh ? sh.id.replace('ur-sheet-', '') : '', els, emoji, screenId: scr ? scr.id : '', vw: innerWidth, vh: innerHeight};
};

async function boot(browser) {
  const ctx = await browser.newContext({viewport: {width: W, height: H}, deviceScaleFactor: 1});
  await ctx.addInitScript(() => { try { localStorage.setItem('lahorda_ui_crawl', '1'); } catch (e) {} });
  const page = await ctx.newPage();
  await page.goto(BASE + (UI ? '?ui=' + UI : ''), {waitUntil: 'domcontentloaded', timeout: 120000});
  await page.waitForFunction(() => typeof save !== 'undefined' && typeof setState === 'function' && document.getElementById('title-continue-btn') && !/cargando/i.test(document.getElementById('title-continue-btn').innerText), null, {timeout: 120000});
  // perfil recurrente: ya eligió guardián y completó la primera partida
  await page.evaluate(() => {   // solo en la página de prueba: se anulan las puertas de onboarding para medir el menú de un jugador recurrente
    save.starterChosen = true; save.firstRun = null; save.tutorialDone = true;
    window.needsStarterChampion = () => false; window.needsStarterSkin = () => false;
    if (typeof HordaOnboarding !== 'undefined') HordaOnboarding.ready = () => true;
    if (typeof accountGate === 'function') window.accountGate = () => false;
    try { persist(); } catch (e) {} setState('title'); });
  await page.waitForTimeout(900);
  return {ctx, page};
}
const key = el => el.id || (el.label + '|' + el.cls);
async function replay(page, pathKeys) {
  for (const k of pathKeys) {
    const ok = await page.evaluate(k => { const sel = 'button, a[href], [role=button], [onclick], input[type=button], input[type=submit], .hub-tile, .starter-card, [data-ui-act]';
      const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 3 && r.height > 3 && cs.visibility !== 'hidden' && cs.display !== 'none' && r.bottom > 0 && r.top < innerHeight; };
      const el = [...document.querySelectorAll(sel)].filter(vis).find(e => (e.id || ((e.innerText || e.getAttribute('aria-label') || e.title || '').trim().replace(/\s+/g, ' ').slice(0, 40) + '|' + (typeof e.className === 'string' ? e.className : '').slice(0, 60))) === k);
      if (!el) return false; const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, k);
    if (!ok) return false;
    await page.mouse.click(ok[0], ok[1]); await page.waitForTimeout(700);
  }
  return true;
}
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  const out = {ui: UI || 'default', viewport: [W, H], goals: {}, screens: {}, edges: 0};
  const dest = process.argv[2] || path.join(__dirname, 'crawl-' + (UI || 'default') + '.json');
  const visited = new Set(), queue = [[]]; let n = 0;
  while (queue.length) {
    const pth = queue.shift(); const {ctx, page} = await boot(browser);
    try {
      if (!(await replay(page, pth))) { await ctx.close(); continue; }
      const p = await page.evaluate(probe); n++;
      const sig = p.state + (p.sheet ? ':' + p.sheet : '') + '#' + p.els.map(key).sort().join(',');
      if (visited.has(sig)) { await ctx.close(); continue; } visited.add(sig);
      const sk = p.state + (p.sheet ? ':' + p.sheet : '');   // un panel abierto es un estado propio
      if (!out.screens[sk] || p.els.length > out.screens[sk].els.length) { out.screens[sk] = {...p, path: pth}; if (SHOTS) { fs.mkdirSync(SHOTS, {recursive: true}); await page.screenshot({path: path.join(SHOTS, `${UI || 'default'}_${sk}.png`)}); } }
      for (const [st, g] of Object.entries(GOALS)) if (p.state === st && !p.sheet && !out.goals[g]) out.goals[g] = {clicks: pth.length, path: pth};
      if (pth.length < DEPTH && p.state !== 'playing') for (const e of p.els) { if (SKIP.test(e.label + ' ' + e.id)) continue; queue.push([...pth, key(e)]); out.edges++; }
    } catch (e) { console.error('error en', pth.join(' > '), e.message); }
    await ctx.close();
    out.pagesVisited = n; fs.writeFileSync(dest, JSON.stringify(out, null, 1));   // progreso: nunca se pierde lo medido
    if (n > +(process.env.MAX_PAGES || 140)) break;
  }
  // semillas: pantallas profundas (sala, modos, arenas) que el BFS de pocos clics no alcanza; se fuerzan con setState y se sondean igual
  for (const seed of (process.env.SEEDS || 'prep,modeselect,arenaselect').split(',').filter(Boolean)) {
    const {ctx, page} = await boot(browser);
    try {
      await page.evaluate(seed => { setState(seed); for (const fn of ['renderPrepSummary', 'renderArenaSelect', 'renderModeSelect']) if (seed === ({renderPrepSummary: 'prep', renderArenaSelect: 'arenaselect', renderModeSelect: 'modeselect'})[fn] && typeof window[fn] === 'function') { try { window[fn](); } catch (e) {} } }, seed);
      await page.waitForTimeout(1200);
      const p = await page.evaluate(probe);
      if (!out.screens[seed] || p.els.length > out.screens[seed].els.length) { out.screens[seed] = {...p, path: ['(semilla)']}; if (SHOTS) { fs.mkdirSync(SHOTS, {recursive: true}); await page.screenshot({path: path.join(SHOTS, `${UI || 'default'}_${seed}.png`)}); } }
    } catch (e) { console.error('semilla', seed, e.message); }
    await ctx.close();
  }
  out.pagesVisited = n; out.done = true;
  fs.writeFileSync(dest, JSON.stringify(out, null, 1));
  console.log('goals', JSON.stringify(Object.fromEntries(Object.entries(out.goals).map(([k, v]) => [k, v.clicks]))), 'screens', Object.keys(out.screens).join(','), 'pages', n);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
