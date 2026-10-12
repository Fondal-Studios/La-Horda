"use strict";
/* ============================================================
   js/arenas/lanes/lanes-jungle.js
   GUERRA DE CRISTALES en el motor real — la SELVA: ocho campamentos de criaturas neutrales (equipo 2, hostiles para todos) que
   reaparecen, y dos objetivos épicos en el río:
   · DRAGÓN DE PIEDRA — el equipo que lo vence gana +10 % de daño de héroe durante un rato.
   · REY COLOSO — el equipo que lo vence manda un coloso real por cada carril en sus dos próximas oleadas.
   Los campamentos dan oro y experiencia; el del Gigante además bendice al héroe que lo vence (+12 % de daño).
   Las criaturas neutrales persiguen a quien las ataca y vuelven a casa (curándose) si se las lleva muy lejos.
   ============================================================ */
const LANES_CAMP_KINDS = {
  lobos:{type:"lobo_artico", n:3, hp:5.0, dmg:1.3, gold:22, xp:48},
  bestias:{type:"bestia_bosque", n:2, hp:3.6, dmg:1.2, gold:26, xp:56},
  escorpiones:{type:"escorpion_gigante", n:3, hp:4.4, dmg:1.3, gold:24, xp:52},
  gigante:{type:"golem_piedra", n:1, hp:11, dmg:2.0, gold:50, xp:110, buff:true}
};
function lanesJungleInit(){
  const L = LN;
  L.camps = LANES_CAMPS.map(c=>({id:c.id, mons:[], respawnAt:20000}));
  L.epics = LANES_EPICS.map(e=>({id:e.id, mon:null, respawnAt:LANES.EPIC_FIRST_MS}));
}
function lanesCampSpawn(camp){
  const def = LANES_CAMPS[camp.id], K = LANES_CAMP_KINDS[def.kind];
  camp.mons = [];
  for(let i = 0; i < K.n; i++){
    const a = (i / K.n) * Math.PI * 2, rx = K.n > 1 ? Math.cos(a) * 46 : 0, ry = K.n > 1 ? Math.sin(a) * 46 : 0;
    LN.spawnCtx = {team:2, x:def.x + rx, y:def.y + ry};
    const e = spawnEnemy(K.type, false, false);
    LN.spawnCtx = null; if(!e) continue;
    e.team = 2; e.campId = def.id; e.homeX = def.x + rx; e.homeY = def.y + ry; e.noLoot = true; e.dropsItem = false; e.lnXp = K.xp / K.n; e.xp = 0; e.gold = 0; e.kindM = "camp";
    e.hp = e.maxHp = Math.round(e.maxHp * K.hp); e.dmg = Math.round(e.dmg * K.dmg); e.isBrute = def.kind === "gigante";
    camp.mons.push(e);
  }
}
function lanesEpicSpawn(ep){
  const def = LANES_EPICS[ep.id];
  LN.spawnCtx = {team:2, x:def.x, y:def.y};
  const e = spawnEnemy("golem", false, false);
  LN.spawnCtx = null; if(!e) return;
  e.team = 2; e.epicId = def.id; e.homeX = def.x; e.homeY = def.y; e.noLoot = true; e.dropsItem = false; e.lnXp = 320; e.xp = 0; e.gold = 0; e.kindM = "epic"; e.name = def.name;
  e.hp = e.maxHp = Math.round(e.maxHp * (def.key === "rey" ? 15 : 12)); e.dmg = Math.round(e.dmg * 1.7); e.scale = (e.scale || 5) * 1.35; e.radius = 54; e.isBrute = true;
  ep.mon = e;
  showBanner((def.key === "rey" ? "¡EL REY COLOSO HA DESPERTADO!" : "¡EL DRAGÓN DE PIEDRA HA DESPERTADO!"));
}
function lanesJungleTick(dt){
  const L = LN; if(!L.camps) return;
  for(const c of L.camps){
    if(c.mons.length && c.mons.every(m=>!m.alive)){ c.mons = []; }
    if(!c.mons.length && L.t >= c.respawnAt) lanesCampSpawn(c);
  }
  for(const ep of L.epics){
    if(ep.mon && !ep.mon.alive) ep.mon = null;
    if(!ep.mon && L.t >= ep.respawnAt) lanesEpicSpawn(ep);
  }
}
// A quién ataca una criatura de la selva: a quien esté cerca o la haya golpeado; si se la lleva lejos, vuelve a casa curándose.
function lanesCampTarget(e){
  const L = LN, home = {x:e.homeX, y:e.homeY}, dh = Math.hypot(e.x - home.x, e.y - home.y);
  const hurt = e.hp < e.maxHp;
  let best = null, bd = hurt ? LANES.CAMP_AGGRO * 1.6 : LANES.CAMP_AGGRO;
  if(dh < LANES.CAMP_LEASH){
    for(const h of heroes){ if(!h.alive || h.stealthTimer > 0) continue; const d = Math.hypot(h.x - e.x, h.y - e.y); if(d < bd){ bd = d; best = h; } }
    if(best) return best;
  }
  if(dh > 36){ if(dh > LANES.CAMP_LEASH || !hurt) e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.02); return lanesWaypointFor(e, home.x, home.y); }
  if(hurt) e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.01);
  return lanesWaypointFor(e, home.x + 400, home.y);   // quieto en casa (el objetivo auxiliar queda fuera de su alcance)
}
function lanesJungleKilled(e, kt, killer){
  const L = LN;
  if(e.epicId != null){
    const ep = L.epics[e.epicId], def = LANES_EPICS[e.epicId]; ep.mon = null; ep.respawnAt = L.t + LANES.EPIC_RESPAWN_MS;
    if(kt != null){
      const T = L.team[kt]; lanesGrantGold(kt, LANES.GOLD_EPIC); lanesGrantXP(kt, e.x, e.y, e.lnXp);
      if(def.key === "dragon"){ T.buffs.dragon = L.t + LANES.BUFF_MS; }
      else { T.buffs.rey = L.t + LANES.BUFF_MS; T.superWaves = 2; }
      lanesFeed(lanesTeamName(kt) + " venció al " + def.name, kt); showBanner("¡" + lanesTeamName(kt) + " VENCIÓ AL " + def.name.toUpperCase() + "!");
    }
    return;
  }
  const camp = L.camps[e.campId]; if(!camp) return;
  const def = LANES_CAMPS[e.campId], K = LANES_CAMP_KINDS[def.kind];
  if(camp.mons.every(m=>!m.alive || m === e)){ camp.respawnAt = L.t + LANES.CAMP_RESPAWN_MS; camp.mons = []; }
  if(kt != null && killer && killer.classKey){
    lanesAddGold(killer, Math.round(K.gold / K.n));
    lanesGrantXP(kt, e.x, e.y, e.lnXp);
    if(K.buff && !camp.mons.length){ killer._lnBuff = {until:L.t + LANES.BUFF_MS * 0.8, dmg:1.12}; killer.energy = killer.maxEnergy; floatText(killer.x, killer.y - 60, "¡Bendición del Gigante!", "heal"); }
  }
}
