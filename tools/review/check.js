#!/usr/bin/env node
'use strict';
/* REVISIÓN INDEPENDIENTE: PRODUCCIÓN -> QA -> REVISIÓN ARQUITECTÓNICA -> STAGING -> APROBACIÓN.
 *   node tools/review/check.js --record reviews/<archivo>.json [--head SHA] [--mode draft|merge]
 *   node tools/review/check.js --branch claude/s1-economia-x --head SHA [--mode auto|draft|merge]   (busca el registro de esa rama)
 *   node tools/review/check.js --all                                                                  (valida la forma de todos los registros)
 * Reglas (todas verificables):
 *   R1 las etapas van en orden y ninguna sigue a una etapa no aprobada;
 *   R2 NADIE aprueba su propio trabajo: quien revisa no es el autor de la producción ni el autor declarado, y QA y arquitectura son personas/identidades distintas;
 *   R3 cada etapa tiene el rol que le corresponde (qa, arquitecto, qa/integrador, director) y la aprobación final la da una cuenta humana de reviews/DIRECTORES.json;
 *   R4 la evidencia de cada revisión cita el SHA exacto de la cabeza actual (un commit nuevo invalida la revisión);
 *   R5 QA y staging aprobados exigen tests > 0 y failed = 0;
 *   R6 arquitectura puede ordenar: aprobado | rechazado | reparacion_parcial (lista repair no vacía) | reconstruccion (con motivo); las dos últimas reinician el ciclo (no puede haber etapas posteriores);
 *   R7 en modo merge las cinco etapas deben estar aprobadas; en modo draft se acepta un registro parcial o ausente.
 * Una rama que no es de un agente (claude/s1..s4-…) no está sujeta a este control. */
