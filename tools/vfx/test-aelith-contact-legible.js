'use strict';
// Upper-outline gate: actual skeleton body drawn by the game, then actual trail
// overlay. Same sprite-mask/delta24 and >=80% per placement rule as decal gate.
// Isolates the added layer, does not certify all stacked gameplay effects.
const fs=require('node:fs'),H=require('../lib/serve');
const OUT=process.env.OUT||'art-source/entregas/aelith-normal-kit-20261022/correccion-04';
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
 const page=await browser.newPage({viewport:process.env.MOBILE?{width:390,height:844}:{width:844,height:390}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await H.goto(page,site.url);await H.waitFor(page,()=>typeof aelithDrawTrailEdges==='function'&&assetsAllReady());
 await page.evaluate(()=>cromaEnsureLoaded('aelith_alt1'));await H.waitFor(page,()=>CHAMP_PACK.croma_aelith_alt1?.ready);
 const r=await page.evaluate(()=>{
 const rows=[];netMatch=null;save.stash=[];for(const k in save.champions)Object.assign(save.champions[k],{unlocked:true,level:60,equipment:{},inventory:[],talents:{nodes:{},mastery:null,masteryNodes:{}}});selectedClass='aelith';currentArena='bosque';lobbyAllies=[];startRun(3);state='menu';enemies=[];
 const cv=document.createElement('canvas');cv.width=400;cv.height=240;const g=cv.getContext('2d'),mk=document.createElement('canvas');mk.width=400;mk.height=240;const mg=mk.getContext('2d');
 const main=ctx,vis=inView,draw=CanvasRenderingContext2D.prototype.drawImage,shadow=typeof _shadowSprite==='function'?_shadowSprite():null;let recording=false;inView=()=>true;ctx=g;
 CanvasRenderingContext2D.prototype.drawImage=function(im,...a){if(recording&&this===g&&im!==shadow){mg.setTransform(this.getTransform());mg.globalAlpha=this.globalAlpha;draw.call(mg,im,...a);}return draw.call(this,im,...a);};
 const reset=()=>{g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.fillStyle='#303238';g.fillRect(0,0,400,240);g.imageSmoothingEnabled=false;g.translate(200-player.x*CAM_ZOOM,180-player.y*CAM_ZOOM);g.scale(CAM_ZOOM,CAM_ZOOM);};
 try{
 for(const arena of ['bosque','hielo','infernal','laberinto','acuatica','minas'])for(const skin of [null,'aelith_alt1'])for(const [direction,ax,ay]of [['right',1,0],['left',-1,0],['down',0,1],['up',0,-1]]){
  currentArena=arena;save.champions.aelith.croma=skin;player.fx=1;player.fy=0;player.alive=true;player.aelithDebtUntil=runElapsedMs+3000;aelithTrailState.clear();
  const shots=[];for(const dx of [-30,-20,-10])shots.push({cv:aelithTrailStamp(player),x:player.x+dx*ax,y:player.y+dx*ay});aelithTrailState.set(player,{until:player.aelithDebtUntil,last:runElapsedMs,shots});
  for(const phase of ['active','debt0','debt110']){
   sfaReset();if(phase!=='active'){player.aelithDebtUntil=0;for(const p of shots)aelithTrailPaint(p.cv,true);sfaPush('aura','aelith_debt',player.x,player.y,25,0,800,0,0,24,sfaHeroIdx(player));sfaPool[0].t=phase==='debt110'?110:0;}else player.aelithDebtUntil=runElapsedMs+3000;
   for(const [dx,dy]of [[-35,0],[-20,0],[-5,0],[-20,-15],[-20,15]]){
    enemies=[];const e=spawnEnemy('esqueleto');Object.assign(e,{x:player.x+dx*ax-dy*ay,y:player.y+dx*ay+dy*ax,hp:1e7,maxHp:1e7,speed:0,baseSpeed:0,dmg:0});
    mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,400,240);reset();recording=true;drawEnemy(e);recording=false;const before=g.getImageData(0,0,400,240).data,mask=mg.getImageData(0,0,400,240).data;aelithDrawTrailEdges(g);const after=g.getImageData(0,0,400,240).data;
    let n=0,visible=0;for(let i=0;i<mask.length;i+=4)if(mask[i+3]>=250){n++;if(Math.abs(before[i]-after[i])+Math.abs(before[i+1]-after[i+1])+Math.abs(before[i+2]-after[i+2])<24)visible++;}
    rows.push({arena,skin,direction,phase,dx,dy,mask:n,visible:n?visible/n:0});
   }
  }
 }
 }finally{ctx=main;inView=vis;CanvasRenderingContext2D.prototype.drawImage=draw;}
 return {rows,zoom:CAM_ZOOM};
 });
 const bad=r.rows.filter(r=>r.mask<80||r.visible<.8),status=bad.length||errors.length?'FAIL':'PASS';fs.writeFileSync(OUT+(process.env.MOBILE?'/legible-mobile.json':'/legible-horizontal.json'),JSON.stringify({status,threshold:.8,pixelDelta:24,...r,bad,errors},null,2)+'\n');console.log(JSON.stringify({status,rows:r.rows.length,min:Math.min(...r.rows.map(r=>r.visible)),failed:bad.length,errors}));if(status==='FAIL')process.exitCode=1;
 }finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
