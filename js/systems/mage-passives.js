"use strict";
/* ============================================================
   js/systems/mage-passives.js
   CAPA GENÉRICA "PASIVA DE MAGO" — los poderes del Kit de Magos (js/data/mage-kit.js) cambian la
   pasiva de CUALQUIER guardián con roleCategory === "mago" sin reescribir a cada campeón.

   MODELO
   - Todo mago tiene un MEDIDOR DE PASIVA (fracción 0..1) sobre el que actúan los poderes:
       · con ADAPTADOR (MAGE_PASSIVE_ADAPTERS, por classKey): el medidor ES un número real de la pasiva
         del guardián (segundos hurtados de Aelith, presión de Brasa, residuos de Morwen, calor de Zahra,
         fuerza de colonia de Tibor, equilibrio de Nano GM). Sumarlo acerca el disparo de SU pasiva.
       · SIN adaptador (el resto, y cualquier mago nuevo): pasiva de respaldo "Resonancia". Cada
         lanzamiento suma 1 carga (la definitiva 2, de 4). Con 4 cargas, el siguiente lanzamiento las
         gasta y suelta una onda de resonancia (100% de tu daño). Se apaga sola (1 carga cada 7 s quieta).
     La capa está INERTE hasta que el mago lleva una pieza del kit (heroMagePowers).
   - Un poder nunca escribe en otro sistema que no sea el medidor, el daño de tu equipo, tu escudo/energía/
     enfriamientos o los enemigos (siempre con fromProc: sin fuego amigo, sin recursión).
   - Tiempo propio (mp.clock, suma de dt): los enfriamientos internos no dependen de la partida entera.
   - Estado: h._mp (un objeto por héroe, muere con el héroe) y e._mpMark (marca en el enemigo). Ambos van
     en NET_SKIP_KEYS; al invitado solo viajan _mpRunes/_mpRgb/_mpFase (números y texto) para dibujar el aura.

   CÓMO EXTENDER: agregá una entrada a MAGE_PASSIVE_ADAPTERS {max, int, get(h), set(h,v), fire(h)?}. Ver
   docs/items/KIT_DE_MAGOS.md.
   ============================================================ */

/* ---------------- adaptadores por guardián ---------------- */
// get/set leen y escriben el número REAL de la pasiva. `max` es el tope SEGURO que usa la capa (no
// necesariamente el de la pasiva: Zahra se recalienta a 100, por eso su tope es 85). `int`: valor entero.
// `fire(h)` (opcional): lo que hace "sonar" esa pasiva además de sumar el medidor.
const MAGE_PASSIVE_ADAPTERS = {
  aelith:{label:"Segundos hurtados", max:2, int:true, get:h=>h.aelithSeconds||0, set:(h,v)=>{ h.aelithSeconds = v; },
    fire(h){ if(h.cds) for(let i=0;i<3;i++) if(h.cds[i] > 1000) h.cds[i] = Math.max(1000, h.cds[i] - 500); }}, // su efecto propio: -0,5 s a las otras
  brasa:{label:"Presión", max:3, int:true, get:h=>h.portPressure||0, set:(h,v)=>{ h.portPressure = v; }},
  morwen:{label:"Reactivos", max:5, int:true, get:h=>h.portResidue||0, set:(h,v)=>{ h.portResidue = v; }},
  zahra:{label:"Calor prestado", max:85, get:h=>exState(h).heat, set:(h,v)=>{ exState(h).heat = v; }},
  tibor:{label:"Colonia viva", max:100, get:h=>exState(h).colony, set:(h,v)=>{ exState(h).colony = v; }},
  nano_gm:{label:"Autoridad del GM", max:3, int:true,
    get:h=>{ const s = ascState(h); return s.light + s.dark; },
    set:(h,v)=>{ const s = ascState(h);
      while(s.light + s.dark < v){ if(s.light <= s.dark && s.light < 2) s.light++; else if(s.dark < 2) s.dark++; else break; }
      while(s.light + s.dark > v){ if(s.light >= s.dark) s.light--; else s.dark--; } }}
};
function mageAdapter(h){
  const a = h && MAGE_PASSIVE_ADAPTERS[h.classKey];
  if(!a) return null;
  // el estado propio del guardián tiene que existir (exState/ascState viven en otros módulos)
  if((h.classKey==="zahra" || h.classKey==="tibor") && typeof exState!=="function") return null;
  if(h.classKey==="nano_gm" && typeof ascState!=="function") return null;
  return a;
}

