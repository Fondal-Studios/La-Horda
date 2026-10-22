'use strict';
/* Verifica consumidores reales y exporta exactamente el atlas del renderer.
 * No sustituye Art Gate, skins ni inspección humana. */
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
const OUT=path.resolve(process.env.OUT||'art-source/entregas/morveth-kit-20261022');
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await H.goto(page,site.url+'/');await page.waitForFunction(()=>typeof startRun==='function'&&assetsAllReady());
const r=await page.evaluate(()=>{
 const checks=[],observations=[],exports=[];const check=(name,ok,details)=>checks.push({name,pass:!!ok,details});
 netMatch=null;save.stash=[];for(const k in save.champions)Object.assign(save.champions[k],{unlocked:true,level:60,equipment:{},inventory:[],talents:{nodes:{},mastery:null,masteryNodes:{}}});
 selectedClass='morveth';currentArena='bosque';lobbyAllies=['tanque','soporte'];startRun(3);state='menu';enemies=[];spawnTimer=1e9;
 for(const a of allies){a.x=player.x+30;a.y=player.y+20;}
 const reset=()=>{portadorObjects=[];sfaObjectsReset();sfaReset();player.energy=1e4;player.cds=[0,0,0];};
 const old=window.vfxSfaPlay,events=[];window.vfxSfaPlay=function(...args){events.push(args);return old.apply(this,args);};
 reset();player.fx=1;player.fy=0;player.aim={x:player.x+100,y:player.y,dx:1,dy:0};
 castAbility(player,player.cls.skills[0],false,0);const mushroom=portadorOwned(player,'mor_mushroom')[0],growth=events.find(e=>e[1]==='morveth_growth');
 check('growth anchored to actual planted object',mushroom&&growth&&growth[2]===mushroom.x&&growth[3]===mushroom.y,{growth});
 sfaObjectsFrame();const left=mushroom.left;morvethUpdateObject(mushroom,1100);sfaObjectsFrame();
 check('pulse follows real object tick',mushroom.left<left&&sfaPool.some(e=>e.theme==='morveth_pulse'&&e.x===mushroom.x&&e.y===mushroom.y));
 mushroom.life=0;sfaObjectsFrame();check('dead mushroom removed from visual observer',!sfaSeen.has(mushroom.id));
 for(const [dx,dy] of [[1,0],[0,-1],[-1,0],[0,1]]){
  reset();events.length=0;player.fx=dx;player.fy=dy;player.aim={x:player.x+dx*120,y:player.y+dy*120,dx,dy};
  castAbility(player,player.cls.skills[1],false,1);const e=events.find(e=>e[1]==='morveth_spores~h');
  check('cone matches real aim '+dx+','+dy,e&&Math.abs(Math.cos(e[5])-dx)<.001&&Math.abs(Math.sin(e[5])-dy)<.001&&e[4]===210&&e[11]===.85,{event:e});
 }
 reset();events.length=0;const own=morvethObject(player,'mor_mushroom',{x:player.x+40,y:player.y},6000,{r:85,left:6,tick:1000,interval:1000,hp:100,maxHp:100,hitTimer:850},3);
 castAbility(player,player.cls.skills[2],false,2);let aura=events.filter(e=>e[1]==='morveth_symbiosis~p');
 check('without share only caster receives aura',aura.length===1&&aura[0][10]===heroes.indexOf(player),aura);
 check('aura duration follows actual armor timer',aura[0]&&aura[0][6]===player._kitArmorUntil-runElapsedMs);
 check('symbiosis consumes own nearby mushroom',own.life===0);
 reset();events.length=0;save.champions.morveth.talents.nodes.morveth_t2transform=1;
 castAbility(player,player.cls.skills[2],false,2);aura=events.filter(e=>e[1]==='morveth_symbiosis~p');
 check('share talent is active in fixture',morvethFlag(player,2,'share'));
 check('share aura follows actual eligible allies',aura.length===morvethAllies(player,player,150).length&&aura.every(e=>heroes[e[10]]._kitArmorUntil>runElapsedMs),aura);
 const count=events.length;player.cds[2]=1000;state='playing';const blocked=useSkill(2);state='menu';check('cooldown rejects cast without new visual',blocked===false&&events.length===count);
 const replay=events.map(e=>e.slice());sfaReset();for(const e of replay)old(...e);check('scalar events replay after transport',replay.every(e=>e.every(v=>v==null||typeof v==='number'||typeof v==='string'))&&sfaPool.some(s=>s.theme==='morveth_symbiosis~p'));
 window.vfxSfaPlay=old;
 let randomCalls=0;const rnd=Math.random;Math.random=()=>{randomCalls++;return .5;};
 const specs=[['mushroom-growth','burst','morveth_growth',64],['spore-pulse','nova','morveth_pulse',96],['spore-exhalation','cone','morveth_spores~h',96],['symbiosis-mycelium','aura','morveth_symbiosis~p',0]];
 for(const [name,art,theme,size]of specs){const b=sfaBake(art,theme,size,.85),d=b.cv.getContext('2d').getImageData(0,0,b.cv.width,b.cv.height).data;let soft=0,opaque=0;for(let i=3;i<d.length;i+=4){if(d[i]&&d[i]!==255)soft++;if(d[i]===255)opaque++;}check('crisp alpha '+name,soft===0&&opaque>0,{soft,opaque});exports.push({name,art,theme,size,arc:.85,cell:[b.w,b.h],frames:b.n,png:b.cv.toDataURL()});}
 check('native painting leaves combat RNG unchanged',randomCalls===0);Math.random=rnd;
 const plain=sfaBake('nova','plague',64),legacy=sfaBakeNova(sfaTintTheme(sfaTheme('plague'),sfaArenaKey()),64).toCanvas();check('legacy plague nova unchanged',plain.cv.toDataURL()===legacy.toDataURL());
 const b=sfaBake('nova','morveth_pulse',96),d=b.cv.getContext('2d').getImageData((b.n-1)*b.w,0,b.w,b.h).data;let lastOpaque=0;for(let i=3;i<d.length;i+=4)if(d[i])lastOpaque++;
 observations.push({component:'A-FX-morveth-h1',block:'B166',state:'EN_CORRECCION',frames:[10],finding:'El borde del pulso no se disipa en el atlas final: conserva píxeles aunque las esporas terminan. Evaluar corte al finalizar el evento.',lastOpaque,next:'Lote común: aplicar disolución al borde sin alterar radio ni pulso mecánico; repetir comparación del final.'});
 for(const lite of [false,true]){JUICE.reduceFx=lite;sfaReset();for(let i=0;i<100;i++)old('burst','morveth_growth',player.x,player.y,42,0,650);check('pool bounded reduceFx='+lite,sfaPool.length<=(lite?16:40),sfaPool.length);}
 return{checks,observations,exports};
});
fs.mkdirSync(path.join(OUT,'atlases'),{recursive:true});for(const e of r.exports){fs.writeFileSync(path.join(OUT,'atlases',e.name+'.png'),Buffer.from(e.png.split(',')[1],'base64'));delete e.png;}
fs.writeFileSync(path.join(OUT,'verification.json'),JSON.stringify({...r,errors},null,2)+'\n');console.log(JSON.stringify({checks:r.checks.length,failed:r.checks.filter(c=>!c.pass),observations:r.observations,errors},null,2));if(errors.length||r.checks.some(c=>!c.pass))process.exitCode=1;
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
