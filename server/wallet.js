"use strict";
// BILLETERA PREMIUM ("Brasas"). El saldo vive en el SERVIDOR (horda_wallet / data/wallet.json), nunca en el guardado del
// cliente: el guardado lo escribe el cliente y se puede editar; la moneda que algún día se compra con dinero no.
//   · Cada movimiento queda en un libro append-only con referencia ÚNICA: reintentar un pedido no cobra ni acredita dos veces.
//   · Comprar con Brasas: el precio lo pone el servidor, se debita, se entrega la skin en el guardado (con control de
//     versión, igual que los regalos del Game Master) y, si no se pudo entregar, se reintegra.
//   · Cosméticos (skins, cromas y colecciones de apariencias) y, por decisión del dueño, PIEZAS DE SET (equipo): /api/wallet/buy-piece.
//     Es la única compra que da poder; se apaga con PIECES_FOR_BRASAS (js/data/pricing.js; ver docs/economy/PRECIOS.md, "Riesgo:
//     poder por dinero"). Los CAMPEONES no se compran con Brasas: se compran con oro. Única excepción: las 3 elecciones del Pack de
//     bienvenida (regalo, no compra).
//   · Precios: UNA fuente (js/data/pricing.js, la misma que carga el cliente). Este módulo la ejecuta en un contexto aislado.
//   · El panel de administración acredita o corrige saldos (permiso MODIFY_CURRENCY); queda en el libro y en la auditoría.
//   · Pagos con dinero real: server/payments.js (apagado hasta configurar un proveedor; ver docs/production/PREMIUM_CURRENCY.md).
const crypto = require("crypto");
const fs = require("fs");
const legacyIds = require("../js/storage/legacy-champion-ids.js");
const path = require("path");
const vm = require("vm");
const payments = require("./payments");

const CURRENCY = Object.freeze({ id: "brasas", name: "Brasas", icon: "✦" });
const entitlements = require("./entitlements");

// Precios base: se ejecuta js/data/pricing.js (datos y funciones puras) igual que el catálogo de skins.
let PRICING_MOD = null;
function pricing(){
  if(PRICING_MOD) return PRICING_MOD;
  const c = {}; vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/data/pricing.js"), "utf8") + "\n;this.__P = PRICING; this.__fn = { pricingCosmeticTier, pricingBrasas, pricingCosmeticGold, pricingChampionGold, pricingCollection, pricingRotationConfig, pricingRotationContext, pricingRotationKeys }; this.__flags = () => ({ SHOP_MODE: SHOP_MODE, PIECES_FOR_BRASAS: PIECES_FOR_BRASAS });", c, { timeout: 1000, filename: "pricing.js" });
  return (PRICING_MOD = Object.assign({ PRICING: c.__P, __flags: c.__flags }, c.__fn));
}
// Interruptores (js/data/pricing.js: SHOP_MODE, PIECES_FOR_BRASAS). Las pruebas pueden pisarlos con setTestFlags (nunca en producción).
let FLAG_OVERRIDE = null;
const flags = () => Object.assign(pricing().__flags(), FLAG_OVERRIDE || {});
function setTestFlags(o){ FLAG_OVERRIDE = o; }
// Piezas de set a la venta: server/shop-pieces.json lo genera tools/items/gen_shop_pieces.js desde la tienda real del cliente y
// tools/collection/pricing-sync.js verifica que coincide (piezas, sets y rotación diaria).
let PIECE_DB = null;
function pieceDb(){ return PIECE_DB || (PIECE_DB = JSON.parse(fs.readFileSync(path.join(__dirname, "shop-pieces.json"), "utf8"))); }
let ROT_CTX = null;
function rotationKeys(day){
  const P = pricing();
  if(!ROT_CTX) ROT_CTX = P.pricingRotationContext(pieceDb().pool, P.pricingRotationConfig());
  return P.pricingRotationKeys(ROT_CTX, day);
}
const brasasOf = (sku) => pricing().pricingBrasas(sku.tier);
const goldOf = (sku) => pricing().pricingCosmeticGold(sku.tier, sku.goldBase);

