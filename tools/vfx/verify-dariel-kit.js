'use strict';
// Exporta las recetas realmente cargadas en el motor; no certifica Art Gate integral.
const fs=require('node:fs'),path=require('node:path'),H=require('../lib/serve');
const OUT=path.resolve(process.env.OUT||'art-source/entregas/dariel-kit-20261023/primera-pasada-01');
(async()=>{const site=await H.startSite(),b=await H.launch();try{const p=await b.newPage();await H.goto(p,site.url);await p.waitForFunction(()=>typeof darielFxStrip==='function'&&assetsAllReady());
const result=await p.evaluate(()=>{
 const out=[],check=(name,ok,detail)=>out.push({name,ok:!!ok,detail});currentArena='';const sources=[];
 for(const [theme,art,size,arc] of [['dariel_discord','cone',96,.85],['dariel_march','nova',128,0],['dariel_march','aura',0,0],['dariel_refrain','nova',128,0],['dariel_refrain','aura',0,0]]){
  const baked=sfaBake(art,theme,size,arc),d=baked.cv.getContext('2d').getImageData(0,0,baked.cv.width,baked.cv.height).data;
  const cells=[];let partial=0,edge=0;for(let f=0;f<baked.n;f++){let count=0;for(let y=0;y<baked.h;y++)for(let x=0;x<baked.w;x++){const a=d[(y*baked.cv.width+f*baked.w+x)*4+3];if(a){count++;if(x===0||y===0||x===baked.w-1||y===baked.h-1)edge++;if(a!==255)partial++;}}cells.push(count);}
  check(theme+art+' binary alpha',partial===0,partial);check(theme+art+' clear border',edge===0,edge);check(theme+art+' active cells',cells.slice(0,-1).every(n=>n>0),cells);check(theme+art+' final phase',(art==='aura'||art==='zone')?cells.at(-1)>0:cells.at(-1)===0,cells.at(-1));
  check(theme+art+' cache reuse',sfaBake(art,theme,size,arc)===baked);
  sources.push({theme,art,size,arc,w:baked.w,h:baked.h,n:baked.n,cells,png:baked.cv.toDataURL()});
 }
 // La extensión optativa devuelve exactamente la receta previa cuando no hay callback.
 for(const [art,size,arc] of [['nova',64,0],['cone',64,.85],['aura',0,0]]){
  const T=sfaTheme('music'),a=sfaBake(art,'music',size,arc).cv.toDataURL(),S=art==='nova'?sfaBakeNova(T,size):art==='cone'?sfaBakeCone(T,size,arc):sfaBakeAura(T);
  check('music fallback '+art,a===S.toCanvas().toDataURL());
 }
 check('original basic theme',SFA_BIND.dariel.themes[0]==='music');
 return {checks:out,sources};});
 fs.mkdirSync(OUT,{recursive:true});for(const s of result.sources){fs.writeFileSync(path.join(OUT,s.theme+'-'+s.art+'.png'),Buffer.from(s.png.split(',')[1],'base64'));delete s.png;}
 fs.writeFileSync(path.join(OUT,'VERIFICATION.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({checks:result.checks.length,failed:result.checks.filter(x=>!x.ok)}));if(result.checks.some(x=>!x.ok))process.exitCode=1;
}finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