/* ---------------- quién es mago y qué poderes lleva ---------------- */
function isMageClass(k){ const c = k && CLASSES[k]; return !!c && c.roleCategory===MAGE_ROLE; }
function isMageHero(h){ return !!(h && h.classKey && isMageClass(h.classKey)); }
function itemMagePower(it){
  if(!it) return null;
  const k = it.magePower || (it.designId && DESIGNED_ITEMS[it.designId] && DESIGNED_ITEMS[it.designId].magePower);
  return k && MAGE_POWERS[k] ? k : null;
}
function itemRoleOnly(it){ return (it && (it.roleOnly || (it.designId && DESIGNED_ITEMS[it.designId] && DESIGNED_ITEMS[it.designId].roleOnly))) || null; }
// {mp_x:1,...} de lo equipado, o null si no lleva ninguno (o no es mago). Caché por cuadro (el de passiveSum).
function heroMagePowers(champKey){
  if(!champKey || !save || !save.champions[champKey] || !isMageClass(champKey)) return null;
  const c = _passiveBucket(champKey);
  if(c.mages === undefined){
    let n = 0; const m = {};
    EQUIP_SLOT_TYPES.forEach(type=>{ const k = itemMagePower(equippedItem(champKey, type)); if(k){ m[k] = 1; n++; } });
    c.mages = n ? m : null;
  }
  return c.mages;
}

/* ---------------- estado ---------------- */
function mpState(h){
  return h._mp || (h._mp = {active:false, clock:0, cd:{}, stats:{}, res:0, resIdle:0, acc:0, lastFrac:0, third:0, pages:[-1e9,-1e9,-1e9],
    still:0, stillT:0, px:h.x, py:h.y, coroT:0, coroQ:[], memoriaQ:null, cicloAt:0, cicloUntil:0, archivoUntil:0, faseUntil:0, veloArmed:true,
    markGainAt:-1e9});
}
function _mpStat(mp, k, n){ mp.stats[k] = (mp.stats[k]||0) + (n===undefined ? 1 : n); }
function _mpReady(mp, key, cdMs){ if((mp.cd[key]===undefined ? -1e9 : mp.cd[key]) + cdMs > mp.clock) return false; mp.cd[key] = mp.clock; return true; }
function _mpBase(h){ return h.baseDmg * runStats.dmgMult * (h.buffDmgMult||1); }
function _mpSay(h, txt){ if(h===player && typeof floatText==="function") floatText(h.x, h.y-62, txt, "crit"); }
function _mpFx(h, mp, key, ms){ return _mpReady(mp, "fx_"+key, ms); }
const _mpClamp01 = v => v < 0 ? 0 : (v > 1 ? 1 : v);

