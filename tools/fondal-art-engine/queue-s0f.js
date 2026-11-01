'use strict';
// Adapter, not a second generator: queue -> existing S0F -> staged, reviewed candidate.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const s0f = require('../factory/s0f/s0f');
const {readContract, ROOT} = require('../factory/s0f/contract');
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const digest = file => hash(fs.readFileSync(file));
function profileCheck(profile, env = process.env) {
 if (!profile || profile.provider !== 'runway-s0f') return {ready:false, reason:'Select an explicit runway-s0f worker profile.'};
 if (!Array.isArray(profile.allowedTargets) || !profile.allowedTargets.length || profile.allowedTargets.some(id=>!/^[a-z][a-z0-9_]*$/.test(id))) return {ready:false,reason:'Explicit allowedTargets pilot allowlist required.'};
 for (const key of ['perTaskCents','perBatchCents','perDayCents']) if (!Number.isSafeInteger(profile.limits?.[key]) || profile.limits[key] < 0) return {ready:false,reason:'Explicit nonnegative integer limits required: '+key};
 if (profile.enabled !== true) return {ready:false,reason:'Runway profile disabled; enable only after approving its spending limits.'};
 if (!(env.RUNWAYML_API_SECRET || env.RUNWAY_API_KEY)) return {ready:false,reason:'BLOCKED_CREDENTIAL: RUNWAYML_API_SECRET (or RUNWAY_API_KEY) is absent.'};
 return {ready:true,reason:'Locally configured; credentials and balance are not remotely verified.'};
}
function capabilities(profile, env = process.env) {
 if (profile?.provider === 'runway-s0f') { const check=profileCheck(profile,env); return {provider:profile.provider,ready:check.ready,reason:check.ready?'READY':check.reason.startsWith('BLOCKED_CREDENTIAL')?'BLOCKED_CREDENTIAL':'BLOCKED_MODEL',supports:['repair','animation','native-recipe']}; }
 return {provider:profile?.provider || 'pixrig',ready:!profile,reason:profile?'UNKNOWN':'READY',supports:['native-recipe']};
}
function errorStatus(reason) {
 if (/BLOCKED_CREDENTIAL/.test(reason)) return 'BLOCKED_CREDENTIAL';
 if (/BLOCKED_CREDIT/.test(reason)) return 'BLOCKED_CREDIT';
 if (/BLOCKED_CONTRACT/.test(reason)) return 'BLOCKED_CONTRACT';
 if (/BLOCKED_REQUEST_UNCERTAIN/.test(reason)) return 'PROVIDER_UNCERTAIN';
 if (/BLOCKED_PROVIDER_PENDING|BLOCKED_PENDING|PROVIDER_PENDING/.test(reason)) return 'PROVIDER_PENDING';
 if (/BLOCKED_BUDGET|SpendGuard.*tope|budget/i.test(reason)) return 'BLOCKED_BUDGET';
 return 'FAILED';
}
function ledgerPath(root) { const value=process.env.FONDAL_SPEND_LEDGER; if(value&&!path.isAbsolute(value))throw Error('FONDAL_SPEND_LEDGER must be absolute'); return value||path.join(root,'spend-ledger.json'); }
function atomic(file, data) { fs.mkdirSync(path.dirname(file),{recursive:true}); const tmp=file+'.tmp';fs.writeFileSync(tmp,JSON.stringify(data,null,2)+'\n',{mode:0o600});fs.renameSync(tmp,file); }
async function executeS0F(job, {root,profile,pipeline=s0f,shouldContinue=()=>true} = {}) {
 if (!/^[a-f0-9-]{36}$/.test(job.id || '')) return {status:'BLOCKED_CONTRACT',error:'Invalid durable queue job identifier.'};
 if (job.kind !== 'repair' || !/^[a-z][a-z0-9_]*$/.test(job.target || '')) return {status:'BLOCKED_CONTRACT',error:'Runway queue supports repairing registered champion atlases, not inventing gameplay or arbitrary asset contracts.'};
 if (!Array.isArray(profile?.allowedTargets) || !profile.allowedTargets.includes(job.target)) return {status:'BLOCKED_CONTRACT',error:'Target is outside the explicitly authorized pilot allowlist; no provider request.'};
 if(job.skin && (!Array.isArray(profile.allowedSkins)||!profile.allowedSkins.includes(job.skin)))return {status:'BLOCKED_CONTRACT',error:'Skin is outside the explicitly authorized pilot allowlist.'};
 const contract=readContract(job.target,{skin:job.skin||null});
 if (contract.kind !== 'atlas') return {status:'BLOCKED_CONTRACT',error:contract.reason};
 if (job.action && !contract.clips[job.action]) return {status:'BLOCKED_CONTRACT',error:'Unknown animation clip: '+job.action};
 if (!contract.codexPage || !job.referenceSha256 || digest(path.join(ROOT,contract.codexPage)) !== job.referenceSha256) return {status:'BLOCKED_CONTRACT',error:'Codex reference missing or changed; replan against the current reference.'};
 const out=path.join(root,job.id), runDir=path.join(out,'s0f'), receipt=path.join(out,'delivery.json');
 const identity={target:job.target,skin:job.skin||null,action:job.action||null,contract,sourceSha256:digest(path.join(ROOT,contract.atlas)),referenceSha256:job.referenceSha256,provider:profile?.provider,ledgerPath:ledgerPath(root),model:profile?.model||'gen4_image',ratio:profile?.ratio||'1920:1080'};
 const fingerprint=hash(JSON.stringify(identity));
 if (fs.existsSync(receipt)) {
  const saved=JSON.parse(fs.readFileSync(receipt,'utf8'));
  if (saved.fingerprint !== fingerprint) return {status:'BLOCKED_CONTRACT',error:'Execution inputs changed. Existing candidate is preserved; use a newly planned job.'};
  if (saved.result.status === 'AWAITING_VISUAL_REVIEW' || saved.result.status === 'REJECTED') {
   const atlas=path.join(runDir,'atlas.png');
   if (!fs.existsSync(atlas) || digest(atlas)!==saved.result.sha256) return {status:'FAILED',error:'Candidate integrity mismatch. No generation was retried.'};
   // Revalidate unchanged pixels against the CURRENT evaluator; no provider call.
   try { const evaluated=pipeline.validate(job.target,runDir); const result={...saved.result,status:evaluated.state==='VALIDATED'?'AWAITING_VISUAL_REVIEW':'REJECTED',technicalPass:evaluated.state==='VALIDATED',score:evaluated.score,issues:evaluated.defects||[],reused:true}; atomic(receipt,{fingerprint,result}); return result; }
   catch(e) { return {status:'FAILED',error:'Saved candidate needs review: '+e.message,artifactDirectory:job.id}; }
  }
 }
 const check=profileCheck(profile);
 if (!check.ready) return {status:check.reason.startsWith('BLOCKED_CREDENTIAL')?'BLOCKED_CREDENTIAL':'BLOCKED_MODEL',error:check.reason};
 fs.mkdirSync(out,{recursive:true});
 const identityFile=path.join(out,'input.json');
 if (fs.existsSync(identityFile) && JSON.parse(fs.readFileSync(identityFile,'utf8')).fingerprint!==fingerprint) return {status:'BLOCKED_CONTRACT',error:'Pinned input changed; refusing resume.'};
 atomic(identityFile,{fingerprint,identity});
 let result;
 try {
  const generated=await pipeline.generate(job.target,{kind:job.action?'animation':job.skin?'skin':'champion',skin:job.skin||null,action:job.action||null,provider:'runway',runDir,ledgerPath:ledgerPath(root),shouldContinue,limits:profile.limits,concurrency:1,providerOptions:{model:profile.model||'gen4_image',ratio:profile.ratio||'1920:1080'}});
  if (generated.state==='BLOCKED' || generated.complete_requested===false) {
   const reason=[generated.reason,...(generated.failures||[]).map(f=>f.reason)].filter(Boolean).join('; ');
   result={status:errorStatus(reason),resumable:errorStatus(reason)==='PROVIDER_PENDING',error:reason,artifactDirectory:job.id,provider:'runway',spent_cents:generated.spent_cents||0};
  } else {
   const evaluated=pipeline.validate(job.target,runDir);
   pipeline.preview(job.target,runDir);
   const incomplete=!!generated.partial_blocked || (generated.failures||[]).length>0;
   result={status:evaluated.state==='VALIDATED'&&!incomplete?'AWAITING_VISUAL_REVIEW':'REJECTED',sha256:digest(path.join(runDir,'atlas.png')),technicalPass:evaluated.state==='VALIDATED'&&!incomplete,artifactDirectory:job.id,provider:'runway',score:evaluated.score,coverage_generated_pct:generated.coverage_pct,spent_cents:generated.spent_cents||0,issues:evaluated.defects||[],error:incomplete?'Partial generation; no approval or installation. '+(generated.partial_blocked||JSON.stringify(generated.failures)):evaluated.state==='VALIDATED'?null:'Automatic quality gate rejected this candidate.',installed:false};
  }
 } catch(e) { result={status:errorStatus(e.message),resumable:errorStatus(e.message)==='PROVIDER_PENDING',error:e.message,artifactDirectory:job.id,provider:'runway'}; }
 atomic(receipt,{fingerprint,result});
 return result;
}
module.exports={executeS0F,capabilities,profileCheck,errorStatus};
