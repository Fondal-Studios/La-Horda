'use strict';
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
const out=process.argv[2]||'/tmp/codex-native.json';
const src=fs.readFileSync(path.join(H.ROOT,'tools/art/pixel-density.js'),'utf8');
function part(a,b){const x=src.indexOf(a),y=src.indexOf(b);if(x<0||y<=x)throw Error('Detector changed');return src.slice(x,y);}
const detector=part('const CANON =','const FLOOR_SCALE')+part('function analyzeInPage','function walk')+part('function classify','(async () => {');
(async()=>{const site=await H.startSite();let b;try{
 b=await H.launch();const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await H.goto(p,site.url+'/?lazy=0');await p.waitForFunction(()=>typeof CODEX_GAMEPLAY_ART!=='undefined'&&Object.keys(CODEX_GAMEPLAY_ART).every(k=>CHAMP_PACK['codex_'+k]?.ready));await p.addScriptTag({content:detector});
 const rows=await p.evaluate(()=>{
  selectedClass='tanque';currentArena='bosque';startRun(1);state='paused';ART_GATE_NO_VFX=true;
  const result=[],saved=ctx,old=champPackDrawFrame,c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d',{willReadFrequently:true});
  try{for(const key of Object.keys(CODEX_GAMEPLAY_ART)){
   const P=CHAMP_PACK['codex_'+key],scales={};let actual=0;
   champPackDrawFrame=function(Q,v,x,y,s){if(Q===P){const t=ctx.getTransform();actual=s*Math.hypot(t.a,t.b);}return old.apply(this,arguments);};
   for(const [dir,fx,fy]of[['down',0,1],['right',1,0],['up',0,-1],['left',-1,0]]){const h=makeHero(key,true,0,0);Object.assign(h,{fx,fy,moving:false,_codexSkin:null});ctx=g;g.save();g.translate(128,220);drawHeroBody(h,h.scale,false,false);g.restore();if(!(actual>0))throw Error('Missing live atlas draw: '+key);scales[dir]=actual;}
   const frames=[];for(let i=0;i<36;i++){g.clearRect(0,0,256,256);g.drawImage(P.atlas,i%P.cols*P.fw,Math.floor(i/P.cols)*P.fh,P.fw,P.fh,0,0,P.fw,P.fh);const m=analyzeInPage(g.getImageData(0,0,P.fw,P.fh).data,P.fw,P.fh,8);frames.push({frame:i,...m,views:Object.fromEntries(Object.entries(scales).map(([d,s])=>[d,classify('campeones',m,s,'atlas.png')]))});}
   result.push({key,url:new URL(P.atlas.src).pathname,scales,frames});
  }}finally{ctx=saved;champPackDrawFrame=old;}return result;
 });
 const failures=rows.flatMap(r=>r.frames.flatMap(f=>Object.entries(f.views).filter(([,v])=>v.issues.length||!f.opaque).map(([view,v])=>({key:r.key,frame:f.frame,view,issues:v.issues}))));
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify({status:failures.length||errors.length?'FAIL':'PASS',scope:'All 36 cells per recovered champion, four directions at actual normalized live draw scale; unchanged canonical detector.',rows,failures,errors},null,2)+'\n');console.log({frames:rows.length*36,failures:failures.length,errors});if(failures.length||errors.length)process.exitCode=1;
 }finally{if(b)await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
