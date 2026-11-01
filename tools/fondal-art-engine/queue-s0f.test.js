'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {executeS0F,capabilities,errorStatus}=require('./queue-s0f');
const {enqueue,claim,finish}=require('../../server/art-factory');
const {readContract,ROOT}=require('../factory/s0f/contract');
const s0f=require('../factory/s0f/s0f');
const {replayReceipts}=require('./worker');
const profile={provider:'runway-s0f',enabled:true,allowedTargets:['cazadora'],limits:{perTaskCents:10,perBatchCents:130,perDayCents:500}};
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function setup(){const root=fs.mkdtempSync(path.join(os.tmpdir(),'queue-s0f-'));const c=readContract('cazadora'),referenceSha256=hash(path.join(ROOT,c.codexPage));return {root,job:{id:crypto.randomUUID(),kind:'repair',target:'cazadora',action:'walk_down',reference:c.codexPage,referenceSha256}};}
test('capabilities distinguish native-only, disabled, missing credentials and locally configured (not API verified)',()=>{
 assert.deepEqual(capabilities(null,{}).supports,['native-recipe']);
 assert.equal(capabilities({...profile,enabled:false},{}).ready,false);
 assert.equal(capabilities(profile,{}).reason,'BLOCKED_CREDENTIAL');
 assert.equal(capabilities(profile,{RUNWAY_API_KEY:'test-not-real'}).ready,true);
 assert.equal(capabilities({...profile,limits:{perDayCents:NaN}},{}).ready,false);
});
test('unsupported creation and stale references never invoke a provider',async()=>{
 const {root,job}=setup();let calls=0;const pipeline={generate:async()=>calls++};
 assert.equal((await executeS0F({...job,kind:'champion-art'},{root,profile,pipeline})).status,'BLOCKED_CONTRACT');
 assert.equal((await executeS0F({...job,referenceSha256:'0'.repeat(64)},{root,profile,pipeline})).status,'BLOCKED_CONTRACT');
 assert.equal((await executeS0F({...job,action:'not_a_clip'},{root,profile,pipeline})).status,'BLOCKED_CONTRACT');assert.equal(calls,0);
});
test('errors preserve pending vs uncertain vs credit and budget, no automatic approval',async()=>{
 const old=process.env.RUNWAYML_API_SECRET;process.env.RUNWAYML_API_SECRET='fixture-not-a-key';
 try{for(const [reason,status] of [['BLOCKED_PROVIDER_PENDING: saved task','PROVIDER_PENDING'],['BLOCKED_REQUEST_UNCERTAIN: unknown POST','PROVIDER_UNCERTAIN'],['BLOCKED_CREDIT: empty','BLOCKED_CREDIT'],['SpendGuard: supera el tope diario','BLOCKED_BUDGET']]){
 const {root,job}=setup();const r=await executeS0F(job,{root,profile,pipeline:{generate:async()=>({state:'BLOCKED',reason})}});assert.equal(r.status,status);assert.equal(r.resumable,status==='PROVIDER_PENDING');
 }}finally{if(old===undefined)delete process.env.RUNWAYML_API_SECRET;else process.env.RUNWAYML_API_SECRET=old;}
 assert.equal(errorStatus('arbitrary timeout without a task id'),'FAILED');
});
test('queue -> existing S0F -> mocked pixels -> evaluation -> review; unchanged repeated execution reuses bytes',async()=>{
 const {root,job}=setup(),old=process.env.RUNWAYML_API_SECRET;process.env.RUNWAYML_API_SECRET='fixture-not-a-key';let calls=0;
 const cat={champions:['cazadora'],recent:['cazadora'],recipes:[],references:{cazadora:{sha256:job.referenceSha256}}};
 const q=enqueue({},{command:'Reparar cazadora animacion walk_down',requestId:'e2e-request-123',actor:1},cat),leased=claim(q.state,'fixture-worker');const actual=leased.value.job;actual.action='walk_down';
 const fixture={name:'fixture-test-only',estimate:()=>({estimated_cents_max:0}),generate:async j=>{
  calls++;const out=path.join(root,j.id+'.png'),c=readContract('cazadora');
  const script=`from PIL import Image\nimport json,sys\nc=json.loads(sys.argv[1]); im=Image.open(sys.argv[2]).convert('RGBA'); fr=json.loads(sys.argv[3]); w=c['cell']['w']; h=c['cell']['h']; out=Image.new('RGBA',((w+40)*len(fr),h));\nfor k,i in enumerate(fr): out.paste(im.crop(((i%c['cols'])*w,(i//c['cols'])*h,(i%c['cols']+1)*w,(i//c['cols']+1)*h)),(k*(w+40)+20,0))\nout.save(sys.argv[4])`;
  const r=require('node:child_process').spawnSync('python3',['-c',script,JSON.stringify(c),path.join(ROOT,c.atlas),JSON.stringify(j.frames),out],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return {status:'GENERATED',file:out,cost_cents:0};}};
 const pipeline={...s0f,generate:(id,opts)=>s0f.generate(id,{...opts,provider:'fixture',providers:{fixture}})};
 try{const r=await executeS0F(actual,{root,profile,pipeline});assert.equal(r.status,'AWAITING_VISUAL_REVIEW',JSON.stringify(r));assert.equal(r.installed,false);assert.equal(r.coverage_generated_pct,7.7);assert.equal(calls,1);
 const completed=finish(leased.state,{id:actual.id,lease:actual.lease,result:r});assert.equal(completed.value.job.status,'AWAITING_VISUAL_REVIEW');
 const again=await executeS0F(actual,{root,profile,pipeline});assert.equal(again.reused,true);assert.equal(calls,1);
 const dir=path.join(root,actual.id,'s0f');assert.throws(()=>s0f.integrate(actual.target,dir),/APPROVED/);
 fs.appendFileSync(path.join(dir,'atlas.png'),'tampered');assert.equal((await executeS0F(actual,{root,profile,pipeline})).status,'FAILED');assert.equal(calls,1);
 }finally{if(old===undefined)delete process.env.RUNWAYML_API_SECRET;else process.env.RUNWAYML_API_SECRET=old;}
});
test('lost finish response replays receipt only; never generates again',async()=>{
 const {root,job}=setup(),file=path.join(root,job.id+'.receipt.json');fs.writeFileSync(file,JSON.stringify({id:job.id,lease:'lease',result:{status:'FAILED'}}));let calls=0;
 await replayReceipts(root,async(route,body)=>{calls++;assert.equal(route,'finish');assert.equal(body.id,job.id);});assert.equal(calls,1);assert.equal(fs.existsSync(file),false);
 await replayReceipts(root,async()=>calls++);assert.equal(calls,1);
});
test('explicit Escarcha queue selection preserves independent skin contract; never repairs base silently',async()=>{
 const {root,job}=setup(),c=readContract('cazadora',{skin:'cazadora_escarcha'}),skinJob={...job,skin:'cazadora_escarcha',reference:c.codexPage,referenceSha256:hash(path.join(ROOT,c.codexPage))};
 assert.equal((await executeS0F(skinJob,{root,profile})).status,'BLOCKED_CONTRACT');
 const old=process.env.RUNWAYML_API_SECRET;process.env.RUNWAYML_API_SECRET='fixture-not-real';let received;
 try{const result=await executeS0F(skinJob,{root,profile:{...profile,allowedSkins:['cazadora_escarcha']},pipeline:{generate:async(id,opts)=>{received={id,opts};return {state:'BLOCKED',reason:'BLOCKED_CREDIT: fixture only'};}}});assert.equal(result.status,'BLOCKED_CREDIT');assert.equal(received.opts.skin,'cazadora_escarcha');assert.equal(received.opts.kind,'animation');assert.equal(received.opts.action,'walk_down');
 }finally{if(old===undefined)delete process.env.RUNWAYML_API_SECRET;else process.env.RUNWAYML_API_SECRET=old;}
});
