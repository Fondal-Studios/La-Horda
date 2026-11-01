"use strict";
/* ============================================================
   js/systems/build-synergy.js
   MOTOR de BUILD EVOLUTION 2.0 (datos en js/data/build-synergy.js). ADAPTADOR AISLADO:
   no edita skill-evolution.js, boons.js ni el combate; se monta ENVOLVIENDO sus funciones globales
   (mismo patrón que js/champions/vfx-b/hooks.js). Para desactivarlo basta quitar el <script>.
   Cargar DESPUÉS de js/systems/boons.js y js/systems/skill-evolution.js.
   - Estado: h.synergy = {skillKey: branchId} (objeto nuevo en cada cambio, como h.boons).
   - Oferta: boonBuildOffers -> si una habilidad llegó a Nv.5 y no tiene rama, DOS cartas "syn:id"
     de arquetipo distinto reemplazan genéricos (una decisión real: no se pueden tener ambas).
   - Efectos: se ejecutan tras skillEvoOnHit, SOLO dentro de la ventana de lanzamiento de la habilidad
     (src._evo.key === rama.skill) y nunca desde golpes de proc/reacción (sin cadenas infinitas).
   - Anti-dominancia: tope de daño extra por segundo (SYN_CFG.budgetPerSec), enfriamientos internos
     por enemigo, tope por lanzamiento de escudo/cura, jefes con control reducido, costo cdMult.
   - Cooperativo: corre en el anfitrión. El invitado puede elegir (la opción "syn:" pasa el filtro de
     netHostBuffPicked porque boonParseOpt devuelve un objeto sintético). h.synergy SÍ viaja en el
     snapshot (_netDeltaOf copia toda clave enumerable del héroe); el estado interno (enfriamientos,
     acumuladores) vive en WeakMap y NO se replica. La oferta del invitado depende de la maestría
     guardada en el anfitrión (limitación conocida).
   ============================================================ */
/* Estado interno en WeakMap: NO es una propiedad del héroe/enemigo/_evo, así que el snapshot del cooperativo
   (_netDeltaOf copia toda clave enumerable) no lo replica, y se libera solo con el objeto. */
const SYN_ST = new WeakMap();
let _synUidN = 0;
function synSt(o){ let t = SYN_ST.get(o); if(!t){ t = {at:{}}; SYN_ST.set(o, t); } return t; }
function synUid(o){ const t = synSt(o); return t.uid || (t.uid = ++_synUidN); }
function synOf(h){ return (h && h.synergy) || {}; }
function synBranchFor(h, skillKey){ const id = synOf(h)[skillKey]; return id ? SYN_BY_ID[id] : null; }
function synSkillOf(b){ const c = CLASSES[b.champ]; return c ? (b.skill==="ult" ? c.ultimate : c.skills[b.skill]) : null; }
function synSetCount(h, b){ return (b.set && typeof setN==="function") ? setN(h, b.set.id) : 0; }
// Potencia de la rama: 1 + bonus del set (solo si es el set de ESTE guardián), con tope.
function synPower(h, b){ return Math.min(SYN_CFG.setCap, 1 + (synSetCount(h, b) >= b.set.n ? SYN_CFG.setBonus : 0)); }

