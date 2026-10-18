'use strict';
/* Pruebas del motor de efectos propios (js/champions/vfx-b/) en el motor real:
   1. NINGÚN efecto consume Math.random (el azar de la simulación): se ejecuta cada receta con Math.random bloqueado.
   2. Pool acotado (≤ MAX) aunque se lancen miles de efectos, expiración y limpieza al reiniciar la partida.
   3. Argumentos hostiles (NaN, 0, negativos, enormes) no lanzan excepciones ni dejan entradas inválidas.
   4. Cada vínculo (acción de Expedición/Ascensión/Calidad cinco, tipo clásico/portador) corresponde a una habilidad real del roster.
   5. Red: kvbFx se graba en el anfitrión con argumentos numéricos y se repite en el invitado.
   6. Cada sprite generado tiene alfa 0/255 (pixel art nítido) y cabe en el límite de tamaño.
   Uso: ABILITY_BASE_URL=http://127.0.0.1:8961/ node tools/vfx/test-vfx-b.js */
const assert = require('node:assert/strict');
let chromium; try { ({chromium} = require('playwright')); } catch (e) { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright')); }
const BASE = process.env.ABILITY_BASE_URL || 'http://127.0.0.1:8961/';
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
  const page = await browser.newPage({viewport: {width: 844, height: 390}}), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(BASE, {waitUntil: 'domcontentloaded', timeout: 120000});
  await page.waitForFunction(() => typeof startRun === 'function' && typeof KVB !== 'undefined', null, {timeout: 120000});
  await page.waitForTimeout(2500);
  const r = await page.evaluate(() => {
    const out = {};
    // escena mínima para que inView() y los héroes existan
    netMatch = null; selectedClass = 'tanque'; currentArena = 'bosque'; lobbyAllies = []; startRun(3); state = 'playing'; enemies = []; for(const a of allies) a.stunTimer = 1e9; // los compañeros no actúan: así el pool solo refleja lo que lanza la prueba
    const ids = Object.keys(KVB_FX); out.recipes = ids.length;
    // 1) sin Math.random
    const oRand = Math.random; let rnd = 0; Math.random = () => { rnd++; return 0.5; };
    const px = player.x, py = player.y;
    // solo el código de vfx-b corre con Math.random contado (el motor de la partida sí lo usa; no es lo que se mide)
    for(const id of ids){ KVB.err = null; kvbFx(id, px + 60, py, 90, 0.3, 40, 10); kvbFx(id, px, py, 140, 2.1, 0.85, 0); for(let i = 0; i < 20; i++){ kvbUpdate(16); kvbDrawLayer('g'); kvbDrawLayer('t'); } if(KVB.err) out.err = (out.err || '') + id + ':' + KVB.err + ' '; }
    // pieles de objetos, overlays de estado y emisores por héroe: con todos los héroes del roster simulados
    const keep = Math.random; for(const k of ['renko', 'zahra', 'nahir']){ const h = heroes[0]; h.classKey = k; }
    kvbObjUpdate(); kvbObjDraw('g'); kvbObjDraw('t'); kvbOverlays('g'); kvbOverlays('t'); kvbOverlayUpdate(16);
    out.randCalls = rnd; Math.random = oRand; heroes[0].classKey = 'tanque';
    // 2) pool acotado + expiración + reinicio
    kvbReset(); for(let i = 0; i < 5000; i++) kvbFx(ids[i % ids.length], px + (i % 50), py, 120, i * .1, 50, 5); out.poolMax = KVB.pool.length; out.dropped = KVB.stats.dropped;
    for(let i = 0; i < 400; i++) update(16); out.poolAfter = KVB.pool.length; // 6,4 s: todo expirado (las entradas duran ≤ 1,2 s)
    kvbFx(ids[0], px, py, 90, 0, 40, 10); out.poolBeforeReset = KVB.pool.length; vfxResetRun(); out.poolAfterReset = KVB.pool.length;
    // 3) argumentos hostiles
    KVB.err = null; const bad = [NaN, undefined, null, 0, -50, 1e9, Infinity, 'x'];
    for(const id of ids) for(const a of bad) for(const b of bad){ try{ kvbFx(id, a, b, a, b, a, b); kvbFx(id, px, py, a, b, a, b); }catch(e){ out.hostile = (out.hostile || '') + id + ':' + e.message + ' '; } }
    for(let i = 0; i < 30; i++) update(16); render(); out.hostileErr = KVB.err || null; out.invalidEntries = KVB.pool.filter(e => !Number.isFinite(e.x) || !Number.isFinite(e.y)).length;
    vfxResetRun();
    // 4) vínculos contra el roster real
    const acts = new Set(), kinds = new Set();
    for(const k in CLASSES){ for(const s of [...CLASSES[k].skills, CLASSES[k].ultimate]){ acts.add((s.kind === 'ascension' ? 'asc:' : s.kind === 'expedition' ? 'ex:' : '') + (s.action || '')); kinds.add(k + ':' + s.kind); } }
    out.badBind = Object.keys(KVB_ACT).filter(k => !acts.has(k) && !acts.has('ex:' + k.replace(/^(ex|asc):/, '')) );
    out.badBindStrict = Object.keys(KVB_ACT).filter(k => { const [p, a] = k.split(':'); return !Object.values(CLASSES).some(c => [...c.skills, c.ultimate].some(s => s.action === a && ((p === 'ex' && s.kind === 'expedition') || (p === 'asc' && s.kind === 'ascension')))); });
    out.badQ5 = Object.keys(KVB_Q5).filter(a => !Object.values(CLASSES).some(c => [...c.skills, c.ultimate].some(s => s.action === a)));
    out.badClassic = Object.keys(KVB_CLASSIC).concat(Object.keys(KVB_PORT)).filter(k => !kinds.has(k));
    out.unboundRecipes = ids.filter(id => !Object.values(KVB_ACT).includes(id) && !Object.values(KVB_Q5).includes(id) && !Object.keys(KVB_CLASSIC).some(() => false));
    // 5) red
    netHookEvents(); netMatch = {role: 'host', recording: true}; _netEvents = [];
    const sk = player.cls.skills[2]; player.energy = 1e4; player.aim = {x: player.x + 115, y: player.y, dx: 1, dy: 0};
    kvbFx('renko.burial', player.x, player.y, 120, 0, 0, 0);
    const ev = JSON.parse(JSON.stringify(_netEvents)).filter(e => e[0] === 'kvbFx'); out.netEvents = ev.length; out.netNumeric = ev.every(e => e[1].every(x => typeof x === 'string' || typeof x === 'number'));
    netMatch = null; _netEvents = []; kvbReset(); for(const e of ev) window[e[0]](...e[1]); out.guestReplay = KVB.pool.length;
    // 6) sprites: alfa 0/255 y tamaño
    let maxPx = 0, soft = 0, sprites = 0;
    const scan = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; maxPx = Math.max(maxPx, c.width * c.height); sprites++; for(let i = 3; i < d.length; i += 4) if(d[i] !== 0 && d[i] !== 255) soft++; };
    for(const n in KVB_DEC){ for(const R of [30, 90, 200]){ const fr = kvbDecalFrames(n, kvbS(R)); fr.forEach(scan); } }
    for(const n in KVB_MOT){ kvbMotif(n).forEach(scan); } for(const n in KVB_BEAM) kvbBeamFrames(n).forEach(scan);
    out.sprites = sprites; out.softAlpha = soft; out.maxPx = maxPx;
    return out;
  });
  console.log(JSON.stringify(r));
  assert.equal(r.randCalls, 0, 'ningún efecto propio consume Math.random');
  assert(!r.err, 'recetas sin error: ' + r.err);
  assert(r.poolMax <= 128, 'pool acotado ' + r.poolMax);
  assert(r.dropped > 0, 'al saturar se descartan entradas secundarias');
  assert.equal(r.poolAfter, 0, 'todo expira');
  assert(r.poolBeforeReset > 0 && r.poolAfterReset === 0, 'el reinicio limpia el pool');
  assert(!r.hostile && !r.hostileErr, 'argumentos hostiles sin excepciones: ' + (r.hostile || r.hostileErr));
  assert.equal(r.invalidEntries, 0, 'ninguna entrada con coordenadas inválidas');
  assert.deepEqual(r.badBindStrict, [], 'vínculos Expedición/Ascensión con habilidad real');
  assert.deepEqual(r.badQ5, [], 'vínculos Calidad cinco con habilidad real');
  assert.deepEqual(r.badClassic, [], 'vínculos clásicos/portadores con habilidad real');
  assert(r.netEvents >= 1 && r.netNumeric, 'kvbFx se graba con argumentos numéricos');
  assert(r.guestReplay >= 1, 'el invitado repite el efecto');
  assert.equal(r.softAlpha, 0, 'todos los sprites generados son nítidos (alfa 0/255)');
  assert(r.maxPx <= 160 * 160, 'sprite máximo ' + r.maxPx);
  assert.equal(errors.length, 0, 'sin errores de página: ' + errors.join(' | '));
  console.log('PASS vfx-b: sin Math.random, pool acotado y limpio, argumentos hostiles, vínculos reales, red, alfa nítido');
  await browser.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
