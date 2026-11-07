#!/usr/bin/env node
'use strict';
// Prueba del flujo de revisión independiente con registros sintéticos, más la plantilla y los registros reales (si hay).
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const { validateRecord } = require('./check');
const ROOT = path.resolve(__dirname, '../..');
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'reviews/DIRECTORES.json'), 'utf8')).directores;
let fails = 0, n = 0; const check = (name, ok, x) => { n++; console.log((ok ? 'PASS ' : 'FAIL ') + name + (!ok && x ? '  ' + JSON.stringify(x).slice(0, 400) : '')); if (!ok) fails++; };
const H = 'a'.repeat(40);
const base = () => ({ subject: { pr: 1, branch: 'claude/s1-economia-x', head: H, authorAgent: 'A', authorId: 'agente-A-1' }, stages: [
  { stage: 'produccion', by: 'agente-A-1', role: 'agent', commit: H },
  { stage: 'qa', by: 'qa-1', role: 'qa', verdict: 'aprobado', evidence: { sha: H, tests: 131, failed: 0 } },
  { stage: 'arquitectura', by: 'arq-1', role: 'arquitecto', verdict: 'aprobado', evidence: { sha: H } },
  { stage: 'staging', by: 'int-1', role: 'integrador', verdict: 'aprobado', evidence: { sha: H, branch: 'beta/integracion', tests: 131, failed: 0 } },
  { stage: 'aprobacion', by: D[0], role: 'director', verdict: 'aprobado', evidence: { sha: H } }] });
