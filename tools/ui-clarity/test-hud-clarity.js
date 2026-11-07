'use strict';
// Pruebas de UC-HUD v1 (motivos de habilidad bloqueada, sin apilar, etiqueta persistente, sin superposiciones, interruptor, sin errores).
//   node tools/ui-clarity/test-hud-clarity.js         (levanta su propio servidor)
const { spawn, spawnSync } = require('child_process'), path = require('path'), net = require('net'), fs = require('fs');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '../..'); let fails = 0; const check = (n, ok, x) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 260) : '')); if (!ok) fails++; };
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const port = await freePort(), srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); const base = 'http://127.0.0.1:' + port; await sleep(1200);
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  async function open(qs) { const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }); await ctx.addInitScript(() => { window.__campaignMode = true; window.__rej = []; window.__uc = []; window.addEventListener('uf:reject', e => window.__rej.push(e.detail)); window.addEventListener('uc:reason', e => window.__uc.push(e.detail)); });
    const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message)); await page.goto(base + '/index.html' + (qs || '')); await page.waitForFunction(() => typeof assetsAllReady === 'function' && assetsAllReady(), null, { timeout: 180000 }); await sleep(600);
    await page.evaluate(() => { for (const c of Object.values(save.champions)) c.unlocked = true; selectedClass = 'mago'; currentArena = 'bosque'; startRun(3); }); await sleep(1200); return { ctx, page, errors }; }
  const tap = async (page, id) => { const b = await (await page.$('#' + id)).boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); };
  try {
    const { ctx, page, errors } = await open('');
    // 1) recarga: motivo con nombre de la habilidad y segundos
    await page.evaluate(() => { enemies.length = 0; spawnTimer = 1e12; player.energy = player.maxEnergy; player.cds = [5000, 0, 0]; }); await sleep(250); const before = await page.evaluate(() => ({ en: player.energy, cds: player.cds.slice(), hp: player.hp }));
    await tap(page, 'btn-s1'); await sleep(200);
    const t1 = await page.evaluate(() => { const b = document.querySelector('.uc-reason'); return b && { text: b.textContent, on: b.classList.contains('uc-on'), kind: b.dataset.kind, live: b.getAttribute('aria-live') }; });
    check('recarga: la burbuja dice qué habilidad y cuánto falta', t1 && t1.on && /recarga [45] s/.test(t1.text) && t1.kind === 'cooldown', t1);
    check('la burbuja es un aviso accesible (role=status, aria-live)', t1 && t1.live === 'polite');
    const pos = await page.evaluate(() => { const b = document.querySelector('.uc-reason').getBoundingClientRect(), vw = innerWidth; const btns = [...document.querySelectorAll('.ability-btn, #pause-btn, #mute-btn, #player-status, #goal-chip, #party, #joy-base')].filter(e => e.offsetWidth && +getComputedStyle(e).opacity > 0.05).map(e => e.getBoundingClientRect()); const hit = btns.some(r => !(b.right < r.left || b.left > r.right || b.bottom < r.top || b.top > r.bottom)); return { left: Math.round(b.left), top: Math.round(b.top), right: Math.round(b.right), vw, hit }; });
    check('la burbuja no tapa controles ni paneles y queda fuera del centro (mitad derecha, arriba)', !pos.hit && pos.left > pos.vw * 0.45 && pos.top < 120, pos);
    // 2) spam: 12 toques seguidos => una sola burbuja y un solo aviso lógico
    for (let i = 0; i < 12; i++) { await tap(page, 'btn-s1'); await sleep(40); }
    const sp = await page.evaluate(() => ({ bubbles: document.querySelectorAll('.uc-reason').length, events: window.__uc.length, rejects: window.__rej.length }));
    check('spam sobre una habilidad en recarga: 1 burbuja y 1 evento de motivo (no se apilan)', sp.bubbles === 1 && sp.events === 1, sp);
    check('el contrato UF-HUD sigue emitiendo uf:reject en cada pulsación', sp.rejects >= 12, sp);
    const after = await page.evaluate(() => ({ en: player.energy, hp: player.hp })); check('pulsar bloqueado no gasta energía ni cambia el estado del juego', after.en >= before.en - 0.001 && after.hp === before.hp, { before, after });
    // 3) falta de energía: motivo + etiqueta persistente SIN pulsar
    await page.evaluate(() => { player.cds = [0, 0, 0]; player.energy = 0; }); await sleep(700);
    const bd = await page.evaluate(() => { const e = document.querySelector('#btn-s2 .uc-badge'); return e && e.textContent; });
    check('sin energía: etiqueta «FALTA n» visible en el botón sin pulsarlo', /^FALTA \d+$/.test(bd || ''), bd);
    await tap(page, 'btn-s2'); await sleep(200);
    const t2 = await page.evaluate(() => document.querySelector('.uc-reason').textContent); check('sin energía: «faltan n de energía»', /faltan \d+ de energía/.test(t2), t2);
    await page.evaluate(() => { player.energy = player.maxEnergy; }); await sleep(700);
    check('al recuperar energía la etiqueta desaparece sola', await page.evaluate(() => !document.querySelector('.uc-badge')));
    // 4) definitiva bloqueada por nivel o carga
    await page.evaluate(() => { runLevel = 1; player.ultCharge = 0; }); await sleep(300); await tap(page, 'btn-ult'); await sleep(200);
    const t3 = await page.evaluate(() => document.querySelector('.uc-reason').textContent); check('definitiva bloqueada: dice nivel o carga', /nivel|carga/.test(t3), t3);
    // 5) sin pantallas tapadas: auditoría de superposición (5 dispositivos x 3 estados)
    const au = spawnSync('node', [path.join(__dirname, 'audit.js'), '--base', base, '--out', path.join(ROOT, 'docs/ui-clarity/audit'), '--phase', 'test'], { encoding: 'utf8', timeout: 280000 });
    const rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/ui-clarity/audit/test_overlaps.json'), 'utf8')).filter(r => r.overlaps); const bad = rows.filter(r => r.overlaps.length || r.offscreen.length);
    check('cero superposiciones y cero elementos fuera de pantalla en 5 dispositivos × 3 estados', bad.length === 0, bad.map(r => r.viewport + ' ' + r.state + ' ' + r.overlaps.map(o => o.a + 'x' + o.b)));
    check('sin errores de página', errors.length === 0, errors); await ctx.close();
    // 5b) pantalla baja (568x320) y 667x375: la burbuja no tapa botones
    for (const [w, h] of [[568, 320], [667, 375]]) {
      const ctx2 = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }); await ctx2.addInitScript(() => { window.__campaignMode = true; });
      const pg = await ctx2.newPage(); await pg.goto(base + '/index.html'); await pg.waitForFunction(() => typeof assetsAllReady === 'function' && assetsAllReady(), null, { timeout: 180000 }); await sleep(500);
      await pg.evaluate(() => { for (const c of Object.values(save.champions)) c.unlocked = true; selectedClass = 'mago'; currentArena = 'bosque'; startRun(3); }); await sleep(1200);
      await pg.evaluate(() => { enemies.length = 0; spawnTimer = 1e12; player.cds = [5000, 0, 0]; player.energy = 0; }); await sleep(500); await tap(pg, 'btn-s1'); await sleep(250);
      const r = await pg.evaluate(() => { const b = document.querySelector('.uc-reason').getBoundingClientRect(); const hits = [...document.querySelectorAll('.ability-btn, #pause-btn, #mute-btn, #player-status, #goal-chip, #party, #joy-base')].filter(e => e.offsetWidth && +getComputedStyle(e).opacity > 0.05).filter(e => { const r = e.getBoundingClientRect(); return !(b.right <= r.left || b.left >= r.right || b.bottom <= r.top || b.top >= r.bottom); }).map(e => e.id); return { hits, top: Math.round(b.top), bottom: Math.round(b.bottom), right: Math.round(b.right), vw: innerWidth }; });
      check(`${w}x${h}: la burbuja no tapa botones, pausa, vida, objetivo ni joystick`, r.hits.length === 0 && r.right <= r.vw, r); await ctx2.close();
    }
    // 6) interruptor
    const off = await open('?uc=0'); await off.page.evaluate(() => { player.cds = [5000, 0, 0]; player.energy = 0; }); await tap(off.page, 'btn-s1'); await sleep(900);
    const o = await off.page.evaluate(() => ({ cls: document.documentElement.classList.contains('uc-off'), bubbles: document.querySelectorAll('.uc-reason').length, badge: document.querySelectorAll('.uc-badge').length, api: typeof UIClarity }));
    check('?uc=0 apaga todo (sin burbuja, sin etiqueta, sin API)', o.cls && o.bubbles === 0 && o.badge === 0 && o.api === 'undefined', o); check('?uc=0 sin errores', off.errors.length === 0, off.errors); await off.ctx.close();
  } finally { await browser.close(); srv.kill(); }
  console.log(fails ? 'RESULT FAIL (' + fails + ')' : 'RESULT OK'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
