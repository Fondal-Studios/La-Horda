#!/usr/bin/env node
"use strict";
// PREFLIGHT TOTAL antes de cobrar: junta en UNA corrida lo que hoy está repartido (entorno, Mercado Pago, base persistente,
// HTTPS y cabeceras, interruptores del juego, textos legales, servidor y relay, secretos en el repo, peso de la carga inicial).
// Cada fila sale VERDE (ok), AMARILLO (revisar / falta pero no bloquea todavía) o ROJO (bloquea). NUNCA imprime valores
// secretos: solo "cargado"/"falta" y largos. NUNCA llama a la API de Mercado Pago ni compra nada.
//
//   node tools/release/preflight.js [opciones]
//     --env-file RUTA     archivo de entorno del servidor (ej. /etc/la-horda/la-horda.env). Sin esto se usa el entorno actual.
//     --url URL           página pública del juego (ej. https://fondalstudios.com/la-horda/jugar/): HTTPS, cabeceras, legal publicado.
//     --relay URL         servidor de salas/cuentas (ej. https://fondalstudios.com/la-horda/red o http://127.0.0.1:8787): salud,
//                         base persistente, CORS, WebSocket y webhook. Sin esto se deriva de GAME_RELAY_URL del entorno.
//     --dist CARPETA      sitio ya construido (tools/build-static.mjs). Sin esto se revisa el código fuente del repositorio.
//     --launch            "voy a prender MP_ENABLED=1": lo que falte para cobrar pasa de AMARILLO a ROJO.
//     --strict            sale con error también si hay amarillos.
//     --json              salida en JSON (para otro programa). --no-color: sin colores. --offline: no hace pedidos de red.
//     --skip-rehearsal    no corre el ensayo con el Mercado Pago FALSO (tarda unos segundos).
//     --backup-dir RUTA   carpeta de copias de seguridad (por defecto /var/backups/la-horda)
//   Códigos de salida: 0 = sin rojos (y sin amarillos si --strict) · 1 = hay rojos · 2 = uso incorrecto.
// Documentación: docs/commercial/DESPLIEGUE_FONDAL.md (sección Preflight) y docs/commercial/CHECKLIST_ULTIMA_PRUEBA.md.
const fs = require("fs"), path = require("path"), os = require("os"), tls = require("tls"), zlib = require("zlib");
const { spawnSync } = require("child_process");
const ROOT = path.resolve(__dirname, "../..");
const argv = process.argv.slice(2);
const opt = n => { const i = argv.indexOf("--" + n); return i >= 0 ? argv[i + 1] : undefined; };
const flag = n => argv.includes("--" + n);
for(const a of argv) if(a.startsWith("--") && !["env-file", "url", "relay", "dist", "launch", "strict", "json", "no-color", "offline", "skip-rehearsal", "backup-dir", "help"].includes(a.slice(2))){ console.error("Opción desconocida: " + a + "  (usá --help)"); process.exit(2); }
if(flag("help")){ console.log(fs.readFileSync(__filename, "utf8").split("\n").filter(l => l.startsWith("//")).map(l => l.slice(3)).join("\n")); process.exit(0); }

const LAUNCH = flag("launch"), OFFLINE = flag("offline");
const BLOCK = LAUNCH ? "fail" : "warn";          // lo que hay que tener para cobrar: rojo en --launch, amarillo antes
const rows = [];
let section = "";
const sec = s => { section = s; };
const add = (level, name, detail, hint) => rows.push({ section, level, name, detail: detail || "", hint: level === "ok" ? "" : (hint || "") });
const chk = (cond, name, { ifNot = "fail", detail = "", okDetail = "", hint = "" } = {}) => add(cond ? "ok" : ifNot, name, cond ? okDetail : detail, hint);

/* ---------------- entorno ---------------- */
function parseEnvFile(file){
  const out = {};
  for(const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)){
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(raw); if(!m) continue;
    let v = m[2].trim(); if(/^(".*"|'.*')$/.test(v)) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}
const envFile = opt("env-file");
let fileEnv = {};
if(envFile){
  try{ fileEnv = parseEnvFile(envFile); }catch(e){ console.error("No se pudo leer --env-file (" + (e.code || e.message) + ")"); process.exit(2); }
}
const env = Object.assign({}, process.env, fileEnv);
const has = k => (env[k] || "").trim().length > 0;
const on = k => /^(1|true)$/i.test((env[k] || "").trim());
const readSafe = f => { try{ return fs.readFileSync(f, "utf8"); }catch(e){ return null; } };
const distDir = opt("dist") ? path.resolve(opt("dist")) : null;
const siteDir = distDir || ROOT;

/* ---------------- red ---------------- */
const T = 9000;
async function http(url, o = {}){
  const t0 = Date.now();
  try{
    const r = await fetch(url, Object.assign({ signal: AbortSignal.timeout(T), redirect: "manual" }, o));
    let body = ""; try{ body = await r.text(); }catch(e){}
    return { ok: true, status: r.status, headers: r.headers, body, ms: Date.now() - t0 };
  }catch(e){ return { ok: false, error: String(e && (e.cause && e.cause.code || e.name) || e) , ms: Date.now() - t0 }; }
}
const isLocal = u => { try{ return ["localhost", "127.0.0.1", "[::1]"].includes(new URL(u).hostname); }catch(e){ return false; } };
function certDays(host, port){
  return new Promise(res => {
    const s = tls.connect({ host, port, servername: host, timeout: T }, () => {
      const c = s.getPeerCertificate(); const proto = s.getProtocol(); const authorized = s.authorized, err = s.authorizationError;
      s.end(); res({ days: c && c.valid_to ? Math.floor((new Date(c.valid_to) - Date.now()) / 86400000) : null, proto, authorized, err });
    });
    s.on("error", e => res({ error: e.code || e.message })); s.on("timeout", () => { s.destroy(); res({ error: "TIMEOUT" }); });
  });
}

