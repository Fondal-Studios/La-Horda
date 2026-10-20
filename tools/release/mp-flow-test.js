"use strict";
// ENSAYO LOCAL del ciclo completo de Mercado Pago contra un servidor FALSO en esta misma máquina. Sin red externa, sin credenciales reales.
//   crear preferencia -> webhook firmado -> acreditación -> webhook duplicado no duplica -> reembolso / contracargo revierte.
// Uso:  node tools/release/mp-flow-test.js     (lo corre también: node tools/release/mp-readiness.js)
// Todo el entorno de este proceso es de mentira: no lee ni imprime ninguna variable real.
const fs = require("fs"), os = require("os"), path = require("path"), http = require("http"), net = require("net"), crypto = require("crypto");

// Red de seguridad: este proceso solo puede hablar con 127.0.0.1. Cualquier otro destino rompe el ensayo.
const realFetch = global.fetch;
global.fetch = (u, o) => { if(!/^http:\/\/127\.0\.0\.1[:/]/.test(String(u))) throw new Error("ENSAYO BLOQUEADO: intento de salir a " + String(u).slice(0, 60)); return realFetch(u, o); };

const freePort = () => new Promise(ok => { const s = net.createServer(); s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => ok(p)); }); });
const SECRET = "ensayo-webhook-secret-0123456789abcdef-xx";

