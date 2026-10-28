#!/usr/bin/env node
'use strict';
// Inspect the images actually decoded by the game, including WebP and indexed PNG.
// Findings are repair candidates, never aesthetic approvals or automatic replacements.
const fs=require('node:fs'),path=require('node:path');
const H=require('../lib/serve'),{inspectSheet}=require('./sheet-gate');
async function main(){
 const out=path.resolve(process.argv[2]||'/tmp/fondal-quality-audit.json');
 const report={schema:'fondal-art-engine.quality-audit.v1',generated_at:new Date().toISOString(),scope:'registered champion sheets, including skins and retained fallback packs; not maps, UI, VFX or all enemies',approvalClaimed:false,installed:0,packs:[],errors:[]};
 const site=await H.startSite();let browser;
 try{
  browser=await H.launch();const page=await browser.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  await H.goto(page,site.url+'/index.html?lazy=0');
  await page.waitForFunction(()=>typeof CHAMP_PACK!=='undefined'&&Object.keys(CHAMP_PACK).length&&Object.values(CHAMP_PACK).every(p=>p.ready||p.failed),null,{timeout:120000});
  const ids=await page.evaluate(()=>Object.keys(CHAMP_PACK));
  for(const id of ids){
   const data=await page.evaluate(id=>{
    const p=CHAMP_PACK[id],src=new URL(p.atlas.src).pathname.replace(/^\//,'');
    if(!p.ready)return {id,src,error:'LOAD_FAILED'};
    const cv=document.createElement('canvas');cv.width=p.atlas.naturalWidth;cv.height=p.atlas.naturalHeight;cv.getContext('2d').drawImage(p.atlas,0,0);
    return {id,src,meta:{w:p.fw,h:p.fh,cols:p.cols,refH:p.refH,anchor:p.anchor,sets:p.rawSets||p.sets},png:cv.toDataURL('image/png').split(',')[1]};
   },id);
   if(data.error){report.packs.push(data);continue;}
   try{
    const gate=inspectSheet(Buffer.from(data.png,'base64'),data.meta);
    report.packs.push({id,src:data.src,status:gate.status||'FIX',frames:gate.frames?.length||0,decodedImageSha256:gate.rgba_sha256,issues:gate.issues});
   }catch(e){report.packs.push({id,src:data.src,error:e.message});}
  }
  report.summary={packs:report.packs.length,technicalPass:report.packs.filter(p=>p.status==='TECHNICAL_PASS').length,needsReview:report.packs.filter(p=>p.status==='FIX').length,failed:report.packs.filter(p=>p.error).length,issuesByCode:{}};
  for(const p of report.packs)for(const i of p.issues||[])report.summary.issuesByCode[i.code]=(report.summary.issuesByCode[i.code]||0)+1;
  console.log(JSON.stringify(report.summary));
  if(report.errors.length||report.summary.failed)process.exitCode=1;
 }finally{
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
  if(browser)await browser.close();await site.close();
 }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
