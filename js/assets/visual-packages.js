"use strict";
/* ============================================================
   js/assets/visual-packages.js — enlace de runtime del contrato VisualPackage v1
   (tools/visual-package/, assets/visual-packages/). Un paquete visual CANDIDATO (candidates.v1.json) solo
   reemplaza al integrado si: activation.enabled, aprobación visual 'approved' y validación técnica 'pass'.
   Antes de reemplazar se precarga aparte y se comprueba que el PNG tenga las dimensiones declaradas; si falla,
   el arte integrado (respaldo) se queda y el motivo queda en VisualPackages.log (no se esconde el error).
   Solo cambia el atlas/meta de CHAMP_PACK[key]: combate, balance, colisiones, progreso y red no se tocan.
   ============================================================ */
(function(root){
  const VP = root.VisualPackages = {log: [], active: {}, candidates: []};
  function note(kind, id, detail){ VP.log.push({kind: kind, id: id, detail: detail || null}); if(root.console && kind !== "info") console.warn("[VisualPackages]", kind, id, detail || ""); }
  function metaOf(c){
    const m = {w: c.grid.frameWidth, h: c.grid.frameHeight, cols: c.grid.cols, refH: c.scale.referenceHeight, anchor: c.pivot.anchor, sets: c.states};
    if(c.mirror) m.fix = c.mirror;
    if(c.pivot.footX) m.footX = c.pivot.footX;
    return m;
  }
  function eligible(c){
    return !!(c && c.activation && c.activation.enabled === true && c.lifecycle &&
      c.lifecycle.visualApproval === "approved" && c.lifecycle.technicalValidation === "pass" && c.fallback);
  }
  function apply(c){
    const key = c.fallback, base = root.CHAMP_PACK && root.CHAMP_PACK[key];
    if(!base){ note("fallback", c.id, "no existe el paquete integrado " + key); return; }
    const probe = new root.Image();
    probe.onload = function(){
      if(probe.naturalWidth !== c.atlas.width || probe.naturalHeight !== c.atlas.height){
        note("fallback", c.id, "dimensiones " + probe.naturalWidth + "x" + probe.naturalHeight + " != " + c.atlas.width + "x" + c.atlas.height); return;
      }
      root.champPackLoadAtlas(key, c.atlas.path, metaOf(c));
      VP.active[key] = {candidate: c.id, packageVersion: c.packageVersion, fallbackPack: base};
      note("info", c.id, "candidato activo sobre " + key);
    };
    probe.onerror = function(){ note("fallback", c.id, "no se pudo cargar " + c.atlas.path); };
    probe.src = c.atlas.path;
  }
  VP.apply = function(list){
    VP.candidates = list || [];
    for(const c of VP.candidates){
      if(!eligible(c)){ note("info", c.id, "candidato no elegible (sin activar/aprobar): se usa el integrado"); continue; }
      apply(c);
    }
  };
  VP.report = function(){ return {active: Object.keys(VP.active).map(function(k){ return {key: k, candidate: VP.active[k].candidate, version: VP.active[k].packageVersion}; }), log: VP.log.slice()}; };
  if(root.fetch && root.location && root.location.protocol !== "file:"){
    root.fetch("assets/visual-packages/candidates.v1.json", {cache: "no-cache"}).then(function(r){ return r.ok ? r.json() : null; })
      .then(function(j){ if(j && Array.isArray(j.packages)) VP.apply(j.packages); }).catch(function(e){ note("info", "-", "sin manifiesto de candidatos: " + e.message); });
  }
  if(typeof module !== "undefined") module.exports = VP;
})(typeof window !== "undefined" ? window : globalThis);
