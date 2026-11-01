#!/usr/bin/env node
'use strict';
/* PIPELINE CENTRAL DE REGRESIÓN. Un solo comando para local y para CI:
 *   node tools/quality/qa.js --quick     clasificación + contratos + lógica pura y rápidas (minutos)
 *   node tools/quality/qa.js --fast      todo menos lo más lento (para cada PR)
 *   node tools/quality/qa.js --full       toda la batería (nocturno / antes de una beta)
 * Opciones: --out carpeta (por omisión qa-out/) · --jobs N · --skip-server (no corre la batería de server/) · --skip-install.
 * Orden: 1) clasificación vs batería y workflows (qa-manifest-check) · 2) batería de server/ (incluye el relay en proceso y la economía) ·
 * 3) run-all (incluye contratos, puerta de propiedad y humo del relay local) · 4) densidad de píxel (informativa) · 5) informe (qa-report). Sale 1 si falla algo OBLIGATORIO.
 * No toca producción ni usa red: el relay real y la base real son del nivel "external" y se corren aparte (docs/operacion/).
 * IMPORTANTE: no edites archivos del repositorio mientras corre: run-all restaura/borra al terminar lo que cambió durante su corrida. */
const cp = require('node:child_process'), fs = require('node:fs'), path = require('node:path');
const ROOT = path.resolve(__dirname, '../..');
const a = process.argv.slice(2), has = k => a.includes(k), val = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const mode = has('--quick') ? '--quick' : has('--full') ? '' : '--fast';
const out = path.resolve(val('--out', path.join(ROOT, 'qa-out'))); fs.mkdirSync(out, { recursive: true });
const jobs = val('--jobs', '2');
const M = JSON.parse(fs.readFileSync(path.join(__dirname, 'qa-manifest.json'), 'utf8'));
const results = [];
function step(id, cmd, args, o = {}) {
  const t0 = Date.now(); console.log(`\n=== ${id}: ${cmd} ${args.join(' ')}`);
  const r = cp.spawnSync(cmd, args, { cwd: o.cwd || ROOT, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', maxBuffer: 1 << 28, env: { ...process.env, ...(o.env || {}) } });
  fs.writeFileSync(path.join(out, id + '.log'), (r.stdout || '') + (r.stderr || ''));
  const st = r.status === 0 ? 'PASS' : 'FAIL'; console.log(`${st} ${id} (${Math.round((Date.now() - t0) / 1000)}s)`);
  if (st === 'FAIL') console.log((r.stdout || '').split('\n').filter(l => /FAIL|Error|error/.test(l)).slice(0, 8).join('\n'));
  results.push({ id, status: st }); return r.status === 0;
}
step('clasificacion', process.execPath, ['tools/quality/qa-manifest-check.js']);
// Las dependencias de server/ las necesitan los contratos, el humo del relay y la batería de servidor.
if (!has('--skip-install')) step('server-install', 'npm', ['ci', '--no-audit', '--no-fund'], { cwd: path.join(ROOT, 'server') });
if (!has('--skip-server')) step('server', 'npm', ['test'], { cwd: path.join(ROOT, 'server') });
const runOut = path.join(out, 'run-all');
const ra = cp.spawnSync(process.execPath, ['tools/quality/run-all.js', ...(mode ? [mode] : []), '--jobs', jobs, '--out', runOut], { cwd: ROOT, stdio: 'inherit' });
console.log(`run-all: código ${ra.status}`);
if (!has('--quick')) {
  const t = cp.spawnSync(process.execPath, ['tools/art/pixel-density.js', '--strict'], { cwd: ROOT, encoding: 'utf8' });
  fs.writeFileSync(path.join(out, 'pixel-density.log'), (t.stdout || '') + (t.stderr || ''));
  results.push({ id: 'pixel-density', status: t.status === 0 ? 'PASS' : 'FAIL' });
}
if (!fs.existsSync(path.join(runOut, 'resumen.json'))) { console.error('run-all no produjo resumen.json'); process.exit(2); }
const sa = results.filter(r => ['server', 'pixel-density'].includes(r.id)).flatMap(r => ['--suite', `${r.id}=${r.status}`]);
const rep = cp.spawnSync(process.execPath, ['tools/quality/qa-report.js', runOut, '--out', path.join(out, 'informe'), ...sa], { cwd: ROOT, stdio: 'inherit' });
const clasif = results.find(r => r.id === 'clasificacion').status === 'FAIL';
console.log('\n' + results.map(r => `${r.status} ${r.id}`).join('\n'));
process.exit(rep.status || clasif ? 1 : 0);
