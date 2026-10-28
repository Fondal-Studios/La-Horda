#!/usr/bin/env node
'use strict';
// Uses the real game, registries and drawing functions. Desktop Chromium evidence, not device certification.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const H=require('../lib/serve');
async function main(){
 const out=path.resolve(process.argv[2]||'/tmp/fondal-runtime');fs.mkdirSync(out,{recursive:true});
 const report={status:'FAIL',errors:[],checks:[],platform:'desktop Chromium; not real mobile hardware'};
 const site=await H.startSite({envUrl:['FONDAL_BASE_URL']});let browser;
 try{
  browser=await H.launch();const page=await browser.newPage({viewport:{width:844,height:390}});
  page.on('pageerror',e=>report.errors.push(e.message));
  await H.goto(page,site.url+'/index.html?lazy=0');
  await page.waitForFunction(()=>typeof CHAMP_PACK!=='undefined'&&Object.keys(CHAMP_PACK).length>0&&Object.values(CHAMP_PACK).every(p=>p.ready||p.failed),null,{timeout:120000});
  report.catalog=await page.evaluate(()=>({champions:Object.keys(CLASSES),packs:Object.entries(CHAMP_PACK).map(([id,p])=>({id,ready:p.ready,failed:!!p.failed,src:p.atlas?.src,frames:Object.values(p.rawSets||p.sets||{}).flat().length})),enemies:typeof ENEMY_BASE==='undefined'?[]:Object.keys(ENEMY_BASE)}));
  assert(report.catalog.packs.every(p=>p.ready),'Some registered champion packs failed to load');
  const stats=await page.evaluate(()=>{
   buildSprites();selectedClass='tanque';currentArena='bosque';startRun(1);state='paused';
   const cv=document.createElement('canvas');cv.width=320;cv.height=320;const g=cv.getContext('2d'),saved=ctx;
   const checks=[],costs=[];
   try{
    ctx=g;
    for(const [key,p] of Object.entries(CHAMP_PACK)){
     const original=[p.fw,p.fh,p.cols,p.refH,p.anchor];
     for(const [clip,frames] of Object.entries(p.sets)){
      if(!Array.isArray(frames)||!frames.length)continue;
      for(const frame of frames){
       g.clearRect(0,0,320,320);g.imageSmoothingEnabled=false;
       const t=performance.now();champPackDrawFrame(p,frame,160,280,Math.min(1,220/Math.max(p.fw,p.fh)),false,1);costs.push(performance.now()-t);
       const px=g.getImageData(0,0,320,320).data;
       if(!px.some((v,i)=>i%4===3&&v>0))checks.push({key,clip,frame,error:'EMPTY_RENDER'});
      }
     }
     if(JSON.stringify(original)!==JSON.stringify([p.fw,p.fh,p.cols,p.refH,p.anchor]))checks.push({key,error:'MUTATED_GEOMETRY'});
    }
   }finally{ctx=saved;}
   costs.sort((a,b)=>a-b);render();
   return {issues:checks,draws:costs.length,p95DrawMs:costs[Math.floor(costs.length*.95)],maxDrawMs:costs[costs.length-1]};
  });
  report.checks.push(stats);await page.screenshot({path:path.join(out,'game-mobile-viewport.png')});
  assert(stats.draws>0);assert.equal(stats.issues.length,0,JSON.stringify(stats.issues.slice(0,20)));
  // Measure render-only cost separately from readback; not total game FPS.
  report.render=await page.evaluate(()=>{const samples=[];for(let i=0;i<60;i++){const t=performance.now();render();samples.push(performance.now()-t);}samples.sort((a,b)=>a-b);return {samples:60,p95Ms:samples[57],maxMs:samples[59],scope:'paused starting arena, render only'};});
  assert.equal(report.errors.length,0,JSON.stringify(report.errors));report.status='PASS';
 }catch(e){report.failure=e.message;throw e;}
 finally{fs.writeFileSync(path.join(out,'runtime.json'),JSON.stringify(report,null,2)+'\n');if(browser)await browser.close();await site.close();}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
