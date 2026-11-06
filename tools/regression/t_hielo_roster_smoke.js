'use strict';
const fs=require('node:fs'),H=require('../lib/serve');
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
const p=await browser.newPage({viewport:{width:844,height:390}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await H.goto(p,site.url+'/?lazy=1');await p.waitForFunction(()=>typeof hieGranHelada==='function');
await p.evaluate(()=>{loop=function(){};assetsStartGroup('ar:hielo');assetsStartGroup('ch:tanque');});
const result=await p.evaluate(()=>{
 const types=[...new Set([...spawnPoolForHielo(10).map(x=>x.t),'dragon_hielo','mago_hielo_cristal','angel_caido_hielo','golem_cristal','cristal_servo','cristal_volador','foco_hielo'])];
 const rows=[];
 for(const type of types){selectedClass='tanque';currentArena='hielo';lobbyAllies=[];netMatch=null;startRun(1);state='playing';enemies=[];boss=null;bossActive=false;clearRunTimers();
 player.x=0;player.y=0;player.hp=player.maxHp=1e8;player.basicCd=1e9;
 const e=spawnEnemy(type,false,false);e.x=160;e.y=0;e.hp=e.maxHp=1e8;
 if(e.rank==='jefe'){boss=e;bossActive=true;}
 let finite=true;
 for(let i=0;i<2400;i++){spawnTimer=1e9;levelTimer=0;arenaHazardTimer=1e9;player.basicCd=1e9;player.hp=player.maxHp;update(16);if(i%60===0)render();if(![e.x,e.y,e.hp,player.x,player.y,player.hp].every(Number.isFinite)){finite=false;break;}}
 rows.push({type,finite,alive:e.alive,elapsed:runElapsedMs,enemyCount:enemies.length,state});
 }
 return rows;
});
const out={results:result,errors,scope:'13 enemy types, 2400 real update steps/type and render every60. Isolated high-HP fixture; not multiplayer or balance certification.'};
fs.writeFileSync(process.env.ICE_REPORT||'/tmp/ice-roster.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out));if(errors.length||result.some(x=>!x.finite))process.exitCode=1;
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
