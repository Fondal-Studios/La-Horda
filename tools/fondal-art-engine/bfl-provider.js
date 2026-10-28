'use strict';
const fs=require('node:fs'),path=require('node:path'),{execFile}=require('node:child_process');
const run=require('node:util').promisify(execFile);
// One persistent ledger for the entire user-authorized USD 5 trial, NOT per champion.
// Reserve USD .25 per submission conservatively, never refund uncertain/failed POSTs.
// Current documented Klein 4B price for <=4MP output + 2 references is much lower.
const CAP_CENTS=500,RESERVE_CENTS=25;
function reserve(file,id){
 const ledger=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{schema:'fondal.bfl-trial.v1',reservedCents:0,jobs:[]};
 if(ledger.schema!=='fondal.bfl-trial.v1'||!Number.isSafeInteger(ledger.reservedCents)||ledger.reservedCents<0||!Array.isArray(ledger.jobs)||ledger.reservedCents!==ledger.jobs.length*RESERVE_CENTS)throw Error('Invalid trial ledger; refusing spend');
 if(ledger.jobs.some(j=>j.id===id))throw Error('Submission already reserved; inspect journal instead of regenerating');
 if(ledger.reservedCents+RESERVE_CENTS>CAP_CENTS)throw Error('Trial budget exhausted');
 ledger.reservedCents+=RESERVE_CENTS;ledger.jobs.push({id,reservedCents:RESERVE_CENTS,at:new Date().toISOString()});
 const temp=file+'.tmp';const fd=fs.openSync(temp,'wx',0o600);
 try{fs.writeFileSync(fd,JSON.stringify(ledger,null,2)+'\n');fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
 fs.renameSync(temp,file);const parent=fs.openSync(path.dirname(file),'r');try{fs.fsyncSync(parent);}finally{fs.closeSync(parent);}
 return ledger;
}
function trustedURL(value,kind){
 const u=new URL(value);
 const bfl=/^api(?:\.[a-z0-9-]+)?\.bfl\.ai$/.test(u.hostname);
 const sample=bfl||u.hostname.endsWith('.bfl.ai')||u.hostname.endsWith('.blob.core.windows.net')||u.hostname.endsWith('.amazonaws.com');
 if(u.protocol!=='https:'||u.username||u.password||u.port||(kind==='poll'?!bfl:!sample))throw Error('Untrusted BFL '+kind+' URL');
 return u.href;
}
class BFLProvider{
 constructor({fetchImpl=fetch,pollMs=1000,timeoutMs=300000}={}){this.name='bfl-klein-trial';this.fetch=fetchImpl;this.pollMs=pollMs;this.timeoutMs=timeoutMs;}
 async estimate(job){return {provider:this.name,job_id:job.id,currency:'USD',estimated_cost:0.018,executable:true,note:'Documented Klein 4B estimate for 3MP output + 2 references; billed cost recorded separately, explicit trial authorization required'};}
 async generate(job,{out}={}){
  const key=process.env.BFL_API_KEY,ledger=process.env.FONDAL_BFL_LEDGER;
  if(!key)throw Error('BLOCKED_CREDENTIAL: configure BFL_API_KEY as a private worker secret');
  if(process.env.FONDAL_BFL_TRIAL!=='approved-2026-10-28-usd5'||!ledger||!path.isAbsolute(ledger))throw Error('Explicit approved trial and persistent absolute FONDAL_BFL_LEDGER required');
  if(!out||!job.prompt||!job.meta||!job.target||!Array.isArray(job.references)||job.references.length!==2)throw Error('Repair requires Codex + existing atlas references, metadata and target');
  const inputs=job.references.map(p=>{const b=fs.readFileSync(p);if(b.length>8*1024*1024)throw Error('Reference exceeds 8MiB');return b.toString('base64');});
  fs.mkdirSync(path.dirname(ledger),{recursive:true});
  const lock=ledger+'.lock';fs.mkdirSync(lock); // Exclusive across the complete request lifecycle.
  try{
   if(fs.existsSync(ledger+'.halt'))throw Error('Trial halted: review provider billing');
   fs.mkdirSync(out,{recursive:false});reserve(ledger,path.resolve(out));
   const signal=AbortSignal.timeout(this.timeoutMs);
   const req=async(url,options={})=>{const r=await this.fetch(url,{...options,signal,redirect:'error'});if(!r.ok)throw Error('BFL HTTP '+r.status);return r;};
   const headers={'content-type':'application/json','x-key':key};
   // No automatic resubmission: a network failure may still have incurred a charge.
   const task=await(await req('https://api.bfl.ai/v1/flux-2-klein-4b',{method:'POST',headers,body:JSON.stringify({prompt:job.prompt,input_image:inputs[0],input_image_2:inputs[1],width:1024,height:2304,output_format:'png',seed:job.seed||232})})).json();
   if(!task.id||!task.polling_url)throw Error('BFL returned no task');
   const poll=trustedURL(task.polling_url,'poll');
   fs.writeFileSync(path.join(out,'request.json'),JSON.stringify({id:task.id,polling_url:poll,costCredits:task.cost??null},null,2),{mode:0o600});
   // BFL documents 1 credit = USD .01. Unexpected cost blocks further work.
   if(task.cost!=null&&(!Number.isFinite(task.cost)||task.cost>RESERVE_CENTS)){fs.writeFileSync(ledger+'.halt','Unexpected provider price; review billing before further requests');throw Error('Unexpected BFL price; trial halted');}
   let result;
   while(!result){
    signal.throwIfAborted();const r=await(await req(poll,{headers:{'x-key':key}})).json();
    if(r.status==='Ready')result=r.result;
    else if(['Error','Failed','Request Moderated','Content Moderated','Task not found'].includes(r.status))throw Error('BFL task ended: '+r.status);
    else await new Promise(resolve=>setTimeout(resolve,this.pollMs));
   }
   const response=await req(trustedURL(result.sample,'sample')); // Never send API key to image storage.
   const chunks=[];let size=0;for await(const c of response.body){size+=c.length;if(size>32*1024*1024)throw Error('BFL image exceeds 32MiB');chunks.push(c);}
   fs.writeFileSync(path.join(out,'source.png'),Buffer.concat(chunks),{flag:'wx'});
   await run(process.env.PYTHON||'python3',[path.join(__dirname,'normalize.py'),path.join(out,'source.png'),path.join(out,'atlas.png')],{timeout:60000});
   const receipt={provider:this.name,target:job.target,meta:job.meta,prompt_id:task.id,provenance:'BFL FLUX.2 klein 4B; Codex plus original sprite atlas references',api_cost_usd:task.cost==null?null:Number((task.cost/100).toFixed(6)),budget_reserved_usd:RESERVE_CENTS/100,installed:false};
   fs.writeFileSync(path.join(out,'provider.json'),JSON.stringify(receipt,null,2)+'\n');return receipt;
  }finally{fs.rmdirSync(lock);}
 }
}
module.exports={BFLProvider,reserve,trustedURL,CAP_CENTS,RESERVE_CENTS};
