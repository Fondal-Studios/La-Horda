#!/usr/bin/env node
'use strict';
// ARQUITECTO DE ARTE: define cómo un arte producido por la fábrica entra al repo y prepara la rama/commit.
// Entrada: un directorio de staging con recibo (Runway: concepto; Pintor: atlas.png 4×9). Salida: plan + commit local opcional.
// No empuja, no abre PR, no fusiona, no marca arte como aprobado: eso lo decide el Arquitecto del juego y una persona.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const ID_RE = /^[a-z][a-z0-9_]*$/;
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const pngSize = f => { const b = fs.readFileSync(f); if (b.subarray(1, 4).toString() !== 'PNG') return null; return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

// Clasifica el staging: concept (Runway) o atlas (Pintor), con la ruta destino que corresponde.
function plan(stagingDir, opts = {}) {
  const dir = path.resolve(ROOT, stagingDir);
  if (!dir.startsWith(ROOT + path.sep) || !fs.existsSync(dir)) throw Error('staging fuera del repo o inexistente');
  const id = path.basename(dir);
  if (!ID_RE.test(id)) throw Error('el directorio de staging debe llamarse como el id (a-z0-9_)');
  const errors = [], steps = [];
  const receiptFile = path.join(dir, 'receipt.json');
  if (fs.existsSync(path.join(dir, 'atlas.png'))) {
    const atlas = path.join(dir, 'atlas.png'), size = pngSize(atlas);
    if (!size || size[0] !== 448 || size[1] !== 1008) errors.push(`atlas debe ser 4×9 de 112 px (448×1008); es ${size}`);
    const spec = path.join(ROOT, 'tools/art/painter/specs', id + '.json');
    if (!fs.existsSync(spec)) errors.push(`falta la ficha tools/art/painter/specs/${id}.json`);
    steps.push({step: 'style-gate', cmd: ['python3', 'tools/art/painter/style_gate.py', path.relative(ROOT, atlas)]});
    steps.push({step: 'install', cmd: ['node', 'tools/factory/cli.js', 'paint', id, '--install'], note: 'copia a assets/ y actualiza art.js (lo hace install.py)'});
    steps.push({step: 'roster-gate', cmd: ['node', 'tools/art/roster_gate.js', '--write'], note: 'escala y pies; luego sin --write'});
    return {id, kind: 'atlas', sha256: sha(atlas), branch: `art/${id}-${opts.date || new Date().toISOString().slice(0, 10).replace(/-/g, '')}`, errors, steps, destination: 'assets/sprites/champions/<campeón>/ (lo decide la ficha)'};
  }
  if (fs.existsSync(receiptFile)) {
    const rc = JSON.parse(fs.readFileSync(receiptFile, 'utf8'));
    if (rc.status !== 'GENERATED_NOT_APPROVED') errors.push('recibo con estado inesperado: ' + rc.status);
    for (const f of rc.files || []) if (!fs.existsSync(path.join(dir, f.file)) || sha(path.join(dir, f.file)) !== f.sha256) errors.push(`hash no coincide: ${f.file}`);
    steps.push({step: 'suggest', cmd: ['python3', 'tools/art/painter/suggest.py', id, '"<descripción>"'], note: 'ficha borrador a partir del concepto; luego paint'});
    return {id, kind: 'concept', branch: `art/${id}-concept-${opts.date || new Date().toISOString().slice(0, 10).replace(/-/g, '')}`, errors, steps,
      destination: `art-source/runway/${id}/ (referencia; no se instala en el juego)`, note: 'Un concepto no es un atlas: no entra al juego sin pasar por el Pintor.'};
  }
  errors.push('staging sin receipt.json ni atlas.png');
  return {id, kind: 'unknown', errors, steps};
}

// Crea rama local y commit con los archivos del staging (solo rutas del plan). No empuja.
function commit(p, files, message) {
  if (p.errors.length) throw Error('plan con errores: ' + p.errors.join('; '));
  const run = (...a) => { const r = spawnSync('git', a, {cwd: ROOT, encoding: 'utf8'}); if (r.status !== 0) throw Error(`git ${a[0]}: ${r.stderr}`); return r.stdout.trim(); };
  if (run('status', '--porcelain', '--untracked-files=no')) throw Error('árbol con cambios sin commitear; limpiar antes');
  run('checkout', '-b', p.branch);
  run('add', '--', ...files);
  run('commit', '-m', message);
  return {branch: p.branch, commit: run('rev-parse', 'HEAD')};
}

module.exports = {plan, commit};

if (require.main === module) {
  const [cmd, staging] = process.argv.slice(2);
  try {
    if (cmd === 'plan' && staging) {
      const p = plan(staging);
      console.log(JSON.stringify(p, null, 2));
      if (p.errors.length) process.exitCode = 1;
    } else throw Error('Uso: architect-art.js plan <art-source/runway/<id> | tools/art/painter/out/<id>>');
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
