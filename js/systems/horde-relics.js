"use strict";
/* ============================================================
   js/systems/horde-relics.js
   RELIQUIAS DE LA HORDA: decisiones DENTRO de la partida de la Horda Infinita (datos: js/data/horde-relics.js;
   diseño, tabla de mejoras y cómo balancear: docs/beta-release/HORDA_MEJORAS.md).
   Tras la ronda 3 y tras cada jefe/subjefe (5, 10, 15...) el jugador elige 1 de 3 reliquias. Viven en `h.hrel` ({id:nivel}),
   se pierden al terminar la partida y NO dan oro, Brasas, XP ni botín. Sin efecto fuera de la Horda (todo cuelga de endlessOn()).
   ADAPTADOR AISLADO (mismo patrón que build-synergy.js): envuelve funciones globales; para quitarlo basta sacar los <script>.
     - Estadísticas: una CAPA de runStats que se recalcula entera en cada elección (con topes en HRELIC_CFG.layerCap), no sumas sueltas.
     - Efectos con disparo (llamas, hielo, veneno, explosiones, espíritus): sin entidades nuevas; el daño extra por segundo de cada
       héroe tiene techo (HRELIC_CFG.extraDmgPerSec) y cada efecto tiene enfriamiento interno.
     - Oferta DETERMINISTA: depende solo de la semilla de la partida (EN.id), la ronda y lo que ya tienen los humanos (hrelBuildOffer).
       El anfitrión la decide y la manda en el mensaje "buffs" y en la instantánea (enRl); cada jugador elige la suya.
     - Flujo: ocurre en el estado "buff" (el juego ya está detenido ahí), como segunda fase tras el refuerzo normal de esa ronda.
   Estado propio de la partida (EN.hrelPhase / EN.hrelOffer) se limpia en cada partida nueva y al salir del modo.
   ============================================================ */
const HR_MULT_KEYS = {dmgMult:1, cdMult:1, speedMult:1, atkSpeedMult:1, hpMult:1, eliteDmgMult:1, ultChargeMult:1};
const HR_ADD_KEYS = {critChance:1, critMult:1, regenPct:1, executeBonus:1};
const HR_APPLIED = new WeakMap();   // runStats -> capa aplicada (se descarta sola con la partida)
const HR_ST = new WeakMap();        // héroe -> temporizadores y presupuesto (no viaja por la red)
const HR_UI = {open:false};

