"use strict";
/* ============================================================
   js/systems/ranking.js
   RANGO DE LA HORDA — rating tipo Elo con divisiones, para Horda Infinita, Guerra de Cristales y Coliseo.
   Vive en el guardado como `save.ladder` (ver docs/modes/CRYSTAL_WARS.md, «Rango»). Sin DOM: se puede cargar en Node
   (tools/ranking/test-rating.js) y en el navegador (window.Ladder). Lo que escribe es SOLO `save.ladder`.

   Reglas honestas (todas con perillas en Ladder.CFG):
   - Un rating por modo: horda (contra la «par» de tu rango), cw (2 equipos), col (4 equipos, por puesto).
   - Contra HUMANOS cuenta completo. Contra BOTS cuenta a mitad de peso, el rival vale BOT_MMR, hay un techo (BOT_CEIL: con bots
     no se pasa de ahí), un tope de ganancia por día (BOT_DAY_GAIN) y, ya en el techo, la partida queda como «práctica» sin puntos.
   - Abandonar = derrota (en partidas con humanos, más una penalización fija). Quedarse AFK = nunca suma (si ganó, +0).
     Cerrar la pestaña en plena partida cuenta como abandonar (pagehide, ver ranking-hooks.js). Una salida de menos de
     FORFEIT_MIN_MS no se anota (te equivocaste de botón).
   - El rating es CALCULADO EN EL CLIENTE y por eso no es a prueba de trampas: el servidor global (todavía no existe) tendrá que
     recalcularlo desde los informes de partida (`save.ladder.log`, ver «Contrato» en el documento).
   ============================================================ */
