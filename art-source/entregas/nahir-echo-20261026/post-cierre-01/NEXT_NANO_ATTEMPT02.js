'use strict';
// Read-only next-block audit. No new art or production approval.
const fs=require('fs'),H=require('../lib/serve'),OUT=process.env.OUT;
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const site=await H.startSite(),b=await H.launch(),rows=[],errors=[];
try{const p=await b.newPage({viewport:{width:844,height:390}});p.on('pageerror',e=>errors.push(e.message));
await p.addInitScript(()=>{requestAnimationFrame=()=>0;});await p.goto(site.url+'/?lazy=0');
await p.waitForFunction(()=>assetsAllReady()&&CHAMP_PACK.nano_gm?.ready,null,{polling:100});
for(const slot of [0,1,2,3]){
 const result=await p.evaluate(slot=>{loop=()=>{};selectedClass='nano_gm';currentArena='bosque';lobbyAllies=[];netMatch=null;
 const c=save.champions.nano_gm;Object.assign(c,{level:99,unlocked:true,equipment:{},inventory:[],cosmeticSkin:'',croma:null,talents:{nodes:{},mastery:null,masteryNodes:{}}});for(const m of c.skillMastery)m.alloc=0;
 invalidatePassiveCache();startRun(1);state='playing';document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));enemies=[];spawnTimer=arenaHazardTimer=1e9;
 const calls=[],oldFx=kvbFx;kvbFx=function(...args){calls.push(args);return oldFx.apply(this,args);};const oldUf=ufPlay,uf=[];ufPlay=function(...args){uf.push(args.slice(0,4));return oldUf.apply(this,args);};
 const snap=()=>({hero:{x:player.x,y:player.y,shield:player.shield,alive:player.alive},objects:portadorObjects.filter(o=>o.owner===player).map(o=>({kind:o.kind,x:o.x,y:o.y,r:o.r,life:o.life,eff:o.eff,both:o.both})),pool:KVB.pool.filter(e=>e.name?.startsWith('ng_')).map(e=>({name:e.name,x:e.x,y:e.y,r:e.r,len:e.len,w:e.w,dur:e.dur,t:e.t}))});
 player.energy=1e5;player.cds=[0,0,0];player.ultCd=0;player.ultCharge=100;const before=snap();if(slot===3)useUltimate();else useSkill(slot,{x:player.x+180,y:player.y,dx:1,dy:0});const cast=snap();kvbFx=oldFx;ufPlay=oldUf;
 const draw=ctx.drawImage,draws={};ctx.drawImage=function(im,...args){for(const e of KVB.pool)if(e.name?.startsWith('ng_')&&e.frames?.includes(im))draws[e.name]=(draws[e.name]||0)+1;return draw.call(this,im,...args);};
 for(let i=0;i<16;i++){update(16);render();}ctx.drawImage=draw;const after256=snap(),png=document.getElementById('game').toDataURL();
 for(let i=0;i<330;i++)update(16);const after5536=snap();return{slot,before,cast,after256,after5536,calls,uf,draws,png,packReady:CHAMP_PACK.nano_gm.ready,scope:'Actual useSkill base/no talents/no equipment. Empty targets. Mobile viewport. Existing consumers only; no relay, contact matrix or ArtGate.'};},slot);
 fs.writeFileSync(OUT+'/NEXT_NANO_'+slot+'.png',Buffer.from(result.png.split(',')[1],'base64'));delete result.png;rows.push(result);
}
fs.writeFileSync(OUT+'/NEXT_NANO_CASTS.json',JSON.stringify({rows,errors},null,2));console.log(JSON.stringify({rows,errors}));
}finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
