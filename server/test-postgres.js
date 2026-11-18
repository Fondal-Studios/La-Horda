'use strict';
// Opt-in isolated localhost database only. Never reads DATABASE_URL or clears tables.
const assert=require('node:assert/strict'),http=require('node:http');
const {Client}=require('pg'),{create}=require('./accounts');
const url=process.env.HORDA_TEST_PG_URL;
if(!url)throw Error('Set HORDA_TEST_PG_URL to an EMPTY localhost horda_test_* database');
const parsed=new URL(url);
if(!['127.0.0.1','localhost'].includes(parsed.hostname)||!/^\/horda_test_[a-z0-9_]+$/.test(parsed.pathname))throw Error('Test requires isolated localhost horda_test_* database');
let a,b,server;
const sql=new Client({connectionString:url});
(async()=>{
 await sql.connect();
 const existing=await sql.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
 assert.equal(existing.rowCount,0,'refuse non-empty database');
 const options={databaseUrl:url,adminUsers:'pgowner',log:()=>{},originAllowed:()=>true};
 a=create(options);await a.ready;assert.equal(a.info().status,'ready');assert.equal(a.info().store,'postgres');
 b=create(options);await b.ready;
 server=http.createServer((q,s)=>a.handle(q,s)||s.end());await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 async function api(method,path,body,token){const r=await fetch(base+path,{method,headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});const j=await r.json();assert.ok(r.ok,path+' '+JSON.stringify(j));return j;}
 const token=(await api('POST','/api/register',{user:'pgowner',pass:'test-Only-Password'})).token;
 const player=(await api('POST','/api/register',{user:'pgplayer',pass:'test-Only-Password'})).token;
 await api('PUT','/api/save',{data:{gold:100,champions:{tanque:{unlocked:true,level:4}},stash:[]},baseVersion:0},player);
 const user=await b.store.getUserByKey('pgplayer');assert.ok(user.id);
 const cas=await Promise.all([a.store.putSave(user.id,JSON.stringify({gold:101}),{},1,false),b.store.putSave(user.id,JSON.stringify({gold:102}),{},1,false)]);
 assert.equal(cas.filter(r=>r.conflict).length,1,'one CAS winner across two pools');
 const update=store=>store.gmUpdate(async s=>{s=s||{};s.counter=(s.counter||0)+1;return {state:s,value:s.counter}});
 await Promise.all(Array.from({length:12},(_,i)=>update(i%2?a.store:b.store)));
 assert.equal((await a.store.gmRead()).counter,12,'row lock serializes independent process pools');
 const before=await a.store.gmRead();
 await assert.rejects(a.store.gmUpdate(async(s,snapshot)=>{await snapshot({id:'rollback-test',data:'safe'});throw Error('rollback-test')}));
 assert.deepEqual(await b.store.gmRead(),before);
 assert.equal((await sql.query("SELECT * FROM horda_operation_snapshots WHERE id='rollback-test'")).rowCount,0);
 // Restore real operational schema through a fresh instance's normal API.
 await a.store.gmUpdate(()=>({state:null,value:null}));
 const config=await api('GET','/api/gm/config',undefined,token);
 await api('PUT','/api/gm/config',{version:config.version,config:{...config.config,xp:2}},token);
 const preview=await api('POST','/api/gm/reset/preview',{user:'pgplayer',fields:['gold']},token);
 const reset=await api('POST','/api/gm/reset/confirm',{token:preview.token,confirmation:preview.confirmation},token);
 assert.equal((await api('GET','/api/save',undefined,player)).data.gold,0);
 assert.ok((await sql.query('SELECT id FROM horda_operation_snapshots')).rowCount>0,'snapshot committed before reset');
 await a.close();a=create(options);await a.ready;
 assert.equal((await api('GET','/api/gm/config',undefined,token)).config.xp,2,'config and session survive restart');
 assert.equal((await api('GET','/api/save',undefined,player)).data.gold,0,'save survives restart');
 // Beta cerrada (server/beta-kit.js): tablas aditivas, tope de usos atómico entre dos pools, reportes con tope y errores agrupados.
 {const betaOpts={...options,beta:{inviteCodes:'PG-BETA:1',errors:'1'}},c1=create(betaOpts),c2=create(betaOpts);await c1.ready;await c2.ready;
  try{const h=require('./beta-kit').hashCode('pg-beta');
   const uses=await Promise.all([c1.store.betaInviteUse(h,1,1),c2.store.betaInviteUse(h,1,1),c1.store.betaInviteUse(h,1,1),c2.store.betaInviteUse(h,1,1)]);
   assert.equal(uses.filter(u=>u.ok).length,1,'invite max respected across pools');
   await c1.store.betaInviteRelease(h);assert.equal((await c2.store.betaInviteUses())[h],0,'release returns the use');
   for(let i=1;i<=3;i++)await c1.store.betaReportAdd({userId:i===1?null:i,category:'bug',text:'r'+i,context:{level:i},at:i},2);
   const reps=await c2.store.betaReportList(10);assert.deepEqual(reps.map(r=>r.text),['r3','r2'],'reports keep newest within cap');assert.equal(reps[0].context.level,3);
   const e={sig:'s1',message:'m',src:'js/a.js',line:1,col:2,build:'b',count:2,at:9};
   assert.equal(await c1.store.betaErrorAdd(e,1),true);assert.equal(await c2.store.betaErrorAdd({...e,count:1,at:10},1),true);assert.equal(await c1.store.betaErrorAdd({...e,sig:'s2'},1),false,'error signature cap');
   const errs=await c2.store.betaErrorList(10);assert.equal(errs.length,1);assert.equal(errs[0].count,3);assert.equal(errs[0].lastAt,10);
  }finally{await c1.close();await c2.close();}}
 console.log('PASS real PostgreSQL: additive schema, auth, CAS across pools, row locks, transaction rollback, reset snapshot, durable restart, beta kit tables');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(server)await new Promise(r=>server.close(r));if(a)await a.close();if(b)await b.close();await sql.end()});
