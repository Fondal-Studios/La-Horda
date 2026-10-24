'use strict';
const fs=require('node:fs'),H=require('../lib/serve');
const OUT='art-source/entregas/aelith-normal-kit-20261022/correccion-02';
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await H.goto(page,site.url);await H.waitFor(page,()=>typeof startRun==='function'&&assetsAllReady());
 const r=await page.evaluate(()=>{
  const checks=[],check=(name,pass,details)=>checks.push({name,pass:!!pass,details});
  netMatch=null;save.stash=[];for(const k in save.champions)Object.assign(save.champions[k],{unlocked:true,level:60,equipment:{},inventory:[],talents:{nodes:{},mastery:null,masteryNodes:{}}});
  selectedClass='aelith';currentArena='bosque';lobbyAllies=['tanque','soporte'];startRun(3);state='menu';enemies=[];
  const original=window.vfxSfaPlay,events=[];window.vfxSfaPlay=function(...a){events.push(a);return original.apply(this,a);};
  const reset=()=>{portadorObjects=[];sfaObjectsReset();sfaReset();aelithTrailState.clear();events.length=0;player.alive=true;player.fused=false;player.energy=1e4;player.cds=[0,0,0];player.aelithDebtUntil=0;player.slowTimer=0;player.slowAmt=0;save.champions.aelith.talents.nodes={};};
  const impacts=()=>events.filter(e=>e[0]==='nova'&&e[1]==='aelith_echo');
  for(const delay of [800,1600]){
   reset();const o=aelithEcho(player,{x:player.x+20,y:player.y},75,10,delay);sfaObjectsFrame();aelithUpdateObject(o,delay-1);
   check('no premature impact '+delay,impacts().length===0&&o.life===1);aelithUpdateObject(o,1);
   check('real expiry emits exactly once '+delay,impacts().length===1&&o.life===0&&impacts()[0][4]===75);aelithUpdateObject(o,50);sfaObjectsFrame();sfaObjectsFrame();
   check('repeated updates and observer do not duplicate impact '+delay,impacts().length===1);
  }
  for(const cause of ['death','fusion','owner-removal','cap-replacement','snapshot-removal','reset','void']){
   reset();const o=aelithEcho(player,{x:player.x+20,y:player.y},75,10,800);sfaObjectsFrame();
   const arena=currentArena,oldAb=abS,walk=abWalkable;
   try{
    if(cause==='death')player.alive=false;
    if(cause==='fusion')player.fused=true;
    if(cause==='owner-removal')heroes.splice(heroes.indexOf(player),1);
    if(cause==='cap-replacement'){aelithEcho(player,player,75,10);aelithEcho(player,player,75,10);}
    if(cause==='snapshot-removal')portadorObjects=[];
    if(cause==='reset'){portadorObjects=[];vfxResetRun();}
    if(cause==='void'){currentArena='abismo';abS={};abWalkable=()=>false;}
    if(!['snapshot-removal','reset'].includes(cause))aelithUpdateObject(o,800);
    sfaObjectsFrame();check('cancel without damage signal has no shatter: '+cause,impacts().length===0,{life:o.life});
   }finally{currentArena=arena;abS=oldAb;abWalkable=walk;if(!heroes.includes(player))heroes.unshift(player);}
  }
  reset();player.aim={x:player.x+100,y:player.y,dx:1,dy:0};castAbility(player,player.cls.skills[0],false,0);const echo=portadorOwned(player,'ael_echo')[0];
  check('normal cast still has initial impact',impacts().length===1);aelithUpdateObject(echo,echo.life);check('cast plus real expiry has exactly two impacts',impacts().length===2);
  reset();castAbility(player,player.cls.skills[2],false,2);let aura=sfaPool.find(e=>e.theme==='aelith_haste~p');
  check('haste owns full actual buff duration',aura&&aura.dur===player.aelithDebtUntil-runElapsedMs&&aura.dur===3000);
  const g={save(){},restore(){},translate(){},rotate(){},frames:[],drawImage(...a){this.frames.push(a[1]/40);}};
  for(const duration of [1500,3000,6000])for(const fraction of [0,.25,.5,.999]){
   const values=[];for(const clock of [1000,9000]){animNow=clock;g.frames=[];sfaDrawOne({...aura,dur:duration,t:duration*fraction},g);values.push(g.frames[0]);}
   check('one revolution independent of global clock '+duration+' '+fraction,values[0]===values[1]&&values[0]===Math.floor(fraction*12),values);
  }
  for(let i=0;i<4;i++){runElapsedMs+=60;player.x+=12;sfaObjectsFrame();}
  const trail=aelithTrailState.get(player);check('three equipped-body snapshots before debt',trail&&trail.shots.length===3);
  const until=player.aelithDebtUntil;runElapsedMs=until;updatePortadorHero(player,0);
  let debt=sfaPool.find(e=>e.theme==='aelith_debt');check('real slowdown transition emits 800ms debt',debt&&debt.dur===800&&player.aelithDebtUntil===0&&player.slowTimer===800&&player.slowAmt>=.15);
  check('debt replaces only own haste clock',!sfaPool.some(e=>e.theme==='aelith_haste~p'));
  sfaObjectsFrame();check('debt retains and greys existing snapshots',aelithTrailState.get(player)?.debt===true);
  const paths=[],draw=ctx.drawImage;ctx.drawImage=function(cv,x,y,...args){if(trail.shots.some(p=>p.cv===cv))paths.push({x,y,alpha:this.globalAlpha});return draw.call(this,cv,x,y,...args);};
  debt.t=110;sfaObjectsFrame();ctx.drawImage=draw;
  check('collapse advances ghost positions toward owner',paths.length>0&&paths.every(p=>p.alpha>0&&p.alpha<=.2),paths);
  debt.t=799;sfaObjectsFrame();check('debt remains until final millisecond',aelithTrailState.has(player));debt.t=800;sfaObjectsFrame();check('debt removes trail at800ms',!aelithTrailState.has(player));
  const n=events.length;updatePortadorHero(player,16);check('debt transition emitted once',events.length===n);
  reset();const fi=heroes.indexOf(player),other=heroes.indexOf(allies[0]);
  original('aura','aelith_debt',player.x,player.y,25,0,800,0,0,24,fi);original('aura','aelith_haste~p',player.x,player.y,25,0,3000,0,0,24,other);original('aura','aelith_haste~p',player.x,player.y,25,0,3000,0,0,24,fi);
  check('numeric replay of recast cancels debt only for recipient',!sfaPool.some(e=>e.theme==='aelith_debt')&&sfaPool.filter(e=>e.theme==='aelith_haste~p').length===2);
  original('aura','aelith_haste~p',player.x,player.y,25,0,3000,0,0,24,fi);check('recast does not stack clocks',sfaPool.filter(e=>e.theme==='aelith_haste~p').length===2);
  reset();castAbility(player,player.cls.skills[2],false,2);sfaObjectsFrame();player.alive=false;runElapsedMs=player.aelithDebtUntil;updatePortadorHero(player,0);sfaObjectsFrame();check('death never emits grey debt',!events.some(e=>e[1]==='aelith_debt')&&!aelithTrailState.has(player));
  reset();castAbility(player,player.cls.skills[2],false,2);sfaObjectsFrame();vfxResetRun();check('run reset clears snapshot memory',aelithTrailState.size===0);
  window.vfxSfaPlay=original;
  const b=sfaBake('aura','aelith_debt',0),data=b.cv.getContext('2d').getImageData(0,0,b.cv.width,b.cv.height).data;let soft=0,opaque=0;for(let i=3;i<data.length;i+=4){if(data[i]&&data[i]!==255)soft++;if(data[i]===255)opaque++;}
  check('debt atlas has crisp nonempty alpha',soft===0&&opaque>0,{soft,opaque});
  return{checks,debtAtlas:{width:b.w,height:b.h,frames:b.n,png:b.cv.toDataURL()}};
 });
 fs.writeFileSync(OUT+'/debt-sand.png',Buffer.from(r.debtAtlas.png.split(',')[1],'base64'));delete r.debtAtlas.png;
 const status=errors.length||r.checks.some(c=>!c.pass)?'FAIL':'PASS';fs.writeFileSync(OUT+'/lifecycle-tests.json',JSON.stringify({status,...r,errors},null,2)+'\n');console.log(JSON.stringify({status,checks:r.checks.length,failed:r.checks.filter(c=>!c.pass),errors}));if(status==='FAIL')process.exitCode=1;
 }finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
