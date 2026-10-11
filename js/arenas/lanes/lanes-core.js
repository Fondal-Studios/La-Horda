"use strict";
/* ============================================================
   js/arenas/lanes/lanes-core.js
   GUERRA DE CRISTALES en el MOTOR REAL — lógica de la partida.
   Dos carriles en un mismo mundo (lanes-data.js). Los héroes y sus habilidades son los de la campaña;
   acá viven: el cristal de cada carril, las oleadas espejo, la economía de fragmentos con sus compras
   y envíos, la reaparición, el Eclipse y el final. Todo corre en el anfitrión (o en la partida local).
   El estado de la partida (LN) NO toca el guardado real: se juega con un guardado temporal normalizado
   (todos los guardianes al mismo nivel, sin equipo) que se descarta al salir.
   ============================================================ */
let LN = null;
function lanesOn(){ return !!LN; }
function lanesRand(){ const s = LN.rng = (Math.imul(LN.rng, 1664525) + 1013904223) >>> 0; return s / 4294967296; }

/* ---------------- entrada y salida ---------------- */
// Cambia al guardado TEMPORAL normalizado y crea el estado de la partida. `role`: "solo" | "host" | "guest".
function lanesBegin(role, seed){
  if(LN){ LN.role = role === "lobby" ? LN.role : role; LN.lobby = role === "lobby"; return LN; } // ya estaba en la Sala (guardado temporal puesto)
  if(typeof persistNow==="function") persistNow();   // el progreso real se guarda ANTES de usar el temporal
  const snap = {save, selectedClass, currentArena, lobbyAllies, endlessActive, endlessPending, divinaMode};
  LN = {snap, role:role||"solo", lobby:role === "lobby", rng:((seed||((Math.random()*4294967295)>>>0))>>>0)||7, t:0, ended:true, winner:-1, lane:[], pending:[], wave:0, nextWave:0};
  save = defaultSave();
  for(const id in save.champions){ const c = save.champions[id]; c.level = LANES.LEVEL; c.xp = 0; c.unlocked = true; }
  save.tut = {training:1, basics:1, b_move:1, b_attack:1, b_skill:1, goalMission:1}; // sin tutoriales dentro de la partida
  divinaMode = false; endlessActive = false; endlessPending = false;
  LN.lane = [lanesNewLane(0), lanesNewLane(1)];
  return LN;
}
// Devuelve TODO al estado anterior (guardado real incluido), sin cambiar de pantalla.
function lanesRestore(){
  if(!LN) return;
  const snap = LN.snap; LN = null;
  try{ clearRunTimers(); resetRunTransients(); }catch(e){}
  save = snap.save; selectedClass = snap.selectedClass; currentArena = snap.currentArena; lobbyAllies = snap.lobbyAllies;
  endlessActive = snap.endlessActive; endlessPending = snap.endlessPending; divinaMode = snap.divinaMode;
  enemies = []; allies = []; heroes = []; player = null; bossActive = false; runEnding = false;
  if(typeof invalidatePassiveCache==="function") invalidatePassiveCache();
  if(typeof lanesHudHide==="function") lanesHudHide();
}
// opts: {champ, mate, rivals:[a,b], seed}. Devuelve true si arrancó. Partida local contra bots.
function lanesStart(opts){
  if(LN || (typeof ALPHA_TRAINING!=="undefined" && ALPHA_TRAINING.active)) return false;
  opts = opts || {};
  const roster = Object.keys(CLASSES).filter(k=>championBotEligible(k));
  const mine = opts.champ && CLASSES[opts.champ] ? opts.champ : (CLASSES[selectedClass] ? selectedClass : roster[0]);
  const taken = [mine];
  const pick = (want)=>{ if(want && CLASSES[want] && !taken.includes(want)){ taken.push(want); return want; }
    const pool = roster.filter(k=>!taken.includes(k)); const k = pool[(Math.random()*pool.length)|0]; taken.push(k); return k; };
  const mate = pick(opts.mate), r1 = pick(opts.rivals && opts.rivals[0]), r2 = pick(opts.rivals && opts.rivals[1]);
  lanesBegin("solo", opts.seed);
  LN.setup = {mine, mate, rivals:[r1, r2]};
  selectedClass = mine; currentArena = "convergencia"; lobbyAllies = [mate, r1, r2];
  try{ startRun(LANES.RUNLEVEL); }
  catch(err){ console.error("Guerra de Cristales no pudo arrancar:", err); lanesRestore(); throw err; }
  return true;
}
// Vuelve al estado anterior. `toState`: pantalla a la que volver.
function lanesStop(toState){
  if(!LN) return;
  lanesRestore();
  if(toState){ setState(toState); if(toState==="mainmenu" && typeof renderMainMenu==="function") renderMainMenu(); }
}

