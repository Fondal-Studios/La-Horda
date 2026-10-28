'use strict';
const fs=require('node:fs'),path=require('node:path');
const {execFile}=require('node:child_process');
const {promisify}=require('node:util');
const run=promisify(execFile);
const ROOT=path.resolve(__dirname,'../..');
class ProviderError extends Error {}
class DryRunProvider{
 constructor(){this.name='dry-run';}
 async estimate(job){return {provider:this.name,job_id:job.id,currency:'USD',estimated_cost:0,executable:false};}
 async generate(job){return {provider:this.name,job_id:job.id,status:'NOT_GENERATED',files:[]};}
}
class PixrigProvider{
 constructor(){this.name='pixrig';}
 async estimate(job){return {provider:this.name,job_id:job.id,currency:'USD',estimated_cost:0,executable:true};}
 async generate(job,{out}={}){
  if(!out||!job.recipe)throw new ProviderError('pixrig requires recipe and staging output');
  await run(process.env.PYTHON||'python3',[path.join(__dirname,'pixrig-stage.py'),'--recipe',job.recipe,'--out',out,'--padding',String(job.padding||0)],{cwd:ROOT,timeout:600000,maxBuffer:1024*1024});
  return {...JSON.parse(fs.readFileSync(path.join(out,'provider.json'),'utf8')),status:'GENERATED',files:['atlas.png','atlas.webp','contact.png']};
 }
}
// Local, offline ComfyUI only. Remote/paid nodes are not an implicit budget authorization.
const COMFY_NODES=new Set(['CheckpointLoaderSimple','CLIPTextEncode','EmptyLatentImage','KSampler','VAEDecode','VAEEncode','LoadImage','SaveImage']);
function validateWorkflow(workflow){
 if(!workflow||Array.isArray(workflow)||!Object.keys(workflow).length)throw new ProviderError('Expected ComfyUI API workflow object');
 let saves=0;
 for(const node of Object.values(workflow)){
  if(!node||!COMFY_NODES.has(node.class_type))throw new ProviderError('Unsupported or potentially paid ComfyUI node');
  if(node.class_type==='SaveImage')saves++;
 }
 if(saves!==1)throw new ProviderError('Workflow must have exactly one SaveImage output');
}
class ComfyUIProvider{
 constructor({baseURL=process.env.FONDAL_COMFY_URL||'http://127.0.0.1:8188',timeoutMs=300000,pollMs=1000}={}){
  const u=new URL(baseURL);
  if(u.protocol!=='http:'||!['127.0.0.1','[::1]','localhost'].includes(u.hostname)||u.username||u.password||u.pathname!=='/'||u.search||u.hash)throw new ProviderError('Only local offline ComfyUI is enabled; no remote spending authorized');
  this.base=u.origin;this.name='comfyui-local';this.timeoutMs=timeoutMs;this.pollMs=pollMs;
 }
 async estimate(job){return {provider:this.name,job_id:job.id,currency:'USD',estimated_cost:0,executable:true,note:'Local compute/model required; no paid API nodes'};}
 async generate(job,{out}={}){
  validateWorkflow(job.workflow);
  if(!out||!job.meta||!job.target||!job.provenance)throw new ProviderError('ComfyUI requires staging, meta, target and model/license provenance');
  fs.mkdirSync(out,{recursive:false});
  const signal=AbortSignal.timeout(this.timeoutMs);
  const request=async(route,options={})=>{
   const r=await fetch(this.base+route,{...options,signal,redirect:'error'});
   if(!r.ok)throw new ProviderError('ComfyUI HTTP '+r.status);
   return r;
  };
  // Never retry POST /prompt: a lost response could otherwise duplicate production.
  const prompt=await (await request('/prompt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:job.workflow})})).json();
  if(!prompt.prompt_id||Object.keys(prompt.node_errors||{}).length)throw new ProviderError('ComfyUI rejected workflow');
  fs.writeFileSync(path.join(out,'request.json'),JSON.stringify({prompt_id:prompt.prompt_id}));
  let result;
  while(!result){
   signal.throwIfAborted();
   const history=await (await request('/history/'+encodeURIComponent(prompt.prompt_id))).json();
   const h=history[prompt.prompt_id];
   if(h?.status?.status_str==='error')throw new ProviderError('ComfyUI generation failed');
   if(h?.status?.completed)result=h;
   else await new Promise(resolve=>setTimeout(resolve,this.pollMs));
  }
  const images=Object.values(result.outputs||{}).flatMap(o=>o.images||[]).filter(i=>i.type==='output');
  if(images.length!==1)throw new ProviderError('Expected one complete spritesheet, received '+images.length);
  const response=await request('/view?'+new URLSearchParams(images[0]));
  const chunks=[];let size=0;
  for await(const chunk of response.body){size+=chunk.length;if(size>32*1024*1024)throw new ProviderError('Provider image exceeds 32 MiB');chunks.push(chunk);}
  const bytes=Buffer.concat(chunks);
  fs.writeFileSync(path.join(out,'source.png'),bytes,{flag:'wx'});
  await run(process.env.PYTHON||'python3',[path.join(__dirname,'normalize.py'),path.join(out,'source.png'),path.join(out,'atlas.png')],{timeout:60000,maxBuffer:1024*1024});
  require('./pixel-gate').decodePNG(fs.readFileSync(path.join(out,'atlas.png')));
  const receipt={provider:this.name,meta:job.meta,target:job.target,provenance:job.provenance,prompt_id:prompt.prompt_id,api_cost_usd:0,status:'GENERATED',files:['atlas.png','atlas.webp','source.png']};
  fs.writeFileSync(path.join(out,'provider.json'),JSON.stringify(receipt,null,2)+'\n');
  return receipt;
 }
}
function getProvider(name='dry-run',options={}){
 if(name==='dry-run')return new DryRunProvider();
 if(name==='pixrig')return new PixrigProvider();
 if(name==='comfyui-local')return new ComfyUIProvider(options);
 throw new ProviderError('Provider '+name+' is not configured. No external request was made.');
}
module.exports={ProviderError,DryRunProvider,PixrigProvider,ComfyUIProvider,getProvider,validateWorkflow};
