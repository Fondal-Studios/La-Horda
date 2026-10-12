"use strict";
/* ============================================================
   js/arenas/lanes/lanes-minions.js
   GUERRA DE CRISTALES en el motor real — la HORDA de cada equipo: súbditos que salen solos de la base por los tres carriles
   (esqueletos melee, cristales voladores que disparan y, cada tres oleadas, un coloso de asedio). Caminan por el carril,
   pelean contra los súbditos rivales, atacan a los héroes rivales cercanos y derriban las torres en orden. Las cartas de horda
   (vida, daño, velocidad, cantidad, asedio, colosos, ritmo, regeneración) los potencian.
   ============================================================ */
const LANES_MINION_TYPES = {melee:"esqueleto", caster:"cristal_volador", siege:"golem_piedra", super:"golem"};
function lanesMinions(team){ let n = 0; for(const e of enemies) if(e.alive && !e.lanesProxy && e.team === team) n++; return n; }
// Crea una criatura de la horda del equipo `team` en (x, y), del carril `lane`. kind: melee | caster | siege | super.
function lanesSpawn(team, kind, x, y, lane, fromSend){
  const T = LN.team[team];
  if(lanesMinions(team) >= LANES.MAX_MINIONS) return null;
  LN.spawnCtx = {team, x, y};
  const e = spawnEnemy(LANES_MINION_TYPES[kind] || kind, false, false);
  LN.spawnCtx = null;
  if(!e) return null;
  const m = T.mods, w = Math.max(1, T.wave), hpK = kind === "siege" ? 2.4 : kind === "super" ? 1.4 : 3.2;
  e.team = team; e.ln = lane; e.noLoot = true; e.dropsItem = false; e.fromSend = !!fromSend; e.kindM = kind; e.isBrute = kind === "siege" || kind === "super";
  e.hp = e.maxHp = Math.round(e.maxHp * hpK * (1 + w * 0.06) * m.hp * (kind === "super" ? 2.2 : 1));
  e.dmg = Math.round(e.dmg * (1 + w * 0.04) * 0.9 * m.dmg * (kind === "super" ? 1.6 : 1));
  e.speed *= LANES.MINION_SPEED * m.speed * (kind === "melee" ? 0.82 : 1) * (kind === "siege" || kind === "super" ? 0.9 : 1);
  e.siegeMult = m.siege * (kind === "siege" || kind === "super" ? 1.5 : 1); e.regenPct = m.regen;
  e.lnXp = kind === "caster" ? LANES.XP_CASTER : kind === "melee" ? LANES.XP_MINION : LANES.XP_SIEGE; e.xp = 0; e.gold = 0;   // (la experiencia es la de la partida, no la del guardado)
  return e;
}
function lanesSendNow(team, key, lane){
  const P = LANES_PATHS[lane], dir = team === 0 ? 1 : -1, s0 = team === 0 ? 70 : P.len - 70;
  if(key === "swarm"){ for(let i = 0; i < 5; i++){ const p = lanePoint(lane, s0 + dir * i * 34), e = lanesSpawn(team, "melee", p.x, p.y, lane, true); if(e) e.speed *= 1.1; } }
  else { const p = lanePoint(lane, s0), e = lanesSpawn(team, "siege", p.x, p.y, lane, true); if(e) e.isBrute = true; }
}
function lanesWaveStart(T){
  const L = LN, m = T.mods, team = T.team;
  T.wave++; T.nextWave += LANES.WAVE_MS * m.pace; L.wave = Math.max(L.wave, T.wave);
  const melee = 3 + Math.floor(m.count / 3), casters = 2 + (m.count % 3 ? 1 : 0), siege = (T.wave % 3 === 0 ? 1 : 0) + m.brute;
  const behind = lanesTowersAlive(team) < lanesTowersAlive(1 - team);   // remontada: quien perdió torres cobra un poco más
  for(let l = 0; l < 3; l++){
    const P = LANES_PATHS[l], dir = team === 0 ? 1 : -1, s0 = team === 0 ? 70 : P.len - 70;
    let n = 0;
    const put = kind=>{ const p = lanePoint(l, s0 + dir * n * 38); n++; return lanesSpawn(team, kind, p.x + (Math.random() - 0.5) * 20, p.y + (Math.random() - 0.5) * 20, l); };
    for(let i = 0; i < melee; i++) put("melee");
    for(let i = 0; i < casters; i++) put("caster");
    for(let i = 0; i < siege; i++) put("siege");
    if(T.superWaves > 0) put("super");
  }
  if(T.superWaves > 0) T.superWaves--;
  if(behind){ T.assist++; lanesGrantGold(team, 25); }   // remontada: el equipo con menos torres cobra un poco más
}
// gancho placeSpawn: la criatura sale del punto indicado
function lanesPlaceSpawn(e){
  const c = LN && LN.spawnCtx; if(!c) return;
  e.team = c.team; e.x = c.x; e.y = c.y;
}

