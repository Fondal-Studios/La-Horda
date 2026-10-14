#!/usr/bin/env node
'use strict';
// Hoja comparativa de arte: cada campeón nuevo (base y skins de autor) junto a su donante de cuerpo, su donante de cabeza y
// tres campeones existentes de su rol, dibujados por el MISMO motor (makeHero + drawHeroBody, sin VFX, vista frontal, escala x2).
// Sirve para juzgar a ojo si un sprite se lee como recoloreo de otro campeón o rompe el estilo (docs/ART_BIBLE.md).
// Uso: ROSTER_BASE_URL=http://127.0.0.1:8851 node tools/siete/compare-sheet.js  -> docs/production/siete/compare-sheet.png
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'../..'),BASE=process.env.ROSTER_BASE_URL||'http://127.0.0.1:8851';
const ROWS={ilsa:{donors:['vesper','maura'],peers:['guerrero','cazadora','musashi']},
 vorn:{donors:['renko','baltra'],peers:['tanque','segador','eslabon']},kora:{donors:['zahra','orsa'],peers:['tanque','segador','eslabon']}};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 try{const p=await b.newPage({viewport:{width:1400,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(BASE+'/index.html');await p.waitForFunction(()=>typeof makeHero==='function'&&typeof CHAMPION_ENTRY_BALANCE!=='undefined',null,{timeout:120000});await p.waitForTimeout(2500);
  const dims=await p.evaluate(rows=>{
   window.ART_GATE_NO_VFX=true;selectedClass='tanque';currentArena='bosque';startRun(1);state='paused';
   const CW=170,CH=190,ids=Object.keys(rows),cols=9,cv=document.createElement('canvas');cv.width=CW*cols;cv.height=CH*ids.length;cv.id='cmp';cv.style.cssText='position:fixed;left:0;top:0;z-index:99999';document.body.appendChild(cv);
   const g=cv.getContext('2d'),saved=ctx;g.fillStyle='#3e4339';g.fillRect(0,0,cv.width,cv.height);g.imageSmoothingEnabled=false;
   ids.forEach((k,r)=>{const skins=[0,1,2].filter(n=>n===0||ASCENSION_SKINS[k][n-1]);const cells=[];
    for(const n of skins)cells.push({k,asc:n,label:k+(n?' skin '+n:'')});
    while(cells.length<3)cells.push(null);
    for(const d of rows[k].donors)cells.push({k:d,label:'donante '+d});
    for(const q of rows[k].peers)cells.push({k:q,label:q});
    cells.forEach((c,i)=>{if(!c)return;const cx=i*CW+CW/2,cy=r*CH+CH-40;
     const h=makeHero(c.k,true,0,0);Object.assign(h,{fx:0,fy:1,moving:false,attackAnim:0,animT:0,hurtTimer:0,_packCastUntil:0});if(c.asc)h.ascSkin=c.asc;
     g.save();g.translate(cx,cy);g.scale(2,2);ctx=g;try{h.x=0;h.y=0;drawHeroBody(h,h.scale,false,false);}catch(e){}ctx=saved;g.restore();
     g.fillStyle='#fff';g.font='11px monospace';g.fillText(c.label,cx-CW/2+6,cy+34);});});
   return [cv.width,cv.height];},ROWS);
  await p.setViewportSize({width:Math.max(800,dims[0]),height:Math.max(600,dims[1])});
  fs.mkdirSync(path.join(ROOT,'docs/production/siete'),{recursive:true});
  await (await p.$('#cmp')).screenshot({path:path.join(ROOT,'docs/production/siete/compare-sheet.png'),timeout:240000});
  console.log(JSON.stringify({dims,errors}));if(errors.length)process.exitCode=1;
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
