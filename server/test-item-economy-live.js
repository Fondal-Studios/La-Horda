'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http');
process.env.HORDA_ITEM_ECONOMY='1';process.env.DATA_PERSISTENT='1';process.env.ADMIN_USERS='liveowner';
const {create}=require('./accounts'),E=require('./item-economy'),L=require('./item-economy-live');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'horda-live-'));let now=Date.parse('2026-10-15T12:00:00Z'),app,server,url,seq=0,checks=0;
async function start(){app=create({dataDir:dir,databaseUrl:'',now:()=>now,log:()=>{},originAllowed:()=>true});await app.ready;server=http.createServer((q,s)=>app.handle(q,s)||s.end());await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port;}
async function stop(){await new Promise(r=>server.close(r));await app.close();}
async function api(method,p,body,t,status=200){const r=await fetch(url+p,{method,headers:{'content-type':'application/json',...(t?{authorization:'Bearer '+t}:{})},body:body===undefined?undefined:JSON.stringify(body)}),j=await r.json();assert.equal(r.status,status,p+' '+JSON.stringify(j));checks++;return j;}
const action=(t,op,args={},status=200,id='live_'+(++seq),gm=false)=>api('POST',gm?'/api/gm/economy/action':'/api/economy/action',{op,args,requestId:id},t,status);
(async()=>{
 await start();const owner=await api('POST','/api/register',{user:'liveowner',pass:'test-long-password'},null,201),user=await api('POST','/api/register',{user:'liveplayer',pass:'test-long-password'},null,201);
 const id=String((await app.store.getUserByKey('liveplayer')).id),uid='old-item';
 const old={gold:9000,gems:30,stash:[{uid,type:'arma',rarity:'raro',value:.1,level:2,favorite:true,affixes:[{id:'afx_dmg',v:.01}],passives:[]}],champions:{tanque:{unlocked:true,equipment:{arma:uid},level:10}},cosmeticUnlocks:{baluarte:true}};
 await app.store.putSave(Number(id),JSON.stringify(old),{},0,false);
 let d=await api('GET','/api/economy',undefined,user.token);assert.equal(d.account.gold,9000);assert.equal(d.items.length,1);const imported=d.items[0].uid;assert.notEqual(imported,uid);assert.equal(d.projection.champions.tanque.equipment.arma,imported);assert.equal(d.items[0].legacy,true);assert.ok(d.account.cosmetics.includes('baluarte'));
 assert.deepEqual((await app.store.gmRead()).itemEconomy.migrations[id].backup,old);
 await api('PUT','/api/save',{baseVersion:1,data:{...old,gold:1e9,gems:1e9,stash:[],champions:{tanque:{unlocked:true,equipment:{arma:'fake'}}},cosmeticUnlocks:{lucifer:true}}},user.token);
 const cloud=await api('GET','/api/save',undefined,user.token);assert.equal(cloud.data.gold,9000);assert.equal(cloud.data.stash[0].uid,imported);assert.equal(cloud.data.champions.tanque.equipment.arma,imported);assert.equal(cloud.data.cosmeticUnlocks.lucifer,undefined);
 await action(user.token,'unequip',{champion:'tanque',slot:'arma'});await action(user.token,'favorite',{item:imported,value:false});await action(user.token,'list',{item:imported,price:10},403);
 await action(user.token,'run.start',{arena:'bogus',champion:'tanque',mode:'campaign'},400);
 const r=(await action(user.token,'run.start',{arena:'ciudad',champion:'tanque',mode:'campaign'})).run;
 await action(user.token,'equip',{champion:'tanque',item:imported},409);
 await action(user.token,'run.finish',{run:r.id,durationMs:130000,victory:true},422);
 await action(owner.token,'run.pulse',{run:r.id},404);
 for(let i=0;i<3;i++){now+=50000;await action(user.token,'run.pulse',{run:r.id,round:1});}
 const loot=await action(user.token,'run.loot',{run:r.id},200,'floor_once');assert.equal(loot.items.length,1);assert.equal((await action(user.token,'run.loot',{run:r.id},200,'floor_once')).items[0].uid,loot.items[0].uid);
 const end=await action(user.token,'run.finish',{run:r.id,durationMs:150000,victory:true},200,'finish_once');assert.equal(end.gold,1280);assert.equal(end.materials,3);assert.equal(end.items.length,1);
 const end2=await action(user.token,'run.finish',{run:r.id,durationMs:150000,victory:true},200,'finish_twice');assert.equal(end2.items[0].uid,end.items[0].uid);
 assert.equal((await api('GET','/api/economy',undefined,user.token)).account.gold,10280);
 await action(user.token,'equip',{champion:'tanque',item:end.items[0].uid});
 await action(user.token,'unequip',{champion:'tanque',slot:end.items[0].type});
 const listing=await action(user.token,'list',{item:end.items[0].uid,price:100});
 await action(owner.token,'grant',{userId:Number(owner.user.id||1),gold:1000},200,undefined,true);
 await action(owner.token,'buy',{listing:listing.listing.id});
 const monthly=(await action(user.token,'run.start',{arena:'ciudad',champion:'tanque',mode:'endless'})).run;
 now+=30000;await action(user.token,'run.pulse',{run:monthly.id,round:2});
 const balance=(await api('GET','/api/economy',undefined,user.token)).account.gold;
 await action(user.token,'run.finish',{run:monthly.id,durationMs:30000,round:2,score:2e9},422);
 assert.equal((await api('GET','/api/economy',undefined,user.token)).account.gold,balance);
 await action(user.token,'run.finish',{run:monthly.id,durationMs:30000,round:2,score:1234});
 let rank=await api('GET','/api/leaderboard',undefined,user.token);assert.equal(rank.month,'2026-10');assert.equal(rank.entries[0].score,1234);assert.ok(rank.prize.uid);const prize=rank.prize.uid;
 await api('GET','/api/leaderboard?week=2026-W42',undefined,user.token,400);await api('POST','/api/leaderboard/submit',{score:999999},user.token,409);
 now=Date.parse('2026-11-01T00:01:00Z');await E.tick(app.store,now);
 d=await api('GET','/api/economy',undefined,user.token);const awarded=d.items.find(x=>x.uid===prize);assert.ok(awarded);assert.match(awarded.name,/liveplayer/);assert.equal(d.relics.find(x=>x.uid===prize).history.length,1);assert.ok(d.account.titles.length);
 await E.tick(app.store,now);assert.equal((await api('GET','/api/economy',undefined,user.token)).items.filter(x=>x.uid===prize).length,1);
 const relicListing=await action(user.token,'list',{item:prize,price:10});await action(owner.token,'buy',{listing:relicListing.listing.id});const bought=(await api('GET','/api/economy',undefined,owner.token)).items.find(x=>x.uid===prize);assert.equal(bought.name,awarded.name);
 const rookie=await api('POST','/api/register',{user:'livebeginner',pass:'test-long-password'},null,201);await api('GET','/api/economy',undefined,rookie.token);
 await action(rookie.token,'starter',{champion:'no_such_champion'},400);await action(rookie.token,'starter',{champion:'tanque'});await action(rookie.token,'starter',{champion:'mago'},409);
 const short=(await action(rookie.token,'run.start',{arena:'ciudad',champion:'tanque',mode:'campaign'})).run;now+=5000;const shortEnd=await action(rookie.token,'run.finish',{run:short.id,durationMs:5000,victory:false});assert.equal(shortEnd.gold,0);assert.equal(shortEnd.items.length,0);
 await action(owner.token,'config',{config:{dropTables:{ciudad:{comun:-1}}}},400,undefined,true);
 await action(owner.token,'config',{config:{dropTables:{ciudad:{comun:1,mitico:0,legendario:0}}}},200,undefined,true);
 await api('POST','/api/wallet/buy',{sku:'lucifer',ref:'base_cannot_buy',expectedPrice:100},user.token,400);
 await api('POST','/api/wallet/buy',{sku:'lucifer_consagrada',ref:'exclusive_cannot_buy',expectedPrice:100},user.token,403);
 const state=await app.store.gmRead();await stop();await start();assert.deepEqual(await app.store.gmRead(),state);
 // Exact identity and protection in the server's automatic collector.
 const s=E.initial();E.admin(s,{id:1},'grant',{userId:1,materials:1},now);s.accounts['1'].equipment={};s.accounts['1'].autoLoot={enabled:true,fuse:true,recycle:true};
 const baseItem=L.generated('arma','comun','1');for(let i=0;i<3;i++)s.items['same'+i]={...baseItem,uid:'same'+i};s.items.favorite={...baseItem,uid:'favorite',favorite:true};s.items.different={...baseItem,uid:'different',roll:1.01};const result=L.autoLoot(s,'1');assert.equal(result.fused,1);assert.ok(s.items.favorite);assert.ok(s.items.different);assert.equal(Object.values(s.items).filter(i=>i.rarity==='raro').length,1);E.invariant(s);
 await stop();fs.rmSync(dir,{recursive:true,force:true});console.log(`PASS integrated economy: ${checks} HTTP assertions; migration, receipts, market, monthly award, restart, automatic protection`);
})().catch(async e=>{console.error(e);if(server?.listening)await stop();process.exitCode=1;});
