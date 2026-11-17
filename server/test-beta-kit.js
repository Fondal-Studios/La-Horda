"use strict";
// Kit de beta cerrada (server/beta-kit.js): puerta de invitación prendida/apagada, topes por código, reportes y errores.
// Sin red ni base externa: almacenamiento en archivos en una carpeta temporal. Ejecutar: node test-beta-kit.js
// Opcional, contra Postgres: BETA_KIT_PG_URL=postgres://...@127.0.0.1/horda_test_x (base VACÍA de prueba en localhost).
process.env.REGISTER_MAX_IP = process.env.REGISTER_MAX_IP || "1000"; // muchos registros desde 127.0.0.1 en la prueba
const assert = require("node:assert/strict"), http = require("node:http"), fs = require("node:fs"), os = require("node:os"), path = require("node:path");
const { create } = require("./accounts");
const kit = require("./beta-kit");

let checks = 0;
const ok = (cond, name, extra) => { assert.ok(cond, name + (extra === undefined ? "" : " · " + JSON.stringify(extra))); checks++; console.log("PASS " + name); };
const PG = process.env.BETA_KIT_PG_URL || "";
if(PG && !/^postgres(ql)?:\/\/[^/]*@?(127\.0\.0\.1|localhost)[:/].*\/horda_test_\w+$/.test(PG)) throw Error("BETA_KIT_PG_URL tiene que ser una base horda_test_* en localhost");
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "horda-beta-kit-"));
let app = null, server = null, base = "";
async function start(beta){
  if(server){ await new Promise(r => server.close(r)); server = null; }
  if(app) await app.close();
  app = create({ dataDir: dir, databaseUrl: PG, adminUsers: "boss", originAllowed: () => true, log: () => {}, beta });
  await app.ready;
  server = http.createServer((q, s) => app.handle(q, s) || (s.writeHead(404), s.end()));
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  base = "http://127.0.0.1:" + server.address().port;
}
async function api(method, url, body, token, raw){
  const r = await fetch(base + url, { method, headers: Object.assign({ "content-type": "application/json" }, token ? { authorization: "Bearer " + token } : {}),
    body: raw !== undefined ? raw : body === undefined ? undefined : JSON.stringify(body) });
  let j = {}; try{ j = await r.json(); }catch(e){}
  return { status: r.status, j };
}
const reg = (user, inviteCode) => api("POST", "/api/register", { user, pass: "clave-de-prueba-1", inviteCode });

