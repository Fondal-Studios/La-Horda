"use strict";
// CLANES (server/clans.js + server/clan-names.js), contra la API real de cuentas en un servidor HTTP local, con archivo en
// una carpeta temporal y reloj controlado. Cubre: permisos por rol, nombres duplicados y parecidos, filtro, entradas maliciosas,
// topes (miembros, solicitudes, partes por día, puntos por día), límites de frecuencia, carreras, persistencia y el parte de la
// Conquista del Castillo. Uso: node server/test-clans.js   (con DATABASE_URL de prueba también corre contra Postgres: ver test-postgres.js)
process.env.REGISTER_MAX_IP = "500"; process.env.API_MAX_IP = "100000"; process.env.CLAN_MAX_MEMBERS = "5"; process.env.CLAN_ACT_MAX = "120";
const assert = require("node:assert/strict"), http = require("node:http"), fs = require("fs"), os = require("os"), path = require("path");
const accountsMod = require("./accounts"), clans = require("./clans"), nm = require("./clan-names");
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "horda-clans-"));
let clock = Date.UTC(2026, 9, 14, 12, 0, 0);
const opts = { dataDir: dir, databaseUrl: "", log: () => {}, originAllowed: () => true, now: () => clock, adminUsers: "nadie_admin" };
let accounts = accountsMod.create(opts), server, BASE;
let n = 0, fails = 0;
const check = (name, ok, extra) => { n++; if(!ok){ fails++; console.log("FAIL " + name + (extra !== undefined ? "  " + JSON.stringify(extra).slice(0, 300) : "")); } };
async function listen(){ server = http.createServer((q, s) => { if(!accounts.handle(q, s)){ s.writeHead(404); s.end(); } }); await new Promise(r => server.listen(0, "127.0.0.1", r)); BASE = "http://127.0.0.1:" + server.address().port; }
async function api(method, p, body, token, headers){
  const h = Object.assign({}, headers || {});
  if(body !== undefined && !h["content-type"]) h["content-type"] = "application/json";
  if(token) h.authorization = "Bearer " + token;
  const r = await fetch(BASE + p, { method, headers: h, body: body === undefined ? undefined : (typeof body === "string" ? body : JSON.stringify(body)) });
  let j = null; const t = await r.text(); try{ j = JSON.parse(t); }catch(e){ j = t; }
  return { status: r.status, j };
}
const U = {};   // nombre -> token
async function user(name){ const r = await api("POST", "/api/register", { user: name, pass: "clave-de-prueba-1", name }); assert.equal(r.status, 201, "registro " + name + " " + JSON.stringify(r.j)); U[name] = r.j.token; return r.j.token; }
const T = name => U[name];
let mid = 0; const matchId = () => "match-" + String(++mid).padStart(12, "0") + "-abcd";
const report = (over) => Object.assign({ matchId: matchId(), mode: "castle", role: "attack", result: "win", opponent: "bots", tier: 1, durationMs: 300000, stats: { gates: 3, towers: 2, heartPct: 100, heroKills: 4 } }, over || {});
const mineOf = async name => (await api("GET", "/api/clan", undefined, T(name))).j;
const memberMid = async (viewer, display) => (await mineOf(viewer)).clan.memberList.find(m => m.name === display).mid;

