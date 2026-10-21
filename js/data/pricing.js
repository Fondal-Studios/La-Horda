"use strict";
/* ============================================================
   js/data/pricing.js — UNA SOLA FUENTE DE VERDAD DE LOS PRECIOS BASE (oro y Brasas ✦)
   Datos y funciones puras, sin DOM, sin guardado y sin red: el navegador lo carga antes de js/data/champions.js y el
   servidor (server/wallet.js) ejecuta ESTE MISMO archivo en un contexto aislado. Así el cliente solo MUESTRA lo que el
   servidor DECIDE, y tools/collection/pricing-sync.js verifica que coinciden.
   Política (docs/economy/PRECIOS.md):
     · CAMPEONES: siempre se compran con ORO (nunca con Brasas). Ascensión: precio de oro propio por campeón.
     · BRASAS ✦: apariencia (skins, cromas y paquetes de apariencia) y, por decisión del dueño, las PIEZAS DE SET (equipo,
       con estadísticas). Es una excepción a "nunca poder": se puede apagar con PIECES_FOR_BRASAS (docs/economy/PRECIOS.md,
       apartado "Riesgo: poder por dinero"). Los modos competitivos recortan el equipo (LANES.PROGRESS_CAP).
     · Un precio global del juego que no está acá (equipo, talentos, Mística) sigue en su sistema, siempre en oro.
   Los precios del Game Master (cosmeticPrices / championPrices, ver docs/production/operations.md) siguen pudiendo
   cambiar el ORO; las Brasas las fija únicamente este archivo.
   ============================================================ */
var PRICING = {
  version: 1,
  gold: {
    champion: 2500,                  // STANDARD, FAMILY, Portadores y Expedición
    // Ascensión: oro propio según lo que cuesta ganarlo (js/systems/ascension-unlocks.js). Siempre se pueden ganar jugando.
    ascension: { khepri: 8000, bront: 9000, velmira: 10000, aurelia: 12000, saelis: 12000, vhal: 13000, oriel: 14000 },
    ascensionDefault: 9000,          // una Ascensión nueva sin fila propia
    cosmetic: { set: 9000, autor: 12000 }   // el croma (paleta) conserva su precio propio en oro (CROMA_SKINS[id].price)
  },
  // Brasas ✦ por escalón. "croma": cambio de paleta · "set": skin de una colección (también se gana reuniendo el set)
  // · "autor": skin independiente con diseño propio (solo se compra).
  // "pieza": una pieza de set (equipo). 4 piezas = 800 = la skin de set: ningún camino abarata la skin; los sets de 5-6 piezas valen más.
  brasas: { croma: 300, set: 800, autor: 1200, pieza: 200 },  // ✦ (1 ✦ ≈ US$ 0,01 en el pack base: ver server/premium-packs.json)
  // Colección de un guardián: todas sus apariencias que todavía no tenés, con descuento por cantidad (ahorro calculado
  // contra la suma de los precios sueltos de ESAS piezas; no hay precio "tachado" inventado).
  collection: { minPieces: 2, offPct: { 2: 15, 3: 20 } },
  // Pack de bienvenida: además de las Brasas, regala 3 elecciones de campeón STANDARD (se compran con oro: 3 × 2500).
  // Elegibles: solo categoría STANDARD publicada (nunca Ascensión, Fundadores, Evento ni Familia). Los decide el servidor.
  welcome: { pack: "brasas_bienvenida", champions: 3, category: "STANDARD" },
  // Piezas de set por Brasas: la entrega la hace el servidor en save.stash. inventoryCapacity = INVENTORY_CAPACITY (items.js; lo verifica pricing-sync).
  pieces: { inventoryCapacity: 30 }
};

/* ============================================================
   INTERRUPTOR DE LAS PIEZAS DE SET POR BRASAS ✦ — un único lugar (docs/economy/PRECIOS.md, "Riesgo: poder por dinero")
     true  (POR DEFECTO, decisión del dueño): las piezas de set se compran con Brasas, validado por el servidor.
     false : no se venden piezas de set por ningún medio (el cliente no muestra el botón y el servidor rechaza /api/wallet/buy-piece).
   Las piezas NUNCA se compran con oro (el oro es del cliente y editable: regalaría la skin que da el set completo). Las piezas que
   se ganan jugando (drops) no dependen de esto.
   ============================================================ */
var PIECES_FOR_BRASAS = true;

/* ============================================================
   INTERRUPTOR DE LA TIENDA DE OBJETOS — un único lugar (docs/economy/TIENDA_ROTACION.md)
     "demo" (POR DEFECTO): la página de muestra. Todo el catálogo se puede comprar siempre, a los precios de
                           js/systems/shop.js (SHOP_PRICES). Es el comportamiento de siempre.
     "live"              : el juego real. (1) Las piezas de set y los legendarios con nombre rotan: cada día
                           (medianoche UTC) solo SHOP_LIVE.rotation.piecesPerDay están a la venta y cada una vuelve
                           a salir dentro de un plazo máximo conocido; (2) cuestan mucho más (SHOP_LIVE.priceScale);
                           (3) "comprar las que faltan" del set se desactiva (saltearía la rotación).
                           Guardianes, equipo Básico, objetos de guardián, skins y cromas no cambian.
   Para cambiar de modo basta editar la línea de abajo. Las Brasas siguen siendo solo apariencia.
   OJO: el oro es del cliente (editable): sin servidor autoritativo la rotación es solo de presentación.
   ============================================================ */
