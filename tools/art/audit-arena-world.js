'use strict';
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
const OUT=path.join(H.ROOT,'docs/art-gate/arena-world-20261029');
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));
 await H.goto(page,site.url+'/?lazy=1');
 await page.waitForFunction(()=>typeof startRun==='function' && typeof ARENA_BLUEPRINTS!=='undefined');
 await page.evaluate(()=>{loop=function(){};save.arenasCleared=Object.fromEntries(ARENA_ORDER.map(k=>[k,true]));save.starterChosen=true;selectedClass='tanque';lobbyAllies=[];netMatch=null;});
 fs.mkdirSync(OUT,{recursive:true});
 for(const arena of await page.evaluate(()=>ARENA_ORDER.slice())){
  await page.evaluate(a=>{currentArena=a;assetsOnState('playing');},arena);
  await page.waitForFunction(()=>assetsAllReady());
  await page.evaluate(()=>{startRun(3);setState('playing');});
  await page.waitForFunction(()=>assetsAllReady());
  results.push(await page.evaluate(a=>{
   for(const h of heroes)h.hp=h.maxHp=1e7;for(let t=0;t<6000;t+=40)update(40);
   arenaTitleCardHide();for(const id of ['hud','controls','pause-btn','mute-btn','tut-panel','boss-hud','center-banner','arena-title-card','boss-intro','run-intro']){const el=document.getElementById(id);if(el)el.style.visibility='hidden';}
   state='paused';render();
   return {arena:a,actual:currentArena,assetsReady:assetsAllReady(),groups:assetsNeededGroups(),props:aidProps.length,solids:aidSolids.length,hooks:Object.keys(arenaHookDef()||{}),blueprint:ARENA_BLUEPRINTS[a],seed:runMapSeed};
  },arena));
  if(!['hielo','bosque'].includes(arena)) await page.screenshot({path:path.join(OUT,'before-'+arena+'.png')});
 }
 fs.writeFileSync(path.join(OUT,'audit.json'),JSON.stringify({base:'c0a025016e0315b93870f2f4c86abb846619d30e',note:'All ten campaign arenas; await active asset groups before start. Two modified arenas have matched before/after in test-arena-world.js.',results,errors},null,2)+'\n');
 console.log(JSON.stringify({arenas:results.map(x=>({arena:x.arena,actual:x.actual,assetsReady:x.assetsReady})),errors}));
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
