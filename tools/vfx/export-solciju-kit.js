'use strict';
// Export the exact runtime recipes; these PNGs are evidence, not another asset loader.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),H=require('../lib/serve');
const OUT=path.resolve(process.env.OUT||'art-source/entregas/habilidades-recientes-20261022');
(async()=>{
 const site=await H.startSite(),browser=await H.launch();
 try{
  const page=await browser.newPage({viewport:{width:844,height:390}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await H.goto(page,site.url);
  await H.waitFor(page,()=>typeof KVB_FX!=='undefined'&&typeof startRun==='function'&&assetsAllReady());
  const result=await page.evaluate(()=>{
   selectedClass='solciju';currentArena='bosque';lobbyAllies=[];startRun(1);state='playing';enemies=[];
   const strips={},checks=[];
   for(const [name,radius] of [['so_splash',85],['so_fuse',100],['so_pool_idle',160],['so_toast',38]]){
    const frames=kvbDecalFrames(name,kvbS(radius)),c=document.createElement('canvas');c.width=frames[0].width*frames.length;c.height=frames[0].height;
    const g=c.getContext('2d');frames.forEach((f,i)=>g.drawImage(f,i*f.width,0));
    const d=g.getImageData(0,0,c.width,c.height).data;let soft=0;for(let i=3;i<d.length;i+=4)if(d[i]&&d[i]!==255)soft++;
    strips[name]={png:c.toDataURL(),frames:frames.length,cell:frames[0].width,radius,soft};
   }
   netHookEvents();netMatch={role:'host',recording:true};_netEvents=[];
   for(const id of ['solciju.wine','solciju.cask','solciju.toast','solciju.reserve'])kvbFx(id,player.x+60,player.y,85,0,0,0);
   const ev=JSON.parse(JSON.stringify(_netEvents)).filter(e=>e[0]==='kvbFx');netMatch=null;_netEvents=[];
   kvbReset();for(const e of ev)window[e[0]](...e[1]);
   checks.push({name:'four thematic recipes recorded and replayed',pass:ev.length===4&&['so_splash','so_toast'].every(n=>KVB.pool.some(e=>e.name===n)),events:ev.map(e=>e[1][0])});
   for(const reduced of [false,true]){
    JUICE.reduceFx=reduced;kvbReset();KVB.err=null;for(let i=0;i<100;i++)kvbFx('solciju.wine',player.x,player.y,85,0,0,0);
    kvbDrawLayer('g');kvbDrawLayer('t');checks.push({name:'pool and renderer reduceFx='+reduced,pass:KVB.pool.length<=(reduced?64:128)&&!KVB.err,size:KVB.pool.length});
   }
   JUICE.reduceFx=false;state='menu';return {strips,checks};
  });
  fs.mkdirSync(path.join(OUT,'atlases'),{recursive:true});
  for(const [name,s] of Object.entries(result.strips)){fs.writeFileSync(path.join(OUT,'atlases',name+'.png'),Buffer.from(s.png.split(',')[1],'base64'));delete s.png;assert.equal(s.soft,0);}
  const report={...result,errors};fs.writeFileSync(path.join(OUT,'runtime-export.json'),JSON.stringify(report,null,2)+'\n');
  assert.equal(errors.length,0);assert(result.checks.every(c=>c.pass));console.log(JSON.stringify(report));
 }finally{await browser.close();await site.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
