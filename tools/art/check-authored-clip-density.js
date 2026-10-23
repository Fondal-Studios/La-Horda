'use strict';
// Explicit-length clip screening with unchanged canonical detector. The 36-frame sheet gate stays strict.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{chromium}=require('playwright');
(async()=>{
 const [input,output,scaleText='1',countText='4']=process.argv.slice(2),scale=Number(scaleText),count=Number(countText);
 if(!input||!output||!Number.isFinite(scale)||scale<=0||!Number.isInteger(count)||count<1||count>36)throw Error('Usage: node check-authored-density.js atlas.png report.json [worldUnitsPerPixel] [expectedFrames=4]');
 const bytes=fs.readFileSync(input),source=fs.readFileSync(path.join(__dirname,'pixel-density.js'),'utf8');
 function section(a,b){const x=source.indexOf(a),y=source.indexOf(b);if(x<0||y<=x)throw Error('Canonical detector layout changed');return source.slice(x,y);}
 const detector=section('const CANON =','const FLOOR_SCALE')+section('function analyzeInPage','function walk')+section('function classify','(async () => {');
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox']});
 try{
  const page=await browser.newPage();await page.addScriptTag({content:detector});
  const rows=await page.evaluate(async({url,scale,count})=>{
   const image=new Image();image.src=url;await image.decode();if(image.width!==112*count||image.height!==112)throw Error('Unexpected clip dimensions for requested frame count');
   const cv=document.createElement('canvas');cv.width=cv.height=112;const ctx=cv.getContext('2d'),rows=[];
   for(let frame=0;frame<count;frame++){
    ctx.clearRect(0,0,112,112);ctx.drawImage(image,frame*112,0,112,112,0,0,112,112);
    const metrics=analyzeInPage(ctx.getImageData(0,0,112,112).data,112,112,8);
    const result=classify('campeones',metrics,scale,'atlas.png');
    if(!metrics.opaque)result.issues.push('FRAME_VACIO');
    rows.push({frame,...metrics,...result});
   }return rows;
  },{url:'data:image/png;base64,'+bytes.toString('base64'),scale,count});
  const failed=rows.filter(r=>r.issues.length),report={status:failed.length?'FIX':'TECHNICAL_SCREEN_PASS',scope:'Explicit-length component native screening only; runtime scale and visual/animation approval still required',input,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),scale,failedFrames:failed.map(r=>r.frame),rows};
  fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({input,status:report.status,failedFrames:report.failedFrames}));if(failed.length)process.exitCode=1;
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