/* ---------------- el medidor de la pasiva ---------------- */
function mageMeterGet(h){
  const a = mageAdapter(h);
  if(a) return _mpClamp01(a.get(h) / a.max);
  return _mpClamp01(mpState(h).res / MAGE_CFG.resMax);
}
// Fija el medidor (fracción absoluta) SIN contarlo como un gasto del guardián.
function mageMeterSet(h, frac){
  const a = mageAdapter(h), mp = mpState(h);
  frac = _mpClamp01(frac);
  if(a) a.set(h, a.int ? Math.round(frac*a.max) : frac*a.max); else mp.res = frac*MAGE_CFG.resMax;
  mp.lastFrac = mageMeterGet(h);
}
// Suma `f` (fracción del máximo). En medidores enteros se acumula el decimal hasta completar una unidad.
function mageMeterAdd(h, f){
  const a = mageAdapter(h), mp = mpState(h), before = mageMeterGet(h);
  if(a){
    if(a.int){ mp.acc += f*a.max; const u = Math.floor(mp.acc + 1e-9); if(u > 0){ mp.acc -= u; a.set(h, Math.min(a.max, a.get(h) + u)); } }
    else a.set(h, Math.min(a.max, a.get(h) + f*a.max));
  } else mp.res = Math.min(MAGE_CFG.resMax, mp.res + f*MAGE_CFG.resMax);
  const after = mageMeterGet(h);
  mp.lastFrac = Math.max(after, 0);
  if(after > before) _mpStat(mp, "gained", after - before);
  return after - before;
}
// Algo le gastó la pasiva al guardián (un lanzamiento suyo, o la Resonancia): lo ve la Memoria de Hechizo.
function _mpNoteSpend(h, mp, spent){
  const P = heroMagePowers(h.classKey);
  if(P && P.mp_memoria && spent >= MAGE_CFG.memoriaDrop && !mp.memoriaQ && _mpReady(mp, "memoria", MAGE_CFG.memoriaCd))
    mp.memoriaQ = {at:mp.clock + MAGE_CFG.memoriaDelay, amount:spent*MAGE_CFG.memoriaBack};
}

/* ---------------- ondas (siempre sobre enemigos: sin fuego amigo) ---------------- */
function mageNova(h, x, y, r, mult, o){
  o = o || {}; let n = 0; const d = _mpBase(h)*mult;
  for(const e of enemies){
    if(!e.alive || e.cineT > 0 || Math.hypot(e.x-x, e.y-y) > r + (e.radius||20)*0.5) continue;
    damageEnemy(e, d, {src:h, fromProc:true});
    if(o.slow && e.alive){ e.slowAmt = Math.max(e.slowAmt||0, o.slow); e.slowTimer = Math.max(e.slowTimer||0, o.slowMs||1000); }
    if(++n >= MAGE_CFG.resNovaMax) break;
  }
  return n;
}
function _mpTheme(h, key, x, y, r, ult){
  const P = MAGE_POWERS[key]; if(!P || typeof kitFx!=="function") return;
  const mp = mpState(h); if(!_mpFx(h, mp, "theme_"+key, 350)) return;
  kitFx(P.fx, x, y, r, ult ? {ult:true} : undefined);
}
// Hace "sonar" la pasiva: su efecto propio (adaptador) + el medidor + una onda de resonancia.
function mageFire(h, pct, powerKey, fromMeter){
  const a = mageAdapter(h), mp = mpState(h);
  _mpStat(mp, "fired");
  if(a && a.fire) a.fire(h);
  mageMeterAdd(h, 0.25);
  const n = mageNova(h, h.x, h.y, MAGE_CFG.coroR, pct);
  _mpStat(mp, "fireHits", n);
  if(powerKey) _mpTheme(h, powerKey, h.x, h.y, MAGE_CFG.coroR);
  return n;
}

