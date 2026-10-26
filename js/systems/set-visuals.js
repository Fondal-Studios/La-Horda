"use strict";
/* ============================================================
   js/systems/set-visuals.js
   EFECTOS VISUALES DE SET (modelo B, docs/economy/BRASAS_REDEFINICION.md).
   Los sets dan bono de estadísticas + estos efectos (partículas y color de aura); la SKIN es premium aparte.
   Solo cosmético: no toca estadísticas. Respeta "Reducir efectos" (JUICE.reduceFx).
   Intensidad por piezas: 2 = chispas leves, 3-4 = más densas, set completo = ráfaga plena.
   ============================================================ */
function setVisualDominant(h){
  const c = typeof heroSetCounts === "function" ? heroSetCounts(h) : null;
  if(!c) return null;
  let best = null, bn = 0;
  for(const id in c){ if(c[id] >= 2 && c[id] > bn && SET_DB[id]){ best = id; bn = c[id]; } }
  return best ? {id:best, n:bn, full:bn >= setFullCount(best), rgb:SET_DB[best].aura || "200,200,255"} : null;
}
function setVisualBlurb(setId){
  const S = SET_DB[setId]; if(!S) return "";
  return "Efecto visual del set: aura y partículas de color (2 piezas leve, set completo plena). No cambia estadísticas.";
}
function updateSetVisuals(h, dt){
  if(!h || !h.alive || typeof particles === "undefined") return;
  if(typeof JUICE !== "undefined" && JUICE.reduceFx) return;
  const v = setVisualDominant(h); if(!v) return;
  const rate = (v.full ? 0.14 : v.n >= 3 ? 0.07 : 0.035) * (dt / 16.7);
  if(Math.random() >= rate) return;
  particles.push({x:h.x + (Math.random()-0.5)*26, y:h.y - 4 - Math.random()*18, vx:(Math.random()-0.5)*12, vy:-22 - Math.random()*14, life:520, color:"rgb(" + v.rgb + ")"});
}

/* ---- Tinte de habilidades por SET equipado ----
   Misma mecánica que la skin (skin-fx.js: SKIN_TINT + _skinFxRecolor): solo cambia el COLOR de lo que el lanzamiento dibuja
   (partículas, proyectiles, ráfagas y ondas del VFX central). No cambia daño, radios, duración ni premarcado, y no agrega sprites.
   Si el héroe tiene una skin con efectos propios, manda la skin (skinFxOf). Con "Reducir efectos" o poca carga de VFX no tiñe.
   Debe cargar DESPUÉS de skin-fx.js (envuelve sus envoltorios) para que el color viaje en los argumentos a los invitados. */
function setVisualTintHex(h){
  if(typeof JUICE !== "undefined" && JUICE.reduceFx) return null;
  if(typeof vfxLoad === "number" && vfxLoad < .6) return null;
  const v = setVisualDominant(h); if(!v) return null;
  const c = String(v.rgb).split(",").map(n=>Math.max(0, Math.min(255, parseInt(n, 10) || 0)));
  return "#" + c.map(n=>n.toString(16).padStart(2, "0")).join("");
}
function _setVisualNoSkinFx(h){ return typeof skinFxOf !== "function" || !skinFxOf(h); }
(function(){
  if(typeof window.castAbility !== "function" || typeof window.triggerBasic !== "function" || typeof _skinFxSnap !== "function") return;
  const cast = window.castAbility, basic = window.triggerBasic;
  function run(h, fn, args){
    const tint = h && h.alive !== false && _setVisualNoSkinFx(h) ? setVisualTintHex(h) : null;
    if(!tint) return fn.apply(null, args);
    const snap = _skinFxSnap(), prev = SKIN_TINT;
    SKIN_TINT = tint;
    try{ return fn.apply(null, args); }
    finally{ SKIN_TINT = prev; try{ _skinFxRecolor(snap, h, tint); }catch(e){} }
  }
  window.castAbility = function(caster){ return run(caster, cast, arguments); };
  window.triggerBasic = function(caster){ return run(caster || player, basic, arguments); };
})();