/* ---------------- arranque de la partida (gancho runStart) ---------------- */
function lanesNewLane(i){
  const p = laneCrystalPos(i);
  return {i, shards:LANES.START_SHARDS, upgrade:0, repairAt:0, wardAt:0, sendAt:0, kills:0, assist:0, sent:0, leaked:0,
    crystal:{isCrystal:true, lane:i, x:p.x, y:p.y, radius:LANES.CRYSTAL_R, hp:LANES.CRYSTAL_HP, maxHp:LANES.CRYSTAL_HP, alive:true, ward:0, hitFlash:0, stunTimer:0, slowTimer:0, burnTimer:0, bleedTimer:0, shield:0}};
}
function lanesRunStart(){
  const L = LN; if(!L) return;
  L.t = 0; L.wave = 0; L.nextWave = LANES.FIRST_WAVE_MS; L.ended = false; L.winner = -1; L.pending = []; L.spawnCtx = null;
  L.lane = [lanesNewLane(0), lanesNewLane(1)]; runLevel = LANES.RUNLEVEL;
  levelDuration = 1e12; levelTimer = 0; midBossSpawned = true; // el motor no cierra niveles ni genera jefes
  // equipos: el jugador y su compañero en el carril 0; los otros dos guardianes, el carril rival
  const sets = L.assignment || [0, 0, 1, 1];
  heroes.forEach((h, k)=>{ h.lane = sets[k] != null ? sets[k] : (k < 2 ? 0 : 1); h.team = h.lane; });
  const slotInLane = [0, 0];
  heroes.forEach(h=>{ const n = slotInLane[h.lane]++, c = laneCrystalPos(h.lane); h.x = c.x + (n ? 70 : -70); h.y = c.y - 140; h.dead_t = 0; });
  document.getElementById("hud-arena") && (document.getElementById("hud-arena").textContent = "Guerra de Cristales");
  if(typeof lanesHudShow==="function") lanesHudShow();
  showBanner("¡DEFENDÉ TU CRISTAL!");
}

/* ---------------- geometría ---------------- */
function lanesClamp(ent){
  const i = ent.lane != null ? ent.lane : laneOfPoint(ent.x), b = laneBox(i), r = (ent.radius || 18) * 0.5 + 6;
  ent.x = Math.max(b.x0 + r, Math.min(b.x1 - r, ent.x));
  ent.y = Math.max(b.y0 + r + 30, Math.min(b.y1 - r, ent.y));
}
function lanesInside(x, y, m){ const b = laneBox(laneOfPoint(x)); return x > b.x0 + m && x < b.x1 - m && y > b.y0 + m && y < b.y1 - m; }

