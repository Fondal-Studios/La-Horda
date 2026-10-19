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
// Variante por habilidad: básico/hab.1 base, hab.2 tono girado (h), hab.3 pálida (p), definitiva girada; así las de un mismo campeón difieren en color, silueta y motivos.
const SFA_CUR = {slot: null, pushed: null};
const SFA_VSUF = {basic: '~p', 0: '', 1: '~h', 2: '~p', ult: '~h'};
const sfaVarOf = theme => (SFA_CUR.slot === null || theme.indexOf('~') >= 0) ? theme : theme + (SFA_VSUF[SFA_CUR.slot] || '');
function sfaP(art, theme, x, y, r, o) { o = o || {}; theme = sfaVarOf(theme); if (SFA_CUR.pushed) SFA_CUR.pushed.push({art, theme, x, y, r, o});
  vfxSfaPlay(art, theme, x, y, r, o.ang || 0, o.dur, o.bx, o.by, o.w, o.noEnd ? -2 : o.fi, o.arc, o.dl); }
const sfaRaw = (art, theme, x, y, r, o) => { o = o || {}; vfxSfaPlay(art, theme, x, y, r, o.ang || 0, o.dur, o.bx, o.by, o.w, o.fi, o.arc, o.dl); };
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
    const prevSlot = SFA_CUR.slot, prevPushed = SFA_CUR.pushed;
    try { out = ca.apply(this, arguments); }
    finally { SFA_REC.on = false; }
    try {
      const c = {h: caster, sk, isUlt: !!isUlt, idx, from, to: {x: caster.x, y: caster.y}, dir: {x: caster.fx || 1, y: caster.fy || 0}, rec: Object.assign({}, SFA_REC), objs: (typeof portadorObjects !== 'undefined' ? portadorObjects : []).filter(o => o.id >= id0 && o.owner === caster)};
      SFA_CUR.slot = slot; SFA_CUR.pushed = [];
      for (const o of c.objs) sfaObjVar.set(o.id, SFA_VSUF[slot] || '');
      (spec.run || spec)(c);
      sfaExtras(c, slot, SFA_CUR.pushed);
    } catch (e) { sfaFail(e); }
    finally { SFA_CUR.slot = prevSlot; SFA_CUR.pushed = prevPushed; }
    return out;
  };
})();
/* ---------------- zonas persistentes derivadas de los objetos (cada cliente las dibuja del estado sincronizado) ---------------- */
const sfaSeen = new Map(), sfaObjVar = new Map();
function sfaObjectsReset() { sfaSeen.clear(); sfaListSeen.clear(); sfaObjVar.clear(); }
function sfaObjectsFrame() {
  if (typeof portadorObjects === 'undefined') return;
  const live = new Set(); let drew = false;
  for (const o of portadorObjects) {
    const cfg = SFA_OBJ[o.kind]; if (!cfg || o.life <= 0 || !o.owner) continue;
    const r = o[cfg.rk || 'r'] || 60; live.add(o.id); const th = cfg.theme + (sfaObjVar.get(o.id) || '');
    let st = sfaSeen.get(o.id);
    if (!st) { st = {kind: o.kind, x: o.x, y: o.y, r, left: o.left, cfg, th}; sfaSeen.set(o.id, st); }
    st.x = o.x; st.y = o.y; st.r = r;
    if (cfg.pulse && o.left !== undefined && st.left !== undefined && o.left < st.left) sfaPush(cfg.pulseArt || 'nova', th, o.x, o.y, cfg.pulseR || r, 0, cfg.pulseDur || 520);
    st.left = o.left;
    if (cfg.draw) { cfg.draw(o, r); continue; }
    const age = (o.maxLife || o.life) - o.life, a = Math.min(1, age / 260, o.life / 420) * .92;
    if (a <= 0) continue;
    if (typeof ufZoneEdge === 'function' && ufZoneEdge(o.owner.classKey + ':' + o.kind, o.x, o.y, r, a)) continue;   // ult-forms: solo el borde del área
    const size = sfaBucket(r * 2), b = sfaBake('zone', th, size); if (!b) continue;
    if (!drew) { ctx.save(); ctx.imageSmoothingEnabled = false; drew = true; }
    const f = ((animNow / 95) | 0) % b.n, sc = (r * 2) / (size - 3), D = size * sc;
    ctx.globalAlpha = a; ctx.drawImage(b.cv, f * b.w, 0, b.w, b.h, o.x - D / 2, o.y - D / 2, D, D);
  }
  if (drew) { ctx.restore(); ctx.globalAlpha = 1; }
  sfaListsFrame(); sfaHeroZFrame();
  for (const fn of SFA_POLL) { try { fn(); } catch (e) { sfaFail(e); } }
  for (const [id, st] of sfaSeen) if (!live.has(id)) { sfaSeen.delete(id); if (st.cfg.end) sfaPush(st.cfg.end, st.th || st.cfg.theme, st.x, st.y, st.cfg.endR || st.r, 0, st.cfg.endDur || 560); }
}
/* ---------------- horneado previo en tiempo ocioso (evita el tirón de hornear en pleno combate) ---------------- */
function sfaPrebake(k) {
  const B = SFA_BIND[k], cls = CLASSES[k]; if (!B || !cls || !B.themes) return;
  const sizes = new Set([48, 64]), jobs = [];
  for (const sk of [...cls.skills, cls.ultimate]) { const r = Math.min(480, sk.radius || 0); if (r) sizes.add(sfaBucket(r * 2)); }
  const all = []; for (const t of B.themes) all.push(t, t + '~h', t + '~p', t + '~k');
  for (const th of all) {
    for (const sz of sizes) { jobs.push(['nova', th, sz]); jobs.push(['zone', th, sz]); }
    jobs.push(['burst', th, 32], ['burst', th, 48], ['aura', th, 0], ['rays', th, 48], ['rays', th, 64], ['rings', th, 64], ['column', th, 0], ['beam', th, 12], ['beam', th, 16], ['cone', th, 64, .85]);
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
      const za = Math.min(1, (animNow - q.t0) / 260) * (cfg.alpha || .8);
      if(!(typeof ufZoneEdge === 'function' && ufZoneEdge(cfg.key, h.x, h.y, r, za))) sfaZoneDraw(cfg.theme, h.x, h.y, r, za);   // ult-forms: la definitiva con forma propia deja solo el borde del área
    } else if (st) { delete m[key]; if (cfg.end) sfaPush(cfg.end, cfg.theme, st.x, st.y, st.r, 0, 600); }
  }
}

