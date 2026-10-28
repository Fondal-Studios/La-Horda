#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const H=require('../lib/serve');
async function main(){
 const out=path.resolve(process.argv[2]||'/tmp/fondal-codex-evidence');fs.mkdirSync(out,{recursive:true});
 const report={status:'FAIL',errors:[],scope:'Real hero renderer, base/skin/skill/death and decoded multiplayer snapshots; desktop Chromium'};
 const site=await H.startSite();let browser;
 try{
  browser=await H.launch();const page=await browser.newPage({viewport:{width:1000,height:700},serviceWorkers:'block'});
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.route('**/*',r=>new URL(r.request().url()).origin===site.url?r.continue():r.abort());
  await H.goto(page,site.url+'/?lazy=0');
  await page.waitForFunction(()=>typeof CODEX_GAMEPLAY_ART!=='undefined'&&Object.keys(CODEX_GAMEPLAY_ART).every(k=>CHAMP_PACK['codex_'+k]?.ready)&&Object.values(CHAMP_PACK).every(p=>p.ready||p.failed)&&typeof startRun==='function');
  const data=await page.evaluate(()=>{
   buildSprites();selectedClass='tanque';currentArena='bosque';startRun(1);state='paused';loop=function(){};
   const keys=Object.keys(CODEX_GAMEPLAY_ART),checks=[],images=[];
   const cv=document.createElement('canvas');cv.width=180;cv.height=140;const g=cv.getContext('2d',{willReadFrequently:true});
   const check=(name,ok)=>checks.push({name,ok:!!ok});
   const gameplay=h=>JSON.stringify([h.hp,h.maxHp,h.damage,h.speed,h.radius,h.scale,h.attackAnim,h.hurtTimer,h.spinTimer,h.dashFxTimer,h.growTimer]);
   function draw(h,death=false){
    const saved=ctx,old=champPackDrawFrame,calls=[];ctx=g;g.clearRect(0,0,180,140);g.save();g.translate(90,118);g.imageSmoothingEnabled=false;
    champPackDrawFrame=function(P,v,...args){calls.push({codex:P===CHAMP_PACK['codex_'+h.classKey],frame:v<0?~v:v});return old(P,v,...args);};
    try{if(death)drawChampPackDeath(h);else drawHeroBody(h,h.scale,false,false);}finally{ctx=saved;champPackDrawFrame=old;g.restore();}
    return {calls,pixels:Array.from(g.getImageData(0,0,180,140).data),image:cv.toDataURL()};
   }
   for(const key of keys){
    const P=CHAMP_PACK['codex_'+key];const h=makeHero(key,true,0,0);h._codexSkin=null;
    check(key+' world height preserved',Math.abs(champPackScale(P,h,2)*P.refH-(DIR_ATLASES[key]?DIR_ATLASES[key].targetHeight:h.radius*2.7*(2/h.scale)))<0.00001);
    for(const [name,fx,fy] of [['front',0,1],['side',1,0],['back',0,-1],['left',-1,0]]){
     for(const st of ['idle','walk','attack','cast','hit']){
      Object.assign(h,{fx,fy,moving:st==='walk',attackAnim:['attack','cast'].includes(st)?180:0,hurtTimer:st==='hit'?100:0,_packCastUntil:st==='cast'?Infinity:0,_pcuLocal:0,_pcuSeen:0,_aDur:360,_aPrev:360,animT:260});
      const before=gameplay(h),r=draw(h);check(key+' '+name+' '+st+' uses new art',r.calls.length===1&&r.calls[0].codex&&r.pixels.some((v,i)=>i%4===3&&v));check(key+' '+name+' '+st+' gameplay unchanged',before===gameplay(h));
      if(name==='front'||name==='side')images.push({key,label:name+' '+st,image:r.image});
      const guest=netDecode(_netDeltaOf({},h,true));guest.x=0;guest.y=0;guest._codexSkin=null;check(key+' guest '+name+' '+st,draw(guest).calls.some(c=>c.codex));
     }
    }
    Object.assign(h,{hurtTimer:0,attackAnim:0,moving:false,fx:0,fy:1});
    for(const skill of key==='tanque'?['dashFxTimer','spinTimer','growTimer']:[]){h[skill]=300;h.growMaxTimer=600;const before=gameplay(h),r=draw(h);check(key+' '+skill+' new art without mechanics changes',r.calls.some(c=>c.codex)&&before===gameplay(h));h[skill]=0;}
    for(const t of [0,170,340,510,800]){animNow=10000+t;h._deadAt=10000;const before=gameplay(h),r=draw(h,true);check(key+' death '+t,r.calls.length===1&&r.calls[0].codex&&before===gameplay(h));if(t===510)images.push({key,label:'death',image:r.image});}
    P.ready=false;try{check(key+' failed/loading art fallback visible',draw(h).pixels.some((v,i)=>i%4===3&&v));}finally{P.ready=true;}
   }
   return {checks,images};
  });
  report.checks=data.checks;
  // Exercise all skin definitions after lazy registration/loading.
  await page.evaluate(()=>{for(const [id,d] of Object.entries({...SET_SKINS,...CROMA_SKINS}))if(CODEX_GAMEPLAY_ART[d.champ])skinDefOf(id);});
  await page.waitForFunction(()=>Object.entries({...SET_SKINS,...CROMA_SKINS}).filter(([id,d])=>CODEX_GAMEPLAY_ART[d.champ]).every(([id])=>{const d=skinDefOf(id);return !d.packs||Object.values(d.packs).every(k=>CHAMP_PACK[k]?.ready);}),null,{timeout:120000});
  report.skins=await page.evaluate(()=>Object.entries({...SET_SKINS,...CROMA_SKINS}).filter(([id,d])=>CODEX_GAMEPLAY_ART[d.champ]).map(([id,d])=>{const h=makeHero(d.champ,true,0,0);h._codexSkin=id;return {id,baseOverrideExcluded:codexChampionPack(h)===null};}));
  const shot=await page.evaluate(async images=>{const c=document.createElement('canvas');c.width=990;c.height=Math.ceil(images.length/6)*150+20;const g=c.getContext('2d');g.fillStyle='#202029';g.fillRect(0,0,c.width,c.height);g.font='14px sans-serif';g.fillStyle='#efe4cb';for(let i=0;i<images.length;i++){const im=new Image();im.src=images[i].image;await im.decode();const x=(i%6)*165,y=Math.floor(i/6)*150;g.drawImage(im,x,y);g.fillText(images[i].key+' '+images[i].label,x+8,y+145);}return c.toDataURL();},data.images);
  fs.writeFileSync(path.join(out,'champions.png'),Buffer.from(shot.split(',')[1],'base64'));
  await page.evaluate(()=>{selectedClass='tanque';currentArena='bosque';startRun(1);state='paused';render();});
  await page.screenshot({path:path.join(out,'game.png')});
  assert.equal(report.checks.filter(c=>!c.ok).length,0,JSON.stringify(report.checks.filter(c=>!c.ok)));
  assert(report.skins.length>0&&report.skins.every(s=>s.baseOverrideExcluded));assert.equal(report.errors.length,0,JSON.stringify(report.errors));report.status='PASS';
 }catch(e){report.failure=e.message;throw e;}
 finally{fs.writeFileSync(path.join(out,'runtime.json'),JSON.stringify(report,null,2)+'\n');if(browser)await browser.close();await site.close();}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
