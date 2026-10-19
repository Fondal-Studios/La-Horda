"use strict";
/* ============================================================
   js/systems/postgame.js
   POSTGAME de Guerra de Cristales y Coliseo (solo contra bots). Documento: docs/modes/POSTGAME.md.
   1) ACCESO: se abre al ganar la última arena de la campaña (flag real: save.arenasCleared). Antes, el hub ofrece el
      ENTRENAMIENTO: campeón normalizado, sin recompensas, sin progresión. Interruptor único: POSTGAME_GATE (js/data/postgame.js).
   2) PROGRESIÓN: el campeón entra con su nivel, talentos, maestría, objetos y sets, RECORTADOS por LANES.PROGRESS_CAP
      (js/arenas/lanes/lanes-data.js). Se trabaja con una COPIA dentro del guardado temporal de la partida: el guardado real no se
      toca durante el juego (lanesBegin lo reemplaza y lanesRestore lo devuelve) y solo recibe la recompensa final.
   3) RECOMPENSAS: oro, XP de cuenta, uso de maestría y cosméticos, con TOPE DIARIO. El oro y el reloj son del cliente.
   Nada de esto toca js/net/*, server/* ni las salas online (lanesBegin con otro rol que "solo" nunca instala el perfil).
   ============================================================ */

/* ---------------- acceso ---------------- */
function postgameCampaignDone(sv){
  sv = sv || save;
  const cl = (sv && sv.arenasCleared) || {}, last = ARENA_ORDER[ARENA_ORDER.length - 1];
  return !!cl[last] || ARENA_ORDER.every(a=>cl[a]);   // victoria en la última arena (o toda la campaña ganada)
}
function postgameUnlocked(sv){
  if(typeof POSTGAME_GATE !== "undefined" && POSTGAME_GATE === "open") return true;
  sv = sv || save;
  return !!(sv && ((sv.postgame && sv.postgame.unlocked) || postgameCampaignDone(sv)));
}
// Marca (una vez) que el postgame se abrió: queda aunque después se reinicie la campaña. Devuelve true si cambió.
function postgameSyncUnlock(){
  if(typeof LN !== "undefined" && LN) return false;
  if(!postgameCampaignDone(save)) return false;
  const P = postgameState(); if(P.unlocked) return false;
  P.unlocked = true; P.unlockedAt = Date.now(); persist(); return true;
}
function postgameLockText(sv){
  sv = sv || save;
  const n = ARENA_ORDER.filter(a=>(sv.arenasCleared || {})[a]).length;
  return "Se abre al terminar la campaña (" + n + "/" + ARENA_ORDER.length + " arenas)";
}
// ¿Esta partida usa la progresión de campaña? Solo en solitario, con el postgame abierto y un campeón propio.
function postgameDecide(champKey, opts){
  opts = opts || {};
  const real = (typeof LN !== "undefined" && LN && LN.snap) ? LN.snap.save : save;
  if(opts.training) return {progress:false, why:"training", text:"Entrenamiento normalizado"};
  if(!postgameUnlocked(real)) return {progress:false, why:"locked", text:"Entrenamiento: " + postgameLockText(real)};
  const ch = real.champions && real.champions[champKey];
  if(!ch || !ch.unlocked) return {progress:false, why:"notowned", text:"Entrenamiento: todavía no tenés a este campeón"};
  return {progress:true, why:"postgame", text:"Postgame: tu campeón con tope de progresión"};
}

