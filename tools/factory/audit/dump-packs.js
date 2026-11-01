'use strict';
/* Vuelca, desde el juego real, el pack de sprites efectivo de cada campeón (atlas, geometría, sets). */
const fs=require('node:fs'),H=require('../../lib/serve');
(async()=>{const site=await H.startSite(),b=await H.launch();try{const p=await b.newPage();
await H.goto(p,site.url+'/');await p.waitForFunction(()=>typeof startRun==='function'&&assetsAllReady(),null,{timeout:120000});await p.waitForTimeout(2000);
const out=await p.evaluate(()=>{const r={};for(const k of Object.keys(CHAMP_PACK)){const P=CHAMP_PACK[k];if(!P||!P.atlas)continue;
 r[k]={src:P.atlas.src.replace(location.origin+'/',''),w:P.atlas.naturalWidth,h:P.atlas.naturalHeight,fw:P.fw,fh:P.fh,cols:P.cols,ready:!!P.ready,idle:(P.sets&&(P.sets.idle_down||P.sets.walk_down)||[]).slice(0,4),walk:(P.sets&&P.sets.walk_down||[]).slice(),keys:Object.keys(P.sets||{}).length,sets:P.sets||{}};}return r;});
fs.writeFileSync(process.argv[2],JSON.stringify(out,null,1));console.log(Object.keys(out).length,'packs');}finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
