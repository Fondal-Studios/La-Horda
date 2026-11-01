'use strict';
/* Captura el idle de cada campeón en el renderer real (misma cámara/semilla/arena) para auditarlo
 * contra la base de sprites del Códice. Uso: OUT=dir [ONLY=a,b] node capture-ingame.js */
const fs=require('node:fs'),path=require('node:path'),H=require('../../lib/serve');
const OUT=path.resolve(process.env.OUT||'ingame');
(async()=>{const site=await H.startSite(),b=await H.launch();fs.mkdirSync(OUT,{recursive:true});const log=[];
try{const p=await b.newPage({viewport:{width:844,height:390},deviceScaleFactor:2});
await p.addInitScript(()=>{let s=123456;Math.random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};Date.now=()=>1792684800000;});
p.on('pageerror',e=>log.push('pageerror '+e.message));
await H.goto(p,site.url+'/');await p.waitForFunction(()=>typeof startRun==='function'&&assetsAllReady(),null,{timeout:120000});await p.waitForTimeout(1500);
const keys=process.env.ONLY?process.env.ONLY.split(','):await p.evaluate(()=>Object.keys(save.champions));
for(const k of keys){try{
 await p.evaluate(k=>{netMatch=null;const s=save.champions[k];if(!s)throw new Error('sin campeón');Object.assign(s,{unlocked:true,level:1,equipment:{},inventory:[]});s.croma=null;s.cosmeticSkin='';
  selectedClass=k;currentArena='bosque';startRun(1);document.querySelectorAll('.screen').forEach(e=>e.classList.add('hidden'));enemies=[];spawnTimer=1e9;arenaHazardTimer=1e9;state='playing';
  player.fx=0;player.fy=1;joyVec={x:0,y:0};CAM_SUBJECT={x:player.x,y:player.y};},k);
 await p.waitForTimeout(700);
 await p.evaluate(()=>{for(let i=0;i<6;i++){CAM_SUBJECT={x:player.x,y:player.y};update(16);render();}});
 const cv=await p.$('#game');const bb=await cv.boundingBox();
 await p.screenshot({path:path.join(OUT,k+'.png'),clip:{x:bb.x+bb.width/2-70,y:bb.y+bb.height/2-95,width:140,height:140}});
}catch(e){log.push(k+': '+e.message);}}
fs.writeFileSync(path.join(OUT,'log.json'),JSON.stringify(log,null,1));console.log('done',keys.length,log.length,'errores');
}finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
