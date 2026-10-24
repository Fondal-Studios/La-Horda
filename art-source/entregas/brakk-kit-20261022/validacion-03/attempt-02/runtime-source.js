'use strict';
const fs=require('node:fs'),H=require('../lib/serve');
const OUT=process.env.OUT||'art-source/entregas/brakk-kit-20261022/validacion-03';
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await H.goto(page,site.url);await H.waitFor(page,()=>typeof sfaPush==='function'&&assetsAllReady());
 const result=await page.evaluate(()=>{
 loop=()=>{};selectedClass='brakk';save.champions.brakk.unlocked=true;currentArena='bosque';startRun(1);enemies=[];spawnTimer=1e9;state='playing';render();state='menu';
 const checks=[],check=(name,pass,details)=>checks.push({name,pass:!!pass,details}),push=(x=player.x,y=player.y)=>sfaPush('burst','brakk_deploy~h',x,y,45,0,620),timings=[];
 for(const lite of [false,true]){JUICE.reduceFx=lite;sfaReset();for(let i=0;i<100;i++)push();check('saturated cap '+lite,sfaPool.length===(lite?16:SFA_POOL_MAX),sfaPool.length);for(let i=0;i<40;i++)vfxUpdate(16);check('saturated events expire '+lite,sfaPool.length===0,sfaPool.length);}
 JUICE.reduceFx=false;sfaReset();push(player.x+1e6,player.y+1e6);check('outside view never allocates',sfaPool.length===0);push();check('new visible event after outside-view rejection',sfaPool.length===1);portadorReset();check('run reset clears pool',sfaPool.length===0);
 sfaCache.clear();const t0=performance.now(),b=sfaBake('burst','brakk_deploy~h',64),cold=performance.now()-t0;check('12-frame authored deploy',b.n===12,{w:b.w,h:b.h,n:b.n});const same=sfaBake('burst','brakk_deploy~h',64);check('cache reused',same===b);
 const warm=[];for(let i=0;i<500;i++){const t=performance.now();sfaBake('burst','brakk_deploy~h',64);warm.push(performance.now()-t);}
 for(let i=0;i<600;i++){if(i%10===0)push();vfxUpdate(16);const t=performance.now();render();timings.push(performance.now()-t);}
 const retained=sfaPool.length;check('repeated events bounded',retained<=SFA_POOL_MAX,retained);portadorReset();check('post benchmark reset',sfaPool.length===0);
 const stats=a=>{a.sort((a,b)=>a-b);return{samples:a.length,p50:a[Math.floor(a.length*.5)],p95:a[Math.floor(a.length*.95)],max:a[a.length-1]};};
 return{checks,coldBakeMs:cold,warmBakeMs:stats(warm),renderMs:stats(timings),retained,cache:sfaCache.size,limitation:'Headless local, no device/GC/thermal certification; render includes the scene, update is outside the measurement.'};
 });const status=errors.length||result.checks.some(c=>!c.pass)?'FAIL':'PASS';fs.writeFileSync(OUT+'/deploy-runtime.json',JSON.stringify({status,...result,errors},null,2)+'\n');console.log(JSON.stringify({status,...result,errors}));if(status==='FAIL')process.exitCode=1;
 }finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
