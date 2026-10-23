'use strict';
// Captura los botones de habilidad del HUD (844x390) de TODOS los campeones, para comparar antes/después del contrato de íconos.
// Uso: PHASE=antes|despues [ROOT_DIR=<carpeta servida>] [ICON_PORT=8971] [CHAMPS=a,b] node tools/ux/capture-icon-contract.js
// Salida: docs/ux/iconos-contrato/<PHASE>/<campeón>.png (recorte de la zona de botones, escala x2, estado listo).
const {spawn}=require('node:child_process'),path=require('node:path'),fs=require('node:fs');
let chromium;try{({chromium}=require('playwright'));}catch(e){({chromium}=require('/opt/node22/lib/node_modules/playwright'));}
const REPO=path.resolve(__dirname,'../..'),ROOT=path.resolve(process.env.ROOT_DIR||REPO),PORT=+(process.env.ICON_PORT||8971),PHASE=process.env.PHASE||'despues';
const OUT=path.join(REPO,'docs/ux/iconos-contrato',PHASE);fs.mkdirSync(OUT,{recursive:true});
const server=spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 await sleep(600);
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium',args:['--no-sandbox']});
 try{
  const ctx=await browser.newContext({viewport:{width:844,height:390},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${PORT}/`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof startRun==='function',null,{timeout:120000});
  const champs=process.env.CHAMPS?process.env.CHAMPS.split(','):await page.evaluate(()=>Object.keys(CLASSES));
  for(const champ of champs){
   await page.evaluate(champ=>{
    for(const ck in save.champions){const s=save.champions[ck];s.unlocked=true;s.level=20;}
    selectedClass=champ;currentArena='bosque';lobbyAllies=['tanque'];netMatch=null;startRun(3);setState('playing');
    enemies=[];spawnTimer=1e9;player.energy=1e4;player.ultCharge=player.ultMax;player.ultCd=0;runLevel=Math.max(runLevel,ULT_MIN_ARENA_LEVEL);
    player.cds=[0,0,0];player.cdTotal=[12000,12000,12000];
    updateAbilityButtons();updateHUD();if(typeof updateSkillButtonStates==='function')updateSkillButtonStates();
   },champ);
   await sleep(300);
   const box=await page.evaluate(()=>{const r=[...document.querySelectorAll('#btn-s1,#btn-s2,#btn-s3,#btn-ult,#btn-basic')].map(e=>e.getBoundingClientRect());
    const x=Math.min(...r.map(b=>b.left))-8,y=Math.min(...r.map(b=>b.top))-8,x2=Math.max(...r.map(b=>b.right))+8,y2=Math.max(...r.map(b=>b.bottom))+8;
    return {x:Math.max(0,x),y:Math.max(0,y),width:Math.min(innerWidth,x2)-Math.max(0,x),height:Math.min(innerHeight,y2)-Math.max(0,y)};});
   await page.screenshot({path:path.join(OUT,`${champ}.png`),clip:box});
  }
  console.log(`captura ${PHASE}: ${champs.length} campeones -> ${path.relative(REPO,OUT)}`);
  if(errors.length)console.log('errores de página:',errors.slice(0,3));
 }finally{await browser.close();server.kill();}
})().catch(e=>{console.error(e);server.kill();process.exitCode=1;});
