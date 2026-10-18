'use strict';
/* ============================================================
   js/champions/skill-fx-a/bind.js — une cada habilidad de la mitad A con su efecto de sprite propio.
   Geometría real: durante el lanzamiento se registran las llamadas que la propia habilidad hace (aimPoint, aimDir,
   vfxSkillCone, kitFx, kitFxLine) y los objetos que crea (portadorObjects nuevos), así el efecto cae exactamente en el
   punto/radio/dirección que usa el motor. No se lee ni se cambia ningún valor de balance.
   Los efectos genéricos del kit (kitFx) se silencian en las habilidades con efecto propio; vfxSfaPlay cuenta como
   efecto visual para el filtro de habilidades.
   ============================================================ */
const SFA_REC = {on: false, mute: false, fx: [], pts: [], dirs: [], cones: [], shocks: [], tgts: [], bolts: [], frost: []};
const SFA_LISTS = [];     // listas de estado del motor que se dibujan como zona mientras la entrada vive: {get, ok, theme, r(e), end}
const SFA_HEROZ = [];     // zonas ligadas al héroe (temporizadores): {key, on(h), r(h), theme}
const SFA_POLL = [];      // funciones que se llaman cada cuadro para efectos derivados de estado
const SFA_BIND = {};      // clave de campeón -> {0,1,2,ult: spec(c)}
const SFA_OBJ = {};       // kind de portadorObjects -> {theme, art:'zone', end:'nova'|null, pulse:bool, rk:'r'}
(function () {
  const wrap = (name, fn) => { const o = window[name]; if (typeof o !== 'function') return; window[name] = function () { if (SFA_REC.on) fn.apply(null, arguments); return o.apply(this, arguments); }; };
  const aP = window.aimPoint; window.aimPoint = function () { const p = aP.apply(this, arguments); if (SFA_REC.on && p) SFA_REC.pts.push({x: p.x, y: p.y, r: arguments[2]}); return p; };
  const aT = window.aimTarget; window.aimTarget = function () { const e = aT.apply(this, arguments); if (SFA_REC.on && e) SFA_REC.tgts.push(e); return e; };
  const aD = window.aimDir; window.aimDir = function () { const d = aD.apply(this, arguments); if (SFA_REC.on && d) SFA_REC.dirs.push({x: d.x, y: d.y, range: arguments[1]}); return d; };
  wrap('pushChainBolt', (x1, y1, x2, y2, th) => SFA_REC.bolts.push({x1, y1, x2, y2}));
  wrap('vfxFrostCrown', (x, y, r) => SFA_REC.frost.push({x, y, r}));
  wrap('vfxSkillCone', (x, y, r, angle, arc) => SFA_REC.cones.push({x, y, r, angle, arc}));
  wrap('vfxShock', (x, y, r0, r1) => SFA_REC.shocks.push({x, y, r: r1}));
  const kf = window.kitFx; window.kitFx = function (theme, x, y, r, o) { if (SFA_REC.on) { SFA_REC.fx.push({fn: 'fx', theme, x, y, r, ult: !!(o && o.ult)}); if (SFA_REC.mute) return sfaQuiet(() => kf.apply(this, arguments)); } return kf.apply(this, arguments); };
  const kl = window.kitFxLine; window.kitFxLine = function (theme, ax, ay, bx, by, w) { if (SFA_REC.on) { SFA_REC.fx.push({fn: 'line', theme, ax, ay, bx, by, w}); if (SFA_REC.mute) return sfaQuiet(() => kl.apply(this, arguments)); } return kl.apply(this, arguments); };
})();
// El kit genérico se ejecuta igual (mismas partículas y mismo azar: la paridad mecánica no cambia) pero sin sus sprites ni ondas, que ahora pone el efecto propio.
function sfaQuiet(fn) { const vs = window.vfxSprite, vk = window.vfxShock; window.vfxSprite = window.vfxShock = function () {}; try { return fn(); } finally { window.vfxSprite = vs; window.vfxShock = vk; } }
function sfaP(art, theme, x, y, r, o) { o = o || {}; vfxSfaPlay(art, theme, x, y, r, o.ang || 0, o.dur, o.bx, o.by, o.w, o.noEnd ? -2 : o.fi, o.arc); }
const sfaHeroIdx = h => heroes.indexOf(h);
// geometría de ayuda a partir del registro
const sfaFx = (c, fn) => c.rec.fx.find(f => f.fn === (fn || 'fx'));
const sfaObj = (c, kindRe) => c.objs.find(o => !kindRe || kindRe.test(o.kind));
(function () {
  const ca = castAbility;
  castAbility = function (caster, sk, isUlt, idx) {
    const B = caster && SFA_BIND[caster.classKey];
    if (!B || SFA_REC.on || window.SFA_OFF) return ca.apply(this, arguments);
    const slot = isUlt ? 'ult' : idx, spec = B[slot];
    if (!spec) return ca.apply(this, arguments);
    const id0 = typeof portadorNextId === 'number' ? portadorNextId : 0;
    Object.assign(SFA_REC, {on: true, mute: spec.mute !== false, fx: [], pts: [], dirs: [], cones: [], shocks: [], tgts: [], bolts: [], frost: []});
    const from = {x: caster.x, y: caster.y};
    let out;
    try { out = ca.apply(this, arguments); }
    finally { SFA_REC.on = false; }
    try {
      const c = {h: caster, sk, isUlt: !!isUlt, idx, from, to: {x: caster.x, y: caster.y}, dir: {x: caster.fx || 1, y: caster.fy || 0}, rec: Object.assign({}, SFA_REC), objs: (typeof portadorObjects !== 'undefined' ? portadorObjects : []).filter(o => o.id >= id0 && o.owner === caster)};
      (spec.run || spec)(c);
    } catch (e) { sfaFail(e); }
    return out;
  };
})();
/* ---------------- zonas persistentes derivadas de los objetos (cada cliente las dibuja del estado sincronizado) ---------------- */
const sfaSeen = new Map();
function sfaObjectsReset() { sfaSeen.clear(); sfaListSeen.clear(); }
function sfaObjectsFrame() {
  if (typeof portadorObjects === 'undefined') return;
  const live = new Set(); let drew = false;
  for (const o of portadorObjects) {
    const cfg = SFA_OBJ[o.kind]; if (!cfg || o.life <= 0 || !o.owner) continue;
    const r = o[cfg.rk || 'r'] || 60; live.add(o.id);
    let st = sfaSeen.get(o.id);
    if (!st) { st = {kind: o.kind, x: o.x, y: o.y, r, left: o.left, cfg}; sfaSeen.set(o.id, st); }
    st.x = o.x; st.y = o.y; st.r = r;
    if (cfg.pulse && o.left !== undefined && st.left !== undefined && o.left < st.left) sfaPush(cfg.pulseArt || 'nova', cfg.theme, o.x, o.y, cfg.pulseR || r, 0, cfg.pulseDur || 520);
    st.left = o.left;
    if (cfg.draw) { cfg.draw(o, r); continue; }
    const age = (o.maxLife || o.life) - o.life, a = Math.min(1, age / 260, o.life / 420) * .92;
    if (a <= 0) continue;
    const size = sfaBucket(r * 2), b = sfaBake('zone', cfg.theme, size); if (!b) continue;
    if (!drew) { ctx.save(); ctx.imageSmoothingEnabled = false; drew = true; }
    const f = ((animNow / 95) | 0) % b.n, sc = (r * 2) / (size - 3), D = size * sc;
    ctx.globalAlpha = a; ctx.drawImage(b.cv, f * b.w, 0, b.w, b.h, o.x - D / 2, o.y - D / 2, D, D);
  }
  if (drew) { ctx.restore(); ctx.globalAlpha = 1; }
  sfaListsFrame(); sfaHeroZFrame();
  for (const fn of SFA_POLL) { try { fn(); } catch (e) { sfaFail(e); } }
  for (const [id, st] of sfaSeen) if (!live.has(id)) { sfaSeen.delete(id); if (st.cfg.end) sfaPush(st.cfg.end, st.cfg.theme, st.x, st.y, st.cfg.endR || st.r, 0, st.cfg.endDur || 560); }
}
/* ---------------- horneado previo en tiempo ocioso (evita el tirón de hornear en pleno combate) ---------------- */
function sfaPrebake(k) {
  const B = SFA_BIND[k], cls = CLASSES[k]; if (!B || !cls || !B.themes) return;
  const sizes = new Set([48, 64]), jobs = [];
  for (const sk of [...cls.skills, cls.ultimate]) { const r = Math.min(480, sk.radius || 0); if (r) sizes.add(sfaBucket(r * 2)); }
  for (const th of B.themes) {
    for (const sz of sizes) { jobs.push(['nova', th, sz]); jobs.push(['zone', th, sz]); }
    jobs.push(['burst', th, 32], ['burst', th, 48], ['aura', th, 0], ['beam', th, 12], ['beam', th, 16], ['cone', th, 64, .85]);
  }
  (function step() { const j = jobs.shift(); if (!j) return; try { sfaBake.apply(null, j); } catch (e) { sfaFail(e); } setTimeout(step, 40); })();
}
(function () {
  if (typeof startRun !== 'function') return;
  const sr = startRun;
  startRun = function () { const r = sr.apply(this, arguments); try { for (const h of heroes) if (h && SFA_BIND[h.classKey]) sfaPrebake(h.classKey); } catch (e) { sfaFail(e); } return r; };
})();

