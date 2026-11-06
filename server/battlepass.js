"use strict";
/* ============================================================
   server/battlepass.js — PASE DE BATALLA (beta). Temporadas de 30 días, ruta GRATIS y ruta PREMIUM.
   Reglas (docs/economy/BRASAS_SOLO_COSMETICOS.md):
   · El XP del pase SOLO lo otorga el servidor al cerrar una partida verificada (hook `afterRun`, llamado por item-economy
     al terminar `run.finish`): el cliente nunca pide XP.
   · Las Brasas ✦ solo salen de este pase como recompensa (ruta premium), vía wallet con `ref` único => un doble clic, un
     reintento o una reconexión NO duplican entrega ni cargo. Nada de lo que da el pase es poder: oro, cosméticos y Brasas.
   · Los cosméticos ganados quedan en `account.cosmetics` PARA SIEMPRE (derechos adquiridos): al cambiar de temporada se
     reinician XP, progreso y ruta premium, nunca lo ya reclamado.
   · Precio, tabla de recompensas y arte de los cosméticos son CONFIGURACIÓN PROVISORIA (pendiente de decisión del socio y
     de producción de arte): ver PASS_PRICE_BRASAS y REWARDS.
   Estado: root.battlePass = { accounts: { [userId]: {...} } } dentro del documento atómico de gmUpdate (archivo o Postgres).
   ============================================================ */
const DAY = 86400000;
const EPOCH = Date.UTC(2026, 10, 1);          // inicio de la temporada 1 (1 nov 2026, UTC)
const SEASON_DAYS = 30, TIERS = 30, XP_PER_TIER = 1000;
const PASS_PRICE_BRASAS = 950;                // PROVISORIO: lo define el socio
const DAILY_RUN_XP_CAP = 2400;                // tope diario de XP por partidas (anti-granja)
const MAX_RUN_XP = 400;

// Recompensas por nivel. free: {gold} o {cosmetic}; premium: {brasas} o {cosmetic}. Los ids `bp:` son entradas de catálogo a vincular con arte aprobado.
const REWARDS = { free: {}, premium: {} };
for(let t = 1; t <= TIERS; t++){
  REWARDS.free[t] = t % 10 === 0 ? { cosmetic: "bp:marco_s{S}_" + t } : { gold: 250 + 50 * t };
  if(t % 5 === 0) REWARDS.premium[t] = { brasas: t === 30 ? 100 : 30 };
  else if(t % 5 === 3) REWARDS.premium[t] = { cosmetic: "bp:" + ["skin", "alas", "efecto", "aura", "skin", "alas"][Math.floor(t / 5)] + "_s{S}_" + t };
}
const CHALLENGES = [
  { id: "horda_5_partidas", mode: "Horda Infinita", metric: "endless_runs", target: 5, xp: 400, text: "Jugá 5 partidas de Horda Infinita" },
  { id: "horda_ronda_10", mode: "Horda Infinita", metric: "endless_best", target: 10, xp: 600, text: "Sobreviví hasta la ronda 10 en la Horda Infinita" },
  { id: "horda_ronda_25", mode: "Horda Infinita", metric: "endless_best", target: 25, xp: 1000, text: "Sobreviví hasta la ronda 25 en la Horda Infinita" },
  { id: "campana_3_victorias", mode: "Campaña", metric: "campaign_wins", target: 3, xp: 500, text: "Ganá 3 partidas de Campaña" },
  { id: "campana_10_partidas", mode: "Campaña", metric: "campaign_runs", target: 10, xp: 400, text: "Jugá 10 partidas de Campaña" }
];

