'use strict';
// Uses the unchanged Art Bible detector on every authored cell at its measured world scale.
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
(async()=>{
 const source=fs.readFileSync(path.join(H.ROOT,'tools/art/pixel-density.js'),'utf8');
 const section=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b));
 const detector=section('const CANON =','const FLOOR_SCALE')+section('function analyzeInPage','function walk')+section('function classify','(async () => {');
 const meta=JSON.parse(fs.readFileSync(path.join(H.ROOT,'assets/sprites/champions/nano_gm/codex-v2/meta.json')));
 const url='data:image/png;base64,'+fs.readFileSync(path.join(H.ROOT,'assets/sprites/champions/nano_gm/codex-v2/atlas.png')).toString('base64');
 const browser=await H.launch();try{
  const p=await browser.newPage();await p.addScriptTag({content:detector});
  const rows=await p.evaluate(async({url,meta})=>{const im=new Image();im.src=url;await im.decode();const cv=document.createElement('canvas');cv.width=meta.w;cv.height=meta.h;const ctx=cv.getContext('2d'),rows=[];
   for(let i=0;i<112;i++){ctx.clearRect(0,0,meta.w,meta.h);ctx.drawImage(im,i%meta.cols*meta.w,Math.floor(i/meta.cols)*meta.h,meta.w,meta.h,0,0,meta.w,meta.h);const metrics=analyzeInPage(ctx.getImageData(0,0,meta.w,meta.h).data,meta.w,meta.h,8);rows.push({frame:i,...metrics,...classify('campeones',metrics,.75,'atlas.png')});}return rows;
  },{url,meta});
  const failed=rows.filter(r=>r.issues.length),report={status:failed.length?'FIX':'TECHNICAL_SCREEN_PASS',worldUnitsPerPixel:.75,scope:'Native-pixel detector; visual style and animation review separate',rows};fs.writeFileSync(path.join(H.ROOT,'docs/art-gate/nano-gm-codex-v2/density.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,failed:failed.map(r=>({frame:r.frame,issues:r.issues}))}));if(failed.length)process.exitCode=1;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
