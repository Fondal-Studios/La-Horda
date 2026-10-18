"use strict";
/* ============================================================
   js/arenas/lanes/lanes-bot-ai.js
   BOTS ORIENTADOS A VICTORIA (Guerra de Cristales). Se apoya en lanes-bots.js (puestos de carril, objetivos épicos, selva) y en
   js/ai/bot-brain.js (esquive, revivir, roles); agrega lo que faltaba para ganar:
   - EVALUACIÓN DE AMENAZAS (`lanesThreat`): fuerza aliada vs rival cerca, y si está bajo una torre rival sin súbditos que la distraigan.
   - ESTADOS DE DECISIÓN por bot (`lanesDecide` → h._ai.state): retreat · defend · objective · push · lane · jungle.
   - PLAN DE EQUIPO (`lanesPlan`, uno por equipo cada ~0,5 s): estructuras bajo ataque (defender), objetivo épico (reunirse antes de
     entrar) y carril donde empujar en grupo (≥3 héroes sanos).
   - PATHFINDING táctico (`lanesSteer`): el camino a un objetivo lejano rodea el alcance de las torres rivales que no se están asediando.
   - OBJETIVOS (`lanesBotTarget` / `lanesTargetScore`): héroe rival débil > cristal/torre expuestos con escolta > épico con el equipo >
     súbdito que estorba. Los campamentos de la selva solo son de la selvática; nadie le pega a un épico sin su equipo.
   Interruptor: globalThis.BOT_VICTORY_TEAMS (lista de equipos con el cerebro nuevo; sin definir = todos) — lo usan las simulaciones
   (tools/bots/victory-sim.js) para comparar contra el comportamiento anterior en la misma partida.
   ============================================================ */
const BOTAI = {
  THREAT_R:760,          // a qué distancia se cuentan aliados y rivales para la amenaza
  RETREAT_HP:0.35,       // por debajo de esta vida relativa se retira siempre
  OUTNUMBERED:0.62,      // fuerza aliada / rival por debajo de esto (con vida < 65%) = retirada
  ESCORT_MIN:3,          // súbditos propios junto a una torre rival para poder asediarla
  GROUP_MIN:3,           // héroes sanos que hacen falta para empujar/entrar al objetivo épico en grupo
  PUSH_FROM_MS:150000,   // desde cuándo se agrupan para empujar
  DEFEND_R:1900,         // a qué distancia de una torre bajo ataque acuden los bots a defender
  EPIC_TRY_MS:30000, EPIC_COOL_MS:90000,   // cuánto intenta un épico antes de rendirse y cuánto espera para reintentar
  PLAN_MS:500, DECIDE_MS:250
};
function botVictoryOn(h){ const t = globalThis.BOT_VICTORY_TEAMS; return !t || (h && t.includes(h.team)); }
function lanesPow(o){ return (0.4 + 0.6 * o.hp / o.maxHp) * (1 + 0.1 * (o.mlvl || LANES.LEVEL0)); }   // vida y nivel: "cuánto pega y aguanta"