/* ---------------- capas de impacto añadidas a cada habilidad: destello, ondas y, en la definitiva, columna, segunda onda y sacudida ---------------- */
function sfaExtras(c, slot, pushed) {
  if (!pushed.length) return;
  const base = t => t.split('~')[0], ult = slot === 'ult', h = c.h;
  const nov = pushed.filter(p => p.art === 'nova'), bm = pushed.filter(p => p.art === 'beam'), cn = pushed.filter(p => p.art === 'cone'), au = pushed.filter(p => p.art === 'aura');
  const th0 = base(pushed[0].theme);
  if (ult) {
    const m = nov[0] || {x: h.x, y: h.y, r: 120}, R = Math.min(m.r, 300);
    sfaRaw('rays', th0 + '~p', m.x, m.y, Math.max(70, R * .5), {dur: 520});                                      // destello de anticipación
    sfaRaw('rings', th0 + '~p', m.x, m.y, R * 1.02, {dur: 900, dl: 140});                                       // ondas de choque
    sfaRaw('column', th0 + '~p', m.x, m.y + 6, Math.max(26, Math.min(70, R * .3)), {dur: 1250, dl: 90});         // columna de luz
    sfaRaw('nova', th0 + '~k', m.x, m.y, R * .72, {dur: 820, dl: 380});                                          // segunda onda, más oscura y cerrada
    if (typeof vfxShake === 'function') vfxShake(8);
    return;
  }
  for (const m of nov.slice(0, 2)) {
    sfaRaw('rays', base(m.theme) + '~p', m.x, m.y, Math.max(40, m.r * .42), {dur: 380});
    if (m.r >= 60) sfaRaw('rings', base(m.theme) + (slot === 2 ? '' : '~p'), m.x, m.y, m.r, {dur: 700, dl: 120});
  }
  for (const m of bm.slice(0, 2)) sfaRaw('rays', base(m.theme) + '~p', m.x, m.y, 40, {dur: 340});
  for (const m of cn.slice(0, 1)) sfaRaw('rays', base(m.theme) + '~p', m.x, m.y, 44, {dur: 340});
  for (const m of au.slice(0, 2)) { const a = m.o && m.o.fi >= 0 ? heroes[m.o.fi] : null; sfaRaw('column', base(m.theme) + '~p', a ? a.x : m.x, (a ? a.y : m.y) + 4, 16, {dur: 700}); }
}
/* ---------------- ataque básico: tajo/destello corto, pálido y rápido (no es un efecto de habilidad) ---------------- */
const sfaBasicAt = new WeakMap();
(function () {
  if (typeof triggerBasic !== 'function') return;
  const tb = triggerBasic;
  triggerBasic = function (h) {
    const c0 = h || player, ready = !!c0 && !(c0.basicCd > 0);
    const r = tb.apply(this, arguments);
    try {
      const c = h || player, B = c && SFA_BIND[c.classKey];
      if (B && !window.SFA_OFF && c.alive && ready && c.basicCd > 0 && (sfaBasicAt.get(c) || 0) + 150 < animNow) {
        sfaBasicAt.set(c, animNow); const th = (B.themes[0]) + '~p', fx = c.fx || 1, fy = c.fy || 0, rg = (c.cls && c.cls.basicRange) || 60;
        if (c.cls && c.cls.ranged) { sfaRaw('burst', th, c.x + fx * 26, c.y - 12 + fy * 26, 24, {dur: 280, w: -3}); }
        else sfaRaw('cone', th, c.x, c.y - 6, rg + 18, {ang: Math.atan2(fy, fx), arc: .6, dur: 260, w: -3});
      }
    } catch (e) { sfaFail(e); }
    return r;
  };
})();
