"use strict";
/* ============================================================
   js/arenas/lanes/lanes-castle.js
   CONQUISTA DEL CASTILLO (guerra de clanes) — variante del motor real de la Guerra de Cristales (mode "castle").
   Un clan ATACA un castillo y el otro lo DEFIENDE; la horda es la fuerza de asedio. HOY se juega contra bots:
   tu clan (vos + 4 compañeros controlados por el juego) contra un clan rival SIMULADO. No hay clan contra clan en línea
   (el relay admite 4 humanos por sala); el contrato para sumarlo está en docs/modes/CLANES.md y clan-war-contract.json.

   Reglas (todo sobre las estructuras del mapa de tres carriles, ver lanes-data.js):
   - Equipo 0 = ATACANTES (Zafiro, abajo a la izquierda). Equipo 1 = DEFENSORES (Ámbar, arriba a la derecha).
   - El castillo defensor tiene en CADA carril: PUERTA (muralla, primera estructura; no dispara, los héroes le hacen solo
     el 55 % de daño: cae ante el asedio de la horda y el ariete), TORRE y TORRE DEL HOMENAJE; y un CORAZÓN que queda
     expuesto cuando cae cualquier torre del homenaje ("brecha"). Las murallas dibujadas a los lados de cada puerta son
     decorado: la defensa real son esas estructuras.
   - Los atacantes no tienen torres: su base es el ESTANDARTE DE ASEDIO. Si los defensores lo derriban, ganan.
   - ATACANTES ganan si el corazón cae. DEFENSORES ganan si el estandarte cae o si el castillo resiste el tiempo límite.
   - Atacantes: la horda de siempre (3 carriles); sus criaturas dañan al castillo al 75 %. Defensores: una milicia más chica y más lenta.
   - Dificultad 1-3 (clan rival): vida de las estructuras del rival, cartas gratis de su horda y nivel inicial de sus bots.
   No se toca el guardado real (guardado temporal, igual que la Guerra de Cristales).
   ============================================================ */
const CASTLE = {
  TIME_LIMIT_MS: 660000,                 // 11 min: si el castillo resiste hasta acá, ganan los defensores
  GATE_HP: 4200, TOWER_HP: 3000, KEEP_HP: 3600, HEART_HP: 4400, BANNER_HP: 5000,
  SIEGE_K: 0.75,                         // las criaturas de asedio hacen el 75 % de su daño de siempre a las estructuras del castillo: un asedio dura minutos, no segundos
  GATE_HERO_MULT: 0.55,                  // los héroes golpean a las puertas al 55 %: se abren con asedio
  DEF_FIRST_WAVE_MS: 22000, DEF_WAVE_MS: 40000, DEF_MELEE: 2,
  ATK_CARDS: {},                         // los atacantes arrancan sin cartas (las eligen con los niveles, como siempre)
  TIERS: {
    1: {name: "Guarnición novata", hp: 0.8, cards: {}, botLvl: 0},
    2: {name: "Compañía de asedio", hp: 1.0, cards: {hp: 1}, botLvl: 1},
    3: {name: "Gran ejército", hp: 1.25, cards: {hp: 1, dmg: 1, speed: 1}, botLvl: 2}
  },
  RIVALS: [["Colmillos Rojos", "CRJ"], ["Guardia Gris", "GGR"], ["Hijos del Abismo", "HDA"], ["Lobos de Hierro", "LDH"], ["Sombras del Alba", "SDA"], ["Martillos Rotos", "MRT"]],
  DEF_NAMES: ["PUERTA", "TORRE", "HOMENAJE"]
};
const CASTLE_TYPE_NAME = {gate: "Puerta", tower: "Torre", keep: "Torre del homenaje", heart: "Corazón del castillo", banner: "Estandarte de asedio"};

