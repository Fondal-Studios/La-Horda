'use strict';
// Scripted visual encounter with REAL allied/enemy AI, NOT a natural win or balance test.
// Only fixture HP sustain/threshold adjustments and an explicit node cut advance stages.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),{chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'../../..'),OUT='/tmp/mother-browser/full-encounter';fs.mkdirSync(OUT,{recursive:true});let browser,server;
(async()=>{
 server=spawn('python3',['-m','http.server','8855','--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});await new Promise(r=>setTimeout(r,500));browser=await chromium.launch({args:['--no-sandbox']});
 for(const viewport of [{width:1280,height:720},{width:844,height:390}]){
  const page=await browser.newPage({viewport,recordVideo:{dir:OUT,size:viewport}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;let seed=0x4d414452;Math.random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};});
  await page.goto('http://127.0.0.1:8855/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof startRun==='function'&&_micMotherAtlasReady(),null,{polling:100,timeout:120000});
  assert(await page.evaluate(()=>MIC_MOTHER_REWORK_DEFAULT&&MIC_MOTHER_PILOT_ON&&MIC_MOTHER_BLOOM_KEY_ON&&MIC_MOTHER_CORE_LAYER_ON&&MIC_MOTHER_REVEAL_PILOT_ON&&MIC_MOTHER_DEATH_PILOT_ON),'ordinary URL enables complete rework');
  const fixture=await page.evaluate(()=>{
   selectedClass='tanque';lobbyAllies=['guerrero','mago','soporte'];currentArena='micelial';netMatch=null;
   if(!lobbyAlliesValid(selectedClass))throw Error('canonical party invalid');startRun(10);setState('playing');
   player.x=80;player.y=260; // Initial camera/target position, never overridden while AI runs.
   window.encounterAdjustments=[];window.encounterRadius=null;window.encounterVictory=[];window.encounterRewards=[];
   window.encounterOriginalVictory=finishBossVictory;window.encounterOriginalRewards=buildVictoryData;
   finishBossVictory=function(...a){encounterVictory.push({time:runElapsedMs,st:micS.mo.st});return encounterOriginalVictory.apply(this,a)};
   buildVictoryData=function(...a){encounterRewards.push(runElapsedMs);return encounterOriginalRewards.apply(this,a)};
   window.encounterGoal=1;
   window.encounterStep=n=>{
    for(let i=0;i<n;i++){
     for(const h of heroes){if(h.hp<h.maxHp||!h.alive){encounterAdjustments.push({kind:'hero-sustain',time:runElapsedMs,classKey:h.classKey,hp:h.hp,revived:!h.alive});h.hp=h.maxHp;h.alive=true;}}
     const e=micMotherEntity(),M=micS.mo;if(e&&encounterRadius===null)encounterRadius=e.radius;
     if(e&&M.st==='fight'&&M.ph===encounterGoal){const floor=e.maxHp*(M.ph===1?.70:M.ph===2?.40:.25);if(e.hp<floor){encounterAdjustments.push({kind:'boss-phase-hold',time:runElapsedMs,phase:M.ph,hp:e.hp,to:floor});e.hp=floor;}}
     update(16);
    }
    const M=micS.mo,e=micMotherEntity(),p=_micMotherPilotPose(e,M,runElapsedMs,_micMotherFrame(e,M,runElapsedMs)),composite=p&&p.coreLayer?_micMotherCoreComposite(p):null,calls=[];
    const draw=ctx.drawImage;ctx.drawImage=function(...a){if(composite&&a[0]===composite)calls.push({key:p.key,frame:p.frame,core:true});else for(const key of ['mp_pilot','mp_pilot_attack','mp_pilot_cast','mp_bloom_trans','mp_bloom_key','mp_bloom_idle','mp_bloom_attack','mp_bloom_cast','mp_heart_key','mp_death','mp_atlas','mp_full'])if(a[0]===MIC_MP[key])calls.push({key,sx:a[1],frame:p&&p.key===key?p.frame:null,core:false});return draw.apply(this,a)};
    try{render()}finally{ctx.drawImage=draw;}
    return {time:runElapsedMs,state:state,mother:{...M},pose:p,calls,radius:e?e.radius:null,baselineRadius:encounterRadius,entity:e?{hp:e.hp,maxHp:e.maxHp,stun:e.stunTimer,pack:e.packSet,wind:!!e.bossWind}:null,heroes:heroes.map(h=>({classKey:h.classKey,x:h.x,y:h.y,isRemote:!!h.isRemote,alive:h.alive,stun:h.stunTimer})),camera:{zoom:CAM_ZOOM,lift:CAM_LIFT},victory:encounterVictory.slice(),rewards:encounterRewards.slice()};
   };
   return {seed:'0x4d414452',party:heroes.map(h=>h.classKey),allyRemote:allies.map(h=>!!h.isRemote),scope:'Scripted HP-assisted visual encounter; real allied/enemy AI, camera, crowd-control and VFX. Not natural victory, multiplayer or balance proof.'};
  });
  await page.waitForFunction(()=>typeof startRun==='function'&&_micMotherAtlasReady()&&['mp_pilot','mp_pilot_attack','mp_pilot_cast','mp_bloom_trans','mp_bloom_key','mp_bloom_idle','mp_bloom_attack','mp_bloom_cast','mp_heart_key','mp_death'].every(k=>MIC_MP_OK[k]),null,{polling:100,timeout:120000});
  const rows=[],stages=[];
  const advance=async(label,{until,duration,max=20000,steps=4})=>{
   const started=rows.length?rows.at(-1).time:0;let done=false;
   while(!done){
    const row=await page.evaluate(n=>encounterStep(n),steps);row.stage=label;rows.push(row);
    done=until?until(row):row.time-started>=duration;
    if(row.time-started>max)throw Error(`${label} controller deadline: ${JSON.stringify(row.mother)}`);
    if(done){await page.screenshot({path:path.join(OUT,`${viewport.width}-${label}.png`)});stages.push({label,time:row.time});}
    await page.waitForTimeout(label==='entrance-stir'?16:steps*16);
   }
  };
  try{
   await advance('entrance-stir',{until:r=>r.mother.st==='reveal',max:17500,steps:8});
   await advance('entrance-reveal',{until:r=>r.mother.st==='fight',max:9500,steps:2});
   await advance('phase1-combat',{duration:8000,steps:4});
   const cut=await page.evaluate(()=>{const nodes=micNetLinks().slice();for(const n of nodes)killEnemy(n);micNetRule(0);encounterAdjustments.push({kind:'explicit-network-cut',time:runElapsedMs,nodes:nodes.length,state:micS.mo.net.st});return {nodes:nodes.length,state:micS.mo.net.st};});
   if(cut.state==='rebuild')await advance('wait-network-rebuild',{until:r=>r.mother.net.st==='net',max:6000});
   if(cut.state==='rebuild')await page.evaluate(()=>{const nodes=micNetLinks().slice();for(const n of nodes)killEnemy(n);micNetRule(0);encounterAdjustments.push({kind:'explicit-network-recut',time:runElapsedMs,nodes:nodes.length});});
   await advance('phase1-exposed-combat',{duration:4000});
   await page.evaluate(()=>{encounterGoal=2;const e=micMotherEntity();encounterAdjustments.push({kind:'phase2-threshold',time:runElapsedMs,hp:e.hp,to:e.maxHp*.59});e.hp=e.maxHp*.59;});
   await advance('phase2-transition',{until:r=>r.mother.ph===2&&!r.mother.tr&&r.mother.bloom,max:12000,steps:2});
   await advance('phase2-combat',{duration:10000});
   await page.evaluate(()=>{encounterGoal=3;const e=micMotherEntity();encounterAdjustments.push({kind:'phase3-threshold',time:runElapsedMs,hp:e.hp,to:e.maxHp*.29});e.hp=e.maxHp*.29;});
   await advance('phase3-transition',{until:r=>r.mother.ph===3&&!r.mother.tr&&r.mother.heart,max:12000,steps:2});
   await advance('phase3-combat',{duration:10000});
   await page.evaluate(()=>{const e=micMotherEntity();encounterAdjustments.push({kind:'explicit-final-killEnemy',time:runElapsedMs,hp:e.hp});killEnemy(e);});
   await advance('death-complete',{until:r=>r.mother.st==='dead',max:11000,steps:2});
  }finally{
   const adjustments=await page.evaluate(()=>encounterAdjustments);
   fs.writeFileSync(path.join(OUT,viewport.width+'-diagnostic.json'),JSON.stringify({fixture,stages,rows,adjustments,errors},null,2));
  }
  assert.deepEqual(errors,[]);assert(fixture.allyRemote.every(v=>!v),'allied AI remains enabled');assert.deepEqual(fixture.party,['tanque','guerrero','mago','soporte']);
  assert(rows.every(r=>!r.calls.some(c=>c.key==='mp_atlas'||c.key==='mp_full')),'no legacy body fallback with reviewed assets ready');
  assert(rows.filter(r=>r.radius!==null).every(r=>r.radius===r.baselineRadius),'boss collision radius unchanged');
  for(const r of rows.filter(r=>r.mother.st==='fight'&&!r.mother.tr))for(const c of r.calls){
   if(r.mother.ph===1)assert(c.key.startsWith('mp_pilot'),'phase1 remains cyan body');
   else assert(c.key.startsWith('mp_bloom'),'evolved body remains warm');
   if(r.mother.heart)assert(c.core,'permanent core never hidden by active attack');
  }
  const ending=rows.at(-1);assert.equal(ending.victory.length,1);assert.equal(ending.rewards.length,1);
  assert(rows.some(r=>r.mother.ph===1&&r.calls.some(c=>c.core)),'actual phase1 exposed body observed');
  for(const key of ['mp_pilot','mp_bloom_trans','mp_bloom_idle','mp_death'])assert(rows.some(r=>r.calls.some(c=>c.key===key)),key+' observed in encounter');
  const coverage=[...new Set(rows.flatMap(r=>r.calls.map(c=>c.key)))];
  fs.writeFileSync(path.join(OUT,viewport.width+'-result.json'),JSON.stringify({status:'SCRIPTED_FULL_ENCOUNTER_VISUAL_SMOKE_NOT_BALANCE_APPROVAL',coverage,unobservedActions:['mp_pilot_attack','mp_pilot_cast','mp_bloom_attack','mp_bloom_cast'].filter(k=>!coverage.includes(k)),note:'Legitimate allied CC is retained. Missing random action coverage is reported, not forced or falsely claimed; isolated route tests cover timing.'},null,2));
  await page.close();
 }
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(server)server.kill();});