const V = (rec, mode) => validateRecord(rec, { mode: mode || 'merge', directors: D });
const has = (r, s) => r.problems.some(p => p.includes(s));
const mod = (f) => { const r = base(); f(r); return r; };
let r = V(base());
check('flujo completo y válido => aprobado', r.ok && r.state === 'aprobado', r);
r = V(mod(x => { x.stages[1].by = 'agente-A-1'; }));
check('R2: el autor no puede hacer la QA de su propio trabajo', has(r, 'R2') && !r.ok, r.problems);
r = V(mod(x => { x.stages[2].by = 'agente-A-1'; }));
check('R2: el autor no puede aprobar la arquitectura de su trabajo', has(r, 'R2'), r.problems);
r = V(mod(x => { x.stages[2].by = 'qa-1'; }));
check('R2: QA y arquitectura no pueden ser la misma identidad', has(r, 'misma identidad'), r.problems);
r = V(mod(x => { x.stages[4].by = 'agente-B-9'; }));
check('R3: un agente no puede dar la aprobación final', has(r, 'no puede darla un agente') && has(r, 'DIRECTORES'), r.problems);
r = V(mod(x => { x.stages[4].by = 'alguien-que-no-es-director'; }));
check('R3: la aprobación final exige una cuenta de reviews/DIRECTORES.json', has(r, 'DIRECTORES'), r.problems);
r = V(mod(x => { x.stages[1].role = 'agent'; }));
check('R3: cada etapa exige su rol', has(r, 'exige rol qa'), r.problems);
r = V(mod(x => { x.stages[1].evidence.sha = 'b'.repeat(40); }));
check('R4: la evidencia debe citar el SHA actual (un commit nuevo invalida la revisión)', has(r, 'R4'), r.problems);
r = V(mod(x => { x.stages[1].evidence.failed = 2; }));
check('R5: QA aprobada con pruebas fallidas se rechaza', has(r, 'R5'), r.problems);
r = V(mod(x => { x.stages[1].evidence.tests = 0; }));
check('R5: QA aprobada sin pruebas se rechaza', has(r, 'R5'), r.problems);
r = V(mod(x => { x.stages[3].evidence.branch = 'main'; }));
check('R5: staging se prueba en una rama beta/…, no en main', has(r, 'rama beta'), r.problems);
r = V(mod(x => { [x.stages[2], x.stages[3]] = [x.stages[3], x.stages[2]]; }));
check('R1: las etapas fuera de orden se rechazan', has(r, 'R1'), r.problems);
r = V(mod(x => { x.stages[1].verdict = 'rechazado'; }));
check('R1: no puede haber etapas después de una QA rechazada', has(r, 'después de una etapa no aprobada') && !r.ok, r.problems);
r = V(mod(x => { x.stages = x.stages.slice(0, 2); x.stages[1].verdict = 'rechazado'; }), 'draft');
check('una QA rechazada deja el estado "rechazado"', r.ok && r.state === 'rechazado', r);
r = V(mod(x => { x.stages = x.stages.slice(0, 3); x.stages[2] = { stage: 'arquitectura', by: 'arq-1', role: 'arquitecto', verdict: 'reparacion_parcial', repair: [{ file: 'server/wallet.js', issue: 'falta el asiento de auditoría' }], evidence: { sha: H } }; }), 'draft');
check('el arquitecto puede ordenar una reparación parcial (con la lista de qué reparar)', r.ok && r.state === 'reparacion_parcial', r);
r = V(mod(x => { x.stages = x.stages.slice(0, 3); x.stages[2] = { stage: 'arquitectura', by: 'arq-1', role: 'arquitecto', verdict: 'reparacion_parcial', evidence: { sha: H } }; }), 'draft');
check('R6: reparacion_parcial sin lista repair se rechaza', has(r, 'repair'), r.problems);
r = V(mod(x => { x.stages = x.stages.slice(0, 3); x.stages[2] = { stage: 'arquitectura', by: 'arq-1', role: 'arquitecto', verdict: 'reconstruccion', reason: 'el diseño duplica el libro de la billetera', evidence: { sha: H } }; }), 'draft');
check('el arquitecto puede ordenar una reconstrucción completa (con motivo)', r.ok && r.state === 'reconstruccion', r);
r = V(mod(x => { x.stages = x.stages.slice(0, 3); x.stages[2] = { stage: 'arquitectura', by: 'arq-1', role: 'arquitecto', verdict: 'reconstruccion', evidence: { sha: H } }; }), 'draft');
check('R6: reconstruccion sin motivo se rechaza', has(r, 'reason'), r.problems);
r = V(mod(x => { x.stages[1].verdict = 'reparacion_parcial'; x.stages[1].repair = [{ file: 'x', issue: 'y' }]; x.stages = x.stages.slice(0, 2); }), 'draft');
check('R6: solo la revisión arquitectónica puede ordenar reparación o reconstrucción', has(r, 'solo la revisión arquitectónica'), r.problems);
r = V(mod(x => { x.stages = x.stages.slice(0, 3); }), 'merge');
check('R7: no se puede mezclar con etapas faltantes', !r.ok && has(r, 'R7 falta la etapa "staging"') && has(r, '"aprobacion"'), r.problems);
r = V(mod(x => { x.stages = x.stages.slice(0, 3); }), 'draft');
check('R7: en borrador un registro parcial es válido (estado en curso)', r.ok && r.state === 'en_curso:arquitectura', r);
r = V(mod(x => { x.stages[0].commit = 'c'.repeat(40); }));
check('R4: la producción debe citar el commit actual', has(r, 'commit distinto'), r.problems);
r = V(mod(x => { x.subject.authorId = 'qa-1'; }));
check('R2: el autor declarado de la rama no puede revisarla', has(r, 'autor declarado'), r.problems);
const tpl = JSON.parse(fs.readFileSync(path.join(ROOT, 'reviews/TEMPLATE.json'), 'utf8'));
r = V(tpl, 'merge');
check('la plantilla del repositorio es un registro válido de la forma esperada', r.ok, r.problems);
const cli = (args) => cp.spawnSync(process.execPath, [path.join(__dirname, 'check.js'), ...args], { cwd: ROOT, encoding: 'utf8' });
check('CLI: una rama que no es de un agente no está sujeta al control', cli(['--branch', 'main', '--head', H]).status === 0);
check('CLI: rama de agente sin registro en modo merge => falla', cli(['--branch', 'claude/s1-economia-inexistente', '--head', H, '--mode', 'merge']).status === 1);
check('CLI: rama de agente sin registro en borrador => pasa', cli(['--branch', 'claude/s1-economia-inexistente', '--head', H, '--mode', 'draft']).status === 0);
check('CLI: --all valida los registros reales del repositorio', cli(['--all']).status === 0);
console.log(`\n${fails ? 'FALLÓ' : 'OK'}: ${n - fails}/${n} comprobaciones`);
process.exit(fails ? 1 : 0);
