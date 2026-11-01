'use strict';
// Full-game browser proof; never counts a launch failure as a pass.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'../../..'),PORT=+(process.env.MOTHER_PORT||8847),OUT=path.resolve(process.env.MOTHER_EVIDENCE||'/tmp/mother-browser');
fs.mkdirSync(OUT,{recursive:true});let browser,server,pass=0;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const check=(name,value)=>{assert(value,name);pass++;console.log('PASS',name)};
(async()=>{
 server=spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});await sleep(500);
 browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
 for(const viewport of [{width:1280,height:720},{width:844,height:390},{width:390,height:844}]){
  const page=await browser.newPage({viewport,recordVideo:{dir:OUT,size:viewport}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  await page.goto(`http://127.0.0.1:${PORT}`,{waitUntil:'domcontentloaded'});
  try{
    // The render loop is deliberately frozen; Playwright's default RAF poll
    // cannot run under that harness. Poll the readiness predicate by timer.
    await page.waitForFunction(()=>typeof startRun==='function'&&typeof _micMotherFrame==='function'&&_micMotherAtlasReady(),null,{timeout:120000,polling:100});
  }catch(error){
    const diagnostics=await page.evaluate(()=>({start:typeof startRun,frame:typeof _micMotherFrame,ready:typeof _micMotherAtlasReady==='function'&&_micMotherAtlasReady(),atlas:typeof MIC_MP!=='undefined'&&MIC_MP.mp_atlas?{src:MIC_MP.mp_atlas.src,width:MIC_MP.mp_atlas.width,height:MIC_MP.mp_atlas.height,complete:MIC_MP.mp_atlas.complete}:null}));
    fs.writeFileSync(path.join(OUT,'readiness-failure.json'),JSON.stringify({diagnostics,errors},null,2));throw error;
  }
  const setup=await page.evaluate(()=>{
    selectedClass='tanque';currentArena='micelial';lobbyAllies=[];netMatch=null;startRun(10);setState('playing');
    micMotherRevealStart();const e=micMotherEntity();micS.mo.st='fight';micS.mo.ph=1;micS.mo.t=0;e.micDormant=0;e.dmgTakenMult=1;boss=e;bossActive=true;
    player.x=0;player.y=380;player.maxHp=player.hp=1000000;
    window.motherProbe=e;_micBlend=1;
    // Hold the same camera for A/B. Normal runtime camera fitting is tested separately.
    updateCamLift=()=>{};
    return {ready:_micMotherAtlasReady(),src:MIC_MP.mp_atlas.src,w:MIC_MP.mp_atlas.width,h:MIC_MP.mp_atlas.height};
  });
  check('authored atlas loaded '+viewport.width,setup.ready&&setup.w===1360&&setup.h===417);
  const variants=[
    ['idle',{st:'fight',ph:1,t:0},{},600],
    ['windup',{st:'fight',ph:1,t:0},{packSet:'atk',packDur:1500,packTimer:510,bossWind:{t:990,dur:1000}},990],
    ['impact',{st:'fight',ph:1,t:0},{packSet:'atk',packDur:1500,packTimer:490},1010],
    ['phase2-attack',{st:'fight',ph:2,bloom:1,t:0},{packSet:'atk',packDur:1500,packTimer:490},1010],
    ['phase3-attack',{st:'fight',ph:3,heart:1,t:0},{packSet:'atk',packDur:1500,packTimer:490},1010],
    ['phase2',{st:'fight',ph:2,t:0,tr:{to:2,t:1900}},{},1900],
    ['bloom',{st:'fight',ph:2,t:0,bloom:1},{},380],
    ['open',{st:'fight',ph:3,t:0,tr:{to:3,t:2200}},{},2200],
    ['heart',{st:'fight',ph:3,t:0,heart:1},{},240],
    ['death',{st:'dying',ph:3,t:6700},{},6700]
  ];
  for(const [name,M,E,time]of variants){
   const probe=await page.evaluate(({M,E,time})=>{
     micS.mo={st:'fight',ph:1,t:0,dark:0,bloom:0,heart:0,inf:0,beat:0,...M};
     const e=window.motherProbe;Object.assign(e,{alive:M.st!=='dying'&&M.st!=='dead',packSet:null,packTimer:0,packDur:0,bossWind:null,hitFlash:0,stunTimer:0},E);runElapsedMs=time;CAM_LIFT=micCamLift();
     // Observe the actual draw destination/source. The full renderer must use the sheet,
     // not the old portrait or a test-only preview canvas.
     const calls=[],draw=ctx.drawImage;ctx.drawImage=function(...a){if(a[0]===MIC_MP.mp_atlas)calls.push(a.slice(1));return draw.apply(this,a)};
     try{render();}finally{ctx.drawImage=draw;}
     return {calls,frame:_micMotherFrame(e,micS.mo,runElapsedMs),radius:e.radius,hp:e.hp,damage:e.dmg};
   },{M,E,time});
   check('real renderer uses authored frame '+name+' '+viewport.width,probe.calls.length>0&&probe.calls.every(a=>a.length===8&&a[0]===(probe.frame.frame%8)*170&&a[1]===Math.floor(probe.frame.frame/8)*139));
   await page.screenshot({path:path.join(OUT,viewport.width+'-'+name+'-candidate.png')});
   await page.evaluate(()=>{MIC_MP_OK.mp_atlas=false;render();});
   await page.screenshot({path:path.join(OUT,viewport.width+'-'+name+'-baseline.png')});
   await page.evaluate(()=>{MIC_MP_OK.mp_atlas=true;});
  }
  // Exercise actual AI/timers/VFX in the arena, not just hand-authored snapshots.
  // Recorded video includes attacks in all three phases; heroes are invulnerable
  // only in this test harness, never in production code.
  for(const phase of [1,2,3]){
    await page.evaluate(phase=>{
      const e=window.motherProbe;e.alive=true;e.hp=e.maxHp*(phase===1?1:phase===2?0.5:0.25);
      Object.assign(e,{micDormant:0,packSet:null,packTimer:0,bossWind:null,mcd:0,rootsCd:9e8,sporeCd:9e8,whipCd:0,summonCd:9e8,clawCd:9e8,cloudCd:9e8,halCd:9e8});
      micS.dead=0;micS.mo={st:'fight',ph:phase,t:0,bloom:phase>=2?1:0,heart:phase===3?1:0,beat:900,inf:0};
      player.x=80;player.y=450;player.hp=player.maxHp;boss=e;bossActive=true;
      CAM_LIFT=micCamLift();
    },phase);
    const observed=[];
    for(let f=0;f<32;f++){
      observed.push(await page.evaluate(()=>{
        for(let j=0;j<6;j++){player.hp=player.maxHp;update(16);}
        render();return _micMotherFrame(window.motherProbe,micS.mo,runElapsedMs);
      }));
      await page.waitForTimeout(80);
    }
    check('actual phase '+phase+' animated in arena '+viewport.width,new Set(observed.map(p=>p.frame)).size>=2);
    fs.writeFileSync(path.join(OUT,viewport.width+'-phase'+phase+'-frames.json'),JSON.stringify(observed,null,2));
  }
  const tests=await page.evaluate(()=>{
    const e=window.motherProbe;
    micS.mo={st:'fight',ph:3,t:0,heart:1,beat:900,inf:0};
    Object.assign(e,{packSet:'atk',packTimer:600,packDur:1500,bossWind:null,mcd:1000,stunTimer:0});
    const original={hp:e.hp,dmg:e.dmg,radius:e.radius,x:e.x,y:e.y};
    micAIMadre(e,16,player,500);
    const kept=e.packSet==='atk';
    // Actual combat creates entity↔target cycles. Snapshot every own field
    // by identity/value instead of JSON-stringifying that object graph.
    const before=new Map(Object.entries(e));for(let i=0;i<20;i++)_micDrawMother(e,runElapsedMs/1000);
    const clean=Object.keys(e).length===before.size&&Object.entries(e).every(([k,v])=>Object.is(v,before.get(k)));
    const serial=_netDeltaOf({},e,true),M=netSer(micS.mo,1);
    const host=_micMotherFrame(e,micS.mo,runElapsedMs),guest=_micMotherFrame(serial,M,runElapsedMs);
    micS.mo={st:'dead',t:0};let count=0;const draw=ctx.drawImage;ctx.drawImage=function(...args){if(args[0]===MIC_MP.mp_atlas)count++;return draw.apply(this,args)};
    try{_micDrawMotherDying(20)}finally{ctx.drawImage=draw}
    return {kept,clean,serialEqual:JSON.stringify(host)===JSON.stringify(guest),deadDraws:count,unchanged:e.hp===original.hp&&e.dmg===original.dmg&&e.radius===original.radius&&e.x===original.x&&e.y===original.y};
  });
  for(const k of ['kept','clean','serialEqual','unchanged'])check(k+' '+viewport.width,tests[k]);
  check('death removes sprite '+viewport.width,tests.deadDraws===0);
  check('no page errors '+viewport.width,errors.length===0);
  fs.writeFileSync(path.join(OUT,viewport.width+'-result.json'),JSON.stringify({setup,tests,errors},null,2));
  const video=page.video();await page.close();
  if(video)fs.renameSync(await video.path(),path.join(OUT,viewport.width+'-gameplay.webm'));
 }
 fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({status:'PASS',pass,scope:'full game renderer + state + actual snapshot serialization; no physical mobile or live relay certification'},null,2));
 console.log(JSON.stringify({pass,status:'PASS'}));
})().catch(e=>{console.error(e);fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({status:'FAIL_OR_BLOCKED',pass,error:e.message},null,2));process.exitCode=1}).finally(async()=>{if(browser)await browser.close();if(server)server.kill()});