/* ---------------- amenazas ---------------- */
// Súbditos propios vivos cerca de un punto (cacheado por cuadro de decisión: lo consultan todos los bots).
function lanesEscort(team, x, y, r){
  let n = 0; for(const e of enemies) if(e.alive && !e.lanesProxy && e.team === team && Math.abs(e.x - x) < r && Math.abs(e.y - y) < r && Math.hypot(e.x - x, e.y - y) < r) n++;
  return n;
}
// Torre rival viva cuyo alcance cubre el punto.
function lanesTowerCovering(foeTeam, x, y, pad){
  const T = LN.team[foeTeam]; if(!T) return null;
  for(const s of T.S) if(s.alive && s.kind === "tower" && Math.hypot(s.x - x, s.y - y) < LANES.TOWER_RANGE + (pad || 0)) return s;
  return null;
}
function lanesThreat(h){
  const L = LN; if(h._thrAt != null && L.t - h._thrAt < BOTAI.DECIDE_MS && h._thr) return h._thr;
  let foes = 0, foeN = 0, allies = lanesPow(h), allyN = 1, nearFoe = null, nd = 1e9;
  for(const o of heroes){
    if(o === h || !o.alive) continue;
    const d = Math.hypot(o.x - h.x, o.y - h.y); if(d > BOTAI.THREAT_R) continue;
    if(o.team === h.team){ allies += lanesPow(o); allyN++; }
    else { foes += lanesPow(o); foeN++; if(d < nd){ nd = d; nearFoe = o; } }
  }
  const tw = lanesTowerCovering(1 - h.team, h.x, h.y, 30);
  const underTower = !!tw && lanesEscort(h.team, tw.x, tw.y, 520) < BOTAI.ESCORT_MIN && allyN < BOTAI.GROUP_MIN;
  return (h._thrAt = L.t, h._thr = {foes, foeN, allies, allyN, ratio:allies / Math.max(0.05, foes), nearFoe, nd, underTower, tower:tw});
}

/* ---------------- plan de equipo ---------------- */
function lanesPlan(team){
  const L = LN, P = L._plan || (L._plan = []);
  if(P[team] && L.t - P[team].at < BOTAI.PLAN_MS) return P[team];
  const foe = 1 - team, plan = {at:L.t, alert:null, push:null, epic:null, ready:0};
  // 1) estructura propia bajo ataque: la que tenga más rivales encima (el cristal pesa más)
  let best = 0;
  for(const s of LN.team[team].S){
    if(!s.alive) continue;
    let en = 0, hv = 0;
    for(const e of enemies){
      if(!e.alive || e.team !== foe || Math.abs(e.x - s.x) > 700 || Math.abs(e.y - s.y) > 700) continue;
      if(e.lanesProxy){ if(e.kind === "hero") hv++; } else if(Math.hypot(e.x - s.x, e.y - s.y) < 640) en++;
    }
    // amenaza real: héroes rivales encima, o una horda que ya la está dañando (una oleada normal no mueve a nadie), o algo en el cristal
    const real = (hv > 0 && (s.hp < s.maxHp * 0.9 || en >= 3 || hv >= 2)) || (s.kind === "tower" && en >= 4 && s.hp < s.maxHp * 0.85) || (s.kind === "crystal" && en > 0);
    const score = en + hv * 4 + (s.kind === "crystal" ? 12 : 0);
    if(real && score > best){ best = score; plan.alert = {s, en, hv, score}; }
  }
  // 2) héroes sanos del equipo (los que pueden agruparse)
  const fit = heroes.filter(o=>o.team === team && o.alive && o.hp > o.maxHp * 0.55 && !o._recall);
  plan.ready = fit.length;
  // 3) objetivo épico vivo: se junta el equipo en un punto de reunión y recién entra con ≥3 cerca
  if(L.epics){
    let ep = null, bd = 1e12;
    const ref = laneRally(team);
    for(const e of L.epics){ if(!e.mon || !e.mon.alive) continue; const d = Math.hypot(e.mon.x - ref.x, e.mon.y - ref.y); if(d < bd){ bd = d; ep = e.mon; } }
    // presupuesto del intento: si tras 30 s el épico sigue sano (>50 %), se rinde 90 s y vuelve a los carriles (no se queda de por vida en el río)
    let et = P[team] && P[team].et;
    if(ep){
      if(!et || et.mon !== ep) et = {mon:ep, t0:L.t, until:0};
      if(et.until && L.t >= et.until){ et.until = 0; et.t0 = L.t; }
      if(!et.until && L.t - et.t0 > BOTAI.EPIC_TRY_MS && ep.hp > ep.maxHp * 0.5) et.until = L.t + BOTAI.EPIC_COOL_MS;
    }
    plan.et = et;
    if(ep && !et.until && fit.length >= BOTAI.GROUP_MIN){
      const near = fit.filter(o=>Math.hypot(o.x - ep.x, o.y - ep.y) < 700).length;
      const foesNear = heroes.filter(o=>o.team === foe && o.alive && Math.hypot(o.x - ep.x, o.y - ep.y) < 900).length;
      if(foesNear <= fit.length - 1){
        const rc = laneCrystalPos(team), dx = rc.x - ep.x, dy = rc.y - ep.y, l = Math.hypot(dx, dy) || 1;
        plan.epic = {mon:ep, go:near >= BOTAI.GROUP_MIN || (P[team] && P[team].epic && P[team].epic.mon === ep && P[team].epic.go && near >= 2), near,
          stage:{x:ep.x + dx / l * 520, y:ep.y + dy / l * 520}};
      }
    }
  }
  // 4) empuje en grupo: el carril donde la horda propia ya está más adelantada (se mantiene unos segundos para no zigzaguear)
  if(L.t > BOTAI.PUSH_FROM_MS && fit.length >= BOTAI.GROUP_MIN && !plan.alert){
    const prev = P[team] && P[team].push;
    if(prev && L.t < prev.until) plan.push = prev;
    else {
      let bl = -1, bs = -1e9;
      for(let l = 0; l < 3; l++){
        const fr = lanesFrontIn(foe, l); if(!fr) continue;
        let lead = team === 0 ? -1 : 1e9;
        for(const e of enemies){ if(!e.alive || e.lanesProxy || e.team !== team || e.ln !== l) continue; const s = laneProject(l, e.x, e.y).s; lead = team === 0 ? Math.max(lead, s) : Math.min(lead, s); }
        const hasHorde = team === 0 ? lead > 0 : lead < 1e8;
        const prog = hasHorde ? (team === 0 ? lead : LANES_PATHS[l].len - lead) / LANES_PATHS[l].len : 0;
        const here = fit.filter(o=>laneProject(l, o.x, o.y).d < 500).length;
        const s = prog * 100 + here * 12 + (1 - fr.hp / fr.maxHp) * 40 + (fr.kind === "crystal" ? 60 : 0);
        if(s > bs){ bs = s; bl = l; }
      }
      if(bl >= 0) plan.push = {lane:bl, until:L.t + 14000};
    }
  }
  return (P[team] = plan);
}

