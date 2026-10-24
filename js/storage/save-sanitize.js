"use strict";
/* ============================================================
   js/storage/save-sanitize.js
   NORMALIZADOR DEL GUARDADO AL CARGAR (llamado por _loadSaveInner en js/storage/save.js, antes de
   mezclar el JSON con defaultSave()). Cubre los tres caminos de entrada: localStorage al abrir, el
   guardado bajado de la nube y el código de guardado importado.

   Qué hace:
   - Quita claves de prototipo ("__proto__", "constructor", "prototype") en cualquier profundidad:
     Object.assign(defaultSave(), parsed) con un "__proto__" propio cambiaba el prototipo del guardado.
   - Tipos y rangos de lo numérico crítico (oro, gemas, contadores, nivel/xp/puntos de cada guardián,
     reliquias, maestrías, punto de control). NaN/Infinity/strings no numéricos/objetos -> se descarta la
     clave y vuelve el valor de fábrica (o el 0/1 mínimo). Un número finito fuera de rango se acota al
     tope (nunca se "pierde" progreso legítimo: los topes están muy por encima de cualquier economía real).
     Un string numérico bien formado ("500") se convierte, no se descarta.
   - Tipos de contenedor: lo que debe ser objeto/lista/booleano y no lo es vuelve al valor de fábrica.
   - Claves que NO conoce (flags de migraciones viejas, campos nuevos) se conservan tal cual.
   - Cada ajuste se anota con console.warn (nunca se muestra al jugador). Un guardado legítimo no genera
     ningún aviso (tools/regression/t_save_sanitize.js lo verifica con guardados reales de 3 versiones).

   LÍMITE: esto es higiene del cliente, NO anti-trampas. Quien edita su localStorage puede ponerse el oro
   y el nivel que quiera dentro de estos topes. Ver docs/security/MODELO_DE_AMENAZAS.md.

   Topes (SAVE_LIMITS): oro 1e9 · gemas 1e8 · XP de guardián 1e12 · nivel 1..99 · puntos de talento 10000 ·
   contadores 1e6 · reliquias 0..30 · objetos del inventario 5000.
   ============================================================ */
const SAVE_LIMITS = Object.freeze({
  gold: 1e9, gems: 1e8, xp: 1e12, level: 99, talentPoints: 10000, counter: 1e6, vouchers: 1000,
  relic: 30, mastery: 99, masteryXp: 1e9, itemLevel: 10, stash: 5000, keys: 5000, keyLen: 64, str: 200
});

function _ssIsObj(v){ return !!v && typeof v === "object" && !Array.isArray(v); }
function _ssHas(o, k){ return Object.prototype.hasOwnProperty.call(o, k); }

// Quita claves peligrosas en toda la estructura. Devuelve cuántas quitó.
function _ssStripProto(o, depth, note, path){
  let n = 0;
  if(!o || typeof o !== "object") return 0;
  if(depth > 24){ return 0; }
  if(Array.isArray(o)){ for(let i = 0; i < o.length; i++) n += _ssStripProto(o[i], depth + 1, note, path + "[" + i + "]"); return n; }
  for(const k of Object.keys(o)){
    if(k === "__proto__" || k === "constructor" || k === "prototype"){
      delete o[k]; n++; note(path + "." + k, "clave de prototipo quitada"); continue;
    }
    n += _ssStripProto(o[k], depth + 1, note, path + "." + k);
  }
  return n;
}

// Número acotado. Devuelve el valor saneado o undefined si hay que descartar la clave.
// kind: "int" | "float". Los strings numéricos bien formados se convierten.
function _ssNum(v, min, max, kind){
  if(typeof v === "string" && v.trim() !== "" && isFinite(Number(v))) v = Number(v);
  if(typeof v !== "number" || !isFinite(v)) return undefined;
  v = kind === "float" ? v : Math.round(v);
  return Math.max(min, Math.min(max, v));
}

