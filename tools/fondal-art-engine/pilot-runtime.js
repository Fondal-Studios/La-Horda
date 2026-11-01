#!/usr/bin/env node
'use strict';
// Actual renderer evidence for the serial Sylva + Escarcha pilot. Optional staged
// atlases are served only to this isolated browser; never modify runtime files.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const H=require('../lib/serve'),{readContract,ROOT}=require('../factory/s0f/contract');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
async function main(){
 const args=process.argv.slice(2),val=(k,d)=>{const i=args.indexOf(k);return i<0?d:args[i+1];},out=path.resolve(val('--out','/tmp/fondal-pilot-runtime'));fs.mkdirSync(out,{recursive:true});
 const repoRoot=fs.realpathSync(path.resolve(val('--repo-root',ROOT))),repoSHA=execFileSync('git',['rev-parse','HEAD'],{cwd:repoRoot,encoding:'utf8'}).trim();
 const expectedSHA=val('--expected-main-sha',null);if(expectedSHA)assert.equal(repoSHA,expectedSHA,'Main worktree SHA differs from pinned fetch');
 const specs=[{label:'base',id:'cazadora',skin:null,dir:val('--base-run-dir',null)},{label:'escarcha',id:'cazadora',skin:'cazadora_escarcha',dir:val('--skin-run-dir',null)}];
 for(const spec of specs){spec.contract=readContract(spec.id,{root:repoRoot,skin:spec.skin});assert.equal(spec.contract.kind,'atlas');spec.file=spec.dir?path.join(path.resolve(spec.dir),'atlas.png'):path.join(repoRoot,spec.contract.atlas);spec.sha256=hash(spec.file);if(spec.dir){const pinned=JSON.parse(fs.readFileSync(path.join(spec.dir,'contract.json')));assert.deepEqual(pinned,spec.contract,'Staged contract drift');}}
 const report={status:'FAIL',repoRoot,repoSHA,mainSHA:expectedSHA,scope:'Real desktop Chromium game renderer; optional isolated candidate interception, never live installation or physical device certification',variants:specs.map(s=>({label:s.label,sha256:s.sha256,candidate:!!s.dir,atlas:s.contract.atlas,cell:s.contract.cell,cols:s.contract.cols,frames:s.contract.frames})),errors:[]};
 const site=await H.startSite({root:repoRoot,envUrl:[]});let browser;
 try{
  browser=await H.launch();const page=await browser.newPage({viewport:{width:1000,height:700},serviceWorkers:'block'});page.on('pageerror',e=>report.errors.push(e.message));
  await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin!==site.url)return route.abort();const replacement=specs.find(s=>s.dir&&u.pathname==='/'+s.contract.atlas);return replacement?route.fulfill({path:replacement.file,contentType:'image/png'}):route.continue();});
  await H.goto(page,site.url+'/?lazy=0');await page.waitForFunction(()=>typeof CHAMP_PACK!=='undefined'&&CHAMP_PACK.cazadora?.ready&&typeof skinDefOf==='function');
  await page.evaluate(()=>skinDefOf('cazadora_escarcha'));await page.waitForFunction(()=>CHAMP_PACK.croma_cazadora_escarcha?.ready);
  const result=await page.evaluate(()=>{
   buildSprites();selectedClass='cazadora';currentArena='bosque';startRun(1);state='paused';loop=function(){};
   const images=[],checks=[];const canvas=document.createElement('canvas');canvas.width=192;canvas.height=180;const g=canvas.getContext('2d',{willReadFrequently:true});
   for(const [variant,skin,key] of [['base',null,'cazadora'],['escarcha','cazadora_escarcha','croma_cazadora_escarcha']]){
    const P=CHAMP_PACK[key],h=makeHero('cazadora',true,0,0);h._codexSkin=skin;
    for(const [clip,frames] of Object.entries(P.sets))for(const frame of frames){const saved=ctx;ctx=g;g.clearRect(0,0,192,180);g.imageSmoothingEnabled=false;try{champPackDrawFrame(P,frame,96,155,Math.min(1,120/P.refH),false,1);}finally{ctx=saved;}checks.push({variant,clip,frame,nonempty:g.getImageData(0,0,192,180).data.some((v,i)=>i%4===3&&v>0)});}
    for(const [facing,fx,fy] of [['front',0,1],['side',1,0],['back',0,-1],['left',-1,0]])for(const action of ['idle','walk','attack','cast','hit','death']){
     Object.assign(h,{fx,fy,moving:action==='walk',attackAnim:['attack','cast'].includes(action)?180:0,hurtTimer:action==='hit'?100:0,_packCastUntil:action==='cast'?Infinity:0,_pcuLocal:0,_pcuSeen:0,_aDur:360,_aPrev:360,animT:260});
     const saved=ctx,draw=champPackDrawFrame,calls=[];ctx=g;g.clearRect(0,0,192,180);g.save();g.translate(96,150);g.imageSmoothingEnabled=false;champPackDrawFrame=function(pack,...a){calls.push(pack===P);return draw(pack,...a);};
     try{if(action==='death'){animNow=10510;h._deadAt=10000;drawChampPackDeath(h);}else drawHeroBody(h,h.scale,false,false);}finally{champPackDrawFrame=draw;ctx=saved;g.restore();}
     checks.push({variant,facing,action,correctPack:calls.includes(true),nonempty:g.getImageData(0,0,192,180).data.some((v,i)=>i%4===3&&v>0)});images.push({label:variant+' '+facing+' '+action,image:canvas.toDataURL()});
    }
   }
   return {checks,images};
  });
  report.checks=result.checks;
  const sheet=await page.evaluate(async images=>{const c=document.createElement('canvas');c.width=1152;c.height=Math.ceil(images.length/6)*208;const g=c.getContext('2d');g.fillStyle='#24272c';g.fillRect(0,0,c.width,c.height);g.fillStyle='#faf1d5';g.font='12px sans-serif';for(let i=0;i<images.length;i++){const im=new Image();im.src=images[i].image;await im.decode();const x=i%6*192,y=Math.floor(i/6)*208;g.drawImage(im,x,y);g.fillText(images[i].label,x+4,y+195);}return c.toDataURL();},result.images);
  fs.writeFileSync(path.join(out,'pilot-rendered-contact-sheet.png'),Buffer.from(sheet.split(',')[1],'base64'));
  for(const skin of [null,'cazadora_escarcha']){await page.evaluate(s=>{player._codexSkin=s;render();},skin);await page.screenshot({path:path.join(out,skin?'escarcha-in-game.png':'sylva-in-game.png')});}
  assert.equal(report.errors.length,0,JSON.stringify(report.errors));assert.equal(result.checks.filter(c=>!c.nonempty||c.correctPack===false).length,0,JSON.stringify(result.checks.filter(c=>!c.nonempty||c.correctPack===false)));report.status='PASS';
 }catch(e){report.failure=e.message;throw e;}finally{fs.writeFileSync(path.join(out,'pilot-runtime.json'),JSON.stringify(report,null,2)+'\n');if(browser)await browser.close();await site.close();}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
