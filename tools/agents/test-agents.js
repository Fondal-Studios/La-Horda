#!/usr/bin/env node
'use strict';
// Prueba de la puerta de propiedad (tools/agents/check-diff.js) con commits sintéticos: se construyen con un índice temporal, sin tocar el
// árbol de trabajo ni las ramas. Comprueba que cada agente puede tocar lo suyo y que lo ajeno, lo prohibido y el contrato se rechazan.
const cp = require('node:child_process'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { run } = require('./check-diff');
const ROOT = path.resolve(__dirname, '../..');
const git = (args, env) => cp.execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', env: { ...process.env, ...(env || {}) } }).trim();
let fails = 0, n = 0; const check = (name, ok, x) => { n++; console.log((ok ? 'PASS ' : 'FAIL ') + name + (!ok && x ? '  ' + JSON.stringify(x).slice(0, 300) : '')); if (!ok) fails++; };
const base = git(['rev-parse', 'HEAD']);
function commit(files) { // files: { ruta: contenido | null(borrar) }
  const idx = path.join(os.tmpdir(), 'agt-idx-' + process.pid + '-' + Math.random().toString(36).slice(2));
  const env = { GIT_INDEX_FILE: idx };
  try {
    git(['read-tree', base], env);
    for (const [f, c] of Object.entries(files)) {
      if (c === null) { git(['update-index', '--remove', f], env); continue; }
      const blob = cp.execFileSync('git', ['hash-object', '-w', '--stdin'], { cwd: ROOT, input: c, encoding: 'utf8' }).trim();
      git(['update-index', '--add', '--cacheinfo', `100644,${blob},${f}`], env);
    }
    const tree = git(['write-tree'], env);
    return git(['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit-tree', tree, '-p', base, '-m', 'sintetico'], env);
  } finally { try { fs.rmSync(idx, { force: true }); } catch (e) {} }
}
const R = (agent, files, branch) => run({ agent, base, head: commit(files), branch: branch || 'claude/x' });
const has = (r, s) => r.problems.some(p => p.includes(s));

let r = R('A', { 'server/wallet.js': fs.readFileSync(path.join(ROOT, 'server/wallet.js'), 'utf8') + '\n// cambio\n' });
check('A puede tocar server/wallet.js', r.problems.length === 0, r.problems);
r = R('A', { 'server/accounts.js': fs.readFileSync(path.join(ROOT, 'server/accounts.js'), 'utf8') + '\n// cambio\n' });
check('A NO puede tocar server/accounts.js (es de B)', has(r, 'server/accounts.js') && has(r, 'agente B'), r.problems);
r = R('A', { 'server/relay.js': fs.readFileSync(path.join(ROOT, 'server/relay.js'), 'utf8') + '\n// cambio\n' });
check('A NO puede tocar el relay (prohibido para todos)', has(r, 'prohibido para todos'), r.problems);
r = R('C', { 'index.html': fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') + '\n<!-- x -->\n' });
check('C NO puede tocar index.html', has(r, 'prohibido para todos'), r.problems);
r = R('A', { 'contracts/v1/index.js': '// x\n' });
check('A NO puede tocar el contrato fuera de una rama de contrato', has(r, 'contrato'), r.problems);
r = R('B', { 'contracts/v1/migrations.js': fs.readFileSync(path.join(ROOT, 'contracts/v1/migrations.js'), 'utf8') + '\n// m\n' });
check('B SÍ puede tocar contracts/v1/migrations.js', r.problems.length === 0, r.problems);
r = R('B', { 'js/storage/save.js': fs.readFileSync(path.join(ROOT, 'js/storage/save.js'), 'utf8') + '\n// s\n' });
check('B puede tocar js/storage/save.js', r.problems.length === 0, r.problems);
r = R('C', { 'server/game-master.js': fs.readFileSync(path.join(ROOT, 'server/game-master.js'), 'utf8') + '\n// t\n' });
check('C puede tocar server/game-master.js (la restricción al bloque de telemetría la revisa una persona)', r.problems.length === 0, r.problems);
r = R(null, { 'contracts/v1/index.js': fs.readFileSync(path.join(ROOT, 'contracts/v1/index.js'), 'utf8') + '\n// c\n' }, 'claude/contrato-eventos');
check('una rama claude/contrato-… puede tocar contracts/v1', r.applies && r.problems.length === 0, r);
r = R(null, { 'server/wallet.js': '// x\n' }, 'claude/contrato-eventos');
check('una rama de contrato NO puede tocar código de un agente', has(r, 'rama de contrato'), r.problems);
r = R('auto', { 'server/wallet.js': fs.readFileSync(path.join(ROOT, 'server/wallet.js'), 'utf8') + '\n// c\n' }, 'claude/s1-economia-topes');
check('"auto" reconoce al agente A por el prefijo de la rama', r.applies && r.agent === 'A' && r.problems.length === 0, r);
r = R('auto', { 'server/accounts.js': fs.readFileSync(path.join(ROOT, 'server/accounts.js'), 'utf8') + '\n// c\n' }, 'claude/s1-economia-topes');
check('"auto" aplica las reglas de A a una rama claude/s1-economia-… que toca lo de B', has(r, 'agente B'), r.problems);
r = R('auto', { 'README.md': '# x\n' }, 'otra/rama');
check('una rama ajena a los agentes no está sujeta a la puerta', r.applies === false, r);
r = R('D', { 'js/ui/hud.js': fs.readFileSync(path.join(ROOT, 'js/ui/hud.js'), 'utf8') + '\n// d\n' });
check('D puede tocar js/ui/hud.js', r.problems.length === 0, r.problems);
r = R('D', { 'js/ui/legal.js': fs.readFileSync(path.join(ROOT, 'js/ui/legal.js'), 'utf8') + '\n// d\n' });
check('D NO puede tocar js/ui/legal.js (es de C)', has(r, 'js/ui/legal.js') && has(r, 'agente C'), r.problems);
r = R('D', { 'assets/ui/x.txt': 'x\n' });
check('D puede agregar arte bajo assets/', r.problems.length === 0, r.problems);
r = R('A', { 'assets/ui/x.txt': 'x\n' });
check('A NO puede tocar assets/ (es de D)', has(r, 'agente D'), r.problems);
r = R('D', { 'server/accounts.js': '// x\n' });
check('D NO puede tocar el servidor', has(r, 'agente B'), r.problems);
r = R('A', { 'reviews/claude__s1-economia-x.json': '{}\n' });
check('un agente NO puede escribir su propio registro de revisión', has(r, 'prohibido para todos'), r.problems);
r = R(null, { 'reviews/claude__s1-economia-x.json': '{}\n' }, 'review/economia-x');
check('una rama review/… SÍ puede escribir en reviews/', r.applies && r.problems.length === 0, r);
r = R(null, { 'server/wallet.js': '// x\n' }, 'review/economia-x');
check('una rama review/… NO puede modificar código', has(r, 'solo puede escribir en reviews/'), r.problems);
const item = fs.readFileSync(path.join(ROOT, 'server/item-economy-live.js'), 'utf8').replace(/\bproject\b/g, 'proyectar');
r = R('A', { 'server/item-economy-live.js': item });
check('quitar la interfaz congelada project() se detecta', has(r, '"project"'), r.problems);
r = R('A', {});
check('sin cambios no hay problemas', r.problems.length === 0, r.problems);
console.log(`\n${fails ? 'FALLÓ' : 'OK'}: ${n - fails}/${n} comprobaciones`);
process.exit(fails ? 1 : 0);
