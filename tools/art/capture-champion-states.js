#!/usr/bin/env node
'use strict';
/* Captura DEL MOTOR (drawHeroBody real, sin VFX) de los 9 estados de un campeon, 4 cuadros cada uno, a tamano de juego (escala 2) y ampliado x3.
   Uso: (servir el repo: python3 -m http.server 8750)  node tools/art/capture-champion-states.js <campeon> <salida.png>
   Estados: caminar frente/perfil/espalda, ataque frente/perfil/espalda, lanzar, definitiva, muerte. Solo lee: no cambia el juego. */
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const [champ,out]=process.argv.slice(2);if(!champ||!out){console.error('uso: capture-champion-states.js <campeon> <salida.png>');process.exit(2);}
const BASE=process.env.ROSTER_BASE_URL||'http://127.0.0.1:8750';
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 try{
  const p=await b.newPage({viewport:{width:1400,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(BASE+'/index.html');await p.waitForFunction(()=>typeof CHAMP_ART_NORMALIZE!=='undefined'&&assetsAllReady());
  await p.waitForFunction(()=>Object.values(CHAMP_PACK).every(P=>P.ready||P.failed),null,{timeout:60000}).catch(()=>{});await p.waitForTimeout(1500);
  const url=await p.evaluate(champ=>{
   window.ART_GATE_NO_VFX=true;selectedClass=champ;currentArena='bosque';startRun(1);state='paused';
   const W=140,H=150,Z=3,rows=[['walk','front'],['walk','side'],['walk','up'],['attack','front'],['attack','side'],['attack','up'],['cast','front'],['ult','front'],['death','front']];
   const out=document.createElement('canvas');out.width=W*4*Z;out.height=H*rows.length*Z;const o=out.getContext('2d');o.fillStyle='#3a4258';o.fillRect(0,0,out.width,out.height);o.imageSmoothingEnabled=false;
   const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d'),saved=ctx;
   const V={front:[0,1],side:[1,0],up:[0,-1]};
   rows.forEach(([st,view],r)=>{for(let n=0;n<4;n++){
    animNow=20000;const h=makeHero(champ,true,0,0);Object.assign(h,{moving:false,animT:0,attackAnim:0,hurtTimer:0,_packCastUntil:0,fx:V[view][0],fy:V[view][1],_pdir:undefined});
    if(st==='walk'){h.moving=true;h.animT=n*130;}
    if(st==='attack'||st==='cast'||st==='ult'){h._aDur=1000;h._aPrev=1e6;h.attackAnim=1000*(1-(n+.5)/4);if(st!=='attack')h._packCastUntil=Infinity;if(st==='ult'){h.portCastState='ultimate';h._animCastKind=2;}}
    g.clearRect(0,0,W,H);g.save();g.translate(W/2,H-30);g.imageSmoothingEnabled=false;ctx=g;
    try{h.x=0;h.y=0;if(st==='death'){h.alive=false;h.hp=0;h._deadAt=20000-170*n-10;animNow=20000;drawChampPackDeath(h);}else drawHeroBody(h,h.scale,false,false);}catch(e){console.error(e.message);}
    ctx=saved;g.restore();o.drawImage(cv,0,0,W,H,n*W*Z,r*H*Z,W*Z,H*Z);}});
   return out.toDataURL();
  },champ);
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,Buffer.from(url.split(',')[1],'base64'));
  console.log('captura',out,errors.length?('errores: '+errors.join(' | ')):'sin errores de pagina');
 }finally{await b.close();}
})();
