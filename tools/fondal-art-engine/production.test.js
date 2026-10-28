'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),zlib=require('node:zlib'),http=require('node:http');
const {crc32}=require('./png-gate');
const {inspectSheet,sha}=require('./sheet-gate');
const {within,validateCandidate,promote}=require('./production');
const {ComfyUIProvider,validateWorkflow}=require('./providers');
function png({empty=false,border=false,opaque=false,frozen=false,semi=false,color=255}={}){
 const w=8,h=4,raw=Buffer.alloc((w*4+1)*h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  if(!opaque&&!(x===1&&y===1)&&!(x===(frozen?5:6)&&y===1)&&!(border&&x===0&&y===2))continue;
  if(empty&&x>=4)continue;
  const i=y*(w*4+1)+1+x*4;raw[i]=color;raw[i+3]=semi?128:255;
 }
 const chunk=(name,data)=>{const b=Buffer.alloc(data.length+12);b.writeUInt32BE(data.length);b.write(name,4);data.copy(b,8);b.writeUInt32BE(crc32(b.subarray(4,8+data.length)),8+data.length);return b;};
 const header=Buffer.alloc(13);header.writeUInt32BE(w);header.writeUInt32BE(h,4);header[8]=8;header[9]=6;
 return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}
const meta={w:4,h:4,cols:2,refH:1,anchor:.75,sets:{idle:[0,1]}};
test('technical gate checks every consumed frame, clipping, alpha and frozen animation',()=>{
 assert.equal(inspectSheet(png(),meta).ok,true);
 for(const [option,code] of [['empty','EMPTY_FRAME'],['border','CLIPPED_FRAME'],['opaque','OPAQUE_BACKGROUND'],['frozen','FROZEN_CLIP'],['semi','PARTIAL_ALPHA']])assert.ok(inspectSheet(png({[option]:true}),meta).issues.some(i=>i.code===code),code);
 assert.equal(inspectSheet(png(),{...meta,sets:{idle:[0,2]}}).ok,false);
 assert.equal(inspectSheet(png(),{...meta,sets:{idle:[0]}} ,meta).ok,false);
});
function fixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'fondal-test-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.mkdirSync(path.join(root,'assets'),{recursive:true});fs.mkdirSync(path.join(root,'js/assets'),{recursive:true});fs.mkdirSync(path.join(root,'candidate'));
 const target={png:'assets/test.png',meta_file:'js/assets/test-meta.js',const:'TEST_ATLAS',key:'test'};
 fs.writeFileSync(path.join(root,target.png),png());
 fs.writeFileSync(path.join(root,target.meta_file),'const TEST_ATLAS = '+JSON.stringify({test:{src:target.png,meta}})+';\n');
 const dir=path.join(root,'candidate');fs.writeFileSync(path.join(dir,'atlas.png'),png());
 fs.writeFileSync(path.join(dir,'provider.json'),JSON.stringify({provider:'test',target,meta,api_cost_usd:0,provenance:'unit fixture'}));
 return {root,dir,target};
}
test('identical rendered pixels are reused without requiring new approval or writing assets',t=>{
 const {root,dir,target}=fixture(t);const before=fs.statSync(path.join(root,target.png)).mtimeMs;
 const report=validateCandidate(dir,root);assert.equal(report.status,'REUSED');
 assert.equal(promote(dir,undefined,{root}).action,'REUSED_NO_WRITE');assert.equal(fs.statSync(path.join(root,target.png)).mtimeMs,before);
});
test('promotion rejects changed scale and stale approval',t=>{
 const {root,dir}=fixture(t);const provider=JSON.parse(fs.readFileSync(path.join(dir,'provider.json')));
 provider.meta.refH=2;fs.writeFileSync(path.join(dir,'provider.json'),JSON.stringify(provider));
 assert.throws(()=>promote(dir,undefined,{root}),/technical gate/);
 provider.meta.refH=1;fs.writeFileSync(path.join(dir,'provider.json'),JSON.stringify(provider));
 // Different valid visible color, same poses.
 const bytes=png();const image=require('./pixel-gate').decodePNG(bytes);
 assert.equal(image.width,8);
 fs.writeFileSync(path.join(dir,'atlas.png'),png({border:true}));
 assert.throws(()=>promote(dir,undefined,{root}),/technical gate/);
});
test('path traversal and symlinks cannot escape repository',t=>{
 const {root}=fixture(t);
 for(const p of ['../a','/etc/a','assets/../../a','assets\\a'])assert.throws(()=>within(root,p),/Unsafe/);
 fs.symlinkSync(os.tmpdir(),path.join(root,'assets/link'));assert.throws(()=>within(root,'assets/link/a'),/Symlink/);
});
test('ComfyUI rejects cloud endpoints and paid or unknown nodes before generating',()=>{
 assert.throws(()=>new ComfyUIProvider({baseURL:'https://paid.example'}),/local offline/);
 assert.throws(()=>validateWorkflow({a:{class_type:'PaidAPI'}}),/Unsupported/);
 assert.throws(()=>validateWorkflow({a:{class_type:'KSampler'}}),/SaveImage/);
});
test('ComfyUI adapter consumes HTTP job output (protocol fixture, not AI quality evidence)',async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'fondal-comfy-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 let posted=0;
 const server=http.createServer((req,res)=>{
  if(req.url==='/prompt'){posted++;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({prompt_id:'fixture',node_errors:{}}));}
  else if(req.url==='/history/fixture'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({fixture:{status:{completed:true,status_str:'success'},outputs:{x:{images:[{filename:'sheet.png',type:'output',subfolder:''}]}}}}));}
  else if(req.url.startsWith('/view?')){res.setHeader('Content-Type','image/png');res.end(png());}
  else {res.statusCode=404;res.end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>server.close());
 const provider=new ComfyUIProvider({baseURL:'http://127.0.0.1:'+server.address().port,pollMs:1,timeoutMs:10000});
 const out=path.join(root,'candidate');
 const result=await provider.generate({workflow:{x:{class_type:'SaveImage',inputs:{}}},meta,target:{},provenance:'unit fixture'}, {out});
 assert.equal(posted,1);assert.equal(result.status,'GENERATED');assert.equal(inspectSheet(fs.readFileSync(path.join(out,'atlas.png')),meta).ok,true);
});
module.exports={png};
test('promotion requires current evidence and publishes PNG/WebP as a pair, keeping rollback',t=>{
 const {root,dir,target}=fixture(t);
 const {execFileSync}=require('node:child_process');
 const old=fs.readFileSync(path.join(root,target.png));
 execFileSync('python3',[path.join(__dirname,'normalize.py'),path.join(root,target.png),path.join(root,'assets/normalized.png')]);
 fs.renameSync(path.join(root,'assets/normalized.webp'),path.join(root,'assets/test.webp'));
 fs.writeFileSync(path.join(dir,'atlas.png'),png({color:150}));
 const candidate=validateCandidate(dir,root);assert.equal(candidate.status,'AWAITING_VISUAL_REVIEW');
 fs.writeFileSync(path.join(root,'visual.txt'),'review fixture only');
 fs.writeFileSync(path.join(root,'runtime.json'),JSON.stringify({status:'PASS',candidate_sha256:candidate.candidate_sha256}));
 const review={status:'PASS',reviewed_by:'unit-test',candidate_sha256:candidate.candidate_sha256,baseline_sha256:candidate.baseline_sha256,registry_sha256:candidate.registry_sha256,visual_evidence:{path:'visual.txt',sha256:sha(fs.readFileSync(path.join(root,'visual.txt')))},runtime_evidence:{path:'runtime.json',sha256:sha(fs.readFileSync(path.join(root,'runtime.json')))}};
 const reviewFile=path.join(root,'review.json');fs.writeFileSync(reviewFile,JSON.stringify({...review,baseline_sha256:'stale'}));
 assert.throws(()=>promote(dir,reviewFile,{root}),/stale/);assert.deepEqual(fs.readFileSync(path.join(root,target.png)),old);
 fs.writeFileSync(reviewFile,JSON.stringify(review));const promoted=promote(dir,reviewFile,{root});
 assert.equal(promoted.status,'INTEGRATED');assert.equal(sha(fs.readFileSync(path.join(root,target.png))),candidate.candidate_sha256);
 assert.deepEqual(fs.readFileSync(path.join(dir,'rollback/0')),old);
 assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'rollback/manifest.json'))).length,2);
 assert(!fs.existsSync(path.join(root,'.fondal-promotion.lock')));
});
test('qualified overscan promotion changes only target grid and publishes matching companion',t=>{
 const repo=path.resolve(__dirname,'../..'),source=path.join(repo,'docs/fondal-art-engine/runs/2026-10-28/angel-overscan');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'fondal-overscan-promotion-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const provider=JSON.parse(fs.readFileSync(path.join(source,'provider.json'))),target=provider.target;
 for(const [i,f] of [target.png,target.png.replace(/\.png$/,'.webp'),target.meta_file].entries()){fs.mkdirSync(path.dirname(path.join(root,f)),{recursive:true});const historical=path.join(source,'rollback',String(i));fs.copyFileSync(fs.existsSync(historical)?historical:path.join(repo,f),path.join(root,f));}
 const dir=path.join(root,'candidate');fs.mkdirSync(dir);for(const file of ['atlas.png','atlas.webp','provider.json'])fs.copyFileSync(path.join(source,file),path.join(dir,file));
 const before=fs.readFileSync(path.join(root,target.meta_file),'utf8');const original=JSON.parse(before.match(/const PIXRIG_ATLAS = (\{.*\});/s)[1]);
 const d=validateCandidate(dir,root);assert(d.geometryPreservedOverscan);assert(d.gate.ok);
 fs.writeFileSync(path.join(root,'visual.txt'),'unit-test fixture, not production approval');
 fs.writeFileSync(path.join(root,'runtime.json'),JSON.stringify({status:'PASS',candidate_sha256:d.candidate_sha256}));
 const review={status:'PASS',reviewed_by:'unit-test',candidate_sha256:d.candidate_sha256,baseline_sha256:d.baseline_sha256,registry_sha256:d.registry_sha256};
 for(const [field,file] of [['visual_evidence','visual.txt'],['runtime_evidence','runtime.json']])review[field]={path:file,sha256:sha(fs.readFileSync(path.join(root,file)))};
 const reviewFile=path.join(root,'review.json');fs.writeFileSync(reviewFile,JSON.stringify(review));
 assert.equal(promote(dir,reviewFile,{root}).status,'INTEGRATED');
 const after=JSON.parse(fs.readFileSync(path.join(root,target.meta_file),'utf8').match(/const PIXRIG_ATLAS = (\{.*\});/s)[1]);
 assert.deepEqual(after[target.key].meta,provider.meta);
 for(const key of Object.keys(original))if(key!==target.key)assert.deepEqual(after[key],original[key]);
 assert.equal(after[target.key].meta.refH,original[target.key].meta.refH);
 assert.equal(after[target.key].meta.hMul,original[target.key].meta.hMul);
 assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'rollback/manifest.json'))).length,3);
});
