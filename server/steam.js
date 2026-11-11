"use strict";
// STEAM (servidor): identidad por ticket de sesión y microtransacciones (ISteamMicroTxn).
// Nada de esto se activa sin configuración. La clave de editor (publisher key) vive SOLO en el servidor, nunca en el cliente.
//   PAYMENTS_PROVIDER=steam  STEAM_ENABLED=1  STEAM_APP_ID=<AppID>  STEAM_PUBLISHER_KEY=<clave>  STEAM_MODE=sandbox|live
// STEAM_API_BASE solo se acepta en sandbox y apuntando a esta misma máquina (ensayo con un Steam falso), igual que MP_API_BASE.
// NO VERIFICADO contra Steam real: los nombres de endpoints y campos siguen la documentación pública de Steamworks y se ensayan
// contra un servidor falso (server/test-steam.js). Hay que probar en sandbox con un AppID real antes de vender nada.
let _fetch = (...a) => fetch(...a);

const STEAM_API = "https://partner.steam-api.com";
const env = k => (process.env[k] || "").trim();
const appId = () => env("STEAM_APP_ID");
const key = () => env("STEAM_PUBLISHER_KEY");
const mode = () => env("STEAM_MODE").toLowerCase();
const live = () => mode() === "live";
const switchOn = () => /^(1|true)$/i.test(env("STEAM_ENABLED"));
const enabled = () => switchOn() && /^\d{1,10}$/.test(appId()) && key().length >= 16 && /^(sandbox|live)$/.test(mode()) && env("PAYMENTS_PROVIDER").toLowerCase() === "steam";
// la identidad por ticket no exige el proveedor de pagos: solo AppID + clave + modo
const identityEnabled = () => switchOn() && /^\d{1,10}$/.test(appId()) && key().length >= 16 && /^(sandbox|live)$/.test(mode());
const apiBase = () => { const b = env("STEAM_API_BASE").replace(/\/+$/, ""); return !live() && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(b) ? b : STEAM_API; };
const txnIface = () => live() ? "ISteamMicroTxn" : "ISteamMicroTxnSandbox";

const STEAMID_RE = /^7656119\d{10}$/;   // SteamID64 de cuentas individuales
const isSteamId = s => typeof s === "string" && STEAMID_RE.test(s);

class SteamError extends Error { constructor(code, status, human){ super(code); this.status = status || 502; if(human) this.human = human; } }

async function call(method, path, params){
  const url = apiBase() + path;
  const body = new URLSearchParams(params).toString();
  let r, j;
  try{
    r = method === "GET"
      ? await _fetch(url + "?" + body, { signal: AbortSignal.timeout(12000) })
      : await _fetch(url, { method: "POST", signal: AbortSignal.timeout(12000), headers: { "content-type": "application/x-www-form-urlencoded" }, body });
    j = await r.json();
  }catch(e){ throw new SteamError("STEAM_UNAVAILABLE", 502, "No se pudo hablar con Steam. Probá de nuevo en un rato."); }
  if(r.status === 429 || r.status >= 500) throw new SteamError("STEAM_UNAVAILABLE", 503, "Steam no responde ahora. Probá de nuevo en un rato.");
  return { ok: !!r.ok, status: r.status, j: j && typeof j === "object" ? j : {} };
}

// Ticket de sesión (lo pide el juego a Steam, en hexadecimal) -> steamid verificado por Steam.
async function authenticateTicket(ticketHex){
  if(!identityEnabled()) throw new SteamError("STEAM_DISABLED", 501, "El inicio de sesión con Steam no está activo.");
  if(typeof ticketHex !== "string" || !/^[0-9a-fA-F]{16,4096}$/.test(ticketHex)) throw new SteamError("BAD_TICKET", 400, "Ticket de Steam inválido.");
  const r = await call("GET", "/ISteamUserAuth/AuthenticateUserTicket/v1/", { key: key(), appid: appId(), ticket: ticketHex });
  const p = r.j.response && r.j.response.params;
  if(!r.ok || !p || p.result !== "OK" || !isSteamId(String(p.steamid))) throw new SteamError("BAD_TICKET", 401, "Steam no validó la sesión. Abrí Steam e intentá de nuevo.");
  if(p.vacbanned === true || p.publisherbanned === true) throw new SteamError("STEAM_BANNED", 403, "Esta cuenta de Steam no puede jugar online.");
  // con Family Sharing el dueño del juego (ownersteamid) puede ser otro: se identifica a quien juega (steamid)
  return { steamId: String(p.steamid) };
}

// Pedido de compra: el jugador lo aprueba en el overlay de Steam. orderid lo elegimos nosotros (único por AppID).
let _orderSeq = 0;
function newOrderId(){ _orderSeq = (_orderSeq + 1) % 1000; return String(Date.now() * 1000 + _orderSeq); }   // < 2^53: 1,7e15
async function initTxn({ steamId, itemId, cents, description, language = "es" }){
  if(!enabled()) throw new SteamError("STEAM_DISABLED", 501, "Las compras con Steam no están activas.");
  const orderid = newOrderId();
  const r = await call("POST", "/" + txnIface() + "/InitTxn/v3/", {
    key: key(), orderid, steamid: steamId, appid: appId(), itemcount: "1", language, currency: "USD",
    "itemid[0]": String(itemId), "qty[0]": "1", "amount[0]": String(cents), "description[0]": String(description).slice(0, 120) });
  const p = r.j.response;
  if(!r.ok || !p || p.result !== "OK") throw new SteamError("STEAM_INIT_FAILED", 502, "Steam no aceptó el pedido. Probá de nuevo en un rato.");
  return { orderId: orderid };
}
async function queryTxn(orderId){
  if(!enabled()) throw new SteamError("STEAM_DISABLED", 501, "Las compras con Steam no están activas.");
  const r = await call("GET", "/" + txnIface() + "/QueryTxn/v3/", { key: key(), appid: appId(), orderid: orderId });
  const p = r.j.response && r.j.response.params;
  if(!r.ok || !r.j.response || r.j.response.result !== "OK" || !p) return null;
  const items = Array.isArray(p.items) ? p.items : (p.items && Array.isArray(p.items.item) ? p.items.item : []);
  return { status: String(p.status || ""), steamId: String(p.steamid || ""), currency: String(p.currency || ""), orderId: String(p.orderid || orderId),
    items: items.map(i => ({ itemId: Number(i.itemid), qty: Number(i.qty), amount: Number(i.amount) })) };
}
async function finalizeTxn(orderId){
  if(!enabled()) throw new SteamError("STEAM_DISABLED", 501, "Las compras con Steam no están activas.");
  const r = await call("POST", "/" + txnIface() + "/FinalizeTxn/v2/", { key: key(), appid: appId(), orderid: orderId });
  const p = r.j.response;
  if(!r.ok || !p || p.result !== "OK") throw new SteamError("STEAM_FINALIZE_FAILED", 502, "Steam no pudo cerrar la compra. Se reintenta solo.");
  return true;
}

module.exports = { enabled, identityEnabled, live, mode, isSteamId, authenticateTicket, initTxn, queryTxn, finalizeTxn, SteamError, _setFetch: f => { _fetch = f || ((...a) => fetch(...a)); }, _apiBase: apiBase };
