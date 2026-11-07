#!/usr/bin/env node
'use strict';
// Construye lo que se DISTRIBUYE con el juego a partir de las asignaciones APROBADAS por una persona
// (docs/audio/assignment-review.v1.json): transcodifica a Ogg Vorbis normalizado a -20 LUFS, respeta el presupuesto de
// tamaño, escribe assets/audio/music/assignments.v1.json (lo que lee el motor) y los créditos (legal/MUSIC_CREDITS.md).
// Los originales NO van a Git: se recuperan con `node tools/music/ingest.js fetch` (ficha + sha256 en library-catalog.json).
//   node tools/music/build-runtime.js [--check]
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), {spawnSync} = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const CAT = 'docs/audio/library-catalog.json', ANA = 'docs/audio/library-analysis.json', REV = 'docs/audio/assignment-review.v1.json';
const OUT = path.join(ROOT, 'assets/audio/music'), TARGET_LUFS = -20, MAX_FILE = 2.5 * 1048576, MAX_TOTAL = 24 * 1048576;
const LOOP_SLOTS = m => !/^(victory|defeat)/.test(m);
function build(inject = {}) {
  const cat = inject.cat || read(CAT), ana = inject.ana || read(ANA).tracks, rev = inject.rev || (fs.existsSync(path.join(ROOT, REV)) ? read(REV) : {approvals: {}});
  const byId = new Map(cat.tracks.map(t => [t.sha256, t])), errors = [], tracks = {}, slots = {}; let total = 0;
  for (const [slot, ap] of Object.entries(rev.approvals)) {
    if (!ap.reviewer || !ap.method || !ap.date || !Array.isArray(ap.approved)) { errors.push(`${slot}: falta reviewer/method/date/approved`); continue; }
    if (!/^(listened-in-context|listened-isolated)$/.test(ap.method)) { errors.push(`${slot}: method debe ser listened-in-context|listened-isolated (aprobación por escucha humana)`); continue; }
    for (const id of ap.approved) {
      const t = byId.get(id), a = ana[id]; if (!t || !a || a.error) { errors.push(`${slot}: pista ${id} inexistente o sin análisis`); continue; }
      const mode = slot.split('@')[0];
      if (LOOP_SLOTS(mode) && (a.loop.fadesOut || a.loop.fadesIn || a.loop.headTailSimilarity < 0.6) && !ap.acceptLoopRisk) { errors.push(`${slot}: ${t.slug} no cierra bien el bucle (usar acceptLoopRisk con motivo si se escuchó aceptable)`); continue; }
      (slots[slot] = slots[slot] || []).push(t.slug);
      if (tracks[t.slug]) continue;
      tracks[t.slug] = {src: t, a};
    }
  }
  return {errors, tracks, slots, reviewSha: crypto.createHash('sha256').update(JSON.stringify(rev)).digest('hex')};
}
function encode(t, a) {
  const dest = path.join(OUT, t.slug + '.ogg'); fs.mkdirSync(OUT, {recursive: true});
  const gain = TARGET_LUFS - a.integratedLUFS;
  for (const q of [4, 3, 2, 1]) { // baja la calidad hasta entrar en el presupuesto por archivo
    const r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', path.join(ROOT, t.file), '-vn', '-map_metadata', '-1', '-af', `volume=${gain.toFixed(2)}dB,alimiter=limit=0.84:level=disabled`, '-c:a', 'libvorbis', '-q:a', String(q), '-ar', '44100', dest]);
    if (r.status !== 0) throw Error('ffmpeg: ' + String(r.stderr).slice(0, 120));
    if (fs.statSync(dest).size <= MAX_FILE) break;
  }
  return dest;
}
function main() {
  const b = build(); if (b.errors.length) { b.errors.forEach(e => console.error('  - ' + e)); process.exitCode = 1; return; }
  const out = {contract: 'MusicAssignments', version: 1, targetLUFS: TARGET_LUFS, approvedFrom: REV, reviewSha256: b.reviewSha, tracks: {}, slots: b.slots};
  let total = 0; const credits = [];
  if (!process.argv.includes('--check')) {
    fs.rmSync(OUT, {recursive: true, force: true});
    for (const [slug, {src, a}] of Object.entries(b.tracks)) {
      const dest = encode(src, a), buf = fs.readFileSync(dest); total += buf.length;
      if (buf.length > MAX_FILE) { console.error(`${slug}: ${buf.length} B > presupuesto por archivo`); process.exitCode = 1; return; }
      out.tracks[slug] = {file: 'assets/audio/music/' + slug + '.ogg', bytes: buf.length, sha256: crypto.createHash('sha256').update(buf).digest('hex'), durationSec: a.durationSec, gainDb: 0,
        title: src.title, author: src.author, source: src.source, license: src.license, originalSha256: src.sha256};
      credits.push(`| ${src.title} | ${src.author || 'n/d'} | ${src.license} | ${src.source} |`);
    }
    if (total > MAX_TOTAL) { console.error(`peso total ${(total / 1048576).toFixed(1)} MB > ${MAX_TOTAL / 1048576} MB`); process.exitCode = 1; return; }
  } else for (const slug of Object.keys(b.tracks)) out.tracks[slug] = {}; 
  fs.mkdirSync(OUT, {recursive: true});
  if (!process.argv.includes('--check')) {
    fs.writeFileSync(path.join(OUT, 'assignments.v1.json'), JSON.stringify(out, null, 1) + '\n');
    fs.writeFileSync(path.join(ROOT, 'legal/MUSIC_CREDITS.md'), `# Créditos de música\n\nPistas distribuidas con el juego. Todas CC0 1.0 (dominio público): no exigen atribución; se acreditan por cortesía.\nEvidencia de licencia (ficha, extracto y hash de la página) en \`docs/audio/library-catalog.json\`.\nLos originales se recuperan con \`node tools/music/ingest.js fetch\`.\n\n${credits.length ? '| Título | Autor | Licencia | Fuente |\n|---|---|---|---|\n' + credits.join('\n') + '\n' : '_Todavía no hay pistas de archivo aprobadas: la música del juego es 100 % sintetizada por el motor._\n'}`);
  }
  console.log(JSON.stringify({approvedSlots: Object.keys(b.slots).length, tracks: Object.keys(b.tracks).length, totalMB: +(total / 1048576).toFixed(2)}));
}
module.exports = {build};
if (require.main === module) main();
