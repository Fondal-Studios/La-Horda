"use strict";
/* ============================================================
   js/arenas/lanes/lanes-core.js
   GUERRA DE CRISTALES en el MOTOR REAL — lógica de la partida (estilo MOBA).
   Un mapa, dos bases (lanes-data.js). Cada equipo tiene dos torres y un cristal; se derriban en orden.
   - PvP: cada héroe tiene un AVATAR dentro de `enemies` (entidad invisible que sigue al héroe). Como todas las
     habilidades de la campaña golpean a `enemies`, así el PvP funciona con TODOS los campeones sin tocar sus kits:
     el daño que recibe el avatar se pasa al héroe real (ver lanesSync). Las estructuras funcionan igual.
   - Cada habilidad se lanza viendo solo a su equipo en `heroes` y solo a sus rivales en `enemies` (lanesTeamCall).
   - La HORDA de cada equipo marcha contra la base rival; las cartas de nivel potencian a la horda PROPIA.
   Todo corre en el anfitrión (o en la partida local). El estado de la partida (LN) NO toca el guardado real:
   se juega con un guardado temporal normalizado (todos al nivel 10, sin equipo) que se descarta al salir.
   ============================================================ */
let LN = null;
const LANES_BIG = 1e9;                 // vida de los avatares: nunca mueren; lo que pierden se le pasa al héroe/estructura
function lanesOn(){ return !!LN; }
function lanesRand(){ const s = LN.rng = (Math.imul(LN.rng, 1664525) + 1013904223) >>> 0; return s / 4294967296; }
function lanesIsHuman(h){ return !!h && !(h.isBot || h.netName === "BOT"); }