/* ---------------- estados de decisión ---------------- */
function lanesDecide(h){
  const L = LN, ai = h._ai || (h._ai = {state:"lane", at:-1e9, goal:null});
  if(L.t - ai.at < BOTAI.DECIDE_MS) return ai;
  ai.at = L.t;
  const T = lanesThreat(h), plan = lanesPlan(h.team), low = h.hp < h.maxHp * BOTAI.RETREAT_HP;
  const c = laneCrystalPos(h.team);
  let state = "lane", goal = null, why = "";
  // retirada con histéresis: si se fue por vida baja, no vuelve hasta recuperarse (en la base se cura sola)
  const healing = ai.state === "retreat" && ai.why === "low" && h.hp < h.maxHp * 0.75;
  if(low || healing || T.underTower || (T.foeN && T.ratio < BOTAI.OUTNUMBERED && h.hp < h.maxHp * 0.65)){
    state = "retreat"; why = (low || healing) ? "low" : T.underTower ? "tower" : "outnum";
    const l = h.ln != null && h.ln >= 0 ? h.ln : lanesLaneOf(h.x, h.y);
    const own = lanesFrontIn(h.team, l);
    goal = (why !== "low" && own && own.kind === "tower") ? lanesSafePost(h, l) : {x:c.x + (h.team === 0 ? 150 : -150), y:c.y + (h.team === 0 ? -150 : 150)};
  } else if(plan.alert && plan.alert.s && !(plan.alert.hv > plan.ready + 1) && (plan.alert.s.kind === "crystal" ||
            Math.hypot(plan.alert.s.x - h.x, plan.alert.s.y - h.y) < (plan.alert.hv > 0 || plan.alert.s.lane === h.ln ? BOTAI.DEFEND_R : 1100))){
    state = "defend"; const s = plan.alert.s, k = laneRally(h.team), dx = k.x - s.x, dy = k.y - s.y, l = Math.hypot(dx, dy) || 1;
    goal = {x:s.x + dx / l * 90, y:s.y + dy / l * 90};
  } else if(plan.epic && h.hp > h.maxHp * 0.5){
    state = "objective"; goal = plan.epic.go ? {x:plan.epic.mon.x, y:plan.epic.mon.y - 60} : plan.epic.stage;
  } else if(plan.push && h.ln !== -1){
    state = "push"; goal = lanesLanePost(h, plan.push.lane, true);
  } else if(h.ln === -1){
    state = "jungle";
  }
  ai.state = state; ai.goal = goal; ai.why = why;
  return ai;
}
// Retaguardia segura del carril l: detrás de la torre propia más adelantada.
function lanesSafePost(h, l){
  const own = lanesFrontIn(h.team, l), dir = h.team === 0 ? 1 : -1;
  const base = own && own.kind === "tower" ? laneProject(l, own.x, own.y).s : (h.team === 0 ? 400 : LANES_PATHS[l].len - 400);
  return lanePoint(l, base - dir * 120);
}

