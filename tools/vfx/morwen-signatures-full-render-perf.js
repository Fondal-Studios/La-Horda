'use strict';
const fs=require('fs'),H=require('../lib/serve');
const OUT=process.env.OUT||'art-source/entregas/morwen-kit-20261025/cierre-07';
(async()=>{const site=await H.startSite(),b=await H.launch(),rows=[];try{
 for(const mobile of [false,true])for(const enabled of [false,true]){
 const p=await b.newPage({viewport:mobile?{width:844,height:390}:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{let seed=73;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);Date.now=()=>1792684800000;});
 await p.goto(site.url+'/?lazy=0');await p.waitForFunction(()=>assetsAllReady()&&typeof drawMorwenNormalSignature==='function');
 const result=await p.evaluate(async enabled=>{loop=()=>{};selectedClass='morwen';currentArena='infernal';lobbyAllies=['tanque','soporte'];startRun(1);state='playing';document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));enemies=[];spawnTimer=arenaHazardTimer=1e9;
 for(let j=0;j<12;j++){const e=spawnEnemy('esqueleto');Object.assign(e,{x:player.x+80*Math.cos(j),y:player.y+80*Math.sin(j),hp:1e7,maxHp:1e7,speed:0,baseSpeed:0,dmg:0});}player.hp=player.maxHp=1e7;player.aim={x:player.x+180,y:player.y,dx:1,dy:0};
 const now=performance.now.bind(performance),di=CanvasRenderingContext2D.prototype.drawImage,clear=ctx.clearRect;let draws=0,clears=0;
 ctx.clearRect=function(...a){clears++;return clear.apply(this,a)};
 CanvasRenderingContext2D.prototype.drawImage=function(im,...a){const candidate=this===ctx&&(im===morwenSignatureAtlas);if(candidate){draws++;if(!enabled)return;}return di.call(this,im,...a)};
 let clock=1000;performance.now=()=>clock;const samples=[];
 for(let i=0;i<220;i++){if(i%45===0){player.cds=[0,0,0];player.energy=1e4;for(let slot=0;slot<3;slot++)castAbility(player,player.cls.skills[slot],false,slot);}clock+=16;update(16);const t=now();render();const elapsed=now()-t;if(i>=20)samples.push(elapsed);await new Promise(requestAnimationFrame);}
 performance.now=now;CanvasRenderingContext2D.prototype.drawImage=di;ctx.clearRect=clear;samples.sort((a,b)=>a-b);return{samples:samples.length,p50:samples[100],p95:samples[190],max:samples.at(-1),drawAttempts:draws,clears,heroHP:player.hp};},enabled);
 rows.push({mobile,enabled,...result,errors});await p.close();}
 fs.writeFileSync(OUT+'/FULL_RENDER_PERFORMANCE.json',JSON.stringify({rows,scope:'Independent seeded runs, 12 enemies + 2 allies, 220 update/render frames each with RAF; first20 excluded. Actual render() clear cycle. Disabled mode suppresses only candidate canvas draws; measures JS submission time, not GPU completion, physical mobile or global-state parity. No new performance threshold introduced.'},null,2));console.log(rows);if(rows.some(r=>r.errors.length||r.clears<220||!r.drawAttempts))process.exitCode=1;
 }finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1});
