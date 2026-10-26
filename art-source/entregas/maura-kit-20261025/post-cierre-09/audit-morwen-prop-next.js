'use strict';
const fs=require('fs'),path=require('path'),H=require(path.resolve('tools/lib/serve'));
(async()=>{const site=await H.startSite(),b=await H.launch(),errors=[];try{
 const p=await b.newPage({viewport:{width:844,height:390}});p.on('pageerror',e=>errors.push(e.message));await p.goto(site.url+'/?lazy=0');await p.waitForFunction(()=>assetsAllReady()&&typeof SFA_OBJ==='object');
 const r=await p.evaluate(()=>{
  loop=()=>{};let t=1000;performance.now=()=>t;for(const s of Object.values(save.champions)){s.unlocked=true;s.level=20;s.equipment={};s.inventory=[];s.croma=null;s.cosmeticSkin='';s.talents={nodes:{},mastery:null,masteryNodes:{}};}
  selectedClass='morwen';currentArena='bosque';startRun(1);state='playing';document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));heroes=[player];enemies=[];spawnTimer=arenaHazardTimer=1e9;
  for(let i=0;i<20;i++){t+=16;update(16);}player.aim={x:player.x+100,y:player.y,dx:1,dy:0};player.ultCharge=player.ultMax;player.ultCd=0;runLevel=ULT_MIN_ARENA_LEVEL;
  let calls=0,draws=0;const original=SFA_OBJ.alembic.draw,di=ctx.drawImage;SFA_OBJ.alembic.draw=function(...a){calls++;return original.apply(this,a)};
  ctx.drawImage=function(im,...a){if([...sfaPropCache.entries()].some(([k,v])=>k==='m|alchemy|flask|3'&&v.cv===im))draws++;return di.call(this,im,...a)};
  castAbility(player,player.cls.ultimate,true);const atCast=portadorObjects.map(o=>({kind:o.kind,life:o.life,maxLife:o.maxLife,r:o.r,x:o.x,y:o.y})),samples=[];
  for(let age=16;age<=8032;age+=16){t+=16;update(16);render();if([96,256,4000,7904,8032].includes(age)){samples.push({age,calls,draws,objects:portadorObjects.filter(o=>o.kind==='alembic').map(o=>({life:o.life,r:o.r})),pool:sfaPool.filter(s=>s.theme?.startsWith('alchemy')).map(s=>({art:s.art,t:s.t,dur:s.dur})),png:document.getElementById('game').toDataURL()});}}
  SFA_OBJ.alembic.draw=original;ctx.drawImage=di;return{atCast,samples,propCache:[...sfaPropCache.keys()].filter(k=>k.includes('alchemy')),packReady:CHAMP_PACK.morwen.ready};
 });
 for(const row of r.samples){fs.writeFileSync(path.join(__dirname,'morwen-alembic-'+row.age+'.png'),Buffer.from(row.png.split(',')[1],'base64'));delete row.png;}
 r.errors=errors;r.scope='Read-only real renderer audit of existing alembic, separate motif cache; no art produced or approved.';fs.writeFileSync(path.join(__dirname,'NEXT_MORWEN_PROP.json'),JSON.stringify(r,null,2));console.log(r);if(errors.length)process.exitCode=1;
 }finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1});
