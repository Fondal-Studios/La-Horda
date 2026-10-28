'use strict';
// Workshop-only comparison on exact main renderer; candidate installed in browser memory only.
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
const OUT=path.join(H.ROOT,'art-source/entregas/veyra-codex-20261028/cierre-02');
(async()=>{const site=await H.startSite(),browser=await H.launch(),result=[];
try{for(const variant of ['main','candidate'])for(const mobile of [false,true]){const page=await browser.newPage({viewport:mobile?{width:844,height:390}:{width:1280,height:800},serviceWorkers:'block'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(site.url+'/?lazy=1');await page.waitForFunction(()=>typeof makeHero==='function');
await page.evaluate(()=>{loop=function(){};assetsStartGroup('ch:veyra');if(typeof assetsStartRest==='function')assetsStartRest();});
await page.waitForFunction(()=>CHAMP_PACK.veyra?.ready);
if(variant==='candidate'){const meta=JSON.parse(fs.readFileSync(path.join(OUT,'candidate-meta.json')));await page.evaluate(meta=>champPackLoadAtlas('veyra','art-source/entregas/veyra-codex-20261028/cierre-02/candidate-atlas.png',meta),meta);await page.waitForFunction(()=>CHAMP_PACK.veyra?.ready);}
const data=await page.evaluate(()=>{selectedClass='veyra';currentArena='bosque';lobbyAllies=[];startRun(1);state='paused';window.ART_GATE_NO_VFX=true;
const cv=document.createElement('canvas');cv.width=720;cv.height=1120;cv.id='audit-veyra';const g=cv.getContext('2d',{willReadFrequently:true}),old=ctx,rows=[],baseDraw=g.drawImage.bind(g);let draws=[];
g.fillStyle='#26302c';g.fillRect(0,0,cv.width,cv.height);g.drawImage=function(im,...a){draws.push({source:(im._srcImg||im).__pngSrc||(im._srcImg||im).src||'canvas',rect:a.slice(0,4)});return baseDraw(im,...a);};
const states=['idle','walk','attack','cast','ultimate','hit','death'],views={down:[0,1],side:[1,0],up:[0,-1],left:[-1,0]};
try{ctx=g;states.forEach((st,ri)=>Object.entries(views).forEach(([dir,[fx,fy]],ci)=>{const samples=[];let visible;for(let n=0;n<4;n++){const h=makeHero('veyra',true,0,0);Object.assign(h,{x:0,y:0,fx,fy,_pdir:dir==='left'?'side':dir,_pleft:dir==='left',moving:st==='walk',animT:n*130,attackAnim:['attack','cast','ultimate'].includes(st)?400-n*100:0,_aDur:400,_aPrev:400,hurtTimer:st==='hit'?160-n*40:0,_packCastUntil:['cast','ultimate'].includes(st)?Infinity:0,portCastState:st==='ultimate'?'ultimate':'cast',_animCastKind:st==='ultimate'?2:1,_deadAt:10000,alive:st!=='death'});animNow=st==='death'?10000+n*170:10000+n*230;draws=[];g.clearRect(ci*180,ri*160,180,160);g.fillStyle="#26302c";g.fillRect(ci*180,ri*160,180,160);g.save();g.translate(ci*180+90,ri*160+125);g.imageSmoothingEnabled=false;try{if(st==='death')drawFallenHero(h);else drawHeroBody(h,h.scale,false,false);}finally{g.restore();}if(n===1)visible=g.getImageData(ci*180,ri*160,180,160);samples.push({sample:n,draws:[...draws]});}g.putImageData(visible,ci*180,ri*160);g.fillStyle='#fff';g.font='12px monospace';g.fillText(st+' '+dir,ci*180+8,ri*160+149);rows.push({state:st,direction:dir,samples});}));}finally{ctx=old;}
cv.style.cssText='width:720px!important;height:1120px!important;max-width:none!important;max-height:none!important;position:static!important;transform:none!important';document.body.appendChild(cv);document.body.style.margin='0';return {rows,atlasReady:CHAMP_PACK.veyra.ready,atlas:CHAMP_PACK.veyra.atlas.src,scope:'Actual drawHeroBody/drawFallenHero on fresh main, synthetic animation states on isolated canvas; not real casts/gameplay/relay or Art PASS'};});
const png=await page.locator('#audit-veyra').evaluate(c=>c.toDataURL('image/png'));fs.writeFileSync(path.join(OUT,'runtime-'+variant+'-'+(mobile?'mobile':'desktop')+'.png'),Buffer.from(png.split(',')[1],'base64'));result.push({variant,mobile,errors,...data});const combat=await page.evaluate(()=>{
 document.getElementById("audit-veyra")?.remove();
 window.ART_GATE_NO_VFX=false;selectedClass='veyra';currentArena='bosque';lobbyAllies=[];startRun(5);heroes=[player];state='playing';player.invulnTimer=1e9;ensureCanvasSize();
 for(let i=0;i<5;i++){spawnEnemy('duende_bosque',false,false);const e=enemies[enemies.length-1];e.x=player.x+100+i*20;e.y=player.y+(i-2)*40;e.hp=e.maxHp=10000;}
 for(let i=0;i<60;i++)update(16);
 const P=CHAMP_PACK.veyra,old=champPackDrawFrame;let observed=[];champPackDrawFrame=(p,v,...a)=>{if(p===P)observed.push(v);return old(p,v,...a);};const casts=[],shots=[];
 try{for(let k=0;k<3;k++){player.cds=[0,0,0];player.energy=player.maxEnergy;observed=[];const accepted=useSkill(k,{x:player.x+120,y:player.y});render();casts.push({skill:k,accepted:!!accepted,bodyFrames:observed.slice(),source:P.atlas.src});shots.push({name:'h'+(k+1),png:canvas.toDataURL()});for(let i=0;i<30;i++)update(16);}
 player.ultCharge=player.ultMax;player.ultCd=0;observed=[];useUltimate();render();casts.push({skill:'ultimate',bodyFrames:observed.slice(),source:P.atlas.src});shots.push({name:'ultimate',png:canvas.toDataURL()});return{casts,shots,canvas:[canvas.width,canvas.height]};
 }finally{champPackDrawFrame=old;state='paused';}
});
for(const s of combat.shots)fs.writeFileSync(path.join(OUT,'combat-'+variant+'-'+(mobile?'mobile':'desktop')+'-'+s.name+'.png'),Buffer.from(s.png.split(',')[1],'base64'));
result[result.length-1].combat={casts:combat.casts,canvas:combat.canvas,scope:'Real useSkill/ultimate on main gameplay with candidate only in browser. Bosque/base diagnostic; no paired scene hashes, ABA, skins, relay or ArtPASS.'};
await page.close();}
fs.writeFileSync(path.join(OUT,'RUNTIME_COMPARISON.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({viewports:2,samples:result.reduce((n,r)=>n+r.rows.reduce((a,x)=>a+x.samples.length,0),0),errors:result.flatMap(r=>r.errors)}));
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