/* ---------------- a quién ataca cada criatura ---------------- */
// Objetivo auxiliar que se mueve por el carril: la criatura camina hacia él y nunca llega a "atacarlo".
function lanesWaypointFor(e, x, y){
  const w = e._wp || (e._wp = {isWaypoint:true, alive:true, radius:6, hp:1, maxHp:1, stunTimer:0, slowTimer:0, burnTimer:0, bleedTimer:0});
  w.x = x; w.y = y; return w;
}
function lanesEnemyTarget(e){
  const L = LN; if(!L || e.team == null) return null;
  if(e.team === 2) return lanesCampTarget(e);
  if(L.mode === "coliseo") return null;
  const foe = 1 - e.team, lane = e.ln != null ? e.ln : 1;
  // 1) súbdito rival cerca
  let best = null, bd = LANES.MINION_AGGRO_MIN;
  for(const o of enemies){ if(!o.alive || o.lanesProxy || o.team !== foe) continue; const d = Math.hypot(o.x - e.x, o.y - e.y); if(d < bd){ bd = d; best = o; } }
  if(best) return best;
  // 2) héroe rival cerca (si no se aleja demasiado del carril)
  bd = LANES.MINION_AGGRO_HERO;
  for(const h of heroes){ if(!h.alive || h.team !== foe || h.stealthTimer > 0) continue; const d = Math.hypot(h.x - e.x, h.y - e.y); if(d < bd){ bd = d; best = h; } }
  if(best) return best;
  // 3) la estructura que le toca derribar en su carril, cuando ya está cerca
  const front = lanesFrontIn(foe, lane);
  const pr = laneProject(lane, e.x, e.y), dir = e.team === 0 ? 1 : -1;
  if(front){
    const fs = front._s != null ? front._s : (front._s = laneProject(lane, front.x, front.y).s);
    const ahead = (fs - pr.s) * dir;
    if(ahead < 340 && Math.hypot(front.x - e.x, front.y - e.y) < 720) return front;
    if(ahead < 0 && front.kind === "crystal") return front;
  }
  // 4) seguir el carril
  const p = lanePoint(lane, pr.s + dir * 320);
  if(pr.d > 260) return lanesWaypointFor(e, p.x, p.y);             // se desvió: vuelve al camino
  return lanesWaypointFor(e, p.x, p.y);
}
// Golpe a otro súbdito (damageHero con una criatura como objetivo)
function lanesMinionHit(m, amount, src){
  if(!LN || LN.ended || !m.alive) return;
  const st = lanesTeamOf(src); if(st != null && st === m.team) return;
  m.hp -= amount; m.hitFlash = 110;
  if(m.hp <= 0){ m.lastHitBy = src && src.classKey ? src : null; m._killTeam = st; killEnemy(m); }
}
// Proyectil de un súbdito/campamento: pega a súbditos y estructuras rivales (el motor solo lo comparaba con héroes)
function lanesEnemyProjectile(p){
  const L = LN, src = p.src; if(!L || p.life <= 0 || !src || src.team == null) return;
  for(const o of enemies){
    if(!o.alive || o.lanesProxy || o.team == null || o.team === src.team) continue;
    if(Math.hypot(o.x - p.x, o.y - p.y) < (o.radius || 18) + p.radius){ lanesMinionHit(o, p.dmg, src); p.life = 0; return; }
  }
  if(src.team === 2) return;
  const foe = L.team[1 - src.team];
  for(const s of foe.S){ if(!s.alive) continue; if(Math.hypot(s.x - p.x, s.y - p.y) < s.radius + p.radius + 6){ lanesHitStruct(s, p.dmg, src); p.life = 0; return; } }
}

/* ---------------- ciclo ---------------- */
function lanesMinionsTick(dt){
  for(const e of enemies){ if(e.alive && !e.lanesProxy && e.regenPct && e.hp < e.maxHp) e.hp = Math.min(e.maxHp, e.hp + e.maxHp * e.regenPct * dt / 1000); }
}
// Gancho enemyKilled: oro y experiencia por las bajas de súbditos y de la selva
function lanesEnemyKilled(e){
  const L = LN; if(!L || L.ended || e.lanesProxy || e.team == null) return;
  const k = e.lastHitBy, kt = k ? lanesTeamOf(k) : (e._killTeam != null ? e._killTeam : null);
  if(e.team === 2){ lanesJungleKilled(e, kt, k); return; }
  if(kt == null || kt === e.team) return;
  const T = L.team[kt]; T.kills++;
  if(k && k.classKey) lanesAddGold(k, e.kindM === "caster" ? LANES.GOLD_MINION[1] : e.isBrute ? LANES.GOLD_MINION[2] : LANES.GOLD_MINION[0]);   // el oro es del que da el último golpe
  lanesGrantXP(kt, e.x, e.y, e.lnXp || LANES.XP_MINION);
}
