#!/usr/bin/env node
'use strict';
// EVALUADOR DE PR para la integración: aísla el candidato en un worktree, simula la fusión sobre la base actual, aplica las reglas
// del arquitecto del juego, corre la QA rápida y las pruebas que el propio PR añade, y emite evidencia + veredicto técnico.
//   node tools/factory/pr-evaluator.js eval <rama> [--id=261] [--base=HEAD] [--keep]
// Veredictos: CONFLICTO (requiere resolución manual con evidencia), RECHAZAR (bloqueo del arquitecto o regresión), 
// ACEPTAR_TECNICO (fusiona, sin regresión, con pruebas verdes). "Es una mejora" es un juicio adicional: se registra en `improvement`
// (evidencia manual: capturas comparadas, métricas) y sin él la decisión final no pasa de ACEPTAR_TECNICO.
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), {spawnSync} = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const run = (cwd, cmd, args, o = {}) => spawnSync(cmd, args, {cwd, encoding: 'utf8', maxBuffer: 1 << 28, timeout: o.timeout || 600000});
const arg = (n, d) => { const a = process.argv.find(x => x.startsWith('--' + n + '=')); return a ? a.slice(n.length + 3) : d; };
function evaluate(branch, id, baseRef) {
  const g = (...a) => run(ROOT, 'git', a), ref = 'origin/' + branch, base = g('rev-parse', baseRef).stdout.trim();
  const res = {id, branch, base, evaluatedAt: new Date().toISOString(), steps: {}};
  const arch = require('./architect-game').analyze(ref, base); res.steps.architect = {verdict: arch.verdict, findings: arch.findings, files: arch.files, categories: arch.categories};
  const wt = path.join(os.tmpdir(), 'eval-wt-' + (id || branch.replace(/\W/g, '_')));
  run(ROOT, 'git', ['worktree', 'remove', '--force', wt]); fs.rmSync(wt, {recursive: true, force: true});
  g('worktree', 'add', '--detach', wt, base);
  const m = run(wt, 'git', ['merge', '--no-commit', '--no-ff', ref]);
  const conflicts = run(wt, 'git', ['diff', '--name-only', '--diff-filter=U']).stdout.split('\n').filter(Boolean);
  res.steps.merge = {clean: m.status === 0, conflicts, worktree: wt};
  if (m.status !== 0 && conflicts.length) { res.verdict = 'CONFLICTO'; return res; }
  run(wt, 'git', ['commit', '-q', '--no-edit']);
  const changed = run(wt, 'git', ['diff', '--name-only', base + '..HEAD']).stdout.split('\n').filter(Boolean);
  res.steps.diff = {files: changed.length, art: changed.filter(f => /^(assets|art-source)\//.test(f)).length, shortstat: run(wt, 'git', ['diff', '--shortstat', base + '..HEAD']).stdout.trim()};
  if (fs.existsSync(path.join(wt, 'server/package.json'))) run(wt, 'npm', ['ci', '--no-audit', '--no-fund', '--prefix', 'server'], {timeout: 300000});
  const qa = run(wt, 'node', ['tools/quality/qa.js', '--quick'], {timeout: 1500000});
  let info = null; try { info = JSON.parse(fs.readFileSync(path.join(wt, 'qa-out/informe.json'), 'utf8')); } catch (e) {}
  res.steps.qaQuick = {exit: qa.status, summary: (qa.stdout.match(/PASS \d+ +FLAKY \d+ +FAIL \d+ +\(de \d+\)/) || [null])[0], failed: (qa.stdout.match(/^FAIL .*$/gm) || []).slice(0, 10)};
  const own = changed.filter(f => /(^|\/)(t_[^/]+|test[^/]*|[^/]*\.test)\.js$/.test(f) && fs.existsSync(path.join(wt, f)));
  res.steps.ownTests = own.slice(0, 8).map(f => { const r = run(wt, 'node', ['tools/lib/with-site.js', f], {timeout: 420000}); return {file: f, exit: r.status}; });
  const bad = res.steps.ownTests.filter(t => t.exit !== 0);
  res.verdict = arch.verdict === 'BLOCKED' ? 'RECHAZAR' : (qa.status !== 0 || bad.length) ? 'RECHAZAR' : 'ACEPTAR_TECNICO';
  res.improvement = null; // a completar con evidencia manual (capturas, métricas) antes de integrar
  return res;
}
module.exports = {evaluate};
if (require.main === module) {
  const [cmd, branch] = process.argv.slice(2);
  try {
    if (cmd !== 'eval' || !branch) throw Error('Uso: pr-evaluator.js eval <rama> [--id=N] [--base=HEAD]');
    const id = arg('id', null), r = evaluate(branch, id, arg('base', 'HEAD'));
    const out = path.join(ROOT, 'docs/beta/pr-evaluations'); fs.mkdirSync(out, {recursive: true});
    fs.writeFileSync(path.join(out, (id || branch.replace(/\W/g, '_')) + '.json'), JSON.stringify(r, null, 1) + '\n');
    console.log(JSON.stringify({id, branch, verdict: r.verdict, conflicts: r.steps.merge.conflicts.length, qa: r.steps.qaQuick && r.steps.qaQuick.summary, ownTests: (r.steps.ownTests || []).map(t => t.exit)}));
    if (!process.argv.includes('--keep') && r.steps.merge.clean) run(ROOT, 'git', ['worktree', 'remove', '--force', r.steps.merge.worktree]);
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
