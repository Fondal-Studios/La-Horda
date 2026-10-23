#!/usr/bin/env node
// EMPAQUETADO OPCIONAL de los <script src> de index.html (no cambia el flujo "sin build": el juego sigue
// corriendo con los ~360 archivos sueltos; esto solo genera una copia para publicar).
//
//   node tools/perf/bundle.js [--root .] [--out <carpeta>] [--html index.bundle.html] [--minify]
//
// Qué hace: agrupa los scripts consecutivos en pocos archivos js/bundle/chunk-N.js y deja index.html con ~25
// pedidos en lugar de ~360. Cada archivo original se ejecuta IGUAL que antes: como un <script> clásico propio
// (inyectado por un cargador mínimo, en orden y de forma síncrona), no concatenado. Así se conserva la semántica
// exacta: cada script con su propio "use strict" (o sin él), su propia declaración de const/let/class en el ámbito
// global compartido, `typeof X` sobre cosas que se definen en un script posterior sigue dando "undefined" (una
// concatenación simple lo convertiría en ReferenceError por la zona muerta temporal) y las funciones no se elevan
// de un archivo a otro. Cada fuente lleva `//# sourceURL=js/...` para que los errores y el depurador sigan
// mostrando el archivo original.
//
// js/net/* (multijugador) NO entra en los paquetes: sus <script> quedan tal cual, en su mismo orden (el build de
// Pages reescribe js/net/net-config.js y net-core.js; correr este paso DESPUÉS de esa reescritura).
// --minify (opcional): requiere esbuild instalado (npm i --no-save esbuild); solo espacios y sintaxis, NUNCA renombra identificadores.
// Medido: JS 5,15 MB -> 3,66 MB, y comprimido (gzip) 1,69 MB -> 1,19 MB.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true); };
const ROOT = path.resolve(arg('root', path.join(__dirname, '../..')));
const OUT = path.resolve(arg('out', ROOT));
const HTML_OUT = arg('html', 'index.bundle.html');
const MINIFY = !!arg('minify', false);
const KEEP_SEPARATE = /^js\/net\//;
const MAX_CHUNK = 900 * 1024; // bytes de fuente por paquete: paquetes parejos para que el primero no demore el resto

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const re = /<script src="([^"]+)"><\/script>/g;
const tags = []; let m;
while ((m = re.exec(html))) tags.push({ src: m[1], start: m.index, end: m.index + m[0].length });
if (!tags.length) throw new Error('index.html sin <script src>');

let _esb = null;
function minify(src, file) {
  if (!_esb) { try { _esb = require('esbuild'); } catch (e) { throw new Error('--minify necesita esbuild: npm i --no-save esbuild (o NODE_PATH a una instalación)'); } }
  // solo espacios y sintaxis equivalente; NO renombra identificadores (los scripts comparten globales por nombre)
  return _esb.transformSync(src, { minifyWhitespace: true, minifySyntax: true, target: 'es2020', legalComments: 'none', sourcefile: file }).code;
}

// Armar tramos: scripts consecutivos empaquetables (los inline entre medio los cortan, los de red también)
const plan = []; // {kind:'bundle', files:[...]} | {kind:'keep', tag}
let cur = null, prevEnd = -1;
for (const t of tags) {
  const between = prevEnd < 0 ? '' : html.slice(prevEnd, t.start);
  const breaks = KEEP_SEPARATE.test(t.src) || /\.\.|^https?:|^\//.test(t.src) || between.trim() !== '' || !fs.existsSync(path.join(ROOT, t.src.split('?')[0]));
  if (breaks) { cur = null; plan.push({ kind: 'keep', tag: t }); }
  else {
    const size = fs.statSync(path.join(ROOT, t.src.split('?')[0])).size;
    if (!cur || cur.size + size > MAX_CHUNK) { cur = { kind: 'bundle', files: [], size: 0, tags: [] }; plan.push(cur); }
    cur.files.push(t.src.split('?')[0]); cur.size += size; cur.tags.push(t);
  }
  prevEnd = t.end;
}

const dirOut = path.join(OUT, 'js/bundle'); fs.mkdirSync(dirOut, { recursive: true });
let n = 0, rawTotal = 0, outTotal = 0;
const replace = []; // [start, end, text]
for (const p of plan) {
  if (p.kind !== 'bundle') continue;
  const items = p.files.map(f => { let s = fs.readFileSync(path.join(ROOT, f), 'utf8'); rawTotal += Buffer.byteLength(s); if (MINIFY) s = minify(s, f); return [f, s]; });
  n++;
  const name = 'chunk-' + String(n).padStart(2, '0') + '.js';
  // el cargador: un <script> clásico por archivo, insertado en orden (se ejecuta al insertarse, antes de seguir)
  const body = '"use strict";(function(F){var h=document.head||document.documentElement;for(var i=0;i<F.length;i++){var s=document.createElement("script");s.text=F[i][1]+"\\n//# sourceURL="+F[i][0];h.appendChild(s);h.removeChild(s);}})(' + JSON.stringify(items) + ');\n';
  fs.writeFileSync(path.join(dirOut, name), body); outTotal += Buffer.byteLength(body);
  p.name = name;
  replace.push([p.tags[0].start, p.tags[p.tags.length - 1].end, '<script src="js/bundle/' + name + '"></script>']);
}
// reemplazo de atrás hacia adelante; los tags intermedios del tramo desaparecen (solo había espacio entre ellos)
let outHtml = html;
for (const [a, b, text] of replace.sort((x, y) => y[0] - x[0])) outHtml = outHtml.slice(0, a) + text + outHtml.slice(b);
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, HTML_OUT), outHtml);
const left = (outHtml.match(/<script src=/g) || []).length;
console.log(`bundle: ${tags.length} <script src> -> ${left} (${n} paquetes + ${left - n} sueltos); fuente ${(rawTotal / 1048576).toFixed(2)} MB -> ${(outTotal / 1048576).toFixed(2)} MB; html: ${path.join(OUT, HTML_OUT)}`);
