'use strict';
const fs=require('fs'),path=require('path'),H=require('../lib/serve');
const OUT='art-source/entregas/maura-kit-20261025/primera-pasada-01';
(async()=>{const s=await H.startSite(),b=await H.launch(),errors=[],scenes=[];try{
 for(const [name,width,height]of [['mobile',844,390],['desktop',1280,720]]){
  const p=await b.newPage({viewport:{width,height}});p.on('pageerror',e=>errors.push(e.message));await p.goto(s.url+'/?lazy=0');await p.waitForFunction(()=>typeof startRun==='function'&&assetsAllReady());await p.evaluate(()=>{loop=()=>{}});await p.addScriptTag({path:path.resolve(OUT,'source-native.js')});
  await p.evaluate(()=>{window.mauraKit=mauraCandidateKit();window.mauraCanvas=Object.fromEntries(['roots','bark','shears'].map(k=>[k,mauraKit[k].toCanvas()]));window.mauraSetup=()=>{for(const s of Object.values(save.champions)){s.unlocked=true;s.level=20;s.equipment={};s.croma=null;s.cosmeticSkin='';}selectedClass='maura';currentArena='bosque';lobbyAllies=[];startRun(1);heroes=[player];document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));state='playing';enemies=[];spawnTimer=arenaHazardTimer=1e9;for(let n=0;n<20;n++)update(16);player.energy=1e4;player.cds=[0,0,0];player.aim={x:player.x+180,y:player.y,dx:1,dy:0};};});
  for(let slot=0;slot<3;slot++){
   const result=await p.evaluate(slot=>{mauraSetup();if(slot===2){exState(player).seeds=5;player.hp=player.maxHp/2;}castAbility(player,player.cls.skills[slot],false,slot);for(let n=0;n<14;n++)update(16);_arenaTitleUntil=0;
    const key=['roots','bark','shears'][slot],S=mauraKit[key],im=mauraCanvas[key],f=slot===1?6:5;
    const oldG=drawPortadorGround,oldT=drawPortadorTop,oldB=drawHeroBody,di=CanvasRenderingContext2D.prototype.drawImage;let candidateCalls=0,mauraBodyCalls=0,inBody=false;
    const state=()=>JSON.stringify({x:player.x,y:player.y,hp:player.hp,shield:player.shield,seeds:exState(player).seeds,objects:portadorObjects.map(o=>({kind:o.kind,life:o.life,x:o.x,y:o.y}))});
    function candidate(){const before=state(),rand=Math.random;let rng=0;Math.random=()=>{rng++;return rand()};ctx.save();ctx.imageSmoothingEnabled=false;
      if(slot===0){const q=player.exCue,angle=Math.atan2(q.by-q.y,q.bx-q.x);ctx.translate(q.x,q.y);ctx.rotate(angle);ctx.drawImage(im,f*S.w,0,S.w,S.h,0,-26,q.range,52);}
      else if(slot===1){ctx.drawImage(im,f*S.w,0,S.w,S.h,player.x-32,player.y-75,64,80);}
      else ctx.drawImage(im,f*S.w,0,S.w,S.h,player.x-110,player.y-110,220,220);
      ctx.restore();Math.random=rand;window.candidatePure={rng,stateEqual:before===state()};}
    render();const before=document.getElementById('game').toDataURL();
    drawPortadorGround=function(...a){oldG(...a);if(slot!==1)candidate()};drawPortadorTop=function(...a){oldT(...a);if(slot===1)candidate()};drawHeroBody=function(h,...a){inBody=h===player;try{return oldB(h,...a)}finally{inBody=false}};
    CanvasRenderingContext2D.prototype.drawImage=function(image,...a){if(this===ctx&&image===im)candidateCalls++;if(this===ctx&&inBody)mauraBodyCalls++;return di.call(this,image,...a)};
    try{render();return{slot,key,frame:f,age:224,candidateCalls,mauraBodyCalls,packReady:CHAMP_PACK.maura?.ready,pure:candidatePure,before,after:document.getElementById('game').toDataURL()};}finally{drawPortadorGround=oldG;drawPortadorTop=oldT;drawHeroBody=oldB;CanvasRenderingContext2D.prototype.drawImage=di;}
   },slot);
   for(const mode of ['before','after']){fs.writeFileSync(path.join(OUT,`${name}-${slot}-${mode}.png`),Buffer.from(result[mode].split(',')[1],'base64'));delete result[mode];}scenes.push({viewport:name,...result});
  }
  if(name==='mobile'){
   const lifecycle=await p.evaluate(()=>{const out=[];function cast(i){player.cds=[0,0,0];player.energy=1e4;castAbility(player,player.cls.skills[i],false,i)}
    mauraSetup();cast(0);cast(0);cast(0);out.push({case:'roots-recast-cap',count:exOwned(player,'thorns').length,pass:exOwned(player,'thorns').length===2});
    mauraSetup();cast(1);const o=exOwned(player,'bark')[0];player.shield=0;updatePortadorObjects(16);out.push({case:'bark-shield-zero-object-persists',life:o.life,shield:player.shield,pass:o.life>0&&player.shield===0,method:'Explicit fixture sets shield to zero; does not certify damage absorption.'});
    const oldArea=exArea;let discharges=0;exArea=function(h,...a){if(h===player)discharges++;return oldArea(h,...a)};try{updatePortadorObjects(4000);updatePortadorObjects(16);out.push({case:'bark-expiry-once',discharges,pass:discharges===1});}finally{exArea=oldArea}
    mauraSetup();cast(1);cast(1);out.push({case:'bark-recast-single',count:exOwned(player,'bark').length,pass:exOwned(player,'bark').length===1});player.alive=false;updatePortadorObjects(16);out.push({case:'bark-death-removal',count:exOwned(player,'bark').length,pass:exOwned(player,'bark').length===0});
    for(const seeds of [0,5]){mauraSetup();exState(player).seeds=seeds;player.hp=player.maxHp/2;const before=player.hp;cast(2);const gain=player.hp-before;out.push({case:'shear-seeds-'+seeds,gain,remaining:exState(player).seeds,pass:Math.abs(gain-player.maxHp*.01*seeds)<1e-8&&exState(player).seeds===0});}
    return out;});fs.writeFileSync(path.join(OUT,'LIFECYCLE_AUDIT.json'),JSON.stringify({cases:lifecycle,limits:'Current main zero-target lifecycle observations, no candidate hook installed; direct shield-zero fixture, no damage/relay test.'},null,2));
  }await p.close();
 }
 fs.writeFileSync(path.join(OUT,'COMPOSITION_AUDIT.json'),JSON.stringify({scenes,errors,limits:'Workshop-only draw harness adds candidate over existing layers. Paired renders are diagnostic, not A/B/A exact-state gate. Six base/Bosque scenes; no skins/equipment/six-arena/relay acceptance.'},null,2));console.log(JSON.stringify({scenes,errors}));
 }finally{await b.close();await s.close();}})().catch(e=>{console.error(e);process.exitCode=1});
