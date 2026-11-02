'use strict';
// Evaluador independiente (Módulo D) — estados raros / "pegado" del feedback de combate.
// BASE=... LABEL=... OUT=... node eval-edge.js
const { sleep, launch, VPS, newPage, PROFILE, center, fs, path } = require('./lib');
const BASE = process.env.BASE, LABEL = process.env.LABEL, OUT = process.env.OUT;
const INIT = () => { window.__ev = []; for (const n of ['uf:press', 'uf:confirm', 'uf:reject', 'uf:release']) window.addEventListener(n, e => window.__ev.push(n + ':' + (e.detail && e.detail.id))); };
const tch = (cdp, type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
(async () => {
  const browser = await launch(); const out = { label: LABEL, tests: [] };
  const vp = VPS['844x390'];
  const { ctx, page, errors } = await newPage(browser, BASE, vp, { init: INIT }); await page.evaluate(PROFILE); const cdp = await ctx.newCDPSession(page);
  const prep = async champ => { await page.evaluate(champ => { for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; } selectedClass = champ; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte']; netMatch = null; startRun(3); setState('playing'); enemies = []; spawnTimer = 1e9; levelTimer = 0; levelDuration = 1e9; player.energy = 1e4; player.cds = [0, 0, 0]; player.ultCharge = player.ultMax; player.hp = player.maxHp * .5; player.emergCharges = 2; runLevel = Math.max(runLevel, ULT_MIN_ARENA_LEVEL); updateHUD(); window.__ev = []; }, champ); await sleep(600); };
  const cl = id => page.evaluate(id => document.getElementById(id).className, id);
  const stuck = async ids => { const r = {}; for (const id of ids) { const c = await cl(id); r[id] = /uf-(press|hold|reject|confirm)/.test(c) ? c : 'limpio'; } return r; };
  const rec = (name, data) => { out.tests.push({ name, ...data }); console.log(name, JSON.stringify(data).slice(0, 300)); };
  const ALL = ['btn-basic', 'btn-s1', 'btn-s2', 'btn-s3', 'btn-ult', 'btn-emerg'];
  await prep('mago');
  const c1 = await center(page, '#btn-s1'), c2 = await center(page, '#btn-s2'), cb = await center(page, '#btn-basic'), cu = await center(page, '#btn-ult');
  // 1. touchCancel
  await tch(cdp, 'touchStart', [{ x: c1.x, y: c1.y, id: 1 }]); await sleep(300); const mid = await cl('btn-s1'); await tch(cdp, 'touchCancel', []); await sleep(200);
  rec('touchCancel', { durante: mid, despues: await stuck(ALL) });
  await prep('mago');
  // 2. multitoque: s1 y s2 a la vez; soltar uno; luego el otro
  await tch(cdp, 'touchStart', [{ x: c1.x, y: c1.y, id: 1 }, { x: c2.x, y: c2.y, id: 2 }]); await sleep(300);
  const both = { s1: await cl('btn-s1'), s2: await cl('btn-s2') };
  await tch(cdp, 'touchEnd', [{ x: c2.x, y: c2.y, id: 2 }]); await sleep(150); const one = { s1: await cl('btn-s1'), s2: await cl('btn-s2') };
  await tch(cdp, 'touchEnd', []); await sleep(300);
  rec('multitoque s1+s2', { mantenidos: both, soltado_s1: one, final: await stuck(ALL), eventos: await page.evaluate(() => window.__ev) });
  await prep('mago');
  // 3. multitoque ataque + habilidad (patrón real: ataque sostenido + s1)
  await tch(cdp, 'touchStart', [{ x: cb.x, y: cb.y, id: 1 }]); await sleep(120); await tch(cdp, 'touchStart', [{ x: cb.x, y: cb.y, id: 1 }, { x: c1.x, y: c1.y, id: 2 }]); await sleep(150);
  const d3 = { basic: await cl('btn-basic'), s1: await cl('btn-s1') };
  await tch(cdp, 'touchEnd', [{ x: cb.x, y: cb.y, id: 1 }]); await sleep(300); await tch(cdp, 'touchEnd', []); await sleep(300);
  rec('ataque sostenido + s1', { durante: d3, final: await stuck(ALL) });
  await prep('mago');
  // 4. arrastrar fuera del botón y soltar fuera
  await tch(cdp, 'touchStart', [{ x: c1.x, y: c1.y, id: 1 }]); await sleep(100);
  for (let i = 1; i <= 6; i++) { await tch(cdp, 'touchMove', [{ x: c1.x - i * 30, y: c1.y - i * 10, id: 1 }]); await sleep(30); }
  const drag = await cl('btn-s1'); await tch(cdp, 'touchEnd', []); await sleep(300);
  rec('arrastrar fuera y soltar', { durante: drag, final: await stuck(ALL) });
  await prep('mago');
  // 5. mouse: presionar y soltar fuera del botón
  await page.mouse.move(c1.x, c1.y); await page.mouse.down(); await sleep(200); await page.mouse.move(c1.x - 300, c1.y - 100, { steps: 5 }); await sleep(100); const mdrag = await cl('btn-s1'); await page.mouse.up(); await sleep(200);
  rec('mouse: soltar fuera', { durante: mdrag, final: await stuck(ALL) });
  await prep('mago');
  // 6. pausa durante la presión (toque) y soltar tras pausa
  await tch(cdp, 'touchStart', [{ x: c1.x, y: c1.y, id: 1 }]); await sleep(250); await page.evaluate(() => setState('paused')); await sleep(250);
  const pdur = await cl('btn-s1'); await tch(cdp, 'touchEnd', []); await sleep(250);
  rec('pausa durante presión', { durante_pausa: pdur, tras_soltar: await stuck(ALL) });
  await prep('mago');
  // 7. teclado: tecla mantenida + pausa + keyup / blur / visibilidad
  await page.keyboard.down('2'); await sleep(250); await page.evaluate(() => setState('paused')); await sleep(100); await page.keyboard.up('2'); await sleep(200);
  rec('teclado 2 + pausa + keyup', { final: await stuck(ALL) });
  await prep('mago');
  await page.keyboard.down('3'); await sleep(250); await page.evaluate(() => window.dispatchEvent(new Event('blur'))); await sleep(150); const blur = await cl('btn-s3'); await page.keyboard.up('3'); await sleep(100);
  rec('blur ventana con tecla mantenida', { tras_blur: blur, final: await stuck(ALL) });
  await prep('mago');
  await tch(cdp, 'touchStart', [{ x: c1.x, y: c1.y, id: 1 }]); await sleep(250);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); }); await sleep(150); const vis = await cl('btn-s1');
  await page.evaluate(() => { delete document.hidden; }); await tch(cdp, 'touchEnd', []); await sleep(250);
  rec('pestaña oculta (visibilitychange sintético) con toque', { tras_ocultar: vis, final: await stuck(ALL) });
  // 7b. pestaña oculta real: abrir otra pestaña
  await prep('mago');
  await tch(cdp, 'touchStart', [{ x: c1.x, y: c1.y, id: 1 }]); await sleep(250);
  const p2 = await ctx.newPage(); await p2.goto('about:blank'); await p2.bringToFront(); await sleep(400);
  const hid = await page.evaluate(() => document.visibilityState); const vis2 = await cl('btn-s1'); await page.bringToFront(); await sleep(200); await tch(cdp, 'touchEnd', []).catch(() => { }); await sleep(250);
  rec('pestaña oculta real (bringToFront)', { visibilityState: hid, tras_ocultar: vis2, final: await stuck(ALL) }); await p2.close();
  // 8. rechazo: presionar en cooldown no debe dar "confirm"
  await prep('mago');
  await page.evaluate(() => { player.cds = [7400, 7400, 7400]; player.cdTotal = [12000, 12000, 12000]; updateHUD(); updateAbilityButtons && updateAbilityButtons(); }); await sleep(300);
  await page.evaluate(() => { window.__ev = []; });
  for (const id of ['btn-s1', 's2', 's3']) { }
  for (const [id, c] of [['btn-s1', c1], ['btn-s2', c2]]) { await tch(cdp, 'touchStart', [{ x: c.x, y: c.y, id: 1 }]); await sleep(80); await tch(cdp, 'touchEnd', []); await sleep(500); }
  rec('toque rápido en cooldown (s1,s2)', { eventos: await page.evaluate(() => window.__ev) });
  // 9. Ult cuando no está cargada / emergencia con vida llena / gastada
  await prep('mago');
  await page.evaluate(() => { player.ultCharge = 0; updateHUD(); }); await sleep(300); await page.evaluate(() => { window.__ev = []; });
  const seen = []; await page.evaluate(() => { window.__seen = new Set(); const e = document.getElementById('btn-ult'); new MutationObserver(() => window.__seen.add(e.className)).observe(e, { attributes: true, attributeFilter: ['class'] }); });
  await tch(cdp, 'touchStart', [{ x: cu.x, y: cu.y, id: 1 }]); await sleep(120); await tch(cdp, 'touchEnd', []); await sleep(500);
  rec('definitiva sin carga (rechazo?)', { eventos: await page.evaluate(() => window.__ev), clases: await page.evaluate(() => [...window.__seen]), clsAhora: await cl('btn-ult') });
  const ce = await center(page, '#btn-emerg');
  if (ce) {
    await page.evaluate(() => { player.hp = player.maxHp; player.emergCharges = 2; updateHUD(); }); await sleep(300); await page.evaluate(() => { window.__ev = []; });
    await tch(cdp, 'touchStart', [{ x: ce.x, y: ce.y, id: 1 }]); await sleep(120); await tch(cdp, 'touchEnd', []); await sleep(500);
    rec('emergencia con vida llena', { eventos: await page.evaluate(() => window.__ev), cls: await cl('btn-emerg') });
    await page.evaluate(() => { player.hp = player.maxHp * .4; player.emergCharges = 0; updateHUD(); }); await sleep(300); await page.evaluate(() => { window.__ev = []; });
    await tch(cdp, 'touchStart', [{ x: ce.x, y: ce.y, id: 1 }]); await sleep(120); await tch(cdp, 'touchEnd', []); await sleep(500);
    rec('emergencia gastada (0 cargas)', { eventos: await page.evaluate(() => window.__ev), cls: await cl('btn-emerg') });
  }
  // 10. confirm falso: presionar s1 listo y soltar fuera (cancelar) -> ¿confirm sin ejecución?
  await prep('mago');
  await page.evaluate(() => { window.__ev = []; }); const snap0 = await page.evaluate(() => player.cds.slice());
  await tch(cdp, 'touchStart', [{ x: c1.x, y: c1.y, id: 1 }]); await sleep(100); for (let i = 1; i <= 6; i++) { await tch(cdp, 'touchMove', [{ x: c1.x - i * 25, y: c1.y + i * 4, id: 1 }]); await sleep(25); } await tch(cdp, 'touchEnd', []); await sleep(700);
  rec('cast cancelado por arrastre (¿confirm?)', { eventos: await page.evaluate(() => window.__ev), cdsAntes: snap0, cdsDespues: await page.evaluate(() => player.cds.slice()) });
  // 10b. confirm falso: presionar s1 listo (mantener) y que otra cosa lo saque de ready (energía agotada por otra habilidad por teclado)
  await prep('mago');
  await page.evaluate(() => { player.energy = 40; window.__ev = []; updateHUD(); }); await sleep(200);
  await tch(cdp, 'touchStart', [{ x: c1.x, y: c1.y, id: 1 }]); await sleep(60); await page.evaluate(() => { player.energy = 0; updateHUD(); }); await sleep(300); await tch(cdp, 'touchEnd', []); await sleep(500);
  rec('energía se agota mientras se mantiene (¿confirm falso?)', { eventos: await page.evaluate(() => window.__ev), cds: await page.evaluate(() => player.cds.slice()) });
  // 11. HUD sigue destruido? .uf-fx duplicados y estructura
  await prep('mago');
  for (let i = 0; i < 6; i++) { await tch(cdp, 'touchStart', [{ x: c1.x, y: c1.y, id: 1 }]); await sleep(40); await tch(cdp, 'touchEnd', []); await sleep(80); }
  rec('nodos .uf-fx tras 6 toques', { porBoton: await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.ability-btn')].map(e => [e.id, e.querySelectorAll('.uf-fx').length]))), hijosS1: await page.evaluate(() => document.getElementById('btn-s1').children.length) });
  // 12. Ilkan ult + nigro
  for (const champ of ['ilkan', 'nigromante']) {
    await prep(champ); const cu2 = await center(page, '#btn-ult'); await page.evaluate(() => { window.__ev = []; });
    const b = await page.evaluate(() => ({ u: player.ultCharge, m: player.ultMax, ik: typeof ilkanUltBlocked === 'function' ? ilkanUltBlocked(player) : null }));
    await tch(cdp, 'touchStart', [{ x: cu2.x, y: cu2.y, id: 1 }]); await sleep(150); const dur = await cl('btn-ult'); await tch(cdp, 'touchEnd', []); await sleep(900);
    rec('ult ' + champ + ' (toque)', { antes: b, durante: dur, despues: await page.evaluate(() => ({ u: player.ultCharge, cd: player.ultCd, demon: !!player.nigroDemonForm, st: state })), eventos: await page.evaluate(() => window.__ev), cls: await cl('btn-ult') });
    await prep(champ); await page.evaluate(() => { window.__ev = []; }); await page.keyboard.down('r'); await sleep(150); await page.keyboard.up('r'); await sleep(900);
    rec('ult ' + champ + ' (tecla R)', { despues: await page.evaluate(() => ({ u: player.ultCharge, cd: player.ultCd, demon: !!player.nigroDemonForm })), eventos: await page.evaluate(() => window.__ev), cls: await cl('btn-ult') });
  }
  out.errors = errors.slice(0, 10);
  fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(out, null, 1)); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
