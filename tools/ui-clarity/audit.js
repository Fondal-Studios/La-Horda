'use strict';
// AUDITORÍA DE SUPERPOSICIÓN DEL HUD (rama feature/ui-clarity-hud-shop). Mide rectángulos REALES de los elementos de la interfaz en partida,
// en varios dispositivos y estados, y lista los pares de grupos distintos que se pisan (área en px CSS). No opina: mide.
//   node tools/ui-clarity/audit.js [--base http://127.0.0.1:8821] [--out docs/ui-clarity/audit] [--phase before|after]
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const fs = require('fs'), path = require('path');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const BASE = arg('base', 'http://127.0.0.1:8821'), OUT = path.resolve(arg('out', 'docs/ui-clarity/audit')), PHASE = arg('phase', 'before');
const VIEWPORTS = [[844, 390, 2], [667, 375, 2], [932, 430, 3], [568, 320, 2], [1280, 720, 1]];
const GROUPS = { vitals: '#player-status', objetivo: '#goal-chip', party: '#party', tutorial: '#tut-panel', pausa: '#pause-btn', sonido: '#mute-btn', toasts: '#toast-stack, #loot-toasts', titulo: '#arena-title-card',
  jefe: '#boss-hud, .boss-hud', joystick: '#joy-base', 'btn-ataque': '#btn-basic', 'btn-s1': '#btn-s1', 'btn-s2': '#btn-s2', 'btn-s3': '#btn-s3', 'btn-ult': '#btn-ult', 'btn-cura': '#btn-emerg', 'btn-pacto': '#btn-pact', 'btn-revivir': '#btn-revive', runas: '#obj-hud, .obj-hud, #objective-hud', banner: '#bt-banner' };
const STATES = { normal: () => {}, 'toasts+banner': () => { for (let i = 0; i < 3; i++) groundLootToast({ name: 'Objeto de prueba ' + i, rarity: 'raro', type: 'weapon', level: 1, icon: null }, null); if (typeof betaBanner === 'function') betaBanner('LEGENDARIO', 'Objeto de prueba', '255,176,32', 6000); showNetToast && showNetToast('Aviso de red de prueba'); },
  'ult-lista+poca-energia': () => { runLevel = Math.max(runLevel, 3); player.ultCharge = player.ultMax; player.energy = 2; player.cds = [4000, 0, 6000]; } };
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] }); const res = []; fs.mkdirSync(OUT, { recursive: true });
  for (const [w, h, dpr] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, hasTouch: true, isMobile: w < 1000 }); await ctx.addInitScript(() => { window.__campaignMode = true; });
    const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(BASE + '/index.html?a=' + Date.now()); await page.waitForFunction(() => typeof assetsAllReady === 'function' && assetsAllReady(), null, { timeout: 180000 }); await page.waitForTimeout(800);
    await page.evaluate(() => { for (const c of Object.values(save.champions)) c.unlocked = true; selectedClass = 'mago'; currentArena = 'bosque'; startRun(3); });
    for (const [sname, fn] of Object.entries(STATES)) {
      await page.evaluate(fn); await page.waitForTimeout(900);
      const data = await page.evaluate(G => {
        const rects = {}; for (const [g, sel] of Object.entries(G)) { for (const e of document.querySelectorAll(sel)) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0 || e.closest('.hidden')) continue; const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) continue; (rects[g] = rects[g] || []).push({ x: r.left, y: r.top, w: r.width, h: r.height }); } }
        const safe = { top: 0, left: 0 }; return { rects, vw: innerWidth, vh: innerHeight };
      }, GROUPS);
      const names = Object.keys(data.rects), pairs = [];
      for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) for (const a of data.rects[names[i]]) for (const b of data.rects[names[j]]) {
        const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        if (ox > 1 && oy > 1) pairs.push({ a: names[i], b: names[j], area: Math.round(ox * oy), overlap_px: [Math.round(ox), Math.round(oy)] });
      }
      const offscreen = []; for (const [g, rs] of Object.entries(data.rects)) for (const r of rs) if (r.x < -1 || r.y < -1 || r.x + r.w > data.vw + 1 || r.y + r.h > data.vh + 1) offscreen.push(g);
      res.push({ viewport: `${w}x${h}@${dpr}`, state: sname, overlaps: pairs.sort((x, y) => y.area - x.area), offscreen, elements: names.length });
      await page.screenshot({ path: path.join(OUT, `${PHASE}_${w}x${h}_${sname.replace(/[^a-z0-9]+/gi, '-')}.png`) });
    }
    res.push({ viewport: `${w}x${h}@${dpr}`, errors }); await ctx.close();
  }
  await browser.close(); fs.writeFileSync(path.join(OUT, `${PHASE}_overlaps.json`), JSON.stringify(res, null, 1));
  for (const r of res) if (r.overlaps) console.log(r.viewport, r.state, r.overlaps.length ? r.overlaps.map(o => `${o.a}×${o.b} ${o.area}px²`).join(' | ') : 'sin superposiciones', r.offscreen.length ? ' FUERA:' + r.offscreen.join(',') : '');
})().catch(e => { console.error(e); process.exit(2); });