/* ================================================================ 1. versión y entorno de ejecución */
function gitShort(){ try{ const r = spawnSync("git", ["rev-parse", "--short", "HEAD"], { cwd: ROOT, encoding: "utf8", timeout: 5000 }); return r.status === 0 ? r.stdout.trim() : ""; }catch(e){ return ""; } }
function versionSection(){
  sec("Versión y entorno de ejecución");
  const major = +process.versions.node.split(".")[0];
  chk(major >= 18, "Node " + process.versions.node + " (mínimo 18; probado con 22)", { detail: "versión vieja", hint: "instalá Node 22 LTS (guía, paso 2)" });
  let pkg = {}; try{ pkg = JSON.parse(readSafe(path.join(ROOT, "server/package.json"))); }catch(e){}
  const cfg = readSafe(path.join(ROOT, "js/net/net-config.js")) || "", build = (/build:\s*"([^"]+)"/.exec(cfg) || [])[1];
  add(pkg.version && build ? "ok" : "warn", "Versión del juego", `servidor ${pkg.version || "?"} · build de salas ${build || "?"} · commit ${gitShort() || "n/d"}`, "no se pudo leer la versión");
  if(distDir){
    const d = readSafe(path.join(distDir, "deployment.json"));
    if(d){ try{ const j = JSON.parse(d); add("ok", "Sitio construido (deployment.json)", `armado ${j.builtAt || "?"} · relay ${j.relay || "?"}`);
        if(has("GAME_RELAY_URL") && j.relay && j.relay.replace(/\/$/, "") !== env.GAME_RELAY_URL.replace(/\/$/, "")) add("warn", "El relay del sitio construido difiere de GAME_RELAY_URL", `${j.relay} ≠ ${env.GAME_RELAY_URL}`, "volvé a construir el sitio (deploy/update.sh)"); }catch(e){} }
    else add("warn", "El sitio no tiene deployment.json", "", "construilo con node tools/build-static.mjs");
  }
}

/* ================================================================ 2. variables de entorno */
function envSection(){
  sec("Variables de entorno (solo se muestra si están, nunca el valor)");
  if(envFile){
    let st = null; try{ st = fs.statSync(envFile); }catch(e){}
    if(st){
      chk(!(st.mode & 0o007), "El archivo de entorno no es legible por cualquiera", { detail: "modo " + (st.mode & 0o777).toString(8), hint: "sudo chmod 640 " + envFile + " && sudo chown root:lahorda " + envFile });
      chk(!(st.mode & 0o022), "El archivo de entorno no es escribible por otros", { ifNot: "warn", detail: "modo " + (st.mode & 0o777).toString(8), hint: "sudo chmod 640 " + envFile });
      const inRepo = !path.relative(ROOT, path.resolve(envFile)).startsWith("..");
      chk(!inRepo, "El archivo de entorno está FUERA del repositorio", { detail: "está dentro del repo", hint: "movelo a /etc/la-horda/ (un git add -A lo subiría a GitHub)" });
    }
  } else add("warn", "No se pasó --env-file: se usa el entorno de esta terminal", "", "para revisar el servidor real: --env-file /etc/la-horda/la-horda.env");
  chk(on("REQUIRE_PERSISTENT_ACCOUNTS"), "REQUIRE_PERSISTENT_ACCOUNTS=1 (sin base persistente no arrancan las cuentas)", { ifNot: BLOCK, hint: "poné REQUIRE_PERSISTENT_ACCOUNTS=1" });
  chk(has("DATABASE_URL") || (has("DATA_DIR") && env.DATA_PERSISTENT === "1"), "Base de datos configurada (DATABASE_URL, o DATA_DIR + DATA_PERSISTENT=1)", { ifNot: BLOCK, hint: "sin base persistente el servidor se niega a cobrar" });
  if(has("DATABASE_URL")){
    let u = null; try{ u = new URL(env.DATABASE_URL); }catch(e){}
    chk(!!u && /^postgres(ql)?:$/.test(u.protocol), "DATABASE_URL tiene forma de dirección de Postgres", { hint: "tiene que empezar con postgresql://" });
    if(u){ const local = ["127.0.0.1", "localhost", "::1", "[::1]"].includes(u.hostname);
      chk(local || /sslmode=(require|verify)/.test(u.search) || env.PGSSL === "1" || /\.(render|neon|supabase)\./.test(u.hostname) || /\.internal$/.test(u.hostname), "La conexión a la base va cifrada (o es local)", { ifNot: "warn", hint: "una base remota debería llevar ?sslmode=require" });
      chk(!!u.password || local, "DATABASE_URL incluye contraseña (o es una base local sin clave)", { ifNot: "warn", hint: "una base sin clave solo es aceptable en 127.0.0.1" }); }
  }
  // Economía de ítems V2 (server/item-economy*.js): ENCENDIDA por omisión SOLO con almacenamiento persistente; HORDA_ITEM_ECONOMY=0 la apaga.
  const persistentStore = has("DATABASE_URL") || (has("DATA_DIR") && env.DATA_PERSISTENT === "1");
  const ecoOff = env.HORDA_ITEM_ECONOMY === "0";
  add("ok", "Economía de ítems V2 (HORDA_ITEM_ECONOMY)", ecoOff ? "APAGADA (=0): contrato anterior, cuentas y guardado como siempre" : persistentStore ? "ENCENDIDA (por omisión con base persistente): el servidor es dueño de oro, gemas y objetos de las cuentas" : "sin base persistente: no actúa (comportamiento anterior)", persistentStore && !ecoOff ? "primero un respaldo de cuentas+guardados+operaciones y la prueba en un entorno aislado (docs/economy/ITEM_ECONOMY_V2_INTEGRACION.md); para apagarla: HORDA_ITEM_ECONOMY=0" : "");
  const origins = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
  chk(origins.length > 0, "ALLOWED_ORIGINS definido", { ifNot: BLOCK, hint: "sin lista el servidor acepta pedidos de CUALQUIER página" });
  chk(origins.every(o => /^https:\/\/[^/]+$/.test(o) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)), "ALLOWED_ORIGINS: solo orígenes https sin barra final", { ifNot: "warn", detail: "hay entradas raras", hint: "ej. https://fondalstudios.com" });
  chk(on("ALLOWED_ORIGINS_STRICT"), "ALLOWED_ORIGINS_STRICT=1 (no se suman GitHub Pages ni githack)", { ifNot: "warn", hint: "raw.githack.com sirve páginas de cualquier repositorio de GitHub; en producción propia poné 1" });
  chk(on("TRUST_PROXY") || env.TRUST_PROXY === "0", "TRUST_PROXY definido (1 detrás de nginx/Apache)", { ifNot: "warn", hint: "sin TRUST_PROXY=1 todos los jugadores comparten una sola IP y se bloquean entre sí" });
  chk(!has("ADMIN_USERS"), "ADMIN_USERS NO está definido", { ifNot: "warn", detail: "pisa a operator-config.json: quien registre ese nombre antes que vos se vuelve administrador", hint: "borrala (docs/ALFA_PASOS_DEL_DUENO.md)" });
  chk(!has("FOUNDERS_JSON"), "FOUNDERS_JSON NO está definido (es solo para pruebas)", { ifNot: "warn" });
  chk(!has("FOUNDER_SIGNUP_CODE"), "FOUNDER_SIGNUP_CODE no está (se usa una vez y se borra)", { ifNot: "warn", hint: "borrala después de crear la cuenta FacuGM" });
  for(const k of ["SIM_LATENCY_MS", "TRADE_DELIVER_TIMEOUT_MS", "HORDA_TEST_PG_URL", "MP_API_BASE"]) chk(!has(k), k + " NO está definido (solo para pruebas)", { ifNot: k === "MP_API_BASE" || k === "SIM_LATENCY_MS" ? "fail" : "warn", hint: "borrala del servidor real" });
  chk(has("GAME_RELAY_URL") || !envFile, "GAME_RELAY_URL definido (para construir el sitio)", { ifNot: "warn", hint: "sin esto el sitio apunta al relay por defecto" });
}

