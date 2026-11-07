#!/usr/bin/env node
'use strict';
// Actual index/asset loading and renderer in Chromium; RAF paused, not a played match.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const H=require('../../lib/serve'),R=require('./runtime');
const RENDER_SETTINGS=Object.freeze({normal:{drawScale:2},mip:{drawScale:1},glow:{drawScale:2},skin:{drawScale:2}});
// The diagnostic pauses game RAF: asset waits must poll independently of RAF.
async function waitForAssets(page){
 await page.waitForFunction(()=>typeof drawChampPack==='function'&&CHAMP_PACK.aelith?.ready&&typeof skinDefOf==='function',null,{timeout:120000,polling:50});
 await page.evaluate(()=>skinDefOf('aelith_alt1'));await page.waitForFunction(()=>{const d=skinDefOf('aelith_alt1');return d?.packs?.aelith&&CHAMP_PACK[d.packs.aelith]?.ready;},null,{timeout:120000,polling:50});
}
async function run(out=process.env.OUT||'/tmp/aelith-recovered-browser'){
 await R.verify();const site=await H.startSite();let browser;const errors=[];fs.mkdirSync(out,{recursive:true});
 try{browser=await H.launch();const page=await browser.newPage({viewport:{width:960,height:640},deviceScaleFactor:1});page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});await H.goto(page,site.url+'/index.html');
 await waitForAssets(page);
 const result=await page.evaluate((settings)=>{
  const base=CHAMP_PACK.aelith,skin=skinDefOf('aelith_alt1'),records=[],images=[],original=champPackDrawFrame,rec=save.champions.aelith,oldCroma=rec.croma,oldCosmetic=rec.cosmeticSkin,oldMip=Q6_ART.mip,oldGlow={...FX_GLOW},originalMip=_mipLevel;let traced,mipCalls=0;
  _mipLevel=function(...args){mipCalls++;return originalMip(...args);};
  champPackDrawFrame=function(P,v,...args){traced={cell:v,pack:P===base?'base':P===CHAMP_PACK[skin.packs.aelith]?'skin':'unexpected'};return original(P,v,...args);};rec.cosmeticSkin='';
  try{for(const mode of ['normal','mip','glow','skin']){Q6_ART.mip=mode==='mip';Object.assign(FX_GLOW,{on:mode==='glow',under:.3,add:.32});rec.croma=mode==='skin'?'aelith_alt1':null;
   const h={classKey:'aelith',x:160,y:240,radius:26,scale:2,fx:0,fy:-1,attackAnim:0,_packCastUntil:0,portCastState:'cast',equipment:{}};
   for(const t of [-105,0,105,210,315,420,525]){animNow=1000+t;h.attackAnim=t<0?0:Math.max(0,420-t);h._packCastUntil=t<0?0:1700000;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#292929';ctx.fillRect(0,0,canvas.width,canvas.height);traced=null;
    const beforeMip=mipCalls;const drawScale=settings[mode].drawScale;
    if(!drawChampPack('aelith',h,drawScale,1)||!traced)throw Error('actual renderer failed');const filename=mode+'-'+(t+105)+'.png';records.push({mode,time:t,drawScale,mipCalls:mipCalls-beforeMip,...traced});images.push({filename,data:canvas.toDataURL('image/png')});
   }
  }}finally{_mipLevel=originalMip;champPackDrawFrame=original;Q6_ART.mip=oldMip;Object.assign(FX_GLOW,oldGlow);rec.croma=oldCroma;rec.cosmeticSkin=oldCosmetic;}
  return {records,images,src:base.atlas.src,baseCastUp:base.sets.cast_up,skinCastUp:CHAMP_PACK[skin.packs.aelith].sets.cast_up};
 },RENDER_SETTINGS);
 assert.ok(result.records.filter(r=>r.mode==='mip').every(r=>r.mipCalls>0),'mip mode must execute actual downsample path');
 assert.ok(result.records.filter(r=>r.mode!=='mip').every(r=>r.mipCalls===0),'other modes must not claim mip execution');
 for(const mode of ['normal','mip','glow'])assert.deepEqual(result.records.filter(r=>r.mode===mode).map(r=>r.cell),[8,36,37,38,39,8,8]);assert.deepEqual(result.records.filter(r=>r.mode==='skin').map(r=>r.cell),[8,24,25,26,27,8,8]);assert.ok(result.records.filter(r=>r.mode==='skin').every(r=>r.pack==='skin'));assert.match(result.src,/aelith\/factory-b76f27906a1dacff0014848b630711fbb0022c4df476f284be6c94afb48bf5eb\/atlas\.(png|webp)(?:[?#]|$)/);
 for(const im of result.images)fs.writeFileSync(path.join(out,im.filename),Buffer.from(im.data.split(',')[1],'base64'));delete result.images;
 const report={...result,pageErrors:errors,status:errors.length?'FAIL_PAGE_ERRORS':'SCOPED_BROWSER_RENDERER_PASS_NOT_VISUAL_APPROVAL',approved:false,limitations:['Actual index loaded, RAF paused; direct finite-cast draw calls, not a played match','Skin selection is an isolated local test save; no purchase or account change','Known head/cape styling seam remains; no complete-hero quality approval']};fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));assert.deepEqual(errors,[],'page errors');console.log(JSON.stringify(report));return report;
 }finally{if(browser)await browser.close();await site.close();}
}
module.exports={run,waitForAssets,RENDER_SETTINGS};if(require.main===module)run().catch(e=>{console.error(e);process.exitCode=1;});
