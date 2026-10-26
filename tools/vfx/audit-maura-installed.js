'use strict';
const fs=require('fs'),H=require('../lib/serve');
const D='art-source/entregas/maura-kit-20261025/cierre-01';
(async()=>{const site=await H.startSite(),b=await H.launch(),errors=[],rows=[];try{
for(const [view,width,height] of [['desktop',1280,720],['mobile',844,390]]){
const p=await b.newPage({viewport:{width,height}});p.on('pageerror',e=>errors.push(e.message));await p.goto(site.url+'/?lazy=0');await p.waitForFunction(()=>typeof mauraNativeStrip==='function'&&assetsAllReady());await p.evaluate(()=>{loop=()=>{}});
for(let slot=0;slot<3;slot++){
 const r=await p.evaluate(slot=>{let vt=1000;const pn=performance.now;performance.now=()=>vt;for(const s of Object.values(save.champions)){s.unlocked=true;s.level=20;s.equipment={};s.croma=null;s.cosmeticSkin='';}selectedClass='maura';currentArena='bosque';lobbyAllies=[];startRun(1);heroes=[player];document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));state='playing';enemies=[];spawnTimer=arenaHazardTimer=1e9;for(let n=0;n<20;n++){vt+=16;update(16);render();}player.energy=1e4;player.cds=[0,0,0];player.aim={x:player.x+180,y:player.y,dx:1,dy:0};if(slot===2){exState(player).seeds=5;player.hp=player.maxHp/2;}
const draws={roots:0,bark:0,shears:0,body:0},di=CanvasRenderingContext2D.prototype.drawImage,hb=drawHeroBody;let inBody=false;
drawHeroBody=function(...a){inBody=true;try{return hb(...a)}finally{inBody=false}};
CanvasRenderingContext2D.prototype.drawImage=function(im,...a){if(this===ctx){if(inBody)draws.body++;for(const k of ['roots','bark'])if(im===mauraNativeStrip(k).cv)draws[k]++;if([...sfaCache.entries()].some(([k,v])=>k.includes('maura_shears')&&v.cv===im))draws.shears++;}return di.call(this,im,...a)};
try{castAbility(player,player.cls.skills[slot],false,slot);for(let n=0;n<14;n++){vt+=16;update(16);render();}_arenaTitleUntil=0;render();return{slot,draws,objects:portadorObjects.map(o=>({kind:o.kind,life:o.life,shield:o.owner?.shield})),pool:sfaPool.map(x=>({art:x.art,theme:x.theme,t:x.t,dur:x.dur,r:x.r,w:x.w})),pack:CHAMP_PACK.maura.ready,png:document.getElementById('game').toDataURL()};}finally{CanvasRenderingContext2D.prototype.drawImage=di;drawHeroBody=hb;performance.now=pn;}
 },slot);fs.writeFileSync(`${D}/${view}-installed-${slot}.png`,Buffer.from(r.png.split(',')[1],'base64'));delete r.png;rows.push({view,...r});
}await p.close();}
fs.writeFileSync(D+'/INSTALLED_AUDIT.json',JSON.stringify({rows,errors},null,2));console.log(JSON.stringify({rows,errors}));
}finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1});
