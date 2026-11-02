#!/usr/bin/env node
'use strict';
/* UI Factory · maestros de marcos de botones del HUD con Runway (gen4_image).
   Genera, por ARQUETIPO de héroe, un anillo normal y un anillo de Definitiva en GRIS METÁLICO sobre verde plano; el color de cada héroe se aplica
   después con build-hero-frames.py (mapa de degradado, como el Pintor). Cada imagen deja recibo GENERATED_NOT_APPROVED.
   Cliente mínimo propio (misma API y autenticación por proxy que tools/factory/runway.js de la rama factory/runway-architects-20261101, que aún no está
   en main y falla en los POST con Node 22: `encoding:'buffer'` + `input` string). Cuando esa rama se arregle y se integre, este archivo debe pasar a usarla.
   Gasto: 5 créditos por imagen. Tope por ejecución: UF_RUNWAY_BUDGET (90). No regenera lo que ya existe (usa --force). Uso:
     node tools/ui-factory/runway-hud-masters.js status | list | gen [id…] [--force] */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), {spawnSync} = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..'), OUT = path.join(ROOT, 'art-source/runway-hud');
const API = process.env.RUNWAY_API || 'https://api.dev.runwayml.com/v1', BUDGET = Number(process.env.UF_RUNWAY_BUDGET || 90);
const H = ['-H', 'X-Runway-Version: 2024-11-06', '-H', 'Content-Type: application/json'];
const curl = (a, input) => { const r = spawnSync('curl', ['-sS', '-m', '120', ...a], {input, maxBuffer: 64 << 20}); if (r.status !== 0) throw Error('curl: ' + r.stderr); return r.stdout; };
const api = (m, r, b) => { const t = curl(['-X', m, API + r, ...H, ...(b ? ['-d', '@-'] : [])], b ? Buffer.from(JSON.stringify(b)) : undefined).toString(); let j; try { j = JSON.parse(t); } catch { throw Error('Runway no-JSON: ' + t.slice(0, 160)); } if (j.error) throw Error('Runway: ' + j.error); return j; };
const sleep = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const BASE = '16-bit pixel art game UI asset, flat front view of ONE very slim thin ornate border frame, the border is only about 8 percent of the image width, ' +
  'the inside area and the entire background are one single flat solid pure chroma green #00FF00 with no gradient and no texture, crisp 1-pixel dark outline, chunky pixel blocks, limited palette, ' +
  'dark fantasy hand-forged silver-gray steel with white gems (no other colors), light from top-left, perfectly symmetrical, centered, no text, no characters, the frame is a perfect circle ring';
const ARCH = {   // arquetipo → motivo del anillo normal / de la Definitiva
  muro:    ['heavy riveted iron plate segments and four shield-shaped studs', 'heavy riveted iron ring crowned with a fortress battlement of four towers'],
  filo:    ['small sword-guard crosses and blade-edge notches, four white gems', 'ring with eight outward blade spikes like a sunburst of swords'],
  arcano:  ['small arcane rune carvings and four white crystal gems', 'with a small crown of three white crystal shards attached on top of the ring (the ring itself stays thin and centered)'],
  luz:     ['small leaves and tiny feather wings, four soft white gems', 'ring with a radiant halo of eight golden-white feathers fanning outward'],
  sombra:  ['small thorns and fang shapes, four white gems like eyes', 'ring with a crown of curved claws and thorns pointing outward'],
  hueso:   ['small bone segments and tiny skulls, four white gems', 'ring made of bones with a crown of ribs and one large skull at the top'],
  ingenio: ['small cogs, bolts and pipe joints, four white gems', 'ring of large interlocking cogs with steam pipes and a crown of gears'],
  cosmos:  ['small stars, crescent moons and wave curls, four white gems', 'ring with a radiant crown of eight stars and moon crescents'],
};
const JOBS = Object.entries(ARCH).flatMap(([k, [n, u]]) => [{id: k + '_ring', prompt: BASE + ', ' + n}, {id: k + '_ult', prompt: BASE + ', ' + u}]);
function gen(job) {
  const t0 = api('POST', '/text_to_image', {model: 'gen4_image', promptText: job.prompt, ratio: '720:720'});
  let t; for (let i = 0; i < 90; i++) { t = api('GET', '/tasks/' + t0.id); if (t.status === 'SUCCEEDED') break; if (['FAILED', 'CANCELLED'].includes(t.status)) throw Error('tarea ' + t.status + ' ' + (t.failure || '')); sleep(4000); }
  if (t.status !== 'SUCCEEDED') throw Error('timeout ' + t0.id);
  const buf = curl([t.output[0]]); if (buf.subarray(1, 4).toString() !== 'PNG') throw Error('no es PNG');
  const dir = path.join(OUT, job.id); fs.mkdirSync(dir, {recursive: true}); fs.writeFileSync(path.join(dir, 'master.png'), buf);
  const credits = t.cost?.credits ?? t0.estimatedCost?.credits ?? 5;
  fs.writeFileSync(path.join(dir, 'receipt.json'), JSON.stringify({status: 'GENERATED_NOT_APPROVED', kind: 'concept', id: job.id, model: 'gen4_image', ratio: '720:720', prompt: job.prompt, taskId: t0.id, credits, createdAt: t.createdAt, sha256: crypto.createHash('sha256').update(buf).digest('hex'), note: 'Maestro en gris para marcos de HUD; el color por héroe se aplica con tools/ui-factory/build-hero-frames.py. Requiere revisión de arte humana.'}, null, 2) + '\n');
  return credits;
}
const [cmd, ...rest] = process.argv.slice(2);
try {
  if (cmd === 'status') console.log(JSON.stringify({creditBalance: api('GET', '/organization').creditBalance}));
  else if (cmd === 'list') for (const j of JOBS) console.log(j.id, fs.existsSync(path.join(OUT, j.id, 'master.png')) ? 'OK' : 'pendiente');
  else if (cmd === 'gen') {
    const force = rest.includes('--force'), ids = rest.filter(x => !x.startsWith('--')); let spent = 0;
    for (const j of JOBS) {
      if (ids.length && !ids.includes(j.id)) continue; if (!force && fs.existsSync(path.join(OUT, j.id, 'master.png'))) { console.log('ya existe', j.id); continue; }
      if (spent + 5 > BUDGET) { console.log('tope de gasto alcanzado (' + spent + '/' + BUDGET + ')'); break; }
      try { const c = gen(j); spent += c; console.log('OK', j.id, c + ' créditos'); } catch (e) { console.log('ERROR', j.id, e.message); }
    }
    console.log('gastado', spent);
  } else throw Error('Uso: status | list | gen [id…] [--force]');
} catch (e) { console.error(e.message); process.exitCode = 1; }
