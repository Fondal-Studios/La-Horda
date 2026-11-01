#!/usr/bin/env node
'use strict';
/* PUERTA DE PROPIEDAD DE ARCHIVOS para los agentes A, B y C (docs/arquitectura-compartida/ownership.json).
 *   node tools/agents/check-diff.js [--agent A|B|C|auto] [--base origin/main] [--head HEAD] [--branch nombre] [--json]
 * Mira SOLO los archivos que cambia la rama respecto de la base y exige:
 *   1. que todos estén dentro de los archivos permitidos del agente (con "auto", el agente sale del prefijo de la rama: claude/s1-economia-… = A);
 *   2. que ninguno esté en la lista prohibida para todos (multijugador, combate, progresión, assets, index.html);
 *   3. que no toque el contrato (contracts/v1/**) salvo la rama de contrato (claude/contrato-…) o contracts/v1/migrations.js del agente B;
 *   4. que las interfaces congeladas sigan existiendo en el código (comprobación estática de nombres, no de comportamiento).
 * Sin agente reconocido (rama de otra persona o de S0A/S0B) la puerta no aplica y sale 0. Es una guarda barata; no reemplaza la revisión. */
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const a = process.argv.slice(2), val = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const own = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/arquitectura-compartida/ownership.json'), 'utf8'));
const rx = g => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0000/g, '.*') + '$');
const match = (gs, f) => gs.some(g => rx(g).test(f));
const allowedFor = (pkg, f) => match(pkg.allowed, f) && !match(pkg.deny || [], f);
const FROZEN = [ // nombre exportado/definido que otro paquete usa -> archivo donde debe seguir estando
  ['project', 'server/item-economy-live.js'], ['command', 'server/item-economy-live.js'], ['recordLogin', 'server/item-economy.js'],
  ['walletApply', 'server/accounts.js'], ['putSave', 'server/accounts.js'], ['gmUpdate', 'server/accounts.js'], ['gmRead', 'server/accounts.js'],
  ['stateOf', 'server/game-master.js'], ['audit', 'server/game-master.js']
];
function run(opts) {
  const base = opts.base || 'origin/main', head = opts.head || 'HEAD', cwd = opts.cwd || ROOT;
  const git = args => cp.execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 1 << 28 }).trim();
  let agent = opts.agent || 'auto';
  const branch = opts.branch || (() => { try { return git(['rev-parse', '--abbrev-ref', head]); } catch (e) { return ''; } })();
  if (agent === 'auto') agent = Object.keys(own.packages).find(p => branch.startsWith(own.packages[p].branchPrefix)) || null;
  const contractBranch = /^claude\/contrato-/.test(branch), reviewBranch = /^review\//.test(branch);
  if (!agent && !contractBranch && !reviewBranch) return { applies: false, branch, problems: [], files: [] };
  const files = git(['diff', '--name-only', `${base}...${head}`]).split('\n').filter(Boolean);
  const allowed = agent ? own.packages[agent].allowed : [], problems = [];
  if(reviewBranch){ for(const f of files) if(!/^reviews\//.test(f)) problems.push(`${f}: una rama review/… solo puede escribir en reviews/ (los revisores no modifican código)`); return { applies: true, agent: null, branch, files, problems }; }
  for (const f of files) {
    if (match(own.forbiddenForAll, f)) { problems.push(`${f}: prohibido para todos los agentes`); continue; }
    if (/^contracts\/v1\//.test(f) && !contractBranch && !(agent === 'B' && f === 'contracts/v1/migrations.js')) { problems.push(`${f}: el contrato solo cambia en una rama claude/contrato-… aprobada por A, B y C`); continue; }
    if (/^docs\/arquitectura-compartida\//.test(f) && !contractBranch) { problems.push(`${f}: pertenece a Arquitectura`); continue; }
    if (contractBranch && /^(contracts\/v1\/|docs\/arquitectura-compartida\/|tools\/contracts\/)/.test(f)) continue;
    if (!agent) { problems.push(`${f}: una rama de contrato solo puede tocar contracts/, tools/contracts/ y docs/arquitectura-compartida/`); continue; }
    if (!allowedFor(own.packages[agent], f)) {
      const owners = Object.keys(own.packages).filter(p => allowedFor(own.packages[p], f));
      problems.push(`${f}: no es del agente ${agent}${owners.length ? ' (es del agente ' + owners.join('/') + ')' : ' (no pertenece a ningún paquete)'}`);
    }
  }
  const frozen = [];
  for (const [name, file] of FROZEN) {
    let src = ''; try { src = git(['show', `${head}:${file}`]); } catch (e) { frozen.push(`${file}: no existe en la rama`); continue; }
    if (!new RegExp('\\b' + name + '\\b').test(src)) frozen.push(`${file}: desapareció la interfaz congelada "${name}"`);
  }
  return { applies: true, agent, branch, files, problems: problems.concat(frozen) };
}
module.exports = { run, FROZEN };
if (require.main === module) {
  const r = run({ agent: val('--agent', 'auto'), base: val('--base'), head: val('--head'), branch: val('--branch') });
  if (a.includes('--json')) console.log(JSON.stringify(r, null, 1));
  else if (!r.applies) console.log(`La puerta no aplica a la rama "${r.branch}" (no corresponde a un agente A/B/C ni a una rama de contrato).`);
  else {
    console.log(`Agente ${r.agent || '(contrato)'} · rama ${r.branch} · ${r.files.length} archivo(s) cambiado(s)`);
    r.problems.forEach(p => console.log('FAIL ' + p));
    console.log(r.problems.length ? `\n${r.problems.length} problema(s)` : 'OK: todos los archivos son del agente y las interfaces congeladas siguen en su lugar');
  }
  process.exit(r.problems.length ? 1 : 0);
}
