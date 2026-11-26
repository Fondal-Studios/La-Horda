'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),H=require('../lib/serve');
const OUT='art-source/entregas/guerrero-codex-20261125/integracion-direccional-06/gameplay';
(async()=>{
 fs.mkdirSync(OUT,{recursive:true});const site=await H.startSite();let browser;const scenes=[];
 try{browser=await H.launch();
  for(const mobile of [false,true])for(const arena of ['bosque','hielo','infernal','laberinto','acuatica','minas']){
   const page=await browser.newPage({viewport:mobile?{width:844,height:390}:{width:1280,height:720},serviceWorkers:'block'}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));await H.goto(page,site.url+'/?lazy=1');
   await page.evaluate(()=>{loop=function(){};assetsStartAllChampions();if(typeof assetsStartRest==='function')assetsStartRest();for(const [id,d]of Object.entries({...SET_SKINS,...CROMA_SKINS}))if(d.champ==='guerrero')skinDefOf(id);});
   await page.waitForFunction(()=>CHAMP_PACK.codex_guerrero?.ready&&GUERRERO_IMG_READY&&CHAMP_PACK.guerrero_death?.ready&&Object.entries({...SET_SKINS,...CROMA_SKINS}).filter(([id,d])=>d.champ==='guerrero').every(([id])=>{const d=skinDefOf(id);return !d.packs||Object.values(d.packs).every(k=>CHAMP_PACK[k]?.ready);}),null,{timeout:120000});
   const result=await page.evaluate(arena=>{
    selectedClass='guerrero';currentArena=arena;lobbyAllies=[];netMatch=null;divinaMode=false;startRun(1);state='paused';window.ART_GATE_NO_VFX=true;
    const P=CHAMP_PACK.codex_guerrero,rows=[],checks=[],cv=document.createElement('canvas');cv.width=cv.height=240;const g=cv.getContext('2d',{willReadFrequently:true}),oldCtx=ctx;
    const skins=Object.entries({...SET_SKINS,...CROMA_SKINS}).filter(([id,d])=>d.champ==='guerrero').map(([id])=>id);
    const dirs=[['down',0,1,32,false],['side',1,0,36,false],['up',0,-1,40,false],['left',-1,0,36,true]];
    function draw(h){const calls=[],real=champPackDrawFrame;ctx=g;g.clearRect(0,0,240,240);champPackDrawFrame=function(pack,v,x,y,s,flip,alpha){calls.push({base:pack===P,frame:v<0?~v:v,flip:(v<0)!==!!flip,alpha});return real.apply(this,arguments);};try{drawFallenHero(h);}finally{ctx=oldCtx;champPackDrawFrame=real;}const pixels=g.getImageData(0,0,240,240).data;return{calls,visible:pixels.some((v,i)=>i%4===3&&v>40),pixels:Array.from(pixels)};}
    for(const level of [1,39,40,60,90,99])for(const look of [null,...skins])for(const [dir,fx,fy,offset,flip]of dirs){
     save.champions.guerrero.level=level;const h=makeHero('guerrero',true,120,180);Object.assign(h,{_codexSkin:look,_pdir:dir==='left'?'side':dir,_pleft:flip,fx,fy,alive:false,hp:0,_deadAt:10000});
     const selected=codexChampionPack(h),directional=selected&&(selected===P||selected.sets.death_side?.[0]===36);
     for(let n=0;n<4;n++){
      animNow=10000+n*170;const before=JSON.stringify([h.hp,h.energy,h.x,h.y,h.cds]),d=draw(h),call=d.calls[0];
      rows.push({level,look:look||'base',dir,n,visible:d.visible,calls:d.calls,pass:d.visible&&d.calls.length===1&&before===JSON.stringify([h.hp,h.energy,h.x,h.y,h.cds])&&(directional?call.frame===offset+n&&call.flip===flip:!call.base)});
     }
     animNow=12000;const end=draw(h);checks.push({name:'final pose holds '+level+'/'+look+'/'+dir,ok:end.visible&&end.calls.length===1&&end.calls[0].alpha===.55&&(!directional||end.calls[0].frame===offset+3)});
    }
    const h=makeHero('guerrero',true,120,180);Object.assign(h,{_codexSkin:null,_pdir:'side',_pleft:true,fx:-1,fy:0,alive:false,hp:0,_deadAt:10000});
    const snapshot=_netDeltaOf({},h,true),guest=netDecode(snapshot);Object.assign(guest,{x:120,y:180,_codexSkin:null});const guestFrames=[];
    for(let n=0;n<4;n++){animNow=900000+n*170;guestFrames.push(draw(guest).calls[0]?.frame);}
    checks.push({name:'guest decoded snapshot uses own death clock and side row',ok:JSON.stringify(guestFrames)==='[36,37,38,39]'&&guest._deadAt===900000&&!('_deadAt'in snapshot)});
    P.ready=false;try{animNow=11000;const d=draw(h);checks.push({name:'unloaded codex preserves visible legacy fallback',ok:d.visible&&d.calls.every(c=>!c.base)});}finally{P.ready=true;}
    h.alive=true;h.hp=1;drawHero(h);checks.push({name:'revive clears clock',ok:!h._deadAt});h.alive=false;animNow=30000;draw(h);checks.push({name:'second death restarts',ok:h._deadAt===30000});
    // Capture actual render output from this arena, with distinct world-space actors.
    document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));_arenaTitleUntil=0;
    player.alive=true;player.hp=player.maxHp;enemies=[];animNow=50000;render();
    const sheet=document.createElement('canvas');sheet.width=720;sheet.height=400;const sg=sheet.getContext('2d');sg.fillStyle='#202431';sg.fillRect(0,0,720,400);sg.fillStyle='#eadfc6';sg.font='16px sans-serif';sg.fillText('Kael: frente / derecha / espalda / izquierda; cuatro fases',12,22);
    try{ctx=sg;for(let di=0;di<dirs.length;di++)for(let n=0;n<4;n++){const [dir,fx,fy,,flip]=dirs[di],a=makeHero('guerrero',true,100+n*170,105+di*95);Object.assign(a,{_codexSkin:null,_pdir:dir==='left'?'side':dir,_pleft:flip,fx,fy,alive:false,hp:0,_deadAt:10000});animNow=10000+n*170;drawFallenHero(a);}}finally{ctx=oldCtx;}
    return{rows,checks,sheet:sheet.toDataURL()};
   },arena);
   await page.screenshot({path:OUT+'/'+(mobile?'mobile-':'desktop-')+arena+'.png'});
   fs.writeFileSync(OUT+'/'+(mobile?'mobile-':'desktop-')+arena+'-poses.png',Buffer.from(result.sheet.split(',')[1],'base64'));delete result.sheet;
   scenes.push({mobile,arena,errors,...result});await page.close();
  }
  const failed=scenes.flatMap(s=>[...s.rows.filter(r=>!r.pass),...s.checks.filter(r=>!r.ok),...s.errors]);
  fs.writeFileSync(OUT+'/RUNTIME.json',JSON.stringify({status:failed.length?'FAIL':'PASS',scenes},null,2)+'\n');
  console.log(JSON.stringify({scenes:scenes.length,checks:scenes.reduce((n,s)=>n+s.rows.length+s.checks.length,0),failed:failed.slice(0,20)}));assert.equal(failed.length,0);
 }finally{if(browser)await browser.close();await site.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
