// Canonical GET-only Códice/kit smoke. Ephemeral browser; no account or purchase actions.
'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const OUT=path.resolve(process.argv[2]||'docs/art-gate/canonical/smoke-latest');fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const url='https://fondalstudios.com/la-horda/jugar/',report={checkedAt:new Date().toISOString(),url,scope:'Isolated guest browser, static GETs only, memory-only kit/render smoke; not live multiplayer, balance or deployment certification',tlsScope:process.env.PUBLIC_SMOKE_ALLOW_PROXY_TLS==='1'?'Explicit local proxy TLS bypass in isolated GET-only browser; not TLS certification':'Normal browser TLS verification',checks:[],errors:[],blockedWrites:[]};
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox'],proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
 try{
  const context=await browser.newContext({viewport:{width:844,height:390},serviceWorkers:'block',ignoreHTTPSErrors:process.env.PUBLIC_SMOKE_ALLOW_PROXY_TLS==='1'});
  await context.route('**/*',route=>{const r=route.request();if(!['GET','HEAD'].includes(r.method())){report.blockedWrites.push({method:r.method(),path:new URL(r.url()).pathname});return route.abort();}return new URL(r.url()).origin==='https://fondalstudios.com'?route.continue():route.abort();});
  const page=await context.newPage();if(page.routeWebSocket)await page.routeWebSocket('**',ws=>ws.close());
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(url+'?lazy=1',{waitUntil:'load',timeout:120000});
  await page.waitForFunction(()=>typeof CLASSES!=='undefined'&&typeof castAbility==='function',null,{timeout:45000});
  await page.evaluate(()=>{loop=function(){};netMatch=null;divinaMode=false;for(const k of ['solciju','brakk','veyra','morveth','aelith']){skinDefOf(k+'_alt1');assetsStartGroup('ch:'+k);}});
  await page.waitForFunction(()=>['solciju','brakk','veyra','morveth','aelith'].every(k=>typeof CHAMP_PACK!=='undefined'&&CHAMP_PACK[k]&&CHAMP_PACK[k].ready&&CHAMP_PACK[skinDefOf(k+'_alt1').packs[k]]&&CHAMP_PACK[skinDefOf(k+'_alt1').packs[k]].ready),null,{timeout:45000});
  report.checks=await page.evaluate(()=>{
   const rows=[],contact=document.createElement('canvas');contact.width=1000;contact.height=440;const cg=contact.getContext('2d');cg.fillStyle='#202633';cg.fillRect(0,0,1000,440);cg.imageSmoothingEnabled=false;window.ART_GATE_NO_VFX=true;
   for(const key of ['solciju','brakk','veyra','morveth','aelith']){
    const row={key,releaseState:championMeta(key).releaseState,listed:CHAMPION_CATALOG.some(c=>c.id===key),registered:!!CLASSES[key],atlas:CHAMP_PACK[key].atlas.currentSrc||CHAMP_PACK[key].atlas.src,atlasLoaded:CHAMP_PACK[key].ready,casts:[]};
    try{
     save.champions[key].unlocked=true;save.champions[key].level=60;selectedClass=key;currentArena='bosque';lobbyAllies=[];netMatch=null;divinaMode=false;startRun(1);enemies=[];spawnTimer=1e9;arenaHazardTimer=1e9;runElapsedMs=10000;animNow=10000;player.fx=1;player.fy=0;
     const enemy=spawnEnemy('esqueleto');Object.assign(enemy,{x:player.x+50,y:player.y,hp:1e7,maxHp:1e7,speed:0,dmg:0});
     for(let n=0;n<4;n++){const a=n===3?player.cls.ultimate:player.cls.skills[n];castAbility(player,a,n===3,n===3?undefined:n);row.casts.push({name:a.name,finite:Number.isFinite(player.hp)&&Number.isFinite(player.energy)});}
     state='paused';const saved=ctx,cv=document.createElement('canvas');cv.width=cv.height=160;const g=cv.getContext('2d');g.translate(80,130);g.imageSmoothingEnabled=false;ctx=g;
     const x=player.x,y=player.y;player.x=player.y=0;player._codexSkin=null;
     try{drawHeroBody(player,player.scale,false,false);row.visible=g.getImageData(0,0,160,160).data.some((v,i)=>i%4===3&&v>40);}finally{ctx=saved;player.x=x;player.y=y;}
     const oldCtx=ctx;ctx=cg;player.x=player.y=0;player.attackAnim=0;player.hurtTimer=0;player.moving=false;player.fx=0;player.fy=1;player._packCastUntil=0;animNow=0;
     try{for(let variant=0;variant<2;variant++){cg.save();cg.translate(rows.length*200+100,variant*220+190);player._codexSkin=variant?key+'_alt1':null;drawHeroBody(player,player.scale*2,false,false);cg.restore();cg.fillStyle='#eee';cg.font='13px sans-serif';cg.fillText(variant?skinDefOf(key+'_alt1').name.split(',').pop().trim():CLASSES[key].name.split(',')[0],rows.length*200+10,variant*220+20);}}finally{ctx=oldCtx;}
     row.skin={id:key+'_alt1',name:skinDefOf(key+'_alt1').name,atlasReady:CHAMP_PACK[skinDefOf(key+'_alt1').packs[key]].ready,mode:'Codex preview, not ownership/purchase'};
     row.ok=row.releaseState==='RELEASED'&&row.listed&&row.skin.atlasReady&&row.registered&&row.atlasLoaded&&row.visible&&row.casts.length===4&&row.casts.every(c=>c.finite);
    }catch(e){row.ok=false;row.error=e.message;}
    rows.push(row);
   }
   window.__publicFiveContact=contact.toDataURL('image/png');return rows;
  });
  const shot=await page.evaluate(()=>window.__publicFiveContact);fs.writeFileSync(path.join(OUT,'contact.png'),Buffer.from(shot.split(',')[1],'base64'));
  report.status=report.checks.every(r=>r.ok)&&!report.errors.length?'SMOKE_PASS':'FAIL';
 }catch(e){report.status='FAIL';report.error=e.message;}
 finally{await browser.close();fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,champions:report.checks.length,errors:report.errors,error:report.error,output:OUT}));if(report.status!=='SMOKE_PASS')process.exitCode=1;}
})().catch(e=>{console.error(e);process.exitCode=1;});
