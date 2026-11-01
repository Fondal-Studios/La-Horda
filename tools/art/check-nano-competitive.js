'use strict';
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
(async()=>{const site=await H.startSite(),browser=await H.launch(),checks=[],errors=[];try{
 const p=await browser.newPage({viewport:{width:1280,height:900},serviceWorkers:'block'});p.on('pageerror',e=>errors.push(e.message));await p.route('**/*',r=>new URL(r.request().url()).origin===site.url?r.continue():r.abort());
 await p.addInitScript(()=>{window.nanoDraws=[];const orig=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(im,...a){if(this.canvas.id==='battle'&&im.src&&im.src.includes('/nano_gm/codex-v2/'))window.nanoDraws.push({rect:a.slice(0,4),flip:this.getTransform().a<0});return orig.call(this,im,...a);};});
 await p.goto(site.url+'/?legacy=1&lazy=1');await p.waitForFunction(()=>typeof cwGo==='function');
 await p.evaluate(()=>{loop=function(){};accountIdentity=()=>({founder:'nano'});save.tut=save.tut||{};save.tut.training=1;cwGo();});
 await p.locator('#champ').selectOption('nano_gm');await p.locator('#practice').click();await p.waitForFunction(()=>window.nanoDraws.length>0);
 for(const [key,dir] of [['d','right'],['a','left'],['w','up'],['s','down']]){
  await p.evaluate(()=>{window.nanoDraws=[];});await p.keyboard.down(key);await p.waitForTimeout(260);await p.keyboard.up(key);
  const r=await p.evaluate(dir=>{const a=CW_ATLAS.nano_gm,clip=a.animations['walk_'+dir];return {authored:!clip.flip&&clip.frames.length===4,seen:window.nanoDraws.some(d=>!d.flip&&clip.frames.some(i=>{const f=a.frames[i];return d.rect[0]===f.x&&d.rect[1]===f.y&&d.rect[2]===f.w&&d.rect[3]===f.h;}))};},dir);checks.push({name:'competitive walk '+dir,ok:r.authored&&r.seen,detail:r});
 }
 const out=path.join(H.ROOT,'docs/art-gate/nano-gm-codex-v2');await p.locator('#battle').screenshot({path:path.join(out,'competitive.png')});const report={status:checks.every(c=>c.ok)&&!errors.length?'PASS':'FAIL',checks,errors,scope:'Local competitive practice, four movement directions; not a multiplayer session'};fs.writeFileSync(path.join(out,'competitive.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(report.status!=='PASS')process.exitCode=1;
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
