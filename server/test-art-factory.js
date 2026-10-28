'use strict';
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{execFile}=require('node:child_process'),{promisify}=require('node:util');
const {create}=require('./accounts');
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fondal-queue-')),token=require('crypto').randomBytes(32).toString('hex');
 process.env.FONDAL_ART_WORKER_TOKEN=token;process.env.ADMIN_USERS='owner';
 const app=create({dataDir:dir,databaseUrl:'',log:()=>{},originAllowed:o=>o==='https://game.test'});
 const server=http.createServer((q,s)=>app.handle(q,s)||s.end());
 try{
  await app.ready;await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
  async function request(method,url,body,auth,status=200){const r=await fetch(base+url,{method,headers:{'content-type':'application/json',...(auth?{authorization:'Bearer '+auth}:{})},body:body===undefined?undefined:JSON.stringify(body)});const j=await r.json();assert.equal(r.status,status,JSON.stringify(j));return j;}
  const owner=(await request('POST','/api/register',{user:'owner',pass:'Unique-Password-123'},null,201)).token;
  const player=(await request('POST','/api/register',{user:'player',pass:'Unique-Password-456'},null,201)).token;
  await request('POST','/api/gm/art/command',{command:'Reparar los últimos campeones',requestId:'test-0001'},player,403);
  await request('POST','/api/art-worker/claim',{},player,403);
  const body={command:'Reparar angel_corrompido',requestId:'native-proof-001'};
  const a=await request('POST','/api/gm/art/command',body,owner,202);assert.equal(a.jobs.length,1);
  const again=await request('POST','/api/gm/art/command',body,owner,202);assert(again.duplicate);
  // Actual separate process, actual Python rig, real PNG decode/quality gate; no mock generator.
  await promisify(execFile)(process.execPath,[path.join(__dirname,'../tools/fondal-art-engine/worker.js'),'--once'],{env:{...process.env,FONDAL_ART_API:base,FONDAL_ART_OUTPUT:path.join(dir,'output')},timeout:120000});
  const q=await request('GET','/api/gm/art',undefined,owner);assert.equal(q.jobs.length,1);assert.equal(q.jobs[0].status,'REUSED');assert(q.workerOnline);
  const png=fs.readFileSync(path.join(dir,'output',a.jobs[0].id,'atlas.png'));assert(png.length>10000);assert.equal(png.subarray(1,4).toString(),'PNG');
  const saved=JSON.parse(fs.readFileSync(path.join(dir,'operations.json'),'utf8'));assert.equal(saved.artFactory.jobs[0].status,'REUSED');assert(Array.isArray(saved.audit));assert(saved.config);
  await request('GET','/api/gm/dashboard',undefined,owner);
  await request('POST','/api/gm/art/command',{command:'Crear un campeón nuevo de hielo',requestId:'new-art-001'},owner,202);
  await promisify(execFile)(process.execPath,[path.join(__dirname,'../tools/fondal-art-engine/worker.js'),'--once'],{env:{...process.env,FONDAL_ART_API:base,FONDAL_ART_OUTPUT:path.join(dir,'output')},timeout:60000});
  assert.equal((await request('GET','/api/gm/art',undefined,owner)).jobs[1].status,'BLOCKED_MODEL');
  console.log(JSON.stringify({status:'PASS',realNativeImageBytes:png.length,sha256:q.jobs[0].result.sha256,persistentQueue:true,duplicateSuppressed:true,playerAndWorkerAccessDenied:true,missingModelReported:true,output:dir}));
 }finally{await new Promise(r=>server.close(r));await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
