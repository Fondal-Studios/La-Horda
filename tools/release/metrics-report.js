#!/usr/bin/env node
"use strict";
// TABLERO SIMPLE DE MÉTRICAS (solo lectura): altas, retención aproximada, compras, conversión a pagador y ARPPU, más lo que mide la
// telemetría opt-in del juego (embudo del tutorial, partidas).
//   node tools/release/metrics-report.js [--env-file /etc/la-horda/la-horda.env] [--json] [--days 14] [--data-dir CARPETA]
// Lee la base Postgres (DATABASE_URL) o, si no hay, los archivos de DATA_DIR. NO escribe nada: en Postgres abre una transacción
// READ ONLY y solo hace SELECT; con archivos solo los lee. NO usa el servidor del juego (no crea tablas ni limpia sesiones).
// NO imprime nombres de usuario, correos ni contraseñas: solo cantidades.
//
// LÍMITES HONESTOS (leelos antes de decidir nada con estos números):
//  · "Retención" es APROXIMADA. El servidor no guarda un registro de los días en que jugó cada cuenta; solo la fecha de alta, el
//    último ingreso y la última vez que subió un guardado. Se usa "última actividad = el mayor de los dos". D1+ significa
//    "volvió a ser activo 24 h o más después del alta" (cuenta a quien volvió tarde también): es una cota ALTA del D1 clásico.
//    Con pocas cuentas (< 30 por cohorte) los porcentajes no significan nada: mirá los números absolutos.
//  · Los INVITADOS no existen en el servidor: nada de esto los cuenta. Solo ve cuentas.
//  · Los ingresos son a precio de LISTA en dólares (js/premium-packs.json), no lo cobrado en pesos ni neto de comisión de Mercado
//    Pago e impuestos. Los reembolsos/contracargos se restan si el libro los registró.
//  · "Pagador" = cuenta con al menos una compra acreditada por el webhook (libro de Brasas). Las Brasas regaladas por el panel de
//    administración NO cuentan como compra.
//  · La telemetría es opt-in y anónima (sin cuenta): sirve para el embudo del tutorial y las partidas, no para pagadores.
//  · Faltan eventos de tienda (tienda abierta, checkout iniciado): ver docs/commercial/CHECKLIST_ULTIMA_PRUEBA.md, sección "Métricas".
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "../..");
const argv = process.argv.slice(2);
const opt = n => { const i = argv.indexOf("--" + n); return i >= 0 ? argv[i + 1] : undefined; };
const flag = n => argv.includes("--" + n);
if(flag("help")){ console.log(fs.readFileSync(__filename, "utf8").split("\n").filter(l => l.startsWith("//")).map(l => l.slice(3)).join("\n")); process.exit(0); }

function parseEnvFile(file){
  const out = {};
  for(const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)){
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(raw); if(!m) continue;
    let v = m[2].trim(); if(/^(".*"|'.*')$/.test(v)) v = v.slice(1, -1); out[m[1]] = v;
  }
  return out;
}
let env = Object.assign({}, process.env);
if(opt("env-file")){ try{ env = Object.assign(env, parseEnvFile(opt("env-file"))); }catch(e){ console.error("No se pudo leer --env-file"); process.exit(2); } }

const DAY = 86400000, NOW = Date.now();
const days = Math.max(1, Math.min(120, parseInt(opt("days") || "14", 10) || 14));

