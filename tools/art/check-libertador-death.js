'use strict';
// Actual renderer + actual classic casts + real snapshot encoder/decoder.
// No live accounts/relay; no balances or unlock rules are certified by this graphics test.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(ROOT,'docs/art-gate/libertador-death');
fs.mkdirSync(OUT,{recursive:true});
const report={scope:'Base-only supplemental death, six levels, real renderer and guest snapshot, lazy loading and preserved specialized animations',checks:[],errors:[],levels:[]};
const types={'.js':'application/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 let file;try{file=path.resolve(ROOT,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));}catch{res.writeHead(400).end();return;}
 if(!file.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(data);});
});
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,file))).digest('hex');
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox']});
  const pages=[];
  for(let i=0;i<2;i++){
   const context=await browser.newContext({viewport:{width:844,height:390},serviceWorkers:'block'});
   await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
   const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
   await page.goto('http://127.0.0.1:'+server.address().port+'/?lazy=1',{waitUntil:'load'});
   await page.waitForFunction(()=>typeof drawLibertador==='function'&&typeof netDecode==='function');
   await page.evaluate(()=>{loop=function(){};assetsStartGroup('ch:libertador');});
   await page.waitForFunction(()=>CHAMP_PACK.libertador.ready&&CHAMP_PACK.libertador_horse.ready&&CHAMP_PACK.libertador_death.ready);
   await page.evaluate(()=>{for(const id of ['granadero','libertador_escarcha','libertador_ancestral'])skinDefOf(id);assetsStartGroup('ch:libertador');});
   await page.waitForFunction(()=>['granadero','libertador_escarcha','libertador_ancestral'].every(id=>{const d=skinDefOf(id);return d&&d.packs&&CHAMP_PACK[d.packs.libertador].ready;}));
   pages.push(page);
  }
  const result=await pages[0].evaluate(()=>{
   save.champions.libertador.unlocked=true;selectedClass='libertador';currentArena='bosque';lobbyAllies=[];netMatch=null;divinaMode=false;startRun(1);state='paused';runElapsedMs=10000;window.ART_GATE_NO_VFX=true;
   const checks=[],shots=[],snapshots=[];
   const check=(name,ok,details)=>checks.push({name,ok:!!ok,...(details?{details}:{})});
   const D=CHAMP_PACK.libertador_death,B=CHAMP_PACK.libertador,H=CHAMP_PACK.libertador_horse;
   const cv=document.createElement('canvas');cv.width=320;cv.height=240;const g=cv.getContext('2d',{willReadFrequently:true});
   function draw(h,death=true){
    const saved=ctx,orig=champPackDrawFrame,calls=[];g.clearRect(0,0,320,240);g.save();g.translate(160,190);ctx=g;g.imageSmoothingEnabled=false;
    champPackDrawFrame=function(P,v,...args){calls.push({pack:P===D?'death':P===B?'base':P===H?'horse':'other',frame:v<0?~v:v,scale:args[2],alpha:args[4]});return orig.call(this,P,v,...args);};
    let ok;try{ok=death==='body'?drawHeroBody(h,h.scale,false,false):death?drawChampPackDeath(h):drawLibertador(h,h.scale,1);}finally{ctx=saved;champPackDrawFrame=orig;g.restore();}
    const data=g.getImageData(0,0,320,240).data;return {ok,calls,visible:data.some((v,i)=>i%4===3&&v>40)};
   }
   check('component metadata',D.fw===112&&D.fh===112&&D.cols===4&&D.refH===71&&D.anchor===106/112);
   check('Códice exposes actual death clip',CODEX_CHAMP_EXTRA_ANIMS.libertador.some(a=>a.set==='death_down'&&a.pack==='libertador_death'));
   check('all original foot frames retained',B.atlas.naturalWidth===824&&Object.values(B.rawSets).flat().every(v=>v>=0&&v<61));
   const referenceShots=[];
   for(const key of ['tanque','libertador']){const h=makeHero(key,true,0,0);h._codexSkin=null;h.fx=0;h.fy=1;h.moving=false;h.attackAnim=0;animNow=0;draw(h,'body');referenceShots.push(cv.toDataURL('image/png'));}
   for(const level of [1,39,40,60,90,99]){
    save.champions.libertador.level=level;const h=makeHero('libertador',true,0,0);h._codexSkin=null;h.alive=false;h.hp=0;h._deadAt=10000;
    for(const dir of ['down','side','up'])for(let n=0;n<4;n++){
     h._pdir=dir;animNow=10000+n*170;const d=draw(h);
     check('L'+level+' '+dir+' death '+n,d.ok&&d.visible&&d.calls.length===1&&d.calls[0].pack==='death'&&d.calls[0].frame===n);
     if(level===1&&dir==='down')shots.push(cv.toDataURL('image/png'));
    }
    animNow=13000;const hold=draw(h);check('L'+level+' final pose holds',hold.calls[0].frame===3&&hold.calls[0].alpha===.55);
    const snapshot=_netDeltaOf({},h,true);check('L'+level+' death clock is local',!('_deadAt' in snapshot));snapshots.push(snapshot);
    h.alive=true;h.hp=1;drawHero(h);check('L'+level+' revival clears local death clock',!h._deadAt);
    h.alive=false;animNow=40000;draw(h);check('L'+level+' new death restarts',h._deadAt===40000);
   }
   const h=makeHero('libertador',true,0,0);h._codexSkin=null;h.attackAnim=0;h.smMounted=false;h.moving=false;
   const phases=[['ult_cast',{smPhase:'ultcast'}],['bayo_emb',{smPhase:'bayo'}],['bayo_rem',{smBayoFinishTimer:100}],['bayo_imp',{smBayoImpTimer:100}],['cabral',{smCabralFxTimer:100}],['command',{smCmdTimer:100}],['fire',{attackAnim:120,smAtkTotal:240}],['reload',{basicCd:120,smReloadTotal:240}]];
   for(const [clip,fields] of phases){
    Object.assign(h,{smPhase:null,smBayoFinishTimer:0,smBayoImpTimer:0,smCabralFxTimer:0,smCmdTimer:0,attackAnim:0,basicCd:0},fields);
    const d=draw(h,false);check('preserved '+clip,d.visible&&d.calls.some(c=>c.pack==='base'&&B.sets[clip].includes(c.frame)));
   }
   for(const [clip,fields] of [['mount',{smPhase:'mount',smPhaseTimer:100}],['dismount',{smPhase:'dismount',smPhaseTimer:100}],['charge',{smPhase:'charge'}],['m_atk',{smPhase:null,smMounted:true,attackAnim:100}],['m_run',{smPhase:null,smMounted:true,attackAnim:0,moving:true}],['m_idle',{smPhase:null,smMounted:true,attackAnim:0,moving:false}]]){
    Object.assign(h,fields);const d=draw(h,false);check('preserved horse '+clip,d.visible&&d.calls.some(c=>c.pack==='horse'&&H.sets[clip].includes(c.frame)));
   }
   const old=setSkinPackKey;setSkinPackKey=()=> 'test_skin_death';CHAMP_PACK.test_skin_death=B;
   try{check('skin never borrows base death',draw(h).calls.every(c=>c.pack!=='death'));}finally{setSkinPackKey=old;delete CHAMP_PACK.test_skin_death;}
   for(const id of ['granadero','libertador_escarcha','libertador_ancestral']){
    h._codexSkin=id;h._deadAt=10000;animNow=10000;
    const key=setSkinPackKey(h,'libertador'),d=draw(h);
    check('actual appearance retains death '+id,key!=='libertador'&&d.ok&&d.visible&&d.calls.every(c=>c.pack!=='death'));
   }
   h._codexSkin=null;
   D.ready=false;try{check('unloaded supplement retains original fallback',draw(h).ok===false);}finally{D.ready=true;}
   // Actual Códice renderer path selects the named supplemental clip, not an illustration.
   Object.assign(h,{smPhase:null,smMounted:false,smBayoFinishTimer:0,smBayoImpTimer:0,smCabralFxTimer:0,smCmdTimer:0,attackAnim:0,basicCd:0,_codexPack:'libertador_death',_codexSet:'death_down',_codexT:0,_codexFps:6});
   check('Códice renderer selects supplement',draw(h,false).calls.some(c=>c.pack==='death'));
   return {checks,shots,snapshots,referenceShots};
  });
  report.checks.push(...result.checks);
  const guest=await pages[1].evaluate(snapshots=>{
   const checks=[];const saved=ctx,original=champPackDrawFrame,cv=document.createElement('canvas');cv.width=cv.height=240;ctx=cv.getContext('2d');
   try{for(let i=0;i<snapshots.length;i++){
    const h=netDecode(snapshots[i]);h._codexSkin=null;h.x=h.y=120;const frames=[];
    champPackDrawFrame=function(P,v,...args){frames.push(v);return original.call(this,P,v,...args);};
    animNow=900000;drawChampPackDeath(h);for(let n=1;n<4;n++){animNow=900000+n*170;drawChampPackDeath(h);}
    checks.push({name:'guest snapshot L'+[1,39,40,60,90,99][i],ok:JSON.stringify(frames)==='[0,1,2,3]'&&h._deadAt===900000});
   }}finally{ctx=saved;champPackDrawFrame=original;}return checks;
  },result.snapshots);
  report.checks.push(...guest);
  for(let i=0;i<result.shots.length;i++)fs.writeFileSync(path.join(OUT,'runtime-'+i+'.png'),Buffer.from(result.shots[i].split(',')[1],'base64'));
  for(let i=0;i<result.referenceShots.length;i++)fs.writeFileSync(path.join(OUT,'reference-'+i+'.png'),Buffer.from(result.referenceShots[i].split(',')[1],'base64'));
  for(const [file,expected] of [['assets/sprites/champions/libertador/v2/atlas.png','8e08a247875cfb2c2b223fe56c0fb20cbaaeeb673587f8a5d919d85299b84411'],['assets/sprites/champions/libertador/v2/horse.png','9025699358a17bfea7f6a502f8534137bbde17d521e85ebd3b54025b315d6a01']])report.checks.push({name:'preserved bytes '+file,ok:sha(file)===expected});
  report.provenance={atlasSha256:sha('assets/sprites/champions/libertador/v2/death.png'),rendererSha256:sha('js/rendering/champion-sprites.js')};
  report.status=report.errors.length||report.checks.some(c=>!c.ok)?'FAIL':'PASS';
  console.log(JSON.stringify({status:report.status,checks:report.checks.length,failed:report.checks.filter(c=>!c.ok),errors:report.errors}));assert.equal(report.status,'PASS');
 }finally{fs.writeFileSync(path.join(OUT,'runtime.json'),JSON.stringify(report,null,2)+'\n');if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
