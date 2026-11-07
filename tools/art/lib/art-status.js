'use strict';
/* tools/art/lib/art-status.js — reglas de estado del arte, compartidas por build-art-atlas.js y tests/art-runtime-clips.test.js.
   Entrada: lo que mide tools/art/lib/runtime-probe.js en el juego real (cuadros DISTINTOS por estado y dirección).

   Estados (un solo vocabulario para campeones, skins, enemigos y archivos):
     CODEX_OK          arte vigente de la generación Códice (o validado contra el Códice en docs/beta-release/AUDITORIA_ARTE_CAMPEONES.md)
                       y con todos sus ciclos animados. En archivos sueltos: cargado/referenciado por el juego.
     ARTE_VIEJO        el juego dibuja arte de una generación anterior al Códice (o procedural/prestado).
     FALTA_ANIMACION   algún clip que debería ser un ciclo sale con 1 cuadro (o, en enemigos, caminata de 2 cuadros o menos).
     HUERFANO          archivo del repo que el juego ni carga ni referencia.
   Precedencia en campeones: ARTE_VIEJO > FALTA_ANIMACION > CODEX_OK (las brechas siempre se listan aparte en `gaps`). */
const STATES = ['idle', 'walk', 'attack', 'cast', 'ultimate', 'hit', 'death'];
const DIRS = ['down', 'side', 'up', 'left'];
// Estados que DEBEN ser un ciclo (>= 2 cuadros distintos en las 4 direcciones). "hit" es una pose (1 cuadro es válido).
const CYCLE_STATES = ['idle', 'walk', 'attack', 'cast', 'ultimate', 'death'];
const MIN_FRAMES = 2;
const norm = s => String(s || '').replace(/\?.*$/, '').replace(/\.webp$/, '.png');
// {state:{dir:{frames}}} -> {state: minFrames sobre las 4 direcciones}
function minFrames(states) {
  const out = {};
  for (const st of STATES) { const d = states[st] || {}; out[st] = Math.min(...DIRS.map(k => (d[k] ? d[k].frames : 0))); }
  return out;
}
function maxFrames(states) {
  const out = {};
  for (const st of STATES) { const d = states[st] || {}; out[st] = Math.max(...DIRS.map(k => (d[k] ? d[k].frames : 0))); }
  return out;
}
function gapsOf(states) {
  const m = minFrames(states), gaps = [];
  for (const st of CYCLE_STATES) if (m[st] < MIN_FRAMES) gaps.push(st);
  return gaps;
}
// Archivos (png normalizados) que dibuja una apariencia, en todos sus estados.
function filesOf(states) {
  const set = new Set();
  for (const st of STATES) for (const k of DIRS) { const v = (states[st] || {})[k]; if (v) for (const s of v.srcs.concat(v.rawSrcs || [])) if (/^assets\//.test(s)) set.add(norm(s)); }
  return [...set].sort();
}
// Estado de un campeón. `vig` = entrada de docs/art/ATLAS_VIGENTE.json (generation: 'codex'|'audit-fiel'|'viejo').
function championStatus(gaps, vig) {
  if (vig && vig.generation === 'viejo') return 'ARTE_VIEJO';
  if (gaps.length) return 'FALTA_ANIMACION';
  return 'CODEX_OK';
}
// Estado de un enemigo/jefe. walk = cuadros de caminata distintos; kind = real|canvas|proc|shapes.
function enemyStatus(e) {
  if (e.err) return 'ARTE_VIEJO';
  if (!e.walk || e.walk.kind !== 'real' && e.idle.kind !== 'real') return 'ARTE_VIEJO';
  if (e.walk.frames <= 2) return 'FALTA_ANIMACION';
  return 'CODEX_OK';
}
module.exports = { STATES, DIRS, CYCLE_STATES, MIN_FRAMES, norm, minFrames, maxFrames, gapsOf, filesOf, championStatus, enemyStatus };
