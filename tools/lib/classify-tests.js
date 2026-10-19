'use strict';
/* Inventario de pruebas con navegador y cómo consiguen su servidor (alimenta docs/quality/ARNES_PRUEBAS.md).
 *   node tools/lib/classify-tests.js            tabla Markdown por clase
 *   node tools/lib/classify-tests.js --json     lo mismo en JSON
 * Heurística por texto (no ejecuta nada): una "prueba candidata" es un .js de tools/ que usa Playwright o el arnés y cuyo nombre
 * parece de prueba/chequeo/auditoría. Clases:
 *   ARNES            usa tools/lib/serve.js: puerto libre, tiempos por entorno, URL externa opcional
 *   PUERTO FIJO      asume un servidor ya levantado en un puerto escrito en el código (SE_BASE_URL con valor por omisión, etc.)
 *   PUERTO FIJO+SPAWN levanta su propio python3 -m http.server pero en un puerto escrito en el código (choca si está ocupado)
 *   SERVIDOR PROPIO  levanta su servidor con puerto derivado/libre (no hay puerto fijo detectado)
 *   OTRO             sin servidor ni puerto detectado
 * Además marca RELAY si la prueba habla con server/relay.js o WebSocket (necesita relay: no corre en un runner sin él). */
const fs = require('node:fs'), path = require('node:path');
const ROOT = path.resolve(__dirname, '../..'), NAME = /^(t_|test|check-|verify|audit|parity|bench|perf|e2e|playtest|functional|online|entry-gate|ability-gate|roster-loading|battlefield|bosque|necro|campaign-gate|hub-integration|competitive|browser-test|training-test|sw-test|cosmetics-test|services|rooms)|(-test|-gate)\.js$/;
function walk(d, out = []) {
  for (const e of fs.readdirSync(d, {withFileTypes: true})) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.name.endsWith('.js')) out.push(p);
  }
  return out;
}
const rows = [];
for (const f of walk(path.join(ROOT, 'tools'))) {
  const name = path.basename(f), s = fs.readFileSync(f, 'utf8');
  if (f.startsWith(path.join(ROOT, 'tools', 'lib') + path.sep)) continue;   // el propio arnés
  const harness = /lib\/serve/.test(s);
  if (!harness && !/require\(['"]playwright['"]\)|playwright/.test(s)) continue;
  if (!NAME.test(name) || /^capture/.test(name)) continue;
  const code = s.split('\n').filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');   // sin comentarios
  const ports = [...new Set([...code.matchAll(/(?:127\.0\.0\.1|localhost):(\d{4,5})/g)].map(m => m[1]).concat([...code.matchAll(/(?:PORT|port)\s*(?:=|:)\s*\+?\(?[^;\n]*?\|\|\s*(\d{4,5})/g)].map(m => m[1])))].sort();
  const spawns = /spawn\(\s*['"`]python3?['"`]/.test(code) || /createServer\(/.test(code) || /\bhttp\.server\b/.test(code);
  const relay = /relay\.js|ws:\/\/|WebSocket/.test(code);
  const env = [...new Set([...code.matchAll(/process\.env\.([A-Z_]*(?:BASE_URL|SITE|PORT|BASE))\b/g)].map(m => m[1]))].sort();
  const cls = harness ? 'ARNES' : ports.length ? (spawns ? 'PUERTO FIJO+SPAWN' : 'PUERTO FIJO') : spawns ? 'SERVIDOR PROPIO' : 'OTRO';
  rows.push({file: path.relative(ROOT, f), cls, ports, env, relay});
}
rows.sort((a, b) => a.cls.localeCompare(b.cls) || a.file.localeCompare(b.file));
if (process.argv.includes('--json')) { console.log(JSON.stringify(rows, null, 1)); process.exit(0); }
const by = {}; for (const r of rows) (by[r.cls] = by[r.cls] || []).push(r);
console.log(`Total: ${rows.length} pruebas candidatas. ` + Object.entries(by).map(([k, v]) => `${k}: ${v.length}`).join(', ') + `. Con relay/WebSocket: ${rows.filter(r => r.relay).length}.\n`);
for (const [k, v] of Object.entries(by)) {
  console.log(`### ${k} (${v.length})\n\n| Prueba | Puertos en el código | Variables de entorno | Relay |\n|---|---|---|---|`);
  for (const r of v) console.log(`| \`${r.file}\` | ${r.ports.join(', ') || '-'} | ${r.env.join(', ') || '-'} | ${r.relay ? 'sí' : ''} |`);
  console.log('');
}