/* ---------------- elegibilidad y oferta ---------------- */
// Habilidades del héroe con rama pendiente: nivel de evolución >= 5 y sin rama elegida.
function synPendingSkills(h){
  if(!h || !h.classKey || divinaMode) return [];
  const out = [];
  for(const key of [0,1,2,"ult"]){
    const opts = SYN_BRANCHES.filter(b=>b.champ===h.classKey && b.skill===key);
    if(opts.length<2 || synOf(h)[key]) continue;
    if(evoLevelOf(h.classKey, key) >= SYN_CFG.reqLvl) out.push({key, opts});
  }
  return out;
}
// Dos ramas de la misma habilidad con arquetipo distinto (si el catálogo las tiene).
function synPickPair(opts){
  const a = opts[0], b = opts.find(o=>o.arch!==a.arch) || opts[1];
  return Math.random() < 0.5 ? [a, b] : [b, a];
}
const _synBoonBuildOffers = boonBuildOffers;
boonBuildOffers = function(h, pool, endless, n){
  const base = _synBoonBuildOffers.call(this, h, pool, endless, n);
  const pend = synPendingSkills(h);
  if(!pend.length) return base;
  const T = synSt(h); T.offers = (T.offers||0) + 1;
  if(T.offers % 2 === 0) return base; // se alterna: elegir la carta base pospone la decisión y la siguiente subida vuelve al reparto normal
  const pair = synPickPair(pend[0].opts).map(b=>"syn:"+b.id);
  // conserva como mucho 1 carta de la oferta original (la primera) y pone el par de la decisión
  return [base[0]].concat(pair).filter(Boolean).slice(0, Math.max(3, base.length));
};
function synParse(opt){
  if(typeof opt!=="string" || opt.indexOf("syn:")!==0) return null;
  return SYN_BY_ID[opt.slice(4)] || null;
}
function synGrant(h, id){
  const b = SYN_BY_ID[id];
  if(!h || !b || b.champ!==h.classKey || synOf(h)[b.skill]) return false;
  if(evoLevelOf(h.classKey, b.skill) < SYN_CFG.reqLvl) return false;
  h.synergy = Object.assign({}, h.synergy||{}); h.synergy[b.skill] = id;
  if(h.alive){ particles.push({x:h.x, y:h.y, life:600, ring:true, maxLife:600, maxR:70, color:b.look}); floatText(h.x, h.y-58, "◈ "+b.name, "heal"); }
  if(h===player && typeof updateAbilityButtons==="function") updateAbilityButtons();
  return true;
}

/* ---------------- cartas ---------------- */
// Opciones propias de Build Evolution: "syn:<id>". boonParseOpt devuelve un objeto sintético para que
// la validación del cooperativo (netHostBuffPicked) y Horda Infinita lo traten como refuerzo válido.
const _synParseOpt = boonParseOpt;
boonParseOpt = function(opt){ const b = synParse(opt); return b ? {b:{id:b.id, synergy:true}, r:0} : _synParseOpt(opt); };
const _synOptHTML = buffOptHTML, _synOptClass = buffOptClass, _synOptName = buffOptName, _synApplyOpt = buffApplyOpt;
function synCardHTML(b, h){
  const A = SYN_ARCH[b.arch], sk = synSkillOf(b), have = synSetCount(h, b), setC = (typeof SET_DB!=="undefined" && SET_DB[b.set.id]) ? SET_DB[b.set.id].name : b.set.id;
  const rival = SYN_BRANCHES.find(o=>o.champ===b.champ && o.skill===b.skill && o.id!==b.id);
  const cost = b.cdMult>1 ? `Costo: +${Math.round((b.cdMult-1)*100)}% enfriamiento` : "Sin costo de enfriamiento";
  return `<div class="ico boon-ico" style="--boon-c:${b.look};--boon-g:${b.look}">${A.ico}</div>
    <div class="boon-tag" style="color:${A.color}">RAMA ${A.name.toUpperCase()}</div>
    <div class="buff-name">${b.name}</div>
    <div class="boon-skill">Evoluciona: <b>${sk ? sk.name : "?"}</b> · Req. Nv.${SYN_CFG.reqLvl}</div>
    <div class="buff-desc">${b.text}</div>
    <div class="boon-duo">${cost}</div>
    <div class="boon-duo">Set ${setC} (${b.set.n}p): +${Math.round(SYN_CFG.setBonus*100)}% potencia${have>=b.set.n ? " ✔" : ""}</div>
    <div class="boon-duo">Excluye: ${rival ? rival.name : "—"}</div>`;
}
buffOptHTML = function(opt, h, hint){ const b = synParse(opt); return b ? synCardHTML(b, h) : _synOptHTML.call(this, opt, h, hint); };
buffOptClass = function(opt){ return synParse(opt) ? "buff-card boon syn-branch rar-2" : _synOptClass.call(this, opt); };
buffOptName = function(opt){ const b = synParse(opt); return b ? b.name : _synOptName.call(this, opt); };
buffApplyOpt = function(h, opt){ const b = synParse(opt); return b ? synGrant(h, b.id) : _synApplyOpt.call(this, h, opt); };