function hrelOn(){ return typeof endlessOn==="function" && endlessOn(); }
function hrelMap(h){ return (h && h.hrel) || {}; }
function hrelLvl(h, id){ return (hrelMap(h)[id]|0); }
function hrelSt(h){ let s = HR_ST.get(h); if(!s){ s = {next:{}, icd:{}, win:-1, spent:0}; HR_ST.set(h, s); } return s; }
function hrelRarityKey(r){ return HRELIC_CFG.rarity[r.r]; }
function hrelCapOf(r){ return HRELIC_CFG.stackCap[hrelRarityKey(r)]; }
function hrelTotal(map){ let n = 0; for(const id in map) n += map[id]|0; return n; }
function hrelPower(map){ let p = 0; for(const id in map){ const r = HRELIC_BY_ID[id]; if(r) p += (map[id]|0) * HRELIC_CFG.powerCost[hrelRarityKey(r)]; } return p; }
// ¿Puede quedarse con esta reliquia (tope de nivel, de cantidad y de poder)?
function hrelCanTake(map, id){
  const r = HRELIC_BY_ID[id]; if(!r) return false;
  const lv = map[id]|0;
  if(lv >= hrelCapOf(r)) return false;
  if(hrelTotal(map) >= HRELIC_CFG.maxTotalStacks) return false;
  if(hrelPower(map) + HRELIC_CFG.powerCost[hrelRarityKey(r)] > HRELIC_CFG.budget) return false;
  return true;
}
function hrelTagCounts(map){
  const T = {}; for(const id in map){ const r = HRELIC_BY_ID[id]; if(r) T[r.tag] = (T[r.tag]||0) + (map[id]|0); } return T;
}
function _hrApplyTo(L, src, n){
  for(const k in src){ if(HR_MULT_KEYS[k]) L[k] *= Math.pow(src[k], n); else if(HR_ADD_KEYS[k]) L[k] += src[k]*n; }
}
// Capa de estadísticas de un conjunto de reliquias (con los bonos de etiqueta y los topes).
function hrelLayerOf(map){
  const L = {}; for(const k in HR_MULT_KEYS) L[k] = 1; for(const k in HR_ADD_KEYS) L[k] = 0;
  for(const id in map){ const r = HRELIC_BY_ID[id]; if(r && r.L) _hrApplyTo(L, r.L, map[id]|0); }
  const T = hrelTagCounts(map);
  for(const t in T){ const D = HRELIC_TAGS[t]; if(!D) continue; if(T[t] >= 2 && D.L2) _hrApplyTo(L, D.L2, 1); if(T[t] >= 4 && D.L4) _hrApplyTo(L, D.L4, 1); }
  for(const k in HRELIC_CFG.layerCap){ const c = HRELIC_CFG.layerCap[k]; L[k] = Math.min(c[1], Math.max(c[0], L[k])); }
  return L;
}
// Multiplicador de daño de los espíritus (bonos de la etiqueta Invocaciones).
function hrelSummonMult(h){
  const n = hrelTagCounts(hrelMap(h)).invocaciones|0, D = HRELIC_TAGS.invocaciones; let m = 1;
  if(n >= 2) m *= D.S2; if(n >= 4) m *= D.S4;
  return Math.min(HRELIC_CFG.summonCap, m);
}
// Aplica la capa al runStats ACTUAL (el del héroe que eligió: netWithHero en el anfitrión).
function hrelSync(h){
  if(typeof runStats==="undefined" || !runStats) return;
  const L = hrelLayerOf(hrelMap(h)), prev = HR_APPLIED.get(runStats);
  for(const k in L){
    const p = prev ? prev[k] : (HR_MULT_KEYS[k] ? 1 : 0);
    if(HR_MULT_KEYS[k]) runStats[k] = (runStats[k]!==undefined ? runStats[k] : 1) / p * L[k];
    else runStats[k] = (runStats[k]||0) + (L[k] - p);
  }
  HR_APPLIED.set(runStats, L);
}
// Resumen de poder de una build (lo usan las pruebas de balance): capa + puntos.
function hrelBuildInfo(map){ return {layer:hrelLayerOf(map), power:hrelPower(map), total:hrelTotal(map), tags:hrelTagCounts(map)}; }

/* ---------------- oferta determinista ---------------- */
function _hrHash(str){ let h = 2166136261; for(let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h>>>0; }
function _hrMul(seed){ let a = seed>>>0; return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a>>>15, 1 | a); t = t + Math.imul(t ^ t>>>7, 61 | t) ^ t; return ((t ^ t>>>14)>>>0)/4294967296; }; }
function hrelOfferRound(r){
  if(r === HRELIC_CFG.firstRound) return true;
  return typeof endlessIsBossRound==="function" ? endlessIsBossRound(r) : (r > 0 && r % 5 === 0);
}
function hrelWeights(round){ let w = HRELIC_CFG.weights[0][1]; for(const e of HRELIC_CFG.weights) if(round >= e[0]) w = e[1]; return w; }
// seed: EN.id · round · maps: lo que tiene cada humano ({id:nivel}). Misma entrada -> misma oferta, en cualquier cliente.
function hrelBuildOffer(seed, round, maps){
  const rng = _hrMul(_hrHash("reliquias/" + (seed>>>0) + "/" + round) ^ 0x51ed270b);
  maps = (maps && maps.length) ? maps : [{}];
  const pool = HRELICS.filter(r=>maps.every(m=>hrelCanTake(m, r.id)));
  const w = hrelWeights(round), chosen = [], usedTags = {};
  while(chosen.length < HRELIC_CFG.offerSize){
    const avail = pool.filter(r=>chosen.indexOf(r) < 0);
    if(!avail.length) break;
    let cand = avail.filter(r=>!usedTags[r.tag]); if(!cand.length) cand = avail; // etiquetas distintas mientras se pueda
    const present = [0, 1, 2].filter(k=>cand.some(r=>r.r === k));
    let tot = 0; present.forEach(k=>{ tot += w[k]; });
    let roll = rng()*tot, rar = present[present.length - 1];
    for(const k of present){ roll -= w[k]; if(roll < 0){ rar = k; break; } }
    const rc = cand.filter(r=>r.r === rar), pick = rc[(rng()*rc.length)|0];
    chosen.push(pick); usedTags[pick.tag] = 1;
  }
  return chosen.map(r=>"hr:" + r.id);
}
function hrelParse(opt){
  if(typeof opt!=="string" || opt.indexOf("hr:") !== 0) return null;
  return HRELIC_BY_ID[opt.slice(3)] ? opt.slice(3) : null;
}
function hrelHumans(){
  if(typeof netMatch!=="undefined" && netMatch && netMatch.slots)
    return heroes.filter((h, i)=>{ const s = netMatch.slots[i]; return s && s.kind==="human" && (i === 0 || (h._net && h._net.connected)); });
  return (typeof player!=="undefined" && player) ? [player] : [];
}

