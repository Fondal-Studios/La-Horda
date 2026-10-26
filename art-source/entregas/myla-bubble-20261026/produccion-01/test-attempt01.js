'use strict';
const fs=require('fs'),H=require('../lib/serve'),OUT=process.env.OUT;fs.mkdirSync(OUT,{recursive:true});
(async()=>{const site=await H.startSite(),b=await H.launch(),errors=[];try{const p=await b.newPage({viewport:{width:844,height:390}});p.on('pageerror',e=>errors.push(e.message));await p.goto(site.url+'/?lazy=0');await p.waitForFunction(()=>assetsAllReady()&&CHAMP_PACK.myla?.ready);const result=await p.evaluate(()=>{loop=()=>{};selectedClass='myla';currentArena='bosque';lobbyAllies=[];netMatch=null;const c=save.champions.myla;Object.assign(c,{level:99,unlocked:true,equipment:{},inventory:[],talents:{nodes:{},mastery:null,masteryNodes:{}}});invalidatePassiveCache();startRun(1);state='playing';document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));enemies=[];spawnTimer=arenaHazardTimer=1e9;const checks=[];const check=(name,ok,data)=>checks.push({name,ok,data});
function cast(){player.energy=1e5;player.cds=[0,0,0];useSkill(2,{x:player.x,y:player.y,dx:1,dy:0});return KVB.pool.filter(e=>e.name==='my_bubble_idle').at(-1);}
const bubble=cast();let draws=0;const original=ctx.drawImage;ctx.drawImage=function(img,...args){if(bubble.frames.includes(img))draws++;return original.call(this,img,...args);};
function draw(){draws=0;kvbDrawLayer('t');return draws;}
check('cast alive shield',bubble.alpha===.8&&draw()>0,{shield:player.shield});
const native=bubble.frames.map(c=>c.toDataURL());const state=JSON.stringify([player.hp,player.shield,player.shieldTimer]);let rng=0;const random=Math.random;Math.random=()=>{rng++;return .5;};draw();Math.random=random;check('drawing reads only state no RNG',state===JSON.stringify([player.hp,player.shield,player.shieldTimer])&&rng===0,{rng});
player.invulnTimer=0;damageHero(player,player.maxHp*.5,null);check('same-frame actual shield exhaustion',player.shield===0&&draw()===0,{hp:player.hp,shield:player.shield,alpha:bubble.alpha});
kvbUpdate(16);check('after update still hidden',draw()===0);
player.shield=30;check('late shield snapshot probe',draw()>0);player.shield=0;check('zero snapshot probe',draw()===0);
player.shield=30;player.alive=false;check('dead hidden',draw()===0);player.alive=true;
const b2=cast();check('recast observed',b2!==bubble&&b2.alpha===.8,{count:KVB.pool.filter(e=>e.name==='my_bubble_idle').length});
check('existing raster preserved',JSON.stringify(native)===JSON.stringify(b2.frames.map(c=>c.toDataURL())));
kvbUpdate(5000);check('TTL removes both',!KVB.pool.some(e=>e.name==='my_bubble_idle'));
ctx.drawImage=original;return{checks,pass:checks.every(x=>x.ok),limits:'Snapshot probes assign owner fields locally, not relay. Recast duplicates remain a measured pending issue. No six-arena or full combat parity claim.'};});fs.writeFileSync(OUT+'/STATE_TEST.json',JSON.stringify({result,errors},null,2));await p.screenshot({path:OUT+'/STATE_TEST.png'});console.log(JSON.stringify({result,errors}));}finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
