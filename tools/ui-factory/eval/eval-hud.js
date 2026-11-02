'use strict';
// Evaluador independiente (Módulo D) — feedback de botones de combate. Mismo script contra candidato y baseline.
// Uso: BASE=http://127.0.0.1:8881 LABEL=cand OUT=docs/ui-factory/evidence/eval1/hud-cand.json VPS=844x390,667x375,1280x800 node eval-hud.js
const { sleep, launch, VPS, newPage, PROFILE, center, fs, path } = require('./lib');
const BASE = process.env.BASE, LABEL = process.env.LABEL, OUT = process.env.OUT;
const VPLIST = (process.env.VPS || '844x390,667x375,1280x800').split(',');
const CHAMPS = (process.env.CHAMPS || 'mago,ilkan,nigromante').split(',');
const BTNS = (process.env.BTNS || 'btn-basic,btn-s1,btn-s2,btn-s3,btn-ult,btn-emerg').split(',');
const SHOTDIR = process.env.SHOTDIR;
const KEY = { 'btn-basic': ' ', 'btn-s1': '1', 'btn-s2': '2', 'btn-s3': '3', 'btn-ult': 'r', 'btn-emerg': 'q' };
const CDI = { 'btn-s1': 0, 'btn-s2': 1, 'btn-s3': 2 };

const INIT = () => {
  window.__ev = [];
  for (const n of ['uf:press', 'uf:confirm', 'uf:reject', 'uf:release']) window.addEventListener(n, e => window.__ev.push({ n, t: performance.now(), d: e.detail }));
  window.__sig = el => { const cs = getComputedStyle(el); return [cs.scale, cs.translate, cs.transform, cs.filter, cs.boxShadow, cs.borderTopColor, cs.borderTopStyle, cs.opacity].join('|'); };
  // grabador: marca de cola/handler, firma por cuadro, todas las clases vistas
  window.__startRec = id => {
    const el = document.getElementById(id); const r = { id, down: null, up: null, key: null, sigRest: window.__sig(el), firstVisible: null, classes: new Set(), mut: [], frames: 0, done: false };
    r.onDown = e => { if (!(el === e.target || el.contains(e.target))) return; const n = performance.now(); r.down = { ts: e.timeStamp, handlerNow: n, queue: n - e.timeStamp, syncCls: el.className, syncSig: window.__sig(el) !== r.sigRest }; };
    r.onKey = e => { if (e.type !== 'keydown' || e.repeat) return; const n = performance.now(); r.key = { ts: e.timeStamp, handlerNow: n, queue: n - e.timeStamp, syncCls: el.className, syncSig: window.__sig(el) !== r.sigRest }; };
    document.addEventListener('pointerdown', r.onDown, false); window.addEventListener('keydown', r.onKey, false);
    r.mo = new MutationObserver(() => { r.classes.add(el.className); r.mut.push([performance.now(), el.className]); }); r.mo.observe(el, { attributes: true, attributeFilter: ['class'] });
    r.classes.add(el.className);
    const loop = () => { if (r.done) return; r.frames++; const base = r.down || r.key;
      if (base && r.firstVisible == null && window.__sig(el) !== r.sigRest) r.firstVisible = performance.now() - base.handlerNow;
      requestAnimationFrame(loop); };
    requestAnimationFrame(loop); window.__r = r; return true; };
  window.__stopRec = () => { const r = window.__r; r.done = true; r.mo.disconnect(); document.removeEventListener('pointerdown', r.onDown); window.removeEventListener('keydown', r.onKey);
    return { down: r.down, key: r.key, firstVisibleAfterHandlerMs: r.firstVisible, classes: [...r.classes], mut: r.mut.length }; };
};

