'use strict';
// Current native candidate: real casts across arenas/viewports/modes; diagnostic, not ArtGate.
const fs=require('fs'),H=require('../lib/serve'),OUT=process.env.OUT;
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const site=await H.startSite(),b=await H.launch(),rows=[],errors=[];
try{const p=await b.newPage({viewport:{width:844,height:390}});p.on('pageerror',e=>errors.push(e.message));
if(process.env.BASELINE)await p.route('**/js/champions/vfx-b/nano_gm.js*',route=>route.fulfill({path:process.env.BASELINE,contentType:'application/javascript'}));
await p.addInitScript(()=>{requestAnimationFrame=()=>0;});await p.goto(site.url+'/?lazy=0');
await p.waitForFunction(()=>assetsAllReady()&&CHAMP_PACK.nano_gm?.ready,null,{polling:100});
for(const mobile of [true,false])for(const arena of ['bosque','hielo','infernal','laberinto','acuatica','minas'])for(const mode of ['base','regent','monster'])for(const slot of [0,1,2]){
 await p.setViewportSize(mobile?{width:844,height:390}:{width:1280,height:720});
 const result=await p.evaluate(({slot,mode,arena,mobile})=>{loop=()=>{};selectedClass='nano_gm';currentArena=arena;lobbyAllies=[];netMatch=null;
 const c=save.champions.nano_gm;Object.assign(c,{level:99,unlocked:true,equipment:{},inventory:[],cosmeticSkin:'',croma:null,talents:{nodes:{},mastery:null,masteryNodes:{}}});for(const m of c.skillMastery)m.alloc=0;
 invalidatePassiveCache();startRun(1);state='playing';document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));enemies=[];spawnTimer=arenaHazardTimer=1e9;
 const prepCast=i=>{player.energy=1e5;player.cds=[0,0,0];useSkill(i,{x:player.x+180,y:player.y,dx:1,dy:0});};if(mode==='regent'){prepCast(0);prepCast(1);prepCast(0);}if(mode==='monster'){player.ultCharge=player.ultMax;player.ultCd=0;runLevel=ULT_MIN_ARENA_LEVEL;useUltimate();for(let i=0;i<170;i++)update(16);}const modeState={regent:nanoRegent(player),monster:ascState(player).monsterUntil>ascNow()};const areas=[],oldArea=ascArea;ascArea=function(h,p,r,...rest){areas.push({x:p.x,y:p.y,r});return oldArea.call(this,h,p,r,...rest);};const calls=[],oldFx=kvbFx;kvbFx=function(...args){calls.push(args);return oldFx.apply(this,args);};const oldUf=ufPlay,uf=[];ufPlay=function(...args){uf.push(args.slice(0,4));return oldUf.apply(this,args);};
 const snap=()=>({hero:{x:player.x,y:player.y,shield:player.shield,alive:player.alive},objects:portadorObjects.filter(o=>o.owner===player).map(o=>({kind:o.kind,x:o.x,y:o.y,r:o.r,life:o.life,eff:o.eff,both:o.both})),pool:KVB.pool.filter(e=>(e.name?.startsWith('ng_')||e.spec===KVB_BEAM.ng_decree)).map(e=>({name:e.name||(e.spec===KVB_BEAM.ng_decree?'ng_decree':null),x:e.x,y:e.y,r:e.r,len:e.len,w:e.w,dur:e.dur,t:e.t}))});
 player.energy=1e5;player.cds=[0,0,0];player.ultCd=0;player.ultCharge=player.ultMax;runLevel=ULT_MIN_ARENA_LEVEL;const before=snap();if(slot===3)useUltimate();else useSkill(slot,{x:player.x+180,y:player.y,dx:1,dy:0});const cast=snap();kvbFx=oldFx;ufPlay=oldUf;ascArea=oldArea;
 const draw=ctx.drawImage,draws={};ctx.drawImage=function(im,...args){for(const e of KVB.pool)if((e.name?.startsWith('ng_')||e.spec===KVB_BEAM.ng_decree)&&e.frames?.includes(im))draws[e.name||'ng_decree']=(draws[e.name||'ng_decree']||0)+1;return draw.call(this,im,...args);};
 for(let i=0;i<16;i++){update(16);render();}ctx.drawImage=draw;const after256=snap(),png=document.getElementById('game').toDataURL();
 for(let i=0;i<330;i++)update(16);const after5536=snap();return{arena,mobile,mode,modeState,areas,slot,before,cast,after256,after5536,calls,uf,draws,png,packReady:CHAMP_PACK.nano_gm.ready,scope:'Actual useSkill base/no talents/no equipment. Empty targets. Two viewports / six arenas. No talents/equipment. No relay, ABA contact or ArtGate.'};},{slot,mode,arena,mobile});
 if(process.env.CAPTURE && slot!==1 && mode==='base' && arena==='infernal')fs.writeFileSync(OUT+'/'+(mobile?'mobile':'desktop')+'-'+mode+'-'+slot+'.png',Buffer.from(result.png.split(',')[1],'base64'));delete result.png;rows.push(result);
}
fs.writeFileSync(OUT+'/NEXT_NANO_MODES.json',JSON.stringify({rows,errors},null,2));console.log(JSON.stringify({scenes:rows.length,errors}));
}finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
