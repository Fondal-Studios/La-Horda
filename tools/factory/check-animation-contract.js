'use strict';
// Declaration compatibility only. Art, actual abilities and multiplayer still need their own gates.
const fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'../..');
function extract(source,key){
 if(!/^[a-z0-9_]+$/.test(key))throw Error('Invalid pack key');
 const matches=[...source.matchAll(new RegExp('^[ \\t]*champPackLoadAtlas\\("'+key+'",\\s*"([^"]+)",\\s*(\\{[^\\n]+\\})\\);','gm'))];
 if(matches.length!==1)throw Error('Expected one literal atlas registration for '+key);
 return {src:matches[0][1],meta:JSON.parse(matches[0][2])};
}
function consumed(source,symbol){
 if(!/^[A-Za-z_][A-Za-z_0-9]*$/.test(symbol))throw Error('Invalid runtime symbol');
 return [...new Set([...source.matchAll(new RegExp('_smFrame\\(\\s*'+symbol+'\\s*,\\s*"([^"]+)"','g'))].map(x=>x[1]))].sort();
}
function compare(baseline,candidate,size,required=[]){
 const issues=[],B=baseline.sets||{},C=candidate.sets||{},integer=n=>Number.isInteger(n)&&n>0;
 if(!integer(candidate.w)||!integer(candidate.h)||!integer(candidate.cols)||!Array.isArray(size)||size.length!==2||!size.every(integer)||size[0]!==candidate.w*candidate.cols||size[1]%candidate.h!==0)
  return {status:'REJECT',coverage:'DECLARED_ANIMATION_CONTRACT_ONLY',approvalClaimed:false,installed:false,issues:[{code:'INVALID_GRID'}]};
 const count=candidate.cols*(size[1]/candidate.h);
 for(const name of [...new Set([...Object.keys(B),...required])]){
  const arr=C[name];
  if(!Array.isArray(arr)||!arr.length)issues.push({code:'MISSING_RUNTIME_CLIP',clip:name});
  else if(Array.isArray(B[name])&&arr.length<B[name].length)issues.push({code:'SHORTENED_RUNTIME_CLIP',clip:name,before:B[name].length,after:arr.length});
 }
 for(const [name,arr]of Object.entries(C)){
  if(!Array.isArray(arr)||!arr.length){issues.push({code:'INVALID_CLIP',clip:name});continue;}
  for(const n of arr){const index=n<0?~n:n;if(!Number.isInteger(n)||n< -2147483648||n>2147483647||index<0||index>=count)issues.push({code:'FRAME_OUT_OF_BOUNDS',clip:name,frame:n});}
 }
 return {status:issues.length?'REJECT':'COMPATIBLE_NOT_ART_APPROVAL',coverage:'DECLARED_ANIMATION_CONTRACT_ONLY',approvalClaimed:false,installed:false,frames:count,requiredClips:[...new Set([...Object.keys(B),...required])].sort(),issues};
}
function pngSize(file){const b=fs.readFileSync(file);if(b.length<24||b.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Expected real PNG');return [b.readUInt32BE(16),b.readUInt32BE(20)];}
function main(args){
 const get=name=>{const i=args.indexOf(name);return i>=0?args[i+1]:undefined;};
 const key=get('--key'),file=get('--candidate');if(!key||!file)throw Error('Use --key PACK --candidate JSON [--registry JS] [--runtime JS --symbol P] [--output JSON]');
 const registry=fs.readFileSync(path.resolve(ROOT,get('--registry')||'js/assets/champion-sprites.js'),'utf8');
 const proposal=JSON.parse(fs.readFileSync(path.resolve(ROOT,file),'utf8'));
 if(proposal.key!==key)throw Error('Candidate key differs from existing pack; do not rename progression IDs');
 const baseline=extract(registry,key),runtime=get('--runtime');
 const required=runtime?consumed(fs.readFileSync(path.resolve(ROOT,runtime),'utf8'),get('--symbol')||'P'):[];
 if(runtime&&!required.length)throw Error('Runtime source produced no literal clip callers');
 const result=compare(baseline.meta,proposal.meta,pngSize(path.resolve(ROOT,proposal.atlas)),required);
 Object.assign(result,{key,baselineImage:baseline.src,candidateImage:proposal.atlas});
 const output=get('--output');if(output){const p=path.resolve(ROOT,output);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(result,null,2)+'\n');}
 console.log(JSON.stringify(result));return result.status==='REJECT'?1:0;
}
module.exports={extract,consumed,compare,pngSize,main};
if(require.main===module){try{process.exitCode=main(process.argv.slice(2));}catch(e){console.error(e.message);process.exitCode=2;}}
