'use strict';
const fs=require('fs'),path=require('path'),H=require(path.resolve('tools/lib/serve'));
const D=__dirname;
(async()=>{const site=await H.startSite(),b=await H.launch(),errors=[],rows=[];try{const p=await b.newPage({viewport:{width:844,height:390}});p.on('pageerror',e=>errors.push(e.message));await p.goto(site.url+'/?lazy=0');await p.waitForFunction(()=>assetsAllReady()&&typeof SFA_BIND==='object');
for(const mode of ['resin-empty','resin-hit','salt-empty','reaction','distill-zero','distill-five','alembic']){
 const r=await p.evaluate(mode=>{loop=()=>{};let t=1000;performance.now=()=>t;for(const s of Object.values(save.champions)){s.unlocked=true;s.level=20;s.equipment={};s.inventory=[];s.croma=null;s.cosmeticSkin='';s.talents={nodes:{},mastery:null,masteryNodes:{}};}selectedClass='morwen';currentArena='bosque';lobbyAllies=[];startRun(1);state='playing';document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));enemies=[];spawnTimer=arenaHazardTimer=1e9;for(let i=0;i<20;i++){t+=16;update(16);}player.energy=1e4;player.cds=[0,0,0];player.aim={x:player.x+100,y:player.y,dx:1,dy:0};player.fx=1;player.fy=0;
 if(mode==='resin-hit'||mode==='reaction'){const e=spawnEnemy('esqueleto');Object.assign(e,{x:player.x+100,y:player.y,hp:1e6,maxHp:1e6,dmg:0,speed:0});}
 if(mode==='reaction'){castAbility(player,player.cls.skills[0],false,0);player.cds=[0,0,0];player.energy=1e4;}
 player.portResidue=mode==='distill-five'?5:0;player.slowTimer=1000;player.burnTimer=1000;const before={shield:player.shield,residue:player.portResidue,marks:JSON.parse(JSON.stringify(enemies.map(e=>e._portMarks)))};let draws=0;const di=ctx.drawImage;ctx.drawImage=function(im,...a){if([...sfaCache.entries()].some(([k,v])=>k.includes('alchemy')&&v.cv===im))draws++;return di.call(this,im,...a)};
 const slot=mode.startsWith('resin')?0:(mode.startsWith('salt')||mode==='reaction')?1:2;
 if(mode==='alembic'){player.ultCharge=player.ultMax;player.ultCd=0;runLevel=ULT_MIN_ARENA_LEVEL;castAbility(player,player.cls.ultimate,true);}else castAbility(player,player.cls.skills[slot],false,slot);
 const afterCast={shield:player.shield,residue:player.portResidue,slow:player.slowTimer,burn:player.burnTimer,marks:JSON.parse(JSON.stringify(enemies.map(e=>e._portMarks))),objects:portadorObjects.map(o=>({kind:o.kind,life:o.life,r:o.r}))};for(let i=0;i<16;i++){t+=16;update(16);render();}ctx.drawImage=di;return{mode,before,afterCast,draws,packReady:CHAMP_PACK.morwen?.ready,pool:sfaPool.map(s=>({art:s.art,theme:s.theme,r:s.r,t:s.t,dur:s.dur})),png:document.getElementById('game').toDataURL()};},mode);
 fs.writeFileSync(path.join(D,'morwen-'+mode+'.png'),Buffer.from(r.png.split(',')[1],'base64'));delete r.png;rows.push(r);
}
fs.writeFileSync(path.join(D,'NEXT_MORWEN_CASTS.json'),JSON.stringify({rows,errors,scope:'Read-only runtime audit before production; no new art, no visual gate approval. Current Maura candidate; Morwen files unchanged from main.'},null,2));console.log(rows.map(r=>({mode:r.mode,draws:r.draws,before:r.before,after:r.afterCast})));if(errors.length)process.exitCode=1;
}finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1});
