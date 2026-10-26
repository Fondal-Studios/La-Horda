'use strict';
const fs=require('fs'),H=require('../lib/serve'),OUT=process.env.OUT;
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const site=await H.startSite(),browser=await H.launch(),errors=[],rows=[];try{
 const p=await browser.newPage({viewport:{width:844,height:390}});p.on('pageerror',e=>errors.push(e.message));await p.goto(site.url+'/?lazy=0');
 await p.waitForFunction(()=>assetsAllReady()&&CHAMP_PACK.nahir?.ready&&CHAMP_PACK.nahir_set?.ready);
 await p.evaluate(()=>{loop=()=>{};cromaEnsureLoaded('nahir_skin');});await p.waitForFunction(()=>CROMA_SKINS.nahir_skin.packs&&Object.values(CROMA_SKINS.nahir_skin.packs).every(k=>CHAMP_PACK[k]?.ready));
 for(const look of ['base','set','skin'])for(const tier4 of [false,true]){
  const r=await p.evaluate(({look,tier4})=>{
   selectedClass='nahir';currentArena='bosque';lobbyAllies=[];netMatch=null;const c=save.champions.nahir;
   Object.assign(c,{level:99,unlocked:true,equipment:{},inventory:[],cosmeticSkin:look==='set'?'exp_nahir':'',croma:look==='skin'?'nahir_skin':null,talents:{nodes:{},mastery:null,masteryNodes:{}}});
   for(const m of c.skillMastery)m.alloc=tier4?7:0;cromaAfterEquip('nahir');invalidatePassiveCache();startRun(1);state='playing';document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));enemies=[];spawnTimer=arenaHazardTimer=1e9;vfxShake=()=>{};CAM_SUBJECT={x:player.x,y:player.y};
   const refs=()=>portadorObjects.filter(o=>o.kind==='ex_reflection'&&o.life>0).map(o=>({id:o.id,x:o.x,y:o.y,owner:o.owner===player,pack:setSkinPackKey(o.owner,'nahir')}));
   let mirrorDraws=0,packDraws=[],beamDraws={nh_cut:0,nh_streak:0},beamGeometry=[],ufTextureDraws=0,ufEntities=[];
   const beam=kvbBeam,dp=drawChampPack,di=ctx.drawImage,up=ufPlay;
   kvbBeam=function(name,ax,ay,bx,by,w,dur,o){const ent=beam.apply(this,arguments);if(name==='nh_cut'||name==='nh_streak')beamGeometry.push({name,ax,ay,bx,by,w,dur,created:!!ent,len:ent?.len});return ent;};
   drawChampPack=function(k,h,...a){const ok=dp.call(this,k,h,...a);if(k==='nahir'&&h._codexSet)packDraws.push({pack:setSkinPackKey(h,k),ok,x:h.x,y:h.y});return ok;};
   ufPlay=function(...a){const ent=up.apply(this,a);if(a[0]==='nahir'&&ent)ufEntities.push(...(Array.isArray(ent)?ent:[ent]));return ent;};
   ctx.drawImage=function(im,...a){for(const name of ['nh_cut','nh_streak'])if(KVB_CACHE['b:'+name]?.includes(im))beamDraws[name]++;if(KVB_CACHE['m:nh_mirror']?.includes(im))mirrorDraws++;if(ufEntities.some(e=>e.frames?.includes(im)))ufTextureDraws++;return di.call(this,im,...a);};
   const step=(n=8)=>{for(let i=0;i<n;i++){update(16);render();}};step(20);
   const casts=[];for(const slot of [0,1,2]){player.energy=1e5;player.cds=[0,0,0];const origin={x:player.x,y:player.y};useSkill(slot,{x:player.x+180,y:player.y,dx:1,dy:0});casts.push({slot,origin,to:{x:player.x,y:player.y},cue:JSON.parse(JSON.stringify(player.exCue)),refs:refs()});step();}
   runLevel=Math.max(runLevel,ULT_MIN_ARENA_LEVEL);player.ultCharge=player.ultMax;player.ultCd=0;useUltimate();const gallery=refs();step(16);
   const preview=document.getElementById('game').toDataURL();
   const result={look,tier4,selectedPack:setSkinPackKey(player,'nahir'),casts,gallery,beamGeometry,beamDraws,mirrorDraws,reflectionDrawCalls:packDraws.length,reflectionPacks:[...new Set(packDraws.filter(x=>x.ok).map(x=>x.pack))],ufReturnedEntities:ufEntities.length,ufEntityKeys:ufEntities.slice(0,1).map(Object.keys),ufTextureDraws,preview,error:KVB.err||null};
   ctx.drawImage=di;drawChampPack=dp;kvbBeam=beam;ufPlay=up;return result;
  },{look,tier4});
  fs.writeFileSync(OUT+'/NEXT_NAHIR_'+look+'_'+(tier4?'tier4':'base')+'.png',Buffer.from(r.preview.split(',')[1],'base64'));delete r.preview;rows.push(r);
 }
 fs.writeFileSync(OUT+'/NEXT_NAHIR_CONSUMERS.json',JSON.stringify({rows,errors,scope:'18 normal casts +6 ultimates with existing sources only. Pack selection/actual beam textures, no new assets, full visual approval, online or simulation parity.'},null,2));console.log(JSON.stringify({rows:rows.map(r=>({look:r.look,tier4:r.tier4,pack:r.selectedPack,reflectionPacks:r.reflectionPacks,beamDraws:r.beamDraws,mirrorDraws:r.mirrorDraws,ufEntities:r.ufReturnedEntities,ufTextureDraws:r.ufTextureDraws})),errors}));
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