function fail(code, status, msg){ const e = new Error(code); e.status = status || 400; e.human = msg || code; throw e; }
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
function seasonOf(now){
  const n = Math.max(0, Math.floor((now - EPOCH) / (SEASON_DAYS * DAY)));
  const start = EPOCH + n * SEASON_DAYS * DAY;
  return { id: n + 1, start, end: start + SEASON_DAYS * DAY };
}
const reward = (track, tier, S) => { const r = REWARDS[track][tier]; if(!r) return null; const o = {}; for(const k in r) o[k] = typeof r[k] === "string" ? r[k].replace("{S}", S) : r[k]; return o; };
function root(raw){ const r = raw || require("./game-master").stateOf(null); if(!r.battlePass) r.battlePass = { accounts: {} }; return r; }
function acct(r, uid, now){
  const S = seasonOf(now), a = r.battlePass.accounts[uid] || (r.battlePass.accounts[uid] = { season: S.id, xp: 0, premium: false, claimed: {}, cosmetics: [], runs: {}, prog: {}, doneCh: {}, day: 0, dayXp: 0 });
  if(a.season !== S.id){   // temporada nueva: se reinicia el progreso; los cosméticos ya ganados se conservan
    a.season = S.id; a.xp = 0; a.premium = false; a.claimed = {}; a.runs = {}; a.prog = {}; a.doneCh = {}; a.day = 0; a.dayXp = 0;
  }
  return a;
}
const tierOf = xp => Math.min(TIERS, Math.floor(xp / XP_PER_TIER));
function addXp(a, amount, now, capped){
  amount = Math.max(0, Math.floor(amount));
  if(capped){
    const d = Math.floor(now / DAY); if(a.day !== d){ a.day = d; a.dayXp = 0; }
    amount = Math.max(0, Math.min(amount, DAILY_RUN_XP_CAP - a.dayXp)); a.dayXp += amount;
  }
  a.xp = Math.min(TIERS * XP_PER_TIER, a.xp + amount);
  return amount;
}
function metric(a, m, v, how){ a.prog[m] = how === "max" ? Math.max(a.prog[m] || 0, v) : (a.prog[m] || 0) + v; }
function checkChallenges(a, now){
  for(const c of CHALLENGES) if(!a.doneCh[c.id] && (a.prog[c.metric] || 0) >= c.target){ a.doneCh[c.id] = now; addXp(a, c.xp, now, false); }
}
// Hook de item-economy al cerrar una partida verificada por el servidor. Idempotente por id de partida.
function afterRun(r, uid, run, args, now){
  if(!run || !run.id || !run.done) return null;
  const a = acct(r, String(uid), now);
  if(own(a.runs, run.id)) return a.runs[run.id];
  let xp = 0;
  if(run.mode === "endless"){
    const surv = Math.max(0, Math.min(400, Math.floor(args && args.survived !== undefined ? args.survived : Math.max(0, (run.round || 1) - 1))));
    xp = Math.min(MAX_RUN_XP, 25 + 15 * surv);
    metric(a, "endless_runs", 1); metric(a, "endless_best", surv, "max");
  } else {
    const won = !!(args && args.victory);
    xp = won ? 200 : 40; metric(a, "campaign_runs", 1); if(won) metric(a, "campaign_wins", 1);
  }
  const gained = addXp(a, xp, now, true);
  checkChallenges(a, now);
  if(Object.keys(a.runs).length > 500){ for(const k of Object.keys(a.runs).slice(0, 100)) delete a.runs[k]; }
  return (a.runs[run.id] = { xp: gained });
}
function view(r, uid, now){
  const S = seasonOf(now), a = acct(r, String(uid), now);
  return {
    season: { id: S.id, start: S.start, end: S.end, daysLeft: Math.max(0, Math.ceil((S.end - now) / DAY)), days: SEASON_DAYS },
    tiers: TIERS, xpPerTier: XP_PER_TIER, xp: a.xp, tier: tierOf(a.xp), premium: !!a.premium, pricePremiumBrasas: PASS_PRICE_BRASAS,
    claimed: Object.keys(a.claimed), cosmetics: a.cosmetics.slice(),
    track: Array.from({ length: TIERS }, (_, i) => ({ tier: i + 1, free: reward("free", i + 1, S.id), premium: reward("premium", i + 1, S.id) })),
    challenges: CHALLENGES.map(c => ({ id: c.id, mode: c.mode, text: c.text, target: c.target, progress: Math.min(c.target, a.prog[c.metric] || 0), done: !!a.doneCh[c.id], xp: c.xp }))
  };
}
function routes(ctx){
  const { getStore, auth, send, err, readBody, now } = ctx, result = {};
  const store = () => { const s = getStore(); if(!s || !s.gmUpdate || !s.walletApply) fail("BATTLEPASS_DOWN", 503); return s; };
  function route(method, url, fn){
    result[method + " " + url] = async (req, res) => {
      try{
        const a = await auth(req); if(!a.user) fail("NO_SESSION", 401);
        const body = method === "GET" ? {} : await readBody(req, 4096);
        send(req, res, 200, await fn(a.user, body, now()));
      }catch(e){ if(e.status) return err(req, res, e.status, e.message, e.human || e.message); throw e; }
    };
  }
  const reqId = b => { if(typeof b.requestId !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(b.requestId)) fail("BAD_REQUEST_ID", 400, "Falta requestId."); return b.requestId; };
  route("GET", "/api/battlepass", (u, b, t) => store().gmUpdate(async raw => { const r = root(raw); return { state: r, value: view(r, u.id, t) }; }));
  // Comprar la ruta premium con Brasas (cargo idempotente por usuario+temporada).
  route("POST", "/api/battlepass/premium", async (u, b, t) => {
    reqId(b); const S = seasonOf(t), ref = "bp-buy:" + S.id + ":" + u.id, st = store();
    const cur = await st.gmUpdate(async raw => { const r = root(raw); return { state: r, value: !!acct(r, String(u.id), t).premium }; });
    if(!cur){
      const debit = await st.walletApply({ userId: u.id, delta: -PASS_PRICE_BRASAS, reason: "bp-premium:" + S.id, ref, actor: u.id, at: t });
      if(debit.insufficient) fail("INSUFFICIENT_FUNDS", 402, "No tenés Brasas suficientes.");
      await st.gmUpdate(async raw => { const r = root(raw); acct(r, String(u.id), t).premium = true; return { state: r, value: true }; });  // si el cargo ya existía (duplicate) igual se asegura la bandera
    }
    return st.gmUpdate(async raw => { const r = root(raw); return { state: r, value: view(r, u.id, t) }; });
  });
  // Reclamar un nivel. Idempotente: cada (temporada, usuario, ruta, nivel) se entrega UNA vez (ref único en el wallet para las Brasas).
  route("POST", "/api/battlepass/claim", async (u, b, t) => {
    reqId(b);
    const tier = Number(b.tier), track = b.track;
    if(!Number.isInteger(tier) || tier < 1 || tier > TIERS) fail("BAD_TIER", 400);
    if(track !== "free" && track !== "premium") fail("BAD_TRACK", 400);
    const st = store(), S = seasonOf(t), key = track + ":" + tier;
    const plan = await st.gmUpdate(async raw => {
      const r = root(raw), a = acct(r, String(u.id), t);
      if(tierOf(a.xp) < tier) fail("TIER_LOCKED", 409, "Todavía no llegaste a ese nivel.");
      if(track === "premium" && !a.premium) fail("PREMIUM_REQUIRED", 403, "Necesitás la ruta premium.");
      const rw = reward(track, tier, S.id); if(!rw) fail("NO_REWARD", 404, "Ese nivel no tiene recompensa en esa ruta.");
      return { state: r, value: { rw, already: !!a.claimed[key] } };
    });
    if(plan.rw.brasas){   // Brasas: ref único => aunque se repita el pedido o falle a mitad de camino, se acredita una sola vez
      await st.walletApply({ userId: u.id, delta: plan.rw.brasas, reason: "bp-reward:" + S.id + ":" + key, ref: "bp-claim:" + S.id + ":" + u.id + ":" + key, actor: null, at: t });
    }
    return st.gmUpdate(async raw => {
      const r = root(raw), a = acct(r, String(u.id), t);
      if(!a.claimed[key]){
        a.claimed[key] = t;
        if(plan.rw.cosmetic && !a.cosmetics.includes(plan.rw.cosmetic)) a.cosmetics.push(plan.rw.cosmetic);
        // oro de la ruta gratis: se acredita en la cuenta de economía en la MISMA transacción atómica (una sola vez por nivel)
        if(plan.rw.gold){
          const ea = r.itemEconomy && r.itemEconomy.accounts && r.itemEconomy.accounts[String(u.id)];
          if(ea) ea.gold = Math.min(1e9, (ea.gold || 0) + plan.rw.gold); else a.goldOwed = (a.goldOwed || 0) + plan.rw.gold;   // sin cuenta de economía todavía: queda como deuda registrada
        }
      }
      return { state: r, value: Object.assign(view(r, u.id, t), { granted: plan.already ? null : plan.rw, duplicate: plan.already }) };
    });
  });
  return result;
}
module.exports = { routes, afterRun, seasonOf, view, root, acct, REWARDS, CHALLENGES, TIERS, XP_PER_TIER, PASS_PRICE_BRASAS, DAILY_RUN_XP_CAP, tierOf };
