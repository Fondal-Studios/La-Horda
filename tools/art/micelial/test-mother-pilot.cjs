'use strict';
// Review-only idle source pilot in the real game renderer, not a gameplay approval.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),{chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'../../..'),OUT='/tmp/mother-browser/high-detail-pilot';fs.mkdirSync(OUT,{recursive:true});let browser,server;
(async()=>{
 server=spawn('python3',['-m','http.server','8849','--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});await new Promise(r=>setTimeout(r,500));
 browser=await chromium.launch({args:['--no-sandbox']});
 for(const viewport of [{width:1280,height:720},{width:844,height:390}]){
  const page=await browser.newPage({viewport,recordVideo:{dir:OUT,size:viewport}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  await page.goto('http://127.0.0.1:8849/?motherArtPilot=1&motherBloomKey=1&motherHeartKey=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof startRun==='function'&&_micMotherAtlasReady()&&MIC_MP_OK.mp_pilot&&MIC_MP_OK.mp_pilot_attack&&MIC_MP_OK.mp_bloom_key&&MIC_MP_OK.mp_bloom_trans&&MIC_MP_OK.mp_bloom_idle&&MIC_MP_OK.mp_bloom_attack&&MIC_MP_OK.mp_pilot_cast&&MIC_MP_OK.mp_bloom_cast&&MIC_MP_OK.mp_heart_key,null,{polling:100,timeout:120000});
  await page.evaluate(()=>{
   selectedClass='tanque';currentArena='micelial';lobbyAllies=[];netMatch=null;startRun(10);setState('playing');micMotherRevealStart();
   // Isolated boss-animation gate: targets remain alive/in range and receive real
   // damage, but random ally ultimates must not freeze/interrupt the tested AI.
   // startRun -> resetRunTransients clears prior Axiom state; updateAllies skips
   // isRemote targets (js/ai/allies.js), without changing host enemy simulation.
   if(axiomFreezeTimer!==0||axiomForceQuitFlash!==0)throw Error('startRun failed to reset Axiom transient state');
   for(const h of allies)h.isRemote=true;

   const e=micMotherEntity();window.motherProbe=e;boss=e;bossActive=true;activeChampion=null;micS.mo.st='fight';micS.mo.ph=1;e.micDormant=0;e.dmgTakenMult=1;player.hp=player.maxHp;
   for(let i=0;i<800;i++){for(const h of heroes)h.hp=h.maxHp;update(16);}
   player.x=0;player.y=260;e.hp=e.maxHp;e.alive=true;Object.assign(e,{packSet:null,packTimer:0,bossWind:null,hitFlash:0,stunTimer:0});
   micS.mo={st:'fight',ph:1,t:0,dark:0,bloom:0,heart:0,inf:0,beat:0};_micBlend=1;
   _bossIntroT=0;_bossIntroDelay=0;HUDTXT.q=[];HUDTXT.until=0;
   for(const id of ['boss-intro','center-banner','arena-title-card']){const el=document.getElementById(id);if(el){el.classList.remove('show');el.classList.add('hidden');}}
   for(let i=0;i<160;i++){updateArenaCameraZoom();updateCamLift();}
  });
  await page.evaluate(()=>{window.pilotCameraFns=[updateArenaCameraZoom,updateCamLift];updateArenaCameraZoom=()=>{};updateCamLift=()=>{};});
  for(const [label,pilot,atlas]of [['portrait',false,false],['old-authored',false,true],['high-detail-pilot',true,true]]){
   await page.evaluate(({pilot,atlas})=>{MIC_MP_OK.mp_pilot=pilot;MIC_MP_OK.mp_atlas=atlas;runElapsedMs=0;render();},{pilot,atlas});
   await page.screenshot({path:path.join(OUT,viewport.width+'-'+label+'.png')});
  }
  await page.evaluate(()=>{[updateArenaCameraZoom,updateCamLift]=window.pilotCameraFns;});
  const seen=[];
  for(let i=0;i<48;i++){
   seen.push(await page.evaluate(i=>{runElapsedMs=i*90;let source=null;const draw=ctx.drawImage;ctx.drawImage=function(...a){if(a[0]===MIC_MP.mp_pilot)source=a[1];return draw.apply(this,a)};try{render()}finally{ctx.drawImage=draw}return source},i));
   await page.waitForTimeout(90);
  }
  assert.deepEqual([...new Set(seen)].sort((a,b)=>a-b),[0,432,864]);assert.deepEqual(errors,[]);
  await page.evaluate(()=>{
   const e=window.motherProbe;Object.assign(e,{packSet:null,packTimer:0,bossWind:null,mcd:0,whipCd:0,clawCd:9e8,rootsCd:9e8,sporeCd:9e8,summonCd:9e8,cloudCd:9e8,halCd:9e8});
   micS.mo={st:'fight',ph:1,t:0,bloom:0,heart:0,inf:0};spawnTimer=9e8;
   window.pilotHits=[];window.pilotHitOriginal=bossHitHero;
   bossHitHero=function(...a){if(a[2]&&a[2].from===window.motherProbe)window.pilotHits.push(runElapsedMs);return window.pilotHitOriginal.apply(this,a)};
  });
  const action=[];let impactShot=false;
  for(let i=0;i<64;i++){
   const row=await page.evaluate(()=>{
    for(let j=0;j<6;j++){for(const h of heroes){h.hp=h.maxHp;h.x=80;h.y=260;}update(16);}
    const calls=[],draw=ctx.drawImage;ctx.drawImage=function(...a){if(a[0]===MIC_MP.mp_pilot||a[0]===MIC_MP.mp_pilot_attack)calls.push({key:a[0]===MIC_MP.mp_pilot?'idle':'attack',sx:a[1]});return draw.apply(this,a)};
    try{render()}finally{ctx.drawImage=draw}
    return {time:runElapsedMs,calls,hits:window.pilotHits.slice(),wind:!!window.motherProbe.bossWind};
   });action.push(row);
   if(!impactShot&&row.calls.some(c=>c.key==='attack'&&c.sx===480)){await page.screenshot({path:path.join(OUT,viewport.width+'-impact-pilot.png')});impactShot=true;}
   await page.waitForTimeout(90);
  }
  const attacks=action.flatMap(r=>r.calls.filter(c=>c.key==='attack').map(c=>c.sx));
  assert.deepEqual([...new Set(attacks)].sort((a,b)=>a-b),[0,480,960]);
  const impact=action.find(r=>r.calls.some(c=>c.key==='attack'&&c.sx===480));
  const hits=action.at(-1).hits;assert(hits.length>0,'actual attack must resolve damage callback');
  assert(hits.some(t=>Math.abs(t-impact.time)<=192),'impact pose must coincide with actual damage window');
  assert(action.at(-1).calls.some(c=>c.key==='idle'),'action returns to high-detail idle');
  await page.evaluate(()=>{bossHitHero=window.pilotHitOriginal;});
  fs.writeFileSync(path.join(OUT,viewport.width+'-attack-timing.json'),JSON.stringify({action,hits,status:'DAMAGE_TIMED_PHASE1_PILOT_PASS_NOT_RELEASE'},null,2));
  // Static keypose geometry gate, intentionally NOT a transformation animation.
  const geometry=[];
  for(const phase of [1,2]){
   geometry.push(await page.evaluate(phase=>{
    const e=window.motherProbe;Object.assign(e,{packSet:null,packTimer:0,bossWind:null,hitFlash:0});
    Object.assign(micS.mo,{st:'fight',ph:phase,t:0,bloom:phase===2?1:0,heart:0,net:null});
    player.x=80;player.y=260;runElapsedMs=0;
    for(let i=0;i<160;i++){updateArenaCameraZoom();updateCamLift();}
    let call=null;const draw=ctx.drawImage;ctx.drawImage=function(...a){if(a[0]===MIC_MP.mp_bloom_idle||a[0]===MIC_MP.mp_pilot)call={key:a[0]===MIC_MP.mp_bloom_idle?'bloom':'idle',rect:a.slice(5)};return draw.apply(this,a)};
    try{render()}finally{ctx.drawImage=draw}return {phase,call,zoom:CAM_ZOOM};
   },phase));
   await page.screenshot({path:path.join(OUT,viewport.width+'-geometry-phase'+phase+'.png')});
   await page.waitForTimeout(1200);
  }
  assert.equal(geometry[0].call.key,'idle');assert.equal(geometry[1].call.key,'bloom');
  assert.equal(geometry[0].zoom,geometry[1].zoom,'same production camera geometry');
  assert.equal(geometry[0].call.rect[1]+472,geometry[1].call.rect[1]+528,'same root baseline');
  fs.writeFileSync(path.join(OUT,viewport.width+'-bloom-geometry.json'),JSON.stringify({geometry,status:'STATIC_KEYPOSE_ONLY_NOT_SEQUENCE_APPROVAL'},null,2));
  // Drive the real phase threshold/controller, including its darkness and HUD.
  await page.evaluate(()=>{
   const e=window.motherProbe;micS.mo={st:'fight',ph:1,t:0,bloom:0,heart:0,inf:0};
   Object.assign(e,{hp:e.maxHp*0.59,packSet:null,packTimer:0,bossWind:null,stunTimer:0,mcd:1e9});
  });
  const evolution=[],shots=new Set();
  for(let i=0;i<110;i++){
   const row=await page.evaluate(()=>{
    for(let j=0;j<4;j++){for(const h of heroes){h.hp=h.maxHp;h.x=80;h.y=260;}window.motherProbe.mcd=1e9;update(16);}
    const calls=[],draw=ctx.drawImage;ctx.drawImage=function(...a){for(const key of ['mp_pilot','mp_bloom_trans','mp_bloom_key','mp_bloom_idle'])if(a[0]===MIC_MP[key])calls.push({key,sx:a[1]});return draw.apply(this,a)};
    try{render()}finally{ctx.drawImage=draw}
    return {time:runElapsedMs,phase:micS.mo.ph,tr:micS.mo.tr?{...micS.mo.tr}:null,bloom:micS.mo.bloom,bloomAt:micS.mo.bloomAt,calls,damageMultiplier:window.motherProbe.dmgTakenMult};
   });evolution.push(row);
   for(const c of row.calls){const name=c.key+'-'+c.sx;if(!shots.has(name)){shots.add(name);await page.screenshot({path:path.join(OUT,viewport.width+'-evolution-'+name+'.png')});}}
   await page.waitForTimeout(64);
  }
  assert(evolution.some(r=>r.tr&&r.tr.to===2),'actual health threshold initiates transition');
  assert.deepEqual([...new Set(evolution.flatMap(r=>r.calls.filter(c=>c.key==='mp_bloom_trans').map(c=>c.sx)))].sort((a,b)=>a-b),[0,656,1312]);
  assert(evolution.at(-1).bloom&&!evolution.at(-1).tr,'controller finishes and enters bloom');
  assert.equal(evolution.at(-1).damageMultiplier,1,'unchanged transition vulnerability restored');
  assert.deepEqual([...new Set(evolution.flatMap(r=>r.calls.filter(c=>c.key==='mp_bloom_idle').map(c=>c.sx)))].sort((a,b)=>a-b),[0,656,1312]);
  const netProof=await page.evaluate(()=>{
   const e=window.motherProbe,M=netSer(micS.mo,1),copy=_netDeltaOf({},e,true),pose=_micMotherFrame(e,micS.mo,runElapsedMs);
   return {epoch:micS.mo.bloomAt,serializedEpoch:M.bloomAt,host:_micMotherPilotPose(e,micS.mo,runElapsedMs,pose),lateJoin:_micMotherPilotPose(copy,M,runElapsedMs,_micMotherFrame(copy,M,runElapsedMs))};
  });assert(Number.isFinite(netProof.epoch));assert.equal(netProof.epoch,netProof.serializedEpoch);assert.deepEqual(netProof.host,netProof.lateJoin);
  const epochs=evolution.filter(r=>r.bloom).map(r=>r.bloomAt);assert.equal(new Set(epochs).size,1,'epoch set once, not refreshed');
  fs.writeFileSync(path.join(OUT,viewport.width+'-evolution-timing.json'),JSON.stringify({evolution,netProof,status:'ACTUAL_PHASE_CONTROLLER_PILOT_NOT_RELEASE'},null,2));
  for(const actionName of ['whip','claw']){
   await page.evaluate(actionName=>{
    const e=window.motherProbe;Object.assign(micS.mo,{st:'fight',ph:2,tr:null,bloom:1,heart:0});
    Object.assign(e,{hp:e.maxHp*0.55,packSet:null,packTimer:0,bossWind:null,stunTimer:0,mcd:0,whipCd:actionName==='whip'?0:1e9,clawCd:actionName==='claw'?0:1e9,rootsCd:1e9,sporeCd:1e9,summonCd:1e9,cloudCd:1e9,halCd:1e9});
    window.bloomHits=[];window.bloomHitOriginal=bossHitHero;bossHitHero=function(...a){if(a[2]&&a[2].from===window.motherProbe)window.bloomHits.push(runElapsedMs);return window.bloomHitOriginal.apply(this,a)};
   },actionName);
   const rows=[];let captured=false;
   for(let i=0;i<52;i++){
    const row=await page.evaluate(()=>{
     for(let j=0;j<3;j++){for(const h of heroes){h.hp=h.maxHp;h.x=80;h.y=260;}update(16);}
     const calls=[],draw=ctx.drawImage;ctx.drawImage=function(...a){for(const key of ['mp_bloom_attack','mp_bloom_idle'])if(a[0]===MIC_MP[key])calls.push({key,sx:a[1]});return draw.apply(this,a)};
     try{render()}finally{ctx.drawImage=draw}
     return {time:runElapsedMs,wind:!!window.motherProbe.bossWind,calls,hits:window.bloomHits.slice(),phase:micS.mo.ph,network:micS.mo.net?{...micS.mo.net}:null,links:micNetLinks().map(n=>({hp:n.hp,alive:n.alive})),freeze:{timer:axiomFreezeTimer,caster:axiomFreezeCaster&&axiomFreezeCaster.classKey,flash:axiomForceQuitFlash},heroes:heroes.map(h=>({classKey:h.classKey,isRemote:!!h.isRemote,alive:h.alive})),entity:{hp:motherProbe.hp,alive:motherProbe.alive,stun:motherProbe.stunTimer,pack:motherProbe.packSet,timer:motherProbe.packTimer,exposure:motherProbe._expT,mcd:motherProbe.mcd},pose:_micMotherFrame(motherProbe,micS.mo,runElapsedMs),pilot:_micMotherPilotPose(motherProbe,micS.mo,runElapsedMs,_micMotherFrame(motherProbe,micS.mo,runElapsedMs))};
    });rows.push(row);
    if(!captured&&row.calls.some(c=>c.key==='mp_bloom_attack'&&c.sx===656)){await page.screenshot({path:path.join(OUT,viewport.width+'-bloom-'+actionName+'-impact.png')});captured=true;}
    await page.waitForTimeout(48);
   }
   await page.evaluate(()=>{bossHitHero=window.bloomHitOriginal;});
   fs.writeFileSync(path.join(OUT,viewport.width+'-bloom-'+actionName+'-diagnostic.json'),JSON.stringify({rows,status:'PRE_ASSERT_DIAGNOSTIC_NOT_PASS'},null,2));
   await page.screenshot({path:path.join(OUT,viewport.width+'-bloom-'+actionName+'-end-diagnostic.png')});
   assert(rows.every(r=>r.phase===2));
   assert.deepEqual([...new Set(rows.flatMap(r=>r.calls.filter(c=>c.key==='mp_bloom_attack').map(c=>c.sx)))].sort((a,b)=>a-b),[0,656,1312]);
   const impact=rows.find(r=>r.calls.some(c=>c.key==='mp_bloom_attack'&&c.sx===656)),hits=rows.at(-1).hits;
   assert(hits.length>0,actionName+' actual damage callback');assert(hits.some(t=>Math.abs(t-impact.time)<=96),actionName+' impact synchronized');
   assert(rows.filter(r=>r.wind).every(r=>r.calls.every(c=>c.key!=='mp_bloom_attack'||c.sx===0)),'no impact during warning');
   assert(rows.at(-1).calls.some(c=>c.key==='mp_bloom_idle'),'returns to evolved idle');
   fs.writeFileSync(path.join(OUT,viewport.width+'-bloom-'+actionName+'-timing.json'),JSON.stringify({rows,hits,status:'PHASE2_PHYSICAL_ATTACK_PILOT_NOT_RELEASE',fixture:'Passive remote ally targets; actual host enemy AI/damage. Random allied crowd-control coverage is a separate encounter gate.'},null,2));
  }
  for(const phase of [1,2]){
   await page.evaluate(phase=>{
    const e=window.motherProbe;Object.assign(micS.mo,{st:'fight',ph:phase,tr:null,bloom:phase===2?1:0,heart:0,net:null});bossHudPhase(phase-1,3);
    Object.assign(e,{hp:e.maxHp*(phase===1?1:0.55),packSet:null,packTimer:0,bossWind:null,stunTimer:0,mcd:0,whipCd:1e9,clawCd:1e9,rootsCd:1e9,sporeCd:0,summonCd:1e9,cloudCd:1e9,halCd:1e9});
    window.sporeEmissions=[];window.sporeOriginal=_enemyShot;_enemyShot=function(...a){if(a[0]===window.motherProbe)window.sporeEmissions.push(runElapsedMs);return window.sporeOriginal.apply(this,a)};
   },phase);
   const rows=[];let captured=false;
   for(let i=0;i<48;i++){
    const row=await page.evaluate(()=>{
     for(let j=0;j<2;j++){for(const h of heroes){h.hp=h.maxHp;h.x=80;h.y=260;}update(16);}
     const calls=[],draw=ctx.drawImage;ctx.drawImage=function(...a){for(const key of ['mp_pilot_cast','mp_bloom_cast','mp_pilot','mp_bloom_idle'])if(a[0]===MIC_MP[key])calls.push({key,sx:a[1]});return draw.apply(this,a)};
     try{render()}finally{ctx.drawImage=draw}return {time:runElapsedMs,calls,emissions:window.sporeEmissions.slice(),wind:!!window.motherProbe.bossWind};
    });rows.push(row);
    if(!captured&&row.calls.some(c=>c.key.endsWith('cast')&&c.sx===0)){await page.screenshot({path:path.join(OUT,viewport.width+'-phase'+phase+'-spore-release.png')});captured=true;}
    await page.waitForTimeout(32);
   }
   await page.evaluate(()=>{_enemyShot=window.sporeOriginal;});
   const key=phase===1?'mp_pilot_cast':'mp_bloom_cast',release=rows.find(r=>r.calls.some(c=>c.key===key&&c.sx===0));
   assert.equal(rows.at(-1).emissions.length,phase===1?5:6,'original configured projectile count');
   assert(rows[0].emissions.length>0,'spores emit on first AI step without invented windup');
   assert(Math.abs(release.time-rows[0].emissions[0])<=32,'release pose accompanies immediate projectiles');
   assert(rows.every(r=>!r.wind));
   assert.deepEqual([...new Set(rows.flatMap(r=>r.calls.filter(c=>c.key===key).map(c=>c.sx)))].sort((a,b)=>a-b),[0,656]);
   assert(rows.at(-1).calls.some(c=>c.key===(phase===1?'mp_pilot':'mp_bloom_idle')),'returns to matching form idle');
   fs.writeFileSync(path.join(OUT,viewport.width+'-phase'+phase+'-spore-timing.json'),JSON.stringify({rows,status:'IMMEDIATE_PROJECTILE_CAST_PILOT_NOT_RELEASE'},null,2));
  }
  const warningRouting=await page.evaluate(()=>{
   const result=[];
   for(const ph of [1,2])for(const kind of (ph===1?['roots','summon']:['roots','summon','clouds'])){
    const e=window.motherProbe;Object.assign(micS.mo,{st:'fight',ph,tr:null,bloom:ph===2?1:0,heart:0,net:null});
    Object.assign(e,{hp:e.maxHp*(ph===1?1:0.55),mcd:1e9,stunTimer:0,bossWind:null,packSet:null,packTimer:0});
    const before=projectiles.length,delays=[],later=runLater;runLater=function(ms,fn){delays.push(ms);return later(ms,fn)};
    try{if(kind==='roots')micMotherRoots(e,2);else if(kind==='summon')micMotherSummon(e,2);else micMotherClouds(e)}finally{runLater=later}
    const pose=_micMotherPilotPose(e,micS.mo,runElapsedMs,_micMotherFrame(e,micS.mo,runElapsedMs));
    result.push({ph,kind,key:pose.key,frame:pose.frame,pack:e.packSet,duration:e.packDur,projectileDelta:projectiles.length-before,delays});
   }
   return result;
  });
  for(const r of warningRouting){assert.equal(r.key,r.ph===1?'mp_pilot_cast':'mp_bloom_cast');assert.equal(r.frame,0);assert.equal(r.projectileDelta,0);if(r.kind==='summon')assert.deepEqual(r.delays,[700,700]);if(r.kind==='clouds')assert(r.delays.every(t=>t===900));if(r.kind==='roots')assert.deepEqual(r.delays,[1150,1220]);}
  fs.writeFileSync(path.join(OUT,viewport.width+'-warning-pack-routing.json'),JSON.stringify({warningRouting,status:'ROUTING_AND_ORIGINAL_DELAY_CHECK_NOT_FULL_SPELL_VISUAL_APPROVAL'},null,2));
  const heartGeometry=await page.evaluate(()=>{
   const e=window.motherProbe;Object.assign(micS.mo,{st:'fight',ph:2,tr:null,bloom:1,heart:0,net:null});
   Object.assign(e,{hp:e.maxHp*0.29,packSet:null,packTimer:0,bossWind:null,stunTimer:0,mcd:1e9});
   let waited=0;while(!micS.mo.heart&&waited<12000){for(const h of heroes){h.hp=h.maxHp;h.x=80;h.y=260;}e.mcd=1e9;update(16);waited+=16;}
   if(!micS.mo.heart)throw Error('actual phase3 opening did not complete');
   Object.assign(e,{packSet:null,packTimer:0,bossWind:null,hitFlash:0});
   for(let i=0;i<160;i++){updateArenaCameraZoom();updateCamLift();}
   const before=JSON.stringify({x:e.x,y:e.y,radius:e.radius,hp:e.hp,vuln:e.dmgTakenMult}),calls=[],draw=ctx.drawImage;
   ctx.drawImage=function(...a){if(a[0]===MIC_MP.mp_heart_key)calls.push({sx:a[1],rect:a.slice(5)});return draw.apply(this,a)};
   try{render()}finally{ctx.drawImage=draw}
   return {waited,phase:micS.mo.ph,heart:micS.mo.heart,vulnerability:e.dmgTakenMult,calls,before,after:JSON.stringify({x:e.x,y:e.y,radius:e.radius,hp:e.hp,vuln:e.dmgTakenMult})};
  });
  assert.equal(heartGeometry.phase,3);assert(heartGeometry.heart);assert.equal(heartGeometry.vulnerability,1.35);assert.equal(heartGeometry.calls.length,1);assert.equal(heartGeometry.before,heartGeometry.after);
  await page.screenshot({path:path.join(OUT,viewport.width+'-heart-open-keypose.png')});await page.waitForTimeout(1200);
  fs.writeFileSync(path.join(OUT,viewport.width+'-heart-keypose-geometry.json'),JSON.stringify({heartGeometry,status:'ACTUAL_PHASE3_STATIC_KEYPOSE_GATE_NOT_ANIMATION_APPROVAL'},null,2));
  const video=page.video();await page.close();fs.renameSync(await video.path(),path.join(OUT,viewport.width+'-phase1-pilot.webm'));
  fs.writeFileSync(path.join(OUT,viewport.width+'-result.json'),JSON.stringify({seen,errors,status:'PILOT_RENDER_PASS_NOT_VISUAL_APPROVAL'},null,2));
 }
 console.log('PASS high-detail pilot routes three distinct source cells through real game renderer');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();if(server)server.kill()});