/* ---------------- elegir y aplicar ---------------- */
function hrelGrant(h, id){
  const r = HRELIC_BY_ID[id]; if(!h || !r || !hrelOn()) return false;
  const map = hrelMap(h); if(!hrelCanTake(map, id)) return false;
  const before = hrelTagCounts(map);
  h.hrel = Object.assign({}, map); h.hrel[id] = (map[id]|0) + 1; // objeto nuevo: el snapshot lo detecta como cambio
  hrelSync(h);
  if(typeof refreshEquippedStats==="function") refreshEquippedStats();
  const after = hrelTagCounts(h.hrel), D = HRELIC_TAGS[r.tag];
  if(h.alive && typeof floatText==="function"){
    floatText(h.x, h.y-58, r.name, "heal");
    if((before[r.tag]|0) < 2 && after[r.tag] >= 2 || (before[r.tag]|0) < 4 && after[r.tag] >= 4){
      if(typeof showBanner==="function") showBanner("¡SINERGIA DE RELIQUIAS!");
      floatText(h.x, h.y-74, D.name, "heal");
      if(typeof kitFx==="function") kitFx("rune", h.x, h.y, 70);
    }
  }
  if(typeof endlessStat==="function") endlessStat("endless_relic", hrelTotal(h.hrel));
  if(typeof EN!=="undefined") EN.relics = (EN.relics|0) + 1;
  return true;
}
// Las opciones "hr:<id>" se reconocen como refuerzos válidos (el cooperativo valida con boonParseOpt, igual que build-synergy.js).
const _hrParseOpt = boonParseOpt;
boonParseOpt = function(opt){ const id = hrelParse(opt); return id ? {b:{id, relic:true}, r:0} : _hrParseOpt.call(this, opt); };
const _hrOptHTML = buffOptHTML, _hrOptClass = buffOptClass, _hrOptName = buffOptName, _hrApplyOpt = buffApplyOpt;
buffOptHTML = function(opt, h, hint){ const id = hrelParse(opt); return id ? hrelCardHTML(id, h) : _hrOptHTML.call(this, opt, h, hint); };
buffOptClass = function(opt){ const id = hrelParse(opt); return id ? "buff-card hrel-card hrel-rar-" + HRELIC_BY_ID[id].r : _hrOptClass.call(this, opt); };
buffOptName = function(opt){ const id = hrelParse(opt); return id ? HRELIC_BY_ID[id].name : _hrOptName.call(this, opt); };
buffApplyOpt = function(h, opt){ const id = hrelParse(opt); return id ? hrelGrant(h, id) : _hrApplyOpt.call(this, h, opt); };

