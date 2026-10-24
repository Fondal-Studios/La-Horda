'use strict';
const H=require('../lib/serve'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawn}=require('node:child_process');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'horda-reward-relay-'));let cp,port=0;
async function relay(){
 cp=spawn(process.execPath,['-e',`const r=require('./server/relay');r.server.on('listening',()=>console.log('TESTPORT:'+r.server.address().port))`],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,PORT:String(port),HOST:'127.0.0.1',DATA_DIR:dir,DATABASE_URL:''},stdio:['ignore','pipe','pipe']});
 return new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('relay startup')),20000);cp.stdout.on('data',b=>{const m=String(b).match(/TESTPORT:(\d+)/);if(m){port=Number(m[1]);clearTimeout(t);resolve();}});cp.on('exit',code=>{if(code){clearTimeout(t);reject(Error('relay exit '+code));}});});
}
async function stop(){if(cp){const p=cp;cp=null;await new Promise(r=>{p.once('exit',r);p.kill();});}}
(async()=>{
 const site=await H.startSite(),browser=await H.launch();await relay();const url=()=>site.url+'/index.html?dev=1&server='+encodeURIComponent('ws://127.0.0.1:'+port);
 const errors=[];
 async function boot(ctx,champ,initial){
  const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));await H.goto(p,url(),{waitUntil:'load'});
  await p.waitForFunction(()=>typeof save!=='undefined' && saveLoadStarted && typeof netHostStartGame==='function');
  await p.evaluate(([champ,initial])=>{
   window.__autoConfirm=true;selectedClass=champ;
   if(initial){for(const k in save.champions){save.champions[k].unlocked=true;save.champions[k].level=5;}save.starterChosen=true;save.tut={training:1,basics:1};for(const a of CAMPAIGN_ORDER)save.arenasCleared[a]=true;save.stash=[];save.rewardOverflow=[];persistNow();}
   currentArena='bosque';lobbyAllies=pickLobbyAllies(selectedClass);setState('prep');renderPrepSummary();
  },[champ,initial]);return p;
 }
 try{
  const hc=await browser.newContext({viewport:{width:1280,height:720}}),gc=await browser.newContext({viewport:{width:844,height:390}});
  const host=await boot(hc,'tanque',true),guest=await boot(gc,'mago',true);
  await host.evaluate(()=>netCreateRoom('bosque','tanque',5));const code=await host.evaluate(()=>net.code);
  await guest.evaluate(code=>netJoinRoom(code,'mago',5),code);
  await host.waitForFunction(()=>netLobby.loadouts && netLobby.loadouts[1]);
  await guest.evaluate(()=>{for(let i=0;i<INVENTORY_CAPACITY;i++)save.stash.push(makeItem('arma','raro','mago'));persistNow();});
  await host.waitForFunction(()=>typeof assetsAllReady!=='function'||assetsAllReady());
  assert.equal(await host.evaluate(()=>netHostStartGame()),true);
  await guest.waitForFunction(()=>state==='playing' && CampaignInbox.protocol);
  await host.evaluate(()=>{spawnTimer=1e12;update=dt=>updateRunTimers(dt);});
  await guest.close(); // no client exists to receive the end message
  await host.evaluate(()=>finishBossVictory());
  await host.waitForFunction(()=>state==='victory' && !netMatch.rewardPending);
  await hc.close();await stop();await relay(); // same storage, no room or host survives
  const returning=await boot(gc,'mago',false);
  await returning.evaluate(()=>{setState('mainmenu');return netConnect();});
  await returning.waitForFunction(()=>CampaignInbox.ids.length===1);
  await returning.evaluate(()=>netSend({t:'reward-get',id:CampaignInbox.ids[0]}));
  await returning.waitForFunction(()=>state==='victory' && save.lastVictoryReward && saveLastWriteOK);
  const blocked=await returning.evaluate(()=>{
   const write=Storage.prototype.setItem,alert=gameAlert;let warnings=0;
   try{Storage.prototype.setItem=()=>{throw Error('quota test');};gameAlert=()=>{warnings++;};
    for(const id of ['menu-btn-2','again-btn','victory-next-btn'])document.getElementById(id).click();
    return {state,warnings};
   }finally{Storage.prototype.setItem=write;gameAlert=alert;persistNow();}
  });assert.deepEqual(blocked,{state:'victory',warnings:3});
  const before=await returning.evaluate(()=>({n:rewardOverflowCount(),gold:save.gold,xp:save.champions.mago.xp,id:save.lastVictoryReward.id,stash:save.stash.length}));
  assert.ok(before.n>0);assert.equal(before.stash,await returning.evaluate(()=>INVENTORY_CAPACITY));
  await returning.evaluate(()=>{netSend({t:'reward-open',key:localStorage.getItem(Object.keys(localStorage).find(k=>k.startsWith('horda_reward_key:')))});});
  await returning.waitForFunction(()=>CampaignInbox.ids.length===0);
  await returning.reload({waitUntil:'load'});await returning.waitForFunction(()=>saveLoadStarted);
  const after=await returning.evaluate(()=>({n:rewardOverflowCount(),gold:save.gold,xp:save.champions.mago.xp,id:save.lastVictoryReward.id,stash:save.stash.length}));assert.deepEqual(after,before);
  await returning.evaluate(()=>{setState('mainmenu');rewardReview();});
  assert.ok(await returning.locator('#reward-mailbox').isVisible());
  fs.mkdirSync('docs/quality/reward-recovery',{recursive:true});await returning.screenshot({path:'docs/quality/reward-recovery/mailbox-mobile.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS real relay + Chromium: guest absent at victory, host gone, server restart, full stash to mailbox, reload, no duplicate, review UI');
 }finally{await browser.close();await site.close();await stop();fs.rmSync(dir,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