(async () => {
  const relayPort = await freePort();
  // ---------- servidor falso de Mercado Pago ----------
  const mp = { prefs: [], payments: {}, calls: 0, badAuth: 0 };
  const mock = http.createServer((req, res) => {
    let b = ""; req.on("data", c => b += c); req.on("end", () => {
      mp.calls++;
      if(req.headers.authorization !== "Bearer APP_USR-ensayo-token-falso") mp.badAuth++;
      const send = (st, j) => { res.writeHead(st, { "content-type": "application/json" }); res.end(JSON.stringify(j)); };
      if(req.method === "POST" && req.url === "/checkout/preferences"){ const pref = JSON.parse(b); mp.prefs.push(pref); return send(201, { id: "pref-" + mp.prefs.length, init_point: "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref-" + mp.prefs.length }); }
      const m = /^\/v1\/payments\/(\d+)$/.exec(req.url);
      if(req.method === "GET" && m) return mp.payments[m[1]] ? send(200, mp.payments[m[1]]) : send(404, { message: "not found" });
      send(404, { message: "ruta desconocida" });
    });
  });
  await new Promise(ok => mock.listen(0, "127.0.0.1", ok));
  const mockPort = mock.address().port;

  Object.assign(process.env, {
    PORT: String(relayPort), DATABASE_URL: "", ALLOWED_ORIGINS: "http://127.0.0.1:1", DATA_PERSISTENT: "1",
    DATA_DIR: fs.mkdtempSync(path.join(os.tmpdir(), "horda-mp-ensayo-")),
    MP_ENABLED: "1", PAYMENTS_PROVIDER: "mercadopago", MP_MODE: "sandbox", MP_ACCESS_TOKEN: "APP_USR-ensayo-token-falso",
    MP_WEBHOOK_SECRET: SECRET, PAYMENTS_ORDER_SECRET: "ensayo-order-secret-0123456789abcdef-xx", MP_COLLECTOR_ID: "424242",
    MP_ARS_PER_USD: "1200", PAYMENTS_NOTIFY_URL: "https://ejemplo.test/api/payments/webhook", PAYMENTS_SUCCESS_URL: "https://ejemplo.test/la-horda/jugar/",
    MP_API_BASE: "http://127.0.0.1:" + mockPort, MP_REQUIRE_EMAIL: "1"
  });
  delete process.env.PAYMENTS_PACK_IDS; delete process.env.MP_LIVE_MODE;
  const { server, accounts } = require("../../server/relay");
  const payments = require("../../server/payments");
  let n = 0, fails = 0;
  const check = (name, ok, x) => { n++; if(!ok){ fails++; console.log("  FALLA  " + name + (x !== undefined ? " -> " + JSON.stringify(x).slice(0, 240) : "")); } else console.log("  ok     " + name); };
  const base = "http://127.0.0.1:" + relayPort;
  async function api(method, p, body, token, h = {}){
    const r = await fetch(base + p, { method, headers: { origin: "http://127.0.0.1:1", "content-type": "application/json", ...h, ...(token ? { authorization: "Bearer " + token } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
    let j = null; try{ j = await r.json(); }catch(e){} return { status: r.status, j };
  }
  const hook = (id, sign = true) => {
    const ts = String(Date.now()), rid = "ensayo-" + id, headers = { "x-request-id": rid };
    if(sign) headers["x-signature"] = "ts=" + ts + ",v1=" + crypto.createHmac("sha256", SECRET).update(`id:${id};request-id:${rid};ts:${ts};`).digest("hex");
    return api("POST", "/api/payments/webhook?data.id=" + id + "&type=payment", { type: "payment", data: { id } }, null, headers);
  };
  const pay = (id, ref, over) => { mp.payments[id] = { id: Number(id), collector_id: 424242, live_mode: false, status: "approved", currency_id: "ARS", transaction_amount: 5988, transaction_amount_refunded: 0, external_reference: ref, ...over }; };
  const wallet = async t => (await api("GET", "/api/wallet", undefined, t)).j;
  const ask = async (t, pack, amount) => api("POST", "/api/wallet/checkout", { pack, expectedPrice: { currency: "ARS", amount } }, t);

  await accounts.ready;
  console.log("1. Preferencia de pago (la crea el servidor)");
  const T1 = (await api("POST", "/api/register", { user: "Ensayo1", pass: "espada123", email: "ensayo1@ejemplo.test" })).j.token;
  check("la tienda informa pagos habilitados", (await wallet(T1)).payments.enabled === true);
  const ck = await ask(T1, "brasas_500", 5988);
  const pref = mp.prefs[0] || {};
  check("devuelve el link de pago de Mercado Pago", ck.status === 200 && /^https:\/\/www\.mercadopago\.com\.ar\//.test(ck.j.redirect), ck);
  check("el precio lo puso el servidor: 4,99 USD x 1200 = 5988 ARS", pref.items && pref.items[0].unit_price === 5988 && pref.items[0].currency_id === "ARS", pref.items);
  check("lleva external_reference firmada con cuenta+pedido", /^v1:\d+:brasas_500:5988:500:[0-9a-f]{24}:[0-9a-f]{64}$/.test(pref.external_reference || ""), pref.external_reference);
  check("lleva notification_url y back_urls", pref.notification_url === process.env.PAYMENTS_NOTIFY_URL && pref.back_urls && pref.back_urls.success === process.env.PAYMENTS_SUCCESS_URL);
  check("el token viaja solo del servidor a Mercado Pago (nunca al cliente)", mp.badAuth === 0 && !JSON.stringify(ck.j).includes("APP_USR"));
  check("si el cliente dice otro precio, se rechaza (409)", (await ask(T1, "brasas_500", 1)).status === 409);
  const ref1 = pref.external_reference;

  console.log("2. Webhook firmado y acreditación");
  const calls0 = mp.calls;
  const bad = await hook("1001", false);
  check("webhook sin firma: 400 y sin consultar a Mercado Pago", bad.status === 400 && mp.calls === calls0, bad);
  pay("1001", ref1, { status: "pending" });
  const pend = await hook("1001");
  check("pago pendiente: no acredita", pend.status === 200 && pend.j.ignored && (await wallet(T1)).premium === 0, pend);
  pay("1001", ref1);
  const ok = await hook("1001");
  check("pago aprobado: acredita 500 Brasas", ok.status === 200 && ok.j.ok && !ok.j.duplicate && (await wallet(T1)).premium === 500, ok);
  const dup = await hook("1001");
  check("webhook duplicado: no acredita otra vez", dup.j.duplicate === true && (await wallet(T1)).premium === 500, dup);
  const led = (await wallet(T1)).ledger;
  check("el libro registra la compra con el id del pago (recibo auditable)", led.some(e => e.delta === 500 && e.reason === "purchase:brasas_500:mp1001"), led);

  console.log("3. Reembolso");
  pay("1001", ref1, { status: "refunded", transaction_amount_refunded: 5988 });
  const rf = await hook("1001");
  check("reembolso total: revierte las 500 Brasas", rf.status === 200 && rf.j.reversed === 500 && (await wallet(T1)).premium === 0, rf);
  const rf2 = await hook("1001");
  check("reembolso repetido: no descuenta dos veces", rf2.j.duplicate === true && (await wallet(T1)).premium === 0, rf2);
  const led2 = (await wallet(T1)).ledger;
  check("el libro registra la reversión", led2.some(e => e.delta === -500 && /^reversal:refunded:/.test(e.reason)), led2);
  pay("1001", ref1);
  await hook("1001");
  check("un aviso viejo de 'aprobado' no vuelve a acreditar un pago ya acreditado y devuelto", (await wallet(T1)).premium === 0);

  console.log("4. Contracargo con Brasas ya gastadas");
  const T2 = (await api("POST", "/api/register", { user: "Ensayo2", pass: "espada123", email: "ensayo2@ejemplo.test" })).j.token;
  await ask(T2, "brasas_500", 5988); const ref2 = mp.prefs[mp.prefs.length - 1].external_reference, uid2 = Number(ref2.split(":")[1]);
  pay("2002", ref2); await hook("2002");
  check("segunda cuenta acreditada", (await wallet(T2)).premium === 500);
  await accounts.store.walletApply({ userId: uid2, delta: -300, reason: "buy:ensayo", ref: "ensayo-gasto-1", actor: uid2, at: Date.now() });
  pay("2002", ref2, { status: "charged_back" });
  const cb = await hook("2002");
  check("contracargo: descuenta lo que queda (200) y avisa el faltante (300)", cb.status === 200 && cb.j.reversed === 200 && cb.j.shortfall === 300 && (await wallet(T2)).premium === 0, cb);
  check("el faltante queda anotado en el libro", (await wallet(T2)).ledger.some(e => /^reversal_shortfall:300:/.test(e.reason)));

  console.log("5. Defensas");
  pay("3003", ref1, { collector_id: 999 }); check("pago de otro vendedor: rechazado", (await hook("3003")).status === 400);
  pay("3004", ref1, { live_mode: true }); check("pago 'real' en modo sandbox: rechazado", (await hook("3004")).status === 400);
  pay("3005", ref1, { transaction_amount: 100 }); check("pago aprobado por menos: rechazado", (await hook("3005")).status === 400);
  const noMail = (await api("POST", "/api/register", { user: "SinMail", pass: "espada123" })).j.token;
  const nm = await ask(noMail, "brasas_500", 5988); check("cuenta sin correo: no se inicia el cobro", nm.status === 403 && nm.j.error === "NEEDS_EMAIL", nm);
  let last = 0; for(let i = 0; i < 12; i++){ last = (await ask(T1, "brasas_500", 5988)).status; if(last === 429) break; }
  check("demasiados intentos de checkout: 429", last === 429, last);
  process.env.MP_MODE = "live"; check("en modo live, MP_API_BASE se ignora (siempre la API real)", payments._mpApi() === "https://api.mercadopago.com"); process.env.MP_MODE = "sandbox";
  check("en sandbox con MP_API_BASE local, se usa el servidor falso", payments._mpApi().startsWith("http://127.0.0.1:"));
  process.env.MP_ENABLED = "0";
  check("MP_ENABLED=0: la tienda queda apagada y el checkout responde 501", (await wallet(T2)).payments.enabled === false && (await ask(T2, "brasas_500", 5988)).status === 501);

  server.close(); mock.close();
  console.log(fails ? `\nENSAYO FALLÓ: ${fails} de ${n}` : `\nENSAYO OK: ${n} comprobaciones (servidor falso local, sin red externa)`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
