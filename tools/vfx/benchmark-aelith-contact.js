'use strict';
const fs=require('node:fs'),H=require('../lib/serve');
const OUT='art-source/entregas/aelith-normal-kit-20261022/correccion-04';
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
 const results=[];for(const before of [true,false]){
  const page=await browser.newPage();if(before)await page.route('**/js/champions/skill-fx-a/c/aelith.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(OUT+'/source-before.js','utf8')}));await H.goto(page,site.url);await H.waitFor(page,()=>typeof aelithTrailStamp==='function'&&assetsAllReady());
  const result=await page.evaluate(()=>{
   netMatch=null;selectedClass='aelith';currentArena='bosque';lobbyAllies=[];startRun(3);state='menu';enemies=[];
   const sample=[],debt=[];let cold=0;for(let i=0;i<101;i++){const t=performance.now(),cv=aelithTrailStamp(player),a=performance.now();aelithTrailPaint(cv,true);const b=performance.now();if(i===0)cold=a-t;else{sample.push(a-t);debt.push(b-a);}}
   const stats=a=>{a.sort((a,b)=>a-b);return {n:a.length,p50:a[Math.floor(a.length*.5)],p95:a[Math.floor(a.length*.95)],max:a.at(-1)};};
   const points=[];player.aelithDebtUntil=runElapsedMs+100000;for(let i=0;i<300;i++){runElapsedMs+=60;player.x+=1;sfaObjectsFrame();points.push(aelithTrailState.get(player)?.shots.length||0);}vfxResetRun();
   return {coldStampMs:cold,stampMs:stats(sample),debtMs:stats(debt),retainedMax:Math.max(...points),emptyAfterReset:aelithTrailState.size===0};
  });results.push({before,...result});await page.close();
 }
 fs.writeFileSync(OUT+'/performance.json',JSON.stringify({status:'MEASURED_NOT_DEVICE_GATE',scope:'headless Chromium on this machine;100 warm stamps/gray recolors plus300 retain/replace steps per version',results},null,2)+'\n');console.log(JSON.stringify(results));
 }finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
