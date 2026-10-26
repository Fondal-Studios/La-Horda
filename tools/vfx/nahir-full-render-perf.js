'use strict';
const fs=require('fs'),H=require('../lib/serve');
const OUT=process.env.OUT||'art-source/entregas/nahir-echo-20261026/cierre-01';
(async()=>{const site=await H.startSite(),b=await H.launch(),rows=[];try{
 for(const mobile of [false,true])for(const enabled of [false,true]){
 const p=await b.newPage({viewport:mobile?{width:844,height:390}:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{let seed=73;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);Date.now=()=>1792684800000;});
 await p.goto(site.url+'/?lazy=0');await p.waitForFunction(()=>assetsAllReady()&&typeof KVB_FX==='object');
 if(process.env.ERRANTE){await p.evaluate(()=>skinFxLoadSet('errante'));await p.waitForFunction(()=>vfxSprReady('sk_errante_cuts')&&vfxSprReady('sk_errante_burst'));}
 const result=await p.evaluate(async ({enabled,errante})=>{loop=()=>{};selectedClass='nahir';currentArena='infernal';lobbyAllies=['tanque','soporte'];if(errante){save.champions.musashi.cosmeticSkin='errante';save.cosmeticUnlocks={...save.cosmeticUnlocks,errante:true};}startRun(1);state='playing';document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));enemies=[];spawnTimer=arenaHazardTimer=1e9;
 for(let j=0;j<12;j++){const e=spawnEnemy('esqueleto');Object.assign(e,{x:player.x+80*Math.cos(j),y:player.y+80*Math.sin(j),hp:1e7,maxHp:1e7,speed:0,baseSpeed:0,dmg:0});}player.hp=player.maxHp=1e7;player.aim={x:player.x+180,y:player.y,dx:1,dy:0};
 const now=performance.now.bind(performance),di=CanvasRenderingContext2D.prototype.drawImage,clear=ctx.clearRect;let draws=0,clears=0;
 ctx.clearRect=function(...a){clears++;return clear.apply(this,a)};
 CanvasRenderingContext2D.prototype.drawImage=function(im,...a){const candidate=this===ctx&&KVB.pool.some(e=>e.beam&&e.frames===kvbBeamFrames('nh_cut')&&e.frames.includes(im));if(candidate)draws++;return di.call(this,im,...a)};
 let clock=1000;performance.now=()=>clock;const samples=[];
 for(let i=0;i<360;i++){if(i%60===0){for(let j=0;j<3;j++){player.cds=[0,0,0];player.energy=1e5;useSkill(1,{x:player.x+180,y:player.y,dx:1,dy:0});}joyActive=true;joyVec={x:Math.SQRT1_2,y:Math.SQRT1_2};for(let j=0;j<220;j++){clock+=16;update(16);}joyActive=false;joyVec={x:0,y:0};player.cds=[0,0,0];player.energy=1e5;useSkill(2,{x:player.x+240,y:player.y,dx:1,dy:0});for(const [j,e]of enemies.entries()){e.x=player.x+80*Math.cos(j);e.y=player.y+80*Math.sin(j);}}clock+=16;update(16);const echoes=KVB.pool.filter(e=>e.beam&&e.alpha===.7);if(!enabled)echoes.forEach(e=>e.alpha=0);const t=now();render();const elapsed=now()-t;if(!enabled)echoes.forEach(e=>e.alpha=.7);if(i>=20)samples.push(elapsed);await new Promise(requestAnimationFrame);}
 performance.now=now;CanvasRenderingContext2D.prototype.drawImage=di;ctx.clearRect=clear;samples.sort((a,b)=>a-b);return{skin:activeSetSkinId(player),samples:samples.length,p50:samples[Math.floor(samples.length*.5)],p95:samples[Math.floor(samples.length*.95)],max:samples.at(-1),drawAttempts:draws,clears,heroHP:player.hp};},{enabled,errante:!!process.env.ERRANTE});
 rows.push({mobile,enabled,...result,errors});await p.close();}
 fs.writeFileSync(OUT+'/FULL_RENDER_PERFORMANCE.json',JSON.stringify({rows,scope:'Independent seeded runs, 12 enemies + 2 allies, 360 update/render frames each with RAF; first20 excluded. Actual render() clear cycle. Disabled mode suppresses echo alpha only; each60frames three real H2 casts plus220movement updates before H3, setup excluded from timings; measures JS submission time, not GPU completion, physical mobile or global-state parity. No new performance threshold introduced.'},null,2));console.log(rows);if(rows.some(r=>r.errors.length||r.clears<360||!r.drawAttempts))process.exitCode=1;
 }finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1});
