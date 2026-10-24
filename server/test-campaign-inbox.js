'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {create}=require('./accounts'),{create:inbox}=require('./campaign-inbox');
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'horda-inbox-'));
 let app=create({dataDir:dir,databaseUrl:'',log:()=>{}});await app.ready;
 let messages=[];const opts=()=>({getStore:()=>app.store,ready:app.ready,send:(ws,m)=>messages.push([ws,m])});
 let box=inbox(opts()),host={},guest={},other={};
 await box.handle(guest,{t:'reward-open',key:'a'.repeat(64)});
 await box.handle(other,{t:'reward-open',key:'b'.repeat(64)});
 const room={slots:[{ws:host},{ws:guest}]};assert.equal(await box.start(room),true);
 const start={k:'start',arena:'bosque',seed:42,slots:[{champ:'tanque'},{champ:'mago'}]};box.capture(room,start);
 const end={k:'end',victory:true,snap:{full:1,h:[{hp:100},{hp:25}],g:{}}};
 // Guest disconnects before victory, host submits twice, then process/store is restarted.
 room.slots[1].ws=null;await box.finish(room,end);await box.finish(room,end);
 await app.close();app=create({dataDir:dir,databaseUrl:'',log:()=>{}});await app.ready;box=inbox(opts());
 const returning={};await box.handle(returning,{t:'reward-open',key:'a'.repeat(64)});
 const ids=messages.at(-1)[1].ids;assert.deepEqual(ids,[start.rewardRunId]);
 await box.handle(other,{t:'reward-open',key:'b'.repeat(64)});assert.deepEqual(messages.at(-1)[1].ids,[]);
 await box.handle(returning,{t:'reward-get',id:ids[0]});assert.equal(messages.at(-1)[1].result.slot,1);assert.equal(messages.at(-1)[1].result.end.snap.h[1].hp,25);
 await box.handle(returning,{t:'reward-ack',id:ids[0]});await box.handle(returning,{t:'reward-ack',id:ids[0]});
 await box.handle(returning,{t:'reward-get',id:ids[0]});assert.equal(messages.at(-1)[1].result.acknowledged,true);
 console.log('PASS durable outcome: guest offline, host gone, store restart, duplicate end/ack, private inbox isolation');
 // Authenticated users use verified identity, not a caller-supplied account id or capability.
 const accountGuest={_identity:{userId:'verified-7'}};await box.handle(accountGuest,{t:'reward-open',key:'c'.repeat(64)});
 const ar={slots:[{ws:host},{ws:accountGuest}]};await box.start(ar);box.capture(ar,{...start});await box.finish(ar,end);
 const device2={_identity:{userId:'verified-7'}};await box.handle(device2,{t:'reward-open',key:'d'.repeat(64)});assert.equal(messages.at(-1)[1].ids.length,1);
 await box.handle(other,{t:'reward-get',id:ar.campaign.id});assert.equal(messages.at(-1)[1].t,'reward-list');
 console.log('PASS authenticated account recovery on another capability and cross-user access denied');
 // A new round is refused when too many unclaimed results exist; no old record is evicted.
 for(let i=0;i<19;i++){const r={slots:[{ws:host},{ws:accountGuest}]};assert.equal(await box.start(r),true);box.capture(r,{...start});await box.finish(r,end);}
 assert.equal(await box.start({slots:[{ws:host},{ws:accountGuest}]}),false);
 await box.handle(accountGuest,{t:'reward-open',key:'c'.repeat(64)});assert.equal(messages.at(-1)[1].ids.length,20);
 console.log('PASS backlog backpressure preserves all 20 outcomes, no silent eviction');
 await app.close();fs.rmSync(dir,{recursive:true,force:true});
})().catch(e=>{console.error(e);process.exitCode=1;});
