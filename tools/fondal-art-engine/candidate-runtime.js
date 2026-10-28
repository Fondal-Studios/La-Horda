#!/usr/bin/env node
'use strict';
// Browser-only candidate overlay: production files remain untouched until reviewed promotion.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const H=require('../lib/serve');
const {validateCandidate}=require('./production');
const ROOT=path.resolve(__dirname,'../..');
async function main(){
 const dir=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);fs.mkdirSync(out,{recursive:true});
 const delivery=validateCandidate(dir);assert(delivery.gate.ok,'Technical gate must pass first');
 assert.equal(delivery.target.key,'angel_corrompido','Only qualified pilot renderer supported');
 const report={status:'FAIL',candidate_sha256:delivery.candidate_sha256,baseline_sha256:delivery.baseline_sha256,registry_sha256:delivery.registry_sha256,errors:[],scope:'real enemy renderer with candidate HTTP overlay; not deployed, not full encounter or device certification'};
 const site=await H.startSite({});let browser;
 try{
  browser=await H.launch();
  for(const candidate of [false,true]){
   const page=await browser.newPage({viewport:{width:1280,height:720}});page.on('pageerror',e=>report.errors.push(e.message));
   if(candidate){
    const target=delivery.target;
    const original=fs.readFileSync(path.join(ROOT,target.meta_file),'utf8');
    const re=new RegExp('(const\\s+'+target.const+'\\s*=\\s*)(\\{.*?\\})(;\\s*$)','ms'),match=original.match(re);
    assert(match);const data=JSON.parse(match[2]);data[target.key].meta=delivery.meta;
    const updated=original.slice(0,match.index)+match[1]+JSON.stringify(data)+match[3]+original.slice(match.index+match[0].length);
    await page.route(url=>url.pathname.endsWith('/'+target.meta_file),route=>route.fulfill({contentType:'application/javascript',body:updated}));
    for(const ext of ['png','webp'])await page.route(url=>url.pathname.endsWith('/'+target.png.replace(/\.png$/,'.'+ext)),route=>route.fulfill({contentType:'image/'+ext,body:fs.readFileSync(path.join(dir,'atlas.'+ext))}));
   }
   await H.goto(page,site.url+'/index.html?lazy=0');
   await page.waitForFunction(()=>typeof ENEMY_ATLAS_PACK!=='undefined'&&ENEMY_ATLAS_PACK.angel_corrompido?.ready&&typeof DIR_ATLASES!=='undefined'&&DIR_ATLASES.tanque?.animAtlas.ready()&&typeof startRun==='function',null,{timeout:120000});
   const result=await page.evaluate(()=>{
    buildSprites();selectedClass='tanque';currentArena='infernal';startRun(1);state='paused';
    const key='angel_corrompido',P=ENEMY_ATLAS_PACK[key],e=spawnEnemy(key,false,false);enemies=enemies.filter(x=>x!==e);
    const mechanical=()=>JSON.stringify({hp:e.hp,maxHp:e.maxHp,radius:e.radius,dmg:e.dmg,speed:e.speed,base:ENEMY_BASE[key]});
    const before=mechanical();const cell=360,cols=6,sets=Object.entries(PIXRIG_ATLAS[key].meta.sets),count=sets.reduce((n,[,a])=>n+a.length,0);
    const cv=document.createElement('canvas');cv.width=cell*cols;cv.height=Math.ceil(count/cols)*cell;const g=cv.getContext('2d');
    const scratch=document.createElement('canvas');scratch.width=cell;scratch.height=cell;const q=scratch.getContext('2d'),saved=ctx;
    const issues=[],times=[];let index=0;
    try{
     for(const [clip,frames] of sets)for(let n=0;n<frames.length;n++){
      q.clearRect(0,0,cell,cell);q.imageSmoothingEnabled=false;ctx=q;
      Object.assign(e,{x:cell/2,y:cell-25,fx:1,fy:0,alive:true,attackAnim:0,hitFlash:0,packSet:clip,packDur:1000,packTimer:1000*(1-(n+.1)/frames.length),animT:0});
      const t=performance.now();const drawn=drawEnemyAtlasPack(e);times.push(performance.now()-t);
      const rgba=q.getImageData(0,0,cell,cell).data;
      if(!drawn||!rgba.some((v,i)=>i%4===3&&v))issues.push({clip,frame:n,error:'EMPTY_RENDER'});
      const x=(index%cols)*cell,y=Math.floor(index/cols)*cell;g.fillStyle='#302c36';g.fillRect(x,y,cell,cell);g.drawImage(scratch,x,y);
      g.fillStyle='#fff';g.font='14px monospace';g.fillText(clip+' '+n,x+8,y+18);
      // Caballero at the same world scale, not resized to fit the boss cell.
      ctx=g;g.save();g.translate(x+65,y+cell-25);g.imageSmoothingEnabled=false;const hero=makeHero('tanque',true,0,0);hero.fx=1;hero.fy=0;hero.moving=false;hero.animT=0;hero._codexSkin='';drawHeroBody(hero,hero.scale,false,false);g.restore();
      index++;
     }
    }finally{ctx=saved;}
    times.sort((a,b)=>a-b);return {png:cv.toDataURL('image/png'),checks:count,issues,mechanicsUnchanged:before===mechanical(),mechanical:before,
     meta:{w:P.fw,h:P.fh,refH:P.refH,anchor:P.anchor,hMul:P.hMul},image:[P.atlas.naturalWidth,P.atlas.naturalHeight],p95DrawMs:times[Math.floor(times.length*.95)]};
   });
   const png=result.png;delete result.png;fs.writeFileSync(path.join(out,candidate?'candidate.png':'baseline.png'),Buffer.from(png.split(',')[1],'base64'));
   report[candidate?'candidate':'baseline']=result;assert(result.mechanicsUnchanged);assert.equal(result.issues.length,0,JSON.stringify(result.issues));
   if(candidate){assert.equal(result.meta.w,delivery.meta.w);assert.equal(result.meta.h,delivery.meta.h);assert.equal(result.image[0],delivery.gate.width);assert.equal(result.image[1],delivery.gate.height);}
   await page.close();
  }
  assert.equal(report.candidate.mechanical,report.baseline.mechanical,'Art must not change mechanics');
  assert.equal(report.candidate.meta.refH,report.baseline.meta.refH);assert.equal(report.candidate.meta.hMul,report.baseline.meta.hMul);
  assert.equal(report.errors.length,0,JSON.stringify(report.errors));report.status='PASS';
 }catch(e){report.failure=e.message;throw e;}
 finally{fs.writeFileSync(path.join(out,'runtime.json'),JSON.stringify(report,null,2)+'\n');if(browser)await browser.close();await site.close();}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