/* ================================================================ 3. Mercado Pago (reusa tools/release/mp-readiness.js) */
function mpSection(){
  sec("Mercado Pago (tools/release/mp-readiness.js)");
  const sw = on("MP_ENABLED");
  add(sw ? (LAUNCH ? "ok" : "warn") : (LAUNCH ? "warn" : "ok"), "Interruptor MP_ENABLED", sw ? "PRENDIDO (se puede cobrar)" : "APAGADO (la tienda dice 'Muy pronto')",
    sw ? "está prendido antes de terminar el checklist: apagalo hasta cerrar docs/commercial/CHECKLIST_ULTIMA_PRUEBA.md" : "es lo correcto hasta terminar el checklist; en --launch se pone en 1 recién al final");
  const live = (env.MP_MODE || "").trim().toLowerCase() === "live" || (!(env.MP_MODE || "").trim() && env.MP_LIVE_MODE === "true");
  add("ok", "Modo de Mercado Pago", live ? "LIVE (plata real)" : "SANDBOX (pruebas)");
  const args = [path.join(__dirname, "mp-readiness.js"), flag("skip-rehearsal") ? "--no-rehearsal" : ""].filter(Boolean);
  const r = spawnSync(process.execPath, args, { env, encoding: "utf8", timeout: 180000 });
  const out = (r.stdout || "").split("\n");
  for(const ln of out){
    let m;
    if((m = /^\s*\[ok\]\s+(.*)$/.exec(ln))) add("ok", m[1].trim());
    else if((m = /^\s*\[FALTA\]\s+(.*?)\s+->\s+(.*)$/.exec(ln))) add(BLOCK, m[1].trim(), "falta", m[2]);
    else if((m = /^\s*\[aviso\]\s+(.*?)\s+->\s+(.*)$/.exec(ln))) add("warn", m[1].trim(), "", m[2]);
  }
  if(!flag("skip-rehearsal")){
    const m = /ENSAYO OK: (\d+) comprobaciones/.exec(r.stdout || "");
    chk(!!m, "Ensayo con Mercado Pago FALSO (webhook firmado, acreditación única, reembolso, contracargo)", { okDetail: m ? m[1] + " comprobaciones, sin red externa" : "", detail: "falló o no terminó", hint: "corré node tools/release/mp-readiness.js y mirá el detalle" });
  }
  add("warn", "La prueba contra TU cuenta real de Mercado Pago (sandbox y compra real)", "no se puede automatizar acá", "ver docs/commercial/MERCADO_PAGO_PASO_A_PASO.md y el checklist");
}

