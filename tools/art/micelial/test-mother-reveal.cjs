'use strict';
// Opt-in entrance slice. Passive allies isolate boss animation, not randomized-party play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),{chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'../../..'),OUT='/tmp/mother-browser/reveal';fs.mkdirSync(OUT,{recursive:true});let browser,server;
(async()=>{
 server=spawn('python3',['-m','http.server','8852','--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});await new Promise(r=>setTimeout(r,500));browser=await chromium.launch({args:['--no-sandbox']});
 for(const viewport of [{width:1280,height:720},{width:844,height:390}]){
  const page=await browser.newPage({viewport,recordVideo:{dir:OUT,size:viewport}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  await page.goto('http://127.0.0.1:8852/?motherArtPilot=1&motherBloomKey=1&motherHeartKey=1&motherCoreLayer=1&motherRevealPilot=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof startRun==='function'&&_micMotherAtlasReady()&&MIC_MP_OK.mp_pilot,null,{polling:100,timeout:120000});
  const setup=await page.evaluate(()=>{
   selectedClass='tanque';currentArena='micelial';lobbyAllies=[];netMatch=null;startRun(10);setState('playing');for(const h of allies)h.isRemote=true;
   for(const h of heroes){h.hp=h.maxHp;h.x=80;h.y=260;}spawnTimer=1e9;
   window.revealSample=()=>{
    const e=micMotherEntity(),M=micS.mo,p=_micMotherPilotPose(e,M,runElapsedMs,_micMotherFrame(e,M,runElapsedMs)),calls=[],rects=[];
    const draw=ctx.drawImage,rect=ctx.rect;ctx.drawImage=function(...a){for(const k of ['mp_pilot','mp_atlas'])if(a[0]===MIC_MP[k])calls.push({key:k,sx:a[1],rect:a.slice(5),alpha:ctx.globalAlpha});return draw.apply(this,a)};ctx.rect=function(...a){rects.push(a);return rect.apply(this,a)};
    try{render()}finally{ctx.drawImage=draw;ctx.rect=rect;}
    return {time:runElapsedMs,M:{...M},pose:p,legacy:_micMotherFrame(e,M,runElapsedMs),calls,rects,zoom:CAM_ZOOM,base:MIC_MOTHER_BASE,entity:e?{dormant:e.micDormant,mult:e.dmgTakenMult}:null};
   };
   const actual=micS.mo;micS.mo={st:'sleep',ph:1,t:0};const sleep=revealSample();micS.mo=actual;
   return {initial:revealSample(),sleep,revealMs:MIC_CFG.madre.revealMs,stirMs:MIC_STIR_MS};
  });
  const rows=[setup.initial],captures=new Set();let lifecycle=null,guard=0;
  while(guard++<600){
   const row=await page.evaluate(()=>{const n=micS.mo.st==='stir'?8:2;for(let i=0;i<n;i++){for(const h of heroes){h.hp=h.maxHp;h.x=80;h.y=260;}update(16);}return revealSample();});rows.push(row);
   const label=row.M.st==='stir'?'stir':row.M.st==='reveal'&&row.M.t<1500?'hidden':row.M.st==='reveal'&&row.M.t>=3000&&row.M.t<3100?'emerging':row.M.st==='reveal'&&row.M.t>=5500&&row.M.t<5600?'unfurl':row.M.st==='reveal'&&row.M.t>=7000?'full':row.M.st==='fight'?'first-idle':null;
   if(label&&!captures.has(label)){await page.screenshot({path:path.join(OUT,`${viewport.width}-${label}.png`)});captures.add(label);}
   if(!lifecycle&&row.M.st==='reveal'&&row.M.t>=4000){
    lifecycle=await page.evaluate(()=>{
     const M=micS.mo,e=micMotherEntity(),before=JSON.stringify(M),time=runElapsedMs,p=_micMotherPilotPose(e,M,time,_micMotherFrame(e,M,time));state='paused';update(1000);const paused=before===JSON.stringify(M)&&runElapsedMs===time;state='playing';
     const copy=netSer(M,1),entity=_netDeltaOf({},e,true),late=_micMotherPilotPose(entity,copy,time,_micMotherFrame(entity,copy,time));
     const ready=MIC_MP_OK.mp_pilot;MIC_MP_OK.mp_pilot=false;const fallback=revealSample();MIC_MP_OK.mp_pilot=ready;
     return {paused,p,late,fallback};
    });
   }
   await page.waitForTimeout(row.M.st==='stir'?16:32);
   if(row.M.st==='fight')break;
  }
  // Exact endpoint probes are explicitly synthetic timestamp diagnostics, NOT
  // substitutes for the actual controller timeline above. Camera stays live.
  const seams=[];
  for(const t of [6999,7000,7001,8999,9000]){
   const seam=await page.evaluate(t=>{
    const actualM=micS.mo,actualTime=runElapsedMs,e=micMotherEntity();
    const revealEpoch=actualTime-actualM.t-9000;
    micS.mo={st:'reveal',ph:1,t,dark:0,bloom:0,heart:0};runElapsedMs=revealEpoch+t;
    const row=revealSample(),fight={...micS.mo,st:'fight',t:0};
    const firstIdle=_micMotherPilotPose(e,fight,runElapsedMs,_micMotherFrame(e,fight,runElapsedMs));
    micS.mo=actualM;runElapsedMs=actualTime;return {t,row,firstIdle,kind:'EXACT_TIMESTAMP_DIAGNOSTIC_NOT_REAL_CONTROLLER_STEP'};
   },t);seams.push(seam);
   await page.screenshot({path:path.join(OUT,`${viewport.width}-seam-${t}.png`)});
  }
  fs.writeFileSync(path.join(OUT,viewport.width+'-diagnostic.json'),JSON.stringify({setup,rows,lifecycle,seams,captures:[...captures],errors,scope:'Actual stir→reveal→fight controller with authored VFX and passive damageable targets. Stir playback accelerated; reveal sampled32ms.'},null,2));
  assert.equal(setup.initial.M.st,'stir');assert.equal(setup.sleep.calls.length,0,'sleep has no mother body');
  assert(rows.filter(r=>r.M.st==='stir'||(r.M.st==='reveal'&&r.M.t<=1500)).every(r=>r.calls.length===0),'stir and pre-emergence body hidden');
  const reveal=rows.filter(r=>r.M.st==='reveal');assert(reveal.length>0);assert(reveal.every(r=>r.entity&&r.entity.dormant===1&&r.entity.mult===0),'reveal remains dormant/invulnerable');
  const visible=reveal.filter(r=>r.M.t>1500);assert(visible.every(r=>r.calls.some(c=>c.key==='mp_pilot')),'highres body used during emergence');
  for(const r of visible){
   const c=r.calls.find(c=>c.key==='mp_pilot');assert.equal(c.rect[1]+472,r.base,'fixed root baseline');assert.equal(c.rect[2],432);assert.equal(c.rect[3],496);
   if(r.M.t<7000){const rise=(r.M.t-1500)/5500;const clip=r.rects.find(a=>Math.abs(a[1]-(r.base-496*rise))<1e-6&&a[2]===436);assert(clip,'ground reveal clips rather than scales body');assert(clip[1]+clip[3]>=c.rect[1]+c.rect[3],'ground clip includes full root-fan bottom');}
   else assert.equal(c.sx,[0,1,2,1][Math.floor(r.time/360)%4]*432,'full emergence joins normal idle clock');
  }
  assert.deepEqual([...new Set(visible.filter(r=>r.M.t<7000).map(r=>r.calls.find(c=>c.key==='mp_pilot').sx))].sort((a,b)=>a-b),[0,432,864]);
  const fight=rows.at(-1);assert.equal(fight.M.st,'fight');assert.equal(fight.entity.dormant,0);assert.equal(fight.entity.mult,1);assert.equal(fight.pose.key,'mp_pilot');
  const firstReveal=reveal[0];assert(firstReveal.time>=setup.stirMs&&firstReveal.time<setup.stirMs+128,'actual stir duration');assert(fight.time-firstReveal.time>=setup.revealMs-16&&fight.time-firstReveal.time<=setup.revealMs+32,'actual9000ms reveal duration');
  assert.equal(seams[0].row.pose.frame,2,'last unfolding pose before7000');
  for(const seam of seams.filter(s=>s.t>=7000))assert.deepEqual(seam.row.pose,seam.firstIdle,'full emergence shares exact idle-clock selection');
  assert(lifecycle.paused);assert.deepEqual(lifecycle.p,lifecycle.late);assert(lifecycle.fallback.calls.some(c=>c.key==='mp_atlas'));assert(!lifecycle.fallback.calls.some(c=>c.key==='mp_pilot'));
  const defaultPage=await browser.newPage({viewport});await defaultPage.addInitScript(()=>{window.requestAnimationFrame=()=>0;});await defaultPage.goto('http://127.0.0.1:8852/?motherArtPilot=1&motherBloomKey=1&motherHeartKey=1&motherCoreLayer=1',{waitUntil:'domcontentloaded'});await defaultPage.waitForFunction(()=>typeof _micMotherPilotPose==='function');
  assert(await defaultPage.evaluate(()=>{const M={st:'reveal',ph:1,t:4000};return !MIC_MOTHER_REVEAL_PILOT_ON&&_micMotherPilotPose(null,M,0,_micMotherFrame(null,M,0))===null;}),'entrance remains opt-in');await defaultPage.close();
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(OUT,viewport.width+'-result.json'),JSON.stringify({status:'REVEAL_CONTROLLER_PILOT_NOT_VISUAL_RELEASE',firstFight:fight,scope:'No gameplay timing changes; not randomized-party coverage.'},null,2));await page.close();
 }
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(server)server.kill();});
