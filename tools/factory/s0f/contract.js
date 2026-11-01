'use strict';
// Strict literal contracts only. Never evaluate source expressions or guess another champion's geometry.
const fs = require('node:fs'), path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '../../..');
const signature = Buffer.from('89504e470d0a1a0a', 'hex');
function pngSize(file) {
  const b = fs.readFileSync(file);
  if (b.length < 33 || !b.subarray(0, 8).equals(signature) || b.readUInt32BE(8) !== 13 || b.toString('ascii', 12, 16) !== 'IHDR') throw Error('cabecera PNG inválida');
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  if (!w || !h || w > 32768 || h > 32768 || w * h > 67108864) throw Error('dimensiones PNG fuera del límite seguro');
  return {w, h};
}
function confined(root, relative, prefix) {
  if (typeof relative !== 'string' || relative.includes('\\') || relative.includes('\0') || path.posix.normalize(relative) !== relative || !relative.startsWith(prefix + '/') || path.isAbsolute(relative)) throw Error('ruta de asset no canónica o fuera de su directorio');
  const absolute = path.resolve(root, relative);
  if (!absolute.startsWith(root + path.sep)) throw Error('ruta fuera del repositorio');
  if (!fs.existsSync(absolute)) throw Error('archivo registrado no existe: ' + relative);
  if (!fs.statSync(absolute).isFile() || fs.realpathSync(absolute) !== absolute) throw Error('archivo no regular o ruta simbólica: ' + relative);
  return absolute;
}
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
function readContract(id, {root = ROOT, skin = null} = {}) {
  if (!/^[a-z][a-z0-9_]*$/.test(id)) throw Error('id inválido');
  root = fs.realpathSync(root);
  const unsupported = reason => ({id, kind: 'unsupported', reason: 'BLOCKED_CONTRACT: ' + reason});
  try {
    if (skin !== null && (id !== 'cazadora' || skin !== 'cazadora_escarcha')) return unsupported('contrato de skin no soportado; nunca se usa el atlas base como reemplazo');
    const dir = path.join(root, 'js/assets'), registrations = [];
    // Scan every file before selecting: duplicate registrations across files are ambiguous too.
    for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.js')).sort()) {
      const file = 'js/assets/' + f;
      const src = fs.readFileSync(confined(root, file, 'js/assets'), 'utf8');
      const starts = skin
        ? new RegExp('^[ \\t]*Object\\.assign\\(CROMA_SKINS\\[["\\\']' + skin + '["\\\']\\]\\s*,', 'gm')
        : new RegExp('^[ \\t]*champPackLoadAtlas\\(\\s*["\\\']' + id + '["\\\']\\s*,', 'gm');
      for (const match of src.matchAll(starts)) {
        const line = src.slice(match.index).split(/\r?\n/, 1)[0];
        const literal = skin ? line.match(/^\s*Object\.assign\(CROMA_SKINS\["[^"]+"\],\s*(.*)\);\s*(?:\/\/.*)?$/) : line.match(/^\s*champPackLoadAtlas\((.*)\);\s*(?:\/\/.*)?$/);
        registrations.push({file, literal: literal && literal[1], sourceSha256: crypto.createHash('sha256').update(src).digest('hex')});
      }
    }
    if (!registrations.length) return unsupported('sin champPackLoadAtlas literal: cuadros sueltos u otro contrato no soportado');
    if (registrations.length !== 1) return unsupported('contrato ambiguo: varias registraciones de ' + id);
    const found = registrations[0];
    if (!found.literal) return unsupported('registro no es literal JSON de una línea');
    let args, skinDefinition;
    try {
      if (skin) {
        skinDefinition = JSON.parse(found.literal);
        if (found.file !== 'js/assets/unique-skins-meta.js' || !object(skinDefinition) || skinDefinition.appearanceType !== 'skin' || skinDefinition.preserveAuthoredArt !== true || !object(skinDefinition.authoredPacks) || Object.keys(skinDefinition.authoredPacks).length !== 1 || !object(skinDefinition.authoredPacks[id])) return unsupported('skin sin contrato authoredPacks exacto');
        const pack = skinDefinition.authoredPacks[id];
        args = [id, pack.src, pack.meta];
      } else args = JSON.parse('[' + found.literal + ']');
    } catch (e) { return unsupported('metadatos no son JSON literal; no se evalúan fórmulas ni código'); }
    if (args.length !== 3 || args[0] !== id || !object(args[2])) return unsupported('registro literal inválido');
    const src = args[1], m = args[2];
    if (skin && !new RegExp('^assets/sprites/champions/' + id + '/skins/' + skin + '/(?:factory-[a-f0-9]{64}/)?atlas\\.png$').test(src)) return unsupported('ruta de skin no coincide con identidad registrada');
    if (Object.keys(m).some(k => !['w', 'h', 'cols', 'refH', 'anchor', 'fix', 'sets', 'frameCount'].includes(k))) return unsupported('metadato no soportado; no se descarta semántica del motor');
    const atlas = confined(root, src, 'assets/sprites/champions');
    if (!src.endsWith('.png')) return unsupported('el atlas registrado debe ser PNG');
    const {w: W, h: H} = pngSize(atlas);
    for (const k of ['w', 'h', 'cols']) if (!Number.isSafeInteger(m[k]) || m[k] <= 0 || m[k] > 32768) return unsupported('geometría inválida: ' + k);
    if (!Number.isFinite(m.refH) || m.refH <= 0 || m.refH > m.h || !Number.isFinite(m.anchor) || m.anchor < 0 || m.anchor > 1) return unsupported('refH/anclaje inválido');
    if (W !== m.w * m.cols || H % m.h) return unsupported(`dimensiones ${W}x${H} no coinciden con celda ${m.w}x${m.h} x ${m.cols} columnas`);
    const rows = H / m.h, frames = m.cols * rows;
    if (!Number.isSafeInteger(frames) || frames > 65536) return unsupported('cantidad de cuadros fuera de límite');
    if (m.frameCount !== undefined && (!Number.isSafeInteger(m.frameCount) || m.frameCount < 1 || m.frameCount > frames)) return unsupported('frameCount inválido');
    if (m.fix !== undefined && (!object(m.fix) || Object.keys(m.fix).some(k => k !== 'left') || (m.fix.left !== undefined && m.fix.left !== 'mirror'))) return unsupported('transformación fix no soportada');
    if (!object(m.sets) || !Object.keys(m.sets).length) return unsupported('clips vacíos o inválidos');
    const clips = {};
    for (const [name, arr] of Object.entries(m.sets)) {
      if (!/^[a-z][a-z0-9_]*$/.test(name) || ['__proto__', 'constructor', 'prototype'].includes(name) || !Array.isArray(arr) || !arr.length || arr.length > 65536) return unsupported('clip inválido: ' + name);
      // Renderer uses ~v for mirrored frames: -1 addresses frame 0, -2 addresses frame 1.
      if (arr.some(n => !Number.isSafeInteger(n) || (n < 0 ? -n - 1 : n) < 0 || (n < 0 ? -n - 1 : n) >= (m.frameCount || frames))) return unsupported('índice de cuadro inválido: ' + name);
      clips[name] = {frames: arr, unique: [...new Set(arr.map(n => n < 0 ? -n - 1 : n))], mirrored: arr.some(n => n < 0)};
    }
    const codex = skin ? 'art-source/unique-skins/' + skin + '.png' : 'assets/ui/codex/champions/' + id + '.png';
    const codexPrefix = skin ? 'art-source/unique-skins' : 'assets/ui/codex/champions';
    const codexPage = fs.existsSync(path.join(root, codex)) ? (confined(root, codex, codexPrefix), codex) : null;
    if (skin && !codexPage) return unsupported('falta referencia original de la skin');
    let skinPreview;
    if (skin) { skinPreview = skinDefinition.preview; confined(root, skinPreview, 'assets/sprites/champions/' + id + '/skins/' + skin); }
    return {id, kind: 'atlas', atlas: src, registeredIn: found.file, cell: {w: m.w, h: m.h}, cols: m.cols, rows, frames, refH: m.refH, anchor: m.anchor, fix: m.fix || null, clips, codexPage, consumer: found.file,
      ...(!skin && id === 'cazadora' ? {referenceCrop: [780, 280, 1740, 640], referenceCrops: {walk_down: [790, 280, 1080, 620]}, referencePreparationVersion: 'directional-v3'} : {}),
      ...(skin ? {skin, consumerType: 'authored-skin', skinPreview, skinTheme: skinDefinition.visualTheme || null} : {}),
      registration: {kind: skin ? 'authored-skin' : 'base', key: skin || id, baseKey: id, source: found.file, meta: m, sourceSha256: found.sourceSha256}};
  } catch (error) { return unsupported(error.message); }
}
module.exports = {readContract, ROOT, pngSize};
if (require.main === module) console.log(JSON.stringify(readContract(process.argv[2] || 'cazadora'), null, 1).slice(0, 2500));