/* ---------------- economía y compras ---------------- */
function lanesShopOpen(){ return !!LN && !LN.ended && (LN.wave === 0 || LN.t < LN.nextWave - (LANES.WAVE_MS - LANES.SUPPLY_MS)); }
function lanesCanBuy(laneIdx, key){
  const L = LN, ln = L && L.lane[laneIdx], it = Object.prototype.hasOwnProperty.call(LANES.SHOP, key) ? LANES.SHOP[key] : null; // (un invitado puede mandar cualquier texto: "__proto__"…)
  if(!ln || !it || L.ended || !lanesShopOpen()) return false;
  if(ln.shards < it.cost) return false;
  if(key === "repair" && (ln.crystal.hp >= ln.crystal.maxHp || L.t < ln.repairAt)) return false;
  if(key === "upgrade" && ln.upgrade >= 3) return false;
  if(key === "ward" && (ln.crystal.ward >= 150 || L.t < ln.wardAt)) return false;
  if((key === "swarm" || key === "brute") && (L.t < ln.sendAt || L.pending.filter(p=>p.from === laneIdx).length >= 2)) return false;
  return true;
}
function lanesBuy(laneIdx, key, buyer){
  if(typeof lanesNetBuyRequest==="function" && lanesNetBuyRequest(key)) return true; // invitado: lo decide el anfitrión
  if(!lanesCanBuy(laneIdx, key)) return false;
  const L = LN, ln = L.lane[laneIdx], it = LANES.SHOP[key];
  ln.shards -= it.cost;
  if(key === "repair"){ ln.crystal.hp = Math.min(ln.crystal.maxHp, ln.crystal.hp + 180); ln.repairAt = L.t + it.cd; }
  else if(key === "upgrade"){ ln.upgrade++; }
  else if(key === "ward"){ ln.crystal.ward = 150; ln.wardAt = L.t + it.cd; }
  else { ln.sendAt = L.t + it.cd; ln.sent++; L.pending.push({from:laneIdx, to:1 - laneIdx, kind:key, due:L.t + 5000}); }
  if(buyer && buyer.stats) buyer.stats.buys = (buyer.stats.buys || 0) + 1;
  if(typeof playSfx === "function") try{ playSfx("pickup"); }catch(e){}
  showBanner(key === "swarm" || key === "brute" ? "¡Enviaste una amenaza al rival!" : it.name + " ✓");
  return true;
}
// Mejora de equipo: +12% de daño por punto a los héroes del carril (se aplica sobre el daño de salida)
function lanesDmgMult(src){
  if(!LN) return 1;
  const h = src && src.classKey ? src : (src && (src.src || src.owner || src.caster));
  const i = h && h.lane != null ? h.lane : -1;
  return i >= 0 ? 1 + LN.lane[i].upgrade * 0.12 : 1;
}

/* ---------------- cristal ---------------- */
function lanesCrystalHit(laneIdx, amount){
  const L = LN; if(!L || L.ended) return;
  const c = L.lane[laneIdx].crystal;
  if(c.ward > 0){ const a = Math.min(c.ward, amount); c.ward -= a; amount -= a; }
  if(amount > 0){ c.hp = Math.max(0, c.hp - amount); c.hitFlash = 220; }
  if(c.hp <= 0) lanesFinish(1 - laneIdx, "cristal");
}

