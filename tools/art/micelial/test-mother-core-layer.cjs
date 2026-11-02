'use strict';
// Opt-in compositing/domain/actual-AI evidence. Passing is NOT visual release approval.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'../../..'),OUT='/tmp/mother-browser/core-layer';
fs.mkdirSync(OUT,{recursive:true});let browser,server;
(async()=>{
 server=spawn('python3',['-m','http.server','8850','--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});
 await new Promise(r=>setTimeout(r,500));browser=await chromium.launch({args:['--no-sandbox']});
 for(const viewport of [{width:1280,height:720},{width:844,height:390}]){
  const page=await browser.newPage({viewport,recordVideo:{dir:OUT,size:viewport}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  await page.goto('http://127.0.0.1:8850/?motherArtPilot=1&motherBloomKey=1&motherHeartKey=1&motherCoreLayer=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof startRun==='function'&&_micMotherAtlasReady()&&MIC_MP_OK.mp_heart_key&&Object.keys(MIC_MOTHER_CORE_BINDINGS).every(k=>MIC_MP_OK[k]),null,{polling:100,timeout:120000});
  const pixels=await page.evaluate(()=>{
   const check=(ok,msg)=>{if(!ok)throw Error(msg)},rows=[];
   const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
   const clone=im=>{const c=canvas(im.width,im.height);c.getContext('2d').drawImage(im,0,0);return c};
   for(const [key,b]of Object.entries(MIC_MOTHER_CORE_BINDINGS))for(let frame=0;frame<b.frames.length;frame++){
    const p={key,frame,w:b.w,h:b.h,anchor:b.anchor},out=_micMotherCoreComposite(p);check(!!out,`${key}/${frame} supported`);
    check(out===_micMotherCoreComposite(p),'cache reuse');
    const original=canvas(b.w,b.h),g=original.getContext('2d');g.drawImage(MIC_MP[key],frame*b.w,0,b.w,b.h,0,0,b.w,b.h);
    const a=g.getImageData(0,0,b.w,b.h).data,z=out.getContext('2d').getImageData(0,0,b.w,b.h).data;
    const mask=polys=>{const c=canvas(b.w,b.h),x=c.getContext('2d');for(const poly of polys){x.beginPath();poly.forEach((v,i)=>x[i?'lineTo':'moveTo'](b.w/2+v[0]-328,b.anchor+v[1]-528));x.closePath();x.fill();}return x.getImageData(0,0,b.w,b.h).data};
    const patch=mask([MIC_MOTHER_CORE_POLY]),front=mask(b.frames[frame].foreground);let changed=0,outside=0,foreground=0;
    for(let i=0;i<a.length;i+=4){check(a[i+3]===z[i+3],`${key}/${frame} alpha pixel ${i/4}`);
     const exact=patch[i+3]===0||front[i+3]===255;
     if(patch[i+3]===0)outside++;if(front[i+3]===255)foreground++;
     for(let k=0;k<3;k++){if(exact)check(Math.abs(a[i+k]-z[i+k])<=1,`${key}/${frame} protected RGB pixel ${i/4}`);if(a[i+k]!==z[i+k])changed++;}
    }
    check(changed>0,'cavity changes body pixels');rows.push({key,frame,changed,outside,foreground,alphaExact:true});
   }
   const p={key:'mp_pilot',frame:0,w:432},old=_micMotherCoreComposite(p),heart=MIC_MP.mp_heart_key,base=MIC_MP.mp_pilot;
   MIC_MP.mp_heart_key=clone(heart);check(_micMotherCoreComposite(p)!==old,'heart replacement invalidates');MIC_MP.mp_heart_key=heart;
   const restored=_micMotherCoreComposite(p);MIC_MP.mp_pilot=clone(base);check(_micMotherCoreComposite(p)!==restored,'base replacement invalidates');MIC_MP.mp_pilot=base;
   for(const bad of [{...p,key:'unknown'},{...p,frame:-1},{...p,frame:3},{...p,frame:.5},{...p,w:431}])check(_micMotherCoreComposite(bad)===null,'unsupported rejected');
   return {rows,cacheReplacement:true,unsupportedRejected:true};
  });
  await page.evaluate(()=>{
   selectedClass='tanque';currentArena='micelial';lobbyAllies=[];netMatch=null;startRun(10);setState('playing');micMotherRevealStart();
   const e=micMotherEntity();window.motherProbe=e;boss=e;bossActive=true;activeChampion=null;micS.mo.st='fight';micS.mo.ph=1;e.micDormant=0;e.dmgTakenMult=1;
   for(let i=0;i<800;i++){for(const h of heroes)h.hp=h.maxHp;update(16);}
   window.corePose=()=>_micMotherPilotPose(e,micS.mo,runElapsedMs,_micMotherFrame(e,micS.mo,runElapsedMs));
   window.coreReset=phase=>{
    for(const n of micNetLinks())n.alive=false; // Fixture reset only; exposure below always kills real nodes.
    Object.assign(e,{alive:true,hp:e.maxHp*(phase===1?1:phase===2?.55:.2),micDormant:0,packSet:null,packTimer:0,bossWind:null,stunTimer:0,hitFlash:0,_expT:0,crashVuln:false,dmgTakenMult:phase===3?1.35:1,mcd:0,whipCd:1e9,clawCd:1e9,rootsCd:1e9,sporeCd:1e9,summonCd:1e9,cloudCd:1e9,halCd:1e9});
    micS.mo={st:'fight',ph:phase,t:0,dark:0,bloom:phase>=2?1:0,heart:phase===3?1:0,inf:0,beat:900,bloomAt:runElapsedMs};
    for(const h of heroes){h.hp=h.maxHp;h.x=80;h.y=260;}spawnTimer=1e9;_micBlend=1;micNetRule(0);
   };
   window.coreCut=()=>{const nodes=micNetLinks().slice();if(!nodes.length)throw Error('missing actual linked nodes');for(const n of nodes)killEnemy(n);micNetRule(0);return nodes.length;};
  });
  const domain=await page.evaluate(()=>{
   const check=(ok,msg)=>{if(!ok)throw Error(msg)},rows=[],e=motherProbe;
   for(const phase of [1,2,3])for(const action of ['windup','cast']){
    coreReset(phase);const count=coreCut();check(micS.mo.net.st==='open'&&e._expT===7000,'real cut opens 7000ms');check(e._expMult===1.8&&e._encMult===1,'unchanged exposure multipliers');
    check(Math.abs(bossEncounterDmgMult(e)-1.125)<1e-9,'encounter compensation remains 1.8/1.6');
    Object.assign(e,{stunTimer:0,packSet:action==='windup'?'atk':'cast',packDur:action==='windup'?1500:900,packTimer:action==='windup'?1400:800,bossWind:action==='windup'?{t:1000,d:1000}:null});
    const before=JSON.stringify({M:micS.mo,e:netSer(e,1)}),host=corePose();check(host&&host.coreLayer,'open body composite');check(host.key.startsWith(phase===1?'mp_pilot':'mp_bloom'),'phase body preserved');_micMotherCoreComposite(host);
    check(before===JSON.stringify({M:micS.mo,e:netSer(e,1)}),'selection/cache does not mutate gameplay');
    const M=netSer(micS.mo,1),copy=_netDeltaOf({},e,true),late=_micMotherPilotPose(copy,M,runElapsedMs,_micMotherFrame(copy,M,runElapsedMs));check(JSON.stringify(host)===JSON.stringify(late),'actual serialized latejoin pose');
    const savedState=state,pausedAt=runElapsedMs,pausedExposure=e._expT;state='paused';update(1000);state=savedState;check(runElapsedMs===pausedAt&&e._expT===pausedExposure&&JSON.stringify(host)===JSON.stringify(corePose()),'actual paused update preserves pose and exposure');
    bossEncounterTick(6999);micNetRule(6999);check(e._expT===1&&corePose().coreLayer,'open until exact boundary');
    bossEncounterTick(1);micNetRule(1);check(micS.mo.net.st==='rebuild'&&e._expT===0&&!e.crashVuln,'expiry clears exposure');check(!!corePose().coreLayer===(phase===3),'expiry mid-action closes temporary core only');
    micNetRule(5500);check(micS.mo.net.st==='net'&&micNetLinks().length===MIC_CFG.madre.net.count[phase-1],'real rebuild nodes');check(!!corePose().coreLayer===(phase===3),'permanent heart survives rebuild');
    rows.push({phase,action,count,host,late,expiry:7000,rebuild:5500});
   }return rows;
  });
  const runtime=[];
  for(const phase of [1,2,3]){
   await page.evaluate(phase=>{coreReset(phase);_bossIntroT=0;_bossIntroDelay=0;HUDTXT.q=[];HUDTXT.until=0;for(const id of ['boss-intro','center-banner','arena-title-card']){const el=document.getElementById(id);if(el){el.classList.remove('show');el.classList.add('hidden');}}for(let i=0;i<160;i++){updateArenaCameraZoom();updateCamLift();}render();},phase);
   await page.screenshot({path:path.join(OUT,`${viewport.width}-phase${phase}-closed-network.png`)});
   await page.evaluate(()=>coreCut());
   for(let i=0;i<30;i++){
    const row=await page.evaluate(()=>{for(let j=0;j<6;j++){for(const h of heroes){h.hp=h.maxHp;h.x=80;h.y=260;}update(16);}const p=corePose(),canvas=p&&p.coreLayer?_micMotherCoreComposite(p):null;let drawn=false;const original=ctx.drawImage;ctx.drawImage=function(...a){if(canvas&&a[0]===canvas)drawn=true;return original.apply(this,a)};try{render();}finally{ctx.drawImage=original;}return {time:runElapsedMs,phase:micS.mo.ph,exposure:motherProbe._expT,network:micS.mo.net.st,pose:p,drawn,zoom:CAM_ZOOM};});runtime.push(row);await page.waitForTimeout(35);
   }
   assert(runtime.at(-1).drawn,'actual renderer draws cached composite');assert.equal(runtime.at(-1).network,'open');assert.equal(runtime.at(-1).phase,phase);
   await page.screenshot({path:path.join(OUT,`${viewport.width}-phase${phase}-open-vfx-on.png`)});
  }
  const actions=[];
  for(const phase of [1,2])for(const action of ['whip','spore']){
   await page.evaluate(({phase,action})=>{
    coreReset(phase);coreCut();
    for(let i=0;i<180;i++){for(const h of heroes){h.hp=h.maxHp;h.x=80;h.y=260;}update(16);}
    const e=motherProbe;e.mcd=0;e[action==='whip'?'whipCd':'sporeCd']=0;
    window.coreEvents=[];window.coreOldHit=bossHitHero;window.coreOldShot=_enemyShot;
    bossHitHero=function(...a){if(a[2]&&a[2].from===motherProbe)coreEvents.push({kind:'hit',time:runElapsedMs});return coreOldHit.apply(this,a)};
    _enemyShot=function(...a){if(a[0]===motherProbe)coreEvents.push({kind:'shot',time:runElapsedMs});return coreOldShot.apply(this,a)};
   },{phase,action});
   const rows=[];let captured=false;
   for(let i=0;i<90;i++){
    const row=await page.evaluate(()=>{
     for(let j=0;j<2;j++){for(const h of heroes){h.hp=h.maxHp;h.x=80;h.y=260;}update(16);}
     const p=corePose(),c=p&&p.coreLayer?_micMotherCoreComposite(p):null;let drawn=false;
     const old=ctx.drawImage;ctx.drawImage=function(...a){if(c&&a[0]===c)drawn=true;return old.apply(this,a)};try{render()}finally{ctx.drawImage=old;}
     return {time:runElapsedMs,phase:micS.mo.ph,pose:p,drawn,exposure:motherProbe._expT,events:coreEvents.slice()};
    });rows.push(row);
    const desired=action==='whip'?'attack':'cast';
    if(!captured&&row.drawn&&row.pose.key.endsWith(desired)&&row.pose.frame===(action==='whip'?1:0)){
     await page.screenshot({path:path.join(OUT,`${viewport.width}-phase${phase}-open-${action}.png`)});captured=true;
    }
    await page.waitForTimeout(32);
   }
   await page.evaluate(()=>{bossHitHero=coreOldHit;_enemyShot=coreOldShot;});
   assert(captured,'actual AI action composite must be drawn');
   const key=(phase===1?'mp_pilot':'mp_bloom')+(action==='whip'?'_attack':'_cast');
   const actionRows=rows.filter(r=>r.pose&&r.pose.key===key&&r.drawn);
   assert(actionRows.every(r=>r.pose.coreLayer&&r.exposure>0),'core remains exposed through actual action');
   assert.deepEqual([...new Set(actionRows.map(r=>r.pose.frame))].sort(),action==='whip'?[0,1,2]:[0,1]);
   const events=rows.at(-1).events;
   if(action==='spore')assert.equal(events.filter(e=>e.kind==='shot').length,phase===1?5:6,'authoritative spore count unchanged');
   else {const impact=actionRows.find(r=>r.pose.frame===1);assert(events.some(e=>e.kind==='hit'&&Math.abs(e.time-impact.time)<=32),'composite impact matches actual damage callback');}
   assert(rows.at(-1).pose.key===(phase===1?'mp_pilot':'mp_bloom_idle'),'action returns correct body idle');
   actions.push({phase,action,rows});
  }
  fs.writeFileSync(path.join(OUT,viewport.width+'-evidence.json'),JSON.stringify({pixels,domain,runtime,actions,scope:'Pixel invariants; actual node-cut domain lifecycle; real update/render exposed idle with production VFX. Actual AI whip and spore while exposed; other warning spells are routing-only, not full-AI proof. Phase3 closed-network still has permanent open heart. Visual review required.'},null,2));
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('CORE_LAYER_PIXEL_DOMAIN_RUNTIME_PASS_NOT_VISUAL_RELEASE');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(server)server.kill();});
