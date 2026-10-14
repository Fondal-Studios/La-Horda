"use strict";
/* ============================================================
   LA HORDA — CLANES (API HTTP en el MISMO servidor de cuentas)

   Qué hace: crear / buscar / unirse (abierto o por solicitud) / salir / expulsar, roles (líder, oficial, miembro),
   tope de miembros, descripción, puntos de clan, tabla de clanes y el parte de resultado de la
   «Conquista del Castillo» contra bots (ver docs/modes/CLANES.md).

   Almacenamiento: UN documento JSON por servidor, guardado con el mismo adaptador de cuentas
     - archivo: clans.json en DATA_DIR (escritura atómica, en fila);
     - Postgres: tabla horda_clans (fila única, JSONB) leída con SELECT … FOR UPDATE dentro de una transacción.
   Todas las escrituras pasan por store.clanUpdate(fn): se ejecutan de a una, así que "nombre único", "tope de
   miembros" y "un solo clan por cuenta" no tienen carreras. Es simple y correcto, no está pensado para cientos de
   miles de clanes (tope CLAN_MAX_CLANS, 5000 por defecto): a esa escala hace falta una tabla por entidad.

   Seguridad:
   - Todo lo que cambia algo exige sesión (la misma de /api/save). Los permisos se deciden en el servidor con el rol
     guardado, nunca con lo que diga el cliente. Se identifica a los miembros con un número propio del clan (mid),
     no con el usuario de login.
   - Entrada estricta: tipos, largos, listas cerradas; ids solo dígitos; las claves de los mapas se consultan con
     hasOwnProperty (nada de "__proto__" ni "constructor").
   - Límites de frecuencia por cuenta (acciones, creación de clanes, búsquedas) y por IP; enfriamiento al salir.
   - El nombre y la etiqueta pasan por server/clan-names.js (filtro básico, unicidad por "esqueleto").

   LÍMITE HONESTO: el resultado de una partida contra bots lo informa el CLIENTE y puede falsificarse. Acá solo hay
   validaciones de plausibilidad y topes (por partida, por cuenta y por clan por día); NO es antitrampa. Los puntos de
   clan son sociales/cosméticos y no dan poder en el juego.
   ============================================================ */
const names = require("./clan-names");

const MAX_MEMBERS = Math.max(2, parseInt(process.env.CLAN_MAX_MEMBERS || "30", 10) || 30);
const MAX_OFFICERS = 5, MAX_REQUESTS = 20, MAX_USER_REQUESTS = 3;
const MAX_CLANS = Math.max(10, parseInt(process.env.CLAN_MAX_CLANS || "5000", 10) || 5000);
const REQUEST_TTL_MS = 3 * 24 * 3600 * 1000;
const COOLDOWN_MS = parseInt(process.env.CLAN_COOLDOWN_MS || String(5 * 60 * 1000), 10);     // tras salir o ser expulsado
const ACT_WINDOW_MS = 5 * 60 * 1000, ACT_MAX = Math.max(5, parseInt(process.env.CLAN_ACT_MAX || "25", 10) || 25);                                          // acciones por cuenta cada 5 min
const CREATE_WINDOW_MS = 24 * 3600 * 1000, CREATE_MAX_USER = 2, CREATE_MAX_IP = 6;          // clanes creados por día
const LIST_WINDOW_MS = 60 * 1000, LIST_MAX_IP = 90;
const LIST_MAX = 50, HISTORY_MAX = 10;
// parte de la Conquista del Castillo (contra bots)
const WAR = {
  MODES: ["castle"], ROLES: ["attack", "defend"], RESULTS: ["win", "loss"], OPPONENTS: ["bots"], TIERS: [1, 2, 3],
  MIN_MS: 120000, MAX_MS: 20 * 60000,           // una partida válida dura entre 2 y 20 minutos
  USER_DAILY_MAX: 8,                            // partidas que cuentan por cuenta y día (UTC)
  CLAN_DAILY_GAIN_MAX: 400,                     // puntos que un clan puede SUMAR por día (las restas no tienen tope)
  GAP_SLACK_MS: 120000,                         // una partida tiene que caber en el tiempo desde el parte anterior de esa cuenta
  POINTS: { 1: { win: 12, loss: -3 }, 2: { win: 20, loss: -5 }, 3: { win: 30, loss: -8 } },
  MATCH_ID_RE: /^[A-Za-z0-9_-]{16,64}$/,
  MIN_ARENAS: Math.max(0, parseInt(process.env.CLAN_WAR_MIN_ARENAS || "0", 10) || 0), // opcional: arenas de campaña completadas (según el guardado en la nube)
  BUILD_RE: /^[A-Za-z0-9._-]{1,24}$/
};
const STAT_KEYS = { gates: 3, towers: 6, heartPct: 100, heroKills: 99, heroDeaths: 99, minionKills: 3000, seconds: 1200 };

