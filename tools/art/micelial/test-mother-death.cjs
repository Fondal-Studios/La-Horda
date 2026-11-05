'use strict';
// Actual death-controller evidence; passive targets isolate this from random ally CC.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),{chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'../../..'),OUT='/tmp/mother-browser/death';fs.mkdirSync(OUT,{recursive:true});let browser,server;
(async()=>{
 server=spawn('python3',['-m','http.server','8851','--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});await new Promise(r=>setTimeout(r,500));browser=await chromium.launch({args:['--no-sandbox']});
 for(const viewport of [{width:1280,height:720},{width:844,height:390}]){
  const page=await browser.newPage({viewport,recordVideo:{dir:OUT,size:viewport}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  await page.goto('http://127.0.0.1:8851/?motherArtPilot=1&motherBloomKey=1&motherHeartKey=1&motherCoreLayer=1&motherDeathPilot=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof startRun==='function'&&_micMotherAtlasReady()&&MIC_MP_OK.mp_death&&MIC_MP_OK.mp_bloom_idle&&MIC_MP_OK.mp_heart_key,null,{polling:100,timeout:120000});
  await page.evaluate(()=>{
   selectedClass='tanque';currentArena='micelial';lobbyAllies=[];netMatch=null;startRun(10);setState('playing');micMotherRevealStart();for(const h of allies)h.isRemote=true;
   // Let the real reveal/controller finish before staging the phase3 death.
   // Startup is a separate fixture epoch: discard only its pending timers/UI
   // BEFORE new attack hazards and killEnemy. No effect is hidden after death.
   for(let i=0;i<1000;i++){for(const h of heroes){h.hp=h.maxHp;h.x=80;h.y=260;}update(16);}
   if(micS.mo.st!=='fight')throw Error('real startup did not reach fight');
   clearRunTimers();arenaTitleCardHide();vfxResetRun();resetFeedback();bossHudHint(null);
   HUDTXT.q=[];HUDTXT.cur=null;HUDTXT.until=0;
   const banner=document.getElementById('center-banner');if(banner)banner.classList.remove('show');
   const intro=document.getElementById('boss-intro');if(intro)intro.classList.add('hidden');
   const e=micMotherEntity();window.deathBoss=e;boss=e;bossActive=true;activeChampion=null;e.micDormant=0;e.hp=e.maxHp*.2;micS.mo={st:'fight',ph:3,t:0,dark:0,bloom:1,heart:1,inf:0,beat:900};bossHudPhase(2,3);
   Object.assign(e,{packTimer:0,packSet:null,stunTimer:0,bossWind:null,mcd:1e9,whipCd:1e9,clawCd:1e9,rootsCd:1e9,sporeCd:1e9,summonCd:1e9,cloudCd:1e9,halCd:1e9});
   for(const h of heroes){h.hp=h.maxHp;h.x=80;h.y=260;}_micBlend=1;spawnTimer=1e9;
   _bossIntroT=0;_bossIntroDelay=0;for(let i=0;i<160;i++){updateArenaCameraZoom();updateCamLift();}
   render();
  });
  await page.screenshot({path:path.join(OUT,viewport.width+'-before-kill-phase3.png')});
  const setup=await page.evaluate(()=>{
   const e=deathBoss;
   // Establish real pending attacks/projectiles/clouds before the real death hook.
   micMotherSpores(e,player,6);micMotherWhip(e,player);micAddCloud(0,150,'big');
   window.deathPendingHits=0;const pending=e.bossWind.fn;e.bossWind.fn=function(...a){deathPendingHits++;return pending.apply(this,a)};
   window.deathVictoryCalls=[];window.deathRewardCalls=[];window.deathVictoryOriginal=finishBossVictory;window.deathRewardOriginal=buildVictoryData;
   finishBossVictory=function(...a){deathVictoryCalls.push({time:runElapsedMs,state:micS.mo.st,t:micS.mo.t});return deathVictoryOriginal.apply(this,a)};
   buildVictoryData=function(...a){deathRewardCalls.push(runElapsedMs);return deathRewardOriginal.apply(this,a)};
   const before={projectiles:projectiles.length,enemyProjectiles:projectiles.filter(p=>p.enemy).length,friendlyProjectiles:projectiles.filter(p=>!p.enemy).length,clouds:micS.clouds.length,pending:!!e.bossWind};killEnemy(e);window.deathStart=runElapsedMs;
   window.deathSample=()=>{
    const M=micS.mo,p=_micMotherPilotPose(null,M,runElapsedMs,_micMotherFrame(null,M,runElapsedMs)),calls=[],draw=ctx.drawImage;
    ctx.drawImage=function(...a){if(a[0]===MIC_MP.mp_death)calls.push({sx:a[1],alpha:ctx.globalAlpha});return draw.apply(this,a)};try{render()}finally{ctx.drawImage=draw;}
    return {elapsed:runElapsedMs-deathStart,state:state,mother:{...M},pose:p,legacy:_micMotherFrame(null,M,runElapsedMs),calls,pendingHits:deathPendingHits,projectiles:projectiles.length,enemyProjectiles:projectiles.filter(p=>p.enemy).length,friendlyProjectiles:projectiles.filter(p=>!p.enemy).length,clouds:micS.clouds.length,strikes:bossStrikes.length,aliveEnemies:enemies.filter(o=>o.alive).length,victoryCalls:deathVictoryCalls.slice(),rewardCalls:deathRewardCalls.slice()};
   };
   return {before,after:deathSample(),deathMs:MIC_CFG.madre.deathMs};
  });
  const rows=[setup.after],captured=new Set();
  for(let i=0;i<345;i++){
   const row=await page.evaluate(()=>{update(16);update(16);return deathSample();});rows.push(row);
   const target=row.elapsed<100?'initial':row.elapsed>=4700&&row.elapsed<4800?'collapse':row.elapsed>=6600&&row.elapsed<6700?'fallen':row.elapsed>=8400&&row.elapsed<8500?'fade':row.elapsed>=9000&&row.elapsed<9100?'absent':row.elapsed>=10500?'completed':null;
   if(target&&!captured.has(target)){await page.screenshot({path:path.join(OUT,`${viewport.width}-${target}.png`)});captured.add(target);}
   await page.waitForTimeout(32);
  }
  fs.writeFileSync(path.join(OUT,viewport.width+'-controller-diagnostic.json'),JSON.stringify({setup,rows,errors,scope:'Actual killEnemy and production controller/VFX. Passive damageable allies. Ordinary kill loot may precede victory; victory reward generation must not.'},null,2));
  assert(setup.before.pending&&setup.before.clouds>0&&setup.before.projectiles>0,'real hazards established');
  assert.equal(setup.after.mother.st,'dying');assert.equal(setup.after.aliveEnemies,0);assert.equal(setup.after.clouds,0);assert.equal(setup.after.strikes,0);
  assert(setup.before.enemyProjectiles>0,'actual enemy spores present before kill');
  assert.equal(setup.after.enemyProjectiles,0,'killEnemy→onBossDefeated→bossDeathCleanup clears enemy projectiles before arena death hook');
  assert.equal(setup.after.friendlyProjectiles,setup.before.friendlyProjectiles,'friendly projectiles preserved by existing cleanup');
  assert(rows.every(r=>r.pendingHits===0),'removed boss cannot resolve pending windup');
  assert(rows.filter(r=>r.elapsed<setup.deathMs).every(r=>r.victoryCalls.length===0&&r.rewardCalls.length===0),'no early victory or victory rewards');
  const completed=rows.find(r=>r.victoryCalls.length);assert(completed&&completed.elapsed>=setup.deathMs&&completed.elapsed<setup.deathMs+32);
  assert.equal(rows.at(-1).victoryCalls.length,1);assert.equal(rows.at(-1).rewardCalls.length,1);assert.equal(rows.at(-1).mother.st,'dead');
  for(const row of rows){
   if(row.elapsed<9000){const expected=row.elapsed<4700?0:row.elapsed<6600?1:2;assert(row.calls.some(c=>c.sx===expected*656),'actual death frame follows controller');}
   else assert.equal(row.calls.length,0,'no body after visual disappearance');
  }
  assert(rows.some(r=>r.elapsed>8000&&r.elapsed<9000&&r.calls.some(c=>c.alpha>0&&c.alpha<1)),'actual death body fades');
  const routing=await page.evaluate(()=>{
   const checks=[];for(const t of [0,4699,4700,6599,6600,7999,8000,8500,8999,9000]){
    const M={st:'dying',t,ph:3,heart:1,bloom:1},pose=_micMotherFrame(null,M,runElapsedMs),p=_micMotherPilotPose(null,M,runElapsedMs,pose),copy=netSer(M,1);
    checks.push({t,pose,p,late:_micMotherPilotPose(null,copy,runElapsedMs,_micMotherFrame(null,copy,runElapsedMs))});
   }
   const rewardCount=deathRewardCalls.length;finishBossVictory();const duplicateSafe=deathRewardCalls.length===rewardCount;
   finishBossVictory=deathVictoryOriginal;buildVictoryData=deathRewardOriginal;
   return {checks,duplicateSafe};
  });
  assert(routing.duplicateSafe,'victory reward guard idempotent');for(const r of routing.checks){assert.deepEqual(r.p,r.late,'serialized death pose');assert.equal(r.p.frame,r.t<4700?0:r.t<6600?1:2);assert.equal(r.pose.alpha,1-Math.min(1,Math.max(0,(r.t-8000)/1000)));}
  // Fresh real run proves lifecycle state is not retained. Then an actual paused
  // update preserves the authoritative death clock and selected death frame.
  const restart=await page.evaluate(()=>{
   startRun(10);setState('playing');micMotherRevealStart();for(const h of allies)h.isRemote=true;const e=micMotherEntity();boss=e;bossActive=true;e.micDormant=0;micS.mo.st='fight';
   const fresh={st:micS.mo.st,t:micS.mo.t,done:_bossVictoryDone};killEnemy(e);update(16);const before=JSON.stringify(micS.mo),time=runElapsedMs;state='paused';update(1000);const paused=before===JSON.stringify(micS.mo)&&time===runElapsedMs;state='playing';
   const M=micS.mo,ready=MIC_MP_OK.mp_death;MIC_MP_OK.mp_death=false;let count=0,fallbackCount=0;const draw=ctx.drawImage;ctx.drawImage=function(...a){if(a[0]===MIC_MP.mp_death)count++;if(a[0]===MIC_MP.mp_atlas)fallbackCount++;return draw.apply(this,a)};try{render()}finally{ctx.drawImage=draw;MIC_MP_OK.mp_death=ready;}
   return {fresh,paused,missingDeathDraws:count,fallbackCount};
  });assert(!restart.fresh.done);assert(restart.paused);assert.equal(restart.missingDeathDraws,0);assert(restart.fallbackCount>0,'missing death asset renders intact legacy atlas');
  const defaultPage=await browser.newPage({viewport});await defaultPage.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  await defaultPage.goto('http://127.0.0.1:8851/?motherArtPilot=1&motherBloomKey=1&motherHeartKey=1&motherCoreLayer=1',{waitUntil:'domcontentloaded'});
  await defaultPage.waitForFunction(()=>typeof _micMotherPilotPose==='function');
  assert(await defaultPage.evaluate(()=>{const M={st:'dying',t:5000,ph:3,heart:1};return !MIC_MOTHER_DEATH_PILOT_ON&&_micMotherPilotPose(null,M,0,_micMotherFrame(null,M,0))===null;}),'death pilot remains opt-in');await defaultPage.close();
  fs.writeFileSync(path.join(OUT,viewport.width+'-result.json'),JSON.stringify({status:'DEATH_CONTROLLER_PILOT_NOT_VISUAL_RELEASE',routing,restart,errors},null,2));assert.deepEqual(errors,[]);await page.close();
 }
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(server)server.kill();});