/* ---------------- efectos con disparo ---------------- */
function hrelBase(h){ return (h.baseDmg||10) * ((typeof runStats!=="undefined" && runStats && runStats.dmgMult) || 1); }
// Daño extra con techo por segundo (cada héroe): los efectos con disparo nunca suman más que HRELIC_CFG.extraDmgPerSec veces su daño base.
function hrelBudget(h, amt){
  const s = hrelSt(h), win = (runElapsedMs/1000)|0;
  if(s.win !== win){ s.win = win; s.spent = 0; }
  const room = Math.max(0, hrelBase(h)*HRELIC_CFG.extraDmgPerSec - s.spent), a = Math.min(amt, room);
  s.spent += a; return a;
}
function hrelAs(h, fn){ return (h.isRemote && typeof netWithHero==="function") ? netWithHero(h, fn) : fn(); }
function hrelHit(h, e, amt){
  const a = hrelBudget(h, amt);
  if(a > 0 && e.alive) damageEnemy(e, a, {src:h, fromProc:true, critChanceOverride:0, critMultOverride:1, hrelHit:true});
}
function hrelReady(h, key, icd){
  const s = hrelSt(h); if((s.icd[key]||-1e9) + icd > runElapsedMs) return false;
  s.icd[key] = runElapsedMs; return true;
}
function hrelFoes(h, range, x, y){
  const out = [], cx = x===undefined ? h.x : x, cy = y===undefined ? h.y : y;
  for(const e of enemies){ if(!e.alive || e.cineT > 0) continue; const d = Math.hypot(e.x-cx, e.y-cy); if(d <= range + (e.radius||0)*0.5) out.push({e, d}); }
  out.sort((a, b)=>a.d - b.d); return out.map(o=>o.e);
}
function hrelBigFoe(e){ return e.rank==="jefe" || e.rank==="subjefe"; }
function hrelEliteFoe(e){ return hrelBigFoe(e) || e.rank==="elite" || !!e.role; }
function hrelSpiritFx(e, i){ if(i < 3 && typeof kitFx==="function" && inView(e.x, e.y, 40)) kitFx("dark", e.x, e.y - 10, 44); }
// Antes del golpe: bonos de daño contra estados. Después: efectos al pegar con un ataque básico.
if(typeof damageEnemy==="function"){
  const oDmg = damageEnemy;
  damageEnemy = function(e, amount, opts){
    const o = opts || {}, h = o.src, hr = (h && h.hrel && e && hrelOn()) ? h.hrel : null;
    if(!hr) return oDmg.apply(this, arguments);
    let k = 1;
    if(hr.chispa_ardiente && e.burnTimer > 0) k += HRELIC_FX.vsBurn.pct * hr.chispa_ardiente;
    if(hr.escarcha_quebr && e.slowTimer > 0) k += HRELIC_FX.vsSlow.pct * hr.escarcha_quebr;
    if(hr.toxina_persist && e.poisonTimer > 0) k += HRELIC_FX.vsPoison.pct * hr.toxina_persist;
    const rest = [].slice.call(arguments, 2);
    const out = oDmg.apply(this, [e, amount * k].concat(rest));
    if(!e.alive || o.fromProc || netIsGuest()) return out;
    if(o.fromBasic){
      const b = hrelBase(h);
      if(hr.brasa_viva && Math.random() < HRELIC_FX.burn.chance * hr.brasa_viva){
        e.burnTimer = Math.max(e.burnTimer||0, HRELIC_FX.burn.ms); e.burnDmg = Math.max(e.burnDmg||0, b*HRELIC_FX.burn.dps); e.burnSrc = h; }
      if(hr.aliento_gelido && Math.random() < HRELIC_FX.chill.chance * hr.aliento_gelido){
        e.slowAmt = Math.max(e.slowAmt||0, HRELIC_FX.chill.slow * (hrelBigFoe(e) ? 0.5 : 1)); e.slowTimer = Math.max(e.slowTimer||0, HRELIC_FX.chill.ms); e.slowBy = h; }
      if(hr.colmillo_toxico && Math.random() < HRELIC_FX.poison.chance * hr.colmillo_toxico){
        e.poisonTimer = Math.max(e.poisonTimer||0, HRELIC_FX.poison.ms); e.poisonDmg = Math.max(e.poisonDmg||0, b*HRELIC_FX.poison.dps); }
      if(hr.golpe_amplio){
        const F = HRELIC_FX.cleave; let n = 0;
        for(const f of hrelFoes(h, F.range, e.x, e.y)){ if(f === e) continue; if(n++ >= F.n) break; hrelHit(h, f, b*F.dmg*hr.golpe_amplio); }
      }
    }
    return out;
  };
}
// Al morir un enemigo (lo remató `e.lastHitBy`, incluso por quemadura o veneno).
function hrelOnKill(h, e, was){
  const hr = h.hrel, b = hrelBase(h);
  if(hr.corazon_magma && was.burning && hrelReady(h, "magma", HRELIC_FX.magma.icd)){
    const F = HRELIC_FX.magma; kitFx("fire", e.x, e.y, F.radius);
    for(const f of hrelFoes(h, F.radius, e.x, e.y)) hrelHit(h, f, b*F.dmg);
  }
  if(hr.plaga && was.poisoned){
    const F = HRELIC_FX.plague; let n = 0;
    for(const f of hrelFoes(h, F.range, e.x, e.y)){ if(n++ >= F.n) break; f.poisonTimer = Math.max(f.poisonTimer||0, F.ms); f.poisonDmg = Math.max(f.poisonDmg||0, b*F.dps); }
    if(n) kitFx("earth", e.x, e.y, 60);
  }
  if(hrelEliteFoe(e)){
    if(hr.bendicion_horda && hrelReady(h, "bless", HRELIC_FX.bless.icd)){
      const heal = HRELIC_FX.bless.heal * (typeof arenaRuleHealMult==="function" ? arenaRuleHealMult() : 1);
      for(const o of heroes) if(o.alive){ o.hp = Math.min(o.maxHp, o.hp + o.maxHp*heal); kitFx("light", o.x, o.y, 50); }
    }
    if(hr.pacto_sombras && hrelReady(h, "pact", HRELIC_FX.pact.icd)){
      const F = HRELIC_FX.pact, foes = hrelFoes(h, F.range, e.x, e.y).filter(f=>f !== e).slice(0, F.n);
      foes.forEach((f, i)=>{ hrelSpiritFx(f, i); hrelHit(h, f, b*F.dmg*hr.pacto_sombras*hrelSummonMult(h)); });
    }
  }
}
if(typeof killEnemy==="function"){
  const oKill = killEnemy;
  killEnemy = function(e){
    const was = e && e.alive, src = e && e.lastHitBy, snap = was ? {burning:e.burnTimer > 0, poisoned:e.poisonTimer > 0} : null;
    const out = oKill.apply(this, arguments);
    if(was && src && src.hrel && src.alive !== undefined && hrelOn() && !netIsGuest()) hrelAs(src, ()=>hrelOnKill(src, e, snap));
    return out;
  };
}
// Al lanzar una habilidad: Eco sísmico; al lanzar la definitiva: Relámpago.
if(typeof skillEvoOnCast==="function"){
  const oCast = skillEvoOnCast;
  skillEvoOnCast = function(caster, key, sk, isUlt){
    const out = oCast.apply(this, arguments), hr = caster && caster.hrel;
    if(hr && hrelOn() && !netIsGuest() && caster.alive) hrelAs(caster, ()=>{
      const b = hrelBase(caster);
      if(hr.eco_sismico && hrelReady(caster, "echo", HRELIC_FX.echo.icd)){
        const F = HRELIC_FX.echo; kitFx("earth", caster.x, caster.y, F.radius);
        for(const f of hrelFoes(caster, F.radius)) hrelHit(caster, f, b*F.dmg*hr.eco_sismico);
      }
      if(isUlt && hr.relampago && typeof kitBuff==="function") kitBuff(caster, caster, HRELIC_FX.rush.ms, {speed:HRELIC_FX.rush.speed, label:"+VELOCIDAD"});
    });
    return out;
  };
}
// Efectos periódicos (Invierno eterno, Cataclismo, Espíritu cazador, Legión espectral): los llama endlessUpdate (una línea).
function hrelUpdate(dt){
  if(!hrelOn() || netIsGuest() || typeof heroes==="undefined") return;
  for(const h of heroes){
    if(!h.alive || !h.hrel) continue;
    const hr = h.hrel, st = hrelSt(h), t = runElapsedMs;
    const due = (key, every)=>{ if(st.next[key] === undefined) st.next[key] = t + every; if(t < st.next[key]) return false; return true; };
    const done = (key, every)=>{ st.next[key] = t + every; };
    hrelAs(h, ()=>{
      const b = hrelBase(h), sm = hrelSummonMult(h);
      if(hr.invierno_eterno && due("winter", HRELIC_FX.winter.every)){
        const F = HRELIC_FX.winter, foes = hrelFoes(h, F.radius);
        if(foes.length){ done("winter", F.every); kitFx("ice", h.x, h.y, F.radius);
          for(const f of foes){ f.slowAmt = Math.max(f.slowAmt||0, F.slow * (hrelBigFoe(f) ? 0.5 : 1)); f.slowTimer = Math.max(f.slowTimer||0, F.ms); f.slowBy = h; hrelHit(h, f, b*F.dmg); } }
      }
      if(hr.cataclismo && due("cata", HRELIC_FX.cataclysm.every)){
        const F = HRELIC_FX.cataclysm, foes = hrelFoes(h, F.radius);
        if(foes.length){ done("cata", F.every); kitFx("earth", h.x, h.y, F.radius, {ult:true}); for(const f of foes) hrelHit(h, f, b*F.dmg); }
      }
      if(hr.espiritu_cazador && due("spirit", HRELIC_FX.spirit.every)){
        const F = HRELIC_FX.spirit, foes = hrelFoes(h, F.range).slice(0, hr.espiritu_cazador);
        if(foes.length){ done("spirit", F.every); foes.forEach((f, i)=>{ hrelSpiritFx(f, i); hrelHit(h, f, b*F.dmg*sm); }); }
      }
      if(hr.legion_espectral && due("legion", HRELIC_FX.legion.every)){
        const F = HRELIC_FX.legion, foes = hrelFoes(h, F.range);
        if(foes.length){ done("legion", F.every);
          for(let i = 0; i < F.n; i++){ const f = foes[(Math.random()*foes.length)|0]; if(!f.alive) continue; hrelSpiritFx(f, i); hrelHit(h, f, b*F.dmg*sm); } }
      }
    });
  }
}

