'use strict';
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
const OUT=path.resolve(process.env.OUT||'art-source/entregas/ilkan-kit-20261024/primera-pasada-01');
(async()=>{fs.mkdirSync(OUT,{recursive:true});const site=await H.startSite(),browser=await H.launch();const results=[],exports=[];try{
 const p=await browser.newPage();await H.goto(p,site.url);await p.waitForFunction(()=>typeof ilkanDrawBuffSigns==='function');
 const r=await p.evaluate(()=>{
  state='menu';const rows=[],images=[];
  for(const kind of ['dune','caravan']){
   const a=ilkanBuffSignAtlas(kind),g=a.getContext('2d'),d=g.getImageData(0,0,a.width,a.height).data;
   let partial=0,border=0;for(let y=0;y<72;y++)for(let x=0;x<768;x++){const al=d[(y*768+x)*4+3];if(al!==0&&al!==255)partial++;if(al&&(x%64===0||x%64===63||y===0||y===71))border++;}
   rows.push({name:kind+' dimensions/alpha/margins/cache',ok:a.width===768&&a.height===72&&!partial&&!border&&ilkanBuffSignAtlas(kind)===a,partial,border});
   images.push({kind,png:a.toDataURL()});
  }
  rows.push({name:'invalid family preserves cache',ok:ilkanBuffSignAtlas('invalid')===null&&Object.keys(ILKAN_BUFF_SIGNS).length===2});
  const originalView=window.inView,originalDraw=ctx.drawImage,originalRnd=Math.random;let calls=[],rnd=0;
  window.inView=()=>true;Math.random=()=>{rnd++;return .5;};ctx.drawImage=function(...args){calls.push({kind:Object.keys(ILKAN_BUFF_SIGNS).find(k=>ILKAN_BUFF_SIGNS[k]===args[0]),args:args.slice(1),alpha:this.globalAlpha});return originalDraw.apply(this,args);};
  const cases=[['none',{},[]],['dune',{ilkanInstinctTimer:3500},['dune']],['advance',{ilkanAdvanceTimer:4000},['caravan']],['both',{ilkanInstinctTimer:3500,ilkanAdvanceTimer:4000},['dune','caravan']],['ally',{classKey:'tanque',advAllyTimer:4000},['caravan']],['alien instinct',{classKey:'tanque',ilkanInstinctTimer:3500},[]],['alien advance',{classKey:'tanque',ilkanAdvanceTimer:4000},[]],['unrelated speed',{buffSpeedMult:2},[]],['expired',{ilkanInstinctTimer:0,ilkanAdvanceTimer:0,advAllyTimer:0},[]],['dead',{alive:false,ilkanInstinctTimer:3500,advAllyTimer:4000},[]],['colossus',{ilkanColossus:true,ilkanInstinctTimer:3500,ilkanAdvanceTimer:4000},[]],['fade',{ilkanInstinctTimer:100},['dune']],['moved',{x:200.7,y:180.2,ilkanInstinctTimer:500},['dune']],['culled',{ilkanInstinctTimer:500},[]]];
  for(const [name,mods,want]of cases){const h={alive:true,classKey:'ilkan',x:100,y:100,...mods};const before=JSON.stringify(h);calls=[];window.inView=()=>name!=='culled';ctx.globalAlpha=.75;const transform=ctx.getTransform().toString();ilkanDrawBuffSigns(h);rows.push({name,ok:JSON.stringify(calls.map(c=>c.kind))===JSON.stringify(want)&&before===JSON.stringify(h)&&ctx.globalAlpha===.75&&ctx.getTransform().toString()===transform,calls});}
  rows.push({name:'draw has zero RNG calls',ok:rnd===0,calls:rnd});
  ctx.drawImage=originalDraw;Math.random=originalRnd;window.inView=originalView;
  return {rows,images};
 });
 for(const im of r.images){fs.writeFileSync(path.join(OUT,im.kind+'-atlas.png'),Buffer.from(im.png.split(',')[1],'base64'));exports.push(im.kind);}
 results.push(...r.rows);fs.writeFileSync(path.join(OUT,'checks.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({checks:results.length,fail:results.filter(x=>!x.ok),exports}));if(results.some(x=>!x.ok))process.exitCode=1;
}finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
