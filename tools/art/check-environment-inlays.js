'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const {createCanvas}=require('@napi-rs/canvas');
const world=createCanvas(960,540),g=world.getContext('2d');
let checks=0;const env={document:{createElement:()=>createCanvas(1,1)},ctx:g,player:{},currentArena:'ciudad',VW:960,VH:540,CAM_ZOOM:1,camSub:()=>({x:0,y:0}),camCenterY:()=>0,aidInside:()=>true,labyrinthWalls:[]};
vm.createContext(env);vm.runInContext(fs.readFileSync('js/rendering/arena-props.js','utf8'),env);
const keys=vm.runInContext('Object.keys(AID_INLAY_PALETTES)',env);
const sheet=createCanvas(780,keys.length*110),s=sheet.getContext('2d');s.fillStyle='#17151d';s.fillRect(0,0,sheet.width,sheet.height);s.imageSmoothingEnabled=false;
keys.forEach((arena,row)=>{s.fillStyle='#dfc798';s.font='16px sans-serif';s.fillText(arena,12,row*110+24);
 for(let v=0;v<3;v++){const img=env.aidArtInlay(arena,v);assert.strictEqual(img,env.aidArtInlay(arena,v));const pixels=img.getContext('2d').getImageData(0,0,64,40).data;let count=0;for(let i=3;i<pixels.length;i+=4){assert(pixels[i]===0||pixels[i]===255);if(pixels[i])count++;}assert(count>60);checks++;s.drawImage(img,145+v*210,row*110+10,128,80);}
 env.currentArena=arena;env.aidDrawInlays();});
// Dynamic geometry must reject the entire decoration; cache budget remains bounded.
let draws=0;env.ctx={save(){},restore(){},drawImage(){draws++;}};env.aidInside=()=>false;env.aidDrawInlays();assert.equal(draws,0);env.aidInside=()=>true;env.VW=10000;env.VH=10000;env.aidDrawInlays();assert(draws<=64);
fs.mkdirSync('docs/art-enrichment',{recursive:true});
fs.writeFileSync('docs/art-enrichment/inlays.png',sheet.toBuffer('image/png'));
console.log(JSON.stringify({arenas:keys.length,artVariants:checks,maxVisible:draws,alpha:'binary',geometryRejection:'pass'}));