/* ---------------- entrada y salida ---------------- */
// Cambia al guardado TEMPORAL normalizado y crea el estado de la partida. `role`: "solo" | "host" | "guest" | "lobby".
function lanesBegin(role, seed, mode){
  if(LN){ LN.role = role === "lobby" ? LN.role : role; LN.lobby = role === "lobby"; return LN; } // ya estaba en la Sala (guardado temporal puesto)
  if(typeof persistNow==="function") persistNow();   // el progreso real se guarda ANTES de usar el temporal
  const snap = {save, selectedClass, currentArena, lobbyAllies, endlessActive, endlessPending, divinaMode};
  LN = {snap, mode:mode || "cw", role:role||"solo", lobby:role === "lobby", rng:((seed||((Math.random()*4294967295)>>>0))>>>0)||7, t:0, ended:true, winner:-1, team:[], shots:[], feed:[], wave:0};
  save = defaultSave();
  for(const id in save.champions){ const c = save.champions[id]; c.level = LANES.LEVEL; c.xp = 0; c.unlocked = true; }
  save.tut = {training:1, basics:1, b_move:1, b_attack:1, b_skill:1, goalMission:1}; // sin tutoriales dentro de la partida
  divinaMode = false; endlessActive = false; endlessPending = false;
  LN.team = LN.mode === "coliseo" ? colNewTeams() : [lanesNewTeam(0), lanesNewTeam(1)];
  lanesWrap();
  return LN;
}
// Devuelve TODO al estado anterior (guardado real incluido), sin cambiar de pantalla.
function lanesRestore(){
  if(!LN) return;
  const snap = LN.snap; LN = null;
  lanesUnwrap();
  if(typeof colCleanup==="function") colCleanup();
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

/* ---------------- equipos y estructuras ---------------- */
function lanesNewStruct(team, order){
  const crystal = order === 2, p = crystal ? laneCrystalPos(team) : laneTowerPos(team, order);
  const hp = crystal ? LANES.CRYSTAL_HP : LANES.TOWER_HP;
  return {isStruct:true, kind:crystal ? "crystal" : "tower", order, team, x:p.x, y:p.y, radius:crystal ? LANES.CRYSTAL_R : LANES.TOWER_R,
    hp, maxHp:hp, alive:true, ward:0, hitFlash:0, atkAt:0, stunTimer:0, slowTimer:0, burnTimer:0, bleedTimer:0, shield:0};
}
function lanesNewTeam(team){
  return {team, shards:LANES.START_SHARDS, repairAt:0, wardAt:0, sendAt:0, kills:0, sent:0, assist:0, pk:0, wave:0, nextWave:LANES.FIRST_WAVE_MS,
    cards:{}, taken:0, mods:lanesModsOf({}), offer:null, offerAt:0, nextCard:LANES.CARD_FIRST_MS,
    S:[lanesNewStruct(team, 0), lanesNewStruct(team, 1), lanesNewStruct(team, 2)]};
}
function lanesCrystal(team){ return LN.team[team].S[2]; }
function lanesFront(team){ for(const s of LN.team[team].S) if(s.alive) return s; return null; }   // la estructura que hay que derribar ahora
function lanesExposed(s){ const S = LN.team[s.team].S; for(let k = 0; k < s.order; k++) if(S[k].alive) return false; return true; }
function lanesTowersAlive(team){ let n = 0; for(const s of LN.team[team].S) if(s.alive && s.kind === "tower") n++; return n; }

/* ---------------- arranque de la partida (gancho runStart) ---------------- */
function lanesRunStart(){
  const L = LN; if(!L) return;
  L.t = 0; L.wave = 0; L.ended = false; L.winner = -1; L.shots = []; L.feed = []; L.spawnCtx = null;
  L.team = [lanesNewTeam(0), lanesNewTeam(1)]; runLevel = LANES.RUNLEVEL;
  levelDuration = 1e12; levelTimer = 0; midBossSpawned = true; // el motor no cierra niveles ni genera jefes
  // equipos: el jugador y su compañero en el equipo 0; los otros dos guardianes, el rival
  const sets = L.assignment || [0, 0, 1, 1];
  heroes.forEach((h, k)=>{ h.team = h.lane = sets[k] != null ? sets[k] : (k < 2 ? 0 : 1); h._lnProxy = null; });
  const slot = [0, 0];
  heroes.forEach(h=>{ const n = slot[h.team]++, c = laneRally(h.team); h.x = c.x + (h.team ? 40 : -40); h.y = c.y + (n ? 70 : -70); h.dead_t = 0; });
  document.getElementById("hud-arena") && (document.getElementById("hud-arena").textContent = "Guerra de Cristales");
  lanesSync(0);
  if(typeof lanesHudShow==="function") lanesHudShow();
  showBanner("¡DERRIBÁ LAS TORRES Y EL CRISTAL RIVAL!");
}

/* ---------------- geometría ---------------- */
function lanesClamp(ent){
  const b = laneBox(), r = (ent.radius || 18) * 0.5 + 6;
  ent.x = Math.max(b.x0 + r, Math.min(b.x1 - r, ent.x));
  ent.y = Math.max(b.y0 + r + 30, Math.min(b.y1 - r, ent.y));
}
function lanesInside(x, y, m){ return x > m && x < LANES.W - m && y > m && y < LANES.H - m; }

/* ---------------- equipos de las habilidades ---------------- */
// Equipo de quien golpea: héroe, criatura, torre o invocación (que apunta a su dueño).
function lanesTeamOf(src){
  let s = src, n = 0;
  while(s && n++ < 4){ if(s.team != null) return s.team; s = s.owner || s.src || s.caster || s.from || s.summoner; }
  return null;
}
// ¿Esta entidad de `enemies` es hostil para el equipo `team`?
function lanesHostileTo(team, e){ return e.team == null || e.team !== team; }
let _lnWrapped = null;
function lanesWrap(){
  if(_lnWrapped) return;
  const ca = castAbility, tb = triggerBasic;
  _lnWrapped = {ca, tb};
  castAbility = function(caster){ const a = arguments; return lanesTeamCall(caster, ()=>ca.apply(this, a)); };
  triggerBasic = function(caster){ const a = arguments; return lanesTeamCall(caster || player, ()=>tb.apply(this, a)); };
}
function lanesUnwrap(){ if(!_lnWrapped) return; castAbility = _lnWrapped.ca; triggerBasic = _lnWrapped.tb; _lnWrapped = null; }
// Mientras `caster` lanza algo, `heroes`/`allies` son solo su equipo y `enemies` solo sus rivales: curas, escudos y
// áreas de TODAS las habilidades quedan del lado correcto sin tocar ningún kit.
function lanesTeamCall(caster, fn){
  const L = LN;
  if(!L || L.inCast || !caster || caster.team == null) return fn();
  L.inCast = true; L.cur = caster;
  const H = heroes, E = enemies, A = allies, t = caster.team;
  const hs = H.filter(h=>h.team === t), es = E.filter(e=>lanesHostileTo(t, e)), as = A.filter(a=>a.team === t);
  heroes = hs; enemies = es; allies = as;
  try{ return fn(); }
  finally{
    const seen = new Set(E); for(const e of enemies) if(!seen.has(e)) E.push(e);   // lo que la habilidad haya creado (invocaciones hostiles, etc.)
    heroes = H; enemies = E; allies = A; L.inCast = false; L.cur = null;
  }
}

/* ---------------- avatares (PvP) y estructuras como objetivos ---------------- */
function lanesMkProxy(kind, lnRef, team){
  const e = {type:"esqueleto", name:lnRef.name || "", rank:"normal", x:lnRef.x, y:lnRef.y, radius:lnRef.radius || 18, hp:LANES_BIG, maxHp:LANES_BIG, dmg:0, speed:0, color:"#000",
    ranged:false, range:0, projSpeed:0, atkCd:0, xp:0, gold:0, dropsItem:false, slowTimer:0, slowAmt:0, burnTimer:0, burnDmg:0, bleedTimer:0, bleedDmg:0, stunTimer:0, hitFlash:0,
    fx:0, fy:1, animT:0, attackAnim:0, scale:1, target:null, alive:true, lanesProxy:true, kind, team, lnRef, noLoot:true};
  enemies.push(e); return e;
}
// Pasa al héroe/estructura lo que perdió su avatar desde el último cuadro y lo deja otra vez en vida plena.
function lanesSync(dt){
  const L = LN; if(!L) return;
  for(const h of heroes){
    let P = h._lnProxy;
    if(!h.alive){ if(P) P.alive = false; continue; }
    if(!P || !P.alive){ P = h._lnProxy = lanesMkProxy("hero", h, h.team); }
    const lost = LANES_BIG - P.hp;
    if(lost > 0.01){
      const from = P.lastHitBy, atk = from && from.team != null ? from : null;
      // limitador de ráfaga: ningún héroe pierde más del 40 % de su vida por PvP en un segundo (hay kits de mucha ráfaga)
      const W = h._pvpW || (h._pvpW = {t:L.t, sum:0}); if(L.t - W.t > 1000){ W.t = L.t; W.sum = 0; }
      const dmg = Math.min(lost * LANES.PVP_DMG, Math.max(0, h.maxHp * LANES.PVP_BURST - W.sum)); W.sum += dmg;
      if(dmg > 0) damageHero(h, dmg, {isPvp:true, from:atk || from, team:lanesTeamOf(from)});
      if(!h.alive && !h.dead_t) h._lnKiller = lanesTeamOf(from);
      P.hp = LANES_BIG;
    }
    if(P.stunTimer > 0){ h.stunTimer = Math.max(h.stunTimer || 0, P.stunTimer); P.stunTimer = 0; }   // control: se le pasa al héroe real
    if(P.slowTimer > 0){ h.slowTimer = Math.max(h.slowTimer || 0, P.slowTimer); h.slowAmt = Math.max(h.slowAmt || 0, P.slowAmt || 0); P.slowTimer = 0; P.slowAmt = 0; }
    for(const k of ["burn", "bleed", "poison"]){ if(P[k + "Timer"] > 0){ damageHero(h, (P[k + "Dmg"] || 0) * P[k + "Timer"] / 1000 * LANES.PVP_DMG * 0.5, {isPvp:true, from:P.lastHitBy}); P[k + "Timer"] = 0; } }
    P.x = h.x; P.y = h.y; P.radius = Math.max(16, h.radius || 18); P.hitFlash = 0; P.frozenTimer = 0;
  }
  for(const T of L.team) for(const s of (T.S || [])){
    let P = s._lnProxy;
    if(!s.alive){ if(P) P.alive = false; continue; }
    if(!P || !P.alive){ P = s._lnProxy = lanesMkProxy("struct", s, s.team); P.x = s.x; P.y = s.y; P.radius = s.radius + 6; P.kindOf = s.kind; }
    const lost = LANES_BIG - P.hp;
    if(lost > 0.01){ lanesStructDamage(s, lost, lanesTeamOf(P.lastHitBy)); P.hp = LANES_BIG; }
    P.stunTimer = 0; P.slowTimer = 0; P.burnTimer = 0; P.bleedTimer = 0; P.poisonTimer = 0; P.hitFlash = 0;
  }
}
// Gancho de damageEnemy: ¿este golpe no cuenta? (fuego amigo, estructuras protegidas)
function lanesBlocksDamage(e, src){
  const L = LN; if(!L) return false;
  if(L.ended && (e.lanesProxy || e.team != null)) return true;
  const st = lanesTeamOf(src);
  if(st != null && e.team != null && st === e.team) return true;
  if(L.mode === "coliseo") return colBlocksDamage(e);                  // Coliseo: sin golpes en la cuenta regresiva ni después de terminar tu duelo
  if(e.lanesProxy && e.kind === "struct" && !lanesExposed(e.lnRef)){ e.lnRef.hitFlash = 160; return true; }  // torre/cristal protegidos
  return false;
}
function lanesDmgMult(e, src){ return 1; }
// Gancho de damageHero: la horda propia no le pega a su equipo
function lanesBlocksHeroDamage(h, src){
  if(!src || src === h || src.isPvp) return false;
  const st = lanesTeamOf(src);
  return st != null && st === h.team;
}

/* ---------------- daño a estructuras ---------------- */
// Golpe de una criatura (damageHero con la estructura como objetivo)
function lanesHitStruct(s, amount, src){
  if(!LN || LN.ended || !s.alive) return;
  lanesStructDamage(s, amount * ((src && src.siegeMult) || 1), src && src.team != null ? src.team : null);
}
function lanesStructDamage(s, amount, byTeam){
  const L = LN; if(!L || L.ended || !s.alive || amount <= 0) return;
  if(s.ward > 0){ const a = Math.min(s.ward, amount); s.ward -= a; amount -= a; }
  if(amount > 0){ s.hp = Math.max(0, s.hp - amount); s.hitFlash = 200; }
  if(s.hp <= 0) lanesStructDown(s, byTeam);
}
function lanesStructDown(s, byTeam){
  const L = LN; s.alive = false; s.hp = 0; if(s._lnProxy) s._lnProxy.alive = false;
  const foe = 1 - s.team;
  if(s.kind === "crystal"){ lanesFinish(foe, "cristal"); return; }
  L.team[foe].shards = Math.min(LANES.MAX_SHARDS, L.team[foe].shards + LANES.TOWER_SHARDS);
  lanesFeed((s.team ? "Ámbar" : "Zafiro") + ": cayó su torre " + (s.order === 0 ? "exterior" : "interior"), foe);
  showBanner("¡TORRE " + (s.order === 0 ? "EXTERIOR" : "INTERIOR") + " " + (s.team ? "ÁMBAR" : "ZAFIRO") + " DERRIBADA!");
  if(typeof playSfx === "function") try{ playSfx("boom"); }catch(e){}
  for(let i = 0; i < 18; i++) particles.push({x:s.x + (Math.random() - 0.5) * 60, y:s.y + (Math.random() - 0.5) * 60, vx:(Math.random() - 0.5) * 240, vy:-Math.random() * 200, life:700, color:i % 2 ? "#cfd8e4" : "#ff9a4a"});
}
function lanesFeed(text, team){ const L = LN; L.feed.push({t:L.t, text, team}); if(L.feed.length > 5) L.feed.shift(); }

/* ---------------- economía y compras ---------------- */
function lanesShopOpen(){ return !!LN && !LN.ended; }
function lanesWeakest(team){ let best = null; for(const s of LN.team[team].S) if(s.alive && s.hp < s.maxHp && (!best || s.maxHp - s.hp > best.maxHp - best.hp)) best = s; return best; }
function lanesCanBuy(team, key){
  const L = LN, T = L && L.team[team], it = Object.prototype.hasOwnProperty.call(LANES.SHOP, key) ? LANES.SHOP[key] : null; // (un invitado puede mandar cualquier texto: "__proto__"…)
  if(!T || !it || L.ended) return false;
  if(T.shards < it.cost) return false;
  if(key === "repair" && (!lanesWeakest(team) || L.t < T.repairAt)) return false;
  if(key === "ward" && (L.t < T.wardAt || !lanesFront(team))) return false;
  if((key === "swarm" || key === "brute") && (L.t < T.sendAt || !lanesFront(1 - team))) return false;
  return true;
}
function lanesBuy(team, key, buyer){
  if(typeof lanesNetBuyRequest==="function" && lanesNetBuyRequest(key)) return true; // invitado: lo decide el anfitrión
  if(!lanesCanBuy(team, key)) return false;
  const L = LN, T = L.team[team], it = LANES.SHOP[key];
  T.shards -= it.cost;
  if(key === "repair"){ const s = lanesWeakest(team); s.hp = Math.min(s.maxHp, s.hp + 220); T.repairAt = L.t + it.cd; }
  else if(key === "ward"){ const s = lanesFront(team); s.ward = Math.max(s.ward, 180); T.wardAt = L.t + it.cd; }
  else { T.sendAt = L.t + it.cd; T.sent++; lanesSendNow(team, key); }
  if(buyer && buyer.stats) buyer.stats.buys = (buyer.stats.buys || 0) + 1;
  if(typeof playSfx === "function") try{ playSfx("pickup"); }catch(e){}
  showBanner(key === "swarm" || key === "brute" ? "¡Mandaste refuerzos contra la base rival!" : it.name + " ✓");
  return true;
}
function lanesSendNow(team, key){
  const p = lanePortals(team);
  if(key === "swarm"){ for(let i = 0; i < 5; i++){ const e = lanesSpawn(team, "bestia_bosque", p[i % 3].x + (i - 2) * 16, p[i % 3].y + (i - 2) * 10, true); if(e){ e.speed *= 1.1; } } }
  else { const e = lanesSpawn(team, "golem", p[1].x, p[1].y, true); if(e) e.isBrute = true; }
}

/* ---------------- cartas de horda ---------------- */
function lanesHumansOf(team){ return heroes.filter(h=>h.team === team && lanesIsHuman(h)); }
function lanesOffer(T){
  const L = LN, avail = Object.keys(LANES_CARDS).filter(id=>(T.cards[id] || 0) < LANES_CARDS[id].max), pick = [];
  while(pick.length < 3 && avail.length) pick.push(avail.splice((lanesRand() * avail.length) | 0, 1)[0]);
  if(!pick.length){ T.nextCard = Infinity; return; }
  T.offer = pick; T.offerAt = L.t;
  if(lanesHumansOf(T.team).length) showBanner("¡NUEVA CARTA DE HORDA! Elegí una");
}
// Elige la carta `idx` de la oferta del equipo. Devuelve true si se aplicó.
function lanesPickCard(team, idx){
  const L = LN, T = L && L.team[team];
  if(!T || !T.offer || L.ended) return false;
  const id = T.offer[idx | 0]; if(!id) return false;
  T.cards[id] = (T.cards[id] || 0) + 1; T.taken++; T.mods = lanesModsOf(T.cards); T.offer = null; T.nextCard = L.t + LANES.CARD_EVERY_MS;
  lanesFeed((team ? "Ámbar" : "Zafiro") + " potenció su horda: " + LANES_CARDS[id].name, team);
  if(lanesHumansOf(team).length) showBanner(LANES_CARDS[id].name + " ✓");
  return true;
}
function lanesCardTick(){
  const L = LN;
  for(const T of L.team){
    if(!T.offer && L.t >= T.nextCard && T.taken < LANES.MAX_CARDS) lanesOffer(T);
    if(T.offer){
      const humans = lanesHumansOf(T.team).length, wait = humans ? LANES.CARD_AUTO_MS : 2500 + (T.team * 700);
      if(L.t - T.offerAt >= wait) lanesPickCard(T.team, (lanesRand() * T.offer.length) | 0);
    }
  }
}

/* ---------------- la horda de cada equipo ---------------- */
const LANES_MIX = [["esqueleto", 0.62], ["zombie", 0.26], ["demonio_menor", 0.12]];
function lanesPickType(){ let r = lanesRand(), acc = 0; for(const [t, w] of LANES_MIX){ acc += w; if(r <= acc) return t; } return "esqueleto"; }
function lanesMinions(team){ let n = 0; for(const e of enemies) if(e.alive && !e.lanesProxy && e.team === team) n++; return n; }
function lanesSpawn(team, type, x, y, fromSend){
  const T = LN.team[team];
  if(lanesMinions(team) >= LANES.MAX_MINIONS) return null;
  LN.spawnCtx = {team, x, y};
  const e = spawnEnemy(type, false, false);
  LN.spawnCtx = null;
  if(!e) return null;
  const m = T.mods, w = Math.max(1, T.wave);
  e.team = team; e.noLoot = true; e.dropsItem = false; e.fromSend = !!fromSend;
  e.hp = e.maxHp = Math.round(e.maxHp * (1 + w * 0.09) * 0.6 * m.hp);
  e.dmg = Math.round(e.dmg * (1 + w * 0.05) * 0.8 * m.dmg);
  e.speed *= m.speed * (type === "esqueleto" ? 0.82 : 1);
  e.siegeMult = m.siege; e.regenPct = m.regen;
  return e;
}
function lanesWaveStart(T){
  const L = LN, m = T.mods, team = T.team;
  T.wave++; T.nextWave += LANES.WAVE_MS * m.pace; L.wave = Math.max(L.wave, T.wave);
  const n = Math.min(26, 5 + T.wave * 1.1 + m.count) | 0, brutes = (T.wave % 3 === 0 ? 1 : 0) + m.brute, portals = lanePortals(team);
  for(let i = 0; i < n; i++){ const p = portals[i % 3]; lanesSpawn(team, lanesPickType(), p.x + (lanesRand() - 0.5) * 70, p.y + (lanesRand() - 0.5) * 60); }
  for(let b = 0; b < brutes; b++){ const e = lanesSpawn(team, "golem", portals[1].x, portals[1].y + (b - (brutes - 1) / 2) * 50); if(e) e.isBrute = true; }
  const behind = lanesTowersAlive(team) + 1 < lanesTowersAlive(1 - team) + 1;   // remontada: quien perdió torres cobra un poco más
  T.shards = Math.min(LANES.MAX_SHARDS, T.shards + LANES.WAVE_SHARDS + (behind ? 6 : 0)); if(behind) T.assist++;
}
// gancho placeSpawn: la criatura sale del portal de su equipo
function lanesPlaceSpawn(e){
  const c = LN && LN.spawnCtx; if(!c) return;
  e.team = c.team; e.x = c.x; e.y = c.y;
}

/* ---------------- IA de las criaturas y de los bots ---------------- */
// Criatura: el héroe rival vivo más cercano si está a tiro; si no, la estructura que toca derribar del rival.
function lanesEnemyTarget(e){
  const L = LN; if(!L || e.team == null) return null;
  const foe = 1 - e.team;
  let best = null, bd = 380;
  for(const h of heroes){ if(!h.alive || h.team !== foe || h.stealthTimer > 0) continue; const d = Math.hypot(h.x - e.x, h.y - e.y); if(d < bd){ bd = d; best = h; } }
  return best || lanesFront(foe);
}
// Bots: a quién siguen. El humano vivo de su equipo o, si no hay, la "línea de frente" de su horda (sin entrar al alcance de las torres solos).
function lanesLeaderFor(h){
  if(LN.mode === "coliseo") return colLeaderFor(h);
  for(const o of heroes) if(o !== h && o.team === h.team && o.alive && lanesIsHuman(o)) return o;
  const L = LN, T = h.team, c = L.rallyObj || (L.rallyObj = [null, null]);
  const o = c[T] || (c[T] = {isRally:true, alive:true, hp:1, maxHp:1, radius:20, x:0, y:0, stunTimer:0, slowTimer:0});
  let p = laneRally(T);
  const F = lanesFront(1 - T);
  if(h.hp > h.maxHp * 0.35 && F){
    let lead = null;
    for(const e of enemies){ if(!e.alive || e.lanesProxy || e.team !== T) continue; if(!lead || (T ? e.x < lead.x : e.x > lead.x)) lead = e; }
    let near = 0; for(const e of enemies) if(e.alive && !e.lanesProxy && e.team === T && Math.hypot(e.x - F.x, e.y - F.y) < 480) near++;
    const margin = F.kind === "tower" ? (near >= 3 ? 150 : LANES.TOWER_RANGE + 30) : 230;
    if(lead){ p = {x:lead.x, y:LANES.MID_Y + (h.y > LANES.MID_Y ? 60 : -60)}; p.x = T ? Math.max(p.x, F.x + margin) : Math.min(p.x, F.x - margin); }
    else { const t0 = laneTowerPos(T, 0); p = {x:t0.x + (T ? -90 : 90), y:LANES.MID_Y}; }
  }
  o.x = p.x; o.y = p.y; return o;
}
// Gancho botTarget: héroe rival débil > criatura > estructura (solo si la horda propia la acompaña)
function lanesBotTarget(h, range){
  if(LN.mode === "coliseo") return colBotTarget(h, range);
  let best = null, bs = -1e9;
  for(const e of enemies){
    if(!e.alive || e.team === h.team) continue;
    const d = distance(h, e); if(d > range) continue;
    let s;
    if(e.lanesProxy && e.kind === "hero"){ s = 400 - d * 0.4 + (1 - e.lnRef.hp / e.lnRef.maxHp) * 300; }
    else if(e.lanesProxy){
      if(!lanesExposed(e.lnRef)) continue;
      let own = 0; for(const m of enemies) if(m.alive && !m.lanesProxy && m.team === h.team && Math.hypot(m.x - e.x, m.y - e.y) < 450) own++;
      if(e.lnRef.kind === "tower" && own < 2) continue;
      s = 120 - d * 0.2;
    } else s = 200 - d * 0.5;
    if(s > bs){ bs = s; best = e; }
  }
  return best;
}

/* ---------------- torres ---------------- */
function lanesTowerTick(s){
  const L = LN; if(!s.alive || L.t < s.atkAt) return;
  const foe = 1 - s.team, R = LANES.TOWER_RANGE, dmg = LANES.TOWER_DMG * (1 + Math.floor(L.t / 60000) * 0.12);
  let tgt = null, bd = R;
  for(const e of enemies){ if(!e.alive || e.lanesProxy || e.team !== foe) continue; const d = Math.hypot(e.x - s.x, e.y - s.y); if(d < bd){ bd = d; tgt = e; } }
  if(tgt){
    s.atkAt = L.t + LANES.TOWER_CD; tgt.hp -= dmg * 3; tgt.hitFlash = 120; L.shots.push({x1:s.x, y1:s.y - 70, x2:tgt.x, y2:tgt.y - 14, t:L.t, team:s.team});
    if(tgt.hp <= 0){ tgt.lastHitBy = null; tgt.noLoot = true; killEnemy(tgt); }
    return;
  }
  let hero = null; bd = R;
  for(const h of heroes){ if(!h.alive || h.team !== foe || h.stealthTimer > 0) continue; const d = Math.hypot(h.x - s.x, h.y - s.y); if(d < bd){ bd = d; hero = h; } }
  if(hero){
    s.atkAt = L.t + LANES.TOWER_CD; L.shots.push({x1:s.x, y1:s.y - 70, x2:hero.x, y2:hero.y - 14, t:L.t, team:s.team});
    damageHero(hero, dmg, {isPvp:true, from:s, team:s.team});
    if(!hero.alive && !hero.dead_t) hero._lnKiller = s.team;
  }
}

/* ---------------- ciclo de la partida (gancho update) ---------------- */
function lanesUpdate(dt){
  const L = LN; if(!L || L.ended) return;
  L.t += dt;
  lanesSync(dt);
  if(L.ended) return;
  for(const T of L.team) if(L.t >= T.nextWave) lanesWaveStart(T);
  lanesCardTick();
  for(const T of L.team) for(const s of T.S){ if(s.hitFlash > 0) s.hitFlash -= dt; lanesTowerTick(s); if(L.ended) return; }
  for(let i = L.shots.length - 1; i >= 0; i--) if(L.t - L.shots[i].t > 220) L.shots.splice(i, 1);
  // la horda que tiene "Carne que se cierra" se cura sola
  for(const e of enemies){ if(e.alive && !e.lanesProxy && e.regenPct && e.hp < e.maxHp) e.hp = Math.min(e.maxHp, e.hp + e.maxHp * e.regenPct * dt / 1000); }
  // reaparición: caer cuesta tiempo (crece con el reloj) y regalo para el equipo rival
  for(const h of heroes){
    if(h.alive){
      h.dead_t = 0;
      const c = laneCrystalPos(h.team);   // curación en la base propia
      if(Math.hypot(h.x - c.x, h.y - c.y) < 260 && h.hp < h.maxHp){ h.hp = Math.min(h.maxHp, h.hp + h.maxHp * LANES.BASE_HEAL * dt / 1000); h.energy = Math.min(h.maxEnergy || 100, (h.energy || 0) + 12 * dt / 1000); }
      continue;
    }
    if(!h.dead_t){
      h.dead_t = L.t; h._respawnAt = L.t + LANES.RESPAWN_MS + Math.floor(L.t / 60000) * LANES.RESPAWN_PER_MIN;
      const kt = h._lnKiller; h._lnKiller = null;
      if(kt != null && kt !== h.team){ L.team[kt].shards = Math.min(LANES.MAX_SHARDS, L.team[kt].shards + LANES.HERO_KILL_SHARDS); L.team[kt].pk++; lanesFeed((kt ? "Ámbar" : "Zafiro") + " derribó a " + heroLabel(h), kt); }
      continue;
    }
    if(L.t >= h._respawnAt){
      const c = laneRally(h.team); h.x = c.x + (Math.random() - 0.5) * 120; h.y = c.y + (Math.random() - 0.5) * 120;
      reviveHero(h, null); h.hp = h.maxHp; h.energy = h.maxEnergy; h.invulnTimer = 2500; h.dead_t = 0;
      if(h._net) h._net.posAuth++; // un invitado acepta la nueva posición
    }
  }
  // Eclipse: los dos cristales se apagan cada vez más rápido (aunque sus torres sigan en pie)
  if(L.t >= LANES.ECLIPSE_MS){ const k = 4 * (1 + (L.t - LANES.ECLIPSE_MS) / 60000) * dt / 1000; for(const T of L.team) lanesStructDamage(T.S[2], k, null); }
  if(!L.ended && L.t >= LANES.TIME_LIMIT_MS){
    const sc = t=>lanesTowersAlive(t) * 10000 + L.team[t].S[2].hp, a = sc(0), b = sc(1);
    lanesFinish(Math.abs(a - b) < 1 ? -1 : (a > b ? 0 : 1), "tiempo");
  }
}
function lanesEnemyKilled(e){
  const L = LN; if(!L || L.ended || e.lanesProxy || e.team == null) return;
  const k = e.lastHitBy, kt = k ? lanesTeamOf(k) : null;
  if(kt == null || kt === e.team) return;
  const T = L.team[kt]; T.kills++;
  T.shards = Math.min(LANES.MAX_SHARDS, T.shards + (e.isBrute ? LANES.ELITE_SHARDS : LANES.KILL_SHARDS));
}

/* ---------------- final ---------------- */
function lanesFinish(winnerTeam, why){
  const L = LN; if(!L || L.ended) return;
  L.ended = true; L.winner = winnerTeam; L.why = why; runEnding = true;
  for(const e of enemies) if(e.alive) e.alive = false;
  enemies = enemies.filter(e=>e.alive);
  if(typeof netIsHost==="function" && netIsHost()) netHostAnnounceEnd(winnerTeam === 0);
  showBanner(winnerTeam === -1 ? "¡EMPATE!" : (winnerTeam === (player && player.team) ? "¡VICTORIA!" : "CRISTAL CAÍDO"));
  setTimeout(()=>{ if(LN === L && typeof lanesShowResult === "function") lanesShowResult(); }, 1600);
}
function lanesNoRevive(a, by){ return !!LN && LN.mode === "coliseo" && !!LN.col && LN.col.phase === "fight"; }
function lanesOnPlayerDeath(){ if(LN && LN.mode === "coliseo") return; /* reaparece solo (lanesUpdate): nunca hay derrota por caer */ showBanner("Caíste · volvés en " + Math.round((LN && player && player._respawnAt ? Math.max(0, player._respawnAt - LN.t) : LANES.RESPAWN_MS) / 1000) + " s"); }

ARENA_DEFS.convergencia = {
  key:"convergencia",
  subBossLevels:[],
  navBounds:{x0:0, y0:0, x1:LANES.W, y1:LANES.H},
  runStart:lanesRunStart,
  update:lanesUpdate,
  clamp:lanesClamp,
  inside:lanesInside,
  placeSpawn:lanesPlaceSpawn,
  enemyTarget:lanesEnemyTarget,
  enemyKilled:lanesEnemyKilled,
  botTarget:lanesBotTarget,
  ownSpawns:()=>true,
  holdLevel:()=>true,
  afterEnemies:()=>{ for(const e of enemies) if(e.alive) lanesClamp(e); }
};
