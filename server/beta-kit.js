"use strict";
/* ============================================================
   LA HORDA — KIT DE BETA CERRADA (todo APAGADO por defecto)

   Tres piezas independientes, cada una con su variable de entorno. Sin variables, el servidor se comporta
   exactamente igual que antes (no hay rutas nuevas activas, /api/health solo agrega beta:{...} en false).

   1. CÓDIGOS DE INVITACIÓN  BETA_INVITE_CODES="HORDA-AMIGOS,PRENSA-2026:20,sha256:<64 hex>:5"
      - Si la variable tiene algo, crear una cuenta NUEVA exige un código válido (sin distinguir mayúsculas,
        sin espacios en los extremos). Las cuentas que ya existen siguen entrando igual.
      - "codigo:N" = como mucho N cuentas con ese código. Sin ":N" = sin tope.
      - "sha256:<hex>[:N]" = el código guardado como hash (tools/beta/invite-hash.js lo calcula), para no
        dejar el código en claro en la configuración.
      - Los códigos no se guardan nunca en la base: solo su hash y cuántas veces se usaron.
      - Si la variable tiene texto pero ningún código válido, la puerta queda CERRADA (nadie crea cuentas)
        y se avisa en el registro del servidor: nunca se abre por un error de tipeo.
      - Jugar como invitado y sin conexión sigue igual: la puerta solo controla la creación de cuentas.
   2. REPORTES DE JUGADORES  BETA_REPORTS=1 (si hay códigos de invitación, se prende sola; BETA_REPORTS=0 la apaga)
      POST /api/beta/report {category: bug|balance|idea|otro, text (hasta 1000), context}. Con la puerta de
      invitación prendida hace falta sesión. Límite por cuenta/IP y tamaño. Se guarda el id de cuenta (si hay),
      nunca IP ni correo; los correos escritos en el texto se tapan.
   3. ERRORES DE JAVASCRIPT  BETA_ERROR_REPORTS=1
      POST /api/beta/errors {build, errors:[{message, src, line, col, count}]}: agrupados por firma
      (build + mensaje + archivo:línea) con contador. Sin cuenta, sin IP, sin URL completa (solo la ruta).

   Lectura para administración (permiso VIEW_USERS, el panel Game Master → pestaña "Beta cerrada"):
     GET /api/gm/beta/reports?limit=100   GET /api/gm/beta/errors?limit=100   GET /api/gm/beta/invites
   Guía del dueño: docs/beta-release/BETA_CERRADA_OPERADOR.md
   ============================================================ */
const crypto = require("crypto");

const CATEGORIES = ["bug", "balance", "idea", "otro"];
const REPORT_TEXT_MAX = 1000, REPORT_BODY_BYTES = 8 * 1024, ERROR_BODY_BYTES = 8 * 1024;
const REPORTS_KEEP = 5000, ERROR_SIGNATURES_MAX = 1000;
const REPORT_WINDOW_MS = 10 * 60 * 1000, REPORTS_PER_KEY = 5, REPORTS_PER_IP_HOUR = 15;
const ERROR_WINDOW_MS = 10 * 60 * 1000, ERROR_POSTS_PER_IP = 30, ERRORS_PER_POST = 10;

function normCode(s){ return String(s == null ? "" : s).normalize("NFC").trim().toLowerCase(); }
function hashCode(code){ return crypto.createHash("sha256").update("la-horda-beta-invite:" + normCode(code)).digest("hex"); }
// "A,B:20,sha256:<hex>:5" -> {codes: Map(hash -> {hash, max, label}), invalid}
function parseInviteCodes(raw){
  const codes = new Map(); let invalid = 0;
  for(const part of String(raw == null ? "" : raw).split(/[,\n;]/)){
    const s = part.trim(); if(!s) continue;
    let m = /^sha256:([a-f0-9]{64})(?::(\d{1,6}))?$/i.exec(s), hash, max, label;
    if(m){ if(m[2] !== undefined && +m[2] === 0){ invalid++; continue; } hash = m[1].toLowerCase(); max = +(m[2] || 0); label = "sha256:" + hash.slice(0, 8); }
    else {
      m = /^([^:]+?)(?::(\d{1,6}))?$/.exec(s);
      const code = m ? normCode(m[1]) : "";
      if(code.length < 4 || code.length > 64 || (m && m[2] !== undefined && +m[2] === 0)){ invalid++; continue; } // ":0" no es "sin tope": se ignora (código cerrado)
      hash = hashCode(code); max = +(m[2] || 0); label = code.slice(0, 2).toUpperCase() + "…(" + code.length + ")";
    }
    codes.set(hash, { hash, max, label });
  }
  return { codes, invalid };
}
const flag = (v, def) => { const s = String(v == null ? "" : v).trim(); return s === "" ? def : s === "1" || /^(true|on|si|sí|yes)$/i.test(s); };

