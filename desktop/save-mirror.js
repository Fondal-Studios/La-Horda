'use strict';
/* Espejo del guardado en disco (userData/saves/) para Steam Cloud (Auto-Cloud). Sin dependencias de Electron: lo prueba
 * desktop/test-stage.mjs con Node.
 *
 * localStorage (origen app://lahorda) SIGUE SIENDO la fuente de verdad del juego. Este módulo solo:
 *   - ESCRIBE una copia por clave en <dir>/<clave>.json, de forma ATÓMICA: archivo temporal + fsync + rename (un corte de luz deja
 *     el archivo anterior o el nuevo, nunca uno a medias) y conserva la versión anterior en <clave>.json.bak.
 *   - DECIDE al arrancar si conviene traer el archivo a localStorage (PC nueva, reinstalación, otra máquina vía Steam Cloud).
 *
 * Cada archivo es un sobre  {v:1, key, rev, savedAt, device, value}  (value = la cadena tal cual de localStorage, o null si el
 * jugador borró esa clave). `rev` es un contador que solo crece: NO se comparan relojes entre máquinas.
 * En localStorage queda una marca por clave {rev, hash} = lo último que este equipo espejó o adoptó.
 *
 * Regla de lectura (decide()), pensada para no pisar nunca datos locales más nuevos:
 *   archivo ausente / ilegible / inválido          -> 'keep'      (se ignora; nunca se adopta un archivo dañado)
 *   archivo.rev <= marca.rev                       -> 'keep'      (lo local es igual o más nuevo)
 *   localStorage vacío para la clave y sin marca   -> 'adopt'     (instalación nueva)
 *   archivo.rev > marca.rev y lo local NO cambió desde la marca (mismo hash) -> 'adopt' (lo local es una copia vieja ya espejada)
 *   archivo.rev > marca.rev y lo local SÍ cambió   -> 'conflict'  (se conserva lo local; el archivo ajeno se guarda aparte en
 *                                                                  <clave>.conflict-<rev>.json para recuperarlo a mano)
 *   archivo con value null (borrado en otra máquina) -> nunca borra lo local: 'keep'
 */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');

const SAVE_KEYS = ['laHordaSave_v1', 'horda_prefs', 'horda_vol', 'horda_mute', 'horda_motion', 'horda_fx', 'horda_name'];
const JSON_KEYS = new Set(['laHordaSave_v1']);            // claves cuyo valor DEBE ser JSON de objeto: si no lo es, no se adopta ni se escribe
const MAX_BYTES = 8 * 1024 * 1024;
const MARK_KEY = 'lahordaDesktopMirror';                  // marca en localStorage: {clave: {rev, hash}}

const hashOf = v => (v == null ? 'null' : crypto.createHash('sha1').update(String(v)).digest('hex'));
const fileOf = (dir, key) => path.join(dir, key + '.json');

function validValue(key, value) {
  if (value === null) return true;
  if (typeof value !== 'string' || Buffer.byteLength(value) > MAX_BYTES) return false;
  if (JSON_KEYS.has(key)) { try { const o = JSON.parse(value); return !!o && typeof o === 'object' && !Array.isArray(o); } catch (e) { return false; } }
  return true;
}
function readEnvelope(dir, key) {
  if (!SAVE_KEYS.includes(key)) return null;
  let raw; try { raw = fs.readFileSync(fileOf(dir, key), 'utf8'); } catch (e) { return null; }
  let env; try { env = JSON.parse(raw); } catch (e) { return null; }
  if (!env || env.v !== 1 || env.key !== key || !Number.isInteger(env.rev) || env.rev < 1 || !validValue(key, env.value)) return null;
  return env;
}
// Escritura atómica. baseRev = la revisión que el llamador cree tener; la nueva es mayor que esa y que la del archivo.
function writeEnvelope(dir, key, value, baseRev, device) {
  if (!SAVE_KEYS.includes(key)) throw new Error('clave no permitida: ' + key);
  if (!validValue(key, value)) throw new Error('valor inválido para ' + key + ' (no se escribe)');
  fs.mkdirSync(dir, {recursive: true});
  const f = fileOf(dir, key), cur = readEnvelope(dir, key);
  const rev = Math.max(cur ? cur.rev : 0, Number.isInteger(baseRev) ? baseRev : 0) + 1;
  const body = JSON.stringify({v: 1, key, rev, savedAt: new Date().toISOString(), device: String(device || ''), value});
  const tmp = f + '.' + process.pid + '.tmp';
  const fd = fs.openSync(tmp, 'w');
  try { fs.writeSync(fd, body); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  try { JSON.parse(fs.readFileSync(tmp, 'utf8')); } catch (e) { try { fs.unlinkSync(tmp); } catch (e2) {} throw new Error('verificación del temporal falló'); }
  if (cur) { try { fs.copyFileSync(f, f + '.bak'); } catch (e) {} }   // solo se respalda un archivo que se pudo leer bien
  fs.renameSync(tmp, f);
  return {rev, hash: hashOf(value)};
}
function decide(env, localValue, mark, opts) {
  const mrev = mark && Number.isInteger(mark.rev) ? mark.rev : 0;
  if (!env) return 'keep';
  // El guardado local NO se puede leer (JSON dañado) y el archivo del disco sí: manda el archivo (el juego, al no poder leer lo local, arrancaría
  // como perfil nuevo y rotaría la buena copia del disco). El valor local dañado se conserva aparte (preload.js: *_antesDeEspejo).
  if (opts && opts.localCorrupt && env.value !== null) return 'adopt';
  if (env.rev <= mrev) return 'keep';
  if (env.value === null) return 'keep';
  if (localValue == null) return mrev === 0 || (mark && mark.hash === 'null') ? 'adopt' : 'keep';   // borrado local aún sin espejar: manda lo local
  if (mark && mark.hash === hashOf(localValue)) return 'adopt';
  if (hashOf(localValue) === hashOf(env.value)) return 'adopt';                                      // mismo contenido: solo se actualiza la marca
  return 'conflict';
}
// Plan de arranque para todas las claves. locals = {clave: cadena|null}, marks = {clave: {rev, hash}}.
// Devuelve {set: {clave: valor}, marks: {...}, conflicts: [claves]}; guarda aparte los archivos en conflicto.
function startupPlan(dir, locals, marks) {
  const out = {set: {}, marks: Object.assign({}, marks || {}), conflicts: []};
  for (const key of SAVE_KEYS) {
    const env = readEnvelope(dir, key), local = locals && locals[key] != null ? String(locals[key]) : null, mark = out.marks[key];
    let corrupt = false;
    if (key === SAVE_KEYS[0] && local !== null) { try { JSON.parse(local); } catch (e) { corrupt = true; } }
    const d = decide(env, local, mark, {localCorrupt: corrupt});
    if (d === 'adopt') { out.set[key] = env.value; out.marks[key] = {rev: env.rev, hash: hashOf(env.value)}; }
    else if (d === 'conflict') {
      out.conflicts.push(key);
      try { fs.copyFileSync(fileOf(dir, key), path.join(dir, key + '.conflict-' + env.rev + '.json')); } catch (e) {}
      out.marks[key] = {rev: env.rev, hash: mark ? mark.hash : ''};   // la próxima escritura local queda por encima del archivo ajeno
    }
  }
  return out;
}

module.exports = {SAVE_KEYS, MARK_KEY, MAX_BYTES, hashOf, validValue, readEnvelope, writeEnvelope, decide, startupPlan};
