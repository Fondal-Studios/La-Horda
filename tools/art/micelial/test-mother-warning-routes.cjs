'use strict';
// Isolated actual-AI spell routing, not randomized-party or full encounter approval.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),{chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'../../..'),OUT='/tmp/mother-browser/warning-routes';fs.mkdirSync(OUT,{recursive:true});let browser,server;
const cases=[];for(const phase of [1,2,3])for(const route of phase===1?['roots','summon']:['roots','summon','cloud','hal'])for(const open of phase===3?[true]:[false,true])cases.push({phase,route,open});
(async()=>{
 server=spawn('python3',['-m','http.server','8853','--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});await new Promise(r=>setTimeout(r,500));browser=await chromium.launch({args:['--no-sandbox']});
 for(const viewport of [{width:1280,height:720},{width:844,height:390}]){
  const page=await browser.newPage({viewport,recordVideo:{dir:OUT,size:viewport}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  await page.goto('http://127.0.0.1:8853/?motherArtPilot=1&motherBloomKey=1&motherHeartKey=1&motherCoreLayer=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof startRun==='function'&&_micMotherAtlasReady()&&['mp_pilot','mp_pilot_cast','mp_bloom_idle','mp_bloom_cast','mp_heart_key'].every(k=>MIC_MP_OK[k]),null,{polling:100,timeout:120000});
  for(const testCase of cases){
   const label=`${viewport.width}-phase${testCase.phase}-${testCase.route}-${testCase.open?'open':'closed'}`;
   const fixture=await page.evaluate(({phase,route,open})=>{
    selectedClass='tanque';currentArena='micelial';lobbyAllies=[];netMatch=null;startRun(10);setState('playing');micMotherRevealStart();for(const h of allies)h.isRemote=true;
    // Fresh fixture only: clear startup scheduling/presentation before new hazards.
    clearRunTimers();arenaTitleCardHide();vfxResetRun();resetFeedback();bossHudHint(null);HUDTXT.q=[];HUDTXT.cur=null;HUDTXT.until=0;_bossIntroT=0;_bossIntroDelay=0;
    for(const id of ['center-banner','boss-intro']){const el=document.getElementById(id);if(el){el.classList.remove('show');el.classList.add('hidden');}}
    const e=micMotherEntity();window.warningBoss=e;boss=e;bossActive=true;activeChampion=null;
    Object.assign(e,{alive:true,micDormant:0,hp:e.maxHp*(phase===1?1:phase===2?.55:.2),dmgTakenMult:phase===3?1.35:1,packSet:null,packTimer:0,bossWind:null,stunTimer:0,mcd:1e9,whipCd:1e9,clawCd:1e9,rootsCd:1e9,sporeCd:1e9,summonCd:1e9,cloudCd:1e9,halCd:1e9});
    micS.mo={st:'fight',ph:phase,t:0,dark:0,bloom:phase>=2?1:0,heart:phase===3?1:0,inf:0,beat:900,bloomAt:runElapsedMs};bossHudPhase(phase-1,3);spawnTimer=1e9;_micBlend=1;
    for(const h of heroes){h.hp=h.maxHp;h.x=80;h.y=260;}micNetRule(0);
    if(open&&phase!==3){for(const n of micNetLinks().slice())killEnemy(n);micNetRule(0);for(let i=0;i<180;i++){for(const h of heroes){h.hp=h.maxHp;h.x=80;h.y=260;}update(16);}}
    for(let i=0;i<160;i++){updateArenaCameraZoom();updateCamLift();}
    window.warningEvents=[];window.warningOriginal={};
    const wrap=(name,fn)=>{warningOriginal[name]=window[name];window[name]=fn;};
    const routeName={roots:'micMotherRoots',summon:'micMotherSummon',cloud:'micMotherClouds',hal:'micMotherHallucinate'}[route];
    wrap(routeName,function(...a){warningEvents.push({kind:'route',name:routeName,time:runElapsedMs});const result=warningOriginal[routeName].apply(this,a);if(route==='hal')warningEvents.push({kind:'hallucinations',time:runElapsedMs,count:micS.hal.length});return result;});
    wrap('bossStrike',function(...a){if(a[5]==='root')warningEvents.push({kind:'root-warning',time:runElapsedMs,delay:a[3],radius:a[2]});return warningOriginal.bossStrike.apply(this,a);});
    wrap('micSpawnAt',function(...a){if(['infectado','sabueso','acechador','peregrino','hinchado'].includes(a[0]))warningEvents.push({kind:'spawn',type:a[0],time:runElapsedMs});return warningOriginal.micSpawnAt.apply(this,a);});
    wrap('micAddCloud',function(...a){warningEvents.push({kind:'cloud',time:runElapsedMs,type:a[2]});return warningOriginal.micAddCloud.apply(this,a);});
    wrap('vfxTelegraph',function(...a){warningEvents.push({kind:'telegraph',time:runElapsedMs,duration:a[0].dur,radius:a[0].r});return warningOriginal.vfxTelegraph.apply(this,a);});
    wrap('vfxSprite',function(...a){if(a[0]==='mic_m_summon_a')warningEvents.push({kind:'summon-warning',time:runElapsedMs});return warningOriginal.vfxSprite.apply(this,a);});
    window.warningStrikeHook=s=>{if(s.kind==='root')warningEvents.push({kind:'root-resolve',time:runElapsedMs,delay:s.delay});};BOSS_STRIKE_HOOKS.push(warningStrikeHook);
    e.mcd=0;e[route+'Cd']=0;window.warningStart=runElapsedMs;
    return {phase,route,open,network:micS.mo.net.st,exposure:e._expT||0,expectedCount:route==='roots'?MIC_CFG.madre.rootsN[phase-1]:route==='summon'?MIC_CFG.madre.summonN[phase-1]:route==='cloud'?MIC_CFG.madre.cloudN:MIC_CFG.madre.halN,rootsDelay:MIC_CFG.madre.rootsDelay};
   },testCase);
   const rows=[];let captured=false;
   for(let i=0;i<64;i++){
    const row=await page.evaluate(()=>{
     for(let j=0;j<2;j++){for(const h of heroes){h.hp=h.maxHp;h.x=80;h.y=260;}update(16);}
     const e=warningBoss,M=micS.mo,p=_micMotherPilotPose(e,M,runElapsedMs,_micMotherFrame(e,M,runElapsedMs)),composite=p&&p.coreLayer?_micMotherCoreComposite(p):null,calls=[],draw=ctx.drawImage;
     ctx.drawImage=function(...a){if(composite&&a[0]===composite)calls.push({key:p.key,frame:p.frame,composite:true});else for(const key of ['mp_pilot','mp_pilot_cast','mp_bloom_idle','mp_bloom_cast','mp_atlas','mp_pilot_attack','mp_bloom_attack'])if(a[0]===MIC_MP[key])calls.push({key,frame:p&&p.key===key?p.frame:null,composite:false});return draw.apply(this,a)};
     try{render()}finally{ctx.drawImage=draw;}
     return {time:runElapsedMs,elapsed:runElapsedMs-warningStart,phase:M.ph,network:M.net.st,exposure:e._expT||0,heart:!!M.heart,pack:e.packSet,pose:p,calls,events:warningEvents.slice(),halCount:micS.hal.length,cloudCount:micS.clouds.length};
    });rows.push(row);
    if(!captured&&row.calls.some(c=>c.key.endsWith('_cast')&&c.frame===0)){await page.screenshot({path:path.join(OUT,label+'-warning.png')});captured=true;}
    if(i===45)await page.screenshot({path:path.join(OUT,label+'-effect.png')});await page.waitForTimeout(32);
   }
   await page.evaluate(()=>{for(const [name,fn]of Object.entries(warningOriginal))window[name]=fn;const i=BOSS_STRIKE_HOOKS.indexOf(warningStrikeHook);if(i>=0)BOSS_STRIKE_HOOKS.splice(i,1);});
   fs.writeFileSync(path.join(OUT,label+'-diagnostic.json'),JSON.stringify({fixture,rows,errors,scope:'Real AI cooldown selection; passive damageable allies; actual timed effects remain enabled. Not randomized-party gameplay or visual release approval.'},null,2));
   const events=rows.at(-1).events,routes=events.filter(e=>e.kind==='route');assert.equal(routes.length,1,'selected AI spell fires exactly once');assert(captured,'warning body rendered');
   const castKey=testCase.phase===1?'mp_pilot_cast':'mp_bloom_cast',idleKey=testCase.phase===1?'mp_pilot':'mp_bloom_idle';
   assert(rows.every(r=>r.phase===testCase.phase));assert(rows.every(r=>!r.calls.some(c=>c.key==='mp_atlas'||c.key.endsWith('_attack'))),'no legacy fallback or physical-strike pose');
   assert.deepEqual([...new Set(rows.flatMap(r=>r.calls.filter(c=>c.key===castKey).map(c=>c.frame)))].sort(),[0,1],'release and recovery body poses');
   assert(rows.at(-1).calls.some(c=>c.key===idleKey),'returns phase-correct idle');
   if(testCase.open)assert(rows.filter(r=>r.calls.some(c=>c.key===castKey)).every(r=>r.calls.filter(c=>c.key===castKey).every(c=>c.composite)),'exposed spell preserves core cavity');
   const start=routes[0].time;
   if(testCase.route==='roots'){
    const warnings=events.filter(e=>e.kind==='root-warning'),effects=events.filter(e=>e.kind==='root-resolve');assert.equal(warnings.length,fixture.expectedCount);assert.equal(effects.length,fixture.expectedCount);
    assert.deepEqual(warnings.map(e=>e.delay),Array.from({length:fixture.expectedCount},(_,i)=>fixture.rootsDelay+i*70));
    for(let i=0;i<effects.length;i++){const lag=effects[i].time-start;assert(lag>=warnings[i].delay&&lag<warnings[i].delay+16,'root delay unchanged, never early');}
   }else if(testCase.route==='summon'){
    assert.equal(events.filter(e=>e.kind==='summon-warning').length,fixture.expectedCount);const spawns=events.filter(e=>e.kind==='spawn');assert.equal(spawns.length,fixture.expectedCount);assert(spawns.every(e=>e.time-start>=700&&e.time-start<716),'summon after700ms warning');
   }else if(testCase.route==='cloud'){
    const clouds=events.filter(e=>e.kind==='cloud');assert.equal(clouds.length,fixture.expectedCount);assert.equal(events.filter(e=>e.kind==='telegraph'&&e.duration===900).length,fixture.expectedCount);assert(clouds.every(e=>e.time-start>=900&&e.time-start<916),'cloud after900ms warning');
   }else {const hal=events.find(e=>e.kind==='hallucinations');assert(hal&&hal.count===fixture.expectedCount&&hal.time===start,'hallucinations immediate cosmetic spawn, no invented windup');}
   assert.deepEqual(errors,[]);
  }
  await page.close();
 }
 console.log('WARNING_ROUTES_ACTUAL_AI_PASS_NOT_VISUAL_RELEASE');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(server)server.kill();});
