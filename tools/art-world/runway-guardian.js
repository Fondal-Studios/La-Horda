#!/usr/bin/env node
'use strict';
/* PINTOR de guardianes (Runway gen4_image con referencias). Uso:
     node tools/art-world/runway-guardian.js <guardian> <idIntento> "<prompt con @codex y @pose>" <codex.png> [pose.png]
   Deja `master.png` + `receipt.json` (GENERATED_NOT_APPROVED) en art-source/runway-guardians/<guardian>/<idIntento>/.
   Tope por ejecución: GUARDIAN_RUNWAY_BUDGET (default 24 créditos). El EVALUADOR decide; ver tools/art-world/guardian-eval.py. */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), {spawnSync} = require('node:child_process');
const [champ, attempt, prompt, codex, pose] = process.argv.slice(2);
if(!champ || !attempt || !prompt || !codex){ console.error('uso: runway-guardian.js <guardian> <intento> "<prompt>" <codex.png> [pose.png]'); process.exit(2); }
const ROOT = path.resolve(__dirname, '../..'), API = 'https://api.dev.runwayml.com/v1', BUDGET = Number(process.env.GUARDIAN_RUNWAY_BUDGET || 24);
const H = ['-H', 'X-Runway-Version: 2024-11-06', '-H', 'Content-Type: application/json'];
const curl = (a, input) => { const r = spawnSync('curl', ['-sS', '-m', '180', ...a], {input, maxBuffer: 64 << 20}); if(r.status !== 0) throw Error('curl: ' + r.stderr); return r.stdout; };
const api = (m, r, b) => { const t = curl(['-X', m, API + r, ...H, ...(b ? ['-d', '@-'] : [])], b ? Buffer.from(JSON.stringify(b)) : undefined).toString(); let j; try{ j = JSON.parse(t); }catch{ throw Error('Runway no-JSON: ' + t.slice(0, 160)); } if(j.error) throw Error('Runway: ' + JSON.stringify(j).slice(0, 240)); return j; };
const uri = p => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
const dir = path.join(ROOT, 'art-source/runway-guardians', champ, attempt); fs.mkdirSync(dir, {recursive: true});
if(fs.existsSync(path.join(dir, 'master.png')) && !process.env.FORCE){ console.log('ya existe', dir); process.exit(0); }
const refs = [{uri: uri(codex), tag: 'codex'}]; if(pose) refs.push({uri: uri(pose), tag: 'pose'});
const t0 = api('POST', '/text_to_image', {model: 'gen4_image', promptText: prompt, ratio: '1024:1024', referenceImages: refs});
let t; for(let i = 0; i < 90; i++){ t = api('GET', '/tasks/' + t0.id); if(t.status === 'SUCCEEDED') break; if(['FAILED', 'CANCELLED'].includes(t.status)) throw Error('tarea ' + t.status + ' ' + JSON.stringify(t).slice(0, 240)); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 3000); }
if(t.status !== 'SUCCEEDED') throw Error('timeout ' + t0.id);
const buf = curl([t.output[0]]); fs.writeFileSync(path.join(dir, 'master.png'), buf);
const credits = t.cost?.credits ?? t0.estimatedCost?.credits ?? null;
fs.writeFileSync(path.join(dir, 'receipt.json'), JSON.stringify({status: 'GENERATED_NOT_APPROVED', champ, attempt, model: 'gen4_image', ratio: '1024:1024', prompt, refs: [codex, pose || null].filter(Boolean).map(p => path.relative(ROOT, path.resolve(p))), taskId: t0.id, credits, createdAt: t.createdAt, sha256: crypto.createHash('sha256').update(buf).digest('hex')}, null, 2) + '\n');
console.log(champ, attempt, 'OK credits=' + credits, 'task=' + t0.id);
