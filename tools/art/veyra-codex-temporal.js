'use strict';
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
const OUT=path.join(H.ROOT,'art-source/entregas/veyra-codex-20261029/integracion-01');
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
 const p=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await H.goto(p,site.url+'/?lazy=1');await p.evaluate(()=>{loop=function(){};assetsStartGroup('ch:veyra');assetsStartGroup('ch:tanque');cromaLoadAll();});
 await p.waitForFunction(()=>CHAMP_PACK.veyra?.ready&&TANQUE_IMG.complete&&TANQUE_IMG.naturalWidth>0,null,{timeout:120000});
 const result=await p.evaluate(()=>{
  selectedClass='veyra';currentArena='bosque';lobbyAllies=[];startRun(1);state='paused';ART_GATE_NO_VFX=true;
  const dirs=[['down',0,1],['right',1,0],['up',0,-1],['left',-1,0]],states=['idle','walk','attack','cast','ultimate','hit','death'];
  const N=180,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d',{willReadFrequently:true}),saved=ctx,orig=champPackDrawFrame;let calls=[];
  champPackDrawFrame=function(P,v){calls.push({frame:v,url:P.atlas?.src});return orig.apply(this,arguments);};
  function draw(k,dir,st,phase){const [direction,fx,fy]=dir;animNow=st==='death'?10000+phase*170:9200+phase*230;const h=makeHero(k,true,0,0);
   Object.assign(h,{x:0,y:0,fx,fy,_pdir:direction==='left'||direction==='right'?'side':direction,_pleft:direction==='left',moving:st==='walk',animT:phase*130,attackAnim:['attack','cast','ultimate'].includes(st)?400-phase*100:0,_aDur:400,_aPrev:400,hurtTimer:st==='hit'?160-phase*40:0,alive:st!=='death',_deadAt:10000,_packCastUntil:['cast','ultimate'].includes(st)?Infinity:0,portCastState:st==='ultimate'?'ultimate':'cast',_animCastKind:st==='ultimate'?2:1});
   calls=[];g.clearRect(0,0,N,N);g.save();g.translate(90,145);g.imageSmoothingEnabled=false;ctx=g;try{h.alive?drawHeroBody(h,h.scale,false,false):drawFallenHero(h);}finally{ctx=saved;g.restore();}
   const d=g.getImageData(0,0,N,N).data,ys=Array(N).fill(0);let bottom=-1,left=N,right=-1;for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(d[(y*N+x)*4+3]>40){ys[y]++;bottom=y;left=Math.min(left,x);right=Math.max(right,x);}const th=Math.max(...ys)*.22,b=ys.map((v,i)=>v>=th?i:-1).filter(i=>i>=0);
   return{direction,state:st,phase,calls:JSON.parse(JSON.stringify(calls)),body:b.at(-1)-b[0]+1,foot:bottom-145,width:right-left+1};
  }
  try{const ref=draw('tanque',dirs[0],'idle',0),rows=[],idle=[],sheets={};for(const dir of dirs){const sh=document.createElement('canvas');sh.width=N*4;sh.height=N*7;const sg=sh.getContext('2d');sg.fillStyle='#26302c';sg.fillRect(0,0,sh.width,sh.height);for(let si=0;si<states.length;si++)for(let ph=0;ph<4;ph++){const m=draw('veyra',dir,states[si],ph);sg.drawImage(cv,ph*N,si*N);rows.push(m);if(si===0&&ph===0)idle.push({...m,pass:Math.abs(m.body/ref.body-1)<=.04&&Math.abs(m.foot-ref.foot)<=2});}sheets[dir[0]]=sh.toDataURL();}return{ref,idle,rows,sheets,normalization:CHAMP_ART_NORMALIZE.veyra};}finally{ctx=saved;champPackDrawFrame=orig;}
 });
 for(const [d,u]of Object.entries(result.sheets))fs.writeFileSync(path.join(OUT,'installed-all-states-'+d+'.png'),Buffer.from(u.split(',')[1],'base64'));delete result.sheets;
 fs.writeFileSync(path.join(OUT,'TEMPORAL_INSTALLED.json'),JSON.stringify({scope:'112 body states through actual drawHeroBody/drawFallenHero at game scale; isolated canvas.',errors,...result},null,2)+'\n');
 console.log(JSON.stringify({errors,states:result.rows.length,idle:result.idle,normalization:result.normalization}));if(errors.length||result.rows.length!==112||result.idle.some(x=>!x.pass)||result.rows.some(x=>!x.calls.some(c=>c.url.includes('/veyra/codex-v1/'))))process.exitCode=1;
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
