'use strict';
/* Captura en el renderer REAL de la caminata de un campeón/skin: misma semilla, cámara, reloj y
 * velocidad. Uso: CHAMP=cazadora CROMA=cazadora_escarcha OUT=carpeta node capture-walk.js
 * Guarda una tira PNG por dirección (abajo, lado, arriba) y un JSON con pose única por cuadro. */
const fs=require('node:fs'),path=require('node:path'),H=require('../../lib/serve');
const CH=process.env.CHAMP||'cazadora',CR=process.env.CROMA||'cazadora_escarcha',OUT=path.resolve(process.env.OUT||'walk-capture');
(async()=>{const site=await H.startSite(),b=await H.launch();fs.mkdirSync(OUT,{recursive:true});
try{const p=await b.newPage({viewport:{width:844,height:390}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{let s=123456;Math.random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};Date.now=()=>1792684800000;});
await H.goto(p,site.url+'/');await p.waitForFunction(()=>typeof startRun==='function'&&assetsAllReady(),null,{timeout:120000});
await p.waitForTimeout(1500);
await p.evaluate(c=>{if(c)cromaEnsureLoaded(c);},CR);
await p.waitForFunction(c=>!c||CHAMP_PACK['croma_'+c]?.ready,CR,{timeout:60000});
const res=await p.evaluate(([k,cr])=>{let vt=1000;performance.now=()=>vt;netMatch=null;
 for(const ck in save.champions){const s=save.champions[ck];s.unlocked=true;s.level=20;s.equipment={};s.inventory=[];}
 save.champions[k].croma=cr||null;selectedClass=k;currentArena='bosque';startRun(3);
 document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));enemies=[];spawnTimer=1e9;arenaHazardTimer=1e9;state='playing';
 const cv=document.getElementById('game'),out={};
 for(const [name,v] of [['down',[0,1]],['side',[1,0]],['up',[0,-1]]]){
  player.x=1200;player.y=1200;player.animT=0;
  const frames=[],hashes=[];const S=3,cw=130,ch=140;
  for(let i=0;i<64;i++){joyVec={x:v[0],y:v[1]};vt+=16;CAM_SUBJECT={x:player.x,y:player.y};update(16);render();
   if(i>=8&&i%4===0&&frames.length<16){const c=document.createElement('canvas');c.width=cw;c.height=ch;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    const sc=cv.width/innerWidth;g.drawImage(cv,(cv.width/2)-cw/2,(cv.height/2)-ch*0.62,cw,ch,0,0,cw,ch);frames.push(c);
    hashes.push(g.getImageData(0,0,cw,ch).data.reduce((a,x)=>(a*31+x)>>>0,7));}}
  const sheet=document.createElement('canvas');sheet.width=cw*8;sheet.height=ch*2;const sg=sheet.getContext('2d');sg.fillStyle='#2a2a2a';sg.fillRect(0,0,sheet.width,sheet.height);
  frames.forEach((c,i)=>sg.drawImage(c,(i%8)*cw,Math.floor(i/8)*ch));
  out[name]={png:sheet.toDataURL(),uniquePoses:new Set(hashes).size,frames:frames.length,moved:Math.hypot(player.x-1200,player.y-1200)};}
 joyVec={x:0,y:0};return out;},[CH,CR]);
for(const [n,r] of Object.entries(res)){fs.writeFileSync(path.join(OUT,`walk_${n}.png`),Buffer.from(r.png.split(',')[1],'base64'));delete r.png;}
fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({champ:CH,croma:CR,res,errs},null,1));console.log(JSON.stringify({res,errs}));
}finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