function fail(code, status){ const e = new Error(code); e.status = status || 400; throw e; }
function text(s, n){ if(typeof s !== "string") return ""; return s.normalize("NFC").replace(/[<>\u0000-\u001f\u007f]/g, "").trim().slice(0, n || 120); }
function refOf(s){ return typeof s === "string" && /^[a-zA-Z0-9_.:-]{8,80}$/.test(s) ? s : ""; }

// Catálogo de skins (lo mismo que ve el cliente): se ejecuta SOLO metadata del repositorio en un contexto aislado.
let SKINS = null;
function skinCatalog(){
  if(SKINS) return SKINS;
  const noop = () => {};
  const c = { CROMA_SKINS: {}, CROMA_CRYSTALS: {}, SET_SKINS: {}, champPackLoadAtlas: noop, champPackCloneAtlas: noop, champPackLoadSheets: noop, console: { log: noop, warn: noop } };
  vm.createContext(c);
  const root = path.join(__dirname, "..");
  for(const f of ["js/assets/croma-skins-meta.js", "js/assets/set-skins-meta.js", "js/assets/portadores-meta.js", "js/assets/ynara-meta.js",
                  "js/assets/complete-set-skins-meta.js", "js/assets/alpha-set-skins-meta.js", "js/assets/unique-skins-meta.js", "js/assets/quality-five-skins-meta.js", "js/assets/quality-five-collection-meta.js",
                  "js/assets/mythic-collection-meta.js", "js/assets/extra-skins-meta.js", "js/champions/expedition/catalog.js", "js/champions/expedition/art.js", "js/champions/expedition/cosmetics.js"]){
    const file = path.join(root, f); if(!fs.existsSync(file)) continue;
    try{ vm.runInContext(fs.readFileSync(file, "utf8"), c, { timeout: 1000, filename: f }); }catch(e){ /* un archivo que no es solo metadata no rompe el catálogo */ }
  }
  const out = {};
  const P = pricing();
  for(const [id, v] of Object.entries(c.SET_SKINS)) out[id] = { id, name: v.name, champion: v.champ || null, kind: "set", earnedOnly:v.earnedOnly===true, requiresSet:v.requiresSet||null, tier: P.pricingCosmeticTier(true, null) };
  // escalón por apariencia: skin independiente ("autor") o cambio de paleta ("croma"); precio en pricing.js
  for(const [id, v] of Object.entries(c.CROMA_SKINS)) out[id] = { id, name: v.name, champion: v.champ || null, kind: v.appearanceType === "skin" || v.authoredPacks ? "croma-skin" : "croma",
    tier: P.pricingCosmeticTier(false, v), goldBase: Number.isSafeInteger(v.price) ? v.price : 0 };
  return (SKINS = out);
}

