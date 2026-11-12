#!/usr/bin/env node
'use strict';
/* MOVIMIENTO con Runway (image_to_video, gen4_turbo): a partir de UNA imagen de diseño genera un clip corto para sacar cuadros de un ciclo
   (caminar, ataque, muerte). Uso: node tools/art-world/runway-video.js <id> <intento> "<prompt en inglés>" <imagen.png> [--seconds 5] [--ratio 960:960] [--dry-run]
   Deja clip.mp4 + receipt.json (GENERATED_NOT_APPROVED) en art-source/runway-video/<id>/<intento>/. Sin tope de créditos por decisión del dueño (2026-11-12).
   Costo: gen4_turbo cobra por segundo (verificar receipt.credits en la primera corrida). --dry-run no llama a la API. */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), {spawnSync} = require('node:child_process');
const args = process.argv.slice(2), val = n => { const i = args.indexOf(n); return i < 0 ? null : args[i + 1]; };
const pos = args.filter((a, i) => !a.startsWith('--') && !['--seconds', '--ratio'].includes(args[i - 1]));
const [id, attempt, prompt, img] = pos;
if (!id || !attempt || !prompt || !img || !/^[A-Za-z0-9_-]+$/.test(id + attempt)) { console.error('uso: runway-video.js <id> <intento> "<prompt>" <imagen.png> [--seconds 5] [--ratio 960:960] [--dry-run]'); process.exit(2); }
const ROOT = path.resolve(__dirname, '../..'), API = 'https://api.dev.runwayml.com/v1', SEC = Number(val('--seconds') || 5), RATIO = val('--ratio') || '960:960';
const f = path.resolve(ROOT, img); if (!f.startsWith(ROOT + path.sep) || !fs.existsSync(f)) { console.error('la imagen debe existir dentro del repo: ' + img); process.exit(2); }
const body = {model: 'gen4_turbo', promptImage: 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'), promptText: prompt, ratio: RATIO, duration: SEC};
const dir = path.join(ROOT, 'art-source/runway-video', id, attempt);
if (args.includes('--dry-run')) { console.log(JSON.stringify({dryRun: true, outDir: path.relative(ROOT, dir), request: {...body, promptImage: '<' + body.promptImage.length + ' bytes>'}}, null, 1)); process.exit(0); }
const H = ['-H', 'X-Runway-Version: 2024-11-06', '-H', 'Content-Type: application/json'];
const curl = (a, input) => { const r = spawnSync('curl', ['-sS', '-m', '300', ...a], {input, maxBuffer: 256 << 20}); if (r.status !== 0) throw Error('curl: ' + r.stderr); return r.stdout; };
const api = (m, r, b) => { const t = curl(['-X', m, API + r, ...H, ...(b ? ['-d', '@-'] : [])], b ? Buffer.from(JSON.stringify(b)) : undefined).toString(); let j; try { j = JSON.parse(t); } catch { throw Error('Runway no devolvió JSON: ' + t.slice(0, 200)); } if (j.error) throw Error('Runway: ' + String(j.error).slice(0, 200) + (j.issues ? ' ' + JSON.stringify(j.issues).slice(0, 240) : '')); return j; };
const t0 = api('POST', '/image_to_video', body); if (!t0.id) throw Error('rechazado: ' + JSON.stringify(t0).slice(0, 300));
fs.mkdirSync(dir, {recursive: true}); fs.writeFileSync(path.join(dir, 'receipt.json'), JSON.stringify({status: 'PENDING', kind: 'video', id, attempt, taskId: t0.id, prompt}, null, 1));
let t; for (let i = 0; i < 120; i++) { t = api('GET', '/tasks/' + t0.id); if (t.status === 'SUCCEEDED') break; if (['FAILED', 'CANCELLED'].includes(t.status)) throw Error('tarea ' + t.status + ' ' + JSON.stringify(t).slice(0, 240)); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000); }
if (t.status !== 'SUCCEEDED') throw Error('timeout, tarea ' + t0.id);
const buf = curl([t.output[0]]); fs.writeFileSync(path.join(dir, 'clip.mp4'), buf);
fs.writeFileSync(path.join(dir, 'receipt.json'), JSON.stringify({status: 'GENERATED_NOT_APPROVED', kind: 'video', id, attempt, model: 'gen4_turbo', ratio: RATIO, seconds: SEC, prompt, image: img, taskId: t0.id, credits: t.cost?.credits ?? null, sha256: crypto.createHash('sha256').update(buf).digest('hex')}, null, 1));
console.log(id, attempt, 'OK credits=' + (t.cost?.credits ?? '?'), 'task=' + t0.id);