/* ---------------- oleadas ---------------- */
const LANES_MIX = [["esqueleto", 0.62], ["zombie", 0.26], ["demonio_menor", 0.12]];
function lanesPickType(){ let r = lanesRand(), acc = 0; for(const [t, w] of LANES_MIX){ acc += w; if(r <= acc) return t; } return "esqueleto"; }
function lanesSpawn(laneIdx, type, x, fromSend){
  const ln = LN.lane[laneIdx];
  if(enemies.filter(e=>e.alive && e.lane === laneIdx).length >= LANES.MAX_ENEMIES) return null;
  LN.spawnCtx = {lane:laneIdx, x};
  const e = spawnEnemy(type, false, false);
  LN.spawnCtx = null;
  if(!e) return null;
  e.lane = laneIdx; e.noLoot = true; e.dropsItem = false; e.fromSend = !!fromSend;
  const k = 1 + LN.wave * 0.09;                    // presión creciente por oleada (igual para los dos carriles)
  e.hp = e.maxHp = Math.round(e.maxHp * k * 0.6); e.dmg = Math.round(e.dmg * (1 + LN.wave * 0.05) * 0.8);
  if(type === "esqueleto") e.speed *= 0.82;
  return e;
}
function lanesWaveStart(){
  const L = LN; L.wave++; L.nextWave += LANES.WAVE_MS;
  const n = Math.min(26, 6 + L.wave * 1.2) | 0, brute = L.wave % 3 === 0;
  // mismas posiciones y tipos para los dos carriles (oleada espejo)
  const plan = []; for(let i = 0; i < n; i++) plan.push({type:lanesPickType(), k:lanesRand()});
  const bx = lanesRand();
  for(const ln of L.lane){
    const gap = L.lane[1 - ln.i].crystal.hp - ln.crystal.hp, helped = gap >= LANES.CATCHUP_GAP;
    ln.shards = Math.min(LANES.MAX_SHARDS, ln.shards + LANES.WAVE_SHARDS + (helped ? LANES.CATCHUP_SHARDS : 0)); if(helped) ln.assist++;
    const portals = lanePortals(ln.i), x0 = laneX0(ln.i);
    for(const p of plan){ const por = portals[(p.k * 3) | 0]; lanesSpawn(ln.i, p.type, por.x + (p.k * 90 - 45)); }
    if(brute){ const e = lanesSpawn(ln.i, "golem", x0 + LANES.W * (0.3 + bx * 0.4)); if(e){ e.isBrute = true; } }
  }
  showBanner("OLEADA " + L.wave + (brute ? " · ¡COLOSOS!" : ""));
}
// gancho placeSpawn: coloca cada enemigo en un portal de su carril
function lanesPlaceSpawn(e){
  const c = LN && LN.spawnCtx; if(!c) return;
  e.lane = c.lane; e.x = c.x; e.y = 92 + (e.fromSend ? 0 : 0);
}

// Bots: a quién siguen. El humano vivo de su carril o, si no hay, el punto de reunión delante de su cristal.
function lanesLeaderFor(h){
  for(const o of heroes) if(o !== h && o.lane === h.lane && o.alive && !(o.isBot || o.netName === "BOT")) return o;
  const L = LN, r = laneRally(h.lane), c = L.rallyObj || (L.rallyObj = [null, null]);
  const o = c[h.lane] || (c[h.lane] = {isRally:true, alive:true, hp:1, maxHp:1, radius:20, x:r.x, y:r.y, stunTimer:0, slowTimer:0});
  o.x = r.x; o.y = r.y; return o;
}

/* ---------------- objetivo de los enemigos ---------------- */
// El héroe vivo más cercano de SU carril si está a tiro; si no, el cristal de su carril.
function lanesEnemyTarget(e){
  const L = LN; if(!L) return null;
  const i = e.lane != null ? e.lane : laneOfPoint(e.x), cr = L.lane[i].crystal;
  let best = null, bd = 380;
  for(const h of heroes){ if(!h.alive || h.lane !== i || h.stealthTimer > 0) continue; const d = Math.hypot(h.x - e.x, h.y - e.y); if(d < bd){ bd = d; best = h; } }
  return best || (cr.alive ? cr : null);
}