/* ---------- lectura (solo lectura) ---------- */
async function readPostgres(url){
  let Client; try{ ({ Client } = require(path.join(ROOT, "server/node_modules/pg"))); }catch(e){ throw new Error("Falta el módulo pg: corré npm ci dentro de server/"); }
  const u = new URL(url); const mode = (u.searchParams.get("sslmode") || "").toLowerCase(); u.searchParams.delete("sslmode");
  let ssl;
  if(env.PGSSL === "0" || mode === "disable") ssl = false;
  else if(env.PGSSL === "1" || mode) ssl = { rejectUnauthorized: false };
  else ssl = (u.hostname.includes(".") && u.hostname !== "127.0.0.1") ? { rejectUnauthorized: false } : false;
  const c = new Client({ connectionString: u.toString(), ssl, connectionTimeoutMillis: 10000 });
  await c.connect();
  try{
    await c.query("BEGIN READ ONLY");
    const users = (await c.query("SELECT id, created_at, last_login, (email IS NOT NULL AND email <> '') AS has_email FROM horda_users")).rows
      .map(r => ({ id: String(r.id), createdAt: Number(r.created_at), lastLogin: Number(r.last_login || 0), hasEmail: !!r.has_email }));
    const saves = (await c.query("SELECT user_id, updated_at FROM horda_saves")).rows.map(r => ({ id: String(r.user_id), at: Number(r.updated_at) }));
    const ledger = (await c.query("SELECT user_id, delta, reason, ref, at FROM horda_wallet_ledger ORDER BY id")).rows
      .map(r => ({ id: String(r.user_id), delta: Number(r.delta), reason: String(r.reason || ""), ref: r.ref, at: Number(r.at) }));
    const ops = (await c.query("SELECT data FROM horda_operations WHERE id=1")).rows[0];
    await c.query("ROLLBACK");
    return { store: "postgres", users, saves, ledger, metrics: ops && ops.data && ops.data.metrics || null };
  } finally { await c.end().catch(() => {}); }
}
function readFiles(dir){
  const j = f => { try{ return JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); }catch(e){ return null; } };
  const acc = j("accounts.json"); if(!acc) throw new Error("No hay accounts.json en " + dir);
  const users = Object.values(acc.users || {}).map(u => ({ id: String(u.id), createdAt: +u.createdAt || 0, lastLogin: +u.lastLogin || 0, hasEmail: !!u.email }));
  const saves = [];
  try{ for(const f of fs.readdirSync(path.join(dir, "saves"))){ const s = j("saves/" + f); if(s) saves.push({ id: f.replace(/\.json$/, ""), at: +s.updatedAt || 0 }); } }catch(e){}
  const w = j("wallet.json") || { ledger: [] };
  const ledger = (w.ledger || []).map(e => ({ id: String(e.userId), delta: +e.delta, reason: String(e.reason || ""), ref: e.ref, at: +e.at }));
  const ops = j("operations.json");
  return { store: "archivos", users, saves, ledger, metrics: ops && ops.metrics || null };
}