// Panel de habilidades: bajo las líneas de evolución, qué rama tiene o cuáles puede elegir.
const _synEvoHTML = skillEvoHTML;
skillEvoHTML = function(classKey, sk, idx, lvl){
  const html = _synEvoHTML.apply(this, arguments);
  const key = idx==="ult" ? "ult" : idx, opts = SYN_BRANCHES.filter(b=>b.champ===classKey && b.skill===key);
  if(opts.length<2) return html;
  const mine = (typeof player!=="undefined" && player && player.classKey===classKey) ? synBranchFor(player, key) : null;
  const line = mine ? `<span class="evo on"><b>◈ Rama: ${mine.name}</b><i>: ${mine.text}</i></span>`
    : `<span class="evo ${lvl>=SYN_CFG.reqLvl?"next":""}" title="${opts.map(o=>o.name+": "+o.text).join(" | ")}">◈ Nv.${SYN_CFG.reqLvl} Rama a elegir en partida: ${opts.map(o=>SYN_ARCH[o.arch].name+" · "+o.name).join(" / ")}</span>`;
  return html.replace(/<\/div>$/, line + "</div>");
};
const _synDecorate = boonDecorateButton;
boonDecorateButton = function(el, sk){
  _synDecorate.apply(this, arguments);
  if(!el || !player || !sk) return;
  const cls = CLASSES[player.classKey]; if(!cls) return;
  const key = sk===cls.ultimate ? "ult" : cls.skills.indexOf(sk); if(key===-1) return;
  const b = synBranchFor(player, key); if(!b) return;
  el.title += `\n◈ Rama ${SYN_ARCH[b.arch].name} · ${b.name}: ${b.text}`;
};

