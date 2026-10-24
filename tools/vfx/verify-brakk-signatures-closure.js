'use strict';
// Compare the live renderer to its preserved parent on the same canvas/pool.
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
const OUT=process.env.OUT||'art-source/entregas/brakk-signatures-20261024/cierre-01';
const source=fs.readFileSync(OUT+'/source-before.js','utf8');
const parent=source.slice(source.indexOf('function drawChampionSignatures(){'),source.indexOf('// Frost nova'));
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await H.goto(page,site.url+'/');await page.waitForFunction(()=>typeof startRun==='function'&&assetsAllReady());
 const r=await page.evaluate(parent=>{
  loop=()=>{};const oldDraw=eval('('+parent+')'),newDraw=drawChampionSignatures,real=ctx,view=inView;inView=()=>true;
  const cv=document.createElement('canvas');cv.width=160;cv.height=180;ctx=cv.getContext('2d');
  const checks=[],exports=[],samples=[];const check=(name,ok,detail)=>checks.push({name,pass:!!ok,detail});
  const event=(key,slot,ult,t=100)=>{championSignaturesReset();vfxChampionSignature(80,130,key,slot,ult,.3);championSignatures[0].t=t;};
  const snap=fn=>{ctx.clearRect(0,0,160,180);fn();return cv.toDataURL();};
  for(const calm of [false,true]){JUICE.reduceMotion=calm;
   for(const key of [...Object.keys(CHAMPION_SIGNATURES),'brakk','unknown'])for(const ult of [false,true]){
    if(key==='brakk'&&!ult)continue;
    let same=true;for(const t of [0,90,330,450]){event(key,1,ult,t);same&&=snap(oldDraw)===snap(newDraw);}
    check('unchanged '+key+' ult='+ult+' calm='+calm,same);
   }
   for(const slot of [-1,2,3,undefined,.5]){event('brakk',slot,false);check('fallback slot '+slot+' calm='+calm,snap(oldDraw)===snap(newDraw));}
  }
  JUICE.reduceMotion=false;
  for(const slot of [0,1]){
   const atlas=document.createElement('canvas');atlas.width=64*12;atlas.height=64;const ac=atlas.getContext('2d');
   const bounds=[];let differs=true,unchanged=true;
   for(let i=0;i<12;i++){
    event('brakk',slot,false,i*460/12);const st=JSON.stringify(championSignatures),before=snap(oldDraw),after=snap(newDraw);differs&&=before!==after;unchanged&&=st===JSON.stringify(championSignatures);
    ac.drawImage(cv,48,16,64,64,i*64,0,64,64);
    const data=ctx.getImageData(0,0,160,180).data;let xmin=160,xmax=0,ymin=180,ymax=0,n=0;
    for(let y=0;y<180;y++)for(let x=0;x<160;x++)if(data[(y*160+x)*4+3]){n++;xmin=Math.min(xmin,x);xmax=Math.max(xmax,x);ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);}
    bounds.push({i,n,xmin,xmax,ymin,ymax});
   }
   check('all twelve frames replace star slot '+slot,differs);check('draw keeps event state slot '+slot,unchanged);
   check('bounded native crest slot '+slot,bounds.every(b=>b.n>0&&b.xmin>=48&&b.xmax<112&&b.ymin>=16&&b.ymax<80),bounds);
   exports.push({name:['masonry','nail-turret','cross-brace'][slot],png:atlas.toDataURL()});
   event('brakk',slot,false,100);samples.push(snap(newDraw));
  }
  check('two distinct silhouettes',new Set(samples).size===2);
  const rnd=Math.random;let calls=0;Math.random=()=>{calls++;return .5;};
  for(let slot=0;slot<2;slot++){event('brakk',slot,false);newDraw();}
  Math.random=rnd;check('emitter and draw use no RNG',calls===0,calls);
  event('brakk',0,false,0);championSignaturesUpdate(459);check('normal lasts 460ms',championSignatures[0].on);championSignaturesUpdate(1);check('expires at 460ms',!championSignatures[0].on);
  championSignaturesReset();for(let i=0;i<50;i++)vfxChampionSignature(80,130,'brakk',i%3,false,0);check('pool remains bounded at 32',championSignatures.filter(s=>s.on).length===32);
  vfxChampionSignature(80,130,'brakk',3,true,0);check('ultimate retains replacement priority',championSignatures.filter(s=>s.on&&s.ult).length===1);
  championSignaturesReset();check('reset clears pool',championSignatures.every(s=>!s.on));
  inView=()=>false;vfxChampionSignature(80,130,'brakk',0,false,0);check('offscreen alloc suppressed',championSignatures.every(s=>!s.on));inView=()=>true;event('brakk',1,false);inView=()=>false;ctx.clearRect(0,0,160,180);newDraw();check('offscreen draw culled',!ctx.getImageData(0,0,160,180).data.some(n=>n));inView=()=>true;check('visible reentry renders',(snap(newDraw),ctx.getImageData(0,0,160,180).data.some(n=>n)));
  event('brakk',0,false);newDraw();const cache=brakkSignatureAtlas,data=cache.getContext('2d').getImageData(0,0,192,80).data;
  check('native source alpha 0/255',Array.from(data).filter((v,i)=>i%4===3).every(a=>a===0||a===255));
  check('atlas bounded 192x80',cache.width===192&&cache.height===80);
  for(let i=0;i<500;i++){event('brakk',i%3,false,i%460);newDraw();}championSignaturesReset();
  check('500 draws/reset retain one immutable atlas',brakkSignatureAtlas===cache);
  exports.push({name:'native-source',png:cache.toDataURL()});
  const timings={};for(const [name,fn]of [['parent',oldDraw],['candidate',newDraw]]){
   championSignaturesReset();for(let i=0;i<32;i++)vfxChampionSignature(80,130,'brakk',i%3,false,0);
   const ts=[];for(let i=0;i<650;i++){const t=performance.now();fn();if(i>=50)ts.push(performance.now()-t);}ts.sort((a,b)=>a-b);timings[name]={p50:ts[300],p95:ts[570],max:ts[599],samples:600,scope:'32 visible crests, local desktop Chromium, no physical mobile/GC certification'};
  }
  ctx=real;inView=view;championSignaturesReset();return{checks,exports,timings};
 },parent);
 fs.mkdirSync(OUT+'/atlases',{recursive:true});for(const e of r.exports){fs.writeFileSync(OUT+'/atlases/signature-'+e.name+'.png',Buffer.from(e.png.split(',')[1],'base64'));delete e.png;}
 fs.writeFileSync(OUT+'/signature-checks.json',JSON.stringify({...r,errors},null,2)+'\n');console.log(JSON.stringify({checks:r.checks.length,failed:r.checks.filter(x=>!x.pass),timings:r.timings,errors}));if(errors.length||r.checks.some(x=>!x.pass))process.exitCode=1;
 }finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
