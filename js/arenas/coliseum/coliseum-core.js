"use strict";
/* ============================================================
   js/arenas/coliseum/coliseum-core.js
   COLISEO en el MOTOR REAL — lógica del torneo. Estado en `LN` (el de Guerra de Cristales, modo "coliseo") + `LN.col`.
   Cuatro equipos de dos. Por ronda: dos duelos 2v2 simultáneos, uno en cada foso (el tuyo siempre es el A).
   Fases: "prep" (cuenta regresiva, héroes quietos e invulnerables) → "fight" (hasta 80 s; desde los 28 s el anillo se cierra y
   fuera de él se pierde vida) → "inter" (resultados). Un duelo termina cuando un equipo no tiene a nadie en pie.
   Sin reaparición dentro de la ronda: si caés, mirás (tu foso o el otro) hasta que termine. Gana quien llega a WIN_POINTS.
   Identidad propia: CARTAS DE ARENA entre rondas (cada equipo elige 1 de 3) y, cada 3.ª ronda, TODOS CONTRA TODOS (las cuatro duplas en el
   foso grande del medio; puesto por equipo: 1.º +2 puntos, 2.º +1). Datos y topes en coliseum-data.js.
   ============================================================ */
function colNewTeams(){ return [0, 1, 2, 3].map(i=>({team:i, points:0, S:[], shards:0, kills:0, pk:0, wins:0, duels:0, ffa:0, ffaPts:0, ffaWins:0,
  cards:{}, pick:null, activePick:null, offer:null, offerAt:0, botAt:0, mods:colModsOf({}, null)})); }
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
  heroes.forEach((h, k)=>{ h.team = h.lane = Math.min(3, (k / 2) | 0); h._lnProxy = null; h._colDead = false; h._colHp0 = h.maxHp; h._colSpd0 = h.baseSpeed; h._colM = null; });   // (vida y velocidad de base: las cartas se calculan siempre sobre esto)
  L.col = {round:0, phase:"inter", kind:"duel", duelN:0, t0:0, cd:-1, pairs:COL_PAIRINGS[0], res:[null, null, null], ringR:COL.PIT_R, spec:null, specPit:-1, last:"", ffaOut:[], order:null, ringWarned:false};
  document.getElementById("hud-arena") && (document.getElementById("hud-arena").textContent = "Coliseo");
  colStartRound();
  if(typeof colHudShow==="function") colHudShow();
}
function colIsFfaRound(n){ return n > 0 && n % COL.FFA_EVERY === 0; }
function colActivePits(c){ return c.kind === "ffa" ? [2] : [0, 1]; }
function colRoundMs(c){ return c.kind === "ffa" ? COL.FFA_ROUND_MS : COL.ROUND_MS; }
function colStartRound(){
  const L = LN, c = L.col;
  c.round++; L.wave = c.round; c.kind = colIsFfaRound(c.round) ? "ffa" : "duel";
  c.pairs = c.kind === "ffa" ? [[0, 1, 2, 3], []] : COL_PAIRINGS[(c.duelN++) % COL_PAIRINGS.length];
  c.res = [null, null, null]; c.phase = "prep"; c.t0 = L.t; c.cd = -1; c.ringR = colPitR(c.kind === "ffa" ? 2 : 0); c.spec = null; c.ringWarned = false; c.ffaOut = []; c.order = null; c.last = "";
  projectiles = []; fireWalls = []; traps = []; if(typeof axiomZones!=="undefined") axiomZones = []; if(typeof sylvaRainZones!=="undefined") sylvaRainZones = [];
  for(const T of L.team){ T.mods = colModsOf(T.cards, T.pick); T.activePick = T.pick; T.pick = null; T.offer = null; }   // la carta de ronda elegida vale solo esta ronda
  for(const h of heroes){
    const ffa = c.kind === "ffa", pit = ffa ? 2 : (c.pairs[0].includes(h.team) ? 0 : 1), pair = ffa ? null : c.pairs[pit], ctr = colPitCenter(pit);
    const slot = heroes.filter(o=>o.team === h.team).indexOf(h), M = L.team[h.team].mods;
    if(!h.alive) reviveHero(h, null);
    h._colM = M; h.maxHp = Math.round((h._colHp0 || h.maxHp) * M.hp); if(h._colSpd0) h.baseSpeed = h._colSpd0 * M.spd;
    h.hp = h.maxHp; h.energy = h.maxEnergy; h.cds = [0, 0, 0]; h.ultCd = 0; if(typeof h.ultMax === "number") h.ultCharge = h.ultMax;
    h.stunTimer = 0; h.slowTimer = 0; h.slowAmt = 0; h.burnTimer = 0; h.bleedTimer = 0; h.poisonTimer = 0; h.dead_t = 0; h._colDead = false; h._colLast = false; h._lnKiller = null; h._pvpW = null;
    h.shield = M.shield > 0 ? Math.round(h.maxHp * M.shield) : 0; h.shieldTimer = M.shield > 0 ? COL.PREP_MS + 22000 : 0;   // «Escudo de brasas»: dura los primeros ~22 s de la pelea
    h.pit = pit;
    if(ffa){   // las cuatro duplas en círculo, mirando al centro (la tuya, abajo)
      const ang = Math.PI / 2 + h.team * Math.PI / 2, ca = Math.cos(ang), sa = Math.sin(ang), side = slot ? 1 : -1;
      h.x = ctr.x + ca * COL.FFA_START_R - sa * 52 * side; h.y = ctr.y + sa * COL.FFA_START_R * 0.78 + ca * 52 * side; h.fx = -ca; h.fy = -sa;
    } else {
      const sd = h.team === pair[0] ? -1 : 1;
      h.x = ctr.x + sd * COL.START_DIST; h.y = ctr.y + (slot ? 62 : -62); h.fx = -sd; h.fy = 0;
    }
    h.invulnTimer = COL.PREP_MS;
    if(h._net) h._net.posAuth++;
  }
  if(c.kind === "ffa") showBanner("RONDA " + c.round + " · ¡TODOS CONTRA TODOS!");
  else { const a = c.pairs[0]; showBanner("RONDA " + c.round + " · " + (a[0] === 0 ? "TU EQUIPO" : colTeamName(a[0])) + " vs " + colTeamName(a[1])); }
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
  else if(c.phase === "inter"){
    colCardTick();
    if(L.t - c.t0 >= COL.INTER_MS && !colOffersPending()){ if(colOver()) colFinish(); else colStartRound(); }
  }
  colCamera();
}
function colAliveIn(team){ let n = 0; for(const h of heroes) if(h.team === team && h.alive) n++; return n; }
function colHpPct(team){ let s = 0, m = 0; for(const h of heroes) if(h.team === team){ m += h.maxHp; if(h.alive) s += h.hp; } return m ? s / m : 0; }
function colFight(dt){
  const L = LN, c = L.col, el = L.t - c.t0, ffa = c.kind === "ffa";
  const r0 = colPitR(ffa ? 2 : 0), rMin = ffa ? COL.FFA_RING_MIN : COL.RING_MIN, rStart = ffa ? COL.FFA_RING_START_MS : COL.RING_START_MS, rShrink = ffa ? COL.FFA_RING_SHRINK_MS : COL.RING_SHRINK_MS;
  const k = Math.max(0, Math.min(1, (el - rStart) / rShrink));
  c.ringR = r0 + (rMin - r0) * k;
  if(k > 0 && !c.ringWarned){ c.ringWarned = true; showBanner("¡EL ANILLO SE CIERRA!"); }
  const ramp = 1 + Math.max(0, el - rStart) / 20000;
  for(const h of heroes){
    if(!h.alive) continue;
    if(c.res[h.pit]) continue;                                                // su duelo ya terminó: espera
    const M = h._colM, ctr = colPitCenter(h.pit);
    if(Math.hypot(h.x - ctr.x, h.y - ctr.y) > c.ringR){ damageHero(h, h.maxHp * COL.RING_DMG * ramp * (M ? M.ring : 1) * dt / 1000, {isPvp:true, from:null}); if(!h.alive && !h._colDead) h._lnKiller = null; }
    if(!h.alive || !M) continue;
    // cartas de arena: recarga más corta, regeneración y «último aliento» (una vez por ronda)
    if(M.cdr > 0){ const x = dt * (1 / (1 - M.cdr) - 1); for(let i = 0; i < 3; i++) h.cds[i] = Math.max(0, h.cds[i] - x); h.ultCd = Math.max(0, h.ultCd - x); }
    if(M.regen > 0) h.hp = Math.min(h.maxHp, h.hp + h.maxHp * M.regen * dt / 1000);
    if(M.last > 0 && !h._colLast && h.hp < h.maxHp * 0.30){ h._colLast = true; h.hp = Math.min(h.maxHp, h.hp + h.maxHp * M.last); if(typeof floatText === "function") floatText(h.x, h.y - 46, "¡ÚLTIMO ALIENTO!", "heal"); }
  }
  for(const h of heroes){
    if(h.alive || h._colDead) continue;
    h._colDead = true; const kt = h._lnKiller; h._lnKiller = null;
    if(kt != null && kt !== h.team){ L.team[kt].pk++; colFeed(colTeamName(kt) + " derribó a " + heroLabel(h), kt); }
    else colFeed(heroLabel(h) + " cayó", h.team);
  }
  if(ffa) colFfaStep(el);
  else for(let pit = 0; pit < 2; pit++){
    if(c.res[pit]) continue;
    const [a, b] = c.pairs[pit], na = colAliveIn(a), nb = colAliveIn(b);
    if(na === 0 || nb === 0) colResolve(pit, na === 0 && nb === 0 ? -1 : (na === 0 ? b : a));
    else if(el >= COL.ROUND_MS){ const pa = colHpPct(a), pb = colHpPct(b); colResolve(pit, Math.abs(pa - pb) < 0.001 ? -1 : (pa > pb ? a : b)); }
  }
  if(ffa ? c.res[2] : (c.res[0] && c.res[1])){ c.phase = "inter"; c.t0 = L.t; colOpenOffers(); }
}
// TODOS CONTRA TODOS: un equipo queda fuera cuando cae su último integrante; la ronda termina con un solo equipo en pie (o al agotarse el tiempo).
function colFfaStep(el){
  const L = LN, c = L.col; if(c.res[2]) return;
  const out = [0, 1, 2, 3].filter(t=>!c.ffaOut.includes(t) && colAliveIn(t) === 0).sort((x, y)=>L.team[x].pk - L.team[y].pk || y - x);   // los que caen en el mismo cuadro: se desempata por bajas
  for(const t of out){ c.ffaOut.push(t); colFeed((t === player.team ? "TU EQUIPO" : colTeamName(t)) + " quedó fuera", t); }
  const alive = [0, 1, 2, 3].filter(t=>!c.ffaOut.includes(t));
  if(alive.length <= 1 || el >= COL.FFA_ROUND_MS) colResolveFfa(alive);
}
function colResolveFfa(alive){
  const L = LN, c = L.col;
  const live = alive.slice().sort((x, y)=>colHpPct(y) - colHpPct(x) || L.team[y].pk - L.team[x].pk || x - y);   // si se acabó el tiempo: más vida primero
  const order = live.concat(c.ffaOut.slice().reverse());                                                       // el último en caer, mejor puesto
  c.order = order; c.res[2] = {order, winner:order[0]};
  order.forEach((t, i)=>{ const T = L.team[t], pts = COL.FFA_POINTS[i] || 0; T.ffa++; T.points += pts; T.ffaPts += pts; if(i === 0) T.ffaWins++; });
  const me = order.indexOf(player.team), pts = COL.FFA_POINTS[me] || 0;
  colFeed(colTeamName(order[0]) + " ganó el todos contra todos", order[0]);
  c.last = me === 0 ? "¡GANASTE! +" + pts + " PUNTOS" : "PUESTO " + (me + 1) + "." + (pts ? " +" + pts + " PUNTO" : " · SIN PUNTOS");
  showBanner(c.last);
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

/* ---------------- cartas de arena ---------------- */
// Al terminar cada ronda (si el torneo sigue) cada equipo recibe 3 cartas: 2 de «ronda» y 1 de «torneo» (si todavía puede tomarla).
function colTeamHuman(team){ return heroes.some(h=>h.team === team && lanesIsHuman(h)); }
function colOffersPending(){ return !!LN && LN.team.some(T=>!!T.offer); }
function colOpenOffers(){
  const L = LN; if(!L || colOver()) return;
  for(const T of L.team){
    const rounds = COL_CARD_IDS.filter(id=>COL_CARDS[id].scope === "ronda"), tourn = COL_CARD_IDS.filter(id=>COL_CARDS[id].scope === "torneo" && (T.cards[id] || 0) < COL_CARDS[id].max && colTournCount(T.cards) < COL.TOURN_CAP);
    const take = (arr)=>arr.splice((lanesRand() * arr.length) | 0, 1)[0];
    const offer = [take(rounds), take(rounds)];
    offer.push(tourn.length ? take(tourn) : take(rounds));
    T.offer = offer; T.offerAt = L.t; T.botAt = L.t + COL.CARD_BOT_MIN_MS + lanesRand() * COL.CARD_BOT_SPREAD_MS;
  }
  if(colTeamHuman(player.team)) showBanner("¡CARTA DE ARENA! Elegí una");
}
// Elige la carta `idx` de la oferta del equipo. Devuelve true si se aplicó.
function colPickCard(team, idx){
  const L = LN, T = L && L.team[team];
  if(!T || !T.offer || L.ended) return false;
  const id = T.offer[idx | 0]; if(!id || !COL_CARDS[id]) return false;
  const card = COL_CARDS[id];
  if(card.scope === "torneo"){
    if((T.cards[id] || 0) >= card.max || colTournCount(T.cards) >= COL.TOURN_CAP) return false;   // (la oferta ya lo evita; esto es el seguro)
    T.cards[id] = (T.cards[id] || 0) + 1;
  } else T.pick = id;
  T.offer = null;
  colFeed((team === player.team ? "TU EQUIPO" : colTeamName(team)) + " tomó: " + card.name, team);
  if(team === player.team) showBanner(card.name + " ✓");
  return true;
}
function colCardTick(){
  const L = LN; if(!L) return;
  for(const T of L.team){
    if(!T.offer) continue;
    const human = colTeamHuman(T.team);
    if(human ? L.t - T.offerAt >= COL.CARD_MS : L.t >= T.botAt) colPickCard(T.team, (lanesRand() * T.offer.length) | 0);   // los bots eligen solos; vos, si no elegís a tiempo, se elige al azar
  }
}
// Daño de salida de un héroe (o de su invocación) con las cartas de su equipo. Gancho de lanesDmgMult.
function colDmgMult(src){
  let h = src, n = 0;
  while(h && !h.classKey && n++ < 4) h = h.owner || h.src || h.caster || h.from || h.summoner;
  return h && h._colM ? h._colM.dmg : 1;
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
  const i = Math.max(0, list.indexOf(c.spec)); c.spec = list[(i + (dir || 1) + list.length) % list.length]; if(typeof CAM_SUBJECT !== "undefined") CAM_SUBJECT = c.spec;
}
function colSpecPit(){   // salta al otro foso
  const L = LN, c = L && L.col; if(!c) return;
  const cur = c.spec ? c.spec.pit : player.pit, list = colSpecList().filter(h=>h.pit !== cur); if(list.length){ c.spec = list[0]; if(typeof CAM_SUBJECT !== "undefined") CAM_SUBJECT = c.spec; }
}

/* ---------------- geometría ---------------- */
function colClamp(ent){
  const pit = ent.pit != null ? ent.pit : colPitOf(ent.x), ctr = colPitCenter(pit), R = colPitR(pit) - 16;
  const dx = ent.x - ctr.x, dy = ent.y - ctr.y, d = Math.hypot(dx, dy);
  if(d > R){ ent.x = ctr.x + dx / d * R; ent.y = ctr.y + dy / d * R; }
}
function colInside(x, y, m){ const p = colPitOf(x), c = colPitCenter(p); return Math.hypot(x - c.x, y - c.y) < colPitR(p) - (m || 0); }
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