/* ---------------- interfaz: pantalla de 3 tarjetas ---------------- */
function hrelRarityMeta(r){ return HRELIC_RARITY_META[r.r]; }
function hrelIconHTML(tag){ return typeof pixelIconHTML==="function" ? pixelIconHTML(HRELIC_TAGS[tag].icon) : ""; }
function hrelCardHTML(id, h){
  const r = HRELIC_BY_ID[id], D = HRELIC_TAGS[r.tag], R = hrelRarityMeta(r), cap = hrelCapOf(r), have = hrelLvl(h, id);
  const n = (hrelTagCounts(hrelMap(h))[r.tag]|0), nx = n + 1;
  const syn = nx === 2 ? D.t2 : nx === 4 ? D.t4 : "";
  const lv = have ? `<span class="hrel-lv">Nivel</span> <b>${have + 1}/${cap}</b>` : `<span class="hrel-lv">Nueva</span>`;
  return `<span class="hrel-top"><span class="hrel-rar" style="color:${R.color}">${R.name}</span><span class="hrel-lvl">${lv}</span></span>
    <span class="hrel-ico" style="--hr-c:${D.color}">${hrelIconHTML(r.tag)}</span>
    <span class="buff-name">${r.name}</span>
    <span class="buff-desc">${r.desc}</span>
    <span class="hrel-tag" style="color:${D.color}">${hrelIconHTML(r.tag)} <span>${D.name}</span> <b>${n}</b></span>
    ${syn ? `<span class="hrel-syn"><b>Sinergia:</b> <span>${syn}</span></span>` : ""}`;
}
// Línea de reliquias que ya tiene el héroe (resumen corto para la pantalla de elección, la pausa y el fin de partida).
function hrelOwnedList(h){
  const M = hrelMap(h); return HRELICS.filter(r=>M[r.id]).map(r=>({r, lv:M[r.id]}));
}
function hrelOwnedLineHTML(h){
  const L = hrelOwnedList(h); if(!L.length) return "";
  return `<span class="hrel-owned-t">Tus reliquias:</span> ` + L.map(o=>`<span class="hrel-chip" style="color:${HRELIC_TAGS[o.r.tag].color}">${hrelIconHTML(o.r.tag)} <span>${o.r.name}</span> <b>${o.lv}</b></span>`).join(" ");
}
function hrelSynergiesOf(h){
  const T = hrelTagCounts(hrelMap(h)), out = [];
  for(const t of HRELIC_TAG_IDS){ const D = HRELIC_TAGS[t], n = T[t]|0; if(n >= 2) out.push({t, D, n, txt:D.t2}); if(n >= 4) out.push({t, D, n, txt:D.t4}); }
  return out;
}
// Bloque para el panel de Resumen de la pausa y los resultados.
function hrelStatsBlockHTML(h){
  if(!hrelOn()) return "";
  const L = hrelOwnedList(h); if(!L.length) return "";
  const syn = hrelSynergiesOf(h);
  return `<div class="stat-block hrel-stats"><div class="stat-block-title">Reliquias de la Horda</div>` +
    L.map(o=>`<div class="stat-row"><span style="color:${HRELIC_TAGS[o.r.tag].color}">${hrelIconHTML(o.r.tag)} <b>${o.r.name}</b><br><small>${o.r.desc}</small></span><b>${o.lv}/${hrelCapOf(o.r)}</b></div>`).join("") +
    syn.map(s=>`<div class="stat-row highlight"><span style="color:${s.D.color}">${hrelIconHTML(s.t)} <b>${s.D.name}</b><br><small>${s.txt}</small></span><b>Sinergia</b></div>`).join("") + `</div>`;
}
function hrelResultsHTML(h){
  const L = hrelOwnedList(h); if(!L.length) return "";
  return `<div class="en-res-sub">Reliquias de la Horda</div><div class="en-res-relics">` +
    L.map(o=>`<span class="hrel-chip" style="color:${HRELIC_TAGS[o.r.tag].color}">${hrelIconHTML(o.r.tag)} <span>${o.r.name}</span> <b>${o.lv}</b></span>`).join(" ") + `</div>`;
}
function hrelPhaseVisible(){ return !!HR_UI.open && state === "buff"; }

