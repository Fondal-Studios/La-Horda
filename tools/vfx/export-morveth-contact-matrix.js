'use strict';
const fs=require('node:fs'),H=require('../lib/serve');
const OUT=process.env.OUT||'art-source/entregas/morveth-kit-20261022/correccion-02';
(async()=>{const site=await H.startSite(),browser=await H.launch();try{
 const page=await browser.newPage();await H.goto(page,site.url);await H.waitFor(page,()=>typeof morvethFxStrip==='function');
 const r=await page.evaluate(()=>{const rows=[],cv=document.createElement('canvas');cv.width=864;cv.height=1008;const g=cv.getContext('2d');let row=0;const times=[];
 for(const arena of ['bosque','hielo','infernal','laberinto','acuatica','minas'])for(const variant of ['','~h','~p']){currentArena=arena;sfaCache.clear();const t=performance.now(),b=sfaBake('aura','morveth_symbiosis'+variant,0);times.push(performance.now()-t);g.drawImage(b.cv,0,row*56);rows.push({row:row++,arena,variant});}
 const hot=[];for(let i=0;i<500;i++){const t=performance.now();sfaBake('aura','morveth_symbiosis~p',0);hot.push(performance.now()-t);}return{png:cv.toDataURL(),rows,cell:[48,56],frames:18,coldMs:times,hotMaxMs:Math.max(...hot),cacheEntries:sfaCache.size};});
 fs.writeFileSync(OUT+'/atlases/mycelium-arena-variants.png',Buffer.from(r.png.split(',')[1],'base64'));delete r.png;fs.writeFileSync(OUT+'/matrix.json',JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify({rows:r.rows.length,hotMaxMs:r.hotMaxMs,cacheEntries:r.cacheEntries,coldMaxMs:Math.max(...r.coldMs)}));
 }finally{await browser.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
