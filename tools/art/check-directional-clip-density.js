'use strict';
// Explicit grid screening with the canonical pixel-density detector.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{chromium}=require('playwright');
(async()=>{
 const [input,output,cellWText,cellHText,colsText,rowsText,scaleText='1']=process.argv.slice(2);
 const cellW=Number(cellWText),cellH=Number(cellHText),cols=Number(colsText),rowsCount=Number(rowsText),scale=Number(scaleText);
 if(!input||!output||![cellW,cellH,cols,rowsCount,scale].every(Number.isFinite)||![cellW,cellH,cols,rowsCount].every(Number.isInteger)||cellW<1||cellH<1||cols<1||rowsCount<1||scale<=0) throw Error('Usage: node check-directional-clip-density.js atlas.png report.json cellW cellH cols rows [worldUnitsPerPixel=1]');
 const bytes=fs.readFileSync(input),source=fs.readFileSync(path.join(__dirname,'pixel-density.js'),'utf8');
 function section(a,b){const x=source.indexOf(a),y=source.indexOf(b);if(x<0||y<=x)throw Error('Canonical detector layout changed');return source.slice(x,y);}
 const detector=section('const CANON =','const FLOOR_SCALE')+section('function analyzeInPage','function walk')+section('function classify','(async () => {');
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox']});
 try{
  const page=await browser.newPage();await page.addScriptTag({content:detector});
  const cells=await page.evaluate(async({url,cellW,cellH,cols,rowsCount,scale})=>{
   const image=new Image();image.src=url;await image.decode();
   if(image.width!==cellW*cols||image.height!==cellH*rowsCount)throw Error(`Unexpected grid ${image.width}x${image.height}; expected ${cellW*cols}x${cellH*rowsCount}`);
   const cv=document.createElement('canvas');cv.width=cellW;cv.height=cellH;const ctx=cv.getContext('2d'),out=[];
   for(let row=0;row<rowsCount;row++)for(let col=0;col<cols;col++){
    ctx.clearRect(0,0,cellW,cellH);ctx.drawImage(image,col*cellW,row*cellH,cellW,cellH,0,0,cellW,cellH);
    const metrics=analyzeInPage(ctx.getImageData(0,0,cellW,cellH).data,cellW,cellH,8);
    const result=classify('campeones',metrics,scale,'atlas.png');if(!metrics.opaque)result.issues.push('FRAME_VACIO');
    out.push({row,col,...metrics,...result});
   }return out;
  },{url:'data:image/png;base64,'+bytes.toString('base64'),cellW,cellH,cols,rowsCount,scale});
  const failed=cells.filter(r=>r.issues.length),report={status:failed.length?'FIX':'TECHNICAL_SCREEN_PASS',scope:'Grid cell native screening only; runtime scale and visual/animation approval still required',input,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),cellW,cellH,cols,rows:rowsCount,scale,failedCells:failed.map(r=>[r.row,r.col]),cells};
  fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({input,status:report.status,failedCells:report.failedCells}));if(failed.length)process.exitCode=1;
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
