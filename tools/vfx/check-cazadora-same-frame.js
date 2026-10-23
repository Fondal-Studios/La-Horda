'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),H=require('../lib/serve');
const OUT='art-source/entregas/cazadora-kit-20261023/integracion-01';
const trap=cp.execFileSync('git',['show','817610a7:js/champions/asesino.js'],{encoding:'utf8'}).split('function drawTrap(tr){')[1];
const rain=cp.execFileSync('git',['show','817610a7:js/champions/cazadora.js'],{encoding:'utf8'}).split('function drawSylvaRainZones(){')[1].split('/* ============================================================')[0];
(async()=>{const site=await H.startSite(),b=await H.launch();const result=[];try{for(const viewport of[{width:390,height:844},{width:844,height:390}]){const p=await b.newPage({viewport});await H.goto(p,site.url);await p.waitForFunction(()=>assetsAllReady()&&SYLVA_TRAP_READY.f4&&SYLVA_RAIN_READY.f3);await p.evaluate(()=>cromaEnsureLoaded('cazadora_escarcha'));await p.waitForFunction(()=>CHAMP_PACK.croma_cazadora_escarcha?.ready&&CHAMP_PACK.skin_manada?.ready);
const r=await p.evaluate(({trap,rain})=>{
 const oldTrap=Function('return function drawTrap(tr){'+trap)(),oldRain=Function('return function drawSylvaRainZones(){'+rain)(),out=[];
 for(const arena of['bosque','hielo','infernal','laberinto','acuatica','minas'])for(const look of['base','manada','escarcha']){
  for(const k in save.champions){Object.assign(save.champions[k],{unlocked:true,level:20,equipment:{},talents:{nodes:{},mastery:null,masteryNodes:{}}});}save.champions.cazadora.cosmeticSkin=look==='manada'?'manada':'';save.champions.cazadora.croma=look==='escarcha'?'cazadora_escarcha':null;save.cosmeticUnlocks={...(save.cosmeticUnlocks||{}),manada:true};selectedClass='cazadora';currentArena=arena;lobbyAllies=['tanque','soporte'];netMatch=null;startRun(1);enemies=[];spawnTimer=1e9;arenaHazardTimer=1e9;player.aim={x:player.x+110,y:player.y,dx:1,dy:0};castAbility(player,player.cls.skills[1],false,1);castAbility(player,player.cls.skills[2],false,2);render();state='menu';
  const real=ctx,cv=real.canvas,T=real.getTransform();let samples=[];
  for(const phase of[1,2,3,4]){traps[0].armTime=200*(1-(phase-.5)/4);sylvaRainZones[0].timer=900*(1-(Math.min(phase,3)-.5)/3);
   const draw=(tf,rf)=>{const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;const g=c.getContext('2d');g.drawImage(cv,0,0);g.setTransform(T);ctx=g;try{tf(traps[0]);rf();return c.toDataURL();}finally{ctx=real;}};
   const a=draw(oldTrap,oldRain),n=draw(drawTrap,drawSylvaRainZones),a2=draw(oldTrap,oldRain);samples.push({phase,same:a===n,restored:a===a2});
  }
  out.push({arena,look,pack:setSkinPackKey(player,'cazadora'),samples});
 }
 return out;
},{trap,rain});result.push({viewport,scenes:r});await p.close();}
fs.writeFileSync(OUT+'/same-frame.json',JSON.stringify(result,null,2));const samples=result.flatMap(r=>r.scenes.flatMap(s=>s.samples));console.log(JSON.stringify({scenes:36,comparisons:samples.length,failed:samples.filter(x=>!x.same||!x.restored)}));if(samples.some(x=>!x.same||!x.restored))process.exitCode=1;
}finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
