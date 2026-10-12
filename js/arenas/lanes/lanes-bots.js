"use strict";
/* ============================================================
   js/arenas/lanes/lanes-bots.js
   GUERRA DE CRISTALES en el motor real — cómo se mueven los bots (los combates los resuelve el cerebro de bots de siempre).
   Cada bot tiene un rol de carril (medio, abajo, abajo, arriba, selva): acompaña a su horda a una distancia segura de las torres
   rivales, ataca héroes rivales débiles y súbditos, vuelve a la base si está herido y el de la selva limpia campamentos y se
   suma a las peleas del río. `botLeader(h)` devuelve un punto/objeto al que el bot se acerca (el motor ya lo usaba).
   ============================================================ */
function lanesFollowObj(h){
  const L = LN, c = L.rallyObj || (L.rallyObj = {});
  return c[h.lane + ":" + h.classKey] || (c[h.lane + ":" + h.classKey] = {isRally:true, alive:true, hp:1, maxHp:1, radius:20, x:0, y:0, stunTimer:0, slowTimer:0});
}
// Posición del carril `l` a la que debe ir un bot del equipo T: detrás del frente de su horda y fuera del alcance de las torres rivales.
function lanesLanePost(h, l){
  const T = h.team, L = LN, dir = T === 0 ? 1 : -1, foe = 1 - T, P = LANES_PATHS[l];
  let lead = null, ls = T === 0 ? -1 : 1e9;
  for(const e of enemies){ if(!e.alive || e.lanesProxy || e.team !== T || e.ln !== l) continue; const s = laneProject(l, e.x, e.y).s; if(T === 0 ? s > ls : s < ls){ ls = s; lead = e; } }
  const front = lanesFrontIn(foe, l);
  const ownFront = lanesFrontIn(T, l);
  if(!lead){   // sin horda propia en el carril: defiende su torre más avanzada
    const t = ownFront && ownFront.kind === "tower" ? ownFront : null;
    const base = t ? laneProject(l, t.x, t.y).s : (T === 0 ? 400 : P.len - 400);
    return lanePoint(l, base + dir * 140);
  }
  let target = ls - dir * 60;          // un poco detrás del súbdito más adelantado
  if(front && front.kind === "tower"){
    const fs = front._s != null ? front._s : (front._s = laneProject(l, front.x, front.y).s);
    let near = 0; for(const e of enemies) if(e.alive && !e.lanesProxy && e.team === T && Math.hypot(e.x - front.x, e.y - front.y) < 480) near++;
    const safe = (near >= 3 ? 150 : LANES.TOWER_RANGE + 40);
    const limit = fs - dir * safe;     // hasta dónde puede avanzar sin entrar al alcance de la torre
    target = T === 0 ? Math.min(target, limit) : Math.max(target, limit);
  }
  return lanePoint(l, target);
}
// Campamento vivo más cercano del lado del equipo (o del otro, si ya no queda).
function lanesPickCamp(h){
  const L = LN; let best = null, bd = 1e12;
  for(const c of L.camps){ if(!c.mons.length || c.mons.every(m=>!m.alive)) continue; const def = LANES_CAMPS[c.id]; const d = Math.hypot(def.x - h.x, def.y - h.y) + (def.side === h.team ? 0 : 1500); if(d < bd){ bd = d; best = def; } }
  return best;
}
function lanesLeaderFor(h){
  const L = LN;
  if(L.mode === "coliseo") return colLeaderFor(h);
  const o = lanesFollowObj(h), T = h.team, c = laneCrystalPos(T);
  let p = laneRally(T);
  const low = h.hp < h.maxHp * 0.35;
  const homeDist = Math.hypot(h.x - c.x, h.y - c.y);
  // con mucho oro y sin enemigos cerca, vuelve a comprar objetos (como haría una persona)
  if(!low && !h._recall && homeDist > 700 && (h.gold || 0) >= 700 && L.t - (h._shopTrip || 0) > 45000 && !heroes.some(o=>o.alive && o.team !== T && Math.hypot(o.x - h.x, o.y - h.y) < 750)){
    h._shopTrip = L.t; lanesRecallStart(h);
  }
  if(low){ if(homeDist > 400 && !h._recall && (!h._lastRecallTry || L.t - h._lastRecallTry > 4000)){ h._lastRecallTry = L.t; lanesRecallStart(h); } }   // herido: vuelve a la base
  else if(h.ln === -1){
    // selva: limpia campamentos; si hay un objetivo épico con su equipo cerca, va (a partir de los 5 minutos)
    const camp = lanesPickCamp(h);
    if(camp) p = camp; else p = lanePoint(1, LANES_PATHS[1].len * (T === 0 ? 0.42 : 0.58));
  } else {
    const l = h.ln != null && h.ln >= 0 ? h.ln : 1;
    p = lanesLanePost(h, l);
  }
  o.x = p.x; o.y = p.y; return o;
}
// Gancho botTarget: héroe rival débil > súbdito/criatura cercana > estructura (solo si la horda propia la acompaña)
function lanesBotTarget(h, range){
  if(LN.mode === "coliseo") return colBotTarget(h, range);
  let best = null, bs = -1e9;
  for(const e of enemies){
    if(!e.alive || e.team === h.team) continue;
    const d = distance(h, e); if(d > range) continue;
    let s;
    if(e.lanesProxy && e.kind === "hero"){ s = 420 - d * 0.4 + (1 - e.lnRef.hp / e.lnRef.maxHp) * 320; }
    else if(e.lanesProxy){
      if(!lanesExposed(e.lnRef)) continue;
      let own = 0; for(const m of enemies) if(m.alive && !m.lanesProxy && m.team === h.team && Math.hypot(m.x - e.x, m.y - e.y) < 450) own++;
      if(e.lnRef.kind === "tower" && own < 3) continue;
      s = 130 - d * 0.2;
    } else if(e.team === 2){ s = (h.ln === -1 ? 260 : 60) - d * 0.4; }
    else s = 200 - d * 0.5 + (e.kindM === "caster" ? 40 : 0);
    if(s > bs){ bs = s; best = e; }
  }
  return best;
}
