"use strict";
// PAGOS CON DINERO REAL — apagado por defecto. Acá NO se cobra nada: este módulo solo deja la conexión lista.
// Para encenderlo (ver docs/production/PREMIUM_CURRENCY.md):
//   PAYMENTS_PROVIDER=hmac            proveedor genérico: una pasarela/middleware propio firma cada pago confirmado
//   PAYMENTS_WEBHOOK_SECRET=…         secreto compartido para verificar la firma (HMAC-SHA256 del cuerpo, hex)
//   PAYMENTS_CHECKOUT_URL=https://…   adónde mandar al jugador a pagar (la pasarela recibe pack y cuenta)
// Los precios (sugeridos, con moneda ISO explícita) están en server/premium-packs.json; sin precio, un paquete no se ofrece
// ni se acredita. Un paquete "once" (Pack de bienvenida) se acredita UNA sola vez por cuenta: su referencia en el libro es
// "once:<pack>:<userId>", única, así que un segundo webhook para la misma cuenta nunca acredita.
// Mercado Pago / Stripe: su webhook se verifica con SU esquema de firma; el adaptador va en verifyWebhook y siempre
// termina en lo mismo: { userId, pack, premium, paymentId } -> wallet.walletApply con ref idempotente.
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
const mpEnabled = () => provider() === "mercadopago" && mpToken().length >= 16 && Number.isFinite(mpRate()) && mpRate() > 0 && /^https:\/\//.test(process.env.PAYMENTS_NOTIFY_URL || "");
const hmacEnabled = () => provider() === "hmac" && secret().length >= 16;
const enabled = () => hmacEnabled() || mpEnabled();
const mpAmount = p => Math.ceil(p.price.amount * mpRate());
const priced = p => !!(p && p.price && typeof p.price.currency === "string" && /^[A-Z]{3}$/.test(p.price.currency) && Number.isFinite(p.price.amount) && p.price.amount > 0);
const sellable = () => PACKS.packs.filter(priced);
const findPack = id => sellable().find(x => x.id === id) || null;
// referencia del libro que marca un paquete de una sola vez como ya acreditado para esa cuenta
const onceRef = (packId, userId) => "once:" + packId + ":" + userId;
const creditRef = (credit) => credit.once ? onceRef(credit.pack, credit.userId) : "pay:" + credit.paymentId;

// Catálogo para el cliente: los paquetes con precio se muestran siempre (con su moneda); "enabled" dice si se puede pagar.
// bought(packId) -> true si ese paquete de una sola vez ya se acreditó a esta cuenta (lo resuelve el servidor).
async function publicInfo(bought){
  const out = [];
  for(const p of sellable()){
    const once = !!p.once;
    out.push({ id: p.id, name: p.name || null, premium: p.premium, bonus: p.bonus || 0, once, championGifts: p.championGifts || 0,
      available: once && bought ? !(await bought(p.id)) : true,
      price: { currency: p.price.currency, amount: p.price.amount } });
  }
  return { enabled: enabled(), currency: PACKS.currency, packs: out };
}
function fail(code, status, human){ const e = new Error(code); e.status = status || 400; if(human) e.human = human; throw e; }
const NOT_CONNECTED = "Los pagos todavía no están conectados. Muy pronto vas a poder comprar Brasas.";

async function checkout({ user, pack, bought }){
  if(!enabled()) fail("PAYMENTS_DISABLED", 501, NOT_CONNECTED);
  const p = findPack(pack); if(!p) fail("BAD_PACK", 400, "Ese paquete no está a la venta.");
  if(p.once && bought && await bought(p.id)) fail("ALREADY_BOUGHT", 409, "El Pack de bienvenida ya es tuyo: se compra una sola vez.");
  if(mpEnabled()) return mpCheckout(user, p);
  const base = process.env.PAYMENTS_CHECKOUT_URL; if(!base) fail("PAYMENTS_DISABLED", 501, NOT_CONNECTED);
  const u = new URL(base); u.searchParams.set("pack", p.id); u.searchParams.set("account", String(user.id));
  return { ok: true, redirect: u.href, pack: p.id, price: p.price };
}

async function mpCheckout(user, p){
  const ref = user.id + ":" + p.id + ":" + crypto.randomBytes(6).toString("hex");
  const back = process.env.PAYMENTS_SUCCESS_URL || "";
  const body = { items: [{ id: p.id, title: (p.name || (p.premium + " Brasas")) + " · La Horda", quantity: 1, currency_id: "ARS", unit_price: mpAmount(p) }],
    external_reference: ref, notification_url: process.env.PAYMENTS_NOTIFY_URL, statement_descriptor: "LA HORDA",
    metadata: { userId: user.id, pack: p.id } };
  if(/^https:\/\//.test(back)){ body.back_urls = { success: back, pending: back, failure: back }; body.auto_return = "approved"; }
  let r, j; try{ r = await _fetch("https://api.mercadopago.com/checkout/preferences", { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + mpToken() }, body: JSON.stringify(body) }); j = await r.json(); }
  catch(e){ fail("PAYMENTS_UNAVAILABLE", 502, "No se pudo abrir el pago. Probá de nuevo en un rato."); }
  if(!r.ok || !j || typeof j.init_point !== "string" || !/^https:\/\//.test(j.init_point)) fail("PAYMENTS_UNAVAILABLE", 502, "No se pudo abrir el pago. Probá de nuevo en un rato.");
  return { ok: true, redirect: j.init_point, pack: p.id, price: p.price, charged: { currency: "ARS", amount: mpAmount(p) } };
}
// Webhook de Mercado Pago: el id del pago viene en la URL (?data.id=…) o en el cuerpo; se verifica contra su API.
let _mpWin = [], _mpMax = 40;   // tope de consultas a Mercado Pago por minuto (el webhook es público: no puede usarse para martillar su API)
async function mpVerify(req, raw){
  const nowMs = Date.now(); _mpWin = _mpWin.filter(t => nowMs - t < 60000); if(_mpWin.length >= _mpMax) return null; _mpWin.push(nowMs);
  let id = null;
  try{ const u = new URL(req.url, "http://x"); id = u.searchParams.get("data.id") || u.searchParams.get("id"); }catch(e){}
  if(!id){ try{ const b = JSON.parse(raw); id = b && b.data && b.data.id; }catch(e){} }
  id = String(id || ""); if(!/^\d{3,20}$/.test(id)) return null;
  let r, pay; try{ r = await _fetch("https://api.mercadopago.com/v1/payments/" + id, { headers: { authorization: "Bearer " + mpToken() } }); pay = await r.json(); }catch(e){ return null; }
  if(!r.ok || !pay || pay.status !== "approved") return null;
  const m = /^(\d+):([a-z0-9_]+):/.exec(String(pay.external_reference || ""));
  const p = m ? findPack(m[2]) : null; const userId = m ? Number(m[1]) : 0;
  if(!p || !Number.isSafeInteger(userId) || userId <= 0) return null;
  if(pay.currency_id !== "ARS" || !(Number(pay.transaction_amount) >= mpAmount(p) * 0.98)) return null;   // pagó menos de lo que vale: no se acredita
  return { userId, pack: p.id, once: !!p.once, premium: p.premium + (p.bonus || 0), paymentId: "mp" + id };
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

module.exports = { publicInfo, checkout, verifyWebhook, verifyWebhookRequest, enabled, onceRef, creditRef, PACKS, _setFetch: f => { _fetch = f || ((...a) => fetch(...a)); } };
