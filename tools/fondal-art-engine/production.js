#!/usr/bin/env node
'use strict';
// Real production in isolated staging; explicit hash-bound promotion into existing consumers.
const fs=require('node:fs'),path=require('node:path');
const {isDeepStrictEqual}=require('node:util');
const {execFileSync}=require('node:child_process');
const {getProvider}=require('./providers');
const {inspectSheet,sha}=require('./sheet-gate');
const {decodePNG}=require('./pixel-gate');
const ROOT=path.resolve(__dirname,'../..');
function within(root,rel){
 if(typeof rel!=='string'||!rel||path.isAbsolute(rel)||rel.includes('\\')||rel.split('/').includes('..'))throw Error('Unsafe path');
 const p=path.resolve(root,rel);if(!p.startsWith(path.resolve(root)+path.sep))throw Error('Unsafe path');
 let cursor=p;
 while(cursor!==path.resolve(root)){if(fs.existsSync(cursor)&&fs.lstatSync(cursor).isSymbolicLink())throw Error('Symlink path');cursor=path.dirname(cursor);}
 return p;
}
function readBaseline(target,root=ROOT){
 if(!target||!/^assets\/.+\.png$/.test(target.png)||!/^js\/assets\/[\w-]+\.js$/.test(target.meta_file)||!/^\w+$/.test(target.const)||!/^\w+$/.test(target.key))throw Error('Invalid existing registry target');
 const source=fs.readFileSync(within(root,target.meta_file),'utf8');
 const match=source.match(new RegExp('const\\s+'+target.const+'\\s*=\\s*(\\{.*?\\});\\s*$','ms'));
 if(!match)throw Error('Registry is not a literal JSON object');
 const entry=JSON.parse(match[1])[target.key];
 if(!entry||entry.src!==target.png)throw Error('Target is not registered in existing renderer');
 const file=within(root,target.png),bytes=fs.readFileSync(file);
 return {entry,bytes,sha256:sha(bytes),file,registry_sha256:sha(Buffer.from(source))};
}
function validateCandidate(dir,root=ROOT){
 const provider=JSON.parse(fs.readFileSync(path.join(dir,'provider.json'),'utf8'));
 const baseline=readBaseline(provider.target,root);
 const bytes=fs.readFileSync(path.join(dir,'atlas.png'));
 const gate=inspectSheet(bytes,provider.meta,baseline.entry.meta);
 const metadataUnchanged=isDeepStrictEqual(provider.meta,baseline.entry.meta);
 const pad=provider.overscan_padding;
 const adjusted={...baseline.entry.meta,w:baseline.entry.meta.w+2*pad,h:baseline.entry.meta.h+2*pad,
  anchor:(baseline.entry.meta.anchor*baseline.entry.meta.h+pad)/(baseline.entry.meta.h+2*pad)};
 const geometryPreservedOverscan=provider.provider==='pixrig'&&provider.recipe==='angel_corrompido'&&Number.isInteger(pad)&&pad>0&&pad<=64&&isDeepStrictEqual(provider.meta,adjusted);
 if(!metadataUnchanged&&!geometryPreservedOverscan){gate.ok=false;gate.status='FIX';gate.issues.push({code:'METADATA_CHANGED',note:'Requires separate reviewed registry migration; no implicit scale/anchor changes'});}
 const old=decodePNG(baseline.bytes);
 const identical=gate.width===old.width&&gate.height===old.height&&gate.rgba_sha256===sha(old.pixels);
 return {schema:'fondal-art-engine.delivery.v1',provider:provider.provider,recipe:provider.recipe||null,
  target:provider.target,meta:provider.meta,baseline_sha256:baseline.sha256,registry_sha256:baseline.registry_sha256,
  candidate_sha256:sha(bytes),gate,status:gate.ok?(identical?'REUSED':'AWAITING_VISUAL_REVIEW'):'REJECTED',
  identicalPixels:identical,metadataUnchanged,geometryPreservedOverscan,installed:false,api_cost_usd:provider.api_cost_usd,
  provenance:provider.provenance};
}
async function produce(jobs,out,{root=ROOT}={}){
 const dest=path.join(fs.realpathSync(path.dirname(path.resolve(out))),path.basename(out));
 if(dest===root||root.startsWith(dest+path.sep)||['assets','js','art-source'].some(p=>dest===path.join(root,p)||dest.startsWith(path.join(root,p)+path.sep)))throw Error('Use isolated staging output');
 // Exclusive directory prevents reuse of stale receipts and concurrent job collisions.
 fs.mkdirSync(dest,{recursive:false});
 const ids=new Set();
 for(const job of jobs){if(!/^[a-zA-Z0-9_-]+$/.test(job.id)||ids.has(job.id))throw Error('Invalid/duplicate job id');ids.add(job.id);}
 const summary={schema:'fondal-art-engine.run.v1',started_at:new Date().toISOString(),generated:0,corrected:0,integrated:0,reused:0,rejected:0,failed:0,pending:0,api_cost_usd:0,jobs:[]};
 for(const job of jobs){
  const dir=within(dest,job.id);let item;
  try{
   const provider=getProvider(job.provider);
   const estimate=await provider.estimate(job);
   if(!estimate.executable||estimate.estimated_cost!==0)throw Error('Only executable zero-API-cost providers enabled');
   console.log('Generating '+job.id+' ('+job.provider+')');
   await provider.generate(job,{out:dir});summary.generated++;
   item=validateCandidate(dir,root);item.id=job.id;
   if(item.gate.ok&&item.geometryPreservedOverscan)summary.corrected++;
   if(item.status==='REUSED')summary.reused++;
   else if(item.status==='REJECTED')summary.rejected++;
   else summary.pending++;
   fs.writeFileSync(path.join(dir,'delivery.json'),JSON.stringify(item,null,2)+'\n');
   console.log(job.id+': '+item.status+' ('+item.gate.issues.length+' issues)');
  }catch(e){summary.failed++;item={id:job.id,status:'FAILED',error:e.message};console.error(job.id+': '+e.message);}
  summary.jobs.push(item);
  summary.remaining=summary.pending+summary.rejected+summary.failed;
  summary.finished_at=new Date().toISOString();
  fs.writeFileSync(path.join(dest,'summary.json'),JSON.stringify(summary,null,2)+'\n');
 }
 return summary;
}
function promote(dir,reviewFile,{root=ROOT}={}){
 const current=validateCandidate(dir,root);
 if(!current.gate.ok)throw Error('Candidate failed technical gate');
 if(current.status==='REUSED')return {...current,action:'REUSED_NO_WRITE'};
 const review=JSON.parse(fs.readFileSync(reviewFile,'utf8'));
 if(review.status!=='PASS'||!review.reviewed_by||review.candidate_sha256!==current.candidate_sha256||review.baseline_sha256!==current.baseline_sha256||review.registry_sha256!==current.registry_sha256)throw Error('Missing or stale hash-bound visual approval');
 for(const field of ['visual_evidence','runtime_evidence']){
  const e=review[field];
  if(!e?.path||!e.sha256||sha(fs.readFileSync(within(root,e.path)))!==e.sha256)throw Error('Missing or stale '+field);
 }
 // Runtime must explicitly identify the candidate and successful tests; a filename alone is not evidence.
 const runtime=JSON.parse(fs.readFileSync(within(root,review.runtime_evidence.path),'utf8'));
 if(runtime.status!=='PASS'||runtime.candidate_sha256!==current.candidate_sha256)throw Error('Runtime evidence does not pass for this candidate');
 const src=path.join(dir,'atlas.png'),target=within(root,current.target.png);
 const baseline=readBaseline(current.target,root);
 const registry=within(root,current.target.meta_file);
 const webp=target.replace(/\.png$/,'.webp');
 const publication=path.join(dir,'publication');
 fs.mkdirSync(publication);
 execFileSync(process.env.PYTHON||'python3',[path.join(__dirname,'normalize.py'),src,path.join(publication,'atlas.png')],{timeout:60000});
 const writes=[{target,bytes:fs.readFileSync(src)}];
 if(fs.existsSync(webp))writes.push({target:webp,bytes:fs.readFileSync(path.join(publication,'atlas.webp'))});
 if(!current.metadataUnchanged){
  const text=fs.readFileSync(registry,'utf8');
  const re=new RegExp('(const\\s+'+current.target.const+'\\s*=\\s*)(\\{.*?\\})(;\\s*$)','ms');
  const match=text.match(re);if(!match)throw Error('Registry changed');
  const data=JSON.parse(match[2]);data[current.target.key].meta=current.meta;
  const updated=text.slice(0,match.index)+match[1]+JSON.stringify(data)+match[3]+text.slice(match.index+match[0].length);
  writes.push({target:registry,bytes:Buffer.from(updated)});
 }
 const backup=path.join(dir,'rollback');fs.mkdirSync(backup);
 const lock=path.join(root,'.fondal-promotion.lock');fs.mkdirSync(lock);
 const originals=[];
 try{
  if(sha(fs.readFileSync(target))!==current.baseline_sha256||sha(fs.readFileSync(registry))!==current.registry_sha256)throw Error('Baseline changed during promotion');
  for(const [i,w] of writes.entries()){
   const bytes=fs.readFileSync(w.target);originals.push({target:w.target,bytes});
   fs.writeFileSync(path.join(backup,String(i)),bytes,{flag:'wx'});
   fs.writeFileSync(w.target+'.fondal-tmp',w.bytes,{flag:'wx'});
  }
  try{for(const w of writes)fs.renameSync(w.target+'.fondal-tmp',w.target);}
  catch(e){for(const w of originals)fs.writeFileSync(w.target,w.bytes);throw e;}
  fs.writeFileSync(path.join(backup,'manifest.json'),JSON.stringify(originals.map((w,i)=>({target:path.relative(root,w.target),backup:String(i),sha256:sha(w.bytes)})),null,2));
 }finally{
  for(const w of writes)if(fs.existsSync(w.target+'.fondal-tmp'))fs.unlinkSync(w.target+'.fondal-tmp');
  fs.rmdirSync(lock);
 }
 const result={...current,status:'INTEGRATED',installed:true,reviewed_by:review.reviewed_by,rollback:backup};
 fs.writeFileSync(path.join(dir,'integration.json'),JSON.stringify(result,null,2)+'\n');return result;
}
async function main(args){
 const [command,...rest]=args;
 if(command==='generate'){
  const [file,out]=rest;if(!file||!out)throw Error('generate jobs.json NEW_OUTPUT_DIRECTORY');
  const jobs=JSON.parse(fs.readFileSync(file,'utf8')).jobs;
  if(!Array.isArray(jobs)||!jobs.length)throw Error('Non-empty jobs required');
  const r=await produce(jobs,out);return r.failed||r.rejected?1:0;
 }
 if(command==='validate'){const r=validateCandidate(rest[0]);console.log(JSON.stringify(r,null,2));return r.gate.ok?0:1;}
 if(command==='promote'){console.log(JSON.stringify(promote(rest[0],rest[1]),null,2));return 0;}
 throw Error('Use generate jobs.json new-output | validate candidate-dir | promote candidate-dir review.json');
}
module.exports={within,readBaseline,validateCandidate,produce,promote};
if(require.main===module)main(process.argv.slice(2)).then(code=>{process.exitCode=code;}).catch(e=>{console.error(e.message);process.exitCode=2;});