function hrelRenderCards(opts, h, onPick){
  const cards = document.getElementById("buff-cards"); if(!cards) return;
  cards.innerHTML = "";
  HR_UI.open = true;
  const title = document.getElementById("buff-title"); if(title) title.textContent = "Reliquia de la Horda: elegí una mejora";
  const note = document.getElementById("vote-note"); if(note) note.textContent = "Dura hasta el final de esta partida. Elegí con 1 2 3, con las flechas y Enter, con el mando o tocando.";
  opts.forEach((opt, i)=>{
    const id = hrelParse(opt); if(!id) return;
    const el = document.createElement("button");
    el.type = "button"; el.className = buffOptClass(opt); el.dataset.hr = id; el.dataset.idx = String(i);
    el.innerHTML = `<span class="hrel-key" aria-hidden="true">${i + 1}</span>` + hrelCardHTML(id, h);
    el.setAttribute("aria-label", HRELIC_BY_ID[id].name + ". " + HRELIC_BY_ID[id].desc);
    el.addEventListener("click", ()=>{ if(state!=="buff" || !HR_UI.open || el.disabled) return; onPick(opt); });
    cards.appendChild(el);
  });
  let own = document.getElementById("hrel-owned");
  if(!own){ own = document.createElement("div"); own.id = "hrel-owned"; cards.parentNode.insertBefore(own, cards.nextSibling); }
  own.innerHTML = hrelOwnedLineHTML(h);
  const first = cards.querySelector("button");
  if(first) setTimeout(()=>{ try{ first.focus({preventScroll:true}); }catch(e){} }, 60);
}
function hrelCloseUI(){
  HR_UI.open = false;
  const own = document.getElementById("hrel-owned"); if(own) own.innerHTML = "";
}
// Teclado: 1 2 3 eligen; ← → mueven el foco; Enter/Espacio los maneja el propio <button>.
window.addEventListener("keydown", ev=>{
  if(!HR_UI.open || state!=="buff") return;
  const cards = [...document.querySelectorAll("#buff-cards button.hrel-card")]; if(!cards.length || ev.repeat) return;
  const k = ev.key;
  if(k==="1" || k==="2" || k==="3"){ const c = cards[(+k)-1]; if(c){ ev.preventDefault(); c.click(); } return; }
  if(k==="ArrowRight" || k==="ArrowLeft" || k==="ArrowDown" || k==="ArrowUp"){
    const i = Math.max(0, cards.indexOf(document.activeElement)), d = (k==="ArrowRight" || k==="ArrowDown") ? 1 : -1;
    ev.preventDefault(); cards[(i + d + cards.length) % cards.length].focus();
  }
});

