'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http');
const E=require('./item-economy'),{create}=require('./accounts');
process.env.ADMIN_USERS='ecoowner';process.env.HORDA_ITEM_ECONOMY='1';process.env.DATA_PERSISTENT='1';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'horda-item-economy-'));
let now=Date.now(),app,server,base,count=0;
const options={dataDir:dir,databaseUrl:'',now:()=>now,log:()=>{},originAllowed:()=>true};
async function start(){app=create(options);await app.ready;server=http.createServer((q,s)=>app.handle(q,s)||s.end());await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;}
async function stop(){await new Promise(r=>server.close(r));await app.close();}
async function api(method,url,body,token,status=200){const r=await fetch(base+url,{method,headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});const j=await r.json();assert.equal(r.status,status,url+' '+JSON.stringify(j));count++;return j;}
let seq=0;const action=(token,op,args,status=200,requestId='test_'+(++seq),gm=false)=>api('POST',gm?'/api/gm/economy/action':'/api/economy/action',{op,args,requestId},token,status);
(async()=>{
 await start();
 const root=await api('POST','/api/register',{user:'ecoowner',pass:'test-password-12345'},null,201);
 const one=await api('POST','/api/register',{user:'ecoplayer1',pass:'test-password-12345'},null,201);
 const two=await api('POST','/api/register',{user:'ecoplayer2',pass:'test-password-12345'},null,201);
 one.user.id=(await app.store.getUserByKey('ecoplayer1')).id;two.user.id=(await app.store.getUserByKey('ecoplayer2')).id;
 await api('GET','/api/economy',undefined,null,401);
 await action(one.token,'grant',{userId:one.user.id,gold:1000},403,'forbidden',true);
 await action(root.token,'grant',{userId:one.user.id,gold:10000,materials:100},200,'fund1',true);
 await action(root.token,'grant',{userId:two.user.id,gold:10000,materials:100},200,'fund2',true);
 await action(root.token,'grant',{userId:one.user.id,gold:10000,materials:100},200,'fund1',true);
 assert.equal((await api('GET','/api/economy',undefined,one.token)).account.gold,10000);
 await action(root.token,'grant',{userId:one.user.id,gold:1},409,'fund1',true);
 await action(one.token,'craft',{recipe:'lucifer_arma'},403);
 await action(one.token,'craft',{recipe:'__proto__'},400);
 const crafted=await action(one.token,'craft',{recipe:'basic_arma'},200,'craft_once');
 const repeated=await action(one.token,'craft',{recipe:'basic_arma'},200,'craft_once');assert.equal(repeated.item.uid,crafted.item.uid);
 await action(two.token,'upgrade',{item:crafted.item.uid},403);
 await action(one.token,'favorite',{item:crafted.item.uid,value:true});
 await action(one.token,'list',{item:crafted.item.uid,price:200},400);
 await action(one.token,'favorite',{item:crafted.item.uid,value:false});
 await action(one.token,'list',{item:crafted.item.uid,price:-1},400);
 const listing=await action(one.token,'list',{item:crafted.item.uid,price:200});
 await action(one.token,'upgrade',{item:crafted.item.uid},400);
 const responses=await Promise.all(Array.from({length:6},(_,i)=>fetch(base+'/api/economy/action',{method:'POST',headers:{authorization:'Bearer '+two.token,'content-type':'application/json'},body:JSON.stringify({op:'buy',args:{listing:listing.listing.id},requestId:'buy_'+i})})));
 assert.equal(responses.filter(r=>r.status===200).length,1);assert.equal(responses.filter(r=>r.status===409).length,5);count+=6;
 const buyer=await api('GET','/api/economy',undefined,two.token);assert.equal(buyer.items.length,1);assert.equal(buyer.account.gold,9800);
 const seller=await api('GET','/api/economy',undefined,one.token);assert.equal(seller.account.gold,9890);assert.equal(seller.items.length,0);
 // Legacy client uploads never seed or overwrite this ledger.
 await api('PUT','/api/save',{baseVersion:0,data:{gold:999999999,stash:[{uid:'forged',rarity:'unico'}],champions:{}}},two.token);
 assert.equal((await api('GET','/api/economy',undefined,two.token)).account.gold,9800);
 // Fault after spending must roll back every field.
 await action(two.token,'craft',{recipe:'basic_arma',attributes:['hp_mult']},400);
 assert.equal((await api('GET','/api/economy',undefined,two.token)).account.gold,9800);
 const rel=await action(root.token,'relic',{relic:'corona_abismo',userId:one.user.id},200,'relic1',true);
 await action(root.token,'relic',{relic:'corona_abismo',userId:two.user.id},409,'relic2',true);
 const relListing=await action(one.token,'list',{item:rel.relic.uid,price:100});
 await action(two.token,'buy',{listing:relListing.listing.id});
 now+=10*86400000;
 assert.ok((await api('GET','/api/economy',undefined,two.token)).warning);
 await api('GET','/api/me',undefined,two.token);
 now+=13*86400000;
 assert.equal((await api('GET','/api/economy',undefined,two.token)).relics.find(r=>r.id==='corona_abismo').owner,String(two.user.id));
 now+=86400000;
 let state=await api('GET','/api/economy',undefined,two.token);assert.equal(state.relics.find(r=>r.id==='corona_abismo').status,'vault');
 await action(root.token,'relic',{relic:'corona_abismo',userId:one.user.id},200,'release_again',true);
 state=await api('GET','/api/economy',undefined,one.token);const relic=state.relics.find(r=>r.id==='corona_abismo');assert.equal(relic.uid,rel.relic.uid);assert.equal(relic.history.length,4);
 await action(root.token,'config',{config:{inactiveDays:20,warnDays:10}},200,'config',true);
 await action(root.token,'config',{config:{inactiveDays:5,warnDays:10}},400,'bad_config',true);
 const before=await api('GET','/api/gm/economy',undefined,root.token);
 await stop();await start();const after=await api('GET','/api/gm/economy',undefined,root.token);assert.deepEqual(after,before);
 // Same persisted receipt after restart cannot craft twice.
 const replay=await action(one.token,'craft',{recipe:'basic_arma'},200,'craft_once');assert.equal(replay.item.uid,crafted.item.uid);
 // Pure domain tests for failure/no destruction, caps, plans and complete-set unlock.
 const s=E.initial(),actor={id:1,user:'smith'};E.admin(s,actor,'grant',{userId:1,gold:1000000,materials:5000},now);
 s.accounts['1'].rank=4;
 for(const id of E.catalog().sets[0].pieces){E.admin(s,actor,'grant',{userId:1,blueprint:id},now);E.command(s,actor,'craft',{recipe:id,attributes:['hp_mult','speed_mult']},now,()=>0.5);}
 assert.deepEqual(s.accounts['1'].cosmetics,['lucifer']);
 const it=Object.values(s.items)[0];it.level=4;const result=E.command(s,actor,'upgrade',{item:it.uid},now,()=>0.999);assert.equal(result.success,false);assert.equal(it.level,4);
 assert.ok(it.affixes.every(x=>x.v<=0.03));assert.ok(it.creator==='smith');
 s.accounts['1'].rank=3;s.accounts['1'].xp=12000;s.accounts['1'].challenges=['forge_4'];E.command(s,actor,'rank',{},now);assert.equal(s.accounts['1'].rank,4);
 E.invariant(s);
 process.env.HORDA_ITEM_ECONOMY='0';await api('GET','/api/economy',undefined,one.token,503);
 await stop();fs.rmSync(dir,{recursive:true,force:true});console.log(`PASS item economy: ${count} HTTP assertions + domain invariants`);
})().catch(async e=>{console.error(e);if(server?.listening)await stop();process.exitCode=1;});
