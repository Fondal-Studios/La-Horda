'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),H=require('../lib/serve');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(ROOT,'docs/art-gate/tanque-hurt');
(async()=>{
 const site=await H.startSite(),browser=await H.launch(),report={scope:'Base Caballero hurt, actual renderer and decoded guest snapshots; no real relay',checks:[],errors:[]};
 try{
  const pages=[];
  for(let i=0;i<2;i++){
   const c=await browser.newContext({viewport:{width:844,height:390},serviceWorkers:'block'});
   await c.route('**/*',r=>new URL(r.request().url()).origin===site.url?r.continue():r.abort());
   const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));await p.goto(site.url+'/?lazy=1');await p.waitForFunction(()=>typeof drawKnightHurt==='function'&&typeof netDecode==='function');
   await p.evaluate(()=>{loop=function(){};for(const [id,d] of Object.entries({...SET_SKINS,...CROMA_SKINS}))if(d.champ==='tanque')skinDefOf(id);assetsStartGroup('ch:tanque');});
   await p.waitForFunction(()=>TANQUE_IMG_READY&&CHAMP_PACK.tanque_hurt?.ready&&Object.entries({...SET_SKINS,...CROMA_SKINS}).filter(([id,d])=>d.champ==='tanque').every(([id])=>{const d=skinDefOf(id);return !d.packs||Object.values(d.packs).every(k=>CHAMP_PACK[k]?.ready);}));pages.push(p);
  }
  const r=await pages[0].evaluate(()=>{
   selectedClass='tanque';currentArena='bosque';lobbyAllies=[];netMatch=null;divinaMode=false;startRun(1);state='paused';window.ART_GATE_NO_VFX=true;
   const P=CHAMP_PACK.tanque_hurt,checks=[],snapshots=[],images=[],check=(name,ok)=>checks.push({name,ok:!!ok});
   const cv=document.createElement('canvas');cv.width=cv.height=170;const g=cv.getContext('2d',{willReadFrequently:true});
   function draw(h){const saved=ctx,orig=champPackDrawFrame,calls=[];ctx=g;g.clearRect(0,0,170,170);g.save();g.translate(85,130);g.imageSmoothingEnabled=false;
    champPackDrawFrame=function(pack,v,...args){calls.push({hurt:pack===P,frame:v<0?~v:v,flip:(v<0)!==!!args[3]});return orig.call(this,pack,v,...args);};
    try{drawHeroBody(h,h.scale,false,false);}finally{ctx=saved;champPackDrawFrame=orig;g.restore();}
    const pixels=Array.from(g.getImageData(0,0,170,170).data);return{calls,pixels,visible:pixels.some((v,i)=>i%4===3&&v>40)};
   }
   check('metadata',P.cols===6&&P.fw===112&&P.fh===112&&P.refH===71&&P.anchor===106/112);
   for(const level of [1,39,40,60,90,99]){
    save.champions.tanque.level=level;
    for(const [dir,fx,fy,offset,flip] of [['down',0,1,0,false],['right',1,0,2,false],['up',0,-1,4,false],['left',-1,0,2,true]]){
     for(const [timer,n] of [[160,0],[81,0],[80,1],[1,1]]){
      const h=makeHero('tanque',true,0,0);Object.assign(h,{_codexSkin:null,fx,fy,hurtTimer:timer,attackAnim:0,moving:false});const before=JSON.stringify({hp:h.hp,damage:h.damage,speed:h.speed,hurtTimer:h.hurtTimer});const d=draw(h);
      check('L'+level+' '+dir+' hurt '+timer,d.visible&&d.calls.length===1&&d.calls[0].hurt&&d.calls[0].frame===offset+n&&d.calls[0].flip===flip);
      check('L'+level+' '+dir+' gameplay unchanged '+timer,before===JSON.stringify({hp:h.hp,damage:h.damage,speed:h.speed,hurtTimer:h.hurtTimer}));
      if(timer===160)snapshots.push({level,dir,offset,flip,data:_netDeltaOf({},h,true)});
      if(level===1&&(timer===160||timer===80))images.push({label:dir+' '+n,data:cv.toDataURL()});
     }
    }
   }
   const h=makeHero('tanque',true,0,0);Object.assign(h,{_codexSkin:null,fx:0,fy:1,hurtTimer:0,attackAnim:0,moving:false});
   for(const state of [{hurtTimer:0},{hurtTimer:0,moving:true},{hurtTimer:0,moving:false,attackAnim:200}]){
    Object.assign(h,state);const d=draw(h);P.ready=false;try{check('unhurt renderer identical '+JSON.stringify(state),JSON.stringify(d.pixels)===JSON.stringify(draw(h).pixels));}finally{P.ready=true;}
   }
   h.attackAnim=0;h.hurtTimer=160;P.ready=false;try{const d=draw(h);check('loading fallback visible',d.visible&&d.calls.every(x=>!x.hurt));}finally{P.ready=true;}
   for(const [id,d] of Object.entries({...SET_SKINS,...CROMA_SKINS}))if(d.champ==='tanque'){
    h._codexSkin=id;const a=draw(h);P.ready=false;try{check('skin preserved '+id,a.visible&&a.calls.every(x=>!x.hurt)&&JSON.stringify(a.pixels)===JSON.stringify(draw(h).pixels));}finally{P.ready=true;}
   }
   h._codexSkin=null;
   for(const state of [{dashFxTimer:500},{spinTimer:300,spinMaxTimer:600},{growTimer:300,growMaxTimer:600}]){
    Object.assign(h,{dashFxTimer:0,spinTimer:0,growTimer:0},state);const d=draw(h);check('ability retains priority '+JSON.stringify(state),d.calls.every(x=>!x.hurt));
   }
   return{checks,snapshots,images};
  });report.checks.push(...r.checks);
  report.checks.push(...await pages[1].evaluate(rows=>{const checks=[],old=champPackDrawFrame;try{for(const row of rows){const h=netDecode(row.data);h._codexSkin=null;const calls=[];champPackDrawFrame=(P,v,x,y,s,f)=>calls.push({hurt:P===CHAMP_PACK.tanque_hurt,frame:v<0?~v:v,flip:(v<0)!==!!f});drawHeroBody(h,h.scale,false,false);checks.push({name:'guest L'+row.level+' '+row.dir,ok:h.hurtTimer===160&&calls.length===1&&calls[0].hurt&&calls[0].frame===row.offset&&calls[0].flip===row.flip});}}finally{champPackDrawFrame=old;}return checks;},r.snapshots));
  const preview=await pages[0].evaluate(async images=>{const cv=document.createElement('canvas');cv.width=680;cv.height=380;const g=cv.getContext('2d');g.fillStyle='#141822';g.fillRect(0,0,cv.width,cv.height);g.font='16px sans-serif';g.fillStyle='#f0e5cd';g.fillText('Caballero · impacto y recuperación en cuatro direcciones',12,22);for(let i=0;i<images.length;i++){const im=new Image();im.src=images[i].data;await im.decode();const x=(i%4)*170,y=Math.floor(i/4)*175+25;g.drawImage(im,x,y);g.fillText(images[i].label,x+15,y+160);}return cv.toDataURL();},r.images);
  fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,'runtime-comparison.png'),Buffer.from(preview.split(',')[1],'base64'));
  report.checks.push({name:'original master preserved',ok:crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,'assets/sprites/champions/tanque/atlas.png'))).digest('hex')==='109c4766dc9fb979c026ed6a12d99079ef58e4f0fd18d91d0b64da6829a4df90'});
  report.status=report.errors.length||report.checks.some(c=>!c.ok)?'FAIL':'PASS';fs.writeFileSync(path.join(OUT,'runtime.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:report.checks.length,failed:report.checks.filter(c=>!c.ok),errors:report.errors}));if(report.status!=='PASS')process.exitCode=1;
 }finally{await browser.close();await site.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