// Normaliza lo que manda la pantalla de clan (nunca se confía en el texto: se usa en el HUD y en el parte).
function castleNormalize(c){
  c = c || {};
  const side = c.side === "defend" ? "defend" : "attack";
  const tier = [1, 2, 3].includes(c.tier | 0) ? (c.tier | 0) : 1;
  const clean = (s, max, fb)=>{ const t = String(s == null ? "" : s).replace(/[<>\u0000-\u001f]/g, "").trim().slice(0, max); return t || fb; };
  const rv = CASTLE.RIVALS[(c.rivalIdx | 0) % CASTLE.RIVALS.length] || CASTLE.RIVALS[0];
  return {side, tier, clanName: clean(c.clanName, 20, "Tu clan"), clanTag: clean(c.clanTag, 4, "TU").toUpperCase(),
    rivalName: clean(c.rivalName, 20, rv[0]), rivalTag: clean(c.rivalTag, 4, rv[1]).toUpperCase(), rivalIdx: c.rivalIdx | 0,
    myTeam: side === "attack" ? 0 : 1, atkTeam: 0, defTeam: 1};
}
function castleOn(){ return !!LN && !!LN.castle; }
// Etiquetas para el HUD, el registro y los resultados.
function castleTeamLabel(i){
  const C = LN && LN.castle; if(!C) return null;
  const mine = i === C.myTeam, tag = mine ? C.clanTag : C.rivalTag;
  return "[" + tag + "] " + (i === C.atkTeam ? "ASEDIO" : "CASTILLO");
}
function castleStructName(s){ return CASTLE_TYPE_NAME[s.castle] || (s.kind === "crystal" ? "Corazón" : "Torre"); }

/* ---------------- armado del castillo (gancho de lanesRunStart) ---------------- */
function castleSetup(L){
  const C = L.castle, tier = CASTLE.TIERS[C.tier], rivalTeam = 1 - C.myTeam;
  const A = L.team[C.atkTeam], D = L.team[C.defTeam];
  const hpK = rivalTeam === C.defTeam ? tier.hp : 1;      // el rival defensor es más o menos duro según la dificultad
  for(const s of A.S){
    if(s.kind === "tower"){ s.alive = false; s.hp = 0; s.castle = "void"; }          // los atacantes no tienen torres
    else { s.castle = "banner"; s.hp = s.maxHp = CASTLE.BANNER_HP; s.radius = 50; }
  }
  for(const s of D.S){
    if(s.kind === "crystal"){ s.castle = "heart"; s.hp = s.maxHp = Math.round(CASTLE.HEART_HP * hpK); continue; }
    s.castle = s.order === 0 ? "gate" : s.order === 1 ? "tower" : "keep";
    const base = s.order === 0 ? CASTLE.GATE_HP : s.order === 1 ? CASTLE.TOWER_HP : CASTLE.KEEP_HP;
    s.hp = s.maxHp = Math.round(base * hpK);
    if(s.order === 0){ s.noFire = true; s.radius = 54; }                              // la puerta es una muralla: no dispara
    if(s.order === 2) s.radius = 46;
  }
  // hordas: los atacantes arrancan con asedio; el rival simulado suma cartas gratis según la dificultad
  A.cards = Object.assign({}, CASTLE.ATK_CARDS);
  if(rivalTeam === C.atkTeam) for(const id in tier.cards) A.cards[id] = (A.cards[id] || 0) + tier.cards[id];
  else for(const id in tier.cards) D.cards[id] = (D.cards[id] || 0) + tier.cards[id];
  A.mods = lanesModsOf(A.cards); D.mods = lanesModsOf(D.cards);
  D.nextWave = CASTLE.DEF_FIRST_WAVE_MS;
  if(tier.botLvl > 0) for(const h of heroes) if(h.team === rivalTeam){ lanesApplyLevel(h, LANES.LEVEL0 + tier.botLvl, true); }
  L.timeLimit = CASTLE.TIME_LIMIT_MS;
}
// Milicia del castillo: pocos soldados por carril, más lentos que la horda de asedio.
function castleDefWave(T){
  const L = LN, m = T.mods, team = T.team;
  T.wave++; T.nextWave += CASTLE.DEF_WAVE_MS * m.pace; L.wave = Math.max(L.wave, T.wave);
  const melee = CASTLE.DEF_MELEE + Math.floor(m.count / 3), caster = T.wave % 2 === 0 ? 1 : 0;
  for(let l = 0; l < 3; l++){
    const P = LANES_PATHS[l], dir = team === 0 ? 1 : -1, s0 = team === 0 ? 70 : P.len - 70;
    let n = 0;
    const put = kind=>{ const p = lanePoint(l, s0 + dir * n * 38); n++; return lanesSpawn(team, kind, p.x + (Math.random() - 0.5) * 20, p.y + (Math.random() - 0.5) * 20, l); };
    for(let i = 0; i < melee; i++) put("melee");
    for(let i = 0; i < caster; i++) put("caster");
    for(let i = 0; i < m.brute; i++) put("siege");
    if(T.superWaves > 0) put("super");
  }
  if(T.superWaves > 0) T.superWaves--;
}
// Daño de los héroes a las puertas (gancho de lanesDmgMult)
function castleDmgMult(e){
  const s = e && e.lanesProxy && e.kind === "struct" ? e.lnRef : null;
  return s && s.castle === "gate" ? CASTLE.GATE_HERO_MULT : 1;
}
// Daño de la horda a las estructuras del castillo (gancho de lanesHitStruct)
function castleSiegeK(s){ return LN && LN.castle && s.team === LN.castle.defTeam ? CASTLE.SIEGE_K : 1; }
function castleCounts(){
  const L = LN, D = L.team[L.castle.defTeam].S;
  const gates = D.filter(s=>s.castle === "gate"), towers = D.filter(s=>s.castle === "tower" || s.castle === "keep"), heart = D.find(s=>s.castle === "heart");
  return {gatesDown: gates.filter(s=>!s.alive).length, gates: gates.length, towersDown: towers.filter(s=>!s.alive).length, towers: towers.length,
    heartPct: heart && heart.alive ? Math.max(1, Math.round(heart.hp / heart.maxHp * 100)) : 0};
}
// Fin por tiempo: el castillo resistió.
function castleTimeUp(){ lanesFinish(LN.castle.defTeam, "resistencia"); }