/* ================================================================ 4. interruptores del juego, legal, carga */
function gameSection(){
  sec("Interruptores del juego");
  const pricing = readSafe(path.join(ROOT, "js/data/pricing.js")) || "", post = readSafe(path.join(ROOT, "js/data/postgame.js")) || "";
  const shop = (/var SHOP_MODE\s*=\s*"(\w+)"/.exec(pricing) || [])[1], gate = (/var POSTGAME_GATE\s*=\s*"(\w+)"/.exec(post) || [])[1];
  add(shop ? (LAUNCH && shop === "demo" ? "warn" : "ok") : "warn", "SHOP_MODE (js/data/pricing.js)", shop ? shop + (shop === "demo" ? " = catálogo completo siempre" : " = rotación diaria y precios altos") : "no se pudo leer",
    "confirmá a propósito si el lanzamiento va en demo o en live; tools/collection/t_shop_rotation.js prueba ambos");
  add(gate ? (LAUNCH && gate === "open" ? "warn" : "ok") : "warn", "POSTGAME_GATE (js/data/postgame.js)", gate ? gate + (gate === "open" ? " = Cristales/Coliseo abiertos (alfa)" : " = cerrado hasta terminar la campaña") : "no se pudo leer",
    "confirmá a propósito si el lanzamiento deja el postgame abierto");
}
function legalSection(){
  sec("Legal y soporte");
  for(const f of ["POLITICA_DE_PRIVACIDAD.md", "TERMINOS_Y_CONDICIONES.md", "POLITICA_DE_REEMBOLSOS.md"]) chk(fs.existsSync(path.join(ROOT, "docs/legal", f)), "docs/legal/" + f + " existe", { hint: "falta el texto base" });
  const cfgSrc = readSafe(path.join(ROOT, "js/data/legal-config.js")) || "";
  const draft = !/draft:\s*false/.test(cfgSrc), mail = (/supportEmail:\s*"([^"]*)"/.exec(cfgSrc) || [])[1] || "";
  chk(/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(mail), "Correo de soporte configurado (js/data/legal-config.js)", { ifNot: BLOCK, detail: "vacío", hint: "poné un correo REAL en supportEmail y corré node tools/release/build-legal.js" });
  chk(!draft, "Los textos legales ya no figuran como borrador", { ifNot: BLOCK, detail: "draft: true", hint: "solo cuando un abogado los apruebe y completes los [CORCHETES] (CHECKLIST, sección Legal)" });
  const chkb = spawnSync(process.execPath, [path.join(__dirname, "build-legal.js"), "--check"], { encoding: "utf8", timeout: 20000 });
  chk(chkb.status === 0, "legal/*.html está al día con docs/legal/ y la configuración", { detail: "desactualizado", hint: "corré node tools/release/build-legal.js y volvé a publicar" });
  let ph = 0; for(const f of ["privacidad", "terminos", "reembolsos"]) ph += ((readSafe(path.join(ROOT, "legal", f + ".html")) || "").match(/class="ph"/g) || []).length;
  chk(ph === 0, "Sin marcas 'falta completar' en las páginas legales", { ifNot: BLOCK, detail: ph + " marca(s) amarillas todavía", hint: "completá los [CORCHETES] en docs/legal/*.md (razón social, CUIT, domicilio, plazos…) y regenerá" });
  const idx = readSafe(path.join(siteDir, "index.html")) || "";
  chk(/id="legal-title"/.test(idx) && /id="legal-opts"/.test(idx), "El juego enlaza lo legal en la portada y en Opciones", { detail: "faltan los contenedores en index.html" });
  let linked = false;
  const walk = (d, depth) => { if(linked || depth > 3) return; let ents = []; try{ ents = fs.readdirSync(d, { withFileTypes: true }); }catch(e){ return; }
    for(const e of ents){ const p = path.join(d, e.name); if(e.isDirectory()) walk(p, depth + 1); else if(e.name.endsWith(".js") && (readSafe(p) || "").includes("horda_legal_terms")){ linked = true; return; } } };
  walk(path.join(siteDir, "js"), 0);
  chk(linked, "El código de aceptación de términos y primera compra está en el sitio", { detail: "no se encontró js/ui/legal.js (ni en paquetes)" });
  if(distDir){ for(const f of ["index", "privacidad", "terminos", "reembolsos"]) chk(fs.existsSync(path.join(distDir, "legal", f + ".html")), "dist/legal/" + f + ".html existe", { hint: "el build no copió legal/ (tools/build-static.mjs)" }); }
}
function sizeSection(){
  sec("Carga inicial (portada)");
  const html = readSafe(path.join(siteDir, "index.html")); if(!html){ add("warn", "No se pudo leer index.html"); return; }
  const refs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m => m[1]).concat([...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map(m => m[1])).filter(u => !/^https?:/.test(u));
  let raw = Buffer.byteLength(html), gz = zlib.gzipSync(html).length, missing = 0;
  for(const r of refs){ try{ const b = fs.readFileSync(path.join(siteDir, r.split("?")[0])); raw += b.length; gz += zlib.gzipSync(b, { level: 6 }).length; }catch(e){ missing++; } }
  const mb = n => (n / 1048576).toFixed(2) + " MB";
  const scripts = refs.filter(r => /\.js(\?|$)/.test(r)).length;
  add(missing ? "fail" : "ok", "Archivos que pide la portada existen", missing ? missing + " faltan" : refs.length + " archivos (" + scripts + " scripts + estilos)", "el index.html apunta a archivos que no están en " + (path.relative(ROOT, siteDir) || "."));
  add(scripts <= 80 ? "ok" : "warn", "Cantidad de pedidos de scripts", scripts + (scripts <= 80 ? " (empaquetado)" : " (sin empaquetar)"), "construí con GAME_PERF=1: junta ~450 scripts en ~25 pedidos y activa el caché por hash");
  add(gz <= 4 * 1048576 ? "ok" : gz <= 8 * 1048576 ? "warn" : "fail", "Peso de scripts + estilos + HTML de la portada", `${mb(raw)} sin comprimir · ${mb(gz)} comprimido (gzip)`, "pesado para un celular con datos; revisá el empaquetado/minificado");
  const sw = readSafe(path.join(siteDir, "sw.js")), crit = sw && /const CRITICAL = (\[[^\]]*\])/.exec(sw);
  if(crit){ try{ const list = JSON.parse(crit[1]); let b = 0; for(const f of list){ try{ b += fs.statSync(path.join(siteDir, f.split("?")[0])).size; }catch(e){} }
      add(list.length ? "ok" : "warn", "Archivos críticos que baja el service worker al instalar", list.length ? `${list.length} archivos, ${mb(b)}` : "ninguno (sin estampar)", "construí con GAME_PERF=1"); }catch(e){} }
  if(siteDir === ROOT || !distDir) add("ok", "Peso total de assets/ (se bajan a demanda)", (() => { let t = 0; const w = d => { try{ for(const e of fs.readdirSync(d, { withFileTypes: true })){ const p = path.join(d, e.name); e.isDirectory() ? w(p) : t += fs.statSync(p).size; } }catch(e){} }; w(path.join(siteDir, "assets")); return mb(t); })());
}

