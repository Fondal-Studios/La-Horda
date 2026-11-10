'use strict';
/* Política de URLs del contenedor de escritorio. Sin dependencias de Electron: la prueba desktop/test-stage.mjs la ejercita con Node.
 *
 *  - ORIGEN FIJO  app://lahorda/  : el guardado vive en localStorage y localStorage depende del origen. Con file:// (origen opaco,
 *    fuentes y fetch bloqueados) o con http://127.0.0.1:PUERTO (el origen cambia con el puerto) el guardado se pierde.
 *  - PARÁMETROS: el juego lee de location.search varios interruptores de desarrollo (?dev=1 nivel 90, ?devxp= XP ×20, ?server= y
 *    ?api= apuntan a otro servidor, ?debug=1 panel de red, ?res=, ?lazy=, ?webp=, ?sw=, ?beta=, mother*...). Desde el paquete solo
 *    pasan los de la LISTA BLANCA; cualquier otro se quita antes de que la página exista (redirección en el protocolo y en
 *    will-navigate). ?dev=1 además está apagado porque "lahorda" no es un host privado (js/storage/save.js, laHordaPrivateHost).
 *  - Archivos: solo dentro de la carpeta del juego (sin "..", sin rutas absolutas, sin bytes nulos).
 */
const path = require('node:path');

const SCHEME = 'app', HOST = 'lahorda', ORIGIN = SCHEME + '://' + HOST, START_URL = ORIGIN + '/index.html';
// Parámetros que el propio juego usa para navegar entre sus pantallas (volver al hub, enlace a una sala de Guerra de Cristales).
const ALLOWED_PARAMS = new Set(['return', 'cw', 'room', 'mode']);

function isGameUrl(u) { try { const x = new URL(u); return x.protocol === SCHEME + ':' && x.host === HOST; } catch (e) { return false; } }

// Devuelve la misma URL sin parámetros fuera de la lista blanca. changed = hubo que quitar algo.
function sanitizeGameUrl(u) {
  const x = new URL(u); let changed = false;
  for (const k of [...x.searchParams.keys()]) if (!ALLOWED_PARAMS.has(k)) { x.searchParams.delete(k); changed = true; }
  if (x.username || x.password) { x.username = ''; x.password = ''; changed = true; }
  return {url: x.toString(), changed};
}

// Qué hacer con una navegación: 'allow' (interna y limpia), 'rewrite' (interna con parámetros prohibidos -> url limpia),
// 'external' (https/mailto: al navegador del sistema) o 'deny' (todo lo demás: file:, javascript:, data:, http:, otros hosts app:).
function classifyNavigation(u) {
  let x; try { x = new URL(u); } catch (e) { return {action: 'deny'}; }
  if (x.protocol === SCHEME + ':') {
    if (x.host !== HOST) return {action: 'deny'};
    const s = sanitizeGameUrl(u); return s.changed ? {action: 'rewrite', url: s.url} : {action: 'allow', url: s.url};
  }
  if (x.protocol === 'https:' || x.protocol === 'mailto:') return {action: 'external', url: x.toString()};
  return {action: 'deny'};
}

// Ruta en disco de un pedido app://lahorda/...; null si se sale de la carpeta del juego.
function resolveGameFile(root, u) {
  let x; try { x = new URL(u); } catch (e) { return null; }
  if (x.protocol !== SCHEME + ':' || x.host !== HOST) return null;
  let p; try { p = decodeURIComponent(x.pathname); } catch (e) { return null; }
  if (p.includes('\0') || p.includes('\\')) return null;
  if (p.endsWith('/')) p += 'index.html';
  const base = path.resolve(root), file = path.resolve(base, '.' + path.posix.normalize('/' + p));
  if (file !== base && !file.startsWith(base + path.sep)) return null;
  return file;
}

// Teclas que el contenedor consume: pantalla completa siempre; en producción además se tragan las de DevTools y recarga.
function keyAction(input, packaged) {
  if (!input || input.type !== 'keyDown') return null;
  const k = String(input.key || '');
  if (k === 'F11' || (k === 'Enter' && input.alt && !input.control && !input.meta)) return 'fullscreen';
  if (!packaged) return null;
  const mod = input.control || input.meta;
  if (k === 'F12' || (mod && input.shift && /^[ijc]$/i.test(k)) || (mod && /^[ru]$/i.test(k)) || k === 'F5') return 'swallow';
  return null;
}

module.exports = {SCHEME, HOST, ORIGIN, START_URL, ALLOWED_PARAMS, isGameUrl, sanitizeGameUrl, classifyNavigation, resolveGameFile, keyAction};