const fs = require('node:fs'), path = require('node:path');
const ROOT = path.resolve(__dirname, '../..');
const ORDER = ['produccion', 'qa', 'arquitectura', 'staging', 'aprobacion'];
const ROLE = { produccion: ['agent'], qa: ['qa'], arquitectura: ['arquitecto'], staging: ['qa', 'integrador'], aprobacion: ['director'] };
const AGENT_BRANCH = /^(claude\/|feature\/beta-)/;
const isAgentId = id => /^(agente|claude|bot)[-_]/i.test(String(id));
function validateRecord(rec, ctx = {}){
  const problems = [], mode = ctx.mode || 'merge', directors = ctx.directors || [];
  const stages = Array.isArray(rec && rec.stages) ? rec.stages : [];
  const subject = (rec && rec.subject) || {};
  const names = stages.map(s => s.stage);
  if(!subject.branch || !subject.head) problems.push('subject.branch y subject.head son obligatorios');
  if(names.some(n => !ORDER.includes(n))) problems.push('etapa desconocida: ' + names.find(n => !ORDER.includes(n)));
  if(new Set(names).size !== names.length) problems.push('etapa repetida');
  // R1 orden y encadenamiento
  names.forEach((n, i) => { if(ORDER.indexOf(n) !== i) problems.push(`R1 etapa fuera de orden: "${n}" en el lugar ${i + 1}`); });
  const prod = stages.find(s => s.stage === 'produccion');
  if(stages.length && !prod) problems.push('R1 falta la etapa de producción');
  let stopped = false;
  for(const s of stages){
    if(stopped && s.stage !== 'produccion') problems.push(`R1 la etapa "${s.stage}" no puede existir después de una etapa no aprobada`);
    if(s.stage !== 'produccion' && s.verdict !== 'aprobado') stopped = true;
    // R3 roles
    if(!(ROLE[s.stage] || []).includes(s.role)) problems.push(`R3 la etapa "${s.stage}" exige rol ${ROLE[s.stage].join('/')} y tiene "${s.role}"`);
    if(s.stage !== 'produccion'){
      // R2 independencia
      if(prod && s.by === prod.by) problems.push(`R2 "${s.by}" revisa "${s.stage}" de su propio trabajo`);
      if(s.by === subject.authorId) problems.push(`R2 "${s.by}" es el autor declarado de la rama y no puede revisarla`);
      if(isAgentId(s.by) && s.stage === 'aprobacion') problems.push('R3 la aprobación final no puede darla un agente');
      // R4 SHA
      if(!s.evidence || s.evidence.sha !== subject.head) problems.push(`R4 la evidencia de "${s.stage}" no cita el SHA actual de la rama`);
      // R5 pruebas
      if((s.stage === 'qa' || s.stage === 'staging') && s.verdict === 'aprobado'){
        if(!s.evidence || !(s.evidence.tests > 0) || s.evidence.failed !== 0) problems.push(`R5 "${s.stage}" aprobado exige tests > 0 y failed = 0`);
      }
      if(s.stage === 'staging' && s.verdict === 'aprobado' && !(s.evidence && s.evidence.branch && /^beta\//.test(s.evidence.branch))) problems.push('R5 staging se prueba en una rama beta/…');
    } else if(prod && s.commit && s.commit !== subject.head) problems.push('R4 la producción cita un commit distinto del SHA actual');
    if(s.stage === 'aprobacion' && directors.length && !directors.includes(s.by)) problems.push(`R3 "${s.by}" no figura en reviews/DIRECTORES.json`);
    if(s.stage !== 'produccion' && !['aprobado', 'rechazado', 'reparacion_parcial', 'reconstruccion'].includes(s.verdict)) problems.push(`veredicto inválido en "${s.stage}"`);
    if((s.verdict === 'reparacion_parcial' || s.verdict === 'reconstruccion') && s.stage !== 'arquitectura') problems.push(`R6 solo la revisión arquitectónica puede ordenar "${s.verdict}"`);
    if(s.verdict === 'reparacion_parcial' && !(Array.isArray(s.repair) && s.repair.length)) problems.push('R6 reparacion_parcial exige la lista repair');
    if(s.verdict === 'reconstruccion' && !s.reason) problems.push('R6 reconstruccion exige reason');
  }
  // R2 QA y arquitectura distintos
  const qa = stages.find(s => s.stage === 'qa'), ar = stages.find(s => s.stage === 'arquitectura');
  if(qa && ar && qa.by === ar.by) problems.push('R2 QA y revisión arquitectónica no pueden ser la misma identidad');
  if(mode === 'merge'){
    for(const n of ORDER) { const s = stages.find(x => x.stage === n); if(!s) problems.push(`R7 falta la etapa "${n}" para poder mezclar`); else if(n !== 'produccion' && s.verdict !== 'aprobado') problems.push(`R7 la etapa "${n}" está en "${s.verdict}"`); }
  }
  const last = stages[stages.length - 1];
  const state = !stages.length ? 'sin_registro' : problems.length ? 'invalido' : (last.stage === 'aprobacion' && last.verdict === 'aprobado') ? 'aprobado' : last.verdict === 'reparacion_parcial' ? 'reparacion_parcial' : last.verdict === 'reconstruccion' ? 'reconstruccion' : last.verdict === 'rechazado' ? 'rechazado' : 'en_curso:' + last.stage;
  return { ok: problems.length === 0, problems, state };
}
module.exports = { validateRecord, ORDER, AGENT_BRANCH, isAgentId };
if(require.main === module){
  const a = process.argv.slice(2), val = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
  const dirs = JSON.parse(fs.readFileSync(path.join(ROOT, 'reviews/DIRECTORES.json'), 'utf8')).directores;
  const recPath = f => path.join(ROOT, 'reviews', f.replace(/\//g, '__') + '.json');
  let bad = 0;
  if(a.includes('--all')){
    for(const f of fs.readdirSync(path.join(ROOT, 'reviews')).filter(x => x.endsWith('.json') && !['DIRECTORES.json', 'TEMPLATE.json'].includes(x))){
      const r = validateRecord(JSON.parse(fs.readFileSync(path.join(ROOT, 'reviews', f), 'utf8')), { mode: 'draft', directors: dirs });
      console.log(`${r.ok ? 'PASS' : 'FAIL'} ${f} (${r.state})${r.problems.map(p => '\n  - ' + p).join('')}`); if(!r.ok) bad++;
    }
    console.log(bad ? `${bad} registro(s) inválido(s)` : 'OK: todos los registros son válidos'); process.exit(bad ? 1 : 0);
  }
  const branch = val('--branch'), head = val('--head');
  let file = val('--record'); if(!file && branch){ if(!AGENT_BRANCH.test(branch)){ console.log(`La rama "${branch}" no es de un agente: no está sujeta a la revisión independiente.`); process.exit(0); } file = recPath(branch); }
  if(!file){ console.error('uso: check.js --record archivo | --branch rama --head SHA | --all'); process.exit(2); }
  const mode = val('--mode', 'merge') === 'auto' ? 'merge' : val('--mode', 'merge');
  if(!fs.existsSync(path.resolve(file))){
    if(mode === 'draft'){ console.log(`Sin registro de revisión para "${branch}" todavía (borrador): permitido. Faltan las 4 revisiones antes de mezclar.`); process.exit(0); }
    console.log(`FAIL no existe el registro de revisión ${path.relative(ROOT, path.resolve(file))}: no se puede mezclar sin las 5 etapas.`); process.exit(1);
  }
  const rec = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  if(head) rec.subject.head = rec.subject.head; // el SHA del registro se compara con --head más abajo
  const r = validateRecord(rec, { mode, directors: dirs });
  if(head && rec.subject.head !== head) { r.ok = false; r.problems.push(`R4 el registro es de ${String(rec.subject.head).slice(0, 8)} pero la rama está en ${head.slice(0, 8)}: hay que volver a revisar`); }
  console.log(`${r.ok ? 'PASS' : 'FAIL'} ${path.relative(ROOT, path.resolve(file))} · estado: ${r.state} · modo ${mode}${r.problems.map(p => '\n  - ' + p).join('')}`);
  process.exit(r.ok ? 0 : 1);
}
