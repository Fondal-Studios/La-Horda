'use strict';
// Diagnostic only: compare uninterrupted submission with per-frame paced rendering.
const fs=require('fs'),H=require('../lib/serve');
const D='art-source/entregas/maura-kit-20261025/cierre-02';
(async()=>{fs.mkdirSync(D,{recursive:true});const site=await H.startSite(),b=await H.launch();try{
 const p=await b.newPage();await p.goto(site.url+'/?lazy=0');await p.waitForFunction(()=>typeof mauraNativeStrip==='function');
 const result=await p.evaluate(async(reverse)=>{
 loop=()=>{};const native=mauraNativeStrip('roots');
 const h={alive:true,shield:20,x:200,y:200},o={owner:h,life:3000,maxLife:4000};
 const root={x:200,y:200,bx:445,by:200,w:52,t:300,dur:720};
 const shear={art:'nova',theme:'maura_shears~p',x:200,y:200,r:110,t:300,dur:700,ang:0};sfaDrawOne(shear,ctx);
 const events=[],orig=CanvasRenderingContext2D.prototype.drawImage;let calls=0,slow=[],measuring=false;
 CanvasRenderingContext2D.prototype.drawImage=function(...args){const t=performance.now();const r=orig.apply(this,args),dt=performance.now()-t;if(measuring)calls++;if(measuring&&dt>5)slow.push({call:calls,ms:dt,source:args[0]===native.cv?'roots':'other',sourceWidth:args[0].width,sourceHeight:args[0].height});return r;};
 try {for(const mode of (reverse?['blit-paced','native-paced','blit-burst','native-burst','blit-no-clear','native-no-clear']:['native-no-clear','blit-no-clear','native-burst','blit-burst','native-paced','blit-paced'])){
  const times=[],bakedBefore=sfaStats.baked;calls=0;slow=[];
  for(let j=0;j<200;j++){
   if(mode.endsWith('paced'))await new Promise(requestAnimationFrame);
   measuring=true;const t=performance.now();if(!mode.endsWith('no-clear'))ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
   for(let k=0;k<32;k++)if(mode.startsWith('native')){mauraDrawRoots(root,ctx);mauraDrawBark(o);sfaDrawOne(shear,ctx);}else for(let z=0;z<3;z++)ctx.drawImage(native.cv,0,0,native.w,native.h,200,200,220,52);
   times.push(performance.now()-t);measuring=false;
  }
  const ordered=[...times].sort((a,b)=>a-b);events.push({mode,samples:200,drawCalls:calls,bakes:sfaStats.baked-bakedBefore,p50:ordered[100],p95:ordered[190],max:ordered[199],times,slowDrawCalls:slow});
 }return{events,userAgent:navigator.userAgent,scope:'Local Chromium instrumented draw submission only. Blit control is not pixel-equivalent. Pacing changes workload scheduling, not runtime. Does not certify physical mobile, GPU, GC or full-game frame budget.'};
 }finally{CanvasRenderingContext2D.prototype.drawImage=orig;}
 },!!process.env.REVERSE);fs.writeFileSync(D+(process.env.REVERSE?'/PERFORMANCE_REVERSE.json':'/PERFORMANCE_DIAGNOSIS.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result.events.map(({times,slowDrawCalls,...x})=>({...x,slowDrawCalls}))));
}finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
