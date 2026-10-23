'use strict';
const fs=require('node:fs'),H=require('../lib/serve');
const OUT=process.env.OUT||'art-source/entregas/aelith-normal-kit-20261022/correccion-04';
(async()=>{fs.mkdirSync(OUT,{recursive:true});const site=await H.startSite(),browser=await H.launch();try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await H.goto(page,site.url);await H.waitFor(page,()=>typeof aelithDrawTrailEdges==='function'&&assetsAllReady());
 await page.evaluate(()=>{cromaEnsureLoaded('aelith_alt1');});await H.waitFor(page,()=>CHAMP_PACK.croma_aelith_alt1?.ready);
 const r=await page.evaluate(()=>{
 const checks=[],exports=[],metrics=[],check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
 netMatch=null;save.stash=[];for(const k in save.champions)Object.assign(save.champions[k],{unlocked:true,level:60,equipment:{},inventory:[],talents:{nodes:{},mastery:null,masteryNodes:{}}});selectedClass='aelith';currentArena='bosque';lobbyAllies=[];startRun(3);state='menu';enemies=[];
 const proto=CanvasRenderingContext2D.prototype,oldRead=proto.getImageData;let reads=0;const readTrace=[];proto.getImageData=function(...a){reads++;readTrace.push({canvas:this.canvas,stack:new Error().stack});return oldRead.apply(this,a);};
 const alphas=cv=>{const d=oldRead.call(cv.getContext('2d'),0,0,cv.width,cv.height).data;return Array.from({length:cv.width*cv.height},(_,i)=>d[i*4+3]);};
 try{
 for(const skin of [null,'aelith_alt1'])for(const [view,fx,fy] of [['front',0,1],['side',1,0],['back',0,-1]]){
  save.champions.aelith.croma=skin;player.fx=fx;player.fy=fy;player.animT=0;player.attackAnim=0;player._packCastUntil=0;
  const t=performance.now(),before=reads,cv=aelithTrailStamp(player),mask=aelithTrailMasks.get(cv),amber=cv.toDataURL(),alpha=alphas(cv);const first=reads-before;
  const boundary=alphas(mask.outline);let outside=0,invalid=0,clip=0;
  for(let y=0;y<160;y++)for(let x=0;x<160;x++){const n=y*160+x;if(!boundary[n])continue;if(!x||!y||x===159||y===159)clip++;if(!alpha[n]){outside++;if(![alpha[n-1],alpha[n+1],alpha[n-160],alpha[n+160]].some(a=>a))invalid++;}}
  check('equipped skin resolved '+skin+'/'+view,activeSetSkin(player)?.id===(skin||undefined));
  const ownReads=readTrace.slice(before).filter(r=>r.canvas===cv).length;
  check('one snapshot readback '+skin+'/'+view,ownReads===1,{ownReads,totalIncludingBodyWarmup:first});
  check('outline stays within one pixel '+skin+'/'+view,outside>0&&invalid===0&&clip===0,{outside,invalid,clip});
  const b=reads;aelithTrailPaint(cv,true);check('debt recolor needs no second readback '+skin+'/'+view,reads===b);
  check('debt preserves exact body alpha '+skin+'/'+view,JSON.stringify(alphas(cv))===JSON.stringify(alpha));
  check('debt changes RGB and retains outline '+skin+'/'+view,cv.toDataURL()!==amber&&alphas(mask.outline).some(Boolean));
  exports.push({name:(skin||'base')+'-'+view,amber,debt:cv.toDataURL(),edge:mask.outline.toDataURL()});metrics.push({skin,view,ms:performance.now()-t,readbacks:first});
 }
 save.champions.aelith.croma=null;player.alive=true;player.fused=false;player.aelithDebtUntil=runElapsedMs+3000;
 for(let i=0;i<4;i++){runElapsedMs+=60;player.x+=12.25;sfaObjectsFrame();}
 const s=aelithTrailState.get(player);check('only three equipped pose snapshots retained',s.shots.length===3);
 const draw=ctx.drawImage,calls=[];ctx.drawImage=function(cv,x,y,...rest){if(s.shots.some(p=>aelithTrailMasks.get(p.cv)?.outline===cv))calls.push({x,y,a:this.globalAlpha});return draw.call(this,cv,x,y,...rest);};
 const before=reads;aelithDrawTrailEdges(ctx);check('upper contour consumes no readback',reads===before);check('upper contour actually draws previous poses',calls.length===1,calls);check('pixel snapped upper positions',calls.every(c=>Number.isInteger(c.x)&&Number.isInteger(c.y)));
 calls.length=0;drawPortadorTop();check('real top renderer invokes contour',calls.length>0,calls);
 player.alive=false;calls.length=0;aelithDrawTrailEdges(ctx);check('death between ground and top hides contour',calls.length===0);player.alive=true;
 const visible=inView;inView=()=>false;calls.length=0;aelithDrawTrailEdges(ctx);check('offscreen contour culled',calls.length===0);inView=()=>true;aelithDrawTrailEdges(ctx);check('reentry draws same saved poses',calls.length===1);inView=visible;
 window.SFA_OFF=true;calls.length=0;aelithDrawTrailEdges(ctx);check('off mode skips upper contour',calls.length===0);window.SFA_OFF=false;
 runElapsedMs=player.aelithDebtUntil;updatePortadorHero(player,0);sfaObjectsFrame();const debt=sfaPool.find(e=>e.theme==='aelith_debt');check('actual debt timer remains800ms',debt?.dur===800);
 debt.t=110;calls.length=0;aelithDrawTrailEdges(ctx);check('outline collapses continuously at110ms',calls.length===1&&calls.every(c=>c.a>0&&c.a<=.425),calls);
 debt.t=220;calls.length=0;aelithDrawTrailEdges(ctx);check('upper contour disappears at220ms',calls.length===0);
 debt.t=799;check('debt aura still alive after contour collapse',debt.t<debt.dur);debt.t=800;sfaObjectsFrame();check('no retained state after800ms',!aelithTrailState.has(player));
 ctx.drawImage=draw;vfxResetRun();check('reset clears snapshot state',aelithTrailState.size===0);
 }finally{proto.getImageData=oldRead;}
 return {checks,exports,metrics,readTrace:readTrace.map(r=>({width:r.canvas.width,height:r.canvas.height,stack:r.stack}))};
 });
 fs.mkdirSync(OUT+'/snapshots',{recursive:true});for(const e of r.exports)for(const key of ['amber','debt','edge']){fs.writeFileSync(OUT+'/snapshots/'+e.name+'-'+key+'.png',Buffer.from(e[key].split(',')[1],'base64'));delete e[key];}
 const status=errors.length||r.checks.some(x=>!x.pass)?'FAIL':'PASS';fs.writeFileSync(OUT+'/contact-tests.json',JSON.stringify({status,...r,errors},null,2)+'\n');console.log(JSON.stringify({status,checks:r.checks.length,failed:r.checks.filter(x=>!x.pass),errors}));if(status==='FAIL')process.exitCode=1;
 }finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
