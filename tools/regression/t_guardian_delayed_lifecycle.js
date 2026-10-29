'use strict';
const fs=require('node:fs'),H=require('../lib/serve');
(async()=>{const site=await H.startSite(),browser=await H.launch();const results=[],errors=[];
try{const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));if(process.env.BASELINE){for(const file of ['js/skills/boss-guardian.js','js/arenas/abismo/ab-bosses.js']){const body=require('node:child_process').execFileSync('git',['show',process.env.BASELINE+':'+file],{encoding:'utf8'});await page.route('**/'+file,route=>route.fulfill({status:200,contentType:'text/javascript',body}));}}await H.goto(page,site.url+'/?lazy=1');await page.waitForFunction(()=>typeof abAIMorador==='function');
await page.evaluate(()=>{loop=function(){};selectedClass='tanque';lobbyAllies=[];});
for(const kind of ['walls','zones','shards'])for(const mode of ['active','dead','killed','removed','ended']){
const r=await page.evaluate(({kind,mode})=>{currentArena=kind==='shards'?'abismo':'bosque';startRun(10);state='playing';clearRunTimers();enemies=[];iceWalls.length=0;guardReset();
const e=spawnEnemy(kind==='shards'?'ab_morador':'guardian_ancestral',true,false);boss=e;bossActive=true;e.x=player.x-300;e.y=player.y;
if(kind==='shards'){abS.mo.st='fight';abS.mo.ph=2;for(const k of ['slamCd','rayCd','pullCd','patCd','jawCd','waveCd','tentCd'])e[k]=1e6;e.shardCd=0;
const c=abPlatCenter(AB_PLATS[0]);player.x=c.x;player.y=c.y;const rand=Math.random;Math.random=()=>.5;try{abAIMorador(e,16,player,300);}finally{Math.random=rand;}}
else BOSS_ATTACKS[kind==='walls'?'gdTreeWalls':'gdCorrupt'](e,player,300);
const before=kind==='shards'?_abPlatHp():kind==='walls'?iceWalls.length:GUARD.zones.length;
if(mode==='dead')e.alive=false;
if(mode==='killed'){e.hp=0;killEnemy(e);}
if(mode==='removed')enemies=[];
if(mode==='ended'){runEnding=true;if(kind==='shards')abS.mo.st='dead';}
updateRunTimers(2500);
const after=kind==='shards'?_abPlatHp():kind==='walls'?iceWalls.length:GUARD.zones.length;
return {kind,mode,before,after,pass:mode==='active'?(kind==='shards'?after<before:after>before):after===before};},{kind,mode});results.push(r);console.log(r.pass?'PASS':'FAIL',JSON.stringify(r));}
fs.writeFileSync(process.env.REPORT||'/tmp/guardian-delayed.json',JSON.stringify({results,errors,scope:'Real browser timers and consumers; controlled death/removal/end fixtures, not full encounter or relay.'},null,2));
}finally{await browser.close();await site.close();}process.exitCode=errors.length||results.some(r=>!r.pass)?1:0;})().catch(e=>{console.error(e);process.exitCode=1;});