/* ---------------- pathfinding táctico ---------------- */
// Rodea el alcance de las torres rivales (salvo si el bot está asediando con escolta). Devuelve un vector unitario.
function lanesSteer(h, gx, gy, siege){
  let dx = gx - h.x, dy = gy - h.y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
  if(siege) return {x:dx, y:dy};
  const foe = 1 - h.team, T = LN.team[foe]; let ax = 0, ay = 0;
  for(const s of T.S){
    if(!s.alive || s.kind !== "tower") continue;
    const R = LANES.TOWER_RANGE + 70, px = s.x - h.x, py = s.y - h.y, pd = Math.hypot(px, py);
    if(pd > R + 500) continue;
    const along = px * dx + py * dy; if(along < -60) continue;                // la torre quedó atrás
    const perp = px * -dy + py * dx;                                          // de qué lado del camino está
    const nearest = along > 0 ? Math.min(Math.abs(perp), pd) : pd;
    if(nearest < R){
      // ya adentro del alcance: salir radialmente; si el camino lo cruza: bordear por el lado contrario
      if(pd < R){ ax -= px / pd * 1.6; ay -= py / pd * 1.6; }
      else { const side = perp > 0 ? -1 : 1; ax += -dy * side * 1.4 * (1 - nearest / R); ay += dx * side * 1.4 * (1 - nearest / R); }
    }
  }
  let mx = dx + ax, my = dy + ay; const ml = Math.hypot(mx, my) || 1;
  return {x:mx / ml, y:my / ml};
}

/* ---------------- gancho botState (bot-brain.js, paso 2e) ---------------- */
// Retirada y viajes largos con camino táctico. Devuelve {mx,my,target,state} o null (sigue el comportamiento por rol de siempre).
function lanesBotState(h, target){
  if(!LN || !botVictoryOn(h)) return null;
  if(LN.mode === "coliseo") return colBotState(h, target);
  const ai = lanesDecide(h);
  if(ai.state === "retreat" && ai.goal){
    if(h._recall) return {mx:0, my:0, target:null, state:"retreat"};
    const d = Math.hypot(ai.goal.x - h.x, ai.goal.y - h.y);
    const c = laneCrystalPos(h.team);
    if(h.hp < h.maxHp * BOTAI.RETREAT_HP && Math.hypot(h.x - c.x, h.y - c.y) > 400 && !h._recall && (!h._lastRecallTry || LN.t - h._lastRecallTry > 4000) && !(h._thr && h._thr.nd < 480)){ h._lastRecallTry = LN.t; lanesRecallStart(h); }
    if(d > 60){ const v = lanesSteer(h, ai.goal.x, ai.goal.y, false); return {mx:v.x, my:v.y, target:(h._thr && h._thr.nd < 260) ? target : null, state:"retreat"}; }
    return {mx:0, my:0, target:null, state:"retreat"};
  }
  if(ai.goal && (ai.state === "defend" || ai.state === "objective" || ai.state === "push")){
    const d = Math.hypot(ai.goal.x - h.x, ai.goal.y - h.y);
    if(d > 420){ // viaje: sin pelear con lo que encuentre de paso salvo que tenga a un héroe rival encima
      const hot = target && target.lanesProxy && target.kind === "hero" && distance(h, target) < 300;
      const v = lanesSteer(h, ai.goal.x, ai.goal.y, ai.state === "defend");
      return {mx:v.x, my:v.y, target:hot ? target : (ai.state === "defend" ? target : null), state:ai.state};
    }
  }
  return null;
}

