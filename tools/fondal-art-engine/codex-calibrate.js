'use strict';
// Measure a replacement against the still-retained original. Only changes visual scale/feet.
const H=require('../lib/serve'),fs=require('fs'),path=require('path');
(async()=>{const site=await H.startSite();let b;try{
 b=await H.launch();const p=await b.newPage();await H.goto(p,site.url+'/?lazy=0');
 await p.waitForFunction(()=>typeof CODEX_GAMEPLAY_ART!=='undefined'&&Object.values(CHAMP_PACK).every(p=>p.ready||p.failed)&&TANQUE_IMG_READY&&GUERRERO_IMG_READY);
 const result=await p.evaluate(()=>{
  selectedClass='tanque';currentArena='bosque';startRun(1);state='paused';window.ART_GATE_NO_VFX=true;
  const cv=document.createElement('canvas');cv.width=cv.height=260;const g=cv.getContext('2d',{willReadFrequently:true}),saved=ctx;ctx=g;const evidence=[];
  const views={front:[0,1],side:[1,0],up:[0,-1]};
  function measure(key,v){const h=makeHero(key,true,0,0);Object.assign(h,{_codexSkin:null,fx:views[v][0],fy:views[v][1],moving:false,animT:0,attackAnim:0,hurtTimer:0,_packCastUntil:0});animNow=0;g.clearRect(0,0,260,260);g.save();g.translate(130,220);drawHeroBody(h,h.scale,false,false);g.restore();const d=g.getImageData(0,0,260,260).data,rows=Array(260).fill(0);let y1=-1;for(let y=0;y<260;y++)for(let x=0;x<260;x++)if(d[(y*260+x)*4+3]>40){rows[y]++;y1=y;}const threshold=Math.max(...rows)*.22,ys=rows.map((n,i)=>n>=threshold?i:-1).filter(i=>i>=0);return {body:ys.at(-1)-ys[0]+1,foot:y1-220};}
  try{for(const [key,entry] of Object.entries(CODEX_GAMEPLAY_ART)){
   const P=CHAMP_PACK['codex_'+key];P.ready=false;const baseline=Object.fromEntries(Object.keys(views).map(v=>[v,measure(key,v)]));P.ready=true;
   entry.normalization=JSON.parse(JSON.stringify(CHAMP_ART_NORMALIZE[key]));
   for(const v of Object.keys(views)){
    const target=baseline[v];let best={error:Infinity};
    for(let i=0;i<12;i++){const m=measure(key,v),n=entry.normalization[v],error=Math.abs(m.body-target.body)+Math.abs(m.foot-target.foot);if(error<best.error)best={error,n:[...n],m};if(!error)break;n[0]*=target.body/m.body;n[1]+=target.foot-m.foot;}
    entry.normalization[v]=best.n.map(n=>+n.toFixed(6));evidence.push({key,view:v,baseline:target,candidate:measure(key,v),normalization:entry.normalization[v]});
   }
  }}finally{ctx=saved;}
  return {entries:CODEX_GAMEPLAY_ART,evidence};
 });
 if(result.evidence.some(r=>Math.abs(r.baseline.body-r.candidate.body)>1||Math.abs(r.baseline.foot-r.candidate.foot)>1))throw Error('Could not preserve original visual dimensions');
 const f=path.resolve(__dirname,'../../js/assets/codex-champion-meta.js'),s=fs.readFileSync(f,'utf8');
 fs.writeFileSync(f,s.replace(/const CODEX_GAMEPLAY_ART = [\s\S]*?;\nfor\(/,'const CODEX_GAMEPLAY_ART = '+JSON.stringify(result.entries,null,2)+';\nfor('));
 fs.writeFileSync(process.argv[2]||'/tmp/codex-calibration.json',JSON.stringify(result.evidence,null,2)+'\n');console.log(JSON.stringify(result.evidence));
}finally{if(b)await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