/* ---------------- ganchos (los llama item-procs.js) ---------------- */
function mageOnCast(h, sk, isUlt){
  if(!isMageHero(h) || h._mythEcho || h._bpTwinning) return; // las repeticiones del Eco no cuentan
  const P = heroMagePowers(h.classKey); if(!P) return;
  const mp = mpState(h), C = MAGE_CFG, A = mageAdapter(h);
  const idx = !isUlt && h.cls && h.cls.skills ? h.cls.skills.indexOf(sk) : -1;
  mp.active = true; _mpStat(mp, "casts");
  // pasiva de respaldo "Resonancia": con 4 cargas el lanzamiento las gasta y suelta una onda
  if(!A){
    if(mp.res >= C.resMax - 1e-6){
      mp.res = 0; _mpNoteSpend(h, mp, 1);
      const n = mageNova(h, h.x, h.y, C.resNovaR, C.resNovaPct);
      _mpStat(mp, "resonate"); _mpStat(mp, "resonateHits", n);
      if(typeof kitFx==="function" && _mpFx(h, mp, "res", 250)) kitFx("rune", h.x, h.y, C.resNovaR);
      _mpSay(h, "RESUENA");
    }
    mp.res = Math.min(C.resMax, mp.res + (isUlt ? C.resPerUlt : C.resPerCast)); mp.resIdle = 0;
    mp.lastFrac = mageMeterGet(h);
  }
  // Cauce Desbordado
  if(P.mp_cauce && _mpReady(mp, "cauce", C.cauceCd)){
    mageMeterAdd(h, isUlt ? C.cauceUlt : C.cauceCast); _mpStat(mp, "cauce");
    _mpTheme(h, "mp_cauce", h.x, h.y, 46);
  }
  // Tercer Sello: cada 3.er lanzamiento resuena
  if(P.mp_tercer){
    mp.third++;
    if(mp.third >= C.tercerEvery){
      mp.third = 0;
      const n = mageNova(h, h.x, h.y, C.tercerR, C.tercerPct*(1 + C.tercerFrac*mageMeterGet(h)), {slow:C.tercerSlow, slowMs:C.tercerSlowMs});
      mageMeterAdd(h, C.tercerGain); _mpStat(mp, "tercer"); _mpStat(mp, "tercerHits", n);
      _mpTheme(h, "mp_tercer", h.x, h.y, C.tercerR);
      _mpSay(h, "TERCER SELLO");
    }
  }
  // Marca Contagiosa: la 3.ª habilidad propaga la marca
  if(P.mp_marca && idx===2) mageSpreadMarks(h, mp);
  // Ciclo Eterno: la definitiva programa el renacer de la pasiva
  if(P.mp_ciclo && isUlt && mp.clock >= (mp.cd.ciclo===undefined ? -1e9 : mp.cd.ciclo) + C.cicloCd){ mp.cd.ciclo = mp.clock; mp.cicloAt = mp.clock + C.cicloDelay; }
  // Archivo Arcano: las tres habilidades distintas completan el archivo
  if(P.mp_archivo && idx >= 0){
    mp.pages[idx] = mp.clock;
    if(mp.pages.every(t=>mp.clock - t <= C.archivoWindow) && _mpReady(mp, "archivo", C.archivoCd)){
      mp.pages = [-1e9,-1e9,-1e9];
      h.energy = Math.min(h.maxEnergy || h.energy, h.energy + (sk.cost||0));
      mageMeterAdd(h, C.archivoGain);
      if(h.cds) for(let i=0;i<h.cds.length;i++) if(h.cds[i] > 0) h.cds[i] = Math.max(0, h.cds[i] - C.archivoCut);
      mp.archivoUntil = mp.clock + C.archivoMs; _mpStat(mp, "archivo");
      _mpTheme(h, "mp_archivo", h.x, h.y, 80, true); _mpSay(h, "ARCHIVO COMPLETO");
    }
  }
  // Únicos
  if(P.mpu_voz && _mpReady(mp, "voz", C.vozEvery)){ mageFire(h, C.vozPct, "mpu_voz"); _mpStat(mp, "voz"); }
  if(P.mpu_fase && mp.faseUntil > mp.clock && _mpReady(mp, "faseNova", C.faseNovaCd)){
    mageNova(h, h.x, h.y, C.faseR, C.fasePct); _mpStat(mp, "faseNova"); _mpTheme(h, "mpu_fase", h.x, h.y, C.faseR);
  }
}