async function prepare(page, champ) {
  await page.evaluate(champ => {
    for (const ck in save.champions) { const s = save.champions[ck]; s.unlocked = true; s.level = 20; }
    selectedClass = champ; currentArena = 'bosque'; lobbyAllies = ['tanque', 'soporte', 'guerrero']; netMatch = null; startRun(3); setState('playing'); updateHUD();
    window.__set = st => {
      enemies = []; spawnTimer = 1e9; levelTimer = 0; if (typeof levelDuration !== 'undefined') levelDuration = Math.max(levelDuration, 1e9); player.alive = true; player.hp = player.maxHp * 0.5; player.emergCharges = Math.max(player.emergCharges || 0, 2);
      runLevel = Math.max(runLevel, typeof ULT_MIN_ARENA_LEVEL !== 'undefined' ? ULT_MIN_ARENA_LEVEL : 1);
      player.basicCd = 0;
      if (st === 'ready') { player.energy = 1e4; player.cds = [0, 0, 0]; player.ultCharge = player.ultMax; player.ultCd = 0; }
      if (st === 'cd') { player.energy = 1e4; player.cds = [7400, 7400, 7400]; player.cdTotal = [12000, 12000, 12000]; player.ultCharge = 0; player.ultCd = 0; player.emergCharges = 0; }
      if (st === 'noen') { player.energy = 0; player.cds = [0, 0, 0]; player.ultCharge = player.ultMax; player.emergCharges = 0; }
      if (st === 'uncharged') { player.ultCharge = 0; }
      updateAbilityButtons && updateAbilityButtons(); updateHUD(); updateSkillButtonStates && updateSkillButtonStates();
    };
    window.__snap = () => ({ cds: (player.cds || []).slice(), energy: player.energy, ult: player.ultCharge, ultCd: player.ultCd, bcd: player.basicCd || 0, em: player.emergCharges, hp: player.hp, state, demon: !!player.nigroDemonForm, ilkan: player.ilkanFinaleReady, fx: (typeof particles !== 'undefined' ? 0 : 0) });
    window.__set('ready');
  }, champ);
  await sleep(600);
}
const touch = (cdp, type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
async function clipOf(page, id) { return page.evaluate(id => { const b = document.getElementById(id).getBoundingClientRect(); return { x: Math.max(0, b.left - 10), y: Math.max(0, b.top - 10), width: b.width + 20, height: b.height + 20 }; }, id); }
const PNG = require('node:zlib');
function diffPct(a, b) { // comparación de bytes del PNG decodificado barata: usa page para decodificar sería mejor; aquí comparamos buffers por muestreo de píxeles RGBA vía canvas en página
  return null; }
async function pixelDiff(page, b1, b2) {
  return page.evaluate(async ([a, b]) => { const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s; });
    const [i1, i2] = await Promise.all([load(a), load(b)]); const c = document.createElement('canvas'); c.width = i1.width; c.height = i1.height; const x = c.getContext('2d');
    x.drawImage(i1, 0, 0); const d1 = x.getImageData(0, 0, c.width, c.height).data; x.clearRect(0, 0, c.width, c.height); x.drawImage(i2, 0, 0); const d2 = x.getImageData(0, 0, c.width, c.height).data; let n = 0; const t = d1.length / 4;
    for (let k = 0; k < d1.length; k += 4) if (Math.abs(d1[k] - d2[k]) + Math.abs(d1[k + 1] - d2[k + 1]) + Math.abs(d1[k + 2] - d2[k + 2]) > 40) n++; return Math.round(n * 1000 / t) / 10; }, [b1.toString('base64'), b2.toString('base64')]);
}
async function trial(page, cdp, id, st, input, champ, vpName, saveShots) {
  await page.evaluate(st => window.__set(st), st); await sleep(250);
  const el = await center(page, '#' + id); if (!el) return { skipped: 'no visible' };
  await page.evaluate(() => { document.getElementById('game').style.visibility = 'hidden'; });
  const clip = await clipOf(page, id);
  const rest1 = await page.screenshot({ clip }); await sleep(120); const rest2 = await page.screenshot({ clip });
  const noise = await pixelDiff(page, rest1, rest2);
  await page.evaluate(id => { window.__evstart = window.__ev.length; window.__startRec(id); }, id);
  const before = await page.evaluate(() => window.__snap());
  const cls = () => page.evaluate(id => document.getElementById(id).className, id);
  const t = {};
  const quick = input === 'tap';
  if (input === 'touch' || quick) await touch(cdp, 'touchStart', [{ x: el.x, y: el.y, id: 1 }]);
  else if (input === 'mouse') { await page.mouse.move(el.x, el.y); await page.mouse.down(); }
  else { await page.keyboard.down(KEY[id] === ' ' ? 'Space' : KEY[id]); }
  let press = null;
  if (quick) { await sleep(60); t.at60 = await cls(); }
  else {
  await sleep(30); t.at30 = await cls(); await sleep(100); t.at130 = await cls(); await sleep(150); t.at280 = await cls();
  var held = await page.screenshot({ clip }); press = await pixelDiff(page, rest1, held);
  if (saveShots && !quick) { fs.mkdirSync(SHOTDIR, { recursive: true }); const b = `${SHOTDIR}/${LABEL}_${vpName}_${champ}_${id}_${st}_${input}`; fs.writeFileSync(b + '_reposo.png', rest1); fs.writeFileSync(b + '_presionado.png', held); }
  await sleep(250); t.at530 = await cls(); }
  if (input === 'touch' || quick) await touch(cdp, 'touchEnd', []); else if (input === 'mouse') await page.mouse.up(); else await page.keyboard.up(KEY[id] === ' ' ? 'Space' : KEY[id]);
  await sleep(60); t.after60 = await cls(); await sleep(900); t.after960 = await cls();
  const rec = await page.evaluate(() => window.__stopRec());
  const after = await page.evaluate(() => window.__snap());
  const evs = await page.evaluate(() => window.__ev.slice(window.__evstart).map(e => e.n));
  await page.evaluate(() => { document.getElementById('game').style.visibility = ''; });
  // ejecución real (verdad de terreno del juego)
  let executed = false;
  if (CDI[id] != null) executed = after.cds[CDI[id]] > before.cds[CDI[id]] + 1;
  else if (id === 'btn-ult') executed = after.ult < before.ult || after.demon !== before.demon || after.ultCd > before.ultCd || !!(before.ilkan && !after.ilkan);
  else if (id === 'btn-basic') executed = after.bcd > before.bcd || after.bcd > 0;
  else if (id === 'btn-emerg') executed = after.em < before.em;
  const seen = rec.classes.join(' ');
  return { noisePct: noise, pressPct: press, queueMs: (rec.down || rec.key || {}).queue, syncVisible: (rec.down || rec.key || {}).syncSig, syncCls: (rec.down || rec.key || {}).syncCls,
    firstVisibleAfterHandlerMs: rec.firstVisibleAfterHandlerMs, cls: t, executed, ufEvents: evs, sawConfirmCls: /uf-confirm/.test(seen), sawRejectCls: /uf-reject|deny/.test(seen), sawPressCls: /uf-press/.test(seen), sawHoldCls: /uf-hold/.test(seen),
    stuckAfter: /uf-(press|hold)/.test(t.after60) , classesSeen: [...new Set(seen.split(/\s+/))].filter(Boolean) };
}

