'use strict';
// Full directional body-only review, no runtime installation or global game-state claim.
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
const BASE='art-source/entregas/veyra-codex-20261028/cierre-04-recuperacion',OUT=path.join(H.ROOT,BASE);
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
 const p=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));await p.goto(site.url+'/?lazy=1');
 await p.waitForFunction(()=>typeof makeHero==='function');
 await p.evaluate(()=>{loop=function(){};assetsStartGroup('ch:veyra');assetsStartGroup('ch:tanque');});
 await p.waitForFunction(()=>CHAMP_PACK.veyra?.ready&&TANQUE_IMG.complete&&TANQUE_IMG.naturalWidth>0);
 const meta=JSON.parse(fs.readFileSync(path.join(OUT,'candidate-meta.json')));
 await p.evaluate(({meta,url})=>champPackLoadAtlas('veyra',url,meta),{meta,url:BASE+'/candidate-atlas.png'});
 await p.waitForFunction(()=>CHAMP_PACK.veyra?.ready);
 const result=await p.evaluate((calibrate)=>{
  selectedClass='veyra';currentArena='bosque';lobbyAllies=[];startRun(1);state='paused';window.ART_GATE_NO_VFX=true;
  const directions=[['down',0,1],['right',1,0],['up',0,-1],['left',-1,0]],states=['idle','walk','attack','cast','ultimate','hit','death'];
  const N=180,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d',{willReadFrequently:true});
  const saved=ctx,original=champPackDrawFrame;let calls=[];
  champPackDrawFrame=function(P,v){calls.push({frame:v,source:P.atlas?.src});return original.apply(this,arguments);};
  function draw(key,dir,st,phase){
   const [direction,fx,fy]=dir;animNow=st==='death'?10000+phase*170:9200+phase*230;
   const h=makeHero(key,true,0,0);Object.assign(h,{x:0,y:0,fx,fy,_pdir:direction==='left'?'side':direction==='right'?'side':direction,_pleft:direction==='left',moving:st==='walk',animT:phase*130,attackAnim:['attack','cast','ultimate'].includes(st)?400-phase*100:0,_aDur:400,_aPrev:400,hurtTimer:st==='hit'?160-phase*40:0,alive:st!=='death',_deadAt:10000,_packCastUntil:['cast','ultimate'].includes(st)?Infinity:0,portCastState:st==='ultimate'?'ultimate':'cast',_animCastKind:st==='ultimate'?2:1});
   calls=[];g.clearRect(0,0,N,N);g.save();g.translate(90,145);g.imageSmoothingEnabled=false;ctx=g;
   try{if(h.alive)drawHeroBody(h,h.scale,false,false);else drawFallenHero(h);}finally{ctx=saved;g.restore();}
   const d=g.getImageData(0,0,N,N).data,rows=Array(N).fill(0);let bottom=-1,left=N,right=-1;
   for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(d[(y*N+x)*4+3]>40){rows[y]++;bottom=y;left=Math.min(left,x);right=Math.max(right,x);}
   const threshold=Math.max(...rows)*.22,body=rows.map((v,i)=>v>=threshold?i:-1).filter(i=>i>=0);
   return {direction,state:st,phase,calls:JSON.parse(JSON.stringify(calls)),body:body.at(-1)-body[0]+1,foot:bottom-145,width:right-left+1};
  }
  try{
   const reference=draw('tanque',directions[0],'idle',0),sheets={},rows=[],idle=[],calibration=[];
   const originalNormalization=JSON.parse(JSON.stringify(CHAMP_ART_NORMALIZE.veyra));
   if(calibrate)for(let pass=0;pass<8;pass++){
    let off=0;for(const [dir,view] of [[directions[0],'front'],[directions[1],'side'],[directions[2],'up']]){
     const m=draw('veyra',dir,'idle',0),r=CHAMP_ART_NORMALIZE.veyra[view];calibration.push({pass,view,measured:m,factor:[...r]});
     if(Math.abs(m.body/reference.body-1)>.02){r[0]=+(r[0]*reference.body/m.body).toFixed(4);off++;}
     if(Math.abs(m.foot-reference.foot)>1){r[1]=+(r[1]+reference.foot-m.foot).toFixed(2);off++;}
    }if(!off)break;
   }
   for(const dir of directions){const sheet=document.createElement('canvas');sheet.width=N*4;sheet.height=N*7;const sg=sheet.getContext('2d');sg.fillStyle='#26302c';sg.fillRect(0,0,sheet.width,sheet.height);
    for(let s=0;s<states.length;s++)for(let phase=0;phase<4;phase++){const m=draw('veyra',dir,states[s],phase);sg.drawImage(cv,phase*N,s*N);sg.fillStyle='#fff';sg.font='12px monospace';sg.fillText(dir[0]+' '+states[s]+' '+phase,phase*N+4,s*N+170);rows.push(m);if(s===0&&phase===0)idle.push({...m,pass:Math.abs(m.body/reference.body-1)<=.04&&Math.abs(m.foot-reference.foot)<=2});}
    sheets[dir[0]]=sheet.toDataURL();
   }
   return {originalNormalization,calibration,reference,tolerance:{height:.04,foot:2},normalization:CHAMP_ART_NORMALIZE.veyra,idle,rows,sheets,scope:'112 synthetic states in actual drawHeroBody/drawFallenHero at game scale, isolated canvas. Existing main normalization retained. Not gameplay, all-look roster certification, relay or performance.'};
  }finally{champPackDrawFrame=original;ctx=saved;}
 },!!process.env.CALIBRATE);
 const tag=process.env.CALIBRATE?'calibrated-':'';
 for(const [dir,png] of Object.entries(result.sheets))fs.writeFileSync(path.join(OUT,tag+'all-states-'+dir+'.png'),Buffer.from(png.split(',')[1],'base64'));
 delete result.sheets;result.errors=errors;fs.writeFileSync(path.join(OUT,tag+'ALL_STATES_ROSTER.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({errors,states:result.rows.length,idle:result.idle,reference:result.reference}));
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