function mageSpreadMarks(h, mp){
  const C = MAGE_CFG, near = [];
  for(const e of enemies){ if(!e.alive || e.cineT > 0) continue; const d = Math.hypot(e.x-h.x, e.y-h.y); if(d <= C.marcaR) near.push([d, e]); }
  near.sort((a, b)=>a[0] - b[0]);
  let n = 0;
  for(const [, e] of near){
    if(n >= C.marcaMax) break;
    e._mpMark = {by:h, until:mp.clock + C.marcaMs}; n++;
    if(inView(e.x, e.y, 0)) vfxBurst(e.x, e.y-18, 5, "ember", 70, 420, 2.5, h===player ? 1 : 0, -30, 1);
  }
  if(n){ _mpStat(mp, "marks", n); _mpTheme(h, "mp_marca", h.x, h.y, 60); }
}

// Un golpe tuyo: los enemigos marcados cargan tu pasiva con tus habilidades.
function mageOnHit(h, e, dmg, crit, opts){
  if(!isMageHero(h) || opts.fromBasic) return;
  const mk = e._mpMark; if(!mk || mk.by !== h) return;
  const mp = h._mp; if(!mp || mk.until <= mp.clock) return;
  if(_mpReady(mp, "markGain", MAGE_CFG.marcaGainCd)){ mageMeterAdd(h, MAGE_CFG.marcaGain); _mpStat(mp, "markHits"); }
}
// Multiplicador de daño de los poderes contra ESTE enemigo (lo lee itemDamageMult). Solo habilidades.
function mageDamageMult(h, e, opts){
  if(!h || !h._mp || !h._mp.active || opts.fromProc || opts.fromBasic || !isMageHero(h)) return 1;
  const mp = h._mp, P = heroMagePowers(h.classKey); if(!P) return 1;
  let m = 1;
  const mk = e._mpMark;
  if(P.mp_marca && mk && mk.by === h && mk.until > mp.clock) m *= 1 + MAGE_CFG.marcaDmg;
  if(P.mp_ciclo && mp.cicloUntil > mp.clock) m *= 1 + MAGE_CFG.cicloDmg;
  if(P.mp_archivo && mp.archivoUntil > mp.clock) m *= 1 + MAGE_CFG.archivoDmg;
  return m;
}

