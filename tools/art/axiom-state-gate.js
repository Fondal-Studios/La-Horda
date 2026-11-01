#!/usr/bin/env node
"use strict";
const {chromium}=require("playwright"),fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,"../.."),OUT=path.join(ROOT,"docs/art-gate/axiom-codex-20261030"),BASE=process.env.AXIOM_BASE_URL||"http://127.0.0.1:8761";
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:["--no-sandbox"]});try{
 const p=await b.newPage({viewport:{width:1200,height:700}}),errors=[];p.on("pageerror",e=>errors.push(e.message));await p.goto(BASE+"/index.html");
 await p.waitForFunction(()=>typeof CHAMP_PACK!=="undefined"&&CHAMP_PACK.axiom?.ready&&CHAMP_PACK.skin_sistema?.ready,null,{timeout:60000});
 await p.evaluate(()=>cromaEnsureLoaded("axiom_piedra"));await p.waitForFunction(()=>CHAMP_PACK.croma_axiom_piedra?.ready,null,{timeout:30000});
 const result=await p.evaluate(()=>{
  if(!save.champions.axiom)save.champions.axiom=mkChampion(true);selectedClass="axiom";currentArena="bosque";startRun(1);state="paused";window.ART_GATE_NO_VFX=true;
  const looks=[["base",""],["sistema","sistema"],["ambar","axiom_piedra"]],states=["idle","walk","attack","cast","ultimate","hit","death"],dirs=[["down",0,1],["side",1,0],["up",0,-1]],out={};
  for(const [label,skin] of looks){
   const W=7*128,H=3*144,cv=document.createElement("canvas");cv.width=W;cv.height=H;const g=cv.getContext("2d",{willReadFrequently:true}),saved=ctx;g.fillStyle="#171b25";g.fillRect(0,0,W,H);out[label]=[];
   for(let ry=0;ry<dirs.length;ry++)for(let sx=0;sx<states.length;sx++){
    const [dir,fx,fy]=dirs[ry],st=states[sx],h=makeHero("axiom",true,0,0);Object.assign(h,{_codexSkin:skin,fx,fy,moving:false,animT:260,attackAnim:0,hurtTimer:0,_packCastUntil:0,portCastState:null,_deadAt:1});
    if(st==="walk")h.moving=true;else if(st==="attack"){h.attackAnim=250;h._aDur=500;}else if(st==="cast"){h.attackAnim=250;h._aDur=500;h._packCastUntil=Infinity;}else if(st==="ultimate"){h.attackAnim=250;h._aDur=500;h._packCastUntil=Infinity;h.portCastState="ultimate";}else if(st==="hit")h.hurtTimer=80;
    const x=sx*128+64,y=ry*144+112;g.save();ctx=g;animNow=st==="death"?690:260;h.x=x;h.y=y;
    if(st==="death")drawChampPackDeath(h);else drawHeroBody(h,h.scale,false,false);
    ctx=saved;g.restore();g.fillStyle="#fff";g.font="11px monospace";g.fillText(st,sx*128+5,ry*144+14);g.fillText(dir,sx*128+5,ry*144+28);
    const d=g.getImageData(sx*128,ry*144,128,144).data;let alpha=0;for(let i=3;i<d.length;i+=4)if(d[i])alpha++;out[label].push({state:st,dir,alpha});
   }
   out[label+"Png"]=cv.toDataURL("image/png").split(",")[1];
  }
  return out;
 });
 for(const label of ["base","sistema","ambar"]){fs.writeFileSync(path.join(OUT,"states-"+label+".png"),Buffer.from(result[label+"Png"],"base64"));delete result[label+"Png"];if(result[label].some(x=>x.alpha<30))throw new Error(label+" empty "+JSON.stringify(result[label].filter(x=>x.alpha<30)));}
 result.errors=errors;fs.writeFileSync(path.join(OUT,"STATE_AUDIT.json"),JSON.stringify(result,null,2)+"\n");console.log(JSON.stringify({looks:3,cells:63,errors:errors.length}));if(errors.length)process.exitCode=1;
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