/* ---------------- parte de resultado (se manda a /api/clan/war/report desde js/net/clan.js) ---------------- */
function castleMatchId(){
  const a = new Uint8Array(12);
  try{ crypto.getRandomValues(a); }catch(e){ for(let i = 0; i < a.length; i++) a[i] = Math.random() * 256; }
  return "cw-" + Array.from(a, b=>b.toString(16).padStart(2, "0")).join("");
}
function castleBuildReport(L, winner){
  const C = L.castle, c = castleCounts(), p = (typeof player !== "undefined" && player) ? player : null, s = (p && p.stats) || {};
  const mine = L.team[C.myTeam], foe = L.team[1 - C.myTeam];
  const clamp = (v, max)=>Math.max(0, Math.min(max, Math.round(+v || 0)));
  return {matchId: L.castleMatchId || (L.castleMatchId = castleMatchId()), mode: "castle", role: C.side, result: winner === C.myTeam ? "win" : "loss", opponent: "bots", tier: C.tier,
    durationMs: Math.round(L.t), build: "castle-1",
    stats: {gates: clamp(c.gatesDown, 3), towers: clamp(c.towersDown, 6), heartPct: clamp(c.heartPct, 100), heroKills: clamp(mine.pk, 99), heroDeaths: clamp(foe.pk, 99), minionKills: clamp(s.kills, 3000), seconds: clamp(L.t / 1000, 1200)}};
}

