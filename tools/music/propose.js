#!/usr/bin/env node
'use strict';
// Propone asignaciones estado/arena -> pistas a partir de las MEDIDAS (library-analysis.json) y de las etiquetas.
// Es una propuesta automática: el estado queda 'proposed' hasta que una persona la escuche en contexto y la apruebe
// en docs/audio/assignment-review.v1.json (ver tools/music/build-runtime.js). El motor solo reproduce lo aprobado.
//   node tools/music/propose.js
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ROOT = path.resolve(__dirname, '../..');
const cat = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/audio/library-catalog.json'), 'utf8'));
const ana = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/audio/library-analysis.json'), 'utf8')).tracks;

// Estados y arenas REALES del motor (se leen de js/audio/audio.js, no se inventan).
function engineSlots() {
  const src = fs.readFileSync(path.join(ROOT, 'js/audio/audio.js'), 'utf8');
  const modes = Object.keys(eval('(' + src.match(/const MUSIC_MODES = (\{[^}]*\})/)[1] + ')'));
  const block = src.slice(src.indexOf('const MUSIC_ARENAS = {'));
  const arenas = [...block.slice(0, block.indexOf('\n};')).matchAll(/^  ([a-z_]+):\s*\{/gm)].map(m => m[1]).filter(a => a !== '_');
  return {modes, arenas};
}
// Perfil objetivo: intensidad 0..1 (percentil), brillo 0..1 (percentil), si necesita bucle limpio.
const MODE_PROFILE = {
  title:   {int: 0.35, bright: 0.5, loop: true,  note: 'obertura, espaciosa'},
  menu:    {int: 0.25, bright: 0.55, loop: true, note: 'tranquila, no cansa en pantallas largas'},
  prelude: {int: 0.4,  bright: 0.25, loop: true, note: 'tensión previa al jefe, oscura'},
  wave:    {int: 0.6,  bright: 0.5, loop: true,  note: 'acción sostenida que no tape las señales'},
  boss:    {int: 0.92, bright: 0.6, loop: true,  note: 'máxima intensidad'},
  victory: {int: 0.6,  bright: 0.8, loop: false, note: 'cierre triunfal (puede terminar en fade-out)'},
  defeat:  {int: 0.2,  bright: 0.1, loop: false, note: 'cierre grave (puede terminar en fade-out)'}
};
const ARENA_WORDS = {
  bosque: ['forest', 'nature', 'flute', 'celtic', 'elf', 'woods'], hielo: ['ice', 'snow', 'cold', 'winter', 'frozen', 'frost'],
  acuatica: ['water', 'underwater', 'ocean', 'sea', 'aquatic'], laberinto: ['labyrinth', 'maze', 'puzzle', 'mystery'],
  abismo: ['abyss', 'dark', 'void', 'horror', 'ominous'], minas: ['mine', 'cave', 'underground', 'dwarf'],
  infernal: ['hell', 'fire', 'demon', 'lava', 'infernal'], fortaleza: ['factory', 'industrial', 'steampunk', 'machine', 'forge', 'fortress'],
  micelial: ['fungus', 'swamp', 'organic', 'eerie', 'spore'], ciudad: ['city', 'town', 'medieval', 'cursed', 'bell', 'village']
};
const ARENA_FEEL = { // sesgo de carácter por arena (de los comentarios de MUSIC_ARENAS)
  ciudad: {int: 0, bright: -0.05}, fortaleza: {int: 0.1, bright: 0.15}, bosque: {int: -0.05, bright: 0.1}, micelial: {int: -0.1, bright: -0.3},
  hielo: {int: -0.1, bright: 0.3}, acuatica: {int: -0.15, bright: 0.1}, laberinto: {int: 0, bright: 0.05}, abismo: {int: -0.05, bright: -0.35},
  minas: {int: 0.05, bright: -0.25}, infernal: {int: 0.2, bright: 0.2}
};
const MIN_SCORE = -0.3;
// Léxico de intención e instrumentación (de etiquetas y título). Las medidas no distinguen un tema de combate de uno
// apacible con la misma energía, ni un chiptune de una orquesta: el motor es orquestal/sintético-acústico (flauta, metales, coro).
const BATTLE = /\b(boss|battle|fight|combat|war|attack|action|pursuit|rush|epic|chase|duel)\b/, CALM = /\b(peaceful|ambience|ambient|calm|relax|lullab|sleep|meditat|serene|gentle)\b/;
const CHIP = /\b(8-?bit|chiptune|chip|retro|nes|gameboy|arcade|bleep)\b/, WIN = /\b(victory|win|triumph|fanfare|success|complete|fin|end)\b/;
function intent(x, mode, arena) {
  let adj = 0;
  const calmSlot = /^(title|menu|prelude|defeat)$/.test(mode), hotSlot = /^(boss)$/.test(mode) || (mode === 'wave' && !/^(hielo|acuatica|micelial|abismo)$/.test(arena || ''));
  if (calmSlot && BATTLE.test(x.words)) adj -= 0.5;
  if (hotSlot && CALM.test(x.words)) adj -= 0.5;
  if (mode === 'victory' && WIN.test(x.words)) adj += 0.2;
  if (CHIP.test(x.words)) adj -= 0.25; // identidad orquestal del motor
  return adj;
}
const rankOf = (vals, v) => vals.filter(x => x <= v).length / vals.length;
function build() {
  const ids = cat.tracks.filter(t => ana[t.sha256] && !ana[t.sha256].error);
  const all = ids.map(t => ({t, a: ana[t.sha256]}));
  const comp = x => 0.4 * x.a.onsetsPerSec / 6 + 0.35 * x.a.rmsMean / 0.3 + 0.25 * (x.a.tempoBPM - 60) / 120;
  const ints = all.map(comp).sort((p, q) => p - q), brs = all.map(x => x.a.centroidHz).sort((p, q) => p - q);
  for (const x of all) { x.int = rankOf(ints, comp(x)); x.bright = rankOf(brs, x.a.centroidHz); x.words = (x.t.tags.join(' ') + ' ' + x.t.title + ' ' + x.t.slug).toLowerCase();
    x.loopOK = !x.a.loop.fadesOut && !x.a.loop.fadesIn && x.a.loop.headTailSimilarity >= 0.6 && x.a.durationSec >= 30;
    x.clipping = x.a.truePeakDBTP !== null && x.a.truePeakDBTP > -0.1; }
  const {modes, arenas} = engineSlots();
  const slots = [];
  const pick = (key, prof, arena, n) => {
    prof = Object.assign({}, prof, {mode: key.split('@')[0]});
    const words = (ARENA_WORDS[arena] || []);
    const scored = all.filter(x => prof.loop ? x.loopOK : true).map(x => {
      const ti = Math.min(1, Math.max(0, prof.int + (ARENA_FEEL[arena] ? ARENA_FEEL[arena].int : 0))), tb = Math.min(1, Math.max(0, prof.bright + (ARENA_FEEL[arena] ? ARENA_FEEL[arena].bright : 0)));
      const dist = Math.abs(x.int - ti) * 1.0 + Math.abs(x.bright - tb) * 0.6;
      const hit = words.filter(w => x.words.includes(w));
      const fadeBonus = !prof.loop && x.a.loop.fadesOut ? 0.25 : 0; // cierres: el fade-out es una virtud
      const shortBonus = !prof.loop && x.a.durationSec <= 90 ? 0.15 : 0;
      return {x, score: -dist + hit.length * 0.35 + fadeBonus + shortBonus + intent(x, prof.mode, arena) - (x.clipping ? 0.1 : 0), hit};
    }).filter(s => s.score >= MIN_SCORE).sort((p, q) => q.score - p.score).slice(0, n); // sin pista adecuada: se queda la música procedural
    return scored.map(s => ({trackId: s.x.t.sha256, slug: s.x.t.slug, score: +s.score.toFixed(3),
      rationale: `intensidad p${Math.round(s.x.int * 100)} (objetivo ${Math.round(prof.int * 100)}), brillo p${Math.round(s.x.bright * 100)}, ${s.x.a.tempoBPM} BPM, ${s.x.a.centroidHz} Hz de centroide, ` +
        `${s.x.a.loop.fadesOut ? 'termina en fade-out' : s.x.loopOK ? 'bucle limpio (similitud ' + s.x.a.loop.headTailSimilarity + ')' : 'bucle no verificado'}` + (s.hit.length ? `; etiquetas de arena: ${s.hit.join(', ')}` : '') + `. ${prof.note}.`}));
  };
  for (const m of modes) {
    if (!MODE_PROFILE[m]) continue; // intro (vals del Hechicero) y off: identidad procedural, no se reemplazan
    const targets = (m === 'wave' || m === 'boss') ? [[m, null, 2]].concat(arenas.map(a => [m + '@' + a, a, 2])) : [[m, null, 2]];
    for (const [key, arena, n] of targets) slots.push({slot: key, mode: m, arena, candidates: pick(key, MODE_PROFILE[m], arena, n), status: 'proposed'});
  }
  return {contract: 'MusicAssignmentProposals', version: 1, generated: new Date().toISOString().slice(0, 10),
    note: 'Propuesta por medidas y etiquetas. NO escuchada: requiere aprobación humana en docs/audio/assignment-review.v1.json. intro (Hechicero) queda procedural a propósito.',
    libraryTracks: all.length, loopCapable: all.filter(x => x.loopOK).length, slots};
}
module.exports = {build, engineSlots};
if (require.main === module) {
  const p = build(); fs.writeFileSync(path.join(ROOT, 'docs/audio/assignment-proposals.v1.json'), JSON.stringify(p, null, 1) + '\n');
  console.log(JSON.stringify({slots: p.slots.length, withCandidates: p.slots.filter(s => s.candidates.length).length, libraryTracks: p.libraryTracks, loopCapable: p.loopCapable}));
}
