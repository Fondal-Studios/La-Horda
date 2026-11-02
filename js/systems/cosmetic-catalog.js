"use strict";
/* ============================================================
   js/systems/cosmetic-catalog.js
   CATÁLOGO COSMÉTICO DESACOPLADO DEL SISTEMA DE PAGOS (Premium Skin Factory · Beta).
   - SOLO LEE CROMA_SKINS / CLASSES. No lee ni escribe save.*, oro, brasas, relay ni cuentas.
   - Categorías: estandar · epica · legendaria · pack.
   - Vista previa, comparación y equipamiento viven en un SANDBOX propio (memoria; sessionStorage
     bajo la clave "cosmetic_sandbox_v1", jamás el guardado del juego).
   - Compras SIMULADAS: moneda de prueba, recibo {simulated:true}. No hay pagos reales. La integración
     con Economía V2 queda detrás de la interfaz `CosmeticCatalog.setCheckoutAdapter` (hoy: ninguno).
   - Cero ventajas competitivas: cada entrada es cosmética por contrato; la comparación incluye un
     sello de estadísticas del campeón que debe ser idéntico con cualquier skin (verificado en pruebas).
   ============================================================ */
const CosmeticCatalog = (function(){
  const TIERS = {estandar:{label:"Estándar", order:0}, epica:{label:"Épica", order:1}, legendaria:{label:"Legendaria", order:2}, pack:{label:"Pack cosmético", order:3}};
  const FORBIDDEN_KEYS = ["dmg","damage","hp","maxHp","speed","range","radius","hitbox","cd","cooldown","armor","stats","power"];
  const SANDBOX_KEY = "cosmetic_sandbox_v1", START_FUNDS = 100000;
  let checkout = null; // adaptador de pago futuro (Economía V2); null = solo simulación
  const sb = {funds:START_FUNDS, owned:{}, equipped:{}, receipts:[]};
  try{ const raw = typeof sessionStorage!=="undefined" && sessionStorage.getItem(SANDBOX_KEY); if(raw){ const o = JSON.parse(raw); if(o && typeof o.funds==="number") Object.assign(sb, {funds:o.funds, owned:o.owned||{}, equipped:o.equipped||{}, receipts:o.receipts||[]}); } }catch(e){}
  function persist(){ try{ if(typeof sessionStorage!=="undefined") sessionStorage.setItem(SANDBOX_KEY, JSON.stringify(sb)); }catch(e){} }
  function tierOf(s){
    if(s.tier) return s.tier;
    const r = String(s.rarity||"").toLowerCase();
    return /legend/.test(r) ? "legendaria" : /pica/.test(r) ? "epica" : "estandar";
  }
  // Sello de estadísticas del campeón: igual para cualquier skin del mismo campeón (prueba de no-ventaja).
  function statSeal(champ){
    const c = CLASSES[champ]; if(!c) return null;
    return JSON.stringify([c.hp, c.dmg, c.speed, c.range, c.radius, (c.skills||[]).map(s=>[s.cd, s.cost, s.dmgMult, s.radius||s.range||0]), c.ultimate && [c.ultimate.cd, c.ultimate.dmgMult||0]]);
  }
  function skins(){
    if(typeof CROMA_SKINS==="undefined") return [];
    return Object.keys(CROMA_SKINS).filter(id=>CLASSES[CROMA_SKINS[id].champ]).map(id=>{
      const s = CROMA_SKINS[id];
      return {id, kind:"skin", champ:s.champ, champName:CLASSES[s.champ].name, name:s.name, tier:tierOf(s), tierLabel:TIERS[tierOf(s)].label,
        appearanceType:s.appearanceType||"croma", tagline:s.tagline||s.visualTheme||"", lore:s.lore||"", preview:s.preview||null,
        hasOwnAtlas:!!(s.authoredPacks && Object.keys(s.authoredPacks).length), price:s.price||0, cosmeticOnly:true};
    });
  }
  function packs(){
    const by = {}; for(const s of skins()) (by[s.champ] = by[s.champ]||[]).push(s);
    return Object.keys(by).filter(k=>by[k].length>=2).map(k=>{
      const list = by[k], sum = list.reduce((a,s)=>a+s.price,0);
      return {id:"pack_"+k, kind:"pack", champ:k, champName:list[0].champName, name:"Pack "+list[0].champName.split(",")[0], tier:"pack", tierLabel:TIERS.pack.label,
        items:list.map(s=>s.id), price:Math.round(sum*0.85), listPrice:sum, discountPct:15, preview:list[0].preview, cosmeticOnly:true, priceIsSimulated:true};
    });
  }
  function all(){ return skins().concat(packs()); }
  function find(id){ return all().find(e=>e.id===id) || null; }
  function list(f){
    f = f||{}; let out = all();
    if(f.tier) out = out.filter(e=>e.tier===f.tier);
    if(f.champ) out = out.filter(e=>e.champ===f.champ);
    if(f.owned!==undefined) out = out.filter(e=>isOwned(e.id)===f.owned);
    return out.sort((a,b)=>TIERS[a.tier].order-TIERS[b.tier].order || a.champ.localeCompare(b.champ) || a.id.localeCompare(b.id));
  }
  function preview(id){ const e = find(id); return e ? {id, name:e.name, champ:e.champ, image:e.preview, animAttrs:{"data-class-key":e.champ, "data-skin":e.kind==="skin" ? id : (e.items[0]||"")}, sandboxOnly:true} : null; }
  // Comparación lado a lado. `sameStats` DEBE ser true cuando son del mismo campeón: es el contrato anti pay-to-win.
  function compare(a, b){
    const A = find(a), B = find(b); if(!A || !B) return null;
    const sa = A.kind==="skin" ? statSeal(A.champ) : null, sb2 = B.kind==="skin" ? statSeal(B.champ) : null;
    return {a:A, b:B, differences:["name","tier","tagline","appearanceType","hasOwnAtlas","price"].filter(k=>A[k]!==B[k]), sameChampion:A.champ===B.champ,
      sameStats: sa!==null && sb2!==null && A.champ===B.champ ? sa===sb2 : null, competitiveAdvantage:false};
  }
  function isOwned(id){ const e = find(id); if(!e) return false; return e.kind==="pack" ? e.items.every(i=>!!sb.owned[i]) : !!sb.owned[id]; }
  // Compra SIMULADA: descuenta moneda de prueba del sandbox. Nunca llama a ningún sistema de pagos.
  function simulatePurchase(id){
    const e = find(id); if(!e) return {ok:false, error:"unknown_item"};
    if(isOwned(id)) return {ok:false, error:"already_owned"};
    if(sb.funds < e.price) return {ok:false, error:"insufficient_test_funds"};
    sb.funds -= e.price; for(const i of (e.kind==="pack" ? e.items : [id])) sb.owned[i] = true;
    const receipt = {simulated:true, id, price:e.price, currency:"TEST", at:sb.receipts.length};
    sb.receipts.push(receipt); persist(); return {ok:true, receipt, funds:sb.funds};
  }
  function sandboxEquip(id){
    const e = find(id); if(!e || e.kind!=="skin") return {ok:false, error:"not_a_skin"};
    if(!sb.owned[id]) return {ok:false, error:"not_owned_in_sandbox"};
    sb.equipped[e.champ] = id; persist(); return {ok:true, champ:e.champ, skin:id, statSeal:statSeal(e.champ)};
  }
  function sandboxUnequip(champ){ delete sb.equipped[champ]; persist(); return true; }
  function sandboxState(){ return JSON.parse(JSON.stringify(sb)); }
  function sandboxReset(){ sb.funds = START_FUNDS; sb.owned = {}; sb.equipped = {}; sb.receipts = []; persist(); }
  // Validación del contrato: ninguna entrada trae claves de estadística.
  function validate(){
    const bad = []; for(const e of all()) for(const k of Object.keys(e)) if(FORBIDDEN_KEYS.includes(k)) bad.push(e.id+":"+k);
    return {ok:!bad.length, bad, total:all().length};
  }
  function setCheckoutAdapter(a){ checkout = a || null; } // reservado para Economía V2: hoy no se invoca
  function hasRealCheckout(){ return !!checkout; }
  return {TIERS, list, find, preview, compare, simulatePurchase, sandboxEquip, sandboxUnequip, sandboxState, sandboxReset, validate, statSeal, setCheckoutAdapter, hasRealCheckout, isOwned};
})();
