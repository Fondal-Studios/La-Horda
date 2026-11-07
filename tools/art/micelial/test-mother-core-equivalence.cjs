'use strict';
// Test-only frozen full-scan oracle; isolated pages bound native Canvas lifetime.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),{chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'../../..'),OUT='/tmp/mother-browser/core-equivalence';fs.mkdirSync(OUT,{recursive:true});let browser,server;
(async()=>{
 server=spawn('python3',['-m','http.server','8854','--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});await new Promise(r=>setTimeout(r,500));browser=await chromium.launch({args:['--no-sandbox']});
 const reference=fs.readFileSync(path.join(__dirname,'fixtures/core-composite-full-scan-reference.js'),'utf8'),rows=[];
 const frames=[['mp_pilot',3],['mp_pilot_attack',3],['mp_pilot_cast',2],['mp_bloom_idle',3],['mp_bloom_attack',3],['mp_bloom_cast',2]];
 for(const [key,count]of frames)for(let frame=0;frame<count;frame++){
  const page=await browser.newPage();await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  await page.goto('http://127.0.0.1:8854/?motherArtPilot=1&motherBloomKey=1&motherHeartKey=1&motherCoreLayer=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(key=>MIC_MP_OK[key]&&MIC_MP_OK.mp_heart_key,key,{polling:100,timeout:120000});
  const row=await page.evaluate(({key,frame,reference})=>{
   const old=eval(reference),b=MIC_MOTHER_CORE_BINDINGS[key],stages=[];
   for(let stage=0;stage<=8;stage++){
    const p={key,frame,w:b.w,h:b.h,anchor:b.anchor,coreAmount:stage/8};
    const a=_micMotherCoreComposite(p).getContext('2d').getImageData(0,0,b.w,b.h).data,z=old(p).getContext('2d').getImageData(0,0,b.w,b.h).data;
    let changed=0,maxDelta=0;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-z[i]);if(d)changed++;maxDelta=Math.max(maxDelta,d);}
    stages.push({stage,changed,maxDelta,bytes:a.length});
   }return {key,frame,stages};
  },{key,frame,reference});rows.push(row);await page.close();
  fs.writeFileSync(path.join(OUT,'pixel-equivalence.json'),JSON.stringify({rows,status:'PRE_ASSERT_FULL_RGBA_ORACLE'},null,2));
  assert(row.stages.every(s=>s.changed===0&&s.maxDelta===0),'ROI must match frozen full-scan output byte-for-byte, including cavity interior');
 }
 assert.equal(rows.reduce((n,r)=>n+r.stages.length,0),144);console.log('CORE_ROI_144_FULL_RGBA_EQUIVALENCE_PASS');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(server)server.kill();});