function saveSanitize(parsed, ctx){
  ctx = ctx || {};
  const changes = [];
  const note = (path, why)=>{ changes.push(path + ": " + why); };
  if(!_ssIsObj(parsed)) throw new Error("guardado con forma inválida");

  _ssStripProto(parsed, 0, note, "save");

  // Aplica una regla numérica a obj[key]; ausente = no toca.
  const num = (obj, key, min, max, kind, path, fallbackDelete)=>{
    if(!_ssHas(obj, key)) return;
    const raw = obj[key], v = _ssNum(raw, min, max, kind);
    if(v === undefined){
      if(fallbackDelete === false) obj[key] = min; else delete obj[key];
      note(path + "." + key, "valor inválido (" + (typeof raw === "number" ? String(raw) : typeof raw) + ") " + (fallbackDelete === false ? "-> " + min : "descartado"));
    } else if(v !== raw){
      obj[key] = v; note(path + "." + key, "ajustado " + (typeof raw === "string" ? JSON.stringify(raw) : raw) + " -> " + v);
    }
  };
  // contenedor: objeto plano (si no, se descarta) / lista
  const objKey = (obj, key, path, allowNull)=>{
    if(!_ssHas(obj, key)) return false;
    const v = obj[key];
    if(_ssIsObj(v)) return true;
    if(allowNull && v === null) return false;
    delete obj[key]; note(path + "." + key, "debía ser un objeto (" + (Array.isArray(v) ? "lista" : typeof v) + ") -> descartado");
    return false;
  };
  const arrKey = (obj, key, path)=>{
    if(!_ssHas(obj, key)) return false;
    if(Array.isArray(obj[key])) return true;
    delete obj[key]; note(path + "." + key, "debía ser una lista -> descartado");
    return false;
  };
  // objeto {clave: valor}: limita cantidad y largo de claves; cada valor pasa por fn (devuelve undefined = quitar)
  const mapOf = (obj, key, path, fn)=>{
    if(!objKey(obj, key, path)) return;
    const m = obj[key], ks = Object.keys(m);
    if(ks.length > SAVE_LIMITS.keys){ for(const k of ks.slice(SAVE_LIMITS.keys)){ delete m[k]; } note(path + "." + key, "demasiadas claves (" + ks.length + ") -> recortado"); }
    for(const k of Object.keys(m)){
      if(k.length > SAVE_LIMITS.keyLen){ delete m[k]; note(path + "." + key, "clave demasiado larga quitada"); continue; }
      const nv = fn(m[k]);
      if(nv === undefined){ delete m[k]; note(path + "." + key + "." + k.slice(0, 24), "valor inválido quitado"); }
      else m[k] = nv;
    }
  };
  const flag = v => (v === true || v === false) ? v : (v === 1 || v === 0) ? !!v : undefined;
  const counter = (max)=> v => _ssNum(v, 0, max, "int");

  /* ---------- raíz: numéricos críticos ---------- */
  num(parsed, "gold", 0, SAVE_LIMITS.gold, "int", "save");
  num(parsed, "gems", 0, SAVE_LIMITS.gems, "int", "save");
  num(parsed, "defeatCount", 0, SAVE_LIMITS.counter, "int", "save");
  num(parsed, "defeatLegacy", 0, SAVE_LIMITS.counter, "int", "save");
  num(parsed, "skinVoucher", 0, SAVE_LIMITS.vouchers, "int", "save");
  num(parsed, "recycleDust", 0, 0.99, "float", "save");
  num(parsed, "itemSchemaV", 0, 100, "int", "save");

  /* ---------- raíz: banderas (las que la fábrica define como booleanas) ---------- */
  const defs = ctx.defaults && _ssIsObj(ctx.defaults) ? ctx.defaults : {};
  for(const k of Object.keys(defs)){
    if(typeof defs[k] !== "boolean" || !_ssHas(parsed, k)) continue;
    const f = flag(parsed[k]);
    if(f === undefined){ delete parsed[k]; note("save." + k, "debía ser booleano -> descartado"); }
    else parsed[k] = f;
  }
  // strings cortos opcionales
  for(const k of ["firstRun", "starterSkin", "lastChamp", "diffSelected"]){
    if(_ssHas(parsed, k) && parsed[k] !== null && (typeof parsed[k] !== "string" || parsed[k].length > SAVE_LIMITS.keyLen)){
      delete parsed[k]; note("save." + k, "debía ser texto corto -> descartado");
    }
  }

  /* ---------- raíz: contenedores ---------- */
  for(const k of ["champions", "arenasCleared", "relics", "lootPity", "crystals", "cromas", "collection", "codex", "diffCleared",
                  "arenaDefeats", "penaltyWarned", "checkpoints", "codexBook"]) objKey(parsed, k, "save");
  for(const k of ["shop", "quests", "endless"]) objKey(parsed, k, "save", true);
  arrKey(parsed, "stash", "save"); arrKey(parsed, "legacyOpenArenas", "save");

  mapOf(parsed, "arenasCleared", "save", flag);
  mapOf(parsed, "crystals", "save", flag);
  mapOf(parsed, "cromas", "save", flag);
  mapOf(parsed, "penaltyWarned", "save", flag);
  mapOf(parsed, "arenaDefeats", "save", counter(SAVE_LIMITS.counter));
  if(_ssIsObj(parsed.relics)) for(const k of Object.keys(parsed.relics)) num(parsed.relics, k, 0, SAVE_LIMITS.relic, "int", "save.relics");
  if(_ssIsObj(parsed.lootPity)) for(const k of Object.keys(parsed.lootPity)) num(parsed.lootPity, k, 0, SAVE_LIMITS.counter, "int", "save.lootPity");
  if(_ssIsObj(parsed.diffCleared)){
    for(const d of ["pesadilla", "infierno"]){
      if(_ssHas(parsed.diffCleared, d)){ if(objKey(parsed.diffCleared, d, "save.diffCleared")) mapOf(parsed.diffCleared, d, "save.diffCleared", flag); }
    }
  }
  if(Array.isArray(parsed.legacyOpenArenas)){
    const before = parsed.legacyOpenArenas.length;
    parsed.legacyOpenArenas = parsed.legacyOpenArenas.filter(a => typeof a === "string" && a.length <= SAVE_LIMITS.keyLen).slice(0, 64);
    if(parsed.legacyOpenArenas.length !== before) note("save.legacyOpenArenas", "entradas inválidas quitadas");
  }

  /* ---------- punto de control (checkpoint.js) ---------- */
  if(_ssIsObj(parsed.checkpoints)){
    const arenas = Array.isArray(ctx.arenaKeys) ? ctx.arenaKeys : null;
    const champs = _ssIsObj(parsed.champions) ? parsed.champions : {};
    for(const a of Object.keys(parsed.checkpoints)){
      const c = parsed.checkpoints[a], p = "save.checkpoints." + a.slice(0, 24);
      if(!_ssIsObj(c) || a.length > SAVE_LIMITS.keyLen || (arenas && !arenas.includes(a)) || typeof c.champ !== "string" || (!_ssHas(champs, c.champ) && !(ctx.championKeys && ctx.championKeys.includes(c.champ)))){
        delete parsed.checkpoints[a]; note(p, "punto de control inválido -> descartado"); continue;
      }
      num(c, "xp", 0, SAVE_LIMITS.xp, "int", p, false);
      num(c, "gold", 0, SAVE_LIMITS.gold, "int", p, false);
      num(c, "uses", 0, 3, "int", p, false);
      num(c, "level", 1, SAVE_LIMITS.level, "int", p, false);
    }
  }

  /* ---------- Libro de la Horda ---------- */
  if(_ssIsObj(parsed.codexBook)){
    const cb = parsed.codexBook;
    num(cb, "introAt", 0, 8.64e15, "int", "save.codexBook", false);
    for(const k of ["introSeen", "introRead", "ran", "offered", "shortOff"]){
      if(_ssHas(cb, k)){ const f = flag(cb[k]); if(f === undefined){ cb[k] = false; note("save.codexBook." + k, "debía ser booleano -> false"); } else cb[k] = f; }
    }
    mapOf(cb, "frag", "save.codexBook", v => { const f = flag(v); return f === undefined ? _ssNum(v, 0, SAVE_LIMITS.counter, "int") : v; });
    mapOf(cb, "shortCount", "save.codexBook", counter(SAVE_LIMITS.counter));
  }

  /* ---------- guardianes ---------- */
  if(_ssIsObj(parsed.champions)){
    for(const id of Object.keys(parsed.champions)){
      const c = parsed.champions[id], p = "save.champions." + id.slice(0, 24);
      if(!_ssIsObj(c) || id.length > SAVE_LIMITS.keyLen){ delete parsed.champions[id]; note(p, "guardián inválido -> descartado"); continue; }
      num(c, "level", 1, SAVE_LIMITS.level, "int", p, false);
      num(c, "xp", 0, SAVE_LIMITS.xp, "int", p, false);
      num(c, "talentPoints", 0, SAVE_LIMITS.talentPoints, "int", p, false);
      num(c, "treeBonus", 0, SAVE_LIMITS.talentPoints, "int", p, false);
      if(_ssHas(c, "unlocked")){ const f = flag(c.unlocked); if(f === undefined){ delete c.unlocked; note(p + ".unlocked", "debía ser booleano -> descartado"); } else c.unlocked = f; }
      if(_ssHas(c, "croma") && c.croma !== null && (typeof c.croma !== "string" || c.croma.length > SAVE_LIMITS.keyLen)){ c.croma = null; note(p + ".croma", "inválida -> null"); }
      const mast = (m, mp)=>{
        if(!_ssIsObj(m)) return false;
        num(m, "useXp", 0, SAVE_LIMITS.masteryXp, "int", mp, false);
        num(m, "useLvl", 1, SAVE_LIMITS.mastery, "int", mp, false);
        num(m, "alloc", 0, SAVE_LIMITS.mastery, "int", mp, false);
        return true;
      };
      if(_ssHas(c, "skillMastery")){
        if(!Array.isArray(c.skillMastery)){ delete c.skillMastery; note(p + ".skillMastery", "debía ser una lista -> descartado"); }
        else { c.skillMastery = c.skillMastery.slice(0, 3); c.skillMastery.forEach((m, i)=>{ if(!mast(m, p + ".skillMastery[" + i + "]")){ c.skillMastery[i] = {}; note(p + ".skillMastery[" + i + "]", "inválida -> de fábrica"); } }); }
      }
      if(_ssHas(c, "ultMastery") && !mast(c.ultMastery, p + ".ultMastery")){ delete c.ultMastery; note(p + ".ultMastery", "debía ser un objeto -> descartado"); }
      if(_ssHas(c, "equipment")){
        if(!_ssIsObj(c.equipment)){ delete c.equipment; note(p + ".equipment", "debía ser un objeto -> descartado"); }
        else for(const s of Object.keys(c.equipment)) if(c.equipment[s] !== null && typeof c.equipment[s] !== "string"){ c.equipment[s] = null; note(p + ".equipment." + s.slice(0, 16), "uid inválido -> vacío"); }
      }
      if(_ssHas(c, "talents")){
        if(!_ssIsObj(c.talents)){ delete c.talents; note(p + ".talents", "debía ser un objeto -> descartado"); }
        else {
          for(const t of ["nodes", "picks", "masteryNodes"]) objKey(c.talents, t, p + ".talents");
          if(_ssHas(c.talents, "mastery") && c.talents.mastery !== null && typeof c.talents.mastery !== "string" && !_ssIsObj(c.talents.mastery)){ c.talents.mastery = null; note(p + ".talents.mastery", "inválida -> null"); }
        }
      }
      // inventario viejo por guardián (antes de stashV1): lista de objetos
      if(_ssHas(c, "inventory") && !Array.isArray(c.inventory)){ delete c.inventory; note(p + ".inventory", "debía ser una lista -> descartado"); }
    }
  }

  /* ---------- objetos del inventario de la cuenta (y el viejo por guardián) ---------- */
  const cleanItems = (list, path)=>{
    if(list.length > SAVE_LIMITS.stash){ list.length = SAVE_LIMITS.stash; note(path, "demasiados objetos -> recortado"); }
    const out = [];
    for(let i = 0; i < list.length; i++){
      const it = list[i];
      if(!_ssIsObj(it) || typeof it.uid !== "string" || !it.uid || it.uid.length > SAVE_LIMITS.keyLen){ note(path + "[" + i + "]", "objeto inválido quitado"); continue; }
      let bad = false;
      for(const k of ["value", "roll"]) if(_ssHas(it, k) && !(typeof it[k] === "number" && isFinite(it[k]))) bad = true;
      if(bad){ note(path + "[" + i + "]", "objeto con números inválidos quitado"); continue; }
      if(_ssHas(it, "level")){
        const lv = _ssNum(it.level, 1, SAVE_LIMITS.itemLevel, "int");
        if(lv === undefined){ it.level = 1; note(path + "[" + i + "].level", "inválido -> 1"); } else it.level = lv;
      }
      for(const k of ["name", "desc", "noun", "baseName", "icon"]) if(_ssHas(it, k)){
        if(typeof it[k] !== "string"){ delete it[k]; note(path + "[" + i + "]." + k, "no era texto -> descartado"); }
        // los nombres se dibujan con innerHTML en varias pantallas: ningún texto legítimo lleva < ni > (net-trade.js hace lo mismo con lo que llega por la red)
        else if(/[<>]/.test(it[k]) || it[k].length > 300){ it[k] = it[k].replace(/[<>]/g, "").slice(0, 300); note(path + "[" + i + "]." + k, "texto con < > o demasiado largo -> limpiado"); }
      }
      out.push(it);
    }
    return out;
  };
  // Preserve valid legacy overflow before the stash safety limit, rather than truncating earned loot.
  if(!Array.isArray(parsed.rewardOverflow)) parsed.rewardOverflow=[];
  if(Array.isArray(parsed.stash) && parsed.stash.length>SAVE_LIMITS.stash){
    const excess=parsed.stash.splice(SAVE_LIMITS.stash);
    for(let i=0;i<excess.length;i+=100)parsed.rewardOverflow.push(excess.slice(i,i+100));
  }
  parsed.rewardOverflow=parsed.rewardOverflow.filter(Array.isArray).flatMap((chunk)=>{
    const out=[];for(let i=0;i<chunk.length;i+=100)out.push(cleanItems(chunk.slice(i,i+100),"save.rewardOverflow"));return out;
  }).filter(c=>c.length);
  if(Array.isArray(parsed.stash)) parsed.stash = cleanItems(parsed.stash, "save.stash");
  if(_ssIsObj(parsed.champions)) for(const id of Object.keys(parsed.champions)){
    const c = parsed.champions[id]; if(Array.isArray(c.inventory)) c.inventory = cleanItems(c.inventory, "save.champions." + id.slice(0, 24) + ".inventory");
  }

  if(changes.length){
    try{ console.warn("[save-sanitize] " + changes.length + " ajuste(s) al cargar el guardado:\n  " + changes.slice(0, 40).join("\n  ") + (changes.length > 40 ? "\n  … (+" + (changes.length - 40) + ")" : "")); }catch(e){}
  }
  return {count: changes.length, changes};
}
