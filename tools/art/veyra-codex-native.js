'use strict';
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
const OUT=path.join(H.ROOT,'art-source/entregas/veyra-codex-20261029/integracion-01');
const src=fs.readFileSync(path.join(H.ROOT,'tools/art/pixel-density.js'),'utf8');
const part=(a,b)=>src.slice(src.indexOf(a),src.indexOf(b));
const detector=part('const CANON =','const FLOOR_SCALE')+part('function analyzeInPage','function walk')+part('function classify','(async () => {');
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
 const p=await browser.newPage({serviceWorkers:'block'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await H.goto(p,site.url+'/?lazy=1');await p.evaluate(()=>{loop=function(){};assetsStartGroup('ch:veyra');});
 await p.waitForFunction(()=>CHAMP_PACK.veyra?.ready,null,{timeout:120000});await p.addScriptTag({content:detector});
 const result=await p.evaluate(()=>{
  selectedClass='veyra';currentArena='bosque';lobbyAllies=[];startRun(1);state='paused';ART_GATE_NO_VFX=true;
  const P=CHAMP_PACK.veyra,rows=[],scales={},saved=ctx,c=document.createElement('canvas');c.width=P.fw;c.height=P.fh;
  const g=c.getContext('2d',{willReadFrequently:true});let scale=0;const old=champPackDrawFrame;
  champPackDrawFrame=function(Q,v,x,y,s){if(Q===P)scale=s;return old.apply(this,arguments);};
  try{
   for(const [dir,fx,fy]of[['down',0,1],['right',1,0],['up',0,-1],['left',-1,0]]){const h=makeHero('veyra',true,0,0);Object.assign(h,{fx,fy,moving:false});ctx=g;g.save();g.translate(P.fw/2,P.fh-12);drawHeroBody(h,h.scale,false,false);g.restore();scales[dir]=scale;}
   for(let i=0;i<112;i++){g.clearRect(0,0,P.fw,P.fh);g.drawImage(P.atlas,i%P.cols*P.fw,Math.floor(i/P.cols)*P.fh,P.fw,P.fh,0,0,P.fw,P.fh);const m=analyzeInPage(g.getImageData(0,0,P.fw,P.fh).data,P.fw,P.fh,8),dir=['down','right','up','left'][Math.floor(i/28)];rows.push({frame:i,direction:dir,...m,...classify('campeones',m,scales[dir],'atlas.png')});}
  }finally{ctx=saved;champPackDrawFrame=old;}
  return{url:P.atlas.src,w:P.fw,h:P.fh,cols:P.cols,scales,rows};
 });
 const report={scope:'Installed Veyra Codex atlas, unchanged canonical detector; all 112 authored cells at actual normalized renderer scale.',errors,...result};
 fs.writeFileSync(path.join(OUT,'NATIVE_INSTALLED.json'),JSON.stringify(report,null,2)+'\n');const failed=result.rows.filter(r=>r.issues.length);
 console.log(JSON.stringify({url:result.url,samples:result.rows.length,failed,errors}));if(errors.length||failed.length||!result.url.includes('/veyra/codex-v1/'))process.exitCode=1;
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