function routes(ctx){
  const { getStore, auth, send, err, readBody, summarize, now, isOwner, log } = ctx;
  const result = {};
  function route(method, url, role, fn){
    result[method + " " + url] = async (req, res, ip) => {
      try{
        let user = null;
        if(role){ const a = await auth(req); if(!a.user) fail("NO_SESSION", 401); user = a.user; if(role === "owner" && !isOwner(user)) fail("FORBIDDEN", 403); }
        const body = method === "GET" ? {} : await readBody(req, 16384);
        send(req, res, 200, await fn({ req, user, body, ip }));
      }catch(e){ if(e.status) return err(req, res, e.status, e.message, e.human || e.message); throw e; }
    };
  }
  const store = () => { const s = getStore(); if(!s || !s.walletApply) fail("WALLET_DOWN", 503); return s; };
  // ¿ya se acreditó este paquete de una sola vez a la cuenta? (lo decide el libro del servidor, nunca el cliente)
  const bought = (userId) => async (packId) => {
    const ref = payments.onceRef(packId, userId);
    return store().walletHasRef ? store().walletHasRef(ref) : !!(await store().walletLedger(userId, 100000)).find(e => e.ref === ref);
  };

  // Entrega una skin en el guardado del jugador, con control de versión (reintenta si el cliente subió algo en el medio)
  // mutate(d) cambia el guardado; se guarda con control de versión y se reintenta si el cliente subió algo en el medio
  async function mutateSave(userId, mutate){
    for(let i = 0; i < 4; i++){
      const saved = await store().getSave(userId);
      const d = saved ? JSON.parse(saved.data) : null;
      if(!d) return { ok: false, reason: "NO_SAVE" };
      const abort = mutate(d);   // un texto = abortar sin guardar (motivo)
      if(typeof abort === "string") return { ok: false, reason: abort };
      const r = await store().putSave(userId, JSON.stringify(d), summarize(d), saved.version, false);
      if(r.ok) return { ok: true, saveVersion: r.version, baseVersion: saved.version };
    }
    return { ok: false, reason: "CONFLICT" };
  }
  const isCromaKind = (sku) => sku.kind !== "set";
  const grantSkins = (userId, skus) => mutateSave(userId, d => {
    d.cosmeticUnlocks = Object.assign({}, d.cosmeticUnlocks);
    for(const sku of skus){
      d.cosmeticUnlocks[sku.id] = true;
      if(isCromaKind(sku)) d.cromas = Object.assign({}, d.cromas, { [sku.id]: true });
    }
  });
  const grantSkin = (userId, sku) => grantSkins(userId, [sku]);
  const ownedIn = (d, sku) => !!((d.cosmeticUnlocks && d.cosmeticUnlocks[sku.id]) || (isCromaKind(sku) && d.cromas && d.cromas[sku.id]));
  async function owned(userId, sku){
    const saved = await store().getSave(userId); if(!saved) return false;
    return ownedIn(JSON.parse(saved.data), sku);
  }
  const cosmeticOut = (sku) => ({ id: sku.id, type: isCromaKind(sku) ? "croma" : "skin" });

  /* ---------- Pack de bienvenida: 3 elecciones de campeón (regalo; el servidor decide y registra) ----------
     Derecho: la compra del pack (referencia once:<pack>:<cuenta> del libro). Cada elección es un asiento de monto 0 en el
     libro con referencia única por campeón (welcome:<cuenta>:<campeón>): reintentar no la repite y no hay duplicados.
     Se registra ANTES de entregar: si la entrega falla (guardado en conflicto), la elección queda hecha y se completa
     al reintentar o al abrir la billetera (reconcilia), así que no se pierde ni se cobra otra. Un candado por cuenta evita
     que dos pedidos simultáneos pasen del límite. Solo campeones STANDARD publicados y comprables que la cuenta no tiene. */
  const locks = new Map();
  function withLock(key, fn){
    const next = (locks.get(key) || Promise.resolve()).catch(() => {}).then(fn);
    locks.set(key, next);
    next.catch(() => {}).then(() => { if(locks.get(key) === next) locks.delete(key); });
    return next;
  }
  const welcomeRef = (userId, champ) => "welcome:" + userId + ":" + champ;
  function welcomeEligibleIds(){
    const T = entitlements.taxonomy(), want = pricing().PRICING.welcome.category;
    return T.ids.filter(id => { const m = T.meta(id); return m.category === want && m.releaseState === "RELEASED" && m.purchasable && !T.requiresGrant(id); });
  }
  async function welcomeState(userId, d){
    const W = pricing().PRICING.welcome;
    const entitled = (await bought(userId)(W.pack)) ? W.champions : 0;
    const claimed = entitled ? (await store().walletLedger(userId, 5000)).filter(e => typeof e.reason === "string" && e.reason.startsWith("welcome_pick:")).map(e => legacyIds.legacyChampionId(e.reason.slice(13))) : [];
    const out = { entitled, claimed: [...new Set(claimed)].reverse(), remaining: 0, eligible: [] };
    out.remaining = Math.max(0, entitled - out.claimed.length);
    if(out.remaining && d){ const has = (id) => !!(d.champions && d.champions[id] && d.champions[id].unlocked); out.eligible = welcomeEligibleIds().filter(id => !has(id)); }
    return out;
  }
  // completa la entrega de elecciones ya registradas que no llegaron al guardado (nunca quita nada)
  async function welcomeReconcile(userId, claimed){
    if(!claimed.length) return null;
    const saved = await store().getSave(userId); if(!saved) return null;
    const d = JSON.parse(saved.data);
    const missing = claimed.filter(id => !(d.champions && d.champions[id] && d.champions[id].unlocked));
    if(!missing.length) return null;
    return mutateSave(userId, x => { x.champions = Object.assign({}, x.champions); for(const id of missing) x.champions[id] = Object.assign({}, x.champions[id], { unlocked: true }); });
  }

  route("GET", "/api/wallet", "user", async ({ user }) => {
    const w = await store().walletGet(user.id);
    const P = pricing().PRICING;
    // la entrega pendiente de una elección ya registrada se completa acá (reconciliación, ver Pack de bienvenida)
    let welcome = await welcomeState(user.id, null);
    if(welcome.entitled){
      await withLock("welcome:" + user.id, async () => {
        welcome = await welcomeState(user.id, null);
        try{ await welcomeReconcile(user.id, welcome.claimed); }catch(e){ /* se reintenta en la próxima apertura */ }
        const saved = welcome.remaining ? await store().getSave(user.id) : null;
        welcome = await welcomeState(user.id, saved ? JSON.parse(saved.data) : null);
      });
    }
    return { currency: CURRENCY, premium: w.premium,
      pieces: { enabled: !!flags().PIECES_FOR_BRASAS, price: P.brasas.pieza, mode: flags().SHOP_MODE },
      prices: { brasas: P.brasas, goldCosmetic: P.gold.cosmetic, collection: P.collection, skinPremium: P.brasas.set, skinGold: P.gold.cosmetic.set },
      welcome: { pack: P.welcome.pack, champions: P.welcome.champions, entitled: welcome.entitled, claimed: welcome.claimed, remaining: welcome.remaining, eligible: welcome.eligible },
      ledger: (await store().walletLedger(user.id, 20)).map(e => ({ delta: e.delta, balanceAfter: e.balanceAfter, reason: e.reason, at: e.at })),
      payments: { ...(await payments.publicInfo(bought(user.id))), enabled: !!store().persistent && payments.enabled() } };
  });

  // Comprar una apariencia (skin de set, skin independiente o croma) con Brasas. ref: identificador del intento que genera el
  // cliente (reintentar = mismo ref). El precio lo pone el servidor; expectedPrice es lo que el jugador VIO y debe coincidir.
  route("POST", "/api/wallet/buy", "user", async ({ user, body }) => withLock("buy:" + user.id, async () => {   // un candado por cuenta: dos compras simultáneas no cobran dos veces
    const ref = refOf(body.ref); if(!ref) fail("BAD_REF");
    const sku = Object.hasOwn(skinCatalog(), body.sku) ? skinCatalog()[body.sku] : null; if(!sku) fail("BAD_SKU");
    if(sku.earnedOnly)fail("BAD_SKU");
    if(sku.requiresSet&&!((await store().gmRead())?.itemEconomy?.accounts?.[String(user.id)]?.cosmetics||[]).includes(sku.requiresSet))fail("SET_REQUIRED",403);
    const price = brasasOf(sku); if(!(price > 0)) fail("BAD_SKU");
    if(body.expectedPrice !== price) fail("PRICE_CHANGED", 409);
    const debitRef = "buy:" + user.id + ":" + ref;
    if(await owned(user.id, sku)){
      // si ya la tiene: o es un reintento de esta misma compra (ok) o nunca se cobra
      const prev = (await store().walletLedger(user.id, 200)).find(e => e.ref === debitRef);
      if(prev) return { ok: true, repeated: true, sku: sku.id, premium: (await store().walletGet(user.id)).premium };
      fail("OWNED", 409);
    }
    const debit = await store().walletApply({ userId: user.id, delta: -price, reason: "buy:" + sku.id, ref: debitRef, actor: user.id, at: now() });
    if(debit.insufficient) fail("INSUFFICIENT", 402);
    const g = await grantSkin(user.id, sku);
    if(!g.ok){
      await store().walletApply({ userId: user.id, delta: price, reason: "refund:" + sku.id + ":" + g.reason, ref: "refund:" + debitRef, actor: user.id, at: now() });
      fail(g.reason === "NO_SAVE" ? "NO_CLOUD_SAVE" : "CONFLICT", 409);
    }
    if(/^(lucifer|glaciar|coloso|tempestad|alba)_/.test(sku.id))await store().gmUpdate(raw=>{const a=raw?.itemEconomy?.accounts?.[String(user.id)];if(a&&!a.cosmetics.includes(sku.id))a.cosmetics.push(sku.id);return {state:raw,value:null};});
    log("WALLET_BUY", { user: user.id, sku: sku.id, price, premium: debit.premium });
    // mismo formato que los premios de evento: el cliente lo aplica con accountApplyEventReward (avanza la versión sin conflicto)
    return { ok: true, sku: sku.id, kind: sku.kind, price, cosmetic: sku.id, cosmeticType: isCromaKind(sku) ? "croma" : "skin", cosmetics: [cosmeticOut(sku)],
      premium: (await store().walletGet(user.id)).premium, saveVersion: g.saveVersion, baseVersion: g.baseVersion };
 }));

  /* ---------- Piezas de set (equipo) con Brasas ----------
     El servidor decide TODO: que el interruptor esté prendido, que la pieza exista y esté a la venta (en "live", la rotación diaria
     UTC), el precio, que haya lugar en el inventario y que no la tengas ya. Cobra (asiento con referencia única) y la ENTREGA en
     save.stash de la nube como esbozo {uid, designId, srvGrant} que el cliente completa al cargar (js/storage/save.js). Registra la
     pieza en la colección y, si con ella se completa un set que tiene skin, entrega la skin (el regalo del set completo).
     La entrega es idempotente por uid (derivado de la referencia): reintentar no duplica ni cobra otra vez; si no se pudo entregar, se reintegra. */
  const pieceUid = (debitRef) => "it_srv_" + crypto.createHash("sha256").update(debitRef).digest("hex").slice(0, 16);
  const stashFree = (d) => {
    const eq = new Set(); for(const c of Object.values(d.champions || {})) for(const u of Object.values((c && c.equipment) || {})) if(u) eq.add(u);
    return (pricing().PRICING.pieces.inventoryCapacity) - (Array.isArray(d.stash) ? d.stash.filter(it => it && !eq.has(it.uid)).length : 0);
  };
  const hasPiece = (d, id) => Array.isArray(d.stash) && d.stash.some(it => it && it.designId === id);
  route("POST", "/api/wallet/buy-piece", "user", async ({ user, body }) => withLock("buy:" + user.id, async () => {
    if(!flags().PIECES_FOR_BRASAS) fail("PIECES_OFF", 403);
    const ref = refOf(body.ref); if(!ref) fail("BAD_REF");
    const db = pieceDb(), id = typeof body.piece === "string" ? body.piece : "";
    const piece = Object.hasOwn(db.pieces, id) ? db.pieces[id] : null; if(!piece) fail("BAD_SKU");
    const price = pricing().pricingBrasas("pieza"); if(!(price > 0)) fail("BAD_SKU");
    if(body.expectedPrice !== price) fail("PRICE_CHANGED", 409);
    const debitRef = "buyp:" + user.id + ":" + ref, uid = pieceUid(debitRef);
    const prev = (await store().walletLedger(user.id, 200)).find(e => e.ref === debitRef);
    const saved = await store().getSave(user.id); if(!saved) fail("NO_CLOUD_SAVE", 409);
    const d0 = JSON.parse(saved.data);
    if(prev){   // reintento de una compra ya cobrada: se completa la entrega si faltaba
      if(!(Array.isArray(d0.stash) && d0.stash.some(it => it && it.uid === uid))){
        const g = await grantPiece(user.id, id, piece, uid);
        if(!g.ok) fail(g.reason === "NO_SAVE" ? "NO_CLOUD_SAVE" : g.reason === "INVENTORY_FULL" ? "INVENTORY_FULL" : "CONFLICT", 409);
      }
      return { ok: true, repeated: true, piece: { uid, designId: id }, premium: (await store().walletGet(user.id)).premium };
    }
    // rotación: en "live" solo se vende lo que sale hoy (día UTC); en "demo", todo el catálogo
    if(flags().SHOP_MODE === "live" && !rotationKeys(Math.floor(now() / 86400000)).includes("d:" + id)) fail("NOT_ON_SALE", 409);
    if(hasPiece(d0, id)) fail("OWNED", 409);
    if(stashFree(d0) <= 0) fail("INVENTORY_FULL", 409);
    const debit = await store().walletApply({ userId: user.id, delta: -price, reason: "buyp:" + id, ref: debitRef, actor: user.id, at: now() });
    if(debit.insufficient) fail("INSUFFICIENT", 402);
    const g = await grantPiece(user.id, id, piece, uid);
    if(!g.ok){
      await store().walletApply({ userId: user.id, delta: price, reason: "refund:" + id + ":" + g.reason, ref: "refund:" + debitRef, actor: user.id, at: now() });
      fail(g.reason === "NO_SAVE" ? "NO_CLOUD_SAVE" : g.reason === "INVENTORY_FULL" ? "INVENTORY_FULL" : "CONFLICT", 409);
    }
    log("WALLET_BUY_PIECE", { user: user.id, piece: id, price, premium: debit.premium, setCompleted: g.setCompleted || null });
    return { ok: true, piece: { uid, designId: id }, set: piece.set, price, setCompleted: g.setCompleted || null,
      cosmetics: g.setCompleted ? [{ id: g.setCompleted, type: "skin" }] : [],
      premium: (await store().walletGet(user.id)).premium, saveVersion: g.saveVersion, baseVersion: g.baseVersion };
  }));
  async function grantPiece(userId, id, piece, uid){
    let completed = null;
    const r = await mutateSave(userId, d => {
      completed = null;
      d.stash = Array.isArray(d.stash) ? d.stash.slice() : [];
      if(d.stash.some(it => it && it.uid === uid)) return;   // ya entregada
      if(stashFree(d) <= 0) return "INVENTORY_FULL";
      d.stash.push({ uid, designed: true, designId: id, type: piece.type, rarity: piece.rarity || "legendario", set: piece.set, champion: piece.champion || null, name: piece.name, level: 1, bought: true, srvGrant: true });
      const col = Object.assign({}, d.collection), c = col[id];
      col[id] = { n: (c && Number(c.n) > 0 ? Number(c.n) : 0) + 1, first: (c && c.first) || now(), isNew: true };
      d.collection = col;
      // el set completo (todas las piezas registradas en la colección) regala su skin, igual que cosmeticUnlockCompletedSet en el cliente
      const ids = pieceDb().sets[piece.set] || [];
      if(skinCatalog()[piece.set] && skinCatalog()[piece.set].kind === "set" && ids.length && ids.every(k => col[k] && Number(col[k].n) > 0)){
        d.cosmeticUnlocks = Object.assign({}, d.cosmeticUnlocks, { [piece.set]: true }); completed = piece.set;
      }
    });
    return Object.assign({}, r, { setCompleted: completed });
  }

  // Colección de un campeón: todas sus apariencias que todavía no tenés, con descuento por cantidad (ahorro calculado contra
  // la suma de los precios sueltos de ESAS piezas). Una sola compra, un solo cobro, un solo asiento en el libro.
  route("POST", "/api/wallet/buy-collection", "user", async ({ user, body }) => withLock("buy:" + user.id, async () => {   // mismo candado que la compra individual
    const ref = refOf(body.ref); if(!ref) fail("BAD_REF");
    const champ = typeof body.champion === "string" ? legacyIds.legacyChampionId(body.champion) : "";
    const all = Object.values(skinCatalog()).filter(s => s.champion === champ); if(!champ || !all.length) fail("BAD_CHAMPION");
    const debitRef = "buycol:" + user.id + ":" + ref;
    const saved = await store().getSave(user.id); if(!saved) fail("NO_CLOUD_SAVE", 409);
    const d = JSON.parse(saved.data), missing = all.filter(s => !ownedIn(d, s));
    const prev = (await store().walletLedger(user.id, 200)).find(e => e.ref === debitRef);
    if(prev) return { ok: true, repeated: true, champion: champ, premium: (await store().walletGet(user.id)).premium };
    const q = pricing().pricingCollection(missing.map(brasasOf));
    if(missing.length < pricing().PRICING.collection.minPieces) fail("NOT_A_COLLECTION", 409);
    if(body.expectedPrice !== q.price) fail("PRICE_CHANGED", 409);
    const debit = await store().walletApply({ userId: user.id, delta: -q.price, reason: "buycol:" + champ + ":" + missing.map(s => s.id).join(","), ref: debitRef, actor: user.id, at: now() });
    if(debit.insufficient) fail("INSUFFICIENT", 402);
    const g = await grantSkins(user.id, missing);
    if(!g.ok){
      await store().walletApply({ userId: user.id, delta: q.price, reason: "refund:" + champ + ":" + g.reason, ref: "refund:" + debitRef, actor: user.id, at: now() });
      fail(g.reason === "NO_SAVE" ? "NO_CLOUD_SAVE" : "CONFLICT", 409);
    }
    log("WALLET_BUY_COLLECTION", { user: user.id, champion: champ, n: missing.length, price: q.price, save: q.save, premium: debit.premium });
    return { ok: true, champion: champ, n: missing.length, price: q.price, offPct: q.offPct, saved: q.save, cosmetics: missing.map(cosmeticOut),
      premium: (await store().walletGet(user.id)).premium, saveVersion: g.saveVersion, baseVersion: g.baseVersion };
  }));

  // Elegir uno de los 3 campeones de regalo del Pack de bienvenida.
  route("POST", "/api/wallet/welcome/claim", "user", async ({ user, body }) => withLock("welcome:" + user.id, async () => {
    const champ = typeof body.champion === "string" ? legacyIds.legacyChampionId(body.champion) : "";
    if(!champ || !welcomeEligibleIds().includes(champ)) fail("BAD_CHAMPION");
    if(!(await welcomeState(user.id, null)).entitled) fail("NOT_PURCHASED", 403);   // sin compra no hay derecho, haya o no guardado
    const saved = await store().getSave(user.id); if(!saved) fail("NO_CLOUD_SAVE", 409);
    let st = await welcomeState(user.id, JSON.parse(saved.data));
    const done = (extra) => ({ ok: true, champion: champ, entitled: st.entitled, claimed: st.claimed, remaining: st.remaining, ...extra });
    if(st.claimed.includes(champ)){   // reintento: se completa la entrega si faltaba, sin consumir otra elección
      const r = await welcomeReconcile(user.id, st.claimed);
      if(r && !r.ok) fail("CONFLICT", 409);
      return done({ repeated: true, champions: [champ], saveVersion: r ? r.saveVersion : undefined, baseVersion: r ? r.baseVersion : undefined });
    }
    if(!st.remaining) fail("NO_PICKS_LEFT", 409);
    const have = JSON.parse(saved.data).champions;
    if(have && have[champ] && have[champ].unlocked) fail("OWNED", 409);
    const w = await store().walletApply({ userId: user.id, delta: 0, reason: "welcome_pick:" + champ, ref: welcomeRef(user.id, champ), actor: user.id, at: now() });
    log("WELCOME_PICK", { user: user.id, champion: champ, duplicate: !!w.duplicate });
    const g = await mutateSave(user.id, x => { x.champions = Object.assign({}, x.champions); x.champions[champ] = Object.assign({}, x.champions[champ], { unlocked: true }); x.starterChosen = true; });
    st = { ...st, claimed: [...st.claimed, champ], remaining: st.remaining - 1 };
    if(!g.ok) fail("CONFLICT", 409);   // la elección quedó registrada: reintentar completa la entrega
    return done({ champions: [champ], saveVersion: g.saveVersion, baseVersion: g.baseVersion });
  }));

  // El Game Master acredita y ve saldos desde el panel de usuarios (server/admin-users.js, permiso MODIFY_CURRENCY).

  // Pagos con dinero real (apagado hasta configurar un proveedor: server/payments.js)
  route("POST", "/api/wallet/checkout", "user", async ({ user, body }) => {
    if(payments.enabled() && !store().persistent) fail("PAYMENTS_STORAGE_UNSAFE", 503);
    return payments.checkout({ user, pack: body.pack, bought: bought(user.id), expectedPrice: body.expectedPrice });
  });
  // Reembolso total o contracargo de un pago ya acreditado: se descuentan las Brasas de ESE pago, una sola vez (ref rev:<pago>).
  // Si la cuenta ya gastó parte, se descuenta lo que queda (el saldo nunca es negativo) y la diferencia queda anotada en el libro
  // como "reversal_shortfall" para que el dueño decida (ver docs/commercial/MERCADO_PAGO_PASO_A_PASO.md). Nunca se quitan skins solas.
  const reversePurchase = (credit) => withLock("buy:" + credit.userId, async () => {
    const orig = (await store().walletLedger(credit.userId, 100000)).find(e => e.reason === "purchase:" + credit.pack + ":" + credit.paymentId);
    if(!orig){ log("PAYMENT_REVERSAL_NOT_CREDITED", { paymentId: credit.paymentId, status: credit.status }); return { ok: true, ignored: true, reason: "NOT_CREDITED" }; }
    const tag = credit.status + ":" + credit.pack + ":" + credit.paymentId;
    let r = null, took = 0;
    for(let i = 0; i < 4; i++){
      const have = (await store().walletGet(credit.userId)).premium;
      took = Math.min(have, orig.delta);
      r = await store().walletApply({ userId: credit.userId, delta: -took, reason: "reversal:" + tag, ref: "rev:" + credit.paymentId, actor: null, at: now() });
      if(!r.insufficient) break;
    }
    if(r.duplicate) return { ok: true, duplicate: true };
    if(r.insufficient) throw Object.assign(new Error("PAYMENTS_UNAVAILABLE"), { status: 503 });
    const short = orig.delta - took;
    if(short > 0) await store().walletApply({ userId: credit.userId, delta: 0, reason: "reversal_shortfall:" + short + ":" + tag, ref: "revshort:" + credit.paymentId, actor: null, at: now() });
    log("WALLET_REVERSAL", { user: credit.userId, pack: credit.pack, paymentId: credit.paymentId, status: credit.status, reversed: took, shortfall: short });
    return { ok: true, reversed: took, shortfall: short };
  });
  result["POST /api/payments/webhook"] = async (req, res) => {
    try{
      const raw = await new Promise((ok, ko) => { let b = ""; req.on("data", c => { b += c; if(b.length > 65536){ ko(Object.assign(new Error("TOO_BIG"), { code: "TOO_BIG" })); req.destroy(); } }); req.on("end", () => ok(b)); req.on("error", ko); });
      const credit = await payments.verifyWebhookRequest(req, raw);   // null si el proveedor no está configurado o la firma no es válida
      if(!credit) return err(req, res, 400, "BAD_WEBHOOK", "Webhook no verificado.");
      if(credit.ignored){ log("PAYMENT_STATUS_REVIEW", { paymentId: credit.paymentId, status: credit.status }); return send(req, res, 200, { ok: true, ignored: true }); }
      if(!store().persistent) return err(req, res, 503, "PAYMENTS_STORAGE_UNSAFE", "Almacenamiento no persistente.");
      if(credit.reverse) return send(req, res, 200, await reversePurchase(credit));
      if(!(await store().getUser(credit.userId))) return err(req, res, 404, "UNKNOWN_USER", "Cuenta inexistente.");
      // paquete de una sola vez: la referencia es por cuenta (once:<pack>:<userId>), así un segundo pago nunca acredita
      const r = await store().walletApply({ userId: credit.userId, delta: credit.premium, reason: "purchase:" + credit.pack + ":" + credit.paymentId, ref: payments.creditRef(credit), actor: null, at: now() });
      const alreadyBought = !!(r.duplicate && credit.once);
      log(alreadyBought ? "WALLET_ONCE_REPEATED" : "WALLET_PURCHASE", { user: credit.userId, pack: credit.pack, paymentId: credit.paymentId, duplicate: !!r.duplicate });
      send(req, res, 200, { ok: true, duplicate: !!r.duplicate, alreadyBought });
    }catch(e){ if(e.status) return err(req, res, e.status, e.message, e.message); throw e; }
  };
  return result;
}

module.exports = { routes, CURRENCY, skinCatalog, pricing, pieceDb, rotationKeys, setTestFlags };
