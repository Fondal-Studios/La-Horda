'use strict';
// Real PNG request failures, rendered through the game's existing draw functions.
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
const OUT=path.resolve(process.env.OUT||'art-source/entregas/cazadora-kit-20261023/integracion-01');
(async()=>{const site=await H.startSite(),browser=await H.launch();const results=[];fs.mkdirSync(OUT,{recursive:true});try{
for(const viewport of [{width:390,height:844},{width:844,height:390}])for(const missing of [[],['f2'],['f1'],['f1','f2','f3','f4']]){
 const p=await browser.newPage({viewport});let failedRequests=0;
 await p.route('**/assets/vfx/cazadora/*',async r=>{const m=r.request().url().match(/-(f\d)\.(png|webp)/);if(m&&missing.includes(m[1])){failedRequests++;await r.abort('failed');}else await r.continue();});
 await H.goto(p,site.url);await p.waitForFunction(()=>typeof drawSylvaRainZones==='function'&&typeof drawTrap==='function');
 await p.waitForFunction(m=>['f1','f2','f3'].every(k=>m.includes(k)||SYLVA_RAIN_READY[k])&&['f1','f2','f3','f4'].every(k=>m.includes(k)||SYLVA_TRAP_READY[k]),missing);
 const r=await p.evaluate(missing=>{
  state='menu';const out=[],images=[],errors=[];const old=window.artMipDraw;
  window.artMipDraw=function(img,...args){if(img.src&&/assets\/vfx\/cazadora/.test(img.src))images.push({src:img.src.split('/').pop(),finite:args.every(Number.isFinite),ready:img.complete&&img.naturalWidth>0});return old.apply(this,arguments);};
  const cv=document.getElementById('game');cv.width=390;cv.height=280;let renderCopies=[];
  for(const kind of ['trap','rain'])for(let f=1;f<=(kind==='trap'?4:3);f++){
   ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#18241a';ctx.fillRect(0,0,390,280);images.length=0;
   try{if(kind==='trap')drawTrap({kind:'forest_root',armTime:200*(1-(f-.5)/4),timer:5000,x:195,y:170,radius:70});else{sylvaRainZones=[{x:195,y:170,radius:80,timer:900*(1-(f-.5)/3),exploded:false}];drawSylvaRainZones();}}catch(e){errors.push({kind,f,error:String(e)});}
   let expect=null;for(let n=f;n>=1;n--)if(!missing.includes('f'+n)){expect=kind+'-f'+n+'.png';break;}
   const actual=images.map(x=>x.src.replace('.webp','.png'));out.push({kind,f,expected:expect,actual,ok:expect?actual.includes(expect)&&images.every(x=>x.finite&&x.ready):images.length===0});renderCopies.push({kind,f,png:cv.toDataURL()});
  }
  window.artMipDraw=old;return {checks:out,errors,renders:renderCopies};
 },missing);
 const name=`${viewport.width}-${missing.join('-')||'ready'}`;for(const im of r.renders){fs.writeFileSync(path.join(OUT,`${name}-${im.kind}${im.f}.png`),Buffer.from(im.png.split(',')[1],'base64'));delete im.png;}
 results.push({viewport,missing,failedRequests,...r});await p.close();
}
fs.writeFileSync(path.join(OUT,'loading.json'),JSON.stringify(results,null,2)+'\n');const fail=results.flatMap(r=>r.checks.filter(c=>!c.ok).map(c=>({missing:r.missing,...c})));console.log(JSON.stringify({checks:results.reduce((n,r)=>n+r.checks.length,0),fail,errors:results.flatMap(r=>r.errors)}));if(fail.length||results.some(r=>r.errors.length))process.exitCode=1;
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
