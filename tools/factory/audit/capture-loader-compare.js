'use strict';
/* Compara el cargador antiguo (LEGACY_CHAMP_LOADER=true) con el estándar para un campeón: idle/walk/attack en 3 direcciones, misma cámara y semilla. */
const fs=require('node:fs'),path=require('node:path'),H=require('../../lib/serve');
const OUT=path.resolve(process.env.OUT||'loader-compare'),KS=(process.env.ONLY||'tanque,guerrero,mago').split(',');
(async()=>{const site=await H.startSite(),b=await H.launch();fs.mkdirSync(OUT,{recursive:true});const log=[];
try{const p=await b.newPage({viewport:{width:844,height:390},deviceScaleFactor:2});
await p.addInitScript(()=>{let s=1;Math.random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};});p.on('pageerror',e=>log.push(e.message));
await H.goto(p,site.url+'/');await p.waitForFunction(()=>typeof startRun==='function'&&assetsAllReady(),null,{timeout:120000});await p.waitForTimeout(1500);
for(const k of KS)for(const legacy of [true,false]){
 for(const [dn,v] of [['down',[0,1]],['side',[1,0]],['up',[0,-1]]])for(const st of ['idle','walk','attack']){
  await p.evaluate(([k,legacy,v,st])=>{window.LEGACY_CHAMP_LOADER=legacy;netMatch=null;const s=save.champions[k];Object.assign(s,{unlocked:true,level:1,equipment:{},inventory:[]});s.croma=null;s.cosmeticSkin='';
   selectedClass=k;currentArena='bosque';startRun(1);document.querySelectorAll('.screen').forEach(e=>e.classList.add('hidden'));enemies=[];allies=[];spawnTimer=1e9;arenaHazardTimer=1e9;state='playing';
   player.x=1200;player.y=1200;player.fx=v[0];player.fy=v[1];player.hurtTimer=0;CAM_SUBJECT={x:player.x,y:player.y};
   if(st==='attack')player.attackAnim=180;if(st==='walk'){player.moving=true;player.animT=130;}
   for(let i=0;i<3;i++){CAM_SUBJECT={x:player.x,y:player.y};render();}},[k,legacy,v,st]);
  const cv=await p.$('#game'),bb=await cv.boundingBox();
  await p.screenshot({path:path.join(OUT,`${k}_${legacy?'legacy':'std'}_${dn}_${st}.png`),clip:{x:bb.x+bb.width/2-45,y:bb.y+bb.height/2-70,width:90,height:90}});}}
fs.writeFileSync(path.join(OUT,'log.json'),JSON.stringify(log));console.log('listo',log.length,'errores',log.slice(0,3));
}finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
