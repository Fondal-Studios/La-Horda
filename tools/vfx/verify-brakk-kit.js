'use strict';
/* Exporta la receta que usa el renderer y comprueba el enganche real del kit.
 * No sustituye Art Gate ni revisión en todas las skins. */
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
const OUT=path.resolve(process.env.OUT||'art-source/entregas/brakk-kit-20261022');
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await H.goto(page,site.url+'/');await page.waitForFunction(()=>typeof startRun==='function'&&assetsAllReady());
 const r=await page.evaluate(()=>{
  const checks=[],observations=[],exports=[];const check=(name,ok,details)=>checks.push({name,pass:!!ok,details});
  netMatch=null;save.stash=[];for(const k in save.champions)Object.assign(save.champions[k],{unlocked:true,level:60,equipment:{},inventory:[],talents:{nodes:{},mastery:null,masteryNodes:{}}});
  selectedClass='brakk';currentArena='bosque';lobbyAllies=['tanque','soporte'];startRun(3);state='menu';enemies=[];spawnTimer=1e9;
  const reset=()=>{portadorObjects=[];sfaObjectsReset();sfaReset();player.energy=1e4;player.cds=[0,0,0];};
  const old=window.vfxSfaPlay,events=[];window.vfxSfaPlay=function(...args){events.push(args);return old.apply(this,args);};
  for(const [dx,dy] of [[1,0],[0,-1],[-1,0],[0,1]]){
   reset();events.length=0;player.fx=dx;player.fy=dy;player.aim={x:player.x+dx*120,y:player.y+dy*120,dx,dy};
   castAbility(player,player.cls.skills[0],false,0);const o=brakkOwned(player)[0],e=events.find(e=>e[1]==='brakk_build');
   check('wall geometry '+dx+','+dy,o&&e&&e[0]==='beam'&&Math.abs(e[2]-(o.x-o.dx*o.r))<.01&&Math.abs(e[3]-(o.y-o.dy*o.r))<.01&&Math.abs(e[7]-(o.x+o.dx*o.r))<.01&&Math.abs(e[8]-(o.y+o.dy*o.r))<.01,{event:e,wall:o&&{x:o.x,y:o.y,dx:o.dx,dy:o.dy,r:o.r}});
  }
  reset();events.length=0;player.fx=1;player.fy=0;player.aim={x:player.x+80,y:player.y,dx:1,dy:0};
  castAbility(player,player.cls.skills[1],false,1);const turret=brakkOwned(player)[0],dep=events.find(e=>e[1]==='brakk_deploy~h');
  check('turret deployment at actual object',dep&&turret&&dep[2]===turret.x&&dep[3]===turret.y);
  const enemy=spawnEnemy('esqueleto');Object.assign(enemy,{x:turret.x+50,y:turret.y,hp:1e7,maxHp:1e7,dmg:0,speed:0});
  events.length=0;brakkUpdate(turret,1100);const shot=events.find(e=>e[1]==='brakk_nails');
  check('real turret shot emits nail trajectory',shot&&shot[2]===turret.x&&shot[3]===turret.y&&shot[7]===enemy.x&&shot[8]===enemy.y,{event:shot});
  reset();events.length=0;
  const own=brakkBuild(player,'brk_wall',{x:player.x+60,y:player.y},4500,{r:65,dx:0,dy:1});own.hp=own.maxHp*.4;
  const foreign=brakkBuild(allies[0],'brk_wall',{x:player.x-60,y:player.y},4500,{r:65,dx:0,dy:1});foreign.hp=foreign.maxHp*.4;
  castAbility(player,player.cls.skills[2],false,2);
  const weld=events.filter(e=>e[0]==='burst'&&e[1]==='brakk_repair~p'),aura=events.find(e=>e[0]==='aura'&&e[1]==='brakk_repair~p');
  check('repair marks only own repaired construction',weld.length===1&&weld[0][2]===own.x&&weld[0][3]===own.y&&foreign.hp===foreign.maxHp*.4,{weld});
  check('armor aura follows actual recipient and duration',aura&&aura[10]===heroes.indexOf(player)&&aura[6]===player._kitArmorUntil-runElapsedMs,{event:aura});
  const count=events.length;player.cds[2]=1000;state='playing';const blocked=useSkill(2);state='menu';check('failed cooldown cast emits no new kit VFX',blocked===false&&events.length===count);
  const replay=events.map(e=>e.slice());sfaReset();for(const e of replay)old(...e);check('events replay without hero object arguments',replay.every(e=>e.every(v=>v===undefined||v===null||typeof v==='number'||typeof v==='string'))&&sfaPool.some(s=>s.theme==='brakk_repair~p'));
  window.vfxSfaPlay=old;
  let randomCalls=0;const rnd=Math.random;Math.random=()=>{randomCalls++;return .5;};
  const specs=[['wall-mount','beam','brakk_build',12],['turret-deploy','burst','brakk_deploy~h',64],['nail-volley','beam','brakk_nails',12],['repair-weld','burst','brakk_repair~p',48],['repair-brace','aura','brakk_repair~p',0]];
  for(const [name,art,theme,size] of specs){const b=sfaBake(art,theme,size);const d=b.cv.getContext('2d').getImageData(0,0,b.cv.width,b.cv.height).data;let soft=0,opaque=0;for(let i=3;i<d.length;i+=4){if(d[i]&&d[i]!==255)soft++;if(d[i]===255)opaque++;}
   check('crisp alpha '+name,soft===0&&opaque>0,{soft,opaque});exports.push({name,art,theme,size,cell:[b.w,b.h],frames:b.n,png:b.cv.toDataURL()});}
  check('native painting leaves combat RNG unchanged',randomCalls===0);Math.random=rnd;
  const plain=sfaBake('nova','siege',64),legacy=sfaBakeNova(sfaTintTheme(sfaTheme('siege'),sfaArenaKey()),64).toCanvas();check('legacy siege nova pixels unchanged',plain.cv.toDataURL()===legacy.toDataURL());
  observations.push({component:'A-FX-brakk-h1',state:'EN_CORRECCION',finding:'La fase se verifica sobre sfaDrawOne real con tools/vfx/verify-brakk-build-phase.js; el cálculo histórico animNow/70 ya no representa este tema.',next:'Completar gate visual/skins/contraste específico y CI antes de aprobar el componente.'});
  for(const lite of [false,true]){JUICE.reduceFx=lite;sfaReset();for(let i=0;i<100;i++)old('burst','brakk_deploy',player.x,player.y,45,0,620);check('pool bounded reduceFx='+lite,sfaPool.length<=(lite?16:40),sfaPool.length);}
  return{checks,observations,exports};
 });
 fs.mkdirSync(path.join(OUT,'atlases'),{recursive:true});for(const e of r.exports){fs.writeFileSync(path.join(OUT,'atlases',e.name+'.png'),Buffer.from(e.png.split(',')[1],'base64'));delete e.png;}
 fs.writeFileSync(path.join(OUT,'verification.json'),JSON.stringify({...r,errors},null,2)+'\n');console.log(JSON.stringify({checks:r.checks.length,failed:r.checks.filter(c=>!c.pass),observations:r.observations,errors},null,2));if(errors.length||r.checks.some(c=>!c.pass))process.exitCode=1;
 }finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
