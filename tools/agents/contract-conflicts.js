#!/usr/bin/env node
'use strict';
/* DETECTOR DE CONFLICTOS DE CONTRATO entre ramas de agentes. Detiene SOLO la integración del contrato en disputa; el resto sigue.
 *   node tools/agents/contract-conflicts.js --base origin/main --branches rama1,rama2,rama3 [--json]
 * Para cada rama calcula qué contratos toca (su esquema, su productor o su entrada del registro) y qué archivos comparte con otra rama.
 *   - Un contrato tocado por 2 o más ramas => HOLD (retenido): solo esas ramas esperan, y solo para ese contrato; el arquitecto decide el orden.
 *   - Un archivo tocado por 2 o más ramas => CHOQUE de archivo (también retiene a esas ramas hasta resolverlo).
 *   - Las ramas que no tocan ningún contrato retenido ni archivos compartidos => PUEDEN SEGUIR.
 * Sale 1 si hay retenciones o choques; 0 si todo puede integrarse en cualquier orden. No modifica nada. */
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const REG = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts/registry.json'), 'utf8'));
function filesOf(base, head, cwd){ return cp.execFileSync('git', ['diff', '--name-only', `${base}...${head}`], { cwd: cwd || ROOT, encoding: 'utf8', maxBuffer: 1 << 28 }).split('\n').filter(Boolean); }
function contractsTouched(files){
  const out = new Set();
  for(const [name, c] of Object.entries(REG.contracts)){
    if(files.includes(c.schema) || files.includes(c.producer)) out.add(name);
  }
  // Los módulos comunes de contracts/v1 y el registro afectan a todos: solo una rama de contrato debería tocarlos.
  if(files.some(f => /^contracts\/v1\/(index|core|errors)\.js$/.test(f) || f === 'contracts/registry.json')) out.add('*');
  return out;
}
function analyze(base, branches, opts = {}){
  const info = branches.map(b => { const head = typeof b === 'string' ? b : b.head, name = typeof b === 'string' ? b : b.name; const files = (opts.filesOf || filesOf)(base, head, opts.cwd); return { branch: name, files, contracts: contractsTouched(files) }; });
  const holds = {}, fileClash = {};
  for(const i of info) for(const c of i.contracts) (holds[c] = holds[c] || new Set()).add(i.branch);
  for(const i of info) for(const f of i.files) (fileClash[f] = fileClash[f] || new Set()).add(i.branch);
  // '*' toca a todos: si una rama toca '*' y otra toca cualquier contrato, también es disputa sobre ese contrato.
  const star = holds['*'] || new Set();
  const heldContracts = {};
  for(const [c, bs] of Object.entries(holds)){
    if(c === '*') continue;
    const all = new Set([...bs, ...star]);
    if(all.size > 1) heldContracts[c] = [...all];
  }
  if(star.size > 1) heldContracts['*'] = [...star];
  const clashes = Object.fromEntries(Object.entries(fileClash).filter(([f, bs]) => bs.size > 1 && !/^(docs\/arquitectura-compartida\/|reviews\/)/.test(f)).map(([f, bs]) => [f, [...bs]]));
  const blocked = new Set([...Object.values(heldContracts).flat(), ...Object.values(clashes).flat()]);
  return { info: info.map(i => ({ branch: i.branch, files: i.files.length, contracts: [...i.contracts] })), heldContracts, clashes, proceed: info.map(i => i.branch).filter(b => !blocked.has(b)), blocked: [...blocked] };
}
module.exports = { analyze, contractsTouched, filesOf };
if(require.main === module){
  const a = process.argv.slice(2), val = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
  const branches = (val('--branches', '') || '').split(',').filter(Boolean);
  if(branches.length < 1){ console.error('uso: contract-conflicts.js --base origin/main --branches r1,r2[,r3] [--json]'); process.exit(2); }
  const r = analyze(val('--base', 'origin/main'), branches);
  if(a.includes('--json')) console.log(JSON.stringify(r, null, 1));
  else {
    for(const i of r.info) console.log(`· ${i.branch}: ${i.files} archivo(s); contratos: ${i.contracts.join(', ') || 'ninguno'}`);
    for(const [c, bs] of Object.entries(r.heldContracts)) console.log(`HOLD contrato ${c}: en disputa entre ${bs.join(' y ')} (solo se detiene esa integración)`);
    for(const [f, bs] of Object.entries(r.clashes)) console.log(`CHOQUE archivo ${f}: tocado por ${bs.join(' y ')}`);
    console.log(`PUEDEN SEGUIR: ${r.proceed.join(', ') || 'ninguna'}`);
  }
  process.exit(Object.keys(r.heldContracts).length || Object.keys(r.clashes).length ? 1 : 0);
}
