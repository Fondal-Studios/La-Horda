'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'../../js/champions/quality-five',name),'utf8');
test('64-particle per-owner cap covers overlapping bursts and lines, expires and restores functions',()=>{
 let total=0;const emit=(x,y,n)=>total+=n,c={runElapsedMs:0,vfxBurst:emit,vfxSpray:emit};
 vm.createContext(c);vm.runInContext(read('fx.js'),c);
 const h={},draw=()=>{c.vfxBurst(0,0,60);c.vfxSpray(0,0,30);};
 c.qualityFiveFx(h,draw);c.qualityFiveFx(h,draw);assert.equal(total,64);
 assert.equal(c.vfxBurst,emit);assert.equal(c.vfxSpray,emit);
 c.qualityFiveFx({},draw);assert.equal(total,128);
 c.runElapsedMs=900;c.qualityFiveFx(h,draw);assert.equal(total,192);
 assert.throws(()=>c.qualityFiveFx(h,()=>{throw Error('draw failed');}));
 assert.equal(c.vfxBurst,emit);assert.equal(c.vfxSpray,emit);
});
test('five distinct sound identities reserve bounded envelopes on independent audio contexts',()=>{
 const calls=[],c={ARENA_SFX:{},_tone:(...a)=>calls.push(a)};vm.createContext(c);vm.runInContext(read('audio.js'),c);
 const signatures=new Set();
 for(const k of ['solciju','brakk','veyra','morveth','aelith']){
  const cast=c.ARENA_SFX['quality_'+k+'_cast'],ult=c.ARENA_SFX['quality_'+k+'_ult'],D={context:{}};
  calls.length=0;assert.equal(cast.play(0,D),.3);signatures.add(calls[0][2]);assert.equal(calls.length,2);
  assert.equal(ult.play(.1,D),0);assert.equal(calls.length,2);
  assert.equal(ult.play(.3,D),.82);assert.equal(calls.length,5);
  assert.equal(cast.play(.4,D),0);assert.equal(calls.length,5);
  assert.equal(cast.play(0,{context:{}}),.3);assert.equal(calls.length,7);
  assert.equal(cast.p,2);assert.equal(ult.p,3);
 }
 assert.equal(signatures.size,5);
});