/* ---------------- efectos en combate ---------------- */
const _synOnCast = skillEvoOnCast;
skillEvoOnCast = function(caster, key, sk, isUlt){
  const out = _synOnCast.apply(this, arguments);
  const b = caster && caster.classKey && !divinaMode ? synBranchFor(caster, key) : null;
  if(b && caster._evo){
    synSt(caster._evo).syn = {b, acc:0, accH:0};           // acumuladores por lanzamiento (escudo/cura)
    if(b.cdMult > 1){                                 // costo de la decisión
      if(key==="ult" && caster.ultCd>0) caster.ultCd *= b.cdMult;
      else if(typeof key==="number" && caster.cds && caster.cds[key]>0){ caster.cds[key] *= b.cdMult; if(caster.cdTotal) caster.cdTotal[key] = caster.cds[key]; }
    }
    if(caster.alive && inView(caster.x, caster.y, 0)) vfxShock(caster.x, caster.y, 6, 54, hexToRgb(b.look), 360, caster===player ? 1 : 0);
  }
  return out;
};
function synBudgetOk(src, amt){
  const win = (runElapsedMs/1000)|0, T = synSt(src);
  if(T.win !== win){ T.win = win; T.spent = 0; }
  const cap = src.baseDmg * runStats.dmgMult * SYN_CFG.budgetPerSec;
  const room = Math.max(0, cap - T.spent);
  const a = Math.min(amt, room); T.spent += a; return a;
}
function synReady(e, id, fxName, icd){
  const m = synSt(e).at, k = id + fxName;
  if(m[k] !== undefined && runElapsedMs - m[k] < icd) return false;
  m[k] = runElapsedMs; return true;
}
function synBigFoe(e){ return e.rank==="jefe" || e.rank==="subjefe"; }
function synBonusHit(src, e, amt, b){
  const a = synBudgetOk(src, amt); if(a > 0 && e.alive) damageEnemy(e, a, {src, fromProc:true, critChanceOverride:0, critMultOverride:1}); // sin segundo crítico: el golpe de origen ya lo incluye
}
const _synOnHit = skillEvoOnHit;
skillEvoOnHit = function(src, e, dmg, opts){
  // estado ANTES de la Firma (la Firma de este mismo golpe no debe contar como "ya estaba marcado")
  const ev = src && src._evo, syn = ev && SYN_ST.has(ev) ? SYN_ST.get(ev).syn : null;
  const wasSlowed = !!(syn && e.slowTimer > 0), wasMarked = !!(syn && (e._evoMarkT||0) > runElapsedMs);
  _synOnHit.apply(this, arguments);
  if(!syn || !e.alive || divinaMode) return;
  const act = _evoActive(src, opts); if(!act || act !== ev || ev.key !== syn.b.skill) return;
  const b = syn.b, fx = b.fx, P = synPower(src, b), big = synBigFoe(e), elite = big || e.rank==="elite";
  if(fx.vsSlowed && wasSlowed && synReady(e, b.id, "vs", 120)) synBonusHit(src, e, dmg*fx.vsSlowed*P, b);
  if(fx.vsMarked && wasMarked && synReady(e, b.id, "vm", 120)) synBonusHit(src, e, dmg*fx.vsMarked*P, b);
  if(fx.extra && synReady(e, b.id, "ex", fx.extra.icd)) synBonusHit(src, e, dmg*fx.extra.pct*P, b);
  if(fx.chain && synReady(e, b.id+":"+synUid(src), "ch", fx.chain.icd)){
    let n = 0;
    for(const o of enemies){
      if(n >= fx.chain.n) break;
      if(o===e || !o.alive || Math.hypot(o.x-e.x, o.y-e.y) > fx.chain.range) continue;
      synBonusHit(src, o, dmg*fx.chain.pct*P, b); n++;
      if(inView(o.x, o.y, 30)) vfxShock(o.x, o.y-10, 4, 26, hexToRgb(b.look), 220, src===player ? 1 : 0);
    }
  }
  if(fx.slow && synReady(e, b.id, "sl", fx.slow.icd)){
    const amt = fx.slow.amt * (big ? SYN_CFG.bossControl : 1);
    e.slowAmt = Math.max(e.slowAmt||0, amt); e.slowTimer = Math.max(e.slowTimer||0, fx.slow.ms); e.slowBy = src;
  }
  if(fx.stun && !elite && synReady(e, b.id, "st", fx.stun.icd)) e.stunTimer = Math.max(e.stunTimer||0, fx.stun.ms);
  if(fx.freezeSlowed && wasSlowed && synReady(e, b.id, "fz", fx.freezeSlowed.icd)){
    if(!elite) e.stunTimer = Math.max(e.stunTimer||0, fx.freezeSlowed.ms);
    else { e.slowAmt = Math.max(e.slowAmt||0, 0.5); e.slowTimer = Math.max(e.slowTimer||0, fx.freezeSlowed.ms * 2); e.slowBy = src; }
  }
  if(fx.pull && !big && synReady(e, b.id, "pl", fx.pull.icd)){
    const d = Math.hypot(src.x-e.x, src.y-e.y) || 1, px = Math.min(fx.pull.px, Math.max(0, d-24));
    e.x += (src.x-e.x)/d*px; e.y += (src.y-e.y)/d*px;
  }
  if(fx.mark){ e._evoMarkT = Math.max(e._evoMarkT||0, runElapsedMs + fx.mark.ms); // sin enfriamiento: la Firma renueva la marca en cada golpe y la rama debe prevalecer
    e._evoMarkBy = src; e._evoMarkKind = "mark"; }
  if(fx.shield && src.alive && synReady(e, b.id+":"+synUid(src), "sh", fx.shield.icd) && syn.acc < fx.shield.cap){
    const add = Math.min(fx.shield.pct*P, fx.shield.cap*P - syn.acc); syn.acc += add;
    src.shield = Math.max(src.shield||0, Math.min(src.maxHp*0.5, (src.shield||0) + src.maxHp*add)); src.shieldTimer = Math.max(src.shieldTimer||0, 3000);
  }
  if(fx.heal && src.alive && synReady(e, b.id+":"+synUid(src), "hl", fx.heal.icd) && syn.accH < fx.heal.cap){
    const add = Math.min(fx.heal.pct*P, fx.heal.cap*P - syn.accH); syn.accH += add;
    src.hp = Math.min(src.maxHp, src.hp + src.maxHp*add);
  }
  // identidad visual de la rama: anillo + chispas del color propio (tope por ventana de 100 ms)
  const w = (runElapsedMs/100)|0; const FT = synSt(src); if(FT.fxWin !== w){ FT.fxWin = w; FT.fxN = 0; }
  if(FT.fxN++ < SYN_CFG.fxPerWindow && inView(e.x, e.y, 40)){
    const rgb = hexToRgb(b.look), pr = src===player ? 1 : 0;
    vfxShock(e.x, e.y-8, 5, 30, rgb, 260, pr);
    vfxBurst(e.x, e.y-18, 4, "t_" + b.look, 110, 300, 2.5, pr, -30, 1);
  }
};
