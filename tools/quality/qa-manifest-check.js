#!/usr/bin/env node
'use strict';
/* Verifica que la clasificación de la batería (tools/quality/qa-manifest.json) diga la verdad. Sin navegador, corre en segundos.
 *   node tools/quality/qa-manifest-check.js
 * Falla (exit 1) si:
 *   1. una prueba de run-all no está en el manifiesto, o el manifiesto nombra una que ya no existe;
 *   2. una prueba o suite no tiene nivel (required | informational | external) o categoría válida;
 *   3. una prueba informational/external no tiene motivo;
 *   4. una categoría no tiene ninguna prueba required (hueco de cobertura);
 *   5. un paso de GitHub Actions usa `continue-on-error: true` sin estar declarado en "tolerated" con motivo, o lo usa sobre una prueba required sin issue;
 *   6. un paso de CI enmascara el resultado con `|| true`, `; true` o `exit 0` (salvo una línea marcada `qa-manifest:ignore`).
 * Es el control contra los "falsos verdes": nada puede fallar en silencio sin quedar escrito y justificado. */
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const M = JSON.parse(fs.readFileSync(path.join(__dirname, 'qa-manifest.json'), 'utf8'));
let bad = 0;
const fail = m => { bad++; console.log('FAIL ' + m); }, ok = m => console.log('PASS ' + m);

const list = cp.execFileSync(process.execPath, [path.join(__dirname, 'run-all.js'), '--list'], { cwd: ROOT }).toString().split('\n').map(l => l.trim().split(/\s+/).pop()).filter(Boolean);
const missing = list.filter(t => !M.tests[t]), stale = Object.keys(M.tests).filter(t => !list.includes(t));
missing.length ? fail('pruebas de run-all sin clasificar: ' + missing.join(', ')) : ok(`las ${list.length} pruebas de run-all están clasificadas`);
stale.length ? fail('el manifiesto nombra pruebas que no existen en run-all: ' + stale.join(', ')) : ok('el manifiesto no tiene pruebas fantasma');
for (const t of Object.keys(M.tests)) if (!fs.existsSync(path.join(ROOT, t))) fail('no existe el archivo ' + t);

const cats = Object.keys(M.categories), entries = [...Object.entries(M.tests), ...Object.entries(M.suites).map(([k, v]) => ['suite:' + k, v])];
const wrong = entries.filter(([k, v]) => !M.tiers.includes(v.tier) || !(v.categories || []).length || (v.categories || []).some(c => !cats.includes(c)));
wrong.length ? fail('nivel o categoría inválidos: ' + wrong.map(e => e[0]).join(', ')) : ok('todas las entradas tienen nivel y categorías válidos');
const noReason = entries.filter(([k, v]) => v.tier !== 'required' && !v.reason);
noReason.length ? fail('sin motivo (informational/external): ' + noReason.map(e => e[0]).join(', ')) : ok('todo lo que no bloquea explica por qué');

for (const c of cats) {
  const n = entries.filter(([k, v]) => v.tier === 'required' && v.categories.includes(c)).length;
  n ? ok(`categoría ${c}: ${n} pruebas obligatorias`) : fail(`categoría ${c}: ninguna prueba obligatoria`);
}

const wdir = path.join(ROOT, '.github/workflows');
const T = M.tolerated || {};
const used = [], deferred = [];
for (const f of fs.readdirSync(wdir).filter(x => /\.ya?ml$/.test(x))) {
  const lines = fs.readFileSync(path.join(wdir, f), 'utf8').split('\n');
  lines.forEach((l, i) => {
    if (/^\s*continue-on-error:\s*true\b/.test(l)) {
      let j = i; while (j > 0 && !/^\s*-\s+(name|uses|run):/.test(lines[j])) j--;
      const nm = (lines[j].match(/name:\s*["']?(.+?)["']?\s*$/) || [])[1] || lines[j].trim();
      const key = f + '::' + nm;
      // Patrón legítimo: el paso tiene `id: X` y un paso posterior exige `steps.X.outcome` = success (la falla se aplaza para juntar diagnósticos).
      const idm = lines.slice(j, j + 6).join('\n').match(/^\s*id:\s*([\w-]+)/m);
      if (idm && lines.join('\n').includes('steps.' + idm[1] + '.outcome')) { deferred.push(key); return; }
      used.push(key);
      const t = T[key];
      if (!t || !t.reason) fail(`continue-on-error sin declarar en tolerated: ${key}`);
      else {
        const run = lines.slice(j, j + 14).join('\n'), m = run.match(/tools\/[\w./-]+\.js/g) || [];
        const req = m.filter(p => M.tests[p] && M.tests[p].tier === 'required');
        if (req.length && !t.issue) fail(`continue-on-error sobre una prueba obligatoria sin issue: ${key}`);
      }
    }
    if (/\|\|\s*true\b|;\s*true\s*$|\bexit 0\b/.test(l) && !/^\s*#/.test(l) && !/qa-manifest:ignore/.test(l)) fail(`${f}:${i + 1} enmascara el resultado: ${l.trim().slice(0, 90)}`);
  });
}
const unusedT = Object.keys(T).filter(k => !used.includes(k));
if (deferred.length) ok(`pasos con falla aplazada (se exige su resultado más adelante, no son falsos verdes): ${deferred.length}`);
unusedT.length ? fail('"tolerated" lista pasos que ya no existen o ya son bloqueantes (borrarlos): ' + unusedT.join(' | ')) : ok(`pasos tolerados declarados: ${used.length}, todos con motivo`);
console.log(bad ? `\n${bad} problema(s)` : '\nOK: la clasificación coincide con la batería y con los workflows');
process.exit(bad ? 1 : 0);
