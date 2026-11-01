'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {prepareExternalPlan,importExternal}=require('./external-import');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function fixture(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'external-import-')),selection={kind:'animation',action:'idle_side',skin:null};
 const plan=prepareExternalPlan('cazadora',{...selection,preparationDir:path.join(dir,'refs')});
 // Fixture uses existing authored pixels only. It is NOT evidence of an actual external generation.
 const job=plan.jobs[0],file=path.join(dir,'fixture.png');fs.copyFileSync(job.references[1],file);
 const manifest={schema:'fondal.external-runway.v1',champion:'cazadora',...selection,contractSha256:plan.contractSha256,sourcePoolId:'fixture-pool-not-real',review:{status:'reviewed-for-import',reviewer:'test-fixture',evidence:'synthetic test, no provider calls'},outputs:[{jobId:job.jobId,frames:job.frames,promptSha256:job.promptSha256,submittedPromptSha256:job.submittedPromptSha256,referencesSha256:job.referencesSha256,file:'fixture.png',sha256:hash(file),provider:'runway',model:'gen4_image',taskId:'fixture-task-not-real',toolEvidence:'fixture only',observedCredits:null,balanceBefore:null,balanceAfter:null}]};
 const manifestPath=path.join(dir,'manifest.json'),opts={...selection,runDir:path.join(dir,'run'),ledgerPath:path.join(dir,'ledger.json'),manifestPath,provenanceReviewed:true};
 const write=()=>fs.writeFileSync(manifestPath,JSON.stringify(manifest));write();return {dir,plan,manifest,opts,write};
}
test('local plan exposes exact references and hashes; importer stages reviewed external fixture without network/spend/approval',async()=>{
 const f=fixture(),old=global.fetch;global.fetch=async()=>{throw Error('NETWORK FORBIDDEN');};
 try{const result=await importExternal('cazadora',f.opts);assert.equal(result.state,'GENERATED',JSON.stringify(result));assert.equal(result.providerRequestsMade,0);assert.equal(result.artApproval,'NOT_GRANTED');assert.equal(result.externalCredits.observedCreditsTotal,null);assert.equal(fs.existsSync(f.opts.ledgerPath),false);
 const again=await importExternal('cazadora',f.opts);assert.equal(again.reused,true);assert.equal(again.spent_cents,0);
 }finally{global.fetch=old;}
});
test('external evidence must be explicitly reviewed and metadata cannot claim self-authentication',async()=>{
 const f=fixture();await assert.rejects(importExternal('cazadora',{...f.opts,provenanceReviewed:false}),/explicit review/);
 f.manifest.review.status='art-approved';f.write();await assert.rejects(importExternal('cazadora',f.opts),/review evidence/);
});
test('wrong contract, frames, prompt, file hash and external path fail without provider calls',async()=>{
 for(const mutate of [m=>m.contractSha256='0'.repeat(64),m=>m.outputs[0].frames=[999],m=>m.outputs[0].promptSha256='0'.repeat(64),m=>m.outputs[0].sha256='0'.repeat(64),m=>m.outputs[0].file='../outside.png',m=>m.outputs[0].observedCredits=undefined]){
  const f=fixture();mutate(f.manifest);f.write();await assert.rejects(importExternal('cazadora',f.opts));assert.equal(fs.existsSync(f.opts.ledgerPath),false);
 }
});
test('incorrect reference hashes never produce a generated candidate, and pin prevents manifest swapping',async()=>{
 const f=fixture();f.manifest.outputs[0].referencesSha256=['0'.repeat(64),'1'.repeat(64)];f.write();const r=await importExternal('cazadora',f.opts);assert.equal(r.state,'BLOCKED');assert.equal(fs.existsSync(path.join(f.opts.runDir,'atlas.png')),false);
 f.manifest.outputs[0].referencesSha256=f.plan.jobs[0].referencesSha256;f.write();await assert.rejects(importExternal('cazadora',f.opts),/identity changed/);
});
test('observed external credits stay distinct from API cents',async()=>{
 const f=fixture();Object.assign(f.manifest.outputs[0],{observedCredits:8,balanceBefore:500,balanceAfter:492});f.write();const r=await importExternal('cazadora',f.opts);assert.equal(r.externalCredits.observedCreditsTotal,8);assert.equal(r.spent_cents,0);assert.equal(r.externalCredits.sourcePoolId,'fixture-pool-not-real');
});

test('submitted prompt pins actual tagged provider text, mismatched submitted text is rejected',async()=>{
 const f=fixture(),job=f.plan.jobs[0];
 assert.equal(job.submittedPrompt,job.prompt+' @ref1 @ref2 (referencias de identidad y de poses).');
 assert.deepEqual(job.referenceTags,['ref1','ref2']);
 assert.equal(job.submittedPromptSha256,crypto.createHash('sha256').update(job.submittedPrompt).digest('hex'));
 f.manifest.outputs[0].submittedPromptSha256=job.promptSha256;f.write();
 await assert.rejects(importExternal('cazadora',f.opts),/prompt mismatch/);
});

test('supported external connector models retain exact provenance without implying direct API support',async()=>{
 for(const model of ['nano-banana-2']) {
  const f=fixture();f.manifest.outputs[0].model=model;f.write();
  const result=await importExternal('cazadora',f.opts);
  assert.equal(result.state,'GENERATED');assert.equal(result.externalCredits.outputs[0].model,model);
  assert.equal(result.providerRequestsMade,0);assert.equal(result.artApproval,'NOT_GRANTED');
 }
 const f=fixture();f.manifest.outputs[0].model='nano-banana-pro';f.write();
 await assert.rejects(importExternal('cazadora',f.opts),/provider task evidence/);
});
