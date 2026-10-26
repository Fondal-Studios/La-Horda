'use strict';
// Actual input/update/render lifecycle. Diagnostic evidence, not an Art Gate.
const fs=require('fs'),H=require('../lib/serve');
const out=process.env.OUT||'art-source/entregas/libertador-kit-20261025/cierre-03';
fs.mkdirSync(out,{recursive:true});
(async()=>{const site=await H.startSite(),browser=await H.launch(),rows=[],errors=[];try{
const p=await browser.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>errors.push(e.message));
await p.goto(site.url+'/?lazy=0');await p.waitForFunction(()=>assetsAllReady()&&typeof libertadorFxStrip==='function');
for(const tier of [0,7])for(const slot of [0,2])for(const mode of ['free','hit','death',...(slot===2?['mounted']:[])]){
const r=await p.evaluate(({tier,slot,mode})=>{
 loop=()=>{};let vt=1000;performance.now=()=>vt;netMatch=null;
 for(const c of Object.values(save.champions)){Object.assign(c,{unlocked:true,level:20,equipment:{},inventory:[],talents:{nodes:{},mastery:null,masteryNodes:{}}});for(const m of c.skillMastery)m.alloc=tier;}
 selectedClass='libertador';currentArena='bosque';lobbyAllies=[];startRun(1);state='playing';document.querySelectorAll('.screen').forEach(e=>e.classList.add('hidden'));enemies=[];spawnTimer=arenaHazardTimer=1e9;player.energy=1e4;player.cds=[0,0,0];player.x=0;player.y=0;
 if(mode==='hit'){const e=spawnEnemy('esqueleto');Object.assign(e,{x:100,y:0,hp:1e7,maxHp:1e7,speed:0,baseSpeed:0,dmg:0});}
 if(mode==='mounted'){player.smMounted=true;player.smMountedTimer=10000;}
 sfaPool.length=0;champFx.length=0;const start={x:player.x,y:player.y};
 const accepted=useSkill(slot,{x:500,y:0,dx:1,dy:0});
 const cue=sfaPool.find(s=>s.theme.startsWith('libertador_')),L=cue?Math.hypot(cue.bx-cue.x,cue.by-cue.y):0;
 const n=sfaPool.length,rejected=useSkill(slot,{x:500,y:0,dx:1,dy:0}),duplicate=sfaPool.length>n;
 const samples=[],di=CanvasRenderingContext2D.prototype.drawImage;let draws=[];
 CanvasRenderingContext2D.prototype.drawImage=function(im,...a){if([...sfaCache.entries()].some(([k,v])=>k.includes('libertador_')&&v.cv===im))draws.push({frame:a[0]/128,width:a[7],x:a[5]});return di.call(this,im,...a);};
 for(let i=0;i<100;i++){if(mode==='death'&&i===10)player.alive=false;vt+=16;update(16);draws=[];render();samples.push({ms:(i+1)*16,phase:player.smPhase,alive:player.alive,x:player.x,y:player.y,left:player.smDashLeft,impact:player.smBayoImpTimer||0,draws:draws.slice(),cueAlive:sfaPool.includes(cue)});}
 CanvasRenderingContext2D.prototype.drawImage=di;
 return{tier,slot,mode,accepted,rejected,duplicate,initialCue:cue?{theme:cue.theme,L,dur:cue.dur}:null,start,samples};
},{tier,slot,mode});rows.push(r);console.log(tier,slot,mode,JSON.stringify({accepted:r.accepted,frames:[...new Set(r.samples.flatMap(s=>s.draws.map(d=>d.frame)))],last:r.samples.filter(s=>s.draws.length).at(-1)?.ms}));
}
fs.writeFileSync(out+'/LIFECYCLE.json',JSON.stringify({rows,errors,scope:'Actual useSkill, 16ms updates, real renderer; base/tier4 free/hit/death/mounted. Diagnostic, not full multiplayer or visual gate.'},null,2));if(errors.length||rows.some(r=>!r.accepted||r.rejected!==false||r.duplicate||r.samples.some(s=>s.draws.length&&(!s.alive||!['bayo','charge'].includes(s.phase)))))process.exitCode=1;
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