/* ---------------- por cuadro ---------------- */
function clearMageState(h){
  if(h._mp){ h._mp.coroQ.length = 0; h._mp.memoriaQ = null; h._mp.cicloAt = 0; h._mp.cicloUntil = 0; h._mp.archivoUntil = 0; h._mp.faseUntil = 0; h._mp.active = false; }
  h._mpRunes = 0; h._mpFase = false; h._mpUnique = false;
}
function updateMagePassives(h, dt){
  if(!h || !h.classKey || !isMageClass(h.classKey)) return;
  const P = heroMagePowers(h.classKey);
  if(!P){ if(h._mp && h._mp.active) clearMageState(h); return; }
  const mp = mpState(h), C = MAGE_CFG;
  if(!h.alive){ if(mp.active) clearMageState(h); return; }
  mp.active = true; mp.clock += dt;
  const A = mageAdapter(h);
  // Resonancia de respaldo: se apaga sola
  if(!A && mp.res > 0){ mp.resIdle += dt; if(mp.resIdle >= C.resDecayMs){ mp.resIdle = 0; mp.res = Math.max(0, mp.res - 1); mp.lastFrac = mageMeterGet(h); } }
  const moved = Math.hypot(h.x - mp.px, h.y - mp.py); mp.px = h.x; mp.py = h.y;
  let frac = mageMeterGet(h);
  // Memoria de Hechizo: un golpe de más del 35% en el medidor es un gasto
  if(mp.lastFrac - frac >= C.memoriaDrop) _mpNoteSpend(h, mp, mp.lastFrac - frac);
  if(mp.memoriaQ && mp.clock >= mp.memoriaQ.at){
    const amt = mp.memoriaQ.amount; mp.memoriaQ = null;
    const got = mageMeterAdd(h, amt); _mpStat(mp, "memoria"); _mpStat(mp, "memoriaBack", got);
    _mpTheme(h, "mp_memoria", h.x, h.y, 56); _mpSay(h, "MEMORIA");
    frac = mageMeterGet(h);
  }
  // Alquimia del Sobrante: la energía de más se vuelve pasiva
  if(P.mp_sobrante && h.maxEnergy && h.energy > h.maxEnergy*C.sobranteAbove && _mpReady(mp, "sobrante", C.sobranteEvery)){
    h.energy = Math.max(0, h.energy - h.maxEnergy*C.sobranteTake);
    mageMeterAdd(h, C.sobranteGain); _mpStat(mp, "sobrante"); _mpStat(mp, "energyTaken", h.maxEnergy*C.sobranteTake);
    _mpTheme(h, "mp_sobrante", h.x, h.y, 50);
    frac = mageMeterGet(h);
  }
  // Pausa del Canalizador: quieto, se llena
  if(P.mp_canal){
    if(moved > 0.6){ mp.still = 0; mp.stillT = 0; }
    else {
      mp.still += dt;
      if(mp.still >= C.canalStillMs){
        mp.stillT += dt;
        if(mp.stillT >= C.canalEvery){
          mp.stillT -= C.canalEvery;
          if(mageMeterGet(h) < C.canalCap - 1e-6){
            mageMeterAdd(h, C.canalGain); _mpStat(mp, "canal");
            if(h._mp && _mpFx(h, mp, "canal", 500) && inView(h.x, h.y, 0)) vfxShock(h.x, h.y+4, 40, 10, "150,160,255", 480, 0);
            frac = mageMeterGet(h);
          }
        }
      }
    }
  }
  // Velo de Resonancia: al cruzar el 50%
  if(P.mp_velo){
    if(frac < C.veloAt - 0.05) mp.veloArmed = true;
    else if(frac >= C.veloAt - 1e-6 && mp.veloArmed && _mpReady(mp, "velo", C.veloCd)){
      mp.veloArmed = false;
      h.shield = Math.max(h.shield||0, Math.min(h.maxHp*0.5, (h.shield||0) + h.maxHp*C.veloShield));
      h.shieldTimer = Math.max(h.shieldTimer||0, C.veloMs);
      kitBuff(h, h, C.veloMs, {armor:C.veloArmor, label:"VELO"});
      _mpStat(mp, "velo"); _mpTheme(h, "mp_velo", h.x, h.y, 60);
    }
  }
  // Coro Sin Fin: en combate, cada 9 s la pasiva suena dos veces
  if(P.mp_coro){
    let near = false;
    for(const e of enemies){ if(e.alive && Math.hypot(e.x-h.x, e.y-h.y) < C.coroNear){ near = true; break; } }
    if(near){ mp.coroT += dt; if(mp.coroT >= C.coroEvery && mp.coroQ.length === 0){ mp.coroT = 0; mp.coroQ.push(mp.clock, mp.clock + C.coroGap); } }
    while(mp.coroQ.length && mp.coroQ[0] <= mp.clock){
      mp.coroQ.shift(); mageFire(h, C.coroPct, "mp_coro"); _mpStat(mp, "coro");
      if(mp.coroQ.length === 0) _mpSay(h, "CORO");
    }
  }
  // Ciclo Eterno: la definitiva revive la pasiva
  if(P.mp_ciclo && mp.cicloAt && mp.clock >= mp.cicloAt){
    mp.cicloAt = 0; mageMeterSet(h, 1); mp.cicloUntil = mp.clock + C.cicloMs; _mpStat(mp, "ciclo");
    _mpTheme(h, "mp_ciclo", h.x, h.y, 90, true); _mpSay(h, "CICLO ETERNO");
    frac = 1;
  }
  // La Voz Antigua: con la pasiva casi llena, las habilidades se recargan más rápido
  if(P.mpu_voz && frac >= C.vozFull && h.cds){
    for(let i=0;i<h.cds.length;i++) if(h.cds[i] > 0) h.cds[i] = Math.max(0, h.cds[i] - dt*C.vozCdBoost);
    _mpStat(mp, "vozCd", dt*C.vozCdBoost);
  }
  // Fase del Último Ciclo
  if(P.mpu_fase){
    if(mp.faseUntil > 0 && mp.clock >= mp.faseUntil){ mp.faseUntil = 0; mageMeterSet(h, C.faseAfter); frac = C.faseAfter; _mpStat(mp, "faseEnd"); }
    else if(mp.faseUntil === 0 && frac >= 0.99 && _mpReady(mp, "fase", C.faseCd)){
      mp.faseUntil = mp.clock + C.faseMs; _mpStat(mp, "fase");
      kitBuff(h, h, C.faseMs, {speed:C.faseSpeed, dmg:C.faseDmg, label:"FASE"});
      _mpTheme(h, "mpu_fase", h.x, h.y, 100, true); _mpSay(h, "¡FASE!");
    }
  }
  mp.lastFrac = mageMeterGet(h);
  // lo que ve el invitado (números y texto: viajan solos)
  h._mpUnique = !!(P.mpu_voz || P.mpu_fase);
  h._mpRunes = h._mpUnique ? Math.max(1, Math.round(mp.lastFrac*4)) : (mp.lastFrac >= 0.25 ? Math.min(3, 1 + Math.floor(mp.lastFrac*3)) : 0);
  h._mpFase = mp.faseUntil > mp.clock;
  h._mpRgb = mageAuraRgb(P);
}
// Color del aura: Único > Mítico > Legendario (el primero que encuentre).
function mageAuraRgb(P){
  for(const k of ["mpu_voz","mpu_fase","mp_coro","mp_ciclo","mp_archivo"]) if(P[k]) return MAGE_POWERS[k].rgb;
  for(const k in P) return MAGE_POWERS[k].rgb;
  return "190,150,255";
}
function resetMagePassives(){
  for(const h of (typeof heroes!=="undefined" ? heroes : [])) if(h && h._mp){ clearMageState(h); delete h._mp; }
  for(const e of (typeof enemies!=="undefined" ? enemies : [])) if(e && e._mpMark) delete e._mpMark;
}

