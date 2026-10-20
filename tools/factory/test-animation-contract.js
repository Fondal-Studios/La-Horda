'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {extract,consumed,compare,pngSize}=require('./check-animation-contract.js');
const ROOT=path.resolve(__dirname,'../..'),registry=fs.readFileSync(path.join(ROOT,'js/assets/champion-sprites.js'),'utf8');
const std=()=>({w:112,h:112,cols:4,sets:{idle_down:[0],walk_down:[0,1,2,3],cast_down:[24,25,26,27],ultimate_down:[28,29,30,31],death_down:[32,33,34,35]}});
test('preserve a functioning pack and allow additional authored states',()=>{
 const baseline={sets:{idle_down:[0],walk_down:[0,1,2,3]}},result=compare(baseline,std(),[448,1008]);
 assert.equal(result.status,'COMPATIBLE_NOT_ART_APPROVAL');assert.equal(result.approvalClaimed,false);assert.equal(result.installed,false);
});
test('actual Libertador callers cannot disappear into generic36 poses',()=>{
 const baseline=extract(registry,'libertador').meta,required=consumed(fs.readFileSync(path.join(ROOT,'js/champions/libertador.js'),'utf8'),'P');
 assert(required.includes('fire')&&required.includes('reload')&&required.includes('ult_cast'));
 const result=compare(baseline,std(),[448,1008],required);
 for(const clip of required)assert(result.issues.some(i=>i.code==='MISSING_RUNTIME_CLIP'&&i.clip===clip));
 assert.equal(result.status,'REJECT');
});
test('runtime consumers are still enforced when baseline declaration is already incomplete',()=>{
 const result=compare({sets:{}},std(),[448,1008],['fire']);assert(result.issues.some(i=>i.clip==='fire'));
});
test('declaring an existing four-frame clip as one frame does not preserve it',()=>{
 const proposal=std();proposal.sets.walk_down=[0];assert(compare({sets:{walk_down:[0,1,2,3]}},proposal,[448,1008]).issues.some(i=>i.code==='SHORTENED_RUNTIME_CLIP'));
});
test('mirror complements are bounded against the real PNG grid',()=>{
 const proposal=std();proposal.sets.walk_left=[~4,~5,~6,~7];assert.equal(compare({sets:{}},proposal,[448,1008]).status,'COMPATIBLE_NOT_ART_APPROVAL');
 for(const n of [36,~36,NaN,Infinity,1.5,true,'1',4294967295]){proposal.sets.walk_left=[n];assert(compare({sets:{}},proposal,[448,1008]).issues.some(i=>i.code==='FRAME_OUT_OF_BOUNDS'));}
});
test('empty arrays and invalid grid dimensions are rejected',()=>{
 const proposal=std();proposal.sets.cast_down=[];assert(compare({sets:{}},proposal,[448,1008]).issues.some(i=>i.code==='INVALID_CLIP'));
 for(const size of [[448,1007],[447,1008],[448,0]])assert.equal(compare({sets:{}},std(),size).issues[0].code,'INVALID_GRID');
});
test('ambiguous or missing active registrations cannot be silently accepted',()=>{
 assert.throws(()=>extract(registry,'missing_pack'));const line='champPackLoadAtlas("demo", "demo.png", {"sets":{"idle":[0]}});';
 assert.throws(()=>extract(line+'\n'+line,'demo'));assert.throws(()=>extract(registry,'libertador|soporte'));
});
test('inspect real owned staged PNG dimensions without changing any source',()=>{
 const p=path.join(ROOT,'art-source/entregas/bloques/B004_libertador/campeones/atlas.png'),before=fs.readFileSync(p);
 assert.deepEqual(pngSize(p),[448,1008]);assert.deepEqual(fs.readFileSync(p),before);
});