(async () => {
  // ---------- unidades puras ----------
  const hashed = kit.hashCode("Secreto-Hash");
  const parsed = kit.parseInviteCodes(`Amigos-2026, PRENSA:2 ,sha256:${hashed}:1,ab,  `);
  ok(parsed.codes.size === 3 && parsed.invalid === 1, "parse: tres códigos válidos y uno demasiado corto", { size: parsed.codes.size, invalid: parsed.invalid });
  const zero = kit.parseInviteCodes(`CERRADO:0,sha256:${hashed}:0,ABIERTO:3`);
  ok(zero.codes.size === 1 && zero.invalid === 2 && [...zero.codes.values()][0].max === 3, "parse: ':0' no es «sin tope»: el código queda cerrado", { size: zero.codes.size, invalid: zero.invalid });
  const onlyZero = kit.parseInviteCodes("CERRADO:0");
  ok(onlyZero.codes.size === 0 && onlyZero.invalid === 1, "parse: solo ':0' = ningún código válido (la puerta queda cerrada)", { size: onlyZero.codes.size, invalid: onlyZero.invalid });
  ok(kit.hashCode("  amigos-2026 ") === kit.hashCode("AMIGOS-2026"), "hash: sin mayúsculas ni espacios en los extremos");
  ok(![...parsed.codes.values()].some(c => /amigos|prensa/i.test(c.label + c.hash)), "parse: la etiqueta no expone el código completo");
  ok(kit.scrub("escribime a juan.perez@mail.com ya", 200) === "escribime a [correo] ya", "scrub: tapa correos");
  ok(kit.srcPath("https://fondalstudios.com/la-horda/jugar/js/net/account.js?v=3#x") === "js/net/account.js", "srcPath: solo la ruta, sin dominio ni query");
  const c = kit.cleanContext({ build: "B1", level: 7.4, viewport: "844x390@2", ua: "Mozilla", errors: ["a", "b", "c", "d", "e", "f"], email: "x@y.com", token: "z" });
  ok(c.level === 7 && c.viewport === "844x390@2" && c.errors.length === 5 && !("email" in c) && !("token" in c), "context: lista blanca, nivel entero, 5 errores", c);

  // ---------- puerta APAGADA (por defecto) ----------
  await start({});
  let h = await api("GET", "/api/health");
  ok(h.status === 200 && h.j.beta && h.j.beta.invite === false && h.j.beta.reports === false && h.j.beta.errors === false, "apagado: /api/health anuncia beta todo en false", h.j.beta);
  ok((await reg("libre1")).status === 201, "apagado: se crea una cuenta sin código");
  const veterano = await reg("veterano"); ok(veterano.status === 201, "apagado: cuenta que existirá antes de la beta");
  ok((await api("POST", "/api/beta/report", { category: "bug", text: "algo falló" })).j.error === "BETA_OFF", "apagado: el reporte responde BETA_OFF");
  ok((await api("POST", "/api/beta/errors", { build: "x", errors: [{ message: "boom" }] })).status === 404, "apagado: errores JS responden 404");
  const boss = (await reg("boss")).j.token; // admin por adminUsers

  // ---------- puerta PRENDIDA ----------
  await start({ inviteCodes: `Amigos-2026,PRENSA:2,sha256:${hashed}:1,UNO-1:1` });
  h = await api("GET", "/api/health");
  ok(h.j.beta.invite === true && h.j.beta.reports === true && h.j.beta.errors === false, "prendido: health anuncia invitación y reportes (reportes se prenden con la puerta)", h.j.beta);
  let r = await reg("sincodigo");
  ok(r.status === 403 && r.j.error === "INVITE_REQUIRED" && /código de invitación/.test(r.j.msg), "prendido: sin código, 403 INVITE_REQUIRED con mensaje claro", r.j);
  r = await reg("malcodigo", "nada-que-ver");
  ok(r.status === 403 && r.j.error === "INVITE_INVALID" && /Revisalo/.test(r.j.msg), "prendido: código inválido, INVITE_INVALID (voseo)", r.j);
  ok((await reg("amigo1", "  amigos-2026 ")).status === 201, "prendido: código válido sin mayúsculas y con espacios");
  ok((await reg("amigo2", "AMIGOS-2026")).status === 201, "prendido: código sin tope sirve varias veces");
  ok((await api("POST", "/api/login", { user: "veterano", pass: "clave-de-prueba-1" })).status === 200, "prendido: una cuenta existente sigue entrando");
  ok((await reg("prensa1", "prensa")).status === 201 && (await reg("prensa2", "Prensa")).status === 201, "tope: dos usos de PRENSA:2");
  r = await reg("prensa3", "PRENSA");
  ok(r.status === 403 && r.j.error === "INVITE_EXHAUSTED", "tope: el tercero recibe INVITE_EXHAUSTED", r.j);
  r = await reg("amigo1", "PRENSA");
  ok(r.status === 409 && r.j.error === "USER_TAKEN", "nombre repetido: 409 antes de gastar un código");
  ok((await reg("hash1", "secreto-hash")).status === 201 && (await reg("hash2", "secreto-hash")).j.error === "INVITE_EXHAUSTED", "código guardado como sha256 con tope 1");
  const race = await Promise.all([reg("carrera1", "uno-1"), reg("carrera2", "UNO-1"), reg("carrera3", "uno-1")]);
  ok(race.filter(x => x.status === 201).length === 1 && race.filter(x => x.j.error === "INVITE_EXHAUSTED").length === 2, "carrera: tope 1 con tres registros simultáneos, uno solo entra", race.map(x => x.status));

  // admin: usos por código, sin exponer los códigos
  ok((await api("GET", "/api/gm/beta/invites")).status === 401, "admin invites: sin sesión 401");
  const player = (await api("POST", "/api/login", { user: "amigo1", pass: "clave-de-prueba-1" })).j.token;
  ok((await api("GET", "/api/gm/beta/invites", undefined, player)).status === 403, "admin invites: jugador común 403");
  let inv = await api("GET", "/api/gm/beta/invites", undefined, boss);
  const uses = Object.fromEntries(inv.j.codes.map(c => [c.label, c.uses]));
  ok(inv.status === 200 && uses["AM…(11)"] === 2 && uses["PR…(6)"] === 2 && uses["UN…(5)"] === 1, "admin invites: usos por código", inv.j);
  ok(!JSON.stringify(inv.j).toLowerCase().includes("amigos-2026"), "admin invites: el código completo no sale del servidor");
  if(!PG) ok(!fs.readFileSync(path.join(dir, "beta.json"), "utf8").toLowerCase().includes("prensa"), "almacenamiento: solo hashes, nunca el código en claro");

  // reinicio: los usos sobreviven (archivo)
  await start({ inviteCodes: "PRENSA:2" });
  ok((await reg("prensa4", "prensa")).j.error === "INVITE_EXHAUSTED", "reinicio: el contador de usos persiste");
  await start({ inviteCodes: "x" }); // texto sin ningún código válido: puerta CERRADA, nunca abierta
  ok((await reg("nadie", "x")).j.error === "INVITE_INVALID" && (await reg("nadie2")).j.error === "INVITE_REQUIRED", "configuración inválida: la puerta queda cerrada");

  // ---------- reportes ----------
  await start({ inviteCodes: "Amigos-2026" });
  r = await api("POST", "/api/beta/report", { category: "bug", text: "se trabó el jefe" });
  ok(r.status === 401, "reporte: con la puerta prendida hace falta cuenta", r.j);
  ok((await api("POST", "/api/beta/report", { category: "spam", text: "hola hola" }, player)).j.error === "BAD_CATEGORY", "reporte: categoría inválida 400");
  ok((await api("POST", "/api/beta/report", { category: "bug", text: "  " }, player)).j.error === "BAD_TEXT", "reporte: texto vacío 400");
  ok((await api("POST", "/api/beta/report", { category: "bug", text: "x".repeat(1001) }, player)).j.error === "TEXT_TOO_LONG", "reporte: más de 1000 caracteres 400");
  r = await api("POST", "/api/beta/report", undefined, player, JSON.stringify({ category: "bug", text: "a", pad: "x".repeat(9000) }));
  ok(r.status === 413, "reporte: cuerpo de más de 8 KB 413", r.status);
  // los intentos de arriba (4) ya cuentan para el límite de 5 cada 10 minutos por cuenta
  r = await api("POST", "/api/beta/report", { category: "balance", text: "El jefe pega mucho, mail: yo@correo.com", context: { build: "B1-7", arena: "bosque", level: 4, champion: "mago", viewport: "844x390", ua: "Chrome", errors: ["TypeError: x at https://fondalstudios.com/la-horda/jugar/js/a.js?v=1"], ip: "1.2.3.4" } }, player);
  ok(r.status === 201 && Number.isInteger(r.j.id), "reporte: válido 201 con id", r.j);
  r = await api("POST", "/api/beta/report", { category: "idea", text: "otra idea más" }, player);
  ok(r.status === 429 && r.j.retryAfter > 0, "reporte: sexto pedido en 10 minutos 429", r.j);
  let list = await api("GET", "/api/gm/beta/reports", undefined, player);
  ok(list.status === 403, "reportes admin: jugador común 403");
  list = await api("GET", "/api/gm/beta/reports", undefined, boss);
  const rep = list.j.reports && list.j.reports[0];
  ok(list.status === 200 && list.j.reports.length === 1 && rep.user === "amigo1" && rep.category === "balance", "reportes admin: lista con la cuenta", list.j);
  ok(rep.text.includes("[correo]") && !rep.text.includes("yo@correo.com") && !("ip" in rep.context) && rep.context.errors[0].endsWith("js/a.js"), "reportes admin: sin correo, sin IP, URL sin query", rep);

  // reportes sin puerta (BETA_REPORTS=1): anónimos permitidos, sin id de cuenta
  await start({ reports: "1" });
  r = await api("POST", "/api/beta/report", { category: "otro", text: "anónimo pero útil" });
  ok(r.status === 201, "reporte anónimo con BETA_REPORTS=1 y sin puerta", r.j);
  list = await api("GET", "/api/gm/beta/reports?limit=1", undefined, boss);
  ok(list.j.reports.length === 1 && list.j.reports[0].userId === null && list.j.reports[0].user === null, "reporte anónimo: sin cuenta", list.j.reports);
  ok((await reg("libre2")).status === 201, "sin puerta: registro libre aunque haya reportes");

  // ---------- errores de JavaScript ----------
  await start({ errors: "1" });
  h = await api("GET", "/api/health");
  ok(h.j.beta.errors === true && h.j.beta.invite === false && h.j.beta.reports === false, "errores: health anuncia solo errores", h.j.beta);
  const e1 = { message: "TypeError: a is undefined", src: "https://fondalstudios.com/la-horda/jugar/js/core/game.js?v=9", line: 12, col: 3, count: 2 };
  r = await api("POST", "/api/beta/errors", { build: "B1-7", errors: [e1, { message: "" }, null] });
  ok(r.status === 200 && r.j.accepted === 1, "errores: acepta uno válido e ignora vacíos", r.j);
  await api("POST", "/api/beta/errors", { build: "B1-7", errors: [Object.assign({}, e1, { count: 1 })] });
  ok((await api("POST", "/api/beta/errors", { build: "B1-7", errors: Array(11).fill(e1) })).j.error === "BAD_ERRORS", "errores: más de 10 por pedido 400");
  let errs = (await api("GET", "/api/gm/beta/errors", undefined, boss)).j.errors;
  ok(errs.length === 1 && errs[0].count === 3 && errs[0].src === "js/core/game.js" && errs[0].line === 12, "errores: agrupados por firma con contador", errs);
  ok((await api("GET", "/api/gm/beta/errors", undefined, player)).status === 403, "errores admin: jugador común 403");
  let last = null; for(let i = 0; i < 30; i++) last = await api("POST", "/api/beta/errors", { build: "B1-7", errors: [{ message: "spam " + i }] });
  ok(last.status === 429, "errores: límite de pedidos por IP", last.status);
  ok((await api("POST", "/api/beta/report", { category: "bug", text: "algo" })).j.error === "BETA_OFF", "errores solos: los reportes siguen apagados");

  await new Promise(r => server.close(r)); await app.close();
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`PASS beta-kit (${PG ? "postgres" : "archivo"}): ${checks} comprobaciones (puerta de invitación, topes, carrera, reportes, errores, permisos)`);
})().catch(async e => { console.error("FAIL", e && e.message || e); process.exitCode = 1; try{ if(server) server.close(); if(app) await app.close(); }catch(x){} });
