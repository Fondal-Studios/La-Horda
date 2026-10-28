#!/usr/bin/env node
'use strict';
// Standalone, single-job worker. Inference uses local providers, never this chat or an LLM API.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {getProvider}=require('./providers'),{validateCandidate}=require('./production'),{inspectSheet,sha}=require('./sheet-gate');
async function execute(job,{root=process.cwd(),profile=null}={}){
 const out=path.join(root,job.id);
 if(fs.existsSync(out))return {status:'FAILED',error:'Existing execution journal: inspect before retrying to avoid duplicate generation.'};
 if(job.recipe){
  await getProvider('pixrig').generate(job.recipe,{out});
  const result=validateCandidate(out);
  fs.writeFileSync(path.join(out,'delivery.json'),JSON.stringify(result,null,2)+'\n');
  return {status:result.status,sha256:result.candidate_sha256,technicalPass:result.gate.ok,issues:result.gate.issues.length,artifactDirectory:job.id,provider:'pixrig'};
 }
 if(!profile)return {status:'BLOCKED_MODEL',error:'No local graphic model profile configured. No generation request or paid API call was made.'};
 if(profile.provider!=='comfyui-local')throw Error('Only a locally hosted model is enabled for new art');
 const workflow=JSON.parse(JSON.stringify(profile.workflow));
 // Description is model data only; never shell code or a workflow graph supplied by a player.
 let replaced=false;
 for(const n of Object.values(workflow))if(n.class_type==='CLIPTextEncode'&&typeof n.inputs?.text==='string'&&n.inputs.text.includes('{{description}}')){n.inputs.text=n.inputs.text.replaceAll('{{description}}',job.kind==='repair'?job.description+'\nRepair the existing character using the supplied Codex pixel sprite reference and palette. Preserve identity, costume, weapons and animation semantics. Crisp native pixel art, coherent scale and anatomy across frames, binary transparency. Do not change gameplay.':job.description);replaced=true;}
 if(!replaced)throw Error('Model profile has no description input');
 if(job.reference){
  // The ComfyUI instance must share its configured input directory with this worker.
  if(!profile.inputDirectory||!profile.referenceNode)throw Error('Repair requires a reference image input; refusing unconditioned redesign');
  const ref=path.resolve(__dirname,'../..',job.reference),base=path.resolve(__dirname,'../../assets/ui/codex/champions');
  if(!ref.startsWith(base+path.sep)||!fs.existsSync(ref))throw Error('Reference not found');
  const node=workflow[profile.referenceNode];if(node?.class_type!=='LoadImage')throw Error('Reference input must be a LoadImage node');
  const name='fondal-'+sha(fs.readFileSync(ref))+'.png';fs.copyFileSync(ref,path.join(profile.inputDirectory,name));node.inputs.image=name;
  if(!job.referenceSha256||sha(fs.readFileSync(ref))!==job.referenceSha256)throw Error('Codex reference changed: replan the repair against the current reference');
 }
 const provider=getProvider(profile.provider,{timeoutMs:15*60*1000});
 await provider.generate({workflow,meta:profile.meta,target:{id:job.target},provenance:profile.provenance},{out});
 const gate=inspectSheet(fs.readFileSync(path.join(out,'atlas.png')),profile.meta);
 fs.writeFileSync(path.join(out,'delivery.json'),JSON.stringify({job,gate,installed:false},null,2)+'\n');
 return {status:gate.ok?'AWAITING_VISUAL_REVIEW':'REJECTED',sha256:gate.sha256,technicalPass:gate.ok,issues:gate.issues,artifactDirectory:job.id,provider:profile.provider};
}
async function main(){
 const base=new URL(process.env.FONDAL_ART_API||'http://127.0.0.1:8787');
 if(base.protocol!=='https:'&&!(base.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(base.hostname)))throw Error('Worker credentials require HTTPS or loopback');
 if(base.username||base.password||base.search||base.hash)throw Error('Invalid API URL');
 const token=process.env.FONDAL_ART_WORKER_TOKEN;if(!token||token.length<32)throw Error('FONDAL_ART_WORKER_TOKEN must contain at least 32 characters');
 const root=path.resolve(process.env.FONDAL_ART_OUTPUT||'fondal-production');fs.mkdirSync(root,{recursive:true});
 const profile=process.env.FONDAL_ART_PROFILE?JSON.parse(fs.readFileSync(process.env.FONDAL_ART_PROFILE,'utf8')):null;
 const api=async(route,body)=>{const r=await fetch(base.href.replace(/\/$/,'')+'/api/art-worker/'+route,{method:'POST',redirect:'error',signal:AbortSignal.timeout(30000),headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw Error('Queue HTTP '+r.status);return r.json();};
 const once=process.argv.includes('--once');let stopped=false;process.on('SIGTERM',()=>{stopped=true;});process.on('SIGINT',()=>{stopped=true;});
 do{
  try{
   const {job}=await api('claim',{worker:os.hostname()});
   if(job){
    if(!/^[a-f0-9-]{36}$/.test(job.id))throw Error('Invalid queue job identifier');
    const heartbeat=setInterval(()=>api('heartbeat',{id:job.id,lease:job.lease}).catch(e=>console.error(e.message)),30000);
    let result;try{result=await execute(job,{root,profile});}catch(e){result={status:'FAILED',error:e.message};}finally{clearInterval(heartbeat);}
    // Persist completion before reporting; a lost response cannot lose generated work.
    fs.writeFileSync(path.join(root,job.id+'.receipt.json'),JSON.stringify({id:job.id,lease:job.lease,result},null,2)+'\n');
    await api('finish',{id:job.id,lease:job.lease,result});console.log(JSON.stringify({id:job.id,status:result.status}));
   }
  }catch(e){console.error(e.message);if(once)throw e;}
  if(!once&&!stopped)await new Promise(r=>setTimeout(r,5000));
 }while(!once&&!stopped);
}
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={execute};
