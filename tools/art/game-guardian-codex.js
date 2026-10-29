'use strict';
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
const OUT=path.join(H.ROOT,'art-source/entregas/guardianes-codex-20261029/produccion-01');
const loader=fs.readFileSync(path.join(OUT,'before-champion-sprites.js'),'utf8'),oldnorm=fs.readFileSync(path.join(OUT,'before-champion-art-normalize.js'),'utf8');
(async()=>{const site=await H.startSite(),browser=await H.launch(),results=[];try{
for(const champion of (process.env.CHAMPIONS||"musashi,cazadora,nigromante").split(","))for(const mobile of [false,true])for(const baseline of (process.env.AFTER_ONLY?[false]:[true,false])){
 const page=await browser.newPage({viewport:mobile?{width:844,height:390}:{width:1280,height:800},serviceWorkers:'block'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 if(baseline)await page.route('**/js/assets/champion-sprites.js*',r=>r.fulfill({contentType:'application/javascript',body:loader}));
 if(baseline)await page.route('**/js/data/champion-art-normalize.js*',r=>r.fulfill({contentType:'application/javascript',body:oldnorm}));
 await page.goto(site.url+'/?lazy=1');await page.waitForFunction(()=>typeof startRun==='function');
 await page.evaluate(()=>{loop=function(){};assetsStartAllChampions();for(const key of ['common','ar:bosque','ar:infernal','ar:hielo','ar:minas','ar:acuatica','ar:fortaleza'])assetsStartGroup(key);});
 await page.waitForFunction(()=>CHAMP_PACK.musashi?.ready&&CHAMP_PACK.cazadora?.ready&&CHAMP_PACK.nigromante?.ready&&assetsAllReady(),null,{timeout:120000});
 const r=await page.evaluate(({mobile,baseline,champion})=>{
 let seed=987654321,calls=0,vt=1000;const rnd=Math.random,pn=performance.now;
 Math.random=()=>{calls++;seed^=seed<<13;seed>>>=0;seed^=seed>>17;seed^=seed<<5;seed>>>=0;return seed/4294967296;};performance.now=()=>vt;
 try{
 const scenes=[];for(const arena of ['bosque','infernal','hielo','minas','acuatica','fortaleza']){
 selectedClass=champion;currentArena=arena;lobbyAllies=['tanque'];netMatch=null;
 for(const c in save.champions){Object.assign(save.champions[c],{unlocked:true,level:20,equipment:{},inventory:[],talents:{nodes:{},mastery:null,masteryNodes:{}},croma:null});}
 startRun(2);state='playing';document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));enemies=[];spawnTimer=1e9;arenaHazardTimer=1e9;
 for(let i=0;i<9;i++){const e=spawnEnemy('esqueleto');Object.assign(e,{x:player.x+90+i%3*25,y:player.y+((i/3|0)-1)*25,hp:1e7,maxHp:1e7,speed:0,baseSpeed:0,dmg:0});}
 for(const a of allies){a.x=player.x-45;a.y=player.y+15;a.stunTimer=1e9;}
 CAM_SUBJECT=null;CAM_LEAD_X=CAM_LEAD_Y=0;runLevel=Math.max(runLevel,ULT_MIN_ARENA_LEVEL);
 const drawn={},orig=champPackDrawFrame;champPackDrawFrame=function(P,...args){const u=P.atlas?.src||'';drawn[u]=(drawn[u]||0)+1;return orig.call(this,P,...args);};
 const shots=[],trace=[],timings=[];const cv=document.getElementById('game');
 function step(){vt+=16;update(16);const t=pn.call(performance);render();timings.push(pn.call(performance)-t);}
 for(let f=0;f<40;f++)step();
 for(let slot=0;slot<4;slot++){
 player.cds=[0,0,0];player.energy=1e4;player.ultCharge=player.ultMax;player.ultCd=0;player.fx=1;player.fy=0;player.aim={x:player.x+110,y:player.y,dx:1,dy:0};
 if(slot<3)useSkill(slot);else useUltimate();
 const before=player.stats.skillCasts;for(let f=0;f<95;f++){step();if([8,24,70].includes(f)){shots.push({slot,f,png:cv.toDataURL()});trace.push({slot,f,demon:player.nigroDemonForm,casts:player.stats.skillCasts});}}
 }
 champPackDrawFrame=orig;
 scenes.push({arena,drawn,trace,shots,timings,snap:{calls,seed,p:[player.x,player.y,player.hp,player.shield,player.nigroDemonForm],enemies:enemies.map(e=>[e.x,e.y,e.hp])}});state='menu';
 }
 return {mobile,baseline,champion,scenes};
 }finally{Math.random=rnd;performance.now=pn;}
 },{mobile,baseline,champion});
 for(const scene of r.scenes){const name=champion+'-'+(mobile?'mobile':'desktop')+'-'+(baseline?'before':'after')+'-'+scene.arena;
 // Native full frames and compact paired-review strips from the same captured canvas.
 const images=scene.shots;const sheet=await page.evaluate(async shots=>{const cv=document.createElement('canvas');cv.width=480*4;cv.height=300*3;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;for(let i=0;i<shots.length;i++){const im=new Image();im.src=shots[i].png;await im.decode();g.drawImage(im,im.width/2-240,im.height/2-150,480,300,i%4*480,(i/4|0)*300,480,300);}return cv.toDataURL();},images);
 fs.writeFileSync(path.join(OUT,name+'-sequence.png'),Buffer.from(sheet.split(',')[1],'base64'));
 if(scene.arena==='bosque')fs.writeFileSync(path.join(OUT,name+'-full.png'),Buffer.from(images[1].png.split(',')[1],'base64'));
 for(const shot of images)delete shot.png;
 }
 results.push({...r,errors});await page.close();console.log(mobile,baseline,'scenes',r.scenes.length,'errors',errors);
}
fs.writeFileSync(path.join(OUT,(process.env.REPORT||'GAME_MATRIX.json')),JSON.stringify({scope:'Real useSkill/useUltimate and update/render; six arenas; base appearance; paired pages seeded. No equipment/skin or relay approval.',results},null,2));
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
