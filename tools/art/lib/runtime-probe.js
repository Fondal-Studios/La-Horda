'use strict';
/* tools/art/lib/runtime-probe.js
   Mide en el JUEGO REAL (Chromium) qué arte dibuja cada campeón: por estado (idle/walk/attack/cast/ultimate/hit/death)
   y dirección (down/side/up/left) cuántos cuadros DISTINTOS salen y de qué archivo. Lo comparten
   tools/art/build-art-atlas.js y tests/art-runtime-clips.test.js. Lee el cuerpo real: drawHeroBody / drawFallenHero. */
const fs = require('node:fs'), http = require('node:http'), path = require('node:path');
const root = path.resolve(__dirname, '../../..');
const MIME = { '.js': 'application/javascript', '.html': 'text/html', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
function serve() {
  const server = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    const file = path.resolve(root, '.' + (u === '/' ? '/index.html' : u));
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    fs.readFile(file, (err, data) => { if (err) return res.writeHead(404).end(); res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream'); res.end(data); });
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}
/* ---- corre DENTRO de la página (page.evaluate). Devuelve {id:{looks:[...],packs:[...]}} ---- */
function inPage(opts) {
  const { onlyIds, withSkins, skinKinds } = opts || {};
  const wantKind = k => withSkins || (skinKinds && skinKinds.includes(k));
  const strip = s => String(s || '').replace(/^https?:\/\/[^/]+\//, '').replace(/\?.*$/, '');
  selectedClass = 'tanque'; currentArena = 'bosque'; startRun(1); state = 'paused'; window.ART_GATE_NO_VFX = true;
  const cv = document.createElement('canvas'); cv.width = cv.height = 300;
  const g = cv.getContext('2d', { willReadFrequently: true }), saved = ctx;
  let frames = null, raw = null;
  const oSized = drawAnimFrameSized, oFrame = drawAnimFrame;
  const dims = {};
  const rect = (img, f) => (img && img.src ? strip(img.currentSrc || img.src) : (img && img.tagName === 'CANVAS' ? 'canvas' : '?')) + '#' + f.x + ',' + f.y + ',' + f.w + ',' + f.h;
  const note = (img, f) => { const k = rect(img, f); const src = k.split('#')[0]; if (img && img.naturalWidth && !dims[src]) dims[src] = [img.naturalWidth, img.naturalHeight]; return k; };
  drawAnimFrameSized = function (img, clip, n) { try { if (frames) frames.push(note(img, clip.frames[n])); } catch (e) {} return oSized.apply(this, arguments); };
  drawAnimFrame = function (atlas, clip, n) { try { if (frames) frames.push(note(atlas.img, clip.frames[n])); } catch (e) {} return oFrame.apply(this, arguments); };
  const oDraw = g.drawImage;
  g.drawImage = function (img) { try { if (raw && img && img.tagName === 'IMG') raw.add(strip(img.currentSrc || img.src)); } catch (e) {} return oDraw.apply(this, arguments); };
  const DIRS = { down: [0, 1], side: [1, 0], left: [-1, 0], up: [0, -1] };
  const N = 24;
  function sample(id, look, st, dir) {
    const [fx, fy] = DIRS[dir], keys = new Set(), srcs = new Set(), rawSrcs = new Set(); let visible = 0, err = null;
    const h = makeHero(id, true, 150, 230);
    Object.assign(h, { fx, fy, _codexSkin: look.asc ? null : look.id, ascSkin: look.asc || 0 });
    const saveAnim = animNow;
    for (let i = 0; i < N; i++) {
      const t = i * 60; animNow = 100000 + t; h.animT = t; h.moving = st === 'walk'; h.attackAnim = 0; h.hurtTimer = 0; h._packCastUntil = 0; h.portCastState = null;
      if (st === 'attack' || st === 'cast' || st === 'ultimate') { h.attackAnim = 600 * (1 - i / N) + 1; if (st !== 'attack') h._packCastUntil = Infinity; if (st === 'ultimate') { h.portCastState = 'ultimate'; h._animCastKind = 2; } }
      if (st === 'hit') h.hurtTimer = 160 * (1 - i / N) + 1;
      if (st === 'death') h._deadAt = animNow - t;
      g.clearRect(0, 0, 300, 300); frames = []; raw = new Set(); ctx = g;
      try { if (st === 'death') drawFallenHero(h); else drawHeroBody(h, h.scale, false, false); } catch (e) { err = e.message; }
      finally { ctx = saved; }
      frames.forEach(k => { keys.add(k); srcs.add(k.split('#')[0]); }); raw.forEach(s => rawSrcs.add(s));
      const px = g.getImageData(0, 0, 300, 300).data; let any = false; for (let z = 3; z < px.length; z += 4) if (px[z] > 0) { any = true; break; }
      if (any) visible++;
    }
    animNow = saveAnim; frames = null; raw = null;
    const rawOnly = [...rawSrcs].filter(s => !srcs.has(s));
    return { frames: keys.size, srcs: [...srcs], rawSrcs: rawOnly, visible, err };
  }
  const out = {};
  const ids = Object.keys(CLASSES).filter(id => !onlyIds || onlyIds.includes(id));
  for (const id of ids) {
    const looks = [{ id: null, label: 'base' }];
    if (wantKind('set')) Object.entries(SET_SKINS).filter(([, s]) => s.champ === id).forEach(([sid]) => looks.push({ id: sid, label: 'set:' + sid }));
    if (wantKind('croma')) Object.entries(CROMA_SKINS).filter(([, s]) => s.champ === id).forEach(([sid]) => looks.push({ id: sid, label: 'croma:' + sid }));
    if (wantKind('asc') && typeof ASCENSION_SKINS !== 'undefined') (ASCENSION_SKINS[id] || []).forEach((s, i) => looks.push({ id: s.id, asc: i + 1, label: 'asc:' + s.id }));
    const res = [];
    for (const look of looks) {
      const states = {};
      for (const st of ['idle', 'walk', 'attack', 'cast', 'ultimate', 'hit', 'death']) {
        states[st] = {};
        for (const dir of Object.keys(DIRS)) states[st][dir] = sample(id, look, st, dir);
      }
      res.push({ label: look.label, states });
    }
    const P = typeof CHAMP_PACK !== 'undefined' ? CHAMP_PACK : {};
    const packs = Object.keys(P).filter(k => k === id || k === 'codex_' + id || k === id + '_codex' || k.startsWith(id + '_')).map(k => ({ key: k, ready: !!P[k].ready, failed: !!P[k].failed, src: P[k].atlas && P[k].atlas.src ? strip(P[k].atlas.currentSrc || P[k].atlas.src) : null, fw: P[k].fw, fh: P[k].fh, cols: P[k].cols }));
    out[id] = { name: CLASSES[id].name || id, looks: res, packs };
  }
  drawAnimFrameSized = oSized; drawAnimFrame = oFrame;
  for (const k of Object.keys(out)) for (const p of out[k].packs) if (p.src && !dims[p.src]) { const P = CHAMP_PACK[p.key]; if (P && P.atlas && P.atlas.naturalWidth) dims[p.src] = [P.atlas.naturalWidth, P.atlas.naturalHeight]; }
  return { champs: out, dims };
}
/* ---- DENTRO de la página: enemigos, élites, subjefes y jefes (ENEMY_BASE). Misma idea que tools/art/enemy_coverage.js
   (que además arma hojas de contacto): acá solo se anota QUÉ imagen y cuántos cuadros distintos dibuja cada estado. ---- */
function inPageEnemies(arenaOf) {
  const strip = s => { const i = String(s || '').indexOf('assets/'); return (i >= 0 ? String(s).slice(i) : String(s || '')).replace(/\?.*$/, ''); };
  const S = 520, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const g = cv.getContext('2d', { willReadFrequently: true });
  let calls = null; const dims = {};
  const dI = g.drawImage;
  g.drawImage = function (img0) {
    try {
      let img = img0; if (img && img._srcImg instanceof HTMLImageElement) img = img._srcImg;
      const a = arguments; let id, kind;
      if (img instanceof HTMLImageElement) { id = strip(img.currentSrc || img.src).replace(/\.webp$/, '.png'); kind = 'real'; if (img.naturalWidth && !dims[id]) dims[id] = [img.naturalWidth, img.naturalHeight]; }
      else if (img && img.width) { id = 'canvas:' + img.width + 'x' + img.height; kind = 'canvas'; } else { id = '?'; kind = 'canvas'; }
      const t = this.getTransform(), sc = Math.hypot(t.a, t.b);
      let sx = 0, sy = 0, sw = img.width, sh = img.height, dw = img.width, dh = img.height;
      if (a.length >= 9) { sx = a[1]; sy = a[2]; sw = a[3]; sh = a[4]; dw = a[7]; dh = a[8]; } else if (a.length >= 5) { dw = a[3]; dh = a[4]; }
      if (calls) calls.push({ id, kind, rect: [Math.round(sx), Math.round(sy), Math.round(sw), Math.round(sh)], area: Math.abs(dw * dh) * sc * sc, fx: this.globalCompositeOperation !== 'source-over' });
    } catch (e) {}
    return dI.apply(this, arguments);
  };
  const types = [];
  for (const t in ENEMY_BASE) {
    let a = (typeof codexArenaOfType === 'function' && codexArenaOfType(t)) || null;
    if (!a) for (const k in arenaOf) if (t.startsWith(k)) { a = arenaOf[k]; break; }
    if (a === 'divina' || !a) a = 'bosque';
    types.push({ t, arena: a, rank: ENEMY_BASE[t].rank || 'normal', name: ENEMY_BASE[t].name || t });
  }
  const byArena = {}; for (const x of types) (byArena[x.arena] = byArena[x.arena] || []).push(x);
  const out = {};
  const saved = ctx;
  for (const arena of Object.keys(byArena)) {
    try { selectedClass = 'guerrero'; currentArena = arena; lobbyAllies = []; startRun(1); for (const h of heroes) h.invulnTimer = 1e9; } catch (e) {}
    for (const x of byArena[arena]) {
      let e;
      try { e = spawnEnemy(x.t, false, false); } catch (err) { out[x.t] = Object.assign({}, x, { err: 'spawn: ' + err.message }); continue; }
      enemies = enemies.filter(o => o !== e); if (typeof activeChampion !== 'undefined' && activeChampion === e) activeChampion = null;
      const reset = () => { e.alive = true; e.fx = 1; e.fy = 0; e.animT = 0; e.attackAnim = 0; e._pkAtkLast = 0; e._pkAtkMax = 0; e.hitFlash = 0; e.stunTimer = 0; e.frozenTimer = 0; e.packSet = null; e.packTimer = 0; e._rdir = 0; e._pdir = 0; e._rfaceL = false; e.dashing = false; e.charging = false; e.charging2 = false; e.biteTelegraph = 0; e.skillAnim = null; e.fxAnim = null; delete e._dyingP; delete e._diedAt; e._an = null; e.hover = 0; e.abEmerge = 0; e.mnEmerge = 0; e.micBuild = false; e.cmRoof = false; e.abRise = 0; e.mnHide = false; };
      const draw = setup => {
        reset(); setup(e); calls = []; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, S, S); ctx = g;
        const k = Math.min(1, (S * 0.55) / ((e.radius || 20) * 4.5)); g.imageSmoothingEnabled = false; g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
        let err = null; try { g.save(); g.translate(S / 2, S * 0.78); g.scale(k, k); e.x = 0; e.y = 0; animNow = 100000; drawEnemyBody(e); g.restore(); } catch (ex) { err = ex.message; try { g.restore(); } catch (_) {} }
        ctx = saved;
        let main = null; for (const c of calls) if (!c.fx && !/^canvas:(64x64|128x128)$/.test(c.id) && (!main || c.area > main.area)) main = c;
        if (!main) for (const c of calls) if (!/^canvas:(64x64|128x128)$/.test(c.id) && (!main || c.area > main.area)) main = c;
        const d = g.getImageData(0, 0, S, S).data; let px = 0; for (let z = 3; z < d.length; z += 4) if (d[z] > 40) px++;
        calls = null;
        return { err, px, sig: main ? main.id + '#' + main.rect.join(',') : (px ? 'formas' : ''), kind: main ? main.kind : (px ? 'shapes' : ''), id: main ? main.id : null };
      };
      const sweep = (fn, n, step) => { const set = new Set(); let kind = null, id = null, px = 0; for (let i = 0; i < n; i++) { const r = draw(en => fn(en, i * step, i)); if (r.sig) set.add(r.sig); if (r.px) px++; if (r.kind && !kind) { kind = r.kind; id = r.id; } } return { frames: set.size, kind, id, drawn: px }; };
      const idle = sweep((en) => { en.stunTimer = 1; }, 1, 0);
      const walk = sweep((en, t) => { en.animT = t; }, 34, 45);
      const attack = sweep((en, t, i) => { en.attackAnim = 400 - i * 20; en._pkAtkMax = 400; en._pkAtkLast = en.attackAnim; }, 20, 0);
      const death = sweep((en, t, i) => { en.alive = false; en._dyingP = 0.1 + i * 0.1; }, 9, 0);
      const ids = new Set([idle.id, walk.id, attack.id, death.id].filter(Boolean));
      out[x.t] = Object.assign({}, x, { idle, walk, attack, death, files: [...ids].filter(i => /^assets\//.test(i)) });
    }
  }
  return { enemies: out, dims };
}
/* ---- fuera de la página ---- */
// Registra TODA imagen que el juego pide (src de HTMLImageElement) ANTES de que carguen los scripts del juego:
// así se sabe qué archivos se cargan de verdad (webp o png) y cuáles no los pide nadie.
const RECORDER = () => {
  const d = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  window.__artLoaded = new Set();
  Object.defineProperty(HTMLImageElement.prototype, 'src', { configurable: true, enumerable: d.enumerable, get: d.get, set(v) { try { const u = String(v), i = u.indexOf('assets/'); if (i >= 0) window.__artLoaded.add(u.slice(i).replace(/\?.*$/, '')); } catch (e) {} return d.set.call(this, v); } });
};
async function launch(query, opts) {
  const { chromium } = require('playwright');
  const server = await serve();
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || chromium.executablePath(), args: ['--no-sandbox'] });
  const page = await browser.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  if (opts && opts.record) await page.addInitScript(RECORDER);
  await page.goto('http://127.0.0.1:' + server.address().port + '/' + (query || '?dev=1'));
  await page.waitForFunction(() => typeof CHAMPION_ENTRY_BALANCE !== 'undefined', null, { timeout: 60000 });
  return { page, errors, close: async () => { await browser.close(); await new Promise(r => server.close(r)); } };
}
/* Carga TODO como lo hace el juego (grupos ch:* y ar:* y common) y espera a que terminen. */
async function loadEverything(page, onlyChampions) {
  await page.evaluate((onlyCh) => { try { cromaLoadAll(); } catch (e) {} if (onlyCh) assetsStartAllChampions(); else for (const g in ASSET_LOAD.groups) assetsStartGroup(g); assetsOnState('champions'); }, !!onlyChampions);
  await page.waitForFunction((onlyCh) => Object.values(CHAMP_PACK).every(p => p.ready || p.failed) && (onlyCh || Object.values(ASSET_LOAD.groups).every(o => o.done >= o.total)), !!onlyChampions, { timeout: 240000 });
  await page.waitForTimeout(500);
}
const ARENA_FALLBACK = { cm_: 'ciudad', mn_: 'minas', ab_: 'abismo', lev_: 'acuatica', foco_hielo: 'hielo', foco_convergencia: 'infernal' };
/* opts: {lazy:false|true|undefined, webp:false, onlyIds:[...], withSkins, enemies, loaded} */
async function measureAll(opts) {
  const o = opts || {};
  const lazy = o.lazy === false ? '&lazy=0' : o.lazy === true ? '&lazy=1' : '', webp = o.webp === false ? '&webp=0' : '';
  const s = await launch('?dev=1' + lazy + webp, { record: !!o.loaded });
  try {
    await loadEverything(s.page, !(o.enemies || o.loaded));
    const r = await s.page.evaluate(inPage, { onlyIds: o.onlyIds, withSkins: !!o.withSkins, skinKinds: o.skinKinds });
    const res = { champions: r.champs, dims: r.dims, errors: s.errors };
    if (o.enemies) { const e = await s.page.evaluate(inPageEnemies, ARENA_FALLBACK); res.enemies = e.enemies; Object.assign(res.dims, e.dims); }
    if (o.loaded) res.loaded = await s.page.evaluate(() => [...window.__artLoaded].sort());
    return res;
  } finally { await s.close(); }
}
// compatibilidad con el uso simple (solo campeones)
async function measureRoster(opts) { const r = await measureAll(opts); return { data: r.champions, errors: r.errors }; }
module.exports = { root, serve, launch, loadEverything, loadAllChampions: p => loadEverything(p, true), measureAll, measureRoster, inPage, inPageEnemies };
