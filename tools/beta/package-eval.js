'use strict';
// Arma el paquete CIEGO para el evaluador independiente: capturas de main y rama como "A"/"B" (asignación al azar sellada
// en SEALED_KEY.json), tiras de video (1 cuadro por segundo), métricas con las mismas etiquetas, y la rúbrica.
//   node tools/beta/package-eval.js --main <dir-capturas-main> --beta <dir-capturas-beta> --out <dir> --round 1
//   --key <archivo> guarda la clave FUERA del paquete. --seed N fija la asignación (para repetir una ronda con las mismas etiquetas).
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const MAIN = path.resolve(arg('main')), BETA = path.resolve(arg('beta')), OUT = path.resolve(arg('out')), ROUND = +arg('round', 1);
const seed = arg('seed') !== undefined ? +arg('seed') : (Date.now() % 1000);
const swap = (seed * 2654435761 >>> 0) % 2 === 1;                 // true → A = beta
const map = swap ? { A: BETA, B: MAIN } : { A: MAIN, B: BETA }, who = swap ? { A: 'beta', B: 'main' } : { A: 'main', B: 'beta' };
fs.rmSync(OUT, { recursive: true, force: true });
for (const L of ['A', 'B']) {
  const d = path.join(OUT, L, 'stills'); fs.mkdirSync(d, { recursive: true });
  for (const f of fs.readdirSync(map[L]).filter(f => f.endsWith('.png'))) fs.copyFileSync(path.join(map[L], f), path.join(d, f));
  // tiras de video: 1 cuadro/s del primer video encontrado
  const vdir = path.join(map[L], 'video'); const vids = fs.existsSync(vdir) ? fs.readdirSync(vdir).filter(f => f.endsWith('.webm')) : [];
  if (vids.length) {
    const v = path.join(vdir, vids[0]), fr = path.join(OUT, L, 'video_frames'); fs.mkdirSync(fr, { recursive: true });
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', v, '-vf', 'fps=1', path.join(fr, 'f_%03d.png')]);
    const files = fs.readdirSync(fr).sort(); const per = 12;
    for (let i = 0; i * per < files.length; i++) {
      const group = files.slice(i * per, (i + 1) * per).map(f => path.join(fr, f));
      execFileSync('montage', [...group, '-tile', '4x3', '-geometry', '422x195+2+2', '-background', '#111', path.join(OUT, L, `tira_video_${String(i + 1).padStart(2, '0')}_seg${i * per}-${i * per + per}s.png`)]);
    }
    fs.rmSync(fr, { recursive: true, force: true });
    execFileSync('cp', [v, path.join(OUT, L, 'video.webm')]);
  }
  const res = path.join(map[L], 'capture-result.json');
  if (fs.existsSync(res)) { const r = JSON.parse(fs.readFileSync(res)); delete r.base; delete r.target; fs.writeFileSync(path.join(OUT, L, 'capture-result.json'), JSON.stringify(r, null, 2)); }
}
fs.copyFileSync(path.resolve(__dirname, '../../docs/beta/EVALUATION_RUBRIC.md'), path.join(OUT, 'RUBRICA.md'));
const KEY = path.resolve(arg('key', path.join(OUT, '..', `SEALED_KEY_round${ROUND}.json`)));
fs.mkdirSync(path.dirname(KEY), { recursive: true });
fs.writeFileSync(KEY, JSON.stringify({ round: ROUND, seed, A: who.A, B: who.B }, null, 2));
console.log('paquete en', OUT, '| clave sellada en', KEY);
