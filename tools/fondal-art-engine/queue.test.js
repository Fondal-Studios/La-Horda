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

test('animation repair is explicit and constrained to one known target',()=>{
 assert.equal(plan('Reparar aelith animación walk_down',cat)[0].action,'walk_down');
 assert.throws(()=>plan('Reparar todos los assets animación walk_down',cat));
 assert.throws(()=>plan('Reparar aelith animación',cat));
});
test('configuration capabilities are sanitized and not inferred from heartbeat',()=>{
 const {capabilities}=require('../../server/art-factory');
 assert.deepEqual(capabilities(),{provider:null,ready:false,reason:'UNKNOWN',supports:[]});
 assert.equal(capabilities({provider:'runway-s0f',ready:true,reason:'READY',supports:['repair','animation','secret'],key:'do-not-persist'}).supports.length,2);
 assert.equal(capabilities({provider:'unknown',ready:true}).ready,false);
 assert.equal(JSON.stringify(capabilities({key:'do-not-persist',reason:'arbitrary secret'})).includes('secret'),false);
 const c=claim({},'w',0,{provider:'runway-s0f',ready:false,reason:'BLOCKED_CREDENTIAL'});
 assert.equal(c.state.artFactory.worker.capabilities.ready,false);
});
test('heartbeat extends only a live lease and preserves readiness',()=>{
 const {heartbeat}=require('../../server/art-factory');
 let s=enqueue({},{command:'Reparar Aelith',requestId:'request-123',actor:1},cat).state;
 const c=claim(s,'w',0,{provider:'runway-s0f',ready:true,reason:'READY'}),j=c.value.job;
 s=heartbeat(c.state,{id:j.id,lease:j.lease},600000).state;
 assert.equal(j.leaseUntil,1800000);assert.equal(s.artFactory.worker.capabilities.provider,'runway-s0f');
 assert.throws(()=>heartbeat(s,{id:j.id,lease:'wrong'},600001));
 assert.throws(()=>heartbeat(s,{id:j.id,lease:j.lease},1800001));
});
test('pending provider resume retains identity, is idempotent and never resets uncertain billing',()=>{
 const {resume}=require('../../server/art-factory');
 let s=enqueue({},{command:'Reparar Aelith',requestId:'request-123',actor:1},cat).state;
 const c=claim(s,'w',0),j=c.value.job;
 s=finish(c.state,{id:j.id,lease:j.lease,result:{status:'PROVIDER_PENDING',resumable:true}},1).state;
 const r=resume(s,{id:j.id,requestId:'resume-123',actor:1},2);
 assert.equal(r.value.job.id,j.id);assert.equal(r.value.job.status,'QUEUED');
 assert.equal(resume(r.state,{id:j.id,requestId:'resume-123',actor:1},3).value.duplicate,true);
 const c2=claim(r.state,'w',4);
 s=finish(c2.state,{id:j.id,lease:c2.value.job.lease,result:{status:'PROVIDER_UNCERTAIN'}},5).state;
 assert.throws(()=>resume(s,{id:j.id,requestId:'resume-456',actor:1},6));
 assert.equal(s.artFactory.jobs.length,1);
});
test('pending without a confirmed resumable journal cannot be resumed',()=>{
 const {resume}=require('../../server/art-factory');
 let s=enqueue({},{command:'Reparar Aelith',requestId:'request-123',actor:1},cat).state;
 const c=claim(s,'w',0),j=c.value.job;
 s=finish(c.state,{id:j.id,lease:j.lease,result:{status:'PROVIDER_PENDING'}},1).state;
 assert.throws(()=>resume(s,{id:j.id,requestId:'resume-123',actor:1},2));
});
test('blocked results are authoritative and result receipts remain idempotent',()=>{
 for(const status of ['BLOCKED_CREDENTIAL','BLOCKED_CREDIT','BLOCKED_CONTRACT','BLOCKED_BUDGET','PROVIDER_PENDING','PROVIDER_UNCERTAIN']){
  const c=claim(enqueue({},{command:'Reparar Aelith',requestId:'request-123',actor:1},cat).state,'w',0);
  const args={id:c.value.job.id,lease:c.value.job.lease,result:{status}};
  const r=finish(c.state,args,1);assert.equal(r.value.job.status,status);assert.equal(finish(r.state,args,2).value.duplicate,true);
 }
});

test('admin UI distinguishes native readiness and safely retries pending resume',async()=>{
 const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
 const window={};let serial=0;
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../js/ui/art-factory.js'),'utf8'),{window,crypto:{randomUUID:()=>`request-${++serial}`}});
 const text=[],actions=[],posts=[];
 let fail=true;
 const ctx={api:async(method,url,body)=>{
  if(method==='GET')return {workerOnline:true,worker:{capabilities:{provider:'pixrig',ready:true,supports:['native-recipe']}},jobs:[{id:'pending',target:'cazadora',status:'PROVIDER_PENDING',result:{resumable:true}},{id:'uncertain',target:'aelith',status:'PROVIDER_UNCERTAIN'}]};
  posts.push({url,body});if(fail){fail=false;throw Error('network interruption');}return {};
 },panel:()=>({append:()=>{}}),node:(_tag,s)=>{text.push(s);return {};},form:()=>({f:{},end:()=>{}}),field:()=>({}),list:(_p,rows)=>text.push(...rows),action:(_p,label,fn)=>actions.push({label,fn}),say:()=>{},render:async()=>{}};
 await window.GMExt.artFactory(ctx);
 assert(text.some(s=>s.includes('Solo recetas nativas; generación IA no configurada')));
 assert.equal(actions.filter(a=>a.label.startsWith('Reanudar')).length,1);
 const resume=actions.find(a=>a.label.startsWith('Reanudar'));
 await assert.rejects(resume.fn(),/network interruption/);await resume.fn();
 assert.deepEqual(posts[0],posts[1]);assert.equal(posts[0].body.id,'pending');
});

test('explicit supported skin retains its own reference and never silently targets base',()=>{
 const skins={...cat,champions:['aelith','cazadora'],skinReferences:{cazadora_escarcha:{champ:'cazadora',file:'art-source/unique-skins/cazadora_escarcha.png',sha256:'a'.repeat(64)}}};
 const j=plan('Reparar cazadora skin cazadora_escarcha animación walk_down',skins)[0];
 assert.equal(j.target,'cazadora');assert.equal(j.skin,'cazadora_escarcha');assert.equal(j.action,'walk_down');assert.equal(j.reference,skins.skinReferences.cazadora_escarcha.file);assert.equal(j.referenceSha256,'a'.repeat(64));
 assert.equal(plan('Reparar cazadora skin cazadora_escarcha',skins)[0].action,undefined);
 for(const command of ['Reparar cazadora skin inventada','Reparar cazadora skin manada','Reparar aelith skin cazadora_escarcha','Reparar todos los assets skin cazadora_escarcha','Reparar cazadora skin','Reparar cazadora skins'])assert.throws(()=>plan(command,skins));
 assert.throws(()=>plan('Reparar cazadora skin cazadora_escarcha',{...skins,skinReferences:undefined}));
 assert.equal(plan('Reparar cazadora',skins)[0].skin,undefined);
});
