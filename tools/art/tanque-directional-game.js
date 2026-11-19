'use strict';
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
const OUT=path.join(H.ROOT,'art-source/entregas/bloques/B002_tanque/cierre-direccional-01/gameplay');
const ARENAS=['bosque','hielo','infernal','laberinto','acuatica','minas'];
const LOOKS=[null,'baluarte','tanque_ancestral','tanque_juicio'];
const DIRS=[['down',0,1,0,false],['right',1,0,4,false],['up',0,-1,8,false],['left',-1,0,4,true]];
const AGES=[[0,0],[120,1],[280,2],[600,3]];
(async()=>{fs.mkdirSync(OUT,{recursive:true});const site=await H.startSite(),browser=await H.launch(),runs=[];try{
 for(const mobile of [false,true])for(const arena of ARENAS){
  const page=await browser.newPage({viewport:mobile?{width:844,height:390}:{width:1280,height:720},serviceWorkers:'block'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await H.goto(page,site.url+'/?lazy=1');
  await page.evaluate(()=>{loop=function(){};assetsStartAllChampions();if(typeof assetsStartRest==='function')assetsStartRest();cromaLoadAll();});
  await page.waitForFunction(()=>TANQUE_IMG_READY&&CHAMP_PACK.codex_tanque?.ready&&CHAMP_PACK.tanque_cast?.ready&&CHAMP_PACK.skin_baluarte?.ready&&CHAMP_PACK.croma_tanque_ancestral?.ready&&CHAMP_PACK.croma_tanque_juicio?.ready,null,{timeout:120000});
  const result=await page.evaluate(({arena,looks,dirs,ages})=>{
   selectedClass='tanque';currentArena=arena;lobbyAllies=['soporte'];netMatch=null;divinaMode=false;startRun(1);state='paused';window.ART_GATE_NO_VFX=true;
   document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));_arenaTitleUntil=0;
   const oldCtx=ctx,cv=document.createElement('canvas');cv.width=720;cv.height=600;const g=cv.getContext('2d',{willReadFrequently:true}),rows=[];
   function visible(){const d=g.getImageData(0,0,cv.width,cv.height).data;for(let i=3;i<d.length;i+=4)if(d[i]>40)return true;return false;}
   try{ctx=g;for(let li=0;li<looks.length;li++){const look=looks[li];for(let di=0;di<dirs.length;di++){const [dir,fx,fy,offset,flip]=dirs[di];for(const [age,n] of ages){
    const h=makeHero('tanque',true,90+di*170,130+li*140);Object.assign(h,{_codexSkin:look,fx,fy,growMaxTimer:1000,growTimer:1000-age,_pdir:undefined,_pleft:false,attackAnim:0,hurtTimer:0,moving:false});
    const calls=[],orig=champPackDrawFrame,before=JSON.stringify([h.hp,h.shield,h.energy,h.x,h.y,h.growTimer,h.growMaxTimer]);
    champPackDrawFrame=function(P,v,x,y,s,f){calls.push({cast:P===CHAMP_PACK.tanque_cast,frame:v<0?~v:v,flip:(v<0)!==!!f});return orig.apply(this,arguments);};
    g.clearRect(0,0,cv.width,cv.height);try{drawHeroBody(h,2,false,false);}finally{champPackDrawFrame=orig;}
    const after=JSON.stringify([h.hp,h.shield,h.energy,h.x,h.y,h.growTimer,h.growMaxTimer]),candidate=calls.filter(c=>c.cast);
    rows.push({look:look||'base',dir,n,visible:visible(),candidate:candidate.length,candidateFrame:candidate[0]?.frame,candidateFlip:candidate[0]?.flip,stateSame:before===after,pass:look?visible()&&candidate.length===0:visible()&&candidate.length===1&&candidate[0].frame===offset+n&&candidate[0].flip===flip&&before===after});
   }}}
   return{rows,png:cv.toDataURL()};
   }finally{ctx=oldCtx;state='menu';}
  },{arena,looks:LOOKS,dirs:DIRS,ages:AGES});
  fs.writeFileSync(path.join(OUT,(mobile?'mobile-':'desktop-')+arena+'.png'),Buffer.from(result.png.split(',')[1],'base64'));delete result.png;
  runs.push({mobile,arena,errors,...result});await page.close();
 }
 const rows=runs.flatMap(r=>r.rows.map(x=>({mobile:r.mobile,arena:r.arena,...x}))),failed=rows.filter(x=>!x.pass),report={scope:'Six real arenas, desktop/mobile, base Aldric plus Baluarte/Bastion Ancestral/Paladin del Juicio, four directions and four cast phases. Base must consume the directional candidate; authored appearances must retain their own art. Draws may update direction cache only; combat fields remain unchanged.',runs:runs.map(r=>({...r,rows:undefined})),rows,status:!failed.length&&runs.every(r=>!r.errors.length)?'PASS':'FAIL'};
 fs.writeFileSync(path.join(OUT,'GAME_MATRIX.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,scenes:runs.length,checks:rows.length,base:rows.filter(x=>x.look==='base').length,appearances:rows.filter(x=>x.look!=='base').length,failed:failed.slice(0,20),errors:runs.flatMap(r=>r.errors)}));if(report.status!=='PASS')process.exitCode=1;
 }finally{await browser.close();await site.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
