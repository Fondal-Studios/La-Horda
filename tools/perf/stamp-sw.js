#!/usr/bin/env node
// Estampa el service worker (sw.js) de una carpeta YA LISTA PARA PUBLICAR (p. ej. dist/ de tools/build-static.mjs):
// escribe sw-manifest.json (ruta -> hash del contenido de cada archivo) y fija BUILD y CRITICAL en sw.js.
// Sin este paso sw.js no hace nada (BUILD = null). Correr DESPUÉS de cualquier reescritura de archivos (net-config,
// empaquetado de tools/perf/bundle.js), porque el hash se calcula sobre lo que realmente se publica.
//   node tools/perf/stamp-sw.js <carpeta>
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const root = path.resolve(process.argv[2] || 'dist');
if (!fs.existsSync(path.join(root, 'sw.js'))) throw new Error('falta sw.js en ' + root);
const SKIP = new Set(['sw.js', 'sw-manifest.json', 'deployment.json']);
const files = {};
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name), r = path.relative(root, f).split(path.sep).join('/');
    if (e.isDirectory()) walk(f);
    else if (!SKIP.has(r) && !r.endsWith('.map')) files[r] = crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex').slice(0, 12);
  }
})(root);
const build = crypto.createHash('sha1').update(JSON.stringify(Object.entries(files).sort())).digest('hex').slice(0, 12);
// lo crítico: la página y lo que carga de entrada (scripts, hojas de estilo, fuentes, íconos, manifest)
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const crit = new Set(['index.html']);
for (const m of html.matchAll(/<(?:script|link)\b[^>]*?(?:src|href)="([^"#?]+)"/g)) if (files[m[1]]) crit.add(m[1]);
const sorted = Object.fromEntries(Object.entries(files).sort());
fs.writeFileSync(path.join(root, 'sw-manifest.json'), JSON.stringify({ build, files: sorted }));
let sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
sw = sw.replace(/const BUILD = [^;]*;/, 'const BUILD = ' + JSON.stringify(build) + ';').replace(/const CRITICAL = [^;]*;/, 'const CRITICAL = ' + JSON.stringify([...crit]) + ';');
fs.writeFileSync(path.join(root, 'sw.js'), sw);
console.log(`sw estampado: build ${build}, ${Object.keys(files).length} archivos en el manifiesto, ${crit.size} críticos`);
