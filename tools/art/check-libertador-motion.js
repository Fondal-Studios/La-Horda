'use strict';
// Real drawHeroBody, lazy loader and guest snapshots. No online account or wallet edits.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),H=require('../lib/serve');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(ROOT,'docs/art-gate/libertador-motion');
(async()=>{
 const site=await H.startSite(),browser=await H.launch(),report={scope:'Base locomotion only; preserved specialized atlas and cosmetics',checks:[],errors:[]};
 try{
  const pages=[];
  for(let i=0;i<2;i++){
   const c=await browser.newContext({viewport:{width:844,height:390},serviceWorkers:'block'});
   await c.route('**/*',r=>new URL(r.request().url()).origin===site.url?r.continue():r.abort());
   const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));
   await p.goto(site.url+'/?lazy=1');await p.waitForFunction(()=>typeof drawLibertador==='function'&&typeof netDecode==='function');
   await p.evaluate(()=>{loop=function(){};assetsStartGroup('ch:libertador');assetsStartGroup('ch:tanque');for(const id of ['granadero','libertador_escarcha','libertador_ancestral'])skinDefOf(id);assetsStartGroup('ch:libertador');});
   await p.waitForFunction(()=>['libertador','libertador_motion','libertador_horse','libertador_death'].every(k=>CHAMP_PACK[k]?.ready)&&['granadero','libertador_escarcha','libertador_ancestral'].every(id=>CHAMP_PACK[skinDefOf(id).packs.libertador]?.ready));pages.push(p);
  }
  const r=await pages[0].evaluate(()=>{
   selectedClass='libertador';currentArena='bosque';lobbyAllies=[];netMatch=null;divinaMode=false;startRun(1);state='paused';window.ART_GATE_NO_VFX=true;
   const checks=[],snapshots=[],check=(name,ok)=>checks.push({name,ok:!!ok});
   const M=CHAMP_PACK.libertador_motion,B=CHAMP_PACK.libertador,H=CHAMP_PACK.libertador_horse;
   const cv=document.createElement('canvas');cv.width=cv.height=240;const g=cv.getContext('2d',{willReadFrequently:true});
   function draw(h){const saved=ctx,orig=champPackDrawFrame,calls=[];ctx=g;g.clearRect(0,0,240,240);g.save();g.translate(120,190);g.imageSmoothingEnabled=false;
    champPackDrawFrame=function(P,v,...args){calls.push({pack:P===M?'motion':P===B?'base':P===H?'horse':'appearance',frame:v<0?~v:v,flip:(v<0)!==!!args[3]});return orig.call(this,P,v,...args);};
    try{drawHeroBody(h,h.scale,false,false);}finally{ctx=saved;champPackDrawFrame=orig;g.restore();}
    return {calls,visible:g.getImageData(0,0,240,240).data.some((v,i)=>i%4===3&&v>40)};
   }
   check('12 authored locomotion frames',M.cols===12&&M.fw===112&&M.fh===112&&M.atlas.naturalWidth===1344&&M.atlas.naturalHeight===112);
   const dirs=[['front',0,1,0,false],['right',1,0,4,false],['back',0,-1,8,false],['left',-1,0,4,true]];
   for(const level of [1,39,40,60,90,99]){
    save.champions.libertador.level=level;
    for(const [dir,fx,fy,offset,flip] of dirs)for(let frame=0;frame<4;frame++){
     const h=makeHero('libertador',true,0,0);Object.assign(h,{_codexSkin:null,fx,fy,moving:true,animT:frame*130,attackAnim:0,hurtTimer:0});animNow=frame*230;
     const before=[h.radius,h.hp,h.maxHp,h.speed,h.basicCd],d=draw(h);
     check('L'+level+' walk '+dir+' '+frame,d.visible&&d.calls.length===1&&d.calls[0].pack==='motion'&&d.calls[0].frame===offset+frame&&d.calls[0].flip===flip);
     check('L'+level+' draw preserves gameplay '+dir+' '+frame,JSON.stringify(before)===JSON.stringify([h.radius,h.hp,h.maxHp,h.speed,h.basicCd]));
     if(frame===0)snapshots.push({level,dir,offset,flip,data:_netDeltaOf({},h,true)});
    }
   }
   for(const [dir,fx,fy,offset,flip] of dirs)for(let frame=0;frame<4;frame++){
    const actor=makeHero('libertador',true,0,0);Object.assign(actor,{_codexSkin:null,fx,fy,moving:false,attackAnim:0,hurtTimer:0});animNow=frame*230;
    const d=draw(actor),expected=offset+(dir==='front'?frame:0);
    check('idle '+dir+' '+frame,d.visible&&d.calls.length===1&&d.calls[0].pack==='motion'&&d.calls[0].frame===expected&&d.calls[0].flip===flip);
   }
   const h=makeHero('libertador',true,0,0);h._codexSkin=null;
   const reset=()=>Object.assign(h,{smPhase:null,smMounted:false,smBayoFinishTimer:0,smBayoImpTimer:0,smCabralFxTimer:0,smCmdTimer:0,attackAnim:0,basicCd:0,hurtTimer:0,moving:false,_codexPack:null,_codexSet:null,fx:1,fy:0});
   for(const [clip,fields] of [['ult_cast',{smPhase:'ultcast'}],['bayo_emb',{smPhase:'bayo'}],['bayo_rem',{smBayoFinishTimer:100}],['bayo_imp',{smBayoImpTimer:100}],['cabral',{smCabralFxTimer:100}],['command',{smCmdTimer:100}],['fire',{attackAnim:120,smAtkTotal:240}],['reload',{basicCd:120,smReloadTotal:240}]]){
    reset();Object.assign(h,fields);const d=draw(h);check('preserved '+clip,d.visible&&d.calls.some(c=>c.pack==='base'&&B.sets[clip].includes(c.frame)));
   }
   for(const [clip,fields] of [['mount',{smPhase:'mount',smPhaseTimer:100}],['dismount',{smPhase:'dismount',smPhaseTimer:100}],['charge',{smPhase:'charge'}],['m_atk',{smMounted:true,attackAnim:100}],['m_run',{smMounted:true,moving:true}],['m_idle',{smMounted:true}]]){
    reset();Object.assign(h,fields);const d=draw(h);check('preserved horse '+clip,d.visible&&d.calls.some(c=>c.pack==='horse'&&H.sets[clip].includes(c.frame)));
   }
   for(const id of ['granadero','libertador_escarcha','libertador_ancestral'])for(const moving of [false,true]){
    reset();h._codexSkin=id;h.moving=moving;check('appearance retained '+id+' '+moving,draw(h).calls.every(c=>c.pack==='appearance'));}
   h._codexSkin=null;reset();M.ready=false;try{const d=draw(h);check('unloaded supplement falls back',d.visible&&d.calls.every(c=>c.pack==='base'));}finally{M.ready=true;}
   for(const clip of ['fire','reload','command']){reset();h._codexSet=clip;h._codexT=0;check('named preview '+clip,draw(h).calls.every(c=>c.pack==='base'&&B.sets[clip].includes(c.frame)));}
   reset();h.attackAnim=120;h.moving=true;check('moving attack retains existing animation',draw(h).calls.every(c=>c.pack==='base'));
   reset();h.hurtTimer=100;check('hit retains existing animation',draw(h).calls.every(c=>c.pack==='base'));
   // Actual engine frames, same world zoom. Top row is the unchanged master reference.
   const sheet=document.createElement('canvas');sheet.width=960;sheet.height=780;const sc=sheet.getContext('2d');sc.fillStyle='#141822';sc.fillRect(0,0,960,780);sc.font='16px sans-serif';sc.fillStyle='#f0e5cd';sc.fillText('Libertador · movimiento base / referencia Caballero',20,25);
   const rows=[['Caballero','tanque',false,false],['Atlas previo','libertador',false,true],['Actual','libertador',false,false]];
   rows.forEach(([label,key,moving,old],row)=>{dirs.forEach(([dir,fx,fy],col)=>{const actor=makeHero(key,true,0,0);Object.assign(actor,{_codexSkin:null,fx,fy,moving,animT:0,attackAnim:0,hurtTimer:0});animNow=0;if(old)M.ready=false;try{draw(actor);}finally{M.ready=true;}sc.drawImage(cv,col*240,30+row*240);sc.fillStyle='#f0e5cd';sc.fillText(label+' · '+dir,col*240+14,65+row*240);});});
   const film=[];for(let n=0;n<4;n++){const frame=document.createElement('canvas');frame.width=960;frame.height=240;const fg=frame.getContext('2d');fg.fillStyle='#141822';fg.fillRect(0,0,960,240);dirs.forEach(([dir,fx,fy],i)=>{reset();Object.assign(h,{fx,fy,moving:true,animT:n*130});animNow=n*230;draw(h);fg.drawImage(cv,i*240,0);});film.push(frame.toDataURL('image/png'));}
   return {checks,snapshots,preview:sheet.toDataURL('image/png'),film};
  });
  report.checks.push(...r.checks);
  report.checks.push(...await pages[1].evaluate(rows=>{const checks=[],old=champPackDrawFrame;try{for(const {level,dir,offset,flip,data} of rows){const h=netDecode(data);Object.assign(h,{x:0,y:0,_codexSkin:null,moving:true,animT:0,attackAnim:0,hurtTimer:0});const calls=[];champPackDrawFrame=(P,v,x,y,s,f)=>calls.push({motion:P===CHAMP_PACK.libertador_motion,frame:v<0?~v:v,flip:(v<0)!==!!f});drawLibertador(h,h.scale,1);checks.push({name:'guest L'+level+' '+dir,ok:calls.length===1&&calls[0].motion&&calls[0].frame===offset&&calls[0].flip===flip});}}finally{champPackDrawFrame=old;}return checks;},r.snapshots));
  fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,'runtime-comparison.png'),Buffer.from(r.preview.split(',')[1],'base64'));
  r.film.forEach((data,n)=>fs.writeFileSync(path.join(OUT,'walk-'+n+'.png'),Buffer.from(data.split(',')[1],'base64')));
  for(const [file,hash] of [['atlas.png','8e08a247875cfb2c2b223fe56c0fb20cbaaeeb673587f8a5d919d85299b84411'],['horse.png','9025699358a17bfea7f6a502f8534137bbde17d521e85ebd3b54025b315d6a01']])report.checks.push({name:'original bytes '+file,ok:crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,'assets/sprites/champions/libertador/v2',file))).digest('hex')===hash});
  report.status=report.errors.length||report.checks.some(c=>!c.ok)?'FAIL':'PASS';fs.writeFileSync(path.join(OUT,'runtime.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:report.checks.length,failed:report.checks.filter(c=>!c.ok),errors:report.errors}));if(report.status!=='PASS')process.exitCode=1;
 }finally{await browser.close();await site.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