// Saca datos personales obvios de un texto libre: correos y la parte de "?query" / "#hash" de las URL.
function scrub(s, max){
  return String(s == null ? "" : s).replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, " ")
    .replace(/[^\s@<>()]{1,64}@[^\s@<>()]{1,100}\.[a-z]{2,20}/gi, "[correo]")
    .replace(/(https?:\/\/[^\s?#)]*)[?#][^\s)]*/gi, "$1")
    .slice(0, max);
}
// Solo la ruta del archivo (sin dominio ni query): "js/net/account.js"
function srcPath(s){
  let v = String(s == null ? "" : s).slice(0, 400);
  try{ if(/^[a-z]+:\/\//i.test(v)) v = new URL(v).pathname; }catch(e){ v = ""; }
  return v.replace(/[?#].*$/, "").replace(/[^\w./@-]/g, "").replace(/^.*?\/(js|css|server|tools)\//, "$1/").slice(-160);
}
const str = (v, n) => typeof v === "string" ? scrub(v, n).trim() : undefined;
const int = (v, lo, hi) => Number.isFinite(v) ? Math.max(lo, Math.min(hi, Math.round(v))) : undefined;
function cleanContext(c){
  if(!c || typeof c !== "object" || Array.isArray(c)) return {};
  const o = {};
  for(const [k, n] of [["build", 60], ["state", 40], ["arena", 40], ["champion", 40], ["mode", 40], ["lang", 8], ["ua", 200]]){ const v = str(c[k], n); if(v) o[k] = v; }
  const lv = int(c.level, 0, 9999); if(lv !== undefined) o.level = lv;
  if(typeof c.viewport === "string" && /^\d{2,5}x\d{2,5}(@[\d.]{1,5})?$/.test(c.viewport)) o.viewport = c.viewport;
  if(Array.isArray(c.errors)) o.errors = c.errors.slice(-5).map(e => str(e, 300)).filter(Boolean);
  return o;
}

function create(ctx){
  const { getStore, auth, send, err, readBody, tooMany, adminAuth, Limiter, log } = ctx;
  const now = ctx.now || Date.now;
  const o = ctx.options || {};
  const rawCodes = o.inviteCodes !== undefined ? o.inviteCodes : process.env.BETA_INVITE_CODES;
  const inviteOn = String(rawCodes == null ? "" : rawCodes).trim() !== "";
  const { codes, invalid } = parseInviteCodes(rawCodes);
  const reportsOn = flag(o.reports !== undefined ? o.reports : process.env.BETA_REPORTS, inviteOn);
  const errorsOn = flag(o.errors !== undefined ? o.errors : process.env.BETA_ERROR_REPORTS, false);
  if(inviteOn) log("BETA_INVITE_GATE", { codes: codes.size, invalid, warning: codes.size ? undefined : "BETA_INVITE_CODES no tiene ningún código válido: nadie puede crear cuentas" });
  if(reportsOn || errorsOn) log("BETA_REPORTS", { reports: reportsOn, errors: errorsOn });
  const hits = new Limiter();
  const sweep = setInterval(() => hits.sweep(), 10 * 60 * 1000); if(sweep.unref) sweep.unref();
  const limited = (key, max, windowMs) => { if(hits.count(key) >= max) return hits.retryAfter(key); hits.hit(key, windowMs); return 0; };

  const INVITE_MSG = {
    INVITE_REQUIRED: "La beta es cerrada: necesitás un código de invitación para crear tu cuenta.",
    INVITE_INVALID: "Ese código de invitación no es válido. Revisalo o pedile uno nuevo a quien te invitó.",
    INVITE_EXHAUSTED: "Ese código de invitación ya se usó todas las veces permitidas. Pedí uno nuevo."
  };
  // Reserva un uso del código ANTES de crear la cuenta (atómico en el almacenamiento). Si la creación falla, release().
  async function reserveInvite(given){
    if(!inviteOn) return { ok: true, hash: null };
    const c = normCode(typeof given === "string" ? given.slice(0, 128) : "");
    if(!c) return { error: "INVITE_REQUIRED", msg: INVITE_MSG.INVITE_REQUIRED };
    const entry = codes.get(hashCode(c));
    if(!entry) return { error: "INVITE_INVALID", msg: INVITE_MSG.INVITE_INVALID };
    const r = await getStore().betaInviteUse(entry.hash, entry.max, now());
    if(!r.ok) return { error: "INVITE_EXHAUSTED", msg: INVITE_MSG.INVITE_EXHAUSTED };
    log("BETA_INVITE_USED", { code: entry.label, uses: r.uses, max: entry.max || null });
    return { ok: true, hash: entry.hash };
  }
  async function releaseInvite(hash){ if(hash) await getStore().betaInviteRelease(hash).catch(() => {}); }
  function info(){ return { invite: inviteOn, reports: reportsOn, errors: errorsOn }; }

  const off = (req, res) => err(req, res, 404, "BETA_OFF", "Esta función de la beta no está activa en este servidor.");
  const limitParam = (req, def) => Math.max(1, Math.min(500, parseInt(new URL(req.url, "http://x").searchParams.get("limit") || String(def), 10) || def));
  const routes = {
    "POST /api/beta/report": async (req, res, ip) => {
      if(!reportsOn){ req.resume(); return off(req, res); }
      let user = null;
      if(req.headers.authorization){ const a = await auth(req); if(a.user) user = a.user; }
      if(inviteOn && !user){ req.resume(); return err(req, res, 401, "NO_SESSION", "Entrá a tu cuenta para mandar un reporte."); }
      const wait = limited(user ? "rep:u:" + user.id : "rep:ip:" + ip, REPORTS_PER_KEY, REPORT_WINDOW_MS) || limited("rep:iph:" + ip, REPORTS_PER_IP_HOUR, 60 * 60 * 1000);
      if(wait){ req.resume(); return tooMany(req, res, wait); }
      const body = await readBody(req, REPORT_BODY_BYTES);
      if(!CATEGORIES.includes(body.category)) return err(req, res, 400, "BAD_CATEGORY", "Elegí una categoría: bug, balance, idea u otro.");
      if(typeof body.text !== "string" || body.text.trim().length < 3) return err(req, res, 400, "BAD_TEXT", "Contá qué pasó (al menos unas palabras).");
      if(body.text.length > REPORT_TEXT_MAX) return err(req, res, 400, "TEXT_TOO_LONG", `El reporte puede tener hasta ${REPORT_TEXT_MAX} caracteres.`);
      const row = { userId: user ? user.id : null, category: body.category, text: scrub(body.text, REPORT_TEXT_MAX).trim(), context: cleanContext(body.context), at: now() };
      const id = await getStore().betaReportAdd(row, REPORTS_KEEP);
      log("BETA_REPORT", { id, category: row.category, user: row.userId, len: row.text.length });
      return send(req, res, 201, { ok: true, id });
    },
    "POST /api/beta/errors": async (req, res, ip) => {
      if(!errorsOn){ req.resume(); return off(req, res); }
      const wait = limited("err:ip:" + ip, ERROR_POSTS_PER_IP, ERROR_WINDOW_MS);
      if(wait){ req.resume(); return tooMany(req, res, wait); }
      const body = await readBody(req, ERROR_BODY_BYTES);
      if(!Array.isArray(body.errors) || !body.errors.length || body.errors.length > ERRORS_PER_POST) return err(req, res, 400, "BAD_ERRORS", "Formato de errores inválido.");
      const build = str(body.build, 60) || "?";
      let accepted = 0;
      for(const e of body.errors){
        if(!e || typeof e !== "object") continue;
        const message = str(e.message, 300); if(!message) continue;
        const src = srcPath(e.src), line = int(e.line, 0, 1e7) || 0, col = int(e.col, 0, 1e7) || 0, count = int(e.count, 1, 1000) || 1;
        const sig = crypto.createHash("sha256").update([build, message, src, line].join("|")).digest("hex").slice(0, 32);
        if(await getStore().betaErrorAdd({ sig, message, src, line, col, build, count, at: now() }, ERROR_SIGNATURES_MAX)) accepted++;
      }
      return send(req, res, 200, { ok: true, accepted });
    },
    "GET /api/gm/beta/reports": async (req, res) => {
      if(!await adminAuth(req, res, "VIEW_USERS")) return;
      const rows = await getStore().betaReportList(limitParam(req, 100)), names = new Map();
      for(const r of rows) if(r.userId != null && !names.has(r.userId)){ const u = await getStore().getUser(r.userId); names.set(r.userId, u ? u.user : null); }
      return send(req, res, 200, { enabled: info(), reports: rows.map(r => Object.assign({}, r, { user: r.userId != null ? names.get(r.userId) : null })) });
    },
    "GET /api/gm/beta/errors": async (req, res) => {
      if(!await adminAuth(req, res, "VIEW_USERS")) return;
      return send(req, res, 200, { enabled: info(), errors: await getStore().betaErrorList(limitParam(req, 100)) });
    },
    "GET /api/gm/beta/invites": async (req, res) => {
      if(!await adminAuth(req, res, "VIEW_USERS")) return;
      const uses = await getStore().betaInviteUses();
      return send(req, res, 200, { enabled: info(), invalid, codes: [...codes.values()].map(c => ({ label: c.label, max: c.max || null, uses: uses[c.hash] || 0 })) });
    }
  };
  return { routes, info, reserveInvite, releaseInvite, get inviteOn(){ return inviteOn; }, close(){ clearInterval(sweep); } };
}
module.exports = { create, parseInviteCodes, hashCode, normCode, scrub, srcPath, cleanContext, CATEGORIES, REPORT_TEXT_MAX };
