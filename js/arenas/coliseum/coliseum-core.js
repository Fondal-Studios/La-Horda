"use strict";
/* ============================================================
   js/arenas/coliseum/coliseum-core.js
   COLISEO en el MOTOR REAL — lógica del torneo. Estado en `LN` (el de Guerra de Cristales, modo "coliseo") + `LN.col`.
   Cuatro equipos de dos. Por ronda: dos duelos 2v2 simultáneos, uno en cada foso (el tuyo siempre es el A).
   Fases: "prep" (cuenta regresiva, héroes quietos e invulnerables) → "fight" (hasta 80 s; desde los 28 s el anillo se cierra y
   fuera de él se pierde vida) → "inter" (resultados). Un duelo termina cuando un equipo no tiene a nadie en pie.
   Sin reaparición dentro de la ronda: si caés, mirás (tu foso o el otro) hasta que termine. Gana quien llega a WIN_POINTS.
   ============================================================ */
function colNewTeams(){ return [0, 1, 2, 3].map(i=>({team:i, points:0, S:[], shards:0, kills:0, pk:0, wins:0, duels:0})); }
function colTeamName(t){ return lanesTeamName(t); }

/* ---------------- entrada ---------------- */
// opts: {champ, mate, rivals:[6], seed}. Torneo local contra bots: vos + tu compañero y tres equipos más.
function colStart(opts){
  if(LN || (typeof ALPHA_TRAINING!=="undefined" && ALPHA_TRAINING.active)) return false;
  opts = opts || {};
  const roster = Object.keys(CLASSES).filter(k=>championBotEligible(k));
  const mine = opts.champ && CLASSES[opts.champ] ? opts.champ : (CLASSES[selectedClass] ? selectedClass : roster[0]);
  const taken = [mine];
  const pick = (want)=>{ if(want && CLASSES[want] && !taken.includes(want)){ taken.push(want); return want; }
    const pool = roster.filter(k=>!taken.includes(k)); const k = pool[(Math.random()*pool.length)|0]; taken.push(k); return k; };
  const mate = pick(opts.mate), foes = [0, 1, 2, 3, 4, 5].map(i=>pick(opts.rivals && opts.rivals[i]));
  lanesBegin("solo", opts.seed, "coliseo");
  LN.setup = {mine, mate, rivals:foes};
  selectedClass = mine; currentArena = "coliseo"; lobbyAllies = [mate, ...foes];
  try{ startRun(LANES.RUNLEVEL); }
  catch(err){ console.error("El Coliseo no pudo arrancar:", err); lanesRestore(); throw err; }
  return true;
}
function colCleanup(){ if(typeof CAM_SUBJECT !== "undefined") CAM_SUBJECT = null; }

/* ---------------- arranque (gancho runStart) ---------------- */
function colRunStart(){
  const L = LN; if(!L) return;
  L.t = 0; L.wave = 0; L.ended = false; L.winner = -1; L.shots = []; L.feed = []; L.spawnCtx = null;
  L.team = colNewTeams(); runLevel = LANES.RUNLEVEL;
  levelDuration = 1e12; levelTimer = 0; midBossSpawned = true;
  heroes.forEach((h, k)=>{ h.team = h.lane = Math.min(3, (k / 2) | 0); h._lnProxy = null; h._colDead = false; });
  L.col = {round:0, phase:"inter", t0:0, cd:-1, pairs:COL_PAIRINGS[0], res:[null, null], ringR:COL.PIT_R, spec:null, specPit:-1, last:""};
  document.getElementById("hud-arena") && (document.getElementById("hud-arena").textContent = "Coliseo");
  colStartRound();
  if(typeof colHudShow==="function") colHudShow();
}
function colStartRound(){
  const L = LN, c = L.col;
  c.round++; L.wave = c.round; c.pairs = COL_PAIRINGS[(c.round - 1) % COL_PAIRINGS.length]; c.res = [null, null]; c.phase = "prep"; c.t0 = L.t; c.cd = -1; c.ringR = COL.PIT_R; c.spec = null;
  projectiles = []; fireWalls = []; traps = []; if(typeof axiomZones!=="undefined") axiomZones = []; if(typeof sylvaRainZones!=="undefined") sylvaRainZones = [];
  for(const h of heroes){
    const pit = c.pairs[0].includes(h.team) ? 0 : 1, pair = c.pairs[pit], side = h.team === pair[0] ? -1 : 1;
    const slot = heroes.filter(o=>o.team === h.team).indexOf(h), ctr = colPitCenter(pit);
    if(!h.alive) reviveHero(h, null);
    h.hp = h.maxHp; h.energy = h.maxEnergy; h.cds = [0, 0, 0]; h.ultCd = 0; if(typeof h.ultMax === "number") h.ultCharge = h.ultMax;
    h.stunTimer = 0; h.slowTimer = 0; h.slowAmt = 0; h.shield = 0; h.shieldTimer = 0; h.burnTimer = 0; h.bleedTimer = 0; h.poisonTimer = 0; h.dead_t = 0; h._colDead = false; h._lnKiller = null; h._pvpW = null;
    h.pit = pit; h.x = ctr.x + side * COL.START_DIST; h.y = ctr.y + (slot ? 62 : -62); h.fx = -side; h.fy = 0;
    h.invulnTimer = COL.PREP_MS;
    if(h._net) h._net.posAuth++;
  }
  const a = c.pairs[0];
  showBanner("RONDA " + c.round + " · " + (a[0] === 0 ? "TU EQUIPO" : colTeamName(a[0])) + " vs " + colTeamName(a[1]));
}

