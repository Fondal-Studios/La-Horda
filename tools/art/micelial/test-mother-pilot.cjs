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
  await page.goto('http://127.0.0.1:8849/?motherArtPilot=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof startRun==='function'&&_micMotherAtlasReady()&&MIC_MP_OK.mp_pilot,null,{polling:100,timeout:120000});
  await page.evaluate(()=>{
   selectedClass='tanque';currentArena='micelial';lobbyAllies=[];netMatch=null;startRun(10);setState('playing');micMotherRevealStart();
   const e=micMotherEntity();window.motherProbe=e;micS.mo.st='fight';micS.mo.ph=1;e.micDormant=0;e.dmgTakenMult=1;player.maxHp=player.hp=1e6;
   for(let i=0;i<800;i++){player.hp=player.maxHp;update(16);}
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
  const video=page.video();await page.close();fs.renameSync(await video.path(),path.join(OUT,viewport.width+'-idle-pilot.webm'));
  fs.writeFileSync(path.join(OUT,viewport.width+'-result.json'),JSON.stringify({seen,errors,status:'PILOT_RENDER_PASS_NOT_VISUAL_APPROVAL'},null,2));
 }
 console.log('PASS high-detail pilot routes three distinct source cells through real game renderer');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();if(server)server.kill()});
