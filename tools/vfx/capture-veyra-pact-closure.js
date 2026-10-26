'use strict';
// Component closure: actual H3 cast; A/B/A swaps only its visual entries, never combat.
// AB samples restore body pose, simulation RNG, particles and the original pool.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),H=require('../lib/serve');
const ROOT=path.resolve(__dirname,'../..'),D='art-source/entregas/veyra-pact-20261025/cierre-01';
const out=process.env.OUT||D+'/matrix-'+(process.env.MOBILE?'mobile':'desktop');fs.mkdirSync(out,{recursive:true});
(async()=>{const site=await H.startSite(),browser=await H.launch();const errors=[],rows=[];
try{const vp=process.env.MOBILE?{width:844,height:390}:{width:1280,height:720},p=await browser.newPage({viewport:vp});p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{let s=123456;Math.random=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);Date.now=()=>1792684800000;});
 await p.goto(site.url+'/?lazy=0');await p.waitForFunction(()=>typeof startRun==='function'&&assetsAllReady());await p.waitForTimeout(1000);
 await p.evaluate(src=>{const cand=KVB_DEC.vy_pact,fx=KVB_FX['veyra.pact'];eval('const VY='+src.match(/const VY = (\[[^;]+);/)[1]+';'+src.slice(src.indexOf('  const pactPaint ='),src.indexOf("  kvbDefDecal('vy_pact_idle'")));KVB_FX['veyra.pact']=fx;window.pactParentDef=KVB_DEC.vy_pact;KVB_DEC.vy_pact=cand;},fs.readFileSync(D+'/source-before.js','utf8'));
 await p.evaluate(()=>{loop=()=>{};cromaEnsureLoaded('veyra_alt1');cromaEnsureLoaded('veyra_croma');});
 await p.waitForFunction(()=>CHAMP_PACK.croma_veyra_alt1?.ready&&CHAMP_PACK.skin_quality_veyra?.ready);
 for(const arena of (process.env.ARENAS||'bosque,hielo,infernal,laberinto,acuatica,minas').split(','))for(const look of (process.env.LOOKS||'base,gear,alt1,croma,set').split(','))for(const density of (process.env.DENSITIES||'dense,sparse').split(',')){
 const r=await p.evaluate(({arena,look,density,canary})=>{
 let vt=1000,seed=777;const pn=performance.now,rnd=Math.random;performance.now=()=>vt;Math.random=()=>{seed^=seed<<13;seed>>>=0;seed^=seed>>17;seed^=seed<<5;seed>>>=0;return seed/4294967296;};
 const k='veyra';netMatch=null;save.stash=[];for(const s of Object.values(save.champions)){s.unlocked=true;s.level=20;s.xp=0;s.equipment={};s.croma=null;s.cosmeticSkin='';s.inventory=[];s.talents={nodes:{},mastery:null,masteryNodes:{}};}
 if(look!=='base'){const ids=look==='set'?setPieceIds('quality_veyra'):[];if(ids.length)for(const id of ids){const it=makeDesignedItem(id);stashItems().push(it);equipItem(k,it.uid);}else for(const type of ['arma','casco','pechera','botas']){const it=makeItem(type,'legendario');stashItems().push(it);equipItem(k,it.uid);}}
 if(look==='set')delete save.champions[k].cosmeticSkin;if(look==='alt1')save.champions[k].croma='veyra_alt1';if(look==='croma')save.champions[k].croma='veyra_croma';invalidatePassiveCache();
 selectedClass=k;currentArena=arena;lobbyAllies=['tanque','soporte'];startRun(1);document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));state='playing';enemies=[];spawnTimer=arenaHazardTimer=1e9;
 for(const [dx,dy]of(density==='dense'?[[-18,-45],[18,-45],[0,-20]]:[[0,-45]])){const e=spawnEnemy('esqueleto');Object.assign(e,{x:player.x+dx,y:player.y+dy,hp:1e7,maxHp:1e7,speed:0,baseSpeed:0,dmg:0});}
 for(const a of allies){a.x=player.x-40;a.y=player.y+14;a.stunTimer=1e9;}player.energy=1e4;player.cds=[0,0,0];player.fx=1;player.fy=0;
 const shake=vfxShake,float=floatText,cam=CAM_SUBJECT;vfxShake=()=>{};floatText=()=>{};CAM_SUBJECT={x:player.x,y:player.y};
 let bodyDraws=0;const origMip=artMipDraw,bodyAtlas=CHAMP_PACK[setSkinPackKey(player,k)]?.atlas;artMipDraw=function(im,...args){if(im===bodyAtlas)bodyDraws++;return origMip(im,...args);};
 const cv=document.getElementById('game'),render0=render,arr=[vX,vY,vVX,vVY,vLife,vMax,vSize,vGrav,vKind,vPrio];let last;
 const snap=()=>({pose:[...heroes,...enemies].map(e=>({e,an:e._an?JSON.parse(JSON.stringify(e._an)):null,cast:e._animCastKind})),seed,count:vCount,particles:arr.map(a=>a.slice()),colors:vCol.slice()});
 const restore=s=>{seed=s.seed;vCount=s.count;arr.forEach((a,i)=>a.set(s.particles[i]));for(let i=0;i<vCol.length;i++)vCol[i]=s.colors[i];for(const t of s.pose){if(t.an)t.e._an=JSON.parse(JSON.stringify(t.an));else delete t.e._an;if(t.cast===undefined)delete t.e._animCastKind;else t.e._animCastKind=t.cast;}};
 const mask=document.createElement('canvas');mask.width=cv.width;mask.height=cv.height;const mg=mask.getContext('2d'),origEnemy=drawEnemyBody,di=CanvasRenderingContext2D.prototype.drawImage;let recording=false,cupDraws=0;
 drawEnemyBody=function(e){recording=true;try{return origEnemy(e);}finally{recording=false;}};
 CanvasRenderingContext2D.prototype.drawImage=function(im,...a){if(this===ctx){if(recording){mg.setTransform(ctx.getTransform());mg.globalAlpha=ctx.globalAlpha;mg.imageSmoothingEnabled=false;di.call(mg,im,...a);}if(KVB.pool.some(e=>e.name==='vy_pact'&&e.frames?.includes(im)))cupDraws++;}return di.call(this,im,...a);};
 render=function(){last=snap();mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,cv.width,cv.height);return render0();};
 const step=()=>{vt+=16;CAM_LEAD_X=CAM_LEAD_Y=0;update(16);render();};for(let i=0;i<20;i++)step();_arenaTitleUntil=0;render();const scene=cv.toDataURL();
 const start=vt;castAbility(player,player.cls.skills[2],false,2);const ab=[],samples=[];
 const stateFingerprint=()=>JSON.stringify({pool:KVB.pool.map(e=>[e.name,e.x,e.y,e.t,e.dur]),objects:portadorObjects.map(o=>[o.kind,o.id,o.x,o.y,o.life]),heroes:heroes.map(h=>[h.x,h.y,h.hp,h.shield,h.buffs]),signatures:championSignatures});
 for(const t of [80,240,480,800]){while(vt-start<t)step();const elapsed=vt-start,before=cv.toDataURL(),pix=ctx.getImageData(0,0,cv.width,cv.height).data,mp=mg.getImageData(0,0,cv.width,cv.height).data,pre=last,post=snap(),s0=stateFingerprint(),active=KVB.pool;
 const isPact=e=>e.name==='vy_pact';const cup=active.filter(isPact);KVB.pool=active.filter(e=>!isPact(e));restore(pre);render();const absent=cv.toDataURL(),base=ctx.getImageData(0,0,cv.width,cv.height).data;
 const parentDef=KVB_DEC.vy_pact,oldKeys=Object.keys(KVB_CACHE).filter(k=>k.startsWith('vy_pact@'));
 // Source-before's painter and launch event are restored in the page below.
 KVB_DEC.vy_pact=window.pactParentDef;for(const k of oldKeys)delete KVB_CACHE[k];
 const parentFrames=kvbDecalFrames('vy_pact',kvbS(38));KVB_DEC.vy_pact=parentDef;for(const k of Object.keys(KVB_CACHE))if(k.startsWith('vy_pact@'))delete KVB_CACHE[k];
 KVB.pool=active.filter(e=>!isPact(e)).concat(cup.map(e=>({...e,frames:parentFrames,x:e.x,y:e.y+84,w:76,h:76})));
 restore(pre);render();const parent=cv.toDataURL();
 KVB.pool=active;restore(pre);render();if(canary&&cup.length){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#ff00ff';ctx.fillRect(0,0,cv.width,cv.height);ctx.restore();}
 const restored=cv.toDataURL();let opaque=0,retained=0;const final=canary?ctx.getImageData(0,0,cv.width,cv.height).data:pix;for(let z=0;z<mp.length;z+=4)if(mp[z+3]>=250){opaque++;if(Math.max(Math.abs(final[z]-base[z]),Math.abs(final[z+1]-base[z+1]),Math.abs(final[z+2]-base[z+2]))<=24)retained++;}
 ab.push({t,elapsed,before,parent,absent,restored,restore:before===restored,state:s0===stateFingerprint(),opaque,retained,visible:opaque?retained/opaque:0,cup:cup.length});restore(post);samples.push({elapsed,cup:cup.map(e=>({x:e.x,y:e.y,t:e.t,dur:e.dur,w:e.w,h:e.h,layer:e.layer})),buffs:player.buffs});}
 artMipDraw=origMip;drawEnemyBody=origEnemy;CanvasRenderingContext2D.prototype.drawImage=di;render=render0;performance.now=pn;Math.random=rnd;vfxShake=shake;floatText=float;CAM_SUBJECT=cam;window.state='menu';
 return{arena,look,density,scene,ab,samples,cupDraws,bodyDraws,resolved:{skin:activeSetSkinId(player),pack:setSkinPackKey(player,k),equipment:Object.values(save.champions[k].equipment).filter(Boolean).length,setPieces:setN(player,'quality_veyra')}};
 },{arena,look,density,canary:!!process.env.CANARY});
 const hash=s=>crypto.createHash('sha256').update(Buffer.from(s.split(',')[1],'base64')).digest('hex');
 for(const a of r.ab)for(const key of ['before','parent','absent'])fs.writeFileSync(`${out}/${arena}-${look}-${density}-${a.t}-${key}.png`,Buffer.from(a[key].split(',')[1],'base64'));
 rows.push({...r,scene:undefined,sceneHash:hash(r.scene),ab:r.ab.map(a=>({...a,before:undefined,parent:undefined,absent:undefined,restored:undefined,beforeHash:hash(a.before),parentHash:hash(a.parent),restoredHash:hash(a.restored)}))});console.log(arena,look,density,r.cupDraws,Math.min(...r.ab.map(a=>a.visible)),r.ab.every(a=>a.restore&&a.state));
 }
 fs.writeFileSync(out+'/capture.json',JSON.stringify({rows,errors},null,2));if(errors.length||rows.some(r=>!r.cupDraws||!r.bodyDraws||r.ab.some(a=>!a.restore||!a.state||a.visible<.8)))process.exitCode=1;
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