/* ---------------- dibujo: runas que orbitan (y aura de los Únicos) ---------------- */
// Cuadrados píxel de 4x4 sobre la elipse del suelo; cuantas más cargas, más runas. Los Únicos suman halo y
// una segunda órbita. En la Fase, un anillo de guiones. Lo dibuja entities.js (drawHero) junto al aura de Únicos.
function drawMageKitAura(h){
  const n = h._mpRunes|0; if(!n && !h._mpFase) return;
  const rgb = h._mpRgb || "190,150,255", t = animNow/1000;
  ctx.save();
  if(h._mpUnique){
    const g = ctx.createRadialGradient(h.x, h.y-4, 4, h.x, h.y-4, 42);
    g.addColorStop(0, `rgba(${rgb},0.38)`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.globalAlpha = 0.55 + 0.2*Math.sin(t*3.5); ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(h.x, h.y-2, 42, 24, 0, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
  }
  for(let i=0;i<n;i++){
    const a = t*1.7 + i*(Math.PI*2/n), x = Math.round(h.x + Math.cos(a)*30), y = Math.round(h.y - 6 + Math.sin(a)*15);
    ctx.fillStyle = `rgb(${rgb})`; ctx.fillRect(x-2, y-2, 4, 4);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(x-1, y-1, 2, 2);
    ctx.fillStyle = "rgba(10,6,16,0.7)"; ctx.fillRect(x-2, y+2, 4, 1);
  }
  if(h._mpFase){
    ctx.strokeStyle = `rgba(${rgb},0.85)`; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.lineDashOffset = -animNow/50;
    ctx.beginPath(); ctx.ellipse(h.x, h.y-4, 38, 20, 0, 0, Math.PI*2); ctx.stroke();
  }
  ctx.restore();
}

/* ---------------- red: estado interno fuera del snapshot ---------------- */
if(typeof NET_SKIP_KEYS!=="undefined"){ NET_SKIP_KEYS.add("_mp"); NET_SKIP_KEYS.add("_mpMark"); }
