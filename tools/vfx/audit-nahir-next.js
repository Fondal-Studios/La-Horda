'use strict';
// Read-only next-component audit: real casts and consumers, no candidate art.
const fs=require('fs'),H=require('../lib/serve'),OUT=process.env.OUT;
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const site=await H.startSite(),browser=await H.launch(),errors=[];try{
 const p=await browser.newPage({viewport:{width:844,height:390}});p.on('pageerror',e=>errors.push(e.message));
 await p.goto(site.url+'/?lazy=0');await p.waitForFunction(()=>assetsAllReady()&&CHAMP_PACK.nahir?.ready);
 const result=await p.evaluate(()=>{
  loop=()=>{};selectedClass='nahir';currentArena='bosque';lobbyAllies=[];netMatch=null;
  const c=save.champions.nahir;Object.assign(c,{level:99,unlocked:true,equipment:{},inventory:[],cosmeticSkin:'',talents:{nodes:{},mastery:null,masteryNodes:{}}});for(const m of c.skillMastery)m.alloc=0;
  invalidatePassiveCache();startRun(1);state='playing';document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
  enemies=[];spawnTimer=arenaHazardTimer=1e9;vfxShake=()=>{};CAM_SUBJECT={x:player.x,y:player.y};
  const casts=[],events=[],packDraws=[],textureDraws={},ufEvents=[];
  const snapshot=()=>portadorObjects.filter(o=>o.kind==='ex_reflection').map(o=>({id:o.id,x:o.x,y:o.y,life:o.life,r:o.r,owner:o.owner===player,pack:setSkinPackKey(o.owner,'nahir')}));
  const fx=kvbFx;kvbFx=function(...a){events.push(a);return fx.apply(this,a);};
  const up=ufPlay;ufPlay=function(...a){ufEvents.push(a.slice(0,5));return up.apply(this,a);};
  const dp=drawChampPack;drawChampPack=function(k,h,...a){const okay=dp.call(this,k,h,...a);if(k==='nahir'&&h._codexSet)packDraws.push({key:k,pack:setSkinPackKey(h,k),okay,x:h.x,y:h.y});return okay;};
  const di=ctx.drawImage;ctx.drawImage=function(im,...a){for(const e of KVB.pool)if(e.name?.startsWith('nh_')&&e.frames?.includes(im))textureDraws[e.name]=(textureDraws[e.name]||0)+1;return di.call(this,im,...a);};
  const step=(n=8)=>{for(let i=0;i<n;i++){update(16);render();}};
  const cast=(slot,label)=>{player.energy=1e5;player.cds=[0,0,0];const origin={x:player.x,y:player.y},at=events.length;useSkill(slot,{x:player.x+180,y:player.y,dx:1,dy:0});const immediate={label,slot,origin,to:{x:player.x,y:player.y},cue:JSON.parse(JSON.stringify(player.exCue)),refs:snapshot(),events:events.slice(at).map(x=>x.slice())};step();casts.push(immediate);};
  step(20);cast(0,'H1 no targets');cast(2,'H3 no reflections/no targets');
  const enemy=spawnEnemy('esqueleto');Object.assign(enemy,{x:player.x+200,y:player.y,hp:1e7,maxHp:1e7,speed:0,baseSpeed:0,dmg:0});
  for(let i=1;i<=4;i++){cast(1,'H2 reflection '+i);enemy.x=player.x+100;enemy.y=player.y;cast(2,'H3 with '+Math.min(i,3)+' reflections');}
  runLevel=Math.max(runLevel,ULT_MIN_ARENA_LEVEL);player.ultCharge=player.ultMax;player.ultCd=0;const at=events.length;useUltimate();const ult={refs:snapshot(),events:events.slice(at),cue:JSON.parse(JSON.stringify(player.exCue))};step(16);const preview=document.getElementById('game').toDataURL();step(380);ult.after6336ms=snapshot();
  ctx.drawImage=di;drawChampPack=dp;ufPlay=up;kvbFx=fx;
  return {casts,ult,ufEvents,textureDraws,reflectionBodyDraws:packDraws.length,reflectionPackSamples:packDraws.slice(0,8),KVBerror:KVB.err||null,preview,scope:'Main Nahir consumers unchanged by Myla candidate; actual useSkill/useUltimate. Diagnostic only: no new art, candidate, ArtGate, multiplayer, full inventory or balance certification.'};
 });
 fs.writeFileSync(OUT+'/NEXT_NAHIR_DIAGNOSTIC.png',Buffer.from(result.preview.split(',')[1],'base64'));delete result.preview;
 fs.writeFileSync(OUT+'/NEXT_NAHIR_CASTS.json',JSON.stringify({result,errors},null,2));console.log(JSON.stringify({casts:result.casts.length,ufEvents:result.ufEvents,reflectionBodyDraws:result.reflectionBodyDraws,textureDraws:result.textureDraws,errors}));
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
