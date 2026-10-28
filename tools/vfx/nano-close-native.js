'use strict';
// Export actual cached native frames, with binary-alpha and render-RNG measurements.
const fs=require('fs'),crypto=require('crypto'),H=require('../lib/serve'),OUT=process.env.OUT;
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const site=await H.startSite(),b=await H.launch(),errors=[];try{
 const p=await b.newPage();p.on('pageerror',e=>errors.push(e.message));
 if(process.env.BASELINE)await p.route('**/js/champions/vfx-b/nano_gm.js*',r=>r.fulfill({path:process.env.BASELINE,contentType:'application/javascript'}));
 await p.addInitScript(()=>{requestAnimationFrame=()=>0;});await p.goto(site.url+'/?lazy=0');await p.waitForFunction(()=>assetsAllReady(),null,{polling:100});
 const rows=await p.evaluate(()=>{const rows=[];for(const arena of ['bosque','hielo','infernal','laberinto','acuatica','minas']){currentArena=arena;for(const name of ['ng_law','ng_burst_d','ng_verdict','ng_decree']){
 const old=Math.random;let rng=0;Math.random=()=>{rng++;return old();};let frames;try{frames=name==='ng_decree'?kvbBeamFrames(name):kvbDecalFrames(name,64);}finally{Math.random=old;}
 const data=frames.map(c=>{const a=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let partial=0,ink=0;for(let i=3;i<a.length;i+=4){if(a[i]>0)ink++;if(a[i]>0&&a[i]<255)partial++;}return{width:c.width,height:c.height,partial,ink,png:c.toDataURL()};});rows.push({arena,name,rng,frames:data});}}return rows;});
 for(const r of rows)for(const [i,f]of r.frames.entries()){const buf=Buffer.from(f.png.split(',')[1],'base64');f.sha256=crypto.createHash('sha256').update(buf).digest('hex');if(r.arena==='bosque')fs.writeFileSync(OUT+'/'+r.name+'-'+String(i).padStart(2,'0')+'.png',buf);delete f.png;}
 fs.writeFileSync(OUT+'/NATIVE.json',JSON.stringify({rows,errors},null,2));console.log(JSON.stringify({groups:rows.length,frames:rows.reduce((n,r)=>n+r.frames.length,0),partial:rows.flatMap(r=>r.frames).reduce((n,f)=>n+f.partial,0),rng:rows.reduce((n,r)=>n+r.rng,0),errors}));if(errors.length||rows.some(r=>r.rng||r.frames.some(f=>f.partial)))process.exitCode=1;
 }finally{await b.close();await site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
