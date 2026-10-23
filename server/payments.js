"use strict";
// Real-money payments are disabled until a provider is configured and the wallet has persistent storage.
// Mercado Pago: signed notifications + provider lookup + signed, immutable checkout quote.
// See docs/commercial/LAUNCH.md and launch.env.example for activation and remaining operational gates.
const crypto = require("crypto");
const PACKS = require("./premium-packs.json");

const provider = () => (process.env.PAYMENTS_PROVIDER || "").trim().toLowerCase();
const secret = () => process.env.PAYMENTS_WEBHOOK_SECRET || "";
// Mercado Pago (Checkout Pro): PAYMENTS_PROVIDER=mercadopago + MP_ACCESS_TOKEN (solo del servidor, nunca en el cliente) +
//   PAYMENTS_NOTIFY_URL (https://TU-SERVIDOR/api/payments/webhook) + PAYMENTS_SUCCESS_URL (adónde vuelve el jugador) +
//   MP_ARS_PER_USD (cotización que usás para convertir los precios en USD a pesos; Mercado Pago cobra en ARS).
// El webhook de Mercado Pago NO se acredita por lo que dice: se consulta el pago directo a la API de Mercado Pago con el token y
// solo se acredita si está aprobado, es de esta cuenta y de este paquete, y el monto alcanza. Mismo libro idempotente de siempre.
let _fetch = (...a) => fetch(...a);
const mpToken = () => (process.env.MP_ACCESS_TOKEN || "").trim();
const mpRate = () => Number(process.env.MP_ARS_PER_USD || 0);
const mpWebhookSecret = () => process.env.MP_WEBHOOK_SECRET || "";
const orderSecret = () => process.env.PAYMENTS_ORDER_SECRET || "";
// INTERRUPTOR GENERAL: MP_ENABLED=1 prende el cobro; cualquier otro valor (o vacío) lo apaga al instante, aunque el resto esté cargado.
const mpSwitch = () => /^(1|true)$/i.test((process.env.MP_ENABLED || "").trim());
// Modo: MP_MODE=sandbox|live (preferido). Si no está, se respeta el MP_LIVE_MODE=true|false de siempre.
const mpModeValid = () => /^(sandbox|live)$/.test((process.env.MP_MODE || "").trim().toLowerCase()) || (!(process.env.MP_MODE || "").trim() && /^(true|false)$/.test(process.env.MP_LIVE_MODE || ""));
const mpLive = () => (process.env.MP_MODE || "").trim() ? process.env.MP_MODE.trim().toLowerCase() === "live" : process.env.MP_LIVE_MODE === "true";
// Base de la API: siempre la de Mercado Pago. MP_API_BASE solo se acepta en sandbox y apuntando a esta misma máquina (ensayo con servidor falso).
const MP_API = "https://api.mercadopago.com";
const mpApi = () => { const b = (process.env.MP_API_BASE || "").trim().replace(/\/+$/, ""); return !mpLive() && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(b) ? b : MP_API; };
const mpEnabled = () => mpSwitch() && mpWebhookSecret().length >= 32 && orderSecret().length >= 32 && /^\d+$/.test(process.env.MP_COLLECTOR_ID || "") && mpModeValid() && provider() === "mercadopago" && mpToken().length >= 16 && Number.isFinite(mpRate()) && mpRate() > 0 && /^https:\/\//.test(process.env.PAYMENTS_NOTIFY_URL || "");
const hmacEnabled = () => provider() === "hmac" && secret().length >= 16;
const enabled = () => hmacEnabled() || mpEnabled();
const mpAmount = p => Math.ceil(Math.round(p.price.amount * 100) * mpRate() / 100);
const priced = p => !!(p && p.price && typeof p.price.currency === "string" && /^[A-Z]{3}$/.test(p.price.currency) && Number.isFinite(p.price.amount) && p.price.amount > 0);
const sellable = () => PACKS.packs.filter(priced);
// Optional launch shortlist only affects NEW checkouts, never fulfillment of already paid orders.
const offered = () => {
  const ids = (process.env.PAYMENTS_PACK_IDS || "").split(",").map(s => s.trim()).filter(Boolean);
  return sellable().filter(p => ids.length ? ids.includes(p.id) : !p.launchOnly);
};
const displayPrice = p => provider() === "mercadopago" && Number.isFinite(mpRate()) && mpRate() > 0
  ? { currency: "ARS", amount: mpAmount(p) } : { ...p.price };
