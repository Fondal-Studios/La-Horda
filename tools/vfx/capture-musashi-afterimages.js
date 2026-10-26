'use strict';
// Musashi afterimage ownership: actual casts, paired main renderer and composite A/B/A.
// AB samples restore body pose, simulation RNG, particles and the original pool.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),H=require('../lib/serve');
const ROOT=path.resolve(__dirname,'../..'),D='art-source/entregas/musashi-kit-20261026/integracion-01';
const out=process.env.OUT||D+'/composite-'+(process.env.MOBILE?'mobile':'desktop');fs.mkdirSync(out,{recursive:true});
(async()=>{const site=await H.startSite(),browser=await H.launch();const errors=[],rows=[];
try{const vp=process.env.MOBILE?{width:844,height:390}:{width:1280,height:720},p=await browser.newPage({viewport:vp});p.on('pageerror',e=>errors.push(e.message));
 if(process.env.FREEZE_BOOT){const wf=p.waitForFunction.bind(p);p.waitForFunction=(fn,arg,o)=>wf(fn,arg,{polling:100,...o});}
 if(process.env.FREEZE_BOOT)await p.addInitScript(()=>{requestAnimationFrame=()=>0;performance.now=()=>1000;});
 if(process.env.BASELINE_MAIN)await p.route('**/js/champions/skill-fx-a/c/libertador.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(process.env.BASELINE_MAIN,'utf8')}));
 await p.addInitScript(()=>{let s=123456;Math.random=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);Date.now=()=>1792684800000;});
 if(process.env.PARENT_SIGNATURE)await p.route('**/js/skills/champion-signatures.js*',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync(process.env.PARENT_SIGNATURE,'utf8')}));
 await p.goto(site.url+'/?lazy=0');await p.waitForFunction(()=>typeof startRun==='function'&&assetsAllReady());await p.waitForTimeout(1000);
 await p.evaluate(()=>{loop=()=>{};});
 const parentSource=fs.readFileSync(D+'/before-champion-sprites.js','utf8');
 const parentFn=parentSource.slice(parentSource.indexOf('function drawMusashiAfterimages(){'),parentSource.indexOf('// Nigromante — cuerpo principal:'));
 await p.evaluate(src=>window.__parentAfterimages=(0,eval)('('+src+')'),parentFn);

 await p.evaluate(()=>cromaEnsureLoaded('musashi_ancestral'));await p.waitForFunction(()=>CHAMP_PACK.musashi?.ready&&CHAMP_PACK.skin_errante?.ready&&CHAMP_PACK.croma_musashi_ancestral?.ready);
 for(const arena of (process.env.ARENAS||'bosque,hielo,infernal,laberinto,acuatica,minas').split(','))for(const look of (process.env.LOOKS||'base,gear,set,skin,tier4').split(','))for(const density of (process.env.DENSITIES||'dense,sparse').split(','))for(const slot of (process.env.SLOTS||'1').split(',').map(Number)){
 const r=await p.evaluate(({arena,look,density,slot,canary})=>{
 let vt=1000,seed=777;const pn=performance.now,rnd=Math.random;performance.now=()=>vt;Math.random=()=>{seed^=seed<<13;seed>>>=0;seed^=seed>>17;seed^=seed<<5;seed>>>=0;return seed/4294967296;};
 const k='musashi';netMatch=null;save.stash=[];for(const s of Object.values(save.champions)){s.unlocked=true;s.level=20;s.xp=0;s.equipment={};s.croma=null;s.cosmeticSkin='';s.inventory=[];s.talents={nodes:{},mastery:null,masteryNodes:{}};}
 if(look!=='base'){const ids=look==='set'?setPieceIds('errante'):[];if(ids.length)for(const id of ids){const it=makeDesignedItem(id);stashItems().push(it);equipItem(k,it.uid);}else for(const type of ['arma','casco','pechera','botas']){const it=makeItem(type,'legendario');stashItems().push(it);equipItem(k,it.uid);}}
 for(const m of save.champions[k].skillMastery)m.alloc=look==='tier4'?7:0;
 if(look==='skin'){save.champions[k].croma='musashi_ancestral';cromaAfterEquip(k);}
 if(look==='set')save.champions[k].cosmeticSkin='errante';if(look==='alt1')save.champions[k].croma='mago_alt1';if(look==='croma')save.champions[k].croma='veyra_croma';invalidatePassiveCache();
 selectedClass=k;currentArena=arena;lobbyAllies=['tanque','soporte'];startRun(1);document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));state='playing';enemies=[];spawnTimer=arenaHazardTimer=1e9;
 for(const [dx,dy]of(density==='dense'?[[60,0],[-60,0],[0,60],[0,-60]]:[[60,0]])){const e=spawnEnemy('esqueleto');Object.assign(e,{x:player.x+dx,y:player.y+dy,hp:1e7,maxHp:1e7,speed:0,baseSpeed:0,dmg:0});}
 const other=makeHero('musashi',true,player.x-90,player.y,20);other._codexSkin=null;other.stunTimer=1e9;allies.push(other);heroes.unshift(other);
 for(const [i,a] of allies.entries()){a.x=player.x-(density==='dense'?40:140+i*80);a.y=player.y+(density==='dense'?14:70);a.stunTimer=1e9;}player.energy=1e4;player.cds=[0,0,0];player.fx=1;player.fy=0;
 const shake=vfxShake,float=floatText,cam=CAM_SUBJECT;vfxShake=()=>{};floatText=()=>{};CAM_SUBJECT={x:player.x,y:player.y};
 let signaturePasses=1,signatureEvents=[];const drawSig=drawChampionSignatures;
 let ghostDrawing=false;const drawGhost=drawMusashiAfterimages;drawMusashiAfterimages=function(){ghostDrawing=true;try{return drawGhost();}finally{ghostDrawing=false;}};
 let bodyDraws=0;const origMip=artMipDraw,bodyAtlas=CHAMP_PACK[setSkinPackKey(player,k)]?.atlas;artMipDraw=function(im,...args){if(im===bodyAtlas)bodyDraws++;return origMip(im,...args);};
 const cv=document.getElementById('game'),render0=render,arr=[vX,vY,vVX,vVY,vLife,vMax,vSize,vGrav,vKind,vPrio];let last;
 const snap=()=>({pose:[...heroes,...enemies].map(e=>({e,an:e._an?JSON.parse(JSON.stringify(e._an)):null,cast:e._animCastKind})),seed,count:vCount,particles:arr.map(a=>a.slice()),colors:vCol.slice(),sf:sfaPool.map(x=>({...x})),lastT:sfaLastT,seen:[...sfaSeen].map(([k,v])=>[k,{...v}])});
 const restore=s=>{sfaPool.splice(0,sfaPool.length,...s.sf.map(x=>({...x})));sfaLastT=s.lastT;sfaSeen.clear();for(const [k,v]of s.seen)sfaSeen.set(k,{...v});seed=s.seed;vCount=s.count;arr.forEach((a,i)=>a.set(s.particles[i]));for(let i=0;i<vCol.length;i++)vCol[i]=s.colors[i];for(const t of s.pose){if(t.an)t.e._an=JSON.parse(JSON.stringify(t.an));else delete t.e._an;if(t.cast===undefined)delete t.e._animCastKind;else t.e._animCastKind=t.cast;}};
 const mask=document.createElement('canvas');mask.width=cv.width;mask.height=cv.height;const mg=mask.getContext('2d'),origEnemy=drawEnemyBody,origHero=drawHeroBody,di=CanvasRenderingContext2D.prototype.drawImage;let recording=false,heroRecording=false,cupDraws=0;
 drawHeroBody=function(...a){recording=true;heroRecording=true;try{return origHero(...a);}finally{recording=false;heroRecording=false;}};
 drawEnemyBody=function(e){recording=true;try{return origEnemy(e);}finally{recording=false;}};
 CanvasRenderingContext2D.prototype.drawImage=function(im,...a){if(this===ctx){if(heroRecording)bodyDraws++;if(recording){mg.setTransform(ctx.getTransform());mg.globalAlpha=ctx.globalAlpha;mg.imageSmoothingEnabled=false;di.call(mg,im,...a);}if(ghostDrawing)cupDraws++;}return di.call(this,im,...a);};
 render=function(){last=snap();mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,cv.width,cv.height);return render0();};
 const step=()=>{vt+=16;CAM_LEAD_X=CAM_LEAD_Y=0;update(16);};for(let i=0;i<20;i++)step();_arenaTitleUntil=0;render();const scene=cv.toDataURL();
 const start=vt;player.aim={x:player.x+180,y:player.y,dx:1,dy:0};castAbility(player,player.cls.skills[slot],false,slot);enemies.forEach((e,i)=>{const a=i*Math.PI/2;e.x=player.x+(slot===1?40*Math.cos(a):80+i*35);e.y=player.y+(slot===1?40*Math.sin(a):55*(i%2?1:-1));});const ab=[],samples=[];
 const stateFingerprint=()=>JSON.stringify({pool:sfaPool.map(e=>[e.art,e.theme,e.x,e.y,e.t,e.dur]),objects:portadorObjects.map(o=>[o.kind,o.id,o.x,o.y,o.life]),heroes:heroes.map(h=>[h.x,h.y,h.hp,h.shield,h.buffs]),signatures:championSignatures});
 for(const t of [32,96,160,256]){while(vt-start<t){step();render();}render();const elapsed=vt-start,before=cv.toDataURL(),pix=ctx.getImageData(0,0,cv.width,cv.height).data,mp=mg.getImageData(0,0,cv.width,cv.height).data,pre=last,post=snap(),s0=stateFingerprint(),active=KVB.pool;
 let parent=null,parentState=null;{const fn=drawMusashiAfterimages;drawMusashiAfterimages=window.__parentAfterimages;restore(pre);render();parent=cv.toDataURL();parentState=s0===stateFingerprint();drawMusashiAfterimages=fn;}

 const originalDI=CanvasRenderingContext2D.prototype.drawImage;
 CanvasRenderingContext2D.prototype.drawImage=function(im,...a){if(this===ctx&&(ghostDrawing))return;return originalDI.call(this,im,...a);};const muted=[];muted.forEach(s=>s.on=false);restore(pre);render();muted.forEach(s=>s.on=true);const absent=cv.toDataURL(),base=ctx.getImageData(0,0,cv.width,cv.height).data;
 CanvasRenderingContext2D.prototype.drawImage=originalDI;restore(pre);render();if(canary){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#ff00ff';ctx.fillRect(0,0,cv.width,cv.height);ctx.restore();}
 const restored=cv.toDataURL();let opaque=0,retained=0;const final=canary?ctx.getImageData(0,0,cv.width,cv.height).data:pix;for(let z=0;z<mp.length;z+=4)if(mp[z+3]>=250){opaque++;if(Math.max(Math.abs(final[z]-base[z]),Math.abs(final[z+1]-base[z+1]),Math.abs(final[z+2]-base[z+2]))<=24)retained++;}
 ab.push({t,elapsed,before,absent,parent,parentState,restored,restore:before===restored,state:s0===stateFingerprint(),opaque,retained,visible:opaque?retained/opaque:0});restore(post);samples.push({elapsed,shield:player.shield,pool:sfaPool.map(s=>({theme:s.theme,t:s.t,dur:s.dur,r:s.r,fi:s.fi})),phase:player.smPhase,dashLeft:player.smDashLeft,x:player.x,y:player.y,objects:portadorObjects.map(o=>({kind:o.kind,life:o.life}))});}
 drawMusashiAfterimages=drawGhost;drawChampionSignatures=drawSig;artMipDraw=origMip;drawEnemyBody=origEnemy;drawHeroBody=origHero;CanvasRenderingContext2D.prototype.drawImage=di;render=render0;performance.now=pn;Math.random=rnd;vfxShake=shake;floatText=float;CAM_SUBJECT=cam;window.state='menu';
 return{afterimages:musashiAfterimages.map(a=>({...a})),signaturePasses,signatureEvents,arena,look,density,slot,scene,ab,samples,cupDraws,bodyDraws,resolved:{skin:activeSetSkinId(player),pack:setSkinPackKey(player,k),equipment:Object.values(save.champions[k].equipment).filter(Boolean).length,setPieces:setN(player,'errante'),croma:save.champions[k].croma,tier:save.champions[k].skillMastery[slot].alloc}};
 },{arena,look,density,slot,canary:!!process.env.CANARY});
 const hash=s=>crypto.createHash('sha256').update(Buffer.from(s.split(',')[1],'base64')).digest('hex');
 fs.writeFileSync(out+'/progress.json',JSON.stringify({completed:rows.length,errors}));
 for(const a of r.ab.filter(a=>process.env.ALL_PHASES||a.t===(96)))for(const key of ['before','absent',...(a.parent?['parent']:[])])fs.writeFileSync(`${out}/${arena}-${look}-${density}-h${slot}-${a.t}-${key}.png`,Buffer.from(a[key].split(',')[1],'base64'));
 rows.push({...r,scene:undefined,sceneHash:hash(r.scene),ab:r.ab.map(a=>({...a,before:undefined,parent:undefined,absent:undefined,restored:undefined,parentHash:a.parent?hash(a.parent):null,beforeHash:hash(a.before),restoredHash:hash(a.restored)}))});console.log(arena,look,density,slot,r.cupDraws,Math.min(...r.ab.map(a=>a.visible)),r.ab.every(a=>a.restore&&a.state));
 }
 fs.writeFileSync(out+'/capture.json',JSON.stringify({rows,errors},null,2));if(errors.length||rows.some(r=>!r.signaturePasses||(!process.env.BASELINE_MAIN&&!r.cupDraws)||!r.bodyDraws||(r.look==='set'&&!r.resolved.pack.includes('errante'))||(r.look==='skin'&&!r.resolved.pack.includes('musashi_ancestral'))||(r.look==='tier4'&&r.resolved.tier!==7)||r.ab.some(a=>!a.restore||!a.state||a.visible<.8)))process.exitCode=1;
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