const own = (o, k) => !!o && Object.prototype.hasOwnProperty.call(o, k);
const ID_RE = /^\d{1,9}$/;
const dayKey = t => new Date(t).toISOString().slice(0, 10);

/* ---------------- estado ---------------- */
function fresh(){ return { v: 1, nextClanId: 1, clans: {}, byUser: {}, names: {}, tags: {}, reports: {}, userDay: {}, lastReport: {}, cool: {}, reqIdx: {} }; }
function norm(st){
  const s = st && typeof st === "object" ? st : fresh();
  for(const k of ["clans", "byUser", "names", "tags", "reports", "userDay", "lastReport", "cool", "reqIdx"]) if(!s[k] || typeof s[k] !== "object") s[k] = {};
  if(!Number.isInteger(s.nextClanId) || s.nextClanId < 1) s.nextClanId = 1;
  return s;
}
function prune(st, now){
  const rk = Object.keys(st.reports);
  if(rk.length > 4000) for(const k of rk) if(now - st.reports[k].at > 14 * 24 * 3600 * 1000) delete st.reports[k];
  const today = dayKey(now);
  for(const k of Object.keys(st.userDay)) if(st.userDay[k].day !== today) delete st.userDay[k];
  for(const k of Object.keys(st.cool)) if(st.cool[k] <= now) delete st.cool[k];
  for(const k of Object.keys(st.lastReport)) if(now - st.lastReport[k] > 2 * 24 * 3600 * 1000) delete st.lastReport[k];
}
function pruneRequests(st, clan, now){
  for(const uid of Object.keys(clan.requests)) if(now - clan.requests[uid].at > REQUEST_TTL_MS) dropRequest(st, clan, uid);
}
function dropRequest(st, clan, uid){
  delete clan.requests[uid];
  if(own(st.reqIdx, uid)){ st.reqIdx[uid] = st.reqIdx[uid].filter(id => id !== clan.id); if(!st.reqIdx[uid].length) delete st.reqIdx[uid]; }
}
function dropAllRequestsOf(st, uid){
  if(!own(st.reqIdx, uid)) return;
  for(const cid of st.reqIdx[uid]) if(own(st.clans, cid) && own(st.clans[cid].requests, uid)) delete st.clans[cid].requests[uid];
  delete st.reqIdx[uid];
}
const clanOf = (st, uid) => own(st.byUser, uid) && own(st.clans, st.byUser[uid]) ? st.clans[st.byUser[uid]] : null;
const memberCount = c => Object.keys(c.members).length;
const rolePower = r => r === "leader" ? 3 : r === "officer" ? 2 : 1;
function memberByMid(clan, mid){
  for(const uid of Object.keys(clan.members)) if(clan.members[uid].mid === mid) return { uid, m: clan.members[uid] };
  return null;
}
function removeClan(st, clan){
  for(const uid of Object.keys(clan.members)) delete st.byUser[uid];
  for(const uid of Object.keys(clan.requests)) dropRequest(st, clan, uid);
  delete st.names[clan.nameKey]; delete st.tags[clan.tagKey]; delete st.clans[clan.id];
}
const standing = (a, b) => (b.points - a.points) || (b.wins - a.wins) || (a.createdAt - b.createdAt) || (a.id - b.id);
function ranked(st){ return Object.values(st.clans).sort(standing); }

/* ---------------- parte de la Conquista del Castillo: validación pura (también la usa la prueba y el contrato) ---------------- */
function validateWarReport(b){
  const bad = (field, msg) => ({ ok: false, error: "BAD_REPORT", field, msg: msg || "Parte de partida inválido." });
  if(!b || typeof b !== "object" || Array.isArray(b)) return bad("body");
  if(typeof b.matchId !== "string" || !WAR.MATCH_ID_RE.test(b.matchId)) return bad("matchId", "Identificador de partida inválido.");
  if(!WAR.MODES.includes(b.mode)) return bad("mode", "Modo desconocido.");
  if(!WAR.ROLES.includes(b.role)) return bad("role", "Rol inválido (attack o defend).");
  if(!WAR.RESULTS.includes(b.result)) return bad("result", "Resultado inválido (win o loss).");
  if(!WAR.OPPONENTS.includes(b.opponent)) return bad("opponent", "Rival inválido: por ahora solo bots.");
  if(!Number.isInteger(b.tier) || !WAR.TIERS.includes(b.tier)) return bad("tier", "Dificultad inválida (1 a 3).");
  if(!Number.isInteger(b.durationMs) || b.durationMs < WAR.MIN_MS || b.durationMs > WAR.MAX_MS) return bad("durationMs", "Duración imposible para una partida.");
  if(b.build !== undefined && (typeof b.build !== "string" || !WAR.BUILD_RE.test(b.build))) return bad("build");
  let stats = {};
  if(b.stats !== undefined){
    if(!b.stats || typeof b.stats !== "object" || Array.isArray(b.stats)) return bad("stats");
    for(const k of Object.keys(b.stats)){
      if(!own(STAT_KEYS, k)) return bad("stats." + k, "Estadística desconocida.");
      const v = b.stats[k];
      if(!Number.isInteger(v) || v < 0 || v > STAT_KEYS[k]) return bad("stats." + k, "Estadística fuera de rango.");
      stats[k] = v;
    }
  }
  return { ok: true, report: { matchId: b.matchId, mode: b.mode, role: b.role, result: b.result, opponent: b.opponent, tier: b.tier, durationMs: b.durationMs, stats } };
}
const warDelta = (tier, result) => WAR.POINTS[tier][result];

