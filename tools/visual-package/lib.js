'use strict';
// Contrato VisualPackage v1: DESCRIBE y verifica los paquetes visuales que el motor ya carga con
// champPackLoadAtlas(key, src, meta). No impone cuadrícula: respeta w/h/cols/sets de cada atlas.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), crypto = require('node:crypto');
const cp = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const CONTRACT = 'VisualPackage', VERSION = '1.0.0';
const LIFECYCLE = ['generated', 'technicalValidation', 'visualApproval', 'integrated', 'inGameVerification'];
const STATUS = new Set(['not_recorded', 'pending', 'pass', 'approved', 'rejected', 'n/a']);

function pngInfo(file) {
  const b = fs.readFileSync(file);
  if (b.subarray(1, 4).toString() !== 'PNG') return null;
  return {width: b.readUInt32BE(16), height: b.readUInt32BE(20), sha256: crypto.createHash('sha256').update(b).digest('hex')};
}
function registrationFiles(root = ROOT) {
  // visual-packages.js invoca la función de forma dinámica (activación de candidatos): no es un registro estático.
  return cp.execSync("grep -rl 'champPackLoadAtlas(' js", {cwd: root}).toString().trim().split('\n').filter(f => f !== 'js/assets/visual-packages.js').sort();
}
// Ejecuta cada archivo en un sandbox y captura las llamadas reales (sin reimplementar el parser).
function captureRegistrations(root = ROOT) {
  const out = [];
  for (const f of registrationFiles(root)) {
    let src = fs.readFileSync(path.join(root, f), 'utf8').replace(/function champPackLoadAtlas\s*\(/, 'function __definition(');
    const calls = [];
    const handler = {get: (t, k) => (k === 'then' ? undefined : new Proxy(function () {}, handler)), apply: () => new Proxy(function () {}, handler), construct: () => new Proxy(function () {}, handler)};
    const base = {champPackLoadAtlas: (key, s, meta) => calls.push({key, src: s, meta: JSON.parse(JSON.stringify(meta))}), console, Math, JSON, Object, Array, Set, Map, Number, String};
    const sb = new Proxy(base, {has: () => true, get: (t, k) => (k in t ? t[k] : k === Symbol.unscopables ? undefined : new Proxy(function () {}, handler)), set: (t, k, v) => { t[k] = v; return true; }});
    try { vm.runInContext(src, vm.createContext(sb), {timeout: 3000}); } catch (e) { throw Error(`${f}: ${e.message}`); }
    for (const c of calls) out.push({file: f, ...c});
  }
  return out;
}
function describe(reg, root = ROOT) {
  const m = reg.meta, abs = path.join(root, reg.src), info = fs.existsSync(abs) ? pngInfo(abs) : null;
  const champ = (reg.src.match(/sprites\/champions\/([^/]+)\//) || [])[1] || null;
  const skin = (reg.src.match(/\/skins\/([^/]+)\//) || [])[1] || null;
  const rows = info ? Math.floor(info.height / m.h) : null;
  return {
    id: reg.key, champion: champ, skin, kind: skin || /^skin_/.test(reg.key) ? 'skin' : /_(death|hurt)$/.test(reg.key) ? 'clip' : 'body',
    packageVersion: '1.0.0-legacy', legacy: true, declaredIn: reg.file,
    atlas: info ? {path: reg.src, format: 'png', width: info.width, height: info.height, sha256: info.sha256} : {path: reg.src, missing: true},
    grid: {frameWidth: m.w, frameHeight: m.h, cols: m.cols, rows},
    states: m.sets, pivot: {anchor: m.anchor, footX: m.footX || null}, scale: {referenceHeight: m.refH},
    mirror: m.fix || null, timings: null, attachmentPoints: null,
    lifecycle: Object.fromEntries(LIFECYCLE.map(k => [k, k === 'integrated' ? 'pass' : 'not_recorded'])),
    fallback: null
  };
}
function buildManifest(root = ROOT) {
  const seen = new Map();
  for (const reg of captureRegistrations(root)) seen.set(reg.key, describe(reg, root)); // la última registración es la vigente
  const packages = [...seen.values()].sort((a, b) => a.id.localeCompare(b.id));
  return {contract: CONTRACT, version: VERSION, note: 'Derivado de champPackLoadAtlas. timings/attachmentPoints son null en paquetes legacy: se exigen en candidatos.', packages};
}
function validatePackage(p, root = ROOT, {strict = false} = {}) {
  const e = [];
  const need = (c, msg) => { if (!c) e.push(`${p.id}: ${msg}`); };
  need(/^[a-z][a-z0-9_]*$/.test(p.id || ''), 'id inválido');
  need(p.atlas && !p.atlas.missing, 'atlas inexistente');
  if (p.atlas && !p.atlas.missing) {
    const abs = path.join(root, p.atlas.path);
    need(fs.existsSync(abs), 'archivo no existe');
    const info = fs.existsSync(abs) && pngInfo(abs);
    need(info, 'no es PNG');
    if (info) {
      need(info.sha256 === p.atlas.sha256, 'sha256 distinto del manifiesto (regenerar o reaprobar)');
      need(info.width === p.atlas.width && info.height === p.atlas.height, 'dimensiones distintas del manifiesto');
      const g = p.grid;
      need(g.frameWidth * g.cols <= info.width, `cols×frameWidth (${g.frameWidth * g.cols}) excede el ancho ${info.width}`);
      need(g.frameHeight <= info.height, 'frameHeight excede el alto');
      const cap = g.cols * Math.floor(info.height / g.frameHeight);
      for (const [clip, frames] of Object.entries(p.states || {})) for (const raw of frames) { const f = raw < 0 ? ~raw : raw; /* negativo = espejo por complemento (convención del motor) */ need(Number.isInteger(raw) && f >= 0 && f < cap, `clip ${clip}: cuadro ${raw} fuera de capacidad (${cap})`); }
    }
  }
  need(p.pivot && typeof p.pivot.anchor === 'number' && p.pivot.anchor > 0 && p.pivot.anchor <= 1, 'pivot.anchor debe estar en (0,1]');
  need(p.scale && p.scale.referenceHeight > 0, 'scale.referenceHeight requerido');
  for (const k of LIFECYCLE) need(STATUS.has(p.lifecycle && p.lifecycle[k]), `lifecycle.${k} inválido`);
  if (strict || !p.legacy) { // candidatos y paquetes nuevos
    need(/^\d+\.\d+\.\d+$/.test(p.packageVersion || ''), 'packageVersion semver requerido');
    need(p.champion, 'champion requerido');
    need(p.kind !== 'skin' || p.skin, 'skin requerida para kind=skin');
    need(p.timings && Object.keys(p.timings).length && Object.keys(p.states || {}).every(c => p.timings[c] > 0), 'timings (fps por estado) requeridos');
    need(p.attachmentPoints && p.attachmentPoints.weapon !== undefined && p.attachmentPoints.fx !== undefined, 'attachmentPoints weapon/fx requeridos (null explícito si no aplica)');
    need(p.fallback, 'fallback (id del paquete integrado) requerido');
    const dirs = new Set(Object.keys(p.states || {}).map(k => k.split('_').pop()));
    need(['down', 'up'].every(d => dirs.has(d)) && (dirs.has('side') || dirs.has('left')), 'faltan direcciones down/up/side');
    if (p.lifecycle.visualApproval === 'approved') need(p.lifecycle.technicalValidation === 'pass' && p.review && p.review.reviewer && p.review.evidence, 'aprobación visual exige validación técnica y review{reviewer,evidence}');
    if (p.lifecycle.inGameVerification === 'pass') need(p.lifecycle.integrated === 'pass' && p.lifecycle.visualApproval === 'approved', 'verificación en partida exige integrado y aprobado');
  }
  return e;
}
module.exports = {ROOT, CONTRACT, VERSION, LIFECYCLE, buildManifest, validatePackage, captureRegistrations, pngInfo};
