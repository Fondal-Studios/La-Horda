'use strict';
// Prepared for the lazy-default candidate. Not part of CI until that change is reviewed.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),{chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'../../..'),OUT='/tmp/mother-browser/default-loading';fs.mkdirSync(OUT,{recursive:true});let browser,server;
const FILES=['pilot_idle.png','pilot_attack.png','pilot_cast.png','pilot_bloom_key.png','pilot_bloom_transition.png','pilot_bloom_idle.png','pilot_bloom_attack.png','pilot_bloom_cast.png','pilot_heart_key.png','pilot_death.png'];
const KEYS=['mp_pilot','mp_pilot_attack','mp_pilot_cast','mp_bloom_key','mp_bloom_trans','mp_bloom_idle','mp_bloom_attack','mp_bloom_cast','mp_heart_key','mp_death'];
const PREFIX='/assets/sprites/arenas/micelial/mother/';
const allFlags='motherArtPilot=1&motherBloomKey=1&motherHeartKey=1&motherCoreLayer=1&motherRevealPilot=1&motherDeathPilot=1';
(async()=>{
 server=spawn('python3',['-m','http.server','8855','--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});await new Promise(r=>setTimeout(r,500));browser=await chromium.launch({args:['--no-sandbox']});
 const reports=[];
 const newPage=async(query='',mode=false)=>{
  const options=typeof mode==='object'?mode:{failIdle:mode};let releaseIdle;const idleGate=new Promise(resolve=>{releaseIdle=resolve;});
  const page=await browser.newPage({viewport:{width:844,height:390}}),requests=[],errors=[];let failed=0;
  page.on('request',r=>{const pathname=new URL(r.url()).pathname;if(FILES.some(f=>pathname===PREFIX+f))requests.push(pathname.split('/').pop());});page.on('pageerror',e=>errors.push(e.message));
  // Routing disables browser HTTP cache, so duplicate loader requests cannot be
  // concealed by a cache hit. Native Image.src attempts are independently logged.
  await page.route('**/*',async route=>{
   const u=new URL(route.request().url());if(u.pathname===PREFIX+'pilot_idle.png'){
    if(options.failIdle&&failed++===0)return route.fulfill({status:404,contentType:'image/png',body:''});
    if(options.delayIdle)await idleGate;
    if(options.malformedIdle)return route.fulfill({status:200,contentType:'image/png',body:fs.readFileSync(path.join(ROOT,'assets/sprites/arenas/micelial/madre_espora/atlas.png'))});
   }return route.continue();
  });
  await page.addInitScript(()=>{
   window.requestAnimationFrame=()=>0;window.motherImageAttempts=[];
   const d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
   Object.defineProperty(HTMLImageElement.prototype,'src',{...d,set(v){if(String(v).includes('/mother/pilot_'))motherImageAttempts.push(String(v));return d.set.call(this,v);}});
  });
  await page.goto('http://127.0.0.1:8855/'+(query?'?'+query:''),{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof _micEnsureMotherArt==='function'&&typeof startRun==='function');
  const flags=await page.evaluate(()=>[MIC_MOTHER_PILOT_ON,MIC_MOTHER_BLOOM_KEY_ON,MIC_MOTHER_HEART_KEY_ON,MIC_MOTHER_CORE_LAYER_ON,MIC_MOTHER_REVEAL_PILOT_ON,MIC_MOTHER_DEATH_PILOT_ON]);
  return {page,requests,errors,flags,failed:()=>failed,releaseIdle};
 };
 const enterHost=page=>page.evaluate(()=>{selectedClass='tanque';lobbyAllies=['guerrero','mago','soporte'];currentArena='micelial';netMatch=null;startRun(10);setState('playing');});
 const ready=page=>page.waitForFunction(keys=>keys.every(k=>MIC_MP_OK[k]),KEYS,{timeout:120000,polling:100});
 for(const query of ['', 'unrelatedReviewQuery=1']){
  const t=await newPage(query);await t.page.waitForTimeout(250);assert.deepEqual(t.flags,Array(6).fill(true));assert.equal(t.requests.length,0,'default menu must not download new Mother atlases');
  // Level2 exercises ordinary non-Micelial entry without level1's unrelated
  // wall-clock penalty/help popups persisting into the next loading fixture.
  await t.page.evaluate(()=>{selectedClass='tanque';currentArena='bosque';lobbyAllies=['guerrero','mago','soporte'];netMatch=null;startRun(2);setState('playing');for(let i=0;i<10;i++)update(16);});await t.page.waitForTimeout(250);
  assert.equal(t.requests.length,0,'non-Micelial entry must not download Mother atlases');
  await enterHost(t.page);await ready(t.page);assert.deepEqual([...t.requests].sort(),[...FILES].sort(),'host first entry requests each of10 once');
  await t.page.evaluate(()=>{for(let i=0;i<30;i++)_micEnsureMotherArt();});await enterHost(t.page);await ready(t.page);await t.page.waitForTimeout(250);assert.equal(t.requests.length,10,'ensure/restart idempotent');
  const attempts=await t.page.evaluate(()=>motherImageAttempts);assert.equal(attempts.length,10,'idempotence is real Image construction, not hidden network cache');assert.deepEqual(t.errors,[]);
  reports.push({case:query||'root',flags:t.flags,requests:t.requests,attempts});await t.page.close();
 }
 const guest=await newPage();assert.equal(guest.requests.length,0);await guest.page.evaluate(()=>{currentArena='micelial';ARENA_DEFS.micelial.guestStart();});await ready(guest.page);assert.deepEqual([...guest.requests].sort(),[...FILES].sort());
 await guest.page.evaluate(()=>ARENA_DEFS.micelial.guestStart());await guest.page.waitForTimeout(250);assert.equal(guest.requests.length,10,'guest reentry does not duplicate loaded keys');reports.push({case:'cold-guest-entry',requests:guest.requests});assert.deepEqual(guest.errors,[]);await guest.page.close();
 for(const spec of [
  {query:'motherArtPilot=1',flags:[true,false,false,false,false,false],files:FILES.slice(0,3)},
  {query:'motherArtPilot=0',flags:Array(6).fill(false),files:[]},
  {query:'motherArtPilot=',flags:Array(6).fill(false),files:[]},
  {query:'motherBloomKey=1',flags:Array(6).fill(false),files:[]},
  {query:allFlags,flags:Array(6).fill(true),files:FILES},
  {query:'motherArtLegacy=1',flags:Array(6).fill(false),files:[]},
  {query:'motherArtLegacy=1&'+allFlags,flags:Array(6).fill(false),files:[]}
 ]){
  const t=await newPage(spec.query);assert.deepEqual(t.flags,spec.flags,'explicit query feature intent preserved');
  if(spec.files.length)await t.page.waitForFunction(files=>files.every(f=>Object.values(MIC_MP).some(im=>im.src.split('?')[0].endsWith('/'+f)&&im.complete&&im.naturalWidth>0)),spec.files,{timeout:120000,polling:100});
  else await t.page.waitForTimeout(250);
  assert.deepEqual([...t.requests].sort(),[...spec.files].sort(),'explicit diagnostic eager subset / rollback zero');
  await enterHost(t.page);await t.page.waitForTimeout(250);assert.deepEqual([...t.requests].sort(),[...spec.files].sort(),'entry respects explicit subset/rollback');assert.deepEqual(t.errors,[]);
  reports.push({case:spec.query,flags:t.flags,requests:t.requests});await t.page.close();
 }
 const fallbackProbe=async page=>{await page.waitForFunction(()=>_micMotherAtlasReady(),null,{timeout:120000,polling:100});return page.evaluate(()=>{
  micMotherRevealStart();const e=micMotherEntity();boss=e;bossActive=true;activeChampion=null;e.micDormant=0;micS.mo={st:'fight',ph:1,t:0,bloom:0,heart:0};
  for(const h of heroes){h.x=80;h.y=260;h.hp=h.maxHp;h.isRemote=true;}for(let i=0;i<160;i++){updateArenaCameraZoom();updateCamLift();}
  let legacy=0,pilot=0;const draw=ctx.drawImage;ctx.drawImage=function(...a){if(a[0]===MIC_MP.mp_atlas)legacy++;if(a[0]===MIC_MP.mp_pilot)pilot++;return draw.apply(this,a)};
  try{for(let i=0;i<30;i++)render();}finally{ctx.drawImage=draw;}
  return {legacy,pilot,ready:!!MIC_MP_OK.mp_pilot,width:MIC_MP.mp_pilot.width,height:MIC_MP.mp_pilot.height,attempts:motherImageAttempts.length};
 });};
 const delayed=await newPage('',{delayIdle:true});await enterHost(delayed.page);
 await delayed.page.waitForFunction(keys=>keys.filter(k=>k!=='mp_pilot').every(k=>MIC_MP_OK[k])&&_micMotherAtlasReady(),KEYS,{timeout:120000,polling:100});
 const pending=await fallbackProbe(delayed.page);await delayed.page.evaluate(()=>{for(let i=0;i<20;i++)micRenderReset();});await delayed.page.waitForTimeout(250);
 const pendingRequests=delayed.requests.slice(),pendingAttempts=await delayed.page.evaluate(()=>motherImageAttempts.length);
 // Release before assertions, so even a failed assertion cannot leave a held route.
 delayed.releaseIdle();await ready(delayed.page);
 const loaded=await fallbackProbe(delayed.page);
 fs.writeFileSync(path.join(OUT,'pending-idle-diagnostic.json'),JSON.stringify({pending,pendingRequests,pendingAttempts,loaded},null,2));
 assert(!pending.ready&&pending.legacy>0&&pending.pilot===0,'pending image keeps intact legacy fallback');
 assert.equal(pendingRequests.length,10,'repeated entry resets cannot duplicate pending image requests');assert.equal(pendingAttempts,10);
 assert(loaded.ready&&loaded.pilot>0&&loaded.legacy===0,'same pending request eventually renders ready art');assert.equal(delayed.requests.length,10);assert.deepEqual(delayed.errors,[]);
 reports.push({case:'delayed-idle-pending-entry-idempotence',pending,loaded,requests:delayed.requests});await delayed.page.close();
 const malformed=await newPage('',{malformedIdle:true});await enterHost(malformed.page);await ready(malformed.page);
 const malformedFallback=await fallbackProbe(malformed.page);
 await enterHost(malformed.page);await malformed.page.waitForTimeout(250);
 const malformedRequests=malformed.requests.slice();
 fs.writeFileSync(path.join(OUT,'malformed-idle-diagnostic.json'),JSON.stringify({malformedFallback,malformedRequests},null,2));
 assert(malformedFallback.ready,'valid200 PNG decodes; this is not a network failure');assert(malformedFallback.width!==1296||malformedFallback.height!==496,'fixture has invalid idle atlas dimensions');
 assert(malformedFallback.legacy>0&&malformedFallback.pilot===0,'malformed decoded atlas retains intact fallback');assert.equal(malformedRequests.length,10,'successful decode is not falsely labelled retryable network error');assert.deepEqual(malformed.errors,[]);
 reports.push({case:'decoded-wrong-dimensions-no-network-retry-claim',malformedFallback,requests:malformedRequests});await malformed.page.close();
 const failed=await newPage('',true);await enterHost(failed.page);
 await failed.page.waitForFunction(keys=>keys.filter(k=>k!=='mp_pilot').every(k=>MIC_MP_OK[k])&&!MIC_MP_OK.mp_pilot,KEYS,{timeout:120000,polling:100});
 assert.equal(failed.failed(),1,'one injected idle404 was requested');
 await failed.page.waitForFunction(()=>_micMotherAtlasReady(),null,{timeout:120000,polling:100});
 const fallback=await failed.page.evaluate(()=>{
  micMotherRevealStart();const e=micMotherEntity();boss=e;bossActive=true;activeChampion=null;e.micDormant=0;micS.mo={st:'fight',ph:1,t:0,bloom:0,heart:0};for(const h of heroes){h.x=80;h.y=260;h.hp=h.maxHp;h.isRemote=true;}
  for(let i=0;i<160;i++){updateArenaCameraZoom();updateCamLift();}
  let legacy=0,missing=0;const draw=ctx.drawImage;ctx.drawImage=function(...a){if(a[0]===MIC_MP.mp_atlas)legacy++;if(a[0]===MIC_MP.mp_pilot)missing++;return draw.apply(this,a)};
  try{for(let i=0;i<30;i++)render();}finally{ctx.drawImage=draw;}return {legacy,missing,ready:!!MIC_MP_OK.mp_pilot};
 });await failed.page.screenshot({path:path.join(OUT,'failed-idle-intact-fallback.png')});await failed.page.waitForTimeout(250);
 const countBefore=failed.requests.length,attemptsBefore=await failed.page.evaluate(()=>motherImageAttempts.length);
 fs.writeFileSync(path.join(OUT,'failure-recovery-preassert.json'),JSON.stringify({fallback,requests:failed.requests,attemptsBefore,reports},null,2));
 assert(fallback.legacy>0&&!fallback.missing&&!fallback.ready,'failed idle keeps intact legacy body');assert.equal(countBefore,10,'failed key is not retried by rendering');assert.equal(attemptsBefore,10,'no hidden per-frame Image retry');
 await enterHost(failed.page);await ready(failed.page);assert.equal(failed.requests.length,11,'next entry retries only failed key');assert.equal(failed.requests.filter(f=>f==='pilot_idle.png').length,2);
 assert.equal(await failed.page.evaluate(()=>motherImageAttempts.length),11);assert.deepEqual(failed.errors,[]);reports.push({case:'failed-idle-next-entry-recovery',requests:failed.requests,fallback});await failed.page.close();
 fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({status:'LAZY_DEFAULT_LOADING_CONTRACT_PASS_NOT_RELEASE',reports},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(server)server.kill();});