/* ---------------- estado del postgame (en el guardado real) ---------------- */
function _pgMode(){ return {played:0, wins:0, losses:0, draws:0, streak:0, best:0, trophies:0}; }
function postgameState(sv){
  sv = sv || save;
  let P = sv.postgame;
  if(!P || P.v !== 1 || !P.modes){
    P = sv.postgame = Object.assign({v:1, unlocked:false, unlockedAt:0, day:"", goldToday:0, xpToday:0, useToday:0, ach:{}, last:null}, P && typeof P === "object" ? P : {}, {v:1});
    P.modes = P.modes && typeof P.modes === "object" ? P.modes : {};
  }
  for(const m of ["cw", "col"]) P.modes[m] = Object.assign(_pgMode(), P.modes[m] || {});
  if(!P.ach || typeof P.ach !== "object") P.ach = {};
  return P;
}
function postgameDayKey(){
  const d = (typeof questsNow === "function") ? questsNow() : new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
// Cambia de día solo hacia ADELANTE: atrasar el reloj del equipo no devuelve el tope (el día guardado se conserva).
function postgameRollDay(P){
  const k = postgameDayKey();
  if(!P.day || k > P.day){ P.day = k; P.goldToday = 0; P.xpToday = 0; P.useToday = 0; }
  return P;
}
function postgameDaily(sv){
  const P = postgameRollDay(postgameState(sv)), D = POSTGAME_CFG.daily;
  return {gold:P.goldToday, goldCap:D.gold, xp:P.xpToday, xpCap:D.accountXp, use:P.useToday, useCap:D.masteryUse,
    goldLeft:Math.max(0, D.gold - P.goldToday), xpLeft:Math.max(0, D.accountXp - P.xpToday), full:P.goldToday >= D.gold && P.xpToday >= D.accountXp};
}

/* ---------------- perfil de progresión recortado ---------------- */
const _pgClone = o=>JSON.parse(JSON.stringify(o));
// Rama con más puntos primero, nodos de menor profundidad primero: conserva la build principal del jugador de raíz a punta.
function _pgPruneTalents(classKey, st, level, budget){
  const out = mkTalentState(), tree = typeof TALENT_TREES !== "undefined" ? TALENT_TREES[classKey] : null;
  if(!tree || !st || level < TALENT_TREE_MIN_LEVEL) return {state:out, spent:0};
  const byId = {}; for(const n of tree.nodes) byId[n.id] = n;
  const rankOf = id=>(st.nodes || {})[id] || 0;
  const depth = n=>{ let d = 0, c = n, g = 0; while(c && c.requires && g++ < 12){ c = byId[c.requires]; if(c) d++; } return d; };
  const inv = {}; for(const n of tree.nodes) inv[n.branch] = (inv[n.branch] || 0) + rankOf(n.id);
  const order = tree.nodes.map((n, i)=>({n, i})).filter(o=>rankOf(o.n.id) > 0)
    .sort((a, b)=>(inv[b.n.branch] - inv[a.n.branch]) || (depth(a.n) - depth(b.n)) || (a.i - b.i));
  let left = budget;
  const take = (n, nodesOut, rank, reqMap)=>{
    if(n.requires){ const rq = reqMap[n.requires]; if(!rq || (nodesOut[n.requires] || 0) < rq.maxRank) return; }
    if([].concat(n.exclusiveWith || []).some(x=>(nodesOut[x] || 0) > 0)) return;
    const cost = n.cost || 1, r = Math.min(rank, Math.floor(left / cost));
    if(r <= 0) return;
    nodesOut[n.id] = r; left -= r * cost;
  };
  for(const o of order) take(o.n, out.nodes, rankOf(o.n.id), byId);
  if(st.mastery && level >= TALENT_MASTERY_MIN_LEVEL && tree.masteries && tree.masteries[st.mastery]){
    const m = tree.masteries[st.mastery];
    const investBranch = tree.nodes.filter(n=>n.branch === m.branch).reduce((s, n)=>s + (out.nodes[n.id] || 0), 0);
    if(investBranch >= (tree.masteryRequirement || 10)){
      out.mastery = st.mastery;
      const mini = {}; for(const n of (m.miniTree || [])) mini[n.id] = n;
      for(const n of (m.miniTree || [])) if(((st.masteryNodes || {})[n.id] || 0) > 0) take(n, out.masteryNodes, st.masteryNodes[n.id], mini);
    }
  }
  return {state:out, spent:budget - left};
}
// Copia recortada del progreso de `classKey` del guardado `sv` (solo lectura). Devuelve null si el campeón no es propio.
function postgameProfile(sv, classKey){
  const CAP = LANES.PROGRESS_CAP, ch = sv && sv.champions && sv.champions[classKey];
  if(!ch || !ch.unlocked) return null;
  const real = Math.max(1, Math.min(99, ch.level | 0 || 1)), eff = Math.min(CAP.level, real);
  const c = _pgClone(ch);
  c.level = eff; c.xp = 0; c.talentPoints = 0; c.unlocked = true; delete c.loadoutItems;
  const pr = _pgPruneTalents(classKey, c.talents, eff, CAP.talentPoints);
  c.talents = pr.state;
  c.skillMastery = [0, 1, 2].map(i=>{ const m = (ch.skillMastery && ch.skillMastery[i]) || {}; return {useXp:0, useLvl:Math.max(1, Math.min(CAP.masteryUse, m.useLvl | 0 || 1)), alloc:Math.max(0, Math.min(CAP.masteryAlloc, m.alloc | 0))}; });
  { const m = ch.ultMastery || {}; c.ultMastery = {useXp:0, useLvl:Math.max(1, Math.min(CAP.masteryUse, m.useLvl | 0 || 1)), alloc:Math.max(0, Math.min(CAP.ultAlloc, m.alloc | 0))}; }
  const stash = [], eq = c.equipment = Object.assign(mkEquipment(), c.equipment || {});
  for(const type of Object.keys(eq)){
    const uid = eq[type]; if(!uid) continue;
    const it = (sv.stash || []).find(x=>x && x.uid === uid);
    if(!it){ eq[type] = null; continue; }
    const q = _pgClone(it); q.level = Math.min(CAP.itemLevel, Math.max(1, q.level | 0 || 1)); q.ilvl = Math.min(CAP.itemIlvl, Math.max(1, q.ilvl | 0 || 1));
    stash.push(q);
  }
  const relics = {}; for(const k of ["hp", "dmg", "def", "vel"]) relics[k] = Math.min(CAP.relics, (sv.relics && sv.relics[k]) | 0);
  return {champion:c, stash, relics, realLevel:real, effLevel:eff, talentSpent:pr.spent,
    levelFrac:Math.max(0, Math.min(1, (Math.min(real, CAP.levelStatFull) - 1) / (CAP.levelStatFull - 1)))};
}

/* ---------------- instalación en el guardado temporal de la partida ---------------- */
// Estadísticas del campeón con SU progreso recortado contra el mismo campeón sin nada (guardado temporal activo).
function postgameStatRatios(classKey){
  const lvl = 10;
  invalidatePassiveCache();
  const withP = computePlayerStats(classKey, lvl);
  const keep = {c:save.champions[classKey], stash:save.stash, relics:save.relics};
  save.champions[classKey] = mkChampion(true); save.champions[classKey].level = keep.c.level; save.stash = []; save.relics = {hp:0, dmg:0, def:0, vel:0};
  invalidatePassiveCache();
  const bare = computePlayerStats(classKey, lvl);
  save.champions[classKey] = keep.c; save.stash = keep.stash; save.relics = keep.relics;
  invalidatePassiveCache();
  return {hp:withP.hp / bare.hp, dmg:withP.dmg / bare.dmg, speed:withP.speed / bare.speed, defAdd:withP.def - bare.def, shield:withP.shieldPct || 0};
}
// Tope de pasivas (gancho de _passiveBucket en items.js): solo para el campeón del jugador con progreso dentro de la partida.
function postgamePassiveCap(sums, champKey){
  const L = (typeof LN !== "undefined") ? LN : null;
  if(!L || !L.pg || !L.pg.progress || champKey !== L.pg.classKey) return;
  const M = LANES.PROGRESS_CAP.passiveMax;
  for(const e in M) if(sums[e] > M[e]) sums[e] = M[e];
}
// Se llama justo después de lanesBegin("solo"): decide si entra con progreso y deja el resultado en LN.pg.
function postgameInstall(mode, champKey, opts){
  const L = LN; if(!L || L.role !== "solo") return null;
  const d = postgameDecide(champKey, opts), CAP = LANES.PROGRESS_CAP, key = mode === "coliseo" ? "col" : "cw";
  L.pg = {mode:key, classKey:champKey, progress:d.progress, why:d.why, text:d.text, player:null, bot:null, paid:false, result:null};
  if(!d.progress) return L.pg;
  const prof = postgameProfile(L.snap.save, champKey);
  if(!prof){ L.pg.progress = false; L.pg.why = "notowned"; L.pg.text = "Entrenamiento: todavía no tenés a este campeón"; return L.pg; }
  save.champions[champKey] = prof.champion; save.stash = prof.stash; save.relics = prof.relics;
  const r = postgameStatRatios(champKey), S = CAP.statMax;
  const lp = CAP.levelStatPct * prof.levelFrac;
  const eHp = (1 + lp) * r.hp, eDmg = (1 + lp) * r.dmg;
  const fHp = Math.min(1, S.hp / eHp), fDmg = Math.min(1, S.dmg / eDmg), fSpd = Math.min(1, S.speed / r.speed);
  L.pg.player = {hp:(1 + lp) * fHp, dmg:(1 + lp) * fDmg, speed:fSpd, defSub:Math.max(0, r.defAdd - S.defAdd), shieldMax:CAP.shieldMax};
  const share = CAP.botShare[key];
  L.pg.bot = {hp:1 + (S.hp - 1) * share, dmg:1 + (S.dmg - 1) * share, speed:1, defSub:0, shieldMax:0};
  L.pg.info = {realLevel:prof.realLevel, effLevel:prof.effLevel, talentSpent:prof.talentSpent, ratioHp:r.hp, ratioDmg:r.dmg, ratioSpeed:r.speed, defAdd:r.defAdd, shieldPct:r.shield, levelPct:lp,
    capped:{hp:fHp < 1, dmg:fDmg < 1, speed:fSpd < 1, def:r.defAdd > S.defAdd, shield:r.shield > CAP.shieldMax}};
  return L.pg;
}
// Etiqueta a los héroes (gancho de runStart): el jugador con su multiplicador, los bots con el de su modo.
function postgameTagHeroes(){
  const L = LN; if(!L || !L.pg || !L.pg.progress) return;
  for(const h of heroes){ h._pg = (h === player) ? L.pg.player : L.pg.bot; }
}

/* ---------------- recompensas ---------------- */
function postgameCommitting(){ return !!window.__pgCommit; }
// Ejecuta fn con el guardado REAL puesto (el de antes de la partida), lo escribe y vuelve al temporal.
function _pgWithRealSave(fn){
  const L = LN; if(!L || !L.snap) return null;
  const tmp = save; save = L.snap.save; window.__pgCommit = true;
  try{ const r = fn(); persistNow(); return r; }
  finally{ window.__pgCommit = false; save = tmp; }
}
function _pgCtx(L){
  const mine = player.team != null ? player.team : 0, key = L.pg.mode;
  if(key === "col"){
    const st = colStanding(), T = L.team[mine], place = st.findIndex(x=>x.team === mine) + 1;
    return {mode:"col", won:L.winner === mine, draw:L.winner === -1, place, duelsWon:T.wins, duelsNotWon:Math.max(0, T.duels - T.wins), kills:player.pgKills || 0, ms:L.t};
  }
  const T = L.team[mine];
  return {mode:"cw", won:L.winner === mine, draw:L.winner === -1, kills:player.pgKills || 0, towers:T.tk || 0, epics:T.epicsTaken || 0, ms:L.t, why:L.why};
}
// Oro/XP/uso SIN tope (lo que valió la partida); el tope diario se aplica después.
function postgameRawReward(ctx){
  const C = POSTGAME_CFG, M = C[ctx.mode], lines = [];
  let base, perf = 0, xp, use;
  if(ctx.mode === "col"){
    const k = ctx.draw ? "draw" : ["win", "second", "third", "fourth"][Math.max(0, Math.min(3, ctx.place - 1))];
    base = M[k]; xp = M.xp[k]; use = M.use[k];
    perf = M.perDuel * Math.min(M.maxDuels, ctx.duelsWon) + M.perKill * Math.min(M.maxKills, ctx.kills);
    lines.push(ctx.draw ? "Empate" : ["Campeón", "2.º puesto", "3.º puesto", "4.º puesto"][Math.max(0, Math.min(3, ctx.place - 1))] + ": " + base);
    if(ctx.duelsWon) lines.push(ctx.duelsWon + " duelo" + (ctx.duelsWon > 1 ? "s" : "") + " ganado" + (ctx.duelsWon > 1 ? "s" : "") + ": " + M.perDuel * Math.min(M.maxDuels, ctx.duelsWon));
    if(ctx.kills) lines.push(ctx.kills + " baja" + (ctx.kills > 1 ? "s" : "") + ": " + M.perKill * Math.min(M.maxKills, ctx.kills));
    if(!ctx.won) perf *= M.lossPerfShare;
  } else {
    const k = ctx.draw ? "draw" : (ctx.won ? "win" : "loss");
    base = M[k]; xp = M.xp[k]; use = M.use[k];
    perf = M.perKill * Math.min(M.maxKills, ctx.kills) + M.perTower * Math.min(M.maxTowers, ctx.towers) + M.perEpic * Math.min(M.maxEpics, ctx.epics);
    lines.push((ctx.won ? "Victoria" : ctx.draw ? "Empate" : "Derrota") + ": " + base);
    if(ctx.kills) lines.push(ctx.kills + " baja" + (ctx.kills > 1 ? "s" : "") + " de héroes: " + M.perKill * Math.min(M.maxKills, ctx.kills));
    if(ctx.towers) lines.push(ctx.towers + " torre" + (ctx.towers > 1 ? "s" : "") + " rival" + (ctx.towers > 1 ? "es" : "") + ": " + M.perTower * Math.min(M.maxTowers, ctx.towers));
    if(ctx.epics) lines.push(ctx.epics + " objetivo" + (ctx.epics > 1 ? "s" : "") + " épico" + (ctx.epics > 1 ? "s" : "") + ": " + M.perEpic * Math.min(M.maxEpics, ctx.epics));
    if(!ctx.won) perf *= M.lossPerfShare;
  }
  const perfMax = ctx.mode === "col" ? M.perDuel * M.maxDuels + M.perKill * M.maxKills : M.perKill * M.maxKills + M.perTower * M.maxTowers + M.perEpic * M.maxEpics;
  const perfXp = Math.round(M.perfXp * Math.min(1, perf / Math.max(1, perfMax * (ctx.won ? 1 : M.lossPerfShare))));
  return {gold:Math.round(base + perf), accountXp:xp + perfXp, masteryUse:use, lines};
}
// Liquida la partida terminada UNA sola vez. Devuelve el resumen que muestra la pantalla de resultado (o null si no corresponde).
function postgameSettle(L){
  L = L || LN;
  if(!L || L.role !== "solo" || !L.pg) return null;
  if(L.pg.result) return L.pg.result;
  const ctx = _pgCtx(L), res = {mode:L.pg.mode, progress:L.pg.progress, why:L.pg.why, text:L.pg.text, ctx, paid:false};
  if(!L.pg.progress){ res.reason = L.pg.text; return (L.pg.result = res); }
  const min = POSTGAME_CFG.minMs[L.pg.mode];
  if(ctx.ms < min){ res.reason = "Partida demasiado corta para cobrar (menos de " + Math.round(min / 1000) + " s)"; return (L.pg.result = res); }
  const raw = postgameRawReward(ctx);
  res.raw = raw;
  _pgWithRealSave(()=>{
    const sv = save, P = postgameRollDay(postgameState(sv)), D = POSTGAME_CFG.daily, T = POSTGAME_CFG.trophies;
    const gold = Math.max(0, Math.min(raw.gold, D.gold - P.goldToday));
    const xp = Math.max(0, Math.min(raw.accountXp, D.accountXp - P.xpToday));
    const use = Math.max(0, Math.min(raw.masteryUse, D.masteryUse - P.useToday));
    P.goldToday += gold; P.xpToday += xp; P.useToday += use;
    sv.gold = (sv.gold || 0) + gold;
    if(xp && typeof questsAddXp === "function") questsAddXp(xp, false);
    if(use){   // uso de maestría de las tres habilidades y la definitiva del campeón jugado (mismo ritmo de nivel que gainSkillUseXp)
      const ch = sv.champions[L.pg.classKey];
      if(ch) for(const m of [...ch.skillMastery, ch.ultMastery]){ if(m.useLvl - 1 >= USE_LVL_CAP) continue; m.useXp += use; let need = useXpThreshold(m.useLvl); while(m.useXp >= need && m.useLvl - 1 < USE_LVL_CAP){ m.useXp -= need; m.useLvl++; need = useXpThreshold(m.useLvl); } }
    }
    const M = P.modes[L.pg.mode], before = {trophies:M.trophies, streak:M.streak};
    M.played++;
    if(ctx.won){ M.wins++; M.streak++; M.best = Math.max(M.best, M.streak); M.trophies += T.win + Math.min(T.streakMax, T.streakStep * (M.streak - 1)); }
    else if(ctx.draw){ M.draws++; M.trophies += T.draw; }
    else { M.losses++; M.streak = 0; M.trophies = Math.max(0, M.trophies + T.loss); }
    const newAch = [];
    for(const a of POSTGAME_ACHIEVEMENTS){
      if(P.ach[a.id] || (a.mode !== "any" && a.mode !== L.pg.mode)) continue;
      let ok = false; try{ ok = !!a.test(P, L.pg.mode, ctx); }catch(e){}
      if(!ok) continue;
      P.ach[a.id] = Date.now(); newAch.push(a);
      if(typeof questsGrant === "function") questsGrant(a.reward, true);
    }
    P.last = {mode:L.pg.mode, won:ctx.won, at:Date.now()};
    Object.assign(res, {paid:true, gold, xp, use, capped:{gold:gold < raw.gold, xp:xp < raw.accountXp, use:use < raw.masteryUse},
      daily:postgameDaily(sv), streak:M.streak, bestStreak:M.best, trophies:M.trophies, trophiesDelta:M.trophies - before.trophies,
      wins:M.wins, played:M.played, ach:newAch.map(a=>({id:a.id, name:a.name, reward:a.reward}))});
  });
  return (L.pg.result = res);
}
const _pgFmt = n=>(typeof fmtGold === "function" ? fmtGold(n) : String(n));
// Bloque HTML de la pantalla de resultado (letra >= 14 px: ver css/lanes.css).
function postgameResultHtml(res){
  if(!res) return "";
  if(!res.progress) return '<div class="ln-res-pg ln-pg-training"><b>ENTRENAMIENTO</b><p>Sin recompensas ni progreso. ' + (res.reason || "") + '</p></div>';
  if(!res.paid) return '<div class="ln-res-pg ln-pg-training"><b>POSTGAME</b><p>' + (res.reason || "Sin recompensas") + '</p></div>';
  const d = res.daily, bar = (v, cap)=>'<i class="ln-pg-bar"><u style="width:' + Math.min(100, Math.round(v / cap * 100)) + '%"></u></i>';
  const lines = (res.raw.lines || []).map(t=>'<li>' + t + '</li>').join("");
  const ach = res.ach.length ? '<p class="ln-pg-ach">LOGRO' + (res.ach.length > 1 ? "S" : "") + ' DESBLOQUEADO' + (res.ach.length > 1 ? "S" : "") + ': ' + res.ach.map(a=>'<b>' + a.name + '</b>').join(", ") + '</p>' : "";
  const note = (res.capped.gold || res.capped.xp) ? '<p class="ln-pg-cap">Llegaste al tope diario: parte de la recompensa no se pagó (' + (res.capped.gold ? "oro " + _pgFmt(res.raw.gold) + " → " + _pgFmt(res.gold) : "") + (res.capped.gold && res.capped.xp ? " · " : "") + (res.capped.xp ? "XP " + res.raw.accountXp + " → " + res.xp : "") + '). Se renueva mañana.</p>' : "";
  return '<div class="ln-res-pg"><b>RECOMPENSAS DE POSTGAME</b>' +
    '<div class="ln-pg-got"><span>🪙 +' + _pgFmt(res.gold) + '</span><span>XP de cuenta +' + res.xp + '</span><span>Maestría +' + res.use + '</span></div>' +
    '<ul class="ln-pg-lines">' + lines + '</ul>' + note + ach +
    '<div class="ln-pg-meter"><span>Oro de hoy <b>' + _pgFmt(d.gold) + ' / ' + _pgFmt(d.goldCap) + '</b>' + (d.goldLeft ? ' · faltan ' + _pgFmt(d.goldLeft) : ' · tope alcanzado') + '</span>' + bar(d.gold, d.goldCap) +
    '<span>XP de hoy <b>' + d.xp + ' / ' + d.xpCap + '</b>' + (d.xpLeft ? ' · faltan ' + d.xpLeft : ' · tope alcanzado') + '</span>' + bar(d.xp, d.xpCap) + '</div>' +
    '<p class="ln-pg-rec">Racha <b>' + res.streak + '</b> (mejor ' + res.bestStreak + ') · Trofeos <b>' + res.trophies + '</b> (' + (res.trophiesDelta >= 0 ? "+" : "") + res.trophiesDelta + ') · ' + res.wins + ' victoria' + (res.wins === 1 ? "" : "s") + ' de ' + res.played + '</p>' +
    '<small>Tope diario compartido por los dos modos. El oro y el reloj son de tu dispositivo.</small></div>';
}

/* ---------------- hub: estado de las tarjetas ---------------- */
function postgameHubInfo(){
  const unlocked = postgameUnlocked(save), P = postgameState();
  return {unlocked, gate:POSTGAME_GATE, lockText:unlocked ? "" : postgameLockText(),
    cw:P.modes.cw, col:P.modes.col, daily:postgameDaily()};
}

/* ---------------- lobby de Cristales / Coliseo (index.html #crystalwars-screen) ---------------- */
function postgameLobbyRefresh(){
  const p = document.getElementById("pg-lobby"), row = document.getElementById("pg-train-row"), cb = document.getElementById("pg-training");
  if(!p) return;
  const un = postgameUnlocked(), CAP = LANES.PROGRESS_CAP;
  if(row) row.classList.toggle("hidden", !un);
  if(cb && un && cb.dataset.forced === "1"){ cb.checked = false; delete cb.dataset.forced; }   // venía forzado por el bloqueo: ya no
  if(!un){ if(cb){ cb.checked = true; cb.dataset.forced = "1"; } p.innerHTML = "🔒 <b>ENTRENAMIENTO</b> · " + postgameLockText() + ". Contra bots: campeón normalizado, sin recompensas. En línea siempre es normalizado."; return; }
  const d = postgameDaily();
  p.innerHTML = "<b>POSTGAME</b> · contra bots entrás con tu nivel, talentos, maestría y equipo, con tope (hasta +" + Math.round((CAP.statMax.hp - 1) * 100) + " % de vida y daño). Oro de hoy " + _pgFmt(d.gold) + "/" + _pgFmt(d.goldCap) + ".";
}