/* ---------------- flujo de la fase (anfitrión / solo) ---------------- */
function hrelPhaseActive(){ return typeof EN!=="undefined" && EN.hrelPhase === 1; }
function hrelCurrentOffer(){ return (typeof EN!=="undefined" && EN.hrelOffer) || []; }
function hrelReset(){
  if(typeof EN!=="undefined"){ EN.hrelPhase = 0; EN.hrelOffer = []; EN.relics = 0; }
  HR_UI.open = false;
  if(typeof heroes!=="undefined" && heroes) for(const h of heroes){ if(h && h.hrel) delete h.hrel; HR_ST.delete(h); }
}
// ¿Hay una elección de reliquia pendiente tras la ronda que acaba de cerrarse? La abre y devuelve true.
function hrelNextPhase(){
  if(!hrelOn() || EN.hrelPhase || netIsGuest()) return false;
  if(!hrelOfferRound(EN.round)) return false;
  const offer = hrelBuildOffer(EN.id, EN.round, hrelHumans().map(hrelMap));
  if(!offer.length) return false;
  EN.hrelPhase = 1; EN.hrelOffer = offer;
  try{ hrelOpenChoice(); }catch(err){ console.error("Reliquias:", err); EN.hrelPhase = 0; EN.hrelOffer = []; HR_UI.open = false; return false; }
  return true;
}
function hrelOpenChoice(){
  setState("buff");
  hrelRenderCards(EN.hrelOffer, player, opt=>{
    buffApplyOpt(player, opt);
    if(netIsHost()){ const c = document.getElementById("buff-cards"); if(c) c.innerHTML = `<div class="net-wait">Elegiste <b>${buffOptName(opt)}</b>.</div>`; hrelCloseUI(); netHostPickedLocal(); return; }
    hrelCloseUI(); EN.hrelPhase = 0; EN.hrelOffer = [];
    setState("playing"); endlessAdvance();
  });
  if(netIsHost()) netHostOpenBuffs();
}
// Invitado: la oferta llega en el mensaje "buffs" (relic:1) y también en la instantánea (enRl).
function hrelGuestShow(d){
  setState("buff");
  EN.hrelOffer = (d.opts||[]).slice(); EN.hrelPhase = 1;
  hrelRenderCards(EN.hrelOffer, player, opt=>{
    netSendToHost({k:"buff", id:opt});
    const c = document.getElementById("buff-cards"); if(c) c.innerHTML = `<div class="net-wait">Elegiste <b>${buffOptName(opt)}</b>. Esperando al resto del equipo…</div>`;
    hrelCloseUI();
  });
}
