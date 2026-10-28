'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {reserve,trustedURL,BFLProvider}=require('./bfl-provider');
const {prepare}=require('./bfl-repair'),{plan}=require('../../server/art-factory');
test('one trial ledger stops at USD5 and refuses duplicate or corrupt reservations',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'fondal-budget-')),file=path.join(root,'budget.json');
 try{for(let i=0;i<20;i++)reserve(file,'job-'+i);assert.equal(JSON.parse(fs.readFileSync(file)).reservedCents,500);assert.throws(()=>reserve(file,'new'),/exhausted/);assert.throws(()=>reserve(file,'job-0'),/already/);fs.writeFileSync(file,'{"schema":"fondal.bfl-trial.v1","reservedCents":0,"jobs":[{}]}');assert.throws(()=>reserve(file,'new'),/Invalid/);}finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('BFL credentials cannot be sent to arbitrary polling URLs',()=>{
 assert.equal(trustedURL('https://api.eu2.bfl.ai/v1/get_result?id=123','poll'),'https://api.eu2.bfl.ai/v1/get_result?id=123');
 for(const url of ['http://api.bfl.ai/a','https://api.bfl.ai.evil.com/a','https://user:secret@api.bfl.ai/a','https://127.0.0.1/a'])assert.throws(()=>trustedURL(url,'poll'));
});
test('repair keeps existing ultimate/death contract and binds exact Codex reference',()=>{
 for(const job of plan('Reparar los últimos campeones')){const p=prepare(job);assert.deepEqual(p.meta.sets,p.baseline.meta.sets);assert.equal(p.references.length,2);assert.deepEqual(p.meta.sets.ultimate_down,[28,29,30,31]);assert.throws(()=>prepare({...job,referenceSha256:'changed'}),/changed/);}
});
test('no credentials means no network call or spend',async()=>{
 const old=process.env.BFL_API_KEY;delete process.env.BFL_API_KEY;
 try{let calls=0;const p=new BFLProvider({fetchImpl:async()=>{calls++;}});await assert.rejects(p.generate({}),/BLOCKED_CREDENTIAL/);assert.equal(calls,0);}finally{if(old!==undefined)process.env.BFL_API_KEY=old;}
});
test('real adapter protocol downloads PNG without leaking key, and never retries uncertain submission',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'fondal-bfl-'));
 const names=['BFL_API_KEY','FONDAL_BFL_TRIAL','FONDAL_BFL_LEDGER'],saved=Object.fromEntries(names.map(k=>[k,process.env[k]]));
 Object.assign(process.env,{BFL_API_KEY:'fixture-secret-not-real',FONDAL_BFL_TRIAL:'approved-2026-10-28-usd5',FONDAL_BFL_LEDGER:path.join(root,'ledger.json')});
 try{
  const job=prepare(plan('Reparar morveth')[0]);let posts=0;
  const image=fs.readFileSync(path.resolve(__dirname,'../../assets/sprites/champions/morveth/atlas.png'));
  const fake=async(url,options)=>{
   if(options.method==='POST'){posts++;assert.equal(JSON.parse(options.body).input_image,fs.readFileSync(job.references[0]).toString('base64'));return new Response(JSON.stringify({id:'fixture',polling_url:'https://api.eu2.bfl.ai/v1/get_result?id=fixture',cost:1.8}));}
   if(url.includes('get_result'))return new Response(JSON.stringify({status:'Ready',result:{sample:'https://sample.blob.core.windows.net/fixture.png'}}));
   assert.equal(options.headers,undefined);return new Response(image);
  };
  const out=path.join(root,'good');await new BFLProvider({fetchImpl:fake,pollMs:1}).generate(job,{out});
  assert(fs.existsSync(path.join(out,'atlas.png')));assert.equal(posts,1);assert.equal(JSON.parse(fs.readFileSync(path.join(out,'provider.json'))).api_cost_usd,.018);
  const bad=new BFLProvider({fetchImpl:async()=>{posts++;throw Error('lost response');}});
  await assert.rejects(bad.generate(job,{out:path.join(root,'lost')}),/lost response/);
  assert.equal(posts,2);assert.equal(JSON.parse(fs.readFileSync(process.env.FONDAL_BFL_LEDGER)).reservedCents,50);
 }finally{for(const k of names)if(saved[k]===undefined)delete process.env[k];else process.env[k]=saved[k];fs.rmSync(root,{recursive:true,force:true});}
});