var SHOP_MODE = "demo";   // "demo" | "live"
var SHOP_LIVE = {
  // Multiplicador sobre el precio de demo, por categoría de catálogo (pieza de set 1.200 → 7.200 · legendario 4.000 → 16.000).
  priceScale: { set: 6, legendario: 4 },
  rotation: {
    piecesPerDay: 6,        // piezas (de set + legendarios con nombre) a la venta cada día
    windowDays: 7,          // cada pieza cae siempre en la misma "semana" del ciclo: su reaparición varía como mucho ±6 días
    seed: "horda-rotacion-v1"   // cambiarla baraja todo el calendario (úsese solo en un relanzamiento)
  }
};
function pricingShopLiveScale(cat){ return Object.prototype.hasOwnProperty.call(SHOP_LIVE.priceScale, cat) ? SHOP_LIVE.priceScale[cat] : 1; }

// Rotación diaria (núcleo PURO y compartido: la tienda del cliente y el servidor calculan lo mismo). pool = [{key, cat, group}]
// ordenado por key; cfg = SHOP_LIVE.rotation. Detalle del algoritmo: js/systems/shop.js (ROTACIÓN DIARIA) y docs/economy/TIENDA_ROTACION.md.
function pricingRng(seedStr){ let h = 2166136261; for(let i=0;i<seedStr.length;i++){ h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); } return ()=>{ h = Math.imul(h ^ (h>>>15), 2246822507); h = Math.imul(h ^ (h>>>13), 3266489909); h ^= h>>>16; return (h>>>0)/4294967296; }; }
function pricingShuffle(arr, rng){ const a = arr.slice(); for(let i=a.length-1;i>0;i--){ const j = (rng()*(i+1))|0; const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function pricingRotationConfig(){ const r = SHOP_LIVE.rotation; return {n:Math.max(1, r.piecesPerDay|0), w:Math.max(1, r.windowDays|0), seed:String(r.seed)}; }
function pricingRotationContext(pool, cfg){
  const setPieces = {}, legends = [];
  for(const e of pool){
    if(e.cat==="legendario") legends.push(e.key);
    else (setPieces[e.group] = setPieces[e.group] || []).push(e.key);
  }
  const groups = pricingShuffle(Object.keys(setPieces).sort(), pricingRng(cfg.seed+"|sets"));
  const S = []; for(let r=0; S.length < pool.length - legends.length; r++) for(const g of groups) if(setPieces[g][r]) S.push(setPieces[g][r]);
  const G = pricingShuffle(legends, pricingRng(cfg.seed+"|legend")), T = S.length + G.length, A = new Array(T), at = {};
  G.forEach((k, i)=>{ at[Math.floor((i + 0.5) * T / G.length)] = k; });
  for(let p=0, si=0; p<T; p++) A[p] = at[p] !== undefined ? at[p] : S[si++];
  const L = Math.max(1, Math.ceil(T / cfg.n));
  return {cfg, A, T, L, maxGap:L + Math.min(cfg.w, L) - 1, minGap:Math.max(1, L - Math.min(cfg.w, L) + 1)};
}
function pricingRotationKeys(c, D){
  const {n, w, seed} = c.cfg;
  if(!c.T) return [];
  const cyc = Math.floor(D / c.L), k = D - cyc * c.L, win = Math.floor(k / w), start = win * w, size = Math.min(w, c.L - start);
  const perm = pricingShuffle(Array.from({length:size}, (_, i)=>i), pricingRng(seed+"|c"+cyc+"|w"+win)); // perm[j] = día (en la ventana) de la pieza-día j
  const h = start + perm.indexOf(k - start);
  return c.A.slice(h * n, h * n + n);
}

// Escalón de una apariencia: "set" si es una skin de colección, "autor" si es una skin independiente, "croma" si es paleta.
function pricingCosmeticTier(isSetSkin, cromaDef){
  if(isSetSkin) return "set";
  if(!cromaDef) return null;
  return (cromaDef.appearanceType === "skin" || cromaDef.authoredPacks) ? "autor" : "croma";
}
function pricingBrasas(tier){ return Object.prototype.hasOwnProperty.call(PRICING.brasas, tier) ? PRICING.brasas[tier] : 0; }
// Oro de una apariencia. El croma usa su precio propio (fallbackGold = el de su definición).
function pricingCosmeticGold(tier, fallbackGold){
  return tier === "set" || tier === "autor" ? PRICING.gold.cosmetic[tier] : (Number.isSafeInteger(fallbackGold) ? fallbackGold : 0);
}
// Oro de un campeón: Ascensión con precio propio; el resto, el general.
function pricingChampionGold(id, category){
  if(category === "ASCENSION") return Object.prototype.hasOwnProperty.call(PRICING.gold.ascension, id) ? PRICING.gold.ascension[id] : PRICING.gold.ascensionDefault;
  return PRICING.gold.champion;
}
// Colección: prices = precios sueltos (✦) de las piezas que faltan. -> {n, sum, offPct, price, save} (price = sum si no aplica).
function pricingCollection(prices){
  const n = prices.length, sum = prices.reduce((a, b) => a + b, 0);
  if(n < PRICING.collection.minPieces) return { n, sum, offPct: 0, price: sum, save: 0 };
  const keys = Object.keys(PRICING.collection.offPct).map(Number).sort((a, b) => a - b);
  let off = 0; for(const k of keys) if(n >= k) off = PRICING.collection.offPct[k];
  const price = Math.round(sum * (100 - off) / 100 / 10) * 10;
  return { n, sum, offPct: off, price, save: sum - price };
}