/* ---------------- objetivos ---------------- */
// Puntaje de `e` como objetivo del bot `h` a distancia `d` (null = ignorarlo). Es el mismo para moverse y para el ataque básico.
function lanesTargetScore(h, e, d, T, plan, ai){
  const retreat = ai.state === "retreat";
  if(e.lanesProxy && e.kind === "hero"){
    const hp = e.lnRef.hp / e.lnRef.maxHp;
    if(retreat) return d < 280 ? 300 - d * 0.4 : null;                       // huyendo: solo responde al que lo alcanza
    const cov = lanesTowerCovering(h.team === 0 ? 1 : 0, e.x, e.y, 0);       // ¿el rival está al amparo de su torre?
    const hasTower = cov && lanesEscort(h.team, cov.x, cov.y, 520) < BOTAI.ESCORT_MIN && T.allyN < BOTAI.GROUP_MIN;
    if(hasTower && hp > 0.3) return null;                                    // no se lanza a morir bajo la torre
    if(T.ratio < BOTAI.OUTNUMBERED && hp > 0.35 && d > 180) return null;     // peleas perdidas: no perseguir
    return 420 - d * 0.4 + (1 - hp) * 340 + (hp < 0.25 ? 120 : 0);
  }
  if(retreat) return null;
  if(e.lanesProxy){                                                          // torre / cristal rival
    const s = e.lnRef; if(!lanesExposed(s)) return null;
    const own = lanesEscort(h.team, e.x, e.y, 520), group = T.allyN >= 2 && own >= 1;
    if(s.kind === "tower" && own < BOTAI.ESCORT_MIN && !(T.allyN >= BOTAI.GROUP_MIN)) return null;
    if(s.kind === "tower" && T.foeN > T.allyN + 1 && own < 6) return null;   // defendida por más héroes: no se entra
    return (s.kind === "crystal" ? 520 : 330) - d * 0.2 + (1 - s.hp / s.maxHp) * 120 + (group ? 30 : 0);
  }
  if(e.team === 2){                                                          // criaturas neutrales
    if(e.epicId != null){ return plan.epic && plan.epic.go && plan.epic.mon === e ? 380 - d * 0.3 : null; }   // nunca sola
    if(h.ln === -1 && ai.state === "jungle") return 260 - d * 0.4;
    return d < 170 ? 15 - d * 0.05 : null;                                    // los laners no limpian la selva: solo se defienden de lo que los muerde
  }
  return 150 - d * 0.5 + (e.kindM === "caster" ? 40 : 0);                    // súbditos rivales: lo que estorba el camino
}
// Gancho botTarget: el mejor objetivo en `range` para el bot `h`.
function lanesBotTargetVictory(h, range){
  const T = lanesThreat(h), plan = lanesPlan(h.team), ai = lanesDecide(h);
  let best = null, bs = -1e9;
  for(const e of enemies){
    if(!e.alive || e.team === h.team) continue;
    const d = distance(h, e); if(d > range) continue;
    const s = lanesTargetScore(h, e, d, T, plan, ai);
    if(s != null && s > bs){ bs = s; best = e; }
  }
  return best;
}