/* ---------------- ciclo (gancho update) ---------------- */
function colUpdate(dt){
  const L = LN; if(!L || L.ended || !L.col) return;
  L.t += dt;
  const c = L.col;
  lanesSync(dt);
  if(c.phase === "prep"){
    for(const h of heroes){ h.stunTimer = Math.max(h.stunTimer || 0, 150); h.invulnTimer = Math.max(h.invulnTimer || 0, 250); }
    const left = Math.ceil((COL.PREP_MS - (L.t - c.t0)) / 1000);
    if(left !== c.cd){ c.cd = left; if(left > 0 && left <= 3) showBanner(String(left)); }
    if(L.t - c.t0 >= COL.PREP_MS){ c.phase = "fight"; c.t0 = L.t; showBanner("¡A PELEAR!"); }
  } else if(c.phase === "fight") colFight(dt);
  else if(c.phase === "inter" && L.t - c.t0 >= COL.INTER_MS){ if(colOver()) colFinish(); else colStartRound(); }
  colCamera();
}
function colAliveIn(team){ let n = 0; for(const h of heroes) if(h.team === team && h.alive) n++; return n; }
function colHpPct(team){ let s = 0, m = 0; for(const h of heroes) if(h.team === team){ m += h.maxHp; if(h.alive) s += h.hp; } return m ? s / m : 0; }
function colFight(dt){
  const L = LN, c = L.col, el = L.t - c.t0;
  const k = Math.max(0, Math.min(1, (el - COL.RING_START_MS) / COL.RING_SHRINK_MS));
  c.ringR = COL.PIT_R + (COL.RING_MIN - COL.PIT_R) * k;
  if(k > 0 && !c.ringWarned){ c.ringWarned = true; showBanner("¡EL ANILLO SE CIERRA!"); }
  const ramp = 1 + Math.max(0, el - COL.RING_START_MS) / 20000;
  for(const h of heroes){
    if(!h.alive) continue;
    if(c.res[h.pit]) continue;                                                // su duelo ya terminó: espera
    const ctr = colPitCenter(h.pit);
    if(Math.hypot(h.x - ctr.x, h.y - ctr.y) > c.ringR){ damageHero(h, h.maxHp * COL.RING_DMG * ramp * dt / 1000, {isPvp:true, from:null}); if(!h.alive && !h._colDead) h._lnKiller = null; }
  }
  for(const h of heroes){
    if(h.alive || h._colDead) continue;
    h._colDead = true; const kt = h._lnKiller; h._lnKiller = null;
    if(kt != null && kt !== h.team){ L.team[kt].pk++; colFeed(colTeamName(kt) + " derribó a " + heroLabel(h), kt); }
    else colFeed(heroLabel(h) + " cayó", h.team);
  }
  for(let pit = 0; pit < 2; pit++){
    if(c.res[pit]) continue;
    const [a, b] = c.pairs[pit], na = colAliveIn(a), nb = colAliveIn(b);
    if(na === 0 || nb === 0) colResolve(pit, na === 0 && nb === 0 ? -1 : (na === 0 ? b : a));
    else if(el >= COL.ROUND_MS){ const pa = colHpPct(a), pb = colHpPct(b); colResolve(pit, Math.abs(pa - pb) < 0.001 ? -1 : (pa > pb ? a : b)); }
  }
  if(c.res[0] && c.res[1]){ c.phase = "inter"; c.t0 = L.t; }
}
function colResolve(pit, winner){
  const L = LN, c = L.col, [a, b] = c.pairs[pit];
  c.res[pit] = {winner};
  L.team[a].duels++; L.team[b].duels++;
  if(winner >= 0){ L.team[winner].points++; L.team[winner].wins++; }
  const txt = winner < 0 ? colTeamName(a) + " y " + colTeamName(b) + ": empate" : colTeamName(winner) + " ganó el duelo (" + L.team[winner].points + "/" + COL.WIN_POINTS + ")";
  colFeed(txt, winner);
  if(pit === 0){ c.last = winner < 0 ? "EMPATE" : (winner === player.team ? "¡GANASTE EL DUELO!" : "PERDISTE EL DUELO"); showBanner(c.last); }
}
function colFeed(text, team){ const L = LN; L.feed.push({t:L.t, text, team}); if(L.feed.length > 6) L.feed.shift(); }
function colOver(){ const L = LN; return L.team.some(t=>t.points >= COL.WIN_POINTS) || L.col.round >= COL.MAX_ROUNDS; }
function colStanding(){ return LN.team.slice().sort((x, y)=>y.points - x.points || y.pk - x.pk || x.team - y.team); }
function colFinish(){
  const L = LN; if(!L || L.ended) return;
  const s = colStanding(), top = s[0], tie = s[1] && s[1].points === top.points && s[1].pk === top.pk;
  L.ended = true; L.winner = tie ? -1 : top.team; L.why = "torneo"; runEnding = true; colCleanup();
  if(typeof netIsHost==="function" && netIsHost()) netHostAnnounceEnd(L.winner === player.team);
  showBanner(L.winner === -1 ? "¡EMPATE!" : (L.winner === player.team ? "¡CAMPEONES!" : colTeamName(L.winner) + " GANA EL COLISEO"));
  setTimeout(()=>{ if(LN === L && typeof colShowResult === "function") colShowResult(); }, 1800);
}

