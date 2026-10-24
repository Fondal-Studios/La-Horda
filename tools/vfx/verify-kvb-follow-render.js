'use strict';
const H=require('../lib/serve'),fs=require('node:fs');
(async()=>{const site=await H.startSite(),browser=await H.launch();try{const page=await browser.newPage();if(process.env.PIXFX_FILE){const body=fs.readFileSync(process.env.PIXFX_FILE,'utf8');await page.route('**/js/champions/vfx-b/pixfx.js',r=>r.fulfill({status:200,contentType:'application/javascript',body}));}await H.goto(page,site.url);await H.waitFor(page,()=>typeof KVB_FX!=='undefined'&&assetsAllReady());
const checks=await page.evaluate(()=>{
 selectedClass='veyra';currentArena='bosque';netMatch=null;startRun(2);state='menu';const checks=[],oldDraw=ctx.drawImage,oldView=window.inView,oldRandom=Math.random;let rng=0;Math.random=()=>{rng++;return .4;};
 const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
 try{for(const dx of [-60,15,120])for(const mode of ['plain','flipped','off-camera-to-camera']){
  kvbReset();const owner={x:mode==='off-camera-to-camera'?1e7:0,y:0,alive:true};const e=kvbDecal('vy_pact_idle',owner.x,0,38,3000,{layer:'g',follow:owner,ofx:2,ofy:4,flip:mode==='flipped'});kvbUpdate(100);owner.x=dx;owner.y=12;
  let draws=0,seen=[];ctx.drawImage=function(...a){draws++;return oldDraw.apply(this,a);};window.inView=(x,y,r)=>{seen.push([x,y,r]);return Math.abs(x)<1000;};kvbDrawLayer('g');
  check(mode+':'+dx,draws===1&&e.x===owner.x+2&&e.y===owner.y+4&&seen[0][0]===owner.x+2,{draws,x:e.x,y:e.y,expectedX:owner.x+2,seen});
 }
 kvbReset();const owner={x:0,y:0,alive:true};kvbDecal('vy_pact_idle',0,0,38,3000,{layer:'g',follow:owner,ofy:4});kvbUpdate(100);owner.alive=false;let deadDraws=0;ctx.drawImage=function(){deadDraws++;};kvbDrawLayer('g');check('death-after-update-not-drawn',deadDraws===0,{deadDraws});
 kvbReset();const e=kvbDecal('vy_pact_idle',18,22,38,3000,{layer:'g'});kvbUpdate(100);kvbDrawLayer('g');check('unattached-position-preserved',e.x===18&&e.y===22);
 check('render-does-not-use-combat-rng',rng===0,{rng});
 }finally{ctx.drawImage=oldDraw;window.inView=oldView;Math.random=oldRandom;kvbReset();}return checks;});const report={status:checks.every(x=>x.pass)?'PASS':'FAIL',checks};fs.writeFileSync(process.env.OUT,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(report.status==='FAIL')process.exitCode=1;
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