/* ---------- cálculo ---------- */
const packs = (() => { try{ return Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, "server/premium-packs.json"), "utf8")).packs.map(p => [p.id, p])); }catch(e){ return {}; } })();
const pct = (a, b) => b ? Math.round(1000 * a / b) / 10 : null;
const median = a => { if(!a.length) return null; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const dayKey = t => new Date(t).toISOString().slice(0, 10);

function compute(d){
  const lastSave = new Map(); for(const s of d.saves) lastSave.set(s.id, Math.max(lastSave.get(s.id) || 0, s.at));
  const users = d.users.map(u => Object.assign({}, u, { lastActive: Math.max(u.lastLogin, lastSave.get(u.id) || 0, u.createdAt) }));
  const out = { generatedAt: new Date(NOW).toISOString(), store: d.store, accounts: { total: users.length, withEmail: users.filter(u => u.hasEmail).length } };
  // altas por día
  const reg = {}; for(const u of users) if(u.createdAt >= NOW - days * DAY){ const k = dayKey(u.createdAt); reg[k] = (reg[k] || 0) + 1; }
  out.signupsPerDay = reg; out.signupsLastDays = Object.values(reg).reduce((a, b) => a + b, 0); out.windowDays = days;
  out.signups = { last24h: users.filter(u => u.createdAt >= NOW - DAY).length, last7d: users.filter(u => u.createdAt >= NOW - 7 * DAY).length, last30d: users.filter(u => u.createdAt >= NOW - 30 * DAY).length };
  // activos (según última actividad)
  out.active = { last24h: users.filter(u => u.lastActive >= NOW - DAY).length, last7d: users.filter(u => u.lastActive >= NOW - 7 * DAY).length, last30d: users.filter(u => u.lastActive >= NOW - 30 * DAY).length };
  // retención aproximada "volvió ≥ N días después del alta"
  out.retention = {};
  for(const n of [1, 7, 30]){
    const cohort = users.filter(u => u.createdAt <= NOW - (n + 1) * DAY);   // el alta fue hace más de N+1 días: el día N ya terminó
    const back = cohort.filter(u => u.lastActive >= u.createdAt + n * DAY).length;
    out.retention["D" + n + "+"] = { cohort: cohort.length, returned: back, pct: pct(back, cohort.length), reliable: cohort.length >= 30 };
  }
  // compras
  const buys = d.ledger.filter(e => /^purchase:/.test(e.reason) && e.delta > 0 && /^(pay:|once:)/.test(String(e.ref || "")));
  const refunds = d.ledger.filter(e => /^reversal:(refunded|charged_back):/.test(e.reason));
  const priceOf = id => (packs[id] && packs[id].price && packs[id].price.currency === "USD") ? packs[id].price.amount : 0;
  const unknownPacks = new Set();
  const gross = buys.reduce((s, e) => { const id = e.reason.split(":")[1]; if(!priceOf(id)) unknownPacks.add(id); return s + priceOf(id); }, 0);
  const refunded = refunds.reduce((s, e) => { const id = e.reason.split(":")[2]; return s + priceOf(id); }, 0);
  const payersAll = new Set(buys.map(e => e.id));
  const refundedUsers = new Set(refunds.map(e => e.id));
  const byUser = new Map(); for(const e of buys) byUser.set(e.id, (byUser.get(e.id) || 0) + 1);
  const created = new Map(users.map(u => [u.id, u.createdAt]));
  const firstBuy = new Map(); for(const e of buys) if(!firstBuy.has(e.id) || e.at < firstBuy.get(e.id)) firstBuy.set(e.id, e.at);
  const days2first = [...firstBuy].map(([id, t]) => (t - (created.get(id) || t)) / DAY).filter(x => x >= 0);
  const net = Math.max(0, gross - refunded);
  const payers30 = new Set(buys.filter(e => e.at >= NOW - 30 * DAY).map(e => e.id));
  const gross30 = buys.filter(e => e.at >= NOW - 30 * DAY).reduce((s, e) => s + priceOf(e.reason.split(":")[1]), 0);
  out.purchases = {
    count: buys.length, payers: payersAll.size, repeatPayers: [...byUser.values()].filter(n => n > 1).length,
    refundsOrChargebacks: refunds.length, usersWithRefund: refundedUsers.size,
    revenueUsdList: { gross: Math.round(gross * 100) / 100, refunded: Math.round(refunded * 100) / 100, net: Math.round(net * 100) / 100 },
    last30d: { purchases: buys.filter(e => e.at >= NOW - 30 * DAY).length, payers: payers30.size, revenueUsdList: Math.round(gross30 * 100) / 100 },
    medianDaysToFirstPurchase: median(days2first),
    byPack: Object.fromEntries([...buys.reduce((m, e) => { const id = e.reason.split(":")[1]; m.set(id, (m.get(id) || 0) + 1); return m; }, new Map())].sort((a, b) => b[1] - a[1])),
    packsWithoutUsdPrice: [...unknownPacks]
  };
  out.conversion = {
    payersPerAccount: pct(payersAll.size, users.length),
    payersPerActive30d: pct(payers30.size, out.active.last30d),
    arppuUsdList: payersAll.size ? Math.round(100 * net / payersAll.size) / 100 : null,
    arpuUsdList30d: out.active.last30d ? Math.round(100 * gross30 / out.active.last30d) / 100 : null,
    refundRatePct: pct(refunds.length, buys.length)
  };
  // telemetría opt-in
  const m = d.metrics;
  if(m && m.total){
    const T = m.total, tot = k => T[k] || 0;
    const last7 = {}; const ds = Object.keys(m.days || {}).sort().slice(-7); for(const k of ds) for(const [ev, n] of Object.entries(m.days[k])) last7[ev] = (last7[ev] || 0) + n;
    out.telemetry = { optInNote: "eventos anónimos, solo de quienes no apagaron la telemetría; no se pueden cruzar con cuentas",
      total: { start: tot("start"), tutorial_started: tot("tutorial_started"), tutorial_completed: tot("tutorial_completed"), arena_started: tot("arena_started"), victory: tot("victory"), death: tot("death"), abandon: tot("abandon") },
      last7days: Object.fromEntries(["start", "tutorial_started", "tutorial_completed", "arena_started", "victory", "death", "abandon"].map(k => [k, last7[k] || 0])),
      tutorialCompletionPct: pct(tot("tutorial_completed"), tot("tutorial_started")),
      winPctOfFinishedRuns: pct(tot("victory"), tot("victory") + tot("death") + tot("abandon")),
      avgRunSeconds: T.durationSamples ? Math.round(T.durationMs / T.durationSamples / 1000) : null,
      eventsMissingForFunnel: ["shop_opened", "checkout_started", "champion_selected (no sale al servidor)"] };
  } else out.telemetry = null;
  return out;
}

/* ---------- salida ---------- */
(async () => {
  let data;
  try{
    const url = (env.DATABASE_URL || "").trim();
    if(url) data = await readPostgres(url);
    else { const dir = opt("data-dir") || env.DATA_DIR || path.join(ROOT, "server/data"); data = readFiles(dir); }
  }catch(e){ console.error("No se pudieron leer los datos: " + String(e.message || e).replace(/postgres(ql)?:\/\/\S+/g, "<dirección oculta>")); process.exit(1); }
  const r = compute(data);
  if(flag("json")){ console.log(JSON.stringify(r, null, 2)); return; }
  const f = v => v == null ? "n/d" : String(v), p = v => v == null ? "n/d" : v + "%";
  console.log(`\nLA HORDA · MÉTRICAS (solo lectura) · ${r.generatedAt.slice(0, 16).replace("T", " ")} UTC · fuente: ${r.store}`);
  console.log(`\n== Cuentas ==\n  total ${r.accounts.total} (con correo: ${r.accounts.withEmail})\n  altas: 24 h ${r.signups.last24h} · 7 d ${r.signups.last7d} · 30 d ${r.signups.last30d}\n  activas (por última actividad): 24 h ${r.active.last24h} · 7 d ${r.active.last7d} · 30 d ${r.active.last30d}`);
  const sp = Object.entries(r.signupsPerDay).sort(); if(sp.length) console.log(`  altas por día (últimos ${r.windowDays}):  ` + sp.map(([k, n]) => `${k.slice(5)}:${n}`).join("  "));
  console.log(`\n== Retención APROXIMADA (volvió N días o más después del alta) ==`);
  for(const [k, v] of Object.entries(r.retention)) console.log(`  ${k.padEnd(4)} ${String(v.returned).padStart(4)} de ${String(v.cohort).padEnd(4)} = ${p(v.pct)}${v.reliable ? "" : "   (cohorte chica: no significa nada todavía)"}`);
  console.log(`  OJO: no hay registro de días jugados; es una cota alta del D1/D7 clásico. Invitados no cuentan.`);
  const q = r.purchases, c = r.conversion;
  console.log(`\n== Compras (libro de Brasas, acreditadas por el webhook) ==\n  compras ${q.count} · pagadores ${q.payers} (repiten: ${q.repeatPayers}) · reembolsos/contracargos ${q.refundsOrChargebacks}\n  ingreso a precio de lista (USD): bruto ${q.revenueUsdList.gross} · devuelto ${q.revenueUsdList.refunded} · neto ${q.revenueUsdList.net}\n  últimos 30 d: ${q.last30d.purchases} compras, ${q.last30d.payers} pagadores, USD ${q.last30d.revenueUsdList}\n  mediana de días del alta a la primera compra: ${f(q.medianDaysToFirstPurchase)}`);
  if(Object.keys(q.byPack).length) console.log("  por paquete: " + Object.entries(q.byPack).map(([k, n]) => `${k} ×${n}`).join(" · "));
  if(q.packsWithoutUsdPrice.length) console.log("  AVISO: paquetes sin precio en USD en premium-packs.json (no suman ingreso): " + q.packsWithoutUsdPrice.join(", "));
  console.log(`\n== Conversión y ARPPU ==\n  pagadores / cuentas: ${p(c.payersPerAccount)} · pagadores / activas 30 d: ${p(c.payersPerActive30d)}\n  ARPPU (neto, USD de lista): ${f(c.arppuUsdList)} · ARPU 30 d: ${f(c.arpuUsdList30d)} · tasa de devolución: ${p(c.refundRatePct)}`);
  console.log(`  OJO: es a precio de lista; no es lo cobrado en pesos ni neto de comisión e impuestos. Umbrales de decisión: docs/commercial/SALIDA_AL_MERCADO.md §6.`);
  if(r.telemetry){ const t = r.telemetry;
    console.log(`\n== Telemetría opt-in (anónima, no se cruza con cuentas) ==\n  totales: ${Object.entries(t.total).map(([k, n]) => `${k} ${n}`).join(" · ")}\n  últimos 7 días: ${Object.entries(t.last7days).map(([k, n]) => `${k} ${n}`).join(" · ")}\n  tutorial completado: ${p(t.tutorialCompletionPct)} · victorias sobre partidas terminadas: ${p(t.winPctOfFinishedRuns)} · duración media: ${f(t.avgRunSeconds)} s\n  FALTAN para el embudo de tienda: ${t.eventsMissingForFunnel.join(", ")}`);
  } else console.log("\n== Telemetría ==\n  sin datos (nadie la envió todavía, o la tabla de operaciones está vacía)");
  console.log("");
})();
