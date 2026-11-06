#!/usr/bin/env node
'use strict';
/* Arte de mundo con Runway gen4_image (referencia del Códice + verde croma). Cada imagen deja recibo GENERATED_NOT_APPROVED.
   Gasto observado: ver receipt.credits. Tope por ejecución: WORLD_RUNWAY_BUDGET (default 40). No regenera lo existente (usa --force).
     node tools/art-world/runway-world.js status | list | gen <id…> [--force] */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), {spawnSync} = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..'), OUT = path.join(ROOT, 'art-source/runway-world');
const API = 'https://api.dev.runwayml.com/v1', BUDGET = Number(process.env.WORLD_RUNWAY_BUDGET || 40);
const H = ['-H', 'X-Runway-Version: 2024-11-06', '-H', 'Content-Type: application/json'];
const curl = (a, input) => { const r = spawnSync('curl', ['-sS', '-m', '180', ...a], {input, maxBuffer: 64 << 20}); if (r.status !== 0) throw Error('curl: ' + r.stderr); return r.stdout; };
const api = (m, r, b) => { const t = curl(['-X', m, API + r, ...H, ...(b ? ['-d', '@-'] : [])], b ? Buffer.from(JSON.stringify(b)) : undefined).toString(); let j; try { j = JSON.parse(t); } catch { throw Error('Runway no-JSON: ' + t.slice(0, 160)); } if (j.error) throw Error('Runway: ' + JSON.stringify(j).slice(0, 200)); return j; };
const sleep = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const STYLE = 'dark fantasy pixel art, oblique top-down three-quarter view like the reference, crisp 1-pixel dark outline, chunky pixel blocks, limited palette of dusk purples, charred browns, slate-blue and dark red roof tiles, a few warm orange lit windows, one single cursed village house isolated on a flat solid pure chroma green #00FF00 background with no ground shadow, no text, no characters, no UI';
const JOBS = {
  casa_a: 'In the style of @ref: a small two-storey timber-and-stone village house with a steep slate-blue tiled gable roof, a chimney, a wooden door and two shuttered windows, one window glowing orange. ' + STYLE,
  casa_b: 'In the style of @ref: a wider one-storey cottage with a dark-red tiled roof, a stone chimney, a wooden door with a lantern, and a small attic dormer, slightly crooked and abandoned. ' + STYLE,
};
const TEX = 'flat orthographic front-on texture filling the entire square edge to edge, seamless tileable pattern, dark fantasy pixel art, crisp chunky pixel blocks, limited palette, no perspective, no border, no frame, no objects, no text, no characters, even lighting, ';
Object.assign(JOBS, {
  tex_techo_pizarra: 'In the style of @ref: ' + TEX + 'rows of overlapping slate-blue roof shingles, a few darker cracked shingles, subtle purple moss.',
  tex_techo_roja: 'In the style of @ref: ' + TEX + 'rows of overlapping dark-red clay roof tiles, a few chipped tiles, soot stains.',
  tex_pared_madera_piedra: 'In the style of @ref: ' + TEX + 'a village house wall made of grey-purple stone blocks framed by dark brown timber beams in a half-timbered pattern, plaster patches, no windows, no door.',
});
const cmd = process.argv[2], ids = process.argv.slice(3).filter(a => !a.startsWith('--')), force = process.argv.includes('--force');
if (cmd === 'status') console.log(JSON.stringify({creditBalance: api('GET', '/organization').creditBalance}));
else if (cmd === 'list') for (const k of Object.keys(JOBS)) console.log(k, fs.existsSync(path.join(OUT, 'ciudad', k, 'master.png')) ? 'OK' : 'pendiente');
else if (cmd === 'gen') {
  const ref = 'data:image/png;base64,' + fs.readFileSync(path.join(OUT, 'ciudad/ref_house_crop.png')).toString('base64'); let spent = 0;
  for (const id of ids) {
    const dir = path.join(OUT, 'ciudad', id), f = path.join(dir, 'master.png'); if (!JOBS[id]) throw Error('id desconocido ' + id);
    if (fs.existsSync(f) && !force) { console.log(id, 'ya existe'); continue; }
    if (spent >= BUDGET) { console.log('tope de presupuesto alcanzado'); break; }
    const t0 = api('POST', '/text_to_image', {model: 'gen4_image', promptText: JOBS[id], ratio: '1024:1024', referenceImages: [{uri: ref, tag: 'ref'}]});
    let t; for (let i = 0; i < 90; i++) { t = api('GET', '/tasks/' + t0.id); if (t.status === 'SUCCEEDED') break; if (['FAILED', 'CANCELLED'].includes(t.status)) throw Error('tarea ' + t.status + ' ' + JSON.stringify(t).slice(0, 200)); sleep(3000); }
    if (t.status !== 'SUCCEEDED') throw Error('timeout ' + t0.id);
    const buf = curl([t.output[0]]); fs.mkdirSync(dir, {recursive: true}); fs.writeFileSync(f, buf);
    const credits = t.cost?.credits ?? t0.estimatedCost?.credits ?? null; spent += credits || 0;
    fs.writeFileSync(path.join(dir, 'receipt.json'), JSON.stringify({status: 'GENERATED_NOT_APPROVED', id, model: 'gen4_image', ratio: '1024:1024', prompt: JOBS[id], taskId: t0.id, credits, createdAt: t.createdAt, sha256: crypto.createHash('sha256').update(buf).digest('hex'), reference: 'assets/ui/codex/arenas/ciudad.jpg (recorte)'}, null, 2) + '\n');
    console.log(id, 'OK', 'credits=' + credits, 'task=' + t0.id);
  }
} else console.log('uso: status | list | gen <id…> [--force]');
