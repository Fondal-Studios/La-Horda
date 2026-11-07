#!/usr/bin/env node
'use strict';
// A review packet, NEVER an installer or an approval. Destination paths describe
// proposed replacements; hashes/dimensions describe the isolated candidate bytes.
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const C = require('../../contracts/v1');
const ROOT = path.resolve(__dirname, '../..');
function inside(root, relative, prefix) {
  if(typeof relative !== 'string' || !relative.startsWith(prefix) || relative.split('/').includes('..')) throw Error('Ruta fuera del área permitida');
  const base = fs.realpathSync(path.join(root, prefix));
  const target = fs.realpathSync(path.join(root, relative));
  if(target !== base && !target.startsWith(base + path.sep)) throw Error('Ruta/symlink fuera del área permitida');
  return target;
}
const REQUIRED_CHECKS = ['hay_candidato_aprobado', 'mismo_conjunto_de_archivos', 'mismas_dimensiones', 'alfa_0_255', 'peso_no_mayor_125pct', 'hashes_origen_vigentes', 'hashes_candidato_vigentes', 'evaluacion_actual_aprobada'];
function pngNames(target) {
  const files = [];
  function walk(p, relative) {
    const stat = fs.lstatSync(p);
    if(stat.isSymbolicLink()) throw Error('Symlink no permitido');
    if(stat.isDirectory()) for(const n of fs.readdirSync(p)) walk(path.join(p,n), relative ? relative + '/' + n : n);
    else if(p.endsWith('.png')) files.push(relative || path.basename(p));
  }
  walk(target, ''); return files.sort();
}
function buildHandoff(root, key, entry, context) {
  const gate = entry.integracion;
  if(!gate || gate.apto_tecnico !== true || !REQUIRED_CHECKS.every(k => gate.checks && gate.checks[k] === true)) throw Error('Candidato no apto técnicamente');
  if(!gate.evaluacion_actual || gate.evaluacion_actual.pass !== true || gate.evaluacion_actual.score < 90 || gate.evaluacion_actual.critical !== 0) throw Error('Falta evaluación vigente');
  if(!/^[a-f0-9]{40}$/.test(context.head) || !context.branch) throw Error('Falta SHA/rama exactos');
  const candidate = inside(root, entry.best, 'docs/art-factory/candidates/');
  const source = inside(root, entry.source, 'assets/');
  const names = Object.keys(entry.candidate_hashes || {}).sort();
  if(!names.length || !entry.source_hashes) throw Error('Faltan hashes de evaluación');
  const same = xs => JSON.stringify(xs) === JSON.stringify(names);
  if(!same(Object.keys(entry.source_hashes).sort()) || !same(pngNames(candidate)) || !same(pngNames(source))) throw Error('Conjunto de PNG distinto del evaluado');
  const assets = names.map(name => {
    if(name.split('/').includes('..') || path.isAbsolute(name) || !name.endsWith('.png')) throw Error('Nombre inválido');
    const candidatePath = path.posix.join(entry.best, name);
    inside(root, candidatePath, 'docs/art-factory/candidates/');
    const destination = fs.statSync(source).isFile() ? entry.source : path.posix.join(entry.source, name);
    inside(root, destination, 'assets/');
    const current = C.fromAssetFile(root, candidatePath, {id: destination.slice(7).replace(/\.png$/, ''), kind: context.kind, source: 'procedural',
      // Unknown density is conservatively blocked; do not manufacture a pass.
      gates: {pixelDensity: 'fail', styleGate: 'not_run', emojiLint: 'not_run'}});
    const original = C.fromAssetFile(root, destination, {id: 'original', kind: context.kind});
    if(current.sha256 !== entry.candidate_hashes[name] || original.sha256 !== entry.source_hashes[name]) throw Error('Los bytes cambiaron después de la evaluación');
    if(current.width !== original.width || current.height !== original.height) throw Error('Dimensiones distintas');
    const asset = {...current, path: destination};
    C.assertValid('ArtAsset', asset);
    return {candidatePath, originalSha256: original.sha256, asset};
  });
  return {packetVersion: 1, key, subject: {branch: context.branch, head: context.head},
    reviewRecord: 'reviews/' + context.branch.replace(/\//g, '__') + '.json',
    architectureApproval: 'PENDIENTE', eligibleForInstallation: false, installed: false,
    pending: ['pixel-density', 'style-gate', 'emoji-lint', 'runtime-visual-review', 'independent-S0C-review'], assets};
}
module.exports = {buildHandoff, REQUIRED_CHECKS};
if(require.main === module) {
  try {
    const [key, kind] = process.argv.slice(2);
    if(!/^[a-zA-Z0-9_-]+$/.test(key || '') || !kind) throw Error('Uso: node tools/factory/art-handoff.js KEY KIND (JSON por stdout; no instala)');
    // Refresh all technical gates against current bytes, not a stale ledger flag.
    cp.execFileSync('python3', ['tools/factory/art_factory.py', 'integrate', key], {cwd: ROOT});
    const entry = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/art-factory/ledger.json')))[key];
    if(!entry) throw Error('Candidato desconocido');
    const head = cp.execFileSync('git', ['rev-parse', 'HEAD'], {cwd: ROOT, encoding: 'utf8'}).trim();
    const branch = cp.execFileSync('git', ['branch', '--show-current'], {cwd: ROOT, encoding: 'utf8'}).trim();
    // A dirty source tree cannot truthfully be represented by its HEAD.
    const dirty = cp.execFileSync('git', ['status', '--porcelain', '--untracked-files=all', '--', '.', ':!docs/art-factory/ledger.json'], {cwd: ROOT, encoding: 'utf8'});
    if(dirty.trim()) throw Error('El árbol debe estar limpio (excepto el ledger técnico regenerado) para citar HEAD');
    console.log(JSON.stringify(buildHandoff(ROOT, key, entry, {head, branch, kind}), null, 2));
  } catch(e) {console.error(e.message); process.exitCode = 1;}
}
