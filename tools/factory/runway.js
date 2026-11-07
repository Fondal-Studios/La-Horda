#!/usr/bin/env node
'use strict';
// Cliente Runway de la fábrica. Genera CONCEPTOS/REFERENCIAS en staging con recibo; no instala ni aprueba arte.
// Autenticación: la inyecta el proxy del entorno (no hay claves en el repo). Usa curl para respetar HTTPS_PROXY.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const API = process.env.RUNWAY_API || 'https://api.dev.runwayml.com/v1';
const HEADERS = ['-H', 'X-Runway-Version: 2024-11-06', '-H', 'Content-Type: application/json'];
const MAX_CREDITS = Number(process.env.RUNWAY_MAX_CREDITS || 40); // tope por ejecución
const ID_RE = /^[a-z][a-z0-9_]*$/;

function curl(args, input) {
  const r = spawnSync('curl', ['-sS', '-m', '120', ...args], {input, encoding: 'buffer', maxBuffer: 64 << 20});
  if (r.status !== 0) throw Error('curl failed: ' + r.stderr.toString());
  return r.stdout;
}
function api(method, route, body) {
  const out = curl(['-X', method, API + route, ...HEADERS, ...(body ? ['-d', '@-'] : [])], body ? JSON.stringify(body) : undefined).toString();
  let json; try { json = JSON.parse(out); } catch { throw Error('Runway: respuesta no JSON: ' + out.slice(0, 200)); }
  if (json.error) throw Error('Runway: ' + json.error);
  return json;
}
const sleep = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function organization() { return api('GET', '/organization'); }

// Genera una imagen y la deja en art-source/runway/<id>/ con recibo GENERATED_NOT_APPROVED.
function generateImage({id, prompt, ratio = '1024:1024', model = 'gen4_image', referenceImages, outRoot = path.join(ROOT, 'art-source/runway')}) {
  if (!ID_RE.test(id || '')) throw Error('id inválido');
  if (!prompt || prompt.length < 10) throw Error('prompt demasiado corto');
  const body = {model, promptText: prompt, ratio};
  if (referenceImages) body.referenceImages = referenceImages;
  const task = api('POST', '/text_to_image', body);
  const estimated = task.estimatedCost?.credits ?? 0;
  if (estimated > MAX_CREDITS) throw Error(`costo estimado ${estimated} > tope ${MAX_CREDITS}`);
  let t;
  for (let i = 0; i < 90; i++) {
    t = api('GET', '/tasks/' + task.id);
    if (t.status === 'SUCCEEDED') break;
    if (t.status === 'FAILED' || t.status === 'CANCELLED') throw Error(`tarea ${t.status}: ${t.failure || ''}`);
    sleep(4000);
  }
  if (t.status !== 'SUCCEEDED') throw Error('tiempo agotado esperando la tarea ' + task.id);
  const dir = path.join(outRoot, id); fs.mkdirSync(dir, {recursive: true});
  const files = t.output.map((url, i) => {
    const buf = curl([url]);
    if (buf.subarray(1, 4).toString() !== 'PNG') throw Error('la salida no es PNG');
    const name = `concept_${String(i + 1).padStart(2, '0')}.png`;
    fs.writeFileSync(path.join(dir, name), buf);
    return {file: name, sha256: crypto.createHash('sha256').update(buf).digest('hex')};
  });
  const receipt = {status: 'GENERATED_NOT_APPROVED', kind: 'concept', id, model, prompt, ratio, taskId: task.id,
    credits: t.cost?.credits ?? estimated, createdAt: t.createdAt, files,
    note: 'Concepto de Runway: no es un atlas 4×9. Debe pasar por el Pintor/importador, Style Gate y revisión visual humana.'};
  fs.writeFileSync(path.join(dir, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
  return {dir, receipt};
}

module.exports = {organization, generateImage, ID_RE};

if (require.main === module) {
  const [cmd, id, ...rest] = process.argv.slice(2);
  try {
    if (cmd === 'status') {
      const o = organization();
      console.log(JSON.stringify({creditBalance: o.creditBalance, imageModels: Object.keys(o.tier.models).filter(m => /image/.test(m)).length}, null, 2));
    } else if (cmd === 'image') {
      const prompt = rest.filter(x => !x.startsWith('--')).join(' ');
      const {dir, receipt} = generateImage({id, prompt});
      console.log(JSON.stringify({dir: path.relative(ROOT, dir), credits: receipt.credits, status: receipt.status}, null, 2));
    } else throw Error('Uso: runway.js status | image <id> "<prompt>"');
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
