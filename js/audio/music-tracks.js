"use strict";
/* ============================================================
   js/audio/music-tracks.js — capa de PISTAS DE ARCHIVO sobre el secuenciador procedural (audio.js).
   - Solo reproduce pistas APROBADAS: assets/audio/music/assignments.v1.json (lo genera tools/music/build-runtime.js
     a partir de docs/audio/assignment-review.v1.json). Sin manifiesto o sin pista para ese modo/arena => suena la
     música procedural de siempre (no cambia nada).
   - Una pista por vez: entra por el bus que audio.js ya cruza (dry), así hereda volumen de música, mute, pausa,
     ducking por densidad de efectos y el fundido entre modos. Carga bajo demanda (<audio> en streaming, sin decodificar
     el archivo entero), se libera al terminar el fundido y no hay más de un reproductor activo (+ el que se despide).
   - Rotación determinista por ranura (sin azar: no toca el RNG del juego) que no repite la misma pista dos veces seguidas.
   - Si el archivo falla o el navegador bloquea la reproducción, el procedural toma la música y queda en MusicTracks.log.
   ============================================================ */
(function(root){
  const MT = root.MusicTracks = {manifest: null, log: [], stats: {created: 0, disposed: 0, active: 0}, current: null, last: {}, turn: {}};
  const ONE_SHOT = {victory: 1, defeat: 1};
  function note(kind, id, detail){ MT.log.push({kind: kind, id: id, detail: detail || null}); if(kind === "error" && root.console) console.warn("[MusicTracks]", id, detail || ""); }
  MT.configure = function(m){ MT.manifest = (m && m.tracks && m.slots) ? m : null; };
  MT.load = function(url){
    if(!root.fetch || (root.location && root.location.protocol === "file:")) return Promise.resolve(null);
    return root.fetch(url || "assets/audio/music/assignments.v1.json", {cache: "no-cache"}).then(function(r){ return r.ok ? r.json() : null; })
      .then(function(j){ MT.configure(j); return MT.manifest; }).catch(function(e){ note("info", "-", "sin manifiesto de pistas: " + e.message); return null; });
  };
  MT.candidates = function(mode, arena){
    const m = MT.manifest; if(!m) return [];
    return (m.slots[mode + "@" + arena] || m.slots[mode] || []).filter(function(id){ return !!m.tracks[id]; });
  };
  function choose(slotKey, list){
    if(list.length < 2) return list[0];
    let i = (MT.turn[slotKey] = ((MT.turn[slotKey] === undefined ? -1 : MT.turn[slotKey]) + 1) % list.length);
    if(list[i] === MT.last[slotKey]) i = MT.turn[slotKey] = (i + 1) % list.length; // nunca la misma dos veces seguidas
    return list[i];
  }
  function dispose(h){
    if(!h || h.disposed) return; h.disposed = true; h.alive = false;
    try{ h.el.pause(); h.el.removeAttribute("src"); h.el.load(); }catch(e){}
    try{ h.src.disconnect(); h.gain.disconnect(); }catch(e){}
    MT.stats.disposed++; MT.stats.active--;
  }
  MT.dispose = dispose;
  // audio.js lo llama al empezar una pieza (modo+arena). Devuelve el reproductor vigente o null (=> procedural).
  MT.onSwitch = function(mode, arena, destNode, t, fadeIn){
    const prev = MT.current; MT.current = null;
    if(prev){ const old = prev; setTimeout(function(){ dispose(old); }, 4500); } // deja terminar el fundido de salida del otro bus
    const cands = MT.candidates(mode, arena); if(!cands.length) return null;
    const ctx = destNode.context, slotKey = mode + "@" + (MT.manifest.slots[mode + "@" + arena] ? arena : "*"), id = choose(slotKey, cands), tr = MT.manifest.tracks[id];
    MT.last[slotKey] = id;
    let el, src, gain;
    try{
      el = new root.Audio(); el.preload = "auto"; el.loop = !ONE_SHOT[mode]; el.src = tr.file;
      src = ctx.createMediaElementSource(el); gain = ctx.createGain(); gain.gain.value = Math.pow(10, (tr.gainDb || 0) / 20);
      src.connect(gain); gain.connect(destNode);
    }catch(e){ note("error", id, "no se pudo crear el reproductor: " + e.message); return null; }
    const h = {id: id, mode: mode, arena: arena, el: el, src: src, gain: gain, alive: true, disposed: false, oneShot: !!ONE_SHOT[mode]};
    MT.stats.created++; MT.stats.active++; MT.current = h;
    el.addEventListener("error", function(){ h.alive = false; note("error", id, "error de carga/decodificación: " + tr.file); });
    el.addEventListener("ended", function(){ if(h.oneShot) h.done = true; });
    const go = function(){ const p = el.play(); if(p && p.catch) p.catch(function(e){ h.alive = false; note("error", id, "reproducción bloqueada: " + e.message); }); };
    go();
    return h;
  };
  // Segundo plano: la pista se pausa con la pestaña (audio.js suspende el contexto) y vuelve al regresar.
  MT.onVisibility = function(hidden){
    const h = MT.current; if(!h || h.disposed) return;
    try{ if(hidden) h.el.pause(); else if(!h.done) h.el.play().catch(function(){}); }catch(e){}
  };
  if(root.document) root.document.addEventListener("visibilitychange", function(){ MT.onVisibility(root.document.hidden); });
  MT.load();
  if(typeof module !== "undefined") module.exports = MT;
})(typeof window !== "undefined" ? window : globalThis);