(async () => {
  const { serve } = require('./lib');
  const browser = await launch(); const res = { label: LABEL, base: BASE, date: new Date().toISOString(), chromium: browser.version(), cells: [], errors: [] };
  for (const vn of VPLIST) {
    const vp = VPS[vn]; const { ctx, page, errors } = await newPage(browser, BASE, vp, { init: INIT }); await page.evaluate(PROFILE); const cdp = await ctx.newCDPSession(page);
    let inputs = vp.mobile ? ['touch', 'tap', 'key'] : ['mouse', 'tap', 'key']; if (vn === '667x375') inputs = ['touch', 'tap'];
    for (const champ of (vn === '844x390' ? CHAMPS : ['mago'])) {
      await prepare(page, champ);
      for (const id of BTNS) {
        for (const st of (vn === '667x375' ? ['ready'] : ['ready', 'cd', 'noen', 'uncharged'])) {
          if (st === 'uncharged' && id !== 'btn-ult') continue;
          for (const input of inputs) {
            if (input === 'key' && vn === '667x375') continue;
            let r; try { r = await trial(page, cdp, id, st, input, champ, vn, input !== 'key' && input !== 'tap' && (vn !== '667x375')); } catch (e) { r = { error: String(e).slice(0, 200) }; }
            // reinicia tras cada ensayo (transformaciones, estados)
            try { if (id === 'btn-ult' || id === 'btn-emerg' || id === 'btn-basic') await prepare(page, champ); else await page.evaluate(() => { document.getElementById('game').style.visibility = ''; window.__set('ready'); }); } catch (e) { r.prepErr = String(e).slice(0, 100); }
            res.cells.push({ vp: vn, champ, id, state: st, input, ...r }); process.stdout.write('.');
          }
        }
      }
    }
    res.errors.push(...errors.slice(0, 5).map(e => vn + ' ' + e)); await ctx.close();
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(res, null, 1)); await browser.close(); console.log('\nlisto', OUT);
})().catch(e => { console.error(e); process.exit(1); });