/* ---------------- espectador ---------------- */
// Si caíste, la cámara sigue a otro luchador (primero tu compañero, después tu foso, después el otro). Cualquier otro momento: a vos.
function colSpecList(){ return heroes.filter(h=>h.alive); }
function colCamera(){
  const L = LN, c = L.col; if(!c || typeof CAM_SUBJECT === "undefined") return;
  if(L.ended || player.alive || c.phase !== "fight"){ CAM_SUBJECT = null; c.spec = null; return; }
  const list = colSpecList(); if(!list.length){ CAM_SUBJECT = null; return; }
  if(!c.spec || !c.spec.alive){
    c.spec = list.find(h=>h.team === player.team) || list.find(h=>h.pit === player.pit) || list[0];
  }
  CAM_SUBJECT = c.spec;
}
function colSpecNext(dir){
  const L = LN, c = L && L.col; if(!c) return;
  const list = colSpecList(); if(!list.length) return;
  const i = Math.max(0, list.indexOf(c.spec)); c.spec = list[(i + (dir || 1) + list.length) % list.length];
}
function colSpecPit(){   // salta al otro foso
  const L = LN, c = L && L.col; if(!c) return;
  const cur = c.spec ? c.spec.pit : player.pit, list = colSpecList().filter(h=>h.pit !== cur); if(list.length) c.spec = list[0];
}

/* ---------------- geometría ---------------- */
function colClamp(ent){
  const pit = ent.pit != null ? ent.pit : colPitOf(ent.x), ctr = colPitCenter(pit), R = COL.PIT_R - 16;
  const dx = ent.x - ctr.x, dy = ent.y - ctr.y, d = Math.hypot(dx, dy);
  if(d > R){ ent.x = ctr.x + dx / d * R; ent.y = ctr.y + dy / d * R; }
}
function colInside(x, y, m){ const c = colPitCenter(colPitOf(x)); return Math.hypot(x - c.x, y - c.y) < COL.PIT_R - (m || 0); }
// Gancho de daño: en la preparación y después de terminar tu duelo nadie puede ser golpeado.
function colBlocksDamage(e){
  const L = LN, c = L.col; if(!c || !e.lanesProxy || e.kind !== "hero") return false;
  const h = e.lnRef; return c.phase !== "fight" || !!c.res[h.pit];
}

/* ---------------- bots ---------------- */
function colLeaderFor(h){
  const L = LN, ctr = colPitCenter(h.pit != null ? h.pit : colPitOf(h.x));
  let best = null, bd = 1e9;
  for(const o of heroes){ if(!o.alive || o.team === h.team || o.pit !== h.pit) continue; const d = Math.hypot(o.x - h.x, o.y - h.y); if(d < bd){ bd = d; best = o; } }
  if(best) return best;
  const c = L.rallyObj || (L.rallyObj = []), r = c[h.pit] || (c[h.pit] = {isRally:true, alive:true, hp:1, maxHp:1, radius:20, x:0, y:0, stunTimer:0, slowTimer:0});
  r.x = ctr.x; r.y = ctr.y; return r;
}
function colBotTarget(h, range){
  let best = null, bs = -1e9;
  for(const e of enemies){
    if(!e.alive || !e.lanesProxy || e.kind !== "hero" || e.team === h.team || e.lnRef.pit !== h.pit) continue;
    const d = distance(h, e); if(d > range) continue;
    const s = 400 - d * 0.4 + (1 - e.lnRef.hp / e.lnRef.maxHp) * 320;
    if(s > bs){ bs = s; best = e; }
  }
  return best;
}

ARENA_DEFS.coliseo = {
  key:"coliseo",
  subBossLevels:[],
  navBounds:{x0:0, y0:0, x1:COL.W, y1:COL.H},
  runStart:colRunStart,
  update:colUpdate,
  clamp:colClamp,
  inside:colInside,
  enemyTarget:()=>null,
  botTarget:colBotTarget,
  heroReachable:()=>false,
  ownSpawns:()=>true,
  holdLevel:()=>true,
  afterEnemies:()=>{ for(const h of heroes) colClamp(h); }
};