/* ---------------- listas del motor (trampas, zonas con demora, muros de fuego...) y zonas ligadas al héroe ---------------- */
const sfaListSeen = new Map();   // entrada -> {t0, x, y, r, cfg}
function sfaZoneDraw(theme, x, y, r, a, inner) {
  const size = sfaBucket(r * 2), b = sfaBake('zone', theme, size, inner ? Math.round(inner * 10) / 10 : 0); if (!b) return;
  const f = ((animNow / 95) | 0) % b.n, sc = (r * 2) / (size - 3), D = size * sc;
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = a; ctx.drawImage(b.cv, f * b.w, 0, b.w, b.h, x - D / 2, y - D / 2, D, D); ctx.restore(); ctx.globalAlpha = 1;
}
function sfaListsFrame() {
  const now = animNow;
  for (const cfg of SFA_LISTS) {
    let arr; try { arr = cfg.get(); } catch (e) { arr = null; } if (!arr) continue;
    const seen = new Set();
    for (const e of arr) {
      if (!cfg.ok(e)) continue; seen.add(e);
      const r = cfg.r(e); if (!(r > 8)) continue;
      let st = sfaListSeen.get(e); if (!st) { st = {t0: now, cfg}; sfaListSeen.set(e, st); }
      st.x = e.x; st.y = e.y; st.r = r;
      const left = cfg.left ? cfg.left(e) : 1e9;
      sfaZoneDraw(cfg.theme, e.x, e.y, r, Math.min(1, (now - st.t0) / 260, left / 420) * (cfg.alpha || .85), cfg.inner ? cfg.inner(e) : 0);
    }
    for (const [e, st] of sfaListSeen) if (st.cfg === cfg && !seen.has(e)) { sfaListSeen.delete(e); if (cfg.end && st.r) sfaPush(cfg.end, cfg.theme, st.x, st.y, st.r, 0, cfg.endDur || 560); }
  }
}
const sfaHeroSeen = new WeakMap();
function sfaHeroZFrame() {
  if (typeof heroes === 'undefined') return;
  for (const cfg of SFA_HEROZ) for (const h of heroes) {
    if (!h.alive || h.classKey !== cfg.key) continue;
    let on = false; try { on = cfg.on(h); } catch (e) {}
    const key = cfg.key + cfg.theme + (cfg.tag || ''), m = sfaHeroSeen.get(h) || {}, st = m[key];
    if (on) {
      const r = cfg.r(h); if (!(r > 8)) continue;
      if (!st) { m[key] = {t0: animNow, r}; sfaHeroSeen.set(h, m); }
      const q = m[key]; q.r = r; q.x = h.x; q.y = h.y;
      sfaZoneDraw(cfg.theme, h.x, h.y, r, Math.min(1, (animNow - q.t0) / 260) * (cfg.alpha || .8));
    } else if (st) { delete m[key]; if (cfg.end) sfaPush(cfg.end, cfg.theme, st.x, st.y, st.r, 0, 600); }
  }
}
