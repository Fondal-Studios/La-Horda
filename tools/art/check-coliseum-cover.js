'use strict';
const {chromium}=require('playwright'),{spawn}=require('child_process'),fs=require('fs'),assert=require('assert');
const out='docs/coliseum-cover';
(async()=>{const server=spawn('python3',['-m','http.server','8877'],{stdio:'ignore'});let browser;const report={errors:[]};try{
 for(let i=0;i<60;i++){try{if((await fetch('http://127.0.0.1:8877')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1280,height:800}});page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto('http://127.0.0.1:8877/index.html');await page.waitForFunction(()=>typeof colBuildCover==='function'&&assetsAllReady());
 await page.waitForFunction(()=>['column','slate'].every(k=>BATTLEFIELD_IMAGES[k].complete&&BATTLEFIELD_IMAGES[k].naturalWidth));
 report.geometry=await page.evaluate(()=>{
  loop=function(){};colStart({champ:'tanque',seed:42});state='paused';
  const solids=aidSolids.filter(s=>s.colCover),s=solids[0];const h={x:s.x,y:s.y,radius:20,pit:0};colClamp(h);
  const shot={x:s.x+200,y:s.y,radius:4,life:1000};const blocked=colBlockProjectile(shot,s.x-200,s.y)&&shot.life===0;
  const arc={...shot,life:1000,lob:true};const arcsPass=!colBlockProjectile(arc,s.x-200,s.y);
  const free={x:COL.PITS[0].x+300,y:COL.PITS[0].y,radius:4,life:1000};const clearShot=!colBlockProjectile(free,COL.PITS[0].x-300,free.y);
  LN.col.phase='fight';LN.col.ringR=COL.PIT_R;
  const bot={x:s.x-110,y:s.y,radius:18,pit:0,alive:true,team:0},target={x:s.x+110,y:s.y,alive:true};let steps=0;
  for(;steps<700&&Math.hypot(bot.x-target.x,bot.y-target.y)>28;steps++){
   LN.t+=16;let d=colBotMove(bot,target,false);if(!d){const dx=target.x-bot.x,dy=target.y-bot.y,l=Math.hypot(dx,dy)||1;d={x:dx/l,y:dy/l};}bot.x+=d.x*2.5;bot.y+=d.y*2.5;colClamp(bot);
  }
  const paths=COL.PITS.every(c=>{const d=new Uint16Array(AID_NAV.dist.length);aidNavBfs(d,seed=>seed({x:c.x,y:c.y,alive:true}));return [-1,1].every(side=>[-62,62].every(y=>d[aidNavCell(c.x+side*COL.START_DIST,c.y+y)]<65535));});
  return {count:solids.length,collision:Math.hypot(h.x-s.x,h.y-s.y)>=s.r+19.9,blocked,arcsPass,clearShot,paths,botReached:Math.hypot(bot.x-target.x,bot.y-target.y)<28,steps,centerClear:solids.every(s=>Math.hypot(s.x-COL.PITS[s.pit].x,s.y-COL.PITS[s.pit].y)-s.r>COL.RING_MIN),symmetric:solids.every(s=>solids.some(o=>o.pit===s.pit&&o.x===2*COL.PITS[s.pit].x-s.x&&o.y===s.y))};
 });
 assert(report.geometry.count===12);for(const key of ['collision','blocked','arcsPass','clearShot','paths','botReached','centerClear','symmetric'])assert(report.geometry[key],key+' '+JSON.stringify(report.geometry));
 // Real engine simulation, including AI, combat and ring shrink.
 report.simulation=await page.evaluate(()=>{
  colStartRound();state='playing';const start=heroes.map(h=>({x:h.x,y:h.y}));let damage=false;
  for(let i=0;i<2400&&!LN.ended;i++){update(16);if(heroes.some(h=>h.hp<h.maxHp))damage=true;}
  const c=LN.col;return{time:LN.t,round:c.round,damage,moved:heroes.some((h,i)=>Math.hypot(h.x-start[i].x,h.y-start[i].y)>70),finite:heroes.every(h=>Number.isFinite(h.x)&&Number.isFinite(h.y)),outsideSolids:heroes.filter(h=>h.alive).every(h=>!aidSolids.some(s=>s.colCover&&Math.hypot(h.x-s.x,h.y-s.y)<s.r+(h.radius||18)-1))};
 });
 assert(report.simulation.damage&&report.simulation.moved&&report.simulation.finite&&report.simulation.outsideSolids,JSON.stringify(report.simulation));
 await page.evaluate(()=>{state='paused';colStartRound();player.x=COL.PITS[0].x;player.y=COL.PITS[0].y;render();});
 await page.locator('#game').screenshot({path:out+'/gameplay.png'});
 await page.evaluate(()=>{CAM_ZOOM=.55;CAM_LIFT=0;render();});await page.locator('#game').screenshot({path:out+'/overview.png'});
 await page.setViewportSize({width:844,height:390});await page.evaluate(()=>render());await page.locator('#game').screenshot({path:out+'/mobile.png'});
 report.reset=await page.evaluate(()=>{lanesStop();currentArena='bosque';selectedClass='tanque';lobbyAllies=[];startRun(1);state='paused';return !aidSolids.some(s=>s.colCover);});assert(report.reset);assert(!report.errors.length,JSON.stringify(report.errors));console.log(JSON.stringify(report));
 }finally{fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