/* ---------------- rutas ---------------- */
function routes(ctx){
  const { getStore, auth, send, err, readBody, now, log } = ctx;
  const clock = typeof now === "function" ? now : Date.now;
  const minArenas = ctx.warMinArenas !== undefined ? Math.max(0, ctx.warMinArenas | 0) : WAR.MIN_ARENAS;
  const BODY = 4 * 1024;
  // limitadores en memoria (se reinician con el servidor; el estado importante vive en el documento)
  const hits = new Map();
  function hit(key, windowMs, max){
    const t = clock(); let e = hits.get(key);
    if(!e || e.until <= t){ e = { n: 0, until: t + windowMs }; hits.set(key, e); if(hits.size > 50000){ for(const [k, v] of hits) if(v.until <= t) hits.delete(k); } }
    e.n++; return e.n > max ? Math.max(1, Math.ceil((e.until - t) / 1000)) : 0;   // 0 = pasó; si no, segundos para reintentar
  }
  // "peek/bump": la creación de clanes se cuenta solo cuando salió bien (probar nombres ocupados no gasta el cupo del día; eso lo frena el límite de acciones)
  function over(key, max){ const t = clock(), e = hits.get(key); return e && e.until > t && e.n >= max ? Math.max(1, Math.ceil((e.until - t) / 1000)) : 0; }
  function bump(key, windowMs){ const t = clock(); let e = hits.get(key); if(!e || e.until <= t){ e = { n: 0, until: t + windowMs }; hits.set(key, e); } e.n++; }
  const tooMany = (req, res, secs) => err(req, res, 429, "TOO_MANY", `Demasiados intentos. Probá de nuevo en ${secs >= 90 ? Math.ceil(secs / 60) + " minutos" : secs + " segundos"}.`,
    { headers: { "retry-after": String(secs) }, body: { retryAfter: secs } });
  const fail = (req, res, status, error, msg, extra) => err(req, res, status, error, msg, extra ? { body: extra } : undefined);
  const displayName = async (store, uid) => { try{ const u = await store.getUser(+uid); return u ? (u.name || u.user) : "?"; }catch(e){ return "?"; } };

  async function me(req, res){
    const a = await auth(req); if(!a.user){ err(req, res, 401, a.error, a.error === "SESSION_EXPIRED" ? "Tu sesión venció. Entrá de nuevo." : "Tenés que entrar a tu cuenta."); return null; }
    return a.user;
  }
  // Acciones que cambian algo: sesión + límite por cuenta + cuerpo chico.
  async function mutation(req, res, fn){
    const u = await me(req, res); if(!u) return;
    const wait = hit("act:" + u.id, ACT_WINDOW_MS, ACT_MAX); if(wait) return tooMany(req, res, wait);
    const body = await readBody(req, BODY);
    const store = getStore();
    return fn(u, body, store);
  }
  const out = (req, res, r) => r && r.error ? fail(req, res, r.status || 400, r.error, r.msg, r.extra) : send(req, res, 200, Object.assign({ ok: true }, r));
  const E = (status, error, msg, extra) => ({ error, status, msg, extra });

  /* ---- vistas ---- */
  function pubClan(c, rank){
    return { id: c.id, name: c.name, tag: c.tag, desc: c.desc, joinMode: c.joinMode, members: memberCount(c), maxMembers: MAX_MEMBERS,
      points: c.points, wins: c.wins, losses: c.losses, rank: rank || 0, createdAt: c.createdAt };
  }
  async function detail(st, store, clan, viewerUid){
    const viewer = viewerUid && own(clan.members, viewerUid) ? clan.members[viewerUid] : null;
    const rank = ranked(st).findIndex(x => x.id === clan.id) + 1;
    const members = [];
    for(const uid of Object.keys(clan.members)){
      const m = clan.members[uid];
      members.push({ mid: m.mid, name: await displayName(store, uid), role: m.role, contrib: m.contrib | 0, joinedAt: m.joinedAt, you: String(uid) === String(viewerUid) });
    }
    members.sort((a, b) => (rolePower(b.role) - rolePower(a.role)) || (b.contrib - a.contrib) || (a.joinedAt - b.joinedAt));
    const d = Object.assign(pubClan(clan, rank), { history: clan.history.slice(0, HISTORY_MAX), memberList: members });
    if(viewer && rolePower(viewer.role) >= 2){
      d.requests = [];
      for(const uid of Object.keys(clan.requests)) if(clock() - clan.requests[uid].at <= REQUEST_TTL_MS) d.requests.push({ rid: clan.requests[uid].rid, name: await displayName(store, uid), at: clan.requests[uid].at });
      d.requests.sort((a, b) => a.at - b.at);
    }
    return d;
  }
  const limits = () => ({ maxMembers: MAX_MEMBERS, maxOfficers: MAX_OFFICERS, nameMin: names.NAME_MIN, nameMax: names.NAME_MAX, tagMin: names.TAG_MIN, tagMax: names.TAG_MAX, descMax: names.DESC_MAX,
    cooldownMs: COOLDOWN_MS, war: { tiers: WAR.TIERS, points: WAR.POINTS, userDailyMax: WAR.USER_DAILY_MAX, clanDailyGainMax: WAR.CLAN_DAILY_GAIN_MAX, minMs: WAR.MIN_MS, maxMs: WAR.MAX_MS, minArenas } });

  const R = {};

  // Público: tabla / búsqueda. Con sesión agrega "mine" (el id de tu clan).
  R["GET /api/clans"] = async (req, res, ip) => {
    const wait = hit("list:" + ip, LIST_WINDOW_MS, LIST_MAX_IP); if(wait) return tooMany(req, res, wait);
    const qs = new URL(req.url, "http://x").searchParams;
    const qRaw = qs.get("q") || "";
    if(qRaw.length > 40) return fail(req, res, 400, "BAD_QUERY", "La búsqueda es demasiado larga.");
    const q = names.searchKey(qRaw);
    const limit = Math.max(1, Math.min(LIST_MAX, parseInt(qs.get("limit") || "20", 10) || 20));
    const offset = Math.max(0, Math.min(100000, parseInt(qs.get("offset") || "0", 10) || 0));
    const st = norm(await getStore().clanRead());
    let mine = 0;
    if(req.headers.authorization){ const a = await auth(req); if(a.user && own(st.byUser, a.user.id)) mine = st.byUser[a.user.id]; }
    const all = ranked(st), rankOf = new Map(all.map((c, i) => [c.id, i + 1]));
    const rows = q ? all.filter(c => names.searchKey(c.name).includes(q) || names.searchKey(c.tag) === q || names.searchKey(c.tag).startsWith(q)) : all;
    return send(req, res, 200, { total: rows.length, clans: rows.slice(offset, offset + limit).map(c => pubClan(c, rankOf.get(c.id))), mine, limits: limits() });
  };
  R["GET /api/clan/info"] = async (req, res, ip) => {
    const wait = hit("list:" + ip, LIST_WINDOW_MS, LIST_MAX_IP); if(wait) return tooMany(req, res, wait);
    const id = new URL(req.url, "http://x").searchParams.get("id") || "";
    if(!ID_RE.test(id)) return fail(req, res, 400, "BAD_ID", "Identificador de clan inválido.");
    const store = getStore(), st = norm(await store.clanRead());
    if(!own(st.clans, id)) return fail(req, res, 404, "NO_CLAN", "Ese clan no existe.");
    const d = await detail(st, store, st.clans[id], 0);
    return send(req, res, 200, { clan: d });
  };
  // Mi clan (con la lista de miembros y, para líder/oficial, las solicitudes)
  R["GET /api/clan"] = async (req, res) => {
    const u = await me(req, res); if(!u) return;
    const store = getStore(), st = norm(await store.clanRead()), clan = clanOf(st, u.id);
    const t = clock(), cool = own(st.cool, u.id) && st.cool[u.id] > t ? st.cool[u.id] - t : 0;
    const day = own(st.userDay, u.id) && st.userDay[u.id].day === dayKey(t) ? st.userDay[u.id].n : 0;
    const base = { limits: limits(), cooldownMs: cool, today: { userReports: day, userMax: WAR.USER_DAILY_MAX } };
    if(!clan) return send(req, res, 200, Object.assign({ clan: null, me: null }, base));
    const m = clan.members[u.id];
    base.today.clanGain = clan.dayKey === dayKey(t) ? clan.dayGain : 0; base.today.clanGainMax = WAR.CLAN_DAILY_GAIN_MAX;
    return send(req, res, 200, Object.assign({ clan: await detail(st, store, clan, u.id), me: { role: m.role, mid: m.mid } }, base));
  };

  R["POST /api/clan/create"] = async (req, res, ip) => mutation(req, res, async (u, b, store) => {
    const nm = names.checkName(b.name); if(!nm.ok) return out(req, res, E(400, nm.error, nm.msg));
    const tg = names.checkTag(b.tag); if(!tg.ok) return out(req, res, E(400, tg.error, tg.msg));
    const dc = names.checkDesc(b.desc); if(!dc.ok) return out(req, res, E(400, dc.error, dc.msg));
    const joinMode = b.joinMode === undefined ? "open" : b.joinMode;
    if(joinMode !== "open" && joinMode !== "closed") return out(req, res, E(400, "BAD_JOIN_MODE", "El modo de ingreso es «open» o «closed»."));
    const w1 = over("create:u:" + u.id, CREATE_MAX_USER); if(w1) return tooMany(req, res, w1);
    const w2 = over("create:ip:" + ip, CREATE_MAX_IP); if(w2) return tooMany(req, res, w2);
    const r = await store.clanUpdate(async raw => {
      const st = norm(raw), t = clock(); prune(st, t);
      if(clanOf(st, u.id)) return { value: E(409, "ALREADY_IN_CLAN", "Ya estás en un clan. Salí de él para crear otro.") };
      if(own(st.cool, u.id) && st.cool[u.id] > t) return { value: E(429, "COOLDOWN", "Esperá unos minutos después de salir de un clan.", { retryAfter: Math.ceil((st.cool[u.id] - t) / 1000) }) };
      if(Object.keys(st.clans).length >= MAX_CLANS) return { value: E(503, "CLAN_LIMIT", "El servidor llegó al máximo de clanes por ahora.") };
      if(own(st.names, nm.key)) return { value: E(409, "NAME_TAKEN", "Ya existe un clan con un nombre igual o muy parecido.") };
      if(own(st.tags, tg.key)) return { value: E(409, "TAG_TAKEN", "Esa etiqueta ya la usa otro clan (o una muy parecida).") };
      const id = st.nextClanId++;
      const clan = { id, name: nm.name, nameKey: nm.key, tag: tg.tag, tagKey: tg.key, desc: dc.desc, joinMode, createdAt: t, points: 0, wins: 0, losses: 0,
        nextMid: 2, members: {}, requests: {}, history: [], dayKey: dayKey(t), dayGain: 0 };
      clan.members[u.id] = { mid: 1, role: "leader", joinedAt: t, contrib: 0 };
      st.clans[id] = clan; st.byUser[u.id] = id; st.names[nm.key] = id; st.tags[tg.key] = id;
      dropAllRequestsOf(st, u.id);
      return { state: st, value: { id } };
    });
    if(r.error) return out(req, res, r);
    bump("create:u:" + u.id, CREATE_WINDOW_MS); bump("create:ip:" + ip, CREATE_WINDOW_MS);
    log && log("CLAN_CREATED", { user: u.id, clan: r.id });
    return out(req, res, { id: r.id });
  });

  R["POST /api/clan/join"] = async (req, res) => mutation(req, res, async (u, b, store) => {
    if(typeof b.id !== "number" && typeof b.id !== "string") return out(req, res, E(400, "BAD_ID", "Identificador de clan inválido."));
    const id = String(b.id); if(!ID_RE.test(id)) return out(req, res, E(400, "BAD_ID", "Identificador de clan inválido."));
    const r = await store.clanUpdate(async raw => {
      const st = norm(raw), t = clock(); prune(st, t);
      if(clanOf(st, u.id)) return { value: E(409, "ALREADY_IN_CLAN", "Ya estás en un clan.") };
      if(!own(st.clans, id)) return { value: E(404, "NO_CLAN", "Ese clan no existe.") };
      if(own(st.cool, u.id) && st.cool[u.id] > t) return { value: E(429, "COOLDOWN", "Esperá unos minutos después de salir de un clan.", { retryAfter: Math.ceil((st.cool[u.id] - t) / 1000) }) };
      const clan = st.clans[id]; pruneRequests(st, clan, t);
      if(memberCount(clan) >= MAX_MEMBERS) return { value: E(409, "CLAN_FULL", "El clan está completo.") };
      if(clan.joinMode === "closed"){
        if(own(clan.requests, u.id)) return { value: E(409, "ALREADY_REQUESTED", "Ya pediste entrar a este clan.") };
        if(Object.keys(clan.requests).length >= MAX_REQUESTS) return { value: E(409, "REQUESTS_FULL", "Este clan tiene demasiadas solicitudes pendientes.") };
        const mine = own(st.reqIdx, u.id) ? st.reqIdx[u.id] : [];
        if(mine.length >= MAX_USER_REQUESTS) return { value: E(409, "TOO_MANY_REQUESTS", `Podés tener hasta ${MAX_USER_REQUESTS} solicitudes pendientes. Cancelá alguna.`) };
        clan.requests[u.id] = { rid: clan.nextMid++, at: t }; st.reqIdx[u.id] = mine.concat([clan.id]);
        return { state: st, value: { requested: true, clan: clan.name } };
      }
      clan.members[u.id] = { mid: clan.nextMid++, role: "member", joinedAt: t, contrib: 0 }; st.byUser[u.id] = clan.id;
      dropAllRequestsOf(st, u.id);
      return { state: st, value: { joined: true, clan: clan.name } };
    });
    return out(req, res, r);
  });

  R["POST /api/clan/cancel"] = async (req, res) => mutation(req, res, async (u, b, store) => {
    const id = String(b.id === undefined ? "" : b.id); if(!ID_RE.test(id)) return out(req, res, E(400, "BAD_ID", "Identificador de clan inválido."));
    const r = await store.clanUpdate(async raw => {
      const st = norm(raw);
      if(!own(st.clans, id) || !own(st.clans[id].requests, u.id)) return { value: E(404, "NO_REQUEST", "No tenés una solicitud pendiente en ese clan.") };
      dropRequest(st, st.clans[id], String(u.id));
      return { state: st, value: { cancelled: true } };
    });
    return out(req, res, r);
  });

  R["POST /api/clan/leave"] = async (req, res) => mutation(req, res, async (u, b, store) => {
    const r = await store.clanUpdate(async raw => {
      const st = norm(raw), t = clock(), clan = clanOf(st, u.id);
      if(!clan) return { value: E(404, "NOT_IN_CLAN", "No estás en ningún clan.") };
      const m = clan.members[u.id];
      if(m.role === "leader"){
        if(memberCount(clan) > 1) return { value: E(409, "LEADER_MUST_TRANSFER", "Sos el líder: pasale el liderazgo a otro miembro o disolvé el clan.") };
        removeClan(st, clan); st.cool[u.id] = t + COOLDOWN_MS;
        return { state: st, value: { left: true, disbanded: true } };
      }
      delete clan.members[u.id]; delete st.byUser[u.id]; st.cool[u.id] = t + COOLDOWN_MS;
      return { state: st, value: { left: true } };
    });
    return out(req, res, r);
  });

  R["POST /api/clan/kick"] = async (req, res) => mutation(req, res, async (u, b, store) => {
    if(!Number.isInteger(b.mid) || b.mid < 1) return out(req, res, E(400, "BAD_MID", "Miembro inválido."));
    const r = await store.clanUpdate(async raw => {
      const st = norm(raw), t = clock(), clan = clanOf(st, u.id);
      if(!clan) return { value: E(404, "NOT_IN_CLAN", "No estás en ningún clan.") };
      const me = clan.members[u.id];
      if(rolePower(me.role) < 2) return { value: E(403, "FORBIDDEN", "Solo el líder y los oficiales pueden expulsar.") };
      const target = memberByMid(clan, b.mid);
      if(!target) return { value: E(404, "NO_MEMBER", "Ese miembro ya no está en el clan.") };
      if(String(target.uid) === String(u.id)) return { value: E(400, "SELF", "No podés expulsarte a vos mismo: usá «Salir».") };
      if(rolePower(target.m.role) >= rolePower(me.role)) return { value: E(403, "FORBIDDEN", "No podés expulsar a alguien de tu rango o mayor.") };
      delete clan.members[target.uid]; delete st.byUser[target.uid]; st.cool[target.uid] = t + COOLDOWN_MS;
      return { state: st, value: { kicked: true } };
    });
    return out(req, res, r);
  });

  R["POST /api/clan/role"] = async (req, res) => mutation(req, res, async (u, b, store) => {
    if(!Number.isInteger(b.mid) || b.mid < 1) return out(req, res, E(400, "BAD_MID", "Miembro inválido."));
    if(b.role !== "officer" && b.role !== "member") return out(req, res, E(400, "BAD_ROLE", "El rol es «officer» o «member»."));
    const r = await store.clanUpdate(async raw => {
      const st = norm(raw), clan = clanOf(st, u.id);
      if(!clan) return { value: E(404, "NOT_IN_CLAN", "No estás en ningún clan.") };
      if(clan.members[u.id].role !== "leader") return { value: E(403, "FORBIDDEN", "Solo el líder cambia los rangos.") };
      const target = memberByMid(clan, b.mid);
      if(!target) return { value: E(404, "NO_MEMBER", "Ese miembro ya no está en el clan.") };
      if(target.m.role === "leader") return { value: E(400, "SELF", "El líder no cambia de rango: pasale el liderazgo a otro.") };
      if(b.role === "officer" && target.m.role !== "officer" && Object.values(clan.members).filter(m => m.role === "officer").length >= MAX_OFFICERS) return { value: E(409, "OFFICERS_FULL", `Hasta ${MAX_OFFICERS} oficiales.`) };
      target.m.role = b.role;
      return { state: st, value: { role: b.role } };
    });
    return out(req, res, r);
  });

  R["POST /api/clan/transfer"] = async (req, res) => mutation(req, res, async (u, b, store) => {
    if(!Number.isInteger(b.mid) || b.mid < 1) return out(req, res, E(400, "BAD_MID", "Miembro inválido."));
    if(b.confirm !== true) return out(req, res, E(428, "CONFIRM", "Confirmá el traspaso del liderazgo."));
    const r = await store.clanUpdate(async raw => {
      const st = norm(raw), clan = clanOf(st, u.id);
      if(!clan) return { value: E(404, "NOT_IN_CLAN", "No estás en ningún clan.") };
      if(clan.members[u.id].role !== "leader") return { value: E(403, "FORBIDDEN", "Solo el líder puede pasar el liderazgo.") };
      const target = memberByMid(clan, b.mid);
      if(!target) return { value: E(404, "NO_MEMBER", "Ese miembro ya no está en el clan.") };
      if(String(target.uid) === String(u.id)) return { value: E(400, "SELF", "Ya sos el líder.") };
      target.m.role = "leader"; clan.members[u.id].role = "officer";
      return { state: st, value: { transferred: true } };
    });
    return out(req, res, r);
  });

  R["POST /api/clan/edit"] = async (req, res) => mutation(req, res, async (u, b, store) => {
    const patch = {};
    if(b.desc !== undefined){ const dc = names.checkDesc(b.desc); if(!dc.ok) return out(req, res, E(400, dc.error, dc.msg)); patch.desc = dc.desc; }
    if(b.joinMode !== undefined){ if(b.joinMode !== "open" && b.joinMode !== "closed") return out(req, res, E(400, "BAD_JOIN_MODE", "El modo de ingreso es «open» o «closed».")); patch.joinMode = b.joinMode; }
    if(!Object.keys(patch).length) return out(req, res, E(400, "NOTHING", "No hay nada para cambiar."));
    const r = await store.clanUpdate(async raw => {
      const st = norm(raw), clan = clanOf(st, u.id);
      if(!clan) return { value: E(404, "NOT_IN_CLAN", "No estás en ningún clan.") };
      if(clan.members[u.id].role !== "leader") return { value: E(403, "FORBIDDEN", "Solo el líder edita el clan.") };
      Object.assign(clan, patch);
      return { state: st, value: patch };
    });
    return out(req, res, r);
  });

  R["POST /api/clan/request"] = async (req, res) => mutation(req, res, async (u, b, store) => {
    if(!Number.isInteger(b.rid) || b.rid < 1) return out(req, res, E(400, "BAD_RID", "Solicitud inválida."));
    if(typeof b.accept !== "boolean") return out(req, res, E(400, "BAD_ACCEPT", "Falta aceptar o rechazar."));
    const r = await store.clanUpdate(async raw => {
      const st = norm(raw), t = clock(), clan = clanOf(st, u.id);
      if(!clan) return { value: E(404, "NOT_IN_CLAN", "No estás en ningún clan.") };
      if(rolePower(clan.members[u.id].role) < 2) return { value: E(403, "FORBIDDEN", "Solo el líder y los oficiales atienden solicitudes.") };
      pruneRequests(st, clan, t);
      const uid = Object.keys(clan.requests).find(k => clan.requests[k].rid === b.rid);
      if(!uid) return { value: E(404, "NO_REQUEST", "Esa solicitud ya no existe.") };
      if(!b.accept){ dropRequest(st, clan, uid); return { state: st, value: { accepted: false } }; }
      if(memberCount(clan) >= MAX_MEMBERS) return { value: E(409, "CLAN_FULL", "El clan está completo.") };
      if(own(st.byUser, uid)){ dropRequest(st, clan, uid); return { state: st, value: E(409, "ALREADY_IN_CLAN", "Esa persona ya entró a otro clan.") }; }
      clan.members[uid] = { mid: clan.nextMid++, role: "member", joinedAt: t, contrib: 0 }; st.byUser[uid] = clan.id;
      dropAllRequestsOf(st, uid);
      return { state: st, value: { accepted: true } };
    });
    return out(req, res, r);
  });

  R["POST /api/clan/disband"] = async (req, res) => mutation(req, res, async (u, b, store) => {
    if(typeof b.confirm !== "string") return out(req, res, E(428, "CONFIRM", "Escribí la etiqueta del clan para confirmar."));
    const r = await store.clanUpdate(async raw => {
      const st = norm(raw), t = clock(), clan = clanOf(st, u.id);
      if(!clan) return { value: E(404, "NOT_IN_CLAN", "No estás en ningún clan.") };
      if(clan.members[u.id].role !== "leader") return { value: E(403, "FORBIDDEN", "Solo el líder puede disolver el clan.") };
      if(b.confirm.trim().toUpperCase() !== clan.tag) return { value: E(428, "CONFIRM", "La etiqueta no coincide: el clan no se disolvió.") };
      for(const uid of Object.keys(clan.members)) st.cool[uid] = t + COOLDOWN_MS;
      removeClan(st, clan);
      return { state: st, value: { disbanded: true } };
    });
    return out(req, res, r);
  });

  // Parte de una partida de la Conquista del Castillo (contra bots). Lo informa el cliente: ver el límite honesto arriba.
  R["POST /api/clan/war/report"] = async (req, res) => mutation(req, res, async (u, b, store) => {
    const v = validateWarReport(b); if(!v.ok) return out(req, res, E(400, "BAD_REPORT", v.msg, { field: v.field }));
    const rep = v.report;
    if(minArenas > 0){
      const meta = await store.getSaveMeta(u.id), done = meta && meta.summary ? meta.summary.arenas | 0 : 0;
      if(done < minArenas) return out(req, res, E(403, "ENDGAME_ONLY", `La Conquista del Castillo es para quienes completaron la campaña (${done}/${minArenas} arenas en tu guardado en la nube).`));
    }
    const r = await store.clanUpdate(async raw => {
      const st = norm(raw), t = clock(); prune(st, t);
      const clan = clanOf(st, u.id);
      if(!clan) return { value: E(404, "NOT_IN_CLAN", "Tenés que estar en un clan para sumar puntos.") };
      // repetido (reintento tras un corte): devuelve lo mismo sin volver a sumar; de otra cuenta, no
      if(own(st.reports, rep.matchId)){
        const prev = st.reports[rep.matchId];
        if(String(prev.uid) !== String(u.id)) return { value: E(409, "MATCH_USED", "Ese identificador de partida ya se usó.") };
        return { value: { duplicate: true, delta: prev.delta, points: clan.points, capped: !!prev.capped } };
      }
      // una partida tiene que caber en el tiempo que pasó desde el parte anterior de esa cuenta
      const last = own(st.lastReport, u.id) ? st.lastReport[u.id] : 0;
      if(last && rep.durationMs > t - last + WAR.GAP_SLACK_MS) return { value: E(422, "IMPLAUSIBLE", "Esa partida no entra en el tiempo desde tu parte anterior.") };
      const day = dayKey(t), ud = own(st.userDay, u.id) && st.userDay[u.id].day === day ? st.userDay[u.id] : { day, n: 0 };
      if(ud.n >= WAR.USER_DAILY_MAX) return { value: E(429, "DAILY_LIMIT", `Hoy ya sumaste ${WAR.USER_DAILY_MAX} partidas para el clan. Mañana seguimos.`) };
      if(clan.dayKey !== day){ clan.dayKey = day; clan.dayGain = 0; }
      let delta = warDelta(rep.tier, rep.result), capped = false;
      if(delta > 0){
        const room = Math.max(0, WAR.CLAN_DAILY_GAIN_MAX - clan.dayGain);
        if(delta > room){ delta = room; capped = true; }
        clan.dayGain += delta;
      }
      const before = clan.points;
      clan.points = Math.max(0, clan.points + delta);
      delta = clan.points - before;                          // lo que de verdad cambió (no baja de 0)
      if(rep.result === "win") clan.wins++; else clan.losses++;
      if(delta > 0) clan.members[u.id].contrib = (clan.members[u.id].contrib | 0) + delta;
      clan.history.unshift({ at: t, role: rep.role, result: rep.result, tier: rep.tier, delta, by: clan.members[u.id].mid });
      if(clan.history.length > HISTORY_MAX) clan.history.length = HISTORY_MAX;
      ud.n++; st.userDay[u.id] = ud; st.lastReport[u.id] = t;
      st.reports[rep.matchId] = { uid: String(u.id), at: t, delta, capped };
      return { state: st, value: { delta, points: clan.points, capped, wins: clan.wins, losses: clan.losses, userToday: ud.n, userMax: WAR.USER_DAILY_MAX } };
    });
    if(!r.error) log && log("CLAN_WAR_REPORT", { user: u.id, result: rep.result, tier: rep.tier, delta: r.delta });
    return out(req, res, r);
  });

  return R;
}

module.exports = { routes, validateWarReport, warDelta, WAR, STAT_KEYS, MAX_MEMBERS, MAX_OFFICERS, MAX_REQUESTS, COOLDOWN_MS, fresh };
