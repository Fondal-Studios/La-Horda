#!/usr/bin/env node
'use strict';
/* Informe legible de una corrida de run-all (resumen.json + logs) cruzado con la clasificación (qa-manifest.json).
 *   node tools/quality/qa-report.js <carpeta-de-run-all> [--out informe] [--sha <sha>] [--suite nombre=PASS|FAIL|SKIP ...]
 * Escribe <out>.md y <out>.json con: veredicto, fallos y flaky, matriz por categoría, pruebas sin aserciones (posibles falsos verdes),
 * pruebas más lentas, métricas de rendimiento (líneas PERF de los logs) y cobertura de la clasificación. El veredicto es FAIL si falla
 * una prueba obligatoria; una informativa o externa se informa pero no cambia el veredicto. Exit 1 si el veredicto es FAIL. */
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const argv = process.argv.slice(2), opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const dir = argv.find(a => !a.startsWith('--') && fs.existsSync(a) && fs.statSync(a).isDirectory());
if (!dir) { console.error('uso: qa-report.js <carpeta-de-run-all> [--out informe] [--sha SHA] [--suite nombre=PASS|FAIL|SKIP]'); process.exit(2); }
const M = JSON.parse(fs.readFileSync(path.join(__dirname, 'qa-manifest.json'), 'utf8'));
const R = JSON.parse(fs.readFileSync(path.join(dir, 'resumen.json'), 'utf8'));
const suites = argv.flatMap((a, i) => a === '--suite' ? [argv[i + 1]] : []).map(s => s.split('=')).map(([k, v]) => ({ id: k, status: v }));
const sha = opt('--sha') || (() => { try { return cp.execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim(); } catch (e) { return 'desconocido'; } })();
const out = opt('--out', path.join(dir, 'informe'));
const tierOf = f => (M.tests[f] || { tier: 'required' }).tier;
const rows = R.map(r => ({ f: r.f, status: r.status, secs: r.secs, passes: r.passes, fails: r.fails || [], retryFails: r.retryFails || [], tier: tierOf(r.f), categories: (M.tests[r.f] || {}).categories || [], reason: (M.tests[r.f] || {}).reason || '' }));
const failing = rows.filter(r => r.status === 'FAIL'), flaky = rows.filter(r => r.status === 'FLAKY');
const blocking = failing.filter(r => r.tier === 'required'), suiteBlocking = suites.filter(s => s.status === 'FAIL' && (M.suites[s.id] || { tier: 'required' }).tier === 'required');
const verdict = blocking.length || suiteBlocking.length ? 'FAIL' : 'PASS';
const perf = [];
for (const r of R) { try { for (const l of fs.readFileSync(r.logFile, 'utf8').split('\n')) if (l.startsWith('PERF ')) perf.push({ test: r.f, ...JSON.parse(l.slice(5)) }); } catch (e) {} }
const cats = Object.keys(M.categories).map(c => {
  const rs = rows.filter(r => r.categories.includes(c) && r.tier === 'required');
  return { c, doc: M.categories[c], n: rs.length, pass: rs.filter(r => r.status === 'PASS').length, flaky: rs.filter(r => r.status === 'FLAKY').length, fail: rs.filter(r => r.status === 'FAIL').length };
});
const silent = rows.filter(r => r.status === 'PASS' && !r.passes);
const slow = [...rows].sort((a, b) => b.secs - a.secs).slice(0, 10);
const J = { verdict, sha, generated: new Date().toISOString(), totals: { tests: rows.length, pass: rows.filter(r => r.status === 'PASS').length, flaky: flaky.length, fail: failing.length, blockingFail: blocking.length }, suites, categories: cats, failing, flaky, silent: silent.map(r => r.f), slowest: slow.map(r => ({ f: r.f, secs: r.secs })), perf, classification: { classified: Object.keys(M.tests).length, byTier: ['required', 'informational', 'external'].map(t => ({ tier: t, tests: rows.filter(r => r.tier === t).length })) } };
fs.writeFileSync(out + '.json', JSON.stringify(J, null, 1));
const L = [];
L.push(`# Informe de calidad — ${verdict === 'PASS' ? 'APROBADO' : 'RECHAZADO'}`, '', `Compilación \`${sha.slice(0, 8)}\` · ${J.generated} · ${rows.length} pruebas: **${J.totals.pass} PASS · ${flaky.length} FLAKY · ${failing.length} FAIL** (${blocking.length} obligatorias en rojo).`, '');
if (suites.length) L.push('## Suites aparte', '', '| Suite | Nivel | Resultado |', '|---|---|---|', ...suites.map(s => `| ${s.id} | ${(M.suites[s.id] || {}).tier || '?'} | ${s.status} |`), '');
L.push('## Cobertura por categoría (pruebas obligatorias)', '', '| Categoría | Qué cubre | Obligatorias | PASS | FLAKY | FAIL |', '|---|---|---|---|---|---|', ...cats.map(c => `| ${c.c} | ${c.doc} | ${c.n} | ${c.pass} | ${c.flaky} | ${c.fail} |`), '');
if (failing.length) L.push('## Fallos', '', ...failing.flatMap(r => [`- **${r.f}** (${r.tier}${r.reason ? ': ' + r.reason : ''})`, ...(r.retryFails.length ? r.retryFails : r.fails).slice(0, 5).map(x => '  - ' + x.slice(0, 220))]), '');
if (flaky.length) L.push('## Intermitentes (fallaron y pasaron al reintentar)', '', ...flaky.map(r => `- ${r.f} (${r.tier}): ${r.fails.slice(0, 2).join(' | ').slice(0, 220) || 'ver log'}`), '');
if (perf.length) L.push('## Rendimiento', '', '| Prueba | Cuadros | Enemigos | p50 ms | p95 ms | máx ms |', '|---|---|---|---|---|---|', ...perf.map(p => `| ${p.test} | ${p.frames} | ${p.foes} | ${p.p50} | ${p.p95} | ${p.max} |`), '', 'Guarda de regresión en un navegador sin GPU; no es una promesa de FPS en dispositivos reales.', '');
if (silent.length) L.push('## Posibles falsos verdes (pasaron sin imprimir ninguna aserción PASS)', '', ...silent.map(r => `- ${r.f}`), '');
L.push('## Las 10 pruebas más lentas', '', ...slow.map(r => `- ${r.secs}s ${r.f}`), '');
L.push('## Clasificación', '', ...J.classification.byTier.map(t => `- ${t.tier}: ${t.tests} pruebas`), '');
fs.writeFileSync(out + '.md', L.join('\n'));
console.log(`[qa-report] ${verdict} · ${out}.md · ${out}.json`);
process.exit(verdict === 'FAIL' ? 1 : 0);
