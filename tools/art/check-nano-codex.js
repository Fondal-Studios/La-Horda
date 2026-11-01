'use strict';
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
const OUT=path.join(H.ROOT,'docs/art-gate/nano-gm-codex-v2');
(async()=>{
 const site=await H.startSite(),browser=await H.launch(),checks=[],errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'});
  page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>new URL(r.request().url()).origin===site.url?r.continue():r.abort());
  await page.goto(site.url+'/?lazy=1');await page.waitForFunction(()=>typeof ascBodyTarget==='function');
  await page.evaluate(()=>{loop=function(){};assetsStartGroup('ch:nano_gm');assetsStartGroup('ch:tanque');});
  await page.waitForFunction(()=>CHAMP_PACK.nano_gm.ready&&CHAMP_PACK.nano_gm_alt1.ready&&TANQUE_IMG_READY);
  const result=await page.evaluate(()=>{
   selectedClass='nano_gm';currentArena='bosque';lobbyAllies=[];netMatch=null;divinaMode=false;startRun(1);state='paused';window.ART_GATE_NO_VFX=true;
   const checks=[],measurements=[],calls=[],P=CHAMP_PACK.nano_gm,check=(name,ok,detail)=>checks.push({name,ok:!!ok,...(detail?{detail}:{})});
   check('versioned atlas selected',P.atlas.src.includes('/codex-v2/atlas.'));check('fixed authored pivots',Object.keys(P.footX).length===112&&Object.values(P.footX).every(x=>x===.5));
   const original=champPackDrawFrame,saved=ctx;champPackDrawFrame=function(pack,v,...args){calls.push({base:pack===P,skin:pack===CHAMP_PACK.nano_gm_alt1,v,flip:args[3]});return original(pack,v,...args);};
   const cv=document.createElement('canvas');cv.width=cv.height=220;const g=cv.getContext('2d',{willReadFrequently:true}),views={down:[0,1],side:[1,0],up:[0,-1],left:[-1,0]},states=['idle','walk','attack','cast','ultimate','hit','death'];
   const samples=[];
   function render(st,dir,n,skin=0){
    const [fx,fy]=views[dir],h=makeHero('nano_gm',true,0,0);Object.assign(h,{x:0,y:0,ascSkin:skin,_codexSkin:null,fx,fy,_pdir:dir==='left'?'side':dir,_pleft:dir==='left',moving:st==='walk',animT:n*130,attackAnim:['attack','cast','ultimate'].includes(st)?400-n*100:0,_aDur:400,_aPrev:400,hurtTimer:st==='hit'?160-n*40:0,_packCastUntil:['cast','ultimate'].includes(st)?Infinity:0,portCastState:st==='ultimate'?'ultimate':'cast',_animCastKind:st==='ultimate'?2:1,alive:st!=='death',_deadAt:10000});
    animNow=st==='death'?10000+n*170:n*230;calls.length=0;ctx=g;g.clearRect(0,0,220,220);g.save();g.translate(110,180);g.imageSmoothingEnabled=false;
    try{if(st==='death')drawFallenHero(h);else drawHeroBody(h,h.scale,false,false);}finally{g.restore();ctx=saved;}
    const d=g.getImageData(0,0,220,220).data,rows=new Array(220).fill(0);let pixels=0,y0=220,y1=-1;
    for(let y=0;y<220;y++)for(let x=0;x<220;x++)if(d[(y*220+x)*4+3]>100){rows[y]++;pixels++;y0=Math.min(y0,y);y1=Math.max(y1,y);}
    const threshold=Math.max(...rows)*.22;let b0=220,b1=-1;rows.forEach((n,y)=>{if(n>=threshold&&n){b0=Math.min(b0,y);b1=Math.max(b1,y);}});
    return {calls:calls.slice(),pixels,fullHeight:y1-y0+1,bodyHeight:b1-b0+1,foot:y1-180,png:cv.toDataURL(),h};
   }
   try{
    for(const dir in views)for(const st of states){const arr=P.sets[st+'_'+dir];check(st+' '+dir+' four authored cells',arr&&arr.length===4&&arr.every(v=>v>=0)&&new Set(arr).size===4);
     for(let n=0;n<4;n++){const r=render(st,dir,n);check(st+' '+dir+' frame '+n,r.pixels>0&&r.calls.length===1&&r.calls[0].base&&r.calls[0].v===arr[n]&&!r.calls[0].flip,{calls:r.calls,pixels:r.pixels});samples.push({st,dir,n,png:r.png});if(st==='idle'&&n===0)measurements.push({dir,fullHeight:r.fullHeight,bodyHeight:r.bodyHeight,foot:r.foot});}
    }
    for(const st of states)for(const dir in views){const r=render(st,dir,1,1);check('alternative skin retained '+st+' '+dir,r.pixels>0&&r.calls.every(c=>c.skin));}
    // Reference measured from the unchanged Caballero by roster_gate --write in this delivery.
    for(const m of measurements)check('Caballero scale and baseline '+m.dir,Math.abs(m.bodyHeight/59-1)<=.04&&Math.abs(m.foot-(-2))<=2,m);
    const h=render('idle','down',0).h;ctx=g;
    const originalEllipse=g.ellipse.bind(g),originalArc=g.arc.bind(g);let ellipses=0,arcs=0;g.ellipse=(...a)=>{ellipses++;return originalEllipse(...a);};g.arc=(...a)=>{arcs++;return originalArc(...a);};
    h.asState={};runElapsedMs=1000;ascNanoWings(h,1,1);check('base does not redraw procedural feathers',ellipses===0);
    h.asState.regentUntil=2000;ascNanoWings(h,1,1);check('Regent halo preserved',arcs>0);
    h.ascSkin=1;ellipses=0;ascNanoWings(h,1,1);check('alternative skin retains procedural effects',ellipses===5);
    g.ellipse=originalEllipse;g.arc=originalArc;h.ascSkin=0;h.asState.monsterUntil=9000;check('judgement transformation condition preserved',nanoMonster(h));
    let monsterCalls=0;const oldMonster=nanoMonsterDraw;nanoMonsterDraw=(...a)=>{monsterCalls++;return oldMonster(...a);};try{window.ART_GATE_NO_VFX=false;drawHeroBody(h,h.scale,false,false);check('judgement transformation renders',monsterCalls===1);}finally{nanoMonsterDraw=oldMonster;window.ART_GATE_NO_VFX=true;}
    // New guest receives the facing, then draws the authored left frame without a mirror.
    h.asState={};h.fx=-1;h.fy=0;h.moving=true;h.animT=130;const snapshot=_netDeltaOf({},h,true),guest=netDecode(snapshot);guest.x=guest.y=0;guest._codexSkin=null;guest.ascSkin=0;calls.length=0;drawHeroBody(guest,guest.scale,false,false);check('network-decoded left selects authored art',calls.some(c=>c.base&&c.v>=84&&!c.flip));
    const start=performance.now();for(let i=0;i<500;i++)render('walk','side',i%4);const elapsed=performance.now()-start;
    check('atlas below 2048 texture limit',P.atlas.naturalWidth<=2048&&P.atlas.naturalHeight<=2048);
    return {checks,measurements,samples,benchmark:{drawAndReadback500Ms:elapsed,scope:'CPU headless browser; includes readback and PNG encoding, not device FPS'},networkSnapshotKeys:Object.keys(snapshot)};
   }finally{ctx=saved;champPackDrawFrame=original;}
  });
  checks.push(...result.checks);
  // Render contact sheet using captured actual game draws, not source-sheet crops.
  const sheet=await page.evaluate(async samples=>{
   const cv=document.createElement('canvas');cv.width=1760;cv.height=1000;const g=cv.getContext('2d');g.fillStyle='#24282e';g.fillRect(0,0,cv.width,cv.height);g.fillStyle='#f2dfb2';g.font='14px monospace';g.fillText('Nano GM — render real: abajo / derecha / arriba / izquierda; cuatro cuadros por animación',15,25);
   const dirs=['down','side','up','left'],states=['idle','walk','attack','cast','ultimate','hit','death'];
   for(const s of samples){const im=new Image();im.src=s.png;await im.decode();const x=(dirs.indexOf(s.dir)*4+s.n)*110,y=states.indexOf(s.st)*138+30;g.imageSmoothingEnabled=false;g.drawImage(im,0,70,220,150,x,y,110,100);g.fillStyle='#e8c56a';g.fillText(s.st+' '+s.n,x+6,y+120);}
   return cv.toDataURL();
  },result.samples);
  fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,'runtime-sheet.png'),Buffer.from(sheet.split(',')[1],'base64'));
  const combat=await page.evaluate(()=>{
   window.ART_GATE_NO_VFX=false;save.champions.nano_gm.ascSkin=0;selectedClass='nano_gm';currentArena='bosque';lobbyAllies=[];startRun(5);heroes=[player];state='playing';player.invulnTimer=1e9;player.energy=player.maxEnergy;player.cds=[0,0,0];ensureCanvasSize();
   for(let i=0;i<5;i++){spawnEnemy('duende_bosque',false,false);const e=enemies[enemies.length-1];e.x=player.x+100+40*Math.cos(i);e.y=player.y+Math.sin(i)*100;e.hp=e.maxHp=10000;}
   let observed=[];const original=champPackDrawFrame;champPackDrawFrame=(pack,v,...a)=>{if(pack===CHAMP_PACK.nano_gm)observed.push(v);return original(pack,v,...a);};
   const shots=[],checks=[];
   try{
    for(let i=0;i<60;i++)update(16);player.fx=0;player.fy=1;render();shots.push({name:'combat-idle.png',data:canvas.toDataURL()});
    player.attackAnim=0;player._packCastUntil=0;player.hurtTimer=0;observed=[];triggerBasic(player);render();checks.push({name:'real basic draws attack',ok:observed.some(v=>Object.entries(CHAMP_PACK.nano_gm.rawSets).some(([k,a])=>k.startsWith('attack_')&&a.includes(v)))});
    player.cds=[0,0,0];player.energy=player.maxEnergy;observed=[];const accepted=useSkill(0,{x:player.x+100,y:player.y});render();checks.push({name:'real skill accepted and draws cast',ok:accepted&&observed.some(v=>Object.entries(CHAMP_PACK.nano_gm.rawSets).some(([k,a])=>k.startsWith('cast_')&&a.includes(v)))});shots.push({name:'combat-cast.png',data:canvas.toDataURL()});
    player.ultCharge=player.ultMax;player.ultCd=0;observed=[];useUltimate();render();checks.push({name:'real ultimate draws ultimate',ok:observed.some(v=>Object.entries(CHAMP_PACK.nano_gm.rawSets).some(([k,a])=>k.startsWith('ultimate_')&&a.includes(v)))});shots.push({name:'combat-ultimate.png',data:canvas.toDataURL()});
    return {checks,shots,hero:player.classKey,enemies:enemies.length,canvas:[canvas.width,canvas.height]};
   }finally{champPackDrawFrame=original;state='paused';}
  });
  checks.push(...combat.checks);for(const s of combat.shots)fs.writeFileSync(path.join(OUT,s.name),Buffer.from(s.data.split(',')[1],'base64'));
  // Individual samples support an animation preview without rerendering art.
  const frames=path.join(OUT,'samples');fs.mkdirSync(frames,{recursive:true});for(const s of result.samples)fs.writeFileSync(path.join(frames,`${s.dir}-${s.st}-${s.n}.png`),Buffer.from(s.png.split(',')[1],'base64'));
  const report={status:checks.every(c=>c.ok)&&!errors.length?'PASS':'FAIL',checks,errors,measurements:result.measurements,benchmark:result.benchmark,combat:{hero:combat.hero,enemies:combat.enemies,canvas:combat.canvas},scope:'Original Nano GM 112 frames, real basic/skill/ultimate in combat, skin routing, effects, transformation and decoded guest facing; not full multiplayer/performance certification'};
  fs.writeFileSync(path.join(OUT,'runtime.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:checks.length,failed:checks.filter(c=>!c.ok),errors,measurements:report.measurements,benchmark:report.benchmark}));if(report.status!=='PASS')process.exitCode=1;
 }finally{await browser.close();await site.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
