'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),H=require('../lib/serve');
const OUT=path.resolve(process.env.OUT||'art-source/entregas/veyra-kit-20261022');
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
 const page=await browser.newPage({viewport:{width:844,height:390}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await H.goto(page,site.url);await H.waitFor(page,()=>typeof KVB_FX!=='undefined'&&assetsAllReady());
 const result=await page.evaluate(()=>{
  const checks=[],strips={};netMatch=null;save.champions.veyra.unlocked=true;save.champions.veyra.level=60;save.champions.veyra.talents={nodes:{},mastery:null,masteryNodes:{}};
  selectedClass='veyra';currentArena='bosque';startRun(1);state='playing';enemies=[];for(const h of allies)h.stunTimer=1e9;
  const record=[],oldFx=window.kvbFx;window.kvbFx=function(...args){record.push(args);return oldFx.apply(this,args);};
  for(const lance of [false,true])for(const area of [1,1.6]){
   save.champions.veyra.talents.nodes=lance?{veyra_t0transform:1}:{};record.length=0;kvbReset();
   player.aim={dx:0,dy:-1,x:player.x,y:player.y-130};veyraCast(player,player.cls.skills[0],false,10,area,1);
   const e=record.find(a=>a[0].startsWith('veyra.')),expected=lance?'veyra.lance':'veyra.cut';
   checks.push({name:'aim and talent line area='+area+' lance='+lance,pass:!!e&&e[0]===expected&&Math.abs(e[4]+Math.PI/2)<1e-6&&(!lance||(e[3]===Math.min(200,35*area)&&e[5]===Math.min(180,130*area))),event:e});
  }
  // Simulate a thin wall through the existing collision resolver; VFX must end where the hero stopped.
  save.champions.veyra.talents.nodes={};const ox=player.x,oy=player.y,resolve=resolveWallCollision;const wall=ox+40;
  resolveWallCollision=q=>{resolve(q);if(q.x>wall&&q.x<wall+20)q.x=wall;};player.aim={dx:1,dy:0,x:ox+145,y:oy};record.length=0;
  try{veyraCast(player,player.cls.skills[1],false,10,1,1);}finally{resolveWallCollision=resolve;}
  const dash=record.find(a=>a[0]==='veyra.dash');checks.push({name:'dash trail uses actual wall-clipped displacement',pass:!!dash&&player.x<=wall&&Math.abs(dash[5]-Math.hypot(player.x-ox,player.y-oy))<1e-6,event:dash});
  window.kvbFx=oldFx;netHookEvents();netMatch={role:'host',recording:true};_netEvents=[];
  for(const id of ['veyra.cut','veyra.lance','veyra.dash','veyra.pact'])kvbFx(id,player.x,player.y,35,0,130,0);
  const events=JSON.parse(JSON.stringify(_netEvents)).filter(e=>e[0]==='kvbFx');netMatch=null;_netEvents=[];kvbReset();for(const e of events)window[e[0]](...e[1]);
  checks.push({name:'all four recipes replay from numeric host events',pass:events.length===4&&events.every(e=>e[1].every(x=>typeof x==='string'||typeof x==='number'))&&KVB.pool.some(e=>e.beam&&e.spec===KVB_BEAM.vy_lance),events:events.map(e=>e[1][0])});
  const old=Math.random;let calls=0;Math.random=()=>{calls++;return .5;};
  try{for(const id of ['veyra.cut','veyra.lance','veyra.dash','veyra.pact'])kvbFx(id,player.x,player.y,35,0,130,0);}finally{Math.random=old;}
  checks.push({name:'thematic recipes do not consume combat RNG',pass:calls===0,calls});
  for(const reduced of [false,true]){JUICE.reduceFx=reduced;kvbReset();for(let i=0;i<300;i++)kvbFx('veyra.cut',player.x,player.y,130,0,.85,0);checks.push({name:'pool bounded reduceFx='+reduced,pass:KVB.pool.length<=(reduced?64:128),size:KVB.pool.length});}JUICE.reduceFx=false;
  for(const [name,r] of [['vy_slash',130],['vy_dash_end',42],['vy_pact',38],['vy_pact_idle',30],['vy_dash',0],['vy_lance',0]]){
   const frames=r?kvbDecalFrames(name,kvbS(r)):kvbBeamFrames(name),c=document.createElement('canvas');c.width=frames[0].width*frames.length;c.height=frames[0].height;const g=c.getContext('2d');
   frames.forEach((f,i)=>g.drawImage(f,i*f.width,0));const data=g.getImageData(0,0,c.width,c.height).data;let soft=0;for(let i=3;i<data.length;i+=4)if(data[i]&&data[i]!==255)soft++;
   strips[name]={frames:frames.length,cell:[frames[0].width,frames[0].height],radius:r,soft,png:c.toDataURL()};
  }
  // Clasificación: un buff de velocidad ajeno también activa la antigua condición del aura.
  player.portSpeedTimer=0;player.portSpeedBonus=0;let pactAuraFromOtherBuff=false;const loop=window.kvbLoopDecal;
  window.kvbLoopDecal=function(name,...a){if(name==='vy_pact_idle')pactAuraFromOtherBuff=true;return loop.call(this,name,...a);};
  try{kitBuff(allies[0],player,1000,{speed:.3});kvbOverlays('g');}finally{window.kvbLoopDecal=loop;}
  const observations=[{id:'A-FX-veyra-h3',finding:'Pact aura also appears after unrelated speed buff',reproduced:pactAuraFromOtherBuff,state:pactAuraFromOtherBuff?'EN_CORRECCION':'NOT_REPRODUCED'}];
  state='menu';return {checks,strips,observations};
 });
 fs.mkdirSync(path.join(OUT,'atlases'),{recursive:true});for(const [name,v] of Object.entries(result.strips)){fs.writeFileSync(path.join(OUT,'atlases',name+'.png'),Buffer.from(v.png.split(',')[1],'base64'));delete v.png;assert.equal(v.soft,0);}
 fs.writeFileSync(path.join(OUT,'verification.json'),JSON.stringify({...result,errors},null,2)+'\n');console.log(JSON.stringify({checks:result.checks,errors}));assert.equal(errors.length,0);assert(result.checks.every(c=>c.pass));
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
