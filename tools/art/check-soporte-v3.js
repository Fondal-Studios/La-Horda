'use strict';
// Actual renderer + actual classic casts + real snapshot encoder/decoder.
// No live accounts/relay; no balances or unlock rules are certified by this graphics test.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(ROOT,'docs/art-gate/soporte-v3');
fs.mkdirSync(OUT,{recursive:true});
const report={scope:'Actual renderer, six levels, all36 frames, host/guest snapshot replay; existing gates cover balance and live transport',checks:[],errors:[],levels:[]};
const types={'.js':'application/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 let file;try{file=path.resolve(ROOT,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));}catch{res.writeHead(400).end();return;}
 if(!file.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(data);});
});
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,file))).digest('hex');
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox']});
  const contexts=await Promise.all([browser.newContext({viewport:{width:844,height:390},serviceWorkers:'block'}),browser.newContext({viewport:{width:844,height:390},serviceWorkers:'block'})]);
  for(const context of contexts)await context.route('**/*',route=>{
   const url=new URL(route.request().url());return url.hostname==='127.0.0.1'||['data:','blob:'].includes(url.protocol)?route.continue():route.abort();
  });
  const pages=await Promise.all(contexts.map(c=>c.newPage())),host=pages[0],guest=pages[1];
  for(const page of pages){
   page.on('pageerror',e=>report.errors.push(e.message));
   await page.goto(base,{waitUntil:'load'});
   await page.waitForFunction(()=>typeof castAbility==='function'&&typeof drawHeroBody==='function'&&CHAMP_PACK.soporte&&CHAMP_PACK.soporte.ready&&typeof _netDeltaOf==='function');
   await page.evaluate(()=>{loop=function(){};netMatch=null;divinaMode=false;window.ART_GATE_NO_VFX=true;});
  }
  for(const level of [1,39,40,60,90,99]){
   const result=await host.evaluate(level=>{
    const checks=[],seen=new Set(),trace=[],body=[],frameImages=new Map();
    const check=(name,ok,details)=>checks.push({name,ok:!!ok,...(details?{details}:{})});
    for(const c of Object.values(save.champions))c.unlocked=true;
    save.champions.soporte.level=level;save.champions.soporte.equipment={};save.champions.soporte.inventory=[];
    save.stash=[];save.relics={hp:0,dmg:0,def:0,vel:0};
    selectedClass='soporte';currentArena='bosque';lobbyAllies=[];netMatch=null;divinaMode=false;startRun(1);
    enemies=[];particles=[];spawnTimer=1e9;arenaHazardTimer=1e9;runElapsedMs=10000;animNow=20000;
    state='paused';const hero=player;hero._codexSkin=null;hero.x=hero.y=0;
    const P=CHAMP_PACK.soporte;
    check('v3 loaded',new URL(P.atlas.currentSrc||P.atlas.src,location.href).pathname.endsWith('/soporte/v3/atlas.png'));
    check('36 canonical cells',P.fw===112&&P.fh===112&&P.cols===4&&P.atlas.naturalWidth===448&&P.atlas.naturalHeight===1008);
    check('ref/foot metadata',P.refH===71&&Math.abs(P.anchor*112-106)<1e-6);
    const cv=document.createElement('canvas');cv.width=cv.height=260;const g=cv.getContext('2d',{willReadFrequently:true});
    function direction(h,dir){h.fx=dir==='left'?-1:dir==='right'?1:0;h.fy=dir==='up'?-1:dir==='down'?1:0;}
    function drawFrame(h,death=false){
     const calls=[],saved=ctx,original=champPackDrawFrame;
     champPackDrawFrame=function(pack,v,...args){const frame=v<0?~v:v;calls.push({frame,mirror:(v<0)!==!!args[3]});seen.add(frame);return original.call(this,pack,v,...args);};
     g.clearRect(0,0,260,260);g.save();g.translate(130,220);g.imageSmoothingEnabled=false;ctx=g;
     try{if(death)drawChampPackDeath(h);else drawChampPack(h.classKey,h,h.scale,1);}
     finally{ctx=saved;g.restore();champPackDrawFrame=original;}
     for(const call of calls)if(!frameImages.has(call.frame)){
      const shot=document.createElement('canvas');shot.width=shot.height=100;
      shot.getContext('2d').drawImage(cv,80,130,100,100,0,0,100,100);frameImages.set(call.frame,shot);
     }
     const pixels=g.getImageData(0,0,260,260).data;
     return {calls,opaque:pixels.some((v,i)=>i%4===3&&v>40)};
    }
    function measure(h){
     const saved=ctx,time=animNow;animNow=0;g.clearRect(0,0,260,260);g.save();g.translate(130,220);g.imageSmoothingEnabled=false;ctx=g;
     try{drawHeroBody(h,h.scale,false,false);}finally{ctx=saved;g.restore();animNow=time;}
     const d=g.getImageData(0,0,260,260).data,rows=new Array(260).fill(0);
     for(let y=0;y<260;y++)for(let x=0;x<260;x++)if(d[(y*260+x)*4+3]>40)rows[y]++;
     const full=rows.map((v,i)=>v?i:-1).filter(i=>i>=0),threshold=Math.max(...rows)*.22;
     const mass=rows.map((v,i)=>v>=threshold?i:-1).filter(i=>i>=0);
     return {body:mass.length?mass[mass.length-1]-mass[0]+1:0,foot:full.length?full[full.length-1]-220:null};
    }
    const knight=makeHero('tanque',true,0,0);knight._codexSkin=null;knight.moving=false;knight.attackAnim=0;knight.hurtTimer=0;direction(knight,'down');
    const reference=measure(knight);
    for(const dir of ['down','right','left','up']){
     direction(hero,dir);hero.hurtTimer=0;hero.attackAnim=0;hero._packCastUntil=0;hero.moving=false;
     const idle=drawFrame(hero);check('idle '+dir,idle.opaque&&idle.calls.length>0);
     for(let phase=0;phase<4;phase++){
      hero.moving=true;hero.animT=phase*130;hero.attackAnim=0;hero.hurtTimer=0;
      const walk=drawFrame(hero),expected=(dir==='up'?8:dir==='down'?0:4)+phase;
      check('walk '+dir+' '+phase,walk.opaque&&walk.calls.some(c=>c.frame===expected&&c.mirror===(dir==='left')));
      const m=measure(hero);body.push({dir,phase,...m});
      check('body/foot '+dir+' '+phase,m.body>0&&Math.abs(m.body/reference.body-1)<=.04&&Math.abs(m.foot-reference.foot)<=2,{...m,reference});
     }
     hero.moving=false;hero._packCastUntil=0;hero._aPrev=400;hero._aDur=400;
     for(let phase=0;phase<4;phase++){
      hero.attackAnim=400*(1-phase/4);const attack=drawFrame(hero),expected=(dir==='up'?20:dir==='down'?12:16)+phase;
      check('attack '+dir+' '+phase,attack.opaque&&attack.calls.some(c=>c.frame===expected));
     }
     hero.attackAnim=0;hero.hurtTimer=160;
     const hit=drawFrame(hero);check('hit '+dir,hit.opaque&&hit.calls.some(c=>c.frame===(dir==='up'?20:dir==='down'?12:16)));
    }
    hero.hurtTimer=0;hero.moving=false;direction(hero,'down');
    function castFrames(ultimate,index){
     hero.attackAnim=0;hero._aPrev=0;hero._aDur=0;hero._pcuSeen=0;hero._pcuLocal=0;
     castAbility(hero,ultimate?hero.cls.ultimate:hero.cls.skills[index],ultimate,ultimate?undefined:index);
     const duration=hero.attackAnim,start=animNow,snapshot=_netDeltaOf({},hero,true),frames=[];
     check((ultimate?'ultimate':'skill'+index)+' actual cast marker',duration>0&&hero._animCastKind===(ultimate?2:1));
     for(let phase=0;phase<4;phase++){
      hero.attackAnim=duration*(1-phase/4);animNow=start+duration*phase/4;
      const draw=drawFrame(hero);frames.push(...draw.calls.map(c=>c.frame));check((ultimate?'ultimate':'skill'+index)+' visible '+phase,draw.opaque);
     }
     check((ultimate?'ultimate':'skill'+index)+' distinct authored frames',JSON.stringify(frames)===JSON.stringify(ultimate?[28,29,30,31]:[24,25,26,27]),{frames});
     trace.push({kind:ultimate?'ultimate':'skill'+index,frames});return snapshot;
    }
    for(let i=0;i<3;i++)castFrames(false,i);
    const snapshot=castFrames(true);
    check('snapshot contains classic ultimate flag',snapshot._animCastKind===2);
    check('render-local clocks not serialized',['_pcuSeen','_pcuLocal','_aDur','_aPrev'].every(k=>!(k in snapshot)));
    const at=animNow;hero.attackAnim=0;hero._deadAt=at;hero.alive=false;
    for(let phase=0;phase<4;phase++){animNow=at+phase*170;const d=drawFrame(hero,true);check('death '+phase,d.opaque&&d.calls.some(c=>c.frame===32+phase));}
    animNow=at+2000;check('death final frame holds',drawFrame(hero,true).calls.some(c=>c.frame===35));hero.alive=true;hero.hp=Math.max(1,hero.hp);
    check('all36 frames actually selected',[...Array(36).keys()].every(n=>seen.has(n)),{seen:[...seen].sort((a,b)=>a-b)});
    check('finite resources',Number.isFinite(hero.hp)&&Number.isFinite(hero.energy));
    // Canary: a declared frame outside the actual image is invalid, not an implemented animation.
    const old=P.sets.ultimate_down;P.sets.ultimate_down=[9999];
    const inBounds=()=>Object.values(P.sets).every(arr=>arr.every(v=>(v<0?~v:v)<P.cols*Math.floor(P.atlas.naturalHeight/P.fh)));
    check('negative canary rejects unavailable frame',!inBounds());P.sets.ultimate_down=old;check('restored frames in image',inBounds());
    let preview=null;
    if(level===1){const sheet=document.createElement('canvas');sheet.width=600;sheet.height=600;const sg=sheet.getContext('2d');sg.fillStyle='#242837';sg.fillRect(0,0,600,600);sg.font='11px monospace';sg.imageSmoothingEnabled=false;
     for(let n=0;n<36;n++){const x=n%6*100,y=Math.floor(n/6)*100;sg.strokeStyle='#509c79';sg.beginPath();sg.moveTo(x,y+90);sg.lineTo(x+100,y+90);sg.stroke();if(frameImages.has(n))sg.drawImage(frameImages.get(n),x,y);sg.fillStyle='#fff';sg.fillText(String(n),x+4,y+12);}preview=sheet.toDataURL('image/png');}
    return {level,checks,trace,body,snapshot,reference,preview};
   },level);
   if(result.preview)fs.writeFileSync(path.join(OUT,'runtime-contact.png'),Buffer.from(result.preview.split(',')[1],'base64'));
   report.checks.push(...result.checks.map(c=>({...c,name:'L'+level+' '+c.name})));
   const replay=await guest.evaluate(snapshot=>{
    const hero=netDecode(snapshot);hero.x=hero.y=0;hero.hurtTimer=0;hero.moving=false;hero._codexSkin=null;
    heroes=[hero];player=hero;netMatch=null;runElapsedMs=10000;animNow=900000;
    const checks=[],frames=[],duration=hero.attackAnim,start=animNow,cv=document.createElement('canvas');cv.width=cv.height=260;
    const saved=ctx,original=champPackDrawFrame,g=cv.getContext('2d');let opaque=true;
    champPackDrawFrame=function(P,v,...args){frames.push(v<0?~v:v);return original.call(this,P,v,...args);};
    try{for(let n=0;n<4;n++){hero.attackAnim=duration*(1-n/4);animNow=start+duration*n/4;g.clearRect(0,0,260,260);g.save();g.translate(130,220);ctx=g;drawChampPack('soporte',hero,hero.scale,1);g.restore();opaque=opaque&&g.getImageData(0,0,260,260).data.some((v,i)=>i%4===3&&v>40);}}
    finally{ctx=saved;champPackDrawFrame=original;}
    return {frames,opaque,kind:hero._animCastKind,restoredClass:hero.cls===CLASSES.soporte,hostStamp:hero._packCastUntil,localClock:animNow};
   },result.snapshot);
   report.checks.push({name:'L'+level+' guest snapshot replay with clock offset',ok:replay.opaque&&replay.kind===2&&replay.restoredClass&&JSON.stringify(replay.frames)==='[28,29,30,31]',details:replay});
   report.levels.push({level,trace:result.trace,body:result.body,reference:result.reference,guest:replay});
  }
  report.provenance={atlas:'assets/sprites/champions/soporte/v3/atlas.png',atlasSha256:sha('assets/sprites/champions/soporte/v3/atlas.png'),metadataSha256:sha('js/assets/champion-sprites.js'),rendererSha256:sha('js/rendering/champion-sprites.js')};
  report.status=report.errors.length||report.checks.some(c=>!c.ok)?'FAIL':'PASS';
  console.log(JSON.stringify({status:report.status,checks:report.checks.length,levels:report.levels.length,failed:report.checks.filter(c=>!c.ok),errors:report.errors}));
  assert.equal(report.status,'PASS');
 }finally{
  fs.writeFileSync(path.join(OUT,'runtime.json'),JSON.stringify(report,null,2)+'\n');
  if(browser)await browser.close();await new Promise(r=>server.close(r));
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