/* ---------------- ciclo de la partida (gancho update) ---------------- */
function lanesUpdate(dt){
  const L = LN; if(!L || L.ended) return;
  L.t += dt;
  if(L.t >= L.nextWave) lanesWaveStart();
  for(let k = L.pending.length - 1; k >= 0; k--){
    const p = L.pending[k]; if(L.t < p.due) continue; L.pending.splice(k, 1);
    const portals = lanePortals(p.to);
    if(p.kind === "swarm"){ for(let i = 0; i < 5; i++){ const por = portals[i % 3], e = lanesSpawn(p.to, "bestia_bosque", por.x + (i - 2) * 22, true); if(e){ e.hp = e.maxHp = Math.round(e.maxHp * 1.0); } } }
    else { const e = lanesSpawn(p.to, "golem", portals[1].x, true); if(e) e.isBrute = true; }
  }
  for(const ln of L.lane){ const c = ln.crystal; if(c.hitFlash > 0) c.hitFlash -= dt; }
  // reaparición: caer cuesta vida al cristal propio y se vuelve a los 8 s
  for(const h of heroes){
    if(h.alive){ h.dead_t = 0; continue; }
    if(!h.dead_t){ h.dead_t = L.t; h._respawnAt = L.t + LANES.RESPAWN_MS; lanesCrystalHit(h.lane, LANES.DEATH_COST); if(L.ended) return; continue; }
    if(L.t >= h._respawnAt){
      const c = laneRally(h.lane); h.x = c.x + (Math.random() - 0.5) * 120; h.y = c.y;
      reviveHero(h, null); h.hp = h.maxHp; h.energy = h.maxEnergy; h.invulnTimer = 2500; h.dead_t = 0;
      if(h._net) h._net.posAuth++; // un invitado acepta la nueva posición
    }
  }
  // Eclipse: los dos cristales se apagan cada vez más rápido
  if(L.t >= LANES.ECLIPSE_MS){ const k = 3 * (1 + (L.t - LANES.ECLIPSE_MS) / 60000) * dt / 1000; lanesCrystalHit(0, k); lanesCrystalHit(1, k); }
  if(!L.ended && L.t >= LANES.TIME_LIMIT_MS){ const a = L.lane[0].crystal.hp, b = L.lane[1].crystal.hp; lanesFinish(a === b ? -1 : (a > b ? 0 : 1), "tiempo"); }
}
function lanesEnemyKilled(e){
  const L = LN; if(!L || L.ended || e.lane == null) return;
  const ln = L.lane[e.lane]; ln.kills++;
  ln.shards = Math.min(LANES.MAX_SHARDS, ln.shards + (e.isBrute ? LANES.ELITE_SHARDS : LANES.KILL_SHARDS));
}
// el golpe a un héroe/cristal: los enemigos le pegan al cristal con damageHero (tgt = cristal)
function lanesHitCrystal(c, amount){ lanesCrystalHit(c.lane, amount); }

/* ---------------- final ---------------- */
function lanesFinish(winnerLane, why){
  const L = LN; if(!L || L.ended) return;
  L.ended = true; L.winner = winnerLane; L.why = why; runEnding = true;
  for(const e of enemies) if(e.alive) e.alive = false;
  enemies = enemies.filter(e=>e.alive);
  if(typeof netIsHost==="function" && netIsHost()) netHostAnnounceEnd(winnerLane === 0);
  showBanner(winnerLane === -1 ? "¡EMPATE!" : (winnerLane === (player && player.lane) ? "¡VICTORIA!" : "CRISTAL CAÍDO"));
  setTimeout(()=>{ if(LN === L && typeof lanesShowResult === "function") lanesShowResult(); }, 1600);
}
function lanesOnPlayerDeath(){ /* reaparece solo (lanesUpdate): nunca hay derrota por caer */ showBanner("Caíste · volvés en " + (LANES.RESPAWN_MS / 1000) + " s"); }

ARENA_DEFS.convergencia = {
  key:"convergencia",
  subBossLevels:[],
  navBounds:{x0:0, y0:0, x1:laneX0(1) + LANES.W, y1:LANES.H},
  runStart:lanesRunStart,
  update:lanesUpdate,
  clamp:lanesClamp,
  inside:lanesInside,
  placeSpawn:lanesPlaceSpawn,
  enemyTarget:lanesEnemyTarget,
  enemyKilled:lanesEnemyKilled,
  ownSpawns:()=>true,
  holdLevel:()=>true,
  afterEnemies:()=>{ for(const e of enemies) if(e.alive) lanesClamp(e); }
};
