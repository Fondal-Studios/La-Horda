'use strict';
// Diagnostic body sequences and unchanged canonical native detector. No runtime installation.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),H=require('../lib/serve');
const BASE='art-source/entregas/veyra-codex-20261028',OUT=path.join(H.ROOT,BASE,'cierre-03');
const source=fs.readFileSync(path.join(H.ROOT,'tools/art/pixel-density.js'),'utf8');
function section(a,b){const x=source.indexOf(a),y=source.indexOf(b);if(x<0||y<=x)throw Error('detector changed');return source.slice(x,y);}
const detector=section('const CANON =','const FLOOR_SCALE')+section('function analyzeInPage','function walk')+section('function classify','(async () => {');
(async()=>{const site=await H.startSite(),browser=await H.launch(),results=[];
try{for(const mobile of [false,true]){
 const p=await browser.newPage({viewport:mobile?{width:844,height:390}:{width:1280,height:800},serviceWorkers:'block'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(site.url+'/?lazy=1');await p.waitForFunction(()=>typeof makeHero==='function');
 await p.evaluate(()=>{loop=function(){};assetsStartGroup('ch:veyra');if(typeof assetsStartRest==='function')assetsStartRest();});await p.waitForFunction(()=>CHAMP_PACK.veyra?.ready);
 await p.addScriptTag({content:detector});
 for(const stage of ['cierre-02','cierre-03']){
  const meta=JSON.parse(fs.readFileSync(path.join(H.ROOT,BASE,stage,'candidate-meta.json')));
  await p.evaluate(({meta,url})=>champPackLoadAtlas('veyra',url,meta),{meta,url:BASE+'/'+stage+'/candidate-atlas.png'});await p.waitForFunction(()=>CHAMP_PACK.veyra?.ready);
  await p.evaluate(stage=>{window.__packs=window.__packs||{};window.__packs[stage]=CHAMP_PACK.veyra;},stage);
 }
 const data=await p.evaluate(()=>{
  selectedClass='veyra';currentArena='bosque';lobbyAllies=[];startRun(1);state='paused';window.ART_GATE_NO_VFX=true;
  const N=180,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d',{willReadFrequently:true});
  const sheet=document.createElement('canvas');sheet.width=N*4;sheet.height=N*16;const sg=sheet.getContext('2d');sg.fillStyle='#26302c';sg.fillRect(0,0,sheet.width,sheet.height);
  const saved=ctx,oldFrame=champPackDrawFrame;let calls=[];const rows=[];
  champPackDrawFrame=function(P,v,x,y,s,flip,alpha){const t=ctx.getTransform();calls.push({frame:v,scaleX:s*Math.hypot(t.a,t.b),scaleY:s*Math.hypot(t.c,t.d),flip,source:P.atlas?.src});return oldFrame.apply(this,arguments);};
  function draw(h,P){CHAMP_PACK.veyra=P;g.clearRect(0,0,N,N);g.save();g.translate(90,145);g.imageSmoothingEnabled=false;ctx=g;calls=[];try{if(!h.alive)drawFallenHero(h);else drawHeroBody(h,h.scale,false,false);}finally{ctx=saved;g.restore();}const d=g.getImageData(0,0,N,N).data,ys=new Array(N).fill(0);let bottom=-1;for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(d[(y*N+x)*4+3]>40){ys[y]++;bottom=y;}const thr=Math.max(...ys)*.22,body=ys.map((v,i)=>v>=thr?i:-1).filter(v=>v>=0);return{png:cv.toDataURL(),calls:JSON.parse(JSON.stringify(calls)),foot:bottom-145,body:body.at(-1)-body[0]+1};}
  try{['idle','walk','attack','cast','ultimate','hit','death','hit_up'].forEach((st,ri)=>{for(let phase=0;phase<4;phase++){
   animNow=st==='death'?10000+phase*170:9200+phase*230;const h=makeHero('veyra',true,0,0);Object.assign(h,{x:0,y:0,fx:st==='hit_up'?0:-1,fy:st==='hit_up'?-1:0,_pdir:st==='hit_up'?'up':'side',_pleft:st!=='hit_up',moving:st==='walk',animT:phase*130,attackAnim:['attack','cast','ultimate'].includes(st)?400-phase*100:0,_aDur:400,_aPrev:400,hurtTimer:['hit','hit_up'].includes(st)?160-phase*40:0,alive:st!=='death',_deadAt:10000,_packCastUntil:['cast','ultimate'].includes(st)?Infinity:0,portCastState:st==='ultimate'?'ultimate':'cast',_animCastKind:st==='ultimate'?2:1});
   const a=draw({...h},window.__packs['cierre-02']);sg.drawImage(cv,phase*N,ri*2*N);
   const b=draw({...h},window.__packs['cierre-03']);sg.drawImage(cv,phase*N,(ri*2+1)*N);
   const a2=draw({...h},window.__packs['cierre-02']);
   sg.fillStyle='#fff';sg.font='12px monospace';sg.fillText(st+' '+phase+' before',phase*N+4,ri*2*N+170);sg.fillText(st+' '+phase+' after',phase*N+4,(ri*2+1)*N+170);
   rows.push({state:st,phase,a,b,restored:a.png===a2.png});
  }});
  // Actual normalized renderer scale for each direction, retained for canonical native screening.
  const P=window.__packs['cierre-03'],scales={},native=[];CHAMP_PACK.veyra=P;
  for(const [dir,fx,fy] of [['down',0,1],['right',1,0],['up',0,-1],['left',-1,0]]){const h=makeHero('veyra',true,0,0);Object.assign(h,{fx,fy,attackAnim:0,hurtTimer:0,moving:false});const r=draw(h,P);scales[dir]=r.calls[0].scaleX;}
  const fc=document.createElement('canvas');fc.width=P.fw;fc.height=P.fh;const fg=fc.getContext('2d');
  for(let i=0;i<112;i++){fg.clearRect(0,0,P.fw,P.fh);fg.drawImage(P.atlas,i%P.cols*P.fw,Math.floor(i/P.cols)*P.fh,P.fw,P.fh,0,0,P.fw,P.fh);const m=analyzeInPage(fg.getImageData(0,0,P.fw,P.fh).data,P.fw,P.fh,8),dir=['down','right','up','left'][Math.floor(i/28)];native.push({frame:i,direction:dir,...m,...classify('campeones',m,scales[dir],'candidate-atlas.png')});}
  return{rows,scales,native,sheet:sheet.toDataURL(),scope:'Actual drawHeroBody, same synthetic hero state and normalized scale, body-only canvas. ABA pixels, not combat/global-state parity; no arenas/relay/performance.'};
  }finally{champPackDrawFrame=oldFrame;ctx=saved;}
 });
 fs.writeFileSync(path.join(OUT,'temporal-'+(mobile?'mobile':'desktop')+'.png'),Buffer.from(data.sheet.split(',')[1],'base64'));delete data.sheet;
 for(const r of data.rows)for(const key of ['a','b']){r[key].sha256=crypto.createHash('sha256').update(Buffer.from(r[key].png.split(',')[1],'base64')).digest('hex');delete r[key].png;}
 results.push({mobile,errors,...data});await p.close();
 }
 const report={scope:'Targeted grouped closure screening; not Art PASS',results};fs.writeFileSync(path.join(OUT,'SEQUENCE_NATIVE.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(results.map(r=>({mobile:r.mobile,errors:r.errors,aba:r.rows.filter(x=>x.restored).length,total:r.rows.length,scales:r.scales,nativeFails:r.native.filter(x=>x.issues.length).map(x=>({frame:x.frame,issues:x.issues}))}))));
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
