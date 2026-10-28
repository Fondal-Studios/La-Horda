'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {plan,enqueue,claim,finish}=require('../../server/art-factory');
const cat={champions:['aelith'],recent:['aelith'],recipes:[{id:'angel_corrompido',provider:'pixrig',recipe:'angel_corrompido',padding:32}]};
test('Spanish dictation becomes persisted jobs, never executable code',()=>{
 assert.deepEqual(plan('Reparar los últimos campeones',cat).map(j=>j.target),['aelith']);
 assert.equal(plan('Reparar todos los assets',cat).length,2);
 const p=plan('Crear un campeón de hielo; $(rm -rf /)',cat)[0];assert.equal(p.kind,'champion-art');assert(p.description.includes('$(rm'));
 assert.throws(()=>plan('Reparar desconocido',cat));
});
test('retry of same command is idempotent and changed request is rejected',()=>{
 const args={command:'Reparar Aelith',requestId:'request-123',actor:1,at:1};
 const a=enqueue({},args,cat),b=enqueue(a.state,args,cat);assert.equal(b.value.duplicate,true);assert.equal(b.state.artFactory.jobs.length,1);
 assert.throws(()=>enqueue(a.state,{...args,command:'Crear otro asset'},cat));
});
test('exclusive lease survives serialization and rejects stale results',()=>{
 let s=enqueue({otherFeature:{untouched:true}},{command:'Reparar Aelith',requestId:'request-123',actor:1},cat).state;
 const c=claim(s,'worker-a',100);s=JSON.parse(JSON.stringify(c.state));assert.equal(claim(s,'worker-b',200).value.job,null);
 assert.throws(()=>finish(s,{id:c.value.job.id,lease:'wrong',result:{status:'FAILED'}},300));
 const r=finish(s,{id:c.value.job.id,lease:c.value.job.lease,result:{status:'BLOCKED_MODEL'}},300);assert(r.state.otherFeature.untouched);
});
test('crash is recorded instead of blindly duplicating model requests',()=>{
 const s=enqueue({},{command:'Reparar Aelith',requestId:'request-123',actor:1},cat).state;
 const c=claim(s,'worker-a',0);const r=claim(c.state,'worker-b',1200001);assert.equal(r.value.job,null);assert.equal(r.state.artFactory.jobs[0].status,'FAILED');
});
test('successful candidate requires actual image evidence',()=>{
 const s=enqueue({},{command:'Reparar Aelith',requestId:'request-123',actor:1},cat).state,c=claim(s,'w',10),j=c.value.job;
 assert.throws(()=>finish(s,{id:j.id,lease:j.lease,result:{status:'AWAITING_VISUAL_REVIEW'}},20));
 assert.equal(finish(s,{id:j.id,lease:j.lease,result:{status:'AWAITING_VISUAL_REVIEW',sha256:'a'.repeat(64),technicalPass:true}},20).value.job.status,'AWAITING_VISUAL_REVIEW');
});
