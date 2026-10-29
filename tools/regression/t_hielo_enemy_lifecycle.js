'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const H=require('../lib/serve');
(async()=>{const site=await H.startSite(),browser=await H.launch();let failed=0;const results=[];
try{const page=await browser.newPage({viewport:{width:844,height:390}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await H.goto(page,site.url+'/?lazy=1');await page.waitForFunction(()=>typeof hieGranHelada==='function');
await page.evaluate(()=>{loop=function(){};selectedClass='tanque';currentArena='hielo';lobbyAllies=[];startRun(10);state='playing';});
for(const mode of ['active','interrupted','dead','replaced','last-fire']){
 const r=await page.evaluate(mode=>{clearRunTimers();hieBossClear();enemies=[];bossActive=true;state='playing';
 HIE.br.forEach((b,i)=>{b.lit=mode==='last-fire'?i===0:true;b.fuel=60000;});
 const e=spawnEnemy('mago_hielo_cristal',true,false);boss=e;e.x=HIE.br[0].x;e.y=HIE.br[0].y;
 HIE.gh={st:'idle',t:0,cd:0};hieGranHelada(e);
 const before=HIE.br.filter(b=>b.lit).length;
 if(mode==='interrupted'){hieFoci().forEach(f=>{f.alive=false;f.hp=0;});hieMagoRule(e,16);}
 if(mode==='dead')e.alive=false;
 if(mode==='replaced'){hieBossClear();HIE.gh={st:'cast',t:0,cd:0};}
 updateRunTimers(HIE_BOSS.snuffWarn+1);
 return {mode,before,after:HIE.br.filter(b=>b.lit).length,exposed:e._expT||0};},mode);
 r.pass=r.after===r.before-(mode==='active'?1:0)&&(mode!=='interrupted'||r.exposed>0);results.push(r);console.log(r.pass?'PASS':'FAIL',JSON.stringify(r));if(!r.pass)failed++;
}
assert.equal(errors.length,0,JSON.stringify(errors));
const out=process.env.ICE_REPORT||'/tmp/ice-lifecycle.json';fs.writeFileSync(out,JSON.stringify({results,errors,failed},null,2));
}finally{await browser.close();await site.close();}process.exitCode=failed?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;});