(function(root){
  const CFG = Object.freeze({
    START: 1000, MIN: 0, MAX: 4000,
    K_BASE: 24, K_PROV: 40, PROV_GAMES: 10,                 // factor K y partidas de «clasificación»
    BOT_MMR: 1000, BOT_WEIGHT: 0.5, BOT_CEIL: 1300, BOT_DAY_GAIN: 40,
    ABANDON_EXTRA: 8, FORFEIT_MIN_MS: 20000,
    HORDA_K: 16, HORDA_PAR0: 5, HORDA_PAR_PER_MMR: 1 / 50, HORDA_SPREAD: 4, HORDA_MIN_ROUND: 2,
    LOG_MAX: 30
  });
  const MODES = Object.freeze({
    horda: {key: "horda", name: "Horda Infinita", short: "HORDA", icon: "♾", kind: "pve", field: 1},
    cw:    {key: "cw",    name: "Guerra de Cristales", short: "CRISTALES", icon: "◆", kind: "pvp", field: 2},
    col:   {key: "col",   name: "Coliseo", short: "COLISEO", icon: "⚔", kind: "pvp", field: 4}
  });
  const MODE_KEYS = Object.keys(MODES);
  // Divisiones: cada una cubre 300 de rating en tres escalones (III → I) salvo Ceniza (por debajo de lo que se empieza) y Leyenda (sin tope).
  const TIERS = Object.freeze([
    {key: "ceniza",  name: "Ceniza",  lo: 0,    steps: 1, color: "#9a8f86"},
    {key: "hierro",  name: "Hierro",  lo: 1000, steps: 3, color: "#b8c0c8"},
    {key: "brasa",   name: "Brasa",   lo: 1300, steps: 3, color: "#ff9a3c"},
    {key: "ambar",   name: "Ámbar",   lo: 1600, steps: 3, color: "#ffd76a"},
    {key: "zafiro",  name: "Zafiro",  lo: 1900, steps: 3, color: "#6fd3ff"},
    {key: "cristal", name: "Cristal", lo: 2200, steps: 3, color: "#d9a8ff"},
    {key: "leyenda", name: "Leyenda", lo: 2500, steps: 1, color: "#ff7ac8"}
  ]);
  const ROMAN = ["", "I", "II", "III"];

  const num = (v, d, lo, hi) => { v = Number(v); if(!Number.isFinite(v)) v = d; return Math.max(lo, Math.min(hi, v)); };
  const int = (v, d, lo, hi) => Math.round(num(v, d, lo, hi));
  const str = (v, d, max) => (typeof v === "string" ? v : d).slice(0, max);
  const isObj = v => !!v && typeof v === "object" && !Array.isArray(v);

  function tierOf(mmr){
    mmr = int(mmr, CFG.START, CFG.MIN, CFG.MAX);
    let i = 0; for(let k = 0; k < TIERS.length; k++) if(mmr >= TIERS[k].lo) i = k;
    const T = TIERS[i], nextT = TIERS[i + 1] || null;
    let div = "", lo = T.lo, hi = nextT ? nextT.lo : null;
    if(T.steps === 3){ const s = Math.min(2, Math.floor((mmr - T.lo) / 100)); div = ROMAN[3 - s]; lo = T.lo + s * 100; hi = s === 2 ? nextT.lo : lo + 100; }
    const progress = hi == null ? 1 : Math.max(0, Math.min(1, (mmr - lo) / (hi - lo)));
    return {index: i, key: T.key, name: T.name, div, label: T.name + (div ? " " + div : ""), color: T.color, lo, hi, progress, mmr};
  }
  function expected(a, b){ return 1 / (1 + Math.pow(10, (b - a) / 400)); }

  function modeDefault(){
    return {mmr: CFG.START, peak: CFG.START, games: 0, wins: 0, losses: 0, draws: 0, abandons: 0, streak: 0, bestStreak: 0, practice: {games: 0, wins: 0}, lastAt: 0};
  }
  function defaultState(){ const modes = {}; for(const k of MODE_KEYS) modes[k] = modeDefault(); return {v: 1, season: 1, modes, botDay: {d: "", gain: 0}, log: []}; }
  function cleanMode(r){
    const d = modeDefault(); if(!isObj(r)) return d;
    const mmr = int(r.mmr, d.mmr, CFG.MIN, CFG.MAX), pr = isObj(r.practice) ? r.practice : {};
    return {mmr, peak: Math.max(mmr, int(r.peak, mmr, CFG.MIN, CFG.MAX)), games: int(r.games, 0, 0, 1e6), wins: int(r.wins, 0, 0, 1e6), losses: int(r.losses, 0, 0, 1e6), draws: int(r.draws, 0, 0, 1e6),
      abandons: int(r.abandons, 0, 0, 1e6), streak: int(r.streak, 0, -1000, 1000), bestStreak: int(r.bestStreak, 0, 0, 1000),
      practice: {games: int(pr.games, 0, 0, 1e6), wins: int(pr.wins, 0, 0, 1e6)}, lastAt: int(r.lastAt, 0, 0, 1e15)};
  }
  function cleanLog(e){
    if(!isObj(e) || !MODES[e.mode]) return null;
    return {id: str(e.id, "", 64), mode: e.mode, at: int(e.at, 0, 0, 1e15), outcome: ["win", "loss", "draw"].includes(e.outcome) ? e.outcome : "loss", place: int(e.place, 0, 0, 16), field: int(e.field, 0, 0, 16),
      vs: ["humans", "bots", "mixed", "pve"].includes(e.vs) ? e.vs : "bots", counted: !!e.counted, reason: str(e.reason, "ok", 24), delta: int(e.delta, 0, -500, 500), before: int(e.before, CFG.START, 0, CFG.MAX), after: int(e.after, CFG.START, 0, CFG.MAX),
      abandon: !!e.abandon, afk: !!e.afk, round: int(e.round, 0, 0, 1e5), durationMs: int(e.durationMs, 0, 0, 1e9), synced: !!e.synced};
  }
  // Migración segura: acepta cualquier cosa (undefined, texto, un objeto a medias, uno manipulado) y devuelve un estado válido. No lanza.
  function normalize(raw){
    const out = defaultState(); if(!isObj(raw)) return out;
    const rm = isObj(raw.modes) ? raw.modes : {};
    for(const k of MODE_KEYS) out.modes[k] = cleanMode(rm[k]);
    out.season = int(raw.season, 1, 1, 1e4);
    if(isObj(raw.botDay)) out.botDay = {d: str(raw.botDay.d, "", 10), gain: int(raw.botDay.gain, 0, 0, 1e4)};
    if(Array.isArray(raw.log)) out.log = raw.log.map(cleanLog).filter(Boolean).slice(-CFG.LOG_MAX);
    return out;
  }
  function ensure(sv){ if(!sv || typeof sv !== "object") return null; sv.ladder = normalize(sv.ladder); return sv.ladder; }
  const dayKey = now => new Date(now).toISOString().slice(0, 10);

  // Calcula (y aplica) el resultado de una partida. `rep`:
  //  {id, mode, outcome:"win"|"loss"|"draw", place?, tied?, field?, opps?:[{human:bool, mmr?}], abandon?, afk?, durationMs?, round?, eligible?, why?}
  // Devuelve {counted, reason, delta, before, after, tierBefore, tierAfter, promoted, demoted, mode, outcome, vs}.
  function record(sv, rep, now){
    now = Number.isFinite(now) ? now : Date.now();
    const L = ensure(sv); const res = {counted: false, reason: "ok", delta: 0, mode: rep && rep.mode, vs: "bots"};
    if(!L || !rep || !MODES[rep.mode]){ res.reason = "ineligible"; return res; }
    const M = MODES[rep.mode], S = L.modes[rep.mode], id = str(rep.id, "", 64);
    if(id && L.log.some(e => e.id === id)){ res.reason = "duplicate"; return res; }
    if(rep.eligible === false){ res.reason = "ineligible"; res.why = rep.why || ""; return res; }   // entrenamiento, banco de pruebas: ni práctica
    const forfeit = !!rep.abandon, afk = !!rep.afk, dur = Math.max(0, +rep.durationMs || 0);
    if(forfeit && dur < CFG.FORFEIT_MIN_MS){ res.reason = "short"; return res; }
    const before = S.mmr; res.before = before; res.tierBefore = tierOf(before);
    const k = (S.games < CFG.PROV_GAMES ? CFG.K_PROV : CFG.K_BASE);
    let outcome = ["win", "loss", "draw"].includes(rep.outcome) ? rep.outcome : "loss", delta = 0, vs = "pve", S_, E_, humans = 0, w = 1, place = int(rep.place, 0, 0, 16), field = M.field;

    if(M.kind === "pve"){
      // Horda: tu ronda contra la «par» de tu rango (la ronda que se espera que alcances con ese rating).
      const round = int(rep.round, 0, 0, 1e5), par = CFG.HORDA_PAR0 + (before - CFG.START) * CFG.HORDA_PAR_PER_MMR;
      S_ = Math.max(0, Math.min(1, (round - par + CFG.HORDA_SPREAD) / (2 * CFG.HORDA_SPREAD)));
      delta = (S.games < CFG.PROV_GAMES ? CFG.HORDA_K * 1.5 : CFG.HORDA_K) * (2 * S_ - 1);
      if(round < CFG.HORDA_MIN_ROUND && !forfeit) delta = Math.min(delta, 0);
      outcome = delta > 0 ? "win" : delta < 0 ? "loss" : "draw";
      if(forfeit) delta = Math.min(delta, 0);
      if(afk) delta = Math.min(delta, 0);
    } else {
      field = Math.max(2, int(rep.field, M.field, 2, 8));
      let opps = Array.isArray(rep.opps) ? rep.opps.slice(0, field - 1) : [];
      while(opps.length < field - 1) opps.push({human: false});
      opps = opps.map(o => ({human: !!(o && o.human), mmr: o && o.human ? int(o.mmr, before, CFG.MIN, CFG.MAX) : CFG.BOT_MMR}));
      humans = opps.filter(o => o.human).length; vs = humans === 0 ? "bots" : humans === opps.length ? "humans" : "mixed";
      w = (humans + (opps.length - humans) * CFG.BOT_WEIGHT) / opps.length;
      if(forfeit){ outcome = "loss"; place = field; }
      // puntaje real: por puesto (con empates compartidos) o por resultado
      const tied = int(rep.tied, 1, 1, field);
      if(place >= 1 && field > 2 && !forfeit) S_ = Math.max(0, Math.min(1, (field - place - (tied - 1) / 2) / (field - 1)));
      else S_ = outcome === "win" ? 1 : outcome === "draw" ? 0.5 : 0;
      if(forfeit) S_ = 0;
      E_ = opps.reduce((a, o) => a + expected(before, o.mmr), 0) / opps.length;
      delta = k * w * (S_ - E_);
      if(place < 1 && field > 2) outcome = S_ > 0.5 ? "win" : S_ < 0.5 ? "loss" : "draw";
      if(place >= 1 && field > 2){ outcome = place === 1 && tied === 1 ? "win" : (place >= Math.ceil(field / 2) + 1 ? "loss" : "draw"); }
      if(forfeit) delta = Math.min(delta, 0) - (humans > 0 ? CFG.ABANDON_EXTRA : 0);
      if(afk && delta > 0) delta = 0;
    }
    delta = Math.round(delta);
    res.vs = vs; res.outcome = outcome;

    // Contra bots solos: techo, tope diario y «práctica» sin puntos.
    let reason = forfeit ? "abandon" : afk ? "afk" : "ok";
    if(M.kind === "pvp" && humans === 0){
      const day = dayKey(now); if(L.botDay.d !== day) L.botDay = {d: day, gain: 0};
      if(before >= CFG.BOT_CEIL){ delta = 0; reason = "ceiling"; }
      else if(delta > 0){
        const room = Math.max(0, Math.min(CFG.BOT_DAY_GAIN - L.botDay.gain, CFG.BOT_CEIL - before));
        if(room <= 0){ delta = 0; reason = "daycap"; } else { delta = Math.min(delta, room); L.botDay.gain += delta; }
      }
    }
    const counted = reason !== "ceiling" && reason !== "daycap";
    res.counted = counted; res.reason = reason; res.delta = counted ? delta : 0;
    if(counted){
      S.mmr = Math.max(CFG.MIN, Math.min(CFG.MAX, before + delta)); S.peak = Math.max(S.peak, S.mmr);
      S.games++; S.lastAt = now;
      if(outcome === "win"){ S.wins++; S.streak = S.streak > 0 ? S.streak + 1 : 1; }
      else if(outcome === "loss"){ S.losses++; S.streak = S.streak < 0 ? S.streak - 1 : -1; }
      else { S.draws++; S.streak = 0; }
      S.bestStreak = Math.max(S.bestStreak, S.streak);
      if(forfeit) S.abandons++;
    } else { S.practice.games++; if(outcome === "win") S.practice.wins++; }
    res.after = S.mmr; res.delta = S.mmr - before; res.tierAfter = tierOf(S.mmr);
    res.promoted = counted && rankKey(res.tierAfter) > rankKey(res.tierBefore);
    res.demoted = counted && rankKey(res.tierAfter) < rankKey(res.tierBefore);
    L.log.push({id, mode: rep.mode, at: now, outcome, place: place || 0, field: M.kind === "pve" ? 1 : field, vs, counted, reason, delta: res.delta, before, after: S.mmr, abandon: forfeit, afk, round: int(rep.round, 0, 0, 1e5), durationMs: int(dur, 0, 0, 1e9), synced: false});
    if(L.log.length > CFG.LOG_MAX) L.log.splice(0, L.log.length - CFG.LOG_MAX);
    return res;
  }
  function rankKey(t){ return t.index * 10 + (t.div ? 3 - ROMAN.indexOf(t.div) : 0); }

  // Texto para el jugador (resultados). `res` viene de record().
  function describe(res){
    if(!res) return "";
    const M = MODES[res.mode] || {name: ""};
    switch(res.reason){
      case "duplicate": return "";
      case "ineligible": return "Esta partida no cuenta para el rango.";
      case "short": return "Saliste enseguida: no se anota.";
      case "ceiling": return "Práctica: contra bots no se sube más de " + tierOf(CFG.BOT_CEIL).label + ". Para seguir, jugá contra personas.";
      case "daycap": return "Práctica: hoy ya sumaste el máximo contra bots (" + CFG.BOT_DAY_GAIN + ").";
    }
    const sign = res.delta > 0 ? "+" : res.delta < 0 ? "−" : "±", n = Math.abs(res.delta);
    let t = "RANGO " + M.name.toUpperCase() + " · " + res.tierAfter.label + " · " + res.after + " (" + sign + n + ")";
    if(res.promoted) t += " · ¡SUBISTE!"; else if(res.demoted) t += " · bajaste";
    if(res.reason === "abandon") t += " · abandono";
    if(res.reason === "afk") t += " · sin puntos por inactividad";
    if(res.vs === "bots") t += " · contra bots vale la mitad";
    return t;
  }
  // Datos para una tabla global futura: el informe de partida tal como lo anota el cliente (ver el contrato en CRYSTAL_WARS.md).
  function pendingReports(sv){ const L = ensure(sv); return L ? L.log.filter(e => !e.synced && e.id) : []; }
  function markSynced(sv, ids){ const L = ensure(sv); if(!L) return 0; let n = 0; for(const e of L.log) if(ids.includes(e.id) && !e.synced){ e.synced = true; n++; } return n; }
  function summary(sv){
    const L = ensure(sv); if(!L) return null;
    let best = null; for(const k of MODE_KEYS){ const S = L.modes[k]; if(S.games && (!best || S.mmr > L.modes[best].mmr)) best = k; }
    return best ? {mode: best, tier: tierOf(L.modes[best].mmr), mmr: L.modes[best].mmr} : {mode: null, tier: tierOf(CFG.START), mmr: CFG.START};
  }

  const API = {CFG, MODES, MODE_KEYS, TIERS, tierOf, expected, defaultState, normalize, ensure, record, describe, pendingReports, markSynced, summary, dayKey};
  root.Ladder = API;
  if(typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
