'use strict';
const H=require('../lib/serve'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const site=await H.startSite(),browser=await H.launch();
 try{
  fs.mkdirSync('docs/quality/health-hud',{recursive:true});
  for(const [width,height] of [[844,390],[1280,720]]){
   const page=await browser.newPage({viewport:{width,height}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await H.goto(page,site.url+'/index.html?dev=1',{waitUntil:'load'});
   await page.waitForFunction(()=>typeof startRun==='function' && typeof save!=='undefined' && saveLoadStarted);
   const result=await page.evaluate(()=>{
    selectedClass='mago';save.champions.mago.unlocked=true;save.tut={training:1,basics:1};
    currentArena='bosque';lobbyAllies=['tanque','soporte','guerrero'];startRun(1);setState('playing');
    update=()=>{};spawnTimer=1e12;
    player.maxHp=100;player.hp=100;player.itemMaxShield=100;player.itemShield=0;player.shield=0;
    updateHUD();renderParty();
    const full=document.getElementById('hp-fill').style.width;
    player.hp=50;player.shield=500;updateHUD();
    const partial=document.getElementById('hp-fill').style.width;
    player.hp=100;player.shield=50;updateHUD();
    const hp=document.getElementById('hp-fill').getBoundingClientRect(),sh=document.getElementById('hp-shield-fill').getBoundingClientRect();
    return {full,partial,distinct:hp.bottom<=sh.top||sh.bottom<=hp.top,useful:potionUseful(player,{type:'heal'})};
   });
   assert.equal(result.full,'100%');assert.equal(result.partial,'50%');assert.equal(result.useful,false);assert.ok(result.distinct);
   await page.screenshot({path:`docs/quality/health-hud/${width}x${height}.png`});
   assert.deepEqual(errors,[]);console.log('PASS actual HUD, shield and potion at',width,height,JSON.stringify(result));
   await page.close();
  }
 }finally{await browser.close();await site.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