/* ---------------- dibujo: muralla, puerta, torre del homenaje y estandarte ---------------- */
function castleDrawWalls(){
  const L = LN; if(!L || !L.castle) return;
  const D = L.team[L.castle.defTeam];
  for(const s of D.S){
    if(s.castle !== "gate" || !inView(s.x, s.y, 520)) continue;
    const p = lanePoint(s.lane, laneProject(s.lane, s.x, s.y).s), nx = -p.dy, ny = p.dx, ang = Math.atan2(p.dy, p.dx);
    ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(ang);
    // muralla de piedra perpendicular al carril (decorado): dos tramos a los lados de la puerta
    for(const side of [-1, 1]){
      const y0 = side < 0 ? -330 : 70, h = 260;
      ctx.fillStyle = "#3b4558"; ctx.fillRect(-26, y0, 52, h);
      ctx.fillStyle = "#566179"; ctx.fillRect(-26, y0, 20, h);
      ctx.fillStyle = "rgba(0,0,0,.28)"; for(let k = 0; k < h; k += 26) ctx.fillRect(-26, y0 + k, 52, 2);
      ctx.fillStyle = "#6b7790"; for(let k = 0; k < h; k += 52) ctx.fillRect(-30, y0 + k, 60, 20);        // almenas
    }
    if(!s.alive){ ctx.fillStyle = "rgba(20,24,34,.8)"; for(let k = 0; k < 7; k++) ctx.fillRect(-20 + (k % 3) * 16, -70 + k * 20, 26, 14); }  // escombros
    ctx.restore();
  }
}
function castleDrawGate(s, now){
  const col = lanesTeamColor(s.team), f = Math.max(0, s.hp / s.maxHp);
  ctx.save(); ctx.translate(s.x, s.y);
  const p = lanePoint(s.lane, laneProject(s.lane, s.x, s.y).s); ctx.rotate(Math.atan2(p.dy, p.dx));
  if(s.hitFlash > 0){ ctx.shadowColor = "#ffffff"; ctx.shadowBlur = 26; }
  ctx.fillStyle = "#4b5670"; ctx.fillRect(-34, -70, 68, 140);                        // marco de piedra
  ctx.fillStyle = "#2a1a10"; ctx.fillRect(-20, -52, 40, 104);                         // hoja de madera
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#6a4326"; for(let k = -44; k < 48; k += 18) ctx.fillRect(-18, k, 36, 8);
  ctx.fillStyle = "#b8b8c4"; ctx.fillRect(-22, -4, 44, 6);                            // barra de hierro
  ctx.fillStyle = col; ctx.fillRect(-34, -70, 68, 6); ctx.fillRect(-34, 64, 68, 6);   // franjas del equipo
  if(f < 0.5){ ctx.strokeStyle = "rgba(0,0,0,.7)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-16, -40); ctx.lineTo(4, -8); ctx.lineTo(-8, 22); ctx.lineTo(10, 44); ctx.stroke(); }
  if(s.ward > 0){ ctx.strokeStyle = "rgba(169,245,255," + (0.35 + s.ward / 400) + ")"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 84, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
}
function castleDrawBanner(s, now){
  const col = lanesTeamColor(s.team), f = Math.max(0, s.hp / s.maxHp);
  ctx.save(); ctx.translate(s.x, s.y);
  ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(0, 16, 54, 16, 0, 0, Math.PI * 2); ctx.fill();
  if(s.hitFlash > 0){ ctx.shadowColor = "#ffffff"; ctx.shadowBlur = 24; }
  ctx.fillStyle = "#6a4326"; ctx.fillRect(-5, -150, 10, 170);                         // asta
  ctx.fillStyle = "#cfd8e4"; ctx.fillRect(-32, 8, 64, 10);                            // base
  const wave = Math.sin(now * 3) * 6;
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(5, -146); ctx.lineTo(78, -132 + wave); ctx.lineTo(60, -108); ctx.lineTo(78, -84 - wave); ctx.lineTo(5, -70); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.fillRect(24, -118, 22, 6);
  if(f < 0.5){ ctx.strokeStyle = "rgba(0,0,0,.6)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-3, -60); ctx.lineTo(6, -40); ctx.lineTo(0, -20); ctx.stroke(); }
  if(s.ward > 0){ ctx.strokeStyle = "rgba(169,245,255," + (0.35 + s.ward / 400) + ")"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -60, 84, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
}