(async () => {
  await accounts.ready; await listen();
  for(const u of ["lider", "ofi", "miembro", "otro", "extra", "quinto", "sexto", "septimo", "octavo"]) await user(u);

  /* ---- sin sesión ---- */
  for(const [m, p] of [["GET", "/api/clan"], ["POST", "/api/clan/create"], ["POST", "/api/clan/join"], ["POST", "/api/clan/leave"], ["POST", "/api/clan/kick"], ["POST", "/api/clan/role"],
    ["POST", "/api/clan/transfer"], ["POST", "/api/clan/edit"], ["POST", "/api/clan/request"], ["POST", "/api/clan/disband"], ["POST", "/api/clan/cancel"], ["POST", "/api/clan/war/report"]]){
    const r = await api(m, p, m === "POST" ? {} : undefined);
    check("sin sesión " + p + " -> 401", r.status === 401, r);
  }
  const tokenBasura = await api("POST", "/api/clan/create", { name: "Cuervos", tag: "CUE" }, "a".repeat(64));
  check("token inventado -> 401", tokenBasura.status === 401);
  check("tabla pública sin sesión", (await api("GET", "/api/clans")).status === 200);

  /* ---- crear: validación de nombre, etiqueta y descripción ---- */
  const bad = async (body, code, why) => { const r = await api("POST", "/api/clan/create", body, T("lider")); check("crear rechaza " + why + " (" + code + ")", r.status === 400 && r.j.error === code, r); };
  await bad({ name: "ab", tag: "AB" }, "BAD_NAME", "nombre corto");
  await bad({ name: "x".repeat(21), tag: "AB" }, "BAD_NAME", "nombre largo");
  await bad({ name: "<script>alert(1)</script>", tag: "AB" }, "BAD_NAME", "HTML");
  await bad({ name: "Горда Clan", tag: "AB" }, "BAD_NAME", "letras cirílicas");
  await bad({ name: "Clan 😀", tag: "AB" }, "BAD_NAME", "emoji");
  await bad({ name: "Los Putos Amos", tag: "LPA" }, "NAME_NOT_ALLOWED", "insulto");
  await bad({ name: "Pu7a Madre", tag: "PM" }, "NAME_NOT_ALLOWED", "insulto con números");
  await bad({ name: "p u t a", tag: "PU" }, "NAME_NOT_ALLOWED", "insulto con espacios");
  await bad({ name: "Hitler Fans", tag: "HF" }, "NAME_NOT_ALLOWED", "tema de odio");
  await bad({ name: "Admin Oficial", tag: "ADM" }, "RESERVED_NAME", "nombre del equipo");
  await bad({ name: "La H0rda", tag: "LH" }, "RESERVED_NAME", "imitación de La Horda");
  await bad({ name: "Cuervos", tag: "A" }, "BAD_TAG", "etiqueta corta");
  await bad({ name: "Cuervos", tag: "ABCDE" }, "BAD_TAG", "etiqueta larga");
  await bad({ name: "Cuervos", tag: "A B" }, "BAD_TAG", "etiqueta con espacio");
  await bad({ name: "Cuervos", tag: "Ñ1" }, "BAD_TAG", "etiqueta con ñ");
  await bad({ name: "Cuervos", tag: "KKK" }, "NAME_NOT_ALLOWED", "etiqueta ofensiva");
  await bad({ name: "Cuervos", tag: "CUE", desc: "unite a discord.gg/abc" }, "LINKS_NOT_ALLOWED", "enlace en la descripción");
  await bad({ name: "Cuervos", tag: "CUE", desc: "escribime @pepito123" }, "LINKS_NOT_ALLOWED", "usuario en la descripción");
  await bad({ name: "Cuervos", tag: "CUE", desc: "x".repeat(121) }, "BAD_DESC", "descripción larga");
  await bad({ name: "Cuervos", tag: "CUE", desc: 42 }, "BAD_DESC", "descripción no texto");
  await bad({ name: "Cuervos", tag: "CUE", joinMode: "vip" }, "BAD_JOIN_MODE", "modo de ingreso inventado");
  await bad({ name: 12345, tag: "CUE" }, "BAD_NAME", "nombre numérico");
  await bad({ name: { a: 1 }, tag: "CUE" }, "BAD_NAME", "nombre objeto");
  await bad({ name: ["Cuervos"], tag: "CUE" }, "BAD_NAME", "nombre arreglo");
  await bad({ name: "Cuervos", tag: ["CUE"] }, "BAD_TAG", "etiqueta arreglo");
  await bad({}, "BAD_NAME", "cuerpo vacío");
  check("filtro: 'Círculo de Fuego' y 'Vehículo' no se censuran por contener 'culo'", nm.checkName("Círculo de Fuego").ok && nm.checkName("Vehículo Blindado").ok && nm.checkName("Computadora").ok);
  check("filtro: elongaciones y espacios", !nm.checkName("puuuuta").ok && !nm.checkName("m i e r d a").ok && !nm.checkName("N.A.Z.I").ok);
  check("body no JSON -> 400", (await api("POST", "/api/clan/create", "{no es json", T("lider"))).status === 400);
  check("body arreglo se trata como vacío", (await api("POST", "/api/clan/create", "[1,2,3]", T("lider"))).j.error === "BAD_NAME");
  const huge = await api("POST", "/api/clan/create", JSON.stringify({ name: "Cuervos", tag: "CUE", desc: "x".repeat(20000) }), T("lider"));
  check("cuerpo enorme -> 413", huge.status === 413, huge);

  /* ---- crear OK y unicidad ---- */
  const c1 = await api("POST", "/api/clan/create", { name: "Cuervos de Ceniza", tag: "ccz", desc: "Clan de prueba", joinMode: "open" }, T("lider"));
  check("crear clan", c1.status === 200 && c1.j.ok && c1.j.id === 1, c1);
  const mine = await mineOf("lider");
  check("mi clan: líder, etiqueta en mayúsculas, 1 miembro", mine.clan && mine.clan.tag === "CCZ" && mine.me.role === "leader" && mine.clan.members === 1 && mine.clan.memberList[0].you === true, mine);
  check("límites publicados", mine.limits.maxMembers === 5 && mine.limits.nameMax === 20 && mine.limits.war.points[1].win === 12, mine.limits);
  check("no filtra el usuario de login ni el id de cuenta", !JSON.stringify(mine).includes('"user"') && !/"userId"/.test(JSON.stringify(mine)));
  const dup = async (name, tag, code, why) => { const r = await api("POST", "/api/clan/create", { name, tag }, T("otro")); check("duplicado " + why, r.status === 409 && r.j.error === code, r); };
  await dup("cuervos de ceniza", "ZZ1", "NAME_TAKEN", "mismo nombre en minúsculas");
  await dup("Cuervos  de  Ceniza", "ZZ1", "NAME_TAKEN", "mismo nombre con espacios");
  await dup("Cuérvos de Cénizá", "ZZ1", "NAME_TAKEN", "mismo nombre con tildes");
  await dup("Cu3rv0s d3 C3n1z4", "ZZ1", "NAME_TAKEN", "mismo nombre con números por letras");
  await dup("CuervosDeCeniza", "ZZ1", "NAME_TAKEN", "mismo nombre sin espacios");
  await dup("Cuervos de Ceniza", "ZZ1", "NAME_TAKEN", "mismo nombre exacto");
  await dup("Otro Clan", "CCZ", "TAG_TAKEN", "misma etiqueta");
  check("etiqueta con 0 por O es la misma", (await api("POST", "/api/clan/create", { name: "Clan Lol", tag: "LOL" }, T("quinto"))).status === 200 && (await api("POST", "/api/clan/create", { name: "Zeta Fuerte", tag: "L0L" }, T("sexto"))).j.error === "TAG_TAKEN");
  const c2 = await api("POST", "/api/clan/create", { name: "Otro Clan", tag: "OTR" }, T("otro"));
  check("segundo clan distinto OK", c2.status === 200, c2);
  check("ya en un clan: no crea otro", (await api("POST", "/api/clan/create", { name: "Tercero", tag: "TRC" }, T("lider"))).j.error === "ALREADY_IN_CLAN");

  /* ---- unirse, tope de miembros ---- */
  check("unirse a clan inexistente -> 404", (await api("POST", "/api/clan/join", { id: 999 }, T("ofi"))).status === 404);
  for(const id of ["__proto__", "constructor", "1e3", "-1", "0x10", "1.5", "", "9".repeat(12), null, true, { a: 1 }, [1]]){
    const r = await api("POST", "/api/clan/join", { id }, T("ofi"));
    check("id malicioso " + JSON.stringify(id) + " rechazado", r.status === 400 || r.status === 404, r);
  }
  check("body con __proto__ no cambia nada", (await api("POST", "/api/clan/join", '{"__proto__":{"id":1},"id":"__proto__"}', T("ofi"))).status === 400);
  check("unirse (abierto)", (await api("POST", "/api/clan/join", { id: 1 }, T("ofi"))).j.joined === true);
  check("ya en clan: no se une a otro", (await api("POST", "/api/clan/join", { id: 2 }, T("ofi"))).j.error === "ALREADY_IN_CLAN");
  check("unirse 2", (await api("POST", "/api/clan/join", { id: 1 }, T("miembro"))).j.joined === true);
  check("unirse 3", (await api("POST", "/api/clan/join", { id: 1 }, T("extra"))).j.joined === true);

  /* ---- permisos por rol ---- */
  const midOfi = await memberMid("lider", "ofi"), midMie = await memberMid("lider", "miembro"), midExt = await memberMid("lider", "extra"), midLid = await memberMid("lider", "lider");
  const as = (who, p, b) => api("POST", p, b, T(who));
  check("miembro no expulsa", (await as("miembro", "/api/clan/kick", { mid: midExt })).status === 403);
  check("miembro no cambia rangos", (await as("miembro", "/api/clan/role", { mid: midExt, role: "officer" })).status === 403);
  check("miembro no edita", (await as("miembro", "/api/clan/edit", { desc: "hackeado" })).status === 403);
  check("miembro no pasa el liderazgo", (await as("miembro", "/api/clan/transfer", { mid: midMie, confirm: true })).status === 403);
  check("miembro no disuelve", (await as("miembro", "/api/clan/disband", { confirm: "CCZ" })).status === 403);
  check("miembro no atiende solicitudes", (await as("miembro", "/api/clan/request", { rid: 1, accept: true })).status === 403);
  check("oficial no puede ascender a otro (solo líder)", (await as("ofi", "/api/clan/role", { mid: midMie, role: "officer" })).status === 403);
  check("líder ascende a oficial", (await as("lider", "/api/clan/role", { mid: midOfi, role: "officer" })).j.role === "officer");
  check("rol inventado 'leader' rechazado", (await as("lider", "/api/clan/role", { mid: midMie, role: "leader" })).j.error === "BAD_ROLE");
  check("rol 'admin' rechazado", (await as("lider", "/api/clan/role", { mid: midMie, role: "admin" })).j.error === "BAD_ROLE");
  check("el líder no se baja el rango", (await as("lider", "/api/clan/role", { mid: midLid, role: "member" })).status === 400);
  check("mid no entero", (await as("lider", "/api/clan/kick", { mid: "1" })).j.error === "BAD_MID");
  check("mid 1.5", (await as("lider", "/api/clan/kick", { mid: 1.5 })).j.error === "BAD_MID");
  check("mid negativo", (await as("lider", "/api/clan/kick", { mid: -1 })).j.error === "BAD_MID");
  check("mid inexistente", (await as("lider", "/api/clan/kick", { mid: 9999 })).j.error === "NO_MEMBER");
  check("oficial no expulsa al líder", (await as("ofi", "/api/clan/kick", { mid: midLid })).status === 403);
  check("nadie se expulsa a sí mismo", (await as("ofi", "/api/clan/kick", { mid: midOfi })).status === 400);
  check("oficial edita? no", (await as("ofi", "/api/clan/edit", { desc: "x" })).status === 403);
  check("líder edita descripción y modo", (await as("lider", "/api/clan/edit", { desc: "Nueva descripción", joinMode: "closed" })).j.joinMode === "closed");
  check("edición con descripción prohibida", (await as("lider", "/api/clan/edit", { desc: "visitá www.malo.com" })).j.error === "LINKS_NOT_ALLOWED");
  check("edición vacía", (await as("lider", "/api/clan/edit", {})).j.error === "NOTHING");

  /* ---- solicitudes (clan cerrado) ---- */
  const rq = await as("otro", "/api/clan/join", { id: 1 });   // 'otro' ya es líder de otro clan
  check("el líder de otro clan no puede pedir entrar", rq.j.error === "ALREADY_IN_CLAN");
  check("solicitud (clan cerrado)", (await as("quinto", "/api/clan/leave")).j.disbanded === true);
  clock += 6 * 60 * 1000;   // pasa el enfriamiento
  const sol = await as("quinto", "/api/clan/join", { id: 1 });
  check("pedir entrar a clan cerrado", sol.status === 200 && sol.j.requested === true, sol);
  check("solicitud repetida", (await as("quinto", "/api/clan/join", { id: 1 })).j.error === "ALREADY_REQUESTED");
  const withReq = await mineOf("ofi");
  check("el oficial ve la solicitud, el miembro no", withReq.clan.requests.length === 1 && !(await mineOf("miembro")).clan.requests);
  const rid = withReq.clan.requests[0].rid;
  check("rid inválido", (await as("ofi", "/api/clan/request", { rid: "x", accept: true })).j.error === "BAD_RID");
  check("accept no booleano", (await as("ofi", "/api/clan/request", { rid, accept: "yes" })).j.error === "BAD_ACCEPT");
  check("rid inexistente", (await as("ofi", "/api/clan/request", { rid: 9999, accept: true })).j.error === "NO_REQUEST");
  check("el oficial rechaza", (await as("ofi", "/api/clan/request", { rid, accept: false })).j.accepted === false);
  check("rechazada: ya no está", (await as("ofi", "/api/clan/request", { rid, accept: true })).j.error === "NO_REQUEST");
  await as("quinto", "/api/clan/join", { id: 1 });
  const rid2 = (await mineOf("lider")).clan.requests[0].rid;
  check("cancelar la propia solicitud", (await as("quinto", "/api/clan/cancel", { id: 1 })).j.cancelled === true);
  check("cancelar sin solicitud", (await as("quinto", "/api/clan/cancel", { id: 1 })).status === 404);
  await as("quinto", "/api/clan/join", { id: 1 });
  const rid3 = (await mineOf("lider")).clan.requests[0].rid;
  check("el oficial acepta (hay cupo: 4/5)", (await as("ofi", "/api/clan/request", { rid: rid3, accept: true })).j.accepted === true);
  check("tope de miembros: ahora el clan está completo (5/5)", (await as("septimo", "/api/clan/join", { id: 1 })).j.error === "CLAN_FULL");
  // solicitudes que vencen
  await as("septimo", "/api/clan/leave");
  const c3 = await as("octavo", "/api/clan/create", { name: "Zorros Rojos", tag: "ZRR", joinMode: "closed" });
  await as("septimo", "/api/clan/join", { id: c3.j.id });
  check("solicitud pendiente existe", (await mineOf("octavo")).clan.requests.length === 1);
  clock += 4 * 24 * 3600 * 1000;
  check("la solicitud vence a los 3 días", (await as("octavo", "/api/clan/request", { rid: 2, accept: true })).j.error === "NO_REQUEST" && (await mineOf("octavo")).clan.requests.length === 0);
  // máximo 3 solicitudes por cuenta
  await user("pend1"); await user("pend2");
  const ids = [];
  for(const [nm2, tg] of [["Alfa Clan", "AL1"], ["Beta Clan", "BE1"], ["Gamma Clan", "GA1"], ["Delta Clan", "DE1"]]){ const w = "own_" + tg; await user(w); const r = await as(w, "/api/clan/create", { name: nm2, tag: tg, joinMode: "closed" }); assert.equal(r.status, 200, JSON.stringify(r.j)); ids.push(r.j.id); }
  const r1 = await as("pend1", "/api/clan/join", { id: ids[0] }), r2 = await as("pend1", "/api/clan/join", { id: ids[1] }), r3 = await as("pend1", "/api/clan/join", { id: ids[2] }), r4 = await as("pend1", "/api/clan/join", { id: ids[3] });
  check("hasta 3 solicitudes simultáneas", r1.j.requested && r2.j.requested && r3.j.requested && r4.j.error === "TOO_MANY_REQUESTS", [r1.j, r4.j]);

  /* ---- expulsar, salir, enfriamiento ---- */
  check("oficial expulsa a un miembro", (await as("ofi", "/api/clan/kick", { mid: midExt })).j.kicked === true);
  check("expulsado: ya no tiene clan", (await mineOf("extra")).clan === null);
  const cd = await as("extra", "/api/clan/join", { id: ids[0] });
  check("enfriamiento tras expulsión (429 con retryAfter)", cd.status === 429 && cd.j.error === "COOLDOWN" && cd.j.retryAfter > 0, cd);
  check("enfriamiento también bloquea crear", (await as("extra", "/api/clan/create", { name: "Nuevo Clan", tag: "NVC" })).j.error === "COOLDOWN");
  check("mi estado muestra el enfriamiento", (await mineOf("extra")).cooldownMs > 0);
  clock += 6 * 60 * 1000;
  check("pasado el enfriamiento puede unirse", (await as("extra", "/api/clan/join", { id: 1 })).j.requested === true);   // el clan 1 quedó cerrado
  check("líder no puede salir si hay miembros", (await as("lider", "/api/clan/leave")).j.error === "LEADER_MUST_TRANSFER");
  check("no estar en un clan: salir -> 404", (await as("pend2", "/api/clan/leave")).status === 404);
  check("traspaso exige confirmación", (await as("lider", "/api/clan/transfer", { mid: midOfi })).status === 428);
  check("traspaso a sí mismo", (await as("lider", "/api/clan/transfer", { mid: midLid, confirm: true })).status === 400);
  check("traspaso a un fantasma", (await as("lider", "/api/clan/transfer", { mid: 9999, confirm: true })).status === 404);
  check("traspaso de liderazgo", (await as("lider", "/api/clan/transfer", { mid: midOfi, confirm: true })).j.transferred === true);
  const after = await mineOf("lider");
  check("el ex líder quedó como oficial y 'ofi' es líder", after.me.role === "officer" && (await mineOf("ofi")).me.role === "leader");
  check("el ex líder ya no puede editar", (await as("lider", "/api/clan/edit", { desc: "x" })).status === 403);
  check("el ex líder ya no puede disolver", (await as("lider", "/api/clan/disband", { confirm: "CCZ" })).status === 403);
  check("el ex líder (oficial) no expulsa al nuevo líder", (await as("lider", "/api/clan/kick", { mid: midOfi })).status === 403);
  check("miembro sale solo", (await as("miembro", "/api/clan/leave")).j.left === true);

  /* ---- búsqueda y tabla ---- */
  const list = await api("GET", "/api/clans?limit=100");
  check("tabla lista los clanes con rango", list.j.clans.length >= 5 && list.j.clans.every((c, i) => c.rank === i + 1 && typeof c.members === "number" && !("members_list" in c)), list.j.clans.map(c => c.name));
  check("la tabla no incluye miembros ni solicitudes", !JSON.stringify(list.j).includes("memberList") && !JSON.stringify(list.j).includes("requests"));
  check("buscar por nombre sin tildes", (await api("GET", "/api/clans?q=" + encodeURIComponent("cuérvos"))).j.clans.map(c => c.id).join() === "1");
  check("buscar por etiqueta", (await api("GET", "/api/clans?q=zrr")).j.clans[0].name === "Zorros Rojos");
  check("búsqueda sin resultados", (await api("GET", "/api/clans?q=nadienadie")).j.total === 0);
  check("búsqueda con caracteres de regex no rompe", (await api("GET", "/api/clans?q=" + encodeURIComponent(".*(("))).status === 200);
  check("búsqueda demasiado larga", (await api("GET", "/api/clans?q=" + "a".repeat(41))).status === 400);
  check("paginación y topes (limit 1, offset 1)", (await api("GET", "/api/clans?limit=1&offset=1")).j.clans.length === 1 && (await api("GET", "/api/clans?limit=100000")).j.clans.length <= 50 && (await api("GET", "/api/clans?limit=-5&offset=-9")).status === 200);
  check("'mine' con sesión", (await api("GET", "/api/clans", undefined, T("ofi"))).j.mine === 1);
  check("info pública de un clan", (await api("GET", "/api/clan/info?id=1")).j.clan.memberList.length >= 2);
  check("info: id malicioso", (await api("GET", "/api/clan/info?id=__proto__")).status === 400 && (await api("GET", "/api/clan/info?id=999")).status === 404);
  check("info pública no muestra solicitudes", !(await api("GET", "/api/clan/info?id=1")).j.clan.requests);

  /* ---- Conquista del Castillo: parte de resultado ---- */
  const L = "ofi";   // líder del clan 1 ahora
  // rp: la partida "dura" lo que dice durationMs (el reloj avanza antes de informar); rpNow: informa sin avanzar el reloj
  const rpNow = (who, o) => api("POST", "/api/clan/war/report", report(o), T(who));
  const rp = (who, o) => { clock += (o && Number.isInteger(o.durationMs) && o.durationMs > 0 ? o.durationMs : 300000); return rpNow(who, o); };
  const v1 = await rp(L, { result: "win", tier: 1 });
  check("parte de victoria tier 1: +12", v1.status === 200 && v1.j.delta === 12 && v1.j.points === 12, v1);
  const same = report({ tier: 3 }); clock += 300000; const first = await api("POST", "/api/clan/war/report", same, T(L)); const again = await api("POST", "/api/clan/war/report", same, T(L));
  check("el mismo parte reintentado no suma dos veces", first.j.delta === 30 && again.j.duplicate === true && again.j.delta === 30 && again.j.points === first.j.points, [first.j, again.j]);
  check("otra cuenta no reutiliza el id", (await api("POST", "/api/clan/war/report", same, T("lider"))).j.error === "MATCH_USED");
  const dg = report({ matchId: "__defineGetter__" }); clock += 300000; const dgr = await api("POST", "/api/clan/war/report", dg, T("lider"));
  check("id '__defineGetter__' (propiedad heredada) no cuenta como repetido", dgr.status === 200 && !dgr.j.duplicate && dgr.j.delta === 12, dgr);
  const badReports = [
    [{ matchId: "corto" }, "matchId corto"], [{ matchId: "a b c d e f g h i j k l" }, "matchId con espacios"], [{ mode: "arena" }, "modo"], [{ role: "king" }, "rol"],
    [{ result: "draw" }, "resultado"], [{ opponent: "clan" }, "rival clan (no existe todavía)"], [{ tier: 4 }, "tier 4"], [{ tier: 0 }, "tier 0"], [{ tier: "1" }, "tier texto"], [{ tier: 1.5 }, "tier decimal"],
    [{ durationMs: 5000 }, "duración 5 s"], [{ durationMs: 99 * 60000 }, "duración 99 min"], [{ durationMs: -1 }, "duración negativa"], [{ durationMs: "300000" }, "duración texto"], [{ durationMs: NaN }, "NaN"],
    [{ stats: { hackeado: 1 } }, "estadística desconocida"], [{ stats: { gates: 99 } }, "estadística fuera de rango"], [{ stats: { gates: -1 } }, "estadística negativa"], [{ stats: [] }, "stats arreglo"], [{ stats: { gates: "3" } }, "stats texto"],
    [{ build: "x".repeat(40) }, "build largo"], [{ delta: 99999 }, "x"]];
  for(const [o, why] of badReports){
    if(why === "x") continue;
    const r = await rp(L, o); check("parte inválido: " + why, r.status === 400 && r.j.error === "BAD_REPORT", r);
  }
  check("el cliente no puede mandar sus propios puntos", (await rp(L, { points: 99999, delta: 99999 })).j.delta === 12);
  check("sin clan no suma", (await rp("pend2")).j.error === "NOT_IN_CLAN");
  const pts0 = (await mineOf(L)).clan.points;
  // derrotas bajan puntos pero no de 0
  const lossA = await rp(L, { result: "loss", tier: 3 });
  check("derrota tier 3 resta 8", lossA.j.delta === -8 && lossA.j.points === pts0 - 8, lossA.j);
  // plausibilidad: partidas seguidas que no caben en el tiempo
  clock += 1000;
  const imp = await rpNow(L, { durationMs: 20 * 60000 });
  check("una partida de 20 min no cabe en el tiempo desde el parte anterior (422)", imp.status === 422 && imp.j.error === "IMPLAUSIBLE", imp);
  // tope diario por cuenta
  let capErr = null, okCount = 0;
  for(let i = 0; i < 12; i++){ const r = await rp(L, { durationMs: 120000, tier: 1, result: i % 2 ? "loss" : "win" }); if(r.status === 200) okCount++; else { capErr = r; break; } }
  check("tope diario por cuenta (8 partidas)", capErr && capErr.status === 429 && capErr.j.error === "DAILY_LIMIT", { okCount, capErr });
  const st1 = await mineOf(L);
  check("el estado muestra los topes de hoy", st1.today.userReports === 8 && st1.today.userMax === 8, st1.today);
  clock += 24 * 3600 * 1000 + 1000;
  check("al otro día el cupo se renueva", (await rp(L, { durationMs: 120000 })).status === 200);
  // el clan 1 queda: tope de puntos sumados por día (400)
  await as("otro", "/api/clan/leave"); // 'otro' lidera su clan solo -> se disuelve
  clock += 6 * 60 * 1000;
  // más miembros que reportan tier 3
  const mA = "pend2";
  await as("ofi", "/api/clan/edit", { joinMode: "open" });
  await as(mA, "/api/clan/join", { id: 1 }); await as("otro", "/api/clan/join", { id: 1 });
  let gained = 0, capped = 0;
  for(const who of [L, mA, "otro"]){ for(let i = 0; i < 8; i++){ const r = await rp(who, { tier: 3, durationMs: 120000, result: "win" }); if(r.status === 200){ gained += r.j.delta; if(r.j.capped) capped++; } } }
  const dayInfo = await mineOf(L);
  check("tope diario de puntos del clan (400) con aviso 'capped'", dayInfo.today.clanGain <= 400 && capped > 0, { gained, capped, today: dayInfo.today });
  check("contribución del miembro no es negativa", dayInfo.clan.memberList.every(m => m.contrib >= 0));
  // puntos nunca negativos
  await user("solo1"); const sc = await as("solo1", "/api/clan/create", { name: "Perdedores", tag: "PRD" });
  const sl = await rp("solo1", { result: "loss", tier: 3, durationMs: 120000 });
  check("los puntos no bajan de 0", sl.status === 200 && sl.j.points === 0 && sl.j.delta === 0, sl.j);
  const hist = (await mineOf(L)).clan.history;
  check("historial reciente acotado a 10", hist.length === 10 && hist[0].at >= hist[hist.length - 1].at);
  const pl = (await api("GET", "/api/clans?limit=50")).j.clans;
  check("la tabla se ordena por puntos", pl.every((c, i) => i === 0 || pl[i - 1].points >= c.points), pl.map(c => c.points));

  /* ---- exigir campaña completa (opcional) ---- */
  const strict = accountsMod.create(Object.assign({}, opts, { dataDir: fs.mkdtempSync(path.join(os.tmpdir(), "horda-clans-strict-")), clanWarMinArenas: 3 }));
  await strict.ready;
  const sSrv = http.createServer((q, s) => { if(!strict.handle(q, s)){ s.writeHead(404); s.end(); } }); await new Promise(r => sSrv.listen(0, "127.0.0.1", r));
  const sBase = "http://127.0.0.1:" + sSrv.address().port;
  const sapi = async (method, p, body, token) => { const r = await fetch(sBase + p, { method, headers: { "content-type": "application/json", ...(token ? { authorization: "Bearer " + token } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) }); return { status: r.status, j: await r.json() }; };
  const stok = (await sapi("POST", "/api/register", { user: "endgame", pass: "clave-de-prueba-1" })).j.token;
  await sapi("POST", "/api/clan/create", { name: "Veteranos", tag: "VET" }, stok);
  const e1 = await sapi("POST", "/api/clan/war/report", report(), stok);
  check("CLAN_WAR_MIN_ARENAS: sin campaña completa no suma (403)", e1.status === 403 && e1.j.error === "ENDGAME_ONLY", e1);
  await sapi("PUT", "/api/save", { data: { gold: 1, champions: {}, arenasCleared: { a: true, b: true, c: true } }, baseVersion: 0 }, stok);
  const e2 = await sapi("POST", "/api/clan/war/report", report(), stok);
  check("CLAN_WAR_MIN_ARENAS: con las arenas completas suma", e2.status === 200 && e2.j.delta === 12, e2);
  await new Promise(r => sSrv.close(r)); await strict.close();

  /* ---- límites de frecuencia ---- */
  await user("spam");
  let limited = null;
  for(let i = 0; i < 150; i++){ const r = await as("spam", "/api/clan/join", { id: 999 }); if(r.status === 429){ limited = r; break; } }
  check("límite de acciones por cuenta (429 con retry-after)", limited && limited.j.error === "TOO_MANY" && limited.j.retryAfter > 0, limited);
  await user("cre1");
  const k1 = await as("cre1", "/api/clan/create", { name: "Primero Uno", tag: "P1U" });
  await as("cre1", "/api/clan/leave"); clock += 6 * 60 * 1000;
  const k2 = await as("cre1", "/api/clan/create", { name: "Segundo Uno", tag: "S2U" });
  await as("cre1", "/api/clan/leave"); clock += 6 * 60 * 1000;
  const k3 = await as("cre1", "/api/clan/create", { name: "Tercero Uno", tag: "T3U" });
  check("máximo 2 clanes creados por cuenta por día", k1.status === 200 && k2.status === 200 && k3.status === 429, [k1.status, k2.status, k3]);

  /* ---- carreras ---- */
  const racers = []; for(let i = 0; i < 6; i++){ const w = "race" + i; await user(w); racers.push(w); }
  const race = await Promise.all(racers.map(w => as(w, "/api/clan/create", { name: "Carrera Final", tag: "R" + racers.indexOf(w) })));
  check("6 creaciones en paralelo con el mismo nombre: solo una gana", race.filter(r => r.status === 200).length === 1 && race.filter(r => r.j.error === "NAME_TAKEN").length === 5, race.map(r => r.j.error || "ok"));
  const winnerIdx = race.findIndex(r => r.status === 200), raceClan = race[winnerIdx].j.id;
  const joiners = []; for(let i = 0; i < 6; i++){ const w = "joiner" + i; await user(w); joiners.push(w); }
  const jr = await Promise.all(joiners.map(w => as(w, "/api/clan/join", { id: raceClan })));
  check("6 ingresos en paralelo a un clan con 4 lugares: nunca pasa el tope", jr.filter(r => r.j.joined).length === 4 && jr.filter(r => r.j.error === "CLAN_FULL").length === 2, jr.map(r => r.j.error || "ok"));
  check("el clan quedó con 5 miembros", (await api("GET", "/api/clan/info?id=" + raceClan)).j.clan.members === 5);
  const tagRace = await Promise.all(["t1", "t2", "t3"].map(async w => { await user("tg_" + w); return as("tg_" + w, "/api/clan/create", { name: "Nombre " + w + "xx", tag: "ZZ9" }); }));
  check("etiqueta en carrera: una sola", tagRace.filter(r => r.status === 200).length === 1, tagRace.map(r => r.j.error || "ok"));

  /* ---- disolver y liberar nombres ---- */
  const dis1 = await as("ofi", "/api/clan/disband", { confirm: "XXX" }), dis0 = await as("ofi", "/api/clan/disband", {});
  check("disolver exige escribir la etiqueta", dis1.status === 428 && dis0.status === 428 && (await mineOf("ofi")).clan !== null, [dis1.j, dis0.j]);
  check("disolver el clan", (await as("ofi", "/api/clan/disband", { confirm: "ccz" })).j.disbanded === true);
  check("disuelto: sus miembros quedan sin clan", (await mineOf("lider")).clan === null && (await mineOf(mA)).clan === null);
  check("disuelto: la tabla ya no lo lista", !(await api("GET", "/api/clans?limit=50")).j.clans.some(c => c.id === 1));
  clock += 6 * 60 * 1000;
  await user("nuevo_dueno");
  check("disuelto: el nombre y la etiqueta se liberan", (await as("nuevo_dueno", "/api/clan/create", { name: "Cuervos de Ceniza", tag: "CCZ" })).status === 200);

  /* ---- persistencia ---- */
  const before = (await api("GET", "/api/clans?limit=50")).j.clans.map(c => [c.id, c.name, c.tag, c.points, c.members].join("|")).join(";");
  const sessionTok = T("nuevo_dueno");
  await new Promise(r => server.close(r)); await accounts.close();
  accounts = accountsMod.create(opts); await accounts.ready; await listen();
  const afterR = (await api("GET", "/api/clans?limit=50")).j.clans.map(c => [c.id, c.name, c.tag, c.points, c.members].join("|")).join(";");
  check("los clanes y puntos sobreviven a un reinicio", before === afterR && before.length > 20, { before, afterR });
  check("la sesión y el rol sobreviven", (await api("GET", "/api/clan", undefined, sessionTok)).j.me.role === "leader");
  check("un nombre ya usado sigue ocupado tras reiniciar", (await as("lider", "/api/clan/create", { name: "Cuervos De Ceniza", tag: "ZZ8" })).j.error === "NAME_TAKEN");
  const rawFile = JSON.parse(fs.readFileSync(path.join(dir, "clans.json"), "utf8"));
  check("el archivo no guarda contraseñas ni tokens", !/pass|token|scrypt/i.test(JSON.stringify(rawFile)));
  check("clans.json sin archivos .tmp sueltos", !fs.readdirSync(dir).some(f => f.endsWith(".tmp")));

  /* ---- contrato del parte (docs/modes/clan-war-contract.json) ---- */
  const contract = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "docs", "modes", "clan-war-contract.json"), "utf8"));
  check("contrato documentado = constantes del servidor", JSON.stringify(contract.report.v1.enums.role) === JSON.stringify(clans.WAR.ROLES) && JSON.stringify(contract.report.v1.enums.result) === JSON.stringify(clans.WAR.RESULTS)
    && JSON.stringify(contract.report.v1.enums.tier) === JSON.stringify(clans.WAR.TIERS) && contract.report.v1.durationMs.min === clans.WAR.MIN_MS && contract.report.v1.durationMs.max === clans.WAR.MAX_MS
    && JSON.stringify(contract.points) === JSON.stringify(clans.WAR.POINTS) && contract.caps.userDailyReports === clans.WAR.USER_DAILY_MAX && contract.caps.clanDailyGain === clans.WAR.CLAN_DAILY_GAIN_MAX
    && JSON.stringify(Object.keys(contract.report.v1.stats)) === JSON.stringify(Object.keys(clans.STAT_KEYS)) && Object.entries(clans.STAT_KEYS).every(([k, v]) => contract.report.v1.stats[k].max === v), contract);
  check("el ejemplo del contrato es un parte válido", clans.validateWarReport(contract.report.v1.example).ok === true);

  await new Promise(r => server.close(r)); await accounts.close();
  console.log((fails ? "FALLARON " + fails + " de " : "PASS ") + n + " comprobaciones de clanes");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
