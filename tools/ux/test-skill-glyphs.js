'use strict';
// Glifos de habilidad (críticas #2 del crítico indie): cada habilidad de cada campeón tiene su propio glifo pixel.
// FALLA si: un campeón cae en el glifo genérico (sin entrada en SKILL_PIXEL_MAP), dos habilidades de un mismo kit
// comparten motivo o imagen, una pareja motivo+insignia se repite en el roster, o en el HUD (844x390) el rótulo se sale
// del botón o los 4 botones no muestran imágenes distintas. Incluye el kit del Coloso de Ilkan.
// GLYPH_FAST=1 omite la parte del HUD (la lenta: arranca una partida por campeón).
const assert=require('node:assert/strict'),{spawn}=require('node:child_process'),path=require('node:path');
let chromium;try{({chromium}=require('playwright'));}catch(e){({chromium}=require('/opt/node22/lib/node_modules/playwright'));}
const ROOT=path.resolve(__dirname,'../..'),PORT=+(process.env.GLYPH_PORT||8845);
const server=spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 await sleep(500);
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox']});
 const problems=[];
 try{
  const page=await browser.newPage({viewport:{width:844,height:390}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${PORT}/`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof startRun==='function'&&typeof skillPixelGlyphKey==='function'&&typeof PIX_MOTIFS_V2==='object',null,{timeout:120000});
  // 1) datos: kits, motivos y parejas
  const data=await page.evaluate(()=>{
   const kits={};for(const k of Object.keys(CLASSES))kits[k]=CLASSES[k];kits.ilkan_colossus=ILKAN_COLOSSUS_CLS;
   const out={kits:[],badGrid:[],staleMap:[]};
   for(const [id,c] of Object.entries(kits)){
    const list=[...c.skills,c.ultimate].map((sk,i)=>{
     const png=null; // el HUD ya no usa recortes de sprite: todas las habilidades salen del contrato de íconos
     const key=skillPixelGlyphKey(id,i);
     let rows=null;if(key){const g=skillPixelGrid(key);if(!g)out.badGrid.push(id+':'+i+' '+key);else rows=g.join('|');}
     return {name:sk.name,slot:i,key,png,rows};
    });
    out.kits.push({id,list});
   }
   const ids=new Set(Object.keys(kits));
   for(const k of Object.keys(SKILL_PIXEL_MAP))if(!ids.has(k.split(':')[0])||!/:(0|1|2|u)$/.test(k))out.staleMap.push(k);
   for(const k of Object.keys(SKILL_PIXEL_MAP)){const [m]=SKILL_PIXEL_MAP[k].split('+');if(!PIX_MOTIFS[m])out.badGrid.push(k+' motivo '+m);}
   return out;
  });
  const seenPair=new Map();let total=0;
  for(const {id,list} of data.kits){
   const motifs=new Set(),imgs=new Set();
   for(const a of list){
    total++;
    const label=`${id} #${a.slot} "${a.name}"`;
    if(!a.png&&!a.key){problems.push(`${label}: sin glifo propio (cae en el genérico)`);continue;}
    const motif=a.png||a.key.split('+')[0],img=a.png||a.rows;
    if(motifs.has(motif))problems.push(`${label}: comparte motivo "${motif}" con otra habilidad del kit`);
    if(imgs.has(img))problems.push(`${label}: comparte la misma imagen con otra habilidad del kit`);
    motifs.add(motif);imgs.add(img);
    if(a.key){if(seenPair.has(a.key))problems.push(`${label}: pareja motivo+insignia "${a.key}" repetida con ${seenPair.get(a.key)}`);else seenPair.set(a.key,label);}
   }
  }
  data.badGrid.forEach(x=>problems.push('glifo mal definido: '+x));
  data.staleMap.forEach(x=>problems.push('entrada del mapa sin campeón: '+x));
  console.log(`${total} habilidades en ${data.kits.length} kits revisadas (incl. Coloso de Ilkan)`);
  // 2) HUD en 844x390: imágenes distintas por botón, rótulo dentro del botón, sin pisarse con el enfriamiento
  const hud=process.env.GLYPH_FAST?[]:await page.evaluate(async()=>{
   const out=[];
   for(const ck in save.champions){const s=save.champions[ck];s.unlocked=true;s.level=20;}
   for(const champ of Object.keys(CLASSES)){
    selectedClass=champ;currentArena='bosque';lobbyAllies=['tanque'];netMatch=null;startRun(3);setState('playing');updateHUD();updateAbilityButtons();
    const row={champ,imgs:[],issues:[]};
    for(const id of ['btn-s1','btn-s2','btn-s3','btn-ult']){
     const el=document.getElementById(id),img=el.querySelector('.ico img'),lab=el.querySelector('div:not(.ico):not(.cd-overlay)');
     if(!img)row.issues.push(`${id} sin imagen`);else row.imgs.push(img.getAttribute('src'));
     if(id!=='btn-ult'&&lab){
      const b=el.getBoundingClientRect(),l=lab.getBoundingClientRect();
      if(lab.scrollWidth>lab.clientWidth+1)row.issues.push(`${id} rótulo cortado "${lab.textContent}" (${lab.scrollWidth}>${lab.clientWidth})`);
      if(l.left<b.left-1||l.right>b.right+1)row.issues.push(`${id} rótulo "${lab.textContent}" fuera del botón`);
      player.cds=[7000,7000,7000];player.cdTotal=[12000,12000,12000];updateSkillButtonStates();
      if(getComputedStyle(lab).visibility!=='hidden')row.issues.push(`${id} rótulo visible durante el enfriamiento (se pisa con el número)`);
      player.cds=[0,0,0];updateSkillButtonStates();
     }
    }
    if(new Set(row.imgs).size!==row.imgs.length)row.issues.push('imágenes repetidas entre botones');
    out.push(row);
   }
   return out;
  });
  for(const r of hud)for(const i of r.issues)problems.push(`HUD ${r.champ}: ${i}`);
  console.log(`HUD 844x390: ${hud.length} campeones revisados`);
  assert.deepEqual(errors,[]);
 }finally{await browser.close();server.kill();}
 if(problems.length){console.log('FAIL\n - '+problems.join('\n - '));process.exitCode=1;}
 else console.log('PASS glifos: cada habilidad con glifo propio, sin repetidos en el kit ni genéricos, rótulos dentro del botón');
})().catch(e=>{console.error(e);server.kill();process.exitCode=1;});
