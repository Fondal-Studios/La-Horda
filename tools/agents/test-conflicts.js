#!/usr/bin/env node
'use strict';
// Prueba del detector de conflictos de contrato con commits sintéticos (índice temporal; no toca el árbol ni las ramas).
const cp = require('node:child_process'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { analyze } = require('./contract-conflicts');
const ROOT = path.resolve(__dirname, '../..');
const git = (args, env) => cp.execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', env: { ...process.env, ...(env || {}) } }).trim();
let fails = 0, n = 0; const check = (name, ok, x) => { n++; console.log((ok ? 'PASS ' : 'FAIL ') + name + (!ok && x ? '  ' + JSON.stringify(x).slice(0, 300) : '')); if (!ok) fails++; };
const base = git(['rev-parse', 'HEAD']);
function commit(files) {
  const idx = path.join(os.tmpdir(), 'cc-idx-' + process.pid + '-' + Math.random().toString(36).slice(2)), env = { GIT_INDEX_FILE: idx };
  try {
    git(['read-tree', base], env);
    for (const [f, c] of Object.entries(files)) { const blob = cp.execFileSync('git', ['hash-object', '-w', '--stdin'], { cwd: ROOT, input: c, encoding: 'utf8' }).trim(); git(['update-index', '--add', '--cacheinfo', `100644,${blob},${f}`], env); }
    return git(['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit-tree', git(['write-tree'], env), '-p', base, '-m', 's'], env);
  } finally { try { fs.rmSync(idx, { force: true }); } catch (e) {} }
}
const B = (name, files) => ({ name, head: commit(files) });
const econ = B('claude/s1-economia-a', { 'server/wallet.js': '// a\n' });
const pers = B('claude/s2-persistencia-b', { 'js/storage/save.js': '// b\n' });
const ui = B('claude/s4-ui-c', { 'js/ui/hud.js': '// c\n' });
let r = analyze(base, [econ, pers, ui]);
check('tres ramas con archivos distintos y sin contratos: todas pueden seguir', Object.keys(r.heldContracts).length === 0 && Object.keys(r.clashes).length === 0 && r.proceed.length === 3, r);
const c1 = B('claude/contrato-eventos-a', { 'contracts/v1/skill-event.schema.json': '{"a":1}\n' });
const c2 = B('claude/contrato-eventos-b', { 'contracts/v1/skill-event.schema.json': '{"b":2}\n' });
const ui2 = B('claude/s4-ui-menus', { 'js/ui/menus.js': '// m\n' });
r = analyze(base, [econ, c1, c2, ui2]);
check('dos ramas que cambian el mismo contrato (SkillEvent) => HOLD solo de SkillEvent', Object.keys(r.heldContracts).join() === 'SkillEvent' && r.heldContracts.SkillEvent.length === 2, r.heldContracts);
check('las ramas que no tocan ese contrato siguen (economía y otra de UI)', r.proceed.includes('claude/s1-economia-a') && r.proceed.includes('claude/s4-ui-menus') && !r.proceed.includes('claude/contrato-eventos-a'), r.proceed);
r = analyze(base, [econ, c1, c2, ui]);
check('una rama que cambia el PRODUCTOR del contrato en disputa (js/ui/hud.js) también espera, pero solo ella y las del contrato', r.heldContracts.SkillEvent.includes('claude/s4-ui-c') && r.proceed.join() === 'claude/s1-economia-a', r);
const c3 = B('claude/contrato-consent', { 'contracts/v1/telemetry-consent.schema.json': '{"c":3}\n' });
r = analyze(base, [c1, c3]);
check('dos contratos DISTINTOS en dos ramas no se retienen entre sí', Object.keys(r.heldContracts).length === 0 && r.proceed.length === 2, r);
const star = B('claude/contrato-nucleo', { 'contracts/v1/index.js': '// n\n' });
r = analyze(base, [star, c3]);
check('tocar el núcleo (index.js) retiene también a quien toca un contrato', Object.keys(r.heldContracts).length >= 1 && r.blocked.length === 2, r);
const p1 = B('claude/s1-economia-x', { 'server/wallet.js': '// x\n' }), p2 = B('claude/s3-telemetria-y', { 'server/wallet.js': '// y\n' });
r = analyze(base, [p1, p2, pers]);
check('dos ramas que tocan el mismo archivo => CHOQUE y solo ellas se detienen', Object.keys(r.clashes).join() === 'server/wallet.js' && r.proceed.join() === 'claude/s2-persistencia-b', r);
const prod = B('claude/s2-persistencia-z', { 'server/accounts.js': '// z\n' });
r = analyze(base, [prod, econ]);
check('tocar el productor de un contrato (PlayerProfile -> accounts.js) cuenta como tocar ese contrato', r.info.find(i => i.branch === prod.name).contracts.includes('PlayerProfile'), r.info);
r = analyze(base, [econ]);
check('una sola rama nunca está en disputa', r.proceed.length === 1 && Object.keys(r.heldContracts).length === 0);
console.log(`\n${fails ? 'FALLÓ' : 'OK'}: ${n - fails}/${n} comprobaciones`);
process.exit(fails ? 1 : 0);
