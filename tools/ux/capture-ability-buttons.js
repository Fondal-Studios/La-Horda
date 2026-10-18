'use strict';
// Captura los botones de habilidad del HUD en 844x390 (iPhone 13 Pro apaisado) para comparar antes/después.
// Uso: PHASE=antes|despues [CHAMPS=khepri,vhal,...] node tools/ux/capture-ability-buttons.js
// Salida: docs/ux/iconos/<PHASE>-<campeón>-<listo|enfriando>.png (recorte de la zona de botones, escala x2).
const {spawn}=require('node:child_process'),path=require('node:path'),fs=require('node:fs');
let chromium;try{({chromium}=require('playwright'));}catch(e){({chromium}=require('/opt/node22/lib/node_modules/playwright'));}
const ROOT=path.resolve(__dirname,'../..'),PORT=+(process.env.ICON_PORT||8861),PHASE=process.env.PHASE||'despues';
const OUT=path.join(ROOT,'docs/ux/iconos');fs.mkdirSync(OUT,{recursive:true});
const CHAMPS=(process.env.CHAMPS||'khepri,vhal,velmira,aurelia,aelith,axiom,baltra,veyra').split(',');
const server=spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 await sleep(500);
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium',args:['--no-sandbox']});
 try{
  const ctx=await browser.newContext({viewport:{width:844,height:390},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${PORT}/`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof startRun==='function',null,{timeout:120000});
  for(const champ of CHAMPS){
   for(const state of ['listo','enfriando']){
    await page.evaluate(([champ,state])=>{
     for(const ck in save.champions){const s=save.champions[ck];s.unlocked=true;s.level=20;}
     selectedClass=champ;currentArena='bosque';lobbyAllies=['tanque'];netMatch=null;startRun(3);setState('playing');
     enemies=[];spawnTimer=1e9;player.energy=1e4;player.ultCharge=player.ultMax;player.ultCd=0;runLevel=Math.max(runLevel,ULT_MIN_ARENA_LEVEL);
     const cd=state==='enfriando'?7400:0;player.cds=[cd,cd,cd];player.cdTotal=[12000,12000,12000];
     updateAbilityButtons();updateHUD();if(typeof updateSkillButtonStates==='function')updateSkillButtonStates();
    },[champ,state]);
    await sleep(350);
    const box=await page.evaluate(()=>{const r=[...document.querySelectorAll('#btn-s1,#btn-s2,#btn-s3,#btn-ult,#btn-basic')].map(e=>e.getBoundingClientRect());
     const x=Math.min(...r.map(b=>b.left))-8,y=Math.min(...r.map(b=>b.top))-8,x2=Math.max(...r.map(b=>b.right))+8,y2=Math.max(...r.map(b=>b.bottom))+8;
     return {x:Math.max(0,x),y:Math.max(0,y),width:Math.min(innerWidth,x2)-Math.max(0,x),height:Math.min(innerHeight,y2)-Math.max(0,y)};});
    await page.screenshot({path:path.join(OUT,`${PHASE}-${champ}-${state}.png`),clip:box});
   }
   console.log('captura',PHASE,champ);
  }
  if(errors.length)console.log('errores de página:',errors.slice(0,3));
 }finally{await browser.close();server.kill();}
})().catch(e=>{console.error(e);server.kill();process.exitCode=1;});
