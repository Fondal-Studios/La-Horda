'use strict';
const fs=require('node:fs'),H=require('../lib/serve');
const OUT=process.env.OUT||'art-source/entregas/aelith-normal-kit-20261022/correccion-03';
(async()=>{fs.mkdirSync(OUT,{recursive:true});const site=await H.startSite(),browser=await H.launch();try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await H.goto(page,site.url);await H.waitFor(page,()=>typeof aelithFractureMark==='function'&&assetsAllReady());
 const r=await page.evaluate(()=>{
 const checks=[],check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
 netMatch=null;save.stash=[];for(const k in save.champions)Object.assign(save.champions[k],{unlocked:true,level:60,equipment:{},inventory:[],talents:{nodes:{},mastery:null,masteryNodes:{}}});selectedClass='aelith';currentArena='bosque';lobbyAllies=[];startRun(3);state='menu';enemies=[];runElapsedMs=1000;
 const mk=(x,y,extra={})=>{const e=spawnEnemy('esqueleto');Object.assign(e,{x:player.x+x,y:player.y+y,hp:1e7,maxHp:1e7,speed:0,dmg:0,...extra});return e;};
 const hit=mk(80,0),miss=mk(90,100),immune=mk(110,0,{cineT:5000}),lethal=mk(130,0,{hp:1}),boss=mk(150,0,{rank:'jefe'});
 player.energy=1e4;player.cds=[0,0,0];player.aim={x:player.x+200,y:player.y,dx:1,dy:0};
 castAbility(player,player.cls.skills[1],false,1);
 check('real line hit receives exact1800ms source',hit.aelithFractureFxStart===1000&&hit.aelithFractureFxEnd===2800&&hit.slowTimer===1800,hit.aelithFractureFxEnd);
 check('outside line not marked',miss.aelithFractureFxEnd===undefined);check('cinematic immunity not marked',immune.aelithFractureFxEnd===undefined);check('lethal hit not marked',!lethal.alive&&lethal.aelithFractureFxEnd===undefined);
 check('boss keeps actual capped slow with same visual duration',boss.slowAmt===.12&&boss.aelithFractureFxEnd===2800,{slow:boss.slowAmt,end:boss.aelithFractureFxEnd});
 portadorSlow(player,miss,.35,1800);check('unrelated slow does not create Fractura symbol',aelithSlowPhase(miss)===-1);
 for(const [time,phase] of [[1000,0],[1149,0],[1150,1],[1900,6],[2799,11],[2800,-1]]){runElapsedMs=time;check('single sand sequence time='+time,aelithSlowPhase(hit)===phase,aelithSlowPhase(hit));}
 runElapsedMs=1000;hit.slowTimer=6000;aelithFractureMark(hit,1800);runElapsedMs=1100;aelithFractureMark(hit,900);check('short recast cannot shorten previous contribution',hit.aelithFractureFxEnd===2800&&hit.aelithFractureFxStart===1000);
 runElapsedMs=1200;aelithFractureMark(hit,2400);check('long recast restarts using actual scaled duration',hit.aelithFractureFxEnd===3600&&aelithSlowPhase(hit)===0);
 runElapsedMs=3600;check('longer unrelated slow cannot extend own symbol',hit.slowTimer===6000&&aelithSlowPhase(hit)===-1);
 runElapsedMs=1200;aelithFractureMark(hit,2400);runElapsedMs=1300;hit.slowTimer=0;check('cleanse hides symbol immediately',aelithSlowPhase(hit)===-1);hit.slowTimer=1800;check('unrelated re-slow cannot revive cleared symbol',aelithSlowPhase(hit)===-1);aelithFractureMark(hit,2300);hit.slowAmt=0;check('cleared slow strength hides symbol',aelithSlowPhase(hit)===-1);hit.slowAmt=.35;hit.alive=false;check('death hides symbol',aelithSlowPhase(hit)===-1);hit.alive=true;runElapsedMs=1200;aelithFractureMark(hit,2400);runElapsedMs=1300;
 const cv=document.createElement('canvas');cv.width=1600;cv.height=1600;const g=cv.getContext('2d'),draw=g.drawImage.bind(g),calls=[];g.drawImage=function(...a){calls.push(a.slice(1));return draw(...a);};
 const visible=inView;inView=()=>true;let rng=0;const random=Math.random;Math.random=()=>{rng++;return .5;};
 for(const arena of ['bosque','hielo','infernal','laberinto','acuatica','minas']){
 currentArena=arena;const b=sfaBake('aura','aelith_slow',0),d=b.cv.getContext('2d').getImageData(0,0,b.cv.width,b.h).data;let soft=0,edge=0;const ink=Array(12).fill(0);for(let y=0;y<b.h;y++)for(let x=0;x<b.cv.width;x++){const a=d[(y*b.cv.width+x)*4+3];if(a){ink[Math.floor(x/b.w)]++;if(a!==255)soft++;if(x%b.w===0||x%b.w===15||y===0||y===19)edge++;}}
 check('native padded12 frames '+arena,b.w===16&&b.h===20&&b.n===12&&ink.every(x=>x>0)&&soft===0&&edge===0,{ink,soft,edge});
 }
 currentArena='bosque';calls.length=0;aelithDrawSlow(hit,g);hit.x+=35;hit.y+=12;aelithDrawSlow(hit,g);check('renderer follows actual moving target',calls.length===2&&calls[1][4]-calls[0][4]===35&&calls[1][5]-calls[0][5]===12,calls);
 const before=calls.length;inView=()=>false;aelithDrawSlow(hit,g);check('culling skips offscreen drawing',calls.length===before);inView=()=>true;aelithDrawSlow(hit,g);check('reentry keeps original phase',calls.length===before+1&&calls.at(-1)[0]===Math.floor((1300-1200)/2400*12)*16);
 window.SFA_OFF=true;calls.length=0;aelithDrawSlow(hit,g);check('SFA off hides mark without touching slow',calls.length===0&&hit.slowTimer===1800);window.SFA_OFF=false;
 const serialized=netSer(hit,0);check('existing snapshot serializes exact cosmetic provenance',serialized.aelithFractureFxStart===1200&&serialized.aelithFractureFxEnd===3600);
 check('renderer and baking consume no combat RNG',rng===0,rng);Math.random=random;inView=visible;
 const lm={};_netDeltaOf(lm,hit,true);aelithClearSlow(hit);const delta=_netDeltaOf(lm,hit,false);check('cleanup uses zero fields delivered by existing delta',delta.aelithFractureFxStart===0&&delta.aelithFractureFxEnd===0,delta);
 vfxResetRun();check('reset clears metadata without changing slow',hit.aelithFractureFxEnd===0&&hit.slowTimer===1800);
 const atlas=sfaBake('aura','aelith_slow',0);return {checks,atlas:atlas.cv.toDataURL()};
 });
 fs.writeFileSync(OUT+'/slow-sand-16x20x12.png',Buffer.from(r.atlas.split(',')[1],'base64'));delete r.atlas;const status=errors.length||r.checks.some(x=>!x.pass)?'FAIL':'PASS';fs.writeFileSync(OUT+'/slow-tests.json',JSON.stringify({status,...r,errors},null,2)+'\n');console.log(JSON.stringify({status,checks:r.checks.length,failed:r.checks.filter(x=>!x.pass),errors}));if(status==='FAIL')process.exitCode=1;
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
