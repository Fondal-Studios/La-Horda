#!/usr/bin/env node
"use strict";
const {chromium}=require("playwright");
const fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,"../.."), BASE=process.env.AXIOM_BASE_URL||"http://127.0.0.1:8754";
const OUT=path.join(ROOT,"docs/art-gate/axiom-codex-20261030");
fs.mkdirSync(OUT,{recursive:true});
const LEGACY={w:88,h:99,cols:8,refH:76,anchor:.9394,sets:{idle_down:[17,18,19,20],idle_side:[29],idle_left:[25],idle_up:[33],walk_down:[21,22,23,24],walk_side:[29,30,31,32],walk_left:[25,26,27,28],walk_up:[33,34,35,36],attack_side:[0,1,2,3],cast_side:[4,5,6],hit_down:[13,14,15,16],death_down:[7,8,9,10,11,12]}};
const VIEWS={desktop:{width:960,height:720},mobile:{width:430,height:800}};
const ARENAS=["bosque","hielo","infernal","laberinto","ciudad","minas"];
const LOOKS=[["base",""],["sistema","sistema"],["ambar","axiom_piedra"]];
const ONLY=process.env.AXIOM_VIEW||"";
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:["--no-sandbox"]});
 const errors=[],captures=[];
 try{
  for(const [vn,viewport] of Object.entries(VIEWS)){
   if(ONLY&&vn!==ONLY)continue;
   const page=await browser.newPage({viewport:vn==="mobile"?VIEWS.desktop:viewport});
   page.on("pageerror",e=>errors.push(vn+": "+e.message));
   await page.goto(BASE+"/index.html");
   await page.waitForFunction(()=>typeof CHAMP_PACK!=="undefined"&&CHAMP_PACK.axiom&&CHAMP_PACK.axiom.ready&&CHAMP_PACK.skin_sistema&&CHAMP_PACK.skin_sistema.ready,null,{timeout:60000});
   await page.evaluate(({legacy})=>{
    cromaEnsureLoaded("axiom_piedra");
    champPackLoadAtlas("axiom_legacy","assets/sprites/champions/axiom/v2/atlas.png",legacy);
   },{legacy:LEGACY});
   await page.waitForFunction(()=>["axiom","skin_sistema","croma_axiom_piedra","axiom_legacy"].every(k=>CHAMP_PACK[k]&&CHAMP_PACK[k].ready),null,{timeout:30000});
   if(vn==="mobile"){ await page.setViewportSize(viewport); await page.waitForTimeout(250); }
   if(vn==="desktop"){
    const audit=await page.evaluate(()=>{
     if(!save.champions.axiom)save.champions.axiom=mkChampion(true);
     save.champions.axiom.unlocked=true;
     const expected=["idle_down","walk_down","attack_down","cast_down","ultimate_down","hit_down","death_down","idle_side","walk_side","attack_side","cast_side","ultimate_side","hit_side","death_side","idle_up","walk_up","attack_up","cast_up","ultimate_up","hit_up","death_up"];
     const out={};
     for(const [label,key,skin] of [["base","axiom",""],["sistema","skin_sistema","sistema"],["ambar","croma_axiom_piedra","axiom_piedra"]]){
      const P=CHAMP_PACK[key], indices=expected.flatMap(s=>P.sets[s]||[]);
      const h={classKey:"axiom",_codexSkin:skin};
      out[label]={key,ready:P.ready,failed:!!P.failed,natural:[P.atlas.naturalWidth,P.atlas.naturalHeight],frame:[P.fw,P.fh],cols:P.cols,refH:P.refH,
       states:Object.fromEntries(expected.map(s=>[s,(P.sets[s]||[]).slice()])),missing:expected.filter(s=>!P.sets[s]),badIndices:indices.filter(i=>i<0||i>35),
       resolved:setSkinPackKey(h,"axiom")};
     }
     const sys=netLoadoutRecord({champ:"axiom",level:1,cosmeticSkin:"sistema",items:[],equipment:{}});
     const amb=netLoadoutRecord({champ:"axiom",level:1,croma:"axiom_piedra",items:[],equipment:{}});
     const bad=netLoadoutRecord({champ:"axiom",level:1,cosmeticSkin:"merienda_magica",croma:"myla_arandanos",items:[],equipment:{}});
     return {packs:out,network:{sistema:sys.cosmeticSkin||null,ambar:amb.croma||null,rejectForeignSkin:!bad.cosmeticSkin,rejectForeignCroma:!bad.croma}};
    });
    fs.writeFileSync(path.join(OUT,"RUNTIME_AUDIT.json"),JSON.stringify(audit,null,2)+"\n");
    for(const [label,v] of Object.entries(audit.packs)){
     if(!v.ready||v.failed||v.natural[0]!==448||v.natural[1]!==1008||v.missing.length||v.badIndices.length||v.resolved!==v.key)throw new Error("pack "+label+" "+JSON.stringify(v));
    }
    if(Object.values(audit.network).some(v=>v!==true&&v!=="sistema"&&v!=="axiom_piedra"))throw new Error("network "+JSON.stringify(audit.network));
   }
   for(const arena of ARENAS){
    await page.evaluate(({arena})=>{
     selectedClass="axiom";currentArena=arena;
     if(!save.champions.axiom)save.champions.axiom=mkChampion(true);
     save.champions.axiom.unlocked=true;
     startRun(1);state="paused";screenShake=0;CAM_LEAD_X=0;CAM_LEAD_Y=0;
     player.fx=0;player.fy=1;player.moving=true;player.animT=260;player.attackAnim=0;player.hurtTimer=0;
     player._codexSkin="";player._codexPack=null;
     render();
    },{arena});
    if((arena==="bosque"||arena==="hielo")){
     await page.evaluate(()=>{player._codexSkin="";player._codexPack="axiom_legacy";render();});
     const f=path.join(OUT,`before-${arena}-${vn}.png`),b64=await page.evaluate(()=>document.getElementById("game").toDataURL("image/png").split(",")[1]);fs.writeFileSync(f,Buffer.from(b64,"base64"));captures.push(path.basename(f));
    }
    for(const [label,skin] of LOOKS){
     await page.evaluate(({skin})=>{player._codexPack=null;player._codexSkin=skin;player.fx=0;player.fy=1;player.moving=true;player.animT=260;render();},{skin});
     const f=path.join(OUT,`after-${arena}-${label}-${vn}.png`),b64=await page.evaluate(()=>document.getElementById("game").toDataURL("image/png").split(",")[1]);fs.writeFileSync(f,Buffer.from(b64,"base64"));captures.push(path.basename(f));
    }
   }
   await page.close();
  }
  const allCaptures=fs.readdirSync(OUT).filter(x=>x.endsWith(".png")&&(x.startsWith("before-")||x.startsWith("after-"))).sort();
  fs.writeFileSync(path.join(OUT,"CAPTURES.json"),JSON.stringify({viewports:VIEWS,arenas:ARENAS,looks:LOOKS.map(x=>x[0]),captures:allCaptures,errors},null,2)+"\n");
  console.log(JSON.stringify({captures:allCaptures.length,newCaptures:captures.length,errors:errors.length}));
  if(errors.length)process.exitCode=1;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
