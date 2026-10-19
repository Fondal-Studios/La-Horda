// MODELO DE RITMO (herramienta de desarrollo): nivel del guardián partida a partida a lo largo de Normal -> Pesadilla -> Infierno,
// con el código REAL de js/systems/progression.js (xpToNext, victoryXpFor) y js/systems/difficulty-tiers.js cargados en Node (vm),
// y la XP / oro de bajas MEDIDOS con tools/balance/campaign_runs.js (RUNS=normal.jsonl,pes.jsonl,inf.jsonl; TIER=... LVL=... por dificultad).
//   RUNS=a.jsonl,b.jsonl [SCORE=80] [TRIES=1.4] [FAILFRAC=0.5] [WINS_EXTRA=40] node tools/balance/coherencia_model.js
// Supuestos (todos declarados y configurables por entorno):
//   - SCORE: puntaje de la victoria (0-100) que fija la XP de victoria; las partidas del piloto dieron 89-100, una persona suele estar en 60-85.
//   - TRIES: intentos por arena (1 = gana a la primera; 2 = una derrota antes). La derrota paga FAILFRAC de la XP/oro de bajas de una partida completa
//     (las 3 primeras derrotas de cada arena no se castigan: progression.js FAIL_FORGIVE_FIRST).
//   - XP de bajas a otro nivel: se escala con el multiplicador de XP por nivel de grupo (setupRunDifficulty: 1 + 0,022 por nivel de promedio, tope 2,5)
//     respecto del nivel con que se midió. El número de bajas se supone igual (no depende del nivel).
//   - Si falta la medición de una (dificultad, arena) se interpola con el cociente de la más cercana medida.
const fs = require('fs'); const path = require('path'); const vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const ctx = { console, location: { search: '' }, window: { addEventListener() {} }, URLSearchParams, Math };
vm.createContext(ctx);
for (const f of ['js/data/arenas.js', 'js/systems/progression.js', 'js/systems/difficulty.js', 'js/systems/difficulty-tiers.js']) {
  try { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }); } catch (e) { if (!/is not defined/.test(e.message)) throw e; }
}
const G = k => vm.runInContext(`typeof ${k}!=="undefined" ? ${k} : undefined`, ctx);
const xpToNext = G('xpToNext'), victoryXpFor = G('victoryXpFor'), ORDER = G('CAMPAIGN_ORDER'), TIERS = G('DIFF_TIER_ORDER'), DT = G('DIFF_TIERS');
const SCORE = +(process.env.SCORE || 80), TRIES = +(process.env.TRIES || 1.4), FAILFRAC = +(process.env.FAILFRAC || 0.5);
const runs = {};
if (process.env.RUNS) for (const f of process.env.RUNS.split(',')) for (const l of fs.readFileSync(f, 'utf8').split('\n')) { try { const r = JSON.parse(l.trim()); if (r.arena && r.killXp !== undefined && r.state === 'victory') (runs[(r.tier || 'normal') + ':' + r.arena] = runs[(r.tier || 'normal') + ':' + r.arena] || []).push(r); } catch (e) {} }
// multiplicador de oro con que se MIDIERON las partidas de tools/balance/campaign_runs.js (si DIFF_TIERS.gold cambia después, el modelo reescala)
const GOLD_MEASURED = { normal: 1, pesadilla: 1.5, infierno: 2 };
const goldFix = tier => DT[tier].gold / (GOLD_MEASURED[tier] || 1);
const lvXp = L => 1 + Math.min(1.5, Math.max(0, L - 1) * 0.022);
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
// XP y oro de bajas (por partida completa) a nivel L en (tier, arena)
function killAt(tier, arena, L) {
  const rs = runs[tier + ':' + arena];
  if (rs && rs.length) { return { xp: mean(rs.map(r => r.killXp * lvXp(L) / lvXp(r.lvl))), gold: mean(rs.map(r => r.goldFight)) * goldFix(tier), n: rs.length }; }
  // sin medición: interpolación lineal por posición en la campaña entre las arenas medidas de la MISMA dificultad (XP normalizada por nivel);
  // si no hay ninguna medida de esa dificultad, la de Normal por el cociente medio de las dificultades medidas (XP) y por el multiplicador de oro.
  const idx = ORDER.indexOf(arena), have = ORDER.map((a, i) => ({ i, rs: runs[tier + ':' + a] })).filter(x => x.rs && x.rs.length);
  const norm = x => ({ xp: mean(x.rs.map(r => r.killXp / lvXp(r.lvl))), gold: mean(x.rs.map(r => r.goldFight)) * goldFix(tier) });
  if (have.length) {
    const lo = have.filter(x => x.i < idx).pop(), hi = have.find(x => x.i > idx);
    let q;
    if (lo && hi) { const a = norm(lo), b = norm(hi), t = (idx - lo.i) / (hi.i - lo.i); q = { xp: a.xp + (b.xp - a.xp) * t, gold: a.gold + (b.gold - a.gold) * t }; }
    else q = norm(lo || hi);
    return { xp: q.xp * lvXp(L), gold: q.gold, n: 0, est: true };
  }
  const base = runs['normal:' + arena];
  if (base) return { xp: mean(base.map(r => r.killXp * lvXp(L) / lvXp(r.lvl))) * (process.env.TIER_XP_RATIO ? +process.env.TIER_XP_RATIO : DT[tier].xp * 2), gold: mean(base.map(r => r.goldFight)) * DT[tier].gold, n: 0, est: true };
  return null;
}
function career(opts) {
  opts = opts || {}; const tries = opts.tries || TRIES, score = opts.score || SCORE;
  let L = 1, xp = 0, games = 0, wins = 0, gold = 0; const rows = [];
  const grant = a => { xp += a; while (L < 99 && xp >= xpToNext(L)) { xp -= xpToNext(L); L++; } };
  const frac = () => L + xp / xpToNext(L);
  const result = { rows, reach: {} };
  for (const tier of TIERS) for (const arena of ORDER) {
    const k = killAt(tier, arena, L); if (!k) { rows.push({ tier, arena, missing: true }); continue; }
    const L0 = L, exp = (G('DIFF').arenaLevel[arena] || 1) + DT[tier].lvlOffset;
    const fails = Math.max(0, tries - 1);
    for (let i = 0; i < Math.floor(fails); i++) { const kk = killAt(tier, arena, L); grant(kk.xp * FAILFRAC); gold += kk.gold * FAILFRAC; games++; }
    const fr = fails - Math.floor(fails); if (fr > 0) { const kk = killAt(tier, arena, L); grant(kk.xp * FAILFRAC * fr); gold += kk.gold * FAILFRAC * fr; games += fr; }
    const kw = killAt(tier, arena, L); grant(kw.xp); const vx = victoryXpFor(arena, score, L, tier); grant(vx);
    gold += kw.gold + 80 * DT[tier].gold; games++; wins++;
    rows.push({ tier, arena, entra: L0, exp, brecha: +(L0 - exp).toFixed(1), sale: +frac().toFixed(1), killXp: Math.round(kw.xp), victoriaXp: vx, gold: Math.round(kw.gold + 80 * DT[tier].gold), partidas: +games.toFixed(1), victorias: wins, est: !!kw.est });
    for (const [name, lv] of [['talentos40', 40], ['maestria90', 90]]) if (result.reach[name] === undefined && frac() >= lv) result.reach[name] = { tier, arena, partidas: +games.toFixed(1), victorias: wins };
  }
  // después: farmear la última arena de la última dificultad abierta (para el nivel 90 si la campaña no alcanzó)
  result.final = { L, partidas: +games.toFixed(1), victorias: wins, gold: Math.round(gold) };
  return result;
}
module.exports = { career, killAt, runs };
if (require.main === module) {
  const json = process.env.JSON;
  for (const tries of (process.env.TRIES_LIST || String(TRIES)).split(',').map(Number)) {
    const r = career({ tries });
    console.log(`\n== intentos por arena ${tries} · puntaje ${SCORE} · derrota paga ${FAILFRAC} de las bajas ==`);
    for (const x of r.rows) console.log(x.missing ? `${x.tier} ${x.arena}: SIN DATO` : `${x.tier.padEnd(9)} ${x.arena.padEnd(10)} entra nv.${String(x.entra).padStart(2)} (esperado ${String(x.exp).padStart(2)}, brecha ${String(x.brecha).padStart(5)}) -> sale ${String(x.sale).padStart(5)}  bajas ${String(x.killXp).padStart(6)} XP  victoria ${String(x.victoriaXp).padStart(6)} XP  oro ${String(x.gold).padStart(5)}  partida ${x.partidas}${x.est ? '  (estimado)' : ''}`);
    console.log('hitos:', JSON.stringify(r.reach), '· final:', JSON.stringify(r.final));
    if (json) fs.writeFileSync(json, JSON.stringify(r, null, 1));
  }
}
