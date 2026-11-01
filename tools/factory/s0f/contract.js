'use strict';
// Lee el CONTRATO REAL de un campeón desde el motor (no asume 36 poses): atlas, celda, columnas, clips y anclaje.
const fs = require('node:fs'), path = require('node:path');
const ROOT = path.resolve(__dirname, '../../..');
function pngSize(file) { const b = fs.readFileSync(file); if (b.toString('latin1', 1, 4) !== 'PNG') throw Error('no es PNG: ' + file); return {w: b.readUInt32BE(16), h: b.readUInt32BE(20)}; }
function readContract(id) {
  if (!/^[a-z][a-z0-9_]*$/.test(id)) throw Error('id inválido');
  const dir = path.join(ROOT, 'js/assets'); let found = null;
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.js'))) {
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    const re = new RegExp('^[ \\t]*champPackLoadAtlas\\("' + id + '",\\s*"([^"]+)",\\s*(\\{[^\\n]+\\})\\);', 'gm'); const m = [...src.matchAll(re)];
    if (m.length > 1) throw Error('contrato ambiguo: varias registraciones de ' + id);
    if (m.length === 1) { found = {src: m[0][1], meta: JSON.parse(m[0][2]), file: 'js/assets/' + f}; break; }
  }
  if (!found) return {id, kind: 'unsupported', reason: 'sin champPackLoadAtlas literal: el campeón usa cuadros sueltos u otro contrato (p. ej. Libertador); la fábrica NO asume la grilla de 36 poses'};
  const atlas = path.join(ROOT, found.src); if (!fs.existsSync(atlas)) return {id, kind: 'unsupported', reason: 'el atlas registrado no existe: ' + found.src};
  const {w: W, h: H} = pngSize(atlas), m = found.meta;
  if (W !== m.w * m.cols || H % m.h) return {id, kind: 'unsupported', reason: `dimensiones ${W}x${H} no coinciden con celda ${m.w}x${m.h} x ${m.cols} columnas`};
  const rows = H / m.h, frames = m.cols * rows, clips = {};
  for (const [name, arr] of Object.entries(m.sets || {})) clips[name] = {frames: arr, unique: [...new Set(arr.filter(n => n >= 0))], mirrored: arr.some(n => n < 0)};
  return {id, kind: 'atlas', atlas: found.src, registeredIn: found.file, cell: {w: m.w, h: m.h}, cols: m.cols, rows, frames, refH: m.refH, anchor: m.anchor, fix: m.fix || null, clips,
    codexPage: fs.existsSync(path.join(ROOT, 'assets/ui/codex/champions', id + '.png')) ? 'assets/ui/codex/champions/' + id + '.png' : null,
    consumer: found.file};
}
module.exports = {readContract, ROOT, pngSize};
if (require.main === module) { console.log(JSON.stringify(readContract(process.argv[2] || 'cazadora'), null, 1).slice(0, 2500)); }
