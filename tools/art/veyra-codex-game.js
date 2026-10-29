'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),H=require('../lib/serve');
const OUT=path.join(H.ROOT,'art-source/entregas/veyra-codex-20261029/integracion-01');
const oldArt=fs.readFileSync(path.join(OUT,'before-ascension-art.js'),'utf8');
const oldNorm=fs.readFileSync(path.join(OUT,'before-champion-art-normalize.js'),'utf8');
const hash=u=>crypto.createHash('sha256').update(Buffer.from(u.split(',')[1],'base64')).digest('hex');
(async()=>{const site=await H.startSite(),browser=await H.launch(),runs=[],ARENAS=['bosque','hielo','infernal','laberinto','acuatica','minas'];try{
 for(const mobile of [false,true])for(const baseline of [true,false])for(const arenaOnly of ARENAS){
  const page=await browser.newPage({viewport:mobile?{width:844,height:390}:{width:1280,height:800},serviceWorkers:'block'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  if(baseline){await page.route('**/js/champions/ascension/art.js*',r=>r.fulfill({contentType:'application/javascript',body:oldArt}));await page.route('**/js/data/champion-art-normalize.js*',r=>r.fulfill({contentType:'application/javascript',body:oldNorm}));}
  await H.goto(page,site.url+'/?lazy=1');
  await page.evaluate(()=>{loop=function(){};assetsStartAllChampions();if(typeof assetsStartRest==='function')assetsStartRest();cromaLoadAll();cromaEnsureLoaded('veyra_alt1');cromaEnsureLoaded('veyra_croma');});
  await page.waitForFunction(()=>CHAMP_PACK.veyra?.ready&&CHAMP_PACK.croma_veyra_alt1?.ready&&CHAMP_PACK.croma_veyra_croma?.ready&&CHAMP_PACK.skin_quality_veyra?.ready,null,{timeout:120000});
  const r=await page.evaluate(async({mobile,baseline,arenaOnly})=>{
   const rows=[],arenas=[arenaOnly],looks=['base','gear','alt1','croma','set'],densities=['sparse','dense'];
   let vt=1000,seed=1,rngCalls=0;const rnd=Math.random,pn=performance.now;performance.now=()=>vt;
   Math.random=()=>{rngCalls++;seed^=seed<<13;seed>>>=0;seed^=seed>>17;seed^=seed<<5;seed>>>=0;return seed/4294967296;};
   const cv=document.getElementById('game');
   function setup(arena,look,density){vt=1000;seed=0x9e3779b9;rngCalls=0;netMatch=null;save.stash=[];
    for(const s of Object.values(save.champions))Object.assign(s,{unlocked:true,level:20,xp:0,equipment:{},croma:null,cosmeticSkin:'',inventory:[],talents:{nodes:{},mastery:null,masteryNodes:{}}});
    if(look!=='base'&&look!=='alt1'&&look!=='croma'){const ids=look==='set'?setPieceIds('quality_veyra'):[];if(ids.length)for(const id of ids){const it=makeDesignedItem(id);stashItems().push(it);equipItem('veyra',it.uid);}else for(const type of ['arma','casco','pechera','botas']){const it=makeItem(type,'legendario');stashItems().push(it);equipItem('veyra',it.uid);}}
    if(look==='alt1')save.champions.veyra.croma='veyra_alt1';if(look==='croma')save.champions.veyra.croma='veyra_croma';if(look==='set')delete save.champions.veyra.cosmeticSkin;invalidatePassiveCache();
    selectedClass='veyra';currentArena=arena;lobbyAllies=['tanque','soporte'];startRun(1);state='playing';document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));enemies=[];spawnTimer=arenaHazardTimer=1e9;
    const pos=density==='dense'?[[-52,-44],[52,-44],[0,-86]]:[[0,-86]];for(const [dx,dy]of pos){const e=spawnEnemy('esqueleto');Object.assign(e,{x:player.x+dx,y:player.y+dy,hp:1e7,maxHp:1e7,speed:0,baseSpeed:0,dmg:0});}
    for(const a of allies){a.x=player.x-48;a.y=player.y+18;a.stunTimer=1e9;}player.energy=1e4;player.ultCharge=player.ultMax;player.ultCd=0;player.fx=1;player.fy=0;player.aim={x:player.x+120,y:player.y,dx:1,dy:0};CAM_SUBJECT={x:player.x,y:player.y};CAM_LEAD_X=CAM_LEAD_Y=0;ART_GATE_NO_VFX=true;
   }
   function statePrint(){return JSON.stringify({rngCalls,seed,p:[player.x,player.y,player.hp,player.shield,player.energy,player.ultCharge,player.ultCd],heroes:heroes.map(h=>[h.classKey,h.x,h.y,h.hp,h.shield,h.alive]),enemies:enemies.map(e=>[e.kind,e.x,e.y,e.hp,e.alive]),kvb:KVB.pool.map(e=>[e.name,e.x,e.y,e.t,e.dur]),objects:portadorObjects.map(o=>[o.kind,o.x,o.y,o.life])});}
   function step(){vt+=16;update(16);render();}
   async function sha256(dataUrl){const raw=atob(dataUrl.split(',')[1]),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);const digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(v=>v.toString(16).padStart(2,'0')).join('');}
   function capture(bodyFrames){
    const mg=document.createElement('canvas');mg.width=cv.width;mg.height=cv.height;const mask=mg.getContext('2d'),di=CanvasRenderingContext2D.prototype.drawImage,oldEnemy=drawEnemyBody;let recording=false;
    drawEnemyBody=function(e){recording=true;try{return oldEnemy(e);}finally{recording=false;}};
    CanvasRenderingContext2D.prototype.drawImage=function(im,...a){if(this===ctx&&recording){mask.setTransform(ctx.getTransform());mask.globalAlpha=ctx.globalAlpha;mask.imageSmoothingEnabled=false;di.call(mask,im,...a);}return di.call(this,im,...a);};
    mask.clearRect(0,0,cv.width,cv.height);render();const png=cv.toDataURL(),final=ctx.getImageData(0,0,cv.width,cv.height).data,mp=mask.getImageData(0,0,cv.width,cv.height).data,oldHero=drawHeroBody;
    drawHeroBody=function(h,...a){if(h===player)return true;return oldHero(h,...a);};render();const noBody=ctx.getImageData(0,0,cv.width,cv.height).data;drawHeroBody=oldHero;render();
    let opaque=0,retained=0;for(let i=0;i<mp.length;i+=4)if(mp[i+3]>=250){opaque++;if(Math.max(Math.abs(final[i]-noBody[i]),Math.abs(final[i+1]-noBody[i+1]),Math.abs(final[i+2]-noBody[i+2]))<=24)retained++;}
    drawEnemyBody=oldEnemy;CanvasRenderingContext2D.prototype.drawImage=di;return{png,opaque,retained,ratio:opaque?retained/opaque:1,frames:bodyFrames.splice(0)};
   }
   try{for(const arena of arenas){
    for(const look of looks)for(const density of densities){setup(arena,look,density);const bodyFrames=[],oldFrame=champPackDrawFrame;champPackDrawFrame=function(P,v){if(P===CHAMP_PACK[setSkinPackKey(player,'veyra')])bodyFrames.push({frame:v,base:P===CHAMP_PACK.veyra,cromaOf:P.cromaOf||null});return oldFrame.apply(this,arguments);};for(let i=0;i<20;i++)step();_arenaTitleUntil=0;const precast=statePrint(),shots=[];
     for(const slot of [0,1,2,3]){player.cds=[0,0,0];player.energy=1e4;player.ultCharge=player.ultMax;player.ultCd=0;if(slot<3)useSkill(slot);else useUltimate();for(let i=0;i<10;i++)step();const s=capture(bodyFrames);const shotHash=await sha256(s.png);shots.push({slot,hash:shotHash,opaque:s.opaque,retained:s.retained,ratio:s.ratio,frames:s.frames});}
     champPackDrawFrame=oldFrame;const post=statePrint(),pack=setSkinPackKey(player,'veyra'),atlas=CHAMP_PACK[pack]?.atlas?.src||'',resolved={pack,atlas:atlas.startsWith('data:')?'data:generated':new URL(atlas).pathname,equipment:Object.values(save.champions.veyra.equipment).filter(Boolean).length,setPieces:setN(player,'quality_veyra')};rows.push({arena,look,density,precast,post,rngCalls,seed,shots,resolved});state='menu';
    }
   }}finally{Math.random=rnd;performance.now=pn;}
   return{mobile,baseline,rows};
  },{mobile,baseline,arenaOnly});
  r.errors=errors;r.arena=arenaOnly;runs.push(r);fs.writeFileSync(path.join(OUT,'GAME_PART_'+(mobile?'MOBILE':'DESKTOP')+'_'+(baseline?'BEFORE':'AFTER')+'_'+arenaOnly+'.json'),JSON.stringify(r,null,2)+'\n');console.log({mobile,baseline,arena:arenaOnly,rows:r.rows.length,errors});await page.close();
 }
 const pairs=[];for(const mobile of [false,true])for(const arena of ARENAS){const before=runs.find(x=>x.mobile===mobile&&x.baseline&&x.arena===arena),after=runs.find(x=>x.mobile===mobile&&!x.baseline&&x.arena===arena);for(let i=0;i<before.rows.length;i++){const a=before.rows[i],b=after.rows[i],preserved=['alt1','set'].includes(a.look);pairs.push({mobile,key:[a.arena,a.look,a.density].join('/'),precast:a.precast===b.precast,post:a.post===b.post,rng:a.rngCalls===b.rngCalls&&a.seed===b.seed,skinPixels:preserved?a.shots.every((s,j)=>s.hash===b.shots[j].hash):null,minContact:Math.min(...b.shots.map(s=>s.ratio)),baseAtlas:b.resolved.atlas?.includes('/veyra/codex-v1/'),resolved:b.resolved});}}
 const report={scope:'120 actual candidate scenes and 120 exact-main baseline scenes: six arenas, five looks, two adjacent-contact densities, two viewports, H1/H2/H3/UF. Paired summarized state/RNG; enemy-body contact measured with candidate body suppressed. Authored alt1/set packs preserve exact pixels; generated croma follows the new base body.',runs:runs.map(r=>({...r,rows:r.rows.map(x=>({...x,precastHash:crypto.createHash('sha256').update(x.precast).digest('hex'),postHash:crypto.createHash('sha256').update(x.post).digest('hex'),precast:undefined,post:undefined}))})),pairs};
 fs.writeFileSync(path.join(OUT,'GAME_MATRIX.json'),JSON.stringify(report,null,2)+'\n');const fail=pairs.filter(x=>!x.precast||!x.post||!x.rng||x.minContact<.8||x.skinPixels===false||(['base','gear'].includes(x.key.split('/')[1])&&!x.baseAtlas));console.log(JSON.stringify({pairs:pairs.length,fail:fail.slice(0,20),minContact:Math.min(...pairs.map(x=>x.minContact)),errors:runs.flatMap(x=>x.errors)}));if(fail.length||runs.some(x=>x.errors.length))process.exitCode=1;
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
