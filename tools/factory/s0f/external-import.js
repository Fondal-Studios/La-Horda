'use strict';
// Explicit, reviewed transfer of already generated pixels. This module NEVER submits provider requests.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const {readContract,ROOT}=require('./contract'),s0f=require('./s0f');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),fileHash=f=>hash(fs.readFileSync(f));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
// External connector model IDs only: this does not enable these models in the direct Runway API provider.
const EXTERNAL_MODELS = ['gen4_image','gen4_image_turbo','gen-4','gen-4-image-turbo','nano-banana-2'];
// Must match RunwayProvider's submitted text, not merely the internal untagged planning prompt.
const submittedPrompt=(prompt,count)=>{ const text=prompt+' '+Array.from({length:count},(_,i)=>'@ref'+(i+1)).join(' ')+' (referencias de identidad y de poses).'; if(typeof prompt!=='string'||!prompt.trim()||text.length>1000||count<1||count>3)throw Error('Runway submitted prompt exceeds 1000 UTF-16 units or reference limit; never truncate'); return text; };
function absolute(p,label){if(typeof p!=='string'||!path.isAbsolute(p))throw Error(label+' must be absolute');return path.resolve(p);}
function write(file,value){fs.mkdirSync(path.dirname(file),{recursive:true});const tmp=file+'.'+crypto.randomUUID()+'.tmp';fs.writeFileSync(tmp,JSON.stringify(value,null,2)+'\n',{mode:0o600});fs.renameSync(tmp,file);}
function selection(id,opts){const kind=opts.kind||'champion',skin=opts.skin||null,action=opts.action||null;if(!['champion','animation','skin'].includes(kind)||kind==='animation'&&!action||kind==='skin'&&!skin)throw Error('Invalid external import selection');const contract=readContract(id,{skin});if(contract.kind!=='atlas')throw Error(contract.reason);const generationMode=opts.generationMode||'strip',frameClips=generationMode==='single-frame'?(opts.frameClips||['walk_down']):null,frameIndices=opts.frameIndices||null;return {kind,skin,action,generationMode,frameClips,frameIndices,contract,jobs:s0f.plan(contract,{kind,skin,action,generationMode,frameClips,frameIndices})};}
function prepareExternalPlan(id,{preparationDir,...opts}={}){
 const dir=absolute(preparationDir,'preparationDir'),selected=selection(id,opts);if(fs.existsSync(dir)&&fs.readdirSync(dir).length)throw Error('Preparation directory is not empty; preserve previous evidence and use a new versioned directory');fs.mkdirSync(dir,{recursive:true});
 const contractFile=path.join(dir,'contract.json');write(contractFile,selected.contract);
 const jobs=selected.jobs.map(job=>{
  const references=s0f.prepareReferences(contractFile,job,dir);
  const submitted=submittedPrompt(job.prompt,references.length);
  return {jobId:job.id,generationMethod:job.generationMethod||'strip',guidePhase:job.guidePhase??null,...(job.recipe?{recipe:job.recipe}:{}),referenceRecipe:job.referenceRecipe,frames:job.frames,prompt:job.prompt,promptSha256:hash(job.prompt),submittedPrompt:submitted,submittedPromptSha256:hash(submitted),referenceTags:references.map((_,i)=>'ref'+(i+1)),references,referencesSha256:references.map(fileHash)};
 });
 return {schema:'fondal.external-runway.plan.v1',champion:id,kind:selected.kind,action:selected.action,skin:selected.skin,generationMode:selected.generationMode,frameClips:selected.frameClips,frameIndices:selected.frameIndices,contractSha256:hash(JSON.stringify(selected.contract)),jobs,note:'Local preparation only. No generation, spend, quality approval or proof of provider provenance.'};
}
function localOutput(base,relative){
 if(typeof relative!=='string'||path.isAbsolute(relative)||relative.includes('\\')||path.posix.normalize(relative)!==relative||relative==='..'||relative.startsWith('../'))throw Error('Output file must be a canonical path within the manifest directory');
 const file=path.resolve(base,relative);if(!file.startsWith(base+path.sep)||fs.realpathSync(file)!==file||!fs.statSync(file).isFile()||fs.statSync(file).size>32*1024*1024)throw Error('Unsafe external output file');return file;
}
function observation(n){return n===null||(Number.isFinite(n)&&n>=0);}
async function importExternal(id,{runDir,manifestPath,ledgerPath,provenanceReviewed=false,...opts}={}){
 const dir=absolute(runDir,'runDir'),manifestFile=absolute(manifestPath,'manifestPath'),ledger=absolute(ledgerPath,'ledgerPath');
 if(provenanceReviewed!==true)throw Error('External provenance requires explicit review before import; a manifest does not authenticate itself');
 if(fs.realpathSync(manifestFile)!==manifestFile||fs.statSync(manifestFile).size>1024*1024)throw Error('Unsafe external manifest');
 const bytes=fs.readFileSync(manifestFile),manifest=JSON.parse(bytes),selected=selection(id,opts),contractHash=hash(JSON.stringify(selected.contract));
 if(manifest.schema!=='fondal.external-runway.v1'||manifest.champion!==id||manifest.kind!==selected.kind||manifest.action!==selected.action||manifest.skin!==selected.skin||manifest.contractSha256!==contractHash||(manifest.generationMode||'strip')!==selected.generationMode||!same(manifest.frameClips??null,selected.frameClips)||!same(manifest.frameIndices??null,selected.frameIndices))throw Error('Manifest selection/contract mismatch');
 if(typeof manifest.sourcePoolId!=='string'||!manifest.sourcePoolId.trim()||manifest.sourcePoolId.length>256||manifest.review?.status!=='reviewed-for-import'||typeof manifest.review.reviewer!=='string'||!manifest.review.reviewer.trim()||typeof manifest.review.evidence!=='string'||!manifest.review.evidence.trim())throw Error('Missing external pool and provenance review evidence');
 if(!Array.isArray(manifest.outputs)||manifest.outputs.length!==selected.jobs.length)throw Error('Manifest must cover exactly every requested plan job');
 const outputs=new Map(),taskIds=new Set(),base=path.dirname(manifestFile);
 for(const entry of manifest.outputs){
  const planned=selected.jobs.find(j=>j.id===entry.jobId);
  if(!planned||outputs.has(entry.jobId)||!same(planned.frames,entry.frames)||entry.promptSha256!==hash(planned.prompt)||entry.submittedPromptSha256!==hash(submittedPrompt(planned.prompt,2))||!Array.isArray(entry.referencesSha256)||entry.referencesSha256.length!==2||entry.referencesSha256.some(h=>! /^[a-f0-9]{64}$/.test(h)))throw Error('Manifest job/frame/prompt mismatch');
  if(entry.provider!=='runway'||!EXTERNAL_MODELS.includes(entry.model)||typeof entry.taskId!=='string'||!entry.taskId.trim()||taskIds.has(entry.taskId)||typeof entry.toolEvidence!=='string'||!entry.toolEvidence.trim())throw Error('Missing or duplicate provider task evidence');
  for(const key of ['observedCredits','balanceBefore','balanceAfter'])if(!observation(entry[key]))throw Error('Credits/balance must be observed nonnegative values or explicit null (unknown)');
  const file=localOutput(base,entry.file);if(fileHash(file)!==entry.sha256)throw Error('External output integrity mismatch');
  outputs.set(entry.jobId,{...entry,file});taskIds.add(entry.taskId);
 }
 // Immutable per-run pin prevents swapping the manifest while retaining S0F's cached delivery.
 fs.mkdirSync(dir,{recursive:true});const pinFile=path.join(dir,'external-import.json'),pin={manifestSha256:hash(bytes),ledgerPath:ledger,sourcePoolId:manifest.sourcePoolId};
 try{fs.writeFileSync(pinFile,JSON.stringify(pin),{flag:'wx',mode:0o600});}catch(e){if(e.code!=='EEXIST'||!same(JSON.parse(fs.readFileSync(pinFile)),pin))throw Error('External import identity changed; preserve prior run and review a new one');}
 const provider={name:'external-runway',estimate:()=>({estimated_cents_max:0,note:'Import has no provider calls; external credits are recorded separately, never converted to cents.'}),generate:async job=>{
  const entry=outputs.get(job.id);if(!entry||!same(job.frames,entry.frames)||hash(job.prompt)!==entry.promptSha256||hash(submittedPrompt(job.prompt,job.references.length))!==entry.submittedPromptSha256||!same(job.references.map(fileHash),entry.referencesSha256)||fileHash(entry.file)!==entry.sha256)throw Error('External input/reference/output hashes do not match the exact S0F job');
  return {status:'GENERATED',cached:true,file:entry.file,cost_cents:0,taskId:entry.taskId};
 }};
 const result=await s0f.generate(id,{kind:selected.kind,action:selected.action,skin:selected.skin,generationMode:selected.generationMode,frameClips:selected.frameClips,frameIndices:selected.frameIndices,runDir:dir,ledgerPath:ledger,provider:'external-runway',providers:{'external-runway':provider},concurrency:1,limits:{perTaskCents:0,perBatchCents:0,perDayCents:0}});
 const evidence={schema:'fondal.external-credits.v1',sourcePoolId:manifest.sourcePoolId,manifestSha256:pin.manifestSha256,provenance:'Supplied external tool evidence, explicitly reviewed for import; not cryptographically authenticated by this module.',review:manifest.review,outputs:manifest.outputs.map(({jobId,provider,model,taskId,toolEvidence,observedCredits,balanceBefore,balanceAfter,sha256,promptSha256,submittedPromptSha256,referencesSha256})=>({jobId,provider,model,taskId,toolEvidence,observedCredits,balanceBefore,balanceAfter,sha256,promptSha256,submittedPromptSha256,referencesSha256})),creditsKnown:manifest.outputs.every(x=>x.observedCredits!==null),observedCreditsTotal:manifest.outputs.every(x=>x.observedCredits!==null)?manifest.outputs.reduce((n,x)=>n+x.observedCredits,0):null};
 write(path.join(dir,'external-credits.json'),evidence);
 return {...result,externalCredits:evidence,providerRequestsMade:0,artApproval:'NOT_GRANTED'};
}
module.exports={importExternal,prepareExternalPlan};
