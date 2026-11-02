'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),H=require('../lib/serve');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(ROOT,'docs/art-gate/guerrero-death');
(async()=>{
 const site=await H.startSite(),browser=await H.launch(),report={scope:'Original Guerrero four-frame death only; real renderer and decoded guest snapshots',checks:[],errors:[]};
 try{
  const pages=[];
  for(let i=0;i<2;i++){
   const c=await browser.newContext({viewport:{width:844,height:390},serviceWorkers:'block'});await c.route('**/*',r=>new URL(r.request().url()).origin===site.url?r.continue():r.abort());
   const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));await p.goto(site.url+'/?lazy=1');await p.waitForFunction(()=>typeof drawFallenHero==='function'&&typeof netDecode==='function');
   await p.evaluate(()=>{loop=function(){};for(const [id,d] of Object.entries({...SET_SKINS,...CROMA_SKINS}))if(d.champ==='guerrero')skinDefOf(id);assetsStartGroup('ch:guerrero');});
   await p.waitForFunction(()=>GUERRERO_IMG_READY&&CHAMP_PACK.guerrero_death?.ready&&Object.entries({...SET_SKINS,...CROMA_SKINS}).filter(([id,d])=>d.champ==='guerrero').every(([id])=>{const d=skinDefOf(id);return !d.packs||Object.values(d.packs).every(k=>CHAMP_PACK[k]?.ready);}));pages.push(p);
  }
  const r=await pages[0].evaluate(()=>{
   selectedClass='guerrero';currentArena='bosque';lobbyAllies=[];netMatch=null;divinaMode=false;startRun(1);state='paused';window.ART_GATE_NO_VFX=true;
   const D=CHAMP_PACK.guerrero_death,checks=[],snapshots=[],check=(name,ok)=>checks.push({name,ok:!!ok});
   const cv=document.createElement('canvas');cv.width=cv.height=220;const g=cv.getContext('2d',{willReadFrequently:true});
   function draw(h,fallen=true){const saved=ctx,orig=champPackDrawFrame,calls=[];ctx=g;g.clearRect(0,0,220,220);g.save();g.translate(110,175);g.imageSmoothingEnabled=false;
    champPackDrawFrame=function(P,v,...args){calls.push({death:P===D,frame:v<0?~v:v,alpha:args[4]});return orig.call(this,P,v,...args);};
    try{if(fallen)drawFallenHero(h);else drawHeroBody(h,h.scale,false,false);}finally{ctx=saved;champPackDrawFrame=orig;g.restore();}
    const data=g.getImageData(0,0,220,220).data;return {calls,visible:data.some((v,i)=>i%4===3&&v>40),pixels:Array.from(data)};
   }
   check('component metadata',D.fw===112&&D.fh===112&&D.cols===4&&D.refH===79&&D.anchor===106/112);
   check('master atlas not replaced by generic pack',!CHAMP_PACK.guerrero);
   const poses=[];
   for(const level of [1,39,40,60,90,99]){
    save.champions.guerrero.level=level;
    for(const dir of ['down','side','up','left'])for(let n=0;n<4;n++){
     const h=makeHero('guerrero',true,0,0);Object.assign(h,{_codexSkin:null,_deadAt:10000,alive:false,hp:0,_pdir:dir==='left'?'side':dir,_pleft:dir==='left'});animNow=10000+n*170;const d=draw(h);
     check('L'+level+' '+dir+' death '+n,d.visible&&d.calls.length===1&&d.calls[0].death&&d.calls[0].frame===n);
     if(level===1&&dir==='down')poses.push(cv.toDataURL());
    }
    const h=makeHero('guerrero',true,0,0);Object.assign(h,{_codexSkin:null,alive:false,hp:0,_deadAt:10000});animNow=13000;const d=draw(h);check('L'+level+' final pose holds',d.calls[0]?.frame===3&&d.calls[0]?.alpha===.55);
    const snapshot=_netDeltaOf({},h,true);check('L'+level+' local death clock not serialized',!('_deadAt' in snapshot));snapshots.push(snapshot);
    h.alive=true;h.hp=1;drawHero(h);check('L'+level+' revive clears death clock',!h._deadAt);
    h.alive=false;animNow=40000;draw(h);check('L'+level+' second death restarts',h._deadAt===40000);
   }
   const h=makeHero('guerrero',true,0,0);h._codexSkin=null;h.attackAnim=0;h.hurtTimer=0;h.moving=false;animNow=0;
   const standing=draw(h,false);check('living base remains visible without death pack',standing.visible&&standing.calls.every(c=>!c.death));const reference=cv.toDataURL();
   D.ready=false;try{check('living master pixels identical with supplement absent',JSON.stringify(draw(h,false).pixels)===JSON.stringify(standing.pixels));h._deadAt=10000;animNow=10500;const d=draw(h);check('unloaded supplement preserves fallback death',d.visible&&d.calls.every(c=>!c.death));}finally{D.ready=true;}
   for(const [id,d] of Object.entries({...SET_SKINS,...CROMA_SKINS}))if(d.champ==='guerrero'){
    h._codexSkin=id;h._deadAt=10000;animNow=10170;const result=draw(h);check('appearance retains own death '+id,result.visible&&result.calls.every(c=>!c.death));
   }
   return {checks,snapshots,poses,reference};
  });report.checks.push(...r.checks);
  report.checks.push(...await pages[1].evaluate(snapshots=>{const rows=[],saved=ctx,orig=champPackDrawFrame,cv=document.createElement('canvas');cv.width=cv.height=240;ctx=cv.getContext('2d');try{for(let i=0;i<snapshots.length;i++){const h=netDecode(snapshots[i]);h._codexSkin=null;h.x=h.y=120;const frames=[];champPackDrawFrame=(P,v,...args)=>{if(P===CHAMP_PACK.guerrero_death)frames.push(v);return orig.call(this,P,v,...args);};for(let n=0;n<4;n++){animNow=900000+n*170;drawFallenHero(h);}rows.push({name:'guest L'+[1,39,40,60,90,99][i],ok:JSON.stringify(frames)==='[0,1,2,3]'&&h._deadAt===900000});}}finally{ctx=saved;champPackDrawFrame=orig;}return rows;},r.snapshots));
  const preview=await pages[0].evaluate(async images=>{const cv=document.createElement('canvas');cv.width=1100;cv.height=260;const g=cv.getContext('2d');g.fillStyle='#141822';g.fillRect(0,0,1100,260);g.font='17px sans-serif';g.fillStyle='#f0e5cd';g.fillText('Guerrero · referencia original y cuatro cuadros de caída',18,25);for(let i=0;i<images.length;i++){const im=new Image();im.src=images[i];await im.decode();g.drawImage(im,i*220,20);g.fillText(i?'Caída '+i:'Original',i*220+15,248);}return cv.toDataURL();},[r.reference,...r.poses]);
  fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,'runtime-comparison.png'),Buffer.from(preview.split(',')[1],'base64'));
  report.masterAtlasSha256=crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,'assets/sprites/champions/guerrero/atlas.png'))).digest('hex');
  report.checks.push({name:'master atlas bytes unchanged',ok:report.masterAtlasSha256==='d927c2f36c86d633d74090ae8af6d3ca3d687a6579c7744f6de178d364973b3f'});
  report.status=report.errors.length||report.checks.some(c=>!c.ok)?'FAIL':'PASS';fs.writeFileSync(path.join(OUT,'runtime.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:report.checks.length,failed:report.checks.filter(c=>!c.ok),errors:report.errors}));if(report.status!=='PASS')process.exitCode=1;
 }finally{await browser.close();await site.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
