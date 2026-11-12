#!/usr/bin/env node
'use strict';
/* DISEÑO / LÁMINA con Runway (gen4_image): crea la imagen que falta para poder trabajar un personaje o una criatura.
   Sirve para (a) la LÁMINA DEL CÓDICE de un campeón que no la tiene, (b) la imagen de DISEÑO de un enemigo sin atlas (su @design para tools/art/runway/gen_sheet.py).
     node tools/art-world/runway-design.js <id> <intento> "<prompt en inglés>" [estilo.png] [--ratio 1024:1024] [--dry-run]
   Deja master.png + receipt.json (GENERATED_NOT_APPROVED) en art-source/runway-designs/<id>/<intento>/. `estilo.png` (opcional) se pasa como @style:
   una lámina ya aprobada del mismo juego, para que el diseño nuevo salga en el mismo lenguaje visual. --dry-run imprime el pedido SIN llamar a la API ni gastar.
   Sin tope de créditos por decisión del dueño (2026-11-12); si el saldo no alcanza, Runway rechaza el pedido y este script termina con el error. */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), {spawnSync} = require('node:child_process');
const args = process.argv.slice(2), flag = n => args.includes(n), val = n => { const i = args.indexOf(n); return i < 0 ? null : args[i + 1]; };
const pos = args.filter((a, i) => !a.startsWith('--') && !['--ratio'].includes(args[i - 1]));
const [id, attempt, prompt, style] = pos;
if (!id || !attempt || !prompt) { console.error('uso: runway-design.js <id> <intento> "<prompt>" [estilo.png] [--ratio 1024:1024] [--dry-run]'); process.exit(2); }
const ROOT = path.resolve(__dirname, '../..'), API = 'https://api.dev.runwayml.com/v1', RATIO = val('--ratio') || '1024:1024';
const H = ['-H', 'X-Runway-Version: 2024-11-06', '-H', 'Content-Type: application/json'];
const curl = (a, input) => { const r = spawnSync('curl', ['-sS', '-m', '180', ...a], {input, maxBuffer: 64 << 20}); if (r.status !== 0) throw Error('curl: ' + r.stderr); return r.stdout; };
const api = (m, r, b) => { const t = curl(['-X', m, API + r, ...H, ...(b ? ['-d', '@-'] : [])], b ? Buffer.from(JSON.stringify(b)) : undefined).toString(); let j; try { j = JSON.parse(t); } catch { throw Error('Runway no devolvió JSON: ' + t.slice(0, 200)); } return j; };
const uri = p => 'data:image/png;base64,' + fs.readFileSync(path.resolve(ROOT, p)).toString('base64');
const refs = style ? [{uri: uri(style), tag: 'style'}] : [];
const body = {model: 'gen4_image', promptText: prompt, ratio: RATIO, ...(refs.length ? {referenceImages: refs} : {})};
const dir = path.join(ROOT, 'art-source/runway-designs', id, attempt);
if (flag('--dry-run')) { console.log(JSON.stringify({dryRun: true, id, attempt, outDir: path.relative(ROOT, dir), request: {...body, referenceImages: refs.map(r => ({tag: r.tag, bytes: r.uri.length}))}}, null, 1)); process.exit(0); }
fs.mkdirSync(dir, {recursive: true});
if (fs.existsSync(path.join(dir, 'master.png')) && !process.env.FORCE) { console.log('ya existe', dir); process.exit(0); }
const t0 = api('POST', '/text_to_image', body);
if (!t0.id) throw Error('Runway rechazó el pedido: ' + JSON.stringify(t0).slice(0, 300));
let t; for (let i = 0; i < 90; i++) { t = api('GET', '/tasks/' + t0.id); if (t.status === 'SUCCEEDED') break; if (['FAILED', 'CANCELLED'].includes(t.status)) throw Error('tarea ' + t.status + ' ' + JSON.stringify(t.failure || t).slice(0, 200)); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 4000); }
if (t.status !== 'SUCCEEDED') throw Error('timeout ' + t0.id);
const buf = curl([t.output[0]]); fs.writeFileSync(path.join(dir, 'master.png'), buf);
const credits = t.cost?.credits ?? t0.estimatedCost?.credits ?? null;
fs.writeFileSync(path.join(dir, 'receipt.json'), JSON.stringify({status: 'GENERATED_NOT_APPROVED', kind: 'design', id, attempt, model: 'gen4_image', ratio: RATIO, prompt, style: style || null, taskId: t0.id, credits, sha256: crypto.createHash('sha256').update(buf).digest('hex'), note: 'Requiere aprobación (RECETA §5) antes de usarse como @codex / @design.'}, null, 1));
console.log(id, attempt, 'OK credits=' + credits, 'task=' + t0.id);
