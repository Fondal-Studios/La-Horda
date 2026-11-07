#!/usr/bin/env node
'use strict';
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const {buildHandoff, REQUIRED_CHECKS} = require('./art-handoff');
const C = require('../../contracts/v1');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'horda-handoff-'));
const bytes = fs.readFileSync(path.resolve(__dirname, '../../assets/sprites/enemies/bosque/bestia_bosque/idle1.png'));
const digest = crypto.createHash('sha256').update(bytes).digest('hex');
const source = 'assets/sprites/test', best = 'docs/art-factory/candidates/test/a1';
fs.mkdirSync(path.join(root, source), {recursive:true}); fs.mkdirSync(path.join(root, best), {recursive:true});
fs.writeFileSync(path.join(root, source, 'idle1.png'), bytes); fs.writeFileSync(path.join(root, best, 'idle1.png'), bytes);
const entry = () => ({source, best, candidate_hashes: {'idle1.png':digest}, source_hashes: {'idle1.png':digest}, integracion: {apto_tecnico:true, checks:Object.fromEntries(REQUIRED_CHECKS.map(k=>[k,true])), evaluacion_actual:{pass:true,score:95,critical:0}}});
const context = {head:'a'.repeat(40), branch:'fix/test', kind:'sprite_sheet'};
let count = 0; const test = (name, f) => {f(); count++; console.log('PASS ' + name);};
try {
 test('packet is valid ArtAsset, pending not installed, exact SHA and bytes', () => {
   const p = buildHandoff(root, 'test', entry(), context); assert.equal(p.assets[0].asset.path, source + '/idle1.png');
   assert.equal(p.assets[0].asset.sha256,digest); assert.equal(C.validate('ArtAsset',p.assets[0].asset).ok,true);
   assert.equal(p.architectureApproval,'PENDIENTE'); assert.equal(p.eligibleForInstallation,false); assert.equal(p.installed,false);
   assert.equal(p.subject.head,context.head); assert.equal(p.reviewRecord,'reviews/fix__test.json');
   assert.equal(p.assets[0].asset.gates.pixelDensity,'fail');
 });
 test('rejects failed gate', () => {const e=entry();e.integracion.apto_tecnico=false;assert.throws(()=>buildHandoff(root,'test',e,context));});
 test('rejects contradictory checks', () => {const e=entry();e.integracion.checks.mismo_conjunto_de_archivos=false;assert.throws(()=>buildHandoff(root,'test',e,context));});
 test('rejects low current score', () => {const e=entry();e.integracion.evaluacion_actual.score=89;assert.throws(()=>buildHandoff(root,'test',e,context));});
 test('rejects invented gate checks', () => {const e=entry();e.integracion.checks={files:true};assert.throws(()=>buildHandoff(root,'test',e,context));});
 for(const dir of [source,best]) test('rejects extra PNG in ' + dir, () => {const f=path.join(root,dir,'extra.png');fs.writeFileSync(f,bytes);try{assert.throws(()=>buildHandoff(root,'test',entry(),context));}finally{fs.unlinkSync(f);}});
 test('rejects missing candidate PNG', () => {const f=path.join(root,best,'idle1.png');fs.unlinkSync(f);try{assert.throws(()=>buildHandoff(root,'test',entry(),context));}finally{fs.writeFileSync(f,bytes);}});
 test('rejects absent fingerprints', () => {const e=entry();delete e.candidate_hashes;assert.throws(()=>buildHandoff(root,'test',e,context));});
 test('rejects changed candidate', () => {const e=entry();e.candidate_hashes['idle1.png']='b'.repeat(64);assert.throws(()=>buildHandoff(root,'test',e,context));});
 test('rejects changed source', () => {const e=entry();e.source_hashes['idle1.png']='b'.repeat(64);assert.throws(()=>buildHandoff(root,'test',e,context));});
 test('rejects outside candidate', () => {const e=entry();e.best=source;assert.throws(()=>buildHandoff(root,'test',e,context));});
 test('rejects traversal', () => {const e=entry();e.candidate_hashes={'../idle1.png':digest};assert.throws(()=>buildHandoff(root,'test',e,context));});
 test('rejects missing SHA', () => assert.throws(()=>buildHandoff(root,'test',entry(),{...context,head:''})));
 test('rejects invalid kind', () => assert.throws(()=>buildHandoff(root,'test',entry(),{...context,kind:'invented'})));
 test('does not change original bytes', () => assert.deepEqual(fs.readFileSync(path.join(root,source,'idle1.png')),bytes));
 console.log(`OK ${count}/${count}`);
} finally {fs.rmSync(root,{recursive:true,force:true});}
