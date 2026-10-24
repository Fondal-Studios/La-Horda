'use strict';
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
const OUT=path.resolve(process.env.OUT||'art-source/entregas/guerrero-kit-20261023/integracion-01');
(async()=>{const site=await H.startSite(),browser=await H.launch();fs.mkdirSync(OUT,{recursive:true});let results=[];try{
for(const viewport of [{width:390,height:844},{width:844,height:390}]){
 const p=await browser.newPage({viewport});
 if(process.env.BASELINE)await p.route('**/js/champions/asesino.js',r=>r.fulfill({contentType:'application/javascript',body:require('node:child_process').execFileSync('git',['show','ee29c489:js/champions/asesino.js'])}));
 await H.goto(p,site.url);await p.waitForFunction(()=>typeof drawTrap==='function'&&ASESINO_HAB_READY.trampa);
 const r=await p.evaluate(()=>{
  state='menu';const cv=document.getElementById('game');cv.width=390;cv.height=280;
  const rows=[],old=window.drawAnimFrameSized;let calls=[];
  window.drawAnimFrameSized=function(img,clip,n,...args){calls.push({src:img.src,frame:clip.frames[n],args});return old.apply(this,arguments);};
  const originalReady=ASESINO_HAB_READY.trampa;
  const cases=[['armed',{},true],['fade',{timer:600},true],['last',{timer:1},true],['arming',{armTime:1},false],['triggered',{triggered:true},false],['expired',{timer:0},false],['other',{src:{classKey:'tanque'}},false],['unknown',{src:null},false],['forest',{kind:'forest_root'},false],['cold',{},false]];
  for(const [name,mods,expected]of cases){
   ASESINO_HAB_READY.trampa=name!=='cold';calls=[];ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#18241a';ctx.fillRect(0,0,390,280);
   const tr={x:195,y:140,radius:60,timer:5000,armTime:0,triggered:false,src:{classKey:'guerrero'},...mods};const before=JSON.stringify(tr);let error=null;try{drawTrap(tr);}catch(e){error=String(e);}
   const own=calls.filter(c=>c.src.includes('/vfx/guerrero/trampa.'));
   rows.push({name,expected,actual:own.length,ok:own.length===(expected?1:0)&&!error&&before===JSON.stringify(tr),stateUnchanged:before===JSON.stringify(tr),calls:own,error,png:cv.toDataURL()});
  }
  ASESINO_HAB_READY.trampa=originalReady;window.drawAnimFrameSized=old;return rows;
 });
 for(const row of r){fs.writeFileSync(path.join(OUT,`${viewport.width}-${row.name}.png`),Buffer.from(row.png.split(',')[1],'base64'));delete row.png;}results.push({viewport,rows:r});await p.close();
}
fs.writeFileSync(path.join(OUT,'checks.json'),JSON.stringify(results,null,2));let fail=results.flatMap(x=>x.rows.filter(r=>!r.ok));console.log(JSON.stringify({checks:results.reduce((n,x)=>n+x.rows.length,0),fail}));if(fail.length)process.exitCode=1;
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