function sameHex(a, b){ return /^[a-f0-9]{64}$/.test(a) && crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex")); }
function signedReference(user, p){
  const value = ["v1", user.id, p.id, mpAmount(p), p.premium + (p.bonus || 0), crypto.randomBytes(12).toString("hex")].join(":");
  return value + ":" + crypto.createHmac("sha256", orderSecret()).update(value).digest("hex");
}
function readReference(ref){
  const m = /^v1:(\d+):([a-z0-9_]+):(\d+):(\d+):([a-f0-9]{24}):([a-f0-9]{64})$/.exec(String(ref || ""));
  if(!m) return null;
  const value = ref.slice(0, ref.lastIndexOf(":"));
  if(!sameHex(m[6], crypto.createHmac("sha256", orderSecret()).update(value).digest("hex"))) return null;
  const userId = Number(m[1]), amount = Number(m[3]), premium = Number(m[4]);
  if(![userId, amount, premium].every(n => Number.isSafeInteger(n) && n > 0)) return null;
  return { userId, pack: m[2], amount, premium };
}
function validMpSignature(req, id){
  const h = req.headers || {}, parts = String(h["x-signature"] || "").split(",").map(x => x.trim().split("="));
  const ts = parts.find(x => x[0] === "ts")?.[1], sig = parts.find(x => x[0] === "v1")?.[1] || "";
  const requestId = h["x-request-id"];
  if(!/^\d{10,16}$/.test(ts || "") || typeof requestId !== "string" || !/^[a-zA-Z0-9-]{1,128}$/.test(requestId)) return false;
  const manifest = `id:${id};request-id:${requestId};ts:${ts};`;
  return sameHex(sig, crypto.createHmac("sha256", mpWebhookSecret()).update(manifest).digest("hex"));
}
const findPack = id => sellable().find(x => x.id === id) || null;
// referencia del libro que marca un paquete de una sola vez como ya acreditado para esa cuenta
const onceRef = (packId, userId) => "once:" + packId + ":" + userId;
const creditRef = (credit) => credit.once ? onceRef(credit.pack, credit.userId) : "pay:" + credit.paymentId;

// Catálogo para el cliente: los paquetes con precio se muestran siempre (con su moneda); "enabled" dice si se puede pagar.
// bought(packId) -> true si ese paquete de una sola vez ya se acreditó a esta cuenta (lo resuelve el servidor).
async function publicInfo(bought){
  const out = [];
  for(const p of offered()){
    const once = !!p.once;
    out.push({ id: p.id, name: p.name || null, premium: p.premium, bonus: p.bonus || 0, once, championGifts: p.championGifts || 0,
      available: once && bought ? !(await bought(p.id)) : true,
      price: displayPrice(p) });
  }
  return { enabled: enabled(), currency: PACKS.currency, packs: out };
}
function fail(code, status, human){ const e = new Error(code); e.status = status || 400; if(human) e.human = human; throw e; }
const NOT_CONNECTED = "Los pagos todavía no están conectados. Muy pronto vas a poder comprar Brasas.";

async function checkout({ user, pack, bought, expectedPrice }){
  if(!enabled()) fail("PAYMENTS_DISABLED", 501, NOT_CONNECTED);
  const p = offered().find(p => p.id === pack); if(!p) fail("BAD_PACK", 400, "Ese paquete no está a la venta.");
  if(p.once && bought && await bought(p.id)) fail("ALREADY_BOUGHT", 409, "El Pack de bienvenida ya es tuyo: se compra una sola vez.");
  if(mpEnabled()) {
    if(!/^(0|false)$/i.test((process.env.MP_REQUIRE_EMAIL || "").trim()) && !(user && user.email)) fail("NEEDS_EMAIL", 403, "Para comprar necesitás un correo cargado en tu cuenta. Lo usamos para el comprobante y el soporte.");
    if(!checkoutAllowed(user.id)) fail("CHECKOUT_RATE_LIMIT", 429, "Hiciste muchos intentos de pago seguidos. Esperá unos minutos y probá de nuevo.");
    const price = displayPrice(p);
    if(!expectedPrice || expectedPrice.currency !== price.currency || expectedPrice.amount !== price.amount)
      fail("PRICE_CHANGED", 409, "El precio cambió. Actualizá la tienda y confirmá el nuevo importe.");
    return mpCheckout(user, p);
  }
  const base = process.env.PAYMENTS_CHECKOUT_URL; if(!base) fail("PAYMENTS_DISABLED", 501, NOT_CONNECTED);
  const u = new URL(base); u.searchParams.set("pack", p.id); u.searchParams.set("account", String(user.id));
  return { ok: true, redirect: u.href, pack: p.id, price: p.price };
}

// Tope de intentos de pago por cuenta (el checkout llama a la API de Mercado Pago): 8 cada 10 minutos.
const _ck = new Map();
function checkoutAllowed(userId){
  const t = Date.now(), a = (_ck.get(userId) || []).filter(x => t - x < 600000);
  if(a.length >= 8){ _ck.set(userId, a); return false; }
  a.push(t); _ck.set(userId, a);
  if(_ck.size > 5000) for(const [k, v] of _ck) if(!v.some(x => t - x < 600000)) _ck.delete(k);
  return true;
}
async function mpCheckout(user, p){
  const ref = signedReference(user, p);
  const back = process.env.PAYMENTS_SUCCESS_URL || "";
  const body = { items: [{ id: p.id, title: (p.name || (p.premium + " Brasas")) + " · La Horda", quantity: 1, currency_id: "ARS", unit_price: mpAmount(p) }],
    external_reference: ref, notification_url: process.env.PAYMENTS_NOTIFY_URL, statement_descriptor: "LA HORDA",
    metadata: { userId: user.id, pack: p.id } };
  if(/^https:\/\//.test(back)){ body.back_urls = { success: back, pending: back, failure: back }; body.auto_return = "approved"; }
  let r, j; try{ r = await _fetch(mpApi() + "/checkout/preferences", { method: "POST", signal: AbortSignal.timeout(12000), headers: { "content-type": "application/json", authorization: "Bearer " + mpToken() }, body: JSON.stringify(body) }); j = await r.json(); }
  catch(e){ fail("PAYMENTS_UNAVAILABLE", 502, "No se pudo abrir el pago. Probá de nuevo en un rato."); }
  if(!r.ok || !j || typeof j.init_point !== "string" || !/^https:\/\//.test(j.init_point)) fail("PAYMENTS_UNAVAILABLE", 502, "No se pudo abrir el pago. Probá de nuevo en un rato.");
  return { ok: true, redirect: j.init_point, pack: p.id, price: displayPrice(p), charged: { currency: "ARS", amount: mpAmount(p) } };
}
// Webhook de Mercado Pago: exige data.id en la URL firmada; verifica el pago contra su API.
let _mpWin = [], _mpMax = 40;   // tope de consultas a Mercado Pago por minuto (el webhook es público: no puede usarse para martillar su API)
async function mpVerify(req, raw){
  let id;
  try { id = new URL(req.url, "http://x").searchParams.get("data.id"); } catch(e) { return null; }
  if(!/^\d{3,20}$/.test(id || "") || !validMpSignature(req, id)) return null;
  // Reject unauthenticated notifications BEFORE consuming the provider request budget.
  const nowMs = Date.now(); _mpWin = _mpWin.filter(t => nowMs - t < 60000);
  if(_mpWin.length >= _mpMax) fail("WEBHOOK_BUSY", 503);
  _mpWin.push(nowMs);
  let r, pay;
  try {
    r = await _fetch(mpApi() + "/v1/payments/" + id, {
      signal: AbortSignal.timeout(12000), headers: { authorization: "Bearer " + mpToken() }
    });
    pay = await r.json();
  } catch(e) { fail("PAYMENTS_UNAVAILABLE", 503); }
  if(r.status === 429 || r.status >= 500) fail("PAYMENTS_UNAVAILABLE", 503);
  if(!r.ok || !pay || String(pay.id) !== id || String(pay.collector_id) !== process.env.MP_COLLECTOR_ID ||
     pay.live_mode !== mpLive()) return null;
  const order = readReference(pay.external_reference);
  const p = order && findPack(order.pack);
  if(!p) return null;
  // Reembolso total o contracargo: se devuelve un pedido de REVERTIR lo acreditado (lo ejecuta wallet.js, de forma idempotente y auditada).
  if((pay.status === "refunded" || pay.status === "charged_back") && pay.currency_id === "ARS" && Number(pay.transaction_amount) === order.amount)
    return { reverse: true, status: pay.status, userId: order.userId, pack: p.id, once: !!p.once, premium: order.premium, paymentId: "mp" + id };
  // Los demás estados no acreditan nada (pendiente, rechazado, cancelado, en proceso, etc.).
  if(pay.status !== "approved") return { ignored: true, status: pay.status, paymentId: "mp" + id };
  if(pay.currency_id !== "ARS" || Number(pay.transaction_amount) !== order.amount) return null;
  // Devolución parcial: no se acredita ni se revierte sola; se anota para revisión manual (200 para que Mercado Pago no reintente).
  if(Number(pay.transaction_amount_refunded || 0) !== 0) return { ignored: true, status: "partial_refund", paymentId: "mp" + id };
  return { userId: order.userId, pack: p.id, once: !!p.once, premium: order.premium, paymentId: "mp" + id };
}
// Punto de entrada del webhook: devuelve el crédito a acreditar o null. (async: Mercado Pago consulta su API)
async function verifyWebhookRequest(req, raw){
  if(mpEnabled()) return mpVerify(req, raw);
  return verifyWebhook(req.headers, raw);
}
// Devuelve el crédito a acreditar o null (sin proveedor, firma inválida, paquete desconocido o sin precio).
function verifyWebhook(headers, raw){
  if(!hmacEnabled()) return null;
  const sig = String(headers["x-horda-signature"] || "");
  const want = crypto.createHmac("sha256", secret()).update(raw).digest("hex");
  if(sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
  let b; try{ b = JSON.parse(raw); }catch(e){ return null; }
  const p = b && typeof b.pack === "string" ? findPack(b.pack) : null;
  if(!p || !Number.isSafeInteger(b.userId) || b.userId <= 0 || typeof b.paymentId !== "string" || !/^[a-zA-Z0-9_.:-]{4,120}$/.test(b.paymentId)) return null;
  return { userId: b.userId, pack: p.id, once: !!p.once, premium: p.premium + (p.bonus || 0), paymentId: b.paymentId };
}

module.exports = { mpLive, mpSwitch, _mpApi: mpApi, publicInfo, checkout, verifyWebhook, verifyWebhookRequest, enabled, onceRef, creditRef, PACKS, _setFetch: f => { _fetch = f || ((...a) => fetch(...a)); } };