/* ================================================================ 5. secretos en el repositorio */
const SECRET_PATTERNS = [
  ["token de Mercado Pago (APP_USR-…)", /APP_USR-[0-9A-Za-z_-]{16,}/],
  ["token de prueba de Mercado Pago (TEST-…)", /\bTEST-\d{8,}-\d{4,}-[0-9a-f]{16,}/],
  ["variable secreta con valor", /\b(MP_ACCESS_TOKEN|MP_WEBHOOK_SECRET|PAYMENTS_ORDER_SECRET|PAYMENTS_WEBHOOK_SECRET|FOUNDER_SIGNUP_CODE)\s*[=:]\s*["']?([A-Za-z0-9_-]{16,})/],
  ["clave privada", /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ["token de GitHub", /\b(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/],
  ["clave de AWS", /\bAKIA[0-9A-Z]{16}\b/],
  ["clave secreta de Stripe", /\bsk_live_[A-Za-z0-9]{16,}/]
];
const PH_RE = /x{4,}|\.\.\.|…|<|>|\$\{|\bTU_|\bTU-|EJEMPLO|ejemplo|example|placeholder|changeme|password|clave|contraseña|secreto|YOUR|\*{3,}|0{8,}|abc123|^[a-z]+_[a-z]+$/i;
const FAKE_RE = /test|ensayo|falso|fake|dummy|mock|sandbox|local-only/i;
function secretScan(){
  sec("Secretos en el repositorio (escaneo simple de patrones)");
  let files = [];
  const g = spawnSync("git", ["ls-files", "-z"], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 30000 });
  if(g.status === 0) files = g.stdout.split("\0").filter(Boolean);
  else { const w = d => { for(const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })){ if(["node_modules", ".git", "dist"].includes(e.name)) continue; const r = path.join(d, e.name); e.isDirectory() ? w(r) : files.push(r); } }; w("."); }
  const SKIP = /\.(png|jpe?g|gif|webp|mp3|ogg|wav|ttf|woff2?|ico|zip|pdf|mp4|psd|aseprite|webm|bin|gz|map)$/i;
  const found = []; let scanned = 0;
  for(const rel of files){
    if(SKIP.test(rel)) continue;
    let st; try{ st = fs.statSync(path.join(ROOT, rel)); }catch(e){ continue; }
    if(!st.isFile() || st.size > 1500000) continue;
    let txt; try{ txt = fs.readFileSync(path.join(ROOT, rel), "utf8"); }catch(e){ continue; }
    scanned++;
    const lines = txt.split("\n");
    for(let i = 0; i < lines.length; i++){
      const ln = lines[i]; if(ln.length > 4000) continue;
      for(const [name, re] of SECRET_PATTERNS){
        const m = re.exec(ln); if(!m) continue;
        const val = m[2] || m[0]; if(PH_RE.test(ln.slice(Math.max(0, m.index - 30), m.index + m[0].length + 30)) && name !== "clave privada") continue;
        // valores obviamente falsos de las pruebas ("test-webhook-secret…", "APP_USR-ensayo-token-falso"): una credencial real nunca los trae
        if((name.startsWith("token de Mercado Pago") || name === "variable secreta con valor") && FAKE_RE.test(val)) continue;
        found.push(`${rel}:${i + 1} (${name})`);
      }
      const u = /postgres(?:ql)?:\/\/([^\s:@/]+):([^\s@/]+)@([^\s/:?]+)/.exec(ln);
      if(u && !["127.0.0.1", "localhost", "::1"].includes(u[3]) && !PH_RE.test(u[2]) && !PH_RE.test(u[1])) found.push(`${rel}:${i + 1} (dirección de base de datos con contraseña)`);
    }
  }
  chk(found.length === 0, "Ninguna credencial a la vista en los archivos del repo (" + scanned + " revisados)", { detail: found.length + " hallazgo(s): " + found.slice(0, 8).join(", ") + (found.length > 8 ? "…" : ""), hint: "sacala del repo, REVOCALA en el proveedor (ya quedó en el historial de Git) y cargala solo en el servidor" });
  const tracked = files.filter(f => /(^|\/)(\.env(\..*)?|.*\.pem|id_rsa.*)$/.test(f) && !/\.example$/.test(f));
  chk(tracked.length === 0, "Ningún .env ni clave (.pem) versionado", { detail: tracked.slice(0, 5).join(", "), hint: "git rm --cached y agregalo a .gitignore" });
}

/* ================================================================ 6. red: sitio y servidor */
async function siteSection(){
  const url = opt("url"); sec("Sitio público");
  if(!url){ add("warn", "No se pasó --url (HTTPS, cabeceras y legal publicado sin revisar)", "", "ej.: --url https://fondalstudios.com/la-horda/jugar/"); return; }
  if(OFFLINE){ add("warn", "--offline: sitio sin revisar"); return; }
  let u; try{ u = new URL(url); }catch(e){ add("fail", "--url inválida"); return; }
  const local = isLocal(url), base = url.endsWith("/") ? url : url + "/";
  chk(u.protocol === "https:" || local, "El sitio se sirve por HTTPS", { ifNot: "fail", detail: local ? "" : "es http://", hint: "Mercado Pago y las cuentas exigen HTTPS (certbot, guía paso 6)" });
  if(local && u.protocol !== "https:") add("warn", "Sitio local por http: HTTPS y certificado no se pueden revisar", "", "repetí con la URL pública real");
  if(u.protocol === "https:" && !local){
    const c = await certDays(u.hostname, +u.port || 443);
    if(c.error) add("fail", "Certificado TLS válido", c.error, "revisá el certificado (certbot renew)");
    else { chk(c.authorized, "Certificado TLS de confianza", { detail: String(c.err || ""), hint: "certificado vencido, de otro dominio o autofirmado" });
      add(c.days > 21 ? "ok" : c.days > 7 ? "warn" : "fail", "Vencimiento del certificado", `faltan ${c.days} días · ${c.proto}`, "sudo certbot renew (y revisá el timer: systemctl list-timers | grep certbot)"); }
    const h = await http("http://" + u.host + "/", { method: "GET" });
    chk(h.ok && [301, 302, 307, 308].includes(h.status) && /^https:/.test(h.headers.get("location") || ""), "http:// redirige a https://", { ifNot: "warn", detail: h.ok ? "responde " + h.status : "no responde en el puerto 80", hint: "agregá el server de puerto 80 con return 301 (deploy/nginx/fondalstudios.example.conf)" });
  }
  const r = await http(base, { headers: { "accept-encoding": "gzip" } });
  if(!r.ok){ add("fail", "La portada responde", r.error, "revisá nginx/Apache y la ruta"); return; }
  chk(r.status === 200, "La portada responde 200", { detail: "responde " + r.status, hint: "revisá la ruta /la-horda/jugar/ y /var/www/la-horda/current" });
  const hd = n => r.headers.get(n) || "";
  chk(/max-age=\d{5,}/.test(hd("strict-transport-security")), "Cabecera HSTS", { ifNot: "warn", detail: hd("strict-transport-security") ? "max-age corto (normal mientras probás)" : "falta", hint: "deploy/nginx/la-horda-headers.inc; cuando todo ande, max-age=31536000" });
  chk(/nosniff/i.test(hd("x-content-type-options")), "X-Content-Type-Options: nosniff", { ifNot: "warn", hint: "deploy/nginx/la-horda-headers.inc" });
  chk(/frame-ancestors/i.test(hd("content-security-policy")) || !!hd("x-frame-options"), "Protección contra marcos (clickjacking)", { ifNot: "warn", hint: "CSP frame-ancestors o X-Frame-Options" });
  chk(!!hd("referrer-policy"), "Referrer-Policy", { ifNot: "warn", hint: "deploy/nginx/la-horda-headers.inc" });
  chk(/no-cache|max-age=0|no-store/i.test(hd("cache-control")), "La portada no queda cacheada de más", { ifNot: "warn", detail: hd("cache-control") || "sin Cache-Control", hint: "index.html debe ir con no-cache (deploy/nginx/la-horda-locations.inc)" });
  chk(/gzip|br/i.test(hd("content-encoding")), "Compresión (gzip) activa", { ifNot: "warn", hint: "gzip on; en nginx (deploy/nginx/la-horda-http.conf)" });
  add("ok", "Tiempo de respuesta de la portada", r.ms + " ms");
  chk(/id="legal-title"/.test(r.body), "La portada publicada incluye los enlaces legales", { detail: "el sitio publicado es una versión vieja", hint: "actualizá (deploy/update.sh)" });
  for(const f of ["privacidad", "terminos", "reembolsos"]){ const p = await http(base + "legal/" + f + ".html"); chk(p.ok && p.status === 200 && /<h1>/.test(p.body), "Publicado: " + new URL("legal/" + f + ".html", base).pathname, { ifNot: BLOCK, detail: p.ok ? "responde " + p.status : p.error, hint: "falta legal/ en el sitio publicado" }); }
}
function wsProbe(url, origin){
  return new Promise(res => {
    let WS; try{ WS = require(require.resolve("ws", { paths: [path.join(ROOT, "server")] })); }catch(e){ return res({ skipped: "no se encontró el módulo ws (npm ci en server/)" }); }
    const t = setTimeout(() => { try{ w.terminate(); }catch(e){} res({ error: "TIMEOUT" }); }, 8000);
    const w = new WS(url, { origin, handshakeTimeout: 7000 });
    w.on("open", () => w.send(JSON.stringify({ t: "ping", c: 1 })));
    w.on("message", d => { let j = {}; try{ j = JSON.parse(d.toString()); }catch(e){} clearTimeout(t); try{ w.close(); }catch(e){} res({ msg: j }); });
    w.on("close", (code) => { clearTimeout(t); res({ closed: code }); });
    w.on("error", e => { clearTimeout(t); res({ error: e.message }); });
  });
}
async function relaySection(){
  sec("Servidor de salas, cuentas y pagos (relay)");
  let relay = opt("relay") || (has("GAME_RELAY_URL") ? env.GAME_RELAY_URL.replace(/^ws/, "http") : "");
  if(!relay){ add("warn", "No se pasó --relay: salud, base persistente, CORS, WebSocket y webhook sin revisar", "", "ej.: --relay https://fondalstudios.com/la-horda/red  (o http://127.0.0.1:8787 estando en el servidor)"); return; }
  if(OFFLINE){ add("warn", "--offline: servidor sin revisar"); return; }
  relay = relay.replace(/\/+$/, "");
  let ru; try{ ru = new URL(relay); }catch(e){ add("fail", "--relay inválida"); return; }
  const siteUrl = opt("url"), origin = siteUrl ? new URL(siteUrl).origin : ((env.ALLOWED_ORIGINS || "").split(",")[0] || "").trim();
  chk(ru.protocol === "https:" || isLocal(relay), "El servidor se sirve por HTTPS/WSS", { detail: "http://", hint: "el juego en HTTPS no puede hablar con un ws:// (el navegador lo bloquea)" });
  const h = await http(relay + "/health");
  if(!h.ok){ add("fail", "GET /health", h.error, "el servidor no responde: systemctl status la-horda · journalctl -u la-horda -n 50"); return; }
  chk(h.status === 200 && /relay OK/.test(h.body), "GET /health: el relay responde", { detail: "status " + h.status, hint: "revisá la ruta del proxy (la barra final de proxy_pass recorta /la-horda/red)" });
  add("ok", "Latencia de /health", h.ms + " ms");
  const l2 = (h.body.split("\n")[1] || "").trim();
  chk(/Postgres .*OK|DISCO PERSISTENTE .*OK/.test(l2), "Cuentas: " + (l2.replace(/ · AVISO.*$/, "") || "sin línea de cuentas"), { ifNot: BLOCK, hint: "ver docs/ACCOUNTS_DEPLOY.md (DATABASE_URL)" });
  const a = await http(relay + "/api/health"); let j = null; try{ j = JSON.parse(a.body); }catch(e){}
  if(j){ chk(j.ok === true && j.status === "ready", "GET /api/health: cuentas listas", { detail: JSON.stringify({ ok: j.ok, status: j.status }), hint: "mirá journalctl -u la-horda" });
    chk(j.persistent === true, "Almacenamiento PERSISTENTE (persistent:true)", { ifNot: BLOCK, detail: "persistent:" + j.persistent + " store:" + j.store, hint: "sin esto el servidor se niega a cobrar; configurá DATABASE_URL" });
    chk(j.store === "postgres", "Las cuentas viven en Postgres", { ifNot: "warn", detail: "store:" + j.store, hint: "recomendado para cobrar" }); }
  else add("fail", "GET /api/health devuelve JSON", "status " + a.status, "la ruta /api no llega al juego");
  const ro = await http(relay + "/api/rooms"); let rj = null; try{ rj = JSON.parse(ro.body); }catch(e){}
  chk(ro.ok && ro.status === 200 && rj && typeof rj.protocol === "number", "GET /api/rooms (salas públicas)", { ifNot: "warn", detail: "status " + ro.status });
  // CORS
  if(origin){
    const c1 = await http(relay + "/api/health", { method: "OPTIONS", headers: { origin, "access-control-request-method": "GET" } });
    chk(c1.ok && c1.headers.get("access-control-allow-origin") === origin, "CORS: el sitio (" + origin + ") puede usar la API", { detail: c1.ok ? "status " + c1.status : c1.error, hint: "agregá el origen del sitio a ALLOWED_ORIGINS y reiniciá" });
    const bad = "https://sitio-ajeno.invalid";
    const c2 = await http(relay + "/api/health", { method: "OPTIONS", headers: { origin: bad, "access-control-request-method": "GET" } });
    chk(c2.ok && c2.status === 403, "CORS: un sitio ajeno es rechazado (403)", { ifNot: "warn", detail: c2.ok ? "status " + c2.status : c2.error, hint: "ALLOWED_ORIGINS vacío o no estricto: poné ALLOWED_ORIGINS y ALLOWED_ORIGINS_STRICT=1" });
  } else add("warn", "CORS sin revisar", "", "pasá --url o definí ALLOWED_ORIGINS");
  // webhook: sin firma tiene que rechazarse con 400 (prueba que la ruta llega y que no acredita nada)
  const wb = await http(relay + "/api/payments/webhook?data.id=123456&type=payment", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
  chk(wb.ok && wb.status === 400, "Webhook de pagos: llega al juego y rechaza lo no firmado (400)", { detail: wb.ok ? "status " + wb.status : wb.error, hint: "404 = el proxy no deja pasar /api/payments/webhook; 5xx = el servidor falla" });
  // WebSocket
  const wsu = relay.replace(/^http/, "ws");
  const p1 = await wsProbe(wsu, origin || undefined);
  if(p1.skipped) add("warn", "WebSocket sin revisar", p1.skipped);
  else chk(p1.msg && p1.msg.t === "pong", "WebSocket (salas): conecta y contesta ping", { detail: JSON.stringify(p1).slice(0, 120), hint: "el proxy tiene que pasar Upgrade/Connection (deploy/nginx/la-horda-proxy.inc)" });
  if(!p1.skipped){ const p2 = await wsProbe(wsu, "https://sitio-ajeno.invalid");
    chk(!(p2.msg && p2.msg.t === "pong"), "WebSocket: un origen ajeno es rechazado", { ifNot: "warn", hint: "ALLOWED_ORIGINS + ALLOWED_ORIGINS_STRICT=1" }); }
}
function backupSection(){
  sec("Copias de seguridad y disco");
  const dir = opt("backup-dir") || "/var/backups/la-horda";
  let list = []; try{ list = fs.readdirSync(dir).filter(f => /\.(dump|tar\.gz)$/.test(f)).map(f => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs, s: fs.statSync(path.join(dir, f)).size })).sort((a, b) => b.t - a.t); }catch(e){}
  if(!list.length) add(BLOCK, "Hay una copia de seguridad reciente", "no se encontraron copias en " + dir, "corré tools/release/backup.sh y programalo (guía, paso 8); probá también la restauración");
  else { const age = (Date.now() - list[0].t) / 3600000;
    add(age <= 26 ? "ok" : age <= 72 ? "warn" : BLOCK, "Copia de seguridad más reciente", `${list[0].f} · hace ${age.toFixed(1)} h · ${(list[0].s / 1048576).toFixed(2)} MB · ${list.length} copias`, "programá el backup diario (cron) y revisá que corra");
    add(list[0].s > 0 ? "ok" : "fail", "La copia no está vacía"); }
  try{ const s = fs.statfsSync(fs.existsSync(dir) ? dir : "/"); const free = s.bavail * s.bsize / 1073741824; add(free > 2 ? "ok" : free > 0.5 ? "warn" : "fail", "Espacio libre en disco", free.toFixed(1) + " GB", "liberá espacio o ampliá el disco"); }catch(e){}
  add("warn", "La RESTAURACIÓN de una copia está probada", "no se puede saber desde acá", "restaurá una copia en una base de prueba con tools/release/restore.sh y anotalo en el checklist");
}
function systemdSection(){
  if(!fs.existsSync("/etc/systemd/system/la-horda.service")) return;
  sec("Servicio (systemd)");
  const a = spawnSync("systemctl", ["is-active", "la-horda"], { encoding: "utf8" }), e = spawnSync("systemctl", ["is-enabled", "la-horda"], { encoding: "utf8" });
  chk(a.stdout.trim() === "active", "El servicio la-horda está activo", { detail: a.stdout.trim(), hint: "sudo systemctl status la-horda · journalctl -u la-horda -n 80" });
  chk(e.stdout.trim() === "enabled", "El servicio arranca solo con el servidor", { ifNot: "warn", detail: e.stdout.trim(), hint: "sudo systemctl enable la-horda" });
}

/* ================================================================ salida */
(async () => {
  versionSection(); envSection(); mpSection(); gameSection(); legalSection(); sizeSection(); secretScan();
  await siteSection(); await relaySection(); backupSection(); systemdSection();
  const count = l => rows.filter(r => r.level === l).length, nOk = count("ok"), nWarn = count("warn"), nFail = count("fail");
  if(flag("json")){
    console.log(JSON.stringify({ mode: LAUNCH ? "launch" : "previo", ok: nOk, warn: nWarn, fail: nFail, ready: nFail === 0, rows }, null, 2));
  } else {
    const color = !flag("no-color") && process.stdout.isTTY && !process.env.NO_COLOR;
    const C = { ok: "\x1b[32m", warn: "\x1b[33m", fail: "\x1b[31m", b: "\x1b[1m", z: "\x1b[0m" };
    const paint = (l, s) => color ? C[l] + s + C.z : s;
    const LBL = { ok: "[VERDE]   ", warn: "[AMARILLO]", fail: "[ROJO]    " };
    console.log(`\nLA HORDA · PREFLIGHT TOTAL · ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC · modo: ${LAUNCH ? "ANTES DE PRENDER MP_ENABLED=1 (--launch)" : "previo al lanzamiento"}`);
    let last = "";
    for(const r of rows){
      if(r.section !== last){ last = r.section; console.log(`\n== ${r.section} ==`); }
      console.log(`  ${paint(r.level, LBL[r.level])} ${r.name}${r.detail ? "  —  " + r.detail : ""}`);
    }
    console.log(`\nResumen: ${paint("ok", nOk + " verdes")} · ${paint("warn", nWarn + " amarillos")} · ${paint("fail", nFail + " rojos")}`);
    const todo = rows.filter(r => r.level !== "ok" && r.hint);
    if(todo.length){ console.log("\nQué hacer ahora (rojos primero):"); for(const r of [...todo.filter(x => x.level === "fail"), ...todo.filter(x => x.level === "warn")]) console.log(`  ${r.level === "fail" ? "ROJO    " : "AMARILLO"} ${r.name}\n             -> ${r.hint}`); }
    console.log("\n" + paint(nFail ? "fail" : nWarn ? "warn" : "ok", LAUNCH
      ? (nFail ? "VEREDICTO: NO LISTO PARA COBRAR. Hay rojos." : nWarn ? "VEREDICTO: SIN ROJOS, pero revisá los amarillos antes de prender MP_ENABLED=1." : "VEREDICTO: TODO VERDE. Podés seguir con el checklist final.")
      : (nFail ? "VEREDICTO: hay rojos que arreglar." : "VEREDICTO: sin rojos. Los amarillos son lo que falta para cobrar (corré con --launch cuando estés por prender el cobro).")));
    console.log("\nOJO: verde acá NO prueba tu cuenta real de Mercado Pago, la restauración de la base, los textos legales aprobados por un abogado ni la carga real de jugadores. Eso está en el checklist.");
  }
  process.exitCode = nFail ? 1 : (flag("strict") && nWarn ? 1 : 0);
})().catch(e => { console.error("El preflight falló:", e && e.stack || e); process.exitCode = 2; });
